import React, { useId } from 'react';
import { MarketTrendDirection } from '../../types';
import { formatMarketTrend, resolveMarketTrendDirection } from '../../lib/globalMarkets';

export interface MarketTrendIndicatorProps {
  pct?: number | null;
  dir?: MarketTrendDirection | null;
  label?: string;
  subLabel?: string | null;
  variant?: 'card' | 'metric' | 'summary';
  className?: string;
}

// Smooth S-shaped snake-like curved financial trend paths inside a 96x32 canvas
const UP_PATH = 'M 6 25 C 22 25, 34 19, 48 16 C 62 13, 76 10, 90 7';
const UP_AREA_PATH = `${UP_PATH} L 90 28 L 6 28 Z`;
const UP_ARROW_PATH = 'M 82 7.5 Q 86 7.2 90 7 Q 87.5 10.5 86 13.5';

const DOWN_PATH = 'M 6 7 C 22 7, 34 13, 48 16 C 62 19, 76 22, 90 25';
const DOWN_AREA_PATH = `${DOWN_PATH} L 90 28 L 6 28 Z`;
const DOWN_ARROW_PATH = 'M 82 24.5 Q 86 24.8 90 25 Q 87.5 21.5 86 18.5';

const FLAT_PATH = 'M 6 16 C 24 14, 42 18, 60 16 C 72 15, 82 16, 90 16';

export function CurvedTrendSparkline({
  pct,
  dir,
  size = 'md',
  className = '',
}: {
  pct?: number | null;
  dir?: MarketTrendDirection | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const state = resolveMarketTrendDirection(pct, dir);

  const sizeClass =
    size === 'lg'
      ? 'w-24 sm:w-28 h-10'
      : size === 'sm'
      ? 'w-12 h-5'
      : 'w-[58px] sm:w-[68px] h-[22px] sm:h-[26px]';

  const strokeGradId = `ae-trend-stroke-${uid}`;
  const areaGradId = `ae-trend-area-${uid}`;

  if (state === 'up') {
    return (
      <svg
        viewBox="0 0 96 32"
        fill="none"
        aria-hidden="true"
        className={`${sizeClass} shrink-0 overflow-visible ${className}`}
        style={{ filter: 'drop-shadow(0 1px 3px rgba(22, 163, 74, 0.2))' }}
      >
        <defs>
          <linearGradient id={strokeGradId} x1="6" y1="25" x2="90" y2="7" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
          <linearGradient id={areaGradId} x1="0" y1="7" x2="0" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#16A34A" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#16A34A" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={UP_AREA_PATH} fill={`url(#${areaGradId})`} />

        {/* Primary S-curved snake line */}
        <path
          d={UP_PATH}
          stroke={`url(#${strokeGradId})`}
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Small refined arrowhead */}
        <path
          d={UP_ARROW_PATH}
          stroke="#16A34A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (state === 'down') {
    return (
      <svg
        viewBox="0 0 96 32"
        fill="none"
        aria-hidden="true"
        className={`${sizeClass} shrink-0 overflow-visible ${className}`}
        style={{ filter: 'drop-shadow(0 1px 3px rgba(220, 38, 38, 0.2))' }}
      >
        <defs>
          <linearGradient id={strokeGradId} x1="6" y1="7" x2="90" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B91C1C" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <linearGradient id={areaGradId} x1="0" y1="7" x2="0" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DC2626" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={DOWN_AREA_PATH} fill={`url(#${areaGradId})`} />

        {/* Primary S-curved snake line */}
        <path
          d={DOWN_PATH}
          stroke={`url(#${strokeGradId})`}
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Small refined arrowhead */}
        <path
          d={DOWN_ARROW_PATH}
          stroke="#DC2626"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Stable / Flat
  return (
    <svg
      viewBox="0 0 96 32"
      fill="none"
      aria-hidden="true"
      className={`${sizeClass} shrink-0 overflow-visible ${className}`}
    >
      <path
        d={FLAT_PATH}
        stroke="#64748B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.8"
      />
    </svg>
  );
}

export default function MarketTrendIndicator({
  pct,
  dir,
  label,
  subLabel,
  variant = 'card',
  className = '',
}: MarketTrendIndicatorProps) {
  const state = resolveMarketTrendDirection(pct, dir);
  const formattedValue = formatMarketTrend(pct, dir);

  const displayText =
    formattedValue || (state === 'flat' ? 'Stable' : variant === 'metric' ? 'No trend data' : 'No data');

  const valueColorClass =
    state === 'up'
      ? 'text-[#15803D]'
      : state === 'down'
      ? 'text-[#B91C1C]'
      : 'text-[#475569]';

  const directionSrLabel =
    state === 'up'
      ? `Upward trend: ${displayText}`
      : state === 'down'
      ? `Downward trend: ${displayText}`
      : state === 'flat'
      ? formattedValue
        ? `Stable trend: ${displayText}`
        : 'Stable market trend, no percentage change'
      : 'No trend data reported';

  if (variant === 'metric') {
    return (
      <div
        className={`bg-white border border-[#E5E0D8] rounded-md p-4 sm:p-5 min-w-0 space-y-1.5 sm:space-y-2 ${className}`}
      >
        {label && <p className="text-xs font-semibold text-[#5C5A55]">{label}</p>}
        <div
          className="flex items-center justify-between gap-3 pt-0.5"
          aria-label={directionSrLabel}
        >
          <span
            className={`text-xl sm:text-2xl font-serif font-semibold font-mono tabular-nums break-words [overflow-wrap:anywhere] ${valueColorClass}`}
          >
            {displayText}
          </span>
          <CurvedTrendSparkline pct={pct} dir={dir} size="lg" />
        </div>
        {subLabel && <p className="text-[11px] text-[#7A7770]">{subLabel}</p>}
      </div>
    );
  }

  if (variant === 'summary') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono tabular-nums text-xs ${valueColorClass} ${className}`}
        aria-label={label ? `${label}: ${directionSrLabel}` : directionSrLabel}
      >
        {label && <span className="text-[#5C5A55] font-sans font-medium">{label}</span>}
        <span className="font-semibold">{displayText}</span>
        <CurvedTrendSparkline pct={pct} dir={dir} size="sm" />
      </span>
    );
  }

  return (
    <div className={`min-w-0 ${className}`}>
      {label && (
        <span className="block text-[10px] uppercase tracking-wider text-[#7A7770]">
          {label}
        </span>
      )}
      <div
        className="mt-0.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1"
        aria-label={label ? `${label}: ${directionSrLabel}` : directionSrLabel}
      >
        <span
          className={`font-mono font-semibold text-sm tabular-nums break-words [overflow-wrap:anywhere] ${valueColorClass}`}
        >
          {displayText}
        </span>
        <CurvedTrendSparkline pct={pct} dir={dir} size="md" />
      </div>
      {subLabel && (
        <span className="block text-[10px] text-[#7A7770] mt-0.5 truncate">{subLabel}</span>
      )}
    </div>
  );
}
