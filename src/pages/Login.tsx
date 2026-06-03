import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BrandHeader } from '@/components/brand/BrandHeader';

import { parseAuthError } from '@/utils/firebaseErrors';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  }, [email, password, signIn, navigate]);

  const handleGoogleSignIn = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  }, [signInWithGoogle, navigate]);

  return (
    <div className="min-h-screen bg-super-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg relative z-10">
        <div className="flex justify-center mb-12">
          <BrandHeader size="lg" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-super-charcoal p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Sign In</h1>
            <p className="text-white/40 text-sm font-medium">Access your account</p>
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
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C5A059] transition-colors" size={18} />
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address" 
                  required
                  className="bg-white/5 border-0 h-14 pl-14 rounded-2xl text-white placeholder:text-white/30 focus-visible:ring-[#C5A059]/30 text-base"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C5A059] transition-colors" size={18} />
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" 
                  required
                  className="bg-white/5 border-0 h-14 pl-14 rounded-2xl text-white placeholder:text-white/30 focus-visible:ring-[#C5A059]/30 text-base"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <label className="flex items-center gap-2 text-white/40 cursor-pointer hover:text-white transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded-lg bg-white/5 border-white/10 checked:bg-[#C5A059] accent-[#C5A059]" />
                Remember me
              </label>
              <Link to="/auth/forgot-password" className="text-[#C5A059] hover:text-[#D4AF37] transition-colors">
                Forgot password?
              </Link>
            </div>

            <div className="space-y-4">
              <Button 
                type="submit"
                className="w-full bg-[#C5A059] text-black hover:bg-[#D4AF37] transition-all h-14 rounded-2xl font-bold text-base shadow-xl shadow-[#C5A059]/10"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/5"></span>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em] text-white/25">
                  <span className="bg-super-charcoal px-4">Or continue with</span>
                </div>
              </div>

              <Button 
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all h-14 rounded-2xl font-bold text-sm"
                disabled={loading}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-3" alt="Google" />
                Google Account
              </Button>
            </div>

            <div className="text-center pt-8 border-t border-white/5 mt-6">
              <p className="text-white/40 text-xs font-medium mb-4">
                Don't have an account yet?
              </p>
              <Link to="/auth/register" className="text-white font-bold text-sm hover:text-[#C5A059] transition-colors">
                Create a New Account
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
