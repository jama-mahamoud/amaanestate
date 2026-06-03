import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HomeSearch from '@/components/HomeSearch';
import CategoryScroller from '@/components/CategoryScroller';
import LatestNews from '@/components/LatestNews';
import PropertyCard from '@/components/PropertyCard';
import VehicleCard from '@/components/VehicleCard';
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
      if (!filterCity) {
        setDisplayedProperties([]);
        setTotalMatchingCount(0);
        setTotalPages(1);
        setPageLoading(false);
        return;
      }
      setPageLoading(true);
      try {
        const fetchFilters: ListingFilter = {
          limit: ITEMS_PER_PAGE,
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
        if (currentPage > 1 && lastDocs[currentPage - 1]) {
          fetchFilters.lastDoc = lastDocs[currentPage - 1];
        }

        const res = await listingService.getListings(fetchFilters);
        if (!active) return;

        setDisplayedProperties(res.listings);

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
      <section className="relative pt-28 md:pt-48 pb-16 md:pb-28 overflow-hidden min-h-screen md:min-h-[85vh] flex items-center bg-[#0B0D17]">
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
          <div className="max-w-2xl text-left -mt-1 md:mt-0">
            <motion.h1 
              initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={isMobile ? { duration: 0 } : { delay: 0.1 }}
              className="text-2xl sm:text-5xl md:text-6xl font-display text-white mb-6 leading-[1.15] tracking-widest font-extrabold uppercase text-left"
            >
              RENTALS.<br />
              PROPERTIES.<br />
              <span className="text-white/50">VERIFICATION.</span>
            </motion.h1>

            <motion.div 
              initial={isMobile ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={isMobile ? { duration: 0 } : { delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-start gap-4 w-full"
            >
              <Link
                to="/agents/register"
                className="w-full sm:w-auto px-10 py-4 text-center text-sm font-bold text-black bg-[#C5A059] hover:bg-white transition-all rounded-2xl shadow-xl shadow-[#C5A059]/10 hover:-translate-y-0.5"
              >
                Become an Agent / Broker
              </Link>

              <Link
                to="/list-property"
                className="w-full sm:w-auto px-10 py-4 text-center text-sm font-bold text-white border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 md:backdrop-blur-md transition-all rounded-2xl hover:-translate-y-0.5"
              >
                List your Property
              </Link>
            </motion.div>
          </div>

          <div className="w-full max-w-5xl mt-12 md:mt-20">
            <HomeSearch onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Main Listings Body */}
      <section ref={propertiesSectionRef} className="py-24 bg-super-black scroll-mt-24 border-t border-white/5">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl font-display text-white mb-4">Latest Properties</h2>
              <p className="text-white/40 text-sm">Explore our hand-picked selection of verified residential and commercial properties.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                {totalMatchingCount} ACTIVE LISTINGS
              </span>
            </div>
          </div>

          {/* Filtering Badges */}
          {(filterCity || filterSubcategory || filterStatus) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap items-center gap-3 mb-10"
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* LEFT COLUMN: PREMIUM CATEGORIES & FILTER SIDEBAR */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Mobile Collapsible Button */}
              <button 
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                className="w-full lg:hidden bg-white/[0.02] border border-white/10 hover:border-[#C5A059]/40 h-14 px-5 rounded-2xl flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2 text-[#C5A059]">
                  <SlidersHorizontal size={14} /> Filter Inventory ({totalMatchingCount})
                </span>
                <ChevronDown 
                  size={16} 
                  className={`transition-transform duration-300 ${isMobileFiltersOpen ? 'rotate-180 text-[#C5A059]' : 'rotate-0 text-white/50'}`} 
                />
              </button>

              {/* Sidebar Content (Always visible on desktop, toggleable on mobile) */}
              <div className={`space-y-6 ${isMobileFiltersOpen ? 'block animate-in fade-in slide-in-from-top-4 duration-300' : 'hidden lg:block'}`}>
                
                {/* Categories container */}
                <div className="bg-[#111111]/90 rounded-[2.5rem] border border-white/5 p-6 space-y-6 shadow-2xl relative overflow-hidden md:backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A059]/5 blur-2xl rounded-full pointer-events-none" />
                  
                  {/* Category Section */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A059]">Property Sectors</h4>
                    <div className="flex flex-col gap-1.5">
                      {SECTORS_LIST.map((sect) => (
                        <button
                          key={sect.value}
                          onClick={() => {
                            setFilterSubcategory(sect.value);
                            setCurrentPage(1);
                          }}
                          className={`w-full py-3 px-4 rounded-xl text-left text-xs font-semibold tracking-wide transition-all flex items-center justify-between group ${
                            filterSubcategory === sect.value
                              ? 'bg-[#C5A059] text-black font-black shadow-lg shadow-[#C5A059]/10'
                              : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                          }`}
                        >
                          <span>{sect.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cities Section */}
                  <div className="space-y-3 pt-5 border-t border-white/5">
                    <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A059]">Metro Locations</h4>
                    <div className="flex flex-col gap-1.5">
                      {CITIES_LIST.map((cityOpt) => (
                        <button
                          key={cityOpt.value}
                          onClick={() => {
                            setFilterCity(cityOpt.value);
                            setCurrentPage(1);
                          }}
                          className={`w-full py-3 px-4 rounded-xl text-left text-xs font-semibold tracking-wide transition-all flex items-center justify-between group ${
                            filterCity === cityOpt.value
                              ? 'bg-[#C5A059] text-black font-black shadow-lg shadow-[#C5A059]/10'
                              : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                          }`}
                        >
                          <span>{cityOpt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Purpose Section */}
                  <div className="space-y-3 pt-5 border-t border-white/5">
                    <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A059]">Transaction Type</h4>
                    <div className="flex flex-col gap-1.5">
                      {PURPOSE_LIST.map((purp) => (
                        <button
                          key={purp.value}
                          onClick={() => {
                            setFilterStatus(purp.value);
                            setCurrentPage(1);
                          }}
                          className={`w-full py-3 px-4 rounded-xl text-left text-xs font-semibold tracking-wide transition-all flex items-center justify-between group ${
                            filterStatus === purp.value
                              ? 'bg-[#C5A059] text-black font-black shadow-lg shadow-[#C5A059]/10'
                              : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                          }`}
                        >
                          <span>{purp.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Verification promo badge */}
                <div className="bg-gradient-to-br from-[#121212] to-black border border-[#C5A059]/10 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A059]/5 blur-xl rounded-full" />
                  <p className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">🛡️ Shield Verification</p>
                  <p className="text-[11px] text-white/50 leading-relaxed font-light mb-4">Every residential lease and property title deed on our network is triple-verified by licensed land registers and compliance agents.</p>
                  <button 
                    onClick={() => navigate('/about')}
                    className="w-full h-11 border border-white/10 hover:border-white/30 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Learn Security Protocol
                  </button>
                </div>

              </div>

            </div>

            {/* RIGHT COLUMN: MAIN CONTENT (PROPERTIES GRID) */}
            <div className="lg:col-span-3 space-y-8 relative">
              
              {/* Header metrics & label stats */}
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                  Showing {totalMatchingCount === 0 ? '0' : `${(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(safeCurrentPage * ITEMS_PER_PAGE, totalMatchingCount)}`} of {totalMatchingCount} Matches
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  ● Real-time Title Audits
                </span>
              </div>

              {!filterCity ? (
                <div className="text-center py-24 bg-gradient-to-b from-[#111111]/40 to-black/40 border border-white/5 rounded-[2.5rem] p-8 text-white/50 animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059] mx-auto mb-6">
                    <MapPin className="w-8 h-8 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-display text-white mb-2">Select a Metro Location</h3>
                  <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed mb-6">
                    AmaanEstate enforces secure, real-time title register audits. Please select a municipal city hub to begin exploring local verified inventory.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                    {CITIES_LIST.map(cityOpt => (
                      <button
                        key={cityOpt.value}
                        onClick={() => {
                          setFilterCity(cityOpt.value);
                          setCurrentPage(1);
                        }}
                        className="bg-white/5 hover:bg-[#C5A059] hover:text-black border border-white/10 text-white/80 text-[10px] uppercase font-bold tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        {cityOpt.label.replace(' Coastal', '').replace(' Hub', '').replace(' Province', '').replace(' Port', '').replace(' Capital', '').replace(' Region', '')}
                      </button>
                    ))}
                  </div>
                </div>
              ) : pageLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                  <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
                  <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Consulting Title Registers for {filterCity}...</p>
                </div>
              ) : totalMatchingCount === 0 ? (
                <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-[2rem] text-white/40 animate-in fade-in duration-300">
                  <p className="font-display">No matching properties found in {filterCity}.</p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 text-xs font-bold text-[#C5A059] hover:underline cursor-pointer"
                  >
                    Reset Inventory filters
                  </button>
                </div>
              ) : (
                <div className="space-y-16 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayedProperties.map(property => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
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

        </div>
      </section>

      {/* Dynamic Browse by City Section */}
      <section className="py-24 bg-super-black border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#C5A059]/1 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
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
              <Link
                key={city.slug}
                to={`/cities/${city.slug}`}
                className="bg-[#111]/40 border border-white/5 hover:border-[#C5A059]/20 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden block"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${city.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                <div className="relative z-10 space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-[#C5A059]/10 border border-white/10 group-hover:border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] transition-colors duration-300">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#C5A059] transition-colors truncate">
                      {city.name.replace(' Coastal', '').replace(' Hub', '').replace(' Province', '').replace(' Port', '').replace(' Capital', '').replace(' Region', '')}
                    </h4>
                    <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider truncate">
                      {city.region}
                    </p>
                  </div>
                  <div className="text-[10px] text-[#C5A059]/80 font-medium group-hover:underline flex items-center gap-1 pt-1 justify-between">
                    <span>Explore Hub</span>
                    <ArrowRight className="w-3 h-3 -rotate-45 text-[#C5A059]/80 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="py-24 bg-super-black border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
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
