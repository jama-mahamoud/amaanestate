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
        
        <div className="max-w-2xl mb-20">
          <p className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-xs mb-4">Personalized Support</p>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-8 tracking-tight">
            Connect With Our <br />
            <span className="gold-text-gradient">Registry Experts</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Whether you are looking to acquire a landmark property or list a premium vehicle, our executive team is ready to assist you with the utmost confidentiality.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-8 bg-luxury-charcoal/40 rounded-[2.5rem] border border-white/5 hover:border-luxury-gold/20 transition-all group">
                 <Phone size={24} className="text-luxury-gold mb-6 group-hover:scale-110 transition-transform" />
                 <h4 className="text-white font-bold mb-2">Call Us</h4>
                 <p className="text-white/40 text-sm italic">+251 910 012 794</p>
               </div>
               <div className="p-8 bg-luxury-charcoal/40 rounded-[2.5rem] border border-white/5 hover:border-luxury-gold/20 transition-all group">
                 <Mail size={24} className="text-luxury-gold mb-6 group-hover:scale-110 transition-transform" />
                 <h4 className="text-white font-bold mb-2">Email</h4>
                 <p className="text-white/40 text-sm italic">vip@amaanestate.com</p>
               </div>
            </div>

            <div className="p-10 bg-luxury-charcoal/40 rounded-[2.5rem] border border-white/5 space-y-8">
               <div className="flex gap-6">
                 <div className="w-12 h-12 rounded-xl bg-luxury-gold/10 flex items-center justify-center shrink-0 text-luxury-gold">
                   <MapPin size={24} />
                 </div>
                 <div>
                    <h4 className="text-white font-bold mb-1">Regional Headquarters</h4>
                    <p className="text-white/40 text-sm leading-relaxed">Office Tower 4, Main Street, Jigjiga, Somali Region, Ethiopia</p>
                 </div>
               </div>
               <div className="flex gap-6">
                 <div className="w-12 h-12 rounded-xl bg-luxury-gold/10 flex items-center justify-center shrink-0 text-luxury-gold">
                   <Clock size={24} />
                 </div>
                 <div>
                    <h4 className="text-white font-bold mb-1">Business Hours</h4>
                    <p className="text-white/40 text-sm">Mon - Sat: 8:00 AM - 6:00 PM (EAT)</p>
                 </div>
               </div>
               <div className="flex gap-6 pt-4">
                  <Button variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5 rounded-2xl h-12">
                    <MessageSquare size={18} className="mr-2" /> WhatsApp
                  </Button>
               </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-2xl p-10 md:p-14 rounded-[3.5rem] border border-white/10"
            >
              <h3 className="text-3xl font-display font-bold text-white mb-8 text-center">Direct Inquiry</h3>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Full Name</label>
                    <Input placeholder="Your Name" className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/50" />
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Phone Number</label>
                    <Input placeholder="+251 ..." className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/50" />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Subject</label>
                  <select className="flex h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none appearance-none">
                    <option className="bg-luxury-black">Property Inquiry</option>
                    <option className="bg-luxury-black">Vehicle Sales/Rent</option>
                    <option className="bg-luxury-black">Brokerage Application</option>
                    <option className="bg-luxury-black">Partnership Opportunity</option>
                  </select>
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Message Details</label>
                  <Textarea placeholder="How can our concierge assist you?" className="bg-white/5 border-white/10 min-h-[150px] rounded-xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/50" />
                </div>

                <Button className="w-full bg-luxury-gold text-luxury-black hover:bg-white transition-all h-16 rounded-2xl font-bold text-lg shadow-xl shadow-luxury-gold/20">
                  <Send size={18} className="mr-2" /> Dispatch Inquiry
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
