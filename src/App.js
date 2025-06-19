import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage.js';
import Dashboard from './components/Dashboard.js';
import AgentStatus from './components/AgentStatus.js';
import RebalanceHistory from './components/RebalanceHistory.js';
import MarketData from './components/MarketData.js';
import VaultConfiguration from './components/VaultConfiguration.js';
import CrossChainManager from './components/CrossChainManager.js';
import AdminPanel from './components/AdminPanel.js';
import Navigation from './components/Navigation.js';
import WalletConnection from './components/WalletConnection.js';
import NotificationSystem from './components/NotificationSystem.js';
import { CrossfluxxProvider } from './context/CrossfluxxContext.js';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  return (
    <CrossfluxxProvider>
      <Router>
        <Routes>
          {/* Landing Page Route */}
          <Route path="/" element={<LandingPage />} />
          
          {/* App Routes with Header/Navigation */}
          <Route path="/dashboard/*" element={
            <div className="min-h-screen bg-gray-900 dark transition-colors duration-300">
              <div className="flex flex-col h-screen">
                {/* Header */}
                <header className="bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-green-500/20">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                      {/* Logo and Title */}
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 flex items-center justify-center">
                            <img 
                              src="/logo.svg" 
                              alt="Crossfluxx Logo" 
                              className="w-10 h-10 object-contain"
                            />
                          </div>
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold text-white">
                            Crossfluxx
                          </h1>
                          <p className="text-sm text-green-400">
                            AI-Powered Cross-Chain Yield Rebalancer
                          </p>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center space-x-4">
                        {/* Dark Mode Toggle */}
                        <button
                          onClick={toggleDarkMode}
                          className="p-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-gray-700 transition-colors"
                          aria-label="Toggle dark mode"
                        >
                          {darkMode ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                          )}
                        </button>

                        {/* Wallet Connection */}
                        <WalletConnection />
                      </div>
                    </div>
                  </div>
                </header>

                {/* Navigation */}
                <Navigation />

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/agents" element={<AgentStatus />} />
                      <Route path="/history" element={<RebalanceHistory />} />
                      <Route path="/market" element={<MarketData />} />
                      <Route path="/vault" element={<VaultConfiguration />} />
                      <Route path="/crosschain" element={<CrossChainManager />} />
                      <Route path="/admin" element={<AdminPanel />} />
                    </Routes>
                  </div>
                </main>

                {/* Footer */}
                <footer className="bg-gray-800/80 backdrop-blur-sm border-t border-green-500/20 py-4">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <img 
                            src="/logo.svg" 
                            alt="Crossfluxx Logo" 
                            className="w-5 h-5 object-contain"
                          />
                          <span>© 2024 Crossfluxx Protocol</span>
                        </div>
                        <span>•</span>
                        <span>Powered by Chainlink CCIP & Eliza OS</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>System Operational</span>
                      </div>
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          } />
        </Routes>
        
        {/* Global Notification System */}
        <NotificationSystem />
      </Router>
    </CrossfluxxProvider>
  );
}

export default App;
