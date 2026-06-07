import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdSearch, MdClose } from 'react-icons/md'
import { Helmet } from 'react-helmet-async'
import ProductCard from '../components/common/ProductCard'
import useStore from '../store/useStore'

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [sortBy,         setSortBy]         = useState('default')

  // FIX: granular selectors
  const products   = useStore(s => s.products)
  const categories = useStore(s => s.categories)

  const filtered = useMemo(() => {
    let result = products.filter(p => p.inStock !== false)

    if (activeCategory !== 'all') result = result.filter(p => p.category === activeCategory)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      )
    }
    // FIX: sorting mutates the result array - use [...result] slice or toSorted when available
    const sorted = [...result]
    if (sortBy === 'price_asc')  sorted.sort((a, b) => a.price - b.price)
    if (sortBy === 'price_desc') sorted.sort((a, b) => b.price - a.price)
    if (sortBy === 'rating')     sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    if (sortBy === 'popular')    sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
    return sorted
  }, [products, activeCategory, searchQuery, sortBy])

  // All products including out-of-stock, for the count display
  const totalInCategory = useMemo(() => {
    if (activeCategory === 'all') return products.length
    return products.filter(p => p.category === activeCategory).length
  }, [products, activeCategory])

  return (
    <>
      <Helmet>
        <title>المنيو — مطعم الحبايب</title>
        <meta name="description" content="تصفح منيو مطعم الحبايب — مشاوي، كشري، حمام محشي، سندويشات وأكثر. أسعار مناسبة وتوصيل سريع." />
      </Helmet>

      <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pt-20">
        {/* Sticky filter bar */}
        <div className="dark:bg-zinc-900 bg-white border-b dark:border-zinc-800 border-gray-200 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex gap-3 mb-3">
              <div className="flex-1 relative">
                <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xl" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="ابحث عن وجبة..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label="البحث في المنيو"
                  className="w-full pr-10 pl-10 py-2.5 rounded-xl dark:bg-zinc-800 bg-gray-50 border dark:border-zinc-700 border-gray-200 dark:text-white text-gray-900 placeholder-zinc-500 outline-none focus:border-gold-500 text-sm transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="مسح البحث"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <MdClose className="text-lg" />
                  </button>
                )}
              </div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                aria-label="ترتيب المنتجات"
                className="px-3 py-2.5 rounded-xl dark:bg-zinc-800 bg-gray-50 border dark:border-zinc-700 border-gray-200 dark:text-white text-gray-900 outline-none focus:border-gold-500 text-sm appearance-none cursor-pointer min-w-[100px]"
              >
                <option value="default">الترتيب</option>
                <option value="popular">الأكثر طلباً</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="price_asc">السعر: الأقل</option>
                <option value="price_desc">السعر: الأعلى</option>
              </select>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1" role="tablist" aria-label="تصنيفات المنيو">
              {categories.map(cat => (
                <motion.button
                  key={cat.id}
                  role="tab"
                  aria-selected={activeCategory === cat.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0
                    ${activeCategory === cat.id
                      ? 'bg-gold-500 text-black shadow-md shadow-gold-500/20'
                      : 'dark:bg-zinc-800 bg-gray-100 dark:text-zinc-300 text-gray-600 dark:hover:bg-zinc-700 hover:bg-gray-200'}`}
                >
                  <span aria-hidden="true">{cat.icon}</span><span>{cat.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <p className="dark:text-zinc-400 text-gray-500 text-sm">
              {filtered.length} من {totalInCategory} منتج
              {searchQuery && <span className="text-gold-500"> في &quot;{searchQuery}&quot;</span>}
            </p>
            {(searchQuery || activeCategory !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all') }}
                className="text-gold-500 hover:text-gold-400 text-sm font-medium"
              >
                مسح الفلترة
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24"
              >
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-bold dark:text-white text-gray-900 mb-2">لا توجد نتائج</h3>
                <p className="dark:text-zinc-400 text-gray-500 text-sm mb-4">جرب كلمات بحث مختلفة أو تصنيف آخر</p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('all') }}
                  className="text-gold-500 hover:text-gold-400 text-sm font-semibold underline"
                >
                  عرض كل المنتجات
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`${activeCategory}-${searchQuery}-${sortBy}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
              >
                {filtered.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.5) }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
