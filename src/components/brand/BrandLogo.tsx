import React from 'react';
import { motion } from 'framer-motion';
import AmaanLogo from './AmaanLogo';

interface BrandLogoProps {
  className?: string;
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gold' | 'white' | 'green';
  layout?: 'horizontal' | 'stacked' | 'icon';
  useImage?: boolean;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className = '', 
  size = 'md', 
  variant = 'gold',
  layout = 'horizontal',
  useImage = false
}) => {
  // If we want to use the generated images as fallback or for specific high-res needs
  // In a real app, these would be in /public/images/logo...
  // For now we use the AmaanLogo SVG component which we've upgraded to a premium look
  
  if (layout === 'icon') {
    return <AmaanLogo size={size} variant={variant} className={className} />;
  }

  if (layout === 'stacked') {
    const textSizes = {
      xxs: 'text-[10px]',
      xs: 'text-xs',
      sm: 'text-lg',
      md: 'text-xl',
      lg: 'text-3xl',
      xl: 'text-5xl',
    };
    const subTextSizes = {
      xxs: 'text-[6px]',
      xs: 'text-[7px]',
      sm: 'text-[8px]',
      md: 'text-[10px]',
      lg: 'text-xs',
      xl: 'text-sm',
    };

    return (
      <div className={`flex flex-col items-center text-center gap-2 ${className}`}>
        <AmaanLogo size={size} variant={variant} />
        <div className="flex flex-col items-center">
          <h1 className={`font-display tracking-tighter leading-none flex items-center justify-center ${textSizes[size]}`}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] via-[#E6C587] to-[#C5A059] font-black mr-[1px]">Amaan</span>
            <span className="text-white font-medium">Estate</span>
          </h1>
          <span className={`uppercase font-bold tracking-[0.4em] mt-1 text-white/40 ${subTextSizes[size]}`}>
            Luxury Living
          </span>
        </div>
      </div>
    );
  }

  // Default: Horizontal
  return <AmaanLogo size={size} variant={variant} showText={true} className={className} />;
};

export default BrandLogo;
