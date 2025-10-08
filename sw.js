const CACHE_NAME = 'menu-control-ai-v2.0';
const urlsToCache = [
    './',
    './index.html',
    './app.js',
    './ai-assistant.js',
    './styles.css',
    './manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
    console.log('🚀 Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('💾 Service Worker: Archivos en caché');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('❌ Service Worker: Error en instalación:', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    console.log('✅ Service Worker: Activado');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptar peticiones de red
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Devolver desde caché si está disponible
                if (response) {
                    return response;
                }
                
                // Hacer petición de red
                return fetch(event.request)
                    .then(response => {
                        // Verificar que la respuesta sea válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clonar la respuesta
                        const responseToCache = response.clone();
                        
                        // Agregar al caché
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(error => {
                        console.log('🚫 Service Worker: Error de red:', error);
                        
                        // Servir página offline si es una navegación
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});

// Manejo de mensajes del cliente
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Notificación de actualización disponible
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});