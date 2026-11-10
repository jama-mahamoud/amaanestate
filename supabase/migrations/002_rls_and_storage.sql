-- ============================================================================
-- AMAAN ESTATE (amaanestate.com)
-- Migration 002: Row Level Security (RLS) & Storage Bucket Policies
-- ============================================================================

-- Role Check Helper Functions (SECURITY DEFINER to avoid infinite recursion)
create or replace function public.get_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.name
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
  limit 1;
$$;

create or replace function public.get_user_role_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.role_id
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.get_user_role() = 'admin', false);
$$;

create or replace function public.is_editorial_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.get_user_role() in ('admin', 'editor', 'author'), false);
$$;

create or replace function public.is_admin_or_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.get_user_role() in ('admin', 'editor'), false);
$$;

-- Enable RLS on all tables
alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.authors enable row level security;
alter table public.articles enable row level security;
alter table public.tags enable row level security;
alter table public.article_tags enable row level security;
alter table public.media enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings enable row level security;

-- 1. ROLES
drop policy if exists "Roles readable by authenticated users" on public.roles;
create policy "Roles readable by authenticated users"
  on public.roles for select
  to authenticated
  using (true);

drop policy if exists "Roles modifiable only by admins" on public.roles;
create policy "Roles modifiable only by admins"
  on public.roles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 2. PROFILES
drop policy if exists "Users can view own profile; admins can view all" on public.profiles;
create policy "Users can view own profile; admins can view all"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "Users can update own non-role profile details" on public.profiles;
create policy "Users can update own non-role profile details"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (
    public.is_admin() or (
      id = auth.uid() and
      role_id is not distinct from public.get_user_role_id()
    )
  );

-- 3. CATEGORIES
drop policy if exists "Categories publicly readable" on public.categories;
create policy "Categories publicly readable"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "Categories managed by admins and editors" on public.categories;
create policy "Categories managed by admins and editors"
  on public.categories for all
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

-- 4. AUTHORS
drop policy if exists "Active authors publicly readable; all readable by staff" on public.authors;
create policy "Active authors publicly readable; all readable by staff"
  on public.authors for select
  to anon, authenticated
  using (active = true or public.is_editorial_staff());

drop policy if exists "Authors managed by admins and editors" on public.authors;
create policy "Authors managed by admins and editors"
  on public.authors for all
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

-- 5. ARTICLES
-- Public can ONLY read published articles whose publication time has passed.
-- Draft and scheduled articles are strictly invisible to the public.
drop policy if exists "Published articles publicly readable" on public.articles;
create policy "Published articles publicly readable"
  on public.articles for select
  to anon, authenticated
  using (
    (status = 'published' and (published_at is null or published_at <= now()))
    or public.is_editorial_staff()
  );

drop policy if exists "Editorial staff can insert articles" on public.articles;
create policy "Editorial staff can insert articles"
  on public.articles for insert
  to authenticated
  with check (
    public.is_admin_or_editor()
    or (public.get_user_role() = 'author' and status = 'draft' and is_featured = false)
  );

drop policy if exists "Admins and editors can update any article; authors can update own drafts" on public.articles;
create policy "Admins and editors can update any article; authors can update own drafts"
  on public.articles for update
  to authenticated
  using (
    public.is_admin_or_editor()
    or (public.get_user_role() = 'author' and created_by = auth.uid() and status = 'draft')
  )
  with check (
    public.is_admin_or_editor()
    or (public.get_user_role() = 'author' and created_by = auth.uid() and status = 'draft' and is_featured = false)
  );

drop policy if exists "Admins and editors can delete articles" on public.articles;
create policy "Admins and editors can delete articles"
  on public.articles for delete
  to authenticated
  using (public.is_admin_or_editor());

-- 6. TAGS & ARTICLE_TAGS
drop policy if exists "Tags publicly readable" on public.tags;
create policy "Tags publicly readable"
  on public.tags for select
  to anon, authenticated
  using (true);

drop policy if exists "Tags managed by editorial staff" on public.tags;
create policy "Tags managed by editorial staff"
  on public.tags for all
  to authenticated
  using (public.is_editorial_staff())
  with check (public.is_editorial_staff());

drop policy if exists "Article tags publicly readable for published articles" on public.article_tags;
create policy "Article tags publicly readable for published articles"
  on public.article_tags for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.articles a
      where a.id = article_id
        and (
          (a.status = 'published' and (a.published_at is null or a.published_at <= now()))
          or public.is_editorial_staff()
        )
    )
  );

drop policy if exists "Article tags managed by editorial staff" on public.article_tags;
create policy "Article tags managed by editorial staff"
  on public.article_tags for all
  to authenticated
  using (public.is_editorial_staff())
  with check (public.is_editorial_staff());

-- 7. MEDIA
drop policy if exists "Media publicly readable" on public.media;
create policy "Media publicly readable"
  on public.media for select
  to anon, authenticated
  using (true);

drop policy if exists "Media uploadable and manageable by editorial staff" on public.media;
create policy "Media uploadable and manageable by editorial staff"
  on public.media for all
  to authenticated
  using (public.is_editorial_staff())
  with check (public.is_editorial_staff());

-- 8. NEWSLETTER SUBSCRIBERS
drop policy if exists "Anyone can subscribe with valid email" on public.newsletter_subscribers;
create policy "Anyone can subscribe with valid email"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    and status = 'subscribed'
  );

drop policy if exists "Only admins and editors can read or manage subscribers" on public.newsletter_subscribers;
create policy "Only admins and editors can read or manage subscribers"
  on public.newsletter_subscribers for select
  to authenticated
  using (public.is_admin_or_editor());

drop policy if exists "Only admins and editors can update subscribers" on public.newsletter_subscribers;
create policy "Only admins and editors can update subscribers"
  on public.newsletter_subscribers for update
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

drop policy if exists "Only admins can delete subscribers" on public.newsletter_subscribers;
create policy "Only admins can delete subscribers"
  on public.newsletter_subscribers for delete
  to authenticated
  using (public.is_admin());

-- Safe subscribe / resubscribe RPC for public readers (handles unsubscribed -> subscribed)
create or replace function public.subscribe_newsletter(subscriber_email text, subscribe_source text default 'website')
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text;
  existing_status text;
begin
  normalized_email := lower(trim(coalesce(subscriber_email, '')));
  if normalized_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' then
    return 'invalid_email';
  end if;

  select status into existing_status
  from public.newsletter_subscribers
  where lower(email) = normalized_email
  limit 1;

  if existing_status = 'subscribed' then
    return 'already_subscribed';
  end if;

  insert into public.newsletter_subscribers (email, status, source, confirmed_at)
  values (normalized_email, 'subscribed', coalesce(nullif(trim(subscribe_source), ''), 'website'), now())
  on conflict (email) do update
    set status = 'subscribed',
        source = coalesce(nullif(trim(subscribe_source), ''), newsletter_subscribers.source),
        confirmed_at = now(),
        updated_at = now();

  return 'subscribed';
end;
$$;

-- Safe unsubscribe RPC for readers using their exact email
create or replace function public.unsubscribe_newsletter(subscriber_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  update public.newsletter_subscribers
  set status = 'unsubscribed', updated_at = now()
  where lower(email) = lower(trim(subscriber_email));
  get diagnostics affected = row_count;
  return affected > 0;
end;
$$;

grant execute on function public.subscribe_newsletter(text, text) to anon, authenticated;
grant execute on function public.unsubscribe_newsletter(text) to anon, authenticated;

-- 9. CONTACT MESSAGES
drop policy if exists "Public can submit contact messages" on public.contact_messages;
create policy "Public can submit contact messages"
  on public.contact_messages for insert
  to anon, authenticated
  with check (
    char_length(trim(name)) >= 2
    and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    and char_length(trim(message)) >= 5
  );

drop policy if exists "Only admins and editors can view and manage contact messages" on public.contact_messages;
create policy "Only admins and editors can view and manage contact messages"
  on public.contact_messages for select
  to authenticated
  using (public.is_admin_or_editor());

drop policy if exists "Only admins and editors can update contact messages" on public.contact_messages;
create policy "Only admins and editors can update contact messages"
  on public.contact_messages for update
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

drop policy if exists "Only admins can delete contact messages" on public.contact_messages;
create policy "Only admins can delete contact messages"
  on public.contact_messages for delete
  to authenticated
  using (public.is_admin());

-- 10. SITE SETTINGS
drop policy if exists "Site settings publicly readable" on public.site_settings;
create policy "Site settings publicly readable"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Site settings modifiable only by admins" on public.site_settings;
create policy "Site settings modifiable only by admins"
  on public.site_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- Supabase Storage Bucket & Policies ('editorial-media')
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'editorial-media',
  'editorial-media',
  true,
  5242880, -- 5 MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Editorial media publicly viewable" on storage.objects;
create policy "Editorial media publicly viewable"
  on storage.objects for select
  to public
  using (bucket_id = 'editorial-media');

drop policy if exists "Editorial staff can upload media" on storage.objects;
create policy "Editorial staff can upload media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'editorial-media'
    and public.is_editorial_staff()
  );

drop policy if exists "Editorial staff can update media" on storage.objects;
create policy "Editorial staff can update media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'editorial-media'
    and public.is_editorial_staff()
  );

drop policy if exists "Admins and editors can delete media" on storage.objects;
create policy "Admins and editors can delete media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'editorial-media'
    and public.is_admin_or_editor()
  );
