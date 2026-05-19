
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase'; 
import { Listing } from '@/types';

// Simple in-memory cache
const cache = new Map<string, { data: Listing[], timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute

const normalizeListing = (doc: QueryDocumentSnapshot<DocumentData>): Listing => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    status: data.status || 'pending',
    verificationStatus: data.verificationStatus || 'pending',
    isVerified: !!data.isVerified,
    legalChecked: !!data.legalChecked,
    ownershipVerified: !!data.ownershipVerified,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as Listing;
};

export const listingRepository = {
  async fetchListings(filters: { status?: string, verificationStatus?: string, city?: string, category?: string } = {}): Promise<Listing[]> {
    const cacheKey = JSON.stringify(filters);
    if (cache.has(cacheKey) && Date.now() - (cache.get(cacheKey)?.timestamp || 0) < CACHE_DURATION) {
      return cache.get(cacheKey)!.data;
    }

    try {
      const constraints: any[] = [];
      if (filters.status) constraints.push(where('status', '==', filters.status));
      if (filters.verificationStatus) constraints.push(where('verificationStatus', '==', filters.verificationStatus));
      if (filters.city) constraints.push(where('city', '==', filters.city));
      if (filters.category) constraints.push(where('category', '==', filters.category));

      const q = query(collection(db, 'listings'), ...constraints, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      const listings = querySnapshot.docs.map(normalizeListing);
      
      cache.set(cacheKey, { data: listings, timestamp: Date.now() });
      return listings;
    } catch (error) {
      console.error('Error fetching listings:', error);
      return [];
    }
  },

  async fetchAdminListings(): Promise<Listing[]> {
    // Admin needs full access, no filtering except maybe by date
    try {
      const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(normalizeListing);
    } catch (error) {
      console.error('Error fetching admin listings:', error);
      throw error;
    }
  },

  invalidateCache() {
    cache.clear();
  }
};
