import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Gauge, Fuel, Calendar, ArrowRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { VehicleListing } from '@/types';
import { formatPrice } from '@/lib/utils';
import React, { memo } from 'react';

interface VehicleCardProps {
  vehicle: VehicleListing;
}

const VehicleCard = memo(({ vehicle }: VehicleCardProps) => {
  const mainImage = vehicle.images?.[0] || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070&auto=format&fit=crop';
  const displayPrice = vehicle.price 
    ? formatPrice(vehicle.price, vehicle.currency || 'ETB') 
    : 'Contact for price';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group h-full"
    >
      <Link to={`/vehicles/${vehicle.id}`} className="block h-full">
        <div className="bg-super-charcoal border border-white/10 rounded-[2rem] overflow-hidden flex flex-col h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group-hover:border-[#C5A059]/30">
          <div className="aspect-[4/3] overflow-hidden relative">
            <img 
              src={mainImage} 
              alt={vehicle.title} 
              loading="lazy"
              width={400}
              height={300}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Elegant glassmorphism dark/gold badges over image */}
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              <span className={`text-[9px] uppercase tracking-widest font-bold px-3.5 py-1.5 rounded-full border shadow-sm md:backdrop-blur-md transition-all ${
                vehicle.listingType === 'sale' 
                  ? 'bg-black/80 text-[#C5A059] border-[#C5A059]/30' 
                  : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/20'
              }`}>
                {vehicle.listingType === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
            </div>
          </div>
          
          <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
            <div className="mb-auto">
              {/* Category / Location badges */}
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 text-[9px] font-bold uppercase tracking-wider">
                  {vehicle.subcategory || 'Automotive'}
                </span>
                <span className="text-white/40 text-[10px] font-medium flex items-center gap-1">
                  <MapPin size={11} className="text-white/30" /> {vehicle.city}
                </span>
              </div>
              
              <h3 className="text-lg md:text-xl font-display font-semibold text-white group-hover:text-[#C5A059] transition-colors line-clamp-1 mb-4">
                {vehicle.title}
              </h3>
            </div>

            {/* Specifications Details inside the card */}
            <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/10 mb-6">
              <div className="flex flex-col gap-1.5 items-center text-center">
                <span className="text-[8px] uppercase tracking-widest text-white/30 font-bold">Year</span>
                <div className="flex items-center gap-1 text-white font-bold text-xs bg-white/5 px-2 py-1 rounded-xl border border-white/5 w-full justify-center">
                  <Calendar size={12} className="text-[#C5A059]" />
                  <span>{vehicle.year || '-'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 items-center text-center border-x border-white/10 px-1">
                <span className="text-[8px] uppercase tracking-widest text-white/30 font-bold">Mileage</span>
                <div className="flex items-center gap-1 text-white font-bold text-xs bg-white/5 px-2 py-1 rounded-xl border border-white/5 w-full justify-center">
                  <Gauge size={12} className="text-[#C5A059]" />
                  <span className="truncate">{vehicle.mileage || '-'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 items-center text-center">
                <span className="text-[8px] uppercase tracking-widest text-white/30 font-bold">Fuel</span>
                <div className="flex items-center gap-1 text-white font-bold text-xs bg-white/5 px-2 py-1 rounded-xl border border-white/5 w-full justify-center">
                  <Fuel size={12} className="text-[#C5A059]" />
                  <span className="capitalize">{vehicle.fuelType?.charAt(0) || '-'}</span>
                </div>
              </div>
            </div>
            
            {/* Card price and interactive indicator */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest block mb-0.5">Price</span>
                <p className="text-xl font-bold text-[#C5A059] tracking-tight">
                  {displayPrice}
                </p>
              </div>
              
              <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white group-hover:bg-[#C5A059] group-hover:text-black group-hover:border-transparent transition-all duration-300">
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export default VehicleCard;
