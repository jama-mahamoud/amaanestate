import { Article, Category, Property } from '../types';

export interface ExtractedLink {
  href: string;
  anchorText: string;
  isInternal: boolean;
  normalizedPath: string | null;
}

export interface ExtractedContentImage {
  src: string;
  alt: string;
  hasAlt: boolean;
}

export interface InternalLinkRecommendation {
  type: 'article' | 'property';
  id: string;
  title: string;
  url: string;
  subtitle: string;
  relevanceScore: number;
  reason: string;
  suggestedAnchorText: string;
  alreadyLinked: boolean;
}

const KNOWN_STATIC_PATHS = new Set([
  '/',
  '/buy',
  '/rent',
  '/about',
  '/contact',
  '/editorial-policy',
  '/corrections-policy',
  '/privacy-policy',
  '/cookie-policy',
  '/advertising-disclosure',
  '/terms',
  '/newsletter',
  '/search',
  '/investment',
  '/architecture',
  '/construction',
  '/home-living',
  '/news',
]);

export function normalizeInternalPath(rawHref: string): { isInternal: boolean; path: string | null } {
  const trimmed = (rawHref || '').trim();
  if (!trimmed || trimmed.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(trimmed)) {
    return { isInternal: false, path: null };
  }

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    const clean = trimmed.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
    return { isInternal: true, path: clean };
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (host === 'amaanestate.com' || host === 'www.amaanestate.com') {
      const clean = (parsed.pathname || '/').replace(/\/+$/, '') || '/';
      return { isInternal: true, path: clean };
    }
    return { isInternal: false, path: null };
  } catch {
    return { isInternal: false, path: null };
  }
}

export function extractLinksFromContent(content: string): ExtractedLink[] {
  if (!content) return [];
  const results: ExtractedLink[] = [];
  const seen = new Set<string>();

  // HTML anchor tags
  const htmlLinkRegex = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = htmlLinkRegex.exec(content)) !== null) {
    const href = match[1].trim();
    const anchorText = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const norm = normalizeInternalPath(href);
    const key = `${href}::${anchorText}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({
        href,
        anchorText,
        isInternal: norm.isInternal,
        normalizedPath: norm.path,
      });
    }
  }

  // Markdown links (excluding images ![...](...))
  const mdLinkRegex = /(?<!!)\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  while ((match = mdLinkRegex.exec(content)) !== null) {
    const anchorText = match[1].trim();
    const href = match[2].trim();
    const norm = normalizeInternalPath(href);
    const key = `${href}::${anchorText}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({
        href,
        anchorText,
        isInternal: norm.isInternal,
        normalizedPath: norm.path,
      });
    }
  }

  return results;
}

export function extractImagesFromContent(content: string): ExtractedContentImage[] {
  if (!content) return [];
  const images: ExtractedContentImage[] = [];

  const htmlImgRegex = /<img\b([^>]*)>/gi;
  let match: RegExpExecArray | null;
  while ((match = htmlImgRegex.exec(content)) !== null) {
    const attrs = match[1];
    const srcMatch = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    const altMatch = attrs.match(/\balt\s*=\s*["']([^"']*)["']/i);
    const src = srcMatch ? srcMatch[1].trim() : '';
    const alt = altMatch ? altMatch[1].trim() : '';
    if (src) {
      images.push({ src, alt, hasAlt: alt.length >= 3 });
    }
  }

  const mdImgRegex = /!\[([^\]]*)\]\(([^)\s]+)\)/g;
  while ((match = mdImgRegex.exec(content)) !== null) {
    const alt = match[1].trim();
    const src = match[2].trim();
    if (src) {
      images.push({ src, alt, hasAlt: alt.length >= 3 });
    }
  }

  return images;
}

export function findBrokenInternalLinks(
  links: ExtractedLink[],
  catalog: {
    articles: Array<{ slug: string; status?: string }>;
    properties?: Array<{ slug: string; publication_status?: string; listing_status?: string }>;
    categories?: Array<{ slug: string }>;
  }
): ExtractedLink[] {
  const validArticleSlugs = new Set(
    catalog.articles
      .filter((a) => !a.status || a.status === 'published')
      .map((a) => a.slug.toLowerCase())
  );
  const validPropertySlugs = new Set(
    (catalog.properties || [])
      .filter(
        (p) =>
          (!p.publication_status || p.publication_status === 'published') &&
          (!p.listing_status || ['available', 'pending', 'under_contract'].includes(p.listing_status))
      )
      .map((p) => p.slug.toLowerCase())
  );
  const validCategoryPaths = new Set(
    (catalog.categories || []).flatMap((c) => [`/${c.slug.toLowerCase()}`, `/category/${c.slug.toLowerCase()}`])
  );

  return links.filter((link) => {
    if (!link.isInternal || !link.normalizedPath) return false;
    const p = link.normalizedPath.toLowerCase();
    if (KNOWN_STATIC_PATHS.has(p) || validCategoryPaths.has(p)) return false;

    if (p.startsWith('/articles/')) {
      const slug = decodeURIComponent(p.slice('/articles/'.length)).toLowerCase();
      return !validArticleSlugs.has(slug);
    }
    if (p.startsWith('/properties/')) {
      const slug = decodeURIComponent(p.slice('/properties/'.length)).toLowerCase();
      return !validPropertySlugs.has(slug);
    }
    if (p.startsWith('/category/')) {
      return !validCategoryPaths.has(p);
    }
    // Legacy /news/:slug links are flagged as needing update to canonical /articles/:slug
    if (p.startsWith('/news/')) {
      return true;
    }
    return false;
  });
}

export function computeIncomingArticleLinks(articles: Article[]): Map<string, number> {
  const slugToId = new Map<string, string>();
  const incomingCounts = new Map<string, number>();

  const published = articles.filter((a) => a.status === 'published');
  for (const art of published) {
    slugToId.set(art.slug.toLowerCase(), art.id);
    incomingCounts.set(art.id, 0);
  }

  for (const source of published) {
    const links = extractLinksFromContent(source.content || '');
    const seenTargets = new Set<string>();
    for (const link of links) {
      if (!link.isInternal || !link.normalizedPath) continue;
      const lower = link.normalizedPath.toLowerCase();
      if (!lower.startsWith('/articles/')) continue;
      const targetSlug = decodeURIComponent(lower.slice('/articles/'.length));
      const targetId = slugToId.get(targetSlug);
      if (targetId && targetId !== source.id && !seenTargets.has(targetId)) {
        seenTargets.add(targetId);
        incomingCounts.set(targetId, (incomingCounts.get(targetId) || 0) + 1);
      }
    }
  }

  return incomingCounts;
}

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'into',
  'your',
  'real',
  'estate',
  'global',
  'market',
  'amaanestate',
  'how',
  'what',
  'when',
  'why',
  'are',
  'you',
  'guide',
  '2025',
  '2026',
]);

function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

export function recommendInternalLinks(
  input: {
    currentArticleId?: string;
    currentSlug?: string;
    title: string;
    excerpt?: string;
    content: string;
    categoryId?: string;
    categoryName?: string;
    focusKeyword?: string;
    supportingKeywords?: string[];
    targetCountry?: string;
    tags?: string[];
  },
  articles: Article[],
  properties: Property[],
  categories: Category[] = [],
  limit = 8
): InternalLinkRecommendation[] {
  const existingLinks = extractLinksFromContent(input.content || '');
  const linkedPaths = new Set(
    existingLinks
      .filter((l) => l.isInternal && l.normalizedPath)
      .map((l) => l.normalizedPath!.toLowerCase())
  );

  const queryText = [
    input.focusKeyword || '',
    ...(input.supportingKeywords || []),
    ...(input.tags || []),
    input.targetCountry || '',
    input.title || '',
    input.excerpt || '',
  ].join(' ');
  const queryTokens = new Set(tokenize(queryText));
  const focusLower = (input.focusKeyword || '').trim().toLowerCase();
  const countryLower = (input.targetCountry || '').trim().toLowerCase();

  const recommendations: InternalLinkRecommendation[] = [];

  for (const art of articles) {
    if (art.status !== 'published') continue;
    if (input.currentArticleId && art.id === input.currentArticleId) continue;
    if (input.currentSlug && art.slug === input.currentSlug) continue;

    const targetText = [
      art.title,
      art.excerpt,
      art.focus_keyword || '',
      ...(art.supporting_keywords || []),
      ...(art.tags?.map((t) => t.name) || []),
      art.category?.name || '',
    ]
      .join(' ')
      .toLowerCase();

    const matchedTokens: string[] = [];
    for (const tok of queryTokens) {
      if (targetText.includes(tok)) matchedTokens.push(tok);
    }

    let score = matchedTokens.length * 10;
    const reasons: string[] = [];

    if (focusLower && targetText.includes(focusLower)) {
      score += 30;
      reasons.push(`Shares focus topic "${input.focusKeyword}"`);
    }
    if (input.categoryId && art.category_id === input.categoryId) {
      score += 14;
      const catName =
        input.categoryName ||
        categories.find((c) => c.id === art.category_id)?.name ||
        art.category?.name ||
        'same section';
      reasons.push(`Same editorial section (${catName})`);
    }
    if (countryLower && targetText.includes(countryLower)) {
      score += 18;
      reasons.push(`Covers ${input.targetCountry}`);
    }
    if (matchedTokens.length > 0 && reasons.length === 0) {
      reasons.push(`Overlapping terms: ${matchedTokens.slice(0, 3).join(', ')}`);
    }

    if (score <= 0) continue;

    const url = `/articles/${art.slug}`;
    recommendations.push({
      type: 'article',
      id: art.id,
      title: art.title,
      url,
      subtitle: `${art.category?.name || 'Editorial'} · Article`,
      relevanceScore: Math.min(99, score),
      reason: reasons.slice(0, 2).join(' · '),
      suggestedAnchorText: art.focus_keyword?.trim() || art.title,
      alreadyLinked: linkedPaths.has(url.toLowerCase()),
    });
  }

  for (const prop of properties) {
    if (prop.publication_status !== 'published') continue;
    if (!['available', 'pending', 'under_contract'].includes(prop.listing_status)) continue;
    if (prop.is_sample || prop.source_name === 'showcase_sample') continue;

    const propText = [
      prop.title,
      prop.city,
      prop.state_region || '',
      prop.country,
      prop.property_type,
      prop.transaction_type,
      prop.description || '',
    ]
      .join(' ')
      .toLowerCase();

    const matchedTokens: string[] = [];
    for (const tok of queryTokens) {
      if (propText.includes(tok)) matchedTokens.push(tok);
    }

    let score = matchedTokens.length * 12;
    const reasons: string[] = [];

    if (countryLower && prop.country.toLowerCase().includes(countryLower)) {
      score += 24;
      reasons.push(`Active property in ${prop.country}`);
    }
    if (prop.city && queryText.toLowerCase().includes(prop.city.toLowerCase())) {
      score += 28;
      reasons.push(`Located in ${prop.city}`);
    }
    if (matchedTokens.length > 0 && reasons.length === 0) {
      reasons.push(`Matches ${matchedTokens.slice(0, 2).join(', ')}`);
    }

    if (score < 12) continue;

    const url = `/properties/${prop.slug}`;
    recommendations.push({
      type: 'property',
      id: prop.id,
      title: prop.title,
      url,
      subtitle: `${prop.city}, ${prop.country} · For ${prop.transaction_type === 'sale' ? 'Sale' : 'Rent'}`,
      relevanceScore: Math.min(99, score),
      reason: reasons.join(' · '),
      suggestedAnchorText: `${prop.title} (${prop.city})`,
      alreadyLinked: linkedPaths.has(url.toLowerCase()),
    });
  }

  return recommendations
    .sort((a, b) => Number(a.alreadyLinked) - Number(b.alreadyLinked) || b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
}
