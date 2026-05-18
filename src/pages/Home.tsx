import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Home as HomeIcon, Car, Landmark, ArrowRight, Shield, Award, Users, Star, Briefcase, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import PropertyCard from '@/components/PropertyCard';
import VehicleCard from '@/components/VehicleCard';
import ProfessionalCard from '@/components/ProfessionalCard';
import EmptyState from '@/components/EmptyState';
import { Property, VehicleListing, Professional, ListingCategory, Article } from '@/types';
import { listingService } from '@/services/listingService';
import { articleService } from '@/services/articleService';

export default function Home() {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [latestVehicles, setLatestVehicles] = useState<VehicleListing[]>([]);
  const [topProfessionals, setTopProfessionals] = useState<Professional[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('All Cities');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [propsRes, vehiclesRes, prosRes, articlesRes] = await Promise.all([
          listingService.getListings({ category: 'property', limit: 3 }),
          listingService.getListings({ category: 'vehicle', limit: 2 }),
          listingService.getProfessionalServices('All', 'active'),
          articleService.getArticles()
        ]);
        
        setFeaturedProperties(propsRes.listings as Property[]);
        setLatestVehicles(vehiclesRes.listings as VehicleListing[]);
        setLatestArticles(articlesRes.slice(0, 3));
        
        // Map services to professionals for display
        const mappedPros: Professional[] = prosRes.slice(0, 3).map(s => ({
          id: s.id,
          name: "Verified Specialist",
          title: s.title,
          category: s.category,
          skills: [s.category],
          experienceYears: 5,
          city: s.city,
          image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
          rating: 5.0,
          reviewCount: 1,
          availability: 'Available',
          bio: s.description,
          isVerified: true
        }));
        setTopProfessionals(mappedPros);
      } catch (err) {
        console.error("Home page data initialization failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    if (searchQuery) {
      navigate(`/properties?search=${searchQuery}&city=${searchCity}`);
    }
  };

  const cities = [
    { name: 'Jigjiga', properties: 42, image: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Dire Dawa', properties: 28, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Addis Ababa', properties: 156, image: 'https://images.unsplash.com/photo-1449156003141-3586624ad722?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Hargeisa', properties: 34, image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1200&auto=format&fit=crop' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-luxury-black">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
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

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="bg-luxury-gold text-luxury-black border-0 uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold px-3 md:px-4 py-1 mb-4 md:mb-6 animate-pulse text-[9px] md:text-xs">
              The Region's Finest Estates
            </Badge>
            <h1 className="text-4xl md:text-8xl font-display font-extrabold text-white mb-6 md:mb-8 tracking-tighter leading-[1.1] md:leading-none">
              Luxury Living In <br />
              <span className="gold-text-gradient">The Somali Region</span>
            </h1>
            <p className="text-white/60 text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-12 font-light tracking-wide px-4">
              Experience the pinnacle of real estate excellence. From modern villas in Jigjiga to premium vehicles and strategic land holdings.
            </p>

            {/* Search Box */}
            <div className="max-w-5xl mx-auto glass-card p-2 md:p-3 rounded-3xl md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row gap-2">
              <div className="flex-[1.5] flex items-center bg-white/5 rounded-2xl px-4 md:px-6 py-3 md:py-4 group focus-within:bg-white/10 transition-all border border-white/5 focus-within:border-luxury-gold/50">
                <Search className="text-luxury-gold mr-3 md:mr-4 group-hover:scale-110 transition-transform" size={20} />
                <Input 
                  placeholder="What are you looking for?" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-transparent border-0 text-white placeholder:text-white/20 focus-visible:ring-0 px-0 h-auto text-base md:text-lg w-full"
                />
              </div>
              <div className="flex-1 flex items-center bg-white/5 rounded-2xl px-4 md:px-6 py-3 md:py-4 group focus-within:bg-white/10 transition-all border border-white/5 focus-within:border-luxury-gold/50">
                <MapPin className="text-luxury-gold mr-3 md:mr-4 group-hover:scale-110 transition-transform" size={20} />
                <select 
                  className="bg-transparent border-0 text-white focus:outline-none w-full appearance-none text-base md:text-lg"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                >
                  <option className="bg-luxury-black" value="All">All Cities</option>
                  <option className="bg-luxury-black" value="Jigjiga">Jigjiga</option>
                  <option className="bg-luxury-black" value="Dire Dawa">Dire Dawa</option>
                  <option className="bg-luxury-black" value="Addis Ababa">Addis Ababa</option>
                </select>
              </div>
              <Button 
                size="lg" 
                onClick={handleSearch}
                className="bg-luxury-gold text-luxury-black hover:bg-white transition-all font-bold px-8 md:px-12 h-14 md:h-auto py-3 md:py-5 rounded-2xl shadow-xl shadow-luxury-gold/20 text-base md:text-lg uppercase tracking-widest w-full md:w-auto"
              >
                Search
              </Button>
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

      {/* Categories Grid */}
      <section className="py-16 md:py-32 bg-luxury-black overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:list-view md:mb-16 gap-6">
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

      {/* Featured Properties */}
      <section className="py-16 md:py-32 bg-luxury-charcoal/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-20">
            <p className="text-luxury-gold font-bold tracking-[0.2em] uppercase text-xs mb-3 md:mb-4">Curated Selection</p>
            <h2 className="text-3xl md:text-6xl font-display font-bold text-white tracking-tight">
              Handpicked <span className="text-white/40">Excellence</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {loading ? (
               <div className="col-span-full flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-12 h-12 text-luxury-gold animate-spin mb-4" />
                <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">Accessing Database...</p>
              </div>
            ) : featuredProperties.length > 0 ? (
              featuredProperties.map((prop, i) => (
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

      {/* Latest News */}
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
                          className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
                          alt={article.title} 
                        />
                      </div>
                      <div className="p-8 flex flex-col flex-grow">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-luxury-gold text-[10px] uppercase tracking-[0.2em] font-bold">{article.category}</span>
                          <span className="text-white/30 text-[10px] uppercase font-bold tracking-widest">{new Date(article.createdAt.seconds * 1000).toLocaleDateString()}</span>
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

      {/* Popular Cities */}
      <section className="py-16 md:py-32 bg-luxury-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 md:mb-16 gap-6">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
              Strategic <span className="text-white/40">Locations</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cities.length > 0 ? (
              cities.map((city, i) => (
                <motion.div
                  key={city.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer"
                >
                  <img src={city.image} alt={city.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                  <div className="absolute inset-x-0 bottom-0 p-8">
                    <h3 className="text-3xl font-display font-bold text-white mb-2">{city.name}</h3>
                    <p className="text-luxury-gold font-semibold text-sm tracking-widest uppercase">{city.properties} Premium Listings</p>
                    <div className="mt-6 overflow-hidden h-0 group-hover:h-10 transition-all duration-500">
                      <Button variant="ghost" className="text-white p-0 hover:text-luxury-gold hover:bg-transparent">
                        Explore City <ArrowRight className="ml-2" size={16} />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-4 py-20 text-center glass-card rounded-[3rem] border-white/5">
                <MapPin className="mx-auto text-white/10 mb-6" size={40} />
                <p className="text-white/40 font-display text-xl">Regional Network Initializing</p>
                <p className="text-white/10 text-xs uppercase tracking-widest mt-2">Connecting Major Hubs...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
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
            ) : latestVehicles.length > 0 ? (
              latestVehicles.map((vehicle, i) => (
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

      {/* Why Choose Us */}
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
                    <div className="w-12 h-12 rounded-xl bg-luxury-gold/10 flex items-center justify-center shrink-0 text-luxury-gold shadow-lg shadow-luxury-gold/5">
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
              <div className="absolute inset-0 bg-luxury-black/20 mix-blend-overlay"></div>
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
             <p className="text-white/40 text-base md:text-lg mb-8 md:mb-12 max-w-xl mx-auto tracking-tight">Join the region's elite professional network. Showcase your expertise to builders, investors, and homeowners in the Somali Region.</p>
             <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
                <Button asChild className="bg-luxury-gold text-luxury-black hover:bg-white transition-all h-14 md:h-16 px-8 md:px-10 rounded-xl md:rounded-2xl font-bold">
                   <Link to="/become-pro">Become a Professional</Link>
                </Button>
                <Link to="/services" className="h-14 md:h-16 px-8 md:px-10 rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-center text-white font-bold hover:bg-white/5 transition-colors">
                   View Registry
                </Link>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
              <Button size="lg" className="bg-white text-luxury-black hover:bg-luxury-gold transition-all font-bold px-12 h-14 md:h-16 rounded-xl md:rounded-2xl text-base md:text-lg shadow-xl shadow-white/5 w-full sm:w-auto">
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 h-14 md:h-16 px-12 rounded-xl md:rounded-2xl font-bold text-base md:text-lg w-full sm:w-auto">
                Contact Concierge
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
