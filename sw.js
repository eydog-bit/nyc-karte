// Netz zuerst, bei Funkloch (z. B. in der U-Bahn) die zuletzt geladene Fassung.
// ponytail: Cache wächst mit jeder angesehenen Kartenkachel ohne Obergrenze; für eine Reise von zehn Tagen unkritisch.
const CACHE = 'nyc-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.hostname === 'photon.komoot.io') return;
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request)));
});
