
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { Upload, ChevronRight, Loader2 } from 'lucide-react';
import { listingService } from '@/services/listingService';
import GalleryUpload from '@/components/article/GalleryUpload';

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
    images: [] as string[]
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
            location: formData.city,
            subcategory: formData.subcategory,
            listingType: formData.listingType === 'sale' ? 'sale' : 'rent',
            category: 'property',
            images: formData.images,
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
                    <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-lg">
                        <option value="Jigjiga">Jigjiga</option>
                        <option value="Dire Dawa">Dire Dawa</option>
                        <option value="Addis Ababa">Addis Ababa</option>
                    </select>
                </div>
                <div className="space-y-2">
                     <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Listing Type</label>
                    <select value={formData.listingType} onChange={e => setFormData({...formData, listingType: e.target.value as 'sale' | 'rent'})} className="w-full bg-white/5 border border-white/10 p-3 rounded-lg">
                        <option value="sale">Sale</option>
                        <option value="rent">Rent</option>
                    </select>
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
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
