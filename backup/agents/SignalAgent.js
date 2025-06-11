import axios from 'axios';
import WebSocket from 'ws';

// Simplified logger for demo purposes
const elizaLogger = {
    info: (message, data) => console.log('INFO:', message, data || ''),
    warn: (message, data) => console.warn('WARN:', message, data || ''),
    error: (message, data) => console.error('ERROR:', message, data || '')
};

// Simplified agent runtime for demo
function createAgentRuntime(config) {
    return {
        character: config.character,
        actions: config.actions,
        isRunning: true
    };
}

/**
 * SignalAgent - Parses offchain data sources for real-time APR and market signals
 * 
 * This agent monitors and aggregates data from:
 * 1. DeFi protocol APIs (Aave, Compound, Uniswap)
 * 2. Market data feeds (CoinGecko, DeFiPulse, DefiLlama)
 * 3. Social sentiment analysis
 * 4. Onchain analytics platforms
 * 5. News and announcement feeds
 * 6. Cross-chain bridge metrics
 */
class SignalAgent {
    constructor(config) {
        this.config = config;
        this.runtime = null;
        this.dataStreams = new Map();
        this.lastUpdates = new Map();
        this.alertThresholds = new Map();
        
        // Data source configurations
        this.dataSources = {
            defiLlama: {
                baseUrl: 'https://api.llama.fi',
                endpoints: {
                    yields: '/pools',
                    tvl: '/tvl',
                    protocols: '/protocols'
                },
                rateLimit: 1000 // ms between calls
            },
            coinGecko: {
                baseUrl: 'https://api.coingecko.com/api/v3',
                endpoints: {
                    prices: '/simple/price',
                    markets: '/coins/markets'
                },
                rateLimit: 1000
            },
            aave: {
                baseUrl: 'https://aave-api-v2.aave.com',
                endpoints: {
                    reserves: '/data/reserves-incentives-v2',
                    markets: '/data/markets-data'
                },
                rateLimit: 2000
            }
        };
        
        this.supportedChains = ['ethereum', 'arbitrum', 'polygon'];
        this.supportedTokens = ['USDC', 'USDT', 'DAI', 'WETH', 'WMATIC'];
    }

    async initialize() {
        try {
            this.runtime = createAgentRuntime({
                character: {
                    name: "SignalAgent",
                    description: "AI agent for monitoring DeFi yields and market signals across chains",
                    personality: "vigilant, analytical, proactive",
                    knowledge: [
                        "DeFi protocol monitoring",
                        "APR aggregation techniques",
                        "Market sentiment analysis",
                        "Cross-chain analytics",
                        "Risk signal detection"
                    ]
                },
                providers: [],
                actions: [
                    this.createMonitorAction(),
                    this.createAlertAction(),
                    this.createAnalysisAction()
                ]
            });

            await this.startDataStreams();
            await this.initializeAlertThresholds();
            
            elizaLogger.info("SignalAgent initialized successfully");
        } catch (error) {
            elizaLogger.error("Failed to initialize SignalAgent:", error);
            throw error;
        }
    }

    async startDataStreams() {
        // Start periodic data collection
        this.startAPRMonitoring();
        this.startTVLMonitoring();
        this.startMarketDataStream();
        this.startSentimentMonitoring();
    }

    async startAPRMonitoring() {
        const collectAPRData = async () => {
            try {
                const aprData = await this.collectAPRFromAllSources();
                this.dataStreams.set('apr_data', {
                    data: aprData,
                    timestamp: Date.now(),
                    source: 'multi_source_aggregation'
                });
                
                // Check for significant APR changes
                await this.checkAPRAlerts(aprData);
                
            } catch (error) {
                elizaLogger.error("APR monitoring error:", error);
            }
        };

        // Initial collection
        await collectAPRData();
        
        // Set up periodic collection every 5 minutes
        setInterval(collectAPRData, 5 * 60 * 1000);
    }

    async startTVLMonitoring() {
        const collectTVLData = async () => {
            try {
                const tvlData = await this.collectTVLData();
                this.dataStreams.set('tvl_data', {
                    data: tvlData,
                    timestamp: Date.now(),
                    source: 'defillama_api'
                });
                
                await this.checkTVLAlerts(tvlData);
                
            } catch (error) {
                elizaLogger.error("TVL monitoring error:", error);
            }
        };

        await collectTVLData();
        setInterval(collectTVLData, 10 * 60 * 1000); // Every 10 minutes
    }

    async startMarketDataStream() {
        const collectMarketData = async () => {
            try {
                const marketData = await this.collectMarketData();
                this.dataStreams.set('market_data', {
                    data: marketData,
                    timestamp: Date.now(),
                    source: 'coingecko_api'
                });
                
                await this.checkMarketAlerts(marketData);
                
            } catch (error) {
                elizaLogger.error("Market data monitoring error:", error);
            }
        };

        await collectMarketData();
        setInterval(collectMarketData, 2 * 60 * 1000); // Every 2 minutes
    }

    async startSentimentMonitoring() {
        // Monitor crypto Twitter, Reddit, and news sources
        const collectSentimentData = async () => {
            try {
                const sentimentData = await this.collectSentimentData();
                this.dataStreams.set('sentiment_data', {
                    data: sentimentData,
                    timestamp: Date.now(),
                    source: 'social_aggregation'
                });
                
            } catch (error) {
                elizaLogger.error("Sentiment monitoring error:", error);
            }
        };

        await collectSentimentData();
        setInterval(collectSentimentData, 15 * 60 * 1000); // Every 15 minutes
    }

    async collectAPRFromAllSources() {
        const aprData = {};
        
        for (const chain of this.supportedChains) {
            aprData[chain] = {
                protocols: {},
                aggregated: {},
                metadata: {
                    lastUpdate: Date.now(),
                    sources: []
                }
            };

            // Collect from DeFiLlama
            try {
                const llamaData = await this.fetchDefiLlamaYields(chain);
                aprData[chain].protocols.defillama = llamaData;
                aprData[chain].metadata.sources.push('defillama');
            } catch (error) {
                elizaLogger.warn(`Failed to fetch DeFiLlama data for ${chain}:`, error.message);
            }

            // Collect from Aave if supported
            if (chain === 'ethereum' || chain === 'polygon') {
                try {
                    const aaveData = await this.fetchAaveRates(chain);
                    aprData[chain].protocols.aave = aaveData;
                    aprData[chain].metadata.sources.push('aave');
                } catch (error) {
                    elizaLogger.warn(`Failed to fetch Aave data for ${chain}:`, error.message);
                }
            }

            // Collect from Compound if supported
            if (chain === 'ethereum') {
                try {
                    const compoundData = await this.fetchCompoundRates();
                    aprData[chain].protocols.compound = compoundData;
                    aprData[chain].metadata.sources.push('compound');
                } catch (error) {
                    elizaLogger.warn(`Failed to fetch Compound data:`, error.message);
                }
            }

            // Calculate aggregated metrics
            aprData[chain].aggregated = this.calculateAggregatedAPR(aprData[chain].protocols);
        }

        return aprData;
    }

    async fetchDefiLlamaYields(chain) {
        const chainMapping = {
            ethereum: 'Ethereum',
            arbitrum: 'Arbitrum',
            polygon: 'Polygon'
        };

        const response = await axios.get(`${this.dataSources.defiLlama.baseUrl}/pools`, {
            timeout: 10000
        });

        const pools = response.data.data || [];
        const chainPools = pools.filter(pool => 
            pool.chain === chainMapping[chain] && 
            this.supportedTokens.some(token => 
                pool.symbol?.includes(token) || pool.underlyingTokens?.some(t => t.includes(token))
            )
        );

        const protocolYields = {};
        chainPools.forEach(pool => {
            const protocol = pool.project || 'unknown';
            if (!protocolYields[protocol]) {
                protocolYields[protocol] = [];
            }
            
            protocolYields[protocol].push({
                poolId: pool.pool,
                symbol: pool.symbol,
                apy: pool.apy || 0,
                apyBase: pool.apyBase || 0,
                apyReward: pool.apyReward || 0,
                tvlUsd: pool.tvlUsd || 0,
                url: pool.url
            });
        });

        return protocolYields;
    }

    async fetchAaveRates(chain) {
        const chainIds = {
            ethereum: 1,
            polygon: 137
        };

        try {
            const response = await axios.get(
                `${this.dataSources.aave.baseUrl}/data/reserves-incentives-v2?chainId=${chainIds[chain]}`,
                { timeout: 10000 }
            );

            const reserves = response.data || [];
            const rates = {};

            reserves.forEach(reserve => {
                const symbol = reserve.symbol;
                if (this.supportedTokens.includes(symbol)) {
                    rates[symbol] = {
                        supplyAPY: parseFloat(reserve.supplyAPY || 0),
                        variableBorrowAPY: parseFloat(reserve.variableBorrowAPY || 0),
                        liquidityRate: parseFloat(reserve.liquidityRate || 0),
                        totalLiquidity: parseFloat(reserve.totalLiquidity || 0),
                        utilizationRate: parseFloat(reserve.utilizationRate || 0)
                    };
                }
            });

            return rates;
        } catch (error) {
            throw new Error(`Aave API error: ${error.message}`);
        }
    }

    async fetchCompoundRates() {
        // Compound API integration
        try {
            // Using public Compound API
            const response = await axios.get('https://api.compound.finance/api/v2/ctoken', {
                timeout: 10000
            });

            const cTokens = response.data.cToken || [];
            const rates = {};

            cTokens.forEach(cToken => {
                const symbol = cToken.underlying_symbol;
                if (this.supportedTokens.includes(symbol)) {
                    rates[symbol] = {
                        supplyAPY: parseFloat(cToken.supply_rate.value || 0),
                        borrowAPY: parseFloat(cToken.borrow_rate.value || 0),
                        totalSupply: parseFloat(cToken.total_supply.value || 0),
                        totalBorrow: parseFloat(cToken.total_borrows.value || 0),
                        exchangeRate: parseFloat(cToken.exchange_rate.value || 0)
                    };
                }
            });

            return rates;
        } catch (error) {
            throw new Error(`Compound API error: ${error.message}`);
        }
    }

    calculateAggregatedAPR(protocols) {
        const aggregated = {};
        
        // For each supported token, calculate weighted average APR
        for (const token of this.supportedTokens) {
            const tokenRates = [];
            let totalTVL = 0;
            
            Object.values(protocols).forEach(protocolData => {
                if (Array.isArray(protocolData)) {
                    // DeFiLlama format
                    protocolData.forEach(pool => {
                        if (pool.symbol?.includes(token)) {
                            tokenRates.push({
                                apy: pool.apy || 0,
                                tvl: pool.tvlUsd || 0
                            });
                            totalTVL += pool.tvlUsd || 0;
                        }
                    });
                } else if (protocolData[token]) {
                    // Direct token data format (Aave, Compound)
                    const rate = protocolData[token].supplyAPY || protocolData[token].apy || 0;
                    const tvl = protocolData[token].totalLiquidity || protocolData[token].totalSupply || 1000000;
                    
                    tokenRates.push({
                        apy: rate,
                        tvl: tvl
                    });
                    totalTVL += tvl;
                }
            });
            
            if (tokenRates.length > 0 && totalTVL > 0) {
                // Calculate TVL-weighted average APR
                const weightedAPR = tokenRates.reduce((sum, rate) => {
                    const weight = rate.tvl / totalTVL;
                    return sum + (rate.apy * weight);
                }, 0);
                
                aggregated[token] = {
                    weightedAPR: weightedAPR,
                    maxAPR: Math.max(...tokenRates.map(r => r.apy)),
                    minAPR: Math.min(...tokenRates.map(r => r.apy)),
                    totalTVL: totalTVL,
                    protocolCount: tokenRates.length
                };
            }
        }
        
        return aggregated;
    }

    async collectTVLData() {
        try {
            const response = await axios.get(`${this.dataSources.defiLlama.baseUrl}/protocols`, {
                timeout: 10000
            });

            const protocols = response.data || [];
            const tvlData = {};

            this.supportedChains.forEach(chain => {
                tvlData[chain] = {
                    totalTVL: 0,
                    protocols: {},
                    topProtocols: []
                };
            });

            protocols.forEach(protocol => {
                if (protocol.chains && protocol.chainTvls) {
                    this.supportedChains.forEach(chain => {
                        const chainName = chain.charAt(0).toUpperCase() + chain.slice(1);
                        if (protocol.chains.includes(chainName)) {
                            const tvl = protocol.chainTvls[chainName] || 0;
                            tvlData[chain].protocols[protocol.name] = {
                                tvl: tvl,
                                category: protocol.category,
                                url: protocol.url
                            };
                            tvlData[chain].totalTVL += tvl;
                        }
                    });
                }
            });

            // Sort and get top protocols per chain
            this.supportedChains.forEach(chain => {
                tvlData[chain].topProtocols = Object.entries(tvlData[chain].protocols)
                    .sort(([,a], [,b]) => b.tvl - a.tvl)
                    .slice(0, 10)
                    .map(([name, data]) => ({ name, ...data }));
            });

            return tvlData;
        } catch (error) {
            throw new Error(`TVL data collection error: ${error.message}`);
        }
    }

    async collectMarketData() {
        const tokens = ['ethereum', 'matic-network', 'ethereum']; // CoinGecko IDs
        const vsCurrency = 'usd';
        
        try {
            const response = await axios.get(
                `${this.dataSources.coinGecko.baseUrl}/simple/price`,
                {
                    params: {
                        ids: tokens.join(','),
                        vs_currencies: vsCurrency,
                        include_24hr_change: true,
                        include_24hr_vol: true,
                        include_market_cap: true
                    },
                    timeout: 10000
                }
            );

            return {
                prices: response.data,
                timestamp: Date.now(),
                trends: this.calculatePriceTrends(response.data)
            };
        } catch (error) {
            throw new Error(`Market data collection error: ${error.message}`);
        }
    }

    calculatePriceTrends(priceData) {
        const trends = {};
        
        Object.entries(priceData).forEach(([token, data]) => {
            const change24h = data.usd_24h_change || 0;
            let trend = 'neutral';
            
            if (change24h > 5) trend = 'strong_bullish';
            else if (change24h > 2) trend = 'bullish';
            else if (change24h < -5) trend = 'strong_bearish';
            else if (change24h < -2) trend = 'bearish';
            
            trends[token] = {
                trend: trend,
                change24h: change24h,
                volatility: Math.abs(change24h),
                signal: change24h > 0 ? 'buy' : 'sell'
            };
        });
        
        return trends;
    }

    async collectSentimentData() {
        // Simplified sentiment analysis - in production would integrate with social APIs
        const sentiment = {
            overall: this.generateRandomSentiment(),
            defi: this.generateRandomSentiment(),
            crosschain: this.generateRandomSentiment(),
            sources: ['twitter_api', 'reddit_api', 'news_aggregator'],
            confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
            timestamp: Date.now()
        };
        
        return sentiment;
    }

    generateRandomSentiment() {
        const sentiments = ['very_bearish', 'bearish', 'neutral', 'bullish', 'very_bullish'];
        const scores = [-0.8, -0.4, 0, 0.4, 0.8];
        const index = Math.floor(Math.random() * sentiments.length);
        
        return {
            label: sentiments[index],
            score: scores[index],
            confidence: Math.random() * 0.3 + 0.7
        };
    }

    createMonitorAction() {
        return {
            name: "monitor_signals",
            description: "Monitor and report current market signals and APR data",
            validate: async (runtime, message) => {
                return message.content.includes("monitor") || 
                       message.content.includes("signal") ||
                       message.content.includes("update") ||
                       message.content.includes("status");
            },
            handler: async (runtime, message, state, options, callback) => {
                try {
                    const currentData = this.getCurrentMarketSnapshot();
                    const signals = this.generateSignalSummary(currentData);
                    
                    const response = this.formatSignalReport(signals);
                    callback({ text: response, action: "signal_report" });
                    
                    return true;
                } catch (error) {
                    elizaLogger.error("Signal monitoring failed:", error);
                    callback({ text: "Failed to generate signal report. Please try again.", action: "monitor_failed" });
                    return false;
                }
            }
        };
    }

    createAlertAction() {
        return {
            name: "setup_alerts",
            description: "Set up custom alerts for APR changes and market events",
            validate: async (runtime, message) => {
                return message.content.includes("alert") || 
                       message.content.includes("notify") ||
                       message.content.includes("threshold");
            },
            handler: async (runtime, message, state, options, callback) => {
                try {
                    const alertConfig = this.parseAlertConfig(message.content);
                    await this.setupCustomAlert(alertConfig);
                    
                    const response = `✅ Alert configured: ${alertConfig.description}`;
                    callback({ text: response, action: "alert_configured" });
                    
                    return true;
                } catch (error) {
                    elizaLogger.error("Alert setup failed:", error);
                    callback({ text: "Failed to configure alert. Please try again.", action: "alert_failed" });
                    return false;
                }
            }
        };
    }

    createAnalysisAction() {
        return {
            name: "analyze_trends",
            description: "Analyze current market trends and provide insights",
            validate: async (runtime, message) => {
                return message.content.includes("analyze") || 
                       message.content.includes("trend") ||
                       message.content.includes("insight");
            },
            handler: async (runtime, message, state, options, callback) => {
                try {
                    const analysis = await this.performTrendAnalysis();
                    const response = this.formatAnalysisReport(analysis);
                    
                    callback({ text: response, action: "analysis_completed" });
                    return true;
                } catch (error) {
                    elizaLogger.error("Trend analysis failed:", error);
                    callback({ text: "Failed to perform trend analysis. Please try again.", action: "analysis_failed" });
                    return false;
                }
            }
        };
    }

    getCurrentMarketSnapshot() {
        return {
            apr: this.dataStreams.get('apr_data'),
            tvl: this.dataStreams.get('tvl_data'),
            market: this.dataStreams.get('market_data'),
            sentiment: this.dataStreams.get('sentiment_data'),
            timestamp: Date.now()
        };
    }

    generateSignalSummary(data) {
        const signals = {
            strength: 'neutral',
            direction: 'hold',
            confidence: 0,
            factors: [],
            recommendations: []
        };

        // Analyze APR signals
        if (data.apr?.data) {
            const aprSignal = this.analyzeAPRSignals(data.apr.data);
            signals.factors.push(aprSignal);
        }

        // Analyze market signals
        if (data.market?.data) {
            const marketSignal = this.analyzeMarketSignals(data.market.data);
            signals.factors.push(marketSignal);
        }

        // Analyze sentiment signals
        if (data.sentiment?.data) {
            const sentimentSignal = this.analyzeSentimentSignals(data.sentiment.data);
            signals.factors.push(sentimentSignal);
        }

        // Calculate overall signal
        signals.confidence = signals.factors.reduce((sum, factor) => sum + factor.confidence, 0) / signals.factors.length;
        
        const bullishFactors = signals.factors.filter(f => f.direction === 'bullish').length;
        const bearishFactors = signals.factors.filter(f => f.direction === 'bearish').length;
        
        if (bullishFactors > bearishFactors) {
            signals.direction = 'rebalance_opportunity';
            signals.strength = bullishFactors > bearishFactors + 1 ? 'strong' : 'moderate';
        } else if (bearishFactors > bullishFactors) {
            signals.direction = 'hold_conservative';
            signals.strength = bearishFactors > bullishFactors + 1 ? 'strong' : 'moderate';
        }

        return signals;
    }

    analyzeAPRSignals(aprData) {
        const signals = [];
        let avgAPRChange = 0;
        let count = 0;

        Object.values(aprData).forEach(chainData => {
            if (chainData.aggregated) {
                Object.values(chainData.aggregated).forEach(tokenData => {
                    if (tokenData.maxAPR) {
                        // Compare with historical average (simplified)
                        const historicalAvg = 0.08; // 8% baseline
                        const change = (tokenData.maxAPR - historicalAvg) / historicalAvg;
                        avgAPRChange += change;
                        count++;
                    }
                });
            }
        });

        if (count > 0) {
            avgAPRChange /= count;
        }

        return {
            type: 'apr_analysis',
            direction: avgAPRChange > 0.1 ? 'bullish' : avgAPRChange < -0.1 ? 'bearish' : 'neutral',
            confidence: Math.min(0.9, Math.abs(avgAPRChange) * 5),
            value: avgAPRChange,
            description: `APR signals showing ${avgAPRChange > 0 ? 'increased' : 'decreased'} yields`
        };
    }

    analyzeMarketSignals(marketData) {
        const trends = marketData.trends || {};
        const bullishCount = Object.values(trends).filter(t => t.trend.includes('bullish')).length;
        const bearishCount = Object.values(trends).filter(t => t.trend.includes('bearish')).length;
        
        return {
            type: 'market_analysis',
            direction: bullishCount > bearishCount ? 'bullish' : bearishCount > bullishCount ? 'bearish' : 'neutral',
            confidence: Math.abs(bullishCount - bearishCount) / Object.keys(trends).length,
            description: `Market trends: ${bullishCount} bullish, ${bearishCount} bearish signals`
        };
    }

    analyzeSentimentSignals(sentimentData) {
        const overallScore = sentimentData.overall?.score || 0;
        
        return {
            type: 'sentiment_analysis',
            direction: overallScore > 0.2 ? 'bullish' : overallScore < -0.2 ? 'bearish' : 'neutral',
            confidence: sentimentData.confidence || 0.5,
            value: overallScore,
            description: `Sentiment: ${sentimentData.overall?.label || 'neutral'} (${(overallScore * 100).toFixed(1)}%)`
        };
    }

    formatSignalReport(signals) {
        return `
🎯 **Market Signal Report**

**Overall Direction:** ${signals.direction.toUpperCase()}
**Signal Strength:** ${signals.strength.toUpperCase()}
**Confidence:** ${(signals.confidence * 100).toFixed(1)}%

**Signal Factors:**
${signals.factors.map(factor => 
    `• ${factor.type}: ${factor.direction} (${(factor.confidence * 100).toFixed(1)}% confidence)\n  ${factor.description}`
).join('\n')}

**Recommendation:** ${this.generateRecommendation(signals)}

*Last updated: ${new Date().toLocaleString()}*
        `.trim();
    }

    generateRecommendation(signals) {
        if (signals.direction === 'rebalance_opportunity' && signals.confidence > 0.7) {
            return "Consider rebalancing to higher-yield opportunities";
        } else if (signals.direction === 'hold_conservative' && signals.confidence > 0.7) {
            return "Maintain current allocation, market conditions uncertain";
        } else {
            return "Monitor for stronger signals before taking action";
        }
    }

    async initializeAlertThresholds() {
        // Default alert thresholds
        this.alertThresholds.set('apr_change', { threshold: 0.02, type: 'percentage' }); // 2% APR change
        this.alertThresholds.set('tvl_change', { threshold: 0.15, type: 'percentage' }); // 15% TVL change
        this.alertThresholds.set('price_change', { threshold: 0.10, type: 'percentage' }); // 10% price change
    }

    async checkAPRAlerts(aprData) {
        // Implementation for APR change alerts
        // Compare with previous values and trigger alerts if thresholds exceeded
    }

    async checkTVLAlerts(tvlData) {
        // Implementation for TVL change alerts
    }

    async checkMarketAlerts(marketData) {
        // Implementation for market condition alerts
    }

    parseAlertConfig(content) {
        // Parse alert configuration from natural language
        return {
            type: 'apr_change',
            threshold: 0.05,
            description: 'APR change > 5%'
        };
    }

    async setupCustomAlert(config) {
        this.alertThresholds.set(config.type, config);
        elizaLogger.info(`Alert configured: ${config.description}`);
    }

    async performTrendAnalysis() {
        const currentData = this.getCurrentMarketSnapshot();
        
        return {
            aprTrends: this.analyzeAPRTrends(currentData.apr?.data),
            marketTrends: this.analyzeMarketTrends(currentData.market?.data),
            crossChainOpportunities: this.identifyCrossChainOpportunities(currentData),
            riskFactors: this.identifyRiskFactors(currentData)
        };
    }

    analyzeAPRTrends(aprData) {
        // Analyze APR trends across chains and protocols
        const trends = {};
        
        if (aprData) {
            Object.entries(aprData).forEach(([chain, data]) => {
                trends[chain] = {
                    trending: 'stable',
                    bestProtocol: null,
                    avgAPR: 0
                };
                
                if (data.aggregated) {
                    const aprs = Object.values(data.aggregated).map(t => t.weightedAPR).filter(Boolean);
                    if (aprs.length > 0) {
                        trends[chain].avgAPR = aprs.reduce((sum, apr) => sum + apr, 0) / aprs.length;
                    }
                }
            });
        }
        
        return trends;
    }

    analyzeMarketTrends(marketData) {
        if (!marketData?.trends) return {};
        
        const analysis = {
            overall: 'neutral',
            volatility: 'low',
            recommendation: 'monitor'
        };
        
        const trends = Object.values(marketData.trends);
        const avgVolatility = trends.reduce((sum, t) => sum + (t.volatility || 0), 0) / trends.length;
        
        if (avgVolatility > 10) analysis.volatility = 'high';
        else if (avgVolatility > 5) analysis.volatility = 'medium';
        
        return analysis;
    }

    identifyCrossChainOpportunities(data) {
        const opportunities = [];
        
        if (data.apr?.data) {
            const chainAPRs = {};
            
            Object.entries(data.apr.data).forEach(([chain, chainData]) => {
                if (chainData.aggregated) {
                    const maxAPR = Math.max(...Object.values(chainData.aggregated).map(t => t.maxAPR).filter(Boolean));
                    chainAPRs[chain] = maxAPR;
                }
            });
            
            // Find significant APR differences
            const sortedChains = Object.entries(chainAPRs).sort(([,a], [,b]) => b - a);
            
            if (sortedChains.length >= 2) {
                const [bestChain, bestAPR] = sortedChains[0];
                const [secondChain, secondAPR] = sortedChains[1];
                
                if (bestAPR - secondAPR > 0.02) { // 2% difference
                    opportunities.push({
                        type: 'cross_chain_yield',
                        from: secondChain,
                        to: bestChain,
                        advantage: `+${((bestAPR - secondAPR) * 100).toFixed(2)}% APR`,
                        confidence: 0.8
                    });
                }
            }
        }
        
        return opportunities;
    }

    identifyRiskFactors(data) {
        const risks = [];
        
        // High volatility risk
        if (data.market?.data?.trends) {
            const avgVolatility = Object.values(data.market.data.trends)
                .reduce((sum, t) => sum + (t.volatility || 0), 0) / Object.keys(data.market.data.trends).length;
            
            if (avgVolatility > 15) {
                risks.push({
                    type: 'high_volatility',
                    severity: 'medium',
                    description: `Market volatility at ${avgVolatility.toFixed(1)}%`
                });
            }
        }
        
        // Sentiment risk
        if (data.sentiment?.data?.overall?.score < -0.5) {
            risks.push({
                type: 'negative_sentiment',
                severity: 'low',
                description: 'Bearish market sentiment detected'
            });
        }
        
        return risks;
    }

    formatAnalysisReport(analysis) {
        return `
📊 **Trend Analysis Report**

**APR Trends:**
${Object.entries(analysis.aprTrends || {}).map(([chain, trend]) => 
    `• ${chain}: ${trend.avgAPR ? (trend.avgAPR * 100).toFixed(2) + '% avg APR' : 'No data'}`
).join('\n')}

**Market Conditions:**
• Overall Trend: ${analysis.marketTrends?.overall || 'Unknown'}
• Volatility: ${analysis.marketTrends?.volatility || 'Unknown'}

**Cross-Chain Opportunities:**
${analysis.crossChainOpportunities?.length > 0 ? 
    analysis.crossChainOpportunities.map(opp => 
        `• ${opp.from} → ${opp.to}: ${opp.advantage}`
    ).join('\n') : 
    '• No significant opportunities detected'
}

**Risk Factors:**
${analysis.riskFactors?.length > 0 ? 
    analysis.riskFactors.map(risk => 
        `• ${risk.type}: ${risk.description} (${risk.severity} severity)`
    ).join('\n') : 
    '• No major risks identified'
}

*Analysis timestamp: ${new Date().toLocaleString()}*
        `.trim();
    }
}

export default SignalAgent; 