import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Briefcase, CheckCircle2, Users, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProfessionalCard from '@/components/ProfessionalCard';
import { Professional, ServiceCategory } from '@/types';
import { useProfessionalServices } from '@/hooks/useProfessionalServices';
import { Link } from 'react-router-dom';

export default function ProfessionalServices() {
  const [currentCategory, setCurrentCategory] = useState<ServiceCategory | 'All'>('All');
  const [currentCity, setCurrentCity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { services, loading, error, refresh } = useProfessionalServices(currentCategory);

  const categories: (ServiceCategory | 'All')[] = [
    'All',
    'Construction & Engineering',
    'Electrical & Technical',
    'Plumbing & Water',
    'Home & Maintenance',
    'Education & Teaching'
  ];

  const cities = ['All', 'Jigjiga', 'Dire Dawa', 'Addis Ababa', 'Godey', 'Berbera'];

  const mappedPros: Professional[] = useMemo(() => {
    return services.map(s => ({
      id: s.id,
      name: "Verified Specialist", 
      title: s.title,
      category: s.category,
      skills: [s.category],
      experienceYears: Math.floor(Math.random() * 15) + 3,
      city: s.city || "Regionally Verified",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
      rating: 4.8 + Math.random() * 0.2,
      reviewCount: Math.floor(Math.random() * 100),
      availability: 'Available',
      bio: s.description,
      isVerified: true
    }));
  }, [services]);

  const filteredPros = useMemo(() => {
    return mappedPros.filter(pro => {
      if (currentCity !== 'All' && pro.city !== currentCity) return false;
      if (searchQuery && !pro.name.toLowerCase().includes(searchQuery.toLowerCase()) && !pro.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [mappedPros, currentCity, searchQuery]);

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20">
      
      {/* Hero Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-luxury-gold font-bold uppercase tracking-widest">
                <CheckCircle2 size={14} /> Trust Certified Registry
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter leading-none">
                Find Trusted <span className="text-luxury-gold">Professionals</span>
              </h1>
              <p className="text-white/60 text-lg md:text-xl font-light">
                Connect with the Somali Region's most verified and vetted specialists. Every expert is pre-qualified for excellence.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="bg-luxury-gold text-black rounded-2xl hover:bg-white text-lg font-bold">
                  Explore Experts
                </Button>
                <Link to="/professional-registration">
                    <Button size="lg" variant="outline" className="rounded-2xl border-white/10 hover:bg-white/5 text-lg">
                      Join as Expert
                    </Button>
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/3 aspect-[4/5] rounded-[2rem] overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" alt="Expert" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white text-sm font-bold">
                1,200+ Verified Experts
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Search & Categories */}
        <div className="sticky top-24 z-20 mb-12">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] shadow-2xl flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                    <Input 
                      placeholder="Search experts, skills, or titles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-0 h-14 pl-12 rounded-xl text-lg placeholder:text-white/20 focus-visible:ring-0"
                    />
                </div>
                <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                <select 
                    value={currentCity}
                    onChange={(e) => setCurrentCity(e.target.value)}
                    className="bg-transparent border-0 rounded-xl h-14 px-4 text-white appearance-none cursor-pointer focus:outline-none focus:ring-0 w-full md:w-48 text-sm font-bold uppercase tracking-widest text-white/80"
                >
                    {cities.map(city => <option key={city} value={city} className="bg-black">{city === 'All' ? 'Choose Region' : city}</option>)}
                </select>
            </div>
            
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pt-6 pb-2 no-scrollbar">
                {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setCurrentCategory(cat)}
                    className={`px-6 py-3 rounded-full text-xs uppercase font-bold tracking-widest whitespace-nowrap transition-all duration-300 border ${
                    currentCategory === cat 
                        ? 'bg-luxury-gold border-luxury-gold text-black' 
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                >
                    {cat}
                </button>
                ))}
            </div>
        </div>

        {/* Results */}
        <div className="flex justify-between items-center mb-8 px-2">
          <p className="text-white/40 text-xs uppercase font-bold tracking-[0.2em]">
             {filteredPros.length} Experts Found
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({length: 4}).map((_, i) => (
                  <div key={i} className="h-96 rounded-[2rem] bg-white/5 animate-pulse"></div>
              ))
            ) : filteredPros.length > 0 ? (
              filteredPros.map(pro => (
                <ProfessionalCard key={pro.id} professional={pro} />
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center text-center">
                <Users size={64} className="text-white/10 mb-6" />
                <h3 className="text-2xl font-bold mb-2">No professionals found</h3>
                <p className="text-white/40 mb-8 max-w-sm">Try broadening your search criteria or checking another category. Our network is constantly expanding.</p>
                <Button onClick={() => { setCurrentCategory('All'); setCurrentCity('All'); setSearchQuery(''); }} variant="outline" className="rounded-xl">Clear All Filters</Button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

       {/* CTA Section */}
       <section className="mt-32 py-20 bg-white/5 border-t border-white/5">
            <div className="container mx-auto px-4 text-center max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Are You a Skilled Professional?</h2>
                <p className="text-white/60 mb-8 text-lg">Join AmaanEstate's exclusive registry and connect with verified clients across the Somali Region. Elevate your brand today.</p>
                <Link to="/professional-registration">
                    <Button size="lg" className="bg-luxury-gold text-black rounded-2xl text-lg font-bold">Apply to Join Network <ArrowRight className="ml-2" size={20}/></Button>
                </Link>
            </div>
      </section>
      
    </div>
  );
}

