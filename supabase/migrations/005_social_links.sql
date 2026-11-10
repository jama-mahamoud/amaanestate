-- ============================================================================
-- AMAAN ESTATE — Migration 005: Social Media Links Management
-- Safe, idempotent creation of social_links table and RLS policies
-- ============================================================================

begin;

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  name text not null,
  url text not null,
  icon_name text not null default 'globe',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.social_links enable row level security;

-- Public Policy: Allow anyone to read active social links or admins to read all
drop policy if exists "Allow public read active social links" on public.social_links;
create policy "Allow public read active social links"
  on public.social_links
  for select
  using (is_active = true or public.is_admin());

-- Admin Policy: Allow administrators to INSERT, UPDATE, DELETE
drop policy if exists "Allow admin full manage social links" on public.social_links;
create policy "Allow admin full manage social links"
  on public.social_links
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed Default Social Links if table is empty
insert into public.social_links (platform, name, url, icon_name, display_order, is_active)
select 'twitter', 'X (Twitter)', 'https://x.com/amaanestate', 'twitter', 1, true
where not exists (select 1 from public.social_links where platform = 'twitter');

insert into public.social_links (platform, name, url, icon_name, display_order, is_active)
select 'linkedin', 'LinkedIn', 'https://linkedin.com/company/amaanestate', 'linkedin', 2, true
where not exists (select 1 from public.social_links where platform = 'linkedin');

insert into public.social_links (platform, name, url, icon_name, display_order, is_active)
select 'instagram', 'Instagram', 'https://instagram.com/amaanestate', 'instagram', 3, true
where not exists (select 1 from public.social_links where platform = 'instagram');

insert into public.social_links (platform, name, url, icon_name, display_order, is_active)
select 'youtube', 'YouTube', 'https://youtube.com/@amaanestate', 'youtube', 4, true
where not exists (select 1 from public.social_links where platform = 'youtube');

insert into public.social_links (platform, name, url, icon_name, display_order, is_active)
select 'facebook', 'Facebook', 'https://facebook.com/amaanestate', 'facebook', 5, true
where not exists (select 1 from public.social_links where platform = 'facebook');

insert into public.social_links (platform, name, url, icon_name, display_order, is_active)
select 'telegram', 'Telegram', 'https://t.me/amaanestate', 'telegram', 6, true
where not exists (select 1 from public.social_links where platform = 'telegram');

insert into public.social_links (platform, name, url, icon_name, display_order, is_active)
select 'tiktok', 'TikTok', 'https://tiktok.com/@amaanestate', 'tiktok', 7, true
where not exists (select 1 from public.social_links where platform = 'tiktok');

commit;
