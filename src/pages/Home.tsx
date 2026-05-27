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
  XCircle
} from 'lucide-react';
import { ListingFilter } from '@/services/listingService';
import { Link } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useSettings();
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
    const propertiesList = allListings.filter(item => item.category === "property");
    const vehiclesList = allListings.filter(item => item.category === "vehicle");
    
    // Visibility and basic validation filters
    const visible = propertiesList.filter(
      item =>
        (item.status === "ACTIVE" || (item as any).visibility === "public" || (item as any).approved === true)
    );
    
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
    return visibleProperties.filter(item => {
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
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#C5A059]/5 blur-[120px] rounded-full" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-[#C5A059]/3 blur-[100px] rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-8"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Verified Real Estate Marketplace</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-7xl font-display text-white mb-6 leading-[1.1] tracking-tight"
            >
              Find your next home in <span className="gold-text-gradient font-bold text-[#C5A059]">Somalia & Ethiopia</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/60 mb-12 max-w-2xl"
            >
              The most trusted marketplace for verified properties and vehicles across the region. Transparent, secure, and professional.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
            >
              <Link
                to="/properties"
                onClick={scrollToListings}
                className="w-full sm:w-auto px-10 py-4 text-center text-sm font-bold text-black bg-[#C5A059] hover:bg-white transition-all rounded-2xl shadow-xl shadow-[#C5A059]/10 hover:-translate-y-0.5 animate-pulse"
              >
                Browse Marketplace
              </Link>

              <Link
                to="/list-property"
                className="w-full sm:w-auto px-10 py-4 text-center text-sm font-bold text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all rounded-2xl hover:-translate-y-0.5"
              >
                List your Property
              </Link>
            </motion.div>
          </div>

          <div className="w-full max-w-5xl mx-auto mt-16 md:mt-24">
            <HomeSearch onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Main Listings Body */}
      <section ref={propertiesSectionRef} className="py-24 bg-super-black scroll-mt-24 border-t border-white/5">
        <div className="container mx-auto px-4">
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
              className="flex flex-wrap items-center gap-3 mb-12"
            >
              {filterCity && (
                <span className="premium-pill bg-white/5 text-white border border-white/10 flex items-center gap-2">
                  City: {filterCity}
                </span>
              )}
              {filterSubcategory && (
                <span className="premium-pill bg-white/5 text-white border border-white/10 flex items-center gap-2">
                  Type: {filterSubcategory}
                </span>
              )}
              {filterStatus && (
                <span className="premium-pill bg-white/5 text-white border border-white/10 flex items-center gap-2">
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

          {allProperties.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-[2rem] text-white/40">
              <p className="font-display">No matching properties found.</p>
              <button
                onClick={handleResetFilters}
                className="mt-4 text-xs font-bold text-white hover:underline"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="space-y-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                {vehicles.filter(v => v.status === 'ACTIVE' || (v as any).visibility === 'public').length} SHIELD-VERIFIED FLEET
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {vehicles.filter(v => v.status === 'ACTIVE' || (v as any).visibility === 'public').slice(0, 4).map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle as VehicleListing} />
            ))}
          </div>
        </div>
      </section>

      <LatestNews />
    </div>
  );
}
