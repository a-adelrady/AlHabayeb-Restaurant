import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdPerson, MdEdit, MdSave, MdClose, MdShield } from "react-icons/md";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import toast from "react-hot-toast";
import { db, DEMO_MODE } from "../../services/firebase";
import { usePagination } from "../../hooks/usePagination";
import ShowMoreButton from "../../components/common/ShowMoreButton";
import { useRoleAuth, ROLE_PERMISSIONS } from "../../context/RoleAuthContext";

const ROLE_CONFIG = {
  user: {
    label: "مستخدم",
    color: "text-zinc-400",
    bg: "bg-zinc-400/10",
    border: "border-zinc-400/20",
  },
  supervisor: {
    label: "مشرف",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  admin: {
    label: "أدمن",
    color: "text-gold-400",
    bg: "bg-gold-400/10",
    border: "border-gold-400/20",
  },
  superadmin: {
    label: "مالك",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
};

const DEMO_ALL_USERS = [
  {
    uid: "demo-superadmin",
    displayName: "مالك النظام",
    email: "superadmin@alhabayeb.com",
    role: "superadmin",
    phone: "",
  },
  {
    uid: "demo-admin",
    displayName: "مدير النظام",
    email: "admin@alhabayeb.com",
    role: "admin",
    phone: "",
  },
  {
    uid: "demo-supervisor",
    displayName: "مشرف",
    email: "supervisor@alhabayeb.com",
    role: "supervisor",
    phone: "",
  },
  {
    uid: "demo-user",
    displayName: "مستخدم تجريبي",
    email: "user@alhabayeb.com",
    role: "user",
    phone: "01000000000",
  },
];

export default function AdminUsers() {
  const { updateUserRole, currentUser } = useRoleAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [saving, setSaving] = useState(false);
  const {
    paginated: paginatedUsers,
    hasMore,
    loadMore,
  } = usePagination(users, 20);

  useEffect(() => {
    if (DEMO_MODE) {
      setUsers(DEMO_ALL_USERS);
      setLoading(false);
      return;
    }

    // real-time subscription بدل one-time fetch
    const unsub = onSnapshot(
      query(collection(db, "users"), orderBy("createdAt", "desc")),
      (snap) => {
        setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
        setLoading(false);
      },
      () => {
        toast.error("فشل تحميل المستخدمين");
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  const startEdit = (user) => {
    setEditingId(user.uid);
    setNewRole(user.role);
  };

  const handleSave = async (uid) => {
    setSaving(true);
    try {
      await updateUserRole(uid, newRole);
      setUsers((us) =>
        us.map((u) => (u.uid === uid ? { ...u, role: newRole } : u)),
      );
      toast.success("تم تحديث الصلاحية");
      setEditingId(null);
    } catch {
      toast.error("فشل التحديث");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MdShield className="text-purple-400" /> إدارة المستخدمين
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          {users.length} مستخدم — متاح للمالك فقط
        </p>
      </div>

      {/* Permissions reference */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <p className="text-zinc-400 text-xs mb-3 font-medium">جدول الصلاحيات</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
            <div
              key={role}
              className={`p-3 rounded-xl border ${cfg.border} ${cfg.bg}`}
            >
              <p className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</p>
              <p className="text-zinc-600 text-[10px] mt-1">
                {ROLE_PERMISSIONS[role].length === 0
                  ? "طلبات فقط"
                  : ROLE_PERMISSIONS[role].includes("manage_users")
                    ? "كل الصلاحيات"
                    : ROLE_PERMISSIONS[role].includes("manage_products")
                      ? "إدارة كاملة"
                      : "قراءة فقط"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Users list */}
      <div className="space-y-2">
        {paginatedUsers.map((user) => {
          const cfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
          const isEditing = editingId === user.uid;
          const isSelf = user.uid === currentUser?.uid;

          return (
            <motion.div
              key={user.uid}
              layout
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4"
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}
              >
                <MdPerson className={`text-xl ${cfg.color}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-semibold text-sm">
                    {user.displayName || "بدون اسم"}
                  </p>
                  {isSelf && (
                    <span className="text-[10px] bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded-full">
                      أنت
                    </span>
                  )}
                </div>
                <p className="text-zinc-500 text-xs" dir="ltr">
                  {user.email}
                </p>
                {user.phone && (
                  <p className="text-zinc-600 text-xs">{user.phone}</p>
                )}
              </div>

              {/* Role — edit or badge */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isEditing ? (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-2 py-1.5 outline-none focus:border-gold-500"
                      >
                        {Object.entries(ROLE_CONFIG).map(([r, c]) => (
                          <option key={r} value={r}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleSave(user.uid)}
                        disabled={saving}
                        className="w-7 h-7 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center transition-all"
                      >
                        {saving ? (
                          <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <MdSave className="text-sm" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="w-7 h-7 bg-zinc-700 hover:bg-zinc-600 text-zinc-400 rounded-lg flex items-center justify-center transition-all"
                      >
                        <MdClose className="text-sm" />
                      </button>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.color} ${cfg.bg} ${cfg.border}`}
                    >
                      {cfg.label}
                    </span>
                    {!isSelf && (
                      <button
                        onClick={() => startEdit(user)}
                        className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-gold-400 rounded-lg flex items-center justify-center transition-all"
                      >
                        <MdEdit className="text-sm" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      <ShowMoreButton
        hasMore={hasMore}
        onLoadMore={loadMore}
        total={users.length}
        shown={paginatedUsers.length}
      />
    </div>
  );
}
