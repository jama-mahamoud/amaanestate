import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  MapPin, BedDouble, Bath, Square, Share2, 
  Heart, Calendar, Check, ArrowLeft, Phone, 
  Mail, MessageSquare, Info 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MOCK_PROPERTIES = {
  '1': {
    id: '1',
    title: 'Modern Villa with Palace View',
    price: 350000,
    location: 'Airport Road',
    city: 'Jigjiga',
    beds: 5,
    baths: 4,
    size: '450 sqm',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'
    ],
    type: 'sale',
    category: 'Villa',
    description: 'This architectural masterpiece offers unparalleled views of the presidential palace. Featuring state-of-the-art security, multiple reception areas, and a private prayer room. The villa combines traditional Somali hospitality space with ultra-modern design aesthetics.',
    features: ['24/7 Security', 'Borehole', 'Private Parking', 'Praying Room', 'Garden', 'Smart Home System'],
    agent: {
      name: 'Abdiwahid Farah',
      phone: '+251 910 012 794',
      email: 'abdiwahid@amaanestate.com',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    }
  }
};

export default function PropertyDetails() {
  const { id } = useParams();
  const property = MOCK_PROPERTIES[id as keyof typeof MOCK_PROPERTIES] || MOCK_PROPERTIES['1'];

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

        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-4 h-[600px]">
          <div className="md:col-span-8 rounded-[2.5rem] overflow-hidden group">
            <img 
              src={property.images[0]} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              alt={property.title} 
            />
          </div>
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="flex-1 rounded-[2.5rem] overflow-hidden group">
              <img 
                src={property.images[1]} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="View 2" 
              />
            </div>
            <div className="flex-1 rounded-[2.5rem] overflow-hidden relative group">
              <img 
                src={property.images[2]} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="View 3" 
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Button variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20">
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
          <div className="lg:col-span-8 space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Badge className={`uppercase text-[10px] tracking-widest font-bold px-4 py-1.5 border-0 ${
                  property.type === 'sale' ? 'bg-luxury-gold text-luxury-black' : 'bg-white text-luxury-black'
                }`}>
                  For {property.type}
                </Badge>
                <Badge className="bg-white/5 border-white/10 text-white/60 uppercase text-[10px] tracking-widest px-4 py-1.5">
                  {property.category}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
                {property.title}
              </h1>
              <div className="flex items-center text-white/50 text-xl">
                <MapPin className="mr-2 text-luxury-gold" size={24} />
                <span>{property.location}, {property.city}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-12 border-b border-white/10">
              {[
                { icon: <BedDouble size={24} />, label: 'Bedrooms', value: property.beds },
                { icon: <Bath size={24} />, label: 'Bathrooms', value: property.baths },
                { icon: <Square size={24} />, label: 'Square Ft', value: property.size },
                { icon: <Calendar size={24} />, label: 'Built Year', value: '2023' },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center text-center">
                  <div className="text-luxury-gold mb-3">{item.icon}</div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1 font-bold">{item.label}</p>
                  <p className="text-white font-bold text-lg">{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-2xl font-display font-bold text-white mb-6">Executive Summary</h3>
              <p className="text-white/60 text-lg leading-relaxed font-light">
                {property.description}
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-display font-bold text-white mb-8">Exclusive Amenities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {property.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 flex items-center justify-center shrink-0 text-luxury-gold group-hover:bg-luxury-gold group-hover:text-luxury-black transition-all">
                      <Check size={18} />
                    </div>
                    <span className="text-white/60 font-medium">{feature}</span>
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
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              
              <div className="bg-luxury-charcoal/60 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl">
                <div className="mb-8">
                  <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-2">Request Price / Inquire</p>
                  <p className="text-4xl font-display font-bold text-luxury-gold">
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
