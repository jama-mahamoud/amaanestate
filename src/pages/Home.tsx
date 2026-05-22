import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HomeSearch from '@/components/HomeSearch';
import LatestNews from '@/components/LatestNews';
import PropertyCard from '@/components/PropertyCard';
import VehicleCard from '@/components/VehicleCard';
import { listingRepository } from '@/services/listingRepository';
import { Listing, VehicleListing } from '@/types';
import { 
  Loader2, 
  Home as HomeIcon, 
  Compass, 
  Key, 
  Building, 
  Car, 
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
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  const [searchParams] = useSearchParams();

  // Home-page state based filtering to completely avoid navigating to a secondary marketplace filter page
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterSubcategory, setFilterSubcategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>(''); // 'rent' or 'sale'
  const [currentPage, setCurrentPage] = useState(1);

  const propertiesSectionRef = useRef<HTMLDivElement>(null);

  // Synchronize URL search parameters onto homepage filters for seamless header menu/navigation links
  useEffect(() => {
    const cityParam = searchParams.get('city') || '';
    const subcatParam = searchParams.get('subcategory') || searchParams.get('category') || '';
    const statusParam = searchParams.get('status') || searchParams.get('listingType') || '';

    // Only apply if parameters are defined
    if (cityParam || subcatParam || statusParam) {
      if (cityParam) setFilterCity(cityParam);
      if (subcatParam && subcatParam.toLowerCase() !== 'vehicle') setFilterSubcategory(subcatParam);
      if (statusParam) setFilterStatus(statusParam === 'rent' || statusParam === 'rented' ? 'rent' : 'sale');
      
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
      (item.status === "active") &&
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
    if (filters.status) {
      setFilterStatus(filters.status === 'rented' ? 'rent' : 'sale');
    } else {
      setFilterStatus('');
    }
    setCurrentPage(1);

    // Scroll smoothly to the general overview section
    setTimeout(() => {
      propertiesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // Handle Quick Category Buttons
  const handleQuickFilter = (category: string) => {
    if (category === 'vehicle') {
      navigate('/vehicles');
      return;
    }

    setFilterCity('');
    setFilterStatus('');

    if (category === 'rental') {
      setFilterSubcategory('rental');
      setFilterStatus('rent');
    } else {
      setFilterSubcategory(category);
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
    <div className="min-h-screen bg-luxury-black text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-luxury-gold/5 via-luxury-black to-luxury-black z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-display font-medium tracking-tight mb-8"
            >
              Discover <span className="text-luxury-gold">Premium</span> Assets
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/40 text-sm font-bold uppercase tracking-[0.2em]"
            >
              VERIFIED REAL ESTATE & MOBILITY SOLUTIONS
            </motion.p>
          </div>
          
          <HomeSearch onSearch={handleSearch} />

          {/* Quick Category Navigation Row */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mt-12 max-w-4xl mx-auto px-4"
          >
            {[
              { label: 'Houses', category: 'house', icon: <HomeIcon size={16} /> },
              { label: 'Land', category: 'land', icon: <Compass size={16} /> },
              { label: 'Rentals', category: 'rental', icon: <Key size={16} /> },
              { label: 'Commercial', category: 'commercial', icon: <Building size={16} /> },
              { label: 'Vehicles', category: 'vehicle', icon: <Car size={16} /> }
            ].map(cat => (
              <button 
                key={cat.label} 
                onClick={() => handleQuickFilter(cat.category)}
                className="flex items-center gap-2.5 px-6 py-3 bg-white/5 border border-white/5 hover:border-luxury-gold/30 rounded-2xl text-xs font-bold uppercase tracking-wider text-white/85 hover:text-white hover:bg-white/10 transition-all duration-300 shadow-xl cursor-pointer"
              >
                <span className="text-luxury-gold">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Vehicles Section */}
      <section className="py-16 border-b border-white/5 relative">
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-2xl font-display font-medium text-white tracking-tight mb-10">Active Vehicles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicles.filter(v => v.status === 'active').map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle as VehicleListing} />
            ))}
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

              {/* Dynamic Filter Badges & Feedback Indicator */}
              {(filterCity || filterSubcategory || filterStatus) && (
                <div className="mb-6 p-4 bg-white/[0.02] border border-white/10 rounded-xl flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-white/50">Active Filters:</span>
                    {filterCity && (
                      <span className="px-3 py-1 bg-[#C5A059]/10 border border-[#C5A059]/20 text-[#C5A059] text-[11px] font-bold uppercase rounded-lg">
                        City: {filterCity}
                      </span>
                    )}
                    {filterSubcategory && (
                      <span className="px-3 py-1 bg-[#C5A059]/10 border border-[#C5A059]/20 text-[#C5A059] text-[11px] font-bold uppercase rounded-lg">
                        Category: {filterSubcategory}
                      </span>
                    )}
                    {filterStatus && (
                      <span className="px-3 py-1 bg-[#C5A059]/10 border border-[#C5A059]/20 text-[#C5A059] text-[11px] font-bold uppercase rounded-lg">
                        Status: For {filterStatus === 'rent' ? 'Rent' : 'Sale'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 border border-white/10 hover:bg-[#C5A059] hover:text-black hover:border-transparent rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer"
                  >
                    <XCircle size={14} /> Clear Search
                  </button>
                </div>
              )}

              {/* Balanced Equal Sized Layout: 4 Desktop, 2 Tablet, 1 Mobile */}
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
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                    {displayedProperties.map(property => (
                      <div key={property.id} className="flex h-full">
                        <PropertyCard property={property} />
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls & CTA Bar */}
                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 pt-8">
                    {/* View All Properties / Reset Filters Golden CTA */}
                    <button 
                      onClick={handleResetFilters} 
                      className="flex items-center gap-2 px-8 py-3.5 bg-luxury-gold text-luxury-black font-bold uppercase tracking-widest text-[11px] rounded-xl hover:bg-white hover:text-luxury-black transition-all duration-300 w-full sm:w-auto justify-center shadow-lg shadow-luxury-gold/10 cursor-pointer"
                    >
                      <span>Show All Properties</span>
                      <ArrowRight size={14} />
                    </button>

                    {/* Desktop / Tab Pagination controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setCurrentPage(p => Math.max(1, p - 1));
                            propertiesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          disabled={safeCurrentPage === 1}
                          className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 text-white/70 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        
                        <div className="text-xs font-mono uppercase text-white/50 px-3">
                          Page <span className="text-white font-bold">{safeCurrentPage}</span> of <span className="text-white font-bold">{totalPages}</span>
                        </div>

                        <button
                          onClick={() => {
                            setCurrentPage(p => Math.min(totalPages, p + 1));
                            propertiesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          disabled={safeCurrentPage === totalPages}
                          className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 text-white/70 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        </>
      )}

      <LatestNews />
    </div>
  );
}
