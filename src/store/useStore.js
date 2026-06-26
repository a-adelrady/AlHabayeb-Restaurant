import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateOrderId } from "../utils/helpers";
import { PRODUCTS, CATEGORIES, DEFAULT_DELIVERY_ZONES } from "../utils/data";
import {
  fsCreateOrder,
  fsUpdateOrderStatus,
  fsAddProduct,
  fsUpdateProduct,
  fsDeleteProduct,
  fsAddCategory,
  fsUpdateCategory,
  fsDeleteCategory,
  fsUpdateSettings,
  fsSaveOffer,
  fsDeleteOffer,
  fsSaveCoupon,
  fsDeleteCoupon,
  fsMarkNotificationRead,
  fsMarkAllNotificationsRead,
} from "../services/firestoreService";

const useStore = create(
  persist(
    (set, get) => ({
      // ── Theme ──────────────────────────────────────────────────────────
      isDark: true,
      toggleTheme: () => {
        const newDark = !get().isDark;
        set({ isDark: newDark });
        document.documentElement.classList.toggle("dark", newDark);
      },
      initTheme: () => {
        document.documentElement.classList.toggle("dark", get().isDark);
      },

      // ── Cart ───────────────────────────────────────────────────────────
      cartItems: [],
      selectedZone: null,
      addToCart: (product) => {
        const items = get().cartItems;
        const existing = items.find((i) => i.id === product.id);
        if (existing) {
          set({
            cartItems: items.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
            ),
          });
        } else {
          set({ cartItems: [...items, { ...product, quantity: 1 }] });
        }
      },
      removeFromCart: (id) =>
        set({ cartItems: get().cartItems.filter((i) => i.id !== id) }),
      // FIX: updateQuantity no longer calls get().removeFromCart() internally.
      // Using get().removeFromCart() inside set() is fine in Zustand but calling
      // a separate action breaks the single-update contract. Inline the removal.
      updateQuantity: (id, qty) => {
        if (qty < 1) {
          set({ cartItems: get().cartItems.filter((i) => i.id !== id) });
          return;
        }
        set({
          cartItems: get().cartItems.map((i) =>
            i.id === id ? { ...i, quantity: qty } : i,
          ),
        });
      },
      clearCart: () => set({ cartItems: [], selectedZone: null }),
      setSelectedZone: (zone) => set({ selectedZone: zone }),
      // FIX: Removed getCartCount from store — these derived values caused
      // unnecessary re-renders when called as selectors. Consumers compute inline
      // or use the stable selector pattern. Kept for backward compat but memoize at callsite.
      getCartCount: () => get().cartItems.reduce((s, i) => s + i.quantity, 0),
      getCartSubtotal: () =>
        get().cartItems.reduce((s, i) => s + i.price * i.quantity, 0),
      getDeliveryFee: () => get().selectedZone?.fee ?? 0,
      getCartTotal: () => get().getCartSubtotal() + get().getDeliveryFee(),

      // ── Orders ─────────────────────────────────────────────────────────
      orders: [],
      archivedOrders: [],
      notifications: [],

      createOrder: async (customerData) => {
        const items = get().cartItems;
        const subtotal = get().getCartSubtotal();
        const deliveryFee = get().getDeliveryFee();
        const total = subtotal + deliveryFee;
        const orderId = generateOrderId();
        const zone = get().selectedZone;
        const newOrder = {
          id: orderId,
          customer: {
            name: customerData.name,
            phone: customerData.phone,
            address: customerData.address,
            notes: customerData.notes || "",
          },
          zone: zone
            ? {
                id: zone.id,
                name: zone.name,
                fee: zone.fee,
                estimatedTime: zone.estimatedTime || "",
              }
            : null,
          items: items.map((i) => ({
            productId: String(i.id),
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image || "",
          })),
          subtotal,
          deliveryFee,
          total,
          userUid: customerData.userUid || null,
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const notif = {
          id: `notif_${Date.now()}`,
          type: "new_order",
          orderId,
          customerName: customerData.name,
          total,
          read: false,
          createdAt: new Date().toISOString(),
        };
        // Batch both state updates together
        set({
          orders: [newOrder, ...get().orders],
          notifications: [notif, ...get().notifications],
        });

        await fsCreateOrder(newOrder).catch(console.error);
        return newOrder;
      },

      updateOrderStatus: async (orderId, status) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return;

        const notif = {
          id: `notif_${Date.now()}`,
          type: `order_${status}`,
          orderId,
          read: false,
          createdAt: new Date().toISOString(),
        };

        if (status === "delivered") {
          const archived = {
            ...order,
            status: "delivered",
            archivedAt: new Date().toISOString(),
          };
          set({
            orders: get().orders.filter((o) => o.id !== orderId),
            archivedOrders: [archived, ...get().archivedOrders],
            notifications: [notif, ...get().notifications],
          });
        } else if (status === "cancelled") {
          set({
            orders: get().orders.map((o) =>
              o.id === orderId
                ? { ...o, status, updatedAt: new Date().toISOString() }
                : o,
            ),
            notifications: [notif, ...get().notifications],
          });
        } else {
          set({
            orders: get().orders.map((o) =>
              o.id === orderId
                ? { ...o, status, updatedAt: new Date().toISOString() }
                : o,
            ),
          });
        }

        await fsUpdateOrderStatus(orderId, status).catch(console.error);
      },

      getOrderById: (id) =>
        get().orders.find((o) => o.id === id) ||
        get().archivedOrders.find((o) => o.id === id),

      markNotificationRead: async (id) => {
        // عدّل Zustand فوراً للـ optimistic UI
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        });
        // عدّل Firestore — الـ onSnapshot هيـsync تلقائياً
        await fsMarkNotificationRead(id).catch(console.error);
      },

      markAllNotificationsRead: async () => {
        // عدّل Zustand فوراً
        set({
          notifications: get().notifications.map((n) => ({ ...n, read: true })),
        });
        // عدّل Firestore — ده اللي بيحل المشكلة
        await fsMarkAllNotificationsRead().catch(console.error);
      },

      getUnreadCount: () => get().notifications.filter((n) => !n.read).length,

      // ── Products ───────────────────────────────────────────────────────
      products: PRODUCTS,
      addProduct: async (product) => {
        const newProduct = {
          ...product,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        };
        set({ products: [newProduct, ...get().products] });
        await fsAddProduct(newProduct).catch(console.error);
        return newProduct;
      },
      updateProduct: async (id, updates) => {
        set({
          products: get().products.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        });
        await fsUpdateProduct(id, updates).catch(console.error);
      },
      deleteProduct: async (id) => {
        set({ products: get().products.filter((p) => p.id !== id) });
        await fsDeleteProduct(id).catch(console.error);
      },

      // ── Categories ─────────────────────────────────────────────────────
      categories: CATEGORIES,
      addCategory: async (cat) => {
        const newCat = { ...cat, id: `cat_${Date.now()}` };
        set({ categories: [...get().categories, newCat] });
        await fsAddCategory(newCat).catch(console.error);
        return newCat;
      },
      updateCategory: async (id, updates) => {
        set({
          categories: get().categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        });
        await fsUpdateCategory(id, updates).catch(console.error);
      },
      deleteCategory: async (id) => {
        set({ categories: get().categories.filter((c) => c.id !== id) });
        await fsDeleteCategory(id).catch(console.error);
      },

      // ── Delivery Zones ────────────────────────────────────────────────
      deliveryZones: DEFAULT_DELIVERY_ZONES,
      addDeliveryZone: (zone) => {
        const newZone = { ...zone, id: `zone_${Date.now()}` };
        set({ deliveryZones: [...get().deliveryZones, newZone] });
      },
      updateDeliveryZone: (id, updates) =>
        set({
          deliveryZones: get().deliveryZones.map((z) =>
            z.id === id ? { ...z, ...updates } : z,
          ),
        }),
      deleteDeliveryZone: (id) =>
        set({ deliveryZones: get().deliveryZones.filter((z) => z.id !== id) }),

      // ── Offers (سكشن العروض في الرئيسية) ─────────────────────────────
      offers: [
        {
          id: "offer_1",
          title: "وجبة الاثنين بنص التمن",
          description: "أي وجبة فردية بخصم 50% كل يوم اثنين من 2م حتى 5م",
          discount: "50%",
          color: "from-orange-600 to-red-600",
          image:
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
          active: true,
          expiresAt: null,
        },
        {
          id: "offer_2",
          title: "طبق العيلة الكبير",
          description: "وجبة كاملة لـ4 أشخاص بسعر مميز",
          discount: "25%",
          color: "from-emerald-600 to-teal-600",
          image:
            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500",
          active: true,
          expiresAt: null,
        },
        {
          id: "offer_3",
          title: "ساعة السعادة",
          description: "خصم على المشروبات والحلويات من 3م لـ6م",
          discount: "30%",
          color: "from-purple-600 to-pink-600",
          image:
            "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500",
          active: true,
          expiresAt: null,
        },
      ],
      addOffer: async (offer) => {
        const newOffer = { ...offer, id: `offer_${Date.now()}` };
        set({ offers: [...get().offers, newOffer] });
        await fsSaveOffer(newOffer).catch(console.error);
      },
      updateOffer: async (id, updates) => {
        const updated = get().offers.map((o) =>
          o.id === id ? { ...o, ...updates } : o,
        );
        set({ offers: updated });
        const updatedOffer = updated.find((o) => o.id === id);
        if (updatedOffer) await fsSaveOffer(updatedOffer).catch(console.error);
      },
      deleteOffer: async (id) => {
        set({ offers: get().offers.filter((o) => o.id !== id) });
        await fsDeleteOffer(id).catch(console.error);
      },

      // ── Coupons ───────────────────────────────────────────────────────
      coupons: [],
      addCoupon: async (coupon) => {
        const newCoupon = {
          ...coupon,
          id: `coup_${Date.now()}`,
          usedCount: 0,
          createdAt: new Date().toISOString(),
        };
        set({ coupons: [...get().coupons, newCoupon] });
        await fsSaveCoupon(newCoupon).catch(console.error);
        return newCoupon;
      },
      updateCoupon: async (id, updates) => {
        const updated = get().coupons.map((c) =>
          c.id === id ? { ...c, ...updates } : c,
        );
        set({ coupons: updated });
        const updatedCoupon = updated.find((c) => c.id === id);
        if (updatedCoupon)
          await fsSaveCoupon(updatedCoupon).catch(console.error);
      },
      deleteCoupon: async (id) => {
        set({ coupons: get().coupons.filter((c) => c.id !== id) });
        await fsDeleteCoupon(id).catch(console.error);
      },
      validateCoupon: (code, subtotal) => {
        const coupon = get().coupons.find(
          (c) => c.code.toUpperCase() === code.toUpperCase() && c.active,
        );
        if (!coupon) return { valid: false, error: "كوبون غير صحيح" };
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
          return { valid: false, error: "انتهت صلاحية الكوبون" };
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
          return { valid: false, error: "تم استخدام الكوبون الحد الأقصى" };
        if (coupon.minOrder && subtotal < coupon.minOrder)
          return {
            valid: false,
            error: `الحد الأدنى للطلب ${coupon.minOrder} ج.م`,
          };
        const discount =
          coupon.type === "percent"
            ? Math.round((subtotal * coupon.value) / 100)
            : coupon.value;
        return { valid: true, coupon, discount };
      },
      useCoupon: (code) => {
        set({
          coupons: get().coupons.map((c) =>
            c.code.toUpperCase() === code.toUpperCase()
              ? { ...c, usedCount: (c.usedCount || 0) + 1 }
              : c,
          ),
        });
      },

      // ── Settings ──────────────────────────────────────────────────────
      settings: {
        whatsappNumber: "201094799308",
        restaurantName: "الحبايب",
        phone: "01000000000",
        email: "info@alhabayeb.com",
        address: "شارع الجمهورية، وسط البلد، القاهرة",
        city: "القاهرة",
        primaryColor: "#C8960C",
        logo: null,
        openTime: "10:00",
        closeTime: "01:00",
        minOrderAmount: 20,
      },
      updateSettings: async (updates) => {
        const merged = { ...get().settings, ...updates };
        set({ settings: merged });
        await fsUpdateSettings(merged).catch(console.error);
      },

      // ── Purge (admin danger zone) ─────────────────────────────────────
      purgeOrders: () =>
        set({ orders: [], archivedOrders: [], notifications: [] }),
    }),
    {
      name: "alhabayeb-v2",
      partialize: (state) => ({
        isDark: state.isDark,
        cartItems: state.cartItems,
        selectedZone: state.selectedZone,
        orders: state.orders,
        archivedOrders: state.archivedOrders,
        notifications: state.notifications,
        products: state.products,
        categories: state.categories,
        deliveryZones: state.deliveryZones,
        settings: state.settings,
        offers: state.offers,
        coupons: state.coupons,
      }),
    },
  ),
);

export default useStore;
