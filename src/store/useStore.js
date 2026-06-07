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
        const newOrder = {
          id: orderId,
          customer: customerData,
          items: items.map((i) => ({ ...i })),
          subtotal,
          deliveryFee,
          total,
          zone: get().selectedZone,
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
        minOrderAmount: 50,
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
      }),
    },
  ),
);

export default useStore;
