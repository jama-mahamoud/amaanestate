import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, MapPin, Briefcase, CheckCircle2, MessageSquare, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Professional } from '@/types';

interface ProfessionalCardProps {
  key?: string | number;
  professional: Professional;
}

export default function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const getAvailabilityColor = (status: Professional['availability']) => {
    switch (status) {
      case 'Available': return 'bg-green-500';
      case 'Busy': return 'bg-amber-500';
      case 'On Leave': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <Link to={`/professionals/${professional.id}`}>
        <div className="bg-luxury-charcoal/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-luxury-gold/30 transition-all duration-500 h-full flex flex-col">
          {/* Header Image/Banner */}
          <div className="h-32 bg-gradient-to-br from-luxury-gold/20 to-luxury-black relative">
            <div className="absolute -bottom-12 left-8">
              <div className="relative">
                <img 
                  src={professional.image} 
                  alt={professional.name}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-luxury-black shadow-2xl"
                />
                {professional.isVerified && (
                  <div className="absolute -top-2 -right-2 bg-luxury-gold text-luxury-black rounded-full p-1 shadow-lg">
                    <CheckCircle2 size={16} fill="currentColor" className="text-luxury-black" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-16 p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-display font-bold text-white group-hover:text-luxury-gold transition-colors">
                  {professional.name}
                </h3>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
                  {professional.title}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                <Star size={14} className="text-luxury-gold fill-luxury-gold" />
                <span className="text-white text-xs font-bold">{professional.rating}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="outline" className="text-luxury-gold border-luxury-gold/20 text-[10px] uppercase font-bold tracking-widest">
                {professional.category}
              </Badge>
              <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40">
                <div className={`w-1.5 h-1.5 rounded-full ${getAvailabilityColor(professional.availability)}`} />
                {professional.availability}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-white/40">
                <MapPin size={14} className="text-luxury-gold" />
                <span className="text-xs font-medium">{professional.city}</span>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <Briefcase size={14} className="text-luxury-gold" />
                <span className="text-xs font-medium">{professional.experienceYears} Years Exp.</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-8">
              {professional.skills.slice(0, 3).map((skill, i) => (
                <span key={i} className="text-[10px] text-white/30 border border-white/5 px-2 py-0.5 rounded-md">
                  {skill}
                </span>
              ))}
              {professional.skills.length > 3 && (
                <span className="text-[10px] text-white/20 px-2 py-0.5">+{professional.skills.length - 3}</span>
              )}
            </div>

            <div className="flex gap-2 mt-auto">
              <button className="flex-1 bg-luxury-gold text-luxury-black font-bold h-10 rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-colors text-xs">
                <MessageSquare size={14} /> WhatsApp
              </button>
              <button className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/5 transition-colors">
                <Phone size={14} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
