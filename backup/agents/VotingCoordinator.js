import StrategyAgent from './StrategyAgent.js';
import SignalAgent from './SignalAgent.js';

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
 * VotingCoordinator - Aggregates simulation results via LLM consensus
 * 
 * This coordinator agent:
 * 1. Collects inputs from StrategyAgent and SignalAgent
 * 2. Runs consensus algorithms across multiple AI models
 * 3. Weighs different opinions and confidence scores
 * 4. Makes final rebalancing decisions
 * 5. Generates execution plans with risk assessments
 * 6. Monitors execution and provides feedback loops
 */
class VotingCoordinator {
    constructor(config) {
        this.config = config;
        this.runtime = null;
        this.strategyAgent = null;
        this.signalAgent = null;
        
        // Voting and consensus parameters
        this.votingRounds = 3;
        this.consensusThreshold = 0.7; // 70% agreement required
        this.minimumConfidence = 0.6; // 60% minimum confidence
        
        // Decision history for learning
        this.decisionHistory = [];
        this.performanceMetrics = new Map();
        
        // Risk management parameters
        this.maxRebalanceFrequency = 24 * 60 * 60 * 1000; // 24 hours
        this.maxSingleChainAllocation = 0.6; // 60% max per chain
        this.emergencyStopConditions = new Set();
    }

    async initialize() {
        try {
            this.runtime = createAgentRuntime({
                character: {
                    name: "VotingCoordinator",
                    description: "AI coordinator for consensus-based rebalancing decisions",
                    personality: "decisive, cautious, analytical, collaborative",
                    knowledge: [
                        "Multi-agent consensus algorithms",
                        "Risk-weighted decision making",
                        "Cross-chain optimization strategies",
                        "Performance tracking and learning",
                        "Emergency risk management"
                    ]
                },
                providers: [],
                actions: [
                    this.createConsensusAction(),
                    this.createExecutionAction(),
                    this.createReviewAction()
                ]
            });

            // Initialize sub-agents
            this.strategyAgent = new StrategyAgent(this.config);
            this.signalAgent = new SignalAgent(this.config);
            
            await this.strategyAgent.initialize();
            await this.signalAgent.initialize();
            
            elizaLogger.info("VotingCoordinator initialized successfully");
        } catch (error) {
            elizaLogger.error("Failed to initialize VotingCoordinator:", error);
            throw error;
        }
    }

    async executeRebalancingDecision(userRequest) {
        try {
            elizaLogger.info("Starting rebalancing decision process");
            
            // Step 1: Check if rebalancing is allowed
            const canRebalance = await this.checkRebalancingEligibility();
            if (!canRebalance.allowed) {
                return {
                    decision: 'reject',
                    reason: canRebalance.reason,
                    nextEligibleTime: canRebalance.nextEligibleTime
                };
            }

            // Step 2: Gather inputs from agents
            const inputs = await this.gatherAgentInputs(userRequest);
            
            // Step 3: Run consensus voting rounds
            const consensus = await this.runConsensusRounds(inputs);
            
            // Step 4: Make final decision
            const finalDecision = await this.makeFinalDecision(consensus, inputs);
            
            // Step 5: Record decision for learning
            this.recordDecision(finalDecision, inputs);
            
            return finalDecision;
            
        } catch (error) {
            elizaLogger.error("Rebalancing decision process failed:", error);
            return {
                decision: 'error',
                reason: `Decision process failed: ${error.message}`,
                recommendation: 'retry_later'
            };
        }
    }

    async checkRebalancingEligibility() {
        const now = Date.now();
        const lastRebalance = this.getLastRebalanceTime();
        
        // Check minimum time between rebalances
        if (lastRebalance && (now - lastRebalance) < this.maxRebalanceFrequency) {
            return {
                allowed: false,
                reason: 'Too soon since last rebalance',
                nextEligibleTime: lastRebalance + this.maxRebalanceFrequency
            };
        }

        // Check for emergency stop conditions
        const emergencyCheck = await this.checkEmergencyConditions();
        if (emergencyCheck.hasEmergency) {
            return {
                allowed: false,
                reason: `Emergency condition: ${emergencyCheck.condition}`,
                nextEligibleTime: null
            };
        }

        // Check market conditions
        const marketCheck = await this.checkMarketConditions();
        if (!marketCheck.suitable) {
            return {
                allowed: false,
                reason: `Unsuitable market conditions: ${marketCheck.reason}`,
                nextEligibleTime: now + (2 * 60 * 60 * 1000) // Try again in 2 hours
            };
        }

        return { allowed: true };
    }

    async gatherAgentInputs(userRequest) {
        const inputs = {
            timestamp: Date.now(),
            userRequest: userRequest,
            strategy: null,
            signals: null,
            risks: null
        };

        try {
            // Get strategy recommendations
            elizaLogger.info("Gathering strategy recommendations");
            inputs.strategy = await this.queryStrategyAgent(userRequest);
            
            // Get market signals
            elizaLogger.info("Gathering market signals");
            inputs.signals = await this.querySignalAgent();
            
            // Perform integrated risk assessment
            elizaLogger.info("Performing risk assessment");
            inputs.risks = await this.performIntegratedRiskAssessment(inputs.strategy, inputs.signals);
            
        } catch (error) {
            elizaLogger.error("Failed to gather agent inputs:", error);
            inputs.error = error.message;
        }

        return inputs;
    }

    async queryStrategyAgent(userRequest) {
        try {
            // Simulate querying the strategy agent
            const mockMessage = { content: `backtest strategy: ${userRequest}` };
            
            // In a real implementation, this would call the actual agent
            const strategyResults = await this.strategyAgent.runBacktest({
                chains: ['ethereum', 'arbitrum', 'polygon'],
                expectedYield: 0.08,
                riskTolerance: 'medium',
                crossChainMoves: 2,
                protocols: ['aave', 'compound']
            });

            return {
                recommendations: strategyResults,
                confidence: strategyResults.confidence,
                timeGenerated: Date.now()
            };
        } catch (error) {
            elizaLogger.error("Strategy agent query failed:", error);
            return {
                error: error.message,
                confidence: 0,
                timeGenerated: Date.now()
            };
        }
    }

    async querySignalAgent() {
        try {
            const currentSnapshot = this.signalAgent.getCurrentMarketSnapshot();
            const signals = this.signalAgent.generateSignalSummary(currentSnapshot);
            
            return {
                signals: signals,
                confidence: signals.confidence,
                timeGenerated: Date.now()
            };
        } catch (error) {
            elizaLogger.error("Signal agent query failed:", error);
            return {
                error: error.message,
                confidence: 0,
                timeGenerated: Date.now()
            };
        }
    }

    async performIntegratedRiskAssessment(strategyData, signalData) {
        const risks = {
            strategyRisk: 0,
            marketRisk: 0,
            liquidityRisk: 0,
            technicalRisk: 0,
            overallRisk: 0,
            factors: []
        };

        // Strategy-based risk assessment
        if (strategyData?.recommendations) {
            risks.strategyRisk = strategyData.recommendations.impermanentLossRisk || 0;
            risks.factors.push({
                type: 'strategy',
                risk: risks.strategyRisk,
                description: 'Risk from strategy implementation'
            });
        }

        // Market-based risk assessment
        if (signalData?.signals) {
            const volatility = this.extractVolatilityFromSignals(signalData.signals);
            risks.marketRisk = Math.min(0.8, volatility * 2); // Cap at 80%
            risks.factors.push({
                type: 'market',
                risk: risks.marketRisk,
                description: `Market volatility risk: ${(volatility * 100).toFixed(1)}%`
            });
        }

        // Liquidity risk assessment
        risks.liquidityRisk = await this.assessLiquidityRisk();
        risks.factors.push({
            type: 'liquidity',
            risk: risks.liquidityRisk,
            description: 'Cross-chain liquidity availability risk'
        });

        // Technical risk assessment (bridge risk, contract risk)
        risks.technicalRisk = this.assessTechnicalRisk();
        risks.factors.push({
            type: 'technical',
            risk: risks.technicalRisk,
            description: 'Smart contract and bridge technical risk'
        });

        // Calculate overall risk (weighted average)
        const weights = { strategy: 0.3, market: 0.3, liquidity: 0.2, technical: 0.2 };
        risks.overallRisk = 
            risks.strategyRisk * weights.strategy +
            risks.marketRisk * weights.market +
            risks.liquidityRisk * weights.liquidity +
            risks.technicalRisk * weights.technical;

        return risks;
    }

    extractVolatilityFromSignals(signals) {
        // Extract volatility from signal factors
        let totalVolatility = 0;
        let count = 0;

        signals.factors?.forEach(factor => {
            if (factor.value !== undefined) {
                totalVolatility += Math.abs(factor.value);
                count++;
            }
        });

        return count > 0 ? totalVolatility / count : 0.1; // Default 10% volatility
    }

    async assessLiquidityRisk() {
        // Assess cross-chain liquidity availability
        // This would integrate with actual liquidity data in production
        return 0.15; // 15% liquidity risk
    }

    assessTechnicalRisk() {
        // Assess technical risks from smart contracts and bridges
        return 0.1; // 10% technical risk
    }

    async runConsensusRounds(inputs) {
        const votingResults = [];
        
        for (let round = 0; round < this.votingRounds; round++) {
            elizaLogger.info(`Running consensus round ${round + 1}/${this.votingRounds}`);
            
            const roundResult = await this.runSingleVotingRound(inputs, round);
            votingResults.push(roundResult);
            
            // Check for early consensus
            if (round > 0 && this.hasEarlyConsensus(votingResults)) {
                elizaLogger.info("Early consensus reached, stopping voting rounds");
                break;
            }
        }

        return this.aggregateVotingResults(votingResults);
    }

    async runSingleVotingRound(inputs, roundNumber) {
        const votes = [];
        
        // Vote 1: Strategy-based decision
        const strategyVote = this.generateStrategyVote(inputs.strategy, roundNumber);
        votes.push(strategyVote);
        
        // Vote 2: Signal-based decision
        const signalVote = this.generateSignalVote(inputs.signals, roundNumber);
        votes.push(signalVote);
        
        // Vote 3: Risk-based decision
        const riskVote = this.generateRiskVote(inputs.risks, roundNumber);
        votes.push(riskVote);
        
        // Vote 4: Historical performance-based decision
        const performanceVote = this.generatePerformanceVote(inputs, roundNumber);
        votes.push(performanceVote);
        
        return {
            round: roundNumber,
            votes: votes,
            timestamp: Date.now()
        };
    }

    generateStrategyVote(strategyData, round) {
        if (!strategyData?.recommendations) {
            return {
                source: 'strategy',
                decision: 'abstain',
                confidence: 0,
                reasoning: 'No strategy data available'
            };
        }

        const strategy = strategyData.recommendations;
        let decision = 'hold';
        let confidence = strategy.confidence || 0;
        
        // Add some randomness for different rounds
        const roundVariance = (Math.random() - 0.5) * 0.1; // ±5% variance
        confidence = Math.max(0, Math.min(1, confidence + roundVariance));
        
        if (strategy.expectedReturn > 0.05 && confidence > 0.7) {
            decision = 'rebalance';
        } else if (strategy.expectedReturn < 0.02 || confidence < 0.4) {
            decision = 'hold';
        }

        return {
            source: 'strategy',
            decision: decision,
            confidence: confidence,
            reasoning: `Expected return: ${(strategy.expectedReturn * 100).toFixed(2)}%`,
            data: {
                expectedReturn: strategy.expectedReturn,
                gasEstimate: strategy.gasEstimate,
                impermanentLossRisk: strategy.impermanentLossRisk
            }
        };
    }

    generateSignalVote(signalData, round) {
        if (!signalData?.signals) {
            return {
                source: 'signals',
                decision: 'abstain',
                confidence: 0,
                reasoning: 'No signal data available'
            };
        }

        const signals = signalData.signals;
        let decision = 'hold';
        let confidence = signals.confidence || 0;
        
        // Add round variance
        const roundVariance = (Math.random() - 0.5) * 0.1;
        confidence = Math.max(0, Math.min(1, confidence + roundVariance));
        
        if (signals.direction === 'rebalance_opportunity' && confidence > 0.6) {
            decision = 'rebalance';
        } else if (signals.direction === 'hold_conservative') {
            decision = 'hold';
        }

        return {
            source: 'signals',
            decision: decision,
            confidence: confidence,
            reasoning: `Market signals: ${signals.direction} (${signals.strength} strength)`,
            data: {
                direction: signals.direction,
                strength: signals.strength,
                factors: signals.factors?.length || 0
            }
        };
    }

    generateRiskVote(riskData, round) {
        if (!riskData) {
            return {
                source: 'risk',
                decision: 'abstain',
                confidence: 0,
                reasoning: 'No risk data available'
            };
        }

        let decision = 'hold';
        const overallRisk = riskData.overallRisk;
        const confidence = Math.max(0.5, 1 - overallRisk); // Higher risk = lower confidence
        
        if (overallRisk < 0.3) {
            decision = 'rebalance'; // Low risk, proceed
        } else if (overallRisk > 0.6) {
            decision = 'hold'; // High risk, be conservative
        }

        return {
            source: 'risk',
            decision: decision,
            confidence: confidence,
            reasoning: `Overall risk: ${(overallRisk * 100).toFixed(1)}%`,
            data: {
                overallRisk: overallRisk,
                riskFactors: riskData.factors?.length || 0
            }
        };
    }

    generatePerformanceVote(inputs, round) {
        const historicalSuccess = this.calculateHistoricalSuccessRate();
        const recentPerformance = this.getRecentPerformanceMetrics();
        
        let decision = 'hold';
        let confidence = 0.5;
        
        if (historicalSuccess > 0.7 && recentPerformance.avgReturn > 0.03) {
            decision = 'rebalance';
            confidence = Math.min(0.9, historicalSuccess);
        } else if (historicalSuccess < 0.4 || recentPerformance.avgReturn < 0) {
            decision = 'hold';
            confidence = Math.min(0.8, 1 - historicalSuccess);
        }

        return {
            source: 'performance',
            decision: decision,
            confidence: confidence,
            reasoning: `Historical success: ${(historicalSuccess * 100).toFixed(1)}%, Recent avg return: ${(recentPerformance.avgReturn * 100).toFixed(2)}%`,
            data: {
                historicalSuccess: historicalSuccess,
                recentReturn: recentPerformance.avgReturn,
                sampleSize: recentPerformance.sampleSize
            }
        };
    }

    hasEarlyConsensus(votingResults) {
        if (votingResults.length < 2) return false;
        
        const lastRound = votingResults[votingResults.length - 1];
        const rebalanceVotes = lastRound.votes.filter(v => v.decision === 'rebalance').length;
        const holdVotes = lastRound.votes.filter(v => v.decision === 'hold').length;
        const totalVotes = lastRound.votes.filter(v => v.decision !== 'abstain').length;
        
        if (totalVotes === 0) return false;
        
        const consensus = Math.max(rebalanceVotes, holdVotes) / totalVotes;
        return consensus >= this.consensusThreshold;
    }

    aggregateVotingResults(votingResults) {
        const aggregated = {
            finalDecision: 'hold',
            confidence: 0,
            consensus: 0,
            votingSummary: {},
            reasoning: []
        };

        // Count all votes across rounds
        let totalRebalanceVotes = 0;
        let totalHoldVotes = 0;
        let totalConfidence = 0;
        let totalVotes = 0;

        const sourceVotes = {};

        votingResults.forEach(round => {
            round.votes.forEach(vote => {
                if (vote.decision !== 'abstain') {
                    if (vote.decision === 'rebalance') totalRebalanceVotes++;
                    if (vote.decision === 'hold') totalHoldVotes++;
                    
                    totalConfidence += vote.confidence;
                    totalVotes++;
                    
                    if (!sourceVotes[vote.source]) {
                        sourceVotes[vote.source] = { rebalance: 0, hold: 0, abstain: 0 };
                    }
                    sourceVotes[vote.source][vote.decision]++;
                    
                    aggregated.reasoning.push(`${vote.source}: ${vote.reasoning}`);
                }
            });
        });

        // Calculate final metrics
        if (totalVotes > 0) {
            aggregated.confidence = totalConfidence / totalVotes;
            aggregated.consensus = Math.max(totalRebalanceVotes, totalHoldVotes) / totalVotes;
            aggregated.finalDecision = totalRebalanceVotes > totalHoldVotes ? 'rebalance' : 'hold';
        }

        aggregated.votingSummary = {
            rebalanceVotes: totalRebalanceVotes,
            holdVotes: totalHoldVotes,
            totalVotes: totalVotes,
            sourceBreakdown: sourceVotes
        };

        return aggregated;
    }

    async makeFinalDecision(consensus, inputs) {
        const decision = {
            action: consensus.finalDecision,
            confidence: consensus.confidence,
            consensus: consensus.consensus,
            timestamp: Date.now(),
            reasoning: consensus.reasoning,
            executionPlan: null,
            riskAssessment: inputs.risks,
            metadata: {
                votingSummary: consensus.votingSummary,
                agentInputs: {
                    strategyConfidence: inputs.strategy?.confidence || 0,
                    signalConfidence: inputs.signals?.confidence || 0
                }
            }
        };

        // Apply final validation checks
        const validation = this.validateDecision(decision, inputs);
        if (!validation.isValid) {
            decision.action = 'hold';
            decision.reasoning.push(`Validation failed: ${validation.reason}`);
        }

        // Generate execution plan if rebalancing
        if (decision.action === 'rebalance' && validation.isValid) {
            decision.executionPlan = await this.generateExecutionPlan(inputs);
        }

        return decision;
    }

    validateDecision(decision, inputs) {
        // Minimum confidence check
        if (decision.confidence < this.minimumConfidence) {
            return {
                isValid: false,
                reason: `Confidence ${(decision.confidence * 100).toFixed(1)}% below minimum ${(this.minimumConfidence * 100).toFixed(1)}%`
            };
        }

        // Consensus threshold check
        if (decision.consensus < this.consensusThreshold) {
            return {
                isValid: false,
                reason: `Consensus ${(decision.consensus * 100).toFixed(1)}% below threshold ${(this.consensusThreshold * 100).toFixed(1)}%`
            };
        }

        // Risk threshold check
        if (inputs.risks?.overallRisk > 0.7) {
            return {
                isValid: false,
                reason: `Overall risk ${(inputs.risks.overallRisk * 100).toFixed(1)}% too high`
            };
        }

        return { isValid: true };
    }

    async generateExecutionPlan(inputs) {
        const plan = {
            steps: [],
            estimatedGasCost: 0,
            estimatedTime: 0,
            riskMitigation: [],
            monitoring: []
        };

        // Generate steps based on strategy recommendations
        if (inputs.strategy?.recommendations) {
            const strategy = inputs.strategy.recommendations;
            
            // Add pre-execution checks
            plan.steps.push({
                step: 1,
                action: 'pre_execution_health_check',
                description: 'Verify all contracts and balances',
                estimatedTime: 30, // seconds
                gasEstimate: 50000
            });

            // Add rebalancing steps
            plan.steps.push({
                step: 2,
                action: 'execute_rebalance',
                description: 'Execute cross-chain rebalancing',
                estimatedTime: 300, // 5 minutes
                gasEstimate: 500000
            });

            // Add post-execution verification
            plan.steps.push({
                step: 3,
                action: 'post_execution_verification',
                description: 'Verify successful execution and update records',
                estimatedTime: 60,
                gasEstimate: 30000
            });

            plan.estimatedGasCost = plan.steps.reduce((sum, step) => sum + step.gasEstimate, 0);
            plan.estimatedTime = plan.steps.reduce((sum, step) => sum + step.estimatedTime, 0);
        }

        // Add risk mitigation measures
        plan.riskMitigation = [
            'Verify sufficient liquidity before execution',
            'Monitor gas prices for optimal execution',
            'Implement circuit breakers for emergency stops',
            'Verify bridge health status'
        ];

        // Add monitoring requirements
        plan.monitoring = [
            'Track execution progress in real-time',
            'Monitor cross-chain message delivery',
            'Verify final balances and allocations',
            'Record performance metrics for learning'
        ];

        return plan;
    }

    recordDecision(decision, inputs) {
        const record = {
            timestamp: Date.now(),
            decision: decision.action,
            confidence: decision.confidence,
            consensus: decision.consensus,
            inputs: {
                strategyConfidence: inputs.strategy?.confidence || 0,
                signalConfidence: inputs.signals?.confidence || 0,
                overallRisk: inputs.risks?.overallRisk || 0
            },
            executionPlan: decision.executionPlan,
            id: this.generateDecisionId()
        };

        this.decisionHistory.push(record);
        
        // Keep only last 100 decisions
        if (this.decisionHistory.length > 100) {
            this.decisionHistory.shift();
        }

        elizaLogger.info(`Decision recorded: ${decision.action} (confidence: ${(decision.confidence * 100).toFixed(1)}%)`);
    }

    generateDecisionId() {
        return `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    calculateHistoricalSuccessRate() {
        if (this.decisionHistory.length === 0) return 0.7; // Default success rate
        
        const rebalanceDecisions = this.decisionHistory.filter(d => d.decision === 'rebalance');
        if (rebalanceDecisions.length === 0) return 0.7;
        
        // In a real implementation, this would check actual performance outcomes
        // For now, simulate based on confidence levels
        const successfulDecisions = rebalanceDecisions.filter(d => d.confidence > 0.6).length;
        return successfulDecisions / rebalanceDecisions.length;
    }

    getRecentPerformanceMetrics() {
        const recentDecisions = this.decisionHistory.slice(-10); // Last 10 decisions
        
        if (recentDecisions.length === 0) {
            return { avgReturn: 0.03, sampleSize: 0 }; // Default positive return
        }
        
        // Simulate returns based on confidence and consensus
        let totalReturn = 0;
        let count = 0;
        
        recentDecisions.forEach(decision => {
            if (decision.decision === 'rebalance') {
                // Simulate return based on confidence
                const simulatedReturn = (decision.confidence - 0.5) * 0.1; // -5% to +5% range
                totalReturn += simulatedReturn;
                count++;
            }
        });
        
        return {
            avgReturn: count > 0 ? totalReturn / count : 0.03,
            sampleSize: count
        };
    }

    async checkEmergencyConditions() {
        // Check for conditions that should stop all rebalancing
        const emergencyConditions = [
            { condition: 'high_network_congestion', check: () => this.checkNetworkCongestion() },
            { condition: 'bridge_outage', check: () => this.checkBridgeStatus() },
            { condition: 'extreme_volatility', check: () => this.checkVolatility() }
        ];

        for (const emergency of emergencyConditions) {
            const hasCondition = await emergency.check();
            if (hasCondition) {
                return {
                    hasEmergency: true,
                    condition: emergency.condition
                };
            }
        }

        return { hasEmergency: false };
    }

    async checkNetworkCongestion() {
        // Check if gas prices are extremely high
        // In production, this would query actual gas price APIs
        return false; // Simplified
    }

    async checkBridgeStatus() {
        // Check if CCIP or other bridges are operational
        // In production, this would query bridge status APIs
        return false; // Simplified
    }

    async checkVolatility() {
        // Check if market volatility is extreme
        // In production, this would analyze recent price movements
        return false; // Simplified
    }

    async checkMarketConditions() {
        // Basic market condition checks
        return {
            suitable: true,
            reason: null
        };
    }

    getLastRebalanceTime() {
        const lastRebalance = this.decisionHistory
            .filter(d => d.decision === 'rebalance')
            .pop();
        
        return lastRebalance?.timestamp || null;
    }

    createConsensusAction() {
        return {
            name: "run_consensus",
            description: "Run consensus voting process for rebalancing decision",
            validate: async (runtime, message) => {
                return message.content.includes("consensus") || 
                       message.content.includes("vote") ||
                       message.content.includes("decide");
            },
            handler: async (runtime, message, state, options, callback) => {
                try {
                    const decision = await this.executeRebalancingDecision(message.content);
                    const response = this.formatDecisionReport(decision);
                    
                    callback({ text: response, action: "consensus_completed" });
                    return true;
                } catch (error) {
                    elizaLogger.error("Consensus process failed:", error);
                    callback({ text: "Consensus voting failed. Please try again.", action: "consensus_failed" });
                    return false;
                }
            }
        };
    }

    createExecutionAction() {
        return {
            name: "execute_plan",
            description: "Execute approved rebalancing plan",
            validate: async (runtime, message) => {
                return message.content.includes("execute") || 
                       message.content.includes("implement") ||
                       message.content.includes("proceed");
            },
            handler: async (runtime, message, state, options, callback) => {
                try {
                    // In production, this would interface with the smart contracts
                    const response = "Execution plan initiated. Monitor progress in the dashboard.";
                    callback({ text: response, action: "execution_started" });
                    return true;
                } catch (error) {
                    elizaLogger.error("Execution failed:", error);
                    callback({ text: "Plan execution failed. Please review and retry.", action: "execution_failed" });
                    return false;
                }
            }
        };
    }

    createReviewAction() {
        return {
            name: "review_performance",
            description: "Review past decision performance and suggest improvements",
            validate: async (runtime, message) => {
                return message.content.includes("review") || 
                       message.content.includes("performance") ||
                       message.content.includes("history");
            },
            handler: async (runtime, message, state, options, callback) => {
                try {
                    const review = this.generatePerformanceReview();
                    const response = this.formatPerformanceReview(review);
                    
                    callback({ text: response, action: "review_completed" });
                    return true;
                } catch (error) {
                    elizaLogger.error("Performance review failed:", error);
                    callback({ text: "Performance review failed. Please try again.", action: "review_failed" });
                    return false;
                }
            }
        };
    }

    formatDecisionReport(decision) {
        return `
🗳️ **Consensus Decision Report**

**Final Decision:** ${decision.action.toUpperCase()}
**Confidence:** ${(decision.confidence * 100).toFixed(1)}%
**Consensus:** ${(decision.consensus * 100).toFixed(1)}%

**Voting Summary:**
• Rebalance votes: ${decision.metadata.votingSummary.rebalanceVotes}
• Hold votes: ${decision.metadata.votingSummary.holdVotes}
• Total votes: ${decision.metadata.votingSummary.totalVotes}

**Agent Input Confidence:**
• Strategy Agent: ${(decision.metadata.agentInputs.strategyConfidence * 100).toFixed(1)}%
• Signal Agent: ${(decision.metadata.agentInputs.signalConfidence * 100).toFixed(1)}%

**Risk Assessment:**
• Overall Risk: ${decision.riskAssessment ? (decision.riskAssessment.overallRisk * 100).toFixed(1) + '%' : 'Not available'}

${decision.executionPlan ? `
**Execution Plan:**
• Estimated time: ${decision.executionPlan.estimatedTime} seconds
• Estimated gas: ${decision.executionPlan.estimatedGasCost.toLocaleString()} gas units
• Steps: ${decision.executionPlan.steps.length}
` : ''}

**Key Reasoning:**
${decision.reasoning.slice(0, 3).map(r => `• ${r}`).join('\n')}

*Decision timestamp: ${new Date(decision.timestamp).toLocaleString()}*
        `.trim();
    }

    generatePerformanceReview() {
        const totalDecisions = this.decisionHistory.length;
        const rebalanceDecisions = this.decisionHistory.filter(d => d.decision === 'rebalance').length;
        const successRate = this.calculateHistoricalSuccessRate();
        const recentMetrics = this.getRecentPerformanceMetrics();

        return {
            totalDecisions,
            rebalanceDecisions,
            holdDecisions: totalDecisions - rebalanceDecisions,
            successRate,
            recentPerformance: recentMetrics,
            avgConfidence: this.calculateAverageConfidence(),
            improvements: this.suggestImprovements()
        };
    }

    calculateAverageConfidence() {
        if (this.decisionHistory.length === 0) return 0;
        
        const totalConfidence = this.decisionHistory.reduce((sum, d) => sum + d.confidence, 0);
        return totalConfidence / this.decisionHistory.length;
    }

    suggestImprovements() {
        const suggestions = [];
        const recentMetrics = this.getRecentPerformanceMetrics();
        
        if (recentMetrics.avgReturn < 0.02) {
            suggestions.push("Consider more aggressive yield opportunities");
        }
        
        if (this.calculateAverageConfidence() < 0.7) {
            suggestions.push("Improve data quality and agent coordination");
        }
        
        if (this.calculateHistoricalSuccessRate() < 0.6) {
            suggestions.push("Review and adjust risk parameters");
        }
        
        return suggestions;
    }

    formatPerformanceReview(review) {
        return `
📊 **Performance Review Report**

**Decision Statistics:**
• Total decisions: ${review.totalDecisions}
• Rebalance decisions: ${review.rebalanceDecisions}
• Hold decisions: ${review.holdDecisions}
• Success rate: ${(review.successRate * 100).toFixed(1)}%

**Recent Performance:**
• Average return: ${(review.recentPerformance.avgReturn * 100).toFixed(2)}%
• Sample size: ${review.recentPerformance.sampleSize} decisions

**Quality Metrics:**
• Average confidence: ${(review.avgConfidence * 100).toFixed(1)}%

**Improvement Suggestions:**
${review.improvements.length > 0 ? 
    review.improvements.map(s => `• ${s}`).join('\n') :
    '• Performance is within acceptable parameters'
}

*Review generated: ${new Date().toLocaleString()}*
        `.trim();
    }
}

export default VotingCoordinator; 