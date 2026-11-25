import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Globe2 } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import 'flag-icons/css/flag-icons.min.css';
import { GlobalMarketComparisonReport, GlobalMarketCountrySummary } from '../../types';
import {
  GLOBAL_MARKETS_CHANNEL,
  GLOBAL_MARKETS_UPDATED_EVENT,
  getPublishedMarketComparisons,
  getPublishedMarketCountries,
} from '../../services/globalMarketsService';
import { getHomepageCountryTargetHref } from '../../lib/globalMarkets';
import CountryMapCover from './CountryMapCover';
import ComparisonMarketCard from './ComparisonMarketCard';
import MarketTrendIndicator from './MarketTrendIndicator';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

function serializeCountrySummaries(list: GlobalMarketCountrySummary[]): string {
  return list
    .map(
      (c) =>
        `${c.countrySlug}:${c.countryCode}:${c.reportCount}:${c.cityCount}:${c.primaryReportSlug ?? ''}:${c.propertyPriceTrendPct ?? ''}:${c.propertyPriceTrendDir ?? ''}:${c.rentalPriceTrendPct ?? ''}:${c.rentalPriceTrendDir ?? ''}:${c.latestDataPeriod ?? ''}:${c.latestUpdatedAt ?? ''}`
    )
    .join('|');
}

export default function GlobalMarketsSection() {
  const [countries, setCountries] = useState<GlobalMarketCountrySummary[]>([]);
  const [featuredComparisons, setFeaturedComparisons] = useState<GlobalMarketComparisonReport[]>([]);
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
      const [countriesRes, comparisonsRes] = await Promise.all([
        getPublishedMarketCountries(),
        getPublishedMarketComparisons({ featuredOnly: true }).catch(() => ({
          comparisons: [] as GlobalMarketComparisonReport[],
          schemaPending: false,
        })),
      ]);
      const nextList = Array.isArray(countriesRes.countries) ? countriesRes.countries : [];
      const nextSig = serializeCountrySummaries(nextList);

      if (nextSig !== lastSignatureRef.current) {
        lastSignatureRef.current = nextSig;
        setCountries(nextList);
      }

      const nextComparisons = Array.isArray(comparisonsRes.comparisons)
        ? comparisonsRes.comparisons
        : [];
      setFeaturedComparisons(nextComparisons);
    } catch {
      if (isInitial) {
        lastSignatureRef.current = '';
        setCountries([]);
        setFeaturedComparisons([]);
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
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'global_market_comparisons' },
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
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-5"
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
            {(countries.length > 0 || featuredComparisons.length > 0) && (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-nowrap gap-3 sm:gap-3.5 lg:overflow-hidden py-0.5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="w-full lg:shrink-0 lg:w-[240px] bg-white border border-[#E5E0D8] rounded-md overflow-hidden animate-pulse"
              >
                <div className="aspect-[16/9] w-full bg-[#0A182B]" />
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-3 rounded-[2px] bg-[#EBE6DF] shrink-0" />
                    <div className="h-4 w-24 rounded bg-[#EBE6DF]" />
                  </div>
                  <div className="h-3 w-20 rounded bg-[#EBE6DF]" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-11 rounded bg-[#FAF8F5]" />
                    <div className="h-11 rounded bg-[#FAF8F5]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : countries.length > 0 ? (
          <div
            ref={scrollRef}
            role="list"
            aria-label="International real estate market intelligence by country"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-nowrap items-stretch gap-3 sm:gap-3.5 lg:overflow-x-auto lg:snap-x lg:snap-mandatory lg:scroll-smooth lg:no-scrollbar py-0.5"
          >
            <AnimatePresence initial={true}>
              {countries.map((item, index) => {
                const isoCode = (item.countryCode || '').trim().toLowerCase();
                const hasValidIsoCode = /^[a-z]{2}$/.test(isoCode);
                const isFirstReveal = !mountedKeysRef.current.has(item.countrySlug);
                const targetHref = getHomepageCountryTargetHref(item);

                const reportCountLabel = `${item.reportCount} ${
                  item.reportCount === 1 ? 'Report' : 'Reports'
                }`;

                return (
                  <motion.div
                    key={item.countrySlug}
                    role="listitem"
                    layout="position"
                    initial={isFirstReveal ? { opacity: 0, x: 28 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{
                      opacity: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                      x: {
                        duration: 0.36,
                        ease: [0.16, 1, 0.3, 1],
                        delay: isInitialRenderRef.current ? Math.min(index * 0.04, 0.2) : 0,
                      },
                      layout: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                    }}
                    className="w-full lg:w-[240px] lg:shrink-0 lg:snap-start min-w-0"
                  >
                    <Link
                      to={targetHref}
                      className="group flex flex-col justify-between w-full h-full min-w-0 bg-white border border-[#E5E0D8] hover:border-[#1E3A5F] hover:bg-[#FCFBF8] rounded-md overflow-hidden transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F5]"
                    >
                      <CountryMapCover
                        countryCode={item.countryCode}
                        countryName={item.countryName}
                      />

                      <div className="p-3 flex-1 flex flex-col justify-between gap-2 min-w-0">
                        <div className="space-y-2 min-w-0">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {hasValidIsoCode ? (
                                <span
                                  className={`fi fi-${isoCode} w-4 h-3 rounded-[2px] ring-1 ring-black/15 shrink-0`}
                                  aria-hidden="true"
                                />
                              ) : (
                                <Globe2
                                  size={14}
                                  className="text-[#8C4A27] shrink-0"
                                  aria-hidden="true"
                                />
                              )}
                              <h3 className="font-serif font-semibold text-[15px] leading-snug text-[#141413] group-hover:text-[#1E3A5F] transition-colors truncate">
                                {item.countryName}
                              </h3>
                            </div>

                            <p className="text-[11px] leading-tight text-[#5C5A55] tabular-nums truncate">
                              {reportCountLabel}
                              {item.cityCount > 0
                                ? ` · ${item.cityCount} ${item.cityCount === 1 ? 'City' : 'Cities'}`
                                : ''}
                              {item.latestDataPeriod ? ` · ${item.latestDataPeriod}` : ''}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[#F0ECE1] grid grid-cols-2 gap-2">
                            <div className="bg-[#FAF8F5]/80 border border-[#F0ECE1] rounded px-2 py-1.5 min-w-0">
                              <MarketTrendIndicator
                                pct={item.propertyPriceTrendPct}
                                dir={item.propertyPriceTrendDir}
                                label="Residential Price Trend"
                                variant="card"
                              />
                            </div>
                            <div className="bg-[#FAF8F5]/80 border border-[#F0ECE1] rounded px-2 py-1.5 min-w-0">
                              <MarketTrendIndicator
                                pct={item.rentalPriceTrendPct}
                                dir={item.rentalPriceTrendDir}
                                label="Rental Market Trend"
                                variant="card"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-[#F0ECE1] flex items-center justify-between gap-2 min-h-[20px]">
                          <span className="text-[10px] text-[#7A7770] truncate">
                            Market Outlook
                          </span>
                          <span className="font-semibold text-[#1E3A5F] group-hover:text-[#8C4A27] shrink-0 whitespace-nowrap text-[11px]">
                            View Report &rarr;
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : featuredComparisons.length === 0 ? (
          <p className="text-sm text-[#5C5A55] py-2">
            International real estate market intelligence reports are being prepared for publication.
          </p>
        ) : null}

        {!loading && featuredComparisons.length > 0 && (
          <div className="pt-4 sm:pt-5 border-t border-[#E5E0D8] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-[11px] uppercase tracking-widest font-semibold text-[#8C4A27]">
                  Head-to-Head Research
                </p>
                <h3 className="text-lg sm:text-xl font-serif font-semibold text-[#141413]">
                  Featured City Market Comparisons
                </h3>
              </div>
              <Link
                to="/global-markets#city-comparisons"
                className="text-xs font-semibold text-[#1E3A5F] hover:underline whitespace-nowrap"
              >
                Explore All Comparisons &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {featuredComparisons.map((comparison) => (
                <ComparisonMarketCard key={comparison.id} comparison={comparison} />
              ))}
            </div>
          </div>
        )}
      </section>
    </MotionConfig>
  );
}
