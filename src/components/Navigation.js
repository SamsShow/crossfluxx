import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

function Navigation() {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z" />
        </svg>
      )
    },
    {
      name: 'AI Agents',
      href: '/dashboard/agents',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Market Data',
      href: '/dashboard/market',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      name: 'History',
      href: '/dashboard/history',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gray-800/50 backdrop-blur-sm border-b border-green-500/20 shadow-lg shadow-green-500/5 relative"
    >
      {/* Background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5"
        animate={{
          background: [
            "linear-gradient(90deg, rgba(34, 197, 94, 0.05) 0%, transparent 50%, rgba(34, 197, 94, 0.05) 100%)",
            "linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.05) 50%, transparent 100%)",
            "linear-gradient(90deg, rgba(34, 197, 94, 0.05) 0%, transparent 50%, rgba(34, 197, 94, 0.05) 100%)"
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex space-x-2">
          {navigationItems.map((item, index) => {
            const isActive = location.pathname === item.href;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative"
              >
                <NavLink
                  to={item.href}
                  className={`group relative flex items-center space-x-2 py-4 px-6 font-medium text-sm transition-all duration-300 rounded-t-lg overflow-hidden ${
                    isActive
                      ? 'text-green-400 bg-green-500/10'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
                  }`}
                >
                  {/* Background glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-green-500/10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: isActive ? 1 : 0,
                      scale: isActive ? 1 : 0.8
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Hover background */}
                  <motion.div
                    className="absolute inset-0 bg-green-500/5"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400 shadow-lg shadow-green-400/50"
                      initial={false}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 30 
                      }}
                    />
                  )}

                  {/* Icon with animation */}
                  <motion.span 
                    className={`relative z-10 ${isActive ? 'text-green-400' : 'group-hover:text-green-300'} transition-colors duration-300`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isActive ? {
                      textShadow: [
                        "0 0 0px rgba(34, 197, 94, 0)",
                        "0 0 10px rgba(34, 197, 94, 0.5)",
                        "0 0 0px rgba(34, 197, 94, 0)"
                      ]
                    } : {}}
                    transition={{
                      textShadow: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                  >
                    {item.icon}
                  </motion.span>

                  {/* Text with glow effect */}
                  <motion.span 
                    className="relative z-10"
                    animate={isActive ? {
                      textShadow: [
                        "0 0 0px rgba(34, 197, 94, 0)",
                        "0 0 10px rgba(34, 197, 94, 0.3)",
                        "0 0 0px rgba(34, 197, 94, 0)"
                      ]
                    } : {}}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {item.name}
                  </motion.span>

                  {/* Particle effect for active tab */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-green-400 rounded-full"
                          style={{
                            left: `${20 + i * 25}%`,
                            top: `${30 + i * 10}%`,
                          }}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </NavLink>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}

export default Navigation; 