# AMAAN ESTATE Property Marketplace — Database & Integration Setup

This guide explains how to activate the **Buy** (`/buy`), **Rent** (`/rent`), **Property Details** (`/properties/:slug`), **Property Enquiries**, and **Admin Property CMS** tables in your live Supabase project.

> **Important**: The application code handles pending migrations safely—if the marketplace tables have not yet been created in Supabase, public pages render clean empty states with zero errors while keeping all editorial articles intact. No mock or demo property records are injected.

---

## 1. Tables, Policies & Storage Included

Running `supabase/migrations/20261111143000_create_property_marketplace.sql` creates:

- **`public.listing_sources`**: Registry for internal CMS and future external feed providers (`manual`, `listhub`, `feed`, `api`).
- **`public.properties`**: Full global property schema separating `transaction_type` (`'sale' | 'rent'`), `listing_status`, `publication_status`, pricing/rental period, geographic fields, architectural metadata, agent contact fields, and external feed provenance (`source_name`, `source_listing_id`, `source_url`, `raw_payload`).
  - Enforces deduplication via unique partial index `uq_properties_source_listing` on `(source_name, source_listing_id)`.
- **`public.property_images`**: Ordered multi-image gallery records linked to `public.properties(id)` with cascade delete.
- **`public.property_enquiries`**: Prospective buyer/tenant enquiries linked to active published listings, protected by validation constraints and RLS.
- **Row Level Security (RLS)**:
  - Public `anon`/`authenticated` `SELECT` is strictly limited to `publication_status = 'published'` and `listing_status in ('available', 'pending', 'under_contract')`. Draft and archived listings are never exposed publicly.
  - Public `INSERT` on `property_enquiries` validates name length, email format, message length (`>= 10` chars), and target property availability.
  - Admin & Editor (`public.is_admin_or_editor()`) roles have full management access across all marketplace tables.
- **Storage Bucket (`property-media`)**: Public read bucket (5 MB file limit; JPEG, PNG, WebP, AVIF) with write/update/delete restricted to admins and editors.

---

## 2. Applying the Migration in Supabase SQL Editor

1. Log in to your **Supabase Dashboard** and select your AMAAN ESTATE project.
2. Open **SQL Editor** in the left navigation bar and click **New query**.
3. Copy the complete contents of:
   ```text
   supabase/migrations/20261111143000_create_property_marketplace.sql
   ```
4. Paste into the SQL Editor and click **Run**.
5. The script is idempotent (`IF NOT EXISTS`, `DROP ... IF EXISTS`, `ON CONFLICT DO UPDATE`) and reuses `public.set_updated_at()`, `public.is_admin()`, and `public.is_admin_or_editor()` from migrations `001` and `002`.

---

## 3. Verifying Storage Setup

After executing the SQL migration:

1. Navigate to **Storage -> Buckets** in the Supabase Dashboard.
2. Confirm **`property-media`** appears with **Public = true**.
3. When signed in as an `admin` or `editor` in `/admin`, uploading property gallery photos inside the **Properties** tab uploads directly into `property-media`.

---

## 4. Required Environment Variables

Ensure your `.env` (local) and Vercel **Project Settings -> Environment Variables** include:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Server-side API routes (can match VITE_* or be set explicitly)
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Optional: Canonical origin override for sitemap/SSR
CANONICAL_SITE_URL=https://www.amaanestate.com
```

> Never commit or expose a `SUPABASE_SERVICE_ROLE_KEY` in client `VITE_*` variables. All public marketplace routes run safely through Express `/api/properties*` endpoints backed by Supabase RLS.

---

## 5. Verification SQL Queries

Run these queries in **Supabase SQL Editor** to confirm the schema and policies were applied cleanly:

```sql
-- Verify tables exist
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('listing_sources', 'properties', 'property_images', 'property_enquiries')
order by table_name;

-- Verify RLS is enabled
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('listing_sources', 'properties', 'property_images', 'property_enquiries');

-- Verify storage bucket
select id, name, public, file_size_limit
from storage.buckets
where id = 'property-media';
```

---

## 6. Future ListHub / Partner Feed Integration Notes

The database schema is structured to ingest authorized XML / RETS / RESO feeds (such as **ListHub**) without schema redesign or duplicate records:

- **`source_name`** + **`source_listing_id`** have a unique composite constraint so scheduled sync jobs can safely perform upserts.
- **`source_url`** preserves the external syndication permalink for attribution on `/properties/:slug`.
- **`raw_payload`** (`jsonb`) stores the untouched partner record for auditing and incremental field mapping.
- No third-party syndication adapter is active yet. Partner credentials, feed endpoints, data licensing review, and an authenticated server-side sync cron/worker should be configured once a formal ListHub agreement is in place.
