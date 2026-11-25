import { MarketDataPeriodType, MarketDataSourceType } from '../types';

export interface AuthorizedPublicDataSource {
  id: Exclude<MarketDataSourceType, 'manual' | 'other_authorized'>;
  name: string;
  shortName: string;
  coverage: string;
  licenseAndAttribution: string;
  officialPortalUrl: string;
  apiEndpointPattern: string | null;
  supportsLiveDraftFetch: boolean;
  defaultPeriodType: MarketDataPeriodType;
  requiresEditorialReview: true;
  commercialFeeRequired: false;
  notes: string;
}

/**
 * Registry of strictly free, authorized public statistical & central bank sources
 * suitable for future market intelligence draft imports.
 *
 * Policy:
 * - No paid APIs, no scraping, no unauthorized commercial feeds.
 * - Imported records ALWAYS enter the CMS as `status: 'draft'` for editorial review.
 * - Never invent or extrapolate missing values.
 */
export const AUTHORIZED_PUBLIC_DATA_SOURCES: AuthorizedPublicDataSource[] = [
  {
    id: 'bis',
    name: 'Bank for International Settlements (BIS) — Residential Property Price Statistics',
    shortName: 'BIS Property Prices',
    coverage: '60+ economies globally (quarterly nominal & real residential price indices)',
    licenseAndAttribution:
      'Free public statistical release; cite "Bank for International Settlements (BIS)" with series URL.',
    officialPortalUrl: 'https://data.bis.org/topics/RPP',
    apiEndpointPattern: 'https://stats.bis.org/api/v1/data/WS_SPP/Q.{ISO2}.N.628?lastNObservations=5',
    supportsLiveDraftFetch: true,
    defaultPeriodType: 'quarter',
    requiresEditorialReview: true,
    commercialFeeRequired: false,
    notes:
      'Provides standardized quarterly Residential Property Price Index (RPPI) YoY growth rates across major developed and emerging markets via open SDMX REST API.',
  },
  {
    id: 'oecd',
    name: 'OECD Data Explorer — Analytical House Prices & Rent Indicators',
    shortName: 'OECD Housing Data',
    coverage: 'OECD member & partner countries (house price-to-income, rent price index, real house prices)',
    licenseAndAttribution:
      'Open OECD data terms; cite "OECD Analytical House Prices Indicators" and link to dataset.',
    officialPortalUrl: 'https://data-explorer.oecd.org/',
    apiEndpointPattern: 'https://sdmx.oecd.org/public/rest/data/OECD.ECO.MPD,DSD_AN_HOUSE_PRICES@DF_HOUSE_PRICES/',
    supportsLiveDraftFetch: true,
    defaultPeriodType: 'quarter',
    requiresEditorialReview: true,
    commercialFeeRequired: false,
    notes:
      'Free SDMX REST access for quarterly nominal/real house price indices and rental index series across OECD economies.',
  },
  {
    id: 'national_stats',
    name: 'National Statistical Agencies (ONS, Eurostat, KNBS, ESS, Statistics Canada)',
    shortName: 'National Statistics',
    coverage: 'Country- and city-specific official housing price, construction & rent CPI releases',
    licenseAndAttribution:
      'Open government / statistical open license (e.g. UK OGL v3.0, Eurostat Copyright Notice). Attribution required.',
    officialPortalUrl: 'https://ec.europa.eu/eurostat/web/housing-price-statistics',
    apiEndpointPattern: null,
    supportsLiveDraftFetch: false,
    defaultPeriodType: 'quarter',
    requiresEditorialReview: true,
    commercialFeeRequired: false,
    notes:
      'Use official national housing price releases (e.g. UK HM Land Registry/ONS, Eurostat HPI, Kenya KNBS, Ethiopian Statistical Service) and link directly to the primary publication.',
  },
  {
    id: 'central_bank',
    name: 'National Central Banks & Sovereign Housing Observatories',
    shortName: 'Central Banks',
    coverage: 'Monetary policy, mortgage rates, and official residential valuation indices',
    licenseAndAttribution:
      'Public central bank statistical bulletin attribution with exact publication date and URL.',
    officialPortalUrl: 'https://www.centralbank.ae/',
    apiEndpointPattern: null,
    supportsLiveDraftFetch: false,
    defaultPeriodType: 'quarter',
    requiresEditorialReview: true,
    commercialFeeRequired: false,
    notes:
      'Authoritative quarterly real estate market reviews published by central banks (e.g., Central Bank of UAE, Bank of England, Federal Reserve, Central Bank of Kenya).',
  },
];

export function getAuthorizedDataSourceById(
  id: MarketDataSourceType
): AuthorizedPublicDataSource | undefined {
  return AUTHORIZED_PUBLIC_DATA_SOURCES.find((src) => src.id === id);
}
