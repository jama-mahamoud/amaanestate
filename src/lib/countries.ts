export interface NormalizedCountry {
  name: string;
  code: string;
  flag: string;
}

const REGION_DISPLAY_NAMES =
  typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null;

export function countryCodeToFlag(code?: string | null): string {
  const clean = (code || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(clean)) return '🌐';
  return String.fromCodePoint(...clean.split('').map((c) => 127397 + c.charCodeAt(0)));
}

function normalizeLookupKey(raw: string): string {
  return raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[.'’]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Explicit aliases for common abbreviations, historical spellings, and formatting variants
const EXPLICIT_ALIAS_TO_CODE: Record<string, string> = {
  us: 'US',
  usa: 'US',
  'united states': 'US',
  'united states of america': 'US',
  america: 'US',
  uk: 'GB',
  gb: 'GB',
  'united kingdom': 'GB',
  'great britain': 'GB',
  britain: 'GB',
  england: 'GB',
  scotland: 'GB',
  wales: 'GB',
  'northern ireland': 'GB',
  uae: 'AE',
  'united arab emirates': 'AE',
  emirates: 'AE',
  ksa: 'SA',
  'saudi arabia': 'SA',
  'kingdom of saudi arabia': 'SA',
  turkey: 'TR',
  turkiye: 'TR',
  'republic of turkey': 'TR',
  'south korea': 'KR',
  'republic of korea': 'KR',
  korea: 'KR',
  'north korea': 'KP',
  russia: 'RU',
  'russian federation': 'RU',
  vietnam: 'VN',
  'viet nam': 'VN',
  czechia: 'CZ',
  'czech republic': 'CZ',
  netherlands: 'NL',
  'the netherlands': 'NL',
  holland: 'NL',
  'ivory coast': 'CI',
  'cote divoire': 'CI',
  'cote d ivoire': 'CI',
  ethiopia: 'ET',
  'federal democratic republic of ethiopia': 'ET',
  canada: 'CA',
  indonesia: 'ID',
  china: 'CN',
  prc: 'CN',
  'peoples republic of china': 'CN',
  taiwan: 'TW',
  'hong kong': 'HK',
  'hong kong sar': 'HK',
  macau: 'MO',
  macao: 'MO',
  iran: 'IR',
  syria: 'SY',
  laos: 'LA',
  bolivia: 'BO',
  venezuela: 'VE',
  tanzania: 'TZ',
  egypt: 'EG',
  morocco: 'MA',
  nigeria: 'NG',
  kenya: 'KE',
  'south africa': 'ZA',
  india: 'IN',
  australia: 'AU',
  'new zealand': 'NZ',
  switzerland: 'CH',
  drcongo: 'CD',
  'dr congo': 'CD',
  'democratic republic of the congo': 'CD',
  'republic of the congo': 'CG',
  congo: 'CG',
  palestine: 'PS',
  'state of palestine': 'PS',
  myanmar: 'MM',
  burma: 'MM',
  brunei: 'BN',
  eswatini: 'SZ',
  swaziland: 'SZ',
  'cape verde': 'CV',
  'cabo verde': 'CV',
  'east timor': 'TL',
  'timor leste': 'TL',
};

// Preferred canonical display overrides where Intl.DisplayNames differs from standard English marketplace labels
const CANONICAL_NAME_OVERRIDES: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  AE: 'United Arab Emirates',
  TR: 'Turkey',
  CZ: 'Czech Republic',
  CI: "Côte d'Ivoire",
};

const NON_COUNTRY_REGION_CODES = new Set([
  'EU',
  'EZ',
  'UN',
  'UK',
  'XA',
  'XB',
  'QO',
  'ZZ',
  'AN',
  'CS',
  'SU',
  'YU',
  'DD',
  'FX',
  'TP',
  'ZR',
]);

interface CountryRegistry {
  keyToCode: Map<string, string>;
  codeToName: Map<string, string>;
  codeToVariants: Map<string, Set<string>>;
}

let cachedRegistry: CountryRegistry | null = null;

function getCountryRegistry(): CountryRegistry {
  if (cachedRegistry) return cachedRegistry;

  const keyToCode = new Map<string, string>();
  const codeToName = new Map<string, string>();
  const codeToVariants = new Map<string, Set<string>>();

  const addVariant = (code: string, label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    if (!codeToVariants.has(code)) {
      codeToVariants.set(code, new Set());
    }
    codeToVariants.get(code)!.add(trimmed);
    const key = normalizeLookupKey(trimmed);
    if (key && !keyToCode.has(key)) {
      keyToCode.set(key, code);
    }
  };

  if (REGION_DISPLAY_NAMES) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < letters.length; i++) {
      for (let j = 0; j < letters.length; j++) {
        const code = `${letters[i]}${letters[j]}`;
        if (NON_COUNTRY_REGION_CODES.has(code)) continue;
        try {
          const resolved = REGION_DISPLAY_NAMES.of(code);
          if (!resolved || resolved === code || resolved === 'Unknown Region') continue;
          const displayName = CANONICAL_NAME_OVERRIDES[code] || resolved;
          codeToName.set(code, displayName);
          addVariant(code, displayName);
          addVariant(code, resolved);
          addVariant(code, code);
        } catch {
          // Ignore unsupported region code
        }
      }
    }
  }

  for (const [aliasKey, code] of Object.entries(EXPLICIT_ALIAS_TO_CODE)) {
    keyToCode.set(aliasKey, code);
    if (!codeToName.has(code)) {
      const fallback = CANONICAL_NAME_OVERRIDES[code] || aliasKey.replace(/\b\w/g, (c) => c.toUpperCase());
      codeToName.set(code, fallback);
    }
    addVariant(code, codeToName.get(code)!);
  }

  // Register explicit searchable variants for common aliases
  const extraSearchVariants: Record<string, string[]> = {
    US: ['United States', 'USA', 'US', 'U.S.', 'U.S.A.', 'United States of America'],
    GB: ['United Kingdom', 'UK', 'U.K.', 'Great Britain', 'Britain', 'England', 'Scotland', 'Wales'],
    AE: ['United Arab Emirates', 'UAE', 'U.A.E.'],
    SA: ['Saudi Arabia', 'KSA'],
    TR: ['Turkey', 'Türkiye', 'Turkiye'],
    KR: ['South Korea', 'Republic of Korea', 'Korea'],
    CZ: ['Czech Republic', 'Czechia'],
    NL: ['Netherlands', 'The Netherlands', 'Holland'],
    VN: ['Vietnam', 'Viet Nam'],
    RU: ['Russia', 'Russian Federation'],
  };

  for (const [code, variants] of Object.entries(extraSearchVariants)) {
    for (const v of variants) {
      addVariant(code, v);
    }
  }

  cachedRegistry = { keyToCode, codeToName, codeToVariants };
  return cachedRegistry;
}

function toTitleCase(input: string): string {
  const minorWords = new Set(['of', 'and', 'the', 'in', 'on', 'at']);
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx > 0 && minorWords.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

export function normalizeCountryInfo(rawCountry?: string | null): NormalizedCountry | null {
  const cleaned = (rawCountry || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;

  const { keyToCode, codeToName } = getCountryRegistry();
  const lookupKey = normalizeLookupKey(cleaned);

  // Direct ISO alpha-2 match if someone entered e.g. "US" or "CA"
  const upper = cleaned.toUpperCase();
  if (/^[A-Z]{2}$/.test(upper) && codeToName.has(upper)) {
    const name = codeToName.get(upper)!;
    return {
      name,
      code: upper,
      flag: countryCodeToFlag(upper),
    };
  }

  const matchedCode = keyToCode.get(lookupKey);
  if (matchedCode) {
    const name = codeToName.get(matchedCode) || toTitleCase(cleaned);
    return {
      name,
      code: matchedCode,
      flag: countryCodeToFlag(matchedCode),
    };
  }

  return {
    name: toTitleCase(cleaned),
    code: '',
    flag: '🌐',
  };
}

export function getCountryQueryVariants(rawCountry?: string | null): string[] {
  const cleaned = (rawCountry || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  const info = normalizeCountryInfo(cleaned);
  const { codeToVariants } = getCountryRegistry();

  const variants = new Set<string>([cleaned]);
  if (info) {
    variants.add(info.name);
    if (info.code && codeToVariants.has(info.code)) {
      for (const v of codeToVariants.get(info.code)!) {
        variants.add(v);
      }
    }
  }

  return Array.from(variants);
}
