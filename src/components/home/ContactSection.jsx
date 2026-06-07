import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { MdPhone, MdEmail, MdLocationOn, MdAccessTime } from 'react-icons/md'
import { FaWhatsapp } from 'react-icons/fa'
import useStore from '../../store/useStore'

export default function ContactSection() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const { settings } = useStore()

  const contacts = [
    { icon: MdPhone, label: 'اتصل بنا', value: settings?.phone || '920000000', href: `tel:${settings?.phone}` },
    { icon: FaWhatsapp, label: 'واتساب', value: `+${settings?.whatsappNumber || '966500000000'}`, href: `https://wa.me/${settings?.whatsappNumber}` },
    { icon: MdEmail, label: 'البريد', value: settings?.email || 'info@alhabayeb.com', href: `mailto:${settings?.email}` },
    { icon: MdLocationOn, label: 'الموقع', value: settings?.address || 'الرياض، المملكة العربية السعودية', href: '#' },
    { icon: MdAccessTime, label: 'أوقات العمل', value: '١٠ ص - ١ ص يومياً', href: null },
  ]

  return (
    <section ref={ref} className="py-16 md:py-24 dark:bg-zinc-950 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <span className="text-gold-500 text-sm font-bold uppercase tracking-widest mb-3 block">📞 تواصل معنا</span>
          <h2 className="text-3xl md:text-4xl font-bold dark:text-white text-gray-900 mb-4">نحن هنا لخدمتك</h2>
          <p className="dark:text-zinc-400 text-gray-500">لا تتردد في التواصل معنا في أي وقت</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {contacts.map(({ icon: Icon, label, value, href }, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              className="dark:bg-zinc-900 bg-white p-6 rounded-2xl border dark:border-zinc-800 border-gray-100 hover:border-gold-500/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-4 group-hover:bg-gold-500/20 transition-colors">
                <Icon className="text-gold-500 text-2xl" />
              </div>
              <p className="text-sm dark:text-zinc-500 text-gray-400 mb-1">{label}</p>
              {href && href !== '#' ? (
                <a
                  href={href}
                  className="font-semibold dark:text-white text-gray-900 hover:text-gold-500 transition-colors text-sm"
                >
                  {value}
                </a>
              ) : (
                <p className="font-semibold dark:text-white text-gray-900 text-sm">{value}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
