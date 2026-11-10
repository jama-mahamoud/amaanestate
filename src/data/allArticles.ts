import { MediaItem, Tag } from '../types';
import { SeedEditorialArticle, INVESTMENT_ARTICLES } from './articlesInvestment';
import { ARCHITECTURE_ARTICLES } from './articlesArchitecture';
import { CONSTRUCTION_ARTICLES } from './articlesConstruction';
import { HOME_LIVING_ARTICLES } from './articlesHomeLiving';
import { NEWS_ARTICLES } from './articlesNews';

export type { SeedEditorialArticle };

export const ALL_SEED_EDITORIAL_ARTICLES: SeedEditorialArticle[] = [
  ...INVESTMENT_ARTICLES,
  ...ARCHITECTURE_ARTICLES,
  ...CONSTRUCTION_ARTICLES,
  ...HOME_LIVING_ARTICLES,
  ...NEWS_ARTICLES,
];

export const SEED_ARTICLE_BY_SLUG: Record<string, SeedEditorialArticle> = Object.fromEntries(
  ALL_SEED_EDITORIAL_ARTICLES.map((article) => [article.slug, article])
);

export const IMAGE_BYTE_SIZES: Record<string, number> = {
  '/images/articles/adaptive-reuse-industrial-silos.jpg': 979373,
  '/images/articles/biophilic-high-rise-sky-gardens.jpg': 1046332,
  '/images/articles/brown-discount-commercial-retrofit-yields.jpg': 1075973,
  '/images/articles/build-to-rent-multifamily-underwriting.jpg': 1244432,
  '/images/articles/circadian-lighting-acoustic-home-design.jpg': 935898,
  '/images/articles/courtyard-residences-tactile-lime-plaster.jpg': 1001006,
  '/images/articles/data-center-power-land-real-estate.jpg': 939360,
  '/images/articles/deep-energy-heritage-townhouse-retrofit.jpg': 863409,
  '/images/articles/digital-twin-lidar-construction-productivity.jpg': 948972,
  '/images/articles/dubai-real-estate-strategy-2033-dld.jpg': 997948,
  '/images/articles/eu-construction-products-regulation-dpp.jpg': 911989,
  '/images/articles/eu-epbd-commercial-retrofit-mandate.jpg': 1101242,
  '/images/articles/geopolymer-low-carbon-concrete-trials.jpg': 870349,
  '/images/articles/home-battery-microgrids-heat-pump-roi.jpg': 1010230,
  '/images/articles/hybrid-mass-timber-seismic-engineering.jpg': 1043738,
  '/images/articles/prefabricated-facade-overcladding-retrofits.jpg': 1047301,
  '/images/articles/rammed-earth-arid-climate-architecture.jpg': 938766,
  '/images/articles/reit-debt-maturities-balance-sheets.jpg': 828248,
  '/images/articles/singapore-ura-master-plan-housing-supply.jpg': 1142807,
  '/images/articles/small-space-urban-apartment-joinery.jpg': 798915,
  '/images/articles/sovereign-capital-logistics-corridors.jpg': 978992,
  '/images/articles/sponge-city-coastal-urban-design.jpg': 1206231,
  '/images/articles/travertine-climate-responsive-pavilions.jpg': 818426,
  '/images/articles/uk-planning-infrastructure-act-housing-reform.jpg': 947560,
  '/images/articles/volumetric-modular-prefabrication-economics.jpg': 1000496,
};

export function slugifyKeyword(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatTagDisplayName(raw: string): string {
  return raw
    .split(/\s+/)
    .map((word) => {
      if (/^(REIT|REITs|EU|UK|EPBD|URA|DLD|DPP|CPO|ROI|LFP|BTR|LiDAR|EN)$/i.test(word)) {
        return word.toUpperCase();
      }
      if (word.includes('-')) {
        return word
          .split('-')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join('-');
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function countArticleBodyWords(html: string): number {
  const withoutRefs = html.split(/<h2>References/i)[0];
  const plain = withoutRefs.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return plain ? plain.split(' ').filter(Boolean).length : 0;
}

export function computeReadingTimeMinutes(html: string): number {
  const words = countArticleBodyWords(html);
  return Math.max(1, Math.ceil(words / 200));
}

// Build deduplicated Tags list combining foundational editorial tags + article keywords
const BASE_TAGS: Tag[] = [
  { id: 'tag-capital', name: 'Capital Markets', slug: 'capital-markets', created_at: '2026-01-10T09:00:00Z' },
  { id: 'tag-timber', name: 'Mass Timber', slug: 'mass-timber', created_at: '2026-01-10T09:00:00Z' },
  { id: 'tag-sustainable', name: 'Sustainable Design', slug: 'sustainable-design', created_at: '2026-01-10T09:00:00Z' },
  { id: 'tag-policy', name: 'Urban Policy', slug: 'urban-policy', created_at: '2026-01-10T09:00:00Z' },
  { id: 'tag-smart-homes', name: 'Smart Homes', slug: 'smart-homes', created_at: '2026-01-10T09:00:00Z' },
  { id: 'tag-adaptive', name: 'Adaptive Reuse', slug: 'adaptive-reuse', created_at: '2026-01-10T09:00:00Z' },
  { id: 'tag-reits', name: 'REITs', slug: 'reits', created_at: '2026-01-10T09:00:00Z' },
  { id: 'tag-concrete', name: 'Low-Carbon Concrete', slug: 'low-carbon-concrete', created_at: '2026-01-10T09:00:00Z' },
];

const tagMap = new Map<string, Tag>(BASE_TAGS.map((t) => [t.slug, t]));

for (const art of ALL_SEED_EDITORIAL_ARTICLES) {
  const rawKeywords = [art.primary_keyword, ...art.secondary_keywords];
  for (const kw of rawKeywords) {
    const slug = slugifyKeyword(kw);
    if (!slug || tagMap.has(slug)) continue;
    tagMap.set(slug, {
      id: `tag-${slug}`,
      name: formatTagDisplayName(kw),
      slug,
      created_at: art.published_at,
    });
  }
}

export const EDITORIAL_TAGS: Tag[] = Array.from(tagMap.values());

export function getTagsForSeedArticle(article: SeedEditorialArticle): Tag[] {
  const seen = new Set<string>();
  const result: Tag[] = [];
  for (const kw of [article.primary_keyword, ...article.secondary_keywords]) {
    const slug = slugifyKeyword(kw);
    const tag = tagMap.get(slug);
    if (tag && !seen.has(tag.slug)) {
      seen.add(tag.slug);
      result.push(tag);
    }
  }
  return result.slice(0, 6);
}

export const EDITORIAL_MEDIA_ITEMS: MediaItem[] = ALL_SEED_EDITORIAL_ARTICLES.map((art, index) => {
  const fileName = art.featured_image.split('/').pop() || `${art.slug}.jpg`;
  return {
    id: `med-art-${index + 1}`,
    file_name: fileName,
    storage_path: `articles/${fileName}`,
    public_url: art.featured_image,
    mime_type: 'image/jpeg',
    size_bytes: IMAGE_BYTE_SIZES[art.featured_image] || 950000,
    alt_text: art.featured_image_alt,
    created_at: art.published_at,
  };
});
