import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MdShoppingBag,
  MdCheckCircle,
  MdPending,
  MdAttachMoney,
  MdTrendingUp,
  MdPeople,
  MdRestaurantMenu,
  MdArrowForward,
  MdStar,
  MdLocalShipping,
  MdToday,
  MdDateRange,
  MdCalendarMonth,
} from "react-icons/md";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import useStore from "../../store/useStore";
import {
  formatPrice,
  getStatusLabel,
  formatDateShort,
} from "../../utils/helpers";

const PIE_COLORS = ["#C8960C", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444"];

function StatCard({ label, value, icon: Icon, color, bg, border, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-zinc-900 border ${border} rounded-2xl p-4`}
    >
      <div
        className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}
      >
        <Icon className={`text-xl ${color}`} />
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-zinc-500 text-xs mt-0.5">{label}</p>
      {sub && <p className="text-zinc-600 text-[10px] mt-0.5">{sub}</p>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  // FIX: granular selectors
  const orders = useStore((s) => s.orders);
  const archivedOrders = useStore((s) => s.archivedOrders);
  const products = useStore((s) => s.products);

  const allOrders = useMemo(
    () => [...orders, ...archivedOrders],
    [orders, archivedOrders],
  );

  // FIX: `now` was defined OUTSIDE useMemo, making the date comparisons in
  // stats/salesChart stale on re-renders that happen across midnight.
  // Move it inside useMemo so it's always computed fresh.
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const weekAgo = new Date(now - 7 * 864e5);
    const monthAgo = new Date(now - 30 * 864e5);

    const ordersToday = allOrders.filter(
      (o) => new Date(o.createdAt).toDateString() === todayStr,
    );
    const ordersWeek = allOrders.filter(
      (o) => new Date(o.createdAt) >= weekAgo,
    );
    const ordersMonth = allOrders.filter(
      (o) => new Date(o.createdAt) >= monthAgo,
    );

    const revToday = ordersToday.reduce((s, o) => s + o.total, 0);
    const revWeek = ordersWeek.reduce((s, o) => s + o.total, 0);
    const revMonth = ordersMonth.reduce((s, o) => s + o.total, 0);

    const delivered = allOrders.filter((o) => o.status === "delivered").length;
    const cancelled = allOrders.filter((o) => o.status === "cancelled").length;
    const successRate =
      allOrders.length > 0
        ? Math.round((delivered / Math.max(delivered + cancelled, 1)) * 100)
        : 0;

    const productSales = {};
    allOrders.forEach((o) =>
      o.items.forEach((i) => {
        productSales[i.name] = (productSales[i.name] || 0) + i.quantity;
      }),
    );
    const bestSelling = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({
        name: name.length > 12 ? name.slice(0, 12) + "…" : name,
        qty,
      }));

    const phoneCounts = {};
    allOrders.forEach((o) => {
      phoneCounts[o.customer.phone] = (phoneCounts[o.customer.phone] || 0) + 1;
    });
    const repeatCustomers = Object.values(phoneCounts).filter(
      (c) => c > 1,
    ).length;

    return {
      ordersToday: ordersToday.length,
      revToday,
      ordersWeek: ordersWeek.length,
      revWeek,
      ordersMonth: ordersMonth.length,
      revMonth,
      pending: orders.filter((o) => o.status === "pending").length,
      delivered,
      cancelled,
      successRate,
      customers: Object.keys(phoneCounts).length,
      repeatCustomers,
      bestSelling,
    };
  }, [allOrders, orders]);

  const salesChart = useMemo(() => {
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 864e5);
      const dayOrders = allOrders.filter(
        (o) => new Date(o.createdAt).toDateString() === d.toDateString(),
      );
      days.push({
        name: formatDateShort(d.toISOString()),
        مبيعات: dayOrders.reduce((s, o) => s + o.total, 0),
        طلبات: dayOrders.length,
      });
    }
    return days;
  }, [allOrders]);

  const statusPie = useMemo(() => {
    const counts = {};
    allOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      name: getStatusLabel(status).text,
      value,
    }));
  }, [allOrders]);

  const statCards = [
    {
      label: "طلبات اليوم",
      value: stats.ordersToday,
      icon: MdToday,
      color: "text-gold-400",
      bg: "bg-gold-400/10",
      border: "border-gold-400/20",
      sub: formatPrice(stats.revToday),
    },
    {
      label: "طلبات الأسبوع",
      value: stats.ordersWeek,
      icon: MdDateRange,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
      sub: formatPrice(stats.revWeek),
    },
    {
      label: "طلبات الشهر",
      value: stats.ordersMonth,
      icon: MdCalendarMonth,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20",
      sub: formatPrice(stats.revMonth),
    },
    {
      label: "في الانتظار",
      value: stats.pending,
      icon: MdPending,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/20",
    },
    {
      label: "مكتمل",
      value: stats.delivered,
      icon: MdCheckCircle,
      color: "text-green-400",
      bg: "bg-green-400/10",
      border: "border-green-400/20",
    },
    {
      label: "نسبة النجاح",
      value: `${stats.successRate}%`,
      icon: MdLocalShipping,
      color: "text-teal-400",
      bg: "bg-teal-400/10",
      border: "border-teal-400/20",
    },
    {
      label: "إجمالي العملاء",
      value: stats.customers,
      icon: MdPeople,
      color: "text-pink-400",
      bg: "bg-pink-400/10",
      border: "border-pink-400/20",
      sub: `${stats.repeatCustomers} عميل متكرر`,
    },
    {
      label: "المنتجات",
      value: products.length,
      icon: MdRestaurantMenu,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      border: "border-indigo-400/20",
    },
    {
      label: "إيرادات الشهر",
      value: formatPrice(stats.revMonth),
      icon: MdAttachMoney,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
        <p className="text-zinc-400 text-sm mt-1">نظرة عامة على نشاط المطعم</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map((c, i) => (
          <StatCard key={i} {...c} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Sales area chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white">المبيعات — آخر 7 أيام</h2>
            <MdTrendingUp className="text-gold-400 text-xl" />
          </div>
          {allOrders.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-zinc-600 text-sm">
              لا توجد بيانات بعد
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={salesChart}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8960C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C8960C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: 8,
                    fontFamily: "Cairo",
                  }}
                  labelStyle={{ color: "#a1a1aa" }}
                  itemStyle={{ color: "#C8960C" }}
                />
                <Area
                  type="monotone"
                  dataKey="مبيعات"
                  stroke="#C8960C"
                  strokeWidth={2}
                  fill="url(#sg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Status pie */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
        >
          <h2 className="font-bold text-white mb-4">توزيع الطلبات</h2>
          {statusPie.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-zinc-600 text-sm">
              لا توجد بيانات
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={statusPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPie.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: 8,
                    fontFamily: "Cairo",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontFamily: "Cairo",
                    fontSize: 11,
                    color: "#a1a1aa",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Best selling products */}
      {stats.bestSelling.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white flex items-center gap-2">
              <MdStar className="text-gold-400" /> أكثر المنتجات مبيعاً
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.bestSelling} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: 8,
                  fontFamily: "Cairo",
                }}
                itemStyle={{ color: "#C8960C" }}
              />
              <Bar dataKey="qty" fill="#C8960C" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Recent orders table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white">آخر الطلبات</h2>
          <Link
            to="/admin/orders"
            className="text-gold-400 hover:text-gold-300 text-sm flex items-center gap-1"
          >
            عرض الكل <MdArrowForward className="rotate-180" />
          </Link>
        </div>
        {allOrders.length === 0 ? (
          <div className="text-center py-12 text-zinc-600">
            <MdShoppingBag className="text-4xl mx-auto mb-2 opacity-30" />
            <p className="text-sm">لا توجد طلبات بعد</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm" aria-label="آخر الطلبات">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {[
                      "رقم الطلب",
                      "العميل",
                      "الإجمالي",
                      "الحالة",
                      "التاريخ",
                    ].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="text-right py-3 px-2 text-zinc-500 font-medium text-xs"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allOrders.slice(0, 8).map((order) => {
                    const st = getStatusLabel(order.status);
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="py-3 px-2 font-mono text-gold-400 text-xs">
                          {order.id}
                        </td>
                        <td className="py-3 px-2 text-zinc-300">
                          {order.customer.name}
                        </td>
                        <td className="py-3 px-2 text-white font-semibold">
                          {formatPrice(order.total)}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-medium ${st.color} ${st.bg}`}
                          >
                            {st.text}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-zinc-500 text-xs whitespace-nowrap">
                          {formatDateShort(order.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {allOrders.slice(0, 8).map((order) => {
                const st = getStatusLabel(order.status);
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl"
                  >
                    <div>
                      <p className="font-mono text-gold-400 text-xs">
                        {order.id}
                      </p>
                      <p className="text-zinc-300 text-sm font-medium">
                        {order.customer.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">
                        {formatPrice(order.total)}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-lg font-medium ${st.color} ${st.bg}`}
                      >
                        {st.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
