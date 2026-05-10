const CACHE_NAME = "schichtb-cache-v1";

// Önbelleğe alınacak dosyalar listesi
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./APG.jpg" // İkonun telefonda görünmesi için bu satır kritik!
];

// Servis işçisinin yüklenmesi ve dosyaların hafızaya alınması
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Dosyalar önbelleğe alınıyor...");
      return cache.addAll(urlsToCache);
    })
  );
});

// Dosyaların çevrimdışı olsa bile gösterilmesi
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Eğer dosya hafızada varsa onu döndür, yoksa internetten çek
      return response || fetch(event.request);
    })
  );
});

// Eski önbellekleri temizleme (Güncelleme yapıldığında)
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
