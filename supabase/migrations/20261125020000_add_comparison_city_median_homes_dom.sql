-- ============================================================================
-- AMAAN ESTATE (https://www.amaanestate.com)
-- Migration: Add Median Property Sale Price, Homes Sold, and Days on Market
--            to Two-City Property Market Comparison Cities
-- Safe, additive migration. Does NOT delete or rename existing columns,
-- does NOT modify Country Market Reports (global_markets), and preserves all
-- existing comparison records and slugs.
-- ============================================================================

alter table public.global_market_comparison_cities
  add column if not exists median_sale_price numeric(14, 2)
    check (median_sale_price is null or median_sale_price >= 0),
  add column if not exists homes_sold integer
    check (homes_sold is null or homes_sold >= 0),
  add column if not exists days_on_market integer
    check (days_on_market is null or days_on_market >= 0);

comment on column public.global_market_comparison_cities.median_sale_price is
  'Optional independent Median Property Sale Price in the city reporting currency (never substituted into avg_sale_price).';

comment on column public.global_market_comparison_cities.homes_sold is
  'Optional independent count of residential homes sold during the city reporting period.';

comment on column public.global_market_comparison_cities.days_on_market is
  'Optional independent median/average days on market (days) during the city reporting period.';
