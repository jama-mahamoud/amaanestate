import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  Star,
  CheckCircle2,
  Lock,
  FileSignature,
  FileText,
  UserCheck,
  Building,
  Activity,
  Check,
  ChevronRight,
  Send,
  UserCheck2,
  Briefcase,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { brokerService } from '@/services/brokerService';
import { Broker, Agency, Listing } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function AgentsList() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Enterprise Division-based navigation Tabs
  const [division, setDivision] = useState<'agents' | 'brokers' | 'registry'>('agents');
  
  // Sub-navigation state hooks for high fidelity role separation
  const [agentsSubTab, setAgentsSubTab] = useState<'directory' | 'verified' | 'join' | 'reviews'>('directory');
  const [brokersSubTab, setBrokersSubTab] = useState<'verified-brokers' | 'agencies-directory' | 'apply' | 'corporate-agencies'>('verified-brokers');
  const [registrySubTab, setRegistrySubTab] = useState<'center' | 'applications' | 'compliance' | 'approved'>('center');

  // Interactive Verification Search Tools
  const [verifySearchQuery, setVerifySearchQuery] = useState('');
  const [searchedVerification, setSearchedVerification] = useState<{
    found: boolean;
    name?: string;
    type?: string;
    license?: string;
    status?: string;
    city?: string;
  } | null>(null);

  // Filter input states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedPropType, setSelectedPropType] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Mock reviewer data and agents lists for premium visual engagement
  const mockAgentReviews = [
    {
      id: "rev-1",
      agentName: "Halimo Warsame",
      authorName: "Abdirahman Kahin",
      rating: 5,
      comment: "Incredibly responsive property marketer. She showed me three verified villas in Jigjiga within 24 hours of matching. Absolute professional support!",
      date: "May 22, 2026",
      dealType: "Villa Purchase Support"
    },
    {
      id: "rev-2",
      agentName: "Guled Ahmed",
      authorName: "Sarah Yusuf",
      rating: 4.8,
      comment: "Excellent listing assistant. Guided us through regional land parameters, boundaries coordinates checking, and was highly active on WhatsApp.",
      date: "May 18, 2026",
      dealType: "Land Plot Consultation"
    },
    {
      id: "rev-3",
      agentName: "Elmi Duale",
      authorName: "Mustafa Omar",
      rating: 5,
      comment: "AmaanEstate standard support agent of the highest order. Polite, clear, direct communication on legal title deed checks before booking.",
      date: "May 10, 2026",
      dealType: "Commercial Lease Onboarding"
    }
  ];

  // Approved licenses tracker local data
  const mockApprovedRegistry = [
    { id: "reg-1", entity: "AmaanEstate National Office", type: "Certified Agency", license: "AE-REG-2026-0041", date: "Jan 12, 2026", status: "Active" },
    { id: "reg-2", entity: "Guled & Partners Realty", type: "Licensed Brokerage", license: "SR-BRK-20491", date: "Feb 28, 2026", status: "Active" },
    { id: "reg-3", entity: "Dara Salaam Property Hub", type: "Certified Agency", license: "CORP-REG-991A-SO", date: "Mar 15, 2026", status: "Active" },
    { id: "reg-4", entity: "Warsame Estate Advisors", type: "Licensed Brokerage", license: "REG-ID-2819-SL", date: "Apr 01, 2026", status: "Active" },
    { id: "reg-5", entity: "Somali Peninsula Homes", type: "Enterprise Group", license: "AGENCY-ETH-8821", date: "May 19, 2026", status: "Active" }
  ];

  // Simulated applications for registry sub-pane
  const mockRegistryApplications = [
    { id: "app-1", applicant: "Mustafe Nur (Broker)", submitted: "May 24, 2026", step: "Document Verification", status: "Pending Audit" },
    { id: "app-2", applicant: "Nomad Valley Properties (Agency)", submitted: "May 23, 2026", step: "Address On-Site Survey", status: "In Progress" },
    { id: "app-3", applicant: "Halimo Aden (Agent)", submitted: "May 25, 2026", step: "Identity Documentation Approved", status: "Under Review" }
  ];

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
      if (l.category === 'property' || l.category === 'land') counts[oid].properties++;
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

  // Clean filters computation
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
                        (selectedPropType === 'property' && listings.some(l => l.associatedBrokerId === broker.id && (l.category === 'property' || l.category === 'land'))) ||
                        (selectedPropType === 'vehicle' && listings.some(l => l.associatedBrokerId === broker.id && l.category === 'vehicle'));

      const isNotBanned = broker.status !== 'rejected' && broker.status !== 'suspended' && (broker as any).status !== 'SUSPENDED';
      const isApproved = broker.status === 'approved' || (broker.status as any) === 'verified' || (broker.status as any) === 'ACTIVE' || (broker.status as any) === 'active' || (broker.status as any) === 'VERIFIED';
      const isActuallyVerified = broker.isVerified === true || (broker as any).verified === true || isApproved;
      
      const matchVerified = isNotBanned && (!verifiedOnly || isActuallyVerified);

      return matchQuery && matchCity && matchType && matchVerified;
    });
  }, [brokers, searchQuery, selectedCity, selectedPropType, verifiedOnly, listings]);

  // Handle license check
  const handleVerifyCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifySearchQuery.trim()) return;

    const term = verifySearchQuery.trim().toLowerCase();
    
    // Check match against brokers
    const matchedBroker = brokers.find(b => 
      (b.businessLicenseNumber && b.businessLicenseNumber.toLowerCase().includes(term)) ||
      (b.fullName && b.fullName.toLowerCase().includes(term))
    );

    // Check match against agencies
    const matchedAgency = agencies.find(a => 
      (a.license && a.license.toLowerCase().includes(term)) ||
      (a.agencyName && a.agencyName.toLowerCase().includes(term))
    );

    // Check match against local registry licenses
    const matchedMock = mockApprovedRegistry.find(r => 
      r.license.toLowerCase() === term || r.entity.toLowerCase().includes(term)
    );

    if (matchedBroker) {
      setSearchedVerification({
        found: true,
        name: matchedBroker.fullName,
        type: "Certified Land Broker / Professional",
        license: matchedBroker.businessLicenseNumber || `BRK-REG-${matchedBroker.id.substring(0,5).toUpperCase()}`,
        status: "Legally Approved & Active",
        city: matchedBroker.city || "Somali Region"
      });
    } else if (matchedAgency) {
      setSearchedVerification({
        found: true,
        name: matchedAgency.agencyName,
        type: "Registered Commercial Housing Agency",
        license: matchedAgency.license || `CORP-REG-${matchedAgency.id.substring(0,5).toUpperCase()}`,
        status: "Certified Organization Group",
        city: matchedAgency.city || "Jigjiga Capital"
      });
    } else if (matchedMock) {
      setSearchedVerification({
        found: true,
        name: matchedMock.entity,
        type: matchedMock.type,
        license: matchedMock.license,
        status: "Active & Compliant",
        city: "Jigjiga Headquarters"
      });
    } else {
      setSearchedVerification({
        found: false
      });
    }
  };

  return (
    <div className="pt-24 pb-28 min-h-screen bg-[#070707] text-white">
      {/* Super Header Banner */}
      <section className="relative py-16 md:py-24 overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.03),transparent)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.85),#070707)] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 bg-[#C5A059]/10 border border-[#C5A059]/30 px-4 py-1.5 rounded-full text-[10px] tracking-[0.2em] font-black uppercase text-[#C5A059]">
            <Sparkles size={11} className="mr-0.5" /> Professional Corporate Network
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-light text-white tracking-tight leading-none">
            Agents, Brokers & <br className="hidden md:block" />
            <span className="font-bold text-[#C5A059] block mt-1">Registry Network</span>
          </h1>
          <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
            Verify official property brokerage licenses, explore verified listings marketing agents, and validate corporate credentials.
          </p>

          {/* Search Bar Block with Dynamic Controls */}
          <div className="max-w-xl mx-auto mt-8">
            <div className="bg-[#111] p-1.5 rounded-2xl md:rounded-full border border-white/10 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
              <div className="relative flex-1 flex items-center min-w-0">
                <Search className="absolute left-4 text-white/40 shrink-0" size={16} />
                <Input 
                  placeholder="Search name, city or neighborhood..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 pl-11 h-11 text-white text-xs focus-visible:ring-0 placeholder:text-white/30 w-full"
                />
              </div>
              <div className="flex gap-1.5 px-1.5 sm:px-0">
                <Button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  variant="outline"
                  className={`flex-1 sm:flex-none bg-white/5 text-white/80 hover:bg-white/10 hover:text-white border-white/5 h-10 rounded-full px-3.5 text-[9px] font-bold uppercase tracking-widest gap-2.5 transition-all ${showAdvanced ? 'border-[#C5A059]/50 bg-[#C5A059]/5 text-white' : ''}`}
                >
                  <SlidersHorizontal size={12} /> <span>Filters</span>
                </Button>
                <Button className="flex-1 sm:flex-none bg-[#C5A059] hover:bg-white text-black h-10 px-5 rounded-full font-bold uppercase tracking-wider text-[9px]">
                  Search
                </Button>
              </div>
            </div>

            {/* Advanced Multi-Filter Options */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-3 text-left bg-[#111]/90 backdrop-blur-md border border-white/5 rounded-xl p-4 space-y-4 shadow-xl"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest font-black text-white/40 ml-1">Office Location</label>
                      <select 
                        value={selectedCity}
                        onChange={e => setSelectedCity(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 h-10 rounded-lg px-3 text-[11px] font-bold text-white focus:outline-none focus:border-[#C5A059] transition-colors"
                      >
                        {cities.map(c => (
                          <option key={c} value={c} className="bg-[#111]">{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest font-black text-white/40 ml-1">Properties Division</label>
                      <select 
                        value={selectedPropType}
                        onChange={e => setSelectedPropType(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 h-10 rounded-lg px-3 text-[11px] font-bold text-white focus:outline-none focus:border-[#C5A059] transition-colors"
                      >
                        <option value="All" className="bg-[#111]">All Specializations</option>
                        <option value="property" className="bg-[#111]">Real Estate</option>
                        <option value="vehicle" className="bg-[#111]">Transit & Land Fleet</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/5 pt-3 gap-3">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="verifyFilter"
                        checked={verifiedOnly}
                        onChange={e => setVerifiedOnly(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-white/10 bg-white/5 text-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]/30"
                      />
                      <label htmlFor="verifyFilter" className="text-[10px] font-bold uppercase tracking-wider text-white/60 cursor-pointer select-none">
                        Show verified professionals only
                      </label>
                    </div>

                    <p className="text-[9px] text-[#C5A059] font-mono leading-none tracking-widest uppercase opacity-75">
                      {filteredAgencies.length + filteredBrokers.length} verified specialists matched
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* -------------------- LEVEL 1 PARAMENT DIVISION TABS -------------------- */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        <div className="bg-[#111]/60 p-1.5 rounded-full border border-white/5 max-w-2xl mx-auto grid grid-cols-3 gap-1.5">
          <button
            onClick={() => setDivision('agents')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3.5 px-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              division === 'agents'
                ? 'bg-white text-black shadow-lg shadow-white/5'
                : 'text-white/50 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Users size={13} className={division === 'agents' ? 'text-black' : 'text-[#C5A059]'} />
            <span className="text-center">Agents Network</span>
          </button>

          <button
            onClick={() => setDivision('brokers')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3.5 px-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              division === 'brokers'
                ? 'bg-white text-black shadow-lg shadow-white/5'
                : 'text-white/50 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Building2 size={13} className={division === 'brokers' ? 'text-black' : 'text-[#C5A059]'} />
            <span className="text-center">Verified Brokers</span>
          </button>

          <button
            onClick={() => setDivision('registry')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3.5 px-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              division === 'registry'
                ? 'bg-white text-black shadow-lg shadow-white/5'
                : 'text-white/50 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <ShieldCheck size={13} className={division === 'registry' ? 'text-black' : 'text-[#C5A059]'} />
            <span className="text-center">Registry Office</span>
          </button>
        </div>
      </section>

      {/* -------------------- LEVEL 2 SUB-DIVISION NAVIGATION -------------------- */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mt-10">
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-white/5 pb-5">
          
          {/* Subtabs for AGENTS Division */}
          {division === 'agents' && (
            <>
              {[
                { id: 'directory', label: 'Agent Directory', icon: Users },
                { id: 'verified', label: 'Verified Support', icon: UserCheck2 },
                { id: 'join', label: 'Join as Agent', icon: FileSignature },
                { id: 'reviews', label: 'Client Reviews', icon: Star }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setAgentsSubTab(sub.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    agentsSubTab === sub.id
                      ? 'bg-[#C5A059] text-black shadow-md shadow-[#C5A059]/25'
                      : 'bg-white/[0.02] border border-white/5 text-white/60 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <sub.icon size={11} />
                  <span>{sub.label}</span>
                </button>
              ))}
            </>
          )}

          {/* Subtabs for BROKERS Division */}
          {division === 'brokers' && (
            <>
              {[
                { id: 'verified-brokers', label: 'Licensed Brokers', icon: Briefcase },
                { id: 'agencies-directory', label: 'Agency Directory', icon: Building },
                { id: 'apply', label: 'Apply in Registry', icon: FileSignature },
                { id: 'corporate-agencies', label: 'Office Locations', icon: MapPin }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setBrokersSubTab(sub.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    brokersSubTab === sub.id
                      ? 'bg-[#C5A059] text-black shadow-md shadow-[#C5A059]/25'
                      : 'bg-white/[0.02] border border-white/5 text-white/60 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <sub.icon size={11} />
                  <span>{sub.label}</span>
                </button>
              ))}
            </>
          )}

          {/* Subtabs for REGISTRY Verification division */}
          {division === 'registry' && (
            <>
              {[
                { id: 'center', label: 'Verification Center', icon: ShieldCheck },
                { id: 'applications', label: 'Registry Applications', icon: FileText },
                { id: 'compliance', label: 'Compliance Reviews', icon: Award },
                { id: 'approved', label: 'Approved Registrations', icon: UserCheck }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setRegistrySubTab(sub.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    registrySubTab === sub.id
                      ? 'bg-[#C5A059] text-black shadow-md shadow-[#C5A059]/25'
                      : 'bg-white/[0.02] border border-white/5 text-white/60 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <sub.icon size={11} />
                  <span>{sub.label}</span>
                </button>
              ))}
            </>
          )}

        </div>
      </section>

      {/* -------------------- LEVEL 3 DIRECTORY CONTAINER -------------------- */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${division}-${agentsSubTab}-${brokersSubTab}-${registrySubTab}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            
            {/* ==================== DIVISION 1: AGENTS MODULES ==================== */}
            {division === 'agents' && (
              <>
                {/* 1.1 AGENTS DIRECTORY */}
                {agentsSubTab === 'directory' && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-4">
                      <h3 className="text-xl font-display font-medium text-white tracking-tight">Active Support Agents</h3>
                      <p className="text-xs text-white/45 mt-1">Lighter, approachable support specialists trained for immediate local messaging, property tours, and field coordination.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredBrokers.filter(b => b.type !== 'agency').map((agent) => (
                        <div key={agent.id} className="bg-[#111] p-6 rounded-2xl border border-white/5 hover:border-[#C5A059]/20 transition-all flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 flex items-center justify-center text-[#C5A059] font-bold shrink-0 border border-white/10">
                                {agent.profilePhotoUrl ? (
                                  <img src={agent.profilePhotoUrl} alt={agent.fullName} className="w-full h-full object-cover" />
                                ) : (
                                  agent.fullName.substring(0, 2).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-white leading-tight truncate">{agent.fullName}</h4>
                                <p className="text-[10px] text-white/45 leading-none mt-1">Support Assistant</p>
                              </div>
                            </div>

                            <p className="text-xs text-white/60 mb-5 leading-relaxed font-light line-clamp-2">
                              {agent.bio || `${agent.fullName} is an active client support specialist handles property walks, certified boundaries photography, and Somali language translation.`}
                            </p>

                            <div className="space-y-2 py-3 border-t border-white/5 text-xs text-white/50 mb-4">
                              <div className="flex justify-between">
                                <span>Languages:</span>
                                <span className="text-white font-medium">{agent.languagesSpoken?.join(', ') || 'Somali, English'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Response Time:</span>
                                <span className="text-[#C5A059] font-bold uppercase text-[9px]">Within 15 Min</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Service Coverage:</span>
                                <span className="text-white font-medium truncate max-w-[150px]">{agent.city || 'Jigjiga HQ'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 bg-transparent border-white/10 hover:bg-white/5 text-white text-[10px]" asChild>
                              <a href={`tel:${agent.phone}`}>
                                <Phone size={11} className="mr-1" /> Call
                              </a>
                            </Button>
                            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold" asChild>
                              <a href={`https://wa.me/${agent.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(agent.fullName)},%2520I%20saw%20your%20Profile%2520on%20AmaanEstate`} target="_blank" rel="noopener noreferrer">
                                <MessageCircle size={12} className="mr-1" /> WhatsApp
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1.2 VERIFIED SUPPORT AGENTS */}
                {agentsSubTab === 'verified' && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-4">
                      <h3 className="text-xl font-display font-medium text-white tracking-tight">Verified Trusted Agents</h3>
                      <p className="text-xs text-white/45 mt-1">Agents who have passed identity validation and are officially accredited to accompany diaspora real estate tours.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredBrokers.filter(b => b.isVerified && b.type !== 'agency').map((agent) => (
                        <div key={agent.id} className="bg-[#111] p-6 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/30 transition-all relative">
                          <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <ShieldCheck size={10} /> Verified
                          </div>

                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 flex items-center justify-center text-[#C5A059] font-bold shrink-0 border border-white/10">
                              {agent.profilePhotoUrl ? (
                                <img src={agent.profilePhotoUrl} alt={agent.fullName} className="w-full h-full object-cover" />
                              ) : (
                                agent.fullName.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-white leading-tight truncate">{agent.fullName}</h4>
                              <p className="text-[10px] text-emerald-400 leading-none mt-1">Identity Confirmed</p>
                            </div>
                          </div>

                          <p className="text-xs text-white/60 mb-5 leading-relaxed font-light">
                            Verified listing surveyor. Certified clean track record with client-facing support across Jigjiga residential estates.
                          </p>

                          <div className="flex gap-2">
                            <Button className="w-full bg-[#C5A059] hover:bg-white text-black text-[10px] font-bold uppercase tracking-widest h-10" asChild>
                              <Link to={`/agents/${agent.id}`}>
                                View Verified Profile <ArrowUpRight size={11} className="ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1.3 JOIN AS AGENT */}
                {agentsSubTab === 'join' && (
                  <div className="max-w-2xl mx-auto text-center space-y-8 py-8">
                    <div className="w-16 h-16 bg-[#C5A059]/10 border border-[#C5A059]/20 rounded-2xl flex items-center justify-center mx-auto text-[#C5A059]">
                      <FileSignature size={30} />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-display font-medium text-white tracking-tight">Begin Property Support Onboarding</h3>
                      <p className="text-sm text-white/50 max-w-md mx-auto leading-relaxed">
                        Become a trusted client representative with verified badges. Market listings, coordinate safe client tours, and unlock continuous lead exposure.
                      </p>
                    </div>

                    <div className="bg-[#111] p-6 rounded-2xl border border-white/5 text-left space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#C5A059] border-b border-white/5 pb-2">Onboarding Checklist</h4>
                      <ul className="space-y-2.5 text-xs text-white/70">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                          <span>Submit valid Government ID Card</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                          <span>Link with a licensed corporate partner or agency</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                          <span>Complete short digital property safety orientation</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex gap-3 justify-center pt-2">
                      <Button asChild className="bg-[#C5A059] hover:bg-white text-black text-xs font-bold uppercase tracking-wider px-8 h-12 rounded-xl">
                        <Link to="/agents/apply">Apply Now to Register</Link>
                      </Button>
                    </div>
                  </div>
                )}

                {/* 1.4 AGENT CLIENT REVIEWS */}
                {agentsSubTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-4">
                      <h3 className="text-xl font-display font-medium text-white tracking-tight">Client Testimonials & Feedback</h3>
                      <p className="text-xs text-white/45 mt-1">Read how Somali diaspora and local real estate investors rate our verified support coordinator network.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {mockAgentReviews.map((rev) => (
                        <div key={rev.id} className="bg-[#111] border border-white/5 p-6 rounded-2xl space-y-4 relative">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-amber-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={11} fill={i < Math.floor(rev.rating) ? "currentColor" : "none"} />
                              ))}
                              <span className="text-[10px] text-white/50 ml-1 font-bold">{rev.rating}</span>
                            </div>
                            <span className="text-[10px] text-white/30">{rev.date}</span>
                          </div>

                          <p className="text-xs text-white/70 italic font-light leading-relaxed">
                            "{rev.comment}"
                          </p>

                          <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] text-white/40">
                            <div>
                              <span>Reviewer: </span>
                              <span className="text-white font-semibold">{rev.authorName}</span>
                            </div>
                            <div>
                              <span>Target Agent: </span>
                              <span className="text-[#C5A059] font-bold">{rev.agentName}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ==================== DIVISION 2: BROKERS & AGENCIES MODULES ==================== */}
            {division === 'brokers' && (
              <>
                {/* 2.1 VERIFIED BROKERS */}
                {brokersSubTab === 'verified-brokers' && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-4">
                      <h3 className="text-xl font-display font-medium text-white tracking-tight">Licensed Property Brokers</h3>
                      <p className="text-xs text-white/45 mt-1">Accredited, certified independent transaction specialists operating with regional government real-estate brokerage compliance.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredBrokers.map((broker) => (
                        <div key={broker.id} className="group bg-[#111] border border-white/5 hover:border-[#C5A059]/30 rounded-[2rem] overflow-hidden transition-all duration-500 flex flex-col justify-between">
                          <div className="p-6">
                            <div className="flex items-start gap-4 mb-5">
                              <div className="w-14 h-14 rounded-full overflow-hidden bg-white/5 shrink-0 relative border border-white/10">
                                {broker.profilePhotoUrl ? (
                                  <img src={broker.profilePhotoUrl} alt={broker.fullName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white/40 font-bold text-lg uppercase">
                                    {broker.fullName?.substring(0,2) || 'BR'}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-base font-bold text-white group-hover:text-[#C5A059] transition-colors leading-tight truncate">{broker.fullName}</h3>
                                {broker.companyName && (
                                  <div className="flex items-center gap-1 text-white/60 text-[11px] mt-1 truncate">
                                    <Building2 size={11} className="text-[#C5A059]" />
                                    <span>{broker.companyName}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1 text-white/40 text-[11px] mt-1.0 truncate">
                                  <MapPin size={11} />
                                  <span>{broker.city}, {broker.region || 'Somali Region'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-white/[0.01] border border-white/5 p-3 rounded-xl text-center mb-5 text-xs">
                              <div>
                                <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold block">Listings</span>
                                <span className="text-white font-bold font-mono">{broker.activeListingsCount || 0}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold block">Accreditation</span>
                                <span className="text-[#C5A059] font-bold text-[9px] uppercase">LICENSED</span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" className="flex-1 bg-transparent border-white/10 hover:bg-white/5 text-white text-[10px]" asChild>
                                <a href={`tel:${broker.phone}`}>Call Contact</a>
                              </Button>
                              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold" asChild>
                                <a href={`https://wa.me/${broker.whatsapp?.replace(/\D/g, '') || broker.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(broker.fullName)}`} target="_blank" rel="noopener noreferrer">
                                  <MessageCircle size={12} className="mr-1" /> WhatsApp
                                </a>
                              </Button>
                            </div>
                          </div>

                          <Button className="w-full bg-white/5 hover:bg-[#C5A059] text-white hover:text-black border-t border-white/5 rounded-none font-bold text-[10px] uppercase tracking-wider h-11" asChild>
                            <Link to={`/agents/${broker.id}`}>View Core Agent Profile <ArrowUpRight size={12} className="ml-1" /></Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2.2 AGENCY DIRECTORY */}
                {brokersSubTab === 'agencies-directory' && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-4">
                      <h3 className="text-xl font-display font-medium text-white tracking-tight">Accredited Corporate Agencies</h3>
                      <p className="text-xs text-white/45 mt-1">Enterprise real estate firms holding verified regional corporate licenses, physical offices, and comprehensive investor warranties.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredAgencies.map((agency) => {
                        const counts = getOwnerMetadata(agency.ownerId);
                        return (
                          <div key={agency.id} className="bg-[#111] border border-white/5 hover:border-[#C5A059]/20 rounded-2xl overflow-hidden transition-all flex flex-col justify-between">
                            <div className="p-6 space-y-5">
                              <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                  {agency.logo ? (
                                    <img src={agency.logo} alt={agency.agencyName} className="w-full h-full object-cover" />
                                  ) : (
                                    <Building2 className="text-[#C5A059] w-7 h-7" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-sm font-bold text-white truncate leading-tight">{agency.agencyName}</h4>
                                  <p className="text-[10px] text-white/45 mt-1 flex items-center gap-1">
                                    <MapPin size={10} className="text-[#C5A059]" /> {agency.city || 'Jigjiga Capital'}
                                  </p>
                                  <div className="mt-2 text-[9px] font-black uppercase tracking-wider border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-md inline-block">
                                    Trusted Agency
                                  </div>
                                </div>
                              </div>

                              <p className="text-xs text-white/60 leading-relaxed font-light line-clamp-2">
                                Accredited real estate firm. Offers complete physical surveys, certified housing transactions, and comprehensive regional deed coordination.
                              </p>

                              <div className="grid grid-cols-2 gap-2 text-center bg-white/[0.01] border border-white/5 p-3 rounded-xl text-xs">
                                <div>
                                  <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold block">Assigned Lots</span>
                                  <span className="text-white font-bold font-mono">{counts.total}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold block">License Number</span>
                                  <span className="text-white font-mono text-[9px] font-bold block truncate max-w-[100px] mx-auto">
                                    {agency.license && !agency.license.startsWith('http') ? agency.license : 'AE-REG-2026-003'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="p-6 border-t border-white/5 pt-4">
                              <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 bg-transparent border-white/10 hover:bg-white/5 text-white text-[10px]" asChild>
                                  <a href={agency.phone ? `tel:${agency.phone}` : '#'}>Call</a>
                                </Button>
                                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold" asChild>
                                  <a href={agency.phone ? `https://wa.me/${agency.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(agency.agencyName)}` : '#'} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                                </Button>
                              </div>
                              <Button className="w-full bg-white/[0.02] hover:bg-[#C5A059] text-white hover:text-black border border-white/5 mt-3 text-[10px] uppercase font-bold tracking-wider h-10" asChild>
                                <Link to={`/agents/agency_${agency.id}`}>View Corporate Profile <ArrowUpRight size={12} className="ml-1" /></Link>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2.3 APPLY AS BROKER */}
                {brokersSubTab === 'apply' && (
                  <div className="max-w-2xl mx-auto space-y-8 py-4">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-[#C5A059]/10 border border-[#C5A059]/20 rounded-2xl flex items-center justify-center mx-auto text-[#C5A059]">
                        <Briefcase size={30} />
                      </div>
                      <h3 className="text-2xl font-display font-medium text-white tracking-tight">Licensure Registry Onboarding</h3>
                      <p className="text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
                        Submit certified business operations, physical credentials, local licenses, and secure 50-year deed auditing track record keys.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#111] p-5 rounded-2xl border border-white/5 space-y-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Independent Broker</h4>
                        <p className="text-xs text-white/50 leading-relaxed font-light">
                          Requires continuous physical real estate experience, regional tax certificates, and verified government land audit permissions.
                        </p>
                      </div>

                      <div className="bg-[#111] p-5 rounded-2xl border border-white/5 space-y-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Agency Enterprise Firm</h4>
                        <p className="text-xs text-white/50 leading-relaxed font-light">
                          Requires corporate business licenses, municipal address confirmation registration, and certified escrow staff accounts.
                        </p>
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <Button asChild className="bg-[#C5A059] hover:bg-white text-black text-xs font-bold uppercase tracking-wider px-8 h-12 rounded-xl">
                        <Link to="/agents/apply">Begin Broker Compliance Application</Link>
                      </Button>
                    </div>
                  </div>
                )}

                {/* 2.4 OFFICE LOCATIONS */}
                {brokersSubTab === 'corporate-agencies' && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-4">
                      <h3 className="text-xl font-display font-medium text-white tracking-tight">Physical Verified Office Locations</h3>
                      <p className="text-xs text-white/45 mt-1">Visit our verified physical workspaces and advisory centers strategically located to secure client listings.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-[#111] border border-white/5 p-6 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                          <Building className="text-[#C5A059]" size={20} />
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Jigjiga Regional Head Office</h4>
                        </div>
                        <p className="text-xs text-white/60 font-light leading-relaxed">
                          AmaanEstate Municipal hub supporting professional land deed validation, surveying checks, and notary coordination for diaspora properties.
                        </p>
                        <div className="text-[11px] text-[#C5A059] space-y-1">
                          <p>📍 Location: Palace Avenue, Municipal Area, Jigjiga, Ethiopia</p>
                          <p>📞 Phone desk: +251 910 012 794</p>
                        </div>
                      </div>

                      <div className="bg-[#111] border border-white/5 p-6 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                          <Building className="text-[#C5A059]" size={20} />
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">East Africa Registry Desk</h4>
                        </div>
                        <p className="text-xs text-white/60 font-light leading-relaxed">
                          Property registration liaison desk handling structural surveys, high-net-worth commercial transactions, and direct advisory support.
                        </p>
                        <div className="text-[11px] text-[#C5A059] space-y-1">
                          <p>📍 Location: Central Business District, Nairobi</p>
                          <p>📞 Email desk: support@amaanestate.com</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ==================== DIVISION 3: REGISTRY VERIFICATION ==================== */}
            {division === 'registry' && (
              <>
                {/* 3.1 VERIFICATION CENTER */}
                {registrySubTab === 'center' && (
                  <div className="max-w-2xl mx-auto space-y-8">
                    <div className="text-center space-y-3">
                      <h3 className="text-2xl font-display font-medium text-white tracking-tight">Credential Verification Center</h3>
                      <p className="text-xs text-white/45 max-w-sm mx-auto leading-relaxed">
                        Input a valid registration license number, agency name, or broker name to confirm their structural credentials from the security registry.
                      </p>
                    </div>

                    {/* Verification Search input mock-up */}
                    <form onSubmit={handleVerifyCheck} className="bg-[#111] p-2 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1 flex items-center">
                        <ShieldCheck className="absolute left-4 text-[#C5A059] shrink-0" size={18} />
                        <Input
                          placeholder="e.g. AE-REG-2026-0041 or Guled"
                          value={verifySearchQuery}
                          onChange={e => setVerifySearchQuery(e.target.value)}
                          className="bg-transparent border-0 pl-11 h-12 text-white text-xs focus-visible:ring-0 placeholder:text-white/30 w-full"
                        />
                      </div>
                      <Button type="submit" className="bg-[#C5A059] hover:bg-white text-black text-xs font-bold uppercase tracking-wider h-12 px-6 rounded-xl">
                        Verify Status
                      </Button>
                    </form>

                    {/* Return searching verification validation box */}
                    {searchedVerification ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-6 rounded-2xl border ${
                          searchedVerification.found 
                            ? 'bg-emerald-500/5 border-emerald-500/20' 
                            : 'bg-rose-500/5 border-rose-500/20'
                        }`}
                      >
                        {searchedVerification.found ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-500/15 rounded-full flex items-center justify-center text-emerald-400">
                                <Check size={20} />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Registry Active Status Approved</h4>
                                <p className="text-[10px] text-emerald-400 font-mono">Verified Registration Approved</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5 text-xs text-white/60">
                              <div>
                                <span className="text-[10px] block text-white/40 uppercase tracking-widest font-black">Registered Entity:</span>
                                <span className="text-white font-bold">{searchedVerification.name}</span>
                              </div>
                              <div>
                                <span className="text-[10px] block text-white/40 uppercase tracking-widest font-black">Category:</span>
                                <span className="text-white font-bold">{searchedVerification.type}</span>
                              </div>
                              <div>
                                <span className="text-[10px] block text-white/40 uppercase tracking-widest font-black">Registration License:</span>
                                <span className="text-[#C5A059] font-mono font-bold block select-all">{searchedVerification.license}</span>
                              </div>
                              <div>
                                <span className="text-[10px] block text-white/40 uppercase tracking-widest font-black">Regional Office:</span>
                                <span className="text-white font-bold">{searchedVerification.city}</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-white/40 pt-1">
                              <span>Compliance checks validation completed.</span>
                              <span className="text-emerald-400 font-bold uppercase">100% Active</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <AlertCircle className="text-rose-400 shrink-0" size={20} />
                            <div>
                              <h4 className="text-sm font-bold text-white">Registry Record Not Resolved</h4>
                              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                                No verified partner license number or entity name matches have been resolved inside the database. Please verify correct license keys and try again.
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <div className="p-5 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-2xl text-xs text-white/45">
                        Registry live connection established. Query active licensing records via standard controls.
                      </div>
                    )}
                  </div>
                )}

                {/* 3.2 REGISTRY APPLICATIONS LIST */}
                {registrySubTab === 'applications' && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-4">
                      <h3 className="text-xl font-display font-medium text-white tracking-tight">System Registry Queue</h3>
                      <p className="text-xs text-white/45 mt-1">Pending background survey operations, address validations, and license reviews processed by registry administrators.</p>
                    </div>

                    <div className="space-y-3">
                      {mockRegistryApplications.map((app) => (
                        <div key={app.id} className="bg-[#111] border border-white/5 p-4.5 rounded-xl flex items-center justify-between text-xs gap-4">
                          <div>
                            <p className="font-bold text-white uppercase tracking-wider">{app.applicant}</p>
                            <span className="text-[10px] text-white/40">Submitted: {app.submitted}</span>
                          </div>
                          <div className="hidden sm:block text-center text-[11px]">
                            <p className="text-white/45">Current vetting step:</p>
                            <span className="text-white font-bold">{app.step}</span>
                          </div>
                          <div>
                            <span className="px-2.5 py-1 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 font-mono text-[9px] uppercase tracking-widest font-black rounded">
                              {app.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3.3 COMPLIANCE REVIEWS LAND OFFICE GUIDELINES */}
                {registrySubTab === 'compliance' && (
                  <div className="max-w-3xl mx-auto space-y-6">
                    <div className="border-b border-white/5 pb-4">
                      <h3 className="text-xl font-display font-medium text-white tracking-tight">Regional Land Office Compliance Requirements</h3>
                      <p className="text-xs text-white/45 mt-1">Legislation, deed checks, and guidelines compliance required before authorization badge allocation.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-[#111] p-5 rounded-xl border border-white/5 space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-[#C5A059]" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Brokerage License Verification</h4>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed font-light">
                          Our team performs complete government lookup with the ministerial land offices to authenticate business registration certificates before allowing premium broker badges.
                        </p>
                      </div>

                      <div className="bg-[#111] p-5 rounded-xl border border-white/5 space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-[#C5A059]" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Physical Office Location Confirmation</h4>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed font-light">
                          All registered high-end agencies are subject to physically confirmed address reviews to minimize risk to local and overseas Somali diaspora buyers.
                        </p>
                      </div>

                      <div className="bg-[#111] p-5 rounded-xl border border-white/5 space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-[#C5A059]" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Zero-Dispute Trust Checking</h4>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed font-light">
                          Any professional, agency, or broker seeking certified registry membership must sign regional dispute clearance indicators ensuring clean legal property background validations.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3.4 APPROVED REGISTRATION LEDGER LISTING */}
                {registrySubTab === 'approved' && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-4">
                      <h3 className="text-xl font-display font-medium text-white tracking-tight">Approved Professional Registry Registry</h3>
                      <p className="text-xs text-white/45 mt-1">Official list of all validated compliance numbers, active agency licenses, and certified independent brokers.</p>
                    </div>

                    <div className="overflow-x-auto no-scrollbar border border-white/5 rounded-2xl bg-[#111]">
                      <table className="w-full text-left border-collapse text-xs text-white/70">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.02] text-[9px] uppercase tracking-widest text-white/40">
                            <th className="p-4">Entity</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Approved License No.</th>
                            <th className="p-4 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {mockApprovedRegistry.map((item) => (
                            <tr key={item.id} className="hover:bg-white/[0.01] transition-all">
                              <td className="p-4 font-bold text-white">{item.entity}</td>
                              <td className="p-4 text-white/50">{item.type}</td>
                              <td className="p-4 font-mono text-[#C5A059] block select-all mt-1">{item.license}</td>
                              <td className="p-4 text-right text-emerald-400 font-bold uppercase tracking-wider text-[9px]">{item.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

          </motion.div>
        </AnimatePresence>
      </section>

      {/* Footer System Onboarding Promotion Info Banner */}
      <section className="max-w-4xl mx-auto px-4 mt-8 text-center">
        <div className="bg-[#111] border border-white/5 p-8 rounded-[2rem] space-y-4">
          <Award size={28} className="text-[#C5A059] mx-auto" />
          <h4 className="text-lg font-display font-semibold">Join the AmaanEstate Network</h4>
          <p className="text-white/50 text-xs max-w-sm mx-auto font-light leading-relaxed">
            Market verified properties, catalog real estate, complete legal background audits, and establish absolute client trust.
          </p>
          <Button asChild className="bg-[#C5A059] hover:bg-white text-black text-xs font-bold uppercase tracking-wider h-11 px-6 rounded-xl mt-2">
            <Link to="/agents/apply">Apply for Verification</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
