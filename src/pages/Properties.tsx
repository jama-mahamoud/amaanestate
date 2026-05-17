import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Grid, List as ListIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PropertyCard from '@/components/PropertyCard';
import { motion, AnimatePresence } from 'motion/react';
import EmptyState from '@/components/EmptyState';
import { Property } from '@/types';

const MOCK_PROPERTIES: Property[] = [];

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const currentCategory = searchParams.get('category') || 'All';
  const currentType = searchParams.get('listingType') || 'All';
  const currentCity = searchParams.get('city') || 'All';

  const filterProperties = MOCK_PROPERTIES.filter(p => {
    if (currentCategory !== 'All' && p.category !== currentCategory) return false;
    if (currentType !== 'All' && p.type !== currentType) return false;
    if (currentCity !== 'All' && p.city !== currentCity) return false;
    return true;
  });

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="min-h-screen bg-luxury-black pt-28 pb-20">
      {/* Header */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-luxury-gold/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-3xl">
              <nav className="flex items-center gap-3 text-white/40 text-[10px] uppercase font-bold tracking-[0.3em] mb-6">
                <Link to="/" className="hover:text-luxury-gold transition-colors">AmaanEstate</Link>
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                <span className="text-luxury-gold">Marketplace</span>
              </nav>
              <h1 className="text-4xl md:text-8xl font-display font-bold text-white tracking-tighter leading-[1.1] md:leading-none mb-6 md:mb-8">
                Premium <br /><span className="gold-text-gradient">Portfolio</span>
              </h1>
              <p className="text-white/40 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                The most exclusive real estate opportunities across the Somali Region, curated for those who seek excellence.
              </p>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="flex items-center bg-white/5 p-2 rounded-2xl border border-white/5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`w-12 h-12 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-luxury-gold text-luxury-black shadow-lg shadow-luxury-gold/20' : 'text-white/20 hover:text-white'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={20} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`w-12 h-12 rounded-xl transition-all ${viewMode === 'list' ? 'bg-luxury-gold text-luxury-black shadow-lg shadow-luxury-gold/20' : 'text-white/20 hover:text-white'}`}
                  onClick={() => setViewMode('list')}
                >
                  <ListIcon size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Quick Filter Bar */}
        <div className="glass-card mb-12 md:mb-16 p-2 md:p-4 rounded-3xl md:rounded-[2rem] flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
           <div className="flex-1 relative group border-0">
              <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={18} md:size={20} />
              <Input 
                placeholder="Search database..." 
                className="bg-white/5 border-0 h-12 md:h-14 pl-14 md:pl-16 rounded-xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/30 text-sm md:text-base w-full"
              />
           </div>
           <div className="h-px md:h-10 w-full md:w-px bg-white/5" />
           <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
             {['All', 'sale', 'rent'].map(type => (
               <button 
                key={type}
                onClick={() => updateFilter('listingType', type)}
                className={`h-12 md:h-14 px-6 md:px-8 rounded-xl text-[9px] md:text-[10px] uppercase font-bold tracking-widest transition-all whitespace-nowrap flex-1 md:flex-none ${
                  currentType === type ? 'bg-luxury-gold text-luxury-black' : 'hover:bg-white/5 text-white/40 border border-white/5'
                }`}
               >
                 For {type}
               </button>
             ))}
           </div>
           <Button 
             variant="outline" 
             onClick={() => setShowFilters(!showFilters)}
             className="lg:hidden h-12 border-white/5 bg-white/5 text-white rounded-xl text-[9px] uppercase font-bold tracking-widest"
           >
             <SlidersHorizontal size={14} className="mr-2" /> {showFilters ? 'Hide' : 'Filters'}
           </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Filters Sidebar (Mobile Toggleable / Desktop Permanent) */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 shrink-0 space-y-10 lg:space-y-12 mb-12 lg:mb-0`}>
            <div>
              <h3 className="text-white text-[10px] uppercase font-bold tracking-[0.3em] mb-8 flex items-center">
                Property Category <div className="h-px flex-1 bg-white/5 ml-6"></div>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {['All', 'Villa', 'Apartment', 'Commercial', 'Land', 'House'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateFilter('category', cat)}
                    className={`flex items-center justify-between px-6 py-4 rounded-xl text-sm font-medium transition-all group ${
                      currentCategory === cat 
                        ? 'bg-luxury-gold text-luxury-black font-bold shadow-lg shadow-luxury-gold/10' 
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {cat}
                    <div className={`w-2 h-2 rounded-full transition-all ${currentCategory === cat ? 'bg-luxury-black' : 'bg-transparent group-hover:bg-white/20'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white text-[10px] uppercase font-bold tracking-[0.3em] mb-8 flex items-center">
                Premium Regions <div className="h-px flex-1 bg-white/5 ml-6"></div>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {['All', 'Jigjiga', 'Dire Dawa', 'Addis Ababa', 'Godey'].map((city) => (
                  <button
                    key={city}
                    onClick={() => updateFilter('city', city)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-xl text-sm font-medium transition-all group ${
                      currentCity === city 
                        ? 'bg-luxury-gold text-luxury-black font-bold shadow-lg shadow-luxury-gold/10' 
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <MapPin size={16} className={currentCity === city ? 'text-luxury-black' : 'text-luxury-gold'} />
                    {city === 'All' ? 'All Locations' : city}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              variant="ghost" 
              className="w-full text-white/20 hover:text-white hover:bg-white/5 rounded-xl text-[10px] uppercase font-bold tracking-widest h-14"
              onClick={clearFilters}
            >
              Clear Preferences
            </Button>
          </aside>

          {/* Main Grid */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {filterProperties.length === 0 ? (
                <EmptyState 
                  title="No Estates Found" 
                  description={MOCK_PROPERTIES.length === 0 ? "The regional portfolio is currently being updated with verified listings." : "No properties match your current filters. Experience tells us that excellence is worth the search."} 
                  actionLabel={MOCK_PROPERTIES.length === 0 ? undefined : "View All Inventory"}
                  onAction={MOCK_PROPERTIES.length === 0 ? undefined : clearFilters}
                  icon={<Search size={48} />}
                />
              ) : (
                <motion.div 
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
                >
                  {filterProperties.map((prop) => (
                    <PropertyCard key={prop.id} property={prop} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-20 flex justify-center">
              <div className="flex gap-2">
                {[1, 2, 3].map((p) => (
                  <Button 
                    key={p} 
                    variant={p === 1 ? 'default' : 'outline'}
                    className={`w-12 h-12 rounded-xl scale-90 ${p === 1 ? 'bg-luxury-gold text-luxury-black' : 'border-white/10 text-white/40'}`}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer - Could be implemented if needed, current design is responsive enough with the header toggle */}
    </div>
  );
}
