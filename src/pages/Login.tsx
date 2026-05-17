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
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-white/40 hover:text-luxury-gold transition-colors mb-12 uppercase tracking-widest text-xs font-bold"
        >
          <ArrowLeft size={14} /> Back to Homepage
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-luxury-charcoal/50 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] border border-white/10 shadow-2xl"
        >
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-luxury-gold/10 flex items-center justify-center rounded-3xl mx-auto mb-6 text-luxury-gold shadow-lg shadow-luxury-gold/5">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/40 text-sm">Access your AmaanEstate elite dashboard</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-luxury-gold transition-colors" size={18} />
                <Input 
                  type="email" 
                  placeholder="Email Address" 
                  className="bg-white/5 border-white/10 h-14 pl-12 rounded-xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/50"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-luxury-gold transition-colors" size={18} />
                <Input 
                  type="password" 
                  placeholder="Password" 
                  className="bg-white/5 border-white/10 h-14 pl-12 rounded-xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
              <label className="flex items-center gap-2 text-white/40 cursor-pointer hover:text-white transition-colors">
                <input type="checkbox" className="rounded bg-white/5 border-white/10 checked:bg-luxury-gold" />
                Remember Me
              </label>
              <Link to="/forgot-password" size="sm" className="text-luxury-gold hover:text-white transition-colors underline underline-offset-4">
                Forgot Password?
              </Link>
            </div>

            <Button 
              className="w-full bg-luxury-gold text-luxury-black hover:bg-white transition-all h-16 rounded-2xl font-bold text-lg shadow-xl shadow-luxury-gold/20"
              disabled={loading}
            >
              Sign In to Excellence
            </Button>

            <div className="text-center pt-6">
              <p className="text-white/40 text-sm">
                Don't have an elite account?{' '}
                <Link to="/register" className="text-luxury-gold hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px]">
                  Join AmaanEstate
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
        
        <div className="mt-12 text-center">
            <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.4em]">
              Secure Authentication Protocol
            </p>
        </div>
      </div>
    </div>
  );
}
