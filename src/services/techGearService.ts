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

export interface TechGearProduct {
  id: string; // Document ID
  brandName: string;
  title: string;
  model?: string;
  category: 'smartphones' | 'laptops' | 'wearables' | 'audio-gear' | 'desktop-pcs' | 'accessories' | 'components' | string;
  featuredImage: string;
  galleryImages?: string[];
  description: string;
  price: number; // Regular Base price (MSRP)
  specs: { name: string; value: string }[];
  
  // Specific detailed specs
  battery?: string;
  dimensions?: string;
  weight?: string;
  colors?: string[];
  warranty?: string;
  
  // Affiliate / Links
  affiliateUrl?: string;
  ctaText?: string;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  
  status: 'approved' | 'draft' | 'archived';
  featured?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

const TECH_GEAR_COLLECTION = 'tech_gear_products';
const LOCAL_STORAGE_KEY = 'amaan_tech_gear_products_v1';

// Initial master product presets for Tech Gear
export const INITIAL_TECH_GEAR_PRODUCTS: TechGearProduct[] = [];

let cachedApprovedTechGear: TechGearProduct[] | null = null;
let cachedAllTechGear: TechGearProduct[] | null = null;
let lastTechGearFetchTime = 0;
const TECH_GEAR_CACHE_TTL = 30000; // 30 seconds

export function clearTechGearCache() {
  cachedApprovedTechGear = null;
  cachedAllTechGear = null;
  lastTechGearFetchTime = 0;
  cacheStore.delete('unified_products');
}

export const techGearService = {
  // Local Backup saving/loading for high reliability
  saveToLocalBackup(products: TechGearProduct[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save tech gear products backup locally', e);
    }
  },

  getLocalBackup(): TechGearProduct[] {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse local tech gear products backup', e);
      return [];
    }
  },

  async getAllProducts(approvedOnly = false, limitCount?: number): Promise<TechGearProduct[]> {
    const now = Date.now();
    if (!limitCount) {
      if (approvedOnly && cachedApprovedTechGear && (now - lastTechGearFetchTime < TECH_GEAR_CACHE_TTL)) {
        return cachedApprovedTechGear;
      }
      if (!approvedOnly && cachedAllTechGear && (now - lastTechGearFetchTime < TECH_GEAR_CACHE_TTL)) {
        return cachedAllTechGear;
      }
    }

    try {
      let q = approvedOnly
        ? query(collection(db, TECH_GEAR_COLLECTION), where('status', '==', 'approved'))
        : query(collection(db, TECH_GEAR_COLLECTION));
      
      if (limitCount && limitCount > 0) {
        q = query(q, limit(limitCount));
      }
      
      const snap = await getDocs(q);
      const list = snap.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toDate() : data.updatedAt,
        } as TechGearProduct;
      });

      // Sync to local backup for offline resilience only on full catalog query
      if (!approvedOnly && list.length > 0 && !limitCount) {
        this.saveToLocalBackup(list);
      }

      if (!limitCount) {
        lastTechGearFetchTime = now;
        if (approvedOnly) {
          cachedApprovedTechGear = list;
        } else {
          cachedAllTechGear = list;
        }
      }
      return list;
    } catch (e) {
      console.error('Failed to fetch tech gear products from Firestore:', e);
      // Retrieve fallback from local storage only if it was successfully fetched previously
      const local = this.getLocalBackup();
      return approvedOnly ? local.filter(p => p.status === 'approved') : local;
    }
  },

  async getProductById(id: string): Promise<TechGearProduct | null> {
    try {
      const docSnap = await getDoc(doc(db, TECH_GEAR_COLLECTION, id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toDate() : data.updatedAt,
        } as TechGearProduct;
      }
    } catch (e) {
      console.error(`Failed to get product ${id} from Firestore:`, e);
    }

    // Local fallback search
    const all = await this.getAllProducts(false);
    return all.find(p => p.id === id) || null;
  },

  async createProduct(product: Omit<TechGearProduct, 'id'> & { id?: string }): Promise<TechGearProduct> {
    clearTechGearCache();
    const id = product.id || 'tg-' + Math.random().toString(36).substring(2, 9);
    const newProduct: TechGearProduct = {
      ...product,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, TECH_GEAR_COLLECTION, id), {
        ...newProduct,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error('Failed to create tech gear product in Firestore, saving locally:', e);
    }

    // Sync to local
    const all = await this.getAllProducts(false);
    const existingIndex = all.findIndex(p => p.id === id);
    if (existingIndex > -1) {
      all[existingIndex] = newProduct;
    } else {
      all.push(newProduct);
    }
    this.saveToLocalBackup(all);

    return newProduct;
  },

  async updateProduct(id: string, product: Partial<Omit<TechGearProduct, 'id' | 'createdAt'>>): Promise<TechGearProduct> {
    clearTechGearCache();
    const existing = await this.getProductById(id);
    if (!existing) throw new Error(`Product ${id} not found`);

    const updatedProduct: TechGearProduct = {
      ...existing,
      ...product,
      updatedAt: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, TECH_GEAR_COLLECTION, id), {
        ...product,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error(`Failed to update tech gear product ${id} in Firestore, saving locally:`, e);
    }

    // Sync to local
    const all = await this.getAllProducts(false);
    const idx = all.findIndex(p => p.id === id);
    if (idx > -1) {
      all[idx] = updatedProduct;
    } else {
      all.push(updatedProduct);
    }
    this.saveToLocalBackup(all);

    return updatedProduct;
  },

  async deleteProduct(id: string): Promise<boolean> {
    clearTechGearCache();
    try {
      await deleteDoc(doc(db, TECH_GEAR_COLLECTION, id));
    } catch (e) {
      console.error(`Failed to delete tech gear product ${id} from Firestore, updating locally:`, e);
    }

    // Update local state
    const all = await this.getAllProducts(false);
    const filtered = all.filter(p => p.id !== id);
    this.saveToLocalBackup(filtered);
    return true;
  }
};
