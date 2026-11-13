import {
  Article,
  Author,
  Category,
  ContactMessage,
  MediaItem,
  NewsletterSubscriber,
  Profile,
  Property,
  PropertyEnquiry,
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
  properties: Property[];
  propertyEnquiries: PropertyEnquiry[];
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
  site_name: 'AmaanEstate',
  tagline: 'Global Real Estate Media, Research & Marketplace',
  domain: 'amaanestate.com',
  default_seo_title: 'AmaanEstate | Global Real Estate News, Research & Property Marketplace',
  default_seo_description:
    'Explore global real estate news, housing market research, property investment insights, market trends and property listings with AmaanEstate.',
  default_og_image: 'hero-pavilion',
  editorial_email: 'editorial@amaanestate.com',
  social_links: {
    twitter: 'https://x.com/amaanestate',
    linkedin: 'https://linkedin.com/company/amaanestate',
    instagram: 'https://instagram.com/amaanestate',
    youtube: 'https://youtube.com/@amaanestate',
  },
  adsense_client_id: 'ca-pub-7965451372324178',
  adsense_enabled: true,
  updated_at: '2026-11-01T00:00:00Z',
};

export const INITIAL_SHOWCASE_PROPERTIES: Property[] = [
  {
    id: 'a0000001-0000-0000-0000-000000000001',
    title: 'The Sky Glass Penthouse at Dubai Marina',
    slug: 'the-sky-glass-penthouse-dubai-marina',
    transaction_type: 'sale',
    property_type: 'apartment',
    listing_status: 'available',
    publication_status: 'published',
    price: 4850000,
    currency: 'USD',
    rental_period: null,
    available_from: null,
    bedrooms: 4,
    bathrooms: 5,
    area_value: 5800,
    area_unit: 'sqft',
    address_line: 'Al Marsa Street, Dubai Marina',
    city: 'Dubai',
    state_region: 'Dubai',
    country: 'United Arab Emirates',
    postal_code: '00000',
    latitude: 25.0772,
    longitude: 55.1384,
    description: `A masterclass in modern skyward living, this contemporary duplex penthouse showcases sweeping panoramic vistas of the Arabian Gulf and the illuminated Dubai Marina skyline.

Designed with double-height volume, seamless slabs of honed travertine, and acoustic floor-to-ceiling glass envelopes, the residence bridges dramatic scale with intimate residential craftsmanship. Features include an Italian marble show kitchen, bespoke recessed circadian lighting, private lift access, and an expansive cantilevered sunset loggia ideal for year-round entertaining.

Note: This presentation is an illustrative architectural sample for platform demonstration purposes and is not an active real estate listing.`,
    features: [
      'Double-height ceiling gallery',
      'Panoramic water and skyline terrace',
      'Honed travertine limestone interior',
      'Private high-speed keycard elevator access',
      'Chef show kitchen with Gaggenau appliances',
      'Acoustic double-glazed curtain walls',
      '24-hour concierge and valet services',
    ],
    is_featured: true,
    agent_name: null,
    agent_email: null,
    agent_phone: null,
    brokerage_name: null,
    source_name: 'showcase_sample',
    source_listing_id: 'SHOWCASE-DXB-01',
    source_url: null,
    published_at: '2026-03-01T08:00:00Z',
    created_at: '2026-03-01T08:00:00Z',
    is_sample: true,
    images: [
      {
        id: 'b0000001-0000-0000-0000-000000000001',
        property_id: 'a0000001-0000-0000-0000-000000000001',
        image_url: '/images/properties/dubai-marina-penthouse.jpg',
        alt_text: 'Contemporary luxury high-rise duplex penthouse in Dubai Marina with double-height glass and skyline views',
        display_order: 0,
        is_primary: true,
        created_at: '2026-03-01T08:00:00Z',
      },
    ],
  },
  {
    id: 'a0000002-0000-0000-0000-000000000002',
    title: 'The Kensington Modern Townhouse',
    slug: 'the-kensington-modern-townhouse-london',
    transaction_type: 'sale',
    property_type: 'townhouse',
    listing_status: 'available',
    publication_status: 'published',
    price: 6400000,
    currency: 'GBP',
    rental_period: null,
    available_from: null,
    bedrooms: 5,
    bathrooms: 4.5,
    area_value: 4400,
    area_unit: 'sqft',
    address_line: 'Kensington Church Street Corridor',
    city: 'London',
    state_region: 'Greater London',
    country: 'United Kingdom',
    postal_code: 'W8',
    latitude: 51.5025,
    longitude: -0.1917,
    description: `Set along a tranquil residential terrace in Kensington, this newly re-engineered Georgian-proportioned townhouse celebrates classic British brick masonry paired with refined contemporary bronze detailing and internal spatial clarity.

Arranged over five refined levels, the residence integrates a sunlit lower garden floor with polished concrete and Crittall-style glazing opening directly to a private walled garden. The upper floors accommodate four ensuite guest suites and an expansive full-floor primary retreat complete with bespoke dressing millwork and freestanding sculptural stone bath.

Note: This presentation is an illustrative architectural sample for platform demonstration purposes and is not an active real estate listing.`,
    features: [
      'Restored bespoke brick & Portland stone facade',
      'Private landscaped English walled garden',
      'Full-floor primary suite with custom joinery',
      'Integrated passive climate ventilation and heat pump',
      'Bespoke bronze metalwork and balustrades',
      'Wine cellar and dedicated garden office',
    ],
    is_featured: true,
    agent_name: null,
    agent_email: null,
    agent_phone: null,
    brokerage_name: null,
    source_name: 'showcase_sample',
    source_listing_id: 'SHOWCASE-LDN-02',
    source_url: null,
    published_at: '2026-03-02T08:00:00Z',
    created_at: '2026-03-02T08:00:00Z',
    is_sample: true,
    images: [
      {
        id: 'b0000002-0000-0000-0000-000000000002',
        property_id: 'a0000002-0000-0000-0000-000000000002',
        image_url: '/images/properties/london-kensington-townhouse.jpg',
        alt_text: 'Elegant modern brick and limestone townhouse in Kensington London with bronze entrance details',
        display_order: 0,
        is_primary: true,
        created_at: '2026-03-02T08:00:00Z',
      },
    ],
  },
  {
    id: 'a0000003-0000-0000-0000-000000000003',
    title: 'The Ravine Cedar Residence in Forest Hill',
    slug: 'the-ravine-cedar-residence-toronto',
    transaction_type: 'sale',
    property_type: 'house',
    listing_status: 'available',
    publication_status: 'published',
    price: 4950000,
    currency: 'CAD',
    rental_period: null,
    available_from: null,
    bedrooms: 5,
    bathrooms: 6,
    area_value: 6200,
    area_unit: 'sqft',
    address_line: 'Forest Hill North Ravine Path',
    city: 'Toronto',
    state_region: 'Ontario',
    country: 'Canada',
    postal_code: 'M5P',
    latitude: 43.7011,
    longitude: -79.4163,
    description: `A benchmark for biophilic family living in Toronto, this contemporary detached home sits thoughtfully against a protected mature tree canopy. The exterior is composed of horizontal Western red cedar slats, smooth Indiana limestone blocks, and oversized triple-glazed floor-to-ceiling curtain glass.

Inside, light flows across wide-plank white oak flooring and raw architectural concrete focal walls. Designed for modern multi-generational comfort, the floorplan features radiant in-floor heating throughout, a custom Scandinavian sauna, gym, and an open-concept living pavilion opening to a stone terrace and landscaped autumn garden.

Note: This presentation is an illustrative architectural sample for platform demonstration purposes and is not an active real estate listing.`,
    features: [
      'Western red cedar and smooth limestone exterior',
      'Mature ravine backdrop and private stone patio',
      'Triple-pane high-efficiency architectural glass',
      'Hydronic radiant in-floor heating system',
      'Custom Finnish cedar sauna and wellness suite',
      'Double car garage with EV charging infrastructure',
    ],
    is_featured: true,
    agent_name: null,
    agent_email: null,
    agent_phone: null,
    brokerage_name: null,
    source_name: 'showcase_sample',
    source_listing_id: 'SHOWCASE-TOR-03',
    source_url: null,
    published_at: '2026-03-03T08:00:00Z',
    created_at: '2026-03-03T08:00:00Z',
    is_sample: true,
    images: [
      {
        id: 'b0000003-0000-0000-0000-000000000003',
        property_id: 'a0000003-0000-0000-0000-000000000003',
        image_url: '/images/properties/toronto-forest-hill-residence.jpg',
        alt_text: 'Contemporary detached family residence in Toronto featuring cedar slats, limestone walls, and landscaped garden',
        display_order: 0,
        is_primary: true,
        created_at: '2026-03-03T08:00:00Z',
      },
    ],
  },
  {
    id: 'a0000004-0000-0000-0000-000000000004',
    title: 'The Ubud Jungle Reflection Villa',
    slug: 'the-ubud-jungle-reflection-villa-bali',
    transaction_type: 'rent',
    property_type: 'villa',
    listing_status: 'available',
    publication_status: 'published',
    price: 6500,
    currency: 'USD',
    rental_period: 'month',
    available_from: '2026-04-01',
    bedrooms: 3,
    bathrooms: 3.5,
    area_value: 4100,
    area_unit: 'sqft',
    address_line: 'Sayan Ridge Valley, Ubud',
    city: 'Bali',
    state_region: 'Bali',
    country: 'Indonesia',
    postal_code: '80571',
    latitude: -8.5069,
    longitude: 115.2625,
    description: `Immersed in the terraced emerald hills above Ubud, this private architectural sanctuary demonstrates contemporary tropical modernism at its most poetic. Hand-hewn volcanic basalt walls, reclaimed ironwood framing, and open-air pavilions celebrate the surrounding jungle microclimate.

The heart of the villa is an elongated black-granite infinity reflection pool that mirrors the canopy and morning mist. Each autonomous pavilion suite offers outdoor open-air garden rain showers, polished terrazzo vanities, and natural ventilation designed to harmonize comfort with the tropical environment.

Note: This presentation is an illustrative architectural sample for platform demonstration purposes and is not an active real estate listing.`,
    features: [
      '20-meter black granite infinity reflection pool',
      'Open-air living and dining bale with reclaimed teak',
      'Volcanic basalt masonry and polished terrazzo floors',
      'Autonomous guest suites with tropical outdoor showers',
      'High-speed fiber connectivity and dedicated workspace',
      'Full estate housekeeping and grounds maintenance',
    ],
    is_featured: true,
    agent_name: null,
    agent_email: null,
    agent_phone: null,
    brokerage_name: null,
    source_name: 'showcase_sample',
    source_listing_id: 'SHOWCASE-DPS-04',
    source_url: null,
    published_at: '2026-03-04T08:00:00Z',
    created_at: '2026-03-04T08:00:00Z',
    is_sample: true,
    images: [
      {
        id: 'b0000004-0000-0000-0000-000000000004',
        property_id: 'a0000004-0000-0000-0000-000000000004',
        image_url: '/images/properties/bali-ubud-tropical-villa.jpg',
        alt_text: 'Private tropical modern villa in Ubud Bali with volcanic stone walls and infinity reflection pool overlooking the jungle',
        display_order: 0,
        is_primary: true,
        created_at: '2026-03-04T08:00:00Z',
      },
    ],
  },
];

export const INITIAL_PROPERTY_ENQUIRIES: PropertyEnquiry[] = [];

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
    properties: INITIAL_SHOWCASE_PROPERTIES,
    propertyEnquiries: INITIAL_PROPERTY_ENQUIRIES,
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
    const parsed = JSON.parse(raw) as Partial<DemoDatabase>;
    return {
      ...createInitialDemoDb(),
      ...parsed,
      properties: Array.isArray(parsed.properties) && parsed.properties.length > 0
        ? parsed.properties
        : INITIAL_SHOWCASE_PROPERTIES,
      propertyEnquiries: Array.isArray(parsed.propertyEnquiries)
        ? parsed.propertyEnquiries
        : INITIAL_PROPERTY_ENQUIRIES,
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
