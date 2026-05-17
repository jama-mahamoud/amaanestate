import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBInp5M8dVTctLoLw9I44_mPzOx-Q7JhoE",
  authDomain: "amaanestate-97f4f.firebaseapp.com",
  projectId: "amaanestate-97f4f",
  storageBucket: "amaanestate-97f4f.firebasestorage.app",
  messagingSenderId: "978752259304",
  appId: "1:978752259304:web:ae1553196f985466d7f55d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
