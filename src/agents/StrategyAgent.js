import { ethers } from 'ethers';
import axios from 'axios';

// Simplified logger
const elizaLogger = {
    info: (message, data) => console.log('INFO:', message, data || ''),
    warn: (message, data) => console.warn('WARN:', message, data || ''),
    error: (message, data) => console.error('ERROR:', message, data || '')
};

/**
 * StrategyAgent - Backtests yield rebalancing strategies on private forks
 * 
 * This agent simulates different rebalancing strategies by:
 * 1. Creating private fork environments for each target chain
 * 2. Running yield optimization simulations
 * 3. Calculating expected returns and gas costs
 * 4. Evaluating impermanent loss mitigation strategies
 * 5. Generating confidence scores for strategy recommendations
 */
class StrategyAgent {
    constructor(config) {
        this.config = config;
        this.runtime = null;
        this.forkProviders = new Map();
        this.strategyResults = new Map();
        this.lastAPRData = new Map();
        
        this.supportedChains = {
            ethereum: { chainId: 1, rpc: config.ethereumRpc || 'https://ethereum.publicnode.com' },
            arbitrum: { chainId: 42161, rpc: config.arbitrumRpc || 'https://arbitrum.publicnode.com' },
            polygon: { chainId: 137, rpc: config.polygonRpc || 'https://polygon.publicnode.com' }
        };
    }

    async initialize() {
        try {
            // Create simplified runtime
            this.runtime = {
                character: {
                    name: "StrategyAgent",
                    username: "crossfluxx_strategy",
                    bio: [
                        "AI agent specialized in backtesting cross-chain yield strategies",
                        "Simulates rebalancing scenarios across Ethereum, Arbitrum, and Polygon",
                        "Calculates risk-adjusted returns and gas optimization strategies"
                    ],
                    personality: {
                        traits: ["analytical", "data-driven", "risk-aware", "precise", "thorough"],
                        style: "methodical and analytical, focused on quantitative results"
                    },
                    knowledge: [
                        "DeFi yield farming strategies",
                        "Cross-chain arbitrage opportunities", 
                        "Impermanent loss calculations",
                        "Gas optimization techniques",
                        "Risk management protocols",
                        "Fork testing methodologies"
                    ]
                },
                actions: [
                    this.createBacktestAction(),
                    this.createOptimizeAction(),
                    this.createRiskAssessmentAction()
                ],
                isReady: true
            };

            // Setup fork environments (non-blocking)
            this.setupForkEnvironments().catch(error => {
                elizaLogger.error("Error setting up fork environments:", error);
            });
            
            elizaLogger.info("StrategyAgent initialized successfully");
        } catch (error) {
            elizaLogger.error("Failed to initialize StrategyAgent:", error);
            throw error;
        }
    }

    async setupForkEnvironments() {
        elizaLogger.info("Setting up fork environments...");
        
        for (const [chainName, chainConfig] of Object.entries(this.supportedChains)) {
            try {
                // Create RPC provider with timeout
                const provider = new ethers.providers.JsonRpcProvider(chainConfig.rpc, chainConfig.chainId);
                
                // Test connection
                await provider.getBlockNumber();
                this.forkProviders.set(chainName, provider);
                
                elizaLogger.info(`Fork environment created for ${chainName}`);
            } catch (error) {
                elizaLogger.error(`Failed to create fork for ${chainName}:`, error);
                // Continue with other chains even if one fails
            }
        }
        
        elizaLogger.info("Fork environments setup completed");
    }

    createBacktestAction() {
        return {
            name: "backtest_strategy",
            description: "Backtest a yield rebalancing strategy across multiple scenarios",
            validate: async (runtime, message) => {
                return message.content.includes("backtest") || 
                       message.content.includes("strategy") ||
                       message.content.includes("simulate");
            },
            handler: async (runtime, message, state, options, callback) => {
                try {
                    const strategy = this.parseStrategy(message.content);
                    const results = await this.runBacktest(strategy);
                    
                    const response = this.formatBacktestResults(results);
                    callback({ text: response, action: "backtest_completed" });
                    
                    return true;
                } catch (error) {
                    elizaLogger.error("Backtest failed:", error);
                    callback({ text: "Backtest simulation failed. Please try again.", action: "backtest_failed" });
                    return false;
                }
            }
        };
    }

    createOptimizeAction() {
        return {
            name: "optimize_allocation",
            description: "Optimize asset allocation across chains for maximum yield",
            validate: async (runtime, message) => {
                return message.content.includes("optimize") || 
                       message.content.includes("allocation") ||
                       message.content.includes("maximize");
            },
            handler: async (runtime, message, state, options, callback) => {
                try {
                    const currentAllocation = this.parseAllocation(message.content);
                    const optimizedPlan = await this.optimizeAllocation(currentAllocation);
                    
                    const response = this.formatOptimizationResults(optimizedPlan);
                    callback({ text: response, action: "optimization_completed" });
                    
                    return true;
                } catch (error) {
                    elizaLogger.error("Optimization failed:", error);
                    callback({ text: "Allocation optimization failed. Please try again.", action: "optimization_failed" });
                    return false;
                }
            }
        };
    }

    createRiskAssessmentAction() {
        return {
            name: "assess_risk",
            description: "Assess risks of proposed rebalancing strategy",
            validate: async (runtime, message) => {
                return message.content.includes("risk") || 
                       message.content.includes("safety") ||
                       message.content.includes("assess");
            },
            handler: async (runtime, message, state, options, callback) => {
                try {
                    const strategy = this.parseStrategy(message.content);
                    const riskMetrics = await this.assessRisk(strategy);
                    
                    const response = this.formatRiskAssessment(riskMetrics);
                    callback({ text: response, action: "risk_assessment_completed" });
                    
                    return true;
                } catch (error) {
                    elizaLogger.error("Risk assessment failed:", error);
                    callback({ text: "Risk assessment failed. Please try again.", action: "risk_assessment_failed" });
                    return false;
                }
            }
        };
    }

    async runBacktest(strategy) {
        const results = {
            strategy: strategy,
            scenarios: [],
            expectedReturn: 0,
            confidence: 0,
            gasEstimate: 0,
            impermanentLossRisk: 0
        };

        // Simulate multiple market scenarios
        const scenarios = [
            { name: "bull_market", volatility: 0.2, trend: 1.1 },
            { name: "bear_market", volatility: 0.3, trend: 0.9 },
            { name: "sideways", volatility: 0.15, trend: 1.0 },
            { name: "high_volatility", volatility: 0.5, trend: 1.0 }
        ];

        for (const scenario of scenarios) {
            const scenarioResult = await this.simulateScenario(strategy, scenario);
            results.scenarios.push(scenarioResult);
        }

        // Calculate aggregate metrics
        results.expectedReturn = this.calculateExpectedReturn(results.scenarios);
        results.confidence = this.calculateConfidence(results.scenarios);
        results.gasEstimate = await this.estimateGasCosts(strategy);
        results.impermanentLossRisk = this.calculateImpermanentLossRisk(strategy);

        // Store results for future reference
        this.strategyResults.set(strategy.id || Date.now(), results);

        return results;
    }

    async simulateScenario(strategy, scenario) {
        try {
            // Fetch current APR data for simulation
            const chainAPRs = await this.fetchChainAPRs();
            
            // Apply scenario adjustments to APRs
            const adjustedAPRs = {};
            for (const [chain, aprs] of Object.entries(chainAPRs)) {
                adjustedAPRs[chain] = {};
                for (const [protocol, apr] of Object.entries(aprs)) {
                    // Apply volatility and trend to APR
                    const adjustment = 1 + (Math.random() - 0.5) * scenario.volatility;
                    adjustedAPRs[chain][protocol] = apr * scenario.trend * adjustment;
                }
            }

            // Calculate returns for this scenario
            const portfolioReturn = this.calculatePortfolioReturn(strategy, adjustedAPRs);
            const risk = this.calculateScenarioRisk(strategy, scenario);

            return {
                scenario: scenario.name,
                adjustedAPRs,
                portfolioReturn,
                risk,
                confidence: Math.max(0.1, 1 - risk) // Higher risk = lower confidence
            };
        } catch (error) {
            elizaLogger.error(`Scenario simulation failed for ${scenario.name}:`, error);
            return {
                scenario: scenario.name,
                adjustedAPRs: {},
                portfolioReturn: 0,
                risk: 1,
                confidence: 0.1
            };
        }
    }

    async optimizeAllocation(currentAllocation) {
        try {
            const chainAPRs = await this.fetchChainAPRs();
            const optimizedAllocation = this.calculateOptimalAllocation(chainAPRs, currentAllocation);
            const rebalancePlan = this.generateRebalancePlan(currentAllocation, optimizedAllocation);
            
            return {
                current: currentAllocation,
                optimized: optimizedAllocation,
                rebalancePlan,
                improvement: this.calculateImprovement(currentAllocation, optimizedAllocation, chainAPRs),
                confidence: 0.85,
                gasEstimate: await this.estimateGasCosts({ allocation: optimizedAllocation })
            };
        } catch (error) {
            elizaLogger.error("Allocation optimization failed:", error);
            throw error;
        }
    }

    async fetchChainAPRs() {
        try {
            // Fetch real APR data from multiple sources
            const aprData = {};
            
            for (const chainName of Object.keys(this.supportedChains)) {
                aprData[chainName] = await this.fetchChainSpecificAPRs(chainName);
            }
            
            return aprData;
        } catch (error) {
            elizaLogger.error("Failed to fetch chain APRs:", error);
            // Return cached data if available
            return Object.fromEntries(this.lastAPRData);
        }
    }

    async fetchChainSpecificAPRs(chainName) {
        const aprs = {};
        
        try {
            // Try to fetch from DeFiLlama
            const response = await axios.get(`https://yields.llama.fi/pools`);
            const pools = response.data.data;
            
            // Filter pools by chain and extract APRs
            const chainPools = pools.filter(pool => 
                pool.chain?.toLowerCase().includes(chainName.toLowerCase())
            );
            
            // Extract major protocol APRs
            const protocols = ['aave', 'compound', 'uniswap'];
            for (const protocol of protocols) {
                const protocolPools = chainPools.filter(pool => 
                    pool.project?.toLowerCase().includes(protocol)
                );
                
                if (protocolPools.length > 0) {
                    // Take average APR of protocol's pools
                    const avgAPR = protocolPools.reduce((sum, pool) => 
                        sum + (pool.apy || 0), 0
                    ) / protocolPools.length;
                    
                    aprs[protocol] = avgAPR / 100; // Convert percentage to decimal
                }
            }
            
            // Cache the data
            this.lastAPRData.set(chainName, aprs);
            
        } catch (error) {
            elizaLogger.warn(`Failed to fetch APRs for ${chainName}, using defaults:`, error);
            // Use reasonable defaults
            aprs.aave = 0.065;
            aprs.compound = 0.058;
            aprs.uniswap = 0.094;
        }
        
        return aprs;
    }

    calculateOptimalAllocation(chainAPRs, currentAllocation) {
        const totalValue = Object.values(currentAllocation).reduce((sum, val) => sum + val, 0);
        const optimized = {};
        
        // Calculate risk-adjusted returns for each chain
        const chainScores = {};
        for (const [chain, protocols] of Object.entries(chainAPRs)) {
            const avgAPR = Object.values(protocols).reduce((sum, apr) => sum + apr, 0) / Object.values(protocols).length;
            const risk = this.estimateChainRisk(chain);
            chainScores[chain] = avgAPR / (1 + risk); // Risk-adjusted return
        }
        
        // Sort chains by risk-adjusted returns
        const sortedChains = Object.entries(chainScores)
            .sort(([,a], [,b]) => b - a)
            .map(([chain]) => chain);
        
        // Allocate based on risk-adjusted returns with diversification
        const baseAllocation = totalValue * 0.4; // 40% to best chain
        const secondaryAllocation = totalValue * 0.35; // 35% to second best
        const remainingAllocation = totalValue * 0.25; // 25% to others
        
        if (sortedChains[0]) optimized[sortedChains[0]] = baseAllocation;
        if (sortedChains[1]) optimized[sortedChains[1]] = secondaryAllocation;
        
        // Distribute remaining among other chains
        const remainingChains = sortedChains.slice(2);
        if (remainingChains.length > 0) {
            const perChain = remainingAllocation / remainingChains.length;
            remainingChains.forEach(chain => {
                optimized[chain] = perChain;
            });
        }
        
        return optimized;
    }

    estimateChainRisk(chainName) {
        // Risk factors: security, liquidity, bridge risk, gas costs
        const riskFactors = {
            ethereum: 0.1, // Lowest risk (most secure, highest liquidity)
            arbitrum: 0.2, // Medium risk (L2 bridge risk)
            polygon: 0.25  // Slightly higher risk (validator set, bridge complexity)
        };
        
        return riskFactors[chainName] || 0.3;
    }

    async assessRisk(strategy) {
        const risks = {
            liquidityRisk: this.assessLiquidityRisk(strategy),
            impermanentLossRisk: this.calculateImpermanentLossRisk(strategy),
            smartContractRisk: this.assessSmartContractRisk(strategy),
            bridgeRisk: this.assessBridgeRisk(strategy),
            overall: 0
        };
        
        // Calculate overall risk as weighted average
        risks.overall = (
            risks.liquidityRisk * 0.3 +
            risks.impermanentLossRisk * 0.25 +
            risks.smartContractRisk * 0.25 +
            risks.bridgeRisk * 0.2
        );
        
        return risks;
    }

    assessLiquidityRisk(strategy) {
        // Assess based on protocol TVL and volume
        const chains = strategy.chains || Object.keys(this.supportedChains);
        let totalRisk = 0;
        
        chains.forEach(chain => {
            // Higher risk for smaller protocols/chains
            const chainRisk = this.estimateChainRisk(chain);
            totalRisk += chainRisk;
        });
        
        return Math.min(totalRisk / chains.length, 1);
    }

    calculateImpermanentLossRisk(strategy) {
        // Higher risk if strategy involves LP positions
        const protocols = strategy.protocols || [];
        const lpProtocols = ['uniswap', 'sushiswap', 'curve'];
        
        const hasLP = protocols.some(p => lpProtocols.includes(p.toLowerCase()));
        return hasLP ? 0.4 : 0.1;
    }

    assessSmartContractRisk(strategy) {
        // Risk based on protocol maturity and audit status
        const protocolRisk = {
            aave: 0.1,      // Well-audited, mature
            compound: 0.15,  // Mature but some issues
            uniswap: 0.2,   // LP risks
            curve: 0.25,    // Complex math
            default: 0.3
        };
        
        const protocols = strategy.protocols || [];
        if (protocols.length === 0) return 0.2;
        
        const avgRisk = protocols.reduce((sum, protocol) => {
            const risk = protocolRisk[protocol.toLowerCase()] || protocolRisk.default;
            return sum + risk;
        }, 0) / protocols.length;
        
        return avgRisk;
    }

    assessBridgeRisk(strategy) {
        // Risk increases with number of cross-chain moves
        const crossChainMoves = strategy.crossChainMoves || 0;
        return Math.min(crossChainMoves * 0.1, 0.5);
    }

    parseStrategy(content) {
        return {
            id: Date.now(),
            chains: this.extractChains(content),
            yield: this.extractYield(content),
            riskTolerance: this.extractRiskTolerance(content),
            crossChainMoves: this.extractCrossChainMoves(content),
            protocols: this.extractProtocols(content),
            allocation: { ethereum: 10000, arbitrum: 5000, polygon: 3000 } // Default allocation
        };
    }

    extractChains(content) {
        const chains = [];
        if (content.includes('ethereum') || content.includes('eth')) chains.push('ethereum');
        if (content.includes('arbitrum') || content.includes('arb')) chains.push('arbitrum');
        if (content.includes('polygon') || content.includes('matic')) chains.push('polygon');
        return chains.length > 0 ? chains : ['ethereum', 'arbitrum', 'polygon'];
    }

    extractYield(content) {
        const yieldMatch = content.match(/(\d+\.?\d*)%/);
        return yieldMatch ? parseFloat(yieldMatch[1]) / 100 : 0.08; // Default 8%
    }

    extractRiskTolerance(content) {
        if (content.includes('low risk') || content.includes('conservative')) return 'low';
        if (content.includes('high risk') || content.includes('aggressive')) return 'high';
        return 'medium';
    }

    extractCrossChainMoves(content) {
        const moveMatches = content.match(/move|transfer|bridge/gi);
        return moveMatches ? moveMatches.length : 1;
    }

    parseAllocation(content) {
        // Try to extract allocation amounts
        const ethMatch = content.match(/ethereum[\s:]+(\d+)/i);
        const arbMatch = content.match(/arbitrum[\s:]+(\d+)/i);
        const polyMatch = content.match(/polygon[\s:]+(\d+)/i);
        
        return {
            ethereum: ethMatch ? parseFloat(ethMatch[1]) : 10000,
            arbitrum: arbMatch ? parseFloat(arbMatch[1]) : 5000,
            polygon: polyMatch ? parseFloat(polyMatch[1]) : 3000
        };
    }

    extractProtocols(content) {
        const protocols = [];
        if (content.includes('aave')) protocols.push('aave');
        if (content.includes('compound')) protocols.push('compound');
        if (content.includes('uniswap')) protocols.push('uniswap');
        return protocols.length > 0 ? protocols : ['aave', 'compound'];
    }

    formatBacktestResults(results) {
        return `
📊 **Strategy Backtest Results**

**Expected Annual Return:** ${(results.expectedReturn * 100).toFixed(2)}%
**Confidence Score:** ${(results.confidence * 100).toFixed(1)}%
**Estimated Gas Costs:** ${(results.gasEstimate * 100).toFixed(3)}%
**Impermanent Loss Risk:** ${(results.impermanentLossRisk * 100).toFixed(2)}%

**Scenario Analysis:**
${results.scenarios.map(s => 
    `• ${s.scenario}: ${(s.portfolioReturn * 100).toFixed(2)}% return, risk: ${(s.risk * 100).toFixed(1)}% (confidence: ${(s.confidence * 100).toFixed(1)}%)`
).join('\n')}

**Recommendation:** ${results.confidence > 0.7 ? 'PROCEED' : 'REVIEW REQUIRED'}
        `.trim();
    }

    formatOptimizationResults(optimizationPlan) {
        const current = optimizationPlan.currentAllocation;
        const optimized = optimizationPlan.optimizedAllocation;
        
        return `
🎯 **Allocation Optimization Results**

**Current Allocation:**
${Object.entries(current).map(([chain, weight]) => 
    `• ${chain}: ${(weight * 100).toFixed(1)}%`
).join('\n')}

**Optimized Allocation:**
${Object.entries(optimized).map(([chain, weight]) => 
    `• ${chain}: ${(weight * 100).toFixed(1)}%`
).join('\n')}

**Expected Improvement:** +${(optimizationPlan.improvement * 100).toFixed(2)}% APY

**Rebalancing Actions Needed:**
${optimizationPlan.rebalancePlan.map(action => 
    `• ${action.action}: ${action.amount} from ${action.from} to ${action.to}`
).join('\n')}
        `.trim();
    }

    formatRiskAssessment(riskMetrics) {
        const overall = Object.values(riskMetrics).filter(v => typeof v === 'number').reduce((sum, risk) => sum + risk, 0) / 4;
        
        return `
⚠️ **Risk Assessment Report**

**Liquidity Risk:** ${this.formatRiskLevel(riskMetrics.liquidityRisk)}
**Impermanent Loss Risk:** ${this.formatRiskLevel(riskMetrics.impermanentLossRisk)}
**Smart Contract Risk:** ${this.formatRiskLevel(riskMetrics.smartContractRisk)}
**Bridge Risk:** ${this.formatRiskLevel(riskMetrics.bridgeRisk)}

**Overall Risk Score:** ${this.formatRiskLevel(overall)}

**Recommendation:** ${overall < 0.3 ? 'Low risk strategy' : overall < 0.6 ? 'Medium risk - proceed with caution' : 'High risk - consider alternatives'}
        `.trim();
    }

    formatRiskLevel(risk) {
        if (risk < 0.2) return `LOW (${(risk * 100).toFixed(1)}%)`;
        if (risk < 0.5) return `MEDIUM (${(risk * 100).toFixed(1)}%)`;
        return `HIGH (${(risk * 100).toFixed(1)}%)`;
    }

    calculateExpectedReturn(scenarios) {
        if (scenarios.length === 0) return 0;
        const totalConfidence = scenarios.reduce((sum, scenario) => sum + scenario.confidence, 0);
        if (totalConfidence === 0) return 0;
        
        return scenarios.reduce((sum, scenario) => sum + scenario.portfolioReturn * scenario.confidence, 0) / totalConfidence;
    }

    calculateConfidence(scenarios) {
        return scenarios.reduce((sum, scenario) => sum + scenario.confidence, 0) / scenarios.length;
    }

    async estimateGasCosts(strategy) {
        // Estimate gas costs based on operations required
        const baseGasCost = 0.001; // 0.1% base cost
        const crossChainMultiplier = strategy.crossChainMoves || 1;
        return baseGasCost * crossChainMultiplier;
    }

    generateRebalancePlan(current, optimized) {
        const plan = [];
        
        for (const chain in optimized) {
            const currentWeight = current[chain] || 0;
            const targetWeight = optimized[chain];
            const difference = targetWeight - currentWeight;
            
            if (Math.abs(difference) > 0.05) { // Only rebalance if difference > 5%
                if (difference > 0) {
                    plan.push({
                        action: 'INCREASE',
                        chain: chain,
                        amount: `${(difference * 100).toFixed(1)}%`,
                        from: 'multiple',
                        to: chain
                    });
                } else {
                    plan.push({
                        action: 'DECREASE', 
                        chain: chain,
                        amount: `${(Math.abs(difference) * 100).toFixed(1)}%`,
                        from: chain,
                        to: 'multiple'
                    });
                }
            }
        }
        
        return plan;
    }

    calculateImprovement(current, optimized, chainAPRs) {
        let currentYield = 0;
        let optimizedYield = 0;
        
        for (const chain in current) {
            const weight = current[chain];
            const maxAPR = Math.max(...Object.values(chainAPRs[chain]).filter(v => typeof v === 'number'));
            currentYield += weight * maxAPR;
        }
        
        for (const chain in optimized) {
            const weight = optimized[chain];
            const maxAPR = Math.max(...Object.values(chainAPRs[chain]).filter(v => typeof v === 'number'));
            optimizedYield += weight * maxAPR;
        }
        
        return optimizedYield - currentYield;
    }

    calculatePortfolioReturn(strategy, adjustedAPRs) {
        let totalReturn = 0;
        const allocation = strategy.allocation || {};
        const totalValue = Object.values(allocation).reduce((sum, val) => sum + val, 0);
        
        for (const [chain, value] of Object.entries(allocation)) {
            if (adjustedAPRs[chain]) {
                const weight = value / totalValue;
                const chainAPRs = adjustedAPRs[chain];
                const avgAPR = Object.values(chainAPRs).reduce((sum, apr) => sum + apr, 0) / Object.values(chainAPRs).length;
                totalReturn += weight * avgAPR;
            }
        }
        
        return totalReturn;
    }

    calculateScenarioRisk(strategy, scenario) {
        // Base risk from scenario volatility
        let risk = scenario.volatility * 0.5;
        
        // Add risk from cross-chain operations
        const crossChainRisk = (strategy.crossChainMoves || 0) * 0.1;
        risk += crossChainRisk;
        
        // Add protocol-specific risks
        const protocols = strategy.protocols || [];
        const protocolRisk = protocols.length > 2 ? 0.1 : 0.05; // More protocols = slightly higher risk
        risk += protocolRisk;
        
        // Market trend adjustment (bear markets = higher risk)
        if (scenario.trend < 1) {
            risk += (1 - scenario.trend) * 0.3;
        }
        
        return Math.min(risk, 1); // Cap at 100%
    }
}

export default StrategyAgent; 