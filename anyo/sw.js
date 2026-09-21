// Anyo service worker: the app shell opens instantly, the page itself is always fetched fresh first.
const V='anyo-v37';
const SHELL=['app.html','manifest.webmanifest','img/glass.png','img/p-cream.jpg','img/peng-cut.png','img/hero.jpg','img/icon-192.png','img/icon-512.png','img/apple-touch-icon.png',
  'img/p-cloud.jpg','img/p-wink.jpg','img/p-cool.jpg','img/p-headph.jpg','img/p-night.jpg','fonts/geist.woff2','fonts/nunito.woff2','fonts/fredoka.woff2'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url); if(e.request.method!=='GET'||u.origin!==location.origin)return; // videos and fonts stream from their own CDNs
  if(e.request.mode==='navigate'||u.pathname.endsWith('.html')){ // network first, so every deploy shows up
    e.respondWith(fetch(e.request.url,{cache:'no-store',credentials:'same-origin'}).then(r=>{ const c=r.clone(); caches.open(V).then(x=>x.put(e.request,c)); return r; }).catch(()=>caches.match(e.request).then(r=>r||caches.match('app.html')))); return; }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{ if(res.ok){ const c=res.clone(); caches.open(V).then(x=>x.put(e.request,c)); } return res; })));
});
