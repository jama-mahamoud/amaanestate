import { 
  collection, 
  addDoc, 
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export type ApplicationType = 'agent' | 'professional';
export type ApplicationStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

export interface Application {
  id?: string;
  type: ApplicationType;
  status: ApplicationStatus;
  userId: string;
  data: Record<string, any>;
  createdAt: any;
  updatedAt: any;
}

export const applicationService = {
  async submitApplication(type: ApplicationType, data: Record<string, any>) {
    if (!auth.currentUser) throw new Error('Authentication required for institutional vetting.');

    const applicationsRef = collection(db, 'applications');
    const newApplication = {
      type,
      userId: auth.currentUser.uid,
      status: 'pending',
      data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(applicationsRef, newApplication);
      return docRef.id;
    } catch (error) {
      console.error('Application Submission Error:', error);
      throw error;
    }
  },

  async getUserApplications() {
    if (!auth.currentUser) return [];
    const applicationsRef = collection(db, 'applications');
    const q = query(
      applicationsRef, 
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }
};
