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
          {/* Geometric "A" structure - sophisticated, minimalist */}
          <motion.path
            d="M50 15 L85 85"
            stroke={color.primary}
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <motion.path
            d="M50 15 L15 85"
            stroke={color.primary}
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          />
          {/* The crossbar - stylized as architectural detail */}
          <motion.path
            d="M32 60 L68 60"
            stroke={color.secondary}
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
          />
          
          {/* Architectural roof line accent to reflect Real Estate */}
          <motion.path
            d="M10 90 L50 75 L90 90"
            stroke={color.primary}
            strokeWidth="2"
            strokeOpacity="0.4"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1.5, delay: 0.8 }}
          />

          {/* Premium shimmer effect circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke={color.primary}
            strokeWidth="0.5"
            strokeOpacity="0.2"
            strokeDasharray="4 4"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
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
