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
  if (
    text.includes("apartment") ||
    text.includes("flat") ||
    text.includes("studio") ||
    text.includes("room")
  ) {
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
  if (typeof val === "number") {
    return Number.isFinite(val) && val > 0 ? val : null;
  }
  const cleaned = String(val)
    .replace(/[^\d.,-]/g, "")
    .replace(/,(?=\d{3}(?:\D|$))/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function readFirstNonEmptyString(
  sources: Array<Record<string, any>>,
  keys: string[]
): string | null {
  for (const src of sources) {
    if (!src || typeof src !== "object") continue;
    for (const key of keys) {
      const val = src[key];
      if (typeof val === "string" && val.trim()) {
        return val.trim();
      }
    }
  }
  return null;
}

function readFirstPositiveNumber(
  sources: Array<Record<string, any>>,
  keys: string[]
): number | null {
  for (const src of sources) {
    if (!src || typeof src !== "object") continue;
    for (const key of keys) {
      const num = normalizePositiveNumber(src[key]);
      if (num !== null) return num;
    }
  }
  return null;
}

function normalizeFeaturesList(
  matchedItem: Record<string, any>,
  rawAttrs: Record<string, any>
): string[] {
  const candidates = [
    rawAttrs.features,
    rawAttrs.amenities,
    rawAttrs.Amenities,
    matchedItem.Features,
    matchedItem.Amenities,
    matchedItem.Labels,
  ];
  const out: string[] = [];
  const seen = new Set<string>();

  for (const cand of candidates) {
    if (Array.isArray(cand)) {
      for (const entry of cand) {
        const clean = String(entry || "").trim();
        if (clean && !seen.has(clean.toLowerCase())) {
          seen.add(clean.toLowerCase());
          out.push(clean);
        }
      }
    } else if (typeof cand === "string" && cand.trim()) {
      for (const piece of cand.split(/[,;|]/)) {
        const clean = piece.trim();
        if (clean && !seen.has(clean.toLowerCase())) {
          seen.add(clean.toLowerCase());
          out.push(clean);
        }
      }
    }
  }
  return out;
}

function buildImpactHeaders(accountSid: string, authToken: string) {
  const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  return {
    Authorization: `Basic ${basicAuth}`,
    Accept: "application/json",
  };
}

async function resolveTargetCatalogs(params: {
  accountSid: string;
  configuredCatalogId: string;
  headers: Record<string, string>;
}): Promise<{
  ok: boolean;
  statusCode?: number;
  catalogIds: string[];
  catalogName?: string | null;
  reason?: string;
}> {
  const { accountSid, configuredCatalogId, headers } = params;

  if (configuredCatalogId && /^[a-zA-Z0-9_-]{1,64}$/.test(configuredCatalogId)) {
    const singleCatalogUrl = `https://api.impact.com/Mediapartners/${encodeURIComponent(
      accountSid
    )}/Catalogs/${encodeURIComponent(configuredCatalogId)}`;
    const catalogRes = await fetch(singleCatalogUrl, { headers });

    if (!catalogRes.ok) {
      return {
        ok: false,
        statusCode: catalogRes.status,
        catalogIds: [],
        reason: `Impact Catalog API returned HTTP ${catalogRes.status} for catalog ${configuredCatalogId}. Verify IMPACT_ACCOUNT_SID, IMPACT_AUTH_TOKEN, and IMPACT_CATALOG_ID.`,
      };
    }

    const catalogJson = (await catalogRes.json().catch(() => null)) as {
      Name?: string;
      Id?: string;
    } | null;

    return {
      ok: true,
      statusCode: catalogRes.status,
      catalogIds: [configuredCatalogId],
      catalogName: typeof catalogJson?.Name === "string" ? catalogJson.Name.trim() : null,
    };
  }

  const catalogsRes = await fetch(
    `https://api.impact.com/Mediapartners/${encodeURIComponent(accountSid)}/Catalogs`,
    { headers }
  );

  if (!catalogsRes.ok) {
    return {
      ok: false,
      statusCode: catalogsRes.status,
      catalogIds: [],
      reason: `Impact Catalog API returned HTTP ${catalogsRes.status}. Verify IMPACT_ACCOUNT_SID and IMPACT_AUTH_TOKEN.`,
    };
  }

  const catalogsJson = (await catalogsRes.json().catch(() => null)) as {
    Catalogs?: Array<{ Id?: string; Name?: string; CampaignName?: string }>;
  } | null;
  const catalogs = Array.isArray(catalogsJson?.Catalogs) ? catalogsJson.Catalogs : [];
  const haCatalogs = catalogs.filter((c) =>
    `${c.Name || ""} ${c.CampaignName || ""}`.toLowerCase().includes("housinganywhere")
  );
  const prioritized = haCatalogs.length > 0 ? haCatalogs : catalogs;
  const catalogIds: string[] = [];
  for (const cat of prioritized.slice(0, 5)) {
    if (cat.Id && /^[a-zA-Z0-9_-]{1,64}$/.test(String(cat.Id))) {
      catalogIds.push(String(cat.Id));
    }
  }

  return {
    ok: true,
    statusCode: catalogsRes.status,
    catalogIds,
    catalogName: prioritized[0]?.Name || null,
  };
}

export function registerImpactRoutes(app: express.Express) {
  app.get("/api/properties/impact/status", async (req, res) => {
    const auth = await verifyAdminRequest(req);
    if ("error" in auth) {
      return res.status(auth.status).json({ error: auth.error });
    }

    const accountSid = (process.env.IMPACT_ACCOUNT_SID || "").trim();
    const authToken = (process.env.IMPACT_AUTH_TOKEN || "").trim();
    const configuredCatalogId = (process.env.IMPACT_CATALOG_ID || "").trim();

    if (!accountSid || !authToken) {
      return res.status(200).json({
        configured: false,
        catalogIdConfigured: Boolean(configuredCatalogId),
        catalogReachable: false,
        statusCode: null,
        catalogName: null,
        message:
          "Server environment variables IMPACT_ACCOUNT_SID / IMPACT_AUTH_TOKEN are not configured.",
      });
    }

    try {
      const headers = buildImpactHeaders(accountSid, authToken);
      const catalogCheck = await resolveTargetCatalogs({
        accountSid,
        configuredCatalogId,
        headers,
      });

      if (!catalogCheck.ok) {
        return res.status(200).json({
          configured: true,
          catalogIdConfigured: Boolean(configuredCatalogId),
          catalogReachable: false,
          statusCode: catalogCheck.statusCode ?? null,
          catalogName: null,
          message:
            catalogCheck.reason ||
            `Impact Catalog API returned HTTP ${catalogCheck.statusCode || "error"}.`,
        });
      }

      return res.status(200).json({
        configured: true,
        catalogIdConfigured: Boolean(configuredCatalogId),
        catalogReachable: catalogCheck.catalogIds.length > 0,
        statusCode: catalogCheck.statusCode ?? 200,
        catalogName: catalogCheck.catalogName || null,
        message:
          catalogCheck.catalogIds.length > 0
            ? `Connected to Impact Partner Catalog API${
                catalogCheck.catalogName ? ` (${catalogCheck.catalogName})` : ""
              }.`
            : "Credentials accepted, but no accessible catalogs were returned.",
      });
    } catch (err) {
      console.error("[Impact Status] Error checking Impact Catalog API:", err);
      return res.status(200).json({
        configured: true,
        catalogIdConfigured: Boolean(configuredCatalogId),
        catalogReachable: false,
        statusCode: null,
        catalogName: null,
        message: "Network error contacting api.impact.com from server runtime.",
      });
    }
  });

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
      const headers = buildImpactHeaders(accountSid, authToken);
      const catalogResolution = await resolveTargetCatalogs({
        accountSid,
        configuredCatalogId,
        headers,
      });

      if (!catalogResolution.ok) {
        return res.status(200).json({
          authorizedSourceAvailable: false,
          sourceName: "Impact Partner Catalog API",
          statusCode: catalogResolution.statusCode,
          reason:
            catalogResolution.reason ||
            `Impact Catalog API returned HTTP ${catalogResolution.statusCode}.`,
          matched: false,
          data: null,
        });
      }

      const catalogIds = catalogResolution.catalogIds;
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
      let lastNon404Status: number | null = null;
      const skuCandidates = Array.from(
        new Set([rawSku, rawSku.replace(/^ut/i, ""), `ut${rawSku.replace(/^ut/i, "")}`])
      ).filter(Boolean);

      for (const catalogId of catalogIds) {
        for (const candidateSku of skuCandidates) {
          const safeSku = candidateSku.replace(/'/g, "");
          const lookupUrls = [
            `https://api.impact.com/Mediapartners/${encodeURIComponent(
              accountSid
            )}/Catalogs/${encodeURIComponent(catalogId)}/Items?Query=${encodeURIComponent(
              `CatalogItemId='${safeSku}'`
            )}`,
            `https://api.impact.com/Mediapartners/${encodeURIComponent(
              accountSid
            )}/Catalogs/${encodeURIComponent(catalogId)}/Items?Query=${encodeURIComponent(
              `UniqueId='${safeSku}'`
            )}`,
            `https://api.impact.com/Mediapartners/${encodeURIComponent(
              accountSid
            )}/Catalogs/${encodeURIComponent(catalogId)}/Items/${encodeURIComponent(safeSku)}`,
          ];

          for (const itemUrl of lookupUrls) {
            const itemRes = await fetch(itemUrl, { headers });
            if (!itemRes.ok) {
              if (itemRes.status !== 404) {
                lastNon404Status = itemRes.status;
              }
              continue;
            }

            const itemJson = (await itemRes.json().catch(() => null)) as Record<string, any> | null;
            if (!itemJson) continue;

            const items = Array.isArray(itemJson.Items)
              ? itemJson.Items
              : itemJson.CatalogItemId || itemJson.Id || itemJson.Name
              ? [itemJson]
              : [];

            if (items.length > 0) {
              matchedItem = items[0];
              break;
            }
          }
          if (matchedItem) break;
        }
        if (matchedItem) break;
      }

      // Global ItemSearch fallback across partner account if catalog query did not match
      if (!matchedItem) {
        for (const candidateSku of skuCandidates.slice(0, 2)) {
          const safeSku = candidateSku.replace(/'/g, "");
          const searchUrl = `https://api.impact.com/Mediapartners/${encodeURIComponent(
            accountSid
          )}/Catalogs/ItemSearch?Query=${encodeURIComponent(`CatalogItemId='${safeSku}'`)}`;
          const searchRes = await fetch(searchUrl, { headers });
          if (searchRes.ok) {
            const searchJson = (await searchRes.json().catch(() => null)) as {
              Items?: Array<Record<string, any>>;
            } | null;
            const items = Array.isArray(searchJson?.Items) ? searchJson.Items : [];
            if (items.length > 0) {
              matchedItem = items[0];
              break;
            }
          } else if (searchRes.status !== 404 && !lastNon404Status) {
            lastNon404Status = searchRes.status;
          }
        }
      }

      if (!matchedItem) {
        if (lastNon404Status && (lastNon404Status === 401 || lastNon404Status === 403)) {
          return res.status(200).json({
            authorizedSourceAvailable: false,
            sourceName: "Impact Partner Catalog API",
            statusCode: lastNon404Status,
            reason: `Impact Catalog API returned HTTP ${lastNon404Status}. Verify API permissions for reading Catalog Items.`,
            matched: false,
            data: null,
          });
        }

        return res.status(200).json({
          authorizedSourceAvailable: true,
          sourceName: "Impact Partner Catalog API",
          reason: `Impact Catalog API is connected${
            catalogResolution.catalogName ? ` (${catalogResolution.catalogName})` : ""
          }, but no catalog entry matched SKU "${rawSku}". You can complete missing fields manually without losing extracted HTML creative data.`,
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

      const itemTitle =
        typeof matchedItem.Name === "string" && matchedItem.Name.trim()
          ? matchedItem.Name.trim()
          : typeof matchedItem.Title === "string" && matchedItem.Title.trim()
          ? matchedItem.Title.trim()
          : null;

      const uniqueImages = Array.from(new Set(rawImages)).map((image_url) => ({
        image_url,
        alt_text: itemTitle || "",
        source: "authorized_api" as const,
      }));

      const rawAttrs =
        matchedItem.AdditionalAttributes && typeof matchedItem.AdditionalAttributes === "object"
          ? matchedItem.AdditionalAttributes
          : {};
      const attrSources = [rawAttrs, matchedItem];

      const areaUnitRaw = String(
        readFirstNonEmptyString(attrSources, ["area_unit", "AreaUnit", "SizeUnit"]) || ""
      ).toLowerCase();
      const areaUnit: AreaUnit | null =
        areaUnitRaw === "sqm" || areaUnitRaw === "m2" || areaUnitRaw === "m²"
          ? "sqm"
          : areaUnitRaw === "sqft"
          ? "sqft"
          : areaUnitRaw === "acres"
          ? "acres"
          : null;

      return res.status(200).json({
        authorizedSourceAvailable: true,
        sourceName: "Impact Partner Catalog API",
        matched: true,
        data: {
          title: itemTitle,
          description:
            typeof matchedItem.Description === "string" && matchedItem.Description.trim()
              ? matchedItem.Description.trim()
              : null,
          price: verifiedPrice,
          currency: verifiedCurrency,
          city: readFirstNonEmptyString(attrSources, ["city", "City"]),
          country: readFirstNonEmptyString(attrSources, ["country", "Country"]),
          state_region: readFirstNonEmptyString(attrSources, [
            "region",
            "Region",
            "state",
            "State",
            "state_region",
          ]),
          address_line: readFirstNonEmptyString(attrSources, [
            "address",
            "Address",
            "address_line",
            "StreetAddress",
          ]),
          postal_code: readFirstNonEmptyString(attrSources, [
            "postal_code",
            "PostalCode",
            "ZipCode",
          ]),
          property_type: mapImpactPropertyType(
            [
              matchedItem.Category,
              matchedItem.SubCategory,
              matchedItem.OriginalFormatCategory,
              rawAttrs.property_type,
              rawAttrs.PropertyType,
            ]
              .filter(Boolean)
              .join(" ")
          ),
          bedrooms: readFirstPositiveNumber(attrSources, ["bedrooms", "Bedrooms"]),
          bathrooms: readFirstPositiveNumber(attrSources, ["bathrooms", "Bathrooms"]),
          area_value: readFirstPositiveNumber(attrSources, [
            "area",
            "Area",
            "area_value",
            "Size",
            "FloorArea",
          ]),
          area_unit: areaUnit,
          available_from: readFirstNonEmptyString(attrSources, [
            "available_from",
            "AvailableFrom",
            "AvailabilityDate",
          ]),
          features: normalizeFeaturesList(matchedItem, rawAttrs),
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
