import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Globe,
  Link2,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Unplug,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Article,
  Category,
  GscAnalyticsResponse,
  GscStatusResponse,
  Property,
  SeoAuditRun,
  SeoRedirect,
} from '../../types';
import { analyzeArticleSeo, ArticleSeoAnalysisResult } from '../../lib/seoAnalyzer';
import { computeIncomingArticleLinks } from '../../lib/internalLinker';
import {
  createSeoRedirect,
  deleteSeoRedirect,
  disconnectGsc,
  fetchGscAnalytics,
  fetchGscAuthUrl,
  fetchGscSitemaps,
  fetchGscStatus,
  fetchLatestSeoAudit,
  fetchSeoRedirects,
  inspectGscUrl,
  LegacyRedirectBuiltIn,
  runSiteSeoAudit,
  selectGscSite,
  updateSeoRedirect,
} from '../../services/seoService';
import { toast } from 'sonner';

interface SeoDashboardSectionProps {
  articles: Article[];
  properties: Property[];
  categories: Category[];
  onEditArticle: (article: Article) => void;
}

type SeoDashboardTab =
  | 'overview'
  | 'performance'
  | 'indexing'
  | 'audit'
  | 'content';

type ContentFilter =
  | 'all'
  | 'strong'
  | 'needs-work'
  | 'critical'
  | 'missing-meta'
  | 'no-links'
  | 'orphan'
  | 'stale';

interface ScoredArticleRow {
  article: Article;
  analysis: ArticleSeoAnalysisResult;
  incomingLinks: number;
  isStale: boolean;
}

export default function SeoDashboardSection({
  articles,
  properties,
  categories,
  onEditArticle,
}: SeoDashboardSectionProps) {
  const [activeTab, setActiveTab] = useState<SeoDashboardTab>('overview');

  // Redirects state
  const [redirects, setRedirects] = useState<SeoRedirect[]>([]);
  const [builtInLegacy, setBuiltInLegacy] = useState<LegacyRedirectBuiltIn[]>([]);
  const [redirectSchemaPending, setRedirectSchemaPending] = useState(false);
  const [newSourcePath, setNewSourcePath] = useState('');
  const [newTargetPath, setNewTargetPath] = useState('');
  const [newStatusCode, setNewStatusCode] = useState<301 | 302>(301);
  const [newRedirectNotes, setNewRedirectNotes] = useState('');
  const [savingRedirect, setSavingRedirect] = useState(false);

  // Audit state
  const [auditRun, setAuditRun] = useState<SeoAuditRun | null>(null);
  const [runningAudit, setRunningAudit] = useState(false);
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'passed'>('all');

  // GSC state
  const [gscStatus, setGscStatus] = useState<(GscStatusResponse & { schemaPending?: boolean }) | null>(null);
  const [gscAnalytics, setGscAnalytics] = useState<GscAnalyticsResponse | null>(null);
  const [gscSitemaps, setGscSitemaps] = useState<Array<Record<string, any>>>([]);
  const [gscDateRange, setGscDateRange] = useState<'7d' | '28d' | '90d'>('28d');
  const [gscCountryFilter, setGscCountryFilter] = useState('');
  const [gscQueryFilter, setGscQueryFilter] = useState('');
  const [loadingGsc, setLoadingGsc] = useState(false);
  const [connectingGsc, setConnectingGsc] = useState(false);

  // URL Inspection state
  const [inspectInputUrl, setInspectInputUrl] = useState('');
  const [inspectingUrl, setInspectingUrl] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<Record<string, any> | null>(null);

  // Content SEO filters
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');
  const [contentSearch, setContentSearch] = useState('');

  // Score every article client-side using real catalog
  const scoredArticles: ScoredArticleRow[] = useMemo(() => {
    const incomingMap = computeIncomingArticleLinks(articles);
    const staleThresholdMs = Date.now() - 180 * 24 * 60 * 60 * 1000;
    const catalog = { articles, properties, categories };

    return articles.map((art) => {
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

      const refDateMs = Date.parse(art.updated_at || art.published_at || art.created_at);
      const isStale = !Number.isNaN(refDateMs) && refDateMs < staleThresholdMs;

      return {
        article: art,
        analysis,
        incomingLinks: incomingMap.get(art.id) || 0,
        isStale,
      };
    });
  }, [articles, properties, categories]);

  const overviewStats = useMemo(() => {
    const published = scoredArticles.filter((r) => r.article.status === 'published');
    const noindex = published.filter((r) =>
      (r.article.robots_directive || 'index, follow').startsWith('noindex')
    );
    const indexablePublished = published.filter(
      (r) => !(r.article.robots_directive || 'index, follow').startsWith('noindex')
    );
    const avgScore =
      published.length > 0
        ? Math.round(published.reduce((sum, r) => sum + r.analysis.score, 0) / published.length)
        : 0;
    const missingMeta = published.filter(
      (r) => !r.article.seo_description && (!r.article.excerpt || r.article.excerpt.length < 70)
    );
    const orphanCount = published.filter((r) => r.incomingLinks === 0).length;
    const brokenLinksTotal = published.reduce(
      (sum, r) => sum + r.analysis.metrics.brokenInternalLinksCount,
      0
    );
    const activeProperties = properties.filter(
      (p) =>
        p.publication_status === 'published' &&
        !p.is_sample &&
        ['available', 'pending', 'under_contract'].includes(p.listing_status)
    );

    return {
      publishedCount: published.length,
      indexableCount: indexablePublished.length,
      noindexCount: noindex.length,
      avgScore,
      missingMetaCount: missingMeta.length,
      orphanCount,
      brokenLinksTotal,
      activePropertiesCount: activeProperties.length,
    };
  }, [scoredArticles, properties]);

  const loadRedirects = useCallback(async () => {
    try {
      const res = await fetchSeoRedirects();
      setRedirects(res.redirects || []);
      setBuiltInLegacy(res.builtInLegacy || []);
      setRedirectSchemaPending(Boolean(res.schemaPending));
    } catch {
      // ignore initial error if offline
    }
  }, []);

  const loadLatestAudit = useCallback(async () => {
    try {
      const res = await fetchLatestSeoAudit();
      if (res.audit) setAuditRun(res.audit);
    } catch {
      // ignore
    }
  }, []);

  const loadGscOverview = useCallback(async () => {
    setLoadingGsc(true);
    try {
      const statusRes = await fetchGscStatus();
      setGscStatus(statusRes);
      if (statusRes.connected && statusRes.selectedSiteUrl) {
        const [analyticsRes, smRes] = await Promise.all([
          fetchGscAnalytics({
            dateRange: gscDateRange,
            siteUrl: statusRes.selectedSiteUrl,
            country: gscCountryFilter || undefined,
            queryFilter: gscQueryFilter || undefined,
          }),
          fetchGscSitemaps().catch(() => ({ connected: true, sitemaps: [] })),
        ]);
        setGscAnalytics(analyticsRes);
        setGscSitemaps(smRes.sitemaps || []);
      } else {
        setGscAnalytics(null);
        setGscSitemaps([]);
      }
    } catch {
      // keep clean unconnected UI
    } finally {
      setLoadingGsc(false);
    }
  }, [gscDateRange, gscCountryFilter, gscQueryFilter]);

  useEffect(() => {
    loadRedirects();
    loadLatestAudit();
    loadGscOverview();
  }, [loadRedirects, loadLatestAudit, loadGscOverview]);

  // Listen for OAuth popup completion
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin || '';
      const isTrustedOrigin =
        origin === window.location.origin ||
        origin.endsWith('.run.app') ||
        origin.endsWith('.amaanestate.com') ||
        origin === 'https://amaanestate.com' ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1');
      if (!isTrustedOrigin) {
        return;
      }
      if (event.data?.type === 'GSC_OAUTH_SUCCESS') {
        toast.success(
          event.data.email
            ? `Connected Google Search Console (${event.data.email}).`
            : 'Connected Google Search Console.'
        );
        setConnectingGsc(false);
        loadGscOverview();
      } else if (event.data?.type === 'GSC_OAUTH_ERROR') {
        toast.error(event.data.error || 'Google Search Console authorization failed.');
        setConnectingGsc(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loadGscOverview]);

  const handleConnectGsc = async () => {
    setConnectingGsc(true);
    try {
      const { url } = await fetchGscAuthUrl();
      const popup = window.open(url, 'amaanestate_gsc_oauth', 'width=560,height=680');
      if (!popup) {
        setConnectingGsc(false);
        toast.error('Popup was blocked. Please allow popups for AmaanEstate to connect Google Search Console.');
      }
    } catch (err: any) {
      setConnectingGsc(false);
      toast.error(err?.message || 'Unable to start Google Search Console OAuth.');
    }
  };

  const handleDisconnectGsc = async () => {
    try {
      await disconnectGsc();
      setGscStatus((prev) => (prev ? { ...prev, connected: false, selectedSiteUrl: null } : null));
      setGscAnalytics(null);
      toast.success('Disconnected Google Search Console.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to disconnect.');
    }
  };

  const handleSelectSite = async (siteUrl: string) => {
    try {
      await selectGscSite(siteUrl);
      await loadGscOverview();
      toast.success(`Switched active Search Console property to ${siteUrl}.`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to switch property.');
    }
  };

  const handleRunAudit = async () => {
    setRunningAudit(true);
    try {
      const res = await runSiteSeoAudit();
      setAuditRun(res.audit);
      toast.success(
        `SEO audit complete: ${res.audit.summary.criticalCount} critical, ${res.audit.summary.warningCount} warnings.`
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to execute SEO audit.');
    } finally {
      setRunningAudit(false);
    }
  };

  const handleCreateRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourcePath.trim() || !newTargetPath.trim()) {
      toast.error('Both source path and destination path are required.');
      return;
    }
    setSavingRedirect(true);
    try {
      const res = await createSeoRedirect({
        source_path: newSourcePath.trim(),
        target_path: newTargetPath.trim(),
        status_code: newStatusCode,
        notes: newRedirectNotes.trim(),
      });
      setRedirects((prev) => [res.redirect, ...prev]);
      setNewSourcePath('');
      setNewTargetPath('');
      setNewRedirectNotes('');
      toast.success(`${res.redirect.status_code} redirect saved: ${res.redirect.source_path}`);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to create redirect rule.');
    } finally {
      setSavingRedirect(false);
    }
  };

  const handleToggleRedirect = async (redir: SeoRedirect) => {
    try {
      const res = await updateSeoRedirect(redir.id, { is_active: !redir.is_active });
      setRedirects((prev) => prev.map((r) => (r.id === redir.id ? res.redirect : r)));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update redirect.');
    }
  };

  const handleDeleteRedirect = async (id: string) => {
    try {
      await deleteSeoRedirect(id);
      setRedirects((prev) => prev.filter((r) => r.id !== id));
      toast.success('Redirect rule deleted.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete redirect.');
    }
  };

  const handleInspectUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectInputUrl.trim()) return;
    setInspectingUrl(true);
    setInspectionResult(null);
    try {
      const res = await inspectGscUrl(inspectInputUrl.trim());
      setInspectionResult(res.inspectionResult);
    } catch (err: any) {
      toast.error(err?.message || 'URL Inspection failed.');
    } finally {
      setInspectingUrl(false);
    }
  };

  const filteredContentRows = useMemo(() => {
    const q = contentSearch.trim().toLowerCase();
    return scoredArticles
      .filter((row) => {
        if (q) {
          const hit =
            row.article.title.toLowerCase().includes(q) ||
            row.article.slug.toLowerCase().includes(q) ||
            (row.article.focus_keyword || '').toLowerCase().includes(q);
          if (!hit) return false;
        }

        switch (contentFilter) {
          case 'strong':
            return row.analysis.score >= 80;
          case 'needs-work':
            return row.analysis.score >= 50 && row.analysis.score < 80;
          case 'critical':
            return row.analysis.score < 50;
          case 'missing-meta':
            return !row.article.seo_description || !row.article.seo_title;
          case 'no-links':
            return row.analysis.metrics.internalLinksCount === 0;
          case 'orphan':
            return row.article.status === 'published' && row.incomingLinks === 0;
          case 'stale':
            return row.isStale;
          default:
            return true;
        }
      })
      .sort((a, b) => a.analysis.score - b.analysis.score);
  }, [scoredArticles, contentFilter, contentSearch]);

  const filteredAuditIssues = useMemo(() => {
    if (!auditRun) return [];
    if (auditSeverityFilter === 'all') return auditRun.issues;
    return auditRun.issues.filter((i) => i.severity === auditSeverityFilter);
  }, [auditRun, auditSeverityFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E0D8] rounded p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest font-semibold text-[#8C4A27]">
            AmaanEstate Search Intelligence
          </div>
          <h1 className="text-2xl font-serif font-semibold text-[#141413]">
            SEO Command Center &amp; Search Console
          </h1>
          <p className="text-xs text-[#5C5A55] mt-1">
            Real-time editorial SEO scoring, technical site audit, HTTP 301/302 redirect rules, sitemap hygiene, and Google Search Console analytics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D6CEBE] rounded text-xs font-semibold text-[#141413] inline-flex items-center gap-1.5"
          >
            <ExternalLink size={13} />
            <span>sitemap.xml</span>
          </a>
          <button
            type="button"
            disabled={runningAudit}
            onClick={handleRunAudit}
            className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#162C49] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Play size={13} />
            <span>{runningAudit ? 'Auditing...' : 'Run Technical SEO Audit'}</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="bg-white border border-[#E5E0D8] rounded px-4 flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'performance', label: 'Search Performance (GSC)' },
          { id: 'indexing', label: 'Indexing & Sitemaps' },
          { id: 'audit', label: 'Technical Audit & Redirects' },
          { id: 'content', label: `Content SEO (${articles.length})` },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SeoDashboardTab)}
              className={`px-3.5 py-3.5 text-xs font-semibold border-b-2 whitespace-nowrap cursor-pointer ${
                active
                  ? 'border-[#1E3A5F] text-[#1E3A5F]'
                  : 'border-transparent text-[#5C5A55] hover:text-[#141413]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E5E0D8] rounded p-5 space-y-1">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
                Avg Article SEO Score
              </div>
              <div
                className={`text-2xl font-mono font-bold tabular-nums ${
                  overviewStats.avgScore >= 80
                    ? 'text-[#16A34A]'
                    : overviewStats.avgScore >= 55
                    ? 'text-[#D97706]'
                    : 'text-[#DC2626]'
                }`}
              >
                {overviewStats.avgScore}/100
              </div>
              <div className="text-xs text-[#7A7770] font-mono tabular-nums">
                Across {overviewStats.publishedCount} published articles
              </div>
            </div>

            <div className="bg-white border border-[#E5E0D8] rounded p-5 space-y-1">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
                Sitemap Indexable URLs
              </div>
              <div className="text-2xl font-mono font-bold tabular-nums text-[#141413]">
                {(
                  overviewStats.indexableCount +
                  overviewStats.activePropertiesCount +
                  categories.length +
                  11
                ).toLocaleString()}
              </div>
              <div className="text-xs text-[#7A7770] font-mono tabular-nums">
                {overviewStats.noindexCount} noindex excluded
              </div>
            </div>

            <div className="bg-white border border-[#E5E0D8] rounded p-5 space-y-1">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
                Orphan &amp; Thin Meta
              </div>
              <div className="text-2xl font-mono font-bold tabular-nums text-[#D97706]">
                {overviewStats.orphanCount} / {overviewStats.missingMetaCount}
              </div>
              <div className="text-xs text-[#7A7770]">Orphan articles / Weak meta desc</div>
            </div>

            <div className="bg-white border border-[#E5E0D8] rounded p-5 space-y-1">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
                Active Redirect Rules
              </div>
              <div className="text-2xl font-mono font-bold tabular-nums text-[#1E3A5F]">
                {(redirects.filter((r) => r.is_active).length + builtInLegacy.length).toLocaleString()}
              </div>
              <div className="text-xs text-[#7A7770] font-mono tabular-nums">
                {redirects.length} custom · {builtInLegacy.length} legacy /news/
              </div>
            </div>
          </div>

          {/* Search Console Connection Banner */}
          <div className="bg-white border border-[#E5E0D8] rounded p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-[#1E3A5F]" />
                <h2 className="text-base font-serif font-semibold text-[#141413]">
                  Google Search Console Status
                </h2>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    gscStatus?.connected
                      ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                      : 'bg-[#FAF8F5] text-[#5C5A55] border border-[#D6CEBE]'
                  }`}
                >
                  {gscStatus?.connected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              {gscStatus?.connected ? (
                <p className="text-xs text-[#5C5A55]">
                  Account: <strong>{gscStatus.googleEmail || 'Authorized Google Account'}</strong> · Active
                  Property: <code className="font-mono">{gscStatus.selectedSiteUrl || 'Select property'}</code>
                </p>
              ) : (
                <p className="text-xs text-[#5C5A55]">
                  Connect Google Search Console via OAuth to view real organic clicks, impressions, top queries, CTR opportunities, and URL Inspection status. No placeholder metrics are ever shown.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {gscStatus?.connected ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('performance')}
                  className="px-4 py-2 bg-[#1E3A5F] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View Search Performance</span>
                  <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={connectingGsc}
                  onClick={() => setActiveTab('performance')}
                  className="px-4 py-2 bg-[#1E3A5F] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Setup Search Console</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Lowest-Scoring Articles Needing Attention */}
          <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
              <div>
                <h2 className="text-base font-serif font-semibold text-[#141413]">
                  Priority Articles to Optimize
                </h2>
                <p className="text-xs text-[#5C5A55]">
                  Lowest real-time SEO scores across your live editorial catalog.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className="text-xs font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
              >
                View All Content SEO →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[11px] uppercase tracking-wider text-[#5C5A55]">
                  <tr>
                    <th className="px-5 py-3">Article</th>
                    <th className="px-4 py-3">SEO Score</th>
                    <th className="px-4 py-3">Focus Keyword</th>
                    <th className="px-4 py-3">Internal Links</th>
                    <th className="px-4 py-3">Incoming Links</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {[...scoredArticles]
                    .sort((a, b) => a.analysis.score - b.analysis.score)
                    .slice(0, 6)
                    .map(({ article, analysis, incomingLinks }) => (
                      <tr key={article.id} className="hover:bg-[#FAF8F5]">
                        <td className="px-5 py-3 max-w-xs">
                          <div className="font-semibold text-[#141413] truncate">{article.title}</div>
                          <div className="font-mono text-[11px] text-[#7A7770] truncate">
                            /articles/{article.slug}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold tabular-nums">
                          <span
                            className={
                              analysis.score >= 80
                                ? 'text-[#16A34A]'
                                : analysis.score >= 55
                                ? 'text-[#D97706]'
                                : 'text-[#DC2626]'
                            }
                          >
                            {analysis.score}/100
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#5C5A55]">
                          {article.focus_keyword || <span className="text-[#DC2626]">Not set</span>}
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums text-[#5C5A55]">
                          {analysis.metrics.internalLinksCount}
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums text-[#5C5A55]">
                          {incomingLinks === 0 && article.status === 'published' ? (
                            <span className="text-[#D97706]">0 (Orphan)</span>
                          ) : (
                            incomingLinks
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => onEditArticle(article)}
                            className="px-3 py-1.5 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded font-semibold text-[#141413] cursor-pointer"
                          >
                            Optimize
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SEARCH PERFORMANCE (GOOGLE SEARCH CONSOLE) */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {!gscStatus?.connected ? (
            <div className="bg-white border border-[#E5E0D8] rounded p-8 space-y-5">
              <div className="max-w-2xl space-y-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-[11px] font-semibold uppercase tracking-wider text-[#5C5A55]">
                  Google Search Console · Not Connected
                </span>
                <h2 className="text-xl font-serif font-semibold text-[#141413]">
                  Connect Your Verified Search Console Property
                </h2>
                <p className="text-sm text-[#5C5A55] leading-relaxed">
                  Authorize read-only access to Google Search Console (`webmasters.readonly`) to pull real clicks, impressions, CTR, average position, top queries, declining pages, and live URL indexing diagnostics for AmaanEstate.
                </p>
              </div>

              {gscStatus && !gscStatus.oauthConfigured && (
                <div className="p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded text-xs text-[#92400E] space-y-2">
                  <div className="font-semibold">Server OAuth Credentials Required</div>
                  <p>
                    Configure <code className="font-mono">GOOGLE_OAUTH_CLIENT_ID</code> and{' '}
                    <code className="font-mono">GOOGLE_OAUTH_CLIENT_SECRET</code> in your deployment environment variables, and register these authorized redirect URIs in Google Cloud Console:
                  </p>
                  <div className="font-mono bg-white border border-[#FDE68A] rounded px-3 py-2 text-[11px] text-[#141413] break-all space-y-1">
                    <div>Active: {gscStatus.callbackUrls.development}</div>
                    {gscStatus.callbackUrls.production &&
                      gscStatus.callbackUrls.production !== gscStatus.callbackUrls.development && (
                        <div>Production: {gscStatus.callbackUrls.production}</div>
                      )}
                  </div>
                </div>
              )}

              {gscStatus?.needsReconnect && (
                <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded text-xs text-[#991B1B]">
                  {gscStatus.message ||
                    'Your Google Search Console token expired or was revoked. Click Connect Google Search Console to re-authorize.'}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={connectingGsc}
                  onClick={handleConnectGsc}
                  className="px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#162C49] text-white rounded text-xs font-semibold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Globe size={14} />
                  <span>{connectingGsc ? 'Authorizing...' : 'Connect Google Search Console'}</span>
                </button>
                <button
                  type="button"
                  onClick={loadGscOverview}
                  className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D6CEBE] rounded text-xs font-semibold text-[#141413] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Refresh Status</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* GSC Controls Bar */}
              <div className="bg-white border border-[#E5E0D8] rounded p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] block mb-1">
                      Search Console Property
                    </label>
                    <select
                      value={gscStatus.selectedSiteUrl || ''}
                      onChange={(e) => handleSelectSite(e.target.value)}
                      className="h-9 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
                    >
                      {gscStatus.sites.map((s) => (
                        <option key={s.siteUrl} value={s.siteUrl}>
                          {s.siteUrl} ({s.permissionLevel})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] block mb-1">
                      Date Window
                    </label>
                    <div className="inline-flex border border-[#D6CEBE] rounded overflow-hidden bg-[#FAF8F5]">
                      {(['7d', '28d', '90d'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setGscDateRange(r)}
                          className={`px-3 h-9 text-xs font-mono font-semibold cursor-pointer ${
                            gscDateRange === r ? 'bg-[#1E3A5F] text-white' : 'text-[#5C5A55]'
                          }`}
                        >
                          {r.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] block mb-1">
                      Query Filter
                    </label>
                    <input
                      type="text"
                      value={gscQueryFilter}
                      onChange={(e) => setGscQueryFilter(e.target.value)}
                      placeholder="Filter by keyword..."
                      className="h-9 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] block mb-1">
                      Country (ISO-3)
                    </label>
                    <input
                      type="text"
                      value={gscCountryFilter}
                      onChange={(e) => setGscCountryFilter(e.target.value)}
                      placeholder="e.g. usa, gbr, are"
                      className="h-9 w-28 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={loadingGsc}
                    onClick={loadGscOverview}
                    className="px-3.5 h-9 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded text-xs font-semibold text-[#141413] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={13} className={loadingGsc ? 'animate-spin' : ''} />
                    <span>Sync</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectGsc}
                    className="px-3.5 h-9 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#991B1B] rounded text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Unplug size={13} />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>

              {gscAnalytics?.error && (
                <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded text-xs text-[#991B1B]">
                  {gscAnalytics.error}
                </div>
              )}

              {gscAnalytics && !gscAnalytics.error && (
                <>
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-[#E5E0D8] rounded p-5">
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
                        Organic Clicks
                      </div>
                      <div className="text-2xl font-mono font-bold tabular-nums text-[#141413] mt-1">
                        {gscAnalytics.totals.clicks.toLocaleString()}
                      </div>
                      <div className="text-xs text-[#7A7770] font-mono">
                        {gscAnalytics.periodStart} → {gscAnalytics.periodEnd}
                      </div>
                    </div>

                    <div className="bg-white border border-[#E5E0D8] rounded p-5">
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
                        Impressions
                      </div>
                      <div className="text-2xl font-mono font-bold tabular-nums text-[#141413] mt-1">
                        {gscAnalytics.totals.impressions.toLocaleString()}
                      </div>
                      <div className="text-xs text-[#7A7770] font-mono">
                        Prev: {(gscAnalytics.totals.prevImpressions || 0).toLocaleString()}
                      </div>
                    </div>

                    <div className="bg-white border border-[#E5E0D8] rounded p-5">
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
                        Average CTR
                      </div>
                      <div className="text-2xl font-mono font-bold tabular-nums text-[#1E3A5F] mt-1">
                        {(gscAnalytics.totals.ctr * 100).toFixed(2)}%
                      </div>
                    </div>

                    <div className="bg-white border border-[#E5E0D8] rounded p-5">
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
                        Average Position
                      </div>
                      <div className="text-2xl font-mono font-bold tabular-nums text-[#8C4A27] mt-1">
                        {gscAnalytics.totals.position.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  {/* Time Series Chart */}
                  {gscAnalytics.daily.length > 0 && (
                    <div className="bg-white border border-[#E5E0D8] rounded p-6 space-y-4">
                      <h3 className="text-base font-serif font-semibold text-[#141413]">
                        Daily Organic Clicks &amp; Impressions
                      </h3>
                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={gscAnalytics.daily}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5C5A55' }} />
                            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#1E3A5F' }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#8C4A27' }} />
                            <Tooltip />
                            <Area
                              yAxisId="left"
                              type="monotone"
                              dataKey="clicks"
                              stroke="#1E3A5F"
                              fill="#1E3A5F"
                              fillOpacity={0.14}
                              name="Clicks"
                            />
                            <Area
                              yAxisId="right"
                              type="monotone"
                              dataKey="impressions"
                              stroke="#8C4A27"
                              fill="#8C4A27"
                              fillOpacity={0.08}
                              name="Impressions"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Top Queries & Top Pages */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-[#E5E0D8] font-serif font-semibold text-sm text-[#141413]">
                        Top Search Queries
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[11px] uppercase text-[#5C5A55]">
                            <tr>
                              <th className="px-4 py-2.5">Query</th>
                              <th className="px-3 py-2.5 text-right">Clicks</th>
                              <th className="px-3 py-2.5 text-right">Impr.</th>
                              <th className="px-3 py-2.5 text-right">CTR</th>
                              <th className="px-4 py-2.5 text-right">Pos.</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5E0D8] font-mono tabular-nums">
                            {gscAnalytics.topQueries.map((q) => (
                              <tr key={q.query}>
                                <td className="px-4 py-2.5 font-sans text-[#141413]">{q.query}</td>
                                <td className="px-3 py-2.5 text-right">{q.clicks.toLocaleString()}</td>
                                <td className="px-3 py-2.5 text-right">{q.impressions.toLocaleString()}</td>
                                <td className="px-3 py-2.5 text-right">{(q.ctr * 100).toFixed(1)}%</td>
                                <td className="px-4 py-2.5 text-right">{q.position.toFixed(1)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-[#E5E0D8] font-serif font-semibold text-sm text-[#141413]">
                        Top Performing Pages
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[11px] uppercase text-[#5C5A55]">
                            <tr>
                              <th className="px-4 py-2.5">Page URL</th>
                              <th className="px-3 py-2.5 text-right">Clicks</th>
                              <th className="px-3 py-2.5 text-right">Impr.</th>
                              <th className="px-3 py-2.5 text-right">CTR</th>
                              <th className="px-4 py-2.5 text-right">Pos.</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5E0D8] font-mono tabular-nums">
                            {gscAnalytics.topPages.map((p) => (
                              <tr key={p.page}>
                                <td className="px-4 py-2.5 max-w-[240px] truncate text-[#1E3A5F]">
                                  {p.page}
                                </td>
                                <td className="px-3 py-2.5 text-right">{p.clicks.toLocaleString()}</td>
                                <td className="px-3 py-2.5 text-right">{p.impressions.toLocaleString()}</td>
                                <td className="px-3 py-2.5 text-right">{(p.ctr * 100).toFixed(1)}%</td>
                                <td className="px-4 py-2.5 text-right">{p.position.toFixed(1)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* High-Impression Low-CTR & Declining Pages */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-[#E5E0D8] font-serif font-semibold text-sm text-[#141413]">
                        CTR Optimization Opportunities (High Impressions, CTR &lt;3%)
                      </div>
                      <div className="divide-y divide-[#E5E0D8] text-xs">
                        {gscAnalytics.highImpressionLowCtr.length === 0 ? (
                          <div className="p-5 text-[#5C5A55]">No low-CTR high-impression pages flagged in this window.</div>
                        ) : (
                          gscAnalytics.highImpressionLowCtr.map((p) => (
                            <div key={p.page} className="px-5 py-3 flex items-center justify-between gap-3">
                              <span className="font-mono text-[#141413] truncate">{p.page}</span>
                              <span className="font-mono tabular-nums text-[#D97706] shrink-0">
                                {p.impressions.toLocaleString()} impr · {(p.ctr * 100).toFixed(2)}% CTR
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-[#E5E0D8] font-serif font-semibold text-sm text-[#141413]">
                        Declining Pages (Period-over-Period Click Drop)
                      </div>
                      <div className="divide-y divide-[#E5E0D8] text-xs">
                        {gscAnalytics.decliningPages.length === 0 ? (
                          <div className="p-5 text-[#5C5A55]">No declining click trajectories detected.</div>
                        ) : (
                          gscAnalytics.decliningPages.map((p) => (
                            <div key={p.page} className="px-5 py-3 flex items-center justify-between gap-3">
                              <span className="font-mono text-[#141413] truncate">{p.page}</span>
                              <span className="font-mono tabular-nums text-[#DC2626] shrink-0">
                                {p.clickDelta} clicks ({p.prevClicks} → {p.clicks})
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 3: INDEXING & SITEMAPS */}
      {activeTab === 'indexing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#E5E0D8] rounded p-5 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55]">
                Sitemap XML Feed
              </div>
              <div className="text-xl font-mono font-bold tabular-nums text-[#141413]">
                {(
                  overviewStats.indexableCount +
                  overviewStats.activePropertiesCount +
                  categories.length +
                  11
                ).toLocaleString()}{' '}
                URLs
              </div>
              <p className="text-xs text-[#5C5A55]">
                Automatically excludes draft, scheduled, archived, <code className="font-mono">noindex</code> articles, and redirected source URLs.
              </p>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A5F] hover:underline pt-1"
              >
                <ExternalLink size={12} /> Inspect Live sitemap.xml
              </a>
            </div>

            <div className="bg-white border border-[#E5E0D8] rounded p-5 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55]">
                Noindex Suppressed Articles
              </div>
              <div className="text-xl font-mono font-bold tabular-nums text-[#D97706]">
                {overviewStats.noindexCount}
              </div>
              <p className="text-xs text-[#5C5A55]">
                Published articles tagged <code className="font-mono">noindex</code> are omitted from sitemap.xml and emit matching meta robots tags.
              </p>
            </div>

            <div className="bg-white border border-[#E5E0D8] rounded p-5 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55]">
                Robots.txt Directives
              </div>
              <div className="text-xl font-mono font-bold text-[#16A34A]">Active</div>
              <p className="text-xs text-[#5C5A55]">
                Disallows <code className="font-mono">/admin</code>, <code className="font-mono">/account</code>, <code className="font-mono">/login</code>, and <code className="font-mono">/search</code>.
              </p>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A5F] hover:underline pt-1"
              >
                <ExternalLink size={12} /> View robots.txt
              </a>
            </div>
          </div>

          {/* URL Inspection Tool */}
          <div className="bg-white border border-[#E5E0D8] rounded p-6 space-y-4">
            <h2 className="text-base font-serif font-semibold text-[#141413]">
              Google Search Console Live URL Inspection
            </h2>
            {!gscStatus?.connected ? (
              <p className="text-xs text-[#5C5A55]">
                Connect Google Search Console in the <strong>Search Performance</strong> tab to inspect live Google index coverage, canonical selection, mobile usability, and rich results status for any AmaanEstate URL.
              </p>
            ) : (
              <>
                <form onSubmit={handleInspectUrl} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    value={inspectInputUrl}
                    onChange={(e) => setInspectInputUrl(e.target.value)}
                    placeholder="https://www.amaanestate.com/articles/..."
                    className="flex-1 h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
                  />
                  <button
                    type="submit"
                    disabled={inspectingUrl}
                    className="px-4 h-10 bg-[#1E3A5F] text-white rounded text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {inspectingUrl ? 'Inspecting...' : 'Inspect URL'}
                  </button>
                </form>

                {inspectionResult && (
                  <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8] rounded text-xs space-y-2 font-mono">
                    <div>
                      <strong>Verdict:</strong>{' '}
                      {inspectionResult.indexStatusResult?.verdict || 'UNKNOWN'} (
                      {inspectionResult.indexStatusResult?.coverageState || 'N/A'})
                    </div>
                    <div>
                      <strong>Google Canonical:</strong>{' '}
                      {inspectionResult.indexStatusResult?.googleCanonical || 'N/A'}
                    </div>
                    <div>
                      <strong>User Canonical:</strong>{' '}
                      {inspectionResult.indexStatusResult?.userCanonical || 'N/A'}
                    </div>
                    <div>
                      <strong>Last Crawl:</strong>{' '}
                      {inspectionResult.indexStatusResult?.lastCrawlTime || 'N/A'}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* GSC Sitemaps List */}
          {gscStatus?.connected && (
            <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#E5E0D8] font-serif font-semibold text-sm text-[#141413]">
                Submitted Search Console Sitemaps
              </div>
              {gscSitemaps.length === 0 ? (
                <div className="p-5 text-xs text-[#5C5A55]">
                  No sitemaps reported yet for {gscStatus.selectedSiteUrl}. Submit{' '}
                  <code className="font-mono">https://www.amaanestate.com/sitemap.xml</code> in Search Console.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[11px] uppercase text-[#5C5A55]">
                    <tr>
                      <th className="px-5 py-2.5">Sitemap Path</th>
                      <th className="px-4 py-2.5">Last Downloaded</th>
                      <th className="px-4 py-2.5 text-right">Warnings</th>
                      <th className="px-5 py-2.5 text-right">Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8] font-mono">
                    {gscSitemaps.map((sm: any) => (
                      <tr key={sm.path}>
                        <td className="px-5 py-2.5">{sm.path}</td>
                        <td className="px-4 py-2.5">{sm.lastDownloaded || '—'}</td>
                        <td className="px-4 py-2.5 text-right">{sm.warnings || 0}</td>
                        <td className="px-5 py-2.5 text-right">{sm.errors || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TECHNICAL SEO AUDIT & REDIRECT MANAGER */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Technical Audit Panel */}
          <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-serif font-semibold text-[#141413]">
                  Sitewide Technical &amp; Content SEO Audit
                </h2>
                <p className="text-xs text-[#5C5A55]">
                  {auditRun
                    ? `Last run: ${new Date(auditRun.summary.auditedAt).toLocaleString()} · Checked ${auditRun.summary.totalUrlsChecked} live URLs`
                    : 'Run a full technical crawl check across published articles, active properties, canonicals, internal links, and redirects.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {(['all', 'critical', 'warning', 'passed'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setAuditSeverityFilter(sev)}
                    className={`px-2.5 py-1.5 rounded text-xs font-semibold capitalize cursor-pointer ${
                      auditSeverityFilter === sev
                        ? 'bg-[#1E3A5F] text-white'
                        : 'bg-[#FAF8F5] text-[#5C5A55]'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {!auditRun ? (
              <div className="p-8 text-center space-y-3">
                <ShieldCheck size={28} className="mx-auto text-[#1E3A5F]" />
                <p className="text-xs text-[#5C5A55]">
                  Click <strong>Run Technical SEO Audit</strong> above to analyze every live page and store an audit snapshot.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E5E0D8] max-h-[460px] overflow-y-auto">
                {filteredAuditIssues.map((issue) => {
                  const linkedArticle =
                    issue.entityType === 'article' && issue.entityId
                      ? articles.find((a) => a.id === issue.entityId)
                      : undefined;
                  return (
                    <div
                      key={issue.id}
                      className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        {issue.severity === 'critical' ? (
                          <AlertCircle size={15} className="text-[#DC2626] shrink-0 mt-0.5" />
                        ) : issue.severity === 'warning' ? (
                          <AlertTriangle size={15} className="text-[#D97706] shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 size={15} className="text-[#16A34A] shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0 space-y-0.5">
                          <div className="text-xs font-semibold text-[#141413]">
                            {issue.title}{' '}
                            <span className="font-mono text-[10px] uppercase text-[#7A7770]">
                              [{issue.category}]
                            </span>
                          </div>
                          <div className="text-xs text-[#5C5A55]">{issue.description}</div>
                          {issue.url && (
                            <div className="text-[11px] font-mono text-[#1E3A5F]">{issue.url}</div>
                          )}
                        </div>
                      </div>
                      {linkedArticle && (
                        <button
                          type="button"
                          onClick={() => onEditArticle(linkedArticle)}
                          className="px-3 py-1.5 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded text-xs font-semibold text-[#141413] shrink-0 cursor-pointer"
                        >
                          Edit Article
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Redirect Manager */}
          <div className="bg-white border border-[#E5E0D8] rounded p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-serif font-semibold text-[#141413]">
                  HTTP 301 / 302 Redirect Manager
                </h2>
                <p className="text-xs text-[#5C5A55]">
                  Safely manage permanent redirects from retired paths or legacy URLs. Loops and multi-hop chains are blocked automatically.
                </p>
              </div>
              {redirectSchemaPending && (
                <span className="text-[11px] font-semibold text-[#D97706]">
                  Run 20261114000000_rankmath_seo_system.sql to persist redirects in Supabase
                </span>
              )}
            </div>

            <form onSubmit={handleCreateRedirect} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-semibold text-[#5C5A55] block">Source Path</label>
                <input
                  type="text"
                  value={newSourcePath}
                  onChange={(e) => setNewSourcePath(e.target.value)}
                  placeholder="/news/old-article-slug"
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
                />
              </div>
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-semibold text-[#5C5A55] block">Target Path</label>
                <input
                  type="text"
                  value={newTargetPath}
                  onChange={(e) => setNewTargetPath(e.target.value)}
                  placeholder="/articles/new-canonical-slug"
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-[#5C5A55] block">Status</label>
                <select
                  value={newStatusCode}
                  onChange={(e) => setNewStatusCode(Number(e.target.value) === 302 ? 302 : 301)}
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
                >
                  <option value={301}>301 Permanent</option>
                  <option value={302}>302 Temporary</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={savingRedirect}
                  className="w-full h-10 bg-[#1E3A5F] hover:bg-[#162C49] text-white rounded text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus size={14} />
                  <span>Add Rule</span>
                </button>
              </div>
              <div className="md:col-span-12">
                <input
                  type="text"
                  value={newRedirectNotes}
                  onChange={(e) => setNewRedirectNotes(e.target.value)}
                  placeholder="Optional editorial note (e.g., Consolidated duplicate market report)"
                  className="w-full h-9 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs"
                />
              </div>
            </form>

            {redirects.length > 0 && (
              <div className="overflow-x-auto border border-[#E5E0D8] rounded">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[11px] uppercase text-[#5C5A55]">
                    <tr>
                      <th className="px-4 py-2.5">Source</th>
                      <th className="px-4 py-2.5">Target</th>
                      <th className="px-3 py-2.5">Code</th>
                      <th className="px-3 py-2.5 text-right">Hits</th>
                      <th className="px-3 py-2.5">Active</th>
                      <th className="px-4 py-2.5 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {redirects.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-2.5 font-mono text-[#141413]">{r.source_path}</td>
                        <td className="px-4 py-2.5 font-mono text-[#1E3A5F]">{r.target_path}</td>
                        <td className="px-3 py-2.5 font-mono">{r.status_code}</td>
                        <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                          {Number(r.hit_count || 0).toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => handleToggleRedirect(r)}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                              r.is_active
                                ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                                : 'bg-[#FAF8F5] text-[#7A7770] border border-[#D6CEBE]'
                            }`}
                          >
                            {r.is_active ? 'Active' : 'Paused'}
                          </button>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteRedirect(r.id)}
                            className="p-1 text-[#991B1B] hover:bg-[#FEF2F2] rounded cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {builtInLegacy.length > 0 && (
              <div className="pt-3 border-t border-[#E5E0D8] space-y-2">
                <div className="text-xs font-semibold text-[#5C5A55]">
                  Built-In Verified Legacy /news/* 301 Redirects ({builtInLegacy.length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono text-[#5C5A55]">
                  {builtInLegacy.map((item) => (
                    <div
                      key={item.source_path}
                      className="px-3 py-2 bg-[#FAF8F5] border border-[#E5E0D8] rounded flex items-center gap-2 truncate"
                    >
                      <Link2 size={12} className="text-[#16A34A] shrink-0" />
                      <span className="truncate">
                        {item.source_path} → {item.target_path}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CONTENT SEO */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E0D8] rounded p-5 space-y-4">
            <div className="flex flex-col md:flex-row gap-3 justify-between">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7770]" />
                <input
                  type="search"
                  value={contentSearch}
                  onChange={(e) => setContentSearch(e.target.value)}
                  placeholder="Filter articles by headline, slug, or focus keyword..."
                  className="w-full h-9 pl-9 pr-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'strong', label: 'Strong (80+)' },
                  { id: 'needs-work', label: 'Needs Optimization (50–79)' },
                  { id: 'critical', label: 'Critical (<50)' },
                  { id: 'missing-meta', label: 'Missing Meta' },
                  { id: 'no-links', label: 'No Internal Links' },
                  { id: 'orphan', label: 'Orphan Articles' },
                  { id: 'stale', label: 'Stale (>180d)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setContentFilter(f.id as ContentFilter)}
                    className={`px-2.5 py-1.5 rounded text-[11px] font-semibold cursor-pointer ${
                      contentFilter === f.id
                        ? 'bg-[#1E3A5F] text-white'
                        : 'bg-[#FAF8F5] text-[#5C5A55] hover:text-[#141413]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto border border-[#E5E0D8] rounded">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[11px] uppercase text-[#5C5A55]">
                  <tr>
                    <th className="px-4 py-3">Article</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">SEO Score</th>
                    <th className="px-3 py-3">Focus Keyword</th>
                    <th className="px-3 py-3 text-right">Words</th>
                    <th className="px-3 py-3 text-right">Int. Links</th>
                    <th className="px-3 py-3 text-right">Incoming</th>
                    <th className="px-3 py-3">Robots</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {filteredContentRows.map(({ article, analysis, incomingLinks }) => (
                    <tr key={article.id} className="hover:bg-[#FAF8F5]">
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-semibold text-[#141413] truncate">{article.title}</div>
                        <div className="font-mono text-[11px] text-[#7A7770] truncate">
                          /articles/{article.slug}
                        </div>
                      </td>
                      <td className="px-3 py-3 capitalize text-[#5C5A55]">{article.status}</td>
                      <td className="px-3 py-3 font-mono font-bold tabular-nums">
                        <span
                          className={
                            analysis.score >= 80
                              ? 'text-[#16A34A]'
                              : analysis.score >= 55
                              ? 'text-[#D97706]'
                              : 'text-[#DC2626]'
                          }
                        >
                          {analysis.score}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[#5C5A55]">
                        {article.focus_keyword || <span className="text-[#DC2626]">Missing</span>}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums">
                        {analysis.metrics.wordCount.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums">
                        {analysis.metrics.internalLinksCount}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums">
                        {incomingLinks}
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px] text-[#5C5A55]">
                        {article.robots_directive || 'index, follow'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onEditArticle(article)}
                          className="px-3 py-1.5 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded font-semibold text-[#141413] cursor-pointer"
                        >
                          Optimize
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
