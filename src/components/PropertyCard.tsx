import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  BedDouble, 
  Bath, 
  Square, 
  ArrowRight, 
  ShieldCheck, 
  Calendar, 
  Gauge, 
  Fuel, 
  Car, 
  Settings 
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice } from '@/lib/utils';
import { usePropertyModal } from '@/contexts/PropertyModalContext';
import React, { memo } from 'react';

interface PropertyCardProps {
  property: any;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const PropertyCard = memo(({ property, isHovered, onMouseEnter, onMouseLeave }: PropertyCardProps) => {
  const { openPropertyModal } = usePropertyModal();
  const isVehicle = (property.category || '').toString().toLowerCase().trim() === 'vehicle';
  
  const mainImage = property.images?.[0] || (isVehicle 
    ? 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070&auto=format&fit=crop'
    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop'
  );

  const displayPrice = property.price 
    ? formatPrice(property.price, property.currency || 'ETB') 
    : 'Contact for price';

  const targetLink = isVehicle ? `/vehicles/${property.id}` : `/properties/${property.id}`;

  // Extract metadata and specs safely
  const bedsVal = property.beds || property.features?.beds;
  const bathsVal = property.baths || property.features?.baths;
  const sizeVal = property.size || property.features?.size;
  
  // Extract amenities/features to render as premium chips
  const amenities: string[] = [];
  if (property.features) {
    if (property.features.wifi) amenities.push('WiFi');
    if (property.features.security || property.features.securitySystem) amenities.push('Security');
    if (property.features.water || property.features.waterAccess) amenities.push('Water');
    if (property.features.balcony) amenities.push('Balcony');
    if (property.features.garage || property.features.parking) {
      amenities.push('Garage');
    }
    if (property.features.furnished) amenities.push('Furnished');
    if (property.features.airConditioning) amenities.push('A/C');
    if (property.features.electricity || property.features.electricityNearby) amenities.push('Power');
    if (property.features.garden) amenities.push('Garden');
  }

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
      <Link 
        to={targetLink}
        onClick={(e) => {
          if (!isVehicle) {
            e.preventDefault();
            openPropertyModal(property);
          }
        }}
      >
        <div className={`bg-neutral-900/40 backdrop-blur-2xl rounded-3xl overflow-hidden flex flex-col h-full transition-all duration-300 border-1 ${
          isHovered 
            ? 'border-luxury-gold/40 ring-2 ring-luxury-gold/5 translate-y-[-6px] shadow-[0_25px_50px_rgba(197,160,89,0.06)] bg-neutral-900/60' 
            : 'border-white/5 shadow-2xl shadow-black/40'
        }`}>
          {/* Main Visual Image Block */}
          <div className="aspect-video overflow-hidden relative">
            <img 
              src={mainImage} 
              alt={property.title} 
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Elegant vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-black/30 opacity-85"></div>
            
            {/* Elegant glassmorphism badges over image */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-wrap gap-1 md:gap-1.5 z-10">
              <span className={`text-[8px] sm:text-[9px] uppercase tracking-widest font-black px-2 py-1 sm:px-3 sm:py-1.5 backdrop-blur-md rounded-lg shadow-md border ${
                property.listingType === 'sale' 
                  ? 'bg-luxury-gold/95 border-luxury-gold/20 text-black' 
                  : 'bg-white/95 border-white/20 text-black'
              }`}>
                {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
              
              {property.isVerified && (
                <span className="bg-emerald-500/80 hover:bg-emerald-500 backdrop-blur-md text-white border border-emerald-500/40 flex items-center gap-1 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 text-[8px] sm:text-[9px] uppercase tracking-widest font-bold transition-all duration-300 shadow-md">
                  <ShieldCheck size={10} className="text-emerald-200" />
                  <span>Verified</span>
                </span>
              )}
              
              {property.legalChecked && property.listingType === 'sale' && (
                <span className="bg-luxury-gold/15 backdrop-blur-md text-luxury-gold border border-luxury-gold/30 flex items-center gap-1 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 text-[8px] sm:text-[9px] uppercase tracking-widest font-bold shadow-md">
                  <ShieldCheck size={10} /> 
                  <span>Authenticated</span>
                </span>
              )}
            </div>
          </div>
          
          {/* Property Details Content Area */}
          <div className="p-4.5 sm:p-5 md:p-6 lg:p-7 flex-1 flex flex-col justify-between">
            <div>
              {/* Category / Subtitle */}
              <div className="flex justify-between items-center mb-1">
                <span className="text-luxury-gold font-bold text-[8px] sm:text-[9px] uppercase tracking-[0.25em] font-sans">
                  {property.subcategory || (isVehicle ? 'Elite Automobile' : 'Premium Property')}
                </span>
              </div>
              
              {/* Main Title heading */}
              <h3 className="text-[15px] sm:text-[17px] md:text-lg font-display font-medium text-white group-hover:text-luxury-gold leading-snug transition-colors line-clamp-1 mb-1.5">
                {property.title}
              </h3>

              {/* Geo-location metadata block */}
              <div className="flex items-center text-white/50 text-[11px] sm:text-xs mb-3.5 font-sans">
                <MapPin size={10} className="mr-1 text-luxury-gold/80" />
                <span className="line-clamp-1 truncate font-light">{property.city}, {property.location}</span>
              </div>

              {/* Clean specification rows: replacing raw, messy emoji cells */}
              {isVehicle ? (
                <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-[11px] sm:text-xs text-white/60 mb-3.5 font-sans border-t border-white/5 pt-3">
                  {(property.year || property.metadata?.year) && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-luxury-gold/75" />
                      <span className="font-light">{property.year || property.metadata?.year}</span>
                    </span>
                  )}
                  {(property.year || property.metadata?.year) && (property.mileage || property.metadata?.mileage) && (
                    <span className="text-white/10 select-none">•</span>
                  )}
                  {(property.mileage || property.metadata?.mileage) && (
                    <span className="flex items-center gap-1">
                      <Gauge size={12} className="text-luxury-gold/75" />
                      <span className="font-light">{property.mileage || property.metadata?.mileage}</span>
                    </span>
                  )}
                  {((property.mileage || property.metadata?.mileage) && (property.fuelType || property.transmission || property.metadata?.fuelType)) && (
                    <span className="text-white/10 select-none">•</span>
                  )}
                  {(property.fuelType || property.transmission || property.metadata?.fuelType) && (
                    <span className="flex items-center gap-1">
                      <Fuel size={12} className="text-luxury-gold/75" />
                      <span className="font-light capitalize truncate max-w-[80px]">
                        {property.fuelType || property.transmission || property.metadata?.fuelType}
                      </span>
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-[11px] sm:text-xs text-white/60 mb-3.5 font-sans border-t border-white/5 pt-3">
                  {bedsVal && (
                    <span className="flex items-center gap-1">
                      <BedDouble size={13} className="text-luxury-gold/80" />
                      <span className="font-light">{bedsVal} {Number(bedsVal) > 1 ? 'Beds' : 'Bed'}</span>
                    </span>
                  )}
                  {bedsVal && bathsVal && <span className="text-white/10 select-none">•</span>}
                  {bathsVal && (
                    <span className="flex items-center gap-1">
                      <Bath size={13} className="text-luxury-gold/80" />
                      <span className="font-light">{bathsVal} {Number(bathsVal) > 1 ? 'Baths' : 'Bath'}</span>
                    </span>
                  )}
                  {(bedsVal || bathsVal) && sizeVal && <span className="text-white/10 select-none">•</span>}
                  {sizeVal && (
                    <span className="flex items-center gap-1">
                      <Square size={11} className="text-luxury-gold/80" />
                      <span className="font-light font-mono text-[10px]">{sizeVal}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Luxury feature chips section */}
                {amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3.5">
                    {amenities.slice(0, 3).map((amenity, idx) => (
                      <span 
                        key={idx} 
                        className="text-[8px] sm:text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-white/60 hover:text-white rounded-full transition-colors duration-200 select-none cursor-default"
                      >
                        {amenity}
                      </span>
                    ))}
                    {amenities.length > 3 && (
                      <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-light px-1.5 py-0.5 text-white/40 select-none">
                        +{amenities.length - 3} more
                      </span>
                    )}
                  </div>
                )}
            </div>
            
            {/* Elegant footer matching top tier sites */}
            <div className="mt-1.5 pt-3 border-t border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-widest font-bold text-white/30 block mb-0.5">ESTIMATED PRICE</span>
                <p className="text-sm sm:text-base font-semibold text-white group-hover:text-luxury-gold transition-colors duration-300">
                  {displayPrice}
                </p>
              </div>
              
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 flex items-center justify-center text-white group-hover:bg-luxury-gold group-hover:border-luxury-gold group-hover:text-luxury-black group-hover:shadow-[0_4px_15px_rgba(197,160,89,0.3)] transition-all duration-300 scale-95 group-hover:scale-100">
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;
