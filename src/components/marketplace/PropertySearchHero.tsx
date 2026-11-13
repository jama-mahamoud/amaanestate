import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { resolveEditorialImage } from '../../lib/editorialImages';
import { TransactionType } from '../../types';

const PROPERTY_TYPE_OPTIONS = [
  { value: '', label: 'All Property Types' },
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

export default function PropertySearchHero() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<TransactionType>('rent');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');

  // Expandable advanced filters (hidden by default)
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [listingStatus, setListingStatus] = useState('all');
  const [rentalPeriod, setRentalPeriod] = useState('all');
  const [availabilityDate, setAvailabilityDate] = useState('');

  const isRent = mode === 'rent';

  const activeAdvancedCount = [
    minPrice.trim(),
    maxPrice.trim(),
    bedrooms,
    bathrooms,
    listingStatus !== 'all' ? listingStatus : '',
    isRent && rentalPeriod !== 'all' ? rentalPeriod : '',
    isRent ? availabilityDate : '',
  ].filter(Boolean).length;

  const handleTransactionChange = (nextMode: TransactionType) => {
    setMode(nextMode);
    if (nextMode === 'sale') {
      setRentalPeriod('all');
      setAvailabilityDate('');
    }
  };

  const clearAdvancedFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
    setListingStatus('all');
    setRentalPeriod('all');
    setAvailabilityDate('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPath = mode === 'rent' ? '/rent' : '/buy';
    const params = new URLSearchParams();

    if (location.trim()) params.set('location', location.trim());
    if (propertyType) params.set('type', propertyType);
    if (minPrice.trim()) params.set('min_price', minPrice.trim());
    if (maxPrice.trim()) params.set('max_price', maxPrice.trim());
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (bathrooms) params.set('bathrooms', bathrooms);
    if (listingStatus && listingStatus !== 'all') params.set('status', listingStatus);
    if (isRent && rentalPeriod && rentalPeriod !== 'all') params.set('rental_period', rentalPeriod);
    if (isRent && availabilityDate) params.set('availability_date', availabilityDate);

    const qs = params.toString();
    navigate(qs ? `${targetPath}?${qs}` : targetPath);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-14">
      <div className="space-y-8 lg:space-y-10 pb-10 sm:pb-12 border-b border-[#E5E0D8]">
        {/* Architectural Headline + Visual Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5 py-1">
            <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
              AmaanEstate · Global Real Estate Media, Research &amp; Marketplace
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem] font-serif font-semibold leading-[1.06] text-[#141413] tracking-tight text-balance">
              Global Real Estate. Informed Decisions.
            </h1>

            <p className="text-base sm:text-[1.0625rem] text-[#4A4843] leading-[1.65] max-w-xl">
              Explore international properties for sale and rent on AmaanEstate, alongside independent property market news, housing research, real estate investment insights, and global market analysis.
            </p>

            {/* Primary Transaction Mode Quick Links */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate('/buy')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1E3A5F] hover:bg-[#142944] text-white text-sm font-semibold rounded-[4px] transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Explore Properties for Sale</span>
                <span aria-hidden="true">&rarr;</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/rent')}
                className="inline-flex items-center justify-center px-5 py-3 bg-white hover:bg-[#EFECE6] border border-[#CFC7B8] hover:border-[#1E3A5F] text-[#141413] hover:text-[#1E3A5F] text-sm font-semibold rounded-[4px] transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Browse Rentals</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[240px] sm:min-h-[320px] lg:min-h-[360px] aspect-[16/10] lg:aspect-auto w-full overflow-hidden rounded-[6px] bg-[#EBE6DF] border border-[#E5E0D8] group">
              <img
                src={resolveEditorialImage('hero-pavilion')}
                alt="Contemporary travertine limestone and glass architectural residence"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>

        {/* Clean Unified Marketplace Search Bar */}
        <div className="bg-white border border-[#E5E0D8] rounded-[6px] p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E0D8] pb-3">
            <div
              role="group"
              aria-label="Transaction type"
              className="inline-flex items-center gap-1 p-1 bg-[#FAF8F5] border border-[#E5E0D8] rounded"
            >
              <button
                type="button"
                onClick={() => handleTransactionChange('rent')}
                aria-pressed={mode === 'rent'}
                className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'rent'
                    ? 'bg-[#1E3A5F] text-white'
                    : 'text-[#5C5A55] hover:text-[#141413]'
                }`}
              >
                For Rent
              </button>
              <button
                type="button"
                onClick={() => handleTransactionChange('sale')}
                aria-pressed={mode === 'sale'}
                className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'sale'
                    ? 'bg-[#1E3A5F] text-white'
                    : 'text-[#5C5A55] hover:text-[#141413]'
                }`}
              >
                For Sale
              </button>
            </div>

            <p className="text-xs text-[#5C5A55]">
              {isRent
                ? 'Search residences available for lease'
                : 'Search residential & land acquisitions worldwide'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              {/* Unified Location Field */}
              <div className="sm:col-span-2 lg:col-span-6">
                <label
                  htmlFor="hero-location"
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
                    id="hero-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter city, country, address, neighborhood or postcode..."
                    className="w-full h-11 pl-10 pr-9 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] placeholder:text-[#7A7770] focus:outline-none focus:border-[#1E3A5F]"
                  />
                  {location && (
                    <button
                      type="button"
                      onClick={() => setLocation('')}
                      aria-label="Clear location"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#7A7770] hover:text-[#141413] cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Property Type Selector */}
              <div className="lg:col-span-3">
                <label
                  htmlFor="hero-property-type"
                  className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
                >
                  Property Type
                </label>
                <select
                  id="hero-property-type"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full h-11 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                >
                  {PROPERTY_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value || 'all'} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prominent Search Properties CTA */}
              <div className="lg:col-span-3 flex items-end">
                <button
                  type="submit"
                  className="w-full h-11 px-5 bg-[#1E3A5F] hover:bg-[#142944] text-white text-xs font-semibold uppercase tracking-wider rounded inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Search size={15} />
                  <span>Search Properties</span>
                </button>
              </div>
            </div>

            {/* Compact More Filters Trigger */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowMoreFilters((prev) => !prev)}
                aria-expanded={showMoreFilters}
                aria-controls="hero-more-filters"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A5F] hover:text-[#142944] cursor-pointer"
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

              {activeAdvancedCount > 0 && (
                <button
                  type="button"
                  onClick={clearAdvancedFilters}
                  className="text-xs font-medium text-[#5C5A55] hover:text-[#141413] underline cursor-pointer"
                >
                  Clear advanced filters
                </button>
              )}
            </div>

            {/* Collapsible Advanced Filters */}
            {showMoreFilters && (
              <div
                id="hero-more-filters"
                className="pt-4 border-t border-[#E5E0D8] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
              >
                <div>
                  <label
                    htmlFor="hero-min-price"
                    className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
                  >
                    {isRent ? 'Min Monthly Rent' : 'Min Price'}
                  </label>
                  <input
                    id="hero-min-price"
                    type="number"
                    min={0}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder={isRent ? 'e.g. 1500' : 'e.g. 250000'}
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm font-mono text-[#141413] placeholder:text-[#7A7770] focus:outline-none focus:border-[#1E3A5F]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hero-max-price"
                    className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
                  >
                    {isRent ? 'Max Monthly Rent' : 'Max Price'}
                  </label>
                  <input
                    id="hero-max-price"
                    type="number"
                    min={0}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder={isRent ? 'e.g. 8000' : 'e.g. 2500000'}
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm font-mono text-[#141413] placeholder:text-[#7A7770] focus:outline-none focus:border-[#1E3A5F]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hero-bedrooms"
                    className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
                  >
                    Bedrooms
                  </label>
                  <select
                    id="hero-bedrooms"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
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
                    htmlFor="hero-bathrooms"
                    className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
                  >
                    Bathrooms
                  </label>
                  <select
                    id="hero-bathrooms"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
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
                    htmlFor="hero-listing-status"
                    className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
                  >
                    Listing Status
                  </label>
                  <select
                    id="hero-listing-status"
                    value={listingStatus}
                    onChange={(e) => setListingStatus(e.target.value)}
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                  >
                    {LISTING_STATUSES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {isRent && (
                  <>
                    <div>
                      <label
                        htmlFor="hero-rental-period"
                        className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
                      >
                        Rental Duration
                      </label>
                      <select
                        id="hero-rental-period"
                        value={rentalPeriod}
                        onChange={(e) => setRentalPeriod(e.target.value)}
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
                        htmlFor="hero-availability-date"
                        className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1.5"
                      >
                        Available By
                      </label>
                      <input
                        id="hero-availability-date"
                        type="date"
                        value={availabilityDate}
                        onChange={(e) => setAvailabilityDate(e.target.value)}
                        className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm font-mono text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
