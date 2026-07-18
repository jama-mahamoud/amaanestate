import express from "express";
import path from "path";
import dotenv from "dotenv";
import http from "http";
import fs from "fs";
import axios from "axios";
import { Resend } from 'resend';

// Load environment variables immediately
dotenv.config();

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let resendClient: Resend | null = null;
function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[WARN] RESEND_API_KEY environment variable is not defined.");
    }
    resendClient = new Resend(apiKey || "re_mock_key");
  }
  return resendClient;
}

// Critical Startup Diagnostics for Production
console.log("=== BACKEND PRODUCTION INITIALIZATION START ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("VERCEL runtime:", !!process.env.VERCEL);
console.log("GEMINI KEY EXISTS:", !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
  console.log("GEMINI KEY LENGTH:", process.env.GEMINI_API_KEY.length);
  console.log("GEMINI KEY PREFIX:", process.env.GEMINI_API_KEY.substring(0, 5) + "...");
}
console.log("================================================");

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { GoogleGenAI } from "@google/genai";

export const app = express();

app.use(express.json());

// Universal WHATWG URL standardizer to bypass Node 22+ url.parse deprecation warning [DEP0169]
app.use((req, res, next) => {
  try {
    const rawUrl = req.url || "/";
    const parsed = new URL(rawUrl, "http://localhost");
    
    // Inject a pre-parsed representation designed to satisfy express internal and parent routing tools (parseurl package)
    // By matching the exact active URL string in '_raw' and 'href', parseurl returns this object without invocation of native url.parse.
    // @ts-ignore
    req._parsedUrl = {
      pathname: parsed.pathname,
      search: parsed.search || null,
      query: parsed.search ? parsed.search.slice(1) : null,
      href: rawUrl,
      path: rawUrl,
      _raw: rawUrl
    };

    const origUrl = req.originalUrl || rawUrl;
    const parsedOrig = new URL(origUrl, "http://localhost");
    // @ts-ignore
    req._parsedOriginalUrl = {
      pathname: parsedOrig.pathname,
      search: parsedOrig.search || null,
      query: parsedOrig.search ? parsedOrig.search.slice(1) : null,
      href: origUrl,
      path: origUrl,
      _raw: origUrl
    };
  } catch (err) {
    console.warn("[DEP0169 COMPAT] Failsafe parsing standardizer exception for URI:", req.url, err);
  }
  next();
});

// Vercel Internal URL Rewrite Adaptor Middleware
// Intercepts requests rewritten under Vercel serverless environment mapping them back to dynamic semantic Express routes.
app.use((req, res, next) => {
  if (req.path.startsWith('/api/index') && req.query.path) {
    const p = req.query.path as string;
    const id = req.query.id as string;
    
    console.log(`[VERCEL REWRITE REGISTRY] Intercepted path: ${req.path}, query path: ${p}, id: ${id}`);
    
    let adaptedUrl: string | null = null;
    if (p === 'news' && id) {
      adaptedUrl = `/news/${id}`;
    } else if (p === 'properties' && id) {
      adaptedUrl = `/properties/${id}`;
    } else if (p === 'vehicles' && id) {
      adaptedUrl = `/vehicles/${id}`;
    } else if (p === 'agents' && id) {
      adaptedUrl = `/agents/${id}`;
    } else if (p === 'sitemap.xml') {
      adaptedUrl = `/sitemap.xml`;
    } else if (p === 'robots.txt') {
      adaptedUrl = `/robots.txt`;
    }
    
    if (adaptedUrl) {
      req.url = adaptedUrl;
      req.originalUrl = adaptedUrl;
      try {
        const parsed = new URL(adaptedUrl, "http://localhost");
        // @ts-ignore
        req._parsedUrl = {
          pathname: parsed.pathname,
          search: parsed.search || null,
          query: parsed.search ? parsed.search.slice(1) : null,
          href: adaptedUrl,
          path: adaptedUrl,
          _raw: adaptedUrl
        };
        // @ts-ignore
        req._parsedOriginalUrl = {
          pathname: parsed.pathname,
          search: parsed.search || null,
          query: parsed.search ? parsed.search.slice(1) : null,
          href: adaptedUrl,
          path: adaptedUrl,
          _raw: adaptedUrl
        };
      } catch (err) {
        console.error("[VERCEL REWRITE ADAPTOR] Failed to regenerate compatible parsed URL:", err);
      }
      console.log(`[VERCEL REWRITE REGISTRY] Internal URI adapted to: ${req.url}`);
    }
  }
  next();
});

// Helper functions for dynamic sitemap and robots.txt generation
async function withTimeout<T>(promise: Promise<T>, ms: number, failureValue: T): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(`[TIMEOUT DETECTOR] Query timed out after ${ms}ms. Returning fallback.`);
      resolve(failureValue);
    }, ms);
  });
  
  // Attach direct error-capture payload immediately to prevent uncaught background promise rejections 
  // which crash Node/Vercel serverless execution loops on asynchronous post-timeout rejections.
  const safePromise = promise.catch((err) => {
    console.error("[BG PROMISE DETECT] Safe handled underlying asynchronous background query rejection:", err);
    return failureValue;
  });

  return Promise.race([
    safePromise.then((res) => {
      clearTimeout(timeoutId);
      return res;
    }),
    timeoutPromise
  ]);
}

// Helper parser to convert Firestore JSON REST API document into standard JS object
function parseRestDocument(restDoc: any, docId: string) {
  const data: any = { id: docId };
  if (!restDoc || !restDoc.fields) return data;
  
  const fields = restDoc.fields;
  Object.keys(fields).forEach(key => {
    const val = fields[key];
    if (val === undefined || val === null) {
      data[key] = null;
    } else if (val.stringValue !== undefined) {
      data[key] = val.stringValue;
    } else if (val.booleanValue !== undefined) {
      data[key] = val.booleanValue;
    } else if (val.integerValue !== undefined) {
      data[key] = parseInt(val.integerValue, 10);
    } else if (val.doubleValue !== undefined) {
      data[key] = parseFloat(val.doubleValue);
    } else if (val.timestampValue !== undefined) {
      const dateStr = val.timestampValue;
      const d = new Date(dateStr);
      data[key] = {
        seconds: Math.floor(d.getTime() / 1000),
        nanoseconds: 0,
        toDate: () => d,
        toISOString: () => dateStr
      };
    } else if (val.arrayValue !== undefined) {
      const values = val.arrayValue.values || [];
      data[key] = values.map((v: any) => {
        if (v === undefined || v === null) return null;
        if (v.stringValue !== undefined) return v.stringValue;
        if (v.booleanValue !== undefined) return v.booleanValue;
        if (v.integerValue !== undefined) return parseInt(v.integerValue, 10);
        if (v.doubleValue !== undefined) return parseFloat(v.doubleValue);
        return v;
      });
    } else if (val.nullValue !== undefined) {
      data[key] = null;
    } else {
      data[key] = val;
    }
  });

  // Inject fallback timestamps from REST metadata if absent inside document fields
  if (restDoc.updateTime && !data.updatedAt) {
    const d = new Date(restDoc.updateTime);
    data.updatedAt = { seconds: Math.floor(d.getTime() / 1000), nanoseconds: 0 };
  }
  if (restDoc.createTime && !data.createdAt) {
    const d = new Date(restDoc.createTime);
    data.createdAt = { seconds: Math.floor(d.getTime() / 1000), nanoseconds: 0 };
  }

  return data;
}

// Low-overhead REST client for Firestore public queries
async function fetchCollectionRest(collectionId: string, projectId: string): Promise<any[]> {
  try {
    // If it's editorial_reviews, use runQuery to avoid 403 Forbidden on unfiltered list
    if (collectionId === "editorial_reviews") {
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
      console.log(`[SITEMAP REST] Fetching 'editorial_reviews' via runQuery REST API: ${url}`);
      const query = {
        structuredQuery: {
          from: [{ collectionId: "editorial_reviews" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "status" },
              op: "EQUAL",
              value: { stringValue: "published" }
            }
          }
        }
      };
      const res = await axios.post(url, query, { timeout: 12000 });
      const results = res.data || [];
      const docs: any[] = [];
      results.forEach((item: any) => {
        if (item.document) {
          const parts = item.document.name.split('/');
          const docId = parts[parts.length - 1];
          docs.push(parseRestDocument(item.document, docId));
        }
      });
      return docs;
    }

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionId}?pageSize=300`;
    console.log(`[SITEMAP REST] Fetching collection '${collectionId}' from REST API URL: ${url}`);
    const res = await axios.get(url, { timeout: 12000 });
    const documents = res.data.documents || [];
    return documents.map((doc: any) => {
      const parts = doc.name.split('/');
      const docId = parts[parts.length - 1];
      return parseRestDocument(doc, docId);
    });
  } catch (err: any) {
    console.error(`[SITEMAP REST] Failed to fetch collection '${collectionId}' via REST API:`, err.message);
    return [];
  }
}

async function generateSitemapXml() {
  const metrics = {
    totalPublishedArticlesFound: 0,
    totalUrlsIncluded: 0,
    totalUrlsExcluded: 0,
    exclusionReasons: {
      legacyRealEstate: 0,
      invalidSlug: 0,
      notPublished: 0,
      notPublic: 0,
      notIndexable: 0,
      citiesRoute: 0
    }
  };

  try {
    const dynamicDate = new Date().toISOString().split('T')[0];
    let latestUpdateDate = '2026-07-14'; // Baseline date
    
    // Retrieve projectId from local config
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    let prjId = "amaanestate-97f4f";
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        if (config.projectId) {
          prjId = config.projectId;
        }
      } catch (e) {
        console.error("[SITEMAP] Failed to parse firebase-applet-config.json:", e);
      }
    }

    // Directly use the established REST client for ALL data fetching to guarantee stability
    console.log("[SITEMAP] Starting dynamic REST-based Firestore queries for sitemap...");
    
    const [articles, editorialReviews, softwareTools, techGearProducts] = await Promise.all([
      fetchCollectionRest("articles", prjId),
      fetchCollectionRest("editorial_reviews", prjId),
      fetchCollectionRest("software_tools", prjId),
      fetchCollectionRest("tech_gear_products", prjId)
    ]);
    
    const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];
    const dynamicUrls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];

    const isLegacyRealEstate = (slug: string, title: string): boolean => {
      const s = (slug || '').toLowerCase();
      const t = (title || '').toLowerCase();
      
      const keywords = [
        'estate', 'property', 'house', 'rent', 'land', 'city', 'cities', 'jigjiga', 'jijiga',
        'dire-dawa', 'dire dawa', 'somali', 'soomaali', 'guri', 'dhul', 'kire', 'kira', 'hanti',
        'iib', 'maalgashi', 'africa', 'ethiopia', 'maanestate'
      ];
      
      return keywords.some(k => s.includes(k) || t.includes(k));
    };

    const isValidSlug = (slug: any): boolean => {
      if (!slug || typeof slug !== 'string') return false;
      const s = slug.toLowerCase().trim();
      
      const excludedKeywords = [
        'preview', 'draft', 'temp', 'test', 'amaan-editorial-studio', 
        'editorial-studio', 'new-article', 'placeholder', 'undefined', 'null'
      ];
      if (excludedKeywords.some(k => s.includes(k))) {
        return false;
      }

      // Block standalone editor paths to avoid matching 'video-editor'
      if (s === 'editor' || s.startsWith('editor/') || s.endsWith('/editor')) {
        return false;
      }
      
      if (s.includes('[') || s.includes(']') || s.includes('{') || s.includes('}') || s.includes('<') || s.includes('>') || s.includes(' ') || s.includes('(') || s.includes(')')) {
        return false;
      }
      
      return true;
    };

    const calculateLastmod = (data: any): string => {
      let lastmod = dynamicDate;
      try {
        if (data.updatedAt && typeof data.updatedAt.seconds === 'number') {
          lastmod = new Date(data.updatedAt.seconds * 1000).toISOString().split('T')[0];
        } else if (data.createdAt && typeof data.createdAt.seconds === 'number') {
          lastmod = new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0];
        }
      } catch (e) {
        console.error(`[SITEMAP] Error calculating lastmod:`, e);
      }
      return lastmod;
    };

    // 1. Process Blog/News Articles
    articles.forEach((data: any) => {
      // Exclude deleted content
      if (data.deleted === true || data.isDeleted === true || data.status === 'deleted' || data.status === 'DELETED') {
        metrics.totalUrlsExcluded++;
        return;
      }

      // Exclude drafts / hidden content / unpublished items explicitly
      if (data.draft === true || data.status === 'draft' || data.status === 'DRAFT' || data.status === 'pending') {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notPublished++;
        return;
      }

      if (data.hidden === true || data.visibility === 'hidden' || data.visibility === 'private' || data.visibility === 'PRIVATE') {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notPublic++;
        return;
      }

      let slug = data.slug;
      if (!slug && data.title) {
        slug = data.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
      }
      if (!slug) {
        slug = data.id;
      }
      const title = data.title || '';

      const isPublished = data.status === 'published' || data.published === true || data.status === 'PUBLISHED';
      
      if (isPublished) {
        metrics.totalPublishedArticlesFound++;
      } else {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notPublished++;
        return;
      }

      const isLegacy = isLegacyRealEstate(slug, title);
      if (isLegacy) {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.legacyRealEstate++;
        return;
      }

      const isTech = true; // Since it's not legacy, it's a tech article!
      const isPublic = data.visibility === 'public' || (data.visibility === undefined && isTech);
      if (!isPublic) {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notPublic++;
        return;
      }

      const isIndexable = data.indexable === true || (data.indexable === undefined && isTech);
      if (!isIndexable) {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notIndexable++;
        return;
      }

      if (slug && (slug.includes('cities/') || slug.includes('/cities'))) {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.citiesRoute++;
        return;
      }

      if (!isValidSlug(slug)) {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.invalidSlug++;
        return;
      }

      const lastmod = calculateLastmod(data);
      if (lastmod > latestUpdateDate) latestUpdateDate = lastmod;
      
      dynamicUrls.push({
        loc: `https://www.amaanestate.com/news/${slug}`,
        lastmod,
        changefreq: "weekly",
        priority: "0.8"
      });
    });

    // 2. Process Editorial Reviews
    editorialReviews.forEach((data: any) => {
      // Exclude deleted content
      if (data.deleted === true || data.isDeleted === true || data.status === 'deleted' || data.status === 'DELETED') {
        metrics.totalUrlsExcluded++;
        return;
      }

      // Exclude drafts / hidden content / unpublished items explicitly
      if (data.draft === true || data.status === 'draft' || data.status === 'DRAFT' || data.status === 'pending') {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notPublished++;
        return;
      }

      if (data.hidden === true || data.visibility === 'hidden' || data.visibility === 'private' || data.visibility === 'PRIVATE') {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notPublic++;
        return;
      }

      let slug = data.slug;
      if (!slug && data.title) {
        slug = data.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
      }
      const title = data.title || '';

      const isPublished = data.status === 'approved' || data.status === 'published' || data.status === 'PUBLISHED' || data.published === true;
      if (!isPublished) {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notPublished++;
        return;
      }

      const isLegacy = isLegacyRealEstate(slug || '', title);
      if (isLegacy) {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.legacyRealEstate++;
        return;
      }

      const isPublic = data.visibility === 'public' || data.visibility === undefined;
      if (!isPublic) {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notPublic++;
        return;
      }

      const isIndexable = data.indexable === true || data.indexable === undefined;
      if (!isIndexable) {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notIndexable++;
        return;
      }

      const lastmod = calculateLastmod(data);
      if (lastmod > latestUpdateDate) latestUpdateDate = lastmod;

      if (slug && isValidSlug(slug)) {
        dynamicUrls.push({
          loc: `https://www.amaanestate.com/reviews/${slug}`,
          lastmod,
          changefreq: "weekly",
          priority: "0.8"
        });
      } else if (data.id && isValidSlug(data.id)) {
        dynamicUrls.push({
          loc: `https://www.amaanestate.com/product/rev-${data.id}`,
          lastmod,
          changefreq: "weekly",
          priority: "0.8"
        });
      } else {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.invalidSlug++;
      }
    });

    // 3. Process Software Tools
    softwareTools.forEach((data: any) => {
      // Exclude deleted content
      if (data.deleted === true || data.isDeleted === true || data.status === 'deleted' || data.status === 'DELETED') {
        metrics.totalUrlsExcluded++;
        return;
      }

      // Exclude drafts / hidden content / unpublished items explicitly
      if (data.draft === true || data.status === 'draft' || data.status === 'DRAFT' || data.status === 'pending') {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notPublished++;
        return;
      }

      if (data.hidden === true || data.visibility === 'hidden' || data.visibility === 'private' || data.visibility === 'PRIVATE') {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notPublic++;
        return;
      }

      let slug = data.slug;
      if (!slug && data.name) {
        slug = data.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
      }
      if (!slug) {
        slug = data.id;
      }

      const isPublished = data.status === 'published' || data.status === 'approved' || data.published === true;
      if (!isPublished) {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notPublished++;
        return;
      }

      const isPublic = data.visibility === 'public' || data.visibility === undefined;
      if (!isPublic) {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notPublic++;
        return;
      }

      const isIndexable = data.indexable === true || data.indexable === undefined;
      if (!isIndexable) {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notIndexable++;
        return;
      }

      const lastmod = calculateLastmod(data);
      if (lastmod > latestUpdateDate) latestUpdateDate = lastmod;

      if (slug && isValidSlug(slug)) {
        dynamicUrls.push({
          loc: `https://www.amaanestate.com/product/${slug}`,
          lastmod,
          changefreq: "weekly",
          priority: "0.8"
        });
      } else if (data.id && isValidSlug(data.id)) {
        dynamicUrls.push({
          loc: `https://www.amaanestate.com/product/sw-${data.id}`,
          lastmod,
          changefreq: "weekly",
          priority: "0.8"
        });
      } else {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.invalidSlug++;
      }
    });

    // 4. Process Tech Gear Products
    techGearProducts.forEach((data: any) => {
      // Exclude deleted content
      if (data.deleted === true || data.isDeleted === true || data.status === 'deleted' || data.status === 'DELETED') {
        metrics.totalUrlsExcluded++;
        return;
      }

      // Exclude drafts / hidden content / unpublished items explicitly
      if (data.draft === true || data.status === 'draft' || data.status === 'DRAFT' || data.status === 'pending') {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notPublished++;
        return;
      }

      if (data.hidden === true || data.visibility === 'hidden' || data.visibility === 'private' || data.visibility === 'PRIVATE') {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notPublic++;
        return;
      }

      const isPublished = data.status === 'approved' || data.status === 'published' || data.published === true;
      if (!isPublished) {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notPublished++;
        return;
      }

      const isPublic = data.visibility === 'public' || data.visibility === undefined;
      if (!isPublic) {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notPublic++;
        return;
      }

      const isIndexable = data.indexable === true || data.indexable === undefined;
      if (!isIndexable) {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.notIndexable++;
        return;
      }

      const lastmod = calculateLastmod(data);
      if (lastmod > latestUpdateDate) latestUpdateDate = lastmod;

      if (data.id && isValidSlug(data.id)) {
        const productSlug = data.id.startsWith('tg-') ? data.id : `tg-${data.id}`;
        dynamicUrls.push({
          loc: `https://www.amaanestate.com/product/${productSlug}`,
          lastmod,
          changefreq: "weekly",
          priority: "0.8"
        });
      } else {
        metrics.totalUrlsExcluded++;
        metrics.exclusionReasons.invalidSlug++;
      }
    });

    // Ensure latestUpdateDate doesn't overshoot today's date
    if (latestUpdateDate > dynamicDate) {
      latestUpdateDate = dynamicDate;
    }

    // Static Base Routes - Fully indexable matching the Software & Technology Review Platform
    urls.push({ loc: "https://www.amaanestate.com/", lastmod: latestUpdateDate, changefreq: "daily", priority: "1.0" });
    urls.push({ loc: "https://www.amaanestate.com/software", lastmod: latestUpdateDate, changefreq: "daily", priority: "0.9" });
    urls.push({ loc: "https://www.amaanestate.com/tech-gear", lastmod: latestUpdateDate, changefreq: "daily", priority: "0.9" });
    urls.push({ loc: "https://www.amaanestate.com/deals", lastmod: latestUpdateDate, changefreq: "daily", priority: "0.9" });
    urls.push({ loc: "https://www.amaanestate.com/news", lastmod: latestUpdateDate, changefreq: "daily", priority: "0.8" });
    urls.push({ loc: "https://www.amaanestate.com/about", lastmod: latestUpdateDate, changefreq: "monthly", priority: "0.7" });
    urls.push({ loc: "https://www.amaanestate.com/contact", lastmod: latestUpdateDate, changefreq: "monthly", priority: "0.7" });
    urls.push({ loc: "https://www.amaanestate.com/agreements", lastmod: latestUpdateDate, changefreq: "monthly", priority: "0.7" });
    urls.push({ loc: "https://www.amaanestate.com/privacy", lastmod: latestUpdateDate, changefreq: "monthly", priority: "0.5" });
    urls.push({ loc: "https://www.amaanestate.com/terms", lastmod: latestUpdateDate, changefreq: "monthly", priority: "0.5" });
    urls.push({ loc: "https://www.amaanestate.com/disclaimer", lastmod: latestUpdateDate, changefreq: "monthly", priority: "0.5" });

    // Append dynamic URLs
    urls.push(...dynamicUrls);
    metrics.totalUrlsIncluded = urls.length;

    console.log("\n============================================");
    console.log("       SITEMAP GENERATION METRICS REPORT     ");
    console.log("============================================");
    console.log(`Total Published Articles Found: ${metrics.totalPublishedArticlesFound}`);
    console.log(`Total URLs Included in Sitemap: ${metrics.totalUrlsIncluded}`);
    console.log(`Total URLs Excluded from Sitemap: ${metrics.totalUrlsExcluded}`);
    console.log("Exclusion Breakdown:");
    console.log(` - Legacy Real Estate content: ${metrics.exclusionReasons.legacyRealEstate}`);
    console.log(` - Invalid / temporary slug: ${metrics.exclusionReasons.invalidSlug}`);
    console.log(` - Not marked as Published: ${metrics.exclusionReasons.notPublished}`);
    console.log(` - Not marked as Public: ${metrics.exclusionReasons.notPublic}`);
    console.log(` - Not marked as Indexable: ${metrics.exclusionReasons.notIndexable}`);
    console.log(` - Cities route / cities slug: ${metrics.exclusionReasons.citiesRoute}`);
    console.log("============================================\n");

    // Build XML sitemap complying with Google's XML sitemap protocols
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    urls.forEach(url => {
      xml += `  <url>\n`;
      xml += `    <loc>${url.loc}</loc>\n`;
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += `  </url>\n`;
    });
    
    xml += `</urlset>`;
    return { xml, count: urls.length, metrics };
  } catch (err: any) {
    console.error("[SITEMAP] CRITICAL ERROR in generation:", err.message);
    throw err;
  }
}

function generateRobotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: https://www.amaanestate.com/sitemap.xml\n`;
}


// Initialize Gemini Client Lazily using secure system variable
let genAI: any = null;
function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  
  if (!genAI) {
    if (!key) {
      console.error("[PROD] CRITICAL: GEMINI_API_KEY is null or undefined in backend.");
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    
    try {
      genAI = new GoogleGenAI({ 
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("[PROD] Gemini AI client initialized successfully with aistudio-build UA.");
    } catch (err) {
      console.error("[PROD] Failed to initialize GoogleGenAI client:", err);
      throw err;
    }
  }
  return genAI;
}

// Fetch and compile database context in real-time
async function fetchDatabaseContext() {
  const firestoreDb = getAdminDb();
  if (!firestoreDb) {
    console.error("[PROD] Firestore Database connection failed - check firebase configuration.");
    return {
      articlesStr: "No news intelligence database connection."
    };
  }

  let articlesStr = "No news articles active.";

  try {
    const articleSnap = await firestoreDb.collection("articles")
      .where("published", "==", true)
      .limit(30)
      .get();
    
    if (!articleSnap.empty) {
      const items = articleSnap.docs.map(docSnapshot => {
        const d = docSnapshot.data();
        return `- ID: ${docSnapshot.id} | Title: ${d.title} | Category: ${d.category} | Language: ${d.language} | Summary: ${d.summary}`;
      });
      articlesStr = items.join("\n");
    }
  } catch (err) {
    console.error("[PROD] Error fetching articles context:", err);
  }

  return { articlesStr };
}

// API Routes
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  let contextData = {
    articlesStr: "No news articles active."
  };

  try {
    contextData = await fetchDatabaseContext();
  } catch (dbErr) {
    console.error("Error pre-fetching firestore context:", dbErr);
  }

  let genAIClient: any;
  try {
    genAIClient = getGeminiClient();
  } catch (err: any) {
    console.error("[PROD] Gemini client initialization error:", err.message);
    return res.json({ text: "I'm sorry, the PrimeDeals AI service is currently unavailable. Please check the GEMINI_API_KEY configuration." });
  }

  try {
    const systemInstruction = `You are PrimeDeals AI Assistant, an elite tech affiliate and software review specialist.

Your job is to help users find:
- Software & SaaS tools
- Tech gear & Laptops
- Productivity benchmarks
- Strategic offers & deals
- Professional tech reviews
- Industry insights

You must behave like a tech-savvy, professional, and insightful assistant.

========================
IMPORTANT RULES
========================

1. ONLY use the verified listings and assessment data provided to you.
Do NOT invent fake software prices or specs.

2. DO NOT exaggerate technical specs.

3. If no matching software or deal exists:
- politely explain that no exact review was found
- suggest similar alternatives if available
- ALWAYS use this exact fallback message if nothing is found: "Currently I could not find an exact match, but new reviews and deals are added regularly."

4. Handle Somali and English language naturally.

========================
BRAND IDENTITY
========================

You represent PrimeDeals.

PrimeDeals is the premier tech affiliate and professional review platform. We specialize in software depth, hardware performance benchmarks, and exclusive strategic offers.

Always maintain professionalism and trust.

--- LIVE CONTEXT DATA (USE THIS DATA TO ANSWER QUERIES) ---
LATEST PORTAL INTEL & ARTICLES:
${contextData.articlesStr}
----------------------------------`;

    const model = genAIClient.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: {
        role: "system",
        parts: [{ text: systemInstruction }]
      }
    });

    const chatSession = model.startChat({
      history: history?.map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text || h.content || "" }]
      })) || []
    });

    const result = await chatSession.sendMessage(message);
    const finalResponseText = result.response.text();
    res.json({ text: finalResponseText });
  } catch (error: any) {
    const errMsg = error.message || "Unknown API issue";
    const cleanedMsg = errMsg.replace(/AIzaSy[A-Za-z0-9_\-]{33}/g, "[REDACTED_API_KEY]");
    console.error("[PROD] AI Assistant API error:", cleanedMsg);
    res.json({ text: "I'm sorry, the AI service is currently busy. Please try again in a few moments." });
  }
});

app.post("/api/contact", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required" });
  }
  try {
    const rc = getResendClient();
    await rc.emails.send({
      from: 'PrimeDeals <onboarding@resend.dev>', // Use verified domain later
      to: 'jamamahamoud01@farrmuu',
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Resend error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Helper functions to demarshal Firestore REST API payload
function demarshalFirestoreValue(val: any): any {
  if (!val || typeof val !== 'object') return val;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) {
    const list = val.arrayValue.values || [];
    return list.map((item: any) => demarshalFirestoreValue(item));
  }
  if ('mapValue' in val) {
    const fields = val.mapValue.fields || {};
    const res: any = {};
    for (const k of Object.keys(fields)) {
      res[k] = demarshalFirestoreValue(fields[k]);
    }
    return res;
  }
  return val;
}

function demarshalFirestoreDoc(doc: any): any {
  if (!doc || !doc.fields) return null;
  const id = doc.name ? doc.name.substring(doc.name.lastIndexOf('/') + 1) : '';
  const result: any = { id };
  for (const k of Object.keys(doc.fields)) {
    result[k] = demarshalFirestoreValue(doc.fields[k]);
  }
  return result;
}

// GET /api/deals - Unified endpoint for Deals & Offers
app.get("/api/deals", async (req, res) => {
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    let projectId = "amaanestate-97f4f";
    if (fs.existsSync(configPath)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
        if (cfg.projectId) {
          projectId = cfg.projectId;
        }
      } catch (e) {
        console.error("Failed to read firebase config in /api/deals:", e);
      }
    }

    const { status } = req.query;
    let dealsList: any[] = [];
    let productsList: any[] = [];
    let fetchedViaAdmin = false;

    // Helper to serialize Admin SDK timestamps/objects cleanly to client format
    const serializeAdminDoc = (doc: any) => {
      if (!doc) return doc;
      const result = { ...doc };
      for (const key of Object.keys(result)) {
        const val = result[key];
        if (val && typeof val === "object" && typeof val.toDate === "function") {
          result[key] = val.toDate().toISOString();
        }
      }
      return result;
    };

    const adminDbInstance = getAdminDb();
    if (adminDbInstance) {
      try {
        console.log("[API DEALS] Attempting to fetch deals & products via Firebase Admin SDK...");
        const dealsSnap = await adminDbInstance.collection("deals_and_offers").get();
        dealsList = dealsSnap.docs.map((doc: any) => serializeAdminDoc({ id: doc.id, ...doc.data() }));

        const productsSnap = await adminDbInstance.collection("tech_gear_products").get();
        productsList = productsSnap.docs.map((doc: any) => serializeAdminDoc({ id: doc.id, ...doc.data() }));

        fetchedViaAdmin = true;
        console.log(`[API DEALS] Successfully fetched ${dealsList.length} deals and ${productsList.length} products via Admin SDK.`);
      } catch (adminErr) {
        console.log("[API DEALS] Firebase Admin SDK fetch not authorized, falling back to REST API.");
      }
    }

    if (!fetchedViaAdmin) {
      let apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "";
      if (apiKey.includes("REPLACE_ME") || apiKey.includes("Placeholder") || apiKey === "undefined") {
        apiKey = "";
      }
      const keyParam = apiKey ? `?key=${apiKey}` : "";

      // Fetch master deals and offers from Firestore via secure REST API
      const dealsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/deals_and_offers${keyParam}`;
      console.log(`[API DEALS] Fetching deals from REST URL: ${dealsUrl.replace(/key=[^&]+/, "key=REDACTED")}`);
      const responseDeals = await fetch(dealsUrl);
      if (!responseDeals.ok) {
        const errText = await responseDeals.text();
        throw new Error(`REST Firestore Deals request failed with status ${responseDeals.status}: ${errText}`);
      }
      const dealsData: any = await responseDeals.json();
      dealsList = (dealsData.documents || []).map(demarshalFirestoreDoc).filter(Boolean);

      // Fetch tech gear products from Firestore via secure REST API
      const productsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/tech_gear_products${keyParam}`;
      console.log(`[API DEALS] Fetching products from REST URL: ${productsUrl.replace(/key=[^&]+/, "key=REDACTED")}`);
      const responseProducts = await fetch(productsUrl);
      if (!responseProducts.ok) {
        const errText = await responseProducts.text();
        throw new Error(`REST Firestore Products request failed with status ${responseProducts.status}: ${errText}`);
      }
      const productsData: any = await responseProducts.json();
      productsList = (productsData.documents || []).map(demarshalFirestoreDoc).filter(Boolean);
    }

    // Flexible status filtering: if filtering for 'approved', we accept 'approved', 'active', and 'published'
    if (status === 'approved') {
      const allowedStatuses = ['approved', 'active', 'published'];
      dealsList = dealsList.filter((deal: any) => allowedStatuses.includes(deal.status));
    } else if (status) {
      dealsList = dealsList.filter((deal: any) => deal.status === status);
    }

    const productsMap = new Map();
    const allowedProductStatuses = ['approved', 'active', 'published'];
    
    for (const prod of productsList) {
      if (allowedProductStatuses.includes(prod.status)) {
        productsMap.set(prod.id, prod);
      }
    }

    // Resolve product reference details, supporting multiple campaigns/deals on the same product, and falling back to self-contained fields
    const resolved: any[] = [];

    for (const deal of dealsList) {
      const product = productsMap.get(deal.productId) || null;
      if (product) {
        resolved.push({
          ...deal,
          product
        });
      } else {
        // Self-contained deal (allows standalone deals without a linked physical tech product)
        const dealTitle = deal.dealTitle || deal.title || deal.productName || "Exclusive Deal";
        const featuredImg = deal.featuredImage || deal.image || "/house_luxury_icon.png";
        const cat = deal.category || "General";
        const originalPriceVal = typeof deal.originalPrice === 'number' ? deal.originalPrice : typeof deal.dealPrice === 'number' ? deal.dealPrice : 0;

        resolved.push({
          ...deal,
          product: {
            id: deal.productId || deal.id,
            title: dealTitle,
            featuredImage: featuredImg,
            brandName: deal.brandName || cat || "Premium Partner",
            price: originalPriceVal,
            status: "published",
            category: cat,
            description: deal.dealDescription || deal.description || ""
          }
        });
      }
    }

    // Sort by: publishedAt DESC, falling back to createdAt DESC
    resolved.sort((a, b) => {
      const getVal = (x: any) => {
        if (!x) return 0;
        if (x.publishedAt) {
          const parsed = new Date(x.publishedAt);
          if (!isNaN(parsed.getTime())) return parsed.getTime();
        }
        if (x.createdAt) {
          const parsed = new Date(x.createdAt);
          if (!isNaN(parsed.getTime())) return parsed.getTime();
        }
        return 0;
      };
      return getVal(b) - getVal(a);
    });

    res.json(resolved);
  } catch (err: any) {
    console.error("Failed to fetch deals in /api/deals via REST:", err);
    res.status(500).json({ error: err.message || "Failed to fetch deals" });
  }
});

// Helper to fetch details for dynamic SEO tags from the firestore collection
async function getArticleMetadata(idOrSlug: string) {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  let prjId = "amaanestate-97f4f";
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      if (config.projectId) {
        prjId = config.projectId;
      }
    } catch (e) {
      console.error("[SEO SERVER] Failed to parse firebase-applet-config.json:", e);
    }
  }

  try {
    const articles = await fetchCollectionRest("articles", prjId);
    
    // Find by ID or by slug
    const article = articles.find((a: any) => a.id === idOrSlug || (a.slug && a.slug === idOrSlug));
    
    if (article) {
      return article;
    }
  } catch (error) {
    console.error("[SEO SERVER] Error fetching article by doc id or slug via REST:", error);
  }
  return null;
}

async function getListingMetadata(id: string) {
  const firestoreDb = getAdminDb();
  if (!firestoreDb) return null;
  try {
    const docRef = firestoreDb.collection("listings").doc(id);
    const docSnap = await withTimeout(docRef.get(), 1500, null as any);
    if (docSnap && docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }
  } catch (error) {
    console.error("[SEO SERVER] Error fetching listing metadata:", error);
  }
  return null;
}

async function getBrokerMetadata(id: string) {
  const firestoreDb = getAdminDb();
  if (!firestoreDb) return null;
  try {
    const docRef = firestoreDb.collection("brokers").doc(id);
    const docSnap = await withTimeout(docRef.get(), 1500, null as any);
    if (docSnap && docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }
  } catch (error) {
    console.error("[SEO SERVER] Error fetching broker metadata:", error);
  }
  return null;
}

async function servePageWithMetadata(req: express.Request, res: express.Response, next: express.NextFunction, seoData: { title: string; description: string; imageUrl?: string; urlPath: string; type?: string }) {
  try {
    let templatePath = "";
    const searchPaths = [
      path.resolve(process.cwd(), 'dist', 'index.html'),
      path.resolve(process.cwd(), 'index.html'),
      path.resolve(__dirname, '..', 'dist', 'index.html'),
      path.resolve(__dirname, '..', 'index.html'),
      path.resolve(__dirname, 'index.html')
    ];
    
    for (const p of searchPaths) {
      if (fs.existsSync(p)) {
        templatePath = p;
        break;
      }
    }
    
    if (!templatePath) {
      console.error("[SEO SERVER] ERROR: No template path found!");
      return next();
    }
    
    let template = fs.readFileSync(templatePath, 'utf-8');
    console.log("[SEO SERVER] Loading template from:", templatePath);
    
    if (process.env.NODE_ENV !== "production") {
      const vite = app.get('vite');
      if (vite) {
        template = await vite.transformIndexHtml(req.originalUrl, template);
      }
    }
    
    const title = seoData.title + " | PrimeDeals";
    const desc = seoData.description.substring(0, 160);
    const ogType = seoData.type || "website";
    let imageUrl = seoData.imageUrl;
    
    // Force absolute domain and HTTPS
    const host = 'www.primedeals.app';
    const protocol = 'https';

    if (imageUrl) {
      // Ensure image is an absolute URL
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        const separatorPath = imageUrl.startsWith("/") ? "" : "/";
        imageUrl = `${protocol}://${host}${separatorPath}${imageUrl}`;
      } else if (imageUrl.startsWith('http://')) {
        imageUrl = imageUrl.replace(/^http:\/\//i, 'https://');
      }
      
      // Append cache buster to the image URL so CDNs/scrapers don't cache stale images
      // const separator = imageUrl.includes('?') ? '&' : '?';
      // imageUrl = `${imageUrl}${separator}v=${Date.now()}`;
    }
    const absolutePageUrl = `${protocol}://${host}${seoData.urlPath}`;
    
    // Robustly clean existing tags that might conflict
    template = template
      .replace(/<title>[\s\S]*?<\/title>/gi, '')
      .replace(/<link[^>]*rel=["']?canonical["']?[^>]*>/gi, '')
      .replace(/<meta[^>]*name=["']?description["']?[^>]*>/gi, '')
      .replace(/<meta[^>]*property=["']?og:[^>]*=["']?[^>]*>/gi, '')
      .replace(/<meta[^>]*name=["']?og:[^>]*=["']?[^>]*>/gi, '')
      .replace(/<meta[^>]*property=["']?twitter:[^>]*=["']?[^>]*>/gi, '')
      .replace(/<meta[^>]*name=["']?twitter:[^>]*=["']?[^>]*>/gi, '');

    const imageTags = `
    <meta property="og:image" content="${imageUrl || `https://${host}/default-og-image.jpg`}" />
    <meta name="twitter:image" content="${imageUrl || `https://${host}/default-og-image.jpg`}" />
    `;

    const dynamicMetaTags = `
    <title>${title}</title>
    <meta name="description" content="${desc.replace(/"/g, '&quot;')}" />
    <meta property="og:site_name" content="PrimeDeals" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${desc.replace(/"/g, '&quot;')}" />
    <meta property="og:url" content="${absolutePageUrl}" />
    ${imageTags}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${desc.replace(/"/g, '&quot;')}" />
    <meta name="twitter:url" content="${absolutePageUrl}" />
    <link rel="canonical" href="${absolutePageUrl}" />
    `;
    
    // Inject at the very beginning of the head tag
    template = template.replace(/<head>/i, `<head>\n${dynamicMetaTags}`);
    
    console.log("[SEO SERVER] Template after injection:", template.substring(0, 1000));
    
    // Disable HTTP/CDN caching via response headers for correct dynamic previews
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
  } catch (err) {
    console.error("[SEO SERVER] servePageWithMetadata failed:", err);
    // Instead of crashing the request, fall through to the SPA (next())
    // which will present the page correctly.
    next();
  }
}


async function startServer() {
  const PORT = 3000;

  // Vite middleware for development setup (moved up so we can reuse instance)
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
    app.set('vite', vite);
  }

  // XML Sitemap Endpoint
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const { xml } = await generateSitemapXml();
      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (err: any) {
      console.error("[SEO SERVER] Sitemap generation error:", err.message);
      res.status(500).send("Internal Server Error: " + err.message);
    }
  });

  // Sitemap Metrics Endpoint
  app.get("/api/sitemap-metrics", async (req, res) => {
    try {
      const { metrics } = await generateSitemapXml();
      res.json(metrics);
    } catch (err: any) {
      console.error("[SEO SERVER] Metrics fetch error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // robots.txt Endpoint
  app.get("/robots.txt", (req, res) => {
    res.header("Content-Type", "text/plain");
    res.send(generateRobotsTxt());
  });

  // Dynamic SEO Middleware Interceptor for news articles
  app.get("/news/:id", async (req, res, next) => {
    const userAgent = req.headers["user-agent"] || "";
    const isBot = /facebookexternalhit|Twitterbot|WhatsApp|LinkedInBot|discordbot|TelegramBot|Slackbot/i.test(userAgent);
    
    let meta: any = null;
    try {
      meta = await getArticleMetadata(req.params.id);
    } catch (err) {
      console.error("[SEO SERVER] Error pre-fetching article metadata:", err);
    }

    if (meta) {
      // If we have database metadata, always serve it
      const targetSlug = meta.slug || req.params.id;
      if (req.params.id !== targetSlug) {
        console.log(`[SEO SERVER] Redirecting 301 from /news/${req.params.id} to /news/${targetSlug}`);
        return res.redirect(301, `/news/${targetSlug}`);
      }

      const title = meta.title || "Latest News Article";
      const description = meta.summary || (meta.content ? (meta.content.substring(0, 160) + "...") : "Read the latest tech update on PrimeDeals.");
      
      // Resolve dynamic image with prioritized fallbacks
      let imageUrl: string | undefined = undefined;
      if (meta.socialImage && typeof meta.socialImage === 'string' && meta.socialImage.trim() !== '') {
        imageUrl = meta.socialImage.trim();
      } else if (meta.featuredImage && typeof meta.featuredImage === 'string' && meta.featuredImage.trim() !== '') {
        imageUrl = meta.featuredImage.trim();
      } else if (meta.gallery && Array.isArray(meta.gallery) && meta.gallery.length > 0) {
        const firstGallery = meta.gallery.find((g: any) => typeof g === 'string' && g.trim() !== '');
        if (firstGallery) {
          imageUrl = firstGallery.trim();
        }
      }
      
      if (!imageUrl) {
        imageUrl = '/house_luxury_icon.png';
      }

      return servePageWithMetadata(req, res, next, {
        title,
        description,
        imageUrl,
        urlPath: `/news/${targetSlug}`,
        type: 'article'
      });
    }

    // If metadata was not found in database (or database timed out / errored / credentials missing), but the request is from a scraper/bot:
    // Generate high-fidelity fallback SEO metadata dynamically based on the slug/parameters so that the bot
    // NEVER redirects, falls back to the homepage, or receives a blank preview.
    if (isBot) {
      const rawId = req.params.id;
      // Convert "amaan-estate-somalia" -> "Amaan Estate Somalia"
      const formattedTitle = rawId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      console.log(`[SEO SERVER] Generating on-the-fly fallback metadata for bot: ${userAgent}, slug: ${rawId}`);
      
      return servePageWithMetadata(req, res, next, {
        title: formattedTitle,
        description: `Read expert assessments, software reviews, and exclusive tech deals about ${formattedTitle} on PrimeDeals.`,
        imageUrl: '/house_luxury_icon.png',
        urlPath: `/news/${rawId}`,
        type: 'article'
      });
    }

    // Let regular human users load the dynamic React SPA layout router
    next();
  });

  // Dynamic SEO Middleware Interceptor for Properties
  app.get("/properties/:id", async (req, res, next) => {
    const hasCredentials = !process.env.VERCEL || process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!hasCredentials) {
      return next();
    }
    try {
      const meta = await getListingMetadata(req.params.id);
      if (meta) {
        const title = meta.title || "Premium Real Estate Property";
        const description = meta.description || `View features of this ${meta.category || "property"} in ${meta.city || "Somali Region"}.`;
        const imageUrl = (meta.images?.[0] && meta.images[0].trim() !== '') ? meta.images[0] : undefined;
        return servePageWithMetadata(req, res, next, {
          title,
          description,
          imageUrl,
          urlPath: `/properties/${req.params.id}`
        });
      }
    } catch (err) {
      console.error("[SEO SERVER] Error handling properties page metadata:", err);
    }
    next();
  });

  // Dynamic SEO Middleware Interceptor for Vehicles
  app.get("/vehicles/:id", async (req, res, next) => {
    const hasCredentials = !process.env.VERCEL || process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!hasCredentials) {
      return next();
    }
    try {
      const meta = await getListingMetadata(req.params.id);
      if (meta) {
        const title = meta.title || "Luxury Vehicle Rental";
        const description = meta.description || `View features of this vehicle/luxury hire in ${meta.city || "Somali Region"}.`;
        const imageUrl = (meta.images?.[0] && meta.images[0].trim() !== '') ? meta.images[0] : undefined;
        return servePageWithMetadata(req, res, next, {
          title,
          description,
          imageUrl,
          urlPath: `/vehicles/${req.params.id}`
        });
      }
    } catch (err) {
      console.error("[SEO SERVER] Error handling vehicles page metadata:", err);
    }
    next();
  });

  // Dynamic SEO Middleware Interceptor for Agents/Brokers
  app.get("/agents/:id", async (req, res, next) => {
    const hasCredentials = !process.env.VERCEL || process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!hasCredentials) {
      return next();
    }
    try {
      const meta = await getBrokerMetadata(req.params.id);
      if (meta) {
        const title = meta.fullName || "Certified Broker";
        const description = `Contact professional real estate specialist in ${meta.city || "Somali Region"}. Learn more details.`;
        const imageUrl = (meta.profilePhotoUrl && meta.profilePhotoUrl.trim() !== '') ? meta.profilePhotoUrl : ((meta.logo && meta.logo.trim() !== '') ? meta.logo : undefined);
        return servePageWithMetadata(req, res, next, {
          title,
          description,
          imageUrl,
          urlPath: `/agents/${req.params.id}`
        });
      }
    } catch (err) {
      console.error("[SEO SERVER] Error handling agents page metadata:", err);
    }
    next();
  });

  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    app.use("*", async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        const vite = app.get('vite');
        if (vite) {
          template = await vite.transformIndexHtml(url, template);
        }
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        const vite = app.get('vite');
        if (vite) {
          vite.ssrFixStacktrace(e);
        }
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", async (req, res) => {
      // Direct API requested but unmatched route path
      if (req.path.startsWith('/api') && !req.path.startsWith('/api/index')) {
        return res.status(404).json({
          error: "NotFound",
          message: `API endpoint '${req.path}' not found`,
          status: 404
        });
      }

      // Force serve metadata for bots on dynamic news routes
      const isBot = /facebookexternalhit|Twitterbot|WhatsApp|LinkedInBot|discordbot|TelegramBot|Slackbot/i.test(req.headers["user-agent"] || "");
      if (isBot && req.path.startsWith("/news/")) {
        const idOrSlug = req.path.split('/')[2];
        if (idOrSlug) {
          const meta = await getArticleMetadata(idOrSlug);
          const title = meta?.title || idOrSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          const description = meta?.summary || (meta?.content ? (meta.content.substring(0, 160) + "...") : `Read dynamic updates, tech reviews, and premium software news about ${title} on PrimeDeals.`);
          
          let imageUrl: string | undefined = undefined;
          if (meta) {
            if (meta.socialImage && typeof meta.socialImage === 'string' && meta.socialImage.trim() !== '') {
              imageUrl = meta.socialImage.trim();
            } else if (meta.featuredImage && typeof meta.featuredImage === 'string' && meta.featuredImage.trim() !== '') {
              imageUrl = meta.featuredImage.trim();
            } else if (meta.gallery && Array.isArray(meta.gallery) && meta.gallery.length > 0) {
              const firstGallery = meta.gallery.find((g: any) => typeof g === 'string' && g.trim() !== '');
              if (firstGallery) {
                imageUrl = firstGallery.trim();
              }
            }
          }
          
          if (!imageUrl) {
            imageUrl = '/house_luxury_icon.png';
          }

          return servePageWithMetadata(req, res, () => {}, {
            title,
            description,
            imageUrl,
            urlPath: `/news/${meta?.slug || idOrSlug}`,
            type: 'article'
          });
        }
      }

      // Find index.html in common build directories to serve client SPA
      let templatePath = "";
      const searchPaths = [
        path.resolve(process.cwd(), 'dist', 'index.html'),
        path.resolve(process.cwd(), 'index.html'),
        path.resolve(__dirname, '..', 'dist', 'index.html'),
        path.resolve(__dirname, '..', 'index.html'),
        path.resolve(__dirname, 'index.html')
      ];

      for (const p of searchPaths) {
        if (fs.existsSync(p)) {
          templatePath = p;
          break;
        }
      }

      if (templatePath) {
        let htmlContents = fs.readFileSync(templatePath, 'utf8');
        const firebaseRuntimeConfig = {
          apiKey: process.env.VITE_FIREBASE_API_KEY || "",
          authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "amaanestate-97f4f.firebaseapp.com",
          projectId: process.env.VITE_FIREBASE_PROJECT_ID || "amaanestate-97f4f",
          storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "amaanestate-97f4f.firebasestorage.app",
          messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "978752259304",
          appId: process.env.VITE_FIREBASE_APP_ID || "1:978752259304:web:ae1553196f9854566d7e55",
          firestoreDatabaseId: process.env.VITE_FIREBASE_DATABASE_ID || "(default)"
        };
        const configScript = `<script>window.FIREBASE_CONFIG = ${JSON.stringify(firebaseRuntimeConfig)};</script>`;
        htmlContents = htmlContents.replace('<head>', `<head>${configScript}`);
        res.status(200).set({ 'Content-Type': 'text/html' }).send(htmlContents);
      } else {
        console.warn("[SEO SERVER] index.html not found in any common build directories at runtime. Rendering dynamic fallback shell.");
        res.status(200).set({ 'Content-Type': 'text/html' }).end(`<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AmaanEstate - Premium Portal</title>
    <!-- Impact.com Verification -->
    <meta name='impact-site-verification' value='567d6111-d094-481f-ba51-0aa4e73d9cf2'>
    
    <!-- Google AdSense Verification -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7610767464764502"
      crossorigin="anonymous"></script>

    <meta name="description" content="A premium real estate and luxury vehicle portal." />
  </head>
  <body>
    <div id="root">Loading AmaanEstate Portal...</div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>`);
      }
    });
  }

  // Global Express Error-Parser and Exception Shielding
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[CRITICAL SHIELD] Caught unhandled exception inside Express route pipeline:", err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "An internal system exception occurred, registered under ID: " + Date.now(),
      status: 500
    });
  });

  // Only listen if not in serverless environment
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[PROD] Server running on http://localhost:${PORT}`);
    });
  }
}

// Start the server (registers all middleware, sitemap/robots endpoints, and dynamic SEO handlers)
startServer().catch(err => {
  console.error("[CRITICAL] Failed to start server:", err);
});

// Initialize Firebase Admin for backend privileged access
let adminDb: any = null;
function getAdminDb() {
  if (!adminDb) {
    try {
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      let firebaseConfig: any = {};
      
      if (fs.existsSync(configPath)) {
        firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
      } else {
        console.warn("[PROD] firebase-applet-config.json not found. Trying Env config.");
      }
      
      const saKey = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (!saKey) {
        console.log("[PROD] FIREBASE_SERVICE_ACCOUNT not found, running without Admin SDK privileged access.");
        return null;
      }

      if (getApps().length === 0) {
        console.log("[PROD] Initializing Firebase Admin with Service Account from ENV.");
        initializeApp({
          credential: cert(JSON.parse(saKey)),
          projectId: firebaseConfig.projectId
        });
      }
      
      const dbId = firebaseConfig.firestoreDatabaseId;
      const finalDbId = (dbId && dbId !== '(default)' && dbId !== 'default') ? dbId : undefined;
      
      const apps = getApps();
      const appRef = apps.length > 0 ? apps[0] : undefined;
      adminDb = finalDbId ? getFirestore(appRef, finalDbId) : getFirestore();
      console.log("[PROD] Firebase Admin initialized for Project ID:", firebaseConfig.projectId || "unknown");
    } catch (err) {
      console.error("[PROD] Failed to initialize Firebase Admin:", err);
      return null;
    }
  }
  return adminDb;
}
