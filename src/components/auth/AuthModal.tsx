import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, X, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseAuthError } from '@/utils/firebaseErrors';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title = "Authentication Required", 
  subtitle = "Please log in or register your account to access verified platform features." 
}: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success("Successfully logged in!");
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await signUp(email, password, name);
        toast.success("Account created successfully!");
      }
      onClose();
      if (onSuccess) onSuccess();
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
      toast.success("Successfully signed in with Google!");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal content widget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#0e0e0e] border border-white/10 rounded-[2rem] p-6 sm:p-10 shadow-2xl overflow-y-auto max-h-[90vh] z-10"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all"
          >
            <X size={15} />
          </button>

          {/* Title Area */}
          <div className="mb-6">
            <span className="text-[10px] text-[#C5A059] uppercase tracking-[0.2em] font-extrabold block mb-1">AmaanEstate Member Space</span>
            <h3 className="text-xl sm:text-2xl font-display font-light text-white tracking-tight leading-tight">
              {title}
            </h3>
            <p className="text-xs text-white/50 mt-1 max-w-sm">
              {subtitle}
            </p>
          </div>

          {/* Switcher Tab */}
          <div className="flex border-b border-white/5 mb-6">
            <button 
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`pb-3 text-xs uppercase tracking-widest font-extrabold transition-all border-b-2 mr-6 ${
                isLogin ? 'border-[#C5A059] text-white' : 'border-transparent text-white/40'
              }`}
            >
              Sign In
            </button>
            <button 
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`pb-3 text-xs uppercase tracking-widest font-extrabold transition-all border-b-2 ${
                !isLogin ? 'border-[#C5A059] text-white' : 'border-transparent text-white/40'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              {error}
            </div>
          )}

          {/* Google Quick Sign-In */}
          <div className="mb-5">
            <Button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 h-11 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
              <span>Continue with Google</span>
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-5 text-[10px] text-white/20 uppercase tracking-widest font-mono">
            <div className="h-px bg-white/10 flex-1" />
            <span>or email gateway</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Form Content */}
          <form onSubmit={handleAuth} className="space-y-3.5">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                <Input 
                  placeholder="Full Name" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="bg-white/5 border-white/5 h-11 pl-10 rounded-xl text-xs focus:ring-[#C5A059]/30"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
              <Input 
                placeholder="Email Address" 
                type="email"
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="bg-white/5 border-white/5 h-11 pl-10 rounded-xl text-xs focus:ring-[#C5A059]/30"
                required
              />
            </div>

            {!isLogin && (
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                <Input 
                  placeholder="Phone Number" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  className="bg-[#121212] border-white/5 h-11 pl-10 rounded-xl text-xs focus:ring-[#C5A059]/30"
                  type="tel"
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
              <Input 
                placeholder="Password" 
                type="password"
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="bg-[#121212] border-white/5 h-11 pl-10 rounded-xl text-xs focus:ring-[#C5A059]/30"
                required
              />
            </div>

            {!isLogin && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                <Input 
                  placeholder="Confirm Password" 
                  type="password"
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="bg-[#121212] border-white/5 h-11 pl-10 rounded-xl text-xs focus:ring-[#C5A059]/30"
                  required
                />
              </div>
            )}

            {isLogin && (
              <div className="text-right">
                <a 
                  href="/auth/forgot-password" 
                  className="text-[10px] text-[#C5A059] hover:underline uppercase font-bold"
                >
                  Forgot Password?
                </a>
              </div>
            )}

            <Button 
              disabled={loading}
              className="w-full bg-[#C5A059] hover:bg-[#C5A059]/90 text-black h-11 rounded-xl text-xs font-bold uppercase tracking-widest transition-all mt-4"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
