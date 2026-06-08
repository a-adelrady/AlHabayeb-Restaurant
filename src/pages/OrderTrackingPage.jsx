import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MdSearch, MdRadioButtonUnchecked, MdAccessTime } from "react-icons/md";
import useStore from "../store/useStore";
import { db, DEMO_MODE } from "../services/firebase";
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getStatusLabel, formatDate, formatPrice } from "../utils/helpers";

const STEPS = [
  { status: "pending", label: "تم استلام الطلب", icon: "📋" },
  { status: "preparing", label: "قيد التحضير", icon: "👨‍🍳" },
  { status: "on_the_way", label: "في الطريق إليك", icon: "🛵" },
  { status: "delivered", label: "تم التوصيل", icon: "✅" },
];
const STEP_IDX = {
  pending: 0,
  preparing: 1,
  on_the_way: 2,
  delivered: 3,
};

// جيب الأوردر من Firestore مباشرة
async function fetchFromFirestore(orderId) {
  try {
    const snap = await getDoc(doc(db, "orders", orderId));
    if (snap.exists()) return { ...snap.data(), id: snap.id };
    const arch = await getDoc(doc(db, "archivedOrders", orderId));
    if (arch.exists()) return { ...arch.data(), id: arch.id };
    return null;
  } catch {
    return null;
  }
}

export default function OrderTrackingPage() {
  const { orderId: paramId } = useParams();
  const navigate = useNavigate();
  const getOrderById = useStore((s) => s.getOrderById);

  const [input, setInput] = useState(paramId || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!paramId);
  const [searched, setSearched] = useState(false);

  // ── تحميل الأوردر عند فتح الصفحة ──────────────────────────────────────
  useEffect(() => {
    if (!paramId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      // 1. جرب Zustand أولاً (سريع)
      const local = getOrderById(paramId);
      if (local) setOrder(local);

      if (DEMO_MODE) {
        setLoading(false);
        setSearched(true);
        return;
      }

      // 2. جيب من Firestore (دايماً الأحدث)
      const fresh = await fetchFromFirestore(paramId);
      if (fresh) setOrder(fresh);
      setLoading(false);
      setSearched(true);
    };

    load();
  }, [paramId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Real-time subscription ──────────────────────────────────────────────
  // بيشتغل على orders collection
  // لو الـ orderId موجود حتى لو order = null في البداية
  useEffect(() => {
    const id = order?.id || paramId;
    if (!id || DEMO_MODE) return;

    // لو الأوردر delivered/cancelled مش محتاج subscription
    if (order?.status === "delivered" || order?.status === "cancelled") return;

    const unsub = onSnapshot(
      doc(db, "orders", id),
      async (snap) => {
        if (snap.exists()) {
          // تحديث فوري من Firestore
          setOrder(snap.data() ? { ...snap.data(), id: snap.id } : null);
        } else {
          // اختفى من orders → اتأرشف
          const archived = await fetchFromFirestore(id);
          if (archived) setOrder(archived);
        }
      },
      (err) => {
        if (err.code !== "permission-denied") {
          console.error("Tracking error:", err);
        }
      },
    );

    return () => unsub();
  }, [order?.id, paramId, order?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── البحث اليدوي ────────────────────────────────────────────────────────
  const handleSearch = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmed = input.trim().toUpperCase();
      if (!trimmed) return;

      setLoading(true);
      setOrder(null);

      // Zustand أولاً
      const local = getOrderById(trimmed);
      if (local) setOrder(local);

      if (!DEMO_MODE) {
        const fresh = await fetchFromFirestore(trimmed);
        if (fresh) setOrder(fresh);
        else if (!local) setOrder(null);
      } else if (!local) {
        setOrder(null);
      }

      setSearched(true);
      setLoading(false);
      navigate(`/track-order/${trimmed}`, { replace: true });
    },
    [input, getOrderById, navigate],
  );

  const currentStep = order ? (STEP_IDX[order.status] ?? -1) : -1;
  const statusInfo = order ? getStatusLabel(order.status) : null;

  return (
    <>
      <Helmet>
        <title>تتبع طلبك — مطعم الحبايب</title>
        <meta
          name="description"
          content="تتبع حالة طلبك من مطعم الحبايب في الوقت الفعلي"
        />
      </Helmet>

      <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pt-20">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
              تتبع طلبك
            </h1>
            <p className="dark:text-zinc-400 text-gray-500">
              أدخل رقم الطلب لمعرفة حالته
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <div className="flex-1">
              <input
                type="text"
                placeholder="أدخل رقم الطلب (مثال: HAB-xxx)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                dir="ltr"
                autoCapitalize="characters"
                className="w-full px-4 py-3.5 rounded-xl dark:bg-zinc-900 bg-white border-2 dark:border-zinc-700 border-gray-200 dark:text-white text-gray-900 placeholder-zinc-500 outline-none focus:border-gold-500 transition-colors text-sm"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-black font-bold px-5 py-3 rounded-xl transition-all flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <MdSearch className="text-xl" />
              )}
              بحث
            </motion.button>
          </form>

          {loading && (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="dark:text-zinc-400 text-gray-500 text-sm">
                جاري البحث...
              </p>
            </div>
          )}

          {!loading && searched && !order && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold dark:text-white text-gray-900 mb-2">
                الطلب غير موجود
              </h3>
              <p className="dark:text-zinc-400 text-gray-500 text-sm">
                تأكد من رقم الطلب وحاول مرة أخرى
              </p>
            </motion.div>
          )}

          {!loading && order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Header */}
              <div className="dark:bg-zinc-900 bg-white rounded-2xl p-6 border dark:border-zinc-800 border-gray-100">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm dark:text-zinc-400 text-gray-500 mb-1">
                      رقم الطلب
                    </p>
                    <p className="font-mono font-bold text-gold-400 text-sm">
                      {order.id}
                    </p>
                  </div>
                  <motion.span
                    key={order.status}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`px-3 py-1.5 rounded-full text-sm font-bold ${statusInfo?.color} ${statusInfo?.bg}`}
                  >
                    {statusInfo?.text}
                  </motion.span>
                </div>
                <div className="flex items-center gap-2 text-xs dark:text-zinc-500 text-gray-400">
                  <MdAccessTime className="text-base" />
                  {formatDate(order.createdAt)}
                </div>
              </div>

              {/* Steps */}
              {order.status !== "cancelled" ? (
                <div className="dark:bg-zinc-900 bg-white rounded-2xl p-6 border dark:border-zinc-800 border-gray-100">
                  <h3 className="font-bold dark:text-white text-gray-900 mb-6">
                    مسار الطلب
                  </h3>
                  <ol className="relative space-y-6">
                    <div
                      className="absolute right-5 top-5 bottom-5 w-0.5 dark:bg-zinc-700 bg-gray-200"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute right-5 top-5 w-0.5 bg-gold-500 transition-all duration-1000"
                      style={{
                        height: `${currentStep <= 0 ? 0 : (currentStep / (STEPS.length - 1)) * 100}%`,
                      }}
                      aria-hidden="true"
                    />
                    {STEPS.map((step, idx) => {
                      const done = idx <= currentStep;
                      const active = idx === currentStep;
                      return (
                        <li
                          key={step.status}
                          className="flex items-center gap-4 relative"
                        >
                          <motion.div
                            key={`${step.status}-${done}`}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: active ? 1.1 : 1 }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0 text-lg
                              ${done ? "bg-gold-500" : "dark:bg-zinc-800 bg-gray-100"}
                              ${active ? "ring-4 ring-gold-500/30" : ""}`}
                          >
                            {done ? (
                              active ? (
                                step.icon
                              ) : (
                                "✓"
                              )
                            ) : (
                              <MdRadioButtonUnchecked className="text-zinc-500 text-lg" />
                            )}
                          </motion.div>
                          <div>
                            <p
                              className={`font-semibold text-sm
                              ${
                                done
                                  ? "dark:text-white text-gray-900"
                                  : "dark:text-zinc-500 text-gray-400"
                              }`}
                            >
                              {step.label}
                            </p>
                            {active && (
                              <p className="text-xs text-gold-500 mt-0.5 animate-pulse">
                                جاري الآن...
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ) : (
                <div className="dark:bg-zinc-900 bg-white rounded-2xl p-6 border border-red-500/30 text-center">
                  <div className="text-4xl mb-3">❌</div>
                  <p className="font-bold text-red-400 text-lg">
                    تم إلغاء الطلب
                  </p>
                </div>
              )}

              {/* Items */}
              <div className="dark:bg-zinc-900 bg-white rounded-2xl p-6 border dark:border-zinc-800 border-gray-100">
                <h3 className="font-bold dark:text-white text-gray-900 mb-4">
                  تفاصيل الطلب
                </h3>
                <div className="space-y-2.5 mb-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="dark:text-zinc-300 text-gray-700">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium dark:text-white text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between text-xs text-zinc-500 mb-1">
                    <span>رسوم التوصيل</span>
                    <span>{formatPrice(order.deliveryFee)}</span>
                  </div>
                )}
                <div className="border-t dark:border-zinc-800 border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold dark:text-white text-gray-900">
                    الإجمالي
                  </span>
                  <span className="font-bold text-gold-500">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
