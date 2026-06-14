import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Plus, Briefcase, FileText, Building, Users, FileSignature, 
  HelpCircle, CheckCircle, XCircle, Sparkles, TrendingUp, Search, Calendar, 
  MapPin, DollarSign, Trash2, ShieldCheck, Check, Edit, Mail, Phone, 
  ExternalLink, Loader2, Award, Zap, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jobService } from '@/services/jobService';
import { Job, CompanyProfile, CandidateProfile, JobApplication } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import PremiumSelect from '@/components/ui/PremiumSelect';

type TabType = 
  | 'overview' 
  | 'post' 
  | 'manage' 
  | 'applications' 
  | 'companies' 
  | 'candidates' 
  | 'drafts' 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'featured' 
  | 'analytics';

export default function DashboardJobs() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);

  // Firestore Data State
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Form states for creating/editing a Job
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Construction');
  const [formLocation, setFormLocation] = useState('Mogadishu');
  const [formEmployment, setFormEmployment] = useState<'full-time' | 'part-time' | 'remote' | 'contract' | 'freelance'>('full-time');
  const [formWorkplace, setFormWorkplace] = useState<'on-site' | 'hybrid' | 'remote'>('on-site');
  const [formSalaryMin, setFormSalaryMin] = useState(1500);
  const [formSalaryMax, setFormSalaryMax] = useState(3500);
  const [formDescription, setFormDescription] = useState('');
  const [formRequirements, setFormRequirements] = useState('');
  const [formBenefits, setFormBenefits] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formFeaturedImage, setFormFeaturedImage] = useState('');
  const [formIsUrgent, setFormIsUrgent] = useState(false);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formHiringOrg, setFormHiringOrg] = useState('');

  // Constants
  const CATEGORIES = ['Construction', 'Engineering', 'Architecture', 'Real Estate', 'Logistics', 'Administration', 'Sales & Marketing', 'Legal', 'IT Support'];
  const CITIES = ['Mogadishu', 'Hargeisa', 'Garowe', 'Kismayo', 'Bosaso', 'Baidoa', 'Beletweyne', 'Burao', 'Jigjiga', 'Diredawa', 'Addis Ababa'];

  // Load all jobs workspace records
  const loadWorkspaceData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch datasets
      const fetchedJobs = await jobService.getJobs({ status: 'draft' }); // fetch drafts
      const approvedJobs = await jobService.getJobs({ status: 'approved' });
      const pendingJobs = await jobService.getJobs({ status: 'pending' });
      const expiredJobs = await jobService.getJobs({ status: 'expired' });
      const rejectedJobs = await jobService.getJobs({ status: 'rejected' });

      // Combine safely
      const jobsMap = new Map<string, Job>();
      [...fetchedJobs, ...approvedJobs, ...pendingJobs, ...expiredJobs, ...rejectedJobs].forEach(j => {
        jobsMap.set(j.id, j);
      });
      const combined = Array.from(jobsMap.values());
      
      // Sort in memory desc
      combined.sort((a, b) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return dateB - dateA;
      });

      setAllJobs(combined);

      // Fetch other sub-collections
      const fetchedCompanies = await jobService.getCompanies();
      setCompanies(fetchedCompanies);

      const fetchedApps = await jobService.getAllApplications();
      setApplications(fetchedApps);

      const fetchedCand = await jobService.getAllCandidateProfiles();
      setCandidates(fetchedCand);

    } catch (error) {
      console.error('Failed to load jobs workspace datasets:', error);
      toast.error('Partial database loading issue. Ensure connection is active.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  // Clean form
  const resetForm = () => {
    setEditingJobId(null);
    setFormTitle('');
    setFormCategory('Construction');
    setFormLocation('Mogadishu');
    setFormEmployment('full-time');
    setFormWorkplace('on-site');
    setFormSalaryMin(1500);
    setFormSalaryMax(3550);
    setFormDescription('');
    setFormRequirements('');
    setFormBenefits('');
    setFormDeadline('');
    setFormFeaturedImage('');
    setFormIsUrgent(false);
    setFormIsFeatured(false);
    setFormHiringOrg('');
  };

  // Submit Job creation/editing
  const handleSaveJob = async (statusOverride?: 'draft' | 'approved' | 'pending') => {
    if (!formTitle.trim() || !formDescription.trim()) {
      toast.error('Title and Description are absolutely required fields.');
      return;
    }
    try {
      const payload = {
        title: formTitle,
        category: formCategory,
        location: formLocation,
        employmentType: formEmployment,
        workplaceType: formWorkplace,
        salaryMin: formSalaryMin,
        salaryMax: formSalaryMax,
        description: formDescription,
        requirements: formRequirements,
        benefits: formBenefits,
        deadline: formDeadline,
        featuredImage: formFeaturedImage || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80',
        isUrgent: formIsUrgent,
        isFeatured: formIsFeatured,
        status: statusOverride || (editingJobId ? undefined : 'approved'), // Admins publish instantly by default
        companyId: companies[0]?.id || 'admin-workplace',
        companyName: companies[0]?.name || 'AmaanEstate Executive Dev Workspace',
        companyLogo: companies[0]?.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=100&q=80',
        hiringOrganization: formHiringOrg
      };

      if (editingJobId) {
        await jobService.updateJob(editingJobId, payload);
        toast.success('Job details successfully upgraded!');
      } else {
        await jobService.createJob(payload as any);
        toast.success('Professional Listing published directly to feed panels!');
      }
      resetForm();
      setActiveTab('manage');
      loadWorkspaceData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to commit database modifications.');
    }
  };

  // Quick action: status change
  const handleUpdateJobStatus = async (jobId: string, status: 'approved' | 'rejected' | 'pending' | 'draft' | 'expired') => {
    try {
      await jobService.updateJob(jobId, { status });
      toast.success(`Job status changed to ${status.toUpperCase()}`);
      loadWorkspaceData();
    } catch (err) {
      toast.error('Modification failed.');
    }
  };

  // Quick action: feature change
  const handleToggleJobFeatured = async (jobId: string, isFeatured: boolean) => {
    try {
      await jobService.updateJob(jobId, { isFeatured });
      toast.success(isFeatured ? 'Set as FEATURED on homepage lists!' : 'Removed from featured listings.');
      loadWorkspaceData();
    } catch (err) {
      toast.error('Operation failed.');
    }
  };

  // Quick action: deletion
  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Do you really want to permanently clean this career opening?')) return;
    try {
      await jobService.deleteJob(jobId);
      toast.success('Career position removed from cloud listings.');
      loadWorkspaceData();
    } catch (err) {
      toast.error('Deletion issue.');
    }
  };

  // Quick action: company vetting verification status
  const handleVerifyCompany = async (companyId: string, verify: boolean) => {
    try {
      await jobService.updateCompany(companyId, {
        isVerified: verify,
        status: verify ? 'approved' : 'rejected'
      });
      toast.success(verify ? 'Company verified! Status is active & badged' : 'Company deactivated.');
      loadWorkspaceData();
    } catch (err) {
      toast.error('Failed to review company profile status.');
    }
  };

  // Quick action: Application Status triage
  const handleTriageApplication = async (app: JobApplication, status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired') => {
    try {
      await jobService.updateApplicationStatus(app.id, status, app.candidateId, app.jobTitle);
      toast.success(`Candidate state set to: ${status.toUpperCase()}`);
      loadWorkspaceData();
    } catch (err) {
      toast.error('Candidate triage update failed.');
    }
  };

  // Pre-populate Edit
  const startEditJob = (job: Job) => {
    setEditingJobId(job.id);
    setFormTitle(job.title);
    setFormCategory(job.category);
    setFormLocation(job.location);
    setFormEmployment(job.employmentType);
    setFormWorkplace(job.workplaceType);
    setFormSalaryMin(job.salaryMin);
    setFormSalaryMax(job.salaryMax);
    setFormDescription(job.description);
    setFormRequirements(job.requirements || '');
    setFormBenefits(job.benefits || '');
    setFormDeadline(job.deadline || '');
    setFormFeaturedImage(job.featuredImage || '');
    setFormIsUrgent(job.isUrgent || false);
    setFormIsFeatured(job.isFeatured || false);
    setFormHiringOrg(job.hiringOrganization || '');
    setActiveTab('post');
  };

  // Filtering Logic
  const filteredJobs = useMemo(() => {
    return allJobs.filter(job => {
      const matchSearch = String(job.title).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          String(job.companyName).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(job.hiringOrganization || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === 'All' || job.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [allJobs, searchTerm, categoryFilter]);

  // Specific Sub-Sets
  const draftJobs = useMemo(() => filteredJobs.filter(j => j.status === 'draft'), [filteredJobs]);
  const pendingReviewJobs = useMemo(() => filteredJobs.filter(j => j.status === 'pending'), [filteredJobs]);
  const approvedJobs = useMemo(() => filteredJobs.filter(j => j.status === 'approved'), [filteredJobs]);
  const rejectedJobs = useMemo(() => filteredJobs.filter(j => j.status === 'rejected'), [filteredJobs]);
  const featuredJobs = useMemo(() => filteredJobs.filter(j => j.isFeatured), [filteredJobs]);

  // Metrics Counters
  const metrics = useMemo(() => {
    const totalJobs = allJobs.length;
    const totalApps = applications.length;
    const totalCompanies = companies.length;
    const totalCand = candidates.length;

    const activeCount = allJobs.filter(j => j.status === 'approved').length;
    const pendingCount = allJobs.filter(j => j.status === 'pending').length;
    const draftCount = allJobs.filter(j => j.status === 'draft').length;
    const featuredCount = allJobs.filter(j => j.isFeatured).length;

    const hiredApplicationsCount = applications.filter(a => a.status === 'hired').length;
    const shortlistedCount = applications.filter(a => a.status === 'shortlisted').length;
    const rejectedApplicationsCount = applications.filter(a => a.status === 'rejected').length;

    // Calculate distributions
    const catDistribution: { [key: string]: number } = {};
    allJobs.forEach(j => {
      catDistribution[j.category] = (catDistribution[j.category] || 0) + 1;
    });

    const averageSalary = allJobs.length 
      ? Math.round(allJobs.reduce((sum, j) => sum + (j.salaryMin + j.salaryMax) / 2, 0) / totalJobs)
      : 0;

    return {
      totalJobs,
      totalApps,
      totalCompanies,
      totalCand,
      activeCount,
      pendingCount,
      draftCount,
      featuredCount,
      hiredApplicationsCount,
      shortlistedCount,
      rejectedApplicationsCount,
      averageSalary,
      catDistribution
    };
  }, [allJobs, applications, companies, candidates]);

  // Sidebar Menu List matching standard
  const sideSubTabs: { label: string; value: TabType; icon: React.ReactNode; count?: number }[] = [
    { label: 'Jobs Overview', value: 'overview', icon: <LayoutDashboard size={14} /> },
    { label: 'Post New Job', value: 'post', icon: <Plus size={14} /> },
    { label: 'Manage Jobs', value: 'manage', icon: <Briefcase size={14} />, count: allJobs.length },
    { label: 'Job Applications', value: 'applications', icon: <FileText size={14} />, count: applications.length },
    { label: 'Companies', value: 'companies', icon: <Building size={14} />, count: companies.length },
    { label: 'Candidate Profiles', value: 'candidates', icon: <Users size={14} />, count: candidates.length },
    { label: 'Draft Jobs', value: 'drafts', icon: <FileSignature size={14} />, count: metrics.draftCount },
    { label: 'Pending Review', value: 'pending', icon: <HelpCircle size={14} />, count: metrics.pendingCount },
    { label: 'Approved Jobs', value: 'approved', icon: <CheckCircle size={14} />, count: metrics.activeCount },
    { label: 'Rejected Jobs', value: 'rejected', icon: <XCircle size={14} />, count: allJobs.filter(j => j.status === 'rejected').length },
    { label: 'Featured Jobs', value: 'featured', icon: <Sparkles size={14} />, count: metrics.featuredCount },
    { label: 'Job Analytics', value: 'analytics', icon: <TrendingUp size={14} /> },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Upper Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-display font-medium tracking-tight">
            Careers & <span className="gold-text-gradient">Hiring Center</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 block mt-1.5 font-bold">AmaanEstate Enterprise ATS Platform</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => { resetForm(); setActiveTab('post'); }}
            className="bg-luxury-gold hover:bg-white text-black text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all h-auto cursor-pointer"
          >
            <Plus size={14} className="mr-1.5" /> Post New Job
          </Button>
          <Button 
            variant="outline"
            onClick={loadWorkspaceData}
            className="border-white/10 hover:bg-white/5 text-xs uppercase tracking-wider h-auto py-2.5 rounded-xl cursor-pointer"
          >
            Refresh Records
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* ATS Space Left Sub Navigation */}
        <div className="lg:col-span-1 space-y-2">
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl block lg:hidden">
            <PremiumSelect
              label="Navigate Modules"
              value={activeTab}
              onChange={(val) => setActiveTab(val as TabType)}
              options={sideSubTabs.map(st => ({ label: st.label, value: st.value }))}
              icon={<LayoutDashboard size={14} />}
            />
          </div>

          <div className="hidden lg:block bg-black/40 border border-white/5 p-3.5 rounded-3xl space-y-1">
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 block pl-4 pb-3 pt-1 font-bold">ATS Operations</span>
            {sideSubTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`w-full flex items-center justify-between pl-4 pr-3.5 py-3 rounded-xl text-left text-xs transition-all uppercase tracking-wider font-semibold cursor-pointer group ${
                  activeTab === tab.value 
                    ? 'bg-luxury-gold/15 text-luxury-gold border-l-2 border-luxury-gold' 
                    : 'text-white/60 hover:bg-white/[0.03] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={activeTab === tab.value ? 'text-luxury-gold' : 'text-white/40 group-hover:text-luxury-gold transition-colors'}>
                    {tab.icon}
                  </span>
                  <span className="text-[10px] tracking-widest">{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                    activeTab === tab.value 
                      ? 'bg-luxury-gold/20 text-luxury-gold' 
                      : 'bg-white/5 text-white/50 group-hover:bg-white/10'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ATS SPACE MAIN CONTENT PANELS */}
        <div className="lg:col-span-3 min-h-[500px]">
          {loading ? (
            <div className="w-full h-96 flex flex-col items-center justify-center bg-black/40 border border-white/5 rounded-3xl">
              <Loader2 className="animate-spin text-luxury-gold mb-4" size={32} />
              <p className="text-xs uppercase tracking-[0.3em] text-white/40 font-bold">Loading Database Records...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                
                {/* 1. JOBS OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Bento Stat Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Vetted Vacancies', value: metrics.totalJobs, change: `${metrics.activeCount} Live, ${metrics.pendingCount} Review`, icon: <Briefcase className="text-indigo-400" /> },
                        { label: 'Applications Filed', value: metrics.totalApps, change: `${metrics.hiredApplicationsCount} Success Hires`, icon: <FileText className="text-[#C5A059]" /> },
                        { label: 'Workspace Brands', value: metrics.totalCompanies, change: 'Vetted Recruiters', icon: <Building className="text-emerald-400" /> },
                        { label: 'Talent Pool Base', value: metrics.totalCand, change: 'Interactive Profiles', icon: <Users className="text-pink-400" /> },
                      ].map((card, i) => (
                        <div key={i} className="glass-card p-5 rounded-2xl relative overflow-hidden group">
                          <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-500" />
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 block font-bold">{card.label}</span>
                            <div className="p-2 bg-white/5 border border-white/10 rounded-xl shrink-0">
                              {card.icon}
                            </div>
                          </div>
                          <span className="text-2xl md:text-3xl font-bold text-white block leading-none mb-1">{card.value}</span>
                          <span className="text-[10px] text-gray-500 block font-medium leading-tight">{card.change}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pending Moderation Notice Section Alert */}
                    {metrics.pendingCount > 0 && (
                      <div className="p-5 bg-amber-500/10 border border-amber-500/15 rounded-3xl flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-amber-500/20 text-amber-500 border border-amber-500/25 rounded-2xl flex items-center justify-center shrink-0">
                            <Zap size={18} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">Vacancies Pending Moderation Review</h4>
                            <p className="text-xs text-gray-300 mt-0.5">There are currently {metrics.pendingCount} listings awaiting legal or corporate compliance checks before public publishing.</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setActiveTab('pending')}
                          className="bg-amber-500 hover:bg-white text-black text-[10px] font-bold uppercase tracking-wider px-4 py-2 h-auto shrink-0 rounded-xl cursor-pointer"
                        >
                          Check Queue
                        </Button>
                      </div>
                    )}

                    {/* Split Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Sub-Panel: Action Center Summaries */}
                      <div className="glass-card p-6 rounded-3xl space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-white">Amaan Careers Operations Control</span>
                          <Award size={16} className="text-luxury-gold animate-pulse" />
                        </div>
                        <div className="space-y-4 text-xs text-gray-400">
                          <p className="leading-relaxed">This interactive administrative environment ensures 100% compliant diaspora employment mapping. Track vacancies, review companies credentials, verify candidates, and dispatch live alerts.</p>
                          
                          <div className="space-y-2 border-t border-white/5 pt-4">
                            <div className="flex justify-between text-[11px] font-medium py-1">
                              <span>Instant Publishing Bypass Enabled</span>
                              <span className="text-emerald-400 font-bold uppercase">Dev Active</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-medium py-1">
                              <span>Compliant Index Schema Persisted</span>
                              <span className="text-emerald-400 font-bold uppercase">Ready</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-medium py-1">
                              <span>Global Placements Yield Rate</span>
                              <span className="text-[#C5A059] font-bold">78.5%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sub-Panel: Recent Activity Feeds */}
                      <div className="glass-card p-6 rounded-3xl space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-white">Talent Applications Pipeline Feed</span>
                          <span className="text-[10px] text-[#C5A059] font-bold">{applications.slice(0, 3).length} New</span>
                        </div>
                        
                        {applications.length === 0 ? (
                          <div className="text-center py-6 text-gray-500 text-xs text-opacity-40">Pipeline feed empty. Waiting for applicant data.</div>
                        ) : (
                          <div className="space-y-3">
                            {applications.slice(0, 3).map(app => (
                              <div key={app.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between text-xs transition-colors hover:bg-white/[0.02]">
                                <div>
                                  <span className="text-white font-bold block">{app.candidateName}</span>
                                  <span className="text-[9px] text-gray-500 uppercase block tracking-wider mt-0.5">{app.jobTitle}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                                  app.status === 'hired' ? 'bg-emerald-500/15 text-emerald-400' :
                                  app.status === 'shortlisted' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-white/5 text-gray-400'
                                }`}>
                                  {app.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. POST NEW JOB / EDIT */}
                {activeTab === 'post' && (
                  <div className="glass-card p-8 rounded-3xl space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                        {editingJobId ? 'Edit Vetted Position Characteristics' : 'Publish Bespoke Listing Instant broadcast'}
                      </h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Provide careers information for public search indexing</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                      <div>
                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Vacancy Job Title*</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g. Lead CAD Surveyor" 
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-[#C5A059] font-semibold"
                        />
                      </div>

                      <PremiumSelect
                        label="Vacancy Category*"
                        value={formCategory}
                        onChange={setFormCategory}
                        options={CATEGORIES}
                        icon={<Briefcase size={14} />}
                      />

                      <PremiumSelect
                        label="Location Precinct*"
                        value={formLocation}
                        onChange={setFormLocation}
                        options={CITIES}
                        icon={<MapPin size={14} />}
                      />

                      <PremiumSelect
                        label="Workplace Style*"
                        value={formWorkplace}
                        onChange={(val) => setFormWorkplace(val as any)}
                        options={[
                          { label: 'On-Site (Precinct HQ)', value: 'on-site' },
                          { label: 'Hybrid (Flexible Coordinates)', value: 'hybrid' },
                          { label: 'Fully Remote (Diaspora)', value: 'remote' }
                        ]}
                        icon={<Building size={14} />}
                      />

                      <PremiumSelect
                        label="Employment Terms*"
                        value={formEmployment}
                        onChange={(val) => setFormEmployment(val as any)}
                        options={[
                          { label: 'Full-Time Career', value: 'full-time' },
                          { label: 'Part-Time Role', value: 'part-time' },
                          { label: 'Remote Contractor', value: 'remote' },
                          { label: 'Compliance Contract', value: 'contract' },
                          { label: 'Freelance Workspace', value: 'freelance' }
                        ]}
                        icon={<Clock size={14} />}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Min Salary (USD/mo)*</label>
                          <input 
                            type="number" 
                            value={formSalaryMin}
                            onChange={(e) => setFormSalaryMin(Number(e.target.value))}
                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Max Salary (USD/mo)*</label>
                          <input 
                            type="number" 
                            value={formSalaryMax}
                            onChange={(e) => setFormSalaryMax(Number(e.target.value))}
                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[10px] text-[var(--font-sans)] text-zinc-500 font-bold uppercase block mb-1">Featured Banner Graphic URL</label>
                        <input 
                          type="url" 
                          placeholder="https://images.unsplash.com/photo-..." 
                          value={formFeaturedImage}
                          onChange={(e) => setFormFeaturedImage(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">🏢 Hiring Organization (e.g. UNHCR, WFP, Save the Children)*</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Lutheran World Federation (LWF)" 
                          value={formHiringOrg}
                          onChange={(e) => setFormHiringOrg(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-medium placeholder-white/20"
                        />
                        <p className="text-[9px] text-white/40 mt-1">Specify which agency/body originally published or is funding the assignment.</p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Vacancy Role context & Overview*</label>
                        <textarea 
                          rows={6} 
                          required
                          placeholder="Detail daily operating schedules, milestones, team context..." 
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none leading-relaxed"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Operational Requirements (One per line)</label>
                        <textarea 
                          rows={3} 
                          placeholder="• Minimum 3 years CAD coordination experience&#10;• Civil architectural vetting degree" 
                          value={formRequirements}
                          onChange={(e) => setFormRequirements(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none leading-relaxed"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Corporate Benefits (One per line)</label>
                        <textarea 
                          rows={2} 
                          placeholder="• Comprehensive diaspora visual health cover&#10;• Fully provisioned transport allowance" 
                          value={formBenefits}
                          onChange={(e) => setFormBenefits(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Closing Application Deadline</label>
                        <input 
                          type="date" 
                          value={formDeadline}
                          onChange={(e) => setFormDeadline(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>

                      {/* Urgency & Features */}
                      <div className="flex flex-col gap-3 py-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={formIsUrgent}
                            onChange={(e) => setFormIsUrgent(e.target.checked)}
                            className="accent-luxury-gold shrink-0 w-4 h-4" 
                          />
                          <span className="text-[11px] text-gray-300 font-semibold uppercase tracking-wider">Mark as URGENT hiring status</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={formIsFeatured}
                            onChange={(e) => setFormIsFeatured(e.target.checked)}
                            className="accent-luxury-gold shrink-0 w-4 h-4" 
                          />
                          <span className="text-[11px] text-gray-300 font-semibold uppercase tracking-wider">Highlight as FEATURED homepage position</span>
                        </label>
                      </div>

                    </div>

                    <div className="flex gap-3 justify-end pt-6 border-t border-white/5">
                      <Button 
                        variant="ghost" 
                        onClick={resetForm}
                        className="text-xs uppercase tracking-wider py-2.5 px-6 rounded-xl text-gray-400 hover:text-white"
                      >
                        Reset All
                      </Button>
                      <Button 
                        onClick={() => handleSaveJob('draft')}
                        className="bg-neutral-800 hover:bg-neutral-700 text-gray-200 text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-xl"
                      >
                        Save Draft
                      </Button>
                      <Button 
                        onClick={() => handleSaveJob('approved')}
                        className="bg-luxury-gold hover:bg-white text-black text-xs font-bold uppercase tracking-wider py-2.5 px-8 rounded-xl"
                      >
                        {editingJobId ? 'Upgrade Vacancy' : 'Publish Vacancy Instant'}
                      </Button>
                    </div>

                  </div>
                )}

                {/* 3. MANAGE JOBS */}
                {activeTab === 'manage' && (
                  <div className="space-y-6">
                    {/* Inline Filter */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-white/30" size={16} />
                        <input 
                          type="text" 
                          placeholder="Search listed job titles, company brands..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>
                      <PremiumSelect
                        label=""
                        value={categoryFilter}
                        onChange={setCategoryFilter}
                        options={[{ label: 'All Categories', value: 'All' }, ...CATEGORIES]}
                        icon={<Briefcase size={14} />}
                        className="md:w-64"
                      />
                    </div>

                    {filteredJobs.length === 0 ? (
                      <div className="text-center py-16 bg-black/35 border border-white/5 rounded-3xl text-gray-500 text-xs">
                        No career positions matching filters found.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredJobs.map(job => (
                          <div key={job.id} className="p-5 bg-[#0e0e0e] border border-white/5 rounded-3xl flex flex-col md:flex-row justify-between md:items-center gap-6 group transition-all duration-300 hover:border-white/10">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-base text-white hover:text-luxury-gold transition-colors">{job.title}</h3>
                                {job.isFeatured && (
                                  <span className="flex items-center gap-0.5 px-2 py-0.5 bg-luxury-gold/15 text-luxury-gold text-[9px] font-bold uppercase border border-luxury-gold/20 rounded-md">
                                    <Sparkles size={8} /> Featured
                                  </span>
                                )}
                                {job.isUrgent && (
                                  <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[9px] font-bold uppercase border border-red-500/20 rounded-md">
                                    Urgent
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-400">
                                <span className="flex items-center gap-1"><Building size={12} className="text-[#C5A059]" /> {job.companyName}</span>
                                <span className="flex items-center gap-1"><MapPin size={12} className="text-gray-500" /> {job.location}</span>
                                <span className="flex items-center gap-1"><DollarSign size={12} className="text-emerald-400" /> {job.salaryMin} - {job.salaryMax} / mo</span>
                                <span className="px-2 py-0.5 bg-white/5 text-gray-300 font-medium text-[10px] uppercase rounded-md">{job.employmentType}</span>
                              </div>
                              <p className="text-xs text-gray-500 max-w-2xl line-clamp-2 leading-relaxed">{job.description}</p>
                            </div>

                            <div className="flex flex-wrap gap-2.5 shrink-0 items-center justify-end">
                              {/* Feature button */}
                              <button 
                                onClick={() => handleToggleJobFeatured(job.id, !job.isFeatured)}
                                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                                  job.isFeatured 
                                    ? 'bg-luxury-gold/10 text-luxury-gold border-luxury-gold/30 hover:bg-[#C5A059] hover:text-black' 
                                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                                }`}
                                title="Toggle Featured Status"
                              >
                                <Sparkles size={13} />
                              </button>

                              {/* Status triage buttons */}
                              <select 
                                value={job.status}
                                onChange={(e) => handleUpdateJobStatus(job.id, e.target.value as any)}
                                className="bg-black border border-white/10 rounded-xl px-3 py-2 text-[11px] font-bold uppercase text-white focus:outline-none"
                              >
                                <option value="draft">Draft</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="expired">Expired</option>
                              </select>

                              {/* Edit Button */}
                              <button 
                                onClick={() => startEditJob(job)}
                                className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/10 cursor-pointer transition-all"
                                title="Edit vacancy parameters"
                              >
                                <Edit size={13} />
                              </button>

                              {/* Delete button */}
                              <button 
                                onClick={() => handleDeleteJob(job.id)}
                                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/10 cursor-pointer transition-all"
                                title="Delete Listed Vacancy"
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

                {/* 4. JOB APPLICATIONS */}
                {activeTab === 'applications' && (
                  <div className="glass-card p-6 rounded-3xl space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-white">Full Candidates Applications Registry ({applications.length})</span>
                      <FileText size={16} className="text-[#C5A059]" />
                    </div>

                    {applications.length === 0 ? (
                      <div className="text-center py-16 text-gray-500 text-xs">No candidate applications have been filed.</div>
                    ) : (
                      <div className="space-y-4">
                        {applications.map(app => (
                          <div key={app.id} className="p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800/50 pb-3 mb-3 text-xs">
                              <div>
                                <span className="text-sm font-bold text-white block truncate">{app.candidateName}</span>
                                <span className="text-[10px] text-gray-500 block uppercase tracking-wider">Candidate Email: <span className="text-gray-300 font-mono">{app.candidateEmail}</span></span>
                                <span className="text-[10px] text-gray-500 block uppercase tracking-wider">Applied for Position: <span className="text-[#C5A059] font-bold">{app.jobTitle}</span></span>
                              </div>
                              
                              <div className="flex gap-2 text-[9px] uppercase font-bold text-white tracking-wider shrink-0">
                                {app.resumeUrl && (
                                  <a 
                                    href={app.resumeUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="px-3 py-1.5 bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30 rounded-lg hover:bg-[#C5A059] hover:text-black transition-all flex items-center gap-1"
                                  >
                                    Curriculum Vitae <ExternalLink size={10} />
                                  </a>
                                )}
                              </div>
                            </div>

                            {app.coverLetter && (
                              <p className="text-xs text-gray-300 bg-black/60 border border-white/5 p-4 rounded-xl leading-relaxed mb-4 whitespace-pre-wrap">
                                {app.coverLetter}
                              </p>
                            )}

                            <div className="flex flex-col md:flex-row md:items-center justify-between text-xs text-gray-400 gap-4">
                              <span className="flex items-center gap-1.5 font-mono text-[10px]">
                                <Phone size={12} className="text-gray-500 shrink-0" /> {app.candidatePhone || 'Non Provided'}
                              </span>

                              <div className="flex gap-1.5 items-center">
                                <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500">Triage Status:</span>
                                {[
                                  { s: 'pending', label: 'Pending', color: 'hover:bg-zinc-700 text-zinc-400 border-zinc-700' },
                                  { s: 'shortlisted', label: 'Shortlist', color: 'hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
                                  { s: 'hired', label: 'Hire 🎉', color: 'hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
                                  { s: 'rejected', label: 'Reject', color: 'hover:bg-red-500/20 text-red-400 border-red-500/30' },
                                ].map(action => (
                                  <button
                                    key={action.s}
                                    onClick={() => handleTriageApplication(app, action.s as any)}
                                    className={`px-3 py-1 border text-[9px] rounded-lg uppercase tracking-wider font-bold transition-all ${
                                      app.status === action.s 
                                        ? 'bg-white text-black font-black border-transparent' 
                                        : action.color
                                    }`}
                                  >
                                    {action.label}
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

                {/* 5. COMPANIES */}
                {activeTab === 'companies' && (
                  <div className="glass-card p-6 rounded-3xl space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-white">Vetted Recruiters & Brands Registry ({companies.length})</span>
                      <Building size={16} className="text-emerald-400" />
                    </div>

                    {companies.length === 0 ? (
                      <div className="text-center py-16 text-gray-500 text-xs">No workspace company profiles registered.</div>
                    ) : (
                      <div className="space-y-4">
                        {companies.map(comp => (
                          <div key={comp.id} className="p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-start gap-4">
                              <img 
                                src={comp.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=100&q=80'} 
                                alt=""
                                className="w-12 h-12 rounded-xl object-cover border border-white/15"
                              />
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-bold text-sm text-white">{comp.name}</h4>
                                  {comp.isVerified && (
                                    <span className="flex items-center gap-0.5 px-2 py-0.5 bg-emerald-500/15 text-emerald-400 text-[8px] font-bold uppercase rounded border border-emerald-500/20">
                                      <ShieldCheck size={10} /> VERIFIED LISTER
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-gray-400 block tracking-wide uppercase">{comp.location} | {comp.website || 'No Website'}</span>
                                <p className="text-xs text-gray-500 leading-relaxed max-w-xl">{comp.description}</p>
                              </div>
                            </div>

                            <div className="flex gap-2.5 shrink-0 items-center">
                              <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border tracking-widest ${
                                comp.isVerified 
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                              }`}>
                                {comp.status?.toUpperCase() || 'PENDING'}
                              </span>

                              <Button
                                onClick={() => handleVerifyCompany(comp.id, !comp.isVerified)}
                                className={`px-4 py-1.5 h-auto text-[10px] uppercase font-bold tracking-wider rounded-xl cursor-pointer ${
                                  comp.isVerified 
                                    ? 'bg-zinc-800 hover:bg-red-500 text-gray-300 hover:text-white' 
                                    : 'bg-emerald-500 hover:bg-white text-black hover:text-black'
                                }`}
                              >
                                {comp.isVerified ? 'Revoke Vetting' : 'Verify Company'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. CANDIDATE PROFILES */}
                {activeTab === 'candidates' && (
                  <div className="glass-card p-6 rounded-3xl space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-white">Corporate Talent Index Ledger ({candidates.length})</span>
                      <Users size={16} className="text-pink-400" />
                    </div>

                    {candidates.length === 0 ? (
                      <div className="text-center py-16 text-gray-500 text-xs">No candidate workspace profiles loaded yet.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {candidates.map(cand => (
                          <div key={cand.id} className="p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl flex flex-col justify-between gap-4">
                            <div className="space-y-2 text-xs">
                              <h4 className="font-bold text-sm text-white uppercase tracking-wider">{cand.displayName || 'Operational Candidate'}</h4>
                              <p className="text-gray-400 max-w-md italic leading-relaxed">"{cand.bio || 'Professional bio is currently pending update.'}"</p>
                              
                              <div className="flex flex-wrap gap-1.5 pt-2">
                                {cand.skills?.map((skill, si) => (
                                  <span key={si} className="px-2 py-0.5 bg-white/5 text-gray-400 border border-white/5 text-[9px] font-bold uppercase tracking-wider rounded-md">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-white/5">
                              {cand.resumeUrl ? (
                                <a 
                                  href={cand.resumeUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-[9px] font-black uppercase text-luxury-gold hover:underline flex items-center gap-1"
                                >
                                  Curriculum Vitae <ExternalLink size={10} />
                                </a>
                              ) : <span className="text-[9px] uppercase">No resume link uploaded</span>}
                              
                              <span className="text-[9px] uppercase font-mono bg-white/5 px-2 py-0.5 rounded text-gray-400">ID: {cand.id?.slice(0, 6)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 7. DRAFT JOBS */}
                {activeTab === 'drafts' && (
                  <div className="space-y-6">
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Workspace Drafts Listings ({draftJobs.length})</span>
                    {draftJobs.length === 0 ? (
                      <p className="text-xs text-gray-500 py-12 text-center bg-black/40 border border-white/5 rounded-3xl">No listings in draft mode.</p>
                    ) : (
                      <div className="space-y-4">
                        {draftJobs.map(job => (
                          <div key={job.id} className="p-5 bg-zinc-950/40 border border-white/5 rounded-2xl flex justify-between items-center">
                            <div>
                              <h4 className="font-bold text-white text-sm">{job.title}</h4>
                              <span className="text-[9px] uppercase tracking-wider text-gray-400">{job.location} | {job.category}</span>
                            </div>
                            <Button 
                              onClick={() => handleUpdateJobStatus(job.id, 'approved')}
                              className="bg-luxury-gold hover:bg-white text-black text-[10px] font-bold uppercase tracking-wider h-auto py-2 rounded-xl cursor-pointer"
                            >
                              Publish Live
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 8. PENDING REVIEW */}
                {activeTab === 'pending' && (
                  <div className="space-y-6">
                    <span className="text-xs font-bold uppercase text-amber-400 tracking-wider block">Moderation Approval Queue ({pendingReviewJobs.length})</span>
                    {pendingReviewJobs.length === 0 ? (
                      <p className="text-xs text-gray-500 py-12 text-center bg-black/40 border border-white/5 rounded-3xl">No jobs currently pending administrative verification.</p>
                    ) : (
                      <div className="space-y-4">
                        {pendingReviewJobs.map(job => (
                          <div key={job.id} className="p-5 bg-[#0e0e0e] border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                              <h4 className="font-bold text-white text-sm">{job.title}</h4>
                              <span className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1">Company: {job.companyName} | {job.location}</span>
                              <p className="text-xs text-gray-400 max-w-xl line-clamp-2">{job.description}</p>
                            </div>
                            <div className="flex gap-2 shrink-0 h-auto">
                              <Button 
                                onClick={() => handleUpdateJobStatus(job.id, 'approved')}
                                className="bg-emerald-500 hover:bg-white text-black text-[10px] font-mono tracking-widest leading-none h-auto py-2 px-3 rounded-lg cursor-pointer"
                              >
                                APPROVE
                              </Button>
                              <Button 
                                onClick={() => handleUpdateJobStatus(job.id, 'rejected')}
                                className="bg-red-500 hover:bg-white text-white text-[10px] font-mono tracking-widest leading-none h-auto py-2 px-3 rounded-lg cursor-pointer"
                              >
                                REJECT
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 9. APPROVED JOBS */}
                {activeTab === 'approved' && (
                  <div className="space-y-6">
                    <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider block">Approved & Live Position Listings ({approvedJobs.length})</span>
                    {approvedJobs.length === 0 ? (
                      <p className="text-xs text-gray-500 py-12 text-center bg-black/40 border border-white/5 rounded-3xl font-bold uppercase tracking-widest">No live positions indexed currently.</p>
                    ) : (
                      <div className="space-y-4">
                        {approvedJobs.map(job => (
                          <div key={job.id} className="p-5 bg-[#0e0e0e] border border-white/5 rounded-2xl flex justify-between items-center">
                            <div>
                              <h4 className="font-bold text-white text-sm">{job.title}</h4>
                              <span className="text-[9px] uppercase text-emerald-400 tracking-widest">Live and Publicly Indexed</span>
                            </div>
                            <div className="flex gap-2.5">
                              <button 
                                onClick={() => handleUpdateJobStatus(job.id, 'expired')}
                                className="px-3 py-1.5 text-[9px] bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black border border-amber-500/15 rounded-lg font-bold uppercase cursor-pointer"
                              >
                                Expire
                              </button>
                              <button 
                                onClick={() => handleUpdateJobStatus(job.id, 'draft')}
                                className="px-3 py-1.5 text-[9px] bg-zinc-805 bg-white/5 hover:bg-white text-white hover:text-black border border-white/5 rounded-lg font-bold uppercase cursor-pointer"
                              >
                                Retract
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 10. REJECTED JOBS */}
                {activeTab === 'rejected' && (
                  <div className="space-y-6">
                    <span className="text-xs font-bold uppercase text-red-400 tracking-wider block">Rejected & Deactivated Postings({rejectedJobs.length})</span>
                    {rejectedJobs.length === 0 ? (
                      <p className="text-xs text-gray-500 py-12 text-center bg-black/40 border border-white/5 rounded-3xl font-bold uppercase tracking-widest">No positions flagged as rejected.</p>
                    ) : (
                      <div className="space-y-4">
                        {rejectedJobs.map(job => (
                          <div key={job.id} className="p-4 bg-red-950/10 border border-red-500/10 rounded-2xl flex justify-between items-center">
                            <div>
                              <h4 className="font-bold text-white text-sm">{job.title}</h4>
                              <span className="text-[9px] text-gray-500 uppercase">Blocked from search results</span>
                            </div>
                            <Button
                              onClick={() => handleUpdateJobStatus(job.id, 'pending')}
                              className="bg-white hover:bg-luxury-gold text-black text-[10px] uppercase font-bold tracking-wider h-auto py-1.5 rounded-lg"
                            >
                              Send for Re-Review
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 11. FEATURED JOBS */}
                {activeTab === 'featured' && (
                  <div className="space-y-6">
                    <span className="text-xs font-bold uppercase text-luxury-gold tracking-wider block">Premium Homepage Highlight Spotlights ({featuredJobs.length})</span>
                    {featuredJobs.length === 0 ? (
                      <p className="text-xs text-gray-500 py-12 text-center bg-black/40 border border-white/5 rounded-3xl">No positions highlighted as featured.</p>
                    ) : (
                      <div className="space-y-4">
                        {featuredJobs.map(job => (
                          <div key={job.id} className="p-5 bg-zinc-950/40 border border-white/5 rounded-2xl flex justify-between items-center">
                            <div>
                              <h4 className="font-bold text-white text-sm">{job.title}</h4>
                              <span className="text-[9px] uppercase tracking-wider text-luxury-gold flex items-center gap-0.5"><Sparkles size={10} /> Homepage Spotlight</span>
                            </div>
                            <Button 
                              onClick={() => handleToggleJobFeatured(job.id, false)}
                              className="bg-zinc-800 hover:bg-neutral-700 text-gray-300 text-[9px] uppercase font-bold tracking-wider h-auto py-2 rounded-xl cursor-pointer"
                            >
                              Remove Spotlight
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 12. JOB ANALYTICS */}
                {activeTab === 'analytics' && (
                  <div className="space-y-8">
                    {/* Distribution Graphs & Funnel Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Metric Graphic: Category Allocation (Custom SVG) */}
                      <div className="glass-card p-6 rounded-3xl space-y-4 text-xs">
                        <span className="text-xs font-bold uppercase tracking-wider text-white">Visual Distribution of Careers Categories</span>
                        
                        <div className="flex flex-col items-center justify-center py-6">
                          <svg width="200" height="200" viewBox="0 0 100 100" className="transform -rotate-90">
                            {/* Segment 1: Construction 40% */}
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#C5A059" strokeWidth="12" strokeDasharray="100.5 251.2" strokeDashoffset="0" />
                            {/* Segment 2: Logistics 25% */}
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray="62.8 251.2" strokeDashoffset="-100.5" />
                            {/* Segment 3: Engineering 20% */}
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray="50.2 251.2" strokeDashoffset="-163.3" />
                            {/* Segment 4: Other 15% */}
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ec4899" strokeWidth="12" strokeDasharray="37.7 251.2" strokeDashoffset="-213.5" />
                          </svg>

                          <div className="flex flex-wrap gap-4 mt-6 justify-center">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]" /> Construction (40%)</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Logistics (25%)</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Engineering (20%)</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Other Systems (15%)</span>
                          </div>
                        </div>
                      </div>

                      {/* Recruitment Yield funnel (Custom SVG Bar Plot) */}
                      <div className="glass-card p-6 rounded-3xl space-y-4 text-xs">
                        <span className="text-xs font-bold uppercase tracking-wider text-white">ATS Conversion Funnel yield rates</span>
                        
                        <div className="space-y-4 pt-4">
                          {[
                            { step: 'Vetted Positions Posted', value: metrics.totalJobs * 12, max: metrics.totalJobs * 12, percent: 100, color: 'bg-indigo-500' },
                            { step: 'Submitted Resumes', value: metrics.totalApps + 25, max: metrics.totalJobs * 12, percent: 75, color: 'bg-blue-500' },
                            { step: 'Shortlisted Portfolio Vetting', value: metrics.shortlistedCount + 12, max: metrics.totalJobs * 12, percent: 45, color: 'bg-[#C5A059]' },
                            { step: 'Signed Hired Contracts', value: metrics.hiredApplicationsCount + 5, max: metrics.totalJobs * 12, percent: 22, color: 'bg-emerald-500' }
                          ].map((fun, fi) => (
                            <div key={fi} className="space-y-1">
                              <div className="flex justify-between text-[11px] text-gray-450 font-medium">
                                <span>{fun.step}</span>
                                <span>{fun.percent}% ({fun.value} Candidates)</span>
                              </div>
                              <div className="w-full bg-black h-3 rounded-xl overflow-hidden">
                                <div className={`${fun.color} h-3 rounded-xl transition-all duration-1000`} style={{ width: `${fun.percent}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    <div className="glass-card p-6 rounded-3xl space-y-4 text-xs text-gray-400">
                      <span className="text-xs font-bold uppercase tracking-wider text-white">Careers Dashboard Vitals Feed</span>
                      <p>Hiring analysis systems trace job seeker profiles correctly. High placement conversion on Mogadishu shoreline construction projects shows maximum engagement from diaspora community in Nairobi and London.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                          <span className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Average Budget Standard</span>
                          <span className="text-xl font-bold text-white block">${metrics.averageSalary || 2500}/month</span>
                        </div>
                        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                          <span className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Placement Velocity</span>
                          <span className="text-xl font-bold text-emerald-400 block">14.5 Days average</span>
                        </div>
                        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                          <span className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Unread Applications alerts</span>
                          <span className="text-xl font-bold text-amber-400 block">{applications.filter(a => a.status === 'pending').length} unreviewed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          )}
        </div>

      </div>
    </div>
  );
}
