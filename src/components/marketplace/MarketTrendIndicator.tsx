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

// Smooth cubic Bézier paths inside a 112x40 canvas with generous padding for glow & rounded caps
const UP_PATH = 'M 6 33 C 28 32, 42 26, 58 21 S 92 14, 102 7';
const UP_AREA_PATH = `${UP_PATH} L 102 36 L 6 36 Z`;
const UP_ARROW_PATH = 'M 91.6 7.9 Q 97.3 8.1 102 7 Q 99.3 11.1 97.6 16.4';

const DOWN_PATH = 'M 6 7 C 28 8, 42 14, 58 19 S 92 26, 102 33';
const DOWN_AREA_PATH = `${DOWN_PATH} L 102 36 L 6 36 Z`;
const DOWN_ARROW_PATH = 'M 91.6 32.1 Q 97.3 31.9 102 33 Q 99.3 28.9 97.6 23.6';

const FLAT_PATH = 'M 6 20 C 28 16.5, 44 23.5, 62 20 S 88 17, 102 20';

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
      : 'w-[62px] sm:w-[74px] h-[24px] sm:h-[28px]';

  const strokeGradId = `ae-trend-stroke-${uid}`;
  const areaGradId = `ae-trend-area-${uid}`;

  if (state === 'up') {
    return (
      <svg
        viewBox="0 0 112 40"
        fill="none"
        aria-hidden="true"
        className={`${sizeClass} shrink-0 overflow-visible ${className}`}
        style={{ filter: 'drop-shadow(0 2px 5px rgba(22, 163, 74, 0.24))' }}
      >
        <defs>
          <linearGradient id={strokeGradId} x1="6" y1="33" x2="102" y2="7" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#15803D" />
            <stop offset="55%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
          <linearGradient id={areaGradId} x1="0" y1="7" x2="0" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#16A34A" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#16A34A" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={UP_AREA_PATH} fill={`url(#${areaGradId})`} className="market-trend-area" />

        {/* Subtle baseline track */}
        <path
          d={UP_PATH}
          stroke="#16A34A"
          strokeOpacity="0.2"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Primary left-to-right animated curved path */}
        <path
          d={UP_PATH}
          pathLength={100}
          stroke={`url(#${strokeGradId})`}
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="market-trend-curve"
        />

        {/* Continuous subtle flowing momentum wave */}
        <path
          d={UP_PATH}
          pathLength={100}
          stroke="#86EFAC"
          strokeOpacity="0.72"
          strokeWidth="3"
          strokeLinecap="round"
          className="market-trend-flow"
        />

        {/* Curved arrowhead pointing upward */}
        <path
          d={UP_ARROW_PATH}
          stroke="#16A34A"
          strokeWidth="2.65"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="market-trend-arrow"
        />
      </svg>
    );
  }

  if (state === 'down') {
    return (
      <svg
        viewBox="0 0 112 40"
        fill="none"
        aria-hidden="true"
        className={`${sizeClass} shrink-0 overflow-visible ${className}`}
        style={{ filter: 'drop-shadow(0 2px 5px rgba(220, 38, 38, 0.24))' }}
      >
        <defs>
          <linearGradient id={strokeGradId} x1="6" y1="7" x2="102" y2="33" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B91C1C" />
            <stop offset="55%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <linearGradient id={areaGradId} x1="0" y1="7" x2="0" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DC2626" stopOpacity="0.13" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={DOWN_AREA_PATH} fill={`url(#${areaGradId})`} className="market-trend-area" />

        {/* Subtle baseline track */}
        <path
          d={DOWN_PATH}
          stroke="#DC2626"
          strokeOpacity="0.2"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Primary left-to-right animated descending curve */}
        <path
          d={DOWN_PATH}
          pathLength={100}
          stroke={`url(#${strokeGradId})`}
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="market-trend-curve"
        />

        {/* Continuous subtle downward flowing momentum wave */}
        <path
          d={DOWN_PATH}
          pathLength={100}
          stroke="#FCA5A5"
          strokeOpacity="0.72"
          strokeWidth="3"
          strokeLinecap="round"
          className="market-trend-flow"
        />

        {/* Curved arrowhead pointing downward */}
        <path
          d={DOWN_ARROW_PATH}
          stroke="#DC2626"
          strokeWidth="2.65"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="market-trend-arrow"
        />
      </svg>
    );
  }

  // Stable or No Data: calm neutral slate curved horizontal line, never animated as rising/falling
  return (
    <svg
      viewBox="0 0 112 40"
      fill="none"
      aria-hidden="true"
      className={`${sizeClass} shrink-0 overflow-visible ${className}`}
    >
      <defs>
        <linearGradient id={strokeGradId} x1="6" y1="20" x2="102" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#64748B" stopOpacity="0.65" />
          <stop offset="50%" stopColor="#475569" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#64748B" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <path
        d={FLAT_PATH}
        stroke={`url(#${strokeGradId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="102" cy="20" r="2.5" fill="#64748B" />
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
          className={`font-mono font-semibold tabular-nums break-words [overflow-wrap:anywhere] ${valueColorClass}`}
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
