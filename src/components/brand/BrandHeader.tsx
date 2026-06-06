import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface BrandHeaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({ className = '', size = 'md' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'text-base tracking-[0.12em]',
    md: 'text-lg sm:text-xl tracking-[0.15em]',
    lg: 'text-xl sm:text-2xl tracking-[0.2em]',
    xl: 'text-2xl sm:text-3xl tracking-[0.25em]',
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-14 w-14',
  };

  const fallbackTextSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-base',
    xl: 'text-lg',
  };

  return (
    <Link 
      to="/" 
      className={`inline-flex items-center gap-3 select-none group focus:outline-none ${className}`}
    >
      {/* Brand Icon with subtle Gold ring */}
      <div className={`relative flex-shrink-0 flex items-center justify-center rounded-full border border-[#C5A059]/30 group-hover:border-[#C5A059] bg-white text-[#C5A059] overflow-hidden transition-colors duration-300 ${iconSizes[size]}`}>
        {imageError ? (
          <span className={`font-sans font-black tracking-wider ${fallbackTextSizes[size]}`}>
            A
          </span>
        ) : (
          <img
            src="https://www.amaanestate.com/logo.png"
            alt="AmaanEstate Icon"
            className="w-full h-full object-contain p-1"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* Brand Text */}
      <div className={`font-sans font-light uppercase transition-all duration-300 ${sizeClasses[size]}`}>
        <span className="text-white group-hover:text-[#C5A059] transition-colors duration-300">
          Amaan
        </span>
        <span className="text-[#C5A059] group-hover:text-white transition-colors duration-300 font-extrabold ml-1">
          Estate
        </span>
      </div>
    </Link>
  );
};
