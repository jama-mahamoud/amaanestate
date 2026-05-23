import { memo } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, MapPin, ArrowUpRight, CheckCircle2, MessageCircle, Building2, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Broker } from '@/types';

const BrokerCard = memo(({ broker, index = 0 }: { broker: Broker; index?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="glass-card bg-luxury-black/80 border border-white/5 rounded-[2rem] overflow-hidden group hover:border-[#C5A059]/30 transition-colors"
    >
      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 shrink-0 relative">
            {broker.profilePhotoUrl ? (
              <img src={broker.profilePhotoUrl} alt={broker.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40 font-bold text-xl uppercase">
                {broker.fullName?.substring(0,2) || 'BR'}
              </div>
            )}
            <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-luxury-black z-10 flex items-center justify-center">
              <CheckCircle2 size={10} className="text-white" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-display font-bold text-white group-hover:text-[#C5A059] transition-colors truncate">{broker.fullName}</h3>
            {broker.companyName && (
              <div className="flex items-center gap-1.5 text-white/70 text-xs mt-1 mb-1 font-medium truncate">
                <Building2 size={12} className="text-[#C5A059]" />
                <span className="truncate">{broker.companyName}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-white/50 text-xs mt-1 truncate">
              <MapPin size={12} />
              <span className="truncate">{broker.city}, {broker.region}</span>
            </div>
            {broker.isVerified && (
              <div className="mt-2 inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                <ShieldCheck size={12} />
                <span>{broker.type === 'agency' ? 'Verified Agency' : 'Verified Agent'}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-white/5">
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold block mb-1">Listings</span>
            <div className="flex items-center gap-1 text-white text-sm font-semibold">
              <HomeIcon size={14} className="text-[#C5A059]" />
              {broker.activeListingsCount || 0} Active
            </div>
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold block mb-1">Coverage</span>
            <p className="text-white text-sm font-semibold truncate">{broker.areasOfOperation?.[0] || broker.city || 'Regional'}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent border-white/10 hover:bg-white/5 text-white transition-all group/btn" asChild>
              <a href={`tel:${broker.phone?.replace(/\D/g,'') || ''}`}>
                Contact
              </a>
            </Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white border-0 transition-all group/btn" asChild>
              <a href={`https://wa.me/${broker.whatsapp?.replace(/\D/g,'') || ''}?text=Hello%20${encodeURIComponent(broker.fullName || 'Broker')},%20I%20found%20you%20on%20AmaanEstate`} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} className="mr-2" />
                WhatsApp
              </a>
            </Button>
          </div>
          <Button className="w-full bg-white/5 hover:bg-[#C5A059] text-white hover:text-black border border-white/10 transition-all mt-2 rounded-xl text-[10px] font-black uppercase tracking-widest h-11" asChild>
            <Link to={`/agents/${broker.id}`}>
              View Profile
              <ArrowUpRight size={14} className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
});

BrokerCard.displayName = 'BrokerCard';

export default BrokerCard;
