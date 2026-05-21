import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { MapPin, BedDouble, Bath, Square, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Property } from '@/types';
import { useSettings } from '@/contexts/SettingsContext';

interface PropertyCardProps {
  property: Property;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function PropertyCard({ property, isHovered, onMouseEnter, onMouseLeave }: PropertyCardProps) {
  const { formatPriceConverted } = useSettings();
  const mainImage = property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop';
  const displayPrice = typeof property.price === 'number' 
    ? formatPriceConverted(property.price, property.currency || 'ETB') 
    : property.price;

  return (
    <motion.div
      id={`property-card-${property.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link to={`/properties/${property.id}`}>
        <div className={`glass-card rounded-[2rem] overflow-hidden flex flex-col h-full transition-all duration-350 border-1 ${
          isHovered ? 'border-[#C5A059] ring-2 ring-[#C5A059]/30 translate-y-[-4px] shadow-[#C5A059]/10' : 'border-white/5 shadow-none'
        }`}>
          <div className="aspect-[16/10] overflow-hidden relative">
            <img 
              src={mainImage} 
              alt={property.title} 
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-60"></div>
            
            <div className="absolute top-6 left-6 flex gap-2">
              <Badge className={`uppercase text-[9px] tracking-widest font-bold px-3 py-1.5 border-0 rounded-lg ${
                property.listingType === 'sale' ? 'bg-luxury-gold text-luxury-black' : 'bg-white text-luxury-black'
              }`}>
                {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
              </Badge>
              {property.isVerified && (
                <Badge className="bg-emerald-500 text-white border-0 flex items-center gap-1 rounded-lg px-2 py-1.5 text-[9px] uppercase tracking-widest font-bold">
                  <ShieldCheck size={10} /> Verified
                </Badge>
              )}
              {property.legalChecked && property.listingType === 'sale' && (
                <Badge className="bg-[#C5A059] text-black border-0 flex items-center gap-1 rounded-lg px-2 py-1.5 text-[9px] uppercase tracking-widest font-bold">
                  <ShieldCheck size={10} /> Legally Verified
                </Badge>
              )}
            </div>
          </div>
          
          <div className="p-6 md:p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <span className="text-luxury-gold font-bold text-[10px] uppercase tracking-[0.2em] mb-2 block">
                  {property.subcategory || 'Premium Property'}
                </span>
                <h3 className="text-xl font-display font-bold text-white group-hover:text-luxury-gold transition-colors line-clamp-1">
                  {property.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center text-white/40 text-xs mb-8">
              <MapPin size={12} className="mr-2 text-luxury-gold" />
              <span className="line-clamp-1">{property.city}, {property.location}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5 mb-8">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Beds</span>
                <div className="flex items-center gap-2">
                  <BedDouble size={14} className="text-luxury-gold" />
                  <span className="text-sm font-bold text-white/80">{property.beds || '-'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Baths</span>
                <div className="flex items-center gap-2">
                  <Bath size={14} className="text-luxury-gold" />
                  <span className="text-sm font-bold text-white/80">{property.baths || '-'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Area</span>
                <div className="flex items-center gap-2">
                  <Square size={14} className="text-luxury-gold" />
                  <span className="text-sm font-bold text-white/80">{property.size || '-'}</span>
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
}
