// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "./HealthChecker.sol";
import "../ccip/CCIPModule.sol";

/**
 * @title CrossfluxxCore
 * @notice Main protocol contract for Crossfluxx autonomous cross-chain yield rebalancer
 * @dev Handles user deposits, configuration, automation upkeep, and orchestrates rebalancing
 */
contract CrossfluxxCore is AutomationCompatibleInterface, ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // Structs
    struct UserVault {
        uint256 totalDeposited;
        uint256 lastRebalanceTime;
        uint256[] preferredChains;
        uint256[] apyThresholds; // Basis points (100 = 1%)
        uint256 rebalanceInterval; // Seconds between rebalances
        bool isActive;
    }

    struct RebalanceParams {
        uint256 fromChain;
        uint256 toChain;
        address token;
        uint256 amount;
        address targetPool;
        uint256 expectedApy;
    }

    struct ChainYieldData {
        uint256 chainId;
        address poolAddress;
        uint256 currentApy; // Basis points
        uint256 tvl;
        uint256 lastUpdated;
        AggregatorV3Interface priceFeed;
    }

    // State variables
    mapping(address => UserVault) public userVaults;
    mapping(uint256 => ChainYieldData) public chainYieldData;
    mapping(address => bool) public authorizedTokens;
    
    HealthChecker public immutable healthChecker;
    CCIPModule public immutable ccipModule;
    
    uint256 public constant MIN_DEPOSIT = 100e18; // Minimum 100 tokens
    uint256 public constant MAX_THRESHOLD = 5000; // 50% max threshold
    uint256 public constant MIN_REBALANCE_INTERVAL = 3600; // 1 hour minimum
    uint256 public constant SAFETY_BUFFER = 500; // 5% safety buffer
    
    // Events
    event VaultCreated(address indexed user, uint256 amount, uint256[] preferredChains);
    event DepositAdded(address indexed user, uint256 amount, uint256 newTotal);
    event RebalanceTriggered(address indexed user, uint256 timestamp);
    event RebalanceExecuted(
        address indexed user,
        uint256 fromChain,
        uint256 toChain,
        uint256 amount,
        address targetPool
    );
    event ParametersUpdated(address indexed user, uint256[] newThresholds, uint256 newInterval);
    event TokenAuthorized(address indexed token, bool authorized);
    event YieldDataUpdated(uint256 indexed chainId, uint256 newApy, uint256 tvl);
    event EmergencyWithdrawal(address indexed user, uint256 amount);

    // Errors
    error InsufficientDeposit();
    error InvalidThreshold();
    error InvalidInterval();
    error VaultNotActive();
    error UnauthorizedToken();
    error HealthCheckFailed();
    error RebalanceOnCooldown();
    error InsufficientBalance();

    /**
     * @notice Initialize the CrossfluxxCore contract
     * @param _healthChecker Address of the HealthChecker contract
     * @param _ccipModule Address of the CCIPModule contract
     */
    constructor(
        address _healthChecker,
        address _ccipModule
    ) Ownable(msg.sender) {
        healthChecker = HealthChecker(_healthChecker);
        ccipModule = CCIPModule(_ccipModule);
    }

    /**
     * @notice Deposit tokens and create/update user vault configuration
     * @param _amount Amount of tokens to deposit
     * @param _token Address of the token to deposit
     * @param _preferredChains Array of chain IDs to monitor for yields
     * @param _apyThresholds Array of minimum APY differences to trigger rebalance (basis points)
     * @param _rebalanceInterval Minimum time between rebalances in seconds
     */
    function deposit(
        uint256 _amount,
        address _token,
        uint256[] calldata _preferredChains,
        uint256[] calldata _apyThresholds,
        uint256 _rebalanceInterval
    ) external nonReentrant whenNotPaused {
        if (_amount < MIN_DEPOSIT) revert InsufficientDeposit();
        if (!authorizedTokens[_token]) revert UnauthorizedToken();
        if (_preferredChains.length != _apyThresholds.length) revert InvalidThreshold();
        if (_rebalanceInterval < MIN_REBALANCE_INTERVAL) revert InvalidInterval();
        
        // Validate thresholds
        for (uint256 i = 0; i < _apyThresholds.length; i++) {
            if (_apyThresholds[i] > MAX_THRESHOLD) revert InvalidThreshold();
        }

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        UserVault storage vault = userVaults[msg.sender];
        
        if (vault.totalDeposited == 0) {
            // Create new vault
            vault.preferredChains = _preferredChains;
            vault.apyThresholds = _apyThresholds;
            vault.rebalanceInterval = _rebalanceInterval;
            vault.isActive = true;
            
            emit VaultCreated(msg.sender, _amount, _preferredChains);
        } else {
            emit DepositAdded(msg.sender, _amount, vault.totalDeposited + _amount);
        }
        
        vault.totalDeposited += _amount;
    }

    /**
     * @notice Update vault parameters for rebalancing strategy
     * @param _apyThresholds New APY thresholds in basis points
     * @param _rebalanceInterval New rebalance interval in seconds
     */
    function updateParameters(
        uint256[] calldata _apyThresholds,
        uint256 _rebalanceInterval
    ) external {
        UserVault storage vault = userVaults[msg.sender];
        if (!vault.isActive) revert VaultNotActive();
        if (_rebalanceInterval < MIN_REBALANCE_INTERVAL) revert InvalidInterval();
        
        for (uint256 i = 0; i < _apyThresholds.length; i++) {
            if (_apyThresholds[i] > MAX_THRESHOLD) revert InvalidThreshold();
        }
        
        vault.apyThresholds = _apyThresholds;
        vault.rebalanceInterval = _rebalanceInterval;
        
        emit ParametersUpdated(msg.sender, _apyThresholds, _rebalanceInterval);
    }

    /**
     * @notice Chainlink Automation checkUpkeep function
     * @dev Checks if any user vault needs rebalancing based on yield differences and time intervals
     * @return upkeepNeeded Whether upkeep is needed
     * @return performData Encoded data for performUpkeep
     */
    function checkUpkeep(bytes calldata) 
        external 
        view 
        override 
        returns (bool upkeepNeeded, bytes memory performData) 
    {
        // This is a simplified version - in production, you'd iterate through users
        // For this example, we'll check if any significant yield opportunities exist
        
        address[] memory usersToRebalance = new address[](1);
        uint256 userCount = 0;
        
        // In a real implementation, you'd maintain a list of active users
        // For now, this serves as a template for the logic
        
        if (userCount > 0) {
            upkeepNeeded = true;
            performData = abi.encode(usersToRebalance);
        }
    }

    /**
     * @notice Chainlink Automation performUpkeep function
     * @dev Executes rebalancing for users who meet criteria
     * @param _performData Encoded array of user addresses to rebalance
     */
    function performUpkeep(bytes calldata _performData) external override {
        address[] memory users = abi.decode(_performData, (address[]));
        
        for (uint256 i = 0; i < users.length; i++) {
            _executeRebalance(users[i]);
        }
    }

    /**
     * @notice Internal function to execute rebalancing for a specific user
     * @param _user Address of the user to rebalance
     */
    function _executeRebalance(address _user) internal {
        UserVault storage vault = userVaults[_user];
        
        if (!vault.isActive) return;
        if (block.timestamp < vault.lastRebalanceTime + vault.rebalanceInterval) {
            return; // Still on cooldown
        }

        // Verify collateral health
        bool healthCheckPassed = healthChecker.verifyCollateral(
            _user,
            vault.totalDeposited
        );
        
        if (!healthCheckPassed) {
            emit RebalanceTriggered(_user, block.timestamp);
            return;
        }

        // Update last rebalance time
        vault.lastRebalanceTime = block.timestamp;
        
        emit RebalanceTriggered(_user, block.timestamp);
    }

    /**
     * @notice Execute cross-chain rebalance based on strategy results
     * @param _user Address of the user
     * @param _rebalanceParams Array of rebalance parameters
     */
    function performRebalance(
        address _user,
        RebalanceParams[] calldata _rebalanceParams
    ) external nonReentrant whenNotPaused {
        // This would typically be called by an authorized agent/contract
        // For security, you'd want proper access controls here
        
        UserVault storage vault = userVaults[_user];
        if (!vault.isActive) revert VaultNotActive();

        for (uint256 i = 0; i < _rebalanceParams.length; i++) {
            RebalanceParams memory params = _rebalanceParams[i];
            
            // Execute cross-chain transfer via CCIP
            ccipModule.sendTokenCrossChain(
                uint64(params.toChain),
                params.targetPool, // receiver address (RebalanceExecutor)
                params.token,
                params.amount,
                abi.encode(params.targetPool, _user)
            );
            
            emit RebalanceExecuted(
                _user,
                params.fromChain,
                params.toChain,
                params.amount,
                params.targetPool
            );
        }
    }

    /**
     * @notice Emergency withdrawal function for users
     * @param _amount Amount to withdraw
     * @param _token Token address to withdraw
     */
    function emergencyWithdraw(uint256 _amount, address _token) external nonReentrant {
        UserVault storage vault = userVaults[msg.sender];
        if (vault.totalDeposited < _amount) revert InsufficientBalance();
        
        vault.totalDeposited -= _amount;
        if (vault.totalDeposited == 0) {
            vault.isActive = false;
        }
        
        IERC20(_token).safeTransfer(msg.sender, _amount);
        
        emit EmergencyWithdrawal(msg.sender, _amount);
    }

    /**
     * @notice Update yield data for a specific chain (Owner only)
     * @param _chainId Chain ID to update
     * @param _poolAddress Pool address on that chain
     * @param _apy Current APY in basis points
     * @param _tvl Total value locked
     * @param _priceFeed Chainlink price feed address
     */
    function updateYieldData(
        uint256 _chainId,
        address _poolAddress,
        uint256 _apy,
        uint256 _tvl,
        address _priceFeed
    ) external onlyOwner {
        chainYieldData[_chainId] = ChainYieldData({
            chainId: _chainId,
            poolAddress: _poolAddress,
            currentApy: _apy,
            tvl: _tvl,
            lastUpdated: block.timestamp,
            priceFeed: AggregatorV3Interface(_priceFeed)
        });
        
        emit YieldDataUpdated(_chainId, _apy, _tvl);
    }

    /**
     * @notice Authorize or deauthorize a token for deposits
     * @param _token Token address
     * @param _authorized Whether the token is authorized
     */
    function setTokenAuthorization(address _token, bool _authorized) external onlyOwner {
        authorizedTokens[_token] = _authorized;
        emit TokenAuthorized(_token, _authorized);
    }

    /**
     * @notice Pause the contract (Owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract (Owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Get user vault information
     * @param _user User address
     * @return vault UserVault struct
     */
    function getUserVault(address _user) external view returns (UserVault memory vault) {
        return userVaults[_user];
    }

    /**
     * @notice Get yield data for a specific chain
     * @param _chainId Chain ID
     * @return yieldData ChainYieldData struct
     */
    function getChainYieldData(uint256 _chainId) external view returns (ChainYieldData memory yieldData) {
        return chainYieldData[_chainId];
    }
} 