import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function RebalanceHistory() {
  // Mock rebalance history data
  const [historyData] = useState([
    {
      id: 1,
      timestamp: '2024-01-15T10:30:00Z',
      action: 'REBALANCE',
      fromChain: 'ethereum',
      toChain: 'arbitrum',
      amount: 50000,
      asset: 'USDC',
      oldApr: 6.5,
      newApr: 8.2,
      expectedGain: 850,
      actualGain: 920,
      gasUsed: 45.2,
      status: 'completed',
      confidence: 87,
      agentDecision: 'High yield opportunity on Arbitrum with 26% APR improvement'
    },
    {
      id: 2,
      timestamp: '2024-01-12T14:15:00Z',
      action: 'REBALANCE',
      fromChain: 'polygon',
      toChain: 'ethereum',
      amount: 75000,
      asset: 'DAI',
      oldApr: 5.8,
      newApr: 7.1,
      expectedGain: 975,
      actualGain: 1050,
      gasUsed: 62.8,
      status: 'completed',
      confidence: 92,
      agentDecision: 'Market volatility detected, moving to more stable ETH pools'
    },
    {
      id: 3,
      timestamp: '2024-01-10T09:45:00Z',
      action: 'OPTIMIZE',
      fromChain: 'arbitrum',
      toChain: 'polygon',
      amount: 25000,
      asset: 'USDT',
      oldApr: 7.2,
      newApr: 9.8,
      expectedGain: 650,
      actualGain: 680,
      gasUsed: 28.5,
      status: 'completed',
      confidence: 78,
      agentDecision: 'Polygon offering superior returns for stablecoin strategies'
    },
    {
      id: 4,
      timestamp: '2024-01-08T16:20:00Z',
      action: 'REBALANCE',
      fromChain: 'ethereum',
      toChain: 'polygon',
      amount: 100000,
      asset: 'USDC',
      oldApr: 6.8,
      newApr: 8.9,
      expectedGain: 2100,
      actualGain: 2150,
      gasUsed: 95.3,
      status: 'completed',
      confidence: 94,
      agentDecision: 'Major liquidity shift detected, capitalizing on Polygon incentives'
    },
    {
      id: 5,
      timestamp: '2024-01-05T11:30:00Z',
      action: 'EMERGENCY_EXIT',
      fromChain: 'arbitrum',
      toChain: 'ethereum',
      amount: 35000,
      asset: 'DAI',
      oldApr: 8.5,
      newApr: 6.2,
      expectedGain: -805,
      actualGain: -720,
      gasUsed: 78.9,
      status: 'completed',
      confidence: 96,
      agentDecision: 'Smart contract vulnerability detected, emergency exit executed'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [viewMode, setViewMode] = useState('table'); // table or timeline

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChainIcon = (chain) => {
    switch (chain) {
      case 'ethereum': return '⟐';
      case 'arbitrum': return '🔵';
      case 'polygon': return '🔷';
      default: return '🔗';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'REBALANCE': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'OPTIMIZE': return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'EMERGENCY_EXIT': return 'bg-red-500/20 text-red-300 border-red-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const filteredData = historyData.filter(item => {
    if (filter === 'all') return true;
    return item.action.toLowerCase() === filter.toLowerCase();
  });

  const StatCard = ({ title, value, subtitle, icon, trend }) => (
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
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
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

  const HistoryTableRow = ({ item, index }) => (
    <motion.tr
      variants={itemVariants}
      whileHover={{ backgroundColor: "rgba(34, 197, 94, 0.05)" }}
      className="border-b border-gray-700/50 hover:border-green-500/30 transition-all duration-300"
    >
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getActionColor(item.action)}`}>
            {item.action}
          </div>
          <span className="text-sm text-gray-400">{formatDateTime(item.timestamp)}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getChainIcon(item.fromChain)}</span>
            <span className="text-sm text-gray-300 capitalize">{item.fromChain}</span>
          </div>
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getChainIcon(item.toChain)}</span>
            <span className="text-sm text-gray-300 capitalize">{item.toChain}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-center">
          <p className="text-lg font-bold text-white">{formatCurrency(item.amount)}</p>
          <p className="text-sm text-gray-400">{item.asset}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-center">
          <p className="text-sm text-gray-400">{item.oldApr}% → {item.newApr}%</p>
          <p className={`text-lg font-bold ${item.newApr > item.oldApr ? 'text-green-400' : 'text-red-400'}`}>
            {item.newApr > item.oldApr ? '+' : ''}{((item.newApr - item.oldApr) / item.oldApr * 100).toFixed(1)}%
          </p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-center">
          <p className={`text-lg font-bold ${item.actualGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {item.actualGain >= 0 ? '+' : ''}{formatCurrency(item.actualGain)}
          </p>
          <p className="text-sm text-gray-400">Gas: ${item.gasUsed}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className={`text-sm font-medium capitalize ${getStatusColor(item.status)}`}>
              {item.status}
            </span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <span className="text-xs text-gray-400">Confidence:</span>
            <span className="text-xs font-medium text-green-400">{item.confidence}%</span>
          </div>
        </div>
      </td>
    </motion.tr>
  );

  const TimelineItem = ({ item, index, isLast }) => (
    <motion.div
      variants={itemVariants}
      className="relative"
    >
      {!isLast && (
        <div className="absolute left-6 top-16 w-0.5 h-full bg-green-500/30"></div>
      )}
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 border border-green-400/30 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-green-500/20 hover:border-green-400/40 rounded-xl p-6 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getActionColor(item.action)}`}>
                {item.action}
              </div>
              <span className="text-sm text-gray-400">{formatDateTime(item.timestamp)}</span>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${item.actualGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {item.actualGain >= 0 ? '+' : ''}{formatCurrency(item.actualGain)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Route</p>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getChainIcon(item.fromChain)}</span>
                <span className="text-sm text-gray-300 capitalize">{item.fromChain}</span>
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="text-lg">{getChainIcon(item.toChain)}</span>
                <span className="text-sm text-gray-300 capitalize">{item.toChain}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Amount</p>
              <p className="text-lg font-bold text-white">{formatCurrency(item.amount)} {item.asset}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">APR Change</p>
              <p className={`text-lg font-bold ${item.newApr > item.oldApr ? 'text-green-400' : 'text-red-400'}`}>
                {item.oldApr}% → {item.newApr}%
              </p>
            </div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-3">
            <p className="text-sm text-gray-300">
              <span className="text-green-400 font-medium">AI Decision:</span> {item.agentDecision}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  // Calculate summary stats
  const totalRebalances = historyData.length;
  const totalGains = historyData.reduce((sum, item) => sum + item.actualGain, 0);
  const avgConfidence = historyData.reduce((sum, item) => sum + item.confidence, 0) / historyData.length;
  const successRate = (historyData.filter(item => item.status === 'completed').length / historyData.length * 100);

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
            📈 Rebalance History
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
            Track AI-powered rebalancing decisions and their performance impact
          </motion.p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <StatCard
            title="Total Rebalances"
            value={totalRebalances}
            subtitle="Completed operations"
            icon={
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          />
          <StatCard
            title="Total Gains"
            value={formatCurrency(totalGains)}
            subtitle="Net profit generated"
            icon={
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <StatCard
            title="Avg Confidence"
            value={`${avgConfidence.toFixed(1)}%`}
            subtitle="AI decision confidence"
            icon={
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title="Success Rate"
            value={`${successRate.toFixed(1)}%`}
            subtitle="Successful operations"
            icon={
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </motion.div>

        {/* Controls */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-800/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Filter by Action</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:border-green-400 focus:outline-none"
                >
                  <option value="all">All Actions</option>
                  <option value="rebalance">Rebalance</option>
                  <option value="optimize">Optimize</option>
                  <option value="emergency_exit">Emergency Exit</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:border-green-400 focus:outline-none"
                >
                  <option value="timestamp">Date</option>
                  <option value="amount">Amount</option>
                  <option value="actualGain">Profit</option>
                  <option value="confidence">Confidence</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  viewMode === 'table'
                    ? 'bg-green-500 text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  viewMode === 'timeline'
                    ? 'bg-green-500 text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Timeline View
              </button>
            </div>
          </div>
        </motion.div>

        {/* History Display */}
        <AnimatePresence mode="wait">
          {viewMode === 'table' ? (
            <motion.div 
              key="table"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-gray-800/50 backdrop-blur-sm border border-green-500/20 rounded-xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Action & Time</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Route</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Amount</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">APR Change</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Profit/Loss</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <HistoryTableRow key={item.id} item={item} index={index} />
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="timeline"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8"
            >
              {filteredData.map((item, index) => (
                <TimelineItem 
                  key={item.id} 
                  item={item} 
                  index={index} 
                  isLast={index === filteredData.length - 1}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default RebalanceHistory; 