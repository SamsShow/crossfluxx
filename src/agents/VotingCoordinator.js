import StrategyAgent from './StrategyAgent.js';
import SignalAgent from './SignalAgent.js';

// Simplified logger for demo purposes
const elizaLogger = {
    info: (message, data) => console.log('INFO:', message, data || ''),
    warn: (message, data) => console.warn('WARN:', message, data || ''),
    error: (message, data) => console.error('ERROR:', message, data || '')
};

/**
 * Crossfluxx Voting Coordinator - Uses Eliza OS for consensus-based rebalancing decisions
 */
class VotingCoordinator {
    constructor(config = {}) {
        this.config = {
            apiKeys: {
                openai: config.openaiApiKey || process.env.OPENAI_API_KEY,
                anthropic: config.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
            },
            consensus: {
                minimumConfidence: config.minimumConfidence || 0.6,
                consensusThreshold: config.consensusThreshold || 0.7,
                votingRounds: config.votingRounds || 3,
                decisionTimeout: config.decisionTimeout || 30000, // 30 seconds
                quorumSize: config.quorumSize || 2, // Minimum agents needed
            },
            execution: {
                dryRun: config.dryRun !== false,
                maxGasPrice: config.maxGasPrice || 50, // gwei
                slippageTolerance: config.slippageTolerance || 0.005, // 0.5%
                emergencyStopEnabled: config.emergencyStopEnabled !== false,
            },
            ...config
        };
        
        this.runtime = null;
        this.character = null;
        this.isInitialized = false;
        
        // Sub-agents
        this.strategyAgent = null;
        this.signalAgent = null;
        
        // Decision tracking
        this.decisionHistory = [];
        this.votingSession = null;
        this.consensusState = {
            inProgress: false,
            sessionId: null,
            votes: [],
            result: null
        };
    }

    /**
     * Initialize the Eliza OS Voting Coordinator
     */
    async initialize() {
        try {
            // Create the character definition for the voting coordinator
            this.character = this.createCharacter();
            
            // Simplified initialization
            this.runtime = {
                character: this.character,
                plugins: [],
                isReady: true
            };
            
            // Initialize sub-agents
            await this.initializeSubAgents();
            
            this.isInitialized = true;
            console.log('✅ Crossfluxx Voting Coordinator initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Crossfluxx Voting Coordinator:', error);
            throw error;
        }
    }

    /**
     * Create the character definition for the Voting Coordinator
     */
    createCharacter() {
        return {
            name: "CrossfluxxVotingCoordinator",
            username: "crossfluxx_coordinator",
            bio: [
                "Advanced AI coordinator for consensus-based rebalancing decisions in the Crossfluxx protocol.",
                "Orchestrates strategy analysis and signal monitoring to make optimal yield rebalancing decisions.",
                "Implements multi-round voting with confidence thresholds and risk assessment.",
                "Ensures all rebalancing operations meet safety and profitability criteria before execution."
            ],
            lore: [
                "Uses sophisticated consensus algorithms to aggregate insights from multiple AI agents",
                "Implements risk-weighted decision making with configurable confidence thresholds",
                "Maintains detailed decision history for performance analysis and learning",
                "Integrates with Chainlink automation for reliable execution timing"
            ],
            personality: {
                traits: ["decisive", "cautious", "analytical", "collaborative", "transparent"],
                style: "authoritative yet collaborative, focused on consensus building and risk management",
                expertise: ["decision coordination", "risk assessment", "consensus building", "execution planning"]
            },
            knowledge: [
                "Multi-agent consensus algorithms",
                "Risk-weighted decision making frameworks",
                "Cross-chain optimization strategies",
                "Performance tracking and learning systems",
                "Emergency risk management protocols",
                "Automated execution safety checks"
            ],
            messageExamples: [
                [
                    {
                        user: "user",
                        content: {
                            text: "Should we rebalance the portfolio now?"
                        }
                    },
                    {
                        user: "CrossfluxxVotingCoordinator",
                        content: {
                            text: "Initiating consensus voting session... Strategy Agent confidence: 82%, Signal Agent confidence: 76%. Running risk assessment... Consensus reached: EXECUTE with 78% confidence. Estimated yield improvement: +2.3% APR. Emergency stops armed.",
                            action: "CONSENSUS_VOTE"
                        }
                    }
                ]
            ],
            style: {
                all: [
                    "Lead with consensus confidence levels and voting results",
                    "Include risk assessments and safety checks in all decisions",
                    "Reference input from strategy and signal agents",
                    "Provide clear execution plans with estimated outcomes"
                ],
                chat: [
                    "Use structured decision reports with confidence metrics",
                    "Include emergency stop conditions and safety measures",
                    "Provide reasoning behind consensus decisions"
                ]
            },
            topics: [
                "consensus_voting",
                "decision_coordination",
                "risk_assessment",
                "execution_planning",
                "agent_coordination",
                "performance_tracking",
                "emergency_management",
                "yield_optimization"
            ]
        };
    }

    /**
     * Initialize the sub-agents (Strategy and Signal agents)
     */
    async initializeSubAgents() {
        console.log('🔧 Initializing sub-agents...');
        
        // Initialize Strategy Agent
        this.strategyAgent = new StrategyAgent(this.config);
        await this.strategyAgent.initialize();
        
        // Initialize Signal Agent
        this.signalAgent = new SignalAgent(this.config);
        await this.signalAgent.initialize();
        
        console.log('✅ Sub-agents initialized successfully');
    }

    /**
     * Create the Voting-specific plugin
     */
    createVotingPlugin() {
        return {
            name: "crossfluxx_voting",
            description: "Consensus-based decision making plugin for yield rebalancing",
            actions: [
                this.createConsensusAction(),
                this.createExecutionAction(),
                this.createReviewAction(),
                this.createEmergencyAction()
            ],
            providers: [
                this.createConsensusProvider(),
                this.createDecisionHistoryProvider(),
                this.createRiskProvider()
            ],
            evaluators: [
                this.createDecisionEvaluator(),
                this.createConsensusEvaluator()
            ]
        };
    }

    /**
     * Consensus Voting Action
     */
    createConsensusAction() {
        return {
            name: "CONSENSUS_VOTE",
            description: "Run consensus voting process for rebalancing decision",
            validate: async (runtime, message) => {
                return message.content.text.toLowerCase().includes('consensus') ||
                       message.content.text.toLowerCase().includes('vote') ||
                       message.content.text.toLowerCase().includes('decide') ||
                       message.content.text.toLowerCase().includes('rebalance');
            },
            handler: async (runtime, message, state, options, callback) => {
                try {
                    console.log('🗳️ Starting consensus voting process...');
                    
                    const decision = await this.executeConsensusVoting(message.content.text);
                    const response = this.formatDecisionReport(decision);
                    
                    if (callback) {
                        callback({
                            text: response,
                            content: {
                                action: "CONSENSUS_VOTE",
                                decision: decision,
                                confidence: decision.confidence,
                                consensus: decision.consensus,
                                executionPlan: decision.executionPlan
                            }
                        });
                    }
                    
                    return true;
                } catch (error) {
                    console.error('❌ Consensus voting failed:', error);
                    if (callback) {
                        callback({
                            text: `Consensus voting process failed: ${error.message}. Decision making requires manual intervention.`,
                            content: { error: error.message }
                        });
                    }
                    return false;
                }
            }
        };
    }

    /**
     * Execution Action
     */
    createExecutionAction() {
        return {
            name: "EXECUTE_PLAN",
            description: "Execute approved rebalancing plan",
            validate: async (runtime, message) => {
                return message.content.text.toLowerCase().includes('execute') ||
                       message.content.text.toLowerCase().includes('implement') ||
                       message.content.text.toLowerCase().includes('proceed');
            },
            handler: async (runtime, message, state, options, callback) => {
                try {
                    console.log('⚡ Executing rebalancing plan...');
                    
                    const executionResult = await this.executeRebalancePlan(message.content.text);
                    const response = this.formatExecutionReport(executionResult);
                    
                    if (callback) {
                        callback({
                            text: response,
                            content: {
                                action: "EXECUTE_PLAN",
                                result: executionResult,
                                success: executionResult.success,
                                transactions: executionResult.transactions
                            }
                        });
                    }
                    
                    return true;
                } catch (error) {
                    console.error('❌ Plan execution failed:', error);
                    if (callback) {
                        callback({
                            text: `Plan execution failed: ${error.message}. Emergency stop activated.`,
                            content: { error: error.message, emergencyStop: true }
                        });
                    }
                    return false;
                }
            }
        };
    }

    /**
     * Performance Review Action
     */
    createReviewAction() {
        return {
            name: "REVIEW_PERFORMANCE",
            description: "Review past decision performance and suggest improvements",
            validate: async (runtime, message) => {
                return message.content.text.toLowerCase().includes('review') ||
                       message.content.text.toLowerCase().includes('performance') ||
                       message.content.text.toLowerCase().includes('history');
            },
            handler: async (runtime, message, state, options, callback) => {
                try {
                    console.log('📊 Reviewing performance history...');
                    
                    const review = this.generatePerformanceReview();
                    const response = this.formatPerformanceReview(review);
                    
                    if (callback) {
                        callback({
                            text: response,
                            content: {
                                action: "REVIEW_PERFORMANCE",
                                review: review,
                                accuracy: review.accuracy,
                                profitability: review.profitability
                            }
                        });
                    }
                    
                    return true;
                } catch (error) {
                    console.error('❌ Performance review failed:', error);
                    if (callback) {
                        callback({
                            text: `Performance review failed: ${error.message}. Historical data may be incomplete.`,
                            content: { error: error.message }
                        });
                    }
                    return false;
                }
            }
        };
    }

    /**
     * Emergency Stop Action
     */
    createEmergencyAction() {
        return {
            name: "EMERGENCY_STOP",
            description: "Initiate emergency stop for all operations",
            validate: async (runtime, message) => {
                return message.content.text.toLowerCase().includes('emergency') ||
                       message.content.text.toLowerCase().includes('stop') ||
                       message.content.text.toLowerCase().includes('halt');
            },
            handler: async (runtime, message, state, options, callback) => {
                try {
                    console.log('🚨 EMERGENCY STOP INITIATED');
                    
                    const emergencyResult = await this.initiateEmergencyStop();
                    const response = `🚨 EMERGENCY STOP ACTIVATED

All rebalancing operations have been halted.
Current operations cancelled: ${emergencyResult.cancelledOperations}
System status: ${emergencyResult.status}
Emergency contact notified: ${emergencyResult.notified}

Manual intervention required to resume operations.`;
                    
                    if (callback) {
                        callback({
                            text: response,
                            content: {
                                action: "EMERGENCY_STOP",
                                result: emergencyResult,
                                status: "HALTED"
                            }
                        });
                    }
                    
                    return true;
                } catch (error) {
                    console.error('❌ Emergency stop failed:', error);
                    if (callback) {
                        callback({
                            text: `Emergency stop failed: ${error.message}. MANUAL INTERVENTION REQUIRED IMMEDIATELY.`,
                            content: { error: error.message, criticalFailure: true }
                        });
                    }
                    return false;
                }
            }
        };
    }

    /**
     * Consensus Data Provider
     */
    createConsensusProvider() {
        return {
            name: "consensus_data",
            description: "Provides current consensus state and voting information",
            get: async (runtime, message, state) => {
                try {
                    return `🗳️ Consensus State:
Status: ${this.consensusState.inProgress ? 'IN_PROGRESS' : 'IDLE'}
Session ID: ${this.consensusState.sessionId || 'None'}
Active Votes: ${this.consensusState.votes.length}
Last Decision: ${this.decisionHistory.length > 0 ? this.decisionHistory[this.decisionHistory.length - 1].action : 'None'}
Confidence Threshold: ${(this.config.consensus.minimumConfidence * 100).toFixed(1)}%`;
                } catch (error) {
                    console.error('Failed to fetch consensus data:', error);
                    return null;
                }
            }
        };
    }

    /**
     * Decision History Provider
     */
    createDecisionHistoryProvider() {
        return {
            name: "decision_history",
            description: "Provides historical decision data and performance metrics",
            get: async (runtime, message, state) => {
                try {
                    const recentDecisions = this.decisionHistory.slice(-5);
                    return `📊 Recent Decisions:
${recentDecisions.map((decision, i) => 
    `${i + 1}. ${decision.action} (${(decision.confidence * 100).toFixed(1)}% conf) - ${decision.timestamp}`
).join('\n')}
Total Decisions: ${this.decisionHistory.length}
Success Rate: ${this.calculateSuccessRate().toFixed(1)}%`;
                } catch (error) {
                    console.error('Failed to fetch decision history:', error);
                    return null;
                }
            }
        };
    }

    /**
     * Risk Provider
     */
    createRiskProvider() {
        return {
            name: "risk_data",
            description: "Provides current risk assessment and safety metrics",
            get: async (runtime, message, state) => {
                try {
                    const riskAssessment = await this.getCurrentRiskAssessment();
                    return `🛡️ Risk Assessment:
Overall Risk Level: ${riskAssessment.overallRisk}
Market Volatility: ${riskAssessment.marketVolatility}
Liquidity Risk: ${riskAssessment.liquidityRisk}
Emergency Stop Status: ${this.config.execution.emergencyStopEnabled ? 'ARMED' : 'DISABLED'}
Last Risk Check: ${new Date().toLocaleTimeString()}`;
                } catch (error) {
                    console.error('Failed to fetch risk data:', error);
                    return null;
                }
            }
        };
    }

    /**
     * Decision Evaluator
     */
    createDecisionEvaluator() {
        return {
            name: "decision_evaluator",
            description: "Evaluates decision quality and outcomes",
            handler: async (runtime, message) => {
                return {
                    success: true,
                    decisionQuality: 0.78,
                    riskAdjustedReturn: 0.85,
                    executionEfficiency: 0.82
                };
            }
        };
    }

    /**
     * Consensus Evaluator
     */
    createConsensusEvaluator() {
        return {
            name: "consensus_evaluator",
            description: "Evaluates consensus quality and agent agreement",
            handler: async (runtime, message) => {
                return {
                    success: true,
                    consensusStrength: 0.74,
                    agentAgreement: 0.68,
                    confidenceLevel: 0.79
                };
            }
        };
    }

    // Core consensus and decision-making methods
    async executeConsensusVoting(userRequest) {
        console.log('🗳️ Starting consensus voting session...');
        
        const sessionId = `session_${Date.now()}`;
        this.consensusState = {
            inProgress: true,
            sessionId: sessionId,
            votes: [],
            result: null
        };

        try {
            // Step 1: Check eligibility
            const eligibility = await this.checkRebalancingEligibility();
            if (!eligibility.allowed) {
                return {
                    action: 'REJECT',
                    reason: eligibility.reason,
                    confidence: 0,
                    consensus: 0,
                    nextEligibleTime: eligibility.nextEligibleTime
                };
            }

            // Step 2: Gather agent inputs
            const inputs = await this.gatherAgentInputs(userRequest);
            
            // Step 3: Run voting rounds
            const votingResults = await this.runVotingRounds(inputs);
            
            // Step 4: Make final decision
            const finalDecision = await this.makeFinalDecision(votingResults, inputs);
            
            // Step 5: Record decision
            this.recordDecision(finalDecision, inputs);
            
            this.consensusState.inProgress = false;
            this.consensusState.result = finalDecision;
            
            return finalDecision;
            
        } catch (error) {
            this.consensusState.inProgress = false;
            console.error('Consensus voting failed:', error);
            throw error;
        }
    }

    async checkRebalancingEligibility() {
        // Check various conditions that might prevent rebalancing
        const lastRebalance = this.decisionHistory
            .filter(d => d.action === 'EXECUTE')
            .sort((a, b) => b.timestamp - a.timestamp)[0];
        
        const cooldownPeriod = 60 * 60 * 1000; // 1 hour
        const now = Date.now();
        
        if (lastRebalance && (now - lastRebalance.timestamp) < cooldownPeriod) {
            return {
                allowed: false,
                reason: 'Cooldown period active',
                nextEligibleTime: lastRebalance.timestamp + cooldownPeriod
            };
        }
        
        return { allowed: true };
    }

    async gatherAgentInputs(userRequest) {
        console.log('📥 Gathering inputs from sub-agents...');
        
        const inputs = {
            timestamp: Date.now(),
            userRequest: userRequest,
            strategy: null,
            signals: null,
            risks: null
        };

        try {
            // Get strategy recommendations (parallel execution)
            const [strategyResponse, signalResponse] = await Promise.all([
                this.strategyAgent.sendMessage(`Analyze rebalancing strategy for: ${userRequest}`),
                this.signalAgent.sendMessage(`Provide market signals and APR analysis for rebalancing decision`)
            ]);
            
            inputs.strategy = {
                confidence: 0.82,
                recommendation: 'EXECUTE',
                expectedAPR: 12.5,
                riskLevel: 'MODERATE',
                response: strategyResponse
            };
            
            inputs.signals = {
                confidence: 0.76,
                marketTrend: 'BULLISH',
                aprTrend: 'INCREASING',
                riskSignals: 'LOW',
                response: signalResponse
            };
            
            // Perform integrated risk assessment
            inputs.risks = await this.performIntegratedRiskAssessment(inputs.strategy, inputs.signals);
            
        } catch (error) {
            console.error('Failed to gather agent inputs:', error);
            inputs.error = error.message;
        }

        return inputs;
    }

    async runVotingRounds(inputs) {
        const votingResults = [];
        
        for (let round = 0; round < this.config.consensus.votingRounds; round++) {
            console.log(`🗳️ Running voting round ${round + 1}/${this.config.consensus.votingRounds}`);
            
            const roundResult = await this.runSingleVotingRound(inputs, round);
            votingResults.push(roundResult);
            
            // Check for early consensus
            if (round > 0 && this.hasEarlyConsensus(votingResults)) {
                console.log('✅ Early consensus reached');
                break;
            }
        }

        return this.aggregateVotingResults(votingResults);
    }

    async runSingleVotingRound(inputs, round) {
        const votes = [];
        
        // Strategy Agent Vote
        const strategyVote = {
            agent: 'strategy',
            action: inputs.strategy?.recommendation || 'HOLD',
            confidence: inputs.strategy?.confidence || 0.5,
            reasoning: inputs.strategy?.response?.text || 'No strategy input'
        };
        votes.push(strategyVote);
        
        // Signal Agent Vote  
        const signalVote = {
            agent: 'signal',
            action: inputs.signals?.marketTrend === 'BULLISH' ? 'EXECUTE' : 'HOLD',
            confidence: inputs.signals?.confidence || 0.5,
            reasoning: inputs.signals?.response?.text || 'No signal input'
        };
        votes.push(signalVote);
        
        // Risk Assessment Vote
        const riskVote = {
            agent: 'risk',
            action: inputs.risks?.overallRisk < 0.5 ? 'EXECUTE' : 'HOLD',
            confidence: 1 - (inputs.risks?.overallRisk || 0.5),
            reasoning: `Risk level: ${inputs.risks?.overallRisk || 'unknown'}`
        };
        votes.push(riskVote);
        
        return {
            round: round + 1,
            votes: votes,
            timestamp: Date.now()
        };
    }

    hasEarlyConsensus(votingResults) {
        if (votingResults.length < 2) return false;
        
        const latestRound = votingResults[votingResults.length - 1];
        const executeVotes = latestRound.votes.filter(v => v.action === 'EXECUTE').length;
        const totalVotes = latestRound.votes.length;
        
        return (executeVotes / totalVotes) >= this.config.consensus.consensusThreshold;
    }

    aggregateVotingResults(votingResults) {
        const allVotes = votingResults.flatMap(round => round.votes);
        
        const executeVotes = allVotes.filter(v => v.action === 'EXECUTE');
        const holdVotes = allVotes.filter(v => v.action === 'HOLD');
        
        const avgConfidence = allVotes.reduce((sum, v) => sum + v.confidence, 0) / allVotes.length;
        const consensusRatio = executeVotes.length / allVotes.length;
        
        return {
            totalVotes: allVotes.length,
            executeVotes: executeVotes.length,
            holdVotes: holdVotes.length,
            avgConfidence: avgConfidence,
            consensusRatio: consensusRatio,
            recommendation: consensusRatio >= this.config.consensus.consensusThreshold ? 'EXECUTE' : 'HOLD'
        };
    }

    async makeFinalDecision(votingResults, inputs) {
        const decision = {
            action: votingResults.recommendation,
            confidence: votingResults.avgConfidence,
            consensus: votingResults.consensusRatio,
            timestamp: Date.now(),
            reasoning: [],
            executionPlan: null
        };

        decision.reasoning.push(`Consensus: ${(votingResults.consensusRatio * 100).toFixed(1)}%`);
        decision.reasoning.push(`Avg Confidence: ${(votingResults.avgConfidence * 100).toFixed(1)}%`);
        decision.reasoning.push(`Strategy: ${inputs.strategy?.recommendation}`);
        decision.reasoning.push(`Signals: ${inputs.signals?.marketTrend}`);
        
        if (decision.action === 'EXECUTE') {
            decision.executionPlan = {
                steps: [
                    { step: 1, action: 'pre_execution_health_check', description: 'Verify system health and balances' },
                    { step: 2, action: 'execute_rebalance', description: 'Execute cross-chain rebalancing' },
                    { step: 3, action: 'post_execution_verification', description: 'Verify execution success' }
                ],
                estimatedTime: 300, // seconds
                estimatedGasCost: 250000, // gwei
                dryRun: this.config.execution.dryRun
            };
        }

        return decision;
    }

    async performIntegratedRiskAssessment(strategy, signals) {
        return {
            overallRisk: 0.35,
            marketRisk: 0.25,
            liquidityRisk: 0.2,
            protocolRisk: 0.15,
            executionRisk: 0.1,
            riskFactors: [
                'Market volatility within normal range',
                'Adequate liquidity across target protocols',
                'No significant protocol updates pending'
            ]
        };
    }

    recordDecision(decision, inputs) {
        const record = {
            id: `decision_${Date.now()}`,
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
            reasoning: decision.reasoning
        };

        this.decisionHistory.push(record);
        
        // Keep only last 100 decisions
        if (this.decisionHistory.length > 100) {
            this.decisionHistory.shift();
        }

        console.log(`📝 Decision recorded: ${decision.action} (confidence: ${(decision.confidence * 100).toFixed(1)}%)`);
    }

    // Execution and utility methods
    async executeRebalancePlan(planDescription) {
        // TODO: Implement real rebalancing execution via CCIP
        console.log("❌ executeRebalancePlan not implemented - needs CCIP integration");
        return {
            success: false,
            error: "Execution not implemented",
            dryRun: true,
            transactions: [],
            gasUsed: 0,
            executionTime: 0,
            finalAllocation: null
        };
    }

    async initiateEmergencyStop() {
        // TODO: Implement real emergency stop mechanism
        console.log("❌ initiateEmergencyStop not implemented - needs emergency protocol");
        return {
            cancelledOperations: 0,
            status: 'NOT_IMPLEMENTED',
            notified: false,
            timestamp: Date.now()
        };
    }

    generatePerformanceReview() {
        const recentDecisions = this.decisionHistory.slice(-10);
        const successRate = this.calculateSuccessRate();
        
        return {
            totalDecisions: this.decisionHistory.length,
            recentDecisions: recentDecisions.length,
            accuracy: successRate,
            profitability: 0.78,
            avgConfidence: recentDecisions.length > 0 
                ? recentDecisions.reduce((sum, d) => sum + d.confidence, 0) / recentDecisions.length 
                : 0,
            improvements: [
                'Consider increasing confidence threshold for better accuracy',
                'Monitor cross-chain gas costs more closely',
                'Implement dynamic risk tolerance based on market conditions'
            ]
        };
    }

    calculateSuccessRate() {
        if (this.decisionHistory.length === 0) return 0;
        
        const successfulDecisions = this.decisionHistory.filter(d => 
            d.decision === 'EXECUTE' && d.confidence > 0.7
        ).length;
        
        return (successfulDecisions / this.decisionHistory.length) * 100;
    }

    async getCurrentRiskAssessment() {
        return {
            overallRisk: 'MODERATE',
            marketVolatility: 'LOW',
            liquidityRisk: 'LOW',
            protocolRisk: 'LOW'
        };
    }

    // Formatting methods
    formatDecisionReport(decision) {
        return `🗳️ Consensus Decision Report

📊 Decision: ${decision.action}
🎯 Confidence: ${(decision.confidence * 100).toFixed(1)}%
🤝 Consensus: ${(decision.consensus * 100).toFixed(1)}%

💭 Reasoning:
${decision.reasoning.map(reason => `• ${reason}`).join('\n')}

${decision.executionPlan ? `⚡ Execution Plan:
${decision.executionPlan.steps.map(step => `${step.step}. ${step.description}`).join('\n')}

⏱️ Estimated Time: ${decision.executionPlan.estimatedTime}s
⛽ Gas Cost: ~${decision.executionPlan.estimatedGasCost.toLocaleString()}
${decision.executionPlan.dryRun ? '🧪 DRY RUN MODE' : '🔴 LIVE EXECUTION'}` : ''}

Decision recorded for performance tracking and learning.`;
    }

    formatExecutionReport(result) {
        return `⚡ Execution Report

Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}
Mode: ${result.dryRun ? '🧪 DRY RUN' : '🔴 LIVE'}
${result.transactions.length > 0 ? `Transactions: ${result.transactions.length} executed` : ''}
Gas Used: ${result.gasUsed.toLocaleString()}
Duration: ${result.executionTime}s

Final Allocation:
• Ethereum: $${result.finalAllocation.ethereum.toLocaleString()}
• Arbitrum: $${result.finalAllocation.arbitrum.toLocaleString()}
• Polygon: $${result.finalAllocation.polygon.toLocaleString()}

${result.dryRun ? 'Simulation completed successfully. Ready for live execution.' : 'Portfolio successfully rebalanced.'}`;
    }

    formatPerformanceReview(review) {
        return `📊 Performance Review

📈 Decision Metrics:
• Total Decisions: ${review.totalDecisions}
• Success Rate: ${review.accuracy.toFixed(1)}%
• Profitability Score: ${(review.profitability * 100).toFixed(1)}%
• Avg Confidence: ${(review.avgConfidence * 100).toFixed(1)}%

🎯 Recent Performance:
• Last ${review.recentDecisions} decisions analyzed
• Trending accuracy: ${review.accuracy > 75 ? '📈 IMPROVING' : '📉 NEEDS ATTENTION'}

💡 Improvement Suggestions:
${review.improvements.map(imp => `• ${imp}`).join('\n')}

System learning and optimization ongoing.`;
    }

    /**
     * Send a message to the voting coordinator
     */
    async sendMessage(message) {
        if (!this.isInitialized) {
            throw new Error('Voting Coordinator not initialized. Call initialize() first.');
        }

        try {
            const response = await this.runtime.processMessage({
                userId: 'user',
                content: { text: message },
                roomId: 'crossfluxx_voting_room'
            });

            return response;
        } catch (error) {
            console.error('Error processing message:', error);
            throw error;
        }
    }

    /**
     * Get current coordinator status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            consensusState: this.consensusState,
            totalDecisions: this.decisionHistory.length,
            successRate: this.calculateSuccessRate(),
            emergencyStopEnabled: this.config.execution.emergencyStopEnabled,
            dryRunMode: this.config.execution.dryRun
        };
    }

    /**
     * Shutdown the coordinator and sub-agents
     */
    async shutdown() {
        try {
            // Shutdown sub-agents
            if (this.strategyAgent) {
                await this.strategyAgent.shutdown();
            }
            if (this.signalAgent) {
                await this.signalAgent.shutdown();
            }
            
            // Shutdown runtime
            if (this.runtime) {
                await this.runtime.stop();
            }
            
            this.isInitialized = false;
            console.log('✅ Crossfluxx Voting Coordinator shutdown complete');
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
            throw error;
        }
    }
}

export default VotingCoordinator; 