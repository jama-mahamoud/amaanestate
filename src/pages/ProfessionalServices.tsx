import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, MapPin, Grid, List as ListIcon, X, Star, Briefcase, CheckCircle2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ProfessionalCard from '@/components/ProfessionalCard';
import { Professional, ServiceCategory } from '@/types';

const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: 'p1',
    name: 'Eng. Ahmed Duale',
    title: 'Senior Civil Engineer',
    category: 'Construction & Engineering',
    skills: ['Structural Design', 'Project Management', 'AutoCAD', 'Surveying'],
    experienceYears: 12,
    city: 'Jigjiga',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    reviewCount: 124,
    availability: 'Available',
    bio: 'Specializing in residential and commercial structural integrity across the Somali Region.',
    isVerified: true
  },
  {
    id: 'p2',
    name: 'Fowzia Jibril',
    title: 'Interior Design Expert',
    category: 'Construction & Engineering',
    skills: ['Space Planning', 'Somali Traditional Decor', 'Modern Minimalist', 'Lighting'],
    experienceYears: 8,
    city: 'Dire Dawa',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    rating: 4.8,
    reviewCount: 86,
    availability: 'Busy',
    bio: 'Bringing a blend of cultural heritage and modern aesthetics to your living spaces.',
    isVerified: true
  },
  {
    id: 'p3',
    name: 'Mustafa Omar',
    title: 'Certified Electrician',
    category: 'Electrical & Technical',
    skills: ['Solar Installation', 'Smart Home Wiring', 'Industrial Maintenance'],
    experienceYears: 15,
    city: 'Addis Ababa',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    rating: 5.0,
    reviewCount: 210,
    availability: 'Available',
    bio: 'Lead technician for major solar projects in the region.',
    isVerified: true
  },
  {
    id: 'p4',
    name: 'Zahra Hassan',
    title: 'Senior Quran Teacher',
    category: 'Education & Teaching',
    skills: ['Tajweed', 'Hifdh', 'Islamic Studies', 'Tafsir'],
    experienceYears: 10,
    city: 'Jigjiga',
    image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    reviewCount: 340,
    availability: 'Available',
    bio: 'Dedicated to preserving our spiritual heritage through excellence in teaching.',
    isVerified: true
  },
  {
    id: 'p5',
    name: 'Bashir Idleh',
    title: 'Borehole Drilling Specialist',
    category: 'Plumbing & Water',
    skills: ['Geological Survey', 'Rig Operation', 'Pump Installation'],
    experienceYears: 20,
    city: 'Godey',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    rating: 4.7,
    reviewCount: 52,
    availability: 'On Leave',
    bio: 'Ensuring sustainable water access across the Somali Region.',
    isVerified: false
  }
];

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
            <h1 className="text-6xl md:text-8xl font-display font-bold text-white tracking-tighter leading-none mb-8">
              Expert <span className="gold-text-gradient">Registry</span>
            </h1>
            <p className="text-white/40 text-xl leading-relaxed font-light">
              Connect with the Somali Region's most prestigious and verified professionals.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Search & Filters */}
        <div className="glass-card p-6 md:p-8 rounded-[2.5rem] mb-20 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={22} />
              <Input 
                placeholder="Search experts by specialty or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border-white/5 h-16 pl-16 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/30 text-lg border-0"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-luxury-gold pointer-events-none" size={18} />
                <select 
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  className="bg-white/5 border-0 rounded-2xl h-16 pl-14 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-luxury-gold/30 min-w-[200px] text-sm uppercase font-bold tracking-widest"
                >
                  {cities.map(city => <option key={city} value={city} className="bg-luxury-black">{city === 'All' ? 'All Regions' : city}</option>)}
                </select>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="border-white/10 text-white h-16 px-8 rounded-2xl hover:bg-white/5 uppercase text-[10px] font-bold tracking-widest"
              >
                <SlidersHorizontal size={18} className="mr-3" />
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
            {filteredPros.map(pro => (
              <ProfessionalCard key={pro.id} professional={pro} />
            ))}
          </AnimatePresence>
        </div>

        {filteredPros.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-96 flex flex-col items-center justify-center text-center p-10 bg-luxury-charcoal/20 border border-white/5 rounded-[4rem]"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-white/20">
              <Users size={40} />
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-2">Refining Search</h3>
            <p className="text-white/40 max-w-sm">We couldn't find any experts matching your current criteria. Consider broadening your filters.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
