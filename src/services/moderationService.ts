import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy, 
  limit, 
  serverTimestamp,
  getCountFromServer,
  writeBatch,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { 
  Listing, 
  Article, 
  UserProfile, 
  ListingStatus, 
  ListingCategory,
  ProfessionalService
} from '../types';
import { handleFirestoreError, OperationType } from '../lib/utils';

export interface ModerationStats {
  pendingListings: number;
  pendingProfessionals: number;
  totalVerifiedProfessionals: number;
  totalListings: number;
  totalArticles: number;
  totalInquiries: number;
}

export type ApplicationStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'suspended';

export const moderationService = {
  /**
   * Fetch global moderation stats for dashboard analytics
   */
  async getModerationStats(): Promise<ModerationStats> {
    try {
      const listingsRef = collection(db, 'listings');
      const proAppsRef = collection(db, 'professionalApplications');
      const usersRef = collection(db, 'users');
      const articlesRef = collection(db, 'articles');
      const inquiriesRef = collection(db, 'contactMessages');

      const [
        pendingListingsCount,
        pendingProsCount,
        verifiedProsCount,
        totalListingsCount,
        totalArticlesCount,
        totalInquiriesCount
      ] = await Promise.all([
        getCountFromServer(query(listingsRef, where('status', '==', 'pending'))),
        getCountFromServer(query(proAppsRef, where('status', '==', 'pending_review'))),
        getCountFromServer(query(usersRef, where('role', '==', 'verified_professional'))),
        getCountFromServer(listingsRef),
        getCountFromServer(articlesRef),
        getCountFromServer(inquiriesRef)
      ]);

      return {
        pendingListings: pendingListingsCount.data().count,
        pendingProfessionals: pendingProsCount.data().count,
        totalVerifiedProfessionals: verifiedProsCount.data().count,
        totalListings: totalListingsCount.data().count,
        totalArticles: totalArticlesCount.data().count,
        totalInquiries: totalInquiriesCount.data().count
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'moderation/stats');
      return {
        pendingListings: 0,
        pendingProfessionals: 0,
        totalVerifiedProfessionals: 0,
        totalListings: 0,
        totalArticles: 0,
        totalInquiries: 0
      };
    }
  },

  /**
   * Fetch listings pending approval
   */
  async getPendingListings(category?: ListingCategory, status: ListingStatus = 'pending') {
    const listingsRef = collection(db, 'listings');
    const constraints = [where('status', '==', status)];
    
    if (category) {
      constraints.push(where('category', '==', category));
    }

    try {
      const q = query(listingsRef, ...constraints);
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) as Listing[];
      
      // Client-side sort to bypass index requirements
      return docs.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'listings/pending');
      // If the query failed, try an even simpler fallback
      try {
        const snapshot = await getDocs(listingsRef);
        return snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() as any }))
          .filter(l => l.status === status) as Listing[];
      } catch (e) {
        return [];
      }
    }
  },

  /**
   * Approve a listing
   */
  async approveListing(id: string) {
    const listingRef = doc(db, 'listings', id);
    try {
      await updateDoc(listingRef, {
        status: 'active',
        isVisible: true,
        isVerified: true,
        verificationStatus: 'verified',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `listings/${id}`);
      return false;
    }
  },

  /**
   * Reject a listing
   */
  async rejectListing(id: string) {
    const listingRef = doc(db, 'listings', id);
    try {
      await updateDoc(listingRef, {
        status: 'rejected',
        isVisible: false,
        verificationStatus: 'rejected',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `listings/${id}`);
      return false;
    }
  },

  /**
   * Toggle featured status for a listing
   */
  async toggleFeatureListing(id: string, isFeatured: boolean) {
    const listingRef = doc(db, 'listings', id);
    try {
      await updateDoc(listingRef, {
        isFeatured,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `listings/${id}`);
      return false;
    }
  },

  /**
   * Suspend a listing or professional
   */
  async suspendItem(collectionName: string, id: string) {
    const docRef = doc(db, collectionName, id);
    try {
      await updateDoc(docRef, {
        status: 'suspended',
        isVisible: false,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
      return false;
    }
  },

  /**
   * Delete any document across collections
   */
  async deleteDocument(collectionName: string, id: string) {
    const docRef = doc(db, collectionName, id);
    try {
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
      return false;
    }
  },

  /**
   * Approve professional application and create service document
   */
  async approveProfessional(applicationId: string, userId: string, proData: any) {
    const batch = writeBatch(db);
    
    // 1. Update application status
    const appRef = doc(db, 'professionalApplications', applicationId);
    batch.update(appRef, { 
      status: 'approved', 
      updatedAt: serverTimestamp() 
    });

    // 2. Update user role
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, { 
      role: 'verified_professional', 
      isVerified: true 
    });

    // 3. Create/Update professional service
    const serviceId = `pro-${userId}`;
    const serviceRef = doc(db, 'professionalServices', serviceId);
    
    const serviceData: Omit<ProfessionalService, 'id'> = {
      title: proData.personalInfo.title,
      description: proData.professionalDetails.bio,
      category: proData.professionalDetails.category,
      city: proData.personalInfo.city,
      providerId: userId,
      status: 'active',
      createdAt: serverTimestamp()
    };
    
    batch.set(serviceRef, serviceData, { merge: true });

    try {
      await batch.commit();
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'moderation/approve-pro');
      return false;
    }
  },

  /**
   * Reject professional application
   */
  async rejectProfessional(applicationId: string) {
    const appRef = doc(db, 'professionalApplications', applicationId);
    try {
      await updateDoc(appRef, { 
        status: 'rejected', 
        updatedAt: serverTimestamp() 
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `professionalApplications/${applicationId}`);
      return false;
    }
  },

  /**
   * Get professional applications
   */
  async getProfessionalApplications(status: ApplicationStatus = 'pending') {
    const appsRef = collection(db, 'professionalApplications');
    const statusToQuery = status === 'pending' ? 'pending_review' : status;
    
    try {
      const q = query(appsRef, where('status', '==', statusToQuery));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      // Client-side sort
      return docs.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
    } catch (error) {
       handleFirestoreError(error, OperationType.LIST, 'professionalApplications');
       try {
         const snapshot = await getDocs(appsRef);
         return snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() as any }))
          .filter(a => a.status === statusToQuery);
       } catch (e) {
         return [];
       }
    }
  },

  /**
   * Moderation for articles
   */
  async getAllArticles(publishedOnly?: boolean) {
    const articlesRef = collection(db, 'articles');
    
    try {
      let q;
      if (publishedOnly !== undefined) {
        q = query(articlesRef, where('published', '==', publishedOnly));
      } else {
        q = query(articlesRef);
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) as Article[];
      
      return docs.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'articles');
      try {
        const fallbackSnapshot = await getDocs(articlesRef);
        let docs = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) as Article[];
        if (publishedOnly !== undefined) {
          docs = docs.filter(a => a.published === publishedOnly);
        }
        return docs;
      } catch (e) {
        return [];
      }
    }
  },

  /**
   * Moderation for inquiries / contact messages
   */
  async getContactMessages() {
    const messagesRef = collection(db, 'contactMessages');
    
    try {
      const snapshot = await getDocs(messagesRef);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      return docs.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      }).slice(0, 100);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'contactMessages');
      return [];
    }
  }
};
