self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))))
  )
  self.clients.claim()
})
