import { getFirestore, Timestamp } from 'firebase/firestore';
import app from './firebase';
import firebaseConfigJson from '../../firebase-applet-config.json';

export const db = firebaseConfigJson.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

/**
 * Safely parses any date or timestamp value returned from Firestore into a consistent ISO UTC string.
 * This guarantees compatibility and prevents application crashes across various document states.
 */
export function parseFirestoreDate(field: any): string {
  if (!field) {
    return new Date().toISOString();
  }
  
  // If it's already an ISO string
  if (typeof field === 'string') {
    return field;
  }
  
  // If it's a native Firestore Timestamp instance
  if (field instanceof Timestamp) {
    return field.toDate().toISOString();
  }
  
  // If it's an object behaving like a Timestamp (duck-typing for safety)
  if (typeof field.toDate === 'function') {
    try {
      return field.toDate().toISOString();
    } catch (e) {
      // Fallback
    }
  }
  
  // If it's a timestamp object format with seconds
  if (typeof field.seconds === 'number') {
    return new Date(field.seconds * 1000).toISOString();
  }
  
  // If it's a standard JS Date
  if (field instanceof Date) {
    return field.toISOString();
  }
  
  // Generic fallback to current time
  return new Date().toISOString();
}

/**
 * Standard converter options for converting Javascript Date objects into Firestore-friendly values.
 */
export function toFirestoreDate(dateInput?: string | Date): Timestamp {
  if (!dateInput) {
    return Timestamp.now();
  }
  const parsedDate = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return Timestamp.fromDate(isNaN(parsedDate.getTime()) ? new Date() : parsedDate);
}

import { auth } from './firebase';

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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
