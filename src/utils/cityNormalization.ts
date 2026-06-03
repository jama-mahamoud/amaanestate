import { CITIES_DATA } from '../data/cities';

/**
 * Normalizes any variation of city/region names to the canonical city dbValue.
 * Used for storing and query mapping.
 */
export function normalizeCityName(rawName: string | null | undefined): string {
  if (!rawName) return '';
  const search = rawName.trim().toLowerCase();

  // Explicit mapping rule overrides
  if (['jijiga', 'jigjiga', 'jigjigacapital', 'somali region', 'somali'].includes(search)) {
    return 'Jigjiga';
  }
  if (['banadir', 'banaadir', 'mogadishu', 'mogadisho', 'mogadishucoastal'].includes(search)) {
    return 'Mogadishu';
  }
  if (['hargeisa', 'hargeysa', 'hargeisahub', 'maroodi jeex', 'maroodijeex'].includes(search)) {
    return 'Hargeisa';
  }
  if (['garowe', 'garoowe', 'garoweprovince', 'nugal', 'nugaal'].includes(search)) {
    return 'Garowe';
  }
  if (['bosaso', 'boosaaso', 'bosasoport', 'bari'].includes(search)) {
    return 'Bosaso';
  }
  if (['kismayo', 'kismaayo', 'kismayogateway', 'lower juba', 'lower jubba'].includes(search)) {
    return 'Kismayo';
  }
  if (['baidoa', 'baydhaba', 'baidoaregion', 'bay'].includes(search)) {
    return 'Baidoa';
  }
  if (['burao', 'burco', 'burcodistrict', 'togdheer'].includes(search)) {
    return 'Burao';
  }
  if (['beledweyne', 'beledweynecorridor', 'hiran', 'hiiraan'].includes(search)) {
    return 'Beledweyne';
  }
  if (['galkayo', 'gaalkacyo', 'galkayocentral', 'mudug'].includes(search)) {
    return 'Galkayo';
  }
  if (['berbera', 'berberaport', 'sahil', 'saaxil'].includes(search)) {
    return 'Berbera';
  }
  if (['las anod', 'las-anod', 'laascaanood', 'lasanodregion', 'sool', 'laascaanood'].includes(search)) {
    return 'Las Anod';
  }
  if (['jowhar', 'jowharvalley', 'middle shabelle'].includes(search)) {
    return 'Jowhar';
  }
  if (['afgooye', 'afgooyi', 'afgooyegrowthzone', 'lower shabelle'].includes(search)) {
    return 'Afgooye';
  }
  if (['godey', 'godeyregion', 'shabelle zone'].includes(search)) {
    return 'Godey';
  }
  if (['dire dawa', 'diredawa', 'dire dawaregion'].includes(search)) {
    return 'Dire Dawa';
  }
  if (['addis ababa', 'addisababa', 'addis ababaregion'].includes(search)) {
    return 'Addis Ababa';
  }
  if (['mekelle', 'mekellehighland', 'tigray'].includes(search)) {
    return 'Mekelle';
  }
  if (['hawassa', 'hawassalakeside', 'sidama'].includes(search)) {
    return 'Hawassa';
  }
  if (['adama', 'adamacorridor', 'oromia'].includes(search)) {
    return 'Adama';
  }
  if (['bahir dar', 'bahirdarbasin', 'amhara'].includes(search)) {
    return 'Bahir Dar';
  }
  if (['merca', 'mercaicport', 'mercahistoricport'].includes(search)) {
    return 'Merca';
  }

  // Find exact/partial match in CITIES_DATA
  const found = CITIES_DATA.find(
    c => c.dbValue.toLowerCase() === search || 
         c.slug.toLowerCase() === search || 
         c.region.toLowerCase() === search ||
         c.name.toLowerCase() === search
  );
  if (found) return found.dbValue;

  // Substring match
  const subFound = CITIES_DATA.find(
    c => c.dbValue.toLowerCase().includes(search) || 
         search.includes(c.dbValue.toLowerCase()) || 
         c.region.toLowerCase().includes(search) ||
         search.includes(c.region.toLowerCase())
  );
  if (subFound) return subFound.dbValue;

  // Title-case fallback
  return rawName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

/**
 * Returns a comprehensive, query-friendly list of name and region variations for a given city 
 * to ensure database queries fetch all matching records regardless of storage drift.
 */
export function getCityQueryVariations(cityNameOrSlug: string): string[] {
  if (!cityNameOrSlug) return [];
  const canonical = normalizeCityName(cityNameOrSlug);
  
  // Base variations (lower & upper/proper casing)
  const base: string[] = [];

  const add = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !base.includes(trimmed)) base.push(trimmed);
    const lower = trimmed.toLowerCase();
    if (lower && !base.includes(lower)) base.push(lower);
  };

  add(canonical);

  if (canonical === 'Jigjiga') {
    ['Jijiga', 'jijiga', 'Jigjiga Capital', 'Somali Region', 'somali'].forEach(add);
  } else if (canonical === 'Mogadishu') {
    ['Banadir', 'Banaadir', 'Mogadisho', 'banadir', 'banaadir', 'Mogadishu Coastal'].forEach(add);
  } else if (canonical === 'Hargeisa') {
    ['Hargeysa', 'hargeysa', 'Maroodi Jeex', 'Maroodijeex', 'maroodi jeex', 'Hargeisa Hub'].forEach(add);
  } else if (canonical === 'Garowe') {
    ['Garoowe', 'garoowe', 'Nugal', 'Nugaal', 'nugal', 'Garowe Province'].forEach(add);
  } else if (canonical === 'Bosaso') {
    ['Boosaaso', 'boosaaso', 'Bari', 'bari', 'Bosaso Port'].forEach(add);
  } else if (canonical === 'Kismayo') {
    ['Kismaayo', 'kismaayo', 'Lower Juba', 'Lower Jubba', 'lower juba', 'Kismayo Gateway'].forEach(add);
  } else if (canonical === 'Baidoa') {
    ['Bay', 'bay', 'Baydhaba', 'Isha Baydhaba', 'Baidoa Region'].forEach(add);
  } else if (canonical === 'Beledweyne') {
    ['Hiran', 'Hiiraan', 'hiran', 'Beledweyne Corridor'].forEach(add);
  } else if (canonical === 'Galkayo') {
    ['Gaalkacyo', 'gaalkacyo', 'Mudug', 'mudug', 'Galkayo Central'].forEach(add);
  } else if (canonical === 'Burao') {
    ['Burco', 'burco', 'Togdheer', 'togdheer', 'Burco District'].forEach(add);
  } else if (canonical === 'Berbera') {
    ['Sahil', 'Saaxil', 'sahil', 'Berbera Port'].forEach(add);
  } else if (canonical === 'Las Anod') {
    ['Laascaanood', 'laascaanood', 'Sool', 'sool', 'las-anod', 'Las Anod Region'].forEach(add);
  } else if (canonical === 'Jowhar') {
    ['Middle Shabelle', 'jowhar valley', 'Jowhar Valley'].forEach(add);
  } else if (canonical === 'Afgooye') {
    ['Afgooyi', 'afgooyi', 'Lower Shabelle', 'Afgooye Growth Zone'].forEach(add);
  } else if (canonical === 'Godey') {
    ['Shabelle Zone', 'Godey Region'].forEach(add);
  } else if (canonical === 'Dire Dawa') {
    ['DireDawa', 'Dire Dawa Region', 'Chartered City'].forEach(add);
  } else if (canonical === 'Addis Ababa') {
    ['AddisAbaba', 'Addis Ababa Region', 'Federal Capital'].forEach(add);
  } else if (canonical === 'Mekelle') {
    ['Tigray', 'Mekelle Highland'].forEach(add);
  } else if (canonical === 'Hawassa') {
    ['Sidama', 'Hawassa Lakeside'].forEach(add);
  } else if (canonical === 'Adama') {
    ['Oromia', 'Adama Corridor'].forEach(add);
  } else if (canonical === 'Bahir Dar') {
    ['Amhara', 'Bahir Dar Basin'].forEach(add);
  } else if (canonical === 'Merca') {
    ['Lower Shabelle', 'Merca Historic Port'].forEach(add);
  }

  // Also query standard matching data from CITIES_DATA if found
  const matchedCity = CITIES_DATA.find(c => c.dbValue === canonical);
  if (matchedCity) {
    add(matchedCity.name);
    add(matchedCity.slug);
    add(matchedCity.region);
    add(matchedCity.dbValue);
  }

  return base;
}
