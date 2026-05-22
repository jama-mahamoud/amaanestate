import React, { useState } from 'react';
import { motion } from 'motion/react';
import HomeSearch from '@/components/HomeSearch';
import LatestNews from '@/components/LatestNews';
import PropertyCard from '@/components/PropertyCard';
import VehicleCard from '@/components/VehicleCard';
import { useListings } from '@/hooks/useListings';
import { Listing } from '@/types';
import { Loader2 } from 'lucide-react';
import { listingService, ListingFilter } from '@/services/listingService';

export default function Home() {
  const { listings: featuredListings, loading: listingsLoading } = useListings({ category: 'property', limit: 3 });
  const [searchResults, setSearchResults] = useState<Listing[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (filters: ListingFilter) => {
    setIsSearching(true);
    try {
      const result = await listingService.getListings(filters);
      setSearchResults(result.listings);
    } catch (e) {
      console.error(e);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const listingsToDisplay = searchResults || featuredListings;

  return (
    <div className="min-h-screen bg-luxury-black text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-luxury-gold/5 via-luxury-black to-luxury-black z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-display font-medium tracking-tight mb-8"
            >
              Discover <span className="text-luxury-gold">Premium</span> Assets
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/40 text-sm font-bold uppercase tracking-[0.2em]"
            >
              VERIFIED REAL ESTATE & MOBILITY SOLUTIONS
            </motion.p>
          </div>
          
          <HomeSearch onSearch={handleSearch} />
        </div>
      </section>

      {/* Featured Properties / Search Results */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-display font-bold text-white mb-10 tracking-tight">
             {searchResults ? 'Search Results' : 'Recent Acquisitions'}
          </h2>
          {listingsLoading || isSearching ? (
             <div className="flex justify-center py-12"><Loader2 className="animate-spin text-luxury-gold" size={40} /></div>
          ) : listingsToDisplay.length === 0 ? (
            <div className="text-center py-12 text-white/50 font-medium">
               {searchResults ? 'No listings found matching your filters.' : 'No recent acquisitions available.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {listingsToDisplay.map(listing => (
                  listing.category === 'vehicle' 
                    ? <VehicleCard key={listing.id} vehicle={listing as any} />
                    : <PropertyCard key={listing.id} property={listing as any} />
                ))}
            </div>
          )}
        </div>
      </section>

      <LatestNews />
      
    </div>
  );
}
