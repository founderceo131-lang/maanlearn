const CACHE = 'maanlearn-pwa-v5-logo';
const STATIC_ASSETS = ['./manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

const OFFLINE_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#F8FAFC">
<title>MaanLearn — Internet Required</title>
<style>
html,body{margin:0;min-height:100%;font-family:Inter,system-ui,sans-serif;background:#F8FAFC;color:#0F172A}
body{display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box}
main{max-width:520px;text-align:center;background:#fff;border:1px solid #E2E8F0;border-radius:18px;padding:32px;box-shadow:0 10px 30px rgba(15,23,42,.08)}
h1{margin:0 0 12px;font-size:28px}
p{color:#64748B;line-height:1.6;margin:8px 0}
</style>
</head>
<body>
<main>
<h1>MaanLearn</h1>
<p>An Internet connection is required to use MaanLearn courses and coding practice.</p>
<p>Please reconnect to the Internet and reload the page.</p>
</main>
</body>
</html>`;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never cache index.html or course content. Course content lives in the app document,
  // so keeping that document in the service-worker cache would make lessons available offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => new Response(OFFLINE_PAGE, {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }))
    );
    return;
  }

  // Only serve/cache the small PWA metadata/icon assets from this worker.
  if (url.origin === self.location.origin && STATIC_ASSETS.includes(url.pathname.replace(/^\//, './'))) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req))
    );
  }
});
