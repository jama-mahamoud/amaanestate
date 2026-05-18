import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

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
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const syncUserProfile = async (firebaseUser: User) => {
    if (syncing) return;
    setSyncing(true);
    const userRef = doc(db, 'users', firebaseUser.uid);
    try {
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Anonymous User',
          email: firebaseUser.email || '',
          role: 'normal_user' as UserRole,
          createdAt: serverTimestamp(),
          photoURL: firebaseUser.photoURL,
          isVerified: firebaseUser.emailVerified,
        };
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
      } else {
        const existingData = userDoc.data() as UserProfile;
        setProfile(existingData);
        
        // Minor background update if displayName or photoURL changed in Firebase but not in profile
        if (existingData.displayName !== firebaseUser.displayName || existingData.photoURL !== firebaseUser.photoURL) {
          await setDoc(userRef, {
            displayName: firebaseUser.displayName || existingData.displayName,
            photoURL: firebaseUser.photoURL || existingData.photoURL,
          }, { merge: true });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    // Force persistence to ensure session sticks
    const initAuth = async () => {
      try {
        console.log('Initializing Auth Persistence...');
        await setPersistence(auth, browserLocalPersistence);
        console.log('Auth Persistence set to local.');
      } catch (error) {
        console.error('Persistence error:', error);
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth State Changed. User:', user ? user.uid : 'null');
      try {
        setUser(user);
        if (user) {
          await syncUserProfile(user);
        } else {
          setProfile(null);
          setSyncing(false);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        throw new Error(`The domain "${domain}" is not authorized in your Firebase Project. Please go to Firebase Console > Authentication > Settings > Authorized Domains and add "${domain}".`);
      }
      throw error;
    }
  };

  const signIn = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUp = async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, signInWithGoogle, signIn, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
