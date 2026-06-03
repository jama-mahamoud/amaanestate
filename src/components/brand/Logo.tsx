import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { brandConfig } from '@/config/brand';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  noLink?: boolean;
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
  xl: 'h-24',
};

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', noLink = false }) => {
  const [error, setError] = useState(false);

  const content = error ? (
    <span className={`flex items-center font-bold text-lg text-white ${className}`}>
      {brandConfig.logoFallbackText}
    </span>
  ) : (
    <img
      src={brandConfig.logoUrl}
      alt={brandConfig.logoAltText}
      className={`${sizeClasses[size]} w-auto object-contain bg-transparent`}
      onError={() => setError(true)}
      style={{ background: 'transparent' }}
    />
  );

  return noLink ? (
    <div className={className}>{content}</div>
  ) : (
    <Link to="/" className={`inline-block ${className}`}>
      {content}
    </Link>
  );
};
