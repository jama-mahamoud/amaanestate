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
  AlertCircle,
  Star,
  EyeOff,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Listing } from '@/types';
import { moderationService } from '@/services/moderationService';
import { toast } from 'sonner';

type ModerationStatus = 'pending' | 'active' | 'rejected' | 'suspended';

export default function ListingModeratedList() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ModerationStatus>('pending');
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    loadListings();
  }, [statusFilter]);

  const loadListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await moderationService.getPendingListings(undefined, statusFilter as any);
      setListings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to sync with asset network');
      toast.error('Synchronization failure detected');
    } finally {
      setLoading(false);
    }
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

  const handleToggleFeature = async (id: string, isFeatured: boolean) => {
    setActioningId(id);
    const success = await moderationService.toggleFeatureListing(id, !isFeatured);
    if (success) {
      toast.success(isFeatured ? 'Feature status removed' : 'Listing marked as featured');
      setListings(prev => prev.map(l => l.id === id ? { ...l, isFeatured: !isFeatured } : l));
    } else {
      toast.error('Failed to update feature status');
    }
    setActioningId(null);
  };

  const handleSuspend = async (id: string) => {
    if (!window.confirm('Are you sure you want to suspend this listing? it will be hidden from public.')) return;
    setActioningId(id);
    const success = await moderationService.suspendItem('listings', id);
    if (success) {
      toast.success('Listing suspended');
      setListings(prev => prev.filter(l => l.id !== id));
    } else {
      toast.error('Failed to suspend listing');
    }
    setActioningId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('CRITICAL: Delete this listing permanently? This cannot be undone.')) return;
    setActioningId(id);
    const success = await moderationService.deleteDocument('listings', id);
    if (success) {
      toast.success('Listing expunged from database');
      setListings(prev => prev.filter(l => l.id !== id));
    } else {
      toast.error('Failed to delete listing');
    }
    setActioningId(null);
  };

  if (loading && listings.length === 0) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-8 rounded-[2.5rem] border border-white/5 animate-pulse flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-48 aspect-square rounded-3xl bg-white/5 shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-white/5 rounded-xl w-1/3" />
              <div className="h-4 bg-white/5 rounded-lg w-1/4" />
              <div className="h-20 bg-white/5 rounded-2xl w-full" />
            </div>
          </div>
        ))}
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-luxury-gold mb-4" size={32} />
          <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">Querying Asset Network...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 glass-card rounded-[3rem] border border-red-500/10">
        <AlertCircle className="text-red-500 mb-6" size={48} />
        <h3 className="text-2xl font-display font-bold">Network Breach</h3>
        <p className="text-white/40 text-xs mt-2 uppercase tracking-widest">{error}</p>
        <Button 
          onClick={loadListings}
          className="mt-8 bg-white/5 border border-white/10 hover:border-luxury-gold text-[10px] uppercase font-black tracking-widest"
        >
          Re-establish Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Status Bar */}
      <div className="flex flex-wrap gap-2">
        {(['pending', 'active', 'rejected', 'suspended'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${
              statusFilter === s 
              ? 'bg-luxury-gold text-black border-luxury-gold' 
              : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
            } border`}
          >
            {s}
          </button>
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 glass-card rounded-[3rem] border-dashed border-white/5">
          <CheckCircle2 className="text-white/10 mb-6" size={48} />
          <h3 className="text-2xl font-display font-bold">Queue Empty</h3>
          <p className="text-white/20 text-xs mt-2 uppercase tracking-widest">No listings found for this status protocol</p>
        </div>
      ) : (
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
                {listing.isFeatured && (
                  <div className="absolute top-2 right-2 p-1.5 bg-luxury-gold rounded-lg text-black">
                    <Star size={12} fill="currentColor" />
                  </div>
                )}
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
                   <button 
                    onClick={() => handleToggleFeature(listing.id, !!listing.isFeatured)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[8px] font-black uppercase tracking-widest ${
                      listing.isFeatured 
                      ? 'bg-luxury-gold/20 border-luxury-gold text-luxury-gold' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                    }`}
                   >
                      <Star size={10} fill={listing.isFeatured ? 'currentColor' : 'none'} /> {listing.isFeatured ? 'Featured Asset' : 'Mark Featured'}
                   </button>
                   <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[8px] uppercase font-black text-white/30 tracking-widest">
                      ID: {listing.id.substring(0, 8)}
                   </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-48 shrink-0">
                 {statusFilter === 'pending' && (
                   <>
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
                   </>
                 )}
                 
                 {statusFilter !== 'pending' && (
                   <Button 
                      onClick={() => handleApprove(listing.id)} // Re-approve / Reset to active
                      disabled={actioningId === listing.id || listing.status === 'active'}
                      className="flex-1 bg-white/5 text-white/60 hover:bg-luxury-gold hover:text-black h-12 rounded-xl font-bold text-[9px] uppercase tracking-widest"
                   >
                      Set Active
                   </Button>
                 )}

                 <div className="flex gap-2">
                    <Button 
                        onClick={() => handleSuspend(listing.id)}
                        disabled={actioningId === listing.id || listing.status === 'suspended'}
                        variant="ghost"
                        className="flex-1 text-white/20 hover:text-orange-500 bg-white/5 h-12 rounded-xl"
                        title="Suspend"
                    >
                        <EyeOff size={16} />
                    </Button>
                    <Button 
                        onClick={() => handleDelete(listing.id)}
                        disabled={actioningId === listing.id}
                        variant="ghost"
                        className="flex-1 text-white/20 hover:text-red-500 bg-white/5 h-12 rounded-xl"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </Button>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
