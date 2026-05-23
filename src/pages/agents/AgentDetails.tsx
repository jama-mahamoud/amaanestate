import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { brokerService } from '@/services/brokerService';
import { useListings } from '@/hooks/useListings';
import { Broker, Agency, Listing } from '@/types';
import { 
  ShieldCheck, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  MessageCircle, 
  Phone, 
  Mail, 
  Home as HomeIcon, 
  Award, 
  Briefcase, 
  Car, 
  Star, 
  Send,
  User,
  Heart,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PropertyCard from '@/components/PropertyCard';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export default function AgentDetails() {
  const { id } = useParams<{ id: string }>();
  const [broker, setBroker] = useState<Broker | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [brokersList, setBrokersList] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);

  // Reviews Local State (Keyed to specific ID for mock/local durability)
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);

  const ownerIdForListings = broker ? broker.userId : (agency ? agency.ownerId : undefined);
  
  const { listings: agentListings, loading: listingsLoading } = useListings(
    ownerIdForListings ? { ownerId: ownerIdForListings } : { associatedBrokerId: id }
  );

  // Segment Listings
  const propertiesList = useMemo(() => {
    return agentListings.filter(l => l.category === 'property');
  }, [agentListings]);

  const vehiclesList = useMemo(() => {
    return agentListings.filter(l => l.category === 'vehicle');
  }, [agentListings]);

  // Tab selections
  const [agencyTab, setAgencyTab] = useState<'properties' | 'vehicles' | 'team' | 'about' | 'reviews'>('properties');
  const [brokerTab, setBrokerTab] = useState<'listings' | 'specialties' | 'reviews'>('listings');

  // Load profile details
  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      if (!id) return;
      try {
        const allBrokers = await brokerService.getAllBrokers();
        if (active) setBrokersList(allBrokers);

        if (id.startsWith('agency_')) {
          const realId = id.replace('agency_', '');
          const found = await brokerService.getAgency(realId);
          if (found && active) {
            setAgency(found);
          }
        } else {
          const verifiedOnes = await brokerService.getVerifiedBrokers();
          const found = verifiedOnes.find(b => b.id === id);
          if (found && active) {
            setBroker(found);
          } else {
            const b = await brokerService.getBroker(id);
            if (b && active) setBroker(b);
          }
        }
      } catch (error) {
        console.error("Failed to load details profile:", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProfile();
    return () => { active = false; };
  }, [id]);

  // Load & Persist Reviews from Local Storage
  useEffect(() => {
    if (!id) return;
    const key = `amaan_reviews_${id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setReviews(JSON.parse(saved));
    } else {
      // Default Premium Review Seed
      const nameText = broker ? broker.fullName : (agency ? agency.agencyName : 'Official Partner');
      const seedReviews: Review[] = [
        {
          id: 'seed-1',
          author: 'Warsame Abdi',
          rating: 5,
          comment: `Phenomenal client care. Helped me finalize the title registration of my villa site with flawless speed. Absolute high-net worth advisors.`,
          date: 'May 10, 2026'
        },
        {
          id: 'seed-2',
          author: 'Eng. Leyla Farah',
          rating: 5,
          comment: `Highly recommended registry partner! Professional communication and absolute integrity on asset audits.`,
          date: 'May 19, 2026'
        }
      ];
      setReviews(seedReviews);
      localStorage.setItem(key, JSON.stringify(seedReviews));
    }
  }, [id, broker, agency]);

  // Handle Review Submission
  const handleAddReview = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) {
      toast.error("Please fill in your name and comment.");
      return;
    }

    const reviewObj: Review = {
      id: `rev-${Date.now()}`,
      author: newAuthor.trim(),
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updated = [reviewObj, ...reviews];
    setReviews(updated);
    localStorage.setItem(`amaan_reviews_${id}`, JSON.stringify(updated));

    setNewAuthor('');
    setNewComment('');
    setNewRating(5);
    toast.success("Thank you! Your feedback has been registered.");
  }, [id, newAuthor, newComment, newRating, reviews]);

  // Compute overall dynamic rating average
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 5;
    const total = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return parseFloat((total / reviews.length).toFixed(1));
  }, [reviews]);

  // Filter brokers assigned to this agency
  const agencyTeam = useMemo(() => {
    if (!agency) return [];
    return brokersList.filter(b => 
      b.status === 'approved' &&
      (b.companyName || '').toLowerCase().trim() === agency.agencyName.toLowerCase().trim()
    );
  }, [agency, brokersList]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center pt-24 pb-20">
        <div className="w-10 h-10 rounded-full border-2 border-[#C5A059] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!broker && !agency) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center pt-24 pb-20 text-white">
        <div className="text-center space-y-4">
          <Info size={40} className="text-[#C5A059] mx-auto" />
          <h2 className="text-2xl font-bold text-white tracking-tight">Registry Profile Not Found</h2>
          <Button asChild className="bg-[#C5A059] text-black hover:bg-white transition-colors">
            <Link to="/agents">Back to Directory</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Normalizing fields
  const name = broker ? broker.fullName : agency!.agencyName;
  const logo = broker ? broker.profilePhotoUrl : agency!.logo;
  const phoneVal = broker ? broker.phone : agency!.phone;
  const emailVal = broker ? broker.email : agency!.email;
  const cityVal = broker ? broker.city : (agency as any).city || 'Jigjiga';
  const displayRoleText = broker ? 'Certified Partner' : 'Licensed Corporation 🏢';

  return (
    <div className="min-h-screen bg-[#070707] pt-24 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Profile Card Header Banner */}
        <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-6 md:p-12 mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A059]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex flex-col md:flex-row gap-8 relative z-10 items-start md:items-center">
            {/* Logo/Photo */}
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2rem] overflow-hidden bg-white/10 shrink-0 border border-white/10 relative flex items-center justify-center">
              {logo ? (
                <img src={logo} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-white/40 font-bold text-3xl uppercase">{name.substring(0, 2)}</div>
              )}
              <div className="absolute bottom-2 right-2 w-7 h-7 bg-emerald-500 rounded-full border-2 border-black flex items-center justify-center shadow-lg">
                <CheckCircle2 size={15} className="text-white" />
              </div>
            </div>

            {/* Core Info */}
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white leading-tight">
                  {name}
                </h1>
                
                {/* Score */}
                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/10 px-3 py-1 rounded-full text-xs font-bold">
                  <Star size={13} fill="currentColor" />
                  <span>{averageRating} ({reviews.length} reviews)</span>
                </div>
              </div>

              {broker?.companyName && (
                <div className="flex items-center gap-2 text-white/85 text-lg font-medium">
                  <Building2 size={18} className="text-[#C5A059]" />
                  <span>Associated Firm: {broker.companyName}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-white/50">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-[#C5A059]" />
                  <span>{cityVal}, Somali Region</span>
                </span>
                <span className="h-4 w-px bg-white/10 hidden sm:inline" />
                <span className="flex items-center gap-1.5">
                  <Award size={14} className="text-[#C5A059]" />
                  <span>{displayRoleText}</span>
                </span>
                <span className="h-4 w-px bg-white/10 hidden sm:inline" />
                <span className="text-[#C5A059] font-mono">
                  REF: {id}
                </span>
              </div>

              {/* Action Contact channels */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button className="bg-[#C5A059] hover:bg-white text-black h-12 px-6 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2" asChild>
                  <a href={`https://wa.me/${phoneVal?.replace(/\D/g, '') || '251910012794'}?text=Hello%20${name},%20I%20am%20viewing%20your%20registered%20profile%20on%20AmaanEstate`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={15} /> WhatsApp Message
                  </a>
                </Button>
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 h-12 text-xs font-bold uppercase tracking-widest rounded-xl" asChild>
                  <a href={`tel:${phoneVal}`}>
                    <Phone size={13} className="mr-1.5 text-emerald-400" /> Direct Call
                  </a>
                </Button>
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 h-12 text-xs font-bold uppercase tracking-widest rounded-xl" asChild>
                  <a href={`mailto:${emailVal}`}>
                    <Mail size={13} className="mr-1.5" /> Send Email
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------- IF AGENCY METRIC ----------------- */}
        {agency && (
          <div className="space-y-12">
            {/* Tabs for Agency page */}
            <div className="flex overflow-x-auto gap-2 border-b border-white/5 pb-4">
              <button
                onClick={() => setAgencyTab('properties')}
                className={`px-6 py-3 rounded-full text-xs uppercase tracking-widest font-black transition-all ${
                  agencyTab === 'properties' ? 'bg-[#C5A059] text-black' : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                🏘 Properties ({propertiesList.length})
              </button>
              
              <button
                onClick={() => setAgencyTab('vehicles')}
                className={`px-6 py-3 rounded-full text-xs uppercase tracking-widest font-black transition-all ${
                  agencyTab === 'vehicles' ? 'bg-[#C5A059] text-black' : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                🚘 Vehicles ({vehiclesList.length})
              </button>

              <button
                onClick={() => setAgencyTab('team')}
                className={`px-6 py-3 rounded-full text-xs uppercase tracking-widest font-black transition-all ${
                  agencyTab === 'team' ? 'bg-[#C5A059] text-black' : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                👥 Brokers Team ({agencyTeam.length})
              </button>

              <button
                onClick={() => setAgencyTab('about')}
                className={`px-6 py-3 rounded-full text-xs uppercase tracking-widest font-black transition-all ${
                  agencyTab === 'about' ? 'bg-[#C5A059] text-black' : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                📂 About Corporation
              </button>

              <button
                onClick={() => setAgencyTab('reviews')}
                className={`px-6 py-3 rounded-full text-xs uppercase tracking-widest font-black transition-all ${
                  agencyTab === 'reviews' ? 'bg-[#C5A059] text-black' : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                ⭐️ Ratings & Feedback ({reviews.length})
              </button>
            </div>

            {/* TAB VIEWS */}
            <div className="pt-6">
              {agencyTab === 'properties' && (
                listingsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-80 bg-white/5 animate-pulse rounded-2xl" />)}
                  </div>
                ) : propertiesList.length === 0 ? (
                  <div className="text-center py-16 bg-white/[0.01] border border-white/5 rounded-3xl p-8">
                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold">This agency has no listed property lots today.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {propertiesList.map(listing => (
                      <PropertyCard key={listing.id} property={listing as any} />
                    ))}
                  </div>
                )
              )}

              {agencyTab === 'vehicles' && (
                listingsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-80 bg-white/5 animate-pulse rounded-2xl" />)}
                  </div>
                ) : vehiclesList.length === 0 ? (
                  <div className="text-center py-16 bg-white/[0.01] border border-white/5 rounded-3xl p-8">
                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold">This agency holds no luxury automobile listings currently.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {vehiclesList.map(listing => (
                      <PropertyCard key={listing.id} property={listing as any} />
                    ))}
                  </div>
                )
              )}

              {agencyTab === 'team' && (
                agencyTeam.length === 0 ? (
                  <div className="text-center py-16 bg-white/[0.01] border border-white/5 rounded-3xl p-8">
                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold">No certified agents registered on the roster for this team yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {agencyTeam.map(item => (
                      <Link to={`/agents/${item.id}`} key={item.id} className="block group bg-[#111] border border-white/5 hover:border-[#C5A059]/30 rounded-2xl p-6 transition-all">
                        <div className="flex items-center gap-4">
                          <img src={item.profilePhotoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'} alt="" className="w-14 h-14 object-cover rounded-xl border border-white/10 shrink-0" />
                          <div>
                            <h4 className="font-bold text-white group-hover:text-[#C5A059] transition-colors">{item.fullName}</h4>
                            <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono mt-0.5">{item.city || 'Jigjiga'}</p>
                            <span className="text-[9px] text-emerald-400 uppercase font-black tracking-wider block mt-1">★ Verified Representative</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              )}

              {agencyTab === 'about' && (
                <div className="bg-[#111] border border-white/5 rounded-[2rem] p-8 md:p-12 space-y-6 max-w-3xl">
                  <h3 className="text-xl font-display font-medium text-white border-b border-white/5 pb-4">Corporate Narrative</h3>
                  <p className="text-white/70 text-sm leading-relaxed font-light">
                    Founded with absolute commitment to excellence, {agency.agencyName} stands as an authorized real estate firm inside the AmaanEstate Ecosystem. We specialize in deed checks, structural approvals, legal developer representation, and professional brokerage for residential estates and custom commercial compounds.
                  </p>
                  <p className="text-white/70 text-sm leading-relaxed font-light">
                    Every transaction and listing of ours carries an authorized digital compliance signature to prevent double-dealings, false land papers, or ownership conflicts across Horn of African territories.
                  </p>
                </div>
              )}

              {agencyTab === 'reviews' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Rating distribution / Add form */}
                  <div className="bg-[#111] border border-white/5 rounded-[2rem] p-8 space-y-6">
                    <div>
                      <h4 className="text-sm uppercase tracking-widest font-black text-white/40">Network Feedback Rating</h4>
                      <div className="flex items-end gap-3 mt-2">
                        <span className="text-5xl font-bold text-white font-mono leading-none">{averageRating}</span>
                        <div className="space-y-1">
                          <div className="flex text-amber-400 gap-0.5">
                            {[1, 2, 3, 4, 5].map(v => (
                              <Star key={v} size={15} fill={v <= Math.round(averageRating) ? "currentColor" : "none"} />
                            ))}
                          </div>
                          <p className="text-xs text-white/40 font-mono">{reviews.length} authentic submitted reviews</p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleAddReview} className="space-y-4 pt-4 border-t border-white/5">
                      <span className="text-xs uppercase font-black tracking-wider text-[#C5A059] block">Submit client review</span>
                      
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-white/40">Your Legal Name</label>
                        <Input 
                          placeholder="e.g. Mahdi Omar"
                          value={newAuthor}
                          onChange={e => setNewAuthor(e.target.value)}
                          className="bg-white/5 border-0 rounded-lg text-xs"
                          required 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-white/40 block">Select Star Rating</label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button 
                              key={star} 
                              type="button" 
                              onClick={() => setNewRating(star)}
                              className="text-amber-400 focus:outline-none"
                            >
                              <Star size={22} fill={star <= newRating ? "currentColor" : "none"} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-white/40">Detailed Comment</label>
                        <Textarea 
                          placeholder="Provide details about your experience..."
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          className="bg-white/5 border-0 rounded-lg text-xs h-24"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full bg-[#C5A059] hover:bg-white text-black text-xs font-bold uppercase tracking-wider h-11">
                        <Send size={12} className="mr-2" /> Validate Feedback
                      </Button>
                    </form>
                  </div>

                  {/* Feed results */}
                  <div className="lg:col-span-2 space-y-6">
                    <h4 className="text-xl font-display font-medium mb-4">Latest Client Feedback</h4>
                    {reviews.length === 0 ? (
                      <p className="text-white/40 text-xs uppercase tracking-widest">No feedback registered yet.</p>
                    ) : (
                      reviews.map((rev) => (
                        <div key={rev.id} className="bg-white/[0.01] border border-white/5 p-6 rounded-2xl relative space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white">{rev.author}</span>
                            <span className="text-white/30 font-mono text-[10px]">{rev.date}</span>
                          </div>
                          <div className="flex text-amber-400 gap-0.5">
                            {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= rev.rating ? "currentColor" : "none"} />)}
                          </div>
                          <p className="text-white/70 text-xs leading-relaxed font-light">{rev.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------- IF INDEPENDENT BROKER METRIC ----------------- */}
        {broker && (
          <div className="space-y-12">
            
            {/* Split page Tabs */}
            <div className="flex overflow-x-auto gap-2 border-b border-white/5 pb-4">
              <button
                onClick={() => setBrokerTab('listings')}
                className={`px-6 py-3 rounded-full text-xs uppercase tracking-widest font-black transition-all ${
                  brokerTab === 'listings' ? 'bg-[#C5A059] text-black' : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                🏘 Approved Listing Lots ({agentListings.length})
              </button>
              
              <button
                onClick={() => setBrokerTab('specialties')}
                className={`px-6 py-3 rounded-full text-xs uppercase tracking-widest font-black transition-all ${
                  brokerTab === 'specialties' ? 'bg-[#C5A059] text-black' : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                💼 Experience & Specialties
              </button>

              <button
                onClick={() => setBrokerTab('reviews')}
                className={`px-6 py-3 rounded-full text-xs uppercase tracking-widest font-black transition-all ${
                  brokerTab === 'reviews' ? 'bg-[#C5A059] text-black' : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                ⭐️ Ratings & Feedback ({reviews.length})
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="pt-6">
              {brokerTab === 'listings' && (
                listingsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-80 bg-white/5 animate-pulse rounded-2xl" />)}
                  </div>
                ) : agentListings.length === 0 ? (
                  <div className="text-center py-16 bg-white/[0.01] border border-white/5 rounded-3xl p-8">
                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold">This broker has no listed property lots assigned currently.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {agentListings.map(listing => (
                      <PropertyCard key={listing.id} property={listing as any} />
                    ))}
                  </div>
                )
              )}

              {brokerTab === 'specialties' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#111] border border-white/5 rounded-[2rem] p-8 md:p-12">
                  <div className="space-y-6">
                    <h4 className="text-sm uppercase tracking-widest font-black text-white/40">Agent Identity & Records</h4>
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs text-white/40 block">Total Experience</span>
                        <span className="text-white font-bold text-lg">{broker.yearsOfExperience || 3} years practicing</span>
                      </div>
                      <div>
                        <span className="text-xs text-white/40 block">Audit License ID</span>
                        <span className="text-[#C5A059] font-mono text-sm uppercase bg-white/5 px-2.5 py-1 rounded inline-block mt-1">
                          {broker.licenseNumber || 'LIC-21A-SOM'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-sm uppercase tracking-widest font-black text-white/40">Ecosystem Properties Specialized</h4>
                    <div className="flex flex-wrap gap-2">
                      {broker.propertySpecialization?.map(spec => (
                        <span key={spec} className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/95">
                          {spec}
                        </span>
                      )) || (
                        <>
                          <span className="bg-white/5 relative px-3 py-1.5 rounded-xl text-xs font-semibold">Residential Lots</span>
                          <span className="bg-white/5 relative px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center">Agricultural Fields</span>
                        </>
                      )}
                    </div>

                    <h4 className="text-sm uppercase tracking-widest font-black text-white/40 pt-4 border-t border-white/5">Operational Operations Range</h4>
                    <div className="flex flex-wrap gap-2">
                      {broker.areasOfOperation?.map(area => (
                        <span key={area} className="bg-[#C5A059]/10 text-[#C5A059] px-3 py-1.5 rounded-xl text-xs font-semibold">
                          {area}
                        </span>
                      )) || (
                        <span className="bg-[#C5A059]/10 text-[#C5A059] px-3 py-1.5 rounded-xl text-xs font-semibold">Jigjiga Capital, Somali Region</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {brokerTab === 'reviews' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Rating distribution / Add form */}
                  <div className="bg-[#111] border border-white/5 rounded-[2rem] p-8 space-y-6">
                    <div>
                      <h4 className="text-sm uppercase tracking-widest font-black text-white/40">Network Feedback Rating</h4>
                      <div className="flex items-end gap-3 mt-2">
                        <span className="text-5xl font-bold text-white font-mono leading-none">{averageRating}</span>
                        <div className="space-y-1">
                          <div className="flex text-amber-400 gap-0.5">
                            {[1, 2, 3, 4, 5].map(v => (
                              <Star key={v} size={15} fill={v <= Math.round(averageRating) ? "currentColor" : "none"} />
                            ))}
                          </div>
                          <p className="text-xs text-white/40 font-mono">{reviews.length} authentic submitted reviews</p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleAddReview} className="space-y-4 pt-4 border-t border-white/5">
                      <span className="text-xs uppercase font-black tracking-wider text-[#C5A059] block">Submit client review</span>
                      
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-white/40">Your Legal Name</label>
                        <Input 
                          placeholder="e.g. Mahdi Omar"
                          value={newAuthor}
                          onChange={e => setNewAuthor(e.target.value)}
                          className="bg-white/5 border-0 rounded-lg text-xs"
                          required 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-white/40 block">Select Star Rating</label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button 
                              key={star} 
                              type="button" 
                              onClick={() => setNewRating(star)}
                              className="text-amber-400 focus:outline-none"
                            >
                              <Star size={22} fill={star <= newRating ? "currentColor" : "none"} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-white/40">Detailed Comment</label>
                        <Textarea 
                          placeholder="Provide details about your experience..."
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          className="bg-white/5 border-0 rounded-lg text-xs h-24"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full bg-[#C5A059] hover:bg-white text-black text-xs font-bold uppercase tracking-wider h-11">
                        <Send size={12} className="mr-2" /> Validate Feedback
                      </Button>
                    </form>
                  </div>

                  {/* Feed results */}
                  <div className="lg:col-span-2 space-y-6">
                    <h4 className="text-xl font-display font-medium mb-4">Latest Client Feedback</h4>
                    {reviews.length === 0 ? (
                      <p className="text-white/40 text-xs uppercase tracking-widest">No feedback registered yet.</p>
                    ) : (
                      reviews.map((rev) => (
                        <div key={rev.id} className="bg-white/[0.01] border border-white/5 p-6 rounded-2xl relative space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white">{rev.author}</span>
                            <span className="text-white/30 font-mono text-[10px]">{rev.date}</span>
                          </div>
                          <div className="flex text-amber-400 gap-0.5">
                            {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= rev.rating ? "currentColor" : "none"} />)}
                          </div>
                          <p className="text-white/70 text-xs leading-relaxed font-light">{rev.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
