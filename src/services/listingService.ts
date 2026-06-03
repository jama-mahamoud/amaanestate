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
  Timestamp,
  getCountFromServer
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Listing, ListingCategory, ListingStatus, ListingType } from '../types';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { trustService } from './trustService'; 
import { getCityQueryVariations, normalizeCityName } from '../utils/cityNormalization';
import { CITIES_DATA } from '../data/cities';

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

export const clearListingCaches = () => {
  listingCache.clear();
  console.log('[Cache] Listing caches invalidated successfully');
};

const getCacheKey = (filters: ListingFilter = {}) => {
  // Serialize filters safely, mapping lastDoc to some identifier if present
  const keys = {
    ...filters,
    lastDoc: filters.lastDoc ? filters.lastDoc.id : undefined
  };
  return JSON.stringify(keys);
};

export const listingService = {
  /**
   * Internal normalization for legacy documents and consistency
   */
  normalizeListing(data: any, id: string): Listing {
    let status = data.status || 'DRAFT';
    
    // Legacy mapping
    if (status === 'pending' || status === 'PENDING') status = 'PENDING';
    else if (status === 'active' || status === 'approved' || status === 'ACTIVE' || status === 'verified' || status === 'VERIFIED') status = 'ACTIVE';
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
    const cacheKey = `listings_${getCacheKey(filters)}`;
    const cached = listingCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return cached.data;
    }

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
       filterConstraints.push(where('status', 'in', ['ACTIVE', 'active', 'VERIFIED', 'verified']));
    } else if (filters.status) {
       const statusValue = filters.status.toUpperCase();
       const statusValueLower = filters.status.toLowerCase();
       filterConstraints.push(where('status', 'in', [statusValue, statusValueLower]));
    }

    if (filters.category) {
      if (filters.category === 'property') {
        filterConstraints.push(where('category', 'in', ['property', 'land']));
      } else {
        filterConstraints.push(where('category', '==', filters.category));
      }
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
      const cityOptions = getCityQueryVariations(filters.city);
      const uniqueCities = Array.from(new Set(cityOptions)).slice(0, 3);
      filterConstraints.push(where('city', 'in', uniqueCities));
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
      queryConstraints.push(...filterConstraints);
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

      const response = {
        listings,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };

      listingCache.set(cacheKey, { data: response, timestamp: Date.now() });
      return response;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'listings');
      return { listings: [], lastDoc: undefined };
    }
  },

  async getListingsCount(filters: ListingFilter = {}): Promise<number> {
    const listingsRef = collection(db, 'listings');
    const filterConstraints: any[] = [];

    if (filters.associatedBrokerId) {
      filterConstraints.push(where('associatedBrokerId', '==', filters.associatedBrokerId));
    }

    if (filters.ownerId) {
      filterConstraints.push(where('ownerId', '==', filters.ownerId));
    }

    if (!filters.status && !filters.ownerId && !filters.associatedBrokerId) {
       filterConstraints.push(where('status', 'in', ['ACTIVE', 'active', 'VERIFIED', 'verified']));
    } else if (filters.status) {
       const statusValue = filters.status.toUpperCase();
       const statusValueLower = filters.status.toLowerCase();
       filterConstraints.push(where('status', 'in', [statusValue, statusValueLower]));
    }

    if (filters.category) {
      if (filters.category === 'property') {
        filterConstraints.push(where('category', 'in', ['property', 'land']));
      } else {
        filterConstraints.push(where('category', '==', filters.category));
      }
    }

    if (filters.listingType) {
      filterConstraints.push(where('listingType', '==', filters.listingType));
    }
    
    if (filters.subcategory && filters.subcategory !== 'All') {
      filterConstraints.push(where('subcategory', '==', filters.subcategory.trim().toLowerCase()));
    }

    if (filters.currency && filters.currency !== 'All') {
      filterConstraints.push(where('currency', '==', filters.currency));
    }

    if (filters.city && filters.city !== 'All') {
      const cityOptions = getCityQueryVariations(filters.city);
      const uniqueCities = Array.from(new Set(cityOptions)).slice(0, 3);
      filterConstraints.push(where('city', 'in', uniqueCities));
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
      queryConstraints.push(...filterConstraints);
    }

    try {
      const q = query(listingsRef, ...queryConstraints);
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error('Error getting count from server:', error);
      return 0;
    }
  },

  async getListingById(id: string): Promise<Listing | null> {
    const cacheKey = `listing_by_id_${id}`;
    const cached = listingCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return cached.data;
    }

    const listingRef = doc(db, 'listings', id);
    try {
      const snapshot = await getDoc(listingRef);
      if (snapshot.exists()) {
        const listing = this.normalizeListing(snapshot.data(), snapshot.id);
        listingCache.set(cacheKey, { data: listing, timestamp: Date.now() });
        return listing;
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

    // Normalize city, region, and country to store canonical values
    const normCityName = normalizeCityName(data.city);
    const matchedCity = CITIES_DATA.find(c => c.dbValue === normCityName);
    
    const cleanCity = matchedCity ? matchedCity.dbValue : (data.city || '');
    const cleanRegion = matchedCity ? matchedCity.region : (data.region || '');
    const cleanCountry = matchedCity ? matchedCity.country : (data.country || 'Somalia');

    const newListing = {
      ...data,
      city: cleanCity,
      region: cleanRegion,
      country: cleanCountry,
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
      clearListingCaches();
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

    // Normalize city, region, and country to store canonical values
    const normCityName = normalizeCityName(data.city);
    const matchedCity = CITIES_DATA.find(c => c.dbValue === normCityName);
    
    const cleanCity = matchedCity ? matchedCity.dbValue : (data.city || '');
    const cleanRegion = matchedCity ? matchedCity.region : (data.region || '');
    const cleanCountry = matchedCity ? matchedCity.country : (data.country || 'Somalia');

    const newListing = {
      ...data,
      city: cleanCity,
      region: cleanRegion,
      country: cleanCountry,
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
      clearListingCaches();
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
    
    if (data.city) {
      const normCityName = normalizeCityName(data.city);
      const matchedCity = CITIES_DATA.find(c => c.dbValue === normCityName);
      if (matchedCity) {
        cleanData.city = matchedCity.dbValue;
        cleanData.region = matchedCity.region;
        cleanData.country = matchedCity.country;
      }
    }
    
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
      clearListingCaches();
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
      if (category === 'property') {
        constraints.push(where('category', 'in', ['property', 'land']));
      } else {
        constraints.push(where('category', '==', category));
      }
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
      clearListingCaches();
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `listings/${id}`);
      return false;
    }
  },

  async getCityListingCounts(): Promise<Record<string, number>> {
    const results: Record<string, number> = {};
    try {
      const promises = CITIES_DATA.map(async (city) => {
        const vars = getCityQueryVariations(city.dbValue);
        const ref = collection(db, 'listings');
        // Search city with up to 3 key variants to stay within Firestore disjunction limits (Product of query filters <= 30)
        const uniqueCities = Array.from(new Set(vars.slice(0, 3)));
        const constraints: any[] = [
          where('status', 'in', ['ACTIVE', 'active', 'VERIFIED', 'verified']),
          where('category', 'in', ['property', 'land']),
          where('city', 'in', uniqueCities)
        ];
        const q = query(ref, ...constraints);
        const snap = await getCountFromServer(q);
        results[city.dbValue.toLowerCase()] = snap.data().count;
      });
      await Promise.all(promises);
    } catch (error) {
      console.error('[listingService] Error fetching city listing counts:', error);
    }
    return results;
  }
};
