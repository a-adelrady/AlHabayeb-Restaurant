import {
  fsSubscribeProducts,
  fsSubscribeOrders,
  fsSubscribeArchivedOrders,
  fsSubscribeNotifications,
} from "./services/firestoreService";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, DEMO_MODE } from "./services/firebase";
import { useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";
import { RoleAuthProvider, useRoleAuth } from "./context/RoleAuthContext";
import useStore from "./store/useStore";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

// Eager-loaded pages (above the fold)
import HomePage from "./pages/HomePage";

// Lazy-loaded pages
const MenuPage = lazy(() => import("./pages/MenuPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));
const OrderTrackingPage = lazy(() => import("./pages/OrderTrackingPage"));
const DeveloperPage = lazy(() => import("./pages/DeveloperPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Admin pages (lazy)
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminDelivery = lazy(() => import("./pages/admin/AdminDelivery"));
const UnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));

// Protected route wrapper for admin
function RequireAuth({ children, requiredPermission = "view_admin" }) {
  const { currentUser, loading, hasPermission } = useRoleAuth();
  if (loading) return <PageLoader />;
  if (!currentUser) return <Navigate to="/admin/login" replace />;
  if (!hasPermission(requiredPermission))
    return <Navigate to="/unauthorized" replace />;
  return children;
}

function RequirePermission({ perm, children }) {
  const { hasPermission } = useRoleAuth();
  if (!hasPermission(perm)) return <Navigate to="/admin" replace />;
  return children;
}

function PageLoader() {
  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center text-black font-bold text-2xl animate-pulse">
          ح
        </div>
        <div className="w-6 h-6 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
      </div>
    </div>
  );
}

function AppContent() {
  const { initTheme, isDark } = useStore();

  useEffect(() => {
    initTheme();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (DEMO_MODE) return;

    const unsubProducts = fsSubscribeProducts((products) => {
      if (products.length > 0) useStore.setState({ products });
    });

    const unsubCategories = (() => {
      const q = query(collection(db, "categories"), orderBy("id"));
      return onSnapshot(
        q,
        (snap) => {
          const categories = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          if (categories.length > 0) useStore.setState({ categories });
        },
        () => {},
      );
    })();

    const unsubOrders = fsSubscribeOrders((firestoreOrders) => {
      useStore.setState({ orders: firestoreOrders });
    });

    // تأكد إن الـ Firestore data دايماً تـoverride الـ localStorage
    // بعمل forceUpdate بعد ثانيتين عشان يضمن إن الـ persist rehydration اتعمل
    const forceSync = setTimeout(() => {
      if (!DEMO_MODE) {
        // re-trigger the subscription manually إذا كانت البيانات قديمة
        useStore.setState((state) => ({ orders: state.orders }));
      }
    }, 2000);

    const unsubArchived = fsSubscribeArchivedOrders((archived) => {
      useStore.setState({ archivedOrders: archived });
    });

    const unsubNotifications = fsSubscribeNotifications((notifications) => {
      useStore.setState({ notifications });
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubOrders();
      unsubArchived();
      unsubNotifications();
      clearTimeout(forceSync);
    };
  }, []);

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen transition-colors duration-300 dark:bg-zinc-950 bg-gray-50">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="menu" element={<MenuPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="order-success" element={<OrderSuccessPage />} />
              <Route path="track-order" element={<OrderTrackingPage />} />
              <Route
                path="track-order/:orderId"
                element={<OrderTrackingPage />}
              />
              <Route path="unauthorized" element={<UnauthorizedPage />} />
              <Route path="auth" element={<AuthPage />} />
              <Route path="profile" element={<UserProfilePage />} />
              <Route path="developer" element={<DeveloperPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Admin Login (public) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <RequireAuth requiredPermission="view_admin">
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route
                path="products"
                element={
                  <RequirePermission perm="manage_products">
                    <AdminProducts />
                  </RequirePermission>
                }
              />
              <Route
                path="categories"
                element={
                  <RequirePermission perm="manage_categories">
                    <AdminCategories />
                  </RequirePermission>
                }
              />
              <Route
                path="delivery"
                element={
                  <RequirePermission perm="manage_delivery">
                    <AdminDelivery />
                  </RequirePermission>
                }
              />
              <Route
                path="settings"
                element={
                  <RequirePermission perm="manage_settings">
                    <AdminSettings />
                  </RequirePermission>
                }
              />
              <Route
                path="users"
                element={
                  <RequirePermission perm="manage_users">
                    <AdminUsers />
                  </RequirePermission>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "Cairo, sans-serif",
            direction: "rtl",
            background: isDark ? "#18181b" : "#fff",
            color: isDark ? "#fff" : "#18181b",
            border: `1px solid ${isDark ? "#3f3f46" : "#e4e4e7"}`,
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#C8960C", secondary: "#000" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <RoleAuthProvider>
          <AppContent />
        </RoleAuthProvider>
      </Router>
    </HelmetProvider>
  );
}
