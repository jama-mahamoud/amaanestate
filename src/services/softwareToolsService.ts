import { db } from '@/lib/firebase';
import { cacheStore } from './cacheStore';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp,
  limit
} from 'firebase/firestore';

export interface SoftwareTool {
  id: string; // Document ID / Slug
  name: string;
  developer: string;
  category: string;
  platform: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  pros: string[];
  cons: string[];
  pricing: string;
  officialWebsite: string;
  affiliateUrl: string;
  logoUrl: string;
  featuredImage: string;
  galleryImages: string[];
  seoTitle: string;
  seoDescription: string;
  slug: string;
  status: 'published' | 'draft' | 'archived';
  featured: boolean;
  createdAt?: any;
  updatedAt?: any;
  
  // Premium Affiliate CMS Fields
  affiliateCommissionType?: string;
  affiliateNetwork?: string;
  commissionRate?: string;
  cookieDuration?: string;
  pricingTier?: string;
  freeTrialAvailable?: string;
  bestFor?: string;
  alternativeProducts?: string[];
}

const SOFTWARE_TOOLS_COLLECTION = 'software_tools';

let cachedPublishedSoftware: SoftwareTool[] | null = null;
let cachedAllSoftware: SoftwareTool[] | null = null;
let lastSoftwareFetchTime = 0;
const SOFTWARE_CACHE_TTL = 30000; // 30 seconds

export function clearSoftwareCache() {
  cachedPublishedSoftware = null;
  cachedAllSoftware = null;
  lastSoftwareFetchTime = 0;
  cacheStore.delete('unified_products');
}

export const softwareToolsService = {
  async getAllSoftware(publishedOnly = false, limitCount?: number): Promise<SoftwareTool[]> {
    const now = Date.now();
    if (!limitCount) {
      if (publishedOnly && cachedPublishedSoftware && (now - lastSoftwareFetchTime < SOFTWARE_CACHE_TTL)) {
        return cachedPublishedSoftware;
      }
      if (!publishedOnly && cachedAllSoftware && (now - lastSoftwareFetchTime < SOFTWARE_CACHE_TTL)) {
        return cachedAllSoftware;
      }
    }

    try {
      let q = publishedOnly
        ? query(collection(db, SOFTWARE_TOOLS_COLLECTION), where('status', '==', 'published'))
        : query(collection(db, SOFTWARE_TOOLS_COLLECTION));
        
      if (limitCount && limitCount > 0) {
        q = query(q, limit(limitCount));
      }

      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SoftwareTool));
      // Sort by status, then created date assuming we want to see drafts first usually, or just by created
      list.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA; // newest first
      });

      if (!limitCount) {
        lastSoftwareFetchTime = now;
        if (publishedOnly) {
          cachedPublishedSoftware = list;
        } else {
          cachedAllSoftware = list;
        }
      }
      return list;
    } catch (error) {
      console.error('Error fetching software tools:', error);
      return [];
    }
  },

  async getSoftwareById(id: string): Promise<SoftwareTool | null> {
    try {
      const docSnap = await getDoc(doc(db, SOFTWARE_TOOLS_COLLECTION, id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as SoftwareTool;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching software tool ${id}:`, error);
      return null;
    }
  },

  async createSoftware(data: Omit<SoftwareTool, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    clearSoftwareCache();
    try {
      const newRef = doc(collection(db, SOFTWARE_TOOLS_COLLECTION));
      const newSoftware = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(newRef, newSoftware);
      return newRef.id;
    } catch (error) {
      console.error('Error creating software tool:', error);
      throw error;
    }
  },

  async updateSoftware(id: string, data: Partial<SoftwareTool>): Promise<void> {
    clearSoftwareCache();
    try {
      const docRef = doc(db, SOFTWARE_TOOLS_COLLECTION, id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error(`Error updating software tool ${id}:`, error);
      throw error;
    }
  },

  async deleteSoftware(id: string): Promise<void> {
    clearSoftwareCache();
    try {
      await deleteDoc(doc(db, SOFTWARE_TOOLS_COLLECTION, id));
    } catch (error) {
      console.error(`Error deleting software tool ${id}:`, error);
      throw error;
    }
  }
};
