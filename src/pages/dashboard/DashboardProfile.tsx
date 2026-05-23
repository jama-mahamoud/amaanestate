import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Shield, BadgeCheck, Bell, Save, Mail, Map, Calendar, Loader2, Building2, Eye, EyeOff, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'motion/react';
import { brokerService } from '@/services/brokerService';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Agency } from '@/types';
import ImageUpload from '@/components/listing/ImageUpload';

export default function DashboardProfile() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Agency Specific State
  const [agency, setAgency] = useState<Agency | null>(null);
  const [agencyName, setAgencyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');
  const [logo, setLogo] = useState('');
  const [visibility, setVisibility] = useState(true);
  const [logoFiles, setLogoFiles] = useState<File[]>([]);

  const isAgencyRole = profile?.role === 'agency';

  useEffect(() => {
    const fetchAgencyData = async () => {
      if (isAgencyRole && user?.uid) {
        setLoading(true);
        try {
          const allAgencies = await brokerService.getAllAgencies();
          const found = allAgencies.find(a => a.ownerId === user.uid);
          if (found) {
            setAgency(found);
            setAgencyName(found.agencyName);
            setEmail(found.email);
            setPhone(found.phone);
            setLicense(found.license);
            setLogo(found.logo);
            setVisibility(found.visibility !== false);
          }
        } catch (error) {
          console.error("Error loading agency details", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchAgencyData();
  }, [isAgencyRole, user?.uid]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      if (isAgencyRole && agency) {
        // Save Agency credentials directly to Firestore agencies record
        const agencyRef = doc(db, 'agencies', agency.id);
        const logoUrlToSave = logoFiles.length > 0 ? "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80" : logo;
        
        await updateDoc(agencyRef, {
          agencyName,
          email,
          phone,
          license,
          logo: logoUrlToSave,
          visibility,
          updatedAt: new Date().toISOString()
        });
        
        setAgency(prev => prev ? {
          ...prev,
          agencyName,
          email,
          phone,
          license,
          logo: logoUrlToSave,
          visibility
        } : null);
        
        // Save update to auth user too
        if (user?.uid) {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            displayName: agencyName
          });
        }
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update credentials:", error);
      alert("Error saving profile details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight">
            {isAgencyRole ? 'Agency Profile & Dashboard 🏢' : 'Operator Credentials'}
          </h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mt-1">
            {isAgencyRole ? 'Corporate Identity, Licensing & Brand Management' : 'Review user roles, badges and profile settings'}
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

      {isAgencyRole && !agency ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-white/60">
          <Loader2 className="animate-spin text-[#C5A059] mx-auto mb-4" size={32} />
          <p className="text-sm">Fetching verified agency corporate metadata...</p>
        </div>
      ) : isAgencyRole && agency ? (
        /* AGENCY SPECIALIZED COMPREHENSIVE CONFIGURATION VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <section className="glass-card p-12 rounded-[3.5rem] relative overflow-hidden bg-white/[0.01]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl rounded-full" />
              <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/10 flex items-center justify-center text-luxury-gold">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-medium text-white tracking-tight">Corporate Branding</h3>
                  <p className="text-white/40 text-[9px] uppercase tracking-wider font-extrabold">Public directories fetch this branding instantly</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 block ml-2 mb-2">Agency Corporate Name</label>
                  <Input 
                    value={agencyName} 
                    onChange={e => setAgencyName(e.target.value)}
                    className="bg-white/5 border-0 h-16 px-6 rounded-2xl text-white text-md focus-visible:ring-luxury-gold/30 font-medium" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 block ml-2 mb-2">Registry Licensing ID</label>
                    <Input 
                      value={license} 
                      onChange={e => setLicense(e.target.value)}
                      className="bg-white/5 border-0 h-16 px-6 rounded-2xl text-white text-md focus-visible:ring-luxury-gold/30 font-medium" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 block ml-2 mb-2">Corporate Office Phone</label>
                    <Input 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)}
                      className="bg-white/5 border-0 h-16 px-6 rounded-2xl text-white text-md focus-visible:ring-luxury-gold/30 font-medium" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 block ml-2 mb-2">Official Communications Email</label>
                  <Input 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="bg-white/5 border-0 h-16 px-6 rounded-2xl text-white text-md focus-visible:ring-luxury-gold/30 font-medium" 
                  />
                </div>

                {/* Logo Editor Section */}
                <div className="pt-4 border-t border-white/5">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 block ml-2 mb-3">Update Corporate Logo</label>
                  <div className="flex items-center gap-6 bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
                    <img src={logo || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&h=120&q=80"} alt="Logo Preview" className="w-16 h-16 rounded-xl object-cover bg-white/10 border border-white/10 shrink-0" />
                    <div className="flex-1">
                      <ImageUpload onImagesChange={setLogoFiles} maxFiles={1} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-10">
            {/* Visibility Settings Panel */}
            <section className="p-8 border border-white/5 bg-white/[0.01] rounded-[2.5rem] space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest font-black text-white/80">Directory Visibility</p>
                {visibility ? (
                  <span className="text-emerald-400 text-[10px] font-bold uppercase">Publicly Listed Online</span>
                ) : (
                  <span className="text-red-400 text-[10px] font-bold uppercase">Hidden / Offline</span>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => setVisibility(!visibility)}
                className={`w-full p-6 border rounded-2xl flex items-center justify-between gap-4 transition-all ${
                  visibility 
                    ? 'bg-[#C5A059]/10 border-[#C5A059]/30 text-white' 
                    : 'bg-red-500/5 border-red-500/20 text-white/50 hover:bg-red-500/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {visibility ? <Eye size={18} className="text-[#C5A059]" /> : <EyeOff size={18} className="text-red-400" />}
                  <span className="text-xs font-bold uppercase tracking-wider block">
                    {visibility ? 'Disseminate Publicly' : 'Suspend Visibility'}
                  </span>
                </div>
                <div className={`w-10 h-6 rounded-full relative p-0.5 transition-colors ${visibility ? 'bg-[#C5A059]' : 'bg-white/10'}`}>
                  <div className={`w-5 h-5 bg-black rounded-full shadow transition-all ${visibility ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </button>
            </section>
          </div>
        </div>
      ) : (
        /* STANDARD PROFILE VIEW FOR ORDINARY USER TIERS */
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
                    <Input defaultValue={user?.displayName || 'Amaan Estate Partner'} className="bg-white/5 border-0 h-16 pl-12 pr-6 rounded-2xl text-white text-md focus-visible:ring-luxury-gold/30 font-medium" />
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
                  <label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30Presentation block ml-2 animate-none">Regional Hub Assigned</label>
                  <div className="relative">
                    <Map size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                    <Input defaultValue="Jigjiga HQ" className="bg-white/5 border-0 h-16 pl-12 pr-6 rounded-2xl text-white text-md focus-visible:ring-[#C5A059]/30 font-medium" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 block ml-2">Access Established On</label>
                  <div className="relative border border-white/5 bg-white/[0.01] rounded-2xl h-16 flex items-center px-6">
                    <Calendar size={16} className="text-white/20 mr-3" />
                    <span className="text-white/60 font-mono text-sm">May 21, 2026</span>
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
      )}
    </div>
  );
}
