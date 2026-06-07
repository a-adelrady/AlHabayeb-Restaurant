import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>الصفحة غير موجودة — مطعم الحبايب</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            className="text-8xl mb-6"
          >
            🍽️
          </motion.div>
          <h1 className="text-6xl font-bold text-gold-500 mb-3">404</h1>
          <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-3">الصفحة مش موجودة</h2>
          <p className="dark:text-zinc-400 text-gray-500 mb-8 text-sm">
            يبدو إن الصفحة دي اتأكلت! 😄<br />
            ارجع للرئيسية واطلب أكلة حلوة.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="bg-gold-500 hover:bg-gold-600 text-black font-bold px-8 py-3 rounded-xl transition-all">
              الرئيسية
            </Link>
            <Link to="/menu" className="dark:border-zinc-700 border-gray-300 border-2 dark:text-zinc-300 text-gray-700 font-semibold px-8 py-3 rounded-xl transition-all dark:hover:bg-zinc-800 hover:bg-gray-100">
              المنيو
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  )
}
