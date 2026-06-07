import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  MdEmail, MdPhone, MdShoppingBag,
  MdLogout, MdLocationOn, MdArrowForward, MdAccessTime,
  MdPerson
} from 'react-icons/md'
import toast from 'react-hot-toast'
import { useRoleAuth } from '../context/RoleAuthContext'
import useStore from '../store/useStore'
import { formatPrice, formatDate, getStatusLabel } from '../utils/helpers'

export default function UserProfilePage() {
  const navigate = useNavigate()
  const { currentUser, logout } = useRoleAuth()
  // FIX: granular selectors
  const orders         = useStore(s => s.orders)
  const archivedOrders = useStore(s => s.archivedOrders)
  const [loggingOut, setLoggingOut] = useState(false)

  const myOrders = [...orders, ...archivedOrders]
    .filter(o => {
      if (!currentUser) return false
      if (o.userUid) return o.userUid === currentUser.uid
      return o.customer?.phone === currentUser.phone
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const totalSpent = myOrders.reduce((s, o) => s + o.total, 0)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      toast.success('تم تسجيل الخروج')
      navigate('/')
    } catch {
      toast.error('حدث خطأ أثناء الخروج')
      setLoggingOut(false)
    }
  }

  if (!currentUser) return (
    <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pt-24 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4" role="img" aria-label="مستخدم">👤</div>
        <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-3">سجّل دخولك أولاً</h2>
        <p className="dark:text-zinc-400 text-gray-500 mb-6 text-sm">لمشاهدة طلباتك وإدارة حسابك</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/auth" className="bg-gold-500 hover:bg-gold-600 text-black font-bold px-6 py-3 rounded-xl transition-all">
            تسجيل الدخول
          </Link>
          <Link to="/auth" state={{ tab: 'register' }}
            className="dark:bg-zinc-900 bg-white border-2 dark:border-zinc-700 border-gray-200 dark:text-white text-gray-900 font-semibold px-6 py-3 rounded-xl transition-all hover:border-gold-500">
            إنشاء حساب
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Helmet>
        <title>حسابي — مطعم الحبايب</title>
      </Helmet>

      <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pt-20">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

          {/* Profile card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-gray-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gold-500/20 border-2 border-gold-500/30 flex items-center justify-center text-gold-400 text-2xl font-bold flex-shrink-0" aria-hidden="true">
                {currentUser.displayName?.slice(0, 2) || currentUser.email?.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold dark:text-white text-gray-900 truncate">
                  {currentUser.displayName || 'مستخدم'}
                </h2>
                <div className="mt-2 space-y-1">
                  {currentUser.email && (
                    <p className="flex items-center gap-2 text-sm dark:text-zinc-400 text-gray-500">
                      <MdEmail className="text-gold-400 flex-shrink-0" aria-hidden="true" />
                      <span dir="ltr" className="truncate">{currentUser.email}</span>
                    </p>
                  )}
                  {currentUser.phone && (
                    <p className="flex items-center gap-2 text-sm dark:text-zinc-400 text-gray-500">
                      <MdPhone className="text-gold-400 flex-shrink-0" aria-hidden="true" />
                      <span dir="ltr">{currentUser.phone}</span>
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-1.5 text-red-400 hover:text-red-500 disabled:opacity-60 text-sm font-medium transition-colors flex-shrink-0"
              >
                {loggingOut
                  ? <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                  : <MdLogout className="text-lg" />
                }
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t dark:border-zinc-800 border-gray-100">
              {[
                { label: 'إجمالي الطلبات', value: myOrders.length,                                       color: 'text-gold-400' },
                { label: 'المكتملة',        value: myOrders.filter(o => o.status === 'delivered').length, color: 'text-green-400' },
                { label: 'إجمالي الإنفاق', value: formatPrice(totalSpent),                               color: 'text-blue-400' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs dark:text-zinc-500 text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Orders list */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="font-bold dark:text-white text-gray-900 text-lg mb-4 flex items-center gap-2">
              <MdShoppingBag className="text-gold-500" aria-hidden="true" /> طلباتي
            </h3>

            {myOrders.length === 0 ? (
              <div className="dark:bg-zinc-900 bg-white rounded-2xl border dark:border-zinc-800 border-gray-100 py-14 text-center">
                <div className="text-5xl mb-3" role="img" aria-label="طعام">🍽️</div>
                <p className="dark:text-zinc-400 text-gray-500 text-sm mb-4">لم تطلب أي شيء بعد!</p>
                <Link to="/menu" className="bg-gold-500 hover:bg-gold-600 text-black font-bold px-6 py-2.5 rounded-xl text-sm inline-block transition-all">
                  تصفح المنيو
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myOrders.map((order, i) => {
                  const st = getStatusLabel(order.status)
                  return (
                    <motion.article key={order.id}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="dark:bg-zinc-900 bg-white rounded-2xl border dark:border-zinc-800 border-gray-100 p-4 hover:border-gold-500/30 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="font-mono text-gold-400 text-xs font-bold">{order.id}</span>
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${st.color} ${st.bg}`}>{st.text}</span>
                          </div>
                          <div className="space-y-0.5">
                            {order.items.slice(0, 2).map((item, j) => (
                              <p key={j} className="text-sm dark:text-zinc-300 text-gray-700 truncate">
                                • {item.name} × {item.quantity}
                              </p>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-xs dark:text-zinc-500 text-gray-400">
                                و {order.items.length - 2} أصناف أخرى...
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-2 text-xs dark:text-zinc-500 text-gray-400">
                            <MdAccessTime className="text-sm" aria-hidden="true" />
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-gold-500">{formatPrice(order.total)}</p>
                          <Link to={`/track-order/${order.id}`}
                            className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 transition-colors mt-1">
                            تتبع <MdArrowForward className="rotate-180 text-sm" />
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Quick links */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3">
            <Link to="/menu"
              className="dark:bg-zinc-900 bg-white rounded-2xl border dark:border-zinc-800 border-gray-100 p-4 flex items-center gap-3 hover:border-gold-500/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center group-hover:bg-gold-500/20 transition-colors">
                <MdShoppingBag className="text-gold-400 text-xl" />
              </div>
              <span className="font-semibold dark:text-white text-gray-900 text-sm">تصفح المنيو</span>
            </Link>
            <Link to="/track-order"
              className="dark:bg-zinc-900 bg-white rounded-2xl border dark:border-zinc-800 border-gray-100 p-4 flex items-center gap-3 hover:border-gold-500/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <MdLocationOn className="text-blue-400 text-xl" />
              </div>
              <span className="font-semibold dark:text-white text-gray-900 text-sm">تتبع طلب</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  )
}
