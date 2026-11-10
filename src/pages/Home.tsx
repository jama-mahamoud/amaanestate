import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { 
  Building, MapPin, Search, Sparkles, SlidersHorizontal, 
  ArrowRight, ShieldCheck, CheckCircle2, Bookmark, Calendar, 
  User, RefreshCw, Star, Landmark, Users 
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { db, handleFirestoreError, OperationType } from '../services/firestore';
import { searchProperties } from '../services/properties';
import { getLatestArticles, Article } from '../services/articles';
import { Property, Agent } from '../types';
import PropertyCard from '../components/properties/PropertyCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import PremiumSelect from '../components/ui/PremiumSelect';

export default function Home() {
  const navigate = useNavigate();

  // Search form fields
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntent, setSelectedIntent] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Firestore retrieved sections
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [latestProperties, setLatestProperties] = useState<Property[]>([]);
  const [featuredAgents, setFeaturedAgents] = useState<Agent[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [activeLocations, setActiveLocations] = useState<{ neighborhood: string; city: string; count: number }[]>([]);
  
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'AmaanEstate | Modern Real Estate Marketplace',
    description: 'The location-centric digital property discovery catalog and directory platform for Jigjiga, the Somali Region, and East Africa.'
  });

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/properties', {
      state: {
        searchQuery,
        selectedIntent,
        selectedType
      }
    });
  };

  useEffect(() => {
    async function loadHomepageData() {
      setLoading(true);
      try {
        // 1. Fetch featured properties
        const featuredProps = await searchProperties({ featured: true, status: 'available' });
        setFeaturedProperties(featuredProps.slice(0, 3));

        // 2. Fetch latest properties
        const allProps = await searchProperties({ status: 'available' });
        setLatestProperties(allProps.slice(0, 3));

        // Calculate active locations from real retrieved properties
        const locationCounts: { [key: string]: { city: string; count: number } } = {};
        allProps.forEach(prop => {
          if (prop.location) {
            const locName = prop.location.neighborhood || prop.location.district || 'General';
            const city = prop.location.city || 'Jigjiga';
            if (!locationCounts[locName]) {
              locationCounts[locName] = { city, count: 0 };
            }
            locationCounts[locName].count += 1;
          }
        });
        const computedLocations = Object.entries(locationCounts).map(([neighborhood, info]) => ({
          neighborhood,
          city: info.city,
          count: info.count
        }));
        setActiveLocations(computedLocations);

        // 3. Fetch latest articles from preserved collection
        const articles = await getLatestArticles(3);
        setLatestArticles(articles);

        // 4. Fetch featured agents from collection
        const agentsRef = collection(db, 'agents');
        const agentsSnap = await getDocs(query(agentsRef, limit(3)));
        const agentsList: Agent[] = agentsSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'AmaanEstate Partner',
            profileImage: data.profileImage || '',
            phone: data.phone || '[Phone Pending]',
            email: data.email || '[Email Pending]',
            bio: data.bio || 'Licensed Broker',
            location: data.location || 'Jigjiga',
            specialization: Array.isArray(data.specialization) ? data.specialization : ['Real Estate Consulting'],
            active: !!data.active,
            createdAt: data.createdAt || new Date().toISOString()
          };
        });
        setFeaturedAgents(agentsList);

      } catch (err) {
        console.error('Error loading homepage contents:', err);
        handleFirestoreError(err, OperationType.GET, 'homepage');
      } finally {
        setLoading(false);
      }
    }
    loadHomepageData();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      
      {/* 1. HERO SECTION WITH SEARCH ENGINE */}
      <section className="relative min-h-[80vh] sm:min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-[#0b0b14] via-[#050508] to-[#050508] border-b border-white/[0.02] px-4 overflow-hidden">
        {/* Abstract futuristic background grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
        
        {/* Soft cyan radial lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[300px] h-[300px] bg-blue-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl w-full text-center space-y-8 relative z-10 py-12">
          {/* Status Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 text-xxs font-semibold tracking-wider uppercase font-mono"
          >
            <Sparkles size={11} className="text-cyan-400 animate-pulse" />
            <span>Marketplace Upgraded to Firestore Real-Time Engine</span>
          </motion.div>

          {/* Heading */}
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight font-display"
            >
              Discover Verified Properties <br className="hidden sm:inline" /> 
              In Jigjiga & The Somali Region
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed"
            >
              AmaanEstate is a location-centric property catalog and directory for Jigjiga and the Somali Region, simplifying listing discovery for buyers, tenants, and developers.
            </motion.p>
          </div>

          {/* Core Structured Search Console */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-3xl mx-auto bg-[#0c0c14] border border-white/[0.05] rounded-xl p-4 sm:p-5 shadow-2xl shadow-cyan-500/[0.01]"
          >
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search query location */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="E.g. Kebele 06, Airport Road..."
                    className="pl-9 bg-[#050508] border-neutral-800 text-xs text-white placeholder-neutral-600 focus-visible:ring-cyan-500/10"
                  />
                </div>

                {/* Intent type select */}
                <PremiumSelect
                  label="Listing Intent"
                  value={selectedIntent}
                  onChange={setSelectedIntent}
                  options={[
                    { value: 'all', label: 'Buy & Rent (All)' },
                    { value: 'sale', label: 'For Sale' },
                    { value: 'rent', label: 'For Rent' }
                  ]}
                  className="bg-[#050508] border-neutral-800 text-xs"
                />

                {/* Property category select */}
                <PremiumSelect
                  label="Classification"
                  value={selectedType}
                  onChange={setSelectedType}
                  options={[
                    { value: 'all', label: 'All Property Types' },
                    { value: 'house', label: 'Residential House' },
                    { value: 'apartment', label: 'Apartment Space' },
                    { value: 'villa', label: 'Luxury Villa' },
                    { value: 'land', label: 'Raw Land Parcel' },
                    { value: 'commercial', label: 'Commercial Complex' }
                  ]}
                  className="bg-[#050508] border-neutral-800 text-xs"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs py-2.5 px-6 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/15"
                >
                  <Search size={13} />
                  <span>Execute Verification Search</span>
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* 2. CATEGORY QUICK LINKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-1">
          <span className="text-xxs font-mono font-bold uppercase tracking-widest text-cyan-400">Classifications</span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Browse By Listing Category</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: '/buy', title: 'Buy Estates', desc: 'Verified houses & commercial investments.', icon: <Building size={18} /> },
            { to: '/rent', title: 'Rent Space', desc: 'Apartments, duplexes and retail units.', icon: <CheckCircle2 size={18} /> },
            { to: '/land', title: 'Land Parcels', desc: 'Raw development plot ownerships.', icon: <Landmark size={18} /> },
            { to: '/commercial', title: 'Commercial Desk', desc: 'Offices, clinics, warehouses and shops.', icon: <Users size={18} /> }
          ].map((cat, idx) => (
            <Link 
              key={idx} 
              to={cat.to}
              className="p-5 rounded-xl bg-[#0c0c14] border border-white/[0.04] hover:border-cyan-500/20 transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div className="w-9 h-9 rounded-lg bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/10 transition-colors">
                {cat.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors uppercase tracking-wider font-mono">{cat.title}</h3>
                <p className="text-xxs text-neutral-500 leading-normal">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES (REAL FIRESTORE DATA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-white/[0.02] pb-3">
          <div className="space-y-1">
            <span className="text-xxs font-mono font-bold uppercase tracking-widest text-cyan-400">Premium Picks</span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Featured Real Estate</h2>
          </div>
          <Link to="/properties" className="text-xxs font-bold text-neutral-400 hover:text-white uppercase tracking-wider flex items-center gap-1">
            <span>View All</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <RefreshCw className="text-cyan-400 animate-spin" size={24} />
          </div>
        ) : featuredProperties.length === 0 ? (
          <div className="p-12 text-center bg-[#0c0c14]/30 border border-white/[0.02] rounded-xl text-neutral-500 text-xs">
            No featured properties found in the database. 
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* 4. LATEST LISTINGS (REAL FIRESTORE DATA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-white/[0.02] pb-3">
          <div className="space-y-1">
            <span className="text-xxs font-mono font-bold uppercase tracking-widest text-cyan-400">Fresh Registry</span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Latest Property Listings</h2>
          </div>
          <Link to="/properties" className="text-xxs font-bold text-neutral-400 hover:text-white uppercase tracking-wider flex items-center gap-1">
            <span>View All</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <RefreshCw className="text-cyan-400 animate-spin" size={24} />
          </div>
        ) : latestProperties.length === 0 ? (
          <div className="p-12 text-center bg-[#0c0c14]/30 border border-white/[0.02] rounded-xl text-neutral-500 text-xs">
            No property listings currently cataloged.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {latestProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* 5. POPULAR INVESTMENT LOCATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-white/[0.02] pb-3">
          <div className="space-y-1">
            <span className="text-xxs font-mono font-bold uppercase tracking-widest text-cyan-400">Demographics</span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Active Regional Zones</h2>
          </div>
          <Link to="/locations" className="text-xxs font-bold text-neutral-400 hover:text-white uppercase tracking-wider flex items-center gap-1">
            <span>Explore Zones</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {activeLocations.length === 0 ? (
          <div className="p-10 text-center bg-[#0c0c14]/30 border border-white/[0.02] rounded-xl text-neutral-500 text-xs">
            No active properties cataloged in regional zones yet. Property counts will populate dynamically as listings are cataloged.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {activeLocations.slice(0, 3).map((loc, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-xl bg-[#0c0c14] border border-white/[0.04] flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-xxs font-mono font-bold text-cyan-400">{loc.neighborhood}</span>
                  <h4 className="text-xs font-bold text-white">{loc.city}</h4>
                </div>
                <span className="px-2.5 py-1 text-xxs font-bold font-mono text-cyan-400 bg-cyan-500/5 rounded-md border border-cyan-500/10">
                  {loc.count} {loc.count === 1 ? 'Property' : 'Properties'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. FEATURED AGENTS (REAL FIRESTORE DATA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-white/[0.02] pb-3">
          <div className="space-y-1">
            <span className="text-xxs font-mono font-bold uppercase tracking-widest text-cyan-400">Licensed Brokers</span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Our Verified Advisors</h2>
          </div>
          <Link to="/agents" className="text-xxs font-bold text-neutral-400 hover:text-white uppercase tracking-wider flex items-center gap-1">
            <span>Meet Agents</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <RefreshCw className="text-cyan-400 animate-spin" size={24} />
          </div>
        ) : featuredAgents.length === 0 ? (
          <div className="p-12 text-center bg-[#0c0c14]/30 border border-white/[0.02] rounded-xl text-neutral-500 text-xs">
            Agents directory currently offline. 
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featuredAgents.map((agent) => (
              <div key={agent.id} className="p-5 rounded-xl bg-[#0c0c14] border border-white/[0.04] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-neutral-900 border border-white/[0.04]">
                    <img 
                      src={agent.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
                      alt={agent.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{agent.name}</h4>
                    <p className="text-xxs text-neutral-400">{agent.location}</p>
                  </div>
                </div>
                <p className="text-xxs text-neutral-400 leading-normal italic line-clamp-2">
                  "{agent.bio}"
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 7. LATEST ARTICLES (REAL FIRESTORE DATA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-white/[0.02] pb-3">
          <div className="space-y-1">
            <span className="text-xxs font-mono font-bold uppercase tracking-widest text-cyan-400">Market Intelligence</span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Market Reports & Guides</h2>
          </div>
          <Link to="/articles" className="text-xxs font-bold text-neutral-400 hover:text-white uppercase tracking-wider flex items-center gap-1">
            <span>Read All Reports</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <RefreshCw className="text-cyan-400 animate-spin" size={24} />
          </div>
        ) : latestArticles.length === 0 ? (
          <div className="p-12 text-center bg-[#0c0c14]/30 border border-white/[0.02] rounded-xl text-neutral-500 text-xs">
            Market editorial indexes currently updating.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {latestArticles.map((art) => (
              <div key={art.id} className="p-5 rounded-xl bg-[#0c0c14] border border-white/[0.04] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xxs text-neutral-500 font-mono">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(art.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-2 hover:text-cyan-300 transition-colors">
                    <Link to={`/articles/${art.slug}`}>{art.title}</Link>
                  </h4>
                  <p className="text-xxs text-neutral-400 line-clamp-3 leading-normal">{art.summary}</p>
                </div>
                <Link to={`/articles/${art.slug}`} className="text-xxs text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-widest flex items-center gap-1 pt-2">
                  <span>Read Report</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 8. CALL TO ACTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-[#0c0c14] border border-white/[0.04] text-center space-y-6 relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/[0.02] rounded-full blur-[60px] pointer-events-none" />
          
          <div className="max-w-xl mx-auto space-y-3">
            <span className="text-xxs font-mono font-bold uppercase tracking-widest text-cyan-400">List With Us</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">Ready to Sell or Rent Your Property?</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Submit your property details to our listings directory to connect directly with interested buyers and tenants across the region.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs py-2.5 px-6 cursor-pointer"
            >
              List Property Form
            </Button>
            <Button
              onClick={() => navigate('/contact')}
              variant="outline"
              className="w-full sm:w-auto border-neutral-800 text-neutral-300 hover:bg-white/[0.04] text-xs py-2.5 px-6 cursor-pointer"
            >
              Contact Advisory Office
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
