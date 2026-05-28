import { motion } from 'framer-motion';

interface AmaanLogoProps {
  className?: string;
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gold' | 'white' | 'green';
  showText?: boolean;
}

export default function AmaanLogo({ 
  className = '', 
  size = 'md', 
  variant = 'gold',
  showText = false 
}: AmaanLogoProps) {
  // Dimensions map for responsive configurations
  const sizeMap = {
    xxs: {
      wrapper: 'h-6',
      iconSize: 'w-6 h-6',
      fontSize: 'text-sm',
    },
    xs: {
      wrapper: 'h-8',
      iconSize: 'w-8 h-8',
      fontSize: 'text-lg',
    },
    sm: {
      wrapper: 'h-10',
      iconSize: 'w-10 h-10',
      fontSize: 'text-xl',
    },
    md: {
      wrapper: 'h-12',
      iconSize: 'w-12 h-12',
      fontSize: 'text-2xl',
    },
    lg: {
      wrapper: 'h-16',
      iconSize: 'w-16 h-16',
      fontSize: 'text-4xl',
    },
    xl: {
      wrapper: 'h-24',
      iconSize: 'w-24 h-24',
      fontSize: 'text-6xl',
    },
  };

  const currentSize = sizeMap[size];

  const colors = {
    gold: {
      primary: '#D4AF37',
      secondary: '#C5A059',
      glow: 'rgba(212, 175, 55, 0.3)',
      text: 'text-luxury-gold'
    },
    white: {
      primary: '#FFFFFF',
      secondary: '#F3F4F6',
      glow: 'rgba(255, 255, 255, 0.2)',
      text: 'text-white'
    },
    green: {
      primary: '#D4AF37', // Gold monogram on dark green background typically
      secondary: '#C5A059',
      glow: 'rgba(212, 175, 55, 0.2)',
      text: 'text-luxury-gold'
    }
  };

  const color = colors[variant];

  return (
    <div className={`flex items-center gap-3 ${currentSize.wrapper} ${className}`}>
      {/* MONOGRAM ICON */}
      <div className={`relative ${currentSize.iconSize} flex items-center justify-center`}>
        {/* Subtle Background Glow */}
        <motion.div
          animate={{
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full blur-[8px]"
          style={{ backgroundColor: color.glow }}
        />

        {/* MODERN MINIMAL LUXURY SVG MONOGRAM */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full relative z-10" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Multi-stop golden metallic gradient simulating specularity */}
            <linearGradient id="goldReflective" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9B7836" />
              <stop offset="15%" stopColor="#F7E5BC" />
              <stop offset="30%" stopColor="#DDAA46" />
              <stop offset="45%" stopColor="#FFF3D1" />
              <stop offset="65%" stopColor="#C5A059" />
              <stop offset="85%" stopColor="#FDECC8" />
              <stop offset="100%" stopColor="#8A6624" />
            </linearGradient>

            {/* Left-facing facets (bright light source gradient) */}
            <linearGradient id="goldLeft" x1="0" y1="0" x2="0.6" y2="1">
              <stop offset="0%" stopColor="#FFF3D1" />
              <stop offset="50%" stopColor="#E6C587" />
              <stop offset="100%" stopColor="#9B7836" />
            </linearGradient>

            {/* Right-facing facets (shadow/recessed gradient) */}
            <linearGradient id="goldRight" x1="1" y1="0" x2="0.4" y2="1">
              <stop offset="0%" stopColor="#A6843F" />
              <stop offset="50%" stopColor="#7E6023" />
              <stop offset="100%" stopColor="#413010" />
            </linearGradient>

            {/* Bottom-facing upper facets (mid-tone) */}
            <linearGradient id="goldBottomLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDECC8" />
              <stop offset="100%" stopColor="#AA853C" />
            </linearGradient>

            {/* Bottom-facing lower facets (deep shadow) */}
            <linearGradient id="goldBottomDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8A6624" />
              <stop offset="100%" stopColor="#3B2C0D" />
            </linearGradient>

            {/* Dark luxury background circular shield gradient */}
            <radialGradient id="shieldBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#222222" />
              <stop offset="65%" stopColor="#0B0B0B" />
              <stop offset="100%" stopColor="#020202" />
            </radialGradient>

            {/* Premium sparkle glow lens flare filter */}
            <filter id="sparkleGlow" x="-50%" y="-50%" width="200%" height="200%">
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
            stroke="url(#goldReflective)" 
            strokeWidth="3" 
            fill="none" 
          />

          {/* 2. Inner Dark Textured Core Plate */}
          <circle 
            cx="50" 
            cy="50" 
            r="45.1" 
            fill="url(#shieldBg)" 
          />

          {/* 3. Inner Decorative Dashed Gauge Ring */}
          <circle 
            cx="50" 
            cy="50" 
            r="43" 
            stroke="url(#goldReflective)" 
            strokeWidth="0.5" 
            strokeDasharray="2 3" 
            opacity="0.35" 
            fill="none" 
          />

          {/* 4. Luxury 3D Beveled Gold Triangle structure */}
          {/* Left Bar Inside Facet */}
          <motion.path
            d="M30 66 L50 31 L50 22 L23 69 Z"
            fill="url(#goldLeft)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          />

          {/* Left Bar Outside Facet */}
          <motion.path
            d="M23 69 L50 22 L50 13 L16 72 Z"
            fill="url(#goldReflective)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          {/* Right Bar Inside Facet */}
          <motion.path
            d="M70 66 L50 31 L50 22 L77 69 Z"
            fill="url(#goldRight)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />

          {/* Right Bar Outside Facet */}
          <motion.path
            d="M77 69 L50 22 L50 13 L84 72 Z"
            fill="url(#goldRight)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />

          {/* Bottom Bar Upper Facet */}
          <motion.path
            d="M30 66 L70 66 L77 69 L23 69 Z"
            fill="url(#goldBottomLight)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />

          {/* Bottom Bar Lower Facet */}
          <motion.path
            d="M23 69 L77 69 L84 72 L16 72 Z"
            fill="url(#goldBottomDark)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />

          {/* 5. Centerpiece Luxury Key (Faithful to the requested design) */}
          <g>
            {/* Clover Bow (Top Three Loops) */}
            {/* Center Bow circle */}
            <motion.circle
              cx="50"
              cy="41.5"
              r="4"
              stroke="url(#goldReflective)"
              strokeWidth="1.5"
              fill="none"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            />
            {/* Left Bow circle */}
            <motion.circle
              cx="46"
              cy="45"
              r="3.5"
              stroke="url(#goldReflective)"
              strokeWidth="1.5"
              fill="none"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            />
            {/* Right Bow circle */}
            <motion.circle
              cx="54"
              cy="45"
              r="3.5"
              stroke="url(#goldReflective)"
              strokeWidth="1.5"
              fill="none"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            />
            {/* Small Gold Monogram Bow core */}
            <circle cx="50" cy="45" r="1.2" fill="url(#goldReflective)" />

            {/* Key Shaft */}
            <motion.rect
              x="48.8"
              y="48"
              width="2.4"
              height="18"
              rx="0.4"
              fill="url(#goldReflective)"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 18, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.9 }}
            />

            {/* Key Shaft Collars / Accent Rings */}
            <rect x="47.5" y="49" width="5" height="1.2" rx="0.2" fill="url(#goldReflective)" />
            <rect x="48" y="61.5" width="4" height="1.2" rx="0.2" fill="url(#goldReflective)" />

            {/* Key Toothed Bit (Lock teeth styled elegantly on the right) */}
            <motion.path
              d="M51.2 53 h4 v1.5 h-2.5 v1.2 h2.5 v1.5 h-2.5 v1.2 h2.5 v1.5 h-4 Z"
              fill="url(#goldReflective)"
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            />

            {/* Key Pointed Tip */}
            <motion.path
              d="M47.8 66 L50 69.2 L52.2 66 Z"
              fill="url(#goldReflective)"
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            />
          </g>

          {/* 6. Top Peak Glowing Star Lens Flare */}
          <g transform="translate(50, 13)">
            <ellipse cx="0" cy="0" rx="1.5" ry="11" fill="#FFFFFF" filter="url(#sparkleGlow)" />
            <ellipse cx="0" cy="0" rx="11" ry="1.5" fill="#FFFFFF" filter="url(#sparkleGlow)" />
            <circle cx="0" cy="0" r="3" fill="#FFFFFF" filter="url(#sparkleGlow)" />
          </g>
        </svg>
      </div>

      {/* OPTIONAL BRAND TEXT */}
      {showText && (
        <div className="flex flex-col justify-center">
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`${currentSize.fontSize} font-display tracking-tighter leading-none flex items-center`}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] via-[#E6C587] to-[#C5A059] font-black mr-[1px]">Amaan</span>
            <span className="text-white font-medium">Estate</span>
          </motion.h1>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-[8px] md:text-[10px] uppercase font-bold tracking-[0.4em] mt-1 text-white"
          >
            Luxury Living
          </motion.span>
        </div>
      )}
    </div>
  );
}
