import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, getFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Support dynamic runtime injected credentials for full-stack Cloud Run environment resilience
const runtimeConfig = typeof window !== 'undefined' ? (window as any).FIREBASE_CONFIG : null;

// Combine config with env var
const finalApiKey = runtimeConfig?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey;

if (!finalApiKey || finalApiKey === "REPLACE_ME_WITH_ENV_VAR") {
  console.warn(
    "🚨 FIREBASE API KEY IS NOT CONFIGURED YET 🚨\n" +
    "Firebase is initialized in offline fallback mode. Configure VITE_FIREBASE_API_KEY or set_up_firebase to connect online."
  );
}

const config = {
  ...firebaseConfig,
  apiKey: finalApiKey,
  authDomain: runtimeConfig?.authDomain || firebaseConfig.authDomain,
  projectId: runtimeConfig?.projectId || firebaseConfig.projectId,
  storageBucket: runtimeConfig?.storageBucket || firebaseConfig.storageBucket,
  messagingSenderId: runtimeConfig?.messagingSenderId || firebaseConfig.messagingSenderId,
  appId: runtimeConfig?.appId || firebaseConfig.appId
};

const app = initializeApp(config);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Use initializeFirestore with settings to mitigate WebChannel connection issues in AI Studio preview
const dbId = runtimeConfig?.firestoreDatabaseId || (firebaseConfig as any).firestoreDatabaseId;
const finalDbId = (dbId && dbId !== '(default)' && dbId !== 'default') ? dbId : undefined;

let initializedDb;
try {
  initializedDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, finalDbId);
} catch (error) {
  console.warn("initializeFirestore failed to resolve with multi-tab persistence, using standard fallback:", error);
  try {
    initializedDb = initializeFirestore(app, {
      experimentalForceLongPolling: true
    }, finalDbId);
  } catch (innerErr) {
    initializedDb = getFirestore(app);
  }
}

export const db = initializedDb;
export const googleProvider = new GoogleAuthProvider();

export default app;
