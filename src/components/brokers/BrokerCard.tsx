import { motion } from 'motion/react';
import { ShieldCheck, MapPin, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Broker } from '@/types';

export default function BrokerCard({ broker, index = 0 }: { broker: Broker; index?: number }) {
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
                {broker.fullName.substring(0,2)}
              </div>
            )}
            <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-luxury-black z-10 flex items-center justify-center">
              <CheckCircle2 size={10} className="text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-white group-hover:text-[#C5A059] transition-colors">{broker.fullName}</h3>
            <div className="flex items-center gap-1.5 text-white/50 text-xs mt-1">
              <MapPin size={12} />
              <span>{broker.city}, {broker.region}</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck size={12} />
              <span>Legally Verified</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-white/5">
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold block mb-1">Experience</span>
            <p className="text-white text-sm font-semibold">{broker.yearsOfExperience} Years</p>
          </div>
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold block mb-1">Coverage</span>
            <p className="text-white text-sm font-semibold truncate">{broker.areasOfOperation[0] || 'Regional'}</p>
          </div>
        </div>

        <Button className="w-full bg-white/5 hover:bg-[#C5A059] text-white hover:text-black border border-white/10 transition-all group/btn" asChild>
          <a href={`https://wa.me/${broker.whatsapp.replace(/\D/g,'')}?text=Hello%20${broker.fullName},%20I%20found%20you%20on%20AmaanEstate`} target="_blank" rel="noopener noreferrer">
            Contact on WhatsApp
            <ArrowUpRight size={16} className="ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
          </a>
        </Button>
      </div>
    </motion.div>
  );
}
