import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '@/services/jobService';
import { Job, CompanyProfile } from '@/types';
import CompanyProfileView from '@/components/jobs/CompanyProfileView';
import { toast } from 'sonner';

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Local bookmarking state
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>(() => {
    const saved = localStorage.getItem('amaan_bookmarked_jobs');
    return saved ? JSON.parse(saved) : [];
  });

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

  if (!id) {
    return null;
  }

  return (
    <div className="min-h-screen bg-super-black text-white antialiased font-sans pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <CompanyProfileView 
          companyId={id}
          onBack={() => navigate('/jobs')}
          onSelectJob={(job) => navigate(`/job/${job.id}`)}
          bookmarkedJobs={bookmarkedJobs}
          toggleBookmark={toggleBookmark}
        />
      </div>
    </div>
  );
}
