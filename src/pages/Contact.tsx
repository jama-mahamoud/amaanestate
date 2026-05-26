import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, MessageSquare, Send, Clock, CheckCircle2, Loader2, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { notificationService } from '@/services/notificationService';

export default function Contact() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Property Portfolio Inquiry',
    message: ''
  });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const authUserId = user?.uid || null;
      const submissionData = {
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        inquiryType: formData.subject,
        message: formData.message.trim(),
        status: 'unread',
        createdAt: serverTimestamp(),
        userId: authUserId
      };

      const docRef = await addDoc(collection(db, 'contactMessages'), submissionData);
      
      setSuccess(true);
      toast.success('Inquiry dispatched successfully');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Property Portfolio Inquiry',
        message: ''
      });
    } catch (error: any) {
      console.error('Contact submission CRITICAL failure:', error);
      toast.error(`Failed to dispatch inquiry: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [formData, user?.uid]);

  return (
    <div className="min-h-screen bg-luxury-black pt-28 pb-20 overflow-hidden relative">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-luxury-gold/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-luxury-gold/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        
        <div className="max-w-4xl mb-16 md:mb-24">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-luxury-gold font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-[9px] md:text-[10px] mb-4 md:mb-6 underline underline-offset-8 decoration-luxury-gold/30"
          >
             Concierge Relations
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-9xl font-display font-bold text-white mb-6 md:mb-10 tracking-tighter leading-[1.1] md:leading-[0.85]"
          >
            Direct <br />
            <span className="gold-text-gradient">Communications</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg md:text-xl font-light leading-relaxed max-w-2xl px-1"
          >
            Whether acquiring a landmark estate or listing a high-performance vehicle, our executive team ensures absolute confidentiality and regional precision.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Contact Details */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-8 md:space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
               <a 
                href="tel:+251910012794" 
                className="glass-card p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] group hover:border-luxury-gold/20 transition-all duration-700 block"
               >
                 <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 flex items-center justify-center text-luxury-gold mb-6 md:mb-8 group-hover:bg-luxury-gold group-hover:text-luxury-black transition-all duration-500">
                    <Phone size={20} />
                 </div>
                 <h4 className="text-lg md:text-xl font-display font-bold text-white mb-2 tracking-tight">Vocal Channel</h4>
                 <p className="text-white/20 text-xs md:text-sm font-light italic tracking-wider transition-colors group-hover:text-white/60">+251 910 012 794</p>
               </a>

               <a 
                href="mailto:support@amaanestate.com" 
                className="glass-card p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] group hover:border-luxury-gold/20 transition-all duration-700 block"
               >
                 <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 flex items-center justify-center text-luxury-gold mb-6 md:mb-8 group-hover:bg-luxury-gold group-hover:text-luxury-black transition-all duration-500">
                    <Mail size={20} />
                 </div>
                 <h4 className="text-lg md:text-xl font-display font-bold text-white mb-2 tracking-tight">Official Inbox</h4>
                 <p className="text-white/20 text-xs md:text-sm font-light italic tracking-wider transition-colors group-hover:text-white/60">support@amaanestate.com</p>
               </a>
            </div>

            <div className="glass-card p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] space-y-8 md:space-y-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl rounded-full" />
               
               <div className="flex gap-6 md:gap-8 group">
                 <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-luxury-gold group-hover:scale-110 transition-transform duration-500">
                    <MapPin size={24} />
                 </div>
                 <div>
                    <h4 className="text-lg md:text-xl font-display font-bold text-white mb-2 tracking-tight">Strategic Headquarters</h4>
                    <p className="text-white/20 text-xs md:text-sm leading-relaxed font-light">Main Road, Office Tower IV,<br />Jigjiga, Somali Region, Ethiopia</p>
                 </div>
               </div>
               
               <div className="flex gap-6 md:gap-8 group">
                 <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-luxury-gold group-hover:scale-110 transition-transform duration-500">
                    <Clock size={24} />
                 </div>
                 <div>
                    <h4 className="text-lg md:text-xl font-display font-bold text-white mb-2 tracking-tight">Executive Window</h4>
                    <p className="text-white/20 text-xs md:text-sm font-light tracking-wide">Monday — Saturday: 08:00 – 18:00 (EAT)</p>
                 </div>
               </div>

               <div className="pt-2">
                  <Button 
                    asChild
                    variant="outline" 
                    className="w-full border-white/5 bg-white/5 text-white hover:bg-[#25D366] hover:text-white transition-all duration-500 rounded-2xl md:rounded-3xl h-14 md:h-16 font-bold uppercase tracking-[0.2em] text-[9px] md:text-[10px]"
                  >
                    <a href="https://wa.me/251910012794" target="_blank" rel="noopener noreferrer">
                      <MessageSquare size={16} className="mr-3" /> Encrypted WhatsApp
                    </a>
                  </Button>
               </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-12 xl:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10 md:py-20"
                  >
                    <div className="w-20 h-20 bg-luxury-gold/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                       <CheckCircle2 size={40} className="text-luxury-gold" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 tracking-tight">Dispatch Confirmed</h3>
                    <p className="text-white/40 text-sm md:text-base max-w-xs mx-auto leading-relaxed mb-10">
                      Your institutional inquiry has been logged. Our concierge team will respond within 24 standard business hours.
                    </p>
                    <Button 
                      onClick={() => setSuccess(false)}
                      variant="outline"
                      className="border-white/10 text-white rounded-2xl h-14 px-10"
                    >
                      New Correspondence
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="form">
                    <div className="text-center mb-10 md:mb-12">
                       <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 tracking-tight">Direct Inquiry</h3>
                       <p className="text-white/20 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em]">Initialize official correspondence</p>
                    </div>

                    <form className="space-y-6 md:space-y-8 relative z-10" onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-3">
                          <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Full Legal Name</label>
                          <Input 
                            required
                            placeholder="Enter Your Name" 
                            className="bg-white/5 border-0 h-14 md:h-16 rounded-xl md:rounded-2xl text-white placeholder:text-white/10 text-base md:text-lg px-6 focus-visible:ring-luxury-gold/30" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Contact Email</label>
                          <Input 
                            required
                            type="email"
                            placeholder="email@example.com" 
                            className="bg-white/5 border-0 h-14 md:h-16 rounded-xl md:rounded-2xl text-white placeholder:text-white/10 text-base md:text-lg px-6 focus-visible:ring-luxury-gold/30" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Nature of Inquiry</label>
                        <div className="relative">
                          <select 
                            className="flex h-14 md:h-16 w-full rounded-xl md:rounded-2xl border-0 bg-white/5 px-6 text-base md:text-lg text-white focus:outline-none appearance-none cursor-pointer"
                            value={formData.subject}
                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          >
                            <option className="bg-luxury-black">Property Portfolio Inquiry</option>
                            <option className="bg-luxury-black">Vehicle Assets Acquisition</option>
                            <option className="bg-luxury-black">Professional Registry Inquiry</option>
                            <option className="bg-luxury-black">Institutional Partnership</option>
                            <option className="bg-luxury-black">General Support Request</option>
                          </select>
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                              <Landmark size={18} />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Brief Narrative</label>
                        <Textarea 
                          required
                          placeholder="How may our regional concierge assist your vision?" 
                          className="bg-white/5 border-0 min-h-[140px] md:min-h-[180px] rounded-xl md:rounded-2xl text-white placeholder:text-white/10 text-base md:text-lg px-6 py-6 focus-visible:ring-luxury-gold/30 resize-none" 
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                        />
                      </div>

                      <Button 
                        disabled={loading || !user}
                        className="w-full bg-luxury-gold text-luxury-black hover:bg-white transition-all h-16 md:h-20 rounded-[1.5rem] md:rounded-[2rem] font-bold text-lg md:text-xl shadow-2xl shadow-luxury-gold/10"
                      >
                        {loading ? <Loader2 className="animate-spin mr-3" /> : <Send size={20} className="mr-3" />}
                        {loading ? 'Dispatching...' : 'Dispatch Correspondence'}
                      </Button>

                      {!user && (
                        <div className="text-center mt-4">
                          <p className="text-white/40 text-xs md:text-sm">
                            Please <Link to="/login" className="text-luxury-gold hover:underline">sign in</Link> to initialize institutional correspondence.
                          </p>
                        </div>
                      )}
                      
                      <div className="text-center mt-6">
                         <p className="text-white/10 text-[9px] uppercase font-bold tracking-[0.5em]">Secure Institutional Protocol</p>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
