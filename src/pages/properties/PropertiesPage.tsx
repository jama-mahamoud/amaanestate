import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw, Grid, MapPin, Building, DollarSign } from 'lucide-react';
import { useSEO } from '../../hooks/useSEO';
import { Property, PropertyType, ListingType, PropertyStatus } from '../../types';
import { searchProperties, PropertySearchFilters } from '../../services/properties';
import PropertyCard from '../../components/properties/PropertyCard';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import PremiumSelect from '../../components/ui/PremiumSelect';

export default function PropertiesPage() {
  const location = useLocation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search parameters state - safely initialized from homepage state redirects
  const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '');
  const [selectedType, setSelectedType] = useState<string>(location.state?.selectedType || 'all');
  const [selectedIntent, setSelectedIntent] = useState<string>(location.state?.selectedIntent || 'all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedBeds, setSelectedBeds] = useState<string>('all');
  
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Parse path context to auto-configure listings filters
  const getRouteDefaults = (): Partial<PropertySearchFilters> => {
    const path = location.pathname;
    if (path.includes('/buy')) {
      return { listingType: 'sale' };
    }
    if (path.includes('/rent')) {
      return { listingType: 'rent' };
    }
    if (path.includes('/land')) {
      return { propertyType: 'land' };
    }
    if (path.includes('/commercial')) {
      return { propertyType: 'commercial' };
    }
    return {};
  };

  const routeDefaults = getRouteDefaults();

  useSEO({
    title: 'Browse Properties | AmaanEstate',
    description: 'Find verified residential, commercial, and land properties in Jigjiga, Somali Region, and beyond.'
  });

  // Fetch properties using actual Firestore services
  const fetchPropertiesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters: PropertySearchFilters = {
        status: 'available'
      };

      // Apply defaults from route
      if (routeDefaults.listingType) {
        activeFilters.listingType = routeDefaults.listingType;
      } else if (selectedIntent !== 'all') {
        activeFilters.listingType = selectedIntent as ListingType;
      }

      if (routeDefaults.propertyType) {
        activeFilters.propertyType = routeDefaults.propertyType;
      } else if (selectedType !== 'all') {
        activeFilters.propertyType = selectedType as PropertyType;
      }

      // Apply bedrooms
      if (selectedBeds !== 'all') {
        activeFilters.bedrooms = Number(selectedBeds);
      }

      // Apply price ranges
      if (selectedPriceRange !== 'all') {
        const [min, max] = selectedPriceRange.split('-').map(Number);
        activeFilters.minPrice = min;
        if (max) activeFilters.maxPrice = max;
      }

      // Apply textual location / keyword search
      if (searchQuery.trim()) {
        activeFilters.locationQuery = searchQuery;
      }

      const results = await searchProperties(activeFilters);

      // Perform local sorting
      let sortedResults = [...results];
      if (sortBy === 'price_asc') {
        sortedResults.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_desc') {
        sortedResults.sort((a, b) => b.price - a.price);
      } else {
        // Default Newest is sorted by default from service inside timestamp, but backup check:
        sortedResults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      setProperties(sortedResults);
    } catch (err: any) {
      console.error(err);
      setError('Unable to fetch property listings. Please inspect your database connections.');
    } finally {
      setLoading(false);
    }
  };

  // Re-trigger query on filters or path transitions
  useEffect(() => {
    // Reset intent/type selection if route presets them
    if (routeDefaults.listingType) {
      setSelectedIntent(routeDefaults.listingType);
    } else if (location.pathname === '/properties') {
      setSelectedIntent('all');
    }

    if (routeDefaults.propertyType) {
      setSelectedType(routeDefaults.propertyType);
    } else if (location.pathname === '/properties') {
      setSelectedType('all');
    }

    fetchPropertiesData();
  }, [location.pathname, selectedType, selectedIntent, selectedPriceRange, selectedBeds, sortBy]);

  const handleTextSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPropertiesData();
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/buy')) return 'Properties for Sale';
    if (path.includes('/rent')) return 'Properties for Rent';
    if (path.includes('/land')) return 'Land Parcels';
    if (path.includes('/commercial')) return 'Commercial Estates';
    return 'All Verified Listings';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Breadcrumbs */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
          <span>AmaanEstate</span>
          <span>/</span>
          <span className="text-neutral-300">{getPageTitle()}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-none">
          {getPageTitle()}
        </h1>
        <p className="text-xs text-neutral-400 max-w-lg">
          Explore real-time listings verified by certified local AmaanEstate agents.
        </p>
      </div>

      {/* Advanced Filter / Search Panel */}
      <div className="bg-[#0c0c14] border border-white/[0.04] rounded-xl p-5 space-y-4">
        <form onSubmit={handleTextSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by neighborhood, district, city or address..."
              className="pl-10 bg-[#050508] border-neutral-800 text-white placeholder-neutral-500 focus-visible:ring-cyan-500/20"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium cursor-pointer"
            >
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-neutral-800 text-neutral-300 hover:bg-white/[0.04] flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>
        </form>

        {/* Expandable Secondary Filter Selectors */}
        {(showFilters || routeDefaults.listingType || routeDefaults.propertyType) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/[0.03] animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Intent Filter - Hidden if Route Presets It */}
            {!routeDefaults.listingType && (
              <div className="space-y-1.5">
                <label className="text-xxs uppercase tracking-widest text-neutral-500 font-mono font-semibold">Intent</label>
                <PremiumSelect
                  label="Intent"
                  value={selectedIntent}
                  onChange={setSelectedIntent}
                  options={[
                    { value: 'all', label: 'Buy & Rent' },
                    { value: 'sale', label: 'For Sale' },
                    { value: 'rent', label: 'For Rent' }
                  ]}
                  className="w-full bg-[#050508] border-neutral-800"
                />
              </div>
            )}

            {/* Type Filter - Hidden if Route Presets It */}
            {!routeDefaults.propertyType && (
              <div className="space-y-1.5">
                <label className="text-xxs uppercase tracking-widest text-neutral-500 font-mono font-semibold">Property Type</label>
                <PremiumSelect
                  label="Property Type"
                  value={selectedType}
                  onChange={setSelectedType}
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'house', label: 'House' },
                    { value: 'apartment', label: 'Apartment' },
                    { value: 'villa', label: 'Villa' },
                    { value: 'land', label: 'Land Parcel' },
                    { value: 'commercial', label: 'Commercial' }
                  ]}
                  className="w-full bg-[#050508] border-neutral-800"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xxs uppercase tracking-widest text-neutral-500 font-mono font-semibold">Price Filter</label>
              <PremiumSelect
                label="Price Filter"
                value={selectedPriceRange}
                onChange={setSelectedPriceRange}
                options={[
                  { value: 'all', label: 'Any Price' },
                  { value: '0-500000', label: 'Under 500k ETB' },
                  { value: '500000-2000000', label: '500k - 2M ETB' },
                  { value: '2000000-10000000', label: '2M - 10M ETB' },
                  { value: '10000000-0', label: '10M+ ETB' }
                ]}
                className="w-full bg-[#050508] border-neutral-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs uppercase tracking-widest text-neutral-500 font-mono font-semibold">Bedrooms</label>
              <PremiumSelect
                label="Bedrooms"
                value={selectedBeds}
                onChange={setSelectedBeds}
                options={[
                  { value: 'all', label: 'Any Beds' },
                  { value: '1', label: '1+ Beds' },
                  { value: '2', label: '2+ Beds' },
                  { value: '3', label: '3+ Beds' },
                  { value: '4', label: '4+ Beds' }
                ]}
                className="w-full bg-[#050508] border-neutral-800"
              />
            </div>
          </div>
        )}
      </div>

      {/* Control Row: Result count & Sorting */}
      <div className="flex items-center justify-between border-b border-white/[0.03] pb-4">
        <div className="text-xs text-neutral-400 font-mono">
          Showing <span className="text-white font-bold">{properties.length}</span> matching properties
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown size={14} className="text-neutral-500" />
          <PremiumSelect
            label="Sort By"
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'newest', label: 'Newest Listed' },
              { value: 'price_asc', label: 'Price: Low to High' },
              { value: 'price_desc', label: 'Price: High to Low' }
            ]}
            className="w-36 sm:w-44 bg-transparent border-0 text-xs font-medium text-neutral-300"
          />
        </div>
      </div>

      {/* Main Results Listing Display */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="text-cyan-400 animate-spin" size={32} />
          <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">Querying Firestore properties...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center max-w-md mx-auto space-y-3">
          <div className="text-red-400 font-bold font-mono">Connection Error</div>
          <p className="text-xs text-neutral-400 leading-relaxed">{error}</p>
          <Button onClick={fetchPropertiesData} className="bg-neutral-900 border border-neutral-800 text-white">Retry Connection</Button>
        </div>
      ) : properties.length === 0 ? (
        <div className="py-24 text-center max-w-sm mx-auto space-y-4">
          <Building className="text-neutral-600 mx-auto" size={48} />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Properties Found</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We couldn't discover any active listings matching your filters in the database. Please broaden your filters.
            </p>
          </div>
          <Button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedIntent('all');
              setSelectedPriceRange('all');
              setSelectedBeds('all');
            }}
            className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 text-xs cursor-pointer"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
