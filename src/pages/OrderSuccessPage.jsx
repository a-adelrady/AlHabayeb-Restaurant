import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { MdCheckCircle, MdWhatsapp, MdTrackChanges, MdHome } from 'react-icons/md'

export default function OrderSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { orderId, waUrl } = location.state || {}
  const openedRef = useRef(false)

  useEffect(() => {
    if (!orderId) {
      navigate('/', { replace: true })
      return
    }

    // FIX: window.open() called from a setTimeout fires outside of a user
    // gesture context, causing popup blockers to block it in most browsers.
    // Instead we open immediately (still within the navigation gesture window)
    // and only fall back to the visible button if the window was blocked.
    // We use a ref guard to ensure it only fires once even in StrictMode.
    if (waUrl && !openedRef.current) {
      openedRef.current = true
      const win = window.open(waUrl, '_blank', 'noopener,noreferrer')
      if (!win) {
        // Popup was blocked — the button below lets the user open manually
        console.info('WhatsApp popup blocked by browser')
      }
    }
  }, [orderId, waUrl, navigate])

  if (!orderId) return null

  return (
    <>
      <Helmet>
        <title>تم تأكيد الطلب — مطعم الحبايب</title>
      </Helmet>

      <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 flex items-center justify-center px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center max-w-md w-full"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="w-28 h-28 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500/30"
          >
            <MdCheckCircle className="text-green-400 text-6xl" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold dark:text-white text-gray-900 mb-3"
          >
            تم تأكيد طلبك! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="dark:text-zinc-400 text-gray-600 mb-2"
          >
            رقم طلبك:
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gold-500/10 border-2 border-gold-500/30 rounded-2xl p-4 mb-6"
          >
            <p className="font-mono text-gold-400 text-xl font-bold tracking-wider">{orderId}</p>
            <p className="text-xs dark:text-zinc-500 text-gray-400 mt-1">احتفظ بهذا الرقم لتتبع طلبك</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="dark:bg-zinc-900 bg-white rounded-2xl p-5 border dark:border-zinc-800 border-gray-100 mb-8 text-sm"
          >
            <p className="dark:text-zinc-300 text-gray-700 leading-relaxed">
              سيتم تحويلك الآن إلى واتساب المطعم لتأكيد الطلب 💬
            </p>
            <p className="dark:text-zinc-400 text-gray-500 mt-2 text-xs">
              وقت التوصيل المتوقع: ٣٠ - ٤٥ دقيقة
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-500/20"
              >
                <MdWhatsapp className="text-2xl" />
                فتح واتساب
              </a>
            )}

            <Link
              to={`/track-order/${orderId}`}
              className="w-full flex items-center justify-center gap-2 bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/30 text-gold-400 font-bold py-3 rounded-xl transition-all"
            >
              <MdTrackChanges className="text-xl" />
              تتبع الطلب
            </Link>

            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 dark:bg-zinc-900 bg-white hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-zinc-300 text-gray-700 font-medium py-3 rounded-xl transition-all border dark:border-zinc-800 border-gray-200"
            >
              <MdHome className="text-xl" />
              الرئيسية
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
