import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, BedDouble, Bath, Square, Share2, 
  Heart, X, ArrowLeft, Phone, Mail, MessageSquare, 
  Info, Loader2, ShieldCheck, FileCheck2,
  ChevronLeft, ChevronRight, Sparkles, Building, Landmark, Compass, Navigation, Percent, Clock, AlertCircle, 
  ExternalLink, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/contexts/SettingsContext';
import { listingService } from '@/services/listingService';
import { toast } from 'sonner';
import PropertyDetailMap from '@/components/location/PropertyDetailMap';

interface PropertyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
}

export default function PropertyDetailModal({ isOpen, onClose, property }: PropertyDetailModalProps) {
  const { formatPriceConverted } = useSettings();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fullProperty, setFullProperty] = useState<any>(property);

  // Scheduling state
  const [visitingDate, setVisitingDate] = useState('');
  const [visitingTime, setVisitingTime] = useState('');
  const [visitingName, setVisitingName] = useState('');
  const [visitingPhone, setVisitingPhone] = useState('');
  const [scheduleStatus, setScheduleStatus] = useState<'idle' | 'success'>('idle');

  // Load fully fresh data (including extra fields if any) in background
  useEffect(() => {
    let active = true;
    if (!property?.id) return;
    
    const fetchFreshData = async () => {
      setIsRefreshing(true);
      try {
        const fresh = await listingService.getListingById(property.id);
        if (active && fresh) {
          setFullProperty(fresh);
        }
      } catch (err) {
        console.warn('Error reloading fresh modal details:', err);
      } finally {
        if (active) setIsRefreshing(false);
      }
    };
    
    fetchFreshData();
    return () => {
      active = false;
    };
  }, [property?.id]);

  // Handle image slider images
  const images = useMemo(() => {
    if (fullProperty?.images?.length) return fullProperty.images;
    return [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop'
    ];
  }, [fullProperty]);

  const displayPrice = useMemo(() => {
    if (typeof fullProperty?.price === 'number') {
      return formatPriceConverted(fullProperty.price, fullProperty.currency || 'ETB');
    }
    return fullProperty?.price || 'Negotiative';
  }, [fullProperty, formatPriceConverted]);

  const whatsAppInquiryUrl = useMemo(() => {
    if (!fullProperty) return '#';
    const message = `Asc Salaam/Hello AmaanEstate, I am highly interested in your premium listing: "${fullProperty.title}" listed for ${displayPrice} in ${fullProperty.city}. ID Ref: ${fullProperty.id}. Please consult me regarding coordinates.`;
    return `https://wa.me/251717888800?text=${encodeURIComponent(message)}`;
  }, [fullProperty, displayPrice]);

  const handleScheduleVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitingDate || !visitingTime || !visitingName || !visitingPhone) {
      toast.error('Please fulfill all visit coordinates');
      return;
    }
    setScheduleStatus('success');
    toast.success('Your VIP view assignment is locked! An officer will verify on WhatsApp.');
  };

  const nextPhoto = useCallback(() => {
    setActivePhotoIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevPhoto = useCallback(() => {
    setActivePhotoIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center overflow-hidden">
          {/* Backdrop Shadow / Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Panel bottom sheet on mobile, elegant wide window on desktop */}
          <motion.div
            id="property-detail-modal-panel"
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            drag="y"
            dragDirectionLock
            dragConstraints={{ top: 0 }}
            dragElastic={0.4}
            onDragEnd={(e, info) => {
              // Swipe down > 120px triggers close on touch devices
              if (info.offset.y > 120) {
                onClose();
              }
            }}
            className="relative w-full max-h-[94vh] md:max-h-[88vh] md:max-w-4xl bg-[#090909] text-white rounded-t-[2.5rem] md:rounded-[2.5rem] border-t md:border border-white/10 flex flex-col overflow-hidden shadow-2xl z-10 font-sans"
          >
            {/* Grab Handlebar on Mobile */}
            <div className="flex md:hidden justify-center py-3 shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors" />
            </div>

            {/* Scrolling Core viewport */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pb-12 custom-scrollbar">
              
              {/* 1. Header Media / Slider Gallery */}
              <div className="relative aspect-[16/10] md:aspect-[16/8] w-full bg-black shrink-0 group select-none">
                <img 
                  src={images[activePhotoIndex]} 
                  alt={fullProperty?.title} 
                  className="w-full h-full object-cover transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual shade */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-black/35" />

                {/* Floating controls in Image view */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className={`uppercase text-[10px] tracking-widest font-bold px-3 py-1 bg-luxury-gold text-luxury-black border-0 rounded-lg shadow-md`}>
                    {fullProperty?.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                  </Badge>
                  {fullProperty?.isVerified && (
                    <Badge className="bg-emerald-500 text-white border-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold shadow-md">
                      <ShieldCheck size={11} /> Verified Asset
                    </Badge>
                  )}
                </div>

                {/* Navigation Chevrons inside slider */}
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/5 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/5 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Bottom indicators */}
                <div className="absolute bottom-4 left-6 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhotoIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activePhotoIndex === i ? 'w-6 bg-luxury-gold' : 'w-2 bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                {/* Close Button top right */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/95 text-white flex items-center justify-center border border-white/10 hover:border-white/30 transition-all cursor-pointer shadow-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 2. Core Listing Blueprint Content */}
              <div className="px-6 md:px-10 py-8 space-y-8">
                
                {/* Title & Price Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-luxury-gold font-bold text-[10px] uppercase tracking-[0.2em] mb-2 block">
                      {fullProperty?.subcategory || 'Premium Asset'}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
                      {fullProperty?.title}
                    </h2>
                    <div className="flex items-center text-white/45 text-sm mt-2.5">
                      <MapPin size={14} className="mr-2 text-luxury-gold shrink-0" />
                      <span>{fullProperty?.location}, {fullProperty?.city}</span>
                    </div>
                  </div>
                  
                  <div className="shrink-0 bg-white/[0.02] border border-white/5 px-6 py-3.5 rounded-2xl md:text-right">
                    <span className="text-[9px] font-bold text-white/30 tracking-widest uppercase block mb-1">Asset Value valuation</span>
                    <span className="text-2xl md:text-3xl font-display font-extrabold text-luxury-gold">
                      {displayPrice}
                    </span>
                  </div>
                </div>

                {/* Structural Attributes Grid */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 py-6 border-y border-white/5">
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center justify-center">
                    <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-1">Beds</span>
                    <div className="flex items-center gap-1.5 text-white/80 font-bold text-base mt-1">
                      <BedDouble size={16} className="text-luxury-gold" />
                      <span>{fullProperty?.beds || '-'}</span>
                    </div>
                  </div>
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center justify-center">
                    <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-1">Baths</span>
                    <div className="flex items-center gap-1.5 text-white/80 font-bold text-base mt-1">
                      <Bath size={16} className="text-luxury-gold" />
                      <span>{fullProperty?.baths || '-'}</span>
                    </div>
                  </div>
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center justify-center">
                    <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-1">Area</span>
                    <div className="flex items-center gap-1.5 text-white/80 font-bold text-base mt-1">
                      <Square size={16} className="text-luxury-gold" />
                      <span>{fullProperty?.size || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Description Text */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Portfolio Synopsis</h3>
                  <p className="text-white/60 text-sm leading-relaxed font-light whitespace-pre-line bg-white/[0.01] p-5 rounded-2.5xl border border-white/5">
                    {fullProperty?.description || "This premium certified real estate asset listed in Jigjiga Somali Region holds high strategic location values. Complete structural parameters and location maps can be certified through AmaanEstate Central Hub."}
                  </p>
                </div>

                {/* Landmark & Coordinates Map Dashboard */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Geographical Anchor Points</h3>
                  <PropertyDetailMap property={fullProperty} />
                </div>

                {/* Action CTA Panel & Scheduling Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* Immediate Support */}
                  <div className="glass-card border border-white/5 rounded-3xl p-6 flex flex-col justify-between space-y-6">
                    <div>
                      <h4 className="text-base font-display font-semibold text-white">Direct Agent Consulting</h4>
                      <p className="text-xs text-white/40 mt-1 leading-relaxed">Instantly reach verified registrar officers for detailed deed analysis, contract validation, and diaspora payment coordination.</p>
                      
                      <div className="mt-5 space-y-3 text-xs">
                        <div className="flex items-center gap-3 text-white/70">
                          <ShieldCheck size={14} className="text-luxury-gold shrink-0" />
                          <span>Amaan Certified Registrar Protection</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/70">
                          <Check size={14} className="text-luxury-gold shrink-0" />
                          <span>Diaspora Multi-currency Escrows</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <a 
                        href={whatsAppInquiryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-900/10"
                      >
                        <MessageSquare size={16} /> Inquiry on WhatsApp
                      </a>
                      <a 
                        href="tel:+251717888800"
                        className="w-full h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Phone size={14} /> Call Agent hotline
                      </a>
                    </div>
                  </div>

                  {/* Visit scheduler */}
                  <div className="glass-card border border-white/5 rounded-3xl p-6 space-y-4">
                    <h4 className="text-base font-display font-semibold text-white flex items-center gap-2">
                      <Clock size={16} className="text-luxury-gold animate-pulse" />
                      <span>VIP Area Visitation Lock</span>
                    </h4>
                    
                    {scheduleStatus === 'success' ? (
                      <div className="p-6 text-center space-y-4 h-full flex flex-col justify-center items-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                          <Check size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Private Slot Secured</p>
                          <p className="text-[11px] text-white/40 mt-2">Visits synchronized for {visitingDate} at {visitingTime}. A local supervisor will call your WhatsApp at {visitingPhone}.</p>
                        </div>
                        <Button 
                          onClick={() => setScheduleStatus('idle')}
                          variant="outline"
                          className="h-10 text-[10px] tracking-widest font-bold uppercase border-white/10 bg-white/5"
                        >
                          Book another slot
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleScheduleVisit} className="space-y-3.5">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] uppercase tracking-wider text-white/35 font-bold block mb-1">Select Date</label>
                            <Input 
                              type="date"
                              required
                              value={visitingDate}
                              onChange={(e) => setVisitingDate(e.target.value)}
                              className="bg-white/5 border-white/10 text-white placeholder-white/20 h-10 rounded-xl px-3 outline-none text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] uppercase tracking-wider text-white/35 font-bold block mb-1">Preferred Time</label>
                            <Input 
                              type="time"
                              required
                              value={visitingTime}
                              onChange={(e) => setVisitingTime(e.target.value)}
                              className="bg-white/5 border-white/10 text-white placeholder-white/20 h-10 rounded-xl px-3 outline-none text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-white/35 font-bold block mb-1">VIP Guest Name</label>
                          <Input 
                            type="text"
                            required
                            placeholder="Amaan Specialist"
                            value={visitingName}
                            onChange={(e) => setVisitingName(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder-white/25 h-10 rounded-xl px-3 outline-none text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-white/35 font-bold block mb-1">WhatsApp Mobile Contact</label>
                          <Input 
                            type="tel"
                            required
                            placeholder="+252 or +251 7..."
                            value={visitingPhone}
                            onChange={(e) => setVisitingPhone(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder-white/25 h-10 rounded-xl px-3 outline-none text-xs"
                          />
                        </div>

                        <Button 
                          type="submit"
                          className="w-full h-11 bg-luxury-gold text-black hover:bg-white rounded-xl font-bold uppercase tracking-wider text-[11px] transition-colors mt-2 text-center"
                        >
                          Lock Visitation Appointment
                        </Button>
                      </form>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
