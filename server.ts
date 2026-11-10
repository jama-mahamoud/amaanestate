import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

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
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /admin/",
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

// Dynamic XML Sitemap (queries published articles from Supabase if configured)
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
  ];

  const seedArticleEntries: { slug: string; updatedAt: string }[] = [
    { slug: "sovereign-capital-logistics-europe-east-africa-2026", updatedAt: "2026-10-28" },
    { slug: "reit-debt-maturities-refinancing-cycles", updatedAt: "2026-10-16" },
    { slug: "build-to-rent-multifamily-underwriting-global-cities", updatedAt: "2026-10-12" },
    { slug: "data-center-real-estate-power-land-underwriting", updatedAt: "2026-10-05" },
    { slug: "brown-discount-commercial-office-retrofit-yields", updatedAt: "2026-09-29" },
    { slug: "travertine-climate-responsive-civic-pavilions", updatedAt: "2026-10-24" },
    { slug: "adaptive-reuse-industrial-silos-cultural-commons", updatedAt: "2026-10-04" },
    { slug: "biophilic-high-rise-sky-gardens-urban-microclimate", updatedAt: "2026-09-28" },
    { slug: "rammed-earth-thermal-mass-arid-architecture", updatedAt: "2026-09-20" },
    { slug: "sponge-city-coastal-urban-design-resilience", updatedAt: "2026-09-12" },
    { slug: "hybrid-mass-timber-high-rise-seismic-standards", updatedAt: "2026-10-20" },
    { slug: "geopolymer-low-carbon-concrete-site-trials", updatedAt: "2026-10-08" },
    { slug: "volumetric-modular-prefabrication-economics", updatedAt: "2026-10-02" },
    { slug: "prefabricated-facade-overcladding-occupied-retrofits", updatedAt: "2026-09-24" },
    { slug: "digital-twin-lidar-robotics-construction-productivity", updatedAt: "2026-09-16" },
    { slug: "passive-cooling-travertine-courtyard-residences", updatedAt: "2026-10-14" },
    { slug: "smart-grid-home-batteries-residential-roi", updatedAt: "2026-10-01" },
    { slug: "small-space-urban-apartment-joinery-solutions", updatedAt: "2026-09-25" },
    { slug: "circadian-lighting-acoustic-residential-interior-design", updatedAt: "2026-09-18" },
    { slug: "deep-energy-heritage-townhouse-retrofit-guide", updatedAt: "2026-09-10" },
    { slug: "eu-building-energy-performance-mandate-commercial-retrofits", updatedAt: "2026-10-11" },
    { slug: "uk-planning-infrastructure-act-2025-housing-reforms", updatedAt: "2026-09-26" },
    { slug: "singapore-ura-master-plan-2025-housing-supply", updatedAt: "2026-09-22" },
    { slug: "dubai-real-estate-strategy-2033-dld-market-roadmap", updatedAt: "2026-09-19" },
    { slug: "eu-construction-products-regulation-2024-digital-product-passports", updatedAt: "2026-09-14" },
  ];

  let articleEntries: { slug: string; updatedAt: string }[] = seedArticleEntries;

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const response = await fetch(
        `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/articles?select=slug,updated_at,published_at&status=eq.published&order=published_at.desc&limit=500`,
        {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        }
      );
      if (response.ok) {
        const rows = (await response.json()) as Array<{ slug: string; updated_at?: string; published_at?: string }>;
        if (Array.isArray(rows) && rows.length > 0) {
          articleEntries = rows.map((row) => ({
            slug: row.slug,
            updatedAt: (row.updated_at || row.published_at || today).split("T")[0],
          }));
        }
      }
    } catch (err) {
      console.error("[Sitemap] Failed to query Supabase articles:", err);
    }
  }

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
  res.type("application/xml").send(xml);
});

app.get("/api/sitemap.xml", async (req, res) => {
  const xml = await buildSitemapXml();
  res.type("application/xml").send(xml);
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
