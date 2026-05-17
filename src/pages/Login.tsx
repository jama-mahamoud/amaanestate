import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, User, Mail, Lock, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-luxury-gold/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-luxury-gold/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-lg relative z-10">
        <div className="flex justify-center mb-16">
           <Link to="/" className="text-white hover:text-luxury-gold transition-all">
              <span className="text-xl font-display font-bold tracking-[0.5em] uppercase">AmaanEstate</span>
           </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glass-card p-10 md:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
          
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display font-bold text-white mb-4 tracking-tighter">Sign In</h1>
            <p className="text-white/40 text-sm font-light tracking-wide uppercase">Elite access to regional luxury</p>
          </div>

          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-5">
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={20} />
                <Input 
                  type="email" 
                  placeholder="Official Email" 
                  className="bg-white/5 border-white/5 h-16 pl-16 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/30 text-lg border-0"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={20} />
                <Input 
                  type="password" 
                  placeholder="Private Access Key" 
                  className="bg-white/5 border-white/5 h-16 pl-16 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/30 text-lg border-0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
              <label className="flex items-center gap-3 text-white/20 cursor-pointer hover:text-white/40 transition-colors">
                <input type="checkbox" className="w-5 h-5 rounded-lg bg-white/5 border-white/10 checked:bg-luxury-gold accent-luxury-gold" />
                Preserve Session
              </label>
              <Link to="/forgot-password" size="sm" className="text-luxury-gold/60 hover:text-luxury-gold transition-colors underline underline-offset-4 decoration-luxury-gold/20">
                Inquiry Assistance
              </Link>
            </div>

            <Button 
              className="w-full bg-luxury-gold text-luxury-black hover:bg-white transition-all h-20 rounded-[2rem] font-bold text-xl shadow-2xl shadow-luxury-gold/10"
              disabled={loading}
            >
              Sign In to Excellence
            </Button>

            <div className="text-center pt-8 border-t border-white/5">
              <p className="text-white/40 text-xs font-light">
                New to the platform?{' '}
                <Link to="/register" className="text-luxury-gold hover:text-white transition-colors font-bold uppercase tracking-[0.2em] ml-2">
                  Apply for Access
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
        
        <div className="mt-16 text-center space-y-4">
            <p className="text-white/10 text-[9px] uppercase font-bold tracking-[0.5em]">
              Precision Security Architecture
            </p>
            <div className="flex justify-center gap-4">
               <Link to="/" className="text-white/20 hover:text-white transition-colors text-[9px] uppercase font-bold tracking-widest">Homepage</Link>
               <span className="text-white/5">|</span>
               <Link to="/about" className="text-white/20 hover:text-white transition-colors text-[9px] uppercase font-bold tracking-widest">Our Vision</Link>
            </div>
        </div>
      </div>
    </div>
  );
}
