import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import 'flag-icons/css/flag-icons.min.css';
import { PropertyCountryStat } from '../../types';
import { getPropertyCountries } from '../../services/propertyService';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { normalizeCountryInfo } from '../../lib/countries';

function getCountryIsoCode(item: PropertyCountryStat): string {
  return (item.countryCode || normalizeCountryInfo(item.country)?.code || '')
    .trim()
    .toLowerCase();
}

function getCountryKey(item: PropertyCountryStat): string {
  const iso = getCountryIsoCode(item);
  return /^[a-z]{2}$/.test(iso) ? iso.toUpperCase() : item.country;
}

function serializeCountries(list: PropertyCountryStat[]): string {
  return list
    .map((c) => `${getCountryKey(c)}:${c.country}:${c.totalCount}:${c.saleCount}:${c.rentCount}`)
    .join('|');
}

export default function GlobalMarketsSection() {
  const [countries, setCountries] = useState<PropertyCountryStat[]>([]);
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
      const res = await getPropertyCountries();
      const nextList = Array.isArray(res.countries) ? res.countries : [];
      const nextSig = serializeCountries(nextList);

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

  // Track which country cards have already appeared so existing cards stay stable across refreshes
  useEffect(() => {
    if (loading) return;
    isInitialRenderRef.current = false;
    for (const item of countries) {
      mountedKeysRef.current.add(getCountryKey(item));
    }
  }, [countries, loading]);

  // Background refresh on window focus, visibility return, gentle interval, and Supabase realtime updates
  useEffect(() => {
    const handleFocusOrVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchCountries(false);
      }
    };

    window.addEventListener('focus', handleFocusOrVisibility);
    document.addEventListener('visibilitychange', handleFocusOrVisibility);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchCountries(false);
      }
    }, 20000);

    let realtimeChannel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;
    if (isSupabaseConfigured && supabase) {
      realtimeChannel = supabase
        .channel('global-markets-countries')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'properties' },
          () => {
            fetchCountries(false);
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener('focus', handleFocusOrVisibility);
      document.removeEventListener('visibilitychange', handleFocusOrVisibility);
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
    const distance = Math.max(el.clientWidth * 0.65, 240);
    el.scrollBy({
      left: direction === 'right' ? distance : -distance,
      behavior: 'smooth',
    });
  };

  const showScrollControls = !loading && countries.length > 0 && (canScrollLeft || canScrollRight);

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-labelledby="explore-locations-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5"
      >
        <div className="flex items-end justify-between gap-4 border-b border-[#E5E0D8] pb-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
              Global Markets
            </p>
            <h2
              id="explore-locations-heading"
              className="text-2xl sm:text-3xl font-serif font-semibold text-[#141413]"
            >
              Explore International Locations
            </h2>
          </div>

          {showScrollControls && (
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => scrollTrackBy('left')}
                disabled={!canScrollLeft}
                aria-label="Scroll countries left"
                className="w-8 h-8 inline-flex items-center justify-center rounded border border-[#E5E0D8] bg-white text-[#141413] hover:border-[#1E3A5F] hover:text-[#1E3A5F] disabled:opacity-35 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollTrackBy('right')}
                disabled={!canScrollRight}
                aria-label="Scroll countries right"
                className="w-8 h-8 inline-flex items-center justify-center rounded border border-[#E5E0D8] bg-white text-[#141413] hover:border-[#1E3A5F] hover:text-[#1E3A5F] disabled:opacity-35 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-nowrap gap-3.5 overflow-hidden py-0.5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="shrink-0 w-[196px] sm:w-[216px] h-[68px] bg-white border border-[#E5E0D8] rounded-md px-4 py-3.5 flex items-center gap-3 animate-pulse"
              >
                <div className="w-6 h-5 rounded bg-[#EBE6DF] shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 w-24 rounded bg-[#EBE6DF]" />
                  <div className="h-3 w-16 rounded bg-[#EBE6DF]" />
                </div>
              </div>
            ))}
          </div>
        ) : countries.length > 0 ? (
          <div
            ref={scrollRef}
            role="list"
            aria-label="International property markets by country"
            className="flex flex-nowrap items-stretch gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-0.5 -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            <AnimatePresence initial={true}>
              {countries.map((item, index) => {
                const isoCode = getCountryIsoCode(item);
                const hasValidIsoCode = /^[a-z]{2}$/.test(isoCode);
                const key = getCountryKey(item);
                const encodedCountry = encodeURIComponent(item.country);
                const href =
                  item.saleCount > 0
                    ? `/buy?country=${encodedCountry}`
                    : `/rent?country=${encodedCountry}`;
                const countLabel = `${item.totalCount} ${
                  item.totalCount === 1 ? 'Property' : 'Properties'
                }`;
                const isFirstReveal = !mountedKeysRef.current.has(key);

                return (
                  <motion.div
                    key={key}
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
                    className="shrink-0 snap-start"
                  >
                    <Link
                      to={href}
                      className="group flex items-center gap-3.5 min-w-[192px] sm:min-w-[216px] max-w-[260px] px-4 py-3.5 bg-white border border-[#E5E0D8] hover:border-[#1E3A5F] hover:bg-[#FCFBF8] rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F5]"
                    >
                      {hasValidIsoCode ? (
                        <span
                          className={`fi fi-${isoCode} w-6 h-[18px] rounded-[2px] ring-1 ring-black/10 shrink-0`}
                          aria-hidden="true"
                        />
                      ) : (
                        <Globe size={18} className="text-[#8C4A27] shrink-0" aria-hidden="true" />
                      )}
                      <span className="min-w-0 flex flex-col">
                        <span className="font-serif font-semibold text-sm sm:text-base leading-tight text-[#141413] group-hover:text-[#1E3A5F] transition-colors truncate">
                          {item.country}
                        </span>
                        <span className="text-xs leading-tight text-[#5C5A55] tabular-nums mt-1">
                          {countLabel}
                        </span>
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-sm text-[#5C5A55] py-2">
            No active country markets are currently published.
          </p>
        )}
      </section>
    </MotionConfig>
  );
}
