import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdClose,
  MdShoppingBag,
  MdCheckCircle,
  MdCancel,
  MdDoneAll,
} from "react-icons/md";
import useStore from "../../store/useStore";
import { formatDate } from "../../utils/helpers";

const NOTIF_ICONS = {
  new_order: {
    icon: MdShoppingBag,
    color: "text-gold-400",
    bg: "bg-gold-400/10",
  },
  order_delivered: {
    icon: MdCheckCircle,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  order_cancelled: {
    icon: MdCancel,
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
};

const NOTIF_TEXT = {
  new_order: (n) => `طلب جديد من ${n.customerName} — ${n.total} ج.م`,
  order_delivered: (n) => `تم توصيل الطلب ${n.orderId}`,
  order_cancelled: (n) => `تم إلغاء الطلب ${n.orderId}`,
};

export default function NotificationCenter({ open, onClose }) {
  // FIX: granular selectors
  const notifications = useStore((s) => s.notifications);
  const markNotificationRead = useStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useStore((s) => s.markAllNotificationsRead);

  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  // FIX: also close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="مركز الإشعارات"
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.18 }}
          // FIX: removed `style={{ right: 'auto' }}` which conflicted with Tailwind positioning.
          // Now uses Tailwind classes only. The notification panel is anchored to the top bar.
          className="absolute top-full left-0 mt-2 w-80 max-w-[calc(100vw-1rem)] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <h3 className="font-bold text-white text-sm">الإشعارات</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  await markAllNotificationsRead();
                }}
                className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1"
                aria-label="تعيين الكل كمقروء"
              >
                <MdDoneAll className="text-base" /> قراءة الكل
              </button>
              <button
                onClick={onClose}
                aria-label="إغلاق الإشعارات"
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500"
              >
                <MdClose className="text-base" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-zinc-600 text-sm">
                <MdShoppingBag className="text-3xl mx-auto mb-2 opacity-30" />
                لا توجد إشعارات
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => {
                const cfg = NOTIF_ICONS[n.type] || NOTIF_ICONS.new_order;
                const Icon = cfg.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 transition-colors border-b border-zinc-800/50 last:border-0 text-right
                      ${n.read ? "opacity-50" : "hover:bg-zinc-800/50"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                    >
                      <Icon className={`text-sm ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium leading-snug">
                        {NOTIF_TEXT[n.type]?.(n) || "إشعار جديد"}
                      </p>
                      <p className="text-zinc-600 text-[10px] mt-0.5">
                        {formatDate(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <span
                        className="w-2 h-2 rounded-full bg-gold-400 flex-shrink-0 mt-1 ml-1"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
