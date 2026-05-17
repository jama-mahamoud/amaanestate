import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  MapPin, Gauge, Fuel, Calendar, Share2, 
  Heart, ArrowLeft, Phone, Mail, MessageSquare, 
  Info, Settings2, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const MOCK_VEHICLES = {
  'v1': {
    id: 'v1',
    title: 'Toyota Land Cruiser V8',
    price: 120000,
    city: 'Jigjiga',
    year: 2023,
    mileage: '5,000 km',
    fuelType: 'Diesel',
    images: [
      'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'
    ],
    type: 'sale',
    category: 'SUV',
    transmission: 'Automatic',
    description: 'The ultimate king of the road, the Land Cruiser V8 is perfect for the regions diverse terrain. This 2023 model comes with the full luxury package, including premium leather interior, advanced navigation, and top-tier security features.',
    features: ['4WD', 'Leather Seats', 'Sunroof', 'Adaptive Cruise Control', 'Cool Box', '360 Camera'],
    agent: {
      name: 'Abdiwahid Farah',
      phone: '+251 910 012 794',
      email: 'abdiwahid@amaanestate.com',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    }
  }
};

export default function VehicleDetails() {
  const { id } = useParams();
  const vehicle = MOCK_VEHICLES[id as keyof typeof MOCK_VEHICLES] || MOCK_VEHICLES['v1'];

  return (
    <div className="min-h-screen bg-luxury-black pb-20">
      {/* Media Section */}
      <div className="relative pt-20">
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

        <div className="container mx-auto px-4 h-[500px] rounded-[3rem] overflow-hidden group relative">
          <img 
            src={vehicle.images[0]} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
            alt={vehicle.title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-60"></div>
          
          <div className="absolute bottom-10 left-10 right-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-luxury-gold text-luxury-black border-0 uppercase text-[10px] tracking-widest font-bold px-3 py-1">
                  For {vehicle.type}
                </Badge>
                <Badge className="bg-white/20 backdrop-blur-md text-white border-0 uppercase text-[10px] tracking-widest font-bold px-3 py-1">
                  {vehicle.category}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
                {vehicle.title}
              </h1>
            </div>
            <div className="bg-luxury-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Elite Valuation</p>
                <p className="text-3xl font-display font-bold text-luxury-gold">${vehicle.price.toLocaleString()}</p>
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
                { icon: <Calendar size={26} />, label: 'Year', value: vehicle.year },
                { icon: <Gauge size={26} />, label: 'Mileage', value: vehicle.mileage },
                { icon: <Fuel size={26} />, label: 'Fuel', value: vehicle.fuelType },
                { icon: <Settings2 size={26} />, label: 'Shift', value: vehicle.transmission },
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

            <div className="pt-12 border-t border-white/10 flex items-center gap-8">
               <div className="flex items-center gap-4">
                  <img src={vehicle.agent.image} className="w-16 h-16 rounded-2xl object-cover" alt="Agent" />
                  <div>
                    <p className="text-white font-bold">{vehicle.agent.name}</p>
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
    </div>
  );
}
