import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  FaWhatsapp, FaGithub, FaLinkedin,
  FaCode, FaMobile, FaServer, FaPalette, FaFigma
} from 'react-icons/fa'
import { MdEmail, MdStar, MdCheck, MdArrowForward } from 'react-icons/md'

// ── بياناتك — عدّلها هنا ──────────────────────────────────────────────────
const DEV = {
  name:       'Ahmed Adel',
  nameAr:     'أحمد عادل',
  title:      'Frontend Developer & UI/UX Designer',
  titleAr:    'مطور فرونت اند ومصمم واجهات',
  bio:        'بحول أفكارك لمنتجات حقيقية — من التصميم للكود الشغال',
  phone:      '201100487170',
  email:      'ahmedadel.elareed@gmail.com',
  github:     'https://github.com/a-adelrady',
  linkedin:   'https://www.linkedin.com/in/ahmed-adel-775515253',
  avatar:     '/developer.jpg', // ارفع صورتك في public/developer.jpg
}

const SERVICES = [
  {
    icon:  FaCode,
    title: 'Landing Pages',
    titleAr: 'صفحات هبوط احترافية',
    desc:  'صفحات تحويل عالية بتصميم عصري وسريعة على كل الأجهزة',
    tags:  ['React', 'Tailwind', 'Framer Motion'],
  },
  {
    icon:  FaFigma,
    title: 'Figma to Code',
    titleAr: 'تحويل تصاميم Figma لكود',
    desc:  'عندك تصميم Figma؟ أحوّله لموقع حقيقي pixel perfect',
    tags:  ['React', 'Next.js', 'CSS'],
  },
  {
    icon:  FaPalette,
    title: 'Design + Development',
    titleAr: 'تصميم وتطوير من الصفر',
    desc:  'مش عندك تصميم؟ أعمللك التصميم والموقع وتستلمه جاهز',
    tags:  ['Figma', 'React', 'UI/UX'],
  },
  {
    icon:  FaMobile,
    title: 'Website Maintenance',
    titleAr: 'تعديلات على موقعك',
    desc:  'عندك موقع وعاوز تعدل فيه حاجات؟ أنا هنا',
    tags:  ['React', 'Vue', 'WordPress'],
  },
  {
    icon:  FaServer,
    title: 'Backend — Strapi',
    titleAr: 'باك اند بـ Strapi',
    desc:  'بناء APIs وإدارة محتوى احترافية باستخدام Strapi CMS',
    tags:  ['Strapi', 'REST API', 'PostgreSQL'],
  },
]

const PROJECTS = [
  {
    name:  'مطعم الحبايب',
    desc:  'منصة طلب أكل متكاملة مع لوحة إدارة real-time وإشعارات فورية',
    tech:  ['React', 'Firebase', 'Tailwind', 'PWA'],
    link:  '#',
    live:  true,
  },
  {
    name:  'متجر إلكتروني',
    desc:  'متجر كامل مع بوابة دفع وإدارة مخزون وداشبورد مبيعات',
    tech:  ['Next.js', 'Strapi', 'Stripe'],
    link:  '#',
    live:  false,
  },
  {
    name:  'نظام حجوزات',
    desc:  'تطبيق حجز مواعيد مع تقويم تفاعلي وإشعارات SMS',
    tech:  ['React', 'Node.js', 'PostgreSQL'],
    link:  '#',
    live:  false,
  },
  {
    name:  'داشبورد تحليلات',
    desc:  'لوحة تحكم لمتابعة المبيعات والتقارير مع رسوم بيانية تفاعلية',
    tech:  ['React', 'Recharts', 'REST API'],
    link:  '#',
    live:  false,
  },
  {
    name:  'Landing Page Agency',
    desc:  'صفحة هبوط لوكالة تسويق بتصميم عصري وأنيميشن سلس',
    tech:  ['React', 'Framer Motion', 'Tailwind'],
    link:  '#',
    live:  false,
  },
  {
    name:  'تطبيق عقارات',
    desc:  'تطبيق بحث عقارات للسوق المصري مع فلاتر متقدمة وخرائط',
    tech:  ['React', 'Mapbox', 'Strapi'],
    link:  '#',
    live:  false,
  },
]

export default function DeveloperPage() {
  return (
    <>
      <Helmet>
        <title>{DEV.nameAr} — مطور فرونت اند | مطعم الحبايب</title>
        <meta name="description" content={`${DEV.nameAr} — ${DEV.titleAr}. ${DEV.bio}`} />
      </Helmet>

      <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pt-16">

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-20 md:py-28">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

              {/* Avatar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="flex-shrink-0"
              >
                <div className="relative">
                  <div className="w-40 h-40 md:w-52 md:h-52 rounded-3xl overflow-hidden border-4 border-gold-500/30 shadow-2xl shadow-gold-500/10">
                    <img
                      src={DEV.avatar}
                      alt={DEV.nameAr}
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.target.parentElement.innerHTML =
                          `<div class="w-full h-full bg-gradient-to-br from-gold-500 to-yellow-400 flex items-center justify-center text-black text-5xl font-bold">${DEV.name.slice(0,2)}</div>`
                      }}
                    />
                  </div>
                  {/* Available badge */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap shadow-lg">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    متاح للعمل
                  </div>
                </div>
              </motion.div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center md:text-right flex-1"
              >
                <span className="inline-block bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
                  {DEV.title}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold dark:text-white text-gray-900 mb-3">
                  {DEV.nameAr}
                </h1>
                <p className="dark:text-zinc-400 text-gray-500 text-base md:text-lg leading-relaxed mb-6 max-w-lg">
                  {DEV.bio}
                </p>

                {/* Links */}
                <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                  <a href={`https://wa.me/${DEV.phone}?text=مرحباً، أريد الاستفسار عن خدماتك`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-green-500/20">
                    <FaWhatsapp className="text-base" /> واتساب
                  </a>
                  <a href={`mailto:${DEV.email}`}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm">
                    <MdEmail className="text-base" /> إيميل
                  </a>
                  <a href={DEV.github} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 dark:bg-zinc-800 bg-gray-200 dark:hover:bg-zinc-700 hover:bg-gray-300 dark:text-white text-gray-900 font-bold px-5 py-2.5 rounded-xl transition-all text-sm">
                    <FaGithub className="text-base" /> GitHub
                  </a>
                  <a href={DEV.linkedin} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm">
                    <FaLinkedin className="text-base" /> LinkedIn
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Services ────────────────────────────────────────────────── */}
        <section className="py-16 dark:bg-zinc-900/50 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold dark:text-white text-gray-900 mb-3">الخدمات</h2>
              <p className="dark:text-zinc-500 text-gray-400 text-sm">إيه اللي أقدر أعمله ليك</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {SERVICES.map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="dark:bg-zinc-900 bg-gray-50 p-6 rounded-2xl border dark:border-zinc-800 border-gray-100 group hover:border-gold-500/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4 group-hover:bg-gold-500/20 transition-colors">
                    <s.icon className="text-gold-400 text-xl" />
                  </div>
                  <h3 className="font-bold dark:text-white text-gray-900 text-base mb-1">{s.titleAr}</h3>
                  <p className="text-xs text-gold-500/70 mb-3">{s.title}</p>
                  <p className="dark:text-zinc-500 text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.tags.map(t => (
                      <span key={t} className="text-[10px] bg-gold-500/10 text-gold-400 px-2 py-0.5 rounded-full font-medium border border-gold-500/20">
                        {t}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Projects ────────────────────────────────────────────────── */}
        <section className="py-16 dark:bg-zinc-950 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold dark:text-white text-gray-900 mb-3">مشاريع مختارة</h2>
              <p className="dark:text-zinc-500 text-gray-400 text-sm">شغل حقيقي بنته</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PROJECTS.map((p, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="dark:bg-zinc-900 bg-white p-5 rounded-2xl border dark:border-zinc-800 border-gray-100 flex flex-col group hover:border-gold-500/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold dark:text-white text-gray-900 text-sm">{p.name}</h3>
                    {p.live && (
                      <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-medium flex-shrink-0 mr-2">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="dark:text-zinc-500 text-gray-500 text-xs leading-relaxed mb-4 flex-1">{p.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {p.tech.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                    {p.link !== '#' && (
                      <a href={p.link} target="_blank" rel="noopener noreferrer"
                        className="text-gold-400 hover:text-gold-300 transition-colors">
                        <MdArrowForward className="text-lg rotate-180" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <section className="py-16 dark:bg-zinc-900 bg-white">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl mb-6">🚀</div>
              <h2 className="text-2xl md:text-3xl font-bold dark:text-white text-gray-900 mb-3">
                جاهز تبني مشروعك؟
              </h2>
              <p className="dark:text-zinc-400 text-gray-500 text-sm mb-8 leading-relaxed">
                تواصل معي وابعتلي فكرتك — هرد عليك في نفس اليوم
                وهنبدأ من الصفر أو من حيث وقفت
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <a href={`https://wa.me/${DEV.phone}?text=مرحباً، أريد الاستفسار عن خدماتك`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-green-500/20 text-base">
                  <FaWhatsapp className="text-xl" /> ابعتلي على واتساب
                </a>
                <a href={`mailto:${DEV.email}`}
                  className="flex items-center gap-2 dark:bg-zinc-800 bg-gray-100 dark:hover:bg-zinc-700 hover:bg-gray-200 dark:text-white text-gray-900 font-bold px-8 py-4 rounded-2xl transition-all text-base">
                  <MdEmail className="text-xl" /> إيميل
                </a>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </>
  )
}