import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { brandConfig } from '@/config/brand';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  const [error, setError] = useState(false);

  return (
    <Link 
      to="/" 
      className={`inline-block select-none bg-transparent hover:opacity-90 transition-opacity outline-none ${className}`}
      style={{ background: 'transparent' }}
    >
      {error ? (
        <span className="font-sans font-bold text-lg text-white tracking-tight">
          {brandConfig.logoFallbackText}
        </span>
      ) : (
        <img
          src={brandConfig.logoUrl}
          alt={brandConfig.logoAltText}
          className="w-[130px] sm:w-[145px] md:w-[160px] h-auto object-contain bg-transparent block"
          onError={() => setError(true)}
          style={{ background: 'transparent' }}
        />
      )}
    </Link>
  );
};
