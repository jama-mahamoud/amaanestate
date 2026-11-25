import type express from "express";
import { normalizeCountryInfo } from "../src/lib/countries";
import {
  aggregateCountrySummaries,
  deriveCountrySlug,
  isMeaningfulMarketReport,
  pickPrimaryCountryReport,
  slugifyMarketSegment,
} from "../src/lib/globalMarkets";
import { getAuthorizedDataSourceById } from "../src/lib/marketDataSources";
import type { GlobalMarketReport, MarketDataSourceType } from "../src/types";

interface SupabaseRuntimeConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

function getSupabaseRuntime(): SupabaseRuntimeConfig | null {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "")
    .trim()
    .replace(/\/+$/, "");
  const anonKey = (
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ""
  ).trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim() || undefined;
  if (!url || !anonKey) return null;
  return { url, anonKey, serviceRoleKey };
}

function isMissingRelation(status: number, bodyText: string): boolean {
  return (
    status === 404 ||
    bodyText.includes("PGRST205") ||
    bodyText.includes("42P01") ||
    bodyText.includes("does not exist")
  );
}

function setNoCacheHeaders(res: express.Response) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

function normalizeServerMarketRow(row: any): GlobalMarketReport {
  const normalizedCountry = normalizeCountryInfo(row.country_name);
  const countryName = normalizedCountry?.name || String(row.country_name || "").trim();
  const countryCode = String(row.country_code || normalizedCountry?.code || "")
    .trim()
    .toUpperCase();
  const countrySlug =
    String(row.country_slug || "").trim() || deriveCountrySlug(countryName);
  const cityName = row.city_name ? String(row.city_name).trim() : null;

  return {
    id: row.id,
    country_name: countryName,
    country_code: countryCode,
    country_slug: countrySlug,
    city_name: cityName,
    market_level: row.market_level || (cityName ? "city" : "country"),
    title: String(row.title || "").trim(),
    slug: String(row.slug || "").trim(),
    market_overview: String(row.market_overview || ""),
    avg_sale_price:
      row.avg_sale_price !== null && row.avg_sale_price !== undefined
        ? Number(row.avg_sale_price)
        : null,
    avg_monthly_rent:
      row.avg_monthly_rent !== null && row.avg_monthly_rent !== undefined
        ? Number(row.avg_monthly_rent)
        : null,
    currency: String(row.currency || "USD").trim().toUpperCase(),
    property_price_trend_pct:
      row.property_price_trend_pct !== null && row.property_price_trend_pct !== undefined
        ? Number(row.property_price_trend_pct)
        : null,
    property_price_trend_dir: row.property_price_trend_dir || null,
    rental_price_trend_pct:
      row.rental_price_trend_pct !== null && row.rental_price_trend_pct !== undefined
        ? Number(row.rental_price_trend_pct)
        : null,
    rental_price_trend_dir: row.rental_price_trend_dir || null,
    investment_insights: String(row.investment_insights || ""),
    market_analysis: String(row.market_analysis || ""),
    data_period: String(row.data_period || ""),
    data_period_type: row.data_period_type || "quarter",
    data_source_name: String(row.data_source_name || ""),
    data_source_url: row.data_source_url || null,
    data_source_type: row.data_source_type || "manual",
    last_verified_at: row.last_verified_at ? String(row.last_verified_at).slice(0, 10) : null,
    cover_image: row.cover_image || null,
    cover_image_alt: row.cover_image_alt || null,
    status: row.status || "draft",
    is_featured: Boolean(row.is_featured),
    seo_title: row.seo_title || null,
    seo_description: row.seo_description || null,
    canonical_url: row.canonical_url || null,
    published_at: row.published_at || null,
    created_by: row.created_by || null,
    created_at: row.created_at,
    updated_at: row.updated_at || undefined,
  };
}

async function fetchPublishedGlobalMarketsFromSupabase(
  countrySlug?: string
): Promise<{ reports: GlobalMarketReport[]; schemaPending: boolean }> {
  const sb = getSupabaseRuntime();
  if (!sb) {
    return { reports: [], schemaPending: false };
  }

  const filters = ["status=eq.published", "select=*"];
  if (countrySlug) {
    filters.push(`country_slug=eq.${encodeURIComponent(countrySlug)}`);
  }
  filters.push("order=is_featured.desc,last_verified_at.desc.nullslast,created_at.desc");
  filters.push("limit=1000");

  const response = await fetch(`${sb.url}/rest/v1/global_markets?${filters.join("&")}`, {
    headers: {
      apikey: sb.anonKey,
      Authorization: `Bearer ${sb.anonKey}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    if (isMissingRelation(response.status, errText)) {
      return { reports: [], schemaPending: true };
    }
    throw new Error(`Supabase global_markets query failed (${response.status})`);
  }

  const rows = (await response.json()) as any[];
  const normalized = (Array.isArray(rows) ? rows : [])
    .map(normalizeServerMarketRow)
    .filter(isMeaningfulMarketReport);

  return { reports: normalized, schemaPending: false };
}

export async function fetchEligibleGlobalMarketsForSitemap(): Promise<GlobalMarketReport[]> {
  try {
    const { reports } = await fetchPublishedGlobalMarketsFromSupabase();
    return reports;
  } catch (err) {
    console.error("[GlobalMarkets Sitemap] Fetch error:", err);
    return [];
  }
}

export async function fetchGlobalMarketCountryForSeo(countrySlug: string) {
  const cleanSlug = slugifyMarketSegment(countrySlug);
  if (!cleanSlug) return null;
  try {
    const { reports } = await fetchPublishedGlobalMarketsFromSupabase(cleanSlug);
    if (reports.length === 0) return null;
    const summaries = aggregateCountrySummaries(reports);
    if (summaries.length === 0) return null;
    return {
      countrySummary: summaries[0],
      primaryReport: pickPrimaryCountryReport(reports),
      allReports: reports,
    };
  } catch (err) {
    console.error("[GlobalMarkets SEO] Country lookup error:", err);
    return null;
  }
}

export async function fetchGlobalMarketReportForSeo(countrySlug: string, reportSlug: string) {
  const cleanCountrySlug = slugifyMarketSegment(countrySlug);
  const cleanReportSlug = slugifyMarketSegment(reportSlug);
  if (!cleanCountrySlug || !cleanReportSlug) return null;
  try {
    const { reports } = await fetchPublishedGlobalMarketsFromSupabase(cleanCountrySlug);
    const found = reports.find((r) => slugifyMarketSegment(r.slug) === cleanReportSlug);
    return found || null;
  } catch (err) {
    console.error("[GlobalMarkets SEO] Report lookup error:", err);
    return null;
  }
}

async function verifyAdminOrEditorBearer(req: express.Request): Promise<{
  ok: boolean;
  status?: number;
  error?: string;
}> {
  const sb = getSupabaseRuntime();
  if (!sb) return { ok: true };

  const authHeader = (req.headers.authorization || "").toString().trim();
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    return { ok: false, status: 401, error: "Authentication token is required." };
  }

  try {
    const userRes = await fetch(`${sb.url}/auth/v1/user`, {
      headers: {
        apikey: sb.anonKey,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!userRes.ok) {
      return { ok: false, status: 401, error: "Editorial session expired." };
    }
    const userData = (await userRes.json()) as { id?: string };
    if (!userData?.id) {
      return { ok: false, status: 401, error: "Invalid user session." };
    }

    const dbKey = sb.serviceRoleKey || token;
    const profileRes = await fetch(
      `${sb.url}/rest/v1/profiles?id=eq.${encodeURIComponent(userData.id)}&select=id,roles(name)&limit=1`,
      {
        headers: {
          apikey: sb.anonKey,
          Authorization: `Bearer ${dbKey}`,
        },
      }
    );
    if (!profileRes.ok) {
      return { ok: false, status: 403, error: "Unable to verify role permissions." };
    }
    const rows = (await profileRes.json()) as Array<{ roles?: { name?: string } }>;
    const roleName = rows?.[0]?.roles?.name;
    if (roleName !== "admin" && roleName !== "editor") {
      return { ok: false, status: 403, error: "Administrator or Editor permissions are required." };
    }
    return { ok: true };
  } catch {
    return { ok: false, status: 500, error: "Authentication verification failed." };
  }
}

async function tryFetchBisLatestYoY(isoCode: string): Promise<{
  period: string;
  yoyPct: number;
  sourceUrl: string;
} | null> {
  if (!/^[A-Z]{2}$/.test(isoCode)) return null;
  // BIS Selected Residential Property Prices (WS_SPP): Q.{REF_AREA}.N.628 = Nominal, All residential, Year-on-year % change (unit 628)
  const sdmxUrl = `https://stats.bis.org/api/v1/data/WS_SPP/Q.${encodeURIComponent(isoCode)}.N.628?lastNObservations=1&detail=dataonly`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(sdmxUrl, {
      headers: { Accept: "application/vnd.sdmx.data+json;version=1.0.0, application/json" },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as any;
    const seriesMap = json?.data?.dataSets?.[0]?.series;
    const timeValues = json?.data?.structure?.dimensions?.observation?.find(
      (d: any) => d.id === "TIME_PERIOD"
    )?.values;

    if (!seriesMap || !Array.isArray(timeValues) || timeValues.length === 0) {
      return null;
    }

    const firstSeriesKey = Object.keys(seriesMap)[0];
    const observations = firstSeriesKey ? seriesMap[firstSeriesKey]?.observations : null;
    if (!observations) return null;

    const obsKeys = Object.keys(observations);
    if (obsKeys.length === 0) return null;

    const lastIdxStr = obsKeys[obsKeys.length - 1];
    const lastObs = observations[lastIdxStr];
    const val = Array.isArray(lastObs) ? Number(lastObs[0]) : NaN;
    const periodId = timeValues[Number(lastIdxStr)]?.id || timeValues[0]?.id;

    if (!Number.isFinite(val) || !periodId) return null;

    return {
      period: String(periodId).replace("-", " "),
      yoyPct: Number(val.toFixed(2)),
      sourceUrl: `https://data.bis.org/topics/RPP`,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export function registerGlobalMarketsRoutes(app: express.Express) {
  app.get("/api/global-markets/countries", async (req, res) => {
    setNoCacheHeaders(res);
    try {
      const { reports, schemaPending } = await fetchPublishedGlobalMarketsFromSupabase();
      const countries = aggregateCountrySummaries(reports);
      return res.status(200).json({ countries, schemaPending });
    } catch (err) {
      console.error("[GlobalMarkets API] Countries error:", err);
      return res.status(502).json({ error: "Unable to load global market intelligence." });
    }
  });

  app.get("/api/global-markets/country/:countrySlug", async (req, res) => {
    setNoCacheHeaders(res);
    const countrySlug = slugifyMarketSegment(req.params.countrySlug);
    if (!countrySlug) {
      return res.status(400).json({ error: "Invalid country slug." });
    }

    try {
      const { reports, schemaPending } = await fetchPublishedGlobalMarketsFromSupabase(countrySlug);
      if (schemaPending) {
        return res.status(404).json({ error: "Global markets data not initialized.", schemaPending: true });
      }
      if (reports.length === 0) {
        return res.status(404).json({ error: "No published market reports found for this country." });
      }

      const summaries = aggregateCountrySummaries(reports);
      if (summaries.length === 0) {
        return res.status(404).json({ error: "No meaningful market intelligence published for this country." });
      }

      const primaryReport = pickPrimaryCountryReport(reports);
      const cityReports = reports.filter(
        (r) => r.id !== primaryReport.id && (r.market_level === "city" || Boolean(r.city_name))
      );

      return res.status(200).json({
        countrySummary: summaries[0],
        primaryReport,
        cityReports,
        allReports: reports,
        schemaPending: false,
      });
    } catch (err) {
      console.error("[GlobalMarkets API] Country detail error:", err);
      return res.status(502).json({ error: "Unable to load country market intelligence." });
    }
  });

  app.get("/api/global-markets/country/:countrySlug/:reportSlug", async (req, res) => {
    setNoCacheHeaders(res);
    const countrySlug = slugifyMarketSegment(req.params.countrySlug);
    const reportSlug = slugifyMarketSegment(req.params.reportSlug);
    if (!countrySlug || !reportSlug) {
      return res.status(400).json({ error: "Invalid market report URL." });
    }

    try {
      const { reports, schemaPending } = await fetchPublishedGlobalMarketsFromSupabase(countrySlug);
      if (schemaPending || reports.length === 0) {
        return res.status(404).json({ error: "Market report not found." });
      }
      const target = reports.find((r) => slugifyMarketSegment(r.slug) === reportSlug);
      if (!target) {
        return res.status(404).json({ error: "Market report not found." });
      }
      const summaries = aggregateCountrySummaries(reports);
      return res.status(200).json({
        countrySummary: summaries[0],
        report: target,
        siblingReports: reports.filter((r) => r.id !== target.id),
        schemaPending: false,
      });
    } catch (err) {
      console.error("[GlobalMarkets API] Report detail error:", err);
      return res.status(502).json({ error: "Unable to load market report." });
    }
  });

  app.post("/api/global-markets/stage-source-draft", async (req, res) => {
    setNoCacheHeaders(res);
    const auth = await verifyAdminOrEditorBearer(req);
    if (!auth.ok) {
      return res.status(auth.status || 401).json({ error: auth.error || "Unauthorized" });
    }

    const body = req.body || {};
    const sourceType = String(body.sourceType || "").trim() as Exclude<
      MarketDataSourceType,
      "manual" | "other_authorized"
    >;
    const rawCountryName = String(body.countryName || "").trim();
    const cityName = String(body.cityName || "").trim();
    const normalized = normalizeCountryInfo(rawCountryName);
    const countryName = normalized?.name || rawCountryName;
    const countryCode = String(body.countryCode || normalized?.code || "")
      .trim()
      .toUpperCase();
    const countrySlug = deriveCountrySlug(countryName);
    const sourceMeta = getAuthorizedDataSourceById(sourceType);

    if (!countryName || !sourceMeta) {
      return res.status(400).json({ error: "Valid country name and authorized source type are required." });
    }

    let fetchedBis: Awaited<ReturnType<typeof tryFetchBisLatestYoY>> = null;
    if (sourceType === "bis" && countryCode && !cityName) {
      fetchedBis = await tryFetchBisLatestYoY(countryCode);
    }

    const targetLabel = cityName ? `${cityName}, ${countryName}` : countryName;
    const trendPct = fetchedBis ? fetchedBis.yoyPct : null;
    const trendDir =
      trendPct === null ? null : trendPct > 0 ? "up" : trendPct < 0 ? "down" : "flat";

    return res.status(200).json({
      success: true,
      draftInput: {
        country_name: countryName,
        country_code: countryCode,
        country_slug: countrySlug,
        city_name: cityName,
        title: `${targetLabel} Residential Market Intelligence Report`,
        slug: slugifyMarketSegment(
          cityName ? `${cityName}-market-report` : `${countrySlug}-market-overview`
        ),
        currency: "USD",
        avg_sale_price: null,
        avg_monthly_rent: null,
        property_price_trend_pct: trendPct,
        property_price_trend_dir: trendDir,
        rental_price_trend_pct: null,
        rental_price_trend_dir: null,
        data_period: fetchedBis?.period || "",
        data_period_type: sourceMeta.defaultPeriodType,
        data_source_type: sourceType,
        data_source_name: sourceMeta.name,
        data_source_url: fetchedBis?.sourceUrl || sourceMeta.officialPortalUrl,
        last_verified_at: new Date().toISOString().slice(0, 10),
        market_overview: "",
        market_analysis: "",
        investment_insights: "",
        status: "draft",
        is_featured: false,
      },
      note: fetchedBis
        ? `Live BIS RPPI series retrieved (${fetchedBis.period}: ${fetchedBis.yoyPct}% YoY) and staged as a Draft. Complete editorial market overview & verify before publishing.`
        : `Attributed Draft staged for ${sourceMeta.shortName}. Enter verified price/rental figures and editorial analysis before publishing.`,
    });
  });
}
