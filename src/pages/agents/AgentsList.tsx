import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowUpRight, 
  Search, 
  Building2, 
  MapPin, 
  MessageCircle, 
  Phone, 
  SlidersHorizontal, 
  Award, 
  Users,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { brokerService } from '@/services/brokerService';
import { Broker, Agency, Listing } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import BrokerCard from '@/components/brokers/BrokerCard';

export default function AgentsList() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'agencies' | 'brokers'>('agencies');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedPropType, setSelectedPropType] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchAllEcosystemData = async () => {
      try {
        const [brokerData, agencyData, listingsSnap] = await Promise.all([
          brokerService.getVerifiedBrokers(),
          brokerService.getVerifiedAgencies(),
          getDocs(collection(db, 'listings'))
        ]);
        
        if (active) {
          const listingsList = listingsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Listing));
          setBrokers(brokerData);
          setAgencies(agencyData);
          setListings(listingsList);
        }
      } catch (error) {
        console.error("Failed to load ecosystem directories:", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchAllEcosystemData();
    return () => { active = false; };
  }, []);

  const ownerCounts = useMemo(() => {
    const counts: Record<string, { total: number, properties: number, vehicles: number }> = {};
    listings.forEach(l => {
      const oid = l.ownerId;
      if (!counts[oid]) counts[oid] = { total: 0, properties: 0, vehicles: 0 };
      counts[oid].total++;
      if (l.category === 'property') counts[oid].properties++;
      if (l.category === 'vehicle') counts[oid].vehicles++;
    });
    return counts;
  }, [listings]);

  const getOwnerMetadata = useCallback((ownerId: string) => {
    return ownerCounts[ownerId] || { total: 0, properties: 0, vehicles: 0 };
  }, [ownerCounts]);

  const cities = useMemo(() => {
    const brokerCities = brokers.map(b => b.city || '').filter(Boolean);
    const agencyCities = agencies.map(a => (a as any).city).filter(Boolean);
    return ['All', ...Array.from(new Set([...brokerCities, ...agencyCities]))];
  }, [brokers, agencies]);

  const filteredAgencies = useMemo(() => {
    return agencies.filter(agency => {
      const matchQuery = !searchQuery || 
                         (agency.agencyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ((agency as any).city || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCity = selectedCity === 'All' || ((agency as any).city || '').toLowerCase() === selectedCity.toLowerCase();
      
      const counts = getOwnerMetadata(agency.ownerId);
      const matchType = selectedPropType === 'All' || 
                        (selectedPropType === 'property' && counts.properties > 0) ||
                        (selectedPropType === 'vehicle' && counts.vehicles > 0);

      const isNotBanned = agency.status !== 'rejected' && agency.status !== 'suspended' && (agency as any).status !== 'SUSPENDED';
      const isApproved = agency.status === 'approved' || (agency.status as any) === 'verified' || (agency.status as any) === 'ACTIVE' || (agency.status as any) === 'active' || (agency.status as any) === 'VERIFIED';
      const isActuallyVerified = agency.verified === true || (agency as any).isVerified === true || isApproved;
      
      const matchVerified = isNotBanned && (!verifiedOnly || isActuallyVerified);

      return matchQuery && matchCity && matchType && matchVerified;
    });
  }, [agencies, searchQuery, selectedCity, selectedPropType, verifiedOnly, getOwnerMetadata]);

  const filteredBrokers = useMemo(() => {
    return brokers.filter(broker => {
      const matchQuery = !searchQuery || 
                         (broker.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (broker.city || '').toLowerCase().includes(searchQuery.toLowerCase());
                         
      const matchCity = selectedCity === 'All' || (broker.city || '').toLowerCase() === selectedCity.toLowerCase();
      
      const matchType = selectedPropType === 'All' || 
                        (selectedPropType === 'property' && listings.some(l => l.associatedBrokerId === broker.id && l.category === 'property')) ||
                        (selectedPropType === 'vehicle' && listings.some(l => l.associatedBrokerId === broker.id && l.category === 'vehicle'));

      const isNotBanned = broker.status !== 'rejected' && broker.status !== 'suspended' && (broker as any).status !== 'SUSPENDED';
      const isApproved = broker.status === 'approved' || (broker.status as any) === 'verified' || (broker.status as any) === 'ACTIVE' || (broker.status as any) === 'active' || (broker.status as any) === 'VERIFIED';
      const isActuallyVerified = broker.isVerified === true || (broker as any).verified === true || isApproved;
      
      const matchVerified = isNotBanned && (!verifiedOnly || isActuallyVerified);

      return matchQuery && matchCity && matchType && matchVerified;
    });
  }, [brokers, searchQuery, selectedCity, selectedPropType, verifiedOnly, listings]);

  return (
    <div className="pt-24 pb-24 min-h-screen bg-[#070707] text-white">
      {/* Search Header Hero (Zillow style) */}
      <section className="relative py-20 overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.04),transparent)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.8),#070707)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#C5A059]/10 border border-[#C5A059]/35 px-4.5 py-1.5 rounded-full text-[10px] tracking-[0.25em] font-black uppercase text-[#C5A059]">
            <Sparkles size={11} className="animate-spin" /> AmaanEstate Elite Network
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-light text-white tracking-tight">
            A great agent makes <br className="hidden md:block" />
            <span className="font-bold gold-text-gradient">all the difference</span>
          </h1>
          <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto font-light">
            Find a real estate agent, brokerage corporation, or licensed commercial advisor handling certified deeds across the region.
          </p>

          {/* Search Bar Zone */}
          <div className="max-w-2xl mx-auto mt-10">
            <div className="bg-[#111] p-1.5 rounded-[1.5rem] md:rounded-full border border-white/10 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center gap-1.5">
              <div className="relative flex-1 flex items-center min-w-0">
                <Search className="absolute left-5 text-white/40 shrink-0" size={18} />
                <Input 
                  placeholder="City, neighborhood, or ZIP code"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 pl-13 h-12 md:h-14 text-white text-sm focus-visible:ring-0 placeholder:text-white/30 w-full"
                />
              </div>
              <div className="flex gap-1.5 px-1.5 md:px-0">
                <Button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  variant="outline"
                  className={`flex-1 md:flex-none bg-white/5 text-white/80 hover:bg-white/10 hover:text-white border-white/5 h-11 md:h-12 rounded-xl md:rounded-full px-4 text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${showAdvanced ? 'border-luxury-gold/50 bg-luxury-gold/5' : ''}`}
                >
                  <SlidersHorizontal size={14} /> <span>Filters</span>
                </Button>
                <Button className="flex-1 md:flex-none bg-[#C5A059] hover:bg-white text-black h-11 md:h-12 px-6 rounded-xl md:rounded-full font-bold uppercase tracking-wider text-[10px]">
                  Search
                </Button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-3 text-left bg-[#111]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 md:p-6 space-y-4 shadow-xl"
                >
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-widest font-black text-white/40 ml-1">Location</label>
                      <select 
                        value={selectedCity}
                        onChange={e => setSelectedCity(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 h-10 md:h-12 rounded-lg md:rounded-xl px-3 text-[11px] font-bold text-white focus:outline-none focus:border-[#C5A059] transition-colors"
                      >
                        {cities.map(c => (
                          <option key={c} value={c} className="bg-[#111]">{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-widest font-black text-white/40 ml-1">Specialty</label>
                      <select 
                        value={selectedPropType}
                        onChange={e => setSelectedPropType(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 h-10 md:h-12 rounded-lg md:rounded-xl px-3 text-[11px] font-bold text-white focus:outline-none focus:border-[#C5A059] transition-colors"
                      >
                        <option value="All" className="bg-[#111]">All Types</option>
                        <option value="property" className="bg-[#111]">Real Estate</option>
                        <option value="vehicle" className="bg-[#111]">Automotive</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between border-t border-white/5 pt-4 gap-3">
                    <div className="flex items-center gap-2.5">
                      <input 
                        type="checkbox" 
                        id="verifyFilter"
                        checked={verifiedOnly}
                        onChange={e => setVerifiedOnly(e.target.checked)}
                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-[#C5A059] focus:outline-none checked:bg-[#C5A059]"
                      />
                      <label htmlFor="verifyFilter" className="text-[10px] font-bold uppercase tracking-wider text-white/60 cursor-pointer select-none">
                        Verified professionals only
                      </label>
                    </div>

                    <p className="text-[9px] text-[#C5A059] font-mono leading-none tracking-widest uppercase opacity-70">
                      {filteredAgencies.length + filteredBrokers.length} specialists matched
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Main Catalog View */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        
        {/* Toggle between Corporate Agency lists vs Brokers lists */}
        <div className="flex justify-center gap-4 mb-14">
          <button
            onClick={() => setActiveTab('agencies')}
            className={`px-8 py-3.5 rounded-full text-xs uppercase tracking-[0.15em] font-black transition-all ${
              activeTab === 'agencies'
                ? 'bg-[#C5A059] text-black shadow-xl shadow-[#C5A059]/10'
                : 'bg-white/5 text-white/65 hover:text-white border border-white/5'
            }`}
          >
            🏢 Corporate Agencies ({filteredAgencies.length})
          </button>
          <button
            onClick={() => setActiveTab('brokers')}
            className={`px-8 py-3.5 rounded-full text-xs uppercase tracking-[0.15em] font-black transition-all ${
              activeTab === 'brokers'
                ? 'bg-[#C5A059] text-black shadow-xl shadow-[#C5A059]/10'
                : 'bg-white/5 text-white/65 hover:text-white border border-white/5'
            }`}
          >
            🏛 Independent Brokers ({filteredBrokers.length})
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl h-80 animate-pulse" />
            ))}
          </div>
        ) : activeTab === 'agencies' ? (
          filteredAgencies.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl p-10">
              <Building2 className="text-[#C5A059]/20 w-16 h-16 mx-auto mb-4" />
              <p className="text-white/40 text-sm uppercase tracking-widest font-black">No matching active agency firms found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAgencies.map((agency) => {
                const counts = getOwnerMetadata(agency.ownerId);
                const brokerCount = brokers.filter(b => (b.companyName || '').toLowerCase().trim() === agency.agencyName.toLowerCase().trim()).length;
                
                return (
                  <motion.div
                    key={agency.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group bg-[#111] border border-white/5 hover:border-[#C5A059]/30 rounded-[2.5rem] overflow-hidden transition-all duration-500 relative flex flex-col justify-between"
                  >
                    <div className="p-8">
                      {/* Logo & Headline */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 shrink-0 relative flex items-center justify-center border border-white/15">
                          {agency.logo ? (
                            <img src={agency.logo} alt={agency.agencyName} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="text-[#C5A059] w-8 h-8" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xl font-display font-bold text-white group-hover:text-[#C5A059] transition-colors leading-tight truncate">
                            {agency.agencyName}
                          </h3>
                          <div className="flex items-center gap-1.5 text-white/50 text-xs mt-1.5">
                            <MapPin size={12} className="text-[#C5A059]" />
                            <span className="truncate">{agency.city || 'Unknown'}, Horn of Africa</span>
                          </div>
                          
                          {/* Rich Badge Check */}
                          <div className="mt-2.5 inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                            <ShieldCheck size={10} /> Verified agency
                          </div>
                        </div>
                      </div>

                      <p className="text-white/55 text-xs font-light leading-relaxed mb-8">
                        Professional agency brokerage certified to register legal land plots, deed agreements, and premium properties with security warranty.
                      </p>

                      {/* Count Metrics Grid */}
                      <div className="grid grid-cols-3 gap-2 bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-center mb-6">
                        <div>
                          <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Listings</p>
                          <span className="text-white text-base font-bold font-mono">{counts.total}</span>
                        </div>
                        <div>
                          <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Properties</p>
                          <span className="text-white text-base font-bold font-mono">{counts.properties}</span>
                        </div>
                        <div>
                          <p className="text-[9px] text-[#C5A059] uppercase tracking-widest font-bold">Team</p>
                          <span className="text-[#C5A059] text-base font-bold font-mono">{brokerCount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="px-8 pb-8 pt-0 border-t border-white/5 mt-auto">
                      <div className="flex gap-2.5 pt-6">
                        <Button variant="outline" className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest" asChild>
                          <a href={agency.phone ? `tel:${agency.phone}` : '#'}>
                            <Phone size={12} className="mr-1 text-emerald-500" /> Call
                          </a>
                        </Button>
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest" asChild>
                          {agency.phone ? (
                            <a href={`https://wa.me/${(() => {
                              const clean = agency.phone.replace(/\D/g, '');
                              return clean.startsWith('9') || clean.startsWith('7') ? '251' + clean : clean;
                            })()}?text=Hello%20${agency.agencyName},%20I%20found%20your%20agency%20on%20AmaanEstate.`} target="_blank" rel="noopener noreferrer">
                              <MessageCircle size={14} className="mr-1.5" /> WhatsApp
                            </a>
                          ) : (
                            <span className="opacity-50 cursor-not-allowed">
                              <MessageCircle size={14} className="mr-1.5" /> WhatsApp
                            </span>
                          )}
                        </Button>
                      </div>
                      <Button className="w-full bg-white/5 hover:bg-[#C5A059] text-white hover:text-black border border-white/10 mt-3 text-[10px] rounded-xl font-bold uppercase tracking-widest h-11" asChild>
                        <Link to={`/agents/agency_${agency.id}`}>
                          View Public Profile <ArrowUpRight size={14} className="ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )
        ) : (
          filteredBrokers.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl p-10">
              <Users className="text-[#C5A059]/20 w-16 h-16 mx-auto mb-4" />
              <p className="text-white/40 text-sm uppercase tracking-widest font-black">No matching active agents found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBrokers.map((broker) => (
                <BrokerCard key={broker.id} broker={broker} />
              ))}
            </div>
          )
        )}
      </section>

      {/* Footer Support Banner */}
      <section className="max-w-4xl mx-auto px-4 mt-12 text-center">
        <div className="bg-[#111] border border-white/5 p-10 rounded-[2.5rem] space-y-4">
          <Award size={32} className="text-[#C5A059] mx-auto" />
          <h4 className="text-xl font-display font-semibold">Are you an independent broker or firm?</h4>
          <p className="text-white/50 text-xs max-w-sm mx-auto">
            Promote your Listings, complete compliance audits, and unlock premium brand exposure across our official network.
          </p>
          <Button asChild className="bg-[#C5A059] hover:bg-white text-black text-xs font-bold uppercase tracking-wider h-11 px-6 rounded-xl mt-2">
            <Link to="/agents/apply">Apply for Verification</Link>
          </Button>
        </div>
      </section>

    </div>
  );
}
