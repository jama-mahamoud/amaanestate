export interface CityData {
  slug: string;
  name: string;
  dbValue: string;
  region: string;
  country: 'Somalia' | 'Ethiopia' | 'Somaliland';
  description: string;
  featuredPropertyTypes: string[];
  nearbyActiveMarkets: { name: string; slug: string }[];
  accentColor: string;
}

export const CITIES_DATA: CityData[] = [
  {
    slug: 'mogadishu',
    name: 'Mogadishu Coastal',
    dbValue: 'Mogadishu',
    region: 'Banadir',
    country: 'Somalia',
    description: 'Dynamic capital city featuring premier beachfront residences, commercial spaces in Hodan and Wadajir, and rapidly expanding urban developments along the scenic Somali coast.',
    featuredPropertyTypes: ['Villas', 'Apartments', 'Commercial Buildings', 'Land Plotting'],
    nearbyActiveMarkets: [
      { name: 'Afgooye Growth Zone', slug: 'afgooye' },
      { name: 'Merca Historic Port', slug: 'merca' },
      { name: 'Kismayo Gateway', slug: 'kismayo' }
    ],
    accentColor: 'from-blue-600/20 to-indigo-600/5'
  },
  {
    slug: 'hargeisa',
    name: 'Hargeisa Hub',
    dbValue: 'Hargeisa',
    region: 'Maroodi Jeex',
    country: 'Somaliland',
    description: 'The secure and thriving commercial epicentre of Somaliland, renowned for premium villas in Jigjiga Yar, commercial centers, and appreciating land holdings.',
    featuredPropertyTypes: ['Villas', 'Apartments', 'Land Plotting'],
    nearbyActiveMarkets: [
      { name: 'Berbera Port', slug: 'berbera' },
      { name: 'Burco District', slug: 'burao' },
      { name: 'Jigjiga Capital', slug: 'jigjiga' }
    ],
    accentColor: 'from-amber-600/20 to-yellow-600/5'
  },
  {
    slug: 'garowe',
    name: 'Garowe Province',
    dbValue: 'Garowe',
    region: 'Nugal',
    country: 'Somalia',
    description: 'The administrative heart of Puntland, exhibiting clean residential expansion, diplomatic estates, and prime investment land parcels.',
    featuredPropertyTypes: ['Villas', 'Land Plotting', 'Commercial Buildings'],
    nearbyActiveMarkets: [
      { name: 'Galkayo Central', slug: 'galkayo' },
      { name: 'Bosaso Port', slug: 'bosaso' }
    ],
    accentColor: 'from-emerald-600/20 to-teal-600/5'
  },
  {
    slug: 'bosaso',
    name: 'Bosaso Port',
    dbValue: 'Bosaso',
    region: 'Bari',
    country: 'Somalia',
    description: 'Puntland’s bustling port metropolis, serving as a vital commercial gateway with hot properties, storage facilities, and sea-view commercial spaces.',
    featuredPropertyTypes: ['Commercial Buildings', 'Villas', 'Land Plotting'],
    nearbyActiveMarkets: [
      { name: 'Garowe Province', slug: 'garowe' },
      { name: 'Galkayo Central', slug: 'galkayo' }
    ],
    accentColor: 'from-cyan-600/20 to-blue-600/5'
  },
  {
    slug: 'jigjiga',
    name: 'Jigjiga Capital',
    dbValue: 'Jigjiga',
    region: 'Somali Region',
    country: 'Ethiopia',
    description: 'The energetic and modernizing capital of the Somali Region of Ethiopia, bridging critical regional trade routes with premium estates and dynamic development.',
    featuredPropertyTypes: ['Villas', 'Apartments', 'Land Plotting'],
    nearbyActiveMarkets: [
      { name: 'Dire Dawa Region', slug: 'dire-dawa' },
      { name: 'Hargeisa Hub', slug: 'hargeisa' }
    ],
    accentColor: 'from-rose-600/20 to-pink-600/5'
  },
  {
    slug: 'dire-dawa',
    name: 'Dire Dawa Region',
    dbValue: 'Dire Dawa',
    region: 'Chartered City',
    country: 'Ethiopia',
    description: 'A historic chartered industrial hub offering unique investment opportunities in industrial zones, business locations, and modern residential sectors.',
    featuredPropertyTypes: ['Commercial Buildings', 'Apartments', 'Land Plotting'],
    nearbyActiveMarkets: [
      { name: 'Jigjiga Capital', slug: 'jigjiga' },
      { name: 'Adama Corridor', slug: 'adama' },
      { name: 'Addis Ababa Region', slug: 'addis-ababa' }
    ],
    accentColor: 'from-purple-600/20 to-violet-600/5'
  },
  {
    slug: 'addis-ababa',
    name: 'Addis Ababa Region',
    dbValue: 'Addis Ababa',
    region: 'Federal Capital',
    country: 'Ethiopia',
    description: 'The monumental capital of Africa, boasting high-rise commercial structures, premium luxury apartments, diplomatic enclaves, and exceptional capital appreciation.',
    featuredPropertyTypes: ['Apartments', 'Villas', 'Commercial Buildings'],
    nearbyActiveMarkets: [
      { name: 'Adama Corridor', slug: 'adama' },
      { name: 'Hawassa Lakeside', slug: 'hawassa' }
    ],
    accentColor: 'from-amber-600/20 to-rose-600/5'
  },
  {
    slug: 'kismayo',
    name: 'Kismayo Gateway',
    dbValue: 'Kismayo',
    region: 'Lower Juba',
    country: 'Somalia',
    description: 'The gorgeous agricultural and maritime powerhouse of Jubaland, featuring fertile zones, deep-water port access, and spacious potential estates.',
    featuredPropertyTypes: ['Villas', 'Land Plotting', 'Commercial Buildings'],
    nearbyActiveMarkets: [
      { name: 'Mogadishu Coastal', slug: 'mogadishu' },
      { name: 'Merca Historic Port', slug: 'merca' }
    ],
    accentColor: 'from-blue-600/25 to-emerald-600/5'
  },
  {
    slug: 'baidoa',
    name: 'Baidoa Region',
    dbValue: 'Baidoa',
    region: 'Bay',
    country: 'Somalia',
    description: 'The highly pivotal agricultural and strategic core of South West State, displaying robust domestic trade, urban development, and accessible land parcels.',
    featuredPropertyTypes: ['Land Plotting', 'Villas', 'Commercial Buildings'],
    nearbyActiveMarkets: [
      { name: 'Mogadishu Coastal', slug: 'mogadishu' },
      { name: 'Beledweyne Corridor', slug: 'beledweyne' }
    ],
    accentColor: 'from-yellow-600/20 to-orange-600/5'
  },
  {
    slug: 'beledweyne',
    name: 'Beledweyne Corridor',
    dbValue: 'Beledweyne',
    region: 'Hiran',
    country: 'Somalia',
    description: 'A key transcontinental riverine hub bordering Ethiopia, enabling rapid commerce and displaying high demand for commercial and agricultural plots.',
    featuredPropertyTypes: ['Land Plotting', 'Commercial Buildings', 'Villas'],
    nearbyActiveMarkets: [
      { name: 'Galkayo Central', slug: 'galkayo' },
      { name: 'Mogadishu Coastal', slug: 'mogadishu' }
    ],
    accentColor: 'from-emerald-600/20 to-indigo-600/5'
  },
  {
    slug: 'galkayo',
    name: 'Galkayo Central',
    dbValue: 'Galkayo',
    region: 'Mudug',
    country: 'Somalia',
    description: 'A vibrant, cross-regional trade hub bridging central and northern territories with dynamic real estate demand and strong commercial opportunities.',
    featuredPropertyTypes: ['Villas', 'Commercial Buildings', 'Land Plotting'],
    nearbyActiveMarkets: [
      { name: 'Garowe Province', slug: 'garowe' },
      { name: 'Beledweyne Corridor', slug: 'beledweyne' }
    ],
    accentColor: 'from-amber-600/20 to-red-600/5'
  },
  {
    slug: 'burao',
    name: 'Burco District',
    dbValue: 'Burao',
    region: 'Togdheer',
    country: 'Somaliland',
    description: 'Somaliland’s second-largest city and livestock trading capital, boasting expansive suburban districts and highly active land listing activities.',
    featuredPropertyTypes: ['Villas', 'Land Plotting', 'Commercial Buildings'],
    nearbyActiveMarkets: [
      { name: 'Hargeisa Hub', slug: 'hargeisa' },
      { name: 'Berbera Port', slug: 'berbera' }
    ],
    accentColor: 'from-teal-600/20 to-blue-600/5'
  },
  {
    slug: 'berbera',
    name: 'Berbera Port',
    dbValue: 'Berbera',
    region: 'Sahil',
    country: 'Somaliland',
    description: 'Rapidly modernizing maritime free zone with premium logistics plots, tourist spaces, and vital infrastructure expansions on the Gulf of Aden.',
    featuredPropertyTypes: ['Commercial Buildings', 'Land Plotting', 'Villas'],
    nearbyActiveMarkets: [
      { name: 'Hargeisa Hub', slug: 'hargeisa' },
      { name: 'Burco District', slug: 'burao' }
    ],
    accentColor: 'from-blue-600/20 to-cyan-600/5'
  },
  {
    slug: 'las-anod',
    name: 'Las Anod Region',
    dbValue: 'Las Anod',
    region: 'Sool',
    country: 'Somalia',
    description: 'A historic crossroads of northern provinces hosting pristine highland developments, private properties, and affordable plot offerings.',
    featuredPropertyTypes: ['Villas', 'Land Plotting'],
    nearbyActiveMarkets: [
      { name: 'Garowe Province', slug: 'garowe' },
      { name: 'Burco District', slug: 'burao' }
    ],
    accentColor: 'from-slate-600/20 to-zinc-600/5'
  },
  {
    slug: 'jowhar',
    name: 'Jowhar Valley',
    dbValue: 'Jowhar',
    region: 'Middle Shabelle',
    country: 'Somalia',
    description: 'The administrative center of Hirshabelle State, legendary for its beautiful rich agricultural lands, green estates, and quiet residential communities.',
    featuredPropertyTypes: ['Land Plotting', 'Villas'],
    nearbyActiveMarkets: [
      { name: 'Mogadishu Coastal', slug: 'mogadishu' },
      { name: 'Beledweyne Corridor', slug: 'beledweyne' }
    ],
    accentColor: 'from-green-600/20 to-emerald-600/5'
  },
  {
    slug: 'afgooye',
    name: 'Afgooye Growth Zone',
    dbValue: 'Afgooye',
    region: 'Lower Shabelle',
    country: 'Somalia',
    description: 'A key suburb connected to Mogadishu, famous for prestigious farm holdings, green villas, and massive residential spillover development.',
    featuredPropertyTypes: ['Land Plotting', 'Villas', 'Commercial Buildings'],
    nearbyActiveMarkets: [
      { name: 'Mogadishu Coastal', slug: 'mogadishu' },
      { name: 'Merca Historic Port', slug: 'merca' }
    ],
    accentColor: 'from-emerald-600/25 to-yellow-600/5'
  },
  {
    slug: 'godey',
    name: 'Godey Region',
    dbValue: 'Godey',
    region: 'Shabelle Zone',
    country: 'Ethiopia',
    description: 'A prosperous city on the scenic Shabelle River, marking high potential in agricultural, mixed-use, and commercial property ventures.',
    featuredPropertyTypes: ['Land Plotting', 'Villas'],
    nearbyActiveMarkets: [
      { name: 'Jigjiga Capital', slug: 'jigjiga' },
      { name: 'Dire Dawa Region', slug: 'dire-dawa' }
    ],
    accentColor: 'from-orange-600/20 to-amber-600/5'
  },
  {
    slug: 'mekelle',
    name: 'Mekelle Highland',
    dbValue: 'Mekelle',
    region: 'Tigray',
    country: 'Ethiopia',
    description: 'A major university, industrial, and high-altitude commercial center in northern Ethiopia with excellent stone-accented villas and developments.',
    featuredPropertyTypes: ['Apartments', 'Villas', 'Commercial Buildings'],
    nearbyActiveMarkets: [
      { name: 'Addis Ababa Region', slug: 'addis-ababa' },
      { name: 'Dire Dawa Region', slug: 'dire-dawa' }
    ],
    accentColor: 'from-indigo-600/20 to-purple-600/5'
  },
  {
    slug: 'hawassa',
    name: 'Hawassa Lakeside',
    dbValue: 'Hawassa',
    region: 'Sidama',
    country: 'Ethiopia',
    description: 'The scenic resort and premium industrial lakeside city of southern Ethiopia, widely prized for tourist developments, luxury lakeside villas, and quiet estates.',
    featuredPropertyTypes: ['Villas', 'Apartments', 'Commercial Buildings'],
    nearbyActiveMarkets: [
      { name: 'Addis Ababa Region', slug: 'addis-ababa' },
      { name: 'Adama Corridor', slug: 'adama' }
    ],
    accentColor: 'from-blue-600/20 to-teal-600/5'
  },
  {
    slug: 'adama',
    name: 'Adama Corridor',
    dbValue: 'Adama',
    region: 'Oromia',
    country: 'Ethiopia',
    description: 'One of Ethiopia’s busiest transport corridors, linking Addis Ababa to the ports of Djibouti, triggering high demand for warehouses, commercial lots, and hotels.',
    featuredPropertyTypes: ['Commercial Buildings', 'Land Plotting', 'Villas'],
    nearbyActiveMarkets: [
      { name: 'Addis Ababa Region', slug: 'addis-ababa' },
      { name: 'Dire Dawa Region', slug: 'dire-dawa' }
    ],
    accentColor: 'from-amber-600/25 to-indigo-600/5'
  },
  {
    slug: 'bahir-dar',
    name: 'Bahir Dar Basin',
    dbValue: 'Bahir Dar',
    region: 'Amhara',
    country: 'Ethiopia',
    description: 'The elegant source-city of the Blue Nile on Lake Tana, offering a beautiful environment for luxury tourist spots, resort-style villas, and boutique spaces.',
    featuredPropertyTypes: ['Villas', 'Apartments', 'Commercial Buildings'],
    nearbyActiveMarkets: [
      { name: 'Addis Ababa Region', slug: 'addis-ababa' },
      { name: 'Hawassa Lakeside', slug: 'hawassa' }
    ],
    accentColor: 'from-teal-600/20 to-emerald-600/5'
  },
  {
    slug: 'merca',
    name: 'Merca Historic Port',
    dbValue: 'Merca',
    region: 'Lower Shabelle',
    country: 'Somalia',
    description: 'The famous historic coastal city featuring elegant white-washed stone architecture, beach-adjacent land, and promising coastal investment setups.',
    featuredPropertyTypes: ['Villas', 'Land Plotting'],
    nearbyActiveMarkets: [
      { name: 'Mogadishu Coastal', slug: 'mogadishu' },
      { name: 'Afgooye Growth Zone', slug: 'afgooye' }
    ],
    accentColor: 'from-cyan-600/20 to-emerald-600/5'
  }
];
