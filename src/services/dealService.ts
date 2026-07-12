import { db } from '@/lib/firebase';
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
  serverTimestamp
} from 'firebase/firestore';
import { techGearService, TechGearProduct } from './techGearService';

export interface TechGearDeal {
  id: string; // Document ID
  productId: string; // References TechGearProduct ID
  dealTitle: string; // Promotional headline
  dealDescription: string;
  discountPercentage?: number;
  discountAmount?: number;
  dealPrice: number; // Promo Price active
  promoCode?: string;
  affiliateUrl: string; // Deal absolute referral url
  status: 'approved' | 'draft' | 'archived' | 'published';
  badge?: string; // e.g. "HOT DEAL", "LIMITED-TIME", "20% OFF"
  createdAt?: any;
  updatedAt?: any;
  // Live Deals CMS Standalone Fields
  productName?: string;
  featuredImage?: string;
  category?: string;
  dealType?: string;
  originalPrice?: number;
  finalPrice?: number;
  affiliateLink?: string;
  publishDate?: string;
  publishedAt?: any;
}

// Full resolved structure for consumption on the Deals page
export interface ResolvedTechGearDeal extends TechGearDeal {
  product: TechGearProduct | null;
}

const DEALS_COLLECTION = 'deals_and_offers';
const LOCAL_STORAGE_KEY = 'amaan_tech_gear_deals_v1';

export const INITIAL_TECH_GEAR_DEALS: TechGearDeal[] = [];

export const dealService = {
  saveToLocalBackup(deals: TechGearDeal[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(deals));
    } catch (e) {
      console.error('Failed to save tech gear deals backup locally', e);
    }
  },

  getLocalBackup(): TechGearDeal[] {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse local tech gear deals backup', e);
      return [];
    }
  },

  async getAllDeals(approvedOnly = false): Promise<TechGearDeal[]> {
    try {
      const snap = await getDocs(collection(db, DEALS_COLLECTION));
      let list = snap.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toDate() : data.updatedAt,
        } as TechGearDeal;
      });

      if (approvedOnly) {
        const allowedStatuses = ['approved', 'active', 'published'];
        list = list.filter(deal => allowedStatuses.includes(deal.status));
      }

      // No demo or static fallback, purely live database! Any hardcoded exclusions are completely removed.
      return list;
    } catch (e) {
      console.error('Failed to fetch tech gear deals from Firestore:', e);
      return [];
    }
  },

  async getResolvedDeals(approvedOnly = false): Promise<ResolvedTechGearDeal[]> {
    const deals = await this.getAllDeals(approvedOnly);
    const products = await techGearService.getAllProducts(false); // Fetch all products for resolution

    const resolved: ResolvedTechGearDeal[] = [];

    const allowedProductStatuses = ['approved', 'active', 'published'];

    for (const deal of deals) {
      const product = products.find(p => p.id === deal.productId && allowedProductStatuses.includes(p.status)) || null;
      if (product) {
        resolved.push({
          ...deal,
          product
        });
      } else {
        // Standalone deal with its own fields
        const dealTitle = deal.dealTitle || deal.productName || "Exclusive Deal";
        const featuredImg = deal.featuredImage || "/house_luxury_icon.png";
        const cat = deal.category || "General";
        const originalPriceVal = typeof deal.originalPrice === 'number' ? deal.originalPrice : typeof deal.dealPrice === 'number' ? deal.dealPrice : 0;

        resolved.push({
          ...deal,
          product: {
            id: deal.productId || deal.id,
            title: dealTitle,
            featuredImage: featuredImg,
            brandName: deal.brandName || cat || "Premium Partner",
            price: originalPriceVal,
            status: "published",
            colors: [],
            specs: [],
            galleryImages: [],
            description: deal.dealDescription || ""
          } as any
        });
      }
    }

    // Sort by: publishedAt DESC
    resolved.sort((a, b) => {
      const getVal = (x: any) => {
        if (!x) return 0;
        if (x.publishedAt) {
          const parsed = new Date(x.publishedAt);
          if (!isNaN(parsed.getTime())) return parsed.getTime();
        }
        if (x.createdAt) {
          const parsed = new Date(x.createdAt);
          if (!isNaN(parsed.getTime())) return parsed.getTime();
        }
        return 0;
      };
      return getVal(b) - getVal(a);
    });

    return resolved;
  },

  async getDeals(approvedOnly = false): Promise<ResolvedTechGearDeal[]> {
    try {
      const url = approvedOnly ? '/api/deals?status=approved' : '/api/deals';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Endpoint returned status ${response.status}`);
      }
      const rawData = await response.json();
      if (!Array.isArray(rawData)) {
        throw new Error('API response is not a valid array');
      }

      // Consistent schema mapping and structural validation hook
      const validated: ResolvedTechGearDeal[] = rawData.map((item: any) => {
        if (!item || typeof item !== 'object') return null;
        if (typeof item.id !== 'string') return null;
        
        // Ensure robust unification of nested child product object fields
        const product = item.product;
        const validProduct = (product && typeof product === 'object' && typeof product.id === 'string' && typeof product.title === 'string') 
          ? product 
          : null;

        return {
          id: item.id,
          productId: item.productId || '',
          dealTitle: item.dealTitle || item.title || item.productName || "Exclusive Deal",
          dealDescription: item.dealDescription || item.description || '',
          discountPercentage: typeof item.discountPercentage === 'number' ? item.discountPercentage : undefined,
          discountAmount: typeof item.discountAmount === 'number' ? item.discountAmount : undefined,
          dealPrice: typeof item.dealPrice === 'number' ? item.dealPrice : typeof item.finalPrice === 'number' ? item.finalPrice : typeof item.price === 'number' ? item.price : 0,
          promoCode: item.promoCode || undefined,
          affiliateUrl: item.affiliateUrl || item.affiliateLink || item.link || '',
          status: item.status || 'published',
          badge: item.badge || undefined,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          productName: item.productName || undefined,
          featuredImage: item.featuredImage || item.image || undefined,
          category: item.category || undefined,
          dealType: item.dealType || undefined,
          originalPrice: typeof item.originalPrice === 'number' ? item.originalPrice : undefined,
          finalPrice: typeof item.finalPrice === 'number' ? item.finalPrice : undefined,
          affiliateLink: item.affiliateLink || item.affiliateUrl || item.link || undefined,
          publishDate: item.publishDate || undefined,
          publishedAt: item.publishedAt || undefined,
          product: validProduct
        } as ResolvedTechGearDeal;
      }).filter((d): d is ResolvedTechGearDeal => d !== null);

      return validated;
    } catch (e) {
      console.warn('Failed to fetch from express endpoint /api/deals, using client resolver fallback:', e);
      return this.getResolvedDeals(approvedOnly);
    }
  },

  async getDealById(id: string): Promise<TechGearDeal | null> {
    try {
      const docSnap = await getDoc(doc(db, DEALS_COLLECTION, id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toDate() : data.updatedAt,
        } as TechGearDeal;
      }
    } catch (e) {
      console.error(`Failed to get deal ${id} from Firestore:`, e);
    }

    const all = await this.getAllDeals(false);
    return all.find(d => d.id === id) || null;
  },

  async createDeal(deal: Omit<TechGearDeal, 'id'> & { id?: string }): Promise<TechGearDeal> {
    const id = deal.id || 'deal-' + Math.random().toString(36).substring(2, 9);
    const newDeal: TechGearDeal = {
      ...deal,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, DEALS_COLLECTION, id), {
        ...newDeal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error('Failed to create deal in Firestore, continuing locally:', e);
    }

    const all = await this.getAllDeals(false);
    const idx = all.findIndex(d => d.id === id);
    if (idx > -1) {
      all[idx] = newDeal;
    } else {
      all.push(newDeal);
    }
    this.saveToLocalBackup(all);

    return newDeal;
  },

  async updateDeal(id: string, deal: Partial<Omit<TechGearDeal, 'id' | 'createdAt'>>): Promise<TechGearDeal> {
    const existing = await this.getDealById(id);
    if (!existing) throw new Error(`Deal ${id} not found`);

    const updatedDeal: TechGearDeal = {
      ...existing,
      ...deal,
      updatedAt: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, DEALS_COLLECTION, id), {
        ...deal,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error(`Failed to update deal ${id} in Firestore, continuing locally:`, e);
    }

    const all = await this.getAllDeals(false);
    const idx = all.findIndex(d => d.id === id);
    if (idx > -1) {
      all[idx] = updatedDeal;
    } else {
      all.push(updatedDeal);
    }
    this.saveToLocalBackup(all);

    return updatedDeal;
  },

  async deleteDeal(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, DEALS_COLLECTION, id));
    } catch (e) {
      console.error(`Failed to delete deal ${id} from Firestore, continuing locally:`, e);
    }

    const all = await this.getAllDeals(false);
    const filtered = all.filter(d => d.id !== id);
    this.saveToLocalBackup(filtered);
    return true;
  }
};
