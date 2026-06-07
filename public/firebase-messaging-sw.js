// Firebase Cloud Messaging Service Worker
// هذا الملف مطلوب لاستقبال الإشعارات في الخلفية

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

// هيأخد الـ config من postMessage من الـ app
let messaging = null

self.addEventListener('message', (event) => {
  if (event.data?.type === 'FIREBASE_CONFIG') {
    const app = firebase.initializeApp(event.data.config)
    messaging = firebase.messaging(app)

    messaging.onBackgroundMessage((payload) => {
      const { title, body, icon } = payload.notification || {}
      self.registration.showNotification(title || 'مطعم الحبايب', {
        body: body || '',
        icon: icon || '/favicon.svg',
        badge: '/favicon.svg',
        dir: 'rtl',
        lang: 'ar',
        tag: payload.data?.orderId || 'general',
        data: payload.data,
        actions: payload.data?.url ? [{ action: 'open', title: 'فتح' }] : [],
      })
    })
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})