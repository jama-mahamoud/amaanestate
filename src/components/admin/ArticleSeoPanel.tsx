import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Link2,
  Monitor,
  Plus,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';
import {
  Article,
  ArticleSchemaType,
  Category,
  MediaItem,
  Property,
  RobotsDirective,
  SearchIntent,
} from '../../types';
import { ArticleSeoAnalysisResult } from '../../lib/seoAnalyzer';
import {
  extractLinksFromContent,
  findBrokenInternalLinks,
  InternalLinkRecommendation,
} from '../../lib/internalLinker';
import {
  AiSeoActionType,
  AiSeoSuggestionsPayload,
  runAiSeoOptimization,
} from '../../services/seoService';
import { toast } from 'sonner';

interface ArticleSeoPanelProps {
  articleId?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  featuredImageAlt: string;
  categoryId: string;
  categories: Category[];
  allArticles: Article[];
  properties: Property[];
  media: MediaItem[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
  focusKeyword: string;
  supportingKeywords: string[];
  searchIntent: SearchIntent;
  targetCountry: string;
  targetAudience: string;
  canonicalUrl: string;
  robotsDirective: RobotsDirective;
  schemaType: ArticleSchemaType;
  alternateLanguage: string;
  alternateArticleSlug: string;
  analysis: ArticleSeoAnalysisResult;
  internalRecommendations: InternalLinkRecommendation[];
  onChangeSeoTitle: (val: string) => void;
  onChangeSeoDescription: (val: string) => void;
  onChangeSeoKeywords: (val: string) => void;
  onChangeOgImage: (val: string) => void;
  onOpenOgPicker: () => void;
  onSyncKeywordsToTags: () => void;
  onChangeFocusKeyword: (val: string) => void;
  onChangeSupportingKeywords: (vals: string[]) => void;
  onChangeSearchIntent: (val: SearchIntent) => void;
  onChangeTargetCountry: (val: string) => void;
  onChangeTargetAudience: (val: string) => void;
  onChangeCanonicalUrl: (val: string) => void;
  onChangeRobotsDirective: (val: RobotsDirective) => void;
  onChangeSchemaType: (val: ArticleSchemaType) => void;
  onChangeAlternateLanguage: (val: string) => void;
  onChangeAlternateArticleSlug: (val: string) => void;
  onChangeTitle: (val: string) => void;
  onChangeSlug: (val: string) => void;
  onChangeCategoryId: (val: string) => void;
  onChangeFeaturedImageAlt: (val: string) => void;
  onAppendContentHtml: (html: string) => void;
  onApplySuggestedTags: (tagNames: string[]) => Promise<void> | void;
}

type SeoPanelTab = 'assistant' | 'ai' | 'links' | 'technical' | 'checklist';

export default function ArticleSeoPanel({
  articleId,
  title,
  slug,
  excerpt,
  content,
  featuredImageAlt,
  categoryId,
  categories,
  allArticles,
  properties,
  seoTitle,
  seoDescription,
  seoKeywords,
  ogImage,
  focusKeyword,
  supportingKeywords,
  searchIntent,
  targetCountry,
  targetAudience,
  canonicalUrl,
  robotsDirective,
  schemaType,
  alternateLanguage,
  alternateArticleSlug,
  analysis,
  internalRecommendations,
  onChangeSeoTitle,
  onChangeSeoDescription,
  onChangeSeoKeywords,
  onChangeOgImage,
  onOpenOgPicker,
  onSyncKeywordsToTags,
  onChangeFocusKeyword,
  onChangeSupportingKeywords,
  onChangeSearchIntent,
  onChangeTargetCountry,
  onChangeTargetAudience,
  onChangeCanonicalUrl,
  onChangeRobotsDirective,
  onChangeSchemaType,
  onChangeAlternateLanguage,
  onChangeAlternateArticleSlug,
  onChangeSlug,
  onChangeCategoryId,
  onChangeFeaturedImageAlt,
  onAppendContentHtml,
  onApplySuggestedTags,
}: ArticleSeoPanelProps) {
  const [activeTab, setActiveTab] = useState<SeoPanelTab>('assistant');
  const [serpDevice, setSerpDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [supportingInput, setSupportingInput] = useState('');
  const [checkCategoryFilter, setCheckCategoryFilter] = useState<string>('all');

  // AI Optimization state (Review-Before-Apply modal)
  const [aiLoadingAction, setAiLoadingAction] = useState<AiSeoActionType | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AiSeoSuggestionsPayload | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  // Selected items inside review modal
  const [applyFocusKeyword, setApplyFocusKeyword] = useState(false);
  const [selectedSeoTitleIdx, setSelectedSeoTitleIdx] = useState<number | null>(null);
  const [selectedMetaDescIdx, setSelectedMetaDescIdx] = useState<number | null>(null);
  const [applySlug, setApplySlug] = useState(false);
  const [applySupportingKeywords, setApplySupportingKeywords] = useState(false);
  const [applyCategory, setApplyCategory] = useState(false);
  const [applyTags, setApplyTags] = useState(false);
  const [applyFeaturedAlt, setApplyFeaturedAlt] = useState(false);
  const [selectedHeadingIdxs, setSelectedHeadingIdxs] = useState<number[]>([]);
  const [selectedLinkIdxs, setSelectedLinkIdxs] = useState<number[]>([]);
  const [selectedFaqIdxs, setSelectedFaqIdxs] = useState<number[]>([]);
  const [applyingAi, setApplyingAi] = useState(false);

  const scoreTone =
    analysis.score >= 80
      ? { text: 'text-[#16A34A]', bar: 'bg-[#16A34A]', border: 'border-[#BBF7D0]', bg: 'bg-[#F0FDF4]' }
      : analysis.score >= 55
      ? { text: 'text-[#D97706]', bar: 'bg-[#D97706]', border: 'border-[#FDE68A]', bg: 'bg-[#FFFBEB]' }
      : { text: 'text-[#DC2626]', bar: 'bg-[#DC2626]', border: 'border-[#FECACA]', bg: 'bg-[#FEF2F2]' };

  const brokenLinks = useMemo(() => {
    const links = extractLinksFromContent(content || '');
    return findBrokenInternalLinks(links, {
      articles: allArticles,
      properties,
      categories,
    });
  }, [content, allArticles, properties, categories]);

  const publishedOtherArticles = useMemo(
    () => allArticles.filter((a) => a.status === 'published' && a.id !== articleId && a.slug !== slug),
    [allArticles, articleId, slug]
  );

  const resolvedAlternateArticle = useMemo(
    () =>
      alternateArticleSlug
        ? publishedOtherArticles.find((a) => a.slug === alternateArticleSlug) || null
        : null,
    [publishedOtherArticles, alternateArticleSlug]
  );

  const handleAddSupportingKeyword = () => {
    const clean = supportingInput.trim();
    if (!clean) return;
    if (!supportingKeywords.some((k) => k.toLowerCase() === clean.toLowerCase())) {
      onChangeSupportingKeywords([...supportingKeywords, clean]);
    }
    setSupportingInput('');
  };

  const handleInsertInternalLink = (url: string, anchorText: string) => {
    const safeAnchor = anchorText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    onAppendContentHtml(`<p>Related reading: <a href="${url}">${safeAnchor}</a></p>`);
    toast.success(`Inserted internal link to ${url}`);
  };

  const handleCopyInternalLink = async (url: string, anchorText: string) => {
    const html = `<a href="${url}">${anchorText}</a>`;
    try {
      await navigator.clipboard.writeText(html);
      toast.success('HTML link copied to clipboard.');
    } catch {
      toast.info(html);
    }
  };

  const handleRunAiAction = async (action: AiSeoActionType) => {
    setAiLoadingAction(action);
    setAiError(null);
    try {
      const res = await runAiSeoOptimization({
        action,
        title,
        slug,
        excerpt,
        content,
        focusKeyword,
        supportingKeywords,
        searchIntent,
        targetCountry,
        targetAudience,
        seoTitle,
        seoDescription,
      });

      const s = res.suggestions || {};
      setAiSuggestions(s);
      setApplyFocusKeyword(Boolean(s.suggestedFocusKeyword && !focusKeyword.trim()));
      setSelectedSeoTitleIdx(s.suggestedSeoTitles?.length ? 0 : null);
      setSelectedMetaDescIdx(s.suggestedMetaDescriptions?.length ? 0 : null);
      setApplySlug(false);
      setApplySupportingKeywords(Boolean(s.suggestedSupportingKeywords?.length));
      setApplyCategory(false);
      setApplyTags(Boolean(s.suggestedTags?.length));
      setApplyFeaturedAlt(Boolean(s.featuredImageAltSuggestion && !featuredImageAlt.trim()));
      setSelectedHeadingIdxs([]);
      setSelectedLinkIdxs([]);
      setSelectedFaqIdxs([]);
      setReviewOpen(true);
    } catch (err: any) {
      const msg = err?.message || 'Unable to run AI SEO optimization.';
      setAiError(msg);
      toast.error(msg);
    } finally {
      setAiLoadingAction(null);
    }
  };

  const handleApplyReviewedChanges = async () => {
    if (!aiSuggestions) return;
    setApplyingAi(true);
    try {
      let appliedCount = 0;

      if (applyFocusKeyword && aiSuggestions.suggestedFocusKeyword) {
        onChangeFocusKeyword(aiSuggestions.suggestedFocusKeyword.trim());
        appliedCount++;
      }

      if (
        selectedSeoTitleIdx !== null &&
        aiSuggestions.suggestedSeoTitles?.[selectedSeoTitleIdx]
      ) {
        onChangeSeoTitle(aiSuggestions.suggestedSeoTitles[selectedSeoTitleIdx].trim());
        appliedCount++;
      }

      if (
        selectedMetaDescIdx !== null &&
        aiSuggestions.suggestedMetaDescriptions?.[selectedMetaDescIdx]
      ) {
        onChangeSeoDescription(aiSuggestions.suggestedMetaDescriptions[selectedMetaDescIdx].trim());
        appliedCount++;
      }

      if (applySlug && aiSuggestions.suggestedSlug) {
        onChangeSlug(aiSuggestions.suggestedSlug.trim());
        appliedCount++;
      }

      if (applySupportingKeywords && aiSuggestions.suggestedSupportingKeywords?.length) {
        const merged = Array.from(
          new Set([
            ...supportingKeywords,
            ...aiSuggestions.suggestedSupportingKeywords.map((k) => k.trim()).filter(Boolean),
          ])
        );
        onChangeSupportingKeywords(merged);
        appliedCount++;
      }

      if (applyCategory && aiSuggestions.recommendedCategory) {
        const matchedCat = categories.find(
          (c) => c.name.toLowerCase() === aiSuggestions.recommendedCategory!.trim().toLowerCase()
        );
        if (matchedCat) {
          onChangeCategoryId(matchedCat.id);
          appliedCount++;
        }
      }

      if (applyTags && aiSuggestions.suggestedTags?.length) {
        await onApplySuggestedTags(aiSuggestions.suggestedTags);
        appliedCount++;
      }

      if (applyFeaturedAlt && aiSuggestions.featuredImageAltSuggestion) {
        onChangeFeaturedImageAlt(aiSuggestions.featuredImageAltSuggestion.trim());
        appliedCount++;
      }

      if (selectedHeadingIdxs.length > 0 && aiSuggestions.missingHeadings?.length) {
        const blocks = selectedHeadingIdxs
          .map((idx) => aiSuggestions.missingHeadings?.[idx])
          .filter(Boolean)
          .map((h) => {
            const tag = h!.level?.toUpperCase() === 'H3' ? 'h3' : 'h2';
            const para = h!.draftParagraph ? `<p>${h!.draftParagraph}</p>` : '';
            return `<${tag}>${h!.heading}</${tag}>${para}`;
          })
          .join('');
        if (blocks) {
          onAppendContentHtml(blocks);
          appliedCount++;
        }
      }

      if (selectedLinkIdxs.length > 0 && aiSuggestions.internalLinkSuggestions?.length) {
        const linksHtml = selectedLinkIdxs
          .map((idx) => aiSuggestions.internalLinkSuggestions?.[idx])
          .filter(Boolean)
          .map((l) => `<li><a href="${l!.url}">${l!.anchorText}</a> — ${l!.reason}</li>`)
          .join('');
        if (linksHtml) {
          onAppendContentHtml(`<h3>Related AmaanEstate Intelligence</h3><ul>${linksHtml}</ul>`);
          appliedCount++;
        }
      }

      if (selectedFaqIdxs.length > 0 && aiSuggestions.faqSuggestions?.length) {
        const faqHtml = selectedFaqIdxs
          .map((idx) => aiSuggestions.faqSuggestions?.[idx])
          .filter(Boolean)
          .map((f) => `<h3>${f!.question}</h3><p>${f!.answer}</p>`)
          .join('');
        if (faqHtml) {
          onAppendContentHtml(`<h2>Frequently Asked Questions</h2>${faqHtml}`);
          appliedCount++;
        }
      }

      setReviewOpen(false);
      if (appliedCount > 0) {
        toast.success(`Applied ${appliedCount} approved SEO update${appliedCount === 1 ? '' : 's'} to your draft.`);
      } else {
        toast.info('No suggestions were selected to apply.');
      }
    } finally {
      setApplyingAi(false);
    }
  };

  const filteredChecks =
    checkCategoryFilter === 'all'
      ? analysis.checks
      : analysis.checks.filter((c) => c.category === checkCategoryFilter);

  const effectivePreviewTitle = (seoTitle || title || 'AmaanEstate — Global Real Estate Intelligence').trim();
  const effectivePreviewDesc = (
    seoDescription ||
    excerpt ||
    'Add a concise 120–160 character meta description summarizing key market takeaways.'
  ).trim();
  const previewCanonical =
    canonicalUrl && /^https?:\/\//i.test(canonicalUrl)
      ? canonicalUrl
      : `https://www.amaanestate.com/articles/${slug || 'article-slug'}`;

  return (
    <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
      {/* Header Bar with Live Score */}
      <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E5E0D8] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#1E3A5F]" />
            <h2 className="text-base font-serif font-semibold text-[#141413]">
              AmaanEstate Rank Math SEO Suite
            </h2>
            <span className={`px-2 py-0.5 text-[11px] font-semibold rounded border ${scoreTone.bg} ${scoreTone.border} ${scoreTone.text}`}>
              {analysis.grade}
            </span>
          </div>
          <p className="text-xs text-[#5C5A55] font-mono tabular-nums">
            {analysis.counts.passed} Passed · {analysis.counts.warning} Warnings · {analysis.counts.error} Issues ·{' '}
            {analysis.metrics.wordCount.toLocaleString()} words · {analysis.metrics.internalLinksCount} internal links
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="w-36">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
                SEO Score
              </span>
              <span className={`text-lg font-mono font-bold tabular-nums ${scoreTone.text}`}>
                {analysis.score}/100
              </span>
            </div>
            <div className="h-2 bg-[#E5E0D8] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${scoreTone.bar}`}
                style={{ width: `${analysis.score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="px-6 border-b border-[#E5E0D8] flex items-center gap-1 overflow-x-auto bg-white">
        {[
          { id: 'assistant', label: 'SEO Assistant & Keywords' },
          { id: 'ai', label: 'AI SEO Actions' },
          {
            id: 'links',
            label: `Internal Linking (${internalRecommendations.length}${
              brokenLinks.length > 0 ? ` · ${brokenLinks.length} broken` : ''
            })`,
          },
          { id: 'technical', label: 'Technical, Canonical & Hreflang' },
          {
            id: 'checklist',
            label: `Publish Checklist (${analysis.checklist.criticalErrors.length} critical)`,
          },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SeoPanelTab)}
              className={`px-3.5 py-3 text-xs font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
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

      <div className="p-6 space-y-6">
        {/* TAB 1: Live Assistant, Keywords, Intent & SERP Preview */}
        {activeTab === 'assistant' && (
          <div className="space-y-6">
            {/* Focus Keyword & Search Intent */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5C5A55] block">
                  Primary Focus Keyword
                </label>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => onChangeFocusKeyword(e.target.value)}
                  placeholder="e.g., Dubai Marina luxury real estate yield"
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                />
                <p className="text-[11px] text-[#7A7770] font-mono tabular-nums">
                  Body density: {analysis.metrics.keywordDensityPct}% ({analysis.metrics.keywordOccurrences} matches)
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5C5A55] block">Search Intent</label>
                <select
                  value={searchIntent}
                  onChange={(e) => onChangeSearchIntent(e.target.value as SearchIntent)}
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm font-medium"
                >
                  <option value="Informational">Informational (Guides, Research, Market News)</option>
                  <option value="Commercial">Commercial (Investment Analysis, Yield, Comparisons)</option>
                  <option value="Transactional">Transactional (Listings, Buying, Renting, Enquiries)</option>
                  <option value="Navigational">Navigational (Brand / Platform Hub Pages)</option>
                </select>
                <p className="text-[11px] text-[#5C5A55]">
                  Intent alignment:{' '}
                  <strong className={analysis.intentAnalysis.satisfied ? 'text-[#16A34A]' : 'text-[#D97706]'}>
                    {analysis.intentAnalysis.confidencePct}%
                  </strong>{' '}
                  {analysis.intentAnalysis.missingSignals[0]
                    ? `· Next: ${analysis.intentAnalysis.missingSignals[0]}`
                    : '· Well matched'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5C5A55] block">Target Country / Market</label>
                <input
                  type="text"
                  value={targetCountry}
                  onChange={(e) => onChangeTargetCountry(e.target.value)}
                  placeholder="e.g., United Arab Emirates, Canada, Somalia, Global"
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5C5A55] block">Target Audience</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => onChangeTargetAudience(e.target.value)}
                  placeholder="e.g., Institutional investors, homebuyers, diaspora developers"
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                />
              </div>
            </div>

            {/* Supporting Keywords */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#5C5A55] block">
                Supporting Secondary Keywords
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={supportingInput}
                  onChange={(e) => setSupportingInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSupportingKeyword();
                    }
                  }}
                  placeholder="Add secondary keyword phrase and press Enter..."
                  className="flex-1 h-9 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddSupportingKeyword}
                  className="px-3 h-9 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded text-xs font-semibold text-[#141413] cursor-pointer"
                >
                  Add
                </button>
              </div>
              {supportingKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {supportingKeywords.map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() =>
                        onChangeSupportingKeywords(supportingKeywords.filter((item) => item !== kw))
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs text-[#141413] cursor-pointer"
                    >
                      <span>{kw}</span>
                      <X size={11} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Core Metadata Fields */}
            <div className="grid grid-cols-1 gap-4 pt-4 border-t border-[#E5E0D8]">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#5C5A55]">SEO Meta Title</label>
                  <span
                    className={`text-[11px] font-mono tabular-nums ${
                      analysis.metrics.seoTitleLength > 60
                        ? 'text-[#DC2626]'
                        : analysis.metrics.seoTitleLength >= 30
                        ? 'text-[#16A34A]'
                        : 'text-[#D97706]'
                    }`}
                  >
                    {analysis.metrics.seoTitleLength}/60 recommended
                  </span>
                </div>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => onChangeSeoTitle(e.target.value)}
                  placeholder={title || 'Defaults to article headline'}
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#5C5A55]">SEO Meta Description</label>
                  <span
                    className={`text-[11px] font-mono tabular-nums ${
                      analysis.metrics.metaDescriptionLength > 160
                        ? 'text-[#DC2626]'
                        : analysis.metrics.metaDescriptionLength >= 120
                        ? 'text-[#16A34A]'
                        : 'text-[#D97706]'
                    }`}
                  >
                    {analysis.metrics.metaDescriptionLength}/160 recommended
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => onChangeSeoDescription(e.target.value)}
                  placeholder={excerpt || 'Defaults to short description'}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#5C5A55]">
                      SEO Keywords (Synced to Article Tags)
                    </label>
                    <button
                      type="button"
                      onClick={onSyncKeywordsToTags}
                      className="text-[11px] font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
                    >
                      Sync to Tags
                    </button>
                  </div>
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => onChangeSeoKeywords(e.target.value)}
                    placeholder="Urban Economics, Capital Markets, Logistics"
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">
                    OpenGraph Social Image Override
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ogImage}
                      onChange={(e) => onChangeOgImage(e.target.value)}
                      placeholder="Defaults to Featured Cover Image"
                      className="flex-1 h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={onOpenOgPicker}
                      className="px-3 h-10 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded text-xs font-semibold text-[#141413] cursor-pointer whitespace-nowrap"
                    >
                      Choose
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SERP Preview */}
            <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8] rounded space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-widest font-semibold text-[#8C4A27]">
                  Google Search Snippet Preview
                </span>
                <div className="inline-flex border border-[#D6CEBE] rounded overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setSerpDevice('desktop')}
                    className={`px-2.5 py-1 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer ${
                      serpDevice === 'desktop' ? 'bg-[#1E3A5F] text-white' : 'text-[#5C5A55]'
                    }`}
                  >
                    <Monitor size={12} /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setSerpDevice('mobile')}
                    className={`px-2.5 py-1 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer ${
                      serpDevice === 'mobile' ? 'bg-[#1E3A5F] text-white' : 'text-[#5C5A55]'
                    }`}
                  >
                    <Smartphone size={12} /> Mobile
                  </button>
                </div>
              </div>

              <div className={`bg-white border border-[#E5E0D8] rounded p-3.5 ${serpDevice === 'mobile' ? 'max-w-sm' : 'w-full'}`}>
                <div className="text-[11px] text-[#3C4043] font-mono truncate">{previewCanonical}</div>
                <div className="text-base font-semibold text-[#1a0dab] leading-snug mt-0.5 line-clamp-2">
                  {effectivePreviewTitle.length > 60
                    ? `${effectivePreviewTitle.slice(0, 58)}...`
                    : effectivePreviewTitle}
                </div>
                <p className="text-xs text-[#4D5156] mt-1 leading-relaxed line-clamp-2">
                  {effectivePreviewDesc.length > 160
                    ? `${effectivePreviewDesc.slice(0, 157)}...`
                    : effectivePreviewDesc}
                </p>
              </div>
            </div>

            {/* Live Real-Time Checks List */}
            <div className="space-y-3 pt-2 border-t border-[#E5E0D8]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55]">
                  Live Article Diagnostics ({analysis.checks.length} checks)
                </h3>
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'keyword', label: 'Keywords' },
                    { id: 'metadata', label: 'Metadata' },
                    { id: 'content', label: 'Content' },
                    { id: 'links', label: 'Links' },
                    { id: 'media', label: 'Media' },
                    { id: 'technical', label: 'Technical' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCheckCategoryFilter(cat.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                        checkCategoryFilter === cat.id
                          ? 'bg-[#1E3A5F] text-white'
                          : 'bg-[#FAF8F5] text-[#5C5A55] hover:text-[#141413]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-[#E5E0D8] border border-[#E5E0D8] rounded">
                {filteredChecks.map((chk) => (
                  <div key={chk.id} className="px-4 py-3 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      {chk.status === 'passed' ? (
                        <CheckCircle2 size={15} className="text-[#16A34A] shrink-0 mt-0.5" />
                      ) : chk.status === 'warning' ? (
                        <AlertTriangle size={15} className="text-[#D97706] shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle size={15} className="text-[#DC2626] shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 space-y-0.5">
                        <div className="text-xs font-semibold text-[#141413]">{chk.title}</div>
                        <div className="text-xs text-[#5C5A55]">{chk.detail}</div>
                        {chk.recommendation && (
                          <div className="text-[11px] text-[#8C4A27] font-medium">
                            Action: {chk.recommendation}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono tabular-nums text-[#7A7770] shrink-0">
                      {chk.points}/{chk.maxPoints}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI SEO Actions (Review-Before-Apply) */}
        {activeTab === 'ai' && (
          <div className="space-y-5">
            <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-[#141413] flex items-center gap-2">
                  <Bot size={16} className="text-[#1E3A5F]" />
                  <span>Editorial SEO Assistant (Review-Before-Apply)</span>
                </div>
                <p className="text-xs text-[#5C5A55]">
                  Analyzes your real article draft against AmaanEstate published stories and marketplace listings.
                  Suggestions open in a review modal and never overwrite your content automatically.
                </p>
              </div>
            </div>

            {aiError && (
              <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded text-xs text-[#991B1B]">
                {aiError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  action: 'analyze_full' as AiSeoActionType,
                  title: 'Full Editorial SEO Audit',
                  desc: 'Generates focus keyword, titles, descriptions, headings, tags, and verified links.',
                },
                {
                  action: 'seo_title' as AiSeoActionType,
                  title: 'Generate SEO Title Options',
                  desc: 'Produces 2–3 high-CTR titles under 60 chars unique across the site.',
                },
                {
                  action: 'meta_description' as AiSeoActionType,
                  title: 'Draft Meta Descriptions',
                  desc: 'Writes crisp 130–158 character SERP snippets matching search intent.',
                },
                {
                  action: 'headings' as AiSeoActionType,
                  title: 'Recommend Missing H2/H3 Sections',
                  desc: 'Identifies structural gaps in your market analysis or buyer guidance.',
                },
                {
                  action: 'internal_links' as AiSeoActionType,
                  title: 'Suggest Verified Internal Links',
                  desc: 'Matches only real published AmaanEstate articles and property URLs.',
                },
                {
                  action: 'faq_suggestions' as AiSeoActionType,
                  title: 'Draft Search FAQ Block',
                  desc: 'Creates concise reader Q&As tailored to your target country and intent.',
                },
              ].map((item) => {
                const running = aiLoadingAction === item.action;
                return (
                  <button
                    key={item.action}
                    type="button"
                    disabled={aiLoadingAction !== null}
                    onClick={() => handleRunAiAction(item.action)}
                    className="p-4 text-left bg-white hover:bg-[#FAF8F5] border border-[#E5E0D8] hover:border-[#1E3A5F] rounded transition-colors cursor-pointer disabled:opacity-50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#141413]">{item.title}</span>
                      <Sparkles size={14} className={running ? 'animate-spin text-[#8C4A27]' : 'text-[#1E3A5F]'} />
                    </div>
                    <p className="text-[11px] text-[#5C5A55] leading-relaxed">{item.desc}</p>
                    <div className="text-[11px] font-semibold text-[#1E3A5F] pt-1">
                      {running ? 'Analyzing draft...' : 'Run & Review →'}
                    </div>
                  </button>
                );
              })}
            </div>

            {aiSuggestions && !reviewOpen && (
              <div className="flex items-center justify-between p-3.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded">
                <span className="text-xs text-[#5C5A55]">
                  Latest AI SEO suggestions are ready for review.
                </span>
                <button
                  type="button"
                  onClick={() => setReviewOpen(true)}
                  className="px-3 py-1.5 bg-[#1E3A5F] text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Open Review Modal
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Internal Linking Intelligence */}
        {activeTab === 'links' && (
          <div className="space-y-5">
            {brokenLinks.length > 0 && (
              <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded space-y-2">
                <div className="text-xs font-semibold text-[#991B1B] flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>{brokenLinks.length} Broken or Legacy Internal Link(s) Detected</span>
                </div>
                <ul className="space-y-1 text-xs text-[#7F1D1D] font-mono">
                  {brokenLinks.map((b, i) => (
                    <li key={`${b.href}-${i}`}>
                      • {b.href} {b.anchorText ? `("${b.anchorText}")` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55]">
                  Recommended Published Articles &amp; Active Properties
                </h3>
                <p className="text-xs text-[#7A7770]">
                  Matched strictly from real AmaanEstate inventory by topic, country, and keyword overlap.
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-[#5C5A55]">
                {analysis.metrics.internalLinksCount} currently linked
              </span>
            </div>

            {internalRecommendations.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-[#D6CEBE] rounded text-xs text-[#5C5A55]">
                Add an article headline, focus keyword, or target country to discover matching published stories and properties.
              </div>
            ) : (
              <div className="divide-y divide-[#E5E0D8] border border-[#E5E0D8] rounded">
                {internalRecommendations.map((rec) => (
                  <div key={`${rec.type}-${rec.id}`} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[#FAF8F5] border border-[#E5E0D8] text-[#1E3A5F]">
                          {rec.type}
                        </span>
                        <span className="text-xs font-semibold text-[#141413] truncate">{rec.title}</span>
                        {rec.alreadyLinked && (
                          <span className="text-[10px] font-semibold text-[#16A34A] inline-flex items-center gap-1">
                            <Check size={11} /> Linked
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[#7A7770] truncate">{rec.url}</div>
                      <div className="text-xs text-[#5C5A55]">
                        {rec.reason} · Suggested anchor: <em>“{rec.suggestedAnchorText}”</em>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyInternalLink(rec.url, rec.suggestedAnchorText)}
                        className="px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D6CEBE] rounded text-xs font-semibold text-[#141413] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Copy size={12} /> Copy HTML
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertInternalLink(rec.url, rec.suggestedAnchorText)}
                        className="px-2.5 py-1.5 bg-[#1E3A5F] hover:bg-[#162C49] text-white rounded text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} /> Insert Link
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Technical SEO, Canonical, Robots, Schema & Hreflang */}
        {activeTab === 'technical' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5C5A55] block">
                  Custom Canonical URL (Optional)
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => onChangeCanonicalUrl(e.target.value)}
                  placeholder={`https://www.amaanestate.com/articles/${slug || 'article-slug'}`}
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
                />
                <p className="text-[11px] text-[#7A7770]">
                  Leave empty for automatic self-referencing canonical.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5C5A55] block">Robots Indexing Directive</label>
                <select
                  value={robotsDirective}
                  onChange={(e) => onChangeRobotsDirective(e.target.value as RobotsDirective)}
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm font-medium"
                >
                  <option value="index, follow">index, follow (Standard Search Indexing)</option>
                  <option value="noindex, follow">noindex, follow (Exclude from Search &amp; Sitemap)</option>
                  <option value="noindex, nofollow">noindex, nofollow (Private / Suppressed)</option>
                  <option value="index, nofollow">index, nofollow</option>
                </select>
                {robotsDirective.startsWith('noindex') && (
                  <p className="text-[11px] text-[#D97706] font-medium">
                    This article will automatically be omitted from /sitemap.xml.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5C5A55] block">Schema.org Structured Data Type</label>
                <select
                  value={schemaType}
                  onChange={(e) => onChangeSchemaType(e.target.value as ArticleSchemaType)}
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm font-medium"
                >
                  <option value="Article">Article (Research, Guides, Analysis)</option>
                  <option value="NewsArticle">NewsArticle (Breaking News, Policy Briefs)</option>
                </select>
              </div>
            </div>

            {/* Verified Hreflang Section */}
            <div className="pt-4 border-t border-[#E5E0D8] space-y-3">
              <div className="flex items-center gap-2">
                <Globe size={15} className="text-[#1E3A5F]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55]">
                  Multilingual Alternate (Hreflang — Verified Translations Only)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Alternate Version Language</label>
                  <select
                    value={alternateLanguage}
                    onChange={(e) => onChangeAlternateLanguage(e.target.value)}
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                  >
                    <option value="">None (Single language article)</option>
                    <option value="so">Somali (so)</option>
                    <option value="en">English (en)</option>
                    <option value="ar">Arabic (ar)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">
                    Published Alternate Article
                  </label>
                  <select
                    value={alternateArticleSlug}
                    onChange={(e) => onChangeAlternateArticleSlug(e.target.value)}
                    disabled={!alternateLanguage}
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm disabled:opacity-50"
                  >
                    <option value="">Select published alternate article...</option>
                    {publishedOtherArticles.map((art) => (
                      <option key={art.id} value={art.slug}>
                        {art.title} (/articles/{art.slug})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {alternateLanguage && alternateArticleSlug && !resolvedAlternateArticle && (
                <p className="text-[11px] text-[#DC2626]">
                  Target alternate slug &ldquo;{alternateArticleSlug}&rdquo; does not match a published article; hreflang tags will not render until verified.
                </p>
              )}
              {alternateLanguage && resolvedAlternateArticle && (
                <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded text-xs text-[#166534] flex items-center gap-2">
                  <Link2 size={14} />
                  <span>
                    Hreflang verified: <code className="font-mono">{alternateLanguage}</code> →{' '}
                    <code className="font-mono">/articles/{resolvedAlternateArticle.slug}</code>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Pre-Publish Readiness Checklist */}
        {activeTab === 'checklist' && (
          <div className="space-y-5">
            <div className="p-4 rounded border border-[#E5E0D8] bg-[#FAF8F5] flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-[#141413]">
                  {analysis.checklist.readyToPublish
                    ? 'Ready for Publication'
                    : 'Critical Requirements Remaining'}
                </div>
                <p className="text-xs text-[#5C5A55]">
                  Critical errors block clean search indexing or schema output. Optional recommendations can be improved anytime without blocking publishing.
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  analysis.checklist.readyToPublish
                    ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                    : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                }`}
              >
                {analysis.checklist.readyToPublish ? 'Pass' : `${analysis.checklist.criticalErrors.length} Critical`}
              </span>
            </div>

            {analysis.checklist.criticalErrors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#DC2626]">
                  Critical Errors ({analysis.checklist.criticalErrors.length})
                </h4>
                <div className="border border-[#FECACA] bg-[#FEF2F2] rounded divide-y divide-[#FECACA]">
                  {analysis.checklist.criticalErrors.map((item) => (
                    <div key={item.id} className="px-4 py-3 text-xs space-y-0.5">
                      <div className="font-semibold text-[#991B1B]">{item.title}</div>
                      <div className="text-[#7F1D1D]">{item.recommendation || item.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D97706]">
                Optional Optimization Recommendations ({analysis.checklist.optionalRecommendations.length})
              </h4>
              {analysis.checklist.optionalRecommendations.length === 0 ? (
                <p className="text-xs text-[#16A34A]">All optimization recommendations satisfied.</p>
              ) : (
                <div className="border border-[#E5E0D8] rounded divide-y divide-[#E5E0D8]">
                  {analysis.checklist.optionalRecommendations.map((item) => (
                    <div key={item.id} className="px-4 py-3 text-xs space-y-0.5">
                      <div className="font-semibold text-[#141413]">{item.title}</div>
                      <div className="text-[#5C5A55]">{item.recommendation || item.detail}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Review-Before-Apply AI SEO Modal */}
      {reviewOpen && aiSuggestions && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E0D8] rounded max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between bg-[#FAF8F5]">
              <div>
                <div className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
                  Review AI SEO Suggestions
                </div>
                <h3 className="text-base font-serif font-semibold text-[#141413]">
                  Select updates to apply — nothing is overwritten without approval
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                className="p-1.5 text-[#5C5A55] hover:text-[#141413] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {aiSuggestions.summary && (
                <div className="p-3.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded text-[#141413] leading-relaxed">
                  <strong>Editorial SEO Summary:</strong> {aiSuggestions.summary}
                </div>
              )}

              {aiSuggestions.keywordOveruseNotes && aiSuggestions.keywordOveruseNotes.length > 0 && (
                <div className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded text-[#92400E] space-y-1">
                  <strong>Keyword &amp; Naturalness Notes:</strong>
                  {aiSuggestions.keywordOveruseNotes.map((n, i) => (
                    <div key={i}>• {n}</div>
                  ))}
                </div>
              )}

              {aiSuggestions.suggestedFocusKeyword && (
                <label className="flex items-start gap-2.5 p-3 border border-[#E5E0D8] rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyFocusKeyword}
                    onChange={(e) => setApplyFocusKeyword(e.target.checked)}
                    className="mt-0.5 accent-[#1E3A5F]"
                  />
                  <div>
                    <div className="font-semibold text-[#141413]">Primary Focus Keyword</div>
                    <div className="text-[#5C5A55]">
                      Current: <span className="font-mono">{focusKeyword || 'None'}</span> → Suggested:{' '}
                      <strong className="text-[#1E3A5F]">{aiSuggestions.suggestedFocusKeyword}</strong>
                    </div>
                  </div>
                </label>
              )}

              {aiSuggestions.suggestedSeoTitles && aiSuggestions.suggestedSeoTitles.length > 0 && (
                <div className="p-3.5 border border-[#E5E0D8] rounded space-y-2">
                  <div className="font-semibold text-[#141413]">SEO Meta Title Candidates</div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-[#5C5A55] cursor-pointer">
                      <input
                        type="radio"
                        name="ai-seo-title"
                        checked={selectedSeoTitleIdx === null}
                        onChange={() => setSelectedSeoTitleIdx(null)}
                      />
                      <span>Keep current SEO title ({seoTitle || title || 'default'})</span>
                    </label>
                    {aiSuggestions.suggestedSeoTitles.map((cand, idx) => (
                      <label key={idx} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="ai-seo-title"
                          checked={selectedSeoTitleIdx === idx}
                          onChange={() => setSelectedSeoTitleIdx(idx)}
                          className="mt-0.5 accent-[#1E3A5F]"
                        />
                        <span>
                          <strong className="text-[#141413]">{cand}</strong>{' '}
                          <span className="font-mono text-[#7A7770]">({cand.length} chars)</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {aiSuggestions.suggestedMetaDescriptions &&
                aiSuggestions.suggestedMetaDescriptions.length > 0 && (
                  <div className="p-3.5 border border-[#E5E0D8] rounded space-y-2">
                    <div className="font-semibold text-[#141413]">Meta Description Candidates</div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-[#5C5A55] cursor-pointer">
                        <input
                          type="radio"
                          name="ai-meta-desc"
                          checked={selectedMetaDescIdx === null}
                          onChange={() => setSelectedMetaDescIdx(null)}
                        />
                        <span>Keep current meta description</span>
                      </label>
                      {aiSuggestions.suggestedMetaDescriptions.map((cand, idx) => (
                        <label key={idx} className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="ai-meta-desc"
                            checked={selectedMetaDescIdx === idx}
                            onChange={() => setSelectedMetaDescIdx(idx)}
                            className="mt-0.5 accent-[#1E3A5F]"
                          />
                          <span>
                            <span className="text-[#141413]">{cand}</span>{' '}
                            <span className="font-mono text-[#7A7770]">({cand.length} chars)</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {aiSuggestions.suggestedSlug && (
                  <label className="flex items-start gap-2 p-3 border border-[#E5E0D8] rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applySlug}
                      onChange={(e) => setApplySlug(e.target.checked)}
                      className="mt-0.5 accent-[#1E3A5F]"
                    />
                    <div>
                      <div className="font-semibold text-[#141413]">URL Slug</div>
                      <div className="font-mono text-[#1E3A5F]">/articles/{aiSuggestions.suggestedSlug}</div>
                    </div>
                  </label>
                )}

                {aiSuggestions.featuredImageAltSuggestion && (
                  <label className="flex items-start gap-2 p-3 border border-[#E5E0D8] rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyFeaturedAlt}
                      onChange={(e) => setApplyFeaturedAlt(e.target.checked)}
                      className="mt-0.5 accent-[#1E3A5F]"
                    />
                    <div>
                      <div className="font-semibold text-[#141413]">Cover Image ALT Text</div>
                      <div className="text-[#5C5A55]">{aiSuggestions.featuredImageAltSuggestion}</div>
                    </div>
                  </label>
                )}

                {aiSuggestions.suggestedSupportingKeywords &&
                  aiSuggestions.suggestedSupportingKeywords.length > 0 && (
                    <label className="flex items-start gap-2 p-3 border border-[#E5E0D8] rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applySupportingKeywords}
                        onChange={(e) => setApplySupportingKeywords(e.target.checked)}
                        className="mt-0.5 accent-[#1E3A5F]"
                      />
                      <div>
                        <div className="font-semibold text-[#141413]">Supporting Keywords</div>
                        <div className="text-[#5C5A55]">
                          {aiSuggestions.suggestedSupportingKeywords.join(', ')}
                        </div>
                      </div>
                    </label>
                  )}

                {aiSuggestions.suggestedTags && aiSuggestions.suggestedTags.length > 0 && (
                  <label className="flex items-start gap-2 p-3 border border-[#E5E0D8] rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyTags}
                      onChange={(e) => setApplyTags(e.target.checked)}
                      className="mt-0.5 accent-[#1E3A5F]"
                    />
                    <div>
                      <div className="font-semibold text-[#141413]">Article Tags</div>
                      <div className="text-[#5C5A55]">{aiSuggestions.suggestedTags.join(', ')}</div>
                    </div>
                  </label>
                )}

                {aiSuggestions.recommendedCategory && (
                  <label className="flex items-start gap-2 p-3 border border-[#E5E0D8] rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyCategory}
                      onChange={(e) => setApplyCategory(e.target.checked)}
                      className="mt-0.5 accent-[#1E3A5F]"
                    />
                    <div>
                      <div className="font-semibold text-[#141413]">Recommended Category</div>
                      <div className="text-[#1E3A5F]">{aiSuggestions.recommendedCategory}</div>
                    </div>
                  </label>
                )}
              </div>

              {aiSuggestions.missingHeadings && aiSuggestions.missingHeadings.length > 0 && (
                <div className="p-3.5 border border-[#E5E0D8] rounded space-y-2">
                  <div className="font-semibold text-[#141413]">
                    Optional Missing Subheadings (Append to bottom if checked)
                  </div>
                  {aiSuggestions.missingHeadings.map((h, idx) => (
                    <label key={idx} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedHeadingIdxs.includes(idx)}
                        onChange={() =>
                          setSelectedHeadingIdxs((prev) =>
                            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                          )
                        }
                        className="mt-0.5 accent-[#1E3A5F]"
                      />
                      <div>
                        <div className="font-semibold text-[#141413]">
                          [{h.level || 'H2'}] {h.heading}
                        </div>
                        <div className="text-[#5C5A55]">{h.rationale}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {aiSuggestions.internalLinkSuggestions &&
                aiSuggestions.internalLinkSuggestions.length > 0 && (
                  <div className="p-3.5 border border-[#E5E0D8] rounded space-y-2">
                    <div className="font-semibold text-[#141413]">
                      Verified Internal Links (Append Related Section if checked)
                    </div>
                    {aiSuggestions.internalLinkSuggestions.map((link, idx) => (
                      <label key={idx} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLinkIdxs.includes(idx)}
                          onChange={() =>
                            setSelectedLinkIdxs((prev) =>
                              prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                            )
                          }
                          className="mt-0.5 accent-[#1E3A5F]"
                        />
                        <div>
                          <div className="font-semibold text-[#1E3A5F]">
                            {link.anchorText}{' '}
                            <span className="font-mono text-[#7A7770] font-normal">({link.url})</span>
                          </div>
                          <div className="text-[#5C5A55]">{link.reason}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

              {aiSuggestions.faqSuggestions && aiSuggestions.faqSuggestions.length > 0 && (
                <div className="p-3.5 border border-[#E5E0D8] rounded space-y-2">
                  <div className="font-semibold text-[#141413]">
                    Optional FAQ Questions (Append FAQ block if checked)
                  </div>
                  {aiSuggestions.faqSuggestions.map((faq, idx) => (
                    <label key={idx} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFaqIdxs.includes(idx)}
                        onChange={() =>
                          setSelectedFaqIdxs((prev) =>
                            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                          )
                        }
                        className="mt-0.5 accent-[#1E3A5F]"
                      />
                      <div>
                        <div className="font-semibold text-[#141413]">{faq.question}</div>
                        <div className="text-[#5C5A55]">{faq.answer}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#E5E0D8] bg-[#FAF8F5] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                className="px-4 py-2 bg-white border border-[#D6CEBE] rounded text-xs font-semibold text-[#141413] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={applyingAi}
                onClick={handleApplyReviewedChanges}
                className="px-5 py-2 bg-[#1E3A5F] hover:bg-[#162C49] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check size={14} />
                <span>{applyingAi ? 'Applying...' : 'Apply Selected Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
