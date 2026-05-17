import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-12 xl:col-span-5"
          >
            <p className="text-luxury-gold font-bold tracking-[0.4em] uppercase text-[10px] mb-6">Regional Registry</p>
            <h1 className="text-6xl md:text-8xl font-display font-bold text-white mb-10 tracking-tighter leading-[0.9]">
              Professional <br />
              <span className="gold-text-gradient">Benchmark</span>
            </h1>
            <p className="text-white/40 text-xl font-light mb-16 max-w-xl leading-relaxed">
              Connect with high-net-worth clients through the regions most prestigious registry of verified experts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-12">
              {[
                { icon: <Shield />, title: 'Elite Verification', desc: 'The Amaan badge signals verified expertise to every potential client.' },
                { icon: <TrendingUp />, title: 'Strategic Pipeline', desc: 'Direct access to the regions most significant residential and commercial projects.' },
                { icon: <Award />, title: 'Curated Platform', desc: 'Join an ecosystem that rewards precision and demand for excellence.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-8 group">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-luxury-gold group-hover:bg-luxury-gold group-hover:text-luxury-black transition-all duration-500">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-display font-bold text-white mb-2 tracking-tight">{item.title}</h4>
                    <p className="text-white/30 text-sm leading-relaxed max-w-sm">{item.desc}</p>
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
            className="lg:col-span-12 xl:col-span-7"
          >
            <div className="glass-card p-10 md:p-16 rounded-[4rem] relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
              
              {/* Form Progress */}
              <div className="flex gap-3 mb-16">
                 {[1, 2, 3].map(s => (
                   <div key={s} className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                      <div 
                        className={`h-full bg-luxury-gold transition-all duration-700 ease-out ${step >= s ? 'w-full' : 'w-0'}`} 
                      />
                   </div>
                 ))}
              </div>

              <div className="mb-12">
                <h2 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Onboarding Inquiry</h2>
                <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em]">Phase {step}: {step === 1 ? 'Academic & Title' : step === 2 ? 'Experience' : 'Credentials Verification'}</p>
              </div>

              <form className="space-y-8 relative z-10" onSubmit={(e) => e.preventDefault()}>
                 <AnimatePresence mode="wait">
                   {step === 1 && (
                     <motion.div 
                       key="step1"
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       className="space-y-8"
                     >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Full Legal Name</label>
                            <Input placeholder="Ahmed Mohamud" className="bg-white/5 border-0 h-16 rounded-2xl text-white placeholder:text-white/10 text-lg px-6 focus-visible:ring-luxury-gold/30" />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Professional Designation</label>
                            <Input placeholder="Senior Civil Engineer" className="bg-white/5 border-0 h-16 rounded-2xl text-white placeholder:text-white/10 text-lg px-6 focus-visible:ring-luxury-gold/30" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Domain Expertise</label>
                          <div className="relative">
                            <select className="flex h-16 w-full rounded-2xl border-0 bg-white/5 px-6 text-lg text-white focus:outline-none appearance-none cursor-pointer">
                              <option className="bg-luxury-black">Construction & Engineering</option>
                              <option className="bg-luxury-black">Electrical & Technical</option>
                              <option className="bg-luxury-black">Architecture & Interior Design</option>
                              <option className="bg-luxury-black">Sustainable Energy Tech</option>
                              <option className="bg-luxury-black">Industrial Maintenance</option>
                            </select>
                            <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 opacity-20 pointer-events-none" size={16} />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Secure Email Address</label>
                          <Input type="email" placeholder="ahmed@pro-registry.com" className="bg-white/5 border-0 h-16 rounded-2xl text-white placeholder:text-white/10 text-lg px-6 focus-visible:ring-luxury-gold/30" />
                        </div>
                     </motion.div>
                   )}

                   {step === 2 && (
                     <motion.div 
                       key="step2"
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       className="space-y-8"
                     >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Years In Service</label>
                            <Input type="number" placeholder="10" className="bg-white/5 border-0 h-16 rounded-2xl text-white placeholder:text-white/10 text-lg px-6 focus-visible:ring-luxury-gold/30" />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Primary Region</label>
                            <div className="relative">
                              <select className="flex h-16 w-full rounded-2xl border-0 bg-white/5 px-6 text-lg text-white focus:outline-none appearance-none cursor-pointer">
                                <option className="bg-luxury-black">Jigjiga</option>
                                <option className="bg-luxury-black">Addis Ababa</option>
                                <option className="bg-luxury-black">Dire Dawa</option>
                                <option className="bg-luxury-black">Godey</option>
                              </select>
                              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 opacity-20 pointer-events-none" size={16} />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Expert Narrative</label>
                          <Textarea 
                            placeholder="Describe your significant regional successes and projects..." 
                            className="bg-white/5 border-0 min-h-[160px] rounded-2xl text-white placeholder:text-white/10 text-lg px-6 py-6 focus-visible:ring-luxury-gold/30 resize-none" 
                          />
                        </div>
                     </motion.div>
                   )}

                   {step === 3 && (
                     <motion.div 
                       key="step3"
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       className="space-y-10"
                     >
                        <div className="p-10 bg-white/5 border border-white/5 rounded-[2.5rem] flex items-center gap-8 group">
                           <div className="w-20 h-20 rounded-2xl bg-luxury-gold/10 flex items-center justify-center shrink-0 text-luxury-gold group-hover:bg-luxury-gold group-hover:text-luxury-black transition-all duration-500">
                             <Shield size={36} />
                           </div>
                           <div>
                              <h4 className="text-xl font-display font-bold text-white mb-2">Institutional Verification</h4>
                              <p className="text-white/30 text-sm leading-relaxed">Secure document portal access will be granted following initial review.</p>
                           </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                           <input type="checkbox" className="mt-1 w-5 h-5 rounded-lg bg-white/5 border-white/10 checked:bg-luxury-gold accent-luxury-gold" />
                           <p className="text-[11px] text-white/20 uppercase tracking-[0.1em] font-bold leading-relaxed">
                              I confirm adherence to AmaanEstate's professional code. Account remains pending until formal registry validation.
                           </p>
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <div className="flex gap-6 pt-10 border-t border-white/5">
                    {step > 1 && (
                      <Button 
                        variant="outline" 
                        onClick={() => setStep(step - 1)}
                        className="bg-white/5 border-white/5 text-white h-20 px-10 rounded-[2rem] hover:bg-white/10"
                      >
                        Back
                      </Button>
                    )}
                    {step < 3 ? (
                      <Button 
                        onClick={() => setStep(step + 1)}
                        className="flex-1 bg-white/5 text-white hover:bg-white/10 h-20 rounded-[2rem] font-bold text-xl border border-white/5"
                      >
                        Proceed <ChevronRight size={22} className="ml-3" />
                      </Button>
                    ) : (
                      <Button className="flex-1 bg-luxury-gold text-luxury-black hover:bg-white transition-all h-20 rounded-[2rem] font-bold text-xl shadow-2xl shadow-luxury-gold/10">
                        Submit Registry Inquiry
                      </Button>
                    )}
                 </div>

                 <div className="flex items-center justify-center gap-3 text-white/10 text-[9px] font-bold uppercase tracking-[0.4em] pt-6">
                    <CheckCircle2 size={14} className="text-luxury-gold" /> Initial Vetting Window: 48 Hours
                 </div>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
