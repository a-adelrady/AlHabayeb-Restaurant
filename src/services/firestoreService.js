/**
 * Firestore Service Layer
 * All Firestore operations go through here.
 * In DEMO_MODE these are no-ops; the Zustand store is the source of truth.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  writeBatch,
  limit,
} from "firebase/firestore";
import { db, DEMO_MODE } from "./firebase";

// ─── Collections ────────────────────────────────────────────────────────────
const COL = {
  products: "products",
  categories: "categories",
  orders: "orders",
  archivedOrders: "archivedOrders",
  settings: "settings",
  notifications: "notifications",
  deliveryZones: "deliveryZones",
};

// ─── FCM Token Management ─────────────────────────────────────────────────────
const COL_FCM = "fcmTokens";

// جيب كل tokens الـ admins والـ supervisors (للإشعارات اللي بتتبعتلهم)
async function getStaffTokens() {
  if (DEMO_MODE) return [];
  try {
    const snap = await getDocs(
      query(
        collection(db, COL_FCM),
        where("role", "in", ["admin", "superadmin", "supervisor"]),
      ),
    );
    return snap.docs.map((d) => d.data().token).filter(Boolean);
  } catch {
    return [];
  }
}

// جيب tokens الـ user بالـ uid
async function getUserTokens(uid) {
  if (DEMO_MODE || !uid) return [];
  try {
    const snap = await getDocs(
      query(collection(db, COL_FCM), where("uid", "==", uid)),
    );
    return snap.docs.map((d) => d.data().token).filter(Boolean);
  } catch {
    return [];
  }
}

// حفظ الإشعار في Firestore — Cloud Function أو Admin SDK هيبعته
// (في الـ client-side بنحفظه بس، الإرسال الحقيقي من Firebase Functions)
async function saveNotificationForSend(tokens, payload) {
  if (!tokens.length) return;
  try {
    await addDoc(collection(db, "pendingNotifications"), {
      tokens,
      notification: payload.notification,
      data: payload.data || {},
      createdAt: serverTimestamp(),
      sent: false,
    });
  } catch (err) {
    console.warn("Failed to queue notification:", err);
  }
}
// ─── Orders ─────────────────────────────────────────────────────────────────
export async function fsCreateOrder(order) {
  if (DEMO_MODE) return order;
  const ref = doc(db, COL.orders, order.id);

  const firestoreDoc = {
    id: order.id,
    status: order.status,
    customer: order.customer,
    zone: order.zone,
    items: order.items,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    userUid: order.userUid || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, firestoreDoc);

  // إشعار للأدمن في Firestore (للـ NotificationCenter)
  await addDoc(collection(db, COL.notifications), {
    type: "new_order",
    orderId: order.id,
    customerName: order.customer.name,
    total: order.total,
    read: false,
    createdAt: serverTimestamp(),
  });

  // Push Notification للأدمن والمشرف
  const staffTokens = await getStaffTokens();
  await saveNotificationForSend(staffTokens, {
    notification: {
      title: "🛵 طلب جديد!",
      body: `${order.customer.name} — ${order.total} ج.م`,
    },
    data: {
      orderId: order.id,
      url: "/admin/orders",
      icon: "🛵",
    },
  });

  return order;
}

export async function fsUpdateOrderStatus(orderId, status) {
  if (DEMO_MODE) return;
  const ref = doc(db, COL.orders, orderId);

  // اجيب الداتا الأول قبل أي تعديل
  const snapBefore = await getDoc(ref).catch(() => null);
  const orderData = snapBefore?.exists() ? snapBefore.data() : null;
  const userUid = orderData?.userUid || null;

  await updateDoc(ref, { status, updatedAt: serverTimestamp() });

  // إشعارات الحالة للأدمن
  const adminNotifTypes = ["delivered", "cancelled"];
  if (adminNotifTypes.includes(status)) {
    await addDoc(collection(db, COL.notifications), {
      type: `order_${status}`,
      orderId,
      read: false,
      createdAt: serverTimestamp(),
    });
  }

  // رسائل الحالة للعميل
  const statusMessages = {
    preparing: {
      title: "👨‍🍳 طلبك قيد التحضير!",
      body: "الشيف بيحضر طلبك دلوقتي 🔥",
    },
    on_the_way: { title: "🛵 طلبك في الطريق!", body: "المندوب خارج إليك الآن" },
    delivered: {
      title: "✅ تم توصيل طلبك!",
      body: "بالهنا والشفا! قيّم تجربتك 🌟",
    },
    cancelled: { title: "❌ تم إلغاء طلبك", body: "تواصل مع المطعم للاستفسار" },
  };

  // Push Notification للعميل
  if (userUid && statusMessages[status]) {
    const userTokens = await getUserTokens(userUid);
    await saveNotificationForSend(userTokens, {
      notification: statusMessages[status],
      data: {
        orderId,
        url: `/track-order/${orderId}`,
        icon: statusMessages[status].title.split(" ")[0],
      },
    });
  }

  // أرشفة عند الـ delivered
  if (status === "delivered" && orderData) {
    await setDoc(doc(db, COL.archivedOrders, orderId), {
      ...orderData,
      status: "delivered",
      archivedAt: serverTimestamp(),
    });
    await deleteDoc(ref);
  }
}

export function fsSubscribeOrders(callback) {
  if (DEMO_MODE) return () => {};
  const q = query(collection(db, COL.orders), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
    callback(orders);
  });
}

export function fsSubscribeArchivedOrders(callback) {
  if (DEMO_MODE) return () => {};
  const q = query(
    collection(db, COL.archivedOrders),
    orderBy("createdAt", "desc"),
    limit(100),
  );
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
    },
    () => {},
  );
}

export async function fsGetArchivedOrders() {
  if (DEMO_MODE) return [];
  const snap = await getDocs(
    query(collection(db, COL.archivedOrders), orderBy("createdAt", "desc")),
  );
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
}

// ─── Products ────────────────────────────────────────────────────────────────
export async function fsAddProduct(product) {
  if (DEMO_MODE) return product;
  const ref = doc(db, COL.products, String(product.id));
  await setDoc(ref, { ...product, createdAt: serverTimestamp() });
  return product;
}

export async function fsUpdateProduct(id, updates) {
  if (DEMO_MODE) return;
  await updateDoc(doc(db, COL.products, String(id)), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function fsDeleteProduct(id) {
  if (DEMO_MODE) return;
  await deleteDoc(doc(db, COL.products, String(id)));
}

export function fsSubscribeProducts(callback) {
  if (DEMO_MODE) return () => {};
  const q = query(collection(db, COL.products), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
  });
}

// ─── Categories ─────────────────────────────────────────────────────────────
export async function fsAddCategory(cat) {
  if (DEMO_MODE) return cat;
  await setDoc(doc(db, COL.categories, cat.id), cat);
  return cat;
}

export async function fsUpdateCategory(id, updates) {
  if (DEMO_MODE) return;
  await updateDoc(doc(db, COL.categories, id), updates);
}

export async function fsDeleteCategory(id) {
  if (DEMO_MODE) return;
  await deleteDoc(doc(db, COL.categories, id));
}

// ─── Settings ────────────────────────────────────────────────────────────────
export async function fsGetSettings() {
  if (DEMO_MODE) return null;
  const snap = await getDoc(doc(db, COL.settings, "main"));
  return snap.exists() ? snap.data() : null;
}

export async function fsUpdateSettings(updates) {
  if (DEMO_MODE) return;
  await setDoc(doc(db, COL.settings, "main"), updates, { merge: true });
}

// ─── Notifications ───────────────────────────────────────────────────────────
export function fsSubscribeNotifications(callback) {
  if (DEMO_MODE) return () => {};
  const q = query(
    collection(db, COL.notifications),
    orderBy("createdAt", "desc"),
    limit(50),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
  });
}

export async function fsMarkNotificationRead(id) {
  if (DEMO_MODE) return;
  await updateDoc(doc(db, COL.notifications, id), { read: true });
}

export async function fsMarkAllNotificationsRead() {
  if (DEMO_MODE) return;
  const snap = await getDocs(
    query(collection(db, COL.notifications), where("read", "==", false)),
  );
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
}

// ─── Delivery Zones ──────────────────────────────────────────────────────────
export function fsSubscribeDeliveryZones(callback) {
  if (DEMO_MODE) return () => {}
  return onSnapshot(
    collection(db, COL.deliveryZones),
    (snap) => callback(snap.docs.map(d => ({ ...d.data(), id: d.id }))),
    () => {}
  )
}

export async function fsGetDeliveryZones() {
  if (DEMO_MODE) return [];
  const snap = await getDocs(collection(db, COL.deliveryZones));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
}

export async function fsSaveDeliveryZone(zone) {
  if (DEMO_MODE) return zone;
  const id = zone.id || `zone_${Date.now()}`;
  await setDoc(doc(db, COL.deliveryZones, id), { ...zone, id });
  return { ...zone, id };
}

export async function fsDeleteDeliveryZone(id) {
  if (DEMO_MODE) return;
  await deleteDoc(doc(db, COL.deliveryZones, id));
}

// ── Offers ────────────────────────────────────────────────────────────────
const COL_OFFERS = "offers";

export function fsSubscribeOffers(callback) {
  if (DEMO_MODE) return () => {};
  return onSnapshot(
    collection(db, COL_OFFERS),
    (snap) => callback(snap.docs.map((d) => ({ ...d.data(), id: d.id }))),
    () => {},
  );
}

export async function fsSaveOffer(offer) {
  if (DEMO_MODE) return;
  await setDoc(doc(db, COL_OFFERS, offer.id), offer);
}

export async function fsDeleteOffer(id) {
  if (DEMO_MODE) return;
  await deleteDoc(doc(db, COL_OFFERS, id));
}

// ── Coupons ───────────────────────────────────────────────────────────────
const COL_COUPONS = "coupons";

export function fsSubscribeCoupons(callback) {
  if (DEMO_MODE) return () => {};
  return onSnapshot(
    collection(db, COL_COUPONS),
    (snap) => callback(snap.docs.map((d) => ({ ...d.data(), id: d.id }))),
    () => {},
  );
}

export async function fsSaveCoupon(coupon) {
  if (DEMO_MODE) return;
  await setDoc(doc(db, COL_COUPONS, coupon.id), coupon);
}

export async function fsDeleteCoupon(id) {
  if (DEMO_MODE) return;
  await deleteDoc(doc(db, COL_COUPONS, id));
}
