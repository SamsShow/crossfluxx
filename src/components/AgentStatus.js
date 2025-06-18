import React from 'react';
import { useCrossfluxx } from '../context/CrossfluxxContext.js';

function AgentStatus() {
  const { isSystemInitialized } = useCrossfluxx();

  const AgentCard = ({ name, status, description, lastAction, confidence, metrics }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/20 hover:border-green-400/40 rounded-xl p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${status === 'running' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <h3 className="text-lg font-semibold text-white">{name}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          status === 'running' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        }`}>
          {status === 'running' ? 'Active' : 'Starting'}
        </span>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      
      {lastAction && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Last Action</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{lastAction}</p>
        </div>
      )}
      
      {confidence && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Confidence Level</p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${confidence}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{confidence}%</span>
          </div>
        </div>
      )}
      
      {metrics && (
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {Object.entries(metrics).map(([key, value]) => (
            <div key={key}>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{key}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">🤖 AI Agent Status</h1>
          <p className="text-green-400 mt-1">
            Monitor the performance and activity of Crossfluxx AI agents
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AgentCard
          name="Strategy Agent"
          status={isSystemInitialized ? 'running' : 'starting'}
          description="Backtests yield rebalancing strategies on private forks and calculates expected returns with risk assessments."
          lastAction="Completed backtest simulation for 4 market scenarios"
          confidence={85}
          metrics={{
            'Simulations Run': '247',
            'Success Rate': '87.5%',
            'Avg Confidence': '82.3%',
            'Last Update': '2 min ago'
          }}
        />

        <AgentCard
          name="Signal Agent"
          status={isSystemInitialized ? 'running' : 'starting'}
          description="Monitors real-time APR data, market conditions, and cross-chain opportunities from multiple DeFi protocols."
          lastAction="Updated APR data from Aave, Compound, and Uniswap"
          confidence={79}
          metrics={{
            'Data Sources': '12',
            'Update Frequency': '60s',
            'Signal Strength': 'Strong',
            'Last Signal': '1 min ago'
          }}
        />

        <AgentCard
          name="Voting Coordinator"
          status={isSystemInitialized ? 'running' : 'starting'}
          description="Aggregates inputs from other agents via consensus algorithms to make final rebalancing decisions."
          lastAction="Evaluated rebalancing proposal with 75% consensus"
          confidence={92}
          metrics={{
            'Total Decisions': '42',
            'Consensus Rate': '75%',
            'Execution Success': '94.7%',
            'Last Decision': '15 min ago'
          }}
        />
      </div>

      {/* Agent Communication Flow */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Agent Communication Flow</h3>
        
        <div className="relative">
          {/* Flow diagram */}
          <div className="flex items-center justify-between space-x-8">
            {/* Strategy Agent */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Strategy Agent</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Backtest Analysis</p>
            </div>

            {/* Arrow 1 */}
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>

            {/* Signal Agent */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Signal Agent</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Market Monitoring</p>
            </div>

            {/* Arrow 2 */}
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>

            {/* Voting Coordinator */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Voting Coordinator</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Consensus Decision</p>
            </div>
          </div>

          {/* Process steps */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">1. Strategy Analysis</h5>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Runs multiple yield optimization scenarios and calculates risk-adjusted returns
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">2. Market Signals</h5>
              <p className="text-sm text-green-700 dark:text-green-300">
                Aggregates real-time APR data and market conditions from multiple sources
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
              <h5 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">3. Final Decision</h5>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Combines all inputs through consensus voting to make optimal rebalancing decisions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">System Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600 mb-2">99.2%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600 mb-2">247</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Decisions Made</p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600 mb-2">87.5%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600 mb-2">42s</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentStatus; 