const CACHE='law-query-2026-11-24';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const isNav = req.mode==='navigate' || (req.headers.get('accept')||'').indexOf('text/html')>=0;
  if(isNav){
    // network-first: 联网时总是拿最新法规，断网回退缓存
    e.respondWith(
      fetch(req).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put('./index.html',c)).catch(()=>{});return res;})
        .catch(()=>caches.match('./index.html'))
    );
  }else{
    e.respondWith(
      caches.match(req).then(hit=>hit||fetch(req).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(req,c)).catch(()=>{});return res;}).catch(()=>caches.match('./index.html')))
    );
  }
});
