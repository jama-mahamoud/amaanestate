import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Gauge, Fuel, Calendar, ArrowRight, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
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
      className="group"
    >
      <Link to={`/vehicles/${vehicle.id}`}>
        <div className="glass-card rounded-[2rem] overflow-hidden flex flex-col h-full">
          <div className="aspect-[16/10] overflow-hidden relative">
            <img 
              src={mainImage} 
              alt={vehicle.title} 
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-60"></div>
            
            <div className="absolute top-6 left-6 flex gap-2">
              <Badge className={`uppercase text-[9px] tracking-widest font-bold px-3 py-1.5 border-0 rounded-lg ${
                vehicle.listingType === 'sale' ? 'bg-luxury-gold text-luxury-black' : 'bg-white text-luxury-black'
              }`}>
                {vehicle.listingType === 'sale' ? 'For Sale' : 'For Rent'}
              </Badge>
            </div>
          </div>
          
          <div className="p-6 md:p-8 flex-1 flex flex-col">
            <div className="mb-6">
              <span className="text-luxury-gold font-bold text-[10px] uppercase tracking-[0.2em] mb-2 block">
                {vehicle.subcategory || 'Elite Automotive'}
              </span>
              <h3 className="text-xl font-display font-bold text-white group-hover:text-luxury-gold transition-colors line-clamp-1 mb-2">
                {vehicle.title}
              </h3>
              <p className="text-white/40 text-xs flex items-center gap-2">
                <MapPin size={12} className="text-luxury-gold" /> {vehicle.city}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5 mb-8">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Year</span>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-luxury-gold" />
                  <span className="text-sm font-bold text-white/80">{vehicle.year || '-'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Mileage</span>
                <div className="flex items-center gap-2">
                  <Gauge size={14} className="text-luxury-gold" />
                  <span className="text-sm font-bold text-white/80">{vehicle.mileage || '-'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Fuel</span>
                <div className="flex items-center gap-2">
                  <Fuel size={14} className="text-luxury-gold" />
                  <span className="text-sm font-bold text-white/80 capitalize">{vehicle.fuelType || '-'}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-auto flex items-center justify-between">
              <p className="text-2xl font-display font-bold text-white group-hover:gold-text-gradient transition-all duration-500">
                {displayPrice}
              </p>
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white group-hover:bg-luxury-gold group-hover:border-luxury-gold group-hover:text-luxury-black transition-all duration-500">
                <ArrowRight size={18} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export default VehicleCard;
