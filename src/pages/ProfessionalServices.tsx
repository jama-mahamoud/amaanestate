import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, MapPin, Grid, List as ListIcon, X, Star, Briefcase, CheckCircle2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ProfessionalCard from '@/components/ProfessionalCard';
import EmptyState from '@/components/EmptyState';
import { Professional, ServiceCategory } from '@/types';

const MOCK_PROFESSIONALS: Professional[] = [];

export default function ProfessionalServices() {
  const [currentCategory, setCurrentCategory] = useState<ServiceCategory | 'All'>('All');
  const [currentCity, setCurrentCity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories: (ServiceCategory | 'All')[] = [
    'All',
    'Construction & Engineering',
    'Electrical & Technical',
    'Plumbing & Water',
    'Home & Maintenance',
    'Education & Teaching'
  ];

  const cities = ['All', 'Jigjiga', 'Dire Dawa', 'Addis Ababa', 'Godey', 'Berbera'];

  const filteredPros = MOCK_PROFESSIONALS.filter(pro => {
    if (currentCategory !== 'All' && pro.category !== currentCategory) return false;
    if (currentCity !== 'All' && pro.city !== currentCity) return false;
    if (searchQuery && !pro.name.toLowerCase().includes(searchQuery.toLowerCase()) && !pro.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-luxury-black pt-28 pb-20">
      {/* Header */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-luxury-gold/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <span className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Registry of Excellence</span>
            <h1 className="text-4xl md:text-8xl font-display font-bold text-white tracking-tighter leading-[1.1] md:leading-none mb-6 md:mb-8">
              Expert <span className="gold-text-gradient">Registry</span>
            </h1>
            <p className="text-white/40 text-lg md:text-xl leading-relaxed font-light max-w-xl">
              Connect with the Somali Region's most prestigious and verified professionals.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Search & Filters */}
        <div className="glass-card p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] mb-12 md:mb-20 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={20} md:size={22} />
              <Input 
                placeholder="Search experts by specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border-white/5 h-14 md:h-16 pl-14 md:pl-16 rounded-xl md:rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/30 text-base md:text-lg border-0 w-full"
              />
            </div>
            
            <div className="flex flex-wrap gap-3 md:gap-4">
              <div className="relative flex-1 md:flex-none">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-luxury-gold pointer-events-none" size={16} md:size={18} />
                <select 
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  className="bg-white/5 border-0 rounded-xl md:rounded-2xl h-14 md:h-16 pl-12 md:pl-14 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-luxury-gold/30 w-full md:min-w-[200px] text-xs uppercase font-bold tracking-widest cursor-pointer"
                >
                  {cities.map(city => <option key={city} value={city} className="bg-luxury-black">{city === 'All' ? 'All Regions' : city}</option>)}
                </select>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="border-white/10 text-white h-14 md:h-16 px-6 md:px-8 rounded-xl md:rounded-2xl hover:bg-white/5 uppercase text-[9px] md:text-[10px] font-bold tracking-widest flex-1 md:flex-none"
              >
                <SlidersHorizontal size={16} md:size={18} className="mr-2 md:mr-3" />
                Advanced
              </Button>
            </div>
          </div>

          <div className="h-0.5 bg-white/5 my-8"></div>

          {/* Categories Bar */}
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCurrentCategory(cat)}
                className={`px-8 py-4 rounded-xl text-[10px] uppercase font-bold tracking-[0.15em] whitespace-nowrap border transition-all duration-300 ${
                  currentCategory === cat 
                    ? 'bg-luxury-gold border-luxury-gold text-luxury-black shadow-lg shadow-luxury-gold/10' 
                    : 'bg-white/5 border-transparent text-white/30 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex justify-between items-center mb-10 px-4">
          <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.2em]">
            Showing <span className="text-white">{filteredPros.length}</span> Verified Experts
          </p>
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><Grid size={20} /></Button>
             <Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><ListIcon size={20} /></Button>
          </div>
        </div>

        {/* Professionals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          <AnimatePresence mode="popLayout">
            {filteredPros.length > 0 ? (
              filteredPros.map(pro => (
                <ProfessionalCard key={pro.id} professional={pro} />
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">
                <EmptyState 
                  title="Registry Offline" 
                  description={MOCK_PROFESSIONALS.length === 0 ? "Verified expert profiles are currently undergoing regional background checks. Access will be restored shortly." : "No experts match your current filters. Consider broadening your criteria."} 
                  icon={<Users size={48} />}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
