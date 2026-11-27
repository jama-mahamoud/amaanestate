#!/usr/bin/env node
/**
 * AMAAN ESTATE — Ephemeral AI Image (images.openai.com) -> Supabase Storage Migration Script
 *
 * SAFETY GUARANTEES:
 *   1. DRY-RUN IS DEFAULT: Zero Storage uploads and zero DB writes occur unless `--apply`
 *      is explicitly passed. Dry-run never reads SUPABASE_SERVICE_ROLE_KEY.
 *   2. MANIFEST-FIRST EXECUTION: Phase 1 scans all image-bearing tables read-only, downloads
 *      and validates each ephemeral asset (allowlisted host, MIME type, <= 5 MB), computes
 *      deterministic content-addressed destination paths/URLs, and persists the complete
 *      rollback manifest JSON BEFORE any Storage upload or DB update runs.
 *   3. SEPARATE SNAPSHOTS: Original DB column values (`originalValues`), target Storage paths
 *      (`destinationPaths`), and planned replacement values (`plannedValues`) are stored
 *      separately on every manifest record.
 *   4. VERIFY-BEFORE-DB-UPDATE: In `--apply` mode, no DB row is updated until 100% of its
 *      replacement images are uploaded to `editorial-media` and verified via HTTP HEAD 200.
 *   5. RESUMABLE & IDEMPOTENT: Content-addressed paths (`migrated/...-<sha256_12>.<ext>`)
 *      plus pre-upload HTTP HEAD checks and `--manifest <path>` resume support avoid duplicate
 *      uploads and skip already-completed rows without corrupting live references.
 *   6. FAILURE-SAFE REPORTING: The manifest is updated atomically throughout execution and
 *      preserved on any error, with a clear report of completed uploads and DB updates.
 *   7. SECRET HYGIENE: Never prints, logs, or serializes API keys or service-role secrets.
 *
 * Usage:
 *   node supabase/manual_patches/migrate_openai_images_to_supabase.mjs
 *   node supabase/manual_patches/migrate_openai_images_to_supabase.mjs --manifest <path>
 *   node supabase/manual_patches/migrate_openai_images_to_supabase.mjs --apply
 *   node supabase/manual_patches/migrate_openai_images_to_supabase.mjs --apply --manifest <path>
 */

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const APPLY_CHANGES = process.argv.includes('--apply');
const BUCKET_NAME = 'editorial-media';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB limit defined in 002_rls_and_storage.sql
const ALLOWED_MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

const EPHEMERAL_IMAGE_URL_REGEX =
  /https:\/\/(?:images\.openai\.com|[a-z0-9-]+\.oaidalleapiprodscus\.blob\.core\.windows\.net)[^\s"'<>)]*/gi;

function parseManifestArg() {
  const idx = process.argv.indexOf('--manifest');
  if (idx !== -1 && process.argv[idx + 1]) {
    return path.resolve(process.cwd(), process.argv[idx + 1]);
  }
  const eqArg = process.argv.find((arg) => arg.startsWith('--manifest='));
  if (eqArg) {
    return path.resolve(process.cwd(), eqArg.slice('--manifest='.length));
  }
  return null;
}

function isEphemeralAiImageUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    return (
      host === 'images.openai.com' ||
      host.endsWith('.oaidalleapiprodscus.blob.core.windows.net')
    );
  } catch {
    return false;
  }
}

function sanitizeSlugSegment(raw) {
  return (
    String(raw || 'asset')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'asset'
  );
}

function redactErrorMessage(err) {
  const raw = err instanceof Error ? err.message : String(err || 'Unknown error');
  return raw
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]')
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED_JWT]');
}

function getEnvOrExit() {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  if (!supabaseUrl) {
    console.error('Missing SUPABASE_URL or VITE_SUPABASE_URL.');
    process.exit(1);
  }

  if (APPLY_CHANGES) {
    // Only inspect service-role key when --apply is explicitly requested; never log or serialize it.
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    if (!serviceKey) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY. Refusing --apply without service credentials.');
      process.exit(1);
    }
    return { supabaseUrl, apiKey: serviceKey };
  }

  // Dry-run mode uses strictly public/anon read credentials and never accesses service-role secrets.
  const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (!anonKey) {
    console.error('Missing SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY for read-only dry-run scan.');
    process.exit(1);
  }
  return { supabaseUrl, apiKey: anonKey };
}

async function downloadAndValidateImage(url) {
  if (!isEphemeralAiImageUrl(url)) {
    throw new Error(`Refusing non-allowlisted image URL: ${url}`);
  }

  const response = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} downloading ${url}`);
  }

  const contentTypeRaw = (response.headers.get('content-type') || '')
    .split(';')[0]
    .trim()
    .toLowerCase();
  const ext = ALLOWED_MIME_TO_EXT[contentTypeRaw];
  if (!ext) {
    throw new Error(`Unsupported MIME type "${contentTypeRaw}" for ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error(
      `Image size ${buffer.byteLength} bytes out of allowed bounds (1..${MAX_IMAGE_BYTES})`
    );
  }

  return { buffer, mimeType: contentTypeRaw, ext };
}

async function verifyPublicAssetUrl(publicUrl, expectedMimeType, expectedBytes) {
  const verifyResp = await fetch(publicUrl, {
    method: 'HEAD',
    redirect: 'follow',
    signal: AbortSignal.timeout(10000),
  });

  if (!verifyResp.ok) {
    return { ok: false, reason: `HTTP ${verifyResp.status}` };
  }

  const contentType = (verifyResp.headers.get('content-type') || '')
    .split(';')[0]
    .trim()
    .toLowerCase();
  if (!ALLOWED_MIME_TO_EXT[contentType]) {
    return { ok: false, reason: `Unexpected content-type "${contentType}"` };
  }
  if (expectedMimeType && contentType !== expectedMimeType) {
    return {
      ok: false,
      reason: `MIME mismatch: expected ${expectedMimeType}, got ${contentType}`,
    };
  }

  const contentLengthHeader = verifyResp.headers.get('content-length');
  if (expectedBytes && contentLengthHeader) {
    const remoteBytes = Number(contentLengthHeader);
    if (Number.isFinite(remoteBytes) && remoteBytes !== expectedBytes) {
      return {
        ok: false,
        reason: `Size mismatch: expected ${expectedBytes} bytes, got ${remoteBytes} bytes`,
      };
    }
  }

  return { ok: true, contentType };
}

async function writeManifestAtomic(manifestPath, manifest) {
  manifest.updatedAt = new Date().toISOString();
  const dir = path.dirname(manifestPath);
  await fs.mkdir(dir, { recursive: true });
  const tmpPath = `${manifestPath}.tmp-${process.pid}`;
  await fs.writeFile(tmpPath, JSON.stringify(manifest, null, 2), 'utf8');
  await fs.rename(tmpPath, manifestPath);
}

/**
 * Resolve or plan a unique ephemeral URL deterministically.
 * Makes ZERO storage uploads or DB writes.
 */
async function planAsset(supabase, sourceUrl, folderPrefix, slugHint, assetRegistry, bufferCache) {
  if (assetRegistry.has(sourceUrl)) {
    return assetRegistry.get(sourceUrl);
  }

  const hash = crypto.createHash('sha256').update(sourceUrl).digest('hex').slice(0, 12);
  const { buffer, mimeType, ext } = await downloadAndValidateImage(sourceUrl);
  const storagePath = `migrated/${folderPrefix}/${sanitizeSlugSegment(slugHint)}-${hash}.${ext}`;
  const { data: publicData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
  const plannedPublicUrl = publicData?.publicUrl || '';
  if (!plannedPublicUrl) {
    throw new Error(`Could not resolve deterministic public URL for ${BUCKET_NAME}/${storagePath}`);
  }

  const asset = {
    sourceUrl,
    sha256Short: hash,
    mimeType,
    byteLength: buffer.byteLength,
    bucket: BUCKET_NAME,
    destinationPath: storagePath,
    fullStoragePath: `${BUCKET_NAME}/${storagePath}`,
    plannedPublicUrl,
    uploadStatus: 'planned',
    verifiedAt: null,
    error: null,
  };

  assetRegistry.set(sourceUrl, asset);
  bufferCache.set(sourceUrl, buffer);
  return asset;
}

async function buildExecutionPlan(supabase) {
  const assetRegistry = new Map();
  const bufferCache = new Map();
  const records = [];
  const skippedTables = [];

  async function registerField(planState, column, sourceUrl, folderPrefix, slugHint, index = null) {
    const asset = await planAsset(
      supabase,
      sourceUrl,
      folderPrefix,
      slugHint,
      assetRegistry,
      bufferCache
    );
    planState.fieldMappings.push({
      column,
      ...(index !== null ? { index } : {}),
      sourceUrl,
      assetHash: asset.sha256Short,
      bucket: asset.bucket,
      destinationPath: asset.destinationPath,
      fullStoragePath: asset.fullStoragePath,
      plannedPublicUrl: asset.plannedPublicUrl,
    });
    return asset;
  }

  // 1. public.articles (featured_image, og_image, gallery_images, inline content)
  const { data: articles, error: articlesErr } = await supabase
    .from('articles')
    .select('id, slug, featured_image, og_image, gallery_images, content');
  if (articlesErr) throw articlesErr;

  for (const row of articles || []) {
    const planState = { fieldMappings: [] };
    const originalValues = {};
    const destinationPaths = {};
    const plannedValues = {};

    if (isEphemeralAiImageUrl(row.featured_image)) {
      const asset = await registerField(
        planState,
        'featured_image',
        row.featured_image,
        'articles',
        `${row.slug}-featured`
      );
      originalValues.featured_image = row.featured_image;
      destinationPaths.featured_image = asset.fullStoragePath;
      plannedValues.featured_image = asset.plannedPublicUrl;
    }

    if (isEphemeralAiImageUrl(row.og_image)) {
      const asset = await registerField(
        planState,
        'og_image',
        row.og_image,
        'articles',
        `${row.slug}-og`
      );
      originalValues.og_image = row.og_image;
      destinationPaths.og_image = asset.fullStoragePath;
      plannedValues.og_image = asset.plannedPublicUrl;
    }

    if (Array.isArray(row.gallery_images)) {
      let galleryChanged = false;
      const destGallery = [];
      const nextGallery = [];

      for (let i = 0; i < row.gallery_images.length; i += 1) {
        const entry = row.gallery_images[i];
        if (typeof entry === 'string' && isEphemeralAiImageUrl(entry)) {
          galleryChanged = true;
          const asset = await registerField(
            planState,
            'gallery_images',
            entry,
            'articles',
            `${row.slug}-gallery-${i + 1}`,
            i
          );
          destGallery.push(asset.fullStoragePath);
          nextGallery.push(asset.plannedPublicUrl);
        } else if (entry && typeof entry === 'object' && isEphemeralAiImageUrl(entry.url)) {
          galleryChanged = true;
          const asset = await registerField(
            planState,
            'gallery_images',
            entry.url,
            'articles',
            `${row.slug}-gallery-${i + 1}`,
            i
          );
          destGallery.push(asset.fullStoragePath);
          nextGallery.push({ ...entry, url: asset.plannedPublicUrl });
        } else {
          destGallery.push(null);
          nextGallery.push(entry);
        }
      }

      if (galleryChanged) {
        originalValues.gallery_images = row.gallery_images;
        destinationPaths.gallery_images = destGallery;
        plannedValues.gallery_images = nextGallery;
      }
    }

    if (typeof row.content === 'string') {
      const matches = Array.from(new Set(row.content.match(EPHEMERAL_IMAGE_URL_REGEX) || [])).filter(
        isEphemeralAiImageUrl
      );
      if (matches.length > 0) {
        let nextContent = row.content;
        const contentDestMap = {};
        for (let i = 0; i < matches.length; i += 1) {
          const oldUrl = matches[i];
          const asset = await registerField(
            planState,
            'content',
            oldUrl,
            'articles-inline',
            `${row.slug}-inline-${i + 1}`,
            i
          );
          contentDestMap[oldUrl] = asset.fullStoragePath;
          nextContent = nextContent.split(oldUrl).join(asset.plannedPublicUrl);
        }
        originalValues.content = row.content;
        originalValues.content_urls = matches;
        destinationPaths.content_urls = contentDestMap;
        plannedValues.content = nextContent;
      }
    }

    if (planState.fieldMappings.length > 0) {
      records.push({
        table: 'articles',
        id: row.id,
        recordKey: row.slug,
        hasUpdatedAt: true,
        fieldMappings: planState.fieldMappings,
        originalValues,
        destinationPaths,
        plannedValues,
        executionStatus: 'planned',
        verifiedColumns: [],
        dbUpdatedAt: null,
        error: null,
      });
    }
  }

  // 2. public.global_markets (cover_image, social_image)
  const { data: markets, error: marketsErr } = await supabase
    .from('global_markets')
    .select('id, slug, cover_image, social_image');
  if (marketsErr) throw marketsErr;

  for (const row of markets || []) {
    const planState = { fieldMappings: [] };
    const originalValues = {};
    const destinationPaths = {};
    const plannedValues = {};

    if (isEphemeralAiImageUrl(row.cover_image)) {
      const asset = await registerField(
        planState,
        'cover_image',
        row.cover_image,
        'global-markets',
        `${row.slug}-cover`
      );
      originalValues.cover_image = row.cover_image;
      destinationPaths.cover_image = asset.fullStoragePath;
      plannedValues.cover_image = asset.plannedPublicUrl;
    }

    if (isEphemeralAiImageUrl(row.social_image)) {
      const asset = await registerField(
        planState,
        'social_image',
        row.social_image,
        'global-markets',
        `${row.slug}-social`
      );
      originalValues.social_image = row.social_image;
      destinationPaths.social_image = asset.fullStoragePath;
      plannedValues.social_image = asset.plannedPublicUrl;
    }

    if (planState.fieldMappings.length > 0) {
      records.push({
        table: 'global_markets',
        id: row.id,
        recordKey: row.slug,
        hasUpdatedAt: true,
        fieldMappings: planState.fieldMappings,
        originalValues,
        destinationPaths,
        plannedValues,
        executionStatus: 'planned',
        verifiedColumns: [],
        dbUpdatedAt: null,
        error: null,
      });
    }
  }

  // 3. public.global_market_comparisons (social_image)
  const { data: comparisons, error: compErr } = await supabase
    .from('global_market_comparisons')
    .select('id, slug, social_image');
  if (compErr) throw compErr;

  for (const row of comparisons || []) {
    if (isEphemeralAiImageUrl(row.social_image)) {
      const planState = { fieldMappings: [] };
      const asset = await registerField(
        planState,
        'social_image',
        row.social_image,
        'comparisons',
        `${row.slug}-social`
      );
      records.push({
        table: 'global_market_comparisons',
        id: row.id,
        recordKey: row.slug,
        hasUpdatedAt: true,
        fieldMappings: planState.fieldMappings,
        originalValues: { social_image: row.social_image },
        destinationPaths: { social_image: asset.fullStoragePath },
        plannedValues: { social_image: asset.plannedPublicUrl },
        executionStatus: 'planned',
        verifiedColumns: [],
        dbUpdatedAt: null,
        error: null,
      });
    }
  }

  // 4. public.global_market_comparison_cities (image_url)
  const { data: compCities, error: compCitiesErr } = await supabase
    .from('global_market_comparison_cities')
    .select('id, comparison_id, city_slot, city_name, image_url');
  if (compCitiesErr) throw compCitiesErr;

  for (const row of compCities || []) {
    if (isEphemeralAiImageUrl(row.image_url)) {
      const planState = { fieldMappings: [] };
      const asset = await registerField(
        planState,
        'image_url',
        row.image_url,
        'comparison-cities',
        `${row.city_name}-${row.city_slot}`
      );
      records.push({
        table: 'global_market_comparison_cities',
        id: row.id,
        recordKey: `${row.city_name} (slot ${row.city_slot})`,
        hasUpdatedAt: true,
        fieldMappings: planState.fieldMappings,
        originalValues: { image_url: row.image_url },
        destinationPaths: { image_url: asset.fullStoragePath },
        plannedValues: { image_url: asset.plannedPublicUrl },
        executionStatus: 'planned',
        verifiedColumns: [],
        dbUpdatedAt: null,
        error: null,
      });
    }
  }

  // 5. public.categories (image_url)
  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('id, slug, image_url');
  if (catErr) throw catErr;

  for (const row of categories || []) {
    if (isEphemeralAiImageUrl(row.image_url)) {
      const planState = { fieldMappings: [] };
      const asset = await registerField(
        planState,
        'image_url',
        row.image_url,
        'categories',
        row.slug
      );
      records.push({
        table: 'categories',
        id: row.id,
        recordKey: row.slug,
        hasUpdatedAt: true,
        fieldMappings: planState.fieldMappings,
        originalValues: { image_url: row.image_url },
        destinationPaths: { image_url: asset.fullStoragePath },
        plannedValues: { image_url: asset.plannedPublicUrl },
        executionStatus: 'planned',
        verifiedColumns: [],
        dbUpdatedAt: null,
        error: null,
      });
    }
  }

  // 6. public.authors (avatar_url)
  const { data: authors, error: authorsErr } = await supabase
    .from('authors')
    .select('id, slug, avatar_url');
  if (authorsErr) throw authorsErr;

  for (const row of authors || []) {
    if (isEphemeralAiImageUrl(row.avatar_url)) {
      const planState = { fieldMappings: [] };
      const asset = await registerField(
        planState,
        'avatar_url',
        row.avatar_url,
        'authors',
        row.slug
      );
      records.push({
        table: 'authors',
        id: row.id,
        recordKey: row.slug,
        hasUpdatedAt: true,
        fieldMappings: planState.fieldMappings,
        originalValues: { avatar_url: row.avatar_url },
        destinationPaths: { avatar_url: asset.fullStoragePath },
        plannedValues: { avatar_url: asset.plannedPublicUrl },
        executionStatus: 'planned',
        verifiedColumns: [],
        dbUpdatedAt: null,
        error: null,
      });
    }
  }

  // 7. public.site_settings (default_og_image)
  const { data: settings, error: settingsErr } = await supabase
    .from('site_settings')
    .select('id, site_name, default_og_image');
  if (settingsErr) throw settingsErr;

  for (const row of settings || []) {
    if (isEphemeralAiImageUrl(row.default_og_image)) {
      const planState = { fieldMappings: [] };
      const asset = await registerField(
        planState,
        'default_og_image',
        row.default_og_image,
        'site-settings',
        `site-settings-${row.id}`
      );
      records.push({
        table: 'site_settings',
        id: row.id,
        recordKey: row.site_name || `site_settings:${row.id}`,
        hasUpdatedAt: true,
        fieldMappings: planState.fieldMappings,
        originalValues: { default_og_image: row.default_og_image },
        destinationPaths: { default_og_image: asset.fullStoragePath },
        plannedValues: { default_og_image: asset.plannedPublicUrl },
        executionStatus: 'planned',
        verifiedColumns: [],
        dbUpdatedAt: null,
        error: null,
      });
    }
  }

  // 8. public.property_images (image_url; note table has no updated_at column)
  const { data: propImages, error: propImagesErr } = await supabase
    .from('property_images')
    .select('id, property_id, image_url');
  if (propImagesErr) throw propImagesErr;

  for (const row of propImages || []) {
    if (isEphemeralAiImageUrl(row.image_url)) {
      const planState = { fieldMappings: [] };
      const asset = await registerField(
        planState,
        'image_url',
        row.image_url,
        'property-images',
        `property-${row.property_id}-${row.id}`
      );
      records.push({
        table: 'property_images',
        id: row.id,
        recordKey: `property:${row.property_id}/image:${row.id}`,
        hasUpdatedAt: false,
        fieldMappings: planState.fieldMappings,
        originalValues: { image_url: row.image_url },
        destinationPaths: { image_url: asset.fullStoragePath },
        plannedValues: { image_url: asset.plannedPublicUrl },
        executionStatus: 'planned',
        verifiedColumns: [],
        dbUpdatedAt: null,
        error: null,
      });
    }
  }

  // 9. public.media (public_url; note table has no updated_at column)
  const { data: mediaRows, error: mediaErr } = await supabase
    .from('media')
    .select('id, file_name, storage_path, public_url');
  if (mediaErr) throw mediaErr;

  for (const row of mediaRows || []) {
    if (isEphemeralAiImageUrl(row.public_url)) {
      const planState = { fieldMappings: [] };
      const asset = await registerField(
        planState,
        'public_url',
        row.public_url,
        'media-library',
        row.file_name || String(row.id)
      );
      records.push({
        table: 'media',
        id: row.id,
        recordKey: row.file_name || String(row.id),
        hasUpdatedAt: false,
        fieldMappings: planState.fieldMappings,
        originalValues: {
          public_url: row.public_url,
          storage_path: row.storage_path,
        },
        destinationPaths: {
          public_url: asset.fullStoragePath,
          storage_path: asset.destinationPath,
        },
        plannedValues: {
          public_url: asset.plannedPublicUrl,
          storage_path: asset.destinationPath,
        },
        executionStatus: 'planned',
        verifiedColumns: [],
        dbUpdatedAt: null,
        error: null,
      });
    }
  }

  // 10. public.profiles (avatar_url; RLS blocks anon reads, readable with service role during --apply)
  const { data: profiles, error: profilesErr } = await supabase
    .from('profiles')
    .select('id, avatar_url');
  if (profilesErr) {
    if (APPLY_CHANGES) throw profilesErr;
    skippedTables.push({
      table: 'profiles',
      reason: 'RLS-protected from anon key in dry-run (scanned automatically under service role during --apply).',
    });
  } else {
    for (const row of profiles || []) {
      if (isEphemeralAiImageUrl(row.avatar_url)) {
        const planState = { fieldMappings: [] };
        const asset = await registerField(
          planState,
          'avatar_url',
          row.avatar_url,
          'profiles',
          `profile-${row.id}`
        );
        records.push({
          table: 'profiles',
          id: row.id,
          recordKey: `profile:${row.id}`,
          hasUpdatedAt: true,
          fieldMappings: planState.fieldMappings,
          originalValues: { avatar_url: row.avatar_url },
          destinationPaths: { avatar_url: asset.fullStoragePath },
          plannedValues: { avatar_url: asset.plannedPublicUrl },
          executionStatus: 'planned',
          verifiedColumns: [],
          dbUpdatedAt: null,
          error: null,
        });
      }
    }
  }

  const assets = Array.from(assetRegistry.values());
  return { assets, records, bufferCache, skippedTables };
}

async function uploadAndVerifyAsset(supabase, asset, bufferCache) {
  // Resume check: inspect remote object first to avoid duplicate uploads on resume.
  const existingCheck = await verifyPublicAssetUrl(
    asset.plannedPublicUrl,
    asset.mimeType,
    asset.byteLength
  );
  if (existingCheck.ok) {
    asset.uploadStatus = 'already_exists_verified';
    asset.verifiedAt = new Date().toISOString();
    asset.error = null;
    return;
  }

  let buffer = bufferCache.get(asset.sourceUrl);
  if (!buffer) {
    const downloaded = await downloadAndValidateImage(asset.sourceUrl);
    if (downloaded.mimeType !== asset.mimeType) {
      throw new Error(
        `MIME type changed since planning for ${asset.sourceUrl}: ${asset.mimeType} -> ${downloaded.mimeType}`
      );
    }
    buffer = downloaded.buffer;
    asset.byteLength = buffer.byteLength;
    bufferCache.set(asset.sourceUrl, buffer);
  }

  const { error: uploadError } = await supabase.storage
    .from(asset.bucket)
    .upload(asset.destinationPath, buffer, {
      contentType: asset.mimeType,
      upsert: true,
      cacheControl: '31536000',
    });

  if (uploadError) {
    throw new Error(`Upload failed for ${asset.fullStoragePath}: ${uploadError.message}`);
  }

  const verifyResult = await verifyPublicAssetUrl(
    asset.plannedPublicUrl,
    asset.mimeType,
    asset.byteLength
  );
  if (!verifyResult.ok) {
    throw new Error(
      `Public URL verification failed (${verifyResult.reason}) for ${asset.plannedPublicUrl}`
    );
  }

  asset.uploadStatus = 'uploaded_verified';
  asset.verifiedAt = new Date().toISOString();
  asset.error = null;
}

function buildVerifiedUpdatePayload(record, assetBySourceUrl, liveRow) {
  const verifiedColumns = [];
  for (const mapping of record.fieldMappings) {
    const asset = assetBySourceUrl.get(mapping.sourceUrl);
    const isVerified =
      asset &&
      (asset.uploadStatus === 'uploaded_verified' ||
        asset.uploadStatus === 'already_exists_verified') &&
      Boolean(asset.verifiedAt);
    if (!isVerified) {
      throw new Error(
        `Refusing DB update for ${record.table}:${record.recordKey} — unverified asset ${mapping.fullStoragePath}`
      );
    }
    if (!verifiedColumns.includes(mapping.column)) {
      verifiedColumns.push(mapping.column);
    }
  }

  const payload = {};
  for (const [col, plannedVal] of Object.entries(record.plannedValues)) {
    const liveVal = liveRow?.[col];

    // If the live column already equals the target replacement, skip re-writing it.
    if (JSON.stringify(liveVal) === JSON.stringify(plannedVal)) {
      continue;
    }

    // Preserve newer prose edits in articles.content by replacing only exact planned source URLs.
    if (col === 'content' && typeof liveVal === 'string') {
      let nextLiveContent = liveVal;
      let changed = false;
      for (const mapping of record.fieldMappings) {
        if (mapping.column === 'content' && nextLiveContent.includes(mapping.sourceUrl)) {
          nextLiveContent = nextLiveContent
            .split(mapping.sourceUrl)
            .join(mapping.plannedPublicUrl);
          changed = true;
        }
      }
      if (changed) {
        payload.content = nextLiveContent;
      }
      continue;
    }

    // For array columns (gallery_images), only update if at least one ephemeral URL remains.
    if (col === 'gallery_images' && Array.isArray(liveVal)) {
      let changed = false;
      const nextGallery = liveVal.map((entry) => {
        if (typeof entry === 'string') {
          const match = record.fieldMappings.find(
            (m) => m.column === 'gallery_images' && m.sourceUrl === entry
          );
          if (match) {
            changed = true;
            return match.plannedPublicUrl;
          }
          return entry;
        }
        if (entry && typeof entry === 'object' && typeof entry.url === 'string') {
          const match = record.fieldMappings.find(
            (m) => m.column === 'gallery_images' && m.sourceUrl === entry.url
          );
          if (match) {
            changed = true;
            return { ...entry, url: match.plannedPublicUrl };
          }
          return entry;
        }
        return entry;
      });
      if (changed) {
        payload.gallery_images = nextGallery;
      }
      continue;
    }

    // For scalar image columns, only overwrite if live still holds the ephemeral URL (or matches originalValues).
    if (col === 'storage_path' && record.table === 'media') {
      if (isEphemeralAiImageUrl(liveRow?.public_url)) {
        payload.storage_path = plannedVal;
      }
      continue;
    }

    if (
      typeof liveVal === 'string' &&
      !isEphemeralAiImageUrl(liveVal) &&
      liveVal !== record.originalValues[col]
    ) {
      // Live value was already replaced manually with a non-ephemeral URL; do not overwrite it.
      continue;
    }

    payload[col] = plannedVal;
  }

  if (Object.keys(payload).length > 0 && record.hasUpdatedAt) {
    payload.updated_at = new Date().toISOString();
  }
  return { payload, verifiedColumns };
}

function isRecordAlreadyApplied(liveRow, record) {
  if (!liveRow) return false;
  for (const [col, plannedVal] of Object.entries(record.plannedValues)) {
    if (JSON.stringify(liveRow[col]) !== JSON.stringify(plannedVal)) {
      return false;
    }
  }
  return true;
}

function summarizeManifest(manifest, manifestPath) {
  const assetCounts = manifest.assets.reduce((acc, a) => {
    acc[a.uploadStatus] = (acc[a.uploadStatus] || 0) + 1;
    return acc;
  }, {});
  const recordCounts = manifest.records.reduce((acc, r) => {
    acc[r.executionStatus] = (acc[r.executionStatus] || 0) + 1;
    return acc;
  }, {});

  const uploadedOrExisting = manifest.assets.filter(
    (a) => a.uploadStatus === 'uploaded_verified' || a.uploadStatus === 'already_exists_verified'
  );
  const dbUpdated = manifest.records.filter((r) => r.executionStatus === 'db_updated');
  const failedRecords = manifest.records.filter((r) => r.executionStatus === 'failed');

  console.log('\n=== AMAAN ESTATE Media Migration Summary ===');
  console.log(`Mode: ${manifest.mode.toUpperCase()}`);
  console.log(`Manifest file: ${manifestPath}`);
  console.log(`Unique ephemeral assets: ${manifest.assets.length} (${JSON.stringify(assetCounts)})`);
  console.log(`Target DB rows: ${manifest.records.length} (${JSON.stringify(recordCounts)})`);
  console.log(`Verified uploads completed: ${uploadedOrExisting.length}/${manifest.assets.length}`);
  console.log(`Database rows updated: ${dbUpdated.length}/${manifest.records.length}`);

  if (manifest.skippedTables?.length > 0) {
    console.log('Notes on read-only scan scope:');
    for (const note of manifest.skippedTables) {
      console.log(`  - ${note.table}: ${note.reason}`);
    }
  }

  if (failedRecords.length > 0) {
    console.log('Failed DB rows:');
    for (const r of failedRecords) {
      console.log(`  - ${r.table}:${r.recordKey} -> ${r.error}`);
    }
  }
}

async function main() {
  const { supabaseUrl, apiKey } = getEnvOrExit();
  const supabase = createClient(supabaseUrl, apiKey, {
    auth: { persistSession: false },
  });

  const requestedManifestPath = parseManifestArg();
  let manifestPath = requestedManifestPath;
  let manifest;
  let bufferCache = new Map();

  console.log(`Mode: ${APPLY_CHANGES ? 'APPLY (WRITING TO STORAGE & DB)' : 'DRY RUN (READ-ONLY)'}`);

  if (requestedManifestPath) {
    const raw = await fs.readFile(requestedManifestPath, 'utf8');
    manifest = JSON.parse(raw);
    if (!manifest || !Array.isArray(manifest.assets) || !Array.isArray(manifest.records)) {
      throw new Error(
        `Manifest at ${requestedManifestPath} is missing top-level "assets" and "records" arrays.`
      );
    }
    console.log(
      `Loaded existing manifest (${manifest.records.length} rows, ${manifest.assets.length} unique assets).`
    );
  } else {
    // PHASE 1: Read-only discovery, asset validation, and pre-mutation manifest persistence.
    const plan = await buildExecutionPlan(supabase);
    bufferCache = plan.bufferCache;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    manifestPath = path.resolve(
      process.cwd(),
      'supabase',
      'manual_patches',
      `media-migration-manifest-${timestamp}.json`
    );

    manifest = {
      schemaVersion: 2,
      mode: APPLY_CHANGES ? 'apply' : 'dry-run',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bucket: BUCKET_NAME,
      summary: {
        totalRecords: plan.records.length,
        totalUniqueAssets: plan.assets.length,
        totalFieldReferences: plan.records.reduce((n, r) => n + r.fieldMappings.length, 0),
      },
      skippedTables: plan.skippedTables,
      assets: plan.assets,
      records: plan.records,
    };

    await writeManifestAtomic(manifestPath, manifest);
    console.log(`Pre-execution rollback manifest written to ${manifestPath}`);
  }

  if (!APPLY_CHANGES) {
    summarizeManifest(manifest, manifestPath);
    console.log('Dry-run complete. No files were uploaded and no database records were modified.');
    return;
  }

  const assetBySourceUrl = new Map(manifest.assets.map((a) => [a.sourceUrl, a]));
  manifest.mode = 'apply';

  try {
    // PHASE 2: Upload & verify each unique asset before any DB row is updated.
    for (const asset of manifest.assets) {
      if (asset.uploadStatus === 'uploaded_verified' || asset.uploadStatus === 'already_exists_verified') {
        const recheck = await verifyPublicAssetUrl(
          asset.plannedPublicUrl,
          asset.mimeType,
          asset.byteLength
        );
        if (recheck.ok) {
          continue;
        }
      }

      try {
        await uploadAndVerifyAsset(supabase, asset, bufferCache);
        await writeManifestAtomic(manifestPath, manifest);
      } catch (err) {
        asset.uploadStatus = 'failed';
        asset.error = redactErrorMessage(err);
        await writeManifestAtomic(manifestPath, manifest);
        throw err;
      }
    }

    // PHASE 3: Update each DB row ONLY after 100% of its assets are verified.
    for (const record of manifest.records) {
      if (record.executionStatus === 'db_updated') {
        continue;
      }

      try {
        const selectCols = Object.keys(record.plannedValues).join(', ');
        const { data: liveRow, error: liveErr } = await supabase
          .from(record.table)
          .select(selectCols)
          .eq('id', record.id)
          .maybeSingle();
        if (liveErr) throw liveErr;

        if (!liveRow) {
          throw new Error(`Target row not found: ${record.table}:${record.id}`);
        }

        if (isRecordAlreadyApplied(liveRow, record)) {
          record.executionStatus = 'db_updated';
          record.dbUpdatedAt = record.dbUpdatedAt || new Date().toISOString();
          record.error = null;
          await writeManifestAtomic(manifestPath, manifest);
          continue;
        }

        const { payload, verifiedColumns } = buildVerifiedUpdatePayload(
          record,
          assetBySourceUrl,
          liveRow
        );
        record.verifiedColumns = verifiedColumns;

        if (Object.keys(payload).length === 0) {
          record.executionStatus = 'skipped_already_changed';
          record.error = null;
          await writeManifestAtomic(manifestPath, manifest);
          continue;
        }

        record.executionStatus = 'ready_for_db';

        const { error: updErr } = await supabase
          .from(record.table)
          .update(payload)
          .eq('id', record.id);
        if (updErr) throw updErr;

        record.executionStatus = 'db_updated';
        record.dbUpdatedAt = new Date().toISOString();
        record.error = null;
        await writeManifestAtomic(manifestPath, manifest);
      } catch (err) {
        record.executionStatus = 'failed';
        record.error = redactErrorMessage(err);
        await writeManifestAtomic(manifestPath, manifest);
        throw err;
      }
    }

    summarizeManifest(manifest, manifestPath);
  } catch (err) {
    console.error('\nMigration halted with error:', redactErrorMessage(err));
    summarizeManifest(manifest, manifestPath);
    console.error(
      `\nManifest preserved at: ${manifestPath}\nTo resume safely without duplicate uploads, run:\n  node supabase/manual_patches/migrate_openai_images_to_supabase.mjs --apply --manifest "${manifestPath}"`
    );
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Migration failed:', redactErrorMessage(err));
  process.exit(1);
});
