# Crossfluxx: Autonomous Cross-Chain Yield Rebalancer

![Crossfluxx Logo](public/logo.svg)

## 🚀 Project Overview

Crossfluxx is a fully onchain, AI-powered yield rebalancer that automates asset allocation across multiple blockchain networks. It monitors APRs in real time, runs strategy simulations with Eliza OS agents, and executes cross-chain transfers via Chainlink CCIP.

### 🎯 Key Features

- **🤖 AI-Powered Strategy Selection**: Eliza OS agents analyze market conditions and optimize yield strategies
- **🌐 Cross-Chain Rebalancing**: Seamless asset transfers via Chainlink CCIP across Ethereum, Arbitrum, and Polygon
- **📊 Real-Time APR Monitoring**: Continuous yield opportunity tracking across DeFi protocols
- **🛡️ Automated Health Checks**: Proof of Reserves integration for collateral verification
- **⚡ Chainlink Automation**: Scheduled upkeeps for autonomous operation
- **📈 Impermanent Loss Mitigation**: Smart strategies to minimize yield farming risks

## 🏗️ Architecture

### Smart Contracts
- **`CrossfluxxCore.sol`** - Main protocol logic, user deposits, automation upkeep
- **`HealthChecker.sol`** - Proof of Reserves integration for vault security
- **`CCIPModule.sol`** - Chainlink CCIP wrapper for cross-chain operations
- **`RebalanceExecutor.sol`** - Target chain swap execution and pool management

### AI Agents (Eliza OS)
- **`StrategyAgent.js`** - Backtests strategies on private blockchain forks
- **`SignalAgent.js`** - Monitors market data from multiple sources
- **`VotingCoordinator.js`** - Aggregates simulation results via LLM consensus

### Frontend (React + Tailwind)
- **Dashboard** - Real-time APR monitoring and portfolio overview
- **Vault Configuration** - Parameter settings and chain preferences
- **Transaction History** - Rebalance events and performance analytics
- **Admin Panel** - Protocol management and system monitoring

## 🛠️ Technology Stack

- **Blockchain**: Ethereum, Arbitrum, Polygon
- **Cross-Chain**: Chainlink CCIP
- **AI/Automation**: Eliza OS agents, Chainlink Automation
- **Oracles**: Chainlink Data Feeds, Proof of Reserves
- **Frontend**: React 18, Tailwind CSS, Ethers.js v5
- **Development**: Node.js, npm, Remix IDE

## 📋 Prerequisites

- **Node.js** v18+ 
- **npm** v8+
- **MetaMask** or compatible Web3 wallet
- **Testnet ETH** for Sepolia, Arbitrum Sepolia, Polygon Amoy

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone
cd crossfluxx
npm install
```

### 2. Environment Setup
Create `.env.local` file:
```env
# RPC Endpoints
REACT_APP_ETHEREUM_RPC=https://ethereum.publicnode.com
REACT_APP_ARBITRUM_RPC=https://arbitrum.publicnode.com
REACT_APP_POLYGON_RPC=https://polygon.publicnode.com

# API Keys (Optional for enhanced features)
REACT_APP_COINGECKO_API_KEY=your_coingecko_key
REACT_APP_DEFI_LLAMA_API_KEY=your_defillama_key

# Agent Configuration
AGENT_CONFIDENCE_THRESHOLD=0.7
AGENT_REBALANCE_INTERVAL=86400
```

### 3. Start Development Server
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

### 4. Connect Wallet & Test
1. Connect MetaMask to Sepolia testnet
2. Get testnet tokens from faucets
3. Navigate to the Dashboard
4. Configure your first vault

## 🧪 Testing

### Agent System Testing
```bash
# Quick health check
npm run agents-health

# Comprehensive quick test
npm run quick-test

# Interactive testing suite
npm run test-agents

# Demo agent functionality
npm run demo-agents
```

### Frontend Testing
```bash
# Run React tests
npm test

# Build production version
npm run build
```

## 📁 Project Structure

```
crossfluxx/
├── contracts/                 # Smart contracts
│   ├── core/
│   │   ├── CrossfluxxCore.sol
│   │   └── HealthChecker.sol
│   └── ccip/
│       ├── CCIPModule.sol
│       └── RebalanceExecutor.sol
├── src/
│   ├── agents/                # Eliza OS agents
│   │   ├── StrategyAgent.js
│   │   ├── SignalAgent.js
│   │   └── VotingCoordinator.js
│   ├── components/            # React components
│   │   ├── Dashboard.js
│   │   ├── VaultConfiguration.js
│   │   └── WalletConnection.js
│   ├── utils/                 # Utilities
│   │   └── chainlink/         # Chainlink integrations
│   └── contracts/             # ABIs and addresses
├── test/                      # Test files
│   ├── unit/
│   ├── integration/
│   └── fork/
└── docs/                      # Documentation
    ├── AGENT_TESTING.md
    └── REMIX_DEPLOYMENT_GUIDE.md
```

## 🌐 Supported Networks

### Testnets (Active)
- **Ethereum Sepolia** - Primary deployment
- **Arbitrum Sepolia** - Cross-chain target
- **Polygon Amoy** - Cross-chain target

### Mainnets (Coming Soon)
- **Ethereum** - Primary deployment
- **Arbitrum One** - L2 scaling
- **Polygon** - Low-cost operations

## 💡 Usage Examples

### 1. Basic Deposit
```javascript
// Configure vault parameters
const vaultConfig = {
  amount: ethers.parseEther("100"), // 100 USDC
  preferredChains: [11155111, 421614], // Sepolia, Arbitrum Sepolia  
  thresholds: [200, 300], // 2%, 3% APY thresholds
  rebalanceInterval: 86400 // 24 hours
};

// Execute deposit
await crossfluxxCore.deposit(
  vaultConfig.amount,
  vaultConfig.preferredChains,
  vaultConfig.thresholds
);
```

### 2. Agent Testing
```javascript
// Initialize agent system
import { createCrossfluxxAgentSystem } from './src/agents/index.js';

const agentSystem = await createCrossfluxxAgentSystem({
  minimumConfidence: 0.7,
  rebalanceInterval: 24 * 60 * 60 * 1000
});

// Check system status
const status = await agentSystem.getSystemStatus();
console.log('Agents running:', status.isRunning);
```

## 🔧 Configuration

### Agent Parameters
- **Confidence Threshold**: Minimum confidence for rebalance decisions (default: 70%)
- **Rebalance Interval**: Time between rebalance evaluations (default: 24 hours)
- **Risk Tolerance**: Maximum acceptable risk level (default: 50%)
- **Consensus Threshold**: Required agent agreement level (default: 70%)

### Smart Contract Parameters
- **Minimum Deposit**: 1 USDC
- **Maximum Slippage**: 5%
- **Health Ratio**: 120% minimum for Proof of Reserves
- **Gas Limits**: 500,000 for CCIP operations

## 🔐 Security Features

- **Reentrancy Guards**: All external calls protected
- **Access Controls**: Owner-only administrative functions
- **Circuit Breakers**: Emergency stop mechanisms
- **Proof of Reserves**: Real-time collateral verification
- **Slippage Protection**: Maximum 5% slippage on swaps
- **Multi-sig Ready**: Compatible with Gnosis Safe

## 📈 Monitoring & Analytics

### Dashboard Metrics
- **Total Value Locked (TVL)**
- **Current APY across chains**
- **Rebalance history and performance**
- **Agent decision confidence scores**
- **Cross-chain transaction status**

### System Health
- **Agent uptime and status**
- **LINK token balances for automation**
- **Failed transaction alerts**
- **Performance benchmarks**

## 🚧 Development

### Running Locally
1. Install dependencies: `npm install`
2. Start development server: `npm start`
3. Run agent tests: `npm run test-agents`

### Smart Contract Development
1. Open contracts in Remix IDE
2. Follow deployment guide in `REMIX_DEPLOYMENT_GUIDE.md`
3. Test on Sepolia before mainnet

### Contributing
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📚 Documentation

- **[Agent Testing Guide](AGENT_TESTING.md)** - Comprehensive testing procedures
- **[Deployment Guide](REMIX_DEPLOYMENT_GUIDE.md)** - Smart contract deployment
- **[API Documentation](docs/API.md)** - Contract interfaces and methods

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.


## 🎯 Roadmap

### Phase 1 (Current) ✅
- ✅ Core smart contracts
- ✅ Basic AI agents
- ✅ Frontend dashboard
- ✅ Testnet deployment

### Phase 2
- 🔄 Advanced strategy algorithms
- 🔄 Additional chain support (Base, Optimism)
- 🔄 Mobile app
- 🔄 Security audit

### Phase 3
- 📋 Mainnet launch
- 📋 Governance token
- 📋 Advanced analytics
- 📋 Institutional features

---

**Built with ❤️ by the Crossfluxx Team**

*Autonomous. Intelligent. Profitable.*
