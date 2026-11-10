import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: firebaseConfigJson.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: firebaseConfigJson.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: firebaseConfigJson.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: firebaseConfigJson.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: firebaseConfigJson.appId || import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Check if Firebase configuration is initialized correctly
export const isFirebaseConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

if (!isFirebaseConfigured) {
  console.warn("AmaanEstate Warning: Firebase environment variables are missing or incomplete in client environment.");
}

// Lazy/Safe initialize app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export default app;
