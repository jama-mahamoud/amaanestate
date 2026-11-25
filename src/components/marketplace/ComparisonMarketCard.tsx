import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Globe2 } from 'lucide-react';
import 'flag-icons/css/flag-icons.min.css';
import { GlobalMarketComparisonReport } from '../../types';
import { formatMarketGranularityLabel, isValidHttpsUrl } from '../../lib/globalMarkets';

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
      <div className="relative h-full w-full overflow-hidden bg-[#0A182B]">
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
          className="absolute inset-0 bg-gradient-to-t from-[#0A182B]/75 via-[#0A182B]/15 to-transparent"
        />
        <span
          className={`absolute bottom-2 ${
            side === 'left' ? 'left-2.5' : 'right-2.5'
          } text-[11px] font-semibold tracking-wide text-white truncate max-w-[85%]`}
        >
          {cityName}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden flex flex-col items-center justify-center px-2 text-center ${
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
          <Globe2 size={13} className="text-[#D8C7A8] shrink-0" aria-hidden="true" />
        )}
        <span className="font-serif text-xs font-semibold truncate max-w-[100px]">
          {cityName}
        </span>
      </div>
    </div>
  );
}

export default function ComparisonMarketCard({ comparison }: ComparisonMarketCardProps) {
  const { city_a, city_b } = comparison;
  const isoA = (city_a.country_code || '').trim().toLowerCase();
  const isoB = (city_b.country_code || '').trim().toLowerCase();
  const href = `/global-markets/comparisons/${encodeURIComponent(comparison.slug)}`;

  return (
    <Link
      to={href}
      className="group flex flex-col justify-between bg-white border border-[#E5E0D8] hover:border-[#1E3A5F] hover:bg-[#FCFBF8] rounded-md overflow-hidden transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F5] min-w-0"
    >
      {/* Split City A vs City B Visual Header */}
      <div className="relative aspect-[16/9] w-full grid grid-cols-2 gap-[1px] bg-[#E5E0D8]">
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
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#D6CEBE] text-[#8C4A27] flex items-center justify-center shadow-sm"
        >
          <ArrowLeftRight size={13} />
        </span>
      </div>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-2.5 min-w-0">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-[#1E3A5F]">
            {/^[a-z]{2}$/.test(isoA) && (
              <span
                className={`fi fi-${isoA} w-4 h-3 rounded-[2px] ring-1 ring-black/15 shrink-0`}
                aria-hidden="true"
              />
            )}
            <span className="truncate">{city_a.city_name}</span>
            <span className="text-[#8C4A27] text-[11px] font-serif italic">vs</span>
            {/^[a-z]{2}$/.test(isoB) && (
              <span
                className={`fi fi-${isoB} w-4 h-3 rounded-[2px] ring-1 ring-black/15 shrink-0`}
                aria-hidden="true"
              />
            )}
            <span className="truncate">{city_b.city_name}</span>
          </div>

          <h3 className="font-serif font-semibold text-base leading-snug text-[#141413] group-hover:text-[#1E3A5F] transition-colors line-clamp-2">
            {comparison.title}
          </h3>

          <p className="text-[11px] text-[#5C5A55] tabular-nums truncate">
            {comparison.reporting_period} ·{' '}
            {formatMarketGranularityLabel(comparison.reporting_granularity)} Comparison
          </p>
        </div>

        <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between gap-2 text-xs">
          <span className="text-[11px] text-[#7A7770] truncate">
            {city_a.country_name} &middot; {city_b.country_name}
          </span>
          <span className="font-semibold text-[#1E3A5F] group-hover:text-[#8C4A27] shrink-0 whitespace-nowrap">
            Compare Markets &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
