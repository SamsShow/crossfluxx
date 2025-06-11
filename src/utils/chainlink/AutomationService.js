import { ethers } from 'ethers';
import { CrossfluxxCoreABI } from '../../contracts/Crossfluxx.js';

/**
 * Chainlink Automation Service
 * Manages automated upkeeps and triggers for rebalancing
 */
export class AutomationService {
    constructor(config) {
        this.config = config;
        this.providers = config.providers;
        this.contracts = {};
        this.upkeeps = new Map();
        this.isInitialized = false;
        
        // Event listeners
        this.listeners = new Map();
        
        // Monitoring intervals
        this.monitoringIntervals = new Map();
        
        // Service metrics
        this.metrics = {
            upkeepsRegistered: 0,
            upkeepsTriggered: 0,
            checksPerformed: 0,
            executionsSuccessful: 0,
            executionsFailed: 0,
            gasUsed: 0
        };

        // Automation configuration
        this.automationConfig = {
            // Mainnet Automation Registry addresses
            registryAddresses: {
                1: '0x02777053d6764996e594c3E88AF1D58D5363a2e6',        // Ethereum
                42161: '0x75c0530885F385721fddA23C539AF3701d6183D4',     // Arbitrum
                137: '0x02777053d6764996e594c3E88AF1D58D5363a2e6'       // Polygon
            },
            // Testnet Automation Registry addresses
            testnetRegistries: {
                11155111: '0x86EFBD0b6735A7B1909175F6E1418E47BC2a8E16',  // Sepolia
                421614: '0x86EFBD0b6735A7B1909175F6E1418E47BC2a8E16',    // Arbitrum Sepolia
                80002: '0x86EFBD0b6735A7B1909175F6E1418E47BC2a8E16'     // Polygon Amoy
            },
            // Gas limits for different operations
            gasLimits: {
                checkUpkeep: 200000,
                performUpkeep: 500000,
                registerUpkeep: 100000
            }
        };

        // Upkeep conditions and triggers
        this.conditions = {
            // APY threshold conditions
            apyThreshold: {
                type: 'apy_difference',
                threshold: this.config.config.rebalanceThreshold || 100, // 1% difference
                checkFunction: this.checkApyThreshold.bind(this)
            },
            // Time-based conditions
            timeInterval: {
                type: 'time_interval', 
                interval: 24 * 60 * 60, // 24 hours in seconds
                checkFunction: this.checkTimeInterval.bind(this)
            },
            // TVL threshold conditions
            tvlThreshold: {
                type: 'tvl_threshold',
                threshold: 0.1, // 10% change in TVL
                checkFunction: this.checkTvlThreshold.bind(this)
            },
            // Gas price conditions
            gasPrice: {
                type: 'gas_price',
                maxGasPrice: this.config.config.maxGasPrice,
                checkFunction: this.checkGasPrice.bind(this)
            }
        };
    }

    /**
     * Initialize Automation service
     */
    async initialize() {
        try {
            console.log('🤖 Initializing Automation Service...');
            
            // Initialize contracts for each network
            for (const network of this.config.networks) {
                await this.initializeNetwork(network);
            }
            
            // Start monitoring registered upkeeps
            this.startUpkeepMonitoring();
            
            // Setup automated checks
            this.setupAutomatedChecks();
            
            this.isInitialized = true;
            console.log('✅ Automation Service initialization complete');
            
        } catch (error) {
            console.error('❌ Failed to initialize Automation service:', error);
            throw error;
        }
    }

    /**
     * Initialize automation for a specific network
     */
    async initializeNetwork(network) {
        const chainId = this.getChainIdForNetwork(network);
        const provider = this.providers[network];
        
        if (!provider) {
            console.warn(`⚠️  Provider not found for network: ${network}`);
            return;
        }

        const contractAddress = this.config.contracts[chainId]?.CrossfluxxCore;
        if (!contractAddress || contractAddress === "0x...") {
            console.warn(`⚠️  CrossfluxxCore not deployed on ${network} (${chainId})`);
            return;
        }

        // Initialize CrossfluxxCore contract
        this.contracts[chainId] = new ethers.Contract(
            contractAddress,
            CrossfluxxCoreABI,
            provider
        );

        // Setup event listeners
        this.setupContractEventListeners(chainId);

        console.log(`✅ Automation initialized for ${network} (${chainId})`);
    }

    /**
     * Setup contract event listeners
     */
    setupContractEventListeners(chainId) {
        const contract = this.contracts[chainId];
        
        // Listen for rebalance triggered events
        contract.on('RebalanceTriggered', (user, timestamp, event) => {
            this.handleRebalanceTriggered({
                user,
                timestamp: Number(timestamp),
                chainId,
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber
            });
        });

        // Listen for rebalance executed events
        contract.on('RebalanceExecuted', (user, fromChain, toChain, amount, targetPool, event) => {
            this.handleRebalanceExecuted({
                user,
                fromChain: Number(fromChain),
                toChain: Number(toChain),
                amount,
                targetPool,
                chainId,
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber
            });
        });
    }

    /**
     * Start monitoring registered upkeeps
     */
    startUpkeepMonitoring() {
        const interval = setInterval(async () => {
            await this.checkAllUpkeeps();
        }, this.config.config.checkInterval);

        this.monitoringIntervals.set('upkeeps', interval);
        console.log('👀 Upkeep monitoring started');
    }

    /**
     * Setup automated checks for all conditions
     */
    setupAutomatedChecks() {
        // Check conditions more frequently than upkeep execution
        const interval = setInterval(async () => {
            await this.checkAllConditions();
        }, this.config.config.checkInterval / 2);

        this.monitoringIntervals.set('conditions', interval);
        console.log('🔍 Automated condition checking started');
    }

    /**
     * Register a new upkeep
     */
    async registerUpkeep(upkeepConfig) {
        try {
            const {
                targetContract,
                chainId,
                checkData = '0x',
                gasLimit = this.automationConfig.gasLimits.performUpkeep,
                adminAddress,
                name = 'Crossfluxx Rebalance Upkeep'
            } = upkeepConfig;

            // Validate configuration
            if (!targetContract || !chainId || !adminAddress) {
                throw new Error('Missing required upkeep configuration');
            }

            // Get automation registry for the chain
            const registryAddress = this.getRegistryAddress(chainId);
            if (!registryAddress) {
                throw new Error(`Automation registry not available for chain ${chainId}`);
            }

            const upkeepId = this.generateUpkeepId();
            
            // Store upkeep configuration
            this.upkeeps.set(upkeepId, {
                id: upkeepId,
                targetContract,
                chainId,
                checkData,
                gasLimit,
                adminAddress,
                name,
                registryAddress,
                isActive: true,
                lastCheckTime: 0,
                lastExecutionTime: 0,
                checksPerformed: 0,
                executionsSuccessful: 0,
                executionsFailed: 0,
                createdAt: Date.now()
            });

            this.updateMetrics('upkeepsRegistered');
            
            console.log(`✅ Upkeep registered: ${upkeepId} on chain ${chainId}`);
            
            this.emit('upkeepRegistered', {
                upkeepId,
                chainId,
                targetContract,
                name
            });

            return {
                upkeepId,
                success: true,
                registryAddress,
                gasLimit
            };

        } catch (error) {
            console.error('❌ Failed to register upkeep:', error);
            throw error;
        }
    }

    /**
     * Check if upkeep is needed
     */
    async checkUpkeep(params = {}) {
        try {
            const {
                chainId,
                userAddress,
                checkData = '0x'
            } = params;

            // Default to first available chain if not specified
            const targetChainId = chainId || Object.keys(this.contracts)[0];
            const contract = this.contracts[targetChainId];
            
            if (!contract) {
                return {
                    upkeepNeeded: false,
                    reason: 'Contract not available'
                };
            }

            // Call checkUpkeep on the contract
            const [upkeepNeeded, performData] = await contract.checkUpkeep(checkData);
            
            this.updateMetrics('checksPerformed');

            const result = {
                upkeepNeeded,
                performData,
                chainId: targetChainId,
                timestamp: Date.now()
            };

            if (upkeepNeeded) {
                console.log(`🟢 Upkeep needed on chain ${targetChainId}`);
                this.emit('upkeepNeeded', result);
            }

            return result;

        } catch (error) {
            console.error('❌ Failed to check upkeep:', error);
            return {
                upkeepNeeded: false,
                error: error.message
            };
        }
    }

    /**
     * Perform upkeep execution
     */
    async performUpkeep(performData, chainId) {
        try {
            const contract = this.contracts[chainId];
            if (!contract) {
                throw new Error(`Contract not available for chain ${chainId}`);
            }

            // Get signer for the network
            const network = this.getNetworkForChainId(chainId);
            const signer = this.providers[network].getSigner();
            const contractWithSigner = contract.connect(signer);

            // Check gas price before execution
            const gasPrice = await this.providers[network].getGasPrice();
            if (gasPrice > this.config.config.maxGasPrice) {
                throw new Error(`Gas price too high: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
            }

            // Execute performUpkeep
            const tx = await contractWithSigner.performUpkeep(performData, {
                gasLimit: this.automationConfig.gasLimits.performUpkeep,
                gasPrice
            });

            const receipt = await tx.wait();
            
            // Update metrics
            this.updateMetrics('executionsSuccessful');
            this.metrics.gasUsed += Number(receipt.gasUsed);

            console.log(`✅ Upkeep executed successfully: ${tx.hash}`);
            
            this.emit('upkeepExecuted', {
                transactionHash: tx.hash,
                chainId,
                gasUsed: receipt.gasUsed,
                performData,
                blockNumber: receipt.blockNumber
            });

            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed,
                blockNumber: receipt.blockNumber
            };

        } catch (error) {
            this.updateMetrics('executionsFailed');
            console.error('❌ Failed to perform upkeep:', error);
            
            this.emit('upkeepFailed', {
                chainId,
                error: error.message,
                performData
            });
            
            throw error;
        }
    }

    /**
     * Check all registered upkeeps
     */
    async checkAllUpkeeps() {
        const checkPromises = [];

        for (const [upkeepId, upkeep] of this.upkeeps.entries()) {
            if (upkeep.isActive) {
                checkPromises.push(this.checkIndividualUpkeep(upkeepId, upkeep));
            }
        }

        await Promise.allSettled(checkPromises);
    }

    /**
     * Check individual upkeep
     */
    async checkIndividualUpkeep(upkeepId, upkeep) {
        try {
            upkeep.lastCheckTime = Date.now();
            upkeep.checksPerformed++;

            const checkResult = await this.checkUpkeep({
                chainId: upkeep.chainId,
                checkData: upkeep.checkData
            });

            if (checkResult.upkeepNeeded) {
                // Execute the upkeep
                const executionResult = await this.performUpkeep(
                    checkResult.performData,
                    upkeep.chainId
                );

                if (executionResult.success) {
                    upkeep.lastExecutionTime = Date.now();
                    upkeep.executionsSuccessful++;
                    this.updateMetrics('upkeepsTriggered');
                } else {
                    upkeep.executionsFailed++;
                }
            }

        } catch (error) {
            console.error(`❌ Error checking upkeep ${upkeepId}:`, error);
            upkeep.executionsFailed++;
        }
    }

    /**
     * Check all conditions for potential rebalancing
     */
    async checkAllConditions() {
        const conditionResults = {};

        for (const [conditionName, condition] of Object.entries(this.conditions)) {
            try {
                conditionResults[conditionName] = await condition.checkFunction();
            } catch (error) {
                console.error(`❌ Error checking condition ${conditionName}:`, error);
                conditionResults[conditionName] = { triggered: false, error: error.message };
            }
        }

        // Emit condition check results
        this.emit('conditionsChecked', conditionResults);

        // Check if any conditions trigger rebalancing need
        const triggeredConditions = Object.entries(conditionResults)
            .filter(([name, result]) => result.triggered)
            .map(([name, result]) => ({ name, ...result }));

        if (triggeredConditions.length > 0) {
            this.emit('rebalanceConditionsTriggered', triggeredConditions);
        }

        return conditionResults;
    }

    /**
     * Check APY threshold condition
     */
    async checkApyThreshold() {
        try {
            // This would integrate with DataFeedService to get current APY data
            // For now, return a mock result
            const currentApyDifference = 0; // Would be calculated from actual data
            
            const triggered = Math.abs(currentApyDifference) >= this.conditions.apyThreshold.threshold;
            
            return {
                triggered,
                currentDifference: currentApyDifference,
                threshold: this.conditions.apyThreshold.threshold,
                type: 'apy_threshold'
            };

        } catch (error) {
            throw new Error(`APY threshold check failed: ${error.message}`);
        }
    }

    /**
     * Check time interval condition
     */
    async checkTimeInterval() {
        try {
            const now = Math.floor(Date.now() / 1000);
            const lastRebalanceTime = 0; // Would get from contract or storage
            const timeSinceLastRebalance = now - lastRebalanceTime;
            
            const triggered = timeSinceLastRebalance >= this.conditions.timeInterval.interval;
            
            return {
                triggered,
                timeSinceLastRebalance,
                requiredInterval: this.conditions.timeInterval.interval,
                type: 'time_interval'
            };

        } catch (error) {
            throw new Error(`Time interval check failed: ${error.message}`);
        }
    }

    /**
     * Check TVL threshold condition
     */
    async checkTvlThreshold() {
        try {
            // Would integrate with external data sources
            const tvlChange = 0; // Percentage change in TVL
            
            const triggered = Math.abs(tvlChange) >= this.conditions.tvlThreshold.threshold;
            
            return {
                triggered,
                tvlChange,
                threshold: this.conditions.tvlThreshold.threshold,
                type: 'tvl_threshold'
            };

        } catch (error) {
            throw new Error(`TVL threshold check failed: ${error.message}`);
        }
    }

    /**
     * Check gas price condition
     */
    async checkGasPrice() {
        try {
            const gasPrices = {};
            let highGasChain = null;
            
            for (const [chainId, contract] of Object.entries(this.contracts)) {
                const network = this.getNetworkForChainId(chainId);
                const gasPrice = await this.providers[network].getGasPrice();
                gasPrices[chainId] = gasPrice;
                
                if (gasPrice > this.conditions.gasPrice.maxGasPrice) {
                    highGasChain = chainId;
                }
            }
            
            const triggered = highGasChain !== null;
            
            return {
                triggered: !triggered, // Trigger rebalance when gas is acceptable
                gasPrices,
                maxGasPrice: this.conditions.gasPrice.maxGasPrice,
                type: 'gas_price'
            };

        } catch (error) {
            throw new Error(`Gas price check failed: ${error.message}`);
        }
    }

    /**
     * Check rebalancing need based on external data
     */
    async checkRebalanceNeed(priceData) {
        try {
            // Analyze price data for rebalancing opportunities
            const rebalanceNeeded = this.analyzeRebalanceOpportunity(priceData);
            
            if (rebalanceNeeded.shouldRebalance) {
                this.emit('rebalanceOpportunityDetected', rebalanceNeeded);
                
                // Trigger upkeep check for affected chains
                for (const chainId of rebalanceNeeded.involvedChains) {
                    await this.checkUpkeep({ chainId });
                }
            }
            
            return rebalanceNeeded;

        } catch (error) {
            console.error('❌ Error checking rebalance need:', error);
            throw error;
        }
    }

    /**
     * Analyze rebalancing opportunity
     */
    analyzeRebalanceOpportunity(priceData) {
        // Simplified analysis - would be more sophisticated in practice
        const opportunities = [];
        const involvedChains = [];
        
        // Look for significant price changes that might indicate yield opportunities
        if (priceData.priceChangePercent && Math.abs(priceData.priceChangePercent) > 2) {
            opportunities.push({
                type: 'price_movement',
                chain: priceData.chainId,
                magnitude: priceData.priceChangePercent,
                pair: priceData.pair
            });
            involvedChains.push(priceData.chainId);
        }
        
        return {
            shouldRebalance: opportunities.length > 0,
            opportunities,
            involvedChains,
            confidence: opportunities.length > 0 ? 0.7 : 0,
            timestamp: Date.now()
        };
    }

    /**
     * Handle rebalance triggered event
     */
    handleRebalanceTriggered(eventData) {
        console.log(`🎯 Rebalance triggered for user ${eventData.user} on chain ${eventData.chainId}`);
        
        this.updateMetrics('upkeepsTriggered');
        this.emit('rebalanceTriggered', eventData);
    }

    /**
     * Handle rebalance executed event
     */
    handleRebalanceExecuted(eventData) {
        console.log(`⚡ Rebalance executed: ${eventData.amount} from chain ${eventData.fromChain} to ${eventData.toChain}`);
        
        this.updateMetrics('executionsSuccessful');
        this.emit('rebalanceExecuted', eventData);
    }

    /**
     * Get upkeep status
     */
    getUpkeepStatus(upkeepId) {
        return this.upkeeps.get(upkeepId) || null;
    }

    /**
     * Get all upkeeps
     */
    getAllUpkeeps() {
        return Array.from(this.upkeeps.values());
    }

    /**
     * Pause upkeep
     */
    pauseUpkeep(upkeepId) {
        const upkeep = this.upkeeps.get(upkeepId);
        if (upkeep) {
            upkeep.isActive = false;
            console.log(`⏸️  Upkeep paused: ${upkeepId}`);
            this.emit('upkeepPaused', { upkeepId });
        }
    }

    /**
     * Resume upkeep
     */
    resumeUpkeep(upkeepId) {
        const upkeep = this.upkeeps.get(upkeepId);
        if (upkeep) {
            upkeep.isActive = true;
            console.log(`▶️  Upkeep resumed: ${upkeepId}`);
            this.emit('upkeepResumed', { upkeepId });
        }
    }

    /**
     * Update metrics
     */
    updateMetrics(type) {
        if (this.metrics[type] !== undefined) {
            this.metrics[type]++;
        }
        
        this.emit('activity', { type, service: 'automation' });
    }

    /**
     * Get health status
     */
    async getHealthStatus() {
        const activeUpkeeps = Array.from(this.upkeeps.values()).filter(u => u.isActive).length;
        const totalUpkeeps = this.upkeeps.size;
        
        return {
            status: activeUpkeeps > 0 ? 'healthy' : 'degraded',
            activeUpkeeps,
            totalUpkeeps,
            metrics: this.metrics,
            timestamp: Date.now()
        };
    }

    /**
     * Utility functions
     */
    generateUpkeepId() {
        return `upkeep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getRegistryAddress(chainId) {
        return this.automationConfig.testnetRegistries[chainId] || 
               this.automationConfig.registryAddresses[chainId];
    }

    getChainIdForNetwork(network) {
        const mapping = {
            'ethereum': 11155111,
            'arbitrum': 421614,
            'polygon': 80002
        };
        return mapping[network];
    }

    getNetworkForChainId(chainId) {
        const mapping = {
            11155111: 'ethereum',
            421614: 'arbitrum',
            80002: 'polygon'
        };
        return mapping[chainId];
    }

    /**
     * Event emitter methods
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in Automation event listener for ${event}:`, error);
            }
        });
    }

    /**
     * Restart service
     */
    async restart() {
        console.log('🔄 Restarting Automation service...');
        await this.shutdown();
        await this.initialize();
    }

    /**
     * Shutdown service
     */
    async shutdown() {
        // Clear all monitoring intervals
        for (const interval of this.monitoringIntervals.values()) {
            clearInterval(interval);
        }
        this.monitoringIntervals.clear();
        
        // Remove contract event listeners
        Object.values(this.contracts).forEach(contract => {
            contract.removeAllListeners();
        });
        
        this.isInitialized = false;
        console.log('🔌 Automation service shutdown complete');
    }
}

export default AutomationService; 