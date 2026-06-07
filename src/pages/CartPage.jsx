import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { MdAdd, MdRemove, MdDelete, MdArrowBack, MdDeliveryDining } from 'react-icons/md'
import toast from 'react-hot-toast'
import useStore from '../store/useStore'
import { formatPrice } from '../utils/helpers'

export default function CartPage() {
  // FIX: Granular selectors
  const cartItems     = useStore(s => s.cartItems)
  const selectedZone  = useStore(s => s.selectedZone)
  const updateQuantity = useStore(s => s.updateQuantity)
  const removeFromCart = useStore(s => s.removeFromCart)
  const clearCart      = useStore(s => s.clearCart)
  const getCartSubtotal = useStore(s => s.getCartSubtotal)
  const getDeliveryFee  = useStore(s => s.getDeliveryFee)
  const getCartTotal    = useStore(s => s.getCartTotal)

  const navigate    = useNavigate()
  const subtotal    = getCartSubtotal()
  const deliveryFee = getDeliveryFee()
  const total       = getCartTotal()

  const handleRemove = useCallback((id, name) => {
    removeFromCart(id)
    toast.error(`تم الحذف: ${name}`, { icon: '🗑️' })
  }, [removeFromCart])

  if (cartItems.length === 0) return (
    <>
      <Helmet><title>السلة — مطعم الحبايب</title></Helmet>
      <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pt-20 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="text-8xl mb-6">🛒</motion.div>
          <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-3">السلة فارغة</h2>
          <p className="dark:text-zinc-400 text-gray-500 mb-8">لم تضف أي وجبات بعد</p>
          <Link to="/menu" className="bg-gold-500 hover:bg-gold-600 text-black font-bold px-8 py-3 rounded-xl inline-block transition-all">تصفح المنيو</Link>
        </motion.div>
      </div>
    </>
  )

  return (
    <>
      <Helmet>
        <title>{`السلة (${cartItems.reduce((s, i) => s + i.quantity, 0)}) — مطعم الحبايب`}</title>
      </Helmet>
      <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                aria-label="رجوع"
                className="p-2 rounded-xl dark:hover:bg-zinc-800 hover:bg-gray-200 transition-all"
              >
                <MdArrowBack className="text-xl dark:text-white text-gray-700 rotate-180" />
              </button>
              <h1 className="text-2xl font-bold dark:text-white text-gray-900">
                السلة <span className="text-gold-500">({cartItems.length})</span>
              </h1>
            </div>
            <button
              onClick={() => { clearCart(); toast.success('تم تفريغ السلة') }}
              className="text-red-400 hover:text-red-500 text-sm flex items-center gap-1 transition-colors"
            >
              <MdDelete className="text-base" /> تفريغ الكل
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence>
                {cartItems.map(item => (
                  <motion.div
                    key={item.id} layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="dark:bg-zinc-900 bg-white rounded-2xl p-4 border dark:border-zinc-800 border-gray-100 flex gap-4"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-zinc-800">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold dark:text-white text-gray-900 text-sm mb-1 truncate">{item.name}</h3>
                      <p className="text-gold-500 font-bold text-base">{formatPrice(item.price)}</p>
                      <p className="text-xs dark:text-zinc-500 text-gray-400 mt-1">الإجمالي: {formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => handleRemove(item.id, item.name)}
                        aria-label={`حذف ${item.name}`}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <MdDelete className="text-lg" />
                      </button>
                      <div className="flex items-center gap-2 bg-gold-500 rounded-xl" role="group" aria-label={`كمية ${item.name}`}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="تقليل الكمية"
                          className="p-1.5 hover:bg-gold-600 transition-colors rounded-r-xl"
                        >
                          <MdRemove className="text-black text-sm" />
                        </button>
                        <span className="text-black font-bold text-sm w-6 text-center" aria-live="polite">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="زيادة الكمية"
                          className="p-1.5 hover:bg-gold-600 transition-colors rounded-l-xl"
                        >
                          <MdAdd className="text-black text-sm" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="dark:bg-zinc-900 bg-white rounded-2xl p-6 border dark:border-zinc-800 border-gray-100 sticky top-24">
                <h2 className="font-bold text-lg dark:text-white text-gray-900 mb-5">ملخص الطلب</h2>
                <div className="space-y-2.5 mb-4 max-h-44 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="dark:text-zinc-400 text-gray-600 flex-1 truncate">{item.name} × {item.quantity}</span>
                      <span className="dark:text-white text-gray-900 font-medium ml-2 flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t dark:border-zinc-800 border-gray-200 pt-3 space-y-2 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="dark:text-zinc-400 text-gray-500">المجموع الجزئي</span>
                    <span className="dark:text-white text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  {selectedZone && (
                    <div className="flex justify-between text-sm">
                      <span className="dark:text-zinc-400 text-gray-500 flex items-center gap-1">
                        <MdDeliveryDining className="text-base" /> {selectedZone.name}
                      </span>
                      <span className={deliveryFee === 0 ? 'text-green-500 font-bold' : 'dark:text-white text-gray-900'}>
                        {deliveryFee === 0 ? 'مجاناً' : formatPrice(deliveryFee)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t dark:border-zinc-800 border-gray-200 pt-2">
                    <span className="font-bold dark:text-white text-gray-900">الإجمالي</span>
                    <span className="font-bold text-gold-500 text-xl">{formatPrice(total)}</span>
                  </div>
                </div>

                <motion.div whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/checkout"
                    className="w-full block text-center bg-gold-500 hover:bg-gold-600 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-gold-500/20 text-base"
                  >
                    إتمام الطلب
                  </Link>
                </motion.div>
                <Link to="/menu" className="w-full block text-center mt-3 dark:text-zinc-400 text-gray-500 hover:text-gold-500 text-sm transition-colors py-2">
                  + إضافة المزيد
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
