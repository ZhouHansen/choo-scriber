var VERSION = String(Date.now())

var URLS = [
  './app/assets/remove.png'
]

self.addEventListener('install', function(e) {
  console.log(123)
  e.waitUntil(self.caches.open(VERSION).then(function (cache) {
    return cache.addAll(URLS)
  }))
});
