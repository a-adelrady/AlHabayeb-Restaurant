import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MdArrowBack, MdMenuBook } from 'react-icons/md'
import useStore from '../../store/useStore'

const cv = { hidden: {}, visible: { transition: { staggerChildren: 0.13 } } }
const iv = { hidden: { opacity:0, y:30 }, visible: { opacity:1, y:0, transition:{ duration:0.7, ease:[0.25,0.46,0.45,0.94] } } }

export default function HeroSection() {
  const { settings } = useStore()
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=85" alt="مطعم الحبايب"
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/90" />
      </div>
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gold-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-24 pb-16 md:pt-32">
        <motion.div variants={cv} initial="hidden" animate="visible" className="max-w-2xl">
          <motion.div variants={iv}>
            <span className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/40 text-gold-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              نفتح كل يوم ١٠ الصبح لـ ١ الفجر
            </span>
          </motion.div>

          <motion.h1 variants={iv} className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4 leading-tight">
            مطعم
            <span className="block text-transparent bg-clip-text bg-gradient-to-l from-yellow-300 to-gold-500 mt-1">
              {settings?.restaurantName || 'الحبايب'}
            </span>
          </motion.h1>

          <motion.p variants={iv} className="text-lg md:text-xl text-zinc-200 leading-relaxed mb-8 max-w-lg">
            أكل مصري بيتي حقيقي — كشري وحمام ومشاوي على الفحم البلدي بيوصلك ساخن لبيتك
          </motion.p>

          <motion.div variants={iv} className="flex flex-col xs:flex-row gap-3 sm:gap-4">
            <Link to="/menu">
              <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                className="w-full xs:w-auto flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-black font-bold px-8 py-4 rounded-2xl text-base transition-all shadow-lg shadow-gold-500/30 animate-pulse-gold">
                اطلب دلوقتي <MdArrowBack className="text-xl rotate-180" />
              </motion.button>
            </Link>
            <Link to="/menu">
              <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                className="w-full xs:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all">
                <MdMenuBook className="text-xl" /> شوف المنيو
              </motion.button>
            </Link>
          </motion.div>

          <motion.div variants={iv} className="flex items-center gap-8 mt-12 pt-8 border-t border-white/10">
            {[{ val:'12K+',label:'طلب شهري' },{ val:'4.9★',label:'تقييم' },{ val:'45د',label:'توصيل' }].map(({ val, label }) => (
              <div key={label} className="text-center">
                <div className="text-xl font-bold text-gold-400">{val}</div>
                <div className="text-xs text-zinc-400">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
        animate={{ y:[0,8,0] }} transition={{ repeat:Infinity, duration:2 }}>
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-2">
          <div className="w-1.5 h-2.5 bg-gold-500 rounded-full animate-bounce" />
        </div>
      </motion.div>
    </section>
  )
}
