import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FaWhatsapp, FaGithub, FaLinkedin, FaCode, FaServer, FaPalette } from 'react-icons/fa'
import { MdEmail, MdStar } from 'react-icons/md'
// import { myPhoto } from "public/favicon.svg"

const SERVICES = [
  { icon: FaCode,    title: 'مواقع ويب',            desc: 'React, Next.js — مواقع سريعة وعصرية' },
  { icon: FaServer,  title: 'Backend & APIs',        desc: 'Node.js, Firebase, Supabase — خدمات خلفية قابلة للتوسع' },
  { icon: FaPalette, title: 'UI/UX Design',          desc: 'تصميم واجهات احترافية مع تجربة مستخدم مميزة' },
]

const PROJECTS = [
  { name: 'مطعم الحبايب',        desc: 'منصة مطعم متكاملة مع لوحة إدارة', tech: ['React','Firebase','Tailwind'] },
  { name: 'متجر إلكتروني',       desc: 'متجر كامل مع بوابة دفع',           tech: ['Next.js','Stripe','PostgreSQL'] },
  { name: 'نظام إدارة المبيعات', desc: 'داشبورد تحليلات وتقارير',          tech: ['React','Node.js','MongoDB'] },
]

export default function DeveloperPage() {
  return (
    <>
      <Helmet>
        <title>Ahmed Adel — Developer | مطعم الحبايب</title>
        <meta name="description" content="Ahmed Adel — Full Stack Developer specializing in React, Firebase, and mobile apps." />
      </Helmet>

      <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gold-500/3 rounded-full blur-2xl" />
          </div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gold-500 to-yellow-400 flex items-center justify-center text-black text-4xl font-bold mx-auto mb-6 shadow-xl shadow-gold-500/30">
                aa
              </div>
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
                <span className="inline-block bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
                  Full Stack Developer
                </span>
                <h1 className="text-4xl md:text-5xl font-bold dark:text-white text-gray-900 mb-4">
                  Ahmed Adel
                </h1>
                <p className="dark:text-zinc-400 text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
                  بني على React وFirebase وأكثر — من الفكرة للمنتج الحقيقي
                </p>
              </motion.div>

              {/* Links */}
              <motion.div
                initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
                className="flex items-center justify-center gap-3 mt-8 flex-wrap"
              >
                {[
                  { href:'https://wa.me/2011100487170', icon:FaWhatsapp, label:'واتساب',  color:'bg-green-500 hover:bg-green-600 text-white' },
                  { href:'ahmedadel.elareed@gmail.com',        icon:MdEmail,    label:'إيميل',   color:'bg-blue-500 hover:bg-blue-600 text-white' },
                  { href:'https://github.com/a-adelrady',         icon:FaGithub,   label:'GitHub',  color:'dark:bg-zinc-800 bg-gray-200 dark:hover:bg-zinc-700 hover:bg-gray-300 dark:text-white text-gray-900' },
                  { href:'https://www.linkedin.com/in/ahmed-adel-775515253',       icon:FaLinkedin, label:'LinkedIn', color:'bg-blue-700 hover:bg-blue-800 text-white' },
                ].map(({ href, icon: Icon, label, color }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-2 ${color} font-semibold px-5 py-2.5 rounded-xl transition-all text-sm`}>
                    <Icon className="text-base" /> {label}
                  </a>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 dark:bg-zinc-900 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold dark:text-white text-gray-900 text-center mb-10">الخدمات</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SERVICES.map((s, i) => (
                <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
                  transition={{ delay:i*0.1 }} whileHover={{ y:-4 }}
                  className="dark:bg-zinc-950 bg-gray-50 p-6 rounded-2xl border dark:border-zinc-800 border-gray-100 text-center group hover:border-gold-500/30 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-500/20 transition-colors">
                    <s.icon className="text-gold-400 text-xl" />
                  </div>
                  <h3 className="font-bold dark:text-white text-gray-900 text-sm mb-2">{s.title}</h3>
                  <p className="dark:text-zinc-500 text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Projects */}
        <section className="py-16 dark:bg-zinc-950 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold dark:text-white text-gray-900 text-center mb-10">مشاريع مختارة</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {PROJECTS.map((p, i) => (
                <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
                  transition={{ delay:i*0.1 }}
                  className="dark:bg-zinc-900 bg-white p-6 rounded-2xl border dark:border-zinc-800 border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <MdStar className="text-gold-400 text-sm" />
                    <h3 className="font-bold dark:text-white text-gray-900 text-sm">{p.name}</h3>
                  </div>
                  <p className="dark:text-zinc-500 text-gray-500 text-xs mb-3">{p.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tech.map(t => (
                      <span key={t} className="text-[10px] bg-gold-500/10 text-gold-400 px-2 py-0.5 rounded-full font-medium">{t}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 dark:bg-zinc-900 bg-white">
          <div className="max-w-xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-3">جاهز تبني مشروعك؟</h2>
            <p className="dark:text-zinc-400 text-gray-500 text-sm mb-8">تواصل معي عبر واتساب أو إيميل وهنبدأ فوراً</p>
            <a href="https://wa.me/2011100487170?text=مرحباً، أريد بناء مشروع"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-green-500/30 text-base">
              <FaWhatsapp className="text-xl" /> تواصل على واتساب
            </a>
          </div>
        </section>
      </div>
    </>
  )
}
