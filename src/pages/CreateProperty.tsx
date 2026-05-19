
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { Upload, ChevronRight, Loader2, MapPin } from 'lucide-react';
import { listingService } from '@/services/listingService';
import GalleryUpload from '@/components/article/GalleryUpload';
import MapPicker from '@/components/location/MapPicker';

export default function CreateProperty() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    city: 'Jigjiga',
    subcategory: '',
    listingType: 'sale' as 'sale' | 'rent',
    size: '',
    beds: 0,
    baths: 0,
    images: [] as string[],
    district: '',
    landmark: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await listingService.createListing({
            title: formData.title,
            description: formData.description,
            price: Number(formData.price),
            currency: 'USD',
            city: formData.city,
            location: formData.district ? `${formData.district}, ${formData.city}` : formData.city,
            subcategory: formData.subcategory,
            listingType: formData.listingType === 'sale' ? 'sale' : 'rent',
            category: 'property',
            images: formData.images,
            district: formData.district,
            landmark: formData.landmark,
            latitude: formData.latitude,
            longitude: formData.longitude,
            region: formData.city,
            features: {
                size: formData.size,
                beds: formData.beds,
                baths: formData.baths
            }
        });
        navigate('/properties');
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">List Your Property</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Asset Designation</label>
                <Input placeholder="e.g. Modern Villa in Jigjiga" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-white/5 border-white/10" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Sub-Category</label>
                    <Input placeholder="e.g. Villa" value={formData.subcategory} onChange={e => setFormData({...formData, subcategory: e.target.value})} className="bg-white/5 border-white/10" required />
                </div>
                <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Market Valuation ($)</label>
                    <Input type="number" placeholder="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-white/5 border-white/10" required />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Primary Region</label>
                    <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white">
                        <option value="Jigjiga" className="bg-neutral-900 text-white">Jigjiga</option>
                        <option value="Dire Dawa" className="bg-neutral-900 text-white">Dire Dawa</option>
                        <option value="Addis Ababa" className="bg-neutral-900 text-white">Addis Ababa</option>
                        <option value="Godey" className="bg-neutral-900 text-white">Godey</option>
                    </select>
                </div>
                <div className="space-y-2">
                     <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Listing Type</label>
                    <select value={formData.listingType} onChange={e => setFormData({...formData, listingType: e.target.value as 'sale' | 'rent'})} className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white">
                        <option value="sale" className="bg-neutral-900 text-white">Sale</option>
                        <option value="rent" className="bg-neutral-900 text-white">Rent</option>
                    </select>
                </div>
            </div>

            {/* LOCATION INTELLIGENCE SECTION */}
            <div className="space-y-4 border-t border-white/5 pt-6">
              <h3 className="text-luxury-gold text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                <span>Location Intelligence</span>
                <span className="h-px flex-1 bg-white/5" />
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">District / Xaafad</label>
                  <Input 
                    placeholder="e.g. Hodan / Central" 
                    value={formData.district} 
                    onChange={e => setFormData({...formData, district: e.target.value})} 
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Street / Landmark</label>
                  <Input 
                    placeholder="e.g. Near Shabelle River view" 
                    value={formData.landmark} 
                    onChange={e => setFormData({...formData, landmark: e.target.value})} 
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
              </div>

              {/* Interactive Live Map Picker */}
              <div className="space-y-2">
                <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] block mb-1">
                  Pinpoint Asset Coordinates
                </label>
                <MapPicker 
                  city={formData.city} 
                  latitude={formData.latitude} 
                  longitude={formData.longitude} 
                  onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]">Latitude (Coordinate)</label>
                  <Input 
                    type="number" 
                    value={formData.latitude ?? ''} 
                    readOnly 
                    className="bg-white/5 border-white/10 text-white/40 select-all cursor-not-allowed h-10 text-xs font-mono"
                    placeholder="Auto-generated"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]">Longitude (Coordinate)</label>
                  <Input 
                    type="number" 
                    value={formData.longitude ?? ''} 
                    readOnly 
                    className="bg-white/5 border-white/10 text-white/40 select-all cursor-not-allowed h-10 text-xs font-mono"
                    placeholder="Auto-generated"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Asset Size</label>
                    <Input placeholder="e.g. 200sqm" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Bedrooms</label>
                    <Input type="number" placeholder="0" value={formData.beds} onChange={e => setFormData({...formData, beds: Number(e.target.value)})} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Bathrooms</label>
                    <Input type="number" placeholder="0" value={formData.baths} onChange={e => setFormData({...formData, baths: Number(e.target.value)})} className="bg-white/5 border-white/10" />
                </div>
            </div>

            <GalleryUpload value={formData.images} onChange={(urls) => setFormData({...formData, images: urls})} />
            
            <div className="space-y-2">
                <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Strategic Narrative</label>
                <Textarea placeholder="Describe the asset's unique value propositions..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-white/5 border-white/10" required />
            </div>

            <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 bg-luxury-gold text-black hover:bg-white" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : 'List Property'}
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
