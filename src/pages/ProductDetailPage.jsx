import { useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  MdArrowBack,
  MdAdd,
  MdRemove,
  MdShoppingCart,
  MdStar,
} from "react-icons/md";
import toast from "react-hot-toast";
import useStore from "../store/useStore";
import { formatPrice } from "../utils/helpers";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const addToCart = useStore((s) => s.addToCart);
  const cartItem = useStore((s) => s.cartItems.find((i) => i.id === productId));

  const product = products.find((p) => String(p.id) === String(productId));

  const category = product
    ? categories.find((c) => c.id === product.category)
    : null;
  const orderType = category?.orderType || "simple";

  // الحجم المختار (لو sizes)
  const defaultSize = product?.sizes?.[0] || null;
  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [quantity, setQuantity] = useState(1);

  if (!product)
    return (
      <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="dark:text-white text-gray-900 font-bold text-xl mb-4">
            المنتج غير موجود
          </p>
          <Link
            to="/menu"
            className="bg-gold-500 text-black font-bold px-6 py-3 rounded-xl"
          >
            العودة للمنيو
          </Link>
        </div>
      </div>
    );

  const currentPrice =
    orderType === "sizes" && selectedSize
      ? parseFloat(selectedSize.price) || product.price
      : product.price;

  const isOutOfStock = product.inStock === false || product.stockQty === 0;

  const handleAddToCart = useCallback(() => {
    if (isOutOfStock) return;
    const itemToAdd = {
      ...product,
      id:
        orderType === "sizes" && selectedSize
          ? `${product.id}_${selectedSize.id}`
          : product.id,
      name:
        orderType === "sizes" && selectedSize
          ? `${product.name} — ${selectedSize.label}`
          : product.name,
      price: currentPrice,
    };
    for (let i = 0; i < quantity; i++) addToCart(itemToAdd);
    toast.success(`تمت الإضافة للسلة 🛒`);
    navigate(-1);
  }, [
    product,
    selectedSize,
    quantity,
    currentPrice,
    orderType,
    isOutOfStock,
    addToCart,
    navigate,
  ]);

  return (
    <>
      <Helmet>
        <title>{product.name} — مطعم الحبايب</title>
      </Helmet>

      <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pt-16 pb-32">
        {/* Image */}
        <div className="relative h-64 md:h-80 bg-zinc-800">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center text-white"
          >
            <MdArrowBack className="text-xl rotate-180" />
          </button>
          {product.badge && (
            <span
              className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${
                product.badgeColor === "gold"
                  ? "bg-gold-500 text-black"
                  : "bg-red-500 text-white"
              }`}
            >
              {product.badge}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-10">
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 shadow-xl border dark:border-zinc-800 border-gray-100 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-2xl font-bold dark:text-white text-gray-900 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                  <MdStar className="text-gold-500 text-lg" />
                  <span className="text-gold-500 font-bold text-sm">
                    {product.rating}
                  </span>
                </div>
              </div>
              {product.description && (
                <p className="dark:text-zinc-400 text-gray-500 text-sm leading-relaxed">
                  {product.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs dark:text-zinc-500 text-gray-400">
                {product.calories > 0 && (
                  <span>🔥 {product.calories} سعرة</span>
                )}
                {product.prepTime && <span>⏱ {product.prepTime}</span>}
              </div>
            </div>

            {/* الأحجام */}
            {orderType === "sizes" && product.sizes?.length > 0 && (
              <div>
                <h3 className="font-bold dark:text-white text-gray-900 mb-3 text-sm">
                  اختر الحجم
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {product.sizes.map((size) => (
                    <motion.button
                      key={size.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setSelectedSize(size)}
                      className={`p-3 rounded-2xl border-2 transition-all text-center ${
                        selectedSize?.id === size.id
                          ? "border-gold-500 bg-gold-500/10"
                          : "dark:border-zinc-700 border-gray-200 dark:hover:border-zinc-600"
                      }`}
                    >
                      <p
                        className={`font-bold text-sm ${selectedSize?.id === size.id ? "text-gold-500" : "dark:text-white text-gray-900"}`}
                      >
                        {size.label}
                      </p>
                      <p className="text-xs dark:text-zinc-400 text-gray-500 mt-0.5">
                        {formatPrice(parseFloat(size.price) || 0)}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* الكمية */}
            {(orderType === "quantity" || orderType === "sizes") && (
              <div>
                <h3 className="font-bold dark:text-white text-gray-900 mb-3 text-sm">
                  الكمية
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gold-500 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-4 py-3 hover:bg-gold-600 transition-colors"
                    >
                      <MdRemove className="text-black text-lg" />
                    </button>
                    <span className="text-black font-bold text-xl w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-4 py-3 hover:bg-gold-600 transition-colors"
                    >
                      <MdAdd className="text-black text-lg" />
                    </button>
                  </div>
                  <p className="dark:text-zinc-400 text-gray-500 text-sm">
                    الإجمالي:{" "}
                    <span className="text-gold-500 font-bold text-lg">
                      {formatPrice(currentPrice * quantity)}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 dark:bg-zinc-950/95 bg-white/95 backdrop-blur-lg border-t dark:border-zinc-800 border-gray-200 z-40">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <div>
              <p className="text-xs dark:text-zinc-500 text-gray-400">
                الإجمالي
              </p>
              <p className="font-bold text-gold-500 text-xl">
                {formatPrice(currentPrice * quantity)}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={
                isOutOfStock || (orderType === "sizes" && !selectedSize)
              }
              className="flex-1 flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl transition-all shadow-lg shadow-gold-500/20 text-base"
            >
              <MdShoppingCart className="text-xl" />
              {isOutOfStock ? "نفد المخزون" : "إضافة للسلة"}
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
}
