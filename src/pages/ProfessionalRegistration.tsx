import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ChevronRight, Loader2, CheckCircle2, Upload, X, FileText, User, MapPin, Briefcase, Award, Globe, Link as LinkIcon, Facebook, Instagram, Linkedin, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { applicationService } from '@/services/applicationService';
import { storageService } from '@/services/storageService';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ProfessionalRegistration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  
  const [formData, setFormData] = useState({
    personalInfo: { 
        fullName: '', 
        title: '', 
        email: '', 
        phone: '', 
        whatsapp: '', 
        city: 'Jigjiga', 
        profilePhoto: null as File | null 
    },
    professionalDetails: { 
        category: '', 
        specialization: '', 
        yearsExp: '', 
        workplace: '', 
        skills: '', 
        languages: '', 
        bio: '' 
    },
    experiencePortfolio: { 
        projects: '', 
        desc: '', 
        portfolioImages: [] as File[], 
        website: '', 
        socials: { facebook: '', instagram: '', linkedin: '' } 
    },
    verificationDocs: { 
        cv: null as File | null, 
        certs: null as File | null, 
        license: null as File | null, 
        idCard: null as File | null 
    },
    agreements: { 
        confirmAccurate: false, 
        agreeReview: false, 
        agreeStandards: false 
    }
  });

  const isStepValid = (currentStep: number) => {
    switch (currentStep) {
        case 1:
            return formData.personalInfo.fullName.trim() !== '' && 
                   formData.personalInfo.title.trim() !== '' &&
                   formData.personalInfo.email.trim() !== '' &&
                   formData.personalInfo.phone.trim() !== '' &&
                   formData.personalInfo.city !== '' &&
                   formData.personalInfo.profilePhoto !== null;
        case 2:
            return formData.professionalDetails.category !== '' &&
                   formData.professionalDetails.yearsExp !== '' &&
                   formData.professionalDetails.bio.trim().length > 20;
        case 3:
            return formData.experiencePortfolio.portfolioImages.length > 0;
        case 4:
            return formData.verificationDocs.cv !== null &&
                   formData.verificationDocs.idCard !== null;
        case 5:
            return formData.agreements.confirmAccurate &&
                   formData.agreements.agreeReview &&
                   formData.agreements.agreeStandards;
        default:
            return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
        toast.error('Authentication required');
        return;
    }
    
    setLoading(true);
    setUploadProgress(0);
    try {
      const submissionData: any = { ...formData };
      const professionalId = user.uid;

      // 1. Upload Profile Photo
      if (formData.personalInfo.profilePhoto) {
          setUploadStatus('Uploading Profile Photo...');
          const [profilePhotoAsset] = await storageService.uploadProfessionalAssets(
              professionalId, 
              [formData.personalInfo.profilePhoto],
              (prog) => {
                  const values = Object.values(prog);
                  const p = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / 1) : 0;
                  setUploadProgress(Math.round(p * 0.2)); 
              }
          );
          submissionData.personalInfo.profilePhotoUrl = profilePhotoAsset.url;
          setUploadProgress(20);
      }

      // 2. Upload Portfolio Images
      if (formData.experiencePortfolio.portfolioImages.length > 0) {
          setUploadStatus('Uploading Portfolio Assets...');
          const portfolioAssets = await storageService.uploadProfessionalAssets(
              `${professionalId}/portfolio`, 
              formData.experiencePortfolio.portfolioImages,
              (prog) => {
                  const values = Object.values(prog);
                  const p = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / formData.experiencePortfolio.portfolioImages.length) : 0;
                  setUploadProgress(20 + Math.round(p * 0.4)); // 20% to 60%
              }
          );
          submissionData.experiencePortfolio.portfolioImageUrls = portfolioAssets.map(a => a.url);
          setUploadProgress(60);
      }

      // 3. Upload Verification Documents
      const docFields = ['cv', 'certs', 'license', 'idCard'] as const;
      const filesToUpload = docFields
          .map(field => ({ field, file: formData.verificationDocs[field] }))
          .filter(item => item.file !== null) as { field: string, file: File }[];
      
      if (filesToUpload.length > 0) {
          setUploadStatus('Securing Verification Documents...');
          const uploadedDocs = await storageService.uploadProfessionalAssets(
              `${professionalId}/documents`,
              filesToUpload.map(i => i.file),
              (prog) => {
                  const values = Object.values(prog);
                  const p = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / filesToUpload.length) : 0;
                  setUploadProgress(60 + Math.round(p * 0.3)); // 60% to 90%
              }
          );

          // Map URLs back to fields
          filesToUpload.forEach((item, index) => {
              submissionData.verificationDocs[`${item.field}Url`] = uploadedDocs[index].url;
          });
      }
      setUploadProgress(90);

      // 4. Submit to Firestore
      setUploadStatus('Finalizing Professional Identity...');
      // Remove raw files before submission
      delete submissionData.personalInfo.profilePhoto;
      delete submissionData.experiencePortfolio.portfolioImages;
      delete submissionData.verificationDocs.cv;
      delete submissionData.verificationDocs.certs;
      delete submissionData.verificationDocs.license;
      delete submissionData.verificationDocs.idCard;

      await applicationService.submitApplication('professional', {
          ...submissionData,
          verificationStatus: 'pending',
          submittedAt: new Date().toISOString()
      }, user);
      
      setUploadProgress(100);
      setSuccess(true);
      toast.success('Professional identity registered');
    } catch (err: any) {
      console.error('Submission Error:', err);
      toast.error(err.message || 'Submission failed. Please check your network connection.');
      setUploadStatus('Error: ' + (err.message || 'Upload failed'));
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
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
             <span className="text-[10px] uppercase font-black tracking-widest text-luxury-gold">Step {step} of 5</span>
             <span className="text-[10px] uppercase font-black tracking-widest text-white/30">{Math.round((step / 5) * 100)}% Complete</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-luxury-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'bg-white/5'}`} />
            ))}
          </div>
        </div>

        {/* Content */}
        {!success ? (
          <div className="glass-card bg-white/[0.03] border border-white/5 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
            {loading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-10">
                    <Loader2 className="w-12 h-12 text-luxury-gold animate-spin mb-6" />
                    <h3 className="text-2xl font-bold mb-2">{uploadStatus}</h3>
                    <div className="w-64 bg-white/10 h-1.5 rounded-full overflow-hidden mt-4">
                        <div className="bg-luxury-gold h-full transition-all duration-500" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.3em] mt-4">{uploadProgress}% Synchronized</p>
                </div>
            )}

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                >
                    {step === 1 && <PersonalSection data={formData.personalInfo} update={(v: any) => setFormData(p => ({...p, personalInfo: v}))} />}
                    {step === 2 && <DetailsSection data={formData.professionalDetails} update={(v: any) => setFormData(p => ({...p, professionalDetails: v}))} />}
                    {step === 3 && <PortfolioSection data={formData.experiencePortfolio} update={(v: any) => setFormData(p => ({...p, experiencePortfolio: v}))} />}
                    {step === 4 && <DocsSection data={formData.verificationDocs} update={(v: any) => setFormData(p => ({...p, verificationDocs: v}))} />}
                    {step === 5 && <ReviewSection data={formData.agreements} update={(v: any) => setFormData(p => ({...p, agreements: v}))} />}
                </motion.div>
            </AnimatePresence>

            <div className="mt-12 pt-8 border-t border-white/5 flex gap-4">
              <Button 
                onClick={prevStep} 
                disabled={step === 1 || loading} 
                variant="ghost"
                className="h-14 px-8 rounded-2xl text-white/40 hover:text-white"
              >
                Back
              </Button>
              {step < 5 ? (
                <Button 
                    onClick={nextStep} 
                    disabled={!isStepValid(step)}
                    className="flex-1 h-14 rounded-2xl bg-white text-black hover:bg-luxury-gold transition-all font-bold group"
                >
                  Continue <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                </Button>
              ) : (
                <Button 
                    onClick={handleSubmit} 
                    disabled={loading || !isStepValid(5)} 
                    className="flex-1 h-14 rounded-2xl bg-luxury-gold text-black hover:bg-white transition-all font-bold shadow-xl shadow-luxury-gold/20"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Submit Professional Application'}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center glass-card bg-white/[0.03] border border-white/5 p-20 rounded-[4rem]">
            <div className="w-24 h-24 bg-luxury-gold/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10">
                <CheckCircle2 size={48} className="text-luxury-gold" />
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 tracking-tight">Application <span className="text-white/40">Securely Logged</span></h2>
            <div className="max-w-lg mx-auto text-white/50 space-y-6 text-lg leading-relaxed mb-12">
                <p>Your professional application has been submitted successfully to the AmaanEstate Verification Department.</p>
                <p>Verification review usually takes <span className="text-white font-bold">24–72 hours</span>. We will notify you via email once your status is updated.</p>
            </div>
            <Button asChild className="h-14 px-12 rounded-2xl bg-white text-black hover:bg-luxury-gold font-bold">
                <Link to="/">Return to Marketplace</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function PersonalSection({ data, update }: any) {
    const fileRef = useRef<HTMLInputElement>(null);

    return <div className="space-y-8">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-luxury-gold/10 text-luxury-gold">
                <User size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-display font-bold">Personal Identity</h2>
                <p className="text-white/30 text-xs uppercase tracking-widest font-bold">Step 1: Bio-Data Visualization</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Full Legal Name</label>
                <Input placeholder="Enter your full name" value={data.fullName} onChange={e => update({...data, fullName: e.target.value})} className="bg-white/5 border-white/5 h-14 rounded-2xl focus:ring-luxury-gold/30" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Professional Title</label>
                <Input placeholder="e.g. Senior Civil Engineer" value={data.title} onChange={e => update({...data, title: e.target.value})} className="bg-white/5 border-white/5 h-14 rounded-2xl focus:ring-luxury-gold/30" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Email (Verified)</label>
                <Input placeholder="email@example.com" value={data.email} onChange={e => update({...data, email: e.target.value})} className="bg-white/5 border-white/5 h-14 rounded-2xl focus:ring-luxury-gold/30" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Phone Number</label>
                <Input placeholder="+251 ..." value={data.phone} onChange={e => update({...data, phone: e.target.value})} className="bg-white/5 border-white/5 h-14 rounded-2xl focus:ring-luxury-gold/30" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">WhatsApp (Optional)</label>
                <Input placeholder="+251 ..." value={data.whatsapp} onChange={e => update({...data, whatsapp: e.target.value})} className="bg-white/5 border-white/5 h-14 rounded-2xl focus:ring-luxury-gold/30" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Primary Region</label>
                <select value={data.city} onChange={e => update({...data, city: e.target.value})} className="w-full bg-white/5 border border-white/5 h-14 rounded-2xl px-4 text-white focus:outline-none focus:ring-1 focus:ring-luxury-gold/30">
                    <option value="Jigjiga">Jigjiga</option>
                    <option value="Dire Dawa">Dire Dawa</option>
                    <option value="Godey">Godey</option>
                    <option value="Addis Ababa">Addis Ababa</option>
                </select>
            </div>
        </div>

        <div className="space-y-3">
             <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Profile Identity Image</label>
             <div 
                onClick={() => fileRef.current?.click()}
                className="h-32 rounded-2xl border-2 border-dashed border-white/10 hover:border-luxury-gold/30 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center overflow-hidden relative group"
             >
                <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={e => e.target.files && update({...data, profilePhoto: e.target.files[0]})} />
                {data.profilePhoto ? (
                    <div className="flex items-center gap-2 font-bold text-xs">
                        <Check size={16} className="text-luxury-gold" /> {data.profilePhoto.name}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-white/20 group-hover:text-luxury-gold transition-colors">
                        <Upload size={20} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Select Headshot</span>
                    </div>
                )}
             </div>
        </div>
    </div>
}

function DetailsSection({ data, update }: any) {
    return <div className="space-y-8">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-luxury-gold/10 text-luxury-gold">
                <Briefcase size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-display font-bold">Professional Intelligence</h2>
                <p className="text-white/30 text-xs uppercase tracking-widest font-bold">Step 2: Core Expertise Mapping</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Main Profession Category</label>
                <select value={data.category} onChange={e => update({...data, category: e.target.value})} className="w-full bg-white/5 border border-white/5 h-14 rounded-2xl px-4 text-white">
                    <option value="">Select Category</option>
                    <option value="Engineer">Engineer</option>
                    <option value="Architect">Architect</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Lawyer">Lawyer</option>
                    <option value="Real Estate Agent">Real Estate Agent</option>
                    <option value="Interior Designer">Interior Designer</option>
                    <option value="Surveyor">Surveyor</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Years of Experience</label>
                <Input type="number" placeholder="e.g. 8" value={data.yearsExp} onChange={e => update({...data, yearsExp: e.target.value})} className="bg-white/5 border-white/5 h-14 rounded-2xl" />
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Strategic Narrative (Professional Bio)</label>
            <Textarea 
                placeholder="Describe your professional background, certifications, and philosophy... (Min 20 characters)" 
                value={data.bio} 
                onChange={e => update({...data, bio: e.target.value})} 
                className="bg-white/5 border-white/5 min-h-[160px] rounded-2xl focus:ring-luxury-gold/30 p-6" 
            />
            <p className="text-[10px] text-white/20 text-right">{data.bio.length} chars</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Key Skills (Comma separated)</label>
                <Input placeholder="e.g. AutoCAD, Project Management" value={data.skills} onChange={e => update({...data, skills: e.target.value})} className="bg-white/5 border-white/5 h-14 rounded-2xl" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Current Workplace / Company</label>
                <Input placeholder="Enter company name" value={data.workplace} onChange={e => update({...data, workplace: e.target.value})} className="bg-white/5 border-white/5 h-14 rounded-2xl" />
            </div>
        </div>
    </div>
}

function PortfolioSection({ data, update }: any) {
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            update({...data, portfolioImages: [...data.portfolioImages, ...files]});
        }
    };

    const removeImage = (idx: number) => {
        const updated = data.portfolioImages.filter((_: any, i: number) => i !== idx);
        update({...data, portfolioImages: updated});
    };

    return <div className="space-y-8">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-luxury-gold/10 text-luxury-gold">
                <Award size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-display font-bold">Proven Architecture</h2>
                <p className="text-white/30 text-xs uppercase tracking-widest font-bold">Step 3: Work History & Portfolio</p>
            </div>
        </div>

        <div className="space-y-4">
             <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Visual Portfolio Assets (Project Images)</label>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {data.portfolioImages.map((file: File, i: number) => (
                    <div key={i} className="aspect-square rounded-2xl border border-white/5 overflow-hidden relative group">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(i)} className="absolute top-2 right-2 p-1 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={14} />
                        </button>
                    </div>
                ))}
                <button 
                    onClick={() => fileRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-luxury-gold/30 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-2 text-white/20 group cursor-pointer"
                >
                    <Plus size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] uppercase tracking-widest font-black">Add Asset</span>
                    <input type="file" ref={fileRef} multiple className="hidden" accept="image/*" onChange={handleFiles} />
                </button>
             </div>
        </div>

        <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">External Links (Website/Portfolio)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl px-4 h-14 group-focus-within:border-luxury-gold/30 transition-all">
                    <Globe size={18} className="text-white/20" />
                    <Input placeholder="https://..." value={data.website} onChange={e => update({...data, website: e.target.value})} className="bg-transparent border-0 focus-visible:ring-0 p-0 text-sm" />
                 </div>
                 <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl px-4 h-14 group-focus-within:border-luxury-gold/30 transition-all">
                    <Linkedin size={18} className="text-white/20" />
                    <Input placeholder="LinkedIn URL" value={data.socials.linkedin} onChange={e => update({...data, socials: {...data.socials, linkedin: e.target.value}})} className="bg-transparent border-0 focus-visible:ring-0 p-0 text-sm" />
                 </div>
            </div>
        </div>
    </div>
}

function DocsSection({ data, update }: any) {
    const fileRefs = {
        cv: useRef<HTMLInputElement>(null),
        certs: useRef<HTMLInputElement>(null),
        license: useRef<HTMLInputElement>(null),
        idCard: useRef<HTMLInputElement>(null)
    } as any;

    const DocItem = ({ title, field, required = false }: any) => {
        const file = data[field];
        return (
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">
                    {title} {required && <span className="text-red-500">*</span>}
                </label>
                <div 
                    onClick={() => fileRefs[field].current?.click()}
                    className={`h-24 rounded-2xl border flex items-center gap-4 px-6 cursor-pointer transition-all ${file ? 'border-luxury-gold bg-luxury-gold/5' : 'border-white/5 hover:border-white/20 bg-white/5'}`}
                >
                    <input type="file" ref={fileRefs[field]} className="hidden" onChange={e => update({...data, [field]: e.target.files?.[0]})} />
                    <div className={`p-3 rounded-xl ${file ? 'bg-luxury-gold/20 text-luxury-gold' : 'bg-white/5 text-white/20'}`}>
                        <FileText size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold truncate">{file ? file.name : 'Select PDF or Image'}</p>
                        <p className="text-[8px] uppercase tracking-widest text-white/20 mt-1">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Max 10MB'}</p>
                    </div>
                    {file ? <Check className="text-luxury-gold" size={16} /> : <Upload className="text-white/10" size={16} />}
                </div>
            </div>
        );
    };

    return <div className="space-y-8">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-luxury-gold/10 text-luxury-gold">
                <Shield size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-display font-bold">Verification Dossier</h2>
                <p className="text-white/30 text-xs uppercase tracking-widest font-bold">Step 4: Institutional Documentation</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DocItem title="CV / Resume" field="cv" required />
            <DocItem title="Identity Document (Passport/ID)" field="idCard" required />
            <DocItem title="Professional License" field="license" />
            <DocItem title="Experience Certificates" field="certs" />
        </div>
    </div>
}

function ReviewSection({ data, update }: any) {
    const CheckCard = ({ label, field }: any) => (
        <label className="flex items-start gap-4 p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-luxury-gold/30 cursor-pointer transition-all text-left">
            <input 
                type="checkbox" 
                checked={data[field]} 
                onChange={e => update({...data, [field]: e.target.checked})} 
                className="mt-1 w-5 h-5 rounded border-white/10 bg-white/5 text-luxury-gold focus:ring-offset-0 focus:ring-0"
            />
            <span className="text-sm font-medium leading-relaxed">{label}</span>
        </label>
    );

    return <div className="space-y-8">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-luxury-gold/10 text-luxury-gold">
                <CheckCircle2 size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-display font-bold">Final Accreditation</h2>
                <p className="text-white/30 text-xs uppercase tracking-widest font-bold">Step 5: Trust Framework Agreement</p>
            </div>
        </div>

        <div className="space-y-4">
            <CheckCard field="confirmAccurate" label="I solemnly confirm that all information provided in this identity application is accurate and true to my knowledge." />
            <CheckCard field="agreeReview" label="I acknowledge that my professional profile will undergo a manual verification review by the AmaanEstate audit team." />
            <CheckCard field="agreeStandards" label="I agree to maintain professional marketplace standards and ethical conduct while operating within the network." />
        </div>
        
        <div className="bg-luxury-gold/5 border border-luxury-gold/10 p-6 rounded-3xl text-[10px] text-luxury-gold/60 leading-relaxed font-medium uppercase tracking-widest text-left">
            Institutional Notice: Providing fraudulent documentation or false professional credentials will lead to a permanent ban from the AmaanEstate Integrated Regional Network.
        </div>
    </div>
}
