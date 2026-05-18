import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Award, TrendingUp, Users, CheckCircle2, Loader2, Info, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { applicationService } from '@/services/applicationService';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function AgentRegistration() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    agencyName: '',
    email: user?.email || '',
    region: 'Jigjiga HQ',
    overview: ''
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
    setLoading(true);
    setError(null);
    try {
      await applicationService.submitApplication('agent', formData, user);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err: any) {
      setError(err.message || 'Institutional review initialization failed.');
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
          <h2 className="text-4xl font-display font-bold text-white mb-6">Partnership Protocol</h2>
          <p className="text-white/40 leading-relaxed mb-10">
            Institutional agency partnerships require a verified Amaan secure identity. Please authenticate to initialize your review process.
          </p>
          <Button asChild className="bg-luxury-gold text-luxury-black hover:bg-white px-12 h-16 rounded-2xl font-bold uppercase tracking-widest text-xs">
            <Link to="/login">Authenticate & Start</Link>
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
          <h2 className="text-4xl font-display font-bold text-white mb-6">Inquiry Received</h2>
          <p className="text-white/40 leading-relaxed mb-10">
            Your credentials have been uploaded to the regional verification matrix. Our compliance board will review your application within 48 hours.
          </p>
          <Button onClick={() => navigate('/dashboard')} className="bg-luxury-gold text-luxury-black hover:bg-white px-12 h-16 rounded-2xl font-bold uppercase tracking-widest text-xs">
            Return to Command Center
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black pt-28 pb-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-12 xl:col-span-5"
          >
            <p className="text-luxury-gold font-bold tracking-[0.4em] uppercase text-[10px] mb-6">Elite Partnerships</p>
            <h1 className="text-6xl md:text-8xl font-display font-bold text-white mb-10 tracking-tighter leading-[0.9]">
              Network <br />
              <span className="gold-text-gradient">of Excellence</span>
            </h1>
            <p className="text-white/40 text-xl font-light mb-16 max-w-xl leading-relaxed">
              AmaanEstate represents the benchmark of luxury. We invite the regions most sophisticated brokers to join our exclusive ecosystem.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-10">
              {[
                { icon: <Shield />, title: 'Prestige Branding', desc: 'Associate with the most trusted name in Somali luxury assets.' },
                { icon: <TrendingUp />, title: 'Institutional Reach', desc: 'Direct channel to high-net-worth investors and the global diaspora.' },
                { icon: <Award />, title: 'Advanced Toolkit', desc: 'Sophisticated backend to manage listings and client interactions.' },
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

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-12 xl:col-span-7"
          >
            <div className="glass-card p-10 md:p-16 rounded-[4rem] relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
               <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
               
               <div className="mb-12">
                 <h2 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Access Application</h2>
                 <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em]">Initialize your professional partnership</p>
               </div>
               
               <form className="space-y-8 relative z-10" onSubmit={handleSubmit}>
                 {error && (
                   <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest">
                     <Info size={16} /> {error}
                   </div>
                 )}
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
                     <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Agency Institution</label>
                     <Input 
                        required
                        placeholder="Prime Realty Ltd" 
                        value={formData.agencyName}
                        onChange={e => setFormData({ ...formData, agencyName: e.target.value })}
                        className="bg-white/5 border-0 h-16 rounded-2xl text-white placeholder:text-white/10 text-lg px-6 focus-visible:ring-luxury-gold/30" 
                      />
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                     <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Professional Email</label>
                     <Input 
                        required
                        type="email" 
                        placeholder="ahmed@agency.com" 
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white/5 border-0 h-16 rounded-2xl text-white placeholder:text-white/10 text-lg px-6 focus-visible:ring-luxury-gold/30" 
                      />
                   </div>
                   <div className="space-y-3">
                     <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Operating Region</label>
                     <div className="relative">
                       <select 
                        required
                        value={formData.region}
                        onChange={e => setFormData({ ...formData, region: e.target.value })}
                        className="flex h-16 w-full rounded-2xl border-0 bg-white/5 px-6 text-lg text-white focus:outline-none appearance-none cursor-pointer"
                       >
                         <option className="bg-luxury-black">Jigjiga HQ</option>
                         <option className="bg-luxury-black">Addis Ababa Cluster</option>
                         <option className="bg-luxury-black">Dire Dawa Hub</option>
                         <option className="bg-luxury-black">Global Diaspora Agent</option>
                       </select>
                       <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                          <TrendingUp size={16} className="rotate-90" />
                       </div>
                     </div>
                   </div>
                 </div>

                 <div className="space-y-3">
                   <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Career Overview</label>
                   <Textarea 
                    required
                    placeholder="Brief architectural history or brokerage volume..." 
                    value={formData.overview}
                    onChange={e => setFormData({ ...formData, overview: e.target.value })}
                    className="bg-white/5 border-0 min-h-[160px] rounded-2xl text-white placeholder:text-white/10 text-lg px-6 py-6 focus-visible:ring-luxury-gold/30 resize-none" 
                   />
                 </div>

                 <Button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-luxury-gold text-luxury-black hover:bg-white transition-all h-20 rounded-[2rem] font-bold text-xl shadow-2xl shadow-luxury-gold/20"
                 >
                   {loading ? (
                     <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin" /> Informing Regional Registry...
                     </div>
                   ) : 'Submit For Institutional Review'}
                 </Button>

                 <div className="flex items-center justify-center gap-3 text-white/10 text-[10px] font-bold uppercase tracking-[0.3em] pt-4">
                   <Shield size={14} className="text-luxury-gold" />
                   Secure vetting protocol in progress
                 </div>
               </form>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
