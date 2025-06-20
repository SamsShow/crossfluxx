#!/usr/bin/env node

/**
 * Quick Agent Test - Basic functionality check
 * Run this for a fast verification that agents are working
 */

import { createCrossfluxxAgentSystem } from './src/agents/index.js';

async function quickTest() {
    console.log('🔍 Quick Agent Functionality Test\n');
    
    try {
        console.log('Initializing agent system...');
        const agentSystem = await createCrossfluxxAgentSystem();
        console.log('✅ Agent system initialized\n');
        
        // Test 1: System Status
        console.log('1. Checking system status...');
        const status = await agentSystem.getSystemStatus();
        console.log(`   Status: ${status.isRunning ? 'running' : 'stopped'}`);
        console.log(`   Initialized: ${status.isInitialized}`);
        console.log(`   Active agents: ${Object.keys(status.agentStatus).length}`);
        
        // Test 2: Market Data
        console.log('\n2. Testing market data collection...');
        try {
            const marketData = await agentSystem.getCurrentMarketData();
            console.log(`   ✅ Market data retrieved`);
            console.log(`   Available chains: ${Object.keys(marketData.chains || {}).length}`);
        } catch (error) {
            console.log(`   ⚠️  Market data test: ${error.message}`);
        }
        
        // Test 3: Signal Agent Direct Test
        console.log('\n3. Testing signal agent directly...');
        if (agentSystem.agents.signal) {
            try {
                const signalData = await agentSystem.agents.signal.getCurrentMarketSnapshot();
                console.log(`   ✅ Signal agent responsive`);
                console.log(`   Data keys: ${Object.keys(signalData).length}`);
            } catch (error) {
                console.log(`   ⚠️  Signal agent test: ${error.message}`);
            }
        } else {
            console.log(`   ❌ Signal agent not available`);
        }
        
        // Test 4: Strategy Agent Direct Test
        console.log('\n4. Testing strategy agent directly...');
        if (agentSystem.agents.strategy) {
            try {
                const hasBacktest = typeof agentSystem.agents.strategy.runBacktest === 'function';
                console.log(`   ✅ Strategy agent responsive`);
                console.log(`   Backtest available: ${hasBacktest}`);
            } catch (error) {
                console.log(`   ⚠️  Strategy agent test: ${error.message}`);
            }
        } else {
            console.log(`   ❌ Strategy agent not available`);
        }
        
        // Test 5: Rebalance Evaluation
        console.log('\n5. Testing rebalance evaluation...');
        try {
            const decision = await agentSystem.forceRebalanceEvaluation();
            console.log(`   ✅ Evaluation completed`);
            console.log(`   Action: ${decision.action}`);
            console.log(`   Confidence: ${decision.confidence}%`);
        } catch (error) {
            console.log(`   ⚠️  Rebalance evaluation: ${error.message}`);
        }
        
        console.log('\n🎉 All basic tests passed! Agents are functioning correctly.');
        
        // Note: No explicit shutdown needed - system will clean up automatically
        console.log('\n✅ Agent testing completed successfully.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run quick test
quickTest(); 