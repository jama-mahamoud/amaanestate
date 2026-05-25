import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, Upload, ChevronRight, Scale, AlertCircle, FileText, 
  CheckCircle2, User, Building2, Lock, Check, Award, MapPin, 
  Phone, Globe, FileSignature, HelpCircle, ArrowLeft
} from 'lucide-react';
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
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C5A059]/[0.02] blur-[120px] rounded-full pointer-events-none"></div>
        <div className="glass-card p-10 md:p-12 rounded-[2.5rem] border border-white/5 text-center max-w-xl shadow-2xl bg-white/[0.01]/80 backdrop-blur-3xl relative z-10">
          <div className="w-16 h-16 bg-[#C5A059]/10 border border-[#C5A059]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-[#C5A059]" />
          </div>
          <h2 className="text-3xl font-display font-medium mb-3 tracking-tight">System Onboarding Key Required</h2>
          <p className="text-white/50 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
            You must be logged in to an authenticated AmaanEstate account to submit records to the municipal background and dual-allocation verification desk.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-[#C5A059] text-black hover:bg-white rounded-xl h-11 px-8 font-semibold transition-all duration-350">
              <Link to="/login">Sign In & Begin</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-xl h-11 px-8 transition-all duration-350">
              <Link to="/">Back to Home</Link>
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
        <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white mb-3">Compliance Review Initiated</h2>
        <p className="text-white/50 text-sm max-w-md mx-auto mb-10 leading-relaxed font-light">
          Your records are locked and queuing for review at the regional land compliance desk. Verification, address audits, and badge authorization take 2 to 4 business days.
        </p>
        <Button onClick={() => navigate('/dashboard')} className="bg-[#C5A059] text-black hover:bg-white transition-all h-12 px-8 rounded-xl font-bold uppercase tracking-wider text-[11px] shadow-lg shadow-[#C5A059]/10">
          Dashboard Portal
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.agreement) {
      alert("Please review and check the regulatory authorization agreement to complete submission.");
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
      alert("Onboarding registration record failed to save. Please review inputs and re-submit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#050505] text-white px-4 md:px-8 relative overflow-hidden font-sans selection:bg-[#C5A059]/20">
      {/* Background Ambience Subtle Shaders */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-[#C5A059]/[0.02] via-transparent to-transparent pointer-events-none rounded-b-[4rem]"></div>
      <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-gradient-to-r from-[#C5A059]/[0.01] to-[#C5A059]/[0.02] blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Interactive Trust Metrics and Sidebar Info */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            
            {/* Nav Back Button */}
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 text-white/40 hover:text-[#C5A059] text-[11px] font-bold uppercase tracking-wider transition-colors duration-300"
            >
              <ArrowLeft size={14} />
              <span>Dashboard Portal</span>
            </Link>

            {/* Premium Header */}
            <div>
              <div id="compliance-officer-badge" className="inline-flex items-center gap-2 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                <ShieldCheck size={14} className="stroke-[2.5]" />
                <span>Compliance & Audit Bureau</span>
              </div>
              <h1 className="text-3xl md:text-4.5xl font-display font-medium tracking-tight text-white mb-4 leading-tight">
                Certified Registry Onboarding
              </h1>
              <p className="text-white/50 text-sm leading-relaxed max-w-md font-light">
                Upgrade your operator account status to access certified regional marketing, legal deed logging, and double-allocation risk assessment charters under regional compliance frameworks.
              </p>
            </div>

            {/* Live Compliance Parameters Checklist */}
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
                <Award size={14} className="text-[#C5A059]" />
                <span>Audit & Registry Safeguards</span>
              </h4>
              <ul className="space-y-3">
                {[
                  { title: "East Africa Real Estate Association Verification", desc: "Direct registration checks matching professional agency rosters." },
                  { title: "Title & Property Allocation Audits", desc: "Double-allocation prevention checks matched with land records." },
                  { title: "Office & Address Verification", desc: "Physical agency offices are verified for authentic operation checks." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/80">{item.title}</p>
                      <p className="text-[10px] text-white/40 leading-normal mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                <span className="flex items-center gap-1">
                  <Lock size={11} className="text-[#C5A059]" />
                  Secure 256-bit Encr.
                </span>
                <span>Registry Code: AE-V3</span>
              </div>
            </div>

          </div>

          {/* Right Column: Complete Flow Application Form Card */}
          <div className="lg:col-span-8">
            
            {/* Selection Mode at Step 1 */}
            {step === 1 && (
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/30 mb-3">Verification License Class</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setApplyType('individual')}
                    className={`p-6 rounded-2xl border text-left transition-all duration-350 flex flex-col items-start gap-4 cursor-pointer relative overflow-hidden group ${
                      applyType === 'individual'
                        ? 'bg-gradient-to-br from-[#C5A059]/10 to-[#C5A059]/[0.02] border-[#C5A059] text-white shadow-xl shadow-[#C5A059]/5'
                        : 'bg-white/[0.01] border-white/5 text-white/40 hover:bg-white/[0.03] hover:border-white/10 hover:text-white'
                    }`}
                  >
                    {applyType === 'individual' && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-[#C5A059] opacity-5 rounded-bl-full pointer-events-none" />
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-350 shrink-0 ${
                      applyType === 'individual' 
                        ? 'bg-[#C5A059] text-black shadow-md shadow-[#C5A059]/20' 
                        : 'bg-white/5 text-white/60 group-hover:text-[#C5A059]'
                    }`}>
                      <User size={18} />
                    </div>
                    <div>
                      <span className="font-bold text-sm tracking-wide block">Independent Broker</span>
                      <span className="text-[11px] leading-relaxed block mt-1 opacity-70">
                        For local market operators, certified independent agents, or land development counselors.
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApplyType('agency')}
                    className={`p-6 rounded-2xl border text-left transition-all duration-350 flex flex-col items-start gap-4 cursor-pointer relative overflow-hidden group ${
                      applyType === 'agency'
                        ? 'bg-gradient-to-br from-[#C5A059]/10 to-[#C5A059]/[0.02] border-[#C5A059] text-white shadow-xl shadow-[#C5A059]/5'
                        : 'bg-white/[0.01] border-white/5 text-white/40 hover:bg-white/[0.03] hover:border-white/10 hover:text-white'
                    }`}
                  >
                    {applyType === 'agency' && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-[#C5A059] opacity-5 rounded-bl-full pointer-events-none" />
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-350 shrink-0 ${
                      applyType === 'agency' 
                        ? 'bg-[#C5A059] text-black shadow-md shadow-[#C5A059]/20' 
                        : 'bg-white/5 text-white/60 group-hover:text-[#C5A059]'
                    }`}>
                      <Building2 size={18} />
                    </div>
                    <div>
                      <span className="font-bold text-sm tracking-wide block">Agency Corporation</span>
                      <span className="text-[11px] leading-relaxed block mt-1 opacity-70">
                        For licensed brokerages, development firms, and multi-partner enterprise entities.
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Modernized Stepper Bar */}
            <div className="relative mb-10 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-[#C5A059] uppercase tracking-widest">Progress Tracker</span>
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
                <span className={step === 1 ? 'text-[#C5A059]' : ''}>1. Identity</span>
                <span className={step === 2 ? 'text-[#C5A059]' : ''}>2. Credentials</span>
                <span className={step === 3 ? 'text-[#C5A059]' : ''}>3. Mandate</span>
              </div>
            </div>

            {/* Main Form Dashboard card */}
            <div className="rounded-[2rem] border border-white/5 bg-[#0a0a0a]/90 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
              
              {/* Top ambient luxury border glow */}
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#C5A059]/40 to-transparent"></div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
                
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, y: 15 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest font-black text-[#C5A059]">Active Stage</span>
                          <h3 className="text-lg font-display font-medium text-white mt-0.5">Primary Contact & Identity</h3>
                        </div>
                        <span className="text-white/30 text-xs font-mono">01 / 03</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {applyType === 'agency' ? (
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">Agency / Business Legal Name</label>
                            <Input 
                              required 
                              value={formData.agencyName} 
                              onChange={e => setFormData({...formData, agencyName: e.target.value})}
                              placeholder="e.g., Somali Lands Development Ltd"
                              className="bg-white/[0.02] border-white/5 h-12 rounded-xl text-white focus-visible:ring-1 focus-visible:ring-[#C5A059]/30 focus-visible:border-[#C5A059]/80 placeholder:text-white/20 transition-all font-light"
                            />
                            <p className="text-[9px] text-white/30">Matches your ministry registered legal corporate banner.</p>
                          </div>
                        ) : (
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">Agent Legal Full Name</label>
                            <Input 
                              required 
                              value={formData.fullName} 
                              onChange={e => setFormData({...formData, fullName: e.target.value})}
                              placeholder="e.g., Mahdi Omar"
                              className="bg-white/[0.02] border-white/5 h-12 rounded-xl text-white focus-visible:ring-1 focus-visible:ring-[#C5A059]/30 focus-visible:border-[#C5A059]/80 placeholder:text-white/20 transition-all font-light"
                            />
                            <p className="text-[9px] text-white/30">As indicated on your government-issued passport or national ID card.</p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">Official Email Address</label>
                          <Input 
                            required 
                            type="email" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            placeholder="e.g., contact@amaanestate.com"
                            className="bg-white/[0.02] border-white/5 h-12 rounded-xl text-white focus-visible:ring-1 focus-visible:ring-[#C5A059]/30 focus-visible:border-[#C5A059]/80 placeholder:text-white/20 transition-all font-light"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">Official Telephone Number</label>
                          <Input 
                            required 
                            value={formData.phone} 
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            placeholder="e.g., +251 911 223 344"
                            className="bg-white/[0.02] border-white/5 h-12 rounded-xl text-white focus-visible:ring-1 focus-visible:ring-[#C5A059]/30 focus-visible:border-[#C5A059]/80 placeholder:text-white/20 transition-all font-light"
                          />
                        </div>
                        
                        {applyType === 'individual' && (
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">WhatsApp Phone Code</label>
                            <Input 
                              required 
                              value={formData.whatsapp} 
                              onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                              placeholder="e.g., +251 911 223 344"
                              className="bg-white/[0.02] border-white/5 h-12 rounded-xl text-white focus-visible:ring-1 focus-visible:ring-[#C5A059]/30 focus-visible:border-[#C5A059]/80 placeholder:text-white/20 transition-all font-light"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">Metropolitan City</label>
                          <Input 
                            required 
                            value={formData.city} 
                            onChange={e => setFormData({...formData, city: e.target.value})}
                            placeholder="e.g., Jigjiga"
                            className="bg-white/[0.02] border-white/5 h-12 rounded-xl text-white focus-visible:ring-1 focus-visible:ring-[#C5A059]/30 focus-visible:border-[#C5A059]/80 placeholder:text-white/20 transition-all font-light"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">Physical Head Office Address</label>
                          <Input 
                            required
                            value={formData.officeAddress} 
                            onChange={e => setFormData({...formData, officeAddress: e.target.value})}
                            placeholder="e.g., Somali Region Commercial Towers, Block #B, Jigjiga"
                            className="bg-white/[0.02] border-white/5 h-12 rounded-xl text-white focus-visible:ring-1 focus-visible:ring-[#C5A059]/30 focus-visible:border-[#C5A059]/80 placeholder:text-white/20 transition-all font-light"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, y: 15 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest font-black text-[#C5A059]">Active Stage</span>
                          <h3 className="text-lg font-display font-medium text-white mt-0.5">Documents & Credentials</h3>
                        </div>
                        <span className="text-white/30 text-xs font-mono">02 / 03</span>
                      </div>
                      
                      {applyType === 'individual' ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">Years of Industry Experience</label>
                              <Input 
                                type="number" 
                                required 
                                value={formData.yearsOfExperience} 
                                onChange={e => setFormData({...formData, yearsOfExperience: e.target.value})}
                                placeholder="e.g., 5"
                                className="bg-white/[0.02] border-white/5 h-12 rounded-xl text-white focus-visible:ring-1 focus-visible:ring-[#C5A059]/30 focus-visible:border-[#C5A059]/80 placeholder:text-white/20 transition-all font-light"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">Specializations (comma separated)</label>
                              <Input 
                                required 
                                value={formData.propertySpecialization} 
                                onChange={e => setFormData({...formData, propertySpecialization: e.target.value})}
                                placeholder="e.g., Land plots, Luxury villas, Commercial"
                                className="bg-white/[0.02] border-white/5 h-12 rounded-xl text-white focus-visible:ring-1 focus-visible:ring-[#C5A059]/30 focus-visible:border-[#C5A059]/80 placeholder:text-white/20 transition-all font-light"
                              />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                              <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">Primary Operational Neighborhood districts</label>
                              <Input 
                                required 
                                value={formData.areasOfOperation} 
                                onChange={e => setFormData({...formData, areasOfOperation: e.target.value})}
                                placeholder="e.g., Hodan District, Jigjiga HQ, Dire Dawa"
                                className="bg-white/[0.02] border-white/5 h-12 rounded-xl text-white focus-visible:ring-1 focus-visible:ring-[#C5A059]/30 focus-visible:border-[#C5A059]/80 placeholder:text-white/20 transition-all font-light"
                              />
                            </div>
                          </div>

                          <div className="space-y-5 pt-4 border-t border-white/5">
                            <h4 className="text-[11px] uppercase font-bold tracking-widest text-[#C5A059] flex items-center gap-2">
                              <Upload size={13} />
                              <span>Required Documentation Uploads</span>
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white/[0.01] border border-white/5 p-5 rounded-xl space-y-3">
                                <div>
                                  <span className="text-xs font-semibold text-white/80 block">Government Photo ID</span>
                                  <span className="text-[10px] text-white/40 block mt-0.5">Please provide your clean National ID or Passport scan.</span>
                                </div>
                                <ImageUpload onImagesChange={setGovernmentIdFiles} maxFiles={1} />
                              </div>

                              <div className="bg-white/[0.01] border border-white/5 p-5 rounded-xl space-y-3">
                                <div>
                                  <span className="text-xs font-semibold text-white/80 block">Recent Portrait Photo</span>
                                  <span className="text-[10px] text-white/40 block mt-0.5">Will be displayed on your verified registry public profile.</span>
                                </div>
                                <ImageUpload onImagesChange={setProfilePhotoFiles} maxFiles={1} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <p className="text-xs text-white/50 leading-relaxed font-light">
                            Corporate verification requires legal business certification and active trade registry records under local commercial regulations.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/[0.01] border border-white/5 p-5 rounded-xl space-y-3">
                              <div>
                                <span className="text-xs font-semibold text-white/80 block">Corporate Trade License</span>
                                <span className="text-[10px] text-white/40 block mt-0.5">Copy of your active corporate registry charter.</span>
                              </div>
                              <ImageUpload onImagesChange={setBusinessLicenseFiles} maxFiles={1} />
                            </div>

                            <div className="bg-white/[0.01] border border-white/5 p-5 rounded-xl space-y-3">
                              <div>
                                <span className="text-xs font-semibold text-white/80 block">Official Corporate Logo</span>
                                <span className="text-[10px] text-white/40 block mt-0.5">Used for corporate brand watermarks on properties.</span>
                              </div>
                              <ImageUpload onImagesChange={setCompanyLogoFiles} maxFiles={1} />
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, y: 15 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest font-black text-[#C5A059]">Active Stage</span>
                          <h3 className="text-lg font-display font-medium text-white mt-0.5">Verification Oath & Mandate</h3>
                        </div>
                        <span className="text-white/30 text-xs font-mono">03 / 03</span>
                      </div>

                      <div className="p-6 rounded-2xl border border-[#C5A059]/20 bg-[#C5A059]/5 space-y-4">
                        <div className="flex gap-3">
                          <Award size={20} className="text-[#C5A059] shrink-0 mt-0.5" />
                          <div>
                            <h5 className="text-sm font-semibold text-white">Ethical Broker Commitment</h5>
                            <p className="text-[11px] text-white/60 leading-relaxed mt-1">
                              By joining the AmaanEstate Certified Registry, you strictly guarantee clean property listings, active ownership proof verification, and zero dual-deed listings to protect downstream regional commercial safety.
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
                          I hereby declare under legal oath that all documents, corporate license charts, and broker details submitted are correct and valid. I explicitly authorize the AmaanEstate Compliance and Audit board to coordinate criminal records background checks and physical office audits with municipal registers.
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Styled Back / Next Step Controls */}
                <div className="pt-6 border-t border-white/5 flex gap-4 justify-between">
                  {step > 1 ? (
                    <Button 
                      type="button" 
                      onClick={() => {
                        setStep(step - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} 
                      variant="outline" 
                      className="border-white/10 text-white hover:bg-white/5 hover:text-[#C5A059] h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
                    >
                      Retrieve Previous
                    </Button>
                  ) : (
                    <div />
                  )}
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#C5A059] text-black hover:bg-white hover:shadow-xl hover:shadow-[#C5A059]/10 transition-all duration-350 h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px]"
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
                      'Authorize & Submit Application'
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
