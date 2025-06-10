// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

/**
 * @title CCIPModule
 * @notice Handles cross-chain messaging and token transfers using Chainlink CCIP
 * @dev Wraps CCIP functionality for the Crossfluxx yield rebalancer
 */
contract CCIPModule is CCIPReceiver, Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Structs
    struct CrossChainMessage {
        uint64 destinationChainSelector;
        address receiver;
        bytes data;
        address token; // Simplified: storing single token instead of array
        uint256 amount; // Simplified: storing single amount instead of array
        address feeToken;
        bytes32 messageId;
    }

    struct RebalanceInstruction {
        address targetPool;
        address user;
        uint256 amount;
        address token;
        uint256 expectedYield;
        uint256 slippageTolerance;
    }

    // State variables
    mapping(uint64 => bool) public allowlistedDestinationChains;
    mapping(address => bool) public allowlistedSourceSenders;
    mapping(bytes32 => CrossChainMessage) public sentMessages;
    mapping(bytes32 => bool) public processedMessages;
    
    address public immutable linkToken;
    address public crossfluxxCore;
    
    uint256 public constant MAX_SLIPPAGE = 1000; // 10%
    uint256 public gasLimitForCCIPReceive = 500000;
    
    // Events
    event MessageSent(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address receiver,
        address feeToken,
        uint256 fees
    );
    event MessageReceived(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address sender,
        address token,
        uint256 amount
    );
    event TokensTransferred(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address receiver,
        address token,
        uint256 amount,
        uint256 fees
    );
    event RebalanceInstructionReceived(
        bytes32 indexed messageId,
        address indexed user,
        address targetPool,
        uint256 amount
    );
    event ChainAllowlisted(uint64 indexed chainSelector, bool allowed);
    event SenderAllowlisted(address indexed sender, bool allowed);

    // Errors
    error DestinationChainNotAllowlisted(uint64 destinationChainSelector);
    error SourceChainNotAllowlisted(uint64 sourceChainSelector);
    error SenderNotAllowlisted(address sender);
    error MessageAlreadyProcessed(bytes32 messageId);
    error InsufficientBalance(uint256 currentBalance, uint256 calculatedFees);
    error InvalidSlippage();
    error InvalidGasLimit();

    /**
     * @notice Initialize the CCIPModule contract
     * @param _router CCIP router address
     * @param _linkToken LINK token address for fees
     */
    constructor(
        address _router,
        address _linkToken
    ) CCIPReceiver(_router) Ownable(msg.sender) {
        linkToken = _linkToken;
    }

    /**
     * @notice Set the CrossfluxxCore contract address
     * @param _crossfluxxCore Address of the main protocol contract
     */
    function setCrossfluxxCore(address _crossfluxxCore) external onlyOwner {
        crossfluxxCore = _crossfluxxCore;
    }

    /**
     * @notice Send tokens cross-chain via CCIP
     * @param _destinationChainSelector Destination chain selector
     * @param _receiver Receiver address on destination chain
     * @param _token Token to transfer
     * @param _amount Amount to transfer
     * @param _data Additional data to include in message
     * @return messageId CCIP message ID
     */
    function sendTokenCrossChain(
        uint64 _destinationChainSelector,
        address _receiver,
        address _token,
        uint256 _amount,
        bytes calldata _data
    ) external onlyOwner returns (bytes32 messageId) {
        return _sendTokensWithData(
            _destinationChainSelector,
            _receiver,
            _token,
            _amount,
            _data
        );
    }

    /**
     * @notice Send cross-chain rebalance instruction
     * @param _destinationChainSelector Destination chain selector
     * @param _receiver Receiver address (RebalanceExecutor)
     * @param _token Token to transfer
     * @param _amount Amount to transfer
     * @param _instruction Rebalance instruction data
     * @return messageId CCIP message ID
     */
    function sendRebalanceInstruction(
        uint64 _destinationChainSelector,
        address _receiver,
        address _token,
        uint256 _amount,
        RebalanceInstruction calldata _instruction
    ) external nonReentrant whenNotPaused returns (bytes32 messageId) {
        // Only allow calls from the main protocol contract
        require(msg.sender == crossfluxxCore, "Unauthorized caller");
        
        if (!allowlistedDestinationChains[_destinationChainSelector]) {
            revert DestinationChainNotAllowlisted(_destinationChainSelector);
        }
        
        if (_instruction.slippageTolerance > MAX_SLIPPAGE) {
            revert InvalidSlippage();
        }

        bytes memory data = abi.encode(_instruction);
        
        return _sendTokensWithData(
            _destinationChainSelector,
            _receiver,
            _token,
            _amount,
            data
        );
    }

    /**
     * @notice Internal function to send tokens with data via CCIP
     * @param _destinationChainSelector Destination chain selector
     * @param _receiver Receiver address
     * @param _token Token to transfer
     * @param _amount Amount to transfer
     * @param _data Data to include
     * @return messageId CCIP message ID
     */
    function _sendTokensWithData(
        uint64 _destinationChainSelector,
        address _receiver,
        address _token,
        uint256 _amount,
        bytes memory _data
    ) internal returns (bytes32 messageId) {
        
        // Create token amount array
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: _token,
            amount: _amount
        });

        // Build CCIP message
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(_receiver),
            data: _data,
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: gasLimitForCCIPReceive})
            ),
            feeToken: linkToken
        });

        // Get router and calculate fees
        IRouterClient router = IRouterClient(this.getRouter());
        uint256 fees = router.getFee(_destinationChainSelector, evm2AnyMessage);

        // Check LINK balance
        if (fees > IERC20(linkToken).balanceOf(address(this))) {
            revert InsufficientBalance(IERC20(linkToken).balanceOf(address(this)), fees);
        }

        // Approve the router to transfer tokens
        IERC20(_token).forceApprove(address(router), _amount);
        IERC20(linkToken).forceApprove(address(router), fees);

        // Send the message
        messageId = router.ccipSend(_destinationChainSelector, evm2AnyMessage);

        // Store message info
        sentMessages[messageId] = CrossChainMessage({
            destinationChainSelector: _destinationChainSelector,
            receiver: _receiver,
            data: _data,
            token: _token,
            amount: _amount,
            feeToken: linkToken,
            messageId: messageId
        });

        emit TokensTransferred(
            messageId,
            _destinationChainSelector,
            _receiver,
            _token,
            _amount,
            fees
        );

        return messageId;
    }

    /**
     * @notice Handle received CCIP messages
     * @param any2EvmMessage Received message
     */
    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override nonReentrant {
        
        bytes32 messageId = any2EvmMessage.messageId;
        uint64 sourceChainSelector = any2EvmMessage.sourceChainSelector;
        address sender = abi.decode(any2EvmMessage.sender, (address));

        // Verify source chain and sender
        if (!allowlistedDestinationChains[sourceChainSelector]) {
            revert SourceChainNotAllowlisted(sourceChainSelector);
        }
        
        if (!allowlistedSourceSenders[sender]) {
            revert SenderNotAllowlisted(sender);
        }

        // Check if message already processed
        if (processedMessages[messageId]) {
            revert MessageAlreadyProcessed(messageId);
        }

        processedMessages[messageId] = true;

        // Process token transfers if any
        if (any2EvmMessage.destTokenAmounts.length > 0) {
            Client.EVMTokenAmount memory tokenAmount = any2EvmMessage.destTokenAmounts[0];
            
            emit MessageReceived(
                messageId,
                sourceChainSelector,
                sender,
                tokenAmount.token,
                tokenAmount.amount
            );
        }

        // Process rebalance instruction if data exists
        if (any2EvmMessage.data.length > 0) {
            _processRebalanceInstruction(messageId, any2EvmMessage.data);
        }
    }

    /**
     * @notice Process received rebalance instruction
     * @param _messageId Message ID
     * @param _data Encoded rebalance instruction
     */
    function _processRebalanceInstruction(
        bytes32 _messageId,
        bytes memory _data
    ) internal {
        RebalanceInstruction memory instruction = abi.decode(_data, (RebalanceInstruction));
        
        emit RebalanceInstructionReceived(
            _messageId,
            instruction.user,
            instruction.targetPool,
            instruction.amount
        );

        // Forward to RebalanceExecutor (this would be implemented in a real system)
        // For now, we just emit the event to demonstrate the pattern
    }

    /**
     * @notice Allowlist a destination chain
     * @param _destinationChainSelector Chain selector to allowlist
     * @param _allowed Whether to allow or disallow
     */
    function allowlistDestinationChain(
        uint64 _destinationChainSelector,
        bool _allowed
    ) external onlyOwner {
        allowlistedDestinationChains[_destinationChainSelector] = _allowed;
        emit ChainAllowlisted(_destinationChainSelector, _allowed);
    }

    /**
     * @notice Allowlist a source sender
     * @param _sender Sender address to allowlist
     * @param _allowed Whether to allow or disallow
     */
    function allowlistSourceSender(address _sender, bool _allowed) external onlyOwner {
        allowlistedSourceSenders[_sender] = _allowed;
        emit SenderAllowlisted(_sender, _allowed);
    }

    /**
     * @notice Update gas limit for CCIP receive
     * @param _gasLimit New gas limit
     */
    function updateGasLimit(uint256 _gasLimit) external onlyOwner {
        if (_gasLimit < 100000 || _gasLimit > 2000000) {
            revert InvalidGasLimit();
        }
        gasLimitForCCIPReceive = _gasLimit;
    }

    /**
     * @notice Withdraw LINK tokens (Owner only)
     * @param _beneficiary Address to receive LINK tokens
     */
    function withdrawLinkTokens(address _beneficiary) external onlyOwner {
        uint256 balance = IERC20(linkToken).balanceOf(address(this));
        if (balance > 0) {
            IERC20(linkToken).safeTransfer(_beneficiary, balance);
        }
    }

    /**
     * @notice Emergency token withdrawal (Owner only)
     * @param _token Token address
     * @param _beneficiary Address to receive tokens
     */
    function emergencyWithdrawToken(
        address _token,
        address _beneficiary
    ) external onlyOwner {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        if (balance > 0) {
            IERC20(_token).safeTransfer(_beneficiary, balance);
        }
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
     * @notice Get fee estimate for cross-chain transfer
     * @param _destinationChainSelector Destination chain selector
     * @param _receiver Receiver address
     * @param _token Token to transfer
     * @param _amount Amount to transfer
     * @param _data Additional data
     * @return fees Estimated fees in LINK
     */
    function getFeeEstimate(
        uint64 _destinationChainSelector,
        address _receiver,
        address _token,
        uint256 _amount,
        bytes calldata _data
    ) external view returns (uint256 fees) {
        
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: _token,
            amount: _amount
        });

        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(_receiver),
            data: _data,
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: gasLimitForCCIPReceive})
            ),
            feeToken: linkToken
        });

        IRouterClient router = IRouterClient(this.getRouter());
        return router.getFee(_destinationChainSelector, evm2AnyMessage);
    }

    /**
     * @notice Get sent message details
     * @param _messageId Message ID
     * @return message CrossChainMessage struct
     */
    function getSentMessage(bytes32 _messageId) external view returns (CrossChainMessage memory message) {
        return sentMessages[_messageId];
    }

    /**
     * @notice Check if a message has been processed
     * @param _messageId Message ID
     * @return processed Whether the message was processed
     */
    function isMessageProcessed(bytes32 _messageId) external view returns (bool processed) {
        return processedMessages[_messageId];
    }

    /**
     * @notice Check if a destination chain is allowlisted
     * @param _chainSelector Chain selector
     * @return allowed Whether the chain is allowed
     */
    function isChainAllowlisted(uint64 _chainSelector) external view returns (bool allowed) {
        return allowlistedDestinationChains[_chainSelector];
    }

    /**
     * @notice Check if a sender is allowlisted
     * @param _sender Sender address
     * @return allowed Whether the sender is allowed
     */
    function isSenderAllowlisted(address _sender) external view returns (bool allowed) {
        return allowlistedSourceSenders[_sender];
    }
}