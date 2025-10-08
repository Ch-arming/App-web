// Service Worker para PWA - Sistema de Control de Menú v3.0
const CACHE_NAME = 'control-menu-v3-0-0';
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
    console.log('[SW] 🚀 Instalando Service Worker v3.0...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] 📷 Cache abierto');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[SW] ✅ Todos los archivos fueron cacheados correctamente');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[SW] ❌ Error durante la instalación:', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    console.log('[SW] 🔄 Activando Service Worker v3.0...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] 🗑️ Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] ✅ Service Worker v3.0 activado correctamente');
            return self.clients.claim();
        })
    );
});

// Interceptar peticiones de red con estrategia mejorada
self.addEventListener('fetch', event => {
    // Solo cachear peticiones GET
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Ignorar peticiones a APIs externas
    if (event.request.url.includes('generativelanguage.googleapis.com') ||
        event.request.url.includes('makersuite.google.com') ||
        event.request.url.includes('console.cloud.google.com')) {
        return;
    }
    
    // Ignorar peticiones de extensiones del navegador
    if (event.request.url.startsWith('chrome-extension://') ||
        event.request.url.startsWith('moz-extension://')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si encontramos el recurso en cache, lo devolvemos
                if (response) {
                    console.log('[SW] 💾 Sirviendo desde cache:', event.request.url);
                    return response;
                }
                
                // Si no está en cache, hacemos la petición a la red
                console.log('[SW] 🌐 Cargando desde red:', event.request.url);
                return fetch(event.request)
                    .then(response => {
                        // Verificar si la respuesta es válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clonar la respuesta porque es un stream que solo se puede usar una vez
                        const responseToCache = response.clone();
                        
                        // Añadir al cache solo si es un recurso de nuestra app
                        if (event.request.url.startsWith(self.location.origin)) {
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                    console.log('[SW] 💾 Recurso agregado al cache:', event.request.url);
                                });
                        }
                        
                        return response;
                    })
                    .catch(error => {
                        console.log('[SW] ❌ Error en fetch:', error);
                        
                        // Si es una página HTML y estamos offline, devolver la página principal
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html')
                                .then(cachedResponse => {
                                    if (cachedResponse) {
                                        console.log('[SW] 🗺 Sirviendo página principal offline');
                                        return cachedResponse;
                                    }
                                    throw error;
                                });
                        }
                        
                        // Para otros recursos, lanzar el error
                        throw error;
                    });
            })
    );
});

// Manejar mensajes del cliente
self.addEventListener('message', event => {
    console.log('[SW] 💬 Mensaje recibido:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME,
            timestamp: new Date().toISOString(),
            status: 'active'
        });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('[SW] 🗑️ Cache limpiado');
            event.ports[0].postMessage({ success: true });
        });
    }
});

// Notificaciones Push
self.addEventListener('push', event => {
    console.log('[SW] 📨 Push recibido:', event);
    
    let notificationData = {
        title: 'Control de Menú',
        body: 'Notificación del sistema de menú',
        icon: './icon-192x192.png',
        badge: './icon-96x96.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'open',
                title: 'Abrir App',
                icon: './icon-96x96.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: './icon-96x96.png'
            }
        ]
    };
    
    if (event.data) {
        try {
            const pushData = event.data.json();
            notificationData = { ...notificationData, ...pushData };
        } catch (e) {
            notificationData.body = event.data.text();
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', event => {
    console.log('[SW] 🔔 Click en notificación:', event);
    
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then(clientList => {
                    // Si ya hay una ventana abierta, enfocarla
                    for (const client of clientList) {
                        if (client.url.includes(self.location.origin) && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    // Si no hay ventana abierta, abrir una nueva
                    if (clients.openWindow) {
                        return clients.openWindow('./');
                    }
                })
        );
    }
});

// Sincronización en segundo plano
self.addEventListener('sync', event => {
    console.log('[SW] 🔄 Sync evento:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
    
    if (event.tag === 'menu-sync') {
        event.waitUntil(syncMenuData());
    }
});

// Función para sincronización en segundo plano
function doBackgroundSync() {
    return new Promise((resolve) => {
        console.log('[SW] 🔄 Ejecutando sincronización en segundo plano...');
        
        // Aquí se pueden sincronizar datos cuando la conexión se restablezca
        // Por ejemplo: enviar datos pendientes, actualizar menú, etc.
        
        setTimeout(() => {
            console.log('[SW] ✅ Sincronización completada');
            resolve();
        }, 1000);
    });
}

// Función para sincronizar datos del menú
function syncMenuData() {
    return new Promise((resolve) => {
        console.log('[SW] 🍽️ Sincronizando datos del menú...');
        
        // Aquí se pueden sincronizar cambios en el menú
        // Por ejemplo: actualizar disponibilidad, precios, etc.
        
        resolve();
    });
}

// Manejo de errores no capturados
self.addEventListener('error', event => {
    console.error('[SW] ❌ Error no capturado:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('[SW] ❌ Promise rechazada no manejada:', event.reason);
    event.preventDefault();
});

// Estado del Service Worker
self.addEventListener('statechange', event => {
    console.log('[SW] 🔄 Cambio de estado:', event.target.state);
});

// Log de información del Service Worker
console.log('[SW] 🚀 Service Worker v3.0 cargado - Cache:', CACHE_NAME);
console.log('[SW] 📄 Archivos a cachear:', urlsToCache);