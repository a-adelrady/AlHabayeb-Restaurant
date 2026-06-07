import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  MdArrowBack, MdPerson, MdPhone, MdLocationOn,
  MdNotes, MdWhatsapp, MdShoppingCart, MdDeliveryDining
} from 'react-icons/md'
import toast from 'react-hot-toast'
import useStore from '../store/useStore'
import { useRoleAuth } from '../context/RoleAuthContext'
import { formatPrice, buildWhatsAppMessage, getEgyptianPhoneError, sanitizeText } from '../utils/helpers'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { currentUser } = useRoleAuth()

  // FIX: Granular selectors — only re-render when the specific slice changes.
  // Previously subscribing to the whole store caused re-renders on unrelated updates.
  const cartItems     = useStore(s => s.cartItems)
  const settings      = useStore(s => s.settings)
  const deliveryZones = useStore(s => s.deliveryZones)
  const selectedZone  = useStore(s => s.selectedZone)
  const createOrder   = useStore(s => s.createOrder)
  const clearCart     = useStore(s => s.clearCart)
  const setSelectedZone = useStore(s => s.setSelectedZone)
  const getCartSubtotal = useStore(s => s.getCartSubtotal)
  const getDeliveryFee  = useStore(s => s.getDeliveryFee)
  const getCartTotal    = useStore(s => s.getCartTotal)

  const [form, setForm]     = useState({ name: '', phone: '', address: '', notes: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const subtotal    = getCartSubtotal()
  const deliveryFee = getDeliveryFee()
  const total       = getCartTotal()

  // FIX: validate() now also checks minOrderAmount from settings
  const validate = () => {
    const e = {}
    const name = sanitizeText(form.name)
    const addr = sanitizeText(form.address)
    if (!name)           e.name    = 'الاسم مطلوب'
    else if (name.length < 2) e.name = 'الاسم قصير جداً'
    const phoneErr = getEgyptianPhoneError(form.phone)
    if (phoneErr)        e.phone   = phoneErr
    if (!addr)           e.address = 'العنوان مطلوب'
    else if (addr.length < 10) e.address = 'أدخل عنواناً تفصيلياً'
    if (!selectedZone)   e.zone    = 'اختر منطقة التوصيل'
    if (settings?.minOrderAmount && subtotal < settings.minOrderAmount) {
      e.minOrder = `الحد الأدنى للطلب ${formatPrice(settings.minOrderAmount)}`
    }
    return e
  }

  const handleChange = (field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const customerData = {
        name:    sanitizeText(form.name),
        phone:   form.phone.trim(),
        address: sanitizeText(form.address),
        notes:   sanitizeText(form.notes),
        userUid: currentUser?.uid || null,
      }
      const order = await createOrder(customerData)
      const waUrl = buildWhatsAppMessage(order, settings)
      clearCart()
      toast.success('تم تأكيد طلبك! 🎉')
      navigate('/order-success', { state: { orderId: order.id, waUrl } })
    } catch (err) {
      console.error('Checkout error:', err)
      toast.error('حدث خطأ، حاول مرة أخرى')
      setLoading(false)
    }
  }

  if (cartItems.length === 0) return (
    <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pt-20 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-4">السلة فارغة</h2>
        <Link to="/menu" className="bg-gold-500 text-black font-bold px-6 py-3 rounded-xl inline-block">تصفح المنيو</Link>
      </div>
    </div>
  )

  return (
    <>
      <Helmet>
        <title>إتمام الطلب — مطعم الحبايب</title>
      </Helmet>

      <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate(-1)}
              aria-label="رجوع"
              className="p-2 rounded-xl dark:hover:bg-zinc-800 hover:bg-gray-200 transition-all"
            >
              <MdArrowBack className="text-xl dark:text-white text-gray-700 rotate-180" />
            </button>
            <h1 className="text-2xl font-bold dark:text-white text-gray-900">إتمام الطلب</h1>
          </div>

          {/* Min order warning */}
          {errors.minOrder && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {errors.minOrder}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* ── Left column ── */}
              <div className="lg:col-span-2 space-y-5">

                {/* Customer info */}
                <div className="dark:bg-zinc-900 bg-white rounded-2xl p-6 border dark:border-zinc-800 border-gray-100">
                  <h2 className="font-bold text-lg dark:text-white text-gray-900 mb-5 flex items-center gap-2">
                    <MdPerson className="text-gold-500 text-xl" /> بيانات التوصيل
                  </h2>
                  <div className="space-y-4">

                    {/* Name */}
                    <Field label="الاسم الكامل *" error={errors.name}>
                      <MdPerson className="field-icon" />
                      <input
                        type="text" placeholder="اكتب اسمك الكامل"
                        value={form.name} onChange={e => handleChange('name', e.target.value)}
                        maxLength={60} autoComplete="name"
                        className={fieldClass(errors.name)}
                      />
                    </Field>

                    {/* Phone */}
                    <Field label="رقم الموبايل *" error={errors.phone} hint="أرقام مصرية فقط: 010 / 011 / 012 / 015">
                      <MdPhone className="field-icon" />
                      <input
                        type="tel" placeholder="01xxxxxxxxx"
                        value={form.phone} onChange={e => handleChange('phone', e.target.value)}
                        maxLength={13} dir="ltr" autoComplete="tel"
                        inputMode="numeric"
                        className={fieldClass(errors.phone)}
                      />
                    </Field>

                    {/* Address */}
                    <Field label="العنوان بالتفصيل *" error={errors.address}>
                      <MdLocationOn className="field-icon top-3.5 translate-y-0" />
                      <textarea
                        placeholder="الحي، الشارع، رقم المبنى والشقة..."
                        value={form.address} onChange={e => handleChange('address', e.target.value)}
                        rows={3} maxLength={300} autoComplete="street-address"
                        className={`${fieldClass(errors.address)} resize-none pt-3`}
                      />
                    </Field>

                    {/* Notes */}
                    <Field label="ملاحظات (اختياري)">
                      <MdNotes className="field-icon top-3.5 translate-y-0" />
                      <textarea
                        placeholder="أي طلبات خاصة أو حساسيات غذائية..."
                        value={form.notes} onChange={e => handleChange('notes', e.target.value)}
                        rows={2} maxLength={200}
                        className={`${fieldClass()} resize-none pt-3`}
                      />
                    </Field>
                  </div>
                </div>

                {/* Delivery Zone */}
                <div className="dark:bg-zinc-900 bg-white rounded-2xl p-6 border dark:border-zinc-800 border-gray-100">
                  <h2 className="font-bold text-lg dark:text-white text-gray-900 mb-4 flex items-center gap-2">
                    <MdDeliveryDining className="text-gold-500 text-xl" /> منطقة التوصيل
                  </h2>
                  {errors.zone && <p role="alert" className="text-red-400 text-xs mb-3">{errors.zone}</p>}
                  {deliveryZones.length === 0 ? (
                    <p className="text-sm dark:text-zinc-400 text-gray-500">لا توجد مناطق توصيل متاحة حالياً</p>
                  ) : (
                    <div className="space-y-2">
                      {deliveryZones.map(zone => (
                        <label
                          key={zone.id}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedZone?.id === zone.id
                              ? 'border-gold-500 bg-gold-500/10'
                              : 'dark:border-zinc-700 border-gray-200 hover:border-gold-500/50'
                          }`}
                        >
                          <input
                            type="radio" name="zone" className="sr-only"
                            checked={selectedZone?.id === zone.id}
                            onChange={() => { setSelectedZone(zone); setErrors(e => ({ ...e, zone: '' })) }}
                          />
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedZone?.id === zone.id ? 'border-gold-500' : 'dark:border-zinc-600 border-gray-300'
                          }`}>
                            {selectedZone?.id === zone.id && <div className="w-2 h-2 rounded-full bg-gold-500" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold dark:text-white text-gray-900 text-sm">{zone.name}</p>
                            <p className="text-xs dark:text-zinc-500 text-gray-400">{zone.estimatedTime}</p>
                          </div>
                          <span className="font-bold text-gold-500 text-sm">
                            {zone.fee === 0 ? 'مجاناً' : formatPrice(zone.fee)}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment */}
                <div className="dark:bg-zinc-900 bg-white rounded-2xl p-6 border dark:border-zinc-800 border-gray-100">
                  <h2 className="font-bold text-lg dark:text-white text-gray-900 mb-4">طريقة الدفع</h2>
                  <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-gold-500 bg-gold-500/10">
                    <div className="w-4 h-4 rounded-full border-2 border-gold-500 flex items-center justify-center" aria-hidden="true">
                      <div className="w-2 h-2 rounded-full bg-gold-500" />
                    </div>
                    <div>
                      <p className="font-semibold dark:text-white text-gray-900 text-sm">الدفع عند الاستلام</p>
                      <p className="text-xs dark:text-zinc-400 text-gray-500">ادفع كاش عند استلام طلبك</p>
                    </div>
                    <span className="mr-auto text-2xl" aria-hidden="true">💵</span>
                  </div>
                </div>
              </div>

              {/* ── Summary column ── */}
              <div className="lg:col-span-1">
                <div className="dark:bg-zinc-900 bg-white rounded-2xl p-6 border dark:border-zinc-800 border-gray-100 sticky top-24">
                  <h2 className="font-bold text-lg dark:text-white text-gray-900 mb-4 flex items-center gap-2">
                    <MdShoppingCart className="text-gold-500" /> ملخص الطلب
                  </h2>

                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="dark:text-zinc-400 text-gray-600 flex-1 truncate">{item.name} × {item.quantity}</span>
                        <span className="dark:text-white text-gray-900 font-medium mr-2 flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t dark:border-zinc-800 border-gray-200 pt-3 space-y-2 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="dark:text-zinc-400 text-gray-600">المجموع الجزئي</span>
                      <span className="dark:text-white text-gray-900">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="dark:text-zinc-400 text-gray-600">التوصيل</span>
                      <span className={deliveryFee === 0 ? 'text-green-500 font-bold' : 'dark:text-white text-gray-900'}>
                        {selectedZone ? (deliveryFee === 0 ? 'مجاناً' : formatPrice(deliveryFee)) : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t dark:border-zinc-800 border-gray-200 pt-2">
                      <span className="font-bold dark:text-white text-gray-900">الإجمالي</span>
                      <span className="font-bold text-gold-500 text-xl">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <motion.button
                    type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-500/20"
                  >
                    {loading
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><MdWhatsapp className="text-2xl" /> تأكيد الطلب عبر واتساب</>
                    }
                  </motion.button>
                  <p className="text-xs dark:text-zinc-500 text-gray-400 text-center mt-3">
                    سيتم إرسال طلبك لواتساب المطعم تلقائياً
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

/* ── Helpers ── */
function fieldClass(error) {
  return `w-full pr-10 pl-4 py-3 rounded-xl dark:bg-zinc-800 bg-gray-50 border-2 dark:text-white text-gray-900 placeholder-zinc-500 outline-none transition-colors text-sm
    ${error ? 'border-red-500 focus:border-red-500' : 'dark:border-zinc-700 border-gray-200 focus:border-gold-500'}`
}

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium dark:text-zinc-300 text-gray-700 mb-2">{label}</label>
      <div className="relative [&_.field-icon]:absolute [&_.field-icon]:right-3 [&_.field-icon]:top-1/2 [&_.field-icon]:-translate-y-1/2 [&_.field-icon]:text-zinc-400 [&_.field-icon]:text-xl [&_.field-icon]:pointer-events-none">
        {children}
      </div>
      {hint  && !error && <p className="text-zinc-500 text-xs mt-1">{hint}</p>}
      {error && <p role="alert" className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
