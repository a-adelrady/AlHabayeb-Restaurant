import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MdSearch,
  MdPeople,
  MdPhone,
  MdShoppingBag,
  MdAttachMoney,
  MdRepeat,
} from "react-icons/md";
import useStore from "../../store/useStore";
import { formatPrice, formatDate } from "../../utils/helpers";
import { usePagination } from "../../hooks/usePagination";
import ShowMoreButton from "../../components/common/ShowMoreButton";

export default function AdminCustomers() {
  // FIX: granular selectors
  const orders = useStore((s) => s.orders);
  const archivedOrders = useStore((s) => s.archivedOrders);
  const [search, setSearch] = useState("");

  const allOrders = useMemo(
    () => [...orders, ...archivedOrders],
    [orders, archivedOrders],
  );

  const customers = useMemo(() => {
    const map = {};
    allOrders.forEach((order) => {
      const key = order.customer.phone;
      if (!map[key]) {
        map[key] = {
          name: order.customer.name,
          phone: order.customer.phone,
          orders: [],
          totalSpent: 0,
          firstOrder: order.createdAt,
          lastOrder: order.createdAt,
        };
      }
      map[key].orders.push(order);
      map[key].totalSpent += order.total;
      if (new Date(order.createdAt) < new Date(map[key].firstOrder))
        map[key].firstOrder = order.createdAt;
      if (new Date(order.createdAt) > new Date(map[key].lastOrder))
        map[key].lastOrder = order.createdAt;
    });
    return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [allOrders]);

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) => !search || c.name.includes(search) || c.phone.includes(search),
      ),
    [customers, search],
  );
  
  const {
    paginated: paginatedCustomers,
    hasMore,
    loadMore,
    reset,
  } = usePagination(filtered, 15);

  useEffect(() => {
    reset();
  }, [search]);

  const totalRevenue = useMemo(
    () => customers.reduce((s, c) => s + c.totalSpent, 0),
    [customers],
  );
  const repeatCusts = useMemo(
    () => customers.filter((c) => c.orders.length > 1).length,
    [customers],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">إدارة العملاء</h1>
        <p className="text-zinc-400 text-sm mt-1">{customers.length} عميل</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "إجمالي العملاء",
            value: customers.length,
            icon: MdPeople,
            color: "text-gold-400",
          },
          {
            label: "العملاء المتكررين",
            value: repeatCusts,
            icon: MdRepeat,
            color: "text-blue-400",
          },
          {
            label: "إجمالي الطلبات",
            value: allOrders.length,
            icon: MdShoppingBag,
            color: "text-purple-400",
          },
          {
            label: "إجمالي الإيرادات",
            value: formatPrice(totalRevenue),
            icon: MdAttachMoney,
            color: "text-green-400",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <s.icon className={`text-xl ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-lg font-bold ${s.color} truncate`}>
                {s.value}
              </p>
              <p className="text-zinc-500 text-xs">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="relative">
          <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xl" />
          <input
            type="search"
            placeholder="بحث بالاسم أو رقم الموبايل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="بحث في العملاء"
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 outline-none focus:border-gold-500 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl py-16 text-center">
          <MdPeople className="text-5xl text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">
            {search ? `لا يوجد عملاء يطابقون "${search}"` : "لا يوجد عملاء بعد"}
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" aria-label="قائمة العملاء">
              <thead>
                <tr className="border-b border-zinc-800">
                  {[
                    "#",
                    "العميل",
                    "الموبايل",
                    "الطلبات",
                    "الإنفاق",
                    "آخر طلب",
                  ].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="text-right py-3 px-4 text-zinc-500 font-medium text-xs"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((c, i) => (
                  <motion.tr
                    key={c.phone}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-4 px-4 text-zinc-600 text-sm">{i + 1}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400 text-sm font-bold flex-shrink-0"
                          aria-hidden="true"
                        >
                          {c.name.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {c.name}
                          </p>
                          {c.orders.length > 1 && (
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-full">
                              متكرر
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <a
                        href={`tel:${c.phone}`}
                        className="text-zinc-400 hover:text-gold-400 transition-colors text-sm flex items-center gap-1.5"
                      >
                        <MdPhone className="text-base flex-shrink-0" />
                        <span dir="ltr">{c.phone}</span>
                      </a>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-lg text-sm font-bold">
                        {c.orders.length}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-gold-400 text-sm">
                      {formatPrice(c.totalSpent)}
                    </td>
                    <td className="py-4 px-4 text-zinc-500 text-xs whitespace-nowrap">
                      {formatDate(c.lastOrder)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <ShowMoreButton
            hasMore={hasMore}
            onLoadMore={loadMore}
            total={filtered.length}
            shown={paginatedCustomers.length}
          />
        </div>
      )}
    </div>
  );
}
