import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Search, X } from 'lucide-react';
import { TransactionType } from '../../types';

export default function PropertySearchHero() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<TransactionType>('sale');
  const [location, setLocation] = useState('');

  const isSale = mode === 'sale';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPath = isSale ? '/buy' : '/rent';
    const params = new URLSearchParams();

    if (location.trim()) {
      params.set('location', location.trim());
    }

    const qs = params.toString();
    navigate(qs ? `${targetPath}?${qs}` : targetPath);
  };

  return (
    <section
      aria-labelledby="home-hero-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 lg:pt-12"
    >
      <div className="pb-10 sm:pb-12 border-b border-[#E5E0D8]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Editorial Positioning + Simple Marketplace Search */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] font-semibold text-[#8C4A27]">
                AMAAN ESTATE · Global Real Estate Media, Research &amp; Marketplace
              </p>
              <h1
                id="home-hero-heading"
                className="text-3xl sm:text-5xl lg:text-[3.15rem] xl:text-[3.4rem] font-serif font-semibold leading-[1.08] text-[#141413] tracking-tight text-balance"
              >
                Global Real Estate. Informed Decisions.
              </h1>
              <p className="text-sm sm:text-base lg:text-[1.0625rem] text-[#4A4843] leading-[1.65] max-w-xl">
                Discover properties, explore international markets, and access trusted real estate research from around the world.
              </p>
            </div>

            {/* Focused Buy / Rent Search Box */}
            <div className="bg-white border border-[#E5E0D8] rounded-md p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div
                  role="tablist"
                  aria-label="Property transaction type"
                  className="inline-flex items-center gap-1 p-1 bg-[#FAF8F5] border border-[#E5E0D8] rounded"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isSale}
                    onClick={() => setMode('sale')}
                    className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer whitespace-nowrap ${
                      isSale
                        ? 'bg-[#1E3A5F] text-white'
                        : 'text-[#5C5A55] hover:text-[#141413]'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={!isSale}
                    onClick={() => setMode('rent')}
                    className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer whitespace-nowrap ${
                      !isSale
                        ? 'bg-[#1E3A5F] text-white'
                        : 'text-[#5C5A55] hover:text-[#141413]'
                    }`}
                  >
                    Rent
                  </button>
                </div>

                <span className="text-xs text-[#5C5A55]">
                  {isSale ? 'Properties for sale' : 'Residences for rent'}
                </span>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1 min-w-0">
                  <label htmlFor="hero-location" className="sr-only">
                    Search by city, country, address, or location
                  </label>
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
                    placeholder="City, country, address, or location..."
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

                <button
                  type="submit"
                  className="h-11 px-6 bg-[#1E3A5F] hover:bg-[#142944] text-white text-xs font-semibold uppercase tracking-wider rounded inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Search size={15} aria-hidden="true" />
                  <span>Explore Properties</span>
                </button>
              </form>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold">
              <Link
                to="/global-markets"
                className="inline-flex items-center gap-1.5 text-[#1E3A5F] hover:text-[#8C4A27] transition-colors"
              >
                <span>Explore Markets</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <span aria-hidden="true" className="text-[#D6CEBE]">|</span>
              <Link
                to="/buy"
                className="text-[#5C5A55] hover:text-[#141413] transition-colors"
              >
                Browse Buy Listings
              </Link>
              <Link
                to="/rent"
                className="text-[#5C5A55] hover:text-[#141413] transition-colors"
              >
                Browse Rentals
              </Link>
            </div>
          </div>

          {/* Right: Editorial Real Estate Photography */}
          <div className="lg:col-span-6">
            <div className="relative aspect-[16/11] lg:aspect-[4/3] w-full overflow-hidden rounded-md bg-[#EBE6DF] border border-[#E5E0D8] group">
              <picture className="block w-full h-full">
                <source
                  type="image/webp"
                  srcSet="/images/hero/hero-pavilion-640.webp 640w, /images/hero/hero-pavilion-960.webp 960w, /images/hero/hero-pavilion-1376.webp 1376w"
                  sizes="(max-width: 1023px) calc(100vw - 2rem), 600px"
                />
                <img
                  src="/images/hero/hero-pavilion-960.jpg"
                  alt="Contemporary limestone and glass architectural residence overlooking landscaped grounds"
                  width={1376}
                  height={768}
                  loading="eager"
                  decoding="sync"
                  fetchPriority="high"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </picture>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
