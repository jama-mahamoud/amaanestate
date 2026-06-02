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

        {/* 4. Luxury 3D Beveled House Roof and Portal Structure */}
        {/* Left Roof Outer Facet */}
        <motion.path
          d="M50 16 L18 45 L25 45 L50 24 Z"
          fill="url(#goldLeftPremium)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />

        {/* Right Roof Outer Facet */}
        <motion.path
          d="M50 16 L82 45 L75 45 L50 24 Z"
          fill="url(#goldRightPremium)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        {/* Left Roof Inner Facet */}
        <motion.path
          d="M50 28 L28 48 L33 48 L50 34 Z"
          fill="url(#goldLeftPremium)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />

        {/* Right Roof Inner Facet */}
        <motion.path
          d="M50 28 L72 48 L67 48 L50 34 Z"
          fill="url(#goldRightPremium)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />

        {/* Bottom Steps (Foundation of Trust & Safety) */}
        {/* Upper Step */}
        <motion.path
          d="M20 71 L80 71 L83 74 L17 74 Z"
          fill="url(#goldBottomLightPremium)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />

        {/* Lower Step */}
        <motion.path
          d="M14 74 L86 74 L89 77 L11 77 Z"
          fill="url(#goldBottomDarkPremium)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />

        {/* Symmetrical Left and Right Columns */}
        {/* Left Column Bevel A */}
        <motion.path
          d="M26 50 L32 50 L32 70 L26 69 Z"
          fill="url(#goldLeftPremium)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        />
        {/* Left Column Bevel B */}
        <motion.path
          d="M32 50 L38 50 L38 70 L32 70 Z"
          fill="url(#goldReflectivePremium)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        />

        {/* Right Column Bevel A */}
        <motion.path
          d="M62 50 L68 50 L68 70 L62 70 Z"
          fill="url(#goldReflectivePremium)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        />
        {/* Right Column Bevel B */}
        <motion.path
          d="M68 50 L74 50 L74 69 L68 70 Z"
          fill="url(#goldRightPremium)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        />

        {/* 5. Centerpiece 4-Point Star of Excellence (representing Trust and Safety - "Amaan") */}
        <g>
          {/* Top Point */}
          <motion.path
            d="M50 38 L50 56 L44 56 Z"
            fill="url(#goldLeftPremium)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          />
          <motion.path
            d="M50 38 L56 56 L50 56 Z"
            fill="url(#goldReflectivePremium)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          />

          {/* Bottom Point */}
          <motion.path
            d="M44 56 L50 56 L50 74 Z"
            fill="url(#goldBottomLightPremium)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          />
          <motion.path
            d="M50 56 L56 56 L50 74 Z"
            fill="url(#goldBottomDarkPremium)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          />

          {/* Left Point */}
          <motion.path
            d="M32 56 L50 56 L50 50 Z"
            fill="url(#goldLeftPremium)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          />
          <motion.path
            d="M32 56 L50 62 L50 56 Z"
            fill="url(#goldBottomLightPremium)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          />

          {/* Right Point */}
          <motion.path
            d="M50 50 L50 56 L68 56 Z"
            fill="url(#goldReflectivePremium)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          />
          <motion.path
            d="M50 56 L50 62 L68 56 Z"
            fill="url(#goldRightPremium)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          />

          {/* Central Brilliant Core Glow */}
          <circle cx="50" cy="56" r="1.5" fill="#FFFFFF" />
        </g>

        {/* 6. Top Peak Glowing Star Lens Flare */}
        <g transform="translate(50, 13)">
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
