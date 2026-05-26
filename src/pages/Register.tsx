import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BrandLogo from '@/components/brand/BrandLogo';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleRegister = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }, [email, password, confirmPassword, name, signUp, navigate]);

  const handleGoogleSignIn = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  }, [signInWithGoogle, navigate]);

  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-gold/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-luxury-gold/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="flex justify-center mb-16">
            <Link to="/" className="flex flex-col items-center select-none group">
               <BrandLogo size="lg" layout="stacked" />
            </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glass-card p-10 md:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-luxury-gold/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
          
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display font-bold text-white mb-4 tracking-tighter">Apply for Access</h1>
            <p className="text-white/40 text-sm font-light tracking-wide uppercase">Join the region's most exclusive portfolio</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <form className="space-y-8" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group md:col-span-2">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={20} />
                <Input 
                  placeholder="Full Legal Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white/5 border-0 h-16 pl-16 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/30 text-lg"
                />
              </div>

              <div className="relative group md:col-span-2">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={20} />
                <Input 
                  type="email" 
                  placeholder="Official Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-0 h-16 pl-16 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/30 text-lg"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={20} />
                <Input 
                  type="password" 
                  placeholder="Secure Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-0 h-16 pl-16 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/30 text-lg"
                />
              </div>

              <div className="relative group">
                <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={20} />
                <Input 
                  type="password" 
                  placeholder="Verify Password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-white/5 border-0 h-16 pl-16 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/30 text-lg"
                />
              </div>
            </div>

            <div className="p-8 bg-white/5 border border-white/5 rounded-3xl">
              <label className="flex items-start gap-4 text-xs text-white/40 cursor-pointer group leading-relaxed">
                <input type="checkbox" required className="mt-1 w-5 h-5 rounded-lg bg-white/5 border-white/10 checked:bg-luxury-gold accent-luxury-gold" />
                <span>
                  I acknowledge the <Link to="/terms" className="text-luxury-gold hover:text-white transition-colors underline underline-offset-4 decoration-luxury-gold/20">Terms of Excellence</Link> and <Link to="/privacy" className="text-luxury-gold hover:text-white transition-colors underline underline-offset-4 decoration-luxury-gold/20">Privacy Standards</Link>. High-value transactions may require institutional verification.
                </span>
              </label>
            </div>

            <div className="space-y-4">
              <Button 
                type="submit"
                className="w-full bg-luxury-gold text-luxury-black hover:bg-white transition-all h-20 rounded-[2rem] font-bold text-xl shadow-2xl shadow-luxury-gold/10"
                disabled={loading}
              >
                {loading ? 'Initializing...' : 'Initialize Membership'}
              </Button>

              <Button 
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                className="w-full bg-transparent border-white/10 text-white hover:bg-white/5 transition-all h-20 rounded-[2rem] font-bold text-lg"
                disabled={loading}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 mr-3" alt="Google" />
                Continue with Google
              </Button>
            </div>

            <div className="text-center pt-8 border-t border-white/5">
              <p className="text-white/40 text-xs font-light">
                Already established an account?{' '}
                <Link to="/auth/login" className="text-luxury-gold hover:text-white transition-colors font-bold uppercase tracking-[0.2em] ml-2">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
