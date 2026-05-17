import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { listingService } from '@/services/listingService';
import { ListingCategory, ListingType } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Info } from 'lucide-react';

interface ListingCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ListingCategory;
  onSuccess?: () => void;
}

export default function ListingCreationModal({ isOpen, onClose, category, onSuccess }: ListingCreationModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    city: '',
    listingType: 'sale' as ListingType,
    subcategory: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await listingService.createListing({
        category,
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        city: formData.city,
        listingType: formData.listingType,
        subcategory: formData.subcategory,
        ownerId: user.uid,
        images: [], // Images handled in Phase D
        metadata: {},
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-luxury-black border-white/5 text-white max-w-2xl rounded-[2.5rem] p-10">
        <DialogHeader>
          <DialogTitle className="text-3xl font-display font-bold">Initialize <span className="gold-text-gradient">Asset Log</span></DialogTitle>
          <DialogDescription className="text-white/40 text-sm mt-2">
            Submit your asset for regional verification. All initial listings are held in review for up to 48 hours.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/20 ml-1">Asset Designation</label>
              <Input 
                required
                placeholder="e.g. Modern Villa in Jigjiga"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="bg-white/5 border-0 h-14 rounded-xl focus-visible:ring-luxury-gold/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/20 ml-1">Sub-Category</label>
              <Input 
                required
                placeholder={category === 'property' ? 'e.g. Villa, Apartment' : 'e.g. SUV, Luxury'}
                value={formData.subcategory}
                onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                className="bg-white/5 border-0 h-14 rounded-xl focus-visible:ring-luxury-gold/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/20 ml-1">Market Valuation ($)</label>
              <Input 
                required
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="bg-white/5 border-0 h-14 rounded-xl focus-visible:ring-luxury-gold/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/20 ml-1">Primary Region</label>
              <Input 
                required
                placeholder="e.g. Jigjiga"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="bg-white/5 border-0 h-14 rounded-xl focus-visible:ring-luxury-gold/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/20 ml-1">Listing Type</label>
            <Select 
              value={formData.listingType} 
              onValueChange={(val: ListingType) => setFormData({ ...formData, listingType: val })}
            >
              <SelectTrigger className="bg-white/5 border-0 h-14 rounded-xl focus:ring-luxury-gold/30">
                <SelectValue placeholder="Select intent" />
              </SelectTrigger>
              <SelectContent className="bg-luxury-black border-white/5 text-white">
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/20 ml-1">Strategic Narrative</label>
            <Textarea 
              required
              placeholder="Describe the asset's unique value propositions..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="bg-white/5 border-0 min-h-[120px] rounded-xl focus-visible:ring-luxury-gold/30 resize-none py-4"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs">
              <Info size={16} /> {error}
            </div>
          )}

          <DialogFooter className="pt-6">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="text-white/40 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-luxury-gold text-luxury-black hover:bg-white px-10 h-14 rounded-xl font-bold transition-all shadow-xl shadow-luxury-gold/10"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Plus className="mr-2" size={18} />}
              Initialize Listing
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
