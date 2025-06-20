import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCrossfluxx } from '../context/CrossfluxxContext.js';
import { parseEther, formatEther, isAddress } from 'ethers';

const AdminPanel = () => {
    const {
        account,
        contracts,
        isWalletConnected,
        chainId
    } = useCrossfluxx();

    const [isAdmin, setIsAdmin] = useState(false);
    const [contractState, setContractState] = useState({
        isPaused: false,
        owner: null
    });
    const [tokenForm, setTokenForm] = useState({
        address: '',
        authorized: true
    });
    const [yieldDataForm, setYieldDataForm] = useState({
        chainId: 1,
        poolAddress: '',
        apy: '',
        tvl: '',
        priceFeed: ''
    });
    const [authorizedTokens, setAuthorizedTokens] = useState([]);
    const [chainYieldData, setChainYieldData] = useState({});

    const chains = [
        { id: 1, name: 'ethereum', displayName: 'Ethereum' },
        { id: 42161, name: 'arbitrum', displayName: 'Arbitrum' },
        { id: 137, name: 'polygon', displayName: 'Polygon' }
    ];

    const commonTokens = [
        { symbol: 'USDC', address: '0xA0b86a33E6441E7B8e65F3b2F5e7eFd4B1234567' },
        { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
        { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
        { symbol: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' }
    ];

    useEffect(() => {
        if (isWalletConnected && contracts.core && account) {
            checkAdminStatus();
            loadContractState();
        }
    }, [isWalletConnected, contracts.core, account]);

    const checkAdminStatus = async () => {
        try {
            if (!contracts.core) return;
            
            const owner = await contracts.core.owner();
            setIsAdmin(account.toLowerCase() === owner.toLowerCase());
            setContractState(prev => ({ ...prev, owner }));
        } catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
        }
    };

    const loadContractState = async () => {
        try {
            if (!contracts.core) return;

            // Check if contract is paused
            const isPaused = await contracts.core.paused();
            setContractState(prev => ({ ...prev, isPaused }));

            // Load authorized tokens status for common tokens
            const tokenStatuses = {};
            for (const token of commonTokens) {
                try {
                    const isAuthorized = await contracts.core.authorizedTokens(token.address);
                    tokenStatuses[token.address] = isAuthorized;
                } catch (error) {
                    console.error(`Error checking token ${token.symbol}:`, error);
                    tokenStatuses[token.address] = false;
                }
            }
            setAuthorizedTokens(tokenStatuses);

            // Load yield data for each chain
            const yieldDataByChain = {};
            for (const chain of chains) {
                try {
                    const yieldData = await contracts.core.getChainYieldData(chain.id);
                    if (yieldData.lastUpdated > 0) {
                        yieldDataByChain[chain.id] = {
                            chainId: yieldData.chainId.toString(),
                            poolAddress: yieldData.poolAddress,
                            currentApy: yieldData.currentApy.toString(),
                            tvl: yieldData.tvl.toString(),
                            lastUpdated: yieldData.lastUpdated.toString(),
                            priceFeed: yieldData.priceFeed
                        };
                    }
                } catch (error) {
                    console.error(`Error loading yield data for chain ${chain.id}:`, error);
                }
            }
            setChainYieldData(yieldDataByChain);

        } catch (error) {
            console.error('Error loading contract state:', error);
        }
    };

    const handlePauseContract = async () => {
        try {
            if (!contracts.core || !isAdmin) {
                console.error('Not authorized or contract not available');
                return;
            }

            const tx = contractState.isPaused 
                ? await contracts.core.unpause()
                : await contracts.core.pause();

            await tx.wait();
            console.log(`Contract ${contractState.isPaused ? 'unpaused' : 'paused'} successfully`);
            
            // Reload state
            await loadContractState();

        } catch (error) {
            console.error('Error toggling pause state:', error);
        }
    };

    const handleTokenAuthorization = async () => {
        try {
            if (!contracts.core || !isAdmin) {
                console.error('Not authorized or contract not available');
                return;
            }

            if (!isAddress(tokenForm.address)) {
                console.error('Invalid token address');
                return;
            }

            console.log('Setting token authorization:', {
                token: tokenForm.address,
                authorized: tokenForm.authorized
            });

            const tx = await contracts.core.setTokenAuthorization(
                tokenForm.address,
                tokenForm.authorized
            );

            await tx.wait();
            console.log('Token authorization updated successfully');
            
            // Reload state
            await loadContractState();
            
            // Reset form
            setTokenForm({ address: '', authorized: true });

        } catch (error) {
            console.error('Error setting token authorization:', error);
        }
    };

    const handleYieldDataUpdate = async () => {
        try {
            if (!contracts.core || !isAdmin) {
                console.error('Not authorized or contract not available');
                return;
            }

            if (!isAddress(yieldDataForm.poolAddress) || 
                !isAddress(yieldDataForm.priceFeed)) {
                console.error('Invalid pool or price feed address');
                return;
            }

            // Convert APY percentage to basis points
            const apyBasisPoints = Math.floor(parseFloat(yieldDataForm.apy) * 100);
            const tvlWei = parseEther(yieldDataForm.tvl);

            console.log('Updating yield data:', {
                chainId: yieldDataForm.chainId,
                poolAddress: yieldDataForm.poolAddress,
                apy: apyBasisPoints,
                tvl: tvlWei.toString(),
                priceFeed: yieldDataForm.priceFeed
            });

            const tx = await contracts.core.updateYieldData(
                yieldDataForm.chainId,
                yieldDataForm.poolAddress,
                apyBasisPoints,
                tvlWei,
                yieldDataForm.priceFeed
            );

            await tx.wait();
            console.log('Yield data updated successfully');
            
            // Reload state
            await loadContractState();
            
            // Reset form
            setYieldDataForm({
                chainId: 1,
                poolAddress: '',
                apy: '',
                tvl: '',
                priceFeed: ''
            });

        } catch (error) {
            console.error('Error updating yield data:', error);
        }
    };

    const formatBasisPoints = (basisPoints) => {
        return (parseInt(basisPoints) / 100).toFixed(2) + '%';
    };

    const formatTimestamp = (timestamp) => {
        return new Date(parseInt(timestamp) * 1000).toLocaleString();
    };

    const formatTVL = (tvlWei) => {
        const tvlEth = formatEther(tvlWei);
        return parseFloat(tvlEth).toLocaleString() + ' ETH';
    };

    if (!isWalletConnected) {
        return (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Admin Panel</h3>
                <p className="text-gray-400">Please connect your wallet to access admin functions.</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Admin Panel</h3>
                <div className="text-center">
                    <div className="text-red-400 text-lg mb-2">⚠️ Access Denied</div>
                    <p className="text-gray-400">You are not authorized to access admin functions.</p>
                    <p className="text-gray-500 text-sm mt-2">
                        Current account: {account}
                    </p>
                    <p className="text-gray-500 text-sm">
                        Contract owner: {contractState.owner}
                    </p>
                </div>
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
                <h3 className="text-white text-xl font-semibold">Admin Panel</h3>
                <div className="flex items-center gap-4">
                    <div className="text-sm">
                        <span className="text-gray-400">Status: </span>
                        <span className={`font-semibold ${contractState.isPaused ? 'text-red-400' : 'text-green-400'}`}>
                            {contractState.isPaused ? 'PAUSED' : 'ACTIVE'}
                        </span>
                    </div>
                    <button
                        onClick={handlePauseContract}
                        className={`px-4 py-2 rounded transition-colors ${
                            contractState.isPaused 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                    >
                        {contractState.isPaused ? 'Unpause Contract' : 'Pause Contract'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Token Authorization */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h4 className="text-green-400 font-semibold mb-4">Token Authorization</h4>
                    
                    {/* Current Token Status */}
                    <div className="mb-6">
                        <h5 className="text-white font-medium mb-3">Current Token Status</h5>
                        <div className="space-y-2">
                            {commonTokens.map(token => (
                                <div key={token.address} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                                    <div>
                                        <span className="text-white font-medium">{token.symbol}</span>
                                        <div className="text-gray-400 text-xs">{token.address}</div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                                        authorizedTokens[token.address] 
                                            ? 'bg-green-600 text-white' 
                                            : 'bg-red-600 text-white'
                                    }`}>
                                        {authorizedTokens[token.address] ? 'Authorized' : 'Not Authorized'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add/Update Token Authorization */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Token Address</label>
                            <input
                                type="text"
                                value={tokenForm.address}
                                onChange={(e) => setTokenForm(prev => ({ ...prev, address: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-green-500 focus:outline-none"
                                placeholder="0x..."
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Authorization</label>
                            <select
                                value={tokenForm.authorized}
                                onChange={(e) => setTokenForm(prev => ({ ...prev, authorized: e.target.value === 'true' }))}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-green-500 focus:outline-none"
                            >
                                <option value={true}>Authorized</option>
                                <option value={false}>Not Authorized</option>
                            </select>
                        </div>
                        <button
                            onClick={handleTokenAuthorization}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors"
                            disabled={!tokenForm.address}
                        >
                            Update Token Authorization
                        </button>
                    </div>
                </div>

                {/* Yield Data Management */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h4 className="text-green-400 font-semibold mb-4">Yield Data Management</h4>
                    
                    {/* Current Yield Data */}
                    <div className="mb-6">
                        <h5 className="text-white font-medium mb-3">Current Yield Data</h5>
                        <div className="space-y-3">
                            {chains.map(chain => {
                                const data = chainYieldData[chain.id];
                                return (
                                    <div key={chain.id} className="p-3 bg-gray-700 rounded">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-white font-medium">{chain.displayName}</span>
                                            {data ? (
                                                <span className="text-green-400 text-sm">
                                                    APY: {formatBasisPoints(data.currentApy)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">No data</span>
                                            )}
                                        </div>
                                        {data && (
                                            <div className="text-xs text-gray-400 space-y-1">
                                                <div>Pool: {data.poolAddress}</div>
                                                <div>TVL: {formatTVL(data.tvl)}</div>
                                                <div>Updated: {formatTimestamp(data.lastUpdated)}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Update Yield Data */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Chain</label>
                            <select
                                value={yieldDataForm.chainId}
                                onChange={(e) => setYieldDataForm(prev => ({ ...prev, chainId: parseInt(e.target.value) }))}
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
                            <label className="block text-gray-300 text-sm font-medium mb-2">Pool Address</label>
                            <input
                                type="text"
                                value={yieldDataForm.poolAddress}
                                onChange={(e) => setYieldDataForm(prev => ({ ...prev, poolAddress: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-green-500 focus:outline-none"
                                placeholder="0x..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">APY (%)</label>
                                <input
                                    type="number"
                                    value={yieldDataForm.apy}
                                    onChange={(e) => setYieldDataForm(prev => ({ ...prev, apy: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-green-500 focus:outline-none"
                                    placeholder="5.25"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">TVL (ETH)</label>
                                <input
                                    type="number"
                                    value={yieldDataForm.tvl}
                                    onChange={(e) => setYieldDataForm(prev => ({ ...prev, tvl: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-green-500 focus:outline-none"
                                    placeholder="1000"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Price Feed Address</label>
                            <input
                                type="text"
                                value={yieldDataForm.priceFeed}
                                onChange={(e) => setYieldDataForm(prev => ({ ...prev, priceFeed: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-green-500 focus:outline-none"
                                placeholder="0x... (Chainlink Price Feed)"
                            />
                        </div>
                        <button
                            onClick={handleYieldDataUpdate}
                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition-colors"
                            disabled={!yieldDataForm.poolAddress || !yieldDataForm.apy || !yieldDataForm.tvl || !yieldDataForm.priceFeed}
                        >
                            Update Yield Data
                        </button>
                    </div>
                </div>
            </div>

            {/* System Information */}
            <div className="mt-6 bg-gray-800 rounded-lg p-6">
                <h4 className="text-green-400 font-semibold mb-4">System Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-gray-400 text-sm">Contract Owner</div>
                        <div className="text-white font-mono text-xs break-all">
                            {contractState.owner}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-400 text-sm">Connected Account</div>
                        <div className="text-white font-mono text-xs break-all">
                            {account}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-400 text-sm">Chain ID</div>
                        <div className="text-white font-medium">
                            {chainId}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminPanel; 