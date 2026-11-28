import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  AreaUnit,
  EnquiryStatus,
  ListingStatus,
  Property,
  PropertyCountryStat,
  PropertyEnquiry,
  PropertyFilterOptions,
  PropertyImage,
  PropertyLocationStat,
  PropertySearchResult,
  PropertyType,
  PublicationStatus,
  RentalPeriod,
  TransactionType,
} from '../types';

export const PROPERTY_CATALOG_UPDATED_EVENT = 'amaan:properties-updated';
export const PROPERTY_CATALOG_CHANNEL = 'amaan_properties_updates';

export function notifyPropertyCatalogUpdated() {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(PROPERTY_CATALOG_UPDATED_EVENT));
  } catch {
    // Ignore event dispatch errors in restricted environments
  }
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel(PROPERTY_CATALOG_CHANNEL);
      channel.postMessage({ type: 'updated', timestamp: Date.now() });
      channel.close();
    } catch {
      // Ignore BroadcastChannel errors
    }
  }
}

export function isPgrst205Error(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || '');
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    msg.includes('PGRST205') ||
    msg.includes('Could not find the table') ||
    msg.includes('does not exist')
  );
}

export function formatPropertyPrice(
  price: number,
  currency = 'USD',
  transactionType: TransactionType = 'sale',
  rentalPeriod?: RentalPeriod | null
): string {
  const safeCurrency = /^[A-Z]{3}$/.test((currency || '').trim().toUpperCase())
    ? currency.trim().toUpperCase()
    : 'USD';

  let formatted = '';
  try {
    formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency,
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);
  } catch {
    formatted = `${safeCurrency} ${(Number(price) || 0).toLocaleString('en-US')}`;
  }

  if (transactionType === 'rent') {
    const unit = rentalPeriod || 'month';
    return `${formatted} / ${unit}`;
  }

  return formatted;
}

export function formatPropertyTypeLabel(propertyType: PropertyType | string): string {
  const labels: Record<string, string> = {
    house: 'House',
    apartment: 'Apartment',
    villa: 'Villa',
    townhouse: 'Townhouse',
    condominium: 'Condominium',
    land: 'Land',
    other: 'Property',
  };
  return labels[propertyType] || 'Property';
}

export function formatListingStatusLabel(status: ListingStatus | string): string {
  const labels: Record<string, string> = {
    available: 'Available',
    pending: 'Pending',
    under_contract: 'Under Contract',
    sold: 'Sold',
    rented: 'Rented',
    off_market: 'Off Market',
  };
  return labels[status] || status;
}

export function formatPropertyLocation(property: Pick<Property, 'city' | 'state_region' | 'country'>): string {
  return [property.city, property.state_region, property.country].filter(Boolean).join(', ');
}

export function getPrimaryPropertyImage(property: Pick<Property, 'images'>): PropertyImage | null {
  if (!property.images || property.images.length === 0) return null;
  const primary = property.images.find((img) => img.is_primary);
  return primary || property.images[0] || null;
}

export const HOUSINGANYWHERE_SOURCE_NAME = 'housinganywhere_impact';

const AFFILIATE_SOURCE_PATTERNS = [
  'housinganywhere',
  'affiliate',
  'partner',
  'impact',
];

const IMPACT_TRACKING_HOST_PATTERNS = [
  'impact.com',
  'sjv.io',
  'evyy.net',
  'pxf.io',
  'ojrq.net',
  '7eer.net',
  'pntra.com',
  'housinganywhere',
];

export function isHousingAnywhereSource(sourceName?: string | null): boolean {
  const normalized = (sourceName || '').trim().toLowerCase();
  return (
    normalized === HOUSINGANYWHERE_SOURCE_NAME ||
    normalized.includes('housinganywhere')
  );
}

export function formatListingSourceLabel(sourceName?: string | null): string {
  const normalized = (sourceName || '').trim().toLowerCase();
  if (
    normalized === HOUSINGANYWHERE_SOURCE_NAME ||
    normalized.includes('housinganywhere')
  ) {
    return 'HousingAnywhere Affiliate (Impact)';
  }
  if (normalized === 'showcase_sample') return 'Showcase Sample';
  if (normalized === 'listhub') return 'ListHub MLS Feed';
  if (normalized === 'feed') return 'Custom XML / RESO Feed';
  if (!normalized || normalized === 'manual') return 'AMAAN ESTATE Direct';
  return sourceName!.trim();
}

export function isValidExternalPropertyUrl(rawUrl?: string | null): boolean {
  const cleaned = (rawUrl || '').trim();
  if (!cleaned) return false;
  try {
    const parsed = new URL(cleaned);
    return (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      Boolean(parsed.hostname)
    );
  } catch {
    return false;
  }
}

export function isPartnerListing(
  property: Pick<Property, 'source_name' | 'source_url'>
): boolean {
  const sourceName = (property.source_name || '').trim().toLowerCase();
  if (AFFILIATE_SOURCE_PATTERNS.some((pattern) => sourceName.includes(pattern))) {
    return true;
  }

  const rawUrl = (property.source_url || '').trim();
  if (!isValidExternalPropertyUrl(rawUrl)) return false;

  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();
    if (IMPACT_TRACKING_HOST_PATTERNS.some((pattern) => host.includes(pattern))) {
      return true;
    }
    const qs = parsed.search.toLowerCase();
    if (qs.includes('irclickid=') || qs.includes('im_ref=') || qs.includes('utm_source=amaanestate')) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function getPartnerTrackingUrl(
  property: Pick<Property, 'source_name' | 'source_url'>
): string | null {
  if (!isPartnerListing(property)) return null;
  const rawUrl = (property.source_url || '').trim();
  return isValidExternalPropertyUrl(rawUrl) ? rawUrl : null;
}

export function validatePropertyAffiliateRules(input: {
  source_name?: string | null;
  transaction_type: TransactionType;
  publication_status: PublicationStatus;
  source_url?: string | null;
  title?: string | null;
  city?: string | null;
  country?: string | null;
  price?: number | null;
}): string | null {
  if (!isHousingAnywhereSource(input.source_name)) {
    return null;
  }

  if (input.transaction_type !== 'rent') {
    return 'HousingAnywhere Affiliate (Impact) listings must use Transaction Type = For Rent.';
  }

  const trimmedUrl = (input.source_url || '').trim();
  if (trimmedUrl && !isValidExternalPropertyUrl(trimmedUrl)) {
    return 'Impact Affiliate Tracking URL must be a valid https:// or http:// URL.';
  }

  if (input.publication_status === 'published') {
    if (input.title !== undefined && !(input.title || '').trim()) {
      return 'Property Title is required before publishing a HousingAnywhere affiliate listing.';
    }
    if (input.city !== undefined && !(input.city || '').trim()) {
      return 'City is required before publishing a HousingAnywhere affiliate listing.';
    }
    if (input.country !== undefined && !(input.country || '').trim()) {
      return 'Country is required before publishing a HousingAnywhere affiliate listing.';
    }
    if (input.price !== undefined && (input.price === null || !(Number(input.price) > 0))) {
      return 'A verified rental price greater than 0 is required before publishing a HousingAnywhere affiliate listing.';
    }
    if (!trimmedUrl) {
      return 'An Impact Affiliate Tracking URL is required before publishing a HousingAnywhere affiliate listing.';
    }
  }

  return null;
}

export function formatAreaUnitLabel(unit?: AreaUnit | string | null): string {
  const normalized = (unit || '').trim().toLowerCase();
  if (normalized === 'sqm') return 'm²';
  if (normalized === 'sqft') return 'sq ft';
  if (normalized === 'acres') return 'acres';
  return normalized || 'm²';
}

export async function checkImpactApiStatus(): Promise<{
  configured: boolean;
  catalogIdConfigured: boolean;
  catalogReachable: boolean;
  statusCode?: number | null;
  catalogName?: string | null;
  message: string;
}> {
  const headers: Record<string, string> = {};
  if (isSupabaseConfigured && supabase) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch {
      // Proceed without bearer if session retrieval fails
    }
  }

  try {
    const response = await fetch('/api/properties/impact/status', {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload) {
      return {
        configured: false,
        catalogIdConfigured: false,
        catalogReachable: false,
        statusCode: response.status,
        message:
          payload?.error ||
          `Server Impact status endpoint returned HTTP ${response.status} (check Vercel server deployment).`,
      };
    }
    return payload;
  } catch {
    return {
      configured: false,
      catalogIdConfigured: false,
      catalogReachable: false,
      statusCode: null,
      message: 'Network error reaching /api/properties/impact/status.',
    };
  }
}

export async function lookupImpactPropertyDetails(params: {
  sku: string;
  originalUrl?: string | null;
  impactUrl?: string | null;
}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (isSupabaseConfigured && supabase) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch {
      // Proceed without bearer if session retrieval fails
    }
  }

  try {
    const response = await fetch('/api/properties/impact/lookup', {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload) {
      const statusDetail =
        response.status === 404
          ? `HTTP 404 — authorized catalog lookup endpoint is not deployed on this server.`
          : `HTTP ${response.status} — unable to reach authorized catalog lookup endpoint.`;
      return {
        authorizedSourceAvailable: false,
        sourceName: 'Impact Partner Catalog API',
        statusCode: response.status,
        reason: payload?.error || statusDetail,
        matched: false,
        data: null,
      };
    }
    return payload;
  } catch {
    return {
      authorizedSourceAvailable: false,
      sourceName: 'Impact Partner Catalog API',
      reason: 'Network error contacting Impact catalog lookup endpoint.',
      matched: false,
      data: null,
    };
  }
}

export function slugifyPropertyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base || `property-${Date.now()}`;
}

function normalizePropertyRow(row: any): Property {
  const images: PropertyImage[] = Array.isArray(row.property_images)
    ? [...row.property_images].sort((a, b) => {
        if (Boolean(a.is_primary) !== Boolean(b.is_primary)) {
          return a.is_primary ? -1 : 1;
        }
        return (Number(a.display_order) || 0) - (Number(b.display_order) || 0);
      })
    : Array.isArray(row.images)
    ? row.images
    : [];

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    transaction_type: row.transaction_type,
    property_type: row.property_type,
    listing_status: row.listing_status,
    publication_status: row.publication_status,
    price: Number(row.price) || 0,
    currency: row.currency || 'USD',
    rental_period: row.rental_period || null,
    available_from: row.available_from || null,
    bedrooms: row.bedrooms !== null && row.bedrooms !== undefined ? Number(row.bedrooms) : null,
    bathrooms: row.bathrooms !== null && row.bathrooms !== undefined ? Number(row.bathrooms) : null,
    area_value: row.area_value !== null && row.area_value !== undefined ? Number(row.area_value) : null,
    area_unit: (row.area_unit as AreaUnit) || 'sqft',
    address_line: row.address_line || null,
    city: row.city,
    state_region: row.state_region || null,
    country: row.country,
    postal_code: row.postal_code || null,
    latitude: row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : null,
    longitude: row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : null,
    description: row.description || '',
    features: Array.isArray(row.features) ? row.features : [],
    is_featured: Boolean(row.is_featured),
    agent_name: row.agent_name || null,
    agent_email: row.agent_email || null,
    agent_phone: row.agent_phone || null,
    brokerage_name: row.brokerage_name || null,
    source_id: row.source_id || null,
    source_name: row.source_name || 'manual',
    source_listing_id: row.source_listing_id || null,
    source_url: row.source_url || null,
    raw_payload: row.raw_payload && typeof row.raw_payload === 'object' ? row.raw_payload : null,
    published_at: row.published_at || null,
    created_by: row.created_by || null,
    created_at: row.created_at,
    updated_at: row.updated_at || undefined,
    images,
  };
}

// ============================================================================
// Public Marketplace API Clients (Routed via Express /api/properties*)
// ============================================================================

export async function getProperties(options: PropertyFilterOptions): Promise<PropertySearchResult> {
  const params = new URLSearchParams();
  params.set('transaction_type', options.transaction_type);

  if (options.property_type && options.property_type !== 'all') {
    params.set('property_type', options.property_type);
  }
  if (options.country && String(options.country).trim()) {
    params.set('country', String(options.country).trim());
  }
  if (options.location && String(options.location).trim()) {
    params.set('location', String(options.location).trim());
  }
  if (options.min_price !== undefined && String(options.min_price).trim() !== '') {
    params.set('min_price', String(options.min_price).trim());
  }
  if (options.max_price !== undefined && String(options.max_price).trim() !== '') {
    params.set('max_price', String(options.max_price).trim());
  }
  if (options.bedrooms !== undefined && String(options.bedrooms).trim() !== '') {
    params.set('bedrooms', String(options.bedrooms).trim());
  }
  if (options.bathrooms !== undefined && String(options.bathrooms).trim() !== '') {
    params.set('bathrooms', String(options.bathrooms).trim());
  }
  if (options.listing_status && options.listing_status !== 'all') {
    params.set('listing_status', options.listing_status);
  }
  if (options.transaction_type === 'rent') {
    if (options.rental_period && options.rental_period !== 'all') {
      params.set('rental_period', options.rental_period);
    }
    if (options.availability_date && String(options.availability_date).trim()) {
      params.set('availability_date', String(options.availability_date).trim());
    }
  }
  if (options.featured) {
    params.set('featured', 'true');
  }
  if (options.sort) {
    params.set('sort', options.sort);
  }
  if (options.page) {
    params.set('page', String(options.page));
  }
  if (options.limit) {
    params.set('limit', String(options.limit));
  }

  const response = await fetch(`/api/properties?${params.toString()}`, { cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || 'Unable to load properties right now.');
  }

  return {
    properties: Array.isArray(payload.properties) ? payload.properties : [],
    total: Number(payload.total) || 0,
    page: Number(payload.page) || 1,
    limit: Number(payload.limit) || 12,
    totalPages: Number(payload.totalPages) || 0,
    schemaPending: Boolean(payload.schemaPending),
  };
}

export async function getFeaturedProperties(
  transactionType?: TransactionType,
  limit = 6
): Promise<{ properties: Property[]; schemaPending: boolean }> {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  if (transactionType) {
    params.set('transaction_type', transactionType);
  }

  const response = await fetch(`/api/properties/featured?${params.toString()}`, {
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || 'Unable to load featured properties.');
  }

  return {
    properties: Array.isArray(payload.properties) ? payload.properties : [],
    schemaPending: Boolean(payload.schemaPending),
  };
}

export async function getShowcaseProperties(
  transactionType?: TransactionType
): Promise<{ properties: Property[]; schemaPending: boolean }> {
  const params = new URLSearchParams();
  if (transactionType) {
    params.set('transaction_type', transactionType);
  }

  try {
    const response = await fetch(`/api/properties/showcase?${params.toString()}`);
    if (response.ok) {
      const payload = await response.json().catch(() => ({}));
      const list = Array.isArray(payload.properties)
        ? payload.properties
        : Array.isArray(payload.data)
        ? payload.data
        : null;
      if (list) {
        return {
          properties: list,
          schemaPending: Boolean(payload.schemaPending),
        };
      }
    }
  } catch {
    // Proceed to client storage fallback
  }

  const { loadDemoDb } = await import('./demoContent');
  const db = loadDemoDb();
  const filtered = db.properties.filter(
    (p) =>
      p.publication_status === 'published' &&
      !p.is_sample &&
      p.source_name !== 'showcase_sample' &&
      (!transactionType || p.transaction_type === transactionType)
  );

  return { properties: filtered, schemaPending: false };
}

export async function getPropertyLocations(): Promise<{
  locations: PropertyLocationStat[];
  schemaPending: boolean;
}> {
  const response = await fetch('/api/properties/locations', { cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || 'Unable to load marketplace locations.');
  }

  return {
    locations: Array.isArray(payload.locations) ? payload.locations : [],
    schemaPending: Boolean(payload.schemaPending),
  };
}

export async function getPropertyCountries(): Promise<{
  countries: PropertyCountryStat[];
  schemaPending: boolean;
}> {
  const response = await fetch('/api/properties/countries', { cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || 'Unable to load international markets.');
  }

  return {
    countries: Array.isArray(payload.countries) ? payload.countries : [],
    schemaPending: Boolean(payload.schemaPending),
  };
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const cleanSlug = slug.trim();
  try {
    const response = await fetch(`/api/properties/${encodeURIComponent(cleanSlug)}`);
    if (response.ok) {
      const payload = await response.json().catch(() => ({}));
      if (payload?.property) {
        return payload.property;
      }
    }
  } catch {
    // Proceed to client storage fallback
  }

  // Client database fallback (demo mode / local dev)
  const { loadDemoDb } = await import('./demoContent');
  const db = loadDemoDb();
  const normalized = cleanSlug.replace(/^sample-/, '');
  const found = db.properties.find(
    (p) =>
      p.publication_status === 'published' &&
      !p.is_sample &&
      p.source_name !== 'showcase_sample' &&
      (p.slug === cleanSlug || p.slug === normalized || p.id === cleanSlug)
  );
  return found || null;
}

export async function submitPropertyEnquiry(payload: {
  property_id: string;
  full_name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  const response = await fetch('/api/properties/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      success: false,
      error: data?.error || 'Unable to submit your enquiry right now.',
    };
  }

  return {
    success: true,
    message: data?.message || 'Your enquiry has been recorded.',
  };
}

// ============================================================================
// Admin CMS Operations (Protected by Supabase RLS is_admin_or_editor())
// ============================================================================

export async function getAdminProperties(): Promise<{
  properties: Property[];
  schemaPending: boolean;
}> {
  if (!isSupabaseConfigured || !supabase) {
    const { loadDemoDb } = await import('./demoContent');
    const db = loadDemoDb();
    return { properties: db.properties || [], schemaPending: false };
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*, property_images (*)')
    .order('updated_at', { ascending: false });

  if (error) {
    if (isPgrst205Error(error)) {
      return { properties: [], schemaPending: true };
    }
    // If Supabase has an error, fall back to local database
    const { loadDemoDb } = await import('./demoContent');
    const db = loadDemoDb();
    return { properties: db.properties || [], schemaPending: false };
  }

  return {
    properties: (data || []).map(normalizePropertyRow),
    schemaPending: false,
  };
}

export interface SavePropertyInput {
  id?: string;
  title: string;
  slug: string;
  transaction_type: TransactionType;
  property_type: PropertyType;
  listing_status: ListingStatus;
  publication_status: PublicationStatus;
  price: number | null;
  currency: string;
  rental_period?: RentalPeriod | null;
  available_from?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_value?: number | null;
  area_unit: AreaUnit;
  address_line?: string | null;
  city: string;
  state_region?: string | null;
  country: string;
  postal_code?: string | null;
  description: string;
  features: string[];
  is_featured: boolean;
  agent_name?: string | null;
  agent_email?: string | null;
  agent_phone?: string | null;
  brokerage_name?: string | null;
  source_name?: string;
  source_listing_id?: string | null;
  source_url?: string | null;
  raw_payload?: Record<string, any> | null;
  images?: Array<{
    image_url: string;
    alt_text?: string | null;
    is_primary: boolean;
    display_order: number;
  }>;
}

export async function saveProperty(
  input: SavePropertyInput
): Promise<{ success: boolean; property?: Property; error?: string }> {
  const affiliateValidationError = validatePropertyAffiliateRules(input);
  if (affiliateValidationError) {
    return { success: false, error: affiliateValidationError };
  }

  if (!isSupabaseConfigured || !supabase) {
    const { loadDemoDb, saveDemoDb } = await import('./demoContent');
    const db = loadDemoDb();
    const existingIdx = input.id ? db.properties.findIndex((p) => p.id === input.id) : -1;
    const propertyId = input.id || `prop-${Date.now()}`;
    const images = (input.images || []).map((img, idx) => ({
      id: `img-${Date.now()}-${idx}`,
      property_id: propertyId,
      image_url: img.image_url,
      alt_text: img.alt_text || input.title,
      display_order: idx,
      is_primary: img.is_primary,
      created_at: new Date().toISOString(),
    }));

    const savedProperty: Property = {
      id: propertyId,
      title: input.title.trim(),
      slug: input.slug.trim() || slugifyPropertyTitle(input.title),
      transaction_type: input.transaction_type,
      property_type: input.property_type,
      listing_status: input.listing_status,
      publication_status: input.publication_status,
      price: Number(input.price) || 0,
      currency: (input.currency || 'USD').trim().toUpperCase(),
      rental_period: input.transaction_type === 'rent' ? input.rental_period || 'month' : null,
      available_from: input.transaction_type === 'rent' && input.available_from ? input.available_from : null,
      bedrooms: input.bedrooms !== null && input.bedrooms !== undefined && String(input.bedrooms) !== '' ? Number(input.bedrooms) : null,
      bathrooms: input.bathrooms !== null && input.bathrooms !== undefined && String(input.bathrooms) !== '' ? Number(input.bathrooms) : null,
      area_value: input.area_value !== null && input.area_value !== undefined && String(input.area_value) !== '' ? Number(input.area_value) : null,
      area_unit: input.area_unit || 'sqft',
      address_line: input.address_line?.trim() || null,
      city: input.city.trim(),
      state_region: input.state_region?.trim() || null,
      country: input.country.trim(),
      postal_code: input.postal_code?.trim() || null,
      latitude: existingIdx >= 0 ? db.properties[existingIdx].latitude : null,
      longitude: existingIdx >= 0 ? db.properties[existingIdx].longitude : null,
      description: input.description.trim(),
      features: input.features.filter((f) => f.trim().length > 0),
      is_featured: Boolean(input.is_featured),
      agent_name: input.agent_name?.trim() || null,
      agent_email: input.agent_email?.trim() || null,
      agent_phone: input.agent_phone?.trim() || null,
      brokerage_name: input.brokerage_name?.trim() || null,
      source_name: input.source_name?.trim() || (existingIdx >= 0 ? db.properties[existingIdx].source_name : 'manual'),
      source_listing_id: input.source_listing_id?.trim() || null,
      source_url: input.source_url?.trim() || null,
      raw_payload:
        input.raw_payload !== undefined
          ? input.raw_payload
          : existingIdx >= 0
          ? db.properties[existingIdx].raw_payload || null
          : null,
      published_at: input.publication_status === 'published' ? new Date().toISOString() : null,
      created_at: existingIdx >= 0 ? db.properties[existingIdx].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_sample: input.source_name === 'showcase_sample' || (existingIdx >= 0 && Boolean(db.properties[existingIdx].is_sample)),
      images,
    };

    if (existingIdx >= 0) {
      db.properties[existingIdx] = savedProperty;
    } else {
      db.properties.unshift(savedProperty);
    }
    saveDemoDb(db);
    notifyPropertyCatalogUpdated();
    return { success: true, property: savedProperty };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isSample = input.source_name === 'showcase_sample';
  const rowPayload: Record<string, any> = {
    title: input.title.trim(),
    slug: input.slug.trim() || slugifyPropertyTitle(input.title),
    transaction_type: input.transaction_type,
    property_type: input.property_type,
    listing_status: input.listing_status,
    publication_status: input.publication_status,
    price: Number(input.price) || 0,
    currency: (input.currency || 'USD').trim().toUpperCase(),
    rental_period: input.transaction_type === 'rent' ? input.rental_period || 'month' : null,
    available_from: input.transaction_type === 'rent' && input.available_from ? input.available_from : null,
    bedrooms: input.bedrooms !== null && input.bedrooms !== undefined && String(input.bedrooms) !== '' ? Number(input.bedrooms) : null,
    bathrooms: input.bathrooms !== null && input.bathrooms !== undefined && String(input.bathrooms) !== '' ? Number(input.bathrooms) : null,
    area_value: input.area_value !== null && input.area_value !== undefined && String(input.area_value) !== '' ? Number(input.area_value) : null,
    area_unit: input.area_unit || 'sqft',
    address_line: input.address_line?.trim() || null,
    city: input.city.trim(),
    state_region: input.state_region?.trim() || null,
    country: input.country.trim(),
    postal_code: input.postal_code?.trim() || null,
    description: input.description.trim(),
    features: input.features.filter((f) => f.trim().length > 0),
    is_featured: Boolean(input.is_featured),
    agent_name: input.agent_name?.trim() || null,
    agent_email: input.agent_email?.trim() || null,
    agent_phone: input.agent_phone?.trim() || null,
    brokerage_name: input.brokerage_name?.trim() || null,
    source_name: input.source_name?.trim() || 'manual',
    source_listing_id: input.source_listing_id?.trim() || null,
    source_url: input.source_url?.trim() || null,
    published_at:
      input.publication_status === 'published' ? new Date().toISOString() : null,
  };

  if (isSample) {
    rowPayload.raw_payload = { ...(input.raw_payload || {}), is_sample: true, showcase: true };
  } else if (input.raw_payload !== undefined) {
    rowPayload.raw_payload = input.raw_payload;
  }

  let savedId = input.id;

  const formatSaveDbError = (err: any, fallback: string) => {
    const code = String(err?.code || '');
    const msg = String(err?.message || '');
    if (code === '23505' || msg.includes('duplicate key')) {
      if (msg.includes('uq_properties_source_listing')) {
        return 'A property listing with this Listing Source and External SKU already exists.';
      }
      if (msg.includes('slug')) {
        return 'A property listing with this URL slug already exists. Edit the slug and try again.';
      }
      return 'A duplicate property listing already exists.';
    }
    return msg || fallback;
  };

  if (savedId) {
    const { data, error } = await supabase
      .from('properties')
      .update(rowPayload)
      .eq('id', savedId)
      .select('*')
      .single();

    if (error || !data) {
      return { success: false, error: formatSaveDbError(error, 'Unable to update property.') };
    }
    savedId = data.id;
  } else {
    rowPayload.created_by = user?.id || null;
    const { data, error } = await supabase
      .from('properties')
      .insert(rowPayload)
      .select('*')
      .single();

    if (error || !data) {
      return { success: false, error: formatSaveDbError(error, 'Unable to create property.') };
    }
    savedId = data.id;
  }

  if (savedId && Array.isArray(input.images)) {
    const { error: delError } = await supabase
      .from('property_images')
      .delete()
      .eq('property_id', savedId);

    if (delError) {
      return { success: false, error: delError.message };
    }

    const validImages = input.images.filter((img) => img.image_url.trim().length > 0);
    if (validImages.length > 0) {
      const hasPrimary = validImages.some((img) => img.is_primary);
      const imageRows = validImages.map((img, index) => ({
        property_id: savedId,
        image_url: img.image_url.trim(),
        alt_text: img.alt_text?.trim() || input.title.trim(),
        display_order: index,
        is_primary: hasPrimary ? img.is_primary : index === 0,
      }));
      const { error: imgError } = await supabase.from('property_images').insert(imageRows);
      if (imgError) {
        return { success: false, error: imgError.message };
      }
    }
  }

  const { data: fullProperty } = await supabase
    .from('properties')
    .select('*, property_images (*)')
    .eq('id', savedId)
    .maybeSingle();

  notifyPropertyCatalogUpdated();
  return {
    success: true,
    property: fullProperty ? normalizePropertyRow(fullProperty) : undefined,
  };
}

export async function deleteProperty(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    const { loadDemoDb, saveDemoDb } = await import('./demoContent');
    const db = loadDemoDb();
    db.properties = (db.properties || []).filter((p) => p.id !== id);
    saveDemoDb(db);
    notifyPropertyCatalogUpdated();
    return { success: true };
  }
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) {
    return { success: false, error: error.message };
  }
  notifyPropertyCatalogUpdated();
  return { success: true };
}

export async function uploadPropertyImage(
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    // Generate browser object URL in local demo mode
    const localUrl = URL.createObjectURL(file);
    return { success: true, url: localUrl };
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
  const storagePath = `properties/${Date.now()}-${cleanName}`;

  const { error: uploadError } = await supabase.storage
    .from('property-media')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data: publicUrlData } = supabase.storage
    .from('property-media')
    .getPublicUrl(storagePath);

  return {
    success: true,
    url: publicUrlData.publicUrl,
  };
}

export async function getAdminEnquiries(): Promise<{
  enquiries: PropertyEnquiry[];
  schemaPending: boolean;
}> {
  if (!isSupabaseConfigured || !supabase) {
    const { loadDemoDb } = await import('./demoContent');
    const db = loadDemoDb();
    return { enquiries: db.propertyEnquiries || [], schemaPending: false };
  }

  const { data, error } = await supabase
    .from('property_enquiries')
    .select('*, properties (id, title, slug, transaction_type, city, country)')
    .order('created_at', { ascending: false });

  if (error) {
    if (isPgrst205Error(error)) {
      return { enquiries: [], schemaPending: true };
    }
    const { loadDemoDb } = await import('./demoContent');
    const db = loadDemoDb();
    return { enquiries: db.propertyEnquiries || [], schemaPending: false };
  }

  const enquiries: PropertyEnquiry[] = (data || []).map((row: any) => ({
    id: row.id,
    property_id: row.property_id,
    property: row.properties || null,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone || null,
    message: row.message,
    status: row.status,
    admin_notes: row.admin_notes || '',
    created_at: row.created_at,
    updated_at: row.updated_at || undefined,
  }));

  return { enquiries, schemaPending: false };
}

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus,
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    const { loadDemoDb, saveDemoDb } = await import('./demoContent');
    const db = loadDemoDb();
    const idx = (db.propertyEnquiries || []).findIndex((e) => e.id === id);
    if (idx >= 0) {
      db.propertyEnquiries[idx].status = status;
      if (adminNotes !== undefined) {
        db.propertyEnquiries[idx].admin_notes = adminNotes;
      }
      saveDemoDb(db);
    }
    return { success: true };
  }

  const updateData: Record<string, any> = { status };
  if (adminNotes !== undefined) {
    updateData.admin_notes = adminNotes;
  }

  const { error } = await supabase.from('property_enquiries').update(updateData).eq('id', id);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deletePropertyEnquiry(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    const { loadDemoDb, saveDemoDb } = await import('./demoContent');
    const db = loadDemoDb();
    db.propertyEnquiries = (db.propertyEnquiries || []).filter((e) => e.id !== id);
    saveDemoDb(db);
    return { success: true };
  }
  const { error } = await supabase.from('property_enquiries').delete().eq('id', id);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
