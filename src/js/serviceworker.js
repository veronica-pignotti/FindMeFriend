self.addEventListener('install', e => { 
    console.log('PWA Service Worker installing.');
    console.log(__dirname);
    e.waitUntil(
        caches.open('cache')
        .then(cache => { 
            return cache.addAll([
                "../../session.json",
                "../../index.js",
                "../Welcome.html",
                "./Welcome.js",
                "../css/Welcome.css"
            ])
                .then(() => self.skipWaiting()); 
        })
    ) 
}); 

self.addEventListener('activate', event => { 
    console.log('PWA Service Worker activating.'); 
    event.waitUntil(self.clients.claim()); 
}); 

self.addEventListener('fetch', event => { 
    event.respondWith(
        caches.match(event.request).then(response => { 
            return response || fetch(event.request); 
        })
    ); 
});