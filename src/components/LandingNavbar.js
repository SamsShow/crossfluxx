import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const LandingNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    setIsMenuOpen(false);
  };

  const navItems = [
    { name: 'Features', id: 'features' },
    { name: 'Technology', id: 'technology' },
    { name: 'How It Works', id: 'how-it-works' },
    { name: 'Stats', id: 'stats' }
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-900/90 backdrop-blur-lg border-b border-green-500/20 shadow-lg shadow-green-500/5' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
                <span className="text-black font-bold text-lg">CF</span>
              </div>
              <motion.div
                className="absolute inset-0 bg-green-400 rounded-lg blur-lg opacity-30"
                animate={{
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            <div>
              <motion.h1 
                className="text-xl font-bold text-white"
                animate={{
                  textShadow: [
                    "0 0 10px rgba(34, 197, 94, 0.3)",
                    "0 0 20px rgba(34, 197, 94, 0.5)",
                    "0 0 10px rgba(34, 197, 94, 0.3)"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Crossfluxx
              </motion.h1>
              <div className="text-xs text-green-400 font-medium">AI-Powered DeFi</div>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-gray-300 hover:text-green-400 font-medium transition-all duration-300 relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item.name}
                <motion.div
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-300"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                />
                <motion.div
                  className="absolute inset-0 bg-green-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                />
              </motion.button>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.div
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 30px rgba(34, 197, 94, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <Link
                to="/dashboard"
                className="relative px-6 py-2 bg-green-600 hover:bg-green-700 text-black font-semibold rounded-lg text-sm transition-all duration-300 shadow-lg shadow-green-500/20 overflow-hidden"
              >
                <span className="relative z-10">Launch App</span>
                <motion.div
                  className="absolute inset-0 bg-green-400"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 0.2 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
              <div className="absolute inset-0 bg-green-500 rounded-lg blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.span
              className={`block h-0.5 w-6 bg-green-400 transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-1' : ''
              }`}
            />
            <motion.span
              className={`block h-0.5 w-6 bg-green-400 transition-all duration-300 mt-1 ${
                isMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <motion.span
              className={`block h-0.5 w-6 bg-green-400 transition-all duration-300 mt-1 ${
                isMenuOpen ? '-rotate-45 -translate-y-1' : ''
              }`}
            />
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden bg-gray-800/95 backdrop-blur-lg border-t border-green-500/20 rounded-b-2xl shadow-lg shadow-green-500/10"
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full text-left text-gray-300 hover:text-green-400 font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:bg-green-500/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 10 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.name}
                  </motion.button>
                ))}
                
                <motion.div
                  className="pt-4 border-t border-green-500/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    to="/dashboard"
                    className="block w-full text-center bg-green-600 hover:bg-green-700 text-black font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-green-500/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Launch App
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default LandingNavbar; 