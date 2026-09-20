/**
 * FindTheJob - Service Worker PWA
 * Gestion du cache App Shell, CDN tiers, API Network-First, Outbox Sync et Push Notifications
 */

const SHELL_CACHE = 'ftj-shell-v2';
const CDN_CACHE = 'ftj-cdn-v1';
const API_CACHE = 'ftj-api-v1';

const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/app.js',
  '/storageManager.js',
  '/archiveService.js',
  '/cvParser.js',
  '/style.css',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
  '/manifest.webmanifest',
  '/offline.html'
];

// Domaines CDN à mettre en cache pour l'usage 100% hors-ligne
const CDN_HOSTS = [
  'cdn.tailwindcss.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com'
];

/**
 * Installation : pré-mise en cache de l'App Shell
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_FILES))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[SW] Erreur mise en cache App Shell:', err))
  );
});

/**
 * Activation : nettoyage des anciens caches obsolètes
 */
self.addEventListener('activate', (event) => {
  const allowedCaches = [SHELL_CACHE, CDN_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.map((key) => {
          if (!allowedCaches.includes(key)) {
            console.log('[SW] Suppression ancien cache:', key);
            return caches.delete(key);
          }
        })
      ))
      .then(() => self.clients.claim())
  );
});

/**
 * Interception des requêtes réseau (Fetch)
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1. Requête de navigation principale (pages HTML) : Network-First -> Cache Shell -> Page Offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const shellHome = await caches.match('/');
          if (shellHome) return shellHome;
          const offlinePage = await caches.match('/offline.html');
          return offlinePage || new Response('Hors-ligne', { status: 503, statusText: 'Service Unavailable' });
        })
    );
    return;
  }

  // 2. Ressources CDN tierces (Tailwind, Polices, PDF.js, Mammoth, JSZip) : Cache-First
  if (CDN_HOSTS.some((host) => url.hostname.includes(host))) {
    event.respondWith(
      caches.open(CDN_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) return cachedResponse;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse.status === 200 || networkResponse.type === 'opaque') {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (fetchErr) {
          return cachedResponse || new Response('', { status: 408, statusText: 'CDN Request Timeout' });
        }
      })
    );
    return;
  }

  // 3. Requêtes API GET (/api/alerts, /api/status, /api/search) : Network-First avec fallback Cache
  if (url.pathname.startsWith('/api/')) {
    // Pour /api/status : Network-Only direct pour détecter la connexion
    if (url.pathname === '/api/status') {
      event.respondWith(fetch(request).catch(() => new Response(JSON.stringify({ status: 'offline' }), {
        headers: { 'Content-Type': 'application/json' }
      })));
      return;
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(API_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({
              success: false,
              offline: true,
              error: 'Vous êtes hors-ligne. Les données récentes du cache local sont disponibles.'
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // 4. Fichiers statiques locaux (JS, CSS, SVG, PNG, Manifest) : Cache-First avec revalidation en arrière-plan
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});

/**
 * Background Sync API : synchronisation différée de l'Outbox
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-outbox') {
    console.log('[SW] Événement Background Sync déclenché : sync-outbox');
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'FTJ_SYNC_OUTBOX' });
        });
      })
    );
  }
});

/**
 * Notifications Push (Web Push API)
 */
self.addEventListener('push', (event) => {
  let data = {
    title: 'FindTheJob - Nouvelle alerte emploi',
    body: 'De nouvelles offres correspondant à votre profil sont disponibles.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    url: '/'
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.svg',
    badge: data.badge || '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Voir les offres' },
      { action: 'close', title: 'Fermer' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Clic sur une notification Push
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si une fenêtre est déjà ouverte, lui donner le focus
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon ouvrir une nouvelle fenêtre
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
