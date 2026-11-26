import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe2 } from 'lucide-react';
import 'flag-icons/css/flag-icons.min.css';
import { GlobalMarketComparisonCity, GlobalMarketComparisonReport } from '../../types';
import {
  formatCompactMarketCurrency,
  formatMarketGranularityLabel,
  formatMarketTrend,
  isValidHttpsUrl,
  resolveMarketTrendDirection,
} from '../../lib/globalMarkets';
import { CurvedTrendSparkline } from './MarketTrendIndicator';

interface ComparisonMarketCardProps {
  comparison: GlobalMarketComparisonReport;
}

function CityHalfVisual({
  cityName,
  countryCode,
  imageUrl,
  imageAlt,
  side,
}: {
  cityName: string;
  countryCode: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  side: 'left' | 'right';
}) {
  const [failed, setFailed] = useState(false);
  const cleanUrl = (imageUrl || '').trim();
  const hasImage = Boolean(cleanUrl) && isValidHttpsUrl(cleanUrl) && !failed;
  const iso = (countryCode || '').trim().toLowerCase();

  if (hasImage) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-[5px] bg-[#0F233D] ring-1 ring-[#E5E0D8]">
        <img
          src={cleanUrl}
          alt={imageAlt || `${cityName} residential market`}
          onError={() => setFailed(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#0A182B]/35 via-transparent to-transparent"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-[5px] ring-1 ring-[#E5E0D8] flex flex-col items-center justify-center px-2 text-center ${
        side === 'left'
          ? 'bg-gradient-to-br from-[#0F233D] to-[#1A3557]'
          : 'bg-gradient-to-bl from-[#132946] to-[#1E3A5F]'
      }`}
    >
      <div className="flex items-center gap-1.5 text-white/95">
        {/^[a-z]{2}$/.test(iso) ? (
          <span
            className={`fi fi-${iso} w-4 h-3 rounded-[2px] ring-1 ring-white/25 shrink-0`}
            aria-hidden="true"
          />
        ) : (
          <Globe2 size={13} className="text-[#C9A45C] shrink-0" aria-hidden="true" />
        )}
        <span className="font-serif text-xs font-semibold truncate max-w-[96px]">
          {cityName}
        </span>
      </div>
    </div>
  );
}

function CityCompactMetricCell({ city }: { city: GlobalMarketComparisonCity }) {
  const iso = (city.country_code || '').trim().toLowerCase();
  const hasFlag = /^[a-z]{2}$/.test(iso);

  const medianFormatted = formatCompactMarketCurrency(city.median_sale_price, city.currency);
  const avgFormatted = formatCompactMarketCurrency(city.avg_sale_price, city.currency);
  const priceValue = medianFormatted || avgFormatted;
  const priceLabel = medianFormatted
    ? 'Median Sale Price'
    : avgFormatted
    ? 'Avg. Sale Price'
    : 'Median Sale Price';

  const trendState = resolveMarketTrendDirection(
    city.property_price_trend_pct,
    city.property_price_trend_dir
  );
  const trendFormatted = formatMarketTrend(
    city.property_price_trend_pct,
    city.property_price_trend_dir
  );
  const trendColorClass =
    trendState === 'up'
      ? 'text-[#15803D]'
      : trendState === 'down'
      ? 'text-[#B91C1C]'
      : trendState === 'flat'
      ? 'text-[#475569]'
      : 'text-[#7A7770]';

  return (
    <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-[5px] px-2.5 py-2 min-w-0 flex flex-col justify-between gap-1.5">
      <div className="flex items-center gap-1.5 min-w-0">
        {hasFlag ? (
          <span
            className={`fi fi-${iso} w-4 h-3 rounded-[2px] ring-1 ring-black/15 shrink-0`}
            aria-hidden="true"
          />
        ) : (
          <Globe2 size={13} className="text-[#C9A45C] shrink-0" aria-hidden="true" />
        )}
        <span className="text-xs font-semibold text-[#1E3A5F] truncate">
          {city.city_name}
        </span>
      </div>

      <div className="min-w-0 space-y-0.5">
        {priceValue ? (
          <div className="font-mono font-bold text-base sm:text-lg tabular-nums text-[#141413] leading-tight truncate">
            {priceValue}
          </div>
        ) : (
          <div className="text-[11px] italic text-[#7A7770] leading-tight truncate">
            Data unavailable
          </div>
        )}
        <div className="text-[10px] font-medium text-[#5C5A55] leading-tight truncate">
          {priceLabel}
        </div>
      </div>

      <div className="flex items-center gap-1 min-w-0 pt-0.5 leading-tight">
        {trendFormatted || trendState === 'flat' ? (
          <>
            <span
              className={`inline-flex items-center gap-1 font-mono font-semibold text-[11px] sm:text-xs tabular-nums shrink-0 ${trendColorClass}`}
            >
              <CurvedTrendSparkline
                pct={city.property_price_trend_pct}
                dir={city.property_price_trend_dir}
                size="sm"
              />
              <span>{trendFormatted || 'Stable'}</span>
            </span>
            <span className="text-[9.5px] sm:text-[10px] text-[#5C5A55] truncate">
              Price Trend
            </span>
          </>
        ) : (
          <span className="text-[10.5px] italic text-[#7A7770] truncate">
            Price Trend unavailable
          </span>
        )}
      </div>
    </div>
  );
}

export default function ComparisonMarketCard({ comparison }: ComparisonMarketCardProps) {
  const { city_a, city_b } = comparison;
  const href = `/global-markets/comparisons/${encodeURIComponent(comparison.slug)}`;

  return (
    <Link
      to={href}
      aria-label={`${comparison.title} — Compare Markets`}
      className="group flex flex-col justify-between bg-white border border-[#E5E0D8] hover:border-[#1E3A5F] hover:bg-[#FCFBF8] rounded-md overflow-hidden transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F5] min-w-0"
    >
      {/* Balanced Compact Split Header with Centered Glowing Red VS Badge */}
      <div className="p-2.5 pb-0">
        <div className="relative h-24 sm:h-28 w-full grid grid-cols-2 gap-1.5">
          <CityHalfVisual
            cityName={city_a.city_name}
            countryCode={city_a.country_code}
            imageUrl={city_a.image_url}
            imageAlt={city_a.image_alt}
            side="left"
          />
          <CityHalfVisual
            cityName={city_b.city_name}
            countryCode={city_b.country_code}
            imageUrl={city_b.image_url}
            imageAlt={city_b.image_alt}
            side="right"
          />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white text-[10px] sm:text-[11px] font-extrabold tracking-wider flex items-center justify-center ring-2 ring-white shadow-[0_0_14px_rgba(239,68,68,0.65)] select-none"
          >
            VS
          </span>
        </div>
      </div>

      {/* Compact Two-City Summary Grid + Footer CTA */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between gap-2.5 min-w-0">
        <div className="grid grid-cols-2 gap-2 min-w-0">
          <CityCompactMetricCell city={city_a} />
          <CityCompactMetricCell city={city_b} />
        </div>

        <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between gap-2 min-w-0">
          <p className="text-[10.5px] sm:text-[11px] text-[#5C5A55] tabular-nums truncate min-w-0">
            {comparison.reporting_period} &middot;{' '}
            {formatMarketGranularityLabel(comparison.reporting_granularity)} Comparison
          </p>

          <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded bg-[#1E3A5F] group-hover:bg-[#152B47] text-white border border-[#C9A45C]/60 group-hover:border-[#C9A45C] text-[11px] font-semibold tracking-wide transition-colors shrink-0 whitespace-nowrap">
            <span>Compare Markets</span>
            <ArrowRight size={12} className="text-[#C9A45C]" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
