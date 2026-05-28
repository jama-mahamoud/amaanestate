import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, RefreshCw, LogOut } from 'lucide-react';
import { useState } from 'react';
import { parseAuthError } from '../../utils/firebaseErrors';
import { auth } from '../../lib/firebase';

export default function ProtectedRoute() {
  const { user, profile, loading, emailVerified, resendVerification, refreshUser, logout } = useAuth();
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Block users who haven't verified their email
  if (!emailVerified) {
    const handleResend = async () => {
      setResending(true);
      setError(null);
      setMessage(null);
      try {
        await resendVerification();
        setMessage('Verification email sent! Please check your inbox and spam folder.');
      } catch (err: any) {
        setError(parseAuthError(err));
      } finally {
        setResending(false);
      }
    };

    const handleCheckVerification = async () => {
      setResending(true);
      setError(null);
      setMessage(null);
      try {
        await refreshUser();
        if (auth.currentUser && !auth.currentUser.emailVerified) {
          setError('Verification link has not been activated. Please check your inbox or request a new link.');
        } else {
          setMessage('Email verified successfully! Loading application...');
        }
      } catch (err: any) {
        setError(parseAuthError(err));
      } finally {
        setResending(false);
      }
    };

    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#111111] border border-white/10 rounded-3xl p-8 md:p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/10 blur-3xl rounded-full" />
          
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <Mail size={32} className="text-[#C5A059]" />
            <div className="absolute top-0 right-0 w-4 h-4 bg-rose-500 rounded-full border-2 border-[#111] animate-pulse" />
          </div>

          <h2 className="text-2xl font-display font-medium text-white mb-4">Verify Your Email</h2>
          <p className="text-white/60 mb-6 text-sm leading-relaxed">
            We sent a verification link to <strong className="text-white">{user.email}</strong>. 
            Please verify your email address to access the dashboard and continue using AmaanEstate.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-left">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium text-left">
              {message}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleCheckVerification}
              disabled={resending}
              className="w-full h-12 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold uppercase tracking-widest text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              I have verified my email
            </button>
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full h-12 bg-white/5 border border-white/10 hover:border-white/30 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {resending ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                'Resend link'
              )}
            </button>
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="w-full h-12 bg-transparent text-white/40 hover:text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
