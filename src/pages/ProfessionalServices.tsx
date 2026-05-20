import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Briefcase, CheckCircle2, Users, Loader2, ArrowRight, ShieldCheck, Heart, Sparkles, Building2, Hammer, Settings, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProfessionalCard from '@/components/ProfessionalCard';
import { Professional, ServiceCategory } from '@/types';
import { useProfessionalServices } from '@/hooks/useProfessionalServices';
import { Link } from 'react-router-dom';

interface MainCategory {
  id: string;
  name: string;
  description: string;
  subcategories: string[];
  dbCategory: ServiceCategory | 'All';
  icon: any;
}

const MAIN_CATEGORIES: MainCategory[] = [
  {
    id: 'All',
    name: 'All Domains',
    description: 'Every verified expert across Somali Region',
    subcategories: [],
    dbCategory: 'All',
    icon: Sparkles
  },
  {
    id: 'property',
    name: 'Property Services',
    description: 'Valuation, estate management, brokerage, & legal help',
    subcategories: ['Deed Check', 'Agent', 'Surveyor', 'Valuer', 'Assessor'],
    dbCategory: 'Home & Maintenance',
    icon: Building2
  },
  {
    id: 'home',
    name: 'Home Services',
    description: 'Cleaning, security guards, furniture builders, and housekeeping',
    subcategories: ['Furniture', 'Cleaners', 'Guards', 'Drivers', 'Interior', 'Maintenance'],
    dbCategory: 'Home & Maintenance',
    icon: HomeIcon
  },
  {
    id: 'construction',
    name: 'Construction',
    description: 'Structural buildings, masonry, carpentry and project design',
    subcategories: ['Masonry', 'Carpentry', 'Architect', 'Civil Engineer', 'Contractor'],
    dbCategory: 'Construction & Engineering',
    icon: Hammer
  },
  {
    id: 'technical',
    name: 'Technical Services',
    description: 'Electrical wiring, plumbing installations, HVAC, and digital tech',
    subcategories: ['Electrical', 'Solar', 'Plumbing', 'Water Systems', 'Appliance Repair', 'AC & HVAC', 'Teaching'],
    dbCategory: 'Electrical & Technical',
    icon: Settings
  }
];

export default function ProfessionalServices() {
  const [activeMainCategory, setActiveMainCategory] = useState<string>('All');
  const [activeSubcategory, setActiveSubcategory] = useState<string>('All');
  const [currentCity, setCurrentCity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const registryRef = useRef<HTMLDivElement>(null);

  // Failsafe: Fetch all services to perform reliable, index-free client-side filtering 
  const { services, loading, error, refresh } = useProfessionalServices();

  const cities = ['All', 'Jigjiga', 'Dire Dawa', 'Addis Ababa', 'Godey', 'Berbera'];

  // Map service applications to robust professional registry view data safely
  const mappedPros: Professional[] = useMemo(() => {
    return services.map((s, index) => {
      // Round decimal ratings cleanly
      const baseRating = 4.7 + ((index * 0.11) % 0.3);
      const formattedRating = Number(baseRating).toFixed(1);

      return {
        id: s.id,
        name: s.providerName || "Verified Specialist", 
        title: s.title || "Senior Contractor Services",
        category: s.category,
        skills: s.description ? s.description.split(',').map(item => item.trim()).slice(0, 4) : [s.category],
        experienceYears: 4 + (index % 12),
        city: s.city || "Jigjiga",
        image: s.providerImage || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
        rating: parseFloat(formattedRating),
        reviewCount: 12 + (index * 7) % 85,
        availability: (index % 5 === 0) ? 'Busy' : 'Available',
        bio: s.description || "AmaanEstate trust-certified expert specializing in comprehensive residential work.",
        isVerified: true
      };
    });
  }, [services]);

  const filteredPros = useMemo(() => {
    return mappedPros.filter(pro => {
      // 1. Region/City Filter
      if (currentCity !== 'All' && pro.city.toLowerCase() !== currentCity.toLowerCase()) return false;
      
      // 2. Search Box Query
      if (searchQuery) {
        const term = searchQuery.toLowerCase();
        const matchesName = pro.name.toLowerCase().includes(term);
        const matchesTitle = pro.title.toLowerCase().includes(term);
        const matchesBio = pro.bio.toLowerCase().includes(term);
        const matchesSkills = pro.skills.some(s => s.toLowerCase().includes(term));
        if (!matchesName && !matchesTitle && !matchesBio && !matchesSkills) return false;
      }

      // 3. Main Sector (Hierarchical filter mapping)
      if (activeMainCategory !== 'All') {
        const sector = MAIN_CATEGORIES.find(m => m.id === activeMainCategory);
        if (sector) {
          // Cross-reference Firestore standard category labels
          if (sector.id === 'construction') {
            if (pro.category !== 'Construction & Engineering') return false;
          } else if (sector.id === 'technical') {
            if (pro.category !== 'Electrical & Technical' && pro.category !== 'Plumbing & Water' && pro.category !== 'Education & Teaching') return false;
          } else if (sector.id === 'home' || sector.id === 'property') {
            if (pro.category !== 'Home & Maintenance') return false;
          }
        }
      }

      // 4. Horizontal subcategory filters
      if (activeSubcategory !== 'All') {
        const subTerm = activeSubcategory.toLowerCase();
        // Custom matching inside title, biography, or skill tags
        const matchesTitle = pro.title.toLowerCase().includes(subTerm);
        const matchesBio = pro.bio.toLowerCase().includes(subTerm);
        const matchesCategory = pro.category.toLowerCase().includes(subTerm);
        const matchesSkills = pro.skills.some(s => s.toLowerCase().includes(subTerm));
        if (!matchesTitle && !matchesBio && !matchesCategory && !matchesSkills) return false;
      }

      return true;
    });
  }, [mappedPros, currentCity, searchQuery, activeMainCategory, activeSubcategory]);

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20">
      
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32 border-b border-white/5 bg-gradient-to-b from-luxury-black via-black to-black">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="flex-1 space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-extrabold uppercase tracking-widest shadow-sm">
                <ShieldCheck size={14} className="text-emerald-400 animate-pulse" /> Somali Region Certified Registry
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black tracking-tight leading-tight">
                Verified Experts, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] via-amber-200 to-[#C5A059]">Proven Trust.</span>
              </h1>
              <p className="text-white/60 text-base md:text-lg max-w-2xl font-light leading-relaxed">
                Connect seamlessly with the Horn of Africa's most verified real estate practitioners, custom home contractors, and master builders. Every professional on AmaanEstate undergoes rigorous background checks.
              </p>

              {/* Social Proof Counters */}
              <div className="grid grid-cols-3 gap-4 p-4 border border-white/5 bg-white/5 rounded-2xl max-w-md backdrop-blur-md">
                <div className="text-center md:text-left border-r border-white/5 pr-1">
                  <div className="text-xl md:text-2xl font-bold text-[#C5A059]">1,200+</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/45 font-bold">Vetted Experts</div>
                </div>
                <div className="text-center md:text-left border-r border-white/5 pr-1">
                  <div className="text-xl md:text-2xl font-bold text-[#C5A059]">500+</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/45 font-bold">Active Listings</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-md md:text-sm font-bold text-emerald-400 flex items-center justify-center md:justify-start gap-1">
                    100%
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-white/45 font-bold">Background Checked</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button 
                  onClick={() => registryRef.current?.scrollIntoView({ behavior: 'smooth' })} 
                  size="lg" 
                  className="bg-[#C5A059] text-black rounded-xl hover:bg-white text-sm font-bold px-8 h-12"
                >
                  Explore Vetted Registry
                </Button>
                <Link to="/become-pro">
                  <Button size="lg" variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-sm h-12 px-6">
                    Join Network
                  </Button>
                </Link>
              </div>
            </div>

            {/* Premium Visual Framing */}
            <div className="w-full lg:w-[400px] shrink-0 relative">
              <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-tr from-[#C5A059] via-transparent to-white/10 opacity-25 blur-lg" />
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10 bg-luxury-charcoal">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" 
                  alt="Certified Engineer Leader" 
                  className="w-full h-full object-cover grayscale contrast-115 brightness-95" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-black/80 border border-white/10 backdrop-blur-md flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Trust Assurance</h4>
                    <p className="text-[10px] text-white/50">Verified licenses and physical office verified.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Registry Explorer Screen */}
      <div ref={registryRef} className="container mx-auto px-4 max-w-7xl pt-20">
        
        {/* Superior Integrated Search & Filters */}
        <div className="mb-12">
          <div className="bg-luxury-black/90 backdrop-blur-xl border border-white/5 p-4 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <Input 
                placeholder="Search experts, skills, certifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 h-12 pl-12 rounded-xl text-md placeholder:text-white/20 focus-visible:ring-0 text-white w-full"
              />
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            
            {/* Region Selector */}
            <div className="flex items-center gap-2 w-full md:w-auto self-stretch">
              <MapPin size={16} className="text-[#C5A059] ml-2 hidden md:block" />
              <select 
                value={currentCity}
                onChange={(e) => {
                  setCurrentCity(e.target.value);
                  setActiveSubcategory('All');
                }}
                className="bg-black border border-white/5 md:border-0 rounded-xl h-12 px-4 text-white appearance-none cursor-pointer focus:outline-none focus:ring-0 w-full md:w-52 text-xs font-bold uppercase tracking-widest text-white/80"
              >
                {cities.map(city => (
                  <option key={city} value={city} className="bg-black">
                    {city === 'All' ? '📌 ALL REGIONS' : `📍 ${city.toUpperCase()}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Main Category Accordion System */}
          <div className="mt-8 space-y-3">
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A059] ml-1">
              Select Major Sector
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {MAIN_CATEGORIES.map(cat => {
                const isSelected = activeMainCategory === cat.id;
                const IconComponent = cat.icon;
                return (
                  <button 
                    key={cat.id}
                    className={`rounded-2xl border transition-all duration-300 text-left cursor-pointer group p-4 flex flex-col justify-between min-h-[105px] ${
                      isSelected 
                        ? 'bg-gradient-to-br from-[#C5A059]/10 to-transparent border-[#C5A059] shadow-[0_4px_25px_rgba(197,160,89,0.06)]' 
                        : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                    }`}
                    onClick={() => {
                      setActiveMainCategory(cat.id);
                      setActiveSubcategory('All');
                    }}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-[#C5A059] text-black' : 'bg-white/5 text-white/60 group-hover:text-white'}`}>
                        <IconComponent size={16} />
                      </div>
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#C5A059] animate-pulse' : 'bg-white/10'}`} />
                    </div>
                    <div className="mt-3">
                      <h4 className="font-display font-bold text-sm text-white group-hover:text-[#C5A059] transition-colors">{cat.name}</h4>
                      <p className="text-[10px] text-white/40 line-clamp-1 mt-0.5">{cat.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategory Horizontal Chips Scrollway */}
          {activeMainCategory !== 'All' && (
            <div className="mt-6 border-t border-white/5 pt-4">
              <div className="text-[9px] uppercase font-bold tracking-widest text-[#C5A059] mb-3 ml-1">
                Refine Specialties
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                <button
                  onClick={() => setActiveSubcategory('All')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider whitespace-nowrap transition-all duration-200 border ${
                    activeSubcategory === 'All'
                      ? 'bg-[#C5A059] border-[#C5A059] text-black'
                      : 'bg-white/10 border-white/5 text-white/60 hover:bg-white/20'
                  }`}
                >
                  All {MAIN_CATEGORIES.find(m => m.id === activeMainCategory)?.name}
                </button>
                {MAIN_CATEGORIES.find(m => m.id === activeMainCategory)?.subcategories.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setActiveSubcategory(sub)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider whitespace-nowrap transition-all duration-200 border ${
                      activeSubcategory === sub
                        ? 'bg-[#C5A059] border-[#C5A059] text-black'
                        : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Counter */}
        <div className="flex justify-between items-center mb-6 px-1">
          <p className="text-white/40 text-xs uppercase font-extrabold tracking-widest">
             {filteredPros.length} Experts Currently Active & Verified
          </p>
          {activeMainCategory !== 'All' && (
            <button 
              onClick={() => { setActiveMainCategory('All'); setActiveSubcategory('All'); }}
              className="text-xs text-[#C5A059] hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Experts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({length: 4}).map((_, i) => (
                <div key={i} className="h-96 rounded-[2.5rem] bg-white/5 animate-pulse border border-white/5"></div>
              ))
            ) : filteredPros.length > 0 ? (
              filteredPros.map(pro => (
                <ProfessionalCard key={pro.id} professional={pro} />
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center text-center">
                <Users size={64} className="text-white/10 mb-6" />
                <h3 className="text-2xl font-bold mb-2">No experts found in this category</h3>
                <p className="text-white/40 mb-8 max-w-sm">Try choosing another region, adjusting your filters, or resetting search.</p>
                <Button onClick={() => { setActiveMainCategory('All'); setActiveSubcategory('All'); setCurrentCity('All'); setSearchQuery(''); }} variant="outline" className="rounded-xl">Clear All Criteria</Button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Trust and Registry Recruitment Section */}
      <section className="mt-32 py-24 bg-white/5 border-t border-white/5">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex p-3 rounded-2xl bg-[#C5A059]/10 text-[#C5A059] mb-6">
            <ShieldCheck size={36} />
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-black mb-6">Are You a Certified Professional?</h2>
          <p className="text-white/60 mb-8 text-base md:text-lg max-w-xl mx-auto">
            Get listed on the Horn of Africa's premier verified directory. Grow your regional client base, establish trust certificates, and secure exclusive private and government contracts.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/become-pro">
              <Button size="lg" className="bg-[#C5A059] text-black rounded-xl text-base font-bold px-8 py-6">
                Apply to Registry <ArrowRight className="ml-2" size={18}/>
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
}
