import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  Check,
  ExternalLink,
  ImageOff,
  MapPin,
} from 'lucide-react';
import {
  AreaUnit,
  ListingStatus,
  PropertyType,
  PublicationStatus,
  RentalPeriod,
  TransactionType,
} from '../../types';
import {
  formatAreaUnitLabel,
  formatListingStatusLabel,
  formatPropertyPrice,
  formatPropertyTypeLabel,
  isHousingAnywhereSource,
  isPartnerListing,
  isValidExternalPropertyUrl,
} from '../../services/propertyService';

export interface PreviewablePropertyData {
  title: string;
  transaction_type: TransactionType;
  property_type: PropertyType;
  listing_status: ListingStatus;
  publication_status: PublicationStatus;
  price: number | null;
  currency: string;
  rental_period?: RentalPeriod | null;
  available_from?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_value?: number | null;
  area_unit: AreaUnit;
  address_line?: string | null;
  city: string;
  state_region?: string | null;
  country: string;
  postal_code?: string | null;
  description: string;
  features: string[];
  source_name?: string | null;
  source_listing_id?: string | null;
  source_url?: string | null;
  images: Array<{
    image_url: string;
    alt_text?: string | null;
    is_primary?: boolean;
  }>;
}

interface AffiliatePropertyPreviewProps {
  property: PreviewablePropertyData;
  features?: string[];
}

export default function AffiliatePropertyPreview({
  property,
  features,
}: AffiliatePropertyPreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});

  const images = (property.images || []).filter((img) => Boolean(img.image_url));
  const sortedImages = [...images].sort((a, b) =>
    Boolean(a.is_primary) === Boolean(b.is_primary) ? 0 : a.is_primary ? -1 : 1
  );
  const activeImage = sortedImages[selectedIndex] || sortedImages[0] || null;
  const activeFeatures = (features ?? property.features ?? []).filter((f) => f.trim().length > 0);

  const isHA = isHousingAnywhereSource(property.source_name);
  const partner = isPartnerListing({
    source_name: property.source_name || 'manual',
    source_url: property.source_url || null,
  });

  const hasVerifiedPrice = property.price !== null && Number(property.price) > 0;
  const formattedPrice = hasVerifiedPrice
    ? formatPropertyPrice(
        Number(property.price),
        property.currency || 'EUR',
        property.transaction_type,
        property.rental_period || 'month'
      )
    : 'Rental price not provided yet';

  const countryCity = [property.city?.trim(), property.country?.trim()].filter(Boolean).join(', ');
  const fullAddress = [
    property.address_line?.trim(),
    property.city?.trim(),
    property.state_region?.trim(),
    property.country?.trim(),
    property.postal_code?.trim(),
  ]
    .filter(Boolean)
    .join(', ');

  const verifiedSpecs: Array<{ label: string; value: string }> = [
    { label: 'Property Type', value: formatPropertyTypeLabel(property.property_type) },
    { label: 'Status', value: formatListingStatusLabel(property.listing_status) },
  ];
  if (property.bedrooms !== null && property.bedrooms !== undefined) {
    verifiedSpecs.push({ label: 'Bedrooms', value: String(property.bedrooms) });
  }
  if (property.bathrooms !== null && property.bathrooms !== undefined) {
    verifiedSpecs.push({ label: 'Bathrooms', value: String(property.bathrooms) });
  }
  if (property.area_value !== null && property.area_value !== undefined) {
    verifiedSpecs.push({
      label: 'Floor Area',
      value: `${Number(property.area_value).toLocaleString()} ${formatAreaUnitLabel(
        property.area_unit
      )}`,
    });
  }
  if (property.transaction_type === 'rent' && property.available_from?.trim()) {
    verifiedSpecs.push({ label: 'Available From', value: property.available_from.trim() });
  }

  const unavailableSpecs: string[] = [];
  if (property.bedrooms === null || property.bedrooms === undefined) unavailableSpecs.push('Bedrooms');
  if (property.bathrooms === null || property.bathrooms === undefined) unavailableSpecs.push('Bathrooms');
  if (property.area_value === null || property.area_value === undefined) unavailableSpecs.push('Floor Area');
  if (!property.address_line?.trim()) unavailableSpecs.push('Street Address');
  if (property.transaction_type === 'rent' && !property.available_from?.trim()) {
    unavailableSpecs.push('Availability Date');
  }

  const validTrackingUrl = isValidExternalPropertyUrl(property.source_url)
    ? property.source_url!.trim()
    : null;

  return (
    <div className="bg-[#FAF8F5] border border-[#D6CEBE] rounded-md overflow-hidden">
      <div className="px-4 py-2.5 bg-[#F3EFE8] border-b border-[#E5E0D8] flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="uppercase tracking-wider font-semibold text-[#8C4A27]">
          Live Listing Preview (Pre-Save)
        </span>
        <span className="text-[#5C5A55] font-medium">
          {isHA
            ? 'Partner Listing · HousingAnywhere Affiliate'
            : partner
            ? 'Partner Listing'
            : 'AMAAN ESTATE Direct Listing'}{' '}
          · <strong className="capitalize text-[#141413]">{property.publication_status}</strong>
        </span>
      </div>

      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Media Preview Column */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="aspect-[4/3] bg-[#EBE6DF] border border-[#E5E0D8] rounded overflow-hidden">
            {activeImage && !failedUrls[activeImage.image_url] ? (
              <img
                src={activeImage.image_url}
                alt={activeImage.alt_text || property.title || 'Property preview'}
                referrerPolicy="no-referrer"
                onError={() =>
                  setFailedUrls((prev) => ({ ...prev, [activeImage.image_url]: true }))
                }
                className="w-full h-full object-cover object-center"
              />
            ) : activeImage && failedUrls[activeImage.image_url] ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#991B1B] bg-[#FEF2F2]">
                <ImageOff size={24} className="mb-1.5" />
                <span className="text-xs font-semibold">Image preview failed to load</span>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#5C5A55]">
                <Building2 size={28} className="text-[#8C4A27] mb-2" strokeWidth={1.5} />
                <span className="text-xs font-medium">No property photos added yet</span>
              </div>
            )}
          </div>

          {sortedImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {sortedImages.slice(0, 8).map((img, idx) => (
                <button
                  key={`${img.image_url}-${idx}`}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`aspect-[4/3] rounded overflow-hidden border-2 cursor-pointer bg-[#EBE6DF] ${
                    idx === selectedIndex ? 'border-[#1E3A5F]' : 'border-transparent'
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={img.alt_text || `Preview photo ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Listing Content Column */}
        <div className="lg:col-span-7 bg-white border border-[#E5E0D8] rounded p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#5C5A55]">
            <span className="font-semibold uppercase tracking-wider text-[#8C4A27]">
              {property.transaction_type === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
            <span aria-hidden="true">&middot;</span>
            <span>{formatPropertyTypeLabel(property.property_type)}</span>
            {partner && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span className="font-semibold text-[#1E3A5F]">
                  {isHA ? 'Partner · HousingAnywhere' : 'Partner Listing'}
                </span>
              </>
            )}
            {property.source_listing_id?.trim() && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span className="font-mono text-[#7A7770]">
                  SKU {property.source_listing_id.trim()}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h4 className="text-lg sm:text-xl font-serif font-semibold text-[#141413] leading-snug break-words">
              {property.title?.trim() || (
                <span className="text-[#8C4A27] italic font-normal">
                  Property title not provided yet
                </span>
              )}
            </h4>
            <div
              className={`text-base sm:text-lg font-serif font-semibold tabular-nums shrink-0 ${
                hasVerifiedPrice ? 'text-[#1E3A5F]' : 'text-[#8C4A27]'
              }`}
            >
              {formattedPrice}
            </div>
          </div>

          <div className="space-y-1 text-xs text-[#4A4843]">
            <p className="flex items-start gap-1.5">
              <MapPin size={14} className="text-[#8C4A27] shrink-0 mt-0.5" />
              <span>
                {fullAddress || countryCity || (
                  <span className="text-[#7A7770]">Country and city not provided yet</span>
                )}
              </span>
            </p>
            {property.transaction_type === 'rent' && property.available_from?.trim() && (
              <p className="flex items-center gap-1.5 text-[#5C5A55]">
                <Calendar size={13} className="text-[#1E3A5F] shrink-0" />
                <span>Available from {property.available_from.trim()}</span>
              </p>
            )}
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[#F0ECE1] text-xs">
            {verifiedSpecs.map((spec) => (
              <div key={spec.label}>
                <dt className="text-[10px] uppercase tracking-wider text-[#7A7770] font-semibold">
                  {spec.label}
                </dt>
                <dd className="font-semibold text-[#141413] tabular-nums">{spec.value}</dd>
              </div>
            ))}
          </dl>

          {unavailableSpecs.length > 0 && (
            <p className="text-[11px] text-[#7A7770] border-t border-[#F0ECE1] pt-2">
              Not provided by source yet: {unavailableSpecs.join(', ')}.
            </p>
          )}

          {property.description?.trim() ? (
            <div className="pt-2 border-t border-[#F0ECE1] space-y-1">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[#7A7770]">
                Description
              </div>
              <p className="text-xs text-[#4A4843] leading-relaxed whitespace-pre-line line-clamp-5">
                {property.description.trim()}
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-[#7A7770] border-t border-[#F0ECE1] pt-2">
              Description: Not provided yet.
            </p>
          )}

          {activeFeatures.length > 0 && (
            <div className="pt-2 border-t border-[#F0ECE1] space-y-1.5">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[#7A7770]">
                Amenities &amp; Features
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#4A4843]">
                {activeFeatures.slice(0, 8).map((feat, idx) => (
                  <li key={`${feat}-${idx}`} className="flex items-start gap-1.5">
                    <Check size={13} className="text-[#8C4A27] shrink-0 mt-0.5" />
                    <span className="truncate">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {partner && (
            <div className="pt-3 border-t border-[#E5E0D8] flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-[#5C5A55]">
                {isHA
                  ? 'Partner Attribution: HousingAnywhere'
                  : 'External Partner Attribution'}
              </span>
              {validTrackingUrl ? (
                <a
                  href={validTrackingUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#142944] text-white text-[11px] font-semibold uppercase tracking-wider rounded inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>
                    {isHA ? 'View Property on HousingAnywhere' : 'View Property on Partner Site'}
                  </span>
                  <ExternalLink size={12} />
                </a>
              ) : (
                <span className="text-[11px] font-medium text-[#991B1B]">
                  Impact tracking URL required to publish
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
