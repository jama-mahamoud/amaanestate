import { 
  collection, 
  getDocs, 
  query, 
  limit, 
  orderBy,
  doc,
  updateDoc,
  where,
  getDoc,
  getCountFromServer
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

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

export const userService = {
  async getAllUsers(limitCount = 50) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'), limit(limitCount));
    
    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as unknown as UserProfile[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      return [];
    }
  },

  async updateUserRole(userId: string, role: UserRole) {
    const userRef = doc(db, 'users', userId);
    try {
      await updateDoc(userRef, { role });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      return false;
    }
  },

  async getUserProfile(userId: string) {
    const userRef = doc(db, 'users', userId);
    try {
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as unknown as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      return null;
    }
  },

  async getGlobalStats() {
    try {
      const listingsRef = collection(db, 'listings');
      const usersRef = collection(db, 'users');
      
      const propertiesQuery = query(listingsRef, where('category', '==', 'property'));
      const vehiclesQuery = query(listingsRef, where('category', '==', 'vehicle'));
      const agentsQuery = query(usersRef, where('role', '==', 'agent'));

      const [propertiesCount, vehiclesCount, agentsCount, totalUsersCount] = await Promise.all([
        getCountFromServer(propertiesQuery),
        getCountFromServer(vehiclesQuery),
        getCountFromServer(agentsQuery),
        getCountFromServer(usersRef),
      ]);

      return {
        properties: propertiesCount.data().count,
        vehicles: vehiclesCount.data().count,
        agents: agentsCount.data().count,
        users: totalUsersCount.data().count
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'multiple/counts');
      return { properties: 0, vehicles: 0, agents: 0, users: 0 };
    }
  }
};
