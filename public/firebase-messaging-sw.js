/* eslint-disable */
// Firebase Cloud Messaging Service Worker
// لازم الـ config يكون مكتوب هنا مباشرة
// لأن الـ SW بيشتغل في context منفصل عن الـ app

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

// ضع هنا نفس قيم الـ .env بتاعك
firebase.initializeApp({
  apiKey:            "AIzaSyCpSHkEw29zdNkYbuE9giDE2w1e34LlebQ",
  authDomain:        "el-habayeb.firebaseapp.com",
  projectId:         "el-habayeb",
  storageBucket:     "el-habayeb.firebasestorage.app",
  messagingSenderId: "906742792715",
  appId:             "1:906742792715:web:cf1d06dbfc2e885723bd0e",
})

const messaging = firebase.messaging()

// استقبال الإشعارات في الخلفية (لما التطبيق مش مفتوح)
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {}
  const data = payload.data || {}

  self.registration.showNotification(title || 'مطعم الحبايب', {
    body:    body || '',
    icon:    '/favicon.svg',
    badge:   '/favicon.svg',
    dir:     'rtl',
    lang:    'ar',
    tag:     data.orderId || 'general',
    renotify: true,
    data:    data,
  })
})

// لما المستخدم يضغط على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // لو التطبيق مفتوح خليه يفوكس
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus()
            client.navigate(url)
            return
          }
        }
        // لو التطبيق مش مفتوح افتحه
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})