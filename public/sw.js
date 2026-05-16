/**
 * Prince Math Academy - Service Worker
 * Enhanced for cross-browser compatibility and offline support
 */

const CACHE_NAME = 'prince-math-v3';
const CACHE_VERSION = 'v3.0.0';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg',
];

// Network timeout for fetch requests
const NETWORK_TIMEOUT = 5000;

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((error) => {
          // Log but don't fail - some assets might be optional
          console.log('[SW] Cache addAll error:', error.message);
        });
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => {
        // Claim all clients immediately
        return self.clients.claim();
      })
      .then(() => {
        // Notify clients about update
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'SW_ACTIVATED',
              version: CACHE_VERSION
            });
          });
        });
      })
  );
});

// Fetch event - network first with cache fallback for most requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return;

  // Handle different types of requests
  if (isStaticAsset(url)) {
    // Cache-first for static assets
    event.respondWith(cacheFirst(request));
  } else if (isAPIRequest(url)) {
    // Network-first for API requests (never cache)
    event.respondWith(networkFirst(request));
  } else if (isNavigationRequest(request)) {
    // Network-first with offline fallback for navigation
    event.respondWith(networkFirstWithOfflineFallback(request));
  } else {
    // Default: network first with cache fallback
    event.respondWith(networkFirst(request));
  }
});

// Check if request is for static assets
function isStaticAsset(url) {
  const staticExtensions = [
    '.js', '.css', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp',
    '.ico', '.woff', '.woff2', '.ttf', '.eot'
  ];
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
         url.pathname.includes('/assets/');
}

// Check if request is an API request
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') ||
         url.pathname.includes('/.netlify/') ||
         url.hostname.includes('supabase.co');
}

// Check if request is a navigation request
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Cache-first strategy for static assets
async function cacheFirst(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Return cached version but fetch fresh version in background
      fetch(request).then((response) => {
        if (response && response.ok) {
          cache.put(request, response.clone());
        }
      }).catch(() => {
        // Ignore network errors for background updates
      });
      
      return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const networkResponse = await fetchWithTimeout(request);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache-first failed:', error.message);
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network-first strategy for API and dynamic content
async function networkFirst(request) {
  try {
    const networkResponse = await fetchWithTimeout(request);
    if (networkResponse && networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return error response
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'You are offline and this resource is not cached.'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Network-first with offline fallback for navigation
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetchWithTimeout(request);
    if (networkResponse && networkResponse.ok) {
      return networkResponse;
    }
    throw new Error('Network response was not ok');
  } catch (error) {
    // Try to serve from cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match('/index.html');
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Last resort: return offline page
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Prince Math Academy</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #080d1a 0%, #1a1a2e 100%);
            color: #e2e8f0;
            text-align: center;
            padding: 20px;
          }
          .container {
            max-width: 400px;
          }
          h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #7c3aed, #2563eb);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          p {
            font-size: 1.1rem;
            line-height: 1.6;
            color: #94a3b8;
            margin-bottom: 2rem;
          }
          button {
            background: linear-gradient(135deg, #7c3aed, #2563eb);
            color: white;
            border: none;
            padding: 12px 32px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
          }
          button:hover {
            transform: translateY(-2px);
          }
          .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">📡</div>
          <h1>You're Offline</h1>
          <p>It looks like you've lost your internet connection. Please check your network and try again.</p>
          <button onclick="window.location.reload()">Try Again</button>
        </div>
      </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Fetch with timeout
async function fetchWithTimeout(request, timeout = NETWORK_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(request.clone(), {
      signal: controller.signal,
      mode: 'cors',
      credentials: request.credentials
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New update available',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
        url: data.url || '/'
      },
      actions: [
        { action: 'explore', title: 'View' },
        { action: 'close', title: 'Dismiss' }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Prince Math Academy', options)
    );
  } catch (error) {
    console.log('[SW] Push notification error:', error.message);
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed by user');
});

// Background sync (for future use)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  // Future implementation for syncing messages when back online
  console.log('[SW] Background sync: sync-messages');
}

// Periodic background sync (for future use)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-updates') {
    event.waitUntil(checkForUpdates());
  }
});

async function checkForUpdates() {
  // Future implementation for checking updates
  console.log('[SW] Periodic sync: check-updates');
}

// Message handling from main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
    );
  }
});