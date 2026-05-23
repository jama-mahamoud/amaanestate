import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  MapPin, Gauge, Fuel, Calendar, Share2, 
  Heart, ArrowLeft, Phone, Mail, MessageSquare, 
  Info, Settings2, Shield, Loader2, ShieldCheck, Sparkles, Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useListing } from '@/hooks/useListing';
import { VehicleListing } from '@/types';
import NotFoundState from '@/components/NotFoundState';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { listingService } from '@/services/listingService';
import ListingCreationModal from '@/components/listing/ListingCreationModal';
import { toast } from 'sonner';

export default function VehicleDetails() {
  const { id } = useParams();
  const { listing, loading, error, refresh } = useListing(id);
  const vehicle = listing as VehicleListing | null;

  const { user, profile } = useAuth();
  const isAdmin = profile?.role?.toString().toLowerCase().trim() === 'admin';
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleToggleFeature = async () => {
    if (!vehicle) return;
    try {
      const success = await listingService.updateListing(vehicle.id, { isFeatured: !vehicle.isFeatured }, true);
      if (success) {
        toast.success(vehicle.isFeatured ? 'Feature status removed' : 'Listing marked as featured');
        refresh();
      } else {
        toast.error('Failed to update feature status');
      }
    } catch (err) {
      toast.error('Failed to update feature status');
    }
  };

  const handleStatusChange = async (newStatus: any) => {
    if (!vehicle) return;
    try {
      const success = await listingService.updateListing(vehicle.id, { status: newStatus }, true);
      if (success) {
        toast.success(`Status updated to ${newStatus}`);
        refresh();
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black flex flex-col items-center justify-center">
        <Loader2 className="w-16 h-16 text-luxury-gold animate-spin mb-6" />
        <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.4em]">Calibrating Technical Specs...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-luxury-black">
        <NotFoundState 
          title="Vehicle Not Found" 
          description={error || "The requested mobility unit could not be retrieved from the central catalog. It may have been sold or is undergoing inventory maintenance."}
          backLink="/vehicles"
          backLabel="BACK TO CATALOG"
        />
      </div>
    );
  }

  const images = vehicle.images?.length ? vehicle.images : [
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070&auto=format&fit=crop'
  ];

  const displayPrice = typeof vehicle.price === 'number' 
    ? formatPrice(vehicle.price, vehicle.currency) 
    : vehicle.price;

  return (
    <div className="min-h-screen bg-luxury-black pb-20">
      {/* Media Section */}
      <div className="relative pt-20">
        {isAdmin && vehicle && (
          <div className="container mx-auto px-4 mb-8">
            <div className="bg-[#C5A059]/10 border border-[#C5A059]/30 p-5 rounded-[2rem] flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/10 flex items-center justify-center text-luxury-gold shrink-0">
                   <ShieldCheck size={24} className="animate-pulse" />
                </div>
                <div>
                   <p className="text-[11px] font-black uppercase tracking-[0.2em] text-luxury-gold leading-none">Administrative Panel Override</p>
                   <p className="text-[9px] text-white/30 uppercase tracking-widest mt-1.5 font-bold">Unrestricted write access & registry controls</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Feature Toggle */}
                <button 
                  onClick={handleToggleFeature}
                  className={`flex items-center gap-2 px-5 h-11 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    vehicle.isFeatured 
                      ? 'bg-luxury-gold/20 border-luxury-gold text-luxury-gold' 
                      : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/25'
                  }`}
                >
                  <Sparkles size={12} fill={vehicle.isFeatured ? 'currentColor' : 'none'} /> 
                  <span>{vehicle.isFeatured ? 'Featured Asset' : 'Mark Featured'}</span>
                </button>

                {/* Status Switcher */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-4 h-11 text-[9px] uppercase font-black tracking-widest text-white/40">
                  <span className="font-bold">STATUS:</span>
                  <select
                    value={vehicle.status || 'pending'}
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                    className="bg-transparent border-0 text-white focus:outline-none cursor-pointer text-[9px] uppercase font-black tracking-widest"
                  >
                    <option value="pending" className="bg-luxury-black">PENDING</option>
                    <option value="active" className="bg-luxury-black">ACTIVE</option>
                    <option value="sold" className="bg-luxury-black">SOLD</option>
                    <option value="rented" className="bg-luxury-black">RENTED</option>
                    <option value="rejected" className="bg-luxury-black">REJECTED</option>
                    <option value="suspended" className="bg-luxury-black">SUSPENDED</option>
                  </select>
                </div>

                {/* Edit Button */}
                <Button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="h-11 rounded-xl bg-luxury-gold hover:bg-white text-black font-black text-[9px] uppercase tracking-widest gap-2 px-6 shadow-lg shadow-luxury-gold/10"
                >
                  <Edit3 size={12} /> Rewrite Listing
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 mb-4 flex justify-between items-center text-white/40 text-xs">
          <Link to="/vehicles" className="flex items-center gap-2 hover:text-luxury-gold transition-colors">
            <ArrowLeft size={14} /> BACK TO CATALOG
          </Link>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 hover:text-white transition-colors">
              <Share2 size={14} /> SHARE
            </button>
            <button className="flex items-center gap-2 hover:text-white transition-colors">
              <Heart size={14} /> SAVE
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 h-auto md:min-h-[500px] aspect-[16/9] md:aspect-auto rounded-[3rem] overflow-hidden group relative bg-white/5">
          <img 
            src={images[0]} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
            alt={vehicle.title} 
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-60"></div>
          
          <div className="absolute bottom-10 left-10 right-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-luxury-gold text-luxury-black border-0 uppercase text-[10px] tracking-widest font-bold px-3 py-1">
                  For {vehicle.listingType}
                </Badge>
                <Badge className="bg-white/20 backdrop-blur-md text-white border-0 uppercase text-[10px] tracking-widest font-bold px-3 py-1">
                  {vehicle.subcategory || vehicle.category}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
                {vehicle.title}
              </h1>
            </div>
            <div className="bg-luxury-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Elite Valuation</p>
                <p className="text-3xl font-display font-bold text-luxury-gold">{displayPrice}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-16">
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-y border-white/5">
              {[
                { icon: <Calendar size={26} />, label: 'Year', value: vehicle.year || '-' },
                { icon: <Gauge size={26} />, label: 'Mileage', value: vehicle.mileage || '-' },
                { icon: <Fuel size={26} />, label: 'Fuel', value: vehicle.fuelType || '-' },
                { icon: <Settings2 size={26} />, label: 'Transmission', value: vehicle.transmission || '-' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className="text-luxury-gold/40 group-hover:text-luxury-gold transition-colors mb-4">{item.icon}</div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-1 font-bold">{item.label}</p>
                  <p className="text-white font-bold text-xl tracking-tight">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="max-w-3xl">
              <h3 className="text-white text-[10px] uppercase font-bold tracking-[0.4em] mb-10 flex items-center">
                Technical Narrative <div className="h-px flex-1 bg-white/5 ml-8"></div>
              </h3>
              <p className="text-white/60 text-xl leading-[1.8] font-light italic">
                {vehicle.description}
              </p>
            </div>

            {(vehicle.features && vehicle.features.length > 0) && (
              <div>
                <h3 className="text-white text-[10px] uppercase font-bold tracking-[0.4em] mb-10 flex items-center">
                  Masterpiece Features <div className="h-px flex-1 bg-white/5 ml-8"></div>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  {vehicle.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-luxury-gold/30 transition-all">
                         <Shield size={18} className="text-luxury-gold opacity-40 group-hover:opacity-100" />
                      </div>
                      <span className="text-white/40 group-hover:text-white/70 transition-colors font-medium tracking-tight">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-12 border-t border-white/10 flex items-center gap-8">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-luxury-gold font-bold">AC</div>
                  <div>
                    <p className="text-white font-bold">Amaan Concierge</p>
                    <p className="text-luxury-gold text-xs font-bold tracking-widest uppercase">Verified Broker</p>
                  </div>
               </div>
               <div className="flex-1 h-px bg-white/5"></div>
               <div className="flex gap-4">
                  <Button variant="outline" className="border-white/10 text-white rounded-xl h-12 w-12 p-0 hover:bg-white/5"><Phone size={18} /></Button>
                  <Button variant="outline" className="border-white/10 text-white rounded-xl h-12 w-12 p-0 hover:bg-white/5"><Mail size={18} /></Button>
               </div>
            </div>
          </div>

          {/* Sidebar / Inquiry */}
          <div className="lg:col-span-4">
            <div className="bg-luxury-charcoal/60 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl sticky top-32">
               <h3 className="text-2xl font-display font-bold text-white mb-8">Inquire Priority</h3>
               <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Full Name</label>
                    <Input placeholder="Your Name" className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Inquiry Type</label>
                    <select className="flex h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none appearance-none">
                      <option className="bg-luxury-black">Purchase Inquiry</option>
                      <option className="bg-luxury-black">Rental Request</option>
                      <option className="bg-luxury-black">Technical Specs</option>
                    </select>
                  </div>
                  <Button className="w-full bg-luxury-gold text-luxury-black hover:bg-white transition-all h-16 rounded-2xl font-bold text-lg">
                    <MessageSquare size={20} className="mr-2" /> Request Callback
                  </Button>
               </form>
               <div className="mt-8 flex items-center justify-center gap-2 text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold">
                  <Shield size={12} className="text-luxury-gold" /> Secure Inquiry Portal
               </div>
            </div>
          </div>

        </div>
      </div>

      {isAdmin && vehicle && (
        <ListingCreationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          category="vehicle"
          listingToEdit={vehicle as any}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
