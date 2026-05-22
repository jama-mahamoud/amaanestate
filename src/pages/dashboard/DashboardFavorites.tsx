import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Building2, Car, MapPin, ArrowUpRight } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

export default function DashboardFavorites() {
  const { listings, loading } = useListings({ limit: 8 });

  const mockFavorites = useMemo(() => {
    // Return first 3 mixed properties/vehicles as user "bookmarks"
    return listings.slice(0, 3);
  }, [listings]);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-display font-bold mb-2 tracking-tight">Saved <span className="text-white/20">Assets</span></h1>
        <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em]">Curated Regional Portfolio & Watching List</p>
      </div>

      <div className="glass-card rounded-[3.5rem] p-12 overflow-hidden relative shadow-2xl min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-pulse">
            <Heart className="w-12 h-12 text-luxury-gold animate-bounce mb-4" />
            <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">Querying Bookmarked Assets...</p>
          </div>
        ) : mockFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockFavorites.map((item: any, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="group border border-white/5 bg-white/[0.01] rounded-[2rem] p-6 hover:border-luxury-gold/30 hover:scale-[1.01] transition-all duration-500 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-gold/5 blur-2xl rounded-full" />
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 bg-white/5">
                  <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=400'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 w-9 h-9 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-luxury-gold cursor-pointer hover:bg-luxury-gold hover:text-black transition-colors">
                    <Heart size={14} className="fill-current" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-black tracking-widest bg-white/10 text-white/70 px-3 py-1 rounded-full">
                      {item.category === 'vehicle' ? 'Vehicle 🚘' : 'Property 🏢'}
                    </span>
                    <span className="text-[9px] uppercase font-black tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-2.5 py-1 rounded-full">
                      Active Watch
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-display font-bold text-white mb-1 group-hover:text-luxury-gold transition-colors truncate">{item.title}</h3>
                    <div className="flex items-center gap-1.5 text-white/30 text-[10px] font-bold uppercase tracking-wider">
                      <MapPin size={10} className="text-luxury-gold" /> {item.city}
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-2">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-white/30 block mb-0.5">Asset Cost</span>
                      <p className="text-xl font-display font-bold text-[#C5A059]">{formatPrice(item.price, item.currency)}</p>
                    </div>
                    <Button asChild className="bg-white/5 text-white hover:bg-[#C5A059] hover:text-black h-11 px-5 rounded-xl font-bold uppercase tracking-widest text-[9px]">
                      <Link to={`/${item.category === 'vehicle' ? 'vehicles' : 'properties'}/${item.id}`}>
                        Inspect <ArrowUpRight size={12} className="ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 max-w-sm mx-auto space-y-6">
            <Heart size={44} className="text-[#C5A059] mx-auto opacity-30 animate-pulse" />
            <h3 className="text-xl font-bold font-display text-white">Your list of Watching Assets is vacant</h3>
            <p className="text-white/40 text-xs leading-relaxed">
              Explore listings across our system, and save favorites to oversee acquisitions and pricing shifts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
