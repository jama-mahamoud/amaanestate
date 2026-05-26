import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Loader2, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VehicleCard from '@/components/VehicleCard';
import EmptyState from '@/components/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { useListings } from '@/hooks/useListings';
import { ListingCategory, ListingType, VehicleListing } from '@/types';

export default function Vehicles() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || searchParams.get('subcategory') || searchParams.get('type') || 'All';
  const currentType = searchParams.get('listingType') || 'All';
  const currentCurrency = searchParams.get('currency') || 'All';
  const [searchQuery, setSearchQuery] = useState('');

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const filters = useMemo(() => ({
    category: 'vehicle' as ListingCategory,
    listingType: currentType !== 'All' ? currentType as ListingType : undefined,
    currency: currentCurrency !== 'All' ? currentCurrency : undefined,
    limit: 12
  }), [currentType, currentCurrency]);

  const { listings, loading, error, hasMore, loadMore, refresh } = useListings(filters);

  const filteredVehicles = useMemo(() => {
    let result = listings;
    if (currentCategory !== 'All') {
      const catLower = currentCategory.toLowerCase().trim();
      const catSingular = catLower.endsWith('s') ? catLower.slice(0, -1) : catLower;
      result = result.filter(v => {
        const item = v as any;
        const sub = (item.subcategory || '').toLowerCase().trim();
        const type = (item.type || '').toLowerCase().trim();
        return sub === catLower || sub === catSingular || type === catLower || type === catSingular;
      });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => 
        v.title.toLowerCase().includes(q) || 
        v.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [listings, currentCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-luxury-black pt-28 pb-20">
      {/* Header */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-luxury-gold/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <span className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Masterpiece Mobility</span>
            <h1 className="text-4xl md:text-8xl font-display font-bold text-white tracking-tighter leading-[1.1] md:leading-none mb-6 md:mb-8">
              Luxury <br /><span className="gold-text-gradient">Fleet</span>
            </h1>
            <p className="text-white/40 text-lg md:text-xl font-light leading-relaxed max-w-xl">
              Explore the Somali Region's most exclusive collection of premium SUVs, luxury sedans, and high-performance trucks.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Marketplace Shell */}
        <div className="glass-card p-4 md:p-6 rounded-[2rem] md:rounded-full mb-8 md:mb-16 shadow-2xl overflow-hidden border-white/5">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={20} />
              <Input 
                placeholder="Search the fleet..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border-0 h-12 md:h-14 pl-14 rounded-xl md:rounded-full text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/20 text-sm w-full transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              <div className="flex bg-white/5 rounded-xl md:rounded-full p-1 border border-white/5 shrink-0">
                {['All', 'sale', 'rent'].map(type => (
                  <button 
                    key={type}
                    onClick={() => updateFilter('listingType', type)}
                    className={`h-9 md:h-11 px-6 md:px-7 rounded-lg md:rounded-full text-[9px] uppercase font-bold tracking-widest transition-all whitespace-nowrap ${
                      currentType === type ? 'bg-luxury-gold text-black shadow-lg shadow-luxury-gold/20' : 'hover:bg-white/5 text-white/40'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="flex bg-white/5 rounded-xl md:rounded-full p-1 border border-white/5 shrink-0">
                {['All', 'ETB', 'USD'].map(cur => (
                  <button 
                    key={cur}
                    onClick={() => updateFilter('currency', cur)}
                    className={`h-9 md:h-11 px-5 md:px-6 rounded-lg md:rounded-full text-[9px] uppercase font-bold tracking-widest transition-all whitespace-nowrap ${
                      currentCurrency === cur ? 'bg-luxury-gold text-black shadow-lg shadow-luxury-gold/20' : 'hover:bg-white/5 text-white/40'
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden md:block h-[1px] bg-white/5 my-4"></div>

          {/* Categories Bar */}
          <div className="flex gap-2 overflow-x-auto pt-4 md:pt-0 pb-1 no-scrollbar scroll-smooth">
            {['All', 'SUV', 'Sedan', 'Truck', 'Lux', 'Bus'].map(cat => (
              <button
                key={cat}
                onClick={() => updateFilter('category', cat)}
                className={`shrink-0 px-6 py-2.5 rounded-lg md:rounded-full text-[9px] uppercase font-bold tracking-[0.15em] whitespace-nowrap border transition-all duration-300 ${
                  currentCategory.toLowerCase() === cat.toLowerCase() 
                    ? 'bg-luxury-gold border-luxury-gold text-black shadow-md shadow-luxury-gold/10' 
                    : 'bg-white/5 border-white/5 text-white/30 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-12 px-4">
           <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">
             Discovered <span className="text-white">{filteredVehicles.length}</span> Masterpieces
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {loading && !listings.length ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 animate-pulse">
              <Loader2 className="w-12 h-12 text-luxury-gold animate-spin mb-4" />
              <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">Consulting Fleet Records...</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="col-span-full">
              <EmptyState 
                title="Fleet Expanding" 
                description={error ? "Our fleet database is currently experiencing an authentication anomaly." : "No vehicles match your current specifications. Experience tells us that excellence is worth the search."} 
                icon={<Car size={48} />}
                actionLabel={error ? "Retry Connection" : undefined}
                onAction={error ? refresh : undefined}
              />
            </div>
          ) : (
            <>
              {filteredVehicles.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle as VehicleListing} />
              ))}
              
              {hasMore && (
                <div className="col-span-full mt-20 flex justify-center">
                  <Button 
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                    className="border-white/10 text-white/40 hover:text-luxury-gold hover:border-luxury-gold px-12 h-14 rounded-xl text-[10px] uppercase font-bold tracking-widest"
                  >
                    {loading ? 'Consulting Records...' : 'Load More Vehicles'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
