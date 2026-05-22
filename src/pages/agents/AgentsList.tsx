import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowUpRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { brokerService } from '@/services/brokerService';
import { Broker } from '@/types';
import BrokerCard from '@/components/brokers/BrokerCard';

export default function AgentsList() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(true); // Default to verified only
  const [sortBy, setSortBy] = useState('experience');

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        const data = await brokerService.getVerifiedBrokers();
        setBrokers(data);
      } catch (error) {
        console.error("Failed to load brokers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrokers();
  }, []);

  const cities = useMemo(() => ['All', ...Array.from(new Set(brokers.map(b => b.city || '').filter(Boolean)))], [brokers]);
  const companies = useMemo(() => ['All', ...Array.from(new Set(brokers.map(b => b.companyName || '').filter(Boolean)))], [brokers]);
  
  const filteredBrokers = useMemo(() => {
    let result = brokers.filter(b => 
      (b.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.companyName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (selectedCity !== 'All') {
      result = result.filter(b => b.city === selectedCity);
    }
    
    if (selectedCompany !== 'All') {
      result = result.filter(b => b.companyName === selectedCompany);
    }
    
    if (verifiedOnly) {
      result = result.filter(b => b.isVerified);
    }
    
    if (sortBy === 'experience') {
      result.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
    }
    
    return result;
  }, [brokers, searchQuery, selectedCity, selectedCompany, verifiedOnly, sortBy]);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-luxury-black text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Trust Banner */}
        <div className="bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-xl p-4 flex items-center gap-4 mb-8">
          <ShieldCheck className="text-[#C5A059] shrink-0" size={24} />
          <p className="text-[#C5A059] text-xs md:text-sm font-semibold uppercase tracking-widest leading-relaxed">
            Every registered agent undergoes identity verification, license audit, and background checks.
          </p>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Verified Agents & Brokers</h1>
            <p className="text-white/60 max-w-xl text-lg">
              Connect with legally certified, high-end real estate specialists and regional agents. Secure, transparent, and direct transactions.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <Button asChild className="bg-[#C5A059] text-black hover:bg-white transition-colors h-12 w-full sm:w-auto font-bold tracking-wide">
              <Link to="/agents/apply">
                Apply as Verified Agent <ArrowUpRight size={18} className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-12 shadow-2xl flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <Input 
              placeholder="Search by name, city, or specialization..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/5 border border-white/5 h-12 rounded-xl focus:border-[#C5A059] text-white"
            />
          </div>
          
          <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] uppercase font-bold tracking-widest text-white/40">Region / City</span>
              <select 
                value={selectedCity} 
                onChange={e => setSelectedCity(e.target.value)}
                className="bg-white/5 border border-white/5 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors"
              >
                {cities.map(c => <option key={c} value={c} className="bg-luxury-black">{c}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#C5A059]">Affiliated Agency</span>
              <select 
                value={selectedCompany} 
                onChange={e => setSelectedCompany(e.target.value)}
                className="bg-white/5 border border-white/5 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors"
              >
                {companies.map(c => <option key={c} value={c} className="bg-luxury-black">{c}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] uppercase font-bold tracking-widest text-white/40">Sort Order</span>
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                className="bg-white/5 border border-white/5 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors"
              >
                <option value="experience" className="bg-luxury-black">Years of Experience</option>
                <option value="name" className="bg-luxury-black">Alphabetical (A-Z)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-5">
              <input 
                type="checkbox" 
                id="verifiedOnly"
                checked={verifiedOnly}
                onChange={e => setVerifiedOnly(e.target.checked)}
                className="rounded border-white/10 bg-white/5 text-[#C5A059] h-5 w-5 focus:outline-none focus:ring-0 checked:bg-[#C5A059]"
              />
              <label htmlFor="verifiedOnly" className="text-xs uppercase font-bold tracking-widest text-white/80 select-none cursor-pointer">
                Strict Audited ONLY
              </label>
            </div>
          </div>
        </div>

        {/* Directory Listings */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filteredBrokers.length === 0 ? (
          <div className="text-center py-20 pointer-events-none">
            <p className="text-white/40 text-sm uppercase tracking-widest font-bold">No certified agents matching criteria found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBrokers.map((broker) => (
              <BrokerCard key={broker.id} broker={broker} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
