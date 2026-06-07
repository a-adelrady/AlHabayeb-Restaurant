import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdHome, MdRestaurantMenu, MdShoppingCart, MdLocationOn, MdPerson } from 'react-icons/md'
import useStore from '../../store/useStore'

export default function BottomNav() {
  const location = useLocation()

  // FIX: granular selector — only re-render when cart count changes
  const cartCount = useStore(s => s.cartItems.reduce((acc, i) => acc + i.quantity, 0))

  // FIX: removed /admin link from customer-facing bottom nav.
  // Having an admin dashboard link in the user bottom nav is a UI/UX and
  // security anti-pattern — it surfaces admin routes to regular users.
  const tabs = [
    { to: '/', icon: MdHome, label: 'الرئيسية' },
    { to: '/menu', icon: MdRestaurantMenu, label: 'المنيو' },
    { to: '/cart', icon: MdShoppingCart, label: 'السلة', badge: cartCount },
    { to: '/track-order', icon: MdLocationOn, label: 'تتبع' },
    { to: '/profile', icon: MdPerson, label: 'حسابي' },
  ]

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) return null

  return (
    <nav
      aria-label="التنقل السفلي"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden dark:bg-zinc-900/95 bg-white/95 backdrop-blur-xl border-t dark:border-zinc-800 border-gray-200 safe-bottom"
    >
      <div className="flex items-center">
        {tabs.map(({ to, icon: Icon, label, badge }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className="flex-1 flex flex-col items-center py-2 gap-0.5 relative"
            >
              <div className="relative">
                <Icon className={`text-2xl transition-colors duration-200 ${isActive ? 'text-gold-500' : 'dark:text-zinc-400 text-gray-500'}`} />
                {badge > 0 && (
                  <motion.span
                    key={badge}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 bg-gold-500 text-black text-[10px] font-bold min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center px-1"
                  >
                    {badge}
                  </motion.span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? 'text-gold-500' : 'dark:text-zinc-500 text-gray-400'}`}>
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold-500 rounded-full"
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
