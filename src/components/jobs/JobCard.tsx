import React from 'react';
import { MapPin, Clock, Calendar, CheckCircle2, Bookmark, BookmarkCheck, Briefcase } from 'lucide-react';
import { Job } from '@/types';

interface JobCardProps {
  job: Job;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  onViewDetails: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, isBookmarked, onBookmarkToggle, onViewDetails }) => {
  // Format deadline if present
  const formatDeadline = (deadlineStr: any) => {
    if (!deadlineStr) return 'N/A';
    try {
      const date = new Date(deadlineStr);
      if (isNaN(date.getTime())) return deadlineStr;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return deadlineStr;
    }
  };

  const getUrgencyText = () => {
    if (job.isUrgent) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          ⚠️ Urgent
        </span>
      );
    }
    return null;
  };

  return (
    <div 
      className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:shadow-xl hover:border-luxury-gold/30 transition-all duration-300 cursor-pointer flex flex-col md:flex-row gap-5 justify-between items-start md:items-center shadow-lg hover:bg-white/[0.04]"
      onClick={onViewDetails}
    >
      <div className="flex gap-4 items-start flex-1 min-w-0">
        {/* Company Logo / Placeholder */}
        <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1 flex-shrink-0 shadow-sm relative group-hover:scale-[1.03] transition-transform">
          {job.companyLogo ? (
            <img 
              referrerPolicy="no-referrer"
              src={job.companyLogo} 
              alt={job.companyName} 
              className="w-full h-full object-contain rounded-lg" 
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-luxury-gold/10 text-luxury-gold flex items-center justify-center font-bold text-lg">
              {job.companyName?.charAt(0) || 'A'}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs text-white/60 font-semibold truncate hover:text-white transition-colors">
              {job.companyName}
            </span>
            {(job.isVerifiedCompany || job.isFeatured) && (
              <span className="inline-flex items-center text-luxury-gold" title="Verified Employer">
                <CheckCircle2 size={13} className="fill-luxury-gold text-super-black" />
              </span>
            )}
            {getUrgencyText()}
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-luxury-gold">
              {job.category}
            </span>
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-luxury-gold transition-colors line-clamp-1">
            {job.title}
          </h3>

          {/* Metadata Grid */}
          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 mt-2.5 text-xs text-white/60">
            <div className="flex items-center gap-1">
              <MapPin size={14} className="text-white/30" />
              <span className="capitalize">{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-white/30" />
              <span className="capitalize">{job.employmentType?.replace('-', ' ')}</span>
            </div>
            {job.experienceLevel && (
              <div className="flex items-center gap-1">
                <Briefcase size={14} className="text-white/30" />
                <span>Exp: {job.experienceLevel}</span>
              </div>
            )}
            {job.deadline && (
              <div className="flex items-center gap-1 text-white/50 font-medium">
                <Calendar size={14} className="text-white/30" />
                <span>Deadline: {formatDeadline(job.deadline)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Button & Actions Column */}
      <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto shrink-0 gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
        <div className="flex items-center gap-2">
          {/* Bookmark Button */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle();
            }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isBookmarked 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' 
                : 'bg-white/5 text-white/40 border-white/10 hover:text-white hover:bg-white/10 hover:border-white/20'
            }`}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Job"}
          >
            {isBookmarked ? (
              <BookmarkCheck size={16} className="fill-rose-400" />
            ) : (
              <Bookmark size={16} />
            )}
          </button>
        </div>

        {/* Sticky styled CTA Apply */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          className="px-5 py-2.5 bg-luxury-gold hover:bg-luxury-gold/90 active:bg-gold-600 text-super-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
        >
          View & Apply
        </button>
      </div>
    </div>
  );
};

export default JobCard;
