const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { initializeApp }     = require('firebase-admin/app')
const { getMessaging }      = require('firebase-admin/messaging')
const { getFirestore }      = require('firebase-admin/firestore')

initializeApp()

const db        = getFirestore()
const messaging = getMessaging()

// بيراقب الـ pendingNotifications collection
// ولما يضاف document جديد، يبعت الإشعار
exports.sendPushNotification = onDocumentCreated(
  'pendingNotifications/{docId}',
  async (event) => {
    const data = event.data?.data()
    if (!data || data.sent) return

    const { tokens, notification, data: msgData } = data

    if (!tokens?.length) return

    try {
      // بعت لكل token على حدة (أمان أكثر)
      const results = await Promise.allSettled(
        tokens.map(token =>
          messaging.send({
            token,
            notification: {
              title: notification.title,
              body:  notification.body,
            },
            data: {
              ...msgData,
              click_action: 'FLUTTER_NOTIFICATION_CLICK',
            },
            webpush: {
              notification: {
                icon:  '/favicon.svg',
                badge: '/favicon.svg',
                dir:   'rtl',
                lang:  'ar',
                requireInteraction: false,
              },
              fcmOptions: {
                link: msgData?.url || '/',
              },
            },
          })
        )
      )

      // احذف الـ tokens اللي expired
      const expiredTokens = []
      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          const code = result.reason?.code
          if (code === 'messaging/registration-token-not-registered' ||
              code === 'messaging/invalid-registration-token') {
            expiredTokens.push(tokens[i])
          }
        }
      })

      // احذف الـ tokens القديمة من Firestore
      if (expiredTokens.length) {
        const batch = db.batch()
        const snap  = await db.collection('fcmTokens')
          .where('token', 'in', expiredTokens).get()
        snap.docs.forEach(d => batch.delete(d.ref))
        await batch.commit()
      }

      // علّم الإشعار كـ sent
      await event.data.ref.update({ sent: true, sentAt: new Date() })

    } catch (err) {
      console.error('Send notification error:', err)
    }
  }
)