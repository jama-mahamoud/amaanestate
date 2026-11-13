export const LEGACY_NEWS_TO_ARTICLE_REDIRECTS: Record<string, string> = {
  'amaanestate-soomaaliya-platform-ka-casriga-ah-ee-kiraynta-iyo-iibinta-guryaha':
    'what-is-amaanestate-exploring-our-mission-vision-and-global-real-estate-platform',
};

export function normalizeArticleSlugInput(rawSlug?: string | null): string {
  if (!rawSlug) return '';
  let decoded = rawSlug;
  try {
    decoded = decodeURIComponent(rawSlug);
  } catch {
    decoded = rawSlug;
  }
  return decoded.trim().replace(/^\/+|\/+$/g, '');
}

export function resolveLegacyArticleRedirectSlug(rawSlug?: string | null): string | null {
  const normalized = normalizeArticleSlugInput(rawSlug).toLowerCase();
  if (!normalized) return null;
  return LEGACY_NEWS_TO_ARTICLE_REDIRECTS[normalized] || null;
}
