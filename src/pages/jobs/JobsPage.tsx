import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, MapPin, Search, Filter, SlidersHorizontal, PlusCircle, 
  Building2, Users, FileText, CheckCircle2, BookmarkCheck, BookOpen, 
  ChevronRight, ArrowRight, User, Plus, CheckCircle, Database, HelpCircle, Mail, Globe, 
  ShieldCheck, ArrowUpRight, ChevronDown, ListFilter, ClipboardCheck, Sparkles, LogIn
} from 'lucide-react';
import { Job, CompanyProfile } from '@/types';
import { jobService } from '@/services/jobService';
import JobCard from '@/components/jobs/JobCard';
import JobFilter from '@/components/jobs/JobFilter';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Somali specific mock data to seed or display when database has no jobs yet
const MOCK_SOMALI_JOBS: Job[] = [
  {
    id: 'mock-1',
    title: 'Lead Network Development Architect',
    companyId: 'company-hormuud',
    companyName: 'Hormuud Telecom',
    companyLogo: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=150&q=80',
    category: 'Information Technology',
    location: 'Mogadishu, Somalia',
    country: 'Somalia',
    city: 'Mogadishu',
    description: 'We are recruiting a Lead Network Development Architect to direct our fast-moving 5G core expansions and local fiber layout systems as part of Somalia next-gen internet provisioning. You will lead a team of 15 network core developers and work hand-in-hand with global telecommunication suppliers.',
    experienceLevel: 'Mid-Senior Level (5+ Years)',
    employmentType: 'full-time',
    workplaceType: 'on-site',
    salaryMin: 3200,
    salaryMax: 4800,
    currency: 'USD',
    isUrgent: true,
    isFeatured: true,
    status: 'approved',
    ownerId: 'owner-hormuud',
    deadline: '2026-08-15',
    applyType: 'internal',
    isVerifiedCompany: true,
    numberOfPositions: 2,
    createdAt: '2026-06-14T03:40:00Z',
    responsibilities: '• Architect major MPLS backbone topologies supporting multi-million subscriber environments\n• Direct regional 5G core telemetry monitoring and quality-of-service optimization routines\n• Oversee physical fiber routing planning cycles for Mogadishu metropolitan ring network\n• Prepare operational compliance reports in conjunction with Somalia National Communications Authority',
    requirements: '• Solid mastery of Border Gateway Protocol (BGP), OSPF, and Carrier Grade NAT routers\n• Valid Cisco CCIE or Juniper JNCIE network design certifications\n• Fluent communication skills in Somali and English\n• Master Degree in Telecommunications Engineering or Electrical Science'
  },
  {
    id: 'mock-2',
    title: 'Senior Fintech React Architect',
    companyId: 'company-premier',
    companyName: 'Premier Bank Somalia',
    companyLogo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=150&q=80',
    category: 'Engineering',
    location: 'Mogadishu, Somalia',
    country: 'Somalia',
    city: 'Mogadishu',
    description: 'Premier Bank Somalia is on the hunt for an expert Javascript front-end engineer to build our brand new digital diaspora investment application using React and high fidelity chart wrappers. Join a high-speed agile hub.',
    experienceLevel: 'Senior Level (6+ Years)',
    employmentType: 'full-time',
    workplaceType: 'hybrid',
    salaryMin: 2800,
    salaryMax: 4200,
    currency: 'USD',
    isUrgent: false,
    isFeatured: true,
    status: 'approved',
    ownerId: 'owner-premier',
    deadline: '2026-07-30',
    applyType: 'external',
    isVerifiedCompany: true,
    numberOfPositions: 1,
    createdAt: '2026-06-14T03:40:00Z',
    responsibilities: '• Code highly responsive interface panels for microfinance account views utilizing React 19\n• Manage front-end security configurations against Cross-Site Scripting (XSS) in local storage caching\n• Cooperate with backend teams via GraphQL endpoint integration\n• Mentor 3 junior developers as we build localized payment widgets',
    requirements: '• Proven experience with custom React states, TypeScript, and state management (Zustand or Recoil)\n• Familiarity with mobile-responsive design grids and modern CSS specifications\n• Prior banking or Fintech product lifecycle implementation experience is highly valued'
  },
  {
    id: 'mock-3',
    title: 'Marine Logistics Operations Lead',
    companyId: 'company-port',
    companyName: 'Mogadishu Port Authority',
    companyLogo: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=150&q=80',
    category: 'Logistics',
    location: 'Mogadishu, Somalia',
    country: 'Somalia',
    city: 'Mogadishu',
    description: 'Manage harbor intake logistics and terminal scheduling profiles inside the booming Mogadishu seaport. Coordinate closely with international carrier shipping vessels.',
    experienceLevel: 'Mid Level (3+ Years)',
    employmentType: 'full-time',
    workplaceType: 'on-site',
    salaryMin: 2200,
    salaryMax: 3000,
    currency: 'USD',
    isUrgent: true,
    isFeatured: false,
    status: 'approved',
    ownerId: 'owner-port',
    deadline: '2026-07-10',
    applyType: 'email',
    email: 'hr@mogadishuport.gov.so',
    isVerifiedCompany: true,
    numberOfPositions: 3,
    createdAt: '2026-06-14T03:40:00Z',
    responsibilities: '• Direct safe docking queue sequences and cargo shipping manifests\n• Coordinate customs clearance schedules with state taxation delegates\n• Oversee heavy container transport equipment operators during night operational cycles\n• Enforce strict marine safety and global harbor operation protocols',
    requirements: '• Bachelor Degree in Supply Chain management, Port Administration or Marine Economics\n• Exceptional communication, dispute resolution and leadership competencies\n• Strong command of maritime shipping data platforms and container logistics tracking software'
  },
  {
    id: 'mock-4',
    title: 'Aviation Safety Inspections Officer',
    companyId: 'company-daallo',
    companyName: 'Daallo Airlines',
    companyLogo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=150&q=80',
    category: 'Logistics',
    location: 'Hargeisa, Somalia',
    country: 'Somalia',
    city: 'Hargeisa',
    description: 'Uphold premium standards of global aviation safety across Daallo regional fleet in Somalia. Plan regular inspection maps and flight technical documentation checks.',
    experienceLevel: 'Senior Level (5+ Years)',
    employmentType: 'full-time',
    workplaceType: 'on-site',
    salaryMin: 3500,
    salaryMax: 5000,
    currency: 'USD',
    isUrgent: false,
    isFeatured: true,
    status: 'approved',
    ownerId: 'owner-daallo',
    deadline: '2026-09-01',
    applyType: 'external',
    isVerifiedCompany: true,
    numberOfPositions: 1,
    createdAt: '2026-06-14T03:40:00Z',
    responsibilities: '• Perform structural safety audits on passenger Boeing models pre and post flight\n• Log technical flight telemetry records in full alignment with international civil aviation charters\n• Draft crew training drills and modern pre-takeoff safety briefing guidelines',
    requirements: '• FAA certified Aviation Maintenance Inspector code credentials\n• minimum 5 years technical maintenance planning portfolio\n• Fluency in technical English parsing'
  },
  {
    id: 'mock-5',
    title: 'Disaster Mitigation Coordinator',
    companyId: 'company-redcrescent',
    companyName: 'Somali Red Crescent Society',
    companyLogo: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=150&q=80',
    category: 'Healthcare & Science',
    location: 'Garowe, Somalia',
    country: 'Somalia',
    city: 'Garowe',
    description: 'Strategize emergency relief distribution routes and regional first-response healthcare clinics for the Somali Red Crescent in Garowe. Supervise mobile nurse deployment lists.',
    experienceLevel: 'Mid Level (3+ Years)',
    employmentType: 'contract',
    workplaceType: 'hybrid',
    salaryMin: 1800,
    salaryMax: 2600,
    currency: 'USD',
    isUrgent: true,
    isFeatured: false,
    status: 'approved',
    ownerId: 'owner-redcrescent',
    deadline: '2026-07-25',
    applyType: 'email',
    email: 'info@somaliredcrescent.org',
    isVerifiedCompany: true,
    numberOfPositions: 2,
    createdAt: '2026-06-14T03:40:00Z',
    responsibilities: '• Organize emergency food, clean water and visual drug dispatch routes\n• Liaise directly with state ministries and UN delegation logistics teams\n• Write comprehensive operations field reports detailing community status',
    requirements: '• Degree in Public Health, Community Development or Crisis Mitigation Science\n• Strong regional geographical knowledge of Puntland rural precincts\n• Willingness to travel on site under challenging field circumstances'
  },
  {
    id: 'mock-6',
    title: 'Senior Civil Infrastructure Engineer',
    companyId: 'company-sombuilt',
    companyName: 'Sombuilt Construction',
    companyLogo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=150&q=80',
    category: 'Construction',
    location: 'Hargeisa, Somalia',
    country: 'Somalia',
    city: 'Hargeisa',
    description: 'Lead major architectural surveying and concrete runway structuring projects under Sombuilt Hargeisa expansion plans. Supervise soil telemetry and structural stress tests.',
    experienceLevel: 'Mid-Senior Level (5+ Years)',
    employmentType: 'full-time',
    workplaceType: 'on-site',
    salaryMin: 2500,
    salaryMax: 3800,
    currency: 'USD',
    isUrgent: false,
    isFeatured: false,
    status: 'approved',
    ownerId: 'owner-sombuilt',
    deadline: '2026-08-10',
    applyType: 'internal',
    isVerifiedCompany: false,
    numberOfPositions: 1,
    createdAt: '2026-06-14T03:40:00Z',
    responsibilities: '• Prepare comprehensive structural blueprint specifications utilizing CAD tools\n• Manage on-site contractor crews enforcing occupational health constraints\n• Calculate heavy concrete load limits and drainage pipe vectors'
  },
  {
    id: 'mock-7',
    title: 'Senior Full-Stack Developer',
    companyId: 'company-ethiotech',
    companyName: 'EthioTech Solutions',
    companyLogo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=150&q=80',
    category: 'Information Technology',
    location: 'Awbare, Ethiopia',
    country: 'Ethiopia',
    city: 'Awbare',
    description: 'We are seeking an experienced full-stack engineer to lead development of local agricultural tech platforms connecting farming cooperatives in eastern Ethiopia.',
    experienceLevel: 'Senior Level (6+ Years)',
    employmentType: 'full-time',
    workplaceType: 'hybrid',
    salaryMin: 2400,
    salaryMax: 3600,
    currency: 'USD',
    isUrgent: false,
    isFeatured: true,
    status: 'approved',
    ownerId: 'owner-ethiotech',
    deadline: '2026-08-30',
    applyType: 'internal',
    isVerifiedCompany: true,
    numberOfPositions: 1,
    createdAt: '2026-06-14T03:40:00Z',
    responsibilities: '• Plan system back-end micro-frameworks and web layouts\n• Scale mobile text updates systems for cellular farming coordinates',
    requirements: '• Proficiency in Django, Node.js or React\n• Familiarity with local agricultural data operations'
  },
  {
    id: 'mock-8',
    title: 'Regional Logistics Operations Lead',
    companyId: 'company-kenyaairways',
    companyName: 'Kenya Air Cargo Hub',
    companyLogo: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=150&q=80',
    category: 'Logistics',
    location: 'Nairobi, Kenya',
    country: 'Kenya',
    city: 'Nairobi',
    description: 'Coordinate cross-border cargo transport chains connecting East Africa markets with Somalia and Ethiopian regional hubs.',
    experienceLevel: 'Mid Level (2-4 Years)',
    employmentType: 'full-time',
    workplaceType: 'on-site',
    salaryMin: 2100,
    salaryMax: 2950,
    currency: 'USD',
    isUrgent: true,
    isFeatured: false,
    status: 'approved',
    ownerId: 'owner-kenyaair',
    deadline: '2026-07-15',
    applyType: 'email',
    email: 'careers@kenyaairwayscargo.com',
    isVerifiedCompany: true,
    numberOfPositions: 2,
    createdAt: '2026-06-14T03:40:00Z',
    responsibilities: '• Manage express air transport tracking feeds and documentation\n• Inspect temperature-controlled cargo container arrays',
    requirements: '• Solid logistics certification and 3+ years routing expertise\n• Deep familiarity with Eastern Africa trading safety guidelines'
  }
];

export default function JobsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Core Jobs & Companies storage lists
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [citySearch, setCitySearch] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('All');
  const [employmentType, setEmploymentType] = useState('All');
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);
  const [isUrgentOnly, setIsUrgentOnly] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Local bookmarking state
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>(() => {
    const saved = localStorage.getItem('amaan_bookmarked_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  // Mobile Filter Drawer control
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Constants
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
  
  const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level (2-4 Years)', 'Mid-Senior Level (5+ Years)', 'Senior Level (6+ Years)', 'Executive / Director'];
  const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'remote', 'contract', 'freelance'];

  // Load and sync all jobs
  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const dbJobs = await jobService.getJobs();

      // If db has NO approved jobs at all, merge with mock jobs so the user immediately gets a full site experience!
      if (dbJobs.length === 0) {
        setActiveJobs(MOCK_SOMALI_JOBS);
      } else {
        setActiveJobs(dbJobs);
      }
    } catch (err) {
      console.error('Error fetching jobs database:', err);
      toast.error('Could not fully synchronize with dynamic Cloud Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, [user]);

  // Seed Mock Data into Firestore with a single click button
  const handleSeedJobsToCloud = async () => {
    try {
      toast.loading('Injecting Somali professional recruiting spots into cloud...', { id: 'seed' });
      for (const mJob of MOCK_SOMALI_JOBS) {
        await jobService.createJob({
          title: mJob.title,
          category: mJob.category,
          location: mJob.location || `${mJob.city || 'Mogadishu'}, ${mJob.country || 'Somalia'}`,
          country: mJob.country || 'Somalia',
          city: mJob.city || 'Mogadishu',
          employmentType: mJob.employmentType,
          workplaceType: mJob.workplaceType,
          description: mJob.description,
          requirements: mJob.requirements || '',
          salaryMin: mJob.salaryMin,
          salaryMax: mJob.salaryMax,
          currency: 'USD',
          status: 'approved',
          deadline: mJob.deadline,
          responsibilities: mJob.responsibilities || '',
          skills: mJob.skills || '',
          applyType: mJob.applyType,
          applyLink: mJob.applyLink || '',
          email: mJob.email || '',
          experienceLevel: mJob.experienceLevel || '',
          isVerifiedCompany: true,
          companyName: mJob.companyName,
          companyLogo: mJob.companyLogo,
          companyId: mJob.companyId
        } as any);
      }
      toast.success('Successfully provisioned professional career spots directly into Cloud Firestore!', { id: 'seed' });
      fetchPortalData();
    } catch {
      toast.error('Failed to auto-seed properties database.', { id: 'seed' });
    }
  };

  // Bookmark Toggle
  const toggleBookmark = (jobId: string) => {
    let updated;
    if (bookmarkedJobs.includes(jobId)) {
      updated = bookmarkedJobs.filter(id => id !== jobId);
      toast.success('Bookmark removed.');
    } else {
      updated = [...bookmarkedJobs, jobId];
      toast.success('Job marked and saved!');
    }
    setBookmarkedJobs(updated);
    localStorage.setItem('amaan_bookmarked_jobs', JSON.stringify(updated));
  };

  // Filter jobs logic
  const filteredJobs = useMemo(() => {
    return activeJobs.filter(job => {
      const matchSearch = 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.companyName.toLowerCase().includes(search.toLowerCase()) ||
        (job.hiringOrganization && job.hiringOrganization.toLowerCase().includes(search.toLowerCase())) ||
        job.description.toLowerCase().includes(search.toLowerCase());

      const matchCategory = category === 'All' || job.category === category;
      
      // Filter by Country (dropdown)
      let matchCountry = true;
      if (selectedCountry !== 'All') {
        const lowerCountry = selectedCountry.toLowerCase();
        if (job.country) {
          matchCountry = job.country.toLowerCase() === lowerCountry;
        } else {
          // Legacy/fallback match
          const locLower = (job.location || '').toLowerCase();
          if (lowerCountry === 'somalia') {
            matchCountry = locLower.includes('somalia') || locLower.includes('mogadishu') || locLower.includes('hargeisa') || locLower.includes('garowe') || locLower.includes('kismayo') || locLower.includes('bosaso') || locLower.includes('baidoa') || locLower.includes('beletweyne');
          } else if (lowerCountry === 'ethiopia') {
            matchCountry = locLower.includes('ethiopia') || locLower.includes('addis') || locLower.includes('awbare') || locLower.includes('jijiga') || locLower.includes('dire dawa');
          } else if (lowerCountry === 'kenya') {
            matchCountry = locLower.includes('kenya') || locLower.includes('nairobi') || locLower.includes('mombasa');
          } else {
            matchCountry = locLower.includes(lowerCountry);
          }
        }
      }

      // Filter by City (text-based search match)
      let matchCity = true;
      if (citySearch.trim() !== '') {
        const lowerCitySearch = citySearch.toLowerCase().trim();
        const jobCity = (job.city || '').toLowerCase();
        const jobLoc = (job.location || '').toLowerCase();
        matchCity = jobCity.includes(lowerCitySearch) || jobLoc.includes(lowerCitySearch);
      }

      const matchExp = experienceLevel === 'All' || job.experienceLevel === experienceLevel;
      const matchType = employmentType === 'All' || job.employmentType === employmentType;
      const matchVerified = !isVerifiedOnly || job.isVerifiedCompany || job.isFeatured;
      const matchUrgent = !isUrgentOnly || job.isUrgent;

      return matchSearch && matchCategory && matchCountry && matchCity && matchExp && matchType && matchVerified && matchUrgent;
    });
  }, [activeJobs, search, category, selectedCountry, citySearch, experienceLevel, employmentType, isVerifiedOnly, isUrgentOnly]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setSelectedCountry('All');
    setCitySearch('');
    setExperienceLevel('All');
    setEmploymentType('All');
    setIsVerifiedOnly(false);
    setIsUrgentOnly(false);
    toast.success('Reset search constraints.');
  };

  const getSubTitleText = () => {
    if (category !== 'All') return `In ${category}`;
    if (selectedCountry !== 'All') return `In ${selectedCountry}`;
    return 'Across East Africa';
  };

  return (
    <div className="min-h-screen bg-super-black text-white antialiased font-sans flex flex-col pt-16">
      
      {/* Clean & Minimal Hero */}
      <div className="w-full bg-[#080809] border-b border-white/5 relative overflow-hidden py-10 md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(197,160,89,0.06),transparent)]" />
        
        <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              Find Your Next Job
            </h1>
            <p className="text-sm text-white/50">
              Search verified job opportunities across Somalia
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => navigate('/employer/dashboard')}
              className="px-4 py-2 bg-luxury-gold hover:bg-luxury-gold/90 text-super-black text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-md"
            >
              Employers / Post Job
            </button>
            
            <button 
              onClick={handleSeedJobsToCloud}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all border border-white/5 cursor-pointer"
              title="Seed mock Somali jobs for rich visualization"
            >
              Seed Data
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Content container */}
      <div className="max-w-4xl w-full mx-auto px-4 md:px-6 py-8 flex-grow">
        
        {/* Normal Job Seekers Flow */}
        <div className="space-y-6">
          
          {/* EthioJobs Style Consolidated Search Panel */}
          <div className="bg-[#0b0b0c] border border-white/5 rounded-2xl p-4 md:p-6 shadow-xl space-y-4">
            
            {/* TOP ROW: Search input + Country dropdown + City text + Category dropdown + More filters toggle */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              
              {/* Job Title Search (md:col-span-4) */}
              <div className="md:col-span-4 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                <input 
                  type="text" 
                  placeholder="Titles, skills, or companies..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-luxury-gold font-medium transition-colors"
                />
              </div>

              {/* Country Dropdown (md:col-span-3) */}
              <div className="md:col-span-3 relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-[#111112] border border-white/10 rounded-xl pl-9 pr-8 py-3 text-sm text-white outline-none focus:border-luxury-gold font-medium cursor-pointer appearance-none transition-colors"
                >
                  <option value="All">All Countries</option>
                  <option value="Somalia">Somalia</option>
                  <option value="Ethiopia">Ethiopia</option>
                  <option value="Kenya">Kenya</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={16} />
              </div>

              {/* City Free Text (md:col-span-2) */}
              <div className="md:col-span-2 relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" size={14} />
                <input 
                  type="text" 
                  placeholder="City/Town..." 
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="w-full bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-xl pl-7.5 pr-2 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-luxury-gold font-medium transition-colors"
                />
              </div>

              {/* Category Dropdown (md:col-span-2) */}
              <div className="md:col-span-2 relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={14} />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#111112] border border-white/10 rounded-xl pl-8.5 pr-6 py-3 text-xs text-white outline-none focus:border-luxury-gold font-medium cursor-pointer appearance-none transition-colors"
                >
                  <option value="All">All Sectors</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-neutral-900 text-white">{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={16} />
              </div>

              {/* More Filters Actions (md:col-span-1) */}
              <div className="md:col-span-1">
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`w-full h-full py-3 px-2 rounded-xl border border-white/10 text-xs font-bold hover:bg-white/5 text-white/80 transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    showAdvancedFilters ? 'bg-luxury-gold/15 border-luxury-gold/40 text-luxury-gold' : ''
                  }`}
                  title="Toggle more filters panel"
                >
                  <SlidersHorizontal size={14} />
                  <span className="md:hidden">Filters</span>
                </button>
              </div>

            </div>

            {/* Collapsible More Filters Block */}
            {showAdvancedFilters && (
              <div className="pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                
                {/* Advanced: Experience Level */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-white/55 tracking-widest block block">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full bg-[#111112] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-luxury-gold font-medium cursor-pointer"
                  >
                    <option value="All">All Experience Levels</option>
                    {EXPERIENCE_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl} className="bg-neutral-900 text-white">{lvl}</option>
                    ))}
                  </select>
                </div>

                {/* Advanced: Employment Type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-white/55 tracking-widest block">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full bg-[#111112] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-luxury-gold font-medium cursor-pointer"
                  >
                    <option value="All">All Employment Types</option>
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type} value={type} className="bg-neutral-900 text-white capitalize">{type.replace('-', ' ')}</option>
                    ))}
                  </select>
                </div>

                {/* Advanced: Safety Badge / Verified check */}
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl cursor-pointer w-full select-none">
                    <input 
                      type="checkbox" 
                      checked={isVerifiedOnly} 
                      onChange={(e) => setIsVerifiedOnly(e.target.checked)} 
                      className="accent-luxury-gold w-4 h-4 rounded cursor-pointer" 
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">Verified Companies Only</span>
                      <span className="text-[10px] text-white/40 block">validated recruiter channels only</span>
                    </div>
                  </label>
                </div>

              </div>
            )}

            {/* Active Filters / Reset constraints indicator */}
            {(search || category !== 'All' || selectedCountry !== 'All' || citySearch !== '' || experienceLevel !== 'All' || employmentType !== 'All' || isVerifiedOnly || isUrgentOnly) && (
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                <span className="text-white/40 font-medium">Search filters are currently applied</span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="font-bold text-luxury-gold hover:text-luxury-gold/90 transition-all cursor-pointer hover:underline uppercase tracking-wider text-[10px]"
                >
                  Reset constraints
                </button>
              </div>
            )}

          </div>

          {/* List display & status header */}
          <div className="space-y-4">
            
            {/* Listings header */}
            <div className="flex justify-between items-center px-1">
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {filteredJobs.length} Jobs {getSubTitleText()}
                </h2>
                <p className="text-xs text-white/50 mt-0.5">Click any listing to check roles responsibilities and file application forms.</p>
              </div>

              {bookmarkedJobs.length > 0 && (
                <span className="text-xs text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1 animate-pulse">
                  <BookmarkCheck size={13} className="fill-rose-400" /> {bookmarkedJobs.length} Saved
                </span>
              )}
            </div>

            {/* Skeleton or real contents rendering */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(item => (
                  <div key={item} className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl animate-pulse space-y-3">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-xl" />
                      <div className="flex-grow space-y-2">
                        <div className="w-1/4 h-3 bg-white/5 rounded" />
                        <div className="w-1/2 h-4 bg-white/5 rounded" />
                      </div>
                    </div>
                    <div className="w-3/4 h-3 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-3xl p-12 max-w-lg mx-auto">
                <Briefcase size={48} className="mx-auto text-white/30 mb-4 animate-bounce" />
                <h3 className="text-lg font-bold text-white">No Jobs Sourced</h3>
                <p className="text-sm text-white/50 mt-2 max-w-sm mx-auto leading-relaxed">
                  We could not parse any career active entries matching your given filters. Try clearing constraints to see standard openings.
                </p>
                <button 
                  onClick={handleResetFilters}
                  className="mt-6 px-6 py-2.5 bg-luxury-gold hover:bg-luxury-gold/90 text-super-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Reset Search Filters &rarr;
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredJobs.map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job}
                    isBookmarked={bookmarkedJobs.includes(job.id)}
                    onBookmarkToggle={() => toggleBookmark(job.id)}
                    onViewDetails={() => {
                      navigate(`/job/${job.id}`);
                    }}
                  />
                ))}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
