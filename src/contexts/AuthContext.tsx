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
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
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

  useEffect(() => {
    // Force persistence to ensure session sticks
    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.error('Persistence error:', error);
      }
    };

    initAuth();

    let profileUnsubscribe: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          // Ensure profile exists first
          const userRef = doc(db, 'users', user.uid);
          let userDoc;
          
          try {
            userDoc = await getDoc(userRef);
            
            if (!userDoc.exists()) {
              const newProfile: UserProfile = {
                uid: user.uid,
                displayName: user.displayName || 'Anonymous User',
                email: user.email || '',
                role: 'normal_user' as UserRole,
                createdAt: serverTimestamp(),
                photoURL: user.photoURL,
                isVerified: user.emailVerified,
              };
              try {
                await setDoc(userRef, newProfile);
              } catch (setErr) {
                console.warn("Failed to write user profile (operating in offline fallback):", setErr);
              }
              setProfile(newProfile);
            } else {
              // Check for minor background updates
              const existingData = userDoc.data() as UserProfile;
              
              const normalizedRole = existingData.role 
                ? (existingData.role.toString().toLowerCase().trim() as UserRole)
                : 'normal_user';

              setProfile({
                ...existingData,
                role: normalizedRole
              });

              if (
                existingData.displayName !== user.displayName || 
                existingData.photoURL !== user.photoURL
              ) {
                try {
                  await setDoc(userRef, {
                    displayName: user.displayName || existingData.displayName,
                    photoURL: user.photoURL || existingData.photoURL
                  }, { merge: true });
                } catch (setErr) {
                  console.warn("Failed to update user profile (operating in offline fallback):", setErr);
                }
              }
            }
          } catch (docErr) {
            console.warn("Failed to fetch user doc from active server (profile loaded from local session memory):", docErr);
            // Fallback profile if offline/failed to fetch from server
            setProfile({
              uid: user.uid,
              displayName: user.displayName || 'User',
              email: user.email || '',
              role: 'normal_user' as UserRole,
              photoURL: user.photoURL,
              isVerified: user.emailVerified,
              createdAt: serverTimestamp(),
            });
          }

          // Set up real-time listener for the user profile
          if (profileUnsubscribe) profileUnsubscribe();
          
          profileUnsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data() as UserProfile;
              const normalizedRole = data.role ? (data.role.toString().toLowerCase().trim() as UserRole) : 'normal_user';
              setProfile({
                ...data,
                role: normalizedRole
              });
            } else {
              setProfile(null);
            }
          }, (error) => {
            console.warn("Profile snapshot listener encountered an error (operating offline/restricted environment):", error);
          });
          
        } else {
          setProfile(null);
          if (profileUnsubscribe) {
            profileUnsubscribe();
            profileUnsubscribe = null;
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
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
