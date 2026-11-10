// Révisions BUT1 : le site marche aussi hors connexion.
// Toujours le réseau d'abord (pour avoir la dernière version), la copie locale seulement sans réseau.
const CACHE='revisions-v2';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  const same=u.origin===self.location.origin;
  const fonts=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  const libs=/cdn\.jsdelivr\.net$|cdnjs\.cloudflare\.com$/.test(u.hostname);
  if(!same && !fonts && !libs) return;            // Firebase et le reste : jamais en cache
  e.respondWith(fetch(same ? new Request(r,{cache:'no-cache'}) : r).then(res=>{ if(res && (res.ok || res.type==='opaque')){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; })
    .catch(()=>caches.match(r).then(m=>m || (r.mode==='navigate'?caches.match('./index.html'):undefined))));
});
