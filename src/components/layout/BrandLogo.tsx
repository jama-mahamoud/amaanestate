import React from 'react';

export const OFFICIAL_LOGO_SRC = '/images/amaanestate-logo.png';
export const OFFICIAL_LOGO_ALT =
  'AmaanEstate — Global Real Estate Media, Research & Marketplace';

type BrandLogoVariant = 'header' | 'footer' | 'auth' | 'admin' | 'error';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<BrandLogoVariant, string> = {
  header: 'h-14 sm:h-[66px] w-auto max-w-[140px] sm:max-w-[175px] object-contain',
  footer: 'h-20 sm:h-24 w-auto max-w-[200px] sm:max-w-[230px] object-contain',
  auth: 'h-16 sm:h-20 w-auto max-w-[180px] object-contain',
  admin: 'h-12 w-auto max-w-[150px] object-contain',
  error: 'h-14 w-auto max-w-[170px] object-contain mx-auto',
};

export default function BrandLogo({ variant = 'header', className = '' }: BrandLogoProps) {
  return (
    <img
      src={OFFICIAL_LOGO_SRC}
      alt={OFFICIAL_LOGO_ALT}
      width={1672}
      height={941}
      decoding="async"
      className={`block select-none ${VARIANT_CLASSES[variant]} ${className}`.trim()}
    />
  );
}
