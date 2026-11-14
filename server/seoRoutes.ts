import crypto from "crypto";
import fs from "fs";
import path from "path";
import type express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import { analyzeArticleSeo } from "../src/lib/seoAnalyzer";
import {
  computeIncomingArticleLinks,
  extractImagesFromContent,
  extractLinksFromContent,
  findBrokenInternalLinks,
  recommendInternalLinks,
} from "../src/lib/internalLinker";
import { LEGACY_NEWS_TO_ARTICLE_REDIRECTS } from "../src/lib/legacyRedirects";
import { ALL_SEED_EDITORIAL_ARTICLES } from "../src/data/allArticles";
import type {
  Article,
  Category,
  GscAnalyticsResponse,
  Property,
  SeoAuditIssue,
  SeoAuditRun,
  SeoRedirect,
} from "../src/types";

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

function getAppCallbackBaseUrl(): string {
  const appUrl = (process.env.APP_URL || process.env.CANONICAL_SITE_URL || "https://www.amaanestate.com")
    .trim()
    .replace(/\/+$/, "");
  return appUrl || "https://www.amaanestate.com";
}

function getGscRedirectUri(): string {
  return `${getAppCallbackBaseUrl()}/api/seo/gsc/callback`;
}

const PRODUCTION_GSC_CALLBACK_URL = "https://www.amaanestate.com/api/seo/gsc/callback";

function isMissingTableOrColumn(status: number, bodyText: string): boolean {
  return (
    status === 404 ||
    bodyText.includes("PGRST205") ||
    bodyText.includes("PGRST204") ||
    bodyText.includes("42P01") ||
    bodyText.includes("42703") ||
    bodyText.includes("does not exist")
  );
}

interface VerifiedAdminContext {
  userId: string;
  email: string;
  role: "admin" | "editor" | "local-demo";
  bearerToken: string | null;
}

type AdminAuthResult =
  | { ok: true; admin: VerifiedAdminContext; status?: number; error?: string }
  | { ok: false; status: number; error: string; admin?: VerifiedAdminContext };

async function verifyAdminRequest(req: express.Request): Promise<AdminAuthResult> {
  const sb = getSupabaseRuntime();
  if (!sb) {
    return {
      ok: true,
      admin: { userId: "demo-admin", email: "demo@amaanestate.com", role: "local-demo", bearerToken: null },
    };
  }

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
      return { ok: false, status: 401, error: "Your editorial session has expired. Please sign in again." };
    }
    const userData = (await userRes.json()) as { id?: string; email?: string };
    if (!userData?.id) {
      return { ok: false, status: 401, error: "Unable to verify Supabase user." };
    }

    const dbKey = sb.serviceRoleKey || token;
    const profileRes = await fetch(
      `${sb.url}/rest/v1/profiles?id=eq.${encodeURIComponent(userData.id)}&select=id,email,roles(name)&limit=1`,
      {
        headers: {
          apikey: sb.anonKey,
          Authorization: `Bearer ${dbKey}`,
        },
      }
    );

    if (!profileRes.ok) {
      return { ok: false, status: 403, error: "Unable to verify editorial role permissions." };
    }

    const rows = (await profileRes.json()) as Array<{ id: string; email?: string; roles?: { name?: string } }>;
    const roleName = rows?.[0]?.roles?.name;
    if (roleName !== "admin" && roleName !== "editor") {
      return { ok: false, status: 403, error: "Admin or Editor permissions are required." };
    }

    return {
      ok: true,
      admin: {
        userId: userData.id,
        email: userData.email || rows[0]?.email || "",
        role: roleName,
        bearerToken: token,
      },
    };
  } catch (err) {
    console.error("[SEO Auth] Verification failed:", err);
    return { ok: false, status: 500, error: "Failed to verify administrative permissions." };
  }
}

// ============================================================================
// Redirect Lookup Cache & Storage (DB + Safe Local Fallback)
// ============================================================================

const LOCAL_REDIRECTS_FILE = "/tmp/amaanestate_seo_redirects.json";
let redirectCache: { fetchedAt: number; items: SeoRedirect[] } | null = null;

function normalizeRedirectPath(rawPath: string): string {
  let clean = (rawPath || "").trim();
  if (!clean) return "/";
  try {
    if (/^https?:\/\//i.test(clean)) {
      const u = new URL(clean);
      clean = u.pathname + (u.search || "");
    }
  } catch {
    // keep raw
  }
  if (!clean.startsWith("/")) clean = `/${clean}`;
  if (clean.length > 1) clean = clean.replace(/\/+$/, "");
  return clean;
}

function readLocalRedirects(): SeoRedirect[] {
  try {
    if (fs.existsSync(LOCAL_REDIRECTS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(LOCAL_REDIRECTS_FILE, "utf8"));
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    // ignore
  }
  return [];
}

function writeLocalRedirects(items: SeoRedirect[]) {
  try {
    fs.writeFileSync(LOCAL_REDIRECTS_FILE, JSON.stringify(items, null, 2), "utf8");
  } catch {
    // ignore
  }
}

async function fetchRedirectsFromDb(bearerToken?: string | null): Promise<{
  redirects: SeoRedirect[];
  schemaPending: boolean;
}> {
  const sb = getSupabaseRuntime();
  if (!sb) {
    return { redirects: readLocalRedirects(), schemaPending: false };
  }

  const authToken = sb.serviceRoleKey || bearerToken || sb.anonKey;
  try {
    const res = await fetch(
      `${sb.url}/rest/v1/seo_redirects?select=*&order=created_at.desc&limit=1000`,
      {
        headers: {
          apikey: sb.anonKey,
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (isMissingTableOrColumn(res.status, text)) {
        return { redirects: readLocalRedirects(), schemaPending: true };
      }
      throw new Error(text || `Status ${res.status}`);
    }
    const rows = (await res.json()) as SeoRedirect[];
    const list = Array.isArray(rows) ? rows : [];
    redirectCache = { fetchedAt: Date.now(), items: list };
    return { redirects: list, schemaPending: false };
  } catch (err) {
    console.error("[SEO Redirects] Fetch error:", err);
    return { redirects: readLocalRedirects(), schemaPending: true };
  }
}

export async function lookupActiveRedirect(
  requestPath: string
): Promise<{ target_path: string; status_code: 301 | 302; source_path: string } | null> {
  const clean = normalizeRedirectPath(requestPath);
  if (
    clean.startsWith("/api/") ||
    clean.startsWith("/admin") ||
    clean === "/sitemap.xml" ||
    clean === "/robots.txt"
  ) {
    return null;
  }

  const now = Date.now();
  if (!redirectCache || now - redirectCache.fetchedAt > 30_000) {
    const { redirects } = await fetchRedirectsFromDb(null);
    redirectCache = { fetchedAt: now, items: redirects };
  }

  const match = redirectCache.items.find(
    (r) => r.is_active && r.source_path.toLowerCase() === clean.toLowerCase()
  );
  if (!match) return null;

  // Non-blocking hit counter increment
  const sb = getSupabaseRuntime();
  if (sb) {
    fetch(`${sb.url}/rest/v1/rpc/increment_seo_redirect_hit`, {
      method: "POST",
      headers: {
        apikey: sb.anonKey,
        Authorization: `Bearer ${sb.anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_source_path: match.source_path }),
    }).catch(() => {});
  }

  return {
    source_path: match.source_path,
    target_path: match.target_path,
    status_code: match.status_code === 302 ? 302 : 301,
  };
}

export async function getActiveRedirectSourceSet(): Promise<Set<string>> {
  const now = Date.now();
  if (!redirectCache || now - redirectCache.fetchedAt > 30_000) {
    const { redirects } = await fetchRedirectsFromDb(null);
    redirectCache = { fetchedAt: now, items: redirects };
  }
  return new Set(
    redirectCache.items
      .filter((r) => r.is_active)
      .map((r) => r.source_path.toLowerCase())
  );
}

// ============================================================================
// Google Search Console OAuth2 & Token Store (Server-Side Only)
// ============================================================================

interface StoredGscConnection {
  google_email?: string | null;
  selected_site_url?: string | null;
  permission_level?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
  token_expires_at?: string | null;
  scope?: string | null;
}

const LOCAL_GSC_FILE = "/tmp/amaanestate_gsc_connection.json";
const pendingOAuthStates = new Map<
  string,
  { createdAt: number; userId: string; bearerToken: string | null }
>();

function getOAuthStateSigningSecret(): string {
  return (
    (process.env.GOOGLE_OAUTH_CLIENT_SECRET || "").trim() ||
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim() ||
    "amaanestate-local-dev-oauth-state"
  );
}

function createSignedOAuthState(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      n: crypto.randomBytes(12).toString("hex"),
      iat: Date.now(),
      u: userId,
    }),
    "utf8"
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getOAuthStateSigningSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

function verifySignedOAuthState(state: string): { userId: string; createdAt: number } | null {
  if (!state || !state.includes(".")) return null;
  const parts = state.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  if (!payload || !sig) return null;
  const expectedSig = crypto
    .createHmac("sha256", getOAuthStateSigningSecret())
    .update(payload)
    .digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      iat?: number;
      u?: string;
    };
    if (!parsed?.iat || Date.now() - parsed.iat > 15 * 60_000) return null;
    return { userId: parsed.u || "admin", createdAt: parsed.iat };
  } catch {
    return null;
  }
}

function readLocalGsc(): StoredGscConnection | null {
  try {
    if (fs.existsSync(LOCAL_GSC_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_GSC_FILE, "utf8"));
    }
  } catch {
    // ignore
  }
  return null;
}

function writeLocalGsc(conn: StoredGscConnection | null) {
  try {
    if (!conn) {
      if (fs.existsSync(LOCAL_GSC_FILE)) fs.unlinkSync(LOCAL_GSC_FILE);
    } else {
      fs.writeFileSync(LOCAL_GSC_FILE, JSON.stringify(conn, null, 2), "utf8");
    }
  } catch {
    // ignore
  }
}

async function getStoredGscConnection(
  bearerToken?: string | null
): Promise<{ connection: StoredGscConnection | null; schemaPending: boolean }> {
  const sb = getSupabaseRuntime();
  const dbToken = sb?.serviceRoleKey || bearerToken;
  if (sb && dbToken) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/gsc_connections?id=eq.1&select=*&limit=1`, {
        headers: {
          apikey: sb.anonKey,
          Authorization: `Bearer ${dbToken}`,
        },
      });
      if (res.ok) {
        const rows = (await res.json()) as StoredGscConnection[];
        if (Array.isArray(rows) && rows.length > 0 && rows[0].access_token) {
          return { connection: rows[0], schemaPending: false };
        }
        return { connection: null, schemaPending: false };
      }
      const errText = await res.text().catch(() => "");
      if (isMissingTableOrColumn(res.status, errText)) {
        return { connection: readLocalGsc(), schemaPending: true };
      }
    } catch {
      // fall through to local fallback only when DB unreachable
    }
  }
  return { connection: readLocalGsc(), schemaPending: false };
}

async function saveStoredGscConnection(
  conn: StoredGscConnection,
  bearerToken?: string | null,
  userId?: string | null
): Promise<{ schemaPending: boolean }> {
  const sb = getSupabaseRuntime();
  const dbToken = sb?.serviceRoleKey || bearerToken;
  if (!sb || !dbToken) {
    writeLocalGsc(conn);
    return { schemaPending: false };
  }

  try {
    const res = await fetch(`${sb.url}/rest/v1/gsc_connections?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey: sb.anonKey,
        Authorization: `Bearer ${dbToken}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        id: 1,
        connected_by: userId && userId !== "demo-admin" ? userId : null,
        google_email: conn.google_email || null,
        selected_site_url: conn.selected_site_url || null,
        permission_level: conn.permission_level || null,
        access_token: conn.access_token || null,
        refresh_token: conn.refresh_token || null,
        token_expires_at: conn.token_expires_at || null,
        scope: conn.scope || null,
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      if (isMissingTableOrColumn(res.status, errText)) {
        writeLocalGsc(conn);
        return { schemaPending: true };
      }
    }
    writeLocalGsc(null);
    return { schemaPending: false };
  } catch {
    writeLocalGsc(conn);
    return { schemaPending: true };
  }
}

async function clearStoredGscConnection(bearerToken?: string | null) {
  writeLocalGsc(null);
  const sb = getSupabaseRuntime();
  const dbToken = sb?.serviceRoleKey || bearerToken;
  if (!sb || !dbToken) return;
  try {
    await fetch(`${sb.url}/rest/v1/gsc_connections?id=eq.1`, {
      method: "DELETE",
      headers: {
        apikey: sb.anonKey,
        Authorization: `Bearer ${dbToken}`,
      },
    });
  } catch {
    // ignore
  }
}

async function ensureFreshGscAccessToken(
  conn: StoredGscConnection,
  bearerToken?: string | null
): Promise<string | null> {
  if (!conn.access_token) return null;
  const expiresAtMs = conn.token_expires_at ? Date.parse(conn.token_expires_at) : 0;
  const isAlreadyExpired = Boolean(expiresAtMs && expiresAtMs <= Date.now());
  if (!expiresAtMs || expiresAtMs - Date.now() > 60_000) {
    return conn.access_token;
  }

  const clientId = (process.env.GOOGLE_OAUTH_CLIENT_ID || "").trim();
  const clientSecret = (process.env.GOOGLE_OAUTH_CLIENT_SECRET || "").trim();
  if (!clientId || !clientSecret || !conn.refresh_token) {
    return isAlreadyExpired ? null : conn.access_token;
  }

  try {
    const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: conn.refresh_token,
        grant_type: "refresh_token",
      }),
    });
    if (!refreshRes.ok) {
      return isAlreadyExpired ? null : conn.access_token;
    }
    const tokenJson = (await refreshRes.json()) as {
      access_token?: string;
      expires_in?: number;
      scope?: string;
    };
    if (!tokenJson.access_token) {
      return isAlreadyExpired ? null : conn.access_token;
    }

    const updated: StoredGscConnection = {
      ...conn,
      access_token: tokenJson.access_token,
      token_expires_at: new Date(
        Date.now() + (Number(tokenJson.expires_in) || 3500) * 1000
      ).toISOString(),
      scope: tokenJson.scope || conn.scope,
    };
    await saveStoredGscConnection(updated, bearerToken);
    return updated.access_token!;
  } catch {
    return isAlreadyExpired ? null : conn.access_token;
  }
}

async function fetchGscSitesResult(
  accessToken: string
): Promise<{ sites: Array<{ siteUrl: string; permissionLevel: string }>; unauthorized: boolean }> {
  const res = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) {
    return { sites: [], unauthorized: true };
  }
  if (!res.ok) return { sites: [], unauthorized: false };
  const json = (await res.json()) as { siteEntry?: Array<{ siteUrl: string; permissionLevel: string }> };
  return {
    sites: Array.isArray(json.siteEntry) ? json.siteEntry : [],
    unauthorized: false,
  };
}

async function fetchGscSitesWithToken(
  accessToken: string
): Promise<Array<{ siteUrl: string; permissionLevel: string }>> {
  const { sites } = await fetchGscSitesResult(accessToken);
  return sites;
}

function formatGscDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// ============================================================================
// Real Catalog Loader for Server Audit & AI Grounding
// ============================================================================

async function loadRealCmsCatalog(bearerToken?: string | null): Promise<{
  articles: Article[];
  properties: Property[];
  categories: Category[];
  redirects: SeoRedirect[];
  siteSettings: Record<string, any> | null;
}> {
  const sb = getSupabaseRuntime();
  const { redirects } = await fetchRedirectsFromDb(bearerToken);

  if (!sb) {
    const seedArticles: Article[] = ALL_SEED_EDITORIAL_ARTICLES.map((s, idx) => ({
      id: `seed-${idx + 1}`,
      title: s.title,
      slug: s.slug,
      excerpt: s.excerpt,
      content: s.content,
      featured_image: s.featured_image,
      featured_image_alt: s.featured_image_alt,
      featured_image_caption: s.featured_image_caption,
      gallery_images: [],
      category_id: `cat-${s.category_slug}`,
      author_id: "seed-author",
      category: {
        id: `cat-${s.category_slug}`,
        name: s.category_slug.replace(/-/g, " "),
        slug: s.category_slug,
        description: "",
        display_order: idx + 1,
        created_at: s.published_at,
      },
      status: "published",
      is_featured: Boolean(s.is_featured),
      reading_time: Math.max(
        4,
        Math.ceil((s.content || "").split(/\s+/).filter(Boolean).length / 200)
      ),
      view_count: 0,
      seo_title: s.seo_title,
      seo_description: s.seo_description,
      og_image: s.featured_image,
      focus_keyword: s.primary_keyword,
      supporting_keywords: s.secondary_keywords,
      robots_directive: "index, follow",
      schema_type: s.category_slug === "news" ? "NewsArticle" : "Article",
      published_at: s.published_at,
      created_at: s.published_at,
      updated_at: s.published_at,
    }));

    return {
      articles: seedArticles,
      properties: [],
      categories: [
        { id: "cat-investment", name: "Investment", slug: "investment", description: "", display_order: 1, created_at: "" },
        { id: "cat-architecture", name: "Architecture", slug: "architecture", description: "", display_order: 2, created_at: "" },
        { id: "cat-construction", name: "Construction", slug: "construction", description: "", display_order: 3, created_at: "" },
        { id: "cat-home-living", name: "Home & Living", slug: "home-living", description: "", display_order: 4, created_at: "" },
        { id: "cat-news", name: "News", slug: "news", description: "", display_order: 5, created_at: "" },
      ],
      redirects,
      siteSettings: null,
    };
  }

  const authToken = sb.serviceRoleKey || bearerToken || sb.anonKey;
  const headers = {
    apikey: sb.anonKey,
    Authorization: `Bearer ${authToken}`,
  };

  const [artRes, propRes, catRes, settingsRes] = await Promise.all([
    fetch(
      `${sb.url}/rest/v1/articles?select=*,categories(*),authors(*),article_tags(tags(*))&order=updated_at.desc&limit=1000`,
      { headers }
    ),
    fetch(
      `${sb.url}/rest/v1/properties?select=*,property_images(*)&publication_status=eq.published&limit=1000`,
      { headers }
    ),
    fetch(`${sb.url}/rest/v1/categories?select=*&order=display_order.asc`, { headers }),
    fetch(`${sb.url}/rest/v1/site_settings?id=eq.1&select=*&limit=1`, { headers }),
  ]);

  const rawArticles = artRes.ok ? ((await artRes.json()) as any[]) : [];
  const rawProperties = propRes.ok ? ((await propRes.json()) as any[]) : [];
  const rawCategories = catRes.ok ? ((await catRes.json()) as Category[]) : [];
  const rawSettings = settingsRes.ok ? ((await settingsRes.json()) as any[]) : [];

  const articles: Article[] = (Array.isArray(rawArticles) ? rawArticles : []).map((row) => ({
    ...row,
    category: row.categories || null,
    author: row.authors || null,
    tags: Array.isArray(row.article_tags) ? row.article_tags.map((t: any) => t.tags).filter(Boolean) : [],
    gallery_images: Array.isArray(row.gallery_images) ? row.gallery_images : [],
    supporting_keywords: Array.isArray(row.supporting_keywords) ? row.supporting_keywords : [],
  }));

  const properties: Property[] = (Array.isArray(rawProperties) ? rawProperties : []).map((row) => ({
    ...row,
    images: Array.isArray(row.property_images) ? row.property_images : [],
    is_sample: row.source_name === "showcase_sample" || Boolean(row.raw_payload?.is_sample),
  }));

  return {
    articles,
    properties,
    categories: Array.isArray(rawCategories) ? rawCategories : [],
    redirects,
    siteSettings: rawSettings?.[0] || null,
  };
}

// ============================================================================
// Register SEO Express Routes
// ============================================================================

export function registerSeoRoutes(app: express.Application) {
  // 1. Gemini-Powered SEO Actions (Review-Before-Apply; Server-Side Only)
  app.post("/api/seo/ai/optimize", async (req, res) => {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.error });
    }

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(503).json({
        code: "GEMINI_NOT_CONFIGURED",
        error:
          "AI SEO optimization requires GEMINI_API_KEY to be configured in your deployment environment secrets.",
      });
    }

    const body = req.body || {};
    const action = typeof body.action === "string" ? body.action.trim() : "analyze_full";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
    const content = typeof body.content === "string" ? body.content : "";
    const focusKeyword = typeof body.focusKeyword === "string" ? body.focusKeyword.trim() : "";
    const supportingKeywords = Array.isArray(body.supportingKeywords) ? body.supportingKeywords : [];
    const searchIntent = typeof body.searchIntent === "string" ? body.searchIntent : "Informational";
    const targetCountry = typeof body.targetCountry === "string" ? body.targetCountry.trim() : "";
    const targetAudience = typeof body.targetAudience === "string" ? body.targetAudience.trim() : "";
    const currentSeoTitle = typeof body.seoTitle === "string" ? body.seoTitle.trim() : "";
    const currentSeoDesc = typeof body.seoDescription === "string" ? body.seoDescription.trim() : "";

    if (!title && !content) {
      return res.status(400).json({ error: "Enter at least a headline or article content before running AI SEO actions." });
    }

    try {
      const catalog = await loadRealCmsCatalog(auth.admin.bearerToken);
      const publishedArticles = catalog.articles
        .filter((a) => a.status === "published" && a.slug !== slug)
        .slice(0, 40)
        .map((a) => ({
          title: a.title,
          url: `/articles/${a.slug}`,
          category: a.category?.name || "Editorial",
          focusKeyword: a.focus_keyword || "",
        }));
      const publishedProperties = catalog.properties
        .filter((p) => !p.is_sample && ["available", "pending", "under_contract"].includes(p.listing_status))
        .slice(0, 25)
        .map((p) => ({
          title: p.title,
          url: `/properties/${p.slug}`,
          location: `${p.city}, ${p.country}`,
          transactionType: p.transaction_type,
        }));
      const availableCategories = catalog.categories.map((c) => c.name);
      const existingSeoTitles = catalog.articles
        .filter((a) => a.slug !== slug)
        .map((a) => a.seo_title || a.title)
        .slice(0, 40);

      const plainBody = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 9000);
      const inlineImages = extractImagesFromContent(content).map((i) => ({ src: i.src, currentAlt: i.alt }));

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { "User-Agent": "aistudio-build" },
        },
      });

      const systemInstruction = [
        "You are an editorial SEO strategist for AmaanEstate (https://www.amaanestate.com), a Global Real Estate Media, Research & Marketplace platform.",
        "Follow modern Google Search helpful-content standards: prioritize clarity, accuracy, E-E-A-T, natural phrasing, and zero keyword stuffing.",
        "CRITICAL: For internalLinkSuggestions, you MUST ONLY select exact URLs from the provided PUBLISHED_ARTICLES or PUBLISHED_PROPERTIES JSON lists. NEVER invent or guess URLs.",
        "CRITICAL: For recommendedCategory, choose ONLY from AVAILABLE_CATEGORIES.",
        "Keep suggestedSeoTitle <= 60 characters and suggestedSeoDescription between 130 and 158 characters.",
        "Avoid duplicating any title in EXISTING_SITE_SEO_TITLES.",
      ].join("\n");

      const prompt = JSON.stringify({
        requestedAction: action,
        articleDraft: {
          title,
          slug,
          excerpt,
          currentSeoTitle,
          currentSeoDesc,
          focusKeyword,
          supportingKeywords,
          searchIntent,
          targetCountry,
          targetAudience,
          inlineImages,
          bodyExcerpt: plainBody,
        },
        AVAILABLE_CATEGORIES: availableCategories,
        EXISTING_SITE_SEO_TITLES: existingSeoTitles,
        PUBLISHED_ARTICLES: publishedArticles,
        PUBLISHED_PROPERTIES: publishedProperties,
      });

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "Concise editorial SEO summary." },
              suggestedFocusKeyword: { type: Type.STRING },
              suggestedSupportingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedSeoTitles: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-3 concise SEO title candidates under 60 characters.",
              },
              suggestedMetaDescriptions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-3 meta descriptions 130-158 characters.",
              },
              suggestedSlug: { type: Type.STRING },
              recommendedCategory: { type: Type.STRING },
              suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingHeadings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    level: { type: Type.STRING, description: "H2 or H3" },
                    heading: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                    draftParagraph: { type: Type.STRING },
                  },
                },
              },
              featuredImageAltSuggestion: { type: Type.STRING },
              keywordOveruseNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
              internalLinkSuggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    url: { type: Type.STRING },
                    anchorText: { type: Type.STRING },
                    reason: { type: Type.STRING },
                  },
                },
              },
              faqSuggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const rawText = (response.text || "{}").trim();
      let parsed: Record<string, any> = {};
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = { summary: rawText };
      }

      // Strictly filter any AI internal link suggestions against verified catalog URLs
      const validUrls = new Set([
        ...publishedArticles.map((a) => a.url.toLowerCase()),
        ...publishedProperties.map((p) => p.url.toLowerCase()),
      ]);
      const verifiedLinks = Array.isArray(parsed.internalLinkSuggestions)
        ? parsed.internalLinkSuggestions.filter(
            (l: any) => typeof l?.url === "string" && validUrls.has(l.url.toLowerCase())
          )
        : [];

      // Supplement with deterministic recommendations if AI picked fewer than 3
      const deterministicLinks = recommendInternalLinks(
        {
          currentSlug: slug,
          title,
          excerpt,
          content,
          focusKeyword: focusKeyword || parsed.suggestedFocusKeyword,
          supportingKeywords,
          targetCountry,
        },
        catalog.articles,
        catalog.properties,
        catalog.categories,
        5
      );

      return res.status(200).json({
        action,
        suggestions: {
          ...parsed,
          internalLinkSuggestions: verifiedLinks,
          deterministicInternalLinks: deterministicLinks,
        },
      });
    } catch (err: any) {
      console.error("[SEO AI] Gemini optimization error:", err);
      return res.status(502).json({
        error: err?.message || "Failed to generate AI SEO recommendations.",
      });
    }
  });

  // 2. Redirect Manager Endpoints
  app.get("/api/seo/redirects", async (req, res) => {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    const { redirects, schemaPending } = await fetchRedirectsFromDb(auth.admin.bearerToken);
    const builtInLegacy = Object.entries(LEGACY_NEWS_TO_ARTICLE_REDIRECTS).map(([oldSlug, newSlug]) => ({
      source_path: `/news/${oldSlug}`,
      target_path: `/articles/${newSlug}`,
      status_code: 301 as const,
      builtIn: true,
    }));

    return res.status(200).json({ redirects, builtInLegacy, schemaPending });
  });

  app.post("/api/seo/redirects", async (req, res) => {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    const body = req.body || {};
    const sourcePath = normalizeRedirectPath(String(body.source_path || ""));
    const targetPath = normalizeRedirectPath(String(body.target_path || ""));
    const statusCode = Number(body.status_code) === 302 ? 302 : 301;
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";

    if (!sourcePath || sourcePath === "/" || sourcePath.startsWith("/admin") || sourcePath.startsWith("/api")) {
      return res.status(400).json({ error: "Enter a valid non-admin public source path (e.g., /news/old-slug)." });
    }
    if (!targetPath) {
      return res.status(400).json({ error: "Target path is required." });
    }
    if (sourcePath.toLowerCase() === targetPath.toLowerCase()) {
      return res.status(400).json({ error: "Redirect loop detected: source and target paths cannot match." });
    }

    const { redirects, schemaPending } = await fetchRedirectsFromDb(auth.admin.bearerToken);
    const chainTarget = redirects.find(
      (r) => r.is_active && r.source_path.toLowerCase() === targetPath.toLowerCase()
    );
    if (chainTarget) {
      return res.status(400).json({
        error: `Redirect chain prevented: "${targetPath}" already redirects to "${chainTarget.target_path}". Point directly to "${chainTarget.target_path}" instead.`,
      });
    }

    const sb = getSupabaseRuntime();
    const dbToken = sb?.serviceRoleKey || auth.admin.bearerToken;
    if (sb && dbToken && !schemaPending) {
      const insertRes = await fetch(`${sb.url}/rest/v1/seo_redirects`, {
        method: "POST",
        headers: {
          apikey: sb.anonKey,
          Authorization: `Bearer ${dbToken}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          source_path: sourcePath,
          target_path: targetPath,
          status_code: statusCode,
          is_active: true,
          notes,
          created_by: auth.admin.userId !== "demo-admin" ? auth.admin.userId : null,
        }),
      });
      if (insertRes.ok) {
        const createdRows = (await insertRes.json()) as SeoRedirect[];
        redirectCache = null;
        return res.status(201).json({ redirect: createdRows[0], schemaPending: false });
      }
      const errText = await insertRes.text().catch(() => "");
      if (!isMissingTableOrColumn(insertRes.status, errText)) {
        return res.status(400).json({ error: errText || "Unable to create redirect rule." });
      }
    }

    const local = readLocalRedirects();
    if (local.some((r) => r.source_path.toLowerCase() === sourcePath.toLowerCase())) {
      return res.status(400).json({ error: `A redirect from "${sourcePath}" already exists.` });
    }
    const nowIso = new Date().toISOString();
    const item: SeoRedirect = {
      id: `redir-${Date.now()}`,
      source_path: sourcePath,
      target_path: targetPath,
      status_code: statusCode,
      is_active: true,
      notes,
      hit_count: 0,
      created_at: nowIso,
      updated_at: nowIso,
    };
    const next = [item, ...local];
    writeLocalRedirects(next);
    redirectCache = { fetchedAt: Date.now(), items: next };
    return res.status(201).json({ redirect: item, schemaPending: Boolean(sb) });
  });

  app.patch("/api/seo/redirects/:id", async (req, res) => {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    const { id } = req.params;
    const updates: Record<string, any> = {};
    if (typeof req.body?.is_active === "boolean") updates.is_active = req.body.is_active;
    if (req.body?.status_code === 301 || req.body?.status_code === 302) updates.status_code = req.body.status_code;
    if (typeof req.body?.target_path === "string") updates.target_path = normalizeRedirectPath(req.body.target_path);
    if (typeof req.body?.notes === "string") updates.notes = req.body.notes.trim();

    const sb = getSupabaseRuntime();
    const dbToken = sb?.serviceRoleKey || auth.admin.bearerToken;
    if (sb && dbToken && !id.startsWith("redir-")) {
      const upRes = await fetch(`${sb.url}/rest/v1/seo_redirects?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          apikey: sb.anonKey,
          Authorization: `Bearer ${dbToken}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(updates),
      });
      if (upRes.ok) {
        const rows = (await upRes.json()) as SeoRedirect[];
        redirectCache = null;
        return res.status(200).json({ redirect: rows[0] });
      }
    }

    const local = readLocalRedirects();
    const idx = local.findIndex((r) => r.id === id);
    if (idx === -1) return res.status(404).json({ error: "Redirect rule not found." });
    local[idx] = { ...local[idx], ...updates, updated_at: new Date().toISOString() };
    writeLocalRedirects(local);
    redirectCache = { fetchedAt: Date.now(), items: local };
    return res.status(200).json({ redirect: local[idx] });
  });

  app.delete("/api/seo/redirects/:id", async (req, res) => {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    const { id } = req.params;
    const sb = getSupabaseRuntime();
    const dbToken = sb?.serviceRoleKey || auth.admin.bearerToken;
    if (sb && dbToken && !id.startsWith("redir-")) {
      const delRes = await fetch(`${sb.url}/rest/v1/seo_redirects?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          apikey: sb.anonKey,
          Authorization: `Bearer ${dbToken}`,
        },
      });
      if (delRes.ok) {
        redirectCache = null;
        return res.status(200).json({ success: true });
      }
    }

    const next = readLocalRedirects().filter((r) => r.id !== id);
    writeLocalRedirects(next);
    redirectCache = { fetchedAt: Date.now(), items: next };
    return res.status(200).json({ success: true });
  });

  // 3. Full Real Technical & Content SEO Audit
  app.post("/api/seo/audit/run", async (req, res) => {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    try {
      const catalog = await loadRealCmsCatalog(auth.admin.bearerToken);
      const publishedArticles = catalog.articles.filter((a) => a.status === "published");
      const activeProperties = catalog.properties.filter(
        (p) => !p.is_sample && ["available", "pending", "under_contract"].includes(p.listing_status)
      );

      const issues: SeoAuditIssue[] = [];
      const incomingMap = computeIncomingArticleLinks(catalog.articles);
      const orphanArticleIds: string[] = [];

      const titleMap = new Map<string, Article[]>();
      const descMap = new Map<string, Article[]>();

      let brokenInternalLinksCount = 0;
      let missingAltCount = 0;
      let noindexArticlesCount = 0;
      let articleScoresSum = 0;

      for (const art of publishedArticles) {
        const effTitle = (art.seo_title || art.title || "").trim();
        const effDesc = (art.seo_description || art.excerpt || "").trim();
        if (effTitle) {
          const k = effTitle.toLowerCase();
          titleMap.set(k, [...(titleMap.get(k) || []), art]);
        }
        if (effDesc) {
          const k = effDesc.toLowerCase();
          descMap.set(k, [...(descMap.get(k) || []), art]);
        }

        const analysis = analyzeArticleSeo(
          {
            articleId: art.id,
            title: art.title,
            slug: art.slug,
            excerpt: art.excerpt,
            content: art.content,
            categoryId: art.category_id,
            authorId: art.author_id,
            seoTitle: art.seo_title || undefined,
            seoDescription: art.seo_description || undefined,
            ogImage: art.og_image || undefined,
            featuredImage: art.featured_image || undefined,
            featuredImageAlt: art.featured_image_alt || undefined,
            focusKeyword: art.focus_keyword || undefined,
            supportingKeywords: art.supporting_keywords,
            searchIntent: art.search_intent,
            targetCountry: art.target_country || undefined,
            targetAudience: art.target_audience || undefined,
            canonicalUrl: art.canonical_url || undefined,
            robotsDirective: art.robots_directive,
            schemaType: art.schema_type,
            alternateLanguage: art.alternate_language || undefined,
            alternateArticleSlug: art.alternate_article_slug || undefined,
            tags: art.tags?.map((t) => t.name),
          },
          catalog
        );

        articleScoresSum += analysis.score;
        const artUrl = `/articles/${art.slug}`;

        if (!art.seo_title) {
          issues.push({
            id: `art-missing-seotitle-${art.id}`,
            severity: "warning",
            category: "metadata",
            title: "Custom SEO title not set (falling back to headline)",
            description: `"${art.title}" does not define a dedicated seo_title.`,
            url: artUrl,
            entityType: "article",
            entityId: art.id,
            recommendation: "Write a 30–60 character SERP-optimized title.",
          });
        }
        if (!effDesc || effDesc.length < 70) {
          issues.push({
            id: `art-weak-desc-${art.id}`,
            severity: effDesc ? "warning" : "critical",
            category: "metadata",
            title: effDesc ? "Short meta description (<70 chars)" : "Missing meta description & excerpt",
            description: `"${art.title}" has ${effDesc.length} chars of description copy.`,
            url: artUrl,
            entityType: "article",
            entityId: art.id,
            recommendation: "Write a clear 120–160 character meta description.",
          });
        }

        if ((art.robots_directive || "index, follow").startsWith("noindex")) {
          noindexArticlesCount += 1;
          issues.push({
            id: `art-noindex-${art.id}`,
            severity: "warning",
            category: "technical",
            title: "Published article set to noindex",
            description: `"${art.title}" has robots directive "${art.robots_directive}" and is excluded from sitemap.xml.`,
            url: artUrl,
            entityType: "article",
            entityId: art.id,
            recommendation: "Verify whether exclusion from search indexing is intentional.",
          });
        }

        if (art.canonical_url && !/^https?:\/\//i.test(art.canonical_url)) {
          issues.push({
            id: `art-bad-canonical-${art.id}`,
            severity: "critical",
            category: "technical",
            title: "Invalid canonical URL format",
            description: `"${art.title}" has malformed canonical "${art.canonical_url}".`,
            url: artUrl,
            entityType: "article",
            entityId: art.id,
            recommendation: "Use a full https:// URL or leave blank for self-referencing canonical.",
          });
        }

        const links = extractLinksFromContent(art.content || "");
        const broken = findBrokenInternalLinks(links, catalog);
        if (broken.length > 0) {
          brokenInternalLinksCount += broken.length;
          issues.push({
            id: `art-broken-links-${art.id}`,
            severity: "critical",
            category: "links",
            title: `${broken.length} broken or legacy internal link(s)`,
            description: `"${art.title}" links to unresolved internal path(s): ${broken.map((b) => b.href).join(", ")}.`,
            url: artUrl,
            entityType: "article",
            entityId: art.id,
            recommendation: "Update internal hrefs to valid published /articles/ or /properties/ URLs.",
          });
        }

        if ((incomingMap.get(art.id) || 0) === 0) {
          orphanArticleIds.push(art.id);
          issues.push({
            id: `art-orphan-${art.id}`,
            severity: "warning",
            category: "links",
            title: "Orphan published article (0 incoming internal links)",
            description: `No other published AmaanEstate article links to "${art.title}".`,
            url: artUrl,
            entityType: "article",
            entityId: art.id,
            recommendation: "Add contextual internal links pointing to this article from related stories.",
          });
        }

        if (!art.featured_image || analysis.metrics.missingAltImagesCount > 0) {
          missingAltCount += Math.max(1, analysis.metrics.missingAltImagesCount);
          issues.push({
            id: `art-media-alt-${art.id}`,
            severity: !art.featured_image ? "critical" : "warning",
            category: "media",
            title: !art.featured_image ? "Missing featured cover image" : "Image missing descriptive ALT text",
            description: `"${art.title}" has ${!art.featured_image ? "no cover image" : `${analysis.metrics.missingAltImagesCount} image(s) missing ALT text`}.`,
            url: artUrl,
            entityType: "article",
            entityId: art.id,
            recommendation: "Ensure cover and inline images have descriptive ALT attributes.",
          });
        }

        if (!art.author_id || !art.category_id) {
          issues.push({
            id: `art-schema-missing-${art.id}`,
            severity: "critical",
            category: "structured_data",
            title: "Incomplete Article Schema.org author or category",
            description: `"${art.title}" is missing author or category assignment for JSON-LD.`,
            url: artUrl,
            entityType: "article",
            entityId: art.id,
          });
        }
      }

      let duplicateTitlesCount = 0;
      for (const [, group] of titleMap.entries()) {
        if (group.length > 1) {
          duplicateTitlesCount += group.length;
          issues.push({
            id: `dup-title-${group.map((g) => g.id).join("-")}`,
            severity: "critical",
            category: "metadata",
            title: `Duplicate SEO title across ${group.length} articles`,
            description: `Shared title "${group[0].seo_title || group[0].title}" appears on: ${group
              .map((g) => `/articles/${g.slug}`)
              .join(", ")}.`,
            entityType: "article",
            entityId: group[0].id,
            recommendation: "Give every article a unique headline and SEO title.",
          });
        }
      }

      let duplicateDescriptionsCount = 0;
      for (const [, group] of descMap.entries()) {
        if (group.length > 1) {
          duplicateDescriptionsCount += group.length;
          issues.push({
            id: `dup-desc-${group.map((g) => g.id).join("-")}`,
            severity: "warning",
            category: "metadata",
            title: `Duplicate meta description across ${group.length} articles`,
            description: `Shared description on: ${group.map((g) => `/articles/${g.slug}`).join(", ")}.`,
            entityType: "article",
            entityId: group[0].id,
            recommendation: "Write distinct meta descriptions for each story.",
          });
        }
      }

      // Property marketplace technical SEO checks
      for (const prop of activeProperties) {
        if (!prop.description || prop.description.trim().length < 80) {
          issues.push({
            id: `prop-thin-desc-${prop.id}`,
            severity: "warning",
            category: "content",
            title: "Property listing has thin description (<80 chars)",
            description: `${prop.title} (${prop.city}, ${prop.country}) has minimal indexable description copy.`,
            url: `/properties/${prop.slug}`,
            entityType: "property",
            entityId: prop.id,
          });
        }
        const primaryImg = prop.images?.[0];
        if (!primaryImg || !primaryImg.alt_text) {
          missingAltCount += 1;
          issues.push({
            id: `prop-img-alt-${prop.id}`,
            severity: !primaryImg ? "warning" : "warning",
            category: "media",
            title: !primaryImg ? "Property listing missing primary image" : "Property image missing ALT text",
            description: `${prop.title} (${prop.city}, ${prop.country}).`,
            url: `/properties/${prop.slug}`,
            entityType: "property",
            entityId: prop.id,
          });
        }
      }

      // Redirect chain / loop audit
      const redirectSources = new Set(
        catalog.redirects.filter((r) => r.is_active).map((r) => r.source_path.toLowerCase())
      );
      for (const r of catalog.redirects.filter((x) => x.is_active)) {
        if (r.source_path.toLowerCase() === r.target_path.toLowerCase()) {
          issues.push({
            id: `redir-loop-${r.id}`,
            severity: "critical",
            category: "redirects",
            title: "Redirect loop detected",
            description: `${r.source_path} redirects to itself.`,
            entityType: "redirect",
            entityId: r.id,
          });
        } else if (redirectSources.has(r.target_path.toLowerCase())) {
          issues.push({
            id: `redir-chain-${r.id}`,
            severity: "warning",
            category: "redirects",
            title: "Multi-hop redirect chain detected",
            description: `${r.source_path} -> ${r.target_path}, which is also a redirect source.`,
            entityType: "redirect",
            entityId: r.id,
            recommendation: "Point directly to the final canonical destination URL.",
          });
        }
      }

      // Site-wide baseline checks (passed signals)
      if (catalog.siteSettings?.default_seo_title && catalog.siteSettings?.default_seo_description) {
        issues.push({
          id: "site-defaults-ok",
          severity: "passed",
          category: "metadata",
          title: "Global default SEO title & description configured",
          description: `Configured domain: ${catalog.siteSettings.domain || "amaanestate.com"}.`,
          entityType: "site",
        });
      }
      if (brokenInternalLinksCount === 0) {
        issues.push({
          id: "site-no-broken-links",
          severity: "passed",
          category: "links",
          title: "Zero broken internal links across published articles",
          description: `Verified ${publishedArticles.length} published articles against live routes.`,
          entityType: "site",
        });
      }
      if (duplicateTitlesCount === 0) {
        issues.push({
          id: "site-unique-titles",
          severity: "passed",
          category: "metadata",
          title: "All published articles have unique SEO titles",
          description: `Checked ${publishedArticles.length} published articles.`,
          entityType: "site",
        });
      }

      const criticalCount = issues.filter((i) => i.severity === "critical").length;
      const warningCount = issues.filter((i) => i.severity === "warning").length;
      const passedCount = issues.filter((i) => i.severity === "passed").length;
      const nowIso = new Date().toISOString();

      const auditRun: SeoAuditRun = {
        created_at: nowIso,
        summary: {
          auditedAt: nowIso,
          totalUrlsChecked: publishedArticles.length + activeProperties.length + catalog.categories.length + 11,
          publishedArticlesCount: publishedArticles.length,
          publishedPropertiesCount: activeProperties.length,
          criticalCount,
          warningCount,
          passedCount,
          orphanArticleIds,
          duplicateTitlesCount,
          duplicateDescriptionsCount,
          brokenInternalLinksCount,
          missingAltCount,
          noindexArticlesCount,
          averageArticleSeoScore:
            publishedArticles.length > 0 ? Math.round(articleScoresSum / publishedArticles.length) : 0,
        },
        issues,
      };

      // Persist audit run to Supabase if table exists
      let schemaPending = false;
      const sb = getSupabaseRuntime();
      const dbToken = sb?.serviceRoleKey || auth.admin.bearerToken;
      if (sb && dbToken) {
        const saveRes = await fetch(`${sb.url}/rest/v1/seo_audit_runs`, {
          method: "POST",
          headers: {
            apikey: sb.anonKey,
            Authorization: `Bearer ${dbToken}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            summary: auditRun.summary,
            issues: auditRun.issues,
            checked_urls: auditRun.summary.totalUrlsChecked,
            critical_count: criticalCount,
            warning_count: warningCount,
            passed_count: passedCount,
            created_by: auth.admin.userId !== "demo-admin" ? auth.admin.userId : null,
          }),
        });
        if (!saveRes.ok) {
          const errText = await saveRes.text().catch(() => "");
          if (isMissingTableOrColumn(saveRes.status, errText)) {
            schemaPending = true;
          }
        } else {
          const savedRows = (await saveRes.json()) as SeoAuditRun[];
          if (savedRows?.[0]?.id) auditRun.id = savedRows[0].id;
        }
      }

      return res.status(200).json({ audit: auditRun, schemaPending });
    } catch (err: any) {
      console.error("[SEO Audit] Failed:", err);
      return res.status(500).json({ error: err?.message || "Failed to execute SEO audit." });
    }
  });

  app.get("/api/seo/audit/latest", async (req, res) => {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    const sb = getSupabaseRuntime();
    const dbToken = sb?.serviceRoleKey || auth.admin.bearerToken;
    if (!sb || !dbToken) {
      return res.status(200).json({ audit: null, schemaPending: false });
    }

    try {
      const latestRes = await fetch(
        `${sb.url}/rest/v1/seo_audit_runs?select=*&order=created_at.desc&limit=1`,
        {
          headers: {
            apikey: sb.anonKey,
            Authorization: `Bearer ${dbToken}`,
          },
        }
      );
      if (!latestRes.ok) {
        const errText = await latestRes.text().catch(() => "");
        if (isMissingTableOrColumn(latestRes.status, errText)) {
          return res.status(200).json({ audit: null, schemaPending: true });
        }
        return res.status(200).json({ audit: null, schemaPending: false });
      }
      const rows = (await latestRes.json()) as SeoAuditRun[];
      return res.status(200).json({ audit: rows?.[0] || null, schemaPending: false });
    } catch {
      return res.status(200).json({ audit: null, schemaPending: false });
    }
  });

  // 4. Google Search Console OAuth2 & Analytics Endpoints
  app.get("/api/seo/gsc/status", async (req, res) => {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    const clientId = (process.env.GOOGLE_OAUTH_CLIENT_ID || "").trim();
    const clientSecret = (process.env.GOOGLE_OAUTH_CLIENT_SECRET || "").trim();
    const oauthConfigured = Boolean(clientId && clientSecret);
    const missingEnvVars: string[] = [];
    if (!clientId) missingEnvVars.push("GOOGLE_OAUTH_CLIENT_ID");
    if (!clientSecret) missingEnvVars.push("GOOGLE_OAUTH_CLIENT_SECRET");

    const callbackUrl = getGscRedirectUri();
    const { connection, schemaPending } = await getStoredGscConnection(auth.admin.bearerToken);

    if (!connection || !connection.access_token) {
      return res.status(200).json({
        oauthConfigured,
        connected: false,
        sites: [],
        missingEnvVars,
        schemaPending,
        callbackUrls: {
          development: callbackUrl,
          production: PRODUCTION_GSC_CALLBACK_URL,
          configuredAppUrl: getAppCallbackBaseUrl(),
        },
        message: oauthConfigured
          ? "Ready to connect your Google Search Console account."
          : "Google Search Console OAuth credentials are not configured yet on the server.",
      });
    }

    const token = await ensureFreshGscAccessToken(connection, auth.admin.bearerToken);
    if (!token) {
      return res.status(200).json({
        oauthConfigured,
        connected: false,
        needsReconnect: true,
        googleEmail: connection.google_email || null,
        sites: [],
        missingEnvVars,
        schemaPending,
        callbackUrls: {
          development: callbackUrl,
          production: PRODUCTION_GSC_CALLBACK_URL,
          configuredAppUrl: getAppCallbackBaseUrl(),
        },
        message: "Google Search Console authorization expired or was revoked. Please reconnect.",
      });
    }

    const { sites, unauthorized } = await fetchGscSitesResult(token);
    if (unauthorized) {
      return res.status(200).json({
        oauthConfigured,
        connected: false,
        needsReconnect: true,
        googleEmail: connection.google_email || null,
        sites: [],
        missingEnvVars,
        schemaPending,
        callbackUrls: {
          development: callbackUrl,
          production: PRODUCTION_GSC_CALLBACK_URL,
          configuredAppUrl: getAppCallbackBaseUrl(),
        },
        message: "Google Search Console authorization expired or was revoked. Please reconnect.",
      });
    }

    return res.status(200).json({
      oauthConfigured,
      connected: true,
      googleEmail: connection.google_email || null,
      selectedSiteUrl: connection.selected_site_url || sites[0]?.siteUrl || null,
      permissionLevel: connection.permission_level || sites[0]?.permissionLevel || null,
      sites,
      missingEnvVars,
      schemaPending,
      callbackUrls: {
        development: callbackUrl,
        production: PRODUCTION_GSC_CALLBACK_URL,
        configuredAppUrl: getAppCallbackBaseUrl(),
      },
    });
  });

  app.get("/api/seo/gsc/auth-url", async (req, res) => {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    const clientId = (process.env.GOOGLE_OAUTH_CLIENT_ID || "").trim();
    const clientSecret = (process.env.GOOGLE_OAUTH_CLIENT_SECRET || "").trim();
    if (!clientId || !clientSecret) {
      return res.status(400).json({
        code: "GSC_OAUTH_NOT_CONFIGURED",
        error:
          "Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in server environment secrets before connecting Google Search Console.",
        redirectUri: getGscRedirectUri(),
      });
    }

    const state = createSignedOAuthState(auth.admin.userId);
    pendingOAuthStates.set(state, {
      createdAt: Date.now(),
      userId: auth.admin.userId,
      bearerToken: auth.admin.bearerToken,
    });

    // Clean stale states > 15 minutes
    for (const [k, v] of pendingOAuthStates.entries()) {
      if (Date.now() - v.createdAt > 15 * 60_000) pendingOAuthStates.delete(k);
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getGscRedirectUri(),
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
      state,
      scope: "https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/userinfo.email",
    });

    return res.status(200).json({
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      redirectUri: getGscRedirectUri(),
    });
  });

  const handleGscCallback: express.RequestHandler = async (req, res) => {
    const code = typeof req.query.code === "string" ? req.query.code : "";
    const state = typeof req.query.state === "string" ? req.query.state : "";
    const oauthError = typeof req.query.error === "string" ? req.query.error : "";

    const renderPopupResult = (payload: Record<string, any>, message: string) => {
      return res.status(200).send(`<!doctype html>
<html>
  <head><title>AmaanEstate Search Console Authorization</title></head>
  <body style="font-family: sans-serif; padding: 24px; color: #141413; background: #FAF8F5;">
    <p>${message}</p>
    <script>
      if (window.opener) {
        window.opener.postMessage(${JSON.stringify(payload)}, '*');
        window.close();
      } else {
        window.location.href = '/admin';
      }
    </script>
  </body>
</html>`);
    };

    if (oauthError) {
      return renderPopupResult(
        { type: "GSC_OAUTH_ERROR", error: oauthError },
        "Google authorization was cancelled or denied. You may close this window."
      );
    }

    const inMemoryState = pendingOAuthStates.get(state);
    pendingOAuthStates.delete(state);
    const verifiedStateless = !inMemoryState ? verifySignedOAuthState(state) : null;
    const stateMeta = inMemoryState
      ? inMemoryState
      : verifiedStateless
      ? { ...verifiedStateless, bearerToken: null }
      : null;

    if (!code || !stateMeta) {
      return renderPopupResult(
        { type: "GSC_OAUTH_ERROR", error: "Invalid or expired OAuth state." },
        "Authorization session expired. Please close this window and try again."
      );
    }

    const clientId = (process.env.GOOGLE_OAUTH_CLIENT_ID || "").trim();
    const clientSecret = (process.env.GOOGLE_OAUTH_CLIENT_SECRET || "").trim();
    if (!clientId || !clientSecret) {
      return renderPopupResult(
        { type: "GSC_OAUTH_ERROR", error: "Server OAuth credentials missing." },
        "Server OAuth credentials are not configured."
      );
    }

    try {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: getGscRedirectUri(),
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        const errBody = await tokenRes.text().catch(() => "");
        return renderPopupResult(
          { type: "GSC_OAUTH_ERROR", error: `Token exchange failed (${tokenRes.status}).` },
          `Failed to complete Search Console connection: ${errBody.slice(0, 180)}`
        );
      }

      const tokenJson = (await tokenRes.json()) as {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
        scope?: string;
      };

      if (!tokenJson.access_token) {
        return renderPopupResult(
          { type: "GSC_OAUTH_ERROR", error: "Google did not return an access token." },
          "No access token returned."
        );
      }

      const [userInfoRes, sites] = await Promise.all([
        fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokenJson.access_token}` },
        }),
        fetchGscSitesWithToken(tokenJson.access_token),
      ]);

      const userInfo = userInfoRes.ok
        ? ((await userInfoRes.json()) as { email?: string })
        : {};

      const preferredSite =
        sites.find((s) => /amaanestate\.com/i.test(s.siteUrl)) || sites[0] || null;

      const { connection: existingConnection } = await getStoredGscConnection(stateMeta.bearerToken);
      const effectiveRefreshToken =
        tokenJson.refresh_token || existingConnection?.refresh_token || null;

      await saveStoredGscConnection(
        {
          google_email: userInfo.email || null,
          selected_site_url: preferredSite?.siteUrl || existingConnection?.selected_site_url || null,
          permission_level: preferredSite?.permissionLevel || existingConnection?.permission_level || null,
          access_token: tokenJson.access_token,
          refresh_token: effectiveRefreshToken,
          token_expires_at: new Date(
            Date.now() + (Number(tokenJson.expires_in) || 3500) * 1000
          ).toISOString(),
          scope: tokenJson.scope || null,
        },
        stateMeta.bearerToken,
        stateMeta.userId
      );

      return renderPopupResult(
        { type: "GSC_OAUTH_SUCCESS", email: userInfo.email || null },
        "Google Search Console connected successfully. This window will close automatically."
      );
    } catch (err: any) {
      return renderPopupResult(
        { type: "GSC_OAUTH_ERROR", error: err?.message || "Unexpected OAuth error." },
        "Connection failed. You may close this window."
      );
    }
  };

  app.get(["/api/seo/gsc/callback", "/api/seo/gsc/callback/"], handleGscCallback);

  app.post("/api/seo/gsc/select-site", async (req, res) => {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    const siteUrl = typeof req.body?.siteUrl === "string" ? req.body.siteUrl.trim() : "";
    if (!siteUrl) return res.status(400).json({ error: "siteUrl is required." });

    const { connection } = await getStoredGscConnection(auth.admin.bearerToken);
    if (!connection) return res.status(400).json({ error: "Search Console is not connected." });

    const token = await ensureFreshGscAccessToken(connection, auth.admin.bearerToken);
    const sites = token ? await fetchGscSitesWithToken(token) : [];
    const matched = sites.find((s) => s.siteUrl === siteUrl);

    await saveStoredGscConnection(
      {
        ...connection,
        selected_site_url: siteUrl,
        permission_level: matched?.permissionLevel || connection.permission_level || null,
      },
      auth.admin.bearerToken,
      auth.admin.userId
    );

    return res.status(200).json({ success: true, selectedSiteUrl: siteUrl });
  });

  app.post("/api/seo/gsc/disconnect", async (req, res) => {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
    await clearStoredGscConnection(auth.admin.bearerToken);
    return res.status(200).json({ success: true });
  });

  app.post("/api/seo/gsc/analytics", async (req, res) => {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    const { connection } = await getStoredGscConnection(auth.admin.bearerToken);
    if (!connection || !connection.access_token) {
      return res.status(200).json({
        connected: false,
        dateRange: "28d",
        periodStart: "",
        periodEnd: "",
        totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
        daily: [],
        topQueries: [],
        topPages: [],
        highImpressionLowCtr: [],
        decliningPages: [],
        countries: [],
        devices: [],
        error: "Google Search Console is not connected.",
      } satisfies GscAnalyticsResponse);
    }

    const token = await ensureFreshGscAccessToken(connection, auth.admin.bearerToken);
    const siteUrl =
      (typeof req.body?.siteUrl === "string" && req.body.siteUrl.trim()) ||
      connection.selected_site_url;

    if (!token || !siteUrl) {
      return res.status(400).json({ error: "No verified Search Console property selected." });
    }

    const dateRange: "7d" | "28d" | "90d" =
      req.body?.dateRange === "7d" ? "7d" : req.body?.dateRange === "90d" ? "90d" : "28d";
    const days = dateRange === "7d" ? 7 : dateRange === "90d" ? 90 : 28;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 2); // GSC data has ~2 day reporting lag
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (days - 1));

    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - (days - 1));

    const dimensionFilterGroups: any[] = [];
    const countryFilter = typeof req.body?.country === "string" ? req.body.country.trim() : "";
    const queryFilter = typeof req.body?.queryFilter === "string" ? req.body.queryFilter.trim() : "";
    if (countryFilter || queryFilter) {
      const filters: any[] = [];
      if (countryFilter) {
        filters.push({ dimension: "country", operator: "equals", expression: countryFilter.toLowerCase() });
      }
      if (queryFilter) {
        filters.push({ dimension: "query", operator: "contains", expression: queryFilter });
      }
      dimensionFilterGroups.push({ groupType: "and", filters });
    }

    const queryGsc = async (body: Record<string, any>) => {
      const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
        siteUrl
      )}/searchAnalytics/query`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(dimensionFilterGroups.length > 0 ? { dimensionFilterGroups } : {}),
          ...body,
        }),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Search Console API (${response.status}): ${text.slice(0, 180)}`);
      }
      return (await response.json()) as { rows?: Array<any> };
    };

    try {
      const startStr = formatGscDate(startDate);
      const endStr = formatGscDate(endDate);
      const prevStartStr = formatGscDate(prevStartDate);
      const prevEndStr = formatGscDate(prevEndDate);

      const [dailyRes, queriesRes, pagesRes, prevPagesRes, countriesRes, devicesRes] =
        await Promise.all([
          queryGsc({ startDate: startStr, endDate: endStr, dimensions: ["date"], rowLimit: 100 }),
          queryGsc({ startDate: startStr, endDate: endStr, dimensions: ["query"], rowLimit: 25 }),
          queryGsc({ startDate: startStr, endDate: endStr, dimensions: ["page"], rowLimit: 50 }),
          queryGsc({ startDate: prevStartStr, endDate: prevEndStr, dimensions: ["page"], rowLimit: 50 }),
          queryGsc({ startDate: startStr, endDate: endStr, dimensions: ["country"], rowLimit: 15 }),
          queryGsc({ startDate: startStr, endDate: endStr, dimensions: ["device"], rowLimit: 5 }),
        ]);

      const daily = (dailyRes.rows || []).map((r) => ({
        date: String(r.keys?.[0] || ""),
        clicks: Number(r.clicks || 0),
        impressions: Number(r.impressions || 0),
        ctr: Number(r.ctr || 0),
        position: Number(r.position || 0),
      }));

      const totalClicks = daily.reduce((s, d) => s + d.clicks, 0);
      const totalImpressions = daily.reduce((s, d) => s + d.impressions, 0);
      const avgPosition =
        daily.length > 0
          ? Number((daily.reduce((s, d) => s + d.position, 0) / daily.length).toFixed(1))
          : 0;
      const totalCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;

      const topQueries = (queriesRes.rows || []).map((r) => ({
        query: String(r.keys?.[0] || ""),
        clicks: Number(r.clicks || 0),
        impressions: Number(r.impressions || 0),
        ctr: Number(r.ctr || 0),
        position: Number(r.position || 0),
      }));

      const topPages = (pagesRes.rows || []).map((r) => ({
        page: String(r.keys?.[0] || ""),
        clicks: Number(r.clicks || 0),
        impressions: Number(r.impressions || 0),
        ctr: Number(r.ctr || 0),
        position: Number(r.position || 0),
      }));

      const prevPagesMap = new Map<string, { clicks: number; impressions: number }>();
      let prevClicksTotal = 0;
      let prevImpressionsTotal = 0;
      for (const r of prevPagesRes.rows || []) {
        const page = String(r.keys?.[0] || "");
        const clicks = Number(r.clicks || 0);
        const impressions = Number(r.impressions || 0);
        prevClicksTotal += clicks;
        prevImpressionsTotal += impressions;
        prevPagesMap.set(page, { clicks, impressions });
      }

      const highImpressionLowCtr = topPages
        .filter((p) => p.impressions >= 25 && p.ctr < 0.03)
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 12);

      const decliningPages = topPages
        .map((p) => {
          const prev = prevPagesMap.get(p.page) || { clicks: 0, impressions: 0 };
          return {
            page: p.page,
            clicks: p.clicks,
            prevClicks: prev.clicks,
            clickDelta: p.clicks - prev.clicks,
            impressions: p.impressions,
            prevImpressions: prev.impressions,
            position: p.position,
          };
        })
        .filter((p) => p.clickDelta < 0)
        .sort((a, b) => a.clickDelta - b.clickDelta)
        .slice(0, 12);

      const countries = (countriesRes.rows || []).map((r) => ({
        country: String(r.keys?.[0] || "").toUpperCase(),
        clicks: Number(r.clicks || 0),
        impressions: Number(r.impressions || 0),
        ctr: Number(r.ctr || 0),
        position: Number(r.position || 0),
      }));

      const devices = (devicesRes.rows || []).map((r) => ({
        device: String(r.keys?.[0] || ""),
        clicks: Number(r.clicks || 0),
        impressions: Number(r.impressions || 0),
        ctr: Number(r.ctr || 0),
        position: Number(r.position || 0),
      }));

      const payload: GscAnalyticsResponse = {
        connected: true,
        siteUrl,
        dateRange,
        periodStart: startStr,
        periodEnd: endStr,
        totals: {
          clicks: totalClicks,
          impressions: totalImpressions,
          ctr: totalCtr,
          position: avgPosition,
          prevClicks: prevClicksTotal,
          prevImpressions: prevImpressionsTotal,
        },
        daily,
        topQueries,
        topPages,
        highImpressionLowCtr,
        decliningPages,
        countries,
        devices,
      };

      return res.status(200).json(payload);
    } catch (err: any) {
      return res.status(502).json({
        connected: true,
        siteUrl,
        dateRange,
        periodStart: "",
        periodEnd: "",
        totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
        daily: [],
        topQueries: [],
        topPages: [],
        highImpressionLowCtr: [],
        decliningPages: [],
        countries: [],
        devices: [],
        error: err?.message || "Unable to fetch Search Console metrics.",
      });
    }
  });

  app.post("/api/seo/gsc/inspect", async (req, res) => {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    const inspectionUrl = typeof req.body?.inspectionUrl === "string" ? req.body.inspectionUrl.trim() : "";
    if (!inspectionUrl) return res.status(400).json({ error: "inspectionUrl is required." });

    const { connection } = await getStoredGscConnection(auth.admin.bearerToken);
    if (!connection?.access_token || !connection.selected_site_url) {
      return res.status(400).json({ error: "Connect Google Search Console and select a verified property first." });
    }

    const token = await ensureFreshGscAccessToken(connection, auth.admin.bearerToken);
    if (!token) return res.status(401).json({ error: "Google OAuth token unavailable." });

    try {
      const inspectRes = await fetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inspectionUrl,
          siteUrl: connection.selected_site_url,
          languageCode: "en-US",
        }),
      });
      const data = await inspectRes.json();
      if (!inspectRes.ok) {
        return res.status(inspectRes.status).json({
          error: data?.error?.message || "URL Inspection request rejected by Google Search Console.",
        });
      }
      return res.status(200).json({ inspectionResult: data?.inspectionResult || data });
    } catch (err: any) {
      return res.status(502).json({ error: err?.message || "URL Inspection failed." });
    }
  });

  app.get("/api/seo/gsc/sitemaps", async (req, res) => {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    const { connection } = await getStoredGscConnection(auth.admin.bearerToken);
    if (!connection?.access_token || !connection.selected_site_url) {
      return res.status(200).json({ connected: false, sitemaps: [] });
    }
    const token = await ensureFreshGscAccessToken(connection, auth.admin.bearerToken);
    if (!token) return res.status(200).json({ connected: false, sitemaps: [] });

    try {
      const smRes = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
          connection.selected_site_url
        )}/sitemaps`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!smRes.ok) {
        return res.status(200).json({ connected: true, sitemaps: [] });
      }
      const smJson = (await smRes.json()) as { sitemap?: any[] };
      return res.status(200).json({
        connected: true,
        sitemaps: Array.isArray(smJson.sitemap) ? smJson.sitemap : [],
      });
    } catch {
      return res.status(200).json({ connected: true, sitemaps: [] });
    }
  });
}
