import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  orderBy
} from 'firebase/firestore';
import QRCode from 'qrcode';
import { notificationService } from './notificationService';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export interface PartyInfo {
  fullName: string;
  phone: string;
  email: string;
  nationalId: string;
  address: string;
  signatureUrl?: string; // Signature canvas base64 or file URL
}

export interface AssetPropertyInfo {
  propertyId: string;
  propertyTitle: string;
  category: 'Property' | 'Rental' | 'Land';
  type: string; // e.g., Villa, House, Apartment
  city: string;
  district: string;
  price: number;
  paymentTerms: string;
}

export interface AssetVehicleInfo {
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  price: number;
}

export interface Agreement {
  agreementId: string;
  agreementType: 'propertySale' | 'propertyRental' | 'vehicleSale' | 'vehicleRental' | 'brokerCommission';
  agreementTitle: string;
  date: string;
  currency: string;
  parties: {
    partyA: PartyInfo;
    partyB: PartyInfo;
  };
  assetInfo: {
    property?: AssetPropertyInfo;
    vehicle?: AssetVehicleInfo;
    commissionTerms?: string; // Text field if it has a custom broker commission setup
  };
  legalClauses: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected' | 'revision_requested';
  submittedBy: string;
  submittedAt: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  certificateNumber?: string;
  adminStamp?: boolean;
  adminStampUrl?: string;
  rejectionReason?: string;
  revisionRequestedReason?: string;
  pdfUrl?: string;
  qrCode?: string;
  witness1FullName?: string;
  witness1Signature?: string;
  witness2FullName?: string;
  witness2Signature?: string;
  witness3FullName?: string;
  witness3Signature?: string;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const agreementService = {
  // Submit new agreement
  async submitAgreement(
    formData: Omit<Agreement, 'agreementId' | 'status' | 'submittedBy' | 'submittedAt' | 'createdAt'>,
    customId?: string
  ): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error(JSON.stringify({ error: "Auth missing: You must be signed in to submit an agreement", operationType: OperationType.CREATE, path: 'agreements' }));
    }

    const agreementsRef = collection(db, 'agreements');
    const docRef = customId ? doc(agreementsRef, customId) : doc(agreementsRef);
    const agreementId = docRef.id;

    const agreement: Agreement = {
      ...formData,
      agreementId,
      status: 'Pending Approval',
      submittedBy: user.uid,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Sanitize object to remove undefined values
    const sanitizedAgreement = JSON.parse(
      JSON.stringify(agreement, (key, value) => (value === undefined ? null : value))
    );

    try {
      await setDoc(docRef, sanitizedAgreement);
      return agreementId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `agreements/${agreementId}`);
      throw error;
    }
  },

  // Get a single agreement by ID (accessible by creator or admin)
  async getAgreement(id: string): Promise<Agreement | null> {
    const docRef = doc(db, 'agreements', id);
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        // Since we changed schemas previously, some might not match, let's normalize
        return {
          ...data,
          agreementId: data.agreementId || snap.id,
        } as Agreement;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `agreements/${id}`);
      return null;
    }
  },

  // Retrieve user's agreements list
  async getMyAgreements(): Promise<Agreement[]> {
    const user = auth.currentUser;
    if (!user) return [];
    
    const agreementsRef = collection(db, 'agreements');
    const q = query(agreementsRef, where('submittedBy', '==', user.uid), orderBy('createdAt', 'desc'));
    
    try {
      const snap = await getDocs(q);
      const list: Agreement[] = [];
      snap.forEach(d => {
        const item = d.data();
        list.push({
          ...item,
          agreementId: item.agreementId || d.id,
        } as Agreement);
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'agreements');
      return [];
    }
  },

  // Get all agreements for admin
  async getAllAgreements(): Promise<Agreement[]> {
    const agreementsRef = collection(db, 'agreements');
    const q = query(agreementsRef, orderBy('createdAt', 'desc'));
    
    try {
      const snap = await getDocs(q);
      const list: Agreement[] = [];
      snap.forEach(d => {
        const item = d.data();
        list.push({
          ...item,
          agreementId: item.agreementId || d.id,
        } as Agreement);
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'agreements');
      return [];
    }
  },

  // Admin action: Approve, Reject, Request Revision
  async updateStatus(
    id: string, 
    status: 'Approved' | 'Rejected' | 'revision_requested', 
    reason?: string
  ): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error(JSON.stringify({ error: "Auth missing", operationType: OperationType.UPDATE, path: `agreements/${id}` }));
    }

    const docRef = doc(db, 'agreements', id);
    
    // Generate certificate number if approved
    const certNumber = status === 'Approved' ? `AMN-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${new Date().getFullYear()}` : undefined;

    const updatePayload: Partial<Agreement> = {
      status,
    };
    
    if (status === 'Approved') {
        updatePayload.approvedBy = user.email || user.uid;
        updatePayload.approvedAt = new Date().toISOString();
        updatePayload.certificateNumber = certNumber;
        updatePayload.adminStamp = true;
        updatePayload.adminStampUrl = '/amaan_official_seal.png';
    } 
    
    if (status === 'Rejected') {
        updatePayload.rejectionReason = reason;
    }
    
    if (status === 'revision_requested') {
        updatePayload.revisionRequestedReason = reason;
    }

    if (status === 'Approved') {
      try {
        const verificationUrl = `${window.location.origin}/verify/${id}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
          width: 250,
          margin: 1,
          color: {
            dark: '#0047AB', // Navy blue matching the theme
            light: '#FFFFFF'
          }
        });
        updatePayload.qrCode = qrCodeDataUrl;
      } catch (qrErr) {
        console.error("QR Code generation failed:", qrErr);
      }
    }

    try {
      console.log(`Attempting updateDoc for ${id} with payload:`, JSON.stringify(updatePayload));
      await updateDoc(docRef, updatePayload);
      console.log(`updateDoc successful for ${id}`);

      // Notify owner/signatory on status change
      try {
        const agreementSnap = await getDoc(docRef);
        if (agreementSnap.exists()) {
          const agreementData = agreementSnap.data();
          const clientUid = agreementData.submittedBy || agreementData.createdBy;
          const assetTitle = agreementData.agreementTitle || 'Property Agreement';
          
          if (clientUid) {
            if (status === 'Approved') {
              await notificationService.createNotification(
                clientUid,
                'Agreement Verified & Approved',
                `Your digital agreement "${assetTitle}" has been verified successfully and officially stamped by the public land registry.`,
                'AGREEMENT'
              );
            } else if (status === 'Rejected') {
              await notificationService.createNotification(
                clientUid,
                'Agreement Verification Declined',
                `Your digital agreement "${assetTitle}" was declined. Reason: ${reason || 'Document validation failed'}`,
                'AGREEMENT'
              );
            } else if (status === 'revision_requested') {
              await notificationService.createNotification(
                clientUid,
                'Agreement Revision Required',
                `Your digital agreement "${assetTitle}" requires revisions. Moderator request: ${reason}`,
                'AGREEMENT'
              );
            }
          }
        }
      } catch (notifyErr) {
        console.error('Error triggering agreement status update notification:', notifyErr);
      }

    } catch (error) {
      console.error(`updateDoc FAILED for ${id}. Error object:`, error);
      handleFirestoreError(error, OperationType.UPDATE, `agreements/${id}`);
    }
  }
};
