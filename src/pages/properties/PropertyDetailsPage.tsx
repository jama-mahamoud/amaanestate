import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { 
  ArrowLeft, BedDouble, Bath, Square, MapPin, 
  Sparkles, Calendar, Heart, Shield, Phone, Mail, 
  MessageSquare, ChevronLeft, ChevronRight, RefreshCw 
} from 'lucide-react';
import { useSEO } from '../../hooks/useSEO';
import { db, handleFirestoreError, OperationType } from '../../services/firestore';
import { getPropertyById } from '../../services/properties';
import { Property, Agent } from '../../types';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Viewing Request form state
  const [viewDate, setViewDate] = useState('');
  const [viewTime, setViewTime] = useState('');
  const [viewNotes, setViewNotes] = useState('');
  const [viewingSubmitted, setViewingSubmitted] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      if (!id) return;
      setLoading(true);
      try {
        const propData = await getPropertyById(id);
        if (propData) {
          setProperty(propData);
          
          // Fetch linked Agent info directly from 'agents' collection if valid
          if (propData.agentId && propData.agentId !== 'unassigned') {
            const agentRef = doc(db, 'agents', propData.agentId);
            const agentSnap = await getDoc(agentRef);
            if (agentSnap.exists()) {
              const aData = agentSnap.data();
              setAgent({
                id: agentSnap.id,
                name: aData.name || 'AmaanEstate Partner',
                profileImage: aData.profileImage || '',
                phone: aData.phone || '+251 911 000000',
                email: aData.email || 'info@amaanestate.com',
                bio: aData.bio || '',
                specialization: aData.specialization || [],
                active: !!aData.active,
                createdAt: aData.createdAt || new Date().toISOString()
              });
            }
          }
        }
      } catch (err) {
        console.error('Error fetching property details:', err);
        handleFirestoreError(err, OperationType.GET, 'property-details');
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [id]);

  useSEO({
    title: property ? `${property.title} | AmaanEstate` : 'Property Details | AmaanEstate',
    description: property ? property.description : 'Explore verified property listings in Jigjiga, Somali Region, and beyond.'
  });

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Saved to favorites');
  };

  const handleViewingRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewDate || !viewTime) {
      toast.error('Please specify both date and time');
      return;
    }
    // Formulate a placeholder submission until Phase 5 viewings service connection is hooked
    setViewingSubmitted(true);
    toast.success('Viewing request received! An agent will confirm shortly.');
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="text-cyan-400 animate-spin" size={32} />
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">Retrieving property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-white font-mono">Property Not Found</h2>
        <p className="text-xs text-neutral-400 leading-relaxed">
          The listing ID does not exist or may have been unlisted or archived by an administrator.
        </p>
        <Button onClick={() => navigate('/properties')} className="bg-cyan-600 text-white">
          Back to Listings
        </Button>
      </div>
    );
  }

  const {
    title,
    price,
    currency,
    location,
    propertyType,
    listingType,
    bedrooms,
    bathrooms,
    area,
    images,
    description,
    features,
    amenities,
    featured,
    status,
    availability
  } = property;

  const coverImage = images && images.length > 0 
    ? images[activeImageIdx] 
    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat().format(p);
  };

  const handlePrevImg = () => {
    setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImg = () => {
    setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button & Header Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-neutral-400 hover:text-white flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to listings</span>
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={toggleFavorite}
            className={`border-neutral-800 flex items-center gap-1.5 cursor-pointer ${
              isFavorite ? 'text-red-400 border-red-500/20 bg-red-500/5' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
            <span>{isFavorite ? 'Saved' : 'Save'}</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Gallery & Top Spec */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Slider & Metadata (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Visual Carousel */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-neutral-950 border border-white/[0.04]">
            <img
              src={coverImage}
              alt={title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-all duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
              }}
            />

            {/* Carousel navigation controls if multiple images exist */}
            {images && images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImg}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg bg-[#050508]/80 hover:bg-neutral-900 border border-white/[0.04] text-white transition-all z-10 cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextImg}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg bg-[#050508]/80 hover:bg-neutral-900 border border-white/[0.04] text-white transition-all z-10 cursor-pointer"
                >
                  <ChevronRight size={20} />
                </button>
                {/* Dots indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-[#050508]/60 backdrop-blur-sm text-xxs font-mono text-white tracking-widest z-10">
                  {activeImageIdx + 1}/{images.length}
                </div>
              </>
            )}

            {/* Floating Status Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`px-2.5 py-1 text-xxs font-bold uppercase tracking-wider rounded-md text-white ${
                listingType === 'sale' ? 'bg-blue-600' : 'bg-emerald-600'
              }`}>
                For {listingType === 'sale' ? 'Sale' : 'Rent'}
              </span>
              {featured && (
                <span className="px-2.5 py-1 text-xxs font-bold uppercase tracking-wider rounded-md bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 flex items-center gap-1">
                  <Sparkles size={10} />
                  <span>Featured</span>
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails Row */}
          {images && images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-20 sm:w-24 aspect-video rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                    activeImageIdx === idx ? 'border-cyan-400' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Headline details */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.03] pb-6">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
                  {propertyType} Listings
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{title}</h1>
                <div className="flex items-center gap-1 text-xs text-neutral-400">
                  <MapPin size={13} className="text-neutral-500" />
                  <span>
                    {location.neighborhood ? `${location.neighborhood}, ` : ''}
                    {location.district ? `${location.district}, ` : ''}
                    {location.city}, {location.region}
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-2xl font-black text-white">
                  {formatPrice(price)} <span className="text-xs font-medium text-neutral-400">{currency}</span>
                </div>
                <span className="text-xxs font-mono text-neutral-500">
                  Listed &bull; Available ({availability})
                </span>
              </div>
            </div>

            {/* Spec Matrix Blocks */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-[#0c0c14] border border-white/[0.04] rounded-xl text-center">
              <div className="space-y-1">
                <div className="text-xs text-neutral-400 flex items-center justify-center gap-1.5 font-mono">
                  <BedDouble size={14} className="text-neutral-500" />
                  <span>Bedrooms</span>
                </div>
                <div className="text-base font-bold text-white">{bedrooms ?? '--'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-neutral-400 flex items-center justify-center gap-1.5 font-mono">
                  <Bath size={14} className="text-neutral-500" />
                  <span>Bathrooms</span>
                </div>
                <div className="text-base font-bold text-white">{bathrooms ?? '--'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-neutral-400 flex items-center justify-center gap-1.5 font-mono">
                  <Square size={12} className="text-neutral-500" />
                  <span>Plot Size</span>
                </div>
                <div className="text-base font-bold text-white">{area ? `${area} m²` : '--'}</div>
              </div>
            </div>

            {/* Description Block */}
            <div className="space-y-2.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">Description</h2>
              <p className="text-xs text-neutral-400 leading-relaxed whitespace-pre-line bg-[#0c0c14]/30 p-4 rounded-xl border border-white/[0.02]">
                {description || 'No description provided by the broker.'}
              </p>
            </div>

            {/* Features list */}
            {features && features.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">Property Highlights</h2>
                <div className="flex flex-wrap gap-2">
                  {features.map((feat, idx) => (
                    <span key={idx} className="px-3 py-1 text-xxs font-medium rounded-lg bg-blue-500/5 text-blue-300 border border-blue-500/10">
                      &bull; {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities list */}
            {amenities && amenities.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">Premium Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amen, idx) => (
                    <span key={idx} className="px-3 py-1 text-xxs font-medium rounded-lg bg-emerald-500/5 text-emerald-300 border border-emerald-500/10">
                      {amen}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Contact & Viewing Appointment scheduler (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Appointment Scheduler Panel */}
          <div className="p-5 rounded-xl bg-[#0c0c14] border border-white/[0.04] space-y-5">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Calendar size={15} className="text-cyan-400" />
                <span>Tour This Property</span>
              </h3>
              <p className="text-xxs text-neutral-500">
                Book a confirmed physical tour with a certified agent.
              </p>
            </div>

            {viewingSubmitted ? (
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center space-y-2">
                <Shield size={24} className="text-emerald-400 mx-auto" />
                <h4 className="text-xs font-bold text-white">Viewing Requested</h4>
                <p className="text-xxs text-neutral-400 leading-relaxed">
                  Your appointment for {viewDate} at {viewTime} has been logged. Our office will verify and send a SMS/Email confirmation.
                </p>
                <Button variant="ghost" size="sm" onClick={() => setViewingSubmitted(false)} className="text-xxs text-cyan-400 hover:text-cyan-300 h-auto p-0">
                  Reschedule
                </Button>
              </div>
            ) : (
              <form onSubmit={handleViewingRequest} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xxs font-semibold uppercase tracking-wider text-neutral-500 font-mono block">Date</label>
                    <input
                      type="date"
                      value={viewDate}
                      onChange={(e) => setViewDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#050508] border border-neutral-800 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xxs font-semibold uppercase tracking-wider text-neutral-500 font-mono block">Time</label>
                    <input
                      type="time"
                      value={viewTime}
                      onChange={(e) => setViewTime(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#050508] border border-neutral-800 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xxs font-semibold uppercase tracking-wider text-neutral-500 font-mono block">Inquiry / Message</label>
                  <textarea
                    rows={3}
                    value={viewNotes}
                    onChange={(e) => setViewNotes(e.target.value)}
                    placeholder="E.g. I am interested in buying, can we meet near the Airport road..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#050508] border border-neutral-800 text-white focus:outline-none focus:border-cyan-500 placeholder-neutral-600 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs py-2.5 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar size={13} />
                  <span>Request Appointment</span>
                </Button>
              </form>
            )}
          </div>

          {/* Assigned Agent Contact Card */}
          <div className="p-5 rounded-xl bg-[#0c0c14] border border-white/[0.04] space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Assigned Agent</h3>
            
            {agent ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-900 border border-white/[0.04] flex-shrink-0">
                    <img
                      src={agent.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={agent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{agent.name}</h4>
                    <p className="text-xxs text-neutral-400 line-clamp-1">{agent.bio || 'Certified Real Estate Broker'}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xxs text-neutral-500 border-t border-white/[0.03] pt-3">
                  <a href={`tel:${agent.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <Phone size={13} className="text-neutral-400" />
                    <span>{agent.phone}</span>
                  </a>
                  <a href={`mailto:${agent.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <Mail size={13} className="text-neutral-400" />
                    <span>{agent.email}</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-900 border border-white/[0.04] flex items-center justify-center text-cyan-400 flex-shrink-0 font-mono text-xs font-bold">
                    AE
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">AmaanEstate Support</h4>
                    <p className="text-xxs text-neutral-500">Corporate Brokerage Desk</p>
                  </div>
                </div>
                <div className="space-y-2 text-xxs text-neutral-500 border-t border-white/[0.03] pt-3">
                  <a href="tel:+251911000000" className="flex items-center gap-2 hover:text-white transition-colors">
                    <Phone size={13} />
                    <span>+251 911 000000</span>
                  </a>
                  <a href="mailto:info@amaanestate.com" className="flex items-center gap-2 hover:text-white transition-colors">
                    <Mail size={13} />
                    <span>info@amaanestate.com</span>
                  </a>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => toast.success('Agent chat session loading...')}
              className="w-full border-neutral-800 text-neutral-300 hover:text-white text-xs py-2 h-auto flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageSquare size={13} />
              <span>Message Agent</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
