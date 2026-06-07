import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md'
import toast from 'react-hot-toast'
import useStore from '../../store/useStore'

const EMOJIS = ['🍽️','🔥','🥣','🥪','🍱','🥗','🥤','🍮','🍕','🍔','🥩','🍗','🧆','🫕','🍜','🥞']
const EMPTY = { name: '', icon: '🍽️' }

export default function AdminCategories() {
  // FIX: granular selectors
  const categories    = useStore(s => s.categories)
  const products      = useStore(s => s.products)
  const addCategory   = useStore(s => s.addCategory)
  const updateCategory = useStore(s => s.updateCategory)
  const deleteCategory = useStore(s => s.deleteCategory)

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form,      setForm]      = useState(EMPTY)
  // FIX: replace confirm() with in-page confirmation
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openAdd  = () => { setForm(EMPTY); setEditingId(null); setShowModal(true) }
  const openEdit = (c) => { setForm({ name: c.name, icon: c.icon }); setEditingId(c.id); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('اسم التصنيف مطلوب'); return }
    if (editingId) {
      await updateCategory(editingId, form); toast.success('تم التحديث')
    } else {
      await addCategory(form); toast.success('تمت الإضافة')
    }
    setShowModal(false)
  }

  const confirmDelete = (cat) => {
    if (cat.id === 'all') { toast.error('لا يمكن حذف تصنيف الكل'); return }
    const count = products.filter(p => p.category === cat.id).length
    if (count > 0) { toast.error(`لا يمكن الحذف — ${count} منتج في هذا التصنيف`); return }
    setDeleteTarget(cat)
  }

  const handleDelete = async () => {
    await deleteCategory(deleteTarget.id)
    toast.success('تم الحذف')
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة التصنيفات</h1>
          <p className="text-zinc-400 text-sm mt-1">{categories.length} تصنيف</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-all">
          <MdAdd className="text-xl" /><span className="hidden sm:inline">إضافة تصنيف</span>
        </button>
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-red-300 text-sm">حذف تصنيف <strong>{deleteTarget.name}</strong>؟</p>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm">إلغاء</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm">حذف</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => {
          const count = products.filter(p => p.category === cat.id).length
          return (
            <motion.div key={cat.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4 group hover:border-gold-500/30 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-base">{cat.name}</h3>
                <p className="text-zinc-500 text-xs mt-0.5">{count} منتج</p>
              </div>
              {cat.id !== 'all' && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)} aria-label={`تعديل ${cat.name}`} className="p-2 bg-zinc-800 hover:bg-gold-500/20 hover:text-gold-400 text-zinc-400 rounded-xl transition-all"><MdEdit className="text-base" /></button>
                  <button onClick={() => confirmDelete(cat)} aria-label={`حذف ${cat.name}`} className="p-2 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 rounded-xl transition-all"><MdDelete className="text-base" /></button>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl pointer-events-auto"
                role="dialog" aria-modal="true">
                <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
                  <h2 className="font-bold text-white">{editingId ? 'تعديل تصنيف' : 'إضافة تصنيف'}</h2>
                  <button onClick={() => setShowModal(false)} aria-label="إغلاق"><MdClose className="text-zinc-400 text-xl" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="text-zinc-400 text-xs mb-1 block">اسم التصنيف *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم التصنيف"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 outline-none focus:border-gold-500 text-sm" />
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs mb-2 block">الأيقونة</label>
                    <div className="grid grid-cols-8 gap-2" role="radiogroup" aria-label="اختر أيقونة">
                      {EMOJIS.map(emoji => (
                        <button key={emoji} type="button" onClick={() => setForm(f => ({ ...f, icon: emoji }))}
                          role="radio" aria-checked={form.icon === emoji}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all ${form.icon === emoji ? 'bg-gold-500/20 ring-2 ring-gold-500' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm">إلغاء</button>
                    <button type="submit" className="flex-1 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-black font-bold text-sm">{editingId ? 'حفظ' : 'إضافة'}</button>
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
