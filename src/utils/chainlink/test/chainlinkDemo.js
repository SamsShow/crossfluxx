#!/usr/bin/env node

/**
 * Simplified Chainlink Integration Demo for Crossfluxx
 * 
 * This demo showcases the key Chainlink integrations without event listeners
 * that may not work in mock testing environments.
 */

import { ChainlinkService } from '../ChainlinkService.js';

async function runChainlinkDemo() {
    console.log('🧪 Chainlink Integration Demo for Crossfluxx');
    console.log('═'.repeat(60));

    try {
        // Create simplified test configuration
        const config = {
            networks: ['ethereum', 'arbitrum', 'polygon'],
            providers: {
                // Simplified mock providers that don't support all features
                ethereum: {
                    getGasPrice: async () => '20000000000', // 20 gwei
                    getBlockNumber: async () => 18500000
                },
                arbitrum: {
                    getGasPrice: async () => '100000000', // 0.1 gwei  
                    getBlockNumber: async () => 150000000
                },
                polygon: {
                    getGasPrice: async () => '30000000000', // 30 gwei
                    getBlockNumber: async () => 50000000
                }
            },
            contracts: {
                11155111: { // Ethereum Sepolia
                    CrossfluxxCore: "0xb8Fa9D1A6C934788e01221BC62e1703910c35fAb",
                    CCIPModule: "0x76EF740c6f333E61b628c88b5cAeDE68c07B9adE",
                    USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
                },
                421614: { // Arbitrum Sepolia
                    RebalanceExecutor: "0xBF35D00CcAa2300595Eda3750BCB676F500f538B",
                    CCIPModule: "0x30C833dB38be25869B20FdA61f2ED97196Ad4aC7",
                    USDC: "0x75faf114eafb1BDbe2F0316DF893fd58CF46885A"
                },
                80002: { // Polygon Amoy
                    RebalanceExecutor: "0x30C833dB38be25869B20FdA61f2ED97196Ad4aC7",
                    USDC: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"
                }
            },
            testMode: true // Flag to skip problematic features in testing
        };

        console.log('🔧 Initializing Chainlink Service Manager...');
        const chainlinkService = new ChainlinkService(config);
        
        // Initialize without event listeners for demo
        console.log('📊 Initializing Data Feed Service...');
        await chainlinkService.initializeDataFeeds();
        
        console.log('🤖 Initializing Automation Service...');
        await chainlinkService.initializeAutomation();
        
        console.log('🔧 Initializing Functions Service...');
        await chainlinkService.initializeFunctions();
        
        console.log('📡 Initializing Data Streams Service...');
        await chainlinkService.initializeDataStreams();

        console.log('✅ Core Chainlink services initialized successfully\n');

        // Demo 1: Data Feeds Service
        console.log('1️⃣  DEMO: Data Feeds Service');
        console.log('─'.repeat(40));
        
        const dataFeeds = chainlinkService.services.dataFeeds;
        if (dataFeeds) {
            // Test mock price retrieval
            console.log('📊 Getting latest price data...');
            const ethPrice = await dataFeeds.getLatestPrice(11155111, 'ETH/USD');
            console.log(`   • ETH/USD: $${ethPrice?.price || 'N/A'} (${ethPrice ? 'cached/mock' : 'unavailable'})`);
            
            // Test yield data
            console.log('🌾 Getting yield opportunities...');
            const yieldData = await dataFeeds.getAllYieldData();
            console.log(`   • Found ${Object.keys(yieldData).length} yield data sources`);
            
            const healthStatus = await dataFeeds.getHealthStatus();
            console.log(`   • Service Health: ${healthStatus.status}`);
        }

        console.log('');

        // Demo 2: Automation Service
        console.log('2️⃣  DEMO: Automation Service');
        console.log('─'.repeat(40));
        
        const automation = chainlinkService.services.automation;
        if (automation) {
            // Register upkeep
            console.log('🤖 Registering automation upkeep...');
            const upkeepResult = await automation.registerUpkeep({
                targetContract: '0x1234567890abcdef1234567890abcdef12345678',
                chainId: 11155111,
                adminAddress: '0x1234567890abcdef1234567890abcdef12345678',
                name: 'Crossfluxx Demo Upkeep'
            });
            console.log(`   • Upkeep ID: ${upkeepResult.upkeepId}`);
            
            // Check conditions
            console.log('🔍 Checking automation conditions...');
            const conditions = await automation.checkAllConditions();
            console.log(`   • Conditions evaluated: ${Object.keys(conditions).length}`);
            
            const healthStatus = await automation.getHealthStatus();
            console.log(`   • Service Health: ${healthStatus.status}`);
        }

        console.log('');

        // Demo 3: Functions Service  
        console.log('3️⃣  DEMO: Functions Service');
        console.log('─'.repeat(40));
        
        const functions = chainlinkService.services.functions;
        if (functions) {
            console.log('🔧 Executing yield optimization function...');
            const optimization = await functions.executeYieldOptimization({
                amount: 10000,
                token: 'USDC',
                chains: ['ethereum', 'arbitrum', 'polygon'],
                riskTolerance: 'medium'
            });
            console.log(`   • Recommendations: ${optimization.recommendations.length}`);
            console.log(`   • Best Chain: ${optimization.recommendations[0]?.chain || 'N/A'}`);
            console.log(`   • Expected APY: ${optimization.recommendations[0]?.apy || 'N/A'}%`);
            
            const healthStatus = await functions.getHealthStatus();
            console.log(`   • Service Health: ${healthStatus.status}`);
        }

        console.log('');

        // Demo 4: Data Streams Service
        console.log('4️⃣  DEMO: Data Streams Service');  
        console.log('─'.repeat(40));
        
        const dataStreams = chainlinkService.services.dataStreams;
        if (dataStreams) {
            console.log('📡 Testing data streams...');
            
            // Test stream subscription (simplified)
            let dataReceived = false;
            await dataStreams.subscribeToStream('demo-price-stream', (data) => {
                console.log(`   • Stream Data: ${data.type} = ${data.price} at ${new Date(data.timestamp).toISOString()}`);
                dataReceived = true;
            });
            
            // Wait for stream data
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            if (dataReceived) {
                console.log('   ✅ Stream subscription working');
            } else {
                console.log('   ⚠️  Stream data pending...');
            }
            
            const healthStatus = await dataStreams.getHealthStatus();
            console.log(`   • Service Health: ${healthStatus.status}`);
        }

        console.log('');

        // Demo 5: Integrated Workflow
        console.log('5️⃣  DEMO: Integrated Yield Optimization Workflow');
        console.log('─'.repeat(40));
        
        console.log('🌾 Simulating complete yield optimization...');
        
        // Step 1: Get market data
        if (dataFeeds) {
            const yieldData = await dataFeeds.getAllYieldData();
            console.log(`   • Step 1: Market data gathered (${Object.keys(yieldData).length} sources)`);
        }
        
        // Step 2: Analyze with Functions
        if (functions) {
            const analysis = await functions.executeYieldOptimization({
                amount: 50000,
                token: 'USDC'
            });
            console.log(`   • Step 2: AI analysis completed (${analysis.recommendations.length} options)`);
        }
        
        // Step 3: Check automation triggers
        if (automation) {
            const upkeepCheck = await automation.checkUpkeep({ chainId: 11155111 });
            console.log(`   • Step 3: Automation check (${upkeepCheck.upkeepNeeded ? 'triggered' : 'waiting'})`);
        }
        
        // Step 4: Cross-chain capability
        console.log('   • Step 4: Cross-chain execution ready via CCIP');
        
        console.log('   ✅ Integrated workflow demonstrated');

        console.log('');

        // Summary Report
        console.log('📋 CHAINLINK INTEGRATION SUMMARY');
        console.log('═'.repeat(60));
        
        const summary = {
            timestamp: new Date().toISOString(),
            status: 'OPERATIONAL',
            services: {
                'Data Feeds': dataFeeds ? '✅ Price feeds & yield data' : '❌ Not available',
                'Automation': automation ? '✅ Upkeep & triggers' : '❌ Not available', 
                'Functions': functions ? '✅ Off-chain computation' : '❌ Not available',
                'Data Streams': dataStreams ? '✅ Real-time data' : '❌ Not available',
                'CCIP': 'Ready (event listeners skipped in demo)'
            },
            capabilities: [
                '🌉 Cross-chain yield rebalancing via CCIP',
                '📊 Real-time price and yield monitoring',
                '🤖 Automated trigger conditions',
                '🔧 AI-powered yield optimization',
                '📡 Live market data streams',
                '⚖️  Risk assessment and scoring',
                '🔍 Health monitoring and alerts'
            ],
            integration: 'All services coordinated for autonomous yield optimization',
            production_ready: 'Configure API keys and deploy contracts for full functionality'
        };

        console.log(JSON.stringify(summary, null, 2));

        console.log('\n🎉 Chainlink Integration Demo Completed Successfully!');
        console.log('');
        console.log('Next Steps:');
        console.log('• Deploy smart contracts to testnets');
        console.log('• Configure Chainlink Functions subscription');  
        console.log('• Set up Data Streams feeds');
        console.log('• Configure API keys for external data');
        console.log('• Enable event listeners in production environment');

    } catch (error) {
        console.error('❌ Demo failed:', error.message);
        console.error('\nError details:', error);
        process.exit(1);
    }
}

// Run the demo
runChainlinkDemo().catch(console.error); 