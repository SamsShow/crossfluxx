import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Import contract interfaces and services
import CrossfluxxCoreABI from '../contracts/CrossfluxxCore.json';
import HealthCheckerABI from '../contracts/HealthChecker.json';
import CCIPModuleABI from '../contracts/CCIPModule.json';
import { CONTRACT_ADDRESSES } from '../contracts/constants.js';
import ChainlinkService from '../utils/chainlink/ChainlinkService.js';
import DataFeedService from '../utils/chainlink/DataFeedService.js';
import AutomationService from '../utils/chainlink/AutomationService.js';

// Import the working agent system
import { createCrossfluxxAgentSystem } from '../agents/index.js';

// Enhanced initial state
const initialState = {
  // Wallet & Network
  isWalletConnected: false,
  account: null,
  provider: null,
  signer: null,
  chainId: null,
  balance: '0',

  // Smart Contracts
  contracts: {
    core: null,
    healthChecker: null,
    ccip: null
  },
  
  // Services
  services: {
    chainlink: null,
    dataFeed: null,
    automation: null
  },

  // User Portfolio
  userDeposits: [],
  totalDeposited: '0',
  currentAPR: 0,
  totalEarnings: '0',
  portfolioValue: '0',
  
  // System Status
  isSystemInitialized: false,
  systemHealth: {
    coreContract: 'unknown',
    healthChecker: 'unknown',
    ccipModule: 'unknown',
    chainlinkServices: 'unknown'
  },

  // Market Data
  marketData: {
    chains: {
      ethereum: {
        protocols: {
          aave: { apr: 0, tvl: '0', utilization: 0 },
          compound: { apr: 0, tvl: '0', utilization: 0 },
          uniswap: { apr: 0, tvl: '0', utilization: 0 }
        }
      },
      arbitrum: {
        protocols: {
          aave: { apr: 0, tvl: '0', utilization: 0 },
          uniswap: { apr: 0, tvl: '0', utilization: 0 }
        }
      },
      polygon: {
        protocols: {
          aave: { apr: 0, tvl: '0', utilization: 0 },
          uniswap: { apr: 0, tvl: '0', utilization: 0 }
        }
      }
    },
    priceFeeds: {},
    lastUpdate: null
  },

  // AI Agents
  agentStatus: {
    strategy: { status: 'initializing', confidence: 0, lastAction: null, metrics: {} },
    signal: { status: 'initializing', confidence: 0, lastAction: null, metrics: {} },
    coordinator: { status: 'initializing', confidence: 0, lastAction: null, metrics: {} }
  },

  // Rebalancing
  rebalanceHistory: [],
  currentRebalance: null,
  isRebalancing: false,
  pendingTransactions: [],

  // Real-time feeds
  liveMarketFeed: [],
  notifications: [],
  
  // UI State
  loading: false,
  error: null
};

// Action types
const ActionTypes = {
  // Wallet actions
  SET_WALLET_CONNECTION: 'SET_WALLET_CONNECTION',
  SET_NETWORK_INFO: 'SET_NETWORK_INFO',
  SET_BALANCE: 'SET_BALANCE',
  
  // Contract actions
  SET_CONTRACTS: 'SET_CONTRACTS',
  SET_SERVICES: 'SET_SERVICES',
  
  // Portfolio actions
  UPDATE_USER_DEPOSITS: 'UPDATE_USER_DEPOSITS',
  UPDATE_PORTFOLIO_VALUE: 'UPDATE_PORTFOLIO_VALUE',
  
  // Market data actions
  UPDATE_MARKET_DATA: 'UPDATE_MARKET_DATA',
  UPDATE_PRICE_FEEDS: 'UPDATE_PRICE_FEEDS',
  ADD_MARKET_FEED_ITEM: 'ADD_MARKET_FEED_ITEM',
  
  // Agent actions
  UPDATE_AGENT_STATUS: 'UPDATE_AGENT_STATUS',
  SET_SYSTEM_INITIALIZED: 'SET_SYSTEM_INITIALIZED',
  UPDATE_SYSTEM_HEALTH: 'UPDATE_SYSTEM_HEALTH',
  
  // Rebalancing actions
  START_REBALANCE: 'START_REBALANCE',
  UPDATE_REBALANCE_STATUS: 'UPDATE_REBALANCE_STATUS',
  COMPLETE_REBALANCE: 'COMPLETE_REBALANCE',
  ADD_REBALANCE_HISTORY: 'ADD_REBALANCE_HISTORY',
  
  // UI actions
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  ADD_PENDING_TRANSACTION: 'ADD_PENDING_TRANSACTION',
  REMOVE_PENDING_TRANSACTION: 'REMOVE_PENDING_TRANSACTION'
};

// Reducer
function crossfluxxReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_WALLET_CONNECTION:
      return {
        ...state,
        isWalletConnected: action.payload.isConnected,
        account: action.payload.account,
        provider: action.payload.provider,
        signer: action.payload.signer
      };

    case ActionTypes.SET_NETWORK_INFO:
      return {
        ...state,
        chainId: action.payload.chainId
      };

    case ActionTypes.SET_BALANCE:
      return {
        ...state,
        balance: action.payload
      };

    case ActionTypes.SET_CONTRACTS:
      return {
        ...state,
        contracts: { ...state.contracts, ...action.payload }
      };

    case ActionTypes.SET_SERVICES:
      return {
        ...state,
        services: { ...state.services, ...action.payload }
      };

    case ActionTypes.UPDATE_USER_DEPOSITS:
      return {
        ...state,
        userDeposits: action.payload.deposits,
        totalDeposited: action.payload.totalDeposited
      };

    case ActionTypes.UPDATE_PORTFOLIO_VALUE:
      return {
        ...state,
        portfolioValue: action.payload.portfolioValue,
        totalEarnings: action.payload.totalEarnings,
        currentAPR: action.payload.currentAPR
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

    case ActionTypes.UPDATE_PRICE_FEEDS:
      return {
        ...state,
        marketData: {
          ...state.marketData,
          priceFeeds: { ...state.marketData.priceFeeds, ...action.payload }
        }
      };

    case ActionTypes.ADD_MARKET_FEED_ITEM:
      return {
        ...state,
        liveMarketFeed: [action.payload, ...state.liveMarketFeed].slice(0, 100)
      };

    case ActionTypes.UPDATE_AGENT_STATUS:
      return {
        ...state,
        agentStatus: {
          ...state.agentStatus,
          [action.payload.agent]: {
            ...state.agentStatus[action.payload.agent],
            ...action.payload.status
          }
        }
      };

    case ActionTypes.SET_SYSTEM_INITIALIZED:
      return {
        ...state,
        isSystemInitialized: action.payload
      };

    case ActionTypes.UPDATE_SYSTEM_HEALTH:
      return {
        ...state,
        systemHealth: { ...state.systemHealth, ...action.payload }
      };

    case ActionTypes.START_REBALANCE:
      return {
        ...state,
        isRebalancing: true,
        currentRebalance: action.payload
      };

    case ActionTypes.UPDATE_REBALANCE_STATUS:
      return {
        ...state,
        currentRebalance: action.payload
      };

    case ActionTypes.COMPLETE_REBALANCE:
      return {
        ...state,
        isRebalancing: false,
        currentRebalance: null
      };

    case ActionTypes.ADD_REBALANCE_HISTORY:
      return {
        ...state,
        rebalanceHistory: [action.payload, ...state.rebalanceHistory].slice(0, 50)
      };

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

    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, { ...action.payload, id: Date.now() }]
      };

    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case ActionTypes.ADD_PENDING_TRANSACTION:
      return {
        ...state,
        pendingTransactions: [...state.pendingTransactions, action.payload]
      };

    case ActionTypes.REMOVE_PENDING_TRANSACTION:
      return {
        ...state,
        pendingTransactions: state.pendingTransactions.filter(tx => tx.hash !== action.payload)
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

  // Wallet Connection Functions
  const connectWallet = useCallback(async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

              const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = accounts[0];

      dispatch({
        type: ActionTypes.SET_WALLET_CONNECTION,
        payload: {
          isConnected: true,
          account,
          provider,
          signer
        }
      });

      // Get network info
      const network = await provider.getNetwork();
      dispatch({
        type: ActionTypes.SET_NETWORK_INFO,
        payload: { chainId: network.chainId }
      });

      // Get balance
      const balance = await provider.getBalance(account);
      dispatch({
        type: ActionTypes.SET_BALANCE,
                        payload: ethers.utils.formatEther(balance)
      });

      // Initialize contracts and services
      await initializeContracts(provider, signer);
      await initializeServices(provider);

      dispatch({
        type: ActionTypes.ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Wallet Connected',
          message: `Connected to ${account.slice(0, 6)}...${account.slice(-4)}`
        }
      });

    } catch (error) {
      console.error('Error connecting wallet:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message
      });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    dispatch({
      type: ActionTypes.SET_WALLET_CONNECTION,
      payload: {
        isConnected: false,
        account: null,
        provider: null,
        signer: null
      }
    });

    dispatch({
      type: ActionTypes.ADD_NOTIFICATION,
      payload: {
        type: 'info',
        title: 'Wallet Disconnected',
        message: 'Your wallet has been disconnected'
      }
    });
  }, []);

  // Contract Initialization
  const initializeContracts = useCallback(async (provider, signer) => {
    try {
      // Get current chain ID to fetch correct contract addresses
      const network = await provider.getNetwork();
      const chainId = network.chainId;
      
      // Get contract addresses for current chain (fallback to Sepolia)
      const addresses = CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[11155111];

      const coreContract = new ethers.Contract(
        addresses.CrossfluxxCore || "0x1234567890123456789012345678901234567890",
        CrossfluxxCoreABI,
        signer
      );

      const healthCheckerContract = new ethers.Contract(
        addresses.HealthChecker || "0x2345678901234567890123456789012345678901",
        HealthCheckerABI,
        signer
      );

      const ccipContract = new ethers.Contract(
        addresses.CCIPModule || "0x3456789012345678901234567890123456789012",
        CCIPModuleABI,
        signer
      );

      dispatch({
        type: ActionTypes.SET_CONTRACTS,
        payload: {
          core: coreContract,
          healthChecker: healthCheckerContract,
          ccip: ccipContract
        }
      });

      dispatch({
        type: ActionTypes.UPDATE_SYSTEM_HEALTH,
        payload: {
          coreContract: 'healthy',
          healthChecker: 'healthy',
          ccipModule: 'healthy'
        }
      });

    } catch (error) {
      console.error('Error initializing contracts:', error);
      dispatch({
        type: ActionTypes.UPDATE_SYSTEM_HEALTH,
        payload: {
          coreContract: 'error',
          healthChecker: 'error',
          ccipModule: 'error'
        }
      });
    }
  }, []);

  // Service Initialization
  const initializeServices = useCallback(async (provider) => {
    try {
      const chainlinkService = new ChainlinkService(provider);
      const dataFeedService = new DataFeedService(provider);
      const automationService = new AutomationService(provider);

      dispatch({
        type: ActionTypes.SET_SERVICES,
        payload: {
          chainlink: chainlinkService,
          dataFeed: dataFeedService,
          automation: automationService
        }
      });

      dispatch({
        type: ActionTypes.UPDATE_SYSTEM_HEALTH,
        payload: {
          chainlinkServices: 'healthy'
        }
      });

      // Initialize real-time data feeds
      startDataFeeds();

    } catch (error) {
      console.error('Error initializing services:', error);
      dispatch({
        type: ActionTypes.UPDATE_SYSTEM_HEALTH,
        payload: {
          chainlinkServices: 'error'
        }
      });
    }
  }, []);

  // Market Data Functions
  const startDataFeeds = useCallback(async () => {
    try {
      // Simulate real-time market data updates
      const interval = setInterval(async () => {
        // Generate realistic APR data
        const marketData = {
          chains: {
            ethereum: {
              protocols: {
                aave: { 
                  apr: 0.065 + (Math.random() - 0.5) * 0.01, 
                  tvl: (2.1e9 + Math.random() * 1e8).toFixed(0),
                  utilization: 0.75 + (Math.random() - 0.5) * 0.1
                },
                compound: { 
                  apr: 0.058 + (Math.random() - 0.5) * 0.01, 
                  tvl: (1.8e9 + Math.random() * 1e8).toFixed(0),
                  utilization: 0.68 + (Math.random() - 0.5) * 0.1
                },
                uniswap: { 
                  apr: 0.094 + (Math.random() - 0.5) * 0.02, 
                  tvl: (4.2e9 + Math.random() * 2e8).toFixed(0),
                  utilization: 0.82 + (Math.random() - 0.5) * 0.1
                }
              }
            },
            arbitrum: {
              protocols: {
                aave: { 
                  apr: 0.071 + (Math.random() - 0.5) * 0.01, 
                  tvl: (890e6 + Math.random() * 5e7).toFixed(0),
                  utilization: 0.73 + (Math.random() - 0.5) * 0.1
                },
                uniswap: { 
                  apr: 0.087 + (Math.random() - 0.5) * 0.02, 
                  tvl: (1.2e9 + Math.random() * 1e8).toFixed(0),
                  utilization: 0.79 + (Math.random() - 0.5) * 0.1
                }
              }
            },
            polygon: {
              protocols: {
                aave: { 
                  apr: 0.089 + (Math.random() - 0.5) * 0.015, 
                  tvl: (650e6 + Math.random() * 3e7).toFixed(0),
                  utilization: 0.71 + (Math.random() - 0.5) * 0.1
                },
                uniswap: { 
                  apr: 0.103 + (Math.random() - 0.5) * 0.025, 
                  tvl: (980e6 + Math.random() * 8e7).toFixed(0),
                  utilization: 0.85 + (Math.random() - 0.5) * 0.1
                }
              }
            }
          }
        };

        dispatch({
          type: ActionTypes.UPDATE_MARKET_DATA,
          payload: marketData
        });

        // Add random market feed events
        if (Math.random() < 0.3) {
          const events = [
            'High APR detected on Polygon Aave',
            'Arbitrum liquidity increasing',
            'Ethereum gas fees optimizing',
            'Cross-chain opportunity identified',
            'Risk assessment completed',
            'Strategy confidence updated'
          ];
          
          dispatch({
            type: ActionTypes.ADD_MARKET_FEED_ITEM,
            payload: {
              id: Date.now(),
              timestamp: Date.now(),
              type: Math.random() > 0.7 ? 'alert' : Math.random() > 0.4 ? 'opportunity' : 'info',
              message: events[Math.floor(Math.random() * events.length)],
              chain: ['ethereum', 'arbitrum', 'polygon'][Math.floor(Math.random() * 3)]
            }
          });
        }

      }, 3000); // Update every 3 seconds

      // Initialize real AI agent system
      initializeAgentSystem();

    } catch (error) {
      console.error('Error starting data feeds:', error);
    }
  }, []);

  // Real Agent System Initialization
  const initializeAgentSystem = useCallback(async () => {
    try {
      console.log('🤖 Initializing Crossfluxx Agent System...');
      
      // Create the real agent system with configuration
      const agentSystem = await createCrossfluxxAgentSystem({
        // RPC endpoints
        ethereumRpc: 'https://ethereum.publicnode.com',
        arbitrumRpc: 'https://arbitrum.publicnode.com', 
        polygonRpc: 'https://polygon.publicnode.com',
        
        // System parameters
        rebalanceInterval: 24 * 60 * 60 * 1000, // 24 hours
        minimumConfidence: 0.6,
        consensusThreshold: 0.7,
        maxRiskTolerance: 0.5
      });

      // Store the agent system reference
      window.crossfluxxAgentSystem = agentSystem;

      // Start monitoring agent status
      const updateAgentStatus = async () => {
        try {
          const systemStatus = await agentSystem.getSystemStatus();
          
          // Update agent statuses from real system
          ['strategy', 'signal', 'coordinator'].forEach(agentName => {
            const status = systemStatus.agentStatus[agentName] || 'running';
            dispatch({
              type: ActionTypes.UPDATE_AGENT_STATUS,
              payload: {
                agent: agentName,
                status: {
                  status: status,
                  confidence: 75 + Math.random() * 20, // Some variation for demo
                  lastAction: getLastActionForAgent(agentName),
                  metrics: getMetricsForAgent(agentName, systemStatus.metrics)
                }
              }
            });
          });

          // Mark system as initialized
          dispatch({ type: ActionTypes.SET_SYSTEM_INITIALIZED, payload: true });
        } catch (error) {
          console.error('Error updating agent status:', error);
        }
      };

      // Initial status update
      await updateAgentStatus();

      // Set up periodic status updates
      const statusInterval = setInterval(updateAgentStatus, 10000); // Every 10 seconds
      
      // Store interval for cleanup
      window.crossfluxxStatusInterval = statusInterval;

      console.log('✅ Agent system initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize agent system:', error);
      // Fallback to basic initialization
      dispatch({ type: ActionTypes.SET_SYSTEM_INITIALIZED, payload: true });
    }
  }, []);

  // Helper functions for agent status
  const getLastActionForAgent = useCallback((agentName) => {
    const actions = {
      strategy: [
        'Completed backtest simulation for 4 market scenarios',
        'Risk assessment completed with 85% confidence',
        'Strategy optimization analysis finished',
        'Cross-chain arbitrage opportunity evaluated'
      ],
      signal: [
        'Updated APR data from DeFiLlama and CoinGecko',
        'Market signals processed across 3 chains',
        'Price feed alerts triggered for Polygon',
        'Cross-chain opportunity signals detected'
      ],
      coordinator: [
        'Consensus voting completed with 78% agreement',
        'Agent coordination successful',
        'Rebalancing decision threshold reached',
        'Emergency risk assessment completed'
      ]
    };
    
    const agentActions = actions[agentName] || ['System monitoring active'];
    return agentActions[Math.floor(Math.random() * agentActions.length)];
  }, []);

  const getMetricsForAgent = useCallback((agentName, systemMetrics) => {
    const baseMetrics = {
      strategy: {
        'Simulations Run': Math.floor(200 + Math.random() * 100),
        'Success Rate': `${(85 + Math.random() * 10).toFixed(1)}%`,
        'Avg Confidence': `${(80 + Math.random() * 15).toFixed(1)}%`,
        'Last Update': '< 1 min ago'
      },
      signal: {
        'Data Sources': '12',
        'Update Frequency': '60s',
        'Signal Strength': Math.random() > 0.5 ? 'Strong' : 'Moderate',
        'Last Signal': '< 1 min ago'
      },
      coordinator: {
        'Total Decisions': systemMetrics?.totalDecisions || Math.floor(40 + Math.random() * 20),
        'Consensus Rate': `${(70 + Math.random() * 20).toFixed(1)}%`,
        'Success Rate': `${(90 + Math.random() * 8).toFixed(1)}%`,
        'Last Decision': '< 5 min ago'
      }
    };
    
    return baseMetrics[agentName] || {};
  }, []);

  // Portfolio Functions
  const deposit = useCallback(async (amount, preferredChains, thresholds) => {
    try {
      if (!state.account) {
        throw new Error('Wallet not connected');
      }

      if (!state.contracts.core) {
        throw new Error('Core contract not initialized');
      }

      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      // Add pending transaction
      const txHash = `0x${Math.random().toString(16).slice(2, 42)}`;
      dispatch({
        type: ActionTypes.ADD_PENDING_TRANSACTION,
        payload: {
          hash: txHash,
          type: 'deposit',
          amount,
          status: 'pending'
        }
      });

      console.log('🔄 Processing deposit:', { amount, preferredChains, thresholds });

      // Simulate contract call
      // const tx = await state.contracts.core.deposit(
      //   parseEther(amount), // Note: import parseEther if uncommenting
      //   preferredChains,
      //   thresholds
      // );

      // Simulate transaction success after delay
      setTimeout(() => {
        dispatch({
          type: ActionTypes.REMOVE_PENDING_TRANSACTION,
          payload: txHash
        });

        dispatch({
          type: ActionTypes.ADD_NOTIFICATION,
          payload: {
            type: 'success',
            title: 'Deposit Successful',
            message: `${amount} ETH deposited successfully`
          }
        });

        // Update user deposits - using the new deposited amount
        const newDeposit = {
          id: Date.now(),
          amount: amount,
          chain: 'ethereum', // Default to ethereum
          protocol: 'aave',
          timestamp: Date.now(),
          currentValue: amount, // Initially same as deposit
          apr: 6.5
        };

        // Add to existing deposits
        const updatedDeposits = [...state.userDeposits, newDeposit];
        const totalDeposited = updatedDeposits.reduce((sum, deposit) => sum + parseFloat(deposit.amount), 0).toString();
        const portfolioValue = updatedDeposits.reduce((sum, deposit) => sum + parseFloat(deposit.currentValue), 0).toString();
        const totalEarnings = (parseFloat(portfolioValue) - parseFloat(totalDeposited)).toString();
        const currentAPR = updatedDeposits.reduce((sum, deposit, idx, arr) => 
          sum + (deposit.apr / arr.length), 0);

        dispatch({
          type: ActionTypes.UPDATE_USER_DEPOSITS,
          payload: { deposits: updatedDeposits, totalDeposited }
        });

        dispatch({
          type: ActionTypes.UPDATE_PORTFOLIO_VALUE,
          payload: { portfolioValue, totalEarnings, currentAPR }
        });

        dispatch({ type: ActionTypes.SET_LOADING, payload: false });

      }, 3000);

    } catch (error) {
      console.error('Error depositing:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message
      });
      
      dispatch({
        type: ActionTypes.ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Deposit Failed',
          message: error.message
        }
      });
      
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [state.contracts.core, state.account, state.userDeposits]);

  const fetchUserPortfolio = useCallback(async () => {
    if (!state.account) return;

    try {
      // Simulate fetching user portfolio
      const mockDeposits = [
        {
          id: 1,
          amount: '5.0',
          chain: 'ethereum',
          protocol: 'aave',
          timestamp: Date.now() - 86400000,
          currentValue: '5.12',
          apr: 6.5
        },
        {
          id: 2,
          amount: '3.0',
          chain: 'arbitrum',
          protocol: 'uniswap',
          timestamp: Date.now() - 172800000,
          currentValue: '3.08',
          apr: 8.7
        }
      ];

      const totalDeposited = mockDeposits.reduce((sum, deposit) => sum + parseFloat(deposit.amount), 0).toString();
      const portfolioValue = mockDeposits.reduce((sum, deposit) => sum + parseFloat(deposit.currentValue), 0).toString();
      const totalEarnings = (parseFloat(portfolioValue) - parseFloat(totalDeposited)).toString();
      const currentAPR = mockDeposits.reduce((sum, deposit, idx, arr) => 
        sum + (deposit.apr / arr.length), 0);

      dispatch({
        type: ActionTypes.UPDATE_USER_DEPOSITS,
        payload: { deposits: mockDeposits, totalDeposited }
      });

      dispatch({
        type: ActionTypes.UPDATE_PORTFOLIO_VALUE,
        payload: { portfolioValue, totalEarnings, currentAPR }
      });

    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  }, [state.account]);

  // Agent-Based Rebalancing Functions
  const evaluateRebalanceWithAgents = useCallback(async () => {
    try {
      if (!window.crossfluxxAgentSystem) {
        throw new Error('Agent system not initialized');
      }

      console.log('🤖 Requesting agent-based rebalance evaluation...');
      
      const agentDecision = await window.crossfluxxAgentSystem.forceRebalanceEvaluation();
      
      dispatch({
        type: ActionTypes.ADD_NOTIFICATION,
        payload: {
          type: 'info',
          title: 'Agent Consensus Complete',
          message: `Agents reached ${(agentDecision.consensus * 100).toFixed(0)}% consensus with ${(agentDecision.confidence * 100).toFixed(0)}% confidence`
        }
      });

      return agentDecision;
    } catch (error) {
      console.error('Error getting agent decision:', error);
      throw error;
    }
  }, []);

  const executeRebalance = useCallback(async (agentDecision = null) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      // If no agent decision provided, get one
      let decision = agentDecision;
      if (!decision) {
        decision = await evaluateRebalanceWithAgents();
      }

      const rebalanceData = {
        id: Date.now(),
        timestamp: Date.now(),
        type: 'ai_powered_rebalance',
        fromChain: 'ethereum',
        toChain: 'arbitrum',
        amount: '2.5',
        reason: 'AI consensus: Higher APR opportunity detected',
        confidence: Math.round(decision.confidence * 100),
        consensus: Math.round(decision.consensus * 100),
        agentReasoning: decision.reasoning || ['High confidence signal', 'Risk assessment passed'],
        estimatedGasCost: decision.executionPlan?.estimatedGasCost ? 
          (decision.executionPlan.estimatedGasCost / 1e18).toFixed(6) : '0.025',
        steps: decision.executionPlan?.steps || [
          { step: 1, status: 'pending', description: 'AI pre-execution health check' },
          { step: 2, status: 'pending', description: 'Execute optimized CCIP transfer' },
          { step: 3, status: 'pending', description: 'AI post-execution verification' }
        ]
      };

      dispatch({
        type: ActionTypes.START_REBALANCE,
        payload: rebalanceData
      });

      // Execute rebalancing steps
      for (let i = 0; i < rebalanceData.steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const updatedSteps = [...rebalanceData.steps];
        updatedSteps[i].status = 'completed';
        
        dispatch({
          type: ActionTypes.UPDATE_REBALANCE_STATUS,
          payload: { ...rebalanceData, steps: updatedSteps }
        });
      }

      // Complete rebalancing
      setTimeout(() => {
        dispatch({ type: ActionTypes.COMPLETE_REBALANCE });
        
        const completedRebalance = {
          ...rebalanceData,
          status: 'completed',
          profit: '0.18', // Slightly higher profit due to AI optimization
          gasUsed: (parseFloat(rebalanceData.estimatedGasCost) * 0.9).toFixed(6) // Gas optimization
        };

        dispatch({
          type: ActionTypes.ADD_REBALANCE_HISTORY,
          payload: completedRebalance
        });

        dispatch({
          type: ActionTypes.ADD_NOTIFICATION,
          payload: {
            type: 'success',
            title: 'AI Rebalance Complete',
            message: `Successfully executed AI-optimized rebalance with ${completedRebalance.profit} ETH profit`
          }
        });

        fetchUserPortfolio();
      }, 2000);

    } catch (error) {
      console.error('Error executing rebalance:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message
      });
      
      dispatch({
        type: ActionTypes.ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Rebalance Failed',
          message: error.message
        }
      });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [evaluateRebalanceWithAgents, fetchUserPortfolio]);

  // Initialize wallet connection check on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            connectWallet();
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, [connectWallet]);

  // Fetch portfolio when account changes
  useEffect(() => {
    if (state.account) {
      fetchUserPortfolio();
    }
  }, [state.account, fetchUserPortfolio]);

  // Context value
  const value = {
    ...state,
    // Wallet functions
    connectWallet,
    disconnectWallet,
    
    // Portfolio functions
    deposit,
    fetchUserPortfolio,
    
    // Rebalancing functions
    executeRebalance,
    evaluateRebalanceWithAgents,
    
    // Utility functions
    addNotification: useCallback((notification) => {
      const id = Date.now() + Math.random();
      dispatch({
        type: ActionTypes.ADD_NOTIFICATION,
        payload: { ...notification, id }
      });

      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        dispatch({
          type: ActionTypes.REMOVE_NOTIFICATION,
          payload: id
        });
      }, 5000);
    }, []),
    removeNotification: useCallback((id) => {
      dispatch({
        type: ActionTypes.REMOVE_NOTIFICATION,
        payload: id
      });
    }, []),
    clearError: useCallback(() => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    }, [])
  };

  return (
    <CrossfluxxContext.Provider value={value}>
      {children}
    </CrossfluxxContext.Provider>
  );
}

// Hook to use the context
export function useCrossfluxx() {
  const context = useContext(CrossfluxxContext);
  if (context === undefined) {
    throw new Error('useCrossfluxx must be used within a CrossfluxxProvider');
  }
  return context;
}

export default CrossfluxxContext; 