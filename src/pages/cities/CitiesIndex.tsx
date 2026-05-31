import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Building2, 
  Users, 
  ArrowUpRight, 
  Search, 
  Globe, 
  Home, 
  Layers
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { CITIES_DATA, CityData } from '@/data/cities';
import { listingService } from '@/services/listingService';
import { brokerService } from '@/services/brokerService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CitiesIndex() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<'All' | 'Somalia' | 'Somaliland' | 'Ethiopia'>('All');
  
  const [listingCounts, setListingCounts] = useState<Record<string, number>>({});
  const [brokerCounts, setBrokerCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Browse of Vetted Local Markets & Cities',
    description: 'Explore verified real estate properties, land plots, and certified brokers across 22 premier cities in Somalia, Somaliland, and Ethiopia with verified trust profiles.',
    type: 'website',
    url: `${window.location.origin}/cities`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': 'AmaanEstate Verified Cities Directory',
      'description': 'Verified regional marketplaces and certified local property agencies across 22 target cities and administrative centers in Somalia, Somaliland, and Ethiopia.',
      'itemListElement': CITIES_DATA.map((city, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Place',
          'name': city.name,
          'url': `${window.location.origin}/cities/${city.slug}`,
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': city.dbValue,
            'addressRegion': city.region,
            'addressCountry': city.country
          }
        }
      }))
    }
  });

  useEffect(() => {
    let active = true;
    const fetchCityCounts = async () => {
      try {
        const [listingsResult, brokersResult, agenciesResult] = await Promise.all([
          listingService.getListings({ limit: 400 }),
          brokerService.getVerifiedBrokers(),
          brokerService.getVerifiedAgencies()
        ]);

        if (!active) return;

        // Calculate dynamic listing counts per city
        const lCounts: Record<string, number> = {};
        listingsResult.listings.forEach((item: any) => {
          const cityVal = (item.city || '').trim().toLowerCase();
          if (cityVal) {
            lCounts[cityVal] = (lCounts[cityVal] || 0) + 1;
          }
        });

        // Calculate agent counts per city
        const bCounts: Record<string, number> = {};
        const combineBrokers = [
          ...brokersResult.map(b => ({ ...b, isAgency: false })),
          ...agenciesResult.map(a => ({ ...a, isAgency: true }))
        ];

        combineBrokers.forEach((item: any) => {
          const cityVal = (item.city || '').trim().toLowerCase();
          if (cityVal) {
            bCounts[cityVal] = (bCounts[cityVal] || 0) + 1;
          }
        });

        setListingCounts(lCounts);
        setBrokerCounts(bCounts);
      } catch (err) {
        console.error('[CitiesIndex] Error resolving listing/agent counts:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCityCounts();
    return () => { active = false; };
  }, []);

  // Filter 22 Cities based on user inputs
  const filteredCities = useMemo(() => {
    return CITIES_DATA.filter(city => {
      const matchesSearch = 
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.dbValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCountry = selectedCountry === 'All' || city.country === selectedCountry;

      return matchesSearch && matchesCountry;
    });
  }, [searchQuery, selectedCountry]);

  // Aggregate global highlights
  const totals = useMemo(() => {
    const activeMarkets = CITIES_DATA.length;
    const totalProperties = Object.values(listingCounts).reduce((a, b) => a + b, 0);
    const totalBrokers = Object.values(brokerCounts).reduce((a, b) => a + b, 0);

    return { activeMarkets, totalProperties, totalBrokers };
  }, [listingCounts, brokerCounts]);

  return (
    <div className="pt-28 pb-28 min-h-screen bg-luxury-black text-white selection:bg-[#C5A059]/10 selection:text-[#C5A059]">
      {/* 1. Header Hero Panel */}
      <section className="relative py-12 md:py-20 border-b border-white/5 bg-gradient-to-b from-[#0d0d0d] to-[#070707]">
        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059]/5 border border-[#C5A059]/20 text-[11px] text-[#C5A059] font-medium tracking-wider uppercase mb-1">
            <Globe className="w-3.5 h-3.5" /> Regional Marketplace Index
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-light text-white tracking-tight">
            Explore Properties by City
          </h1>
          <p className="max-w-2xl mx-auto text-white/50 text-xs sm:text-sm md:text-base leading-relaxed font-light">
            Discover real estate listings, secure agricultural land parcels, and certified local brokers operating across 22 target cities in Somalia, Somaliland, and Ethiopia.
          </p>

          {/* Search Exeperience & Filters */}
          <div className="max-w-2xl mx-auto pt-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
              <Input
                type="text"
                placeholder="Search city, region, state or description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/5 border-white/10 h-12 text-sm text-white focus-visible:ring-[#C5A059] rounded-xl"
              />
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {(['All', 'Somalia', 'Somaliland', 'Ethiopia'] as const).map(option => (
                <button
                  key={option}
                  onClick={() => setSelectedCountry(option)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all border ${
                    selectedCountry === option
                      ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-lg shadow-[#C5A059]/10'
                      : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {option === 'All' ? 'All Territories' : option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Global Aggregations Bar */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-6 border-b border-white/5">
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto text-center">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-xl sm:text-2xl font-light text-[#C5A059] font-mono">{totals.activeMarkets}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Planned Hubs</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-xl sm:text-2xl font-light text-[#C5A059] font-mono">
              {loading ? '...' : totals.totalProperties}
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Active Listings</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-xl sm:text-2xl font-light text-[#C5A059] font-mono">
              {loading ? '...' : totals.totalBrokers}
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Vetted Agents</div>
          </div>
        </div>
      </section>

      {/* 3. Cities List Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        {filteredCities.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <p className="text-white/40 text-sm">No cities match your search filter.</p>
            <Button 
              className="bg-white/5 hover:bg-white/10 text-white h-10 border border-white/10"
              onClick={() => { setSearchQuery(''); setSelectedCountry('All'); }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCities.map(city => {
              const countMatchKey = city.dbValue.toLowerCase();
              const listingsInCity = listingCounts[countMatchKey] || 0;
              const brokersInCity = brokerCounts[countMatchKey] || 0;

              return (
                <div 
                  key={city.slug}
                  className="bg-[#111]/45 p-6 rounded-2xl border border-white/5 hover:border-[#C5A059]/20 transition-all duration-300 group flex flex-col justify-between overflow-hidden relative"
                >
                  {/* Subtle Background Accent Gradient on Group Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${city.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                  <div className="relative z-10 space-y-4">
                    {/* City Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#C5A059]/70" /> {city.region}
                        </span>
                        <h3 className="text-lg font-medium text-white group-hover:text-[#C5A059] transition-colors duration-300">
                          {city.name}
                        </h3>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 font-medium text-white/60 capitalize">
                        {city.country}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-white/50 text-xs leading-relaxed line-clamp-3 font-light">
                      {city.description}
                    </p>

                    {/* Meta statistics badges */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <div className="flex items-center gap-1.5 text-white/60 text-[11px] bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-lg">
                        <Layers className="w-3 h-3 text-[#C5A059]" />
                        <span>{listingsInCity} {listingsInCity === 1 ? 'property' : 'properties'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white/60 text-[11px] bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-lg">
                        <Users className="w-3 h-3 text-[#C5A059]" />
                        <span>{brokersInCity} {brokersInCity === 1 ? 'agent' : 'agents'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="relative z-10 pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-white/30 uppercase tracking-wider font-mono">
                      Market code: Aa-{city.slug.substring(0, 3)}
                    </span>
                    <Link
                      to={`/cities/${city.slug}`}
                      className="inline-flex items-center gap-1.5 text-[#C5A059] hover:text-white hover:underline text-xs font-semibold tracking-wider transition-colors"
                    >
                      Browse City <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Proactive Agent Acquisition Footer Banner */}
      <section className="py-20 border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-display font-light text-white">
            Expand Your Agency Across Somalia & Ethiopia
          </h2>
          <p className="text-white/50 text-xs sm:text-sm font-light leading-relaxed">
            Register your brokerage in any of the 22 index hubs to connect with international diaspora buyers, list secure and vetted properties, and build your digital Trust Score.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button className="w-full sm:w-auto bg-[#C5A059] hover:bg-white text-black font-bold h-12 px-8 rounded-xl" asChild>
              <Link to="/agents/register">Become an Agent / Broker</Link>
            </Button>
            <Button className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white h-12 px-8 rounded-xl border border-white/10" asChild>
              <Link to="/about">Learn Our Verification Shield</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
