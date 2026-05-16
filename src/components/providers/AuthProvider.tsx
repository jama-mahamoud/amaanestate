import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

interface AppUser {
  uid: string;
  email: string;
  role: 'admin' | 'agent' | 'user';
  name: string;
  isApproved: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  appUser: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch or create user document
        const userRef = doc(db, 'users', user.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setAppUser({ uid: user.uid, ...userSnap.data() } as AppUser);
          } else {
            // Check if super admin
            const isSuperAdmin = user.email === 'towinnow0@gmail.com';
            const role = isSuperAdmin ? 'admin' : 'user';
            
            const newAppUser = {
              uid: user.uid,
              email: user.email,
              name: user.displayName || 'Anonymous',
              role,
              isApproved: isSuperAdmin ? true : false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            
            await setDoc(userRef, newAppUser);
            setAppUser({ uid: user.uid, ...newAppUser } as AppUser);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setAppUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, appUser, loading }}>
        {children}
    </AuthContext.Provider>
  );
}
