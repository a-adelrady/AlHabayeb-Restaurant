import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { STATS } from '../../utils/data'

export default function StatsSection() {
  const { ref, inView } = useInView({ threshold:0.1, triggerOnce:true })
  return (
    <section ref={ref} className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 ">
        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=70" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div key={i} initial={{ opacity:0, scale:0.8 }} animate={inView ? { opacity:1, scale:1 } : {}} transition={{ duration:0.6, delay:i*0.15 }} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gold-400 mb-2">{stat.value}</div>
              <div className="text-zinc-300 font-medium text-sm md:text-base">{stat.label}</div>
              <div className="w-8 h-0.5 bg-gold-500/50 mx-auto mt-3 rounded" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
