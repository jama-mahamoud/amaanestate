import React, { useEffect, useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
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
  const [draft, setDraft] = useState<PropertyFilterOptions>(filters);
  const [countryOptions, setCountryOptions] = useState<PropertyCountryStat[]>([]);

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

  const isRent = transactionType === 'rent';

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#E5E0D8] rounded p-5 sm:p-6 space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="filter-country" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5">
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
              ) && (
                <option value={draft.country}>{draft.country}</option>
              )}
            {countryOptions.map((c) => (
              <option key={c.countryCode || c.country} value={c.country}>
                {c.flag} {c.country} ({c.totalCount})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-location" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5">
            City / Location
          </label>
          <input
            id="filter-location"
            type="text"
            value={draft.location || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, location: e.target.value }))}
            placeholder="City, neighborhood, address..."
            className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] placeholder:text-[#7A7770] focus:outline-none focus:border-[#1E3A5F]"
          />
        </div>

        <div>
          <label htmlFor="filter-type" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5">
            Property Type
          </label>
          <select
            id="filter-type"
            value={draft.property_type || 'all'}
            onChange={(e) => setDraft((prev) => ({ ...prev, property_type: e.target.value }))}
            className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
          >
            {PROPERTY_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-min-price" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5">
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
          <label htmlFor="filter-max-price" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5">
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
          <label htmlFor="filter-bedrooms" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5">
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
          <label htmlFor="filter-bathrooms" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5">
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
          <label htmlFor="filter-status" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5">
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
          <label htmlFor="filter-sort" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5">
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
              <label htmlFor="filter-rental-period" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5">
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
              <label htmlFor="filter-availability-date" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5">
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

      <div className="pt-3 border-t border-[#E5E0D8] flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#5C5A55] font-mono tabular-nums">
          {loading
            ? 'Searching listings...'
            : `${totalCount.toLocaleString()} ${totalCount === 1 ? 'listing' : 'listings'} found`}
        </p>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onReset}
            className="h-10 px-4 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D6CEBE] text-xs font-semibold text-[#4A4843] rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="h-10 px-5 bg-[#1E3A5F] hover:bg-[#142944] text-white text-xs font-semibold uppercase tracking-wider rounded inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <Search size={14} />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </form>
  );
}
