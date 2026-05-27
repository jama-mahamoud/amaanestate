import React from 'react';
import { motion } from 'framer-motion';

interface PremiumLogoProps {
  className?: string;
  variant?: 'gold' | 'white' | 'black';
}

const PremiumLogo = ({ className = "h-8", variant = 'gold' }: PremiumLogoProps) => {
  // Use professional Gold and Blue gradients for premium look
  const goldColor = '#C5A059';
  const whiteColor = '#FFFFFF';
  
  return (
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* SVG Icon */}
      <svg viewBox="0 0 40 40" className="h-[120%] aspect-square" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Powerful Golden Gradient for Triangle and accents */}
          <linearGradient id="goldGradient" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#C5A059" />
            <stop offset="50%" stopColor="#E6C587" />
            <stop offset="100%" stopColor="#9C7B3A" />
          </linearGradient>
          {/* Cyber Premium Royal Blue Gradient for the animation loop */}
          <linearGradient id="blueGradient" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
          {/* Subtle glow filter */}
          <filter id="blueGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Flowing Ribbon - Rotating Animation Loop in Vibrant Sapphire Blue */}
        <motion.path
          d="M 20 20 C 0 0, 0 40, 20 20 C 40 0, 40 40, 20 20"
          stroke="url(#blueGradient)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          filter="url(#blueGlow)"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{ originX: "50%", originY: "50%" }}
        />

        {/* Central Triangle Emblem in Rich Polished Gold */}
        <motion.path
          d="M20 7L33 29H7L20 7Z"
          stroke="url(#goldGradient)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="rgba(197, 160, 89, 0.05)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Core light anchor point */}
        <circle cx="20" cy="20" r="1.5" fill="url(#goldGradient)" />
      </svg>
      
      {/* Brand Text - Premium Golden "Amaan" and Pure White "Estate" */}
      <motion.span 
        className="font-display font-medium tracking-tight text-xl flex items-center"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] via-[#E6C587] to-[#C5A059] font-black mr-[1px]">Amaan</span>
        <span className={variant === 'black' ? 'text-slate-900 font-bold' : 'text-white font-medium'}>Estate</span>
      </motion.span>
    </motion.div>
  );
};

export default PremiumLogo;
