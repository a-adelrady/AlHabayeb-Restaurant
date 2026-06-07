import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MdAddShoppingCart, MdAdd, MdRemove, MdStar, MdInventory } from 'react-icons/md'
import toast from 'react-hot-toast'
import useStore from '../../store/useStore'
import { formatPrice } from '../../utils/helpers'

export default function ProductCard({ product }) {
  // FIX: Granular selectors — only the three actions and the specific cart item.
  // Previously subscribed to the full store, so every order/product/settings
  // update caused every visible ProductCard to re-render simultaneously.
  const addToCart      = useStore(s => s.addToCart)
  const updateQuantity = useStore(s => s.updateQuantity)
  const removeFromCart = useStore(s => s.removeFromCart)
  // FIX: selector computes only this product's cart entry — O(n) on cartItems
  // but isolated: only re-renders when THIS item's quantity or presence changes.
  const cartItem = useStore(
    s => s.cartItems.find(i => i.id === product.id),
    // shallow equality — Zustand's default referential equality is fine here
    // because .find() returns the same reference when nothing changed
  )

  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError]   = useState(false)

  const isOutOfStock = product.inStock === false || product.stockQty === 0
  const isLowStock   = !isOutOfStock && product.stockQty !== undefined && product.stockQty < 10

  // FIX: useCallback prevents this function from being recreated on every render
  const handleAdd = useCallback((e) => {
    e.preventDefault()
    if (isOutOfStock) return
    addToCart(product)
    toast.success(`تمت الإضافة: ${product.name}`, { icon: '🛒' })
  }, [addToCart, product, isOutOfStock])

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`dark:bg-zinc-900 bg-white rounded-2xl overflow-hidden shadow-sm dark:shadow-none border dark:border-zinc-800 border-gray-100 group ${isOutOfStock ? 'opacity-70' : ''}`}
    >
      {/* Image */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-gray-200 dark:bg-zinc-800">
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 dark:bg-zinc-800 bg-gray-200 animate-pulse" />
        )}
        {imgError ? (
          <div className="absolute inset-0 flex items-center justify-center text-4xl dark:bg-zinc-800 bg-gray-200">
            🍽️
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true) }}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${product.badgeColor === 'gold' ? 'bg-gold-500 text-black' : 'bg-red-500 text-white'}`}>
            {product.badge}
          </span>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full">نفد المخزون</span>
          </div>
        )}

        {/* Prep time */}
        {product.prepTime && !isOutOfStock && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            ⏱ {product.prepTime}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-bold dark:text-white text-gray-900 text-sm leading-tight flex-1">{product.name}</h3>
          <div className="flex items-center gap-0.5 flex-shrink-0" aria-label={`تقييم ${product.rating} من 5`}>
            <MdStar className="text-gold-500 text-sm" aria-hidden="true" />
            <span className="text-xs text-gold-500 font-semibold">{product.rating}</span>
          </div>
        </div>

        <p className="text-xs dark:text-zinc-400 text-gray-500 leading-relaxed mb-3 line-clamp-2">{product.description}</p>

        {/* Low stock warning */}
        {isLowStock && (
          <div className="flex items-center gap-1 mb-2">
            <MdInventory className="text-yellow-400 text-xs" aria-hidden="true" />
            <span className="text-yellow-400 text-xs">باقي {product.stockQty} فقط</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="font-bold text-gold-500 text-lg">{formatPrice(product.price)}</span>

          {isOutOfStock ? (
            <span className="text-xs text-red-400 font-medium">غير متاح</span>
          ) : cartItem ? (
            <div className="flex items-center bg-gold-500 rounded-xl overflow-hidden" role="group" aria-label={`كمية ${product.name}`}>
              <button
                onClick={() => cartItem.quantity === 1 ? removeFromCart(product.id) : updateQuantity(product.id, cartItem.quantity - 1)}
                aria-label="تقليل الكمية"
                className="p-1.5 hover:bg-gold-600 transition-colors"
              >
                <MdRemove className="text-black text-sm" />
              </button>
              <span className="text-black font-bold text-sm w-6 text-center" aria-live="polite">{cartItem.quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                aria-label="زيادة الكمية"
                className="p-1.5 hover:bg-gold-600 transition-colors"
              >
                <MdAdd className="text-black text-sm" />
              </button>
            </div>
          ) : (
            <motion.button
              onClick={handleAdd}
              whileTap={{ scale: 0.9 }}
              aria-label={`إضافة ${product.name} للسلة`}
              className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-black font-bold px-3 py-2 rounded-xl text-sm transition-colors"
            >
              <MdAddShoppingCart className="text-base" />
              <span className="hidden sm:inline">أضف</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  )
}
