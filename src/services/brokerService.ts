import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { Broker } from '@/types';

export const brokerService = {
  async getBroker(id: string): Promise<Broker | null> {
    try {
      const docRef = doc(db, 'brokers', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Broker;
      }
      return null;
    } catch (error) {
      console.error('Error fetching broker:', error);
      throw error;
    }
  },

  async applyForBroker(userId: string, data: Omit<Broker, 'id' | 'userId' | 'status' | 'isVerified' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const newBrokerRef = doc(collection(db, 'brokers'));
      const brokerData: Broker = {
        id: newBrokerRef.id,
        userId,
        ...data,
        status: 'pending',
        isVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(newBrokerRef, brokerData);
      
      // Update user role to pending_broker if they are just a normal_user
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().role === 'normal_user') {
        await updateDoc(userRef, { role: 'pending_broker' }); // Assuming we might handle this role
      }

      return newBrokerRef.id;
    } catch (error) {
      console.error('Error applying for broker:', error);
      throw error;
    }
  },

  async getVerifiedBrokers(): Promise<Broker[]> {
    try {
      // Direct query targeting approved status to meet security policy constraints
      const q = query(
        collection(db, 'brokers'),
        where('status', '==', 'approved')
      );
      const querySnapshot = await getDocs(q);
      const brokers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Broker));
      
      return brokers.filter(broker => {
        const isApprovedStatus = 
          broker.status === 'approved' || 
          (broker as any).status === 'active' || 
          (broker as any).approved === true;
          
        const isVerifiedCheck = 
          broker.isVerified === true || 
          (broker as any).verified === true || 
          isApprovedStatus;
          
        return isApprovedStatus && isVerifiedCheck;
      });
    } catch (error) {
      console.warn('Querying approved brokers directly failed or index not ready, trying fallback:', error);
      try {
        // Fallback option in case of indexing skew/emulators or for admins
        const qAll = query(collection(db, 'brokers'));
        const querySnapshot = await getDocs(qAll);
        const allBrokers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Broker));
        
        return allBrokers.filter(broker => {
          const isApprovedStatus = 
            broker.status === 'approved' || 
            (broker as any).status === 'active' || 
            (broker as any).approved === true;
            
          const isVerifiedCheck = 
            broker.isVerified === true || 
            (broker as any).verified === true || 
            isApprovedStatus;
            
          return isApprovedStatus && isVerifiedCheck;
        });
      } catch (fallbackError) {
        console.error('All verified broker fetching attempts failed (falling back to empty list):', fallbackError);
        return [];
      }
    }
  },

  async getAllBrokers(): Promise<Broker[]> {
    try {
      const q = query(collection(db, 'brokers'));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Broker));
      
      return docs.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error fetching all brokers safely (falling back to empty list):', error);
      return [];
    }
  },

  async updateBrokerStatus(id: string, status: Broker['status']): Promise<void> {
    try {
      const brokerRef = doc(db, 'brokers', id);
      const isVerified = status === 'approved';
      await updateDoc(brokerRef, {
        status,
        isVerified,
        updatedAt: new Date().toISOString()
      });

      // Update user role to 'agent' if approved
      if (status === 'approved') {
        const brokerSnap = await getDoc(brokerRef);
        if (brokerSnap.exists()) {
          const userId = brokerSnap.data().userId;
          await updateDoc(doc(db, 'users', userId), { role: 'agent' });
        }
      }

    } catch (error) {
      console.error('Error updating broker status:', error);
      throw error;
    }
  }
};
