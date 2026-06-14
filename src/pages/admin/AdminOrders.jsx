import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdSearch,
  MdExpandMore,
  MdExpandLess,
  MdWhatsapp,
  MdArchive,
  MdShoppingBag,
} from "react-icons/md";
import toast from "react-hot-toast";
import useStore from "../../store/useStore";
import { formatPrice, formatDate, getStatusLabel } from "../../utils/helpers";
import { usePagination } from "../../hooks/usePagination";
import ShowMoreButton from "../../components/common/ShowMoreButton";

const STATUS_OPTS = [
  { value: "all", label: "الكل" },
  { value: "pending", label: "في الانتظار" },
  { value: "preparing", label: "قيد التحضير" },
  { value: "on_the_way", label: "في الطريق" },
  { value: "cancelled", label: "ملغي" },
];

const NEXT_STATUS = {
  pending: "preparing",
  preparing: "on_the_way",
  on_the_way: "delivered",
};

export default function AdminOrders() {
  // FIX: granular selectors
  const orders = useStore((s) => s.orders);
  const archivedOrders = useStore((s) => s.archivedOrders);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);

  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const [filterSt, setFilterSt] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const currentOrders = activeTab === "active" ? orders : archivedOrders;

  const filtered = useMemo(
    () =>
      currentOrders.filter((o) => {
        const matchSt = filterSt === "all" || o.status === filterSt;
        const q = search.toLowerCase();
        const matchQ =
          !search ||
          o.id.toLowerCase().includes(q) ||
          o.customer.name.includes(search) ||
          o.customer.phone.includes(search);
        return matchSt && matchQ;
      }),
    [currentOrders, search, filterSt],
  );

  const PAGE_SIZE = 10;
  const {
    paginated: paginatedOrders,
    hasMore,
    loadMore,
    reset,
  } = usePagination(filtered, PAGE_SIZE);

  // reset pagination لما يتغير الفلتر أو البحث
  useEffect(() => {
    reset();
  }, [activeTab, filterSt, search]);

  const handleStatus = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    toast.success(`تم التحديث: ${getStatusLabel(newStatus).text}`);
    if (newStatus === "delivered") setExpandedId(null);
  };

  // FIX: build WhatsApp contact URL correctly — strip leading 0 and add Egypt code
  const buildContactUrl = (phone) => {
    const cleaned = phone.replace(/[\s\-()]/g, "");
    const normalized = cleaned.startsWith("0")
      ? `20${cleaned.slice(1)}`
      : cleaned;
    return `https://wa.me/${normalized}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة الطلبات</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {orders.length} نشط · {archivedOrders.length} أرشيف
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2" role="tablist">
        {[
          {
            id: "active",
            label: "الطلبات النشطة",
            icon: MdShoppingBag,
            count: orders.length,
          },
          {
            id: "archived",
            label: "الأرشيف",
            icon: MdArchive,
            count: archivedOrders.length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setFilterSt("all");
              setSearch("");
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-gold-500 text-black"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            <tab.icon className="text-base" />
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-black/20" : "bg-zinc-700 text-zinc-300"}`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xl" />
          <input
            type="search"
            placeholder="بحث بالاسم / هاتف / رقم طلب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="بحث في الطلبات"
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 outline-none focus:border-gold-500 text-sm"
          />
        </div>
        {activeTab === "active" && (
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterSt(opt.value)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${filterSt === opt.value ? "bg-gold-500 text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl py-16 text-center">
          <MdShoppingBag className="text-5xl text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">لا توجد طلبات</p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-gold-400 text-xs mt-2 hover:text-gold-300"
            >
              مسح البحث
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedOrders.map((order) => {
            const st = getStatusLabel(order.status);
            const expanded = expandedId === order.id;
            const next = NEXT_STATUS[order.status];
            return (
              <>
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors"
                >
                  {/* Row header */}
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      setExpandedId(expanded ? null : order.id)
                    }
                    className="p-4 flex items-center gap-3 cursor-pointer hover:bg-zinc-800/40 transition-colors"
                    onClick={() => setExpandedId(expanded ? null : order.id)}
                    aria-expanded={expanded}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-gold-400 text-xs font-bold">
                          {order.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-lg text-xs font-medium ${st.color} ${st.bg}`}
                        >
                          {st.text}
                        </span>
                      </div>
                      <p className="text-white font-semibold text-sm">
                        {order.customer.name}
                      </p>
                      <p className="text-zinc-500 text-xs">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 mr-2">
                      <p className="font-bold text-gold-400 text-sm">
                        {formatPrice(order.total)}
                      </p>
                      <p className="text-zinc-600 text-xs">
                        {order.items.length} صنف
                      </p>
                    </div>
                    {expanded ? (
                      <MdExpandLess className="text-zinc-500 text-xl flex-shrink-0" />
                    ) : (
                      <MdExpandMore className="text-zinc-500 text-xl flex-shrink-0" />
                    )}
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-zinc-800 p-4 space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            {/* Customer info */}
                            <div>
                              <p className="text-zinc-500 text-xs mb-2 font-medium">
                                بيانات العميل
                              </p>
                              <div className="space-y-1">
                                <p className="text-white text-sm font-semibold">
                                  {order.customer.name}
                                </p>
                                <p className="text-zinc-400 text-sm" dir="ltr">
                                  {order.customer.phone}
                                </p>
                                <p className="text-zinc-400 text-sm">
                                  {order.customer.address}
                                </p>
                                {order.zone && (
                                  <p className="text-zinc-500 text-xs bg-zinc-800 px-2 py-1 rounded-lg inline-block">
                                    📍 {order.zone.name}
                                  </p>
                                )}
                                {order.customer.notes && (
                                  <p className="text-zinc-500 text-xs bg-zinc-800 p-2 rounded-lg">
                                    ملاحظات: {order.customer.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            {/* Items */}
                            <div>
                              <p className="text-zinc-500 text-xs mb-2 font-medium">
                                المنتجات
                              </p>
                              <div className="space-y-1.5">
                                {order.items.map((item, i) => (
                                  <div
                                    key={i}
                                    className="flex justify-between text-sm bg-zinc-800 px-3 py-2 rounded-lg"
                                  >
                                    <span className="text-zinc-300">
                                      {item.name} × {item.quantity}
                                    </span>
                                    <span className="text-white font-medium">
                                      {formatPrice(item.price * item.quantity)}
                                    </span>
                                  </div>
                                ))}
                                {order.deliveryFee > 0 && (
                                  <div className="flex justify-between text-xs text-zinc-500 px-1">
                                    <span>رسوم التوصيل</span>
                                    <span>
                                      {formatPrice(order.deliveryFee)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between text-sm pt-1 border-t border-zinc-700">
                                  <span className="text-zinc-400 font-medium">
                                    الإجمالي
                                  </span>
                                  <span className="font-bold text-gold-400">
                                    {formatPrice(order.total)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          {activeTab === "active" && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800 overflow-x-auto">
                              {next && (
                                <button
                                  onClick={() => handleStatus(order.id, next)}
                                  className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-black font-bold px-4 py-2 rounded-xl text-sm transition-all"
                                >
                                  ← {getStatusLabel(next).text}
                                </button>
                              )}
                              {order.status !== "cancelled" &&
                                order.status !== "delivered" && (
                                  <button
                                    onClick={() =>
                                      handleStatus(order.id, "cancelled")
                                    }
                                    className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium px-4 py-2 rounded-xl text-sm transition-all"
                                  >
                                    إلغاء
                                  </button>
                                )}
                              <a
                                href={buildContactUrl(order.customer.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 font-medium px-4 py-2 rounded-xl text-sm transition-all mr-auto"
                              >
                                <MdWhatsapp /> تواصل
                              </a>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <ShowMoreButton
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                  total={filtered.length}
                  shown={paginatedOrders.length}
                />
              </>
            );
          })}
        </div>
      )}
    </div>
  );
}
