// Service Worker para PWA - Sistema de Control de Menú
const CACHE_NAME = 'control-menu-v2-1-0';
const urlsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/ai-assistant.js',
    '/styles.css',
    '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
    console.log('[SW] Instalando Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Cache abierto');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[SW] Todos los archivos fueron cacheados');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[SW] Error durante la instalación:', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    console.log('[SW] Activando Service Worker...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Service Worker activado');
            return self.clients.claim();
        })
    );
});

// Interceptar peticiones de red
self.addEventListener('fetch', event => {
    // Solo cachear peticiones GET
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Ignorar peticiones a APIs externas
    if (event.request.url.includes('generativelanguage.googleapis.com')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si encontramos el recurso en cache, lo devolvemos
                if (response) {
                    return response;
                }
                
                // Si no está en cache, hacemos la petición a la red
                return fetch(event.request)
                    .then(response => {
                        // Verificar si la respuesta es válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clonar la respuesta porque es un stream que solo se puede usar una vez
                        const responseToCache = response.clone();
                        
                        // Añadir al cache
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(error => {
                        console.log('[SW] Error en fetch:', error);
                        
                        // Si es una página HTML y estamos offline, devolver la página principal
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        // Para otros recursos, lanzar el error
                        throw error;
                    });
            })
    );
});

// Manejar mensajes del cliente
self.addEventListener('message', event => {
    console.log('[SW] Mensaje recibido:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME,
            timestamp: new Date().toISOString()
        });
    }
});

// Notificaciones Push (futuro)
self.addEventListener('push', event => {
    console.log('[SW] Push recibido:', event);
    
    const options = {
        body: event.data ? event.data.text() : 'Notificación del sistema de menú',
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Abrir App',
                icon: '/icon-96x96.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/icon-96x96.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Control de Menú', options)
    );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', event => {
    console.log('[SW] Click en notificación:', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Sincronización en segundo plano (futuro)
self.addEventListener('sync', event => {
    console.log('[SW] Sync evento:', event);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Función para sincronización en segundo plano
function doBackgroundSync() {
    return new Promise((resolve) => {
        console.log('[SW] Ejecutando sincronización en segundo plano...');
        // Aquí se pueden sincronizar datos cuando la conexión se restablezca
        resolve();
    });
}

// Manejo de errores no capturados
self.addEventListener('error', event => {
    console.error('[SW] Error no capturado:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('[SW] Promise rechazada no manejada:', event.reason);
    event.preventDefault();
});

// Log de información del Service Worker
console.log('[SW] Service Worker cargado - Versión:', CACHE_NAME);