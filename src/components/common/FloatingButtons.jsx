import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import { MdShoppingCart } from 'react-icons/md'
import useStore from '../../store/useStore'

export default function FloatingButtons() {
  const location = useLocation()

  // FIX: granular selectors — previously subscribed to entire store
  const cartCount      = useStore(s => s.cartItems.reduce((acc, i) => acc + i.quantity, 0))
  const whatsappNumber = useStore(s => s.settings?.whatsappNumber || '201094799308')

  if (location.pathname.startsWith('/admin')) return null
  if (['/cart', '/checkout'].includes(location.pathname)) return null

  const whatsappUrl = `https://wa.me/${whatsappNumber}`

  return (
    <div className="fixed bottom-24 md:bottom-8 left-4 z-40 flex flex-col gap-3">
      {/* WhatsApp */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="تواصل معنا على واتساب"
        className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg shadow-green-500/30 flex items-center justify-center transition-colors"
      >
        <FaWhatsapp className="text-2xl" />
      </motion.a>

      {/* Cart — desktop only, mobile has BottomNav */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="hidden md:block"
          >
            <Link to="/cart" aria-label={`السلة — ${cartCount} عنصر`}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 bg-gold-500 hover:bg-gold-600 text-black rounded-full shadow-lg shadow-gold-500/30 flex items-center justify-center relative transition-colors"
              >
                <MdShoppingCart className="text-2xl" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
