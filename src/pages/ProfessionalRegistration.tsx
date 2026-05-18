import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Award, TrendingUp, Users, CheckCircle2, ChevronRight, Briefcase, Star, MapPin, Loader2, Info, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { applicationService } from '@/services/applicationService';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfessionalRegistration() {
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      // We don't force redirect here yet, we show a nice login prompt inside the layout
    }
  }, [user, authLoading]);

  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    designation: '',
    expertise: 'Construction & Engineering',
    email: user?.email || '',
    yearsInService: '',
    region: 'Jigjiga',
    narrative: '',
    agreedToCode: false
  });

  // Pre-fill if user loads after initial mount
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.displayName || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to submit an application.');
      return;
    }
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (!formData.agreedToCode) {
      setError('You must adhere to the professional code of conduct.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await applicationService.submitApplication('professional', formData, user);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err: any) {
      setError(err.message || 'Service onboarding failed.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-luxury-gold animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-16 rounded-[4rem] text-center max-w-xl"
        >
          <div className="w-24 h-24 bg-luxury-gold/20 rounded-full flex items-center justify-center mx-auto mb-10 text-luxury-gold">
            <Lock size={48} />
          </div>
          <h2 className="text-4xl font-display font-bold text-white mb-6">Authentication Required</h2>
          <p className="text-white/40 leading-relaxed mb-10">
            Becoming a verified professional requires institutional vetting linked to a secure Amaan account. Please sign in to continue.
          </p>
          <Button asChild className="bg-luxury-gold text-luxury-black hover:bg-white px-12 h-16 rounded-2xl font-bold uppercase tracking-widest text-xs">
            <Link to="/login">Sign In & Continue</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-16 rounded-[4rem] text-center max-w-xl"
        >
          <div className="w-24 h-24 bg-luxury-gold/20 rounded-full flex items-center justify-center mx-auto mb-10 text-luxury-gold">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-4xl font-display font-bold text-white mb-6">Inquiry Logged</h2>
          <p className="text-white/40 leading-relaxed mb-10">
            Professional onboarding is currently under review. Registry verification will be finalized following structural data auditing.
          </p>
          <Button onClick={() => navigate('/dashboard')} className="bg-luxury-gold text-luxury-black hover:bg-white px-12 h-16 rounded-2xl font-bold uppercase tracking-widest text-xs">
            Return to Command Center
          </Button>
        </motion.div>
      </div>
    );
  }

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

              <form className="space-y-8 relative z-10" onSubmit={handleSubmit}>
                 {error && (
                   <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest">
                     <Info size={16} /> {error}
                   </div>
                 )}
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
                            <Input 
                                required
                                placeholder="Ahmed Mohamud" 
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                className="bg-white/5 border-0 h-16 rounded-2xl text-white placeholder:text-white/10 text-lg px-6 focus-visible:ring-luxury-gold/30" 
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Professional Designation</label>
                            <Input 
                                required
                                placeholder="Senior Civil Engineer" 
                                value={formData.designation}
                                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                className="bg-white/5 border-0 h-16 rounded-2xl text-white placeholder:text-white/10 text-lg px-6 focus-visible:ring-luxury-gold/30" 
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Domain Expertise</label>
                          <div className="relative">
                            <select 
                                required
                                value={formData.expertise}
                                onChange={e => setFormData({ ...formData, expertise: e.target.value })}
                                className="flex h-16 w-full rounded-2xl border-0 bg-white/5 px-6 text-lg text-white focus:outline-none appearance-none cursor-pointer"
                            >
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
                          <Input 
                            required
                            type="email" 
                            placeholder="ahmed@pro-registry.com" 
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="bg-white/5 border-0 h-16 rounded-2xl text-white placeholder:text-white/10 text-lg px-6 focus-visible:ring-luxury-gold/30" 
                          />
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
                            <Input 
                                required
                                type="number" 
                                placeholder="10" 
                                value={formData.yearsInService}
                                onChange={e => setFormData({ ...formData, yearsInService: e.target.value })}
                                className="bg-white/5 border-0 h-16 rounded-2xl text-white placeholder:text-white/10 text-lg px-6 focus-visible:ring-luxury-gold/30" 
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Primary Region</label>
                            <div className="relative">
                              <select 
                                required
                                value={formData.region}
                                onChange={e => setFormData({ ...formData, region: e.target.value })}
                                className="flex h-16 w-full rounded-2xl border-0 bg-white/5 px-6 text-lg text-white focus:outline-none appearance-none cursor-pointer"
                              >
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
                            required
                            placeholder="Describe your significant regional successes and projects..." 
                            value={formData.narrative}
                            onChange={e => setFormData({ ...formData, narrative: e.target.value })}
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
                           <input 
                            type="checkbox" 
                            checked={formData.agreedToCode}
                            onChange={e => setFormData({ ...formData, agreedToCode: e.target.checked })}
                            className="mt-1 w-5 h-5 rounded-lg bg-white/5 border-white/10 checked:bg-luxury-gold accent-luxury-gold" 
                           />
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
                        type="button"
                        variant="outline" 
                        onClick={() => setStep(step - 1)}
                        className="bg-white/5 border-white/5 text-white h-20 px-10 rounded-[2rem] hover:bg-white/10"
                      >
                        Back
                      </Button>
                    )}
                    <Button 
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-luxury-gold text-luxury-black hover:bg-white transition-all h-20 rounded-[2rem] font-bold text-xl shadow-2xl shadow-luxury-gold/10"
                    >
                      {step < 3 ? (
                        <div className="flex items-center">Proceed <ChevronRight size={22} className="ml-3" /></div>
                      ) : (
                        loading ? (
                          <div className="flex items-center gap-3">
                            <Loader2 className="animate-spin" /> Informing Regional Registry...
                          </div>
                        ) : 'Submit Registry Inquiry'
                      )}
                    </Button>
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
