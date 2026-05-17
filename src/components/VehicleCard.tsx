import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gauge, Fuel, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface VehicleCardProps {
  key?: string | number;
  vehicle: {
    id: string;
    title: string;
    price: number | string;
    city: string;
    year: number;
    mileage: string;
    fuelType: string;
    image: string;
    type: 'sale' | 'rent';
    category: string;
  };
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/vehicles/${vehicle.id}`}>
        <Card className="overflow-hidden border-0 bg-luxury-charcoal/50 backdrop-blur-sm group hover:shadow-2xl hover:shadow-luxury-gold/5 transition-all h-full flex flex-col border-white/5">
          <div className="aspect-video overflow-hidden relative">
            <img 
              src={vehicle.image} 
              alt={vehicle.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 via-transparent to-transparent opacity-60"></div>
            
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className={`uppercase text-[10px] tracking-widest font-bold px-3 py-1 border-0 ${
                vehicle.type === 'sale' ? 'bg-luxury-gold text-luxury-black' : 'bg-white text-luxury-black'
              }`}>
                For {vehicle.type}
              </Badge>
              <Badge className="bg-luxury-black/30 backdrop-blur-md text-white/90 border-white/10 uppercase text-[10px] tracking-widest">
                {vehicle.category}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-display font-bold text-white group-hover:text-luxury-gold transition-colors line-clamp-1">
                  {vehicle.title}
                </h3>
                <p className="text-luxury-gold font-display font-bold whitespace-nowrap ml-2">
                  {typeof vehicle.price === 'number' 
                    ? `$${vehicle.price.toLocaleString()}` 
                    : vehicle.price}
                </p>
              </div>
              <p className="text-white/50 text-xs mb-4">{vehicle.city}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-4 text-white/60">
                <div className="flex flex-col items-center gap-1">
                  <Calendar size={14} className="text-luxury-gold" />
                  <span className="text-[10px] font-medium">{vehicle.year}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Gauge size={14} className="text-luxury-gold" />
                  <span className="text-[10px] font-medium">{vehicle.mileage}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Fuel size={14} className="text-luxury-gold" />
                  <span className="text-[10px] font-medium capitalize">{vehicle.fuelType}</span>
                </div>
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
