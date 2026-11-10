-- ============================================================================
-- AMAAN ESTATE (amaanestate.com)
-- Migration 003: Initial Roles, Categories, Authors, Tags & Site Settings
-- Note: Seeds foundational taxonomy, system roles, editorial authors, tags,
-- and default site settings safely using ON CONFLICT DO NOTHING.
-- ============================================================================

-- 1. Seed Roles
insert into public.roles (name, description) values
  ('admin', 'Full administrative control over content, settings, users, and roles'),
  ('editor', 'Can create, edit, schedule, publish, and feature all articles and categories'),
  ('author', 'Can create and edit own article drafts'),
  ('reader', 'Default authenticated subscriber / reader account')
on conflict (name) do nothing;

-- 2. Seed Site Settings
insert into public.site_settings (
  id,
  site_name,
  tagline,
  domain,
  default_seo_title,
  default_seo_description,
  editorial_email,
  social_links,
  adsense_client_id,
  adsense_enabled
) values (
  1,
  'AMAAN ESTATE',
  'Global Real Estate Media, Research & Knowledge Platform',
  'amaanestate.com',
  'AMAAN ESTATE — Global Real Estate Media, Research & Knowledge',
  'Independent international reporting, institutional research, and editorial analysis on real estate investment, architecture, construction, home living, and property markets.',
  'editorial@amaanestate.com',
  '{"twitter":"https://x.com/amaanestate","linkedin":"https://linkedin.com/company/amaanestate","instagram":"https://instagram.com/amaanestate","youtube":""}'::jsonb,
  '',
  false
)
on conflict (id) do nothing;

-- 3. Seed Core Categories
insert into public.categories (name, slug, description, display_order, seo_title, seo_description) values
  (
    'Investment',
    'investment',
    'Institutional capital flows, global property yields, REIT structures, cross-border financing, and regional market cycles.',
    1,
    'Real Estate Investment Insights & Market Strategy | AMAAN ESTATE',
    'Global real estate investment research, capital markets analysis, property finance, and long-term portfolio strategies.'
  ),
  (
    'Architecture',
    'architecture',
    'Contemporary spatial design, landmark cultural buildings, passive climate engineering, and adaptive reuse across global cities.',
    2,
    'Modern Architecture & Spatial Design | AMAAN ESTATE',
    'Architectural monographs, iconic structures, sustainable design philosophies, and urban spatial innovation.'
  ),
  (
    'Construction',
    'construction',
    'Structural engineering, mass-timber systems, low-carbon concrete, modular prefabrication, and construction technology.',
    3,
    'Construction Technology, Materials & Engineering | AMAAN ESTATE',
    'Engineering breakthroughs, sustainable building materials, modular construction, and site productivity research.'
  ),
  (
    'Home & Living',
    'home-living',
    'Residential architecture, tactile interior craft, smart energy systems, biophilic courtyards, and thoughtful domestic living.',
    4,
    'Home & Living, Smart Homes & Residential Design | AMAAN ESTATE',
    'Residential design insights, smart home automation, energy-efficient renovations, and architectural living spaces.'
  ),
  (
    'News',
    'news',
    'International property regulation, central bank policy impacts, zoning reform, and urban infrastructure milestones.',
    5,
    'Global Real Estate News & Policy Briefings | AMAAN ESTATE',
    'Breaking international property industry developments, regulatory shifts, and urban economic news.'
  )
on conflict (slug) do nothing;

-- 4. Seed Editorial Authors
insert into public.authors (name, slug, title, bio, email, active) values
  (
    'Eleanor Vance',
    'eleanor-vance',
    'Chief Architecture & Urbanism Editor',
    'Architectural historian and critic covering civic pavilions, adaptive reuse, and climate-responsive urbanism across Europe, East Africa, and the Gulf.',
    'eleanor.vance@amaanestate.com',
    true
  ),
  (
    'Marcus Thorne',
    'marcus-thorne',
    'Senior Real Estate Capital Correspondent',
    'Former institutional real estate analyst focusing on sovereign infrastructure capital, debt refinancing cycles, and cross-border yield spreads.',
    'marcus.thorne@amaanestate.com',
    true
  ),
  (
    'Dr. Kenji Takahashi',
    'kenji-takahashi',
    'Structural & Materials Research Fellow',
    'Structural engineer and researcher investigating hybrid mass-timber frames, geopolymer concrete, and seismic resilience in high-density cities.',
    'kenji.takahashi@amaanestate.com',
    true
  ),
  (
    'Nadia Al-Mansoor',
    'nadia-al-mansoor',
    'Residential Design & Smart Living Editor',
    'Covers tactile materiality, net-zero residential retrofits, indoor environmental quality, and quiet domestic architecture.',
    'nadia.almansoor@amaanestate.com',
    true
  )
on conflict (slug) do nothing;

-- 5. Seed Tags
insert into public.tags (name, slug) values
  ('Capital Markets', 'capital-markets'),
  ('Mass Timber', 'mass-timber'),
  ('Sustainable Design', 'sustainable-design'),
  ('Urban Policy', 'urban-policy'),
  ('Smart Homes', 'smart-homes'),
  ('Adaptive Reuse', 'adaptive-reuse'),
  ('REITs', 'reits'),
  ('Low-Carbon Concrete', 'low-carbon-concrete')
on conflict (slug) do nothing;
