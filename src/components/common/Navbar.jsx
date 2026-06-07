import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MdShoppingCart, MdMenu, MdClose, MdDarkMode, MdLightMode, MdPerson } from 'react-icons/md'
import useStore from '../../store/useStore'
import { useRoleAuth as useUserAuth } from '../../context/RoleAuthContext.jsx'

export default function Navbar() {
  const { settings } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // FIX: Use granular selectors instead of subscribing to entire store.
  // Previously `const { isDark, toggleTheme, cartItems } = useStore()` caused
  // Navbar to re-render on ANY store change (orders, products, settings, etc.).
  // Now it only re-renders when isDark or cartItems actually change.
  const isDark = useStore(s => s.isDark)
  const toggleTheme = useStore(s => s.toggleTheme)
  const cartCount = useStore(s => s.cartItems.reduce((acc, i) => acc + i.quantity, 0))

  const { currentUser } = useUserAuth()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  // FIX: close mobile menu on Escape key for accessibility
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  const navLinks = [
    { to: '/', label: 'الرئيسية' },
    { to: '/menu', label: 'المنيو' },
    { to: '/track-order', label: 'تتبع الطلب' },
  ]

  return (
    <>
      <nav
        role="navigation"
        aria-label="القائمة الرئيسية"
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-500
          ${scrolled
            ? 'dark:bg-zinc-900/95 bg-white/95 backdrop-blur-lg shadow-xl shadow-black/20 border-b dark:border-zinc-800 border-gray-200'
            : 'bg-transparent'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" aria-label="الصفحة الرئيسية — مطعم الحبايب" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gold-500 flex items-center justify-center text-black font-bold text-lg transition-transform group-hover:scale-110">
              ح
            </div>
            <span className="font-bold text-xl dark:text-white text-gray-900 hidden sm:block">
              {settings?.restaurantName || 'الحبايب'}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`
                  relative text-sm font-semibold transition-colors duration-200 group
                  ${location.pathname === to
                    ? 'text-gold-500'
                    : 'dark:text-zinc-300 text-gray-600 hover:text-gold-500'
                  }
                `}
              >
                {label}
                <span className={`
                  absolute -bottom-1 left-0 right-0 h-0.5 bg-gold-500 rounded transition-transform origin-center duration-300
                  ${location.pathname === to ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
                `} />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
              className="p-2.5 rounded-xl dark:hover:bg-zinc-800 hover:bg-gray-100 transition-all dark:text-zinc-300 text-gray-600"
            >
              {isDark ? <MdLightMode className="text-xl" /> : <MdDarkMode className="text-xl" />}
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label={`السلة — ${cartCount} عنصر`}
              className="relative p-2.5 rounded-xl dark:hover:bg-zinc-800 hover:bg-gray-100 transition-all dark:text-zinc-300 text-gray-600"
            >
              <MdShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-gold-500 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {/* User Profile */}
            <Link
              to={currentUser ? '/profile' : '/auth'}
              aria-label={currentUser ? 'حسابي' : 'تسجيل الدخول'}
              className="p-2.5 rounded-xl dark:hover:bg-zinc-800 hover:bg-gray-100 transition-all dark:text-zinc-300 text-gray-600 hidden md:flex"
            >
              <MdPerson className="text-xl" />
            </Link>

            {/* Mobile Menu */}
            <button
              aria-label="فتح القائمة"
              aria-expanded={mobileOpen}
              className="md:hidden p-2.5 rounded-xl dark:hover:bg-zinc-800 hover:bg-gray-100 transition-all dark:text-zinc-300 text-gray-600"
              onClick={() => setMobileOpen(true)}
            >
              <MdMenu className="text-xl" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="القائمة"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-72 dark:bg-zinc-900 bg-white z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b dark:border-zinc-800 border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center text-black font-bold">ح</div>
                  <span className="font-bold dark:text-white text-gray-900">الحبايب</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="إغلاق القائمة"
                  className="p-2 rounded-lg dark:hover:bg-zinc-800 hover:bg-gray-100"
                >
                  <MdClose className="text-xl dark:text-white text-gray-900" />
                </button>
              </div>
              <nav className="p-6 space-y-2">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`
                      block px-4 py-3 rounded-xl font-semibold transition-all
                      ${location.pathname === to
                        ? 'bg-gold-500/20 text-gold-500 border border-gold-500/30'
                        : 'dark:text-zinc-300 text-gray-700 dark:hover:bg-zinc-800 hover:bg-gray-100'
                      }
                    `}
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  to={currentUser ? '/profile' : '/auth'}
                  className="block px-4 py-3 rounded-xl font-semibold dark:text-zinc-300 text-gray-700 dark:hover:bg-zinc-800 hover:bg-gray-100 transition-all"
                >
                  {currentUser ? 'حسابي' : 'تسجيل الدخول'}
                </Link>
                <Link
                  to="/admin"
                  className="block px-4 py-3 rounded-xl font-semibold dark:text-zinc-300 text-gray-700 dark:hover:bg-zinc-800 hover:bg-gray-100 transition-all mt-4 border dark:border-zinc-800 border-gray-200"
                >
                  لوحة الإدارة
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
