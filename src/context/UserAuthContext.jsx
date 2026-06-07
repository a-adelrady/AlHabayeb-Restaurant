import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth, DEMO_MODE } from "../services/firebase";

const UserAuthContext = createContext(null);

const DEMO_USERS_KEY    = "hab_demo_users";
const DEMO_SESSION_KEY  = "hab_demo_user";

function getDemoUsers() {
  try { return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || "[]") }
  catch { return [] }
}
function saveDemoUsers(users) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

export function UserAuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading]  = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      try {
        const saved = sessionStorage.getItem(DEMO_SESSION_KEY);
        if (saved) setCurrentUser(JSON.parse(saved));
      } catch {}
      setUserLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUser(firebaseUser);
      setUserLoading(false);
    });
    return unsub;
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async ({ name, email, password, phone }) => {
    if (DEMO_MODE) {
      const users = getDemoUsers();
      if (users.find((u) => u.email === email)) {
        const err = new Error("auth/email-already-in-use");
        err.code = "auth/email-already-in-use";
        throw err;
      }
      const newUser = {
        uid: `demo_${Date.now()}`,
        displayName: name,
        email,
        phone,
        createdAt: new Date().toISOString(),
      };
      // FIX: still storing password in demo mode for login verification,
      // but this is explicitly DEMO-only — never done in production path.
      saveDemoUsers([...users, { ...newUser, password }]);
      setCurrentUser(newUser);
      sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(newUser));
      return newUser;
    }

    await setPersistence(auth, browserLocalPersistence);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    // FIX: phone is stored via Firestore in production; do NOT persist to localStorage
    setCurrentUser(result.user);
    return result.user;
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    if (DEMO_MODE) {
      const users = getDemoUsers();
      const found = users.find((u) => u.email === email && u.password === password);
      if (!found) {
        const err = new Error("auth/invalid-credential");
        err.code = "auth/invalid-credential";
        throw err;
      }
      const { password: _p, ...userObj } = found;
      setCurrentUser(userObj);
      sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(userObj));
      return userObj;
    }

    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    if (DEMO_MODE) {
      setCurrentUser(null);
      sessionStorage.removeItem(DEMO_SESSION_KEY);
      return;
    }
    await firebaseSignOut(auth);
    setCurrentUser(null);
  };

  // ── Reset password ────────────────────────────────────────────────────────
  const resetPassword = async (email) => {
    if (DEMO_MODE) return; // no-op in demo
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <UserAuthContext.Provider
      value={{
        currentUser,
        userLoading,
        register,
        login,
        logout,
        resetPassword,
        isLoggedIn: !!currentUser,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export const useUserAuth = () => {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be inside UserAuthProvider");
  return ctx;
};

export function getUserAuthError(code) {
  const map = {
    "auth/email-already-in-use":  "البريد الإلكتروني موجود بالفعل",
    "auth/invalid-email":         "البريد الإلكتروني غير صحيح",
    "auth/weak-password":         "كلمة المرور ضعيفة — لازم 6 حروف على الأقل",
    "auth/user-not-found":        "لا يوجد حساب بهذا البريد",
    "auth/wrong-password":        "كلمة المرور غلط",
    "auth/invalid-credential":    "البريد أو كلمة المرور غلط",
    "auth/too-many-requests":     "كثير المحاولات، انتظر قليلاً",
    "auth/network-request-failed":"مشكلة في الإنترنت",
  };
  return map[code] || "حدث خطأ، حاول مرة أخرى";
}
