import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users,
  Building2,
  MapPin,
  ArrowUpRight
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
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchAllEcosystemData = async () => {
      try {
        const [brokerData, agencyData] = await Promise.all([
          brokerService.getVerifiedBrokers(),
          brokerService.getVerifiedAgencies()
        ]);
        
        if (active) {
          setBrokers(brokerData);
          setAgencies(agencyData);
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

  const cities = useMemo(() => {
    const brokerCities = brokers.map(b => b.city || '').filter(Boolean);
    const agencyCities = agencies.map(a => (a as any).city).filter(Boolean);
    return ['All', ...Array.from(new Set([...brokerCities, ...agencyCities]))];
  }, [brokers, agencies]);

  const allAgents = useMemo(() => {
     return [
       ...brokers.map(b => ({ ...b, isAgency: false })),
       ...agencies.map(a => ({ ...a, fullName: (a as any).agencyName, isAgency: true }))
     ].filter(p => {
       const matchQuery = !searchQuery || 
                          (p.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ((p as any).city || '').toLowerCase().includes(searchQuery.toLowerCase());
       
       const matchCity = selectedCity === 'All' || ((p as any).city || '').toLowerCase() === selectedCity.toLowerCase();
       
       const isNotBanned = p.status !== 'rejected' && p.status !== 'suspended' && (p as any).status !== 'SUSPENDED';
       const isApproved = p.status === 'approved' || (p.status as any) === 'verified' || (p.status as any) === 'ACTIVE' || (p.status as any) === 'active' || (p.status as any) === 'VERIFIED';
       const isActuallyVerified = (p as any).isVerified === true || (p as any).verified === true || isApproved;
       
       const matchVerified = isNotBanned && (!verifiedOnly || isActuallyVerified);

       return matchQuery && matchCity && matchVerified;
     });
  }, [brokers, agencies, searchQuery, selectedCity, verifiedOnly]);

  return (
    <div className="pt-24 pb-28 min-h-screen bg-[#070707] text-white">
      {/* Agents Header */}
      <section className="relative py-16 md:py-24 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center space-y-5">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-light text-white tracking-tight">
            Our Agents
          </h1>
          <div className="max-w-xl mx-auto mt-8 flex gap-3">
             <Input 
                placeholder="Search name, city or neighborhood..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-[#111] border-white/10 h-12 text-white text-xs focus-visible:ring-[#C5A059]"
             />
             <select 
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="bg-[#111] border-white/10 rounded-lg px-3 text-[11px] font-bold text-white focus:outline-none"
             >
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
        </div>
      </section>

      {/* Directory Content */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {allAgents.map(p => (
            <div key={p.id} className="bg-[#111] p-6 rounded-2xl border border-white/5 hover:border-[#C5A059]/20 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 flex items-center justify-center text-[#C5A059] font-bold shrink-0 border border-white/10">
                    {(p as any).profilePhotoUrl || (p as any).logo ? (
                      <img src={(p as any).profilePhotoUrl || (p as any).logo} alt={p.fullName} className="w-full h-full object-cover" />
                    ) : (
                      p.fullName.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{p.fullName}</h4>
                    <span className="text-[10px] text-white/50">{(p as any).isAgency ? 'Agency Professional' : 'Independent Specialist'}</span>
                  </div>
                </div>
                <Button className="w-full bg-[#C5A059] hover:bg-white text-black font-bold h-10 mt-4" asChild>
                   <Link to={`/agents/${p.id}`}>View Profile</Link>
                </Button>
            </div>
           ))}
        </div>
      </section>
    </div>
  );
}
