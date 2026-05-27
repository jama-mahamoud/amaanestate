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
  onSnapshot,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { notificationService } from './notificationService';
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
  totalUsers: number;
}

export type ApplicationStatus = 'pending' | 'reviewing' | 'active' | 'rejected' | 'suspended';

export const moderationService = {
  /**
   * Fetch global moderation stats for dashboard analytics
   */
  async getModerationStats(): Promise<ModerationStats> {
    try {
      console.log('Fetching moderation stats...');
      const listingsRef = collection(db, 'listings');
      const proAppsRef = collection(db, 'professionalApplications');
      const usersRef = collection(db, 'users');
      const articlesRef = collection(db, 'articles');
      const inquiriesRef = collection(db, 'contactMessages');

      const [
        pendingListingsCount,
        pendingProsCount,
        activeProsCount,
        totalListingsCount,
        totalArticlesCount,
        totalInquiriesCount,
        totalUsersCount
      ] = await Promise.all([
        getCountFromServer(query(listingsRef, where('status', 'in', ['pending', 'PENDING']))),
        getCountFromServer(query(proAppsRef, where('status', 'in', ['pending', 'pending_review']))),
        getCountFromServer(query(usersRef, where('role', '==', 'verified_professional'))),
        getCountFromServer(listingsRef),
        getCountFromServer(articlesRef),
        getCountFromServer(inquiriesRef),
        getCountFromServer(usersRef)
      ]);

      return {
        pendingListings: pendingListingsCount.data().count,
        pendingProfessionals: pendingProsCount.data().count,
        totalVerifiedProfessionals: activeProsCount.data().count,
        totalListings: totalListingsCount.data().count,
        totalArticles: totalArticlesCount.data().count,
        totalInquiries: totalInquiriesCount.data().count,
        totalUsers: totalUsersCount.data().count
      };
    } catch (error) {
      console.error('Error fetching moderation stats:', error);
      handleFirestoreError(error, OperationType.GET, 'moderation/stats');
      return {
        pendingListings: 0,
        pendingProfessionals: 0,
        totalVerifiedProfessionals: 0,
        totalListings: 0,
        totalArticles: 0,
        totalInquiries: 0,
        totalUsers: 0
      };
    }
  },

  /**
   * Real-time stats subscription
   */
  subscribeToStats(callback: (stats: ModerationStats) => void) {
    const listingsRef = collection(db, 'listings');
    const proAppsRef = collection(db, 'professionalApplications');
    
    // For stats, we'll use a listener on the collections and re-fetch counts
    // This is more efficient than listening to every doc for simple counts
    const unsubListings = onSnapshot(listingsRef, () => this.getModerationStats().then(callback).catch(err => console.error("Error in moderation stats:", err)));
    const unsubProApps = onSnapshot(proAppsRef, () => this.getModerationStats().then(callback).catch(err => console.error("Error in moderation stats:", err)));
    
    return () => {
      unsubListings();
      unsubProApps();
    };
  },

  /**
   * Real-time subscription for listings
   */
  subscribeToListings(callback: (listings: Listing[]) => void, status: ListingStatus = 'PENDING', category?: ListingCategory) {
    const listingsRef = collection(db, 'listings');
    let constraints: any[] = [where('status', '==', status)];
    
    if (category) {
      constraints.push(where('category', '==', category));
    }

    const q = query(listingsRef, ...constraints);
    
    return onSnapshot(q, (snapshot) => {
      const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) as Listing[];
      listings.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      callback(listings);
    }, (error) => {
      console.error('Listings subscription error:', error);
      callback([]);
    });
  },

  /**
   * Fetch listings pending approval
   */
  async getPendingListings(category?: ListingCategory, status: ListingStatus = 'PENDING') {
    const listingsRef = collection(db, 'listings');
    const constraints = [where('status', '==', status)];
    
    if (category) {
      constraints.push(where('category', '==', category));
    }

    try {
      console.log(`Querying listings with status: ${status}...`);
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
      console.error(`Error querying listings with status ${status}:`, error);
      handleFirestoreError(error, OperationType.LIST, 'listings/pending');
      // If the query failed, try an even simpler fallback
      try {
        console.warn('Falling back to local filter for listings...');
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
   * Approve a listing (sets status to VERIFIED/Approved)
   */
  async approveListing(id: string) {
    return this.updateListingStatus(id, 'VERIFIED', 'Listing verified and approved by moderation center.');
  },

  /**
   * Reject a listing
   */
  async rejectListing(id: string) {
    return this.updateListingStatus(id, 'REJECTED', 'Listing rejected for failed verification criteria.');
  },

  /**
   * Universal function to update listing status with notifications and admin audit trails
   */
  async updateListingStatus(id: string, newStatus: string, comment?: string) {
    const listingRef = doc(db, 'listings', id);
    try {
      console.log(`Setting listing ${id} status to ${newStatus}...`);
      
      const updatePayload: any = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };

      // Set helper flags for visibility based on status
      const isPublic = newStatus === 'ACTIVE' || newStatus === 'VERIFIED';
      updatePayload.visibility = isPublic ? 'public' : 'private';
      updatePayload.isVisible = isPublic;
      
      if (newStatus === 'VERIFIED') {
        updatePayload.isVerified = true;
        updatePayload.verificationStatus = 'VERIFIED';
      } else if (newStatus === 'REJECTED') {
        updatePayload.isVerified = false;
        updatePayload.verificationStatus = 'REJECTED';
      }

      await updateDoc(listingRef, updatePayload);
      await this.logAdminAction('LISTING_STATUS_CHANGE', id, `Updated state to ${newStatus}. ${comment || ''}`);

      try {
        const listingSnap = await getDoc(listingRef);
        if (listingSnap.exists()) {
          const listingData = listingSnap.data();
          const ownerId = listingData.ownerId;
          const title = listingData.title || 'Property listing';
          if (ownerId) {
            let titleText = 'Listing Status Updated';
            let detailText = `Your property listing "${title}" has been updated to ${newStatus}.`;
            
            if (newStatus === 'VERIFIED') {
              titleText = 'Listing Approved Successfully';
              detailText = `Congratulations! Your property listing "${title}" has been approved by moderators and is certified.`;
            } else if (newStatus === 'REJECTED') {
              titleText = 'Listing Revisions Requested';
              detailText = `Your property listing "${title}" was rejected. Please update details according to guidelines.`;
            } else if (newStatus === 'ACTIVE') {
              titleText = 'Listing Activated';
              detailText = `Your property listing "${title}" is now active and publicly live.`;
            } else if (newStatus === 'SUSPENDED') {
              titleText = 'Listing Suspended';
              detailText = `Your property listing "${title}" has been suspended.`;
            } else if (newStatus === 'DELETED') {
              titleText = 'Listing Deleted';
              detailText = `Your property listing "${title}" has been soft deleted.`;
            } else if (newStatus === 'ARCHIVED') {
              titleText = 'Listing Archived';
              detailText = `Your property listing "${title}" has been archived.`;
            }

            await notificationService.createNotification(
              ownerId,
              titleText,
              detailText,
              'PROPERTY'
            );
          }
        }
      } catch (notifyErr) {
        console.error('Error triggering status updated notification:', notifyErr);
      }

      return true;
    } catch (error) {
      console.error(`Error updating status for listing ${id} to ${newStatus}:`, error);
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
      await this.logAdminAction('LISTING_FEATURE_TOGGLE', id, `Updated feature status to: ${isFeatured}`);

      if (isFeatured) {
        try {
          const listingSnap = await getDoc(listingRef);
          if (listingSnap.exists()) {
            const listingData = listingSnap.data();
            const ownerId = listingData.ownerId;
            const title = listingData.title || 'Property listing';
            if (ownerId) {
              await notificationService.createNotification(
                ownerId,
                'Listing Featured Successfully',
                `Your property listing "${title}" is now successfully featured on AmaanEstate!`,
                'PROPERTY'
              );
            }
          }
        } catch (notifyErr) {
          console.error('Error triggering feature listing notification:', notifyErr);
        }
      }

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
      console.log(`Suspending item ${id} in ${collectionName}...`);
      await updateDoc(docRef, {
        status: 'suspended',
        isVisible: false,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error(`Error suspending item ${id}:`, error);
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
      console.log(`Deleting document ${id} from ${collectionName}...`);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
      return false;
    }
  },

  /**
   * Approve professional application and create service document
   */
  async approveProfessional(applicationId: string, userId: string, proData: any) {
    const batch = writeBatch(db);
    
    console.log(`Approving professional application ${applicationId} for user ${userId}...`);

    // 1. Update application status
    const appRef = doc(db, 'professionalApplications', applicationId);
    batch.update(appRef, { 
      status: 'active', // Use active instead of approved for consistency
      updatedAt: serverTimestamp() 
    });

    // 2. Update user role (Safety: Never update logged-in admin role)
    const userRef = doc(db, 'users', userId);
    if (userId !== auth.currentUser?.uid) {
      batch.update(userRef, { 
        role: 'verified_professional', 
        isVerified: true,
        proStatus: 'active'
      });
    }

    // 3. Create/Update professional service
    // This is what queries normally look for (Expert Pros section)
    const serviceId = `pro-${userId}`;
    const serviceRef = doc(db, 'professionalServices', serviceId);
    
    // Safety check for data structure
    const personalInfo = proData.personalInfo || {};
    const proDetails = proData.professionalDetails || {};

    const serviceData: Omit<ProfessionalService, 'id'> = {
      title: personalInfo.title || 'Professional Expert',
      description: proDetails.bio || '',
      category: proDetails.category || 'General',
      city: personalInfo.city || 'Regional',
      providerId: userId,
      providerName: personalInfo.fullName || 'Verified Expert',
      providerImage: personalInfo.profilePhotoUrl || '',
      status: 'active',
      createdAt: serverTimestamp()
    };
    
    batch.set(serviceRef, serviceData, { merge: true });

    try {
      await batch.commit();
      console.log('Professional approval batch committed successfully');
      return true;
    } catch (error) {
      console.error('Error committing professional approval batch:', error);
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
      console.log(`Rejecting professional application ${applicationId}...`);
      await updateDoc(appRef, { 
        status: 'rejected', 
        updatedAt: serverTimestamp() 
      });
      return true;
    } catch (error) {
      console.error(`Error rejecting professional application ${applicationId}:`, error);
      handleFirestoreError(error, OperationType.UPDATE, `professionalApplications/${applicationId}`);
      return false;
    }
  },

  /**
   * Real-time subscription for professional applications
   */
  subscribeToProfessionalApplications(callback: (apps: any[]) => void, status: ApplicationStatus = 'pending') {
    const appsRef = collection(db, 'professionalApplications');
    let statusValues: string[] = [status];
    if (status === 'pending') statusValues = ['pending', 'pending_review'];
    if (status === 'active') statusValues = ['active', 'approved'];

    const q = query(appsRef, where('status', 'in', statusValues));
    
    return onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      apps.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      callback(apps);
    }, (error) => {
      console.error('Pro applications subscription error:', error);
      callback([]);
    });
  },

  /**
   * Get professional applications
   */
  async getProfessionalApplications(status: ApplicationStatus = 'pending') {
    const appsRef = collection(db, 'professionalApplications');
    
    // Handle both 'pending' and 'pending_review' for legacy reasons
    let statusValues: string[] = [status];
    if (status === 'pending') statusValues = ['pending', 'pending_review'];
    if (status === 'active') statusValues = ['active', 'approved'];

    try {
      console.log(`Querying professional applications with status in: ${statusValues}...`);
      const q = query(appsRef, where('status', 'in', statusValues));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      // Client-side sort
      return docs.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
    } catch (error) {
       console.error(`Error querying professional applications with status ${status}:`, error);
       handleFirestoreError(error, OperationType.LIST, 'professionalApplications');
       try {
         console.warn('Falling back to local filter for professional applications...');
         const snapshot = await getDocs(appsRef);
         return snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() as any }))
          .filter(a => statusValues.includes(a.status));
       } catch (e) {
         return [];
       }
    }
  },

  /**
   * Real-time subscription for articles
   */
  subscribeToArticles(callback: (articles: Article[]) => void, publishedOnly?: boolean) {
    const articlesRef = collection(db, 'articles');
    let q = query(articlesRef);
    if (publishedOnly !== undefined) {
      q = query(articlesRef, where('published', '==', publishedOnly));
    }
    
    return onSnapshot(q, (snapshot) => {
      const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) as Article[];
      articles.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      callback(articles);
    }, (error) => {
      console.error('Articles subscription error:', error);
      callback([]);
    });
  },

  /**
   * Moderation for articles
   */
  async getAllArticles(publishedOnly?: boolean) {
    const articlesRef = collection(db, 'articles');
    
    try {
      console.log('Fetching articles for moderation...');
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
      console.error('Error fetching articles:', error);
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
   * Real-time subscription for messages
   */
  subscribeToMessages(callback: (messages: any[]) => void) {
    const messagesRef = collection(db, 'contactMessages');
    
    return onSnapshot(messagesRef, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      messages.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      callback(messages);
    }, (error) => {
      console.error('Messages subscription error:', error);
      callback([]);
    });
  },

  /**
   * Moderation for inquiries / contact messages
   */
  async getContactMessages() {
    const messagesRef = collection(db, 'contactMessages');
    
    try {
      console.log('Fetching contact messages for moderation...');
      const snapshot = await getDocs(messagesRef);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      return docs.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      }).slice(0, 100);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      handleFirestoreError(error, OperationType.LIST, 'contactMessages');
      return [];
    }
  },

  /**
   * Archive/Unarchive a contact message
   */
  async archiveMessage(id: string, archived: boolean) {
    const messageRef = doc(db, 'contactMessages', id);
    try {
      console.log(`${archived ? 'Archiving' : 'Restoring'} message ${id}...`);
      await updateDoc(messageRef, {
        archived,
        updatedAt: serverTimestamp()
      });
      // Log Action
      await this.logAdminAction('INQUIRY_ARCHIVE', id, `Updated archive state to: ${archived}`);
      return true;
    } catch (error) {
      console.error(`Error updating message ${id}:`, error);
      handleFirestoreError(error, OperationType.UPDATE, `contactMessages/${id}`);
      return false;
    }
  },

  /**
   * Log administrative governance actions for immutable audit trails
   */
  async logAdminAction(action: string, targetId: string, details: string) {
    try {
      const email = auth.currentUser?.email || 'System Moderator';
      const uid = auth.currentUser?.uid || 'system';
      const auditRef = doc(collection(db, 'auditLogs'));
      
      await setDoc(auditRef, {
        action,
        targetId,
        details,
        adminUser: email,
        adminUid: uid,
        timestamp: serverTimestamp()
      });
      
      // Also write an active notification
      await this.createSystemNotification(
        'ADMIN_ACTION',
        `Governance Action: ${action}`,
        `Action executed on ID: ${targetId}. Details: ${details}`
      );
      
      return true;
    } catch (e) {
      console.error("Failed to write audit log:", e);
      return false;
    }
  },

  /**
   * Retrieve active audit logs
   */
  async getAuditLogs() {
    try {
      const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(50));
      const s = await getDocs(q);
      return s.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    } catch (e) {
      console.warn("Audit log order-by timestamp might need index, falling back to simple query...");
      try {
        const s = await getDocs(collection(db, 'auditLogs'));
        const list = s.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        return list.reverse().slice(0, 50);
      } catch (err) {
        return [];
      }
    }
  },

  /**
   * Create enterprise-level system system alert notification
   */
  async createSystemNotification(type: string, title: string, message: string) {
    try {
      const notifRef = doc(collection(db, 'adminNotifications'));
      await setDoc(notifRef, {
        type,
        title,
        message,
        read: false,
        createdAt: serverTimestamp()
      });
      return true;
    } catch (e) {
      console.error("Failed to write system notification:", e);
      return false;
    }
  },

  /**
   * Subscribe to Admin governance notifications Real-time
   */
  subscribeToNotifications(callback: (notifications: any[]) => void) {
    const q = query(collection(db, 'adminNotifications'), orderBy('createdAt', 'desc'), limit(15));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      callback(list);
    }, () => {
      // Fallback
      getDocs(collection(db, 'adminNotifications')).then(s => {
        const list = s.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        callback(list.slice(0, 15));
      }).catch(() => callback([]));
    });
  },

  /**
   * Dismiss notification
   */
  async dismissNotification(id: string) {
    try {
      await updateDoc(doc(db, 'adminNotifications', id), { read: true });
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Advanced listing governance logic
   */
  async requestListingChanges(id: string, feedback: string) {
    try {
      const ref = doc(db, 'listings', id);
      await updateDoc(ref, {
        status: 'PENDING',
        verificationStatus: 'REJECTED',
        moderationComment: feedback,
        updatedAt: serverTimestamp()
      });
      await this.logAdminAction('LISTING_REVISION_REQUESTED', id, `Feedback: ${feedback}`);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Assign exclusive agency verified credentials & corporate badge
   */
  async certifyAgency(agencyId: string, registryId: string) {
    try {
      const ref = doc(db, 'agencies', agencyId);
      await updateDoc(ref, {
        status: 'approved',
        registryId: registryId,
        trustBadge: 'Certified Premium Agency',
        verifiedDate: serverTimestamp()
      });
      await this.logAdminAction('AGENCY_OFFICIAL_CERTIFICATION', agencyId, `Assigned Registry ID: ${registryId}`);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Assign broker score & trust rating
   */
  async assignTrustBadge(userId: string, badgeType: string) {
    try {
      const ref = doc(db, 'users', userId);
      await updateDoc(ref, {
        trustBadge: badgeType,
        isVerified: true,
        updatedAt: serverTimestamp()
      });
      await this.logAdminAction('BROKER_TRUST_UPGRADED', userId, `Badge: ${badgeType}`);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Update client inquiry response tracking details
   */
  async updateInquiryStatus(id: string, responseStatus: 'new' | 'contacted' | 'resolved' | 'follow_up', trackerNotes: string) {
    try {
      const ref = doc(db, 'contactMessages', id);
      await updateDoc(ref, {
        responseStatus,
        trackerNotes,
        lastResponsedBy: auth.currentUser?.email || 'Admin Moderator',
        respondedAt: serverTimestamp()
      });
      await this.logAdminAction('INQUIRY_RESPONSE_UPDATED', id, `Status: ${responseStatus}, Notes: ${trackerNotes}`);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};
