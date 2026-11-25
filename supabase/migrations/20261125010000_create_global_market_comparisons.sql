-- ============================================================================
-- AMAAN ESTATE (https://www.amaanestate.com)
-- Migration: Two-City Property Market Comparison Reports
-- Safe, additive migration preserving all existing global_markets records,
-- tables, policies, and shared helper functions.
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.global_market_comparisons (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  slug text not null unique check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and slug <> 'comparisons'
  ),
  short_intro text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  reporting_period text not null default '',
  reporting_granularity text not null default 'quarter' check (
    reporting_granularity in ('month', 'quarter', 'year')
  ),
  last_verified_at date,
  social_image text check (
    social_image is null or social_image ~* '^https://'
  ),
  social_image_alt text,
  seo_title text,
  seo_description text,
  canonical_url text check (
    canonical_url is null or canonical_url ~* '^https?://'
  ),
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_global_market_comparisons_publish_readiness check (
    status <> 'published'
    or (
      char_length(trim(title)) > 0
      and char_length(trim(slug)) > 0
      and char_length(trim(reporting_period)) > 0
      and last_verified_at is not null
    )
  )
);

create table if not exists public.global_market_comparison_cities (
  id uuid primary key default gen_random_uuid(),
  comparison_id uuid not null references public.global_market_comparisons(id) on delete cascade,
  city_slot text not null check (city_slot in ('A', 'B')),
  city_name text not null check (char_length(trim(city_name)) > 0),
  country_name text not null check (char_length(trim(country_name)) > 0),
  country_code text not null default '' check (
    country_code = '' or country_code ~ '^[A-Z]{2}$'
  ),
  image_url text check (
    image_url is null or image_url ~* '^https://'
  ),
  image_alt text,
  avg_sale_price numeric(14, 2) check (avg_sale_price is null or avg_sale_price >= 0),
  avg_monthly_rent numeric(14, 2) check (avg_monthly_rent is null or avg_monthly_rent >= 0),
  currency text not null default 'USD' check (char_length(trim(currency)) between 3 and 8),
  property_price_trend_pct numeric(7, 2),
  property_price_trend_dir text check (
    property_price_trend_dir is null or property_price_trend_dir in ('up', 'down', 'flat')
  ),
  rental_price_trend_pct numeric(7, 2),
  rental_price_trend_dir text check (
    rental_price_trend_dir is null or rental_price_trend_dir in ('up', 'down', 'flat')
  ),
  data_source_name text not null default '',
  data_source_url text check (
    data_source_url is null or data_source_url ~* '^https?://'
  ),
  data_period text not null default '',
  market_overview text not null default '',
  market_analysis text not null default '',
  investment_insights text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_global_market_comparison_city_slot unique (comparison_id, city_slot)
);

create index if not exists idx_global_market_comparisons_status
  on public.global_market_comparisons (status, is_featured desc, last_verified_at desc nulls last);

create index if not exists idx_global_market_comparisons_slug
  on public.global_market_comparisons (slug);

create index if not exists idx_global_market_comparison_cities_parent
  on public.global_market_comparison_cities (comparison_id, city_slot);

create or replace function public.handle_global_market_comparisons_write()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.title := trim(coalesce(new.title, ''));
  new.slug := lower(trim(coalesce(new.slug, '')));
  new.short_intro := trim(coalesce(new.short_intro, ''));
  new.reporting_period := trim(coalesce(new.reporting_period, ''));
  new.social_image := nullif(trim(coalesce(new.social_image, '')), '');
  new.social_image_alt := nullif(trim(coalesce(new.social_image_alt, '')), '');
  new.seo_title := nullif(trim(coalesce(new.seo_title, '')), '');
  new.seo_description := nullif(trim(coalesce(new.seo_description, '')), '');
  new.canonical_url := nullif(trim(coalesce(new.canonical_url, '')), '');

  if tg_op = 'INSERT' then
    if new.status = 'published' then
      new.published_at := coalesce(new.published_at, now());
    end if;
  elsif tg_op = 'UPDATE' then
    if old.published_at is not null then
      new.published_at := old.published_at;
    elsif new.status = 'published' then
      new.published_at := coalesce(new.published_at, now());
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_global_market_comparisons_before_write on public.global_market_comparisons;
create trigger trg_global_market_comparisons_before_write
  before insert or update on public.global_market_comparisons
  for each row execute function public.handle_global_market_comparisons_write();

drop trigger if exists trg_global_market_comparisons_updated_at on public.global_market_comparisons;
create trigger trg_global_market_comparisons_updated_at
  before update on public.global_market_comparisons
  for each row execute function public.set_updated_at();

create or replace function public.handle_global_market_comparison_cities_write()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.city_name := trim(coalesce(new.city_name, ''));
  new.country_name := trim(coalesce(new.country_name, ''));
  new.country_code := upper(trim(coalesce(new.country_code, '')));
  new.image_url := nullif(trim(coalesce(new.image_url, '')), '');
  new.image_alt := nullif(trim(coalesce(new.image_alt, '')), '');
  new.currency := upper(trim(coalesce(new.currency, 'USD')));
  new.data_source_name := trim(coalesce(new.data_source_name, ''));
  new.data_source_url := nullif(trim(coalesce(new.data_source_url, '')), '');
  new.data_period := trim(coalesce(new.data_period, ''));
  return new;
end;
$$;

drop trigger if exists trg_global_market_comparison_cities_before_write on public.global_market_comparison_cities;
create trigger trg_global_market_comparison_cities_before_write
  before insert or update on public.global_market_comparison_cities
  for each row execute function public.handle_global_market_comparison_cities_write();

drop trigger if exists trg_global_market_comparison_cities_updated_at on public.global_market_comparison_cities;
create trigger trg_global_market_comparison_cities_updated_at
  before update on public.global_market_comparison_cities
  for each row execute function public.set_updated_at();

alter table public.global_market_comparisons enable row level security;
alter table public.global_market_comparison_cities enable row level security;

revoke all on table public.global_market_comparisons from public, anon, authenticated;
grant select on table public.global_market_comparisons to anon;
grant select, insert, update, delete on table public.global_market_comparisons to authenticated;
grant all on table public.global_market_comparisons to service_role;

revoke all on table public.global_market_comparison_cities from public, anon, authenticated;
grant select on table public.global_market_comparison_cities to anon;
grant select, insert, update, delete on table public.global_market_comparison_cities to authenticated;
grant all on table public.global_market_comparison_cities to service_role;

drop policy if exists "Published city market comparisons publicly readable" on public.global_market_comparisons;
create policy "Published city market comparisons publicly readable"
  on public.global_market_comparisons for select
  to anon, authenticated
  using (
    (
      status = 'published'
      and char_length(trim(title)) > 0
      and char_length(trim(slug)) > 0
      and char_length(trim(reporting_period)) > 0
      and last_verified_at is not null
    )
    or public.is_admin_or_editor()
  );

drop policy if exists "Admins and editors can insert comparisons" on public.global_market_comparisons;
create policy "Admins and editors can insert comparisons"
  on public.global_market_comparisons for insert
  to authenticated
  with check (public.is_admin_or_editor());

drop policy if exists "Admins and editors can update comparisons" on public.global_market_comparisons;
create policy "Admins and editors can update comparisons"
  on public.global_market_comparisons for update
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

drop policy if exists "Admins and editors can delete comparisons" on public.global_market_comparisons;
create policy "Admins and editors can delete comparisons"
  on public.global_market_comparisons for delete
  to authenticated
  using (public.is_admin_or_editor());

drop policy if exists "Published comparison cities publicly readable" on public.global_market_comparison_cities;
create policy "Published comparison cities publicly readable"
  on public.global_market_comparison_cities for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.global_market_comparisons c
      where c.id = comparison_id
        and (
          (
            c.status = 'published'
            and char_length(trim(c.title)) > 0
            and char_length(trim(c.slug)) > 0
            and char_length(trim(c.reporting_period)) > 0
            and c.last_verified_at is not null
          )
          or public.is_admin_or_editor()
        )
    )
  );

drop policy if exists "Admins and editors can insert comparison cities" on public.global_market_comparison_cities;
create policy "Admins and editors can insert comparison cities"
  on public.global_market_comparison_cities for insert
  to authenticated
  with check (public.is_admin_or_editor());

drop policy if exists "Admins and editors can update comparison cities" on public.global_market_comparison_cities;
create policy "Admins and editors can update comparison cities"
  on public.global_market_comparison_cities for update
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

drop policy if exists "Admins and editors can delete comparison cities" on public.global_market_comparison_cities;
create policy "Admins and editors can delete comparison cities"
  on public.global_market_comparison_cities for delete
  to authenticated
  using (public.is_admin_or_editor());
