self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('v1').then(function(cache) {
            return cache.addAll([
                '',
                'index.html',
                '/style.css',
                'app.js',
                // 'event-list.js',
                // '/sw-test/star-wars-logo.jpg',
                // '/sw-test/gallery/bountyHunters.jpg',
                // '/sw-test/gallery/myLittleVader.jpg',
                // '/sw-test/gallery/snowTroopers.jpg'
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(caches.match(event.request).then(function(response) {
        // caches.match() always resolves
        // but in case of success response will have value
        if (response !== undefined) {
            return response;
        } else {
            return fetch(event.request).then(function (response) {
                // response may be used only once
                // we need to save clone to put one copy in cache
                // and serve second one
                let responseClone = response.clone();

                caches.open('v1').then(function (cache) {
                    cache.put(event.request, responseClone);
                });
                return response;
            }).catch(function () {
                return caches.match('/sw-test/gallery/myLittleVader.jpg');
            });
        }
    }));
});