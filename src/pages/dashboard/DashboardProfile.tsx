import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, BadgeCheck, Save, Mail, Map, FileText, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { userService } from '@/services/userService';

export default function DashboardProfile() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // User Specific State
  const [userDisplayName, setUserDisplayName] = useState(profile?.displayName || '');
  const [userPhone, setUserPhone] = useState(profile?.phone || '');
  const [userCity, setUserCity] = useState(profile?.city || '');
  const [userBio, setUserBio] = useState(profile?.bio || '');

  const handleUpdate = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.uid) {
        await userService.updateUser(user.uid, {
          displayName: userDisplayName,
          phone: userPhone,
          city: userCity,
          bio: userBio
        });
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Error saving profile details.");
    } finally {
      setLoading(false);
    }
  }, [userDisplayName, userCity, userBio, userPhone, user?.uid]);

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight">
            Operator Credentials
          </h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mt-1">
            Review user roles, badges and profile settings
          </p>
        </div>
        <Button 
          onClick={handleUpdate}
          disabled={loading}
          className="bg-luxury-gold text-luxury-black hover:bg-white h-16 px-10 rounded-[2rem] font-bold shadow-2xl shadow-luxury-gold/20 transition-all duration-500 hover:-translate-y-1"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin mr-3" />
              Updating Registry...
            </>
          ) : success ? (
            <>
              <Check size={18} className="mr-3 text-emerald-600" /> Complete & Saved
            </>
          ) : (
            <>
              <Save size={18} className="mr-3" /> Save Credentials
            </>
          )}
        </Button>
      </div>

      {/* STANDARD PROFILE VIEW FOR ORDINARY USER TIERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section className="glass-card p-12 rounded-[3.5rem] relative overflow-hidden bg-white/[0.01]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl rounded-full" />
            <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/10 flex items-center justify-center text-luxury-gold">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-display font-medium text-white tracking-tight">Operator Information</h3>
                <p className="text-white/40 text-[9px] uppercase tracking-wider font-extrabold font-sans">Public profile identities checked against legal database</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 block ml-2">Display Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                  <Input value={userDisplayName} onChange={e => setUserDisplayName(e.target.value)} className="bg-white/5 border-0 h-16 pl-12 pr-6 rounded-2xl text-white text-md focus-visible:ring-luxury-gold/30 font-medium" />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 block ml-2">Email Endpoint</label>
                <div className="relative border border-white/5 bg-white/[0.01] rounded-2xl h-16 flex items-center px-6">
                  <Mail size={16} className="text-white/20 mr-3" />
                  <span className="text-white/60 font-mono text-sm">{user?.email || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 block ml-2">Regional Hub Assigned</label>
                <div className="relative">
                  <Map size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                  <Input value={userCity} onChange={e => setUserCity(e.target.value)} className="bg-white/5 border-0 h-16 pl-12 pr-6 rounded-2xl text-white text-md focus-visible:ring-[#C5A059]/30 font-medium" />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 block ml-2">Phone Number</label>
                <div className="relative">
                  <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                  <Input value={userPhone} onChange={e => setUserPhone(e.target.value)} className="bg-white/5 border-0 h-16 pl-12 pr-6 rounded-2xl text-white text-md focus-visible:ring-luxury-gold/30 font-medium" />
                </div>
              </div>

              <div className="space-y-2.5 md:col-span-2">
                <label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 block ml-2">Bio / About Me</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-5 top-6 text-white/20" />
                  <textarea 
                    value={userBio} 
                    onChange={e => setUserBio(e.target.value)}
                    className="w-full bg-white/5 border-0 min-h-[120px] pl-12 pr-6 pt-5 rounded-2xl text-white text-md focus-visible:ring-luxury-gold/30 font-medium text-left" 
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <section className="p-8 border border-white/5 bg-white/[0.01] rounded-[2.5rem] text-center space-y-6 relative overflow-hidden group hover:border-[#C5A059]/40 transition-all duration-700">
            <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl rounded-full" />
            <div className="w-20 h-20 bg-luxury-gold/10 border border-luxury-gold/20 rounded-full flex items-center justify-center mx-auto text-luxury-gold group-hover:scale-105 transition-transform duration-500">
              <BadgeCheck size={36} />
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-display font-medium text-white group-hover:text-luxury-gold transition-colors">Verified Partner Badge</h4>
              <p className="text-[10px] text-[#C5A059] uppercase font-black tracking-widest">Rank: {profile?.role?.replace('_', ' ')?.toUpperCase() || 'REGISTERED'}</p>
            </div>

            <p className="text-white/50 text-[11px] leading-relaxed px-4 font-light">
              Your profile is verified by Amaan Regional Regulators according to title registries and transaction volume thresholds.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
