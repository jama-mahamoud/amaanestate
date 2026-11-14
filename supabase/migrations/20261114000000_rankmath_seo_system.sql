-- ============================================================================
-- AMAAN ESTATE (https://www.amaanestate.com)
-- Migration: Complete Rank Math-Level Editorial & Technical SEO System
-- Safe and idempotent to run on existing Supabase databases (001-005+).
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Extend public.articles with editorial SEO, intent, technical directives & score persistence
alter table public.articles
  add column if not exists featured_image_alt text,
  add column if not exists featured_image_caption text,
  add column if not exists focus_keyword text,
  add column if not exists supporting_keywords text[] not null default '{}'::text[],
  add column if not exists search_intent text not null default 'Informational',
  add column if not exists target_country text,
  add column if not exists target_audience text,
  add column if not exists canonical_url text,
  add column if not exists robots_directive text not null default 'index, follow',
  add column if not exists schema_type text not null default 'Article',
  add column if not exists alternate_language text,
  add column if not exists alternate_article_slug text,
  add column if not exists seo_score integer,
  add column if not exists seo_analysis_json jsonb,
  add column if not exists last_seo_analyzed_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'chk_articles_search_intent'
  ) then
    alter table public.articles
      add constraint chk_articles_search_intent
      check (search_intent in ('Informational', 'Commercial', 'Transactional', 'Navigational'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'chk_articles_robots_directive'
  ) then
    alter table public.articles
      add constraint chk_articles_robots_directive
      check (robots_directive in ('index, follow', 'noindex, follow', 'noindex, nofollow', 'index, nofollow'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'chk_articles_schema_type'
  ) then
    alter table public.articles
      add constraint chk_articles_schema_type
      check (schema_type in ('Article', 'NewsArticle'));
  end if;
end $$;

create index if not exists idx_articles_focus_keyword
  on public.articles (focus_keyword)
  where focus_keyword is not null;

create index if not exists idx_articles_robots_directive
  on public.articles (robots_directive);

-- 2. SEO Redirects Table (301 / 302 Redirect Manager)
create table if not exists public.seo_redirects (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique,
  target_path text not null,
  status_code integer not null default 301 check (status_code in (301, 302)),
  is_active boolean not null default true,
  notes text default '',
  hit_count integer not null default 0 check (hit_count >= 0),
  last_hit_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_seo_redirects_active_source
  on public.seo_redirects (source_path)
  where is_active = true;

drop trigger if exists trg_seo_redirects_updated_at on public.seo_redirects;
create trigger trg_seo_redirects_updated_at
  before update on public.seo_redirects
  for each row execute function public.set_updated_at();

alter table public.seo_redirects enable row level security;

drop policy if exists "Active SEO redirects publicly readable" on public.seo_redirects;
create policy "Active SEO redirects publicly readable"
  on public.seo_redirects for select
  to anon, authenticated
  using (is_active = true or public.is_admin_or_editor());

drop policy if exists "Admins and editors manage SEO redirects" on public.seo_redirects;
create policy "Admins and editors manage SEO redirects"
  on public.seo_redirects for all
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

create or replace function public.increment_seo_redirect_hit(p_source_path text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.seo_redirects
  set hit_count = hit_count + 1,
      last_hit_at = now()
  where source_path = p_source_path
    and is_active = true;
end;
$$;

grant execute on function public.increment_seo_redirect_hit(text) to anon, authenticated;

-- 3. SEO Technical & Content Audit Runs
create table if not exists public.seo_audit_runs (
  id uuid primary key default gen_random_uuid(),
  summary jsonb not null default '{}'::jsonb,
  issues jsonb not null default '[]'::jsonb,
  checked_urls integer not null default 0,
  critical_count integer not null default 0,
  warning_count integer not null default 0,
  passed_count integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_seo_audit_runs_created_at
  on public.seo_audit_runs (created_at desc);

alter table public.seo_audit_runs enable row level security;

drop policy if exists "Admins and editors manage SEO audit runs" on public.seo_audit_runs;
create policy "Admins and editors manage SEO audit runs"
  on public.seo_audit_runs for all
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

-- 4. Google Search Console Connections (Singleton / Admin-Editor Restricted)
create table if not exists public.gsc_connections (
  id integer primary key default 1 check (id = 1),
  connected_by uuid references auth.users(id) on delete set null,
  google_email text,
  selected_site_url text,
  permission_level text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_gsc_connections_updated_at on public.gsc_connections;
create trigger trg_gsc_connections_updated_at
  before update on public.gsc_connections
  for each row execute function public.set_updated_at();

alter table public.gsc_connections enable row level security;

drop policy if exists "Admins and editors manage GSC connections" on public.gsc_connections;
create policy "Admins and editors manage GSC connections"
  on public.gsc_connections for all
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

-- 5. Google Search Console Snapshot Cache (Stores real fetched Search Analytics snapshots)
create table if not exists public.gsc_analytics_cache (
  id uuid primary key default gen_random_uuid(),
  site_url text not null,
  date_range text not null,
  payload jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now(),
  unique (site_url, date_range)
);

alter table public.gsc_analytics_cache enable row level security;

drop policy if exists "Admins and editors read and update GSC analytics cache" on public.gsc_analytics_cache;
create policy "Admins and editors read and update GSC analytics cache"
  on public.gsc_analytics_cache for all
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());
