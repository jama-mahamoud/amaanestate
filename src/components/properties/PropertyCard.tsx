import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BedDouble, Bath, Square, MapPin, Sparkles, ArrowUpRight } from 'lucide-react';
import { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const {
    id,
    title,
    price,
    currency,
    location,
    propertyType,
    listingType,
    bedrooms,
    bathrooms,
    area,
    images,
    featured,
    status
  } = property;

  // Render a clean fallback image if the images array is empty or corrupt
  const coverImage = images && images.length > 0 
    ? images[0] 
    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat().format(p);
  };

  // Capitalize strings for neat display
  const capitalize = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col h-full bg-[#0c0c14] border border-white/[0.04] hover:border-cyan-500/30 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/[0.02]"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
        <img
          src={coverImage}
          alt={title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Replace with fallback on error
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className={`px-2.5 py-1 text-xxs font-semibold uppercase tracking-wider rounded-md text-white ${
            listingType === 'sale' ? 'bg-blue-600' : 'bg-emerald-600'
          }`}>
            For {capitalize(listingType)}
          </span>
          {featured && (
            <span className="px-2.5 py-1 text-xxs font-semibold uppercase tracking-wider rounded-md bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 flex items-center gap-1">
              <Sparkles size={10} />
              <span>Featured</span>
            </span>
          )}
        </div>

        {/* Price Badge on Thumbnail bottom */}
        <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#050508]/80 backdrop-blur-md border border-white/[0.04] text-sm font-bold text-white z-10">
          {formatPrice(price)} <span className="text-xxs font-medium text-neutral-400">{currency}</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
        
        <div className="space-y-2">
          {/* Property Type Label */}
          <span className="text-xxs uppercase tracking-widest text-cyan-400 font-mono font-semibold">
            {propertyType === 'land' ? 'Land Parcel' : capitalize(propertyType)}
          </span>

          {/* Title linking to Details */}
          <Link to={`/properties/${id}`} className="block">
            <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 leading-tight flex items-start justify-between">
              <span>{title}</span>
              <ArrowUpRight size={16} className="text-neutral-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0 ml-2" />
            </h3>
          </Link>

          {/* Location Info */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <MapPin size={13} className="text-neutral-500 flex-shrink-0" />
            <span className="line-clamp-1">
              {location.district ? `${location.district}, ` : ''}
              {location.city}
            </span>
          </div>
        </div>

        {/* Spec Icons (Bed, Bath, Area) */}
        {propertyType !== 'land' && (bedrooms !== undefined || bathrooms !== undefined || area !== undefined) && (
          <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-white/[0.01] border border-white/[0.03] rounded-lg text-neutral-400 text-xxs font-medium">
            {bedrooms !== undefined && (
              <div className="flex items-center gap-1.5 justify-center">
                <BedDouble size={14} className="text-neutral-500" />
                <span>{bedrooms} Beds</span>
              </div>
            )}
            {bathrooms !== undefined && (
              <div className="flex items-center gap-1.5 justify-center">
                <Bath size={14} className="text-neutral-500" />
                <span>{bathrooms} Baths</span>
              </div>
            )}
            {area !== undefined && (
              <div className="flex items-center gap-1.5 justify-center">
                <Square size={12} className="text-neutral-500" />
                <span>{area} m²</span>
              </div>
            )}
          </div>
        )}

        {/* Land-Specific Spec Row */}
        {propertyType === 'land' && area !== undefined && (
          <div className="flex items-center gap-2 py-2.5 px-3 bg-white/[0.01] border border-white/[0.03] rounded-lg text-neutral-400 text-xxs font-medium justify-center">
            <Square size={13} className="text-neutral-500" />
            <span>Total Plot Area: {area} m²</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
