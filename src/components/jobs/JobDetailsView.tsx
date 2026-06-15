import React from 'react';
import { 
  ArrowLeft, MapPin, Clock, Calendar, CheckCircle2, Building, 
  Share2, Send, Phone, UserCheck, MessageSquare, Linkedin, Globe, Mail, FileText
} from 'lucide-react';
import { Job } from '@/types';
import { JobApplySection } from './JobApplySection';

interface JobDetailsViewProps {
  job: Job;
  onBack: () => void;
  onApplyClick: () => void;
}

const JobDetailsView: React.FC<JobDetailsViewProps> = ({ job, onBack, onApplyClick }) => {
  const handleApplyClick = () => {
    if (job.applyType === 'email') {
      const applySection = document.getElementById('how-to-apply-section');
      if (applySection) {
        applySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    onApplyClick();
  };

  // Safe array formatting for bullets
  const parseBullets = (text?: string): string[] => {
    if (!text) return [];
    return text
      .split('\n')
      .map(line => line.replace(/^•\s*/, '').trim())
      .filter(line => line.length > 0);
  };

  const responsibilitiesList = parseBullets(job.responsibilities);
  const requirementsList = parseBullets(job.requirements);
  const skillsList = job.skills ? job.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];

  // Share handlers
  const handleShare = (platform: 'whatsapp' | 'telegram') => {
    const text = `Check out this job opening: ${job.title} at ${job.companyName} !`;
    const url = window.location.href;
    let shareUrl = '';
    if (platform === 'whatsapp') {
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
    } else if (platform === 'telegram') {
      shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    }
    window.open(shareUrl, '_blank');
  };

  const formatDeadline = (deadlineStr: any) => {
    if (!deadlineStr) return 'Not Specified';
    try {
      const date = new Date(deadlineStr);
      if (isNaN(date.getTime())) return deadlineStr;
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return deadlineStr;
    }
  };

  return (
    <div className="bg-super-black min-h-screen pb-16 text-white">
      {/* Sticky Top Header for easy scrolling */}
      <div className="bg-neutral-900 border-b border-white/5 py-4 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 text-white hover:text-white/80 font-bold bg-white/5 hover:bg-white/10 rounded-xl transition-all text-xs cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Job List
          </button>
          
          {job.applyType !== 'email' && (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-xs text-white/50 font-medium font-sans">Looking at this role?</span>
              <button 
                onClick={handleApplyClick}
                className="px-6 py-2.5 bg-luxury-gold hover:bg-luxury-gold/90 text-super-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Apply now
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header Hero card */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 shadow-lg mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex gap-6 items-start">
            <div 
              className="w-18 h-18 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2 shrink-0 select-none"
            >
              {job.companyLogo ? (
                <img referrerPolicy="no-referrer" src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain rounded-xl" />
              ) : (
                <div className="w-full h-full rounded-xl bg-luxury-gold/10 text-luxury-gold flex items-center justify-center font-bold text-xl">
                  {job.companyName?.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span 
                  className="text-sm font-bold text-white/50"
                >
                  {job.companyName}
                </span>
                {(job.isVerifiedCompany) && (
                  <span className="text-luxury-gold font-bold flex items-center" title="Verified Employer badge" >
                    <CheckCircle2 size={14} className="fill-luxury-gold text-super-black" />
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {job.category}
                </span>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-white/60">
                <div className="flex items-center gap-1"><MapPin size={15} className="text-white/30" /> <span className="capitalize">{job.location}</span></div>
                <div className="flex items-center gap-1"><Clock size={15} className="text-white/30" /> <span className="capitalize">{job.employmentType?.replace('-', ' ')}</span></div>
                {job.salaryMin && (
                  <div className="flex items-center gap-1 text-emerald-400 font-bold">
                    <span>${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()} / mo</span>
                  </div>
                )}
              </div>

              {/* Hiring Organization Display */}
              <div className="mt-5 p-4 bg-white/[0.02] border border-white/5 rounded-xl max-w-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1.5">
                  <span>🏢 Hiring Organization</span>
                </div>
                <span className="text-base font-extrabold text-white block">
                  {job.hiringOrganization || job.companyName}
                </span>
                <p className="text-[10px] text-white/40 mt-1">
                  The actual employer or program administering the assignment.
                </p>
              </div>
            </div>
          </div>

          {/* Social share widget */}
          <div className="flex items-center gap-2 border-t md:border-t-0 border-white/5 pt-4 md:pt-0 w-full md:w-auto justify-end">
            <span className="text-xs text-white/40 font-medium mr-1.5">Share:</span>
            <button 
              onClick={() => handleShare('whatsapp')}
              className="p-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-bold"
              title="Share on WhatsApp"
            >
              <Send size={14} className="rotate-45" /> WhatsApp
            </button>
            <button 
              onClick={() => handleShare('telegram')}
              className="p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-bold"
              title="Share on Telegram"
            >
              <Share2 size={14} /> Telegram
            </button>
          </div>
        </div>

        {/* Dynamic Split columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column A: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description Card */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 shadow-lg">
              <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 mb-4">
                About the Job
              </h2>
              <p className="text-white/80 leading-relaxed whitespace-pre-line text-sm md:text-base">
                {job.description}
              </p>
            </div>

            {/* Responsibilities list card */}
            {responsibilitiesList.length > 0 && (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 shadow-lg">
                <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 mb-4">
                  Operational Responsibilities
                </h2>
                <ul className="space-y-3.5">
                  {responsibilitiesList.map((resp, i) => (
                    <li key={i} className="flex gap-3 text-white/80 text-sm md:text-base leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold shrink-0 mt-2.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements list card */}
            {requirementsList.length > 0 && (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 shadow-lg">
                <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 mb-4">
                  Job Requirements
                </h2>
                <ul className="space-y-3.5">
                  {requirementsList.map((req, i) => (
                    <li key={i} className="flex gap-3 text-white/80 text-sm md:text-base leading-relaxed animate-fade-in">
                      <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold shrink-0 mt-2.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills chip list */}
            {skillsList.length > 0 && (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 shadow-lg">
                <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 mb-4">
                  Key Skills & Core Tech Spec
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill, i) => (
                    <span 
                      key={i} 
                      className="px-3.5 py-1.5 bg-white/5 border border-white/10 text-luxury-gold text-xs font-bold rounded-xl truncate"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* How To Apply Section */}
            {job.applyType === 'email' && (
              <JobApplySection job={job} />
            )}
          </div>

          {/* Column B: Info Sidebar Column (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-40 space-y-6">
              
              {/* Job summary statistics card */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 pb-2 border-b border-white/5">
                  Job Summary
                </h3>

                <div className="space-y-4 text-xs md:text-sm">
                  <div className="flex justify-between items-center transition-colors hover:bg-white/5 p-1 rounded">
                    <span className="text-white/50 font-medium">Workplace Setting</span>
                    <span className="font-bold text-white capitalize">{job.workplaceType || 'hybrid'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center transition-colors hover:bg-white/5 p-1 rounded">
                    <span className="text-white/50 font-medium">Category / Sector</span>
                    <span className="font-bold text-white capitalize">{job.category}</span>
                  </div>

                  <div className="flex justify-between items-center transition-colors hover:bg-white/5 p-1 rounded">
                    <span className="text-white/50 font-medium">Employment Type</span>
                    <span className="font-bold text-white capitalize">{job.employmentType?.replace('-', ' ')}</span>
                  </div>

                  <div className="flex justify-between items-center transition-colors hover:bg-white/5 p-1 rounded">
                    <span className="text-white/50 font-medium">Required Experience</span>
                    <span className="font-bold text-white capitalize">{job.experienceLevel || 'Not Specified'}</span>
                  </div>

                  {job.numberOfPositions && (
                    <div className="flex justify-between items-center transition-colors hover:bg-white/5 p-1 rounded">
                      <span className="text-white/50 font-medium">Positions Available</span>
                      <span className="font-extrabold text-white px-2 py-0.5 bg-white/10 rounded-lg">{job.numberOfPositions}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center transition-colors hover:bg-white/5 p-1 rounded">
                    <span className="text-white/50 font-medium">Closing Deadline</span>
                    <span className="font-bold text-rose-400">{formatDeadline(job.deadline)}</span>
                  </div>
                </div>

                {job.applyType !== 'email' && (
                  <div className="mt-6">
                    <button 
                      onClick={handleApplyClick}
                      className="w-full text-center py-3 px-4 bg-luxury-gold hover:bg-luxury-gold/90 active:bg-gold-600 text-super-black font-extrabold text-sm uppercase tracking-widest rounded-xl shadow-lg transition-all cursor-pointer"
                    >
                      Apply For Job
                    </button>
                    <p className="text-[10px] text-center text-white/40 mt-2.5 font-medium">
                      This job utilizes {job.applyType || 'internal'} application routing.
                    </p>
                  </div>
                )}
              </div>

              {/* Employer description sidebar - Non-clickable with Green Accent */}
              <div className="bg-white/[0.03] text-white border border-white/5 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-2">
                  <span>🏢 Hiring Organization</span>
                </div>
                <h3 className="font-extrabold text-white text-base leading-snug mb-2">{job.hiringOrganization || job.companyName}</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Originally published vacancy under AmaanJobs verified career pipeline. This indicates the organization hosting or funding the vacancy.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JobDetailsView;
