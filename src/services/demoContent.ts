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

const DEMO_STORAGE_KEY = 'amaan_estate_demo_db_v1';

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

const initialTags: Tag[] = [
  { id: 'tag-capital', name: 'Capital Markets', slug: 'capital-markets', created_at: '2026-01-10T09:00:00Z' },
  { id: 'tag-timber', name: 'Mass Timber', slug: 'mass-timber', created_at: '2026-01-10T09:00:00Z' },
  { id: 'tag-sustainable', name: 'Sustainable Design', slug: 'sustainable-design', created_at: '2026-01-10T09:00:00Z' },
  { id: 'tag-policy', name: 'Urban Policy', slug: 'urban-policy', created_at: '2026-01-10T09:00:00Z' },
  { id: 'tag-smart-homes', name: 'Smart Homes', slug: 'smart-homes', created_at: '2026-01-10T09:00:00Z' },
  { id: 'tag-adaptive', name: 'Adaptive Reuse', slug: 'adaptive-reuse', created_at: '2026-01-10T09:00:00Z' },
  { id: 'tag-reits', name: 'REITs', slug: 'reits', created_at: '2026-01-10T09:00:00Z' },
  { id: 'tag-concrete', name: 'Low-Carbon Concrete', slug: 'low-carbon-concrete', created_at: '2026-01-10T09:00:00Z' },
];

const initialArticles: Article[] = [
  {
    id: 'art-1',
    title: 'The Quiet Return of Patient Capital: How Long-Horizon Funds Are Reshaping Global Real Assets',
    slug: 'sovereign-capital-logistics-europe-east-africa-2026',
    excerpt: 'Pension funds and sovereign allocators are shifting away from short-term leverage toward climate-resilient urban infrastructure, logistics corridors, and energy-certified residential portfolios.',
    content: `Across Frankfurt, Singapore, and Nairobi, institutional real estate underwriting is undergoing its most consequential recalibration in fifteen years. After a prolonged cycle defined by ultra-low debt costs and rapid cap-rate compression, global allocators are returning to the fundamentals of operational cash flow, embodied carbon accountability, and long-term urban utility.

## From Financial Engineering to Physical Resilience

During the 2010s, cross-border real estate funds routinely relied on cheap floating-rate debt to amplify modest unlevered yields. Today, with sovereign bond yields anchoring a higher baseline cost of capital, asset managers can no longer treat leverage as a substitute for asset quality.

> "Capital no longer rewards generic square footage. Assets that combine energy autonomy, adaptable floorplates, and verified transit adjacency are commanding a structural valuation premium."

In our quarterly review of 42 global pension mandates, three clear allocation themes stand out:

1. **Cold-chain and intermodal logistics hubs** positioned along emerging trade corridors where supply-chain diversification continues to accelerate.
2. **Deep-retrofit Grade-A offices** upgraded to meet strict European and Asian energy-intensity thresholds rather than ground-up speculative towers.
3. **Purpose-built rental housing** engineered with modular MEP cores to lower lifecycle maintenance costs over 30-year holding periods.

## Cross-Border Yield Discipline

Real estate debt markets are simultaneously bifurcating. Core properties with verified net-zero roadmaps still attract competitive spreads from insurance lenders, while functionally obsolete buildings face steep refinancing discounts. For private investors and family offices, the opportunity lies in disciplined joint ventures with specialist operators who understand municipal permitting, local material supply chains, and tenant retention.`,
    featured_image: 'hero-pavilion',
    gallery_images: ['investment-skyline', 'global-news'],
    category_id: 'cat-investment',
    author_id: 'auth-marcus',
    status: 'published',
    is_featured: true,
    reading_time: 7,
    view_count: 1840,
    seo_title: 'Patient Capital & Global Real Estate Allocation in 2026 | AMAAN ESTATE',
    seo_description: 'How sovereign funds and long-horizon real estate investors are pricing energy resilience, logistics corridors, and operational yield.',
    og_image: 'hero-pavilion',
    published_at: '2026-10-28T08:00:00Z',
    created_at: '2026-10-26T10:00:00Z',
  },
  {
    id: 'art-2',
    title: 'Travertine, Daylight, and Thermal Mass: Designing Civic Pavilions for Warming Climates',
    slug: 'travertine-climate-responsive-civic-pavilions',
    excerpt: 'Contemporary architects are revisiting thick mineral masonry, deep cantilevered eaves, and reflecting water courts to cut mechanical cooling loads by more than half.',
    content: `Stand inside a well-proportioned limestone pavilion at midday and the silence is as physical as the coolness. Before mechanical chillers flattened architectural regionalism into sealed glass curtain walls, builders relied on thermal inertia, shaded colonnades, and evaporative water courts to temper harsh sun.

## Material Honesty as Environmental Engineering

A new wave of architectural practices across the Mediterranean, the Levant, and East Africa is pairing computational solar modeling with centuries-old stone and timber craft. Rather than wrapping buildings in energy-intensive double-skin glass, studios are calibrating deep stone overhangs to block high summer sun angles while welcoming low winter daylight deep into interior galleries.

- **Thermal mass lag**: Honed travertine and rammed-earth walls absorb daytime heat slowly and release it during cooler night-purge cycles.
- **Reflecting water basins**: Placed windward of operable clerestory windows, shallow basins pre-cool incoming breezes naturally.
- **Acoustic stillness**: Porous mineral surfaces soften interior reverberation without synthetic acoustic foam panels.

## Beyond Aesthetic Minimalism

The resulting architecture feels calm, grounded, and durable across decades. When structural stone carries both load and climate regulation, buildings age with patina rather than requiring thirty-year facade replacements.`,
    featured_image: 'architecture-pavilion',
    gallery_images: ['hero-pavilion', 'home-living'],
    category_id: 'cat-architecture',
    author_id: 'auth-eleanor',
    status: 'published',
    is_featured: true,
    reading_time: 6,
    view_count: 1420,
    seo_title: 'Climate-Responsive Civic Pavilions & Thermal Mass | AMAAN ESTATE',
    seo_description: 'How architects use travertine thermal mass, cantilevers, and water courts to lower building cooling loads.',
    og_image: 'architecture-pavilion',
    published_at: '2026-10-24T09:00:00Z',
    created_at: '2026-10-22T12:00:00Z',
  },
  {
    id: 'art-3',
    title: 'Hybrid Mass-Timber Frames Reach New Mid-Rise Speed Benchmarks in Urban Seismic Zones',
    slug: 'hybrid-mass-timber-high-rise-seismic-standards',
    excerpt: 'Cross-laminated timber decks paired with ductile steel moment frames are cutting structural erection schedules by up to 32% while slashing embodied carbon.',
    content: `On active urban infill sites where crane swing radii and neighborhood noise windows tightly constrain schedules, structural speed translates directly into financing savings. Hybrid mass-timber engineering—combining precision-milled glulam columns and CLT floor cassettes with slender steel bracing—is moving rapidly from boutique showcase projects into mainstream commercial construction.

## Precision Offsite Fabrication

Because CNC-milled timber components arrive on site with pre-cut MEP penetrations and factory-installed steel knife-plate connectors, erection crews operate with assembly-line predictability.

1. **Reduced foundation loads**: Timber structures weigh roughly one-fifth of comparable cast-in-place concrete frames, enabling vertical extensions on existing foundations.
2. **Seismic ductility**: Post-tensioned steel rocking walls paired with timber diaphragms dissipate lateral energy cleanly during seismic events.
3. **Digital twin coordination**: Structural engineers resolve clash detection before a single beam leaves the mill, virtually eliminating costly field rework.

## Supply Chain Readiness

Insurer familiarity and standardized fire-char testing protocols have matured dramatically over the last three years, allowing developers to underwrite hybrid timber offices and housing at competitive construction loan margins.`,
    featured_image: 'construction-timber',
    gallery_images: ['global-news'],
    category_id: 'cat-construction',
    author_id: 'auth-kenji',
    status: 'published',
    is_featured: true,
    reading_time: 5,
    view_count: 1185,
    seo_title: 'Hybrid Mass-Timber Construction & Seismic Standards | AMAAN ESTATE',
    seo_description: 'Engineering analysis of hybrid glulam-steel structural frames, site speed gains, and embodied carbon reductions.',
    og_image: 'construction-timber',
    published_at: '2026-10-20T11:00:00Z',
    created_at: '2026-10-18T14:00:00Z',
  },
  {
    id: 'art-4',
    title: 'The Refinancing Wall: Analyzing Commercial REIT Debt Maturities Through 2028',
    slug: 'reit-debt-maturities-refinancing-cycles',
    excerpt: 'Listed property trusts with staggered unsecured bond ladders are capturing distressed acquisitions from over-leveraged private syndicates.',
    content: `Over the next 24 months, more than $1.4 trillion in commercial real estate debt globally will reach maturity. Yet the headline narrative of uniform distress misses the sharp divergence between public REITs with conservative balance sheets and closed-end private funds facing bridge-loan cliffs.

## Balance Sheet Strength as a Competitive Weapon

Publicly traded industrial, data-center, and residential REITs entered the tightening cycle with weighted-average debt maturities exceeding six years and net-debt-to-EBITDA ratios hovering near 5.0x. As private borrowers confront higher refinancing coupons or equity top-up requirements, well-capitalized trusts are stepping in as liquidity providers of last resort.

> "In transitional credit markets, balance sheet liquidity is worth 150 basis points of acquisition yield."

Investors evaluating listed property vehicles should scrutinize unencumbered asset pools, fixed-rate debt coverage, and same-store net operating income growth rather than headline dividend yields alone.`,
    featured_image: 'investment-skyline',
    gallery_images: [],
    category_id: 'cat-investment',
    author_id: 'auth-marcus',
    status: 'published',
    is_featured: false,
    reading_time: 6,
    view_count: 940,
    seo_title: 'Commercial REIT Debt Maturities & Refinancing Strategy | AMAAN ESTATE',
    seo_description: 'Examining global commercial real estate debt maturities, public REIT balance sheets, and distressed acquisition opportunities.',
    og_image: 'investment-skyline',
    published_at: '2026-10-16T08:30:00Z',
    created_at: '2026-10-15T10:00:00Z',
  },
  {
    id: 'art-5',
    title: 'Courtyard Living & Natural Plaster: Why Homeowners Are Choosing Tactile Restraint Over Gloss',
    slug: 'passive-cooling-travertine-courtyard-residences',
    excerpt: 'Residential architecture is pivoting toward lime plaster walls, honed limestone hearths, and indoor-outdoor courtyard thresholds that elevate everyday calm.',
    content: `After years of stark high-gloss minimalism and hyper-connected smart gadgets vying for visual attention, discerning homeowners and residential architects are returning to tactile permanence.

## Material Palette That Ages Gracefully

Honed travertine, oiled European oak, and breathable mineral lime plaster regulate indoor humidity naturally while softening harsh artificial glare. Rather than treating technology as visual ornament, contemporary residences tuck radiant climate loops, acoustic insulation, and automated shading cleanly inside architectural millwork.

- **Biophilic courtyard anchors**: Sliding steel-framed glazing turns compact urban plots into private planted sanctuaries.
- **Healthy indoor air**: Zero-VOC mineral finishes eliminate synthetic off-gassing in sleeping and living quarters.
- **Daylight choreography**: High clerestory openings wash textured plaster walls in shifting daylight from dawn to dusk.`,
    featured_image: 'home-living',
    gallery_images: ['architecture-pavilion'],
    category_id: 'cat-home-living',
    author_id: 'auth-nadia',
    status: 'published',
    is_featured: false,
    reading_time: 5,
    view_count: 1105,
    seo_title: 'Tactile Courtyard Residences & Natural Interiors | AMAAN ESTATE',
    seo_description: 'Why contemporary residential architecture favors natural lime plaster, honed travertine, and planted courtyard layouts.',
    og_image: 'home-living',
    published_at: '2026-10-14T10:00:00Z',
    created_at: '2026-10-12T09:00:00Z',
  },
  {
    id: 'art-6',
    title: 'How New Energy Performance Mandates Are Repricing Urban Mixed-Use Districts',
    slug: 'eu-building-energy-performance-mandate-commercial-retrofits',
    excerpt: 'Stricter municipal building emissions standards across major capitals are accelerating green lease clauses and reshaping neighborhood redevelopment economics.',
    content: `Regulatory policy has quietly become the most decisive force in urban real estate valuation. Across European capitals, North American gateway cities, and Gulf financial zones, mandatory building energy disclosure and progressive carbon caps are forcing landlords to price capital expenditure well ahead of lease renewals.

## The Rise of the Green Lease

Institutional tenants with scope-1 and scope-2 net-zero commitments are increasingly unwilling to sign long-term leases in low-rated buildings without binding landlord retrofit schedules. Consequently, "brown discounts" on unrenovated stock are widening rapidly.

City planners are pairing emissions rules with targeted density bonuses and expedited permitting for mixed-use walkable districts—rewarding owners who convert underutilized parking lots and aging office blocks into energy-positive neighborhood hubs.`,
    featured_image: 'global-news',
    gallery_images: ['investment-skyline'],
    category_id: 'cat-news',
    author_id: 'auth-eleanor',
    status: 'published',
    is_featured: false,
    reading_time: 4,
    view_count: 1310,
    seo_title: 'Building Energy Mandates & Urban Mixed-Use Valuation | AMAAN ESTATE',
    seo_description: 'How municipal building emissions laws and green leases are reshaping commercial and mixed-use property values.',
    og_image: 'global-news',
    published_at: '2026-10-11T07:45:00Z',
    created_at: '2026-10-10T14:00:00Z',
  },
  {
    id: 'art-7',
    title: 'Geopolymer Concrete Field Trials Cut Structural Embodied Carbon by 48%',
    slug: 'geopolymer-low-carbon-concrete-site-trials',
    excerpt: 'By replacing traditional Portland clinker with industrial aluminosilicate binders, civil contractors are achieving high early strength without thermal curing.',
    content: `Cement production accounts for roughly eight percent of global carbon emissions, making concrete decarbonization the single highest-leverage challenge in structural engineering. Recent multi-story foundation and slab trials using alkali-activated geopolymer mixes demonstrate that commercial readiness is arriving faster than many specifiers expected.

## Field Performance & Workability

Early low-carbon concrete formulations struggled with inconsistent setting times under variable ambient temperatures. Next-generation admixtures now deliver predictable pumpability and 28-day compressive strengths exceeding 50 MPa while cutting embodied carbon nearly in half.

Structural specifiers are updating master specifications to allow performance-based concrete procurement rather than prescriptive Portland cement ratios.`,
    featured_image: 'construction-timber',
    gallery_images: [],
    category_id: 'cat-construction',
    author_id: 'auth-kenji',
    status: 'published',
    is_featured: false,
    reading_time: 5,
    view_count: 780,
    seo_title: 'Geopolymer Low-Carbon Concrete Field Trials | AMAAN ESTATE',
    seo_description: 'How alkali-activated geopolymer concrete mixes are cutting structural embodied carbon in commercial projects.',
    og_image: 'construction-timber',
    published_at: '2026-10-08T12:00:00Z',
    created_at: '2026-10-07T09:00:00Z',
  },
  {
    id: 'art-8',
    title: 'Adaptive Reuse of Post-Industrial Silos into Cultural and Residential Commons',
    slug: 'adaptive-reuse-industrial-silos-cultural-commons',
    excerpt: 'Architects are carving daylight atriums through monolithic concrete grain silos to create durable, low-waste urban landmarks.',
    content: `Demolishing sound twentieth-century concrete infrastructure wastes vast reserves of embodied carbon and civic memory. From Copenhagen's harborfront to Cape Town's waterfront, structural ingenuity is transforming monumental grain silos and brick warehouses into luminous mixed-use commons.

Precision diamond-wire cutting allows engineers to introduce central daylight wells without compromising cylindrical structural continuity—turning windowless industrial shells into sought-after residential and cultural destinations.`,
    featured_image: 'architecture-pavilion',
    gallery_images: [],
    category_id: 'cat-architecture',
    author_id: 'auth-eleanor',
    status: 'published',
    is_featured: false,
    reading_time: 5,
    view_count: 890,
    seo_title: 'Adaptive Reuse of Industrial Landmarks | AMAAN ESTATE',
    seo_description: 'Exploring architectural strategies for converting monolithic industrial silos into sustainable urban commons.',
    og_image: 'architecture-pavilion',
    published_at: '2026-10-04T09:30:00Z',
    created_at: '2026-10-03T11:00:00Z',
  },
  {
    id: 'art-9',
    title: 'Home Battery Microgrids and Heat Pumps: Calculating Real Residential Payback in 2026',
    slug: 'smart-grid-home-batteries-residential-roi',
    excerpt: 'Falling LFP battery prices and dynamic time-of-use utility tariffs are turning rooftop solar plus storage into a practical residential infrastructure upgrade.',
    content: `For homeowners planning major renovations, energy autonomy has shifted from an ideological luxury to a quantifiable operating expense reduction. Paired with high-efficiency air-to-water heat pumps, lithium-iron-phosphate (LFP) home batteries allow households to arbitrage off-peak grid tariffs and eliminate backup fossil generators.

In our comparative lifecycle model across four climate zones, integrated solar-battery-heat-pump retrofits now achieve full capital payback within 6.5 to 8.5 years while materially improving appraisal resale values.`,
    featured_image: 'home-living',
    gallery_images: [],
    category_id: 'cat-home-living',
    author_id: 'auth-nadia',
    status: 'published',
    is_featured: false,
    reading_time: 6,
    view_count: 1020,
    seo_title: 'Home Batteries & Heat Pump ROI for Homeowners | AMAAN ESTATE',
    seo_description: 'Lifecycle payback analysis of residential solar, LFP battery storage, and heat pump retrofits.',
    og_image: 'home-living',
    published_at: '2026-10-01T08:00:00Z',
    created_at: '2026-09-29T13:00:00Z',
  },
  {
    id: 'art-10',
    title: 'Transit-Oriented Zoning Reforms Gain Momentum Across Fast-Growing Regional Capitals',
    slug: 'transit-oriented-zoning-reforms-global-capitals',
    excerpt: 'Municipalities are eliminating single-use parking minimums near rail and BRT corridors to unlock higher-density housing supply.',
    content: `Facing acute housing affordability gaps and rising commuter congestion, municipal governments are rewriting zoning codes that long mandated sprawling surface parking and low-density separation. By authorizing by-right mid-rise mixed-use construction within 800 meters of high-capacity transit stations, cities are accelerating housing delivery while lowering per-capita infrastructure costs.`,
    featured_image: 'global-news',
    gallery_images: [],
    category_id: 'cat-news',
    author_id: 'auth-marcus',
    status: 'published',
    is_featured: false,
    reading_time: 4,
    view_count: 865,
    seo_title: 'Transit-Oriented Zoning Reforms & Urban Housing Supply | AMAAN ESTATE',
    seo_description: 'How municipal zoning modernization around transit corridors is unlocking urban housing density.',
    og_image: 'global-news',
    published_at: '2026-09-26T09:15:00Z',
    created_at: '2026-09-25T16:00:00Z',
  },
  {
    id: 'art-11',
    title: 'Q4 Sovereign Infrastructure & Urban Land Benchmarks (Editorial Draft)',
    slug: 'q4-sovereign-infrastructure-urban-land-benchmarks',
    excerpt: 'Draft research briefing compiling comparative urban land yields across emerging logistics corridors.',
    content: `Working editorial draft analyzing comparative urban land yields, municipal bond issuance, and transit corridor valuation multiples across emerging markets.`,
    featured_image: 'investment-skyline',
    gallery_images: [],
    category_id: 'cat-investment',
    author_id: 'auth-marcus',
    status: 'draft',
    is_featured: false,
    reading_time: 6,
    view_count: 0,
    seo_title: 'Q4 Sovereign Infrastructure & Urban Land Benchmarks',
    seo_description: 'Draft research briefing on urban land yields.',
    created_at: '2026-11-05T10:00:00Z',
  },
  {
    id: 'art-12',
    title: 'Modular Prefabricated Facade Retrofits for Mid-Century Concrete Towers',
    slug: 'modular-prefabricated-facade-retrofits',
    excerpt: 'Scheduled engineering report examining crane-hung insulated timber facade panels that wrap occupied towers without tenant displacement.',
    content: `Scheduled technical feature examining over-cladding prefabricated facade systems designed to bring mid-century residential towers up to net-zero envelope performance while residents remain in place.`,
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

const initialMedia: MediaItem[] = [
  {
    id: 'med-1',
    file_name: 'hero_editorial_architecture.jpg',
    storage_path: 'demo/hero_editorial_architecture.jpg',
    public_url: 'hero-pavilion',
    mime_type: 'image/jpeg',
    size_bytes: 184200,
    alt_text: 'Contemporary travertine limestone pavilion at golden hour',
    created_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'med-2',
    file_name: 'investment_skyline.jpg',
    storage_path: 'demo/investment_skyline.jpg',
    public_url: 'investment-skyline',
    mime_type: 'image/jpeg',
    size_bytes: 215400,
    alt_text: 'International financial district waterfront skyline at dawn',
    created_at: '2026-10-20T10:05:00Z',
  },
  {
    id: 'med-3',
    file_name: 'architecture_pavilion.jpg',
    storage_path: 'demo/architecture_pavilion.jpg',
    public_url: 'architecture-pavilion',
    mime_type: 'image/jpeg',
    size_bytes: 196800,
    alt_text: 'Minimalist cantilevered concrete and oak coastal residence',
    created_at: '2026-10-20T10:10:00Z',
  },
  {
    id: 'med-4',
    file_name: 'construction_timber.jpg',
    storage_path: 'demo/construction_timber.jpg',
    public_url: 'construction-timber',
    mime_type: 'image/jpeg',
    size_bytes: 204100,
    alt_text: 'Hybrid mass-timber and structural steel building construction',
    created_at: '2026-10-20T10:15:00Z',
  },
  {
    id: 'med-5',
    file_name: 'home_living_interior.jpg',
    storage_path: 'demo/home_living_interior.jpg',
    public_url: 'home-living',
    mime_type: 'image/jpeg',
    size_bytes: 178500,
    alt_text: 'Sunlit minimalist living room with travertine hearth and courtyard',
    created_at: '2026-10-20T10:20:00Z',
  },
  {
    id: 'med-6',
    file_name: 'global_urban_news.jpg',
    storage_path: 'demo/global_urban_news.jpg',
    public_url: 'global-news',
    mime_type: 'image/jpeg',
    size_bytes: 221900,
    alt_text: 'Sustainable mixed-use urban plaza with pedestrian walkway',
    created_at: '2026-10-20T10:25:00Z',
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
