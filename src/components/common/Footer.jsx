import { Link } from 'react-router-dom'
import { FaWhatsapp, FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa'
import { MdPhone, MdEmail, MdLocationOn } from 'react-icons/md'
import useStore from '../../store/useStore'

export default function Footer() {
  const settings = useStore(s => s.settings)

  return (
    <footer className="dark:bg-zinc-900 bg-gray-900 text-white border-t dark:border-zinc-800 border-gray-800">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-20 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center text-black font-bold text-2xl">ح</div>
              <div>
                <h3 className="font-bold text-xl text-gold-500">{settings?.restaurantName || 'الحبايب'}</h3>
                <p className="text-xs text-zinc-400">مطعم مصري أصيل</p>
              </div>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              أكل مصري بيتي حقيقي — من الفحم البلدي لبيتك بأسرع وقت وأجود نوعية
            </p>
            <div className="flex items-center gap-2">
              {[FaWhatsapp, FaInstagram, FaFacebook, FaTiktok].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-gold-500 hover:text-black text-zinc-400 flex items-center justify-center transition-all duration-200">
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4 text-gold-400 text-sm">روابط سريعة</h4>
            <ul className="space-y-2.5">
              {[
                { to:'/',            label:'الرئيسية' },
                { to:'/menu',        label:'المنيو' },
                { to:'/track-order', label:'تتبع طلبك' },
                { to:'/developer',   label:'المطور' },
                { to:'/admin',       label:'لوحة الإدارة' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-zinc-400 hover:text-gold-400 transition-colors text-sm flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-gold-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4 text-gold-400 text-sm">أقسام المنيو</h4>
            <ul className="space-y-2.5">
              {['مشويات','كشري','سندويشات','وجبات','مشروبات','حلويات'].map(cat => (
                <li key={cat}>
                  <Link to="/menu" className="text-zinc-400 hover:text-gold-400 transition-colors text-sm flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-gold-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-gold-400 text-sm">تواصل معنا</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-zinc-400 text-sm">
                <MdPhone className="text-gold-500 text-lg flex-shrink-0 mt-0.5" />
                <a href={`tel:${settings?.phone}`} className="hover:text-gold-400 transition-colors" dir="ltr">{settings?.phone || '01000000000'}</a>
              </li>
              <li className="flex items-start gap-3 text-zinc-400 text-sm">
                <FaWhatsapp className="text-green-500 text-lg flex-shrink-0 mt-0.5" />
                <a href={`https://wa.me/${settings?.whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                  className="hover:text-gold-400 transition-colors" dir="ltr">
                  +{settings?.whatsappNumber || '201094799308'}
                </a>
              </li>
              <li className="flex items-start gap-3 text-zinc-400 text-sm">
                <MdEmail className="text-gold-500 text-lg flex-shrink-0 mt-0.5" />
                <a href={`mailto:${settings?.email}`} className="hover:text-gold-400 transition-colors">{settings?.email || 'info@alhabayeb.com'}</a>
              </li>
              <li className="flex items-start gap-3 text-zinc-400 text-sm">
                <MdLocationOn className="text-gold-500 text-lg flex-shrink-0 mt-0.5" />
                <span>{settings?.address || 'شارع الجمهورية، وسط البلد، القاهرة'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t dark:border-zinc-800 border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-zinc-500 text-xs text-center">
            © {new Date().getFullYear()} مطعم الحبايب — جميع الحقوق محفوظة
          </p>
          <Link to="/developer" className="text-zinc-600 hover:text-gold-400 transition-colors text-xs">
            Designed &amp; Developed by{' '}
            <span className="text-gold-500 font-semibold">Ahmed Adel</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
