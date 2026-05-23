import React, { useState } from 'react';
import { Search, MapPin, Building, Sparkles, Home, Key, BadgePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListingFilter } from '@/services/listingService';
import { motion, AnimatePresence } from 'motion/react';

const cities = [
  'Mogadishu', 'Hargeisa', 'Bosaso', 'Garowe', 'Kismayo', 'Baidoa', 'Burco', 'Laascaanood',
  'Beledweyne', 'Galkayo', 'Jowhar', 'Marka', 'Baraawe', 'Dhusamareb', 'Afgooye', 'Erigavo',
  'Berbera', 'Jigjiga', 'Dire Dawa', 'Other'
];

interface HomeSearchProps {
  onSearch: (filters: ListingFilter) => void;
}

type TabType = 'sale' | 'rent' | 'sell';

export default function HomeSearch({ onSearch }: HomeSearchProps) {
  const [city, setCity] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [listingType, setListingType] = useState<string>('');

  const handleSearch = () => {
    let resolvedCategory: any = undefined;
    let resolvedSubcategory: string | undefined = type === 'all' ? undefined : type;

    if (type === 'vehicle') {
        resolvedCategory = 'vehicle';
        resolvedSubcategory = undefined;
    } else if (['house', 'villa', 'apartment', 'land', 'commercial'].includes(type || '')) {
        resolvedCategory = 'property';
    }

    onSearch({
        category: resolvedCategory,
        city: city && city !== 'all' ? city : undefined,
        listingType: listingType ? (listingType as any) : undefined,
        subcategory: resolvedSubcategory,
    });
  };

  return (
    <div className="bg-[#1A1A1A]/90 backdrop-blur-2xl rounded-full p-2 md:p-3 shadow-2xl border border-white/10 w-full max-w-5xl mx-auto z-20">
      <div className="flex items-center gap-1">
        
        {/* City */}
        <div className="relative group flex-1 min-w-0">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="bg-transparent border-0 h-14 md:h-16 rounded-full text-white hover:bg-white/5 transition-all px-3 md:px-6 ring-0 focus:ring-0 focus:outline-none">
              <div className="flex flex-col items-start text-left">
                <span className="text-[8px] md:text-[10px] text-luxury-gold font-bold uppercase tracking-[0.1em] md:tracking-[0.15em] leading-none mb-1 opacity-80">Location</span>
                <div className="text-xs md:text-base font-medium truncate w-full">
                  <SelectValue placeholder="City" />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-white/10 text-white max-h-[300px] rounded-2xl">
              <SelectItem value="all">Everywhere</SelectItem>
              {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-white/5" />
        </div>

        {/* Type */}
        <div className="relative group flex-1 min-w-0">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="bg-transparent border-0 h-14 md:h-16 rounded-full text-white hover:bg-white/5 transition-all px-3 md:px-6 ring-0 focus:ring-0 focus:outline-none">
              <div className="flex flex-col items-start text-left">
                <span className="text-[8px] md:text-[10px] text-luxury-gold font-bold uppercase tracking-[0.1em] md:tracking-[0.15em] leading-none mb-1 opacity-80">Category</span>
                <div className="text-xs md:text-base font-medium truncate w-full">
                  <SelectValue placeholder="Type" />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-white/10 text-white rounded-2xl">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="house">Houses</SelectItem>
              <SelectItem value="villa">Villas</SelectItem>
              <SelectItem value="apartment">Apartments</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="vehicle">Vehicles</SelectItem>
            </SelectContent>
          </Select>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-white/5" />
        </div>

        {/* Listing Type / Buy/Rent */}
        <div className="relative group flex-1 min-w-0">
          <Select value={listingType} onValueChange={setListingType}>
            <SelectTrigger className="bg-transparent border-0 h-14 md:h-16 rounded-full text-white hover:bg-white/5 transition-all px-3 md:px-6 ring-0 focus:ring-0 focus:outline-none">
              <div className="flex flex-col items-start text-left">
                <span className="text-[8px] md:text-[10px] text-luxury-gold font-bold uppercase tracking-[0.1em] md:tracking-[0.15em] leading-none mb-1 opacity-80">Listing</span>
                <div className="text-xs md:text-base font-medium truncate w-full">
                  <SelectValue placeholder="Purpose" />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-white/10 text-white rounded-2xl">
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Search Button */}
        <div className="shrink-0 pl-1">
          <Button 
            onClick={handleSearch} 
            className="bg-luxury-gold text-black hover:bg-white h-12 md:h-16 w-12 md:w-16 rounded-full font-bold transition-all duration-300 flex items-center justify-center p-0 aspect-square group overflow-hidden shadow-xl shadow-luxury-gold/20"
          >
            <Search className="group-hover:scale-110 transition-transform" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}

