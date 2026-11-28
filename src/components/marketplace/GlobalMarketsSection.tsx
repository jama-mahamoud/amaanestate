import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GlobalMarketCountrySummary } from '../../types';
import {
  GLOBAL_MARKETS_CHANNEL,
  GLOBAL_MARKETS_UPDATED_EVENT,
  getPublishedMarketCountries,
} from '../../services/globalMarketsService';
import { getHomepageCountryTargetHref } from '../../lib/globalMarkets';
import CountryFlag from '../ui/CountryFlag';
import CountryMapCover from './CountryMapCover';
import MarketTrendIndicator from './MarketTrendIndicator';

interface GlobalMarketsSectionProps {
  maxCountries?: number;
}

export default function GlobalMarketsSection({
  maxCountries = 4,
}: GlobalMarketsSectionProps) {
  const [countries, setCountries] = useState<GlobalMarketCountrySummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCountries = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    }
    try {
      const countriesRes = await getPublishedMarketCountries();
      const nextList = Array.isArray(countriesRes.countries) ? countriesRes.countries : [];
      setCountries(nextList);
    } catch {
      if (isInitial) {
        setCountries([]);
      }
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchCountries(true);
  }, [fetchCountries]);

  useEffect(() => {
    const handleFocusOrVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchCountries(false);
      }
    };

    const handleMarketsUpdate = () => {
      fetchCountries(false);
    };

    window.addEventListener('focus', handleFocusOrVisibility);
    document.addEventListener('visibilitychange', handleFocusOrVisibility);
    window.addEventListener(GLOBAL_MARKETS_UPDATED_EVENT, handleMarketsUpdate);

    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        broadcastChannel = new BroadcastChannel(GLOBAL_MARKETS_CHANNEL);
        broadcastChannel.onmessage = handleMarketsUpdate;
      } catch {
        broadcastChannel = null;
      }
    }

    return () => {
      window.removeEventListener('focus', handleFocusOrVisibility);
      document.removeEventListener('visibilitychange', handleFocusOrVisibility);
      window.removeEventListener(GLOBAL_MARKETS_UPDATED_EVENT, handleMarketsUpdate);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, [fetchCountries]);

  const displayedCountries = countries.slice(0, maxCountries);
  const gridColsClass =
    displayedCountries.length === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <section
      aria-labelledby="explore-markets-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E5E0D8] pb-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
            Market Intelligence
          </p>
          <h2
            id="explore-markets-heading"
            className="text-2xl sm:text-3xl font-serif font-semibold text-[#141413]"
          >
            Explore Global Markets
          </h2>
        </div>

        <Link
          to="/global-markets"
          className="inline-flex items-center min-h-[36px] text-xs font-semibold text-[#1E3A5F] hover:underline whitespace-nowrap shrink-0"
        >
          All Market Intelligence &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E5E0D8] rounded-md overflow-hidden animate-pulse"
            >
              <div className="aspect-[16/9] w-full bg-[#0A182B]" />
              <div className="p-4 space-y-2.5">
                <div className="h-4 w-28 rounded bg-[#EBE6DF]" />
                <div className="h-3 w-24 rounded bg-[#EBE6DF]" />
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="h-12 rounded bg-[#FAF8F5]" />
                  <div className="h-12 rounded bg-[#FAF8F5]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : displayedCountries.length > 0 ? (
        <div className={`grid ${gridColsClass} gap-4 sm:gap-5`}>
          {displayedCountries.map((item) => {
            const targetHref = getHomepageCountryTargetHref(item);
            const citySubtitle =
              item.cities.length > 0
                ? item.cities.slice(0, 2).join(', ')
                : null;

            return (
              <Link
                key={item.countrySlug}
                to={targetHref}
                className="group flex flex-col justify-between w-full h-full min-w-0 bg-white border border-[#E5E0D8] hover:border-[#1E3A5F] hover:bg-[#FCFBF8] rounded-md overflow-hidden transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F5]"
              >
                <CountryMapCover
                  countryCode={item.countryCode}
                  countryName={item.countryName}
                />

                <div className="p-4 flex-1 flex flex-col justify-between gap-3 min-w-0">
                  <div className="space-y-2.5 min-w-0">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <CountryFlag
                          code={item.countryCode}
                          className="w-4 h-3 rounded-[2px] ring-1 ring-black/15 shrink-0"
                          fallbackSize={14}
                          fallbackClassName="text-[#8C4A27] shrink-0"
                        />
                        <h3 className="font-serif font-semibold text-base leading-snug text-[#141413] group-hover:text-[#1E3A5F] transition-colors truncate">
                          {citySubtitle ? `${item.countryName} · ${citySubtitle}` : item.countryName}
                        </h3>
                      </div>

                      <p className="text-[11px] leading-tight text-[#5C5A55] tabular-nums truncate">
                        {item.latestDataPeriod || 'Latest Market Report'}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-[#F0ECE1] grid grid-cols-2 gap-2">
                      <div className="bg-[#FAF8F5]/80 border border-[#F0ECE1] rounded px-2.5 py-2 min-w-0">
                        <MarketTrendIndicator
                          pct={item.propertyPriceTrendPct}
                          dir={item.propertyPriceTrendDir}
                          label="Residential Price Trend"
                          emptyLabel="No data available"
                          variant="card"
                        />
                      </div>
                      <div className="bg-[#FAF8F5]/80 border border-[#F0ECE1] rounded px-2.5 py-2 min-w-0">
                        <MarketTrendIndicator
                          pct={item.rentalPriceTrendPct}
                          dir={item.rentalPriceTrendDir}
                          label="Rental Trend"
                          emptyLabel="No data available"
                          variant="card"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between gap-2 min-h-[24px]">
                    <span className="text-[11px] text-[#7A7770] truncate">
                      {item.reportCount} {item.reportCount === 1 ? 'Report' : 'Reports'}
                    </span>
                    <span className="font-semibold text-[#1E3A5F] group-hover:text-[#8C4A27] shrink-0 whitespace-nowrap text-xs">
                      View Report &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-[#5C5A55] py-2">
          International real estate market intelligence reports are being prepared for publication.
        </p>
      )}
    </section>
  );
}
