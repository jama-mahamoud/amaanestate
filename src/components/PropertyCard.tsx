import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, BedDouble, Bath, Square, Car, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PropertyCardProps {
  key?: string | number;
  property: {
    id: string;
    title: string;
    price: number | string;
    location: string;
    city: string;
    beds?: number;
    baths?: number;
    size?: string;
    image: string;
    type: 'sale' | 'rent';
    category: string;
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/properties/${property.id}`}>
        <Card className="overflow-hidden border-0 bg-luxury-charcoal/50 backdrop-blur-sm group hover:shadow-2xl hover:shadow-luxury-gold/5 transition-all h-full flex flex-col border-white/5">
          <div className="aspect-[4/3] overflow-hidden relative">
            <img 
              src={property.image} 
              alt={property.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 via-transparent to-transparent opacity-60"></div>
            
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className={`uppercase text-[10px] tracking-widest font-bold px-3 py-1 border-0 ${
                property.type === 'sale' ? 'bg-luxury-gold text-luxury-black' : 'bg-white text-luxury-black'
              }`}>
                For {property.type}
              </Badge>
              <Badge className="bg-luxury-black/30 backdrop-blur-md text-white/90 border-white/10 uppercase text-[10px] tracking-widest">
                {property.category}
              </Badge>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-luxury-gold font-display font-bold text-xl">
                {typeof property.price === 'number' 
                  ? `$${property.price.toLocaleString()}` 
                  : property.price}
              </p>
            </div>
          </div>
          
          <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-lg font-display font-bold text-white group-hover:text-luxury-gold transition-colors line-clamp-1">
                {property.title}
              </h3>
              <div className="flex items-center text-white/50 text-sm mt-2">
                <MapPin size={14} className="mr-1 text-luxury-gold" />
                <span className="line-clamp-1">{property.city}, {property.location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-4 text-white/60">
                {property.beds && (
                  <div className="flex items-center gap-1.5">
                    <BedDouble size={16} className="text-luxury-gold" />
                    <span className="text-xs font-medium">{property.beds}</span>
                  </div>
                )}
                {property.baths && (
                  <div className="flex items-center gap-1.5">
                    <Bath size={16} className="text-luxury-gold" />
                    <span className="text-xs font-medium">{property.baths}</span>
                  </div>
                )}
                {property.size && (
                  <div className="flex items-center gap-1.5">
                    <Square size={14} className="text-luxury-gold" />
                    <span className="text-xs font-medium">{property.size}</span>
                  </div>
                )}
              </div>
              
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-luxury-gold group-hover:text-luxury-black transition-all">
                <ArrowRight size={16} />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
