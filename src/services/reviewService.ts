import { auth, db } from '@/lib/firebase';
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
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

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
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // Keep the original console.warn for user visibility
}

export interface CTAButton {
  text: string;
  url: string;
  style: 'solid-gold' | 'outline-gold' | 'minimal-border' | 'solid-emerald' | 'solid-blue';
  clicks?: number;
}

export interface Banner {
  enabled: boolean;
  imageUrl: string;
  destinationUrl: string;
  altText?: string;
  clicks?: number;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  caption?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ComparisonRow {
  featureName: string;
  thisBrandValue: string;
  competitorBrandValue: string;
}

export interface ComparisonTable {
  enabled: boolean;
  competitorName: string;
  rows: ComparisonRow[];
}

export interface EditorialReview {
  id: string; // doc ID (usually the slug)
  title: string;
  slug: string;
  category: 'real-estate' | 'finance' | 'tech' | 'learning' | 'market';
  featuredImage: string;
  excerpt: string;
  
  // Editorial Article Content fields to make a beautiful structured layout 
  introduction: string;
  whatIsIt: string;
  keyFeatures: string[];
  pros: string[];
  cons: string[];
  bestFor: string;
  pricingOverview?: string;
  finalVerdict: string;
  
  // Custom Metadata
  rating: number; // 1.0 to 5.0
  readingTime: string; // e.g., "5 min read"
  publishDate: string; // e.g., "June 15, 2026"
  brandName: string;
  brandLogoLetter: string; // Initials or design
  
  // Affiliate Outboard system fields
  affiliateUrl: string;
  ctaSummary: string;
  ctaButtonText?: string;
  ctaButtonStyle?: 'solid-gold' | 'outline-gold' | 'minimal-border' | 'solid-emerald';
  externalLink?: boolean;
  sponsoredDisclosure?: boolean;
  
  // Enrichment fields for professional affiliate publisher platform
  ctaButtons?: CTAButton[];
  topBanner?: Banner;
  inlineBanner?: Banner;
  bottomBanner?: Banner;
  gallery?: GalleryItem[];
  faqs?: FAQItem[];
  comparisonTable?: ComparisonTable;
  reviewerName?: string;
  reviewerAvatar?: string;
  reviewMethodology?: string;
  lastUpdatedDate?: string;
  relatedReviewIds?: string[];
  enableGlobalDisclosure?: boolean;
  customDisclosureText?: string;
  enableStickyCta?: boolean;
  stickyCtaButtonIndex?: number;
  bannerClicks?: {
    top?: number;
    inline?: number;
    bottom?: number;
  };

  // SEO variables
  seoTitle: string;
  metaDescription: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;

  // Moderation Status Workflow:
  // 'draft' | 'pending' | 'approved' | 'rejected' | 'archived'
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';
  
  // Future Affiliate Analytics Foundation Architecture
  views?: number;
  clicks?: number;
  ctr?: number;
  revenueNotes?: string;
  lastUpdatedTimestamp?: string;

  createdAt?: any;
  updatedAt?: any;
}


const REVIEWS_COLLECTION = 'editorial_reviews';


// Local storage backup key for seamless offline & reliable sandbox builds
const LOCAL_STORAGE_KEY = 'amaan_editorial_reviews_v2';

export const reviewService = {
  // Save backup to LocalStorage
  saveToLocalBackup(reviews: EditorialReview[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
    } catch (e) {
      console.error('Failed to save reviews backup locally', e);
    }
  },

  // Get backup from LocalStorage
  getLocalBackup(): EditorialReview[] {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse local reviews backup', e);
      return [];
    }
  },

  // Ensure unique slug
  async ensureUniqueSlug(title: string, currentId?: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    if (!baseSlug) return 'review-' + Math.random().toString(36).substring(2, 7);
    
    let uniqueSlug = baseSlug;
    let counter = 1;
    let duplicate = true;
    
    const all = await this.getAllReviews(false);
    while (duplicate) {
      const matched = all.find(r => r.slug === uniqueSlug);
      if (matched && matched.id !== currentId) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      } else {
        duplicate = false;
      }
    }
    return uniqueSlug;
  },

  // Get all reviews (with optional filtering by status)
  async getAllReviews(publishedOnly: boolean = false): Promise<EditorialReview[]> {
    try {
      const snap = await getDocs(collection(db, REVIEWS_COLLECTION));
      console.log('DEBUG: ALL REVIEW DOCS:', snap.docs.map(doc => ({ id: doc.id, title: doc.data().title })));
      let list = snap.docs.map(docSnap => {
        const data = docSnap.data();
        const review = {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toDate() : data.createdAt
        } as EditorialReview;
        
        console.log("Review Status:", review.title, review.status);
        return review;
      });

      console.log('DEBUG: Total reviews in DB:', list.length);
      console.log('DEBUG: Approved reviews in DB:', list.filter(r => r.status === 'approved').length);
      
      list.forEach(r => {
        if (r.status !== 'approved') {
          console.log('DEBUG: Non-approved review found:', r.slug, r.status);
        }
      });


      // Sort by publishDate/createdAt descending
      list.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });

      // Update backup local storage so sync remains golden
      if (list.length > 0) {
        this.saveToLocalBackup(list);
      }

      console.log('DEBUG: STATUS CHECK ALL REVIEWS:');
      list.forEach(r => console.log(`DEBUG: Review ${r.slug} status: ${r.status}`));

      if (publishedOnly) {
        // Only approved content is visible to users
        const filteredList = list.filter(r => r.status === 'approved');
        console.log('DEBUG: Filtered list length:', filteredList.length);
        return filteredList;
      }

      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, REVIEWS_COLLECTION);
      console.warn('Firebase connection unavailable, defaulting to LocalBackup registry:', error);
      let list = this.getLocalBackup();
      if (publishedOnly) {
        return list.filter(r => r.status === 'approved');
      }
      return list;
    }
  },

  // Get single review by slug
  async getReviewBySlug(slug: string): Promise<EditorialReview | null> {
    try {
      const all = await this.getAllReviews(false);
      const matched = all.find(r => r.slug === slug);
      return matched || null;
    } catch (error) {
      console.error('Error fetching review by slug', error);
      const list = this.getLocalBackup();
      return list.find(r => r.slug === slug) || null;
    }
  },

  // Create absolute new review profile
  async createReview(review: Omit<EditorialReview, 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = review.slug; // Slug as unique identifier block
    const newRev: EditorialReview = {
      ...review,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, REVIEWS_COLLECTION, id), newRev);
      
      // Update local cache
      const local = this.getLocalBackup().filter(r => r.id !== id);
      this.saveToLocalBackup([newRev, ...local]);
      return id;
    } catch (error) {
      console.error('Failed to write review in Firestore, saving to local backup:', error);
      const local = this.getLocalBackup().filter(r => r.id !== id);
      this.saveToLocalBackup([newRev, ...local]);
      return id;
    }
  },

  // Save/Overwrite existing review profile
  async updateReview(id: string, review: Partial<EditorialReview>): Promise<void> {
    const updateData = {
      ...review,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, REVIEWS_COLLECTION, id), updateData, { merge: true });
      
      // Sync local cache
      const local = this.getLocalBackup();
      const updated = local.map(r => r.id === id ? { ...r, ...updateData } : r);
      this.saveToLocalBackup(updated);
    } catch (error) {
      console.error('Failed to update review in Firestore, syncing locally:', error);
      const local = this.getLocalBackup();
      const updated = local.map(r => r.id === id ? { ...r, ...updateData } : r);
      this.saveToLocalBackup(updated);
    }
  },

  // Update moderation workflow status directly
  async updateStatus(id: string, status: EditorialReview['status']): Promise<void> {
    return this.updateReview(id, { status });
  },

  // Completely delete review
  async deleteReview(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, REVIEWS_COLLECTION, id));
      
      // Update cache
      const remaining = this.getLocalBackup().filter(r => r.id !== id);
      this.saveToLocalBackup(remaining);
    } catch (error) {
      console.error('Failed to delete review from Firestore, updating local backup:', error);
      const remaining = this.getLocalBackup().filter(r => r.id !== id);
      this.saveToLocalBackup(remaining);
    }
  },

  // Record dynamic review view (increases views, updates ctr)
  async recordReviewView(id: string): Promise<void> {
    try {
      const docRef = doc(db, REVIEWS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as EditorialReview;
        const currentViews = (data.views || 0) + 1;
        const currentClicks = data.clicks || 0;
        const ctr = currentViews > 0 ? Number(((currentClicks / currentViews) * 100).toFixed(2)) : 0;
        
        await setDoc(docRef, { views: currentViews, ctr }, { merge: true });
        
        // Sync local cache
        const local = this.getLocalBackup();
        const updated = local.map(r => r.id === id ? { ...r, views: currentViews, ctr } : r);
        this.saveToLocalBackup(updated);
      }
    } catch (e) {
      console.error('Failed to record review view analytics:', e);
    }
  },

  // Record CTA click by index (increases cta button click and general click)
  async recordCtaClick(id: string, buttonIndex?: number): Promise<void> {
    try {
      const docRef = doc(db, REVIEWS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as EditorialReview;
        const currentClicks = (data.clicks || 0) + 1;
        const currentViews = data.views || 1;
        const ctr = currentViews > 0 ? Number(((currentClicks / currentViews) * 100).toFixed(2)) : 0;
        
        const updateData: Partial<EditorialReview> = { clicks: currentClicks, ctr };
        
        if (buttonIndex !== undefined && data.ctaButtons) {
          const updatedButtons = [...data.ctaButtons];
          if (updatedButtons[buttonIndex]) {
            updatedButtons[buttonIndex] = {
              ...updatedButtons[buttonIndex],
              clicks: (updatedButtons[buttonIndex].clicks || 0) + 1
            };
            updateData.ctaButtons = updatedButtons;
          }
        }
        
        await setDoc(docRef, updateData, { merge: true });
        
        // Sync local cache
        const local = this.getLocalBackup();
        const updated = local.map(r => r.id === id ? { ...r, ...updateData } : r);
        this.saveToLocalBackup(updated);
      }
    } catch (e) {
      console.error('Failed to record CTA click analytics:', e);
    }
  },

  // Record Banner Click (increases specific banner clicks count)
  async recordBannerClick(id: string, position: 'top' | 'inline' | 'bottom'): Promise<void> {
    try {
      const docRef = doc(db, REVIEWS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as EditorialReview;
        const bannerClicks = data.bannerClicks || {};
        const count = (bannerClicks[position] || 0) + 1;
        const updatedClicks = {
          ...bannerClicks,
          [position]: count
        };
        
        const currentClicks = (data.clicks || 0) + 1;
        const currentViews = data.views || 1;
        const ctr = currentViews > 0 ? Number(((currentClicks / currentViews) * 100).toFixed(2)) : 0;

        const updateData: Partial<EditorialReview> = {
          bannerClicks: updatedClicks,
          clicks: currentClicks,
          ctr
        };
        
        if (position === 'top' && data.topBanner) {
          updateData.topBanner = { ...data.topBanner, clicks: (data.topBanner.clicks || 0) + 1 };
        } else if (position === 'inline' && data.inlineBanner) {
          updateData.inlineBanner = { ...data.inlineBanner, clicks: (data.inlineBanner.clicks || 0) + 1 };
        } else if (position === 'bottom' && data.bottomBanner) {
          updateData.bottomBanner = { ...data.bottomBanner, clicks: (data.bottomBanner.clicks || 0) + 1 };
        }

        await setDoc(docRef, updateData, { merge: true });
        
        // Sync local cache
        const local = this.getLocalBackup();
        const updated = local.map(r => r.id === id ? { ...r, ...updateData } : r);
        this.saveToLocalBackup(updated);
      }
    } catch (e) {
      console.error('Failed to record Banner click analytics:', e);
    }
  }
};
