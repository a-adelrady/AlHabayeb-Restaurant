import { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdStar, MdCloudUpload, MdInventory } from 'react-icons/md'
import toast from 'react-hot-toast'
import useStore from '../../store/useStore'
import { formatPrice } from '../../utils/helpers'
import { uploadProductImage } from '../../services/storageService'

const STOCK_STATUS = {
  high: { label: 'متاح',         color: 'text-green-400',  bg: 'bg-green-400/10' },
  low:  { label: 'كمية محدودة', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  out:  { label: 'نفد المخزون', color: 'text-red-400',    bg: 'bg-red-400/10' },
}

function getStockStatus(qty) {
  if (qty === 0) return 'out'
  if (qty < 10)  return 'low'
  return 'high'
}

const EMPTY = {
  name: '', category: 'grills', price: '', description: '',
  image: '', badge: '', badgeColor: 'gold', rating: 4.5,
  reviews: 0, isPopular: false, calories: '', prepTime: '',
  inStock: true, stockQty: 50,
}

export default function AdminProducts() {
  // FIX: granular selectors
  const products       = useStore(s => s.products)
  const categories     = useStore(s => s.categories)
  const addProduct     = useStore(s => s.addProduct)
  const updateProduct  = useStore(s => s.updateProduct)
  const deleteProduct  = useStore(s => s.deleteProduct)

  const [search,     setSearch]     = useState('')
  const [filterCat,  setFilterCat]  = useState('all')
  const [showModal,  setShowModal]  = useState(false)
  const [editingId,  setEditingId]  = useState(null)
  const [form,       setForm]       = useState(EMPTY)
  const [uploading,  setUploading]  = useState(false)
  const [uploadPct,  setUploadPct]  = useState(0)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const fileRef = useRef(null)

  // FIX: wrapped in useMemo
  const filtered = useMemo(() => products.filter(p => {
    const matchCat = filterCat === 'all' || p.category === filterCat
    const matchSearch = !search || p.name.includes(search) || (p.description || '').includes(search)
    return matchCat && matchSearch
  }), [products, filterCat, search])

  const openAdd  = () => { setForm(EMPTY); setEditingId(null); setShowModal(true) }
  const openEdit = (p) => { setForm({ ...EMPTY, ...p, price: String(p.price), stockQty: String(p.stockQty ?? 50) }); setEditingId(p.id); setShowModal(true) }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('الصورة أكبر من 5MB'); return }
    setUploading(true)
    try {
      const url = await uploadProductImage(file, `prod_${Date.now()}`, setUploadPct)
      setForm(f => ({ ...f, image: url }))
      toast.success('تم رفع الصورة')
    } catch {
      toast.error('فشل رفع الصورة')
    } finally {
      setUploading(false); setUploadPct(0)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('اسم المنتج مطلوب'); return }
    if (!form.price)       { toast.error('السعر مطلوب'); return }
    if (!form.image)       { toast.error('صورة المنتج مطلوبة'); return }
    const stockQty = parseInt(form.stockQty) || 0
    const data = {
      ...form,
      price:    parseFloat(form.price),
      calories: parseInt(form.calories) || 0,
      stockQty,
      inStock:  stockQty > 0,
    }
    if (editingId) {
      await updateProduct(editingId, data); toast.success('تم التحديث')
    } else {
      await addProduct(data); toast.success('تمت الإضافة')
    }
    setShowModal(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteProduct(deleteTarget.id)
    toast.success('تم حذف المنتج')
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة المنتجات</h1>
          <p className="text-zinc-400 text-sm mt-1">{products.length} منتج</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-all">
          <MdAdd className="text-xl" /><span className="hidden sm:inline">إضافة منتج</span>
        </button>
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-red-300 text-sm">حذف منتج <strong>{deleteTarget.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm">إلغاء</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm">حذف</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xl" />
          <input type="search" placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)}
            aria-label="بحث في المنتجات"
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 outline-none focus:border-gold-500 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[{ id: 'all', name: 'الكل' }, ...categories.filter(c => c.id !== 'all')].map(c => (
            <button key={c.id} onClick={() => setFilterCat(c.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${filterCat === c.id ? 'bg-gold-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl py-16 text-center">
          <p className="text-zinc-500 text-sm">لا توجد منتجات{search ? ` تطابق "${search}"` : ''}</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(p => {
          const st    = getStockStatus(p.stockQty ?? 99)
          const stCfg = STOCK_STATUS[st]
          return (
            <motion.article key={p.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-zinc-700 transition-all">
              <div className="relative h-44 overflow-hidden bg-zinc-800">
                <img src={p.image} alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={e => { e.target.style.display = 'none' }}
                />
                {p.badge && (
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${p.badgeColor === 'gold' ? 'bg-gold-500 text-black' : 'bg-red-500 text-white'}`}>
                    {p.badge}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => openEdit(p)} aria-label={`تعديل ${p.name}`}
                    className="w-10 h-10 bg-gold-500 hover:bg-gold-600 text-black rounded-xl flex items-center justify-center">
                    <MdEdit />
                  </button>
                  <button onClick={() => setDeleteTarget(p)} aria-label={`حذف ${p.name}`}
                    className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center">
                    <MdDelete />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-white text-sm flex-1">{p.name}</h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <MdStar className="text-gold-400 text-sm" /><span className="text-xs text-gold-400">{p.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gold-400 font-bold">{formatPrice(p.price)}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${stCfg.color} ${stCfg.bg}`}>{stCfg.label}</span>
                    {p.stockQty !== undefined && <span className="text-zinc-600 text-xs">{p.stockQty}</span>}
                  </div>
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>

      {/* Modal — FIX: replaced inline style centering with flex */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl overflow-y-auto max-h-[92vh] pointer-events-auto"
                role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
                  <h2 className="font-bold text-white text-lg">{editingId ? 'تعديل منتج' : 'إضافة منتج'}</h2>
                  <button onClick={() => setShowModal(false)} aria-label="إغلاق" className="p-2 hover:bg-zinc-800 rounded-xl">
                    <MdClose className="text-zinc-400 text-xl" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Image */}
                  <div>
                    <label className="text-zinc-400 text-xs mb-2 block">صورة المنتج *</label>
                    <div className="relative">
                      {form.image ? (
                        <div className="relative">
                          <img src={form.image} alt="" className="h-36 w-full object-cover rounded-xl" onError={e => { e.target.style.display = 'none' }} />
                          <button type="button" onClick={() => setForm(f => ({ ...f, image: '' }))}
                            className="absolute top-2 left-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600">
                            <MdClose className="text-sm" />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => fileRef.current?.click()}
                          className="w-full h-28 border-2 border-dashed border-zinc-700 hover:border-gold-500 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors text-zinc-500 hover:text-gold-400">
                          {uploading
                            ? <><div className="w-5 h-5 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" /><span className="text-xs">{uploadPct}%</span></>
                            : <><MdCloudUpload className="text-3xl" /><span className="text-xs">ارفع صورة أو ألصق رابط</span></>
                          }
                        </button>
                      )}
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </div>
                    <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                      placeholder="أو الصق رابط الصورة هنا..."
                      className="mt-2 w-full px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 outline-none focus:border-gold-500 text-xs" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-zinc-400 text-xs mb-1 block">اسم المنتج *</label>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم الوجبة"
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 outline-none focus:border-gold-500 text-sm" />
                    </div>
                    <div>
                      <label className="text-zinc-400 text-xs mb-1 block">السعر (ج.م) *</label>
                      <input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0"
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 outline-none focus:border-gold-500 text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 text-xs mb-1 block">التصنيف</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-gold-500 text-sm">
                      {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 text-xs mb-1 block">الوصف</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف الوجبة..."
                      rows={2} className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 outline-none focus:border-gold-500 text-sm resize-none" />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-zinc-400 text-xs mb-1 block">الكمية المتاحة</label>
                      <div className="relative">
                        <MdInventory className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-base" />
                        <input type="number" min="0" value={form.stockQty} onChange={e => setForm(f => ({ ...f, stockQty: e.target.value }))}
                          className="w-full pr-9 pl-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-gold-500 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="text-zinc-400 text-xs mb-1 block">وقت التحضير</label>
                      <input value={form.prepTime} onChange={e => setForm(f => ({ ...f, prepTime: e.target.value }))} placeholder="20 دقيقة"
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 outline-none focus:border-gold-500 text-sm" />
                    </div>
                    <div>
                      <label className="text-zinc-400 text-xs mb-1 block">شارة</label>
                      <input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="الأكثر طلباً"
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 outline-none focus:border-gold-500 text-sm" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl">
                    <input type="checkbox" id="pop" checked={!!form.isPopular} onChange={e => setForm(f => ({ ...f, isPopular: e.target.checked }))} className="w-4 h-4 accent-gold-500" />
                    <label htmlFor="pop" className="text-zinc-300 text-sm cursor-pointer">ضمن الأكثر طلباً في الرئيسية</label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-all text-sm">إلغاء</button>
                    <button type="submit" className="flex-1 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-black font-bold transition-all text-sm">{editingId ? 'حفظ التعديلات' : 'إضافة المنتج'}</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
