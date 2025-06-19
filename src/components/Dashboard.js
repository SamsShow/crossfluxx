import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCrossfluxx } from '../context/CrossfluxxContext.js';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Dashboard() {
  const {
    isSystemInitialized,
    isWalletConnected,
    account,
    portfolioValue,
    totalEarnings,
    currentAPR,
    userDeposits,
    marketData,
    executeRebalance,
    isRebalancing,
    currentRebalance,
    loading,
    deposit
  } = useCrossfluxx();

  const [depositAmount, setDepositAmount] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);

  // Format portfolio data for display
  const portfolioData = {
    totalValue: parseFloat(portfolioValue || '0'),
    totalEarnings: parseFloat(totalEarnings || '0'),
    currentAPR: currentAPR || 0,
    allocation: userDeposits.reduce((acc, deposit) => {
      acc[deposit.chain] = (acc[deposit.chain] || 0) + parseFloat(deposit.currentValue);
      return acc;
    }, { ethereum: 0, arbitrum: 0, polygon: 0 })
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Real chart data with green theme
  const aprChartData = {
    labels: ['Ethereum', 'Arbitrum', 'Polygon'],
    datasets: [
      {
        label: 'Aave APR',
        data: [
          (marketData.chains?.ethereum?.protocols?.aave?.apr * 100) || 0,
          (marketData.chains?.arbitrum?.protocols?.aave?.apr * 100) || 0,
          (marketData.chains?.polygon?.protocols?.aave?.apr * 100) || 0
        ],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: 'rgb(34, 197, 94)',
        pointHoverBackgroundColor: 'rgb(34, 197, 94)',
        pointHoverBorderColor: 'rgb(22, 163, 74)',
      },
      {
        label: 'Uniswap APR',
        data: [
          (marketData.chains?.ethereum?.protocols?.uniswap?.apr * 100) || 0,
          (marketData.chains?.arbitrum?.protocols?.uniswap?.apr * 100) || 0,
          (marketData.chains?.polygon?.protocols?.uniswap?.apr * 100) || 0
        ],
        borderColor: 'rgb(50, 205, 106)',
        backgroundColor: 'rgba(50, 205, 106, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(50, 205, 106)',
        pointBorderColor: 'rgb(50, 205, 106)',
        pointHoverBackgroundColor: 'rgb(50, 205, 106)',
        pointHoverBorderColor: 'rgb(34, 197, 94)',
      },
    ],
  };

  // Real portfolio allocation chart
  const allocationChartData = {
    labels: ['Ethereum', 'Arbitrum', 'Polygon'],
    datasets: [
      {
        data: [
          portfolioData.allocation.ethereum,
          portfolioData.allocation.arbitrum,
          portfolioData.allocation.polygon
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(50, 205, 106, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(50, 205, 106)',
          'rgb(16, 185, 129)',
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(34, 197, 94, 0.9)',
          'rgba(50, 205, 106, 0.9)',
          'rgba(16, 185, 129, 0.9)',
        ],
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

  const StatCard = ({ title, value, change, icon, color = 'green' }) => (
    <motion.div 
      variants={itemVariants}
      whileHover={{ 
        scale: 1.02, 
        y: -5,
        boxShadow: "0 20px 40px rgba(34, 197, 94, 0.1)"
      }}
      className="bg-gray-800/50 backdrop-blur-sm border border-green-500/20 hover:border-green-400/40 rounded-xl p-6 transition-all duration-300 relative overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-green-500/5"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <motion.p 
            className="text-2xl font-bold text-white"
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
            {value}
          </motion.p>
          {change && (
            <motion.p 
              className={`text-sm mt-1 font-semibold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {formatPercent(change)}
            </motion.p>
          )}
        </div>
        <motion.div 
          className="p-3 rounded-full bg-green-500/20 border border-green-400/30"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  );

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    
    try {
      await deposit(depositAmount, ['ethereum', 'arbitrum', 'polygon'], [0.05, 0.1, 0.15]);
      setDepositAmount('');
      setShowDepositModal(false);
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const DepositModal = () => (
    <AnimatePresence>
      {showDepositModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDepositModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 rounded-xl border border-green-500/20 p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">💰 Deposit ETH</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Amount (ETH)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="text-sm text-gray-400">
                <p>• Funds will be automatically allocated across Ethereum, Arbitrum, and Polygon</p>
                <p>• AI agents will optimize for maximum yield</p>
                <p>• Rebalancing triggers: 5%, 10%, 15% APR differentials</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0 || loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Processing...' : 'Deposit'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const RebalanceButton = () => (
    <motion.button
      onClick={executeRebalance}
      disabled={isRebalancing || loading || !isSystemInitialized || !isWalletConnected}
      whileHover={{ 
        scale: !isRebalancing && !loading && isSystemInitialized && isWalletConnected ? 1.02 : 1,
        boxShadow: !isRebalancing && !loading && isSystemInitialized && isWalletConnected ? "0 20px 40px rgba(34, 197, 94, 0.3)" : "none"
      }}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-3 relative overflow-hidden border border-green-500/30"
    >
      <motion.div
        className="absolute inset-0 bg-green-400"
        initial={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 0.3 }}
      />
      {isRebalancing ? (
        <>
          <motion.svg 
            className="w-5 h-5" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </motion.svg>
          <span className="relative z-10">Analyzing Markets...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="relative z-10">Run Rebalance Analysis</span>
        </>
      )}
    </motion.button>
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
            Protocol Dashboard
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
            Monitor your AI-powered cross-chain yield optimization in real-time
          </motion.p>
        </motion.div>

        {/* System Status Banner */}
        <AnimatePresence>
          {!isSystemInitialized && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-yellow-500/10 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-6 relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-yellow-400/5"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="flex items-center relative z-10">
                <motion.svg 
                  className="w-6 h-6 text-yellow-400 mr-4" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </motion.svg>
                <div>
                  <h3 className="text-lg font-bold text-yellow-300 mb-1">
                    🤖 Initializing AI Agent System
                  </h3>
                  <p className="text-yellow-200">
                    Starting StrategyAgent, SignalAgent, and VotingCoordinator...
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wallet Connection Banner */}
        <AnimatePresence>
          {!isWalletConnected && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-blue-500/10 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6 relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-blue-400/5"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-blue-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-bold text-blue-300 mb-1">
                      💼 Connect Your Wallet
                    </h3>
                    <p className="text-blue-200">
                      Connect your wallet to start earning cross-chain yield
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Rebalance Display */}
        <AnimatePresence>
          {currentRebalance && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-blue-500/10 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6 relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-blue-400/5"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <h3 className="text-xl font-bold text-blue-300 mb-4 relative z-10">
                🧠 Active Rebalancing Operation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                <div className="bg-blue-500/20 rounded-lg p-4">
                  <p className="text-sm text-blue-300 mb-1">Route</p>
                  <p className="font-bold text-blue-100 text-lg">
                    {currentRebalance.fromChain} → {currentRebalance.toChain}
                  </p>
                </div>
                <div className="bg-blue-500/20 rounded-lg p-4">
                  <p className="text-sm text-blue-300 mb-1">Amount</p>
                  <p className="font-bold text-blue-100 text-lg">
                    {currentRebalance.amount} ETH
                  </p>
                </div>
                <div className="bg-blue-500/20 rounded-lg p-4">
                  <p className="text-sm text-blue-300 mb-1">Confidence</p>
                  <p className="font-bold text-blue-100 text-lg">
                    {currentRebalance.confidence}%
                  </p>
                </div>
              </div>
              {currentRebalance.steps && (
                <div className="mt-4 space-y-2">
                  {currentRebalance.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        step.status === 'completed' ? 'bg-green-500' : 
                        step.status === 'pending' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-blue-200">{step.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        {isWalletConnected && (
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            <motion.button
              onClick={() => setShowDepositModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/25 flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Deposit ETH</span>
            </motion.button>

            <motion.button
              onClick={() => executeRebalance()}
              disabled={isRebalancing || loading || !isSystemInitialized}
              whileHover={{ scale: isRebalancing || loading || !isSystemInitialized ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isRebalancing ? 'Rebalancing...' : 'Rebalance Now'}</span>
            </motion.button>
          </motion.div>
        )}

        {/* Portfolio Stats */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <StatCard
            title="Portfolio Value"
            value={isWalletConnected ? `${portfolioData.totalValue.toFixed(3)} ETH` : 'Connect Wallet'}
            change={portfolioData.totalEarnings}
            icon={
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />
          <StatCard
            title="Total Earnings"
            value={isWalletConnected ? `+${portfolioData.totalEarnings.toFixed(4)} ETH` : '---'}
            change={portfolioData.totalEarnings * 100}
            icon={
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <StatCard
            title="Current APR"
            value={isWalletConnected ? `${portfolioData.currentAPR.toFixed(2)}%` : '---'}
            change={portfolioData.currentAPR}
            icon={
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <StatCard
            title="Active Deposits"
            value={isWalletConnected ? userDeposits.length : '---'}
            icon={
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            }
          />
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* APR Comparison Chart */}
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
            <h3 className="text-xl font-bold text-white mb-6 relative z-10">📊 Cross-Chain APR Comparison</h3>
            <div className="h-64 relative z-10">
              <Line data={aprChartData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Portfolio Allocation */}
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
            <h3 className="text-xl font-bold text-white mb-6 relative z-10">🥧 Portfolio Allocation</h3>
            <div className="h-64 relative z-10">
              <Doughnut data={allocationChartData} options={chartOptions} />
            </div>
          </motion.div>
        </div>

        {/* Rebalance Analysis Section */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.005 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-green-500/20 hover:border-green-400/40 rounded-xl p-8 transition-all duration-300 relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-green-500/5"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-4">⚡ AI Rebalance Engine</h3>
            <p className="text-gray-300 mb-6">
              Trigger a comprehensive analysis of current market conditions and potential rebalancing opportunities across all connected chains.
            </p>
            <RebalanceButton />
          </div>
        </motion.div>
      </motion.div>

      {/* Deposit Modal */}
      <DepositModal />
    </div>
  );
}

export default Dashboard; 