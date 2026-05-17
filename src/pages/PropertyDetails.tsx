import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  MapPin, BedDouble, Bath, Square, Share2, 
  Heart, Calendar, Check, ArrowLeft, Phone, 
  Mail, MessageSquare, Info 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import NotFoundState from '@/components/NotFoundState';

const MOCK_PROPERTIES: Record<string, any> = {};

export default function PropertyDetails() {
  const { id } = useParams();
  const property = MOCK_PROPERTIES[id as string];

  if (!property) {
    return (
      <div className="min-h-screen bg-luxury-black">
        <NotFoundState 
          title="Asset Not Found" 
          description="The requested estate record could not be retrieved from the central registry. It may have been archived or is awaiting listing validation."
          backLink="/properties"
          backLabel="BACK TO MARKETPLACE"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black pb-20">
      {/* Gallery Section */}
      <div className="relative pt-20">
        <div className="container mx-auto px-4 mb-4 flex justify-between items-center text-white/40 text-xs">
          <Link to="/properties" className="flex items-center gap-2 hover:text-luxury-gold transition-colors">
            <ArrowLeft size={14} /> BACK TO MARKETPLACE
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

        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[600px]">
          <div className="md:col-span-8 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden group aspect-[16/10] md:aspect-auto">
            <img 
              src={property.images[0]} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              alt={property.title} 
            />
          </div>
          <div className="md:col-span-4 flex flex-row md:flex-col gap-4">
            <div className="flex-1 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden group aspect-square md:aspect-auto">
              <img 
                src={property.images[1]} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="View 2" 
              />
            </div>
            <div className="flex-1 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden relative group aspect-square md:aspect-auto">
              <img 
                src={property.images[2]} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="View 3" 
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Button variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 text-[10px] md:text-sm h-8 md:h-10">
                  View All Photos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-16">
            <div>
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Badge className={`uppercase text-[10px] tracking-[0.3em] font-bold px-6 py-2 border-0 rounded-full ${
                  property.type === 'sale' ? 'bg-luxury-gold text-luxury-black' : 'bg-white text-luxury-black'
                }`}>
                  For {property.type}
                </Badge>
                <div className="bg-white/5 border border-white/5 text-white/40 uppercase text-[10px] tracking-[0.3em] px-6 py-2 rounded-full font-bold">
                  {property.category}
                </div>
              </div>
              <h1 className="text-4xl md:text-8xl font-display font-bold text-white mb-6 md:mb-8 tracking-tighter leading-[1.1] md:leading-[0.9]">
                {property.title}
              </h1>
              <div className="flex items-center text-white/40 text-lg md:text-xl font-light">
                <MapPin className="mr-3 text-luxury-gold" size={20} md:size={24} />
                <span>{property.location}, {property.city}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 py-8 md:py-12 border-y border-white/5">
              {[
                { icon: <BedDouble size={26} />, label: 'Beds', value: property.beds },
                { icon: <Bath size={26} />, label: 'Baths', value: property.baths },
                { icon: <Square size={26} />, label: 'Area', value: property.size },
                { icon: <Calendar size={26} />, label: 'Built', value: '2023' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className="text-luxury-gold/40 group-hover:text-luxury-gold transition-colors mb-3 md:mb-4 scale-75 md:scale-100">{item.icon}</div>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/20 mb-1 font-bold">{item.label}</p>
                  <p className="text-white font-bold text-lg md:text-xl tracking-tight">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="max-w-3xl">
              <h3 className="text-white text-[10px] uppercase font-bold tracking-[0.4em] mb-10 flex items-center">
                Executive Summary <div className="h-px flex-1 bg-white/5 ml-8"></div>
              </h3>
              <p className="text-white/60 text-xl leading-[1.8] font-light">
                {property.description}
              </p>
            </div>

            <div>
              <h3 className="text-white text-[10px] uppercase font-bold tracking-[0.4em] mb-10 flex items-center">
                Exclusive Amenities <div className="h-px flex-1 bg-white/5 ml-8"></div>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {property.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-luxury-gold/30 transition-all">
                      <Check size={18} className="text-luxury-gold opacity-40 group-hover:opacity-100" />
                    </div>
                    <span className="text-white/40 group-hover:text-white/70 transition-colors font-medium tracking-tight">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock Map */}
            <div className="h-[400px] w-full rounded-[3rem] bg-luxury-charcoal/50 border border-white/10 flex items-center justify-center relative overflow-hidden">
               <img 
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200" 
                className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale" 
                alt="Map Placeholder" 
               />
               <div className="relative z-10 flex flex-col items-center text-center px-10">
                  <div className="w-16 h-16 rounded-full bg-luxury-gold/20 flex items-center justify-center text-luxury-gold mb-4 animate-bounce">
                    <MapPin size={32} />
                  </div>
                  <h4 className="text-white font-display font-bold text-xl mb-2">Private Location</h4>
                  <p className="text-white/40 text-sm max-w-xs">Detailed location coordinates are provided upon serious inquiry validation.</p>
               </div>
            </div>
          </div>

          {/* Sidebar / Concierge Card */}
          <div className="lg:col-span-4 mt-12 lg:mt-0">
            <div className="lg:sticky lg:top-32 space-y-8">
              
              <div className="bg-luxury-charcoal/60 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-white/10 shadow-2xl">
                <div className="mb-8">
                  <p className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest font-bold mb-2">Request Price / Inquire</p>
                  <p className="text-3xl md:text-4xl font-display font-bold text-luxury-gold">
                    ${property.price.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                      <img src={property.agent.image} className="w-16 h-16 rounded-2xl object-cover" alt={property.agent.name} />
                      <div>
                        <p className="text-white font-bold">{property.agent.name}</p>
                        <p className="text-luxury-gold text-xs font-bold tracking-widest uppercase">Certified Prime Agent</p>
                      </div>
                   </div>

                   <div className="space-y-3 pt-2">
                     <Button className="w-full bg-luxury-gold text-luxury-black hover:bg-white transition-all h-16 rounded-2xl font-bold text-lg">
                       <Phone size={20} className="mr-2" /> Call Inquire
                     </Button>
                     <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 h-16 rounded-2xl font-bold">
                       <MessageSquare size={20} className="mr-2" /> WhatsApp Concierge
                     </Button>
                     <Button variant="ghost" className="w-full text-white/40 hover:text-luxury-gold h-12 flex items-center justify-center">
                        <Mail size={16} className="mr-2" /> Send Email Inquiry
                     </Button>
                   </div>
                </div>

                <div className="mt-10 p-6 bg-luxury-gold/10 rounded-2xl flex gap-4 items-start">
                  <Info size={20} className="text-luxury-gold shrink-0 border-0" />
                  <p className="text-white/60 text-xs leading-relaxed">
                    By inquiring about this property, you agree to our privacy policy and potential background check for high-value assets.
                  </p>
                </div>
              </div>

              <div className="p-8 border border-white/5 rounded-[2.5rem] bg-luxury-black text-center">
                <h4 className="text-white font-display font-bold mb-4">Mortgage Assistance</h4>
                <p className="text-white/40 text-sm mb-6">Need financial planning? Our regional banking partners offer specialized real estate loans.</p>
                <Button variant="link" className="text-luxury-gold p-0 h-auto font-bold uppercase tracking-widest text-xs">
                  Financial Inquiry <ArrowLeft className="ml-2 rotate-180" size={14} />
                </Button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
