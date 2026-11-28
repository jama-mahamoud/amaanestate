import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  ExternalLink,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { GlobalMarketComparisonCity, GlobalMarketComparisonReport } from '../types';
import { getGlobalMarketComparisonBySlug } from '../services/globalMarketsService';
import {
  formatDaysOnMarket,
  formatMarketCurrency,
  formatMarketDateLabel,
  formatMarketGranularityLabel,
  formatMarketInteger,
  resolveComparisonCanonicalUrl,
  resolveComparisonSocialImageMetadata,
} from '../lib/globalMarkets';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';
import { formatSeoTitle, truncateAtWordBoundary } from '../lib/seoUtils';
import CountryFlag from '../components/ui/CountryFlag';
import MarketTrendIndicator from '../components/marketplace/MarketTrendIndicator';
import NotFoundPage from './NotFoundPage';

function renderParagraphs(text?: string | null) {
  const cleaned = (text || '').replace(/\r\n?/g, '\n').trim();
  if (!cleaned) return null;
  return cleaned
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((paragraph, idx) => (
      <p
        key={idx}
        className="text-sm sm:text-base text-[#363532] leading-[1.75] whitespace-pre-line break-words [overflow-wrap:anywhere]"
      >
        {paragraph}
      </p>
    ));
}

function CityComparisonImage({
  city,
  fallbackTitle,
}: {
  city: GlobalMarketComparisonCity;
  fallbackTitle: string;
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [city.image_url]);

  const hasValidUrl = Boolean(city.image_url && /^https:\/\//i.test(city.image_url));

  if (hasValidUrl && !imgError) {
    return (
      <div className="aspect-[16/9] w-full overflow-hidden bg-[#EBE6DF] border-b border-[#E5E0D8]">
        <img
          src={city.image_url!}
          alt={city.image_alt || `${city.city_name}, ${city.country_name} — ${fallbackTitle}`}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="aspect-[16/9] w-full bg-gradient-to-br from-[#0F243C] via-[#173251] to-[#234366] border-b border-[#E5E0D8] flex flex-col items-center justify-center px-6 text-center">
      <Building2 size={28} className="text-[#C9A45C] mb-2" strokeWidth={1.5} />
      <p className="font-serif text-lg font-semibold text-white">{city.city_name}</p>
      <p className="text-xs text-white/75">{city.country_name}</p>
    </div>
  );
}

function CityPanel({
  city,
  slotLabel,
  comparisonTitle,
}: {
  city: GlobalMarketComparisonCity;
  slotLabel: 'City A' | 'City B';
  comparisonTitle: string;
}) {
  const iso = (city.country_code || '').trim().toLowerCase();
  const hasFlag = /^[a-z]{2}$/.test(iso);
  const medianSaleFormatted = formatMarketCurrency(city.median_sale_price, city.currency);
  const avgSaleFormatted = formatMarketCurrency(city.avg_sale_price, city.currency);
  const rentFormatted = formatMarketCurrency(city.avg_monthly_rent, city.currency, '/mo');
  const homesSoldFormatted = formatMarketInteger(city.homes_sold, 'home', 'homes');
  const daysOnMarketFormatted = formatDaysOnMarket(city.days_on_market);

  const primarySaleLabel = medianSaleFormatted
    ? 'Median Sale Price'
    : avgSaleFormatted
    ? 'Avg. Sale Price'
    : 'Median Sale Price';
  const primarySaleValue = medianSaleFormatted || avgSaleFormatted;

  return (
    <article className="bg-white border border-[#E5E0D8] rounded-md overflow-hidden flex flex-col h-full min-w-0">
      <CityComparisonImage city={city} fallbackTitle={comparisonTitle} />

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-5 min-w-0">
        <div className="space-y-4 min-w-0">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs text-[#5C5A55]">
              <span className="uppercase tracking-widest font-semibold text-[#8C4A27]">
                {slotLabel}
              </span>
              {city.data_period && (
                <span className="font-mono text-[#5C5A55] tabular-nums">{city.data_period}</span>
              )}
            </div>

            <div className="flex items-center gap-2.5 min-w-0">
              <CountryFlag
                code={city.country_code}
                className="w-6 h-[18px] rounded-[2px] ring-1 ring-black/15 shrink-0"
                fallbackSize={18}
                fallbackClassName="text-[#8C4A27] shrink-0"
              />
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413] leading-snug break-words">
                  {city.city_name}
                </h2>
                <p className="text-xs text-[#5C5A55]">
                  {city.country_name}
                  <span aria-hidden="true"> · </span>
                  <span className="font-mono font-semibold text-[#141413]">{city.currency}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#F0ECE1]">
            <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded p-3 min-w-0">
              <span className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
                {primarySaleLabel}
              </span>
              {primarySaleValue ? (
                <span className="mt-1 block font-mono text-base sm:text-lg font-semibold tabular-nums text-[#141413] break-words [overflow-wrap:anywhere]">
                  {primarySaleValue}
                </span>
              ) : (
                <span className="mt-1 block text-xs text-[#7A7770] italic">Data unavailable</span>
              )}
              {medianSaleFormatted && avgSaleFormatted && (
                <span className="mt-1 block text-[11px] font-mono tabular-nums text-[#5C5A55]">
                  Avg: {avgSaleFormatted}
                </span>
              )}
            </div>

            <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded p-3 min-w-0">
              <span className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
                Avg. Monthly Rent
              </span>
              {rentFormatted ? (
                <span className="mt-1 block font-mono text-base sm:text-lg font-semibold tabular-nums text-[#141413] break-words [overflow-wrap:anywhere]">
                  {rentFormatted}
                </span>
              ) : (
                <span className="mt-1 block text-xs text-[#7A7770] italic">Data unavailable</span>
              )}
            </div>

            <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded p-3 min-w-0">
              <MarketTrendIndicator
                pct={city.property_price_trend_pct}
                dir={city.property_price_trend_dir}
                label="Price Trend"
                emptyLabel="Data unavailable"
                variant="card"
              />
            </div>

            <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded p-3 min-w-0">
              <MarketTrendIndicator
                pct={city.rental_price_trend_pct}
                dir={city.rental_price_trend_dir}
                label="Rental Trend"
                emptyLabel="Data unavailable"
                variant="card"
              />
            </div>

            <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded p-3 min-w-0">
              <span className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
                Homes Sold
              </span>
              {homesSoldFormatted ? (
                <span className="mt-1 block font-mono text-base font-semibold tabular-nums text-[#141413] break-words [overflow-wrap:anywhere]">
                  {homesSoldFormatted}
                </span>
              ) : (
                <span className="mt-1 block text-xs text-[#7A7770] italic">Data unavailable</span>
              )}
            </div>

            <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded p-3 min-w-0">
              <span className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
                Days on Market
              </span>
              {daysOnMarketFormatted ? (
                <span className="mt-1 block font-mono text-base font-semibold tabular-nums text-[#141413] break-words [overflow-wrap:anywhere]">
                  {daysOnMarketFormatted}
                </span>
              ) : (
                <span className="mt-1 block text-xs text-[#7A7770] italic">Data unavailable</span>
              )}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#F0ECE1] text-xs text-[#5C5A55] space-y-1">
          <div className="font-semibold text-[#141413]">
            Source: {city.data_source_name || 'Data unavailable'}
          </div>
          {city.data_source_url && (
            <a
              href={city.data_source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#1E3A5F] hover:underline font-medium break-all"
            >
              <span>Inspect official source</span>
              <ExternalLink size={12} className="shrink-0" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function GlobalMarketComparisonPage() {
  const { comparisonSlug } = useParams<{ comparisonSlug: string }>();
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState<GlobalMarketComparisonReport | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!comparisonSlug) {
        setComparison(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await getGlobalMarketComparisonBySlug(comparisonSlug);
        if (active) setComparison(res);
      } catch {
        if (active) setComparison(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [comparisonSlug]);

  const notFound = !loading && !comparison;
  const origin = getCanonicalOrigin();
  const canonicalUrl = comparison ? resolveComparisonCanonicalUrl(comparison, origin) : undefined;
  const socialMeta = resolveComparisonSocialImageMetadata({ comparison });

  const seoTitle = comparison
    ? formatSeoTitle(comparison.seo_title || comparison.title)
    : loading
    ? 'Loading City Market Comparison | AmaanEstate'
    : 'City Market Comparison Not Found (404) | AmaanEstate';

  const seoDescription = comparison
    ? truncateAtWordBoundary(
        comparison.seo_description ||
          comparison.short_intro ||
          `Side-by-side residential property market comparison between ${comparison.city_a.city_name} and ${comparison.city_b.city_name} (${comparison.reporting_period}).`,
        158
      )
    : 'Independent two-city residential real estate market comparisons and investment research on AmaanEstate.';

  useSEO({
    title: seoTitle,
    description: seoDescription,
    image: socialMeta.image,
    imageAlt: socialMeta.imageAlt,
    url: canonicalUrl,
    type: comparison ? 'article' : 'website',
    publishedTime: comparison?.published_at || undefined,
    modifiedTime: comparison?.updated_at || comparison?.last_verified_at || undefined,
    noIndex: notFound,
    omitCanonical: notFound,
    structuredData: comparison
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: seoTitle,
            description: seoDescription,
            url: canonicalUrl,
            dateModified:
              comparison.last_verified_at ||
              comparison.updated_at ||
              comparison.published_at ||
              comparison.created_at,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Global Markets',
                item: `${origin}/global-markets`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: comparison.title,
                item: canonicalUrl,
              },
            ],
          },
        ]
      : undefined,
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-8 w-56 bg-[#EBE6DF] rounded animate-pulse" />
        <div className="h-12 w-3/4 bg-[#EBE6DF] rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-white border border-[#E5E0D8] rounded animate-pulse" />
          <div className="h-96 bg-white border border-[#E5E0D8] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (notFound || !comparison) {
    return <NotFoundPage />;
  }

  const { city_a: cityA, city_b: cityB } = comparison;
  const granularityLabel = formatMarketGranularityLabel(comparison.reporting_granularity);
  const verifiedDateLabel = formatMarketDateLabel(comparison.last_verified_at);
  const currenciesDiffer =
    cityA.currency.trim().toUpperCase() !== cityB.currency.trim().toUpperCase();

  const cityAMedianSale = formatMarketCurrency(cityA.median_sale_price, cityA.currency);
  const cityBMedianSale = formatMarketCurrency(cityB.median_sale_price, cityB.currency);
  const cityASale = formatMarketCurrency(cityA.avg_sale_price, cityA.currency);
  const cityBSale = formatMarketCurrency(cityB.avg_sale_price, cityB.currency);
  const hasAnyAvgSalePrice = Boolean(cityASale || cityBSale);
  const cityARent = formatMarketCurrency(cityA.avg_monthly_rent, cityA.currency, '/mo');
  const cityBRent = formatMarketCurrency(cityB.avg_monthly_rent, cityB.currency, '/mo');
  const cityAHomesSold = formatMarketInteger(cityA.homes_sold, 'home', 'homes');
  const cityBHomesSold = formatMarketInteger(cityB.homes_sold, 'home', 'homes');
  const cityADom = formatDaysOnMarket(cityA.days_on_market);
  const cityBDom = formatDaysOnMarket(cityB.days_on_market);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 space-y-10 sm:space-y-12">
      {/* Editorial Header */}
      <header className="border-b border-[#E5E0D8] pb-6 sm:pb-8 space-y-4">
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-[#5C5A55] flex flex-wrap items-center gap-2"
        >
          <Link to="/" className="hover:text-[#141413]">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/global-markets" className="hover:text-[#141413]">
            Global Markets
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#141413] font-medium">City Comparisons</span>
        </nav>

        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.18em] font-semibold text-[#8C4A27]">
            <span className="inline-flex items-center gap-1.5">
              <Scale size={13} aria-hidden="true" />
              <span>Two-City Property Market Comparison</span>
            </span>
            <span aria-hidden="true" className="text-[#D6CEBE]">·</span>
            <span className="text-[#1E3A5F]">
              {cityA.city_name} vs {cityB.city_name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-serif font-semibold text-[#141413] leading-[1.15] max-w-4xl text-balance">
            {comparison.title}
          </h1>

          {comparison.short_intro && (
            <p className="text-base sm:text-lg text-[#4A4843] leading-relaxed max-w-3xl">
              {comparison.short_intro}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-[#5C5A55]">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} className="text-[#1E3A5F]" aria-hidden="true" />
            <span>
              {granularityLabel} Reporting ·{' '}
              <strong className="font-semibold text-[#141413]">
                {comparison.reporting_period || 'Data unavailable'}
              </strong>
            </span>
          </span>
          {verifiedDateLabel && (
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#14532D]" aria-hidden="true" />
              <span>Verified {verifiedDateLabel}</span>
            </span>
          )}
        </div>
      </header>

      {/* Equal-Width City Panels (Stacked on Mobile, Side-by-Side on Desktop) */}
      <section aria-label="City Market Snapshots" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <CityPanel city={cityA} slotLabel="City A" comparisonTitle={comparison.title} />
          <CityPanel city={cityB} slotLabel="City B" comparisonTitle={comparison.title} />
        </div>
      </section>

      {/* Head-to-Head Comparison Table */}
      <section aria-labelledby="comparison-matrix-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
              Quantitative Benchmark
            </p>
            <h2
              id="comparison-matrix-heading"
              className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]"
            >
              Side-by-Side Market Metrics
            </h2>
          </div>
          {currenciesDiffer && (
            <p className="text-xs text-[#5C5A55]">
              Figures remain in local currency (
              <span className="font-mono font-semibold text-[#141413]">{cityA.currency}</span> vs{' '}
              <span className="font-mono font-semibold text-[#141413]">{cityB.currency}</span>) —
              no unverified FX conversion applied.
            </p>
          )}
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-xs uppercase tracking-wider text-[#5C5A55]">
                  <th className="py-3.5 px-4 sm:px-5 font-semibold w-1/3">Indicator</th>
                  <th className="py-3.5 px-4 sm:px-5 font-semibold w-1/3">
                    {cityA.city_name}, {cityA.country_name}
                  </th>
                  <th className="py-3.5 px-4 sm:px-5 font-semibold w-1/3">
                    {cityB.city_name}, {cityB.country_name}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8]">
                <tr>
                  <td className="py-3.5 px-4 sm:px-5 font-medium text-[#4A4843]">
                    Reporting Currency
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 font-mono font-semibold text-[#141413]">
                    {cityA.currency}
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 font-mono font-semibold text-[#141413]">
                    {cityB.currency}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-5 font-medium text-[#4A4843]">
                    Median Sale Price
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 font-mono tabular-nums font-semibold text-[#141413]">
                    {cityAMedianSale || (
                      <span className="font-sans font-normal italic text-[#7A7770]">
                        Data unavailable
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 font-mono tabular-nums font-semibold text-[#141413]">
                    {cityBMedianSale || (
                      <span className="font-sans font-normal italic text-[#7A7770]">
                        Data unavailable
                      </span>
                    )}
                  </td>
                </tr>
                {hasAnyAvgSalePrice && (
                  <tr>
                    <td className="py-3.5 px-4 sm:px-5 font-medium text-[#4A4843]">
                      Average Property Sale Price
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 font-mono tabular-nums font-semibold text-[#141413]">
                      {cityASale || (
                        <span className="font-sans font-normal italic text-[#7A7770]">
                          Data unavailable
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 font-mono tabular-nums font-semibold text-[#141413]">
                      {cityBSale || (
                        <span className="font-sans font-normal italic text-[#7A7770]">
                          Data unavailable
                        </span>
                      )}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-3.5 px-4 sm:px-5 font-medium text-[#4A4843]">
                    Average Monthly Rent
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 font-mono tabular-nums font-semibold text-[#141413]">
                    {cityARent || (
                      <span className="font-sans font-normal italic text-[#7A7770]">
                        Data unavailable
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 font-mono tabular-nums font-semibold text-[#141413]">
                    {cityBRent || (
                      <span className="font-sans font-normal italic text-[#7A7770]">
                        Data unavailable
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-5 font-medium text-[#4A4843]">
                    Property Price Trend
                  </td>
                  <td className="py-3.5 px-4 sm:px-5">
                    <MarketTrendIndicator
                      pct={cityA.property_price_trend_pct}
                      dir={cityA.property_price_trend_dir}
                      label=""
                      emptyLabel="Data unavailable"
                      variant="summary"
                    />
                  </td>
                  <td className="py-3.5 px-4 sm:px-5">
                    <MarketTrendIndicator
                      pct={cityB.property_price_trend_pct}
                      dir={cityB.property_price_trend_dir}
                      label=""
                      emptyLabel="Data unavailable"
                      variant="summary"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-5 font-medium text-[#4A4843]">
                    Rental Price Trend
                  </td>
                  <td className="py-3.5 px-4 sm:px-5">
                    <MarketTrendIndicator
                      pct={cityA.rental_price_trend_pct}
                      dir={cityA.rental_price_trend_dir}
                      label=""
                      emptyLabel="Data unavailable"
                      variant="summary"
                    />
                  </td>
                  <td className="py-3.5 px-4 sm:px-5">
                    <MarketTrendIndicator
                      pct={cityB.rental_price_trend_pct}
                      dir={cityB.rental_price_trend_dir}
                      label=""
                      emptyLabel="Data unavailable"
                      variant="summary"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-5 font-medium text-[#4A4843]">
                    Homes Sold
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 font-mono tabular-nums font-semibold text-[#141413]">
                    {cityAHomesSold || (
                      <span className="font-sans font-normal italic text-[#7A7770]">
                        Data unavailable
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 font-mono tabular-nums font-semibold text-[#141413]">
                    {cityBHomesSold || (
                      <span className="font-sans font-normal italic text-[#7A7770]">
                        Data unavailable
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-5 font-medium text-[#4A4843]">
                    Days on Market
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 font-mono tabular-nums font-semibold text-[#141413]">
                    {cityADom || (
                      <span className="font-sans font-normal italic text-[#7A7770]">
                        Data unavailable
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 font-mono tabular-nums font-semibold text-[#141413]">
                    {cityBDom || (
                      <span className="font-sans font-normal italic text-[#7A7770]">
                        Data unavailable
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-5 font-medium text-[#4A4843]">
                    City Data Period
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 font-mono text-xs text-[#141413]">
                    {cityA.data_period || (
                      <span className="font-sans italic text-[#7A7770]">Data unavailable</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 font-mono text-xs text-[#141413]">
                    {cityB.data_period || (
                      <span className="font-sans italic text-[#7A7770]">Data unavailable</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-5 font-medium text-[#4A4843]">
                    Primary Data Source
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 text-xs text-[#141413] space-y-1">
                    <div>
                      {cityA.data_source_name || (
                        <span className="italic text-[#7A7770]">Data unavailable</span>
                      )}
                    </div>
                    {cityA.data_source_url && (
                      <a
                        href={cityA.data_source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#1E3A5F] hover:underline"
                      >
                        <span>Source Link</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 text-xs text-[#141413] space-y-1">
                    <div>
                      {cityB.data_source_name || (
                        <span className="italic text-[#7A7770]">Data unavailable</span>
                      )}
                    </div>
                    {cityB.data_source_url && (
                      <a
                        href={cityB.data_source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#1E3A5F] hover:underline"
                      >
                        <span>Source Link</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Separate City Analysis & Investment Insights */}
      <section aria-label="City Market Analysis and Investment Insights" className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
            Independent Research Notes
          </p>
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            City Market Analysis &amp; Investment Insights
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {[
            { slot: 'City A', city: cityA },
            { slot: 'City B', city: cityB },
          ].map(({ slot, city }) => (
            <div
              key={slot}
              className="bg-white border border-[#E5E0D8] rounded-md p-5 sm:p-7 space-y-5 min-w-0"
            >
              <div className="border-b border-[#E5E0D8] pb-3">
                <p className="text-[11px] uppercase tracking-widest font-semibold text-[#8C4A27]">
                  {slot} Research Profile
                </p>
                <h3 className="text-xl font-serif font-semibold text-[#141413] mt-0.5">
                  {city.city_name}, {city.country_name}
                </h3>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1E3A5F]">
                  Market Overview
                </h4>
                {renderParagraphs(city.market_overview) || (
                  <p className="text-sm text-[#7A7770] italic">Data unavailable</p>
                )}
              </div>

              <div className="space-y-2 pt-3 border-t border-[#F0ECE1]">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1E3A5F]">
                  Market Analysis
                </h4>
                {renderParagraphs(city.market_analysis) || (
                  <p className="text-sm text-[#7A7770] italic">Data unavailable</p>
                )}
              </div>

              <div className="space-y-2 pt-3 border-t border-[#F0ECE1]">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1E3A5F]">
                  Investment Insights
                </h4>
                {renderParagraphs(city.investment_insights) || (
                  <p className="text-sm text-[#7A7770] italic">Data unavailable</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-4 border-t border-[#E5E0D8] flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/global-markets"
          className="inline-flex items-center gap-2 min-h-[44px] text-xs font-semibold text-[#1E3A5F] hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Back to Global Markets Directory</span>
        </Link>
      </div>
    </div>
  );
}
