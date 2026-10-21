/* myorivia.app front door.
 * Serves the public website (GitHub Pages) at the root, and sends the app, university and dashboard
 * paths to where those services currently run. No sign-in, cookies or data are handled here.
 * Undo: delete this Worker; nothing else depends on it. */
const SITE='https://aurelithgroup.github.io/orivia';
const APP='https://orivia-beta.habeebahsallah27.workers.dev';
const PILOT='https://orivia-research-pilot.habeebahsallah27.workers.dev';
const HOST='myorivia.app';
// Short join addresses for organisations whose ID is longer.
const ALIASES={northbay:'northbay-university'};

export function destination(url){
 const p=url.pathname.replace(/\/+$/,'')||'/';
 if(p==='/app'||p.startsWith('/app/'))return APP+(p.slice(4)||'/')+url.search;
 const join=p.match(/^\/join\/([a-z0-9-]{1,80})$/);
 if(join)return PILOT+'/?organisation='+(ALIASES[join[1]]||join[1])+url.hash;
 if(p==='/platform')return PILOT+'/platform'+url.search;
 if(p==='/manage')return PILOT+'/platform';
 return null;
}

export default {async fetch(req){
 const url=new URL(req.url);
 if(url.hostname!==HOST){url.hostname=HOST;return Response.redirect(url.href,301)}
 const to=destination(url);
 if(to)return Response.redirect(to,302);
 if(req.method!=='GET'&&req.method!=='HEAD')return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
 const res=await fetch(SITE+url.pathname+url.search,{method:req.method,headers:{Accept:req.headers.get('Accept')||'*/*'},redirect:'manual'});
 const headers=new Headers(res.headers);
 const loc=headers.get('Location');
 if(loc){const l=new URL(loc,SITE+url.pathname);if(l.origin+'/'===new URL(SITE).origin+'/'&&l.pathname.startsWith('/orivia'))headers.set('Location','https://'+HOST+(l.pathname.slice(7)||'/')+l.search)}
 headers.delete('Set-Cookie');
 headers.set('X-Content-Type-Options','nosniff');
 headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 return new Response(res.body,{status:res.status,headers});
}};
