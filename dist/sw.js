const STATIC_CACHE_NAME = 'restaurants-static-v1';
const CONTENT_IMAGES_CACHE = 'restaurants-content-imgs';
const ALL_CACHES = [
  STATIC_CACHE_NAME,
  CONTENT_IMAGES_CACHE
];

self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(STATIC_CACHE_NAME).then(function (cache) {
          return cache.addAll([
            '/',
            '/restaurant.html',
            '/js/script_index.min.js',
            '/js/script_info.min.js',
            '/css/style.min.css',
            '/img/logo.png',
            '/img/icon-no-image.png',
            '/favicon.ico',
            'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
            'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
          ]);
      })
    );
});


self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName.startsWith('restaurants-') &&
                 !ALL_CACHES.includes(cacheName);
        }).map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});


self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    if (requestUrl.origin === location.origin) {        
        if (requestUrl.pathname === '/restaurant.html') {
            event.respondWith(caches.match('/restaurant.html'));
            return;
        }

        if (requestUrl.pathname.startsWith('/img/')) {
            event.respondWith(serveImage(event.request));
            return;
        }
    }

    event.respondWith(
      caches.match(event.request).then((response) => {
          return response || fetch(event.request);
      })
    );
});


function serveImage(request) {
    var storageUrl = request.url.replace(/-\d+px\.jpg$/, '');
    
    return caches.open(CONTENT_IMAGES_CACHE).then((cache) => {
        return cache.match(storageUrl).then((response) => {
            if (response) return response;

            return fetch(request).then((networkResponse) => {
                cache.put(storageUrl, networkResponse.clone());
                return networkResponse;
            });
        });
    });
}


/*
(function () {

    const CACHE_NAME = 'static-cache-v1';
    const urlsToCache = [
      '.',
      'index.html',
      'restaurant.html',
      'css/styles.css',
      'data/restaurants.json',
      'js/dbhelper.js',
      'js/main.js',
      'js/restaurant_info.js',
      'js/localforage.min.js'
    ];

    self.addEventListener('install', (event) => {
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
        );
    });

    self.addEventListener('fetch', (event) => {
        event.respondWith(
          caches.match(event.request)
            .then(response => {
                return response || fetchAndCache(event.request);
            })
        );
    });

    function fetchAndCache(url) {
        return fetch(url)
          .then(response => {
              console.log(response, url);
              if (!response.ok) {
                  throw Error(response.statusText);
                  //Promise.reject();
              }

              return caches.open(CACHE_NAME)
                .then(cache => {
                    cache.put(url, response.clone());
                    return response;
                })
          })
          //.catch(error => {
          //    console.log('Request failed:', error);
          //    return;
          //});
    }

})();*/