import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Home as HomeIcon, Car, Landmark, ArrowRight, Shield, Award, Users, Star, Briefcase, Loader2, GraduationCap, Coins, TrendingUp, Sparkles, BookOpen, Clock, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import PropertyCard from '@/components/PropertyCard';
import VehicleCard from '@/components/VehicleCard';
import ProfessionalCard from '@/components/ProfessionalCard';
import EmptyState from '@/components/EmptyState';
import { Property, VehicleListing, Professional, Article, Listing, Broker } from '@/types';
import { listingService } from '@/services/listingService';
import { listingRepository } from '@/services/listingRepository';
import { articleService } from '@/services/articleService';
import { brokerService } from '@/services/brokerService';
import BrokerCard from '@/components/brokers/BrokerCard';

interface Opportunity {
  id: string;
  category: 'jobs' | 'learn' | 'earn';
  title: string;
  provider: string;
  location?: string;
  type?: string;        // For Gigs: Full-Time, Gig, Commission
  earnDetail?: string;  // For Earn: Commission rate, bonus amount
  duration?: string;    // For Learn: length/pace
  description: string;
  learningCategory?: string; // For Learn
  bulletPoints: string[];
  actionText: string;
}

const OPPORTUNITIES_DATA: Opportunity[] = [
  {
    id: 'gig-1',
    category: 'jobs',
    title: 'Somaliland/Somali Region Broker Lead',
    provider: 'AmaanEstate Elite',
    location: 'Jigjiga & Environs',
    type: 'Commission-Based',
    description: 'Join our elite broker circle representing premier regional residential structures and office buildings. Directly coordinate high-value acquisitions with premium payout structure.',
    bulletPoints: [
      'High-tier commission split of up to 3.0% per completed deal',
      'Exclusive access to our off-market certified catalog of properties',
      'Professional digital tools, digital mapping, and legal paperwork assistance'
    ],
    actionText: 'Apply as Broker'
  },
  {
    id: 'gig-2',
    category: 'jobs',
    title: 'Elite Real Estate Valuator & Appraiser',
    provider: 'AmaanEstate Appraisals',
    location: 'Garowe / Hargeisa / Jigjiga',
    type: 'Contract / Gig',
    description: 'Perform rigorous digital on-site surveys, photographic audits, and verify ownership deeds for elite housing properties on behalf of regional buyers.',
    bulletPoints: [
      'Highly flexible hours - get assigned per asset mapping request',
      'Paid $60-$150 flat-rate fee per verified and submitted evaluation report',
      'AmaanEstate Appraiser toolkit and training materials provided free of cost'
    ],
    actionText: 'Apply for Gig'
  },
  {
    id: 'gig-3',
    category: 'jobs',
    title: 'VIP Chauffeur & Logistics Consultant',
    provider: 'AmaanEstate Logistics',
    location: 'Jigjiga HQ',
    type: 'Temporary Gig',
    description: 'Ensure a smooth first-class experience for international Somali investors, developers, and diplomats visiting premium project sites and developments.',
    bulletPoints: [
      'Represent AmaanEstate with pristine brand-aligned elite transport vehicles',
      'Requires clean local license, outstanding regional knowledge, and fluent communication',
      'Competitive premium hourly billing + hotel/logistics reimbursement benefits'
    ],
    actionText: 'Apply for Gig'
  },
  {
    id: 'gig-4',
    category: 'jobs',
    title: 'Field Land Digitization Surveyor',
    provider: 'AmaanEstate Digital Registry',
    location: 'Jigjiga & Regional Suburbs',
    type: 'Full-Time / Contract',
    description: 'Navigate regional suburbs to identify hot growth zones, meet landowners, map plots, and help them gain legal trust and visibility on our map.',
    bulletPoints: [
      'Ideal for engineering/geography students or tech-savvy regional youths',
      'Base monthly stipend + strong commission for every active, high-intent land onboarding',
      'Hands-on field training in GIS coordinate mapping and title deed validation'
    ],
    actionText: 'Apply for Job'
  },
  {
    id: 'learn-1',
    category: 'learn',
    title: 'Digital Real Estate Valuation & Sales Certified (DREVC)',
    provider: 'AmaanEstate Academy',
    duration: '4-Week Intensive Bundle',
    learningCategory: 'Professional Certification',
    description: 'A premium, modern course specifically tailored to East African and Somali Region lands. Learn how to accurately evaluate structural materials, read masterplans, and project land values.',
    bulletPoints: [
      'Become a certified real estate appraiser recognised by AmaanEstate',
      'Live weekly interactive masterclasses + practical on-field evaluation tasks',
      'Graduates get direct automatic placement in our verified surveyor registry'
    ],
    actionText: 'Enroll in Program'
  },
  {
    id: 'learn-2',
    category: 'learn',
    title: 'Modern Architectural Integrity & Safe Construction Standards',
    provider: 'AmaanEstate Engineering Dept',
    duration: 'Self-Paced Learning Track',
    learningCategory: 'Technical Skills Training',
    description: 'Empower yourself with fundamental architectural reading, CAD software basics, structural concrete testing, and local soil expansion characteristics.',
    bulletPoints: [
      'Led by renowned certified engineers from Jigjiga and Hargeisa University',
      'Ideal for amateur contractors, field technicians, and aspiring draftsmen',
      '100% online with bite-sized video walkthroughs and interactive quiz segments'
    ],
    actionText: 'Start Learning'
  },
  {
    id: 'learn-3',
    category: 'learn',
    title: 'Young Developers & Civil Engineers Scholarship 2026',
    provider: 'Amaan Capital Founders',
    duration: 'Full Academic Year',
    learningCategory: 'Scholarships & Grants',
    description: 'A flagship charity program sponsoring prospective civil engineering, architecture, and real estate finance students at accredited regional universities.',
    bulletPoints: [
      'Full tuition coverage, monthly study stipend, and custom high-performance laptop',
      'Guaranteed summer paid internship with top regional development builders',
      'Requires high-school GPA of 3.5+ or university enrollment transcript'
    ],
    actionText: 'Apply for Scholarship'
  },
  {
    id: 'earn-1',
    category: 'earn',
    title: 'Become an Authorized Commercial Property Agent',
    provider: 'AmaanEstate Partner Program',
    earnDetail: 'Up to 3.0% commission per real estate transaction',
    description: 'Start your professional commercial agent career. List office spaces, shopping plazas, and large development lands, and receive fully verified client inquiries.',
    bulletPoints: [
      'Unlocks the exclusive "Amaan Verified Agent" shiny golden profile badge',
      'Real-time lead alerts via SMS & automated email dashboard',
      'Dedicated listing booster slots (up to 5 free concurrent featured ads)'
    ],
    actionText: 'Join as Agent'
  },
  {
    id: 'earn-2',
    category: 'earn',
    title: 'AmaanEstate Digital Land Referral Agent',
    provider: 'AmaanEstate Referrals',
    earnDetail: 'Earn $200 securely per verified plot or villa listed',
    description: 'Promote trust and growth in your community. Recommend developers, builders, and raw landowners to onboard, secure, and map their plots on our premium directory.',
    bulletPoints: [
      'Instantly paid upon listing validation by our regional legal team',
      'Track your earnings and pending referrers live inside your Amaan dashboard',
      'No property selling required - you get paid solely for onboarding quality files'
    ],
    actionText: 'Start Earning'
  },
  {
    id: 'earn-3',
    category: 'earn',
    title: 'Freelance Listing & Digitization Consultant',
    provider: 'Youth Economic Independence',
    earnDetail: 'Variable service charge determined by you ($50-$200/file)',
    description: 'Provide end-to-end premium digitisation for elders or non-literate landowners in Jigjiga who cannot navigate software platforms. Draft their profiles, take photos, and publish listings.',
    bulletPoints: [
      'Flexible, community-centred role where you operate as an independent digitiser',
      'Charge custom fees for site photography and copywriting services',
      'Earn an extra bonus of $20 from AmaanEstate for compiling zero-defect profiles'
    ],
    actionText: 'Become Consultant'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [latestVehicles, setLatestVehicles] = useState<VehicleListing[]>([]);
  const [topProfessionals, setTopProfessionals] = useState<Professional[]>([]);
  const [verifiedBrokers, setVerifiedBrokers] = useState<Broker[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchPropertyType, setSearchPropertyType] = useState('Houses');
  const [searchBuyRent, setSearchBuyRent] = useState('Sell');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Opportunities Hub States & Forms
  const [activeTab, setActiveTab] = useState<'all' | 'jobs' | 'learn' | 'earn'>('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantCity, setApplicantCity] = useState('');
  const [applicantNote, setApplicantNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone || !applicantCity) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      // Clean up fields after a bit of feedback
      setTimeout(() => {
        setSelectedOpportunity(null);
        setSubmitSuccess(false);
        setApplicantName('');
        setApplicantPhone('');
        setApplicantCity('');
        setApplicantNote('');
      }, 3500);
    }, 1500);
  };

  const filteredOpportunities = useMemo(() => {
    if (activeTab === 'all') return OPPORTUNITIES_DATA;
    return OPPORTUNITIES_DATA.filter(opp => opp.category === activeTab);
  }, [activeTab]);

  // Load listings whenever filters change
  const loadListings = async () => {
    setLoading(true);
    try {
        const categoryMap: Record<string, string> = {
            'Houses': 'property',
            'Land': 'land',
            'Vehicles': 'vehicle'
        };
        const listingTypeMap: Record<string, string> = {
            'Sell': 'sale',
            'Rent': 'rent'
        };
        
        const category = categoryMap[searchPropertyType] || undefined;
        const listingType = listingTypeMap[searchBuyRent] || undefined;

        const listingsRes = await listingRepository.fetchListings({
            status: 'active',
            city: searchCity || undefined,
            category: category,
            listingType: listingType,
            searchQuery: searchQuery || undefined,
            verifiedOnly: verifiedOnly
        });
        setListings(listingsRes);
    } catch (error) {
        console.error("Failed to load listings", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [searchCity, searchPropertyType, searchBuyRent, verifiedOnly]); // Include searchQuery if we want live search

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [listingsRes, prosRes, articlesRes, brokersRes] = await Promise.all([
          listingRepository.fetchListings({ status: 'active' }),
          listingService.getProfessionalServices('All', 'active'),
          articleService.getArticles(),
          brokerService.getVerifiedBrokers()
        ]);
        
        setListings(listingsRes);
        setFeaturedProperties(listingsRes.filter(l => l.category === 'property' && l.isFeatured).slice(0, 3) as Property[]);
        setLatestVehicles(listingsRes.filter(l => l.category === 'vehicle').slice(0, 2) as VehicleListing[]);
        setLatestArticles(articlesRes.slice(0, 3));
        setVerifiedBrokers(brokersRes.slice(0, 3));
        
        const mappedPros: Professional[] = prosRes.slice(0, 3).map(s => ({
          id: s.id,
          name: s.providerName || "Verified Specialist",
          title: s.title,
          category: s.category,
          skills: [s.category],
          experienceYears: 5,
          city: s.city,
          image: s.providerImage || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
          rating: 4.9,
          reviewCount: Math.floor(Math.random() * 50) + 10,
          availability: 'Available',
          bio: s.description,
          isVerified: true
        }));
        setTopProfessionals(mappedPros);
      } catch (err) {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCity) params.set('city', searchCity);
    if (searchBuyRent) params.set('listingType', searchBuyRent === 'Sell' ? 'sale' : 'rent');
    
    // In Properties.tsx, 'category' param is used for subcategory (Houses, Land, etc.)
    // and the main category is hardcoded to 'property' (or 'land' is handled separately)
    // Actually, Properties page defaults to category: 'property'.
    if (searchPropertyType === 'Land') {
       navigate(`/properties?city=${searchCity}&category=Land`);
       return;
    }
    
    if (searchPropertyType === 'Vehicles') {
       navigate(`/vehicles?city=${searchCity}`);
       return;
    }
    
    if (searchPropertyType !== 'Houses') {
        params.set('category', searchPropertyType);
    }
    
    navigate(`/properties?${params.toString()}`);
  };


  // Check if filters are active
  const isFilterActive = searchQuery !== '' || searchCity !== '' || searchPropertyType !== 'Houses' || searchBuyRent !== 'Sell' || verifiedOnly;

  const resetFilters = () => {
    setSearchQuery('');
    setSearchCity('');
    setSearchPropertyType('Houses');
    setSearchBuyRent('Sell');
    setVerifiedOnly(false);
  };

  const removeFilter = (filterType: string) => {
    if (filterType === 'search') setSearchQuery('');
    if (filterType === 'city') setSearchCity('');
    if (filterType === 'type') setSearchPropertyType('Houses');
    if (filterType === 'status') setSearchBuyRent('Sell');
    if (filterType === 'verified') setVerifiedOnly(false);
  };

  const filteredProperties = useMemo(() => {
    return listings.filter(l => l.category === 'property' || l.category === 'land') as Property[];
  }, [listings]);

  const filteredVehicles = useMemo(() => {
    return listings.filter(l => l.category === 'vehicle') as VehicleListing[];
  }, [listings]);

  const cities = useMemo(() => {
    const list = [
      { name: 'Jigjiga', image: 'https://z-p3-scontent.fadd2-1.fna.fbcdn.net/v/t39.30808-6/644707886_34399610449652315_5526136155595269031_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGG8Md0zSF5JEOcUeJWUR-FwSUKVndKoKzBJQpWd0qgrLtg8OnfD_UgpaslnUkJdiNIVAe-a5WPL_EXq1HgVTML&_nc_ohc=zrWUo1R7-c4Q7kNvwG_CBmi&_nc_oc=AdoP54zcd7rzWpavPSjFmtdESKbF-njPr5xuv-BHlcoh3z-QlGc-kSFI2fv8we1wDNI&_nc_zt=23&_nc_ht=z-p3-scontent.fadd2-1.fna&_nc_gid=kDZ3FhoiF35jvwVQmD8dEw&_nc_ss=7b2a8&oh=00_Af7s74-9GDNTvCbBHpauvhvsUD6305ZvL_xH9Rbv4uMScg&oe=6A1283E1' },
      { name: 'Dire Dawa', image: 'https://z-p3-scontent.fadd1-1.fna.fbcdn.net/v/t39.30808-6/646375559_1322838623198668_1434327741280454352_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGQTciBmca3xt6j6VTT3dWAfVYwc-cZccV9VjBz5xlxxXbnCrRz6n_LmXRbMpeHWO9ogFf0rSGXNyzWV7SXZ9yp&_nc_ohc=YZjvIpeYHS4Q7kNvwGn42eW&_nc_oc=AdoDFlOdvRJHD_eGdq5Jdk1xJInUxXYmeAmar11eZUPivhamWr8sFLtk95JiAFXNXbM&_nc_zt=23&_nc_ht=z-p3-scontent.fadd1-1.fna&_nc_gid=Hgaco_grVJ9L-LH8ai4TOg&_nc_ss=7b2a8&oh=00_Af7ot21rIoKLhbyluoOl98gGQfEGYy7VqUe0F2buu9Q8EA&oe=6A12A4D4' },
      { name: 'Addis Ababa', image: 'https://z-p3-scontent.fadd1-1.fna.fbcdn.net/v/t39.30808-6/615966672_913061694422993_3921163485875115609_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeG3y-33fsgqrHXf24z7bjToHPhNy8JYP6Qc-E3Lwlg_pPfhOdDNF_UpLxIB3TzM0iVAZBgAG5jYwNNiB0xRhCeY&_nc_ohc=8xuhAfhgLtoQ7kNvwGrDr8w&_nc_oc=AdqoIXw-QKpyR93wivEZfeFut9nCOw0a3dfNw6puY8csbefllXyAtr0wNHgnP3Bn12o&_nc_zt=23&_nc_ht=z-p3-scontent.fadd1-1.fna&_nc_gid=jJJ6hzJffPg0nEaSk1xZOQ&_nc_ss=7b2a8&oh=00_Af6uLHmiGgrjc3DnooUYam8-28zyW-ofIDyAfLRYwwk3LQ&oe=6A12794B' },
      { name: 'Godey', image: 'https://z-p3-scontent.fadd2-1.fna.fbcdn.net/v/t39.30808-6/689015929_1463837545755441_7314669393563841796_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=aa7b47&_nc_eui2=AeGaliRUygN9bErfVwRdzqU2FAZqfc2J96EUBmp9zYn3oVXu-3upVHNHKoyraTzA8PCx2yl8qvhExokjdL_kZYeE&_nc_ohc=satrS-fux5UQ7kNvwFVWyX_&_nc_oc=AdoMXjp3wqdRgj07lM6uo1d5sv1RZghPqhKb6FmyhmjS1Z2V4iIfePXF54clmFRwNlY&_nc_zt=23&_nc_ht=z-p3-scontent.fadd2-1.fna&_nc_gid=on8gQJD-gmiNnWsVj3zVWw&_nc_ss=7b2a8&oh=00_Af5N-Xl7rbAqYlXyJA18HlKpqkap9cHeknJbsrmktcweEQ&oe=6A129CC4' },
    ];

    return list.map(city => {
      // Return count of active Listings (where category is property or land)
      // where the city field or region matches city.name case-insensitively
      const count = listings.filter(l => 
        (l.category === 'property' || l.category === 'land') &&
        ((l.city && l.city.toLowerCase() === city.name.toLowerCase()) ||
        ((l as any).region && (l as any).region.toLowerCase() === city.name.toLowerCase()))
      ).length;

      return {
        ...city,
        properties: count
      };
    });
  }, [listings]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue || !dateValue.seconds) return 'Recently Published';
    return new Date(dateValue.seconds * 1000).toLocaleDateString();
  };

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section (Keep Existing) */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-luxury-black pt-40 pb-20">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/40 via-luxury-black/60 to-luxury-black"></div>
        </motion.div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto space-y-8"
          >
            <h1 className="text-5xl md:text-8xl font-display font-bold text-white tracking-tighter leading-[0.95]">
              Trusted Property & Professionals <br />
              <span className="text-luxury-gold">Across the Somali Region</span>
            </h1>
            <p className="text-white/70 text-lg md:text-2xl font-light tracking-wide max-w-2xl mx-auto">
              Buy, sell, rent, and connect with verified agents, engineers, and trusted professionals.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button asChild className="bg-luxury-gold text-luxury-black hover:bg-white text-lg font-bold px-8 py-6 rounded-2xl">
                <Link to="/properties">Browse Properties</Link>
              </Button>
              <Button asChild variant="outline" className="text-white border-white/20 hover:bg-white/10 text-lg font-bold px-8 py-6 rounded-2xl">
                <Link to="/properties/create">List Property</Link>
              </Button>
              <Button asChild variant="outline" className="text-white border-white/20 hover:bg-white/10 text-lg font-bold px-8 py-6 rounded-2xl">
                <Link to="/services">Find Professionals</Link>
              </Button>
            </div>

            {/* Advanced Search Bar */}
            <div className="mt-16 bg-white/10 backdrop-blur-xl p-4 md:p-6 rounded-3xl shadow-2xl border border-white/10 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                 <Input 
                   placeholder="Search..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="bg-white/5 border-white/10 text-white col-span-1 lg:col-span-2 h-14 rounded-xl"
                 />
                 <select className="bg-luxury-black border border-white/10 text-white rounded-xl h-14 px-4 hover:border-luxury-gold focus:border-luxury-gold transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-luxury-gold" value={searchCity} onChange={(e) => setSearchCity(e.target.value)}>
                    <option value="">All Cities</option>
                    <option value="Jigjiga">Jigjiga</option>
                    <option value="Dire Dawa">Dire Dawa</option>
                    <option value="Godey">Godey</option>
                    <option value="Dhagaxbur">Dhagaxbur</option>
                    <option value="Qabridaha">Qabridaha</option>
                    <option value="Addis Ababa">Addis Ababa</option>
                 </select>
                 <select className="bg-luxury-black border border-white/10 text-white rounded-xl h-14 px-4 hover:border-luxury-gold focus:border-luxury-gold transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-luxury-gold" value={searchPropertyType} onChange={(e) => setSearchPropertyType(e.target.value)}>
                    <option value="Houses">Houses</option>
                    <option value="Land">Land</option>
                    <option value="Vehicles">Vehicles</option>
                 </select>
                 <select className="bg-luxury-black border border-white/10 text-white rounded-xl h-14 px-4 hover:border-luxury-gold focus:border-luxury-gold transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-luxury-gold" value={searchBuyRent} onChange={(e) => setSearchBuyRent(e.target.value)}>
                    <option value="Sell">Sell</option>
                    <option value="Rent">Rent</option>
                 </select>
                 <div className="flex items-center gap-4 text-white">
                    <label className="flex items-center gap-2 cursor-pointer text-xs uppercase font-bold tracking-widest text-white/60">
                        <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="accent-luxury-gold" />
                        Verified
                    </label>
                    <Button onClick={handleSearch} className="bg-luxury-gold text-luxury-black font-bold h-14 px-8 rounded-xl w-full">Search</Button>
                 </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/60 text-[10px] uppercase font-bold tracking-widest">
                <span className="flex items-center gap-2"><Shield className="text-luxury-gold" size={14} /> Verified Listings</span>
                <span className="flex items-center gap-2"><Users className="text-luxury-gold" size={14} /> Verified Agents</span>
                <span className="flex items-center gap-2"><Award className="text-luxury-gold" size={14} /> Legal Document Checked</span>
                <span className="flex items-center gap-2"><Star className="text-luxury-gold" size={14} /> Secure Transactions</span>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Discover More</span>
          <div className="w-0.5 h-12 bg-gradient-to-b from-luxury-gold/50 to-transparent"></div>
        </motion.div>
      </section>

      {/* Categories Grid (Specialized Marketplaces) */}
      <section className="py-16 md:py-32 bg-luxury-black overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
            <div>
              <p className="text-luxury-gold font-bold tracking-[0.2em] uppercase text-xs mb-3 md:mb-4">Elite Portfolios</p>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
                Our Specialized <span className="text-white/40">Marketplaces</span>
              </h2>
            </div>
            <Link to="/properties" className="text-luxury-gold flex items-center gap-2 font-semibold hover:gap-4 transition-all group text-sm md:text-base">
              Browse All Inventory <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { icon: <HomeIcon />, title: 'Exclusive Properties', desc: 'Modern villas, townhouses, and luxury apartments.', path: '/properties', color: 'luxury-gold' },
              { icon: <Car />, title: 'Luxury Vehicles', desc: 'Premium SUVs, trucks, and city cars for elite travel.', path: '/vehicles', color: 'white' },
              { icon: <Landmark />, title: 'Strategic Land', desc: 'Secure prime land for commercial and residential growth.', path: '/properties?category=land', color: 'luxury-gold' },
              { icon: <Users />, title: 'News & Reports', desc: 'Regional market updates, investment briefs, and industry intelligence.', path: '/news', color: 'white' },
            ].map((cat, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Link to={cat.path} className="group">
                  <div className="h-full bg-luxury-charcoal/30 border border-white/5 p-8 rounded-3xl hover:bg-luxury-charcoal/50 hover:border-luxury-gold/30 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] scale-150 transform -rotate-12 group-hover:opacity-10 transition-all duration-700">
                      {cat.icon}
                    </div>
                    <div className={`w-14 h-14 rounded-2xl bg-luxury-black flex items-center justify-center mb-8 shadow-xl shadow-black/40 group-hover:scale-110 transition-transform ${cat.color === 'luxury-gold' ? 'text-luxury-gold' : 'text-white'}`}>
                      {cat.icon}
                    </div>
                    <h3 className="text-xl font-display font-bold text-white mb-4 group-hover:text-luxury-gold transition-colors">{cat.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed mb-6">{cat.desc}</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-white/20 group-hover:text-white transition-all">
                      VIEW LISTINGS <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Properties (Featured Listings) */}
      <section className="py-16 md:py-32 bg-luxury-charcoal/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-20">
            <p className="text-luxury-gold font-bold tracking-[0.2em] uppercase text-xs mb-3 md:mb-4">Curated Selection</p>
            <h2 className="text-3xl md:text-6xl font-display font-bold text-white tracking-tight">
              Handpicked <span className="text-white/40">Excellence</span>
            </h2>

            {/* Filter Summary */}
            {isFilterActive && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 flex flex-wrap justify-center gap-2">
                    <div className="text-white/60 mb-2 w-full text-sm">{listings.length} {listings.length === 1 ? 'result' : 'results'} found</div>
                    {searchQuery && <Badge onClick={() => removeFilter('search')} className="cursor-pointer bg-white/10 text-white hover:bg-white/20">Query: {searchQuery} ✕</Badge>}
                    {searchCity !== '' && <Badge onClick={() => removeFilter('city')} className="cursor-pointer bg-white/10 text-white hover:bg-white/20">{searchCity} ✕</Badge>}
                    {searchPropertyType !== 'Houses' && <Badge onClick={() => removeFilter('type')} className="cursor-pointer bg-white/10 text-white hover:bg-white/20">{searchPropertyType} ✕</Badge>}
                    {searchBuyRent !== 'Sell' && <Badge onClick={() => removeFilter('status')} className="cursor-pointer bg-white/10 text-white hover:bg-white/20">{searchBuyRent} ✕</Badge>}
                    {verifiedOnly && <Badge onClick={() => removeFilter('verified')} className="cursor-pointer bg-luxury-gold text-luxury-black hover:bg-white">Verified Only ✕</Badge>}
                    <Button onClick={resetFilters} variant="link" className="text-luxury-gold hover:text-white underline text-sm p-0 h-auto">Reset Filters</Button>
                </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {loading ? (
               <div className="col-span-full flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-12 h-12 text-luxury-gold animate-spin mb-4" />
                <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">Accessing Database...</p>
              </div>
            ) : filteredProperties.length > 0 ? (
              filteredProperties.map((prop, i) => (
                <motion.div
                  key={prop.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <PropertyCard property={prop} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-3">
                <EmptyState 
                  title="No Featured Properties" 
                  description="Our curators are currently vetting new landmark estates for this collection." 
                  icon={<HomeIcon size={48} />}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Latest News (Latest Insights) */}
      <section className="py-16 md:py-32 bg-luxury-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
            <div>
              <p className="text-luxury-gold font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs mb-3 md:mb-4">Intelligence Briefs</p>
              <h2 className="text-3xl md:text-6xl font-display font-bold text-white tracking-tight">
                Latest <span className="text-white/40">Insights</span>
              </h2>
            </div>
            <Link to="/news" className="text-luxury-gold flex items-center gap-2 font-semibold hover:gap-4 transition-all group text-sm md:text-base">
              View All Reports <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {loading ? (
               <div className="col-span-full flex flex-col items-center justify-center py-20 animate-pulse text-white/20 uppercase font-bold tracking-[0.3em]">Accessing Intel...</div>
            ) : latestArticles.length > 0 ? (
              latestArticles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link to={`/news/${article.id}`} className="group block h-full">
                    <div className="glass-card h-full flex flex-col rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-luxury-gold/30 transition-all duration-500">
                      <div className="aspect-[16/9] overflow-hidden">
                        <img 
                          src={article.featuredImage || '/placeholder-news.jpg'} 
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" 
                          alt={article.title} 
                        />
                      </div>
                      <div className="p-8 flex flex-col flex-grow">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-luxury-gold text-[10px] uppercase tracking-[0.2em] font-bold">{article.category}</span>
                          <span className="text-white/30 text-[10px] uppercase font-bold tracking-widest">{formatDate(article.createdAt)}</span>
                        </div>
                        <h3 className="text-xl font-display font-bold text-white mb-3 group-hover:text-luxury-gold transition-colors tracking-tight leading-snug flex-grow">{article.title}</h3>
                        <p className="text-white/40 text-sm font-light leading-relaxed line-clamp-2">{article.summary}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center glass-card rounded-[3rem] border-white/5 text-white/40">No reports available.</div>
            )}
          </div>
        </div>
      </section>

      {/* Popular Cities (Strategic Locations) */}
      <section className="py-16 md:py-32 bg-luxury-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 md:mb-16 gap-6">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
              Strategic <span className="text-white/40">Locations</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cities.map((city, i) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                onClick={() => navigate(`/properties?city=${city.name}`)}
                className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer border border-white/5 hover:border-luxury-gold/30 glass-card transition-all"
              >
                <img src={city.image} alt={city.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <h3 className="text-3xl font-display font-bold text-white mb-2">{city.name}</h3>
                  <p className="text-luxury-gold font-semibold text-sm tracking-widest uppercase">{city.properties} Premium Listings</p>
                  <div className="mt-6 flex items-center text-white/60 group-hover:text-luxury-gold transition-colors text-sm font-semibold gap-2">
                    <span>Explore City</span>
                    <ArrowRight className="group-hover:translate-x-1.5 transition-transform" size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles (Luxury Mobility) */}
      <section className="py-16 md:py-32 bg-luxury-charcoal/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
            <div>
              <p className="text-luxury-gold font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs mb-3 md:mb-4">Masterpiece Collection</p>
              <h2 className="text-3xl md:text-6xl font-display font-bold text-white tracking-tight">
                Luxury <span className="text-white/40">Mobility</span>
              </h2>
            </div>
            <Link to="/vehicles" className="text-luxury-gold flex items-center gap-2 font-semibold hover:gap-4 transition-all group text-sm md:text-base">
              View Vehicle Catalog <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {loading ? (
               <div className="col-span-full flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-12 h-12 text-luxury-gold animate-spin mb-4" />
                <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">Accessing Database...</p>
              </div>
            ) : filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle, i) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <VehicleCard vehicle={vehicle} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2">
                <EmptyState 
                  title="Portfolio Empty" 
                  description="Our automotive collection is currently under acquisition review." 
                  icon={<Car size={48} />}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trusted Professionals */}
      <section className="py-16 md:py-32 bg-luxury-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
            <div>
              <p className="text-luxury-gold font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs mb-3 md:mb-4">Elite Human Capital</p>
              <h2 className="text-3xl md:text-6xl font-display font-bold text-white tracking-tight">
                Trusted <span className="text-white/40">Professionals</span>
              </h2>
              <p className="text-white/40 mt-4 max-w-lg text-sm md:text-base">Dedicated experts building the future of the Somali Region through engineering, technology, and specialized skills.</p>
            </div>
            <Link to="/services" className="text-luxury-gold flex items-center gap-2 font-semibold hover:gap-4 transition-all group text-sm md:text-base">
              Browse Professional Registry <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {loading ? (
               <div className="col-span-full flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-12 h-12 text-luxury-gold animate-spin mb-4" />
                <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">Accessing Database...</p>
              </div>
            ) : topProfessionals.length > 0 ? (
              topProfessionals.map((pro, i) => (
                <ProfessionalCard key={pro.id} professional={pro} />
              ))
            ) : (
              <div className="col-span-1 md:col-span-3">
                <EmptyState 
                  title="Registry Offline" 
                  description="Verified expert profiles are currently undergoing regional background checks." 
                  icon={<Award size={48} />}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Verified Broker Network */}
      <section className="py-16 md:py-32 bg-luxury-charcoal/30 border-y border-white/5 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C5A059]/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C5A059]/5 blur-[80px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/4"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
            <div>
              <p className="text-luxury-gold font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs mb-3 md:mb-4">Anti-Fraud Protection Network</p>
              <h2 className="text-3xl md:text-6xl font-display font-bold text-white tracking-tight">
                Verified <span className="text-luxury-gold">Brokers</span>
              </h2>
              <p className="text-white/40 mt-4 max-w-lg text-sm md:text-base">Identity verified. Legal compliance checked. Connect directly with the safest and most elite property agents in the region.</p>
            </div>
            <Link to="/brokers" className="text-luxury-gold flex items-center gap-2 font-semibold hover:gap-4 transition-all group text-sm md:text-base bg-luxury-gold/10 px-6 py-3 rounded-xl border border-luxury-gold/30 hover:bg-luxury-gold hover:text-black">
              View Broker Registry <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
               <div className="col-span-full flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-12 h-12 text-luxury-gold animate-spin mb-4" />
                <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">Querying Legal Database...</p>
              </div>
            ) : verifiedBrokers.length > 0 ? (
              verifiedBrokers.map((broker, i) => (
                <BrokerCard key={broker.id} broker={broker} index={i} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center glass-card rounded-[3rem] border-white/5 text-white/40">
                <Shield className="w-12 h-12 mx-auto text-luxury-gold opacity-50 mb-4" />
                <p>Regional legal audits are ongoing. No brokers fully verified yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Opportunities Hub Section */}
      <section className="py-16 md:py-32 bg-gradient-to-b from-luxury-black via-luxury-black to-luxury-black border-t border-white/5 relative overflow-hidden">
        {/* Abstract luxury ambient glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-luxury-gold/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-luxury-gold/10 border border-luxury-gold/20 mb-4 animate-fade-in">
                <Sparkles size={14} className="text-luxury-gold animate-pulse" />
                <p className="text-luxury-gold font-bold tracking-[0.15em] uppercase text-[10px] md:text-xs">
                  AmaanEstate Opportunities Hub
                </p>
              </div>
              <h2 className="text-3xl md:text-6xl font-display font-bold text-white tracking-tight">
                Empowering Youth <span className="text-white/40">& Economic Gigs</span>
              </h2>
              <p className="text-white/40 mt-4 text-sm md:text-base leading-relaxed">
                Transforming the Somali Region into a vibrant digital job network. Learn premium skills, find lucrative gigs, and monetize connections directly with AmaanEstate.
              </p>
            </div>
          </div>

          {/* Interactive Categories Tabs */}
          <div className="flex flex-wrap gap-2 md:gap-3 mb-10 pb-2 border-b border-white/10">
            {[
              { id: 'all', label: 'All Opportunities', icon: <Sparkles size={16} /> },
              { id: 'jobs', label: '💼 Gigs & Jobs', icon: <Briefcase size={16} /> },
              { id: 'learn', label: '🧠 Learn & Grow', icon: <GraduationCap size={16} /> },
              { id: 'earn', label: '💰 Earn Commission', icon: <Coins size={16} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-4 md:px-6 py-3 rounded-xl text-xs md:text-sm font-bold tracking-wide transition-all duration-300 flex items-center gap-2 border ${
                  activeTab === tab.id
                    ? 'bg-luxury-gold text-luxury-black border-luxury-gold shadow-lg shadow-luxury-gold/15'
                    : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Opportunities Cards Grid */}
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {filteredOpportunities.map((opp) => (
              <motion.div
                key={opp.id}
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 }
                }}
                className="group relative flex flex-col justify-between bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 transition-all duration-300 hover:scale-[1.02] hover:border-luxury-gold/40 shadow-xl hover:shadow-2xl hover:shadow-luxury-gold/5"
              >
                {/* Visual badge top right */}
                <span className="absolute top-6 right-6 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest rounded bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20">
                  {opp.category === 'jobs' ? opp.type : opp.category === 'learn' ? opp.learningCategory : 'monetization'}
                </span>

                <div>
                  {/* Icon and Provider header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold">
                      {opp.category === 'jobs' && <Briefcase size={18} />}
                      {opp.category === 'learn' && <GraduationCap size={18} />}
                      {opp.category === 'earn' && <Coins size={18} />}
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{opp.provider}</p>
                      {opp.location && (
                        <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="text-luxury-gold" /> {opp.location}
                        </p>
                      )}
                      {opp.duration && (
                        <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
                          <Clock size={10} className="text-luxury-gold" /> {opp.duration}
                        </p>
                      )}
                      {opp.earnDetail && (
                        <p className="text-luxury-gold text-xs font-bold tracking-tight mt-0.5">
                          💰 {opp.earnDetail}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg md:text-xl font-display font-bold text-white mb-3 group-hover:text-luxury-gold transition-colors leading-snug">
                    {opp.title}
                  </h3>
                  <p className="text-white/50 text-xs md:text-sm leading-relaxed mb-6">
                    {opp.description}
                  </p>

                  {/* Bullet points summary checkmarks */}
                  <ul className="space-y-2 mb-8 border-t border-white/5 pt-4">
                    {opp.bulletPoints.map((pt, index) => (
                      <li key={index} className="flex gap-2 text-xs text-white/40 leading-tight">
                        <CheckCircle2 size={14} className="text-luxury-gold shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Primary Action Button */}
                <Button
                  onClick={() => setSelectedOpportunity(opp)}
                  className="w-full bg-white/5 text-white hover:bg-luxury-gold hover:text-luxury-black transition-all border border-white/10 hover:border-luxury-gold h-12 rounded-xl text-xs font-bold tracking-wide flex items-center justify-center gap-2 group/btn"
                >
                  <span>{opp.actionText}</span>
                  <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modern Dialog/Modal for Applying & Registering */}
      <AnimatePresence>
        {selectedOpportunity && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Dark glassmorphic overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOpportunity(null)}
              className="absolute inset-0 bg-luxury-black/80 backdrop-blur-md"
            />

            {/* Modal Sheet Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-lg bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-luxury-gold/5 max-h-[90vh] flex flex-col"
            >
              {/* Header Visual Stripe */}
              <div className="bg-luxury-gold/10 p-6 border-b border-white/5 flex justify-between items-start gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-luxury-gold/20 flex items-center justify-center text-luxury-gold border border-luxury-gold/20 shrink-0">
                    {selectedOpportunity.category === 'jobs' && <Briefcase size={18} />}
                    {selectedOpportunity.category === 'learn' && <GraduationCap size={18} />}
                    {selectedOpportunity.category === 'earn' && <Coins size={18} />}
                  </div>
                  <div>
                    <span className="text-[9px] font-bold tracking-widest text-[#d4af37] uppercase bg-luxury-gold/20 border border-luxury-gold/30 px-2 py-0.5 rounded">
                      {selectedOpportunity.category}
                    </span>
                    <h4 className="text-white font-display font-medium text-xs mt-1 uppercase tracking-wider">{selectedOpportunity.provider}</h4>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOpportunity(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
                {submitSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-10 space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-2 animate-bounce">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white tracking-tight">Codsigaaga waa la Gudbiyay!</h3>
                    <p className="text-green-400 font-bold text-sm tracking-wide">Application Submitted Successfully!</p>
                    <p className="text-white/40 text-xs max-w-xs mx-auto leading-relaxed mt-2">
                      Ku soo dhawaada AmaanEstate! Maamulkayaga takhasuska ah ayaa kugu soo xiriiri doona taleefankaaga dhowaan si loo dhameystiro adeegga.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <h3 className="text-lg md:text-xl font-display font-bold text-white leading-tight">
                        {selectedOpportunity.title}
                      </h3>
                      <p className="text-white/55 text-xs md:text-sm leading-relaxed">
                        {selectedOpportunity.description}
                      </p>
                    </div>

                    {/* Meta values */}
                    <div className="grid grid-cols-2 gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-xs text-white/50">
                      <div>
                        <p className="text-white/30 font-bold uppercase tracking-wider text-[9px] mb-1">Onboarding Agency</p>
                        <p className="font-semibold text-white">{selectedOpportunity.provider}</p>
                      </div>
                      {selectedOpportunity.location && (
                        <div>
                          <p className="text-white/30 font-bold uppercase tracking-wider text-[9px] mb-1">Target Location</p>
                          <p className="font-semibold text-luxury-gold">{selectedOpportunity.location}</p>
                        </div>
                      )}
                      {selectedOpportunity.type && (
                        <div>
                          <p className="text-white/30 font-bold uppercase tracking-wider text-[9px] mb-1">Opportunity Type</p>
                          <p className="font-semibold text-luxury-gold">{selectedOpportunity.type}</p>
                        </div>
                      )}
                      {selectedOpportunity.duration && (
                        <div>
                          <p className="text-white/30 font-bold uppercase tracking-wider text-[9px] mb-1">Duration & Pace</p>
                          <p className="font-semibold text-luxury-gold">{selectedOpportunity.duration}</p>
                        </div>
                      )}
                      {selectedOpportunity.earnDetail && (
                        <div className="col-span-2">
                          <p className="text-white/30 font-bold uppercase tracking-wider text-[9px] mb-1">Direct Profit Reward</p>
                          <p className="font-semibold text-green-400 flex items-center gap-1.5 mt-0.5">
                            <Coins size={12} /> {selectedOpportunity.earnDetail}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Requirements Checkmarks list */}
                    <div className="space-y-2">
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Key Terms & Requirements</p>
                      <ul className="space-y-2 border-l-2 border-luxury-gold/30 pl-3">
                        {selectedOpportunity.bulletPoints.map((pt, idx) => (
                          <li key={idx} className="text-xs text-white/50 flex gap-1 items-start leading-relaxed">
                            <span className="text-luxury-gold font-bold">✓</span> {pt}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Form block */}
                    <form onSubmit={handleApplySubmit} className="space-y-4 border-t border-white/5 pt-6">
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest font-mono">Register Details Now / Codso Hadda</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Full Name (Magacaaga Oo Buuxa)</label>
                          <Input
                            placeholder="e.g., Maxamed Cali"
                            value={applicantName}
                            onChange={(e) => setApplicantName(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 rounded-xl"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Phone (Taleefankaaga)</label>
                          <Input
                            placeholder="e.g., +252 61 XXXXXXX"
                            value={applicantPhone}
                            onChange={(e) => setApplicantPhone(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Your City / Region (Magaaladaada)</label>
                        <Input
                          placeholder="e.g., Jigjiga, Hargeisa, Garowe"
                          value={applicantCity}
                          onChange={(e) => setApplicantCity(e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 rounded-xl"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Brief Cover Note / Sideed u Caawin Kartaa (Optional)</label>
                        <textarea
                          placeholder="Include references, skills, or questions here..."
                          value={applicantNote}
                          onChange={(e) => setApplicantNote(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 text-xs min-h-[70px] focus:outline-none focus:border-luxury-gold transition-colors"
                        />
                      </div>

                      <div className="flex gap-3 justify-end pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setSelectedOpportunity(null)}
                          className="h-11 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-xs font-bold"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-luxury-gold text-luxury-black font-bold h-11 px-6 rounded-xl text-xs tracking-wider shadow-lg shadow-luxury-gold/10 hover:bg-white transition-all flex items-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <span>Submit Application</span>
                              <ArrowRight size={14} />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Why Choose Us (Premium Standards) */}
      <section className="py-16 md:py-32 bg-luxury-black border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-luxury-gold font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs mb-3 md:mb-4">Premium Standards</p>
              <h2 className="text-3xl md:text-6xl font-display font-bold text-white mb-6 md:mb-8 tracking-tight leading-tight">
                Why Discerning <br /> Client Choose <span className="text-white/40">AmaanEstate</span>
              </h2>
              <div className="space-y-8">
                {[
                  { icon: <Shield size={24} />, title: 'Guaranteed Transparency', desc: 'Every listing is verified for ownership and legal compliance in the Somali Region.' },
                  { icon: <Award size={24} />, title: 'Premium Portfolio', desc: 'We only list high-standard properties and vehicles that meet our luxury criteria.' },
                  { icon: <Users size={24} />, title: 'Expert Local Insight', desc: 'Our team possesses deep knowledge of the regional market dynamics and growth areas.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-12 h-12 rounded-xl bg-luxury-gold/10 flex items-center justify-center shrink-0 text-luxury-gold shadow-lg shadow-luxury-gold/5 border border-luxury-gold/10">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-display font-bold text-white mb-2">{item.title}</h4>
                      <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-[3rem] overflow-hidden group shadow-2xl shadow-luxury-gold/5"
            >
              <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200" alt="Luxury Interior" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-luxury-black/10"></div>
              <div className="absolute bottom-10 left-10 p-10 bg-luxury-black/60 backdrop-blur-xl border border-white/10 rounded-3xl max-w-sm">
                <div className="flex gap-1 text-luxury-gold mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-white font-medium italic mb-4">"AmaanEstate completely transformed how I find investment opportunities in Jigjiga. Their professionalism is unmatched."</p>
                <p className="text-luxury-gold font-bold text-sm tracking-widest uppercase">Elite Investor</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Professional CTA Section */}
      <section className="py-16 md:py-32 bg-luxury-gold/5 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-luxury-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] md:rounded-[4rem] p-10 md:p-20 text-center">
             <div className="w-16 h-16 md:w-20 md:h-20 bg-luxury-gold/10 rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-6 md:mb-8 text-luxury-gold">
                <Briefcase size={32} className="md:w-10 md:h-10" />
             </div>
             <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 md:mb-6">Are You a Skilled Professional?</h2>
             <p className="text-white/40 text-base md:text-lg mb-8 md:mb-12 max-w-xl mx-auto tracking-tight">Create your professional profile and connect with clients, investors, developers, and businesses across the Somali Region.</p>
             <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
                <Button asChild className="bg-luxury-gold text-luxury-black hover:bg-white transition-all h-14 md:h-16 px-8 md:px-10 rounded-xl md:rounded-2xl font-bold">
                   <Link to="/become-pro">Join The Network</Link>
                </Button>
                <Link to="/services" className="h-14 md:h-16 px-8 md:px-10 rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-center text-white font-bold hover:bg-white/5 transition-colors">
                   Browse Professionals
                </Link>
             </div>
          </div>
        </div>
      </section>

      {/* Lifestyle CTA (Elevate Your Lifestyle) */}
      <section className="py-16 md:py-20 bg-luxury-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-luxury-gold/10 blur-[150px] rounded-full translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-luxury-gold/5 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-luxury-gold h-1 lg:w-32 mb-8 md:mb-12"></div>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 md:gap-10">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-7xl font-display font-extrabold text-white mb-4 md:mb-6 tracking-tighter leading-tight">
                Ready To <span className="text-luxury-gold">Elevate</span> <br /> Your Lifestyle?
              </h2>
              <p className="text-white/50 text-lg md:text-xl font-light">Join the region's most exclusive real estate and vehicle marketplace today.</p>
            </div>
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full lg:w-auto">
                <Button asChild size="lg" className="bg-white text-luxury-black hover:bg-luxury-gold transition-all font-bold px-12 h-14 md:h-16 rounded-xl md:rounded-2xl text-base md:text-lg shadow-xl shadow-white/5 w-full sm:w-auto">
                  <Link to="/register">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 h-14 md:h-16 px-12 rounded-xl md:rounded-2xl font-bold text-base md:text-lg w-full sm:w-auto">
                  <Link to="/contact">Contact Concierge</Link>
                </Button>
              </div>
          </div>
        </div>
      </section>
    </div>
  );
}
