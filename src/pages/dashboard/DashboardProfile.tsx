import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Shield, BadgeCheck, Bell, Save, Mail, Map, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'motion/react';

export default function DashboardProfile() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-display font-medium mb-2 tracking-tight">Identity & <span className="text-white/20">Credentials</span></h1>
          <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em]">Credentials, Badge Verifications & Roles</p>
        </div>
        <Button 
          onClick={handleUpdate}
          disabled={loading}
          className="bg-luxury-gold text-luxury-black hover:bg-white h-16 px-10 rounded-[2rem] font-bold shadow-2xl shadow-luxury-gold/20 transition-all duration-500 hover:-translate-y-1"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin mr-3" />
              Updating...
            </>
          ) : success ? (
            'Authorized Successfully'
          ) : (
            <>
              <Save size={18} className="mr-3" /> Save Credentials
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section className="glass-card p-12 rounded-[3.5rem] relative overflow-hidden bg-white/[0.01]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl rounded-full" />
            <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/10 flex items-center justify-center text-luxury-gold">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-white tracking-tight">Operator Information</h3>
                <p className="text-white/40 text-[9px] uppercase tracking-wider font-extrabold">Public profile identities checked against legal database</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 ml-2">Display Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                  <Input defaultValue={user?.displayName || 'Amaan Estate Partner'} className="bg-white/5 border-0 h-16 pl-12 pr-6 rounded-2xl text-white text-md focus-visible:ring-luxury-gold/30 font-medium" />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 ml-2">Email Endpoint</label>
                <div className="relative border border-white/5 bg-white/[0.01] rounded-2xl h-16 flex items-center px-6">
                  <Mail size={16} className="text-white/20 mr-3" />
                  <span className="text-white/60 font-mono text-sm">{user?.email || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 ml-2">Regional Hub Assigned</label>
                <div className="relative">
                  <Map size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                  <Input defaultValue="Jigjiga HQ" className="bg-white/5 border-0 h-16 pl-12 pr-6 rounded-2xl text-white text-md focus-visible:ring-luxury-gold/30 font-medium" />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 ml-2">Access Established On</label>
                <div className="relative border border-white/5 bg-white/[0.01] rounded-2xl h-16 flex items-center px-6">
                  <Calendar size={16} className="text-white/20 mr-3" />
                  <span className="text-white/60 font-mono text-sm">May 21, 2026</span>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card p-12 rounded-[3.5rem] relative overflow-hidden bg-white/[0.01]">
            <div className="absolute inset-0 bg-white/[0.005]" />
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/10 flex items-center justify-center text-luxury-gold">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-white tracking-tight">Security Matrix</h3>
                <p className="text-white/40 text-[10px] uppercase tracking-wider font-extrabold">Device security parameters & encryption controls</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white mb-0.5">Biometric Handshake Authorization</p>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Requires passkey login across compatible units</p>
              </div>
              <div className="w-12 h-6 bg-luxury-gold/20 rounded-full relative p-1">
                <div className="absolute right-1 top-1 w-4 h-4 bg-luxury-gold rounded-full" />
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

            <p className="text-white/50 text-[11px] leading-relaxed px-4">
              Your profile badge is validated by Amaan Regional Regulators according to title registries and transaction volume thresholds.
            </p>
          </section>

          <section className="p-8 border border-white/5 bg-white/[0.01] rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-3">
              <Bell size={16} className="text-[#C5A059]" />
              <h4 className="text-xs uppercase tracking-widest font-black text-white/80">Alert Configurations</h4>
            </div>
            
            <div className="space-y-4">
              {['Acquisitions', 'Market Valuations', 'Regional Land News'].map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-white/[0.01] p-3 rounded-lg border border-white/[0.03]">
                  <span className="text-[10px] uppercase font-bold text-white/40">{item}</span>
                  <div className="w-2 h-2 rounded-full bg-luxury-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
