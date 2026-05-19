import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  UserCircle, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  FileText,
  Loader2,
  Trash2,
  ShieldCheck,
  Award,
  Eye,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  UserX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { moderationService, ApplicationStatus } from '@/services/moderationService';
import { toast } from 'sonner';

export default function ProfessionalModeratedList() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    loadApps();
  }, [statusFilter]);

  const loadApps = async () => {
    setLoading(true);
    const data = await moderationService.getProfessionalApplications(statusFilter);
    setApps(data);
    setLoading(false);
  };

  const handleApprove = async (appId: string, userId: string, proData: any) => {
    setActioningId(appId);
    const success = await moderationService.approveProfessional(appId, userId, proData);
    if (success) {
      toast.success('Professional approved and service active');
      setApps(prev => prev.filter(a => a.id !== appId));
    } else {
      toast.error('Failed to approve professional');
    }
    setActioningId(null);
  };

  const handleReject = async (appId: string) => {
    setActioningId(appId);
    const success = await moderationService.rejectProfessional(appId);
    if (success) {
      toast.success('Application rejected');
      setApps(prev => prev.filter(a => a.id !== appId));
    } else {
      toast.error('Failed to reject application');
    }
    setActioningId(null);
  };

  const handleDelete = async (appId: string) => {
    if (!window.confirm('Delete this application permanently?')) return;
    setActioningId(appId);
    const success = await moderationService.deleteDocument('professionalApplications', appId);
    if (success) {
      toast.success('Application expunged');
      setApps(prev => prev.filter(a => a.id !== appId));
    } else {
      toast.error('Failed to delete application');
    }
    setActioningId(null);
  };

  if (loading && apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-luxury-gold mb-4" size={32} />
        <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">Querying Vetting Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Status Bar */}
      <div className="flex flex-wrap gap-2">
        {(['pending', 'approved', 'rejected', 'suspended'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${
              statusFilter === s 
              ? 'bg-luxury-gold text-black border-luxury-gold' 
              : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
            } border`}
          >
            {s}
          </button>
        ))}
      </div>

      {apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 glass-card rounded-[3rem] border-dashed border-white/5">
          <ShieldCheck className="text-white/10 mb-6" size={48} />
          <h3 className="text-2xl font-display font-bold">Registry Clear</h3>
          <p className="text-white/20 text-xs mt-2 uppercase tracking-widest">No applications found for this status</p>
        </div>
      ) : (
        <div className="space-y-6">
          {apps.map((app) => (
            <motion.div
              key={app.id}
              layout
              className="glass-card hover:bg-white/[0.03] transition-all rounded-[2.5rem] border border-white/5 overflow-hidden"
            >
              <div className="p-8 flex flex-col lg:flex-row items-center gap-10">
                {/* Applicant Photo */}
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-luxury-gold/20 shrink-0">
                   <img 
                     src={app.data.personalInfo.profilePhotoUrl || 'https://via.placeholder.com/150'} 
                     alt={app.data.personalInfo.fullName} 
                     className="w-full h-full object-cover"
                   />
                </div>

                {/* Basic Info */}
                <div className="flex-1 space-y-2 w-full text-center lg:text-left">
                   <div className="flex flex-col md:flex-row items-center gap-4">
                      <h4 className="text-2xl font-display font-bold tracking-tight">{app.data.personalInfo.fullName}</h4>
                      <div className="px-3 py-1 rounded-full bg-luxury-gold/10 text-luxury-gold text-[8px] font-black uppercase tracking-widest border border-luxury-gold/20">
                        {app.data.professionalDetails.category}
                      </div>
                   </div>
                   <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-white/40 text-[10px] font-black uppercase tracking-widest">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                         <MapPin size={10} className="text-luxury-gold" /> {app.data.personalInfo.city}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                         <Award size={10} className="text-luxury-gold" /> {app.data.professionalDetails.yearsExp} Years Exp
                      </div>
                   </div>
                   <p className="text-white/40 text-sm italic font-medium">"{app.data.personalInfo.title}"</p>
                </div>

                {/* Actions Quick */}
                <div className="flex gap-3 shrink-0">
                   <Button 
                     onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                     variant="ghost" 
                     className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 hover:border-luxury-gold hover:text-luxury-gold transition-all"
                   >
                     {expandedId === app.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                   </Button>
                   
                   {statusFilter === 'pending' && (
                     <Button 
                      onClick={() => handleApprove(app.id, app.userId, app.data)}
                      disabled={actioningId === app.id}
                      className="h-14 px-8 rounded-2xl bg-luxury-gold text-black hover:bg-white font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-luxury-gold/20"
                     >
                       {actioningId === app.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} className="mr-2" />} Approve
                     </Button>
                   )}

                   <Button 
                      onClick={() => handleDelete(app.id)}
                      disabled={actioningId === app.id}
                      variant="ghost"
                      className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 hover:bg-red-500 hover:text-white group"
                   >
                     <Trash2 size={20} className="text-white/20 group-hover:text-white" />
                   </Button>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedId === app.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5 bg-black/40"
                  >
                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                       {/* Narrative & Portfolio */}
                       <div className="space-y-8">
                          <div>
                             <h5 className="text-[10px] uppercase font-black tracking-[0.3em] text-luxury-gold mb-4">Professional Intelligence</h5>
                             <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 text-sm text-white/60 leading-relaxed italic">
                                {app.data.professionalDetails.bio}
                             </div>
                          </div>

                          <div>
                             <h5 className="text-[10px] uppercase font-black tracking-[0.3em] text-luxury-gold mb-4">Visual Portfolio</h5>
                             <div className="grid grid-cols-4 gap-3">
                                {app.data.experiencePortfolio.portfolioImageUrls?.map((url: string, i: number) => (
                                   <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-luxury-gold transition-colors">
                                      <img src={url} className="w-full h-full object-cover" />
                                   </a>
                                ))}
                             </div>
                          </div>
                       </div>

                       {/* Verification Dossier */}
                       <div className="space-y-8">
                          <div>
                             <h5 className="text-[10px] uppercase font-black tracking-[0.3em] text-luxury-gold mb-4">Verification Dossier</h5>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <DocumentPreview label="Legal Curriculum Vitae" url={app.data.verificationDocs.cvUrl} />
                                <DocumentPreview label="Identity Credentials" url={app.data.verificationDocs.idCardUrl} />
                                {app.data.verificationDocs.licenseUrl && <DocumentPreview label="Professional License" url={app.data.verificationDocs.licenseUrl} />}
                                {app.data.verificationDocs.certsUrl && <DocumentPreview label="Board Certifications" url={app.data.verificationDocs.certsUrl} />}
                             </div>
                          </div>

                          <div className="pt-4 border-t border-white/5 space-y-4">
                            {statusFilter === 'pending' && (
                              <Button 
                                onClick={() => handleReject(app.id)}
                                disabled={actioningId === app.id}
                                variant="destructive"
                                className="w-full h-14 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white font-bold text-[10px] uppercase tracking-widest"
                              >
                                Terminate Application Sequence
                              </Button>
                            )}
                            
                            {statusFilter === 'approved' && (
                              <div className="flex gap-4">
                                 <div className="flex-1 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    <CheckCircle2 size={16} /> Verified Active
                                 </div>
                              </div>
                            )}
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentPreview({ label, url }: { label: string, url: string }) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-luxury-gold transition-all flex items-center gap-4 group"
    >
       <div className="p-3 rounded-xl bg-white/5 text-white/20 group-hover:text-luxury-gold transition-colors">
          <FileText size={18} />
       </div>
       <div className="min-w-0">
          <p className="text-[9px] uppercase font-black tracking-widest text-white/60 truncate">{label}</p>
          <div className="flex items-center gap-1 text-[8px] uppercase font-bold text-white/20 mt-1">
             <Eye size={10} /> Inspect Document
          </div>
       </div>
    </a>
  );
}
