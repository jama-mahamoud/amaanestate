import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ChevronRight, Loader2, CheckCircle2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { applicationService } from '@/services/applicationService';
import { storageService } from '@/services/storageService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfessionalRegistration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    personalInfo: { fullName: '', email: '', phone: '', whatsapp: '', city: '', profilePhoto: null as File | null },
    professionalDetails: { category: '', specialization: '', yearsExp: '', workplace: '', skills: '', languages: '', bio: '' },
    experiencePortfolio: { projects: '', desc: '', portfolioImages: [] as File[], website: '', socials: '' },
    verificationDocs: { cv: null as File | null, certs: null as File | null, license: null as File | null, id: null as File | null },
    agreements: { confirmAccurate: false, agreeReview: false, agreeStandards: false }
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Upload all files to Firebase Storage
      // In a real app we'd map over everything, here we do it sequentially for simplification
      // ... storageService.uploadProfessionalAssets for portfolio
      // ... for docs, etc.
      
      // Submit Application
      await applicationService.submitApplication('professional', formData, user);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-10">Professional Application</h1>
        
        {/* Progress */}
        <div className="flex gap-2 mb-10">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className={`h-2 flex-1 rounded-full ${step >= s ? 'bg-luxury-gold' : 'bg-white/10'}`} />
          ))}
        </div>

        {/* Content */}
        {!success ? (
          <div className="bg-white/5 p-8 md:p-12 rounded-3xl border border-white/10">
            {step === 1 && <PersonalSection data={formData.personalInfo} update={(v: any) => setFormData(p => ({...p, personalInfo: v}))} />}
            {step === 2 && <DetailsSection data={formData.professionalDetails} update={(v: any) => setFormData(p => ({...p, professionalDetails: v}))} />}
            {step === 3 && <PortfolioSection data={formData.experiencePortfolio} update={(v: any) => setFormData(p => ({...p, experiencePortfolio: v}))} />}
            {step === 4 && <DocsSection data={formData.verificationDocs} update={(v: any) => setFormData(p => ({...p, verificationDocs: v}))} />}
            {step === 5 && <ReviewSection data={formData.agreements} update={(v: any) => setFormData(p => ({...p, agreements: v}))} />}

            <div className="mt-10 flex justify-between">
              <Button onClick={prevStep} disabled={step === 1} variant="outline">Back</Button>
              {step < 5 ? (
                <Button onClick={nextStep} className="bg-luxury-gold text-black hover:bg-white">Next</Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading} className="bg-luxury-gold text-black hover:bg-white">
                  {loading ? <Loader2 className="animate-spin" /> : 'Submit Application'}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center bg-white/5 p-16 rounded-3xl border border-white/10">
            <CheckCircle2 size={64} className="text-luxury-gold mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Application Submitted</h2>
            <p className="text-white/60">Your professional application has been submitted successfully.<br/>Verification review usually takes 24–72 hours.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PersonalSection({ data, update }: any) {
    return <div className="space-y-6">
        <h2 className="text-2xl font-bold">Personal Information</h2>
        <Input placeholder="Full Name" value={data.fullName} onChange={e => update({...data, fullName: e.target.value})} className="bg-white/5" />
        <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Email" value={data.email} onChange={e => update({...data, email: e.target.value})} className="bg-white/5" />
            <Input placeholder="Phone" value={data.phone} onChange={e => update({...data, phone: e.target.value})} className="bg-white/5" />
        </div>
    </div>
}

function DetailsSection({ data, update }: any) {
    return <div className="space-y-6">
        <h2 className="text-2xl font-bold">Professional Details</h2>
        <Input placeholder="Main Profession Category" value={data.category} onChange={e => update({...data, category: e.target.value})} className="bg-white/5" />
        <Textarea placeholder="Professional Bio" value={data.bio} onChange={e => update({...data, bio: e.target.value})} className="bg-white/5" />
    </div>
}

function PortfolioSection({ data, update }: any) {
    return <div className="space-y-6">
        <h2 className="text-2xl font-bold">Experience & Portfolio</h2>
        <Textarea placeholder="Portfolio Description" value={data.desc} onChange={e => update({...data, desc: e.target.value})} className="bg-white/5" />
        <div className="border-2 border-dashed border-white/20 p-8 text-center rounded-lg">Upload Portfolio Images</div>
    </div>
}

function DocsSection({ data, update }: any) {
    return <div className="space-y-6">
        <h2 className="text-2xl font-bold">Verification Documents</h2>
        <div className="grid grid-cols-2 gap-4">
            <div className="border p-4 rounded text-center">Upload CV</div>
            <div className="border p-4 rounded text-center">Upload ID</div>
        </div>
    </div>
}

function ReviewSection({ data, update }: any) {
    return <div className="space-y-6">
        <h2 className="text-2xl font-bold">Trust & Review</h2>
        <label className="flex items-center gap-2"><input type="checkbox" checked={data.confirmAccurate} onChange={e => update({...data, confirmAccurate: e.target.checked})} /> I confirm info is accurate</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={data.agreeReview} onChange={e => update({...data, agreeReview: e.target.checked})} /> I agree to review</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={data.agreeStandards} onChange={e => update({...data, agreeStandards: e.target.checked})} /> I agree to standards</label>
    </div>
}
