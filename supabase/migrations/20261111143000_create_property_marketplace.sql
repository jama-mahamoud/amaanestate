-- ============================================================================
-- AMAAN ESTATE (https://www.amaanestate.com)
-- Migration: Global Property Marketplace & ListHub-Ready Schema
-- Safe to run on existing editorial Supabase databases (migrations 001-005).
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Listing Sources (Manual CMS, ListHub, XML/RESO feeds)
create table if not exists public.listing_sources (
  id uuid primary key default gen_random_uuid(),
  source_name text not null unique,
  source_type text not null default 'manual' check (source_type in ('manual', 'listhub', 'feed', 'api')),
  feed_url text,
  is_active boolean not null default true,
  sync_frequency text default 'manual',
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Properties
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  transaction_type text not null check (transaction_type in ('sale', 'rent')),
  property_type text not null check (
    property_type in ('house', 'apartment', 'villa', 'townhouse', 'condominium', 'land', 'other')
  ),
  listing_status text not null default 'available' check (
    listing_status in ('available', 'pending', 'under_contract', 'sold', 'rented', 'off_market')
  ),
  publication_status text not null default 'draft' check (
    publication_status in ('draft', 'published', 'archived')
  ),
  price numeric(14, 2) not null check (price >= 0),
  currency text not null default 'USD' check (char_length(trim(currency)) between 3 and 8),
  rental_period text check (rental_period is null or rental_period in ('month', 'year', 'week')),
  available_from date,
  bedrooms integer check (bedrooms is null or bedrooms >= 0),
  bathrooms numeric(4, 1) check (bathrooms is null or bathrooms >= 0),
  area_value numeric(12, 2) check (area_value is null or area_value >= 0),
  area_unit text not null default 'sqft' check (area_unit in ('sqft', 'sqm', 'acres')),
  address_line text,
  city text not null,
  state_region text,
  country text not null,
  postal_code text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  description text not null default '',
  features jsonb not null default '[]'::jsonb,
  is_featured boolean not null default false,
  agent_name text,
  agent_email text,
  agent_phone text,
  brokerage_name text,
  source_id uuid references public.listing_sources(id) on delete set null,
  source_name text not null default 'manual',
  source_listing_id text,
  source_url text,
  raw_payload jsonb,
  created_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Property Images
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4. Property Enquiries
create table if not exists public.property_enquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed', 'archived')),
  admin_notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- Indexes & Feed Deduplication Constraints
-- ============================================================================

create unique index if not exists uq_properties_source_listing
  on public.properties (source_name, source_listing_id)
  where source_listing_id is not null;

create index if not exists idx_properties_slug
  on public.properties (slug);

create index if not exists idx_properties_public_search
  on public.properties (publication_status, transaction_type, listing_status, published_at desc);

create index if not exists idx_properties_property_type
  on public.properties (property_type);

create index if not exists idx_properties_location
  on public.properties (country, city);

create index if not exists idx_properties_price
  on public.properties (price);

create index if not exists idx_properties_bedrooms
  on public.properties (bedrooms);

create index if not exists idx_properties_available_from
  on public.properties (available_from)
  where transaction_type = 'rent';

create index if not exists idx_properties_featured
  on public.properties (is_featured, published_at desc)
  where publication_status = 'published';

create index if not exists idx_property_images_property_order
  on public.property_images (property_id, is_primary desc, display_order asc);

create index if not exists idx_property_enquiries_property_status
  on public.property_enquiries (property_id, status, created_at desc);

-- ============================================================================
-- Updated Timestamp Triggers (Reuses public.set_updated_at() from 001_initial_schema.sql)
-- ============================================================================

drop trigger if exists trg_listing_sources_updated_at on public.listing_sources;
create trigger trg_listing_sources_updated_at
  before update on public.listing_sources
  for each row execute function public.set_updated_at();

drop trigger if exists trg_properties_updated_at on public.properties;
create trigger trg_properties_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

drop trigger if exists trg_property_enquiries_updated_at on public.property_enquiries;
create trigger trg_property_enquiries_updated_at
  before update on public.property_enquiries
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- Reuses public.is_admin() and public.is_admin_or_editor() from 002_rls_and_storage.sql
-- ============================================================================

alter table public.listing_sources enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.property_enquiries enable row level security;

-- LISTING SOURCES
drop policy if exists "Listing sources manageable by admins and editors" on public.listing_sources;
create policy "Listing sources manageable by admins and editors"
  on public.listing_sources for all
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

-- PROPERTIES
drop policy if exists "Published active properties publicly readable" on public.properties;
create policy "Published active properties publicly readable"
  on public.properties for select
  to anon, authenticated
  using (
    (
      publication_status = 'published'
      and listing_status in ('available', 'pending', 'under_contract')
    )
    or public.is_admin_or_editor()
  );

drop policy if exists "Admins and editors can insert properties" on public.properties;
create policy "Admins and editors can insert properties"
  on public.properties for insert
  to authenticated
  with check (public.is_admin_or_editor());

drop policy if exists "Admins and editors can update properties" on public.properties;
create policy "Admins and editors can update properties"
  on public.properties for update
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

drop policy if exists "Admins and editors can delete properties" on public.properties;
create policy "Admins and editors can delete properties"
  on public.properties for delete
  to authenticated
  using (public.is_admin_or_editor());

-- PROPERTY IMAGES
drop policy if exists "Property images publicly readable for active listings" on public.property_images;
create policy "Property images publicly readable for active listings"
  on public.property_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id
        and (
          (
            p.publication_status = 'published'
            and p.listing_status in ('available', 'pending', 'under_contract')
          )
          or public.is_admin_or_editor()
        )
    )
  );

drop policy if exists "Admins and editors can manage property images" on public.property_images;
create policy "Admins and editors can manage property images"
  on public.property_images for all
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

-- PROPERTY ENQUIRIES
drop policy if exists "Public can submit property enquiries for active listings" on public.property_enquiries;
create policy "Public can submit property enquiries for active listings"
  on public.property_enquiries for insert
  to anon, authenticated
  with check (
    char_length(trim(full_name)) >= 2
    and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    and char_length(trim(message)) >= 10
    and status = 'new'
    and exists (
      select 1 from public.properties p
      where p.id = property_id
        and p.publication_status = 'published'
        and p.listing_status in ('available', 'pending', 'under_contract')
    )
  );

drop policy if exists "Only admins and editors can read property enquiries" on public.property_enquiries;
create policy "Only admins and editors can read property enquiries"
  on public.property_enquiries for select
  to authenticated
  using (public.is_admin_or_editor());

drop policy if exists "Only admins and editors can update property enquiries" on public.property_enquiries;
create policy "Only admins and editors can update property enquiries"
  on public.property_enquiries for update
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

drop policy if exists "Only admins can delete property enquiries" on public.property_enquiries;
create policy "Only admins can delete property enquiries"
  on public.property_enquiries for delete
  to authenticated
  using (public.is_admin());

-- ============================================================================
-- Supabase Storage Bucket & Policies ('property-media')
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-media',
  'property-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Property media publicly viewable" on storage.objects;
create policy "Property media publicly viewable"
  on storage.objects for select
  to public
  using (bucket_id = 'property-media');

drop policy if exists "Admins and editors can upload property media" on storage.objects;
create policy "Admins and editors can upload property media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'property-media'
    and public.is_admin_or_editor()
  );

drop policy if exists "Admins and editors can update property media" on storage.objects;
create policy "Admins and editors can update property media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'property-media'
    and public.is_admin_or_editor()
  );

drop policy if exists "Admins and editors can delete property media" on storage.objects;
create policy "Admins and editors can delete property media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'property-media'
    and public.is_admin_or_editor()
  );
