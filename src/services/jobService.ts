import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { notificationService } from './notificationService';
import { Job, CompanyProfile, CandidateProfile, JobApplication } from '@/types';

const jobsCache = new Map<string, { data: Job[], timestamp: number }>();
const jobDetailCache = new Map<string, { data: Job, timestamp: number }>();
const JOB_CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export const clearJobCaches = () => {
  jobsCache.clear();
  jobDetailCache.clear();
  console.log('[Cache] Job caches cleared');
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error in JobService: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const jobService = {
  // ==========================================
  // JOBS SYSTEM
  // ==========================================
  async getJobs(filters: {
    category?: string;
    workplaceType?: string;
    employmentType?: string;
    location?: string;
    search?: string;
    isUrgent?: boolean;
    isFeatured?: boolean;
    status?: 'pending' | 'approved' | 'rejected' | 'expired' | 'draft';
    ownerId?: string;
  } = {}): Promise<Job[]> {
    const cacheKey = JSON.stringify(filters);
    const cached = jobsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < JOB_CACHE_TTL) {
      return cached.data;
    }

    const path = 'jobs';
    try {
      const colRef = collection(db, path);
      const snapshot = await getDocs(colRef);
      
      let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));

      // 1. Filter by ownerId if specified
      if (filters.ownerId) {
        results = results.filter(job => job.ownerId === filters.ownerId);
      }

      // 2. Filter by status
      if (filters.status) {
        results = results.filter(job => job.status === filters.status);
      } else if (!filters.ownerId) {
        // Default to approved only if no owner filter is specified
        results = results.filter(job => job.status === 'approved');
      }

      // 3. Filter by category
      if (filters.category && filters.category !== 'All') {
        results = results.filter(job => job.category === filters.category);
      }

      // 4. Filter by workplaceType
      if (filters.workplaceType && filters.workplaceType !== 'All') {
        results = results.filter(job => job.workplaceType === filters.workplaceType);
      }

      // 5. Filter by employmentType
      if (filters.employmentType && filters.employmentType !== 'All') {
        results = results.filter(job => job.employmentType === filters.employmentType);
      }

      // 6. Filter by location
      if (filters.location && filters.location !== 'All') {
        results = results.filter(job => job.location === filters.location);
      }

      // 7. Filter by isUrgent
      if (filters.isUrgent !== undefined) {
        results = results.filter(job => job.isUrgent === filters.isUrgent);
      }

      // 8. Filter by isFeatured
      if (filters.isFeatured !== undefined) {
        results = results.filter(job => job.isFeatured === filters.isFeatured);
      }

      // 9. Client-side search filters for keyword matching
      if (filters.search) {
        const term = filters.search.toLowerCase();
        results = results.filter(job => 
          job.title.toLowerCase().includes(term) || 
          job.description.toLowerCase().includes(term) ||
          job.companyName.toLowerCase().includes(term) ||
          (job.requirements || '').toLowerCase().includes(term)
        );
      }

      // 10. Sort by createdAt desc in memory safely supporting Timestamp objects and JS date representations
      results.sort((a, b) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return dateB - dateA;
      });

      jobsCache.set(cacheKey, { data: results, timestamp: Date.now() });
      return results;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getJobById(jobId: string): Promise<Job | null> {
    const cacheKey = `job_by_id_${jobId}`;
    const cached = jobDetailCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < JOB_CACHE_TTL) {
      return cached.data;
    }

    const path = `jobs/${jobId}`;
    try {
      const docRef = doc(db, 'jobs', jobId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const job = { id: docSnap.id, ...docSnap.data() } as Job;
        jobDetailCache.set(cacheKey, { data: job, timestamp: Date.now() });
        return job;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'ownerId'>): Promise<string> {
    if (!auth.currentUser) throw new Error('Authentication required');
    const path = 'jobs';
    try {
      const colRef = collection(db, 'jobs');
      const newDocRef = doc(colRef);
      
      const payload: Omit<Job, 'id'> = {
        ...jobData,
        ownerId: auth.currentUser.uid,
        status: jobData.status || 'pending', // require review or use specified
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(newDocRef, payload);
      clearJobCaches();
      
      // Notify admins
      await notificationService.createNotification(
        'admin',
        'New Job Pending Activation',
        `Job "${jobData.title}" has been posted and requires moderation approval or vetting.`,
        'SYSTEM'
      );

      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return '';
    }
  },

  async updateJob(jobId: string, updates: Partial<Job>): Promise<void> {
    const path = `jobs/${jobId}`;
    try {
      const docRef = doc(db, 'jobs', jobId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      clearJobCaches();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteJob(jobId: string): Promise<void> {
    const path = `jobs/${jobId}`;
    try {
      const docRef = doc(db, 'jobs', jobId);
      await deleteDoc(docRef);
      clearJobCaches();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // ==========================================
  // EMPLOYERS / COMPANIES
  // ==========================================
  async getCompanyById(companyId: string): Promise<CompanyProfile | null> {
    const path = `companies/${companyId}`;
    try {
      const docRef = doc(db, 'companies', companyId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as CompanyProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async getCompanies(): Promise<CompanyProfile[]> {
    const path = 'companies';
    try {
      const colSnap = await getDocs(collection(db, 'companies'));
      return colSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CompanyProfile));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getCompanyByOwnerId(ownerId: string): Promise<CompanyProfile | null> {
    const path = 'companies';
    try {
      const q = query(collection(db, 'companies'), where('ownerId', '==', ownerId));
      const colSnap = await getDocs(q);
      if (!colSnap.empty) {
        return { id: colSnap.docs[0].id, ...colSnap.docs[0].data() } as CompanyProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return null;
    }
  },

  async createCompany(companyData: Omit<CompanyProfile, 'id' | 'createdAt' | 'isVerified' | 'status' | 'ownerId'>): Promise<string> {
    if (!auth.currentUser) throw new Error('Authentication required');
    const path = 'companies';
    try {
      const colRef = collection(db, 'companies');
      const newDocRef = doc(colRef);
      const payload: Omit<CompanyProfile, 'id'> = {
        ...companyData,
        ownerId: auth.currentUser.uid,
        isVerified: false,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(newDocRef, payload);
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return '';
    }
  },

  async updateCompany(companyId: string, updates: Partial<CompanyProfile>): Promise<void> {
    const path = `companies/${companyId}`;
    try {
      const docRef = doc(db, 'companies', companyId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // ==========================================
  // CANDIDATES
  // ==========================================
  async getCandidateProfile(userId: string): Promise<CandidateProfile | null> {
    const path = `candidateProfiles/${userId}`;
    try {
      const docRef = doc(db, 'candidateProfiles', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as CandidateProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async updateCandidateProfile(userId: string, data: Omit<CandidateProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const path = `candidateProfiles/${userId}`;
    try {
      const docRef = doc(db, 'candidateProfiles', userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(docRef, {
          ...data,
          createdAt: docSnap.data().createdAt || serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // ==========================================
  // APPLICATIONS SYSTEM
  // ==========================================
  async getApplicationsForJob(jobId: string): Promise<JobApplication[]> {
    const path = 'jobApplications';
    try {
      const q = query(collection(db, 'jobApplications'), where('jobId', '==', jobId));
      const colSnap = await getDocs(q);
      return colSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobApplication));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getCandidateApplications(candidateId: string): Promise<JobApplication[]> {
    const path = 'jobApplications';
    try {
      const q = query(collection(db, 'jobApplications'), where('candidateId', '==', candidateId));
      const colSnap = await getDocs(q);
      return colSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobApplication));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getEmployerApplications(employerId: string): Promise<JobApplication[]> {
    const path = 'jobApplications';
    try {
      const q = query(collection(db, 'jobApplications'), where('employerId', '==', employerId));
      const colSnap = await getDocs(q);
      return colSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobApplication));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async applyForJob(applicationData: Omit<JobApplication, 'id' | 'createdAt' | 'candidateId' | 'status'> & { employerId: string }): Promise<string> {
    if (!auth.currentUser) throw new Error('Authentication required');
    const path = 'jobApplications';
    try {
      const colRef = collection(db, 'jobApplications');
      const newDocRef = doc(colRef);
      
      const payload = {
        ...applicationData,
        candidateId: auth.currentUser.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(newDocRef, payload);

      // Create a direct dashboard notification for the hiring employer
      await notificationService.createNotification(
        applicationData.employerId,
        'New Candidate Job Application!',
        `Candidate "${applicationData.candidateName}" applied for your job "${applicationData.jobTitle}". Review is required.`,
        'INQUIRY'
      );

      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return '';
    }
  },

  async updateApplicationStatus(applicationId: string, status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired', candidateId: string, jobTitle: string): Promise<void> {
    const path = `jobApplications/${applicationId}`;
    try {
      const docRef = doc(db, 'jobApplications', applicationId);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp()
      });

      // Notify Candidate
      let statusLabel = status.toUpperCase();
      await notificationService.createNotification(
        candidateId,
        `Job Application Status Update: ${statusLabel}`,
        `Your application for "${jobTitle}" has been updated to "${statusLabeled(status)}". Check details inside careers center.`,
        'SYSTEM'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async getAllApplications(): Promise<JobApplication[]> {
    const path = 'jobApplications';
    try {
      const colRef = collection(db, 'jobApplications');
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobApplication));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getAllCandidateProfiles(): Promise<CandidateProfile[]> {
    const path = 'candidateProfiles';
    try {
      const colRef = collection(db, 'candidateProfiles');
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CandidateProfile));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  }
};

function statusLabeled(status: string) {
  switch(status) {
    case 'reviewed': return 'Reviewed';
    case 'shortlisted': return 'Shortlisted';
    case 'rejected': return 'Rejected & Kept in Talent Pool';
    case 'hired': return 'Successfully Hired! 🎉';
    default: return 'Pending Review';
  }
}
