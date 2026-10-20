// Runs in the background, so payment reminders appear even when the site is closed.
// The daily job sends data-only messages through Firebase Cloud Messaging, and this file
// turns each one into a notification.

self.addEventListener('push', (event) => {
  const payload = event.data ? event.data.json() : {}
  const { title = 'Subscription Tracker', body = '', tag, url = '/' } = {
    ...payload.notification,
    ...payload.data,
  }
  event.waitUntil(
    self.registration.showNotification(title, { body, tag, icon: '/icon-192.png', data: { url } }),
  )
})

// Clicking a reminder brings an open tab of the site to the front, or opens one.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((client) => new URL(client.url).origin === self.location.origin)
      return open ? open.focus() : self.clients.openWindow(event.notification.data.url)
    }),
  )
})
