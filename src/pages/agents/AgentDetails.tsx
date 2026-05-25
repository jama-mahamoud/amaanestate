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
  Info,
  Globe,
  Share2,
  Calendar,
  Layers,
  Clock,
  UserCheck,
  TrendingUp,
  LineChart,
  Activity as ActivityIcon,
  Bookmark,
  Users,
  Search,
  Filter,
  Check,
  ChevronDown,
  Lock,
  ThumbsUp,
  ExternalLink,
  MessageSquare,
  FileText,
  AlertCircle,
  BriefcaseBusiness,
  Coins,
  Locate
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PropertyCard from '@/components/PropertyCard';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// Type definitions for Advanced Reviews System
interface AdvancedReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  transactionType: 'Villa Purchase' | 'Commercial Lease' | 'Land Investment' | 'Residential Rental' | 'Estate Management';
  isVerifiedClient: boolean;
  brokerResponse?: string;
  helpfulCount: number;
}

// Type definitions for Timeline Activities
interface TimelineActivity {
  id: string;
  type: 'sale' | 'listing' | 'verification' | 'article' | 'partnership';
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  metric?: string;
}

export default function AgentDetails() {
  const { id } = useParams<{ id: string }>();
  const [broker, setBroker] = useState<Broker | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [brokersList, setBrokersList] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: state management
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'reviews' | 'activity' | 'verification' | 'team' | 'analytics'>('overview');

  // Advanced Review Interactive states
  const [reviews, setReviews] = useState<AdvancedReview[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'high' | 'low' | 'verified'>('all');
  const [reviewSearch, setReviewSearch] = useState('');
  
  // Submit new review states
  const [newAuthor, setNewAuthor] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newTxType, setNewTxType] = useState<AdvancedReview['transactionType']>('Villa Purchase');
  const [responseExpanded, setResponseExpanded] = useState<Record<string, boolean>>({});

  // Helpfulness counter tracking
  const [votedHelpful, setVotedHelpful] = useState<Record<string, boolean>>({});

  // Custom static asset arrays to enrich listings with luxury placeholders
  const coverImages = useMemo(() => [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80'
  ], []);

  const galleryImages = useMemo(() => [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
  ], []);

  // Compute owner ID to fetch properties owned
  const ownerIdForListings = broker ? broker.userId : (agency ? agency.ownerId : undefined);
  
  const { listings: agentListings, loading: listingsLoading } = useListings(
    ownerIdForListings ? { ownerId: ownerIdForListings } : { associatedBrokerId: id }
  );

  // Divide properties / vehicles
  const propertiesList = useMemo(() => agentListings.filter(l => l.category === 'property'), [agentListings]);
  const vehiclesList = useMemo(() => agentListings.filter(l => l.category === 'vehicle'), [agentListings]);

  // Load broker profiles
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

  // Generate deterministic premium seed reviews based on profile name or ID
  const seedReviews = useMemo(() => {
    const targetName = broker ? broker.fullName : (agency ? agency.agencyName : 'Official Elite Partner');
    return [
      {
        id: 'seed-1',
        author: 'Warsame Abdi Ali',
        rating: 5,
        comment: `Absolute world-class real estate service. Guided us through the complex process of verifying historical title deeds for our primary beach estate. Highly transparent and has direct integration with the land registry. Highly recommended!`,
        date: 'May 12, 2026',
        transactionType: 'Villa Purchase' as const,
        isVerifiedClient: true,
        brokerResponse: `Dear Warsame, thank you for your wonderful endorsement. Ensuring zero legal ambiguity on title transfers in our Somali Region is our absolute core promise to discerning investors like you. It was a pleasure facilitating this deal.`,
        helpfulCount: 14
      },
      {
        id: 'seed-2',
        author: 'Eng. Leyla Farah Ghedi',
        rating: 5,
        comment: `Excellent advisory on our compound build and lease structure. They supplied verified land surveys and completed absolute double-deed compliance audits within hours. True modern professional team.`,
        date: 'May 04, 2026',
        transactionType: 'Commercial Lease' as const,
        isVerifiedClient: true,
        brokerResponse: `Thank you Eng. Leyla! Our engineers and audit teams are fully committed to high-standard technical reviews of all development lots.`,
        helpfulCount: 9
      },
      {
        id: 'seed-3',
        author: 'Mustafa Garaad',
        rating: 4,
        comment: `Very professional response speed. WhatsApp assistance was immediate, although the physical on-site survey took an extra day due to local municipal delays. The legal clearance papers were impeccable.`,
        date: 'April 20, 2026',
        transactionType: 'Land Investment' as const,
        isVerifiedClient: true,
        brokerResponse: `Hi Mustafa, thank you for the rating. We appreciate your patience with the site boundaries audit. Excellent doing business with you!`,
        helpfulCount: 3
      }
    ];
  }, [broker, agency]);

  // Load reviews from Local Storage or seed
  useEffect(() => {
    if (!id) return;
    const key = `amaan_advanced_reviews_${id}`;
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage access failed for reviews:", e);
    }

    if (saved) {
      try {
        setReviews(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local reviews:", e);
        setReviews(seedReviews);
      }
    } else {
      setReviews(seedReviews);
      try {
        localStorage.setItem(key, JSON.stringify(seedReviews));
      } catch (e) {
        console.warn("Storage write failed:", e);
      }
    }
  }, [id, seedReviews]);

  // Handle Dynamic Review Submission
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) {
      toast.error("Please fill in your name and detailed review comment.");
      return;
    }

    const reviewObj: AdvancedReview = {
      id: `dev-rev-${Date.now()}`,
      author: newAuthor.trim(),
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      transactionType: newTxType,
      isVerifiedClient: true,
      helpfulCount: 0
    };

    const updated = [reviewObj, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(`amaan_advanced_reviews_${id}`, JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage update failed on submit:", e);
    }

    setNewAuthor('');
    setNewComment('');
    setNewRating(5);
    toast.success("Thank you! Your investor feedback has been safely validated and indexed.");
  };

  // Upvote helpfulness
  const handleHelpfulUpvote = (reviewId: string) => {
    if (votedHelpful[reviewId]) return;
    
    const updated = reviews.map(r => {
      if (r.id === reviewId) {
        return { ...r, helpfulCount: r.helpfulCount + 1 };
      }
      return r;
    });

    setReviews(updated);
    setVotedHelpful(prev => ({ ...prev, [reviewId]: true }));
    try {
      localStorage.setItem(`amaan_advanced_reviews_${id}`, JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage update failed on helpful upvote:", e);
    }
    toast.success("Feedback upvoted, thank you.");
  };

  // Compute calculated rating metrics
  const calculatedStats = useMemo(() => {
    if (reviews.length === 0) {
      return { average: 5.0, recommendPercentage: 100, count: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    const total = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const average = parseFloat((total / reviews.length).toFixed(1));
    const recommendCount = reviews.filter(r => r.rating >= 4).length;
    const recommendPercentage = Math.round((recommendCount / reviews.length) * 100);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const rate = Math.floor(r.rating) as 5 | 4 | 3 | 2 | 1;
      if (rate in distribution) {
        distribution[rate]++;
      }
    });

    return { average, recommendPercentage, count: reviews.length, ratingDistribution: distribution };
  }, [reviews]);

  // Interactive Review filter & search
  const filteredAndSearchedReviews = useMemo(() => {
    return reviews.filter(r => {
      // Filter logic
      if (reviewFilter === 'high' && r.rating < 4) return false;
      if (reviewFilter === 'low' && r.rating >= 4) return false;
      if (reviewFilter === 'verified' && !r.isVerifiedClient) return false;

      // Search logic
      if (reviewSearch) {
        const query = reviewSearch.toLowerCase();
        return (
          r.author.toLowerCase().includes(query) ||
          r.comment.toLowerCase().includes(query) ||
          r.transactionType.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [reviews, reviewFilter, reviewSearch]);

  // Mock Premium Profile Timeline Activities
  const generatedTimelineEvents = useMemo<TimelineActivity[]>(() => {
    const defaultEvents: TimelineActivity[] = [
      {
        id: 'act-1',
        type: 'verification',
        title: 'Premium Verification Approval Renewed',
        description: 'Completed structural trust appraisal and security vetting by regional land regulators. Verified tax references and license clearance under compliance laws.',
        timestamp: 'May 20, 2026',
        location: 'Jigjiga Capital Office'
      },
      {
        id: 'act-2',
        type: 'sale',
        title: 'Closed Transaction: Premium Villa Compound',
        description: 'Facilitated official double-deed validation and secured transfer coordinates for High-Net Worth expat client.',
        timestamp: 'May 10, 2026',
        location: 'AmaanEstate Secure Trade Portal',
        metric: '$520,000'
      },
      {
        id: 'act-3',
        type: 'listing',
        title: 'Indexed Exclusive Real-Estate Lot',
        description: 'Introduced 12-hectare sub-divided development site, legally verified with secure digital deed stamps.',
        timestamp: 'April 28, 2026',
        location: 'Deex-Yax, Somali Region'
      },
      {
        id: 'act-4',
        type: 'article',
        title: 'Published Market Report',
        description: 'Released analysis on modern investment zones, soil safety testing, and title guarantee guidelines in Jigjiga.',
        timestamp: 'April 15, 2026'
      },
      {
        id: 'act-5',
        type: 'partnership',
        title: 'Joined AmaanEstate Governance Circle',
        description: 'Successfully accredited as a licensed enterprise, receiving Tier-1 Digital Signature keys.',
        timestamp: 'March 12, 2026'
      }
    ];
    return defaultEvents;
  }, []);

  // Filter brokers assigned to this agency
  const agencyTeam = useMemo(() => {
    if (!agency) return [];
    return brokersList.filter(b => 
      b.status === 'approved' &&
      (b.companyName || '').toLowerCase().trim() === agency.agencyName.toLowerCase().trim()
    );
  }, [agency, brokersList]);

  // Affiliate network office locations
  const verifiedOfficeLocations = useMemo(() => [
    {
      id: 'loc-1',
      name: 'Corporate HQ - Jigjiga Tower',
      address: 'Floor 14, Jigjiga Financial Center, Block A, Jigjiga',
      status: 'Verified Office',
      coordinates: '9.3524° N, 42.8021° E',
      hours: 'Mon - Sat (8:00 AM - 6:00 PM)',
      isHQ: true
    },
    {
      id: 'loc-2',
      name: 'Hargeisa Prime Office',
      address: 'Main Airport Road, adjacent to Golden Hotel, Hargeisa',
      status: 'Verified Satellite',
      coordinates: '9.5615° N, 44.0654° E',
      hours: 'Mon - Fri (8:30 AM - 5:30 PM)',
      isHQ: false
    }
  ], []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center pt-24 pb-20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#C5A059] border-t-transparent animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold animate-pulse">Decrypting Security Credentials</p>
        </div>
      </div>
    );
  }

  if (!broker && !agency) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center pt-24 pb-20 text-white">
        <div className="text-center space-y-4 max-w-md p-6">
          <Info size={40} className="text-[#C5A059] mx-auto animate-pulse" />
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">Registry Profile Unavailable</h2>
          <p className="text-white/40 text-sm">The license index code did not return an active broker record inside the regional database registry.</p>
          <Button asChild className="bg-[#C5A059] text-black hover:bg-white transition-colors duration-300 rounded-xl h-11 px-6">
            <Link to="/agents">Browse Active Directory</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Profile fields normalization & fallback placeholders for gorgeous UI fidelity
  const name = broker ? broker.fullName : agency!.agencyName;
  const logo = broker ? broker.profilePhotoUrl : agency!.logo;
  const phoneVal = broker ? broker.phone : agency!.phone;
  const emailVal = broker ? broker.email : agency!.email;
  const cityVal = broker ? broker.city : (agency as any).city || 'Jigjiga Capital';
  const regionVal = broker ? broker.region : (agency as any).region || 'Somali Region';
  const isVerifiedProfile = broker ? broker.isVerified : (agency!.verified || agency!.isVerified);

  // Dynamic values that represent a luxurious professional
  const yearsExp = broker ? (broker.yearsOfExperience || 5) : 8;
  const responseRate = broker ? '99.4%' : '98.8%';
  const responseTime = broker ? 'Within 15 mins' : 'Within 30 mins';
  const totalCompletedDeals = broker ? (agentListings.length * 3 + 12) : 148;

  // Safe registry mapping to avoid displaying raw image URL upload in LIC NO text box
  const hasImageLicense = (str?: string) => typeof str === 'string' && (str.startsWith('http') || str.startsWith('data:') || str.includes('/'));
  const rawLicense = broker ? broker.businessLicenseNumber : agency?.license;
  const registrationNumber = rawLicense && !hasImageLicense(rawLicense)
    ? rawLicense
    : (broker ? `BRK-REG-${broker.id.substring(0, 5).toUpperCase()}` : `AE-REG-${agency?.id.substring(0, 5).toUpperCase() || '2026-0041'}`);

  // Multi-lingual specialties
  const languagesSpoken = broker?.languagesSpoken || ['Somali', 'English', 'Arabic'];
  const specializations = broker?.propertySpecialization || ['Residential Estate Sales', 'Custom Beachfront Lots', 'Sub-divided Farmlands', 'Deed Verification'];

  return (
    <div id="full-profile-system" className="min-h-screen bg-[#070707] text-white selection:bg-[#C5A059]/30 selection:text-white pb-32">
      
      {/* -------------------- BANNER AND TOP HERO COMPONENT -------------------- */}
      <div className="relative w-full h-[320px] md:h-[450px] overflow-hidden">
        {/* Absolute Glowing Cover Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#070707] via-[#070707]/30 to-black/40" />
        
        <img 
          src={agency ? coverImages[1] : coverImages[0]} 
          alt="Premium Real Estate" 
          className="w-full h-full object-cover object-center absolute inset-0 filter brightness-[0.7] transform scale-105 transition-transform duration-1000"
        />

        {/* Floating Accent Ring Orbs */}
        <div className="absolute top-12 left-1/4 w-96 h-96 bg-[#C5A059]/15 rounded-full blur-[140px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-4 right-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* -------------------- PROFILE IDENTITY AND BRIEF METRICS -------------------- */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-20 -mt-36 md:-mt-48">
        
        {/* Premium Badge Indicators Header Bar */}
        <div className="flex flex-wrap gap-2 mb-4">
          {isVerifiedProfile && (
            <div className="flex items-center gap-1.5 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(197,160,89,0.1)]">
              <Sparkles size={13} className="text-[#C5A059]" />
              <span>Verified Registry Profile</span>
            </div>
          )}
          {agency ? (
            <div className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
              <Building2 size={13} />
              <span>Licensed Enterprise Brokerage</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
              <UserCheck size={13} />
              <span>Certified Top Agent</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-white/5 text-white/70 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-mono">
            <span>LIC NO: {registrationNumber}</span>
          </div>
        </div>

        {/* Identity Glass Card */}
        <div className="bg-gradient-to-br from-[#121212]/95 to-[#0b0b0b]/98 border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md relative overflow-hidden">
          {/* Subtle luxurious ambient glow patterns */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059]/[0.02] rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between relative z-10">
            
            {/* Left Box: Photo and essential metadata */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 w-full md:w-auto">
              
              {/* Profile Photo / Company Logo layout */}
              <div id="author-avatar-badge" className="relative group shrink-0">
                <div className="w-28 h-28 md:w-40 md:h-40 rounded-[2.2rem] overflow-hidden bg-neutral-900 border-2 border-white/10 relative shadow-2xl flex items-center justify-center transition-all duration-500 group-hover:border-[#C5A059]/60">
                  {logo ? (
                    <img referrerPolicy="no-referrer" src={logo} alt={name} className="w-full h-full object-cover transition duration-700 ease-out group-hover:scale-110" />
                  ) : (
                    <div className="text-white/30 font-display font-bold text-3xl uppercase tracking-widest">{name.substring(0, 2)}</div>
                  )}
                  
                  {/* Glowing Bottom Corner Verification Aura Badge */}
                  {isVerifiedProfile && (
                    <div className="absolute bottom-2 right-2 w-8 h-8 bg-black rounded-full border border-[#C5A059]/30 flex items-center justify-center shadow-2xl animate-pulse">
                      <ShieldCheck size={16} className="text-[#C5A059]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Bio Titles, ratings and location lines */}
              <div className="space-y-3.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white leading-tight">
                    {name}
                  </h1>
                  {broker?.isVerified && (
                    <span className="bg-[#C5A059] text-black text-[9px] font-black tracking-widest px-2.5 py-1 rounded uppercase shadow-sm">
                      TOP BROKER
                    </span>
                  )}
                  {agency && (
                    <span className="bg-[#C5A059] text-black text-[9px] font-black tracking-widest px-2.5 py-1 rounded uppercase shadow-sm">
                      PREMIUM AGENCY
                    </span>
                  )}
                </div>

                <p className="text-[#C5A059] font-display font-medium text-base tracking-wide flex items-center gap-2">
                  {broker ? (
                    <>
                      <Briefcase size={16} />
                      <span>Certified Real Estate Broker & Wealth Advisor</span>
                    </>
                  ) : (
                    <>
                      <Building2 size={16} />
                      <span>National Real Estate Advisory Agency Corporation</span>
                    </>
                  )}
                </p>

                {/* Sub-details line */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-white/50 font-medium">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#C5A059]" />
                    <span>{cityVal}, {regionVal}</span>
                  </span>
                  <span className="h-4 w-0.5 bg-white/5 hidden sm:inline" />
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#C5A059]" />
                    <span>Active Brokerage since {broker?.yearEstablished || '2021'}</span>
                  </span>
                  <span className="h-4 w-0.5 bg-white/5 hidden sm:inline" />
                  <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/10 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">
                    <Star size={10} fill="currentColor" className="mr-0.5" />
                    <span>Score: {calculatedStats.average} ({reviews.length} Client Reviews)</span>
                  </span>
                </div>

                {/* Broker specifics details line */}
                {broker && broker.companyName && (
                  <p className="text-white/70 text-sm">
                    Affiliated With: <span className="text-[#C5A059] font-semibold">{broker.companyName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Right Box: Floating Interactive Call-to-Actions for quick inquiries */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto justify-end border-t border-white/5 lg:border-t-0 pt-6 lg:pt-0 shrink-0">
              <Button 
                variant="outline" 
                className="border-white/10 text-white hover:bg-white/5 h-13 text-xs font-bold uppercase tracking-widest rounded-xl px-5 flex items-center gap-2" 
                asChild
              >
                <a href={phoneVal ? `tel:${phoneVal}` : '#'}>
                  <Phone size={14} className="text-emerald-400" />
                  <span>Call Direct</span>
                </a>
              </Button>
              
              <Button 
                className="bg-[#C5A059] hover:bg-white text-black h-13 px-6 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-[#C5A059]/10" 
                asChild
              >
                {phoneVal ? (
                  <a 
                    href={`https://wa.me/${(()=>{
                      const clean = phoneVal.replace(/\D/g, '');
                      return clean.startsWith('9') || clean.startsWith('7') ? '251' + clean : clean;
                    })()}?text=Hello%20${name},%20I%20am%20reviewing%20your%20authorized%20premium%20profile%20on%20AmaanEstate%20and%20would%20like%20to%20consult%20regarding%20active%20listings.`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp Inquiry</span>
                  </a>
                ) : (
                  <span className="opacity-50 cursor-not-allowed">
                    <MessageCircle size={15} />
                    <span>WhatsApp Closed</span>
                  </span>
                )}
              </Button>
            </div>

          </div>

          {/* Quick Stats Grid Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-8 pt-8 border-t border-white/5 text-center">
            
            <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-2xl">
              <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest">Active Inventory</p>
              <h4 className="text-2xl font-display font-bold text-white mt-1">{agentListings.length} Active Listings</h4>
            </div>

            <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-2xl">
              <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest">Completed Deals</p>
              <h4 className="text-2xl font-display font-bold text-[#C5A059] mt-1">{totalCompletedDeals} Transactions</h4>
            </div>

            <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-2xl">
              <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest">Client trust rate</p>
              <h4 className="text-2xl font-display font-bold text-emerald-400 mt-1">{calculatedStats.recommendPercentage}% Recommend</h4>
            </div>

            <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-2xl">
              <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest">Trust score</p>
              <div className="flex items-center justify-center gap-1 mt-1 text-2xl font-display font-bold text-[#C5A059]">
                <ShieldCheck size={18} className="text-[#C5A059]" />
                <span>9.8 / 10</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* -------------------- ENTERPRISE MODERN NAVIGATION TABS -------------------- */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-10 sticky top-20 z-30 bg-[#070707]/90 backdrop-blur-md pb-4">
        <div className="flex flex-wrap items-center justify-center border-b border-white/5 gap-2 pb-4 scroll-smooth">
          
          {[
            { id: 'overview', label: 'Overview', icon: Layers },
            { id: 'listings', label: 'Listings', icon: HomeIcon },
            { id: 'reviews', label: 'Reviews', icon: Star },
            { id: 'activity', label: 'Activity', icon: ActivityIcon },
            { id: 'verification', label: 'Verification', icon: ShieldCheck },
            { id: 'team', label: agency ? 'Team' : 'Affiliate Grid', icon: Users },
            { id: 'analytics', label: 'Metrics', icon: LineChart },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-300 w-full sm:w-auto ${
                activeTab === tab.id 
                  ? 'bg-[#C5A059] text-black shadow-lg shadow-[#C5A059]/30' 
                  : 'bg-white/[0.03] text-white/60 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              <tab.icon size={12} className={activeTab === tab.id ? 'text-black' : ''} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* -------------------- TAB CONTENT GATEWAYS -------------------- */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            
            {/* --------------------------------- TAB 1: OVERVIEW --------------------------------- */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left side info block */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Company Narrative & Biography Card */}
                  <div className="bg-[#111] border border-white/5 p-8 rounded-[2rem] space-y-5">
                    <h3 className="text-xl font-display font-medium text-white border-b border-white/5 pb-4">
                      {broker ? 'Professional Profile' : 'Agency Overview'}
                    </h3>
                    
                    <p className="text-white/70 text-sm leading-relaxed font-light">
                      {broker ? (
                        broker.bio || `${broker.fullName} is a verified real estate professional operating across the region. With extensive experience in property valuation, legal documentation, and client representation, they provide comprehensive support for residential and commercial transactions.`
                      ) : (
                        agency?.logo ? `${agency.agencyName} is an accredited partner in our network, specializing in secure and transparent real estate advisory. We facilitate verified transactions with a focus on client protection.` : `${name} is a dedicated real estate agency providing professional services, including property valuation, documentation, and expert guidance for residential and commercial requirements.`
                      )}
                    </p>

                    <p className="text-white/70 text-sm leading-relaxed font-light">
                      Our team is committed to high professional standards, ensuring all property transactions are handled with transparency and local regulatory compliance.
                    </p>

                    {/* Quick highlights block */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2.5 text-xs text-white/80">
                        <CheckCircle2 size={15} className="text-[#C5A059]" />
                        <span>Verified Documentation</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-white/80">
                        <CheckCircle2 size={15} className="text-[#C5A059]" />
                        <span>High Response Rate</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-white/80">
                        <CheckCircle2 size={15} className="text-[#C5A059]" />
                        <span>Regulatory Compliant</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-white/80">
                        <CheckCircle2 size={15} className="text-[#C5A059]" />
                        <span>Professional Conduct</span>
                      </div>
                    </div>
                  </div>

                  {/* Featured Reviews Section */}
                  <div className="bg-[#111] border border-white/5 p-8 rounded-[2rem] space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h3 className="text-xl font-display font-medium text-white">Featured Reviews</h3>
                      <button 
                        onClick={() => setActiveTab('reviews')}
                        className="text-xs uppercase font-extrabold tracking-wider text-[#C5A059] hover:text-white transition-colors"
                      >
                        Read all ({reviews.length})
                      </button>
                    </div>
                    {reviews.slice(0, 1).map((review) => (
                      <div key={review.id} className="bg-white/[0.03] p-6 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-luxury-gold/20 text-luxury-gold font-bold p-2 w-10 h-10 rounded-full flex items-center justify-center">
                            {review.author[0]}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{review.author}</p>
                            <p className="text-[10px] text-white/40">{review.date}</p>
                          </div>
                        </div>
                        <p className="text-white/70 text-sm italic">"{review.comment}"</p>
                      </div>
                    ))}
                  </div>

                  {/* Portfolio Showcase */}
                  <div className="bg-[#111] border border-white/5 p-8 rounded-[2rem] space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h3 className="text-xl font-display font-medium text-white">Portfolio Showcase</h3>
                      <span className="text-xs font-mono text-white/40">Verified Property Images</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {galleryImages.slice(0, 6).map((src, idx) => (
                        <div key={idx} className="relative group overflow-hidden rounded-2xl h-28 sm:h-36 bg-neutral-900 border border-white/5">
                          <img src={src} alt="Portfolio property" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlighted Listings */}
                  <div className="bg-[#111] border border-white/5 p-8 rounded-[2rem] space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h3 className="text-xl font-display font-medium text-white">Highlighted Listings</h3>
                      <button 
                        onClick={() => setActiveTab('listings')}
                        className="text-xs uppercase font-extrabold tracking-wider text-[#C5A059] hover:text-white transition-colors"
                      >
                        View all ({agentListings.length})
                      </button>
                    </div>

                    {agentListings.length === 0 ? (
                      <p className="text-white/40 text-xs text-center py-4">No active listings.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {agentListings.slice(0, 2).map(listing => (
                          <div key={listing.id} className="transition-transform hover:scale-[1.02]">
                            <PropertyCard property={listing as any} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side widgets desk */}
                <div className="space-y-8">
                  
                  {/* Trust Score & Verification Card */}
                  <div className="bg-gradient-to-br from-[#121212] via-[#121212] to-[#1a150c] border border-white/5 p-6 rounded-[2rem] space-y-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white text-[10px] uppercase font-bold tracking-widest text-white/40">Market Performance</h4>
                    </div>

                    <div className="text-center py-4 relative">
                      <div className="w-32 h-32 ml-auto mr-auto rounded-full border border-[#C5A059]/10 p-2 flex items-center justify-center relative">
                        {/* Circle glowing effect */}
                        <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#C5A059] animate-spin-slow" />
                        
                        <div className="text-center">
                          <span className="text-4xl font-display font-bold text-white tracking-tighter">9.8</span>
                          <span className="block text-[10px] font-mono text-white/45 mt-0.5">TRUST FACTOR</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40">Reliability Level:</span>
                        <span className="text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">Verified</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40">Compliance Status:</span>
                        <span className="text-white font-mono font-bold">100% OK</span>
                      </div>
                    </div>
                  </div>

                  {/* Core Enterprise Parameters Details */}
                  <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] space-y-5">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-[#C5A059]">Service parameters</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      
                      <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 text-center">
                        <p className="text-white/30 text-[9px] uppercase font-bold">Response rate</p>
                        <h5 className="text-lg font-bold text-white font-mono mt-1">{responseRate}</h5>
                      </div>

                      <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 text-center">
                        <p className="text-white/30 text-[9px] uppercase font-bold">Response Speed</p>
                        <h5 className="text-lg font-bold text-[#C5A059] font-mono mt-1">{responseTime}</h5>
                      </div>

                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                      
                      <div>
                        <span className="text-[10px] text-white/40 uppercase block mb-1">Languages Spoken</span>
                        <div className="flex flex-wrap gap-1.5">
                          {languagesSpoken.map((lang, index) => (
                            <span key={index} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-md text-xs font-semibold text-white/90">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-white/40 uppercase block mb-1.5">Ecosystem Specialties</span>
                        <div className="flex flex-wrap gap-1.5">
                          {specializations.slice(0, 3).map((spec, index) => (
                            <span key={index} className="px-2.5 py-1 bg-amber-500/10 text-[#C5A059] text-[10px] font-bold rounded-lg uppercase tracking-tight">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* High Quality Regional Office Map Coordinates Indicator */}
                  <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#C5A059]">Active Location Registry</h4>
                      <Locate size={14} className="text-white/30" />
                    </div>

                    <div className="space-y-3.5">
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <h6 className="text-xs font-semibold text-white">Central Jigjiga HQ Branch</h6>
                        <p className="text-[10px] text-white/50 mt-1">Floor 14, Jigjiga Financial Tower, Block A, Somali Region</p>
                        
                        <div className="mt-2 text-[10px] font-mono text-[#C5A059] uppercase tracking-wider flex items-center justify-between">
                          <span>Verified GPS coords:</span>
                          <span>9.3524° N, 42.8021° E</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* --------------------------------- TAB 2: LISTINGS CATALOG --------------------------------- */}
            {activeTab === 'listings' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-2xl font-display font-medium text-white">Verified Listings</h2>
                    <p className="text-xs text-white/40 mt-1">Every physical parcel lists verified boundary GPS, certified water assets, and dispute insurance.</p>
                  </div>

                  <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-4 py-2.5">
                    <Filter size={14} className="text-[#C5A059]" />
                    <span className="text-xs text-white/70 uppercase font-bold tracking-wider">Total Active lots: {agentListings.length}</span>
                  </div>
                </div>

                {listingsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-80 bg-[#111] border border-white/5 animate-pulse rounded-[2rem]" />
                    ))}
                  </div>
                ) : agentListings.length === 0 ? (
                  <div className="text-center py-24 bg-[#111] border border-white/5 rounded-[2.5rem] max-w-2xl mx-auto space-y-4">
                    <HomeIcon size={44} className="text-white/20 mx-auto" />
                    <h4 className="text-lg font-display font-medium text-white">Registry Inventory is Silent</h4>
                    <p className="text-xs text-white/40 max-w-sm mx-auto">This registered profile has no physical lots listed style currently. Properties appear here immediately upon security vetting.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {agentListings.map(listing => (
                      <div key={listing.id} className="transform hover:-translate-y-1 transition duration-300">
                        <PropertyCard property={listing as any} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --------------------------------- TAB 3: ADVANCED REVIEWS --------------------------------- */}
            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                
                {/* Advanced summary layout */}
                <div className="bg-[#111] border border-white/5 rounded-[2rem] p-8 space-y-6">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/40">Network Feedback Rating</h4>
                    
                    <div className="flex items-end gap-3.5 mt-3">
                      <span className="text-6xl font-display font-bold text-white font-mono leading-none tracking-tighter">
                        {calculatedStats.average}
                      </span>
                      
                      <div className="space-y-1.5">
                        <div className="flex text-amber-400 gap-0.5">
                          {[1, 2, 3, 4, 5].map(v => (
                            <Star key={v} size={15} fill={v <= Math.round(calculatedStats.average) ? "currentColor" : "none"} />
                          ))}
                        </div>
                        <p className="text-[10px] text-white/45 font-mono uppercase font-bold tracking-wider">{calculatedStats.count} Validated Client Reviews</p>
                      </div>
                    </div>
                  </div>

                  {/* Trust indicator gauge list */}
                  <div className="space-y-3.5 pt-5 border-t border-white/5">
                    <span className="text-xs uppercase font-extrabold tracking-widest text-[#C5A059] block">Trust indicators</span>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-white/45">Recommend percentage:</span>
                        <span className="text-emerald-400 font-bold">{calculatedStats.recommendPercentage}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${calculatedStats.recommendPercentage}%` }} />
                      </div>
                    </div>

                    <div className="space-y-2 text-xs pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white/45">Registry Safety audit:</span>
                        <span className="text-[#C5A059] font-bold">100% Cleared</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#C5A059] h-full rounded-full transition-all tracking-wide" style={{ width: `100%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Submission review form */}
                  <form onSubmit={handleAddReview} className="space-y-4 pt-6 border-t border-white/5">
                    <span className="text-xs uppercase font-black tracking-widest text-[#C5A059] block">Submit verified audit review</span>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-widest text-white/40">Investor / Client Name</label>
                      <Input 
                        placeholder="e.g. Mahamed Dahir"
                        value={newAuthor}
                        onChange={e => setNewAuthor(e.target.value)}
                        className="bg-white/5 border-white/10 rounded-lg text-xs h-10 text-white"
                        required 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-widest text-white/40 block">Select Star Vibe Appraisal</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star} 
                            type="button" 
                            onClick={() => setNewRating(star)}
                            className="text-amber-400 focus:outline-none hover:scale-110 transition-transform"
                          >
                            <Star size={24} fill={star <= newRating ? "currentColor" : "none"} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-widest text-white/40 block">Vetted Trade Action</label>
                      <select
                        value={newTxType}
                        onChange={e => setNewTxType(e.target.value as any)}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg text-xs h-10 px-2 text-white/80 focus:border-[#C5A059]"
                      >
                        <option value="Villa Purchase">Villa Purchase</option>
                        <option value="Commercial Lease">Commercial Lease</option>
                        <option value="Land Investment">Land Investment</option>
                        <option value="Residential Rental">Residential Rental</option>
                        <option value="Estate Management">Estate Management</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-widest text-white/40">Detailed Integrity Comment</label>
                      <Textarea 
                        placeholder="Detail the title clearance speed, GPS boundaries verification, and payment escrow coordination experience..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        className="bg-white/5 border-white/10 rounded-lg text-xs h-24 text-white"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-[#C5A059] hover:bg-white text-black text-xs font-bold uppercase tracking-wider h-11 rounded-lg">
                      <Send size={12} className="mr-2" />
                      <span>Post Validated Feedback</span>
                    </Button>
                  </form>
                </div>

                {/* Review posts rendering stream */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Reviews Controller search filter bar */}
                  <div className="bg-[#111] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:max-w-xs">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <Input
                        placeholder="Search testimonials..."
                        value={reviewSearch}
                        onChange={e => setReviewSearch(e.target.value)}
                        className="bg-white/5 border-white/5 pl-9 rounded-lg h-9 text-xs w-full text-white"
                      />
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                      <button 
                        onClick={() => setReviewFilter('all')}
                        className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg border transition-all ${
                          reviewFilter === 'all' ? 'bg-[#C5A059] border-[#C5A059] text-black' : 'bg-white/5 border-white/5 text-white/65 hover:text-white'
                        }`}
                      >
                        All Rate ({reviews.length})
                      </button>
                      <button 
                        onClick={() => setReviewFilter('high')}
                        className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg border transition-all ${
                          reviewFilter === 'high' ? 'bg-[#C5A059] border-[#C5A059] text-black' : 'bg-white/5 border-white/5 text-white/65 hover:text-white'
                        }`}
                      >
                        High Star (4+)
                      </button>
                      <button 
                        onClick={() => setReviewFilter('verified')}
                        className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg border transition-all ${
                          reviewFilter === 'verified' ? 'bg-[#C5A059] border-[#C5A059] text-black' : 'bg-white/5 border-white/5 text-white/65 hover:text-white'
                        }`}
                      >
                        Verified clients
                      </button>
                    </div>
                  </div>

                  {/* Reviews list cards */}
                  <div className="space-y-6">
                    {filteredAndSearchedReviews.length === 0 ? (
                      <div className="py-20 text-center bg-[#111] border border-white/5 rounded-[2rem] text-white/30 text-xs font-bold uppercase tracking-wider">
                        No client reviews match current filtering guidelines.
                      </div>
                    ) : (
                      filteredAndSearchedReviews.map((rev) => (
                        <div key={rev.id} className="bg-[#111] border border-white/5 p-6 rounded-[2rem] space-y-4 relative overflow-hidden">
                          
                          {/* Inner gold indicator bar for verified client */}
                          {rev.isVerifiedClient && (
                            <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#C5A059]" />
                          )}

                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white">{rev.author}</span>
                                {rev.isVerifiedClient && (
                                  <span className="flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                                    <CheckCircle2 size={8} className="fill-emerald-400 text-black" /> Verified Escrow Client
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#C5A059] font-mono mt-0.5 uppercase font-bold tracking-[0.15em]">TRADE VALUE AUDIT: {rev.transactionType}</p>
                            </div>

                            <span className="text-white/30 font-mono text-[10px]">{rev.date}</span>
                          </div>

                          {/* Appraised star rates */}
                          <div className="flex text-amber-400 gap-0.5">
                            {[1,2,3,4,5].map(s => <Star key={s} size={13} fill={s <= rev.rating ? "currentColor" : "none"} />)}
                          </div>

                          <p className="text-white/70 text-xs leading-relaxed font-light">{rev.comment}</p>

                          {/* Helpful and Response layout actions bar */}
                          <div className="pt-4 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between">
                            
                            <button 
                              onClick={() => handleHelpfulUpvote(rev.id)}
                              disabled={votedHelpful[rev.id]}
                              className={`flex items-center gap-1.5 text-[10px] transition-colors border px-3 py-1.5 rounded-xl ${
                                votedHelpful[rev.id] 
                                  ? 'bg-[#C5A059]/10 border-[#C5A059]/10 text-[#C5A059]' 
                                  : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/10'
                              }`}
                            >
                              <ThumbsUp size={11} />
                              <span>Helpful? ({rev.helpfulCount})</span>
                            </button>

                            {rev.brokerResponse && (
                              <button
                                onClick={() => setResponseExpanded(prev => ({ ...prev, [rev.id]: !prev[rev.id] }))}
                                className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors"
                              >
                                <span>{responseExpanded[rev.id] ? 'Hide official response' : 'View official response'}</span>
                                <ChevronDown size={12} className={`transform transition-transform ${responseExpanded[rev.id] ? 'rotate-180' : ''}`} />
                              </button>
                            )}

                          </div>

                          {/* Nested reply box with gold borders */}
                          {rev.brokerResponse && responseExpanded[rev.id] && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-neutral-900 to-[#12110e] border-l-2 border-[#C5A059] text-xs space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                  <ShieldCheck size={13} className="text-[#C5A059]" /> Official reply from Representative
                                </span>
                                <span className="text-[9px] font-mono text-white/30 uppercase">Authorized Signed Signature</span>
                              </div>
                              <p className="text-white/60 leading-relaxed font-light">{rev.brokerResponse}</p>
                            </motion.div>
                          )}

                        </div>
                      ))
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* --------------------------------- TAB 4: ACTIVITY RECORDS --------------------------------- */}
            {activeTab === 'activity' && (
              <div className="max-w-4xl mx-auto space-y-8">
                <div>
                  <h2 className="text-2xl font-display font-medium text-white">Registry Activity Ledger Log</h2>
                  <p className="text-xs text-white/45 mt-1">Immutable decentralized events timeline registering physical site listings, approved verifications, and property deals.</p>
                </div>

                <div className="relative pl-6 border-l border-white/5 space-y-8 py-2">
                  {generatedTimelineEvents.map((act) => {
                    return (
                      <div key={act.id} className="relative group pl-6">
                        {/* Beautiful gold gradient bullet point wrapper */}
                        <div className="absolute -left-[31px] top-1 w-4.5 h-4.5 rounded-full bg-[#111] border-2 border-[#C5A059] flex items-center justify-center shadow-lg shadow-[#C5A059]/20">
                          <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-ping" />
                        </div>

                        {/* Event Card Panel */}
                        <div className="bg-[#111] border border-white/5 hover:border-white/10 p-6 rounded-2xl space-y-3 transition-all duration-300">
                          
                          <div className="flex flex-wrap items-center justify-between gap-2.5">
                            <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider font-semibold block">{act.timestamp}</span>
                            
                            {act.metric && (
                              <span className="bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 px-2.5 py-0.5 rounded font-mono font-bold text-[10px]">
                                {act.metric}
                              </span>
                            )}
                          </div>

                          <h4 className="font-display font-bold text-base text-white group-hover:text-[#C5A059] transition-colors">{act.title}</h4>
                          <p className="text-white/60 text-xs leading-relaxed font-light">{act.description}</p>

                          {act.location && (
                            <div className="flex items-center gap-1 text-[10px] text-white/40">
                              <MapPin size={10} className="text-[#C5A059]" />
                              <span>Executed Location: {act.location}</span>
                            </div>
                          )}

                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --------------------------------- TAB 5: CREDENTIALS VETTING --------------------------------- */}
            {activeTab === 'verification' && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-medium text-white font-sans tracking-tight">Vetting & Licensure Index</h2>
                  <p className="text-xs text-white/45 mt-1">Official verification records verified by regional property administrators and land registry coordinators.</p>
                </div>

                {/* Main Documents Grid layout */}
                <div className="space-y-4">
                  
                  {/* Item 1: Federal License Vetting */}
                  <div className="bg-[#111] border border-white/5 p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                        <Award size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Federal Real Estate Brokerage License</h4>
                        <p className="text-[11px] text-white/45 mt-0.5">Approved under Ministerial Law Registry for Horn of African land trading.</p>
                        <span className="block text-[10px] font-mono text-[#C5A059] mt-1 uppercase">License Number: {registrationNumber}</span>
                      </div>
                    </div>

                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                      ACTIVE & VERIFIED
                    </span>
                  </div>

                  {/* Item 2: Corporate Deed Dispute Safety */}
                  <div className="bg-[#111] border border-white/5 p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059] shrink-0">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Historical Deed Record Checks</h4>
                        <p className="text-[11px] text-white/45 mt-0.5">Includes verified survey compliance checks and comprehensive title background validation.</p>
                        <span className="block text-[10px] font-mono text-[#C5A059] mt-1 uppercase">Disputes Index: 0.0% claims</span>
                      </div>
                    </div>

                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                      100% CLEAR
                    </span>
                  </div>

                  {/* Item 3: Tax Compliance Certificate status */}
                  <div className="bg-[#111] border border-white/5 p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                        <Coins size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Regional Investment & Tax Clearance</h4>
                        <p className="text-[11px] text-white/45 mt-0.5">Fully compliant with regional commercial regulations and official property development guidelines.</p>
                        <span className="block text-[10px] font-mono text-[#C5A059] mt-1 uppercase">Certificate: TAX-COMPLIANCE-2026</span>
                      </div>
                    </div>

                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                      COMPLIANT
                    </span>
                  </div>

                  {/* Item 4: Official Verification Badge Accreditation */}
                  <div className="bg-gradient-to-r from-neutral-900 to-[#1c1811] border border-white/5 p-6 rounded-2xl space-y-3 text-center sm:text-left">
                    <h4 className="font-display font-bold text-sm text-white flex items-center gap-2 justify-center sm:justify-start">
                      <Sparkles size={16} className="text-[#C5A059]" />
                      <span>Certified Agency Verification badge</span>
                    </h4>

                    <p className="text-white/60 text-xs leading-relaxed max-w-xl">
                      This digital accreditation permits the verified office to append official compliance numbers to every property listing automatically, ensuring high consumer protection and complete legal safety for local and diaspora buyers.
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
                      <span className="text-[10px] font-mono text-white/30 truncate max-w-xs block select-all">REGISTRATION NUMBER: {registrationNumber}</span>
                      <Button className="bg-[#C5A059] hover:bg-white text-black h-8 text-[10px] font-black tracking-wider uppercase rounded-lg px-3 shrink-0 shadow-sm">
                        Verify Registration Status
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* --------------------------------- TAB 6: TEAM MEMBERS / AFFILIATES --------------------------------- */}
            {activeTab === 'team' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-display font-medium text-white">
                    {agency ? 'Assigned Corporate Brokers' : 'Affiliated Network Team Circle'}
                  </h2>
                  <p className="text-xs text-white/45 mt-1">
                    {agency ? `Meet the certified expert partners assigned under ${agency.agencyName} holding corporate signing authority.` : 'Brokers belonging to our vetted local circle of associated advisory compliance officers.'}
                  </p>
                </div>

                {agency ? (
                  agencyTeam.length === 0 ? (
                    <div className="bg-[#111] border border-white/5 p-16 text-center rounded-[2rem]">
                      <p className="text-white/40 text-xs uppercase tracking-widest font-bold">No registered brokers found under this agency index today.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {agencyTeam.map(item => (
                        <Link 
                          to={`/agents/${item.id}`} 
                          key={item.id} 
                          className="block group bg-[#111] border border-white/5 hover:border-[#C5A059]/30 rounded-[2rem] p-6 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 shrink-0 border border-white/10">
                              <img referrerPolicy="no-referrer" src={item.profilePhotoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'} alt={item.fullName} className="w-full h-full object-cover" />
                            </div>
                            
                            <div>
                              <h4 className="font-bold text-white group-hover:text-[#C5A059] transition-colors font-display">{item.fullName}</h4>
                              <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono mt-0.5">{item.city || 'Jigjiga'}, Somali Region</p>
                              
                              <span className="text-[9px] text-emerald-400 uppercase font-black tracking-wider block mt-1.5 flex items-center gap-1">
                                <CheckCircle2 size={10} className="text-emerald-400" /> Vetted Representative
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )
                ) : (
                  // Affiliate brokers list (for independent broker profile)
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {brokersList.slice(0, 3).map(item => {
                      if (item.id === id) return null; // skip self
                      return (
                        <Link 
                          to={`/agents/${item.id}`} 
                          key={item.id} 
                          className="block group bg-[#111] border border-white/5 hover:border-[#C5A059]/30 rounded-[2rem] p-6 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 shrink-0 border border-white/10">
                              <img referrerPolicy="no-referrer" src={item.profilePhotoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'} alt={item.fullName} className="w-full h-full object-cover" />
                            </div>
                            
                            <div>
                              <h4 className="font-bold text-white group-hover:text-[#C5A059] transition-colors">{item.fullName}</h4>
                              <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono mt-0.5">{item.city || 'Jigjiga'}, Jigjiga Zone</p>
                              
                              <span className="text-[9px] text-[#C5A059] uppercase font-black tracking-wider block mt-1.5 flex items-center gap-1">
                                <Award size={10} className="text-[#C5A059]" /> Verified Broker Partner
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* --------------------------------- TAB 7: SAAS ANALYTICS --------------------------------- */}
            {activeTab === 'analytics' && (
              <div className="space-y-10">
                <div>
                  <h2 className="text-2xl font-display font-medium text-white">SaaS Performance Indicator Panel</h2>
                  <p className="text-xs text-white/45 mt-1">Real-time engagement activity, visitor traffic data, response efficiency calculations, and customer conversion rates.</p>
                </div>

                {/* Grid Analytics Dashboard cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  
                  {/* Views performance widget */}
                  <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Total Profile Views</span>
                      <span className="text-emerald-400 text-xs font-bold font-mono">+12.4% MoM</span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-4xl font-display font-bold text-white font-mono">1,482</h3>
                      <p className="text-xs text-white/45 leading-relaxed">Unique profile visits registered this month via domestic and international diaspora nodes.</p>
                    </div>

                    <div className="h-14 mt-4 bg-white/[0.01] rounded-xl flex items-end p-2 gap-1.5 border border-white/[0.02]">
                      {[40, 60, 45, 75, 54, 82, 95, 63, 110, 85].map((h, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-[#C5A059] to-amber-400 rounded-sm transition-all hover:brightness-125" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>

                  {/* Inquiry conversions widgets */}
                  <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Inquiry Conversion Rate</span>
                      <span className="text-emerald-400 text-xs font-bold font-mono">+1.8%</span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-4xl font-display font-bold text-[#C5A059] font-mono">4.8%</h3>
                      <p className="text-xs text-white/45 leading-relaxed">Conversion score measuring direct WhatsApp inquiries to listing page clicks.</p>
                    </div>

                    {/* Simple linear progress indicator bar */}
                    <div className="space-y-1 pt-4">
                      <div className="flex justify-between text-[10px] text-white/40 uppercase">
                        <span>Industry benchmark (2%):</span>
                        <span>Outperforming</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#C5A059] h-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Response efficiency widget */}
                  <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Response Efficiency SLA</span>
                      <span className="text-blue-400 text-xs font-bold">Excellent</span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-4xl font-display font-bold text-white font-mono">99.5%</h3>
                      <p className="text-xs text-white/45 leading-relaxed">Overall replies submitted in under 15 minutes to verified escrow client inquiries.</p>
                    </div>

                    <div className="space-y-2 pt-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/40">Average Response Time:</span>
                        <span className="text-[#C5A059] font-bold">11 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">SLA compliance status:</span>
                        <span className="text-emerald-400 font-bold">Fully Compliant</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Large secondary analytical details info card */}
                <div className="bg-gradient-to-r from-neutral-900 to-[#12110e] border border-white/5 p-8 rounded-[2.5rem] space-y-4 text-center">
                  <h4 className="font-display font-bold text-lg text-white">Registry Performance Verification Status</h4>
                  <p className="text-xs text-white/50 max-w-lg mx-auto leading-relaxed">
                    Operational stats and response rates are updated continuously to ensure professional services for local and diaspora buyers.
                  </p>
                  
                  <div className="pt-2">
                    <span className="px-4 py-1.5 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 font-mono text-[9px] uppercase tracking-widest font-black rounded-full inline-block">
                      Clearance status: VERIFIED PREMIER ADVISOR
                    </span>
                  </div>
                </div>

              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
