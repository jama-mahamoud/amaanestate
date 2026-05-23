import React, { useState } from 'react';
import { Search, MapPin, Building, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListingFilter } from '@/services/listingService';

const cities = [
  'Mogadishu', 'Hargeisa', 'Bosaso', 'Garowe', 'Kismayo', 'Baidoa', 'Burco', 'Laascaanood',
  'Beledweyne', 'Galkayo', 'Jowhar', 'Marka', 'Baraawe', 'Dhusamareb', 'Afgooye', 'Erigavo',
  'Berbera', 'Jigjiga', 'Dire Dawa', 'Other'
];

interface HomeSearchProps {
  onSearch: (filters: ListingFilter) => void;
}

export default function HomeSearch({ onSearch }: HomeSearchProps) {
  const [category, setCategory] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [listingType, setListingType] = useState<string>('');
  const [type, setType] = useState<string>('');

  const handleSearch = () => {
    let resolvedCategory: any = undefined;
    let resolvedSubcategory: string | undefined = type === 'all' ? undefined : type;

    if (type === 'vehicle') {
        resolvedCategory = 'vehicle';
        resolvedSubcategory = undefined;
    } else if (['house', 'land', 'commercial'].includes(type || '')) {
        resolvedCategory = 'property';
    }

    onSearch({
        category: resolvedCategory,
        city: city ? city : undefined,
        listingType: listingType ? (listingType as any) : undefined,
        subcategory: resolvedSubcategory,
    });
  };

  return (
    <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-[2rem] md:rounded-full p-4 md:p-3 shadow-2xl border border-white/10 w-full max-w-5xl mx-auto overflow-hidden">
      <div className="grid grid-cols-2 md:flex md:items-center gap-2 md:gap-1">
        
        {/* City */}
        <div className="relative group flex-1 min-w-0">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="bg-transparent border-0 h-12 md:h-14 rounded-2xl md:rounded-full text-white hover:bg-white/5 transition-all px-4 md:px-6 ring-0 focus:ring-0 focus:outline-none">
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest leading-none mb-1 opacity-70">Location</span>
                <SelectValue placeholder="Select City" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-white/10 text-white max-h-[300px] rounded-2xl">
              {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-white/10" />
        </div>

        {/* Type */}
        <div className="relative group flex-1 min-w-0">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="bg-transparent border-0 h-12 md:h-14 rounded-2xl md:rounded-full text-white hover:bg-white/5 transition-all px-4 md:px-6 ring-0 focus:ring-0 focus:outline-none">
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest leading-none mb-1 opacity-70">Property Type</span>
                <SelectValue placeholder="All Types" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-white/10 text-white rounded-2xl">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="house">Houses</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="rental">Rentals</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="vehicle">Vehicles</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-white/10" />
        </div>

        {/* Listing Type / Buy/Rent */}
        <div className="relative group flex-1 min-w-0">
          <Select value={listingType} onValueChange={setListingType}>
            <SelectTrigger className="bg-transparent border-0 h-12 md:h-14 rounded-2xl md:rounded-full text-white hover:bg-white/5 transition-all px-4 md:px-6 ring-0 focus:ring-0 focus:outline-none">
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest leading-none mb-1 opacity-70">Listing Type</span>
                <SelectValue placeholder="Buy / Rent" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-white/10 text-white rounded-2xl">
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Search Button */}
        <div className="col-span-2 md:w-auto md:pl-2">
          <Button 
            onClick={handleSearch} 
            className="bg-luxury-gold text-black hover:bg-white h-12 md:h-14 w-full md:w-14 rounded-xl md:rounded-full font-bold transition-all duration-300 flex items-center justify-center p-0 md:aspect-square group"
          >
            <Search className="group-hover:scale-110 transition-transform" size={20} />
            <span className="md:hidden ml-2 uppercase tracking-widest text-xs">Search Listings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

