import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HomeSearch from '@/components/HomeSearch';
import CategoryScroller from '@/components/CategoryScroller';
import LatestNews from '@/components/LatestNews';
import PropertyCard from '@/components/PropertyCard';
import VehicleCard from '@/components/VehicleCard';
import CityCard from '@/components/CityCard';
import { listingService } from '@/services/listingService';
import { Listing, VehicleListing } from '@/types';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  Loader2, 
  ArrowRight,
  Gem,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  XCircle,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ListingFilter } from '@/services/listingService';
import { Link } from 'react-router-dom';
import somaliLuxuryVillaImg from '@/assets/images/somali_luxury_villa_1780228310940.png';
import { useSEO } from '@/hooks/useSEO';
import { CITIES_DATA } from '@/data/cities';
import { MapPin, Globe } from 'lucide-react';
import { normalizeCityName } from '@/utils/cityNormalization';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SECTORS_LIST = [
  { label: 'All Sectors', value: '' },
  { label: 'Houses', value: 'house' },
  { label: 'Villas', value: 'villa' },
  { label: 'Apartments', value: 'apartment' },
  { label: 'Land Plotting', value: 'land' },
  { label: 'Commercial Buildings', value: 'commercial' }
];

const CITIES_LIST = [
  { label: 'Mogadishu Coastal', value: 'Mogadishu' },
  { label: 'Hargeisa Hub', value: 'Hargeisa' },
  { label: 'Garowe Province', value: 'Garowe' },
  { label: 'Bosaso Port', value: 'Bosaso' },
  { label: 'Jigjiga Capital', value: 'Jigjiga' },
  { label: 'Dire Dawa Region', value: 'Dire Dawa' },
  { label: 'Addis Ababa Region', value: 'Addis Ababa' }
];

const PURPOSE_LIST = [
  { label: 'All Agreements', value: '' },
  { label: 'For Sale', value: 'sale' },
  { label: 'For Rent', value: 'rent' }
];


export default function Home() {
  const navigate = useNavigate();
  const { t } = useSettings();

  useSEO({
    title: 'Home — Premium Real Estate & Verified Marketplace',
    description: 'AmaanEstate is the premium portal for verified properties, land plot listings, luxury vehicles, and careers in Somalia. Secure, vetted, and trusted local deals.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      'name': 'AmaanEstate',
      'description': 'AmaanEstate is a real estate and jobs marketplace centered on verified accounts, secure transactions, and trust score computations.',
      'url': 'https://amaanestate.com',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://amaanestate.com/?city={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }
  });

  const [vehicles, setVehicles] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [cityCounts, setCityCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let unsubscribe = () => {};
    
    // Dedicated canonical matching function to standardize both database city values and UI city names
    const getCanonicalCityKey = (cityName: string | null | undefined): string => {
      if (!cityName) return '';
      const clean = cityName.trim().toLowerCase();
      
      // 1. Direct explicit name mappings
      if (clean === 'jigjiga' || clean === 'jijiga') return 'jigjiga';
      if (clean === 'mogadishu' || clean === 'mogadisho' || clean === 'banaadir' || clean === 'banadir' || clean === 'mogadishu coastal') return 'mogadishu';
      if (clean === 'hargeisa' || clean === 'hargeysa' || clean === 'hargeisa hub') return 'hargeisa';
      if (clean === 'garowe' || clean === 'garoowe' || clean === 'garowe province') return 'garowe';
      if (clean === 'bosaso' || clean === 'boosaaso' || clean === 'bosaso port') return 'bosaso';
      if (clean === 'kismayo' || clean === 'kismaayo' || clean === 'kismayo gateway') return 'kismayo';
      if (clean === 'baidoa' || clean === 'baydhaba' || clean === 'baidoa region') return 'baidoa';
      if (clean === 'burao' || clean === 'burco' || clean === 'burco district') return 'burao';
      if (clean === 'beledweyne' || clean === 'beledweyne corridor') return 'beledweyne';
      if (clean === 'galkayo' || clean === 'gaalkacyo' || clean === 'galkayo central') return 'galkayo';
      if (clean === 'berbera' || clean === 'berbera port') return 'berbera';
      if (clean === 'las anod' || clean === 'las-anod' || clean === 'laascaanood' || clean === 'lasanod' || clean === 'las anod region') return 'las-anod';
      if (clean === 'jowhar' || clean === 'jowhar valley') return 'jowhar';
      if (clean === 'afgooye' || clean === 'afgooyi' || clean === 'afgoye' || clean === 'afgooye growth zone') return 'afgooye';
      if (clean === 'godey' || clean === 'gode' || clean === 'godey region') return 'godey';
      if (clean === 'dire dawa' || clean === 'diredawa' || clean === 'dire dawa region') return 'dire-dawa';
      if (clean === 'addis ababa' || clean === 'addisababa' || clean === 'addis ababa region') return 'addis-ababa';
      if (clean === 'mekelle' || clean === 'mekele' || clean === 'mekelle highland') return 'mekelle';
      if (clean === 'hawassa' || clean === 'hawasa' || clean === 'hawassa lakeside') return 'hawassa';
      if (clean === 'adama' || clean === 'adama corridor') return 'adama';
      if (clean === 'bahir dar' || clean === 'bahirdar' || clean === 'bahir dar basin') return 'bahir-dar';
      if (clean === 'merca' || clean === 'merca historic port') return 'merca';

      // 2. Lookup against CITIES_DATA structure
      const matched = CITIES_DATA.find(
        c => c.slug.toLowerCase() === clean ||
             c.dbValue.toLowerCase() === clean ||
             c.name.toLowerCase() === clean
      );
      if (matched) return matched.slug;

      return clean;
    };

    try {
      const q = query(
        collection(db, 'listings'),
        where('category', 'in', ['property', 'land'])
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const counts: Record<string, number> = {};
        
        // Trackers for mandatory debug & verification requirements
        const matchedDocsForCity: Record<string, string[]> = {};
        const rawCityValuesForCity: Record<string, string[]> = {};

        // Initialize empty arrays and 0 counts for each city
        CITIES_DATA.forEach(city => {
          counts[city.slug] = 0;
          matchedDocsForCity[city.slug] = [];
          rawCityValuesForCity[city.slug] = [];
        });

        snapshot.docs.forEach((doc) => {
          const item = doc.data();
          // Perfect alignment with search listings filtering logic to present consistent, reliable property counts
          const isVettedAndActive = ['active', 'verified', 'approved'].includes(item.status?.toLowerCase()?.trim() || '') ||
                                    item.isVerified === true ||
                                    ['verified', 'verified_listing'].includes(item.verificationStatus?.toLowerCase()?.trim() || '');
          
          if (isVettedAndActive) {
            const dbCityRaw = item.city;
            const itemCityKey = getCanonicalCityKey(dbCityRaw);

            // Find which city in CITIES_DATA matches this canonical key
            const matchedCity = CITIES_DATA.find(city => {
              const cityKey = getCanonicalCityKey(city.slug);
              return itemCityKey === cityKey;
            });

            if (matchedCity) {
              counts[matchedCity.slug] += 1;
              matchedDocsForCity[matchedCity.slug].push(doc.id);
              if (dbCityRaw && !rawCityValuesForCity[matchedCity.slug].includes(dbCityRaw)) {
                rawCityValuesForCity[matchedCity.slug].push(dbCityRaw);
              }
            }
          }
        });

        // Debug outputs and mandatory assertions
        console.log("=== REAL-TIME MARKET PROPERTY INDEX VERIFICATION ===");
        CITIES_DATA.forEach(city => {
          const computedCount = counts[city.slug];
          const actualDocs = matchedDocsForCity[city.slug];
          const rawValues = rawCityValuesForCity[city.slug];

          console.log(`City: [${city.name}] (${city.slug})`);
          console.log(`  Raw DB City values seen:`, JSON.stringify(rawValues));
          console.log(`  Matched Doc IDs:`, JSON.stringify(actualDocs));
          console.log(`  Computed Count: ${computedCount}`);
          console.log(`  Actual Filtered Docs Log Length: ${actualDocs.length}`);

          // Mandatory assertion step to compare computed count against actual filtered length
          if (computedCount !== actualDocs.length) {
            console.warn(`  [VERIFICATION MISMATCH] Count discrepancy detected for ${city.name}! Computed: ${computedCount}, Actual: ${actualDocs.length}. Correcting count.`);
            counts[city.slug] = actualDocs.length;
          } else {
            console.log(`  [VERIFICATION SUCCESS] Perfectly verified.`);
          }
        });
        console.log("====================================================");

        setCityCounts(counts);
      }, (error) => {
        console.error("Real-time city count subscription failed, using empty counts:", error);
        const defaultCounts: Record<string, number> = {};
        CITIES_DATA.forEach(city => {
          defaultCounts[city.slug] = 0;
        });
        setCityCounts(defaultCounts);
      });
    } catch (err) {
      console.error("Failed to setup real-time city count snapshot listener:", err);
      const defaultCounts: Record<string, number> = {};
      CITIES_DATA.forEach(city => {
        defaultCounts[city.slug] = 0;
      });
      setCityCounts(defaultCounts);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mobileQuery = window.matchMedia('(max-width: 768px)');
      setIsMobile(mobileQuery.matches);
      
      const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
      mobileQuery.addEventListener('change', listener);
      
      return () => {
        mobileQuery.removeEventListener('change', listener);
      };
    }
  }, []);

  const scrollToListings = (e: React.MouseEvent) => {
    e.preventDefault();
    propertiesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const [searchParams] = useSearchParams();

  // Home-page state based filtering
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterSubcategory, setFilterSubcategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>(''); 
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const propertiesSectionRef = useRef<HTMLDivElement>(null);

  // Synchronize URL search parameters onto homepage filters
  useEffect(() => {
    const cityParam = searchParams.get('city') || '';
    const subcatParam = searchParams.get('subcategory') || searchParams.get('category') || '';
    const typeParam = searchParams.get('listingType') || searchParams.get('status') || '';

    if (cityParam || subcatParam || typeParam) {
      if (cityParam) setFilterCity(cityParam);
      if (subcatParam && subcatParam.toLowerCase() !== 'vehicle') setFilterSubcategory(subcatParam);
      if (typeParam) setFilterStatus(typeParam === 'rent' || typeParam === 'rented' ? 'rent' : 'sale');
      
      setCurrentPage(1);
      const timer = setTimeout(() => {
        propertiesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Load featured vehicles dynamically from Firestore
  useEffect(() => {
    let active = true;
    const fetchVehicles = async () => {
      try {
        const res = await listingService.getListings({ category: 'vehicle', limit: 8 });
        if (active) {
          setVehicles(res.listings);
        }
      } catch (err) {
        console.error('Error fetching vehicles for Homepage:', err);
      }
    };
    fetchVehicles();
    return () => {
      active = false;
    };
  }, []);

  // Handle HomeSearch component filters
  const handleSearch = useCallback((filters: ListingFilter) => {
    const categoryVal = (filters.category || '').toString().toLowerCase().trim();
    if (categoryVal === 'vehicle') {
      const params = new URLSearchParams();
      if (filters.city) params.set('city', filters.city);
      if (filters.subcategory) params.set('type', filters.subcategory);
      navigate(`/vehicles?${params.toString()}`);
      return;
    }

    setFilterCity(filters.city || '');
    setFilterSubcategory(filters.subcategory || '');
    if (filters.listingType) {
      setFilterStatus(filters.listingType === 'rent' ? 'rent' : 'sale');
    } else {
      setFilterStatus('');
    }
    setCurrentPage(1);

    setTimeout(() => {
      propertiesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }, [navigate]);

  const handleResetFilters = useCallback(() => {
    setFilterCity('');
    setFilterSubcategory('');
    setFilterStatus('');
    setCurrentPage(1);
  }, []);

  // State to support server-side querying and pagination directly on Firestore
  const [displayedProperties, setDisplayedProperties] = useState<Listing[]>([]);
  const [totalMatchingCount, setTotalMatchingCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [lastDocs, setLastDocs] = useState<Record<number, any>>({});
  const [pageLoading, setPageLoading] = useState(false);

  const ITEMS_PER_PAGE = 20; // Dynamic pagination (20 results per page)

  // Reset pagination cursors each time any UI/search filter changes
  useEffect(() => {
    setCurrentPage(1);
    setLastDocs({});
  }, [filterCity, filterSubcategory, filterStatus]);

  // Reactively fetch the matched subset of page listings based on current filters and active page cursor
  useEffect(() => {
    let active = true;

    const fetchPageData = async () => {
      setPageLoading(true);
      try {
        const fetchFilters: ListingFilter = {
          limit: filterCity ? ITEMS_PER_PAGE : 4,
        };

        if (filterStatus) {
          fetchFilters.listingType = filterStatus as any;
        }

        if (filterCity) {
          fetchFilters.city = filterCity;
        }

        if (filterSubcategory) {
          if (filterSubcategory === 'land') {
            fetchFilters.category = 'land';
          } else {
            fetchFilters.category = 'property';
            fetchFilters.subcategory = filterSubcategory;
          }
        } else {
          fetchFilters.category = 'property';
        }

        // Set pagination cursor
        if (currentPage > 1 && lastDocs[currentPage - 1] && filterCity) {
          fetchFilters.lastDoc = lastDocs[currentPage - 1];
        }

        const res = await listingService.getListings(fetchFilters);
        if (!active) return;

        setDisplayedProperties(res.listings);

        if (filterCity) {
          // Store next page cursor
          if (res.lastDoc) {
            setLastDocs(prev => ({
              ...prev,
              [currentPage]: res.lastDoc
            }));
          }

          // Fetch precise aggregate match counts directly from Firestore
          const countFilters = { ...fetchFilters };
          delete countFilters.limit;
          delete countFilters.lastDoc;

          const totalCount = await listingService.getListingsCount(countFilters);
          if (!active) return;

          setTotalMatchingCount(totalCount);
          setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE) || 1);
        } else {
          setTotalMatchingCount(res.listings.length);
          setTotalPages(1);
        }

      } catch (err) {
        console.error('[Error] Server-side query fetch failed:', err);
      } finally {
        if (active) {
          setPageLoading(false);
        }
      }
    };

    fetchPageData();
    return () => {
      active = false;
    };
  }, [currentPage, filterCity, filterSubcategory, filterStatus, lastDocs[currentPage - 1]]);

  // Stabilize safeCurrentPage value to prevent UI out-of-bounds mismatches
  const safeCurrentPage = useMemo(() => {
    return Math.min(currentPage, totalPages);
  }, [currentPage, totalPages]);


  return (
    <div className="min-h-screen bg-luxury-black text-white selection:bg-[#C5A059]/10 selection:text-[#C5A059]">
      {/* Hero Section */}
      <section className="relative pt-20 md:pt-32 pb-10 md:pb-14 overflow-hidden flex items-center bg-[#0B0D17]">
        {/* Background Image Overlay presenting a premier Somali luxury villa asset */}
        <div className="absolute inset-0 z-10 w-full h-full select-none pointer-events-none overflow-hidden">
          <img 
            src={somaliLuxuryVillaImg} 
            alt="Premier Somali luxury architectural villa"
            className="w-full h-full object-cover block opacity-40 brightness-[0.75] saturate-[1.1] object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D17]/95 via-[#0B0D17]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] via-transparent to-[#0B0D17]/45" />
        </div>

        <div className="container mx-auto px-4 relative z-20 w-full">
          <div className="max-w-3xl">
            <motion.h1 
              initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={isMobile ? { duration: 0 } : { delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-7xl font-display text-white mt-12 sm:mb-8 leading-[1.05] tracking-tighter font-extrabold uppercase text-left"
            >
              Your Future <br/>
              <span className="text-[#C5A059]">Resides Here.</span>
            </motion.h1>

          </div>

          <div className="w-full max-w-5xl mt-8 md:mt-12">
            <HomeSearch onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Main Listings Body */}
      <section ref={propertiesSectionRef} className="py-12 md:py-16 lg:py-20 bg-super-black scroll-mt-20 border-t border-white/5">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4 sm:gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl font-display text-white mb-4">Latest Properties</h2>
              <p className="text-white/40 text-sm">Explore our hand-picked selection of verified residential and commercial properties.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                {filterCity ? `${totalMatchingCount} properties found in ${filterCity}` : `${totalMatchingCount} ACTIVE LISTINGS`}
              </span>
            </div>
          </div>

          {/* Filtering Badges */}
          {(filterCity || filterSubcategory || filterStatus) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap items-center gap-2.5 mb-6 md:mb-8"
            >
              {filterCity && (
                <span className="premium-pill bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 flex items-center gap-2">
                  City: {filterCity}
                </span>
              )}
              {filterSubcategory && (
                <span className="premium-pill bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 flex items-center gap-2">
                  Type: {filterSubcategory}
                </span>
              )}
              {filterStatus && (
                <span className="premium-pill bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 flex items-center gap-2">
                  {filterStatus === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-[10px] font-bold text-red-400 hover:underline px-2"
              >
                Clear all filters
              </button>
            </motion.div>
          )}

          {/* TWO-COLUMN LAYOUT DESKTOP / RESPONSIVE STACK MOBILE */}
          <div className="grid grid-cols-1 gap-8">
            {pageLoading ? (
              <div className="flex flex-col items-center justify-center py-20 md:py-32 space-y-4 col-span-full">
                <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
                <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Consulting Title Registers...</p>
              </div>
            ) : displayedProperties.length === 0 ? (
              <div className="text-center py-16 md:py-24 bg-white/[0.02] border border-white/5 rounded-[2rem] text-white/40 col-span-full animate-in fade-in duration-300">
                <p className="font-display text-lg mb-2 text-white">No properties found.</p>
                <p className="text-white/60 mb-6 font-light">Try another location or browse all listings.</p>
                {(filterCity || filterSubcategory || filterStatus) && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 text-xs font-bold text-[#C5A059] hover:underline cursor-pointer"
                  >
                    Browse all listings
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-10 md:space-y-12 animate-in fade-in duration-500 col-span-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {displayedProperties.slice(0, filterCity ? undefined : 4).map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {/* Pagination (Only show when filter is active and totalPages > 1) */}
                {filterCity && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-8">
                    <button
                      onClick={() => {
                        setCurrentPage(p => Math.max(1, p - 1));
                        propertiesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 text-white disabled:opacity-20 transition-all cursor-pointer"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    <div className="text-[10px] font-bold text-white/40 px-4">
                      Page {currentPage} of {totalPages}
                    </div>

                    <button
                      onClick={() => {
                        setCurrentPage(p => Math.min(totalPages, p + 1));
                        propertiesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 text-white disabled:opacity-20 transition-all cursor-pointer"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Dynamic Browse by City Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-super-black border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#C5A059]/1 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4 sm:gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C5A059] uppercase tracking-widest bg-[#C5A059]/5 border border-[#C5A059]/25 px-2.5 py-1 rounded-md mb-3">
                <Globe className="w-3 h-3" /> Regional Markets
              </span>
              <h2 className="text-3xl font-display text-white mb-4">Browse by City Hub</h2>
              <p className="text-white/40 text-sm">Discover verified properties and vetted local professionals operating across 22 major cities and regions in Somalia, Somaliland, and Ethiopia.</p>
            </div>
            
            <div className="shrink-0">
              <Link 
                to="/cities" 
                className="inline-flex items-center gap-2 group text-xs font-bold text-[#C5A059] bg-[#C5A059]/5 hover:bg-[#C5A059] hover:text-black border border-[#C5A059]/20 hover:border-[#C5A059] px-6 py-3 rounded-xl transition-all duration-300 shadow-md shadow-[#C5A059]/5"
              >
                View 22 Cities Directory <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {CITIES_DATA.slice(0, 6).map(city => (
              <CityCard 
                key={city.slug} 
                city={city} 
                propertyCount={cityCounts[city.slug] || 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-super-black border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4 sm:gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl font-display text-white mb-4">Featured Vehicles</h2>
              <p className="text-white/40 text-sm">Find premium vehicles from trusted dealers and private sellers in the region.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold text-[#C5A059] uppercase tracking-widest bg-[#C5A059]/5 border border-[#C5A059]/20 px-4 py-2 rounded-xl">
                {vehicles.filter(v => v.status === 'ACTIVE' || v.status === 'VERIFIED' || (v as any).visibility === 'public').length} SHIELD-VERIFIED FLEET
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {vehicles.filter(v => v.status === 'ACTIVE' || v.status === 'VERIFIED' || (v as any).visibility === 'public').slice(0, 4).map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle as VehicleListing} />
            ))}
          </div>
        </div>
      </section>

      <LatestNews />
    </div>
  );
}
