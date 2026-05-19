import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, Upload, ChevronRight, Scale, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { brokerService } from '@/services/brokerService';
import ImageUpload from '@/components/listing/ImageUpload';

export default function BrokerApplication() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    phone: '',
    whatsapp: '',
    email: user?.email || '',
    region: '',
    city: '',
    officeAddress: '',

    yearsOfExperience: '',
    areasOfOperation: '',
    propertySpecialization: '',
    languagesSpoken: '',

    agreement: false
  });

  // Simplified file upload mocks for now (normally use storageService)
  const [governmentIdFiles, setGovernmentIdFiles] = useState<File[]>([]);
  const [businessLicenseFiles, setBusinessLicenseFiles] = useState<File[]>([]);
  const [brokerCertificateFiles, setBrokerCertificateFiles] = useState<File[]>([]);
  const [profilePhotoFiles, setProfilePhotoFiles] = useState<File[]>([]);

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} className="text-emerald-500" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-4">Application Submitted</h2>
        <p className="text-white/60 max-w-md mx-auto mb-8">
          Your broker application has been securely submitted to the AmaanEstate Legal Team. Verification typically takes 2-4 business days.
        </p>
        <Button onClick={() => navigate('/dashboard')} className="bg-[#C5A059] text-black">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (!formData.agreement) {
      alert("Please accept the verification agreement.");
      return;
    }

    setLoading(true);
    try {
      // In a real app, upload files via storageService and get URLs.
      // Here, we use dummy URLs for the sake of the prototype.
      await brokerService.applyForBroker(user.uid, {
        fullName: formData.fullName,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        region: formData.region,
        city: formData.city,
        officeAddress: formData.officeAddress,
        
        governmentIdUrl: governmentIdFiles.length > 0 ? "uploaded_gov_id_url" : "",
        businessLicenseUrl: businessLicenseFiles.length > 0 ? "uploaded_license_url" : "",
        brokerCertificateUrl: brokerCertificateFiles.length > 0 ? "uploaded_cert_url" : "",
        profilePhotoUrl: profilePhotoFiles.length > 0 ? "uploaded_photo_url" : "",

        yearsOfExperience: Number(formData.yearsOfExperience) || 0,
        areasOfOperation: formData.areasOfOperation.split(',').map(s => s.trim()),
        propertySpecialization: formData.propertySpecialization.split(',').map(s => s.trim()),
        languagesSpoken: formData.languagesSpoken.split(',').map(s => s.trim()),
      });
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-[#C5A059]/10 text-[#C5A059] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          <ShieldCheck size={16} />
          <span>AmaanEstate Legal Desk</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Broker Registry Application</h1>
        <p className="text-white/60">Join the region's elite real estate network with verified legal protection.</p>
      </div>

      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-white/10 z-0"></div>
        {[1, 2, 3].map((s) => (
          <div key={s} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step >= s ? 'bg-[#C5A059] text-black shadow-[0_0_20px_rgba(197,160,89,0.3)]' : 'bg-luxury-black border border-white/20 text-white/40' // Modified class to match brand
            }`}>
              {s}
            </div>
            <span className={`text-[10px] uppercase tracking-widest font-bold ${step >= s ? 'text-[#C5A059]' : 'text-white/40'}`}>
              {s === 1 ? 'Identity' : s === 2 ? 'Legal Docs' : 'Agreement'}
            </span>
          </div>
        ))}
      </div>

      <div className="glass-card bg-luxury-black/90 border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-4">
                <FileText className="text-[#C5A059]" /> Personal Identity
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Full Legal Name</label>
                  <Input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Email Address</label>
                  <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Phone Number</label>
                  <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">WhatsApp Number</label>
                  <Input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Region</label>
                  <Input required value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">City</label>
                  <Input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="bg-white/5 border-white/10 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Office Address</label>
                <Textarea required value={formData.officeAddress} onChange={e => setFormData({...formData, officeAddress: e.target.value})} className="bg-white/5 border-white/10 text-white" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Years of Experience</label>
                  <Input type="number" required value={formData.yearsOfExperience} onChange={e => setFormData({...formData, yearsOfExperience: e.target.value})} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Languages Spoken</label>
                  <Input placeholder="e.g. Somali, English, Amharic" required value={formData.languagesSpoken} onChange={e => setFormData({...formData, languagesSpoken: e.target.value})} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Areas of Operation</label>
                  <Input placeholder="e.g. Jigjiga Central, Dire Dawa Free Zone" required value={formData.areasOfOperation} onChange={e => setFormData({...formData, areasOfOperation: e.target.value})} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Property Specialization</label>
                  <Input placeholder="e.g. Residential, Commercial Land" required value={formData.propertySpecialization} onChange={e => setFormData({...formData, propertySpecialization: e.target.value})} className="bg-white/5 border-white/10 text-white" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
               <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-4">
                <Scale className="text-[#C5A059]" /> Legal Information
              </h3>
              
              <div className="space-y-8">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <h4 className="text-sm font-bold text-white mb-2">Government ID</h4>
                  <p className="text-[10px] text-white/50 mb-4">Upload a scanned copy of your national identity card or passport.</p>
                  <ImageUpload onImagesChange={setGovernmentIdFiles} maxFiles={1} label="Upload ID Document" />
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <h4 className="text-sm font-bold text-white mb-2">Business License (Optional for Individuals)</h4>
                  <p className="text-[10px] text-white/50 mb-4">Official trade license registered with regional authorities.</p>
                  <ImageUpload onImagesChange={setBusinessLicenseFiles} maxFiles={1} label="Upload License" />
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <h4 className="text-sm font-bold text-white mb-2">Broker Certificate</h4>
                  <p className="text-[10px] text-white/50 mb-4">Proof of your professional brokering credentials.</p>
                  <ImageUpload onImagesChange={setBrokerCertificateFiles} maxFiles={1} label="Upload Certificate" />
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <h4 className="text-sm font-bold text-white mb-2">Professional Profile Photo</h4>
                  <p className="text-[10px] text-white/50 mb-4">To be displayed on your Verified Broker profile.</p>
                  <ImageUpload onImagesChange={setProfilePhotoFiles} maxFiles={1} label="Upload Photo" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-4">
                <ShieldCheck className="text-[#C5A059]" /> Verification Agreement
              </h3>
              
              <div className="bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-xl p-6 text-sm text-[#C5A059] leading-relaxed space-y-4">
                <p>By submitting this application to become an AmaanEstate Verified Broker, you legally agree to the following terms and our Anti-Fraud Protocol:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>I certify that all identification and legal documents submitted are authentic.</li>
                  <li>I agree to strictly follow AmaanEstate's double-allocation prevention rules, ensuring properties I list are exclusively available and legally cleared.</li>
                  <li>I understand that submitting fraudulent ownership documents or engaging in deceptive practices will result in immediate permanent suspension and reporting to regional legal authorities.</li>
                  <li>I will uphold ethical marketplace practices and accurate pricing representations.</li>
                </ul>
              </div>

              <div className="flex items-start gap-4 p-4 border border-white/10 bg-white/5 rounded-xl mt-6 cursor-pointer" onClick={() => setFormData({...formData, agreement: !formData.agreement})}>
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
              <Button type="button" onClick={() => setStep(step - 1)} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Back
              </Button>
            ) : <div></div>}
            
            <Button type="submit" disabled={loading} className="bg-[#C5A059] text-black hover:bg-white min-w-[140px]">
              {loading ? 'Processing...' : step === 3 ? 'Submit Application' : 'Continue'}
              {step < 3 && !loading && <ChevronRight size={18} className="ml-1" />}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
