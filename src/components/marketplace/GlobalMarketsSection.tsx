import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Globe2, TrendingDown, TrendingUp } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import 'flag-icons/css/flag-icons.min.css';
import { GlobalMarketCountrySummary } from '../../types';
import {
  GLOBAL_MARKETS_CHANNEL,
  GLOBAL_MARKETS_UPDATED_EVENT,
  getPublishedMarketCountries,
} from '../../services/globalMarketsService';
import {
  formatMarketCurrency,
  formatMarketDateLabel,
  formatMarketTrend,
} from '../../lib/globalMarkets';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

function serializeCountrySummaries(list: GlobalMarketCountrySummary[]): string {
  return list
    .map(
      (c) =>
        `${c.countrySlug}:${c.reportCount}:${c.cityCount}:${c.avgSalePrice ?? ''}:${c.avgMonthlyRent ?? ''}:${c.propertyPriceTrendPct ?? ''}:${c.rentalPriceTrendPct ?? ''}:${c.latestUpdatedAt ?? ''}`
    )
    .join('|');
}

export default function GlobalMarketsSection() {
  const [countries, setCountries] = useState<GlobalMarketCountrySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastSignatureRef = useRef<string>('');
  const mountedKeysRef = useRef<Set<string>>(new Set());
  const isInitialRenderRef = useRef(true);

  const updateScrollIndicators = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(maxScroll - el.scrollLeft > 4);
  }, []);

  const fetchCountries = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    }
    try {
      const res = await getPublishedMarketCountries();
      const nextList = Array.isArray(res.countries) ? res.countries : [];
      const nextSig = serializeCountrySummaries(nextList);

      if (nextSig !== lastSignatureRef.current) {
        lastSignatureRef.current = nextSig;
        setCountries(nextList);
      }
    } catch {
      if (isInitial) {
        lastSignatureRef.current = '';
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
    if (loading) return;
    isInitialRenderRef.current = false;
    for (const item of countries) {
      mountedKeysRef.current.add(item.countrySlug);
    }
  }, [countries, loading]);

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

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchCountries(false);
      }
    }, 30000);

    let realtimeChannel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;
    if (isSupabaseConfigured && supabase) {
      realtimeChannel = supabase
        .channel('global-markets-intelligence')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'global_markets' },
          () => {
            fetchCountries(false);
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener('focus', handleFocusOrVisibility);
      document.removeEventListener('visibilitychange', handleFocusOrVisibility);
      window.removeEventListener(GLOBAL_MARKETS_UPDATED_EVENT, handleMarketsUpdate);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      window.clearInterval(intervalId);
      if (realtimeChannel && supabase) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [fetchCountries]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollIndicators();
    el.addEventListener('scroll', updateScrollIndicators, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateScrollIndicators);
      resizeObserver.observe(el);
    }
    window.addEventListener('resize', updateScrollIndicators);

    return () => {
      el.removeEventListener('scroll', updateScrollIndicators);
      window.removeEventListener('resize', updateScrollIndicators);
      resizeObserver?.disconnect();
    };
  }, [countries.length, updateScrollIndicators]);

  const scrollTrackBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = Math.max(el.clientWidth * 0.65, 260);
    el.scrollBy({
      left: direction === 'right' ? distance : -distance,
      behavior: 'smooth',
    });
  };

  const showScrollControls = !loading && countries.length > 0 && (canScrollLeft || canScrollRight);

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-labelledby="explore-markets-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E0D8] pb-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
              Global Markets
            </p>
            <h2
              id="explore-markets-heading"
              className="text-2xl sm:text-3xl font-serif font-semibold text-[#141413]"
            >
              Explore International Real Estate Markets
            </h2>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {countries.length > 0 && (
              <Link
                to="/global-markets"
                className="inline-flex items-center min-h-[36px] text-xs font-semibold text-[#1E3A5F] hover:underline whitespace-nowrap"
              >
                All Market Intelligence &rarr;
              </Link>
            )}

            {showScrollControls && (
              <div className="hidden lg:flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => scrollTrackBy('left')}
                  disabled={!canScrollLeft}
                  aria-label="Scroll markets left"
                  className="w-8 h-8 inline-flex items-center justify-center rounded border border-[#E5E0D8] bg-white text-[#141413] hover:border-[#1E3A5F] hover:text-[#1E3A5F] disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTrackBy('right')}
                  disabled={!canScrollRight}
                  aria-label="Scroll markets right"
                  className="w-8 h-8 inline-flex items-center justify-center rounded border border-[#E5E0D8] bg-white text-[#141413] hover:border-[#1E3A5F] hover:text-[#1E3A5F] disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-nowrap gap-3.5 sm:gap-4 lg:overflow-hidden py-0.5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="w-full lg:shrink-0 lg:w-[288px] h-[140px] bg-white border border-[#E5E0D8] rounded-md p-4 space-y-3 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-5 rounded bg-[#EBE6DF] shrink-0" />
                  <div className="h-4 w-32 rounded bg-[#EBE6DF]" />
                </div>
                <div className="h-3 w-40 rounded bg-[#EBE6DF]" />
                <div className="h-3 w-28 rounded bg-[#EBE6DF]" />
              </div>
            ))}
          </div>
        ) : countries.length > 0 ? (
          <div
            ref={scrollRef}
            role="list"
            aria-label="International real estate market intelligence by country"
            className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-nowrap items-stretch gap-3.5 sm:gap-4 lg:overflow-x-auto lg:snap-x lg:snap-mandatory lg:scroll-smooth lg:no-scrollbar py-0.5"
          >
            <AnimatePresence initial={true}>
              {countries.map((item, index) => {
                const isoCode = (item.countryCode || '').trim().toLowerCase();
                const hasValidIsoCode = /^[a-z]{2}$/.test(isoCode);
                const isFirstReveal = !mountedKeysRef.current.has(item.countrySlug);

                const priceTrendText = formatMarketTrend(
                  item.propertyPriceTrendPct,
                  item.propertyPriceTrendDir
                );
                const rentalTrendText = formatMarketTrend(
                  item.rentalPriceTrendPct,
                  item.rentalPriceTrendDir
                );
                const avgSaleText = formatMarketCurrency(item.avgSalePrice, item.currency);
                const avgRentText = formatMarketCurrency(
                  item.avgMonthlyRent,
                  item.currency,
                  '/mo'
                );

                const coverageParts: string[] = [
                  `${item.reportCount} ${item.reportCount === 1 ? 'Report' : 'Reports'}`,
                ];
                if (item.cityCount > 0) {
                  coverageParts.push(
                    `${item.cityCount} ${item.cityCount === 1 ? 'City' : 'Cities'}`
                  );
                }

                const updatedLabel = formatMarketDateLabel(item.latestUpdatedAt);
                const updateDisplay = updatedLabel
                  ? `Updated ${updatedLabel}`
                  : item.latestDataPeriod
                  ? `Period: ${item.latestDataPeriod}`
                  : null;

                return (
                  <motion.div
                    key={item.countrySlug}
                    role="listitem"
                    layout="position"
                    initial={isFirstReveal ? { opacity: 0, x: 32 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{
                      opacity: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                      x: {
                        duration: 0.38,
                        ease: [0.16, 1, 0.3, 1],
                        delay: isInitialRenderRef.current ? Math.min(index * 0.045, 0.22) : 0,
                      },
                      layout: { duration: 0.34, ease: [0.16, 1, 0.3, 1] },
                    }}
                    className="w-full lg:w-[288px] lg:shrink-0 lg:snap-start min-w-0"
                  >
                    <Link
                      to={`/global-markets/${encodeURIComponent(item.countrySlug)}`}
                      className="group flex flex-col justify-between w-full h-full min-w-0 p-4 sm:p-5 bg-white border border-[#E5E0D8] hover:border-[#1E3A5F] hover:bg-[#FCFBF8] rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F5]"
                    >
                      <div className="space-y-3 min-w-0">
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {hasValidIsoCode ? (
                              <span
                                className={`fi fi-${isoCode} w-6 h-[18px] rounded-[2px] ring-1 ring-black/10 shrink-0`}
                                aria-hidden="true"
                              />
                            ) : (
                              <Globe2
                                size={18}
                                className="text-[#8C4A27] shrink-0"
                                aria-hidden="true"
                              />
                            )}
                            <span className="font-serif font-semibold text-base leading-snug text-[#141413] group-hover:text-[#1E3A5F] transition-colors break-words">
                              {item.countryName}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[#5C5A55] tabular-nums">
                          {coverageParts.join(' · ')}
                        </p>

                        {/* Available Real Market Indicators (never invented, omitted when null) */}
                        {(priceTrendText || rentalTrendText || avgSaleText || avgRentText) && (
                          <div className="pt-2 border-t border-[#F0ECE1] grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                            {priceTrendText && (
                              <div className="min-w-0">
                                <span className="block text-[10px] uppercase tracking-wider text-[#7A7770]">
                                  Price Trend
                                </span>
                                <span
                                  className={`font-mono font-semibold tabular-nums inline-flex items-center gap-1 break-words [overflow-wrap:anywhere] ${
                                    item.propertyPriceTrendDir === 'down'
                                      ? 'text-[#991B1B]'
                                      : item.propertyPriceTrendDir === 'up'
                                      ? 'text-[#14532D]'
                                      : 'text-[#141413]'
                                  }`}
                                >
                                  {item.propertyPriceTrendDir === 'up' && (
                                    <TrendingUp size={11} aria-hidden="true" className="shrink-0" />
                                  )}
                                  {item.propertyPriceTrendDir === 'down' && (
                                    <TrendingDown size={11} aria-hidden="true" className="shrink-0" />
                                  )}
                                  <span>{priceTrendText}</span>
                                </span>
                              </div>
                            )}

                            {rentalTrendText && (
                              <div className="min-w-0">
                                <span className="block text-[10px] uppercase tracking-wider text-[#7A7770]">
                                  Rental Trend
                                </span>
                                <span
                                  className={`font-mono font-semibold tabular-nums inline-flex items-center gap-1 break-words [overflow-wrap:anywhere] ${
                                    item.rentalPriceTrendDir === 'down'
                                      ? 'text-[#991B1B]'
                                      : item.rentalPriceTrendDir === 'up'
                                      ? 'text-[#14532D]'
                                      : 'text-[#141413]'
                                  }`}
                                >
                                  {item.rentalPriceTrendDir === 'up' && (
                                    <TrendingUp size={11} aria-hidden="true" className="shrink-0" />
                                  )}
                                  {item.rentalPriceTrendDir === 'down' && (
                                    <TrendingDown size={11} aria-hidden="true" className="shrink-0" />
                                  )}
                                  <span>{rentalTrendText}</span>
                                </span>
                              </div>
                            )}

                            {avgSaleText && (
                              <div className="min-w-0">
                                <span className="block text-[10px] uppercase tracking-wider text-[#7A7770]">
                                  Avg. Sale Price
                                </span>
                                <span className="font-mono font-semibold tabular-nums text-[#141413] break-words [overflow-wrap:anywhere]">
                                  {avgSaleText}
                                </span>
                              </div>
                            )}

                            {avgRentText && (
                              <div className="min-w-0">
                                <span className="block text-[10px] uppercase tracking-wider text-[#7A7770]">
                                  Avg. Rent
                                </span>
                                <span className="font-mono font-semibold tabular-nums text-[#141413] break-words [overflow-wrap:anywhere]">
                                  {avgRentText}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-[#F0ECE1] flex items-center justify-between gap-2 text-[11px] text-[#7A7770] min-h-[28px]">
                        <span className="truncate">{updateDisplay || 'Market Intelligence'}</span>
                        <span className="font-semibold text-[#1E3A5F] group-hover:text-[#8C4A27] shrink-0">
                          View Report &rarr;
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-sm text-[#5C5A55] py-2">
            International real estate market intelligence reports are being prepared for publication.
          </p>
        )}
      </section>
    </MotionConfig>
  );
}
