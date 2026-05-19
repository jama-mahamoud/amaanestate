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

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const applicationService = {
  async submitApplication(type: ApplicationType, data: Record<string, any>, userOverride?: any) {
    const user = userOverride || auth.currentUser;
    if (!user) {
      console.error('SubmitApplication failed: No authenticated user found in auth singleton or context override.');
      throw new Error('Authentication required for institutional vetting. Please ensure you are signed in.');
    }

    const collectionName = type === 'professional' ? 'professionalApplications' : 'applications';
    const applicationsRef = collection(db, collectionName);
    const newApplication = {
      type,
      userId: user.uid,
      status: 'pending_review',
      data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(applicationsRef, newApplication);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, collectionName);
      throw error;
    }
  },

  async getUserApplications() {
    if (!auth.currentUser) return [];
    const applicationsRef = collection(db, 'applications');
    const q = query(
      applicationsRef, 
      where('userId', '==', auth.currentUser.uid),
      limit(20)
    );
    
    try {
      const snapshot = await getDocs(q);
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      apps.sort((a: any, b: any) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
        return bTime - aTime;
      });
      return apps;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'applications');
      return [];
    }
  }
};
