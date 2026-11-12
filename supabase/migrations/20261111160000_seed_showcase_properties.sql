-- ============================================================================
-- AMAAN ESTATE (https://www.amaanestate.com)
-- Migration: Seed 4 International Showcase Sample Properties
--
-- Inserts 4 illustrative international property records representing Dubai,
-- London, Toronto, and Bali into the property marketplace tables.
--
-- Delineation & Compliance:
-- 1. Classified under source_name = 'showcase_sample'.
-- 2. Tagged with raw_payload->>'is_sample' = 'true'.
-- 3. Disclosed as illustrative design demonstrations.
-- 4. Excluded from live active commercial inventory counts and sitemaps.
-- 5. Safe and idempotent (ON CONFLICT DO UPDATE).
-- ============================================================================

-- 1. Ensure the 'showcase_sample' listing source exists
insert into public.listing_sources (
  id,
  source_name,
  source_type,
  feed_url,
  is_active,
  sync_frequency,
  created_at,
  updated_at
)
values (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'showcase_sample',
  'manual',
  null,
  true,
  'manual',
  '2026-03-01T08:00:00Z',
  now()
)
on conflict (source_name) do update
set is_active = true,
    updated_at = now();

-- 2. Upsert the 4 International Showcase Properties
insert into public.properties (
  id,
  title,
  slug,
  transaction_type,
  property_type,
  listing_status,
  publication_status,
  price,
  currency,
  rental_period,
  available_from,
  bedrooms,
  bathrooms,
  area_value,
  area_unit,
  address_line,
  city,
  state_region,
  country,
  postal_code,
  latitude,
  longitude,
  description,
  features,
  is_featured,
  agent_name,
  agent_email,
  agent_phone,
  brokerage_name,
  source_id,
  source_name,
  source_listing_id,
  source_url,
  raw_payload,
  published_at,
  created_at,
  updated_at
)
values
  -- 1. Dubai: The Sky Glass Penthouse at Dubai Marina
  (
    'a0000001-0000-0000-0000-000000000001'::uuid,
    'The Sky Glass Penthouse at Dubai Marina',
    'the-sky-glass-penthouse-dubai-marina',
    'sale',
    'apartment',
    'available',
    'published',
    4850000.00,
    'USD',
    null,
    null,
    4,
    5.0,
    5800.00,
    'sqft',
    'Al Marsa Street, Dubai Marina',
    'Dubai',
    'Dubai',
    'United Arab Emirates',
    '00000',
    25.077200,
    55.138400,
    'A masterclass in modern skyward living, this contemporary duplex penthouse showcases sweeping panoramic vistas of the Arabian Gulf and the illuminated Dubai Marina skyline.

Designed with double-height volume, seamless slabs of honed travertine, and acoustic floor-to-ceiling glass envelopes, the residence bridges dramatic scale with intimate residential craftsmanship. Features include an Italian marble show kitchen, bespoke recessed circadian lighting, private lift access, and an expansive cantilevered sunset loggia ideal for year-round entertaining.

Note: This presentation is an illustrative architectural sample for platform demonstration purposes and is not an active real estate listing.',
    '[
      "Double-height ceiling gallery",
      "Panoramic water and skyline terrace",
      "Honed travertine limestone interior",
      "Private high-speed keycard elevator access",
      "Chef show kitchen with Gaggenau appliances",
      "Acoustic double-glazed curtain walls",
      "24-hour concierge and valet services"
    ]'::jsonb,
    true,
    null,
    null,
    null,
    null,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'showcase_sample',
    'SHOWCASE-DXB-01',
    null,
    '{"is_sample": true, "showcase": true, "disclaimer": "Illustrative sample presentation for demonstration purposes"}'::jsonb,
    '2026-03-01T08:00:00Z',
    '2026-03-01T08:00:00Z',
    now()
  ),

  -- 2. London: The Kensington Modern Townhouse
  (
    'a0000002-0000-0000-0000-000000000002'::uuid,
    'The Kensington Modern Townhouse',
    'the-kensington-modern-townhouse-london',
    'sale',
    'townhouse',
    'available',
    'published',
    6400000.00,
    'GBP',
    null,
    null,
    5,
    4.5,
    4400.00,
    'sqft',
    'Kensington Church Street Corridor',
    'London',
    'Greater London',
    'United Kingdom',
    'W8',
    51.502500,
    -0.191700,
    'Set along a tranquil residential terrace in Kensington, this newly re-engineered Georgian-proportioned townhouse celebrates classic British brick masonry paired with refined contemporary bronze detailing and internal spatial clarity.

Arranged over five refined levels, the residence integrates a sunlit lower garden floor with polished concrete and Crittall-style glazing opening directly to a private walled garden. The upper floors accommodate four ensuite guest suites and an expansive full-floor primary retreat complete with bespoke dressing millwork and freestanding sculptural stone bath.

Note: This presentation is an illustrative architectural sample for platform demonstration purposes and is not an active real estate listing.',
    '[
      "Restored bespoke brick & Portland stone facade",
      "Private landscaped English walled garden",
      "Full-floor primary suite with custom joinery",
      "Integrated passive climate ventilation and heat pump",
      "Bespoke bronze metalwork and balustrades",
      "Wine cellar and dedicated garden office"
    ]'::jsonb,
    true,
    null,
    null,
    null,
    null,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'showcase_sample',
    'SHOWCASE-LDN-02',
    null,
    '{"is_sample": true, "showcase": true, "disclaimer": "Illustrative sample presentation for demonstration purposes"}'::jsonb,
    '2026-03-02T08:00:00Z',
    '2026-03-02T08:00:00Z',
    now()
  ),

  -- 3. Toronto: The Ravine Cedar Residence in Forest Hill
  (
    'a0000003-0000-0000-0000-000000000003'::uuid,
    'The Ravine Cedar Residence in Forest Hill',
    'the-ravine-cedar-residence-toronto',
    'sale',
    'house',
    'available',
    'published',
    4950000.00,
    'CAD',
    null,
    null,
    5,
    6.0,
    6200.00,
    'sqft',
    'Forest Hill North Ravine Path',
    'Toronto',
    'Ontario',
    'Canada',
    'M5P',
    43.701100,
    -79.416300,
    'A benchmark for biophilic family living in Toronto, this contemporary detached home sits thoughtfully against a protected mature tree canopy. The exterior is composed of horizontal Western red cedar slats, smooth Indiana limestone blocks, and oversized triple-glazed floor-to-ceiling curtain glass.

Inside, light flows across wide-plank white oak flooring and raw architectural concrete focal walls. Designed for modern multi-generational comfort, the floorplan features radiant in-floor heating throughout, a custom Scandinavian sauna, gym, and an open-concept living pavilion opening to a stone terrace and landscaped autumn garden.

Note: This presentation is an illustrative architectural sample for platform demonstration purposes and is not an active real estate listing.',
    '[
      "Western red cedar and smooth limestone exterior",
      "Mature ravine backdrop and private stone patio",
      "Triple-pane high-efficiency architectural glass",
      "Hydronic radiant in-floor heating system",
      "Custom Finnish cedar sauna and wellness suite",
      "Double car garage with EV charging infrastructure"
    ]'::jsonb,
    true,
    null,
    null,
    null,
    null,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'showcase_sample',
    'SHOWCASE-TOR-03',
    null,
    '{"is_sample": true, "showcase": true, "disclaimer": "Illustrative sample presentation for demonstration purposes"}'::jsonb,
    '2026-03-03T08:00:00Z',
    '2026-03-03T08:00:00Z',
    now()
  ),

  -- 4. Bali: The Ubud Jungle Reflection Villa
  (
    'a0000004-0000-0000-0000-000000000004'::uuid,
    'The Ubud Jungle Reflection Villa',
    'the-ubud-jungle-reflection-villa-bali',
    'rent',
    'villa',
    'available',
    'published',
    6500.00,
    'USD',
    'month',
    '2026-04-01',
    3,
    3.5,
    4100.00,
    'sqft',
    'Sayan Ridge Valley, Ubud',
    'Bali',
    'Bali',
    'Indonesia',
    '80571',
    -8.506900,
    115.262500,
    'Immersed in the terraced emerald hills above Ubud, this private architectural sanctuary demonstrates contemporary tropical modernism at its most poetic. Hand-hewn volcanic basalt walls, reclaimed ironwood framing, and open-air pavilions celebrate the surrounding jungle microclimate.

The heart of the villa is an elongated black-granite infinity reflection pool that mirrors the canopy and morning mist. Each autonomous pavilion suite offers outdoor open-air garden rain showers, polished terrazzo vanities, and natural ventilation designed to harmonize comfort with the tropical environment.

Note: This presentation is an illustrative architectural sample for platform demonstration purposes and is not an active real estate listing.',
    '[
      "20-meter black granite infinity reflection pool",
      "Open-air living and dining bale with reclaimed teak",
      "Volcanic basalt masonry and polished terrazzo floors",
      "Autonomous guest suites with tropical outdoor showers",
      "High-speed fiber connectivity and dedicated workspace",
      "Full estate housekeeping and grounds maintenance"
    ]'::jsonb,
    true,
    null,
    null,
    null,
    null,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'showcase_sample',
    'SHOWCASE-DPS-04',
    null,
    '{"is_sample": true, "showcase": true, "disclaimer": "Illustrative sample presentation for demonstration purposes"}'::jsonb,
    '2026-03-04T08:00:00Z',
    '2026-03-04T08:00:00Z',
    now()
  )
on conflict (slug) do update
set title = excluded.title,
    transaction_type = excluded.transaction_type,
    property_type = excluded.property_type,
    listing_status = excluded.listing_status,
    publication_status = excluded.publication_status,
    price = excluded.price,
    currency = excluded.currency,
    rental_period = excluded.rental_period,
    available_from = excluded.available_from,
    bedrooms = excluded.bedrooms,
    bathrooms = excluded.bathrooms,
    area_value = excluded.area_value,
    area_unit = excluded.area_unit,
    address_line = excluded.address_line,
    city = excluded.city,
    state_region = excluded.state_region,
    country = excluded.country,
    postal_code = excluded.postal_code,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    description = excluded.description,
    features = excluded.features,
    is_featured = excluded.is_featured,
    source_name = excluded.source_name,
    source_listing_id = excluded.source_listing_id,
    raw_payload = excluded.raw_payload,
    updated_at = now();

-- 3. Upsert Property Images
insert into public.property_images (
  id,
  property_id,
  image_url,
  alt_text,
  display_order,
  is_primary,
  created_at
)
values
  -- Dubai Penthouse
  (
    'b0000001-0000-0000-0000-000000000001'::uuid,
    'a0000001-0000-0000-0000-000000000001'::uuid,
    '/images/properties/dubai-marina-penthouse.jpg',
    'Contemporary luxury high-rise duplex penthouse in Dubai Marina with double-height glass and skyline views',
    0,
    true,
    '2026-03-01T08:00:00Z'
  ),

  -- London Townhouse
  (
    'b0000002-0000-0000-0000-000000000002'::uuid,
    'a0000002-0000-0000-0000-000000000002'::uuid,
    '/images/properties/london-kensington-townhouse.jpg',
    'Elegant modern brick and limestone townhouse in Kensington London with bronze entrance details',
    0,
    true,
    '2026-03-02T08:00:00Z'
  ),

  -- Toronto Residence
  (
    'b0000003-0000-0000-0000-000000000003'::uuid,
    'a0000003-0000-0000-0000-000000000003'::uuid,
    '/images/properties/toronto-forest-hill-residence.jpg',
    'Contemporary detached family residence in Toronto featuring cedar slats, limestone walls, and landscaped garden',
    0,
    true,
    '2026-03-03T08:00:00Z'
  ),

  -- Bali Villa
  (
    'b0000004-0000-0000-0000-000000000004'::uuid,
    'a0000004-0000-0000-0000-000000000004'::uuid,
    '/images/properties/bali-ubud-tropical-villa.jpg',
    'Private tropical modern villa in Ubud Bali with volcanic stone walls and infinity reflection pool overlooking the jungle',
    0,
    true,
    '2026-03-04T08:00:00Z'
  )
on conflict (id) do update
set image_url = excluded.image_url,
    alt_text = excluded.alt_text,
    display_order = excluded.display_order,
    is_primary = excluded.is_primary;
