// service-worker.js
const CACHE_STATIC = 'bornes-static-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js'
];

/* Installation : cache statique */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_STATIC).then(c => c.addAll(STATIC_ASSETS))
  );
});

/* Fetch : static ≠ API (stale-while-revalidate) */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname === 'tabular-api.data.gouv.fr'){
    e.respondWith(staleWhileRevalidate(e.request));
  } else {
    e.respondWith(
      caches.match(e.request, { ignoreSearch:true })
            .then(r => r || fetch(e.request))
    );
  }
});

async function staleWhileRevalidate(request){
  const cache = await caches.open('bornes-api');
  const cached = await cache.match(request);
  const network = fetch(request).then(resp => {
    if (resp.ok) cache.put(request, resp.clone());
    return resp;
  }).catch(() => cached);
  return cached || network;
}
