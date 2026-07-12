import React from 'react';

export interface AmaanEstateLogoProps {
  variant?: 'horizontal' | 'stacked' | 'icon';
  theme?: 'light' | 'dark' | 'black' | 'white' | 'monochrome';
  className?: string;
  height?: number | string;
  width?: number | string;
}

export const AmaanEstateLogo: React.FC<AmaanEstateLogoProps> = ({
  variant = 'horizontal',
  theme = 'dark',
  className = '',
  height,
  width,
}) => {
  // Brand colors defined in prompt
  const brandBlue = '#2563EB'; // Primary Blue
  const brandDarkSlate = '#0F172A'; // Secondary Dark Slate
  const brandCyan = '#06B6D4'; // Accent Cyan

  // Determine colors based on theme
  const isDarkTheme = theme === 'dark';
  const isLightTheme = theme === 'light';
  const isBlackTheme = theme === 'black';
  const isWhiteTheme = theme === 'white';
  const isMonochrome = theme === 'monochrome';

  // Text color config
  let amaanColor = '#FFFFFF';
  let estateColor = '#06B6D4'; // Cyan accent default
  let iconPrimary = brandBlue;
  let iconAccent = brandCyan;
  let iconFrameColor = brandBlue;

  if (isLightTheme) {
    amaanColor = brandDarkSlate;
    estateColor = brandBlue; // Blue primary in light theme
    iconPrimary = brandBlue;
    iconAccent = brandCyan;
    iconFrameColor = brandDarkSlate;
  } else if (isDarkTheme) {
    amaanColor = '#FFFFFF';
    estateColor = brandCyan; // Cyan in dark theme
    iconPrimary = brandBlue;
    iconAccent = brandCyan;
    iconFrameColor = brandBlue;
  } else if (isBlackTheme) {
    amaanColor = '#000000';
    estateColor = '#000000';
    iconPrimary = '#000000';
    iconAccent = '#000000';
    iconFrameColor = '#000000';
  } else if (isWhiteTheme) {
    amaanColor = '#FFFFFF';
    estateColor = '#FFFFFF';
    iconPrimary = '#FFFFFF';
    iconAccent = '#FFFFFF';
    iconFrameColor = '#FFFFFF';
  } else if (isMonochrome) {
    // Falls back to current text/fill color or matches context
    amaanColor = 'currentColor';
    estateColor = 'currentColor';
    iconPrimary = 'currentColor';
    iconAccent = 'currentColor';
    iconFrameColor = 'currentColor';
  }

  // Linear gradient IDs to ensure unique SVG defs
  const gradId = `amaan-grad-${variant}-${theme}`;
  const glowId = `amaan-glow-${variant}-${theme}`;

  // Sizing definitions
  const dimensions = {
    icon: { viewBox: '0 0 100 100', defaultWidth: 48, defaultHeight: 48 },
    horizontal: { viewBox: '0 0 320 80', defaultWidth: 192, defaultHeight: 48 },
    stacked: { viewBox: '0 0 200 140', defaultWidth: 120, defaultHeight: 84 },
  };

  const selectedSize = dimensions[variant];
  const finalWidth = width || selectedSize.defaultWidth;
  const finalHeight = height || selectedSize.defaultHeight;

  // The Icon sub-component rendered within the SVGs
  const renderIconContent = (cx: number, cy: number, scale = 1) => {
    // Center at (cx, cy) and scale accordingly
    const translateStr = `translate(${cx - 50 * scale}, ${cy - 50 * scale}) scale(${scale})`;
    return (
      <g transform={translateStr}>
        {/* SVG Defs for Gradients */}
        {!isBlackTheme && !isWhiteTheme && !isMonochrome && (
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={iconPrimary} />
              <stop offset="100%" stopColor={iconAccent} />
            </linearGradient>
            <linearGradient id={glowId} x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={iconAccent} stopOpacity="0.15" />
              <stop offset="100%" stopColor={iconPrimary} stopOpacity="0" />
            </linearGradient>
          </defs>
        )}

        {/* Glow effect on dark backgrounds */}
        {(isDarkTheme) && (
          <circle cx="50" cy="50" r="45" fill={`url(#${glowId})`} />
        )}

        {/* Outer Hexagon Node Ring */}
        <path
          d="M 50,14 L 81,32 L 81,68 L 50,86 L 19,68 L 19,32 Z"
          stroke={isBlackTheme || isWhiteTheme || isMonochrome ? iconFrameColor : `url(#${gradId})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isDarkTheme ? 0.35 : 0.25}
          fill="none"
        />

        {/* Vertex technology nodes */}
        <circle cx="50" cy="14" r="3" fill={isBlackTheme || isWhiteTheme || isMonochrome ? iconAccent : iconAccent} />
        <circle cx="81" cy="32" r="3" fill={isBlackTheme || isWhiteTheme || isMonochrome ? iconPrimary : iconPrimary} />
        <circle cx="81" cy="68" r="3" fill={isBlackTheme || isWhiteTheme || isMonochrome ? iconAccent : iconAccent} />
        <circle cx="50" cy="86" r="3" fill={isBlackTheme || isWhiteTheme || isMonochrome ? iconPrimary : iconPrimary} />
        <circle cx="19" cy="68" r="3" fill={isBlackTheme || isWhiteTheme || isMonochrome ? iconAccent : iconAccent} />
        <circle cx="19" cy="32" r="3" fill={isBlackTheme || isWhiteTheme || isMonochrome ? iconPrimary : iconPrimary} />

        {/* High-tech Geometric Letter 'A' */}
        {/* Left pillar */}
        <path
          d="M 33,68 L 46,30 C 47.2,26.5 52.8,26.5 54,30 L 67,68 L 59.5,68 L 50,40.5 L 40.5,68 Z"
          fill={isBlackTheme || isWhiteTheme || isMonochrome ? iconPrimary : `url(#${gradId})`}
        />

        {/* Central dynamic crossbar node representing AI, network, and data */}
        <circle
          cx="50" cy="53" r="5.5"
          fill={isBlackTheme || isWhiteTheme || isMonochrome ? iconAccent : iconAccent}
          stroke={isLightTheme ? '#FFFFFF' : brandDarkSlate}
          strokeWidth="1.5"
        />

        {/* Network link paths */}
        <path
          d="M 38,53 L 44.5,53 M 55.5,53 L 62,53"
          stroke={isBlackTheme || isWhiteTheme || isMonochrome ? iconPrimary : `url(#${gradId})`}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    );
  };

  if (variant === 'icon') {
    return (
      <svg
        viewBox={selectedSize.viewBox}
        width={finalWidth}
        height={finalHeight}
        className={`select-none ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        {renderIconContent(50, 50, 1)}
      </svg>
    );
  }

  if (variant === 'horizontal') {
    return (
      <svg
        viewBox={selectedSize.viewBox}
        width={finalWidth}
        height={finalHeight}
        className={`select-none ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        {/* Icon on left side (height 64, centered vertically) */}
        {renderIconContent(40, 40, 0.75)}

        {/* Text "Amaan" (bolder, premium sans-serif) */}
        <text
          x="84"
          y="47"
          fill={amaanColor}
          fontFamily="'Inter', 'Space Grotesk', system-ui, sans-serif"
          fontSize="24"
          fontWeight="800"
          letterSpacing="-0.02em"
        >
          Amaan
        </text>

        {/* Text "Estate" (slightly lighter font-weight) */}
        <text
          x="166"
          y="47"
          fill={estateColor}
          fontFamily="'Inter', 'Space Grotesk', system-ui, sans-serif"
          fontSize="24"
          fontWeight="400"
          letterSpacing="-0.01em"
        >
          Estate
        </text>

        {/* Sub-label: Technology Publication */}
        <text
          x="85"
          y="64"
          fill={isLightTheme ? '#64748B' : 'rgba(255,255,255,0.4)'}
          fontFamily="'JetBrains Mono', 'Fira Code', monospace"
          fontSize="8"
          fontWeight="700"
          letterSpacing="0.22em"
          textAnchor="start"
        >
          TECH PUBLICATION
        </text>
      </svg>
    );
  }

  // Stacked variant
  return (
    <svg
      viewBox={selectedSize.viewBox}
      width={finalWidth}
      height={finalHeight}
      className={`select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* Icon on top, centered horizontally */}
      {renderIconContent(100, 40, 0.75)}

      {/* Brand Name Group */}
      <g transform="translate(100, 104)">
        {/* We center-align the stacked text */}
        <text
          fill={amaanColor}
          fontFamily="'Inter', 'Space Grotesk', system-ui, sans-serif"
          fontSize="18"
          fontWeight="800"
          letterSpacing="-0.02em"
          textAnchor="end"
          x="-3"
        >
          Amaan
        </text>
        <text
          fill={estateColor}
          fontFamily="'Inter', 'Space Grotesk', system-ui, sans-serif"
          fontSize="18"
          fontWeight="400"
          letterSpacing="-0.01em"
          textAnchor="start"
          x="3"
        >
          Estate
        </text>
      </g>

      {/* Sublabel */}
      <text
        x="100"
        y="122"
        fill={isLightTheme ? '#64748B' : 'rgba(255,255,255,0.4)'}
        fontFamily="'JetBrains Mono', 'Fira Code', monospace"
        fontSize="7.5"
        fontWeight="700"
        letterSpacing="0.18em"
        textAnchor="middle"
      >
        TECH PUBLICATION
      </text>
    </svg>
  );
};
