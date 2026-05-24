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
  deleteDoc,
  doc, 
  getDoc, 
  serverTimestamp,
  QueryConstraint,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  or,
  and,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Listing, ListingCategory, ListingStatus, ListingType } from '../types';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { trustService } from './trustService'; 

export interface ListingFilter {
  category?: ListingCategory;
  listingType?: ListingType;
  subcategory?: string; 
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ListingStatus;
  currency?: string;
  limit?: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
  associatedBrokerId?: string;
  ownerId?: string;
}

// Basic in-memory cache for fetch results
const listingCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export const listingService = {
  /**
   * Internal normalization for legacy documents and consistency
   */
  normalizeListing(data: any, id: string): Listing {
    let status = data.status || 'DRAFT';
    
    // Legacy mapping
    if (status === 'pending' || status === 'PENDING') status = 'PENDING';
    else if (status === 'active' || status === 'approved' || status === 'ACTIVE') status = 'ACTIVE';
    else if (status === 'suspended' || status === 'SUSPENDED') status = 'SUSPENDED';
    else if (status === 'rejected' || status === 'REJECTED') status = 'SUSPENDED'; // Treat rejected as suspended for now
    else status = 'DRAFT';

    const normalizedData = {
      ...data,
      id,
      status: status as ListingStatus,
      category: data.category || 'property',
      price: Number(data.price) || 0,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt : (data.createdAt ? Timestamp.fromDate(new Date(data.createdAt)) : Timestamp.now()),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : (data.updatedAt ? Timestamp.fromDate(new Date(data.updatedAt)) : Timestamp.now()),
      // Fallbacks for legacy fields
      listingType: data.listingType || data.type || 'sale',
      images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
    };

    // Always compute the dynamic trustScore to replace any old, stale, or cached database values
    const trustResults = trustService.calculateTrustScore(normalizedData as Listing);
    normalizedData.trustScore = trustResults.trustScore;
    normalizedData.riskLevel = trustResults.riskLevel;

    return normalizedData as Listing;
  },

  async getListings(filters: ListingFilter = {}) {
    const listingsRef = collection(db, 'listings');
    const filterConstraints: any[] = [];

    if (filters.associatedBrokerId) {
      filterConstraints.push(where('associatedBrokerId', '==', filters.associatedBrokerId));
    }

    if (filters.ownerId) {
      filterConstraints.push(where('ownerId', '==', filters.ownerId));
    }

    // Default to active listings if no status is specified
    if (!filters.status && !filters.ownerId && !filters.associatedBrokerId) {
       filterConstraints.push(where('status', 'in', ['active', 'approved', 'ACTIVE']));
    } else if (filters.status) {
       const statusOptions = Array.from(new Set([filters.status, filters.status.toLowerCase(), filters.status.toUpperCase()]));
       filterConstraints.push(where('status', 'in', statusOptions));
    }

    if (filters.category) {
      filterConstraints.push(where('category', '==', filters.category));
    }

    if (filters.listingType) {
      filterConstraints.push(where('listingType', '==', filters.listingType));
    }
    
    // Updated to subcategory
    if (filters.subcategory && filters.subcategory !== 'All') {
      filterConstraints.push(where('subcategory', '==', filters.subcategory.trim().toLowerCase()));
    }

    if (filters.currency && filters.currency !== 'All') {
      filterConstraints.push(where('currency', '==', filters.currency));
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
      queryConstraints.push(limit(100)); // Larger limit for better responsiveness
    }

    if (filters.lastDoc) {
      queryConstraints.push(startAfter(filters.lastDoc));
    }

    try {
      const q = query(listingsRef, ...queryConstraints);
      const snapshot = await getDocs(q);
      
      const listings = snapshot.docs.map(doc => this.normalizeListing(doc.data(), doc.id));

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
        return this.normalizeListing(snapshot.data(), snapshot.id);
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
    let userRole = 'normal_user';
    try {
      const userSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userSnap.exists()) {
        userRole = userSnap.data().role || 'normal_user';
      }
    } catch (err) {
      console.warn('Failed to fetch user role for listing creation, falling back to normal_user:', err);
    }

    const newListing = {
      ...data,
      ownerId: auth.currentUser.uid,
      createdBy: auth.currentUser.uid,
      createdByRole: userRole,
      status: 'PENDING', 
      isFeatured: false, 
      isVerified: false,
      verificationStatus: 'PENDING',
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
    let userRole = 'normal_user';
    try {
      const userSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userSnap.exists()) {
        userRole = userSnap.data().role || 'normal_user';
      }
    } catch (err) {
      console.warn('Failed to fetch user role for listing creation, falling back to normal_user:', err);
    }

    const newListing = {
      ...data,
      ownerId: auth.currentUser.uid,
      createdBy: auth.currentUser.uid,
      createdByRole: userRole,
      status: 'PENDING', 
      isFeatured: false, 
      isVerified: false,
      verificationStatus: 'PENDING',
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
    const snapshot = await getDoc(listingRef);
    const currentListing = snapshot.exists() ? this.normalizeListing(snapshot.data(), id) as Listing : {} as Listing;
    
    // Enforcement: non-admins cannot set status to VERIFIED or ACTIVE
    if (!asAdmin && (data.status === 'VERIFIED' || data.status === 'ACTIVE')) {
      delete data.status;
    }

    const cleanData = { ...data };
    
    // Calculate Trust Score
    const updatedListing = { ...currentListing, ...cleanData } as Listing;
    const trustResults = trustService.calculateTrustScore(updatedListing);
    cleanData.trustScore = trustResults.trustScore;
    cleanData.riskLevel = trustResults.riskLevel;

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

  async getUserListings(userId: string, category?: ListingCategory, limitCount = 50, userRole?: string) {
    const listingsRef = collection(db, 'listings');
    const constraints: any[] = [];

    const isAdmin = userRole?.toString().toLowerCase().trim() === 'admin';
    if (!isAdmin) {
      constraints.push(
        or(
          where('ownerId', '==', userId),
          where('createdBy', '==', userId)
        )
      );
    }
    
    constraints.push(limit(limitCount));

    if (category) {
      constraints.push(where('category', '==', category));
    }

    const q = query(listingsRef, ...constraints);

    try {
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => this.normalizeListing(doc.data(), doc.id));
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

  async deleteListing(id: string): Promise<boolean> {
    const listingRef = doc(db, 'listings', id);
    try {
      await deleteDoc(listingRef);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `listings/${id}`);
      return false;
    }
  }
};
