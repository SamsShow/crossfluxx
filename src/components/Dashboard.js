import React, { useState } from 'react';
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
    getMockMarketData,
    forceRebalanceEvaluation,
    isRebalancing,
    loading,
    currentDecision
  } = useCrossfluxx();

  const [mockData] = useState(getMockMarketData());

  // Mock portfolio data
  const [portfolioData] = useState({
    totalValue: 125000,
    allocation: {
      ethereum: 45000,
      arbitrum: 35000,
      polygon: 45000
    },
    performance: {
      daily: 2.4,
      weekly: 8.7,
      monthly: 15.3
    }
  });

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

  // Chart data for APR comparison
  const aprChartData = {
    labels: ['Ethereum', 'Arbitrum', 'Polygon'],
    datasets: [
      {
        label: 'Aave APR',
        data: [6.5, 7.1, 8.9],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Uniswap APR',
        data: [9.4, 8.7, 10.3],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.1,
      },
    ],
  };

  // Portfolio allocation chart
  const allocationChartData = {
    labels: ['Ethereum', 'Arbitrum', 'Polygon'],
    datasets: [
      {
        data: [45000, 35000, 45000],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    maintainAspectRatio: false,
  };

  const StatCard = ({ title, value, change, icon, color = 'blue' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(change)}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const RebalanceButton = () => (
    <button
      onClick={forceRebalanceEvaluation}
      disabled={isRebalancing || loading || !isSystemInitialized}
      className="w-full bg-gradient-to-r from-crossfluxx-600 to-crossfluxx-700 hover:from-crossfluxx-700 hover:to-crossfluxx-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-2"
    >
      {isRebalancing ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Evaluating...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Run Rebalance Analysis</span>
        </>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* System Status Banner */}
      {!isSystemInitialized && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="animate-spin h-5 w-5 text-yellow-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Initializing Agent System
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Starting StrategyAgent, SignalAgent, and VotingCoordinator...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Decision Display */}
      {currentDecision && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Latest Rebalance Decision
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Action</p>
              <p className="font-semibold text-blue-900 dark:text-blue-100 uppercase">
                {currentDecision.action}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Confidence</p>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                {(currentDecision.confidence * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Consensus</p>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                {(currentDecision.consensus * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Portfolio Value"
          value={formatCurrency(portfolioData.totalValue)}
          change={portfolioData.performance.daily}
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
          color="blue"
        />
        
        <StatCard
          title="Best Current APR"
          value="10.3%"
          change={null}
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="green"
        />
        
        <StatCard
          title="Active Strategies"
          value="3"
          change={null}
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          color="purple"
        />
        
        <StatCard
          title="Success Rate"
          value="87.5%"
          change={null}
          icon={
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* APR Comparison Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cross-Chain APR Comparison
          </h3>
          <div className="h-64">
            <Line data={aprChartData} options={chartOptions} />
          </div>
        </div>

        {/* Portfolio Allocation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Portfolio Allocation
          </h3>
          <div className="h-64">
            <Doughnut 
              data={allocationChartData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom',
                  },
                },
              }} 
            />
          </div>
        </div>
      </div>

      {/* Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rebalance Control */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            AI-Powered Rebalancing
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Let our AI agents analyze market conditions and recommend optimal rebalancing strategies across Ethereum, Arbitrum, and Polygon.
          </p>
          <RebalanceButton />
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Agent System</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isSystemInitialized ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm font-medium">{isSystemInitialized ? 'Active' : 'Starting'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Strategy Agent</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Running</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Signal Agent</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Monitoring</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Voting Coordinator</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                System initialized successfully
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                All agents are running and monitoring markets
              </p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              2 min ago
            </span>
          </div>
          
          <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Market data updated
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Latest APR and TVL data collected from all chains
              </p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              5 min ago
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 