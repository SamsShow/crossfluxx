// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

/**
 * @title RebalanceExecutor
 * @notice Executes rebalancing operations on target chains
 * @dev Receives cross-chain instructions and executes swaps/yield farming
 */
contract RebalanceExecutor is CCIPReceiver, Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Structs
    struct RebalanceInstruction {
        address targetPool;
        address user;
        uint256 amount;
        address token;
        uint256 expectedYield;
        uint256 slippageTolerance;
    }

    struct PoolInfo {
        address poolAddress;
        address lpToken;
        uint256 currentApy;
        bool isActive;
        bytes swapCalldata; // For complex swap operations
    }

    struct ExecutionResult {
        bytes32 messageId;
        address user;
        address targetPool;
        uint256 amountIn;
        uint256 amountOut;
        uint256 lpTokensReceived;
        uint256 actualYield;
        bool success;
        uint256 timestamp;
    }

    // State variables
    mapping(address => PoolInfo) public supportedPools;
    mapping(bytes32 => ExecutionResult) public executionResults;
    mapping(address => bool) public authorizedCCIPSenders;
    mapping(address => uint256) public userBalances; // Track user LP balances
    
    address public ccipModule;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public defaultSlippageTolerance = 300; // 3%
    
    // Events
    event RebalanceExecuted(
        bytes32 indexed messageId,
        address indexed user,
        address indexed targetPool,
        uint256 amountIn,
        uint256 amountOut,
        uint256 lpTokensReceived
    );
    event PoolConfigured(
        address indexed poolAddress,
        address lpToken,
        uint256 apy,
        bool isActive
    );
    event SwapExecuted(
        address indexed user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    event YieldFarmingEntered(
        address indexed user,
        address indexed pool,
        uint256 amount,
        uint256 lpTokens
    );
    event EmergencyWithdrawal(
        address indexed user,
        address indexed token,
        uint256 amount
    );

    // Errors
    error UnsupportedPool(address pool);
    error SlippageExceeded(uint256 expectedAmount, uint256 actualAmount);
    error InsufficientBalance(uint256 available, uint256 required);
    error SwapFailed();
    error UnauthorizedSender(address sender);
    error InvalidSlippage();

    /**
     * @notice Initialize the RebalanceExecutor contract
     * @param _router CCIP router address
     */
    constructor(address _router) CCIPReceiver(_router) Ownable(msg.sender) {}

    /**
     * @notice Set the CCIP Module address
     * @param _ccipModule Address of the CCIPModule contract
     */
    function setCCIPModule(address _ccipModule) external onlyOwner {
        ccipModule = _ccipModule;
    }

    /**
     * @notice Configure a supported pool for yield farming
     * @param _poolAddress Pool contract address
     * @param _lpToken LP token address for the pool
     * @param _apy Current APY in basis points
     * @param _swapCalldata Custom calldata for swap operations
     */
    function configurePool(
        address _poolAddress,
        address _lpToken,
        uint256 _apy,
        bytes calldata _swapCalldata
    ) external onlyOwner {
        supportedPools[_poolAddress] = PoolInfo({
            poolAddress: _poolAddress,
            lpToken: _lpToken,
            currentApy: _apy,
            isActive: true,
            swapCalldata: _swapCalldata
        });
        
        emit PoolConfigured(_poolAddress, _lpToken, _apy, true);
    }

    /**
     * @notice Handle received CCIP messages with rebalance instructions
     * @param any2EvmMessage Received CCIP message
     */
    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override nonReentrant whenNotPaused {
        
        bytes32 messageId = any2EvmMessage.messageId;
        address sender = abi.decode(any2EvmMessage.sender, (address));
        
        // Verify sender authorization
        if (!authorizedCCIPSenders[sender]) {
            revert UnauthorizedSender(sender);
        }

        // Process token transfers
        Client.EVMTokenAmount memory tokenAmount;
        if (any2EvmMessage.destTokenAmounts.length > 0) {
            tokenAmount = any2EvmMessage.destTokenAmounts[0];
        }
        
        // Decode rebalance instruction
        RebalanceInstruction memory instruction = abi.decode(
            any2EvmMessage.data, 
            (RebalanceInstruction)
        );
        
        // Execute the rebalance
        _executeRebalance(messageId, tokenAmount, instruction);
    }

    /**
     * @notice Execute rebalancing operations
     * @param _messageId CCIP message ID
     * @param _tokenAmount Token amount received
     * @param _instruction Rebalance instruction
     */
    function _executeRebalance(
        bytes32 _messageId,
        Client.EVMTokenAmount memory _tokenAmount,
        RebalanceInstruction memory _instruction
    ) internal {
        
        PoolInfo memory poolInfo = supportedPools[_instruction.targetPool];
        if (!poolInfo.isActive) {
            revert UnsupportedPool(_instruction.targetPool);
        }

        uint256 amountIn = _tokenAmount.amount;
        uint256 amountOut = 0;
        uint256 lpTokensReceived = 0;
        bool success = false;

        try this._performSwapAndStake(
            _tokenAmount.token,
            amountIn,
            _instruction.targetPool,
            _instruction.slippageTolerance,
            poolInfo
        ) returns (uint256 _amountOut, uint256 _lpTokens) {
            amountOut = _amountOut;
            lpTokensReceived = _lpTokens;
            success = true;
            
            // Update user balance tracking
            userBalances[_instruction.user] += lpTokensReceived;
            
        } catch {
            // Handle failure case
            success = false;
        }

        // Store execution result
        executionResults[_messageId] = ExecutionResult({
            messageId: _messageId,
            user: _instruction.user,
            targetPool: _instruction.targetPool,
            amountIn: amountIn,
            amountOut: amountOut,
            lpTokensReceived: lpTokensReceived,
            actualYield: poolInfo.currentApy,
            success: success,
            timestamp: block.timestamp
        });

        emit RebalanceExecuted(
            _messageId,
            _instruction.user,
            _instruction.targetPool,
            amountIn,
            amountOut,
            lpTokensReceived
        );
    }

    /**
     * @notice Perform swap and staking operations
     * @param _tokenIn Input token address
     * @param _amountIn Input amount
     * @param _targetPool Target pool address
     * @param _slippageTolerance Slippage tolerance in basis points
     * @param _poolInfo Pool information
     * @return amountOut Amount received from swap
     * @return lpTokens LP tokens received from staking
     */
    function _performSwapAndStake(
        address _tokenIn,
        uint256 _amountIn,
        address _targetPool,
        uint256 _slippageTolerance,
        PoolInfo memory _poolInfo
    ) external returns (uint256 amountOut, uint256 lpTokens) {
        // This function should only be called internally via try/catch
        require(msg.sender == address(this), "Internal function only");
        
        // Step 1: Perform swap if needed (simplified implementation)
        uint256 swapOutput = _performSwap(_tokenIn, _amountIn, _targetPool, _slippageTolerance);
        
        // Step 2: Stake in yield farming pool
        lpTokens = _stakeInPool(_targetPool, swapOutput, _poolInfo);
        
        return (swapOutput, lpTokens);
    }

    /**
     * @notice Perform token swap (simplified implementation)
     * @param _tokenIn Input token
     * @param _amountIn Input amount
     * @param _targetPool Target pool (for determining output token)
     * @param _slippageTolerance Slippage tolerance
     * @return amountOut Output amount from swap
     */
    function _performSwap(
        address _tokenIn,
        uint256 _amountIn,
        address _targetPool,
        uint256 _slippageTolerance
    ) internal returns (uint256 amountOut) {
        
        // This is a simplified swap implementation
        // In production, you would integrate with DEX aggregators like 1inch, Paraswap, etc.
        
        // For demonstration, we'll assume a 1:1 swap with minimal slippage
        amountOut = (_amountIn * (BASIS_POINTS - _slippageTolerance)) / BASIS_POINTS;
        
        // Emit swap event
        emit SwapExecuted(
            msg.sender,
            _tokenIn,
            address(0), // Would be the actual output token
            _amountIn,
            amountOut
        );
        
        return amountOut;
    }

    /**
     * @notice Stake tokens in yield farming pool
     * @param _poolAddress Pool address
     * @param _amount Amount to stake
     * @param _poolInfo Pool information
     * @return lpTokens LP tokens received
     */
    function _stakeInPool(
        address _poolAddress,
        uint256 _amount,
        PoolInfo memory _poolInfo
    ) internal returns (uint256 lpTokens) {
        
        // This is a simplified staking implementation
        // In production, you would call the actual pool contract methods
        
        // For demonstration, assume 1:1 ratio for LP tokens
        lpTokens = _amount;
        
        emit YieldFarmingEntered(
            msg.sender,
            _poolAddress,
            _amount,
            lpTokens
        );
        
        return lpTokens;
    }

    /**
     * @notice Authorize a CCIP sender
     * @param _sender Sender address to authorize
     * @param _authorized Whether to authorize or revoke
     */
    function authorizeCCIPSender(address _sender, bool _authorized) external onlyOwner {
        authorizedCCIPSenders[_sender] = _authorized;
    }

    /**
     * @notice Update pool APY (Owner only)
     * @param _poolAddress Pool address
     * @param _newApy New APY in basis points
     */
    function updatePoolAPY(address _poolAddress, uint256 _newApy) external onlyOwner {
        PoolInfo storage pool = supportedPools[_poolAddress];
        pool.currentApy = _newApy;
    }

    /**
     * @notice Disable a pool (Owner only)
     * @param _poolAddress Pool address to disable
     */
    function disablePool(address _poolAddress) external onlyOwner {
        supportedPools[_poolAddress].isActive = false;
    }

    /**
     * @notice Update default slippage tolerance (Owner only)
     * @param _newSlippage New slippage tolerance in basis points
     */
    function updateDefaultSlippage(uint256 _newSlippage) external onlyOwner {
        if (_newSlippage > 1000) revert InvalidSlippage(); // Max 10%
        defaultSlippageTolerance = _newSlippage;
    }

    /**
     * @notice Emergency withdrawal for users
     * @param _token Token address to withdraw
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(address _token, uint256 _amount) external nonReentrant {
        uint256 userBalance = userBalances[msg.sender];
        if (userBalance < _amount) {
            revert InsufficientBalance(userBalance, _amount);
        }
        
        userBalances[msg.sender] -= _amount;
        IERC20(_token).safeTransfer(msg.sender, _amount);
        
        emit EmergencyWithdrawal(msg.sender, _token, _amount);
    }

    /**
     * @notice Withdraw user LP tokens (for normal operation)
     * @param _poolAddress Pool address
     * @param _amount Amount of LP tokens to withdraw
     */
    function withdrawFromPool(address _poolAddress, uint256 _amount) external nonReentrant {
        uint256 userBalance = userBalances[msg.sender];
        if (userBalance < _amount) {
            revert InsufficientBalance(userBalance, _amount);
        }
        
        PoolInfo memory poolInfo = supportedPools[_poolAddress];
        
        // Withdraw from pool (simplified)
        userBalances[msg.sender] -= _amount;
        
        // Transfer underlying tokens back to user
        IERC20(poolInfo.lpToken).safeTransfer(msg.sender, _amount);
    }

    /**
     * @notice Get execution result for a message ID
     * @param _messageId Message ID
     * @return result ExecutionResult struct
     */
    function getExecutionResult(bytes32 _messageId) external view returns (ExecutionResult memory result) {
        return executionResults[_messageId];
    }

    /**
     * @notice Get pool information
     * @param _poolAddress Pool address
     * @return poolInfo PoolInfo struct
     */
    function getPoolInfo(address _poolAddress) external view returns (PoolInfo memory poolInfo) {
        return supportedPools[_poolAddress];
    }

    /**
     * @notice Get user balance in LP tokens
     * @param _user User address
     * @return balance LP token balance
     */
    function getUserBalance(address _user) external view returns (uint256 balance) {
        return userBalances[_user];
    }

    /**
     * @notice Check if a pool is supported and active
     * @param _poolAddress Pool address
     * @return isSupported Whether the pool is supported
     */
    function isPoolSupported(address _poolAddress) external view returns (bool isSupported) {
        return supportedPools[_poolAddress].isActive;
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
     * @notice Emergency token recovery (Owner only)
     * @param _token Token address
     * @param _amount Amount to recover
     */
    function emergencyRecoverToken(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(owner(), _amount);
    }
} 