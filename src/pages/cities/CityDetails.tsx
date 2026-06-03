import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Building2, 
  Users, 
  ArrowLeft, 
  Layers, 
  Tag, 
  DollarSign, 
  Search, 
  X, 
  Activity, 
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { CITIES_DATA, CityData } from '@/data/cities';
import { listingService } from '@/services/listingService';
import { brokerService } from '@/services/brokerService';
import PropertyCard from '@/components/PropertyCard';
import { Broker, Agency, Listing } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CityDetails() {
  const { slug } = useParams<{ slug: string }>();
  
  // Find matching city configuration
  const cityData = useMemo(() => {
    return CITIES_DATA.find(c => c.slug === slug);
  }, [slug]);

  // UI state managers
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  
  const [allAgents, setAllAgents] = useState<(Broker | (Agency & { fullName: string; isAgency: boolean }))[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcat, setSelectedSubcat] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState(''); // 'sale' | 'rent'
  const [maxPrice, setMaxPrice] = useState<string>('');

  // 1. Dynamic SEO setup
  useSEO({
    title: cityData ? `Verified Properties in ${cityData.name}` : 'City Marketplace',
    description: cityData 
      ? `Browse checked real estate listings, land plots, agricultural parcels, and luxury apartments in ${cityData.name}. Contact vetted local agents operating in ${cityData.region}.`
      : 'Explore properties across premium regional hubs.',
    type: 'website',
    url: cityData ? `${window.location.origin}/cities/${cityData.slug}` : window.location.href,
    structuredData: cityData ? {
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      'name': `AmaanEstate ${cityData.name}`,
      'description': cityData.description,
      'url': `${window.location.origin}/cities/${cityData.slug}`,
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': cityData.dbValue,
        'addressRegion': cityData.region,
        'addressCountry': cityData.country
      }
    } : undefined
  });

  // Fetch lists
  useEffect(() => {
    if (!cityData) return;
    
    let active = true;

    // Load active listings and brokers
    const loadCityEcosystem = async () => {
      setLoadingListings(true);
      setLoadingAgents(true);
      try {
        // Align with homepage aggregation logic
        const [listingsRes, brokersRes, agenciesRes] = await Promise.all([
          listingService.getListings({ 
            city: cityData.dbValue, 
            limit: 1000,
            category: 'property' // Explicitly match aggregation category filter
          }),
          brokerService.getVerifiedBrokers(),
          brokerService.getVerifiedAgencies()
        ]);

        if (!active) return;
        
        console.log(`[CityDetails] Debug: Query results for ${cityData.dbValue}:`, listingsRes.listings.map(l => ({ id: l.id, city: l.city, status: l.status, category: l.category })));
        setAllListings(listingsRes.listings);

        const targetCityLower = cityData.dbValue.toLowerCase().trim();

        // Filter agents that match this city
        const combined = [
          ...brokersRes.map(b => ({ ...b, isAgency: false })),
          ...agenciesRes.map(a => ({ ...a, fullName: (a as any).agencyName || 'Agency Partner', isAgency: true }))
        ];

        const matchedAgents = combined.filter((p: any) => {
          const agentCity = (p.city || '').toLowerCase().trim();
          return (
            agentCity === targetCityLower || 
            agentCity.includes(targetCityLower) ||
            targetCityLower.includes(agentCity)
          );
        });
        setAllAgents(matchedAgents);

      } catch (err) {
        console.error('[CityDetails] Fail to resolve ecosystem metrics:', err);
      } finally {
        if (active) {
          setLoadingListings(false);
          setLoadingAgents(false);
        }
      }
    };

    loadCityEcosystem();
    return () => { active = false; };
  }, [cityData]);

  // Compute available Subcategories within current city
  const subcategories = useMemo(() => {
    if (allListings.length === 0) return cityData?.featuredPropertyTypes || [];
    const subs = allListings.map(l => l.subcategory || '').filter(Boolean);
    const unique = Array.from(new Set(subs));
    
    // Capitalize beautifully
    return unique.map(u => u.charAt(0).toUpperCase() + u.slice(1));
  }, [allListings, cityData]);

  // Filter listings based on user selection
  const filteredListings = useMemo(() => {
    return allListings.filter(l => {
      // 1. Text Search query
      const matchText = !searchQuery || 
        l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l as any).address?.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Subcategory filter
      const matchSubcat = !selectedSubcat || 
        (l.subcategory || '').trim().toLowerCase() === selectedSubcat.trim().toLowerCase();

      // 3. Purchase purpose
      const matchPurpose = !selectedPurpose || 
        (l.listingType || '').trim().toLowerCase() === selectedPurpose.trim().toLowerCase();

      // 4. Max price
      const numericMax = parseFloat(maxPrice);
      const matchPrice = isNaN(numericMax) || (l.price || 0) <= numericMax;

      return matchText && matchSubcat && matchPurpose && matchPrice;
    });
  }, [allListings, searchQuery, selectedSubcat, selectedPurpose, maxPrice]);

  // Handle case where city is invalid
  if (!cityData) {
    return (
      <div className="min-h-screen bg-luxury-black text-white pt-36 pb-24 text-center">
        <div className="max-w-md mx-auto space-y-6 px-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#C5A059]">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-light">City Profile Not Found</h2>
          <p className="text-white/40 text-sm">
            The requested municipal or regional real estate profile is not currently initialized in our system.
          </p>
          <Button className="bg-[#C5A059] text-black font-bold rounded-xl" asChild>
            <Link to="/cities">
              <ArrowLeft className="w-4 h-4 mr-2" /> Return to Cities Directory
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black text-white selection:bg-[#C5A059]/10 selection:text-[#C5A059]">
      
      {/* Back to Cities navigation bar */}
      <div className="bg-[#c5a059]/5 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3">
          <Link 
            to="/cities"
            className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#C5A059] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Cities Directory
          </Link>
          <span className="text-white/20 text-xs">/</span>
          <span className="text-xs text-white/40">{cityData.name} Market Hub</span>
        </div>
      </div>

      {/* Hero Banner Section */}
      <section className="relative py-16 md:py-24 border-b border-white/5 bg-[#090909]">
        <div className="absolute inset-0 bg-gradient-to-br opacity-5 bg-cover pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 text-[10px] text-[#C5A059] font-bold uppercase tracking-widest flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {cityData.region}, {cityData.country}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/50 tracking-wider">
                  Verified Local Hub
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-display font-light text-white tracking-tight">
                Properties in {cityData.name}
              </h1>
              <p className="text-white/60 text-xs sm:text-sm md:text-base leading-relaxed max-w-3xl font-light">
                {cityData.description}
              </p>

              {/* Dynamic stats banner */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C5A059]" />
                  <span className="text-xs text-white/50">
                    <strong className="text-white font-mono text-sm">{loadingListings ? '...' : allListings.length}</strong> listings currently public
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#C5A059]" />
                  <span className="text-xs text-white/50">
                    <strong className="text-white font-mono text-sm">{loadingAgents ? '...' : allAgents.length}</strong> registered brokers active
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 flex items-center gap-1.5 border-b border-white/5 pb-3">
                <Activity className="w-3.5 h-3.5 text-[#C5A059]" /> Hub Overview
              </h3>
              <ul className="space-y-3.5 text-xs text-white/60">
                <li className="flex justify-between items-center">
                  <span>Territory</span>
                  <span className="text-white font-medium">{cityData.country}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Target Area Code</span>
                  <span className="text-white font-medium">Aa-{cityData.slug.substring(0,3).toUpperCase()}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Sectors Represented</span>
                  <span className="text-white font-medium">{cityData.featuredPropertyTypes.length} major</span>
                </li>
              </ul>
              <Button className="w-full bg-[#C5A059] hover:bg-white text-black font-bold h-10 text-xs" asChild>
                <Link to="/agents/register">Become Certified Partner in {cityData.dbValue}</Link>
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* Main Filter & Listings Grid Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Sub-filtering Column */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-[#111] p-6 rounded-2xl border border-white/5 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">Filters</h3>
                { (searchQuery || selectedSubcat || selectedPurpose || maxPrice) && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSubcat('');
                      setSelectedPurpose('');
                      setMaxPrice('');
                    }}
                    className="text-[10px] text-[#C5A059] hover:underline"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Title Search */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider block">Search keywords</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-white/30" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="E.g., beach, villa, plot, security..."
                    className="pl-9 h-10 text-xs bg-white/5 border-white/10 text-white rounded-lg focus-visible:ring-[#C5A059]"
                  />
                </div>
              </div>

              {/* Type Category Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider block">Property Category</label>
                <select
                  value={selectedSubcat}
                  onChange={e => setSelectedSubcat(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded-lg px-3 h-10 text-white focus:outline-none"
                >
                  <option value="" className="bg-[#111]">All Categories</option>
                  {subcategories.map(catOption => (
                    <option key={catOption} value={catOption} className="bg-[#111]">{catOption}</option>
                  ))}
                </select>
              </div>

              {/* Buying Purpose Filter */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider block">Transaction Type</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: 'All', value: '' },
                    { label: 'Sale', value: 'sale' },
                    { label: 'Rent', value: 'rent' }
                  ].map(btn => (
                    <button
                      key={btn.value}
                      onClick={() => setSelectedPurpose(btn.value)}
                      className={`h-9 px-2 text-[10px] font-bold uppercase rounded-md border transition-all ${
                        selectedPurpose === btn.value
                          ? 'bg-[#C5A059] text-black border-[#C5A059]'
                          : 'bg-white/5 border-white/10 text-white/55 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Budget Filtering */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider block">Max Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-white/30 text-xs">$</span>
                  <Input
                    type="number"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    placeholder="E.g., 250000"
                    className="pl-7 h-10 text-xs bg-white/5 border-white/10 text-white rounded-lg"
                  />
                </div>
              </div>

            </div>

            {/* Display list of featured types */}
            <div className="bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-3 block">Target Asset Sectors</h4>
              <div className="flex flex-wrap gap-2">
                {cityData.featuredPropertyTypes.map(t => (
                  <span 
                    key={t}
                    onClick={() => {
                      setSelectedSubcat(t);
                    }} 
                    className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-white/60 hover:text-[#C5A059] hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Listings Display Column */}
          <div className="lg:col-span-9 space-y-8">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-xl font-display font-light text-white">
                Available Listings in {cityData.dbValue}
              </h2>
              <span className="text-xs text-white/40">
                Showing {filteredListings.length} of {allListings.length} results
              </span>
            </div>

            {loadingListings ? (
              <div className="py-24 text-center text-white/40 text-xs space-y-4">
                <div className="w-10 h-10 border-2 border-t-[#C5A059] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto" />
                <p className="animate-pulse">Loading verified city listings database...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              
              /* USER REQUEST REQUIREMENT: "If a city currently has no listings, display: 'Listings Coming Soon' and provide links to nearby active markets." */
              <div className="p-8 sm:p-12 rounded-3xl bg-[#111]/40 border border-white/5 text-center space-y-6">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-12 h-12 bg-[#C5A059]/10 border border-[#C5A059]/20 rounded-full flex items-center justify-center mx-auto text-[#C5A059]">
                    <Clock className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-lg font-medium text-white">Listings Coming Soon</h3>
                  
                  <p className="text-xs text-white/50 leading-relaxed font-light">
                    We are currently onboarding local independent brokers and mapping premier land titles in the <span className="text-white font-medium">{cityData.name}</span> district. No properties are live on our platform yet.
                  </p>
                </div>

                <div className="border-t border-white/5 pt-6 max-w-xl mx-auto space-y-4">
                  <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
                    Explore Surrounding Active Regional Markets
                  </h4>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {cityData.nearbyActiveMarkets.map(market => (
                      <Link
                        key={market.slug}
                        to={`/cities/${market.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-[#C5A059]/10 border border-white/5 text-xs text-[#C5A059] hover:text-[#C5A059] transition-all hover:-translate-y-0.5"
                      >
                        {market.name} <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}

            {/* Registered Agents operating in this city */}
            <div className="pt-8 border-t border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-md sm:text-lg font-display text-white">
                  Active Vetted Real Estate Professionals in {cityData.dbValue}
                </h3>
              </div>

              {loadingAgents ? (
                <div className="h-20 flex items-center justify-center text-white/30 text-xs">
                  Sourcing local agents database...
                </div>
              ) : allAgents.length === 0 ? (
                <div className="p-6 text-center text-xs text-white/40 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
                  <p>No independent agents are registered in {cityData.dbValue} yet.</p>
                  <Link to="/agents/register" className="text-[#C5A059] font-semibold hover:underline">
                    Operate in {cityData.dbValue}? Apply here
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allAgents.map(agent => (
                    <div 
                      key={agent.id}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#C5A059]/20 transition-all flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059] font-bold text-xs shrink-0 overflow-hidden">
                        {(agent as any).profilePhotoUrl || (agent as any).logo ? (
                          <img 
                            src={(agent as any).profilePhotoUrl || (agent as any).logo} 
                            alt={agent.fullName} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (agent.fullName || 'Agent').substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white group-hover:text-[#C5A059] transition-colors truncate">
                          {agent.fullName}
                        </h4>
                        <p className="text-[10px] text-white/40 capitalize truncate mt-0.5">
                          {(agent as any).isAgency ? 'Agency Partner' : 'Licensed Specialist'}
                        </p>
                      </div>
                      <Link 
                        to={`/agents/${agent.id}`}
                        className="ml-auto w-7 h-7 rounded-lg bg-white/5 hover:bg-[#C5A059] text-white hover:text-black flex items-center justify-center transition-all shrink-0"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
