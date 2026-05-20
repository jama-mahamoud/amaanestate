import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with settings to mitigate WebChannel connection issues in AI Studio preview
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  // This forces HTTP long-polling to immediately bypass WebSocket handshakes inside proxies and iframes
}, (firebaseConfig as any).firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();

export default app;
