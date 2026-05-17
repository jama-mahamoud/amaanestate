import { motion } from 'motion/react';
import { Search, MapPin, Home as HomeIcon, Car, Landmark, ArrowRight, Shield, Award, Users, Star, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import PropertyCard from '@/components/PropertyCard';
import VehicleCard from '@/components/VehicleCard';
import ProfessionalCard from '@/components/ProfessionalCard';
import { Property, Vehicle, Professional } from '@/types';

const featuredProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Villa with Palace View',
    price: 350000,
    location: 'Airport Road',
    city: 'Jigjiga',
    beds: 5,
    baths: 4,
    size: '450 sqm',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
    type: 'sale',
    category: 'Villa',
    status: 'published'
  },
  {
    id: '2',
    title: 'Luxury Apartment Downtown',
    price: 2500,
    location: 'City Center',
    city: 'Dire Dawa',
    beds: 3,
    baths: 2,
    size: '180 sqm',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200',
    type: 'rent',
    category: 'Apartment',
    status: 'published'
  },
  {
    id: '3',
    title: 'Premium Office Space',
    price: 1200000,
    location: 'Business District',
    city: 'Addis Ababa',
    size: '1200 sqm',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
    type: 'sale',
    category: 'Commercial',
    status: 'published'
  }
];

const latestVehicles: Vehicle[] = [
  {
    id: 'v1',
    title: 'Toyota Land Cruiser V8',
    price: 120000,
    city: 'Jigjiga',
    year: 2023,
    mileage: '5,000 km',
    fuelType: 'Diesel',
    image: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&q=80&w=1000',
    type: 'sale',
    category: 'SUV',
    transmission: 'Automatic'
  },
  {
    id: 'v2',
    title: 'Mercedes-Benz G-Class',
    price: 210000,
    city: 'Dire Dawa',
    year: 2024,
    mileage: '0 km',
    fuelType: 'Petrol',
    image: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=1000',
    type: 'sale',
    category: 'Lux',
    transmission: 'Automatic'
  }
];

const topProfessionals: Professional[] = [
  {
    id: 'p1',
    name: 'Eng. Ahmed Duale',
    title: 'Senior Civil Engineer',
    category: 'Construction & Engineering',
    skills: ['Structural Design', 'Project Management'],
    experienceYears: 12,
    city: 'Jigjiga',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    reviewCount: 124,
    availability: 'Available',
    bio: 'Specializing in residential and commercial structural integrity.',
    isVerified: true
  },
  {
    id: 'p3',
    name: 'Mustafa Omar',
    title: 'Certified Electrician',
    category: 'Electrical & Technical',
    skills: ['Solar Installation', 'Smart Home Wiring'],
    experienceYears: 15,
    city: 'Addis Ababa',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    rating: 5.0,
    reviewCount: 210,
    availability: 'Available',
    bio: 'Lead technician for major solar projects.',
    isVerified: true
  },
  {
    id: 'p4',
    name: 'Zahra Hassan',
    title: 'Senior Quran Teacher',
    category: 'Education & Teaching',
    skills: ['Tajweed', 'Hifdh'],
    experienceYears: 10,
    city: 'Jigjiga',
    image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    reviewCount: 340,
    availability: 'Available',
    bio: 'Dedicated to excellence in teaching.',
    isVerified: true
  }
];

const cities = [
  { name: 'Jigjiga', properties: 124, image: '/src/assets/images/jigjiga_city_front_1779008989312.png' },
  { name: 'Dire Dawa', properties: 86, image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=800' },
  { name: 'Addis Ababa', properties: 245, image: '/src/assets/images/addis_ababa_front_1779009010221.png' },
  { name: 'Godey', properties: 42, image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800' }
];

export default function Home() {
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
            <Badge className="bg-luxury-gold text-luxury-black border-0 uppercase tracking-[0.3em] font-bold px-4 py-1 mb-6 animate-pulse">
              The Region's Finest Estates
            </Badge>
            <h1 className="text-5xl md:text-8xl font-display font-extrabold text-white mb-8 tracking-tighter leading-none">
              Luxury Living In <br />
              <span className="gold-text-gradient">The Somali Region</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light tracking-wide">
              Experience the pinnacle of real estate excellence. From modern villas in Jigjiga to premium vehicles and strategic land holdings.
            </p>

            {/* Search Box */}
            <div className="max-w-4xl mx-auto bg-luxury-charcoal/40 backdrop-blur-2xl p-2 rounded-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center bg-white/5 rounded-xl px-4 py-3 group focus-within:bg-white/10 transition-all">
                <Search className="text-luxury-gold mr-3 group-hover:scale-110 transition-transform" size={20} />
                <Input 
                  placeholder="What are you looking for?" 
                  className="bg-transparent border-0 text-white placeholder:text-white/30 focus-visible:ring-0 px-0 h-auto"
                />
              </div>
              <div className="flex-1 flex items-center bg-white/5 rounded-xl px-4 py-3 group focus-within:bg-white/10 transition-all border-l border-white/5">
                <MapPin className="text-luxury-gold mr-3 group-hover:scale-110 transition-transform" size={20} />
                <select className="bg-transparent border-0 text-white focus:outline-none w-full appearance-none">
                  <option className="bg-luxury-black">All Cities</option>
                  <option className="bg-luxury-black">Jigjiga</option>
                  <option className="bg-luxury-black">Dire Dawa</option>
                  <option className="bg-luxury-black">Addis Ababa</option>
                </select>
              </div>
              <Button size="lg" className="bg-luxury-gold text-luxury-black hover:bg-white transition-all font-bold px-10 h-auto py-4 rounded-xl shadow-lg shadow-luxury-gold/20">
                Search Excellence
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
      <section className="py-32 bg-luxury-black overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <p className="text-luxury-gold font-bold tracking-[0.2em] uppercase text-xs mb-4">Elite Portfolios</p>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
                Our Specialized <span className="text-white/40">Marketplaces</span>
              </h2>
            </div>
            <Link to="/properties" className="text-luxury-gold flex items-center gap-2 font-semibold hover:gap-4 transition-all group">
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
              { icon: <Users />, title: 'Professional Rentals', desc: 'Short-term and corporate rentals across the region.', path: '/properties?listingType=rent', color: 'white' },
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
      <section className="py-32 bg-luxury-charcoal/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <p className="text-luxury-gold font-bold tracking-[0.2em] uppercase text-xs mb-4">Curated Selection</p>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
              Handpicked <span className="text-white/40">Excellence</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {featuredProperties.map((prop, i) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <PropertyCard property={prop} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-32 bg-luxury-black">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
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
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-32 bg-luxury-charcoal/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <p className="text-luxury-gold font-bold tracking-[0.2em] uppercase text-xs mb-4">Masterpiece Collection</p>
              <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
                Luxury <span className="text-white/40">Mobility</span>
              </h2>
            </div>
            <Link to="/vehicles" className="text-luxury-gold flex items-center gap-2 font-semibold hover:gap-4 transition-all group">
              View Vehicle Catalog <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {latestVehicles.map((vehicle, i) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <VehicleCard vehicle={vehicle} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Professionals */}
      <section className="py-32 bg-luxury-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <p className="text-luxury-gold font-bold tracking-[0.2em] uppercase text-xs mb-4">Elite Human Capital</p>
              <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
                Trusted <span className="text-white/40">Professionals</span>
              </h2>
              <p className="text-white/40 mt-4 max-w-lg">Dedicated experts building the future of the Somali Region through engineering, technology, and specialized skills.</p>
            </div>
            <Link to="/services" className="text-luxury-gold flex items-center gap-2 font-semibold hover:gap-4 transition-all group">
              Browse Professional Registry <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {topProfessionals.map((pro, i) => (
              <ProfessionalCard key={pro.id} professional={pro} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 bg-luxury-black border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-luxury-gold font-bold tracking-[0.2em] uppercase text-xs mb-4">Premium Standards</p>
              <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-8 tracking-tight">
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
      <section className="py-32 bg-luxury-gold/5 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-luxury-black/40 backdrop-blur-2xl border border-white/10 rounded-[4rem] p-12 md:p-20 text-center">
             <div className="w-20 h-20 bg-luxury-gold/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-luxury-gold">
                <Briefcase size={40} />
             </div>
             <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Are You a Skilled Professional?</h2>
             <p className="text-white/40 text-lg mb-12 max-w-xl mx-auto">Join the region's elite professional network. Showcase your expertise to builders, investors, and homeowners in the Somali Region.</p>
             <div className="flex flex-wrap justify-center gap-6">
                <Button asChild className="bg-luxury-gold text-luxury-black hover:bg-white transition-all h-16 px-10 rounded-2xl font-bold">
                   <Link to="/become-pro">Become a Professional</Link>
                </Button>
                <Link to="/services" className="h-16 px-10 rounded-2xl border border-white/10 flex items-center justify-center text-white font-bold hover:bg-white/5 transition-colors">
                   View Registry
                </Link>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-luxury-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-luxury-gold/10 blur-[150px] rounded-full translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-luxury-gold/5 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-luxury-gold h-1 lg:w-32 mb-12"></div>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div className="max-w-2xl">
              <h2 className="text-5xl md:text-7xl font-display font-extrabold text-white mb-6 tracking-tighter">
                Ready To <span className="text-luxury-gold">Elevate</span> <br /> Your Lifestyle?
              </h2>
              <p className="text-white/50 text-xl font-light">Join the region's most exclusive real estate and vehicle marketplace today.</p>
            </div>
            <div className="flex flex-wrap gap-6">
              <Button size="lg" className="bg-white text-luxury-black hover:bg-luxury-gold transition-all font-bold px-12 h-16 rounded-2xl text-lg shadow-xl shadow-white/5">
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 h-16 px-12 rounded-2xl font-bold text-lg">
                Contact Concierge
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
