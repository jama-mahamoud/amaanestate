import React from 'react';
import { Link } from 'react-router-dom';
import { AmaanEstateLogo } from './AmaanEstateLogo';

interface BrandHeaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'stacked' | 'icon';
  theme?: 'light' | 'dark' | 'black' | 'white' | 'monochrome';
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  className = '',
  size = 'md',
  variant = 'horizontal',
  theme = 'dark',
}) => {
  // Height mapping to keep perfect proportions for responsive headers
  const heights = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
  };

  const finalHeight = heights[size];

  return (
    <Link
      to="/"
      className={`inline-flex items-center select-none group focus:outline-none transition-transform duration-300 active:scale-[0.98] ${className}`}
    >
      <AmaanEstateLogo
        variant={variant}
        theme={theme}
        height={finalHeight}
        width="auto"
        className="transition-all duration-300 group-hover:brightness-110"
      />
    </Link>
  );
};
