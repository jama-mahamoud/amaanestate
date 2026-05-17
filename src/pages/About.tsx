import { motion } from 'motion/react';
import { Shield, Target, Users, MapPin, Award, History } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-luxury-black pt-28 pb-20">
      <div className="container mx-auto px-4">
        
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center mb-40">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-12 xl:col-span-7"
          >
            <p className="text-luxury-gold font-bold tracking-[0.4em] uppercase text-[10px] mb-6 underline underline-offset-8 decoration-luxury-gold/30">The Amaan Legacy</p>
            <h1 className="text-6xl md:text-9xl font-display font-bold text-white mb-10 tracking-tighter leading-[0.85]">
              Integrity <br />
              <span className="gold-text-gradient">Defined By Trust</span>
            </h1>
            <div className="space-y-8 max-w-2xl">
              <p className="text-white/50 text-xl leading-relaxed font-light italic">
                "Modernizing the landscape of Somali excellence while preserving the timeless value of regional integrity."
              </p>
              <p className="text-white/30 text-lg leading-relaxed font-light">
                Founded with a singular vision, AmaanEstate has evolved into the region's benchmark for high-value assets. We bridge the gap between traditional Somali values and global luxury standards.
              </p>
              <p className="text-white/30 text-lg leading-relaxed font-light">
                In our culture, "Amaan" is more than a name—it's a social contract. Our platform architecturalizes this trust, ensuring every transaction within Ethiopia and its diaspora is secured by transparency and elite service.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
            className="lg:col-span-12 xl:col-span-5 relative group"
          >
            <div className="relative rounded-[4rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1200" 
                alt="Somali Region Development" 
                className="w-full aspect-[4/5] object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/20 to-transparent"></div>
              <div className="absolute bottom-16 left-12 p-8 glass-card border border-white/5 rounded-[2.5rem]">
                 <div className="text-luxury-gold font-display font-bold text-5xl mb-2 tracking-tighter">Established</div>
                 <p className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-bold">Anno 2020 • Regional Hub</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-40">
          {[
            { icon: <Shield size={32} />, title: 'Absolute Integrity', desc: 'Every participant undergoes a rigorous vetting sequence to preserve the ecosystem’s quality.' },
            { icon: <Target size={32} />, title: 'Deep Localization', desc: 'We operate with an intimate understanding of the Somali Region’s unique legal and cultural landscape.' },
            { icon: <Award size={32} />, title: 'Concierge Protocol', desc: 'Providing an institutional-grade experience for the regions most significant asset acquisitions.' },
          ].map((val, i) => (
            <div key={i} className="glass-card p-12 rounded-[3.5rem] group hover:border-luxury-gold/20 transition-all duration-700">
               <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-luxury-gold mb-10 group-hover:bg-luxury-gold group-hover:text-luxury-black transition-all duration-500">
                 {val.icon}
               </div>
               <h3 className="text-3xl font-display font-bold text-white mb-6 tracking-tight">{val.title}</h3>
               <p className="text-white/20 leading-relaxed font-light text-base">{val.desc}</p>
            </div>
          ))}
        </div>

        {/* Presence Section */}
        <div className="relative py-32 rounded-[5rem] overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.02]"></div>
          <div className="relative text-center mb-24 px-4">
            <p className="text-luxury-gold font-bold tracking-[0.5em] uppercase text-[10px] mb-6">Strategic Presence</p>
            <h2 className="text-5xl md:text-8xl font-display font-bold text-white tracking-tighter">
              Regional <span className="text-white/20 italic">Architectures</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-8">
            {[
              { city: 'Jigjiga HQ', desc: 'The heart of our operations.' },
              { city: 'Addis Hub', desc: 'Connecting with the capital.' },
              { city: 'Dire Dawa', desc: 'The strategic gateway.' },
              { city: 'Diaspora Unit', desc: 'Serving the global family.' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-luxury-gold mb-8 group-hover:bg-luxury-gold group-hover:text-luxury-black transition-all duration-500">
                  <MapPin size={20} />
                </div>
                <h4 className="text-xl font-display font-bold text-white mb-3 tracking-tight">{item.city}</h4>
                <p className="text-white/20 text-xs font-light uppercase tracking-widest">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
