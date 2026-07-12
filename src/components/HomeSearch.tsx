import React, { useState } from 'react';
import { Search, MapPin, Building, Sparkles, Home, Key, BadgePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

const cities = [
  'Mogadishu', 'Hargeisa', 'Bosaso', 'Garowe', 'Kismayo', 'Baidoa', 'Burco', 'Laascaanood',
  'Beledweyne', 'Galkayo', 'Jowhar', 'Marka', 'Baraawe', 'Dhusamareb', 'Afgooye', 'Erigavo',
  'Berbera', 'Jigjiga', 'Dire Dawa', 'Addis Ababa', 'Other'
];

interface HomeSearchProps {
  onSearch: (filters: { category?: string; city?: string; listingType?: string; subcategory?: string }) => void;
}

type TabType = 'sale' | 'rent' | 'sell';

export default function HomeSearch({ onSearch }: HomeSearchProps) {
  const [city, setCity] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [listingType, setListingType] = useState<string>('');
  const [cityRequiredError, setCityRequiredError] = useState(false);

  const handleSearch = () => {
    if (!city || city === 'all') {
      setCityRequiredError(true);
      return;
    }
    setCityRequiredError(false);

    let resolvedCategory: any = undefined;
    let resolvedSubcategory: string | undefined = type === 'all' ? undefined : type;

    if (type === 'vehicle') {
        resolvedCategory = 'vehicle';
        resolvedSubcategory = undefined;
    } else if (type === 'land') {
        resolvedCategory = 'land';
        resolvedSubcategory = 'land';
    } else if (['house', 'villa', 'apartment', 'commercial'].includes(type || '')) {
        resolvedCategory = 'property';
    }

    onSearch({
        category: resolvedCategory,
        city: city,
        listingType: listingType ? (listingType as any) : undefined,
        subcategory: resolvedSubcategory,
    });
  };

  return (
    <div className="bg-luxury-charcoal rounded-3xl p-2 md:p-3 shadow-2xl border border-white/10 w-full max-w-5xl mx-auto z-20">
      <div className="flex flex-row items-center gap-1 md:gap-2">
        
        {/* City */}
        <div className="relative group flex-1 min-w-0">
          <Select value={city} onValueChange={(val) => {
            setCity(val);
            setCityRequiredError(false);
          }}>
            <SelectTrigger className={`bg-transparent border transition-all h-14 md:h-16 rounded-2xl text-white hover:bg-white/5 px-2 md:px-6 ring-0 focus:ring-0 focus:outline-none [&>svg]:hidden md:[&>svg]:block ${
              cityRequiredError ? 'border-red-500 bg-red-500/5 animate-pulse' : 'border-transparent'
            }`}>
              <div className="flex flex-col items-start text-left w-full overflow-hidden">
                <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-wider mb-1 leading-none truncate w-full ${
                  cityRequiredError ? 'text-red-400' : 'text-white/40'
                }`}>
                  {cityRequiredError ? 'Selection (Required)' : 'Editorial Hub'}
                </span>
                <div className={`text-[11px] md:text-sm font-semibold truncate w-full ${
                  cityRequiredError ? 'text-red-400' : 'text-white'
                }`}>
                  <SelectValue placeholder={cityRequiredError ? "Choose Hub!" : "Select Market Hub"} />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-luxury-charcoal border-white/10 text-white max-h-[300px] rounded-2xl z-[9999]">
              {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 md:h-8 w-[1px] bg-white/10" />
        </div>

        {/* Type */}
        <div className="relative group flex-1 min-w-0">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="bg-transparent border-0 h-14 md:h-16 rounded-2xl text-white hover:bg-white/5 transition-all px-2 md:px-6 ring-0 focus:ring-0 focus:outline-none [&>svg]:hidden md:[&>svg]:block">
              <div className="flex flex-col items-start text-left w-full overflow-hidden">
                <span className="text-[8px] md:text-[9px] text-white/40 font-bold uppercase tracking-wider mb-1 leading-none truncate w-full">Category</span>
                <div className="text-[11px] md:text-sm font-semibold truncate w-full text-white">
                  <SelectValue placeholder="Type" />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-luxury-charcoal border-white/10 text-white rounded-2xl z-[9999]">
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="house">Business Tools</SelectItem>
              <SelectItem value="villa">Cloud AI</SelectItem>
              <SelectItem value="apartment">Creative Tech</SelectItem>
              <SelectItem value="land">DevOps</SelectItem>
              <SelectItem value="commercial">Enterprise</SelectItem>
              <SelectItem value="vehicle">Gear & Gadgets</SelectItem>
            </SelectContent>
          </Select>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 md:h-8 w-[1px] bg-white/10" />
        </div>

        {/* Listing Type / Buy/Rent */}
        <div className="relative group flex-1 min-w-0">
          <Select value={listingType} onValueChange={setListingType}>
            <SelectTrigger className="bg-transparent border-0 h-14 md:h-16 rounded-2xl text-white hover:bg-white/5 transition-all px-2 md:px-6 ring-0 focus:ring-0 focus:outline-none [&>svg]:hidden md:[&>svg]:block">
              <div className="flex flex-col items-start text-left w-full overflow-hidden">
                <span className="text-[8px] md:text-[9px] text-white/40 font-bold uppercase tracking-wider mb-1 leading-none truncate w-full">Business Model</span>
                <div className="text-[11px] md:text-sm font-semibold truncate w-full text-white">
                  <SelectValue placeholder="Model" />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-luxury-charcoal border-white/10 text-white rounded-2xl z-[9999]">
              <SelectItem value="sale">Lifetime Deal</SelectItem>
              <SelectItem value="rent">Subscription</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Search Button */}
        <div className="w-auto shrink-0 md:pl-1">
          <Button 
            onClick={handleSearch} 
            className="bg-[#C5A059] text-black hover:bg-white h-12 w-12 md:h-16 md:w-16 rounded-2xl md:rounded-3xl font-bold transition-all duration-300 flex items-center justify-center p-0 aspect-square group shadow-xl shadow-[#C5A059]/10"
            title="Search Insights"
          >
            <Search className="group-hover:scale-110 transition-transform text-black w-5 h-5 md:w-6 md:h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}

