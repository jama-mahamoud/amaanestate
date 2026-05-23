import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HomeSearch from '@/components/HomeSearch';
import LatestNews from '@/components/LatestNews';
import PropertyCard from '@/components/PropertyCard';
import VehicleCard from '@/components/VehicleCard';
import MapDiscovery from '@/components/MapDiscovery';
import { listingRepository } from '@/services/listingRepository';
import { Listing, VehicleListing, Property } from '@/types';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  Loader2, 
  ArrowRight,
  Gem,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  XCircle
} from 'lucide-react';
import { ListingFilter } from '@/services/listingService';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  const [searchParams] = useSearchParams();

  // Home-page state based filtering to completely avoid navigating to a secondary marketplace filter page
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterSubcategory, setFilterSubcategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>(''); // 'rent' or 'sale'
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);

  const propertiesSectionRef = useRef<HTMLDivElement>(null);

  // Synchronize URL search parameters onto homepage filters for seamless header menu/navigation links
  useEffect(() => {
    const cityParam = searchParams.get('city') || '';
    const subcatParam = searchParams.get('subcategory') || searchParams.get('category') || '';
    const typeParam = searchParams.get('listingType') || searchParams.get('status') || '';

    // Only apply if parameters are defined
    if (cityParam || subcatParam || typeParam) {
      if (cityParam) setFilterCity(cityParam);
      if (subcatParam && subcatParam.toLowerCase() !== 'vehicle') setFilterSubcategory(subcatParam);
      if (typeParam) setFilterStatus(typeParam === 'rent' || typeParam === 'rented' ? 'rent' : 'sale');
      
      setCurrentPage(1);
      setTimeout(() => {
        propertiesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [searchParams]);

  // Load all listings using the repository. This includes robust legacy document normalization (data.status || 'active')
  useEffect(() => {
    let active = true;
    const fetchAllData = async () => {
      setListingsLoading(true);
      try {
        const data = await listingRepository.fetchListings();
        if (active) {
          setAllListings(data);
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
  const properties = allListings.filter(item => item.category === "property");
  const vehicles = allListings.filter(item => item.category === "vehicle");
  
  // Visibility and basic validation filters
  const visibleProperties = properties.filter(
    item =>
      (item.status === "active" || item.status === "approved" || (item as any).visibility === "public" || (item as any).approved === true) &&
      (item.price || 0) > 0
  );

  // Debug logs
  console.log("Properties:", properties);
  console.log("Visible properties:", visibleProperties);
  console.log("Vehicles:", vehicles);

  // Handle HomeSearch component filters
  const handleSearch = (filters: ListingFilter) => {
    const categoryVal = (filters.category || '').toString().toLowerCase().trim();
    if (categoryVal === 'vehicle') {
      const params = new URLSearchParams();
      if (filters.city) params.set('city', filters.city);
      if (filters.subcategory) params.set('type', filters.subcategory);
      navigate(`/vehicles?${params.toString()}`);
      return;
    }

    // Set filters locally for seamless client-side filtering on the Homepage
    setFilterCity(filters.city || '');
    setFilterSubcategory(filters.subcategory || '');
    if (filters.listingType) {
      setFilterStatus(filters.listingType === 'rent' ? 'rent' : 'sale');
    } else {
      setFilterStatus('');
    }
    setCurrentPage(1);

    // Scroll smoothly to the general overview section
    setTimeout(() => {
      propertiesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // Clear all filters back to the initial state
  const handleResetFilters = () => {
    setFilterCity('');
    setFilterSubcategory('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  // 1. Filter matched properties dynamically
  const allProperties = visibleProperties.filter(item => {
    // A. Subcategory match (House, Villa, Apartment, Land, Commercial, Rental)
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

    // B. City match
    if (filterCity) {
      const itemCity = (item.city || '').toLowerCase().trim();
      const queryCity = filterCity.toLowerCase().trim();
      if (itemCity !== queryCity) return false;
    }

    // C. Listing Type match (Status: sale or rent)
    if (filterStatus) {
      const itemType = (item.listingType || '').toLowerCase().trim();
      const queryType = filterStatus.toLowerCase().trim();
      if (itemType !== queryType) return false;
    }

    return true;
  });

  // Pagination parameters for clean desktop grid (4 columns)
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(allProperties.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const displayedProperties = allProperties.slice(startIndex, startIndex + ITEMS_PER_PAGE);


  return (
    <div className="min-h-screen bg-luxury-black text-white selection:bg-luxury-gold selection:text-black">
      {/* Hero Section */}
      <section className="relative pt-16 md:pt-24 pb-12 md:pb-20 overflow-visible flex flex-col items-center justify-center min-h-[60vh] md:min-h-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-luxury-gold/5 via-luxury-black to-luxury-black z-0"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
          <div className="text-center mb-10 md:mb-12 w-full max-w-3xl px-2">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl md:text-6xl font-display font-medium tracking-tight mb-4 md:mb-6 text-white leading-tight"
            >
              Find your next luxury home
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/50 text-[10px] md:text-sm font-bold uppercase tracking-[0.3em] px-4"
            >
              Verified real estate and mobility solutions
            </motion.p>
          </div>
          
          <div className="w-full max-w-4xl">
            <HomeSearch onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Main Listings Body */}
      {listingsLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-luxury-gold" size={40} />
        </div>
      ) : (
        <>
          {/* Premium Properties Grid Section with 4-Column Balanced Grid (all listings combined) */}
          <section ref={propertiesSectionRef} className="py-16 border-b border-white/5 relative scroll-mt-24">
            <div className="absolute inset-x-0 -top-40 h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/5 to-transparent z-0"></div>
            
            <div className="container mx-auto px-4 relative z-10">
              {/* Section Header Area */}
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-luxury-gold/5 border border-luxury-gold/10 flex items-center justify-center text-luxury-gold shrink-0">
                    <Gem size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-luxury-gold tracking-[0.2em] mb-1 block">
                      VERIFIED PORTFOLIO
                    </span>
                    <h2 className="text-2xl font-display font-medium text-white tracking-tight">
                      All Verified Properties
                    </h2>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] uppercase font-mono text-white/40 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                    {allProperties.length} ACTIVE PROPERTIES AVAILABLE
                  </span>
                </div>
              </div>

              {/* Dynamic Filter Badges & Feedback Indicator (Sticky) */}
              {(filterCity || filterSubcategory || filterStatus) && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="sticky top-24 z-30 mb-12 p-3 md:p-5 bg-[#0D0D0D]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex flex-wrap items-center justify-between gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                      <Sparkles size={12} className="text-luxury-gold animate-pulse" />
                      <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Active Selection</span>
                    </div>

                    {filterCity && (
                      <span className="px-4 py-2 bg-luxury-gold/5 border border-luxury-gold/20 text-luxury-gold text-[10px] font-black uppercase tracking-[0.1em] rounded-xl flex items-center gap-2 group transition-all hover:bg-luxury-gold/10">
                        <span className="w-1 h-1 rounded-full bg-luxury-gold group-hover:scale-150 transition-all"></span>
                        City: {filterCity}
                      </span>
                    )}
                    {filterSubcategory && (
                      <span className="px-4 py-2 bg-luxury-gold/5 border border-luxury-gold/20 text-luxury-gold text-[10px] font-black uppercase tracking-[0.1em] rounded-xl flex items-center gap-2 group transition-all hover:bg-luxury-gold/10">
                        <span className="w-1 h-1 rounded-full bg-luxury-gold group-hover:scale-150 transition-all"></span>
                        Type: {filterSubcategory}
                      </span>
                    )}
                    {filterStatus && (
                      <span className="px-4 py-2 bg-luxury-gold/5 border border-luxury-gold/20 text-luxury-gold text-[10px] font-black uppercase tracking-[0.1em] rounded-xl flex items-center gap-2 group transition-all hover:bg-luxury-gold/10">
                        <span className="w-1 h-1 rounded-full bg-luxury-gold group-hover:scale-150 transition-all"></span>
                        For {filterStatus === 'rent' ? 'Rent' : 'Sale'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-500/5 border border-red-500/10 hover:bg-red-500 hover:text-white hover:border-transparent rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 cursor-pointer shadow-lg shadow-red-500/5 group"
                  >
                    <XCircle size={14} className="group-hover:rotate-90 transition-transform duration-500" /> 
                    Reset View
                  </button>
                </motion.div>
              )}

              {/* Normalized Luxury Grid Layout */}
              {allProperties.length === 0 ? (
                <div className="text-center py-24 bg-white/[0.01] border border-white/5 rounded-2xl text-white/40 font-display text-xs uppercase tracking-widest backdrop-blur-md flex flex-col items-center justify-center gap-4">
                  <p>No matching active properties found.</p>
                  <button
                    onClick={handleResetFilters}
                    className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-[#C5A059] hover:text-black rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Show All Properties
                  </button>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 items-stretch justify-center">
                    {displayedProperties.map(property => (
                      <div key={property.id} className="flex h-full">
                        <PropertyCard property={property} />
                      </div>
                    ))}
                  </div>

                  {/* Desktop / Tab Pagination controls */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 pt-12">
                      <button 
                        onClick={handleResetFilters} 
                        className="flex items-center gap-2 px-10 py-4 bg-luxury-gold text-luxury-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-white hover:text-luxury-black transition-all duration-500 w-full sm:w-auto justify-center shadow-2xl shadow-luxury-gold/20 cursor-pointer group"
                      >
                        <span className="group-hover:mr-2 transition-all">Explore Marketplace</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setCurrentPage(p => Math.max(1, p - 1));
                            propertiesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          disabled={safeCurrentPage === 1}
                          className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 text-white/70 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        
                        <div className="text-[10px] font-mono uppercase tracking-widest text-white/30 px-4">
                          <span className="text-white font-black">{safeCurrentPage}</span> <span className="mx-2">/</span> <span className="text-white/60">{totalPages}</span>
                        </div>

                        <button
                          onClick={() => {
                            setCurrentPage(p => Math.min(totalPages, p + 1));
                            propertiesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          disabled={safeCurrentPage === totalPages}
                          className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 text-white/70 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Vehicles Section */}
          <section className="py-16 border-b border-white/5 relative">
            <div className="container mx-auto px-4 relative z-10">
              <h2 className="text-2xl font-display font-medium text-white tracking-tight mb-10">Active Vehicles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {vehicles.filter(v => (v.status === 'active') || (v.status === 'approved' && v.visibility === 'public')).map(vehicle => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle as VehicleListing} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <LatestNews />
    </div>
  );
}
