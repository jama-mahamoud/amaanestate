import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin } from 'lucide-react';
import { Property } from '../../types';
import {
  formatAreaUnitLabel,
  formatListingStatusLabel,
  formatPropertyLocation,
  formatPropertyPrice,
  formatPropertyTypeLabel,
  getPrimaryPropertyImage,
  isHousingAnywhereSource,
  isPartnerListing,
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

  const isSample = Boolean(property.is_sample || property.source_name === 'showcase_sample');
  const partnerListing = isPartnerListing(property);
  const isHousingAnywhere = isHousingAnywhereSource(property.source_name);
  const internalHref = `/properties/${encodeURIComponent(property.slug)}`;

  const specItems: string[] = [];
  if (property.bedrooms !== null && property.bedrooms !== undefined) {
    specItems.push(`${property.bedrooms} ${property.bedrooms === 1 ? 'Bed' : 'Beds'}`);
  }
  if (property.bathrooms !== null && property.bathrooms !== undefined) {
    specItems.push(`${property.bathrooms} ${Number(property.bathrooms) === 1 ? 'Bath' : 'Baths'}`);
  }
  if (property.area_value !== null && property.area_value !== undefined) {
    specItems.push(
      `${Number(property.area_value).toLocaleString()} ${formatAreaUnitLabel(property.area_unit)}`
    );
  }

  const imageContent =
    primaryImage?.image_url && !imageError ? (
      <img
        src={primaryImage.image_url}
        alt={primaryImage.alt_text || property.title}
        width={800}
        height={600}
        loading="lazy"
        decoding="async"
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
    );

  return (
    <article className="bg-white border border-[#E5E0D8] rounded-md overflow-hidden flex flex-col group hover:border-[#1E3A5F] transition-colors min-w-0">
      <Link
        to={internalHref}
        aria-label={`${property.title}${partnerListing ? ' — Partner Listing' : ''}`}
        className="relative block aspect-[4/3] bg-[#EBE6DF] overflow-hidden"
      >
        {imageContent}
      </Link>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5 min-w-0">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#5C5A55]">
            <span className="font-semibold text-[#8C4A27] uppercase tracking-wider">
              {property.transaction_type === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
            <span aria-hidden="true">&middot;</span>
            <span>{formatPropertyTypeLabel(property.property_type)}</span>
            {partnerListing && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span className="font-semibold text-[#1E3A5F]">
                  {isHousingAnywhere ? 'Partner · HousingAnywhere' : 'Partner Listing'}
                </span>
              </>
            )}
            {isSample && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span className="text-[#7A7770]">Illustrative Sample</span>
              </>
            )}
            {property.listing_status && property.listing_status !== 'available' && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span className="font-medium text-[#1E3A5F]">
                  {formatListingStatusLabel(property.listing_status)}
                </span>
              </>
            )}
          </div>

          <div className="text-lg sm:text-xl font-serif font-semibold text-[#141413] tabular-nums">
            {formattedPrice}
          </div>

          <h3 className="text-[15px] sm:text-base font-serif font-semibold text-[#141413] leading-snug line-clamp-2 group-hover:text-[#1E3A5F] transition-colors break-words">
            <Link to={internalHref}>{property.title}</Link>
          </h3>

          {locationText && (
            <p className="text-xs text-[#5C5A55] flex items-center gap-1.5 min-w-0">
              <MapPin size={13} className="shrink-0 text-[#8C4A27]" aria-hidden="true" />
              <span className="truncate">{locationText}</span>
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-[#F0ECE1] flex items-center justify-between gap-2 text-xs min-w-0">
          {specItems.length > 0 ? (
            <span className="text-[#4A4843] font-mono text-[11px] tabular-nums truncate">
              {specItems.join(' · ')}
            </span>
          ) : (
            <span className="text-[11px] text-[#7A7770] truncate">
              {isHousingAnywhere
                ? 'HousingAnywhere Partner'
                : partnerListing
                ? 'External Partner'
                : 'Property Details'}
            </span>
          )}

          <Link
            to={internalHref}
            className="inline-flex items-center gap-1 font-semibold text-[#1E3A5F] hover:text-[#8C4A27] hover:underline whitespace-nowrap shrink-0"
          >
            <span>View Details</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
