import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getCountryQueryVariants, normalizeCountryInfo } from '../lib/countries';
import {
  aggregateCountrySummaries,
  buildMarketReportSlug,
  deriveCountrySlug,
  getMarketPublishReadiness,
  isMeaningfulMarketReport,
  isValidHttpUrl,
  isValidHttpsUrl,
  normalizeNullableNumber,
  pickPrimaryCountryReport,
  slugifyMarketSegment,
} from '../lib/globalMarkets';
import { getAuthorizedDataSourceById } from '../lib/marketDataSources';
import { getPublishedArticles } from './editorialService';
import { loadDemoDb, saveDemoDb } from './demoContent';
import { isPgrst205Error } from './propertyService';
import {
  Article,
  GlobalMarketCountrySummary,
  GlobalMarketReport,
  MarketDataPeriodType,
  MarketDataSourceType,
  MarketLevel,
  MarketTrendDirection,
  PublicationStatus,
} from '../types';

export const GLOBAL_MARKETS_UPDATED_EVENT = 'amaan:global-markets-updated';
export const GLOBAL_MARKETS_CHANNEL = 'amaan_global_markets_updates';

export function notifyGlobalMarketsUpdated() {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(GLOBAL_MARKETS_UPDATED_EVENT));
  } catch {
    // Ignore event dispatch errors
  }
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel(GLOBAL_MARKETS_CHANNEL);
      channel.postMessage({ type: 'updated', timestamp: Date.now() });
      channel.close();
    } catch {
      // Ignore BroadcastChannel errors
    }
  }
}

export interface SaveGlobalMarketInput {
  id?: string;
  country_name: string;
  country_code?: string;
  country_slug?: string;
  city_name?: string | null;
  title: string;
  slug?: string;
  market_overview: string;
  avg_sale_price?: number | string | null;
  avg_monthly_rent?: number | string | null;
  currency: string;
  property_price_trend_pct?: number | string | null;
  property_price_trend_dir?: MarketTrendDirection | null;
  rental_price_trend_pct?: number | string | null;
  rental_price_trend_dir?: MarketTrendDirection | null;
  investment_insights: string;
  market_analysis: string;
  data_period: string;
  data_period_type: MarketDataPeriodType;
  data_source_name: string;
  data_source_url?: string | null;
  data_source_type: MarketDataSourceType;
  last_verified_at?: string | null;
  cover_image?: string | null;
  cover_image_alt?: string | null;
  social_image?: string | null;
  social_image_alt?: string | null;
  status: PublicationStatus;
  is_featured: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  published_at?: string | null;
}

export function normalizeGlobalMarketRow(row: any): GlobalMarketReport {
  const normalizedCountry = normalizeCountryInfo(row.country_name);
  const countryName = normalizedCountry?.name || String(row.country_name || '').trim();
  const countryCode = String(row.country_code || normalizedCountry?.code || '')
    .trim()
    .toUpperCase();
  const countrySlug =
    String(row.country_slug || '').trim() || deriveCountrySlug(countryName);
  const cityName = row.city_name ? String(row.city_name).trim() : null;
  const marketLevel: MarketLevel = cityName ? 'city' : 'country';

  return {
    id: row.id,
    country_name: countryName,
    country_code: countryCode,
    country_slug: countrySlug,
    city_name: cityName,
    market_level: (row.market_level as MarketLevel) || marketLevel,
    title: String(row.title || '').trim(),
    slug: String(row.slug || '').trim(),
    market_overview: String(row.market_overview || '').replace(/\r\n?/g, '\n'),
    avg_sale_price: normalizeNullableNumber(row.avg_sale_price),
    avg_monthly_rent: normalizeNullableNumber(row.avg_monthly_rent),
    currency: String(row.currency || 'USD').trim().toUpperCase(),
    property_price_trend_pct: normalizeNullableNumber(row.property_price_trend_pct),
    property_price_trend_dir:
      (row.property_price_trend_dir as MarketTrendDirection | null) || null,
    rental_price_trend_pct: normalizeNullableNumber(row.rental_price_trend_pct),
    rental_price_trend_dir:
      (row.rental_price_trend_dir as MarketTrendDirection | null) || null,
    investment_insights: String(row.investment_insights || '').replace(/\r\n?/g, '\n'),
    market_analysis: String(row.market_analysis || '').replace(/\r\n?/g, '\n'),
    data_period: String(row.data_period || ''),
    data_period_type: (row.data_period_type as MarketDataPeriodType) || 'quarter',
    data_source_name: String(row.data_source_name || ''),
    data_source_url: row.data_source_url ? String(row.data_source_url).trim() : null,
    data_source_type: (row.data_source_type as MarketDataSourceType) || 'manual',
    last_verified_at: row.last_verified_at ? String(row.last_verified_at).slice(0, 10) : null,
    cover_image: row.cover_image ? String(row.cover_image).trim() : null,
    cover_image_alt: row.cover_image_alt ? String(row.cover_image_alt).trim() : null,
    social_image: row.social_image ? String(row.social_image).trim() : null,
    social_image_alt: row.social_image_alt ? String(row.social_image_alt).trim() : null,
    status: (row.status as PublicationStatus) || 'draft',
    is_featured: Boolean(row.is_featured),
    seo_title: row.seo_title ? String(row.seo_title).trim() : null,
    seo_description: row.seo_description ? String(row.seo_description).trim() : null,
    canonical_url: row.canonical_url ? String(row.canonical_url).trim() : null,
    published_at: row.published_at || null,
    created_by: row.created_by || null,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || undefined,
  };
}

// ============================================================================
// Public Market Intelligence Queries (Published & Non-Thin Only)
// ============================================================================

export async function getPublishedMarketCountries(): Promise<{
  countries: GlobalMarketCountrySummary[];
  schemaPending: boolean;
}> {
  if (isSupabaseConfigured) {
    try {
      const response = await fetch('/api/global-markets/countries', { cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (response.ok) {
        return {
          countries: Array.isArray(payload.countries) ? payload.countries : [],
          schemaPending: Boolean(payload.schemaPending),
        };
      }
    } catch {
      // Fallback below if direct Supabase client is available
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('global_markets')
        .select('*')
        .eq('status', 'published')
        .order('is_featured', { ascending: false })
        .order('last_verified_at', { ascending: false, nullsFirst: false });

      if (error) {
        if (isPgrst205Error(error)) {
          return { countries: [], schemaPending: true };
        }
        return { countries: [], schemaPending: false };
      }

      const reports = (data || []).map(normalizeGlobalMarketRow);
      return {
        countries: aggregateCountrySummaries(reports),
        schemaPending: false,
      };
    }
  }

  const db = loadDemoDb();
  const reports = (db.globalMarkets || []).map(normalizeGlobalMarketRow);
  return {
    countries: aggregateCountrySummaries(reports),
    schemaPending: false,
  };
}

export interface GlobalMarketCountryPageData {
  countrySummary: GlobalMarketCountrySummary;
  primaryReport: GlobalMarketReport;
  cityReports: GlobalMarketReport[];
  allReports: GlobalMarketReport[];
  schemaPending: boolean;
}

export async function getGlobalMarketCountryPageData(
  countrySlug: string
): Promise<GlobalMarketCountryPageData | null> {
  const cleanCountrySlug = slugifyMarketSegment(countrySlug);
  if (!cleanCountrySlug) return null;

  if (isSupabaseConfigured) {
    try {
      const response = await fetch(
        `/api/global-markets/country/${encodeURIComponent(cleanCountrySlug)}`,
        { cache: 'no-store' }
      );
      if (response.status === 404) {
        return null;
      }
      if (response.ok) {
        const payload = await response.json().catch(() => null);
        if (payload?.countrySummary && payload?.primaryReport) {
          return {
            countrySummary: payload.countrySummary,
            primaryReport: normalizeGlobalMarketRow(payload.primaryReport),
            cityReports: Array.isArray(payload.cityReports)
              ? payload.cityReports.map(normalizeGlobalMarketRow)
              : [],
            allReports: Array.isArray(payload.allReports)
              ? payload.allReports.map(normalizeGlobalMarketRow)
              : [],
            schemaPending: Boolean(payload.schemaPending),
          };
        }
      }
    } catch {
      // Fallback to direct Supabase client
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('global_markets')
        .select('*')
        .eq('country_slug', cleanCountrySlug)
        .eq('status', 'published')
        .order('is_featured', { ascending: false })
        .order('last_verified_at', { ascending: false, nullsFirst: false });

      if (error || !data || data.length === 0) return null;
      const eligible = data.map(normalizeGlobalMarketRow).filter(isMeaningfulMarketReport);
      if (eligible.length === 0) return null;

      const summaries = aggregateCountrySummaries(eligible);
      if (summaries.length === 0) return null;

      const primaryReport = pickPrimaryCountryReport(eligible);
      const cityReports = eligible.filter(
        (r) => r.id !== primaryReport.id && (r.market_level === 'city' || Boolean(r.city_name))
      );

      return {
        countrySummary: summaries[0],
        primaryReport,
        cityReports,
        allReports: eligible,
        schemaPending: false,
      };
    }
  }

  const db = loadDemoDb();
  const eligible = (db.globalMarkets || [])
    .map(normalizeGlobalMarketRow)
    .filter(
      (r) =>
        r.country_slug === cleanCountrySlug &&
        r.status === 'published' &&
        isMeaningfulMarketReport(r)
    );

  if (eligible.length === 0) return null;
  const summaries = aggregateCountrySummaries(eligible);
  if (summaries.length === 0) return null;

  const primaryReport = pickPrimaryCountryReport(eligible);
  const cityReports = eligible.filter(
    (r) => r.id !== primaryReport.id && (r.market_level === 'city' || Boolean(r.city_name))
  );

  return {
    countrySummary: summaries[0],
    primaryReport,
    cityReports,
    allReports: eligible,
    schemaPending: false,
  };
}

export interface GlobalMarketReportPageData {
  countrySummary: GlobalMarketCountrySummary;
  report: GlobalMarketReport;
  siblingReports: GlobalMarketReport[];
  schemaPending: boolean;
}

export async function getGlobalMarketReportBySlug(
  countrySlug: string,
  reportSlug: string
): Promise<GlobalMarketReportPageData | null> {
  const cleanCountrySlug = slugifyMarketSegment(countrySlug);
  const cleanReportSlug = slugifyMarketSegment(reportSlug);
  if (!cleanCountrySlug || !cleanReportSlug) return null;

  const countryData = await getGlobalMarketCountryPageData(cleanCountrySlug);
  if (!countryData) return null;

  const target = countryData.allReports.find(
    (r) => slugifyMarketSegment(r.slug) === cleanReportSlug
  );
  if (!target) return null;

  return {
    countrySummary: countryData.countrySummary,
    report: target,
    siblingReports: countryData.allReports.filter((r) => r.id !== target.id),
    schemaPending: countryData.schemaPending,
  };
}

export async function getRelatedArticlesForMarket(
  countryName: string,
  cityNames: string[] = [],
  limit = 3
): Promise<{ articles: Article[]; isDirectMatch: boolean }> {
  const published = await getPublishedArticles({ sortBy: 'latest' });
  if (published.length === 0) {
    return { articles: [], isDirectMatch: false };
  }

  const countryVariants = getCountryQueryVariants(countryName)
    .map((v) => v.toLowerCase())
    .filter((v) => v.length >= 3);
  const cityVariants = cityNames
    .map((c) => c.trim().toLowerCase())
    .filter((c) => c.length >= 3);

  const scored = published
    .map((article) => {
      let score = 0;
      const targetCountry = (article.target_country || '').toLowerCase();
      const titleLower = article.title.toLowerCase();
      const excerptLower = (article.excerpt || '').toLowerCase();
      const contentLower = (article.content || '').toLowerCase();
      const keywordsText = [
        ...(article.keywords || []),
        ...(article.supporting_keywords || []),
        article.focus_keyword || '',
        ...(article.tags || []).map((t) => t.name),
      ]
        .join(' ')
        .toLowerCase();

      for (const variant of countryVariants) {
        if (targetCountry && targetCountry.includes(variant)) score += 10;
        if (titleLower.includes(variant)) score += 6;
        if (keywordsText.includes(variant)) score += 5;
        if (excerptLower.includes(variant)) score += 3;
        if (contentLower.includes(variant)) score += 1;
      }

      for (const city of cityVariants) {
        if (titleLower.includes(city)) score += 5;
        if (keywordsText.includes(city)) score += 4;
        if (excerptLower.includes(city)) score += 3;
        if (contentLower.includes(city)) score += 1;
      }

      return { article, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return {
      articles: scored.slice(0, limit).map((s) => s.article),
      isDirectMatch: true,
    };
  }

  // Fallback to investment & global news stories if no direct country match exists yet
  const marketEditorial = published.filter(
    (a) => a.category?.slug === 'investment' || a.category?.slug === 'news'
  );
  return {
    articles: (marketEditorial.length > 0 ? marketEditorial : published).slice(0, limit),
    isDirectMatch: false,
  };
}

// ============================================================================
// Admin CMS Operations (Protected by Supabase RLS is_admin_or_editor())
// ============================================================================

export async function getAdminGlobalMarkets(): Promise<{
  reports: GlobalMarketReport[];
  schemaPending: boolean;
}> {
  if (!isSupabaseConfigured || !supabase) {
    const db = loadDemoDb();
    return {
      reports: (db.globalMarkets || []).map(normalizeGlobalMarketRow),
      schemaPending: false,
    };
  }

  const { data, error } = await supabase
    .from('global_markets')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    if (isPgrst205Error(error)) {
      return { reports: [], schemaPending: true };
    }
    return { reports: [], schemaPending: false };
  }

  return {
    reports: (data || []).map(normalizeGlobalMarketRow),
    schemaPending: false,
  };
}

function buildPreparedMarketPayload(input: SaveGlobalMarketInput): {
  ok: boolean;
  error?: string;
  payload?: Record<string, any>;
} {
  const normalizedCountry = normalizeCountryInfo(input.country_name);
  const countryName = (normalizedCountry?.name || input.country_name || '').trim();
  const countryCode = (
    (input.country_code || '').trim() ||
    normalizedCountry?.code ||
    ''
  ).toUpperCase();
  const countrySlug =
    slugifyMarketSegment(input.country_slug) || deriveCountrySlug(countryName);
  const cityName = input.city_name?.trim() || null;
  const marketLevel: MarketLevel = cityName ? 'city' : 'country';
  const title = input.title.trim();

  const defaultSlugBase = cityName ? `${cityName}-market-report` : `${countrySlug}-overview`;
  const slug =
    slugifyMarketSegment(input.slug) ||
    buildMarketReportSlug(title, cityName, defaultSlugBase) ||
    `market-${Date.now()}`;

  if (!countryName || !countrySlug) {
    return { ok: false, error: 'A valid Country Name is required.' };
  }
  if (!title) {
    return { ok: false, error: 'Market Title is required.' };
  }

  if (input.data_source_url?.trim() && !isValidHttpUrl(input.data_source_url)) {
    return { ok: false, error: 'Data Source URL must start with http:// or https://.' };
  }
  if (input.social_image?.trim() && !isValidHttpsUrl(input.social_image)) {
    return {
      ok: false,
      error: 'Social Sharing Image URL must be a valid publicly accessible https:// URL.',
    };
  }
  if (input.canonical_url?.trim() && !isValidHttpUrl(input.canonical_url)) {
    return { ok: false, error: 'Canonical URL override must start with http:// or https://.' };
  }

  const avgSalePrice = normalizeNullableNumber(input.avg_sale_price);
  const avgMonthlyRent = normalizeNullableNumber(input.avg_monthly_rent);
  const propTrendPct = normalizeNullableNumber(input.property_price_trend_pct);
  const rentTrendPct = normalizeNullableNumber(input.rental_price_trend_pct);

  if (avgSalePrice !== null && avgSalePrice < 0) {
    return { ok: false, error: 'Average property sale price cannot be negative.' };
  }
  if (avgMonthlyRent !== null && avgMonthlyRent < 0) {
    return { ok: false, error: 'Average monthly rent cannot be negative.' };
  }

  const normalizedOverview = input.market_overview.replace(/\r\n?/g, '\n').trim();
  const normalizedAnalysis = input.market_analysis.replace(/\r\n?/g, '\n').trim();
  const normalizedInsights = input.investment_insights.replace(/\r\n?/g, '\n').trim();

  const candidateForReadiness: Partial<GlobalMarketReport> = {
    country_name: countryName,
    city_name: cityName,
    market_level: marketLevel,
    title,
    market_overview: normalizedOverview,
    market_analysis: normalizedAnalysis,
    investment_insights: normalizedInsights,
    avg_sale_price: avgSalePrice,
    avg_monthly_rent: avgMonthlyRent,
    property_price_trend_pct: propTrendPct,
    rental_price_trend_pct: rentTrendPct,
    data_source_name: input.data_source_name.trim(),
    data_source_url: input.data_source_url?.trim() || null,
    data_period: input.data_period.trim(),
    last_verified_at: input.last_verified_at?.trim() || null,
    social_image: input.social_image?.trim() || null,
    canonical_url: input.canonical_url?.trim() || null,
  };

  if (input.status === 'published') {
    const readiness = getMarketPublishReadiness(candidateForReadiness);
    if (!readiness.isReadyToPublish) {
      return { ok: false, error: readiness.issues[0] };
    }
  }

  const currencyClean = (input.currency || 'USD').trim().toUpperCase().slice(0, 8) || 'USD';

  return {
    ok: true,
    payload: {
      country_name: countryName,
      country_code: countryCode,
      country_slug: countrySlug,
      city_name: cityName,
      market_level: marketLevel,
      title,
      slug,
      market_overview: normalizedOverview,
      avg_sale_price: avgSalePrice,
      avg_monthly_rent: avgMonthlyRent,
      currency: currencyClean,
      property_price_trend_pct: propTrendPct,
      property_price_trend_dir:
        propTrendPct !== null || input.property_price_trend_dir === 'flat'
          ? input.property_price_trend_dir || (propTrendPct! > 0 ? 'up' : propTrendPct! < 0 ? 'down' : 'flat')
          : null,
      rental_price_trend_pct: rentTrendPct,
      rental_price_trend_dir:
        rentTrendPct !== null || input.rental_price_trend_dir === 'flat'
          ? input.rental_price_trend_dir || (rentTrendPct! > 0 ? 'up' : rentTrendPct! < 0 ? 'down' : 'flat')
          : null,
      investment_insights: normalizedInsights,
      market_analysis: normalizedAnalysis,
      data_period: input.data_period.trim(),
      data_period_type: input.data_period_type || 'quarter',
      data_source_name: input.data_source_name.trim(),
      data_source_url: input.data_source_url?.trim() || null,
      data_source_type: input.data_source_type || 'manual',
      last_verified_at: input.last_verified_at?.trim() || null,
      cover_image: input.cover_image?.trim() || null,
      cover_image_alt: input.cover_image_alt?.trim() || null,
      social_image: input.social_image?.trim() || null,
      social_image_alt: input.social_image_alt?.trim() || null,
      status: input.status,
      is_featured: Boolean(input.is_featured),
      seo_title: input.seo_title?.trim() || null,
      seo_description: input.seo_description?.trim() || null,
      canonical_url: input.canonical_url?.trim() || null,
      ...(input.published_at
        ? { published_at: input.published_at }
        : input.status === 'published'
        ? { published_at: new Date().toISOString() }
        : !input.id
        ? { published_at: null }
        : {}),
    },
  };
}

function isMissingSocialImageColumnError(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || '');
  const message = `${error.message || ''} ${error.details || ''} ${error.hint || ''}`;
  return (
    (code === 'PGRST204' || code === '42703') &&
    /social_image(_alt)?/i.test(message)
  );
}

export async function saveGlobalMarket(
  input: SaveGlobalMarketInput
): Promise<{ success: boolean; report?: GlobalMarketReport; error?: string }> {
  const prepared = buildPreparedMarketPayload(input);
  if (!prepared.ok || !prepared.payload) {
    return { success: false, error: prepared.error || 'Invalid market report data.' };
  }

  const rowPayload = prepared.payload;

  if (!isSupabaseConfigured || !supabase) {
    const db = loadDemoDb();
    const list = db.globalMarkets || [];
    const existingIdx = input.id ? list.findIndex((r) => r.id === input.id) : -1;

    const collision = list.find(
      (r) =>
        r.id !== input.id &&
        r.country_slug === rowPayload.country_slug &&
        r.slug === rowPayload.slug
    );
    if (collision) {
      return {
        success: false,
        error: `A market report with slug "${rowPayload.slug}" already exists in ${rowPayload.country_name}.`,
      };
    }

    const now = new Date().toISOString();
    const existingPublishedAt =
      existingIdx >= 0 ? list[existingIdx].published_at || null : null;
    const savedRecord: GlobalMarketReport = {
      id: input.id || `gm-${Date.now()}`,
      ...(rowPayload as any),
      published_at:
        existingPublishedAt ||
        (rowPayload.status === 'published' ? now : null),
      created_at: existingIdx >= 0 ? list[existingIdx].created_at : now,
      updated_at: now,
    };

    if (existingIdx >= 0) {
      list[existingIdx] = savedRecord;
    } else {
      list.unshift(savedRecord);
    }

    db.globalMarkets = list;
    saveDemoDb(db);
    notifyGlobalMarketsUpdated();
    return { success: true, report: savedRecord };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const runPersist = async (payloadToWrite: Record<string, any>) => {
    if (input.id) {
      return supabase
        .from('global_markets')
        .update(payloadToWrite)
        .eq('id', input.id)
        .select('*')
        .single();
    }
    return supabase
      .from('global_markets')
      .insert({ ...payloadToWrite, created_by: user?.id || null })
      .select('*')
      .single();
  };

  let { data, error } = await runPersist(rowPayload);

  if (error && isMissingSocialImageColumnError(error)) {
    if (!rowPayload.social_image && !rowPayload.social_image_alt) {
      const legacyPayload = { ...rowPayload };
      delete legacyPayload.social_image;
      delete legacyPayload.social_image_alt;
      ({ data, error } = await runPersist(legacyPayload));
    } else {
      return {
        success: false,
        error:
          'Database columns "social_image" / "social_image_alt" are missing. Run supabase/migrations/20261125000000_add_global_markets_social_image.sql in Supabase SQL Editor first.',
      };
    }
  }

  if (error || !data) {
    return {
      success: false,
      error:
        error?.message ||
        (input.id ? 'Unable to update market report.' : 'Unable to create market report.'),
    };
  }
  notifyGlobalMarketsUpdated();
  return { success: true, report: normalizeGlobalMarketRow(data) };
}

export async function updateGlobalMarketStatus(
  report: GlobalMarketReport,
  nextStatus: PublicationStatus
): Promise<{ success: boolean; error?: string }> {
  if (nextStatus === 'published') {
    const readiness = getMarketPublishReadiness(report);
    if (!readiness.isReadyToPublish) {
      return { success: false, error: readiness.issues[0] };
    }
  }

  if (!isSupabaseConfigured || !supabase) {
    const db = loadDemoDb();
    const idx = (db.globalMarkets || []).findIndex((r) => r.id === report.id);
    if (idx >= 0) {
      db.globalMarkets[idx].status = nextStatus;
      db.globalMarkets[idx].updated_at = new Date().toISOString();
      if (nextStatus === 'published' && !db.globalMarkets[idx].published_at) {
        db.globalMarkets[idx].published_at = new Date().toISOString();
      }
      saveDemoDb(db);
      notifyGlobalMarketsUpdated();
    }
    return { success: true };
  }

  const updateData: Record<string, any> = { status: nextStatus };
  if (nextStatus === 'published' && !report.published_at) {
    updateData.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from('global_markets').update(updateData).eq('id', report.id);
  if (error) {
    return { success: false, error: error.message };
  }
  notifyGlobalMarketsUpdated();
  return { success: true };
}

export async function deleteGlobalMarket(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    const db = loadDemoDb();
    db.globalMarkets = (db.globalMarkets || []).filter((r) => r.id !== id);
    saveDemoDb(db);
    notifyGlobalMarketsUpdated();
    return { success: true };
  }

  const { error } = await supabase.from('global_markets').delete().eq('id', id);
  if (error) {
    return { success: false, error: error.message };
  }
  notifyGlobalMarketsUpdated();
  return { success: true };
}

export async function stageDraftFromPublicSource(params: {
  sourceType: Exclude<MarketDataSourceType, 'manual' | 'other_authorized'>;
  countryName: string;
  cityName?: string;
}): Promise<{
  success: boolean;
  draftInput?: Partial<SaveGlobalMarketInput>;
  note?: string;
  error?: string;
}> {
  const normalizedCountry = normalizeCountryInfo(params.countryName);
  const countryName = normalizedCountry?.name || params.countryName.trim();
  const countryCode = normalizedCountry?.code || '';
  const countrySlug = deriveCountrySlug(countryName);
  const sourceMeta = getAuthorizedDataSourceById(params.sourceType);

  if (!countryName || !sourceMeta) {
    return { success: false, error: 'Select a valid country and authorized public data source.' };
  }

  // Try live server-side SDMX draft staging when authenticated & online
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch('/api/global-markets/stage-source-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sourceType: params.sourceType,
          countryName,
          countryCode,
          cityName: params.cityName?.trim() || '',
        }),
      });
      if (res.ok) {
        const payload = await res.json().catch(() => null);
        if (payload?.draftInput) {
          return {
            success: true,
            draftInput: {
              ...payload.draftInput,
              status: 'draft',
              is_featured: false,
            },
            note: payload.note,
          };
        }
      }
    } catch {
      // Fall back cleanly to clean unpopulated attributed draft template
    }
  }

  const cityClean = params.cityName?.trim() || '';
  const targetLabel = cityClean ? `${cityClean}, ${countryName}` : countryName;

  return {
    success: true,
    draftInput: {
      country_name: countryName,
      country_code: countryCode,
      country_slug: countrySlug,
      city_name: cityClean,
      title: `${targetLabel} Residential Market Intelligence Report`,
      slug: slugifyMarketSegment(
        cityClean ? `${cityClean}-market-report` : `${countrySlug}-market-overview`
      ),
      currency: 'USD',
      avg_sale_price: null,
      avg_monthly_rent: null,
      property_price_trend_pct: null,
      property_price_trend_dir: null,
      rental_price_trend_pct: null,
      rental_price_trend_dir: null,
      data_period: '',
      data_period_type: sourceMeta.defaultPeriodType,
      data_source_type: params.sourceType,
      data_source_name: sourceMeta.name,
      data_source_url: sourceMeta.officialPortalUrl,
      last_verified_at: new Date().toISOString().slice(0, 10),
      market_overview: '',
      market_analysis: '',
      investment_insights: '',
      status: 'draft',
      is_featured: false,
    },
    note: `Draft staged using ${sourceMeta.shortName} attribution. Enter verified statistics directly from the official release before publishing.`,
  };
}
