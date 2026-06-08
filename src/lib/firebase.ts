import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Combine config with env var
const finalApiKey = import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey;

if (!finalApiKey || finalApiKey === "REPLACE_ME_WITH_ENV_VAR") {
  console.error(
    "🚨 FIREBASE API KEY IS MISSING 🚨\n" +
    "Firebase Authentication requires a valid API key to function.\n" +
    "Since you removed it from firebase-applet-config.json, you MUST add it as an Environment Variable in Vercel:\n" +
    "Name: VITE_FIREBASE_API_KEY\n" +
    "Value: (Your Firebase Web API Key)"
  );
}

const config = {
  ...firebaseConfig,
  apiKey: finalApiKey
};

const app = initializeApp(config);
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
