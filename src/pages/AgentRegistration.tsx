import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Award, TrendingUp, Users, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function AgentRegistration() {
  return (
    <div className="min-h-screen bg-luxury-black pt-28 pb-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-xs mb-4">Elite Partnership</p>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-8 tracking-tight">
              Join Our Network of <br />
              <span className="gold-text-gradient">Professional Brokers</span>
            </h1>
            <p className="text-white/60 text-lg mb-12 max-w-lg leading-relaxed">
              AmaanEstate is more than a platform; it's a standard. We invite the regions most professional real estate agents and vehicle brokers to join our exclusive marketplace.
            </p>

            <div className="space-y-8">
              {[
                { icon: <Shield />, title: 'Premium Branding', desc: 'Associate your business with the regions most trusted name in luxury assets.' },
                { icon: <TrendingUp />, title: 'Regional Reach', desc: 'Gain access to high-net-worth individuals across Ethiopia and the diaspora.' },
                { icon: <Award />, title: 'Elite Toolkit', desc: 'Use our sophisticated dashboard to manage your listings and client inquiries.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-12 h-12 rounded-xl bg-luxury-gold/10 flex items-center justify-center shrink-0 text-luxury-gold shadow-lg shadow-luxury-gold/5">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-display font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-luxury-charcoal/50 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] border border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <h2 className="text-3xl font-display font-bold text-white mb-8">Application Inquiry</h2>
            
            <form className="space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Full Name</label>
                  <Input placeholder="John Doe" className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Agency Name</label>
                  <Input placeholder="Elite Reality" className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Professional Email</label>
                <Input type="email" placeholder="john@agency.com" className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Primary City</label>
                <select className="flex h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none appearance-none">
                  <option className="bg-luxury-black">Jigjiga</option>
                  <option className="bg-luxury-black">Dire Dawa</option>
                  <option className="bg-luxury-black">Addis Ababa</option>
                  <option className="bg-luxury-black">Godey</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Professional Bio / Experience</label>
                <Textarea placeholder="Tell us about your experience in the region..." className="bg-white/5 border-white/10 min-h-[120px] rounded-xl text-white placeholder:text-white/20" />
              </div>

              <Button className="w-full bg-luxury-gold text-luxury-black hover:bg-white transition-all h-16 rounded-2xl font-bold text-lg shadow-xl shadow-luxury-gold/10">
                Submit For Review
              </Button>

              <div className="flex items-center justify-center gap-2 text-white/30 text-xs py-4">
                <CheckCircle2 size={14} className="text-luxury-gold" />
                <span>Our team typically responds within 48 business hours.</span>
              </div>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
