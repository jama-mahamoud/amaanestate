import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Sparkles, Loader2, Database, ShieldCheck, Mail, Globe } from 'lucide-react';
import { jobService } from '@/services/jobService';
import { Job } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import JobDetailsView from '@/components/jobs/JobDetailsView';
import ApplicationModal from '@/components/jobs/ApplicationModal';
import { toast } from 'sonner';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const resolvedJob = await jobService.getJobById(id);
        if (resolvedJob) {
          setJob(resolvedJob);
        } else {
          toast.error('The job listing could not be found.');
        }
      } catch (err) {
        console.error('Error fetching job detail:', err);
        toast.error('Could not load the specified job details from Firestore.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-super-black text-white/40">
        <Loader2 className="animate-spin text-luxury-gold mb-4" size={32} />
        <p className="text-xs uppercase tracking-[0.3em] text-white/40 font-bold">Retrieving job specifications...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-super-black text-white p-6">
        <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-3xl p-12 max-w-lg mx-auto">
          <Database size={48} className="mx-auto text-white/30 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white">Job Listing Sourced</h3>
          <p className="text-sm text-white/50 mt-2 max-w-sm mx-auto leading-relaxed">
            The requested job posting is either not approved, expired, or was removed from AmaanJobs platform directory.
          </p>
          <button 
            onClick={() => navigate('/jobs')}
            className="mt-6 px-6 py-2.5 bg-luxury-gold hover:bg-luxury-gold/90 text-super-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            &larr; View Active Portal Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-super-black text-white antialiased font-sans pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <JobDetailsView 
          job={job}
          onBack={() => navigate('/jobs')}
          onApplyClick={() => setIsApplyModalOpen(true)}
        />
      </div>

      <ApplicationModal 
        job={job} 
        isOpen={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)} 
        user={user}
      />
    </div>
  );
}
