import React, { useState } from 'react';
import { Mail, Copy, Check } from 'lucide-react';
import { Job } from '@/types';
import { toast } from 'sonner';

interface JobApplySectionProps {
  job: Job;
}

export const JobApplySection: React.FC<JobApplySectionProps> = ({ job }) => {
  const [copied, setCopied] = useState(false);
  const emailVal = job.applicationEmail || job.email || 'hr@company.com';
  const prefilledSubject = `Application for ${job.title}`;

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(emailVal);
      setCopied(true);
      toast.success('Email address copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy email address automatically.');
    }
  };

  const mailtoUrl = `mailto:${emailVal}?subject=${encodeURIComponent(prefilledSubject)}`;

  return (
    <div 
      id="how-to-apply-section" 
      className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden text-left"
    >
      {/* Header section */}
      <h2 className="text-xl font-bold text-white border-b border-white/5 pb-4 mb-5 flex items-center gap-2 font-sans">
        <Mail size={20} className="text-luxury-gold" />
        How To Apply
      </h2>

      <div className="space-y-5">
        {/* Short, direct instruction paragraph */}
        <p className="text-white/80 text-sm md:text-base leading-relaxed">
          Interested and Qualified candidates can send their resume at{' '}
          <a 
            href={mailtoUrl}
            className="text-luxury-gold hover:underline font-mono font-semibold"
          >
            {emailVal}
          </a>{' '}
          with the Position at the Subject line <span className="text-[#C5A059] font-mono font-semibold">"{prefilledSubject}"</span>
        </p>

        {/* Highlighted clickable email & Copy interface */}
        <div className="flex items-center gap-2 bg-black/30 border border-white/5 p-2 rounded-xl max-w-lg">
          <a 
            href={mailtoUrl}
            className="flex-1 px-3 py-1.5 font-mono text-white/95 text-xs md:text-sm hover:underline break-all"
          >
            {emailVal}
          </a>
          
          <button 
            onClick={handleCopyEmail}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 rounded-lg transition-all text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0"
            title="Copy email address"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} className="opacity-75" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Action Button: Apply via Email (CTA) */}
        <div className="pt-2">
          <a 
            href={mailtoUrl}
            className="inline-flex items-center justify-center px-6 py-3 bg-[#C5A059] hover:bg-[#C5A059]/90 active:scale-[0.98] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
          >
            Apply via Email
          </a>
        </div>
      </div>
    </div>
  );
};
