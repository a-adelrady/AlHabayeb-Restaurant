import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import { OFFERS } from '../../utils/data'

export default function OffersSection() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <section ref={ref} className="py-16 md:py-24 dark:bg-zinc-900 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="text-gold-500 text-sm font-bold uppercase tracking-widest mb-3 block">🎁 عروض حصرية</span>
          <h2 className="text-3xl md:text-4xl font-bold dark:text-white text-gray-900 mb-4">عروض لا تفوتك</h2>
          <p className="dark:text-zinc-400 text-gray-500">عروض يومية بأسعار لا تقاوم</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {OFFERS.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -6 }}
              className="relative overflow-hidden rounded-3xl group cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-bl ${offer.color} opacity-90`} />
              <img
                src={offer.image}
                alt={offer.title}
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
              />
              <div className="relative p-6 md:p-8 min-h-[200px] flex flex-col justify-between">
                <div>
                  <span className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold px-3 py-1 rounded-full mb-3">
                    خصم {offer.discount}
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-2">{offer.title}</h3>
                  <p className="text-white/80 text-sm">{offer.description}</p>
                </div>
                <Link
                  to="/menu"
                  className="mt-4 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm self-start"
                >
                  اطلب الآن
                </Link>
              </div>
              {/* Decorative circle */}
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
