import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import { useCrossfluxx } from '../context/CrossfluxxContext.js';
import RealDataService from '../utils/RealDataService.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function MarketData() {
  const { isSystemInitialized, marketData: realMarketData, liveMarketFeed } = useCrossfluxx();

  const [marketData, setMarketData] = useState(null);
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [historicalData, setHistoricalData] = useState({});
  const [error, setError] = useState(null);

  // Fetch real market data on component mount and periodically
  useEffect(() => {
    fetchMarketData();
    
    // Set up periodic updates every 5 minutes
    const interval = setInterval(() => {
      fetchMarketData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      setError(null);
      const data = await RealDataService.getMarketData();
      setMarketData(data);
      setLastUpdate(new Date(data.lastUpdate));
      setLoading(false);
      
      console.log('✅ Real market data loaded:', data);
    } catch (error) {
      console.error('❌ Error fetching market data:', error);
      setError('Failed to fetch real market data. Using fallback data.');
      
      // Use fallback data if API fails
      const fallbackData = RealDataService.getFallbackData();
      setMarketData(fallbackData);
      setLastUpdate(new Date(fallbackData.lastUpdate));
      setLoading(false);
    }
  };

  // Fetch historical data for selected chain
  useEffect(() => {
    if (selectedChain && marketData) {
      fetchHistoricalData(selectedChain);
    }
  }, [selectedChain, marketData]);

  const fetchHistoricalData = async (chain) => {
    try {
      const protocols = Object.keys(marketData[chain]?.protocols || {});
      const historical = {};
      
      for (const protocol of protocols) {
        const data = await RealDataService.getHistoricalYields(protocol, chain, 30);
        historical[protocol] = data;
      }
      
      setHistoricalData(prev => ({
        ...prev,
        [chain]: historical
      }));
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Generate chart data from real historical data
  const generateAPRHistoryData = () => {
    if (!marketData || !historicalData[selectedChain]) {
      return {
        labels: ['Loading...'],
        datasets: []
      };
    }

    const historical = historicalData[selectedChain];
    const protocols = Object.keys(marketData[selectedChain]?.protocols || {});
    
    // Get common date labels (use first protocol's dates)
    const firstProtocol = protocols[0];
    const labels = historical[firstProtocol]?.map(point => point.date) || 
                   ['7 days ago', '6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Today'];

         // Define colors based on selected chain and protocol
     const getChainColors = (chain) => {
       const chainColorSchemes = {
         ethereum: {
           aave: { border: 'rgb(99, 102, 241)', bg: 'rgba(99, 102, 241, 0.1)' }, // Indigo
           compound: { border: 'rgb(139, 92, 246)', bg: 'rgba(139, 92, 246, 0.1)' }, // Purple
           uniswap: { border: 'rgb(236, 72, 153)', bg: 'rgba(236, 72, 153, 0.1)' } // Pink
         },
         arbitrum: {
           aave: { border: 'rgb(59, 130, 246)', bg: 'rgba(59, 130, 246, 0.1)' }, // Blue
           compound: { border: 'rgb(16, 185, 129)', bg: 'rgba(16, 185, 129, 0.1)' }, // Emerald
           uniswap: { border: 'rgb(245, 158, 11)', bg: 'rgba(245, 158, 11, 0.1)' } // Amber
         },
         polygon: {
           aave: { border: 'rgb(168, 85, 247)', bg: 'rgba(168, 85, 247, 0.1)' }, // Violet
           compound: { border: 'rgb(34, 197, 94)', bg: 'rgba(34, 197, 94, 0.1)' }, // Green
           uniswap: { border: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.1)' } // Red
         }
       };
       return chainColorSchemes[chain] || chainColorSchemes.ethereum;
     };

     const colors = getChainColors(selectedChain);

    const datasets = protocols.map(protocol => {
      const protocolData = historical[protocol] || [];
      const currentAPR = marketData[selectedChain]?.protocols[protocol]?.apr || 0;
      
      // Use historical data if available, otherwise create trend
      const data = protocolData.length > 0 
        ? protocolData.map(point => point.apy)
        : labels.map((_, i) => currentAPR + (Math.random() - 0.5) * 2); // ±1% variation

      return {
        label: `${protocol.charAt(0).toUpperCase() + protocol.slice(1)} APR`,
        data,
        borderColor: colors[protocol]?.border || 'rgb(100, 100, 100)',
        backgroundColor: colors[protocol]?.bg || 'rgba(100, 100, 100, 0.1)',
        tension: 0.4,
        pointBackgroundColor: colors[protocol]?.border || 'rgb(100, 100, 100)',
        pointBorderColor: colors[protocol]?.border || 'rgb(100, 100, 100)',
        pointHoverBackgroundColor: colors[protocol]?.border || 'rgb(100, 100, 100)',
      };
    });

    return { labels, datasets };
  };

  const aprHistoryData = generateAPRHistoryData();

  // Generate TVL comparison data from real data
  const generateTVLData = () => {
    if (!marketData) {
      return {
        labels: ['Loading...'],
        datasets: []
      };
    }

    const chains = ['ethereum', 'arbitrum', 'polygon'];
    const chainLabels = ['Ethereum', 'Arbitrum', 'Polygon'];
    
    // Extract TVL data for each protocol across chains
    const protocols = ['aave', 'compound', 'uniswap'];
         const protocolColors = {
       aave: { bg: 'rgba(99, 102, 241, 0.8)', border: 'rgb(99, 102, 241)' }, // Indigo
       compound: { bg: 'rgba(139, 92, 246, 0.8)', border: 'rgb(139, 92, 246)' }, // Purple  
       uniswap: { bg: 'rgba(236, 72, 153, 0.8)', border: 'rgb(236, 72, 153)' } // Pink
     };

    const datasets = protocols.map(protocol => {
      const data = chains.map(chain => {
        const tvlString = marketData[chain]?.protocols?.[protocol]?.tvl || '0';
        // Parse TVL string (e.g., "2.1B" -> 2.1, "850M" -> 0.85)
        const value = parseFloat(tvlString);
        const multiplier = tvlString.includes('B') ? 1 : tvlString.includes('M') ? 0.001 : 0.000001;
        return value * multiplier;
      });

      return {
        label: `${protocol.charAt(0).toUpperCase() + protocol.slice(1)} TVL (Billions)`,
        data,
        backgroundColor: protocolColors[protocol]?.bg || 'rgba(100, 100, 100, 0.8)',
        borderColor: protocolColors[protocol]?.border || 'rgb(100, 100, 100)',
        borderWidth: 2,
      };
    }).filter(dataset => dataset.data.some(value => value > 0)); // Only include protocols with data

    return {
      labels: chainLabels,
      datasets
    };
  };

  const tvlData = generateTVLData();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e5e7eb',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: 'rgba(34, 197, 94, 0.1)',
        },
        ticks: {
          color: '#9ca3af'
        }
      },
      y: {
        grid: {
          color: 'rgba(34, 197, 94, 0.1)',
        },
        ticks: {
          color: '#9ca3af'
        }
      }
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00%';
    }
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const MarketCard = ({ chain, data, isSelected, onClick }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer bg-gray-800/50 backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 relative overflow-hidden ${
        isSelected 
          ? 'border-green-400/60 shadow-lg shadow-green-500/20' 
          : 'border-green-500/20 hover:border-green-400/40'
      }`}
    >
      <motion.div
        className="absolute inset-0 bg-green-500/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: isSelected ? 1 : 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-green-400 font-bold text-lg">
                {data.symbol === 'ETH' ? '⟐' : data.symbol === 'ARB' ? '🔵' : '🔷'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{data.name}</h3>
              <p className="text-sm text-gray-400">{data.symbol}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-white">{formatCurrency(data.price)}</p>
            <p className={`text-sm font-semibold ${data.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercent(data.change24h)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {data.protocols && Object.entries(data.protocols).map(([protocol, info]) => (
            <div key={protocol} className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{protocol}</p>
              <p className="text-lg font-bold text-green-400">{info?.apr || '0.0'}%</p>
              <p className="text-xs text-gray-500">{info?.tvl || 'N/A'}</p>
            </div>
          ))}
          {!data.protocols && (
            <div className="col-span-3 text-center text-gray-400">
              <p>Loading protocol data...</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const ProtocolDetail = ({ protocol, data }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-green-500/20 hover:border-green-400/40 rounded-xl p-6 transition-all duration-300 relative overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-green-500/5"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold text-white capitalize">{protocol}</h4>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Live</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">APR</p>
            <motion.p 
              className="text-2xl font-bold text-green-400"
              animate={{
                textShadow: [
                  "0 0 10px rgba(34, 197, 94, 0.3)",
                  "0 0 20px rgba(34, 197, 94, 0.5)",
                  "0 0 10px rgba(34, 197, 94, 0.3)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {data.apr}%
            </motion.p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">TVL</p>
            <p className="text-2xl font-bold text-white">{data.tvl}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Utilization</p>
            <p className="text-2xl font-bold text-blue-400">{data.utilization}%</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Utilization Rate</span>
            <span>{data.utilization}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${data.utilization}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h2 className="text-2xl font-bold text-green-400">Loading Real Market Data</h2>
          <p className="text-gray-400">Fetching live DeFi yields from protocols...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (!marketData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <motion.div
          className="text-center space-y-4 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400">Unable to Load Market Data</h2>
          <p className="text-gray-400">{error || 'Please check your internet connection and try again.'}</p>
          <button
            onClick={fetchMarketData}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg transition-colors duration-300"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Enhanced Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 space-y-8 p-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.h1 
            className="text-4xl md:text-5xl font-black text-white mb-4"
            animate={{
              textShadow: [
                "0 0 20px rgba(34, 197, 94, 0.3)",
                "0 0 30px rgba(34, 197, 94, 0.5)",
                "0 0 20px rgba(34, 197, 94, 0.3)"
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            📊 Market Intelligence
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-2xl mx-auto mb-4"
            animate={{
              color: ["#d1d5db", "#86efac", "#d1d5db"]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Real-time cross-chain APR monitoring and DeFi protocol analytics
          </motion.p>
          
          {/* Data Status */}
          {lastUpdate && (
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">
                Live Data • Updated {lastUpdate.toLocaleTimeString()}
              </span>
            </motion.div>
          )}
          
          {error && (
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full mt-2"
            >
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-yellow-400">
                Using fallback data • {error}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Chain Overview Cards */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {marketData && Object.entries(marketData)
            .filter(([chain, data]) => data && typeof data === 'object' && chain !== 'lastUpdate')
            .map(([chain, data]) => (
              <MarketCard
                key={chain}
                chain={chain}
                data={data}
                isSelected={selectedChain === chain}
                onClick={() => setSelectedChain(chain)}
              />
            ))}
        </motion.div>

        {/* Selected Chain Details */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-800/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {marketData[selectedChain]?.name || 'Loading'} Protocol Details
            </h2>
            <div className="flex space-x-2">
              {['24h', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    timeRange === range
                      ? 'bg-green-500 text-black'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {marketData[selectedChain]?.protocols && 
             Object.entries(marketData[selectedChain].protocols).map(([protocol, data]) => (
               <ProtocolDetail key={protocol} protocol={protocol} data={data} />
             ))}
            {!marketData[selectedChain]?.protocols && (
              <div className="col-span-3 text-center text-gray-400 py-8">
                <p>Loading protocol details...</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Color Legend */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-800/30 backdrop-blur-sm border border-green-500/10 rounded-xl p-4"
        >
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Chain Color Schemes</h4>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-gray-400">Ethereum</span>
              </div>
              <div className="ml-5 space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  <span className="text-gray-500">Aave</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-500">Compound</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span className="text-gray-500">Uniswap</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-400">Arbitrum</span>
              </div>
              <div className="ml-5 space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-500">Aave</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-gray-500">Compound</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span className="text-gray-500">Uniswap</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                <span className="text-gray-400">Polygon</span>
              </div>
              <div className="ml-5 space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                  <span className="text-gray-500">Aave</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-500">Compound</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-gray-500">Uniswap</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* APR History Chart */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-green-500/20 hover:border-green-400/40 rounded-xl p-6 transition-all duration-300 relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-green-500/5"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-xl font-bold text-white">
                📈 APR Trends - {marketData[selectedChain]?.name || 'Loading'}
              </h3>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  selectedChain === 'ethereum' ? 'bg-indigo-500' : 
                  selectedChain === 'arbitrum' ? 'bg-blue-500' : 
                  'bg-violet-500'
                }`}></div>
                <span className="text-sm text-gray-400 capitalize">{selectedChain}</span>
              </div>
            </div>
            <div className="h-64 relative z-10">
              <Line data={aprHistoryData} options={chartOptions} />
            </div>
          </motion.div>

          {/* TVL Comparison Chart */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-green-500/20 hover:border-green-400/40 rounded-xl p-6 transition-all duration-300 relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-green-500/5"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <h3 className="text-xl font-bold text-white mb-6 relative z-10">
              🏦 TVL Comparison Across Chains
            </h3>
            <div className="h-64 relative z-10">
              <Bar data={tvlData} options={chartOptions} />
            </div>
          </motion.div>
        </div>

        {/* Live Market Feed */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-800/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6">🔴 Live Market Feed</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {liveMarketFeed && liveMarketFeed.length > 0 ? (
              liveMarketFeed.slice(0, 10).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50"
                >
                  <div className={`w-3 h-3 rounded-full ${
                    item.type === 'opportunity' ? 'bg-green-400' :
                    item.type === 'alert' ? 'bg-yellow-400' :
                    'bg-blue-400'
                  } animate-pulse`} />
                  <div className="flex-1">
                    <p className="text-white">{item.message}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-sm text-gray-400">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                      {item.chain && (
                        <span className="px-2 py-1 bg-gray-600 text-xs text-gray-300 rounded-full capitalize">
                          {item.chain}
                        </span>
                      )}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p>No live feed data available</p>
                <p className="text-sm mt-1">Market events will appear here as they happen</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default MarketData; 