import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface BrandIdentityProps {
  className?: string; // For adjustment, though should be minimal
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

const textSizeClasses = {
  sm: 'text-[10px]',
  md: 'text-sm',
  lg: 'text-base',
};

export const BrandIdentity: React.FC<BrandIdentityProps> = ({ 
  className = '', 
  imageUrl = 'https://www.amaanestate.com/logo.png', // Default official logo
  size = 'md' 
}) => {
  const [error, setError] = useState(false);

  return (
    <Link 
      to="/" 
      className={`inline-flex items-center justify-center rounded-full border border-[#C8A24A]/30 bg-white overflow-hidden shrink-0 hover:border-[#C8A24A]/60 transition-colors ${sizeClasses[size]} ${className}`}
    >
      {error ? (
        <span className={`font-bold text-[#C8A24A] text-center px-1 ${textSizeClasses[size]}`}>
          Amaan
        </span>
      ) : (
        <img
          src={imageUrl}
          alt="AmaanEstate"
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      )}
    </Link>
  );
};
