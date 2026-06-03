import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, MapPin, Clock, DollarSign, Search, Building, User, FileText, 
  CheckCircle, Plus, AlertCircle, ChevronRight, ExternalLink, SlidersHorizontal, 
  Bookmark, Trash2, Calendar, Compass, Edit, Users, ShieldAlert, Check, X, Award,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { jobService } from '@/services/jobService';
import { uploadFile } from '@/services/uploadService';
import { Job, CompanyProfile, CandidateProfile, JobApplication } from '@/types';
import PremiumSelect from '@/components/ui/PremiumSelect';
import { useSEO } from '@/hooks/useSEO';

const CATEGORIES = [
  'Real Estate', 'Construction', 'Engineering', 'Security', 'Cleaning', 
  'Driving', 'Marketing', 'Sales', 'Customer Support', 'Graphic Design', 
  'Social Media', 'Remote Work', 'Administration'
];
const WORKPLACE_TYPES = ['on-site', 'hybrid', 'remote'];
const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'remote', 'contract', 'freelance'];
const CITIES = ['Mogadishu', 'Hargeisa', 'Garowe', 'Kismayo', 'Bosaso', 'Baidoa', 'Jigjiga', 'Diredawa', 'Addis Ababa', 'Remote'];

const DEFAULT_COMP_LOGO = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop&q=80';

export default function JobsPage() {
  const { user, profile } = useAuth();

  useSEO({
    title: 'Careers & Jobs Portal — Verified Job Placements',
    description: 'Find verified local and remote jobs in Somalia. Real-time hiring from vetted companies. Post job listings and connect with top Somali candidates.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'AmaanEstate Jobs Board',
      'url': 'https://amaanestate.com/jobs',
      'description': 'Verified jobs and career listing board by AmaanEstate.'
    }
  });

  const isAdmin = useMemo(() => profile?.role === 'admin' || user?.email === 'towinnow0@gmail.com', [profile, user]);
  const bypassVerification = true;

  const [activeTab, setActiveTab] = useState<'browse' | 'candidate' | 'employer' | 'admin'>('browse');
  const [empSubTab, setEmpSubTab] = useState<'analytics' | 'post' | 'active' | 'drafts' | 'applicants' | 'company'>('analytics');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [locFilter, setLocFilter] = useState('All');
  const [workplace, setWorkplace] = useState('All');
  const [employment, setEmployment] = useState('All');
  const [urgentOnly, setUrgentOnly] = useState(false);

  // Firestore Real Records
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Modal / Selection states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isSubmitApplicationOpen, setIsSubmitApplicationOpen] = useState(false);
  const [applyResume, setApplyResume] = useState('');
  const [applyCoverLetter, setApplyCoverLetter] = useState('');
  const [applyPhone, setApplyPhone] = useState('');

  // Form states (Create / Edit Job)
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formLocation, setFormLocation] = useState(CITIES[0]);
  const [formEmployment, setFormEmployment] = useState<'full-time' | 'part-time' | 'remote' | 'contract' | 'freelance'>('full-time');
  const [formWorkplace, setFormWorkplace] = useState<'on-site' | 'hybrid' | 'remote'>('on-site');
  const [formSalaryMin, setFormSalaryMin] = useState(1000);
  const [formSalaryMax, setFormSalaryMax] = useState(2500);
  const [formDescription, setFormDescription] = useState('');
  const [formRequirements, setFormRequirements] = useState('');
  const [formBenefits, setFormBenefits] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formFeaturedImage, setFormFeaturedImage] = useState('');
  const [formCompanyLogo, setFormCompanyLogo] = useState('');
  const [formIsUrgent, setFormIsUrgent] = useState(false);

  // Candidate state
  const [candProfile, setCandProfile] = useState<CandidateProfile | null>(null);
  const [isEditCandOpen, setIsEditCandOpen] = useState(false);
  const [candBio, setCandBio] = useState('');
  const [candSkills, setCandSkills] = useState('');
  const [candResumeInput, setCandResumeInput] = useState('');
  const [candApps, setCandApps] = useState<JobApplication[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  // Employer state
  const [employerCompany, setEmployerCompany] = useState<CompanyProfile | null>(null);
  const [isCompanySetupOpen, setIsCompanySetupOpen] = useState(false);
  const [compName, setCompName] = useState('');
  const [compLogo, setCompLogo] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compWeb, setCompWeb] = useState('');
  const [compLoc, setCompLoc] = useState('Mogadishu');

  const [logoUploading, setLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);

  const handleLogoFileChange = async (file: File) => {
    if (!file) return;

    // Validate type (png, jpg, webp)
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type! Please upload a PNG, JPG, or WebP image.');
      return;
    }

    // Validate size (max 3MB = 3 * 1024 * 1024 bytes)
    const maxSizeBytes = 3 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error('File too large! Max file size limit is 3MB.');
      return;
    }

    try {
      setLogoUploading(true);
      setLogoProgress(10);
      const url = await uploadFile(file, 'company-logos', (prog) => {
        setLogoProgress(Math.max(10, Math.min(prog, 95)));
      });
      setCompLogo(url);
      setLogoProgress(100);
      toast.success('Official corporate logo uploaded successfully!');
    } catch (err) {
      console.error('Logo upload error:', err);
      toast.error('Failed to upload logo. Please try again.');
    } finally {
      setLogoUploading(false);
    }
  };

  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [incomingApps, setIncomingApps] = useState<JobApplication[]>([]);

  // Moderation stats
  const [allPendingJobs, setAllPendingJobs] = useState<Job[]>([]);
  const [allCompanies, setAllCompanies] = useState<CompanyProfile[]>([]);

  // 1. Fetch live jobs
  const fetchLiveJobs = async () => {
    setLoadingJobs(true);
    try {
      const records = await jobService.getJobs({ status: 'approved' });
      setActiveJobs(records);
    } catch (e) {
      toast.error('Error fetching jobs');
      setActiveJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchLiveJobs();
  }, []);

  // 2. Load context specific states
  useEffect(() => {
    if (!user) return;

    // Load candidate info
    jobService.getCandidateProfile(user.uid).then(profile => {
      if (profile) {
        setCandProfile(profile);
        setCandBio(profile.bio || '');
        setCandSkills(profile.skills.join(', '));
        setCandResumeInput(profile.resumeUrl || '');
      }
    });

    jobService.getCandidateApplications(user.uid).then(apps => {
      setCandApps(apps);
    });

    // Load employer info
    jobService.getCompanyByOwnerId(user.uid).then(comp => {
      if (comp) {
        setEmployerCompany(comp);
        setCompName(comp.name);
        setCompLogo(comp.logo);
        setCompDesc(comp.description);
        setCompWeb(comp.website || '');
        setCompLoc(comp.location);
        refreshEmployerJobs();
      }
    });

    // Load Admin data
    if (isAdmin) {
      jobService.getJobs({ status: 'pending' }).then(pending => {
        setAllPendingJobs(pending);
      });
      jobService.getCompanies().then(comps => {
        setAllCompanies(comps);
      });
    }
  }, [user, activeTab, isAdmin]);

  const refreshEmployerJobs = async () => {
    if (!user) return;
    try {
      const list = await jobService.getJobs({ ownerId: user.uid, status: undefined });
      setPostedJobs(list);
      const apps = await jobService.getEmployerApplications(user.uid);
      setIncomingApps(apps);
    } catch {
      toast.error('Error refreshing employer workspace');
    }
  };

  const handleApplySubmit = async () => {
    if (!selectedJob) return;
    if (!applyResume) {
      toast.error('Provide a cloud curriculum vitae (CV) link to apply!');
      return;
    }
    try {
      await jobService.applyForJob({
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        companyId: selectedJob.companyId,
        companyName: selectedJob.companyName,
        candidateName: user?.displayName || 'Applicant',
        candidateEmail: user?.email || '',
        candidatePhone: applyPhone,
        resumeUrl: applyResume,
        coverLetter: applyCoverLetter,
        employerId: selectedJob.ownerId || '',
      });
      toast.success('Your application was submitted securely to the employer!');
      setIsSubmitApplicationOpen(false);
      setApplyResume('');
      setApplyCoverLetter('');
      // refresh candidate submissions
      const apps = await jobService.getCandidateApplications(user!.uid);
      setCandApps(apps);
    } catch {
      toast.error('Submission failed');
    }
  };

  const handleSaveCandProfile = async () => {
    if (!user) return;
    try {
      const skillsArray = candSkills.split(',').map(s => s.trim()).filter(Boolean);
      const updated = {
        displayName: user.displayName || 'Candidate',
        photoURL: user.photoURL || '',
        bio: candBio,
        skills: skillsArray,
        education: candProfile?.education || [],
        experience: candProfile?.experience || [],
        languages: candProfile?.languages || ['Somali', 'English'],
        certifications: candProfile?.certifications || [],
        portfolioLinks: candProfile?.portfolioLinks || [],
        resumeUrl: candResumeInput
      };
      await jobService.updateCandidateProfile(user.uid, updated);
      setCandProfile({ id: user.uid, ...updated, createdAt: new Date() });
      setIsEditCandOpen(false);
      toast.success('Profile summary saved!');
    } catch {
      toast.error('Could not save details');
    }
  };

  const handleRegisterCompany = async () => {
    if (!user) return;
    if (!compName || !compDesc) {
      toast.error('Name & description are required');
      return;
    }
    if (!compLogo) {
      toast.error('Official corporate logo is mandatory! Please upload your brand logo to proceed.');
      return;
    }
    try {
      const data = {
        name: compName,
        logo: compLogo,
        description: compDesc,
        website: compWeb,
        location: compLoc,
        size: '10-50 employees'
      };
      if (employerCompany) {
        await jobService.updateCompany(employerCompany.id, data);
        setEmployerCompany({ ...employerCompany, ...data });
        toast.success('Company workspace configurations saved!');
      } else {
        const id = await jobService.createCompany(data);
        const created = await jobService.getCompanyById(id);
        setEmployerCompany(created);
        toast.success('Corporate brand verified and registered!');
      }
      setIsCompanySetupOpen(false);
    } catch {
      toast.error('Could not register profile');
    }
  };

  const startEditJob = (job: Job) => {
    setEditingJobId(job.id);
    setFormTitle(job.title);
    setFormCategory(job.category);
    setFormLocation(job.location);
    setFormEmployment(job.employmentType);
    setFormWorkplace(job.workplaceType);
    setFormSalaryMin(job.salaryMin || 1000);
    setFormSalaryMax(job.salaryMax || 2500);
    setFormDescription(job.description);
    setFormRequirements(job.requirements || '');
    setFormBenefits(job.benefits || '');
    setFormDeadline(job.deadline || '');
    setFormFeaturedImage(job.featuredImage || '');
    setFormCompanyLogo(job.companyLogo || '');
    setFormIsUrgent(job.isUrgent || false);
    setEmpSubTab('post');
  };

  const cleanJobForm = () => {
    setEditingJobId(null);
    setFormTitle('');
    setFormDescription('');
    setFormRequirements('');
    setFormBenefits('');
    setFormDeadline('');
    setFormFeaturedImage('');
    setFormCompanyLogo('');
    setFormIsUrgent(false);
  };

  const handlePostJob = async (status: 'draft' | 'pending') => {
    if (!employerCompany) {
      toast.error('Setup your corporate profile first!');
      return;
    }
    if (!formTitle || !formDescription) {
      toast.error('Missing job title or role description!');
      return;
    }
    const payload = {
      title: formTitle,
      companyId: employerCompany.id,
      companyName: employerCompany.name,
      companyLogo: formCompanyLogo || employerCompany.logo || '',
      category: formCategory,
      location: formLocation,
      employmentType: formEmployment,
      workplaceType: formWorkplace,
      salaryMin: Number(formSalaryMin),
      salaryMax: Number(formSalaryMax),
      currency: 'USD',
      description: formDescription,
      requirements: formRequirements,
      benefits: formBenefits,
      deadline: formDeadline,
      featuredImage: formFeaturedImage,
      isUrgent: formIsUrgent,
      status: status
    };

    try {
      if (editingJobId) {
        await jobService.updateJob(editingJobId, payload);
        toast.success('Vacancy configuration saved successfully!');
      } else {
        await jobService.createJob(payload);
        toast.success(status === 'draft' ? 'Job saved to drafts' : 'Job submitted for admin vetting!');
      }
      cleanJobForm();
      setEmpSubTab('active');
      refreshEmployerJobs();
      fetchLiveJobs();
    } catch {
      toast.error('Submission failed');
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (window.confirm('Delete this vacancy posting Permanently?')) {
      try {
        await jobService.deleteJob(id);
        toast.success('Job deleted successfully');
        refreshEmployerJobs();
        fetchLiveJobs();
      } catch {
        toast.error('Error deleting job');
      }
    }
  };

  const handleAdminVerifyCompany = async (compId: string, verify: boolean) => {
    try {
      await jobService.updateCompany(compId, {
        isVerified: verify,
        status: verify ? 'approved' : 'rejected'
      });
      toast.success('Company verification state updated');
      const list = await jobService.getCompanies();
      setAllCompanies(list);
    } catch {
      toast.error('Update failed');
    }
  };

  const handleAdminModerateJob = async (id: string, action: 'approved' | 'rejected') => {
    try {
      await jobService.updateJob(id, { status: action });
      toast.success(`Job state approved to ${action}`);
      const list = await jobService.getJobs({ status: 'pending' });
      setAllPendingJobs(list);
      fetchLiveJobs();
    } catch {
      toast.error('Approval failed');
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, candId: string, title: string, status: any) => {
    try {
      await jobService.updateApplicationStatus(appId, status, candId, title);
      toast.success(`Hiring compliance updated: ${status}`);
      refreshEmployerJobs();
    } catch {
      toast.error('Hiring compliance failed');
    }
  };

  // Client filtration
  const filteredJobs = useMemo(() => {
    return activeJobs.filter(item => {
      if (search) {
        const term = search.toLowerCase();
        const matches = item.title.toLowerCase().includes(term) || item.companyName.toLowerCase().includes(term) || item.description.toLowerCase().includes(term);
        if (!matches) return false;
      }
      if (category !== 'All' && item.category !== category) return false;
      if (locFilter !== 'All' && item.location !== locFilter) return false;
      if (workplace !== 'All' && item.workplaceType !== workplace) return false;
      if (employment !== 'All' && item.employmentType !== employment) return false;
      if (urgentOnly && !item.isUrgent) return false;
      return true;
    });
  }, [activeJobs, search, category, locFilter, workplace, employment, urgentOnly]);

  // Employer helper metrics
  const analytics = useMemo(() => {
    const total = postedJobs.length;
    const active = postedJobs.filter(j => j.status === 'approved').length;
    const drafts = postedJobs.filter(j => j.status === 'draft').length;
    const pending = postedJobs.filter(j => j.status === 'pending').length;
    const appsCount = incomingApps.length;
    const hired = incomingApps.filter(a => a.status === 'hired').length;
    const rate = appsCount > 0 ? Math.round((hired / appsCount) * 100) : 0;
    return { total, active, drafts, pending, appsCount, hired, rate };
  }, [postedJobs, incomingApps]);

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-gray-200 pt-28 pb-20 font-sans">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        
        {/* HERO BANNER */}
        <div className="relative mb-12 rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-br from-[#121212] to-black p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A059]/5 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#C5A059] uppercase block mb-3">
              AmaanEstate Verified Jobs & Careers
            </span>
            <h1 className="text-3xl md:text-5xl font-medium tracking-tight mb-4 text-white leading-tight">
              Somalia’s Leading Real-Estate & Construction <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] to-white">Careers Portal</span>
            </h1>
            <p className="text-gray-400 text-xs md:text-sm mb-6 leading-relaxed">
              We eliminate fake listings completely. Every vacancy on AmaanEstate is legally checked and linked to registered companies, licensed survey teams, property brokerage networks, and architectural builders.
            </p>
            
            <div className="flex flex-wrap gap-6 pt-4 border-t border-white/5">
              <div>
                <span className="text-xl md:text-2xl font-bold text-[#C5A059] block">{activeJobs.length}</span>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider block">Live Vacancies</span>
              </div>
              <div>
                <span className="text-xl md:text-2xl font-bold text-white block">100% SECURE</span>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider block">Verified Compliance</span>
              </div>
              {employerCompany?.isVerified && (
                <div>
                  <span className="text-xl md:text-2xl font-bold text-emerald-400 block">PRO BUILDER</span>
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider block">Your Corporate Status</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NAVIGATION SYSTEM */}
        <div className="flex flex-wrap lg:flex-nowrap gap-2 p-1.5 bg-[#121212] border border-white/5 rounded-2xl mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === 'browse' ? 'bg-[#C5A059] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass size={14} /> Explore Openings
          </button>
          
          <button
            onClick={() => {
              if (!user) {
                toast.error('Sign in to launch your candidate hub');
                return;
              }
              setActiveTab('candidate');
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === 'candidate' ? 'bg-[#C5A059] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User size={14} /> Candidate Hub
          </button>

          <button
            onClick={() => {
              if (!user) {
                toast.error('Sign in to manage listings as an employer');
                return;
              }
              setActiveTab('employer');
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === 'employer' ? 'bg-[#C5A059] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building size={14} /> Employer Workspace
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ml-auto ${
                activeTab === 'admin' ? 'bg-red-500 text-white shadow-lg' : 'text-red-400 hover:bg-red-500/10'
              }`}
            >
              <Award size={14} /> Moderation Center
            </button>
          )}
        </div>

        {/* DYNAMIC VIEWS */}
        
        {/* TAB 1: BROWSE REAL JOBS */}
        {activeTab === 'browse' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* SEARCH AND FILTERS PANEL */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-xl relative">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-4 flex items-center gap-2">
                  <SlidersHorizontal size={14} /> Search Constraints
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Keywords</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="e.g. Architect, Surveyor, Agent" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                      />
                      <Search className="absolute right-3 top-2.5 text-gray-500" size={12} />
                    </div>
                  </div>

                  <PremiumSelect
                    label="Sector Class"
                    value={category}
                    onChange={setCategory}
                    options={[{ label: 'All Sectors', value: 'All' }, ...CATEGORIES]}
                    icon={<Briefcase size={14} />}
                  />

                  <PremiumSelect
                    label="Metro Hub"
                    value={locFilter}
                    onChange={setLocFilter}
                    options={[{ label: 'All Cities', value: 'All' }, ...CITIES]}
                    icon={<MapPin size={14} />}
                  />

                  <PremiumSelect
                    label="Workplace Arrangement"
                    value={workplace}
                    onChange={setWorkplace}
                    options={[{ label: 'All Types', value: 'All' }, ...WORKPLACE_TYPES]}
                    icon={<Building size={14} />}
                  />

                  <PremiumSelect
                    label="Employment Terms"
                    value={employment}
                    onChange={setEmployment}
                    options={[{ label: 'All Contracts', value: 'All' }, ...EMPLOYMENT_TYPES]}
                    icon={<Clock size={14} />}
                  />

                  <div className="pt-2 border-t border-white/5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={urgentOnly}
                        onChange={(e) => setUrgentOnly(e.target.checked)}
                        className="accent-[#C5A059]" 
                      />
                      <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">🔥 Urgent Only</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Verified Post-a-job Promotion widget */}
              <div className="bg-gradient-to-br from-[#1c1917] to-black border border-[#C5A059]/10 rounded-2xl p-6 shadow-md text-center">
                <p className="text-xs font-bold text-[#C5A059] mb-1">RECRUITING IN SOMALIA?</p>
                <p className="text-[11px] text-gray-400 mb-4">Post construction tasks, corporate roles, and surveyor schedules directly.</p>
                <Button 
                  onClick={() => {
                    if(!user) {
                      toast.error('Sign in to configure employer space');
                      return;
                    }
                    setActiveTab('employer');
                    setEmpSubTab('post');
                  }}
                  className="w-full bg-transparent hover:bg-white hover:text-black border border-white/10 text-white text-xs uppercase font-serif"
                >
                  Post a Job Opening
                </Button>
              </div>
            </div>

            {/* JOBS LOOP GRID */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                  {filteredJobs.length} Careers Found
                </span>
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">
                  ● Real-time database vetting
                </span>
              </div>

              {loadingJobs ? (
                <div className="text-center py-20 bg-[#111] rounded-3xl border border-white/5">
                  <div className="animate-spin w-8 h-8 rounded-full border-2 border-[#C5A059] border-t-transparent mx-auto mb-4" />
                  <p className="text-xs uppercase tracking-widest text-[#C5A059]">Refining real vacancies...</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-24 bg-[#111]/30 rounded-3xl border border-white/5 px-6">
                  <Briefcase size={40} className="text-[#C5A059] mx-auto mb-4 opacity-40" />
                  <h4 className="font-medium text-lg mb-2 text-white">No active openings available yet.</h4>
                  <p className="text-gray-400 text-xs max-w-md mx-auto leading-relaxed">
                    AmaanEstate ensures only genuine openings are listed. There are currently no listings match your query. Try resetting filters or submit your query later.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredJobs.map(job => (
                    <div 
                      key={job.id} 
                      className="group bg-[#111] border border-white/5 hover:border-[#C5A059]/40 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Status elements */}
                        <div className="flex gap-2 mb-4">
                          {job.isUrgent && (
                            <span className="bg-red-500/10 text-red-400 text-[8px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full border border-red-500/20">
                              Urgent
                            </span>
                          )}
                          <span className="bg-white/5 text-gray-300 text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full capitalize">
                            {job.workplaceType}
                          </span>
                        </div>

                        {/* Company logo title */}
                        <div className="flex items-start gap-4 mb-4">
                          <img 
                            src={job.companyLogo || DEFAULT_COMP_LOGO} 
                            alt={job.companyName || 'Company'}
                            className="w-12 h-12 object-cover rounded-xl border border-white/10 shrink-0" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = DEFAULT_COMP_LOGO;
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white group-hover:text-[#C5A059] transition-colors truncate">{job.title}</h4>
                            <span className="text-xs text-gray-400 block truncate">{job.companyName}</span>
                          </div>
                        </div>

                        <p className="text-gray-400 text-xs line-clamp-3 leading-relaxed mb-4">{job.description}</p>
                      </div>

                      <div>
                        {/* Meta lines */}
                        <div className="space-y-1.5 border-t border-white/5 pt-4 mb-4 text-[11px] text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin size={11} className="text-[#C5A059]" /> {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={11} className="text-[#C5A059]" /> <span className="uppercase">{job.employmentType}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign size={11} className="text-[#C5A059]" /> 
                            {job.salaryMin && job.salaryMax ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : 'Negotiable'}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => setSelectedJob(job)}
                            className="flex-1 bg-white/[0.03] hover:bg-white hover:text-black border border-white/10 text-xs h-9 font-serif"
                          >
                            Details
                          </Button>
                          <button
                            onClick={() => {
                              if (!user) {
                                toast.error('Sign in to bookmarks postings');
                                return;
                              }
                              setSavedJobIds(prev => prev.includes(job.id) ? prev.filter(i => i !== job.id) : [...prev, job.id]);
                              toast.info(savedJobIds.includes(job.id) ? 'Deleted Bookmark' : 'Subscribed Bookmark!');
                            }}
                            className={`p-2 rounded-xl border transition-all ${
                              savedJobIds.includes(job.id) ? 'bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/30' : 'border-white/10 text-gray-500'
                            }`}
                          >
                            <Bookmark size={14} className={savedJobIds.includes(job.id) ? 'fill-current' : ''} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CANDIDATE HUB */}
        {activeTab === 'candidate' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#111] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 blur-2xl rounded-full pointer-events-none" />
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{candProfile?.displayName || user?.displayName || 'Applicant'}</h3>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Premium Account Member</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Career Biography</span>
                    <p className="text-gray-300 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                      {candProfile?.bio || 'Introduce your professional background and property surveying or construction experience to stand out.'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Key Competence Areas</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {candProfile?.skills && candProfile.skills.length > 0 ? (
                        candProfile.skills.map(s => (
                          <span key={s} className="bg-white/5 border border-white/10 text-white/80 text-[10px] uppercase px-2 py-0.5 rounded-md">
                            {s}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-[11px] italic">No skills configured yet</p>
                      )}
                    </div>
                  </div>

                  {candProfile?.resumeUrl && (
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-[#C5A059]" />
                        <span className="text-xs text-gray-400 truncate max-w-[150px]">Active Cloud CV Profile</span>
                      </div>
                      <a 
                        href={candProfile.resumeUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-[#C5A059] uppercase font-bold hover:underline inline-flex items-center gap-0.5"
                      >
                        Preview <ExternalLink size={10} />
                      </a>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      setCandBio(candProfile?.bio || '');
                      setCandSkills(candProfile?.skills.join(', ') || '');
                      setCandResumeInput(candProfile?.resumeUrl || '');
                      setIsEditCandOpen(true);
                    }}
                    className="w-full bg-[#C5A059] hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-all h-10 rounded-xl"
                  >
                    Edit CV Profile details
                  </Button>
                </div>
              </div>

              {/* Saved bookmarks */}
              <div className="bg-[#111]/40 border border-white/5 rounded-2xl p-6 shadow-md">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] mb-4">Saved Openings</h4>
                {savedJobIds.length === 0 ? (
                  <p className="text-xs text-gray-500">Your bookmarked positions appear here for tracking.</p>
                ) : (
                  <div className="space-y-2">
                    {savedJobIds.map(id => {
                      const matched = activeJobs.find(x => x.id === id);
                      if (!matched) return null;
                      return (
                        <div 
                          key={id}
                          onClick={() => setSelectedJob(matched)}
                          className="p-2.5 bg-black/40 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer flex justify-between items-center"
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">{matched.title}</span>
                            <span className="text-[10px] text-gray-500 block truncate">{matched.companyName}</span>
                          </div>
                          <ChevronRight size={12} className="text-gray-500" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#111] border border-white/5 rounded-3xl p-6 shadow-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-6">
                  Your Job Applications Portfolio
                </h3>

                {candApps.length === 0 ? (
                  <div className="text-center py-16">
                    <Briefcase size={36} className="text-gray-500 mx-auto mb-2 opacity-30" />
                    <p className="text-sm text-gray-400">No submissions recorded.</p>
                    <p className="text-xs text-gray-500 mt-1">Submit your profile to approved firms and monitor evaluation feedback here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {candApps.map(app => (
                      <div key={app.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-white mb-0.5">{app.jobTitle}</h4>
                          <span className="text-xs text-[#C5A059] block mb-2">{app.companyName}</span>
                          <span className="text-[10px] text-gray-500 uppercase block">Applied: {new Date(app.createdAt?.seconds ? app.createdAt.seconds * 1000 : app.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className="text-[9px] text-gray-500 uppercase block mb-1">Process status</span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                            app.status === 'hired' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            app.status === 'shortlisted' ? 'bg-indigo-505/10 text-indigo-400 border-indigo-500/20' :
                            app.status === 'rejected' ? 'bg-rose-500/10 text-red-400 border-red-500/20' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EMPLOYER WORKSPACE */}
        {activeTab === 'employer' && (
          <div>
            {!employerCompany ? (
              <div className="text-center py-24 bg-[#111]/30 border border-white/5 rounded-3xl max-w-2xl mx-auto p-8">
                <Building size={48} className="text-[#C5A059] mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">Configure Corporate Recruiting Workspace</h3>
                <p className="text-gray-400 text-xs mb-8 leading-relaxed">
                  Post real real-estate contracts, construction schedules, property design roles, or broker listings. Establish your formal agency details first.
                </p>
                <Button
                  onClick={() => setIsCompanySetupOpen(true)}
                  className="bg-[#C5A059] hover:bg-white text-black text-xs font-bold uppercase tracking-widest px-8 h-12 rounded-xl"
                >
                  Configure Profile <Plus size={14} className="ml-1" />
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Employer Side Navigation & Core widgets */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-[#111] border border-white/5 rounded-3xl p-6 shadow-xl text-center">
                    <img 
                      src={employerCompany.logo || DEFAULT_COMP_LOGO} 
                      alt={employerCompany.name} 
                      className="w-16 h-16 rounded-2xl object-cover border border-white/10 mx-auto mb-3"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_COMP_LOGO;
                      }}
                    />
                    <h3 className="font-bold text-base text-white flex items-center justify-center gap-1">
                      {employerCompany.name}
                      {employerCompany.isVerified && <CheckCircle className="text-emerald-400" size={14} />}
                    </h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest block mb-4">Location: {employerCompany.location}</p>
                    
                    {/* Status Alert */}
                    {!employerCompany.isVerified ? (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6 text-left">
                        <span className="text-[9px] font-bold uppercase text-amber-400 block mb-0.5">Verification Required</span>
                        <p className="text-[11px] text-gray-400 leading-normal">
                          Your workspace profile is unverified. To publish listings onto the general public channels, request corporate credential verification.
                        </p>
                        <Button 
                          onClick={async () => {
                            await jobService.updateCompany(employerCompany.id, { status: 'pending' });
                            setEmployerCompany({ ...employerCompany, status: 'pending' });
                            toast.success('Credential verification review requested!');
                          }}
                          disabled={employerCompany.status === 'pending'}
                          className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-black h-8 rounded-lg text-[9px] font-bold uppercase tracking-widest"
                        >
                          {employerCompany.status === 'pending' ? 'Pending Review...' : 'Send Verification Request'}
                        </Button>
                      </div>
                    ) : (
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6 flex items-center gap-1.5 justify-center">
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-[9px] font-extrabold text-emerald-400 tracking-wider uppercase">Verified Corporate Recruiter</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5 text-left border-t border-white/5 pt-4">
                      {[
                        { id: 'analytics', label: 'Dashboard Overview', icon: Compass },
                        { id: 'post', label: 'Post New Job Form', icon: Plus },
                        { id: 'active', label: 'Active approved Listings', icon: CheckCircle },
                        { id: 'drafts', label: 'Drafts & Under-review', icon: AlertCircle },
                        { id: 'applicants', label: 'Manage Candidates', icon: Users },
                        { id: 'company', label: 'Edit Company Profile', icon: Building },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setEmpSubTab(tab.id as any);
                            if (tab.id === 'post' && !editingJobId) {
                              cleanJobForm();
                            }
                          }}
                          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                            empSubTab === tab.id ? 'bg-[#C5A059]/15 text-[#C5A059]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <tab.icon size={13} /> {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sub Panel Switcher */}
                <div className="lg:col-span-3 space-y-6">
                  
                  {/* SUB TAB: ANALYTICAL HIGHLIGHTS */}
                  {empSubTab === 'analytics' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[#111] border border-white/5 p-4 rounded-xl">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Corporate jobs</span>
                          <span className="text-xl font-bold text-white block">{analytics.total}</span>
                        </div>
                        <div className="bg-[#111] border border-white/5 p-4 rounded-xl">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Active Openings</span>
                          <span className="text-xl font-bold text-emerald-400 block">{analytics.active}</span>
                        </div>
                        <div className="bg-[#111] border border-white/5 p-4 rounded-xl">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Total Applications</span>
                          <span className="text-xl font-bold text-[#C5A059] block">{analytics.appsCount}</span>
                        </div>
                        <div className="bg-[#111] border border-white/5 p-4 rounded-xl">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Hiring Rate</span>
                          <span className="text-xl font-bold text-white block">{analytics.rate}%</span>
                        </div>
                      </div>

                      <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Live Recruiting Efficiency Overview</h4>
                        {incomingApps.length === 0 ? (
                          <p className="text-xs text-gray-500">Analytics update in real-time as candidates submit documents.</p>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Shortlisted Ratio</span>
                                <span>{Math.round((incomingApps.filter(a => a.status === 'shortlisted').length / incomingApps.length) * 100) || 0}%</span>
                              </div>
                              <div className="w-full bg-black h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-indigo-500 h-2" 
                                  style={{ width: `${(incomingApps.filter(a => a.status === 'shortlisted').length / incomingApps.length) * 100}%` }} 
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Contract Conversion / Hired Ratio</span>
                                <span>{analytics.rate}%</span>
                              </div>
                              <div className="w-full bg-black h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-[#C5A059] h-2" 
                                  style={{ width: `${analytics.rate}%` }} 
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUB TAB: CREATE / EDIT WORKFLOW FORM */}
                  {empSubTab === 'post' && (
                    <div className="bg-[#111] border border-white/5 rounded-3xl p-6 shadow-xl">
                      <h3 className="font-bold text-base text-white mb-4">
                        {editingJobId ? 'Edit Vacancy Parameters' : 'Broadcast Vetted Career Vacancy'}
                      </h3>

                      {!employerCompany.isVerified && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-6 flex items-start gap-3">
                          <ShieldAlert className="text-amber-400 shrink-0 mt-0.5" size={16} />
                          <div>
                            <span className="text-xs text-amber-400 font-bold block mb-0.5">Verification Notice</span>
                            <p className="text-xs text-gray-300">
                             While you can set up postings, unverified companies’ postings will stay in *Draft* mode until corporate settings are vetted.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Vacancy job Title*</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="e.g. Senior Construction Engineer" 
                              value={formTitle}
                              onChange={(e) => setFormTitle(e.target.value)}
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                            />
                          </div>
                          <PremiumSelect
                            label="Industrial Category*"
                            value={formCategory}
                            onChange={setFormCategory}
                            options={CATEGORIES}
                            icon={<Briefcase size={14} />}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <PremiumSelect
                            label="Metro Center Location*"
                            value={formLocation}
                            onChange={setFormLocation}
                            options={CITIES}
                            icon={<MapPin size={14} />}
                          />
                          <PremiumSelect
                            label="Employment Type*"
                            value={formEmployment}
                            onChange={(val) => setFormEmployment(val as any)}
                            options={EMPLOYMENT_TYPES}
                            icon={<Clock size={14} />}
                          />
                          <PremiumSelect
                            label="Workplace Style*"
                            value={formWorkplace}
                            onChange={(val) => setFormWorkplace(val as any)}
                            options={WORKPLACE_TYPES}
                            icon={<Building size={14} />}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Min Budget (USD / Monthly)*</label>
                            <input 
                              type="number" 
                              value={formSalaryMin}
                              onChange={(e) => setFormSalaryMin(Number(e.target.value))}
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Max Budget (USD / Monthly)*</label>
                            <input 
                              type="number" 
                              value={formSalaryMax}
                              onChange={(e) => setFormSalaryMax(Number(e.target.value))}
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Role Description & Context*</label>
                          <textarea 
                            rows={4} 
                            placeholder="Detail daily tasks, organizational context, and schedules." 
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-3 text-xs focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Requirements (Bullet list prefered)</label>
                          <textarea 
                            rows={3} 
                            placeholder="• Bachelor's Degree in Civil Engineering&#10;• 4+ cadastral map survey experience" 
                            value={formRequirements}
                            onChange={(e) => setFormRequirements(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-3 text-xs focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Organizational Benefits</label>
                          <textarea 
                            rows={2} 
                            placeholder="• Health insurance&#10;• Transport allowance" 
                            value={formBenefits}
                            onChange={(e) => setFormBenefits(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-3 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Application Deadline</label>
                            <input 
                              type="date" 
                              value={formDeadline}
                              onChange={(e) => setFormDeadline(e.target.value)}
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Featured Banner URL</label>
                            <input 
                              type="url" 
                              placeholder="https://images.unsplash.com/..." 
                              value={formFeaturedImage}
                              onChange={(e) => setFormFeaturedImage(e.target.value)}
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 py-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={formIsUrgent}
                              onChange={(e) => setFormIsUrgent(e.target.checked)}
                              className="accent-[#C5A059]" 
                            />
                            <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">Mark as Urgent Hiring</span>
                          </label>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button 
                            onClick={cleanJobForm}
                            className="bg-white/5 hover:bg-white/10 text-white flex-1 h-10 rounded-xl uppercase tracking-wider font-semibold"
                          >
                            Reset Form
                          </Button>
                          <Button 
                            onClick={() => handlePostJob('draft')}
                            className="bg-zinc-800 hover:bg-zinc-700 text-gray-300 flex-1 h-10 rounded-xl uppercase tracking-wider font-semibold"
                          >
                            Save Draft
                          </Button>
                          <Button 
                            onClick={() => handlePostJob('pending')}
                            disabled={!employerCompany.isVerified && !bypassVerification}
                            className="bg-[#C5A059] hover:bg-white text-black flex-1 h-10 rounded-xl uppercase tracking-wider font-bold"
                          >
                            {editingJobId ? 'Apply Changes' : 'Publish'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ACTIVE COMPLIANT LISTINGS */}
                  {empSubTab === 'active' && (
                    <div className="bg-[#111] border border-white/5 rounded-3xl p-6 shadow-xl">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-4">Approved & Active Listings</h4>
                      
                      {postedJobs.filter(j => j.status === 'approved').length === 0 ? (
                        <p className="text-xs text-gray-500 py-4">No published listings on general feed panels. Pending review vacancies show up in review tab.</p>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {postedJobs.filter(j => j.status === 'approved').map(item => (
                            <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                              <div>
                                <span className="text-xs font-bold text-white block">{item.title}</span>
                                <span className="text-[10px] text-gray-500 uppercase block">{item.location} | {item.category}</span>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <button 
                                  onClick={() => startEditJob(item)}
                                  className="p-2 rounded-lg bg-indigo-505/10 hover:bg-white text-indigo-400 hover:text-black transition-all"
                                  title="Edit role"
                                >
                                  <Edit size={12} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteJob(item.id)}
                                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 transition-all"
                                  title="Remove role"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* DRAFTS AND REVIEW PANEL */}
                  {empSubTab === 'drafts' && (
                    <div className="bg-[#111] border border-white/5 rounded-3xl p-6 shadow-xl">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-4">Drafts & Under-Review Listings</h4>
                      
                      {postedJobs.filter(j => j.status !== 'approved').length === 0 ? (
                        <p className="text-xs text-gray-500 py-4">No pending review or draft jobs found.</p>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {postedJobs.filter(j => j.status !== 'approved').map(item => (
                            <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                              <div>
                                <span className="text-xs font-bold text-white block">{item.title}</span>
                                <span className="text-[10px] text-gray-500 block uppercase">
                                  State: <span className={item.status === 'pending' ? 'text-amber-400' : 'text-gray-400'}>{item.status}</span>
                                </span>
                              </div>
                              <div className="flex gap-2 shrink-0 items-center">
                                {item.status === 'draft' && (employerCompany.isVerified || bypassVerification) && (
                                  <button 
                                    onClick={async () => {
                                      await jobService.updateJob(item.id, { status: 'pending' });
                                      toast.success('Listing broadcast to system admin review!');
                                      refreshEmployerJobs();
                                    }}
                                    className="px-2.5 py-1 text-[9px] font-bold uppercase bg-amber-500/20 text-amber-400 rounded-lg"
                                  >
                                    Submit Review
                                  </button>
                                )}
                                <button 
                                  onClick={() => startEditJob(item)}
                                  className="p-2 rounded-lg bg-white/5 hover:bg-white hover:text-black transition-all"
                                >
                                  <Edit size={12} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteJob(item.id)}
                                  className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500 text-red-400 transition-all"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB TAB: MANAGE APPLICANTS COMPLIANCE */}
                  {empSubTab === 'applicants' && (
                    <div className="bg-[#111] border border-white/5 rounded-3xl p-6 shadow-xl">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-6">Candidate Applications Screen Hub</h4>
                      
                      {incomingApps.length === 0 ? (
                        <div className="text-center py-12">
                          <Users size={32} className="text-gray-500 mx-auto mb-2 opacity-30" />
                          <p className="text-xs text-gray-500">No applications received yet for your postings.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {incomingApps.map(app => (
                            <div key={app.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-3 mb-3">
                                <div>
                                  <span className="text-xs font-bold text-white block">{app.candidateName}</span>
                                  <span className="text-[10px] text-gray-500 block">Applied for: {app.jobTitle}</span>
                                </div>
                                <div className="flex gap-1.5 shrink-0 mt-2 md:mt-0">
                                  {app.resumeUrl && (
                                    <a 
                                      href={app.resumeUrl} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="px-2.5 py-1 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 rounded-lg text-[9px] font-bold uppercase hover:bg-white hover:text-black transition-all"
                                    >
                                      Curriculum Vitae <ExternalLink size={9} className="inline ml-1" />
                                    </a>
                                  )}
                                </div>
                              </div>

                              {app.coverLetter && (
                                <p className="text-xs text-gray-400 bg-black/40 border border-white/5 p-3 rounded-lg leading-normal mb-4">
                                  {app.coverLetter}
                                </p>
                              )}

                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="text-[10px]">Contact Info: <span className="text-gray-300">{app.candidatePhone || app.candidateEmail}</span></span>
                                
                                <div className="flex gap-1.5 items-center">
                                  <span className="text-[9px] uppercase font-mono mr-1">Triage:</span>
                                  {[
                                    { s: 'shortlisted', bg: 'hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/10' },
                                    { s: 'hired', bg: 'hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/10' },
                                    { s: 'rejected', bg: 'hover:bg-red-500/20 text-red-400 border-red-500/10' },
                                  ].map(act => (
                                    <button
                                      key={act.s}
                                      onClick={() => handleUpdateApplicationStatus(app.id, app.candidateId, app.jobTitle, act.s as any)}
                                      className={`px-2 py-0.5 border text-[9px] rounded-md uppercase font-bold transition-all capitalize ${
                                        app.status === act.s ? 'bg-white text-black font-extrabold border-transparent' : act.bg
                                      }`}
                                    >
                                      {act.s}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CORPORATE SECTOR SETTINGS */}
                  {empSubTab === 'company' && (
                    <div className="bg-[#111] border border-white/5 rounded-3xl p-6 shadow-xl text-xs">
                      <h4 className="font-bold text-sm text-white mb-4">Corporate Settings & Workspace Profile</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Company / Agency Name*</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Amaan Estate Brokers" 
                            value={compName}
                            onChange={(e) => setCompName(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Brand Logo Image Link</label>
                          <input 
                            type="url" 
                            placeholder="https://images.unsplash.com/..." 
                            value={compLogo}
                            onChange={(e) => setCompLogo(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Describe Industry/Operation Focus*</label>
                          <textarea 
                            rows={3} 
                            placeholder="We provide executive residential sales across the Mogadishu shoreline..."
                            value={compDesc}
                            onChange={(e) => setCompDesc(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Corporate Website URL</label>
                          <input 
                            type="url" 
                            placeholder="https://yourindustry.com" 
                            value={compWeb}
                            onChange={(e) => setCompWeb(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Corporate Headquarters Location</label>
                          <input 
                            type="text" 
                            placeholder="Mogadishu, Somalia" 
                            value={compLoc}
                            onChange={(e) => setCompLoc(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>

                        <Button 
                          onClick={handleRegisterCompany}
                          className="bg-[#C5A059] hover:bg-white text-black w-full h-11 rounded-xl text-xs uppercase font-extrabold"
                        >
                          Save Corporate configuration
                        </Button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MODERATION DASHBOARD */}
        {activeTab === 'admin' && isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* PENDING JOBS REVIEW */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-6 shadow-xl">
              <h3 className="font-bold text-sm text-white mb-6 uppercase tracking-wider">
                Pending Jobs Moderation queue ({allPendingJobs.length})
              </h3>

              {allPendingJobs.length === 0 ? (
                <p className="text-xs text-gray-500 py-6 text-center">No pending vetting vacancies in queue.</p>
              ) : (
                <div className="space-y-4">
                  {allPendingJobs.map(pend => (
                    <div key={pend.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-bold text-white block">{pend.title}</span>
                          <span className="text-[10px] text-[#C5A059] uppercase block">{pend.companyName} ({pend.location})</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 leading-normal line-clamp-3 mb-4">{pend.description}</p>
                      
                      <div className="flex gap-2 justify-end pt-2 border-t border-white/5">
                        <button 
                          onClick={() => handleAdminModerateJob(pend.id, 'rejected')}
                          className="px-3 py-1.5 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleAdminModerateJob(pend.id, 'approved')}
                          className="px-3 py-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                        >
                          Approve & Publish
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MANAGE COMPANIES VERIFICATION */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-6 shadow-xl">
              <h3 className="font-bold text-sm text-white mb-6 uppercase tracking-wider">
                Corporate Credentials Vetting ({allCompanies.filter(c => c.status === 'pending' || !c.isVerified).length})
              </h3>

              {allCompanies.filter(c => c.status === 'pending' || !c.isVerified).length === 0 ? (
                <p className="text-xs text-gray-500 py-6 text-center">No pending verification requests.</p>
              ) : (
                <div className="space-y-4">
                  {allCompanies.filter(c => c.status === 'pending' || !c.isVerified).map(c => (
                    <div key={c.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-white block">{c.name}</span>
                        <span className="text-[10px] text-gray-400 block">{c.location} | {c.website}</span>
                        <p className="text-xs text-gray-500 leading-normal mt-1 max-w-sm line-clamp-2">{c.description}</p>
                      </div>

                      <div className="shrink-0 flex gap-1.5">
                        <button 
                          onClick={() => handleAdminVerifyCompany(c.id, false)}
                          className="p-1 px-2.5 bg-red-500/10 text-red-400 rounded-lg text-[10px] font-bold border border-red-500/20"
                        >
                          Deny
                        </button>
                        <button 
                          onClick={() => handleAdminVerifyCompany(c.id, true)}
                          className="p-1 px-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold border border-emerald-500/20"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODAL: SELECTED JOB SLIDE OVER DETAILS */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[99999] overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 15 }} 
              className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative my-8"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <img 
                    src={selectedJob.companyLogo || DEFAULT_COMP_LOGO} 
                    alt={selectedJob.companyName || 'Company'} 
                    className="w-14 h-14 object-cover rounded-2xl border border-white/10"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_COMP_LOGO;
                    }}
                  />
                  <div>
                    <h3 className="font-bold text-lg text-white font-serif">{selectedJob.title}</h3>
                    <p className="text-xs text-[#C5A059]">{selectedJob.companyName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedJob(null)} 
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs uppercase cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Badges overview */}
              <div className="flex flex-wrap gap-2 mb-6 text-[10px] font-mono">
                <span className="bg-white/5 border border-white/10 text-white/80 px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <MapPin size={10} /> {selectedJob.location}
                </span>
                <span className="bg-[#C5A059]/10 border border-[#C5A059]/20 text-[#C5A059] px-3 py-1 rounded-full inline-flex items-center gap-1 uppercase">
                  <Clock size={10} /> {selectedJob.employmentType}
                </span>
                <span className="bg-white/5 border border-white/10 text-white/80 px-3 py-1 rounded-full">
                  💰 {selectedJob.salaryMin && selectedJob.salaryMax ? `$${selectedJob.salaryMin.toLocaleString()} - $${selectedJob.salaryMax.toLocaleString()}` : 'Negotiable'}
                </span>
                {selectedJob.deadline && (
                  <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-full">
                    Deadline: {selectedJob.deadline}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-3 mb-6 scroll-smooth">
                {selectedJob.featuredImage && (
                  <img 
                    src={selectedJob.featuredImage} 
                    alt="" 
                    className="w-full h-44 object-cover rounded-2xl border border-white/5 mb-2" 
                  />
                )}

                <div>
                  <span className="text-[9px] text-[#C5A059] uppercase block mb-1.5 font-bold tracking-widest font-mono">Job Description</span>
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line bg-black/40 p-4 border border-white/5 rounded-2xl">
                    {selectedJob.description}
                  </p>
                </div>

                {selectedJob.requirements && (
                  <div>
                    <span className="text-[9px] text-[#C5A059] uppercase block mb-1.5 font-bold tracking-widest font-mono">Requirements & Prerequisites</span>
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line bg-black/40 p-4 border border-white/5 rounded-2xl">
                      {selectedJob.requirements}
                    </p>
                  </div>
                )}

                {selectedJob.benefits && (
                  <div>
                    <span className="text-[9px] text-[#C5A059] uppercase block mb-1.5 font-bold tracking-widest font-mono">Benefits & Compensations</span>
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line bg-black/40 p-4 border border-white/5 rounded-2xl">
                      {selectedJob.benefits}
                    </p>
                  </div>
                )}

                <div className="p-3.5 bg-[#C5A059]/5 border border-[#C5A059]/20 rounded-2xl flex gap-3 text-xs">
                  <AlertCircle className="text-[#C5A059] shrink-0 mt-0.5" size={14} />
                  <div>
                    <span className="text-[9px] text-[#C5A059] font-bold block mb-0.5 uppercase tracking-wider">Amaan Compliance Standard</span>
                    <p className="text-gray-400 leading-normal text-[11px]">
                     This vacancy aligns with approved construction or brokerage licenses. Evaluation is guaranteed within 48 business hours of CV packet drop.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-white/5 flex gap-4">
                <Button
                  onClick={() => {
                    if (!user) {
                      toast.error('Sign in to submit your CV and application profile!');
                      return;
                    }
                    setApplyResume(candProfile?.resumeUrl || '');
                    setIsSubmitApplicationOpen(true);
                  }}
                  className="w-full bg-[#C5A059] hover:bg-white text-black text-xs font-bold uppercase tracking-wider h-12 rounded-xl"
                >
                  Quick Submit CV Package
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: QUICK APPLICATION FORM */}
      <AnimatePresence>
        {isSubmitApplicationOpen && selectedJob && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[999999]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-[#181818] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl"
            >
              <h3 className="text-base font-bold text-white mb-2">Apply for "{selectedJob.title}"</h3>
              <p className="text-gray-400 text-xs mb-5">
                Your career parameters and registered CV will be dispatched immediately to the hiring coordinators at {selectedJob.companyName}.
              </p>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Direct Whatsapp / Contact Line*</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. +252 61..." 
                    value={applyPhone}
                    onChange={(e) => setApplyPhone(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Cloud Resume / CV Link (PDF/Google Drive)*</label>
                  <input 
                    type="url" 
                    required 
                    placeholder="https://drive.google.com/..." 
                    value={applyResume}
                    onChange={(e) => setApplyResume(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Introduction Cover Note (Optional)</label>
                  <textarea 
                    rows={3} 
                    placeholder="Briefly pitch why your background fits this role requirements..." 
                    value={applyCoverLetter}
                    onChange={(e) => setApplyCoverLetter(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-3 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => setIsSubmitApplicationOpen(false)}
                    className="bg-white/5 hover:bg-white/10 text-white flex-1 h-10 rounded-xl uppercase tracking-wider"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleApplySubmit}
                    className="bg-[#C5A059] hover:bg-white text-black flex-1 h-10 rounded-xl uppercase tracking-wider font-bold"
                  >
                    Confirm Drop
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CANDIDATE COVER PROFILE EDIT */}
      <AnimatePresence>
        {isEditCandOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-[#151515] border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-xl"
            >
              <h3 className="font-bold text-base text-white mb-4">Edit Core Candidate Parameters</h3>
              
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Career Bio Summary</label>
                  <textarea 
                    rows={3} 
                    placeholder="We summarize your credentials here..."
                    value={candBio}
                    onChange={(e) => setCandBio(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Capability tags (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="BIM Revit, AutoCAD, Surveying..."
                    value={candSkills}
                    onChange={(e) => setCandSkills(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Cloud Resume/CV Link*</label>
                  <input 
                    type="url" 
                    placeholder="https://drive.google.com/..."
                    value={candResumeInput}
                    onChange={(e) => setCandResumeInput(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => setIsEditCandOpen(false)}
                    className="bg-white/5 text-white flex-1 h-9 rounded-lg uppercase text-[10px]"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveCandProfile}
                    className="bg-[#C5A059] text-black flex-1 h-9 rounded-lg uppercase text-[10px] font-bold"
                  >
                    Save Biography
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CORPORATE SETTINGS TRIGGER */}
      <AnimatePresence>
        {isCompanySetupOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-[#151515] border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-xl"
            >
              <h3 className="font-bold text-base text-white mb-4">Amaan Corporate Credentials Workspace</h3>
              
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Agency Name*</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Amaan Luxury Builders"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1.5">Official Corporate Logo*</label>
                  
                  {compLogo ? (
                    <div className="relative group rounded-2xl overflow-hidden aspect-square w-24 h-24 border border-[#C5A059]/30 bg-white/5 mx-auto">
                      <img 
                        src={compLogo} 
                        alt="Company Logo Preview" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/85 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setCompLogo('')}
                          className="text-red-400 text-[10px] font-bold hover:text-red-300 uppercase transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-24 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#C5A059]/40 bg-white/5 transition-colors cursor-pointer text-center p-3 relative">
                      {logoUploading ? (
                        <div className="space-y-2 w-full px-4">
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#C5A059] h-full transition-all duration-300" style={{ width: `${logoProgress}%` }} />
                          </div>
                          <p className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider">{logoProgress}% Uploading...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <Upload size={18} className="text-white/30 mb-1.5" />
                          <p className="text-[11px] font-semibold text-white/60">Upload Logo Image</p>
                          <p className="text-[9px] text-white/30 mt-0.5">PNG, JPG, WebP (Max 3MB)</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg, image/webp" 
                        className="hidden" 
                        disabled={logoUploading}
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleLogoFileChange(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  )}
                  {compLogo && (
                    <p className="text-[10px] text-[#C5A059] text-center mt-1.5 font-medium flex items-center justify-center gap-1">
                      <CheckCircle size={10} /> Logo uploaded & verified
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">About Focus Description*</label>
                  <textarea 
                    rows={3} 
                    placeholder="Focus description..."
                    value={compDesc}
                    onChange={(e) => setCompDesc(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-3 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Website URL</label>
                  <input 
                    type="url" 
                    placeholder="https://..."
                    value={compWeb}
                    onChange={(e) => setCompWeb(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Metro Center</label>
                  <input 
                    type="text" 
                    placeholder="Mogadishu"
                    value={compLoc}
                    onChange={(e) => setCompLoc(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => setIsCompanySetupOpen(false)}
                    className="bg-white/5 text-white flex-1 h-9 rounded-lg uppercase text-[10px]"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleRegisterCompany}
                    disabled={logoUploading || !compLogo}
                    className="bg-[#C5A059] hover:bg-[#C5A059]/90 text-black flex-1 h-9 rounded-lg uppercase text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {logoUploading ? 'Uploading...' : 'Register Company'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
