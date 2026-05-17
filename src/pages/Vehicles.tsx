import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, Grid, List as ListIcon, X, Gauge, Fuel, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import VehicleCard from '@/components/VehicleCard';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle } from '@/types';
import { Link } from 'react-router-dom';

const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    title: 'Toyota Land Cruiser V8',
    price: 120000,
    city: 'Jigjiga',
    year: 2023,
    mileage: '5,000 km',
    fuelType: 'Diesel',
    image: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&q=80&w=1000',
    type: 'sale',
    category: 'SUV',
    transmission: 'Automatic'
  },
  {
    id: 'v2',
    title: 'Mercedes-Benz G63 AMG',
    price: 245000,
    city: 'Dire Dawa',
    year: 2024,
    mileage: '1,200 km',
    fuelType: 'Petrol',
    image: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=1000',
    type: 'sale',
    category: 'Lux',
    transmission: 'Automatic'
  },
  {
    id: 'v3',
    title: 'Ford F-150 Raptor',
    price: 95000,
    city: 'Addis Ababa',
    year: 2022,
    mileage: '12,500 km',
    fuelType: 'Petrol',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1000',
    type: 'sale',
    category: 'Truck',
    transmission: 'Automatic'
  },
  {
    id: 'v4',
    title: 'Toyota Hilux Double Cab',
    price: 450,
    city: 'Jigjiga',
    year: 2021,
    mileage: '45,000 km',
    fuelType: 'Diesel',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000',
    type: 'rent',
    category: 'Truck',
    transmission: 'Manual'
  }
];

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
            <h1 className="text-6xl md:text-8xl font-display font-bold text-white tracking-tighter leading-none mb-8">
              Luxury <br /><span className="gold-text-gradient">Fleet</span>
            </h1>
            <p className="text-white/40 text-xl font-light leading-relaxed">
              Explore the Somali Region's most exclusive collection of premium SUVs, luxury sedans, and high-performance trucks.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Marketplace Shell */}
        <div className="glass-card p-6 md:p-8 rounded-[2.5rem] mb-20 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={22} />
              <Input 
                placeholder="Search the fleet... (e.g. Land Cruiser, AMG)" 
                className="bg-white/5 border-white/5 h-16 pl-16 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/30 text-lg border-0"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center bg-white/5 rounded-2xl p-1.5 border border-white/5">
                {['All', 'sale', 'rent'].map(type => (
                  <button 
                  key={type}
                  onClick={() => setCurrentType(type)}
                  className={`h-12 px-8 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all ${
                    currentType === type ? 'bg-luxury-gold text-luxury-black shadow-lg shadow-luxury-gold/10' : 'hover:bg-white/5 text-white/40'
                  }`}
                 >
                   {type}
                 </button>
                ))}
              </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredVehicles.map(vehicle => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="h-96 flex flex-col items-center justify-center text-center p-10 bg-luxury-charcoal/20 border border-white/5 rounded-[3rem]">
            <h3 className="text-2xl font-display font-bold text-white mb-2">Expanding Collection</h3>
            <p className="text-white/40 max-w-sm">We are currently curating more vehicles for this category. Please check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
