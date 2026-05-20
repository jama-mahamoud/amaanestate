import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, MapPin, Briefcase, CheckCircle2, MessageSquare, Phone, BadgeAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Professional } from '@/types';

interface ProfessionalCardProps {
  key?: string | number;
  professional: Professional;
}

export default function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const [imageError, setImageError] = useState(false);

  const getAvailabilityColor = (status: Professional['availability']) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500';
      case 'Busy': return 'bg-amber-500';
      case 'On Leave': return 'bg-rose-500';
      default: return 'bg-gray-500';
    }
  };

  const formattedRating = Number(professional.rating || 5.0).toFixed(1);
  const initials = professional.name ? professional.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'P';
  
  const whatsappNumber = professional.whatsapp || professional.phone || '';
  const cleanWhatsapp = whatsappNumber.replace(/\D/g, '');
  const whatsappUrl = cleanWhatsapp 
    ? `https://wa.me/${cleanWhatsapp}?text=Hello%20${encodeURIComponent(professional.name)},%20I%20found%20you%20on%20AmaanEstate%20and%20would%20like%20to%20request%20your%20services.`
    : `https://wa.me/252610000000?text=Hello%20${encodeURIComponent(professional.name)}`;

  const phoneUrl = professional.phone ? `tel:${professional.phone}` : '#';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="bg-luxury-black/90 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-[#C5A059]/30 transition-all duration-500 h-full flex flex-col hover:shadow-[0_20px_50px_rgba(197,160,89,0.05)]">
        {/* Card Header & Profile Detail Link */}
        <Link to={`/professionals/${professional.id}`} className="block flex-1 group/link">
          {/* Header Image/Banner */}
          <div className="h-32 bg-gradient-to-br from-[#C5A059]/10 via-luxury-black to-luxury-black relative border-b border-white/5">
            <div className="absolute -bottom-10 left-6">
              <div className="relative">
                {!imageError && professional.image ? (
                  <img 
                    src={professional.image} 
                    alt={professional.name}
                    onError={() => setImageError(true)}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-luxury-charcoal shadow-2xl transition-transform duration-500 group-hover/link:scale-105"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl border-4 border-luxury-charcoal bg-gradient-to-br from-[#C5A059]/20 to-luxury-black text-[#C5A059] font-bold text-xl flex items-center justify-center shadow-2xl">
                    {initials}
                  </div>
                )}
                {professional.isVerified && (
                  <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-0.5 shadow-lg border border-luxury-black">
                    <CheckCircle2 size={13} fill="currentColor" className="text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-14 p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-3 gap-2">
              <div>
                <h3 className="text-lg font-display font-bold text-white group-hover/link:text-[#C5A059] transition-colors line-clamp-1">
                  {professional.name}
                </h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                  {professional.title}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg shrink-0">
                <Star size={12} className="text-[#C5A059] fill-[#C5A059]" />
                <span className="text-white text-xs font-bold">{formattedRating}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="text-[#C5A059] border-[#C5A059]/20 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 bg-[#C5A059]/5 rounded">
                {professional.category}
              </Badge>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 text-[9px] uppercase font-bold tracking-widest text-white/40">
                <div className={`w-1.5 h-1.5 rounded-full ${getAvailabilityColor(professional.availability)}`} />
                {professional.availability}
              </div>
            </div>

            <p className="text-white/50 text-xs line-clamp-2 mb-4 h-8 leading-relaxed">
              {professional.bio || "Verified professional offering top-tier services across the Somali Region."}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4 py-3 border-y border-white/5">
              <div className="flex items-center gap-2 text-white/45">
                <MapPin size={13} className="text-[#C5A059]" />
                <span className="text-xs truncate">{professional.city}</span>
              </div>
              <div className="flex items-center gap-2 text-white/45">
                <Briefcase size={13} className="text-[#C5A059]" />
                <span className="text-xs">{professional.experienceYears} Years Exp.</span>
              </div>
            </div>

            {/* Premium Trust Badges */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="text-[8px] md:text-[9px] bg-emerald-500/10 text-emerald-400 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Fast Response</span>
              <span className="text-[8px] md:text-[9px] bg-[#C5A059]/10 text-luxury-gold font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Background Checked</span>
              {parseFloat(formattedRating) >= 4.8 && (
                <span className="text-[8px] md:text-[9px] bg-blue-500/10 text-blue-400 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Top Rated</span>
              )}
            </div>
          </div>
        </Link>

        {/* Action Button Panel (Outside the details Link to prevent nested-navigation event clashes) */}
        <div className="px-6 pb-6 pt-0 mt-auto flex gap-2">
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 bg-[#25D366] text-black font-extrabold h-11 rounded-xl flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-colors text-xs active:scale-95 duration-200 cursor-pointer"
          >
            <MessageSquare size={14} fill="currentColor" fillOpacity={0.15} /> Chat on WhatsApp
          </a>
          <a 
            href={phoneUrl} 
            className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/5 transition-colors active:scale-95 duration-200 shrink-0"
            title="Call Professional"
          >
            <Phone size={14} className="text-emerald-400 group-hover:text-emerald-300" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
