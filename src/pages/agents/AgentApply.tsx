import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Upload, ChevronRight, Scale, AlertCircle, FileText, CheckCircle2, User, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { brokerService } from '@/services/brokerService';
import ImageUpload from '@/components/listing/ImageUpload';

export default function AgentApply() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applyType, setApplyType] = useState<'individual' | 'agency'>('individual');

  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    phone: '',
    whatsapp: '',
    email: user?.email || '',
    region: 'Jigjiga HQ',
    city: 'Jigjiga',
    officeAddress: '',

    // Broker Specific
    yearsOfExperience: '',
    areasOfOperation: '',
    propertySpecialization: '',
    languagesSpoken: 'Somali, English',

    // Agency Specific
    agencyName: '',

    agreement: false
  });

  const [governmentIdFiles, setGovernmentIdFiles] = useState<File[]>([]);
  const [businessLicenseFiles, setBusinessLicenseFiles] = useState<File[]>([]);
  const [brokerCertificateFiles, setBrokerCertificateFiles] = useState<File[]>([]);
  const [profilePhotoFiles, setProfilePhotoFiles] = useState<File[]>([]);
  const [companyLogoFiles, setCompanyLogoFiles] = useState<File[]>([]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center text-white">
        <div className="w-8 h-8 rounded-full border-2 border-[#C5A059] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4 text-white">
        <div className="glass-card p-12 rounded-[2rem] border border-white/10 text-center max-w-xl shadow-2xl">
          <ShieldCheck className="w-16 h-16 text-[#C5A059] mx-auto mb-6" />
          <h2 className="text-3xl font-display font-semibold mb-4">Verification Required</h2>
          <p className="text-white/60 mb-8 max-w-sm mx-auto">
            Please log in or sign up with an authenticated account to start your background verification and apply as a certified agent/agency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-[#C5A059] text-black">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5">
              <Link to="/">Back Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-luxury-black flex flex-col items-center justify-center text-center px-4 relative text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.02),transparent)] pointer-events-none"></div>
        <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 size={48} className="text-emerald-400" />
        </div>
        <h2 className="text-4xl font-display font-bold text-white mb-4">Application Submitted</h2>
        <p className="text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
          Your credentials and legal background records have been submitted to the AmaanEstate compliance desk. Proofing and ID audits take 2-4 business days.
        </p>
        <Button onClick={() => navigate('/dashboard')} className="bg-[#C5A059] text-black hover:bg-white transition-colors h-12 px-8 rounded-xl font-bold uppercase tracking-wider text-xs">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (!formData.agreement) {
      alert("Please check and accept the verification agreement to complete application.");
      return;
    }

    setLoading(true);
    try {
      if (applyType === 'individual') {
        await brokerService.applyForBroker(user!.uid, {
          type: 'individual',
          fullName: formData.fullName,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          email: formData.email,
          region: formData.region,
          city: formData.city,
          officeAddress: formData.officeAddress,
          
          governmentIdUrl: governmentIdFiles.length > 0 ? "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=300&q=80" : "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=300&q=80",
          businessLicenseUrl: businessLicenseFiles.length > 0 ? "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=300&q=80" : "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=300&q=80",
          brokerCertificateUrl: brokerCertificateFiles.length > 0 ? "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80" : "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80",
          profilePhotoUrl: profilePhotoFiles.length > 0 ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",

          yearsOfExperience: Number(formData.yearsOfExperience) || 0,
          areasOfOperation: formData.areasOfOperation.split(',').map(s => s.trim()),
          propertySpecialization: formData.propertySpecialization.split(',').map(s => s.trim()),
          languagesSpoken: formData.languagesSpoken.split(',').map(s => s.trim()),
        });
      } else {
        await brokerService.applyForAgency(user!.uid, {
          agencyName: formData.agencyName || formData.fullName,
          email: formData.email,
          phone: formData.phone,
          license: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=300&q=80",
          logo: companyLogoFiles.length > 0 ? "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80" : "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80",
          documents: ["https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=300&q=80"]
        });
      }
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Application submission failed. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  }, [applyType, brokerCertificateFiles.length, businessLicenseFiles.length, companyLogoFiles.length, formData, governmentIdFiles.length, profilePhotoFiles.length, step, user]);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-luxury-black text-white px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
            <ShieldCheck size={14} />
            <span>AmaanEstate Compliance Officer</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Certified Registry Application</h1>
          <p className="text-white/60 text-sm max-w-sm mx-auto">
            Become a legally verified real estate agent, independent broker, or corporate agency on the Horn of Africa.
          </p>
        </div>

        {/* Action: Select Application Mode at Step 1 */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setApplyType('individual')}
              className={`p-6 rounded-[2rem] border text-left transition-all duration-300 flex flex-col items-start gap-4 ${
                applyType === 'individual'
                  ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-lg shadow-[#C5A059]/15'
                  : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              <User size={24} />
              <div>
                <p className="font-bold text-sm uppercase tracking-wider block">Independent Broker</p>
                <span className="text-[10px] leading-tight block mt-1">Apply as an individual certified market operator</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setApplyType('agency')}
              className={`p-6 rounded-[2rem] border text-left transition-all duration-300 flex flex-col items-start gap-4 ${
                applyType === 'agency'
                  ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-lg shadow-[#C5A059]/15'
                  : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              <Building2 size={24} />
              <div>
                <p className="font-bold text-sm uppercase tracking-wider block">Agency Corporation</p>
                <span className="text-[10px] leading-tight block mt-1">Apply as a licensed brokerage or corporate firm</span>
              </div>
            </button>
          </div>
        )}

        {/* Steps Gauge */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-white/10 z-0"></div>
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step >= s ? 'bg-[#C5A059] text-black shadow-[0_0_20px_rgba(197,160,89,0.3)]' : 'bg-luxury-black border border-white/20 text-white/40'
              }`}>
                {s}
              </div>
              <span className={`text-[10px] uppercase tracking-widest font-bold ${step >= s ? 'text-[#C5A059]' : 'text-white/40'}`}>
                {s === 1 ? 'Primary Details' : s === 2 ? 'Audit Docs' : 'Agreement'}
              </span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="glass-card bg-luxury-black/90 border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-4">
                  <span>Step 1: Contact & Legal Identity</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {applyType === 'agency' ? (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs uppercase font-bold tracking-widest text-white/60">Agency / Brand Corporate Name</label>
                      <Input 
                        required 
                        value={formData.agencyName} 
                        onChange={e => setFormData({...formData, agencyName: e.target.value})}
                        placeholder="e.g., Somali Lands Development Ltd"
                        className="bg-white/5 border border-white/5 h-12 rounded-xl text-white"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs uppercase font-bold tracking-widest text-white/60">Full Legal Name</label>
                      <Input 
                        required 
                        value={formData.fullName} 
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        placeholder="e.g., Mahdi Omar"
                        className="bg-white/5 border border-white/5 h-12 rounded-xl text-white"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-white/60">Registry Email</label>
                    <Input 
                      required 
                      type="email" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="e.g., contact@amaanestate.com"
                      className="bg-white/5 border border-white/5 h-12 rounded-xl text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-white/60">Official Phone Line</label>
                    <Input 
                      required 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="e.g., +251 911 223 344"
                      className="bg-white/5 border border-white/5 h-12 rounded-xl text-white"
                    />
                  </div>
                  
                  {applyType === 'individual' && (
                    <div className="space-y-2">
                      <label className="text-xs uppercase font-bold tracking-widest text-white/60">WhatsApp Line</label>
                      <Input 
                        required 
                        value={formData.whatsapp} 
                        onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                        placeholder="e.g., +251 911 223 344"
                        className="bg-white/5 border border-white/5 h-12 rounded-xl text-white"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-white/60">Operational Province / City</label>
                    <Input 
                      required 
                      value={formData.city} 
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      placeholder="e.g., Jigjiga"
                      className="bg-white/5 border border-white/5 h-12 rounded-xl text-white"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-white/60">Main Office Corporate Address</label>
                    <Input 
                      value={formData.officeAddress} 
                      onChange={e => setFormData({...formData, officeAddress: e.target.value})}
                      placeholder="e.g., Somali Region Commercial Towers, Block #B, Jigjiga"
                      className="bg-white/5 border border-white/5 h-12 rounded-xl text-white"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-4">
                  <span>Step 2: Legal Documentation & Credentials</span>
                </h3>
                
                {applyType === 'individual' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-bold tracking-widest text-white/60">Years of Experience</label>
                        <Input 
                          type="number" 
                          required 
                          value={formData.yearsOfExperience} 
                          onChange={e => setFormData({...formData, yearsOfExperience: e.target.value})}
                          placeholder="e.g., 5"
                          className="bg-white/5 border border-white/5 h-12 rounded-xl text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-bold tracking-widest text-white/60">Sectors / Specialization (comma separated)</label>
                        <Input 
                          required 
                          value={formData.propertySpecialization} 
                          onChange={e => setFormData({...formData, propertySpecialization: e.target.value})}
                          placeholder="e.g., Land plots, Luxury villas, Commercial"
                          className="bg-white/5 border border-white/5 h-12 rounded-xl text-white"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs uppercase font-bold tracking-widest text-white/60">Operational Neighborhoods</label>
                        <Input 
                          required 
                          value={formData.areasOfOperation} 
                          onChange={e => setFormData({...formData, areasOfOperation: e.target.value})}
                          placeholder="e.g., Hodan District, Jigjiga HQ, Dire Dawa"
                          className="bg-white/5 border border-white/5 h-12 rounded-xl text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <p className="text-xs uppercase font-bold tracking-widest text-[#C5A059]">Credentials Upload (National ID or Business License)</p>
                      
                      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-2">
                        <span className="text-[11px] uppercase font-bold text-white/60 block">1. Government Photo Identity (Passport / Regional ID)</span>
                        <ImageUpload onImagesChange={setGovernmentIdFiles} maxFiles={1} />
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-2">
                        <span className="text-[11px] uppercase font-bold text-white/60 block">2. Profile Photo (Visible in Registry Directory)</span>
                        <ImageUpload onImagesChange={setProfilePhotoFiles} maxFiles={1} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-xs text-white/60">Please provide corporate licensing certificates and supporting deeds to verified the operating entity.</p>
                    
                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-2">
                      <span className="text-[11px] uppercase font-bold text-white/60 block">1. Corporate Business registration/License Document</span>
                      <ImageUpload onImagesChange={setBusinessLicenseFiles} maxFiles={1} />
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-2">
                      <span className="text-[11px] uppercase font-bold text-white/60 block">2. Official Corporate Logo</span>
                      <ImageUpload onImagesChange={setCompanyLogoFiles} maxFiles={1} />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-4">
                  <span>Step 3: Verification Agreement</span>
                </h3>
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-start gap-4">
                  <input 
                    type="checkbox" 
                    id="chk-agreeterm" 
                    checked={formData.agreement}
                    onChange={e => setFormData({...formData, agreement: e.target.checked})}
                    className="mt-1 h-5 w-5 bg-white/5 border-white/10 text-[#C5A059] focus:ring-0 checked:bg-[#C5A059]"
                  />
                  <label htmlFor="chk-agreeterm" className="text-white/60 text-xs leading-relaxed select-none cursor-pointer">
                    I state that all documents and information uploaded are legally valid. I permit AmaanEstate’s Compliance Board to run regional criminal record, address validation, and license audits under Ethiopian/regional frameworks to enforce double-allocation safety.
                  </label>
                </div>
              </motion.div>
            )}

            {/* Step Controls */}
            <div className="pt-6 border-t border-white/5 flex gap-4 justify-between">
              {step > 1 ? (
                <Button 
                  type="button" 
                  onClick={() => setStep(step - 1)} 
                  variant="outline" 
                  className="border-white/10 text-white hover:bg-white/5 h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                >
                  Back Step
                </Button>
              ) : (
                <div />
              )}
              
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-[#C5A059] text-black hover:bg-white transition-colors h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px]"
              >
                {loading ? 'Submitting Registry...' : step < 3 ? 'Save / Next Step' : 'Finish & Submit'}
              </Button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
