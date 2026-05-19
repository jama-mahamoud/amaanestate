import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Car, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Loader2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Listing } from '@/types';
import { moderationService } from '@/services/moderationService';
import { toast } from 'sonner';

export default function ListingModeratedList() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    loadPendingListings();
  }, []);

  const loadPendingListings = async () => {
    setLoading(true);
    const data = await moderationService.getPendingListings();
    setListings(data);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    setActioningId(id);
    const success = await moderationService.approveListing(id);
    if (success) {
      toast.success('Listing approved and published');
      setListings(prev => prev.filter(l => l.id !== id));
    } else {
      toast.error('Failed to approve listing');
    }
    setActioningId(null);
  };

  const handleReject = async (id: string) => {
    setActioningId(id);
    const success = await moderationService.rejectListing(id);
    if (success) {
      toast.success('Listing rejected');
      setListings(prev => prev.filter(l => l.id !== id));
    } else {
      toast.error('Failed to reject listing');
    }
    setActioningId(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-luxury-gold mb-4" size={32} />
        <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">Querying Asset Network...</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 glass-card rounded-[3rem] border-dashed border-white/5">
        <CheckCircle2 className="text-white/10 mb-6" size={48} />
        <h3 className="text-2xl font-display font-bold">Queue Empty</h3>
        <p className="text-white/20 text-xs mt-2 uppercase tracking-widest">All listings have been processed by the protocol</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {listings.map((listing) => (
        <motion.div
          key={listing.id}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card hover:bg-white/[0.03] transition-all p-8 rounded-[2.5rem] border border-white/5 flex flex-col lg:flex-row items-center gap-10"
        >
          {/* Thumbnail */}
          <div className="w-full lg:w-48 aspect-square rounded-3xl overflow-hidden relative border border-white/10 shrink-0">
            <img 
              src={listing.images[0] || '/placeholder-image.jpg'} 
              alt={listing.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-widest text-white/60">
              {listing.category}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                  <h4 className="text-2xl font-display font-bold tracking-tight">{listing.title}</h4>
                  <div className="flex items-center gap-4 mt-1">
                     <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-black uppercase tracking-widest">
                        <MapPin size={12} className="text-luxury-gold" /> {listing.city}
                     </div>
                     <div className="w-1 h-1 rounded-full bg-white/10" />
                     <div className="text-luxury-gold text-sm font-display font-bold tabular-nums">
                        {listing.currency} {listing.price.toLocaleString()}
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <a href={`/properties/${listing.id}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="h-10 rounded-xl bg-white/5 border border-white/5 hover:border-luxury-gold hover:text-luxury-gold text-[10px] uppercase font-black tracking-widest">
                       <ExternalLink size={14} className="mr-2" /> Inspect
                    </Button>
                  </a>
               </div>
            </div>

            <p className="text-white/40 text-sm line-clamp-2 italic leading-relaxed">
              {listing.description}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {Object.entries(listing.features || {}).slice(0, 4).map(([key, value]) => (
                <div key={key} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] uppercase font-bold text-white/30 tracking-widest">
                   {key}: {String(value)}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-48 shrink-0">
             <Button 
                onClick={() => handleApprove(listing.id)}
                disabled={actioningId === listing.id}
                className="flex-1 bg-luxury-gold text-black hover:bg-white h-14 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-luxury-gold/10"
             >
                {actioningId === listing.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} className="mr-2" />} Approve
             </Button>
             <Button 
                onClick={() => handleReject(listing.id)}
                disabled={actioningId === listing.id}
                variant="destructive"
                className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white h-14 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all"
             >
                <XCircle size={16} className="mr-2" /> Reject
             </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
