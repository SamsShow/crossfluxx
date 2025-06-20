# Crossfluxx Agent Testing Guide

This guide explains how to test the AI agents in the Crossfluxx system directly from the terminal.

## Quick Start

### 1. Basic Health Check
```bash
npm run agents-health
```
Quick one-liner to check if agents are running and responsive.

### 2. Comprehensive Quick Test
```bash
npm run quick-test
# OR
node quick-agent-test.js
```
Runs a 5-step verification test covering all major agent functions.

### 3. Interactive Testing Suite
```bash
npm run test-agents
# OR 
node test-agents.js
```
Launches an interactive menu with comprehensive testing options.

### 4. Direct Script Execution
```bash
./test-agents.js
./quick-agent-test.js
```
Run scripts directly (requires execute permissions).

## Testing Scripts Overview

### 🚀 quick-agent-test.js
**Purpose:** Fast verification that all agents are functional  
**Duration:** ~10-15 seconds  
**Tests:**
- Agent system initialization
- System health status
- Market data collection
- Strategy analysis
- Agent consensus voting
- Decision making

**Example Output:**
```
🔍 Quick Agent Functionality Test

Initializing agent system...
✅ Agent system initialized

1. Checking system health...
   Status: healthy
   Active agents: 3

2. Testing market data collection...
   ✅ Collected data from 3 chains

3. Testing strategy analysis...
   ✅ Analyzed 5 strategies

4. Testing agent consensus...
   ✅ Consensus reached: 87%

5. Testing decision making...
   ✅ Decision: rebalance (92% confidence)

🎉 All basic tests passed! Agents are functioning correctly.
```

### 🛠️ test-agents.js
**Purpose:** Comprehensive interactive testing suite  
**Duration:** Variable (user-controlled)  
**Features:**
- Interactive menu system
- Individual agent testing
- Complete workflow testing
- Real-time monitoring
- Stress testing
- Agent metrics and health monitoring

**Menu Options:**
1. **Test Signal Agent** - Market data collection, yield monitoring, price alerts
2. **Test Strategy Agent** - Strategy analysis, backtesting, risk assessment
3. **Test Voting Coordinator** - Consensus voting, decision making, confidence scoring
4. **Test Complete Rebalance Flow** - End-to-end workflow simulation
5. **Check Agent Health Status** - Detailed health monitoring
6. **View Agent Metrics** - Performance statistics and metrics
7. **Test Real-time Monitoring** - 30-second live monitoring session
8. **Force Agent Reset** - Reset all agents (with confirmation)
9. **Stress Test All Agents** - Load testing with concurrent operations

## Agent System Architecture

### SignalAgent
**Responsibilities:**
- Real-time market data collection from DeFiLlama, CoinGecko, DexScreener
- Yield opportunity monitoring across Ethereum, Arbitrum, Polygon
- Price alert system
- Cross-chain APR tracking

**Test Coverage:**
- Market data fetch from multiple sources
- Yield data aggregation
- Alert trigger mechanisms
- Data quality validation

### StrategyAgent
**Responsibilities:**
- Fork environment setup for backtesting
- Strategy analysis and optimization
- Risk assessment and scoring
- Historical performance simulation

**Test Coverage:**
- Strategy generation and scoring
- Backtest execution with realistic parameters
- Risk analysis with volatility and drawdown calculations
- Fork environment management

### VotingCoordinator
**Responsibilities:**
- Multi-agent consensus coordination
- Decision aggregation and confidence scoring
- Vote weighting and conflict resolution
- Final recommendation generation

**Test Coverage:**
- Voting round coordination
- Consensus calculation algorithms
- Confidence metric generation
- Decision reasoning validation

## Testing Scenarios

### Scenario 1: Basic Functionality Verification
```bash
npm run quick-test
```
**Use Case:** Daily health check, CI/CD integration, quick debugging  
**Expected Result:** All 5 tests pass within 15 seconds

### Scenario 2: Individual Agent Deep Testing
```bash
npm run test-agents
# Select option 1, 2, or 3 for specific agent testing
```
**Use Case:** Debugging specific agent issues, feature validation  
**Expected Result:** Detailed output showing agent-specific functionality

### Scenario 3: End-to-End Workflow Testing
```bash
npm run test-agents
# Select option 4 for complete rebalance flow
```
**Use Case:** Integration testing, workflow validation  
**Expected Result:** Complete 6-step rebalance simulation

### Scenario 4: Performance and Load Testing
```bash
npm run test-agents
# Select option 9 for stress testing
```
**Use Case:** Performance benchmarking, scalability testing  
**Expected Result:** Detailed performance metrics and success rates

### Scenario 5: Real-time Monitoring
```bash
npm run test-agents
# Select option 7 for real-time monitoring
```
**Use Case:** Live system monitoring, debugging real-time issues  
**Expected Result:** 30-second live status updates

## Troubleshooting

### Common Issues

**Issue:** "Agent system failed to initialize"
```bash
# Check dependencies
npm install

# Verify agent files exist
ls -la src/agents/

# Check for import errors
node -c test-agents.js
```

**Issue:** "No market data received"
```bash
# Test network connectivity
curl -s https://api.coingecko.com/api/v3/ping

# Check if real data service is accessible
node -e "import('./src/utils/RealDataService.js').then(console.log)"
```

**Issue:** "Consensus voting failed"
```bash
# Test individual agents
npm run test-agents
# Select options 1, 2, 3 individually to isolate the issue
```

**Issue:** "Performance is slow"
```bash
# Run stress test to identify bottlenecks
npm run test-agents
# Select option 9 for detailed performance analysis
```

### Debug Mode

For verbose debugging, set environment variables:
```bash
DEBUG=crossfluxx:* npm run test-agents
NODE_ENV=development npm run quick-test
```

### Manual Agent Testing

Test agents individually:
```javascript
import { createCrossfluxxAgentSystem } from './src/agents/index.js';

const system = await createCrossfluxxAgentSystem();

// Test specific functionality
const marketData = await system.getMarketData();
const strategies = await system.analyzeStrategies();
const voting = await system.conductVoting();

console.log({ marketData, strategies, voting });
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Test Crossfluxx Agents
  run: |
    npm install
    npm run quick-test
    
- name: Agent Health Check
  run: npm run agents-health
```

### Docker Testing
```dockerfile
RUN npm install
RUN npm run quick-test
HEALTHCHECK CMD npm run agents-health
```

## Performance Benchmarks

### Expected Performance Metrics
- **Agent Initialization:** < 2 seconds
- **Market Data Collection:** < 5 seconds
- **Strategy Analysis:** < 3 seconds
- **Consensus Voting:** < 2 seconds
- **Complete Rebalance Flow:** < 15 seconds

### Stress Test Expectations
- **Concurrent Operations:** 10+ simultaneous requests
- **Success Rate:** > 95%
- **Average Response Time:** < 1000ms
- **Peak Response Time:** < 3000ms

## Monitoring and Alerting

### Health Check Integration
```bash
# For monitoring systems
if ! npm run agents-health > /dev/null 2>&1; then
  echo "ALERT: Crossfluxx agents are not healthy"
  # Send alert to monitoring system
fi
```

### Log Analysis
```bash
# View detailed logs
npm run test-agents 2>&1 | tee agent-test.log

# Parse for errors
grep -E "(ERROR|FAILED|❌)" agent-test.log
```

## Advanced Testing

### Custom Test Scenarios
Create custom test scripts by importing the agent system:
```javascript
import { createCrossfluxxAgentSystem } from './src/agents/index.js';

// Your custom test logic here
```

### Environment-Specific Testing
```bash
# Test against different environments
CROSSFLUXX_ENV=staging npm run test-agents
CROSSFLUXX_ENV=production npm run quick-test
```

## Support

For issues with agent testing:
1. Check this README first
2. Run `npm run quick-test` for basic verification
3. Use `npm run test-agents` option 5 for detailed health status
4. Review logs in the terminal output
5. Check the agent source files in `src/agents/`

## Contributing

When adding new agent functionality:
1. Update the corresponding test in `test-agents.js`
2. Add quick verification to `quick-agent-test.js` if needed
3. Update this README with new testing procedures
4. Ensure all tests pass before committing 