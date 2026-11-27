-- ============================================================================
-- AMAAN ESTATE (https://www.amaanestate.com)
-- Pending-Approval Database & SEO Audit Remediation Patch
--
-- SAFETY NOTICE:
--   * Do NOT run this file automatically. Review Section A diagnostics first.
--   * Preserves all published URLs, slugs, articles, and market reports.
--   * Does NOT delete any editorial content or fabricate data.
-- ============================================================================

-- ============================================================================
-- SECTION A: READ-ONLY DIAGNOSTIC QUERIES (Run first to inspect live rows)
-- ============================================================================

-- A1. Find any published/draft articles linking to deprecated or missing slugs
select
  id,
  slug,
  status,
  substring(content from '/articles/[a-z0-9-]+') as sample_internal_article_link
from public.articles
where content ~ '/articles/(uk-planning-infrastructure-act-2025-housing-reforms|sovereign-capital-logistics-europe-east-africa-2026)'
order by updated_at desc;

-- A2. Find any internal /articles/<target_slug> links that do NOT match a published article
with extracted_links as (
  select
    a.id as source_id,
    a.slug as source_slug,
    m[1] as linked_slug
  from public.articles a
  cross join lateral regexp_matches(
    a.content,
    '(?:https?://(?:www\.)?amaanestate\.com)?/articles/([a-z0-9-]+)',
    'gi'
  ) as m
  where a.status = 'published'
)
select
  e.source_slug,
  e.linked_slug,
  target.status as target_status
from extracted_links e
left join public.articles target on target.slug = e.linked_slug
where target.id is null
   or target.status <> 'published'
order by e.source_slug;

-- A3. Inspect target_country values for typos / language-in-country anomalies
select
  coalesce(target_country, '(null)') as target_country,
  count(*) as article_count
from public.articles
group by 1
order by 2 desc, 1 asc;

-- A4. Find missing image alt metadata across articles & comparisons
select 'articles' as table_name, slug, title
from public.articles
where status = 'published'
  and coalesce(trim(featured_image), '') <> ''
  and coalesce(trim(featured_image_alt), '') = ''
union all
select 'global_markets' as table_name, slug, title
from public.global_markets
where status = 'published'
  and coalesce(trim(cover_image), '') <> ''
  and coalesce(trim(cover_image_alt), '') = ''
union all
select 'global_market_comparison_cities' as table_name, c.city_name, comp.slug
from public.global_market_comparison_cities c
join public.global_market_comparisons comp on comp.id = c.comparison_id
where comp.status = 'published'
  and coalesce(trim(c.image_url), '') <> ''
  and coalesce(trim(c.image_alt), '') = '';

-- A5. Detect any remaining ephemeral images.openai.com or DALL-E URLs
select 'articles.featured_image' as location, slug, featured_image as url
from public.articles
where featured_image ~* '(images\.openai\.com|oaidalleapiprodscus)'
union all
select 'articles.og_image', slug, og_image
from public.articles
where og_image ~* '(images\.openai\.com|oaidalleapiprodscus)'
union all
select 'articles.content', slug, substring(content from 'https?://[^\s"''>]+(?:images\.openai\.com|oaidalleapiprodscus)[^\s"''>]*')
from public.articles
where content ~* '(images\.openai\.com|oaidalleapiprodscus)'
union all
select 'global_markets.cover_image', slug, cover_image
from public.global_markets
where cover_image ~* '(images\.openai\.com|oaidalleapiprodscus)'
union all
select 'global_market_comparison_cities.image_url', city_name, image_url
from public.global_market_comparison_cities
where image_url ~* '(images\.openai\.com|oaidalleapiprodscus)';

-- A6. Audit orphan published articles (0 inbound links) & zero-outbound-link articles
with published as (
  select id, slug, title, category_id, content
  from public.articles
  where status = 'published'
),
inbound as (
  select
    p_target.id,
    count(distinct p_src.id) as inbound_count
  from published p_target
  left join published p_src
    on p_src.id <> p_target.id
   and p_src.content ~* ('/articles/' || p_target.slug || '(["''/?#<\s]|$)')
  group by p_target.id
),
outbound as (
  select
    p.id,
    (
      select count(*)
      from regexp_matches(
        p.content,
        '(?:https?://(?:www\.)?amaanestate\.com)?/(?:articles|global-markets|investment|architecture|construction|home-living|news)/[a-z0-9-]+',
        'gi'
      )
    ) as internal_link_count
  from published p
)
select
  p.slug,
  p.title,
  i.inbound_count,
  o.internal_link_count
from published p
join inbound i on i.id = p.id
join outbound o on o.id = p.id
where i.inbound_count = 0
   or o.internal_link_count = 0
order by i.inbound_count asc, o.internal_link_count asc, p.slug;


-- A7. Pre-change snapshot for reversibility (save output before executing Section B)
select 'articles' as tbl, slug, seo_title, seo_description, target_country, featured_image_alt
from public.articles
where status = 'published'
order by slug;

select 'categories' as tbl, slug, seo_title, seo_description
from public.categories
order by slug;

select 'global_markets' as tbl, slug, seo_title, seo_description, cover_image_alt
from public.global_markets
where status = 'published'
order by slug;

select 'global_market_comparisons' as tbl, slug, seo_title, seo_description
from public.global_market_comparisons
where status = 'published'
order by slug;


-- ============================================================================
-- SECTION B: TRANSACTIONAL REMEDIATION PATCH (Execute ONLY after approval)
-- ============================================================================

begin;

-- 1. Fix remaining broken internal article links inside article bodies
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

-- Ensure permanent 301 redirect records exist for renamed slugs
insert into public.seo_redirects (source_path, target_path, status_code, is_active, notes)
values
  (
    '/articles/uk-planning-infrastructure-act-2025-housing-reforms',
    '/articles/uk-planning-infrastructure-act-2025',
    301,
    true,
    'SEO audit fix: permanent 301 redirect for renamed UK Planning and Infrastructure Act 2025 article'
  ),
  (
    '/articles/sovereign-capital-logistics-europe-east-africa-2026',
    '/articles/sovereign-wealth-funds-logistics-real-estate',
    301,
    true,
    'SEO audit fix: permanent 301 redirect for renamed Sovereign Capital & Logistics Real Estate article'
  ),
  (
    '/articles/dubai-real-estate-strategy-2033-dld-market-roadmap',
    '/articles/dubai-real-estate-strategy-2033-investment-market-outlook',
    301,
    true,
    'SEO audit fix: permanent 301 redirect for renamed Dubai Real Estate Strategy 2033 article'
  )
on conflict (source_path) do update
  set target_path = excluded.target_path,
      status_code = 301,
      is_active = true,
      updated_at = now();

-- 2. Normalize target_country casing & obvious country typos
update public.articles
set target_country = case
    when lower(trim(target_country)) in ('united state', 'united state of america', 'united states of america', 'u.s.', 'u.s.a.', 'usa', 'us') then 'United States'
    when lower(trim(target_country)) in ('uk', 'u.k.', 'great britain', 'britain') then 'United Kingdom'
    when lower(trim(target_country)) in ('uae', 'u.a.e.') then 'United Arab Emirates'
    -- 'somali' was entered as a language label on an article covering Jigjiga / Somali Region (Ethiopia);
    -- clear to NULL rather than guessing, or replace with 'Ethiopia' upon editorial review.
    when lower(trim(target_country)) = 'somali' then null
    else trim(target_country)
  end,
  updated_at = now()
where target_country is not null
  and (
    lower(trim(target_country)) in (
      'united state', 'united state of america', 'united states of america',
      'u.s.', 'u.s.a.', 'usa', 'us', 'uk', 'u.k.', 'great britain', 'britain',
      'uae', 'u.a.e.', 'somali'
    )
    or target_country <> trim(target_country)
  );

-- 3. Backfill missing featured_image_alt / image_alt / cover_image_alt strictly from verified titles/city names
update public.articles
set featured_image_alt = trim(title),
    updated_at = now()
where status = 'published'
  and coalesce(trim(featured_image), '') <> ''
  and coalesce(trim(featured_image_alt), '') = ''
  and coalesce(trim(title), '') <> '';

update public.global_markets
set cover_image_alt = trim(title),
    updated_at = now()
where status = 'published'
  and coalesce(trim(cover_image), '') <> ''
  and coalesce(trim(cover_image_alt), '') = ''
  and coalesce(trim(title), '') <> '';

update public.global_market_comparison_cities
set image_alt = trim(city_name) || ', ' || trim(country_name) || ' residential property market',
    updated_at = now()
where coalesce(trim(image_url), '') <> ''
  and coalesce(trim(image_alt), '') = '';

-- 4. Shorten SEO titles (>60-65 chars) while preserving keywords & brand identity
update public.categories as c
set seo_title = v.seo_title,
    updated_at = now()
from (values
  ('investment', 'Real Estate Investment & Strategy | AMAAN ESTATE'),
  ('construction', 'Construction Tech & Engineering | AMAAN ESTATE'),
  ('home-living', 'Home & Living, Smart Homes & Design | AMAAN ESTATE')
) as v(slug, seo_title)
where c.slug = v.slug
  and coalesce(c.seo_title, '') is distinct from v.seo_title;

update public.articles as a
set seo_title = v.seo_title,
    updated_at = now()
from (values
  ('what-is-amaanestate-exploring-our-mission-vision-and-global-real-estate-platform', 'What Is AmaanEstate? Global Real Estate Platform'),
  ('dubai-real-estate-strategy-2033-investment-market-outlook', 'Dubai Real Estate Strategy 2033: Market Outlook'),
  ('nidaamka-cluster-ka-deegaanka-soomaalida-faa-iido-mise-khasaare', 'Cluster-ka Deegaanka Soomaalida: Faa’iido Mise Khasaare?'),
  ('biophilic-high-rise-sky-gardens-urban-microclimate', 'Biophilic High-Rises & Sky Gardens Guide'),
  ('circadian-lighting-acoustic-residential-interior-design', 'Circadian Lighting & Acoustic Home Design'),
  ('digital-twin-lidar-robotics-construction-productivity', 'Digital Twins & LiDAR in Construction')
) as v(slug, seo_title)
where a.slug = v.slug
  and coalesce(a.seo_title, '') is distinct from v.seo_title;

update public.global_markets
set seo_title = 'UK Housing Market 2026: Prices, Rents & Outlook',
    updated_at = now()
where slug = 'uk-housing-market-house-prices-rental-growth-and-investment-outlook-2026'
  and coalesce(seo_title, '') is distinct from 'UK Housing Market 2026: Prices, Rents & Outlook';

-- 5. Set concise SEO title & unique description on San Francisco vs Manhattan comparison report
update public.global_market_comparisons
set seo_title = 'San Francisco vs Manhattan Property Market 2026',
    seo_description = 'Compare San Francisco and Manhattan October 2026 median sale prices ($1.66M vs $1.30M), price trends, sales pace, and buyer competition on AmaanEstate.',
    updated_at = now()
where slug = 'san-francisco-vs-manhattan-property-market';

-- 6. Strip accidental nofollow attributes from same-site amaanestate.com links in articles
update public.articles
set content = regexp_replace(
      content,
      '(<a\b[^>]*href="https?://(?:www\.)?amaanestate\.com[^"]*"[^>]*)\s+rel="[^"]*nofollow[^"]*"',
      '\1',
      'gi'
    ),
    updated_at = now()
where content ~* 'href="https?://(?:www\.)?amaanestate\.com[^>]*nofollow';

commit;
