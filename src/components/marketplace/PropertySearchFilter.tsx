import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, MapPin, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { PropertyCountryStat, PropertyFilterOptions, TransactionType } from '../../types';
import { getPropertyCountries } from '../../services/propertyService';

interface PropertySearchFilterProps {
  transactionType: TransactionType;
  filters: PropertyFilterOptions;
  totalCount: number;
  loading: boolean;
  onApply: (nextFilters: PropertyFilterOptions) => void;
  onReset: () => void;
}

const PROPERTY_TYPES = [
  { value: 'all', label: 'All Property Types' },
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'condominium', label: 'Condominium' },
  { value: 'land', label: 'Land' },
  { value: 'other', label: 'Other' },
];

const LISTING_STATUSES = [
  { value: 'all', label: 'All Active Listings' },
  { value: 'available', label: 'Available' },
  { value: 'pending', label: 'Pending' },
  { value: 'under_contract', label: 'Under Contract' },
];

export default function PropertySearchFilter({
  transactionType,
  filters,
  totalCount,
  loading,
  onApply,
  onReset,
}: PropertySearchFilterProps) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<PropertyFilterOptions>(filters);
  const [countryOptions, setCountryOptions] = useState<PropertyCountryStat[]>([]);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  useEffect(() => {
    let active = true;
    getPropertyCountries()
      .then((res) => {
        if (active) setCountryOptions(res.countries);
      })
      .catch(() => {
        if (active) setCountryOptions([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const isRent = transactionType === 'rent';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({
      ...draft,
      transaction_type: transactionType,
      page: 1,
    });
  };

  const handleSortChange = (nextSort: 'newest' | 'price_asc' | 'price_desc') => {
    const updated = {
      ...draft,
      transaction_type: transactionType,
      sort: nextSort,
      page: 1,
    };
    setDraft(updated);
    onApply(updated);
  };

  const handleTransactionSwitch = (targetMode: TransactionType) => {
    if (targetMode === transactionType) return;
    const targetPath = targetMode === 'rent' ? '/rent' : '/buy';
    const params = new URLSearchParams();

    if (draft.country && String(draft.country).trim()) {
      params.set('country', String(draft.country).trim());
    }
    if (draft.location && String(draft.location).trim()) {
      params.set('location', String(draft.location).trim());
    }
    if (draft.property_type && draft.property_type !== 'all') {
      params.set('type', draft.property_type);
    }
    if (draft.min_price !== undefined && String(draft.min_price).trim() !== '') {
      params.set('min_price', String(draft.min_price).trim());
    }
    if (draft.max_price !== undefined && String(draft.max_price).trim() !== '') {
      params.set('max_price', String(draft.max_price).trim());
    }
    if (draft.bedrooms !== undefined && String(draft.bedrooms).trim() !== '') {
      params.set('bedrooms', String(draft.bedrooms).trim());
    }
    if (draft.bathrooms !== undefined && String(draft.bathrooms).trim() !== '') {
      params.set('bathrooms', String(draft.bathrooms).trim());
    }
    if (draft.listing_status && draft.listing_status !== 'all') {
      params.set('status', draft.listing_status);
    }
    if (draft.sort && draft.sort !== 'newest') {
      params.set('sort', draft.sort);
    }

    const qs = params.toString();
    navigate(qs ? `${targetPath}?${qs}` : targetPath);
  };

  const handleClearCountry = () => {
    const updated = {
      ...draft,
      country: '',
      transaction_type: transactionType,
      page: 1,
    };
    setDraft(updated);
    onApply(updated);
  };

  const handleClearLocation = () => {
    const updated = {
      ...draft,
      location: '',
      transaction_type: transactionType,
      page: 1,
    };
    setDraft(updated);
    if (filters.location) {
      onApply(updated);
    }
  };

  const activeAdvancedCount = [
    draft.country && String(draft.country).trim() ? String(draft.country).trim() : '',
    draft.min_price !== undefined && String(draft.min_price).trim() !== '' ? String(draft.min_price) : '',
    draft.max_price !== undefined && String(draft.max_price).trim() !== '' ? String(draft.max_price) : '',
    draft.bedrooms ? String(draft.bedrooms) : '',
    draft.bathrooms ? String(draft.bathrooms) : '',
    draft.listing_status && draft.listing_status !== 'all' ? draft.listing_status : '',
    draft.sort && draft.sort !== 'newest' ? draft.sort : '',
    isRent && draft.rental_period && draft.rental_period !== 'all' ? draft.rental_period : '',
    isRent && draft.availability_date ? draft.availability_date : '',
  ].filter(Boolean).length;

  const hasAnyActiveFilter = Boolean(
    (filters.location && String(filters.location).trim()) ||
      (filters.property_type && filters.property_type !== 'all') ||
      activeAdvancedCount > 0
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#E5E0D8] rounded-[6px] p-4 sm:p-5 space-y-4"
    >
      {/* Top Bar: Transaction Selector + Listing Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E0D8] pb-3">
        <div
          role="group"
          aria-label="Transaction type"
          className="inline-flex items-center gap-1 p-1 bg-[#FAF8F5] border border-[#E5E0D8] rounded"
        >
          <button
            type="button"
            onClick={() => handleTransactionSwitch('rent')}
            aria-pressed={transactionType === 'rent'}
            className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
              transactionType === 'rent'
                ? 'bg-[#1E3A5F] text-white'
                : 'text-[#5C5A55] hover:text-[#141413]'
            }`}
          >
            For Rent
          </button>
          <button
            type="button"
            onClick={() => handleTransactionSwitch('sale')}
            aria-pressed={transactionType === 'sale'}
            className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
              transactionType === 'sale'
                ? 'bg-[#1E3A5F] text-white'
                : 'text-[#5C5A55] hover:text-[#141413]'
            }`}
          >
            For Sale
          </button>
        </div>

        <p className="text-xs text-[#5C5A55] font-mono tabular-nums">
          {loading
            ? 'Searching listings...'
            : `${totalCount.toLocaleString()} ${totalCount === 1 ? 'listing' : 'listings'} found`}
        </p>
      </div>

      {/* Primary Simple Search Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        <div className="sm:col-span-2 lg:col-span-6">
          <label
            htmlFor="filter-location"
            className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
          >
            Location
          </label>
          <div className="relative">
            <MapPin
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7770] pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="filter-location"
              type="text"
              value={draft.location || ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Enter city, country, address, neighborhood or postcode..."
              className="w-full h-11 pl-10 pr-9 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] placeholder:text-[#7A7770] focus:outline-none focus:border-[#1E3A5F]"
            />
            {draft.location && (
              <button
                type="button"
                onClick={handleClearLocation}
                aria-label="Clear location"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#7A7770] hover:text-[#141413] cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <label
            htmlFor="filter-type"
            className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
          >
            Property Type
          </label>
          <select
            id="filter-type"
            value={draft.property_type || 'all'}
            onChange={(e) => setDraft((prev) => ({ ...prev, property_type: e.target.value }))}
            className="w-full h-11 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
          >
            {PROPERTY_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-3 flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 px-5 bg-[#1E3A5F] hover:bg-[#142944] text-white text-xs font-semibold uppercase tracking-wider rounded inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <Search size={15} />
            <span>Search Properties</span>
          </button>
        </div>
      </div>

      {/* Utility Row: Active Country Context + More Filters Toggle + Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#5C5A55]">
          {filters.country && String(filters.country).trim() && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-[#141413]">
              <span>
                Country: <strong className="font-semibold">{filters.country}</strong>
              </span>
              <button
                type="button"
                onClick={handleClearCountry}
                aria-label={`Remove ${filters.country} filter`}
                className="text-[#7A7770] hover:text-[#141413] cursor-pointer"
              >
                <X size={13} />
              </button>
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 ml-auto">
          {hasAnyActiveFilter && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5C5A55] hover:text-[#141413] cursor-pointer whitespace-nowrap"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowMoreFilters((prev) => !prev)}
            aria-expanded={showMoreFilters}
            aria-controls="marketplace-more-filters"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A5F] hover:text-[#142944] cursor-pointer whitespace-nowrap"
          >
            <SlidersHorizontal size={13} aria-hidden="true" />
            <span>
              More Filters{activeAdvancedCount > 0 ? ` (${activeAdvancedCount})` : ''}
            </span>
            {showMoreFilters ? (
              <ChevronUp size={14} aria-hidden="true" />
            ) : (
              <ChevronDown size={14} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable More Filters Section (Hidden by Default) */}
      {showMoreFilters && (
        <div
          id="marketplace-more-filters"
          className="pt-4 border-t border-[#E5E0D8] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div>
            <label
              htmlFor="filter-country"
              className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
            >
              Country
            </label>
            <select
              id="filter-country"
              value={draft.country || ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, country: e.target.value }))}
              className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
            >
              <option value="">All Countries</option>
              {draft.country &&
                !countryOptions.some(
                  (c) => c.country.toLowerCase() === String(draft.country).trim().toLowerCase()
                ) && <option value={draft.country}>{draft.country}</option>}
              {countryOptions.map((c) => (
                <option key={c.countryCode || c.country} value={c.country}>
                  {c.flag} {c.country} ({c.totalCount})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-min-price"
              className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
            >
              {isRent ? 'Min Monthly Rent' : 'Min Price'}
            </label>
            <input
              id="filter-min-price"
              type="number"
              min={0}
              value={draft.min_price ?? ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, min_price: e.target.value }))}
              placeholder={isRent ? 'e.g. 1500' : 'e.g. 250000'}
              className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm font-mono text-[#141413] placeholder:text-[#7A7770] focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <label
              htmlFor="filter-max-price"
              className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
            >
              {isRent ? 'Max Monthly Rent' : 'Max Price'}
            </label>
            <input
              id="filter-max-price"
              type="number"
              min={0}
              value={draft.max_price ?? ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, max_price: e.target.value }))}
              placeholder={isRent ? 'e.g. 8000' : 'e.g. 2500000'}
              className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm font-mono text-[#141413] placeholder:text-[#7A7770] focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <label
              htmlFor="filter-bedrooms"
              className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
            >
              Bedrooms
            </label>
            <select
              id="filter-bedrooms"
              value={String(draft.bedrooms || '')}
              onChange={(e) => setDraft((prev) => ({ ...prev, bedrooms: e.target.value }))}
              className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
            >
              <option value="">Any</option>
              <option value="1">1+ Bedroom</option>
              <option value="2">2+ Bedrooms</option>
              <option value="3">3+ Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
              <option value="5">5+ Bedrooms</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-bathrooms"
              className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
            >
              Bathrooms
            </label>
            <select
              id="filter-bathrooms"
              value={String(draft.bathrooms || '')}
              onChange={(e) => setDraft((prev) => ({ ...prev, bathrooms: e.target.value }))}
              className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
            >
              <option value="">Any</option>
              <option value="1">1+ Bathroom</option>
              <option value="2">2+ Bathrooms</option>
              <option value="3">3+ Bathrooms</option>
              <option value="4">4+ Bathrooms</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-status"
              className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
            >
              Listing Status
            </label>
            <select
              id="filter-status"
              value={draft.listing_status || 'all'}
              onChange={(e) => setDraft((prev) => ({ ...prev, listing_status: e.target.value }))}
              className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
            >
              {LISTING_STATUSES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-sort"
              className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
            >
              Sort By
            </label>
            <select
              id="filter-sort"
              value={draft.sort || 'newest'}
              onChange={(e) =>
                handleSortChange(e.target.value as 'newest' | 'price_asc' | 'price_desc')
              }
              className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">{isRent ? 'Rent: Low to High' : 'Price: Low to High'}</option>
              <option value="price_desc">{isRent ? 'Rent: High to Low' : 'Price: High to Low'}</option>
            </select>
          </div>

          {isRent && (
            <>
              <div>
                <label
                  htmlFor="filter-rental-period"
                  className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
                >
                  Rental Duration
                </label>
                <select
                  id="filter-rental-period"
                  value={draft.rental_period || 'all'}
                  onChange={(e) => setDraft((prev) => ({ ...prev, rental_period: e.target.value }))}
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                >
                  <option value="all">Any Billing Period</option>
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                  <option value="week">Weekly</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="filter-availability-date"
                  className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
                >
                  Available By
                </label>
                <input
                  id="filter-availability-date"
                  type="date"
                  value={draft.availability_date || ''}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, availability_date: e.target.value }))
                  }
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm font-mono text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                />
              </div>
            </>
          )}
        </div>
      )}
    </form>
  );
}
