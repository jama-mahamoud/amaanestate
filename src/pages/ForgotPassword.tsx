import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
// Logo removed
import { parseAuthError } from '@/utils/firebaseErrors';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { passwordReset } = useAuth();

  const handleReset = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (passwordReset) {
        await passwordReset(email);
      } else {
        // Fallback or alert
        console.log("Password reset standard dispatch:", email);
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  }, [email, passwordReset]);

  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-luxury-gold/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-luxury-gold/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-lg relative z-10">
        <div className="flex justify-center mb-12">
          <Link to="/" className="flex flex-col items-center select-none gap-4 group">
            <div className="w-[140px] h-[4px]" />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glass-card p-10 md:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
          
          <div className="text-center mb-10">
            <h1 className="text-4xl font-display font-bold text-white mb-3 tracking-tighter">Recover Key</h1>
            <p className="text-white/40 text-xs font-light tracking-wide uppercase">Request reset credentials verification link</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          {submitted ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center mx-auto">
                <CheckCircle className="text-[#C5A059]" size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display text-white">Recovery Link Dispatched</h3>
                <p className="text-white/60 text-sm leading-relaxed max-w-sm mx-auto">
                  A verification and password reset dispatch has been logged and sent to <strong className="text-[#C5A059]">{email}</strong>. Check your spam directory if not found.
                </p>
              </div>
              <Button asChild className="w-full bg-white text-black hover:bg-neutral-200 h-14 rounded-xl font-bold mt-4">
                <Link to="/auth/login">Return to Sign In</Link>
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C5A059] transition-colors" size={18} />
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Official Email Address" 
                  required
                  className="bg-white/5 border-white/5 h-14 pl-14 rounded-xl text-white placeholder:text-white/20 focus-visible:ring-[#C5A059]/30 text-base border-0"
                />
              </div>

              <Button 
                type="submit"
                className="w-full bg-[#C5A059] text-black hover:bg-white transition-all h-14 rounded-xl font-bold text-sm uppercase tracking-wider"
                disabled={loading}
              >
                {loading ? 'Processing Recovery...' : 'Send Recovery Dispatch'}
              </Button>

              <div className="flex justify-center pt-4">
                <Link to="/auth/login" className="text-xs text-[#C5A059] hover:underline flex items-center gap-1">
                  <ArrowLeft size={14} /> Back to standard Sign In
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
