import { useEffect, useCallback } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { messaging, db, DEMO_MODE } from "../services/firebase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// إرسال الـ config للـ Service Worker
async function initServiceWorker(firebaseConfig) {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );
    await navigator.serviceWorker.ready;
    // إرسال الـ config للـ SW
    reg.active?.postMessage({
      type: "FIREBASE_CONFIG",
      config: firebaseConfig,
    });
    return reg;
  } catch (err) {
    console.warn("Service Worker registration failed:", err);
    return null;
  }
}

// حفظ الـ FCM token في Firestore مع بيانات المستخدم
async function saveFcmToken(uid, token, role) {
  if (!uid || !token) return;
  try {
    await setDoc(
      doc(db, "fcmTokens", `${uid}_${token.slice(-8)}`),
      {
        uid,
        token,
        role,
        platform: /Mobile|Android|iPhone/i.test(navigator.userAgent)
          ? "mobile"
          : "web",
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (err) {
    console.warn("Failed to save FCM token:", err);
  }
}

export function usePushNotifications(uid, role) {
  // طلب الإذن وتسجيل الـ token
  const requestPermission = useCallback(async () => {
    if (DEMO_MODE || !messaging || !uid) return;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };
      await initServiceWorker(firebaseConfig);

      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) await saveFcmToken(uid, token, role);
    } catch (err) {
      console.warn("Push notification setup failed:", err);
    }
  }, [uid, role]);

  // استقبال الإشعارات وهو الـ app مفتوح (Foreground)
  useEffect(() => {
    if (DEMO_MODE || !messaging) return;

    const unsub = onMessage(messaging, (payload) => {
      const { title, body } = payload.notification || {};
      const data = payload.data || {};

      // عرض toast بدل الـ notification العادية (لأن الـ app مفتوح)
      toast(`${title}${body ? "\n" + body : ""}`, {
        duration: 5000,
        icon: data.icon || "🔔",
      });
    });

    return () => unsub();
  }, []);

  // اطلب الإذن تلقائياً لما يسجل دخول
  useEffect(() => {
    if (uid) requestPermission();
  }, [uid, requestPermission]);

  return { requestPermission };
}
