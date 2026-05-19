
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
  async fetchListings(filters: { status?: string, verificationStatus?: string, city?: string, category?: string, listingType?: string, searchQuery?: string, verifiedOnly?: boolean } = {}): Promise<Listing[]> {
    const cacheKey = JSON.stringify(filters);
    if (cache.has(cacheKey) && Date.now() - (cache.get(cacheKey)?.timestamp || 0) < CACHE_DURATION) {
      return cache.get(cacheKey)!.data;
    }

    try {
      // Query only by createdAt to avoid compound index requirements. 
      // All other filtering is performed client-side.
      const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      let listings = querySnapshot.docs.map(normalizeListing);
      
      // Client-side advanced filtering
      if (filters.status) {
        listings = listings.filter(l => l.status === filters.status);
      }
      if (filters.city) {
        listings = listings.filter(l => l.city === filters.city);
      }
      if (filters.category) {
        listings = listings.filter(l => l.category === filters.category);
      }
      if (filters.listingType) {
        listings = listings.filter(l => l.listingType === filters.listingType);
      }
      if (filters.verificationStatus) {
        listings = listings.filter(l => l.verificationStatus === filters.verificationStatus);
      }
      if (filters.searchQuery) {
        const queryLower = filters.searchQuery.toLowerCase();
        listings = listings.filter(l => 
          l.title.toLowerCase().includes(queryLower) || 
          (l.description && l.description.toLowerCase().includes(queryLower)) ||
          (l.city && l.city.toLowerCase().includes(queryLower))
        );
      }
      
      if (filters.verifiedOnly) {
          listings = listings.filter(l => l.isVerified);
      }
      
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
