-- ============================================================================
-- AMAAN ESTATE (https://www.amaanestate.com)
-- Migration: Add optional Social Media Sharing Image fields to global_markets
-- Safe, idempotent migration preserving all existing columns, records, and RLS.
-- ============================================================================

alter table public.global_markets
  add column if not exists social_image text,
  add column if not exists social_image_alt text;

comment on column public.global_markets.social_image is
  'Optional publicly accessible HTTPS image URL (recommended 1200x630) for Open Graph & Twitter link previews. Falls back to cover_image and site default OG image.';

comment on column public.global_markets.social_image_alt is
  'Optional alt text describing the social media sharing image for og:image:alt and twitter:image:alt.';
