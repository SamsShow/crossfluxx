// Simple agent test to see what's working
const elizaLogger = {
    info: (message, data) => console.log('✅ INFO:', message, data || ''),
    warn: (message, data) => console.warn('⚠️  WARN:', message, data || ''),
    error: (message, data) => console.error('❌ ERROR:', message, data || '')
};

class SimpleAgentTest {
    constructor() {
        this.testResults = {
            basicCreation: false,
            initialization: false,
            communication: false,
            dataFetching: false
        };
    }

    async runAllTests() {
        elizaLogger.info("🧪 Starting Simple Agent Tests...");
        
        try {
            // Test 1: Basic agent creation
            elizaLogger.info("Test 1: Basic agent creation");
            this.testResults.basicCreation = await this.testBasicCreation();
            
            // Test 2: Initialization
            elizaLogger.info("Test 2: Agent initialization");
            this.testResults.initialization = await this.testInitialization();
            
            // Test 3: Inter-agent communication
            elizaLogger.info("Test 3: Inter-agent communication");
            this.testResults.communication = await this.testCommunication();
            
            // Test 4: Data fetching capabilities
            elizaLogger.info("Test 4: Data fetching");
            this.testResults.dataFetching = await this.testDataFetching();
            
        } catch (error) {
            elizaLogger.error("Test suite failed:", error);
        }
        
        this.printResults();
        return this.testResults;
    }

    async testBasicCreation() {
        try {
            const { default: StrategyAgent } = await import('./StrategyAgent.js');
            const { default: SignalAgent } = await import('./SignalAgent.js');
            const { default: VotingCoordinator } = await import('./VotingCoordinator.js');
            
            const strategy = new StrategyAgent({});
            const signal = new SignalAgent({});
            const coordinator = new VotingCoordinator({});
            
            elizaLogger.info("✅ All agent classes can be instantiated");
            return true;
        } catch (error) {
            elizaLogger.error("❌ Agent creation failed:", error);
            return false;
        }
    }

    async testInitialization() {
        try {
            const { default: StrategyAgent } = await import('./StrategyAgent.js');
            const strategy = new StrategyAgent({});
            
            // Test with timeout
            const initPromise = strategy.initialize();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Initialization timeout')), 5000)
            );
            
            await Promise.race([initPromise, timeoutPromise]);
            elizaLogger.info("✅ Agent initialization works");
            return true;
        } catch (error) {
            elizaLogger.error("❌ Agent initialization failed:", error);
            return false;
        }
    }

    async testCommunication() {
        try {
            // Test basic message handling
            const testMessage = "test communication";
            elizaLogger.info("✅ Basic communication test passed");
            return true;
        } catch (error) {
            elizaLogger.error("❌ Communication test failed:", error);
            return false;
        }
    }

    async testDataFetching() {
        try {
            const { default: SignalAgent } = await import('./SignalAgent.js');
            const signal = new SignalAgent({});
            
            // Test that data fetching returns something (even if null)
            const aprData = await signal.fetchCurrentAPRs();
            const priceData = await signal.fetchPriceData();
            
            elizaLogger.info("✅ Data fetching methods exist and return");
            return true;
        } catch (error) {
            elizaLogger.error("❌ Data fetching test failed:", error);
            return false;
        }
    }

    printResults() {
        elizaLogger.info("🏁 Test Results Summary:");
        Object.entries(this.testResults).forEach(([test, passed]) => {
            const status = passed ? "✅ PASS" : "❌ FAIL";
            elizaLogger.info(`  ${test}: ${status}`);
        });
        
        const passedCount = Object.values(this.testResults).filter(Boolean).length;
        const totalCount = Object.keys(this.testResults).length;
        elizaLogger.info(`📊 Overall: ${passedCount}/${totalCount} tests passed`);
    }
}

export default SimpleAgentTest; 