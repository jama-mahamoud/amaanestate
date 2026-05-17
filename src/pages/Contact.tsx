import { motion } from 'motion/react';
import { Mail, Phone, MapPin, MessageSquare, Send, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function Contact() {
  return (
    <div className="min-h-screen bg-luxury-black pt-28 pb-20 overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-luxury-gold/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        
        <div className="max-w-4xl mb-24">
          <p className="text-luxury-gold font-bold tracking-[0.4em] uppercase text-[10px] mb-6 underline underline-offset-8 decoration-luxury-gold/30">Concierge Relations</p>
          <h1 className="text-6xl md:text-9xl font-display font-bold text-white mb-10 tracking-tighter leading-[0.85]">
            Direct <br />
            <span className="gold-text-gradient">Communications</span>
          </h1>
          <p className="text-white/40 text-xl font-light leading-relaxed max-w-2xl">
            Whether acquiring a landmark estate or listing a high-performance vehicle, our executive team ensures absolute confidentiality and regional precision.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          
          {/* Contact Details */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="glass-card p-10 rounded-[3rem] group hover:border-luxury-gold/20 transition-all duration-700">
                 <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-luxury-gold mb-8 group-hover:bg-luxury-gold group-hover:text-luxury-black transition-all duration-500">
                    <Phone size={24} />
                 </div>
                 <h4 className="text-xl font-display font-bold text-white mb-2 tracking-tight">Vocal Channel</h4>
                 <p className="text-white/20 text-sm font-light italic tracking-wider">+251 910 012 794</p>
               </div>
               <div className="glass-card p-10 rounded-[3rem] group hover:border-luxury-gold/20 transition-all duration-700">
                 <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-luxury-gold mb-8 group-hover:bg-luxury-gold group-hover:text-luxury-black transition-all duration-500">
                    <Mail size={24} />
                 </div>
                 <h4 className="text-xl font-display font-bold text-white mb-2 tracking-tight">Official Inbox</h4>
                 <p className="text-white/20 text-sm font-light italic tracking-wider">vip@amaanestate.com</p>
               </div>
            </div>

            <div className="glass-card p-12 rounded-[4rem] space-y-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl rounded-full" />
               
               <div className="flex gap-8 group">
                 <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-luxury-gold group-hover:scale-110 transition-transform duration-500">
                   <MapPin size={24} />
                 </div>
                 <div>
                    <h4 className="text-xl font-display font-bold text-white mb-2 tracking-tight">Strategic Headquarters</h4>
                    <p className="text-white/20 text-sm leading-relaxed font-light">Office Tower IV, Platinum District, <br />Jigjiga, Somali Region, Ethiopia</p>
                 </div>
               </div>
               
               <div className="flex gap-8 group">
                 <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-luxury-gold group-hover:scale-110 transition-transform duration-500">
                   <Clock size={24} />
                 </div>
                 <div>
                    <h4 className="text-xl font-display font-bold text-white mb-2 tracking-tight">Executive Window</h4>
                    <p className="text-white/20 text-sm font-light tracking-wide">Monday — Saturday: 08:00 – 18:00 (EAT)</p>
                 </div>
               </div>

               <div className="pt-4">
                  <Button variant="outline" className="w-full border-white/5 bg-white/5 text-white hover:bg-luxury-gold hover:text-luxury-black transition-all duration-500 rounded-3xl h-16 font-bold uppercase tracking-[0.2em] text-[10px]">
                    <MessageSquare size={16} className="mr-3" /> Encrypted WhatsApp
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
              className="glass-card p-10 md:p-16 rounded-[4rem] relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="text-center mb-12">
                 <h3 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Direct Inquiry</h3>
                 <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">Initialize official correspondence</p>
              </div>

              <form className="space-y-8 relative z-10" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Full Legal Name</label>
                    <Input placeholder="Ahmed Mohamud" className="bg-white/5 border-0 h-16 rounded-2xl text-white placeholder:text-white/10 text-lg px-6 focus-visible:ring-luxury-gold/30" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Reference Number (Optional)</label>
                    <Input placeholder="+251 ..." className="bg-white/5 border-0 h-16 rounded-2xl text-white placeholder:text-white/10 text-lg px-6 focus-visible:ring-luxury-gold/30" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Nature of Inquiry</label>
                  <div className="relative">
                    <select className="flex h-16 w-full rounded-2xl border-0 bg-white/5 px-6 text-lg text-white focus:outline-none appearance-none cursor-pointer">
                      <option className="bg-luxury-black">Property Portfolio Inquiry</option>
                      <option className="bg-luxury-black">Vehicle Assets Acquisition</option>
                      <option className="bg-luxury-black">Professional Registry Inquiry</option>
                      <option className="bg-luxury-black">Institutional Partnership</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                        <Send size={16} className="rotate-45" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Brief Narrative</label>
                  <Textarea 
                    placeholder="How may our regional concierge assist your vision?" 
                    className="bg-white/5 border-0 min-h-[180px] rounded-2xl text-white placeholder:text-white/10 text-lg px-6 py-6 focus-visible:ring-luxury-gold/30 resize-none" 
                  />
                </div>

                <Button className="w-full bg-luxury-gold text-luxury-black hover:bg-white transition-all h-20 rounded-[2rem] font-bold text-xl shadow-2xl shadow-luxury-gold/10">
                  <Send size={20} className="mr-3" /> Dispatch Correspondence
                </Button>
                
                <div className="text-center">
                   <p className="text-white/10 text-[9px] uppercase font-bold tracking-[0.5em]">Secure Institutional Protocol</p>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
