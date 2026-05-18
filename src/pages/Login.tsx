import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
  };

  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-luxury-gold/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-luxury-gold/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-lg relative z-10">
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

          <form className="space-y-8" onSubmit={handleLogin}>
            <div className="space-y-5">
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={20} />
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Official Email" 
                  required
                  className="bg-white/5 border-white/5 h-16 pl-16 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/30 text-lg border-0"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={20} />
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Private Access Key" 
                  required
                  className="bg-white/5 border-white/5 h-16 pl-16 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-luxury-gold/30 text-lg border-0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
              <label className="flex items-center gap-3 text-white/20 cursor-pointer hover:text-white/40 transition-colors">
                <input type="checkbox" className="w-5 h-5 rounded-lg bg-white/5 border-white/10 checked:bg-luxury-gold accent-luxury-gold" />
                Preserve Session
              </label>
              <Link to="/forgot-password" className="text-luxury-gold/60 hover:text-luxury-gold transition-colors underline underline-offset-4 decoration-luxury-gold/20">
                Inquiry Assistance
              </Link>
            </div>

            <div className="space-y-4">
              <Button 
                type="submit"
                className="w-full bg-luxury-gold text-luxury-black hover:bg-white transition-all h-20 rounded-[2rem] font-bold text-xl shadow-2xl shadow-luxury-gold/10"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In to Excellence'}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/5"></span>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.3em]">
                  <span className="bg-luxury-black px-4 text-white/10">Verification Methods</span>
                </div>
              </div>

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

            <div className="text-center pt-12 border-t border-white/5 mt-8">
              <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-6 leading-relaxed">
                  Are you a high-net-worth individual or enterprise seeking elite management?
                </p>
                <Button asChild variant="outline" className="w-full border-luxury-gold/30 text-luxury-gold hover:bg-luxury-gold hover:text-luxury-black transition-all h-16 rounded-2xl font-bold uppercase tracking-widest text-xs">
                  <Link to="/register">Register New Account</Link>
                </Button>
              </div>
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
