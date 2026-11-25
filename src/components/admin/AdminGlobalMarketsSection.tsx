import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Archive,
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
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import 'flag-icons/css/flag-icons.min.css';
import {
  GlobalMarketReport,
  MarketDataPeriodType,
  MarketDataSourceType,
  MarketTrendDirection,
  MediaItem,
  PublicationStatus,
} from '../../types';
import { normalizeCountryInfo } from '../../lib/countries';
import {
  deriveCountrySlug,
  formatMarketCurrency,
  formatMarketDateLabel,
  formatMarketTrend,
  getMarketPublishReadiness,
  slugifyMarketSegment,
} from '../../lib/globalMarkets';
import { AUTHORIZED_PUBLIC_DATA_SOURCES } from '../../lib/marketDataSources';
import {
  SaveGlobalMarketInput,
  deleteGlobalMarket,
  saveGlobalMarket,
  stageDraftFromPublicSource,
  updateGlobalMarketStatus,
} from '../../services/globalMarketsService';
import { resolveEditorialImage } from '../../lib/editorialImages';
import MediaPickerModal from './MediaPickerModal';
import ConfirmDialog from './ConfirmDialog';
import { toast } from 'sonner';

interface AdminGlobalMarketsSectionProps {
  reports: GlobalMarketReport[];
  media: MediaItem[];
  schemaPending: boolean;
  onMediaAdded: (item: MediaItem) => void;
  onRefresh: () => Promise<void>;
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
  status: 'draft',
  is_featured: false,
  seo_title: '',
  seo_description: '',
  canonical_url: '',
};

export default function AdminGlobalMarketsSection({
  reports,
  media,
  schemaPending,
  onMediaAdded,
  onRefresh,
}: AdminGlobalMarketsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PublicationStatus>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'country' | 'city'>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<SaveGlobalMarketInput>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GlobalMarketReport | null>(null);
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
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [reports]);

  const filteredReports = useMemo(() => {
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
  }, [reports, statusFilter, levelFilter, countryFilter, searchTerm]);

  const stats = useMemo(() => {
    const published = reports.filter((r) => r.status === 'published');
    const drafts = reports.filter((r) => r.status === 'draft');
    const featured = reports.filter((r) => r.status === 'published' && r.is_featured);
    const countries = new Set(published.map((r) => r.country_slug).filter(Boolean));
    return {
      total: reports.length,
      published: published.length,
      drafts: drafts.length,
      featured: featured.length,
      countries: countries.size,
    };
  }, [reports]);

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
        canonical_url: form.canonical_url,
      }),
    [form]
  );

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

  const openCreateModal = () => {
    setForm({
      ...EMPTY_FORM,
      last_verified_at: new Date().toISOString().slice(0, 10),
    });
    setSlugTouched(false);
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
      status: report.status,
      is_featured: report.is_featured,
      seo_title: report.seo_title || '',
      seo_description: report.seo_description || '',
      canonical_url: report.canonical_url || '',
      published_at: report.published_at || null,
    });
    setSlugTouched(true);
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
      slug: slugTouched
        ? prev.slug
        : slugifyMarketSegment(prev.city_name?.trim() ? `${prev.city_name}-${value}` : value),
    }));
  };

  const handleCityChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      city_name: value,
      slug:
        !slugTouched && !prev.id
          ? slugifyMarketSegment(
              value.trim()
                ? prev.title.trim()
                  ? `${value.trim()}-${prev.title}`
                  : value
                : prev.title || prev.country_slug
            )
          : prev.slug,
    }));
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

  const handleStatusChange = async (report: GlobalMarketReport, nextStatus: PublicationStatus) => {
    const res = await updateGlobalMarketStatus(report, nextStatus);
    if (!res.success) {
      toast.error(res.error || `Unable to move report to ${nextStatus}.`);
      return;
    }
    toast.success(`"${report.title}" marked as ${nextStatus}.`);
    await onRefresh();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await deleteGlobalMarket(deleteTarget.id);
    setDeleting(false);

    if (!res.success) {
      toast.error(res.error || 'Unable to delete market report.');
      return;
    }
    toast.success(`Deleted "${deleteTarget.title}".`);
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
    setEditorOpen(true);
    if (res.note) {
      toast.success(res.note);
    }
  };

  const previewCountrySlug =
    slugifyMarketSegment(form.country_slug) || deriveCountrySlug(form.country_name) || 'country';
  const previewReportSlug =
    slugifyMarketSegment(form.slug || form.title) || 'market-report';
  const previewPublicUrl = form.city_name?.trim()
    ? `/global-markets/${previewCountrySlug}/${previewReportSlug}`
    : `/global-markets/${previewCountrySlug}`;

  const cleanIsoPreview = (form.country_code || '').trim().toLowerCase();
  const hasIsoFlag = /^[a-z]{2}$/.test(cleanIsoPreview);

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
            onClick={openCreateModal}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#142944] text-white text-xs font-semibold rounded inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Plus size={15} />
            <span>New Market Report</span>
          </button>
        </div>
      </div>

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
            Published Reports
          </p>
          <p className="text-xl sm:text-2xl font-serif font-semibold tabular-nums text-[#141413]">
            {stats.published}
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
      <div className="bg-white border border-[#E5E0D8] rounded p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
        {filteredReports.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Globe2 size={28} className="mx-auto text-[#8C4A27]" strokeWidth={1.5} />
            <p className="text-sm text-[#5C5A55]">
              {reports.length === 0
                ? 'No global market intelligence reports created yet.'
                : 'No market reports match your active filters.'}
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded cursor-pointer"
            >
              Create First Market Report
            </button>
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
                const publicHref =
                  report.market_level === 'city' && report.city_name
                    ? `/global-markets/${encodeURIComponent(report.country_slug)}/${encodeURIComponent(report.slug)}`
                    : `/global-markets/${encodeURIComponent(report.country_slug)}`;

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
                        onClick={() => setDeleteTarget(report)}
                        aria-label={`Delete ${report.title}`}
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
                    const publicHref =
                      report.market_level === 'city' && report.city_name
                        ? `/global-markets/${encodeURIComponent(report.country_slug)}/${encodeURIComponent(report.slug)}`
                        : `/global-markets/${encodeURIComponent(report.country_slug)}`;

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
                              onClick={() => setDeleteTarget(report)}
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
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Create / Edit Global Market Report Modal */}
      {editorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={form.id ? 'Edit Market Report' : 'Create Market Report'}
          className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
        >
          <div className="bg-white border border-[#E5E0D8] rounded-none sm:rounded w-full max-w-4xl min-w-0 min-h-[100dvh] sm:min-h-0 sm:max-h-[92vh] overflow-y-auto overflow-x-hidden p-4 sm:p-8 space-y-6 my-0 sm:my-6">
            <div className="flex items-start justify-between border-b border-[#E5E0D8] pb-4 gap-3 sm:gap-4 min-w-0">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
                  Global Markets Editor
                </p>
                <h2 className="text-lg sm:text-xl font-serif font-semibold text-[#141413]">
                  {form.id ? 'Edit Market Intelligence Report' : 'Create Market Intelligence Report'}
                </h2>
                <p className="text-xs font-mono text-[#5C5A55] mt-1 break-all">
                  Public URL: https://www.amaanestate.com{previewPublicUrl}
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

              {/* Section 5: SEO & URL Slugs */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-[#5C5A55] border-b border-[#E5E0D8] pb-2">
                  5. Search Engine Optimization &amp; Canonical URL
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
        title="Delete Market Report"
        description={
          deleteTarget
            ? `Permanently delete "${deleteTarget.title}" (${deleteTarget.country_name})? This action cannot be undone.`
            : ''
        }
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
