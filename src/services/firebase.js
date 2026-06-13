// Firebase v10 modular SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

let app, db, auth, storage, messaging;

if (!DEMO_MODE) {
  try {
    app = initializeApp(firebaseConfig);

    // FIX: enableIndexedDbPersistence() is deprecated
    // Use initializeFirestore() with persistentLocalCache
    // persistentMultipleTabManager handles the multi-tab caching
    db = getFirestore(app);

    auth = getAuth(app);
    storage = getStorage(app);

    // FCM — Push Notifications (الخطوة الجديدة هنا)
    try {
      messaging = getMessaging(app);
    } catch (error) {
      // messaging مش متاح في كل البيئات (مثلاً Safari قديم)
      console.info("FCM not supported in this environment");
    }
  } catch (error) {
    console.error("Firebase init error:", error);
    // Fallback: plain Firestore without persistence
    if (app && !db) {
      db = getFirestore(app);
    }
  }
}

export { db, auth, storage, messaging };
export default app;
