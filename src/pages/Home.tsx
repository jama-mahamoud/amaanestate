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
import somaliHeroImg from '@/assets/images/somali_agency_hero_1779895169818.png';
import { useSEO } from '@/hooks/useSEO';

const SECTORS_LIST = [
  { label: 'All Sectors', value: '' },
  { label: 'Houses', value: 'house' },
  { label: 'Villas', value: 'villa' },
  { label: 'Apartments', value: 'apartment' },
  { label: 'Land Plotting', value: 'land' },
  { label: 'Commercial Buildings', value: 'commercial' }
];

const CITIES_LIST = [
  { label: 'All Cities', value: '' },
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

  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);

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

  // Load all listings using the unified listingService
  useEffect(() => {
    let active = true;
    const fetchAllData = async () => {
      setListingsLoading(true);
      try {
        const { listings } = await listingService.getListings({ limit: 200 });
        if (active) {
          setAllListings(listings);
        }
      } catch (err) {
        console.error('Error fetching listings for Homepage:', err);
      } finally {
        if (active) {
          setListingsLoading(false);
        }
      }
    };
    fetchAllData();
    return () => {
      active = false;
    };
  }, []);

  // Separate properties and vehicles based on category
  const { visibleProperties, vehicles } = useMemo(() => {
    const propertiesList = allListings.filter(item => item.category === "property" || item.category === "land");
    const vehiclesList = allListings.filter(item => item.category === "vehicle");
    
    // Visibility and basic validation filters
    const visible = propertiesList.filter(
      item =>
        (item.status === "ACTIVE" || item.status === "VERIFIED" || (item as any).visibility === "public" || (item as any).approved === true)
    );
    
    console.log('[DEBUG] Fetched total allListings:', allListings.length);
    console.log('[DEBUG] Classified as properties/land:', propertiesList.length);
    console.log('[DEBUG] Filtered visible properties/land:', visible.length);
    
    const landListings = visible.filter(item => item.category === 'land');
    console.log('[DEBUG] Visible land listings:', landListings);

    return { visibleProperties: visible, vehicles: vehiclesList };
  }, [allListings]);

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

  // Filter matched properties dynamically
  const allProperties = useMemo(() => {
    const result = visibleProperties.filter(item => {
      if (filterSubcategory) {
        const itemSub = (item.subcategory || '').toLowerCase().trim();
        const querySub = filterSubcategory.toLowerCase().trim();
        if (querySub === 'rental') {
          const itemType = (item.listingType || '').toLowerCase().trim();
          if (itemType !== 'rent' && itemSub !== 'rental') return false;
        } else {
          if (!itemSub.includes(querySub) && !querySub.includes(itemSub)) return false;
        }
      }

      if (filterCity) {
        const itemCity = (item.city || '').toLowerCase().trim();
        const queryCity = filterCity.toLowerCase().trim();
        if (itemCity !== queryCity) return false;
      }

      if (filterStatus) {
        const itemType = (item.listingType || '').toLowerCase().trim();
        const queryType = filterStatus.toLowerCase().trim();
        if (itemType !== queryType) return false;
      }

      return true;
    });
    
    console.log('[DEBUG] Rendered total properties/land after UI filters:', result.length);
    return result;
  }, [visibleProperties, filterSubcategory, filterCity, filterStatus]);

  const ITEMS_PER_PAGE = 8;
  const { totalPages, safeCurrentPage, displayedProperties } = useMemo(() => {
    const total = Math.ceil(allProperties.length / ITEMS_PER_PAGE) || 1;
    const safePage = Math.min(currentPage, total);
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    const displayed = allProperties.slice(start, start + ITEMS_PER_PAGE);
    
    return { totalPages: total, safeCurrentPage: safePage, displayedProperties: displayed };
  }, [allProperties, currentPage]);


  return (
    <div className="min-h-screen bg-luxury-black text-white selection:bg-[#C5A059]/10 selection:text-[#C5A059]">
      {/* Hero Section */}
      <section className="relative pt-20 md:pt-48 pb-16 md:pb-28 overflow-hidden min-h-screen md:min-h-[85vh] flex items-center">
        {/* Immersive Background Image with High-Contrast Overlays (Desktop & Tablet only) */}
        <div className="hidden md:block absolute inset-0 z-0 select-none pointer-events-none">
          <motion.img 
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1.02, 1.05, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            src={somaliHeroImg} 
            alt="Warm key handover with Somali real estate agent and a family in modest Islamic dress in front of high-end home" 
            className="w-full h-full object-cover filter brightness-[0.7] saturate-[1.1] object-center"
            referrerPolicy="no-referrer"
          />
          {/* Black gradient overlays designed to preserve background visibility while keeping white text extremely legible */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-black/25" />
        </div>

        <div className="container mx-auto px-4 relative z-10 w-full">
          {/* Full-view Mobile-friendly Image Container (Mobile only) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="block md:hidden w-full relative mb-6 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white/[0.02]"
          >
            <motion.img 
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1.02, 1.05, 1] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              src={somaliHeroImg} 
              alt="Warm key handover with Somali real estate agent and a family in modest Islamic dress in front of high-end home" 
              className="w-full h-auto object-contain filter brightness-[0.9] saturate-[1.1] origin-center"
              referrerPolicy="no-referrer"
            />
            {/* Soft ambient inner gradient to blend with the interface of the mobile app */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </motion.div>

          <div className="max-w-2xl text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-5xl md:text-6xl font-display text-white mb-6 leading-[1.15] tracking-widest font-extrabold uppercase text-left"
            >
              RENTALS.<br />
              PROPERTIES.<br />
              <span className="text-white/50">VERIFICATION.</span>
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-start gap-4 w-full"
            >
              <Link
                to="/properties"
                onClick={scrollToListings}
                className="w-full sm:w-auto px-10 py-4 text-center text-sm font-bold text-black bg-[#C5A059] hover:bg-white transition-all rounded-2xl shadow-xl shadow-[#C5A059]/10 hover:-translate-y-0.5"
              >
                Browse Marketplace
              </Link>

              <Link
                to="/list-property"
                className="w-full sm:w-auto px-10 py-4 text-center text-sm font-bold text-white border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all rounded-2xl hover:-translate-y-0.5"
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
                {allProperties.length} ACTIVE LISTINGS
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
                  <SlidersHorizontal size={14} /> Filter Inventory ({allProperties.length})
                </span>
                <ChevronDown 
                  size={16} 
                  className={`transition-transform duration-300 ${isMobileFiltersOpen ? 'rotate-180 text-[#C5A059]' : 'rotate-0 text-white/50'}`} 
                />
              </button>

              {/* Sidebar Content (Always visible on desktop, toggleable on mobile) */}
              <div className={`space-y-6 ${isMobileFiltersOpen ? 'block animate-in fade-in slide-in-from-top-4 duration-300' : 'hidden lg:block'}`}>
                
                {/* Categories container */}
                <div className="bg-[#111111]/90 rounded-[2.5rem] border border-white/5 p-6 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
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
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono ${
                            filterSubcategory === sect.value 
                              ? 'bg-black/15 text-black' 
                              : 'bg-white/5 text-white/40 group-hover:text-white/60'
                          }`}>
                            {visibleProperties.filter(item => {
                              const itemSub = (item.subcategory || '').toLowerCase().trim();
                              const querySub = sect.value.toLowerCase().trim();
                              if (!sect.value) return true;
                              return itemSub.includes(querySub) || querySub.includes(itemSub);
                            }).length}
                          </span>
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
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono ${
                            filterCity === cityOpt.value 
                              ? 'bg-black/15 text-black' 
                              : 'bg-white/5 text-white/40 group-hover:text-white/60'
                          }`}>
                            {visibleProperties.filter(item => {
                              const itemCity = (item.city || '').toLowerCase().trim();
                              const queryCity = cityOpt.value.toLowerCase().trim();
                              if (!cityOpt.value) return true;
                              return itemCity === queryCity;
                            }).length}
                          </span>
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
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono ${
                            filterStatus === purp.value 
                              ? 'bg-black/15 text-black' 
                              : 'bg-white/5 text-white/40 group-hover:text-white/60'
                          }`}>
                            {visibleProperties.filter(item => {
                              const itemType = (item.listingType || '').toLowerCase().trim();
                              const queryType = purp.value.toLowerCase().trim();
                              if (!purp.value) return true;
                              return itemType === queryType;
                            }).length}
                          </span>
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
            <div className="lg:col-span-3 space-y-8">
              
              {/* Header metrics & label stats */}
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                  Showing {allProperties.length === 0 ? '0' : `${(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(safeCurrentPage * ITEMS_PER_PAGE, allProperties.length)}`} of {allProperties.length} Matches
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  ● Real-time Title Audits
                </span>
              </div>

              {allProperties.length === 0 ? (
                <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-[2rem] text-white/40">
                  <p className="font-display">No matching properties found in this division.</p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 text-xs font-bold text-[#C5A059] hover:underline"
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
                        disabled={safeCurrentPage === 1}
                        className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 text-white disabled:opacity-20 transition-all cursor-pointer"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      
                      <div className="text-[10px] font-bold text-white/40 px-4">
                        Page {safeCurrentPage} of {totalPages}
                      </div>

                      <button
                        onClick={() => {
                          setCurrentPage(p => Math.min(totalPages, p + 1));
                          propertiesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        disabled={safeCurrentPage === totalPages}
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
