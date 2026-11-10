import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

// Load environment variables immediately
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

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    app: "AmaanEstate Property Marketplace",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/robots.txt", (req, res) => {
  res.type("text/plain").send(`User-agent: *\nAllow: /\n\nSitemap: https://www.amaanestate.com/sitemap.xml`);
});

app.get("/api/sitemap.xml", (req, res) => {
  const dynamicDate = new Date().toISOString().split('T')[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.amaanestate.com/</loc>
    <lastmod>${dynamicDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  res.type("application/xml").send(xml);
});

async function startServer() {
  // Vite middleware for development
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
    console.log(`[AmaanEstate] Server running on http://0.0.0.0:${PORT}`);
  });
}

// Start server when executed directly (or in dev)
if (!process.env.VERCEL) {
  startServer();
}

export default app;
