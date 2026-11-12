import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
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
];

const SALE_BUDGET_OPTIONS = [
  { value: '', label: 'Any Max Budget' },
  { value: '500000', label: 'Up to $500,000' },
  { value: '1000000', label: 'Up to $1,000,000' },
  { value: '2500000', label: 'Up to $2,500,000' },
  { value: '5000000', label: 'Up to $5,000,000' },
  { value: '10000000', label: 'Up to $10,000,000' },
];

const RENT_BUDGET_OPTIONS = [
  { value: '', label: 'Any Max Rent / mo' },
  { value: '2500', label: 'Up to $2,500 / mo' },
  { value: '5000', label: 'Up to $5,000 / mo' },
  { value: '10000', label: 'Up to $10,000 / mo' },
  { value: '20000', label: 'Up to $20,000 / mo' },
];

export default function PropertySearchHero() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<TransactionType>('sale');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPath = mode === 'rent' ? '/rent' : '/buy';
    const params = new URLSearchParams();
    if (location.trim()) params.set('location', location.trim());
    if (propertyType) params.set('type', propertyType);
    if (maxPrice) params.set('max_price', maxPrice);

    const qs = params.toString();
    navigate(qs ? `${targetPath}?${qs}` : targetPath);
  };

  const budgetOptions = mode === 'rent' ? RENT_BUDGET_OPTIONS : SALE_BUDGET_OPTIONS;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-14">
      <div className="space-y-8 lg:space-y-10 pb-10 sm:pb-12 border-b border-[#E5E0D8]">
        {/* Architectural Headline + Visual Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5 py-1">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem] font-serif font-semibold leading-[1.06] text-[#141413] tracking-tight text-balance">
              Global Real Estate. Informed Decisions.
            </h1>

            <p className="text-base sm:text-[1.0625rem] text-[#4A4843] leading-[1.65] max-w-xl">
              Explore international properties for sale and rent, alongside independent real estate journalism, architectural insight, and global market research.
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

        {/* Dedicated Marketplace Search Bar */}
        <div className="bg-white border border-[#E5E0D8] rounded-[6px] p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E0D8] pb-3">
            <div className="inline-flex items-center gap-1 p-1 bg-[#FAF8F5] border border-[#E5E0D8] rounded">
              <button
                type="button"
                onClick={() => {
                  setMode('sale');
                  setMaxPrice('');
                }}
                aria-pressed={mode === 'sale'}
                className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'sale'
                    ? 'bg-[#1E3A5F] text-white'
                    : 'text-[#5C5A55] hover:text-[#141413]'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('rent');
                  setMaxPrice('');
                }}
                aria-pressed={mode === 'rent'}
                className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'rent'
                    ? 'bg-[#1E3A5F] text-white'
                    : 'text-[#5C5A55] hover:text-[#141413]'
                }`}
              >
                Rent
              </button>
            </div>

            <p className="text-xs text-[#5C5A55]">
              {mode === 'sale'
                ? 'Search residential & land acquisitions worldwide'
                : 'Search residences available for lease'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-5">
              <label htmlFor="hero-location" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1">
                Location
              </label>
              <input
                id="hero-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, region, or country (e.g. Toronto, Dubai, London)"
                className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] placeholder:text-[#7A7770] focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div className="lg:col-span-3">
              <label htmlFor="hero-property-type" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1">
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

            <div className="lg:col-span-2">
              <label htmlFor="hero-budget" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1">
                {mode === 'rent' ? 'Max Monthly Rent' : 'Max Budget'}
              </label>
              <select
                id="hero-budget"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full h-11 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
              >
                {budgetOptions.map((opt) => (
                  <option key={opt.value || 'any'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full h-11 px-4 bg-[#1E3A5F] hover:bg-[#142944] text-white text-xs font-semibold uppercase tracking-wider rounded inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Search size={15} />
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
