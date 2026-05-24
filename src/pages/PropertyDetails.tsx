import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, BedDouble, Bath, Square, Share2, 
  Heart, Calendar, Check, ArrowLeft, Phone, 
  Mail, MessageSquare, Info, Loader2, ShieldCheck, FileCheck2,
  ChevronLeft, ChevronRight, Sparkles, Building, Landmark, Percent, Clock, AlertCircle,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useListing } from '@/hooks/useListing';
import { useListings } from '@/hooks/useListings';
import { Property } from '@/types';
import NotFoundState from '@/components/NotFoundState';
import MapDiscovery from '@/components/MapDiscovery';
import PropertyCard from '@/components/PropertyCard';
import PropertyDetailMap from '@/components/location/PropertyDetailMap';
import { useAuth } from '@/contexts/AuthContext';
import { listingService } from '@/services/listingService';
import { toast } from 'sonner';

export default function PropertyDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { listing, loading, error, refresh } = useListing(id);
  const property = listing as Property | null;

  const { user, profile } = useAuth();
  const isAdmin = profile?.role?.toString().toLowerCase().trim() === 'admin';

  const handleToggleFeature = useCallback(async () => {
    if (!property) return;
    try {
      const success = await listingService.updateListing(property.id, { isFeatured: !property.isFeatured }, true);
      if (success) {
        toast.success(property.isFeatured ? 'Feature status removed' : 'Listing marked as featured');
        refresh();
      } else {
        toast.error('Failed to update feature status');
      }
    } catch (err) {
      toast.error('Failed to update feature status');
    }
  }, [property, refresh]);

  const handleStatusChange = useCallback(async (newStatus: any) => {
    if (!property) return;
    try {
      const success = await listingService.updateListing(property.id, { status: newStatus }, true);
      if (success) {
        toast.success(`Status updated to ${newStatus}`);
        refresh();
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  }, [property, refresh]);

  // State Management for Interactive Overlays
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [calcDownPayment, setCalcDownPayment] = useState<number | ''>('');
  const [calcInterestRate, setCalcInterestRate] = useState(7.5);
  const [calcDuration, setCalcDuration] = useState(20);
  
  // Visit scheduling custom state
  const [visitingDate, setVisitingDate] = useState('');
  const [visitingTime, setVisitingTime] = useState('');
  const [visitingName, setVisitingName] = useState('');
  const [visitingPhone, setVisitingPhone] = useState('');
  const [scheduleStatus, setScheduleStatus] = useState<'idle' | 'success'>('idle');

  // Load similar listings
  const listingsFilters = useMemo(() => ({ category: 'property' as const }), []);
  const { listings: allListings } = useListings(listingsFilters);

  const similarListings = useMemo(() => {
    if (!property) return [];
    return allListings
      .filter(l => l.id !== property.id && (l.city === property.city || l.subcategory === property.subcategory))
      .slice(0, 3) as Property[];
  }, [allListings, property]);

  // Handle default photos check
  const images = useMemo(() => {
    if (property?.images?.length) return property.images;
    return [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop'
    ];
  }, [property]);

  // Handle Mortgage Calculators
  const mortgageResult = useMemo(() => {
    if (!property || typeof property.price !== 'number') return null;
    const price = property.price;
    const actualDP = calcDownPayment === '' ? price * 0.20 : Number(calcDownPayment);
    const loanAmount = Math.max(0, price - actualDP);
    const monthlyRate = (calcInterestRate / 100) / 12;
    const numberOfPayments = calcDuration * 12;

    let monthlyRepayment = 0;
    if (monthlyRate > 0) {
      monthlyRepayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      monthlyRepayment = loanAmount / numberOfPayments;
    }

    return {
      downPayment: actualDP,
      loanValue: loanAmount,
      monthlyPayment: isNaN(monthlyRepayment) || !isFinite(monthlyRepayment) ? 0 : monthlyRepayment
    };
  }, [property, calcDownPayment, calcInterestRate, calcDuration]);

  // Format WhatsApp Link
  const whatsAppInquiryUrl = useMemo(() => {
    if (!property) return '#';
    const priceText = formatPrice(property.price, property.currency);
    const message = `Asc Salaam/Hello AmaanEstate, I am interested in your listing: "${property.title}" listed for ${priceText} in ${property.city}. ID Ref: ${property.id}.`;
    const contactPhone = property.phone || property.features?.phone || '';
    if (!contactPhone) return '#';
    const cleanPhone = contactPhone.replace(/\D/g, '');
    const prefix = cleanPhone.startsWith('9') || cleanPhone.startsWith('7') ? '251' + cleanPhone : cleanPhone;
    return `https://wa.me/${prefix}?text=${encodeURIComponent(message)}`;
  }, [property]);

  // Submit visit booking
  const handleScheduleVisit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!visitingDate || !visitingTime || !visitingName || !visitingPhone) {
      return;
    }
    setScheduleStatus('success');
  }, [visitingDate, visitingTime, visitingName, visitingPhone]);

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black flex flex-col items-center justify-center">
        <Loader2 className="w-16 h-16 text-luxury-gold animate-spin mb-6" />
        <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.4em]">Retaining Asset Blueprint...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-luxury-black">
        <NotFoundState 
          title="Asset Not Found" 
          description={error || "The requested estate record could not be retrieved from the central registry. It may have been archived or is awaiting listing validation."}
          backLink="/properties"
          backLabel="BACK TO MARKETPLACE"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black pb-24">
      
      {/* 1. GALLERY MEDIA CONTAINER */}
      <div className="relative pt-24">
        {isAdmin && property && (
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
                    property.isFeatured 
                      ? 'bg-luxury-gold/20 border-luxury-gold text-luxury-gold' 
                      : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/25'
                  }`}
                >
                  <Sparkles size={12} fill={property.isFeatured ? 'currentColor' : 'none'} /> 
                  <span>{property.isFeatured ? 'Featured Asset' : 'Mark Featured'}</span>
                </button>

                {/* Status Switcher */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-4 h-11 text-[9px] uppercase font-black tracking-widest text-white/40">
                  <span className="font-bold">STATUS:</span>
                  <select
                    value={property.status}
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
                  onClick={() => navigate(`/list-property?edit=${property.id}`)}
                  className="h-11 rounded-xl bg-luxury-gold hover:bg-white text-black font-black text-[9px] uppercase tracking-widest gap-2 px-6 shadow-lg shadow-luxury-gold/10"
                >
                  <Edit3 size={12} /> Rewrite Listing
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 mb-5 flex justify-between items-center text-white/40 text-xs">
          <Link to="/properties" className="flex items-center gap-2 hover:text-luxury-gold transition-colors font-bold tracking-widest uppercase">
            <ArrowLeft size={14} /> BACK TO MARKETPLACE
          </Link>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Property portfolio link saved to clipboard!');
              }}
              className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
            >
              <Share2 size={14} /> SHARE
            </button>
            <button 
              onClick={() => setFavorite(!favorite)}
              className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
            >
              <Heart size={14} className={favorite ? 'fill-luxury-gold text-luxury-gold' : 'text-white/40'} /> 
              <span>{favorite ? 'SAVED' : 'SAVE ASSET'}</span>
            </button>
          </div>
        </div>

        {/* Cinematic Grid Layout */}
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:min-h-[550px]">
          <div 
            onClick={() => { setActivePhotoIndex(0); setIsGalleryOpen(true); }}
            className="md:col-span-8 rounded-[2rem] overflow-hidden group aspect-[16/10] md:aspect-auto bg-white/5 cursor-pointer relative"
          >
            <img 
              src={images[0]} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              alt={property.title} 
              loading="eager"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex items-end">
              <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Main Perspective</span>
            </div>
          </div>
          <div className="md:col-span-4 flex flex-row md:flex-col gap-4">
            <div 
              onClick={() => { setActivePhotoIndex(1); setIsGalleryOpen(true); }}
              className="flex-1 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group aspect-square md:aspect-auto cursor-pointer bg-white/5"
            >
              <img 
                src={images[1] || images[0]} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="Alt View 2" 
              />
            </div>
            <div 
              onClick={() => { setActivePhotoIndex(2); setIsGalleryOpen(true); }}
              className="flex-1 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden relative group aspect-square md:aspect-auto cursor-pointer bg-white/5"
            >
              <img 
                src={images[2] || images[0]} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="Alt View 3" 
              />
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center transition-all group-hover:bg-black/40">
                <Button variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 text-xs h-10 px-6 rounded-xl font-bold uppercase tracking-widest cursor-pointer">
                  View Carousel ({images.length} photos)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CORE INFO MATRIX */}
      <div className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Main Info Columns */}
          <div className="lg:col-span-8 space-y-16">
            <div>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Badge className={`uppercase text-[10px] tracking-[0.3em] font-bold px-6 py-2 border-0 rounded-full ${
                  property.listingType === 'sale' ? 'bg-luxury-gold text-luxury-black shadow-lg shadow-luxury-gold/20' : 'bg-white text-luxury-black'
                }`}>
                  For {property.listingType}
                </Badge>
                <div className="bg-white/5 border border-white/5 text-luxury-gold uppercase text-[10px] tracking-[0.3em] px-6 py-2 rounded-full font-bold flex items-center gap-2">
                  <Building size={12} />
                  <span>{property.subcategory || property.category}</span>
                </div>
                {property.isVerified && (
                  <motion.div 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: [0.9, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 3, repeatType: "reverse" }}
                    className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase text-[9px] tracking-[0.25em] px-5 py-2 rounded-full font-bold flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Verified Agent
                  </motion.div>
                )}
                {property.legalChecked && property.listingType === 'sale' && (
                  <motion.div 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: [0.9, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 3, repeatType: "reverse", delay: 1 }}
                    className="bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] uppercase text-[9px] tracking-[0.25em] px-5 py-2 rounded-full font-bold flex items-center gap-1.5"
                  >
                    <ShieldCheck size={12} />
                    Legal Title Verified
                  </motion.div>
                )}
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-medium text-white mb-6 tracking-tight leading-[1.05] md:leading-[1]">
                {property.title}
              </h1>
              <div className="flex items-center text-white/50 text-base md:text-lg font-light">
                <MapPin className="mr-3 text-luxury-gold animate-bounce" size={20} />
                <span className="tracking-wide">{property.location}, {property.city}</span>
              </div>
            </div>

            {/* Core Blueprint Parameters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 py-8 md:py-10 border-y border-white/5 bg-white/[0.01] px-6 rounded-2xl">
              {[
                { icon: <BedDouble size={24} />, label: 'Bedrooms', value: (property.beds !== undefined && property.beds !== null ? property.beds : 'Not Provided') + ' Rooms' },
                { icon: <Bath size={24} />, label: 'Bathrooms', value: (property.baths !== undefined && property.baths !== null ? property.baths : 'Not Provided') + ' Baths' },
                { icon: <Square size={24} />, label: 'Metric Area', value: property.size || 'Not Provided' },
                { icon: <Calendar size={24} />, label: 'Compliance Year', value: property.complianceYear || 'Not provided' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center p-3 hover:bg-white/5 rounded-xl transition-all">
                  <div className="text-luxury-gold/60 mb-2">{item.icon}</div>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-white/30 mb-1 font-bold">{item.label}</p>
                  <p className="text-white font-bold text-sm md:text-base tracking-tight">{item.value}</p>
                </div>
              ))}
            </div>

            {/* General Description */}
            <div className="max-w-3xl space-y-4">
              <h3 className="text-white text-[10px] uppercase font-bold tracking-[0.4em] mb-6 flex items-center">
                Executive Portfolio Summary <div className="h-px flex-1 bg-white/5 ml-8"></div>
              </h3>
              <p className="text-white/70 text-base md:text-lg leading-[1.8] font-light">
                {property.description || 'No description provided.'}
              </p>
            </div>

            {/* Amenities Grid */}
            <div>
              <h3 className="text-white text-[10px] uppercase font-bold tracking-[0.4em] mb-6 flex items-center">
                Refined Custom Amenities <div className="h-px flex-1 bg-white/5 ml-8"></div>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(property.features && typeof property.features === 'object') ? (
                  Object.entries(property.features).map(([key, value], i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-luxury-gold/20 transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-luxury-gold/10 flex items-center justify-center shrink-0">
                        <Check size={14} className="text-luxury-gold" />
                      </div>
                      <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">{key}: {String(value)}</span>
                    </div>
                  ))
                ) : (
                  // Default elegant list if empty
                  ['Master Suite Design', 'Perimeter Security Enclosure', 'Reliable Hydroelectric Connection', 'Spacious Private Balconies', 'Italian Ceramic Finishes', 'Diaspora-standard construction'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-luxury-gold/20 transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-luxury-gold/10 flex items-center justify-center shrink-0">
                        <Check size={14} className="text-luxury-gold" />
                      </div>
                      <span className="text-white/60 text-xs font-medium">{item}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* TRUST & VERIFICATION GRID INDICATORS (Item 6) */}
            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
              <h3 className="text-white text-[10px] uppercase font-bold tracking-[0.4em] mb-4 flex items-center">
                Legal Sovereignty & Verification <div className="h-px flex-1 bg-white/5 ml-8"></div>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-md">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold uppercase tracking-widest leading-none">Legal & Tax Status</h4>
                      <span className="text-emerald-400 text-[9px] font-bold tracking-widest uppercase">
                        {property.verification?.titleType || 'Not provided'}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/50 text-[11px] leading-relaxed">
                    Legal: {property.verification?.legalStatus || 'N/A'} | Tax: {property.verification?.taxStatus || 'N/A'}
                  </p>
                  <p className="text-white/50 text-[11px] leading-relaxed mt-2">
                    Notes: {property.verification?.verificationNotes || 'No notes provided.'}
                  </p>
                </div>
              </div>
            </div>

            {/* NEIGHBORHOOD LANDMARKS */}
            <div>
              <h3 className="text-white text-[10px] uppercase font-bold tracking-[0.4em] mb-6 flex items-center">
                Close Proximity Points <div className="h-px flex-1 bg-white/5 ml-8"></div>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.nearbyPlaces && Array.isArray(property.nearbyPlaces) && property.nearbyPlaces.length > 0 ? (
                  property.nearbyPlaces.map((mark: any, i: number) => (
                    <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#C5A059]/20 transition-all flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold shrink-0">
                        <Landmark size={20} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white text-xs font-bold font-display">{mark.name}</h4>
                          <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded text-luxury-gold whitespace-nowrap">{mark.dist}</span>
                        </div>
                        <p className="text-white/40 text-[11px]">{mark.desc}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-white/40 text-xs text-center py-4">No nearby landmarks data available.</p>
                )}
              </div>
            </div>

            {/* 2. TRUE INTERACTIVE MAP LOCATION PREVIEW - Property Location */}
            <div>
              <h3 className="text-white text-[10px] uppercase font-bold tracking-[0.4em] mb-6 flex items-center">
                Property Location <div className="h-px flex-1 bg-white/5 ml-8"></div>
              </h3>
              <PropertyDetailMap property={property} />
              <p className="text-white/30 text-[11px] mt-4 leading-normal flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 text-luxury-gold mt-0.5" />
                Detailed architectural layout blueprints, boundary markings, and specific cadastral plots are made accessible under verified professional escrow requests.
              </p>
            </div>

            {/* INTERACTIVE FINANCIAL MORTGAGE PLANNER */}
            <div className="bg-luxury-charcoal/40 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold">
                  <Percent size={24} />
                </div>
                <div>
                  <h4 className="text-white font-display font-bold text-xl">Intelligent Financing & Mortgage Calculator</h4>
                  <p className="text-white/40 text-xs">Simulate monthly installments with prime Somali banking partners (Dahabshil Bank, Premier Bank)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/50 block mb-2">Down Payment ({property.currency || 'ETB'})</label>
                  <Input 
                    type="number"
                    placeholder={`e.g. ${(property.price * 0.2).toFixed(0)}`}
                    value={calcDownPayment}
                    onChange={(e) => setCalcDownPayment(e.target.value === '' ? '' : Number(e.target.value))}
                    className="bg-white/5 border-white/10 h-12 rounded-xl text-white focus:border-luxury-gold/50"
                  />
                  <span className="text-[10px] text-white/30 mt-1 block">Default: 20% minimum</span>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/50 block mb-2">Interest Rate (%)</label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={calcInterestRate}
                    onChange={(e) => setCalcInterestRate(Number(e.target.value))}
                    className="bg-white/5 border-white/10 h-12 rounded-xl text-white focus:border-luxury-gold/50"
                  />
                  <span className="text-[10px] text-white/30 mt-1 block">Somali diaspora rate index</span>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/50 block mb-2">Duration (Years)</label>
                  <select 
                    value={calcDuration} 
                    onChange={(e) => setCalcDuration(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 h-12 rounded-xl px-4 text-white hover:border-luxury-gold/50 transition-colors cursor-pointer text-sm"
                  >
                    {[5, 10, 15, 20, 25, 30].map(yr => (
                      <option key={yr} value={yr} className="bg-luxury-black">{yr} Years</option>
                    ))}
                  </select>
                </div>
              </div>

              {mortgageResult && (
                <div className="pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left items-center bg-white/[0.02] p-6 rounded-2xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 block mb-1">Financed Value</span>
                    <p className="text-xl font-bold text-white tabular-nums">{formatPrice(mortgageResult.loanValue, property.currency)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 block mb-1">Down Payment Simulated</span>
                    <p className="text-xl font-bold text-emerald-400 tabular-nums">{formatPrice(mortgageResult.downPayment, property.currency)}</p>
                  </div>
                  <div className="bg-luxury-gold/10 p-4 rounded-xl border border-luxury-gold/30">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-luxury-gold block mb-1">Monthly Installment Est.</span>
                    <p className="text-2xl font-display font-bold text-luxury-gold tabular-nums">{formatPrice(mortgageResult.monthlyPayment, property.currency)}/mo</p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar / Concierge & Scheduling Panel */}
          <div className="lg:col-span-4 mt-12 lg:mt-0">
            <div className="lg:sticky lg:top-32 space-y-8">
              
              {/* Luxury Concierge details */}
              <div className="bg-luxury-charcoal/60 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-8">
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2">Portfolio Listing Value</p>
                  <p className="text-4xl md:text-5xl font-display font-medium text-luxury-gold tabular-nums">
                    {formatPrice(property.price, property.currency)}
                  </p>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-4 pb-6 border-b border-white/10 relative">
                      <div className="w-14 h-14 rounded-2xl bg-luxury-gold/20 flex items-center justify-center text-luxury-gold font-bold relative">
                        AS
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-luxury-black flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-white font-bold text-sm">Amaan Certified Concierge</h4>
                        <span className="text-luxury-gold text-[9px] font-bold tracking-widest uppercase">Verified Premier Agent</span>
                        <div className="flex items-center gap-1.5 text-white/40 text-[10px] uppercase font-bold">
                          <Clock size={12} className="text-emerald-400" />
                          <span>Response: &lt; 10 Mins</span>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-3 pt-2">
                     <Button asChild className="w-full bg-[#C5A059] text-black hover:bg-white hover:text-black hover:shadow-xl transition-all h-16 rounded-2xl font-bold cursor-pointer">
                       <a href={whatsAppInquiryUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                         <MessageSquare size={20} />
                         <span>WhatsApp Inquire</span>
                       </a>
                     </Button>
                     <Button variant="outline" asChild className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 h-16 rounded-2xl font-bold cursor-pointer">
                       <a href={property.phone || property.features?.phone ? `tel:${property.phone || property.features?.phone}` : '#'} className="flex items-center justify-center gap-2">
                         <Phone size={18} />
                         <span>Direct Call Line</span>
                       </a>
                     </Button>
                   </div>
                </div>

                <div className="p-5 bg-white/[0.02] rounded-2xl flex gap-3.5 items-start border border-white/5">
                  <Info size={16} className="text-luxury-gold shrink-0 border-0 mt-0.5" />
                  <p className="text-white/50 text-[11px] leading-relaxed">
                    Diaspora acquisitions are supported through our exclusive banking and power-of-attorney legal compliance frameworks.
                  </p>
                </div>
              </div>

              {/* SCHEDULE VISIT CLIENT PANEL */}
              <div className="p-8 border border-white/10 rounded-[2.5rem] bg-luxury-charcoal/30 backdrop-blur-md">
                <h4 className="text-white font-display font-bold text-lg mb-2 flex items-center gap-2">
                  <Calendar size={18} className="text-luxury-gold" />
                  Request Private Tour
                </h4>
                <p className="text-white/40 text-xs mb-6">Schedule on-site private viewing or HD virtual live video tour with a portfolio guide.</p>
                
                {scheduleStatus === 'success' ? (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h5 className="text-white font-bold text-sm">Tour Requested Successfully</h5>
                      <p className="text-white/50 text-xs mt-1">Our certified manager will ping your WhatsApp in &lt; 10 mins to lock in security clearances.</p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleScheduleVisit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-white/40 block mb-1">Pick Date</label>
                        <input 
                          type="date" 
                          required
                          value={visitingDate}
                          onChange={(e) => setVisitingDate(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-3 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-white/40 block mb-1">Pick Time</label>
                        <input 
                          type="time" 
                          required
                          value={visitingTime}
                          onChange={(e) => setVisitingTime(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-3 text-white text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-white/40 block mb-1">Your Full Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Abdirahman Yusuf"
                        value={visitingName}
                        onChange={(e) => setVisitingName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-3 text-white text-xs placeholder:text-white/20"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-white/40 block mb-1">Direct Call/WhatsApp Phone</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="e.g. +251 9..."
                        value={visitingPhone}
                        onChange={(e) => setVisitingPhone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-3 text-white text-xs placeholder:text-white/20"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-white/5 border border-white/10 text-white hover:bg-luxury-gold hover:text-black hover:border-luxury-gold transition-colors font-bold uppercase tracking-widest text-[10px] h-12 rounded-xl cursor-pointer">
                      Lock Visitation Request
                    </Button>
                  </form>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* 3. SIMILAR PROPERTIES PORTFOLIO SLOT */}
        {similarListings.length > 0 && (
          <div className="mt-28 border-t border-white/5 pt-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-luxury-gold text-[10px] uppercase font-bold tracking-[0.4em]">EXQUISITE PARALLELS</span>
                <h2 className="text-3xl md:text-5xl font-display font-medium text-white tracking-tight mt-2">
                  Similar <span className="gold-text-gradient">Estates</span>
                </h2>
              </div>
              <Button asChild variant="link" className="text-luxury-gold p-0 font-bold uppercase tracking-widest text-xs gap-2">
                <Link to="/properties">Explore All Inventory <ArrowLeft size={14} className="rotate-180" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarListings.map(similar => (
                <PropertyCard key={similar.id} property={similar} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 4. FULLSCREEN OVERLAY MODAL CAROUSEL */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/98 flex flex-col justify-between"
          >
            {/* Top Toolbar */}
            <div className="p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent relative z-10 text-white">
              <div>
                <h4 className="font-display font-bold text-sm tracking-wide">{property.title}</h4>
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Photo {activePhotoIndex + 1} of {images.length}</p>
              </div>
              <button 
                onClick={() => setIsGalleryOpen(false)}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/25 hover:scale-105 transition-all cursor-pointer border border-white/10"
              >
                CLOSE
              </button>
            </div>

            {/* Large Image Frame */}
            <div className="flex-1 flex items-center justify-center px-4 relative">
              <button 
                onClick={() => setActivePhotoIndex((activePhotoIndex - 1 + images.length) % images.length)}
                className="absolute left-6 w-14 h-14 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:scale-105 transition-all z-10 cursor-pointer"
              >
                <ChevronLeft size={28} />
              </button>

              <div className="max-w-5xl max-h-[70vh] rounded-3xl overflow-hidden shadow-2xl relative select-none">
                <motion.img 
                  key={activePhotoIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  src={images[activePhotoIndex]} 
                  className="max-w-full max-h-[76vh] object-contain rounded-2xl mx-auto"
                  alt={`Sovereign detail ${activePhotoIndex}`}
                />
              </div>

              <button 
                onClick={() => setActivePhotoIndex((activePhotoIndex + 1) % images.length)}
                className="absolute right-6 w-14 h-14 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:scale-105 transition-all z-10 cursor-pointer"
              >
                <ChevronRight size={28} />
              </button>
            </div>

            {/* Thumbnail Navigation Rack */}
            <div className="p-8 bg-black/80 border-t border-white/5 overflow-x-auto flex justify-center gap-3">
              {images.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`w-20 md:w-28 h-14 md:h-18 rounded-lg overflow-hidden shrink-0 cursor-pointer border-2 transition-all relative ${
                    activePhotoIndex === idx ? 'border-luxury-gold scale-105 shadow-md shadow-luxury-gold/20' : 'border-transparent opacity-40 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`thumb ${idx}`} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
