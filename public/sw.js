const CACHE_NAME = 'cevanta-public-shell-v2';
const APP_SHELL = ['/offline.html', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('cevanta-') && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Only fixed public files enter Cache Storage. Never cache signed-in responses.
  const privateRoute = url.pathname === '/invite' || url.pathname.startsWith('/invite/') || url.pathname.startsWith('/auth/') || url.pathname.startsWith('/api/');
  if (privateRoute) return;
  if (APP_SHELL.includes(url.pathname) && !url.search) {
    event.respondWith(fetch(request).catch(() => caches.match(url.pathname)));
  } else if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/offline.html')));
  }
});
