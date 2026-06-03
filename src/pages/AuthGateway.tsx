import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, Check, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BrandHeader } from '@/components/brand/BrandHeader';
import { parseAuthError } from '@/utils/firebaseErrors';

const BENEFITS = [
  'Apply for jobs',
  'Become an agent or broker',
  'List properties and vehicles',
  'Access agreements and verification services',
  'Save favorites',
  'Manage listings from dashboard'
];

export default function AuthGateway() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        await signUp(email, password, name);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column - Benefits (Desktop) */}
        <div className="hidden lg:block space-y-8">
            <BrandHeader size="xl" />
            <div className="space-y-4">
                <h1 className="text-5xl font-display font-light tracking-tight">Join the AmaanEstate Network</h1>
                <p className="text-white/60 text-lg">Create your account or sign in to access jobs, property management tools, agreements, agent services, and exclusive opportunities.</p>
            </div>
            <ul className="space-y-4">
                {BENEFITS.map(b => (
                    <li key={b} className="flex items-center gap-3 text-white">
                        <div className="bg-[#C5A059]/20 p-1 rounded-full text-[#C5A059]">
                            <Check size={16} />
                        </div>
                        {b}
                    </li>
                ))}
            </ul>
        </div>

        {/* Right Column - Auth Gateway */}
        <motion.div
           initial={{ opacity: 0, x: 50 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5 }}
           className="bg-neutral-900 border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl glass"
        >
            <div className="flex gap-4 mb-8">
                <button 
                    onClick={() => setIsLogin(true)}
                    className={`text-lg font-bold ${isLogin ? 'text-white' : 'text-white/40'}`}
                >
                    Sign In
                </button>
                <button 
                    onClick={() => setIsLogin(false)}
                    className={`text-lg font-bold ${!isLogin ? 'text-white' : 'text-white/40'}`}
                >
                    Create Account
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    {error}
                </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                        <Input 
                            placeholder="Full Name" 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            className="bg-white/5 border-0 h-14 pl-12 rounded-2xl"
                            required
                        />
                    </div>
                )}
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <Input 
                        placeholder="Email Address" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)}
                        className="bg-white/5 border-0 h-14 pl-12 rounded-2xl"
                        required
                    />
                </div>
                {!isLogin && (
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                        <Input 
                            placeholder="Phone Number" 
                            value={phone} 
                            onChange={e => setPhone(e.target.value)}
                            className="bg-white/5 border-0 h-14 pl-12 rounded-2xl"
                            type="tel"
                        />
                    </div>
                )}
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <Input 
                        placeholder="Password" 
                        type="password"
                        value={password} 
                        onChange={e => setPassword(e.target.value)}
                        className="bg-white/5 border-0 h-14 pl-12 rounded-2xl"
                        required
                    />
                </div>
                {!isLogin && (
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                        <Input 
                            placeholder="Confirm Password" 
                            type="password"
                            value={confirmPassword} 
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="bg-white/5 border-0 h-14 pl-12 rounded-2xl"
                            required
                        />
                    </div>
                )}
                
                <Button className="w-full bg-[#C5A059] h-14 rounded-2xl text-black font-bold">
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                </Button>

                <div className="relative text-center py-2 text-white/30 text-sm">Or continue with</div>

                <Button 
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full bg-white/5 border-white/10 h-14 rounded-2xl text-white font-bold"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-3" alt="Google" />
                    Google Account
                </Button>
            </form>
        </motion.div>
      </div>
    </div>
  );
}
