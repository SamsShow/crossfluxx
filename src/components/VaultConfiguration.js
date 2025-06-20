import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Contract, parseUnits, formatUnits } from 'ethers';
import { useCrossfluxx } from '../context/CrossfluxxContext.js';

const VaultConfiguration = () => {
    const {
        account,
        contracts,
        isWalletConnected,
        userDeposits,
        marketData
    } = useCrossfluxx();

    const [vaultData, setVaultData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        depositAmount: '',
        selectedToken: 'USDC',
        preferredChains: {
            ethereum: true,
            arbitrum: true,
            polygon: true
        },
        apyThresholds: {
            ethereum: 500, // 5% in basis points
            arbitrum: 500,
            polygon: 500
        },
        rebalanceInterval: 86400, // 24 hours in seconds
        slippageTolerance: 100 // 1% in basis points
    });

    // Supported tokens (from contract authorization)
    const supportedTokens = [
        { symbol: 'USDC', address: '0xA0b86a33E6441E7B8e65F3b2F5e7eFd4B1234567', decimals: 6 },
        { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
        { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 }
    ];

    const chains = [
        { id: 1, name: 'ethereum', displayName: 'Ethereum', color: 'bg-blue-500' },
        { id: 42161, name: 'arbitrum', displayName: 'Arbitrum', color: 'bg-orange-500' },
        { id: 137, name: 'polygon', displayName: 'Polygon', color: 'bg-purple-500' }
    ];

    useEffect(() => {
        if (isWalletConnected && contracts.core && account) {
            loadVaultData();
        }
    }, [isWalletConnected, contracts.core, account]);

    const loadVaultData = async () => {
        try {
            if (!contracts.core) return;
            
            const vault = await contracts.core.getUserVault(account);
            console.log('Loaded vault data:', vault);
            
            if (vault.isActive) {
                setVaultData({
                    totalDeposited: vault.totalDeposited.toString(),
                    lastRebalanceTime: vault.lastRebalanceTime.toString(),
                    preferredChains: vault.preferredChains.map(id => id.toString()),
                    apyThresholds: vault.apyThresholds.map(threshold => threshold.toString()),
                    rebalanceInterval: vault.rebalanceInterval.toString(),
                    isActive: vault.isActive
                });

                // Update form data with existing vault settings
                setFormData(prev => ({
                    ...prev,
                    rebalanceInterval: parseInt(vault.rebalanceInterval.toString()),
                    apyThresholds: {
                        ethereum: parseInt(vault.apyThresholds[0]?.toString() || '500'),
                        arbitrum: parseInt(vault.apyThresholds[1]?.toString() || '500'),
                        polygon: parseInt(vault.apyThresholds[2]?.toString() || '500')
                    }
                }));
            }
        } catch (error) {
            console.error('Error loading vault data:', error);
        }
    };

    const handleDepositWithConfiguration = async () => {
        try {
            if (!contracts.core) {
                console.error('Core contract not available');
                return;
            }

            const selectedTokenData = supportedTokens.find(t => t.symbol === formData.selectedToken);
            if (!selectedTokenData) {
                console.error('Token not found');
                return;
            }

            // Convert chains to array format
            const preferredChainIds = chains
                .filter(chain => formData.preferredChains[chain.name])
                .map(chain => chain.id);

            const apyThresholdArray = chains
                .filter(chain => formData.preferredChains[chain.name])
                .map(chain => formData.apyThresholds[chain.name]);

            // Convert deposit amount to wei
            const depositAmountWei = parseUnits(
                formData.depositAmount,
                selectedTokenData.decimals
            );

            console.log('Depositing with configuration:', {
                amount: depositAmountWei.toString(),
                token: selectedTokenData.address,
                preferredChains: preferredChainIds,
                apyThresholds: apyThresholdArray,
                rebalanceInterval: formData.rebalanceInterval
            });

            // First approve token spending
            const tokenContract = new Contract(
                selectedTokenData.address,
                ['function approve(address spender, uint256 amount) returns (bool)'],
                contracts.core.signer
            );

            const approveTx = await tokenContract.approve(
                contracts.core.address,
                depositAmountWei
            );
            await approveTx.wait();

            // Then deposit with configuration
            const depositTx = await contracts.core.deposit(
                depositAmountWei,
                selectedTokenData.address,
                preferredChainIds,
                apyThresholdArray,
                formData.rebalanceInterval
            );

            await depositTx.wait();
            console.log('Deposit successful!');
            
            // Reload vault data
            await loadVaultData();
            setIsEditing(false);

        } catch (error) {
            console.error('Deposit failed:', error);
        }
    };

    const handleUpdateParameters = async () => {
        try {
            if (!contracts.core || !vaultData) {
                console.error('Core contract or vault data not available');
                return;
            }

            const apyThresholdArray = chains
                .filter(chain => formData.preferredChains[chain.name])
                .map(chain => formData.apyThresholds[chain.name]);

            console.log('Updating parameters:', {
                apyThresholds: apyThresholdArray,
                rebalanceInterval: formData.rebalanceInterval
            });

            const updateTx = await contracts.core.updateParameters(
                apyThresholdArray,
                formData.rebalanceInterval
            );

            await updateTx.wait();
            console.log('Parameters updated successfully!');
            
            // Reload vault data
            await loadVaultData();
            setIsEditing(false);

        } catch (error) {
            console.error('Parameter update failed:', error);
        }
    };

    const handleEmergencyWithdraw = async () => {
        try {
            if (!contracts.core || !vaultData) {
                console.error('Core contract or vault data not available');
                return;
            }

            const selectedTokenData = supportedTokens.find(t => t.symbol === formData.selectedToken);
            const withdrawAmount = formData.depositAmount || vaultData.totalDeposited;
            
            const withdrawAmountWei = parseUnits(
                withdrawAmount,
                selectedTokenData.decimals
            );

            console.log('Emergency withdrawal:', {
                amount: withdrawAmountWei.toString(),
                token: selectedTokenData.address
            });

            const withdrawTx = await contracts.core.emergencyWithdraw(
                withdrawAmountWei,
                selectedTokenData.address
            );

            await withdrawTx.wait();
            console.log('Emergency withdrawal successful!');
            
            // Reload vault data
            await loadVaultData();

        } catch (error) {
            console.error('Emergency withdrawal failed:', error);
        }
    };

    const formatTimeInterval = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
        return `${seconds} seconds`;
    };

    const formatAPYThreshold = (basisPoints) => {
        return `${(basisPoints / 100).toFixed(2)}%`;
    };

    if (!isWalletConnected) {
        return (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Vault Configuration</h3>
                <p className="text-gray-400">Please connect your wallet to manage your vault configuration.</p>
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
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white text-xl font-semibold">Vault Configuration</h3>
                {vaultData?.isActive && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            {isEditing ? 'Cancel' : 'Edit Configuration'}
                        </button>
                        <button
                            onClick={handleEmergencyWithdraw}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                            Emergency Withdraw
                        </button>
                    </div>
                )}
            </div>

            {/* Vault Status */}
            {vaultData && (
                <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                    <h4 className="text-green-400 font-semibold mb-3">Current Vault Status</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-gray-400">Total Deposited:</span>
                            <p className="text-white font-semibold">
                                ${parseInt(formatUnits(vaultData.totalDeposited, 6)).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-400">Rebalance Interval:</span>
                            <p className="text-white font-semibold">
                                {formatTimeInterval(parseInt(vaultData.rebalanceInterval))}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-400">Last Rebalance:</span>
                            <p className="text-white font-semibold">
                                {vaultData.lastRebalanceTime === '0' 
                                    ? 'Never' 
                                    : new Date(parseInt(vaultData.lastRebalanceTime) * 1000).toLocaleDateString()
                                }
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-400">Status:</span>
                            <p className="text-green-400 font-semibold">Active</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Configuration Form */}
            {(!vaultData || isEditing) && (
                <div className="space-y-6">
                    {/* Deposit Amount and Token */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                {vaultData ? 'Additional Deposit Amount' : 'Initial Deposit Amount'}
                            </label>
                            <input
                                type="number"
                                value={formData.depositAmount}
                                onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                                placeholder="Enter amount"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Token</label>
                            <select
                                value={formData.selectedToken}
                                onChange={(e) => setFormData(prev => ({ ...prev, selectedToken: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                            >
                                {supportedTokens.map(token => (
                                    <option key={token.symbol} value={token.symbol}>
                                        {token.symbol}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Preferred Chains */}
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-3">Preferred Chains</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {chains.map(chain => (
                                <div key={chain.id} className="flex items-center p-3 bg-gray-800 rounded-lg">
                                    <input
                                        type="checkbox"
                                        checked={formData.preferredChains[chain.name]}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            preferredChains: {
                                                ...prev.preferredChains,
                                                [chain.name]: e.target.checked
                                            }
                                        }))}
                                        className="mr-3"
                                    />
                                    <div className={`w-3 h-3 rounded-full ${chain.color} mr-3`}></div>
                                    <span className="text-white font-medium">{chain.displayName}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* APY Thresholds */}
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-3">APY Thresholds (Basis Points)</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {chains.map(chain => (
                                <div key={chain.id} className="bg-gray-800 p-4 rounded-lg">
                                    <label className="block text-gray-400 text-sm mb-2">{chain.displayName}</label>
                                    <input
                                        type="number"
                                        value={formData.apyThresholds[chain.name]}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            apyThresholds: {
                                                ...prev.apyThresholds,
                                                [chain.name]: parseInt(e.target.value) || 0
                                            }
                                        }))}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-green-500 focus:outline-none"
                                        placeholder="500"
                                        disabled={!formData.preferredChains[chain.name]}
                                    />
                                    <span className="text-gray-500 text-xs">
                                        = {formatAPYThreshold(formData.apyThresholds[chain.name])}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rebalance Interval */}
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Rebalance Interval (seconds)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="number"
                                value={formData.rebalanceInterval}
                                onChange={(e) => setFormData(prev => ({ ...prev, rebalanceInterval: parseInt(e.target.value) || 3600 }))}
                                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                                min="3600"
                                placeholder="86400"
                            />
                            <div className="flex items-center text-gray-400 text-sm">
                                = {formatTimeInterval(formData.rebalanceInterval)}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        {vaultData ? (
                            <button
                                onClick={handleUpdateParameters}
                                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                Update Parameters
                            </button>
                        ) : (
                            <button
                                onClick={handleDepositWithConfiguration}
                                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                                disabled={!formData.depositAmount || parseFloat(formData.depositAmount) <= 0}
                            >
                                Create Vault & Deposit
                            </button>
                        )}
                        {formData.depositAmount && vaultData && (
                            <button
                                onClick={handleDepositWithConfiguration}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                Add Deposit
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Current Configuration Display */}
            {vaultData && !isEditing && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {chains.map((chain, index) => (
                            <div key={chain.id} className="bg-gray-800 p-4 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <div className={`w-3 h-3 rounded-full ${chain.color} mr-2`}></div>
                                    <span className="text-white font-medium">{chain.displayName}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-gray-400">APY Threshold: </span>
                                    <span className="text-green-400">
                                        {vaultData.apyThresholds[index] 
                                            ? formatAPYThreshold(parseInt(vaultData.apyThresholds[index]))
                                            : 'N/A'
                                        }
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default VaultConfiguration; 