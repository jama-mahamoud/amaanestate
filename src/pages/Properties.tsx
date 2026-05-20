import { useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Grid, List as ListIcon, Map as MapIcon, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PropertyCard from '@/components/PropertyCard';
import { motion, AnimatePresence } from 'motion/react';
import EmptyState from '@/components/EmptyState';
import { useListings } from '@/hooks/useListings';
import { ListingCategory, ListingType, Property } from '@/types';
import MapDiscovery from '@/components/MapDiscovery';

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();
  
  const currentType = searchParams.get('listingType') || 'All';
  const currentSubcategory = searchParams.get('subcategory') || 'All';
  const currentCity = searchParams.get('city') || 'All';
  const currentCurrency = searchParams.get('currency') || 'All';

  const filters = useMemo(() => ({
    category: 'property' as ListingCategory,
    listingType: currentType !== 'All' ? currentType as ListingType : undefined,
    subcategory: currentSubcategory !== 'All' ? currentSubcategory : undefined,
    city: currentCity !== 'All' ? currentCity : undefined,
    currency: currentCurrency !== 'All' ? currentCurrency : undefined,
    limit: 25
  }), [currentType, currentSubcategory, currentCity, currentCurrency]);

  const { listings, loading, error, hasMore, loadMore, refresh } = useListings(filters);

  // Advanced AI NLP Smart Parser
  const parsedSearch = useMemo(() => {
    if (!searchQuery) return { listings: listings, report: null };

    const query = searchQuery.toLowerCase();
    let parsedCity = '';
    let parsedBedrooms: number | null = null;
    let parsedMaxPrice: number | null = null;
    let parsedListingType: 'sale' | 'rent' | null = null;
    let parsedCategory: string | null = null;

    // A. Detect premium city matches
    const citiesList = ['jigjiga', 'dire dawa', 'godey', 'dhagaxbur', 'qabridaha', 'addis ababa'];
    citiesList.forEach(city => {
      if (query.includes(city)) {
        parsedCity = city;
      }
    });

    // B. Detect bedroom constraints (e.g., "3 bedroom", "2 bed", "1 br")
    const bedMatch = query.match(/(\d+)\s*(?:bedroom|bed|br)/i);
    if (bedMatch) {
      parsedBedrooms = parseInt(bedMatch[1], 10);
    }

    // C. Detect price thresholds (e.g., "under $150,000" or "under 200k")
    const priceMatch = query.match(/(?:under|below|less than|max|budget|limit)\s*(?:\$|)\s*(\d+(?:\.\d+)?)\s*(k|million|m|)/i);
    if (priceMatch) {
      let num = parseFloat(priceMatch[1]);
      const suffix = priceMatch[2].toLowerCase();
      if (suffix === 'k') num *= 1000;
      else if (suffix === 'million' || suffix === 'm') num *= 1000000;
      parsedMaxPrice = num;
    } else {
      // Direct raw number check with context (e.g., "under 40000")
      const rawNumMatch = query.match(/(?:under|below|budget|max)\s*(\d+)/i);
      if (rawNumMatch) {
        parsedMaxPrice = parseInt(rawNumMatch[1], 10);
      }
    }

    // D. Detect listing intent (buy/sell, leasing/rent)
    if (query.includes('rent') || query.includes('lease') || query.includes('kiro')) {
      parsedListingType = 'rent';
    } else if (query.includes('sale') || query.includes('buy') || query.includes('purchase') || query.includes('gadasho') || query.includes('gadan')) {
      parsedListingType = 'sale';
    }

    // E. Detect property types/subcategories
    if (query.includes('villa') || query.includes('house') || query.includes('residential') || query.includes('guri')) {
      parsedCategory = 'Houses';
    } else if (query.includes('land') || query.includes('plot') || query.includes('farm') || query.includes('dhul')) {
      parsedCategory = 'Land';
    }

    // Filter properties dynamically
    let results = listings;

    if (parsedCity) {
      results = results.filter(l => l.city.toLowerCase() === parsedCity);
    }
    if (parsedBedrooms !== null) {
      results = results.filter(l => {
        const beds = (l as any).beds;
        return beds === parsedBedrooms;
      });
    }
    if (parsedMaxPrice !== null) {
      results = results.filter(l => l.price <= parsedMaxPrice!);
    }
    if (parsedListingType) {
      results = results.filter(l => l.listingType === parsedListingType);
    }
    if (parsedCategory) {
      results = results.filter(l => l.subcategory === parsedCategory || l.category === parsedCategory);
    }

    const hasSpecMatches = parsedCity || parsedBedrooms !== null || parsedMaxPrice !== null || parsedListingType || parsedCategory;

    // Fallback search match if no specific attributes detected
    if (!hasSpecMatches) {
      results = results.filter(l => 
        l.title.toLowerCase().includes(query) || 
        l.city.toLowerCase().includes(query) ||
        l.location.toLowerCase().includes(query)
      );
    }

    // Build the reporting dossier
    const bulletList: string[] = [];
    if (parsedCity) bulletList.push(`📍 Market: ${parsedCity.charAt(0).toUpperCase() + parsedCity.slice(1)}`);
    if (parsedCategory) bulletList.push(`🏠 Category: ${parsedCategory}`);
    if (parsedBedrooms) bulletList.push(`🛏️ Spec: ${parsedBedrooms} Bedrooms`);
    if (parsedMaxPrice) bulletList.push(`💵 Budget: Max $${parsedMaxPrice.toLocaleString()}`);
    if (parsedListingType) bulletList.push(`🔑 Service Option: ${parsedListingType === 'sale' ? 'Purchase/Sale' : 'Rent/Lease'}`);

    return {
      listings: results,
      report: bulletList.length > 0 ? { bullets: bulletList } : null
    };
  }, [listings, searchQuery]);

  // Read filtered items output
  const filteredListings = useMemo(() => {
    return parsedSearch.listings;
  }, [parsedSearch.listings]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-luxury-black pt-28 pb-20">
      {/* Header */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-luxury-gold/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-3xl">
              <nav className="flex items-center gap-3 text-white/40 text-[10px] uppercase font-bold tracking-[0.3em] mb-6">
                <Link to="/" className="hover:text-luxury-gold transition-colors">AmaanEstate</Link>
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                <span className="text-luxury-gold">Marketplace</span>
              </nav>
              <h1 className="text-4xl md:text-8xl font-display font-bold text-white tracking-tighter leading-[1.1] md:leading-none mb-6 md:mb-8">
                Premium <br /><span className="gold-text-gradient">Portfolio</span>
              </h1>
              <p className="text-white/40 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                The most exclusive real estate opportunities across the Somali Region, curated for those who seek excellence.
              </p>
            </div>
            
            <div className="flex items-center gap-6 animate-fade-in">
               <div className="flex items-center bg-white/5 p-2 rounded-2xl border border-white/5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`w-12 h-12 rounded-xl transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-luxury-gold text-luxury-black shadow-lg shadow-luxury-gold/20' : 'text-white/20 hover:text-white'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={20} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`w-12 h-12 rounded-xl transition-all cursor-pointer ${viewMode === 'list' ? 'bg-luxury-gold text-luxury-black shadow-lg shadow-luxury-gold/20' : 'text-white/20 hover:text-white'}`}
                  onClick={() => setViewMode('list')}
                >
                  <ListIcon size={20} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`w-12 h-12 rounded-xl transition-all cursor-pointer ${viewMode === 'map' ? 'bg-luxury-gold text-luxury-black shadow-lg shadow-luxury-gold/20' : 'text-white/20 hover:text-white'}`}
                  onClick={() => setViewMode('map')}
                >
                  <MapIcon size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Quick Filter Bar */}
        <div className="glass-card mb-8 p-4 md:p-6 rounded-3xl flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="flex-1 relative group border-0">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={20} />
              <Input 
                placeholder="Search properties..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border-0 h-14 pl-14 rounded-xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/30 w-full"
              />
           </div>
           
           <div className="flex gap-2 overflow-x-auto pb-0 md:pb-0">
             {['All', 'sale', 'rent'].map(type => (
               <button 
                key={type}
                onClick={() => updateFilter('listingType', type)}
                className={`h-14 px-8 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all whitespace-nowrap cursor-pointer ${
                  currentType === type ? 'bg-luxury-gold text-luxury-black' : 'hover:bg-white/5 text-white/40 border border-white/5'
                }`}
               >
                 For {type}
               </button>
             ))}
           </div>
           <Button 
             variant="outline" 
             onClick={() => setShowFilters(!showFilters)}
             className="md:hidden h-14 border-white/5 bg-white/5 text-white rounded-xl text-[10px] uppercase font-bold tracking-widest cursor-pointer"
           >
             <SlidersHorizontal size={14} className="mr-2" /> {showFilters ? 'Hide' : 'Filters'}
           </Button>
        </div>

        {/* NLP Smart Search Confirmation Dossier */}
        <AnimatePresence>
          {parsedSearch.report && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-luxury-gold/10 border border-luxury-gold/20 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-luxury-gold/20 flex items-center justify-center text-luxury-gold font-bold">
                    <Sparkles size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-bold uppercase tracking-widest">Amaan AI Semantic Search Engine</h4>
                    <span className="text-white/40 text-[10px] uppercase tracking-wide">Live natural language parser actively filtering properties</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parsedSearch.report.bullets.map((bullet, i) => (
                    <span key={i} className="text-[10px] font-bold tracking-tight bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-luxury-gold">
                      {bullet}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 shrink-0 space-y-10 lg:space-y-12 mb-12 lg:mb-0`}>
            <div>
              <h3 className="text-white text-[10px] uppercase font-bold tracking-[0.3em] mb-8 flex items-center">
                Property Category <div className="h-px flex-1 bg-white/5 ml-6"></div>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: 'All', value: 'All' },
                  { label: 'Houses', value: 'house' },
                  { label: 'Apartments', value: 'apartment' },
                  { label: 'Villas', value: 'villa' },
                  { label: 'Land', value: 'land' },
                  { label: 'Commercial', value: 'commercial' }
                ].map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => updateFilter('subcategory', cat.value)}
                    className={`flex items-center justify-between px-6 py-4 rounded-xl text-sm font-medium transition-all group ${
                      currentSubcategory === cat.value 
                        ? 'bg-luxury-gold text-luxury-black font-bold shadow-lg shadow-luxury-gold/10' 
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {cat.label}
                    <div className={`w-2 h-2 rounded-full transition-all ${currentSubcategory === cat.value ? 'bg-luxury-black' : 'bg-transparent group-hover:bg-white/20'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white text-[10px] uppercase font-bold tracking-[0.3em] mb-8 flex items-center">
                Premium Regions <div className="h-px flex-1 bg-white/5 ml-6"></div>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {['All', 'Jigjiga', 'Dire Dawa', 'Godey', 'Dhagaxbur', 'Qabridaha', 'Addis Ababa'].map((city) => (
                  <button
                    key={city}
                    onClick={() => updateFilter('city', city)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-xl text-sm font-medium transition-all group ${
                      currentCity === city 
                        ? 'bg-luxury-gold text-luxury-black font-bold shadow-lg shadow-luxury-gold/10' 
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <MapPin size={16} className={currentCity === city ? 'text-luxury-black' : 'text-luxury-gold'} />
                    {city === 'All' ? 'All Locations' : city}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white text-[10px] uppercase font-bold tracking-[0.3em] mb-8 flex items-center">
                Listing Currency <div className="h-px flex-1 bg-white/5 ml-6"></div>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {['All', 'ETB', 'USD'].map((cur) => (
                  <button
                    key={cur}
                    onClick={() => updateFilter('currency', cur)}
                    className={`flex items-center justify-between px-6 py-4 rounded-xl text-sm font-medium transition-all group ${
                      currentCurrency === cur 
                        ? 'bg-luxury-gold text-luxury-black font-bold shadow-lg shadow-luxury-gold/10' 
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{cur === 'All' ? 'All Currencies' : cur === 'ETB' ? 'Ethiopian Birr (ETB)' : 'US Dollar (USD)'}</span>
                    <div className={`w-2 h-2 rounded-full transition-all ${currentCurrency === cur ? 'bg-luxury-black' : 'bg-transparent group-hover:bg-white/20'}`} />
                  </button>
                ))}
              </div>
            </div>

            <Button 
              variant="ghost" 
              className="w-full text-white/20 hover:text-white hover:bg-white/5 rounded-xl text-[10px] uppercase font-bold tracking-widest h-14"
              onClick={clearFilters}
            >
              Clear Preferences
            </Button>
          </aside>

          {/* Main Grid / Split View mapping */}
          <div className="flex-1">
            {viewMode === 'map' ? (
              <motion.div
                key="map-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
                  {/* Listings Left Pane */}
                  <div className="w-full lg:w-[40%] flex flex-col gap-6 lg:max-h-[800px] lg:overflow-y-auto pr-2">
                    <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-4 rounded-2xl mb-2 shrink-0">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Map Grid</span>
                      <span className="text-[10px] text-luxury-gold uppercase tracking-widest font-black">{filteredListings.length} Found</span>
                    </div>
                    
                    {filteredListings.length === 0 ? (
                      <div className="py-12 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
                        <p className="text-white/40 text-xs">No active estates found matching criteria.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        {filteredListings.map((prop) => (
                          <PropertyCard 
                            key={prop.id} 
                            property={prop as Property}
                            isHovered={hoveredPropertyId === prop.id}
                            onMouseEnter={() => setHoveredPropertyId(prop.id)}
                            onMouseLeave={() => setHoveredPropertyId(null)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Map Right Sticky Pane */}
                  <div className="w-full lg:w-[60%] lg:sticky lg:top-32 h-[500px] lg:h-[800px] rounded-[2.5rem] overflow-hidden border border-white/5">
                    <MapDiscovery 
                      properties={filteredListings as unknown as Property[]} 
                      selectedCity={currentCity}
                      hoveredPropertyId={hoveredPropertyId}
                      onHoverMarker={setHoveredPropertyId}
                      onCardHighlight={(id) => {
                        setHoveredPropertyId(id);
                        const el = document.getElementById('property-card-' + id);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                {loading && !listings.length ? (
                  <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <Loader2 className="w-12 h-12 text-luxury-gold animate-spin mb-4" />
                    <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">Accessing Database...</p>
                  </div>
                ) : filteredListings.length === 0 ? (
                  <EmptyState 
                    title="No Properties Found" 
                    description={error ? "Our servers are experiencing an authentication anomaly. Please verify your connection." : "No properties are registered in this category yet."} 
                    actionLabel={error ? "Retry Access" : "View All Inventory"}
                    onAction={error ? refresh : clearFilters}
                    icon={<Search size={48} />}
                  />
                ) : (
                  <motion.div 
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className={`grid gap-6 md:gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                      {filteredListings.map((prop) => (
                        <PropertyCard 
                          key={prop.id} 
                          property={prop as Property} 
                          isHovered={hoveredPropertyId === prop.id}
                          onMouseEnter={() => setHoveredPropertyId(prop.id)}
                          onMouseLeave={() => setHoveredPropertyId(null)}
                        />
                      ))}
                    </div>

                    {hasMore && (
                      <div className="mt-20 flex justify-center">
                        <Button 
                          onClick={loadMore}
                          disabled={loading}
                          variant="outline"
                          className="border-white/10 text-white/40 hover:text-luxury-gold hover:border-luxury-gold px-12 h-14 rounded-xl text-[10px] uppercase font-bold tracking-widest cursor-pointer"
                        >
                          {loading ? 'Consulting Records...' : 'Load More Portfolio'}
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
