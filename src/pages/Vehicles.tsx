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
      <div className="border-b border-white/5 pb-12 mb-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-4">Masterpiece Mobility</p>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight mb-8">
            Luxury <span className="text-white/40">Vehicles</span>
          </h1>
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
             {['All', 'SUV', 'Sedan', 'Truck', 'Lux', 'Bus'].map(cat => (
               <Button 
                key={cat}
                variant={currentCategory === cat ? 'default' : 'outline'}
                onClick={() => setCurrentCategory(cat)}
                className={`rounded-full h-10 px-6 transition-all border-white/10 ${
                  currentCategory === cat ? 'bg-luxury-gold text-luxury-black font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
               >
                 {cat}
               </Button>
             ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
