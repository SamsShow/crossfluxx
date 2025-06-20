import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCrossfluxx } from '../context/CrossfluxxContext.js';
import { parseUnits, parseEther, formatEther, getAddress } from 'ethers';

const CrossChainManager = () => {
    const {
        account,
        contracts,
        isWalletConnected,
        chainId,
        marketData
    } = useCrossfluxx();

    const [ccipFees, setCcipFees] = useState({});
    const [transferForm, setTransferForm] = useState({
        fromChain: 1,
        toChain: 42161,
        token: 'USDC',
        amount: '',
        targetPool: '',
        slippageTolerance: 100 // 1% in basis points
    });
    const [rebalanceForm, setRebalanceForm] = useState({
        user: '',
        operations: [
            {
                fromChain: 1,
                toChain: 42161,
                token: 'USDC',
                amount: '',
                targetPool: '',
                expectedYield: 0
            }
        ]
    });
    const [isEstimatingFees, setIsEstimatingFees] = useState(false);
    const [isExecutingTransfer, setIsExecutingTransfer] = useState(false);
    const [isExecutingRebalance, setIsExecutingRebalance] = useState(false);
    const [pendingOperations, setPendingOperations] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const chains = [
        { id: 1, name: 'ethereum', displayName: 'Ethereum', selector: '5009297550715157269', color: 'bg-blue-500' },
        { id: 42161, name: 'arbitrum', displayName: 'Arbitrum', selector: '4949039107694359620', color: 'bg-orange-500' },
        { id: 137, name: 'polygon', displayName: 'Polygon', selector: '4051577828743386545', color: 'bg-purple-500' }
    ];

    const tokens = [
        { symbol: 'USDC', address: '0xA0b86a33E6441b1982EaE00ca48fA0BcA7FdcaEc', decimals: 6 }, // Real Mainnet USDC
        { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 }, // Real Mainnet USDT
        { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 }  // Real Mainnet DAI
    ];

    useEffect(() => {
        if (isWalletConnected && contracts.ccip) {
            loadCCIPData();
        }
    }, [isWalletConnected, contracts.ccip]);

    const addNotification = (type, title, message) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, type, title, message }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    const loadCCIPData = async () => {
        try {
            // Load pending operations
            console.log('Loading CCIP data...');
            addNotification('info', 'CCIP Data', 'Loading cross-chain data...');
        } catch (error) {
            console.error('Error loading CCIP data:', error);
            addNotification('error', 'Error', 'Failed to load CCIP data');
        }
    };

    const validateContract = (contractName) => {
        const contract = contracts[contractName];
        if (!contract) {
            addNotification('error', 'Contract Error', `${contractName} contract not available. Please ensure contracts are deployed.`);
            return false;
        }

        // Check if contract address is a zero address
        if (contract.address === '0x0000000000000000000000000000000000000000') {
            addNotification('warning', 'Demo Mode', `Using mock ${contractName} contract. In production, this would interact with real contracts.`);
            return 'mock';
        }

        return true;
    };

    const estimateCCIPFees = async (fromChain, toChain, amount, token) => {
        try {
            setIsEstimatingFees(true);
            
            const tokenData = tokens.find(t => t.symbol === token);
            const toChainData = chains.find(c => c.id === toChain);
            
            if (!tokenData || !toChainData) {
                addNotification('error', 'Chain/Token Error', 'Invalid chain or token data');
                return null;
            }

            const contractValidation = validateContract('ccip');
            if (!contractValidation) return null;

            if (contractValidation === 'mock') {
                // Mock fee estimation for demo
                const baseFee = parseEther('0.001');
                const amountWei = parseUnits(amount || '100', tokenData.decimals);
                const estimatedFee = baseFee.add(amountWei.div(1000)); // 0.1% of amount

                const feeKey = `${fromChain}-${toChain}-${token}`;
                setCcipFees(prev => ({
                    ...prev,
                    [feeKey]: {
                        fee: estimatedFee.toString(),
                        formattedFee: formatEther(estimatedFee),
                        timestamp: Date.now()
                    }
                }));

                addNotification('success', 'Fee Estimated', `CCIP fee: ~${formatEther(estimatedFee).slice(0, 6)} ETH`);
                return estimatedFee;
            } else {
                // Real contract call
                const amountWei = parseUnits(amount || '100', tokenData.decimals);
                const estimatedFee = await contracts.ccip.estimateFee(
                    toChainData.selector,
                    transferForm.targetPool || account,
                    amountWei,
                    'aave', // Default target protocol
                    300000 // Gas limit
                );

                const feeKey = `${fromChain}-${toChain}-${token}`;
                setCcipFees(prev => ({
                    ...prev,
                    [feeKey]: {
                        fee: estimatedFee.toString(),
                        formattedFee: formatEther(estimatedFee),
                        timestamp: Date.now()
                    }
                }));

                addNotification('success', 'Fee Estimated', `CCIP fee: ~${formatEther(estimatedFee).slice(0, 6)} ETH`);
                return estimatedFee;
            }

        } catch (error) {
            console.error('Fee estimation failed:', error);
            addNotification('error', 'Fee Estimation Failed', error.message);
            return null;
        } finally {
            setIsEstimatingFees(false);
        }
    };

    const handleCrossChainTransfer = async () => {
        try {
            setIsExecutingTransfer(true);

            if (!transferForm.amount || !transferForm.targetPool) {
                addNotification('error', 'Validation Error', 'Please fill in amount and target pool address');
                return;
            }

            const contractValidation = validateContract('ccip');
            if (!contractValidation) return;

            const tokenData = tokens.find(t => t.symbol === transferForm.token);
            const toChainData = chains.find(c => c.id === transferForm.toChain);
            
            if (!tokenData || !toChainData) {
                addNotification('error', 'Validation Error', 'Invalid token or chain data');
                return;
            }

            const amountWei = parseUnits(transferForm.amount, tokenData.decimals);
            
            // Validate and checksum addresses
            let tokenAddress, receiverAddress;
            try {
                tokenAddress = getAddress(tokenData.address);
                receiverAddress = getAddress(transferForm.targetPool);
            } catch (addressError) {
                addNotification('error', 'Invalid Address', 'Please check that all addresses are valid Ethereum addresses');
                return;
            }
            
            if (contractValidation === 'mock') {
                // Mock transaction for demo
                console.log('Mock cross-chain transfer:', {
                    destinationChainSelector: toChainData.selector,
                    receiver: receiverAddress,
                    token: tokenAddress,
                    amount: amountWei.toString(),
                    data: '0x'
                });

                // Simulate transaction delay
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Generate mock transaction hash
                const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
                const messageId = `0x${Math.random().toString(16).substr(2, 64)}`;

                addNotification('success', 'Transfer Initiated', `Mock transaction: ${mockTxHash.slice(0, 10)}...`);

                // Add to pending operations
                setPendingOperations(prev => [...prev, {
                    messageId,
                    type: 'transfer',
                    fromChain: transferForm.fromChain,
                    toChain: transferForm.toChain,
                    amount: transferForm.amount,
                    token: transferForm.token,
                    status: 'pending',
                    timestamp: Date.now(),
                    txHash: mockTxHash
                }]);

            } else {
                // Real contract call
                const transferTx = await contracts.ccip.sendTokenCrossChain(
                    toChainData.selector,
                    transferForm.targetPool,
                    tokenData.address,
                    amountWei,
                    '0x' // Additional data
                );

                addNotification('info', 'Transaction Sent', 'Waiting for confirmation...');

                const receipt = await transferTx.wait();
                console.log('Cross-chain transfer initiated:', receipt);

                addNotification('success', 'Transfer Confirmed', `Transaction: ${receipt.transactionHash.slice(0, 10)}...`);

                // Extract message ID from logs
                const messageId = receipt.logs[0]?.topics[1]; 
                setPendingOperations(prev => [...prev, {
                    messageId,
                    type: 'transfer',
                    fromChain: transferForm.fromChain,
                    toChain: transferForm.toChain,
                    amount: transferForm.amount,
                    token: transferForm.token,
                    status: 'pending',
                    timestamp: Date.now(),
                    txHash: receipt.transactionHash
                }]);
            }

            // Reset form
            setTransferForm(prev => ({ ...prev, amount: '', targetPool: '' }));

        } catch (error) {
            console.error('Cross-chain transfer failed:', error);
            addNotification('error', 'Transfer Failed', error.message || 'Transaction failed');
        } finally {
            setIsExecutingTransfer(false);
        }
    };

    const handleRebalanceExecution = async () => {
        try {
            setIsExecutingRebalance(true);

            // Validate all operations have required fields
            const invalidOp = rebalanceForm.operations.find(op => !op.amount || !op.targetPool);
            if (invalidOp) {
                addNotification('error', 'Validation Error', 'Please fill in all amounts and target pool addresses');
                return;
            }

            const contractValidation = validateContract('core');
            if (!contractValidation) return;

            if (contractValidation === 'mock') {
                // Mock rebalance execution for demo
                let rebalanceParams;
                try {
                    rebalanceParams = rebalanceForm.operations.map(op => {
                        const tokenData = tokens.find(t => t.symbol === op.token);
                        return {
                            fromChain: op.fromChain,
                            toChain: op.toChain,
                            token: getAddress(tokenData.address),
                            amount: parseUnits(op.amount, tokenData.decimals),
                            targetPool: getAddress(op.targetPool),
                            expectedApy: Math.floor(op.expectedYield * 100) // Convert to basis points
                        };
                    });
                } catch (addressError) {
                    addNotification('error', 'Invalid Address', 'Please check that all addresses are valid Ethereum addresses');
                    return;
                }

                console.log('Mock rebalance execution:', {
                    user: rebalanceForm.user || account,
                    rebalanceParams
                });

                // Simulate transaction delay
                await new Promise(resolve => setTimeout(resolve, 3000));

                const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
                addNotification('success', 'Rebalance Executed', `Mock rebalance completed: ${mockTxHash.slice(0, 10)}...`);

                // Add to pending operations
                rebalanceForm.operations.forEach((op, index) => {
                    setPendingOperations(prev => [...prev, {
                        messageId: `rebalance-${Date.now()}-${index}`,
                        type: 'rebalance',
                        fromChain: op.fromChain,
                        toChain: op.toChain,
                        amount: op.amount,
                        token: op.token,
                        status: 'completed',
                        timestamp: Date.now(),
                        txHash: mockTxHash
                    }]);
                });

            } else {
                // Real contract call
                let rebalanceParams;
                try {
                    rebalanceParams = rebalanceForm.operations.map(op => {
                        const tokenData = tokens.find(t => t.symbol === op.token);
                        return {
                            fromChain: op.fromChain,
                            toChain: op.toChain,
                            token: getAddress(tokenData.address),
                            amount: parseUnits(op.amount, tokenData.decimals),
                            targetPool: getAddress(op.targetPool),
                            expectedApy: Math.floor(op.expectedYield * 100)
                        };
                    });
                } catch (addressError) {
                    addNotification('error', 'Invalid Address', 'Please check that all addresses are valid Ethereum addresses');
                    return;
                }

                const rebalanceTx = await contracts.core.performRebalance(
                    rebalanceForm.user || account,
                    rebalanceParams
                );

                addNotification('info', 'Rebalance Sent', 'Waiting for confirmation...');

                const receipt = await rebalanceTx.wait();
                console.log('Rebalance executed:', receipt);

                addNotification('success', 'Rebalance Confirmed', `Transaction: ${receipt.transactionHash.slice(0, 10)}...`);
            }

            // Reset operations to single default operation
            setRebalanceForm(prev => ({
                ...prev,
                operations: [
                    {
                        fromChain: 1,
                        toChain: 42161,
                        token: 'USDC',
                        amount: '',
                        targetPool: '',
                        expectedYield: 0
                    }
                ]
            }));

        } catch (error) {
            console.error('Rebalance execution failed:', error);
            addNotification('error', 'Rebalance Failed', error.message || 'Transaction failed');
        } finally {
            setIsExecutingRebalance(false);
        }
    };

    const addRebalanceOperation = () => {
        setRebalanceForm(prev => ({
            ...prev,
            operations: [...prev.operations, {
                fromChain: 1,
                toChain: 42161,
                token: 'USDC',
                amount: '',
                targetPool: '',
                expectedYield: 0
            }]
        }));
    };

    const removeRebalanceOperation = (index) => {
        setRebalanceForm(prev => ({
            ...prev,
            operations: prev.operations.filter((_, i) => i !== index)
        }));
    };

    const getChainDisplayName = (chainId) => {
        return chains.find(c => c.id === chainId)?.displayName || `Chain ${chainId}`;
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    if (!isWalletConnected) {
        return (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Cross-Chain Manager</h3>
                <p className="text-gray-400">Please connect your wallet to manage cross-chain operations.</p>
            </div>
        );
    }

    return (
        <motion.div 
            className="bg-gray-900 border border-gray-700 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h3 className="text-white text-xl font-semibold mb-6">Cross-Chain Manager (CCIP)</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cross-Chain Transfer */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h4 className="text-green-400 font-semibold mb-4">Cross-Chain Transfer</h4>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">From Chain</label>
                                <select
                                    value={transferForm.fromChain}
                                    onChange={(e) => setTransferForm(prev => ({ ...prev, fromChain: parseInt(e.target.value) }))}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-green-500 focus:outline-none"
                                >
                                    {chains.map(chain => (
                                        <option key={chain.id} value={chain.id}>
                                            {chain.displayName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">To Chain</label>
                                <select
                                    value={transferForm.toChain}
                                    onChange={(e) => setTransferForm(prev => ({ ...prev, toChain: parseInt(e.target.value) }))}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-green-500 focus:outline-none"
                                >
                                    {chains.filter(c => c.id !== transferForm.fromChain).map(chain => (
                                        <option key={chain.id} value={chain.id}>
                                            {chain.displayName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">Token</label>
                                <select
                                    value={transferForm.token}
                                    onChange={(e) => setTransferForm(prev => ({ ...prev, token: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-green-500 focus:outline-none"
                                >
                                    {tokens.map(token => (
                                        <option key={token.symbol} value={token.symbol}>
                                            {token.symbol}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">Amount</label>
                                <input
                                    type="number"
                                    value={transferForm.amount}
                                    onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-green-500 focus:outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Target Pool Address</label>
                            <input
                                type="text"
                                value={transferForm.targetPool}
                                onChange={(e) => setTransferForm(prev => ({ ...prev, targetPool: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-green-500 focus:outline-none"
                                placeholder="0x..."
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => estimateCCIPFees(transferForm.fromChain, transferForm.toChain, transferForm.amount, transferForm.token)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded transition-colors"
                                disabled={isEstimatingFees}
                            >
                                {isEstimatingFees ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Estimating...
                                    </span>
                                ) : 'Estimate Fees'}
                            </button>
                            <button
                                onClick={handleCrossChainTransfer}
                                className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded transition-colors"
                                disabled={!transferForm.amount || !transferForm.targetPool || isExecutingTransfer}
                            >
                                {isExecutingTransfer ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Executing...
                                    </span>
                                ) : 'Execute Transfer'}
                            </button>
                        </div>

                        {/* Fee Display */}
                        {Object.keys(ccipFees).length > 0 && (
                            <div className="mt-4 p-3 bg-gray-700 rounded">
                                <h5 className="text-white font-medium mb-2">Estimated CCIP Fees</h5>
                                {Object.entries(ccipFees).map(([key, feeData]) => (
                                    <div key={key} className="text-sm text-gray-300">
                                        {key}: ~{parseFloat(feeData.formattedFee).toFixed(4)} ETH
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Rebalance Operations */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h4 className="text-green-400 font-semibold mb-4">Rebalance Operations</h4>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">User Address (optional)</label>
                            <input
                                type="text"
                                value={rebalanceForm.user}
                                onChange={(e) => setRebalanceForm(prev => ({ ...prev, user: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-green-500 focus:outline-none"
                                placeholder={account || "0x..."}
                            />
                        </div>

                        {/* Rebalance Operations */}
                        {rebalanceForm.operations.map((operation, index) => (
                            <div key={index} className="p-4 bg-gray-700 rounded border-l-4 border-green-500">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-white font-medium">Operation {index + 1}</span>
                                    {rebalanceForm.operations.length > 1 && (
                                        <button
                                            onClick={() => removeRebalanceOperation(index)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <select
                                        value={operation.fromChain}
                                        onChange={(e) => {
                                            const newOps = [...rebalanceForm.operations];
                                            newOps[index].fromChain = parseInt(e.target.value);
                                            setRebalanceForm(prev => ({ ...prev, operations: newOps }));
                                        }}
                                        className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:border-green-500 focus:outline-none"
                                    >
                                        {chains.map(chain => (
                                            <option key={chain.id} value={chain.id}>{chain.displayName}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={operation.toChain}
                                        onChange={(e) => {
                                            const newOps = [...rebalanceForm.operations];
                                            newOps[index].toChain = parseInt(e.target.value);
                                            setRebalanceForm(prev => ({ ...prev, operations: newOps }));
                                        }}
                                        className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:border-green-500 focus:outline-none"
                                    >
                                        {chains.filter(c => c.id !== operation.fromChain).map(chain => (
                                            <option key={chain.id} value={chain.id}>{chain.displayName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <select
                                        value={operation.token}
                                        onChange={(e) => {
                                            const newOps = [...rebalanceForm.operations];
                                            newOps[index].token = e.target.value;
                                            setRebalanceForm(prev => ({ ...prev, operations: newOps }));
                                        }}
                                        className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:border-green-500 focus:outline-none"
                                    >
                                        {tokens.map(token => (
                                            <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        value={operation.amount}
                                        onChange={(e) => {
                                            const newOps = [...rebalanceForm.operations];
                                            newOps[index].amount = e.target.value;
                                            setRebalanceForm(prev => ({ ...prev, operations: newOps }));
                                        }}
                                        className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:border-green-500 focus:outline-none"
                                        placeholder="Amount"
                                    />
                                    <input
                                        type="number"
                                        value={operation.expectedYield}
                                        onChange={(e) => {
                                            const newOps = [...rebalanceForm.operations];
                                            newOps[index].expectedYield = parseFloat(e.target.value) || 0;
                                            setRebalanceForm(prev => ({ ...prev, operations: newOps }));
                                        }}
                                        className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:border-green-500 focus:outline-none"
                                        placeholder="Expected APY %"
                                        step="0.01"
                                    />
                                </div>

                                <input
                                    type="text"
                                    value={operation.targetPool}
                                    onChange={(e) => {
                                        const newOps = [...rebalanceForm.operations];
                                        newOps[index].targetPool = e.target.value;
                                        setRebalanceForm(prev => ({ ...prev, operations: newOps }));
                                    }}
                                    className="w-full mt-3 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:border-green-500 focus:outline-none"
                                    placeholder="Target Pool Address"
                                />
                            </div>
                        ))}

                        <div className="flex gap-2">
                            <button
                                onClick={addRebalanceOperation}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded transition-colors"
                                disabled={isExecutingRebalance}
                            >
                                Add Operation
                            </button>
                            <button
                                onClick={handleRebalanceExecution}
                                className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded transition-colors"
                                disabled={rebalanceForm.operations.some(op => !op.amount || !op.targetPool) || isExecutingRebalance}
                            >
                                {isExecutingRebalance ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Executing...
                                    </span>
                                ) : 'Execute Rebalance'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Operations */}
            {pendingOperations.length > 0 && (
                <div className="mt-6 bg-gray-800 rounded-lg p-6">
                    <h4 className="text-green-400 font-semibold mb-4">Pending Cross-Chain Operations</h4>
                    <div className="space-y-3">
                        {pendingOperations.map((operation, index) => (
                            <div key={index} className="p-3 bg-gray-700 rounded border-l-4 border-green-500">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <div className="text-white font-medium">
                                            {operation.type === 'transfer' ? 'Cross-Chain Transfer' : 'Rebalance Operation'}: {operation.amount} {operation.token}
                                        </div>
                                        <div className="text-gray-400 text-sm">
                                            {getChainDisplayName(operation.fromChain)} → {getChainDisplayName(operation.toChain)}
                                        </div>
                                        {operation.txHash && (
                                            <div className="text-blue-400 text-xs font-mono">
                                                TX: {operation.txHash.slice(0, 10)}...{operation.txHash.slice(-8)}
                                            </div>
                                        )}
                                        <div className="text-gray-500 text-xs mt-1">
                                            {formatTimestamp(operation.timestamp)}
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                                        operation.status === 'completed' ? 'bg-green-600 text-white' :
                                        operation.status === 'pending' ? 'bg-yellow-600 text-white' :
                                        'bg-gray-600 text-white'
                                    }`}>
                                        {operation.status.toUpperCase()}
                                    </div>
                                </div>
                                {operation.messageId && (
                                    <div className="text-gray-500 text-xs font-mono">
                                        Message ID: {operation.messageId.slice(0, 16)}...
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Notification System */}
            {notifications.length > 0 && (
                <div className="fixed top-4 right-4 z-50 space-y-2">
                    {notifications.map((notification) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: 300 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 300 }}
                            className={`min-w-80 p-4 rounded-lg shadow-lg ${
                                notification.type === 'success' ? 'bg-green-600' :
                                notification.type === 'error' ? 'bg-red-600' :
                                notification.type === 'warning' ? 'bg-yellow-600' :
                                'bg-blue-600'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-white font-semibold text-sm">{notification.title}</h4>
                                    <p className="text-white text-xs mt-1 opacity-90">{notification.message}</p>
                                </div>
                                <button
                                    onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                                    className="text-white hover:text-gray-200 ml-4"
                                >
                                    ✕
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default CrossChainManager; 