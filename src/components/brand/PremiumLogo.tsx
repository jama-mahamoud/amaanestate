import React from 'react';
import { motion } from 'framer-motion';

interface PremiumLogoProps {
  className?: string;
  variant?: 'gold' | 'white' | 'black';
}

const PremiumLogo = ({ className = "h-8", variant = 'gold' }: PremiumLogoProps) => {
  // Use professional Gold color
  const goldColor = '#C5A059';
  const whiteColor = '#FFFFFF';
  
  const getStrokeColor = () => {
    if (variant === 'gold') return `url(#goldGradient-${variant})`;
    if (variant === 'white') return whiteColor;
    return '#0F172A';
  };

  const getTextColor = () => {
    if (variant === 'gold') return 'text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] to-[#E3C588]';
    if (variant === 'white') return 'text-white';
    return 'text-slate-900';
  };

  return (
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* SVG Icon */}
      <svg viewBox="0 0 40 40" className="h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`goldGradient-${variant}`} x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#E3C588" />
          </linearGradient>
        </defs>

        {/* Flowing Ribbon */}
        <motion.path
          d="M 20 20 C 0 0, 0 40, 20 20 C 40 0, 40 40, 20 20"
          stroke={getStrokeColor()}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ originX: "50%", originY: "50%" }}
        />
        <motion.path
          d="M20 5L35 30H5L20 5Z"
          stroke={getStrokeColor()}
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>
      
      {/* Text */}
      <motion.span 
        className={`font-display font-bold tracking-tighter text-xl ${getTextColor()}`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        AmaanEstate
      </motion.span>
    </motion.div>
  );
};

export default PremiumLogo;
