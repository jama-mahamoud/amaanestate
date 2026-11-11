import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, ShieldCheck, User } from 'lucide-react';
import {
  getCurrentUserProfile,
  signOutUser,
  updateOwnPassword,
  updateOwnProfile,
} from '../services/adminService';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { useSEO } from '../hooks/useSEO';
import { toast } from 'sonner';

export default function AccountPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useSEO({
    title: 'My Account',
    description: 'Manage your AMAAN ESTATE account profile and password.',
    noIndex: true,
  });

  useEffect(() => {
    let active = true;
    async function load() {
      const prof = await getCurrentUserProfile();
      if (!active) return;
      if (!prof) {
        navigate('/login', { replace: true });
        return;
      }
      setProfile(prof);
      setFullName(prof.full_name || '');
      setBio(prof.bio || '');
      setLoading(false);
    }
    load();

    const sub = supabase?.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login', { replace: true });
      }
    });

    return () => {
      active = false;
      sub?.data.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full name is required.');
      return;
    }
    setSavingProfile(true);
    const res = await updateOwnProfile({
      full_name: fullName,
      bio: bio || null,
      avatar_url: profile?.avatar_url || null,
    });
    setSavingProfile(false);
    if (res.success) {
      toast.success('Profile updated.');
      const updated = await getCurrentUserProfile();
      if (updated) setProfile(updated);
    } else {
      toast.error(res.error || 'Unable to update profile.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setSavingPassword(true);
    const res = await updateOwnPassword(newPassword);
    setSavingPassword(false);
    if (res.success) {
      toast.success('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(res.error || 'Could not update password.');
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    toast.success('Signed out.');
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-[#5C5A55]">
        Loading your account...
      </div>
    );
  }

  const roleName = profile?.role?.name || 'reader';
  const canOpenCms = roleName === 'admin' || roleName === 'editor';
  const roleLabel =
    roleName === 'admin'
      ? 'Administrator'
      : roleName === 'editor'
      ? 'Editorial Staff'
      : 'Member Account';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="bg-white border border-[#E5E0D8] rounded p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#1E3A5F] shrink-0">
            <User size={22} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
              {roleLabel}
            </p>
            <h1 className="text-2xl font-serif font-semibold text-[#141413]">
              {profile?.full_name || profile?.email}
            </h1>
            <p className="text-xs font-mono text-[#5C5A55]">{profile?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canOpenCms && (
            <Link
              to="/admin"
              className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5"
            >
              <LayoutDashboard size={14} />
              <span>Open Editorial CMS</span>
            </Link>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="px-4 py-2 bg-[#EFECE6] hover:bg-[#E5E0D8] text-[#141413] text-xs font-semibold rounded inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="bg-white border border-[#E5E0D8] rounded p-6 space-y-4">
        <h2 className="text-lg font-serif font-semibold text-[#141413]">Profile Information</h2>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5C5A55] block">Full Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5C5A55] block">Short Bio / Interests (Optional)</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Your interests in real estate investment, architecture, or urban development..."
            className="w-full p-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={savingProfile}
          className="px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
        >
          {savingProfile ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <form onSubmit={handleUpdatePassword} className="bg-white border border-[#E5E0D8] rounded p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={17} className="text-[#8C4A27]" />
          <h2 className="text-lg font-serif font-semibold text-[#141413]">Security &amp; Password</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5C5A55] block">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5C5A55] block">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingPassword}
          className="px-5 py-2.5 bg-[#8C4A27] hover:bg-[#733B1E] text-white text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
        >
          {savingPassword ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
