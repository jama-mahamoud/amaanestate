# AMAAN ESTATE — Supabase Setup & Deployment Guide

This guide walks through provisioning and connecting your live **Supabase** project for **AMAAN ESTATE** (`amaanestate.com`), including database migrations, Row Level Security (RLS), Storage, Admin user provisioning, and production deployment.

---

## 1. Create a Supabase Project

1. Sign in to [supabase.com](https://supabase.com) and create a new project.
2. Choose a strong database password and select the region closest to your primary readership.
3. Once provisioned, navigate to **Project Settings → API** and record:
   - **Project URL** (`VITE_SUPABASE_URL`)
   - **Publishable / Anon Key** (`VITE_SUPABASE_ANON_KEY`)

> **Security Note:** Never expose the `service_role` key in frontend code or `VITE_*` environment variables. All client mutations are protected by PostgreSQL Row Level Security (RLS).

---

## 2. Configure Environment Variables

Copy `.env.example` to `.env` (or configure the variables in your hosting provider such as Vercel, Netlify, or Cloud Run):

```env
VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
APP_URL="https://amaanestate.com"
```

Restart the development server after updating `.env`.

---

## 3. Run Database Migrations

Open the **SQL Editor** inside your Supabase dashboard and execute the three migration files in exact order:

1. `supabase/migrations/001_initial_schema.sql` — Creates all 11 relational tables (`roles`, `profiles`, `categories`, `authors`, `articles`, `tags`, `article_tags`, `media`, `newsletter_subscribers`, `contact_messages`, `site_settings`), full-text search indexes, and triggers.
2. `supabase/migrations/002_rls_and_storage.sql` — Enables RLS across all tables, configures role-based policies (blocking public reads on `draft` and `scheduled` articles), creates the `editorial-media` public Storage bucket, and applies Storage upload/delete policies.
3. `supabase/migrations/003_seed_data.sql` — Seeds system roles (`admin`, `editor`, `author`, `reader`), default `site_settings`, the five editorial categories (`Investment`, `Architecture`, `Construction`, `Home & Living`, `News`), initial authors, and tags.

---

## 4. Create the First Admin User

1. In Supabase Dashboard, go to **Authentication → Users → Add User** (or sign up through `/admin/login`).
2. Create your editorial administrator account with email and password.
3. Run the following SQL in the **SQL Editor** to promote that user to the `admin` role:

```sql
update public.profiles
set role_id = (select id from public.roles where name = 'admin'),
    full_name = 'Chief Editor'
where email = 'admin@amaanestate.com';
```

4. Visit `/admin/login` on your site and sign in with your credentials.

---

## 5. Production Build & Deployment

### Build Commands
```bash
npm install
npm run build
npm run start
```

### Vercel Deployment
1. Import the repository into Vercel.
2. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `APP_URL` in **Project Settings → Environment Variables**.
3. `vercel.json` is pre-configured to route `/api/*` to the Express server (including dynamic `/sitemap.xml` and `/robots.txt` endpoints) and serve the SPA cleanly.

### SEO & Google AdSense Readiness
- Dynamic XML sitemap is served at `/sitemap.xml` and `/api/sitemap.xml`.
- Robots directives are served at `/robots.txt` and `/api/robots.txt`.
- Configure your Google AdSense Client ID and toggle ad slots directly inside **Admin Dashboard → SEO & Site Settings**.
