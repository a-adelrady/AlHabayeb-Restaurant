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
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, DEMO_MODE } from "../services/firebase";

// ─── Constants ────────────────────────────────────────────────────────────────
export const ROLES = {
  USER: "user",
  SUPERVISOR: "supervisor",
  ADMIN: "admin",
  SUPERADMIN: "superadmin",
};

// ما يستطيع كل role الوصول إليه
export const ROLE_PERMISSIONS = {
  user: [],
  supervisor: ["view_admin", "view_orders", "view_customers"],
  admin: [
    "view_admin",
    "view_orders",
    "view_customers",
    "manage_orders",
    "manage_products",
    "manage_categories",
    "manage_delivery",
    "manage_settings",
  ],
  superadmin: [
    "view_admin",
    "view_orders",
    "view_customers",
    "manage_orders",
    "manage_products",
    "manage_categories",
    "manage_delivery",
    "manage_settings",
    "manage_users",
  ],
};

// ─── Demo users (DEMO_MODE فقط) ───────────────────────────────────────────────
const DEMO_USERS = [
  {
    uid: "demo-superadmin",
    email: "superadmin@alhabayeb.com",
    password: "super123456",
    displayName: "مالك النظام",
    role: "superadmin",
    phone: "",
  },
  {
    uid: "demo-admin",
    email: "admin@alhabayeb.com",
    password: "admin123456",
    displayName: "مدير النظام",
    role: "admin",
    phone: "",
  },
  {
    uid: "demo-supervisor",
    email: "supervisor@alhabayeb.com",
    password: "super123456",
    displayName: "مشرف",
    role: "supervisor",
    phone: "",
  },
  {
    uid: "demo-user",
    email: "user@alhabayeb.com",
    password: "user123456",
    displayName: "مستخدم تجريبي",
    role: "user",
    phone: "01000000000",
  },
];

const DEMO_REGISTERED_KEY = "hab_demo_registered";
const DEMO_SESSION_KEY = "hab_demo_session";

function getDemoRegistered() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_REGISTERED_KEY) || "[]");
  } catch {
    return [];
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const RoleAuthContext = createContext(null);

export function RoleAuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // Firestore document
  const [loading, setLoading] = useState(true);

  // ── جلب بيانات المستخدم من Firestore ────────────────────────────────────
  const fetchProfile = async (uid) => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        setUserProfile(snap.data());
        return snap.data();
      }
    } catch {}
    return null;
  };

  // ── Auth State Listener ──────────────────────────────────────────────────
  useEffect(() => {
    if (DEMO_MODE) {
      try {
        const saved = sessionStorage.getItem(DEMO_SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setCurrentUser(parsed);
          setUserProfile(parsed);
        }
      } catch {}
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        await fetchProfile(firebaseUser.uid);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const role = userProfile?.role || ROLES.USER;
  const permissions = ROLE_PERMISSIONS[role] || [];

  const hasPermission = (perm) => permissions.includes(perm);
  const canAccessAdmin = () => hasPermission("view_admin");
  const isSuperAdmin = () => role === ROLES.SUPERADMIN;
  const isAdmin = () => role === ROLES.ADMIN || isSuperAdmin();
  const isSupervisor = () => role === ROLES.SUPERVISOR || isAdmin();

  // ─── Register (customer only) ─────────────────────────────────────────────
  const register = async ({ name, email, password, phone }) => {
    if (DEMO_MODE) {
      const allUsers = [...DEMO_USERS, ...getDemoRegistered()];
      if (allUsers.find((u) => u.email === email)) {
        const err = new Error("auth/email-already-in-use");
        err.code = "auth/email-already-in-use";
        throw err;
      }
      const newUser = {
        uid: `demo_${Date.now()}`,
        displayName: name,
        email,
        phone,
        role: ROLES.USER,
        createdAt: new Date().toISOString(),
        password, // demo only
      };
      const registered = getDemoRegistered();
      localStorage.setItem(
        DEMO_REGISTERED_KEY,
        JSON.stringify([...registered, newUser]),
      );
      const { password: _p, ...safeUser } = newUser;
      setCurrentUser(safeUser);
      setUserProfile(safeUser);
      sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(safeUser));
      return safeUser;
    }

    await setPersistence(auth, browserLocalPersistence);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });

    // حفظ بيانات المستخدم في Firestore مع role = user
    const profileData = {
      uid: result.user.uid,
      displayName: name,
      email: email.toLowerCase(),
      phone: phone || "",
      role: ROLES.USER,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    };
    await setDoc(doc(db, "users", result.user.uid), profileData);
    setUserProfile(profileData);
    setCurrentUser(result.user);
    return result.user;
  };

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    if (DEMO_MODE) {
      const allUsers = [...DEMO_USERS, ...getDemoRegistered()];
      const found = allUsers.find(
        (u) => u.email === email && u.password === password,
      );
      if (!found) {
        const err = new Error("auth/invalid-credential");
        err.code = "auth/invalid-credential";
        throw err;
      }
      const { password: _p, ...safeUser } = found;
      setCurrentUser(safeUser);
      setUserProfile(safeUser);
      sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(safeUser));
      return safeUser;
    }

    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithEmailAndPassword(auth, email, password);

    // تحديث lastLogin + جلب الـ profile
    const profileRef = doc(db, "users", result.user.uid);
    await updateDoc(profileRef, { lastLogin: serverTimestamp() }).catch(
      () => {},
    );
    const profile = await fetchProfile(result.user.uid);
    return { ...result.user, profile };
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    if (DEMO_MODE) {
      setCurrentUser(null);
      setUserProfile(null);
      sessionStorage.removeItem(DEMO_SESSION_KEY);
      return;
    }
    await firebaseSignOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  // ─── Reset password ───────────────────────────────────────────────────────
  const resetPassword = async (email) => {
    if (DEMO_MODE) return;
    await sendPasswordResetEmail(auth, email);
  };

  // ─── Update user role (superadmin فقط) ────────────────────────────────────
  const updateUserRole = async (uid, newRole) => {
    if (!isSuperAdmin()) throw new Error("ليس لديك صلاحية");
    if (!Object.values(ROLES).includes(newRole))
      throw new Error("role غير صحيح");
    await updateDoc(doc(db, "users", uid), { role: newRole });
  };

  return (
    <RoleAuthContext.Provider
      value={{
        // State
        currentUser,
        userProfile,
        loading,
        role,
        permissions,
        // Checks
        hasPermission,
        canAccessAdmin,
        isSuperAdmin,
        isAdmin,
        isSupervisor,
        isLoggedIn: !!currentUser,
        // Actions
        register,
        login,
        logout,
        resetPassword,
        updateUserRole,
        // ── Backward-compat aliases ──
        user: currentUser,
        signIn: login,
        signOut: logout,
        error: null,
      }}
    >
      {children}
    </RoleAuthContext.Provider>
  );
}

export const useRoleAuth = () => {
  const ctx = useContext(RoleAuthContext);
  if (!ctx) throw new Error("useRoleAuth must be inside RoleAuthProvider");
  return ctx;
};

// backward-compat hooks (عشان ما تكسرش الكود القديم فوراً)
export const useAuth = useRoleAuth;
export const useUserAuth = useRoleAuth;

export function getAuthError(code) {
  const map = {
    "auth/email-already-in-use": "البريد الإلكتروني موجود بالفعل",
    "auth/invalid-email": "البريد الإلكتروني غير صحيح",
    "auth/weak-password": "كلمة المرور ضعيفة — لازم 6 حروف على الأقل",
    "auth/user-not-found": "لا يوجد حساب بهذا البريد",
    "auth/wrong-password": "كلمة المرور غلط",
    "auth/invalid-credential": "البريد أو كلمة المرور غلط",
    "auth/too-many-requests": "كثير المحاولات، انتظر قليلاً",
    "auth/network-request-failed": "مشكلة في الإنترنت",
    "auth/user-disabled": "تم تعطيل هذا الحساب",
  };
  return map[code] || "حدث خطأ، حاول مرة أخرى";
}

// backward-compat
export { getAuthError as getUserAuthError };
