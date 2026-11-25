import React from 'react';
import { MarketTrendDirection } from '../../types';
import { formatMarketTrend, resolveMarketTrendDirection } from '../../lib/globalMarkets';

export interface MarketTrendIndicatorProps {
  pct?: number | null;
  dir?: MarketTrendDirection | null;
  label?: string;
  subLabel?: string | null;
  emptyLabel?: string;
  variant?: 'card' | 'metric' | 'summary';
  className?: string;
}

// Compact zigzag arrow paths inside a 20x14 canvas:
// short horizontal start -> diagonal move -> small zigzag counter-step -> diagonal continuation -> simple arrowhead
const UP_ZIGZAG_ARROW_STEM = 'M 1.5 11.5 H 4.5 L 9 5.5 L 12 8.5 L 18 2.5';
const UP_ZIGZAG_ARROW_HEAD = 'M 14.2 2.5 H 18 V 6.3';

const DOWN_ZIGZAG_ARROW_STEM = 'M 1.5 2.5 H 4.5 L 9 8.5 L 12 5.5 L 18 11.5';
const DOWN_ZIGZAG_ARROW_HEAD = 'M 14.2 11.5 H 18 V 7.7';

const FLAT_TREND_LINE = 'M 2 7 H 18';

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
  const state = resolveMarketTrendDirection(pct, dir);

  const sizeClass =
    size === 'lg' ? 'w-[22px] h-[15px]' : 'w-[19px] h-[13px]';

  if (state === 'none') {
    return null;
  }

  const strokeColor =
    state === 'up'
      ? '#16A34A'
      : state === 'down'
      ? '#DC2626'
      : '#64748B';

  return (
    <svg
      viewBox="0 0 20 14"
      fill="none"
      aria-hidden="true"
      className={`${sizeClass} shrink-0 overflow-visible ${className}`}
    >
      {state === 'up' ? (
        <>
          <path
            d={UP_ZIGZAG_ARROW_STEM}
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={UP_ZIGZAG_ARROW_HEAD}
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : state === 'down' ? (
        <>
          <path
            d={DOWN_ZIGZAG_ARROW_STEM}
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={DOWN_ZIGZAG_ARROW_HEAD}
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <path
          d={FLAT_TREND_LINE}
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.75"
        />
      )}
    </svg>
  );
}

export default function MarketTrendIndicator({
  pct,
  dir,
  label,
  subLabel,
  emptyLabel,
  variant = 'card',
  className = '',
}: MarketTrendIndicatorProps) {
  const state = resolveMarketTrendDirection(pct, dir);
  const formattedValue = formatMarketTrend(pct, dir);

  const displayText =
    formattedValue ||
    (state === 'flat'
      ? 'Stable'
      : emptyLabel || (variant === 'metric' ? 'No trend data' : 'No data'));

  const valueColorClass =
    state === 'up'
      ? 'text-[#15803D]'
      : state === 'down'
      ? 'text-[#B91C1C]'
      : state === 'flat'
      ? 'text-[#475569]'
      : 'text-[#7A7770]';

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
          className="flex items-center gap-2 pt-0.5"
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
    <div className={`min-w-0 flex flex-col justify-between h-full gap-1 ${className}`}>
      {label && (
        <span className="block text-[9.5px] leading-[1.2] font-medium uppercase tracking-[0.03em] text-[#7A7770]">
          {label}
        </span>
      )}
      <div
        className="flex items-center gap-1.5 min-w-0"
        aria-label={label ? `${label}: ${directionSrLabel}` : directionSrLabel}
      >
        <span
          className={`leading-tight tabular-nums whitespace-nowrap ${
            state === 'none'
              ? 'font-sans font-medium text-xs'
              : 'font-mono font-semibold text-[13px]'
          } ${valueColorClass}`}
        >
          {displayText}
        </span>
        <CurvedTrendSparkline pct={pct} dir={dir} size="md" />
      </div>
      {subLabel && (
        <span className="block text-[10px] text-[#7A7770] truncate">{subLabel}</span>
      )}
    </div>
  );
}
