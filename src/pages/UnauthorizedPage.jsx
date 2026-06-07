import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdBlock, MdHome } from 'react-icons/md'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm">
        <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
          <MdBlock className="text-red-400 text-4xl" />
        </div>
        <h1 className="text-2xl font-bold dark:text-white text-gray-900 mb-2">
          ليس لديك صلاحية
        </h1>
        <p className="dark:text-zinc-400 text-gray-500 text-sm mb-8">
          هذه الصفحة متاحة فقط للمستخدمين المصرح لهم.
          <br />تواصل مع المدير لرفع صلاحياتك.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-bold px-6 py-3 rounded-xl transition-all">
            <MdHome /> الرئيسية
          </Link>
          <Link to="/admin" className="dark:bg-zinc-900 bg-white border-2 dark:border-zinc-700 border-gray-200 dark:text-zinc-300 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-all">
            لوحة الإدارة
          </Link>
        </div>
      </motion.div>
    </div>
  )
}