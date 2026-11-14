import {
  Article,
  ArticleSchemaType,
  Category,
  Property,
  RobotsDirective,
  SearchIntent,
} from '../types';
import {
  extractImagesFromContent,
  extractLinksFromContent,
  findBrokenInternalLinks,
} from './internalLinker';

export type SeoCheckStatus = 'passed' | 'warning' | 'error';

export type SeoCheckCategory =
  | 'keyword'
  | 'metadata'
  | 'content'
  | 'links'
  | 'media'
  | 'technical';

export interface SeoCheckItem {
  id: string;
  category: SeoCheckCategory;
  status: SeoCheckStatus;
  points: number;
  maxPoints: number;
  title: string;
  detail: string;
  recommendation?: string;
  isCriticalForPublish?: boolean;
}

export interface IntentSatisfactionAnalysis {
  intent: SearchIntent;
  satisfied: boolean;
  confidencePct: number;
  signalsFound: string[];
  missingSignals: string[];
}

export interface ArticleSeoAnalysisInput {
  articleId?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId?: string;
  authorId?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  focusKeyword?: string;
  supportingKeywords?: string[];
  searchIntent?: SearchIntent;
  targetCountry?: string;
  targetAudience?: string;
  canonicalUrl?: string;
  robotsDirective?: RobotsDirective;
  schemaType?: ArticleSchemaType;
  alternateLanguage?: string;
  alternateArticleSlug?: string;
  tags?: string[];
}

export interface ArticleSeoAnalysisResult {
  score: number;
  grade: 'Strong' | 'Good' | 'Needs Improvement' | 'Critical';
  checks: SeoCheckItem[];
  counts: {
    passed: number;
    warning: number;
    error: number;
  };
  metrics: {
    wordCount: number;
    keywordOccurrences: number;
    keywordDensityPct: number;
    h1Count: number;
    h2Count: number;
    h3Count: number;
    internalLinksCount: number;
    brokenInternalLinksCount: number;
    externalLinksCount: number;
    avgParagraphWords: number;
    longParagraphCount: number;
    seoTitleLength: number;
    metaDescriptionLength: number;
    slugLength: number;
    missingAltImagesCount: number;
    duplicateTitleSlug: string | null;
    duplicateDescriptionSlug: string | null;
  };
  intentAnalysis: IntentSatisfactionAnalysis;
  checklist: {
    criticalErrors: SeoCheckItem[];
    optionalRecommendations: SeoCheckItem[];
    passedItems: SeoCheckItem[];
    readyToPublish: boolean;
  };
}

function stripTags(html: string): string {
  return (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countKeywordMatches(haystack: string, needle: string): number {
  const cleanNeedle = needle.trim().toLowerCase();
  if (!cleanNeedle || !haystack) return 0;
  const escaped = escapeRegExp(cleanNeedle);
  const regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, 'gi');
  const matches = haystack.match(regex);
  return matches ? matches.length : 0;
}

function extractHeadings(content: string): Array<{ level: 1 | 2 | 3; text: string }> {
  const headings: Array<{ level: 1 | 2 | 3; text: string }> = [];
  const htmlHeadingRegex = /<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = htmlHeadingRegex.exec(content)) !== null) {
    const level = Number(match[1]) as 1 | 2 | 3;
    const text = stripTags(match[2]);
    if (text) headings.push({ level, text });
  }

  if (headings.length === 0) {
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const md = line.match(/^(#{1,3})\s+(.+)$/);
      if (md) {
        const level = md[1].length as 1 | 2 | 3;
        headings.push({ level, text: md[2].trim() });
      }
    }
  }
  return headings;
}

function extractParagraphWordCounts(content: string): number[] {
  const counts: number[] = [];
  const pMatches = content.match(/<p\b[^>]*>([\s\S]*?)<\/p>/gi);
  if (pMatches && pMatches.length > 0) {
    for (const p of pMatches) {
      const txt = stripTags(p);
      if (txt) counts.push(txt.split(/\s+/).filter(Boolean).length);
    }
    return counts;
  }

  const blocks = content.split(/\n\s*\n/).map((b) => stripTags(b)).filter(Boolean);
  for (const b of blocks) {
    counts.push(b.split(/\s+/).filter(Boolean).length);
  }
  return counts;
}

function analyzeIntentSatisfaction(
  intent: SearchIntent,
  fullText: string,
  headings: Array<{ level: 1 | 2 | 3; text: string }>,
  internalLinksCount: number,
  wordCount: number
): IntentSatisfactionAnalysis {
  const lower = fullText.toLowerCase();
  const h2Count = headings.filter((h) => h.level === 2).length;
  const signalsFound: string[] = [];
  const missingSignals: string[] = [];

  if (intent === 'Informational') {
    if (h2Count >= 2) signalsFound.push('Structured explainer H2 sections');
    else missingSignals.push('Add at least 2 clear H2 section headings');

    if (wordCount >= 500) signalsFound.push('In-depth analytical coverage (>= 500 words)');
    else missingSignals.push('Expand research depth to 500+ words');

    if (/(data|analysis|research|trend|impact|report|outlook|guide|overview)/i.test(lower)) {
      signalsFound.push('Analytical / research terminology matches informational searchers');
    } else {
      missingSignals.push('Include clear market context, data, or methodology explanation');
    }
  } else if (intent === 'Commercial') {
    if (/(yield|roi|return|cap rate|valuation|compare|comparison|forecast|investment|risk|cost)/i.test(lower)) {
      signalsFound.push('Commercial evaluation criteria (ROI, yield, valuation, or comparison)');
    } else {
      missingSignals.push('Include ROI, yield, pricing benchmarks, or comparative evaluation');
    }

    if (internalLinksCount >= 1) signalsFound.push('Connects readers to supporting property/market pages');
    else missingSignals.push('Link to relevant marketplace listings (/buy or /rent) or category research');

    if (h2Count >= 2) signalsFound.push('Scannable comparison/analysis headings');
    else missingSignals.push('Break commercial criteria into scannable H2 sections');
  } else if (intent === 'Transactional') {
    if (/(price|pricing|rent|buy|lease|available|enquire|listing|bedroom|sqft|sqm|location)/i.test(lower)) {
      signalsFound.push('Actionable property transaction & specification language');
    } else {
      missingSignals.push('Include clear pricing context, property specifications, or next steps');
    }

    if (/(\/buy|\/rent|\/properties\/|\/contact)/i.test(lower) || internalLinksCount >= 1) {
      signalsFound.push('Direct pathway to marketplace inventory or enquiry action');
    } else {
      missingSignals.push('Add an internal link to relevant /buy, /rent, or property listing pages');
    }
  } else {
    // Navigational
    if (/(amaanestate|amaan estate|platform|editorial|marketplace)/i.test(lower)) {
      signalsFound.push('Clear AmaanEstate brand & platform navigation references');
    } else {
      missingSignals.push('Reference AmaanEstate section/service destination clearly');
    }
    if (internalLinksCount >= 1) signalsFound.push('Provides direct internal destination links');
    else missingSignals.push('Link directly to the target hub or resource page');
  }

  const total = signalsFound.length + missingSignals.length || 1;
  const confidencePct = Math.round((signalsFound.length / total) * 100);
  return {
    intent,
    satisfied: missingSignals.length === 0,
    confidencePct,
    signalsFound,
    missingSignals,
  };
}

export function analyzeArticleSeo(
  input: ArticleSeoAnalysisInput,
  catalog: {
    articles?: Article[];
    properties?: Property[];
    categories?: Category[];
  } = {}
): ArticleSeoAnalysisResult {
  const existingArticles = catalog.articles || [];
  const existingProperties = catalog.properties || [];
  const existingCategories = catalog.categories || [];

  const title = (input.title || '').trim();
  const slug = (input.slug || '').trim().toLowerCase();
  const excerpt = (input.excerpt || '').trim();
  const content = input.content || '';
  const plainBody = stripTags(content);
  const words = plainBody ? plainBody.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  const effectiveSeoTitle = (input.seoTitle || title).trim();
  const effectiveMetaDesc = (input.seoDescription || excerpt).trim();
  const focusKeyword = (input.focusKeyword || '').trim();
  const focusLower = focusKeyword.toLowerCase();
  const supportingKeywords = (input.supportingKeywords || []).map((k) => k.trim()).filter(Boolean);
  const searchIntent: SearchIntent = input.searchIntent || 'Informational';
  const robotsDirective: RobotsDirective = input.robotsDirective || 'index, follow';

  const headings = extractHeadings(content);
  const h1Count = headings.filter((h) => h.level === 1).length;
  const h2Count = headings.filter((h) => h.level === 2).length;
  const h3Count = headings.filter((h) => h.level === 3).length;

  const links = extractLinksFromContent(content);
  const internalLinks = links.filter((l) => l.isInternal);
  const externalLinks = links.filter((l) => !l.isInternal && /^https?:\/\//i.test(l.href));
  const brokenInternalLinks = findBrokenInternalLinks(internalLinks, {
    articles: existingArticles,
    properties: existingProperties,
    categories: existingCategories,
  });

  const paragraphCounts = extractParagraphWordCounts(content);
  const avgParagraphWords =
    paragraphCounts.length > 0
      ? Math.round(paragraphCounts.reduce((s, n) => s + n, 0) / paragraphCounts.length)
      : 0;
  const longParagraphCount = paragraphCounts.filter((c) => c > 150).length;

  const contentImages = extractImagesFromContent(content);
  const missingInlineAltCount = contentImages.filter((i) => !i.hasAlt).length;
  const featuredImagePresent = Boolean(input.featuredImage && input.featuredImage.trim());
  const featuredAltPresent = Boolean(input.featuredImageAlt && input.featuredImageAlt.trim().length >= 5);

  const keywordOccurrences = focusKeyword ? countKeywordMatches(plainBody, focusKeyword) : 0;
  const focusWordLen = focusKeyword ? focusKeyword.split(/\s+/).filter(Boolean).length : 1;
  const keywordDensityPct =
    wordCount > 0 && focusKeyword
      ? Number((((keywordOccurrences * focusWordLen) / wordCount) * 100).toFixed(2))
      : 0;

  const introWords = words.slice(0, 120).join(' ');
  const keywordInIntro = focusKeyword ? countKeywordMatches(introWords, focusKeyword) > 0 : false;
  const keywordInHeadline = focusKeyword ? countKeywordMatches(title, focusKeyword) > 0 : false;
  const keywordInSeoTitle = focusKeyword ? countKeywordMatches(effectiveSeoTitle, focusKeyword) > 0 : false;
  const keywordInMetaDesc = focusKeyword ? countKeywordMatches(effectiveMetaDesc, focusKeyword) > 0 : false;
  const slugWords = slug.replace(/-/g, ' ');
  const keywordInSlug = focusKeyword
    ? countKeywordMatches(slugWords, focusKeyword) > 0 ||
      slug.includes(focusLower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    : false;
  const headingText = headings.map((h) => h.text).join(' | ');
  const keywordInSubheadings = focusKeyword
    ? countKeywordMatches(headingText, focusKeyword) > 0 ||
      supportingKeywords.some((sk) => countKeywordMatches(headingText, sk) > 0)
    : false;

  // Duplicate checks against existing catalog
  const otherArticles = existingArticles.filter((a) => a.id !== input.articleId);
  const duplicateTitleArticle = effectiveSeoTitle
    ? otherArticles.find(
        (a) => (a.seo_title || a.title || '').trim().toLowerCase() === effectiveSeoTitle.toLowerCase()
      ) || null
    : null;
  const duplicateDescArticle = effectiveMetaDesc
    ? otherArticles.find(
        (a) =>
          (a.seo_description || a.excerpt || '').trim().toLowerCase() ===
          effectiveMetaDesc.toLowerCase()
      ) || null
    : null;
  const duplicateSlugArticle = slug
    ? otherArticles.find((a) => a.slug.toLowerCase() === slug) || null
    : null;

  const checks: SeoCheckItem[] = [];

  // 1. Focus keyword defined (5 pts)
  checks.push({
    id: 'focus-keyword-set',
    category: 'keyword',
    status: focusKeyword.length >= 3 ? 'passed' : 'error',
    points: focusKeyword.length >= 3 ? 5 : 0,
    maxPoints: 5,
    title: 'Primary focus keyword selected',
    detail: focusKeyword
      ? `Target focus keyword: "${focusKeyword}".`
      : 'No primary focus keyword is set for this article.',
    recommendation: !focusKeyword
      ? 'Set 1 clear primary focus keyword reflecting what global real estate readers search for.'
      : undefined,
  });

  // 2. Focus keyword in headline & SEO title (9 pts)
  checks.push({
    id: 'keyword-in-titles',
    category: 'keyword',
    status: !focusKeyword
      ? 'warning'
      : keywordInHeadline && keywordInSeoTitle
      ? 'passed'
      : keywordInHeadline || keywordInSeoTitle
      ? 'warning'
      : 'error',
    points: !focusKeyword ? 0 : (keywordInHeadline ? 5 : 0) + (keywordInSeoTitle ? 4 : 0),
    maxPoints: 9,
    title: 'Focus keyword in headline & SEO title',
    detail: !focusKeyword
      ? 'Waiting for a focus keyword.'
      : keywordInHeadline && keywordInSeoTitle
      ? 'Focus keyword appears in both H1 headline and SEO meta title.'
      : keywordInSeoTitle
      ? 'Present in SEO meta title, missing from H1 headline.'
      : keywordInHeadline
      ? 'Present in H1 headline, missing from custom SEO meta title.'
      : 'Focus keyword is missing from both headline and SEO title.',
    recommendation:
      focusKeyword && (!keywordInHeadline || !keywordInSeoTitle)
        ? `Include "${focusKeyword}" naturally near the beginning of your headline and SEO title.`
        : undefined,
  });

  // 3. Focus keyword in meta description & slug (8 pts)
  checks.push({
    id: 'keyword-in-desc-slug',
    category: 'keyword',
    status: !focusKeyword
      ? 'warning'
      : keywordInMetaDesc && keywordInSlug
      ? 'passed'
      : keywordInMetaDesc || keywordInSlug
      ? 'warning'
      : 'error',
    points: !focusKeyword ? 0 : (keywordInMetaDesc ? 4 : 0) + (keywordInSlug ? 4 : 0),
    maxPoints: 8,
    title: 'Focus keyword in meta description & URL slug',
    detail: !focusKeyword
      ? 'Waiting for a focus keyword.'
      : keywordInMetaDesc && keywordInSlug
      ? 'Focus keyword is reflected in both the meta description and URL slug.'
      : `Meta description: ${keywordInMetaDesc ? 'Yes' : 'Missing'} · URL slug: ${keywordInSlug ? 'Yes' : 'Missing'}.`,
    recommendation:
      focusKeyword && (!keywordInMetaDesc || !keywordInSlug)
        ? 'Mention your focus keyword naturally in the meta description and keep the URL slug concise and keyword-aligned.'
        : undefined,
  });

  // 4. Focus keyword in intro, headings & natural density (8 pts)
  const densityOk = keywordDensityPct >= 0.35 && keywordDensityPct <= 2.6;
  const overStuffed = keywordDensityPct > 3.0;
  checks.push({
    id: 'keyword-distribution',
    category: 'keyword',
    status: !focusKeyword
      ? 'warning'
      : overStuffed
      ? 'error'
      : keywordInIntro && keywordInSubheadings && densityOk
      ? 'passed'
      : keywordInIntro || densityOk
      ? 'warning'
      : 'error',
    points: !focusKeyword
      ? 0
      : (keywordInIntro ? 4 : 0) + (keywordInSubheadings ? 2 : 0) + (densityOk ? 2 : overStuffed ? 0 : 1),
    maxPoints: 8,
    title: 'Keyword placement, subheadings & natural density',
    detail: !focusKeyword
      ? 'Set a focus keyword to measure intro placement and density.'
      : `${keywordOccurrences} body occurrences (${keywordDensityPct}% density) · Intro: ${
          keywordInIntro ? 'Yes' : 'No'
        } · Subheadings: ${keywordInSubheadings ? 'Yes' : 'No'}.`,
    recommendation: overStuffed
      ? `Keyword density is ${keywordDensityPct}% (>3.0%). Reduce repetition and use natural synonyms or supporting keywords.`
      : focusKeyword && (!keywordInIntro || !keywordInSubheadings)
      ? 'Use the focus keyword naturally in the opening 120 words and at least one H2/H3 heading.'
      : undefined,
  });

  // 5. SEO Title length (6 pts)
  const titleLen = effectiveSeoTitle.length;
  const titleIdeal = titleLen >= 30 && titleLen <= 60;
  const titleAcceptable = titleLen > 0 && titleLen <= 70;
  checks.push({
    id: 'seo-title-length',
    category: 'metadata',
    status: titleLen === 0 ? 'error' : titleIdeal ? 'passed' : 'warning',
    points: titleLen === 0 ? 0 : titleIdeal ? 6 : titleAcceptable ? 4 : 2,
    maxPoints: 6,
    title: 'SEO title length (30–60 chars optimal)',
    detail: `Current length: ${titleLen} characters.`,
    isCriticalForPublish: title.length === 0,
    recommendation:
      titleLen === 0
        ? 'Enter a headline and SEO title.'
        : titleLen < 30
        ? 'SEO title is short (<30 chars). Add descriptive context for higher SERP CTR.'
        : titleLen > 60
        ? 'SEO title exceeds 60 characters and may truncate in Google Search results.'
        : undefined,
  });

  // 6. Meta Description length (6 pts)
  const descLen = effectiveMetaDesc.length;
  const descIdeal = descLen >= 120 && descLen <= 160;
  const descAcceptable = descLen >= 70 && descLen <= 170;
  checks.push({
    id: 'meta-description-length',
    category: 'metadata',
    status: descLen === 0 ? 'error' : descIdeal ? 'passed' : 'warning',
    points: descLen === 0 ? 0 : descIdeal ? 6 : descAcceptable ? 4 : 1,
    maxPoints: 6,
    title: 'Meta description length & quality (120–160 chars)',
    detail: descLen === 0 ? 'Meta description and excerpt are empty.' : `Current length: ${descLen} characters.`,
    recommendation:
      descLen < 120
        ? 'Write a compelling 120–160 character meta description summarizing the article takeaway.'
        : descLen > 160
        ? 'Meta description exceeds 160 characters and may truncate in search snippets.'
        : undefined,
  });

  // 7. Slug validity & uniqueness (4 pts)
  const validSlugFormat = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 4 && slug.length <= 75;
  checks.push({
    id: 'url-slug-quality',
    category: 'metadata',
    status: !slug || duplicateSlugArticle ? 'error' : validSlugFormat ? 'passed' : 'warning',
    points: !slug || duplicateSlugArticle ? 0 : validSlugFormat ? 4 : 2,
    maxPoints: 4,
    title: 'URL slug clarity & uniqueness',
    detail: duplicateSlugArticle
      ? `Slug "/articles/${slug}" conflicts with existing article "${duplicateSlugArticle.title}".`
      : slug
      ? `/articles/${slug} (${slug.length} chars)`
      : 'URL slug is missing.',
    isCriticalForPublish: !slug || Boolean(duplicateSlugArticle),
    recommendation: duplicateSlugArticle
      ? 'Change the URL slug so every article has a unique canonical path.'
      : !validSlugFormat
      ? 'Keep URL slugs lowercase, hyphenated, and under 75 characters.'
      : undefined,
  });

  // 8. Duplicate SEO Title / Meta Description detection (5 pts)
  const hasDupTitle = Boolean(duplicateTitleArticle);
  const hasDupDesc = Boolean(duplicateDescArticle);
  checks.push({
    id: 'duplicate-metadata',
    category: 'metadata',
    status: hasDupTitle || hasDupDesc ? 'error' : 'passed',
    points: (hasDupTitle ? 0 : 3) + (hasDupDesc ? 0 : 2),
    maxPoints: 5,
    title: 'Unique SEO title & meta description across site',
    detail:
      !hasDupTitle && !hasDupDesc
        ? 'No duplicate SEO titles or meta descriptions detected across AmaanEstate articles.'
        : [
            hasDupTitle ? `Duplicate SEO title matches "${duplicateTitleArticle!.title}"` : '',
            hasDupDesc ? `Duplicate meta description matches "${duplicateDescArticle!.title}"` : '',
          ]
            .filter(Boolean)
            .join(' · '),
    recommendation:
      hasDupTitle || hasDupDesc
        ? 'Differentiate the SEO title and meta description from existing articles to prevent keyword cannibalization.'
        : undefined,
  });

  // 9. Excerpt presence (4 pts)
  checks.push({
    id: 'editorial-excerpt',
    category: 'metadata',
    status: excerpt.length >= 60 ? 'passed' : excerpt.length > 0 ? 'warning' : 'error',
    points: excerpt.length >= 60 ? 4 : excerpt.length > 0 ? 2 : 0,
    maxPoints: 4,
    title: 'Editorial excerpt / summary deck',
    detail:
      excerpt.length === 0
        ? 'Excerpt is empty.'
        : `${excerpt.length} characters provided for article header and archive cards.`,
    recommendation:
      excerpt.length < 60 ? 'Provide a concise 1–2 sentence editorial excerpt (>= 60 characters).' : undefined,
  });

  // 10. Content depth & word count (7 pts)
  checks.push({
    id: 'content-depth',
    category: 'content',
    status: wordCount < 300 ? 'error' : wordCount >= 650 ? 'passed' : 'warning',
    points: wordCount >= 1000 ? 7 : wordCount >= 650 ? 6 : wordCount >= 300 ? 4 : wordCount > 0 ? 1 : 0,
    maxPoints: 7,
    title: 'Article depth & word count',
    detail: `${wordCount.toLocaleString()} words (${Math.max(1, Math.ceil(wordCount / 200))} min read).`,
    isCriticalForPublish: wordCount < 20,
    recommendation:
      wordCount < 650
        ? 'AmaanEstate research & guides perform best at 650–1,500+ words with substantive data and takeaways.'
        : undefined,
  });

  // 11. Heading structure H1/H2/H3 (6 pts)
  const hierarchyOk = h2Count >= 2 && h1Count === 0;
  checks.push({
    id: 'heading-hierarchy',
    category: 'content',
    status: h1Count > 1 ? 'warning' : hierarchyOk ? 'passed' : h2Count >= 1 ? 'warning' : 'error',
    points: hierarchyOk ? 6 : h2Count >= 1 ? 3 : 0,
    maxPoints: 6,
    title: 'Heading structure (H1 reserved for headline, H2/H3 sections)',
    detail: `Body headings: ${h1Count} H1, ${h2Count} H2, ${h3Count} H3 (the page headline renders the single H1).`,
    recommendation:
      h1Count > 0
        ? 'Remove H1 tags inside the article body — the article title already serves as the sole H1. Use H2/H3 for sections.'
        : h2Count < 2
        ? 'Structure the article with at least 2 descriptive H2 subheadings.'
        : undefined,
  });

  // 12. Readability & paragraph pacing (5 pts)
  checks.push({
    id: 'readability-paragraphs',
    category: 'content',
    status:
      paragraphCounts.length === 0
        ? 'warning'
        : longParagraphCount === 0 && avgParagraphWords <= 95
        ? 'passed'
        : 'warning',
    points:
      paragraphCounts.length === 0
        ? 0
        : longParagraphCount === 0 && avgParagraphWords <= 95
        ? 5
        : longParagraphCount <= 1
        ? 3
        : 1,
    maxPoints: 5,
    title: 'Paragraph length & editorial scannability',
    detail:
      paragraphCounts.length > 0
        ? `Avg ${avgParagraphWords} words/paragraph · ${longParagraphCount} overly long paragraphs (>150 words).`
        : 'No structured paragraphs detected yet.',
    recommendation:
      longParagraphCount > 0 || avgParagraphWords > 95
        ? 'Split dense paragraphs (>150 words) into concise 2–4 sentence blocks, bullet lists, or subheadings.'
        : undefined,
  });

  // 13. Internal links + broken link check (4 pts)
  checks.push({
    id: 'internal-links',
    category: 'links',
    status:
      brokenInternalLinks.length > 0
        ? 'error'
        : internalLinks.length >= 2
        ? 'passed'
        : internalLinks.length === 1
        ? 'warning'
        : 'error',
    points:
      brokenInternalLinks.length > 0
        ? 0
        : internalLinks.length >= 2
        ? 4
        : internalLinks.length === 1
        ? 2
        : 0,
    maxPoints: 4,
    title: 'Internal linking to AmaanEstate articles & listings',
    isCriticalForPublish: brokenInternalLinks.length > 0,
    detail:
      brokenInternalLinks.length > 0
        ? `${brokenInternalLinks.length} broken or legacy internal link(s) found: ${brokenInternalLinks
            .map((l) => l.href)
            .join(', ')}.`
        : `${internalLinks.length} verified internal link(s) in article body.`,
    recommendation:
      brokenInternalLinks.length > 0
        ? 'Replace broken or legacy /news/ internal links with valid published /articles/ or /properties/ URLs.'
        : internalLinks.length < 2
        ? 'Add at least 2 contextual internal links to related AmaanEstate research articles or property pages.'
        : undefined,
  });

  // 14. External citations (3 pts)
  checks.push({
    id: 'external-sources',
    category: 'links',
    status: externalLinks.length >= 1 ? 'passed' : 'warning',
    points: externalLinks.length >= 1 ? 3 : 0,
    maxPoints: 3,
    title: 'External authoritative source citations',
    detail: `${externalLinks.length} external reference link(s) in article body.`,
    recommendation:
      externalLinks.length === 0
        ? 'Cite at least 1 primary institutional, regulatory, or market data source for editorial trust (E-E-A-T).'
        : undefined,
  });

  // 15. Featured image & ALT attributes (8 pts)
  checks.push({
    id: 'image-seo-alt',
    category: 'media',
    status:
      featuredImagePresent && featuredAltPresent && missingInlineAltCount === 0
        ? 'passed'
        : !featuredImagePresent
        ? 'error'
        : 'warning',
    points:
      (featuredImagePresent ? 4 : 0) +
      (featuredAltPresent ? 2 : 0) +
      (missingInlineAltCount === 0 ? 2 : 0),
    maxPoints: 8,
    title: 'Featured cover image & descriptive ALT text',
    detail: !featuredImagePresent
      ? 'No featured cover image selected.'
      : `Cover ALT: ${featuredAltPresent ? 'Present' : 'Missing'} · Inline images missing ALT: ${missingInlineAltCount}.`,
    recommendation: !featuredImagePresent
      ? 'Select a high-resolution featured cover image (recommended 1200x630 or 16:9).'
      : !featuredAltPresent || missingInlineAltCount > 0
      ? 'Add descriptive ALT text for the featured image and all inline images.'
      : undefined,
  });

  // 16. Technical SEO: Canonical URL & Robots indexability (6 pts)
  const canonicalTrimmed = (input.canonicalUrl || '').trim();
  const canonicalValid =
    !canonicalTrimmed ||
    /^https:\/\/(www\.)?amaanestate\.com\//i.test(canonicalTrimmed) ||
    /^https?:\/\//i.test(canonicalTrimmed);
  const isNoIndex = robotsDirective.startsWith('noindex');

  checks.push({
    id: 'technical-canonical-robots',
    category: 'technical',
    status: !canonicalValid ? 'error' : isNoIndex ? 'warning' : 'passed',
    points: (canonicalValid ? 3 : 0) + (isNoIndex ? 1 : 3),
    maxPoints: 6,
    title: 'Canonical URL & search indexing directives',
    detail: `${canonicalTrimmed ? `Custom canonical: ${canonicalTrimmed}` : 'Self-referencing canonical (/articles/' + (slug || 'slug') + ')'} · Robots: ${robotsDirective}.`,
    recommendation: !canonicalValid
      ? 'Custom canonical URL must start with https:// or http://.'
      : isNoIndex
      ? 'This article is set to noindex and will be excluded from sitemap.xml and Google search results.'
      : undefined,
  });

  // 17. Structured Data & Classification readiness (6 pts)
  const hasCategory = Boolean(input.categoryId);
  const hasAuthor = Boolean(input.authorId);
  const schemaOk = hasCategory && hasAuthor && Boolean(title) && Boolean(excerpt || effectiveMetaDesc);
  checks.push({
    id: 'structured-data-readiness',
    category: 'technical',
    status: schemaOk ? 'passed' : !hasCategory || !hasAuthor ? 'error' : 'warning',
    points: (hasCategory ? 2 : 0) + (hasAuthor ? 2 : 0) + (Boolean(excerpt || effectiveMetaDesc) ? 2 : 0),
    maxPoints: 6,
    title: `Schema.org ${input.schemaType || 'Article'} + BreadcrumbList readiness`,
    detail: `Category: ${hasCategory ? 'Assigned' : 'Missing'} · Author: ${hasAuthor ? 'Assigned' : 'Missing'} · Schema: ${input.schemaType || 'Article'}.`,
    isCriticalForPublish: !hasCategory || !hasAuthor,
    recommendation: !schemaOk
      ? 'Ensure Category, Author, and Excerpt are populated so Article and BreadcrumbList JSON-LD validate cleanly.'
      : undefined,
  });

  const totalScore = checks.reduce((sum, c) => sum + c.points, 0);
  const maxPossible = checks.reduce((sum, c) => sum + c.maxPoints, 0);
  const score = maxPossible > 0 ? Math.min(100, Math.round((totalScore / maxPossible) * 100)) : 0;

  const grade: ArticleSeoAnalysisResult['grade'] =
    score >= 80
      ? 'Strong'
      : score >= 60
      ? 'Good'
      : score >= 40
      ? 'Needs Improvement'
      : 'Critical';

  const counts = {
    passed: checks.filter((c) => c.status === 'passed').length,
    warning: checks.filter((c) => c.status === 'warning').length,
    error: checks.filter((c) => c.status === 'error').length,
  };

  const intentAnalysis = analyzeIntentSatisfaction(
    searchIntent,
    `${title} ${excerpt} ${plainBody} ${links.map((l) => l.href).join(' ')}`,
    headings,
    internalLinks.length,
    wordCount
  );

  const criticalErrors = checks.filter(
    (c) => c.status === 'error' && (c.isCriticalForPublish || c.id === 'broken-internal-links')
  );
  const optionalRecommendations = checks.filter(
    (c) => c.status !== 'passed' && !criticalErrors.some((ce) => ce.id === c.id)
  );
  const passedItems = checks.filter((c) => c.status === 'passed');

  return {
    score,
    grade,
    checks,
    counts,
    metrics: {
      wordCount,
      keywordOccurrences,
      keywordDensityPct,
      h1Count,
      h2Count,
      h3Count,
      internalLinksCount: internalLinks.length,
      brokenInternalLinksCount: brokenInternalLinks.length,
      externalLinksCount: externalLinks.length,
      avgParagraphWords,
      longParagraphCount,
      seoTitleLength: titleLen,
      metaDescriptionLength: descLen,
      slugLength: slug.length,
      missingAltImagesCount: (featuredImagePresent && !featuredAltPresent ? 1 : 0) + missingInlineAltCount,
      duplicateTitleSlug: duplicateTitleArticle?.slug || null,
      duplicateDescriptionSlug: duplicateDescArticle?.slug || null,
    },
    intentAnalysis,
    checklist: {
      criticalErrors,
      optionalRecommendations,
      passedItems,
      readyToPublish: criticalErrors.length === 0,
    },
  };
}
