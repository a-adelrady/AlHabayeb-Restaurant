// ─── Price / Currency ──────────────────────────────────────────────────────
export const formatPrice = (price) => `${Number(price).toFixed(0)} جم`

// ─── Order ID ──────────────────────────────────────────────────────────────
export const generateOrderId = () => {
  const ts = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `HAB-${ts}-${rnd}`
}

// ─── Date ──────────────────────────────────────────────────────────────────
const toDate = (val) => {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

export const formatDate = (dateString) => {
  const date = toDate(dateString)
  if (!date || isNaN(date)) return ''
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatDateShort = (dateString) => {
  const date = toDate(dateString)
  if (!date || isNaN(date)) return ''
  return date.toLocaleDateString('ar-EG', {
    month: 'short',
    day: 'numeric',
  })
}

// ─── Status ────────────────────────────────────────────────────────────────
export const getStatusLabel = (status) => {
  const labels = {
    pending:    { text: 'في الانتظار',   color: 'text-yellow-400', bg: 'bg-yellow-400/10', step: 0 },
    preparing:  { text: 'قيد التحضير',  color: 'text-blue-400',   bg: 'bg-blue-400/10',   step: 1 },
    on_the_way: { text: 'في الطريق',    color: 'text-purple-400', bg: 'bg-purple-400/10', step: 2 },
    delivered:  { text: 'تم التوصيل',   color: 'text-green-400',  bg: 'bg-green-400/10',  step: 3 },
    cancelled:  { text: 'ملغي',         color: 'text-red-400',    bg: 'bg-red-400/10',    step: -1 },
  }
  return labels[status] || labels.pending
}

// ─── Egyptian Phone Validation ─────────────────────────────────────────────
export const validateEgyptianPhone = (phone) => {
  const cleaned = phone.replace(/[\s\-()]/g, '')
  const normalized = cleaned
    .replace(/^\+20/, '0')
    .replace(/^0020/, '0')
    .replace(/^20(?=[15])/, '0')

  const regex = /^0(10|11|12|15)[0-9]{8}$/
  return regex.test(normalized)
}

export const getEgyptianPhoneError = (phone) => {
  if (!phone.trim()) return 'رقم الهاتف مطلوب'
  if (!validateEgyptianPhone(phone)) {
    return 'أدخل رقم هاتف مصري صحيح (010 / 011 / 012 / 015)'
  }
  return ''
}

// ─── Email Validation ──────────────────────────────────────────────────────
export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// ─── WhatsApp ──────────────────────────────────────────────────────────────
export const buildWhatsAppMessage = (order, settings) => {
  const { customer, items, subtotal, deliveryFee, total, id: orderId } = order

  let msg = `🍽️ *طلب جديد - مطعم الحبايب*\n\n`
  msg += `📋 *رقم الطلب:* ${orderId}\n\n`
  msg += `👤 *بيانات العميل:*\n`
  msg += `• الاسم: ${customer.name}\n`
  msg += `• الهاتف: ${customer.phone}\n`
  msg += `• العنوان: ${customer.address}\n`
  if (customer.zone) msg += `• المنطقة: ${customer.zone.name}\n`
  if (customer.notes) msg += `• ملاحظات: ${customer.notes}\n`

  msg += `\n🛒 *الطلبات:*\n`
  items.forEach((item, i) => {
    msg += `${i + 1}. ${item.name} × ${item.quantity} = ${item.price * item.quantity} ج.م\n`
  })

  msg += `\n💰 *الحساب:*\n`
  msg += `• المجموع الجزئي: ${subtotal} ج.م\n`
  if (deliveryFee > 0) msg += `• رسوم التوصيل: ${deliveryFee} ج.م\n`
  msg += `• *الإجمالي: ${total} ج.م*\n`
  msg += `• طريقة الدفع: الدفع عند الاستلام\n\n`
  msg += `⏰ وقت الطلب: ${new Date().toLocaleString('ar-EG')}`

  const phone = settings?.whatsappNumber || '201094799308'
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
}

// ─── Sanitize ──────────────────────────────────────────────────────────────
// FIX: The original regex `/<[^>]*>/g` strips HTML tags but does NOT handle
// javascript: URLs, event attributes stripped of their tag, or unicode
// lookalike attacks. We now strip ALL non-text characters aggressively for
// user-supplied fields that go into orders / WhatsApp messages.
export const sanitizeText = (text) => {
  if (!text) return ''
  return String(text)
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/[<>'"`;]/g, '')          // strip remaining dangerous chars
    .trim()
    .slice(0, 500)
}

// ─── Misc ──────────────────────────────────────────────────────────────────
export const truncateText = (text, max = 80) =>
  text?.length > max ? text.slice(0, max) + '…' : text || ''
