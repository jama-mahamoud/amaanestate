import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  serverTimestamp,
  QueryConstraint,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Listing, ListingCategory, ListingStatus, ListingType, ProfessionalService, ServiceStatus } from '../types';

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

export interface ListingFilter {
  category?: ListingCategory;
  listingType?: ListingType;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ListingStatus;
  limit?: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
}

export const listingService = {
  async getListings(filters: ListingFilter = {}) {
    const listingsRef = collection(db, 'listings');
    const constraints: QueryConstraint[] = [];

    // Default to active listings if no status is specified
    constraints.push(where('status', '==', filters.status || 'active'));

    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }

    if (filters.listingType) {
      constraints.push(where('listingType', '==', filters.listingType));
    }

    if (filters.city && filters.city !== 'All') {
      constraints.push(where('city', '==', filters.city));
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      if (filters.minPrice !== undefined) {
        constraints.push(where('price', '>=', filters.minPrice));
      }
      if (filters.maxPrice !== undefined) {
        constraints.push(where('price', '<=', filters.maxPrice));
      }
      // Firestore requires first orderBy to be the field used for inequality
      constraints.push(orderBy('price', 'asc'));
    }

    // Secondary ordering
    constraints.push(orderBy('createdAt', 'desc'));

    // Pagination
    if (filters.limit) {
      constraints.push(limit(filters.limit));
    } else {
      constraints.push(limit(20)); // Default page size
    }

    if (filters.lastDoc) {
      constraints.push(startAfter(filters.lastDoc));
    }

    try {
      const q = query(listingsRef, ...constraints);
      const snapshot = await getDocs(q);
      
      const listings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Listing[];

      return {
        listings,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'listings');
      return { listings: [], lastDoc: undefined };
    }
  },

  async getListingById(id: string): Promise<Listing | null> {
    const listingRef = doc(db, 'listings', id);
    try {
      const snapshot = await getDoc(listingRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Listing;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `listings/${id}`);
      return null;
    }
  },

  async createListing(data: Omit<Listing, 'id' | 'status' | 'ownerId' | 'createdAt' | 'updatedAt'>) {
    if (!auth.currentUser) throw new Error('Authentication required');

    const listingsRef = collection(db, 'listings');
    const newListing = {
      ...data,
      ownerId: auth.currentUser.uid,
      status: 'pending', // All submissions default to pending
      isFeatured: false, // Cannot self-feature
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(listingsRef, newListing);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'listings');
      return null;
    }
  },

  async getUserListings(userId: string, category?: ListingCategory, limitCount = 50) {
    const listingsRef = collection(db, 'listings');
    const constraints: QueryConstraint[] = [
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    ];

    if (category) {
      constraints.push(where('category', '==', category));
    }

    const q = query(listingsRef, ...constraints);

    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Listing[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'listings');
      return [];
    }
  },

  async getProfessionalServices(category?: string, status: ServiceStatus = 'active') {
    const servicesRef = collection(db, 'professionalServices');
    const constraints: QueryConstraint[] = [where('status', '==', status)];

    if (category && category !== 'All') {
      constraints.push(where('category', '==', category));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    try {
      const q = query(servicesRef, ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProfessionalService[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'professionalServices');
      return [];
    }
  }
};
