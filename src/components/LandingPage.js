import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingNavbar from './LandingNavbar.js';

const LandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse for subtle gradient following effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      title: "AI-Powered Strategy Engine",
      description: "Advanced Eliza OS agents continuously analyze market conditions across multiple DeFi protocols, automatically adjusting yield strategies to maximize returns while minimizing risk exposure.",
      details: ["Real-time market analysis", "Risk assessment algorithms", "Automated strategy optimization", "24/7 market monitoring"],
      icon: "🤖"
    },
    {
      title: "Cross-Chain Infrastructure",
      description: "Seamlessly operate across Ethereum, Arbitrum, and Polygon networks using Chainlink's CCIP technology for secure and reliable cross-chain asset transfers.",
      details: ["Multi-chain support", "Instant asset bridging", "Low transaction fees", "Chainlink CCIP integration"],
      icon: "🌐"
    },
    {
      title: "Real-Time Analytics Dashboard",
      description: "Comprehensive monitoring suite with Proof of Reserves integration ensuring complete transparency and security of your digital assets at all times.",
      details: ["Live portfolio tracking", "Performance analytics", "Risk metrics", "Proof of Reserves verification"],
      icon: "📊"
    },
    {
      title: "Automated Execution Engine",
      description: "Set your parameters once and let our decentralized automation system handle complex rebalancing operations with military-grade security protocols.",
      details: ["Smart contract automation", "Gas optimization", "Slippage protection", "Emergency circuit breakers"],
      icon: "⚡"
    }
  ];

  const stats = [
    { value: "$2.5M+", label: "Total Value Locked", subtext: "Assets under management" },
    { value: "15,000+", label: "Active Users", subtext: "Worldwide community" },
    { value: "99.9%", label: "System Uptime", subtext: "Powered by Chainlink" },
    { value: "12.8%", label: "Average APY", subtext: "Historical performance" }
  ];

  const benefits = [
    {
      title: "Maximize Your Yields",
      description: "Our AI continuously finds the best yield opportunities across multiple chains",
      icon: "📈"
    },
    {
      title: "Minimize Your Risk",
      description: "Advanced risk management algorithms protect your assets from market volatility",
      icon: "🛡️"
    },
    {
      title: "Save Your Time",
      description: "Fully automated system requires no manual intervention or constant monitoring",
      icon: "⏰"
    },
    {
      title: "Reduce Your Costs",
      description: "Optimized gas usage and cross-chain routing minimize transaction fees",
      icon: "💰"
    }
  ];

  const techs = [
    { name: "Chainlink", description: "CCIP & Data Feeds", icon: "🔗" },
    { name: "Ethereum", description: "Primary Network", icon: "💎" },
    { name: "Arbitrum", description: "L2 Scaling", icon: "🔵" },
    { name: "Polygon", description: "Fast Transactions", icon: "🔷" },
    { name: "Eliza OS", description: "AI Agents", icon: "🤖" },
    { name: "React", description: "Frontend", icon: "⚛️" }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Connect & Deposit",
      description: "Connect your wallet and deposit assets into our secure smart contracts. Set your risk preferences and target chains.",
      icon: "🔌"
    },
    {
      step: "02", 
      title: "AI Analysis",
      description: "Our Eliza OS agents analyze market conditions, yield opportunities, and risk factors across all supported networks.",
      icon: "🧠"
    },
    {
      step: "03",
      title: "Strategy Execution",
      description: "Automated rebalancing occurs based on AI recommendations, utilizing Chainlink CCIP for secure cross-chain transfers.",
      icon: "🚀"
    },
    {
      step: "04",
      title: "Continuous Optimization",
      description: "System continuously monitors and adjusts positions to maximize yields while maintaining your specified risk parameters.",
      icon: "🔄"
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const fadeInUpVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const scaleInVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const slideInVariants = {
    hidden: { x: -60, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };



  const floatVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Add smooth scroll behavior to the document
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Enhanced Grid Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gray-900"></div>
        {/* Primary Grid Pattern */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        {/* Secondary Grid Pattern */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 3, delay: 1 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 197, 94, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '200px 200px'
          }}
        />
        {/* Animated Grid Lines */}
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
        {/* Enhanced mouse follow effect */}
        <motion.div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(34, 197, 94, 0.15), transparent 50%)`
          }}
        />
        {/* Pulsing accent spots */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500 rounded-full opacity-5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500 rounded-full opacity-5 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.05, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="relative z-20">
        <LandingNavbar />
        
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="text-center"
            >
              {/* Logo */}
              <motion.div 
                variants={scaleInVariants}
                className="flex justify-center mb-8"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.95 }}
                  variants={pulseVariants}
                  animate="animate"
                  className="relative"
                >
                  <div className="w-20 h-20 flex items-center justify-center">
                    <img 
                      src="/logo.svg" 
                      alt="Crossfluxx Logo" 
                      className="w-20 h-20 object-contain filter drop-shadow-2xl"
                      style={{
                        filter: 'drop-shadow(0px 0px 20px rgba(50, 205, 106, 0.5))'
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 animate-pulse"
                       style={{
                         background: 'radial-gradient(circle, rgba(50, 205, 106, 0.4) 0%, transparent 70%)'
                       }}></div>
                </motion.div>
              </motion.div>

              {/* Main Heading */}
              <motion.h1 
                variants={fadeInUpVariants}
                className="text-6xl md:text-8xl font-black mb-6 tracking-tight text-white relative"
              >
                <motion.span
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(34, 197, 94, 0.5)",
                      "0 0 40px rgba(34, 197, 94, 0.3)",
                      "0 0 20px rgba(34, 197, 94, 0.5)"
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  CROSSFLUXX
                </motion.span>
              </motion.h1>
              
              <motion.div 
                variants={itemVariants}
                className="mb-8"
              >
                <motion.h2 
                  className="text-2xl md:text-4xl font-bold text-gray-200 mb-4"
                  animate={{
                    color: ["#e5e7eb", "#86efac", "#e5e7eb"]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Autonomous Cross-Chain Yield Optimization
                </motion.h2>
                <motion.div 
                  className="w-32 h-1 bg-green-500 mx-auto rounded-full"
                  animate={{
                    scaleX: [1, 1.5, 1],
                    boxShadow: [
                      "0 0 10px rgba(34, 197, 94, 0.5)",
                      "0 0 30px rgba(34, 197, 94, 0.8)",
                      "0 0 10px rgba(34, 197, 94, 0.5)"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              
              <motion.p 
                variants={fadeInUpVariants}
                className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
              >
                AI-powered protocol that automatically maximizes your DeFi yields across Ethereum, Arbitrum, and Polygon using advanced algorithms and Chainlink infrastructure
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
              >
                <motion.div 
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)"
                  }} 
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <Link
                    to="/dashboard"
                    className="relative px-10 py-4 bg-green-600 hover:bg-green-700 text-black font-bold rounded-xl text-lg transition-all duration-300 shadow-lg shadow-green-500/20 overflow-hidden"
                  >
                    <span className="relative z-10">Launch Protocol</span>
                    <motion.div
                      className="absolute inset-0 bg-green-400"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 0.2 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                  <div className="absolute inset-0 bg-green-500 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                </motion.div>
                
                <motion.button 
                  whileHover={{ 
                    scale: 1.05,
                    borderColor: "rgba(34, 197, 94, 1)",
                    boxShadow: "0 0 30px rgba(34, 197, 94, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 border-2 border-green-500 text-green-400 hover:bg-green-500/10 font-bold rounded-xl text-lg transition-all duration-300 relative overflow-hidden"
                >
                  <span className="relative z-10">View Documentation</span>
                  <motion.div
                    className="absolute inset-0 bg-green-500"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 0.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </motion.div>

              {/* Key Benefits */}
              <motion.div 
                variants={containerVariants}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
              >
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index} 
                    variants={scaleInVariants}
                    whileHover={{ 
                      scale: 1.05,
                      y: -5
                    }}
                    className="text-center p-4 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-green-500/20 hover:border-green-400/50 transition-all duration-300"
                  >
                    <motion.div 
                      className="text-3xl mb-2"
                      animate={{ rotateY: [0, 10, 0, -10, 0] }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        delay: index * 0.5 
                      }}
                    >
                      {benefit.icon}
                    </motion.div>
                    <h3 className="text-white font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-gray-400 text-sm">{benefit.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  variants={slideInVariants}
                  whileHover={{ 
                    scale: 1.05,
                    y: -10,
                    boxShadow: "0 20px 40px rgba(34, 197, 94, 0.1)"
                  }}
                  className="text-center bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-green-500/50 rounded-2xl p-6 transition-all duration-300 relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-green-500/5"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div 
                    className="text-4xl font-bold text-white mb-2 relative z-10"
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
                      delay: index * 0.5
                    }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-green-400 font-semibold mb-1 relative z-10">
                    {stat.label}
                  </div>
                  <div className="text-gray-400 text-sm relative z-10">
                    {stat.subtext}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-16"
            >
              <motion.h2 
                variants={fadeInUpVariants}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                How It Works
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                className="text-xl text-gray-300 max-w-3xl mx-auto"
              >
                Our automated system handles everything from market analysis to cross-chain execution
              </motion.p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {howItWorks.map((step, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUpVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="text-center relative"
                >
                  <motion.div 
                    className="relative mb-6"
                    variants={floatVariants}
                    animate="animate"
                    style={{ animationDelay: `${index * 0.5}s` }}
                  >
                    <motion.div 
                      className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-lg shadow-green-500/30"
                      whileHover={{ 
                        rotate: 360,
                        boxShadow: "0 0 30px rgba(34, 197, 94, 0.5)"
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      {step.icon}
                    </motion.div>
                    <motion.div 
                      className="absolute -top-2 -right-2 w-8 h-8 bg-gray-700 border-2 border-green-500 rounded-full flex items-center justify-center"
                      animate={{
                        borderColor: ["rgba(34, 197, 94, 1)", "rgba(34, 197, 94, 0.3)", "rgba(34, 197, 94, 1)"]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3
                      }}
                    >
                      <span className="text-green-400 font-bold text-sm">{step.step}</span>
                    </motion.div>
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                  
                  {/* Connection line to next step */}
                  {index < howItWorks.length - 1 && (
                    <motion.div
                      className="hidden lg:block absolute top-8 left-full w-8 h-0.5 bg-green-500/30"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-16"
            >
              <motion.h2 
                variants={fadeInUpVariants}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Advanced Features
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                className="text-xl text-gray-300 max-w-3xl mx-auto"
              >
                Cutting-edge technology delivering institutional-grade DeFi yield optimization
              </motion.p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid md:grid-cols-2 gap-8"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={slideInVariants}
                  whileHover={{ 
                    scale: 1.02,
                    borderColor: "rgba(34, 197, 94, 0.5)",
                    boxShadow: "0 20px 40px rgba(34, 197, 94, 0.1)"
                  }}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 transition-all duration-300 relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-green-500/5"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="flex items-center mb-6 relative z-10">
                    <motion.div 
                      className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center text-2xl mr-4 shadow-lg shadow-green-500/30"
                      whileHover={{ 
                        rotate: [0, -10, 10, 0],
                        scale: 1.1
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-6 text-lg relative z-10">
                    {feature.description}
                  </p>
                  <ul className="space-y-2 relative z-10">
                    {feature.details.map((detail, idx) => (
                      <motion.li 
                        key={idx} 
                        className="flex items-center text-gray-400"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <motion.div 
                          className="w-2 h-2 bg-green-500 rounded-full mr-3"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: idx * 0.2
                          }}
                        />
                        {detail}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Technology Stack */}
        <section id="technology" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-16"
            >
              <motion.h2 
                variants={fadeInUpVariants}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Built on Industry Leaders
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                className="text-xl text-gray-300 max-w-3xl mx-auto"
              >
                Powered by the most trusted and reliable infrastructure in Web3
              </motion.p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
            >
              {techs.map((tech, index) => (
                <motion.div
                  key={index}
                  variants={scaleInVariants}
                  whileHover={{ 
                    scale: 1.1,
                    y: -10,
                    borderColor: "rgba(34, 197, 94, 0.5)",
                    boxShadow: "0 20px 40px rgba(34, 197, 94, 0.1)"
                  }}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center transition-all duration-300 relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-green-500/5"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div 
                    className="text-4xl mb-4 relative z-10"
                    animate={{ 
                      rotateY: [0, 360] 
                    }}
                    transition={{ 
                      duration: 8, 
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  >
                    {tech.icon}
                  </motion.div>
                  <h4 className="text-white font-semibold mb-2 relative z-10">{tech.name}</h4>
                  <p className="text-gray-400 text-sm relative z-10">{tech.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-green-500/50 rounded-3xl p-12 transition-all duration-300 relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-green-500/5"
                animate={{
                  opacity: [0.05, 0.1, 0.05]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.h2 
                variants={fadeInUpVariants}
                className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10"
              >
                Ready to Optimize Your DeFi Strategy?
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto relative z-10"
              >
                Join thousands of users already maximizing their yields with our AI-powered automation platform
              </motion.p>
              
              <motion.div 
                variants={containerVariants}
                className="flex flex-col sm:flex-row gap-6 justify-center relative z-10"
              >
                <motion.div 
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)"
                  }} 
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <Link
                    to="/dashboard"
                    className="relative px-10 py-4 bg-green-600 hover:bg-green-700 text-black font-bold rounded-xl text-lg transition-all duration-300 shadow-lg shadow-green-500/20 overflow-hidden"
                  >
                    <span className="relative z-10">Start Optimizing Now</span>
                    <motion.div
                      className="absolute inset-0 bg-green-400"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 0.2 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                  <div className="absolute inset-0 bg-green-500 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                </motion.div>
                
                <motion.button 
                  whileHover={{ 
                    scale: 1.05,
                    borderColor: "rgba(34, 197, 94, 1)",
                    boxShadow: "0 0 30px rgba(34, 197, 94, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 border-2 border-green-500 text-green-400 hover:bg-green-500/10 font-bold rounded-xl text-lg transition-all duration-300 relative overflow-hidden"
                >
                  <span className="relative z-10">Schedule Demo</span>
                  <motion.div
                    className="absolute inset-0 bg-green-500"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 0.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-700">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="flex flex-col md:flex-row justify-between items-center"
            >
              <motion.div 
                variants={slideInVariants}
                className="flex items-center space-x-4 mb-4 md:mb-0"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 flex items-center justify-center"
                >
                  <img 
                    src="/logo.svg" 
                    alt="Crossfluxx Logo" 
                    className="w-12 h-12 object-contain filter drop-shadow-lg"
                    style={{
                      filter: 'drop-shadow(0px 0px 10px rgba(50, 205, 106, 0.3))'
                    }}
                  />
                </motion.div>
                <div>
                  <div className="text-white font-bold text-lg">Crossfluxx Protocol</div>
                  <div className="text-gray-400 text-sm">Powered by Chainlink & Eliza OS</div>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="flex items-center space-x-6 text-gray-400"
              >
                <span>© 2024 Crossfluxx</span>
                <div className="flex items-center space-x-2">
                  <motion.div 
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <span className="text-sm">Protocol Active</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage; 