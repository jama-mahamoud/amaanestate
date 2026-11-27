export const CANONICAL_SITE_ORIGIN = 'https://www.amaanestate.com';

export const DEFAULT_SEO_TITLE =
  'AmaanEstate | Global Real Estate News & Market Research';

export const DEFAULT_SEO_DESCRIPTION =
  'Explore global real estate market intelligence, residential price trends, rental dynamics, investment insights, and global property news on AmaanEstate.';

export const DEFAULT_OG_IMAGE_PATH =
  '/images/articles/sovereign-capital-logistics-corridors.jpg';

export const DEFAULT_OG_IMAGE_ALT =
  'AmaanEstate — Global Real Estate Media, Research & Market Intelligence';

export function stripHtmlForSeo(raw?: string | null): string {
  if (!raw) return '';
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatSeoTitle(
  rawTitle?: string | null,
  fallback: string = DEFAULT_SEO_TITLE
): string {
  const clean = (rawTitle || '').replace(/\s+/g, ' ').trim();
  if (!clean) return fallback;
  if (/amaan\s*estate/i.test(clean)) {
    if (clean.length <= 64) return clean;
    const candidate = clean.slice(0, 64);
    const lastSpace = candidate.lastIndexOf(' ');
    const base = (lastSpace >= 36 ? candidate.slice(0, lastSpace) : candidate)
      .replace(/[,;:\-–—|\s]+$/g, '')
      .trim();
    return base || candidate.trim();
  }
  const withBrand = `${clean} | AmaanEstate`;
  if (withBrand.length <= 64) {
    return withBrand;
  }
  if (clean.length <= 64) {
    return clean;
  }
  const candidate = clean.slice(0, 64);
  const lastSpace = candidate.lastIndexOf(' ');
  const trimmed = (lastSpace >= 36 ? candidate.slice(0, lastSpace) : candidate)
    .replace(/[,;:\-–—|\s]+$/g, '')
    .trim();
  return trimmed || candidate.trim();
}

export function truncateAtWordBoundary(
  rawText?: string | null,
  maxLen: number = 158,
  fallback: string = DEFAULT_SEO_DESCRIPTION
): string {
  const clean = stripHtmlForSeo(rawText);
  if (!clean) return fallback;
  if (clean.length <= maxLen) return clean;

  const sliceLimit = Math.max(20, maxLen - 1);
  const candidate = clean.slice(0, sliceLimit);
  const lastSpace = candidate.lastIndexOf(' ');
  const cutoff =
    lastSpace >= Math.floor(sliceLimit * 0.6) ? candidate.slice(0, lastSpace) : candidate;
  const trimmed = cutoff.replace(/[,;:\-–—\s]+$/g, '').trim();
  return `${trimmed || candidate.trim()}…`;
}

const SOMALI_INDICATOR_WORDS = new Set([
  'iyo',
  'ee',
  'oo',
  'waa',
  'lagu',
  'waxaa',
  'sidoo',
  'balse',
  'guryaha',
  'deegaanka',
  'kiraynta',
  'kirada',
  'iibka',
  'soomaaliya',
  'soomaalida',
  'muqdisho',
  'hargeysa',
  'dhismaha',
  'dhaqaalaha',
  'maalgelinta',
  'maalgalinta',
  'nidaamka',
  'faa',
  'khasaare',
  'qaabka',
  'magaalada',
  'bulshada',
]);

export function detectContentLanguage(params: {
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
  alternateLanguage?: string | null;
  explicitLang?: string | null;
}): 'en' | 'so' {
  const explicit = (params.explicitLang || '').trim().toLowerCase();
  if (explicit === 'so' || explicit === 'en') {
    return explicit;
  }

  const altLang = (params.alternateLanguage || '').trim().toLowerCase();
  if (altLang === 'en') {
    return 'so';
  }

  const sample = stripHtmlForSeo(
    `${params.title || ''} ${params.excerpt || ''} ${(params.content || '').slice(0, 1400)}`
  ).toLowerCase();

  if (!sample) return 'en';

  const tokens = sample.split(/[^a-z']+/).filter(Boolean);
  let totalHits = 0;
  const distinctHits = new Set<string>();

  for (const token of tokens) {
    if (SOMALI_INDICATOR_WORDS.has(token)) {
      totalHits += 1;
      distinctHits.add(token);
      if (distinctHits.size >= 3 || totalHits >= 5) {
        return 'so';
      }
    }
  }

  return 'en';
}

export function buildHomeStructuredData(origin: string = CANONICAL_SITE_ORIGIN) {
  const baseUrl = origin.replace(/\/+$/, '');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'AmaanEstate',
        alternateName: 'Amaan Estate',
        url: `${baseUrl}/`,
        description:
          'AmaanEstate is a global real estate media, research, and market intelligence platform providing property market news, housing research, real estate investment insights, and international market analysis.',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/images/amaanestate-logo.png`,
          width: 1672,
          height: 941,
        },
        sameAs: [
          'https://x.com/amaanestate',
          'https://linkedin.com/company/amaanestate',
          'https://instagram.com/amaanestate',
          'https://youtube.com/@amaanestate',
          'https://facebook.com/amaanestate',
          'https://t.me/amaanestate',
          'https://tiktok.com/@amaanestate',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        name: 'AmaanEstate',
        alternateName: 'Amaan Estate',
        url: `${baseUrl}/`,
        description:
          'Global real estate media, research and market intelligence platform.',
        publisher: {
          '@id': `${baseUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

export function buildBreadcrumbStructuredData(
  items: Array<{ name: string; item: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((entry, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

export interface StaticRouteSeoMeta {
  title: string;
  description: string;
  pageName: string;
  schemaType?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';
}

export const STATIC_ROUTE_SEO_META: Record<string, StaticRouteSeoMeta> = {
  '/': {
    title: DEFAULT_SEO_TITLE,
    description: DEFAULT_SEO_DESCRIPTION,
    pageName: 'Home',
    schemaType: 'WebPage',
  },
  '/about': {
    title: 'About AmaanEstate | Real Estate Media & Market Research',
    description:
      'Learn about AmaanEstate, an independent global real estate media, housing research, and market intelligence platform serving investors and professionals.',
    pageName: 'About AmaanEstate',
    schemaType: 'AboutPage',
  },
  '/contact': {
    title: 'Contact AmaanEstate | Editorial & Market Research Desk',
    description:
      'Contact AmaanEstate for real estate news tips, market intelligence collaborations, architecture submissions, advertising partnerships, or reader corrections.',
    pageName: 'Contact',
    schemaType: 'ContactPage',
  },
  '/editorial-policy': {
    title: 'Editorial Policy & Standards | AmaanEstate',
    description:
      'AmaanEstate editorial independence, real estate research verification methodology, corrections policy, and advertising separation standards.',
    pageName: 'Editorial Policy & Standards',
    schemaType: 'WebPage',
  },
  '/corrections-policy': {
    title: 'Corrections & Fact-Checking Policy | AmaanEstate',
    description:
      'How AmaanEstate verifies real estate market data, property statistics, primary regulatory sources, and handles transparent factual corrections.',
    pageName: 'Corrections & Fact-Checking Policy',
    schemaType: 'WebPage',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | AmaanEstate',
    description:
      'Privacy Policy for AmaanEstate explaining what personal and technical information is collected, how it is stored, and how readers manage preferences.',
    pageName: 'Privacy Policy',
    schemaType: 'WebPage',
  },
  '/cookie-policy': {
    title: 'Cookie Policy | AmaanEstate',
    description:
      'Cookie Policy for AmaanEstate detailing essential authentication storage, analytics tags, advertising cookies, and browser privacy controls.',
    pageName: 'Cookie Policy',
    schemaType: 'WebPage',
  },
  '/advertising-disclosure': {
    title: 'Advertising Disclosure | AmaanEstate',
    description:
      'Advertising and Commercial Disclosure for AmaanEstate explaining editorial independence, display ads, sponsored content labels, and listing separation.',
    pageName: 'Advertising Disclosure',
    schemaType: 'WebPage',
  },
  '/terms': {
    title: 'Terms of Use | AmaanEstate',
    description:
      'Terms of Use for AmaanEstate covering editorial content, real estate research disclaimers, marketplace listings, intellectual property, and acceptable use.',
    pageName: 'Terms of Use',
    schemaType: 'WebPage',
  },
  '/newsletter': {
    title: 'Newsletter & Real Estate Briefing | AmaanEstate',
    description:
      'Subscribe to AmaanEstate global real estate news, housing research briefings, investment insights, and property market analysis.',
    pageName: 'Newsletter',
    schemaType: 'WebPage',
  },
};

export const CATEGORY_FALLBACK_SEO_META: Record<
  string,
  { name: string; title: string; description: string }
> = {
  investment: {
    name: 'Real Estate Investment',
    title: 'Real Estate Investment Analysis | AmaanEstate',
    description:
      'Institutional real estate investment analysis, REIT capital cycles, logistics corridors, multifamily underwriting, and global property yield research.',
  },
  architecture: {
    name: 'Architecture',
    title: 'Architecture & Urban Design | AmaanEstate',
    description:
      'Critical architectural monographs, adaptive reuse case studies, biophilic towers, passive cooling residences, and climate-resilient urban design.',
  },
  construction: {
    name: 'Construction',
    title: 'Construction Engineering & Tech | AmaanEstate',
    description:
      'Mass timber engineering, low-carbon geopolymer concrete, modular prefabrication economics, LiDAR digital twins, and building envelope retrofits.',
  },
  'home-living': {
    name: 'Home & Living',
    title: 'Home & Living Design & Energy | AmaanEstate',
    description:
      'Residential spatial design, home battery microgrids, circadian lighting, compact urban joinery, and deep-energy heritage townhouse retrofits.',
  },
  news: {
    name: 'Global Real Estate News',
    title: 'Global Real Estate News & Policy | AmaanEstate',
    description:
      'Global real estate policy news, housing supply reforms, urban master plans, building decarbonization mandates, and international market briefings.',
  },
};
