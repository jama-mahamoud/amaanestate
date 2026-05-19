import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  updateDoc, 
  setDoc,
  doc, 
  getDoc, 
  serverTimestamp,
  QueryConstraint,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  or,
  and
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Listing, ListingCategory, ListingStatus, ListingType, ProfessionalService, ServiceStatus } from '../types';
import { handleFirestoreError, OperationType } from '../lib/utils';

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
    const filterConstraints: any[] = [];

    // Default to active listings if no status is specified
    filterConstraints.push(where('status', '==', filters.status || 'active'));

    if (filters.category) {
      filterConstraints.push(where('category', '==', filters.category));
    }

    if (filters.listingType) {
      filterConstraints.push(where('listingType', '==', filters.listingType));
    }

    if (filters.city && filters.city !== 'All') {
      filterConstraints.push(or(
        where('city', '==', filters.city),
        where('region', '==', filters.city)
      ));
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      if (filters.minPrice !== undefined) {
        filterConstraints.push(where('price', '>=', filters.minPrice));
      }
      if (filters.maxPrice !== undefined) {
        filterConstraints.push(where('price', '<=', filters.maxPrice));
      }
    }

    const queryConstraints: any[] = [];
    if (filterConstraints.length > 0) {
      // If we are filtering by a city, our query contains an 'or' composite filter.
      // Firestore requires all other filter conditions to be bundled with the 'or' filter under a single top-level 'and(...)'.
      if (filters.city && filters.city !== 'All') {
        queryConstraints.push(and(...filterConstraints));
      } else {
        queryConstraints.push(...filterConstraints);
      }
    }

    // Pagination/Query Adjustment
    if (filters.limit) {
      queryConstraints.push(limit(filters.limit));
    } else {
      queryConstraints.push(limit(20)); // Default page size
    }

    if (filters.lastDoc) {
      queryConstraints.push(startAfter(filters.lastDoc));
    }

    try {
      const q = query(listingsRef, ...queryConstraints);
      const snapshot = await getDocs(q);
      
      const listings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Listing[];

      // Client-side sort
      listings.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
        return bTime - aTime;
      });

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
      status: 'pending', 
      isFeatured: false, 
      isVerified: false,
      verificationStatus: 'pending',
      legalChecked: false,
      ownershipVerified: false,
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

  async createListingWithId(id: string, data: Omit<Listing, 'id' | 'status' | 'ownerId' | 'createdAt' | 'updatedAt'>) {
    if (!auth.currentUser) throw new Error('Authentication required');

    const listingRef = doc(db, 'listings', id);
    const newListing = {
      ...data,
      ownerId: auth.currentUser.uid,
      status: 'pending', 
      isFeatured: false, 
      isVerified: false,
      verificationStatus: 'pending',
      legalChecked: false,
      ownershipVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(listingRef, newListing);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `listings/${id}`);
      return null;
    }
  },

  async updateListing(id: string, data: Partial<Listing>, asAdmin: boolean = false) {
    const listingRef = doc(db, 'listings', id);
    const cleanData = { ...data };
    if (!asAdmin) {
      delete cleanData.isVerified;
      delete cleanData.verificationStatus;
      delete cleanData.legalChecked;
      delete cleanData.ownershipVerified;
      delete cleanData.isFeatured;
    }
    try {
      await updateDoc(listingRef, {
        ...cleanData,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `listings/${id}`);
      return false;
    }
  },

  async getUserListings(userId: string, category?: ListingCategory, limitCount = 50) {
    const listingsRef = collection(db, 'listings');
    const constraints: QueryConstraint[] = [
      where('ownerId', '==', userId),
      limit(limitCount)
    ];

    if (category) {
      constraints.push(where('category', '==', category));
    }

    const q = query(listingsRef, ...constraints);

    try {
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Listing[];
      // Client-side sort by createdAt descending since we removed orderBy clause to avoid index issues
      return docs.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
        return bTime - aTime;
      });
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

    try {
      const q = query(servicesRef, ...constraints);
      const snapshot = await getDocs(q);
      const services = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProfessionalService[];
      
      services.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
        return bTime - aTime;
      });
      return services;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'professionalServices');
      return [];
    }
  }
};
