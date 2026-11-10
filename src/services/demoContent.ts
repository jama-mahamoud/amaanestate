import {
  Article,
  Author,
  Category,
  ContactMessage,
  MediaItem,
  NewsletterSubscriber,
  Profile,
  Role,
  SiteSettings,
  Tag,
} from '../types';
import {
  ALL_SEED_EDITORIAL_ARTICLES,
  EDITORIAL_MEDIA_ITEMS,
  EDITORIAL_TAGS,
  computeReadingTimeMinutes,
  getTagsForSeedArticle,
} from '../data/allArticles';

export interface DemoDatabase {
  roles: Role[];
  profiles: Profile[];
  categories: Category[];
  authors: Author[];
  tags: Tag[];
  articles: Article[];
  media: MediaItem[];
  subscribers: NewsletterSubscriber[];
  messages: ContactMessage[];
  siteSettings: SiteSettings;
}

const DEMO_STORAGE_KEY = 'amaan_estate_demo_db_v2';

const initialRoles: Role[] = [
  { id: 'role-admin', name: 'admin', description: 'Full administrative control over content, settings, users, and roles', created_at: '2026-01-01T00:00:00Z' },
  { id: 'role-editor', name: 'editor', description: 'Can create, edit, schedule, publish, and feature all articles and categories', created_at: '2026-01-01T00:00:00Z' },
  { id: 'role-author', name: 'author', description: 'Can create and edit own article drafts', created_at: '2026-01-01T00:00:00Z' },
  { id: 'role-reader', name: 'reader', description: 'Default authenticated subscriber account', created_at: '2026-01-01T00:00:00Z' },
];

const initialCategories: Category[] = [
  {
    id: 'cat-investment',
    name: 'Investment',
    slug: 'investment',
    description: 'Institutional capital flows, global property yields, REIT structures, cross-border financing, and regional market cycles.',
    image_url: 'investment-skyline',
    display_order: 1,
    seo_title: 'Real Estate Investment Insights & Market Strategy',
    seo_description: 'Global real estate investment research, capital markets analysis, property finance, and long-term portfolio strategies.',
    created_at: '2026-01-05T08:00:00Z',
  },
  {
    id: 'cat-architecture',
    name: 'Architecture',
    slug: 'architecture',
    description: 'Contemporary spatial design, landmark cultural buildings, passive climate engineering, and adaptive reuse across global cities.',
    image_url: 'architecture-pavilion',
    display_order: 2,
    seo_title: 'Modern Architecture & Spatial Design',
    seo_description: 'Architectural monographs, iconic structures, sustainable design philosophies, and urban spatial innovation.',
    created_at: '2026-01-05T08:00:00Z',
  },
  {
    id: 'cat-construction',
    name: 'Construction',
    slug: 'construction',
    description: 'Structural engineering, mass-timber systems, low-carbon concrete, modular prefabrication, and construction technology.',
    image_url: 'construction-timber',
    display_order: 3,
    seo_title: 'Construction Technology, Materials & Engineering',
    seo_description: 'Engineering breakthroughs, sustainable building materials, modular construction, and site productivity research.',
    created_at: '2026-01-05T08:00:00Z',
  },
  {
    id: 'cat-home-living',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Residential architecture, tactile interior craft, smart energy systems, biophilic courtyards, and thoughtful domestic living.',
    image_url: 'home-living',
    display_order: 4,
    seo_title: 'Home & Living, Smart Homes & Residential Design',
    seo_description: 'Residential design insights, smart home automation, energy-efficient renovations, and architectural living spaces.',
    created_at: '2026-01-05T08:00:00Z',
  },
  {
    id: 'cat-news',
    name: 'News',
    slug: 'news',
    description: 'International property regulation, central bank policy impacts, zoning reform, and urban infrastructure milestones.',
    image_url: 'global-news',
    display_order: 5,
    seo_title: 'Global Real Estate News & Policy Briefings',
    seo_description: 'Breaking international property industry developments, regulatory shifts, and urban economic news.',
    created_at: '2026-01-05T08:00:00Z',
  },
];

const initialAuthors: Author[] = [
  {
    id: 'auth-eleanor',
    name: 'Eleanor Vance',
    slug: 'eleanor-vance',
    title: 'Chief Architecture & Urbanism Editor',
    bio: 'Architectural historian and critic covering civic pavilions, adaptive reuse, and climate-responsive urbanism across Europe, East Africa, and the Gulf.',
    avatar_url: 'author-portrait',
    email: 'eleanor.vance@amaanestate.com',
    twitter_url: 'https://x.com/amaanestate',
    linkedin_url: 'https://linkedin.com/company/amaanestate',
    active: true,
    created_at: '2026-01-10T09:00:00Z',
  },
  {
    id: 'auth-marcus',
    name: 'Marcus Thorne',
    slug: 'marcus-thorne',
    title: 'Senior Real Estate Capital Correspondent',
    bio: 'Former institutional real estate analyst focusing on sovereign infrastructure capital, debt refinancing cycles, and cross-border yield spreads.',
    avatar_url: 'author-portrait',
    email: 'marcus.thorne@amaanestate.com',
    linkedin_url: 'https://linkedin.com/company/amaanestate',
    active: true,
    created_at: '2026-01-10T09:00:00Z',
  },
  {
    id: 'auth-kenji',
    name: 'Dr. Kenji Takahashi',
    slug: 'kenji-takahashi',
    title: 'Structural & Materials Research Fellow',
    bio: 'Structural engineer investigating hybrid mass-timber frames, geopolymer concrete, and seismic resilience in high-density cities.',
    avatar_url: 'author-portrait',
    email: 'kenji.takahashi@amaanestate.com',
    active: true,
    created_at: '2026-01-10T09:00:00Z',
  },
  {
    id: 'auth-nadia',
    name: 'Nadia Al-Mansoor',
    slug: 'nadia-al-mansoor',
    title: 'Residential Design & Smart Living Editor',
    bio: 'Covers tactile materiality, net-zero residential retrofits, indoor environmental quality, and quiet domestic architecture.',
    avatar_url: 'author-portrait',
    email: 'nadia.almansoor@amaanestate.com',
    active: true,
    created_at: '2026-01-10T09:00:00Z',
  },
];

const CATEGORY_ID_BY_SLUG: Record<string, string> = Object.fromEntries(
  initialCategories.map((c) => [c.slug, c.id])
);

const AUTHOR_ID_BY_SLUG: Record<string, string> = Object.fromEntries(
  initialAuthors.map((a) => [a.slug, a.id])
);

const initialTags: Tag[] = EDITORIAL_TAGS;

const publishedSeedArticles: Article[] = ALL_SEED_EDITORIAL_ARTICLES.map((art) => ({
  id: art.id,
  title: art.title,
  slug: art.slug,
  excerpt: art.excerpt,
  content: art.content,
  featured_image: art.featured_image,
  featured_image_alt: art.featured_image_alt,
  featured_image_caption: art.featured_image_caption,
  gallery_images: art.gallery_images,
  category_id: CATEGORY_ID_BY_SLUG[art.category_slug] || 'cat-investment',
  author_id: AUTHOR_ID_BY_SLUG[art.author_slug] || 'auth-eleanor',
  tags: getTagsForSeedArticle(art),
  keywords: [art.primary_keyword, ...art.secondary_keywords],
  status: 'published',
  is_featured: art.is_featured,
  reading_time: computeReadingTimeMinutes(art.content),
  view_count: art.view_count,
  seo_title: art.seo_title,
  seo_description: art.seo_description,
  og_image: art.featured_image,
  published_at: art.published_at,
  created_at: art.published_at,
}));

const workflowSampleArticles: Article[] = [
  {
    id: 'art-draft-1',
    title: 'Q4 Sovereign Infrastructure & Urban Land Benchmarks (Editorial Draft)',
    slug: 'q4-sovereign-infrastructure-urban-land-benchmarks',
    excerpt: 'Working editorial draft compiling comparative urban land yields across emerging intermodal logistics corridors.',
    content: `<p>Working editorial draft analyzing comparative urban land yields, municipal bond issuance, and transit corridor valuation multiples across emerging markets.</p>`,
    featured_image: 'investment-skyline',
    gallery_images: [],
    category_id: 'cat-investment',
    author_id: 'auth-marcus',
    status: 'draft',
    is_featured: false,
    reading_time: 6,
    view_count: 0,
    seo_title: 'Q4 Sovereign Infrastructure & Urban Land Benchmarks',
    seo_description: 'Draft research briefing on urban land yields and municipal bond spreads.',
    created_at: '2026-11-05T10:00:00Z',
  },
  {
    id: 'art-scheduled-1',
    title: 'Zero-Carbon Port Electrification Standards for Cold-Chain Terminals (Scheduled)',
    slug: 'zero-carbon-port-electrification-cold-chain-terminals',
    excerpt: 'Scheduled engineering briefing examining high-voltage shore power and solar microgrids across automated maritime freight piers.',
    content: `<p>Scheduled engineering report examining clean microgrids and shore power standards for refrigerated port logistics terminals.</p>`,
    featured_image: 'construction-timber',
    gallery_images: [],
    category_id: 'cat-construction',
    author_id: 'auth-kenji',
    status: 'scheduled',
    is_featured: false,
    reading_time: 5,
    view_count: 0,
    scheduled_for: '2026-12-01T08:00:00Z',
    created_at: '2026-11-08T14:00:00Z',
  },
];

const initialArticles: Article[] = [...publishedSeedArticles, ...workflowSampleArticles];

const initialMedia: MediaItem[] = [
  ...EDITORIAL_MEDIA_ITEMS,
  {
    id: 'med-hero-1',
    file_name: 'hero_editorial_architecture.jpg',
    storage_path: 'demo/hero_editorial_architecture.jpg',
    public_url: 'hero-pavilion',
    mime_type: 'image/jpeg',
    size_bytes: 184200,
    alt_text: 'Contemporary travertine limestone pavilion at golden hour',
    created_at: '2026-10-20T10:00:00Z',
  },
];

const initialSubscribers: NewsletterSubscriber[] = [
  {
    id: 'sub-1',
    email: 'research@nordiccapital.example',
    status: 'subscribed',
    source: 'homepage',
    confirmed_at: '2026-10-12T08:00:00Z',
    created_at: '2026-10-12T08:00:00Z',
  },
  {
    id: 'sub-2',
    email: 'studio@ateliervance.example',
    status: 'subscribed',
    source: 'article',
    confirmed_at: '2026-10-19T14:30:00Z',
    created_at: '2026-10-19T14:30:00Z',
  },
];

const initialMessages: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Henrik Lindqvist',
    email: 'h.lindqvist@urbanforum.example',
    subject: 'Syndication & Research Partnership Inquiry',
    message: 'We would like to discuss syndicating your quarterly mass-timber engineering research briefings for our European architectural fellows.',
    status: 'unread',
    admin_notes: '',
    created_at: '2026-11-02T11:15:00Z',
  },
];

const initialProfiles: Profile[] = [
  {
    id: 'prof-admin',
    email: 'admin@amaanestate.com',
    full_name: 'Chief Editor (Demo)',
    role_id: 'role-admin',
    role: initialRoles[0],
    bio: 'Managing editorial director overseeing AMAAN ESTATE global coverage.',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prof-editor',
    email: 'editor@amaanestate.com',
    full_name: 'Senior Desk Editor (Demo)',
    role_id: 'role-editor',
    role: initialRoles[1],
    bio: 'Commissioning editor for Architecture and Construction research.',
    created_at: '2026-01-02T00:00:00Z',
  },
];

const initialSiteSettings: SiteSettings = {
  id: 1,
  site_name: 'AMAAN ESTATE',
  tagline: 'Global Real Estate Media, Research & Knowledge Platform',
  domain: 'amaanestate.com',
  default_seo_title: 'AMAAN ESTATE — Global Real Estate Media, Research & Knowledge',
  default_seo_description:
    'Independent international reporting, institutional research, and editorial analysis on real estate investment, architecture, construction, home living, and property markets.',
  default_og_image: 'hero-pavilion',
  editorial_email: 'editorial@amaanestate.com',
  social_links: {
    twitter: 'https://x.com/amaanestate',
    linkedin: 'https://linkedin.com/company/amaanestate',
    instagram: 'https://instagram.com/amaanestate',
    youtube: '',
  },
  adsense_client_id: '',
  adsense_enabled: false,
  updated_at: '2026-11-01T00:00:00Z',
};

export function createInitialDemoDb(): DemoDatabase {
  return {
    roles: initialRoles,
    profiles: initialProfiles,
    categories: initialCategories,
    authors: initialAuthors,
    tags: initialTags,
    articles: initialArticles,
    media: initialMedia,
    subscribers: initialSubscribers,
    messages: initialMessages,
    siteSettings: initialSiteSettings,
  };
}

export function loadDemoDb(): DemoDatabase {
  if (typeof window === 'undefined') {
    return createInitialDemoDb();
  }
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) {
      const seed = createInitialDemoDb();
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as DemoDatabase;
    return {
      ...createInitialDemoDb(),
      ...parsed,
    };
  } catch {
    return createInitialDemoDb();
  }
}

export function saveDemoDb(db: DemoDatabase): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.warn('Unable to persist demo state to localStorage:', err);
  }
}

export function hydrateDemoArticle(db: DemoDatabase, article: Article): Article {
  const category = db.categories.find((c) => c.id === article.category_id) || null;
  const author = db.authors.find((a) => a.id === article.author_id) || null;
  return {
    ...article,
    category,
    author,
    tags: article.tags || [],
  };
}
