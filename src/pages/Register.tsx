import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/brand/Logo';
import { parseAuthError } from '@/utils/firebaseErrors';

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
      setError(parseAuthError(err));
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
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  }, [signInWithGoogle, navigate]);

  return (
    <div className="min-h-screen bg-super-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl relative z-10">
        <div className="flex justify-center mb-12">
            <Logo />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-super-charcoal p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Create Account</h1>
            <p className="text-white/40 text-sm font-medium">Join the AmaanEstate marketplace today</p>
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

          <form className="space-y-6" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group md:col-span-2">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C5A059] transition-colors" size={18} />
                <Input 
                  placeholder="Full Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white/5 border-0 h-14 pl-14 rounded-2xl text-white placeholder:text-white/30 focus-visible:ring-[#C5A059]/30 text-base"
                />
              </div>

              <div className="relative group md:col-span-2">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C5A059] transition-colors" size={18} />
                <Input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-0 h-14 pl-14 rounded-2xl text-white placeholder:text-white/30 focus-visible:ring-[#C5A059]/30 text-base"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C5A059] transition-colors" size={18} />
                <Input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-0 h-14 pl-14 rounded-2xl text-white placeholder:text-white/30 focus-visible:ring-[#C5A059]/30 text-base"
                />
              </div>

              <div className="relative group">
                <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C5A059] transition-colors" size={18} />
                <Input 
                  type="password" 
                  placeholder="Confirm Password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-white/5 border-0 h-14 pl-14 rounded-2xl text-white placeholder:text-white/30 focus-visible:ring-[#C5A059]/30 text-base"
                />
              </div>
            </div>

            <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
              <label className="flex items-start gap-3 text-xs text-white/40 cursor-pointer group leading-relaxed">
                <input type="checkbox" required className="mt-1 w-4 h-4 rounded bg-white/10 border-white/10 checked:bg-[#C5A059] accent-[#C5A059]" />
                <span>
                  I agree to the <Link to="/terms" className="text-[#C5A059] hover:underline">Terms</Link> and <Link to="/privacy" className="text-[#C5A059] hover:underline">Privacy Policy</Link>.
                </span>
              </label>
            </div>

            <div className="space-y-4">
              <Button 
                type="submit"
                className="w-full bg-[#C5A059] text-black hover:bg-[#D4AF37] transition-all h-14 rounded-2xl font-bold text-base shadow-xl shadow-[#C5A059]/10"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Account'}
              </Button>

              <Button 
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all h-14 rounded-2xl font-bold text-sm"
                disabled={loading}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-3" alt="Google" />
                Continue with Google
              </Button>
            </div>

            <div className="text-center pt-8 border-t border-white/5">
              <p className="text-white/40 text-xs font-medium">
                Already have an account?{' '}
                <Link to="/auth/login" className="text-white font-bold text-sm hover:text-[#C5A059] transition-colors ml-2">
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
