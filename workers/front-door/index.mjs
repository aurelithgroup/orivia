/* myorivia.app front door.
 * '/' is the landing page (public/index.html, Ina's approved concept). App paths go to the production Worker through
 * the APP service binding, so the app, university joining, dashboards and management share one origin and one sign-in.
 * Without that binding (before the switch-over) app paths forward to where those services currently run.
 * Other paths are served from the previous website on GitHub Pages so existing links keep working.
 * No sign-in, cookies or personal data are handled here. */
const SITE='https://aurelithgroup.github.io/orivia';
const APP='https://orivia-beta.habeebahsallah27.workers.dev';
const PILOT='https://orivia-research-pilot.habeebahsallah27.workers.dev';
const HOST='myorivia.app';
// Short join addresses for organisations whose ID is longer.
const ALIASES={northbay:'northbay-university'};

// Same list as workers/orivia-production.mjs (tests keep them equal).
export const isAppPath=p=>p==='/app'||p==='/app/'||/^\/app\/space\/[A-Za-z0-9-]{1,64}\/?$/.test(p)||/^\/join\/[a-z0-9-]{3,64}\/?$/.test(p)||/^\/s\/[A-Za-z0-9_-]{20,100}$/.test(p)||['/platform','/platform.js','/manage','/chat.js','/orivia-nav.js','/inline-calendar.js','/reminder.ics','/orivia-notifications-sw.js','/orivia-sw.js','/manifest.webmanifest'].includes(p)||/^\/app-icons\/[a-z0-9-]+\.png$/.test(p)||/^\/(?:api|v1)\//.test(p);

// Before the switch-over only: where each app path currently lives.
export function destination(url){
 const p=url.pathname.replace(/\/+$/,'')||'/';
 if(p==='/app'||p.startsWith('/app/'))return APP+(p.slice(4)||'/')+url.search;
 const join=p.match(/^\/join\/([a-z0-9-]{1,80})$/);
 if(join)return PILOT+'/?organisation='+(ALIASES[join[1]]||join[1])+url.hash;
 if(p==='/platform')return PILOT+'/platform'+url.search;
 if(p==='/manage')return PILOT+'/platform';
 return null;
}

// The previous website registered sw.js for the whole site. Replace it with one that removes itself and the
// website's own caches (names start orivia-public), so the landing page and the app are never served stale.
// Browser storage (saved chats, settings) is not touched.
const RETIRE_SW="self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('orivia-public'))await caches.delete(k);await self.registration.unregister();for(const c of await self.clients.matchAll({type:'window'}))c.navigate(c.url)})()));";

const SECURITY={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'};
const LANDING_CSP="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
const withHeaders=(res,extra={})=>{const h=new Headers(res.headers);for(const [k,v] of Object.entries({...SECURITY,...extra}))h.set(k,v);h.delete('Set-Cookie');return new Response(res.body,{status:res.status,statusText:res.statusText,headers:h})};

// Release preview (before the switch-over only): a browser holding the preview cookie gets the new release; everyone else
// keeps the current behaviour. RELEASE_PREVIEW is a temporary random test value set as a secret; RELEASE_LIVE=1 switches over.
const PREVIEW_COOKIE='orivia_release_preview';
async function sameSecret(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length<32)return false;const e=new TextEncoder(),[x,y]=await Promise.all([a,b].map(v=>crypto.subtle.digest('SHA-256',e.encode(v))));const u=new Uint8Array(x),v=new Uint8Array(y);let d=0;for(let i=0;i<u.length;i++)d|=u[i]^v[i];return d===0}
async function released(req,env){
 if(!env.APP)return false;if(env.RELEASE_LIVE==='1')return true;
 const c=(req.headers.get('Cookie')||'').split(/;\s*/).find(x=>x.startsWith(PREVIEW_COOKIE+'='));
 return !!c&&sameSecret(env.RELEASE_PREVIEW,decodeURIComponent(c.slice(PREVIEW_COOKIE.length+1)));
}

export default {async fetch(req,env){
 const url=new URL(req.url);
 if(url.hostname!==HOST){url.hostname=HOST;return Response.redirect(url.href,301)}
 const p=url.pathname;
 if(p==='/__release-preview'){
  const key=url.searchParams.get('key')||'',on=!!env.APP&&env.RELEASE_LIVE!=='1'&&await sameSecret(env.RELEASE_PREVIEW,key);
  if(!on)return new Response('Not found',{status:404,headers:SECURITY});
  return new Response(null,{status:302,headers:{Location:'/','Cache-Control':'no-store','Set-Cookie':PREVIEW_COOKIE+'='+encodeURIComponent(key)+'; Max-Age=21600; Path=/; HttpOnly; Secure; SameSite=Lax',...SECURITY}});
 }
 const live=await released(req,env);
 // App, joining, dashboards and management.
 if(isAppPath(p)||/^\/join\/[a-z0-9-]{1,80}\/?$/.test(p)){
  const join=p.match(/^\/join\/([a-z0-9-]{1,80})\/?$/);
  if(live&&join&&ALIASES[join[1]])return new Response(null,{status:302,headers:{Location:'/join/'+ALIASES[join[1]],'Cache-Control':'no-store'}});
  if(live)return env.APP.fetch(req);
  const to=destination(url);if(to)return Response.redirect(to,302);
  return new Response('Not found',{status:404,headers:SECURITY});
 }
 if(req.method!=='GET'&&req.method!=='HEAD')return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD',...SECURITY}});
 if(live&&p==='/sw.js')return new Response(RETIRE_SW,{headers:{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-store',...SECURITY}});
 // Landing page and its fonts.
 if(env.ASSETS&&(live&&(p==='/'||p==='/index.html')||p.startsWith('/fonts/'))){
  const res=await env.ASSETS.fetch(new Request(new URL(p==='/'?'/index.html':p,url),req));
  return withHeaders(res,p.startsWith('/fonts/')?{'Cache-Control':'public, max-age=31536000, immutable'}:{'Content-Security-Policy':LANDING_CSP,'Cache-Control':'no-cache'});
 }
 // Everything else: the previous website, unchanged.
 const res=await fetch(SITE+p+url.search,{method:req.method,headers:{Accept:req.headers.get('Accept')||'*/*'},redirect:'manual'});
 const out=withHeaders(res);const loc=out.headers.get('Location');
 if(loc){const l=new URL(loc,SITE+p);if(l.origin===new URL(SITE).origin&&l.pathname.startsWith('/orivia'))out.headers.set('Location','https://'+HOST+(l.pathname.slice(7)||'/')+l.search)}
 return out;
}};
