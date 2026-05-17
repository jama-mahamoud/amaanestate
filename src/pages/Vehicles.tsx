import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, MapPin, Loader2, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VehicleCard from '@/components/VehicleCard';
import EmptyState from '@/components/EmptyState';
import { motion, AnimatePresence } from 'motion/react';
import { useListings } from '@/hooks/useListings';
import { ListingCategory, ListingType, VehicleListing } from '@/types';

export default function Vehicles() {
  const [currentCategory, setCurrentCategory] = useState('All');
  const [currentType, setCurrentType] = useState('All');

  const filters = useMemo(() => ({
    category: 'vehicle' as ListingCategory,
    listingType: currentType !== 'All' ? currentType as ListingType : undefined,
    limit: 12
  }), [currentType]);

  const { listings, loading, error, hasMore, loadMore, refresh } = useListings(filters);

  const filteredVehicles = useMemo(() => {
    if (currentCategory === 'All') return listings;
    return listings.filter(v => v.subcategory === currentCategory);
  }, [listings, currentCategory]);

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
        <div className="glass-card p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] mb-12 md:mb-20 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={22} />
              <Input 
                placeholder="Search the fleet... (e.g. Land Cruiser)" 
                className="bg-white/5 border-0 h-14 md:h-16 pl-14 md:pl-16 rounded-xl md:rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/30 text-base md:text-lg w-full"
              />
            </div>
            
            <div className="flex bg-white/5 rounded-xl md:rounded-2xl p-1.5 border border-white/5 w-fit">
              {['All', 'sale', 'rent'].map(type => (
                <button 
                  key={type}
                  onClick={() => setCurrentType(type)}
                  className={`h-11 md:h-12 px-6 md:px-8 rounded-lg md:rounded-xl text-[9px] md:text-[10px] uppercase font-bold tracking-widest transition-all ${
                    currentType === type ? 'bg-luxury-gold text-luxury-black shadow-lg shadow-luxury-gold/10' : 'hover:bg-white/5 text-white/40'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="h-0.5 bg-white/5 mb-8"></div>

          {/* Categories Bar */}
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {['All', 'SUV', 'Sedan', 'Truck', 'Lux', 'Bus'].map(cat => (
              <button
                key={cat}
                onClick={() => setCurrentCategory(cat)}
                className={`px-8 py-4 rounded-xl text-[10px] uppercase font-bold tracking-[0.15em] whitespace-nowrap border transition-all duration-300 ${
                  currentCategory === cat 
                    ? 'bg-luxury-gold border-luxury-gold text-luxury-black shadow-lg shadow-luxury-gold/10' 
                    : 'bg-white/5 border-transparent text-white/30 hover:text-white hover:bg-white/10'
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
