# Crossfluxx Smart Contracts - Remix IDE Deployment Guide

## Overview
This guide walks you through deploying the Crossfluxx smart contracts using Remix IDE.

## Contract Architecture
The Crossfluxx protocol consists of four main smart contracts:

1. **CrossfluxxCore.sol** - Main protocol contract (user deposits, automation upkeep)
2. **HealthChecker.sol** - Proof of Reserves integration for collateral verification
3. **CCIPModule.sol** - Chainlink CCIP wrapper for cross-chain operations
4. **RebalanceExecutor.sol** - Target chain execution contract

## Prerequisites

### Required Dependencies in Remix
The contracts use the following imports that Remix can auto-import:

```solidity
// OpenZeppelin Contracts (Remix auto-imports from GitHub)
@openzeppelin/contracts/security/ReentrancyGuard.sol
@openzeppelin/contracts/security/Pausable.sol
@openzeppelin/contracts/access/Ownable.sol
@openzeppelin/contracts/token/ERC20/IERC20.sol
@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol

// Chainlink Contracts
@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol
@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol
@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol
@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol
@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol
```

## Deployment Order

### Step 1: Deploy HealthChecker
1. Open `contracts/core/HealthChecker.sol` in Remix
2. Compile with Solidity 0.8.19
3. Deploy with no constructor parameters
4. Note the deployed address

### Step 2: Deploy CCIPModule
1. Open `contracts/ccip/CCIPModule.sol` in Remix
2. Deploy with constructor parameters:
   - `_router`: CCIP Router address for your target chain
   - `_linkToken`: LINK token address for your target chain

### Step 3: Deploy CrossfluxxCore
1. Open `contracts/core/CrossfluxxCore.sol` in Remix
2. Deploy with constructor parameters:
   - `_healthChecker`: Address from Step 1
   - `_ccipModule`: Address from Step 2

### Step 4: Deploy RebalanceExecutor (on each target chain)
1. Open `contracts/ccip/RebalanceExecutor.sol` in Remix
2. Deploy with constructor parameters:
   - `_router`: CCIP Router address for the target chain

## Network Configurations

### Ethereum Sepolia Testnet
```
CCIP Router: 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59
LINK Token: 0x779877A7B0D9E8603169DdbD7836e478b4624789
Chain Selector: 16015286601757825753
```

### Arbitrum Sepolia Testnet
```
CCIP Router: 0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165
LINK Token: 0xb1D4538B4571d411F07960EF2838Ce337FE1E80E
Chain Selector: 3478487238524512106
```

### Polygon Mumbai Testnet
```
CCIP Router: 0x1035CabC275068e0F4b745A29CEDf38E13aF41b1
LINK Token: 0x326C977E6efc84E512bB9C30f76E30c160eD06FB
Chain Selector: 12532609583862916517
```

## Post-Deployment Configuration

### 1. Configure CrossfluxxCore
```javascript
// Authorize tokens for deposits (example: USDC)
await crossfluxxCore.setTokenAuthorization("0xUSDC_ADDRESS", true);

// Update yield data for supported chains
await crossfluxxCore.updateYieldData(
    chainId,
    poolAddress,
    apy, // in basis points
    tvl,
    priceFeedAddress
);
```

### 2. Configure CCIPModule
```javascript
// Set the CrossfluxxCore address
await ccipModule.setCrossfluxxCore("CROSSFLUXX_CORE_ADDRESS");

// Allowlist destination chains
await ccipModule.allowlistDestinationChain(16015286601757825753, true); // Sepolia
await ccipModule.allowlistDestinationChain(3478487238524512106, true);  // Arbitrum Sepolia
await ccipModule.allowlistDestinationChain(12532609583862916517, true); // Polygon Mumbai

// Allowlist source senders (other CCIPModule instances)
await ccipModule.allowlistSourceSender("OTHER_CCIP_MODULE_ADDRESS", true);
```

### 3. Configure HealthChecker
```javascript
// Configure Proof of Reserves for USDC
await healthChecker.configureProofOfReserves(
    "0xUSDC_ADDRESS",
    "0xPOR_ORACLE_ADDRESS",
    12000, // 120% minimum health ratio
    3600   // 1 hour max staleness
);
```

### 4. Configure RebalanceExecutor
```javascript
// Set CCIP Module address
await rebalanceExecutor.setCCIPModule("CCIP_MODULE_ADDRESS");

// Authorize CCIP senders
await rebalanceExecutor.authorizeCCIPSender("CCIP_MODULE_ADDRESS", true);

// Configure supported pools
await rebalanceExecutor.configurePool(
    "POOL_ADDRESS",
    "LP_TOKEN_ADDRESS",
    500, // 5% APY in basis points
    "0x" // Custom swap calldata (empty for basic pools)
);
```

## Testing Deployment

### 1. Fund Contracts with LINK
Transfer LINK tokens to CCIPModule contracts for cross-chain fees:
```javascript
// Transfer LINK to CCIPModule for fees
await linkToken.transfer("CCIP_MODULE_ADDRESS", ethers.parseEther("10"));
```

### 2. Test Basic Deposit
```javascript
// Approve USDC
await usdcToken.approve("CROSSFLUXX_CORE_ADDRESS", amount);

// Make deposit
await crossfluxxCore.deposit(
    amount,
    "USDC_ADDRESS",
    [16015286601757825753], // Preferred chains
    [200], // 2% APY threshold
    3600 // 1 hour rebalance interval
);
```

### 3. Register Chainlink Automation
1. Go to [Chainlink Automation](https://automation.chain.link/)
2. Register new upkeep pointing to CrossfluxxCore.checkUpkeep()
3. Fund with LINK tokens

## Important Notes

1. **Gas Limits**: Ensure sufficient gas limits for CCIP operations (recommend 500,000+)
2. **LINK Funding**: Keep CCIP contracts funded with LINK for cross-chain fees
3. **Testing**: Test on testnets before mainnet deployment
4. **Security**: Use multi-sig wallets for ownership of deployed contracts
5. **Monitoring**: Set up monitoring for failed transactions and low LINK balances

## Contract Verification
After deployment, verify contracts on Etherscan/block explorers for transparency:
1. Use the same compiler version (0.8.19)
2. Enable optimization with 200 runs
3. Include constructor parameters

## Mainnet Addresses (To be updated after deployment)

### Ethereum Mainnet
```
CCIP Router: 0x80226fc0Ee2b096224EeAc085Bb9a8cba1146f7D
LINK Token: 0x514910771AF9Ca656af840dff83E8264EcF986CA
Chain Selector: 5009297550715157269
```

### Arbitrum One
```
CCIP Router: 0x141fa059441E0ca23ce184B6A78bafD2A517DdE8
LINK Token: 0xf97f4df75117a78c1A5a0DBb814Af92458539FB4
Chain Selector: 4949039107694359620
```

### Polygon Mainnet
```
CCIP Router: 0x3C3D92629A02a8D95D5CB9650fe49C3544f69B43
LINK Token: 0xb0897686c545045aFc77CF20eC7A532E3120E0F1
Chain Selector: 4051577828743386545
``` 