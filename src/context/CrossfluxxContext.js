import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
// For now, let's create a mock agent system since the files might not be properly set up
// import { createCrossfluxxAgentSystem } from '../agents/index.js';

// Mock agent system for demo
const createCrossfluxxAgentSystem = async (config) => {
  // Simulate initialization time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    getSystemStatus: async () => ({
      isInitialized: true,
      isRunning: true,
      metrics: {
        uptime: Date.now(),
        totalDecisions: 42,
        successfulRebalances: 37,
        errors: 2
      },
      agentStatus: {
        strategy: 'running',
        signal: 'running', 
        coordinator: 'running'
      }
    }),
    getCurrentMarketData: async () => ({
      timestamp: Date.now(),
      data: {
        apr: {
          ethereum: { aave: 0.065, compound: 0.058, uniswap: 0.094 },
          arbitrum: { aave: 0.071, uniswap: 0.087 },
          polygon: { aave: 0.089, uniswap: 0.103 }
        }
      }
    }),
    forceRebalanceEvaluation: async () => ({
      action: 'rebalance',
      confidence: 0.85,
      consensus: 0.75,
      timestamp: Date.now(),
      reasoning: ['High confidence signal detected', 'Risk assessment passed', 'Market conditions favorable'],
      executionPlan: {
        steps: [
          { step: 1, action: 'pre_execution_health_check', description: 'Verify all contracts and balances' },
          { step: 2, action: 'execute_rebalance', description: 'Execute cross-chain rebalancing' },
          { step: 3, action: 'post_execution_verification', description: 'Verify successful execution' }
        ],
        estimatedTime: 390,
        estimatedGasCost: 580000
      }
    })
  };
};

// Initial state
const initialState = {
  // Agent System
  agentSystem: null,
  isSystemInitialized: false,
  systemStatus: {
    isRunning: false,
    metrics: {
      uptime: 0,
      totalDecisions: 0,
      successfulRebalances: 0,
      errors: 0
    },
    agentStatus: {}
  },

  // Market Data
  marketData: {
    apr: null,
    tvl: null,
    prices: null,
    signals: null,
    lastUpdate: null
  },

  // Rebalancing
  currentDecision: null,
  decisionHistory: [],
  isRebalancing: false,

  // UI State
  loading: false,
  error: null,
  notifications: []
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  INIT_SYSTEM_SUCCESS: 'INIT_SYSTEM_SUCCESS',
  INIT_SYSTEM_FAILURE: 'INIT_SYSTEM_FAILURE',
  UPDATE_SYSTEM_STATUS: 'UPDATE_SYSTEM_STATUS',
  UPDATE_MARKET_DATA: 'UPDATE_MARKET_DATA',
  START_REBALANCING: 'START_REBALANCING',
  COMPLETE_REBALANCING: 'COMPLETE_REBALANCING',
  UPDATE_DECISION_HISTORY: 'UPDATE_DECISION_HISTORY',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION'
};

// Reducer
function crossfluxxReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case ActionTypes.INIT_SYSTEM_SUCCESS:
      return {
        ...state,
        agentSystem: action.payload.system,
        isSystemInitialized: true,
        loading: false,
        error: null
      };

    case ActionTypes.INIT_SYSTEM_FAILURE:
      return {
        ...state,
        agentSystem: null,
        isSystemInitialized: false,
        loading: false,
        error: action.payload
      };

    case ActionTypes.UPDATE_SYSTEM_STATUS:
      return {
        ...state,
        systemStatus: action.payload
      };

    case ActionTypes.UPDATE_MARKET_DATA:
      return {
        ...state,
        marketData: {
          ...state.marketData,
          ...action.payload,
          lastUpdate: Date.now()
        }
      };

    case ActionTypes.START_REBALANCING:
      return {
        ...state,
        isRebalancing: true,
        currentDecision: action.payload
      };

    case ActionTypes.COMPLETE_REBALANCING:
      return {
        ...state,
        isRebalancing: false,
        currentDecision: null,
        decisionHistory: [action.payload, ...state.decisionHistory].slice(0, 50) // Keep last 50
      };

    case ActionTypes.UPDATE_DECISION_HISTORY:
      return {
        ...state,
        decisionHistory: action.payload
      };

    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };

    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    default:
      return state;
  }
}

// Context
const CrossfluxxContext = createContext();

// Provider component
export function CrossfluxxProvider({ children }) {
  const [state, dispatch] = useReducer(crossfluxxReducer, initialState);

  // Initialize the agent system
  const initializeSystem = useCallback(async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      const config = {
        ethereumRpc: process.env.REACT_APP_ETHEREUM_RPC || 'https://ethereum.publicnode.com',
        arbitrumRpc: process.env.REACT_APP_ARBITRUM_RPC || 'https://arbitrum.publicnode.com',
        polygonRpc: process.env.REACT_APP_POLYGON_RPC || 'https://polygon.publicnode.com',
        coingeckoApiKey: process.env.REACT_APP_COINGECKO_API_KEY,
        defiLlamaApiKey: process.env.REACT_APP_DEFILLAMA_API_KEY,
        minimumConfidence: 0.6,
        consensusThreshold: 0.7,
        maxRiskTolerance: 0.5
      };

      const system = await createCrossfluxxAgentSystem(config);
      
      dispatch({ 
        type: ActionTypes.INIT_SYSTEM_SUCCESS, 
        payload: { system } 
      });

      addNotification({
        type: 'success',
        title: 'System Initialized',
        message: 'Crossfluxx agent system is now running'
      });

    } catch (error) {
      console.error('Failed to initialize agent system:', error);
      dispatch({ 
        type: ActionTypes.INIT_SYSTEM_FAILURE, 
        payload: error.message 
      });

      addNotification({
        type: 'error',
        title: 'Initialization Failed',
        message: 'Failed to start agent system: ' + error.message
      });
    }
  }, []);

  // Update system status
  const updateSystemStatus = useCallback(async () => {
    try {
      if (!state.agentSystem) return;
      
      const status = await state.agentSystem.getSystemStatus();
      dispatch({ 
        type: ActionTypes.UPDATE_SYSTEM_STATUS, 
        payload: status 
      });
    } catch (error) {
      console.error('Failed to update system status:', error);
    }
  }, [state.agentSystem]);

  // Update market data
  const updateMarketData = useCallback(async () => {
    try {
      if (!state.agentSystem) return;
      
      const marketData = await state.agentSystem.getCurrentMarketData();
      dispatch({ 
        type: ActionTypes.UPDATE_MARKET_DATA, 
        payload: marketData 
      });
    } catch (error) {
      console.error('Failed to update market data:', error);
    }
  }, [state.agentSystem]);

  // Initialize agent system
  useEffect(() => {
    initializeSystem();
  }, [initializeSystem]);

  // Update system status periodically
  useEffect(() => {
    if (state.isSystemInitialized && state.agentSystem) {
      updateSystemStatus(); // Initial call
      const interval = setInterval(updateSystemStatus, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [state.isSystemInitialized, state.agentSystem, updateSystemStatus]);

  // Update market data periodically
  useEffect(() => {
    if (state.isSystemInitialized && state.agentSystem) {
      updateMarketData(); // Initial call
      const interval = setInterval(updateMarketData, 60000); // Every minute
      return () => clearInterval(interval);
    }
  }, [state.isSystemInitialized, state.agentSystem, updateMarketData]);

  // Force rebalance evaluation
  const forceRebalanceEvaluation = async () => {
    try {
      if (!state.agentSystem) {
        throw new Error('Agent system not initialized');
      }

      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      const decision = await state.agentSystem.forceRebalanceEvaluation();
      
      dispatch({ 
        type: ActionTypes.START_REBALANCING, 
        payload: decision 
      });

      addNotification({
        type: 'info',
        title: 'Rebalance Evaluation',
        message: `Decision: ${decision.action} (${(decision.confidence * 100).toFixed(1)}% confidence)`
      });

      // Simulate execution time
      setTimeout(() => {
        dispatch({ 
          type: ActionTypes.COMPLETE_REBALANCING, 
          payload: decision 
        });

        addNotification({
          type: decision.action === 'rebalance' ? 'success' : 'info',
          title: 'Rebalance Complete',
          message: decision.action === 'rebalance' ? 'Rebalancing executed successfully' : 'No rebalancing needed'
        });
      }, 3000);

    } catch (error) {
      console.error('Rebalance evaluation failed:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      
      addNotification({
        type: 'error',
        title: 'Rebalance Failed',
        message: error.message
      });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // Add notification
  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    dispatch({ 
      type: ActionTypes.ADD_NOTIFICATION, 
      payload: { ...notification, id, timestamp: Date.now() } 
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  // Remove notification
  const removeNotification = (id) => {
    dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  // Get mock data for demo purposes
  const getMockMarketData = () => {
    return {
      apr: {
        ethereum: { aave: 0.065, compound: 0.058, uniswap: 0.094 },
        arbitrum: { aave: 0.071, uniswap: 0.087 },
        polygon: { aave: 0.089, uniswap: 0.103 }
      },
      tvl: {
        ethereum: 45600000000, // $45.6B
        arbitrum: 12800000000, // $12.8B
        polygon: 8900000000   // $8.9B
      },
      prices: {
        ethereum: { price: 3450, change24h: 2.4 },
        arbitrum: { price: 1.23, change24h: -0.8 },
        polygon: { price: 0.89, change24h: 1.7 }
      },
      signals: {
        direction: 'rebalance_opportunity',
        strength: 'strong',
        confidence: 0.82,
        factors: [
          { type: 'apr_differential', confidence: 0.85 },
          { type: 'market_conditions', confidence: 0.79 },
          { type: 'liquidity_analysis', confidence: 0.88 }
        ]
      }
    };
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    initializeSystem,
    updateSystemStatus,
    updateMarketData,
    forceRebalanceEvaluation,
    addNotification,
    removeNotification,
    clearError,
    getMockMarketData
  };

  return (
    <CrossfluxxContext.Provider value={value}>
      {children}
    </CrossfluxxContext.Provider>
  );
}

// Custom hook
export function useCrossfluxx() {
  const context = useContext(CrossfluxxContext);
  if (!context) {
    throw new Error('useCrossfluxx must be used within a CrossfluxxProvider');
  }
  return context;
}

export default CrossfluxxContext; 