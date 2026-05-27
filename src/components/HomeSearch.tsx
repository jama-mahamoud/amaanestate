import React, { useState } from 'react';
import { Search, MapPin, Building, Sparkles, Home, Key, BadgePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListingFilter } from '@/services/listingService';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="bg-luxury-charcoal rounded-3xl p-3 md:p-3 shadow-2xl border border-white/10 w-full max-w-5xl mx-auto z-20">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-1">
        
        {/* City */}
        <div className="relative group flex-1 min-w-0">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="bg-transparent border-0 h-14 md:h-16 rounded-2xl text-white hover:bg-white/5 transition-all px-3 md:px-6 ring-0 focus:ring-0 focus:outline-none">
              <div className="flex flex-col items-start text-left">
                <span className="text-[8px] md:text-[9px] text-white/40 font-bold uppercase tracking-wider mb-1 leading-none">Location</span>
                <div className="text-xs md:text-sm font-semibold truncate w-full text-white">
                  <SelectValue placeholder="City" />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-luxury-charcoal border-white/10 text-white max-h-[300px] rounded-2xl z-[9999]">
              <SelectItem value="all">Everywhere</SelectItem>
              {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-white/10" />
        </div>

        {/* Type */}
        <div className="relative group flex-1 min-w-0">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="bg-transparent border-0 h-14 md:h-16 rounded-2xl text-white hover:bg-white/5 transition-all px-3 md:px-6 ring-0 focus:ring-0 focus:outline-none">
              <div className="flex flex-col items-start text-left">
                <span className="text-[8px] md:text-[9px] text-white/40 font-bold uppercase tracking-wider mb-1 leading-none">Category</span>
                <div className="text-xs md:text-sm font-semibold truncate w-full text-white">
                  <SelectValue placeholder="Type" />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-luxury-charcoal border-white/10 text-white rounded-2xl z-[9999]">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="house">Houses</SelectItem>
              <SelectItem value="villa">Villas</SelectItem>
              <SelectItem value="apartment">Apartments</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="vehicle">Vehicles</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-white/10" />
        </div>

        {/* Listing Type / Buy/Rent */}
        <div className="relative group flex-1 min-w-0">
          <Select value={listingType} onValueChange={setListingType}>
            <SelectTrigger className="bg-transparent border-0 h-14 md:h-16 rounded-2xl text-white hover:bg-white/5 transition-all px-3 md:px-6 ring-0 focus:ring-0 focus:outline-none">
              <div className="flex flex-col items-start text-left">
                <span className="text-[8px] md:text-[9px] text-white/40 font-bold uppercase tracking-wider mb-1 leading-none">Purpose</span>
                <div className="text-xs md:text-sm font-semibold truncate w-full text-white">
                  <SelectValue placeholder="Listing" />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-luxury-charcoal border-white/10 text-white rounded-2xl z-[9999]">
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Search Button */}
        <div className="w-full md:w-auto shrink-0 md:pl-1 mt-2 md:mt-0">
          <Button 
            onClick={handleSearch} 
            className="bg-[#C5A059] text-black hover:bg-white h-14 md:h-16 w-full md:w-16 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 aspect-auto md:aspect-square group shadow-xl shadow-[#C5A059]/10"
          >
            <Search className="group-hover:scale-110 transition-transform text-black" size={20} />
            <span className="md:hidden font-display tracking-wider text-sm">Search Listings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

