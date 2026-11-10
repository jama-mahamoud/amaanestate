-- ============================================================================
-- AMAAN ESTATE (amaanestate.com)
-- Migration 001: Core Relational Schema
-- Global Real Estate Media, Research & Knowledge Platform
-- ============================================================================

-- Enable required extensions
create extension if not exists "pgcrypto";

-- 1. Roles
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (name in ('admin', 'editor', 'author', 'reader')),
  description text,
  created_at timestamptz not null default now()
);

-- 2. User Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  avatar_url text,
  bio text,
  role_id uuid references public.roles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  image_url text,
  display_order integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Authors
create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  slug text not null unique,
  title text not null default 'Contributor',
  bio text not null default '',
  avatar_url text,
  email text,
  twitter_url text,
  linkedin_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Articles
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',
  featured_image text,
  gallery_images jsonb not null default '[]'::jsonb,
  category_id uuid not null references public.categories(id) on delete restrict,
  author_id uuid not null references public.authors(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published')),
  is_featured boolean not null default false,
  reading_time integer not null default 5 check (reading_time > 0),
  view_count integer not null default 0 check (view_count >= 0),
  seo_title text,
  seo_description text,
  og_image text,
  published_at timestamptz,
  scheduled_for timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Tags
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- 7. Article Tags (Many-to-Many)
create table if not exists public.article_tags (
  article_id uuid not null references public.articles(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

-- 8. Media Library
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_path text not null unique,
  public_url text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  alt_text text default '',
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 9. Newsletter Subscribers
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  source text not null default 'website',
  confirmed_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. Contact Messages
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default 'General Inquiry',
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'replied', 'archived')),
  admin_notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 11. Site Settings (Singleton configuration)
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  site_name text not null default 'AMAAN ESTATE',
  tagline text not null default 'Global Real Estate Media, Research & Knowledge Platform',
  domain text not null default 'amaanestate.com',
  default_seo_title text not null default 'AMAAN ESTATE — Global Real Estate Media, Research & Knowledge',
  default_seo_description text not null default 'International editorial reporting, research, and analysis covering real estate investment, architecture, construction, home living, and property markets.',
  default_og_image text,
  editorial_email text not null default 'editorial@amaanestate.com',
  social_links jsonb not null default '{"twitter":"","linkedin":"","instagram":"","youtube":""}'::jsonb,
  adsense_client_id text default '',
  adsense_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- Indexes for Query & Full-Text Search Performance
-- ============================================================================

create index if not exists idx_articles_slug on public.articles (slug);
create index if not exists idx_articles_status_published_at on public.articles (status, published_at desc);
create index if not exists idx_articles_category_id on public.articles (category_id);
create index if not exists idx_articles_author_id on public.articles (author_id);
create index if not exists idx_articles_featured on public.articles (is_featured) where status = 'published';
create index if not exists idx_articles_search_gin on public.articles using gin (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, ''))
);

create index if not exists idx_categories_slug on public.categories (slug);
create index if not exists idx_tags_slug on public.tags (slug);
create index if not exists idx_newsletter_email on public.newsletter_subscribers (email);
create index if not exists idx_contact_messages_status on public.contact_messages (status, created_at desc);

-- ============================================================================
-- Triggers: Automated Timestamps & Auth Profile Provisioning
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists trg_authors_updated_at on public.authors;
create trigger trg_authors_updated_at before update on public.authors
  for each row execute function public.set_updated_at();

drop trigger if exists trg_articles_updated_at on public.articles;
create trigger trg_articles_updated_at before update on public.articles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_newsletter_updated_at on public.newsletter_subscribers;
create trigger trg_newsletter_updated_at before update on public.newsletter_subscribers
  for each row execute function public.set_updated_at();

drop trigger if exists trg_contact_messages_updated_at on public.contact_messages;
create trigger trg_contact_messages_updated_at before update on public.contact_messages
  for each row execute function public.set_updated_at();

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Automatically create a profile with default 'reader' role when a Supabase user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_role_id uuid;
begin
  select id into default_role_id from public.roles where name = 'reader' limit 1;
  insert into public.profiles (id, email, full_name, role_id)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    default_role_id
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper RPC to safely increment article views from public client
create or replace function public.increment_article_view(article_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.articles
  set view_count = view_count + 1
  where slug = article_slug
    and status = 'published'
    and (published_at is null or published_at <= now());
end;
$$;

grant execute on function public.increment_article_view(text) to anon, authenticated;
