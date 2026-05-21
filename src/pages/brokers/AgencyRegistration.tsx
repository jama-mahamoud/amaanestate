import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Upload, ChevronRight, Scale, AlertCircle, FileText, CheckCircle2, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { brokerService } from '@/services/brokerService';
import ImageUpload from '@/components/listing/ImageUpload';

export default function AgencyRegistration() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    businessLicenseNumber: '',
    email: user?.email || '',
    phone: '',
    whatsapp: '',
    officeAddress: '',
    region: '',
    city: '',
    yearEstablished: '',
    
    numberOfAgents: '1',
    areasOfOperation: '',
    propertySpecialization: '',
    companyDescription: '',
    website: '',
    socialMedia: '',

    agreement: false
  });

  const [businessLicenseFiles, setBusinessLicenseFiles] = useState<File[]>([]);
  const [taxRegistrationFiles, setTaxRegistrationFiles] = useState<File[]>([]);
  const [ownerIdFiles, setOwnerIdFiles] = useState<File[]>([]);
  const [officeProofFiles, setOfficeProofFiles] = useState<File[]>([]);
  
  // Dummy file for now to satisfy fullName error
  const fullName = user?.displayName || 'Agency Owner';

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 pt-24 pb-20">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} className="text-emerald-500" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-4">Agency Application Submitted</h2>
        <p className="text-white/60 max-w-md mx-auto mb-8">
          Your agency application has been securely submitted to the AmaanEstate Legal Team. Verification typically takes 3-5 business days.
        </p>
        <Button onClick={() => navigate('/dashboard')} className="bg-[#C5A059] text-black hover:bg-white transition-colors">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
      return;
    }

    if (!formData.agreement) {
      alert("Please accept the verification agreement.");
      return;
    }

    setLoading(true);
    try {
      await brokerService.applyForBroker(user.uid, {
        type: 'agency',
        fullName: fullName,
        companyName: formData.companyName,
        businessLicenseNumber: formData.businessLicenseNumber,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        region: formData.region,
        city: formData.city,
        officeAddress: formData.officeAddress,
        yearEstablished: formData.yearEstablished,
        
        businessLicenseUrl: businessLicenseFiles.length > 0 ? "uploaded_license_url" : "",
        taxRegistrationUrl: taxRegistrationFiles.length > 0 ? "uploaded_tax_url" : "",
        governmentIdUrl: ownerIdFiles.length > 0 ? "uploaded_owner_id_url" : "",
        officeProofUrl: officeProofFiles.length > 0 ? "uploaded_office_proof_url" : "",
        profilePhotoUrl: "", // Optional for agency
        brokerCertificateUrl: "", // Optional for agency

        numberOfAgents: Number(formData.numberOfAgents) || 1,
        areasOfOperation: formData.areasOfOperation.split(',').map(s => s.trim()),
        propertySpecialization: formData.propertySpecialization.split(',').map(s => s.trim()),
        companyDescription: formData.companyDescription,
        website: formData.website,
        socialMedia: formData.socialMedia,
        
        yearsOfExperience: new Date().getFullYear() - (Number(formData.yearEstablished) || new Date().getFullYear()),
        languagesSpoken: ['Somali'], // Default or prompt
      });
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Failed to submit agency application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-24 px-4 min-h-screen">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-[#C5A059]/10 text-[#C5A059] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-[#C5A059]/20">
          <Building2 size={16} />
          <span>Agency & Company Registration</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Register Your Agency</h1>
        <p className="text-white/60">List your real estate company on the AmaanEstate directory and gain access to premium tools.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between mb-8 relative px-2 md:px-10">
        <div className="absolute left-10 md:left-20 top-1/2 -translate-y-1/2 w-[calc(100%-80px)] md:w-[calc(100%-160px)] h-px bg-white/10 z-0"></div>
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step >= s ? 'bg-[#C5A059] text-black shadow-[0_0_20px_rgba(197,160,89,0.3)]' : 'bg-luxury-black border border-white/20 text-white/40'
            }`}>
              {s}
            </div>
            <span className={`text-[10px] uppercase tracking-widest font-bold hidden sm:block ${step >= s ? 'text-[#C5A059]' : 'text-white/40'}`}>
              {s === 1 ? 'Company Details' : s === 2 ? 'Legal Docs' : s === 3 ? 'Company Profile' : 'Agreement'}
            </span>
          </div>
        ))}
      </div>

      <div className="glass-card bg-luxury-black/90 border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-4">
                <Building2 className="text-[#C5A059]" /> Company Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Company / Agency Name</label>
                  <Input required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="bg-white/5 border-white/10 text-white focus:border-[#C5A059]/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Business License Number</label>
                  <Input required value={formData.businessLicenseNumber} onChange={e => setFormData({...formData, businessLicenseNumber: e.target.value})} className="bg-white/5 border-white/10 text-white focus:border-[#C5A059]/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Company Email</label>
                  <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-white/5 border-white/10 text-white focus:border-[#C5A059]/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Company Phone</label>
                  <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-white/5 border-white/10 text-white focus:border-[#C5A059]/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">WhatsApp Number</label>
                  <Input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="bg-white/5 border-white/10 text-white focus:border-[#C5A059]/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Year Established</label>
                  <Input type="number" required value={formData.yearEstablished} onChange={e => setFormData({...formData, yearEstablished: e.target.value})} className="bg-white/5 border-white/10 text-white focus:border-[#C5A059]/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Region</label>
                  <Input required value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="bg-white/5 border-white/10 text-white focus:border-[#C5A059]/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">City</label>
                  <Input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="bg-white/5 border-white/10 text-white focus:border-[#C5A059]/50 transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Office Address</label>
                <Textarea required value={formData.officeAddress} onChange={e => setFormData({...formData, officeAddress: e.target.value})} className="bg-white/5 border-white/10 text-white min-h-[100px] focus:border-[#C5A059]/50 transition-colors" />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
               <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-4">
                <Scale className="text-[#C5A059]" /> Legal Documents
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                  <h4 className="text-sm font-bold text-white mb-2">Business License</h4>
                  <p className="text-[10px] text-white/50 mb-4 h-8">Official trade license registered with regional authorities.</p>
                  <ImageUpload onImagesChange={setBusinessLicenseFiles} maxFiles={1} label="Upload License" />
                </div>

                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                  <h4 className="text-sm font-bold text-white mb-2">Tax Registration (TIN)</h4>
                  <p className="text-[10px] text-white/50 mb-4 h-8">Tax identification document for the company.</p>
                  <ImageUpload onImagesChange={setTaxRegistrationFiles} maxFiles={1} label="Upload Tax Cert" />
                </div>

                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                  <h4 className="text-sm font-bold text-white mb-2">Owner's ID</h4>
                  <p className="text-[10px] text-white/50 mb-4 h-8">Government ID or passport of the primary agency owner.</p>
                  <ImageUpload onImagesChange={setOwnerIdFiles} maxFiles={1} label="Upload ID" />
                </div>

                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                  <h4 className="text-sm font-bold text-white mb-2">Office Proof / Trade Cert</h4>
                  <p className="text-[10px] text-white/50 mb-4 h-8">Proof of physical office address (e.g. lease agreement) or trade name certificate.</p>
                  <ImageUpload onImagesChange={setOfficeProofFiles} maxFiles={1} label="Upload Proof" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-4">
                <FileText className="text-[#C5A059]" /> Company Profile
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Number of Agents</label>
                  <Input type="number" min="1" required value={formData.numberOfAgents} onChange={e => setFormData({...formData, numberOfAgents: e.target.value})} className="bg-white/5 border-white/10 text-white focus:border-[#C5A059]/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Areas of Operation</label>
                  <Input placeholder="e.g. Jigjiga, Dire Dawa" required value={formData.areasOfOperation} onChange={e => setFormData({...formData, areasOfOperation: e.target.value})} className="bg-white/5 border-white/10 text-white focus:border-[#C5A059]/50 transition-colors" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Property Specialization</label>
                  <Input placeholder="e.g. Luxury Villas, Commercial Land, Apartments" required value={formData.propertySpecialization} onChange={e => setFormData({...formData, propertySpecialization: e.target.value})} className="bg-white/5 border-white/10 text-white focus:border-[#C5A059]/50 transition-colors" />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Company Description</label>
                  <Textarea placeholder="Describe your agency's history, mission, and services..." required value={formData.companyDescription} onChange={e => setFormData({...formData, companyDescription: e.target.value})} className="bg-white/5 border-white/10 text-white min-h-[120px] focus:border-[#C5A059]/50 transition-colors" />
                </div>

                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Website (Optional)</label>
                  <Input type="url" placeholder="https://" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="bg-white/5 border-white/10 text-white focus:border-[#C5A059]/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Social Media Link (Optional)</label>
                  <Input placeholder="Facebook or LinkedIn URL" value={formData.socialMedia} onChange={e => setFormData({...formData, socialMedia: e.target.value})} className="bg-white/5 border-white/10 text-white focus:border-[#C5A059]/50 transition-colors" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
               <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-4">
                <ShieldCheck className="text-[#C5A059]" /> Verification Agreement
              </h3>
              
              <div className="bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-xl p-6 text-sm text-[#C5A059] leading-relaxed space-y-4">
                <p>By submitting this application for {formData.companyName || 'your agency'} to become an AmaanEstate Verified Agency, you legally agree to the following terms and our Anti-Fraud Protocol:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>I certify that all identification and legal documents submitted are authentic.</li>
                  <li>Our agency agrees to strictly follow AmaanEstate's double-allocation prevention rules, ensuring properties listed are exclusively available and legally cleared.</li>
                  <li>I understand that submitting fraudulent ownership documents or engaging in deceptive practices will result in immediate permanent suspension and reporting to regional legal authorities.</li>
                  <li>Our agency will uphold ethical marketplace practices and accurate pricing representations.</li>
                </ul>
              </div>

              <div className="flex items-start gap-4 p-4 border border-white/10 bg-white/5 rounded-xl mt-6 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setFormData({...formData, agreement: !formData.agreement})}>
                <div className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${formData.agreement ? 'bg-[#C5A059] border-[#C5A059]' : 'border-white/30'}`}>
                  {formData.agreement && <CheckCircle2 size={16} className="text-black" />}
                </div>
                <div>
                  <p className="text-white text-sm font-bold">I confirm the above Anti-Fraud Legal Declaration.</p>
                  <p className="text-white/50 text-xs mt-1">This constitutes a legally binding agreement.</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-between pt-6 border-t border-white/10 mt-8 gap-4">
            {step > 1 ? (
              <Button type="button" onClick={() => setStep(step - 1)} variant="outline" className="border-white/20 text-white hover:bg-white/10 h-12 px-8 rounded-xl transition-all">
                Back
              </Button>
            ) : <div></div>}
            
            <Button type="submit" disabled={loading} className="bg-[#C5A059] text-black hover:bg-white h-12 px-8 rounded-xl transition-all font-bold">
              {loading ? 'Processing...' : step === 4 ? 'Submit Application' : 'Continue'}
              {step < 4 && !loading && <ChevronRight size={18} className="ml-1" />}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
