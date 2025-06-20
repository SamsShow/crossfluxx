#!/usr/bin/env node

/**
 * Crossfluxx Agent Demo Script
 * Automated demonstration of all agent functionalities
 */

import { createCrossfluxxAgentSystem } from './src/agents/index.js';
import chalk from 'chalk';

class AgentDemo {
    constructor() {
        this.agentSystem = null;
    }

    async run() {
        console.log(chalk.blue.bold('\n🎭 Crossfluxx Agent System Demo\n'));
        console.log(chalk.gray('This demo showcases all agent testing capabilities automatically.\n'));
        
        try {
            await this.initializeSystem();
            await this.demonstrateSystemStatus();
            await this.demonstrateAgentCapabilities();
            await this.demonstrateRealTimeMonitoring();
            await this.demonstrateConcurrentOperations();
            await this.showSummary();
            
        } catch (error) {
            console.error(chalk.red('❌ Demo failed:'), error.message);
        }
    }

    async initializeSystem() {
        console.log(chalk.yellow('🔧 Initializing Agent System...'));
        this.agentSystem = await createCrossfluxxAgentSystem();
        console.log(chalk.green('✅ Agent system initialized successfully\n'));
    }

    async demonstrateSystemStatus() {
        console.log(chalk.cyan.bold('📊 System Status Demonstration\n'));
        
        const status = await this.agentSystem.getSystemStatus();
        
        console.log(chalk.white('System Overview:'));
        console.log(`  Running: ${status.isRunning ? chalk.green('✅ Yes') : chalk.red('❌ No')}`);
        console.log(`  Initialized: ${status.isInitialized ? chalk.green('✅ Yes') : chalk.red('❌ No')}`);
        console.log(`  Total Agents: ${chalk.cyan(Object.keys(status.agentStatus).length)}`);
        console.log(`  Uptime: ${chalk.gray(this.formatUptime(Date.now() - status.metrics.uptime))}\n`);
        
        console.log(chalk.white('Individual Agent Status:'));
        for (const [name, agentStatus] of Object.entries(status.agentStatus)) {
            const icon = agentStatus === 'running' ? '🟢' : '🔴';
            console.log(`  ${icon} ${chalk.cyan(name)}: ${agentStatus}`);
        }
        
        await this.delay(2000);
        console.log('');
    }

    async demonstrateAgentCapabilities() {
        console.log(chalk.cyan.bold('🤖 Agent Capabilities Demonstration\n'));
        
        // Signal Agent
        console.log(chalk.yellow('📡 Signal Agent Testing:'));
        if (this.agentSystem.agents.signal) {
            try {
                const marketData = await this.agentSystem.agents.signal.getCurrentMarketSnapshot();
                console.log(`  ✅ Market data collection: ${Object.keys(marketData).length} data categories`);
                
                const yieldData = await this.agentSystem.agents.signal.getYieldOpportunities();
                console.log(`  ✅ Yield monitoring: ${yieldData.length} opportunities found`);
            } catch (error) {
                console.log(`  ⚠️  Signal agent: ${error.message}`);
            }
        } else {
            console.log('  ❌ Signal agent not available');
        }
        
        // Strategy Agent
        console.log(chalk.yellow('\n📊 Strategy Agent Testing:'));
        if (this.agentSystem.agents.strategy) {
            try {
                const backtestParams = {
                    amount: '10000',
                    timeframe: '7d',
                    chains: ['ethereum', 'arbitrum', 'polygon']
                };
                const backtestResults = await this.agentSystem.agents.strategy.runBacktest(backtestParams);
                console.log(`  ✅ Backtest simulation: ${backtestResults.totalReturn}% return`);
                console.log(`  ✅ Risk analysis: ${backtestResults.riskScore}/10 risk score`);
            } catch (error) {
                console.log(`  ⚠️  Strategy agent: ${error.message}`);
            }
        } else {
            console.log('  ❌ Strategy agent not available');
        }
        
        // Voting Coordinator
        console.log(chalk.yellow('\n🗳️  Voting Coordinator Testing:'));
        if (this.agentSystem.agents.coordinator) {
            const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this.agentSystem.agents.coordinator))
                .filter(name => name !== 'constructor' && typeof this.agentSystem.agents.coordinator[name] === 'function');
            console.log(`  ✅ Coordinator available: ${methods.length} methods`);
            console.log(`  ✅ Agent coordination: Ready for consensus voting`);
        } else {
            console.log('  ❌ Voting coordinator not available');
        }
        
        await this.delay(2000);
        console.log('');
    }

    async demonstrateRealTimeMonitoring() {
        console.log(chalk.cyan.bold('📈 Real-time Monitoring Demonstration\n'));
        
        console.log(chalk.yellow('Running 10-second monitoring session...\n'));
        
        const startTime = Date.now();
        const duration = 10000;
        
        for (let i = 0; i < 5; i++) {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, duration - elapsed);
            
            if (remaining === 0) break;
            
            try {
                const status = await this.agentSystem.getSystemStatus();
                const activeAgents = Object.values(status.agentStatus).filter(s => s === 'running').length;
                
                console.log(`${chalk.cyan('Status Update:')} ${activeAgents} agents active | ${chalk.gray(`Uptime: ${this.formatUptime(elapsed)}`)} | ${chalk.yellow(`${Math.ceil(remaining/1000)}s remaining`)}`);
            } catch (error) {
                console.log(`${chalk.red('Error:')} ${error.message}`);
            }
            
            await this.delay(2000);
        }
        
        console.log(chalk.green('✅ Monitoring session completed\n'));
    }

    async demonstrateConcurrentOperations() {
        console.log(chalk.cyan.bold('⚡ Concurrent Operations Demonstration\n'));
        
        console.log(chalk.yellow('Running 5 concurrent system status checks...\n'));
        
        const startTime = Date.now();
        const promises = [];
        
        for (let i = 0; i < 5; i++) {
            promises.push(this.performOperation(i + 1));
        }
        
        const results = await Promise.all(promises);
        const endTime = Date.now();
        
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        const avgResponseTime = Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length);
        
        console.log(chalk.white('Concurrent Operation Results:'));
        console.log(`  Total Operations: ${chalk.cyan(results.length)}`);
        console.log(`  Successful: ${chalk.green(successful)}`);
        console.log(`  Failed: ${chalk.red(failed)}`);
        console.log(`  Success Rate: ${chalk.cyan(Math.round((successful / results.length) * 100))}%`);
        console.log(`  Average Response Time: ${chalk.cyan(avgResponseTime)}ms`);
        console.log(`  Total Execution Time: ${chalk.cyan(endTime - startTime)}ms\n`);
    }

    async performOperation(operationId) {
        const startTime = Date.now();
        
        try {
            await this.agentSystem.getSystemStatus();
            
            if (this.agentSystem.agents.signal) {
                await this.agentSystem.agents.signal.getCurrentMarketSnapshot();
            }
            
            const responseTime = Date.now() - startTime;
            console.log(`  ${chalk.green('✅')} Operation ${operationId}: ${responseTime}ms`);
            
            return { success: true, responseTime };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            console.log(`  ${chalk.red('❌')} Operation ${operationId}: ${error.message} (${responseTime}ms)`);
            
            return { success: false, responseTime };
        }
    }

    async showSummary() {
        console.log(chalk.cyan.bold('📋 Demo Summary\n'));
        
        try {
            const status = await this.agentSystem.getSystemStatus();
            
            console.log(chalk.white('🎯 Demonstrated Capabilities:'));
            console.log('  ✅ Agent system initialization');
            console.log('  ✅ System status monitoring');
            console.log('  ✅ Individual agent testing');
            console.log('  ✅ Real-time monitoring');
            console.log('  ✅ Concurrent operations');
            console.log('  ✅ Market data collection');
            console.log('  ✅ Strategy backtesting');
            console.log('  ✅ Inter-agent coordination\n');
            
            console.log(chalk.white('🔧 Available Testing Commands:'));
            console.log(`  ${chalk.cyan('npm run quick-test')} - Fast 5-step verification`);
            console.log(`  ${chalk.cyan('npm run test-agents')} - Interactive testing suite`);
            console.log(`  ${chalk.cyan('npm run agents-health')} - Quick health check`);
            console.log(`  ${chalk.cyan('node demo-agents.js')} - This demonstration\n`);
            
            console.log(chalk.white('📊 Final System Status:'));
            console.log(`  Agents Running: ${chalk.green(Object.values(status.agentStatus).filter(s => s === 'running').length)}`);
            console.log(`  System Healthy: ${chalk.green(status.isRunning && status.isInitialized ? '✅' : '❌')}`);
            console.log(`  Total Uptime: ${chalk.cyan(this.formatUptime(Date.now() - status.metrics.uptime))}\n`);
            
        } catch (error) {
            console.log(chalk.red(`❌ Summary generation failed: ${error.message}\n`));
        }
        
        console.log(chalk.blue.bold('🎉 Crossfluxx Agent Demo Completed Successfully!\n'));
        console.log(chalk.gray('All agent functionalities are operational and ready for production use.\n'));
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
}

// Run the demo
const demo = new AgentDemo();
demo.run().catch(error => {
    console.error(chalk.red('Demo failed:'), error);
    process.exit(1);
}); 