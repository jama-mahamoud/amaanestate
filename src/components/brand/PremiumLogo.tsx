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
      <svg viewBox="0 0 100 100" className="h-[120%] aspect-square" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Multi-stop golden metallic gradient simulating specularity */}
          <linearGradient id="goldReflectivePremium" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9B7836" />
            <stop offset="15%" stopColor="#F7E5BC" />
            <stop offset="30%" stopColor="#DDAA46" />
            <stop offset="45%" stopColor="#FFF3D1" />
            <stop offset="65%" stopColor="#C5A059" />
            <stop offset="85%" stopColor="#FDECC8" />
            <stop offset="100%" stopColor="#8A6624" />
          </linearGradient>

          {/* Left-facing facets (bright light source gradient) */}
          <linearGradient id="goldLeftPremium" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#FFF3D1" />
            <stop offset="50%" stopColor="#E6C587" />
            <stop offset="100%" stopColor="#9B7836" />
          </linearGradient>

          {/* Right-facing facets (shadow/recessed gradient) */}
          <linearGradient id="goldRightPremium" x1="1" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#A6843F" />
            <stop offset="50%" stopColor="#7E6023" />
            <stop offset="100%" stopColor="#413010" />
          </linearGradient>

          {/* Bottom-facing upper facets (mid-tone) */}
          <linearGradient id="goldBottomLightPremium" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDECC8" />
            <stop offset="100%" stopColor="#AA853C" />
          </linearGradient>

          {/* Bottom-facing lower facets (deep shadow) */}
          <linearGradient id="goldBottomDarkPremium" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8A6624" />
            <stop offset="100%" stopColor="#3B2C0D" />
          </linearGradient>

          {/* Dark luxury background circular shield gradient */}
          <radialGradient id="shieldBgPremium" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#222222" />
            <stop offset="65%" stopColor="#0B0B0B" />
            <stop offset="100%" stopColor="#020202" />
          </radialGradient>

          {/* Premium sparkle glow lens flare filter */}
          <filter id="sparkleGlowPremium" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feColorMatrix type="matrix" values="1 0 0 0 1  0 1 0 0 0.82  0 0 1 0 0.65  0 0 0 1 0" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Outer Polished Gold Metallic Frame */}
        <circle 
          cx="50" 
          cy="50" 
          r="46.5" 
          stroke="url(#goldReflectivePremium)" 
          strokeWidth="3" 
          fill="none" 
        />

        {/* 2. Inner Dark Textured Core Plate */}
        <circle 
          cx="50" 
          cy="50" 
          r="45.1" 
          fill="url(#shieldBgPremium)" 
        />

        {/* 3. Inner Decorative Dashed Gauge Ring */}
        <circle 
          cx="50" 
          cy="50" 
          r="43" 
          stroke="url(#goldReflectivePremium)" 
          strokeWidth="0.5" 
          strokeDasharray="2 3" 
          opacity="0.35" 
          fill="none" 
        />

        {/* 4. Luxury 3D Beveled Gold Triangle structure */}
        {/* Left Bar Inside Facet */}
        <motion.path
          d="M30 66 L50 31 L50 22 L23 69 Z"
          fill="url(#goldLeftPremium)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />

        {/* Left Bar Outside Facet */}
        <motion.path
          d="M23 69 L50 22 L50 13 L16 72 Z"
          fill="url(#goldReflectivePremium)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        {/* Right Bar Inside Facet */}
        <motion.path
          d="M70 66 L50 31 L50 22 L77 69 Z"
          fill="url(#goldRightPremium)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />

        {/* Right Bar Outside Facet */}
        <motion.path
          d="M77 69 L50 22 L50 13 L84 72 Z"
          fill="url(#goldRightPremium)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />

        {/* Bottom Bar Upper Facet */}
        <motion.path
          d="M30 66 L70 66 L77 69 L23 69 Z"
          fill="url(#goldBottomLightPremium)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />

        {/* Bottom Bar Lower Facet */}
        <motion.path
          d="M23 69 L77 69 L84 72 L16 72 Z"
          fill="url(#goldBottomDarkPremium)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />

        {/* 5. Centerpiece Luxury Key */}
        <g>
          {/* Clover Bow (Top Three Loops) */}
          <motion.circle
            cx="50"
            cy="41.5"
            r="4"
            stroke="url(#goldReflectivePremium)"
            strokeWidth="1.5"
            fill="none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          />
          <motion.circle
            cx="46"
            cy="45"
            r="3.5"
            stroke="url(#goldReflectivePremium)"
            strokeWidth="1.5"
            fill="none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          />
          <motion.circle
            cx="54"
            cy="45"
            r="3.5"
            stroke="url(#goldReflectivePremium)"
            strokeWidth="1.5"
            fill="none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          />
          <circle cx="50" cy="45" r="1.2" fill="url(#goldReflectivePremium)" />

          {/* Key Shaft */}
          <motion.rect
            x="48.8"
            y="48"
            width="2.4"
            height="18"
            rx="0.4"
            fill="url(#goldReflectivePremium)"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 18, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.9 }}
          />

          {/* Key Shaft Collars / Accent Rings */}
          <rect x="47.5" y="49" width="5" height="1.2" rx="0.2" fill="url(#goldReflectivePremium)" />
          <rect x="48" y="61.5" width="4" height="1.2" rx="0.2" fill="url(#goldReflectivePremium)" />

          {/* Key Toothed Bit */}
          <motion.path
            d="M51.2 53 h4 v1.5 h-2.5 v1.2 h2.5 v1.5 h-2.5 v1.2 h2.5 v1.5 h-4 Z"
            fill="url(#goldReflectivePremium)"
            initial={{ opacity: 0, x: -3 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          />

          {/* Key Pointed Tip */}
          <motion.path
            d="M47.8 66 L50 69.2 L52.2 66 Z"
            fill="url(#goldReflectivePremium)"
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          />
        </g>

        {/* 6. Top Peak Glowing Star Lens Flare */}
        <g transform="translate(50, 13)">
          <ellipse cx="0" cy="0" rx="1.5" ry="11" fill="#FFFFFF" filter="url(#sparkleGlowPremium)" />
          <ellipse cx="0" cy="0" rx="11" ry="1.5" fill="#FFFFFF" filter="url(#sparkleGlowPremium)" />
          <circle cx="0" cy="0" r="3" fill="#FFFFFF" filter="url(#sparkleGlowPremium)" />
        </g>
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
