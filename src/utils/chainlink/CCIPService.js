import { ethers } from 'ethers';
import { CCIPModuleABI, CHAIN_CONFIGS } from '../../contracts/constants.js';

/**
 * Chainlink CCIP Service
 * Handles cross-chain interoperability for Crossfluxx rebalancing
 */
export class CCIPService {
    constructor(config) {
        this.config = config;
        this.providers = config.providers;
        this.contracts = {};
        this.routers = {};
        this.chainSelectors = {};
        this.isInitialized = false;
        
        // Event listeners
        this.listeners = new Map();
        
        // Transaction tracking
        this.pendingTransactions = new Map();
        this.completedTransactions = new Map();
        
        // Service metrics
        this.metrics = {
            sentMessages: 0,
            receivedMessages: 0,
            tokensTransferred: 0,
            failedTransactions: 0,
            averageGasCost: 0,
            totalGasUsed: 0
        };
    }

    /**
     * Initialize CCIP service
     */
    async initialize() {
        try {
            console.log('🌉 Initializing CCIP Service...');
            
            // Initialize contracts for each network
            for (const network of this.config.networks) {
                await this.initializeNetwork(network);
            }
            
            // Setup event listeners (skip in test mode)
            try {
                this.setupEventListeners();
            } catch (error) {
                if (error.code === 'UNSUPPORTED_OPERATION') {
                    console.log('⚠️  Event listeners skipped (testing mode)');
                } else {
                    throw error;
                }
            }
            
            // Start monitoring pending transactions
            this.startTransactionMonitoring();
            
            this.isInitialized = true;
            console.log('✅ CCIP Service initialization complete');
            
        } catch (error) {
            console.error('❌ Failed to initialize CCIP service:', error);
            throw error;
        }
    }

    /**
     * Initialize CCIP contracts for a specific network
     */
    async initializeNetwork(network) {
        const chainId = this.getChainIdForNetwork(network);
        const provider = this.providers[network];
        
        if (!provider) {
            throw new Error(`Provider not found for network: ${network}`);
        }

        const contractAddress = this.config.contracts[chainId]?.CCIPModule;
        if (!contractAddress || contractAddress === "0x...") {
            console.warn(`⚠️  CCIP contract not deployed on ${network} (${chainId})`);
            return;
        }

        // Initialize CCIP Module contract
                    this.contracts[chainId] = new ethers.Contract(
            contractAddress,
            CCIPModuleABI,
            provider
        );

        // Store chain selector
        const chainConfig = CHAIN_CONFIGS[chainId];
        if (chainConfig) {
            this.chainSelectors[chainId] = chainConfig.chainSelector;
        }

        console.log(`✅ CCIP initialized for ${network} (${chainId})`);
    }

    /**
     * Setup event listeners for CCIP events
     */
    setupEventListeners() {
        Object.entries(this.contracts).forEach(([chainId, contract]) => {
            // Try to setup event listeners, skip if provider doesn't support them
            try {
                contract.on('MessageSent', (messageId, destinationChainSelector, receiver, feeToken, fees, event) => {
                    this.handleMessageSent({
                        messageId,
                        destinationChainSelector,
                        receiver,
                        feeToken,
                        fees,
                        sourceChainId: chainId,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber
                    });
                });
            } catch (error) {
                if (error.code === 'UNSUPPORTED_OPERATION') {
                    console.log(`⚠️  MessageSent listener not supported for chain ${chainId} (testing mode)`);
                } else {
                    console.error(`Failed to setup MessageSent listener for chain ${chainId}:`, error);
                }
            }

            try {
                contract.on('MessageReceived', (messageId, sourceChainSelector, sender, token, amount, event) => {
                    this.handleMessageReceived({
                        messageId,
                        sourceChainSelector,
                        sender,
                        token,
                        amount,
                        destinationChainId: chainId,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber
                    });
                });
            } catch (error) {
                if (error.code === 'UNSUPPORTED_OPERATION') {
                    console.log(`⚠️  MessageReceived listener not supported for chain ${chainId} (testing mode)`);
                } else {
                    console.error(`Failed to setup MessageReceived listener for chain ${chainId}:`, error);
                }
            }

            try {
                contract.on('TokensTransferred', (messageId, destinationChainSelector, receiver, token, amount, fees, event) => {
                    this.handleTokensTransferred({
                        messageId,
                        destinationChainSelector,
                        receiver,
                        token,
                        amount,
                        fees,
                        sourceChainId: chainId,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber
                    });
                });
            } catch (error) {
                if (error.code === 'UNSUPPORTED_OPERATION') {
                    console.log(`⚠️  TokensTransferred listener not supported for chain ${chainId} (testing mode)`);
                } else {
                    console.error(`Failed to setup TokensTransferred listener for chain ${chainId}:`, error);
                }
            }

            try {
                contract.on('RebalanceInstructionReceived', (messageId, user, targetPool, amount, event) => {
                    this.handleRebalanceInstruction({
                        messageId,
                        user,
                        targetPool,
                        amount,
                        chainId,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber
                    });
                });
            } catch (error) {
                if (error.code === 'UNSUPPORTED_OPERATION') {
                    console.log(`⚠️  RebalanceInstructionReceived listener not supported for chain ${chainId} (testing mode)`);
                } else {
                    console.error(`Failed to setup RebalanceInstructionReceived listener for chain ${chainId}:`, error);
                }
            }
        });

        console.log('👂 CCIP event listeners configured');
    }

    /**
     * Start monitoring pending transactions
     */
    startTransactionMonitoring() {
        setInterval(async () => {
            await this.checkPendingTransactions();
        }, 30000); // Check every 30 seconds

        console.log('⏰ Transaction monitoring started');
    }

    /**
     * Execute cross-chain rebalance
     */
    async executeRebalance(params) {
        try {
            const {
                sourceChainId,
                destinationChainId,
                user,
                token,
                amount,
                targetPool,
                expectedYield,
                slippageTolerance = 500, // 5%
                priceData
            } = params;

            // Validate parameters
            this.validateRebalanceParams(params);

            // Get source contract
            const sourceContract = this.contracts[sourceChainId];
            if (!sourceContract) {
                throw new Error(`CCIP contract not available for chain ${sourceChainId}`);
            }

            // Get destination chain selector
            const destinationChainSelector = this.chainSelectors[destinationChainId];
            if (!destinationChainSelector) {
                throw new Error(`Chain selector not found for destination chain ${destinationChainId}`);
            }

            // Get destination contract address
            const destinationContractAddress = this.config.contracts[destinationChainId]?.RebalanceExecutor;
            if (!destinationContractAddress) {
                throw new Error(`RebalanceExecutor not deployed on destination chain ${destinationChainId}`);
            }

            // Create rebalance instruction
            const rebalanceInstruction = {
                targetPool,
                user,
                amount,
                token,
                expectedYield,
                slippageTolerance
            };

            // Estimate fees
            const fees = await this.estimateFees(
                sourceChainId,
                destinationChainSelector,
                destinationContractAddress,
                token,
                amount,
                rebalanceInstruction
            );

            // Execute the cross-chain rebalance
            const signer = this.providers[this.getNetworkForChainId(sourceChainId)].getSigner();
            const contractWithSigner = sourceContract.connect(signer);

            const tx = await contractWithSigner.sendRebalanceInstruction(
                destinationChainSelector,
                destinationContractAddress,
                token,
                amount,
                rebalanceInstruction,
                {
                    gasLimit: this.config.config.gasLimit,
                    gasPrice: await this.getOptimalGasPrice(sourceChainId)
                }
            );

            // Track transaction
            const messageId = await this.extractMessageId(tx);
            this.trackTransaction(messageId, {
                type: 'rebalance',
                sourceChainId,
                destinationChainId,
                transactionHash: tx.hash,
                params,
                fees,
                status: 'pending',
                timestamp: Date.now()
            });

            // Update metrics
            this.updateMetrics('sentMessage');

            console.log(`🌉 Rebalance instruction sent: ${messageId}`);
            
            return {
                messageId,
                transactionHash: tx.hash,
                fees,
                estimatedGas: this.config.config.gasLimit
            };

        } catch (error) {
            this.updateMetrics('failedTransaction');
            console.error('❌ Failed to execute rebalance:', error);
            throw error;
        }
    }

    /**
     * Send tokens cross-chain
     */
    async sendTokensCrossChain(params) {
        try {
            const {
                sourceChainId,
                destinationChainId,
                receiver,
                token,
                amount,
                data = '0x'
            } = params;

            const sourceContract = this.contracts[sourceChainId];
            const destinationChainSelector = this.chainSelectors[destinationChainId];

            if (!sourceContract || !destinationChainSelector) {
                throw new Error('Invalid chain configuration');
            }

            // Estimate fees
            const fees = await this.estimateFees(
                sourceChainId,
                destinationChainSelector,
                receiver,
                token,
                amount,
                data
            );

            // Send tokens
            const signer = this.providers[this.getNetworkForChainId(sourceChainId)].getSigner();
            const contractWithSigner = sourceContract.connect(signer);

            const tx = await contractWithSigner.sendTokenCrossChain(
                destinationChainSelector,
                receiver,
                token,
                amount,
                data,
                {
                    gasLimit: this.config.config.gasLimit
                }
            );

            const messageId = await this.extractMessageId(tx);
            this.trackTransaction(messageId, {
                type: 'tokenTransfer',
                sourceChainId,
                destinationChainId,
                transactionHash: tx.hash,
                params,
                fees,
                status: 'pending',
                timestamp: Date.now()
            });

            this.updateMetrics('tokensTransferred');

            return {
                messageId,
                transactionHash: tx.hash,
                fees
            };

        } catch (error) {
            this.updateMetrics('failedTransaction');
            throw error;
        }
    }

    /**
     * Estimate CCIP fees
     */
    async estimateFees(sourceChainId, destinationChainSelector, receiver, token, amount, data) {
        try {
            const contract = this.contracts[sourceChainId];
            
            const fees = await contract.getFeeEstimate(
                destinationChainSelector,
                receiver,
                token,
                amount,
                typeof data === 'object' ? ethers.utils.defaultAbiCoder.encode(
                    ['tuple(address,address,uint256,address,uint256,uint256)'],
                    [data]
                ) : data
            );

            return fees;

        } catch (error) {
            console.error('Failed to estimate fees:', error);
            throw error;
        }
    }

    /**
     * Estimate fee for cross-chain transaction (simplified interface)
     */
    async estimateFee(sourceChainId, destinationChainId, messageData) {
        try {
            // For demo purposes, return a mock fee calculation
            const baseFee = ethers.utils.parseEther('0.001'); // 0.001 ETH base
            const gasMultiplier = messageData.amount ? 
                Math.floor(Number(messageData.amount) / 1000000) : 1; // Scale with amount
            
            const estimatedFee = baseFee.add(ethers.utils.parseUnits((gasMultiplier * 100).toString(), 'gwei'));
            
            console.log(`💰 Estimated CCIP fee: ${ethers.utils.formatEther(estimatedFee)} ETH`);
            
            this.updateMetrics('feeEstimations');
            
            return estimatedFee;
            
        } catch (error) {
            console.error('❌ Fee estimation failed:', error);
            this.updateMetrics('errors');
            // Return mock fee for demo
            return ethers.utils.parseEther('0.001');
        }
    }

    /**
     * Check if chain is allowlisted
     */
    async isChainAllowlisted(sourceChainId, destinationChainSelector) {
        try {
            const contract = this.contracts[sourceChainId];
            return await contract.isChainAllowlisted(destinationChainSelector);
        } catch (error) {
            console.error('Failed to check chain allowlist:', error);
            return false;
        }
    }

    /**
     * Get message status
     */
    async getMessageStatus(messageId) {
        const transaction = this.pendingTransactions.get(messageId) || this.completedTransactions.get(messageId);
        
        if (!transaction) {
            return { status: 'unknown', messageId };
        }

        // Check if message has been processed on destination
        if (transaction.status === 'pending') {
            const isProcessed = await this.checkMessageProcessed(messageId, transaction.destinationChainId);
            if (isProcessed) {
                transaction.status = 'completed';
                this.completedTransactions.set(messageId, transaction);
                this.pendingTransactions.delete(messageId);
            }
        }

        return {
            status: transaction.status,
            messageId,
            ...transaction
        };
    }

    /**
     * Handle message sent event
     */
    handleMessageSent(eventData) {
        console.log(`📤 Message sent: ${eventData.messageId}`);
        
        this.updateMetrics('sentMessage');
        this.emit('messageSent', eventData);
    }

    /**
     * Handle message received event
     */
    handleMessageReceived(eventData) {
        console.log(`📥 Message received: ${eventData.messageId}`);
        
        this.updateMetrics('receivedMessage');
        this.emit('messageReceived', eventData);
    }

    /**
     * Handle tokens transferred event
     */
    handleTokensTransferred(eventData) {
        console.log(`💰 Tokens transferred: ${eventData.amount} on message ${eventData.messageId}`);
        
        this.updateMetrics('tokensTransferred');
        this.emit('tokensTransferred', eventData);
    }

    /**
     * Handle rebalance instruction event
     */
    handleRebalanceInstruction(eventData) {
        console.log(`⚖️  Rebalance instruction received: ${eventData.messageId}`);
        
        this.emit('rebalanceInstruction', eventData);
    }

    /**
     * Validate rebalance parameters
     */
    validateRebalanceParams(params) {
        const required = ['sourceChainId', 'destinationChainId', 'user', 'token', 'amount', 'targetPool'];
        
        for (const field of required) {
            if (!params[field]) {
                throw new Error(`Missing required parameter: ${field}`);
            }
        }

        if (params.sourceChainId === params.destinationChainId) {
            throw new Error('Source and destination chains cannot be the same');
        }

        if (params.amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
    }

    /**
     * Track transaction
     */
    trackTransaction(messageId, transactionData) {
        this.pendingTransactions.set(messageId, transactionData);
        
        // Auto-cleanup after 24 hours
        setTimeout(() => {
            this.pendingTransactions.delete(messageId);
        }, 24 * 60 * 60 * 1000);
    }

    /**
     * Check pending transactions
     */
    async checkPendingTransactions() {
        for (const [messageId, transaction] of this.pendingTransactions.entries()) {
            try {
                const isProcessed = await this.checkMessageProcessed(messageId, transaction.destinationChainId);
                
                if (isProcessed) {
                    transaction.status = 'completed';
                    transaction.completedAt = Date.now();
                    
                    this.completedTransactions.set(messageId, transaction);
                    this.pendingTransactions.delete(messageId);
                    
                    this.emit('transactionCompleted', transaction);
                    console.log(`✅ Transaction completed: ${messageId}`);
                }
            } catch (error) {
                console.error(`Error checking transaction ${messageId}:`, error);
            }
        }
    }

    /**
     * Check if message has been processed on destination chain
     */
    async checkMessageProcessed(messageId, destinationChainId) {
        try {
            const contract = this.contracts[destinationChainId];
            if (!contract) return false;
            
            return await contract.isMessageProcessed(messageId);
        } catch (error) {
            return false;
        }
    }

    /**
     * Extract message ID from transaction receipt
     */
    async extractMessageId(tx) {
        const receipt = await tx.wait();
        
        // Look for MessageSent event
        for (const log of receipt.logs) {
            try {
                const decoded = this.contracts[tx.chainId].interface.parseLog(log);
                if (decoded.name === 'MessageSent') {
                    return decoded.args.messageId;
                }
            } catch (error) {
                // Skip logs that can't be decoded
                continue;
            }
        }
        
        throw new Error('Message ID not found in transaction receipt');
    }

    /**
     * Get optimal gas price for chain
     */
    async getOptimalGasPrice(chainId) {
        try {
            const provider = this.providers[this.getNetworkForChainId(chainId)];
            const gasPrice = await provider.getGasPrice();
            
            // Add 10% buffer
            return gasPrice * 110n / 100n;
            
        } catch (error) {
            console.error('Failed to get gas price:', error);
            return ethers.utils.parseUnits('20', 'gwei'); // Fallback
        }
    }

    /**
     * Update price data for rebalancing decisions
     */
    updatePriceData(priceData) {
        this.priceData = priceData;
        this.emit('priceDataUpdated', priceData);
    }

    /**
     * Get supported chains
     */
    getSupportedChains() {
        return Object.keys(this.contracts).map(chainId => ({
            chainId: parseInt(chainId),
            network: this.getNetworkForChainId(chainId),
            chainSelector: this.chainSelectors[chainId],
            isActive: !!this.contracts[chainId]
        }));
    }

    /**
     * Update metrics
     */
    updateMetrics(type) {
        if (this.metrics[type] !== undefined) {
            this.metrics[type]++;
        }
        
        this.emit('activity', { type, service: 'ccip' });
    }

    /**
     * Get health status
     */
    async getHealthStatus() {
        const activeContracts = Object.keys(this.contracts).length;
        const pendingCount = this.pendingTransactions.size;
        
        return {
            status: activeContracts > 0 ? 'healthy' : 'degraded',
            activeContracts,
            pendingTransactions: pendingCount,
            metrics: this.metrics,
            timestamp: Date.now()
        };
    }

    /**
     * Utility functions
     */
    getChainIdForNetwork(network) {
        const mapping = {
            'ethereum': 11155111, // Sepolia for testing
            'arbitrum': 421614,   // Arbitrum Sepolia
            'polygon': 80002      // Polygon Amoy
        };
        return mapping[network];
    }

    getNetworkForChainId(chainId) {
        const mapping = {
            11155111: 'ethereum',
            421614: 'arbitrum',
            80002: 'polygon'
        };
        return mapping[chainId];
    }

    /**
     * Event emitter methods
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in CCIP event listener for ${event}:`, error);
            }
        });
    }

    /**
     * Restart service
     */
    async restart() {
        console.log('🔄 Restarting CCIP service...');
        await this.shutdown();
        await this.initialize();
    }

    /**
     * Shutdown service
     */
    async shutdown() {
        // Remove all event listeners
        Object.values(this.contracts).forEach(contract => {
            contract.removeAllListeners();
        });
        
        this.isInitialized = false;
        console.log('🔌 CCIP service shutdown complete');
    }
}

export default CCIPService; 