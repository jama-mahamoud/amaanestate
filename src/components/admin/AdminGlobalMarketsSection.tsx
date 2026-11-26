import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  ArrowLeftRight,
  CheckCircle2,
  Database,
  Edit3,
  ExternalLink,
  Globe2,
  ImagePlus,
  Plus,
  Search,
  Send,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import 'flag-icons/css/flag-icons.min.css';
import {
  GlobalMarketComparisonReport,
  GlobalMarketReport,
  MarketDataPeriodType,
  MarketDataSourceType,
  MarketTrendDirection,
  MediaItem,
  PublicationStatus,
} from '../../types';
import { normalizeCountryInfo } from '../../lib/countries';
import {
  buildComparisonSlug,
  buildMarketReportSlug,
  deriveCountrySlug,
  formatMarketCurrency,
  formatMarketDateLabel,
  formatMarketGranularityLabel,
  formatMarketTrend,
  getComparisonPublishReadiness,
  getMarketPublishReadiness,
  isValidHttpsUrl,
  resolveComparisonSocialImageMetadata,
  slugifyMarketSegment,
} from '../../lib/globalMarkets';
import { AUTHORIZED_PUBLIC_DATA_SOURCES } from '../../lib/marketDataSources';
import {
  SaveComparisonCityInput,
  SaveGlobalMarketComparisonInput,
  SaveGlobalMarketInput,
  deleteGlobalMarket,
  deleteGlobalMarketComparison,
  saveGlobalMarket,
  saveGlobalMarketComparison,
  stageDraftFromPublicSource,
  updateGlobalMarketComparisonStatus,
  updateGlobalMarketStatus,
} from '../../services/globalMarketsService';
import { resolveEditorialImage } from '../../lib/editorialImages';
import ComparisonCityEditorSection from './ComparisonCityEditorSection';
import MediaPickerModal from './MediaPickerModal';
import ConfirmDialog from './ConfirmDialog';
import { toast } from 'sonner';

interface AdminGlobalMarketsSectionProps {
  reports: GlobalMarketReport[];
  comparisons?: GlobalMarketComparisonReport[];
  media: MediaItem[];
  schemaPending: boolean;
  comparisonsSchemaPending?: boolean;
  onMediaAdded: (item: MediaItem) => void;
  onRefresh: () => Promise<void>;
}

type AdminEditorMode = 'country' | 'comparison';
type AdminDeleteTarget =
  | { kind: 'country'; report: GlobalMarketReport }
  | { kind: 'comparison'; comparison: GlobalMarketComparisonReport };

function makeEmptyComparisonCity(): SaveComparisonCityInput {
  return {
    city_name: '',
    country_name: '',
    country_code: '',
    image_url: '',
    image_alt: '',
    median_sale_price: null,
    avg_sale_price: null,
    avg_monthly_rent: null,
    currency: 'USD',
    property_price_trend_pct: null,
    property_price_trend_dir: null,
    rental_price_trend_pct: null,
    rental_price_trend_dir: null,
    homes_sold: null,
    days_on_market: null,
    data_source_name: '',
    data_source_url: '',
    data_period: '',
    market_overview: '',
    market_analysis: '',
    investment_insights: '',
  };
}

function makeEmptyComparisonForm(): SaveGlobalMarketComparisonInput {
  return {
    title: '',
    slug: '',
    short_intro: '',
    status: 'draft',
    is_featured: false,
    reporting_period: '',
    reporting_granularity: 'quarter',
    last_verified_at: new Date().toISOString().slice(0, 10),
    social_image: '',
    social_image_alt: '',
    seo_title: '',
    seo_description: '',
    canonical_url: '',
    city_a: makeEmptyComparisonCity(),
    city_b: makeEmptyComparisonCity(),
  };
}

const EMPTY_FORM: SaveGlobalMarketInput = {
  country_name: '',
  country_code: '',
  country_slug: '',
  city_name: '',
  title: '',
  slug: '',
  market_overview: '',
  avg_sale_price: null,
  avg_monthly_rent: null,
  currency: 'USD',
  property_price_trend_pct: null,
  property_price_trend_dir: null,
  rental_price_trend_pct: null,
  rental_price_trend_dir: null,
  investment_insights: '',
  market_analysis: '',
  data_period: '',
  data_period_type: 'quarter',
  data_source_name: '',
  data_source_url: '',
  data_source_type: 'manual',
  last_verified_at: new Date().toISOString().slice(0, 10),
  cover_image: '',
  cover_image_alt: '',
  social_image: '',
  social_image_alt: '',
  status: 'draft',
  is_featured: false,
  seo_title: '',
  seo_description: '',
  canonical_url: '',
};

export default function AdminGlobalMarketsSection({
  reports,
  comparisons = [],
  media,
  schemaPending,
  comparisonsSchemaPending = false,
  onMediaAdded,
  onRefresh,
}: AdminGlobalMarketsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PublicationStatus>('all');
  const [reportTypeFilter, setReportTypeFilter] = useState<'all' | 'country_report' | 'comparison'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'country' | 'city'>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<AdminEditorMode>('country');
  const [form, setForm] = useState<SaveGlobalMarketInput>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [compForm, setCompForm] = useState<SaveGlobalMarketComparisonInput>(() =>
    makeEmptyComparisonForm()
  );
  const [compSlugTouched, setCompSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [socialPreviewError, setSocialPreviewError] = useState(false);
  const [compSocialPreviewError, setCompSocialPreviewError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminDeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Free Public Sources Draft Staging Modal
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);
  const [stagingSourceType, setStagingSourceType] = useState<
    Exclude<MarketDataSourceType, 'manual' | 'other_authorized'>
  >('bis');
  const [stagingCountry, setStagingCountry] = useState('');
  const [stagingCity, setStagingCity] = useState('');
  const [stagingBusy, setStagingBusy] = useState(false);

  const distinctCountries = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of reports) {
      if (r.country_slug && r.country_name && !map.has(r.country_slug)) {
        map.set(r.country_slug, r.country_name);
      }
    }
    for (const c of comparisons) {
      for (const city of [c.city_a, c.city_b]) {
        const slug = deriveCountrySlug(city.country_name);
        if (slug && city.country_name && !map.has(slug)) {
          map.set(slug, city.country_name);
        }
      }
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [reports, comparisons]);

  const filteredReports = useMemo(() => {
    if (reportTypeFilter === 'comparison') return [];
    return reports.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (levelFilter !== 'all' && r.market_level !== levelFilter) return false;
      if (countryFilter !== 'all' && r.country_slug !== countryFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        return (
          r.country_name.toLowerCase().includes(q) ||
          (r.city_name || '').toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.data_source_name.toLowerCase().includes(q) ||
          r.data_period.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reports, reportTypeFilter, statusFilter, levelFilter, countryFilter, searchTerm]);

  const filteredComparisons = useMemo(() => {
    if (reportTypeFilter === 'country_report') return [];
    if (levelFilter === 'country') return [];
    return comparisons.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (countryFilter !== 'all') {
        const slugA = deriveCountrySlug(c.city_a.country_name);
        const slugB = deriveCountrySlug(c.city_b.country_name);
        if (slugA !== countryFilter && slugB !== countryFilter) return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.short_intro.toLowerCase().includes(q) ||
          c.reporting_period.toLowerCase().includes(q) ||
          c.city_a.city_name.toLowerCase().includes(q) ||
          c.city_a.country_name.toLowerCase().includes(q) ||
          c.city_a.data_source_name.toLowerCase().includes(q) ||
          c.city_b.city_name.toLowerCase().includes(q) ||
          c.city_b.country_name.toLowerCase().includes(q) ||
          c.city_b.data_source_name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [comparisons, reportTypeFilter, levelFilter, statusFilter, countryFilter, searchTerm]);

  const stats = useMemo(() => {
    const publishedReports = reports.filter((r) => r.status === 'published');
    const publishedComparisons = comparisons.filter((c) => c.status === 'published');
    const drafts =
      reports.filter((r) => r.status === 'draft').length +
      comparisons.filter((c) => c.status === 'draft').length;
    const featured =
      reports.filter((r) => r.status === 'published' && r.is_featured).length +
      comparisons.filter((c) => c.status === 'published' && c.is_featured).length;
    const countries = new Set(publishedReports.map((r) => r.country_slug).filter(Boolean));
    return {
      total: reports.length + comparisons.length,
      published: publishedReports.length + publishedComparisons.length,
      comparisonsPublished: publishedComparisons.length,
      drafts,
      featured,
      countries: countries.size,
    };
  }, [reports, comparisons]);

  const readiness = useMemo(
    () =>
      getMarketPublishReadiness({
        country_name: form.country_name,
        city_name: form.city_name,
        market_level: form.city_name?.trim() ? 'city' : 'country',
        title: form.title,
        market_overview: form.market_overview,
        market_analysis: form.market_analysis,
        investment_insights: form.investment_insights,
        avg_sale_price:
          form.avg_sale_price === '' || form.avg_sale_price === null
            ? null
            : Number(form.avg_sale_price),
        avg_monthly_rent:
          form.avg_monthly_rent === '' || form.avg_monthly_rent === null
            ? null
            : Number(form.avg_monthly_rent),
        property_price_trend_pct:
          form.property_price_trend_pct === '' || form.property_price_trend_pct === null
            ? null
            : Number(form.property_price_trend_pct),
        rental_price_trend_pct:
          form.rental_price_trend_pct === '' || form.rental_price_trend_pct === null
            ? null
            : Number(form.rental_price_trend_pct),
        data_source_name: form.data_source_name,
        data_source_url: form.data_source_url,
        data_period: form.data_period,
        last_verified_at: form.last_verified_at,
        social_image: form.social_image,
        canonical_url: form.canonical_url,
      }),
    [form]
  );

  const compReadiness = useMemo(() => {
    const resolvedSlug =
      slugifyMarketSegment(compForm.slug) ||
      buildComparisonSlug(compForm.city_a.city_name, compForm.city_b.city_name, compForm.title);

    return getComparisonPublishReadiness({
      title: compForm.title,
      slug: resolvedSlug,
      short_intro: compForm.short_intro,
      reporting_period: compForm.reporting_period,
      reporting_granularity: compForm.reporting_granularity,
      last_verified_at: compForm.last_verified_at,
      social_image: compForm.social_image,
      canonical_url: compForm.canonical_url,
      city_a: {
        ...compForm.city_a,
        country_code: compForm.city_a.country_code || '',
        city_slot: 'A',
        median_sale_price:
          compForm.city_a.median_sale_price === '' || compForm.city_a.median_sale_price === null
            ? null
            : Number(compForm.city_a.median_sale_price),
        avg_sale_price:
          compForm.city_a.avg_sale_price === '' || compForm.city_a.avg_sale_price === null
            ? null
            : Number(compForm.city_a.avg_sale_price),
        avg_monthly_rent:
          compForm.city_a.avg_monthly_rent === '' || compForm.city_a.avg_monthly_rent === null
            ? null
            : Number(compForm.city_a.avg_monthly_rent),
        property_price_trend_pct:
          compForm.city_a.property_price_trend_pct === '' ||
          compForm.city_a.property_price_trend_pct === null
            ? null
            : Number(compForm.city_a.property_price_trend_pct),
        rental_price_trend_pct:
          compForm.city_a.rental_price_trend_pct === '' ||
          compForm.city_a.rental_price_trend_pct === null
            ? null
            : Number(compForm.city_a.rental_price_trend_pct),
        homes_sold:
          compForm.city_a.homes_sold === '' || compForm.city_a.homes_sold === null
            ? null
            : Number(compForm.city_a.homes_sold),
        days_on_market:
          compForm.city_a.days_on_market === '' || compForm.city_a.days_on_market === null
            ? null
            : Number(compForm.city_a.days_on_market),
      },
      city_b: {
        ...compForm.city_b,
        country_code: compForm.city_b.country_code || '',
        city_slot: 'B',
        median_sale_price:
          compForm.city_b.median_sale_price === '' || compForm.city_b.median_sale_price === null
            ? null
            : Number(compForm.city_b.median_sale_price),
        avg_sale_price:
          compForm.city_b.avg_sale_price === '' || compForm.city_b.avg_sale_price === null
            ? null
            : Number(compForm.city_b.avg_sale_price),
        avg_monthly_rent:
          compForm.city_b.avg_monthly_rent === '' || compForm.city_b.avg_monthly_rent === null
            ? null
            : Number(compForm.city_b.avg_monthly_rent),
        property_price_trend_pct:
          compForm.city_b.property_price_trend_pct === '' ||
          compForm.city_b.property_price_trend_pct === null
            ? null
            : Number(compForm.city_b.property_price_trend_pct),
        rental_price_trend_pct:
          compForm.city_b.rental_price_trend_pct === '' ||
          compForm.city_b.rental_price_trend_pct === null
            ? null
            : Number(compForm.city_b.rental_price_trend_pct),
        homes_sold:
          compForm.city_b.homes_sold === '' || compForm.city_b.homes_sold === null
            ? null
            : Number(compForm.city_b.homes_sold),
        days_on_market:
          compForm.city_b.days_on_market === '' || compForm.city_b.days_on_market === null
            ? null
            : Number(compForm.city_b.days_on_market),
      },
    });
  }, [compForm]);

  if (schemaPending) {
    return (
      <div className="bg-white border border-[#E5E0D8] rounded p-8 space-y-4">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
          Database Migration Required
        </p>
        <h2 className="text-xl font-serif font-semibold text-[#141413]">
          Global Markets Table Not Found
        </h2>
        <p className="text-sm text-[#4A4843] max-w-2xl leading-relaxed">
          Run the SQL migration file{' '}
          <code className="font-mono bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E5E0D8]">
            supabase/migrations/20261124000000_create_global_markets.sql
          </code>{' '}
          in your Supabase Dashboard SQL Editor to enable Global Real Estate Market Intelligence reports, country/city analytics, and verification attribution.
        </p>
      </div>
    );
  }

  const openCreateModal = (initialMode: AdminEditorMode = 'country') => {
    setForm({
      ...EMPTY_FORM,
      last_verified_at: new Date().toISOString().slice(0, 10),
    });
    setCompForm(makeEmptyComparisonForm());
    setSocialPreviewError(false);
    setCompSocialPreviewError(false);
    setSlugTouched(false);
    setCompSlugTouched(false);
    setEditorMode(initialMode);
    setEditorOpen(true);
  };

  const openEditModal = (report: GlobalMarketReport) => {
    setForm({
      id: report.id,
      country_name: report.country_name,
      country_code: report.country_code,
      country_slug: report.country_slug,
      city_name: report.city_name || '',
      title: report.title,
      slug: report.slug,
      market_overview: report.market_overview || '',
      avg_sale_price: report.avg_sale_price ?? null,
      avg_monthly_rent: report.avg_monthly_rent ?? null,
      currency: report.currency || 'USD',
      property_price_trend_pct: report.property_price_trend_pct ?? null,
      property_price_trend_dir: report.property_price_trend_dir || null,
      rental_price_trend_pct: report.rental_price_trend_pct ?? null,
      rental_price_trend_dir: report.rental_price_trend_dir || null,
      investment_insights: report.investment_insights || '',
      market_analysis: report.market_analysis || '',
      data_period: report.data_period || '',
      data_period_type: report.data_period_type || 'quarter',
      data_source_name: report.data_source_name || '',
      data_source_url: report.data_source_url || '',
      data_source_type: report.data_source_type || 'manual',
      last_verified_at: report.last_verified_at || '',
      cover_image: report.cover_image || '',
      cover_image_alt: report.cover_image_alt || '',
      social_image: report.social_image || '',
      social_image_alt: report.social_image_alt || '',
      status: report.status,
      is_featured: report.is_featured,
      seo_title: report.seo_title || '',
      seo_description: report.seo_description || '',
      canonical_url: report.canonical_url || '',
      published_at: report.published_at || null,
    });
    setCompForm(makeEmptyComparisonForm());
    setSocialPreviewError(false);
    setCompSocialPreviewError(false);
    setSlugTouched(true);
    setEditorMode('country');
    setEditorOpen(true);
  };

  const openEditComparisonModal = (comparison: GlobalMarketComparisonReport) => {
    setForm({
      ...EMPTY_FORM,
      last_verified_at: new Date().toISOString().slice(0, 10),
    });
    setCompForm({
      id: comparison.id,
      title: comparison.title,
      slug: comparison.slug,
      short_intro: comparison.short_intro || '',
      status: comparison.status,
      is_featured: comparison.is_featured,
      reporting_period: comparison.reporting_period || '',
      reporting_granularity: comparison.reporting_granularity || 'quarter',
      last_verified_at: comparison.last_verified_at || '',
      social_image: comparison.social_image || '',
      social_image_alt: comparison.social_image_alt || '',
      seo_title: comparison.seo_title || '',
      seo_description: comparison.seo_description || '',
      canonical_url: comparison.canonical_url || '',
      published_at: comparison.published_at || null,
      city_a: {
        city_name: comparison.city_a.city_name,
        country_name: comparison.city_a.country_name,
        country_code: comparison.city_a.country_code,
        image_url: comparison.city_a.image_url || '',
        image_alt: comparison.city_a.image_alt || '',
        median_sale_price: comparison.city_a.median_sale_price ?? null,
        avg_sale_price: comparison.city_a.avg_sale_price ?? null,
        avg_monthly_rent: comparison.city_a.avg_monthly_rent ?? null,
        currency: comparison.city_a.currency || 'USD',
        property_price_trend_pct: comparison.city_a.property_price_trend_pct ?? null,
        property_price_trend_dir: comparison.city_a.property_price_trend_dir || null,
        rental_price_trend_pct: comparison.city_a.rental_price_trend_pct ?? null,
        rental_price_trend_dir: comparison.city_a.rental_price_trend_dir || null,
        homes_sold: comparison.city_a.homes_sold ?? null,
        days_on_market: comparison.city_a.days_on_market ?? null,
        data_source_name: comparison.city_a.data_source_name || '',
        data_source_url: comparison.city_a.data_source_url || '',
        data_period: comparison.city_a.data_period || '',
        market_overview: comparison.city_a.market_overview || '',
        market_analysis: comparison.city_a.market_analysis || '',
        investment_insights: comparison.city_a.investment_insights || '',
      },
      city_b: {
        city_name: comparison.city_b.city_name,
        country_name: comparison.city_b.country_name,
        country_code: comparison.city_b.country_code,
        image_url: comparison.city_b.image_url || '',
        image_alt: comparison.city_b.image_alt || '',
        median_sale_price: comparison.city_b.median_sale_price ?? null,
        avg_sale_price: comparison.city_b.avg_sale_price ?? null,
        avg_monthly_rent: comparison.city_b.avg_monthly_rent ?? null,
        currency: comparison.city_b.currency || 'USD',
        property_price_trend_pct: comparison.city_b.property_price_trend_pct ?? null,
        property_price_trend_dir: comparison.city_b.property_price_trend_dir || null,
        rental_price_trend_pct: comparison.city_b.rental_price_trend_pct ?? null,
        rental_price_trend_dir: comparison.city_b.rental_price_trend_dir || null,
        homes_sold: comparison.city_b.homes_sold ?? null,
        days_on_market: comparison.city_b.days_on_market ?? null,
        data_source_name: comparison.city_b.data_source_name || '',
        data_source_url: comparison.city_b.data_source_url || '',
        data_period: comparison.city_b.data_period || '',
        market_overview: comparison.city_b.market_overview || '',
        market_analysis: comparison.city_b.market_analysis || '',
        investment_insights: comparison.city_b.investment_insights || '',
      },
    });
    setSocialPreviewError(false);
    setCompSocialPreviewError(false);
    setCompSlugTouched(true);
    setEditorMode('comparison');
    setEditorOpen(true);
  };

  const handleCountryNameChange = (value: string) => {
    const info = normalizeCountryInfo(value);
    const derivedSlug = deriveCountrySlug(value);
    setForm((prev) => ({
      ...prev,
      country_name: value,
      country_code: info?.code || prev.country_code || '',
      country_slug: derivedSlug || prev.country_slug || '',
    }));
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug:
        !slugTouched && !prev.id
          ? buildMarketReportSlug(value, prev.city_name, prev.country_slug)
          : prev.slug,
    }));
  };

  const handleCityChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      city_name: value,
      slug:
        !slugTouched && !prev.id
          ? buildMarketReportSlug(prev.title, value, prev.country_slug)
          : prev.slug,
    }));
  };

  const updateCityA = (updater: (prev: SaveComparisonCityInput) => SaveComparisonCityInput) => {
    setCompForm((prev) => {
      const nextA = updater(prev.city_a);
      const nextSlug =
        !compSlugTouched && !prev.id
          ? buildComparisonSlug(nextA.city_name, prev.city_b.city_name, prev.title)
          : prev.slug;
      return { ...prev, city_a: nextA, slug: nextSlug };
    });
  };

  const updateCityB = (updater: (prev: SaveComparisonCityInput) => SaveComparisonCityInput) => {
    setCompForm((prev) => {
      const nextB = updater(prev.city_b);
      const nextSlug =
        !compSlugTouched && !prev.id
          ? buildComparisonSlug(prev.city_a.city_name, nextB.city_name, prev.title)
          : prev.slug;
      return { ...prev, city_b: nextB, slug: nextSlug };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await saveGlobalMarket(form);
    setSaving(false);

    if (!res.success) {
      toast.error(res.error || 'Unable to save market intelligence report.');
      return;
    }

    toast.success(
      form.id
        ? 'Market intelligence report updated.'
        : `Market report saved as ${form.status}.`
    );
    setEditorOpen(false);
    await onRefresh();
  };

  const handleSaveComparison = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await saveGlobalMarketComparison(compForm);
    setSaving(false);

    if (!res.success) {
      toast.error(res.error || 'Unable to save two-city comparison report.');
      return;
    }

    toast.success(
      compForm.id
        ? 'Two-city market comparison updated.'
        : `Two-city comparison saved as ${compForm.status}.`
    );
    setEditorOpen(false);
    await onRefresh();
  };

  const handleStatusChange = async (report: GlobalMarketReport, nextStatus: PublicationStatus) => {
    const res = await updateGlobalMarketStatus(report, nextStatus);
    if (!res.success) {
      toast.error(res.error || `Unable to move report to ${nextStatus}.`);
      return;
    }
    toast.success(`"${report.title}" marked as ${nextStatus}.`);
    await onRefresh();
  };

  const handleComparisonStatusChange = async (
    comparison: GlobalMarketComparisonReport,
    nextStatus: PublicationStatus
  ) => {
    const res = await updateGlobalMarketComparisonStatus(comparison, nextStatus);
    if (!res.success) {
      toast.error(res.error || `Unable to move comparison to ${nextStatus}.`);
      return;
    }
    toast.success(`"${comparison.title}" marked as ${nextStatus}.`);
    await onRefresh();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    if (deleteTarget.kind === 'country') {
      const res = await deleteGlobalMarket(deleteTarget.report.id);
      setDeleting(false);
      if (!res.success) {
        toast.error(res.error || 'Unable to delete market report.');
        return;
      }
      toast.success(`Deleted "${deleteTarget.report.title}".`);
    } else {
      const res = await deleteGlobalMarketComparison(deleteTarget.comparison.id);
      setDeleting(false);
      if (!res.success) {
        toast.error(res.error || 'Unable to delete two-city comparison.');
        return;
      }
      toast.success(`Deleted "${deleteTarget.comparison.title}".`);
    }
    setDeleteTarget(null);
    await onRefresh();
  };

  const handleStageFromSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stagingCountry.trim()) {
      toast.error('Enter a country name to stage an attributed draft.');
      return;
    }

    setStagingBusy(true);
    const res = await stageDraftFromPublicSource({
      sourceType: stagingSourceType,
      countryName: stagingCountry,
      cityName: stagingCity,
    });
    setStagingBusy(false);

    if (!res.success || !res.draftInput) {
      toast.error(res.error || 'Unable to stage draft from selected public source.');
      return;
    }

    setSourcesModalOpen(false);
    setForm({
      ...EMPTY_FORM,
      ...res.draftInput,
      status: 'draft',
      is_featured: false,
    });
    setSlugTouched(false);
    setEditorMode('country');
    setEditorOpen(true);
    if (res.note) {
      toast.success(res.note);
    }
  };

  const previewCountrySlug =
    slugifyMarketSegment(form.country_slug) || deriveCountrySlug(form.country_name) || 'country';
  const previewReportSlug =
    slugifyMarketSegment(form.slug) ||
    buildMarketReportSlug(form.title, form.city_name, previewCountrySlug) ||
    'market-report';
  const previewPublicUrl = `/global-markets/${previewCountrySlug}/${previewReportSlug}`;

  const previewComparisonSlug =
    slugifyMarketSegment(compForm.slug) ||
    buildComparisonSlug(compForm.city_a.city_name, compForm.city_b.city_name, compForm.title) ||
    'city-a-vs-city-b-property-market';
  const previewComparisonUrl = `/global-markets/comparisons/${previewComparisonSlug}`;

  const cleanIsoPreview = (form.country_code || '').trim().toLowerCase();
  const hasIsoFlag = /^[a-z]{2}$/.test(cleanIsoPreview);

  const isEditingExisting =
    editorMode === 'country' ? Boolean(form.id) : Boolean(compForm.id);
  const compSocialResolved = useMemo(
    () =>
      resolveComparisonSocialImageMetadata({
        comparison: {
          title: compForm.title,
          social_image: compForm.social_image,
          social_image_alt: compForm.social_image_alt,
          city_a: {
            city_name: compForm.city_a.city_name,
            image_url: compForm.city_a.image_url || null,
            image_alt: compForm.city_a.image_alt || null,
          } as GlobalMarketComparisonReport['city_a'],
          city_b: {
            city_name: compForm.city_b.city_name,
            image_url: compForm.city_b.image_url || null,
            image_alt: compForm.city_b.image_alt || null,
          } as GlobalMarketComparisonReport['city_b'],
        },
      }),
    [compForm]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E0D8] rounded p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
            Market Intelligence CMS
          </p>
          <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            Global Markets &amp; Research Reports
          </h1>
          <p className="text-xs text-[#5C5A55] max-w-2xl">
            Manage country and city real estate market intelligence, verified residential price trends, rental indicators, and investment insights. Individual property listings are strictly separated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row lg:items-center gap-2.5 shrink-0 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setSourcesModalOpen(true)}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D6CEBE] text-[#141413] text-xs font-semibold rounded inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Database size={14} className="text-[#1E3A5F]" />
            <span>Authorized Public Sources</span>
          </button>
          <button
            type="button"
            onClick={() => openCreateModal('country')}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#142944] text-white text-xs font-semibold rounded inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Plus size={15} />
            <span>New Market Report</span>
          </button>
        </div>
      </div>

      {comparisonsSchemaPending && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded p-4 flex items-start gap-3 text-xs text-[#92400E]">
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-[#D97706]" />
          <div className="space-y-1">
            <p className="font-semibold text-[#78350F]">
              Two-City Comparison Database Tables Not Yet Migrated
            </p>
            <p>
              Run{' '}
              <code className="font-mono bg-white/80 px-1.5 py-0.5 rounded border border-[#FDE68A]">
                supabase/migrations/20261125010000_create_global_market_comparisons.sql
              </code>{' '}
              in your Supabase SQL Editor to enable saving and publishing Two-City Property Market Comparisons. Existing Country Market Reports remain unaffected.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E5E0D8] rounded p-3.5 sm:p-4 space-y-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
            Published Countries
          </p>
          <p className="text-xl sm:text-2xl font-serif font-semibold tabular-nums text-[#141413]">
            {stats.countries}
          </p>
        </div>
        <div className="bg-white border border-[#E5E0D8] rounded p-3.5 sm:p-4 space-y-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
            Published Reports &amp; Comparisons
          </p>
          <p className="text-xl sm:text-2xl font-serif font-semibold tabular-nums text-[#141413]">
            {stats.published}
            {stats.comparisonsPublished > 0 && (
              <span className="ml-2 text-xs font-sans font-normal text-[#5C5A55]">
                ({stats.comparisonsPublished} comparisons)
              </span>
            )}
          </p>
        </div>
        <div className="bg-white border border-[#E5E0D8] rounded p-3.5 sm:p-4 space-y-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
            Drafts Pending Review
          </p>
          <p className="text-xl sm:text-2xl font-serif font-semibold tabular-nums text-[#8C4A27]">
            {stats.drafts}
          </p>
        </div>
        <div className="bg-white border border-[#E5E0D8] rounded p-3.5 sm:p-4 space-y-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
            Featured Markets
          </p>
          <p className="text-xl sm:text-2xl font-serif font-semibold tabular-nums text-[#1E3A5F]">
            {stats.featured}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E5E0D8] rounded p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative min-w-0">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7770]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search country, city, title, source..."
            className="w-full min-w-0 h-10 pl-9 pr-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
          />
        </div>
        <select
          value={reportTypeFilter}
          onChange={(e) =>
            setReportTypeFilter(e.target.value as 'all' | 'country_report' | 'comparison')
          }
          className="w-full min-w-0 h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
        >
          <option value="all">All Report Types</option>
          <option value="country_report">Country Market Reports</option>
          <option value="comparison">Two-City Comparisons</option>
        </select>
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="w-full min-w-0 h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
        >
          <option value="all">All Countries ({distinctCountries.length})</option>
          {distinctCountries.map(([slug, name]) => (
            <option key={slug} value={slug}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value as 'all' | 'country' | 'city')}
          className="w-full min-w-0 h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
        >
          <option value="all">All Report Levels</option>
          <option value="country">Country-Level Reports</option>
          <option value="city">City-Level Reports</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | PublicationStatus)}
          className="w-full min-w-0 h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
        {filteredReports.length === 0 && filteredComparisons.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Globe2 size={28} className="mx-auto text-[#8C4A27]" strokeWidth={1.5} />
            <p className="text-sm text-[#5C5A55]">
              {reports.length === 0 && comparisons.length === 0
                ? 'No global market intelligence reports created yet.'
                : 'No market reports or comparisons match your active filters.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => openCreateModal('country')}
                className="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded cursor-pointer"
              >
                Create Country Market Report
              </button>
              <button
                type="button"
                onClick={() => openCreateModal('comparison')}
                className="px-4 py-2 bg-[#FAF8F5] border border-[#D6CEBE] text-[#1E3A5F] text-xs font-semibold rounded cursor-pointer"
              >
                Create Two-City Comparison
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-[#E5E0D8]">
              {filteredReports.map((report) => {
                const iso = (report.country_code || '').trim().toLowerCase();
                const hasFlag = /^[a-z]{2}$/.test(iso);
                const saleLabel = formatMarketCurrency(report.avg_sale_price, report.currency);
                const rentLabel = formatMarketCurrency(
                  report.avg_monthly_rent,
                  report.currency,
                  '/mo'
                );
                const priceTrend = formatMarketTrend(
                  report.property_price_trend_pct,
                  report.property_price_trend_dir
                );
                const rentTrend = formatMarketTrend(
                  report.rental_price_trend_pct,
                  report.rental_price_trend_dir
                );
                const publicHref = `/global-markets/${encodeURIComponent(report.country_slug)}/${encodeURIComponent(report.slug)}`;

                return (
                  <div key={report.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {hasFlag ? (
                          <span
                            className={`fi fi-${iso} w-5 h-[14px] rounded-[2px] ring-1 ring-black/10 shrink-0`}
                            aria-hidden="true"
                          />
                        ) : (
                          <Globe2 size={15} className="text-[#8C4A27] shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-[#141413] text-xs break-words">
                            {report.country_name}
                          </div>
                          <div className="text-[11px] text-[#5C5A55]">
                            {report.city_name ? `${report.city_name} (City)` : 'Country Overview'}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold capitalize shrink-0 ${
                          report.status === 'published'
                            ? 'text-[#14532D]'
                            : report.status === 'draft'
                            ? 'text-[#8C4A27]'
                            : 'text-[#5C5A55]'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="font-medium text-sm text-[#141413] flex items-start gap-1.5">
                        {report.is_featured && (
                          <Star
                            size={13}
                            className="text-[#8C4A27] fill-[#8C4A27] shrink-0 mt-0.5"
                            aria-label="Featured market"
                          />
                        )}
                        <span className="break-words [overflow-wrap:anywhere]">{report.title}</span>
                      </div>
                      <div className="text-[11px] font-mono text-[#7A7770] break-all">
                        {publicHref}
                      </div>
                    </div>

                    <div className="text-xs font-mono tabular-nums text-[#141413] space-y-0.5">
                      {saleLabel && <div>Sale: {saleLabel}</div>}
                      {rentLabel && <div>Rent: {rentLabel}</div>}
                      {(priceTrend || rentTrend) && (
                        <div className="text-[11px] text-[#5C5A55]">
                          {[
                            priceTrend ? `Price ${priceTrend}` : null,
                            rentTrend ? `Rent ${rentTrend}` : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                      )}
                      {!saleLabel && !rentLabel && !priceTrend && !rentTrend && (
                        <span className="text-[#7A7770] font-sans">Qualitative analysis only</span>
                      )}
                    </div>

                    <div className="text-xs text-[#4A4843] space-y-0.5">
                      <div className="font-semibold text-[#141413]">
                        {report.data_period || 'Period unset'}
                      </div>
                      <div className="text-[11px] text-[#5C5A55] break-words">
                        {report.data_source_name || 'No source specified'}
                      </div>
                      {report.last_verified_at && (
                        <div className="text-[10px] font-mono text-[#7A7770]">
                          Verified {formatMarketDateLabel(report.last_verified_at)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(report)}
                        className="min-h-[40px] px-3 py-1.5 bg-[#FAF8F5] border border-[#D6CEBE] text-[#1E3A5F] text-xs font-semibold rounded inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>
                      {report.status !== 'published' ? (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(report, 'published')}
                          className="min-h-[40px] px-3 py-1.5 bg-[#ECFDF5] border border-[#BBF7D0] text-[#14532D] text-xs font-semibold rounded inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send size={14} />
                          <span>Publish</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(report, 'archived')}
                          className="min-h-[40px] px-3 py-1.5 bg-[#EFECE6] text-[#4A4843] text-xs font-semibold rounded inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Archive size={14} />
                          <span>Archive</span>
                        </button>
                      )}
                      {report.status === 'published' && (
                        <a
                          href={publicHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[40px] px-3 py-1.5 bg-[#FAF8F5] border border-[#D6CEBE] text-[#5C5A55] hover:text-[#1E3A5F] text-xs font-semibold rounded inline-flex items-center gap-1.5"
                        >
                          <ExternalLink size={14} />
                          <span>View</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ kind: 'country', report })}
                        aria-label={`Delete ${report.title}`}
                        className="min-h-[40px] min-w-[40px] px-2.5 py-1.5 bg-[#FEF2F2] text-[#991B1B] text-xs font-semibold rounded inline-flex items-center justify-center cursor-pointer ml-auto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredComparisons.map((comp) => {
                const isoA = (comp.city_a.country_code || '').trim().toLowerCase();
                const isoB = (comp.city_b.country_code || '').trim().toLowerCase();
                const medianA = formatMarketCurrency(
                  comp.city_a.median_sale_price,
                  comp.city_a.currency
                );
                const medianB = formatMarketCurrency(
                  comp.city_b.median_sale_price,
                  comp.city_b.currency
                );
                const avgA = formatMarketCurrency(comp.city_a.avg_sale_price, comp.city_a.currency);
                const avgB = formatMarketCurrency(comp.city_b.avg_sale_price, comp.city_b.currency);
                const saleLabelA = medianA ? `Median ${medianA}` : avgA ? `Avg ${avgA}` : 'Data unavailable';
                const saleLabelB = medianB ? `Median ${medianB}` : avgB ? `Avg ${avgB}` : 'Data unavailable';
                const publicHref = `/global-markets/comparisons/${encodeURIComponent(comp.slug)}`;

                return (
                  <div key={`comp-${comp.id}`} className="p-4 space-y-3 bg-[#FCFBF8]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <ArrowLeftRight size={14} className="text-[#8C4A27] shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-[#141413] text-xs flex flex-wrap items-center gap-1.5">
                            {/^[a-z]{2}$/.test(isoA) && (
                              <span className={`fi fi-${isoA} w-4 h-3 rounded-[2px] ring-1 ring-black/10`} />
                            )}
                            <span>{comp.city_a.city_name || 'City A'}</span>
                            <span className="text-[#8C4A27]">vs</span>
                            {/^[a-z]{2}$/.test(isoB) && (
                              <span className={`fi fi-${isoB} w-4 h-3 rounded-[2px] ring-1 ring-black/10`} />
                            )}
                            <span>{comp.city_b.city_name || 'City B'}</span>
                          </div>
                          <div className="text-[11px] text-[#5C5A55]">
                            Two-City Comparison · {comp.city_a.country_name} / {comp.city_b.country_name}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold capitalize shrink-0 ${
                          comp.status === 'published'
                            ? 'text-[#14532D]'
                            : comp.status === 'draft'
                            ? 'text-[#8C4A27]'
                            : 'text-[#5C5A55]'
                        }`}
                      >
                        {comp.status}
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="font-medium text-sm text-[#141413] flex items-start gap-1.5">
                        {comp.is_featured && (
                          <Star
                            size={13}
                            className="text-[#8C4A27] fill-[#8C4A27] shrink-0 mt-0.5"
                            aria-label="Featured comparison"
                          />
                        )}
                        <span className="break-words [overflow-wrap:anywhere]">{comp.title}</span>
                      </div>
                      <div className="text-[11px] font-mono text-[#7A7770] break-all">
                        {publicHref}
                      </div>
                    </div>

                    <div className="text-xs font-mono tabular-nums text-[#141413] space-y-0.5">
                      <div>
                        {comp.city_a.city_name}: {saleLabelA} ({comp.city_a.currency})
                      </div>
                      <div>
                        {comp.city_b.city_name}: {saleLabelB} ({comp.city_b.currency})
                      </div>
                    </div>

                    <div className="text-xs text-[#4A4843] space-y-0.5">
                      <div className="font-semibold text-[#141413]">
                        {comp.reporting_period || 'Period unset'} ·{' '}
                        {formatMarketGranularityLabel(comp.reporting_granularity)}
                      </div>
                      {comp.last_verified_at && (
                        <div className="text-[10px] font-mono text-[#7A7770]">
                          Verified {formatMarketDateLabel(comp.last_verified_at)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => openEditComparisonModal(comp)}
                        className="min-h-[40px] px-3 py-1.5 bg-[#FAF8F5] border border-[#D6CEBE] text-[#1E3A5F] text-xs font-semibold rounded inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>
                      {comp.status !== 'published' ? (
                        <button
                          type="button"
                          onClick={() => handleComparisonStatusChange(comp, 'published')}
                          className="min-h-[40px] px-3 py-1.5 bg-[#ECFDF5] border border-[#BBF7D0] text-[#14532D] text-xs font-semibold rounded inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send size={14} />
                          <span>Publish</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleComparisonStatusChange(comp, 'archived')}
                          className="min-h-[40px] px-3 py-1.5 bg-[#EFECE6] text-[#4A4843] text-xs font-semibold rounded inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Archive size={14} />
                          <span>Archive</span>
                        </button>
                      )}
                      {comp.status === 'published' && (
                        <a
                          href={publicHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[40px] px-3 py-1.5 bg-[#FAF8F5] border border-[#D6CEBE] text-[#5C5A55] hover:text-[#1E3A5F] text-xs font-semibold rounded inline-flex items-center gap-1.5"
                        >
                          <ExternalLink size={14} />
                          <span>View</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ kind: 'comparison', comparison: comp })}
                        aria-label={`Delete ${comp.title}`}
                        className="min-h-[40px] min-w-[40px] px-2.5 py-1.5 bg-[#FEF2F2] text-[#991B1B] text-xs font-semibold rounded inline-flex items-center justify-center cursor-pointer ml-auto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[11px] uppercase tracking-wider text-[#5C5A55]">
                    <th className="py-3 px-4 font-semibold">Country / City</th>
                    <th className="py-3 px-4 font-semibold">Market Report</th>
                    <th className="py-3 px-4 font-semibold">Verified Indicators</th>
                    <th className="py-3 px-4 font-semibold">Period &amp; Source</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {filteredReports.map((report) => {
                    const iso = (report.country_code || '').trim().toLowerCase();
                    const hasFlag = /^[a-z]{2}$/.test(iso);
                    const saleLabel = formatMarketCurrency(report.avg_sale_price, report.currency);
                    const rentLabel = formatMarketCurrency(
                      report.avg_monthly_rent,
                      report.currency,
                      '/mo'
                    );
                    const priceTrend = formatMarketTrend(
                      report.property_price_trend_pct,
                      report.property_price_trend_dir
                    );
                    const rentTrend = formatMarketTrend(
                      report.rental_price_trend_pct,
                      report.rental_price_trend_dir
                    );
                    const publicHref = `/global-markets/${encodeURIComponent(report.country_slug)}/${encodeURIComponent(report.slug)}`;

                    return (
                      <tr key={report.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            {hasFlag ? (
                              <span
                                className={`fi fi-${iso} w-5 h-[14px] rounded-[2px] ring-1 ring-black/10 shrink-0`}
                                aria-hidden="true"
                              />
                            ) : (
                              <Globe2 size={15} className="text-[#8C4A27] shrink-0" />
                            )}
                            <div>
                              <div className="font-semibold text-[#141413] text-xs">
                                {report.country_name}
                              </div>
                              <div className="text-[11px] text-[#5C5A55]">
                                {report.city_name ? `${report.city_name} (City)` : 'Country Overview'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-medium text-[#141413] flex items-center gap-1.5">
                            {report.is_featured && (
                              <span title="Featured market" className="inline-flex shrink-0">
                                <Star
                                  size={13}
                                  className="text-[#8C4A27] fill-[#8C4A27]"
                                  aria-label="Featured market"
                                />
                              </span>
                            )}
                            <span className="truncate">{report.title}</span>
                          </div>
                          <div className="text-[11px] font-mono text-[#7A7770] truncate">
                            {publicHref}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-xs font-mono tabular-nums text-[#141413]">
                          <div className="space-y-0.5">
                            {saleLabel && <div>Sale: {saleLabel}</div>}
                            {rentLabel && <div>Rent: {rentLabel}</div>}
                            {(priceTrend || rentTrend) && (
                              <div className="text-[11px] text-[#5C5A55]">
                                {[
                                  priceTrend ? `Price ${priceTrend}` : null,
                                  rentTrend ? `Rent ${rentTrend}` : null,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </div>
                            )}
                            {!saleLabel && !rentLabel && !priceTrend && !rentTrend && (
                              <span className="text-[#7A7770] font-sans">Qualitative analysis only</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-[#4A4843]">
                          <div className="font-semibold text-[#141413]">
                            {report.data_period || 'Period unset'}
                          </div>
                          <div className="text-[11px] text-[#5C5A55] truncate max-w-[180px]">
                            {report.data_source_name || 'No source specified'}
                          </div>
                          {report.last_verified_at && (
                            <div className="text-[10px] font-mono text-[#7A7770]">
                              Verified {formatMarketDateLabel(report.last_verified_at)}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          <span
                            className={`font-semibold capitalize ${
                              report.status === 'published'
                                ? 'text-[#14532D]'
                                : report.status === 'draft'
                                ? 'text-[#8C4A27]'
                                : 'text-[#5C5A55]'
                            }`}
                          >
                            {report.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {report.status === 'published' && (
                              <a
                                href={publicHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-[#5C5A55] hover:text-[#1E3A5F]"
                                title="View public market page"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                            {report.status !== 'published' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(report, 'published')}
                                className="p-1.5 text-[#14532D] hover:bg-[#ECFDF5] rounded cursor-pointer"
                                title="Publish report"
                              >
                                <Send size={14} />
                              </button>
                            )}
                            {report.status === 'published' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(report, 'archived')}
                                className="p-1.5 text-[#5C5A55] hover:bg-[#EFECE6] rounded cursor-pointer"
                                title="Archive report"
                              >
                                <Archive size={14} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openEditModal(report)}
                              className="p-1.5 text-[#1E3A5F] hover:text-[#141413] cursor-pointer"
                              title="Edit report"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ kind: 'country', report })}
                              className="p-1.5 text-[#991B1B] hover:text-[#7F1D1D] cursor-pointer"
                              title="Delete report"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredComparisons.map((comp) => {
                    const isoA = (comp.city_a.country_code || '').trim().toLowerCase();
                    const isoB = (comp.city_b.country_code || '').trim().toLowerCase();
                    const medianA = formatMarketCurrency(
                      comp.city_a.median_sale_price,
                      comp.city_a.currency
                    );
                    const medianB = formatMarketCurrency(
                      comp.city_b.median_sale_price,
                      comp.city_b.currency
                    );
                    const avgA = formatMarketCurrency(
                      comp.city_a.avg_sale_price,
                      comp.city_a.currency
                    );
                    const avgB = formatMarketCurrency(
                      comp.city_b.avg_sale_price,
                      comp.city_b.currency
                    );
                    const saleSummaryA = medianA ? `Median ${medianA}` : avgA ? `Avg ${avgA}` : 'N/A';
                    const saleSummaryB = medianB ? `Median ${medianB}` : avgB ? `Avg ${avgB}` : 'N/A';
                    const trendA = formatMarketTrend(
                      comp.city_a.property_price_trend_pct,
                      comp.city_a.property_price_trend_dir
                    );
                    const trendB = formatMarketTrend(
                      comp.city_b.property_price_trend_pct,
                      comp.city_b.property_price_trend_dir
                    );
                    const publicHref = `/global-markets/comparisons/${encodeURIComponent(comp.slug)}`;

                    return (
                      <tr key={`comp-${comp.id}`} className="hover:bg-[#FAF8F5] bg-[#FCFBF8]">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <ArrowLeftRight size={14} className="text-[#8C4A27] shrink-0" />
                            <div>
                              <div className="font-semibold text-[#141413] text-xs flex items-center gap-1.5">
                                {/^[a-z]{2}$/.test(isoA) && (
                                  <span className={`fi fi-${isoA} w-4 h-3 rounded-[2px] ring-1 ring-black/10`} />
                                )}
                                <span>{comp.city_a.city_name || 'City A'}</span>
                                <span className="text-[#8C4A27]">vs</span>
                                {/^[a-z]{2}$/.test(isoB) && (
                                  <span className={`fi fi-${isoB} w-4 h-3 rounded-[2px] ring-1 ring-black/10`} />
                                )}
                                <span>{comp.city_b.city_name || 'City B'}</span>
                              </div>
                              <div className="text-[11px] text-[#5C5A55]">
                                Two-City Comparison · {comp.city_a.country_name} / {comp.city_b.country_name}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-medium text-[#141413] flex items-center gap-1.5">
                            {comp.is_featured && (
                              <span title="Featured comparison" className="inline-flex shrink-0">
                                <Star
                                  size={13}
                                  className="text-[#8C4A27] fill-[#8C4A27]"
                                  aria-label="Featured comparison"
                                />
                              </span>
                            )}
                            <span className="truncate">{comp.title}</span>
                          </div>
                          <div className="text-[11px] font-mono text-[#7A7770] truncate">
                            {publicHref}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-xs font-mono tabular-nums text-[#141413]">
                          <div className="space-y-0.5">
                            <div>
                              A ({comp.city_a.city_name}): {saleSummaryA}
                              {trendA ? ` (${trendA})` : ''}
                            </div>
                            <div>
                              B ({comp.city_b.city_name}): {saleSummaryB}
                              {trendB ? ` (${trendB})` : ''}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-[#4A4843]">
                          <div className="font-semibold text-[#141413]">
                            {comp.reporting_period || 'Period unset'} ·{' '}
                            {formatMarketGranularityLabel(comp.reporting_granularity)}
                          </div>
                          <div className="text-[11px] text-[#5C5A55] truncate max-w-[200px]">
                            {[comp.city_a.data_source_name, comp.city_b.data_source_name]
                              .filter(Boolean)
                              .join(' · ') || 'No source specified'}
                          </div>
                          {comp.last_verified_at && (
                            <div className="text-[10px] font-mono text-[#7A7770]">
                              Verified {formatMarketDateLabel(comp.last_verified_at)}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          <span
                            className={`font-semibold capitalize ${
                              comp.status === 'published'
                                ? 'text-[#14532D]'
                                : comp.status === 'draft'
                                ? 'text-[#8C4A27]'
                                : 'text-[#5C5A55]'
                            }`}
                          >
                            {comp.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {comp.status === 'published' && (
                              <a
                                href={publicHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-[#5C5A55] hover:text-[#1E3A5F]"
                                title="View public comparison page"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                            {comp.status !== 'published' && (
                              <button
                                type="button"
                                onClick={() => handleComparisonStatusChange(comp, 'published')}
                                className="p-1.5 text-[#14532D] hover:bg-[#ECFDF5] rounded cursor-pointer"
                                title="Publish comparison"
                              >
                                <Send size={14} />
                              </button>
                            )}
                            {comp.status === 'published' && (
                              <button
                                type="button"
                                onClick={() => handleComparisonStatusChange(comp, 'archived')}
                                className="p-1.5 text-[#5C5A55] hover:bg-[#EFECE6] rounded cursor-pointer"
                                title="Archive comparison"
                              >
                                <Archive size={14} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openEditComparisonModal(comp)}
                              className="p-1.5 text-[#1E3A5F] hover:text-[#141413] cursor-pointer"
                              title="Edit comparison"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ kind: 'comparison', comparison: comp })}
                              className="p-1.5 text-[#991B1B] hover:text-[#7F1D1D] cursor-pointer"
                              title="Delete comparison"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Create / Edit Global Market Report or Two-City Comparison Modal */}
      {editorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            isEditingExisting
              ? editorMode === 'comparison'
                ? 'Edit Two-City Comparison'
                : 'Edit Market Report'
              : 'Create Market Intelligence Report'
          }
          className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
        >
          <div className="bg-white border border-[#E5E0D8] rounded-none sm:rounded w-full max-w-4xl min-w-0 min-h-[100dvh] sm:min-h-0 sm:max-h-[92vh] overflow-y-auto overflow-x-hidden p-4 sm:p-8 space-y-6 my-0 sm:my-6">
            <div className="flex items-start justify-between border-b border-[#E5E0D8] pb-4 gap-3 sm:gap-4 min-w-0">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
                  Global Markets Editor
                </p>
                <h2 className="text-lg sm:text-xl font-serif font-semibold text-[#141413]">
                  {isEditingExisting
                    ? editorMode === 'comparison'
                      ? 'Edit Two-City Property Market Comparison'
                      : 'Edit Market Intelligence Report'
                    : 'Create Market Intelligence Report'}
                </h2>
                <p className="text-xs font-mono text-[#5C5A55] mt-1 break-all">
                  Public URL: https://www.amaanestate.com
                  {editorMode === 'comparison' ? previewComparisonUrl : previewPublicUrl}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                aria-label="Close editor"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[#5C5A55] hover:text-[#141413] cursor-pointer shrink-0 rounded"
              >
                <X size={18} />
              </button>
            </div>

            {/* Report Type Selector (on Create) */}
            {!isEditingExisting && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest font-semibold text-[#5C5A55]">
                  Report Type
                </p>
                <div
                  role="radiogroup"
                  aria-label="Select market intelligence report type"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={editorMode === 'country'}
                    onClick={() => setEditorMode('country')}
                    className={`p-3.5 rounded border text-left transition-colors cursor-pointer ${
                      editorMode === 'country'
                        ? 'bg-[#F3F6FA] border-[#1E3A5F] ring-1 ring-[#1E3A5F]'
                        : 'bg-white border-[#E5E0D8] hover:border-[#1E3A5F]/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#141413]">
                      <Globe2 size={15} className="text-[#1E3A5F] shrink-0" />
                      <span>Country Market Report</span>
                    </div>
                    <p className="text-[11px] text-[#5C5A55] mt-1">
                      Single country or city property market report under /global-markets/country/report.
                    </p>
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={editorMode === 'comparison'}
                    onClick={() => setEditorMode('comparison')}
                    className={`p-3.5 rounded border text-left transition-colors cursor-pointer ${
                      editorMode === 'comparison'
                        ? 'bg-[#F3F6FA] border-[#1E3A5F] ring-1 ring-[#1E3A5F]'
                        : 'bg-white border-[#E5E0D8] hover:border-[#1E3A5F]/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#141413]">
                      <ArrowLeftRight size={15} className="text-[#8C4A27] shrink-0" />
                      <span>Two-City Comparison</span>
                    </div>
                    <p className="text-[11px] text-[#5C5A55] mt-1">
                      Side-by-side comparison of City A and City B with independent metrics, currencies &amp; sources.
                    </p>
                  </button>
                </div>
              </div>
            )}

            {editorMode === 'country' ? (
              <>
                {/* Publish Readiness / Anti-Thin-Page Banner */}
                <div
                  className={`rounded border px-4 py-3 text-xs space-y-1 ${
                    readiness.isReadyToPublish
                      ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#14532D]'
                      : 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                  }`}
                >
                  <div className="font-semibold flex items-center gap-1.5">
                    {readiness.isReadyToPublish ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Meets publication &amp; anti-thin-content standards.</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={14} />
                        <span>Required before publishing (Draft saves freely):</span>
                      </>
                    )}
                  </div>
                  {readiness.issues.map((issue) => (
                    <p key={issue}>• {issue}</p>
                  ))}
                  {readiness.warnings.map((w) => (
                    <p key={w} className="text-[#78350F]">
                      • Note: {w}
                    </p>
                  ))}
                </div>

                <form onSubmit={handleSave} className="space-y-6 min-w-0">
              {/* Section 1: Geography & Identity */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-[#5C5A55] border-b border-[#E5E0D8] pb-2">
                  1. Location, Title &amp; Publication Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Country Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.country_name}
                      onChange={(e) => handleCountryNameChange(e.target.value)}
                      placeholder="e.g., United Arab Emirates"
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Country ISO Code &amp; Flag
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-12 border border-[#D6CEBE] rounded bg-[#FAF8F5] flex items-center justify-center shrink-0">
                        {hasIsoFlag ? (
                          <span
                            className={`fi fi-${cleanIsoPreview} w-6 h-[18px] rounded-[2px] ring-1 ring-black/10`}
                          />
                        ) : (
                          <Globe2 size={16} className="text-[#8C4A27]" />
                        )}
                      </div>
                      <input
                        type="text"
                        maxLength={2}
                        value={form.country_code || ''}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            country_code: e.target.value.toUpperCase(),
                          }))
                        }
                        placeholder="AE"
                        className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      City (Optional)
                    </label>
                    <input
                      type="text"
                      value={form.city_name || ''}
                      onChange={(e) => handleCityChange(e.target.value)}
                      placeholder="Leave blank for country-level report"
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Market Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g., Dubai Residential & Prime Rental Market Intelligence (Q3 2026)"
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Publication Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          status: e.target.value as PublicationStatus,
                        }))
                      }
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm bg-white"
                    >
                      <option value="draft">Draft (Internal Review)</option>
                      <option value="published">Published (Live Publicly)</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3 flex items-center gap-2 pt-1">
                    <input
                      id="gm-featured"
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, is_featured: e.target.checked }))
                      }
                      className="w-4 h-4"
                    />
                    <label htmlFor="gm-featured" className="text-xs font-semibold text-[#141413]">
                      Featured Market (prioritized on Global Markets homepage strip &amp; country overview)
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 2: Verified Quantitative Indicators */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E0D8] pb-2">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-[#5C5A55]">
                    2. Market Metrics &amp; Price Trends (Optional — Enter Only Verified Figures)
                  </h3>
                  <span className="text-[11px] text-[#7A7770]">
                    Leave blank where reliable data is unavailable
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Average Property Sale Price
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={form.avg_sale_price ?? ''}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          avg_sale_price: e.target.value === '' ? null : e.target.value,
                        }))
                      }
                      placeholder="Optional numeric value"
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Average Monthly Rent
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={form.avg_monthly_rent ?? ''}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          avg_monthly_rent: e.target.value === '' ? null : e.target.value,
                        }))
                      }
                      placeholder="Optional numeric value"
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Currency (ISO Code)
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      value={form.currency}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))
                      }
                      placeholder="USD"
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono uppercase"
                    />
                  </div>

                  <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded space-y-2 min-w-0">
                      <label className="block text-xs font-semibold text-[#141413]">
                        Property Price Trend (% &amp; Direction)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={form.property_price_trend_pct ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const num = Number(val);
                            setForm((prev) => ({
                              ...prev,
                              property_price_trend_pct: val === '' ? null : val,
                              property_price_trend_dir:
                                val === ''
                                  ? prev.property_price_trend_dir
                                  : num > 0
                                  ? 'up'
                                  : num < 0
                                  ? 'down'
                                  : 'flat',
                            }));
                          }}
                          placeholder="e.g. 4.8"
                          className="w-full min-w-0 h-10 px-3 bg-white border border-[#D6CEBE] rounded text-sm font-mono"
                        />
                        <select
                          value={form.property_price_trend_dir || ''}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              property_price_trend_dir:
                                (e.target.value as MarketTrendDirection) || null,
                            }))
                          }
                          className="w-full min-w-0 h-10 px-2.5 bg-white border border-[#D6CEBE] rounded text-xs"
                        >
                          <option value="">Direction (Auto / None)</option>
                          <option value="up">Upward (+)</option>
                          <option value="down">Downward (-)</option>
                          <option value="flat">Stable / Flat</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded space-y-2 min-w-0">
                      <label className="block text-xs font-semibold text-[#141413]">
                        Rental Price Trend (% &amp; Direction)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={form.rental_price_trend_pct ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const num = Number(val);
                            setForm((prev) => ({
                              ...prev,
                              rental_price_trend_pct: val === '' ? null : val,
                              rental_price_trend_dir:
                                val === ''
                                  ? prev.rental_price_trend_dir
                                  : num > 0
                                  ? 'up'
                                  : num < 0
                                  ? 'down'
                                  : 'flat',
                            }));
                          }}
                          placeholder="e.g. 6.2"
                          className="w-full min-w-0 h-10 px-3 bg-white border border-[#D6CEBE] rounded text-sm font-mono"
                        />
                        <select
                          value={form.rental_price_trend_dir || ''}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              rental_price_trend_dir:
                                (e.target.value as MarketTrendDirection) || null,
                            }))
                          }
                          className="w-full min-w-0 h-10 px-2.5 bg-white border border-[#D6CEBE] rounded text-xs"
                        >
                          <option value="">Direction (Auto / None)</option>
                          <option value="up">Upward (+)</option>
                          <option value="down">Downward (-)</option>
                          <option value="flat">Stable / Flat</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Editorial Research & Analysis */}
              <div className="space-y-4 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E0D8] pb-2">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-[#5C5A55]">
                    3. Editorial Research &amp; Investment Intelligence
                  </h3>
                  <span className="text-[11px] text-[#7A7770]">
                    Press Enter for line breaks (blank line for new paragraphs)
                  </span>
                </div>
                <div className="space-y-5 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label
                        htmlFor="gm-market-overview"
                        className="block text-xs font-semibold text-[#4A4843]"
                      >
                        Market Overview
                      </label>
                      <span className="text-[11px] font-mono tabular-nums text-[#7A7770]">
                        {form.market_overview.length.toLocaleString()} chars
                      </span>
                    </div>
                    <textarea
                      id="gm-market-overview"
                      rows={5}
                      wrap="soft"
                      value={form.market_overview}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, market_overview: e.target.value }))
                      }
                      placeholder="Concise executive summary of residential housing supply, demand drivers, and market cycle..."
                      className="block w-full min-w-0 max-w-full box-border min-h-[140px] max-h-[340px] p-3 sm:p-3.5 bg-white border border-[#D6CEBE] rounded text-sm text-[#141413] leading-[1.65] whitespace-pre-wrap break-words [overflow-wrap:anywhere] overflow-y-auto overflow-x-hidden resize-y focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label
                        htmlFor="gm-market-analysis"
                        className="block text-xs font-semibold text-[#4A4843]"
                      >
                        Market Analysis (Residential Price &amp; Rental Dynamics)
                      </label>
                      <span className="text-[11px] font-mono tabular-nums text-[#7A7770]">
                        {form.market_analysis.length.toLocaleString()} chars
                      </span>
                    </div>
                    <textarea
                      id="gm-market-analysis"
                      rows={9}
                      wrap="soft"
                      value={form.market_analysis}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, market_analysis: e.target.value }))
                      }
                      placeholder="Detailed analysis of buyer vs. tenant demand, prime vs. secondary sub-markets, financing costs, and regulatory shifts..."
                      className="block w-full min-w-0 max-w-full box-border min-h-[220px] max-h-[480px] p-3 sm:p-3.5 bg-white border border-[#D6CEBE] rounded text-sm text-[#141413] leading-[1.65] whitespace-pre-wrap break-words [overflow-wrap:anywhere] overflow-y-auto overflow-x-hidden resize-y focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label
                        htmlFor="gm-investment-insights"
                        className="block text-xs font-semibold text-[#4A4843]"
                      >
                        Investment Insights
                      </label>
                      <span className="text-[11px] font-mono tabular-nums text-[#7A7770]">
                        {form.investment_insights.length.toLocaleString()} chars
                      </span>
                    </div>
                    <textarea
                      id="gm-investment-insights"
                      rows={6}
                      wrap="soft"
                      value={form.investment_insights}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, investment_insights: e.target.value }))
                      }
                      placeholder="Key takeaways for institutional and private investors, risk factors, liquidity notes, and structural demand drivers..."
                      className="block w-full min-w-0 max-w-full box-border min-h-[160px] max-h-[380px] p-3 sm:p-3.5 bg-white border border-[#D6CEBE] rounded text-sm text-[#141413] leading-[1.65] whitespace-pre-wrap break-words [overflow-wrap:anywhere] overflow-y-auto overflow-x-hidden resize-y focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Data Verification & Cover Image */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-[#5C5A55] border-b border-[#E5E0D8] pb-2">
                  4. Data Verification, Attribution &amp; Cover Visual
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Data Period
                    </label>
                    <input
                      type="text"
                      value={form.data_period}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, data_period: e.target.value }))
                      }
                      placeholder="e.g., Q3 2026 or 2026"
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Reporting Granularity
                    </label>
                    <select
                      value={form.data_period_type}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          data_period_type: e.target.value as MarketDataPeriodType,
                        }))
                      }
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm bg-white"
                    >
                      <option value="month">Monthly</option>
                      <option value="quarter">Quarterly</option>
                      <option value="year">Annual / Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Last Verified / Updated Date
                    </label>
                    <input
                      type="date"
                      value={form.last_verified_at || ''}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, last_verified_at: e.target.value }))
                      }
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Source Category
                    </label>
                    <select
                      value={form.data_source_type}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          data_source_type: e.target.value as MarketDataSourceType,
                        }))
                      }
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm bg-white"
                    >
                      <option value="manual">Manual Editorial Research</option>
                      <option value="bis">BIS Property Price Statistics</option>
                      <option value="oecd">OECD Housing Indicators</option>
                      <option value="national_stats">National Statistical Agency</option>
                      <option value="central_bank">Central Bank Release</option>
                      <option value="other_authorized">Other Authorized Public Source</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Data Source Name
                    </label>
                    <input
                      type="text"
                      value={form.data_source_name}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, data_source_name: e.target.value }))
                      }
                      placeholder="e.g., Bank for International Settlements / ONS"
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Data Source URL
                    </label>
                    <input
                      type="url"
                      value={form.data_source_url || ''}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, data_source_url: e.target.value }))
                      }
                      placeholder="https://..."
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono"
                    />
                  </div>
                </div>

                {/* Cover Image via Media Library */}
                <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8] rounded space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-[#141413]">
                      Cover Image (Media Library)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {form.cover_image && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              cover_image: '',
                              cover_image_alt: '',
                            }))
                          }
                          className="min-h-[36px] px-2.5 py-1 text-xs font-semibold text-[#991B1B] hover:underline cursor-pointer"
                        >
                          Remove Image
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setMediaPickerOpen(true)}
                        className="min-h-[40px] px-3 py-1.5 bg-white hover:bg-[#EFECE6] border border-[#D6CEBE] rounded text-xs font-semibold text-[#141413] inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <ImagePlus size={14} />
                        <span>{form.cover_image ? 'Change Image' : 'Select or Upload Cover'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    {form.cover_image ? (
                      <img
                        src={resolveEditorialImage(form.cover_image)}
                        alt={form.cover_image_alt || form.title || 'Market cover preview'}
                        referrerPolicy="no-referrer"
                        className="w-full aspect-[16/10] object-cover rounded border border-[#E5E0D8] bg-[#EBE6DF]"
                      />
                    ) : (
                      <div className="w-full aspect-[16/10] rounded border border-dashed border-[#D6CEBE] bg-white flex items-center justify-center text-xs text-[#7A7770]">
                        No cover selected
                      </div>
                    )}
                    <div className="sm:col-span-2 space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#5C5A55] mb-1">
                          Cover Image URL
                        </label>
                        <input
                          type="text"
                          value={form.cover_image || ''}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, cover_image: e.target.value }))
                          }
                          placeholder="/images/articles/... or https://..."
                          className="w-full h-9 px-3 bg-white border border-[#D6CEBE] rounded text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#5C5A55] mb-1">
                          Cover Image Alt Text
                        </label>
                        <input
                          type="text"
                          value={form.cover_image_alt || ''}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, cover_image_alt: e.target.value }))
                          }
                          placeholder="Descriptive architectural / urban landscape alt text"
                          className="w-full h-9 px-3 bg-white border border-[#D6CEBE] rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Social Media Sharing Image (URL Input Only) */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-[#5C5A55] border-b border-[#E5E0D8] pb-2">
                  5. Social Media Sharing Image
                </h3>
                <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8] rounded space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-[#141413]">
                        Open Graph &amp; Social Link Preview URL
                      </p>
                      <p className="text-[11px] text-[#5C5A55] mt-0.5">
                        Paste a publicly accessible HTTPS image URL. Recommended image dimensions: 1200 &times; 630 pixels (1.91:1).
                      </p>
                    </div>
                    {(form.social_image || form.social_image_alt) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSocialPreviewError(false);
                          setForm((prev) => ({
                            ...prev,
                            social_image: '',
                            social_image_alt: '',
                          }));
                        }}
                        className="min-h-[36px] px-2.5 py-1 text-xs font-semibold text-[#991B1B] hover:underline cursor-pointer"
                      >
                        Clear URL
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    {form.social_image?.trim() && isValidHttpsUrl(form.social_image) && !socialPreviewError ? (
                      <img
                        src={form.social_image.trim()}
                        alt={
                          form.social_image_alt?.trim() ||
                          form.title ||
                          'Social sharing image preview'
                        }
                        referrerPolicy="no-referrer"
                        onError={() => setSocialPreviewError(true)}
                        className="w-full aspect-[1.91/1] object-cover rounded border border-[#E5E0D8] bg-[#EBE6DF]"
                      />
                    ) : (
                      <div className="w-full aspect-[1.91/1] rounded border border-dashed border-[#D6CEBE] bg-white px-3 flex items-center justify-center text-center text-[11px] text-[#7A7770]">
                        {form.social_image?.trim()
                          ? !isValidHttpsUrl(form.social_image)
                            ? 'Enter a valid https:// image URL to preview'
                            : 'Preview could not be loaded from URL'
                          : 'Defaults to Cover Image or site OG image'}
                      </div>
                    )}

                    <div className="sm:col-span-2 space-y-2.5">
                      <div>
                        <label
                          htmlFor="gm-social-image-url"
                          className="block text-[11px] font-semibold text-[#5C5A55] mb-1"
                        >
                          Social Sharing Image URL (Optional)
                        </label>
                        <input
                          id="gm-social-image-url"
                          type="url"
                          value={form.social_image || ''}
                          onChange={(e) => {
                            setSocialPreviewError(false);
                            setForm((prev) => ({ ...prev, social_image: e.target.value }));
                          }}
                          placeholder="https://example.com/images/global-market-share-1200x630.jpg"
                          className="w-full h-9 px-3 bg-white border border-[#D6CEBE] rounded text-xs font-mono"
                        />
                        {form.social_image?.trim() && !isValidHttpsUrl(form.social_image) && (
                          <p className="mt-1 text-[11px] text-[#991B1B]">
                            Enter an absolute HTTPS URL starting with https://
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="gm-social-image-alt"
                          className="block text-[11px] font-semibold text-[#5C5A55] mb-1"
                        >
                          Social Sharing Image Alt Text (Optional)
                        </label>
                        <input
                          id="gm-social-image-alt"
                          type="text"
                          value={form.social_image_alt || ''}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, social_image_alt: e.target.value }))
                          }
                          placeholder="Descriptive alt text for Facebook, LinkedIn, WhatsApp & X link previews"
                          className="w-full h-9 px-3 bg-white border border-[#D6CEBE] rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 6: SEO & URL Slugs */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-[#5C5A55] border-b border-[#E5E0D8] pb-2">
                  6. Search Engine Optimization &amp; Canonical URL
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Country Slug
                    </label>
                    <input
                      type="text"
                      value={form.country_slug || ''}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          country_slug: slugifyMarketSegment(e.target.value),
                        }))
                      }
                      placeholder="united-arab-emirates"
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Report Slug
                    </label>
                    <input
                      type="text"
                      value={form.slug || ''}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setForm((prev) => ({
                          ...prev,
                          slug: slugifyMarketSegment(e.target.value),
                        }));
                      }}
                      placeholder="dubai-residential-market-2026"
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      SEO Title (Optional Override)
                    </label>
                    <input
                      type="text"
                      value={form.seo_title || ''}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, seo_title: e.target.value }))
                      }
                      placeholder="Defaults to Market Title | AmaanEstate"
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Canonical URL (Optional Override)
                    </label>
                    <input
                      type="url"
                      value={form.canonical_url || ''}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, canonical_url: e.target.value }))
                      }
                      placeholder={`https://www.amaanestate.com${previewPublicUrl}`}
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-xs font-mono"
                    />
                    <p className="mt-1 text-[11px] text-[#7A7770]">
                      Leave blank to self-canonicalize to the report URL above. Setting this does not change the report slug.
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Meta Description (Optional Override)
                    </label>
                    <textarea
                      rows={2}
                      value={form.seo_description || ''}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, seo_description: e.target.value }))
                      }
                      placeholder="140-160 character summary for search snippets..."
                      className="w-full p-3 border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E5E0D8] pt-4 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-[#FAF8F5] border border-[#D6CEBE] text-xs font-semibold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-[#1E3A5F] hover:bg-[#142944] text-white text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : form.id ? 'Update Report' : 'Save Market Report'}
                </button>
              </div>
            </form>
              </>
            ) : (
              <>
                {/* Two-City Comparison Readiness Banner */}
                <div
                  className={`rounded border px-4 py-3 text-xs space-y-1 ${
                    compReadiness.isReadyToPublish
                      ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#14532D]'
                      : 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                  }`}
                >
                  <div className="font-semibold flex items-center gap-1.5">
                    {compReadiness.isReadyToPublish ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Comparison meets publication standards for City A and City B.</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={14} />
                        <span>Required before publishing comparison (Draft saves freely):</span>
                      </>
                    )}
                  </div>
                  {compReadiness.issues.map((issue) => (
                    <p key={issue}>• {issue}</p>
                  ))}
                  {compReadiness.warnings.map((w) => (
                    <p key={w} className="text-[#78350F]">
                      • Note: {w}
                    </p>
                  ))}
                </div>

                {/* Dedicated Two-City Comparison Form */}
                <form onSubmit={handleSaveComparison} className="space-y-6 min-w-0">
                  {/* Section 1: Comparison Information */}
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-widest font-semibold text-[#5C5A55] border-b border-[#E5E0D8] pb-2">
                      1. Comparison Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="comp-title"
                          className="block text-xs font-semibold text-[#4A4843] mb-1"
                        >
                          Comparison Title *
                        </label>
                        <input
                          id="comp-title"
                          type="text"
                          required
                          value={compForm.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCompForm((prev) => ({
                              ...prev,
                              title: val,
                              slug:
                                !compSlugTouched && !prev.id
                                  ? buildComparisonSlug(
                                      prev.city_a.city_name,
                                      prev.city_b.city_name,
                                      val
                                    )
                                  : prev.slug,
                            }));
                          }}
                          placeholder="e.g., Dubai vs London Residential Property Market Comparison (2026)"
                          className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="comp-status"
                          className="block text-xs font-semibold text-[#4A4843] mb-1"
                        >
                          Publication Status
                        </label>
                        <select
                          id="comp-status"
                          value={compForm.status}
                          onChange={(e) =>
                            setCompForm((prev) => ({
                              ...prev,
                              status: e.target.value as PublicationStatus,
                            }))
                          }
                          className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm bg-white"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label
                          htmlFor="comp-short-intro"
                          className="block text-xs font-semibold text-[#4A4843] mb-1"
                        >
                          Short Introduction
                        </label>
                        <textarea
                          id="comp-short-intro"
                          rows={2}
                          value={compForm.short_intro}
                          onChange={(e) =>
                            setCompForm((prev) => ({ ...prev, short_intro: e.target.value }))
                          }
                          placeholder="Concise introduction framing why these two residential markets are compared and what investors should notice..."
                          className="w-full p-3 border border-[#D6CEBE] rounded text-sm leading-relaxed"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="comp-reporting-period"
                          className="block text-xs font-semibold text-[#4A4843] mb-1"
                        >
                          Reporting Period
                        </label>
                        <input
                          id="comp-reporting-period"
                          type="text"
                          value={compForm.reporting_period}
                          onChange={(e) =>
                            setCompForm((prev) => ({ ...prev, reporting_period: e.target.value }))
                          }
                          placeholder="e.g., Q3 2026 or 2026"
                          className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="comp-granularity"
                          className="block text-xs font-semibold text-[#4A4843] mb-1"
                        >
                          Reporting Granularity
                        </label>
                        <select
                          id="comp-granularity"
                          value={compForm.reporting_granularity}
                          onChange={(e) =>
                            setCompForm((prev) => ({
                              ...prev,
                              reporting_granularity: e.target.value as MarketDataPeriodType,
                            }))
                          }
                          className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm bg-white"
                        >
                          <option value="month">Monthly</option>
                          <option value="quarter">Quarterly</option>
                          <option value="year">Annual</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="comp-last-verified"
                          className="block text-xs font-semibold text-[#4A4843] mb-1"
                        >
                          Last Verified Date
                        </label>
                        <input
                          id="comp-last-verified"
                          type="date"
                          value={compForm.last_verified_at || ''}
                          onChange={(e) =>
                            setCompForm((prev) => ({ ...prev, last_verified_at: e.target.value }))
                          }
                          className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono"
                        />
                      </div>

                      <div className="sm:col-span-3 flex items-center gap-2 pt-1">
                        <input
                          id="comp-featured"
                          type="checkbox"
                          checked={compForm.is_featured}
                          onChange={(e) =>
                            setCompForm((prev) => ({ ...prev, is_featured: e.target.checked }))
                          }
                          className="w-4 h-4"
                        />
                        <label htmlFor="comp-featured" className="text-xs font-semibold text-[#141413]">
                          Featured Comparison (prioritized in Global Markets featured comparison shelf)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: City A (Completely Independent) */}
                  <ComparisonCityEditorSection
                    slot="A"
                    city={compForm.city_a}
                    onChange={updateCityA}
                  />

                  {/* Section 3: City B (Completely Independent) */}
                  <ComparisonCityEditorSection
                    slot="B"
                    city={compForm.city_b}
                    onChange={updateCityB}
                  />

                  {/* Section 4: Social Media Sharing Image (URL Input Only) */}
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-widest font-semibold text-[#5C5A55] border-b border-[#E5E0D8] pb-2">
                      4. Social Media Sharing Image
                    </h3>
                    <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8] rounded space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-[#141413]">
                            Open Graph &amp; Social Link Preview URL
                          </p>
                          <p className="text-[11px] text-[#5C5A55] mt-0.5">
                            Paste a publicly accessible HTTPS image URL (recommended 1200 &times; 630). Falls back to City A image, City B image, or site OG default if blank.
                          </p>
                        </div>
                        {(compForm.social_image || compForm.social_image_alt) && (
                          <button
                            type="button"
                            onClick={() => {
                              setCompSocialPreviewError(false);
                              setCompForm((prev) => ({
                                ...prev,
                                social_image: '',
                                social_image_alt: '',
                              }));
                            }}
                            className="min-h-[36px] px-2.5 py-1 text-xs font-semibold text-[#991B1B] hover:underline cursor-pointer"
                          >
                            Clear URL
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        {compForm.social_image?.trim() &&
                        isValidHttpsUrl(compForm.social_image) &&
                        !compSocialPreviewError ? (
                          <img
                            src={compForm.social_image.trim()}
                            alt={
                              compForm.social_image_alt?.trim() ||
                              compForm.title ||
                              'Social sharing image preview'
                            }
                            referrerPolicy="no-referrer"
                            onError={() => setCompSocialPreviewError(true)}
                            className="w-full aspect-[1.91/1] object-cover rounded border border-[#E5E0D8] bg-[#EBE6DF]"
                          />
                        ) : (
                          <div className="w-full aspect-[1.91/1] rounded border border-dashed border-[#D6CEBE] bg-white px-3 flex items-center justify-center text-center text-[11px] text-[#7A7770]">
                            {compForm.social_image?.trim()
                              ? !isValidHttpsUrl(compForm.social_image)
                                ? 'Enter a valid https:// image URL to preview'
                                : 'Preview could not be loaded from URL'
                              : compSocialResolved.source === 'city_a'
                              ? `Fallback: ${compForm.city_a.city_name || 'City A'} image`
                              : compSocialResolved.source === 'city_b'
                              ? `Fallback: ${compForm.city_b.city_name || 'City B'} image`
                              : 'Defaults to site-wide OG image'}
                          </div>
                        )}

                        <div className="sm:col-span-2 space-y-2.5">
                          <div>
                            <label
                              htmlFor="comp-social-image-url"
                              className="block text-[11px] font-semibold text-[#5C5A55] mb-1"
                            >
                              Social Sharing Image URL (Optional)
                            </label>
                            <input
                              id="comp-social-image-url"
                              type="url"
                              value={compForm.social_image || ''}
                              onChange={(e) => {
                                setCompSocialPreviewError(false);
                                setCompForm((prev) => ({
                                  ...prev,
                                  social_image: e.target.value,
                                }));
                              }}
                              placeholder="https://example.com/images/city-comparison-1200x630.jpg"
                              className="w-full h-9 px-3 bg-white border border-[#D6CEBE] rounded text-xs font-mono"
                            />
                            {compForm.social_image?.trim() &&
                              !isValidHttpsUrl(compForm.social_image) && (
                                <p className="mt-1 text-[11px] text-[#991B1B]">
                                  Enter an absolute HTTPS URL starting with https://
                                </p>
                              )}
                          </div>
                          <div>
                            <label
                              htmlFor="comp-social-image-alt"
                              className="block text-[11px] font-semibold text-[#5C5A55] mb-1"
                            >
                              Social Sharing Image Alt Text (Optional)
                            </label>
                            <input
                              id="comp-social-image-alt"
                              type="text"
                              value={compForm.social_image_alt || ''}
                              onChange={(e) =>
                                setCompForm((prev) => ({
                                  ...prev,
                                  social_image_alt: e.target.value,
                                }))
                              }
                              placeholder="Descriptive alt text for social link previews"
                              className="w-full h-9 px-3 bg-white border border-[#D6CEBE] rounded text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 5: SEO & Canonical URL */}
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-widest font-semibold text-[#5C5A55] border-b border-[#E5E0D8] pb-2">
                      5. Search Engine Optimization &amp; Canonical URL
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="comp-slug"
                          className="block text-xs font-semibold text-[#4A4843] mb-1"
                        >
                          Comparison Slug
                        </label>
                        <input
                          id="comp-slug"
                          type="text"
                          value={compForm.slug || ''}
                          onChange={(e) => {
                            setCompSlugTouched(true);
                            setCompForm((prev) => ({
                              ...prev,
                              slug: slugifyMarketSegment(e.target.value),
                            }));
                          }}
                          placeholder="dubai-vs-london-property-market"
                          className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="comp-seo-title"
                          className="block text-xs font-semibold text-[#4A4843] mb-1"
                        >
                          SEO Title (Optional Override)
                        </label>
                        <input
                          id="comp-seo-title"
                          type="text"
                          value={compForm.seo_title || ''}
                          onChange={(e) =>
                            setCompForm((prev) => ({ ...prev, seo_title: e.target.value }))
                          }
                          placeholder="Defaults to Comparison Title | AmaanEstate"
                          className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="comp-canonical-url"
                          className="block text-xs font-semibold text-[#4A4843] mb-1"
                        >
                          Canonical URL (Optional Override)
                        </label>
                        <input
                          id="comp-canonical-url"
                          type="url"
                          value={compForm.canonical_url || ''}
                          onChange={(e) =>
                            setCompForm((prev) => ({ ...prev, canonical_url: e.target.value }))
                          }
                          placeholder={`https://www.amaanestate.com${previewComparisonUrl}`}
                          className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-xs font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="comp-seo-description"
                          className="block text-xs font-semibold text-[#4A4843] mb-1"
                        >
                          Meta Description (Optional Override)
                        </label>
                        <textarea
                          id="comp-seo-description"
                          rows={2}
                          value={compForm.seo_description || ''}
                          onChange={(e) =>
                            setCompForm((prev) => ({ ...prev, seo_description: e.target.value }))
                          }
                          placeholder="140-160 character summary for search snippets..."
                          className="w-full p-3 border border-[#D6CEBE] rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#E5E0D8] pt-4 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setEditorOpen(false)}
                      className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-[#FAF8F5] border border-[#D6CEBE] text-xs font-semibold rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-[#1E3A5F] hover:bg-[#142944] text-white text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
                    >
                      {saving
                        ? 'Saving...'
                        : compForm.id
                        ? 'Update Comparison'
                        : 'Save Comparison'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Free Authorized Public Data Sources Modal */}
      {sourcesModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Authorized Public Real Estate Data Sources"
          className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
        >
          <div className="bg-white border border-[#E5E0D8] rounded-none sm:rounded w-full max-w-3xl min-h-[100dvh] sm:min-h-0 sm:max-h-[90vh] overflow-y-auto p-4 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-[#E5E0D8] pb-4 gap-3 sm:gap-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
                  Zero-Cost Authorized Data Architecture
                </p>
                <h2 className="text-lg sm:text-xl font-serif font-semibold text-[#141413]">
                  Free Public Statistical &amp; Central Bank Sources
                </h2>
                <p className="text-xs text-[#5C5A55] mt-1">
                  All staged imports enter exclusively as <strong>Draft</strong> for editorial verification. Paid APIs and unauthorized scraping are disabled.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSourcesModalOpen(false)}
                aria-label="Close sources modal"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[#5C5A55] hover:text-[#141413] cursor-pointer shrink-0 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {AUTHORIZED_PUBLIC_DATA_SOURCES.map((src) => (
                <div
                  key={src.id}
                  className="p-4 border border-[#E5E0D8] rounded bg-[#FAF8F5] space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-serif font-semibold text-[#141413]">
                      {src.name}
                    </h3>
                    <a
                      href={src.officialPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#1E3A5F] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Official Portal</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <p className="text-xs text-[#4A4843]">{src.notes}</p>
                  <p className="text-[11px] text-[#5C5A55]">
                    <strong>Coverage:</strong> {src.coverage} · <strong>Attribution:</strong>{' '}
                    {src.licenseAndAttribution}
                  </p>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleStageFromSource}
              className="border-t border-[#E5E0D8] pt-5 space-y-4"
            >
              <h3 className="text-xs uppercase tracking-widest font-semibold text-[#141413]">
                Stage New Attributed Draft Record
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                    Public Data Source
                  </label>
                  <select
                    value={stagingSourceType}
                    onChange={(e) =>
                      setStagingSourceType(
                        e.target.value as Exclude<
                          MarketDataSourceType,
                          'manual' | 'other_authorized'
                        >
                      )
                    }
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-xs bg-white"
                  >
                    {AUTHORIZED_PUBLIC_DATA_SOURCES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shortName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                    Target Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={stagingCountry}
                    onChange={(e) => setStagingCountry(e.target.value)}
                    placeholder="e.g., United Kingdom"
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                    City (Optional)
                  </label>
                  <input
                    type="text"
                    value={stagingCity}
                    onChange={(e) => setStagingCity(e.target.value)}
                    placeholder="Leave blank for country"
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setSourcesModalOpen(false)}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-[#FAF8F5] border border-[#D6CEBE] text-xs font-semibold rounded cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={stagingBusy}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2 bg-[#1E3A5F] hover:bg-[#142944] text-white text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
                >
                  {stagingBusy ? 'Staging Draft...' : 'Stage Draft in Editor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cover Image Media Picker */}
      <MediaPickerModal
        open={mediaPickerOpen}
        title="Select Global Market Cover Image"
        media={media}
        onClose={() => setMediaPickerOpen(false)}
        onMediaAdded={onMediaAdded}
        onSelect={({ url, altText }) => {
          setForm((prev) => ({
            ...prev,
            cover_image: url,
            cover_image_alt: prev.cover_image_alt || altText,
          }));
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={
          deleteTarget?.kind === 'comparison'
            ? 'Delete Two-City Comparison'
            : 'Delete Market Report'
        }
        description={
          deleteTarget
            ? deleteTarget.kind === 'comparison'
              ? `Permanently delete "${deleteTarget.comparison.title}" (${deleteTarget.comparison.city_a.city_name} vs ${deleteTarget.comparison.city_b.city_name})? This action cannot be undone.`
              : `Permanently delete "${deleteTarget.report.title}" (${deleteTarget.report.country_name})? This action cannot be undone.`
            : ''
        }
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
