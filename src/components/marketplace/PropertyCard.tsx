import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin } from 'lucide-react';
import { Property } from '../../types';
import {
  formatListingStatusLabel,
  formatPropertyLocation,
  formatPropertyPrice,
  formatPropertyTypeLabel,
  getPrimaryPropertyImage,
} from '../../services/propertyService';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [imageError, setImageError] = useState(false);
  const primaryImage = getPrimaryPropertyImage(property);
  const locationText = formatPropertyLocation(property);
  const formattedPrice = formatPropertyPrice(
    property.price,
    property.currency,
    property.transaction_type,
    property.rental_period
  );

  const specItems: string[] = [];
  if (property.bedrooms !== null && property.bedrooms !== undefined) {
    specItems.push(`${property.bedrooms} ${property.bedrooms === 1 ? 'Bed' : 'Beds'}`);
  }
  if (property.bathrooms !== null && property.bathrooms !== undefined) {
    specItems.push(`${property.bathrooms} ${Number(property.bathrooms) === 1 ? 'Bath' : 'Baths'}`);
  }
  if (property.area_value !== null && property.area_value !== undefined) {
    specItems.push(`${Number(property.area_value).toLocaleString()} ${property.area_unit}`);
  }

  return (
    <article className="bg-white border border-[#E5E0D8] rounded overflow-hidden flex flex-col group hover:border-[#1E3A5F] transition-colors">
      <Link to={`/properties/${encodeURIComponent(property.slug)}`} className="relative block aspect-[4/3] bg-[#EBE6DF] overflow-hidden">
        {primaryImage?.image_url && !imageError ? (
          <img
            src={primaryImage.image_url}
            alt={primaryImage.alt_text || property.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#F3EFE8] to-[#E6E0D4] text-[#5C5A55]">
            <Building2 size={28} className="text-[#8C4A27] mb-2" strokeWidth={1.5} />
            <span className="text-xs font-medium text-[#4A4843] line-clamp-1">
              {formatPropertyTypeLabel(property.property_type)}
            </span>
          </div>
        )}
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C5A55]">
            <span className="font-semibold text-[#8C4A27] uppercase tracking-wider">
              {property.transaction_type === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{formatPropertyTypeLabel(property.property_type)}</span>
            {property.listing_status && property.listing_status !== 'available' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-[#1E3A5F]">
                  {formatListingStatusLabel(property.listing_status)}
                </span>
              </>
            )}
          </div>

          <div className="text-xl font-serif font-semibold text-[#141413] tabular-nums">
            {formattedPrice}
          </div>

          <h3 className="text-base font-serif font-semibold text-[#141413] leading-snug line-clamp-2 group-hover:text-[#1E3A5F] transition-colors">
            <Link to={`/properties/${encodeURIComponent(property.slug)}`}>
              {property.title}
            </Link>
          </h3>

          {locationText && (
            <p className="text-xs text-[#5C5A55] flex items-center gap-1.5">
              <MapPin size={13} className="shrink-0 text-[#8C4A27]" />
              <span className="truncate">{locationText}</span>
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-between gap-2 text-xs">
          {specItems.length > 0 ? (
            <span className="text-[#4A4843] font-mono tabular-nums truncate">
              {specItems.join(' · ')}
            </span>
          ) : (
            <span className="text-[#7A7770]">Property Details</span>
          )}
          <Link
            to={`/properties/${encodeURIComponent(property.slug)}`}
            className="font-semibold text-[#1E3A5F] hover:underline whitespace-nowrap shrink-0"
          >
            View &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}
