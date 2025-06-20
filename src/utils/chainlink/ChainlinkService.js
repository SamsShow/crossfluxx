import { ethers, parseUnits } from 'ethers';
import { CCIPService } from './CCIPService.js';
import { DataFeedService } from './DataFeedService.js';
import { AutomationService } from './AutomationService.js';
import { FunctionsService } from './FunctionsService.js';
import { DataStreamsService } from './DataStreamsService.js';
import { CONTRACT_ADDRESSES, CHAIN_CONFIGS } from '../../contracts/constants.js';

/**
 * Main Chainlink Service Manager
 * Coordinates all Chainlink integrations for Crossfluxx
 */
export class ChainlinkService {
    constructor(config = {}) {
        this.config = {
            // Network configurations
            networks: config.networks || ['ethereum', 'arbitrum', 'polygon'],
            
            // Service configurations
            ccip: {
                enableAutomaticRebalancing: config.ccip?.enableAutomaticRebalancing ?? true,
                maxSlippage: config.ccip?.maxSlippage || 500, // 5%
                gasLimit: config.ccip?.gasLimit || 200000
            },
            
            dataFeeds: {
                updateInterval: config.dataFeeds?.updateInterval || 300000, // 5 minutes
                stalePriceThreshold: config.dataFeeds?.stalePriceThreshold || 3600, // 1 hour
                priceDeviationThreshold: config.dataFeeds?.priceDeviationThreshold || 200 // 2%
            },
            
            automation: {
                checkInterval: config.automation?.checkInterval || 60000, // 1 minute
                maxGasPrice: config.automation?.maxGasPrice || parseUnits('50', 'gwei'),
                rebalanceThreshold: config.automation?.rebalanceThreshold || 100 // 1% APY difference
            },
            
            functions: {
                subscriptionId: config.functions?.subscriptionId,
                gasLimit: config.functions?.gasLimit || 300000,
                donId: config.functions?.donId || 'fun-ethereum-sepolia-1'
            },
            
            dataStreams: {
                feedIds: config.dataStreams?.feedIds || [],
                maxLatency: config.dataStreams?.maxLatency || 30000 // 30 seconds
            },
            
            // API keys and credentials
            apiKeys: {
                chainlink: config.apiKeys?.chainlink,
                infura: config.apiKeys?.infura,
                alchemy: config.apiKeys?.alchemy,
                coinGecko: config.apiKeys?.coinGecko
            }
        };

        // Initialize services
        this.services = {};
        this.providers = {};
        this.contracts = {};
        this.isInitialized = false;
        
        // Event listeners
        this.listeners = new Map();
        
        // Monitoring data
        this.metrics = {
            ccipTransactions: 0,
            dataFeedUpdates: 0,
            automationExecutions: 0,
            functionsRequests: 0,
            dataStreamsUpdates: 0,
            errors: 0,
            lastActivity: null
        };
    }

    /**
     * Initialize all Chainlink services
     */
    async initialize(providers = {}) {
        try {
            console.log('🔗 Initializing Chainlink Services...');
            
            // Store providers
            this.providers = providers;
            
            // Initialize each service
            await this.initializeCCIP();
            await this.initializeDataFeeds();
            await this.initializeAutomation();
            await this.initializeFunctions();
            await this.initializeDataStreams();
            
            // Setup cross-service communication
            this.setupServiceIntegration();
            
            // Start monitoring
            this.startMonitoring();
            
            this.isInitialized = true;
            console.log('✅ All Chainlink services initialized successfully');
            
            return {
                success: true,
                services: Object.keys(this.services),
                networks: this.config.networks
            };
            
        } catch (error) {
            console.error('❌ Failed to initialize Chainlink services:', error);
            throw error;
        }
    }

    /**
     * Initialize CCIP service for cross-chain operations
     */
    async initializeCCIP() {
        this.services.ccip = new CCIPService({
            networks: this.config.networks,
            config: this.config.ccip,
            providers: this.providers,
            contracts: CONTRACT_ADDRESSES
        });
        
        await this.services.ccip.initialize();
        console.log('✅ CCIP Service initialized');
    }

    /**
     * Initialize Data Feeds service for price oracles
     */
    async initializeDataFeeds() {
        this.services.dataFeeds = new DataFeedService({
            networks: this.config.networks,
            config: this.config.dataFeeds,
            providers: this.providers,
            apiKeys: this.config.apiKeys
        });
        
        await this.services.dataFeeds.initialize();
        console.log('✅ Data Feeds Service initialized');
    }

    /**
     * Initialize Automation service for scheduled executions
     */
    async initializeAutomation() {
        this.services.automation = new AutomationService({
            networks: this.config.networks,
            config: this.config.automation,
            providers: this.providers,
            contracts: CONTRACT_ADDRESSES
        });
        
        await this.services.automation.initialize();
        console.log('✅ Automation Service initialized');
    }

    /**
     * Initialize Functions service for off-chain computation
     */
    async initializeFunctions() {
        if (this.config.functions.subscriptionId) {
            this.services.functions = new FunctionsService({
                config: this.config.functions,
                providers: this.providers,
                apiKeys: this.config.apiKeys
            });
            
            await this.services.functions.initialize();
            console.log('✅ Functions Service initialized');
        } else {
            console.log('⚠️  Functions Service skipped (no subscription ID)');
        }
    }

    /**
     * Initialize Data Streams service for real-time data
     */
    async initializeDataStreams() {
        if (this.config.dataStreams.feedIds.length > 0) {
            this.services.dataStreams = new DataStreamsService({
                config: this.config.dataStreams,
                providers: this.providers,
                apiKeys: this.config.apiKeys
            });
            
            await this.services.dataStreams.initialize();
            console.log('✅ Data Streams Service initialized');
        } else {
            console.log('⚠️  Data Streams Service skipped (no feed IDs configured)');
        }
    }

    /**
     * Setup integration between services
     */
    setupServiceIntegration() {
        console.log('🔄 Setting up service integration...');
        
        // Data Feeds -> Automation integration
        if (this.services.dataFeeds && this.services.automation) {
            this.services.dataFeeds.on('significantPriceChange', async (priceData) => {
                console.log('📈 Significant price change detected, checking rebalance conditions');
                await this.services.automation.checkRebalanceNeed(priceData);
            });
        }

        // Automation -> CCIP integration
        if (this.services.automation && this.services.ccip) {
            this.services.automation.on('rebalanceTriggered', async (rebalanceData) => {
                console.log('🎯 Rebalance triggered, executing cross-chain strategy');
                await this.executeRebalance(rebalanceData);
            });
        }

        // Data Streams -> Functions integration
        if (this.services.dataStreams && this.services.functions) {
            this.services.dataStreams.on('yieldOpportunity', async (opportunityData) => {
                console.log('🌾 Yield opportunity detected, analyzing with Functions');
                // Trigger yield optimization analysis
            });
        }

        // Error handling for all services
        Object.entries(this.services).forEach(([serviceName, service]) => {
            service.on('error', (error) => {
                this.handleServiceError(serviceName, error);
            });
        });
        
        console.log('✅ Service integration complete');
    }
    setupServiceIntegration() {
        // CCIP + Data Feeds integration
        if (this.services.ccip && this.services.dataFeeds) {
            this.services.dataFeeds.on('priceUpdate', (data) => {
                this.services.ccip.updatePriceData(data);
            });
        }

        // Automation + Data Feeds integration
        if (this.services.automation && this.services.dataFeeds) {
            this.services.dataFeeds.on('significantPriceChange', (data) => {
                this.services.automation.checkRebalanceNeed(data);
            });
        }

        // Functions + Data Streams integration
        if (this.services.functions && this.services.dataStreams) {
            this.services.dataStreams.on('dataUpdate', (data) => {
                this.services.functions.processStreamData(data);
            });
        }

        console.log('🔗 Service integration configured');
    }

    /**
     * Start monitoring all services
     */
    startMonitoring() {
        // Monitor each service
        Object.entries(this.services).forEach(([name, service]) => {
            service.on('activity', (data) => {
                this.updateMetrics(name, data);
            });
            
            service.on('error', (error) => {
                this.handleServiceError(name, error);
            });
        });

        // Periodic health checks
        setInterval(() => {
            this.performHealthCheck();
        }, 60000); // Every minute

        console.log('📊 Monitoring started for all services');
    }

    /**
     * Execute cross-chain rebalance
     */
    async executeRebalance(rebalanceParams) {
        try {
            if (!this.services.ccip) {
                throw new Error('CCIP service not initialized');
            }

            // Get latest price data
            const priceData = await this.services.dataFeeds.getLatestPrices();
            
            // Check automation conditions
            const automationCheck = await this.services.automation.checkUpkeep(rebalanceParams);
            
            if (!automationCheck.upkeepNeeded) {
                return {
                    success: false,
                    reason: 'Automation conditions not met',
                    details: automationCheck
                };
            }

            // Execute CCIP rebalance
            const result = await this.services.ccip.executeRebalance({
                ...rebalanceParams,
                priceData
            });

            this.updateMetrics('rebalance', { success: true });
            
            return {
                success: true,
                transactionHash: result.transactionHash,
                messageId: result.messageId,
                estimatedGas: result.estimatedGas
            };

        } catch (error) {
            this.updateMetrics('rebalance', { success: false, error });
            throw error;
        }
    }

    /**
     * Get real-time yield data across all chains
     */
    async getYieldData() {
        try {
            const [priceData, streamData] = await Promise.all([
                this.services.dataFeeds?.getYieldData() || {},
                this.services.dataStreams?.getLatestData() || {}
            ]);

            return {
                prices: priceData,
                streams: streamData,
                timestamp: Date.now(),
                source: 'chainlink'
            };

        } catch (error) {
            console.error('Failed to get yield data:', error);
            throw error;
        }
    }

    /**
     * Register automation upkeep
     */
    async registerUpkeep(upkeepConfig) {
        if (!this.services.automation) {
            throw new Error('Automation service not initialized');
        }

        return await this.services.automation.registerUpkeep(upkeepConfig);
    }

    /**
     * Execute Chainlink Function
     */
    async executeFunction(source, args = []) {
        if (!this.services.functions) {
            throw new Error('Functions service not initialized');
        }

        return await this.services.functions.executeFunction(source, args);
    }

    /**
     * Update service metrics
     */
    updateMetrics(serviceName, data) {
        const metricKey = `${serviceName}${data.type ? data.type.charAt(0).toUpperCase() + data.type.slice(1) : ''}s`;
        
        if (this.metrics[metricKey] !== undefined) {
            this.metrics[metricKey]++;
        }
        
        this.metrics.lastActivity = Date.now();
        
        // Emit metrics update
        this.emit('metricsUpdate', {
            service: serviceName,
            metrics: this.metrics,
            data
        });
    }

    /**
     * Handle service errors
     */
    handleServiceError(serviceName, error) {
        this.metrics.errors++;
        
        console.error(`❌ ${serviceName} service error:`, error);
        
        // Emit error event
        this.emit('serviceError', {
            service: serviceName,
            error,
            timestamp: Date.now()
        });
        
        // Attempt service recovery if applicable
        this.attemptServiceRecovery(serviceName, error);
    }

    /**
     * Attempt to recover failed service
     */
    async attemptServiceRecovery(serviceName, error) {
        try {
            console.log(`🔄 Attempting to recover ${serviceName} service...`);
            
            const service = this.services[serviceName];
            if (service && typeof service.restart === 'function') {
                await service.restart();
                console.log(`✅ ${serviceName} service recovered`);
            }
            
        } catch (recoveryError) {
            console.error(`❌ Failed to recover ${serviceName} service:`, recoveryError);
        }
    }

    /**
     * Perform health check on all services
     */
    async performHealthCheck() {
        const healthStatus = {
            timestamp: Date.now(),
            services: {},
            overall: 'healthy'
        };

        for (const [name, service] of Object.entries(this.services)) {
            try {
                const status = await service.getHealthStatus();
                healthStatus.services[name] = status;
                
                if (status.status !== 'healthy') {
                    healthStatus.overall = 'degraded';
                }
                
            } catch (error) {
                healthStatus.services[name] = {
                    status: 'unhealthy',
                    error: error.message
                };
                healthStatus.overall = 'unhealthy';
            }
        }

        this.emit('healthCheck', healthStatus);
        return healthStatus;
    }

    /**
     * Get service metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            uptime: Date.now() - (this.metrics.lastActivity || Date.now()),
            services: Object.keys(this.services).length
        };
    }

    /**
     * Shutdown all services
     */
    async shutdown() {
        console.log('🔌 Shutting down Chainlink services...');
        
        for (const [name, service] of Object.entries(this.services)) {
            try {
                if (typeof service.shutdown === 'function') {
                    await service.shutdown();
                    console.log(`✅ ${name} service shutdown complete`);
                }
            } catch (error) {
                console.error(`❌ Error shutting down ${name} service:`, error);
            }
        }
        
        this.isInitialized = false;
        console.log('🔗 Chainlink service shutdown complete');
    }

    /**
     * Event emitter functionality
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
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }
}

export default ChainlinkService; 