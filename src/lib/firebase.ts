import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Use initializeFirestore with settings to mitigate WebChannel connection issues in AI Studio preview
const dbId = (firebaseConfig as any).firestoreDatabaseId;
const finalDbId = (dbId && dbId !== '(default)' && dbId !== 'default') ? dbId : undefined;

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, finalDbId);

export const googleProvider = new GoogleAuthProvider();

export default app;
