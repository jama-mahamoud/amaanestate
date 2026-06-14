import React, { useState } from 'react';
import { X, Send, CheckCircle2, ChevronRight, Phone, MessageSquare, Mail, Globe, Sparkles } from 'lucide-react';
import { Job } from '@/types';
import { toast } from 'sonner';
import { jobService } from '@/services/jobService';

interface ApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({ job, isOpen, onClose, user }) => {
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentApplyType = job.applyType || 'internal';

  // Handle Internal Apply Form Submission
  const handleInternalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      toast.error('Please input all requested details to complete your card.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await jobService.applyForJob({
        jobId: job.id,
        jobTitle: job.title,
        companyId: job.companyId || 'admin-workplace',
        companyName: job.companyName,
        candidateName: name,
        candidateEmail: user?.email || 'guest@amaanestate.com',
        candidatePhone: phone,
        resumeUrl: 'internal-persistent-portfolio',
        coverLetter: message,
        employerId: job.ownerId || 'admin-workplace',
      });
      
      setIsSuccess(true);
      toast.success('Your professional candidacy profile has been routed successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to register application details. Please check connection logs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Email Apply Execution (logs in database and opens email intent safely as a robust backup)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      toast.error('Please input all details to complete your application card.');
      return;
    }

    setIsSubmitting(true);
    try {
      const companyEmailAddress = job.email || 'careers@amaanestate.com';
      
      // Log application in db too so employer retains records in dashboard
      await jobService.applyForJob({
        jobId: job.id,
        jobTitle: job.title,
        companyId: job.companyId || 'company-workplace',
        companyName: job.companyName,
        candidateName: name,
        candidateEmail: user?.email || 'guest@amaanestate.com',
        candidatePhone: phone,
        resumeUrl: 'email-submission-log',
        coverLetter: `[Email Application]\nContact: ${phone}\n\n${message}`,
        employerId: job.ownerId || 'admin-workplace',
      });

      // Launch standard mail client safely with pre-filled content
      const subject = encodeURIComponent(`Application for ${job.title} - ${name}`);
      const body = encodeURIComponent(`Dear Hiring Team at ${job.companyName},\n\nI am writing to express my solid interest in the ${job.title} position on AmaanJobs.\n\nMy Details:\n- Name: ${name}\n- Phone: ${phone}\n- Email: ${user?.email || 'Guest'}\n\nMy Introduction:\n${message}\n\nBest Regards,\n${name}`);
      
      window.open(`mailto:${companyEmailAddress}?subject=${subject}&body=${body}`, '_blank');
      
      setIsSuccess(true);
      toast.success('Candidacy dispatched! Email client spawned.');
    } catch (err) {
      toast.error('Error logging application credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle External redirection link action
  const handleExternalClick = () => {
    const link = job.applyLink || '#';
    const formattedLink = link.startsWith('http') ? link : `https://${link}`;
    window.open(formattedLink, '_blank', 'noopener,noreferrer');
    
    // Also quietly log it in db to help employer see metrics!
    try {
      jobService.applyForJob({
        jobId: job.id,
        jobTitle: job.title,
        companyId: job.companyId || 'external-workplace',
        companyName: job.companyName,
        candidateName: user?.displayName || 'Anonymous Candidate',
        candidateEmail: user?.email || 'guest@amaanestate.com',
        candidatePhone: user?.phone || 'external-click',
        resumeUrl: 'external-redirection-url',
        coverLetter: 'User clicked to apply through external corporate ATS platform.',
        employerId: job.ownerId || 'admin',
      });
    } catch {}

    onClose();
    toast.success('Redirected to official career portal.');
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0c]/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
      <div className="bg-neutral-900 border border-white/10 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative transition-transform scale-100 flex flex-col max-h-[90vh] text-white">
        
        {/* Header decoration */}
        <div className="bg-zinc-950 border-b border-white/5 px-6 py-5 text-white flex justify-between items-center relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl" />
          
          <div className="relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-gold">
              Candidacy Submission
            </span>
            <h2 className="text-lg font-bold truncate pr-3" title={job.title}>
              Apply: {job.title}
            </h2>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer shrink-0 z-10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Inner body content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="text-center py-8 px-4 flex flex-col items-center">
              <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-2xl flex items-center justify-center border border-green-500/20 mb-4 animate-scale-in">
                <CheckCircle2 size={32} className="fill-green-400 text-super-black" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Application Filed!</h3>
              <p className="text-sm text-white/60 mt-2.5 max-w-sm leading-relaxed">
                You have successfully transmitted your credentials for the **{job.title}** opening with {job.companyName}.
              </p>
              
              <button 
                onClick={onClose}
                className="mt-6 px-8 py-3 bg-luxury-gold hover:bg-luxury-gold/90 text-super-black text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Return to jobs panel
              </button>
            </div>
          ) : (
            <div>
              {/* Show applying company summary info bar */}
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3.5 mb-5 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1 font-bold text-luxury-gold text-sm">
                  {job.companyLogo ? (
                    <img referrerPolicy="no-referrer" src={job.companyLogo} alt={job.companyName} className="w-8 h-8 object-contain" />
                  ) : (
                    <span>{job.companyName?.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <span className="text-xs text-white/50 font-semibold block">{job.companyName}</span>
                  <span className="text-xs font-bold text-white block">{job.title}</span>
                </div>
              </div>

              {/* 1. External Apply Link Action */}
              {currentApplyType === 'external' && (
                <div className="text-center py-6 px-4">
                  <div className="w-14 h-14 bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/25 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Globe size={24} />
                  </div>
                  <h4 className="text-base font-extrabold text-white font-sans">Apply via Corporate Website</h4>
                  <p className="text-xs text-white/60 mt-2 max-w-sm mx-auto leading-relaxed">
                    This employer utilizes their external proprietary ATS and legal systems. We will route you directly to their career page.
                  </p>
                  
                  <div className="mt-8 flex flex-col md:flex-row gap-3">
                    <button 
                      onClick={onClose}
                      className="flex-1 py-3 border border-white/10 hover:border-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleExternalClick}
                      className="flex-1 py-3 bg-luxury-gold hover:bg-luxury-gold/90 text-super-black text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-md"
                    >
                      Visit Careers Page <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Internal Apply Form */}
              {currentApplyType === 'internal' && (
                <form onSubmit={handleInternalSubmit} className="space-y-4">
                  <div className="bg-luxury-gold/10 p-3 rounded-xl border border-luxury-gold/25 text-[11px] text-luxury-gold mb-3 flex items-start gap-2">
                    <Sparkles size={14} className="shrink-0 mt-0.5 text-luxury-gold" />
                    <span>Your application details will be saved securely and indexed inside the employer's dashboard instantly.</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block font-sans">Full Legal Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Abdi Farrah" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      className="w-full border border-white/10 bg-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold font-medium font-sans animate-none" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block font-sans">Contact Phone / WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-white/30" size={14} />
                      <input 
                        type="tel" 
                        required 
                        placeholder="e.g. +252 61..." 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)} 
                        className="w-full border border-white/10 bg-white/5 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold font-medium font-mono" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block font-sans">Short Pitch & Introduction</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 text-white/30" size={14} />
                      <textarea 
                        required 
                        rows={4}
                        placeholder="Detail your experience level, core certifications, and availability parameters..." 
                        value={message} 
                        onChange={e => setMessage(e.target.value)} 
                        className="w-full border border-white/10 bg-white/5 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold font-medium font-sans leading-relaxed" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3 border border-white/10 hover:bg-white/10 rounded-xl text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={isSubmitting}
                      type="submit" 
                      className="flex-1 py-3 bg-luxury-gold hover:bg-luxury-gold/90 text-super-black text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {isSubmitting ? 'Transmitting...' : 'Transmit Application'}
                    </button>
                  </div>
                </form>
              )}

              {/* 3. Email Apply Form */}
              {currentApplyType === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="bg-sky-500/10 p-3 rounded-xl border border-sky-500/20 text-[11px] text-sky-450 mb-3 flex items-start gap-2">
                    <Mail size={14} className="shrink-0 mt-0.5 text-sky-400" />
                    <span>This application will automatically launch your mail client pre-populated with your introduction details mapped directly to **{job.email || 'employer'}**.</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block font-sans">Full Legal Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Abdi Farrah" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      className="w-full border border-white/10 bg-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold font-medium font-sans" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block font-sans">Contact Phone / WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-white/30" size={14} />
                      <input 
                        type="tel" 
                        required 
                        placeholder="e.g. +252 61..." 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)} 
                        className="w-full border border-white/10 bg-white/5 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold font-medium font-mono" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block font-sans">Email Application Body Text</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 text-white/30" size={14} />
                      <textarea 
                        required 
                        rows={5}
                        placeholder="Detail your professional fit and experience details so we can construct a neat email block..." 
                        value={message} 
                        onChange={e => setMessage(e.target.value)} 
                        className="w-full border border-white/10 bg-white/5 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold font-medium font-sans leading-relaxed" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3 border border-white/10 hover:bg-white/10 rounded-xl text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={isSubmitting}
                      type="submit" 
                      className="flex-1 py-3 bg-luxury-gold hover:bg-luxury-gold/90 text-super-black text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                    >
                      <Mail size={14} /> {isSubmitting ? 'Processing...' : 'Proceed with Email'}
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;
