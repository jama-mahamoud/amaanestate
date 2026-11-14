import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { createServer as createViteServer, ViteDevServer } from "vite";
import { SEED_ARTICLE_BY_SLUG, ALL_SEED_EDITORIAL_ARTICLES } from "./src/data/allArticles";
import { normalizeCountryInfo, getCountryQueryVariants } from "./src/lib/countries";
import {
  normalizeArticleSlugInput,
  resolveLegacyArticleRedirectSlug,
} from "./src/lib/legacyRedirects";
import {
  getActiveRedirectSourceSet,
  lookupActiveRedirect,
  registerSeoRoutes,
} from "./server/seoRoutes";

dotenv.config();

let devViteServer: ViteDevServer | null = null;

let activeFilename = "";
let activeDirname = "";

try {
  // @ts-ignore
  if (typeof __filename !== "undefined") {
    // @ts-ignore
    activeFilename = __filename;
  }
} catch (e) {}

try {
  // @ts-ignore
  if (typeof __dirname !== "undefined") {
    // @ts-ignore
    activeDirname = __dirname;
  }
} catch (e) {}

if (!activeFilename && typeof import.meta !== "undefined" && import.meta.url) {
  activeFilename = fileURLToPath(import.meta.url);
}

if (!activeDirname) {
  activeDirname = activeFilename ? path.dirname(activeFilename) : process.cwd();
}

const PORT = 3000;
export const app = express();

app.use(express.json());

app.use((req, res, next) => {
  const rawHost = (req.headers["x-forwarded-host"] || req.headers.host || "").toString().split(",")[0].trim();
  const hostname = rawHost.split(":")[0].toLowerCase();
  if (hostname === "amaanestate.com") {
    return res.redirect(308, `https://www.amaanestate.com${req.originalUrl}`);
  }
  return next();
});

function normalizeCanonicalOrigin(rawUrl?: string | null): string {
  const raw = (rawUrl || "").trim().replace(/\/+$/, "");
  if (!raw) return "https://www.amaanestate.com";
  try {
    const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    if (parsed.hostname === "www.amaanestate.com" || parsed.hostname === "amaanestate.com") {
      return "https://www.amaanestate.com";
    }
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return "https://www.amaanestate.com";
  }
}

const SITE_URL = normalizeCanonicalOrigin(process.env.CANONICAL_SITE_URL || "https://www.amaanestate.com");
const MAX_URLS_PER_SITEMAP = 45000;
const MAX_BYTES_PER_SITEMAP = 45 * 1024 * 1024;

function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

function getCanonicalBaseUrl(reqHost?: string): string {
  if (reqHost && (reqHost.includes("localhost") || reqHost.includes("127.0.0.1"))) {
    return `http://${reqHost}`;
  }
  return SITE_URL;
}

// Helper functions for Open Graph metadata injection & XML escaping
function escapeHtml(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeXml(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function toIsoTimestamp(value?: string | null): string | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString();
}

function maxIsoTimestamp(...values: Array<string | null | undefined>): string | null {
  let maxMs = -1;
  for (const val of values) {
    if (!val) continue;
    const ms = Date.parse(val);
    if (!Number.isNaN(ms) && ms > maxMs) {
      maxMs = ms;
    }
  }
  return maxMs >= 0 ? new Date(maxMs).toISOString() : null;
}

function isValidPublicSlug(slug?: string | null): slug is string {
  if (!slug || typeof slug !== "string") return false;
  const trimmed = slug.trim();
  if (!trimmed || trimmed !== slug) return false;
  if (/[\s/?#\\<>]/.test(trimmed)) return false;
  return true;
}

function resolveAbsoluteImageUrl(imagePath?: string | null, baseUrl = SITE_URL): string {
  if (!imagePath) {
    return `${baseUrl}/images/articles/sovereign-capital-logistics-corridors.jpg`;
  }
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${cleanPath}`;
}

async function fetchArticleForOg(slug: string): Promise<{
  title: string;
  slug: string;
  excerpt?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  featured_image?: string | null;
  og_image?: string | null;
  featured_image_alt?: string | null;
  published_at?: string | null;
  created_at?: string | null;
} | null> {
  const supabaseConfig = getSupabaseConfig();

  if (supabaseConfig) {
    try {
      const nowIso = encodeURIComponent(new Date().toISOString());
      const response = await fetch(
        `${supabaseConfig.url}/rest/v1/articles?slug=eq.${encodeURIComponent(slug)}&status=eq.published&or=(published_at.is.null,published_at.lte.${nowIso})&select=*`,
        {
          headers: {
            apikey: supabaseConfig.anonKey,
            Authorization: `Bearer ${supabaseConfig.anonKey}`,
          },
        }
      );
      if (response.ok) {
        const rows = (await response.json()) as Array<any>;
        if (Array.isArray(rows) && rows.length > 0) {
          return rows[0];
        }
        return null;
      }
    } catch (err) {
      console.error("[OG-SSR] Supabase article lookup error:", err);
    }
  }

  // Fallback to local seed dataset only when Supabase is not configured
  const seed = SEED_ARTICLE_BY_SLUG[slug];
  if (seed) {
    return {
      title: seed.title,
      slug: seed.slug,
      excerpt: seed.excerpt,
      seo_title: seed.seo_title,
      seo_description: seed.seo_description,
      featured_image: seed.featured_image,
      og_image: seed.featured_image,
      featured_image_alt: seed.featured_image_alt,
      published_at: seed.published_at,
    };
  }

  return null;
}

function getIndexTemplateHtml(): string {
  const isProdOrVercel =
    (process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL)) && !devViteServer;
  const distHtmlPath = path.join(process.cwd(), "dist", "index.html");
  const rootHtmlPath = path.join(process.cwd(), "index.html");

  if (isProdOrVercel && fs.existsSync(distHtmlPath)) {
    return fs.readFileSync(distHtmlPath, "utf-8");
  }
  if (fs.existsSync(rootHtmlPath)) {
    return fs.readFileSync(rootHtmlPath, "utf-8");
  }
  if (fs.existsSync(distHtmlPath)) {
    return fs.readFileSync(distHtmlPath, "utf-8");
  }
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8" /></head><body><div id="root"></div></body></html>`;
}

function stripSeoHeadTags(templateHtml: string): string {
  return templateHtml
    .replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\s+[^>]*name=["']description["'][^>]*>/gi, "")
    .replace(/<meta\s+[^>]*name=["']robots["'][^>]*>/gi, "")
    .replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi, "")
    .replace(/<meta\s+[^>]*property=["']og:[^"']*["'][^>]*>/gi, "")
    .replace(/<meta\s+[^>]*name=["']twitter:[^"']*["'][^>]*>/gi, "");
}

async function injectArticleOgMetadata(
  templateHtml: string,
  article: any,
  reqHost?: string
): Promise<string> {
  const baseUrl = getCanonicalBaseUrl(reqHost);

  const selfCanonicalUrl = `${baseUrl}/articles/${encodeURIComponent(article.slug)}`;
  const customCanonical =
    typeof article.canonical_url === "string" && /^https?:\/\//i.test(article.canonical_url.trim())
      ? article.canonical_url.trim()
      : null;
  const canonicalUrl = customCanonical || selfCanonicalUrl;
  const robotsContent =
    typeof article.robots_directive === "string" && article.robots_directive.trim()
      ? article.robots_directive.trim()
      : "index, follow";

  const rawTitle = article.seo_title || article.title;
  const pageTitle = /amaan\s*estate/i.test(rawTitle) ? rawTitle : `${rawTitle} | AmaanEstate`;
  const rawDescription =
    article.seo_description ||
    article.excerpt ||
    "Explore global real estate news, housing market research, property investment insights, market trends and property listings with AmaanEstate.";
  const cleanDescription = stripHtml(rawDescription).slice(0, 180);

  const rawImage = article.og_image || article.featured_image;
  const absoluteImageUrl = resolveAbsoluteImageUrl(rawImage, baseUrl);
  const imageAlt = article.featured_image_alt || article.title;
  const publishedTime = article.published_at || article.created_at || new Date().toISOString();

  let hreflangTags = "";
  if (
    typeof article.alternate_language === "string" &&
    article.alternate_language.trim() &&
    typeof article.alternate_article_slug === "string" &&
    article.alternate_article_slug.trim()
  ) {
    const altArticle = await fetchArticleForOg(article.alternate_article_slug.trim());
    if (altArticle) {
      const altLang = article.alternate_language.trim().toLowerCase();
      const selfLang = altLang === "en" ? "so" : "en";
      const altHref = `${baseUrl}/articles/${encodeURIComponent(altArticle.slug)}`;
      const xDefaultHref = selfLang === "en" ? selfCanonicalUrl : altHref;
      hreflangTags = `
    <link rel="alternate" hreflang="${escapeHtml(selfLang)}" href="${escapeHtml(selfCanonicalUrl)}" data-amaan-hreflang="true" />
    <link rel="alternate" hreflang="${escapeHtml(altLang)}" href="${escapeHtml(altHref)}" data-amaan-hreflang="true" />
    <link rel="alternate" hreflang="x-default" href="${escapeHtml(xDefaultHref)}" data-amaan-hreflang="true" />`;
    }
  }

  const metadataHtml = `
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(cleanDescription)}" />
    <meta name="robots" content="${escapeHtml(robotsContent)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />${hreflangTags}

    <!-- Open Graph / Facebook / WhatsApp / LinkedIn -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="AmaanEstate" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(cleanDescription)}" />
    <meta property="og:image" content="${escapeHtml(absoluteImageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />
    <meta property="article:published_time" content="${escapeHtml(publishedTime)}" />

    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@amaanestate" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(cleanDescription)}" />
    <meta name="twitter:image" content="${escapeHtml(absoluteImageUrl)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />
  `;

  const cleanHtml = stripSeoHeadTags(templateHtml);
  return cleanHtml.replace("</head>", `${metadataHtml}\n  </head>`);
}

function injectNotFoundMetadata(
  templateHtml: string,
  options?: { title?: string; description?: string }
): string {
  const title = options?.title || "Page Not Found (404) | AmaanEstate";
  const description =
    options?.description ||
    "The requested page or article could not be found on AmaanEstate.";
  const metadataHtml = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="noindex, nofollow" />
  `;
  const cleanHtml = stripSeoHeadTags(templateHtml);
  return cleanHtml.replace("</head>", `${metadataHtml}\n  </head>`);
}

function injectSpaRouteMetadata(
  templateHtml: string,
  options: {
    canonicalUrl?: string;
    noIndex?: boolean;
    title?: string;
    description?: string;
  }
): string {
  let html = templateHtml;
  if (options.title) {
    html = html.replace(/<title>[\s\S]*?<\/title>/gi, `<title>${escapeHtml(options.title)}</title>`);
  }
  if (options.description) {
    html = html.replace(
      /<meta\s+[^>]*name=["']description["'][^>]*>/gi,
      `<meta name="description" content="${escapeHtml(options.description)}" />`
    );
  }
  html = html
    .replace(/<meta\s+[^>]*name=["']robots["'][^>]*>/gi, "")
    .replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi, "")
    .replace(/<meta\s+[^>]*property=["']og:url["'][^>]*>/gi, "");

  const tags: string[] = [
    `<meta name="robots" content="${options.noIndex ? "noindex, nofollow" : "index, follow"}" />`,
  ];
  if (options.canonicalUrl && !options.noIndex) {
    tags.push(`<link rel="canonical" href="${escapeHtml(options.canonicalUrl)}" />`);
    tags.push(`<meta property="og:url" content="${escapeHtml(options.canonicalUrl)}" />`);
  }

  return html.replace("</head>", `    ${tags.join("\n    ")}\n  </head>`);
}

async function sendHtmlPage(
  req: express.Request,
  res: express.Response,
  statusCode: number,
  html: string
) {
  let finalHtml = html;
  if (devViteServer) {
    try {
      finalHtml = await devViteServer.transformIndexHtml(req.originalUrl, html);
    } catch (err) {
      console.error("[Vite] transformIndexHtml error:", err);
    }
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(statusCode).send(finalHtml);
}

// Health Check (plus safe local-only boolean readiness verification when ?verify_seo=1)
app.get("/api/health", async (req, res) => {
  const supabaseConfig = getSupabaseConfig();
  const basePayload = {
    status: "healthy",
    app: "AmaanEstate — Global Real Estate Media, Research & Marketplace",
    supabaseConfigured: Boolean(supabaseConfig),
    timestamp: new Date().toISOString(),
  };

  const isLoopback =
    req.hostname === "127.0.0.1" ||
    req.hostname === "localhost" ||
    req.ip === "127.0.0.1" ||
    req.ip === "::1" ||
    req.ip === "::ffff:127.0.0.1";

  if (req.query.verify_seo === "1" && isLoopback) {
    const envFlags = {
      GOOGLE_OAUTH_CLIENT_ID: Boolean((process.env.GOOGLE_OAUTH_CLIENT_ID || "").trim()),
      GOOGLE_OAUTH_CLIENT_SECRET: Boolean((process.env.GOOGLE_OAUTH_CLIENT_SECRET || "").trim()),
      SUPABASE_SERVICE_ROLE_KEY: Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()),
      GEMINI_API_KEY: Boolean((process.env.GEMINI_API_KEY || "").trim()),
      APP_URL: Boolean((process.env.APP_URL || "").trim()),
      CANONICAL_SITE_URL: Boolean((process.env.CANONICAL_SITE_URL || "").trim()),
      VITE_SUPABASE_URL: Boolean((process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").trim()),
      VITE_SUPABASE_ANON_KEY: Boolean((process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim()),
      configuredCallbackUrl: `${(
        process.env.APP_URL ||
        process.env.CANONICAL_SITE_URL ||
        "https://www.amaanestate.com"
      )
        .trim()
        .replace(/\/+$/, "")}/api/seo/gsc/callback`,
    };

    const schemaCheck: Record<string, boolean | string> = {};
    if (supabaseConfig) {
      const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim() || supabaseConfig.anonKey;
      const headers = { apikey: supabaseConfig.anonKey, Authorization: `Bearer ${key}` };
      const checkEndpoint = async (label: string, pathQuery: string) => {
        try {
          const r = await fetch(`${supabaseConfig.url}/rest/v1/${pathQuery}`, { headers });
          if (r.ok) {
            schemaCheck[label] = true;
          } else {
            const txt = await r.text().catch(() => "");
            schemaCheck[label] = txt.includes("42P01") || txt.includes("42703") || txt.includes("PGRST205") || txt.includes("PGRST204")
              ? false
              : `http_${r.status}`;
          }
        } catch {
          schemaCheck[label] = "network_error";
        }
      };

      await Promise.all([
        checkEndpoint(
          "articles_seo_columns",
          "articles?select=id,featured_image_alt,focus_keyword,supporting_keywords,search_intent,target_country,target_audience,canonical_url,robots_directive,schema_type,alternate_language,alternate_article_slug,seo_score,seo_analysis_json,last_seo_analyzed_at&limit=0"
        ),
        checkEndpoint("seo_redirects", "seo_redirects?select=id&limit=0"),
        checkEndpoint("seo_audit_runs", "seo_audit_runs?select=id&limit=0"),
        checkEndpoint("gsc_connections", "gsc_connections?select=id&limit=0"),
        checkEndpoint("gsc_analytics_cache", "gsc_analytics_cache?select=id&limit=0"),
      ]);
    }

    return res.json({
      ...basePayload,
      envFlags,
      schemaCheck,
    });
  }

  return res.json(basePayload);
});

// Register Rank Math-level SEO, AI Optimization, Redirect Manager, Audit & Google Search Console Routes
registerSeoRoutes(app);

// Direct file attachment download for 004_editorial_25_articles.sql
app.get("/004_editorial_25_articles.sql", (req, res) => {
  const filePath = path.join(process.cwd(), "supabase", "migrations", "004_editorial_25_articles.sql");
  res.download(filePath, "004_editorial_25_articles.sql");
});

function setNoCacheSeoHeaders(res: express.Response) {
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=0, must-revalidate");
  res.setHeader("Vercel-CDN-Cache-Control", "max-age=0, must-revalidate");
}

// Robots.txt (both root and /api)
function buildRobotsTxt(baseUrl = SITE_URL): string {
  return [
    "User-agent: Mediapartners-Google",
    "Allow: /",
    "",
    "User-agent: Google-Display-Ads-Bot",
    "Allow: /",
    "",
    "User-agent: Googlebot",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /admin/",
    "Disallow: /account",
    "Disallow: /auth",
    "Disallow: /login",
    "Disallow: /register",
    "Disallow: /search",
    "",
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /admin/",
    "Disallow: /account",
    "Disallow: /auth",
    "Disallow: /login",
    "Disallow: /register",
    "Disallow: /search",
    "",
    `Sitemap: ${baseUrl}/sitemap.xml`,
  ].join("\n");
}

app.get(["/robots.txt", "/api/robots.txt"], (req, res) => {
  setNoCacheSeoHeaders(res);
  const baseUrl = getCanonicalBaseUrl(req.headers.host);
  res.type("text/plain; charset=utf-8").status(200).send(buildRobotsTxt(baseUrl));
});

interface SitemapCategoryRow {
  id: string;
  slug: string;
  updated_at?: string | null;
  created_at?: string | null;
}

interface SitemapArticleRow {
  slug: string;
  status?: string | null;
  category_id?: string | null;
  robots_directive?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
}

export interface SitemapUrlEntry {
  loc: string;
  lastmod: string | null;
}

async function fetchCategoriesFromSupabase(config: { url: string; anonKey: string }): Promise<SitemapCategoryRow[]> {
  const pageSize = 1000;
  let offset = 0;
  const allRows: SitemapCategoryRow[] = [];

  while (true) {
    const endpoint = `${config.url}/rest/v1/categories?select=id,slug,updated_at,created_at&order=display_order.asc,id.asc&limit=${pageSize}&offset=${offset}`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase categories query failed (${response.status})`);
    }

    const rows = (await response.json()) as SitemapCategoryRow[];
    if (!Array.isArray(rows) || rows.length === 0) break;

    for (const row of rows) {
      if (isValidPublicSlug(row.slug)) {
        allRows.push(row);
      }
    }

    if (rows.length < pageSize) break;
    offset += pageSize;
  }

  return allRows;
}

async function fetchEligibleArticlesFromSupabase(config: { url: string; anonKey: string }): Promise<SitemapArticleRow[]> {
  const pageSize = 1000;
  let offset = 0;
  const nowMs = Date.now();
  const nowIso = encodeURIComponent(new Date(nowMs).toISOString());
  const allRows: SitemapArticleRow[] = [];
  let includeRobotsDirective = true;

  while (true) {
    const selectCols = includeRobotsDirective
      ? "slug,status,category_id,robots_directive,published_at,updated_at,created_at"
      : "slug,status,category_id,published_at,updated_at,created_at";
    const endpoint = `${config.url}/rest/v1/articles?select=${selectCols}&status=eq.published&or=(published_at.is.null,published_at.lte.${nowIso})&order=published_at.desc.nullslast,id.asc&limit=${pageSize}&offset=${offset}`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
      },
    });

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      if (includeRobotsDirective && (bodyText.includes("42703") || bodyText.includes("robots_directive"))) {
        includeRobotsDirective = false;
        continue;
      }
      throw new Error(`Supabase articles query failed (${response.status})`);
    }

    const rows = (await response.json()) as SitemapArticleRow[];
    if (!Array.isArray(rows) || rows.length === 0) break;

    for (const row of rows) {
      if (row.status !== "published") continue;
      if (!isValidPublicSlug(row.slug)) continue;
      if ((row.robots_directive || "").toLowerCase().startsWith("noindex")) continue;
      if (row.published_at) {
        const pubMs = Date.parse(row.published_at);
        if (!Number.isNaN(pubMs) && pubMs > nowMs) continue;
      }
      allRows.push(row);
    }

    if (rows.length < pageSize) break;
    offset += pageSize;
  }

  return allRows;
}

async function fetchEligiblePropertiesForSitemap(
  config: { url: string; anonKey: string }
): Promise<Array<{ slug: string; published_at?: string | null; updated_at?: string | null; created_at?: string | null }>> {
  const endpoint = `${config.url}/rest/v1/properties?select=slug,published_at,updated_at,created_at&publication_status=eq.published&listing_status=in.(available,pending,under_contract)&source_name=neq.showcase_sample&order=published_at.desc.nullslast,id.asc&limit=1000`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (response.status === 404 || body.includes("PGRST205") || body.includes("42P01")) {
      return [];
    }
    throw new Error(`Supabase properties sitemap query failed (${response.status})`);
  }

  const rows = (await response.json()) as Array<{
    slug: string;
    published_at?: string | null;
    updated_at?: string | null;
    created_at?: string | null;
  }>;
  if (!Array.isArray(rows)) return [];
  return rows.filter((row) => isValidPublicSlug(row.slug));
}

export async function collectSitemapEntries(baseUrl = SITE_URL): Promise<SitemapUrlEntry[]> {
  const supabaseConfig = getSupabaseConfig();
  let categories: SitemapCategoryRow[] = [];
  let articles: SitemapArticleRow[] = [];
  let properties: Array<{ slug: string; published_at?: string | null; updated_at?: string | null; created_at?: string | null }> = [];

  if (supabaseConfig) {
    [categories, articles, properties] = await Promise.all([
      fetchCategoriesFromSupabase(supabaseConfig),
      fetchEligibleArticlesFromSupabase(supabaseConfig),
      fetchEligiblePropertiesForSitemap(supabaseConfig),
    ]);
  } else {
    // Local fallback ONLY when Supabase credentials are not configured
    categories = [
      { id: "cat-investment", slug: "investment" },
      { id: "cat-architecture", slug: "architecture" },
      { id: "cat-construction", slug: "construction" },
      { id: "cat-home-living", slug: "home-living" },
      { id: "cat-news", slug: "news" },
    ];
    articles = ALL_SEED_EDITORIAL_ARTICLES.filter((art) => isValidPublicSlug(art.slug)).map((art) => ({
      slug: art.slug,
      status: "published",
      category_id: `cat-${art.category_slug}`,
      published_at: art.published_at,
      updated_at: art.published_at,
      created_at: art.published_at,
    }));
  }

  // Track latest content timestamp overall & per category from actual database dates
  const categoryLatestArticleMap = new Map<string, string>();
  let latestSiteArticleTimestamp: string | null = null;

  for (const art of articles) {
    const artLastMod = toIsoTimestamp(art.updated_at || art.published_at || art.created_at);
    if (!artLastMod) continue;

    latestSiteArticleTimestamp = maxIsoTimestamp(latestSiteArticleTimestamp, artLastMod);
    if (art.category_id) {
      const prevCatTs = categoryLatestArticleMap.get(art.category_id);
      const nextCatTs = maxIsoTimestamp(prevCatTs, artLastMod);
      if (nextCatTs) categoryLatestArticleMap.set(art.category_id, nextCatTs);
    }
  }

  const activeRedirectSources = await getActiveRedirectSourceSet().catch(() => new Set<string>());
  const dedupedUrls = new Map<string, string | null>();
  const addUrl = (urlPath: string, lastmod: string | null = null) => {
    const cleanPath = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
    if (cleanPath !== "/" && activeRedirectSources.has(cleanPath.toLowerCase())) {
      return;
    }
    const fullLoc = cleanPath === "/" ? `${baseUrl}/` : `${baseUrl}${cleanPath}`;
    const existing = dedupedUrls.get(fullLoc);
    if (existing === undefined) {
      dedupedUrls.set(fullLoc, lastmod);
    } else if (lastmod) {
      const merged = maxIsoTimestamp(existing, lastmod);
      dedupedUrls.set(fullLoc, merged);
    }
  };

  // 1. Homepage (lastmod reflects newest published/updated article in CMS)
  addUrl("/", latestSiteArticleTimestamp);

  // 2. Dynamic Public Category Pages from Database
  const reservedStaticSlugs = new Set([
    "buy",
    "rent",
    "properties",
    "about",
    "contact",
    "editorial-policy",
    "corrections-policy",
    "privacy-policy",
    "cookie-policy",
    "advertising-disclosure",
    "terms",
    "newsletter",
    "search",
    "admin",
    "account",
    "login",
    "register",
    "auth",
    "articles",
    "category",
    "api",
  ]);

  for (const cat of categories) {
    if (reservedStaticSlugs.has(cat.slug)) continue;
    const catLastMod = maxIsoTimestamp(
      toIsoTimestamp(cat.updated_at || cat.created_at),
      categoryLatestArticleMap.get(cat.id)
    );
    addUrl(`/${encodeURIComponent(cat.slug)}`, catLastMod);
  }

  // 3. Indexable Static Editorial, Marketplace & Policy Pages
  const publicEditorialPaths = [
    "/buy",
    "/rent",
    "/about",
    "/contact",
    "/editorial-policy",
    "/corrections-policy",
    "/privacy-policy",
    "/cookie-policy",
    "/advertising-disclosure",
    "/terms",
    "/newsletter",
  ];
  for (const staticPath of publicEditorialPaths) {
    addUrl(staticPath, null);
  }

  // 4. All Eligible Published Articles from Database
  for (const art of articles) {
    const artLastMod = toIsoTimestamp(art.updated_at || art.published_at || art.created_at);
    addUrl(`/articles/${encodeURIComponent(art.slug)}`, artLastMod);
  }

  // 5. All Eligible Published Properties from Database
  for (const prop of properties) {
    const propLastMod = toIsoTimestamp(prop.updated_at || prop.published_at || prop.created_at);
    addUrl(`/properties/${encodeURIComponent(prop.slug)}`, propLastMod);
  }

  return Array.from(dedupedUrls.entries()).map(([loc, lastmod]) => ({ loc, lastmod }));
}

// ============================================================================
// Property Marketplace Express API Endpoints (/api/properties*)
// ============================================================================

const ALLOWED_PROPERTY_TYPES = new Set([
  "house",
  "apartment",
  "villa",
  "townhouse",
  "condominium",
  "land",
  "other",
]);
const ALLOWED_PUBLIC_LISTING_STATUSES = new Set(["available", "pending", "under_contract"]);
const ALLOWED_RENTAL_PERIODS = new Set(["month", "year", "week"]);
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const enquiryIpHistory = new Map<string, number[]>();
const recentDuplicateEnquiries = new Map<string, number>();

function isMissingRelationError(status: number, bodyText: string): boolean {
  return (
    status === 404 ||
    bodyText.includes("PGRST205") ||
    bodyText.includes("42P01") ||
    bodyText.includes("does not exist")
  );
}

function sanitizeSearchTerm(raw: string): string {
  return raw.trim().replace(/[(),%*]/g, " ").replace(/\s+/g, " ").trim();
}

const SHOWCASE_PROPERTIES_SEED = [
  {
    id: "a0000001-0000-0000-0000-000000000001",
    title: "The Sky Glass Penthouse at Dubai Marina",
    slug: "the-sky-glass-penthouse-dubai-marina",
    transaction_type: "sale",
    property_type: "apartment",
    listing_status: "available",
    publication_status: "published",
    price: 4850000,
    currency: "USD",
    rental_period: null,
    available_from: null,
    bedrooms: 4,
    bathrooms: 5,
    area_value: 5800,
    area_unit: "sqft",
    address_line: "Al Marsa Street, Dubai Marina",
    city: "Dubai",
    state_region: "Dubai",
    country: "United Arab Emirates",
    postal_code: "00000",
    latitude: 25.0772,
    longitude: 55.1384,
    description: `A masterclass in modern skyward living, this contemporary duplex penthouse showcases sweeping panoramic vistas of the Arabian Gulf and the illuminated Dubai Marina skyline.\n\nDesigned with double-height volume, seamless slabs of honed travertine, and acoustic floor-to-ceiling glass envelopes, the residence bridges dramatic scale with intimate residential craftsmanship. Features include an Italian marble show kitchen, bespoke recessed circadian lighting, private lift access, and an expansive cantilevered sunset loggia ideal for year-round entertaining.\n\nNote: This presentation is an illustrative architectural sample for platform demonstration purposes and is not an active real estate listing.`,
    features: [
      "Double-height ceiling gallery",
      "Panoramic water and skyline terrace",
      "Honed travertine limestone interior",
      "Private high-speed keycard elevator access",
      "Chef show kitchen with Gaggenau appliances",
      "Acoustic double-glazed curtain walls",
      "24-hour concierge and valet services",
    ],
    is_featured: true,
    agent_name: null,
    agent_phone: null,
    brokerage_name: null,
    source_name: "showcase_sample",
    source_listing_id: "SHOWCASE-DXB-01",
    source_url: null,
    raw_payload: { is_sample: true, showcase: true },
    published_at: "2026-03-01T08:00:00Z",
    created_at: "2026-03-01T08:00:00Z",
    updated_at: "2026-03-01T08:00:00Z",
    property_images: [
      {
        id: "b0000001-0000-0000-0000-000000000001",
        property_id: "a0000001-0000-0000-0000-000000000001",
        image_url: "/images/properties/dubai-marina-penthouse.jpg",
        alt_text: "Contemporary luxury high-rise duplex penthouse in Dubai Marina with double-height glass and skyline views",
        display_order: 0,
        is_primary: true,
        created_at: "2026-03-01T08:00:00Z",
      },
    ],
  },
  {
    id: "a0000002-0000-0000-0000-000000000002",
    title: "The Kensington Modern Townhouse",
    slug: "the-kensington-modern-townhouse-london",
    transaction_type: "sale",
    property_type: "townhouse",
    listing_status: "available",
    publication_status: "published",
    price: 6400000,
    currency: "GBP",
    rental_period: null,
    available_from: null,
    bedrooms: 5,
    bathrooms: 4.5,
    area_value: 4400,
    area_unit: "sqft",
    address_line: "Kensington Church Street Corridor",
    city: "London",
    state_region: "Greater London",
    country: "United Kingdom",
    postal_code: "W8",
    latitude: 51.5025,
    longitude: -0.1917,
    description: `Set along a tranquil residential terrace in Kensington, this newly re-engineered Georgian-proportioned townhouse celebrates classic British brick masonry paired with refined contemporary bronze detailing and internal spatial clarity.\n\nArranged over five refined levels, the residence integrates a sunlit lower garden floor with polished concrete and Crittall-style glazing opening directly to a private walled garden. The upper floors accommodate four ensuite guest suites and an expansive full-floor primary retreat complete with bespoke dressing millwork and freestanding sculptural stone bath.\n\nNote: This presentation is an illustrative architectural sample for platform demonstration purposes and is not an active real estate listing.`,
    features: [
      "Restored bespoke brick & Portland stone facade",
      "Private landscaped English walled garden",
      "Full-floor primary suite with custom joinery",
      "Integrated passive climate ventilation and heat pump",
      "Bespoke bronze metalwork and balustrades",
      "Wine cellar and dedicated garden office",
    ],
    is_featured: true,
    agent_name: null,
    agent_phone: null,
    brokerage_name: null,
    source_name: "showcase_sample",
    source_listing_id: "SHOWCASE-LDN-02",
    source_url: null,
    raw_payload: { is_sample: true, showcase: true },
    published_at: "2026-03-02T08:00:00Z",
    created_at: "2026-03-02T08:00:00Z",
    updated_at: "2026-03-02T08:00:00Z",
    property_images: [
      {
        id: "b0000002-0000-0000-0000-000000000002",
        property_id: "a0000002-0000-0000-0000-000000000002",
        image_url: "/images/properties/london-kensington-townhouse.jpg",
        alt_text: "Elegant modern brick and limestone townhouse in Kensington London with bronze entrance details",
        display_order: 0,
        is_primary: true,
        created_at: "2026-03-02T08:00:00Z",
      },
    ],
  },
  {
    id: "a0000003-0000-0000-0000-000000000003",
    title: "The Ravine Cedar Residence in Forest Hill",
    slug: "the-ravine-cedar-residence-toronto",
    transaction_type: "sale",
    property_type: "house",
    listing_status: "available",
    publication_status: "published",
    price: 4950000,
    currency: "CAD",
    rental_period: null,
    available_from: null,
    bedrooms: 5,
    bathrooms: 6,
    area_value: 6200,
    area_unit: "sqft",
    address_line: "Forest Hill North Ravine Path",
    city: "Toronto",
    state_region: "Ontario",
    country: "Canada",
    postal_code: "M5P",
    latitude: 43.7011,
    longitude: -79.4163,
    description: `A benchmark for biophilic family living in Toronto, this contemporary detached home sits thoughtfully against a protected mature tree canopy. The exterior is composed of horizontal Western red cedar slats, smooth Indiana limestone blocks, and oversized triple-glazed floor-to-ceiling curtain glass.\n\nInside, light flows across wide-plank white oak flooring and raw architectural concrete focal walls. Designed for modern multi-generational comfort, the floorplan features radiant in-floor heating throughout, a custom Scandinavian sauna, gym, and an open-concept living pavilion opening to a stone terrace and landscaped autumn garden.\n\nNote: This presentation is an illustrative architectural sample for platform demonstration purposes and is not an active real estate listing.`,
    features: [
      "Western red cedar and smooth limestone exterior",
      "Mature ravine backdrop and private stone patio",
      "Triple-pane high-efficiency architectural glass",
      "Hydronic radiant in-floor heating system",
      "Custom Finnish cedar sauna and wellness suite",
      "Double car garage with EV charging infrastructure",
    ],
    is_featured: true,
    agent_name: null,
    agent_phone: null,
    brokerage_name: null,
    source_name: "showcase_sample",
    source_listing_id: "SHOWCASE-TOR-03",
    source_url: null,
    raw_payload: { is_sample: true, showcase: true },
    published_at: "2026-03-03T08:00:00Z",
    created_at: "2026-03-03T08:00:00Z",
    updated_at: "2026-03-03T08:00:00Z",
    property_images: [
      {
        id: "b0000003-0000-0000-0000-000000000003",
        property_id: "a0000003-0000-0000-0000-000000000003",
        image_url: "/images/properties/toronto-forest-hill-residence.jpg",
        alt_text: "Contemporary detached family residence in Toronto featuring cedar slats, limestone walls, and landscaped garden",
        display_order: 0,
        is_primary: true,
        created_at: "2026-03-03T08:00:00Z",
      },
    ],
  },
  {
    id: "a0000004-0000-0000-0000-000000000004",
    title: "The Ubud Jungle Reflection Villa",
    slug: "the-ubud-jungle-reflection-villa-bali",
    transaction_type: "rent",
    property_type: "villa",
    listing_status: "available",
    publication_status: "published",
    price: 6500,
    currency: "USD",
    rental_period: "month",
    available_from: "2026-04-01",
    bedrooms: 3,
    bathrooms: 3.5,
    area_value: 4100,
    area_unit: "sqft",
    address_line: "Sayan Ridge Valley, Ubud",
    city: "Bali",
    state_region: "Bali",
    country: "Indonesia",
    postal_code: "80571",
    latitude: -8.5069,
    longitude: 115.2625,
    description: `Immersed in the terraced emerald hills above Ubud, this private architectural sanctuary demonstrates contemporary tropical modernism at its most poetic. Hand-hewn volcanic basalt walls, reclaimed ironwood framing, and open-air pavilions celebrate the surrounding jungle microclimate.\n\nThe heart of the villa is an elongated black-granite infinity reflection pool that mirrors the canopy and morning mist. Each autonomous pavilion suite offers outdoor open-air garden rain showers, polished terrazzo vanities, and natural ventilation designed to harmonize comfort with the tropical environment.\n\nNote: This presentation is an illustrative architectural sample for platform demonstration purposes and is not an active real estate listing.`,
    features: [
      "20-meter black granite infinity reflection pool",
      "Open-air living and dining bale with reclaimed teak",
      "Volcanic basalt masonry and polished terrazzo floors",
      "Autonomous guest suites with tropical outdoor showers",
      "High-speed fiber connectivity and dedicated workspace",
      "Full estate housekeeping and grounds maintenance",
    ],
    is_featured: true,
    agent_name: null,
    agent_phone: null,
    brokerage_name: null,
    source_name: "showcase_sample",
    source_listing_id: "SHOWCASE-DPS-04",
    source_url: null,
    raw_payload: { is_sample: true, showcase: true },
    published_at: "2026-03-04T08:00:00Z",
    created_at: "2026-03-04T08:00:00Z",
    updated_at: "2026-03-04T08:00:00Z",
    property_images: [
      {
        id: "b0000004-0000-0000-0000-000000000004",
        property_id: "a0000004-0000-0000-0000-000000000004",
        image_url: "/images/properties/bali-ubud-tropical-villa.jpg",
        alt_text: "Private tropical modern villa in Ubud Bali with volcanic stone walls and infinity reflection pool overlooking the jungle",
        display_order: 0,
        is_primary: true,
        created_at: "2026-03-04T08:00:00Z",
      },
    ],
  },
];

function sanitizePublicProperty(row: any) {
  const images = Array.isArray(row.property_images)
    ? [...row.property_images].sort((a, b) => {
        if (Boolean(a.is_primary) !== Boolean(b.is_primary)) {
          return a.is_primary ? -1 : 1;
        }
        return (Number(a.display_order) || 0) - (Number(b.display_order) || 0);
      })
    : Array.isArray(row.images)
    ? row.images
    : [];

  const isSample =
    row.source_name === "showcase_sample" ||
    row.source_name === "illustrative_sample" ||
    Boolean(row.raw_payload?.is_sample) ||
    Boolean(row.is_sample);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    transaction_type: row.transaction_type,
    property_type: row.property_type,
    listing_status: row.listing_status,
    publication_status: row.publication_status,
    price: Number(row.price) || 0,
    currency: row.currency || "USD",
    rental_period: row.rental_period || null,
    available_from: row.available_from || null,
    bedrooms: row.bedrooms !== null && row.bedrooms !== undefined ? Number(row.bedrooms) : null,
    bathrooms: row.bathrooms !== null && row.bathrooms !== undefined ? Number(row.bathrooms) : null,
    area_value: row.area_value !== null && row.area_value !== undefined ? Number(row.area_value) : null,
    area_unit: row.area_unit || "sqft",
    address_line: row.address_line || null,
    city: row.city,
    state_region: row.state_region || null,
    country: row.country,
    postal_code: row.postal_code || null,
    latitude: row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : null,
    longitude: row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : null,
    description: row.description || "",
    features: Array.isArray(row.features) ? row.features : [],
    is_featured: Boolean(row.is_featured),
    agent_name: row.agent_name || null,
    agent_phone: row.agent_phone || null,
    brokerage_name: row.brokerage_name || null,
    source_name: row.source_name || "manual",
    source_listing_id: row.source_listing_id || null,
    source_url: row.source_url || null,
    published_at: row.published_at || null,
    created_at: row.created_at,
    updated_at: row.updated_at || null,
    is_sample: isSample,
    images,
  };
}

function parseContentRangeTotal(contentRange: string | null, fallbackLength: number): number {
  if (!contentRange) return fallbackLength;
  const slashIndex = contentRange.indexOf("/");
  if (slashIndex === -1) return fallbackLength;
  const totalPart = contentRange.slice(slashIndex + 1).trim();
  const parsed = Number(totalPart);
  return Number.isFinite(parsed) ? parsed : fallbackLength;
}

function setNoCacheApiHeaders(res: express.Response) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");
}

app.get("/api/properties/featured", async (req, res) => {
  setNoCacheApiHeaders(res);
  const supabaseConfig = getSupabaseConfig();
  if (!supabaseConfig) {
    return res.status(200).json({ properties: [], schemaPending: false });
  }

  const transactionType = typeof req.query.transaction_type === "string" ? req.query.transaction_type.trim() : "";
  if (transactionType && transactionType !== "sale" && transactionType !== "rent") {
    return res.status(400).json({ error: "Invalid transaction_type. Expected 'sale' or 'rent'." });
  }

  const rawLimit = Number(req.query.limit || 6);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), 12) : 6;

  try {
    const params = new URLSearchParams();
    params.set("select", "*,property_images(*)");
    params.set("publication_status", "eq.published");
    params.set("listing_status", "in.(available,pending,under_contract)");
    params.set("is_featured", "eq.true");
    if (transactionType) {
      params.set("transaction_type", `eq.${transactionType}`);
    }
    params.set("order", "published_at.desc.nullslast,created_at.desc");
    params.set("limit", String(limit));

    const response = await fetch(`${supabaseConfig.url}/rest/v1/properties?${params.toString()}`, {
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      if (isMissingRelationError(response.status, errText)) {
        return res.status(200).json({ properties: [], schemaPending: true });
      }
      return res.status(502).json({ error: "Unable to load featured properties from database." });
    }

    const rows = (await response.json()) as any[];
    return res.status(200).json({
      properties: Array.isArray(rows) ? rows.map(sanitizePublicProperty) : [],
      schemaPending: false,
    });
  } catch (err) {
    console.error("[Properties API] Featured error:", err);
    return res.status(500).json({ error: "Internal error loading featured properties." });
  }
});

app.get("/api/properties/showcase", async (req, res) => {
  const transactionType =
    typeof req.query.transaction_type === "string" ? req.query.transaction_type.trim() : "";
  const supabaseConfig = getSupabaseConfig();

  if (supabaseConfig) {
    try {
      const params = new URLSearchParams();
      params.set("select", "*,property_images(*)");
      params.set("publication_status", "eq.published");
      params.set("source_name", "eq.showcase_sample");
      if (transactionType) {
        params.set("transaction_type", `eq.${transactionType}`);
      }
      params.set("order", "published_at.desc.nullslast,created_at.desc");

      const response = await fetch(`${supabaseConfig.url}/rest/v1/properties?${params.toString()}`, {
        headers: {
          apikey: supabaseConfig.anonKey,
          Authorization: `Bearer ${supabaseConfig.anonKey}`,
        },
      });

      if (response.ok) {
        const rows = (await response.json()) as any[];
        if (Array.isArray(rows) && rows.length > 0) {
          return res.status(200).json({
            properties: rows.map(sanitizePublicProperty),
            schemaPending: false,
          });
        }
      }
    } catch (err) {
      console.error("[Properties API] Showcase DB lookup fallback:", err);
    }
  }

  // Fallback to showcase seed records
  const filtered = SHOWCASE_PROPERTIES_SEED.filter(
    (p) => !transactionType || p.transaction_type === transactionType
  ).map(sanitizePublicProperty);

  return res.status(200).json({
    properties: filtered,
    schemaPending: false,
  });
});

function isShowcaseOrSampleRow(row: any): boolean {
  if (!row) return false;
  const src = String(row.source_name || "").trim().toLowerCase();
  if (src === "showcase_sample" || src === "illustrative_sample") return true;
  if (row.raw_payload && (row.raw_payload.is_sample === true || row.raw_payload.showcase === true)) {
    return true;
  }
  return Boolean(row.is_sample);
}

export interface AggregatedCountryStat {
  country: string;
  countryCode: string;
  flag: string;
  totalCount: number;
  saleCount: number;
  rentCount: number;
}

export interface PropertyCountryAggregationRow {
  country?: string | null;
  transaction_type?: string | null;
  publication_status?: string | null;
  listing_status?: string | null;
  source_name?: string | null;
  raw_payload?: any;
  is_sample?: boolean | null;
  published_at?: string | null;
  created_at?: string | null;
}

export function aggregatePropertyCountries(
  rows: PropertyCountryAggregationRow[]
): AggregatedCountryStat[] {
  const buckets = new Map<
    string,
    AggregatedCountryStat & { earliestAt: number }
  >();

  if (!Array.isArray(rows)) {
    return [];
  }

  for (const row of rows) {
    if (!row) continue;
    if (isShowcaseOrSampleRow(row)) continue;

    if (row.publication_status !== undefined && row.publication_status !== "published") {
      continue;
    }
    if (
      row.listing_status !== undefined &&
      row.listing_status !== null &&
      !ALLOWED_PUBLIC_LISTING_STATUSES.has(String(row.listing_status).trim())
    ) {
      continue;
    }

    const normalized = normalizeCountryInfo(row.country);
    if (!normalized) continue;

    const key = normalized.code || normalized.name.toLowerCase();
    const tsRaw = row.published_at || row.created_at;
    const ts = tsRaw ? Date.parse(tsRaw) : Number.MAX_SAFE_INTEGER;
    const safeTs = Number.isFinite(ts) ? ts : Number.MAX_SAFE_INTEGER;

    const existing = buckets.get(key) || {
      country: normalized.name,
      countryCode: normalized.code,
      flag: normalized.flag,
      totalCount: 0,
      saleCount: 0,
      rentCount: 0,
      earliestAt: safeTs,
    };

    existing.totalCount += 1;
    if (row.transaction_type === "sale") existing.saleCount += 1;
    if (row.transaction_type === "rent") existing.rentCount += 1;
    if (safeTs < existing.earliestAt) existing.earliestAt = safeTs;

    buckets.set(key, existing);
  }

  return Array.from(buckets.values())
    .filter((entry) => entry.totalCount > 0)
    .sort(
      (a, b) =>
        b.totalCount - a.totalCount ||
        a.earliestAt - b.earliestAt ||
        a.country.localeCompare(b.country)
    )
    .map(({ earliestAt: _earliestAt, ...countryStat }) => countryStat);
}

app.get("/api/properties/countries", async (req, res) => {
  setNoCacheApiHeaders(res);
  const supabaseConfig = getSupabaseConfig();
  if (!supabaseConfig) {
    return res.status(200).json({ countries: [], schemaPending: false });
  }

  try {
    const pageSize = 1000;
    const maxPages = 50;
    const allRows: PropertyCountryAggregationRow[] = [];

    for (let page = 0; page < maxPages; page++) {
      const offset = page * pageSize;
      const params = new URLSearchParams();
      params.set(
        "select",
        "country,transaction_type,publication_status,listing_status,source_name,raw_payload,published_at,created_at"
      );
      params.set("publication_status", "eq.published");
      params.set("listing_status", "in.(available,pending,under_contract)");
      params.set("or", "(source_name.is.null,source_name.neq.showcase_sample)");
      params.set("order", "published_at.asc.nullslast,created_at.asc,id.asc");
      params.set("limit", String(pageSize));
      params.set("offset", String(offset));

      const response = await fetch(`${supabaseConfig.url}/rest/v1/properties?${params.toString()}`, {
        headers: {
          apikey: supabaseConfig.anonKey,
          Authorization: `Bearer ${supabaseConfig.anonKey}`,
        },
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        if (isMissingRelationError(response.status, errText)) {
          return res.status(200).json({ countries: [], schemaPending: true });
        }
        return res.status(502).json({ error: "Unable to load international country directory." });
      }

      const batch = (await response.json()) as PropertyCountryAggregationRow[];
      if (!Array.isArray(batch) || batch.length === 0) {
        break;
      }
      allRows.push(...batch);
      if (batch.length < pageSize) {
        break;
      }
    }

    const countries = aggregatePropertyCountries(allRows);
    return res.status(200).json({ countries, schemaPending: false });
  } catch (err) {
    console.error("[Properties API] Countries error:", err);
    return res.status(500).json({ error: "Internal error loading property countries." });
  }
});

app.get("/api/properties/locations", async (req, res) => {
  setNoCacheApiHeaders(res);
  const supabaseConfig = getSupabaseConfig();
  if (!supabaseConfig) {
    return res.status(200).json({ locations: [], schemaPending: false });
  }

  try {
    const params = new URLSearchParams();
    params.set("select", "city,country,transaction_type,source_name,raw_payload");
    params.set("publication_status", "eq.published");
    params.set("listing_status", "in.(available,pending,under_contract)");
    params.set("or", "(source_name.is.null,source_name.neq.showcase_sample)");
    params.set("limit", "1000");

    const response = await fetch(`${supabaseConfig.url}/rest/v1/properties?${params.toString()}`, {
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      if (isMissingRelationError(response.status, errText)) {
        return res.status(200).json({ locations: [], schemaPending: true });
      }
      return res.status(502).json({ error: "Unable to load property locations." });
    }

    const rows = (await response.json()) as Array<{
      city?: string | null;
      country?: string | null;
      transaction_type?: string | null;
      source_name?: string | null;
      raw_payload?: any;
    }>;

    const buckets = new Map<
      string,
      { city: string; country: string; totalCount: number; saleCount: number; rentCount: number }
    >();

    if (Array.isArray(rows)) {
      for (const row of rows) {
        if (isShowcaseOrSampleRow(row)) continue;
        const city = (row.city || "").trim();
        const normalizedCountry = normalizeCountryInfo(row.country);
        if (!city || !normalizedCountry) continue;
        const key = `${city.toLowerCase()}::${(normalizedCountry.code || normalizedCountry.name).toLowerCase()}`;
        const existing = buckets.get(key) || {
          city,
          country: normalizedCountry.name,
          totalCount: 0,
          saleCount: 0,
          rentCount: 0,
        };
        existing.totalCount += 1;
        if (row.transaction_type === "sale") existing.saleCount += 1;
        if (row.transaction_type === "rent") existing.rentCount += 1;
        buckets.set(key, existing);
      }
    }

    const locations = Array.from(buckets.values())
      .sort((a, b) => b.totalCount - a.totalCount || a.city.localeCompare(b.city))
      .slice(0, 12);

    return res.status(200).json({ locations, schemaPending: false });
  } catch (err) {
    console.error("[Properties API] Locations error:", err);
    return res.status(500).json({ error: "Internal error loading property locations." });
  }
});

function buildLocationTokens(rawLocation: string): string[] {
  return sanitizeSearchTerm(rawLocation)
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .slice(0, 5);
}

function buildSingleTermLocationOrClause(term: string): string {
  const pattern = encodeURIComponent(`*${term}*`);
  return `or(city.ilike.${pattern},country.ilike.${pattern},state_region.ilike.${pattern},address_line.ilike.${pattern},postal_code.ilike.${pattern},title.ilike.${pattern})`;
}

export function buildLocationPostgrestCondition(rawLocation: string): string | null {
  const cleaned = sanitizeSearchTerm(rawLocation);
  if (!cleaned) return null;

  const tokens = buildLocationTokens(cleaned);
  if (tokens.length === 0) return null;

  const countryInfo = normalizeCountryInfo(cleaned);
  const countryAliasClauses =
    countryInfo && countryInfo.code
      ? getCountryQueryVariants(cleaned).map(
          (v) => `country.ilike.${encodeURIComponent(`"${v.replace(/"/g, "")}"`)}`
        )
      : [];

  if (tokens.length === 1) {
    const pattern = encodeURIComponent(`*${tokens[0]}*`);
    const baseFields = [
      `city.ilike.${pattern}`,
      `country.ilike.${pattern}`,
      `state_region.ilike.${pattern}`,
      `address_line.ilike.${pattern}`,
      `postal_code.ilike.${pattern}`,
      `title.ilike.${pattern}`,
      ...countryAliasClauses,
    ];
    return `or(${Array.from(new Set(baseFields)).join(",")})`;
  }

  const tokenClauses = tokens.map((tok) => buildSingleTermLocationOrClause(tok));
  const multiTokenAnd = `and(${tokenClauses.join(",")})`;

  if (countryAliasClauses.length > 0) {
    return `or(${multiTokenAnd},${Array.from(new Set(countryAliasClauses)).join(",")})`;
  }

  return multiTokenAnd;
}

export function matchesPropertyLocationQuery(property: any, rawLocation: string): boolean {
  const cleaned = sanitizeSearchTerm(rawLocation);
  if (!cleaned) return true;

  const haystack = [
    property.city,
    property.country,
    property.state_region,
    property.address_line,
    property.postal_code,
    property.title,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const countryInfo = normalizeCountryInfo(cleaned);
  const propCountry = normalizeCountryInfo(property.country);
  if (countryInfo?.code && propCountry?.code && countryInfo.code === propCountry.code) {
    return true;
  }

  const tokens = buildLocationTokens(cleaned);
  if (tokens.length === 0) return true;

  return tokens.every((tok) => haystack.includes(tok.toLowerCase()));
}

app.get("/api/properties", async (req, res) => {
  setNoCacheApiHeaders(res);
  const transactionType =
    typeof req.query.transaction_type === "string" ? req.query.transaction_type.trim() : "";

  if (!transactionType || (transactionType !== "sale" && transactionType !== "rent")) {
    return res.status(400).json({
      error: "A valid transaction_type ('sale' or 'rent') is required.",
    });
  }

  const rawPage = Number(req.query.page || 1);
  const rawLimit = Number(req.query.limit || 12);
  const page = Number.isFinite(rawPage) ? Math.max(Math.trunc(rawPage), 1) : 1;
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), 48) : 12;
  const offset = (page - 1) * limit;

  const supabaseConfig = getSupabaseConfig();
  if (!supabaseConfig) {
    const propertyType = typeof req.query.property_type === "string" ? req.query.property_type.trim().toLowerCase() : "";
    const minPrice = req.query.min_price !== undefined ? Number(req.query.min_price) : NaN;
    const maxPrice = req.query.max_price !== undefined ? Number(req.query.max_price) : NaN;
    const bedrooms = req.query.bedrooms !== undefined ? Number(req.query.bedrooms) : NaN;
    const bathrooms = req.query.bathrooms !== undefined ? Number(req.query.bathrooms) : NaN;
    const listingStatus = typeof req.query.listing_status === "string" ? req.query.listing_status.trim() : "";
    const rentalPeriod = typeof req.query.rental_period === "string" ? req.query.rental_period.trim() : "";
    const countryParam = typeof req.query.country === "string" ? sanitizeSearchTerm(req.query.country) : "";
    const location = typeof req.query.location === "string" ? sanitizeSearchTerm(req.query.location) : "";
    const sort = typeof req.query.sort === "string" ? req.query.sort.trim() : "newest";

    let list = SHOWCASE_PROPERTIES_SEED.filter(
      (p) => p.publication_status === "published" && p.transaction_type === transactionType
    );

    if (propertyType && propertyType !== "all" && ALLOWED_PROPERTY_TYPES.has(propertyType)) {
      list = list.filter((p) => p.property_type === propertyType);
    }
    if (Number.isFinite(minPrice) && minPrice > 0) {
      list = list.filter((p) => p.price >= minPrice);
    }
    if (Number.isFinite(maxPrice) && maxPrice > 0) {
      list = list.filter((p) => p.price <= maxPrice);
    }
    if (Number.isFinite(bedrooms) && bedrooms > 0) {
      list = list.filter((p) => (p.bedrooms || 0) >= Math.trunc(bedrooms));
    }
    if (Number.isFinite(bathrooms) && bathrooms > 0) {
      list = list.filter((p) => (p.bathrooms || 0) >= bathrooms);
    }
    if (listingStatus && ALLOWED_PUBLIC_LISTING_STATUSES.has(listingStatus)) {
      list = list.filter((p) => p.listing_status === listingStatus);
    }
    if (transactionType === "rent" && rentalPeriod && ALLOWED_RENTAL_PERIODS.has(rentalPeriod)) {
      list = list.filter((p) => p.rental_period === rentalPeriod);
    }
    if (countryParam) {
      const target = normalizeCountryInfo(countryParam);
      list = list.filter((p) => {
        const rowCountry = normalizeCountryInfo(p.country);
        if (!target || !rowCountry) return false;
        if (target.code && rowCountry.code) return target.code === rowCountry.code;
        return target.name.toLowerCase() === rowCountry.name.toLowerCase();
      });
    }
    if (location) {
      list = list.filter((p) => matchesPropertyLocationQuery(p, location));
    }

    if (sort === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    }

    const total = list.length;
    const paginated = list.slice(offset, offset + limit).map(sanitizePublicProperty);

    return res.status(200).json({
      properties: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      schemaPending: false,
    });
  }

  try {
    const queryParts: string[] = [
      "select=*,property_images(*)",
      "publication_status=eq.published",
      `transaction_type=eq.${encodeURIComponent(transactionType)}`,
    ];
    const orConditions: string[] = [];

    const listingStatus =
      typeof req.query.listing_status === "string" ? req.query.listing_status.trim() : "";
    if (listingStatus && ALLOWED_PUBLIC_LISTING_STATUSES.has(listingStatus)) {
      queryParts.push(`listing_status=eq.${encodeURIComponent(listingStatus)}`);
    } else {
      queryParts.push("listing_status=in.(available,pending,under_contract)");
    }

    const propertyType =
      typeof req.query.property_type === "string" ? req.query.property_type.trim().toLowerCase() : "";
    if (propertyType && propertyType !== "all" && ALLOWED_PROPERTY_TYPES.has(propertyType)) {
      queryParts.push(`property_type=eq.${encodeURIComponent(propertyType)}`);
    }

    const minPrice = req.query.min_price !== undefined ? Number(req.query.min_price) : NaN;
    if (Number.isFinite(minPrice) && minPrice > 0) {
      queryParts.push(`price=gte.${minPrice}`);
    }

    const maxPrice = req.query.max_price !== undefined ? Number(req.query.max_price) : NaN;
    if (Number.isFinite(maxPrice) && maxPrice > 0) {
      queryParts.push(`price=lte.${maxPrice}`);
    }

    const bedrooms = req.query.bedrooms !== undefined ? Number(req.query.bedrooms) : NaN;
    if (Number.isFinite(bedrooms) && bedrooms > 0) {
      queryParts.push(`bedrooms=gte.${Math.trunc(bedrooms)}`);
    }

    const bathrooms = req.query.bathrooms !== undefined ? Number(req.query.bathrooms) : NaN;
    if (Number.isFinite(bathrooms) && bathrooms > 0) {
      queryParts.push(`bathrooms=gte.${bathrooms}`);
    }

    if (transactionType === "rent") {
      const rentalPeriod =
        typeof req.query.rental_period === "string" ? req.query.rental_period.trim() : "";
      if (rentalPeriod && ALLOWED_RENTAL_PERIODS.has(rentalPeriod)) {
        queryParts.push(`rental_period=eq.${encodeURIComponent(rentalPeriod)}`);
      }

      const availabilityDate =
        typeof req.query.availability_date === "string" ? req.query.availability_date.trim() : "";
      if (/^\d{4}-\d{2}-\d{2}$/.test(availabilityDate)) {
        orConditions.push(`or(available_from.is.null,available_from.lte.${availabilityDate})`);
      }
    }

    const countryParam =
      typeof req.query.country === "string" ? sanitizeSearchTerm(req.query.country) : "";
    if (countryParam) {
      const variants = getCountryQueryVariants(countryParam);
      if (variants.length > 0) {
        const countryClauses = variants.map(
          (v) => `country.ilike.${encodeURIComponent(`"${v.replace(/"/g, "")}"`)}`
        );
        orConditions.push(`or(${countryClauses.join(",")})`);
      }
    }

    const location = typeof req.query.location === "string" ? sanitizeSearchTerm(req.query.location) : "";
    if (location) {
      const locationCond = buildLocationPostgrestCondition(location);
      if (locationCond) {
        orConditions.push(locationCond);
      }
    }

    if (orConditions.length === 1) {
      const cond = orConditions[0];
      if (cond.startsWith("or(")) {
        queryParts.push(`or=(${cond.slice(3)}`);
      } else if (cond.startsWith("and(")) {
        queryParts.push(`and=(${cond.slice(4)}`);
      } else {
        queryParts.push(cond);
      }
    } else if (orConditions.length > 1) {
      queryParts.push(`and=(${orConditions.join(",")})`);
    }

    if (req.query.featured === "true") {
      queryParts.push("is_featured=eq.true");
    }

    const sort = typeof req.query.sort === "string" ? req.query.sort.trim() : "newest";
    if (sort === "price_asc") {
      queryParts.push("order=price.asc,published_at.desc.nullslast");
    } else if (sort === "price_desc") {
      queryParts.push("order=price.desc,published_at.desc.nullslast");
    } else {
      queryParts.push("order=is_featured.desc,published_at.desc.nullslast,created_at.desc");
    }

    queryParts.push(`limit=${limit}`);
    queryParts.push(`offset=${offset}`);

    const endpoint = `${supabaseConfig.url}/rest/v1/properties?${queryParts.join("&")}`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
        Prefer: "count=exact",
      },
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      if (isMissingRelationError(response.status, errText)) {
        return res.status(200).json({
          properties: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
          schemaPending: true,
        });
      }
      return res.status(502).json({ error: "Unable to query properties right now." });
    }

    const rows = (await response.json()) as any[];
    const items = Array.isArray(rows) ? rows.map(sanitizePublicProperty) : [];
    const total = parseContentRangeTotal(response.headers.get("content-range"), items.length);

    return res.status(200).json({
      properties: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      schemaPending: false,
    });
  } catch (err) {
    console.error("[Properties API] Search error:", err);
    return res.status(500).json({ error: "Internal error querying properties." });
  }
});

app.get("/api/properties/:identifier", async (req, res) => {
  const rawIdentifier = (req.params.identifier || "").trim();
  if (!rawIdentifier) {
    return res.status(400).json({ error: "Property identifier is required." });
  }

  const cleanSlug = rawIdentifier.replace(/^sample-/, "");
  const isUuid = UUID_REGEX.test(rawIdentifier);

  const supabaseConfig = getSupabaseConfig();
  if (supabaseConfig) {
    try {
      const filterCondition = isUuid
        ? `id=eq.${encodeURIComponent(rawIdentifier)}`
        : `or=(slug.eq.${encodeURIComponent(rawIdentifier)},slug.eq.${encodeURIComponent(cleanSlug)})`;

      const endpoint = `${supabaseConfig.url}/rest/v1/properties?${filterCondition}&publication_status=eq.published&listing_status=in.(available,pending,under_contract)&select=*,property_images(*)&limit=1`;

      const response = await fetch(endpoint, {
        headers: {
          apikey: supabaseConfig.anonKey,
          Authorization: `Bearer ${supabaseConfig.anonKey}`,
        },
      });

      if (response.ok) {
        const rows = (await response.json()) as any[];
        if (Array.isArray(rows) && rows.length > 0) {
          return res.status(200).json({
            property: sanitizePublicProperty(rows[0]),
          });
        }
      }
    } catch (err) {
      console.error("[Properties API] Detail error:", err);
    }
  }

  // Showcase seed fallback
  const foundSeed = SHOWCASE_PROPERTIES_SEED.find(
    (p) => p.slug === rawIdentifier || p.slug === cleanSlug || p.id === rawIdentifier
  );

  if (foundSeed) {
    return res.status(200).json({
      property: sanitizePublicProperty(foundSeed),
    });
  }

  return res.status(404).json({ error: "Property listing not found or no longer active." });
});

app.post("/api/properties/enquiry", async (req, res) => {
  const body = req.body || {};
  const propertyId = typeof body.property_id === "string" ? body.property_id.trim() : "";
  const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!UUID_REGEX.test(propertyId)) {
    return res.status(400).json({ error: "A valid property reference is required." });
  }
  if (fullName.length < 2 || fullName.length > 120) {
    return res.status(400).json({ error: "Please enter your full name (at least 2 characters)." });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  if (phone && phone.length > 32) {
    return res.status(400).json({ error: "Phone number must be 32 characters or fewer." });
  }
  if (message.length < 10 || message.length > 4000) {
    return res.status(400).json({
      error: "Please include an enquiry message of at least 10 characters.",
    });
  }

  const clientIp =
    (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown")
      .toString()
      .split(",")[0]
      .trim();

  const now = Date.now();
  const recentTimestamps = (enquiryIpHistory.get(clientIp) || []).filter((ts) => now - ts < 60_000);
  if (recentTimestamps.length >= 5) {
    return res.status(429).json({
      error: "Too many enquiries submitted. Please wait a minute before trying again.",
    });
  }

  const duplicateKey = `${email}::${propertyId}`;
  const lastSubmittedAt = recentDuplicateEnquiries.get(duplicateKey);
  if (lastSubmittedAt && now - lastSubmittedAt < 60_000) {
    return res.status(429).json({
      error: "Your enquiry for this property was just received. Please allow a moment before resending.",
    });
  }

  const supabaseConfig = getSupabaseConfig();
  if (!supabaseConfig) {
    return res.status(503).json({ error: "Database service is not configured in this environment." });
  }

  try {
    const checkRes = await fetch(
      `${supabaseConfig.url}/rest/v1/properties?id=eq.${encodeURIComponent(
        propertyId
      )}&publication_status=eq.published&listing_status=in.(available,pending,under_contract)&select=id`,
      {
        headers: {
          apikey: supabaseConfig.anonKey,
          Authorization: `Bearer ${supabaseConfig.anonKey}`,
        },
      }
    );

    if (!checkRes.ok) {
      const checkErr = await checkRes.text().catch(() => "");
      if (isMissingRelationError(checkRes.status, checkErr)) {
        return res.status(503).json({
          error: "Property marketplace tables have not been created yet in Supabase.",
          schemaPending: true,
        });
      }
      return res.status(502).json({ error: "Unable to verify listing availability." });
    }

    const matchingProperties = (await checkRes.json()) as Array<{ id: string }>;
    if (!Array.isArray(matchingProperties) || matchingProperties.length === 0) {
      return res.status(404).json({ error: "This property is unavailable for new enquiries." });
    }

    const insertRes = await fetch(`${supabaseConfig.url}/rest/v1/property_enquiries`, {
      method: "POST",
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        property_id: propertyId,
        full_name: fullName,
        email,
        phone: phone || null,
        message,
        status: "new",
      }),
    });

    if (!insertRes.ok) {
      const insertErr = await insertRes.text().catch(() => "");
      if (isMissingRelationError(insertRes.status, insertErr)) {
        return res.status(503).json({
          error: "Property enquiries table is pending database migration.",
          schemaPending: true,
        });
      }
      console.error("[Properties API] Enquiry insert rejected:", insertRes.status, insertErr);
      return res.status(400).json({ error: "Unable to save your enquiry. Please verify all inputs." });
    }

    enquiryIpHistory.set(clientIp, [...recentTimestamps, now]);
    recentDuplicateEnquiries.set(duplicateKey, now);

    return res.status(201).json({
      success: true,
      message: "Your enquiry has been submitted and recorded for review.",
    });
  } catch (err) {
    console.error("[Properties API] Enquiry submit error:", err);
    return res.status(500).json({ error: "Internal error recording property enquiry." });
  }
});

function renderUrlXml(entry: SitemapUrlEntry): string {
  if (entry.lastmod) {
    return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>\n  </url>`;
  }
  return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>\n  </url>`;
}

function renderUrlSetXml(entries: SitemapUrlEntry[]): string {
  const body = entries.map(renderUrlXml).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

function chunkSitemapEntries(entries: SitemapUrlEntry[]): SitemapUrlEntry[][] {
  if (entries.length === 0) return [[]];

  const chunks: SitemapUrlEntry[][] = [];
  let currentChunk: SitemapUrlEntry[] = [];
  let currentBytes = 128; // header + closing tag overhead

  for (const entry of entries) {
    const entryXml = renderUrlXml(entry);
    const entryBytes = Buffer.byteLength(entryXml, "utf8") + 1;

    if (
      currentChunk.length >= MAX_URLS_PER_SITEMAP ||
      (currentChunk.length > 0 && currentBytes + entryBytes > MAX_BYTES_PER_SITEMAP)
    ) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentBytes = 128;
    }

    currentChunk.push(entry);
    currentBytes += entryBytes;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export async function buildSitemapXml(baseUrl = SITE_URL): Promise<string> {
  const entries = await collectSitemapEntries(baseUrl);
  const chunks = chunkSitemapEntries(entries);

  if (chunks.length <= 1) {
    return renderUrlSetXml(chunks[0]);
  }

  // Automatic <sitemapindex> when exceeding per-sitemap URL/byte limits
  const sitemapsXml = chunks
    .map((chunk, index) => {
      const pageNum = index + 1;
      const chunkLastMod = maxIsoTimestamp(...chunk.map((item) => item.lastmod));
      const locTag = `    <loc>${escapeXml(`${baseUrl}/sitemap-${pageNum}.xml`)}</loc>`;
      const lastModTag = chunkLastMod ? `\n    <lastmod>${escapeXml(chunkLastMod)}</lastmod>` : "";
      return `  <sitemap>\n${locTag}${lastModTag}\n  </sitemap>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapsXml}\n</sitemapindex>`;
}

export async function buildPaginatedSitemapXml(page: number, baseUrl = SITE_URL): Promise<string | null> {
  if (!Number.isInteger(page) || page < 1) return null;
  const entries = await collectSitemapEntries(baseUrl);
  const chunks = chunkSitemapEntries(entries);
  if (page > chunks.length) return null;
  return renderUrlSetXml(chunks[page - 1]);
}

app.get(["/sitemap.xml", "/api/sitemap.xml"], async (req, res) => {
  try {
    setNoCacheSeoHeaders(res);
    const baseUrl = getCanonicalBaseUrl(req.headers.host);
    const xml = await buildSitemapXml(baseUrl);
    res.header("Content-Type", "application/xml; charset=utf-8");
    return res.status(200).send(xml);
  } catch (err) {
    console.error("[Sitemap] Generation failed:", err);
    res.setHeader("Retry-After", "300");
    return res.status(503).type("text/plain").send("Sitemap temporarily unavailable");
  }
});

app.get(["/sitemap-:page.xml", "/api/sitemap-:page.xml"], async (req, res) => {
  try {
    setNoCacheSeoHeaders(res);
    const pageNum = Number(req.params.page);
    const baseUrl = getCanonicalBaseUrl(req.headers.host);
    const xml = await buildPaginatedSitemapXml(pageNum, baseUrl);
    if (!xml) {
      return res.status(404).type("text/plain").send("Sitemap page not found");
    }
    res.header("Content-Type", "application/xml; charset=utf-8");
    return res.status(200).send(xml);
  } catch (err) {
    console.error("[Sitemap] Paginated generation failed:", err);
    res.setHeader("Retry-After", "300");
    return res.status(503).type("text/plain").send("Sitemap temporarily unavailable");
  }
});

async function fetchPropertyForSeo(rawSlug: string): Promise<any | null> {
  const cleanSlug = rawSlug.replace(/^sample-/, "");
  const isUuid = UUID_REGEX.test(rawSlug);
  const supabaseConfig = getSupabaseConfig();

  if (supabaseConfig) {
    try {
      const filterCondition = isUuid
        ? `id=eq.${encodeURIComponent(rawSlug)}`
        : `or=(slug.eq.${encodeURIComponent(rawSlug)},slug.eq.${encodeURIComponent(cleanSlug)})`;
      const endpoint = `${supabaseConfig.url}/rest/v1/properties?${filterCondition}&publication_status=eq.published&listing_status=in.(available,pending,under_contract)&select=title,slug,city,country,description,transaction_type,property_type&limit=1`;
      const response = await fetch(endpoint, {
        headers: {
          apikey: supabaseConfig.anonKey,
          Authorization: `Bearer ${supabaseConfig.anonKey}`,
        },
      });
      if (response.ok) {
        const rows = (await response.json()) as any[];
        if (Array.isArray(rows) && rows.length > 0) {
          return rows[0];
        }
      }
    } catch (err) {
      console.error("[SEO-SSR] Supabase property lookup error:", err);
    }
  }

  return (
    SHOWCASE_PROPERTIES_SEED.find(
      (p) => p.slug === rawSlug || p.slug === cleanSlug || p.id === rawSlug
    ) || null
  );
}

const FALLBACK_CATEGORY_SLUGS = new Set([
  "investment",
  "architecture",
  "construction",
  "home-living",
  "news",
]);

async function fetchCategoryForSeo(slug: string): Promise<{ name: string; slug: string; seo_title?: string | null; seo_description?: string | null; description?: string | null } | null> {
  const supabaseConfig = getSupabaseConfig();
  if (supabaseConfig) {
    try {
      const endpoint = `${supabaseConfig.url}/rest/v1/categories?slug=eq.${encodeURIComponent(slug)}&select=name,slug,seo_title,seo_description,description&limit=1`;
      const response = await fetch(endpoint, {
        headers: {
          apikey: supabaseConfig.anonKey,
          Authorization: `Bearer ${supabaseConfig.anonKey}`,
        },
      });
      if (response.ok) {
        const rows = (await response.json()) as any[];
        if (Array.isArray(rows) && rows.length > 0) {
          return rows[0];
        }
        return null;
      }
    } catch (err) {
      console.error("[SEO-SSR] Supabase category lookup error:", err);
    }
  }

  if (FALLBACK_CATEGORY_SLUGS.has(slug)) {
    return { name: slug, slug };
  }
  return null;
}

// Legacy /news/:slug article handler (301 to genuine replacement or existing article, otherwise real HTTP 404)
app.get("/news/:slug", async (req, res) => {
  const customRedirect = await lookupActiveRedirect(req.path);
  if (customRedirect) {
    return res.redirect(customRedirect.status_code, customRedirect.target_path);
  }

  const slug = normalizeArticleSlugInput(req.params.slug);
  const templateHtml = getIndexTemplateHtml();

  if (!slug) {
    setNoCacheSeoHeaders(res);
    return sendHtmlPage(
      req,
      res,
      404,
      injectNotFoundMetadata(templateHtml, {
        title: "Article Not Found (404) | AmaanEstate",
        description: "The requested legacy news article could not be found on AmaanEstate.",
      })
    );
  }

  // 1. Check verified legacy replacement mapping (permanent 301 only if replacement exists)
  const mappedTarget = resolveLegacyArticleRedirectSlug(slug);
  if (mappedTarget) {
    const targetArticle = await fetchArticleForOg(mappedTarget);
    if (targetArticle) {
      return res.redirect(301, `/articles/${encodeURIComponent(targetArticle.slug)}`);
    }
  }

  // 2. Check if an article with this exact slug exists under /articles/:slug
  const existingArticle = await fetchArticleForOg(slug);
  if (existingArticle) {
    return res.redirect(301, `/articles/${encodeURIComponent(existingArticle.slug)}`);
  }

  // 3. No replacement & no article -> HTTP 404 (never redirect missing articles to homepage)
  setNoCacheSeoHeaders(res);
  return sendHtmlPage(
    req,
    res,
    404,
    injectNotFoundMetadata(templateHtml, {
      title: "Article Not Found (404) | AmaanEstate",
      description: "The requested legacy news article could not be found or is no longer published on AmaanEstate.",
    })
  );
});

// Dynamic Article Open Graph SSR Metadata Route
app.get(["/articles/:slug", "/api/articles-og/:slug"], async (req, res) => {
  if (!req.path.startsWith("/api/")) {
    const customRedirect = await lookupActiveRedirect(req.path);
    if (customRedirect) {
      return res.redirect(customRedirect.status_code, customRedirect.target_path);
    }
  }

  const slug = normalizeArticleSlugInput(req.params.slug);
  const templateHtml = getIndexTemplateHtml();

  if (!slug) {
    setNoCacheSeoHeaders(res);
    return sendHtmlPage(
      req,
      res,
      404,
      injectNotFoundMetadata(templateHtml, { title: "Article Not Found (404) | AmaanEstate" })
    );
  }

  const article = await fetchArticleForOg(slug);
  if (article) {
    const injectedHtml = await injectArticleOgMetadata(templateHtml, article, req.headers.host);
    return sendHtmlPage(req, res, 200, injectedHtml);
  }

  const mappedTarget = resolveLegacyArticleRedirectSlug(slug);
  if (mappedTarget && mappedTarget !== slug) {
    const targetArticle = await fetchArticleForOg(mappedTarget);
    if (targetArticle) {
      return res.redirect(301, `/articles/${encodeURIComponent(targetArticle.slug)}`);
    }
  }

  setNoCacheSeoHeaders(res);
  return sendHtmlPage(
    req,
    res,
    404,
    injectNotFoundMetadata(templateHtml, {
      title: "Article Not Found (404) | AmaanEstate",
      description: "The requested article could not be found or is no longer published on AmaanEstate.",
    })
  );
});

// Property detail SEO & 404 status route
app.get("/properties/:slug", async (req, res) => {
  const slug = normalizeArticleSlugInput(req.params.slug);
  const templateHtml = getIndexTemplateHtml();
  if (!slug) {
    setNoCacheSeoHeaders(res);
    return sendHtmlPage(
      req,
      res,
      404,
      injectNotFoundMetadata(templateHtml, { title: "Property Unavailable (404) | AmaanEstate" })
    );
  }

  const prop = await fetchPropertyForSeo(slug);
  if (!prop) {
    setNoCacheSeoHeaders(res);
    return sendHtmlPage(
      req,
      res,
      404,
      injectNotFoundMetadata(templateHtml, {
        title: "Property Unavailable (404) | AmaanEstate",
        description: "The requested property listing is unavailable or no longer active on AmaanEstate.",
      })
    );
  }

  const baseUrl = getCanonicalBaseUrl(req.headers.host);
  const canonicalUrl = `${baseUrl}/properties/${encodeURIComponent(prop.slug)}`;
  const html = injectSpaRouteMetadata(templateHtml, {
    canonicalUrl,
    title: `${prop.title} | AmaanEstate`,
    description: stripHtml(prop.description || `${prop.title} in ${prop.city}, ${prop.country}`).slice(0, 160),
  });
  return sendHtmlPage(req, res, 200, html);
});

// Category slug route (/category/:slug)
app.get("/category/:slug", async (req, res) => {
  const slug = normalizeArticleSlugInput(req.params.slug);
  const templateHtml = getIndexTemplateHtml();
  const cat = slug ? await fetchCategoryForSeo(slug) : null;
  if (!cat) {
    setNoCacheSeoHeaders(res);
    return sendHtmlPage(
      req,
      res,
      404,
      injectNotFoundMetadata(templateHtml, { title: "Section Not Found (404) | AmaanEstate" })
    );
  }
  const baseUrl = getCanonicalBaseUrl(req.headers.host);
  const html = injectSpaRouteMetadata(templateHtml, {
    canonicalUrl: `${baseUrl}/${encodeURIComponent(cat.slug)}`,
    title: cat.seo_title || `${cat.name} | AmaanEstate`,
    description: cat.seo_description || cat.description || undefined,
  });
  return sendHtmlPage(req, res, 200, html);
});

const PUBLIC_INDEXABLE_SPA_ROUTES = new Map<string, { title?: string; description?: string }>([
  ["/", {}],
  ["/buy", { title: "Buy Real Estate & Properties for Sale | AmaanEstate" }],
  ["/rent", { title: "Rent Real Estate & Properties for Lease | AmaanEstate" }],
  ["/investment", { title: "Real Estate Investment | AmaanEstate" }],
  ["/architecture", { title: "Architecture | AmaanEstate" }],
  ["/construction", { title: "Construction | AmaanEstate" }],
  ["/home-living", { title: "Home & Living | AmaanEstate" }],
  ["/news", { title: "Global Real Estate News | AmaanEstate" }],
  ["/about", { title: "About AmaanEstate | Global Real Estate Media, Research & Marketplace" }],
  ["/contact", { title: "Contact AmaanEstate" }],
  ["/editorial-policy", { title: "Editorial Policy & Standards | AmaanEstate" }],
  ["/corrections-policy", { title: "Corrections & Fact-Checking Policy | AmaanEstate" }],
  ["/privacy-policy", { title: "Privacy Policy | AmaanEstate" }],
  ["/cookie-policy", { title: "Cookie Policy | AmaanEstate" }],
  ["/advertising-disclosure", { title: "Advertising Disclosure | AmaanEstate" }],
  ["/terms", { title: "Terms of Use | AmaanEstate" }],
  ["/newsletter", { title: "Newsletter & Briefings | AmaanEstate" }],
]);

const NOINDEX_SPA_ROUTES = new Set<string>([
  "/search",
  "/login",
  "/register",
  "/account",
  "/admin",
  "/admin/login",
]);

app.use(async (req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  if (
    req.path.startsWith("/api/") ||
    req.path.startsWith("/src/") ||
    req.path.startsWith("/@") ||
    req.path.startsWith("/node_modules/") ||
    /\.[a-z0-9]{1,8}$/i.test(req.path)
  ) {
    return next();
  }

  const cleanPath = req.path.length > 1 ? req.path.replace(/\/+$/, "") : req.path;

  // Check SEO Redirect Manager rules before route matching or 404
  const customRedirect = await lookupActiveRedirect(cleanPath);
  if (customRedirect) {
    return res.redirect(customRedirect.status_code, customRedirect.target_path);
  }

  const baseUrl = getCanonicalBaseUrl(req.headers.host);
  const templateHtml = getIndexTemplateHtml();

  if (PUBLIC_INDEXABLE_SPA_ROUTES.has(cleanPath)) {
    const meta = PUBLIC_INDEXABLE_SPA_ROUTES.get(cleanPath) || {};
    const canonicalUrl = cleanPath === "/" ? `${baseUrl}/` : `${baseUrl}${cleanPath}`;
    const html = injectSpaRouteMetadata(templateHtml, {
      canonicalUrl,
      title: meta.title,
      description: meta.description,
    });
    return sendHtmlPage(req, res, 200, html);
  }

  if (NOINDEX_SPA_ROUTES.has(cleanPath)) {
    const html = injectSpaRouteMetadata(templateHtml, {
      noIndex: true,
    });
    return sendHtmlPage(req, res, 200, html);
  }

  // Any other unknown route returns a proper HTTP 404 without homepage canonical
  setNoCacheSeoHeaders(res);
  return sendHtmlPage(
    req,
    res,
    404,
    injectNotFoundMetadata(templateHtml, {
      title: "Page Not Found (404) | AmaanEstate",
    })
  );
});

async function startServer() {
  const httpServer = http.createServer(app);

  app.use(express.static(path.join(process.cwd(), "public")));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: "spa",
    });
    devViteServer = vite;
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      return res.status(404).type("text/plain").send("Not Found");
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[AMAAN ESTATE] Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL && !process.env.DISABLE_SERVER_LISTEN) {
  startServer();
}

export default app;
