import type express from "express";
import type { AreaUnit, PropertyType } from "../src/types";

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

async function verifyAdminRequest(
  req: express.Request
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const sb = getSupabaseRuntime();
  if (!sb) {
    // Matches local demo mode when Supabase is not configured in dev
    return { ok: true };
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
      return {
        ok: false,
        status: 401,
        error: "Your editorial session has expired. Please sign in again.",
      };
    }

    const userData = (await userRes.json()) as { id?: string };
    if (!userData?.id) {
      return { ok: false, status: 401, error: "Unable to verify Supabase user." };
    }

    const dbKey = sb.serviceRoleKey || token;
    const profileRes = await fetch(
      `${sb.url}/rest/v1/profiles?id=eq.${encodeURIComponent(
        userData.id
      )}&select=id,roles(name)&limit=1`,
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

    const rows = (await profileRes.json()) as Array<{ roles?: { name?: string } }>;
    const roleName = rows?.[0]?.roles?.name;
    if (roleName !== "admin" && roleName !== "editor") {
      return { ok: false, status: 403, error: "Admin or Editor permissions are required." };
    }

    return { ok: true };
  } catch (err) {
    console.error("[Impact Lookup Auth] Verification failed:", err);
    return { ok: false, status: 500, error: "Failed to verify administrative permissions." };
  }
}

function mapImpactPropertyType(rawCategory?: string | null): PropertyType | null {
  const text = (rawCategory || "").toLowerCase();
  if (!text) return null;
  if (text.includes("apartment") || text.includes("flat") || text.includes("studio")) {
    return "apartment";
  }
  if (text.includes("villa")) return "villa";
  if (text.includes("townhouse")) return "townhouse";
  if (text.includes("condo")) return "condominium";
  if (text.includes("house") || text.includes("home")) return "house";
  if (text.includes("land") || text.includes("plot")) return "land";
  return null;
}

function normalizePositiveNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  const parsed = Number(val);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function registerImpactRoutes(app: express.Express) {
  app.post("/api/properties/impact/lookup", async (req, res) => {
    const auth = await verifyAdminRequest(req);
    if ("error" in auth) {
      return res.status(auth.status).json({ error: auth.error });
    }

    const rawSku = typeof req.body?.sku === "string" ? req.body.sku.trim() : "";
    if (!rawSku || !/^[a-zA-Z0-9_-]{1,64}$/.test(rawSku)) {
      return res.status(400).json({
        authorizedSourceAvailable: false,
        sourceName: "Impact Partner Catalog API",
        reason: "A valid property SKU is required for catalog lookup.",
        matched: false,
        data: null,
      });
    }

    const accountSid = (process.env.IMPACT_ACCOUNT_SID || "").trim();
    const authToken = (process.env.IMPACT_AUTH_TOKEN || "").trim();
    const configuredCatalogId = (process.env.IMPACT_CATALOG_ID || "").trim();

    if (!accountSid || !authToken) {
      return res.status(200).json({
        authorizedSourceAvailable: false,
        sourceName: "Impact Partner Catalog API",
        reason:
          "Impact Partner Catalog API credentials (IMPACT_ACCOUNT_SID / IMPACT_AUTH_TOKEN) are not configured on the server. Only data verified inside the pasted HTML creative was populated.",
        matched: false,
        data: null,
      });
    }

    try {
      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const headers = {
        Authorization: `Basic ${basicAuth}`,
        Accept: "application/json",
      };

      const catalogIds: string[] = [];
      if (configuredCatalogId && /^[a-zA-Z0-9_-]{1,64}$/.test(configuredCatalogId)) {
        catalogIds.push(configuredCatalogId);
      } else {
        const catalogsRes = await fetch(
          `https://api.impact.com/Mediapartners/${encodeURIComponent(accountSid)}/Catalogs`,
          { headers }
        );
        if (!catalogsRes.ok) {
          return res.status(200).json({
            authorizedSourceAvailable: false,
            sourceName: "Impact Partner Catalog API",
            reason: `Impact Catalog API returned HTTP ${catalogsRes.status}. Verify IMPACT_ACCOUNT_SID and IMPACT_AUTH_TOKEN.`,
            matched: false,
            data: null,
          });
        }
        const catalogsJson = (await catalogsRes.json()) as {
          Catalogs?: Array<{ Id?: string; Name?: string; CampaignName?: string }>;
        };
        const catalogs = Array.isArray(catalogsJson?.Catalogs) ? catalogsJson.Catalogs : [];
        const haCatalogs = catalogs.filter((c) =>
          `${c.Name || ""} ${c.CampaignName || ""}`.toLowerCase().includes("housinganywhere")
        );
        const prioritized = haCatalogs.length > 0 ? haCatalogs : catalogs;
        for (const cat of prioritized.slice(0, 5)) {
          if (cat.Id && /^[a-zA-Z0-9_-]{1,64}$/.test(String(cat.Id))) {
            catalogIds.push(String(cat.Id));
          }
        }
      }

      if (catalogIds.length === 0) {
        return res.status(200).json({
          authorizedSourceAvailable: true,
          sourceName: "Impact Partner Catalog API",
          reason: "No accessible product catalogs were returned for this Impact partner account.",
          matched: false,
          data: null,
        });
      }

      let matchedItem: Record<string, any> | null = null;
      const skuCandidates = Array.from(new Set([rawSku, `ut${rawSku.replace(/^ut/i, "")}`]));

      for (const catalogId of catalogIds) {
        for (const candidateSku of skuCandidates) {
          const itemUrl = `https://api.impact.com/Mediapartners/${encodeURIComponent(
            accountSid
          )}/Catalogs/${encodeURIComponent(catalogId)}/Items?Query=${encodeURIComponent(
            `CatalogItemId='${candidateSku.replace(/'/g, "")}'`
          )}`;

          const itemRes = await fetch(itemUrl, { headers });
          if (!itemRes.ok) continue;

          const itemJson = (await itemRes.json()) as { Items?: Array<Record<string, any>> };
          const items = Array.isArray(itemJson?.Items) ? itemJson.Items : [];
          if (items.length > 0) {
            matchedItem = items[0];
            break;
          }
        }
        if (matchedItem) break;
      }

      if (!matchedItem) {
        return res.status(200).json({
          authorizedSourceAvailable: true,
          sourceName: "Impact Partner Catalog API",
          reason: `Impact Catalog API is connected, but no catalog entry matched SKU "${rawSku}".`,
          matched: false,
          data: null,
        });
      }

      // Map strictly verified item fields; never use Payout/Commission fields as property price
      const verifiedPrice =
        normalizePositiveNumber(matchedItem.CurrentPrice) ??
        normalizePositiveNumber(matchedItem.OriginalPrice) ??
        normalizePositiveNumber(matchedItem.Price);

      const verifiedCurrency =
        typeof matchedItem.Currency === "string" &&
        /^[A-Z]{3}$/.test(matchedItem.Currency.trim().toUpperCase())
          ? matchedItem.Currency.trim().toUpperCase()
          : null;

      const rawImages: string[] = [];
      if (typeof matchedItem.ImageUrl === "string" && /^https?:\/\//i.test(matchedItem.ImageUrl)) {
        rawImages.push(matchedItem.ImageUrl.trim());
      }
      if (Array.isArray(matchedItem.AdditionalImageUrls)) {
        for (const extra of matchedItem.AdditionalImageUrls) {
          if (typeof extra === "string" && /^https?:\/\//i.test(extra)) {
            rawImages.push(extra.trim());
          }
        }
      }

      const uniqueImages = Array.from(new Set(rawImages)).map((image_url) => ({
        image_url,
        alt_text: typeof matchedItem?.Name === "string" ? matchedItem.Name.trim() : "",
        source: "authorized_api" as const,
      }));

      const rawAttrs =
        matchedItem.AdditionalAttributes && typeof matchedItem.AdditionalAttributes === "object"
          ? matchedItem.AdditionalAttributes
          : {};

      const areaUnitRaw = String(rawAttrs.area_unit || rawAttrs.AreaUnit || "").toLowerCase();
      const areaUnit: AreaUnit | null =
        areaUnitRaw === "sqm" || areaUnitRaw === "sqft" || areaUnitRaw === "acres"
          ? areaUnitRaw
          : null;

      return res.status(200).json({
        authorizedSourceAvailable: true,
        sourceName: "Impact Partner Catalog API",
        matched: true,
        data: {
          title: typeof matchedItem.Name === "string" ? matchedItem.Name.trim() : null,
          description:
            typeof matchedItem.Description === "string" ? matchedItem.Description.trim() : null,
          price: verifiedPrice,
          currency: verifiedCurrency,
          city: typeof rawAttrs.city === "string" ? rawAttrs.city.trim() : null,
          country: typeof rawAttrs.country === "string" ? rawAttrs.country.trim() : null,
          state_region: typeof rawAttrs.region === "string" ? rawAttrs.region.trim() : null,
          address_line: typeof rawAttrs.address === "string" ? rawAttrs.address.trim() : null,
          postal_code: typeof rawAttrs.postal_code === "string" ? rawAttrs.postal_code.trim() : null,
          property_type: mapImpactPropertyType(
            String(matchedItem.Category || matchedItem.SubCategory || "")
          ),
          bedrooms: normalizePositiveNumber(rawAttrs.bedrooms ?? rawAttrs.Bedrooms),
          bathrooms: normalizePositiveNumber(rawAttrs.bathrooms ?? rawAttrs.Bathrooms),
          area_value: normalizePositiveNumber(rawAttrs.area ?? rawAttrs.Area),
          area_unit: areaUnit,
          features: Array.isArray(rawAttrs.features)
            ? rawAttrs.features.map((f: unknown) => String(f).trim()).filter(Boolean)
            : [],
          images: uniqueImages,
        },
      });
    } catch (err) {
      console.error("[Impact Lookup] Error querying Impact Catalog API:", err);
      return res.status(200).json({
        authorizedSourceAvailable: false,
        sourceName: "Impact Partner Catalog API",
        reason: "Unable to connect to the Impact Partner Catalog API right now.",
        matched: false,
        data: null,
      });
    }
  });
}
