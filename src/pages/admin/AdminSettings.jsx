import { useState } from 'react'
import { motion } from 'framer-motion'
import { MdSave, MdPhone, MdEmail, MdLocationOn, MdRestaurant, MdSchedule, MdShoppingCart, MdWarning } from 'react-icons/md'
import { FaWhatsapp } from 'react-icons/fa'
import toast from 'react-hot-toast'
import useStore from '../../store/useStore'

export default function AdminSettings() {
  // FIX: granular selectors
  const settings     = useStore(s => s.settings)
  const updateSettings = useStore(s => s.updateSettings)
  const purgeOrders  = useStore(s => s.purgeOrders)

  const [form,   setForm]   = useState({ ...settings })
  const [saving, setSaving] = useState(false)
  const [tab,    setTab]    = useState('general')
  // FIX: replace browser confirm() with in-page confirmation state
  const [confirmPurge, setConfirmPurge] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.restaurantName?.trim()) { toast.error('اسم المطعم مطلوب'); return }
    setSaving(true)
    try {
      await updateSettings(form)
      toast.success('تم حفظ الإعدادات ✓')
    } catch {
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handlePurge = () => {
    purgeOrders()
    setConfirmPurge(false)
    toast.success('تم مسح جميع بيانات الطلبات')
  }

  const tabs = [
    { id: 'general',  label: 'عام' },
    { id: 'contact',  label: 'التواصل' },
    { id: 'whatsapp', label: 'واتساب' },
    { id: 'danger',   label: 'منطقة الخطر' },
  ]

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">الإعدادات</h1>
        <p className="text-zinc-400 text-sm mt-1">إدارة إعدادات المطعم</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5" role="tablist">
        {tabs.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              tab === t.id ? 'bg-gold-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {tab === 'general' && (
          <Card title="معلومات المطعم" icon={MdRestaurant}>
            <Field label="اسم المطعم">
              <InputField value={form.restaurantName} onChange={v => set('restaurantName', v)} placeholder="الحبايب" icon={MdRestaurant} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="وقت الفتح">
                <InputField type="time" value={form.openTime} onChange={v => set('openTime', v)} icon={MdSchedule} dir="ltr" />
              </Field>
              <Field label="وقت الإغلاق">
                <InputField type="time" value={form.closeTime} onChange={v => set('closeTime', v)} icon={MdSchedule} dir="ltr" />
              </Field>
            </div>
            <Field label="الحد الأدنى للطلب (ج.م)">
              <InputField type="number" min="0" value={form.minOrderAmount} onChange={v => set('minOrderAmount', Number(v))} placeholder="50" icon={MdShoppingCart} dir="ltr" />
            </Field>
          </Card>
        )}

        {tab === 'contact' && (
          <Card title="بيانات التواصل" icon={MdPhone}>
            <Field label="رقم الهاتف">
              <InputField value={form.phone} onChange={v => set('phone', v)} placeholder="01000000000" icon={MdPhone} dir="ltr" />
            </Field>
            <Field label="البريد الإلكتروني">
              <InputField type="email" value={form.email} onChange={v => set('email', v)} placeholder="info@alhabayeb.com" icon={MdEmail} dir="ltr" />
            </Field>
            <Field label="العنوان">
              <InputField value={form.address} onChange={v => set('address', v)} placeholder="شارع الجمهورية، وسط البلد، القاهرة" icon={MdLocationOn} />
            </Field>
            <Field label="المدينة / المنطقة">
              <InputField value={form.city} onChange={v => set('city', v)} placeholder="القاهرة" icon={MdLocationOn} />
            </Field>
          </Card>
        )}

        {tab === 'whatsapp' && (
          <Card title="إعدادات واتساب" icon={FaWhatsapp}>
            <Field label="رقم واتساب المطعم" hint="أدخل الرقم مع كود الدولة بدون + (مثال: 201001234567)">
              <InputField value={form.whatsappNumber} onChange={v => set('whatsappNumber', v)} placeholder="201001234567" icon={FaWhatsapp} dir="ltr" />
            </Field>
            <div className="bg-zinc-800 rounded-xl p-4">
              <p className="text-zinc-400 text-xs mb-3">اختبار الرقم الحالي:</p>
              <p className="font-mono text-green-400 text-sm mb-3 break-all">wa.me/{form.whatsappNumber || '...'}</p>
              <a
                href={`https://wa.me/${form.whatsappNumber}?text=اختبار من إدارة مطعم الحبايب`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 font-medium px-4 py-2 rounded-xl transition-all text-sm"
              >
                <FaWhatsapp /> اختبار الآن
              </a>
            </div>
          </Card>
        )}

        {tab === 'danger' && (
          <div className="bg-zinc-900 border border-red-500/30 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-red-400 text-base flex items-center gap-2">
              <MdWarning /> منطقة الخطر
            </h2>
            <p className="text-zinc-500 text-sm">هذه الإجراءات لا يمكن التراجع عنها.</p>

            {!confirmPurge ? (
              <button
                type="button"
                onClick={() => setConfirmPurge(true)}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium px-5 py-3 rounded-xl transition-all text-sm"
              >
                حذف جميع الطلبات والأرشيف
              </button>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-3">
                <p className="text-red-300 text-sm font-semibold">هل أنت متأكد تماماً؟</p>
                <p className="text-zinc-400 text-xs">سيتم حذف جميع الطلبات والأرشيف والإشعارات بشكل دائم.</p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setConfirmPurge(false)}
                    className="flex-1 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm">
                    إلغاء
                  </button>
                  <button type="button" onClick={handlePurge}
                    className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm">
                    نعم، احذف كل شيء
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab !== 'danger' && (
          <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-gold-500/20">
            {saving
              ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              : <><MdSave className="text-xl" /> حفظ الإعدادات</>
            }
          </motion.button>
        )}
      </form>
    </div>
  )
}

function Card({ title, icon: Icon, children }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
      <h2 className="font-bold text-white flex items-center gap-2">
        <Icon className="text-gold-400 text-lg" />{title}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="text-zinc-400 text-xs mb-1.5 block">{label}</label>
      {children}
      {hint && <p className="text-zinc-600 text-xs mt-1">{hint}</p>}
    </div>
  )
}

function InputField({ value, onChange, placeholder, icon: Icon, type = 'text', dir = 'rtl', min }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-lg pointer-events-none" />}
      <input
        type={type} value={value ?? ''} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} dir={dir} min={min}
        className="w-full pr-10 pl-4 py-3 rounded-xl bg-zinc-800 border-2 border-zinc-700 focus:border-gold-500 text-white placeholder-zinc-600 outline-none transition-colors text-sm"
      />
    </div>
  )
}
