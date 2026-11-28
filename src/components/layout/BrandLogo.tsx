import React from 'react';

export const OFFICIAL_LOGO_SRC = '/images/amaanestate-logo.png';
export const OFFICIAL_LOGO_ALT =
  'AmaanEstate — Global Real Estate Media, Research & Market Intelligence';

type BrandLogoVariant = 'header' | 'footer' | 'auth' | 'admin' | 'error';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<BrandLogoVariant, string> = {
  header: 'h-11 sm:h-[64px] w-auto max-w-[120px] sm:max-w-[175px] object-contain',
  footer: 'h-16 sm:h-24 w-auto max-w-[180px] sm:max-w-[230px] object-contain',
  auth: 'h-14 sm:h-20 w-auto max-w-[170px] sm:max-w-[180px] object-contain',
  admin: 'h-10 sm:h-12 w-auto max-w-[140px] sm:max-w-[150px] object-contain',
  error: 'h-12 sm:h-14 w-auto max-w-[160px] sm:max-w-[170px] object-contain mx-auto',
};

export default function BrandLogo({ variant = 'header', className = '' }: BrandLogoProps) {
  const isHeader = variant === 'header';

  return (
    <picture className="inline-block shrink-0">
      <source
        type="image/webp"
        srcSet="/images/amaanestate-logo-360.webp 360w, /images/amaanestate-logo-720.webp 720w"
        sizes={isHeader ? '(max-width: 639px) 120px, 175px' : '230px'}
      />
      <img
        src={OFFICIAL_LOGO_SRC}
        alt={OFFICIAL_LOGO_ALT}
        width={1672}
        height={941}
        loading={isHeader ? 'eager' : 'lazy'}
        decoding={isHeader ? 'sync' : 'async'}
        fetchPriority={isHeader ? 'high' : undefined}
        className={`block select-none ${VARIANT_CLASSES[variant]} ${className}`.trim()}
      />
    </picture>
  );
}
