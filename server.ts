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

  const demoSlugs = [
    "sovereign-capital-logistics-europe-east-africa-2026",
    "reit-debt-maturities-refinancing-cycles",
    "travertine-climate-responsive-civic-pavilions",
    "adaptive-reuse-industrial-silos-cultural-commons",
    "hybrid-mass-timber-high-rise-seismic-standards",
    "geopolymer-low-carbon-concrete-site-trials",
    "passive-cooling-travertine-courtyard-residences",
    "smart-grid-home-batteries-residential-roi",
    "eu-building-energy-performance-mandate-commercial-retrofits",
    "transit-oriented-zoning-reforms-global-capitals",
  ];

  let articleEntries: { slug: string; updatedAt: string }[] = demoSlugs.map((slug) => ({
    slug,
    updatedAt: today,
  }));

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
        if (Array.isArray(rows)) {
          articleEntries = rows.map((row) => ({
            slug: row.slug,
            updatedAt: (row.updated_at || row.published_at || today).split("T")[0],
          }));
        }
      }
    } catch (err) {
      console.error("[Sitemap] Failed to query Supabase articles:", err);
      articleEntries = [];
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
