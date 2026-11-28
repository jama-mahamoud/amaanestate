import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit3,
  ExternalLink,
  ImageOff,
  ImagePlus,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import {
  AreaUnit,
  ListingStatus,
  Property,
  PropertyType,
  PublicationStatus,
  RentalPeriod,
  TransactionType,
} from '../../types';
import {
  HOUSINGANYWHERE_SOURCE_NAME,
  SavePropertyInput,
  deleteProperty,
  formatListingSourceLabel,
  formatListingStatusLabel,
  formatPropertyLocation,
  formatPropertyPrice,
  formatPropertyTypeLabel,
  isHousingAnywhereSource,
  isPartnerListing,
  isValidExternalPropertyUrl,
  lookupImpactPropertyDetails,
  saveProperty,
  slugifyPropertyTitle,
  uploadPropertyImage,
  validatePropertyAffiliateRules,
} from '../../services/propertyService';
import {
  AuthorizedImpactLookupResponse,
  FieldProvenanceMap,
  HousingAnywhereParseResult,
  TrackedPropertyField,
  extractOriginalUrlFromImpactUrl,
  parseImpactCreativeHtml,
  validateSafeHttpUrl,
} from '../../lib/housingAnywhereImport';
import HousingAnywhereImportPanel from './HousingAnywhereImportPanel';
import PropertyEditorReviewPanel from './PropertyEditorReviewPanel';
import { toast } from 'sonner';

interface AdminPropertiesSectionProps {
  properties: Property[];
  schemaPending: boolean;
  onRefresh: () => Promise<void>;
}

type EditorImageItem = {
  image_url: string;
  alt_text?: string | null;
  is_primary: boolean;
  display_order: number;
  source?: 'impact_html' | 'authorized_api' | 'upload' | 'manual';
};

interface EditorFormState extends Omit<SavePropertyInput, 'images'> {
  images: EditorImageItem[];
}

const EMPTY_FORM: EditorFormState = {
  title: '',
  slug: '',
  transaction_type: 'sale',
  property_type: 'house',
  listing_status: 'available',
  publication_status: 'draft',
  price: 0,
  currency: 'USD',
  rental_period: 'month',
  available_from: '',
  bedrooms: null,
  bathrooms: null,
  area_value: null,
  area_unit: 'sqft',
  address_line: '',
  city: '',
  state_region: '',
  country: '',
  postal_code: '',
  description: '',
  features: [],
  is_featured: false,
  agent_name: '',
  agent_email: '',
  agent_phone: '',
  brokerage_name: '',
  source_name: 'manual',
  source_listing_id: '',
  source_url: '',
  raw_payload: null,
  images: [],
};

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  badge?: string;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  subtitle,
  open,
  onToggle,
  badge,
  children,
}: CollapsibleSectionProps) {
  return (
    <section className="border border-[#E5E0D8] rounded-md bg-white overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full px-4 sm:px-5 py-3.5 bg-[#FAF8F5] hover:bg-[#F3EFE8] flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-serif font-semibold text-[#141413]">{title}</h3>
            {badge && (
              <span className="text-[11px] font-medium text-[#8C4A27]">{badge}</span>
            )}
          </div>
          {subtitle && <p className="text-[11px] text-[#5C5A55] mt-0.5">{subtitle}</p>}
        </div>
        {open ? (
          <ChevronUp size={16} className="text-[#5C5A55] shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-[#5C5A55] shrink-0" />
        )}
      </button>
      {open && <div className="p-4 sm:p-5 border-t border-[#E5E0D8] space-y-4">{children}</div>}
    </section>
  );
}

const IMAGE_SOURCE_LABELS: Record<NonNullable<EditorImageItem['source']>, string> = {
  impact_html: 'Impact HTML',
  authorized_api: 'Authorized API',
  upload: 'property-media',
  manual: 'Manual URL',
};

export default function AdminPropertiesSection({
  properties,
  schemaPending,
  onRefresh,
}: AdminPropertiesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [txFilter, setTxFilter] = useState<'all' | 'sale' | 'rent'>('all');
  const [pubFilter, setPubFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');

  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<EditorFormState>(EMPTY_FORM);
  const [featuresText, setFeaturesText] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageUrlError, setImageUrlError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // HousingAnywhere Impact Import & Provenance State
  const [impactHtmlInput, setImpactHtmlInput] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<HousingAnywhereParseResult | null>(null);
  const [apiLookup, setApiLookup] = useState<AuthorizedImpactLookupResponse | null>(null);
  const [originalListingUrl, setOriginalListingUrl] = useState<string | null>(null);
  const [suggestedLocationTitle, setSuggestedLocationTitle] = useState<string | null>(null);
  const [provenance, setProvenance] = useState<FieldProvenanceMap>({});
  const [reviewConfirmed, setReviewConfirmed] = useState(true);

  // Collapsible Editor Sections State
  const [openSections, setOpenSections] = useState({
    importer: true,
    core: true,
    pricing: true,
    location: true,
    description: true,
    source: true,
    photos: true,
    review: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const duplicateSkuMatch = useMemo(() => {
    const sku = (parseResult?.sku || form.source_listing_id || '').trim();
    if (!sku || !isHousingAnywhereSource(form.source_name || parseResult?.success ? HOUSINGANYWHERE_SOURCE_NAME : '')) {
      return null;
    }
    return (
      properties.find(
        (p) =>
          p.id !== form.id &&
          isHousingAnywhereSource(p.source_name) &&
          (p.source_listing_id || '').trim().toLowerCase() === sku.toLowerCase()
      ) || null
    );
  }, [parseResult?.sku, parseResult?.success, form.source_listing_id, form.source_name, form.id, properties]);

  if (schemaPending) {
    return (
      <div className="bg-white border border-[#E5E0D8] rounded p-8 space-y-4">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
          Database Migration Required
        </p>
        <h2 className="text-xl font-serif font-semibold text-[#141413]">
          Property Marketplace Tables Not Found
        </h2>
        <p className="text-sm text-[#4A4843] max-w-2xl leading-relaxed">
          Run the SQL migration file{' '}
          <code className="font-mono bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E5E0D8]">
            supabase/migrations/20261111143000_create_property_marketplace.sql
          </code>{' '}
          in your Supabase Dashboard SQL Editor to enable property listings, storage, and enquiry management.
        </p>
        <p className="text-xs text-[#5C5A55]">
          See <code className="font-mono">docs/PROPERTY_MARKETPLACE_SETUP.md</code> for verification queries.
        </p>
      </div>
    );
  }

  const filtered = properties.filter((prop) => {
    if (txFilter !== 'all' && prop.transaction_type !== txFilter) return false;
    if (pubFilter !== 'all' && prop.publication_status !== pubFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        prop.title.toLowerCase().includes(q) ||
        prop.city.toLowerCase().includes(q) ||
        prop.country.toLowerCase().includes(q) ||
        (prop.source_listing_id || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const markManualField = (field: TrackedPropertyField) => {
    setProvenance((prev) => ({
      ...prev,
      [field]: 'manual',
    }));
  };

  const resetImporterState = () => {
    setImpactHtmlInput('');
    setImportError(null);
    setParseResult(null);
    setApiLookup(null);
    setSuggestedLocationTitle(null);
  };

  const openCreateModal = () => {
    setForm({ ...EMPTY_FORM, images: [] });
    setFeaturesText('');
    setNewImageUrl('');
    setImageUrlError(null);
    setUploadError(null);
    setBrokenImages({});
    resetImporterState();
    setOriginalListingUrl(null);
    setProvenance({});
    setReviewConfirmed(true);
    setOpenSections({
      importer: true,
      core: true,
      pricing: true,
      location: true,
      description: true,
      source: true,
      photos: true,
      review: true,
    });
    setEditorOpen(true);
  };

  const openEditModal = (prop: Property) => {
    const rawPayload =
      prop.raw_payload && typeof prop.raw_payload === 'object' ? prop.raw_payload : null;
    const isHA = isHousingAnywhereSource(prop.source_name);
    const derivedOriginalUrl =
      (typeof rawPayload?.original_listing_url === 'string' && rawPayload.original_listing_url) ||
      extractOriginalUrlFromImpactUrl(prop.source_url) ||
      null;
    const restoredPrice =
      isHA && Number(prop.price) === 0 && rawPayload?.price_unverified === true
        ? null
        : prop.price;

    setForm({
      id: prop.id,
      title: prop.title,
      slug: prop.slug,
      transaction_type: isHA ? 'rent' : prop.transaction_type,
      property_type: prop.property_type,
      listing_status: prop.listing_status,
      publication_status: prop.publication_status,
      price: restoredPrice,
      currency: prop.currency || 'USD',
      rental_period: prop.rental_period || 'month',
      available_from: prop.available_from || '',
      bedrooms: prop.bedrooms ?? null,
      bathrooms: prop.bathrooms ?? null,
      area_value: prop.area_value ?? null,
      area_unit: prop.area_unit || 'sqft',
      address_line: prop.address_line || '',
      city: prop.city,
      state_region: prop.state_region || '',
      country: prop.country,
      postal_code: prop.postal_code || '',
      description: prop.description || '',
      features: prop.features || [],
      is_featured: prop.is_featured,
      agent_name: prop.agent_name || '',
      agent_email: prop.agent_email || '',
      agent_phone: prop.agent_phone || '',
      brokerage_name: prop.brokerage_name || '',
      source_name: prop.source_name || 'manual',
      source_listing_id: prop.source_listing_id || '',
      source_url: prop.source_url || '',
      raw_payload: rawPayload,
      images: (prop.images || []).map((img, idx) => ({
        image_url: img.image_url,
        alt_text: img.alt_text || '',
        is_primary: img.is_primary,
        display_order: idx,
        source:
          isHA && img.image_url.includes('housinganywhere')
            ? 'impact_html'
            : img.image_url.includes('property-media')
            ? 'upload'
            : 'manual',
      })),
    });

    setFeaturesText((prop.features || []).join('\n'));
    setNewImageUrl('');
    setImageUrlError(null);
    setUploadError(null);
    setBrokenImages({});
    resetImporterState();
    setOriginalListingUrl(derivedOriginalUrl);
    setProvenance(
      rawPayload?.field_provenance && typeof rawPayload.field_provenance === 'object'
        ? (rawPayload.field_provenance as FieldProvenanceMap)
        : {}
    );
    setReviewConfirmed(true);
    setOpenSections({
      importer: isHA,
      core: true,
      pricing: true,
      location: true,
      description: true,
      source: true,
      photos: true,
      review: isHA,
    });
    setEditorOpen(true);
  };

  const handleCopyUrl = async (url: string, label: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success(`${label} copied to clipboard.`);
      }
    } catch {
      toast.error(`Unable to copy ${label}.`);
    }
  };

  const handleRunImpactImport = async () => {
    setImportError(null);
    const parsed = parseImpactCreativeHtml(impactHtmlInput);
    if (!parsed.success) {
      setParseResult(null);
      setApiLookup(null);
      setImportError(parsed.error || 'Unable to parse pasted HTML creative.');
      return;
    }

    setParseResult(parsed);
    setImporting(true);

    let lookupResult: AuthorizedImpactLookupResponse | null = null;
    if (parsed.sku) {
      lookupResult = await lookupImpactPropertyDetails({
        sku: parsed.sku,
        originalUrl: parsed.originalListingUrl,
        impactUrl: parsed.impactTrackingUrl,
      });
    } else {
      lookupResult = {
        authorizedSourceAvailable: false,
        sourceName: 'Impact Partner Catalog API',
        reason: 'No SKU was detected in the pasted HTML creative to query the catalog.',
        matched: false,
        data: null,
      };
    }

    setImporting(false);
    setApiLookup(lookupResult);

    const apiData = lookupResult?.matched && lookupResult.data ? lookupResult.data : null;
    const nextProvenance: FieldProvenanceMap = { ...parsed.provenance };

    // Merge verified API fields if available, preferring verified API data for missing fields
    const nextTitle = apiData?.title || parsed.title || '';
    if (apiData?.title) nextProvenance.title = 'authorized_api';

    const nextDescription = apiData?.description || '';
    if (apiData?.description) nextProvenance.description = 'authorized_api';

    const nextPrice =
      apiData?.price !== undefined && apiData?.price !== null && apiData.price > 0
        ? apiData.price
        : null;
    if (nextPrice !== null) nextProvenance.price = 'authorized_api';

    const nextCurrency = apiData?.currency || parsed.currency || 'EUR';
    if (apiData?.currency) nextProvenance.currency = 'authorized_api';

    const nextCity = apiData?.city || parsed.city || '';
    if (apiData?.city) nextProvenance.city = 'authorized_api';

    const nextCountry = apiData?.country || parsed.country || '';
    if (apiData?.country) nextProvenance.country = 'authorized_api';

    const nextAddressLine = apiData?.address_line || parsed.addressLine || '';
    if (apiData?.address_line) nextProvenance.address_line = 'authorized_api';

    const nextStateRegion = apiData?.state_region || '';
    if (apiData?.state_region) nextProvenance.state_region = 'authorized_api';

    const nextPostalCode = apiData?.postal_code || '';
    if (apiData?.postal_code) nextProvenance.postal_code = 'authorized_api';

    const nextPropertyType: PropertyType = apiData?.property_type || parsed.propertyType || 'other';
    if (apiData?.property_type) nextProvenance.property_type = 'authorized_api';

    const nextBedrooms = apiData?.bedrooms ?? null;
    if (nextBedrooms !== null) nextProvenance.bedrooms = 'authorized_api';

    const nextBathrooms = apiData?.bathrooms ?? null;
    if (nextBathrooms !== null) nextProvenance.bathrooms = 'authorized_api';

    const nextAreaValue = apiData?.area_value ?? null;
    if (nextAreaValue !== null) nextProvenance.area_value = 'authorized_api';

    const nextAreaUnit: AreaUnit = apiData?.area_unit || 'sqm';

    const nextFeatures = Array.isArray(apiData?.features) ? apiData.features : [];
    if (nextFeatures.length > 0) nextProvenance.features = 'authorized_api';

    // Combine extracted HTML images + any additional authorized API images without duplicating URLs
    const combinedImages: EditorImageItem[] = [];
    const seenUrls = new Set<string>();
    for (const img of parsed.images) {
      if (seenUrls.has(img.image_url)) continue;
      seenUrls.add(img.image_url);
      combinedImages.push({
        image_url: img.image_url,
        alt_text: img.alt_text,
        is_primary: combinedImages.length === 0,
        display_order: combinedImages.length,
        source: 'impact_html',
      });
    }
    if (apiData?.images) {
      for (const img of apiData.images) {
        if (seenUrls.has(img.image_url)) continue;
        seenUrls.add(img.image_url);
        combinedImages.push({
          image_url: img.image_url,
          alt_text: img.alt_text,
          is_primary: combinedImages.length === 0,
          display_order: combinedImages.length,
          source: 'authorized_api',
        });
      }
      if (apiData.images.length > 0 && parsed.images.length === 0) {
        nextProvenance.images = 'authorized_api';
      }
    }

    const generatedSlug = nextTitle
      ? slugifyPropertyTitle(nextTitle)
      : parsed.suggestedLocationTitle && parsed.sku
      ? slugifyPropertyTitle(`${parsed.suggestedLocationTitle}-${parsed.sku}`)
      : parsed.sku
      ? `housinganywhere-${parsed.sku}`
      : '';

    setForm((prev) => ({
      ...prev,
      title: nextTitle,
      slug: prev.id && prev.slug ? prev.slug : generatedSlug,
      transaction_type: 'rent',
      rental_period: prev.rental_period || 'month',
      property_type: nextPropertyType,
      publication_status: prev.id ? prev.publication_status : 'draft',
      price: nextPrice,
      currency: nextCurrency,
      city: nextCity,
      country: nextCountry,
      state_region: nextStateRegion,
      address_line: nextAddressLine,
      postal_code: nextPostalCode,
      bedrooms: nextBedrooms,
      bathrooms: nextBathrooms,
      area_value: nextAreaValue,
      area_unit: nextAreaUnit,
      description: nextDescription,
      features: nextFeatures,
      source_name: HOUSINGANYWHERE_SOURCE_NAME,
      source_listing_id: parsed.sku || '',
      source_url: parsed.impactTrackingUrl || '',
      images: combinedImages,
    }));

    setFeaturesText(nextFeatures.join('\n'));
    setOriginalListingUrl(parsed.originalListingUrl);
    setSuggestedLocationTitle(parsed.suggestedLocationTitle);
    setProvenance(nextProvenance);
    setBrokenImages({});
    setReviewConfirmed(false);
    setOpenSections({
      importer: true,
      core: true,
      pricing: true,
      location: true,
      description: true,
      source: true,
      photos: true,
      review: true,
    });

    toast.success(
      apiData
        ? 'Impact creative parsed and enriched from authorized catalog.'
        : 'Impact creative parsed. Review missing fields before saving as Draft.'
    );
  };

  const handleClearImporter = () => {
    resetImporterState();
    if (!form.id) {
      setForm({ ...EMPTY_FORM, images: [] });
      setFeaturesText('');
      setOriginalListingUrl(null);
      setProvenance({});
      setReviewConfirmed(true);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadingImage(true);
    const res = await uploadPropertyImage(file);
    setUploadingImage(false);
    e.target.value = '';

    if (!res.success || !res.url) {
      const msg = res.error || 'Image upload to property-media failed.';
      setUploadError(msg);
      toast.error(msg);
      return;
    }

    setForm((prev) => {
      const existing = prev.images || [];
      return {
        ...prev,
        images: [
          ...existing,
          {
            image_url: res.url!,
            alt_text: prev.title || file.name,
            is_primary: existing.length === 0,
            display_order: existing.length,
            source: 'upload',
          },
        ],
      };
    });
    markManualField('images');
    toast.success('Image uploaded to property-media.');
  };

  const handleAddImageUrl = () => {
    setImageUrlError(null);
    const check = validateSafeHttpUrl(newImageUrl, { allowRelativeImagePath: false });
    if (!check.valid || !check.normalized) {
      setImageUrlError(check.error || 'Enter a valid https:// image URL.');
      return;
    }

    const cleanUrl = check.normalized;
    if ((form.images || []).some((img) => img.image_url === cleanUrl)) {
      setImageUrlError('This image URL is already in the gallery.');
      return;
    }

    setForm((prev) => {
      const existing = prev.images || [];
      return {
        ...prev,
        images: [
          ...existing,
          {
            image_url: cleanUrl,
            alt_text: prev.title || '',
            is_primary: existing.length === 0,
            display_order: existing.length,
            source: 'manual',
          },
        ],
      };
    });
    markManualField('images');
    setNewImageUrl('');
  };

  const moveImage = (idx: number, direction: -1 | 1) => {
    setForm((prev) => {
      const next = [...(prev.images || [])];
      const target = idx + direction;
      if (target < 0 || target >= next.length) return prev;
      const temp = next[idx];
      next[idx] = next[target];
      next[target] = temp;
      return {
        ...prev,
        images: next.map((item, i) => ({ ...item, display_order: i })),
      };
    });
    markManualField('images');
  };

  const executeSave = async (targetPublicationStatus: PublicationStatus) => {
    if (!form.title.trim() || !form.city.trim() || !form.country.trim()) {
      toast.error('Property Title, City, and Country are required.');
      return;
    }

    const isHA = isHousingAnywhereSource(form.source_name);
    const effectiveTransactionType: TransactionType = isHA ? 'rent' : form.transaction_type;

    if (isHA && !reviewConfirmed) {
      toast.error(
        'Please review the listing summary and check the review confirmation box before saving.'
      );
      setOpenSections((prev) => ({ ...prev, review: true }));
      return;
    }

    if (!isHA && (form.price === null || Number(form.price) < 0)) {
      toast.error('Please enter a valid non-negative price.');
      return;
    }

    const affiliateError = validatePropertyAffiliateRules({
      source_name: form.source_name,
      transaction_type: effectiveTransactionType,
      publication_status: targetPublicationStatus,
      source_url: form.source_url,
      title: form.title,
      city: form.city,
      country: form.country,
      price: form.price,
    });
    if (affiliateError) {
      toast.error(affiliateError);
      return;
    }

    const parsedFeatures = featuresText
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);

    const priceUnverified = isHA && (form.price === null || Number(form.price) <= 0);
    const nextRawPayload = isHA
      ? {
          ...(form.raw_payload || {}),
          import_source: 'housinganywhere_impact',
          original_listing_url:
            originalListingUrl || extractOriginalUrlFromImpactUrl(form.source_url) || null,
          field_provenance: provenance,
          price_unverified: priceUnverified,
          updated_via: 'property_editor',
        }
      : form.raw_payload ?? undefined;

    setSaving(true);
    const result = await saveProperty({
      ...form,
      publication_status: targetPublicationStatus,
      transaction_type: effectiveTransactionType,
      price: form.price === null ? 0 : Number(form.price) || 0,
      rental_period:
        effectiveTransactionType === 'rent' ? form.rental_period || 'month' : form.rental_period,
      slug: form.slug.trim() || slugifyPropertyTitle(form.title),
      features: parsedFeatures,
      raw_payload: nextRawPayload,
      images: (form.images || []).map((img, idx) => ({
        image_url: img.image_url,
        alt_text: img.alt_text || '',
        is_primary: img.is_primary,
        display_order: idx,
      })),
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error || 'Unable to save property listing.');
      return;
    }

    toast.success(
      targetPublicationStatus === 'draft'
        ? form.id
          ? 'Draft property listing updated.'
          : 'Property saved as Draft.'
        : form.id
        ? 'Property listing updated.'
        : 'Property listing created.'
    );
    setEditorOpen(false);
    await onRefresh();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSave(form.publication_status);
  };

  const handleDelete = async (prop: Property) => {
    const res = await deleteProperty(prop.id);
    if (!res.success) {
      toast.error(res.error || 'Unable to delete property.');
      return;
    }
    toast.success(`Deleted "${prop.title}".`);
    await onRefresh();
  };

  const isHA = isHousingAnywhereSource(form.source_name);
  const parsedFeaturesList = featuresText
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E0D8] rounded p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
            Property Marketplace CMS
          </p>
          <h1 className="text-2xl font-serif font-semibold text-[#141413]">
            Manage Property Listings ({properties.length})
          </h1>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#142944] text-white text-xs font-semibold rounded inline-flex items-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Property Listing</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E5E0D8] rounded p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7770]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, city, country, or listing ID..."
            className="w-full h-10 pl-9 pr-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
          />
        </div>
        <select
          value={txFilter}
          onChange={(e) => setTxFilter(e.target.value as 'all' | 'sale' | 'rent')}
          className="h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
        >
          <option value="all">All Transactions</option>
          <option value="sale">For Sale (Buy)</option>
          <option value="rent">For Rent</option>
        </select>
        <select
          value={pubFilter}
          onChange={(e) =>
            setPubFilter(e.target.value as 'all' | 'draft' | 'published' | 'archived')
          }
          className="h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
        >
          <option value="all">All Publication Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Building2 size={28} className="mx-auto text-[#8C4A27]" strokeWidth={1.5} />
            <p className="text-sm text-[#5C5A55]">
              {properties.length === 0
                ? 'No properties stored in Supabase yet.'
                : 'No properties match your active admin filters.'}
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded cursor-pointer"
            >
              Add First Property
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[11px] uppercase tracking-wider text-[#5C5A55]">
                  <th className="py-3 px-4 font-semibold">Property</th>
                  <th className="py-3 px-4 font-semibold">Mode / Type</th>
                  <th className="py-3 px-4 font-semibold">Price</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Source</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8]">
                {filtered.map((prop) => (
                  <tr key={prop.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-[#141413] flex items-center gap-1.5">
                        {prop.is_featured && (
                          <Star size={13} className="text-[#8C4A27] fill-[#8C4A27] shrink-0" />
                        )}
                        <span className="truncate">{prop.title}</span>
                      </div>
                      <div className="text-xs text-[#5C5A55] truncate">
                        {formatPropertyLocation(prop)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#4A4843]">
                      <div className="font-semibold uppercase text-[#8C4A27]">
                        {prop.transaction_type === 'rent' ? 'Rent' : 'Buy / Sale'}
                      </div>
                      <div>{formatPropertyTypeLabel(prop.property_type)}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-[#141413]">
                      {prop.raw_payload?.price_unverified && Number(prop.price) === 0
                        ? 'Unverified'
                        : formatPropertyPrice(
                            prop.price,
                            prop.currency,
                            prop.transaction_type,
                            prop.rental_period
                          )}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-semibold capitalize text-[#141413]">
                        {prop.publication_status}
                      </div>
                      <div className="text-[#5C5A55]">
                        {formatListingStatusLabel(prop.listing_status)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#5C5A55]">
                      {prop.source_name === 'showcase_sample' || prop.is_sample ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          Showcase Sample
                        </span>
                      ) : isPartnerListing(prop) ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EFF4FA] text-[#1E3A5F] border border-[#C7D6E8]">
                            Partner Listing
                          </span>
                          <div className="text-[11px] font-medium text-[#4A4843]">
                            {formatListingSourceLabel(prop.source_name)}
                          </div>
                          {prop.source_listing_id && (
                            <div className="text-[10px] font-mono text-[#7A7770]">
                              SKU: {prop.source_listing_id}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono">{prop.source_name}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {prop.publication_status === 'published' && (
                          <a
                            href={`/properties/${encodeURIComponent(prop.slug)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-[#5C5A55] hover:text-[#1E3A5F]"
                            title="View public listing"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditModal(prop)}
                          className="p-1.5 text-[#1E3A5F] hover:text-[#141413] cursor-pointer"
                          title="Edit listing"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(prop)}
                          className="p-1.5 text-[#991B1B] hover:text-[#7F1D1D] cursor-pointer"
                          title="Delete listing"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Property Modal */}
      {editorOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={form.id ? 'Edit Property Listing' : 'Create Property Listing'}
        >
          <div className="bg-white border border-[#E5E0D8] rounded w-full max-w-5xl max-h-[92vh] overflow-y-auto p-5 sm:p-8 space-y-6 my-4">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
                    Property Editor
                  </p>
                  {isHA && (
                    <>
                      <span aria-hidden="true" className="text-[#9E988E]">
                        &middot;
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#EFF4FA] text-[#1E3A5F] border border-[#C7D6E8]">
                        Partner Listing
                      </span>
                    </>
                  )}
                </div>
                <h2 className="text-xl font-serif font-semibold text-[#141413]">
                  {form.id ? 'Edit Property Listing' : 'Create Property Listing'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                aria-label="Close property editor"
                className="p-2 text-[#5C5A55] hover:text-[#141413] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* TOP SECTION: HousingAnywhere (Impact) Auto-Import */}
            <CollapsibleSection
              title="Import Property from HousingAnywhere (Impact)"
              subtitle="One-paste HTML creative extraction & authorized catalog completion"
              badge={parseResult?.sku ? `SKU ${parseResult.sku}` : undefined}
              open={openSections.importer}
              onToggle={() => toggleSection('importer')}
            >
              <HousingAnywhereImportPanel
                htmlInput={impactHtmlInput}
                onHtmlInputChange={setImpactHtmlInput}
                onImport={handleRunImpactImport}
                onClear={handleClearImporter}
                importing={importing}
                importError={importError}
                parseResult={parseResult}
                apiLookup={apiLookup}
                duplicateMatch={duplicateSkuMatch}
                onOpenDuplicate={openEditModal}
                onCopyUrl={handleCopyUrl}
              />
            </CollapsibleSection>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* 1. Core Listing Details */}
              <CollapsibleSection
                title="1. Core Listing Details"
                subtitle="Title, URL slug, transaction mode, property category, and workflow status"
                open={openSections.core}
                onToggle={() => toggleSection('core')}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="prop-title"
                      className="block text-xs font-semibold text-[#4A4843] mb-1"
                    >
                      Property Title *
                    </label>
                    <input
                      id="prop-title"
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        markManualField('title');
                        setForm((prev) => ({
                          ...prev,
                          title: val,
                          slug: prev.id ? prev.slug : slugifyPropertyTitle(val),
                        }));
                      }}
                      placeholder={
                        isHA
                          ? 'Enter verified property title (not included in HTML creative)...'
                          : 'e.g. Modern Residence in Paris 17th'
                      }
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                    />
                    {!form.title.trim() && suggestedLocationTitle && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-[#5C5A55]">
                        <span>Title was absent from the HTML creative.</span>
                        <button
                          type="button"
                          onClick={() => {
                            markManualField('title');
                            setForm((prev) => ({
                              ...prev,
                              title: suggestedLocationTitle,
                              slug: prev.id
                                ? prev.slug
                                : slugifyPropertyTitle(
                                    prev.source_listing_id
                                      ? `${suggestedLocationTitle}-${prev.source_listing_id}`
                                      : suggestedLocationTitle
                                  ),
                            }));
                          }}
                          className="font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
                        >
                          Use URL location (&ldquo;{suggestedLocationTitle}&rdquo;)
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="prop-slug"
                        className="block text-xs font-semibold text-[#4A4843]"
                      >
                        Slug *
                      </label>
                      {form.title.trim() && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              slug: slugifyPropertyTitle(prev.title),
                            }))
                          }
                          className="text-[11px] font-medium text-[#1E3A5F] hover:underline cursor-pointer"
                        >
                          Regenerate from title
                        </button>
                      )}
                    </div>
                    <input
                      id="prop-slug"
                      type="text"
                      required
                      value={form.slug}
                      onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="prop-tx-type"
                      className="block text-xs font-semibold text-[#4A4843] mb-1"
                    >
                      Transaction Type *
                    </label>
                    <select
                      id="prop-tx-type"
                      value={isHA ? 'rent' : form.transaction_type}
                      disabled={isHA}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          transaction_type: e.target.value as TransactionType,
                        }))
                      }
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm disabled:bg-[#F3EFE8] disabled:text-[#4A4843] disabled:cursor-not-allowed"
                    >
                      <option value="sale">For Sale (Buy)</option>
                      <option value="rent">For Rent</option>
                    </select>
                    {isHA && (
                      <p className="mt-1 text-[11px] text-[#8C4A27] font-medium">
                        HousingAnywhere affiliate listings automatically use For Rent.
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="prop-type"
                      className="block text-xs font-semibold text-[#4A4843] mb-1"
                    >
                      Property Type
                    </label>
                    <select
                      id="prop-type"
                      value={form.property_type}
                      onChange={(e) => {
                        markManualField('property_type');
                        setForm((prev) => ({
                          ...prev,
                          property_type: e.target.value as PropertyType,
                        }));
                      }}
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                    >
                      <option value="house">House</option>
                      <option value="apartment">Apartment</option>
                      <option value="villa">Villa</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="condominium">Condominium</option>
                      <option value="land">Land</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="prop-listing-status"
                      className="block text-xs font-semibold text-[#4A4843] mb-1"
                    >
                      Listing Status
                    </label>
                    <select
                      id="prop-listing-status"
                      value={form.listing_status}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          listing_status: e.target.value as ListingStatus,
                        }))
                      }
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                    >
                      <option value="available">Available</option>
                      <option value="pending">Pending</option>
                      <option value="under_contract">Under Contract</option>
                      <option value="sold">Sold</option>
                      <option value="rented">Rented</option>
                      <option value="off_market">Off Market</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="prop-pub-status"
                      className="block text-xs font-semibold text-[#4A4843] mb-1"
                    >
                      Publication Status
                    </label>
                    <select
                      id="prop-pub-status"
                      value={form.publication_status}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          publication_status: e.target.value as PublicationStatus,
                        }))
                      }
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      id="prop-featured"
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, is_featured: e.target.checked }))
                      }
                      className="w-4 h-4"
                    />
                    <label htmlFor="prop-featured" className="text-xs font-semibold text-[#141413]">
                      Featured on Homepage
                    </label>
                  </div>
                </div>
              </CollapsibleSection>

              {/* 2. Pricing & Availability */}
              <CollapsibleSection
                title="2. Pricing & Availability"
                subtitle="Verified price, currency, and rental schedule"
                badge={
                  form.price === null || Number(form.price) <= 0
                    ? 'Price Unverified'
                    : `${form.currency || 'USD'} ${Number(form.price).toLocaleString()}`
                }
                open={openSections.pricing}
                onToggle={() => toggleSection('pricing')}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="prop-price"
                      className="block text-xs font-semibold text-[#4A4843] mb-1"
                    >
                      Price {form.publication_status === 'published' || !isHA ? '*' : ''}
                    </label>
                    <input
                      id="prop-price"
                      type="number"
                      min={0}
                      step="any"
                      required={!isHA || form.publication_status === 'published'}
                      value={form.price === null ? '' : form.price}
                      placeholder={isHA ? 'Enter verified monthly rent...' : '0'}
                      onChange={(e) => {
                        markManualField('price');
                        setForm((prev) => ({
                          ...prev,
                          price: e.target.value === '' ? null : Number(e.target.value),
                        }));
                      }}
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono tabular-nums"
                    />
                    {isHA && (form.price === null || Number(form.price) <= 0) && (
                      <p className="mt-1 text-[11px] text-[#8C4A27]">
                        Price cannot be read from Impact HTML. Leave blank while saving Draft, or enter verified rent before publishing.
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="prop-currency"
                      className="block text-xs font-semibold text-[#4A4843] mb-1"
                    >
                      Currency
                    </label>
                    <input
                      id="prop-currency"
                      type="text"
                      maxLength={8}
                      value={form.currency}
                      onChange={(e) => {
                        markManualField('currency');
                        setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }));
                      }}
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono"
                    />
                  </div>

                  {(form.transaction_type === 'rent' || isHA) && (
                    <>
                      <div>
                        <label
                          htmlFor="prop-rental-period"
                          className="block text-xs font-semibold text-[#4A4843] mb-1"
                        >
                          Rental Period
                        </label>
                        <select
                          id="prop-rental-period"
                          value={form.rental_period || 'month'}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              rental_period: e.target.value as RentalPeriod,
                            }))
                          }
                          className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                        >
                          <option value="month">Monthly</option>
                          <option value="year">Yearly</option>
                          <option value="week">Weekly</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="prop-available-from"
                          className="block text-xs font-semibold text-[#4A4843] mb-1"
                        >
                          Available From
                        </label>
                        <input
                          id="prop-available-from"
                          type="date"
                          value={form.available_from || ''}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, available_from: e.target.value }))
                          }
                          className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono"
                        />
                      </div>
                    </>
                  )}
                </div>
              </CollapsibleSection>

              {/* 3. Location & Specifications */}
              <CollapsibleSection
                title="3. Location & Specifications"
                subtitle="Address, city, country, rooms, and floor area"
                open={openSections.location}
                onToggle={() => toggleSection('location')}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="prop-city"
                      className="block text-xs font-semibold text-[#4A4843] mb-1"
                    >
                      City *
                    </label>
                    <input
                      id="prop-city"
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => {
                        markManualField('city');
                        setForm((prev) => ({ ...prev, city: e.target.value }));
                      }}
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="prop-country"
                      className="block text-xs font-semibold text-[#4A4843] mb-1"
                    >
                      Country *
                    </label>
                    <input
                      id="prop-country"
                      type="text"
                      required
                      value={form.country}
                      onChange={(e) => {
                        markManualField('country');
                        setForm((prev) => ({ ...prev, country: e.target.value }));
                      }}
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="prop-state-region"
                      className="block text-xs font-semibold text-[#4A4843] mb-1"
                    >
                      State / Region
                    </label>
                    <input
                      id="prop-state-region"
                      type="text"
                      value={form.state_region || ''}
                      onChange={(e) => {
                        markManualField('state_region');
                        setForm((prev) => ({ ...prev, state_region: e.target.value }));
                      }}
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="prop-address"
                      className="block text-xs font-semibold text-[#4A4843] mb-1"
                    >
                      Street Address
                    </label>
                    <input
                      id="prop-address"
                      type="text"
                      value={form.address_line || ''}
                      onChange={(e) => {
                        markManualField('address_line');
                        setForm((prev) => ({ ...prev, address_line: e.target.value }));
                      }}
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="prop-postal-code"
                      className="block text-xs font-semibold text-[#4A4843] mb-1"
                    >
                      Postal Code
                    </label>
                    <input
                      id="prop-postal-code"
                      type="text"
                      value={form.postal_code || ''}
                      onChange={(e) => {
                        markManualField('postal_code');
                        setForm((prev) => ({ ...prev, postal_code: e.target.value }));
                      }}
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                    <div>
                      <label
                        htmlFor="prop-bedrooms"
                        className="block text-xs font-semibold text-[#4A4843] mb-1"
                      >
                        Bedrooms
                      </label>
                      <input
                        id="prop-bedrooms"
                        type="number"
                        min={0}
                        value={form.bedrooms ?? ''}
                        onChange={(e) => {
                          markManualField('bedrooms');
                          setForm((prev) => ({
                            ...prev,
                            bedrooms: e.target.value === '' ? null : Number(e.target.value),
                          }));
                        }}
                        className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono tabular-nums"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="prop-bathrooms"
                        className="block text-xs font-semibold text-[#4A4843] mb-1"
                      >
                        Bathrooms
                      </label>
                      <input
                        id="prop-bathrooms"
                        type="number"
                        step="0.5"
                        min={0}
                        value={form.bathrooms ?? ''}
                        onChange={(e) => {
                          markManualField('bathrooms');
                          setForm((prev) => ({
                            ...prev,
                            bathrooms: e.target.value === '' ? null : Number(e.target.value),
                          }));
                        }}
                        className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono tabular-nums"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label
                          htmlFor="prop-area"
                          className="block text-xs font-semibold text-[#4A4843] mb-1"
                        >
                          Area
                        </label>
                        <input
                          id="prop-area"
                          type="number"
                          min={0}
                          value={form.area_value ?? ''}
                          onChange={(e) => {
                            markManualField('area_value');
                            setForm((prev) => ({
                              ...prev,
                              area_value: e.target.value === '' ? null : Number(e.target.value),
                            }));
                          }}
                          className="w-full h-10 px-2 border border-[#D6CEBE] rounded text-sm font-mono tabular-nums"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="prop-area-unit"
                          className="block text-xs font-semibold text-[#4A4843] mb-1"
                        >
                          Unit
                        </label>
                        <select
                          id="prop-area-unit"
                          value={form.area_unit}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              area_unit: e.target.value as AreaUnit,
                            }))
                          }
                          className="w-full h-10 px-2 border border-[#D6CEBE] rounded text-xs"
                        >
                          <option value="sqft">sqft</option>
                          <option value="sqm">sqm</option>
                          <option value="acres">acres</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* 4. Description & Features */}
              <CollapsibleSection
                title="4. Description & Features"
                subtitle="Property overview copy and key amenities"
                open={openSections.description}
                onToggle={() => toggleSection('description')}
              >
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="prop-description"
                      className="block text-xs font-semibold text-[#4A4843] mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="prop-description"
                      rows={4}
                      value={form.description}
                      onChange={(e) => {
                        markManualField('description');
                        setForm((prev) => ({ ...prev, description: e.target.value }));
                      }}
                      className="w-full p-3 border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="prop-features"
                      className="block text-xs font-semibold text-[#4A4843] mb-1"
                    >
                      Features (one per line or comma-separated)
                    </label>
                    <textarea
                      id="prop-features"
                      rows={2}
                      value={featuresText}
                      onChange={(e) => {
                        markManualField('features');
                        setFeaturesText(e.target.value);
                      }}
                      placeholder="Furnished, High-speed Wi-Fi, Private balcony"
                      className="w-full p-3 border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* 5. Listing Classification, Affiliate Management & Representative */}
              <CollapsibleSection
                title="5. Listing Source, Affiliate Management & Representative"
                subtitle="Classification, HousingAnywhere Impact tracking links, and agent attribution"
                badge={isHA ? 'Partner Listing' : formatListingSourceLabel(form.source_name)}
                open={openSections.source}
                onToggle={() => toggleSection('source')}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="prop-source-name"
                      className="block text-xs font-semibold text-[#4A4843] mb-1"
                    >
                      Listing Classification &amp; Source
                    </label>
                    <select
                      id="prop-source-name"
                      value={form.source_name || 'manual'}
                      onChange={(e) => {
                        const nextSource = e.target.value;
                        const nextIsHA = isHousingAnywhereSource(nextSource);
                        setForm((prev) => ({
                          ...prev,
                          source_name: nextSource,
                          transaction_type: nextIsHA ? 'rent' : prev.transaction_type,
                          rental_period: nextIsHA
                            ? prev.rental_period || 'month'
                            : prev.rental_period,
                        }));
                        if (nextIsHA) {
                          setReviewConfirmed(false);
                        }
                      }}
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm bg-white"
                    >
                      <option value="manual">Manual (Active Genuine Inventory)</option>
                      <option value="showcase_sample">
                        Showcase Sample (Illustrative Portfolio Example)
                      </option>
                      <option value="listhub">ListHub MLS Feed</option>
                      <option value="feed">Custom XML / RESO Feed</option>
                      <option value={HOUSINGANYWHERE_SOURCE_NAME}>
                        HousingAnywhere Affiliate (Impact)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="prop-agent-name"
                      className="block text-xs font-semibold text-[#4A4843] mb-1"
                    >
                      Agent Name
                    </label>
                    <input
                      id="prop-agent-name"
                      type="text"
                      value={form.agent_name || ''}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, agent_name: e.target.value }))
                      }
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="prop-brokerage-name"
                      className="block text-xs font-semibold text-[#4A4843] mb-1"
                    >
                      Brokerage Name
                    </label>
                    <input
                      id="prop-brokerage-name"
                      type="text"
                      value={form.brokerage_name || ''}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, brokerage_name: e.target.value }))
                      }
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="prop-agent-phone"
                      className="block text-xs font-semibold text-[#4A4843] mb-1"
                    >
                      Agent Phone
                    </label>
                    <input
                      id="prop-agent-phone"
                      type="text"
                      value={form.agent_phone || ''}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, agent_phone: e.target.value }))
                      }
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>

                  {isHA && (
                    <div className="sm:col-span-2 bg-[#FAF8F5] border border-[#D6CEBE] rounded p-4 sm:p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E0D8] pb-3">
                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#EFF4FA] text-[#1E3A5F] border border-[#C7D6E8]">
                              Partner Listing
                            </span>
                            <span className="text-xs font-semibold text-[#141413]">
                              HousingAnywhere Affiliate (Impact)
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5C5A55]">
                            Public &ldquo;View Property&rdquo; links open the exact Impact tracking URL in a new tab (<code className="font-mono">target=&quot;_blank&quot; rel=&quot;noopener noreferrer sponsored&quot;</code>) and hide the internal enquiry form.
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-[#8C4A27] uppercase tracking-wider">
                          Transaction: For Rent
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="prop-external-sku"
                            className="block text-xs font-semibold text-[#4A4843] mb-1"
                          >
                            External Property ID / SKU
                          </label>
                          <input
                            id="prop-external-sku"
                            type="text"
                            value={form.source_listing_id || ''}
                            onChange={(e) => {
                              markManualField('source_listing_id');
                              setForm((prev) => ({
                                ...prev,
                                source_listing_id: e.target.value,
                              }));
                            }}
                            placeholder="e.g. 1538364"
                            className="w-full h-10 px-3 bg-white border border-[#D6CEBE] rounded text-sm font-mono"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <label
                              htmlFor="prop-original-ha-url"
                              className="block text-xs font-semibold text-[#4A4843]"
                            >
                              Original HousingAnywhere URL
                            </label>
                            {originalListingUrl &&
                              validateSafeHttpUrl(originalListingUrl).valid && (
                                <a
                                  href={originalListingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] font-semibold text-[#1E3A5F] hover:underline inline-flex items-center gap-1"
                                >
                                  <span>Open</span>
                                  <ExternalLink size={11} />
                                </a>
                              )}
                          </div>
                          <input
                            id="prop-original-ha-url"
                            type="url"
                            value={originalListingUrl || ''}
                            onChange={(e) => {
                              markManualField('original_listing_url');
                              setOriginalListingUrl(e.target.value || null);
                            }}
                            placeholder="https://housinganywhere.com/room/..."
                            className="w-full h-10 px-3 bg-white border border-[#D6CEBE] rounded text-xs font-mono"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label
                              htmlFor="prop-impact-url"
                              className="block text-xs font-semibold text-[#4A4843]"
                            >
                              Impact Affiliate Tracking URL{' '}
                              {form.publication_status === 'published' && (
                                <span className="text-[#991B1B]">*</span>
                              )}
                            </label>
                            {form.source_url?.trim() && (
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopyUrl(form.source_url!, 'Impact tracking URL')
                                  }
                                  className="text-[11px] font-semibold text-[#1E3A5F] hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Copy size={11} />
                                  <span>Copy Exact URL</span>
                                </button>
                                {isValidExternalPropertyUrl(form.source_url) && (
                                  <a
                                    href={form.source_url.trim()}
                                    target="_blank"
                                    rel="noopener noreferrer sponsored"
                                    className="text-[11px] font-semibold text-[#1E3A5F] hover:underline inline-flex items-center gap-1"
                                  >
                                    <span>Test Sponsored Link</span>
                                    <ExternalLink size={11} />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                          <textarea
                            id="prop-impact-url"
                            rows={3}
                            required={form.publication_status === 'published'}
                            value={form.source_url || ''}
                            onChange={(e) => {
                              const nextUrl = e.target.value;
                              markManualField('source_url');
                              setForm((prev) => ({
                                ...prev,
                                source_url: nextUrl,
                              }));
                              const decoded = extractOriginalUrlFromImpactUrl(nextUrl);
                              if (decoded) {
                                setOriginalListingUrl(decoded);
                              }
                            }}
                            placeholder="https://housinganywhere.pxf.io/c/..."
                            className="w-full p-3 bg-white border border-[#D6CEBE] rounded text-xs font-mono break-all leading-relaxed"
                          />
                          <p className="text-[11px] text-[#5C5A55]">
                            Required before publishing. Exact URL and every Impact tracking parameter (<code className="font-mono">prodsku</code>, <code className="font-mono">u</code>, <code className="font-mono">intsrc</code>) are preserved verbatim.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleSection>

              {/* 6. Property Photos */}
              <CollapsibleSection
                title="6. Property Photos"
                subtitle="Manage imported Impact photos, upload to property-media, set cover image, reorder, and edit alt text"
                badge={`${(form.images || []).length} Photo${(form.images || []).length === 1 ? '' : 's'}`}
                open={openSections.photos}
                onToggle={() => toggleSection('photos')}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-[#5C5A55]">
                    External partner image URLs are preserved verbatim without re-hosting.
                  </p>
                  <label className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D6CEBE] rounded text-xs font-semibold text-[#141413] inline-flex items-center gap-1.5 cursor-pointer">
                    <ImagePlus size={14} />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload to property-media'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={uploadingImage}
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadError && (
                  <div
                    role="alert"
                    className="bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] rounded p-3 text-xs flex items-start gap-2"
                  >
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => {
                        setImageUrlError(null);
                        setNewImageUrl(e.target.value);
                      }}
                      placeholder="Or paste verified HTTPS image URL..."
                      className="flex-1 h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 h-10 bg-[#EFECE6] hover:bg-[#E5E0D8] text-xs font-semibold rounded cursor-pointer whitespace-nowrap"
                    >
                      Add URL
                    </button>
                  </div>
                  {imageUrlError && (
                    <p className="text-xs text-[#991B1B]" role="alert">
                      {imageUrlError}
                    </p>
                  )}
                </div>

                {(form.images || []).length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {(form.images || []).map((img, idx) => {
                      const hasLoadError = Boolean(brokenImages[img.image_url]);
                      return (
                        <div
                          key={`${img.image_url}-${idx}`}
                          className={`border rounded p-2.5 space-y-2 ${
                            img.is_primary
                              ? 'border-[#1E3A5F] bg-[#FAF8F5]'
                              : 'border-[#E5E0D8] bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] text-[#5C5A55]">
                            <span className="font-mono tabular-nums font-semibold">
                              #{idx + 1}
                              {img.is_primary ? ' · Cover Image' : ''}
                            </span>
                            {img.source && (
                              <span className="text-[10px] font-medium text-[#7A7770]">
                                {IMAGE_SOURCE_LABELS[img.source]}
                              </span>
                            )}
                          </div>

                          {hasLoadError ? (
                            <div className="w-full aspect-[4/3] rounded bg-[#FEF2F2] border border-[#FECACA] flex flex-col items-center justify-center p-3 text-center text-[#991B1B] space-y-1">
                              <ImageOff size={20} />
                              <span className="text-[11px] font-semibold">
                                Image failed to load
                              </span>
                              <span className="text-[10px] font-mono break-all line-clamp-2">
                                {img.image_url}
                              </span>
                            </div>
                          ) : (
                            <img
                              src={img.image_url}
                              alt={img.alt_text || 'Property preview'}
                              referrerPolicy="no-referrer"
                              onError={() =>
                                setBrokenImages((prev) => ({
                                  ...prev,
                                  [img.image_url]: true,
                                }))
                              }
                              className="w-full aspect-[4/3] object-cover rounded bg-[#EBE6DF]"
                            />
                          )}

                          <div>
                            <label className="block text-[10px] font-semibold text-[#5C5A55] mb-0.5">
                              Alt Text
                            </label>
                            <input
                              type="text"
                              value={img.alt_text || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                markManualField('images');
                                setForm((prev) => ({
                                  ...prev,
                                  images: (prev.images || []).map((item, i) =>
                                    i === idx ? { ...item, alt_text: val } : item
                                  ),
                                }));
                              }}
                              placeholder="Describe this photograph..."
                              className="w-full h-8 px-2 bg-white border border-[#D6CEBE] rounded text-xs"
                            />
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveImage(idx, -1)}
                                title="Move earlier"
                                aria-label="Move image earlier"
                                className="p-1 border border-[#D6CEBE] rounded bg-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ArrowLeft size={12} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (form.images || []).length - 1}
                                onClick={() => moveImage(idx, 1)}
                                title="Move later"
                                aria-label="Move image later"
                                className="p-1 border border-[#D6CEBE] rounded bg-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ArrowRight size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  markManualField('images');
                                  setForm((prev) => ({
                                    ...prev,
                                    images: (prev.images || []).map((item, i) => ({
                                      ...item,
                                      is_primary: i === idx,
                                    })),
                                  }));
                                }}
                                className={`px-2 py-1 rounded font-semibold cursor-pointer ${
                                  img.is_primary
                                    ? 'text-[#1E3A5F] bg-[#EFF4FA]'
                                    : 'text-[#5C5A55] hover:underline'
                                }`}
                              >
                                {img.is_primary ? 'Cover' : 'Set Cover'}
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                markManualField('images');
                                setForm((prev) => {
                                  const remaining = (prev.images || []).filter(
                                    (_, i) => i !== idx
                                  );
                                  const hasPrimary = remaining.some((r) => r.is_primary);
                                  return {
                                    ...prev,
                                    images: remaining.map((item, i) => ({
                                      ...item,
                                      display_order: i,
                                      is_primary: hasPrimary ? item.is_primary : i === 0,
                                    })),
                                  };
                                });
                              }}
                              className="text-[#991B1B] font-semibold cursor-pointer hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CollapsibleSection>

              {/* 7. Pre-Save Import & Listing Review */}
              <CollapsibleSection
                title="7. Pre-Save Import & Listing Review"
                subtitle="Source provenance, missing fields, and publishing verification"
                open={openSections.review}
                onToggle={() => toggleSection('review')}
              >
                <PropertyEditorReviewPanel
                  form={form}
                  featuresCount={parsedFeaturesList.length}
                  originalListingUrl={originalListingUrl}
                  provenance={provenance}
                  reviewConfirmed={reviewConfirmed}
                  onReviewConfirmedChange={setReviewConfirmed}
                />
              </CollapsibleSection>

              <div className="border-t border-[#E5E0D8] pt-4 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-5 py-2.5 bg-[#FAF8F5] border border-[#D6CEBE] text-xs font-semibold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => executeSave('draft')}
                  className="px-5 py-2.5 bg-white hover:bg-[#FAF8F5] border border-[#1E3A5F] text-[#1E3A5F] text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#1E3A5F] hover:bg-[#142944] text-white text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : form.publication_status === 'published'
                    ? form.id
                      ? 'Update & Publish'
                      : 'Publish Listing'
                    : form.id
                    ? 'Update Property'
                    : 'Save Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
