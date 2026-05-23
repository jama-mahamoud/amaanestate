import { db, auth } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { Broker, Agency } from '@/types';

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
        await updateDoc(userRef, { role: 'pending_broker' });
      }

      return newBrokerRef.id;
    } catch (error) {
      console.error('Error applying for broker:', error);
      throw error;
    }
  },

  async getVerifiedBrokers(): Promise<Broker[]> {
    try {
      const qAll = query(collection(db, 'brokers'));
      const querySnapshot = await getDocs(qAll);
      const allBrokers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Broker));
      
      return allBrokers.filter(broker => {
        const isApprovedStatus = 
          broker.status === 'approved' || 
          (broker.status as string) === 'verified' ||
          (broker as any).status === 'active' || 
          (broker as any).approved === true;
          
        const isVerifiedCheck = 
          broker.isVerified === true || 
          (broker as any).verified === true || 
          isApprovedStatus;
          
        const isVisible = (broker as any).visibility !== false;

        return isApprovedStatus && isVerifiedCheck && isVisible;
      });
    } catch (error) {
      console.error('All verified broker fetching attempts failed:', error);
      return [];
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
      const visibility = status === 'approved';
      await updateDoc(brokerRef, {
        status,
        isVerified,
        visibility,
        updatedAt: new Date().toISOString()
      });

      // Update user role to 'agent' if approved (Safety: Never update logged-in user if they are the admin doing the approval)
      if (status === 'approved') {
        const brokerSnap = await getDoc(brokerRef);
        if (brokerSnap.exists()) {
          const brokerData = brokerSnap.data();
          const userId = brokerData.userId;
          // Brokers strictly become 'agent' role. Agencies belong in 'agencies' collection.
          const role = 'agent';
          
          if (userId && userId !== auth.currentUser?.uid) {
            await updateDoc(doc(db, 'users', userId), { role });
          }
        }
      }

    } catch (error) {
      console.error('Error updating broker status:', error);
      throw error;
    }
  },

  // --- AGENCIES COLLECTION SUPPORT ---

  async getAgency(id: string): Promise<Agency | null> {
    try {
      const docRef = doc(db, 'agencies', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Agency;
      }
      return null;
    } catch (error) {
      console.error('Error fetching agency:', error);
      throw error;
    }
  },

  async applyForAgency(userId: string, data: {
    agencyName: string;
    email: string;
    phone: string;
    license: string;
    logo: string;
    documents: string[];
  }): Promise<string> {
    try {
      const newAgencyRef = doc(collection(db, 'agencies'));
      const agencyData: Agency = {
        id: newAgencyRef.id,
        agencyId: newAgencyRef.id,
        ownerId: userId,
        agencyName: data.agencyName,
        email: data.email,
        phone: data.phone,
        license: data.license,
        logo: data.logo,
        documents: data.documents,
        status: 'pending',
        verified: false,
        isVerified: false,
        visibility: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(newAgencyRef, agencyData);

      // Set user role to pending_agency if they are normal_user
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().role === 'normal_user') {
        await updateDoc(userRef, { role: 'pending_agency' }); 
      }

      return newAgencyRef.id;
    } catch (error) {
      console.error('Error applying for agency:', error);
      throw error;
    }
  },

  async getVerifiedAgencies(): Promise<Agency[]> {
    try {
      const qAll = query(collection(db, 'agencies'));
      const querySnapshot = await getDocs(qAll);
      const allAgencies = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agency));
      
      return allAgencies.filter(agency => {
        const isApproved = 
          agency.status === 'approved' || 
          (agency.status as string) === 'verified' || 
          (agency as any).verified === true || 
          (agency as any).approved === true;
          
        const isVisible = agency.visibility !== false;
        return isApproved && isVisible;
      });
    } catch (fallbackError) {
      console.error('All verified agency fetching attempts failed:', fallbackError);
      return [];
    }
  },

  async getAllAgencies(): Promise<Agency[]> {
    try {
      const q = query(collection(db, 'agencies'));
      const querySnapshot = await getDocs(q);
      const agencies = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agency));
      return agencies.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error fetching all agencies safely:', error);
      return [];
    }
  },

  async updateAgencyStatus(id: string, status: Agency['status']): Promise<void> {
    try {
      const agencyRef = doc(db, 'agencies', id);
      const verified = status === 'approved';
      const visibility = status === 'approved';
      await updateDoc(agencyRef, {
        status,
        verified,
        isVerified: verified,
        visibility,
        updatedAt: new Date().toISOString()
      });

      // Update user role to 'agency' if approved (Safety: Never update logged-in admin role)
      if (status === 'approved') {
        const agencySnap = await getDoc(agencyRef);
        if (agencySnap.exists()) {
          const agencyData = agencySnap.data();
          const ownerId = agencyData.ownerId;
          if (ownerId && ownerId !== auth.currentUser?.uid) {
            await updateDoc(doc(db, 'users', ownerId), { role: 'agency' });
          }
        }
      }
    } catch (error) {
      console.error('Error updating agency status:', error);
      throw error;
    }
  },

  async deleteBroker(id: string): Promise<void> {
    try {
      const brokerRef = doc(db, 'brokers', id);
      await deleteDoc(brokerRef);
    } catch (error) {
      console.error('Error deleting broker:', error);
      throw error;
    }
  },

  async deleteAgency(id: string): Promise<void> {
    try {
      const agencyRef = doc(db, 'agencies', id);
      await deleteDoc(agencyRef);
    } catch (error) {
      console.error('Error deleting agency:', error);
      throw error;
    }
  }
};
