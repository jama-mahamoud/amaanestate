import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ExternalLink, MapPin, Phone, UserCheck } from 'lucide-react';
import { Property } from '../types';
import {
  formatListingStatusLabel,
  formatPropertyLocation,
  formatPropertyPrice,
  formatPropertyTypeLabel,
  getPrimaryPropertyImage,
  getPropertyBySlug,
} from '../services/propertyService';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';
import PropertyGallery from '../components/marketplace/PropertyGallery';
import PropertyEnquiryForm from '../components/marketplace/PropertyEnquiryForm';

export default function PropertyDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!slug) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setErrorMsg(null);
      try {
        const found = await getPropertyBySlug(slug);
        if (!active) return;
        setProperty(found);
      } catch (err: any) {
        if (!active) return;
        setErrorMsg(err?.message || 'Unable to load property details.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [slug]);

  const primaryImage = property ? getPrimaryPropertyImage(property) : null;
  const locationText = property ? formatPropertyLocation(property) : '';
  const priceText = property
    ? formatPropertyPrice(
        property.price,
        property.currency,
        property.transaction_type,
        property.rental_period
      )
    : '';

  useSEO({
    title: property
      ? `${property.title} — ${priceText}`
      : loading
      ? 'Loading Property | AmaanEstate'
      : 'Property Unavailable | AmaanEstate',
    description: property
      ? `${formatPropertyTypeLabel(property.property_type)} ${
          property.transaction_type === 'rent' ? 'for rent' : 'for sale'
        } in ${locationText}. ${(property.description || '').slice(0, 140)}`
      : 'Browse residential properties for sale and rent on the AmaanEstate global property marketplace.',
    image: primaryImage?.image_url || undefined,
    imageAlt: primaryImage?.alt_text || property?.title,
    url: property ? `${getCanonicalOrigin()}/properties/${encodeURIComponent(property.slug)}` : undefined,
    noIndex: !loading && !property,
    omitCanonical: !loading && !property,
    structuredData: property
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'RealEstateListing',
            name: property.title,
            description: property.description,
            url: `https://www.amaanestate.com/properties/${encodeURIComponent(property.slug)}`,
            datePosted: property.published_at || property.created_at,
            image: (property.images || []).map((img) => img.image_url),
            offers: {
              '@type': 'Offer',
              price: property.price,
              priceCurrency: property.currency || 'USD',
            },
            address: {
              '@type': 'PostalAddress',
              streetAddress: property.address_line || undefined,
              addressLocality: property.city,
              addressRegion: property.state_region || undefined,
              addressCountry: property.country,
              postalCode: property.postal_code || undefined,
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.amaanestate.com/' },
              {
                '@type': 'ListItem',
                position: 2,
                name: property.transaction_type === 'rent' ? 'Rent Property' : 'Buy Property',
                item: `https://www.amaanestate.com/${property.transaction_type === 'rent' ? 'rent' : 'buy'}`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: property.title,
                item: `https://www.amaanestate.com/properties/${encodeURIComponent(property.slug)}`,
              },
            ],
          },
        ]
      : undefined,
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-pulse">
        <div className="h-4 w-48 bg-[#EBE6DF] rounded" />
        <div className="aspect-[16/9] bg-[#EBE6DF] rounded" />
        <div className="h-8 w-2/3 bg-[#EBE6DF] rounded" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-serif font-semibold text-[#141413]">
          Unable to Load Listing
        </h1>
        <p className="text-sm text-[#5C5A55]">{errorMsg}</p>
        <div className="flex justify-center gap-3">
          <Link to="/buy" className="px-5 py-2.5 bg-[#1E3A5F] text-white text-xs font-semibold rounded">
            Browse Properties for Sale
          </Link>
          <Link to="/rent" className="px-5 py-2.5 bg-white border border-[#D6CEBE] text-xs font-semibold rounded">
            Browse Rentals
          </Link>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
          Listing Unavailable
        </p>
        <h1 className="text-3xl font-serif font-semibold text-[#141413]">
          This Property Listing Could Not Be Found
        </h1>
        <p className="text-sm text-[#5C5A55] leading-relaxed">
          The listing may have been withdrawn, sold, leased, or is not currently published. Explore active listings across our marketplace.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            to="/buy"
            className="px-5 py-2.5 bg-[#1E3A5F] text-white text-xs font-semibold rounded"
          >
            Properties for Sale
          </Link>
          <Link
            to="/rent"
            className="px-5 py-2.5 bg-white border border-[#D6CEBE] text-xs font-semibold text-[#141413] rounded hover:border-[#1E3A5F]"
          >
            Properties for Rent
          </Link>
        </div>
      </div>
    );
  }

  const transactionRoute = property.transaction_type === 'rent' ? '/rent' : '/buy';
  const transactionLabel = property.transaction_type === 'rent' ? 'Rent' : 'Buy';
  const specs: Array<{ label: string; value: string }> = [
    { label: 'Listing Type', value: property.transaction_type === 'rent' ? 'For Rent' : 'For Sale' },
    { label: 'Property Type', value: formatPropertyTypeLabel(property.property_type) },
    { label: 'Status', value: formatListingStatusLabel(property.listing_status) },
  ];
  if (property.bedrooms !== null && property.bedrooms !== undefined) {
    specs.push({ label: 'Bedrooms', value: String(property.bedrooms) });
  }
  if (property.bathrooms !== null && property.bathrooms !== undefined) {
    specs.push({ label: 'Bathrooms', value: String(property.bathrooms) });
  }
  if (property.area_value !== null && property.area_value !== undefined) {
    specs.push({
      label: 'Floor / Lot Area',
      value: `${Number(property.area_value).toLocaleString()} ${property.area_unit}`,
    });
  }
  if (property.transaction_type === 'rent' && property.available_from) {
    specs.push({ label: 'Available From', value: property.available_from });
  }

  const isSample = Boolean(property.is_sample) || property.source_name === 'showcase_sample';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[#5C5A55]">
        <Link to="/" className="hover:text-[#141413] transition-colors">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link to={transactionRoute} className="hover:text-[#141413] transition-colors">
          {transactionLabel}
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          to={`${transactionRoute}?location=${encodeURIComponent(property.city)}`}
          className="hover:text-[#141413] transition-colors"
        >
          {property.city}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#141413] font-medium truncate max-w-[260px] sm:max-w-md">
          {property.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Primary Column */}
        <div className="lg:col-span-8 space-y-8">
          {isSample && (
            <div className="bg-[#FAF8F5] border border-[#D6CEBE] rounded p-4 sm:p-5 space-y-1.5 text-xs text-[#5C5A55]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#8C4A27] uppercase tracking-wider">
                  International Property Showcase
                </span>
              </div>
              <p className="text-[#4A4843] leading-relaxed">
                These are illustrative property examples for presentation purposes and are not confirmed active market listings.
              </p>
            </div>
          )}

          <PropertyGallery title={property.title} images={property.images || []} />

          {/* Header Summary */}
          <div className="bg-white border border-[#E5E0D8] rounded p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C5A55]">
              <span className="uppercase tracking-wider font-semibold text-[#8C4A27]">
                {property.transaction_type === 'rent' ? 'For Rent' : 'For Sale'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{formatPropertyTypeLabel(property.property_type)}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[#1E3A5F]">
                {formatListingStatusLabel(property.listing_status)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
              <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[#141413] leading-tight">
                {property.title}
              </h1>
              <div className="text-2xl sm:text-3xl font-serif font-semibold text-[#1E3A5F] tabular-nums shrink-0">
                {priceText}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-[#4A4843]">
              <MapPin size={15} className="text-[#8C4A27] shrink-0" />
              <span>
                {[
                  property.address_line,
                  property.city,
                  property.state_region,
                  property.country,
                  property.postal_code,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>

            {/* Key Specifications Grid */}
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-5 border-t border-[#E5E0D8]">
              {specs.map((spec) => (
                <div key={spec.label} className="space-y-0.5">
                  <dt className="text-[11px] uppercase tracking-wider font-semibold text-[#7A7770]">
                    {spec.label}
                  </dt>
                  <dd className="text-sm font-semibold text-[#141413] tabular-nums">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Description */}
          {property.description && (
            <section className="bg-white border border-[#E5E0D8] rounded p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-serif font-semibold text-[#141413] border-b border-[#E5E0D8] pb-3">
                Property Overview
              </h2>
              <div className="text-sm sm:text-base text-[#4A4843] leading-relaxed whitespace-pre-line">
                {property.description}
              </div>
            </section>
          )}

          {/* Features (rendered only when present) */}
          {property.features && property.features.length > 0 && (
            <section className="bg-white border border-[#E5E0D8] rounded p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-serif font-semibold text-[#141413] border-b border-[#E5E0D8] pb-3">
                Key Features &amp; Specifications
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#4A4843]">
                {property.features.map((feat, idx) => (
                  <li key={`${feat}-${idx}`} className="flex items-start gap-2">
                    <Check size={15} className="text-[#8C4A27] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Agent & Listing Source Attribution */}
          {(property.agent_name ||
            property.agent_phone ||
            property.brokerage_name ||
            property.source_name ||
            property.source_listing_id) && (
            <section className="bg-white border border-[#E5E0D8] rounded p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-serif font-semibold text-[#141413] border-b border-[#E5E0D8] pb-3">
                Listing Representative &amp; Source
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                {(property.agent_name || property.brokerage_name || property.agent_phone) && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-[#7A7770]">
                      Representative
                    </div>
                    {property.agent_name && (
                      <p className="font-semibold text-[#141413] flex items-center gap-1.5">
                        <UserCheck size={14} className="text-[#1E3A5F]" />
                        <span>{property.agent_name}</span>
                      </p>
                    )}
                    {property.brokerage_name && (
                      <p className="text-[#5C5A55]">{property.brokerage_name}</p>
                    )}
                    {property.agent_phone && (
                      <p className="text-[#4A4843] font-mono text-xs flex items-center gap-1.5">
                        <Phone size={13} className="text-[#8C4A27]" />
                        <span>{property.agent_phone}</span>
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-[#7A7770]">
                    Source Attribution
                  </div>
                  <p className="text-[#141413] font-medium capitalize">
                    {property.source_name || 'AMAAN ESTATE Direct'}
                  </p>
                  {property.source_listing_id && (
                    <p className="text-xs font-mono text-[#5C5A55]">
                      Listing ID: {property.source_listing_id}
                    </p>
                  )}
                  {property.source_url && (
                    <a
                      href={property.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A5F] hover:underline pt-1"
                    >
                      <span>View Original Source Record</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}

          <div>
            <Link
              to={transactionRoute}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#1E3A5F] hover:underline"
            >
              <ArrowLeft size={14} />
              <span>Back to {property.transaction_type === 'rent' ? 'Properties for Rent' : 'Properties for Sale'}</span>
            </Link>
          </div>
        </div>

        {/* Right Sticky Enquiry Panel */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24">
          <PropertyEnquiryForm property={property} />
        </aside>
      </div>
    </div>
  );
}
