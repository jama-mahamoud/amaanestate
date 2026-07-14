import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  ChevronRight,
  Sparkles,
  Megaphone,
  BookOpen,
  LifeBuoy,
  AlertTriangle,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Contact() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
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
      // Send to FormSubmit
      const response = await fetch('https://formsubmit.co/ajax/b65456d54379959a0d4af14c9ba036ae', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          phone: formData.phone.trim(),
          subject: formData.subject,
          _captcha: "false"
        })
      });

      const data = await response.json();
      if (data.success === 'false' || !response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }
      
      setSuccess(true);
      toast.success('Thank you! Your message has been successfully received.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: ''
      });
    } catch (error: any) {
      console.error('Contact submission failure:', error);
      toast.error(`Failed to dispatch message: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [formData, user?.uid]);

  return (
    <div className="min-h-screen bg-luxury-black pt-28 pb-20 overflow-hidden relative">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-luxury-gold/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-luxury-gold/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header Block */}
        <div className="max-w-4xl mb-16 md:mb-24">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-luxury-gold font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-[9px] md:text-[10px] mb-4 md:mb-6 underline underline-offset-8 decoration-luxury-gold/30"
          >
             Editorial & Communications HQ
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-8xl font-display font-bold text-white mb-6 md:mb-10 tracking-tighter leading-[1.1] md:leading-[0.85]"
          >
            Get In <br />
            <span className="gold-text-gradient">Touch With Us</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg md:text-xl font-light leading-relaxed max-w-2xl px-1"
          >
            Have a product you want us to review? Interested in sponsorships, SaaS licensing, or reporting an issue? Reach out to our specialized departments below.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left Side: Contact Details & Department Guide */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-10">
            
            {/* Quick Contact Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <a 
                href="tel:+251910012794" 
                className="glass-card p-6 rounded-[2rem] group hover:border-luxury-gold/20 transition-all duration-700 block"
               >
                 <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-luxury-gold mb-6 group-hover:bg-luxury-gold group-hover:text-luxury-black transition-all duration-500">
                    <Phone size={18} />
                 </div>
                 <h4 className="text-base font-display font-bold text-white mb-1">Direct Line</h4>
                 <p className="text-white/35 text-xs md:text-sm font-light tracking-wide transition-colors group-hover:text-white/60">+251 910 012 794</p>
               </a>

               <a 
                href="mailto:info@amaanestate.com" 
                className="glass-card p-6 rounded-[2rem] group hover:border-luxury-gold/20 transition-all duration-700 block"
               >
                 <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-luxury-gold mb-6 group-hover:bg-luxury-gold group-hover:text-luxury-black transition-all duration-500">
                    <Mail size={18} />
                 </div>
                 <h4 className="text-base font-display font-bold text-white mb-1">General Support</h4>
                 <p className="text-white/35 text-xs md:text-sm font-light tracking-wide transition-colors group-hover:text-white/60">info@amaanestate.com</p>
               </a>
            </div>

            {/* Department Guide / Breakdown */}
            <div className="glass-card p-8 md:p-10 rounded-[2.5rem] space-y-6">
              <h3 className="text-lg font-display font-bold text-white mb-4 tracking-tight border-b border-white/5 pb-4">
                Specialized Departments
              </h3>
              
              <div className="space-y-6 text-xs md:text-sm font-light">
                <div className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-luxury-gold shrink-0 mt-0.5">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-0.5">Editorial Team & Pitches</h4>
                    <p className="text-white/30 text-xs">For software developers seeking product reviews, feature audits, or technology evaluations.</p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-luxury-gold shrink-0 mt-0.5">
                    <Megaphone size={16} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-0.5">Sponsorships & Ads</h4>
                    <p className="text-white/30 text-xs">To explore native display ads, dedicated product highlights, or newsletter sponsorship placements.</p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-luxury-gold shrink-0 mt-0.5">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-0.5">Affiliate & SaaS Partnerships</h4>
                    <p className="text-white/30 text-xs">To integrate SaaS platforms, software portals, or affiliate coupon tracking programs.</p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-luxury-gold shrink-0 mt-0.5">
                    <LifeBuoy size={16} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-0.5">Technical Support</h4>
                    <p className="text-white/30 text-xs">For login queries, profile setup failures, newsletter opt-outs, or general guidance.</p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-luxury-gold shrink-0 mt-0.5">
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-0.5">Report an Issue / Bug</h4>
                    <p className="text-white/30 text-xs">Submit feedback regarding broken links, outdated tech specs, or security anomalies.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Presence Card */}
            <div className="glass-card p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl rounded-full" />
               
               <div className="flex gap-5 group">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-luxury-gold">
                    <MapPin size={18} />
                 </div>
                 <div>
                    <h4 className="text-base font-display font-bold text-white mb-1">Global Headquarters</h4>
                    <p className="text-white/30 text-xs md:text-sm leading-relaxed font-light">Main Road, Office Tower IV,<br />Jigjiga, Somali Region, Ethiopia</p>
                 </div>
               </div>
               
               <div className="flex gap-5 group">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-luxury-gold">
                    <Clock size={18} />
                 </div>
                 <div>
                    <h4 className="text-base font-display font-bold text-white mb-1">Editorial Sandbox Windows</h4>
                    <p className="text-white/30 text-xs md:text-sm font-light">Monday — Saturday: 08:00 – 18:00 (EAT)</p>
                 </div>
               </div>

               <div className="pt-2">
                  <Button 
                    asChild
                    variant="outline" 
                    className="w-full border-white/5 bg-white/5 text-white hover:bg-[#25D366] hover:text-white transition-all duration-500 rounded-2xl h-12 font-bold uppercase tracking-[0.2em] text-[9px] md:text-[10px]"
                  >
                    <a href="https://wa.me/251910012794" target="_blank" rel="noopener noreferrer">
                      <MessageSquare size={14} className="mr-2" /> Encrypted Tech Support
                    </a>
                  </Button>
               </div>
            </div>

          </div>

          {/* Right Side: Professional Contact Form */}
          <div className="lg:col-span-12 xl:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 md:p-14 rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10 md:py-16"
                  >
                    <div className="w-16 h-16 bg-luxury-gold/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                       <CheckCircle2 size={32} className="text-luxury-gold" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-3 tracking-tight">Message Transmitted</h3>
                    <p className="text-white/40 text-sm md:text-base max-w-md mx-auto leading-relaxed mb-8">
                      Thank you for initiating correspondence with AmaanEstate. Our editorial team, system analysts, or support desk will evaluate your request and follow up within 24 to 48 hours.
                    </p>
                    <Button 
                      onClick={() => setSuccess(false)}
                      variant="outline"
                      className="border-white/10 text-white rounded-xl h-12 px-8 text-xs font-bold uppercase tracking-widest"
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="form">
                    <div className="text-center mb-8 md:mb-10">
                       <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-1.5 tracking-tight">Direct Correspondence</h3>
                       <p className="text-white/20 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em]">Connect with our technical desk</p>
                    </div>

                    <form 
                      className="space-y-5 md:space-y-6 relative z-10" 
                      onSubmit={handleSubmit}
                    >
                      <input type="hidden" name="_captcha" value="false" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Your Name / Organization</label>
                          <Input 
                            required
                            name="name"
                            placeholder="Enter Name" 
                            className="bg-white/5 border-0 h-12 md:h-14 rounded-xl text-white placeholder:text-white/10 text-sm md:text-base px-5 focus-visible:ring-luxury-gold/30" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Business Email</label>
                          <Input 
                            required
                            name="email"
                            type="email"
                            placeholder="email@example.com" 
                            className="bg-white/5 border-0 h-12 md:h-14 rounded-xl text-white placeholder:text-white/10 text-sm md:text-base px-5 focus-visible:ring-luxury-gold/30" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Contact Number (Optional)</label>
                          <Input 
                            name="phone"
                            placeholder="+251 ..." 
                            className="bg-white/5 border-0 h-12 md:h-14 rounded-xl text-white placeholder:text-white/10 text-sm md:text-base px-5 focus-visible:ring-luxury-gold/30" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Inquiry Department</label>
                          <div className="relative">
                            <select 
                              name="subject"
                              className="flex h-12 md:h-14 w-full rounded-xl border-0 bg-white/5 px-5 text-sm md:text-base text-white focus:outline-none appearance-none cursor-pointer"
                              value={formData.subject}
                              onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            >
                              <option className="bg-luxury-black">General Inquiry</option>
                              <option className="bg-luxury-black">Editorial / Review Pitch</option>
                              <option className="bg-luxury-black">Sponsorships & Advertising</option>
                              <option className="bg-luxury-black">Affiliate & SaaS Partnerships</option>
                              <option className="bg-luxury-black">Technical Support & Helpdesk</option>
                              <option className="bg-luxury-black">Report an Issue / Bug</option>
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-25">
                                <Building size={16} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Inquiry Message</label>
                        <Textarea 
                          required
                          name="message"
                          placeholder="Please provide the details of your inquiry..." 
                          className="bg-white/5 border-0 min-h-[140px] md:min-h-[160px] rounded-xl text-white placeholder:text-white/10 text-sm md:text-base px-5 py-4 focus-visible:ring-luxury-gold/30 resize-none" 
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                        />
                      </div>

                      <Button 
                        disabled={loading || !user}
                        className="w-full bg-luxury-gold text-luxury-black hover:bg-white transition-all h-14 md:h-16 rounded-xl font-bold text-base md:text-lg shadow-xl shadow-luxury-gold/5"
                      >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Send size={16} className="mr-2" />}
                        {loading ? 'Transmitting...' : 'Transmit Inquiry'}
                      </Button>

                      {!user && (
                        <div className="text-center mt-3">
                          <p className="text-white/45 text-xs">
                            Please <Link to="/login" className="text-luxury-gold hover:underline font-medium">sign in</Link> to initialize authorized communications.
                          </p>
                        </div>
                      )}
                      
                      <div className="text-center mt-4">
                         <p className="text-white/10 text-[8px] uppercase font-bold tracking-[0.4em]">Secure Technical Ingress Protocol</p>
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
