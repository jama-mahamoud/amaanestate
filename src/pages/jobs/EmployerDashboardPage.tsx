import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, FileText, CheckCircle2, BookmarkCheck, BookOpen, 
  PlusCircle, LayoutDashboard, Search, Database, Globe, Mail, LogIn, 
  Trash2, ClipboardCheck, ArrowLeft, ArrowUpRight, ShieldCheck, Sparkles, SlidersHorizontal, MapPin
} from 'lucide-react';
import { Job, CompanyProfile, JobApplication } from '@/types';
import { jobService } from '@/services/jobService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function EmployerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Core Employer loading state
  const [loading, setLoading] = useState(true);
  const [employerCompany, setEmployerCompany] = useState<CompanyProfile | null>(null);
  const [myPostedJobs, setMyPostedJobs] = useState<Job[]>([]);
  const [employerApplications, setEmployerApplications] = useState<JobApplication[]>([]);

  // Forms for Corporate Recruiter Registry Card
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');
  const [companyLoc, setCompanyLoc] = useState('Mogadishu');
  const [companyWeb, setCompanyWeb] = useState('');
  const [companySize, setCompanySize] = useState('10-50');

  // Forms for Job Positions
  const [jobTitle, setJobTitle] = useState('');
  const [jobCategory, setJobCategory] = useState('Information Technology');
  const [jobLoc, setJobLoc] = useState('mogadishu');
  const [jobCountry, setJobCountry] = useState('Somalia');
  const [jobCity, setJobCity] = useState('');
  const [jobType, setJobType] = useState<'full-time' | 'part-time' | 'remote' | 'contract' | 'freelance'>('full-time');
  const [jobWorkPlace, setJobWorkplace] = useState<'on-site' | 'hybrid' | 'remote'>('on-site');
  const [jobExp, setJobExp] = useState('Entry Level');
  const [jobSalMin, setJobSalMin] = useState(1500);
  const [jobSalMax, setJobSalMax] = useState(3000);
  const [jobDesc, setJobDesc] = useState('');
  const [jobResp, setJobResp] = useState('');
  const [jobReq, setJobReq] = useState('');
  const [jobSkillsLabel, setJobSkillsLabel] = useState('');
  const [jobDeadlineInput, setJobDeadlineInput] = useState('');
  const [jobMethod, setJobMethod] = useState<'internal' | 'external' | 'email'>('internal');
  const [jobExtLink, setJobExtLink] = useState('');
  const [jobEmpEmail, setJobEmpEmail] = useState('');
  const [jobHiringOrg, setJobHiringOrg] = useState('');

  // Tab selections inside Employer console
  const [activeEmployerTab, setActiveEmployerTab] = useState<'jobs' | 'post' | 'applications' | 'profile'>('jobs');

  const CATEGORIES = [
    'Information Technology',
    'Logistics',
    'Engineering',
    'Healthcare & Science',
    'Administration',
    'Finance & Accounting',
    'Construction',
    'Education & Travel'
  ];
  
  const LOCATIONS = ['mogadishu', 'hargeisa', 'garowe', 'kismayo', 'bosaso', 'baidoa', 'beletweyne', 'remote', 'hybrid'];
  const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level (2-4 Years)', 'Mid-Senior Level (5+ Years)', 'Senior Level (6+ Years)', 'Executive / Director'];
  const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'remote', 'contract', 'freelance'];

  // Load and sync Employer datasets
  const fetchEmployerData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Sync active logged employer company profile
      const myComp = await jobService.getCompanyByOwnerId(user.uid);
      if (myComp) {
        setEmployerCompany(myComp);
        
        // Pre-populate company input fields for update
        setCompanyName(myComp.name || '');
        setCompanyLogo(myComp.logo || '');
        setCompanyDesc(myComp.description || '');
        setCompanyLoc(myComp.location || 'Mogadishu');
        setCompanyWeb(myComp.website || '');
        setCompanySize(myComp.size || '10-50');
        
        // Load apps filed for this employer
        const apps = await jobService.getEmployerApplications(myComp.id);
        setEmployerApplications(apps);

        // Load jobs posted by this employer
        // Pass ownerId filter inside queries
        const jobs = await jobService.getJobs({ ownerId: user.uid });
        setMyPostedJobs(jobs);
      }
    } catch (err) {
      console.error('Error fetching employer workspace:', err);
      toast.error('Could not fully retrieve your employer company from Cloud Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerData();
  }, [user]);

  // Employer: Register Company Bio
  const handleRegisterCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !companyDesc.trim()) {
      toast.error('Please input company name and mission bio.');
      return;
    }
    try {
      toast.loading('Saving business metadata to AmaanJobs database...', { id: 'reg' });
      await jobService.createCompany({
        name: companyName,
        logo: companyLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=150&q=80',
        description: companyDesc,
        location: companyLoc,
        website: companyWeb,
        size: companySize
      } as any);

      toast.success('Recruiter business profile registered successfully!', { id: 'reg' });
      fetchEmployerData();
    } catch (error) {
      console.error(error);
      toast.error('Could not verify/save company info.', { id: 'reg' });
    }
  };

  // Employer: Update Company Profile (Basic info only)
  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employerCompany) return;
    if (!companyName.trim() || !companyDesc.trim()) {
      toast.error('Please input company name and mission bio.');
      return;
    }
    try {
      toast.loading('Updating database company profile details...', { id: 'updatecomp' });
      await jobService.updateCompany(employerCompany.id, {
        name: companyName,
        logo: companyLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=150&q=80',
        description: companyDesc,
        location: companyLoc,
        website: companyWeb,
        size: companySize
      });

      toast.success('Company profile updated successfully!', { id: 'updatecomp' });
      fetchEmployerData();
    } catch (error) {
      console.error(error);
      toast.error('Could not update company info.', { id: 'updatecomp' });
    }
  };

  // Employer: Post fresh listing
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDesc.trim()) {
      toast.error('Position Title and Career context description are mandatory.');
      return;
    }

    if (!employerCompany) {
      toast.error('You must register your corporate bio data first.');
      return;
    }

    try {
      toast.loading('Indexing career posting in cloud servers...', { id: 'post' });
      await jobService.createJob({
        title: jobTitle,
        category: jobCategory,
        location: jobCity ? `${jobCity}, ${jobCountry}` : jobCountry,
        country: jobCountry,
        city: jobCity,
        employmentType: jobType,
        workplaceType: jobWorkPlace,
        description: jobDesc,
        requirements: jobReq,
        responsibilities: jobResp,
        skills: jobSkillsLabel,
        salaryMin: Number(jobSalMin),
        salaryMax: Number(jobSalMax),
        currency: 'USD',
        status: 'approved', // Instant approved for instant test and deploy feedback loops
        deadline: jobDeadlineInput || '2026-12-31',
        applyType: jobMethod,
        applyLink: jobExtLink,
        email: jobEmpEmail,
        experienceLevel: jobExp,
        isVerifiedCompany: employerCompany.isVerified || true,
        companyName: employerCompany.name,
        companyLogo: employerCompany.logo,
        companyId: employerCompany.id,
        hiringOrganization: jobHiringOrg
      } as any);

      toast.success('Bespoke vacancy launched successfully!', { id: 'post' });
      
      // Clear forms
      setJobTitle('');
      setJobDesc('');
      setJobReq('');
      setJobResp('');
      setJobSkillsLabel('');
      setJobExtLink('');
      setJobEmpEmail('');
      setJobCity('');
      setJobCountry('Somalia');
      setJobHiringOrg('');

      fetchEmployerData();
      setActiveEmployerTab('jobs');
    } catch (err) {
      console.error(err);
      toast.error('Failed to post career opening in database.', { id: 'post' });
    }
  };

  // Update Status of Application Form
  const handleUpdateAppStatus = async (app: JobApplication, nextStatus: any) => {
    try {
      toast.loading('Syncing candidate state pipeline...', { id: 'triage' });
      await jobService.updateApplicationStatus(app.id, nextStatus, app.candidateId, app.jobTitle);
      toast.success(`Application set to ${nextStatus.toUpperCase()}`, { id: 'triage' });
      fetchEmployerData();
    } catch {
      toast.error('Failed to sync state.', { id: 'triage' });
    }
  };

  // Delete Job vacancy
  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting? Candidates will no longer be able to apply.')) return;
    try {
      toast.loading('Deleting career entry from cloud...', { id: 'del' });
      await jobService.deleteJob(jobId);
      toast.success('Listing permanently removed.', { id: 'del' });
      fetchEmployerData();
    } catch {
      toast.error('Could not delete from database.', { id: 'del' });
    }
  };

  // Gatekeeping unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-super-black text-white antialiased flex flex-col justify-center items-center px-4 md:px-6 pt-20">
        <div className="p-8 bg-[#0d0d0e] border border-white/5 rounded-3xl max-w-lg w-full text-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-luxury-gold/[0.01] to-transparent z-0" />
          <div className="relative z-10">
            <LogIn size={40} className="mx-auto text-emerald-400 mb-5" />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-400 block mb-2">Recruitment Portal</span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Employer Access Required</h2>
            <p className="text-sm text-white/60 leading-relaxed mt-3 max-w-sm mx-auto">
              Create an employer account or sign in to publish job opportunities.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-luxury-gold hover:bg-luxury-gold/90 text-super-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md inline-flex items-center justify-center gap-1.5"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/jobs')}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/90 font-bold text-xs rounded-xl transition-all cursor-pointer border border-white/10 inline-flex items-center justify-center"
              >
                &larr; View Public Jobs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-super-black text-white antialiased font-sans pt-20 flex flex-col">
      
      {/* Mini Breadcrumb Header */}
      <div className="bg-neutral-900 border-b border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-white/50 mb-1.5">
              <span className="hover:text-luxury-gold cursor-pointer" onClick={() => navigate('/jobs')}>AmaanJobs</span>
              <span>&bull;</span>
              <span className="text-white/80 font-semibold">Hiring Console</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white mb-1">
              Recruiter <span className="text-luxury-gold">Dashboard</span>
            </h1>
            <p className="text-xs text-white/50 font-medium">Verify your brand profile, post opportunities, and inspect candidate details.</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/jobs')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors border border-white/5 flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Back to Job Feed
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-4 md:px-6 py-8 flex-grow">
        
        {loading ? (
          <div className="h-96 flex flex-col justify-center items-center">
            <div className="w-10 h-10 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest animate-pulse">Synchronizing Employer Database context...</p>
          </div>
        ) : !employerCompany ? (
          /* Step 1: Corporate Registry */
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/[0.01] rounded-full blur-2xl" />
              <div className="flex gap-4 items-start mb-6 border-b border-white/5 pb-4">
                <div className="p-3 bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/10 rounded-2xl">
                  <Building2 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">Setup Recruiter Profile</h2>
                  <p className="text-xs text-white/50 mt-0.5">Please register your Corporate Brand biological data card to unlock career building functions.</p>
                </div>
              </div>

              <form onSubmit={handleRegisterCompany} className="space-y-5 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-white/60 uppercase tracking-wider text-[10px]">Company / Workspace Brand Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Hormuud Telecom"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.03] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold font-medium transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white/60 uppercase tracking-wider text-[10px]">Corporate Logo URL *</label>
                  <input 
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-... (Use high resolution logo URL)"
                    value={companyLogo}
                    onChange={e => setCompanyLogo(e.target.value)}
                    className="w-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.03] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold font-medium transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white/60 uppercase tracking-wider text-[10px]">What is the Company bio / mission statement? *</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Describe company operations, workspace team setting values, diaspora development goals..."
                    value={companyDesc}
                    onChange={e => setCompanyDesc(e.target.value)}
                    className="w-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.03] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold font-medium transition-colors leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-white/60 uppercase tracking-wider text-[10px]">HQ Location Precise Precise *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Mogadishu (or Hargeisa)"
                      value={companyLoc}
                      onChange={e => setCompanyLoc(e.target.value)}
                      className="w-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.03] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold font-medium transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-white/60 uppercase tracking-wider text-[10px]">Staff Scale Range</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 50-250 employees"
                      value={companySize}
                      onChange={e => setCompanySize(e.target.value)}
                      className="w-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.03] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold font-medium transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-white/60 uppercase tracking-wider text-[10px]">Corporate Website URL</label>
                    <input 
                      type="text" 
                      placeholder="e.g. https://company.so"
                      value={companyWeb}
                      onChange={e => setCompanyWeb(e.target.value)}
                      className="w-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.03] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold font-medium transition-colors"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-luxury-gold hover:bg-luxury-gold/90 text-super-black font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer text-xs"
                >
                  Create Recruiter Bio Profile &rarr;
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Step 2: Main workspace console layout */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="col-span-1 space-y-4">
              
              {/* Profile Card Summary */}
              <div className="p-5 bg-[#0e0e0e] border border-white/5 rounded-2xl block relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <img 
                    referrerPolicy="no-referrer"
                    src={employerCompany.logo} 
                    alt={employerCompany.name} 
                    className="w-12 h-12 rounded-xl object-contain border border-white/10 bg-white/5 p-1" 
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-white block text-sm truncate">{employerCompany.name}</span>
                    <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider mt-0.5">
                      <ShieldCheck size={11} /> Verified Partner
                    </span>
                  </div>
                </div>
              </div>

              {/* Side sub tab switches */}
              <div className="bg-neutral-900 border border-white/5 p-2 rounded-2xl flex flex-col gap-1">
                <button
                  onClick={() => setActiveEmployerTab('jobs')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-xs transition-all uppercase tracking-wider font-semibold cursor-pointer ${
                    activeEmployerTab === 'jobs' 
                      ? 'bg-luxury-gold/15 text-luxury-gold border-l-2 border-luxury-gold' 
                      : 'text-white/60 hover:bg-white/[0.03] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText size={15} /> My Jobs
                  </div>
                  <span className={`text-[10px] bg-white/10 px-2 py-0.5 rounded-md text-white font-bold`}>{myPostedJobs.length}</span>
                </button>

                <button
                  onClick={() => setActiveEmployerTab('post')}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-xs transition-all uppercase tracking-wider font-semibold cursor-pointer ${
                    activeEmployerTab === 'post' 
                      ? 'bg-luxury-gold/15 text-luxury-gold border-l-2 border-luxury-gold' 
                      : 'text-white/60 hover:bg-white/[0.03] hover:text-white'
                  }`}
                >
                  <PlusCircle size={15} /> Post Job
                </button>

                <button
                  onClick={() => setActiveEmployerTab('applications')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-xs transition-all uppercase tracking-wider font-semibold cursor-pointer ${
                    activeEmployerTab === 'applications' 
                      ? 'bg-luxury-gold/15 text-luxury-gold border-l-2 border-luxury-gold' 
                      : 'text-white/60 hover:bg-white/[0.03] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardCheck size={15} /> Applications
                  </div>
                  <span className={`text-[10px] bg-white/10 px-2 py-0.5 rounded-md text-white font-bold`}>{employerApplications.length}</span>
                </button>

                <button
                  onClick={() => setActiveEmployerTab('profile')}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-xs transition-all uppercase tracking-wider font-semibold cursor-pointer ${
                    activeEmployerTab === 'profile' 
                      ? 'bg-luxury-gold/15 text-luxury-gold border-l-2 border-luxury-gold' 
                      : 'text-white/60 hover:bg-white/[0.03] hover:text-white'
                  }`}
                >
                  <Building2 size={15} /> Company Profile
                </button>
              </div>

            </div>

            {/* Main Console Content Panel */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* 1. COMPANY PROFILE EDIT SCREEN */}
              {activeEmployerTab === 'profile' && (
                <div className="bg-[#0e0e0e] border border-white/5 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/[0.01] rounded-full blur-2xl" />
                  <div className="flex gap-4 items-start mb-6 border-b border-white/5 pb-4">
                    <div className="p-3 bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/10 rounded-2xl">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white uppercase tracking-wider">Company Profile Settings</h2>
                      <p className="text-xs text-white/50 mt-0.5">Manage your recruiter company information, branding details, and staff size.</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateCompany} className="space-y-5 text-xs text-left">
                    <div className="space-y-1.5">
                      <label className="font-bold text-white/60 uppercase tracking-wider text-[10px]">Company / Workspace Brand Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Hormuud Telecom"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        className="w-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.03] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold font-medium transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-white/60 uppercase tracking-wider text-[10px]">Corporate Logo URL *</label>
                      <input 
                        type="url"
                        required
                        placeholder="https://images.unsplash.com/photo-... (Use high resolution logo URL)"
                        value={companyLogo}
                        onChange={e => setCompanyLogo(e.target.value)}
                        className="w-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.03] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold font-medium transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-white/60 uppercase tracking-wider text-[10px]">What is the Company bio / mission statement? *</label>
                      <textarea 
                        rows={4}
                        required
                        placeholder="Describe company operations, workspace team setting values, diaspora development goals..."
                        value={companyDesc}
                        onChange={e => setCompanyDesc(e.target.value)}
                        className="w-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.03] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold font-medium transition-colors leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-bold text-white/60 uppercase tracking-wider text-[10px]">HQ Location *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Mogadishu (or Hargeisa)"
                          value={companyLoc}
                          onChange={e => setCompanyLoc(e.target.value)}
                          className="w-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.03] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold font-medium transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold text-white/60 uppercase tracking-wider text-[10px]">Staff Size Precise</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 50-250 employees"
                          value={companySize}
                          onChange={e => setCompanySize(e.target.value)}
                          className="w-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.03] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold font-medium transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold text-white/60 uppercase tracking-wider text-[10px]">Corporate Website URL</label>
                        <input 
                          type="text" 
                          placeholder="e.g. https://company.so"
                          value={companyWeb}
                          onChange={e => setCompanyWeb(e.target.value)}
                          className="w-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.03] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold font-medium transition-colors"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-3.5 bg-luxury-gold hover:bg-luxury-gold/90 text-super-black font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer text-xs"
                    >
                      Update Company Profile &rarr;
                    </button>
                  </form>
                </div>
              )}

              {/* 2. POST FRESH OPEN POSITION FORM */}
              {activeEmployerTab === 'post' && (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 shadow-sm">
                  <h3 className="font-bold text-white text-base uppercase tracking-wider mb-2 pb-2 border-b border-white/5 flex items-center gap-2">
                    <PlusCircle size={18} className="text-luxury-gold" /> Post New Job opening (Verified badge)
                  </h3>
                  <p className="text-xs text-white/50 mb-6">Detail career tasks, milestones, and choose candidate routing channels.</p>

                  <form onSubmit={handlePostJob} className="space-y-4 text-xs">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-white/50 uppercase tracking-wider text-[10px]">Vacancy Job Title*</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Lead Core Network Architect"
                          value={jobTitle}
                          onChange={e => setJobTitle(e.target.value)}
                          className="w-full border border-white/10 bg-white/[0.02] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-white/50 uppercase tracking-wider text-[10px]">Core category sector*</label>
                        <select 
                          value={jobCategory}
                          onChange={e => setJobCategory(e.target.value)}
                          className="w-full border border-white/10 bg-neutral-900 text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold"
                        >
                          {CATEGORIES.map(c => (
                            <option key={c} value={c} className="bg-neutral-900 text-white">{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-white/50 uppercase tracking-wider text-[10px]">Country*</label>
                        <select 
                          value={jobCountry}
                          onChange={e => setJobCountry(e.target.value)}
                          className="w-full border border-white/10 bg-neutral-900 text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold"
                          required
                        >
                          <option value="Somalia">Somalia</option>
                          <option value="Ethiopia">Ethiopia</option>
                          <option value="Kenya">Kenya</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-white/50 uppercase tracking-wider text-[10px]">City / Town / Area*</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Mogadishu, Hargeisa, Awbare, Nairobi"
                          value={jobCity}
                          onChange={e => setJobCity(e.target.value)}
                          className="w-full border border-white/10 bg-[#111112] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold placeholder-white/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-white/50 uppercase tracking-wider text-[10px]">Required Experience Level*</label>
                        <select 
                          value={jobExp}
                          onChange={e => setJobExp(e.target.value)}
                          className="w-full border border-white/10 bg-neutral-900 text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold"
                        >
                          {EXPERIENCE_LEVELS.map(exp => (
                            <option key={exp} value={exp} className="bg-neutral-900 text-white">{exp}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-white/50 uppercase tracking-wider text-[10px]">Workplace Setting style</label>
                        <select 
                          value={jobWorkPlace}
                          onChange={e => setJobWorkplace(e.target.value as any)}
                          className="w-full border border-white/10 bg-neutral-900 text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold"
                        >
                          <option value="on-site" className="bg-neutral-900 text-white">On-SitePrecinct</option>
                          <option value="hybrid" className="bg-neutral-900 text-white">Hybrid setting</option>
                          <option value="remote" className="bg-neutral-900 text-white">Diaspora Remote</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-white/50 uppercase tracking-wider text-[10px]">Employment Terms type*</label>
                        <select 
                          value={jobType}
                          onChange={e => setJobType(e.target.value as any)}
                          className="w-full border border-white/10 bg-neutral-900 text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold"
                        >
                          {EMPLOYMENT_TYPES.map(type => (
                            <option key={type} value={type} className="bg-neutral-900 text-white capitalize">{type.replace('-', ' ')}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-white/50 uppercase tracking-wider text-[10px]">Min Monthly Salary (USD)*</label>
                        <input 
                          type="number" 
                          required
                          value={jobSalMin}
                          onChange={e => setJobSalMin(Number(e.target.value))}
                          className="w-full border border-white/10 bg-white/[0.02] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-white/50 uppercase tracking-wider text-[10px]">Max Monthly Salary (USD)*</label>
                        <input 
                          type="number" 
                          required
                          value={jobSalMax}
                          onChange={e => setJobSalMax(Number(e.target.value))}
                          className="w-full border border-white/10 bg-white/[0.02] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-white/50 uppercase tracking-wider text-[10px]">Application Deadline Closing Precise*</label>
                      <input 
                        type="date"
                        required
                        value={jobDeadlineInput}
                        onChange={e => setJobDeadlineInput(e.target.value)}
                        className="w-full border border-white/10 bg-neutral-900 text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-white/50 uppercase tracking-wider text-[10px]">About the Job opening & Context Description *</label>
                      <textarea 
                        rows={4}
                        required
                        placeholder="Detail the daily operational processes, career context and workplace advantages..."
                        value={jobDesc}
                        onChange={e => setJobDesc(e.target.value)}
                        className="w-full border border-white/10 bg-white/[0.02] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-white/50 uppercase tracking-wider text-[10px]">Operational Responsibilities (bullet list - one per line)</label>
                      <textarea 
                        rows={3}
                        placeholder="• Manage core network performance&#10;• Coordinate 5G telemetry routing setups"
                        value={jobResp}
                        onChange={e => setJobResp(e.target.value)}
                        className="w-full border border-white/10 bg-white/[0.02] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-white/50 uppercase tracking-wider text-[10px]">Required Technical Credentials (bullet list - one per line)</label>
                      <textarea 
                        rows={3}
                        placeholder="• Level 3 Cisco CCNP/CCIE network infrastructure certified&#10;• 5+ years visual telecom coordination"
                        value={jobReq}
                        onChange={e => setJobReq(e.target.value)}
                        className="w-full border border-white/10 bg-white/[0.02] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-white/50 uppercase tracking-wider text-[10px]">Key Skills & Core Tech keywords (comma separated list)</label>
                      <input 
                        type="text"
                        placeholder="React, BGP routing, MPLS core, Supply Chain management"
                        value={jobSkillsLabel}
                        onChange={e => setJobSkillsLabel(e.target.value)}
                        className="w-full border border-white/10 bg-white/[0.02] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-white/50 uppercase tracking-wider text-[10px] text-emerald-400">🏢 Hiring Organization (e.g. UNHCR, WFP, Save the Children)*</label>
                      <input 
                        type="text"
                        required
                        placeholder="Who is actually hiring? e.g. Lutheran World Federation (LWF)"
                        value={jobHiringOrg}
                        onChange={e => setJobHiringOrg(e.target.value)}
                        className="w-full border border-white/10 bg-[#111112] text-white rounded-xl p-3 focus:outline-none focus:border-emerald-400 font-medium placeholder-white/20"
                      />
                      <p className="text-[10px] text-white/40 mt-1">
                        Enter the specific organization or agency that is conducting the hire. This is distinct from the publishing agency.
                      </p>
                    </div>

                    {/* Routing Options */}
                    <div className="p-4 bg-white/[0.01] rounded-2xl border border-white/10 space-y-4">
                      <label className="font-bold text-luxury-gold uppercase tracking-wider text-[10px] block">
                        🎯 4. Choose Application Routing Channel
                      </label>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <label className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                            jobMethod === 'internal' 
                              ? 'bg-white/10 border-luxury-gold ring-2 ring-luxury-gold/25' 
                              : 'bg-white/[0.01] hover:bg-white/5 border-white/10'
                        }`}>
                          <span className="font-bold text-white text-[11px] flex items-center gap-1">
                            <Database size={13} /> Internal Apply
                          </span>
                          <span className="text-[9px] text-white/50 mt-0.5">Stored in database candidates portfolio.</span>
                          <input 
                            type="radio" 
                            name="jobMethod" 
                            checked={jobMethod === 'internal'} 
                            onChange={() => setJobMethod('internal')} 
                            className="hidden" 
                          />
                        </label>

                        <label className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                            jobMethod === 'external' 
                              ? 'bg-white/10 border-luxury-gold ring-2 ring-luxury-gold/25' 
                              : 'bg-white/[0.01] hover:bg-white/5 border-white/10'
                        }`}>
                          <span className="font-bold text-white text-[11px] flex items-center gap-1">
                            <Globe size={13} /> External link URL
                          </span>
                          <span className="text-[9px] text-white/50 mt-0.5">Redirect applicant directly to ATS.</span>
                          <input 
                            type="radio" 
                            name="jobMethod" 
                            checked={jobMethod === 'external'} 
                            onChange={() => setJobMethod('external')} 
                            className="hidden" 
                          />
                        </label>

                        <label className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                            jobMethod === 'email' 
                              ? 'bg-white/10 border-luxury-gold ring-2 ring-luxury-gold/25' 
                              : 'bg-white/[0.01] hover:bg-white/5 border-white/10'
                        }`}>
                          <span className="font-bold text-white text-[11px] flex items-center gap-1">
                            <Mail size={13} /> Corporate email
                          </span>
                          <span className="text-[9px] text-white/50 mt-0.5">Sends formatted details straight to inbox.</span>
                          <input 
                            type="radio" 
                            name="jobMethod" 
                            checked={jobMethod === 'email'} 
                            onChange={() => setJobMethod('email')} 
                            className="hidden" 
                          />
                        </label>
                      </div>

                      {jobMethod === 'external' && (
                        <div className="space-y-1.5 animate-fade-in">
                          <label className="font-bold text-white/70 uppercase tracking-wider text-[10px]">Provide External ATS apply link URL*</label>
                          <input 
                            type="url"
                            required
                            placeholder="https://company.bamboohr.com/jobs/apply"
                            value={jobExtLink}
                            onChange={e => setJobExtLink(e.target.value)}
                            className="w-full border border-white/10 bg-white/[0.02] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold"
                          />
                        </div>
                      )}

                      {jobMethod === 'email' && (
                        <div className="space-y-1.5 animate-fade-in">
                          <label className="font-bold text-luxury-gold uppercase tracking-wider text-[10px]">Provide Corporate Careers Inbox Email*</label>
                          <input 
                            type="email"
                            required
                            placeholder="careers@company.com"
                            value={jobEmpEmail}
                            onChange={e => setJobEmpEmail(e.target.value)}
                            className="w-full border border-white/10 bg-white/[0.02] text-white rounded-xl p-3 focus:outline-none focus:border-luxury-gold"
                          />
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-3.5 bg-luxury-gold hover:bg-luxury-gold/90 text-super-black font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer text-xs"
                    >
                      Broadcast Career Position Open &rarr;
                    </button>
                  </form>
                </div>
              )}

              {/* 3. MANAGE JOBS LIST */}
              {activeEmployerTab === 'jobs' && (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                      Your Posted career openings ({myPostedJobs.length})
                    </h3>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Active & Approved</span>
                  </div>

                  {myPostedJobs.length === 0 ? (
                    <div className="text-center py-12 text-white/40">
                      You have not published any career openings yet. Navigate to &ldquo;Broadcast new vacancy&rdquo; tab to seed one!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myPostedJobs.map(job => (
                        <div key={job.id} className="p-4 bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
                          <div className="min-w-0">
                            <span className="font-bold text-white block text-sm leading-tight hover:text-luxury-gold cursor-pointer" onClick={() => navigate(`/job/${job.id}`)}>{job.title}</span>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/50 mt-1 capitalize font-medium">
                              <span className="flex items-center gap-1"><MapPin size={12} className="text-white/30" /> {job.location}</span>
                              <span className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold text-white">{job.employmentType}</span>
                              <span className="text-emerald-400 font-bold font-mono">${job.salaryMin} - ${job.salaryMax} / mo</span>
                            </div>
                          </div>

                          <div className="flex gap-2 self-end sm:self-center shrink-0">
                            <button 
                              onClick={() => navigate(`/job/${job.id}`)}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                            >
                              Inspect Details
                            </button>
                            <button 
                              onClick={() => handleDeleteJob(job.id)}
                              className="p-1.5 bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white rounded-lg cursor-pointer transition-all border border-red-500/10"
                              title="Delete position"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 4. CANDIDATES APPLICATIONS */}
              {activeEmployerTab === 'applications' && (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-sm space-y-6">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-2 pb-2 border-b border-white/5 flex items-center justify-between">
                    <span>📋 Candidates Applications Registry ({employerApplications.length})</span>
                    <ClipboardCheck size={16} className="text-luxury-gold" />
                  </h3>

                  {employerApplications.length === 0 ? (
                    <div className="text-center py-12 text-white/40">
                      Active pipeline is empty. Candidates can apply internally using the simple candidate form.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {employerApplications.map(app => (
                        <div key={app.id} className="p-4 bg-white/[0.02] border border-white/10 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-white text-sm block">{app.candidateName}</span>
                              <span className="px-2 py-0.5 bg-luxury-gold/20 text-luxury-gold font-extrabold tracking-wider rounded text-[9px] uppercase">
                                {app.jobTitle}
                              </span>
                            </div>
                            <div className="text-white/50 text-[11px] font-medium flex gap-3">
                              <span>Phone: {app.candidatePhone}</span> &bull; <span>Email: {app.candidateEmail}</span>
                            </div>
                            <p className="text-white/80 italic bg-black/40 p-3 text-[11px] rounded-lg mt-2.5 border border-white/5 whitespace-pre-line leading-relaxed">
                              &ldquo;{app.coverLetter}&rdquo;
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                            <span className="font-bold text-white/50 uppercase tracking-widest text-[9px]">Triage pipeline:</span>
                            <select 
                              value={app.status}
                              onChange={(e) => handleUpdateAppStatus(app as any, e.target.value as any)}
                              className="border border-white/10 bg-[#0d0d0d] rounded-lg p-2 text-xs font-bold text-white hover:border-luxury-gold focus:outline-none cursor-pointer uppercase tracking-wider"
                            >
                              <option value="pending" className="bg-neutral-900 text-white">Pending Review</option>
                              <option value="reviewed" className="bg-neutral-900 text-white">Reviewed Bio</option>
                              <option value="shortlisted" className="bg-neutral-900 text-white font-semibold">Shortlist candidate</option>
                              <option value="rejected" className="bg-neutral-900 text-white text-rose-400">Reject & Kept</option>
                              <option value="hired" className="bg-neutral-900 text-white text-emerald-400">Hired 🎉</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
