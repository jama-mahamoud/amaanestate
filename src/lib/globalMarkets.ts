import {
  GlobalMarketComparisonCity,
  GlobalMarketComparisonReport,
  GlobalMarketCountrySummary,
  GlobalMarketReport,
  MarketDataPeriodType,
  MarketTrendDirection,
} from '../types';
import { countryCodeToFlag, normalizeCountryInfo } from './countries';

export function slugifyMarketSegment(raw?: string | null): string {
  const value = (raw || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return value;
}

export function buildMarketReportSlug(
  title?: string | null,
  cityName?: string | null,
  fallback?: string | null
): string {
  const titleSlug = slugifyMarketSegment(title);
  const citySlug = slugifyMarketSegment(cityName);

  if (!citySlug) {
    return titleSlug || slugifyMarketSegment(fallback);
  }
  if (!titleSlug) {
    return citySlug || slugifyMarketSegment(fallback);
  }
  if (titleSlug === citySlug || titleSlug.startsWith(`${citySlug}-`)) {
    return titleSlug;
  }
  return `${citySlug}-${titleSlug}`;
}

export function deriveCountrySlug(countryName?: string | null): string {
  const normalized = normalizeCountryInfo(countryName);
  return slugifyMarketSegment(normalized?.name || countryName || '');
}

export function resolveReportCanonicalUrl(
  report: Pick<GlobalMarketReport, 'country_slug' | 'slug' | 'canonical_url'>,
  knownReports: Array<Pick<GlobalMarketReport, 'country_slug' | 'slug'>> = [],
  origin = 'https://www.amaanestate.com'
): string {
  const cleanOrigin = (origin || 'https://www.amaanestate.com').trim().replace(/\/+$/, '');
  const cleanCountrySlug = slugifyMarketSegment(report.country_slug);
  const cleanReportSlug = slugifyMarketSegment(report.slug);
  const selfCanonicalUrl = `${cleanOrigin}/global-markets/${encodeURIComponent(cleanCountrySlug)}/${encodeURIComponent(cleanReportSlug)}`;

  const override = (report.canonical_url || '').trim();
  if (!override || !isValidHttpUrl(override)) {
    return selfCanonicalUrl;
  }

  try {
    const parsedOverride = new URL(override);
    const originHost = new URL(cleanOrigin).hostname.replace(/^www\./, '').toLowerCase();
    const overrideHost = parsedOverride.hostname.replace(/^www\./, '').toLowerCase();
    const isSameSite = overrideHost === 'amaanestate.com' || overrideHost === originHost;

    if (isSameSite) {
      const cleanPath = parsedOverride.pathname.replace(/\/+$/, '');
      if (cleanPath.startsWith('/global-markets')) {
        const segments = cleanPath
          .slice('/global-markets'.length)
          .split('/')
          .filter(Boolean);

        // A report detail page should not canonicalize to a broken 404 internal report URL
        // or collapse onto a country overview hub.
        if (segments.length !== 2) {
          return selfCanonicalUrl;
        }

        const targetCountry = slugifyMarketSegment(decodeURIComponent(segments[0]));
        const targetSlug = slugifyMarketSegment(decodeURIComponent(segments[1]));
        const isSelfTarget =
          targetCountry === cleanCountrySlug && targetSlug === cleanReportSlug;

        if (!isSelfTarget) {
          const existsInKnownReports = knownReports.some(
            (candidate) =>
              slugifyMarketSegment(candidate.country_slug) === targetCountry &&
              slugifyMarketSegment(candidate.slug) === targetSlug
          );
          if (!existsInKnownReports) {
            return selfCanonicalUrl;
          }
        }
      }
    }

    return parsedOverride.toString();
  } catch {
    return selfCanonicalUrl;
  }
}

export function getCountryMapImageUrl(countryCode?: string | null): string | null {
  const clean = (countryCode || '').trim().toLowerCase();
  if (!/^[a-z]{2}$/.test(clean)) return null;
  return `/api/global-markets/map/${clean}.svg`;
}

export function getHomepageCountryTargetHref(
  country: Pick<GlobalMarketCountrySummary, 'countrySlug' | 'reportCount' | 'primaryReportSlug'>
): string {
  const encodedCountry = encodeURIComponent(country.countrySlug);
  if (country.reportCount === 1 && country.primaryReportSlug) {
    return `/global-markets/${encodedCountry}/${encodeURIComponent(country.primaryReportSlug)}`;
  }
  return `/global-markets/${encodedCountry}`;
}

export function isValidHttpUrl(rawUrl?: string | null): boolean {
  const cleaned = (rawUrl || '').trim();
  if (!cleaned) return false;
  try {
    const parsed = new URL(cleaned);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidHttpsUrl(rawUrl?: string | null): boolean {
  const cleaned = (rawUrl || '').trim();
  if (!cleaned) return false;
  try {
    const parsed = new URL(cleaned);
    return parsed.protocol === 'https:' && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

export const DEFAULT_MARKET_OG_IMAGE_PATH = '/images/articles/sovereign-capital-logistics-corridors.jpg';
export const DEFAULT_MARKET_OG_IMAGE_ALT =
  'AmaanEstate — Global Real Estate Media, Research & Market Intelligence';

export function resolveMarketSocialImageMetadata(params: {
  report?: Pick<
    GlobalMarketReport,
    'social_image' | 'social_image_alt' | 'cover_image' | 'cover_image_alt' | 'title'
  > | null;
  fallbackTitle?: string;
}): {
  image?: string;
  imageAlt?: string;
  source: 'social_image' | 'cover_image' | 'default';
} {
  const report = params.report;
  const fallbackTitle = (params.fallbackTitle || report?.title || '').trim();
  const dedicatedSocialUrl = (report?.social_image || '').trim();
  const coverImageUrl = (report?.cover_image || '').trim();

  if (dedicatedSocialUrl && isValidHttpsUrl(dedicatedSocialUrl)) {
    return {
      image: dedicatedSocialUrl,
      imageAlt:
        (report?.social_image_alt || '').trim() ||
        fallbackTitle ||
        DEFAULT_MARKET_OG_IMAGE_ALT,
      source: 'social_image',
    };
  }

  if (coverImageUrl) {
    return {
      image: coverImageUrl,
      imageAlt:
        (report?.cover_image_alt || '').trim() ||
        fallbackTitle ||
        DEFAULT_MARKET_OG_IMAGE_ALT,
      source: 'cover_image',
    };
  }

  return {
    image: undefined,
    imageAlt: undefined,
    source: 'default',
  };
}

export function normalizeNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function formatMarketCurrency(
  amount?: number | null,
  currency = 'USD',
  suffix = ''
): string | null {
  if (amount === null || amount === undefined || !Number.isFinite(Number(amount))) {
    return null;
  }
  const numeric = Number(amount);
  if (numeric < 0) return null;

  const safeCurrency = /^[A-Z]{3}$/.test((currency || '').trim().toUpperCase())
    ? currency.trim().toUpperCase()
    : 'USD';

  try {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency,
      maximumFractionDigits: 0,
    }).format(numeric);
    return suffix ? `${formatted}${suffix}` : formatted;
  } catch {
    const formatted = `${safeCurrency} ${numeric.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    return suffix ? `${formatted}${suffix}` : formatted;
  }
}

export function formatMarketInteger(
  value?: number | null,
  unitSingular?: string,
  unitPlural?: string
): string | null {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return null;
  }
  const numeric = Math.round(Number(value));
  if (numeric < 0) return null;
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(numeric);
  if (!unitSingular) return formatted;
  const unit = numeric === 1 ? unitSingular : unitPlural || `${unitSingular}s`;
  return `${formatted} ${unit}`;
}

export function formatDaysOnMarket(days?: number | null): string | null {
  return formatMarketInteger(days, 'day', 'days');
}

export type ResolvedMarketTrendState = 'up' | 'down' | 'flat' | 'none';

export function resolveMarketTrendDirection(
  pct?: number | null,
  dir?: MarketTrendDirection | null
): ResolvedMarketTrendState {
  const hasPct = pct !== null && pct !== undefined && Number.isFinite(Number(pct));
  const num = hasPct ? Number(pct) : null;

  if (num !== null) {
    if (dir === 'down' || (dir !== 'up' && num < 0)) return 'down';
    if (dir === 'up' || (dir !== 'flat' && num > 0)) return 'up';
    if (dir === 'flat' || num === 0) return 'flat';
  }

  if (dir === 'up' || dir === 'down' || dir === 'flat') {
    return dir;
  }

  return 'none';
}

export function formatMarketTrend(
  pct?: number | null,
  dir?: MarketTrendDirection | null
): string | null {
  if (pct === null || pct === undefined || !Number.isFinite(Number(pct))) {
    if (dir === 'flat') return 'Stable';
    return null;
  }
  const num = Number(pct);
  const absFormatted = Math.abs(num).toFixed(1);
  if (dir === 'down' || (dir !== 'up' && num < 0)) {
    return `-${absFormatted}%`;
  }
  if (dir === 'flat' || num === 0) {
    return '0.0%';
  }
  return `+${absFormatted}%`;
}

export function formatMarketDateLabel(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export interface MarketReadinessResult {
  isReadyToPublish: boolean;
  issues: string[];
  warnings: string[];
}

export function getMarketPublishReadiness(
  report: Partial<GlobalMarketReport>
): MarketReadinessResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  const countryName = (report.country_name || '').trim();
  const title = (report.title || '').trim();
  const cityName = (report.city_name || '').trim();
  const overview = (report.market_overview || '').trim();
  const analysis = (report.market_analysis || '').trim();
  const insights = (report.investment_insights || '').trim();
  const sourceName = (report.data_source_name || '').trim();
  const sourceUrl = (report.data_source_url || '').trim();
  const dataPeriod = (report.data_period || '').trim();
  const lastVerifiedRaw = (report.last_verified_at || '').trim();
  const hasValidVerifiedDate =
    Boolean(lastVerifiedRaw) && !Number.isNaN(Date.parse(lastVerifiedRaw));

  if (!countryName) {
    issues.push('Country name is required.');
  }
  if (!title) {
    issues.push('Market title is required.');
  }
  if (report.market_level === 'city' && !cityName) {
    issues.push('City name is required for city-level market reports.');
  }

  const combinedEditorialLen = overview.length + analysis.length + insights.length;
  const hasAnySubstantiveSection =
    overview.length >= 40 || analysis.length >= 40 || insights.length >= 40;

  if (!hasAnySubstantiveSection || combinedEditorialLen < 80) {
    issues.push(
      'Provide substantive market intelligence (at least 40 characters in one section and 80 characters total across Overview, Market Analysis, or Investment Insights) before publishing.'
    );
  }

  if (!sourceName) {
    issues.push('Data source name is required before publishing.');
  }

  if (!hasValidVerifiedDate) {
    issues.push('Last verified / updated date is required before publishing.');
  }

  if (sourceUrl && !isValidHttpUrl(sourceUrl)) {
    issues.push('Data source URL must be a valid http:// or https:// link.');
  }

  if (report.social_image && report.social_image.trim() && !isValidHttpsUrl(report.social_image)) {
    issues.push('Social Sharing Image URL must be a valid public https:// URL.');
  }

  if (report.canonical_url && report.canonical_url.trim() && !isValidHttpUrl(report.canonical_url)) {
    issues.push('Canonical URL override must be a valid http:// or https:// URL.');
  } else if (report.canonical_url && report.canonical_url.trim()) {
    try {
      const parsedCanonical = new URL(report.canonical_url.trim());
      const host = parsedCanonical.hostname.replace(/^www\./, '').toLowerCase();
      const reportCountrySlug = slugifyMarketSegment(report.country_slug || countryName);
      const reportSlug = slugifyMarketSegment(report.slug);
      const expectedPath =
        reportCountrySlug && reportSlug
          ? `/global-markets/${reportCountrySlug}/${reportSlug}`
          : '';
      const actualPath = parsedCanonical.pathname.replace(/\/+$/, '');
      if (
        host === 'amaanestate.com' &&
        actualPath.startsWith('/global-markets') &&
        expectedPath &&
        actualPath !== expectedPath
      ) {
        warnings.push(
          `Canonical URL points to "${actualPath}", which differs from this report's live route "${expectedPath}". Leave Canonical URL blank to self-canonicalize.`
        );
      }
    } catch {
      // Handled by URL check above
    }
  }

  if (!dataPeriod) {
    warnings.push('Specify a reporting data period (e.g., Q3 2026 or 2026) for reader clarity.');
  }

  return {
    isReadyToPublish: issues.length === 0,
    issues,
    warnings,
  };
}

export function isMeaningfulMarketReport(report: Partial<GlobalMarketReport>): boolean {
  if (!report) return false;
  if (!(report.country_name || '').trim() || !(report.title || '').trim()) return false;
  if (report.market_level === 'city' && !(report.city_name || '').trim()) return false;
  if (!(report.data_source_name || '').trim()) return false;
  const lastVerifiedRaw = (report.last_verified_at || '').trim();
  if (!lastVerifiedRaw || Number.isNaN(Date.parse(lastVerifiedRaw))) return false;
  const overview = (report.market_overview || '').trim();
  const analysis = (report.market_analysis || '').trim();
  const insights = (report.investment_insights || '').trim();
  const hasSection = overview.length >= 40 || analysis.length >= 40 || insights.length >= 40;
  return hasSection && overview.length + analysis.length + insights.length >= 80;
}

function getReportTimestampMs(report: GlobalMarketReport): number {
  const candidate =
    report.last_verified_at || report.updated_at || report.published_at || report.created_at;
  if (!candidate) return 0;
  const ts = Date.parse(candidate);
  return Number.isNaN(ts) ? 0 : ts;
}

export function pickPrimaryCountryReport(reports: GlobalMarketReport[]): GlobalMarketReport {
  const sorted = [...reports].sort((a, b) => {
    // Prefer country-level featured report first, then country-level report, then newest verified date
    const aIsCountry = a.market_level === 'country' || !(a.city_name || '').trim() ? 1 : 0;
    const bIsCountry = b.market_level === 'country' || !(b.city_name || '').trim() ? 1 : 0;
    if (aIsCountry !== bIsCountry) return bIsCountry - aIsCountry;
    if (Boolean(a.is_featured) !== Boolean(b.is_featured)) {
      return a.is_featured ? -1 : 1;
    }
    return getReportTimestampMs(b) - getReportTimestampMs(a);
  });
  return sorted[0];
}

export function aggregateCountrySummaries(
  reports: GlobalMarketReport[]
): GlobalMarketCountrySummary[] {
  const eligible = reports.filter(
    (r) => r.status === 'published' && isMeaningfulMarketReport(r)
  );

  const grouped = new Map<string, GlobalMarketReport[]>();
  for (const report of eligible) {
    const slug = report.country_slug || deriveCountrySlug(report.country_name);
    if (!slug) continue;
    const list = grouped.get(slug) || [];
    list.push(report);
    grouped.set(slug, list);
  }

  const summaries: GlobalMarketCountrySummary[] = [];

  for (const [countrySlug, group] of grouped.entries()) {
    const primary = pickPrimaryCountryReport(group);
    const normalized = normalizeCountryInfo(primary.country_name);
    const countryName = normalized?.name || primary.country_name.trim();
    const countryCode = (primary.country_code || normalized?.code || '').trim().toUpperCase();
    const flag = countryCodeToFlag(countryCode);

    const citySet = new Set<string>();
    let latestMs = 0;
    let latestUpdatedAt: string | null = null;
    let latestDataPeriod: string | null = null;
    let anyFeatured = false;
    let coverImage: string | null = primary.cover_image || null;
    let coverImageAlt: string | null = primary.cover_image_alt || null;

    // Indicators: prefer primary report's non-null indicators, else fall back to most recent report in country with that indicator
    const sortedByDate = [...group].sort(
      (a, b) => getReportTimestampMs(b) - getReportTimestampMs(a)
    );

    for (const item of sortedByDate) {
      if (item.city_name && item.city_name.trim()) {
        citySet.add(item.city_name.trim());
      }
      if (item.is_featured) {
        anyFeatured = true;
      }
      if (!coverImage && item.cover_image) {
        coverImage = item.cover_image;
        coverImageAlt = item.cover_image_alt || null;
      }
      const ts = getReportTimestampMs(item);
      if (ts >= latestMs) {
        latestMs = ts;
        latestUpdatedAt =
          item.last_verified_at || item.updated_at || item.published_at || item.created_at;
        if (item.data_period && item.data_period.trim()) {
          latestDataPeriod = item.data_period.trim();
        }
      }
    }

    const pickMetricReport = (predicate: (r: GlobalMarketReport) => boolean) =>
      predicate(primary) ? primary : sortedByDate.find(predicate) || null;

    const saleMetricSource = pickMetricReport(
      (r) => normalizeNullableNumber(r.avg_sale_price) !== null
    );
    const rentMetricSource = pickMetricReport(
      (r) => normalizeNullableNumber(r.avg_monthly_rent) !== null
    );
    const priceTrendSource = pickMetricReport(
      (r) =>
        normalizeNullableNumber(r.property_price_trend_pct) !== null ||
        Boolean(r.property_price_trend_dir)
    );
    const rentalTrendSource = pickMetricReport(
      (r) =>
        normalizeNullableNumber(r.rental_price_trend_pct) !== null ||
        Boolean(r.rental_price_trend_dir)
    );

    summaries.push({
      countryName,
      countryCode,
      countrySlug,
      flag,
      reportCount: group.length,
      cityCount: citySet.size,
      cities: Array.from(citySet).sort((a, b) => a.localeCompare(b)),
      latestUpdatedAt,
      latestDataPeriod: latestDataPeriod || primary.data_period || null,
      coverImage,
      coverImageAlt,
      socialImage: primary.social_image ? primary.social_image.trim() : null,
      socialImageAlt: primary.social_image_alt ? primary.social_image_alt.trim() : null,
      primaryCoverImage: primary.cover_image ? primary.cover_image.trim() : null,
      primaryCoverImageAlt: primary.cover_image_alt ? primary.cover_image_alt.trim() : null,
      primaryReportSlug: primary.slug,
      primaryTitle: primary.title,
      primaryOverview: primary.market_overview || primary.market_analysis || primary.investment_insights,
      avgSalePrice: saleMetricSource ? normalizeNullableNumber(saleMetricSource.avg_sale_price) : null,
      avgMonthlyRent: rentMetricSource ? normalizeNullableNumber(rentMetricSource.avg_monthly_rent) : null,
      currency: (
        saleMetricSource?.currency ||
        rentMetricSource?.currency ||
        primary.currency ||
        'USD'
      ).toUpperCase(),
      propertyPriceTrendPct: priceTrendSource
        ? normalizeNullableNumber(priceTrendSource.property_price_trend_pct)
        : null,
      propertyPriceTrendDir: priceTrendSource?.property_price_trend_dir || null,
      rentalPriceTrendPct: rentalTrendSource
        ? normalizeNullableNumber(rentalTrendSource.rental_price_trend_pct)
        : null,
      rentalPriceTrendDir: rentalTrendSource?.rental_price_trend_dir || null,
      isFeatured: anyFeatured,
    });
  }

  return summaries.sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    if (b.reportCount !== a.reportCount) return b.reportCount - a.reportCount;
    return a.countryName.localeCompare(b.countryName);
  });
}

// ============================================================================
// Two-City Property Market Comparison Helpers
// ============================================================================

export function formatMarketGranularityLabel(granularity?: MarketDataPeriodType | null): string {
  if (granularity === 'month') return 'Monthly';
  if (granularity === 'year') return 'Annual';
  return 'Quarterly';
}

export function buildComparisonSlug(
  cityAName?: string | null,
  cityBName?: string | null,
  title?: string | null
): string {
  const slugA = slugifyMarketSegment(cityAName);
  const slugB = slugifyMarketSegment(cityBName);
  if (slugA && slugB) {
    return `${slugA}-vs-${slugB}-property-market`;
  }
  const titleSlug = slugifyMarketSegment(title);
  if (titleSlug && titleSlug !== 'comparisons') {
    return titleSlug;
  }
  return '';
}

export function resolveComparisonCanonicalUrl(
  comparison: Pick<GlobalMarketComparisonReport, 'slug' | 'canonical_url'>,
  origin = 'https://www.amaanestate.com'
): string {
  const cleanOrigin = (origin || 'https://www.amaanestate.com').trim().replace(/\/+$/, '');
  const cleanSlug = slugifyMarketSegment(comparison.slug);
  const selfCanonicalUrl = `${cleanOrigin}/global-markets/comparisons/${encodeURIComponent(cleanSlug)}`;

  const override = (comparison.canonical_url || '').trim();
  if (!override || !isValidHttpUrl(override)) {
    return selfCanonicalUrl;
  }

  try {
    const parsedOverride = new URL(override);
    const originHost = new URL(cleanOrigin).hostname.replace(/^www\./, '').toLowerCase();
    const overrideHost = parsedOverride.hostname.replace(/^www\./, '').toLowerCase();
    const isSameSite = overrideHost === 'amaanestate.com' || overrideHost === originHost;

    if (isSameSite) {
      const cleanPath = parsedOverride.pathname.replace(/\/+$/, '');
      if (cleanPath.startsWith('/global-markets')) {
        const expectedPath = `/global-markets/comparisons/${cleanSlug}`;
        if (cleanPath !== expectedPath) {
          return selfCanonicalUrl;
        }
      }
    }
    return parsedOverride.toString();
  } catch {
    return selfCanonicalUrl;
  }
}

export function resolveComparisonSocialImageMetadata(params: {
  comparison?: Pick<
    GlobalMarketComparisonReport,
    'title' | 'social_image' | 'social_image_alt' | 'city_a' | 'city_b'
  > | null;
}): {
  image?: string;
  imageAlt?: string;
  source: 'social_image' | 'city_a' | 'city_b' | 'default';
} {
  const comp = params.comparison;
  if (!comp) {
    return { image: undefined, imageAlt: undefined, source: 'default' };
  }

  const dedicated = (comp.social_image || '').trim();
  if (dedicated && isValidHttpsUrl(dedicated)) {
    return {
      image: dedicated,
      imageAlt: (comp.social_image_alt || '').trim() || comp.title || DEFAULT_MARKET_OG_IMAGE_ALT,
      source: 'social_image',
    };
  }

  const cityAImg = (comp.city_a?.image_url || '').trim();
  if (cityAImg && isValidHttpsUrl(cityAImg)) {
    return {
      image: cityAImg,
      imageAlt:
        (comp.city_a?.image_alt || '').trim() ||
        `${comp.city_a?.city_name || 'City A'} residential market — ${comp.title}`,
      source: 'city_a',
    };
  }

  const cityBImg = (comp.city_b?.image_url || '').trim();
  if (cityBImg && isValidHttpsUrl(cityBImg)) {
    return {
      image: cityBImg,
      imageAlt:
        (comp.city_b?.image_alt || '').trim() ||
        `${comp.city_b?.city_name || 'City B'} residential market — ${comp.title}`,
      source: 'city_b',
    };
  }

  return { image: undefined, imageAlt: undefined, source: 'default' };
}

function validateComparisonCityPublish(
  city: Partial<GlobalMarketComparisonCity> | undefined,
  slotLabel: 'City A' | 'City B',
  issues: string[]
) {
  if (!city) {
    issues.push(`${slotLabel} details are required.`);
    return;
  }

  const cityName = (city.city_name || '').trim();
  const countryName = (city.country_name || '').trim();
  const imageUrl = (city.image_url || '').trim();
  const sourceName = (city.data_source_name || '').trim();
  const sourceUrl = (city.data_source_url || '').trim();
  const currency = (city.currency || '').trim();
  const overview = (city.market_overview || '').trim();
  const analysis = (city.market_analysis || '').trim();
  const insights = (city.investment_insights || '').trim();

  if (!cityName) {
    issues.push(`${slotLabel}: City Name is required.`);
  }
  if (!countryName) {
    issues.push(`${slotLabel}: Country Name is required.`);
  }
  if (!currency || !/^[A-Za-z]{3,8}$/.test(currency)) {
    issues.push(`${slotLabel}: Valid Currency ISO code is required (e.g., GBP, AED, USD).`);
  }
  if (imageUrl && !isValidHttpsUrl(imageUrl)) {
    issues.push(`${slotLabel}: City Image URL must be a valid public https:// URL.`);
  }
  if (!sourceName) {
    issues.push(`${slotLabel}: Data Source Name is required before publishing.`);
  }
  if (sourceUrl && !isValidHttpUrl(sourceUrl)) {
    issues.push(`${slotLabel}: Data Source URL must be a valid http:// or https:// link.`);
  }
  if (overview.length + analysis.length + insights.length < 40) {
    issues.push(
      `${slotLabel}: Provide substantive market overview, analysis, or investment insights (at least 40 characters combined) before publishing.`
    );
  }
}

export function getComparisonPublishReadiness(
  comparison: Partial<GlobalMarketComparisonReport>
): MarketReadinessResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  const title = (comparison.title || '').trim();
  const slug = slugifyMarketSegment(comparison.slug);
  const reportingPeriod = (comparison.reporting_period || '').trim();
  const lastVerifiedRaw = (comparison.last_verified_at || '').trim();
  const hasValidVerifiedDate =
    Boolean(lastVerifiedRaw) && !Number.isNaN(Date.parse(lastVerifiedRaw));

  if (!title) {
    issues.push('Comparison Title is required.');
  }
  if (!slug || slug === 'comparisons') {
    issues.push('A valid Comparison URL slug is required.');
  }
  if (!reportingPeriod) {
    issues.push('Reporting Period is required before publishing.');
  }
  if (!hasValidVerifiedDate) {
    issues.push('Last Verified Date is required before publishing.');
  }

  if (
    comparison.social_image &&
    comparison.social_image.trim() &&
    !isValidHttpsUrl(comparison.social_image)
  ) {
    issues.push('Social Sharing Image URL must be a valid public https:// URL.');
  }

  if (
    comparison.canonical_url &&
    comparison.canonical_url.trim() &&
    !isValidHttpUrl(comparison.canonical_url)
  ) {
    issues.push('Canonical URL override must be a valid http:// or https:// URL.');
  }

  validateComparisonCityPublish(comparison.city_a, 'City A', issues);
  validateComparisonCityPublish(comparison.city_b, 'City B', issues);

  if (!(comparison.short_intro || '').trim()) {
    warnings.push('Add a short introduction to summarize the comparison thesis for readers.');
  }

  return {
    isReadyToPublish: issues.length === 0,
    issues,
    warnings,
  };
}

export function isMeaningfulComparison(
  comparison: Partial<GlobalMarketComparisonReport> | null | undefined
): boolean {
  if (!comparison) return false;
  if (!(comparison.title || '').trim() || !(comparison.slug || '').trim()) return false;
  if (!(comparison.reporting_period || '').trim()) return false;
  const lastVerifiedRaw = (comparison.last_verified_at || '').trim();
  if (!lastVerifiedRaw || Number.isNaN(Date.parse(lastVerifiedRaw))) return false;
  if (!comparison.city_a || !comparison.city_b) return false;
  if (
    !(comparison.city_a.city_name || '').trim() ||
    !(comparison.city_a.country_name || '').trim() ||
    !(comparison.city_b.city_name || '').trim() ||
    !(comparison.city_b.country_name || '').trim()
  ) {
    return false;
  }
  return true;
}
