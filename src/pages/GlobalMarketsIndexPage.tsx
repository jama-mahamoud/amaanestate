import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe2 } from 'lucide-react';
import 'flag-icons/css/flag-icons.min.css';
import { GlobalMarketCountrySummary } from '../types';
import { getPublishedMarketCountries } from '../services/globalMarketsService';
import {
  formatMarketCurrency,
  formatMarketDateLabel,
} from '../lib/globalMarkets';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';
import MarketTrendIndicator from '../components/marketplace/MarketTrendIndicator';

export default function GlobalMarketsIndexPage() {
  const [countries, setCountries] = useState<GlobalMarketCountrySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getPublishedMarketCountries()
      .then((res) => {
        if (active) setCountries(res.countries);
      })
      .catch(() => {
        if (active) setCountries([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useSEO({
    title: 'Global Real Estate Markets & Housing Intelligence | AmaanEstate',
    description:
      'Explore verified residential property price trends, rental market indicators, and investment insights across international real estate markets.',
    url: `${getCanonicalOrigin()}/global-markets`,
    noIndex: !loading && countries.length === 0,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.amaanestate.com/' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Global Markets',
          item: 'https://www.amaanestate.com/global-markets',
        },
      ],
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14 space-y-8 sm:space-y-10">
      <header className="border-b border-[#E5E0D8] pb-6 sm:pb-8 space-y-3">
        <nav aria-label="Breadcrumb" className="text-xs text-[#5C5A55] flex flex-wrap items-center gap-2">
          <Link to="/" className="hover:text-[#141413]">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#141413] font-medium">Global Markets</span>
        </nav>

        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C4A27]">
          Global Market Intelligence
        </p>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold text-[#141413] max-w-3xl leading-[1.15]">
          Explore International Real Estate Markets
        </h1>
        <p className="text-sm sm:text-base text-[#4A4843] max-w-2xl leading-relaxed">
          Independent country and city residential research tracking verified property price movements, rental dynamics, institutional investment context, and official statistical sources.
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E5E0D8] rounded-md p-4 sm:p-6 h-52 animate-pulse"
            />
          ))}
        </div>
      ) : countries.length === 0 ? (
        <div className="bg-white border border-[#E5E0D8] rounded-md p-6 sm:p-10 text-center space-y-3">
          <Globe2 size={30} className="mx-auto text-[#8C4A27]" strokeWidth={1.5} />
          <h2 className="text-xl font-serif font-semibold text-[#141413]">
            Market Intelligence Reports Coming Soon
          </h2>
          <p className="text-sm text-[#5C5A55] max-w-lg mx-auto">
            Our editorial research desk publishes verified country and city real estate reports only once statistical indicators and primary sources are confirmed.
          </p>
          <div className="pt-2">
            <Link
              to="/news"
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 bg-[#1E3A5F] text-white text-xs font-semibold rounded"
            >
              Read Global Real Estate News
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {countries.map((item) => {
            const iso = (item.countryCode || '').trim().toLowerCase();
            const hasFlag = /^[a-z]{2}$/.test(iso);
            const hasRentalTrend =
              item.rentalPriceTrendPct !== null && item.rentalPriceTrendPct !== undefined
                ? true
                : Boolean(item.rentalPriceTrendDir);
            const avgSale = formatMarketCurrency(item.avgSalePrice, item.currency);
            const avgRent = formatMarketCurrency(item.avgMonthlyRent, item.currency, '/mo');
            const updated = formatMarketDateLabel(item.latestUpdatedAt);

            return (
              <Link
                key={item.countrySlug}
                to={`/global-markets/${encodeURIComponent(item.countrySlug)}`}
                className="group bg-white border border-[#E5E0D8] hover:border-[#1E3A5F] rounded-md p-4 sm:p-6 min-w-0 flex flex-col justify-between space-y-4 sm:space-y-5 transition-colors"
              >
                <div className="space-y-3 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {hasFlag ? (
                        <span
                          className={`fi fi-${iso} w-6 h-[18px] rounded-[2px] ring-1 ring-black/10 shrink-0`}
                          aria-hidden="true"
                        />
                      ) : (
                        <Globe2 size={18} className="text-[#8C4A27] shrink-0" />
                      )}
                      <h2 className="text-lg sm:text-xl font-serif font-semibold text-[#141413] group-hover:text-[#1E3A5F] transition-colors leading-snug break-words">
                        {item.countryName}
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs text-[#5C5A55] tabular-nums">
                    {item.reportCount} {item.reportCount === 1 ? 'Market Report' : 'Market Reports'}
                    {item.cityCount > 0
                      ? ` · ${item.cityCount} ${item.cityCount === 1 ? 'City' : 'Cities'}`
                      : ''}
                    {item.latestDataPeriod ? ` · ${item.latestDataPeriod}` : ''}
                  </p>

                  {item.primaryOverview && (
                    <p className="text-sm text-[#4A4843] leading-relaxed line-clamp-3">
                      {item.primaryOverview}
                    </p>
                  )}

                  <div className="pt-3 border-t border-[#F0ECE1] grid grid-cols-2 gap-3 text-xs">
                    <MarketTrendIndicator
                      pct={item.propertyPriceTrendPct}
                      dir={item.propertyPriceTrendDir}
                      label="Price Trend"
                      variant="card"
                    />
                    {(hasRentalTrend || avgRent) && (
                      <MarketTrendIndicator
                        pct={item.rentalPriceTrendPct}
                        dir={item.rentalPriceTrendDir}
                        label="Rental Trend"
                        variant="card"
                      />
                    )}
                    {avgSale && (
                      <div className="min-w-0">
                        <span className="block text-[10px] uppercase tracking-wider text-[#7A7770]">
                          Avg. Sale Price
                        </span>
                        <span className="font-mono font-semibold tabular-nums text-[#141413] break-words [overflow-wrap:anywhere]">
                          {avgSale}
                        </span>
                      </div>
                    )}
                    {avgRent && (
                      <div className="min-w-0">
                        <span className="block text-[10px] uppercase tracking-wider text-[#7A7770]">
                          Avg. Monthly Rent
                        </span>
                        <span className="font-mono font-semibold tabular-nums text-[#141413] break-words [overflow-wrap:anywhere]">
                          {avgRent}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F0ECE1] flex items-center justify-between gap-2 text-xs">
                  <span className="text-[#7A7770] truncate">
                    {updated ? `Verified ${updated}` : 'Verified Research'}
                  </span>
                  <span className="font-semibold text-[#1E3A5F] group-hover:text-[#8C4A27] shrink-0">
                    Explore Market &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
