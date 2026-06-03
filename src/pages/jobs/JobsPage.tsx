import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, MapPin, Clock, DollarSign, Search, Building, User, FileText, 
  CheckCircle, Plus, AlertCircle, ChevronRight, ExternalLink, SlidersHorizontal, 
  Bookmark, Trash2, Calendar, Compass, Edit, Users, ShieldAlert, Check, X, Award,
  Upload, ChevronDown, ChevronUp, MessageSquare, Phone
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

// Fallback logo generator for absolute premium feel
const BrandLogoFallback = ({ name, size = 'md' }: { name?: string; size?: 'sm' | 'md' | 'lg' }) => {
  const initial = name ? name.charAt(0).toUpperCase() : 'A';
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs rounded-lg',
    md: 'w-14 h-14 text-sm rounded-xl',
    lg: 'w-16 h-16 text-lg rounded-2xl',
  };
  return (
    <div className={`flex-shrink-0 bg-neutral-900 border border-[#C5A059]/30 text-[#C5A059] flex items-center justify-center font-display font-black shadow-lg uppercase select-none ${sizeClasses[size]}`}>
      {initial}
    </div>
  );
};

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

  const [activeTab, setActiveTab] = useState<'browse' | 'candidate' | 'employer' | 'admin'>('browse');
  const [empSubTab, setEmpSubTab] = useState<'analytics' | 'post' | 'active' | 'drafts' | 'applicants' | 'company'>('analytics');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [locFilter, setLocFilter] = useState('All');
  const [workplace, setWorkplace] = useState('All');
  const [employment, setEmployment] = useState('All');
  const [urgentOnly, setUrgentOnly] = useState(false);

  // Firestore Live Data
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Modal & Application States
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isSubmitApplicationOpen, setIsSubmitApplicationOpen] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Simple "Easy Apply" fields
  const [applyName, setApplyName] = useState('');
  const [applyPhone, setApplyPhone] = useState('');
  const [applyLocation, setApplyLocation] = useState('Mogadishu');
  const [applyMessage, setApplyMessage] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [isAppliedSuccess, setIsAppliedSuccess] = useState(false);

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

  // Moderation states
  const [allPendingJobs, setAllPendingJobs] = useState<Job[]>([]);
  const [allCompanies, setAllCompanies] = useState<CompanyProfile[]>([]);

  const handleLogoFileChange = async (file: File) => {
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type! Please upload a PNG, JPG, or WebP image.');
      return;
    }

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

  useEffect(() => {
    if (!user) return;

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

  // Complete clean up & fast Easy Apply submission
  const handleApplySubmit = async () => {
    if (!selectedJob) return;
    if (!applyName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!applyPhone.trim()) {
      toast.error('Please enter your contact phone number.');
      return;
    }

    try {
      setIsSubmittingApp(true);
      
      // Pack location and candidate message carefully inside the coverLetter field
      const compositeCoverLetter = `City/Region: ${applyLocation}\n\nSender Message:\n${applyMessage || 'No specific cover message entered.'}`;

      await jobService.applyForJob({
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        companyId: selectedJob.companyId,
        companyName: selectedJob.companyName,
        candidateName: applyName,
        candidateEmail: user?.email || `${applyPhone.replace(/[^0-9]/g, '')}@amaanestate.com`,
        candidatePhone: applyPhone,
        resumeUrl: `https://amaanestate.com/easy-apply/${user?.uid || 'guest'}`, // Default compliance link 
        coverLetter: compositeCoverLetter,
        employerId: selectedJob.ownerId || '',
      });

      setIsAppliedSuccess(true);
      toast.success('Your application was submitted in 30 seconds!');
      
      // Refresh user's applications record if logged in
      if (user) {
        const apps = await jobService.getCandidateApplications(user.uid);
        setCandApps(apps);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmittingApp(false);
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

  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [incomingApps, setIncomingApps] = useState<JobApplication[]>([]);

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      
      {/* BACKGROUND GRAPHIC */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#C5A059]/5 blur-[160px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* HERO TITLE HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-black block mb-2">Verified Recruiter Ecosystem</span>
          <h1 className="text-4xl md:text-5xl font-display font-light text-white tracking-tight leading-none mb-4">
            Amaan<span className="text-[#C5A059] font-extrabold font-sans">Jobs</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            Somalia's premier secure hiring dashboard. No complex resumes, no long forms. Apply for vetted real estate, engineering, and support listings with absolute ease.
          </p>
        </div>

        {/* CONTROLLER SECTIONS / MAIN NAVIGATION TABS */}
        <div className="flex justify-center mb-10">
          <div className="bg-neutral-900/80 border border-white/5 p-1 rounded-2xl flex max-w-md w-full shadow-2xl">
            {[
              { id: 'browse', label: 'Explore Jobs', icon: Briefcase },
              { id: 'candidate', label: 'My Submissions', icon: User },
              { id: 'employer', label: 'Hiring Space', icon: Building },
              ...(isAdmin ? [{ id: 'admin', label: 'Vetting', icon: ShieldAlert }] : []),
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded-xl transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: BROWSE JOBS (REDESIGNED) */}
        {activeTab === 'browse' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* SIDE FILTER CONTROLS */}
            <div className="lg:col-span-1 bg-[#0d0d0d]/90 border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h3 className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
                  <SlidersHorizontal size={13} className="text-[#C5A059]" /> Filter Listings
                </h3>
                {(search || category !== 'All' || locFilter !== 'All' || workplace !== 'All' || employment !== 'All' || urgentOnly) && (
                  <button 
                    onClick={() => {
                      setSearch('');
                      setCategory('All');
                      setLocFilter('All');
                      setWorkplace('All');
                      setEmployment('All');
                      setUrgentOnly(false);
                      toast.info('Cleared active query parameters');
                    }}
                    className="text-[10px] text-red-400 hover:underline uppercase font-bold"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Search Text */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                    <Search size={14} />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search keywords..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A059] transition-all"
                  />
                </div>

                <PremiumSelect
                  label="Category of Work"
                  value={category}
                  onChange={setCategory}
                  options={[{ label: 'All Fields', value: 'All' }, ...CATEGORIES]}
                  icon={<Briefcase size={14} />}
                />

                <PremiumSelect
                  label="City Office Location"
                  value={locFilter}
                  onChange={setLocFilter}
                  options={[{ label: 'Any City', value: 'All' }, ...CITIES]}
                  icon={<MapPin size={14} />}
                />

                <PremiumSelect
                  label="Workplace Setup"
                  value={workplace}
                  onChange={setWorkplace}
                  options={[{ label: 'All Setups', value: 'All' }, ...WORKPLACE_TYPES]}
                  icon={<Building size={14} />}
                />

                <PremiumSelect
                  label="Contract Type"
                  value={employment}
                  onChange={setEmployment}
                  options={[{ label: 'All Terms', value: 'All' }, ...EMPLOYMENT_TYPES]}
                  icon={<Clock size={14} />}
                />

                <div className="pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer selection:bg-transparent">
                    <input 
                      type="checkbox" 
                      checked={urgentOnly}
                      onChange={(e) => setUrgentOnly(e.target.checked)}
                      className="accent-[#C5A059] rounded" 
                    />
                    <span className="text-[10px] text-gray-300 font-extrabold uppercase tracking-widest">🔥 Urgent Vacancies only</span>
                  </label>
                </div>
              </div>

              {/* POST A JOB PROMO */}
              <div className="bg-gradient-to-br from-[#121110] to-[#050505] border border-[#C5A059]/10 rounded-2xl p-5 text-center shadow-lg">
                <p className="text-[10px] font-extrabold text-[#C5A059] tracking-widest uppercase mb-1">Are you hiring?</p>
                <p className="text-[11px] text-gray-400 mb-4 leading-normal">Register your verified firm profile, submit openings, and receive candidate WhatsApp leads directly.</p>
                <Button 
                  onClick={() => {
                    if(!user) {
                      toast.error('You need to authenticate to create a corporate space.');
                      return;
                    }
                    setActiveTab('employer');
                    setEmpSubTab('post');
                  }}
                  className="w-full bg-transparent hover:bg-white hover:text-black border border-white/10 text-white text-[10px] uppercase font-bold tracking-widest"
                >
                  Create Company Opening
                </Button>
              </div>
            </div>

            {/* SIMPLIFIED JOB CARD LISTINGS */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                  Showing {filteredJobs.length} Career Opportunities
                </span>
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-extrabold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Verified Vacancies
                </span>
              </div>

              {loadingJobs ? (
                <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-white/5">
                  <div className="animate-spin w-8 h-8 rounded-full border-2 border-[#C5A059] border-t-transparent mx-auto mb-4" />
                  <p className="text-xs uppercase tracking-widest text-[#C5A059] font-mono">Loading Real-time Database...</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-24 bg-neutral-900/30 rounded-3xl border border-white/5 px-6">
                  <Briefcase size={36} className="text-[#C5A059] mx-auto mb-4 opacity-40" />
                  <h4 className="font-semibold text-lg mb-2 text-white">No Active Vacancies Match This Query</h4>
                  <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed">
                    There are no current postings with those parameters. Try resetting filters or adjust your search keywords.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredJobs.map(job => (
                    <div 
                      key={job.id} 
                      className="group bg-[#0d0d0d] border border-white/5 hover:border-[#C5A059]/45 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between shadow-lg relative overflow-hidden"
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-2">
                          {job.isUrgent && (
                            <span className="bg-red-500/10 text-red-400 text-[8.5px] font-extrabold tracking-widest uppercase px-2.5 py-0.5 rounded-full border border-red-500/15">
                              Urgent
                            </span>
                          )}
                          <span className="bg-white/5 text-gray-300 text-[8.5px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-full border border-white/10 capitalize">
                            {job.workplaceType}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#C5A059] font-mono font-bold">
                          {job.category}
                        </span>
                      </div>

                      {/* Corporate Identity - ALWAYS display logo */}
                      <div className="flex items-center gap-4 mb-4">
                        {job.companyLogo ? (
                          <div className="w-12 h-12 rounded-xl bg-white border border-white/10 flex items-center justify-center p-1 flex-shrink-0 shadow-md">
                            <img 
                              src={job.companyLogo} 
                              alt={job.companyName || 'Corporate'} 
                              className="w-full h-full object-contain rounded-lg"
                              onError={(e) => {
                                // If image fails to load, gracefully display fallback avatar instead of breaking
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.className = "flex-shrink-0";
                                  parent.innerHTML = `<div class="w-12 h-12 rounded-xl bg-neutral-900 border border-[#C5A059]/30 text-[#C5A059] flex items-center justify-center font-bold text-sm select-none uppercase shadow-lg">${job.companyName?.charAt(0) || 'A'}</div>`;
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <BrandLogoFallback name={job.companyName} size="sm" />
                        )}

                        <div className="min-w-0">
                          <h4 className="text-base font-bold text-white group-hover:text-[#C5A059] transition-colors truncate">{job.title}</h4>
                          <span className="text-xs text-gray-400 block truncate">{job.companyName}</span>
                        </div>
                      </div>

                      {/* Brief parameters list */}
                      <div className="space-y-1.5 border-t border-white/5 pt-4 mb-5 text-[11px] text-gray-400 transition-colors duration-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-[#C5A059]" /> <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-[#C5A059]" /> <span className="uppercase">{job.employmentType}</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-between">
                          <div className="flex items-center gap-1.5">
                            <DollarSign size={12} className="text-[#C5A059]" /> 
                            <span className="font-mono">
                              {job.salaryMin && job.salaryMax ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : 'Negotiable'}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              if (!user) {
                                toast.error('Please sign in to save job openings.');
                                return;
                              }
                              setSavedJobIds(prev => prev.includes(job.id) ? prev.filter(i => i !== job.id) : [...prev, job.id]);
                              toast.info(savedJobIds.includes(job.id) ? 'Removed Bookmark' : 'Opening added to bookmarks!');
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              savedJobIds.includes(job.id) ? 'text-[#C5A059]' : 'text-gray-500 hover:text-white'
                            }`}
                          >
                            <Bookmark size={13} className={savedJobIds.includes(job.id) ? 'fill-[#C5A059]' : ''} />
                          </button>
                        </div>
                      </div>

                      {/* REDESIGNED Action buttons: Details & Easy Apply */}
                      <div className="flex gap-2.5">
                        <button
                          onClick={() => {
                            setIsDescExpanded(false);
                            setSelectedJob(job);
                          }}
                          className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs py-2.5 transition-all text-center border border-white/5"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            if (!user) {
                              toast.error('Authenticate code to access easy apply form.');
                              return;
                            }
                            setSelectedJob(job);
                            setApplyName(user.displayName || '');
                            setApplyPhone('');
                            setIsAppliedSuccess(false);
                            setIsSubmitApplicationOpen(true);
                          }}
                          className="flex-1 rounded-xl bg-[#C5A059] hover:bg-white text-black font-extrabold text-xs py-2.5 transition-all text-center shadow-lg hover:shadow-[#C5A059]/20"
                        >
                          Easy Apply
                        </button>
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
            
            {/* PROFILE META STATS */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 blur-2xl rounded-full pointer-events-none" />
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059] font-medium text-lg">
                    {user?.displayName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{candProfile?.displayName || user?.displayName || 'Applicant'}</h3>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Premium Account Member</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] text-[#C5A059] font-bold uppercase block mb-1">My Biography Summary</span>
                    <p className="text-gray-300 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                      {candProfile?.bio || 'Introduce your professional background and property surveying or construction experience to stand out.'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#C5A059] font-bold uppercase block mb-1">Key Competence Areas</span>
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

                  <Button
                    onClick={() => {
                      setCandBio(candProfile?.bio || '');
                      setCandSkills(candProfile?.skills.join(', ') || '');
                      setCandResumeInput(candProfile?.resumeUrl || '');
                      setIsEditCandOpen(true);
                    }}
                    className="w-full bg-[#C5A059] hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-all h-10 rounded-xl mt-4"
                  >
                    Edit Biography Profile
                  </Button>
                </div>
              </div>

              {/* Bookmarked openings */}
              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-md">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] mb-4">Saved Bookmarks</h4>
                {savedJobIds.length === 0 ? (
                  <p className="text-xs text-gray-500 leading-relaxed">Your bookmarked positions appear here for fast tracking.</p>
                ) : (
                  <div className="space-y-2">
                    {savedJobIds.map(id => {
                      const matched = activeJobs.find(x => x.id === id);
                      if (!matched) return null;
                      return (
                        <div 
                          key={id}
                          onClick={() => setSelectedJob(matched)}
                          className="p-3 bg-black/40 rounded-xl border border-white/5 hover:border-[#C5A059]/35 transition-all cursor-pointer flex justify-between items-center"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="text-xs font-bold text-white block truncate">{matched.title}</span>
                            <span className="text-[10px] text-gray-500 block truncate">{matched.companyName}</span>
                          </div>
                          <ChevronRight size={12} className="text-gray-500 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* MY APPLICATIONS PORTFOLIO */}
            <div className="lg:col-span-2 bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-6">
                Your Job Applications Portfolio
              </h3>

              {candApps.length === 0 ? (
                <div className="text-center py-16">
                  <Briefcase size={36} className="text-gray-500 mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-gray-400">No applications submitted yet.</p>
                  <p className="text-xs text-gray-500 mt-1">Submit your profile to recruiter openings. You can track evaluation feedback here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {candApps.map(app => (
                    <div key={app.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-neutral-900/40">
                      <div>
                        <h4 className="font-bold text-sm text-white mb-0.5">{app.jobTitle}</h4>
                        <span className="text-xs text-[#C5A059] block mb-2">{app.companyName}</span>
                        <span className="text-[10px] text-gray-500 uppercase block">Submitted on: {new Date(app.createdAt?.seconds ? app.createdAt.seconds * 1000 : app.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-[9px] text-gray-500 uppercase block mb-1">Hiring Status</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                          app.status === 'hired' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          app.status === 'shortlisted' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          app.status === 'rejected' ? 'bg-rose-500/10 text-red-400 border-red-500/20' :
                          'bg-amber-500/10 text-amber-500 border-amber-500/25 animate-pulse'
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
        )}

        {/* TAB 3: EMPLOYER WORKSPACE */}
        {activeTab === 'employer' && (
          <div>
            {!employerCompany ? (
              <div className="text-center py-24 bg-neutral-900/30 border border-white/5 rounded-3xl max-w-2xl mx-auto p-8">
                <Building size={48} className="text-[#C5A059] mx-auto mb-4 animate-bounce" />
                <h3 className="font-medium text-lg mb-2 text-white">Configure Recruiter Workspace</h3>
                <p className="text-gray-400 text-xs mb-8 leading-relaxed">
                  Post real real-estate contracts, construction schedules, property design roles, or broker listings. Establish your verified corporate recruiter profile to proceed safely.
                </p>
                <Button
                  onClick={() => setIsCompanySetupOpen(true)}
                  className="bg-[#C5A059] hover:bg-white text-black text-xs font-bold uppercase tracking-widest px-8 h-12 rounded-xl shadow-lg shadow-[#C5A059]/10"
                >
                  Configure Recruiter Settings <Plus size={14} className="ml-1" />
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Employer Side Navigation & Core widgets */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 shadow-xl text-center">
                    
                    {employerCompany.logo ? (
                      <div className="w-16 h-16 rounded-2xl bg-white p-1 border border-white/10 mx-auto mb-3 flex items-center justify-center">
                        <img 
                          src={employerCompany.logo} 
                          alt={employerCompany.name} 
                          className="w-full h-full object-contain rounded-xl"
                        />
                      </div>
                    ) : (
                      <div className="mx-auto mb-3 flex justify-center">
                        <BrandLogoFallback name={employerCompany.name} size="md" />
                      </div>
                    )}

                    <h3 className="font-bold text-base text-white flex items-center justify-center gap-1.5 font-serif">
                      {employerCompany.name}
                      {employerCompany.isVerified && <CheckCircle className="text-emerald-400" size={14} />}
                    </h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest block mb-4">{employerCompany.location}</p>
                    
                    {/* Status Alert */}
                    {!employerCompany.isVerified ? (
                      <div className="p-3.5 bg-amber-500/5 border border-amber-500/15 rounded-xl mb-6 text-left">
                        <span className="text-[9px] font-bold uppercase text-amber-400 block mb-0.5">Verification Required</span>
                        <p className="text-[11px] text-gray-400 leading-normal">
                          Your hiring profile is currently unverified. Submit a request to verified corporate channels.
                        </p>
                        <Button 
                          onClick={async () => {
                            await jobService.updateCompany(employerCompany.id, { status: 'pending' });
                            setEmployerCompany({ ...employerCompany, status: 'pending' });
                            toast.success('Hiring system review request dispatched.');
                          }}
                          disabled={employerCompany.status === 'pending'}
                          className="w-full mt-2.5 bg-amber-500 hover:bg-amber-600 text-black h-8 rounded-lg text-[9px] font-bold uppercase tracking-widest"
                        >
                          {employerCompany.status === 'pending' ? 'Pending Review...' : 'Submit Verification'}
                        </Button>
                      </div>
                    ) : (
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6 flex items-center gap-1.5 justify-center">
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-[9px] font-extrabold text-emerald-400 tracking-wider uppercase">Verified Recruiter Partner</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5 text-left border-t border-white/5 pt-4">
                      {[
                        { id: 'analytics', label: 'Dashboard Overview', icon: Compass },
                        { id: 'post', label: 'Create Vacancy Form', icon: Plus },
                        { id: 'active', label: 'Active Listings', icon: CheckCircle },
                        { id: 'drafts', label: 'Drafts & Under-review', icon: AlertCircle },
                        { id: 'applicants', label: 'Hiring Lead Inbox', icon: Users },
                        { id: 'company', label: 'Recruiter Settings', icon: Building },
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
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-[#0b0b0b] border border-white/5 p-4 rounded-2xl shadow-xl">
                          <span className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Total Placements</span>
                          <p className="text-3xl font-display font-bold text-white tabular-nums">{postedJobs.length}</p>
                        </div>
                        <div className="bg-[#0b0b0b] border border-white/5 p-4 rounded-2xl shadow-xl">
                          <span className="text-[9px] text-[#C5A059] font-bold uppercase block mb-1">Incoming Leads</span>
                          <p className="text-3xl font-display font-bold text-[#C5A059] tabular-nums">{incomingApps.length}</p>
                        </div>
                        <div className="bg-[#0b0b0b] border border-white/5 p-4 rounded-2xl shadow-xl col-span-2">
                          <span className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Approval Ratio</span>
                          <p className="text-xs text-gray-400 mt-2">All postings comply with active housing and development board laws.</p>
                        </div>
                      </div>

                      {/* Recent applications inbox preview link */}
                      <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Recent Candidate Submissions ({incomingApps.length})</h4>
                          <button onClick={() => setEmpSubTab('applicants')} className="text-[10px] text-[#C5A059] font-bold hover:underline uppercase">View All Inbox</button>
                        </div>
                        {incomingApps.length === 0 ? (
                          <p className="text-xs text-gray-500 py-4">No hiring responses received of yet.</p>
                        ) : (
                          <div className="space-y-2.5">
                            {incomingApps.slice(0, 3).map(app => (
                              <div key={app.id} className="p-3 bg-black/50 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                                <div>
                                  <span className="font-semibold text-white block">{app.candidateName}</span>
                                  <span className="text-[10px] text-gray-400 block">{app.jobTitle} • {app.candidatePhone}</span>
                                </div>
                                <span className="text-[9px] text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded uppercase font-bold">{app.status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUB TAB: POST / EDIT FORM */}
                  {empSubTab === 'post' && (
                    <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl">
                      <div className="pb-4 border-b border-white/5 mb-6">
                        <h3 className="font-bold text-base text-white">
                          {editingJobId ? 'Edit Vacancy Structure' : 'Create Verified Vacancy Placement'}
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">
                          Submissions will be vetted by AmaanEstate moderation agents to guarantee quality.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Placement Title*</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Lead Surveyor Manager"
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Corporate Field*</label>
                          <PremiumSelect
                            label="Corporate Field"
                            value={formCategory}
                            onChange={setFormCategory}
                            options={CATEGORIES.map(c => ({ label: c, value: c }))}
                            className="border-white/10"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Office Region Location*</label>
                          <PremiumSelect
                            label="Office Region Location"
                            value={formLocation}
                            onChange={setFormLocation}
                            options={CITIES.map(c => ({ label: c, value: c }))}
                            className="border-white/10"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Terms*</label>
                            <PremiumSelect
                              label="Terms"
                              value={formEmployment}
                              onChange={setFormEmployment as any}
                              options={EMPLOYMENT_TYPES.map(e => ({ label: e, value: e }))}
                              className="border-white/10"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Workplace Arrangement*</label>
                            <PremiumSelect
                              label="Workplace Arrangement"
                              value={formWorkplace}
                              onChange={setFormWorkplace as any}
                              options={WORKPLACE_TYPES.map(w => ({ label: w, value: w }))}
                              className="border-white/10"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Salary lowerbound (USD)*</label>
                            <input 
                              type="number" 
                              value={formSalaryMin}
                              onChange={(e) => setFormSalaryMin(Number(e.target.value))}
                              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Salary upperbound (USD)*</label>
                            <input 
                              type="number" 
                              value={formSalaryMax}
                              onChange={(e) => setFormSalaryMax(Number(e.target.value))}
                              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">External Banner picture URL (Optional)</label>
                          <input 
                            type="url" 
                            placeholder="https://images.unsplash..."
                            value={formFeaturedImage}
                            onChange={(e) => setFormFeaturedImage(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Role Description (Mandatory Summary)*</label>
                          <textarea 
                            rows={4} 
                            placeholder="Detail the daily activities, scheduling and client portfolio..."
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Evaluation prerequisites & requirements (Separate lines)*</label>
                          <textarea 
                            rows={3} 
                            placeholder="AutoCAD competency, 3 years experience, Somalian driving license..."
                            value={formRequirements}
                            onChange={(e) => setFormRequirements(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Core benefits & security metrics</label>
                          <textarea 
                            rows={2} 
                            placeholder="Medical coverage, 20 annual paid leaves..."
                            value={formBenefits}
                            onChange={(e) => setFormBenefits(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Closing Date</label>
                          <input 
                            type="text" 
                            placeholder="e.g. June 24, 2026"
                            value={formDeadline}
                            onChange={(e) => setFormDeadline(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-6">
                          <input 
                            type="checkbox" 
                            id="isUrgent"
                            checked={formIsUrgent}
                            onChange={(e) => setFormIsUrgent(e.target.checked)}
                            className="scale-110 accent-[#C5A059]"
                          />
                          <label htmlFor="isUrgent" className="text-xs text-gray-300 font-bold uppercase select-none tracking-wider cursor-pointer">Mark as 🔥 Urgent</label>
                        </div>

                        <div className="md:col-span-2 pt-4 flex gap-3 border-t border-white/5 justify-end">
                          <Button 
                            onClick={cleanJobForm}
                            className="bg-transparent hover:bg-white/5 border border-white/10 text-white text-xs font-bold uppercase px-6"
                          >
                            Reset Form
                          </Button>
                          <Button 
                            onClick={() => handlePostJob('draft')}
                            className="bg-neutral-900 hover:bg-white/5 text-white border border-white/10 text-xs font-bold uppercase px-6"
                          >
                            Save Draft
                          </Button>
                          <Button 
                            onClick={() => handlePostJob('pending')}
                            className="bg-[#C5A059] hover:bg-white text-black text-xs font-bold uppercase px-8"
                          >
                            Submit Opening
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB TAB: ACTIVE LISTINGS */}
                  {empSubTab === 'active' && (
                    <div className="bg-[#0b0b0b] border border-white/5 rounded-3xl p-6 shadow-xl">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-white mb-6">Published Vetted Openings</h3>
                      {postedJobs.filter(j => j.status === 'approved').length === 0 ? (
                        <p className="text-xs text-gray-500">You do not have any active approved listings at this hour.</p>
                      ) : (
                        <div className="space-y-4">
                          {postedJobs.filter(j => j.status === 'approved').map(vacancy => (
                            <div key={vacancy.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between text-xs transition-all hover:border-[#C5A059]/20">
                              <div>
                                <h4 className="font-semibold text-white text-sm">{vacancy.title}</h4>
                                <span className="text-gray-400 font-mono text-[10px] block mt-0.5">{vacancy.category} • {vacancy.location}</span>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => startEditJob(vacancy)} className="p-2 bg-white/5 hover:bg-[#C5A059] hover:text-black rounded-lg transition-colors text-white">
                                  <Edit size={13} />
                                </button>
                                <button onClick={() => handleDeleteJob(vacancy.id)} className="p-2 bg-white/5 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-red-400">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB TAB: DRAFTS */}
                  {empSubTab === 'drafts' && (
                    <div className="bg-[#0b0b0b] border border-white/5 rounded-3xl p-6 shadow-xl">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-white mb-6">Workplace Drafts & Vetting queue</h3>
                      {postedJobs.filter(j => j.status !== 'approved').length === 0 ? (
                        <p className="text-xs text-gray-500">No drafted or pending entries on record.</p>
                      ) : (
                        <div className="space-y-4">
                          {postedJobs.filter(j => j.status !== 'approved').map(vacancy => (
                            <div key={vacancy.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between text-xs">
                              <div>
                                <h4 className="font-semibold text-white">{vacancy.title}</h4>
                                <span className="text-gray-400 block tracking-tight">{vacancy.location} • Status: 
                                  <span className={`font-bold ml-1 uppercase ${vacancy.status === 'pending' ? 'text-amber-400' : 'text-gray-400'}`}>
                                    {vacancy.status}
                                  </span>
                                </span>
                              </div>
                              <div className="flex gap-2">
                                {vacancy.status === 'draft' && (
                                  <button 
                                    onClick={() => {
                                      jobService.updateJob(vacancy.id, { status: 'pending' });
                                      toast.success('Dispatched to vetting center!');
                                      refreshEmployerJobs();
                                    }}
                                    className="px-3 py-1.5 bg-[#C5A059] text-black hover:bg-white transition-colors rounded-lg font-bold text-[10px] uppercase"
                                  >
                                    Publish
                                  </button>
                                )}
                                <button onClick={() => startEditJob(vacancy)} className="p-2 bg-white/5 hover:bg-white hover:text-black rounded-lg text-white">
                                  <Edit size={13} />
                                </button>
                                <button onClick={() => handleDeleteJob(vacancy.id)} className="p-2 bg-white/5 hover:bg-red-500 hover:text-white rounded-lg text-red-400">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB TAB: MANAGE CANDIDATES INBOX */}
                  {empSubTab === 'applicants' && (
                    <div className="bg-[#0b0b0b] border border-white/5 rounded-3xl p-6 shadow-xl">
                      <div className="pb-4 border-b border-white/5 mb-6">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-white">Candidates Lead Inbox</h3>
                        <p className="text-gray-500 text-xs mt-1">Review candidates who applied on the Simplified system without complex resumes.</p>
                      </div>

                      {incomingApps.length === 0 ? (
                        <p className="text-xs text-gray-500 py-6 text-center">Your recruiter lead inbox is empty.</p>
                      ) : (
                        <div className="space-y-4">
                          {incomingApps.map(app => (
                            <div key={app.id} className="p-5 bg-black/40 border border-white/5 rounded-2xl space-y-4">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-white/5">
                                <div>
                                  <span className="font-extrabold text-white text-base block">{app.candidateName}</span>
                                  <span className="text-xs text-[#C5A059] block font-mono mt-0.5">{app.jobTitle}</span>
                                </div>
                                <div className="text-[10px] text-gray-500 block">
                                  Applied on: {new Date(app.createdAt?.seconds ? app.createdAt.seconds * 1000 : app.createdAt).toLocaleDateString()}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300">
                                <div className="space-y-1.5 bg-neutral-900/50 p-3 rounded-xl border border-white/5">
                                  <span className="text-[9px] text-[#C5A059] font-bold uppercase block">Contact Information</span>
                                  <p className="font-mono text-white flex items-center gap-1">
                                    <Phone size={11} className="text-gray-500" /> WhatsApp/Call: {app.candidatePhone || 'N/A'}
                                  </p>
                                  <p className="text-white/60">Email: {app.candidateEmail}</p>
                                </div>

                                <div className="space-y-1.5 bg-neutral-900/50 p-3 rounded-xl border border-white/5">
                                  <span className="text-[9px] text-[#C5A059] font-bold uppercase block">Simplified Parameters</span>
                                  <p className="text-white text-xs leading-normal font-sans whitespace-pre-line">
                                    {app.coverLetter || 'No cover note specified.'}
                                  </p>
                                </div>
                              </div>

                              {/* Decision selectors */}
                              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Current candidate status: <span className="text-white lowercase capitalize">{app.status}</span></span>
                                <div className="flex gap-2">
                                  {[
                                    { status: 'reviewed', label: 'Reviewed', colorClass: 'bg-white/5 text-white' },
                                    { status: 'shortlisted', label: 'Shortlist', colorClass: 'bg-indigo-505/10 text-indigo-400 border border-indigo-500/10' },
                                    { status: 'rejected', label: 'Reject', colorClass: 'bg-rose-500/10 text-red-400 border border-red-500/10' },
                                    { status: 'hired', label: 'Hire corporate', colorClass: 'bg-[#C5A059] text-black font-extrabold' },
                                  ].map(opt => (
                                    <button
                                      key={opt.status}
                                      onClick={() => handleUpdateApplicationStatus(app.id, app.candidateId, app.jobTitle, opt.status as any)}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-semibold transition-all hover:scale-105 active:scale-95 ${opt.colorClass}`}
                                    >
                                      {opt.label}
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

                  {/* SUB TAB: EDIT COMPANY PROFILE */}
                  {empSubTab === 'company' && (
                    <div className="bg-[#0b0b0b] border border-white/5 rounded-3xl p-6 shadow-xl">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-white mb-6">Edit Company Configuration</h3>
                      <div className="space-y-4 text-xs">
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Company official Name*</label>
                          <input 
                            type="text" 
                            value={compName}
                            onChange={(e) => setCompName(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Logo URL configuration*</label>
                          <input 
                            type="url" 
                            value={compLogo}
                            onChange={(e) => setCompLogo(e.target.value)}
                            placeholder="Upload logo below to generate path"
                            className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-gray-500 cursor-not-allowed mb-2 select-all"
                            disabled
                          />
                          
                          {/* Dedicated upload UI constraint to fulfill previous mandatory logo rules */}
                          <div className="mt-2.5">
                            {compLogo ? (
                              <div className="relative group rounded-xl overflow-hidden aspect-square w-20 h-20 border border-[#C5A059]/30 bg-white/5">
                                <img src={compLogo} alt="Logo" className="w-full h-full object-contain" />
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button type="button" onClick={() => setCompLogo('')} className="text-red-400 text-[10px] font-bold hover:text-red-300 uppercase">Remove</button>
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
                                    <p className="text-[11px] font-semibold text-white/60">Upload Corporate Logo</p>
                                    <p className="text-[9.5px] text-white/30 mt-0.5">PNG, JPG or WebP (Max 3MB)</p>
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
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Description Profile*</label>
                          <textarea 
                            rows={3} 
                            value={compDesc}
                            onChange={(e) => setCompDesc(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Corporate website</label>
                          <input 
                            type="url" 
                            value={compWeb}
                            onChange={(e) => setCompWeb(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2"
                          />
                        </div>

                        <div className="pt-2 border-t border-white/5 flex justify-end">
                          <Button 
                            onClick={handleRegisterCompany}
                            className="bg-[#C5A059] hover:bg-white text-black font-extrabold text-xs uppercase"
                            disabled={logoUploading || !compLogo}
                          >
                            Save configuration
                          </Button>
                        </div>
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
            <div className="bg-[#0b0b0b] border border-white/5 rounded-3xl p-6 shadow-xl">
              <h3 className="font-bold text-xs text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle size={14} className="text-amber-400" /> Pending Placements ({allPendingJobs.length})
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
            <div className="bg-[#0b0b0b] border border-white/5 rounded-3xl p-6 shadow-xl">
              <h3 className="font-bold text-xs text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <Building size={14} className="text-[#C5A059]" /> Recruiter Credentials Setup ({allCompanies.filter(c => c.status === 'pending' || !c.isVerified).length})
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

      {/* MODAL: SINGLE-CARD DETAILED DESCRIPTIVE SYSTEM */}
      <AnimatePresence>
        {selectedJob && !isSubmitApplicationOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[99999] overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 15 }} 
              className="bg-[#0b0b0b] border border-white/10 rounded-3xl w-full max-w-xl p-6 md:p-8 shadow-2xl relative my-8"
            >
              {/* Profile Image header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  {selectedJob.companyLogo ? (
                    <div className="w-14 h-14 rounded-xl bg-white p-1 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <img 
                        src={selectedJob.companyLogo} 
                        alt={selectedJob.companyName || 'Corporate'} 
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.className = "flex-shrink-0";
                            parent.innerHTML = `<div class="w-14 h-14 rounded-xl bg-neutral-900 border border-[#C5A059]/30 text-[#C5A059] flex items-center justify-center font-bold text-base select-none uppercase shadow-lg">${selectedJob.companyName?.charAt(0) || 'A'}</div>`;
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <BrandLogoFallback name={selectedJob.companyName} size="md" />
                  )}

                  <div>
                    <h3 className="font-bold text-lg text-white font-serif">{selectedJob.title}</h3>
                    <p className="text-xs text-[#C5A059] font-medium">{selectedJob.companyName}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedJob(null)} 
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Verified Badge Indicators */}
              <div className="flex flex-wrap gap-2 mb-6 text-[10px] font-mono select-none">
                <span className="bg-white/5 border border-white/5 text-white/80 px-2.5 py-1 rounded-full inline-flex items-center gap-1 shadow-sm">
                  <MapPin size={10} className="text-[#C5A059]" /> {selectedJob.location}
                </span>
                <span className="bg-[#C5A059]/15 border border-[#C5A059]/20 text-[#C5A059] px-2.5 py-1 rounded-full inline-flex items-center gap-1 uppercase font-extrabold shadow-sm">
                  <Clock size={10} /> {selectedJob.employmentType}
                </span>
                <span className="bg-white/5 border border-white/5 text-white/80 px-2.5 py-1 rounded-full shadow-sm">
                  💰 {selectedJob.salaryMin && selectedJob.salaryMax ? `$${selectedJob.salaryMin.toLocaleString()} - $${selectedJob.salaryMax.toLocaleString()}` : 'Negotiable'}
                </span>
              </div>

              {/* Content Panel */}
              <div className="space-y-6 max-h-[52vh] overflow-y-auto pr-2 scroll-smooth">
                {selectedJob.featuredImage && (
                  <img 
                    src={selectedJob.featuredImage} 
                    alt="Property and Job features" 
                    className="w-full h-40 object-cover rounded-2xl border border-white/5 shadow-inner" 
                  />
                )}

                {/* Collapsible/Expandable Description */}
                <div>
                  <span className="text-[9px] text-[#C5A059] uppercase block mb-1.5 font-bold tracking-widest font-mono">Job Description Summary</span>
                  <div className="text-xs text-gray-300 leading-relaxed bg-[#111] p-4 border border-white/5 rounded-2xl relative">
                    <p className={isDescExpanded ? '' : 'line-clamp-4'}>
                      {selectedJob.description}
                    </p>
                    {selectedJob.description.length > 200 && (
                      <button 
                        onClick={() => setIsDescExpanded(!isDescExpanded)}
                        className="text-[#C5A059] text-[10px] font-extrabold uppercase mt-2 hover:underline inline-flex items-center gap-0.5"
                      >
                        {isDescExpanded ? (
                          <>Collapse <ChevronUp size={12} /></>
                        ) : (
                          <>Read Full Description <ChevronDown size={12} /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Requirements Bullet List */}
                {selectedJob.requirements && (
                  <div>
                    <span className="text-[9px] text-[#C5A059] uppercase block mb-1.5 font-bold tracking-widest font-mono">Evaluation Requirements</span>
                    <ul className="text-xs text-gray-300 space-y-2 bg-[#111] p-4 border border-white/5 rounded-2xl">
                      {selectedJob.requirements.split('\n').filter(Boolean).map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle size={12} className="text-[#C5A059] mt-0.5 shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Benefits Bullet List */}
                {selectedJob.benefits && (
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block mb-1.5 font-bold tracking-widest font-mono">Compensation & Perks</span>
                    <ul className="text-xs text-gray-300 space-y-1.5 bg-neutral-950 p-3 rounded-xl border border-white/5 list-disc list-inside">
                      {selectedJob.benefits.split('\n').filter(Boolean).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer Interactive buttons */}
              <div className="pt-6 border-t border-white/5 flex gap-4 mt-6">
                <Button
                  onClick={() => {
                    if (!user) {
                      toast.error('Standard authorization is required to apply.');
                      return;
                    }
                    setApplyName(user.displayName || '');
                    setApplyPhone('');
                    setIsAppliedSuccess(false);
                    setIsSubmitApplicationOpen(true);
                  }}
                  className="w-full bg-[#C5A059] hover:bg-white text-black text-xs font-bold uppercase tracking-widest h-12 rounded-xl transition-all font-sans shadow-lg shadow-[#C5A059]/10"
                >
                  Easy Apply on Amaan system
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EASY APPLICATION FORM MODAL (SIMPLIFIED TO 30 SECONDS SUBMISSIONS) */}
      <AnimatePresence>
        {isSubmitApplicationOpen && selectedJob && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[999999]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-[#0b0b0b] border border-white/10 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              
              {!isAppliedSuccess ? (
                <>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white font-serif">Amaan Easy Apply</h3>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Submit basic guidelines to recruiters of {selectedJob.companyName} immediately.
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsSubmitApplicationOpen(false)}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs mt-4">
                    {/* Full Name */}
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Full Representative Name*</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                          <User size={12} />
                        </span>
                        <input 
                          type="text" 
                          required 
                          placeholder="your full name..." 
                          value={applyName}
                          onChange={(e) => setApplyName(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Direct SMS / Whatsapp Phone number*</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                          <Phone size={12} />
                        </span>
                        <input 
                          type="tel" 
                          required 
                          placeholder="e.g. +252 61 XXXXXXX" 
                          value={applyPhone}
                          onChange={(e) => setApplyPhone(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059] font-mono"
                        />
                      </div>
                    </div>

                    {/* Location/City Dropdown */}
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">My Present Location (City / Region)*</label>
                      <PremiumSelect
                        label="My Present Location"
                        value={applyLocation}
                        onChange={setApplyLocation}
                        options={CITIES.map(c => ({ label: c, value: c }))}
                        className="border-white/10"
                      />
                    </div>

                    {/* Optional Short message */}
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Introduction note / Cover message (Optional)</label>
                      <div className="relative">
                        <span className="absolute top-2.5 left-3 text-gray-500">
                          <MessageSquare size={12} />
                        </span>
                        <textarea 
                          rows={3} 
                          placeholder="Why do you fit this coordinates or role demands?" 
                          value={applyMessage}
                          onChange={(e) => setApplyMessage(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-white/5">
                      <Button 
                        type="button"
                        onClick={() => setIsSubmitApplicationOpen(false)}
                        className="bg-transparent hover:bg-white/5 text-white border border-white/10 flex-1 h-11 rounded-xl uppercase tracking-wider text-xs"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="button"
                        onClick={handleApplySubmit}
                        disabled={isSubmittingApp || !applyName || !applyPhone}
                        className="bg-[#C5A059] hover:bg-white text-black flex-1 h-11 rounded-xl uppercase tracking-wider text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#C5A059]/10"
                      >
                        {isSubmittingApp ? 'Submitting...' : 'Send Easy Apply'}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                /* Success checkmark panel with beautiful styling */
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Check size={32} className="text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Application Dropped!</h3>
                  <p className="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto mb-6">
                    Congratulations! Your simplified application leads were submitted successfully in under 30 seconds straight onto the {selectedJob.companyName} portal.
                  </p>
                  <Button
                    onClick={() => {
                      setIsSubmitApplicationOpen(false);
                      setSelectedJob(null);
                    }}
                    className="bg-[#C5A059] hover:bg-white text-black font-extrabold px-8 h-10 rounded-xl uppercase text-xs"
                  >
                    Explore More Jobs
                  </Button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CANDIDATE SUMMARY BIOGRAPHY SUMMARY EDIT */}
      <AnimatePresence>
        {isEditCandOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-[#0b0b0b] border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-xl"
            >
              <h3 className="font-bold text-base text-white mb-4">Edit Candidate biography parameters</h3>
              
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Career Bio summary</label>
                  <textarea 
                    rows={4} 
                    placeholder="Brief summary of your field and experience..."
                    value={candBio}
                    onChange={(e) => setCandBio(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Competency keywords (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="Revit, Surveyor, Drafting..."
                    value={candSkills}
                    onChange={(e) => setCandSkills(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2"
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

      {/* MODAL: CORPORATE INITIAL SETTINGS */}
      <AnimatePresence>
        {isCompanySetupOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[99999]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-[#0c0c0c] border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-xl"
            >
              <h3 className="font-bold text-base text-white mb-4">Recruiter Profile Configuration</h3>
              
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Agency Name*</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Amaan Luxury Builders"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1.5">Official Corporate Logo*</label>
                  
                  {compLogo ? (
                    <div className="relative group rounded-xl overflow-hidden aspect-square w-20 h-20 border border-[#C5A059]/30 bg-white/5">
                      <img src={compLogo} alt="Logo preview" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => setCompLogo('')} className="text-red-400 text-[10px] font-semibold hover:text-red-300 uppercase">Remove</button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-24 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#C5A059]/45 bg-white/5 transition-colors cursor-pointer text-center p-3 relative">
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
                          <p className="text-[9px] text-white/30 mt-0.5 font-sans">PNG, JPG, WebP (Max 3MB)</p>
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
                </div>

                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Focus Description Summary*</label>
                  <textarea 
                    rows={3} 
                    placeholder="Focus details..."
                    value={compDesc}
                    onChange={(e) => setCompDesc(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-3 font-sans focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Corporate Website</label>
                  <input 
                    type="url" 
                    placeholder="https://..."
                    value={compWeb}
                    onChange={(e) => setCompWeb(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Headquarter Center</label>
                  <input 
                    type="text" 
                    placeholder="Mogadishu"
                    value={compLoc}
                    onChange={(e) => setCompLoc(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2"
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
                    className="bg-[#C5A059] hover:bg-white text-black flex-1 h-9 rounded-lg uppercase text-[10px] font-bold disabled:opacity-40"
                  >
                    Save & Register
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
