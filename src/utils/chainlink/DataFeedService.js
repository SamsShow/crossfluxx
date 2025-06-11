import { ethers } from 'ethers';
import axios from 'axios';

/**
 * Chainlink Data Feeds Service
 * Handles price feeds, APR data aggregation, and yield monitoring
 */
export class DataFeedService {
    constructor(config) {
        this.config = config;
        this.providers = config.providers;
        this.apiKeys = config.apiKeys;
        this.dataFeeds = {};
        this.priceCache = new Map();
        this.yieldCache = new Map();
        this.isInitialized = false;
        
        // Event listeners
        this.listeners = new Map();
        
        // Update intervals
        this.updateIntervals = new Map();
        
        // Service metrics
        this.metrics = {
            priceUpdates: 0,
            yieldUpdates: 0,
            cacheHits: 0,
            cacheMisses: 0,
            apiCalls: 0,
            errors: 0
        };

        // Chainlink Price Feed addresses for different networks
        this.priceFeeds = {
            // Ethereum Sepolia
            11155111: {
                'ETH/USD': '0x694AA1769357215DE4FAC081bf1f309aDC325306',
                'BTC/USD': '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43',
                'USDC/USD': '0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E',
                'LINK/USD': '0xc59E3633BAAC79493d908e63626716e204A45EdF'
            },
            // Arbitrum Sepolia
            421614: {
                'ETH/USD': '0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165',
                'BTC/USD': '0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69',
                'USDC/USD': '0x0153002d20B96532C639313c2d54c3dA09109309',
                'LINK/USD': '0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298'
            },
            // Polygon Amoy
            80002: {
                'ETH/USD': '0x001382149eBa3441043c1c66972b4772963f5D43',
                'BTC/USD': '0xe7656e23fE8077D438aEfbec2fAbDf2D8e070C4f',
                'MATIC/USD': '0x001382149eBa3441043c1c66972b4772963f5D43',
                'USDC/USD': '0x1b8739bB4CdF0089d07097A9Ae5Bd274b29C6F16'
            }
        };

        // DeFi Protocol yield sources
        this.yieldSources = [
            {
                name: 'Aave',
                chains: ['ethereum', 'arbitrum', 'polygon'],
                apiEndpoint: 'https://aave-api-v2.aave.com/data/rates-history',
                parseFunction: this.parseAaveData.bind(this)
            },
            {
                name: 'Compound',
                chains: ['ethereum'],
                apiEndpoint: 'https://api.compound.finance/api/v2/ctoken',
                parseFunction: this.parseCompoundData.bind(this)
            },
            {
                name: 'Uniswap V3',
                chains: ['ethereum', 'arbitrum', 'polygon'],
                apiEndpoint: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
                parseFunction: this.parseUniswapData.bind(this)
            }
        ];
    }

    /**
     * Initialize Data Feed service
     */
    async initialize() {
        try {
            console.log('📊 Initializing Data Feed Service...');
            
            // Initialize price feeds for each network
            for (const network of this.config.networks) {
                await this.initializePriceFeeds(network);
            }
            
            // Start price monitoring
            this.startPriceMonitoring();
            
            // Start yield data monitoring
            this.startYieldMonitoring();
            
            // Setup cache management
            this.setupCacheManagement();
            
            this.isInitialized = true;
            console.log('✅ Data Feed Service initialization complete');
            
        } catch (error) {
            console.error('❌ Failed to initialize Data Feed service:', error);
            throw error;
        }
    }

    /**
     * Initialize price feeds for a specific network
     */
    async initializePriceFeeds(network) {
        const chainId = this.getChainIdForNetwork(network);
        const provider = this.providers[network];
        
        if (!provider) {
            console.warn(`⚠️  Provider not found for network: ${network}`);
            return;
        }

        const feeds = this.priceFeeds[chainId];
        if (!feeds) {
            console.warn(`⚠️  Price feeds not configured for chain: ${chainId}`);
            return;
        }

        this.dataFeeds[chainId] = {};

        // Initialize each price feed contract
        for (const [pair, address] of Object.entries(feeds)) {
            try {
                this.dataFeeds[chainId][pair] = new ethers.Contract(
                    address,
                    [
                        'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
                        'function decimals() view returns (uint8)',
                        'function description() view returns (string)'
                    ],
                    provider
                );

                console.log(`✅ Price feed initialized: ${pair} on ${network}`);
            } catch (error) {
                console.error(`❌ Failed to initialize ${pair} feed on ${network}:`, error);
            }
        }
    }

    /**
     * Start price monitoring
     */
    startPriceMonitoring() {
        const interval = setInterval(async () => {
            await this.updateAllPrices();
        }, this.config.config.updateInterval);

        this.updateIntervals.set('prices', interval);
        console.log('📈 Price monitoring started');
    }

    /**
     * Start yield monitoring
     */
    startYieldMonitoring() {
        const interval = setInterval(async () => {
            await this.updateAllYieldData();
        }, this.config.config.updateInterval * 2); // Update yield data less frequently

        this.updateIntervals.set('yields', interval);
        console.log('🌾 Yield monitoring started');
    }

    /**
     * Setup cache management
     */
    setupCacheManagement() {
        // Clear expired cache entries every 10 minutes
        setInterval(() => {
            this.cleanupCache();
        }, 10 * 60 * 1000);

        console.log('🗄️  Cache management configured');
    }

    /**
     * Update all price feeds
     */
    async updateAllPrices() {
        try {
            const updatePromises = [];

            for (const [chainId, feeds] of Object.entries(this.dataFeeds)) {
                for (const [pair, contract] of Object.entries(feeds)) {
                    updatePromises.push(this.updatePriceFeed(chainId, pair, contract));
                }
            }

            await Promise.allSettled(updatePromises);
            this.emit('pricesUpdated', { timestamp: Date.now() });

        } catch (error) {
            console.error('❌ Error updating prices:', error);
            this.updateMetrics('error');
        }
    }

    /**
     * Update a specific price feed
     */
    async updatePriceFeed(chainId, pair, contract) {
        try {
            const [roundId, answer, startedAt, updatedAt, answeredInRound] = await contract.latestRoundData();
            const decimals = await contract.decimals();
            
            const price = Number(answer) / Math.pow(10, decimals);
            const cacheKey = `${chainId}-${pair}`;
            
            // Get previous price for comparison
            const previousData = this.priceCache.get(cacheKey);
            const previousPrice = previousData?.price || 0;
            
            const priceData = {
                price,
                previousPrice,
                priceChange: price - previousPrice,
                priceChangePercent: previousPrice > 0 ? ((price - previousPrice) / previousPrice) * 100 : 0,
                updatedAt: Number(updatedAt) * 1000,
                roundId: Number(roundId),
                chainId: parseInt(chainId),
                pair,
                decimals,
                isStale: this.isPriceStale(Number(updatedAt) * 1000)
            };

            // Update cache
            this.priceCache.set(cacheKey, priceData);
            this.updateMetrics('priceUpdate');

            // Emit significant price change events
            if (Math.abs(priceData.priceChangePercent) > this.config.config.priceDeviationThreshold / 100) {
                this.emit('significantPriceChange', priceData);
            }

            this.emit('priceUpdate', priceData);

        } catch (error) {
            console.error(`❌ Failed to update ${pair} on chain ${chainId}:`, error);
            this.updateMetrics('error');
        }
    }

    /**
     * Update all yield data
     */
    async updateAllYieldData() {
        try {
            const updatePromises = this.yieldSources.map(source => 
                this.updateYieldSource(source)
            );

            await Promise.allSettled(updatePromises);
            this.emit('yieldDataUpdated', { timestamp: Date.now() });

        } catch (error) {
            console.error('❌ Error updating yield data:', error);
            this.updateMetrics('error');
        }
    }

    /**
     * Update yield data from a specific source
     */
    async updateYieldSource(source) {
        try {
            this.updateMetrics('apiCall');
            
            const response = await axios.get(source.apiEndpoint, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Crossfluxx/1.0'
                }
            });

            const parsedData = await source.parseFunction(response.data);
            
            for (const chain of source.chains) {
                const chainId = this.getChainIdForNetwork(chain);
                const cacheKey = `${chainId}-${source.name}`;
                
                this.yieldCache.set(cacheKey, {
                    ...parsedData[chain],
                    source: source.name,
                    chainId,
                    updatedAt: Date.now()
                });
            }

            this.updateMetrics('yieldUpdate');

        } catch (error) {
            console.error(`❌ Failed to update ${source.name} yield data:`, error);
            this.updateMetrics('error');
        }
    }

    /**
     * Get latest price for a trading pair
     */
    async getLatestPrice(chainId, pair) {
        const cacheKey = `${chainId}-${pair}`;
        const cached = this.priceCache.get(cacheKey);
        
        if (cached && !this.isCacheExpired(cached.updatedAt)) {
            this.updateMetrics('cacheHit');
            return cached;
        }

        this.updateMetrics('cacheMiss');
        
        try {
            // Force update if not in cache or expired
            const contract = this.dataFeeds[chainId]?.[pair];
            if (contract) {
                await this.updatePriceFeed(chainId, pair, contract);
                return this.priceCache.get(cacheKey);
            }
        } catch (error) {
            console.warn(`Failed to update price feed for ${pair}:`, error.message);
            
            // Return mock data for testing when contract calls fail
            const mockPrice = this.getMockPrice(pair);
            const mockData = {
                price: mockPrice,
                roundId: '1',
                updatedAt: Date.now(),
                decimals: 8,
                timestamp: Date.now()
            };
            
            this.priceCache.set(cacheKey, mockData);
            return mockData;
        }

        throw new Error(`Price feed not available for ${pair} on chain ${chainId}`);
    }

    /**
     * Get mock price for testing
     */
    getMockPrice(pair) {
        const mockPrices = {
            'ETH/USD': '2000.00',
            'BTC/USD': '42000.00',
            'USDC/USD': '1.00',
            'LINK/USD': '15.00',
            'MATIC/USD': '0.80'
        };
        
        return mockPrices[pair] || '100.00';
    }

    /**
     * Get latest prices for all pairs
     */
    async getLatestPrices() {
        const prices = {};
        
        for (const [cacheKey, priceData] of this.priceCache.entries()) {
            const [chainId, pair] = cacheKey.split('-');
            
            if (!prices[chainId]) {
                prices[chainId] = {};
            }
            
            prices[chainId][pair] = priceData;
        }

        return prices;
    }

    /**
     * Get yield data for a specific chain and protocol
     */
    async getYieldData(chainId, protocol) {
        const cacheKey = `${chainId}-${protocol}`;
        const cached = this.yieldCache.get(cacheKey);
        
        if (cached && !this.isCacheExpired(cached.updatedAt)) {
            this.updateMetrics('cacheHit');
            return cached;
        }

        this.updateMetrics('cacheMiss');
        
        // Force update
        const source = this.yieldSources.find(s => s.name === protocol);
        if (source) {
            await this.updateYieldSource(source);
            return this.yieldCache.get(cacheKey);
        }

        throw new Error(`Yield data not available for ${protocol} on chain ${chainId}`);
    }

    /**
     * Get all yield data
     */
    async getAllYieldData() {
        const yields = {};
        
        for (const [cacheKey, yieldData] of this.yieldCache.entries()) {
            const [chainId, protocol] = cacheKey.split('-');
            
            if (!yields[chainId]) {
                yields[chainId] = {};
            }
            
            yields[chainId][protocol] = yieldData;
        }

        return yields;
    }

    /**
     * Get optimized yield opportunities across chains
     */
    async getOptimizedYieldOpportunities(amount, token = 'USDC') {
        try {
            const allYields = await this.getAllYieldData();
            const allPrices = await this.getLatestPrices();
            
            const opportunities = [];

            for (const [chainId, protocols] of Object.entries(allYields)) {
                for (const [protocol, data] of Object.entries(protocols)) {
                    if (data.tokens && data.tokens[token]) {
                        const tokenData = data.tokens[token];
                        
                        opportunities.push({
                            chainId: parseInt(chainId),
                            protocol,
                            token,
                            apy: tokenData.supplyApy || tokenData.apy || 0,
                            tvl: tokenData.totalSupply || 0,
                            liquidity: tokenData.availableLiquidity || 0,
                            risk: this.calculateRiskScore(protocol, tokenData),
                            estimatedGasCost: await this.estimateGasCost(chainId, protocol),
                            priceImpact: this.calculatePriceImpact(amount, tokenData.liquidity),
                            updatedAt: data.updatedAt
                        });
                    }
                }
            }

            // Sort by risk-adjusted APY
            opportunities.sort((a, b) => {
                const adjustedApyA = a.apy * (1 - a.risk / 100);
                const adjustedApyB = b.apy * (1 - b.risk / 100);
                return adjustedApyB - adjustedApyA;
            });

            return opportunities;

        } catch (error) {
            console.error('❌ Failed to get yield opportunities:', error);
            throw error;
        }
    }

    /**
     * Parse Aave yield data
     */
    async parseAaveData(data) {
        // Implementation depends on Aave API structure
        const parsed = {
            ethereum: { tokens: {} },
            arbitrum: { tokens: {} },
            polygon: { tokens: {} }
        };

        // Parse Aave reserves data
        if (data.reserves) {
            for (const reserve of data.reserves) {
                const symbol = reserve.symbol;
                const supplyApy = parseFloat(reserve.liquidityRate) / 1e25; // Convert from ray to percentage
                
                for (const chain of ['ethereum', 'arbitrum', 'polygon']) {
                    if (reserve[`${chain}Address`]) {
                        parsed[chain].tokens[symbol] = {
                            supplyApy,
                            totalSupply: parseFloat(reserve.totalLiquidity || 0),
                            utilizationRate: parseFloat(reserve.utilizationRate || 0),
                            availableLiquidity: parseFloat(reserve.availableLiquidity || 0)
                        };
                    }
                }
            }
        }

        return parsed;
    }

    /**
     * Parse Compound yield data
     */
    async parseCompoundData(data) {
        const parsed = {
            ethereum: { tokens: {} }
        };

        if (data.cToken) {
            for (const cToken of data.cToken) {
                const underlying = cToken.underlying_symbol || cToken.symbol.replace('c', '');
                
                parsed.ethereum.tokens[underlying] = {
                    supplyApy: parseFloat(cToken.supply_rate.value) * 100,
                    totalSupply: parseFloat(cToken.total_supply.value),
                    exchangeRate: parseFloat(cToken.exchange_rate.value)
                };
            }
        }

        return parsed;
    }

    /**
     * Parse Uniswap V3 yield data
     */
    async parseUniswapData(data) {
        // GraphQL query implementation for Uniswap V3 pools
        const parsed = {
            ethereum: { tokens: {} },
            arbitrum: { tokens: {} },
            polygon: { tokens: {} }
        };

        // Implementation would parse Uniswap pool data
        // This is a simplified version
        return parsed;
    }

    /**
     * Calculate risk score for a protocol/token
     */
    calculateRiskScore(protocol, tokenData) {
        let risk = 0;
        
        // Protocol risk factors
        const protocolRisk = {
            'Aave': 2,
            'Compound': 3,
            'Uniswap V3': 5
        };
        
        risk += protocolRisk[protocol] || 10;
        
        // TVL risk (lower TVL = higher risk)
        if (tokenData.totalSupply < 1000000) risk += 5;
        else if (tokenData.totalSupply < 10000000) risk += 2;
        
        // Utilization risk
        if (tokenData.utilizationRate > 0.9) risk += 3;
        
        return Math.min(risk, 10); // Cap at 10
    }

    /**
     * Estimate gas cost for interaction
     */
    async estimateGasCost(chainId, protocol) {
        const baseGasCosts = {
            'Aave': 150000,
            'Compound': 120000,
            'Uniswap V3': 200000
        };

        const gasPrice = await this.getGasPrice(chainId);
        const gasLimit = baseGasCosts[protocol] || 180000;
        
        return gasPrice * gasLimit;
    }

    /**
     * Calculate price impact
     */
    calculatePriceImpact(amount, liquidity) {
        if (!liquidity || liquidity === 0) return 100; // 100% impact if no liquidity
        
        const impact = (amount / liquidity) * 100;
        return Math.min(impact, 100);
    }

    /**
     * Get gas price for chain
     */
    async getGasPrice(chainId) {
        try {
            const network = this.getNetworkForChainId(chainId);
            const provider = this.providers[network];
            
            if (provider) {
                return await provider.getGasPrice();
            }
            
            return ethers.parseUnits('20', 'gwei'); // Fallback
            
        } catch (error) {
            return ethers.parseUnits('20', 'gwei'); // Fallback
        }
    }

    /**
     * Check if price is stale
     */
    isPriceStale(updatedAt) {
        const now = Date.now();
        const threshold = this.config.config.stalePriceThreshold * 1000;
        return (now - updatedAt) > threshold;
    }

    /**
     * Check if cache is expired
     */
    isCacheExpired(timestamp) {
        const now = Date.now();
        const threshold = this.config.config.updateInterval;
        return (now - timestamp) > threshold;
    }

    /**
     * Cleanup expired cache entries
     */
    cleanupCache() {
        const now = Date.now();
        const threshold = this.config.config.updateInterval * 3; // Keep cache 3x update interval
        
        for (const [key, data] of this.priceCache.entries()) {
            if ((now - data.updatedAt) > threshold) {
                this.priceCache.delete(key);
            }
        }
        
        for (const [key, data] of this.yieldCache.entries()) {
            if ((now - data.updatedAt) > threshold) {
                this.yieldCache.delete(key);
            }
        }
    }

    /**
     * Update metrics
     */
    updateMetrics(type) {
        if (this.metrics[type] !== undefined) {
            this.metrics[type]++;
        }
        
        this.emit('activity', { type, service: 'dataFeeds' });
    }

    /**
     * Get health status
     */
    async getHealthStatus() {
        const totalFeeds = Object.values(this.dataFeeds).reduce((sum, feeds) => sum + Object.keys(feeds).length, 0);
        const cacheSize = this.priceCache.size + this.yieldCache.size;
        
        return {
            status: totalFeeds > 0 ? 'healthy' : 'degraded',
            totalFeeds,
            cacheSize,
            metrics: this.metrics,
            timestamp: Date.now()
        };
    }

    /**
     * Utility functions
     */
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
                console.error(`Error in DataFeed event listener for ${event}:`, error);
            }
        });
    }

    /**
     * Restart service
     */
    async restart() {
        console.log('🔄 Restarting Data Feed service...');
        await this.shutdown();
        await this.initialize();
    }

    /**
     * Shutdown service
     */
    async shutdown() {
        // Clear all intervals
        for (const interval of this.updateIntervals.values()) {
            clearInterval(interval);
        }
        this.updateIntervals.clear();
        
        // Clear caches
        this.priceCache.clear();
        this.yieldCache.clear();
        
        this.isInitialized = false;
        console.log('🔌 Data Feed service shutdown complete');
    }
}

export default DataFeedService; 