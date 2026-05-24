import React from 'react';
import { motion } from 'motion/react';

interface PremiumLogoProps {
  className?: string;
  variant?: 'gold' | 'white';
}

const PremiumLogo = ({ className = "h-8", variant = 'gold' }: PremiumLogoProps) => {
  const color = variant === 'gold' ? '#C5A059' : '#FFFFFF';

  return (
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* SVG Icon */}
      <svg viewBox="0 0 40 40" className="h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Flowing Somalia Flag Ribbon */}
        <motion.path
          d="M 20 20 C 0 0, 0 40, 20 20 C 40 0, 40 40, 20 20"
          stroke="#418FDE"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ originX: "50%", originY: "50%" }}
        />
        <motion.path
          d="M20 5L35 30H5L20 5Z"
          stroke={color}
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <motion.rect
          x="15"
          y="20"
          width="10"
          height="10"
          stroke={color}
          strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        />
      </svg>
      
      {/* Text */}
      <motion.span 
        className="font-display font-medium tracking-tighter text-xl"
        style={{ color: variant === 'gold' ? '#C5A059' : '#FFFFFF' }}
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
