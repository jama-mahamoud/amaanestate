import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Lock, Mail, User, UserPlus } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  enterDemoAdminMode,
  getCurrentUserProfile,
  registerPublicUser,
  signInUser,
} from '../services/adminService';
import { Profile } from '../types';
import { useSEO } from '../hooks/useSEO';
import BrandLogo from '../components/layout/BrandLogo';

interface AuthPageProps {
  initialMode?: 'signin' | 'register' | 'forgot';
}

function resolvePostLoginPath(profile: Profile | null): string {
  const roleName = profile?.role?.name;
  if (roleName === 'admin' || roleName === 'editor') {
    return '/admin';
  }
  return '/account';
}

export default function AuthPage({ initialMode = 'signin' }: AuthPageProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>(initialMode);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useSEO({
    title: mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : 'Sign In',
    description: 'Sign in or create a reader account on AMAAN ESTATE.',
    noIndex: true,
  });

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    getCurrentUserProfile().then((prof) => {
      if (prof) {
        navigate(resolvePostLoginPath(prof), { replace: true });
      }
    });
  }, [navigate]);

  const switchMode = (nextMode: 'signin' | 'register' | 'forgot') => {
    setMode(nextMode);
    setError(null);
    setNotice(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    const res = await signInUser(email, password);
    setLoading(false);
    if (res.success && res.profile) {
      navigate(resolvePostLoginPath(res.profile), { replace: true });
    } else {
      setError(res.error || 'Authentication failed.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    const res = await registerPublicUser({ fullName, email, password });
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Unable to create account.');
      return;
    }

    if (res.requiresEmailConfirmation) {
      setNotice(
        `Account created for ${email.trim()}. Please check your inbox to confirm your email address, then sign in.`
      );
      setPassword('');
      setConfirmPassword('');
      setMode('signin');
      return;
    }

    navigate(resolvePostLoginPath(res.profile || null), { replace: true });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim();
    if (!targetEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase authentication is not configured in this environment.');
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `${window.location.origin}/account`,
    });
    setLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setNotice(
        `If ${targetEmail} matches an existing account, a password recovery link has been sent.`
      );
    }
  };

  const handleDemoPreview = () => {
    enterDemoAdminMode();
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#E5E0D8] rounded p-7 sm:p-8 space-y-6">
        <div className="space-y-3 border-b border-[#E5E0D8] pb-5">
          <Link to="/" className="inline-block">
            <BrandLogo variant="auth" />
          </Link>
          <h1 className="text-2xl font-serif font-semibold text-[#141413]">
            {mode === 'register'
              ? 'Create Your Account'
              : mode === 'forgot'
              ? 'Reset Your Password'
              : 'Sign In to AMAAN ESTATE'}
          </h1>
          <p className="text-xs text-[#5C5A55] leading-relaxed">
            {mode === 'register'
              ? 'Register for an AMAAN ESTATE reader account. Editorial and administrative access is granted separately.'
              : mode === 'forgot'
              ? 'Enter your registered email address to receive a Supabase password recovery link.'
              : 'Sign in with your AMAAN ESTATE reader, editor, or administrator account.'}
          </p>
        </div>

        {/* Mode Switcher */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 gap-1.5 bg-[#FAF8F5] p-1 border border-[#E5E0D8] rounded">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`py-2 rounded text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'text-[#5C5A55] hover:text-[#141413]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`py-2 rounded text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'text-[#5C5A55] hover:text-[#141413]'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="auth-email"
                className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55] block"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7770]" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-11 pl-10 pr-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="auth-password"
                  className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55] block"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-xs font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7770]" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-11 pl-10 pr-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                />
              </div>
            </div>

            {error && (
              <div role="alert" className="p-3 rounded bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B]">
                {error}
              </div>
            )}

            {notice && (
              <div role="status" className="p-3 rounded bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#14532D]">
                {notice}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#1E3A5F] hover:bg-[#162C49] disabled:opacity-60 text-white text-sm font-semibold rounded transition-colors cursor-pointer"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* CREATE ACCOUNT FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="reg-name"
                className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55] block"
              >
                Full Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7770]" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full h-11 pl-10 pr-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="reg-email"
                className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55] block"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7770]" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-11 pl-10 pr-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="reg-password"
                className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55] block"
              >
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7770]" />
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full h-11 pl-10 pr-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="reg-confirm-password"
                className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55] block"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7770]" />
                <input
                  id="reg-confirm-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full h-11 pl-10 pr-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                />
              </div>
            </div>

            {error && (
              <div role="alert" className="p-3 rounded bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#1E3A5F] hover:bg-[#162C49] disabled:opacity-60 text-white text-sm font-semibold rounded inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UserPlus size={15} />
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="forgot-email"
                className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55] block"
              >
                Account Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7770]" />
                <input
                  id="forgot-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-11 pl-10 pr-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                />
              </div>
            </div>

            {error && (
              <div role="alert" className="p-3 rounded bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B]">
                {error}
              </div>
            )}

            {notice && (
              <div role="status" className="p-3 rounded bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#14532D]">
                {notice}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#1E3A5F] hover:bg-[#162C49] disabled:opacity-60 text-white text-sm font-semibold rounded inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <KeyRound size={15} />
              <span>{loading ? 'Sending Recovery Link...' : 'Send Recovery Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="w-full py-2 text-xs font-semibold text-[#5C5A55] hover:text-[#141413] inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back to Sign In</span>
            </button>
          </form>
        )}

        {!isSupabaseConfigured && (
          <div className="pt-4 border-t border-[#E5E0D8] space-y-3">
            <p className="text-xs text-[#5C5A55] leading-relaxed">
              <strong className="text-[#141413]">Supabase Credentials Not Configured:</strong> Inspect the editorial workspace in Demonstration Mode:
            </p>
            <button
              type="button"
              onClick={handleDemoPreview}
              className="w-full h-10 bg-[#EFECE6] hover:bg-[#E5E0D8] text-[#141413] text-xs font-semibold rounded transition-colors cursor-pointer"
            >
              Enter Demonstration Workspace
            </button>
          </div>
        )}

        <div className="text-center pt-2 border-t border-[#E5E0D8]">
          <Link to="/" className="text-xs text-[#5C5A55] hover:text-[#141413] underline">
            &larr; Return to AMAAN ESTATE
          </Link>
        </div>
      </div>
    </div>
  );
}
