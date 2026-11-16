-- ============================================================================
-- AmaanEstate Google AdSense Readiness, Author Attribution & Content Remediation
-- Safe, idempotent migration — preserves all published article slugs & URLs
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. Make articles.author_id genuinely optional (organizational attribution)
-- ----------------------------------------------------------------------------
alter table public.articles
  alter column author_id drop not null;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'articles_author_id_fkey'
      and conrelid = 'public.articles'::regclass
  ) then
    alter table public.articles drop constraint articles_author_id_fkey;
  end if;
end $$;

alter table public.articles
  add constraint articles_author_id_fkey
  foreign key (author_id) references public.authors(id) on delete set null;

-- ----------------------------------------------------------------------------
-- 2. Remove fictional author persona "Dr. Kenji Takahashi"
-- ----------------------------------------------------------------------------
update public.articles
set author_id = null,
    updated_at = now()
where author_id in (
  select id from public.authors where slug = 'kenji-takahashi' or lower(name) like '%kenji takahashi%'
);

delete from public.authors
where slug = 'kenji-takahashi'
   or lower(name) like '%kenji takahashi%';

-- ----------------------------------------------------------------------------
-- 3. Standardize official contact email in site_settings
-- ----------------------------------------------------------------------------
update public.site_settings
set editorial_email = 'info@amaanestate.com',
    updated_at = now()
where id = 1
  and coalesce(editorial_email, '') <> 'info@amaanestate.com';

-- ----------------------------------------------------------------------------
-- 4. Remove pasted AI/draft metadata blocks, duplicate leading H1s, and
--    embedded staff Qore bylines across live articles
-- ----------------------------------------------------------------------------

-- #10, #16, #29: Strip pasted Category / Suggested author / Publication date metadata blocks
update public.articles
set content = regexp_replace(
  content,
  '<p><strong>Category:</strong>.*?</p>\s*<hr\s*/?>',
  '',
  'gi'
),
    updated_at = now()
where content ~* '<p><strong>Category:</strong>.*?</p>\s*<hr\s*/?>';

-- #02: Strip embedded "Qore: AmaanEstate Editorial Team" paragraph
update public.articles
set content = regexp_replace(
  content,
  '<p>\s*<strong>\s*Qore:\s*AmaanEstate Editorial Team\s*</strong>\s*</p>',
  '',
  'gi'
),
    updated_at = now()
where content ~* 'Qore:\s*AmaanEstate Editorial Team';

-- #01, #02, #03, #04, #06, #07, #10, #16, #24, #29: Remove leading <h1>...</h1> (already rendered by page <h1>)
update public.articles
set content = regexp_replace(content, '^\s*<h1[^>]*>.*?</h1>\s*', '', 'i'),
    updated_at = now()
where content ~* '^\s*<h1[^>]*>';

-- Downgrade any remaining embedded <h1> tags inside body prose to <h2>
update public.articles
set content = regexp_replace(
  regexp_replace(content, '<h1(\b[^>]*)>', '<h2\1>', 'gi'),
  '</h1>',
  '</h2>',
  'gi'
),
    updated_at = now()
where content ~* '<h1\b|</h1>';

-- ----------------------------------------------------------------------------
-- 5. Strip target="_blank" and rel="noopener noreferrer nofollow" from internal
--    amaanestate.com links inside article bodies
-- ----------------------------------------------------------------------------
update public.articles
set content = regexp_replace(
  content,
  '<a\s+target="_blank"\s+rel="noopener noreferrer nofollow"\s+class="([^"]*)"\s+href="(https?://(?:www\.)?amaanestate\.com[^"]*)"',
  '<a class="\1" href="\2"',
  'gi'
),
    updated_at = now()
where content ~* 'href="https?://(?:www\.)?amaanestate\.com';

-- ----------------------------------------------------------------------------
-- 6. Surgical HTML, copy, and link fixes on specific published articles
-- ----------------------------------------------------------------------------

-- #01: Fix trailing '?' query and leading whitespace inside anchor text
update public.articles
set content = replace(
  replace(
    replace(
      content,
      'https://corporate.kaufmanbroad.fr/en/pestana-buys-a-hotel-from-austerlitz-a7-a8-in-kaufman-broad/?',
      'https://corporate.kaufmanbroad.fr/en/pestana-buys-a-hotel-from-austerlitz-a7-a8-in-kaufman-broad/'
    ),
    '> Pestana</a>',
    '>Pestana</a>'
  ),
  '> investment</a>',
  '>investment</a>'
),
    updated_at = now()
where slug = 'cristiano-ronaldo-s-pestana-cr7-paris-hotel-210-rooms-and-2027-opening';

-- #02: Fix trailing space and period inside anchor text
update public.articles
set content = replace(content, '> maalgelinta.</a>', '>maalgelinta</a>.'),
    updated_at = now()
where slug = 'nidaamka-cluster-ka-deegaanka-soomaalida-faa-iido-mise-khasaare';

-- #04: Fix split word "affordabilit</a>y"
update public.articles
set content = replace(content, '>affordabilit</a>y', '>affordability</a>'),
    updated_at = now()
where slug = 'cheapest-states-to-live-in-the-u-s-in-2026-top-10-affordable-places';

-- #06: Fix spaces inside anchor text "> apartment </a>"
update public.articles
set content = replace(content, '> apartment </a>', '>apartment</a> '),
    updated_at = now()
where slug = 'the-cheapest-state-to-rent-in-the-us-in-2026-why-oklahoma-stands-out';

-- #07: Fix trailing space inside anchor text & backfill concise seo_title
update public.articles
set content = replace(
  content,
  '><strong>most affordable cities to rent a home in Ethiopia</strong> </a>are',
  '><strong>most affordable cities to rent a home in Ethiopia</strong></a> are'
),
    seo_title = coalesce(nullif(trim(seo_title), ''), '7 Most Affordable Cities to Rent in Ethiopia (2026)'),
    updated_at = now()
where slug = '7-most-affordable-cities-to-rent-a-home-in-ethiopia-in-2026';

-- #05: Backfill concise seo_title
update public.articles
set seo_title = coalesce(nullif(trim(seo_title), ''), 'What Is AmaanEstate? Mission & Global Real Estate Platform'),
    updated_at = now()
where slug = 'what-is-amaanestate-exploring-our-mission-vision-and-global-real-estate-platform';

-- #08: Unlink mismatched anchor pairs ("London" -> Toronto/DC article; "Global Construction" -> EU EPBD article)
update public.articles
set content = replace(
  replace(
    content,
    '<a class="text-[#1E3A5F] underline underline-offset-2" href="https://www.amaanestate.com/articles/toronto-vs-washington-d-c-what-detached-family-homes-cost-in-2026">London</a> Richmond',
    'London Richmond'
  ),
  '<a class="text-[#1E3A5F] underline underline-offset-2" href="https://www.amaanestate.com/articles/eu-building-energy-performance-mandate-commercial-retrofits"> Global Construction</a> Costs Index',
  'Global Construction Costs Index'
),
    updated_at = now()
where slug = 'london-s-luxury-flat-glut-exposes-a-wider-real-estate-development-risk-in-2026';

-- #09: Restore truncated opening Toronto sentence using exact Q3 2026 figure already cited in article FAQ
--      and remove broken self-link "W<a ...>ashington, D.C</a>."
update public.articles
set content = replace(
  replace(
    content,
    '<p>detached home within the City of Toronto. The figure was down 5.9% compared with the same quarter in 2025.</p>',
    '<p>In Q3 2026, Royal LePage reported a median price of approximately <strong>CAD 1,457,300</strong> for a detached home within the City of Toronto. The figure was down 5.9% compared with the same quarter in 2025.</p>'
  ),
  'while W<a class="text-[#1E3A5F] underline underline-offset-2" href="https://www.amaanestate.com/articles/toronto-vs-washington-d-c-what-detached-family-homes-cost-in-2026">ashington, D.C</a>.',
  'while Washington, D.C.'
),
    updated_at = now()
where slug = 'toronto-vs-washington-d-c-what-detached-family-homes-cost-in-2026';

-- #10: Replace 404 Port of Rotterdam press release URL with verified Port of Rotterdam portal URL
update public.articles
set content = replace(
  content,
  'https://www.portofrotterdam.com/en/news-and-press-releases/throughput-port-of-rotterdam-shows-slight-decline',
  'https://www.portofrotterdam.com/en'
),
    updated_at = now()
where slug = 'sovereign-wealth-funds-logistics-real-estate';

-- #15, #18, #31: Fix broken internal article links pointing to pre-rename slugs
update public.articles
set content = replace(
  content,
  '/articles/uk-planning-infrastructure-act-2025-housing-reforms',
  '/articles/uk-planning-infrastructure-act-2025'
),
    updated_at = now()
where content like '%/articles/uk-planning-infrastructure-act-2025-housing-reforms%';

update public.articles
set content = replace(
  content,
  '/articles/sovereign-capital-logistics-europe-east-africa-2026',
  '/articles/sovereign-wealth-funds-logistics-real-estate'
),
    updated_at = now()
where content like '%/articles/sovereign-capital-logistics-europe-east-africa-2026%';

-- #17: Soften unverified "48%" headline claim while preserving article URL slug
update public.articles
set title = 'Alkali-Activated & Geopolymer Concrete: Field Trial Engineering & Embodied Carbon Benchmarks',
    updated_at = now()
where slug = 'geopolymer-low-carbon-concrete-site-trials'
  and title = 'Geopolymer Concrete Field Trials Cut Structural Embodied Carbon by 48%';

-- #22: Fix dead crrem.eu root URL -> verified crrem.eu/about-crrem/
update public.articles
set content = replace(
  content,
  'href="https://www.crrem.eu/"',
  'href="https://www.crrem.eu/about-crrem/"'
),
    updated_at = now()
where slug = 'brown-discount-commercial-office-retrofit-yields';

-- #25: Label 46m2 architectural scenario clearly as illustrative
update public.articles
set content = replace(
  content,
  '<h2>Case Geometry: Transforming a 46-Square-Meter One-Bedroom Urban Flat</h2>',
  '<h2>Illustrative Spatial Scenario: Reconfiguring a 46-Square-Meter Urban Apartment</h2>'
),
    updated_at = now()
where slug = 'small-space-urban-apartment-joinery-solutions';

-- #26: Replace unreachable facadeengineering.org with verified CIBSE portal
update public.articles
set content = replace(
  content,
  '<a href="https://www.facadeengineering.org/" target="_blank" rel="noopener noreferrer">Society of Facade Engineering — High-Rise Over-Cladding &amp; Fire Compartmentation Guidance</a>',
  '<a href="https://www.cibse.org/" target="_blank" rel="noopener noreferrer">Chartered Institution of Building Services Engineers (CIBSE) — Facade &amp; Building Services Engineering Guidance</a>'
),
    updated_at = now()
where slug = 'prefabricated-facade-overcladding-occupied-retrofits';

-- #31: Clarify construction productivity table column header
update public.articles
set content = replace(
  content,
  '<th>Verified Contractor Productivity Gain</th>',
  '<th>Reported Industry Range &amp; Operational Effect</th>'
),
    updated_at = now()
where slug = 'digital-twin-lidar-robotics-construction-productivity';

-- #34: Replace non-resolving UK retrofit domains with verified active domains
update public.articles
set content = replace(
  replace(
    content,
    'href="https://www.passivhaus.org.uk/"',
    'href="https://www.passivhaustrust.org.uk/"'
  ),
  'href="https://www.stba.org.uk/"',
  'href="https://stbauk.org/"'
),
    updated_at = now()
where slug = 'deep-energy-heritage-townhouse-retrofit-guide';

-- ----------------------------------------------------------------------------
-- 7. Backfill missing featured_image_alt metadata on published articles
-- ----------------------------------------------------------------------------
update public.articles as a
set featured_image_alt = v.alt_text,
    updated_at = now()
from (values
  ('travertine-climate-responsive-civic-pavilions', 'Minimalist travertine stone civic pavilion with deep cantilevered roof overhang, shaded colonnade, and tranquil reflecting water court at golden hour'),
  ('hybrid-mass-timber-high-rise-seismic-standards', 'Active commercial construction site showing a hybrid mass-timber glulam and CLT floor deck assembling neatly alongside a sleek structural steel seismic core'),
  ('reit-debt-maturities-refinancing-cycles', 'International financial district commercial skyscraper skyline at twilight reflected across calm harbor water'),
  ('passive-cooling-travertine-courtyard-residences', 'Sunlit minimalist residential living room with hand-troweled lime plaster walls, honed travertine hearth, oak bench, and sliding glass doors opening onto a private olive tree courtyard'),
  ('build-to-rent-multifamily-underwriting-global-cities', 'Modern brick and timber build-to-rent mid-rise apartment building overlooking a landscaped urban greenway and cycling path'),
  ('eu-building-energy-performance-mandate-commercial-retrofits', 'Modernized European mixed-use commercial office quarter retrofitted with high-efficiency triple glazing, rooftop solar panels, and shaded pedestrian boulevard'),
  ('geopolymer-low-carbon-concrete-site-trials', 'Civil construction engineer inspecting freshly poured low-carbon geopolymer concrete structural columns and steel rebar cages on a modern bridge project'),
  ('data-center-real-estate-power-land-underwriting', 'Minimalist concrete and aluminum louver data center campus surrounded by native grass bioswales and solar arrays'),
  ('adaptive-reuse-industrial-silos-cultural-commons', 'Monumental cylindrical concrete industrial grain silos transformed into a sunlit mixed-use cultural atrium with precision carved glazing and green harborfront plaza'),
  ('volumetric-modular-prefabrication-economics', 'Automated off-site modular housing factory assembly bay with overhead cranes positioning precision steel and timber residential room modules'),
  ('smart-grid-home-batteries-residential-roi', 'Contemporary residence interior utility gallery showing sleek wall-mounted LFP home battery storage units, smart solar inverter display, and sunlit courtyard garden outside'),
  ('brown-discount-commercial-office-retrofit-yields', 'Renovated heritage limestone and modern glass Grade-A commercial office building with landscaped rooftop terrace on a tree-lined avenue'),
  ('biophilic-high-rise-sky-gardens-urban-microclimate', 'Contemporary mixed-use high-rise timber and glass tower featuring recessed multi-story lush planted sky gardens and sunlit communal terraces'),
  ('small-space-urban-apartment-joinery-solutions', 'Clever compact urban city apartment interior showcasing floor-to-ceiling natural oak built-in architectural joinery, foldaway work desk, concealed storage wall, and sunlit window seat'),
  ('prefabricated-facade-overcladding-occupied-retrofits', 'Tower crane hoisting a precision prefabricated insulated facade panel with triple-glazed windows onto the exterior of an existing concrete residential tower'),
  ('singapore-ura-master-plan-2025-housing-supply', 'High-density biophilic urban housing towers integrated seamlessly with landscaped sky terraces, rail transit hubs, and shaded green corridors in Singapore'),
  ('rammed-earth-thermal-mass-arid-architecture', 'Sculptural contemporary rammed-earth desert residence showing layered terracotta-ochre mineral walls, recessed cedar windows, and shaded concrete canopy'),
  ('circadian-lighting-acoustic-residential-interior-design', 'Serene modern residence interior at dusk bathed in warm indirect architectural cove lighting, oak slat acoustic ceiling panels, and woven wool textiles'),
  ('digital-twin-lidar-robotics-construction-productivity', 'Construction engineering team standing inside a sunlit concrete structure comparing real-time LiDAR point-cloud structural geometry on digital tablets'),
  ('eu-construction-products-regulation-2024-digital-product-passports', 'Architectural construction material inspection studio showing low-carbon concrete cores, laminated mass timber samples, and steel structural fasteners tracked via digital QR passport tags'),
  ('sponge-city-coastal-urban-design-resilience', 'Resilient coastal sponge-city mixed-use waterfront district featuring sunken vegetated bioswale parks, timber boardwalk bridges, and elevated permeable stone plazas'),
  ('deep-energy-heritage-townhouse-retrofit-guide', 'Restored historic brick townhouse interior showing original tall timber sash windows upgraded with slender acoustic glazing alongside lime-plastered walls and radiant oak flooring')
) as v(slug, alt_text)
where a.slug = v.slug
  and coalesce(trim(a.featured_image_alt), '') = '';

update public.articles
set featured_image_alt = title,
    updated_at = now()
where status = 'published'
  and coalesce(trim(featured_image_alt), '') = '';

-- ----------------------------------------------------------------------------
-- 8. Add permanent 301 redirects for renamed seed article slugs (if any external
--    crawlers cached old URLs)
-- ----------------------------------------------------------------------------
insert into public.seo_redirects (source_path, target_path, status_code, is_active, notes)
values
  (
    '/articles/uk-planning-infrastructure-act-2025-housing-reforms',
    '/articles/uk-planning-infrastructure-act-2025',
    301,
    true,
    'Canonical redirect for renamed UK Planning and Infrastructure Act 2025 article'
  ),
  (
    '/articles/sovereign-capital-logistics-europe-east-africa-2026',
    '/articles/sovereign-wealth-funds-logistics-real-estate',
    301,
    true,
    'Canonical redirect for renamed Logistics Real Estate article'
  )
on conflict (source_path) do nothing;

commit;

-- ============================================================================
-- OPTIONAL OWNER REVIEW BLOCK: Remaining 3 Seeded Author Personas
-- ============================================================================
-- During the codebase audit, Eleanor Vance, Marcus Thorne, and Nadia Al-Mansoor
-- were found in the original platform seed data alongside Dr. Kenji Takahashi.
-- If these three names are NOT real AmaanEstate writers/editors, uncomment and
-- run the statements below in Supabase SQL Editor to unassign them and display
-- "AMAAN ESTATE Editorial Desk" across all organizational reporting instead:
--
-- begin;
-- update public.articles
-- set author_id = null, updated_at = now()
-- where author_id in (
--   select id from public.authors
--   where slug in ('eleanor-vance', 'marcus-thorne', 'nadia-al-mansoor')
-- );
-- delete from public.authors
-- where slug in ('eleanor-vance', 'marcus-thorne', 'nadia-al-mansoor');
-- commit;
-- ============================================================================
