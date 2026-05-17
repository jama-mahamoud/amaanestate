import { motion } from 'motion/react';
import { Shield, Target, Users, MapPin, Award, History } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-luxury-black pt-28 pb-20">
      <div className="container mx-auto px-4">
        
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-xs mb-4">Our Legacy</p>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-8 tracking-tight">
              AmaanEstate: <br />
              <span className="gold-text-gradient">Integrity In Every Square Foot</span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-6 font-light">
              Founded with the vision to modernize the real estate landscape of the Somali Region of Ethiopia, AmaanEstate has grown into the regions most trusted platform for high-value properties and luxury mobility.
            </p>
            <p className="text-white/60 text-lg leading-relaxed font-light">
              We understand that in our culture, "Amaan" (Trust) is the foundation of every transaction. Our platform combines this traditional value with cutting-edge technology to provide transparency, security, and world-class service.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[3.5rem] overflow-hidden shadow-2xl shadow-luxury-gold/5"
          >
            <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1200" alt="Somali Region Development" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent"></div>
            <div className="absolute bottom-10 left-10 p-8 bg-luxury-black/60 backdrop-blur-xl border border-white/10 rounded-[2rem]">
               <div className="text-luxury-gold font-display font-bold text-4xl mb-1">2020</div>
               <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Inception of Excellence</p>
            </div>
          </motion.div>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32">
          {[
            { icon: <Shield size={32} />, title: 'Unyielding Integrity', desc: 'We verify every listing and participant to ensure the highest honesty in our marketplace.' },
            { icon: <Target size={32} />, title: 'Regional Focus', desc: 'Our expertise is localized. We know Jigjiga and Dire Dawa better than any global competitor.' },
            { icon: <Award size={32} />, title: 'Service Excellence', desc: 'We provide a concierge-level experience for both buyers and sellers of luxury assets.' },
          ].map((val, i) => (
            <div key={i} className="p-10 bg-luxury-charcoal/30 border border-white/5 rounded-[2.5rem] group hover:border-luxury-gold/30 transition-all duration-500">
               <div className="w-16 h-16 rounded-2xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold mb-8 group-hover:scale-110 transition-transform">
                 {val.icon}
               </div>
               <h3 className="text-2xl font-display font-bold text-white mb-4">{val.title}</h3>
               <p className="text-white/40 leading-relaxed text-sm">{val.desc}</p>
            </div>
          ))}
        </div>

        {/* Team / Cities Section */}
        <div className="text-center mb-20">
          <p className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-xs mb-4">Our Presence</p>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
            Connecting <span className="text-white/40">The Region</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {['Jigjiga HQ', 'Dire Dawa Branch', 'Addis Ababa Hub', 'Godey Outpost'].map((city, i) => (
            <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-3xl text-center hover:bg-white/10 transition-colors">
              <MapPin size={24} className="text-luxury-gold mx-auto mb-4" />
              <h4 className="text-white font-bold mb-2">{city}</h4>
              <p className="text-white/30 text-xs">Serving the local elite and international diaspora.</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
