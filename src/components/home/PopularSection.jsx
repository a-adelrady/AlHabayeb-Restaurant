import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import ProductCard from '../common/ProductCard'
import useStore from '../../store/useStore'

export default function PopularSection() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const { products } = useStore()
  const popular = products.filter(p => p.isPopular).slice(0, 4)

  return (
    <section ref={ref} className="py-16 md:py-24 dark:bg-zinc-950 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="text-gold-500 text-sm font-bold uppercase tracking-widest mb-3 block">⭐ الأكثر طلباً</span>
          <h2 className="text-3xl md:text-4xl font-bold dark:text-white text-gray-900 mb-4">
            أشهر الوجبات
          </h2>
          <p className="dark:text-zinc-400 text-gray-500 max-w-md mx-auto">
            اختارها آلاف العملاء — الأكثر طلباً على مدار العام
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {popular.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 border-2 border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-black font-bold px-8 py-3 rounded-xl transition-all duration-300"
          >
            عرض المنيو كاملاً
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
