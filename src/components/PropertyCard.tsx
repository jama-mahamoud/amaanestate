import React, { memo, useState, useEffect } from 'react';
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
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import { usePropertyModal } from '@/contexts/PropertyModalContext';
import { brokerService } from '@/services/brokerService';

interface PropertyCardProps {
  property: any;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

// Global cache for broker details on list rendering to conserve Firestore reads
const brokerCache = new Map<string, any>();

const PropertyCard = memo(({ property, isHovered, onMouseEnter, onMouseLeave }: PropertyCardProps) => {
  const { openPropertyModal } = usePropertyModal();
  const isVehicle = (property.category || '').toString().toLowerCase().trim() === 'vehicle';
  
  const [broker, setBroker] = useState<any>(null);
  const [brokerLoading, setBrokerLoading] = useState(false);

  useEffect(() => {
    const brokerId = property.associatedBrokerId || property.ownerId;
    if (!brokerId || isVehicle) return;
    
    if (brokerCache.has(brokerId)) {
      setBroker(brokerCache.get(brokerId));
      return;
    }
    
    let active = true;
    setBrokerLoading(true);
    brokerService.getBroker(brokerId)
      .then((data) => {
        if (data) {
          brokerCache.set(brokerId, data);
          if (active) setBroker(data);
        }
      })
      .catch((err) => console.warn('Error fetching broker for card:', err))
      .finally(() => {
        if (active) setBrokerLoading(false);
      });
      
    return () => {
      active = false;
    };
  }, [property.associatedBrokerId, property.ownerId, isVehicle]);

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

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);

  return (
    <motion.div
      id={`property-card-${property.id}`}
      initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      whileInView={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      viewport={isMobile ? undefined : { once: true }}
      transition={isMobile ? { duration: 0 } : undefined}
      className="group h-full"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link 
        to={targetLink}
        className="block h-full"
        onClick={(e) => {
          if (!isVehicle) {
            e.preventDefault();
            openPropertyModal(property);
          }
        }}
      >
        <div className="bg-super-charcoal border border-white/10 rounded-[2rem] overflow-hidden flex flex-col h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group-hover:border-emerald-500/30">
          {/* Main Visual Image Block */}
          <div className="aspect-[4/3] overflow-hidden relative">
            <img 
              src={mainImage} 
              alt={property.title} 
              loading="lazy"
              width={400}
              height={300}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Elegant glassmorphism badges over image */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
              <span className={`text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 md:backdrop-blur-md rounded-full shadow-sm border ${
                property.listingType === 'sale' 
                  ? 'bg-emerald-600/90 text-white border-emerald-500/20' 
                  : 'bg-white/90 text-super-black border-white/10'
              }`}>
                {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
              
              {property.isVerified && (
                <span className="bg-emerald-500/90 text-white md:backdrop-blur-md flex items-center gap-1 rounded-full px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold shadow-sm">
                  <ShieldCheck size={10} className="text-white" />
                  <span>Verified</span>
                </span>
              )}
            </div>
          </div>
          
          {/* Property Details Content Area */}
          <div className="p-6 md:p-8 flex-1 flex flex-col">
            <div className="mb-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider font-sans">
                  {property.subcategory || (isVehicle ? 'Premium Vehicle' : 'Exclusive Property')}
                </span>
                <span className="text-[10px] text-white/40 font-medium">{property.city}</span>
              </div>
              
              <h3 className="text-lg md:text-xl font-display font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 mb-2">
                {property.title}
              </h3>

              <div className="flex items-center text-white/40 text-xs mb-6 font-sans">
                <MapPin size={12} className="mr-1.5 text-white/30" />
                <span className="line-clamp-1 truncate">{property.location}</span>
              </div>

              {/* Specifications Area */}
              {isVehicle ? (
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10 mb-6">
                  {(property.year || property.metadata?.year) && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full">
                      <Calendar size={12} className="text-white/40" />
                      <span className="text-[10px] font-bold text-white/60">{property.year || property.metadata?.year}</span>
                    </div>
                  )}
                  {(property.mileage || property.metadata?.mileage) && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full">
                      <Gauge size={12} className="text-white/40" />
                      <span className="text-[10px] font-bold text-white/60">{property.mileage || property.metadata?.mileage} km</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10 mb-6">
                  {bedsVal && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full">
                      <BedDouble size={14} className="text-white/40" />
                      <span className="text-[10px] font-bold text-white/60">{bedsVal} {Number(bedsVal) > 1 ? 'Beds' : 'Bed'}</span>
                    </div>
                  )}
                  {bathsVal && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full">
                      <Bath size={14} className="text-white/40" />
                      <span className="text-[10px] font-bold text-white/60">{bathsVal} {Number(bathsVal) > 1 ? 'Baths' : 'Bath'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Listed By / Partner Agent Section */}
              {!isVehicle && (
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2.5">
                  {broker ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden text-[9px] font-black text-emerald-400 shrink-0">
                        {broker.profilePhotoUrl ? (
                          <img src={broker.profilePhotoUrl} className="w-full h-full object-cover" alt={broker.fullName} referrerPolicy="no-referrer" />
                        ) : (
                          broker.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] text-emerald-400 block leading-none font-black tracking-widest uppercase mb-0.5">Verified Partner Agent</span>
                        <span className="text-xs text-white/90 group-hover:text-[#C5A059] transition-colors font-bold block truncate leading-none">
                          {broker.fullName}
                        </span>
                      </div>
                    </>
                  ) : property.extAgentName ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center overflow-hidden text-[9px] font-black text-luxury-gold shrink-0">
                        {property.extProfileImageUrl ? (
                          <img src={property.extProfileImageUrl} className="w-full h-full object-cover" alt={property.extAgentName} referrerPolicy="no-referrer" />
                        ) : (
                          property.extAgentName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <span className="text-[8px] text-luxury-gold block leading-none font-black tracking-widest uppercase mb-0.5">
                          {property.extAgencyName ? 'Marketed By' : 'Partner Agent'}
                        </span>
                        <span className="text-xs text-white/90 font-bold block truncate leading-none" title={`${property.extAgentName}${property.extAgencyName ? ` (${property.extAgencyName})` : ''}`}>
                          {property.extAgentName} {property.extAgencyName ? `(${property.extAgencyName})` : ''}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded-full bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center text-[9px] font-black text-luxury-gold shrink-0">
                        AE
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] text-white/30 block leading-none font-bold tracking-widest uppercase mb-0.5">Listed By</span>
                        <span className="text-xs text-white/70 font-bold block truncate leading-none">
                          Amaan Premium Agent
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Elegant footer */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-white tracking-tight">
                  {displayPrice}
                </p>
              </div>
              
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                <ArrowRight size={16} />
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
