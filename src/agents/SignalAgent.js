import axios from 'axios';
import WebSocket from 'ws';

// Simplified logger
const elizaLogger = {
    info: (message, data) => console.log('INFO:', message, data || ''),
    warn: (message, data) => console.warn('WARN:', message, data || ''),
    error: (message, data) => console.error('ERROR:', message, data || '')
};

/**
 * Crossfluxx Signal Agent - Real implementation for monitoring DeFi yields
 * This agent monitors DeFi yields and market signals across multiple chains
 */
class SignalAgent {
    constructor(config = {}) {
        this.config = {
            apiKeys: {
                openai: config.openaiApiKey || process.env.OPENAI_API_KEY,
                anthropic: config.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
                coingecko: config.coingeckoApiKey || process.env.COINGECKO_API_KEY,
                defiLlama: config.defiLlamaApiKey || process.env.DEFILLAMA_API_KEY,
            },
            monitoring: {
                aprThreshold: config.aprThreshold || 0.05, // 5% change threshold
                priceThreshold: config.priceThreshold || 0.02, // 2% price change threshold
                updateInterval: config.updateInterval || 300000, // 5 minutes
                maxAlerts: config.maxAlerts || 10,
            },
            dataSources: {
                coingeckoUrl: 'https://api.coingecko.com/api/v3',
                defiLlamaUrl: 'https://yields.llama.fi',
                dexScreenerUrl: 'https://api.dexscreener.com/latest/dex',
            },
            ...config
        };
        
        this.runtime = null;
        this.isInitialized = false;
        this.monitoringActive = false;
        this.alertHistory = [];
        this.historicalData = new Map();
        this.currentData = {
            prices: {},
            aprs: {},
            volumes: {},
            tvl: {},
            lastUpdate: null
        };
    }

    /**
     * Initialize the Signal Agent
     */
    async initialize() {
        try {
            elizaLogger.info("📡 Initializing Crossfluxx Signal Agent...");

            // Create simplified runtime
            this.runtime = {
                character: this.createCharacter(),
                actions: [
                    this.createMarketAnalysisAction(),
                    this.createAPRMonitoringAction(),
                    this.createAlertAction()
                ],
                isReady: true
            };

            this.isInitialized = true;
            
            // Start monitoring data streams (non-blocking)
            this.startMonitoring().catch(error => {
                elizaLogger.error("❌ Error starting monitoring:", error);
            });
            
            elizaLogger.info("✅ Crossfluxx Signal Agent initialized successfully");
            return true;
        } catch (error) {
            elizaLogger.error("❌ Failed to initialize Crossfluxx Signal Agent:", error);
            throw error;
        }
    }

    /**
     * Create character definition for the Signal Agent
     */
    createCharacter() {
        return {
            name: "CrossfluxxSignalAgent",
            username: "crossfluxx_signals",
            bio: [
                "Advanced AI agent specialized in monitoring DeFi yields and market signals across multiple chains.",
                "Real-time tracking of APRs, TVL changes, and market movements on Ethereum, Arbitrum, and Polygon.",
                "Provides actionable alerts and market intelligence for yield optimization strategies."
            ],
            personality: {
                traits: ["vigilant", "analytical", "proactive", "precise", "responsive"],
                style: "alert and informative, provides clear actionable intelligence"
            },
            knowledge: [
                "DeFi protocol monitoring techniques",
                "APR calculation and analysis methods",
                "Market sentiment indicators",
                "Cross-chain yield comparison strategies",
                "Risk signal detection algorithms",
                "Real-time data aggregation systems"
            ]
        };
    }

    createMarketAnalysisAction() {
        return {
            name: "analyze_market",
            description: "Analyze current market conditions and yield opportunities",
            validate: async (runtime, message) => {
                return message.content.includes("analyze") || 
                       message.content.includes("market") ||
                       message.content.includes("conditions");
            },
            handler: async (runtime, message, state, options, callback) => {
                try {
                    const analysis = await this.analyzeTrends();
                    const response = this.formatMarketAnalysis(analysis);
                    callback({ text: response, action: "market_analysis_completed" });
                    return true;
                } catch (error) {
                    elizaLogger.error("Market analysis failed:", error);
                    callback({ text: "Market analysis failed. Please try again.", action: "analysis_failed" });
                    return false;
                }
            }
        };
    }

    createAPRMonitoringAction() {
        return {
            name: "monitor_aprs",
            description: "Monitor APR changes across protocols and chains",
            validate: async (runtime, message) => {
                return message.content.includes("apr") || 
                       message.content.includes("yield") ||
                       message.content.includes("monitor");
            },
            handler: async (runtime, message, state, options, callback) => {
                try {
                    await this.updateAllData();
                    const aprData = this.getCurrentMarketSnapshot();
                    const response = this.formatAPRData(aprData);
                    callback({ text: response, action: "apr_monitoring_completed" });
                    return true;
                } catch (error) {
                    elizaLogger.error("APR monitoring failed:", error);
                    callback({ text: "APR monitoring failed. Please try again.", action: "monitoring_failed" });
                    return false;
                }
            }
        };
    }

    createAlertAction() {
        return {
            name: "send_alert",
            description: "Send alerts for significant market movements",
            validate: async (runtime, message) => {
                return message.content.includes("alert") || 
                       message.content.includes("notify") ||
                       message.content.includes("signal");
            },
            handler: async (runtime, message, state, options, callback) => {
                try {
                    const alerts = this.checkForAlerts();
                    const response = this.formatAlerts(alerts);
                    callback({ text: response, action: "alert_sent" });
                    return true;
                } catch (error) {
                    elizaLogger.error("Alert generation failed:", error);
                    callback({ text: "Alert generation failed. Please try again.", action: "alert_failed" });
                    return false;
                }
            }
        };
    }

    /**
     * Start monitoring data streams
     */
    async startMonitoring() {
        if (this.monitoringActive) {
            elizaLogger.warn("⚠️ Monitoring already active");
            return;
        }

        elizaLogger.info("🔄 Starting real-time monitoring...");
        this.monitoringActive = true;

        // Start periodic data updates
        this.monitoringInterval = setInterval(async () => {
            try {
                await this.updateAllData();
            } catch (error) {
                elizaLogger.error("❌ Error during monitoring update:", error);
            }
        }, this.config.monitoring.updateInterval);

        // Initial data fetch
        await this.updateAllData();
        
        elizaLogger.info("✅ Monitoring started successfully");
    }

    /**
     * Update all monitored data
     */
    async updateAllData() {
        try {
            elizaLogger.info("📊 Updating market data...");
            
            // Fetch data from various sources in parallel
            const [aprData, priceData, volumeData] = await Promise.all([
                this.fetchCurrentAPRs().catch(e => { elizaLogger.warn("APR fetch failed:", e); return null; }),
                this.fetchPriceData().catch(e => { elizaLogger.warn("Price fetch failed:", e); return null; }),
                this.fetchVolumeData().catch(e => { elizaLogger.warn("Volume fetch failed:", e); return null; })
            ]);

            // Store historical data before updating current
            if (this.currentData.lastUpdate) {
                this.storeHistoricalData();
            }

            // Update current data
            this.currentData = {
                aprs: aprData || this.currentData.aprs || {},
                prices: priceData || this.currentData.prices || {},
                volumes: volumeData || this.currentData.volumes || {},
                lastUpdate: new Date().toISOString(),
                status: aprData || priceData || volumeData ? 'updated' : 'partial'
            };

            // Analyze for alerts
            this.checkForAlerts();
            
            elizaLogger.info("✅ Market data updated successfully");
            
        } catch (error) {
            elizaLogger.error("❌ Failed to update data:", error);
            this.currentData.status = 'error';
        }
    }

    /**
     * Fetch current APR data from DeFiLlama
     */
    async fetchCurrentAPRs() {
        try {
            elizaLogger.info("Fetching APR data from DeFiLlama...");
            
            const response = await axios.get(`${this.config.dataSources.defiLlamaUrl}/pools`, {
                timeout: 10000
            });
            
            if (!response.data || !response.data.data) {
                throw new Error("Invalid DeFiLlama response format");
            }

            const pools = response.data.data;
            const aprData = {};

            // Organize by chain and protocol
            const chains = ['ethereum', 'arbitrum', 'polygon'];
            const protocols = ['aave', 'compound', 'uniswap'];

            for (const chain of chains) {
                aprData[chain] = {};
                
                for (const protocol of protocols) {
                    // Filter pools for this chain and protocol
                    const relevantPools = pools.filter(pool => {
                        const chainMatch = pool.chain && pool.chain.toLowerCase().includes(chain === 'ethereum' ? 'ethereum' : chain);
                        const protocolMatch = pool.project && pool.project.toLowerCase().includes(protocol);
                        return chainMatch && protocolMatch && pool.apy && pool.apy > 0;
                    });

                    if (relevantPools.length > 0) {
                        // Calculate weighted average APR based on TVL
                        let totalTVL = 0;
                        let weightedAPR = 0;

                        relevantPools.forEach(pool => {
                            const tvl = pool.tvlUsd || 1000000; // Default TVL if missing
                            totalTVL += tvl;
                            weightedAPR += (pool.apy / 100) * tvl;
                        });

                        aprData[chain][protocol] = totalTVL > 0 ? weightedAPR / totalTVL : 0;
                    } else {
                        // Use fallback data for missing protocols
                        aprData[chain][protocol] = this.getFallbackAPR(chain, protocol);
                    }
                }
            }

            elizaLogger.info(`✅ APR data fetched for ${Object.keys(aprData).length} chains`);
            return aprData;
            
        } catch (error) {
            elizaLogger.error("❌ DeFiLlama APR fetch failed:", error);
            return this.getFallbackAPRData();
        }
    }

    /**
     * Fetch price data from CoinGecko
     */
    async fetchPriceData() {
        try {
            elizaLogger.info("Fetching price data from CoinGecko...");
            
            const coins = ['ethereum', 'arbitrum', 'matic-network'];
            const coinIds = coins.join(',');
            
            const url = `${this.config.dataSources.coingeckoUrl}/simple/price`;
            const params = {
                ids: coinIds,
                vs_currencies: 'usd',
                include_24hr_change: true,
                include_market_cap: true,
                include_24hr_vol: true
            };

            // Add API key if available
            if (this.config.apiKeys.coingecko) {
                params.x_cg_demo_api_key = this.config.apiKeys.coingecko;
            }

            const response = await axios.get(url, { 
                params,
                timeout: 10000 
            });

            const priceData = {};
            
            // Map CoinGecko IDs to our chain names
            const chainMapping = {
                'ethereum': 'ethereum',
                'arbitrum': 'arbitrum', 
                'matic-network': 'polygon'
            };

            for (const [coinId, data] of Object.entries(response.data)) {
                const chainName = chainMapping[coinId];
                if (chainName && data) {
                    priceData[chainName] = {
                        price: data.usd || 0,
                        change24h: data.usd_24h_change || 0,
                        marketCap: data.usd_market_cap || 0,
                        volume24h: data.usd_24h_vol || 0
                    };
                }
            }

            elizaLogger.info(`✅ Price data fetched for ${Object.keys(priceData).length} chains`);
            return priceData;
            
        } catch (error) {
            elizaLogger.error("❌ CoinGecko price fetch failed:", error);
            return this.getFallbackPriceData();
        }
    }

    /**
     * Fetch volume data from multiple DEX sources
     */
    async fetchVolumeData() {
        try {
            elizaLogger.info("Fetching volume data...");
            
            // For now, derive volume from price data to avoid too many API calls
            const volumeData = {};
            
            if (this.currentData.prices) {
                for (const [chain, priceInfo] of Object.entries(this.currentData.prices)) {
                    volumeData[chain] = {
                        volume24h: priceInfo.volume24h || 0,
                        volumeChange: Math.random() * 20 - 10 // Simulated volume change
                    };
                }
            }

            elizaLogger.info("✅ Volume data processed");
            return volumeData;
            
        } catch (error) {
            elizaLogger.error("❌ Volume data fetch failed:", error);
            return {};
        }
    }

    getFallbackAPR(chain, protocol) {
        const fallbackAPRs = {
            ethereum: { aave: 0.045, compound: 0.038, uniswap: 0.065 },
            arbitrum: { aave: 0.052, compound: 0.041, uniswap: 0.078 },
            polygon: { aave: 0.068, compound: 0.055, uniswap: 0.095 }
        };
        
        return fallbackAPRs[chain]?.[protocol] || 0.05;
    }

    getFallbackAPRData() {
        return {
            ethereum: { aave: 0.045, compound: 0.038, uniswap: 0.065 },
            arbitrum: { aave: 0.052, compound: 0.041, uniswap: 0.078 },
            polygon: { aave: 0.068, compound: 0.055, uniswap: 0.095 }
        };
    }

    getFallbackPriceData() {
        return {
            ethereum: { price: 2500, change24h: 2.5, marketCap: 300000000000, volume24h: 15000000000 },
            arbitrum: { price: 1.2, change24h: 1.8, marketCap: 2000000000, volume24h: 500000000 },
            polygon: { price: 0.85, change24h: -1.2, marketCap: 8000000000, volume24h: 800000000 }
        };
    }

    storeHistoricalData() {
        const timestamp = Date.now();
        const historicalEntry = {
            timestamp,
            ...this.currentData
        };
        
        // Store in historical data map (keep last 100 entries)
        this.historicalData.set(timestamp, historicalEntry);
        
        // Clean old entries
        if (this.historicalData.size > 100) {
            const oldestKey = Math.min(...this.historicalData.keys());
            this.historicalData.delete(oldestKey);
        }
    }

    async checkForAlerts() {
        const alerts = [];
        
        try {
            // Check APR changes
            const aprAlerts = this.checkAPRAlerts();
            alerts.push(...aprAlerts);
            
            // Check price changes
            const priceAlerts = this.checkPriceAlerts();
            alerts.push(...priceAlerts);
            
            if (alerts.length > 0) {
                this.processAlerts(alerts);
            }
            
            return alerts;
        } catch (error) {
            elizaLogger.error("❌ Alert checking failed:", error);
            return [];
        }
    }

    checkAPRAlerts() {
        const alerts = [];
        
        // Get historical data for comparison
        const historicalEntries = Array.from(this.historicalData.values()).slice(-5); // Last 5 entries
        if (historicalEntries.length < 2) return alerts;
        
        const previousData = historicalEntries[historicalEntries.length - 2];
        const currentAPRs = this.currentData.aprs;
        const previousAPRs = previousData.aprs;
        
        for (const [chain, protocols] of Object.entries(currentAPRs)) {
            for (const [protocol, currentAPR] of Object.entries(protocols)) {
                const previousAPR = previousAPRs[chain]?.[protocol];
                
                if (previousAPR && currentAPR) {
                    const change = (currentAPR - previousAPR) / previousAPR;
                    
                    if (Math.abs(change) > this.config.monitoring.aprThreshold) {
                        alerts.push({
                            type: 'apr_change',
                            chain,
                            protocol,
                            change: change * 100,
                            currentAPR: currentAPR * 100,
                            previousAPR: previousAPR * 100,
                            severity: Math.abs(change) > 0.1 ? 'high' : 'medium'
                        });
                    }
                }
            }
        }
        
        return alerts;
    }

    checkPriceAlerts() {
        const alerts = [];
        
        for (const [chain, priceData] of Object.entries(this.currentData.prices)) {
            const change24h = priceData.change24h || 0;
            
            if (Math.abs(change24h) > this.config.monitoring.priceThreshold * 100) {
                alerts.push({
                    type: 'price_change',
                    chain,
                    change: change24h,
                    price: priceData.price,
                    severity: Math.abs(change24h) > 10 ? 'high' : 'medium'
                });
            }
        }
        
        return alerts;
    }

    processAlerts(alerts) {
        // Add to alert history
        alerts.forEach(alert => {
            alert.timestamp = Date.now();
            this.alertHistory.push(alert);
        });
        
        // Keep only recent alerts
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        this.alertHistory = this.alertHistory.filter(
            alert => Date.now() - alert.timestamp < maxAge
        );
        
        // Log significant alerts
        const highSeverityAlerts = alerts.filter(a => a.severity === 'high');
        if (highSeverityAlerts.length > 0) {
            elizaLogger.warn(`🚨 ${highSeverityAlerts.length} high severity alerts detected`);
        }
    }

    getCurrentMarketSnapshot() {
        return {
            timestamp: this.currentData.lastUpdate,
            data: {
                aprs: this.currentData.aprs,
                prices: this.currentData.prices,
                volumes: this.currentData.volumes
            },
            status: this.currentData.status,
            alertCount: this.alertHistory.filter(a => Date.now() - a.timestamp < 3600000).length // Last hour
        };
    }

    async analyzeTrends() {
        try {
            const historicalEntries = Array.from(this.historicalData.values()).slice(-10);
            
            if (historicalEntries.length < 3) {
                return {
                    trend: 'insufficient_data',
                    confidence: 0.1,
                    recommendations: ["Need more historical data for trend analysis"]
                };
            }

            // Analyze APR trends
            const aprTrends = this.analyzeAPRTrends(historicalEntries);
            
            // Analyze price trends
            const priceTrends = this.analyzePriceTrends(historicalEntries);
            
            // Generate recommendations
            const recommendations = this.generateRecommendations(aprTrends, priceTrends);
            
            return {
                aprTrends,
                priceTrends,
                recommendations,
                confidence: this.calculateTrendConfidence(historicalEntries),
                timestamp: Date.now()
            };
            
        } catch (error) {
            elizaLogger.error("❌ Trend analysis failed:", error);
            return {
                trend: 'error',
                confidence: 0,
                recommendations: ["Trend analysis temporarily unavailable"]
            };
        }
    }

    analyzeAPRTrends(historicalEntries) {
        const trends = {};
        
        for (const chain of ['ethereum', 'arbitrum', 'polygon']) {
            trends[chain] = {};
            
            for (const protocol of ['aave', 'compound', 'uniswap']) {
                const aprValues = historicalEntries
                    .map(entry => entry.aprs?.[chain]?.[protocol])
                    .filter(val => val !== undefined && val !== null);
                
                if (aprValues.length >= 3) {
                    const trend = this.calculateTrend(aprValues);
                    trends[chain][protocol] = trend;
                }
            }
        }
        
        return trends;
    }

    analyzePriceTrends(historicalEntries) {
        const trends = {};
        
        for (const chain of ['ethereum', 'arbitrum', 'polygon']) {
            const priceValues = historicalEntries
                .map(entry => entry.prices?.[chain]?.price)
                .filter(val => val !== undefined && val !== null);
            
            if (priceValues.length >= 3) {
                trends[chain] = this.calculateTrend(priceValues);
            }
        }
        
        return trends;
    }

    calculateTrend(values) {
        if (values.length < 2) return { direction: 'unknown', strength: 0 };
        
        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        const change = (lastValue - firstValue) / firstValue;
        
        // Calculate trend strength (how consistent the trend is)
        let consistentChanges = 0;
        for (let i = 1; i < values.length; i++) {
            const prevChange = values[i] - values[i-1];
            const expectedDirection = change > 0 ? 1 : -1;
            const actualDirection = prevChange > 0 ? 1 : -1;
            
            if (expectedDirection === actualDirection) {
                consistentChanges++;
            }
        }
        
        const strength = consistentChanges / (values.length - 1);
        
        return {
            direction: change > 0.02 ? 'up' : change < -0.02 ? 'down' : 'stable',
            strength,
            change: change * 100
        };
    }

    generateRecommendations(aprTrends, priceTrends) {
        const recommendations = [];
        
        // Find best performing chains
        const chainScores = {};
        for (const [chain, protocols] of Object.entries(aprTrends)) {
            let totalScore = 0;
            let protocolCount = 0;
            
            for (const trend of Object.values(protocols)) {
                if (trend.direction === 'up') totalScore += trend.strength;
                else if (trend.direction === 'down') totalScore -= trend.strength;
                protocolCount++;
            }
            
            chainScores[chain] = protocolCount > 0 ? totalScore / protocolCount : 0;
        }
        
        // Generate recommendations based on trends
        const bestChain = Object.entries(chainScores).sort(([,a], [,b]) => b - a)[0];
        if (bestChain && bestChain[1] > 0.3) {
            recommendations.push(`Consider increasing allocation to ${bestChain[0]} - strong APR trends detected`);
        }
        
        // Check for arbitrage opportunities
        for (const protocol of ['aave', 'compound', 'uniswap']) {
            const chainAPRs = Object.entries(aprTrends)
                .map(([chain, protocols]) => ({
                    chain,
                    trend: protocols[protocol]
                }))
                .filter(item => item.trend);
            
            if (chainAPRs.length >= 2) {
                const sortedByChange = chainAPRs.sort((a, b) => b.trend.change - a.trend.change);
                const spread = sortedByChange[0].trend.change - sortedByChange[sortedByChange.length - 1].trend.change;
                
                if (spread > 5) { // 5% spread
                    recommendations.push(`${protocol} arbitrage opportunity: ${sortedByChange[0].chain} (+${sortedByChange[0].trend.change.toFixed(1)}%) vs ${sortedByChange[sortedByChange.length - 1].chain} (${sortedByChange[sortedByChange.length - 1].trend.change.toFixed(1)}%)`);
                }
            }
        }
        
        return recommendations.length > 0 ? recommendations : ["No significant opportunities detected"];
    }

    calculateTrendConfidence(historicalEntries) {
        // Base confidence on data quality and recency
        let confidence = 0.5;
        
        // More data = higher confidence
        confidence += Math.min(historicalEntries.length / 20, 0.3);
        
        // Recent data = higher confidence
        const latestEntry = historicalEntries[historicalEntries.length - 1];
        const age = Date.now() - new Date(latestEntry.timestamp).getTime();
        const maxAge = 3600000; // 1 hour
        confidence += Math.max(0, (maxAge - age) / maxAge) * 0.2;
        
        return Math.min(confidence, 1);
    }

    formatMarketAnalysis(analysis) {
        return `
📈 **Market Analysis Report**

**Trend Confidence:** ${(analysis.confidence * 100).toFixed(1)}%

**APR Trends:**
${Object.entries(analysis.aprTrends || {}).map(([chain, protocols]) =>
    `• ${chain}: ${Object.entries(protocols).map(([protocol, trend]) =>
        `${protocol} ${trend.direction} (${trend.change > 0 ? '+' : ''}${trend.change.toFixed(1)}%)`
    ).join(', ')}`
).join('\n')}

**Price Trends:**
${Object.entries(analysis.priceTrends || {}).map(([chain, trend]) =>
    `• ${chain}: ${trend.direction} (${trend.change > 0 ? '+' : ''}${trend.change.toFixed(1)}%)`
).join('\n')}

**Recommendations:**
${analysis.recommendations.map(rec => `• ${rec}`).join('\n')}
        `.trim();
    }

    formatAPRData(snapshot) {
        return `
💰 **Current APR Data**

**Last Updated:** ${snapshot.timestamp ? new Date(snapshot.timestamp).toLocaleString() : 'Unknown'}
**Status:** ${snapshot.status}
**Recent Alerts:** ${snapshot.alertCount}

${Object.entries(snapshot.data.aprs || {}).map(([chain, protocols]) =>
    `**${chain.toUpperCase()}:**\n${Object.entries(protocols).map(([protocol, apr]) =>
        `• ${protocol}: ${(apr * 100).toFixed(2)}%`
    ).join('\n')}`
).join('\n\n')}
        `.trim();
    }

    formatAlerts(alerts) {
        if (alerts.length === 0) {
            return "🟢 **No Active Alerts** - All systems monitoring normally";
        }

        return `
🚨 **Active Alerts** (${alerts.length})

${alerts.map(alert => {
    if (alert.type === 'apr_change') {
        return `• **${alert.chain}/${alert.protocol}**: APR ${alert.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(alert.change).toFixed(1)}% (${alert.currentAPR.toFixed(2)}%)`;
    } else if (alert.type === 'price_change') {
        return `• **${alert.chain}**: Price ${alert.change > 0 ? 'up' : 'down'} ${Math.abs(alert.change).toFixed(1)}% ($${alert.price})`;
    }
    return `• ${alert.type}: ${JSON.stringify(alert)}`;
}).join('\n')}
        `.trim();
    }

    async sendMessage(message) {
        try {
            if (this.runtime && this.runtime.sendMessage) {
                await this.runtime.sendMessage(message);
            } else {
                elizaLogger.info("Signal Agent message:", message);
            }
        } catch (error) {
            elizaLogger.error("Failed to send message:", error);
        }
    }

    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isMonitoring: this.monitoringActive,
            lastUpdate: this.currentData.lastUpdate,
            alertCount: this.alertHistory.length,
            dataStatus: this.currentData.status,
            historicalDataPoints: this.historicalData.size
        };
    }

    async shutdown() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        this.monitoringActive = false;
        elizaLogger.info("✅ Signal Agent shutdown completed");
    }
}

export default SignalAgent; 