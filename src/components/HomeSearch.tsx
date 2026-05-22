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
  const [status, setStatus] = useState<string>('');
  const [type, setType] = useState<string>('');

  const handleSearch = () => {
    onSearch({
        category: category ? (category as any) : undefined,
        city: city ? city : undefined,
        status: status ? (status as any) : undefined,
        subcategory: type ? type : undefined,
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl border border-white/10 w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
        
        {/* Category */}
        <div className="space-y-2">
            <label className="text-white/50 text-xs font-bold uppercase tracking-widest ml-1">Category</label>
            <Select value={category} onValueChange={(v) => { setCategory(v); setType(''); }}>
                <SelectTrigger className="bg-white/5 border-0 h-12 rounded-xl text-white">
                    <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-luxury-black border-white/10 text-white">
                    <SelectItem value="property">Properties</SelectItem>
                    <SelectItem value="vehicle">Vehicles</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {/* City */}
        <div className="space-y-2">
            <label className="text-white/50 text-xs font-bold uppercase tracking-widest ml-1">City</label>
            <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="bg-white/5 border-0 h-12 rounded-xl text-white">
                    <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent className="bg-luxury-black border-white/10 text-white max-h-[300px]">
                    {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>

        {/* Type */}
        <div className="space-y-2">
            <label className="text-white/50 text-xs font-bold uppercase tracking-widest ml-1">Type</label>
            <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-white/5 border-0 h-12 rounded-xl text-white">
                    <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="bg-luxury-black border-white/10 text-white">
                    {category !== 'vehicle' && ['House', 'Villa', 'Apartment', 'Land', 'Commercial', 'Office', 'Warehouse'].map(t => <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>)}
                {category !== 'property' && ['Car', 'Truck', 'Motorcycle'].map(t => <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
            <label className="text-white/50 text-xs font-bold uppercase tracking-widest ml-1">Status</label>
            <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-white/5 border-0 h-12 rounded-xl text-white">
                    <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-luxury-black border-white/10 text-white">
                    <SelectItem value="active">For Sale</SelectItem>
                    <SelectItem value="rented">For Rent</SelectItem>
                </SelectContent>
            </Select>
        </div>
        
        {/* Search Button */}
        <Button onClick={handleSearch} className="bg-[#C5A059] text-black hover:bg-white h-12 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 w-full">
            <Search size={18} /> Search
        </Button>
      </div>
    </div>
  );
}

