var CACHE = 'kaoma-v2';
var FILES = ['./index.html','./app.webmanifest','./icon.svg'];
self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(FILES); }));
});
self.addEventListener('fetch', function(e) {
  if (e.request.url.includes('/api/')) return;
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).catch(function() { return caches.match('./index.html'); });
    })
  );
});
