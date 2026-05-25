import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

export type NotificationType = 'PROPERTY' | 'PAYMENT' | 'AGREEMENT' | 'VERIFICATION' | 'INQUIRY' | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: any; // Firestore Timestamp
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error in NotificationService: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const notificationService = {
  /**
   * Create a direct or administrative notification
   */
  async createNotification(userId: string, title: string, message: string, type: NotificationType) {
    const notificationsRef = collection(db, 'notifications');
    const newDocRef = doc(notificationsRef);
    
    const notificationData: Notification = {
      id: newDocRef.id,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: serverTimestamp()
    };

    try {
      await setDoc(newDocRef, notificationData);
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `notifications/${newDocRef.id}`);
    }
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string) {
    const docRef = doc(db, 'notifications', notificationId);
    try {
      await updateDoc(docRef, { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${notificationId}`);
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(notificationIds: string[]) {
    if (notificationIds.length === 0) return;
    try {
      const batch = writeBatch(db);
      notificationIds.forEach(id => {
        const docRef = doc(db, 'notifications', id);
        batch.update(docRef, { read: true });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/batch-read`);
    }
  },

  /**
   * Delete a single notification
   */
  async deleteNotification(notificationId: string) {
    const docRef = doc(db, 'notifications', notificationId);
    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notifications/${notificationId}`);
    }
  },

  /**
   * Delete all notifications
   */
  async clearAllNotifications(notificationIds: string[]) {
    if (notificationIds.length === 0) return;
    try {
      const batch = writeBatch(db);
      notificationIds.forEach(id => {
        const docRef = doc(db, 'notifications', id);
        batch.delete(docRef);
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notifications/batch-clear`);
    }
  },

  /**
   * Subscribe to direct notifications for a user, or admin notifications if user is admin
   */
  subscribe(userId: string, isAdminUser: boolean, onUpdate: (notifications: Notification[]) => void) {
    const notificationsRef = collection(db, 'notifications');
    
    // Non-admins only get their own, admins also get 'admin' targeted ones
    const q = isAdminUser 
      ? query(notificationsRef, where('userId', 'in', [userId, 'admin']))
      : query(notificationsRef, where('userId', '==', userId));

    return onSnapshot(q, (snapshot) => {
      const notifications: Notification[] = [];
      snapshot.forEach(doc => {
        notifications.push(doc.data() as Notification);
      });
      // Sort in memory by createdAt descending safely handling serverTimestamp pending nulls
      notifications.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt instanceof Date ? a.createdAt.getTime() : Date.now());
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt instanceof Date ? b.createdAt.getTime() : Date.now());
        return timeB - timeA;
      });
      onUpdate(notifications);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `notifications`);
    });
  }
};
