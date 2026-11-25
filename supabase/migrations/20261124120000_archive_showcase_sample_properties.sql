-- ============================================================================
-- Archive Demonstration Showcase Property Records ONLY
-- ============================================================================
-- Safely unpublishes/archives only the 4 illustrative demonstration showcase
-- records seeded by 20261111160000_seed_showcase_properties.sql so they are
-- not displayed publicly after repositioning AMAAN ESTATE to Global Markets.
--
-- Safety guarantees:
--   - Idempotent: safe to re-run without side effects.
--   - Non-destructive: does NOT delete rows, images, or alter table structure.
--   - Targeted: strictly scoped to the 4 identified showcase_sample UUIDs.
--   - Genuine property records remain completely untouched.
-- ============================================================================

UPDATE public.properties
SET
  publication_status = 'archived',
  is_featured = false,
  updated_at = NOW()
WHERE
  source_name = 'showcase_sample'
  AND id IN (
    'a0000001-0000-0000-0000-000000000001',
    'a0000002-0000-0000-0000-000000000002',
    'a0000003-0000-0000-0000-000000000003',
    'a0000004-0000-0000-0000-000000000004'
  )
  AND (
    publication_status IS DISTINCT FROM 'archived'
    OR is_featured IS DISTINCT FROM false
  );
