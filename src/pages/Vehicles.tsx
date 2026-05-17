import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, Grid, List as ListIcon, X, Gauge, Fuel, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import VehicleCard from '@/components/VehicleCard';
import EmptyState from '@/components/EmptyState';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle } from '@/types';
import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

const MOCK_VEHICLES: Vehicle[] = [];

export default function Vehicles() {
  const [currentCategory, setCurrentCategory] = useState('All');
  const [currentType, setCurrentType] = useState('All');
  
  const filteredVehicles = MOCK_VEHICLES.filter(v => {
    if (currentCategory !== 'All' && v.category !== currentCategory) return false;
    if (currentType !== 'All' && v.type !== currentType) return false;
    return true;
  });

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
              <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={20} md:size={22} />
              <Input 
                placeholder="Search the fleet... (e.g. Land Cruiser)" 
                className="bg-white/5 border-white/5 h-14 md:h-16 pl-14 md:pl-16 rounded-xl md:rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/30 text-base md:text-lg border-0 w-full"
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
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <EmptyState 
                title="Fleet Expanding" 
                description={MOCK_VEHICLES.length === 0 ? "Our automotive collection is currently under acquisition review. Verified masterpieces will appear here soon." : "No vehicles match your current specifications. Experience tells us that excellence is worth the search."} 
                icon={<Car size={48} />}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
