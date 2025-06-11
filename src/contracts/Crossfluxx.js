// Import ABIs from separate contract files (using dynamic imports for JSON)
// For now, we'll define ABIs inline since the contract files are raw JSON

// CrossfluxxCore ABI - main contract for deposits and rebalancing
export const CrossfluxxCoreABI = [
  "function deposit(uint256 amount, uint64[] memory preferredChains, uint256[] memory thresholds) external",
  "function withdraw(uint256 amount) external",
  "function checkUpkeep(bytes calldata checkData) external view returns (bool upkeepNeeded, bytes memory performData)",
  "function performUpkeep(bytes calldata performData) external",
  "function getUserDeposit(address user) external view returns (uint256, uint64[], uint256[])",
  "function getHealthScore() external view returns (uint256)",
  "event Deposited(address indexed user, uint256 amount, uint64[] preferredChains)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event RebalanceTriggered(address indexed user, uint256 timestamp)",
  "event RebalanceExecuted(address indexed user, uint64 fromChain, uint64 toChain, uint256 amount, address targetPool)"
];

// HealthChecker ABI - Proof of Reserves integration
export const HealthCheckerABI = [
  "function verifyCollateral(uint256 vaultId, uint256 amount) external view returns (bool)",
  "function getCollateralRatio(uint256 vaultId) external view returns (uint256)",
  "function getReserveData() external view returns (uint256 totalReserves, uint256 totalSupply)",
  "event CollateralVerified(uint256 indexed vaultId, uint256 amount, bool isHealthy)"
];

// CCIPModule ABI - Cross-chain interoperability
export const CCIPModuleABI = [
  "function sendCrossChainRebalance(uint64 destinationChainSelector, address receiver, uint256 amount, string memory targetProtocol, uint256 gasLimit) external returns (bytes32)",
  "function estimateFee(uint64 destinationChainSelector, address receiver, uint256 amount, string memory targetProtocol, uint256 gasLimit) external view returns (uint256)",
  "function allowlistDestinationChain(uint64 destinationChainSelector, bool allowed) external",
  "function allowlistSourceChain(uint64 sourceChainSelector, bool allowed) external",
  "function allowlistSender(address sender, bool allowed) external",
  "function ccipReceive((bytes32 messageId, uint64 sourceChainSelector, bytes sender, bytes data, (address token, uint256 amount)[] tokenAmounts) message) external",
  "event MessageSent(bytes32 indexed messageId, uint64 indexed destinationChainSelector, address receiver, string targetProtocol, uint256 fees)",
  "event MessageReceived(bytes32 indexed messageId, uint64 indexed sourceChainSelector, address sender, address token, uint256 amount)"
];

// RebalanceExecutor ABI - Target chain execution
export const RebalanceExecutorABI = [
  "function executeRebalance(address token, uint256 amount, string memory targetProtocol, bytes memory swapData) external",
  "function estimateRebalanceCost(address token, uint256 amount, string memory targetProtocol) external view returns (uint256)",
  "function supportedProtocols(string memory protocol) external view returns (bool)",
  "function setProtocolAdapter(string memory protocol, address adapter) external",
  "event RebalanceExecuted(address indexed user, address token, uint256 amount, string targetProtocol, uint256 outputAmount)"
];

// Standard ERC20 ABI for token interactions
export const ERC20ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// Contract addresses (to be updated after deployment)
export const CONTRACT_ADDRESSES = {
  // Ethereum Sepolia
  11155111: {
    CrossfluxxCore: "0xb8Fa9D1A6C934788e01221BC62e1703910c35fAb",
    HealthChecker: "0x44dcf15634CE28Bc416044c0Ee6E14bb35080ECC",
    CCIPModule: "0x76EF740c6f333E61b628c88b5cAeDE68c07B9adE", 
    // Chainlink CCIP Infrastructure
    CCIPRouter: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
    LINK: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    // Tokens
    USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" // Sepolia USDC
  },
  // Arbitrum Sepolia
  421614: {
    RebalanceExecutor: "0xBF35D00CcAa2300595Eda3750BCB676F500f538B",
    CCIPModule: "0x30C833dB38be25869B20FdA61f2ED97196Ad4aC7",
    // Chainlink CCIP Infrastructure
    CCIPRouter: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165",
    LINK: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
    // Tokens
    USDC: "0x75faf114eafb1BDbe2F0316DF893fd58CF46885A" // Arbitrum Sepolia USDC
  },
  // Polygon Amoy (Updated from Mumbai)
  80002: {
    RebalanceExecutor: "0x30C833dB38be25869B20FdA61f2ED97196Ad4aC7",
    CCIPModule: "0x...", // Skipped for now - network issues, deploy later
    // Chainlink CCIP Infrastructure (Ready for future deployment)
    CCIPRouter: "0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2",
    LINK: "0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904",
    // Tokens
    USDC: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582" // Amoy USDC
  },
  // Ethereum Mainnet
  1: {
    CrossfluxxCore: "0x...",
    HealthChecker: "0x...",
    CCIPModule: "0x...",
    // Chainlink CCIP Infrastructure
    CCIPRouter: "0x80226fc0Ee2b096224EeAc085Bb9a8cba1146f7D",
    LINK: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    // Tokens
    USDC: "0xA0b86a33E6441b1982EaE00ca48fA0BcA7FdcaEc" // Mainnet USDC
  },
  // Arbitrum One
  42161: {
    RebalanceExecutor: "0x...",
    CCIPModule: "0x...",  
    // Chainlink CCIP Infrastructure
    CCIPRouter: "0x141fa059441E0ca23ce184B6A78bafD2A517DdE8",
    LINK: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    // Tokens
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" // Arbitrum USDC
  },
  // Polygon Mainnet
  137: {
    RebalanceExecutor: "0x...",
    CCIPModule: "0x...",
    // Chainlink CCIP Infrastructure
    CCIPRouter: "0x3C3D92629A02a8D95D5CB9650fe49C3544f69B43",
    LINK: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
    // Tokens
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" // Polygon USDC
  }
};

// Chain configurations for CCIP
export const CHAIN_CONFIGS = {
  11155111: { // Ethereum Sepolia
    name: "Ethereum Sepolia",
    chainSelector: "16015286601757825753",
    ccipRouter: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
    explorer: "https://sepolia.etherscan.io"
  },
  421614: { // Arbitrum Sepolia
    name: "Arbitrum Sepolia",
    chainSelector: "3478487238524512106",
    ccipRouter: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165",
    explorer: "https://sepolia.arbiscan.io"
  },
  80002: { // Polygon Amoy (Updated from Mumbai)
    name: "Polygon Amoy",
    chainSelector: "16281711391670634445",
    ccipRouter: "0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2",
    explorer: "https://amoy.polygonscan.com"
  },
  1: { // Ethereum Mainnet
    name: "Ethereum Mainnet",
    chainSelector: "5009297550715157269",
    ccipRouter: "0x80226fc0Ee2b096224EeAc085Bb9a8cba1146f7D",
    explorer: "https://etherscan.io"
  },
  42161: { // Arbitrum One
    name: "Arbitrum One",
    chainSelector: "4949039107694359620",
    ccipRouter: "0x141fa059441E0ca23ce184B6A78bafD2A517DdE8",
    explorer: "https://arbiscan.io"
  },
  137: { // Polygon Mainnet
    name: "Polygon",
    chainSelector: "4051577828743386545",
    ccipRouter: "0x3C3D92629A02a8D95D5CB9650fe49C3544f69B43",
    explorer: "https://polygonscan.com"
  }
};

// CCIP Deployment Helper - Get constructor arguments for CCIPModule
export function getCCIPModuleConstructorArgs(chainId) {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) return null;
  
  return {
    router: addresses.CCIPRouter,
    linkToken: addresses.LINK
  };
}

// Utility function to get contract address by chain and contract name
export function getContractAddress(chainId, contractName) {
  return CONTRACT_ADDRESSES[chainId]?.[contractName] || null;
}

// Utility function to get chain config
export function getChainConfig(chainId) {
  return CHAIN_CONFIGS[chainId] || null;
} 