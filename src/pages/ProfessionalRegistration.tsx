import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Award, TrendingUp, Users, CheckCircle2, ChevronRight, Briefcase, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ProfessionalRegistration() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-luxury-black pt-28 pb-20 overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-luxury-gold/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-xs mb-4">Marketplace Onboarding</p>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-8 tracking-tight leading-none">
              Manifest Your <br />
              <span className="gold-text-gradient">Professional Legacy</span>
            </h1>
            <p className="text-white/60 text-xl mb-12 max-w-lg leading-relaxed font-light">
              Join the regions most prestigious registry of professionals. Connect with high-net-worth clients and contribute to the growth of the Somali Region.
            </p>

            <div className="space-y-10">
              {[
                { icon: <Shield />, title: 'Elite Verification', desc: 'Our "Amaan" verification badge signals trust and quality to every potential client.' },
                { icon: <TrendingUp />, title: 'Premium Pipeline', desc: 'Access high-value projects across residential, commercial, and industrial segments.' },
                { icon: <Award />, title: 'Global Standard', desc: 'Position yourself within a curated platform that demands and showcases excellence.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-luxury-gold/10 flex items-center justify-center shrink-0 text-luxury-gold border border-luxury-gold/20 group-hover:bg-luxury-gold group-hover:text-luxury-black transition-all duration-500">
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

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-luxury-charcoal/50 backdrop-blur-3xl p-8 md:p-14 rounded-[4rem] border border-white/10 shadow-2xl relative"
          >
            {/* Form Progress */}
            <div className="flex gap-4 mb-12">
               {[1, 2, 3].map(s => (
                 <div key={s} className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className={`h-full bg-luxury-gold transition-all duration-500 ${step >= s ? 'w-full' : 'w-0'}`} 
                    />
                 </div>
               ))}
            </div>

            <div className="mb-10 text-center">
              <h2 className="text-3xl font-display font-bold text-white mb-2">Professional Inquiry</h2>
              <p className="text-white/40 text-sm">Step {step}: {step === 1 ? 'Expertise' : step === 2 ? 'Experience' : 'Verification'}</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
               {step === 1 && (
                 <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="space-y-6"
                 >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Full Name</label>
                        <Input placeholder="Eng. Ahmed Hassan" className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Professional Title</label>
                        <Input placeholder="Senior Civil Engineer" className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Primary Category</label>
                      <select className="flex h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none appearance-none">
                        <option className="bg-luxury-black">Construction & Engineering</option>
                        <option className="bg-luxury-black">Electrical & Technical</option>
                        <option className="bg-luxury-black">Plumbing & Water</option>
                        <option className="bg-luxury-black">Home & Maintenance</option>
                        <option className="bg-luxury-black">Education & Teaching</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Email Address</label>
                      <Input type="email" placeholder="ahmed@example.com" className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/50" />
                    </div>
                 </motion.div>
               )}

               {step === 2 && (
                 <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="space-y-6"
                 >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Experience (Years)</label>
                        <Input type="number" placeholder="10" className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Base City</label>
                        <select className="flex h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none appearance-none">
                          <option className="bg-luxury-black">Jigjiga</option>
                          <option className="bg-luxury-black">Dire Dawa</option>
                          <option className="bg-luxury-black">Addis Ababa</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Professional Bio / Mission</label>
                      <Textarea placeholder="Describe your expertise and regional projects..." className="bg-white/5 border-white/10 min-h-[160px] rounded-2xl text-white focus-visible:ring-luxury-gold/50" />
                    </div>
                 </motion.div>
               )}

               {step === 3 && (
                 <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="space-y-8"
                 >
                    <div className="p-8 bg-luxury-gold/5 border border-luxury-gold/10 rounded-[2.5rem] flex items-center gap-6">
                       <div className="w-16 h-16 rounded-2xl bg-luxury-gold/10 flex items-center justify-center shrink-0 text-luxury-gold">
                         <Shield size={32} />
                       </div>
                       <div>
                          <h4 className="text-white font-bold mb-1">Verify Identity</h4>
                          <p className="text-white/40 text-xs">A link to upload your professional credentials will be sent to your email after submission.</p>
                       </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-2">
                       <input type="checkbox" className="mt-1 rounded bg-white/5 border-white/10 checked:bg-luxury-gold" />
                       <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold leading-relaxed">
                          I agree to AmaanEstate's professional code of conduct and understand that my account remains in "Pending" status until verified by regional registry.
                       </p>
                    </div>
                 </motion.div>
               )}

               <div className="flex gap-4 pt-10">
                  {step > 1 && (
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(step - 1)}
                      className="border-white/10 text-white h-16 px-8 rounded-2xl hover:bg-white/5"
                    >
                      Back
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button 
                      onClick={() => setStep(step + 1)}
                      className="flex-1 bg-white/5 text-white hover:bg-white/10 h-16 rounded-2xl font-bold border border-white/10"
                    >
                      Next Step <ChevronRight size={18} className="ml-2" />
                    </Button>
                  ) : (
                    <Button className="flex-1 bg-luxury-gold text-luxury-black hover:bg-white transition-all h-16 rounded-2xl font-bold text-lg shadow-xl shadow-luxury-gold/10">
                      Submit For Verification
                    </Button>
                  )}
               </div>

               <div className="flex items-center justify-center gap-2 text-white/20 text-[10px] uppercase tracking-widest font-bold pt-4">
                  <CheckCircle2 size={12} className="text-luxury-gold" /> Registry Concierge Typically Responds within 48h
               </div>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
