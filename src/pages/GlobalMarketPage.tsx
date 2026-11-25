import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  FileText,
  Globe2,
  MapPin,
  Minus,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import 'flag-icons/css/flag-icons.min.css';
import {
  Article,
  GlobalMarketCountrySummary,
  GlobalMarketReport,
  MarketTrendDirection,
} from '../types';
import {
  getGlobalMarketCountryPageData,
  getGlobalMarketReportBySlug,
  getRelatedArticlesForMarket,
} from '../services/globalMarketsService';
import {
  formatMarketCurrency,
  formatMarketDateLabel,
  formatMarketTrend,
} from '../lib/globalMarkets';
import { resolveEditorialImage } from '../lib/editorialImages';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';
import ArticleCard from '../components/editorial/ArticleCard';
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
        className="text-base text-[#363532] leading-[1.75] whitespace-pre-line break-words [overflow-wrap:anywhere]"
      >
        {paragraph}
      </p>
    ));
}

function TrendIcon({ dir }: { dir?: MarketTrendDirection | null }) {
  if (dir === 'up') return <TrendingUp size={16} className="text-[#14532D]" aria-hidden="true" />;
  if (dir === 'down')
    return <TrendingDown size={16} className="text-[#991B1B]" aria-hidden="true" />;
  return <Minus size={16} className="text-[#5C5A55]" aria-hidden="true" />;
}

export default function GlobalMarketPage() {
  const { countrySlug, reportSlug } = useParams<{
    countrySlug: string;
    reportSlug?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [countrySummary, setCountrySummary] = useState<GlobalMarketCountrySummary | null>(null);
  const [activeReport, setActiveReport] = useState<GlobalMarketReport | null>(null);
  const [relatedReports, setRelatedReports] = useState<GlobalMarketReport[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isDirectNewsMatch, setIsDirectNewsMatch] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const isReportView = Boolean(reportSlug);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!countrySlug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setImgFailed(false);

      try {
        if (reportSlug) {
          const res = await getGlobalMarketReportBySlug(countrySlug, reportSlug);
          if (!active) return;
          if (!res) {
            setCountrySummary(null);
            setActiveReport(null);
            setRelatedReports([]);
            setRelatedArticles([]);
            return;
          }
          setCountrySummary(res.countrySummary);
          setActiveReport(res.report);
          setRelatedReports(res.siblingReports);

          const news = await getRelatedArticlesForMarket(
            res.countrySummary.countryName,
            [
              ...(res.report.city_name ? [res.report.city_name] : []),
              ...res.countrySummary.cities,
            ],
            3
          );
          if (!active) return;
          setRelatedArticles(news.articles);
          setIsDirectNewsMatch(news.isDirectMatch);
        } else {
          const res = await getGlobalMarketCountryPageData(countrySlug);
          if (!active) return;
          if (!res) {
            setCountrySummary(null);
            setActiveReport(null);
            setRelatedReports([]);
            setRelatedArticles([]);
            return;
          }
          setCountrySummary(res.countrySummary);
          setActiveReport(res.primaryReport);
          setRelatedReports(res.allReports.filter((r) => r.id !== res.primaryReport.id));

          const news = await getRelatedArticlesForMarket(
            res.countrySummary.countryName,
            res.countrySummary.cities,
            3
          );
          if (!active) return;
          setRelatedArticles(news.articles);
          setIsDirectNewsMatch(news.isDirectMatch);
        }
      } catch {
        if (!active) return;
        setCountrySummary(null);
        setActiveReport(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [countrySlug, reportSlug]);

  const notFound = !loading && (!countrySummary || !activeReport);

  const origin = getCanonicalOrigin();
  const pageUrl = activeReport
    ? activeReport.canonical_url ||
      (isReportView
        ? `${origin}/global-markets/${encodeURIComponent(activeReport.country_slug)}/${encodeURIComponent(activeReport.slug)}`
        : `${origin}/global-markets/${encodeURIComponent(activeReport.country_slug)}`)
    : undefined;

  const seoTitle = activeReport
    ? activeReport.seo_title ||
      (isReportView
        ? `${activeReport.title} | AmaanEstate`
        : `${countrySummary?.countryName} Real Estate Market Trends & Analysis | AmaanEstate`)
    : loading
    ? 'Loading Global Market Intelligence | AmaanEstate'
    : 'Market Report Not Found (404) | AmaanEstate';

  const seoDescription = activeReport
    ? (
        activeReport.seo_description ||
        activeReport.market_overview ||
        activeReport.market_analysis ||
        `Verified residential property price trends, rental market analysis, and investment insights for ${activeReport.city_name || activeReport.country_name}.`
      ).slice(0, 160)
    : 'Real estate market intelligence, residential price trends, and rental research on AmaanEstate.';

  useSEO({
    title: seoTitle,
    description: seoDescription,
    image: activeReport?.cover_image || undefined,
    imageAlt: activeReport?.cover_image_alt || activeReport?.title,
    url: pageUrl,
    noIndex: notFound,
    omitCanonical: notFound,
    structuredData:
      activeReport && countrySummary
        ? [
            {
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: seoTitle,
              description: seoDescription,
              url: pageUrl,
              dateModified:
                activeReport.last_verified_at ||
                activeReport.updated_at ||
                activeReport.published_at ||
                activeReport.created_at,
              about: {
                '@type': 'Place',
                name: activeReport.city_name
                  ? `${activeReport.city_name}, ${countrySummary.countryName}`
                  : countrySummary.countryName,
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: activeReport.city_name || undefined,
                  addressCountry: countrySummary.countryCode || countrySummary.countryName,
                },
              },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: `${origin}/`,
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Global Markets',
                  item: `${origin}/global-markets`,
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: countrySummary.countryName,
                  item: `${origin}/global-markets/${encodeURIComponent(countrySummary.countrySlug)}`,
                },
                ...(isReportView
                  ? [
                      {
                        '@type': 'ListItem',
                        position: 4,
                        name: activeReport.city_name || activeReport.title,
                        item: pageUrl,
                      },
                    ]
                  : []),
              ],
            },
          ]
        : undefined,
  });

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-6 animate-pulse">
        <div className="h-4 w-48 max-w-full bg-[#EBE6DF] rounded" />
        <div className="h-10 w-3/4 bg-[#EBE6DF] rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white border border-[#E5E0D8] rounded" />
          ))}
        </div>
        <div className="h-56 sm:h-64 bg-white border border-[#E5E0D8] rounded" />
      </div>
    );
  }

  if (notFound || !countrySummary || !activeReport) {
    return (
      <NotFoundPage
        title="Market Report Not Found (404) | AmaanEstate"
        heading="Market Intelligence Report Unavailable"
        message="There are currently no published real estate market intelligence reports for this location, or the report is under editorial review."
      />
    );
  }

  const isoCode = (countrySummary.countryCode || '').trim().toLowerCase();
  const hasIsoFlag = /^[a-z]{2}$/.test(isoCode);

  const avgSaleFormatted = formatMarketCurrency(
    activeReport.avg_sale_price,
    activeReport.currency
  );
  const avgRentFormatted = formatMarketCurrency(
    activeReport.avg_monthly_rent,
    activeReport.currency,
    ' / mo'
  );
  const priceTrendFormatted = formatMarketTrend(
    activeReport.property_price_trend_pct,
    activeReport.property_price_trend_dir
  );
  const rentalTrendFormatted = formatMarketTrend(
    activeReport.rental_price_trend_pct,
    activeReport.rental_price_trend_dir
  );
  const verifiedDateLabel = formatMarketDateLabel(
    activeReport.last_verified_at || activeReport.updated_at || activeReport.published_at
  );

  const metricCards = [
    avgSaleFormatted
      ? {
          label: 'Average Property Sale Price',
          value: avgSaleFormatted,
          sub: activeReport.data_period || activeReport.currency,
          icon: null,
        }
      : null,
    priceTrendFormatted
      ? {
          label: 'Residential Price Trend',
          value: priceTrendFormatted,
          sub: activeReport.data_period || 'Reported Change',
          icon: <TrendIcon dir={activeReport.property_price_trend_dir} />,
        }
      : null,
    avgRentFormatted
      ? {
          label: 'Average Monthly Rent',
          value: avgRentFormatted,
          sub: activeReport.data_period || activeReport.currency,
          icon: null,
        }
      : null,
    rentalTrendFormatted
      ? {
          label: 'Rental Market Trend',
          value: rentalTrendFormatted,
          sub: activeReport.data_period || 'Reported Change',
          icon: <TrendIcon dir={activeReport.rental_price_trend_dir} />,
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    value: string;
    sub: string;
    icon: React.ReactNode;
  }>;

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14 space-y-8 sm:space-y-12">
      {/* Breadcrumb & Back Navigation */}
      <div className="space-y-3 sm:space-y-4 border-b border-[#E5E0D8] pb-6 sm:pb-8">
        <nav aria-label="Breadcrumb" className="text-xs text-[#5C5A55] flex flex-wrap items-center gap-2">
          <Link to="/" className="hover:text-[#141413]">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/global-markets" className="hover:text-[#141413]">
            Global Markets
          </Link>
          <span aria-hidden="true">/</span>
          {isReportView ? (
            <>
              <Link
                to={`/global-markets/${encodeURIComponent(countrySummary.countrySlug)}`}
                className="hover:text-[#141413]"
              >
                {countrySummary.countryName}
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-[#141413] font-medium break-words">
                {activeReport.city_name || activeReport.title}
              </span>
            </>
          ) : (
            <span className="text-[#141413] font-medium">{countrySummary.countryName}</span>
          )}
        </nav>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
          {hasIsoFlag ? (
            <span
              className={`fi fi-${isoCode} w-7 h-[21px] rounded-[2px] ring-1 ring-black/10 shrink-0`}
              aria-hidden="true"
            />
          ) : (
            <Globe2 size={20} className="text-[#8C4A27] shrink-0" aria-hidden="true" />
          )}
          <span className="text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] font-semibold text-[#8C4A27] break-words">
            {activeReport.city_name
              ? `${activeReport.city_name} · ${countrySummary.countryName}`
              : `${countrySummary.countryName} · Market Intelligence`}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold text-[#141413] max-w-4xl leading-[1.15] break-words [overflow-wrap:anywhere]">
          {activeReport.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#5C5A55]">
          {activeReport.data_period && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="text-[#8C4A27]" aria-hidden="true" />
              <span>
                Reporting Period: <strong className="text-[#141413]">{activeReport.data_period}</strong>
              </span>
            </span>
          )}
          {verifiedDateLabel && (
            <>
              <span aria-hidden="true" className="text-[#D6CEBE]">
                ·
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#14532D]" aria-hidden="true" />
                <span>
                  Verified: <strong className="text-[#141413]">{verifiedDateLabel}</strong>
                </span>
              </span>
            </>
          )}
          {!isReportView && countrySummary.cityCount > 0 && (
            <>
              <span aria-hidden="true" className="text-[#D6CEBE]">
                ·
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} className="text-[#1E3A5F]" aria-hidden="true" />
                <span>
                  {countrySummary.cityCount}{' '}
                  {countrySummary.cityCount === 1 ? 'City Covered' : 'Cities Covered'}
                </span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Optional Verified Cover Photograph */}
      {activeReport.cover_image && !imgFailed && (
        <figure className="overflow-hidden rounded-md border border-[#E5E0D8] bg-[#EBE6DF] aspect-[16/10] sm:aspect-[16/9] max-h-[260px] sm:max-h-[440px]">
          <img
            src={resolveEditorialImage(activeReport.cover_image)}
            alt={activeReport.cover_image_alt || activeReport.title}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
          />
        </figure>
      )}

      {/* Key Market Indicators Strip (only rendered when verified metrics exist) */}
      {metricCards.length > 0 && (
        <section aria-labelledby="market-indicators-heading" className="space-y-3 sm:space-y-4">
          <h2
            id="market-indicators-heading"
            className="text-xs uppercase tracking-widest font-semibold text-[#5C5A55]"
          >
            Verified Market Indicators ({activeReport.currency})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {metricCards.map((card) => (
              <div
                key={card.label}
                className="bg-white border border-[#E5E0D8] rounded-md p-4 sm:p-5 min-w-0 space-y-1.5 sm:space-y-2"
              >
                <p className="text-xs font-semibold text-[#5C5A55]">{card.label}</p>
                <p className="text-xl sm:text-2xl font-serif font-semibold font-mono tabular-nums text-[#141413] flex flex-wrap items-center gap-2 break-words [overflow-wrap:anywhere]">
                  {card.icon}
                  <span>{card.value}</span>
                </p>
                <p className="text-[11px] text-[#7A7770]">{card.sub}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Research Body + Sidebar Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-8 min-w-0 space-y-8 sm:space-y-10">
          {activeReport.market_overview.trim() && (
            <section aria-labelledby="market-overview-heading" className="space-y-3">
              <h2
                id="market-overview-heading"
                className="text-xl sm:text-2xl font-serif font-semibold text-[#141413] border-b border-[#E5E0D8] pb-2"
              >
                Market Overview
              </h2>
              <div className="space-y-4">{renderParagraphs(activeReport.market_overview)}</div>
            </section>
          )}

          {activeReport.market_analysis.trim() && (
            <section aria-labelledby="market-analysis-heading" className="space-y-3">
              <h2
                id="market-analysis-heading"
                className="text-xl sm:text-2xl font-serif font-semibold text-[#141413] border-b border-[#E5E0D8] pb-2"
              >
                Property Price &amp; Rental Market Analysis
              </h2>
              <div className="space-y-4">{renderParagraphs(activeReport.market_analysis)}</div>
            </section>
          )}

          {activeReport.investment_insights.trim() && (
            <section aria-labelledby="investment-insights-heading" className="space-y-3">
              <h2
                id="investment-insights-heading"
                className="text-xl sm:text-2xl font-serif font-semibold text-[#141413] border-b border-[#E5E0D8] pb-2"
              >
                Real Estate Investment Insights
              </h2>
              <div className="space-y-4">{renderParagraphs(activeReport.investment_insights)}</div>
            </section>
          )}
        </div>

        {/* Right Column: Data Sources & Reporting Metadata */}
        <aside className="lg:col-span-4 min-w-0 space-y-5 sm:space-y-6">
          <div className="bg-white border border-[#E5E0D8] rounded-md p-4 sm:p-6 min-w-0 space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
              <FileText size={14} aria-hidden="true" className="shrink-0" />
              <span>Data Sources &amp; Verification</span>
            </div>

            <dl className="space-y-3 text-xs">
              {activeReport.data_source_name && (
                <div className="border-b border-[#F0ECE1] pb-2.5">
                  <dt className="text-[#7A7770] uppercase tracking-wider text-[10px]">
                    Primary Data Source
                  </dt>
                  <dd className="font-semibold text-[#141413] mt-0.5 break-words [overflow-wrap:anywhere]">
                    {activeReport.data_source_name}
                  </dd>
                </div>
              )}

              {activeReport.data_period && (
                <div className="border-b border-[#F0ECE1] pb-2.5">
                  <dt className="text-[#7A7770] uppercase tracking-wider text-[10px]">
                    Reporting Period
                  </dt>
                  <dd className="font-semibold text-[#141413] mt-0.5 break-words [overflow-wrap:anywhere]">
                    {activeReport.data_period} ({activeReport.data_period_type})
                  </dd>
                </div>
              )}

              {verifiedDateLabel && (
                <div className="border-b border-[#F0ECE1] pb-2.5">
                  <dt className="text-[#7A7770] uppercase tracking-wider text-[10px]">
                    Last Verified Date
                  </dt>
                  <dd className="font-semibold text-[#141413] mt-0.5 break-words [overflow-wrap:anywhere]">
                    {verifiedDateLabel}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-[#7A7770] uppercase tracking-wider text-[10px]">
                  Currency Standard
                </dt>
                <dd className="font-mono font-semibold text-[#141413] mt-0.5 break-words [overflow-wrap:anywhere]">
                  {activeReport.currency}
                </dd>
              </div>
            </dl>

            {activeReport.data_source_url && (
              <a
                href={activeReport.data_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D6CEBE] rounded text-xs font-semibold text-[#1E3A5F] transition-colors"
              >
                <span>Inspect Official Source</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>

          {isReportView && (
            <Link
              to={`/global-markets/${encodeURIComponent(countrySummary.countrySlug)}`}
              className="inline-flex items-center gap-2 min-h-[44px] px-1 text-xs font-semibold text-[#1E3A5F] hover:underline"
            >
              <ArrowLeft size={14} />
              <span>Back to {countrySummary.countryName} Overview</span>
            </Link>
          )}
        </aside>
      </div>

      {/* City-Level & Additional Market Reports in this Country */}
      {relatedReports.length > 0 && (
        <section aria-labelledby="city-reports-heading" className="space-y-4 sm:space-y-5 pt-4 border-t border-[#E5E0D8]">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
              {countrySummary.countryName} Research
            </p>
            <h2
              id="city-reports-heading"
              className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]"
            >
              {isReportView
                ? `More Market Reports in ${countrySummary.countryName}`
                : 'City-Level & Sub-Market Reports'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {relatedReports.map((sub) => {
              const subHref = `/global-markets/${encodeURIComponent(sub.country_slug)}/${encodeURIComponent(sub.slug)}`;
              const subSale = formatMarketCurrency(sub.avg_sale_price, sub.currency);
              const subRent = formatMarketCurrency(sub.avg_monthly_rent, sub.currency, '/mo');
              const subPriceTrend = formatMarketTrend(
                sub.property_price_trend_pct,
                sub.property_price_trend_dir
              );
              const subRentTrend = formatMarketTrend(
                sub.rental_price_trend_pct,
                sub.rental_price_trend_dir
              );

              return (
                <Link
                  key={sub.id}
                  to={subHref}
                  className="group bg-white border border-[#E5E0D8] hover:border-[#1E3A5F] rounded-md p-4 sm:p-5 min-w-0 flex flex-col justify-between space-y-4 transition-colors"
                >
                  <div className="space-y-2.5 min-w-0">
                    <p className="text-[11px] uppercase tracking-widest font-semibold text-[#8C4A27]">
                      {sub.city_name ? sub.city_name : 'Country Research'}
                      {sub.data_period ? ` · ${sub.data_period}` : ''}
                    </p>
                    <h3 className="text-lg font-serif font-semibold text-[#141413] group-hover:text-[#1E3A5F] transition-colors break-words">
                      {sub.title}
                    </h3>
                    {sub.market_overview && (
                      <p className="text-xs text-[#4A4843] leading-relaxed line-clamp-3">
                        {sub.market_overview}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#F0ECE1] space-y-2">
                    {(subSale || subRent || subPriceTrend || subRentTrend) && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono tabular-nums text-[#141413]">
                        {subPriceTrend && <span>Price {subPriceTrend}</span>}
                        {subRentTrend && <span>Rent {subRentTrend}</span>}
                        {subSale && <span>Avg {subSale}</span>}
                        {subRent && <span>Rent {subRent}</span>}
                      </div>
                    )}
                    <div className="text-xs font-semibold text-[#1E3A5F] group-hover:text-[#8C4A27]">
                      Read Report &rarr;
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Latest Related Real Estate News (Editorial Articles Only — Never Listings) */}
      {relatedArticles.length > 0 && (
        <section aria-labelledby="related-news-heading" className="space-y-4 sm:space-y-5 pt-4 border-t border-[#E5E0D8]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
                Editorial Coverage
              </p>
              <h2
                id="related-news-heading"
                className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]"
              >
                {isDirectNewsMatch
                  ? `Latest Real Estate News on ${countrySummary.countryName}`
                  : 'Latest Global Real Estate News'}
              </h2>
            </div>
            <Link
              to="/news"
              className="inline-flex items-center min-h-[36px] text-xs font-semibold text-[#1E3A5F] hover:underline whitespace-nowrap"
            >
              All Global News &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {relatedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
