import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { enterDemoAdminMode, getCurrentAdminProfile, signInAdmin } from '../../services/adminService';
import { useSEO } from '../../hooks/useSEO';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useSEO({
    title: 'Editorial Admin Sign In',
    description: 'Sign in to the AMAAN ESTATE editorial publishing and administration console.',
  });

  useEffect(() => {
    getCurrentAdminProfile().then((prof) => {
      if (prof) navigate('/admin', { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    const res = await signInAdmin(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/admin', { replace: true });
    } else {
      setError(res.error || 'Authentication failed.');
    }
  };

  const handlePasswordRecovery = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      setError('Enter your administrator email address above first.');
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured in this environment.');
      return;
    }
    setSendingReset(true);
    setError(null);
    setNotice(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `${window.location.origin}/admin?section=account`,
    });
    setSendingReset(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setNotice(`If ${targetEmail} matches an account, a Supabase password recovery link has been sent.`);
    }
  };

  const handleDemoPreview = () => {
    enterDemoAdminMode();
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#E5E0D8] rounded p-8 space-y-6">
        <div className="space-y-2 border-b border-[#E5E0D8] pb-5">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
            AMAAN ESTATE
          </p>
          <h1 className="text-2xl font-serif font-semibold text-[#141413]">
            Editorial Administration Sign In
          </h1>
          <p className="text-xs text-[#5C5A55] leading-relaxed">
            Authorized AMAAN ESTATE administrators and editors only. Protected by Supabase Authentication &amp; Row Level Security.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55] block">
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jaamacdeeq11@gmail.com"
              className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55] block">
                Password
              </label>
              {isSupabaseConfigured && (
                <button
                  type="button"
                  disabled={sendingReset}
                  onClick={handlePasswordRecovery}
                  className="text-xs font-semibold text-[#1E3A5F] hover:underline disabled:opacity-50 cursor-pointer"
                >
                  {sendingReset ? 'Sending link...' : 'Forgot password?'}
                </button>
              )}
            </div>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
            />
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
            {loading ? 'Verifying Credentials...' : 'Sign In with Supabase'}
          </button>
        </form>

        {!isSupabaseConfigured && (
          <div className="pt-4 border-t border-[#E5E0D8] space-y-3">
            <p className="text-xs text-[#5C5A55] leading-relaxed">
              <strong className="text-[#141413]">Supabase Credentials Not Configured:</strong> Set <code className="font-mono">VITE_SUPABASE_URL</code> and <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> in <code className="font-mono">.env</code> (see <code className="font-mono">docs/SUPABASE_SETUP.md</code>). Or inspect the full CMS workflows using Demonstration Mode:
            </p>
            <button
              type="button"
              onClick={handleDemoPreview}
              className="w-full h-10 bg-[#EFECE6] hover:bg-[#E5E0D8] text-[#141413] text-xs font-semibold rounded transition-colors cursor-pointer"
            >
              Enter Demonstration Admin Workspace
            </button>
          </div>
        )}

        <div className="text-center pt-2">
          <Link to="/" className="text-xs text-[#5C5A55] hover:text-[#141413] underline">
            &larr; Return to AMAAN ESTATE
          </Link>
        </div>
      </div>
    </div>
  );
}
