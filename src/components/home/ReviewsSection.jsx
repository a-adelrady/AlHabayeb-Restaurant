import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { MdStar } from 'react-icons/md'
import { REVIEWS } from '../../utils/data'

export default function ReviewsSection() {
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
          <span className="text-gold-500 text-sm font-bold uppercase tracking-widest mb-3 block">💬 آراء العملاء</span>
          <h2 className="text-3xl md:text-4xl font-bold dark:text-white text-gray-900 mb-4">ماذا يقول عملاؤنا</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <MdStar key={i} className="text-gold-500 text-xl" />
              ))}
            </div>
            <span className="font-bold text-gold-500">4.9</span>
            <span className="dark:text-zinc-400 text-gray-500 text-sm">من آلاف التقييمات</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {REVIEWS.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="dark:bg-zinc-950 bg-gray-50 p-6 rounded-2xl border dark:border-zinc-800 border-gray-100 hover:border-gold-500/30 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <MdStar key={i} className="text-gold-500 text-sm" />
                ))}
              </div>

              {/* Text */}
              <p className="dark:text-zinc-300 text-gray-700 text-sm leading-relaxed mb-5 line-clamp-4">
                "{review.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-500 font-bold text-sm">
                  {review.avatar}
                </div>
                <div>
                  <p className="font-semibold dark:text-white text-gray-900 text-sm">{review.name}</p>
                  <p className="text-xs dark:text-zinc-500 text-gray-400">{review.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
