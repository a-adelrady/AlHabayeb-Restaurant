import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
  MdDeliveryDining,
  MdAccessTime,
  MdAttachMoney,
} from "react-icons/md";
import toast from "react-hot-toast";
import useStore from "../../store/useStore";
import { formatPrice } from "../../utils/helpers";

const EMPTY_ZONE = { name: "", fee: "", estimatedTime: "" };

export default function AdminDelivery() {
  // FIX: granular selectors
  const deliveryZones = useStore((s) => s.deliveryZones);
  const addDeliveryZone = useStore((s) => s.addDeliveryZone);
  const updateDeliveryZone = useStore((s) => s.updateDeliveryZone);
  const deleteDeliveryZone = useStore((s) => s.deleteDeliveryZone);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_ZONE);
  const [errors, setErrors] = useState({});
  // FIX: replace confirm() with in-page confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openAdd = () => {
    setForm(EMPTY_ZONE);
    setEditingId(null);
    setErrors({});
    setShowModal(true);
  };
  const openEdit = (z) => {
    setForm({ ...z, fee: String(z.fee) });
    setEditingId(z.id);
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "اسم المنطقة مطلوب";
    if (form.fee === "") e.fee = "رسوم التوصيل مطلوبة";
    else if (isNaN(Number(form.fee)) || Number(form.fee) < 0)
      e.fee = "أدخل رقماً صحيحاً";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const data = { ...form, fee: parseFloat(form.fee) };
    if (editingId) {
      updateDeliveryZone(editingId, data);
      toast.success("تم التحديث");
    } else {
      addDeliveryZone(data);
      toast.success("تمت الإضافة");
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    deleteDeliveryZone(id);
    setDeleteTarget(null);
    toast.success("تم الحذف");
  };

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">مناطق التوصيل</h1>
            <p className="text-zinc-400 text-sm mt-1">
              إدارة مناطق التوصيل ورسومها
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
          >
            <MdAdd className="text-xl" />
            <span className="hidden sm:inline">إضافة منطقة</span>
          </button>
        </div>

        {/* Delete confirmation inline */}
        <AnimatePresence>
          {deleteTarget && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap"
            >
              <p className="text-red-300 text-sm">
                حذف منطقة <strong>{deleteTarget.name}</strong>؟ هذا الإجراء لا
                يمكن التراجع عنه.
              </p>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleDelete(deleteTarget.id)}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm"
                >
                  حذف
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliveryZones.map((zone) => (
            <motion.div
              key={zone.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 group transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                  <MdDeliveryDining className="text-gold-400 text-2xl" />
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(zone)}
                    aria-label={`تعديل ${zone.name}`}
                    className="p-1.5 bg-zinc-800 hover:bg-gold-500/20 hover:text-gold-400 text-zinc-400 rounded-lg transition-all"
                  >
                    <MdEdit className="text-sm" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(zone)}
                    aria-label={`حذف ${zone.name}`}
                    className="p-1.5 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 rounded-lg transition-all"
                  >
                    <MdDelete className="text-sm" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-white text-base mb-3">
                {zone.name}
              </h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MdAttachMoney className="text-gold-400 text-base flex-shrink-0" />
                  <span className="text-zinc-400">رسوم التوصيل:</span>
                  <span
                    className={`font-bold ${zone.fee === 0 ? "text-green-400" : "text-white"}`}
                  >
                    {zone.fee === 0 ? "مجاناً" : formatPrice(zone.fee)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MdAccessTime className="text-blue-400 text-base flex-shrink-0" />
                  <span className="text-zinc-400">وقت التوصيل:</span>
                  <span className="text-white">
                    {zone.estimatedTime || "—"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}

          {deliveryZones.length === 0 && (
            <div className="col-span-full bg-zinc-900 border border-zinc-800 rounded-2xl py-16 text-center">
              <MdDeliveryDining className="text-5xl text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">
                لا توجد مناطق توصيل. أضف منطقة الآن.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Modal — FIX: replaced inline style positioning with flexbox centering */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl pointer-events-auto"
                role="dialog"
                aria-modal="true"
                aria-label={editingId ? "تعديل منطقة" : "إضافة منطقة"}
              >
                <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
                  <h2 className="font-bold text-white">
                    {editingId ? "تعديل منطقة" : "إضافة منطقة"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    aria-label="إغلاق"
                  >
                    <MdClose className="text-zinc-400 text-xl" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="text-zinc-400 text-xs mb-1 block">
                      اسم المنطقة *
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, name: e.target.value }));
                        setErrors((er) => ({ ...er, name: "" }));
                      }}
                      placeholder="مثال: داخل البلد"
                      className={`w-full px-4 py-2.5 rounded-xl bg-zinc-800 border text-white placeholder-zinc-600 outline-none focus:border-gold-500 text-sm ${errors.name ? "border-red-500" : "border-zinc-700"}`}
                    />
                    {errors.name && (
                      <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs mb-1 block">
                      رسوم التوصيل (ج.م) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.fee}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, fee: e.target.value }));
                        setErrors((er) => ({ ...er, fee: "" }));
                      }}
                      placeholder="0 = مجاناً"
                      className={`w-full px-4 py-2.5 rounded-xl bg-zinc-800 border text-white placeholder-zinc-600 outline-none focus:border-gold-500 text-sm ${errors.fee ? "border-red-500" : "border-zinc-700"}`}
                    />
                    {errors.fee && (
                      <p className="text-red-400 text-xs mt-1">{errors.fee}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs mb-1 block">
                      وقت التوصيل المتوقع
                    </label>
                    <input
                      value={form.estimatedTime}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          estimatedTime: e.target.value,
                        }))
                      }
                      placeholder="مثال: 30-45 دقيقة"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 outline-none focus:border-gold-500 text-sm"
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-black font-bold text-sm"
                    >
                      {editingId ? "حفظ" : "إضافة"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
