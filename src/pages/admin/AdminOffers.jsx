import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
  MdLocalOffer,
  MdCardGiftcard,
  MdToggleOn,
  MdToggleOff,
  MdContentCopy,
} from "react-icons/md";
import toast from "react-hot-toast";
import useStore from "../../store/useStore";

const GRADIENTS = [
  { value: "from-orange-600 to-red-600", label: "برتقالي" },
  { value: "from-emerald-600 to-teal-600", label: "أخضر" },
  { value: "from-purple-600 to-pink-600", label: "بنفسجي" },
  { value: "from-blue-600 to-indigo-600", label: "أزرق" },
  { value: "from-yellow-600 to-orange-500", label: "ذهبي" },
  { value: "from-rose-600 to-red-700", label: "أحمر" },
];

const EMPTY_OFFER = {
  title: "",
  description: "",
  discount: "",
  color: GRADIENTS[0].value,
  image: "",
  active: true,
  expiresAt: "",
};

const EMPTY_COUPON = {
  code: "",
  type: "percent",
  value: "",
  minOrder: "",
  maxUses: "",
  expiresAt: "",
  active: true,
};

export default function AdminOffers() {
  const offers = useStore((s) => s.offers);
  const coupons = useStore((s) => s.coupons);
  const addOffer = useStore((s) => s.addOffer);
  const updateOffer = useStore((s) => s.updateOffer);
  const deleteOffer = useStore((s) => s.deleteOffer);
  const addCoupon = useStore((s) => s.addCoupon);
  const updateCoupon = useStore((s) => s.updateCoupon);
  const deleteCoupon = useStore((s) => s.deleteCoupon);

  const [tab, setTab] = useState("offers");

  // Offers state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [offerForm, setOfferForm] = useState(EMPTY_OFFER);
  const [deleteOTarget, setDeleteOTarget] = useState(null);

  // Coupons state
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [couponForm, setCouponForm] = useState(EMPTY_COUPON);
  const [deleteCTarget, setDeleteCTarget] = useState(null);

  // ── Offers handlers ──────────────────────────────────────────────────────
  const openAddOffer = () => {
    setOfferForm(EMPTY_OFFER);
    setEditingOfferId(null);
    setShowOfferModal(true);
  };
  const openEditOffer = (o) => {
    setOfferForm({ ...o, expiresAt: o.expiresAt || "" });
    setEditingOfferId(o.id);
    setShowOfferModal(true);
  };

  const handleOfferSubmit = (e) => {
    e.preventDefault();
    if (!offerForm.title.trim()) {
      toast.error("العنوان مطلوب");
      return;
    }
    if (editingOfferId) {
      updateOffer(editingOfferId, {
        ...offerForm,
        expiresAt: offerForm.expiresAt || null,
      });
      toast.success("تم التحديث");
    } else {
      addOffer({ ...offerForm, expiresAt: offerForm.expiresAt || null });
      toast.success("تمت الإضافة");
    }
    setShowOfferModal(false);
  };

  // ── Coupons handlers ─────────────────────────────────────────────────────
  const openAddCoupon = () => {
    setCouponForm(EMPTY_COUPON);
    setEditingCouponId(null);
    setShowCouponModal(true);
  };
  const openEditCoupon = (c) => {
    setCouponForm({
      ...c,
      expiresAt: c.expiresAt || "",
      maxUses: c.maxUses || "",
      minOrder: c.minOrder || "",
    });
    setEditingCouponId(c.id);
    setShowCouponModal(true);
  };

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      toast.error("كود الكوبون مطلوب");
      return;
    }
    if (!couponForm.value) {
      toast.error("قيمة الخصم مطلوبة");
      return;
    }
    const data = {
      ...couponForm,
      code: couponForm.code.trim().toUpperCase(),
      value: parseFloat(couponForm.value),
      minOrder: couponForm.minOrder ? parseFloat(couponForm.minOrder) : null,
      maxUses: couponForm.maxUses ? parseInt(couponForm.maxUses) : null,
      expiresAt: couponForm.expiresAt || null,
    };
    if (editingCouponId) {
      updateCoupon(editingCouponId, data);
      toast.success("تم التحديث");
    } else {
      addCoupon(data);
      toast.success("تمت الإضافة");
    }
    setShowCouponModal(false);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => toast.success("تم النسخ"));
  };

  const isExpired = (expiresAt) =>
    expiresAt && new Date(expiresAt) < new Date();

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">العروض والكوبونات</h1>
            <p className="text-zinc-400 text-sm mt-1">
              {offers.length} عرض · {coupons.length} كوبون
            </p>
          </div>
          <button
            onClick={tab === "offers" ? openAddOffer : openAddCoupon}
            className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
          >
            <MdAdd className="text-xl" />
            {tab === "offers" ? "إضافة عرض" : "إضافة كوبون"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2" role="tablist">
          {[
            {
              id: "offers",
              label: "سكشن العروض",
              icon: MdLocalOffer,
              count: offers.length,
            },
            {
              id: "coupons",
              label: "كوبونات الخصم",
              icon: MdCardGiftcard,
              count: coupons.length,
            },
          ].map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? "bg-gold-500 text-black"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <t.icon className="text-base" />
              {t.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-black/20" : "bg-zinc-700 text-zinc-300"}`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Offers Tab ── */}
        {tab === "offers" && (
          <>
            {/* Delete confirm */}
            <AnimatePresence>
              {deleteOTarget && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap"
                >
                  <p className="text-red-300 text-sm">
                    حذف عرض <strong>{deleteOTarget.title}</strong>؟
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteOTarget(null)}
                      className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => {
                        deleteOffer(deleteOTarget.id);
                        setDeleteOTarget(null);
                        toast.success("تم الحذف");
                      }}
                      className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-sm"
                    >
                      حذف
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map((offer) => (
                <motion.div
                  key={offer.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
                >
                  {/* Preview */}
                  <div
                    className={`relative h-28 bg-gradient-to-bl ${offer.color} flex items-center justify-center`}
                  >
                    {offer.image && (
                      <img
                        src={offer.image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <span className="relative text-white font-bold text-2xl">
                      {offer.discount} خصم
                    </span>
                    {!offer.active && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-red-500/80 px-3 py-1 rounded-full">
                          معطّل
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">
                          {offer.title}
                        </p>
                        <p className="text-zinc-500 text-xs mt-0.5 line-clamp-2">
                          {offer.description}
                        </p>
                      </div>
                    </div>
                    {offer.expiresAt && (
                      <p
                        className={`text-xs mb-2 ${isExpired(offer.expiresAt) ? "text-red-400" : "text-zinc-500"}`}
                      >
                        {isExpired(offer.expiresAt)
                          ? "⚠️ منتهي: "
                          : "⏰ ينتهي: "}
                        {new Date(offer.expiresAt).toLocaleDateString("ar-EG")}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() =>
                          updateOffer(offer.id, { active: !offer.active })
                        }
                        className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all ${offer.active ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"}`}
                      >
                        {offer.active ? (
                          <MdToggleOn className="text-base" />
                        ) : (
                          <MdToggleOff className="text-base" />
                        )}
                        {offer.active ? "مفعّل" : "معطّل"}
                      </button>
                      <button
                        onClick={() => openEditOffer(offer)}
                        className="p-1.5 bg-zinc-800 hover:bg-gold-500/20 hover:text-gold-400 text-zinc-400 rounded-lg transition-all mr-auto"
                      >
                        <MdEdit className="text-sm" />
                      </button>
                      <button
                        onClick={() => setDeleteOTarget(offer)}
                        className="p-1.5 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 rounded-lg transition-all"
                      >
                        <MdDelete className="text-sm" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* ── Coupons Tab ── */}
        {tab === "coupons" && (
          <>
            <AnimatePresence>
              {deleteCTarget && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap"
                >
                  <p className="text-red-300 text-sm">
                    حذف كوبون <strong>{deleteCTarget.code}</strong>؟
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteCTarget(null)}
                      className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => {
                        deleteCoupon(deleteCTarget.id);
                        setDeleteCTarget(null);
                        toast.success("تم الحذف");
                      }}
                      className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-sm"
                    >
                      حذف
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {coupons.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl py-16 text-center">
                <MdCardGiftcard className="text-5xl text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">لا توجد كوبونات بعد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {coupons.map((coupon) => (
                  <motion.div
                    key={coupon.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`bg-zinc-900 border rounded-2xl p-4 flex items-center gap-4 flex-wrap ${
                      !coupon.active || isExpired(coupon.expiresAt)
                        ? "border-red-500/20 opacity-60"
                        : "border-zinc-800"
                    }`}
                  >
                    {/* Code */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gold-400 text-lg tracking-wider bg-gold-500/10 border border-gold-500/20 px-4 py-2 rounded-xl">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => copyCode(coupon.code)}
                        className="p-2 text-zinc-500 hover:text-gold-400 transition-colors"
                      >
                        <MdContentCopy className="text-base" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-bold text-sm">
                          {coupon.type === "percent"
                            ? `خصم ${coupon.value}%`
                            : `خصم ${coupon.value} ج.م`}
                        </span>
                        {coupon.minOrder && (
                          <span className="text-zinc-500 text-xs">
                            | حد أدنى {coupon.minOrder} ج.م
                          </span>
                        )}
                        {coupon.maxUses && (
                          <span className="text-zinc-500 text-xs">
                            | {coupon.usedCount}/{coupon.maxUses} استخدام
                          </span>
                        )}
                      </div>
                      {coupon.expiresAt && (
                        <p
                          className={`text-xs mt-0.5 ${isExpired(coupon.expiresAt) ? "text-red-400" : "text-zinc-500"}`}
                        >
                          {isExpired(coupon.expiresAt)
                            ? "⚠️ منتهي"
                            : `⏰ ينتهي ${new Date(coupon.expiresAt).toLocaleDateString("ar-EG")}`}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          updateCoupon(coupon.id, { active: !coupon.active })
                        }
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all ${coupon.active ? "bg-green-500/10 text-green-400" : "bg-zinc-800 text-zinc-500"}`}
                      >
                        {coupon.active ? "مفعّل" : "معطّل"}
                      </button>
                      <button
                        onClick={() => openEditCoupon(coupon)}
                        className="p-1.5 bg-zinc-800 hover:bg-gold-500/20 hover:text-gold-400 text-zinc-400 rounded-lg"
                      >
                        <MdEdit className="text-sm" />
                      </button>
                      <button
                        onClick={() => setDeleteCTarget(coupon)}
                        className="p-1.5 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 rounded-lg"
                      >
                        <MdDelete className="text-sm" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {/* ── Offer Modal ── */}
      <AnimatePresence>
        {showOfferModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50"
              onClick={() => setShowOfferModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl overflow-y-auto max-h-[90vh] pointer-events-auto"
                role="dialog"
                aria-modal="true"
              >
                <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
                  <h2 className="font-bold text-white">
                    {editingOfferId ? "تعديل عرض" : "إضافة عرض"}
                  </h2>
                  <button
                    onClick={() => setShowOfferModal(false)}
                    aria-label="إغلاق"
                  >
                    <MdClose className="text-zinc-400 text-xl" />
                  </button>
                </div>
                <form onSubmit={handleOfferSubmit} className="p-6 space-y-4">
                  <Field label="عنوان العرض *">
                    <Input
                      value={offerForm.title}
                      onChange={(v) =>
                        setOfferForm((f) => ({ ...f, title: v }))
                      }
                      placeholder="مثال: وجبة الاثنين"
                    />
                  </Field>
                  <Field label="الوصف">
                    <Input
                      value={offerForm.description}
                      onChange={(v) =>
                        setOfferForm((f) => ({ ...f, description: v }))
                      }
                      placeholder="تفاصيل العرض"
                    />
                  </Field>
                  <Field label="نسبة الخصم *">
                    <Input
                      value={offerForm.discount}
                      onChange={(v) =>
                        setOfferForm((f) => ({ ...f, discount: v }))
                      }
                      placeholder="مثال: 50%"
                    />
                  </Field>
                  <Field label="رابط الصورة">
                    <Input
                      value={offerForm.image}
                      onChange={(v) =>
                        setOfferForm((f) => ({ ...f, image: v }))
                      }
                      placeholder="https://..."
                      dir="ltr"
                    />
                  </Field>
                  <Field label="لون الخلفية">
                    <div className="grid grid-cols-3 gap-2">
                      {GRADIENTS.map((g) => (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() =>
                            setOfferForm((f) => ({ ...f, color: g.value }))
                          }
                          className={`h-12 rounded-xl bg-gradient-to-bl ${g.value} text-white text-xs font-bold transition-all ${offerForm.color === g.value ? "ring-2 ring-white" : "opacity-70 hover:opacity-100"}`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="تاريخ الانتهاء (اختياري)">
                    <Input
                      type="datetime-local"
                      value={offerForm.expiresAt}
                      onChange={(v) =>
                        setOfferForm((f) => ({ ...f, expiresAt: v }))
                      }
                      dir="ltr"
                    />
                  </Field>
                  <label className="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={offerForm.active}
                      onChange={(e) =>
                        setOfferForm((f) => ({
                          ...f,
                          active: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-gold-500"
                    />
                    <span className="text-zinc-300 text-sm">العرض مفعّل</span>
                  </label>
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowOfferModal(false)}
                      className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-black font-bold text-sm"
                    >
                      {editingOfferId ? "حفظ" : "إضافة"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Coupon Modal ── */}
      <AnimatePresence>
        {showCouponModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50"
              onClick={() => setShowCouponModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <div
                className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl pointer-events-auto"
                role="dialog"
                aria-modal="true"
              >
                <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
                  <h2 className="font-bold text-white">
                    {editingCouponId ? "تعديل كوبون" : "إضافة كوبون"}
                  </h2>
                  <button
                    onClick={() => setShowCouponModal(false)}
                    aria-label="إغلاق"
                  >
                    <MdClose className="text-zinc-400 text-xl" />
                  </button>
                </div>
                <form onSubmit={handleCouponSubmit} className="p-6 space-y-4">
                  <Field
                    label="كود الكوبون *"
                    hint="حروف وأرقام بالإنجليزي فقط"
                  >
                    <Input
                      value={couponForm.code}
                      onChange={(v) =>
                        setCouponForm((f) => ({
                          ...f,
                          code: v.toUpperCase(),
                        }))
                      }
                      placeholder="مثال: WELCOME20"
                      dir="ltr"
                      className="uppercase tracking-widest"
                    />
                  </Field>
                  <Field label="نوع الخصم">
                    <div className="flex gap-2">
                      {[
                        { v: "percent", l: "نسبة مئوية %" },
                        { v: "fixed", l: "مبلغ ثابت ج.م" },
                      ].map((t) => (
                        <button
                          key={t.v}
                          type="button"
                          onClick={() =>
                            setCouponForm((f) => ({ ...f, type: t.v }))
                          }
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${couponForm.type === t.v ? "bg-gold-500 text-black" : "bg-zinc-800 text-zinc-400"}`}
                        >
                          {t.l}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field
                    label={
                      couponForm.type === "percent"
                        ? "نسبة الخصم (%) *"
                        : "مبلغ الخصم (ج.م) *"
                    }
                  >
                    <Input
                      type="number"
                      min="1"
                      max={couponForm.type === "percent" ? "100" : undefined}
                      value={couponForm.value}
                      onChange={(v) =>
                        setCouponForm((f) => ({ ...f, value: v }))
                      }
                      placeholder={couponForm.type === "percent" ? "20" : "50"}
                      dir="ltr"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="الحد الأدنى للطلب (ج.م)">
                      <Input
                        type="number"
                        min="0"
                        value={couponForm.minOrder}
                        onChange={(v) =>
                          setCouponForm((f) => ({ ...f, minOrder: v }))
                        }
                        placeholder="0"
                        dir="ltr"
                      />
                    </Field>
                    <Field label="الحد الأقصى للاستخدام">
                      <Input
                        type="number"
                        min="1"
                        value={couponForm.maxUses}
                        onChange={(v) =>
                          setCouponForm((f) => ({ ...f, maxUses: v }))
                        }
                        placeholder="بلا حد"
                        dir="ltr"
                      />
                    </Field>
                  </div>
                  <Field label="تاريخ الانتهاء (اختياري)">
                    <Input
                      type="datetime-local"
                      value={couponForm.expiresAt}
                      onChange={(v) =>
                        setCouponForm((f) => ({ ...f, expiresAt: v }))
                      }
                      dir="ltr"
                    />
                  </Field>
                  <label className="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={couponForm.active}
                      onChange={(e) =>
                        setCouponForm((f) => ({
                          ...f,
                          active: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-gold-500"
                    />
                    <span className="text-zinc-300 text-sm">الكوبون مفعّل</span>
                  </label>
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCouponModal(false)}
                      className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-black font-bold text-sm"
                    >
                      {editingCouponId ? "حفظ" : "إضافة"}
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

// Sub-components
function Field({ label, hint, children }) {
  return (
    <div>
      <label className="text-zinc-400 text-xs mb-1.5 block">{label}</label>
      {children}
      {hint && <p className="text-zinc-600 text-xs mt-1">{hint}</p>}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  dir = "rtl",
  min,
  max,
}) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      dir={dir}
      min={min}
      max={max}
      className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-gold-500 text-white placeholder-zinc-600 outline-none transition-colors text-sm"
    />
  );
}
