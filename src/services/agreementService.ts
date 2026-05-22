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
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  submittedBy: string;
  submittedAt: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  certificateNumber?: string;
  adminStamp?: boolean;
  adminStampUrl?: string;
  rejectionReason?: string;
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

  // Admin action: Approve, Reject
  async updateStatus(
    id: string, 
    status: 'Approved' | 'Rejected', 
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
      approvedBy: status === 'Approved' ? user.email || user.uid : undefined,
      approvedAt: status === 'Approved' ? new Date().toISOString() : undefined,
      rejectionReason: status === 'Rejected' ? reason : undefined,
      certificateNumber: certNumber,
      adminStamp: status === 'Approved',
      adminStampUrl: status === 'Approved' ? '/src/assets/images/amaan_official_seal_1779425535310.png' : undefined,
    };

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
      await updateDoc(docRef, updatePayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `agreements/${id}`);
    }
  }
};
