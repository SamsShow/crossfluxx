import React from 'react';
import { useCrossfluxx } from '../context/CrossfluxxContext.js';

function WalletConnection() {
  const { 
    isWalletConnected, 
    account, 
    balance, 
    chainId, 
    loading, 
    connectWallet, 
    disconnectWallet 
  } = useCrossfluxx();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    const bal = parseFloat(balance);
    if (bal < 0.001) return '< 0.001';
    return bal.toFixed(3);
  };

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1: return 'Ethereum';
      case 42161: return 'Arbitrum';
      case 137: return 'Polygon';
      case 11155111: return 'Sepolia';
      default: return 'Unknown';
    }
  };

  if (isWalletConnected && account) {
    return (
      <div className="flex items-center space-x-3">
        {/* Network indicator */}
        <div className="bg-gray-700/50 backdrop-blur-sm border border-green-500/30 text-green-400 px-3 py-1 rounded-lg text-sm font-medium">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{getNetworkName(chainId)}</span>
          </div>
        </div>

        {/* Account info */}
        <div className="bg-gray-700/50 backdrop-blur-sm border border-green-500/30 text-green-400 px-3 py-1 rounded-lg text-sm font-medium">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{formatAddress(account)}</span>
            <span className="text-gray-400">|</span>
            <span>{formatBalance(balance)} ETH</span>
          </div>
        </div>

        {/* Disconnect button */}
        <button
          onClick={disconnectWallet}
          className="text-gray-400 hover:text-red-400 text-sm transition-colors p-2 hover:bg-gray-700/30 rounded-lg"
          title="Disconnect Wallet"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={loading}
      className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:from-gray-600 disabled:to-gray-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-green-500/25"
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  );
}

export default WalletConnection; 