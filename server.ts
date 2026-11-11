import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { SEED_ARTICLE_BY_SLUG, ALL_SEED_EDITORIAL_ARTICLES } from "./src/data/allArticles";

dotenv.config();

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

function normalizeCanonicalOrigin(rawUrl?: string | null): string {
  const raw = (rawUrl || "").trim().replace(/\/+$/, "");
  if (!raw) return "https://amaanestate.com";
  try {
    const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    if (parsed.hostname === "www.amaanestate.com" || parsed.hostname === "amaanestate.com") {
      return "https://amaanestate.com";
    }
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return "https://amaanestate.com";
  }
}

const SITE_URL = normalizeCanonicalOrigin(process.env.CANONICAL_SITE_URL || "https://amaanestate.com");
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
  const distHtmlPath = path.join(process.cwd(), "dist", "index.html");
  if (fs.existsSync(distHtmlPath)) {
    return fs.readFileSync(distHtmlPath, "utf-8");
  }
  const rootHtmlPath = path.join(process.cwd(), "index.html");
  if (fs.existsSync(rootHtmlPath)) {
    return fs.readFileSync(rootHtmlPath, "utf-8");
  }
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8" /></head><body><div id="root"></div></body></html>`;
}

function injectArticleOgMetadata(templateHtml: string, article: any, reqHost?: string): string {
  const baseUrl = getCanonicalBaseUrl(reqHost);

  const canonicalUrl = `${baseUrl}/articles/${encodeURIComponent(article.slug)}`;
  const rawTitle = article.seo_title || article.title;
  const pageTitle = rawTitle.includes("AMAAN ESTATE") ? rawTitle : `${rawTitle} | AMAAN ESTATE`;
  const rawDescription = article.seo_description || article.excerpt || "AMAAN ESTATE — Global Real Estate Media, Research & Knowledge Platform";
  const cleanDescription = stripHtml(rawDescription).slice(0, 180);

  const rawImage = article.og_image || article.featured_image;
  const absoluteImageUrl = resolveAbsoluteImageUrl(rawImage, baseUrl);
  const imageAlt = article.featured_image_alt || article.title;
  const publishedTime = article.published_at || article.created_at || new Date().toISOString();

  const metadataHtml = `
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(cleanDescription)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />

    <!-- Open Graph / Facebook / WhatsApp / LinkedIn -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="AMAAN ESTATE" />
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

  const cleanHtml = templateHtml
    .replace(/<title>.*?<\/title>/gi, "")
    .replace(/<meta\s+name=["']description["'].*?>/gi, "")
    .replace(/<link\s+rel=["']canonical["'].*?>/gi, "")
    .replace(/<meta\s+property=["']og:.*?["'].*?>/gi, "")
    .replace(/<meta\s+name=["']twitter:.*?["'].*?>/gi, "");

  return cleanHtml.replace("</head>", `${metadataHtml}\n  </head>`);
}

// Health Check
app.get("/api/health", (req, res) => {
  const supabaseConfig = getSupabaseConfig();
  res.json({
    status: "healthy",
    app: "AMAAN ESTATE — Global Real Estate Media, Research & Knowledge Platform",
    supabaseConfigured: Boolean(supabaseConfig),
    timestamp: new Date().toISOString(),
  });
});

// Direct file attachment download for 004_editorial_25_articles.sql
app.get("/004_editorial_25_articles.sql", (req, res) => {
  const filePath = path.join(process.cwd(), "supabase", "migrations", "004_editorial_25_articles.sql");
  res.download(filePath, "004_editorial_25_articles.sql");
});

function setNoCacheSeoHeaders(res: express.Response) {
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=0, must-revalidate");
  res.setHeader("CDN-Cache-Control", "no-store");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");
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

  while (true) {
    const endpoint = `${config.url}/rest/v1/articles?select=slug,status,category_id,published_at,updated_at,created_at&status=eq.published&or=(published_at.is.null,published_at.lte.${nowIso})&order=published_at.desc.nullslast,id.asc&limit=${pageSize}&offset=${offset}`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase articles query failed (${response.status})`);
    }

    const rows = (await response.json()) as SitemapArticleRow[];
    if (!Array.isArray(rows) || rows.length === 0) break;

    for (const row of rows) {
      if (row.status !== "published") continue;
      if (!isValidPublicSlug(row.slug)) continue;
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

export async function collectSitemapEntries(baseUrl = SITE_URL): Promise<SitemapUrlEntry[]> {
  const supabaseConfig = getSupabaseConfig();
  let categories: SitemapCategoryRow[] = [];
  let articles: SitemapArticleRow[] = [];

  if (supabaseConfig) {
    [categories, articles] = await Promise.all([
      fetchCategoriesFromSupabase(supabaseConfig),
      fetchEligibleArticlesFromSupabase(supabaseConfig),
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

  const dedupedUrls = new Map<string, string | null>();
  const addUrl = (urlPath: string, lastmod: string | null = null) => {
    const cleanPath = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
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

  // 3. Indexable Static Editorial & Policy Pages (omit fabricated lastmod)
  const publicEditorialPaths = [
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

  return Array.from(dedupedUrls.entries()).map(([loc, lastmod]) => ({ loc, lastmod }));
}

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

// Dynamic Article Open Graph SSR Metadata Route
app.get(["/articles/:slug", "/api/articles-og/:slug"], async (req, res) => {
  const { slug } = req.params;
  const templateHtml = getIndexTemplateHtml();
  const article = await fetchArticleForOg(slug);

  if (article) {
    const injectedHtml = injectArticleOgMetadata(templateHtml, article, req.headers.host);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(injectedHtml);
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(templateHtml);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AMAAN ESTATE] Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL && !process.env.DISABLE_SERVER_LISTEN) {
  startServer();
}

export default app;
