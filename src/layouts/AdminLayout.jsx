import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  MdDashboard,
  MdRestaurantMenu,
  MdCategory,
  MdShoppingBag,
  MdPeople,
  MdSettings,
  MdMenu,
  MdClose,
  MdHome,
  MdLogout,
  MdDeliveryDining,
  MdNotifications,
  MdManageAccounts,
} from "react-icons/md";
import { useRoleAuth, ROLES } from "../context/RoleAuthContext";
import useStore from "../store/useStore";
import NotificationCenter from "../components/admin/NotificationCenter";
import { usePushNotifications } from "../hooks/usePushNotifications";

const ALL_NAV_ITEMS = [
  {
    path: "/admin",
    label: "لوحة التحكم",
    icon: MdDashboard,
    exact: true,
    perm: "view_admin",
  },
  {
    path: "/admin/orders",
    label: "الطلبات",
    icon: MdShoppingBag,
    perm: "view_orders",
  },
  {
    path: "/admin/customers",
    label: "العملاء",
    icon: MdPeople,
    perm: "view_customers",
  },
  {
    path: "/admin/products",
    label: "المنتجات",
    icon: MdRestaurantMenu,
    perm: "manage_products",
  },
  {
    path: "/admin/categories",
    label: "التصنيفات",
    icon: MdCategory,
    perm: "manage_categories",
  },
  {
    path: "/admin/delivery",
    label: "التوصيل",
    icon: MdDeliveryDining,
    perm: "manage_delivery",
  },
  {
    path: "/admin/settings",
    label: "الإعدادات",
    icon: MdSettings,
    perm: "manage_settings",
  },
  {
    path: "/admin/users",
    label: "المستخدمين",
    icon: MdManageAccounts,
    perm: "manage_users",
  },
];

function RoleBadge({ role }) {
    const config = {
      superadmin: {
        label: "مالك",
        color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      },
      admin: {
        label: "أدمن",
        color: "bg-gold-500/20 text-gold-300 border-gold-500/30",
      },
      supervisor: {
        label: "مشرف",
        color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      },
      user: {
        label: "مستخدم",
        color: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
      },
    };
    const c = config[role] || config.user;
    return (
      <span
        className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${c.color}`}
      >
        {c.label}
      </span>
    );
  }

export default function AdminLayout() {
  const restaurantName = useStore(
    (s) => s.settings?.restaurantName || "الحبايب",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, currentUser, userProfile, hasPermission, isSuperAdmin } =
    useRoleAuth();
  usePushNotifications(currentUser?.uid, userProfile?.role);

  const navItems = ALL_NAV_ITEMS.filter((item) => hasPermission(item.perm));

  // FIX: Granular selectors
  const pendingCount = useStore(
    (s) => s.orders.filter((o) => o.status === "pending").length,
  );
  const unreadCount = useStore(
    (s) => s.notifications.filter((n) => !n.read).length,
  );

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-50 h-full w-64 bg-zinc-900 border-l border-zinc-800
          flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="p-5 border-b border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
            ح
          </div>
          <div>
            <h1 className="font-bold text-gold-400 leading-none">
              {restaurantName}
            </h1>
            <p className="text-[10px] text-zinc-500 mt-0.5">لوحة الإدارة</p>
          </div>
          <button
            className="md:hidden mr-auto p-1.5"
            aria-label="إغلاق القائمة"
            onClick={() => setSidebarOpen(false)}
          >
            <MdClose className="text-zinc-400" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map(({ path, label, icon: Icon, exact }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={exact}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`text-lg flex-shrink-0 ${isActive ? "text-gold-400" : ""}`}
                      />
                      <span className="flex-1">{label}</span>
                      {path === "/admin/orders" && pendingCount > 0 && (
                        <span className="mr-auto bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                          {pendingCount > 99 ? "99+" : pendingCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-zinc-800 space-y-1">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all text-sm"
          >
            <MdHome className="text-lg" /> الموقع الرئيسي
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm"
          >
            <MdLogout className="text-lg" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="bg-zinc-900 border-b border-zinc-800 px-4 h-14 flex items-center justify-between flex-shrink-0 gap-3">
          <button
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:bg-zinc-800"
            aria-label="فتح القائمة"
            onClick={() => setSidebarOpen(true)}
          >
            <MdMenu className="text-xl" />
          </button>

          <div className="flex items-center gap-3 mr-auto">
            {/* Notifications — FIX: removed position:static bug on wrapper */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                aria-label={`الإشعارات — ${unreadCount} غير مقروء`}
                aria-expanded={notifOpen}
                className="relative p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
              >
                <MdNotifications className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <NotificationCenter
                open={notifOpen}
                onClose={() => setNotifOpen(false)}
              />
            </div>

            {/* User */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gold-500 flex items-center justify-center text-black text-xs font-bold">
                م
              </div>
              <span className="text-xs text-zinc-400 hidden sm:block truncate max-w-[120px]">
                <div className="text-right">
                  <p className="text-xs text-zinc-400 truncate max-w-[120px]">
                    {userProfile?.displayName ||
                      currentUser?.displayName ||
                      "مدير"}
                  </p>
                  <RoleBadge role={userProfile?.role} />
                </div>
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
