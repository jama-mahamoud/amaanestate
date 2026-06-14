import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, CheckCircle2, Globe, Building2, Calendar, FileText } from 'lucide-react';
import { Job, CompanyProfile } from '@/types';
import { jobService } from '@/services/jobService';
import JobCard from './JobCard';

interface CompanyProfileViewProps {
  companyId: string;
  onBack: () => void;
  onSelectJob: (job: Job) => void;
  bookmarkedJobs: string[];
  toggleBookmark: (jobId: string) => void;
}

const CompanyProfileView: React.FC<CompanyProfileViewProps> = ({ 
  companyId, 
  onBack, 
  onSelectJob,
  bookmarkedJobs,
  toggleBookmark
}) => {
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const comp = await jobService.getCompanyById(companyId);
        setCompany(comp);

        if (comp) {
          const allJobs = await jobService.getJobs();
          // Filter jobs posted by this company or owner
          const filtered = allJobs.filter(
            j => j.companyId === comp.id || j.ownerId === comp.ownerId
          );
          setJobs(filtered);
        }
      } catch (err) {
        console.error('Failed to load company profile context:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-white/50 uppercase tracking-widest animate-pulse">Loading corporate file...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-3xl p-8 max-w-md mx-auto text-white">
        <Building2 size={48} className="mx-auto text-white/30 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-white">Company Not Registered</h3>
        <p className="text-sm text-white/60 mt-2">The requested recruiter card could not be sourced from standard collections.</p>
        <button 
          onClick={onBack}
          className="mt-6 px-6 py-2.5 bg-luxury-gold hover:bg-luxury-gold/90 text-super-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-sm"
        >
          Check Active Feed
        </button>
      </div>
    );
  }

  return (
    <div className="bg-super-black min-h-screen pb-16 text-white">
      {/* Top sticky bar */}
      <div className="bg-neutral-900 border-b border-white/5 py-4 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 text-white hover:text-white/85 font-extrabold bg-white/5 hover:bg-white/10 rounded-xl transition-all text-xs cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Listings
          </button>
          
          {company.website && (
            <a 
              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-luxury-gold hover:text-luxury-gold/85 font-bold bg-luxury-gold/10 hover:bg-luxury-gold/20 rounded-xl transition-colors text-xs"
            >
              <Globe size={14} /> Visit Corporate Website &rarr;
            </a>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Profile Card banner */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-10 shadow-lg mb-8 relative overflow-hidden">
          {/* Subtle decoration background lines */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 relative z-10">
            {/* Logo */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center p-3 shrink-0 shadow-sm">
              {company.logo ? (
                <img referrerPolicy="no-referrer" src={company.logo} alt={company.name} className="w-full h-full object-contain rounded-2xl" />
              ) : (
                <Building2 size={40} className="text-luxury-gold animate-pulse" />
              )}
            </div>

            {/* Meta text */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-luxury-gold tracking-wider uppercase">
                  Recruiter Card
                </span>
                {company.isVerified && (
                  <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    <CheckCircle2 size={12} className="fill-emerald-400 text-super-black" /> Verified Partner
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
                {company.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs md:text-sm text-white/60 font-medium">
                <div className="flex items-center gap-1">
                  <MapPin size={15} className="text-white/30" />
                  <span className="capitalize">{company.location}</span>
                </div>
                {company.size && (
                  <div className="flex items-center gap-1">
                    <Building2 size={15} className="text-white/30" />
                    <span>Scale: {company.size} employees</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <FileText size={15} className="text-white/30" />
                  <span className="text-luxury-gold font-bold">{jobs.length} Job Vacancies</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-3 font-sans">About the Company</h3>
            <p className="text-white/70 leading-relaxed text-sm md:text-base whitespace-pre-line">
              {company.description || "No corporate statement details have been deposited yet."}
            </p>
          </div>
        </div>

        {/* List of active job opening */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
              Active Vacancies at {company.name} ({jobs.length})
            </h2>
            <span className="text-xs text-white/50 font-medium">Click card to inspect role details</span>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-3xl p-8 max-w-lg mx-auto">
              <Calendar size={40} className="mx-auto text-white/30 mb-3" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">No active openings</h3>
              <p className="text-xs text-white/60 mt-1">This corporate workspace is currently not recruiting for active openings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {jobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job}
                  isBookmarked={bookmarkedJobs.includes(job.id)}
                  onBookmarkToggle={() => toggleBookmark(job.id)}
                  onViewDetails={() => onSelectJob(job)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfileView;
