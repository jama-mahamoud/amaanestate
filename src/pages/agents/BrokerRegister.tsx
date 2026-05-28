import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, Upload, ChevronRight, Lock, CheckCircle2, Building2, 
  MapPin, Phone, Award, HelpCircle, ArrowLeft, FileSignature, Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import ImageUpload from '@/components/listing/ImageUpload';
import { toast } from 'sonner';

export default function BrokerRegister() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    agencyName: '',
    licenseNumber: '',
    phone: '',
    whatsapp: '',
    email: user?.email || '',
    region: 'Somali Region',
    city: 'Jigjiga',
    officeAddress: '',
    yearsInBusiness: '',
    aboutAgency: '',
    agencySpecialization: 'Residential Sales, Land plots, Commercial',
    languagesSpoken: 'Somali, English',
    agreement: false
  });

  const [tradeLicenseFiles, setTradeLicenseFiles] = useState<File[]>([]);
  const [companyLogoFiles, setCompanyLogoFiles] = useState<File[]>([]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-[#C5A059]/10 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-t-[#C5A059] border-r-transparent border-b-transparent border-l-transparent animate-spin duration-1000" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 text-white relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C5A059]/[0.02] blur-[120px] rounded-full pointer-events-none"></div>
        <div className="glass-card p-10 md:p-12 rounded-[2.5rem] border border-white/5 text-center max-w-xl shadow-2xl bg-white/[0.01]/80 backdrop-blur-3xl relative z-10 animate-fade">
          <div className="w-16 h-16 bg-[#C5A059]/10 border border-[#C5A059]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-[#C5A059]" />
          </div>
          <h2 className="text-3xl font-display font-medium mb-3 tracking-tight">Onboarding Authenticated Account Key Required</h2>
          <p className="text-white/50 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
            Please log in or register an AmaanEstate account to submit company trade certificates and secure a certified Broker registry badge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-[#C5A059] text-black hover:bg-white rounded-xl h-11 px-8 font-semibold transition-all">
              <Link to="/login?redirect=/broker-register">Sign In & Begin</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-xl h-11 px-8 transition-all">
              <Link to="/agents/apply">Back to Roles</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center px-4 relative text-white font-sans overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.02),transparent)] pointer-events-none"></div>
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
          <CheckCircle2 size={40} className="text-emerald-400" />
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white mb-3">Brokerage License Synced</h2>
        <p className="text-white/50 text-sm max-w-md mx-auto mb-10 leading-relaxed font-light">
          Congratulations! Your profile has been upgraded to **Agency Owner / Broker**. Your corporate account status is active, and your double-allocation compliance lookup registry token is locked in our ledger database.
        </p>
        <Button onClick={() => navigate('/dashboard')} className="bg-[#C5A059] text-black hover:bg-white transition-all h-12 px-8 rounded-xl font-bold uppercase tracking-wider text-[11px] shadow-lg shadow-[#C5A059]/10">
          Open Brokerage Console
        </Button>
      </div>
    );
  }

  const handleNextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.agreement) {
      toast.error("Please review and check the regulatory authorization agreement to complete submission.");
      return;
    }

    setLoading(true);
    try {
      // 1. Save brokerage credentials to 'brokers' collection under 'agency' type
      const brokerId = `broker_${user.uid}`;
      const brokerRef = doc(db, 'brokers', brokerId);

      await setDoc(brokerRef, {
        id: brokerId,
        userId: user.uid,
        type: 'agency',
        fullName: formData.fullName,
        companyName: formData.agencyName,
        phone: formData.phone,
        whatsapp: formData.whatsapp || formData.phone,
        email: formData.email,
        region: formData.region,
        city: formData.city,
        officeAddress: formData.officeAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'approved',
        isVerified: true,
        businessLicenseNumber: formData.licenseNumber,
        yearsOfExperience: Number(formData.yearsInBusiness) || 0,
        propertySpecialization: formData.agencySpecialization.split(',').map(s => s.trim()).filter(Boolean),
        languagesSpoken: formData.languagesSpoken.split(',').map(s => s.trim()).filter(Boolean),
        profilePhotoUrl: "https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=300&q=80",
        rating: 5.0,
        completedDeals: 0,
        about: formData.aboutAgency
      });

      // Also create matching records in 'agencies' collection for backward compatibility lookups
      const agencyRef = doc(db, 'agencies', brokerId);
      await setDoc(agencyRef, {
        id: brokerId,
        ownerId: user.uid,
        agencyName: formData.agencyName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        createdAt: new Date().toISOString(),
        status: 'approved',
        isVerified: true,
        license: formData.licenseNumber,
        logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80"
      });

      // 2. Set user role to 'broker' in 'users' collection
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        role: 'broker',
        phone: formData.phone,
        city: formData.city,
        updatedAt: serverTimestamp()
      });

      toast.success("Brokerage account registered and synced!");
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      toast.error("Ledger storage failure. Please check inputs and retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#050505] text-white px-4 md:px-8 relative overflow-hidden font-sans selection:bg-[#C5A059]/20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-[#C5A059]/[0.02] via-transparent to-transparent pointer-events-none rounded-b-[4rem]"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column Info */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            <Link 
              to="/agents/apply" 
              className="inline-flex items-center gap-2 text-white/40 hover:text-[#C5A059] text-[11px] font-bold uppercase tracking-wider transition-colors duration-300"
            >
              <ArrowLeft size={14} />
              <span>Back to Role Selection</span>
            </Link>

            <div>
              <div className="inline-flex items-center gap-2 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                <ShieldCheck size={14} />
                <span>Brokerage Office Roster</span>
              </div>
              <h1 className="text-3xl md:text-4.5xl font-display font-medium tracking-tight text-white mb-4 leading-tight">
                Broker & Agency Registration
              </h1>
              <p className="text-white/50 text-sm leading-relaxed max-w-md font-light">
                Upgrade your operator status to Principal Broker/Agency Owner, unlocking multi-agent association parameters, legal corporate banners, and double-allocation risk audit clearance.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01]/50 space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
                <Award size={14} className="text-[#C5A059]" />
                <span>Enterprise Privileges</span>
              </h4>
              <ul className="space-y-3">
                {[
                  { title: "Licensed Corporate Listing Badge", desc: "List multi-partner residential packages and large land plots." },
                  { title: "Anti-Deed Boundary Audits Check", desc: "Show customers your safe registration matching ministerial records." },
                  { title: "Office Location Verification Pin", desc: "Add physical maps lookup coordinates to increase user visits." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} className="text-[#C5A059]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/80">{item.title}</p>
                      <p className="text-[10px] text-white/40 leading-normal mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Multi-step register */}
          <div className="lg:col-span-8">
            {/* Stepper Progress bar */}
            <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-[#C5A059] uppercase tracking-widest">Broker Onboarding</span>
                <span className="h-4 w-px bg-white/10 hidden md:block"></span>
                <span className="text-xs text-white/40">Step {step} of 3</span>
              </div>
              
              <div className="flex items-center gap-1.5 h-1.5 w-full md:max-w-xs bg-white/5 rounded-full overflow-hidden">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s} 
                    className={`h-full transition-all duration-500 rounded-full flex-1 ${
                      step >= s ? 'bg-[#C5A059]' : 'bg-white/10'
                    }`} 
                  />
                ))}
              </div>

              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
                <span className={step === 1 ? 'text-[#C5A059]' : ''}>1. Corporate</span>
                <span className={step === 2 ? 'text-[#C5A059]' : ''}>2. License Specs</span>
                <span className={step === 3 ? 'text-[#C5A059]' : ''}>3. Compliance</span>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/5 bg-[#0a0a0a]/90 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#C5A059]/40 to-transparent"></div>

              <form onSubmit={handleNextSubmit} className="p-6 sm:p-10 space-y-8">
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-4">
                      <span className="text-[9px] uppercase tracking-widest font-black text-[#C5A059]">Step 01 / 03</span>
                      <h3 className="text-lg font-display font-medium text-white mt-0.5">Corporate Banner Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059] block">Corporate Company / Agency Banner</label>
                        <Input 
                          required 
                          value={formData.agencyName} 
                          onChange={e => setFormData({...formData, agencyName: e.target.value})}
                          placeholder="e.g., Somali Lands Development Ltd"
                          className="bg-white/[0.02] border-white/5 h-12 rounded-xl text-white focus-visible:ring-1 focus-visible:ring-[#C5A059]/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">Principal Broker Full Name</label>
                        <Input 
                          required 
                          value={formData.fullName} 
                          onChange={e => setFormData({...formData, fullName: e.target.value})}
                          placeholder="e.g., Mahdi Omar"
                          className="bg-white/[0.02] border-white/5 h-12 rounded-xl text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">Corporate Email Address</label>
                        <Input 
                          required 
                          type="email" 
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          placeholder="e.g., contact@amaanestate.com"
                          className="bg-white/[0.02] border-white/5 h-12 rounded-xl text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">Brokerage Contact Telephone</label>
                        <Input 
                          required 
                          value={formData.phone} 
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          placeholder="e.g., +252 61 XXXXXXX"
                          className="bg-white/[0.02] border-white/5 h-12 rounded-xl text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">City of Principal Office</label>
                        <Input 
                          required 
                          value={formData.city} 
                          onChange={e => setFormData({...formData, city: e.target.value})}
                          placeholder="e.g., Jigjiga"
                          className="bg-white/[0.02] border-white/5 h-12 rounded-xl text-white"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">Physical Office Address</label>
                        <Input 
                          required 
                          value={formData.officeAddress} 
                          onChange={e => setFormData({...formData, officeAddress: e.target.value})}
                          placeholder="Commercial Towers, Block B, Floor 2, Jigjiga"
                          className="bg-white/[0.02] border-white/5 h-12 rounded-xl text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-4">
                      <span className="text-[9px] uppercase tracking-widest font-black text-[#C5A059]">Step 02 / 03</span>
                      <h3 className="text-lg font-display font-medium text-white mt-0.5">Government License & Credentials</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">Trade Registration / License Number</label>
                        <Input 
                          required 
                          value={formData.licenseNumber} 
                          onChange={e => setFormData({...formData, licenseNumber: e.target.value})}
                          placeholder="e.g., SL-BRK-28190-M"
                          className="bg-white/[0.02] border-white/5 h-12 rounded-xl text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">Years in Real Estate Operation</label>
                        <Input 
                          type="number" 
                          required 
                          value={formData.yearsInBusiness} 
                          onChange={e => setFormData({...formData, yearsInBusiness: e.target.value})}
                          placeholder="e.g., 5"
                          className="bg-white/[0.02] border-white/5 h-12 rounded-xl text-white"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">Brokerage Focus & Bio</label>
                        <Textarea 
                          required 
                          value={formData.aboutAgency} 
                          onChange={e => setFormData({...formData, aboutAgency: e.target.value})}
                          placeholder="Briefly state your agency history, team size, and commercial property success rates."
                          rows={4}
                          className="bg-white/[0.02] border-white/5 rounded-xl text-white focus-visible:ring-1 focus-visible:ring-[#C5A059]/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-5 pt-4 border-t border-white/5">
                      <h4 className="text-[11px] uppercase font-bold tracking-widest text-[#C5A059] flex items-center gap-2">
                        <Upload size={13} />
                        <span>Corporate Verification Attachments (Optional)</span>
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/[0.01] border border-white/5 p-5 rounded-xl space-y-3">
                          <div>
                            <span className="text-xs font-semibold text-white/80 block">Trade Registry / Business License Document</span>
                            <span className="text-[10px] text-white/40 block mt-0.5">Scanned PDF or High Quality JPG of trade authorization papers.</span>
                          </div>
                          <ImageUpload onImagesChange={setTradeLicenseFiles} maxFiles={1} />
                        </div>

                        <div className="bg-white/[0.01] border border-white/5 p-5 rounded-xl space-y-3">
                          <div>
                            <span className="text-xs font-semibold text-white/80 block">Official Corporate Logo</span>
                            <span className="text-[10px] text-white/40 block mt-0.5">Displays as watermark and branding header on listings.</span>
                          </div>
                          <ImageUpload onImagesChange={setCompanyLogoFiles} maxFiles={1} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-4">
                      <span className="text-[9px] uppercase tracking-widest font-black text-[#C5A059]">Step 03 / 03</span>
                      <h3 className="text-lg font-display font-medium text-white mt-0.5">Regulatory Oath & Mandate</h3>
                    </div>

                    <div className="p-6 rounded-2xl border border-[#C5A059]/20 bg-[#C5A059]/5 space-y-4">
                      <div className="flex gap-3">
                        <FileSignature size={20} className="text-[#C5A059] shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-sm font-semibold text-white">Double-Allocation Prevention Guarantee</h5>
                          <p className="text-[11px] text-white/60 leading-relaxed mt-1">
                            By registering as an active Broker, you guarantee under regional commerce laws that all listed deeds have verified roots, active parcel allocations, and distinct serial coordinates with the regional registry.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex items-start gap-4">
                      <div className="flex items-center h-5">
                        <input 
                          type="checkbox" 
                          id="chk-agreeterm" 
                          checked={formData.agreement}
                          onChange={e => setFormData({...formData, agreement: e.target.checked})}
                          className="h-5 w-5 rounded bg-white/5 border-white/10 text-[#C5A059] focus:ring-0 checked:bg-[#C5A059]"
                        />
                      </div>
                      <label htmlFor="chk-agreeterm" className="text-white/50 text-xs leading-relaxed select-none cursor-pointer">
                        I hereby declare under penalty of corporate de-registration that all information, files, and trade licenses submitted are correct. I authorize the AmaanEstate compliance board to proceed with listing updates.
                      </label>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="pt-6 border-t border-white/5 flex gap-4 justify-between">
                  {step > 1 ? (
                    <Button 
                      type="button" 
                      onClick={() => {
                        setStep(step - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} 
                      variant="outline" 
                      className="border-white/10 text-white hover:bg-white/5 h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                    >
                      Retrieve Previous
                    </Button>
                  ) : (
                    <div />
                  )}
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#C5A059] text-black hover:bg-white hover:shadow-xl hover:shadow-[#C5A059]/10 transition-all h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                        Syncing Ledger...
                      </span>
                    ) : step < 3 ? (
                      <span className="flex items-center gap-1.5">
                        Continue Audit
                        <ChevronRight size={14} />
                      </span>
                    ) : (
                      'Authorize & Update My Profile'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
