import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Grid, List as ListIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PropertyCard from '@/components/PropertyCard';
import { motion, AnimatePresence } from 'motion/react';
import { Property } from '@/types';

const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Modern Villa with Palace View',
    price: 350000,
    location: 'Airport Road',
    city: 'Jigjiga',
    beds: 5,
    baths: 4,
    size: '450 sqm',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
    type: 'sale',
    category: 'Villa',
    status: 'published'
  },
  {
    id: '2',
    title: 'Luxury Apartment Downtown',
    price: 2500,
    location: 'City Center',
    city: 'Dire Dawa',
    beds: 3,
    baths: 2,
    size: '180 sqm',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200',
    type: 'rent',
    category: 'Apartment',
    status: 'published'
  },
  {
    id: '3',
    title: 'Premium Office Space',
    price: 1200000,
    location: 'Business District',
    city: 'Addis Ababa',
    size: '1200 sqm',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
    type: 'sale',
    category: 'Commercial',
    status: 'published'
  },
  {
    id: '4',
    title: 'Prime G+1 Family House',
    price: 180000,
    location: 'Bole Area',
    city: 'Addis Ababa',
    beds: 4,
    baths: 3,
    size: '300 sqm',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    type: 'sale',
    category: 'House',
    status: 'published'
  },
  {
    id: '5',
    title: 'Strategic Development Land',
    price: 55000,
    location: 'Expanding Zone',
    city: 'Jigjiga',
    size: '1000 sqm',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200',
    type: 'sale',
    category: 'Land',
    status: 'published'
  },
  {
    id: '6',
    title: 'Exclusive Rental Apartment',
    price: 1800,
    location: 'Diplomatic Quarter',
    city: 'Jigjiga',
    beds: 2,
    baths: 1,
    size: '120 sqm',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1200',
    type: 'rent',
    category: 'Apartment',
    status: 'published'
  }
];

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
      <div className="border-b border-white/5 pb-12 mb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <nav className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest mb-4">
                <Link to="/" className="hover:text-luxury-gold transition-colors">Home</Link>
                <span>/</span>
                <span className="text-luxury-gold font-bold">Marketplace</span>
              </nav>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
                Our Premium <span className="text-white/40">Properties</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-luxury-charcoal p-1 rounded-xl border border-white/5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-lg ${viewMode === 'grid' ? 'bg-luxury-gold text-luxury-black' : 'text-white/40 hover:text-white'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-lg ${viewMode === 'list' ? 'bg-luxury-gold text-luxury-black' : 'text-white/40 hover:text-white'}`}
                  onClick={() => setViewMode('list')}
                >
                  <ListIcon size={18} />
                </Button>
              </div>
              <Button 
                onClick={() => setShowFilters(!showFilters)}
                className={`bg-luxury-charcoal border-white/10 hover:border-luxury-gold text-white flex items-center gap-2 h-12 rounded-xl transition-all ${showFilters ? 'ring-2 ring-luxury-gold' : ''}`}
                variant="outline"
              >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
                {(currentCategory !== 'All' || currentType !== 'All' || currentCity !== 'All') && (
                  <Badge className="bg-luxury-gold text-luxury-black ml-2 h-5 min-w-5 flex items-center justify-center p-0">
                    !
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-10">
            <div>
              <h3 className="text-white font-display font-bold uppercase tracking-widest text-xs mb-6 flex items-center">
                Search <div className="h-px flex-1 bg-white/10 ml-4"></div>
              </h3>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-luxury-gold transition-colors" size={18} />
                <Input 
                  placeholder="Keyword..." 
                  className="bg-luxury-charcoal/50 border-white/5 h-14 pl-12 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/50"
                />
              </div>
            </div>

            <div>
              <h3 className="text-white font-display font-bold uppercase tracking-widest text-xs mb-6 flex items-center">
                Property Type <div className="h-px flex-1 bg-white/10 ml-4"></div>
              </h3>
              <div className="space-y-3">
                {['All', 'Villa', 'Apartment', 'Commercial', 'Land', 'House'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateFilter('category', cat)}
                    className={`w-full text-left py-3 px-4 rounded-xl transition-all flex justify-between items-center group ${
                      currentCategory === cat ? 'bg-luxury-gold text-luxury-black font-bold' : 'text-white/40 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{cat}</span>
                    {currentCategory === cat && <X size={14} className="opacity-60" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-display font-bold uppercase tracking-widest text-xs mb-6 flex items-center">
                Listing Type <div className="h-px flex-1 bg-white/10 ml-4"></div>
              </h3>
              <div className="flex gap-2">
                {['All', 'sale', 'rent'].map((type) => (
                  <Button
                    key={type}
                    variant={currentType === type ? 'default' : 'outline'}
                    className={`flex-1 rounded-xl uppercase text-[10px] tracking-[0.2em] font-bold h-10 ${
                      currentType === type ? 'bg-luxury-gold text-luxury-black border-0' : 'border-white/10 text-white/40 hover:bg-white/5 h-10'
                    }`}
                    onClick={() => updateFilter('listingType', type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-display font-bold uppercase tracking-widest text-xs mb-6 flex items-center">
                Location <div className="h-px flex-1 bg-white/10 ml-4"></div>
              </h3>
              <div className="space-y-3">
                {['All', 'Jigjiga', 'Dire Dawa', 'Addis Ababa', 'Godey'].map((city) => (
                  <button
                    key={city}
                    onClick={() => updateFilter('city', city)}
                    className={`w-full text-left py-3 px-4 rounded-xl transition-all flex justify-between items-center group ${
                      currentCity === city ? 'bg-luxury-gold text-luxury-black font-bold' : 'text-white/40 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin size={14} className={currentCity === city ? 'text-luxury-black' : 'text-luxury-gold'} />
                      <span>{city}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button 
              variant="ghost" 
              className="w-full text-white/40 hover:text-white hover:bg-white/5 rounded-xl text-xs uppercase tracking-widest"
              onClick={clearFilters}
            >
              Reset All Filters
            </Button>
          </aside>

          {/* Main Grid */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {filterProperties.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-96 flex flex-col items-center justify-center text-center p-10 bg-luxury-charcoal/20 border border-white/5 rounded-[3rem]"
                >
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-white/20">
                    <Search size={40} />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Refine Your Search</h3>
                  <p className="text-white/40 max-w-sm mb-8">No properties match your current filters. Experience tells us that excellence is worth the search.</p>
                  <Button onClick={clearFilters} className="bg-luxury-gold text-luxury-black font-bold h-12 px-8 rounded-xl">
                    View All Inventory
                  </Button>
                </motion.div>
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
