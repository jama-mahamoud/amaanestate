import { AreaUnit, PropertyType } from '../types';
import { normalizeCountryInfo } from './countries';

export type FieldProvenanceSource =
  | 'impact_html'
  | 'authorized_api'
  | 'manual'
  | 'missing';

export type TrackedPropertyField =
  | 'title'
  | 'slug'
  | 'transaction_type'
  | 'property_type'
  | 'price'
  | 'currency'
  | 'city'
  | 'country'
  | 'state_region'
  | 'address_line'
  | 'postal_code'
  | 'bedrooms'
  | 'bathrooms'
  | 'area_value'
  | 'description'
  | 'features'
  | 'images'
  | 'source_listing_id'
  | 'source_url'
  | 'original_listing_url';

export type FieldProvenanceMap = Partial<Record<TrackedPropertyField, FieldProvenanceSource>>;

export interface ImportedImageCandidate {
  image_url: string;
  alt_text: string;
  source: 'impact_html' | 'authorized_api' | 'upload' | 'manual';
}

export interface HousingAnywhereParseResult {
  success: boolean;
  error?: string;
  sku: string | null;
  impactTrackingUrl: string | null;
  originalListingUrl: string | null;
  title: string | null;
  suggestedLocationTitle: string | null;
  country: string | null;
  countryCode: string | null;
  currency: string | null;
  city: string | null;
  addressLine: string | null;
  propertyType: PropertyType | null;
  images: ImportedImageCandidate[];
  trackingMeta: {
    anchorId?: string | null;
    utmSource?: string | null;
    utmContent?: string | null;
    intsrc?: string | null;
  };
  provenance: FieldProvenanceMap;
  missingFields: string[];
  warnings: string[];
}

export interface AuthorizedImpactLookupResponse {
  authorizedSourceAvailable: boolean;
  sourceName: string;
  reason?: string;
  matched: boolean;
  data: {
    title?: string | null;
    description?: string | null;
    price?: number | null;
    currency?: string | null;
    city?: string | null;
    country?: string | null;
    state_region?: string | null;
    address_line?: string | null;
    postal_code?: string | null;
    property_type?: PropertyType | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    area_value?: number | null;
    area_unit?: AreaUnit | null;
    features?: string[];
    images?: ImportedImageCandidate[];
  } | null;
}

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  AT: 'EUR',
  BE: 'EUR',
  CY: 'EUR',
  DE: 'EUR',
  EE: 'EUR',
  ES: 'EUR',
  FI: 'EUR',
  FR: 'EUR',
  GR: 'EUR',
  HR: 'EUR',
  IE: 'EUR',
  IT: 'EUR',
  LT: 'EUR',
  LU: 'EUR',
  LV: 'EUR',
  MT: 'EUR',
  NL: 'EUR',
  PT: 'EUR',
  SI: 'EUR',
  SK: 'EUR',
  GB: 'GBP',
  CH: 'CHF',
  DK: 'DKK',
  SE: 'SEK',
  NO: 'NOK',
  PL: 'PLN',
  CZ: 'CZK',
  HU: 'HUF',
  RO: 'RON',
  BG: 'BGN',
  US: 'USD',
  CA: 'CAD',
  AU: 'AUD',
  AE: 'AED',
  SA: 'SAR',
  TR: 'TRY',
  SG: 'SGD',
  JP: 'JPY',
};

const IMPACT_OR_AFFILIATE_HOST_RE =
  /(?:impact\.com|pxf\.io|sjv\.io|evyy\.net|ojrq\.net|7eer\.net|pntra\.com|housinganywhere)/i;

const TRACKING_PIXEL_PATH_RE =
  /(?:\/i\/\d+\/\d+\/\d+|ad\.doubleclick\.net|bat\.bing\.com|pixel\.|beacon\.)/i;

const STREET_MINOR_WORDS = new Set([
  'de',
  'du',
  'des',
  'd',
  'la',
  'le',
  'les',
  'l',
  'en',
  'et',
  'au',
  'aux',
  'à',
  'van',
  'der',
  'den',
  'het',
  'von',
  'zu',
  'am',
  'im',
  'an',
  'auf',
  'di',
  'del',
  'della',
  'dei',
  'da',
  'do',
  'dos',
  'das',
  'y',
  'of',
  'and',
  'the',
]);

export function validateSafeHttpUrl(
  rawUrl?: string | null,
  options: { allowRelativeImagePath?: boolean } = {}
): { valid: boolean; normalized?: string; error?: string } {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    return { valid: false, error: 'URL is required.' };
  }
  if (/^(?:javascript|data|vbscript|file):/i.test(trimmed)) {
    return { valid: false, error: 'Unsafe URL protocol is not allowed.' };
  }
  if (options.allowRelativeImagePath && trimmed.startsWith('/')) {
    return { valid: true, normalized: trimmed };
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { valid: false, error: 'URL must start with https:// or http://.' };
    }
    if (!parsed.hostname) {
      return { valid: false, error: 'URL must contain a valid hostname.' };
    }
    return { valid: true, normalized: trimmed };
  } catch {
    return { valid: false, error: 'Enter a valid https:// or http:// URL.' };
  }
}

export function extractOriginalUrlFromImpactUrl(impactUrl?: string | null): string | null {
  const trimmed = (impactUrl || '').trim();
  if (!trimmed) return null;
  const check = validateSafeHttpUrl(trimmed);
  if (!check.valid) return null;

  try {
    const parsed = new URL(trimmed);
    const paramCandidates = ['u', 'url', 'dest', 'destination', 'mpre'];
    for (const key of paramCandidates) {
      const val = parsed.searchParams.get(key);
      if (val) {
        let candidate = val.trim();
        if (/^https?%3A/i.test(candidate)) {
          try {
            candidate = decodeURIComponent(candidate);
          } catch {
            // Keep first decoded form
          }
        }
        if (validateSafeHttpUrl(candidate).valid) {
          return candidate;
        }
      }
    }

    if (parsed.hostname.toLowerCase().includes('housinganywhere.com')) {
      return trimmed;
    }
  } catch {
    return null;
  }
  return null;
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_m, dec) => {
      const code = Number(dec);
      return Number.isFinite(code) ? String.fromCharCode(code) : _m;
    })
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCharCode(code) : _m;
    });
}

function formatSlugSegment(rawSegment: string, isStreet = false): string {
  let decoded = rawSegment;
  try {
    decoded = decodeURIComponent(rawSegment);
  } catch {
    decoded = rawSegment;
  }

  const spaced = decoded
    .replace(/[-_+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!spaced) return '';

  return spaced
    .split(' ')
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (isStreet && idx > 0 && STREET_MINOR_WORDS.has(lower)) {
        return lower;
      }
      if (/^[A-ZÀ-ÖØ-Ý]/.test(word) && !/^[A-Z0-9]+$/.test(word)) {
        return word;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

interface ParsedAnchorTag {
  id: string;
  href: string;
  title: string;
  text: string;
}

interface ParsedImgTag {
  src: string;
  alt: string;
  width: string;
  height: string;
}

interface SafeParsedHtmlElements {
  anchors: ParsedAnchorTag[];
  images: ParsedImgTag[];
  headings: string[];
}

function parseAttributesFromTag(attrText: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(attrText)) !== null) {
    const name = match[1].toLowerCase();
    if (name.startsWith('on')) continue; // Ignore any inline event handler attributes
    const rawVal = match[2] ?? match[3] ?? match[4] ?? '';
    attrs[name] = decodeHtmlEntities(rawVal).trim();
  }
  return attrs;
}

function extractElementsSafely(rawHtml: string): SafeParsedHtmlElements {
  // Always use an inert detached DOMParser in the browser (scripts never execute, images do not fetch)
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');

    const anchors: ParsedAnchorTag[] = Array.from(doc.querySelectorAll('a')).map((a) => ({
      id: (a.getAttribute('id') || '').trim(),
      href: (a.getAttribute('href') || '').trim(),
      title: (a.getAttribute('title') || '').trim(),
      text: (a.textContent || '').replace(/\s+/g, ' ').trim(),
    }));

    const images: ParsedImgTag[] = Array.from(doc.querySelectorAll('img')).map((img) => ({
      src: (img.getAttribute('src') || img.getAttribute('data-src') || '').trim(),
      alt: (img.getAttribute('alt') || '').trim(),
      width: (img.getAttribute('width') || '').trim(),
      height: (img.getAttribute('height') || '').trim(),
    }));

    const headings: string[] = Array.from(doc.querySelectorAll('h1, h2, h3'))
      .map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    return { anchors, images, headings };
  }

  // Deterministic non-DOM fallback (used in Node unit tests / SSR checks)
  const stripped = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  const anchors: ParsedAnchorTag[] = [];
  const anchorRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let aMatch: RegExpExecArray | null;
  while ((aMatch = anchorRe.exec(stripped)) !== null) {
    const attrs = parseAttributesFromTag(aMatch[1] || '');
    const innerText = decodeHtmlEntities((aMatch[2] || '').replace(/<[^>]+>/g, ' '))
      .replace(/\s+/g, ' ')
      .trim();
    anchors.push({
      id: attrs.id || '',
      href: attrs.href || '',
      title: attrs.title || '',
      text: innerText,
    });
  }

  const images: ParsedImgTag[] = [];
  const imgRe = /<img\b([^>]*)\/?>/gi;
  let iMatch: RegExpExecArray | null;
  while ((iMatch = imgRe.exec(stripped)) !== null) {
    const attrs = parseAttributesFromTag(iMatch[1] || '');
    images.push({
      src: attrs.src || attrs['data-src'] || '',
      alt: attrs.alt || '',
      width: attrs.width || '',
      height: attrs.height || '',
    });
  }

  const headings: string[] = [];
  const headingRe = /<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/gi;
  let hMatch: RegExpExecArray | null;
  while ((hMatch = headingRe.exec(stripped)) !== null) {
    const text = decodeHtmlEntities((hMatch[1] || '').replace(/<[^>]+>/g, ' '))
      .replace(/\s+/g, ' ')
      .trim();
    if (text) headings.push(text);
  }

  return { anchors, images, headings };
}

function isTrackingPixelImage(img: ParsedImgTag): boolean {
  const w = Number(img.width);
  const h = Number(img.height);
  if ((img.width !== '' && w <= 1) || (img.height !== '' && h <= 1)) {
    return true;
  }
  if (TRACKING_PIXEL_PATH_RE.test(img.src)) {
    return true;
  }
  return false;
}

function isMeaningfulTitleText(candidate: string | undefined | null, sku?: string | null): boolean {
  const clean = (candidate || '').trim();
  if (clean.length < 4) return false;
  if (/^https?:\/\//i.test(clean)) return false;
  if (sku && clean === sku) return false;
  if (/^(?:image|photo|property|listing|banner|click here|view property)$/i.test(clean)) {
    return false;
  }
  return true;
}

function extractLocationFromHousingAnywhereUrl(originalUrl: string | null): {
  country: string | null;
  countryCode: string | null;
  city: string | null;
  addressLine: string | null;
  skuFromPath: string | null;
  utmSource: string | null;
  utmContent: string | null;
} {
  if (!originalUrl) {
    return {
      country: null,
      countryCode: null,
      city: null,
      addressLine: null,
      skuFromPath: null,
      utmSource: null,
      utmContent: null,
    };
  }

  try {
    const parsed = new URL(originalUrl);
    const segments = parsed.pathname
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean);

    const utmSource = parsed.searchParams.get('utm_source')?.trim() || null;
    const utmContent = parsed.searchParams.get('utm_content')?.trim() || null;

    let skuFromPath: string | null = null;
    let country: string | null = null;
    let countryCode: string | null = null;
    let city: string | null = null;
    let addressLine: string | null = null;

    // Look for SKU patterns like /ut1538364/ or /room/1538364
    for (const seg of segments) {
      const utMatch = seg.match(/^ut(\d{4,})$/i);
      if (utMatch) {
        skuFromPath = utMatch[1];
        break;
      }
    }

    // Find 2-letter ISO country code in HousingAnywhere path: /room/ut1538364/fr/Paris/boulevard-de-dixmude
    const countryIdx = segments.findIndex((seg) => /^[a-z]{2}$/i.test(seg));
    if (countryIdx >= 0) {
      const code = segments[countryIdx].toUpperCase();
      const normalized = normalizeCountryInfo(code);
      if (normalized && normalized.code) {
        country = normalized.name;
        countryCode = normalized.code;
      }
      if (segments[countryIdx + 1]) {
        city = formatSlugSegment(segments[countryIdx + 1], false) || null;
      }
      if (segments[countryIdx + 2]) {
        addressLine = formatSlugSegment(segments[countryIdx + 2], true) || null;
      }
    }

    if (!city && utmContent) {
      city = formatSlugSegment(utmContent, false) || null;
    }

    return {
      country,
      countryCode,
      city,
      addressLine,
      skuFromPath,
      utmSource,
      utmContent,
    };
  } catch {
    return {
      country: null,
      countryCode: null,
      city: null,
      addressLine: null,
      skuFromPath: null,
      utmSource: null,
      utmContent: null,
    };
  }
}

export function parseImpactCreativeHtml(rawInput: string): HousingAnywhereParseResult {
  const trimmed = (rawInput || '').trim();
  const emptyResult: HousingAnywhereParseResult = {
    success: false,
    sku: null,
    impactTrackingUrl: null,
    originalListingUrl: null,
    title: null,
    suggestedLocationTitle: null,
    country: null,
    countryCode: null,
    currency: null,
    city: null,
    addressLine: null,
    propertyType: null,
    images: [],
    trackingMeta: {},
    provenance: {},
    missingFields: [],
    warnings: [],
  };

  if (!trimmed) {
    return {
      ...emptyResult,
      error: 'Paste an HTML Creative copied from the HousingAnywhere Impact Marketplace.',
    };
  }

  // Support pasting a bare Impact URL as well as full HTML creative markup
  const normalizedHtml =
    /^https?:\/\//i.test(trimmed) && !trimmed.includes('<')
      ? `<a href="${trimmed}"></a>`
      : trimmed;

  const { anchors, images: rawImages, headings } = extractElementsSafely(normalizedHtml);

  const validAnchors = anchors.filter((a) => validateSafeHttpUrl(a.href).valid);
  if (validAnchors.length === 0) {
    return {
      ...emptyResult,
      error:
        'No valid Impact or HousingAnywhere tracking link (<a href="https://...">) was found in the pasted HTML.',
    };
  }

  // Prefer anchors matching Impact / HousingAnywhere or carrying prodsku / u parameters
  const primaryAnchor =
    validAnchors.find((a) => {
      try {
        const u = new URL(a.href);
        return (
          IMPACT_OR_AFFILIATE_HOST_RE.test(u.hostname) ||
          u.searchParams.has('prodsku') ||
          u.searchParams.has('u')
        );
      } catch {
        return false;
      }
    }) || validAnchors[0];

  const impactTrackingUrl = primaryAnchor.href;
  const originalListingUrl = extractOriginalUrlFromImpactUrl(impactTrackingUrl);

  let parsedImpactUrl: URL | null = null;
  try {
    parsedImpactUrl = new URL(impactTrackingUrl);
  } catch {
    parsedImpactUrl = null;
  }

  const intsrc = parsedImpactUrl?.searchParams.get('intsrc')?.trim() || null;
  const prodskuParam =
    parsedImpactUrl?.searchParams.get('prodsku')?.trim() ||
    parsedImpactUrl?.searchParams.get('sku')?.trim() ||
    parsedImpactUrl?.searchParams.get('itemId')?.trim() ||
    null;

  // Extract property images (deduplicated, filtering out 1x1 tracking pixels)
  const seenImageUrls = new Set<string>();
  const images: ImportedImageCandidate[] = [];
  for (const rawImg of rawImages) {
    if (!validateSafeHttpUrl(rawImg.src).valid) continue;
    if (isTrackingPixelImage(rawImg)) continue;
    if (seenImageUrls.has(rawImg.src)) continue;
    seenImageUrls.add(rawImg.src);
    images.push({
      image_url: rawImg.src,
      alt_text: rawImg.alt || '',
      source: 'impact_html',
    });
  }

  // Extract location & SKU hints from destination URL
  const urlLocation = extractLocationFromHousingAnywhereUrl(originalListingUrl);

  // Extract SKU from image path (/unit_type/1538364/...) if still missing
  let skuFromImagePath: string | null = null;
  for (const img of images) {
    const match = img.image_url.match(/\/(?:unit_type|room|listing)\/(\d{4,})\//i);
    if (match) {
      skuFromImagePath = match[1];
      break;
    }
  }

  const sku =
    prodskuParam ||
    (primaryAnchor.id ? primaryAnchor.id.trim() : null) ||
    urlLocation.skuFromPath ||
    skuFromImagePath ||
    null;

  // Title ONLY when actually present in the creative (never fabricated)
  let title: string | null = null;
  const titleCandidates = [
    primaryAnchor.title,
    ...images.map((img) => img.alt_text),
    ...headings,
    primaryAnchor.text,
  ];
  for (const candidate of titleCandidates) {
    if (isMeaningfulTitleText(candidate, sku)) {
      title = candidate.trim();
      break;
    }
  }

  const suggestedLocationTitle =
    [urlLocation.addressLine, urlLocation.city].filter(Boolean).join(', ') || null;

  const currency =
    urlLocation.countryCode && COUNTRY_TO_CURRENCY[urlLocation.countryCode]
      ? COUNTRY_TO_CURRENCY[urlLocation.countryCode]
      : null;

  const provenance: FieldProvenanceMap = {
    source_url: 'impact_html',
    original_listing_url: originalListingUrl ? 'impact_html' : 'missing',
    source_listing_id: sku ? 'impact_html' : 'missing',
    transaction_type: 'impact_html',
    country: urlLocation.country ? 'impact_html' : 'missing',
    city: urlLocation.city ? 'impact_html' : 'missing',
    address_line: urlLocation.addressLine ? 'impact_html' : 'missing',
    currency: currency ? 'impact_html' : 'missing',
    images: images.length > 0 ? 'impact_html' : 'missing',
    title: title ? 'impact_html' : 'missing',
    price: 'missing',
    property_type: 'missing',
    bedrooms: 'missing',
    bathrooms: 'missing',
    area_value: 'missing',
    description: 'missing',
    features: 'missing',
  };

  const missingFields: string[] = [];
  if (!title) missingFields.push('Property Title (not included in HTML creative)');
  missingFields.push('Monthly Rent Price (never estimated or taken from commission data)');
  missingFields.push('Property Type (confirm Apartment, House, Other, etc.)');
  missingFields.push('Bedrooms, Bathrooms & Floor Area');
  missingFields.push('Property Description & Features');
  if (!urlLocation.city) missingFields.push('City');
  if (!urlLocation.country) missingFields.push('Country');
  if (images.length === 0) missingFields.push('Property Photos');

  const warnings: string[] = [];
  if (images.length > 0 && images.every((img) => !img.alt_text.trim())) {
    warnings.push(
      'Image alt text in the Impact HTML creative was empty. Consider adding descriptive alt text.'
    );
  }
  if (!IMPACT_OR_AFFILIATE_HOST_RE.test(impactTrackingUrl)) {
    warnings.push(
      'The extracted link does not match a standard Impact/HousingAnywhere tracking domain. Verify the URL before publishing.'
    );
  }
  if (!title) {
    warnings.push(
      'No property title text was included in the pasted HTML creative. Enter the verified listing title before saving.'
    );
  }

  return {
    success: true,
    sku,
    impactTrackingUrl,
    originalListingUrl,
    title,
    suggestedLocationTitle,
    country: urlLocation.country,
    countryCode: urlLocation.countryCode,
    currency,
    city: urlLocation.city,
    addressLine: urlLocation.addressLine,
    propertyType: null, // Not reliably verifiable from /room/ut... URLs alone
    images,
    trackingMeta: {
      anchorId: primaryAnchor.id || null,
      utmSource: urlLocation.utmSource,
      utmContent: urlLocation.utmContent,
      intsrc,
    },
    provenance,
    missingFields,
    warnings,
  };
}
