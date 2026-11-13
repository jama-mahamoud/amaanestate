import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Building2, Info } from 'lucide-react';
import { Property, PropertyFilterOptions } from '../types';
import { getProperties } from '../services/propertyService';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';
import PropertyCard from '../components/marketplace/PropertyCard';
import PropertySearchFilter from '../components/marketplace/PropertySearchFilter';

function parseFiltersFromSearchParams(params: URLSearchParams): PropertyFilterOptions {
  return {
    transaction_type: 'rent',
    country: params.get('country') || '',
    location: params.get('location') || '',
    property_type: params.get('type') || 'all',
    min_price: params.get('min_price') || '',
    max_price: params.get('max_price') || '',
    bedrooms: params.get('bedrooms') || '',
    bathrooms: params.get('bathrooms') || '',
    listing_status: params.get('status') || 'all',
    rental_period: params.get('rental_period') || 'all',
    availability_date: params.get('availability_date') || '',
    sort: (params.get('sort') as 'newest' | 'price_asc' | 'price_desc') || 'newest',
    page: Math.max(Number(params.get('page') || 1) || 1, 1),
    limit: 12,
  };
}

export default function RentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<PropertyFilterOptions>(() =>
    parseFiltersFromSearchParams(searchParams)
  );
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useSEO({
    title: 'Rent Real Estate & Properties for Lease | AmaanEstate',
    description:
      'Browse apartments, houses, villas, and townhouses available for rent internationally on the AmaanEstate global property marketplace.',
    url: `${getCanonicalOrigin()}/rent`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.amaanestate.com/' },
        { '@type': 'ListItem', position: 2, name: 'Rent Property', item: 'https://www.amaanestate.com/rent' },
      ],
    },
  });

  useEffect(() => {
    setFilters(parseFiltersFromSearchParams(searchParams));
  }, [searchParams]);

  const loadListings = useCallback(async (activeFilters: PropertyFilterOptions) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await getProperties({
        ...activeFilters,
        transaction_type: 'rent',
      });
      setProperties(result.properties);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to load rental properties right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings(filters);
  }, [filters, loadListings]);

  const applyFiltersToUrl = (next: PropertyFilterOptions) => {
    const params = new URLSearchParams();
    if (next.country && String(next.country).trim()) {
      params.set('country', String(next.country).trim());
    }
    if (next.location && String(next.location).trim()) {
      params.set('location', String(next.location).trim());
    }
    if (next.property_type && next.property_type !== 'all') {
      params.set('type', next.property_type);
    }
    if (next.min_price !== undefined && String(next.min_price).trim() !== '') {
      params.set('min_price', String(next.min_price).trim());
    }
    if (next.max_price !== undefined && String(next.max_price).trim() !== '') {
      params.set('max_price', String(next.max_price).trim());
    }
    if (next.bedrooms !== undefined && String(next.bedrooms).trim() !== '') {
      params.set('bedrooms', String(next.bedrooms).trim());
    }
    if (next.bathrooms !== undefined && String(next.bathrooms).trim() !== '') {
      params.set('bathrooms', String(next.bathrooms).trim());
    }
    if (next.listing_status && next.listing_status !== 'all') {
      params.set('status', next.listing_status);
    }
    if (next.rental_period && next.rental_period !== 'all') {
      params.set('rental_period', next.rental_period);
    }
    if (next.availability_date && String(next.availability_date).trim()) {
      params.set('availability_date', String(next.availability_date).trim());
    }
    if (next.sort && next.sort !== 'newest') {
      params.set('sort', next.sort);
    }
    if (next.page && next.page > 1) {
      params.set('page', String(next.page));
    }
    setSearchParams(params);
  };

  const handleReset = () => {
    setSearchParams(new URLSearchParams());
  };

  const currentPage = filters.page || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      <div className="border-b border-[#E5E0D8] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
            Global Marketplace
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#141413]">
            Find Properties for Rent
          </h1>
          <p className="text-sm sm:text-base text-[#5C5A55]">
            Search residences available for monthly, annual, or seasonal lease across international urban centers.
          </p>
        </div>

        <Link
          to={filters.country ? `/buy?country=${encodeURIComponent(filters.country)}` : '/buy'}
          className="text-xs font-semibold text-[#1E3A5F] hover:underline whitespace-nowrap shrink-0"
        >
          Looking to purchase? Browse Properties for Sale &rarr;
        </Link>
      </div>

      <PropertySearchFilter
        transactionType="rent"
        filters={filters}
        totalCount={total}
        loading={loading}
        onApply={applyFiltersToUrl}
        onReset={handleReset}
      />

      <div className="bg-[#FAF8F5] border border-[#D6CEBE] rounded px-4 py-3 text-xs text-[#5C5A55] flex items-center gap-2.5">
        <Info size={16} className="text-[#8C4A27] shrink-0" />
        <span>
          Some properties are illustrative examples provided for marketplace presentation and are not confirmed active market listings.
        </span>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] rounded p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm"
        >
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => loadListings(filters)}
            className="px-4 py-2 bg-[#991B1B] text-white text-xs font-semibold rounded cursor-pointer self-start sm:self-auto"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white border border-[#E5E0D8] rounded overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/3] bg-[#EBE6DF]" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-28 bg-[#EBE6DF] rounded" />
                <div className="h-6 w-36 bg-[#EBE6DF] rounded" />
                <div className="h-4 w-full bg-[#EBE6DF] rounded" />
                <div className="h-3 w-48 bg-[#EBE6DF] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => applyFiltersToUrl({ ...filters, page: currentPage - 1 })}
                className="px-4 py-2 bg-white border border-[#E5E0D8] rounded text-xs font-semibold text-[#141413] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:border-[#1E3A5F]"
              >
                &larr; Previous
              </button>
              <span className="text-xs font-mono tabular-nums text-[#5C5A55]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => applyFiltersToUrl({ ...filters, page: currentPage + 1 })}
                className="px-4 py-2 bg-white border border-[#E5E0D8] rounded text-xs font-semibold text-[#141413] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:border-[#1E3A5F]"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white border border-[#E5E0D8] rounded p-10 sm:p-12 text-center space-y-4 max-w-2xl mx-auto">
          <Building2 size={32} className="mx-auto text-[#8C4A27]" strokeWidth={1.5} />
          <p className="text-sm sm:text-base text-[#5C5A55] leading-relaxed font-medium">
            No properties found matching your search criteria. Try adjusting your search filters or location query.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {Array.from(searchParams.keys()).length > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 bg-[#1E3A5F] text-white text-xs font-semibold rounded cursor-pointer"
              >
                Reset Search Filters
              </button>
            )}
            <Link
              to="/buy"
              className="px-5 py-2.5 bg-[#FAF8F5] border border-[#D6CEBE] text-xs font-semibold text-[#141413] rounded hover:border-[#1E3A5F]"
            >
              Browse Properties for Sale
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
