import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowUpRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { brokerService } from '@/services/brokerService';
import { Broker } from '@/types';
import BrokerCard from '@/components/brokers/BrokerCard';

export default function BrokerRegistry() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
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

  const cities = ['All', ...Array.from(new Set(brokers.map(b => b.city || '').filter(Boolean)))];
  
  const filteredBrokers = useMemo(() => {
    let result = brokers.filter(b => 
      (b.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.city || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (selectedCity !== 'All') {
      result = result.filter(b => b.city === selectedCity);
    }
    
    if (selectedSpecialty !== 'All') {
      result = result.filter(b => (b.propertySpecialization || []).some(s => s.toLowerCase().includes(selectedSpecialty.toLowerCase())));
    }
    
    if (sortBy === 'experience') {
      result.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
    }
    
    return result;
  }, [brokers, searchQuery, selectedCity, selectedSpecialty, sortBy]);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-luxury-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Trust Banner */}
        <div className="bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-xl p-4 flex items-center gap-4 mb-8">
          <ShieldCheck className="text-[#C5A059] shrink-0" size={24} />
          <p className="text-[#C5A059] text-xs md:text-sm font-semibold uppercase tracking-widest leading-relaxed">
            Every broker undergoes identity verification, ownership compliance review, and anti-fraud monitoring.
          </p>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Broker Registry</h1>
            <p className="text-white/60 max-w-xl text-lg">
              Connect with legally verified, professional real estate brokers across the Somali Region. Safe, trusted, and transparent.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild className="bg-[#C5A059] text-black hover:bg-white transition-colors h-12">
              <Link to="/brokers/apply">
                Apply as Verified Broker <ArrowUpRight size={18} className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-12 shadow-2xl flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <Input 
              placeholder="Search brokers by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border-white/10 h-12 pl-11 rounded-xl text-white placeholder:text-white/40 focus-visible:ring-[#C5A059]/30 border-0"
            />
          </div>
          <select className="bg-black/50 border-white/10 text-white rounded-xl h-12 px-4 hover:border-[#C5A059]/30 focus:outline-none min-w-[140px]" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
            {cities.map(c => <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>)}
          </select>
          <select className="bg-black/50 border-white/10 text-white rounded-xl h-12 px-4 hover:border-[#C5A059]/30 focus:outline-none min-w-[140px]" value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)}>
            <option value="All">All Specialties</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Land">Land</option>
          </select>
          <select className="bg-black/50 border-white/10 text-white rounded-xl h-12 px-4 hover:border-[#C5A059]/30 focus:outline-none min-w-[140px]" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="experience">Most Experienced</option>
            <option value="trust">Highest Trust Score</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#C5A059] border-t-transparent animate-spin"></div>
          </div>
        ) : filteredBrokers.length === 0 ? (
          <div className="py-20 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
            <p className="text-white/40">No verified brokers found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrokers.map((broker, idx) => (
              <BrokerCard key={broker.id} broker={broker} index={idx} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
