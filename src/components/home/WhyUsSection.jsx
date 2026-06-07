import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { WHY_US } from '../../utils/data'

export default function WhyUsSection() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <section ref={ref} className="py-16 md:py-24 dark:bg-zinc-950 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="text-gold-500 text-sm font-bold uppercase tracking-widest mb-3 block">✨ مميزاتنا</span>
          <h2 className="text-3xl md:text-4xl font-bold dark:text-white text-gray-900 mb-4">
            لماذا تختار الحبايب؟
          </h2>
          <p className="dark:text-zinc-400 text-gray-500 max-w-md mx-auto">
            نحن لا نقدم طعاماً فقط — نحن نقدم تجربة لا تُنسى
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_US.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="text-center p-8 dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-gray-100 group transition-all duration-300 dark:hover:border-gold-500/30 hover:border-gold-300 hover:shadow-lg hover:shadow-gold-500/5"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: index * 0.5 }}
                className="text-5xl mb-5"
              >
                {item.icon}
              </motion.div>
              <h3 className="font-bold text-lg dark:text-white text-gray-900 mb-3 group-hover:text-gold-500 transition-colors">
                {item.title}
              </h3>
              <p className="dark:text-zinc-400 text-gray-500 text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
