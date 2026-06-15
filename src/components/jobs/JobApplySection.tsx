import React, { useState } from 'react';
import { Mail, Copy, Check, ChevronRight } from 'lucide-react';
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
      className="bg-white/[0.02] border border-[#C5A059]/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-left"
    >
      {/* Decorative luxury gold top border glow */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C5A059]/60 to-transparent" />
      
      {/* Header section */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center border border-[#C5A059]/20">
          <Mail size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-sans">How To Apply</h2>
        </div>
      </div>

      <div className="space-y-6">
        {/* Paragraph section */}
        <div className="space-y-2">
          <p className="text-white/70 text-sm md:text-base leading-relaxed">
            Interested and qualified candidates can send their resume directly to:
          </p>
          
          {/* Highlighted clickable email string card with integrated copy button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3 bg-black/40 border border-white/10 p-2.5 rounded-xl">
            <a 
              href={mailtoUrl}
              className="flex-1 px-4 py-2 font-mono text-[#C5A059] hover:text-[#C5A059]/85 text-sm md:text-base hover:underline break-all flex items-center gap-2 select-all font-semibold"
            >
              <Mail size={16} className="shrink-0 opacity-70" />
              {emailVal}
            </a>
            
            <button 
              onClick={handleCopyEmail}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white hover:text-white/90 border border-white/10 rounded-lg transition-all text-xs font-bold leading-none cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              title="Copy email address"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} className="opacity-70" />
                  <span>Copy Info</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Structured Subject Line Guideline */}
        <div className="bg-white/[0.01] border-l-2 border-[#C5A059]/50 pl-4 py-1">
          <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Required Subject Line Format</p>
          <div className="mt-1.5 bg-zinc-950/70 py-2 px-3.5 rounded-lg inline-block border border-white/5 text-xs md:text-sm font-mono text-white/90">
            {prefilledSubject}
          </div>
        </div>

        {/* Custom display for custom recruitment instructions if formatted by employer */}
        {job.howToApplyInstructions && (
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="text-white/85 leading-relaxed text-sm p-4 rounded-xl bg-black/25 border border-white/5 whitespace-pre-line font-sans">
              {job.howToApplyInstructions}
            </div>
          </div>
        )}

        {/* Action Button: Apply via Email (CTA) */}
        <div className="pt-4">
          <a 
            href={mailtoUrl}
            className="w-full sm:w-auto px-8 py-4 bg-[#C5A059] hover:bg-[#C5A059]/90 active:scale-[0.98] text-black font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-[#C5A059]/5 hover:shadow-[#C5A059]/10 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Apply via Email</span>
            <ChevronRight size={14} className="stroke-[2.5]" />
          </a>
          <p className="text-[10px] text-white/40 mt-3 font-sans">
            Clicking this button will securely spawn your system's default email client (e.g. Outlook, Apple Mail, Gmail) with the correct fields pre-populated.
          </p>
        </div>
      </div>
    </div>
  );
};
