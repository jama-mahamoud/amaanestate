import { motion } from 'motion/react';

interface AmaanLogoProps {
  className?: string;
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function AmaanLogo({ className = '', size = 'md' }: AmaanLogoProps) {
  // Dimensions map for responsive configurations
  const sizeMap = {
    xxs: {
      wrapper: 'w-3 h-3 md:w-4 md:h-4',
      box: 'w-3 h-3 md:w-4 md:h-4 text-[8px] md:text-[9px] rounded-sm',
      fontSize: 'text-[8px] md:text-[9px]',
      svgSize: 24,
      svgMargin: '-m-1',
    },
    xs: {
      wrapper: 'w-6 h-6',
      box: 'w-6 h-6 text-sm rounded-md',
      fontSize: 'text-sm',
      svgSize: 36,
      svgMargin: '-m-1.5',
    },
    sm: {
      wrapper: 'w-8 h-8',
      box: 'w-8 h-8 text-lg rounded-lg',
      fontSize: 'text-lg',
      svgSize: 48,
      svgMargin: '-m-2',
    },
    md: {
      wrapper: 'w-10 h-10 md:w-11 md:h-11',
      box: 'w-10 h-10 md:w-11 md:h-11 text-xl md:text-2xl rounded-xl',
      fontSize: 'text-xl md:text-2xl',
      svgSize: 64,
      svgMargin: '-m-3',
    },
    lg: {
      wrapper: 'w-14 h-14',
      box: 'w-14 h-14 text-3xl rounded-2xl',
      fontSize: 'text-3xl',
      svgSize: 84,
      svgMargin: '-m-4',
    },
    xl: {
      wrapper: 'w-20 h-20',
      box: 'w-20 h-20 text-5xl rounded-[1.75rem]',
      fontSize: 'text-5xl',
      svgSize: 120,
      svgMargin: '-m-5',
    },
  };

  const currentSize = sizeMap[size];

  // Animation values for the orbiting lines
  const motionTransition = (delay = 0, duration = 12) => ({
    strokeDashoffset: {
      animate: [300, 0],
      transition: {
        duration,
        repeat: Infinity,
        ease: 'linear',
        delay,
      },
    },
    opacity: {
      animate: [0.3, 0.8, 0.3],
      transition: {
        duration: duration / 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  });

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${currentSize.wrapper} ${className}`}>
      
      {/* BACKGROUND ORBIT LAYER - Soft Colorful Blurs */}
      <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
        {/* Soft Green Glow */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [-4, 4, -4],
            y: [-3, 3, -3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-full h-full bg-[#128C7E]/10 rounded-full blur-md"
        />
        {/* Soft Red Glow */}
        <motion.div
          animate={{
            scale: [1.1, 0.9, 1.1],
            x: [3, -3, 3],
            y: [2, -2, 2],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-full h-full bg-[#ff2e2e]/5 rounded-full blur-lg"
        />
      </div>

      {/* RENDER THE DOMINANT GOLDEN "A" LOGO BOX - Now with transparent background so flowing ribbons are visible */}
      <div 
        className={`relative z-10 bg-black/10 backdrop-blur-[2px] border border-luxury-gold/30 text-luxury-gold flex items-center justify-center font-display font-black select-none transition-all duration-500 hover:border-luxury-gold/60 hover:bg-black/20 ${currentSize.box}`}
        id="amaan-logo-core-box"
        style={{
          textShadow: '0 0 8px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.25)'
        }}
      >
        A
      </div>

      {/* FOREGROUND HIGH-END ORBITING RIBBONS */}
      <svg
        viewBox="0 0 100 100"
        className={`absolute pointer-events-none z-20 overflow-visible ${currentSize.svgMargin}`}
        style={{
          width: currentSize.svgSize,
          height: currentSize.svgSize,
        }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Elegant Ribbon Gradients */}
          <linearGradient id="ethiopia-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#009b48" stopOpacity="0" />
            <stop offset="30%" stopColor="#009b48" stopOpacity="1" />
            <stop offset="70%" stopColor="#00b957" stopOpacity="1" />
            <stop offset="100%" stopColor="#009b48" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="ethiopia-yellow" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed100" stopOpacity="0" />
            <stop offset="30%" stopColor="#fed100" stopOpacity="1" />
            <stop offset="70%" stopColor="#ffe240" stopOpacity="1" />
            <stop offset="100%" stopColor="#fed100" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="ethiopia-red" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
            <stop offset="30%" stopColor="#ef4444" stopOpacity="1" />
            <stop offset="70%" stopColor="#ff6b6b" stopOpacity="1" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>

          {/* Premium Neon Glow Filters */}
          <filter id="ultra-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. GREEN ORBITAL TRAIL - Sleek, slightly diagonal */}
        <motion.path
          d="M 50,4 C 80,4 96,25 96,50 C 96,75 75,96 50,96 C 25,96 15,75 15,50 C 15,25 20,4 50,4 Z"
          stroke="url(#ethiopia-green)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="80 160"
          filter="url(#ultra-glow)"
          animate={{
            strokeDashoffset: motionTransition(0, 14).strokeDashoffset.animate,
            opacity: motionTransition(0, 14).opacity.animate,
            rotate: [0, 360],
          }}
          style={{ transformOrigin: '50px 50px' }}
          transition={{
            rotate: { duration: 24, repeat: Infinity, ease: 'linear' },
          }}
        />

        {/* 2. YELLOW ORBITAL TRAIL - Dynamic Loop that flows smoothly over the center logo corner */}
        <motion.path
          d="M 10,50 C 10,20 30,8 50,8 C 70,8 90,20 90,50 C 90,80 70,92 50,92 C 30,92 10,80 10,50 Z"
          stroke="url(#ethiopia-yellow)"
          strokeWidth="1.0"
          strokeLinecap="round"
          strokeDasharray="70 150"
          filter="url(#ultra-glow)"
          animate={{
            strokeDashoffset: motionTransition(1.5, 12).strokeDashoffset.animate,
            opacity: motionTransition(1.5, 12).opacity.animate,
            rotate: [360, 0],
          }}
          style={{ transformOrigin: '50px 50px' }}
          transition={{
            rotate: { duration: 18, repeat: Infinity, ease: 'linear' },
          }}
        />

        {/* 3. RED ORBITAL TRAIL - Sleek diagonal that intersects with high premium look */}
        <motion.path
          d="M 50,12 C 78,12 88,32 88,50 C 88,68 68,88 50,88 C 32,88 12,68 12,50 C 12,32 22,12 50,12 Z"
          stroke="url(#ethiopia-red)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="90 180"
          filter="url(#ultra-glow)"
          animate={{
            strokeDashoffset: motionTransition(3, 16).strokeDashoffset.animate,
            opacity: motionTransition(3, 16).opacity.animate,
            rotate: [180, 540],
          }}
          style={{ transformOrigin: '50px 50px' }}
          transition={{
            rotate: { duration: 28, repeat: Infinity, ease: 'linear' },
          }}
        />

        {/* Dynamic Subtle Shimmer Ring (Golden Accent) */}
        <circle
          cx="50"
          cy="50"
          r="26"
          stroke="rgba(212, 175, 55, 0.15)"
          strokeWidth="0.5"
          strokeDasharray="5 5"
        />
      </svg>
    </div>
  );
}
