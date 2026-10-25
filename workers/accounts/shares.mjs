/* Shared conversation snapshots (ORI-CHAT-009/010).
   - The owner sends a reviewed selection of messages; the server stores a copy (never the account, chat or files).
   - The link carries a random 256-bit token; only its SHA-256 is stored. A guessed id or token returns the same
     "not available" page as a revoked or expired one.
   - The shared page is read-only, escaped, attributed to its sources, not indexed, sets no cookies and grants nothing.
   - Revoke, delete and expiry stop it immediately; account deletion removes it (FK cascade). */
export const shareRoute=p=>p==='/api/account/shares'||/^\/api\/account\/shares\/[A-Za-z0-9-]{1,64}(\/revoke)?$/.test(p);
export const publicShareRoute=p=>/^\/s\/[A-Za-z0-9_-]{20,100}$/.test(p);
const DAYS=[1,7,30],LIMITS={messages:20,chars:16000,sources:8,title:120};
const enc=new TextEncoder();
async function sha(s){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s))),b=>b.toString(16).padStart(2,'0')).join('')}
function token(){return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function safeUrl(u){try{const x=new URL(u);return x.protocol==='https:'&&!x.username&&!x.password?x.href:null}catch(_){return null}}
// Server-side check of what the client selected: text and public https sources only; anything else is refused.
export function cleanSnapshot(body){
 if(!body||typeof body!=='object')return null;
 const title=typeof body.title==='string'?body.title.trim().slice(0,LIMITS.title):'';
 if(!Array.isArray(body.messages)||!body.messages.length||body.messages.length>LIMITS.messages)return null;
 const messages=[];
 for(const m of body.messages){
  if(!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||!m.content.trim()||m.content.length>LIMITS.chars)return null;
  if(Object.keys(m).some(k=>!['role','content','sources'].includes(k)))return null; // no attachments, documents or meta
  const sources=[];for(const s of Array.isArray(m.sources)?m.sources.slice(0,LIMITS.sources):[]){const url=safeUrl(s?.url);if(!url||typeof s.title!=='string')continue;sources.push({title:s.title.slice(0,140),url})}
  messages.push({role:m.role,content:m.content,...(sources.length?{sources}:{})});
 }
 const days=Number(body.expiresInDays);if(!DAYS.includes(days))return null;
 return {title:title||'Shared from Orivia',messages,days};
}
export async function handleShareRequest(req,env,{owner,json,readJson,origin,now=Date.now,newId=()=>crypto.randomUUID()}){
 const db=env.ACCOUNTS_DB,path=new URL(req.url).pathname;
 try{
  if(path==='/api/account/shares'&&req.method==='POST'){
   const snap=cleanSnapshot(await readJson(req,120000));if(!snap)return json({error:'invalid_share'},400);
   const count=await db.prepare('SELECT COUNT(*) AS n FROM shared_snapshots WHERE user_id=? AND revoked_at IS NULL AND expires_at>?').bind(owner,now()).first();
   if((count?.n||0)>=50)return json({error:'too_many_shares'},429);
   const t=token(),id=newId(),expires=now()+snap.days*86400000;
   await db.prepare('INSERT INTO shared_snapshots(id,user_id,token_hash,title,content,created_at,expires_at) VALUES (?,?,?,?,?,?,?)').bind(id,owner,await sha(t),snap.title,JSON.stringify(snap.messages),now(),expires).run();
   return json({id,url:origin+'/s/'+t,expiresAt:new Date(expires).toISOString()},201);
  }
  if(path==='/api/account/shares'&&req.method==='GET'){
   const rows=(await db.prepare('SELECT id,title,created_at,expires_at,revoked_at,content FROM shared_snapshots WHERE user_id=? ORDER BY created_at DESC LIMIT 100').bind(owner).all()).results||[];
   return json({shares:rows.map(r=>({id:r.id,title:r.title,messages:JSON.parse(r.content).length,createdAt:r.created_at,expiresAt:r.expires_at,state:r.revoked_at?'revoked':r.expires_at<=now()?'expired':'active'}))});
  }
  const m=path.match(/^\/api\/account\/shares\/([A-Za-z0-9-]{1,64})(\/revoke)?$/);
  if(m&&m[2]&&req.method==='POST'){const r=await db.prepare('UPDATE shared_snapshots SET revoked_at=? WHERE id=? AND user_id=? AND revoked_at IS NULL RETURNING id').bind(now(),m[1],owner).first();return r?json({ok:true}):json({error:'not_found'},404)}
  if(m&&!m[2]&&req.method==='DELETE'){const r=await db.prepare('DELETE FROM shared_snapshots WHERE id=? AND user_id=? RETURNING id').bind(m[1],owner).first();return r?json({ok:true}):json({error:'not_found'},404)}
  return json({error:'not_found'},404);
 }catch(e){if(String(e?.message||e).includes('no such table'))return json({error:'shares_unavailable'},503);throw e}
}
const PAGE_HEADERS={'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff',
 'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; img-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"};
const shell=(title,body)=>'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>'+esc(title)+'</title><style>:root{color-scheme:light dark;--bg:#F7F8FA;--fg:#1C2733;--muted:#56616C;--line:#D6DBD4;--card:#fff;--link:#7A5300}@media (prefers-color-scheme:dark){:root{--bg:#0E1620;--fg:#E8EDF3;--muted:#9AA5B0;--line:#29333E;--card:#141B23;--link:#F5C842}}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,sans-serif}main{max-width:720px;margin:0 auto;padding:24px max(16px,env(safe-area-inset-left))}.m{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin:10px 0;white-space:pre-wrap;overflow-wrap:anywhere}.who{font-size:12px;font-weight:700;color:var(--muted);margin-bottom:4px}.note{font-size:13px;color:var(--muted)}a{color:var(--link)}ol{font-size:13px;padding-inline-start:20px}</style></head><body><main>'+body+'</main></body></html>';
// The public, read-only page. Unknown, revoked and expired links look the same.
export async function servePublicShare(req,env,{now=Date.now}={}){
 const t=new URL(req.url).pathname.slice(3),gone=()=>new Response(shell('Link not available','<h1>This link isn’t available</h1><p class="note">It may have expired or been withdrawn by the person who shared it.</p>'),{status:404,headers:PAGE_HEADERS});
 if(req.method!=='GET'&&req.method!=='HEAD')return new Response('',{status:405,headers:{Allow:'GET'}});
 let row;try{row=await env.ACCOUNTS_DB.prepare('SELECT title,content,created_at,expires_at,revoked_at FROM shared_snapshots WHERE token_hash=?').bind(await sha(t)).first()}catch(_){return gone()}
 if(!row||row.revoked_at||row.expires_at<=now())return gone();
 const msgs=JSON.parse(row.content);
 const body='<p class="note">Shared from Orivia · read only · link expires '+esc(new Date(row.expires_at).toUTCString())+'. It doesn’t give access to anyone’s account. Orivia’s answers can be wrong: check important details with the official source.</p><h1>'+esc(row.title)+'</h1>'
  +msgs.map(m=>'<div class="m"><div class="who">'+(m.role==='user'?'Question':'Orivia')+'</div>'+esc(m.content)+(m.sources?'<div class="note">Sources:</div><ol>'+m.sources.map(s=>'<li><a href="'+esc(s.url)+'" rel="noopener noreferrer nofollow" target="_blank">'+esc(s.title)+'</a> · '+esc(new URL(s.url).hostname)+'</li>').join('')+'</ol>':'')+'</div>').join('');
 return new Response(shell(row.title,body),{status:200,headers:PAGE_HEADERS});
}
