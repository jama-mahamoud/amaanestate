-- ============================================================================
-- AMAAN ESTATE (https://www.amaanestate.com)
-- Migration: Global Real Estate Market Intelligence Module
-- Safe, idempotent, first-time-safe migration preserving all existing tables,
-- records, policies, and shared functions (set_updated_at, is_admin_or_editor).
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.global_markets (
  id uuid primary key default gen_random_uuid(),
  country_name text not null check (char_length(trim(country_name)) > 0),
  country_code text not null default '' check (
    country_code = '' or country_code ~ '^[A-Z]{2}$'
  ),
  country_slug text not null check (
    country_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  city_name text,
  market_level text not null default 'country' check (market_level in ('country', 'city')),
  title text not null check (char_length(trim(title)) > 0),
  slug text not null check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  market_overview text not null default '',
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
  investment_insights text not null default '',
  market_analysis text not null default '',
  data_period text not null default '',
  data_period_type text not null default 'quarter' check (
    data_period_type in ('month', 'quarter', 'year')
  ),
  data_source_name text not null default '',
  data_source_url text check (
    data_source_url is null or data_source_url ~* '^https?://'
  ),
  data_source_type text not null default 'manual' check (
    data_source_type in ('manual', 'bis', 'oecd', 'national_stats', 'central_bank', 'other_authorized')
  ),
  last_verified_at date,
  cover_image text,
  cover_image_alt text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  seo_title text,
  seo_description text,
  canonical_url text check (
    canonical_url is null or canonical_url ~* '^https?://'
  ),
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_global_markets_country_report_slug unique (country_slug, slug),
  constraint chk_global_markets_level_city check (
    (market_level = 'country' and city_name is null)
    or (market_level = 'city' and city_name is not null and char_length(trim(city_name)) > 0)
  ),
  constraint chk_global_markets_publish_readiness check (
    status <> 'published'
    or (
      char_length(trim(country_name)) > 0
      and char_length(trim(country_slug)) > 0
      and char_length(trim(title)) > 0
      and char_length(trim(slug)) > 0
      and (
        (market_level = 'country' and city_name is null)
        or (market_level = 'city' and city_name is not null and char_length(trim(city_name)) > 0)
      )
      and (
        char_length(trim(market_overview)) >= 40
        or char_length(trim(market_analysis)) >= 40
        or char_length(trim(investment_insights)) >= 40
      )
      and (
        char_length(trim(market_overview))
        + char_length(trim(market_analysis))
        + char_length(trim(investment_insights))
      ) >= 80
      and char_length(trim(data_source_name)) > 0
      and last_verified_at is not null
    )
  )
);

-- Indexes for fast public country/city lookups, homepage directory aggregation, and CMS filtering
create index if not exists idx_global_markets_public_country
  on public.global_markets (status, country_slug, market_level, is_featured desc, last_verified_at desc nulls last);

create index if not exists idx_global_markets_country_city
  on public.global_markets (country_name, city_name);

create index if not exists idx_global_markets_featured
  on public.global_markets (is_featured, published_at desc)
  where status = 'published';

create index if not exists idx_global_markets_source_type
  on public.global_markets (data_source_type, status);

-- Normalization & first-publish timestamp trigger scoped strictly to public.global_markets
create or replace function public.handle_global_markets_write()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.country_name := trim(coalesce(new.country_name, ''));
  new.country_code := upper(trim(coalesce(new.country_code, '')));
  new.country_slug := lower(trim(coalesce(new.country_slug, '')));
  new.city_name := nullif(trim(coalesce(new.city_name, '')), '');
  new.title := trim(coalesce(new.title, ''));
  new.slug := lower(trim(coalesce(new.slug, '')));
  new.currency := upper(trim(coalesce(new.currency, 'USD')));
  new.data_source_name := trim(coalesce(new.data_source_name, ''));
  new.data_source_url := nullif(trim(coalesce(new.data_source_url, '')), '');
  new.canonical_url := nullif(trim(coalesce(new.canonical_url, '')), '');

  if tg_op = 'INSERT' then
    if new.status = 'published' then
      new.published_at := coalesce(new.published_at, now());
    end if;
  elsif tg_op = 'UPDATE' then
    if old.published_at is not null then
      -- Preserve original first-published timestamp across edits and status updates
      new.published_at := old.published_at;
    elsif new.status = 'published' then
      new.published_at := coalesce(new.published_at, now());
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_global_markets_before_write on public.global_markets;
create trigger trg_global_markets_before_write
  before insert or update on public.global_markets
  for each row execute function public.handle_global_markets_write();

-- Updated timestamp trigger (reuses existing public.set_updated_at() from 001_initial_schema.sql)
drop trigger if exists trg_global_markets_updated_at on public.global_markets;
create trigger trg_global_markets_updated_at
  before update on public.global_markets
  for each row execute function public.set_updated_at();

-- ============================================================================
-- PostgreSQL Grants & Row Level Security (RLS) Policies
-- Reuses existing public.is_admin_or_editor() from 002_rls_and_storage.sql
-- ============================================================================

alter table public.global_markets enable row level security;

revoke all on table public.global_markets from public, anon, authenticated;
grant select on table public.global_markets to anon;
grant select, insert, update, delete on table public.global_markets to authenticated;
grant all on table public.global_markets to service_role;

-- Public can ONLY read published reports containing meaningful editorial content,
-- a valid data source name, a last verified date, and valid geography fields.
-- Draft, Archived, thin, unsourced, and unverified records remain hidden from public readers.
drop policy if exists "Published meaningful global market reports publicly readable" on public.global_markets;
create policy "Published meaningful global market reports publicly readable"
  on public.global_markets for select
  to anon, authenticated
  using (
    (
      status = 'published'
      and char_length(trim(country_name)) > 0
      and char_length(trim(country_slug)) > 0
      and char_length(trim(title)) > 0
      and char_length(trim(slug)) > 0
      and (
        (market_level = 'country' and city_name is null)
        or (market_level = 'city' and city_name is not null and char_length(trim(city_name)) > 0)
      )
      and (
        char_length(trim(market_overview)) >= 40
        or char_length(trim(market_analysis)) >= 40
        or char_length(trim(investment_insights)) >= 40
      )
      and (
        char_length(trim(market_overview))
        + char_length(trim(market_analysis))
        + char_length(trim(investment_insights))
      ) >= 80
      and char_length(trim(data_source_name)) > 0
      and last_verified_at is not null
    )
    or public.is_admin_or_editor()
  );

drop policy if exists "Admins and editors can insert global markets" on public.global_markets;
create policy "Admins and editors can insert global markets"
  on public.global_markets for insert
  to authenticated
  with check (public.is_admin_or_editor());

drop policy if exists "Admins and editors can update global markets" on public.global_markets;
create policy "Admins and editors can update global markets"
  on public.global_markets for update
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

drop policy if exists "Admins and editors can delete global markets" on public.global_markets;
create policy "Admins and editors can delete global markets"
  on public.global_markets for delete
  to authenticated
  using (public.is_admin_or_editor());
