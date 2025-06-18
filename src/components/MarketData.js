import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
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
  // Mock market data
  const [marketData, setMarketData] = useState({
    ethereum: {
      name: 'Ethereum',
      symbol: 'ETH',
      price: 2845.67,
      change24h: 3.42,
      protocols: {
        aave: { apr: 6.5, tvl: '2.1B', utilization: 78.5 },
        compound: { apr: 5.8, tvl: '1.8B', utilization: 65.2 },
        uniswap: { apr: 9.4, tvl: '4.2B', utilization: 82.1 }
      }
    },
    arbitrum: {
      name: 'Arbitrum',
      symbol: 'ARB',
      price: 1.23,
      change24h: 7.85,
      protocols: {
        aave: { apr: 7.1, tvl: '850M', utilization: 71.3 },
        compound: { apr: 6.2, tvl: '620M', utilization: 59.8 },
        uniswap: { apr: 8.7, tvl: '1.5B', utilization: 76.4 }
      }
    },
    polygon: {
      name: 'Polygon',
      symbol: 'MATIC',
      price: 0.89,
      change24h: -2.15,
      protocols: {
        aave: { apr: 8.9, tvl: '1.2B', utilization: 84.7 },
        compound: { apr: 7.5, tvl: '950M', utilization: 73.2 },
        uniswap: { apr: 10.3, tvl: '2.1B', utilization: 88.9 }
      }
    }
  });

  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [timeRange, setTimeRange] = useState('24h');

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

  // Mock historical APR data
  const aprHistoryData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Aave APR',
        data: [5.2, 6.1, 7.8, 6.5, 7.2, marketData[selectedChain].protocols.aave.apr],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Compound APR',
        data: [4.8, 5.5, 6.2, 5.8, 6.1, marketData[selectedChain].protocols.compound.apr],
        borderColor: 'rgb(50, 205, 106)',
        backgroundColor: 'rgba(50, 205, 106, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Uniswap APR',
        data: [8.1, 9.2, 10.1, 9.4, 8.9, marketData[selectedChain].protocols.uniswap.apr],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // TVL comparison data
  const tvlData = {
    labels: ['Ethereum', 'Arbitrum', 'Polygon'],
    datasets: [
      {
        label: 'Aave TVL (Billions)',
        data: [2.1, 0.85, 1.2],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      },
      {
        label: 'Compound TVL (Billions)',
        data: [1.8, 0.62, 0.95],
        backgroundColor: 'rgba(50, 205, 106, 0.8)',
        borderColor: 'rgb(50, 205, 106)',
        borderWidth: 2,
      },
      {
        label: 'Uniswap TVL (Billions)',
        data: [4.2, 1.5, 2.1],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
      },
    ],
  };

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (value) => {
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
          {Object.entries(data.protocols).map(([protocol, info]) => (
            <div key={protocol} className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{protocol}</p>
              <p className="text-lg font-bold text-green-400">{info.apr}%</p>
              <p className="text-xs text-gray-500">{info.tvl}</p>
            </div>
          ))}
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
        className="relative z-10 space-y-8"
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
            className="text-xl text-gray-300 max-w-2xl mx-auto"
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
        </motion.div>

        {/* Chain Overview Cards */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {Object.entries(marketData).map(([chain, data]) => (
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
              {marketData[selectedChain].name} Protocol Details
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
            {Object.entries(marketData[selectedChain].protocols).map(([protocol, data]) => (
              <ProtocolDetail key={protocol} protocol={protocol} data={data} />
            ))}
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
            <h3 className="text-xl font-bold text-white mb-6 relative z-10">
              📈 APR Trends - {marketData[selectedChain].name}
            </h3>
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
          <div className="space-y-4">
            {[
              { time: '2 min ago', event: 'Aave ETH APR increased to 6.8%', type: 'increase' },
              { time: '5 min ago', event: 'Polygon USDC utilization reached 89%', type: 'warning' },
              { time: '8 min ago', event: 'Arbitrum TVL crossed $3.2B milestone', type: 'milestone' },
              { time: '12 min ago', event: 'Compound governance proposal #127 passed', type: 'governance' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50"
              >
                <div className={`w-3 h-3 rounded-full ${
                  item.type === 'increase' ? 'bg-green-400' :
                  item.type === 'warning' ? 'bg-yellow-400' :
                  item.type === 'milestone' ? 'bg-blue-400' :
                  'bg-purple-400'
                } animate-pulse`} />
                <div className="flex-1">
                  <p className="text-white">{item.event}</p>
                  <p className="text-sm text-gray-400">{item.time}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default MarketData; 