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

const SITE_URL = (process.env.APP_URL || "https://amaanestate.com").replace(/\/+$/, "");

// Helper functions for Open Graph metadata injection
function escapeHtml(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
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
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const response = await fetch(
        `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/articles?slug=eq.${encodeURIComponent(slug)}&select=*`,
        {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        }
      );
      if (response.ok) {
        const rows = (await response.json()) as Array<any>;
        if (Array.isArray(rows) && rows.length > 0) {
          return rows[0];
        }
      }
    } catch (err) {
      console.error("[OG-SSR] Supabase article lookup error:", err);
    }
  }

  // Fallback to local seed dataset
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
  let baseUrl = SITE_URL;
  if (reqHost) {
    const protocol = reqHost.includes("localhost") || reqHost.includes("127.0.0.1") ? "http" : "https";
    baseUrl = `${protocol}://${reqHost}`;
  }

  const canonicalUrl = `${baseUrl}/articles/${article.slug}`;
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

  let cleanHtml = templateHtml
    .replace(/<title>.*?<\/title>/gi, "")
    .replace(/<meta\s+name=["']description["'].*?>/gi, "")
    .replace(/<link\s+rel=["']canonical["'].*?>/gi, "")
    .replace(/<meta\s+property=["']og:.*?["'].*?>/gi, "")
    .replace(/<meta\s+name=["']twitter:.*?["'].*?>/gi, "");

  return cleanHtml.replace("</head>", `${metadataHtml}\n  </head>`);
}

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    app: "AMAAN ESTATE — Global Real Estate Media, Research & Knowledge Platform",
    supabaseConfigured: Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Direct file attachment download for 004_editorial_25_articles.sql
app.get("/004_editorial_25_articles.sql", (req, res) => {
  const filePath = path.join(process.cwd(), "supabase", "migrations", "004_editorial_25_articles.sql");
  res.download(filePath, "004_editorial_25_articles.sql");
});

// Robots.txt (both root and /api)
function buildRobotsTxt(): string {
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
    "",
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /admin/",
    "Disallow: /account",
    "Disallow: /auth",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
  ].join("\n");
}

app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(buildRobotsTxt());
});

app.get("/api/robots.txt", (req, res) => {
  res.type("text/plain").send(buildRobotsTxt());
});

// Dynamic XML Sitemap (queries published articles from Supabase dynamically and merges with seed catalog)
async function buildSitemapXml(): Promise<string> {
  const today = new Date().toISOString().split("T")[0];
  const staticPaths = [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/investment", changefreq: "daily", priority: "0.9" },
    { path: "/architecture", changefreq: "daily", priority: "0.9" },
    { path: "/construction", changefreq: "daily", priority: "0.9" },
    { path: "/home-living", changefreq: "daily", priority: "0.9" },
    { path: "/news", changefreq: "daily", priority: "0.9" },
    { path: "/search", changefreq: "weekly", priority: "0.7" },
    { path: "/about", changefreq: "monthly", priority: "0.6" },
    { path: "/contact", changefreq: "monthly", priority: "0.6" },
    { path: "/editorial-policy", changefreq: "monthly", priority: "0.5" },
    { path: "/privacy-policy", changefreq: "monthly", priority: "0.5" },
    { path: "/terms", changefreq: "monthly", priority: "0.5" },
    { path: "/cookie-policy", changefreq: "monthly", priority: "0.5" },
    { path: "/advertising-disclosure", changefreq: "monthly", priority: "0.5" },
    { path: "/corrections-policy", changefreq: "monthly", priority: "0.5" },
  ];

  const articleMap = new Map<string, string>(); // slug -> updatedAt

  // 1. Load seed catalog articles as baseline
  for (const art of ALL_SEED_EDITORIAL_ARTICLES) {
    if (art.slug) {
      const updatedAt = (art.published_at || today).split("T")[0];
      articleMap.set(art.slug, updatedAt);
    }
  }

  // 2. Query all published articles dynamically from Supabase
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const response = await fetch(
        `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/articles?select=slug,updated_at,published_at,status&status=eq.published&order=published_at.desc&limit=1000`,
        {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        }
      );
      if (response.ok) {
        const rows = (await response.json()) as Array<{ slug: string; updated_at?: string; published_at?: string; status?: string }>;
        if (Array.isArray(rows)) {
          for (const row of rows) {
            if (row.slug && row.status === "published") {
              const updatedAt = (row.updated_at || row.published_at || today).split("T")[0];
              articleMap.set(row.slug, updatedAt);
            }
          }
        }
      }
    } catch (err) {
      console.error("[Sitemap] Failed to query Supabase articles:", err);
    }
  }

  const articleEntries = Array.from(articleMap.entries()).map(([slug, updatedAt]) => ({
    slug,
    updatedAt,
  }));

  const urlsXml = [
    ...staticPaths.map(
      (entry) => `  <url>
    <loc>${SITE_URL}${entry.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    ),
    ...articleEntries.map(
      (art) => `  <url>
    <loc>${SITE_URL}/articles/${art.slug}</loc>
    <lastmod>${art.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    ),
  ].join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
}

app.get("/sitemap.xml", async (req, res) => {
  const xml = await buildSitemapXml();
  res.header("Content-Type", "application/xml; charset=utf-8");
  res.status(200).send(xml);
});

app.get("/api/sitemap.xml", async (req, res) => {
  const xml = await buildSitemapXml();
  res.header("Content-Type", "application/xml; charset=utf-8");
  res.status(200).send(xml);
});

// Dynamic Article Open Graph SSR Metadata Route
app.get("/articles/:slug", async (req, res) => {
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

app.get("/api/articles-og/:slug", async (req, res) => {
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

if (!process.env.VERCEL) {
  startServer();
}

export default app;
