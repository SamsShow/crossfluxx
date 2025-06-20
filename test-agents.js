#!/usr/bin/env node

/**
 * Crossfluxx Agent Testing Script
 * Test all agent functionalities from the terminal
 */

import { createCrossfluxxAgentSystem } from './src/agents/index.js';
import chalk from 'chalk';
import readline from 'readline';

// Create readline interface for user interaction
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class AgentTester {
    constructor() {
        this.agentSystem = null;
        this.isRunning = false;
    }

    async initialize() {
        console.log(chalk.blue.bold('\n🤖 Crossfluxx Agent Testing Suite\n'));
        console.log(chalk.yellow('Initializing agent system...'));
        
        try {
            this.agentSystem = await createCrossfluxxAgentSystem();
            console.log(chalk.green('✅ Agent system initialized successfully\n'));
            return true;
        } catch (error) {
            console.error(chalk.red('❌ Failed to initialize agent system:'), error.message);
            return false;
        }
    }

    async runMainMenu() {
        const menuOptions = `
${chalk.cyan.bold('=== Crossfluxx Agent Testing Menu ===')}

${chalk.white('1.')} Test Signal Agent (Market Data Collection)
${chalk.white('2.')} Test Strategy Agent (Backtesting & Analysis)
${chalk.white('3.')} Test Voting Coordinator (Consensus Decision)
${chalk.white('4.')} Test Complete Rebalance Flow
${chalk.white('5.')} Check Agent Health Status
${chalk.white('6.')} View Agent Metrics
${chalk.white('7.')} Test Real-time Market Monitoring
${chalk.white('8.')} Force Agent Reset
${chalk.white('9.')} Stress Test All Agents
${chalk.white('0.')} Exit

${chalk.yellow('Enter your choice:')} `;

        this.isRunning = true;
        while (this.isRunning) {
            const choice = await this.askQuestion(menuOptions);
            await this.handleMenuChoice(choice.trim());
        }
    }

    async handleMenuChoice(choice) {
        try {
            switch (choice) {
                case '1':
                    await this.testSignalAgent();
                    break;
                case '2':
                    await this.testStrategyAgent();
                    break;
                case '3':
                    await this.testVotingCoordinator();
                    break;
                case '4':
                    await this.testCompleteRebalanceFlow();
                    break;
                case '5':
                    await this.checkAgentHealth();
                    break;
                case '6':
                    await this.viewAgentMetrics();
                    break;
                case '7':
                    await this.testRealTimeMonitoring();
                    break;
                case '8':
                    await this.forceAgentReset();
                    break;
                case '9':
                    await this.stressTestAgents();
                    break;
                case '0':
                    await this.exitTesting();
                    break;
                default:
                    console.log(chalk.red('Invalid choice. Please try again.'));
            }
        } catch (error) {
            console.error(chalk.red('❌ Error executing test:'), error.message);
        }
        
        if (this.isRunning) {
            await this.askQuestion(chalk.gray('\nPress Enter to continue...'));
        }
    }

    async testSignalAgent() {
        console.log(chalk.blue.bold('\n📡 Testing Signal Agent\n'));
        
        console.log(chalk.yellow('1. Testing signal agent availability...'));
        if (!this.agentSystem.agents.signal) {
            console.log(chalk.red('❌ Signal agent not available'));
            return;
        }
        
        console.log(chalk.yellow('2. Testing market data collection...'));
        try {
            const marketData = await this.agentSystem.agents.signal.getCurrentMarketSnapshot();
            this.displayMarketData(marketData);
        } catch (error) {
            console.log(chalk.red(`❌ Market data collection failed: ${error.message}`));
        }
        
        console.log(chalk.yellow('\n3. Testing yield monitoring...'));
        try {
            const yieldData = await this.agentSystem.agents.signal.getYieldOpportunities();
            this.displayYieldData(yieldData);
        } catch (error) {
            console.log(chalk.red(`❌ Yield monitoring failed: ${error.message}`));
        }
        
        console.log(chalk.yellow('\n4. Testing signal agent methods...'));
        const signalMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(this.agentSystem.agents.signal))
            .filter(name => name !== 'constructor' && typeof this.agentSystem.agents.signal[name] === 'function');
        console.log(chalk.cyan(`Available methods: ${signalMethods.join(', ')}`));
        
        console.log(chalk.green('\n✅ Signal Agent test completed'));
    }

    async testStrategyAgent() {
        console.log(chalk.blue.bold('\n📊 Testing Strategy Agent\n'));
        
        console.log(chalk.yellow('1. Testing strategy agent availability...'));
        if (!this.agentSystem.agents.strategy) {
            console.log(chalk.red('❌ Strategy agent not available'));
            return;
        }
        
        console.log(chalk.yellow('2. Testing backtest simulation...'));
        const backtestParams = {
            amount: '10000',
            timeframe: '7d',
            chains: ['ethereum', 'arbitrum', 'polygon']
        };
        try {
            const backtestResults = await this.agentSystem.agents.strategy.runBacktest(backtestParams);
            this.displayBacktestResults(backtestResults);
        } catch (error) {
            console.log(chalk.red(`❌ Backtest simulation failed: ${error.message}`));
        }
        
        console.log(chalk.yellow('\n3. Testing strategy methods...'));
        const strategyMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(this.agentSystem.agents.strategy))
            .filter(name => name !== 'constructor' && typeof this.agentSystem.agents.strategy[name] === 'function');
        console.log(chalk.cyan(`Available methods: ${strategyMethods.join(', ')}`));
        
        console.log(chalk.yellow('\n4. Testing fork environment...'));
        try {
            const forkStatus = this.agentSystem.agents.strategy.forkEnvironments ? 'Available' : 'Not Available';
            console.log(chalk.cyan(`Fork environments: ${forkStatus}`));
        } catch (error) {
            console.log(chalk.red(`❌ Fork environment test failed: ${error.message}`));
        }
        
        console.log(chalk.green('\n✅ Strategy Agent test completed'));
    }

    async testVotingCoordinator() {
        console.log(chalk.blue.bold('\n🗳️  Testing Voting Coordinator\n'));
        
        console.log(chalk.yellow('1. Testing coordinator availability...'));
        if (!this.agentSystem.agents.coordinator) {
            console.log(chalk.red('❌ Voting coordinator not available'));
            return;
        }
        
        console.log(chalk.yellow('2. Testing coordinator methods...'));
        const coordinatorMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(this.agentSystem.agents.coordinator))
            .filter(name => name !== 'constructor' && typeof this.agentSystem.agents.coordinator[name] === 'function');
        console.log(chalk.cyan(`Available methods: ${coordinatorMethods.join(', ')}`));
        
        console.log(chalk.yellow('\n3. Testing voting coordination...'));
        try {
            // Test if the coordinator can coordinate with other agents
            const hasSignal = this.agentSystem.agents.signal ? 'Yes' : 'No';
            const hasStrategy = this.agentSystem.agents.strategy ? 'Yes' : 'No';
            console.log(chalk.cyan(`Signal Agent available: ${hasSignal}`));
            console.log(chalk.cyan(`Strategy Agent available: ${hasStrategy}`));
        } catch (error) {
            console.log(chalk.red(`❌ Coordinator test failed: ${error.message}`));
        }
        
        console.log(chalk.yellow('\n4. Testing decision framework...'));
        try {
            // Test the decision making capability
            const hasDecisionLogic = typeof this.agentSystem.agents.coordinator.coordinateDecision === 'function';
            console.log(chalk.cyan(`Decision logic available: ${hasDecisionLogic}`));
        } catch (error) {
            console.log(chalk.red(`❌ Decision framework test failed: ${error.message}`));
        }
        
        console.log(chalk.green('\n✅ Voting Coordinator test completed'));
    }

    async testCompleteRebalanceFlow() {
        console.log(chalk.blue.bold('\n⚖️  Testing Complete Rebalance Flow\n'));
        
        const steps = [
            'Checking system status',
            'Collecting market data',
            'Testing agent availability', 
            'Running rebalance evaluation',
            'Checking agent communication',
            'Verifying system metrics'
        ];
        
        for (let i = 0; i < steps.length; i++) {
            console.log(chalk.yellow(`${i + 1}. ${steps[i]}...`));
            await this.delay(1000); // Simulate processing time
            
            switch (i) {
                case 0:
                    try {
                        const status = await this.agentSystem.getSystemStatus();
                        console.log(chalk.gray(`   System running: ${status.isRunning}, Agents: ${Object.keys(status.agentStatus).length}`));
                    } catch (error) {
                        console.log(chalk.gray(`   Error: ${error.message}`));
                    }
                    break;
                case 1:
                    try {
                        const marketData = await this.agentSystem.getCurrentMarketData();
                        console.log(chalk.gray(`   Market data collected successfully`));
                    } catch (error) {
                        console.log(chalk.gray(`   Market data collection: ${error.message}`));
                    }
                    break;
                case 2:
                    const signalAvailable = this.agentSystem.agents.signal ? 'Yes' : 'No';
                    const strategyAvailable = this.agentSystem.agents.strategy ? 'Yes' : 'No';
                    const coordinatorAvailable = this.agentSystem.agents.coordinator ? 'Yes' : 'No';
                    console.log(chalk.gray(`   Signal: ${signalAvailable}, Strategy: ${strategyAvailable}, Coordinator: ${coordinatorAvailable}`));
                    break;
                case 3:
                    try {
                        const decision = await this.agentSystem.forceRebalanceEvaluation();
                        console.log(chalk.gray(`   Decision: ${decision.action}, Confidence: ${decision.confidence}%`));
                    } catch (error) {
                        console.log(chalk.gray(`   Evaluation: ${error.message}`));
                    }
                    break;
                case 4:
                    const hasStrategyAgent = !!this.agentSystem.agents.strategy;
                    const hasSignalAgent = !!this.agentSystem.agents.signal;
                    const hasCoordinator = !!this.agentSystem.agents.coordinator;
                    console.log(chalk.gray(`   Inter-agent communication potential: ${hasStrategyAgent && hasSignalAgent && hasCoordinator ? 'Full' : 'Partial'}`));
                    break;
                case 5:
                    try {
                        const status = await this.agentSystem.getSystemStatus();
                        console.log(chalk.gray(`   Metrics tracked: ${Object.keys(status.metrics).length} categories`));
                    } catch (error) {
                        console.log(chalk.gray(`   Metrics: ${error.message}`));
                    }
                    break;
            }
        }
        
        console.log(chalk.green('\n✅ Complete rebalance flow test completed'));
    }

    async checkAgentHealth() {
        console.log(chalk.blue.bold('\n🏥 Checking Agent Health Status\n'));
        
        const status = await this.agentSystem.getSystemStatus();
        
        console.log(chalk.cyan('System Status Overview:'));
        console.log(`Initialized: ${this.getStatusIcon(status.isInitialized ? 'healthy' : 'error')} ${status.isInitialized}`);
        console.log(`Running: ${this.getStatusIcon(status.isRunning ? 'healthy' : 'error')} ${status.isRunning}`);
        console.log(`Uptime: ${this.formatUptime(Date.now() - status.metrics.uptime)}`);
        console.log(`Last Rebalance Check: ${status.lastRebalanceCheck ? new Date(status.lastRebalanceCheck).toLocaleString() : 'Never'}\n`);
        
        console.log(chalk.cyan('Individual Agent Status:'));
        for (const [agentName, agentStatus] of Object.entries(status.agentStatus)) {
            const icon = this.getStatusIcon(agentStatus === 'running' ? 'healthy' : 'error');
            console.log(`${icon} ${agentName}: ${agentStatus}`);
            
            // Test if agent is actually responsive
            const agent = this.agentSystem.agents[agentName];
            if (agent) {
                try {
                    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(agent))
                        .filter(name => name !== 'constructor' && typeof agent[name] === 'function');
                    console.log(chalk.gray(`   Methods: ${methods.length} available`));
                } catch (error) {
                    console.log(chalk.red(`   Error checking methods: ${error.message}`));
                }
            }
        }
        
        console.log(chalk.cyan('\nSystem Metrics:'));
        console.log(`Total Decisions: ${status.metrics.totalDecisions}`);
        console.log(`Successful Rebalances: ${status.metrics.successfulRebalances}`);
        console.log(`Errors: ${status.metrics.errors}`);
    }

    async viewAgentMetrics() {
        console.log(chalk.blue.bold('\n📈 Agent Metrics Dashboard\n'));
        
        const status = await this.agentSystem.getSystemStatus();
        
        console.log(chalk.cyan('System Metrics:'));
        console.log(`Total Decisions: ${status.metrics.totalDecisions}`);
        console.log(`Successful Rebalances: ${status.metrics.successfulRebalances}`);
        console.log(`System Errors: ${status.metrics.errors}`);
        console.log(`Uptime: ${this.formatUptime(Date.now() - status.metrics.uptime)}\n`);
        
        console.log(chalk.cyan('Agent Status Overview:'));
        for (const [agentName, agentStatus] of Object.entries(status.agentStatus)) {
            console.log(chalk.white(`\n${agentName}:`));
            console.log(`  Status: ${agentStatus}`);
            console.log(`  Available: ${this.agentSystem.agents[agentName] ? 'Yes' : 'No'}`);
            
            // Check agent methods if available
            const agent = this.agentSystem.agents[agentName];
            if (agent) {
                const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(agent))
                    .filter(name => name !== 'constructor' && typeof agent[name] === 'function');
                console.log(`  Methods: ${methods.length} available`);
                console.log(`  Key methods: ${methods.slice(0, 3).join(', ')}${methods.length > 3 ? '...' : ''}`);
            }
        }
        
        console.log(chalk.cyan('\nSystem Health:'));
        console.log(`Initialized: ${status.isInitialized ? '✅' : '❌'}`);
        console.log(`Running: ${status.isRunning ? '✅' : '❌'}`);
        console.log(`Last Rebalance Check: ${status.lastRebalanceCheck ? new Date(status.lastRebalanceCheck).toLocaleString() : 'Never'}`);
    }

    async testRealTimeMonitoring() {
        console.log(chalk.blue.bold('\n📊 Testing Real-time Monitoring\n'));
        
        console.log(chalk.yellow('Starting 15-second monitoring session...'));
        console.log(chalk.gray('(Press Ctrl+C to stop early)\n'));
        
        const startTime = Date.now();
        const duration = 15000; // 15 seconds
        let intervalRef;
        
        const monitoringPromise = new Promise((resolve) => {
            intervalRef = setInterval(async () => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, duration - elapsed);
                
                if (remaining === 0) {
                    clearInterval(intervalRef);
                    console.log(chalk.green('\n✅ Monitoring session completed'));
                    resolve();
                    return;
                }
                
                try {
                    const status = await this.agentSystem.getSystemStatus();
                    const activeAgents = Object.values(status.agentStatus).filter(s => s === 'running').length;
                    const uptime = this.formatUptime(Date.now() - status.metrics.uptime);
                    
                    process.stdout.write(`\r${chalk.cyan('Status:')} ${activeAgents} agents active | ${chalk.gray(`Uptime: ${uptime}`)} | ${chalk.yellow(`${Math.ceil(remaining/1000)}s remaining`)}`);
                } catch (error) {
                    process.stdout.write(`\r${chalk.red('Error:')} ${error.message} | ${chalk.yellow(`${Math.ceil(remaining/1000)}s remaining`)}`);
                }
            }, 2000);
        });
        
        await monitoringPromise;
    }

    async forceAgentReset() {
        console.log(chalk.blue.bold('\n🔄 Force Agent Reset\n'));
        
        const confirm = await this.askQuestion(chalk.yellow('Are you sure you want to reset all agents? (y/N): '));
        
        if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
            console.log(chalk.yellow('Shutting down current system...'));
            try {
                await this.agentSystem.shutdown();
                console.log(chalk.gray('✅ System shutdown complete'));
            } catch (error) {
                console.log(chalk.gray(`⚠️  Shutdown: ${error.message}`));
            }
            
            console.log(chalk.yellow('Reinitializing agent system...'));
            try {
                this.agentSystem = await createCrossfluxxAgentSystem();
                console.log(chalk.green('✅ All agents have been reset and reinitialized'));
            } catch (error) {
                console.log(chalk.red(`❌ Reset failed: ${error.message}`));
            }
        } else {
            console.log(chalk.gray('Reset cancelled'));
        }
    }

    async stressTestAgents() {
        console.log(chalk.blue.bold('\n🔥 Stress Testing Agents\n'));
        
        const testParams = {
            concurrentRequests: 10,
            duration: 10000, // 10 seconds for demo
            operationTypes: ['system-status', 'market-data', 'agent-availability']
        };
        
        console.log(chalk.yellow(`Running stress test with ${testParams.concurrentRequests} concurrent operations for 10 seconds...\n`));
        
        const startTime = Date.now();
        let successful = 0;
        let failed = 0;
        let totalRequests = 0;
        const responseTimes = [];
        const errors = [];
        
        // Run concurrent requests
        const promises = [];
        for (let i = 0; i < testParams.concurrentRequests; i++) {
            promises.push(this.runStressTestBatch(testParams, startTime, responseTimes, errors));
        }
        
        const results = await Promise.all(promises);
        results.forEach(result => {
            successful += result.successful;
            failed += result.failed;
            totalRequests += result.requests;
        });
        
        const averageResponseTime = responseTimes.length > 0 ? 
            Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0;
        const peakResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;
        const successRate = totalRequests > 0 ? Math.round((successful / totalRequests) * 100) : 0;
        
        console.log(chalk.cyan('Stress Test Results:'));
        console.log(`Total Requests: ${totalRequests}`);
        console.log(`Successful: ${successful}`);
        console.log(`Failed: ${failed}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log(`Average Response Time: ${averageResponseTime}ms`);
        console.log(`Peak Response Time: ${peakResponseTime}ms`);
        
        if (errors.length > 0) {
            console.log(chalk.red('\nErrors encountered:'));
            errors.slice(0, 5).forEach(error => console.log(`  ${error}`));
            if (errors.length > 5) {
                console.log(`  ... and ${errors.length - 5} more errors`);
            }
        }
    }
    
    async runStressTestBatch(testParams, startTime, responseTimes, errors) {
        let successful = 0;
        let failed = 0;
        let requests = 0;
        
        while (Date.now() - startTime < testParams.duration) {
            const operationType = testParams.operationTypes[Math.floor(Math.random() * testParams.operationTypes.length)];
            const requestStart = Date.now();
            
            try {
                switch (operationType) {
                    case 'system-status':
                        await this.agentSystem.getSystemStatus();
                        break;
                    case 'market-data':
                        await this.agentSystem.getCurrentMarketData();
                        break;
                    case 'agent-availability':
                        // Check if agents are responsive
                        if (this.agentSystem.agents.signal) {
                            await this.agentSystem.agents.signal.getCurrentMarketSnapshot();
                        }
                        break;
                }
                successful++;
                responseTimes.push(Date.now() - requestStart);
            } catch (error) {
                failed++;
                errors.push(error.message);
            }
            
            requests++;
            
            // Small delay to prevent overwhelming
            await this.delay(100);
        }
        
        return { successful, failed, requests };
    }

    async exitTesting() {
        console.log(chalk.yellow('\nShutting down agent system...'));
        await this.agentSystem.shutdown();
        console.log(chalk.green('✅ Agent system shutdown complete'));
        console.log(chalk.blue('👋 Thanks for testing Crossfluxx agents!\n'));
        this.isRunning = false;
        rl.close();
    }

    // Helper methods
    displayMarketData(data) {
        console.log(chalk.cyan('Market Data Summary:'));
        for (const [chain, chainData] of Object.entries(data.chains)) {
            console.log(`\n${chalk.white(chain.toUpperCase())}:`);
            for (const [protocol, protocolData] of Object.entries(chainData.protocols)) {
                console.log(`  ${protocol}: ${(protocolData.apr * 100).toFixed(2)}% APR`);
            }
        }
    }

    displayYieldData(data) {
        console.log(chalk.cyan('Top Yield Opportunities:'));
        data.slice(0, 5).forEach((opportunity, index) => {
            console.log(`${index + 1}. ${opportunity.protocol} on ${opportunity.chain}: ${(opportunity.apy * 100).toFixed(2)}% APY`);
        });
    }

    displayAlerts(alerts) {
        if (alerts.length === 0) {
            console.log(chalk.gray('No active price alerts'));
        } else {
            console.log(chalk.cyan('Active Alerts:'));
            alerts.forEach(alert => {
                console.log(`⚠️  ${alert.type}: ${alert.message}`);
            });
        }
    }

    displayStrategies(strategies) {
        console.log(chalk.cyan('Strategy Analysis:'));
        strategies.forEach((strategy, index) => {
            console.log(`${index + 1}. ${strategy.name}: Score ${strategy.score}/10`);
        });
    }

    displayBacktestResults(results) {
        console.log(chalk.cyan('Backtest Results:'));
        console.log(`Initial Amount: $${results.initialAmount}`);
        console.log(`Final Amount: $${results.finalAmount}`);
        console.log(`Total Return: ${results.totalReturn}%`);
        console.log(`Sharpe Ratio: ${results.sharpeRatio}`);
    }

    displayRiskAnalysis(analysis) {
        console.log(chalk.cyan('Risk Analysis:'));
        console.log(`Overall Risk Score: ${analysis.riskScore}/10`);
        console.log(`Volatility: ${(analysis.volatility * 100).toFixed(2)}%`);
        console.log(`Max Drawdown: ${(analysis.maxDrawdown * 100).toFixed(2)}%`);
    }

    displayVotingResults(results) {
        console.log(chalk.cyan('Voting Results:'));
        console.log(`Consensus: ${results.consensus}%`);
        console.log(`Participating Agents: ${results.votes.length}`);
        results.votes.forEach(vote => {
            console.log(`  ${vote.agent}: ${vote.decision} (${vote.confidence}% confidence)`);
        });
    }

    displayDecision(decision) {
        console.log(chalk.cyan('Final Decision:'));
        console.log(`Recommendation: ${decision.recommendation}`);
        console.log(`Confidence: ${decision.confidence}%`);
        console.log(`Reasoning: ${decision.reasoning}`);
    }

    displayConfidence(confidence) {
        console.log(chalk.cyan('Confidence Analysis:'));
        console.log(`Overall Confidence: ${confidence.overall}%`);
        console.log(`Data Quality: ${confidence.dataQuality}%`);
        console.log(`Model Certainty: ${confidence.modelCertainty}%`);
    }

    getStatusIcon(status) {
        const icons = {
            'healthy': '🟢',
            'warning': '🟡', 
            'error': '🔴',
            'inactive': '⚫'
        };
        return icons[status] || '❓';
    }

    formatUptime(uptime) {
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    askQuestion(question) {
        return new Promise(resolve => {
            rl.question(question, resolve);
        });
    }
}

// Main execution
async function main() {
    const tester = new AgentTester();
    
    if (await tester.initialize()) {
        await tester.runMainMenu();
    } else {
        console.log(chalk.red('Failed to initialize. Exiting...'));
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\nReceived interrupt signal. Shutting down...'));
    process.exit(0);
});

// Run the main function
main().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
}); 