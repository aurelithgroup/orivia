import {handleNotificationRequest} from './notifications.mjs';
export {runNotificationTick} from './notifications.mjs';
import {accountTestPage,mountAccountTest} from './test-entry.mjs';
import {handleFeedbackRequest,feedbackRoute} from './feedback.mjs';
import {handleShareRequest,shareRoute,publicShareRoute,servePublicShare} from './shares.mjs';
import {handleOrganisationRequest,organisationRoute,organisationDeletionBlock} from './organisations.mjs';
import {accountConfig,createAccountAuth} from './auth.mjs';
import {appHome} from './app-home.mjs';
import {parseDetails} from './content-details.mjs';
import {filesRoute,handleFileRequest,markFileCleanup,cancelFileCleanup,finishFileCleanup,retryFileCleanups} from './files.mjs';
/* A university item the person chose to ask Orivia about. Returned only to a signed-in, verified, ACTIVE member of that
 * organisation, only while it's published. Called on every chat message, so removed access or unpublished content stops
 * at once. Nothing is stored. */
export async function readOrgContext(req,env,ref,options={}){
 const c=accountConfig(env);if(!c.enabled||env.ORGANISATIONS_ENABLED!=='1')return null;
 if(!ref||typeof ref!=='object'||Object.keys(ref).some(k=>!['org','content'].includes(k)))return null;
 if(typeof ref.org!=='string'||typeof ref.content!=='string'||!/^[A-Za-z0-9-]{1,64}$/.test(ref.org)||!/^[A-Za-z0-9-]{1,64}$/.test(ref.content))return null;
 const auth=options.auth||createAccountAuth(env,options),s=await auth.api.getSession({headers:req.headers});if(!s?.user?.id||!s.user.emailVerified)return null;
 const row=await env.ACCOUNTS_DB.prepare("SELECT c.id,c.kind,c.title,c.body,c.details,c.revision,c.updated_at,o.id AS org_id,o.name FROM organisation_content c JOIN organisations o ON o.id=c.org_id JOIN organisation_memberships m ON m.org_id=c.org_id AND m.user_id=? AND m.status='active' WHERE c.id=? AND c.org_id=? AND c.status='published' AND o.status='active'").bind(s.user.id,ref.content,ref.org).first();
 if(!row)return null;
 return {orgId:row.org_id,orgName:row.name,contentId:row.id,kind:row.kind,title:row.title,body:row.body,details:parseDetails(row.details),revision:row.revision,updatedAt:new Date(row.updated_at).toISOString()};
}
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function boundedJson(req,max=1048576){if(!req.body)return null;const reader=req.body.getReader();let size=0,parts=[];try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw Error('body_too_large')}parts.push(value)}}finally{reader.releaseLock()}const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.byteLength}return JSON.parse(new TextDecoder().decode(bytes));}
export function validateSnapshot(d){
 if(!d||typeof d!=='object'||Array.isArray(d)||d.version!==1||Object.keys(d).some(k=>!['version','profile','events','journeys','chats'].includes(k)))return false;
 if(d.profile!==null&&(!d.profile||typeof d.profile!=='object'||Array.isArray(d.profile)))return false;
 if(!Array.isArray(d.events)||!d.journeys||typeof d.journeys!=='object'||Array.isArray(d.journeys)||!d.chats||!Array.isArray(d.chats.chats))return false;
 const ids=new Set();for(const c of d.chats.chats){if(!c||typeof c.id!=='string'||ids.has(c.id)||!Array.isArray(c.turns))return false;ids.add(c.id);for(const t of c.turns)if(!t||!['user','assistant'].includes(t.role)||typeof t.content!=='string')return false}return true;
}
const AUTH_PATHS=new Set(['/get-session','/sign-in/social','/callback/google','/callback/apple','/sign-out','/email-otp/send-verification-otp','/sign-in/email-otp','/update-user']);
export async function handleAccountRequest(req,env,ctx,options={}){
 const url=new URL(req.url);if(!url.pathname.startsWith('/api/auth/')&&!url.pathname.startsWith('/api/account')&&!organisationRoute(url.pathname)&&!publicShareRoute(url.pathname)&&!['/account-test','/account-test.js','/orivia-notifications-sw.js'].includes(url.pathname))return null;
 const c=accountConfig(env);if(url.pathname==='/api/account/config'&&req.method==='GET')return json({ui:c.ui,enabled:c.enabled,email:c.email,google:c.google,apple:c.apple});
 if(!c.enabled)return json({error:'accounts_unavailable'},503);if(url.origin!==c.origin)return json({error:'wrong_origin'},403);
 // Shared snapshot page: public and read-only, before any session handling (no cookies read or set).
 if(publicShareRoute(url.pathname))return servePublicShare(req,env);
 if(!['GET','HEAD'].includes(req.method)&&url.pathname!=='/api/auth/callback/apple'&&req.headers.get('Origin')!==c.origin)return json({error:'origin_required'},403);
 if(env.ACCOUNTS_TEST_UI==='1'&&req.method==='GET'&&['/account-test','/account-test.js'].includes(url.pathname))return new Response(url.pathname.endsWith('.js')?'(function(){const __name=f=>f;('+mountAccountTest.toString()+')()})();':accountTestPage,{headers:{'Content-Type':url.pathname.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"}});
 if(url.pathname==='/orivia-notifications-sw.js'&&req.method==='GET')return handleNotificationRequest(req,env);
 const auth=options.auth||createAccountAuth(env,options);
 try{
  if(organisationRoute(url.pathname))return await handleOrganisationRequest(req,env,{auth,readJson:boundedJson,...options.organisationOptions});
  if(url.pathname.startsWith('/api/auth/')){const path=url.pathname.slice('/api/auth'.length);if(!AUTH_PATHS.has(path))return json({error:'not_found'},404);
   if(['/email-otp/send-verification-otp','/sign-in/email-otp'].includes(path)&&!c.email)return json({error:'email_unavailable'},503);
   if(path.startsWith('/callback/')){const provider=path.slice('/callback/'.length);if(!c[provider])return json({error:'provider_unavailable'},400);return await auth.handler(req)}
   if(['/update-user','/sign-out'].includes(path)&&req.headers.get('X-Orivia-Account')){const active=await auth.api.getSession({headers:req.headers});if(active?.user?.id!==req.headers.get('X-Orivia-Account'))return json({error:'account_changed'},409)}
   if(req.method==='POST'){const body=await boundedJson(req,4096);if(!body)return json({error:'invalid_request'},400);
    if(path==='/sign-in/social'&&(!['google','apple'].includes(body.provider)||!c[body.provider]||body.callbackURL!==c.origin+appHome(env)))return json({error:'provider_unavailable'},400);
    if(path==='/update-user'&&(Object.keys(body).some(k=>k!=='name')||typeof body.name!=='string'||!body.name.trim()||body.name.length>60))return json({error:'invalid_name'},400);
    return await auth.handler(new Request(req,{body:JSON.stringify(body)}));}return await auth.handler(req);}
  const session=await auth.api.getSession({headers:req.headers});if(!session?.user?.id)return json({error:'sign_in_required'},401);const owner=session.user.id;
  const expected=req.headers.get('X-Orivia-Account');if(url.pathname!=='/api/account/session'&&expected&&expected!==owner)return json({error:'account_changed'},409);
  if((req.method==='PUT'||url.pathname.startsWith('/api/account/notifications')&&!['GET','HEAD'].includes(req.method))&&!expected)return json({error:'account_header_required'},428);
  if(url.pathname.startsWith('/api/account/notifications'))return await handleNotificationRequest(req,env,{session,readJson:boundedJson});
  if(filesRoute(url.pathname))return await handleFileRequest(req,env,{owner,expected,json,readJson:boundedJson});
  if(shareRoute(url.pathname)){if(req.method!=='GET'&&!expected)return json({error:'account_header_required'},428);return await handleShareRequest(req,env,{owner,json,readJson:boundedJson,origin:c.origin})}
  if(feedbackRoute(url.pathname))return await handleFeedbackRequest(req,env,{owner,verified:!!session.user.emailVerified,json,readJson:boundedJson});
  if(url.pathname==='/api/account/session'&&req.method==='GET'){if(ctx?.waitUntil&&env.FILES?.list)ctx.waitUntil(retryFileCleanups(env).catch(()=>{}));return json({user:{id:owner,name:session.user.name,email:session.user.email}})}
  if(url.pathname==='/api/account/sessions'&&req.method==='GET'){
   const sessions=await auth.api.listSessions({headers:req.headers});
   return json({sessions:sessions.map(s=>({current:s.id===session.session.id,createdAt:s.createdAt,updatedAt:s.updatedAt,expiresAt:s.expiresAt,userAgent:s.userAgent||null}))});
  }
  /* Accounts remembered on this device (ORI-AUTH-002/003/006), using Better Auth's multi-session plugin on the server only:
     the plugin's own endpoints stay blocked (AUTH_PATHS) because they return raw session tokens. The page gets an opaque
     reference (HMAC of the token), and switch/remove look the session up again from this device's signed cookies, so a
     forged reference, another device's session or an arbitrary user id can't be activated. */
  if(url.pathname.startsWith('/api/account/device-accounts')){
   const ref=async token=>{const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(String(env.ACCOUNTS_SECRET)),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode('device-account:'+token))).slice(0,16),b=>b.toString(16).padStart(2,'0')).join('')};
   const list=async()=>{let items=[];try{items=await auth.api.listDeviceSessions({headers:req.headers})}catch(_){items=[]}
    const out=[];for(const it of Array.isArray(items)?items:[])if(it?.session?.token&&it.user?.id)out.push({ref:await ref(it.session.token),token:it.session.token,id:it.user.id,name:it.user.name||'',email:it.user.email||'',active:it.user.id===owner});
    if(!out.some(a=>a.active))out.unshift({ref:null,token:null,id:owner,name:session.user.name||'',email:session.user.email||'',active:true});return out};
   if(url.pathname==='/api/account/device-accounts'&&req.method==='GET')return json({accounts:(await list()).map(({ref,name,email,active})=>({ref,name,email,active}))});
   const forward=res=>{const out=json({ok:true},res.ok?200:401);for(const c of res.headers.getSetCookie?.()||[])out.headers.append('Set-Cookie',c);return out};
   if(req.method==='POST'&&['/api/account/device-accounts/switch','/api/account/device-accounts/remove'].includes(url.pathname)){
    if(!expected)return json({error:'account_header_required'},428);
    const body=await boundedJson(req,300);if(!body||typeof body.ref!=='string'||!/^[0-9a-f]{32}$/.test(body.ref))return json({error:'invalid_account'},400);
    const target=(await list()).find(a=>a.ref===body.ref);if(!target)return json({error:'not_on_this_device'},404);
    if(url.pathname.endsWith('/switch')){if(target.active)return json({ok:true,unchanged:true});return forward(await auth.api.setActiveSession({headers:req.headers,body:{sessionToken:target.token},asResponse:true}))}
    return forward(await auth.api.revokeDeviceSession({headers:req.headers,body:{sessionToken:target.token},asResponse:true}));
   }
   return json({error:'not_found'},404);
  }
  if(url.pathname==='/api/account/sessions/revoke-others'&&req.method==='POST'){
   if(!expected)return json({error:'account_header_required'},428);
   const body=await boundedJson(req,200);if(body?.confirm!=='sign out other sessions')return json({error:'confirmation_required'},400);
   const age=Date.now()-new Date(session.session.createdAt).getTime();
   if(!Number.isFinite(age)||age<0||age>900000)return json({error:'recent_sign_in_required'},403);
   await auth.api.revokeOtherSessions({headers:req.headers,body:{}});return json({ok:true});
  }
  if(url.pathname==='/api/account/vault'&&req.method==='GET'){const row=await env.ACCOUNTS_DB.prepare('SELECT revision,data,updated_at FROM account_vault WHERE user_id=?').bind(owner).first();return json({revision:row?.revision||0,data:row?JSON.parse(row.data):null,updatedAt:row?.updated_at||null});}
  if(url.pathname==='/api/account/vault'&&req.method==='PUT'){
   const match=req.headers.get('If-Match')||'';if(!/^"?\d+"?$/.test(match))return json({error:'revision_required'},428);const revision=Number(match.replaceAll('"',''));if(!Number.isSafeInteger(revision)||revision<0)return json({error:'invalid_revision'},400);
   const data=await boundedJson(req);if(!validateSnapshot(data))return json({error:'invalid_snapshot'},400);const text=JSON.stringify(data),now=new Date().toISOString();
   const row=revision===0?await env.ACCOUNTS_DB.prepare('INSERT INTO account_vault(user_id,revision,data,updated_at) VALUES (?,1,?,?) ON CONFLICT(user_id) DO NOTHING RETURNING revision').bind(owner,text,now).first():await env.ACCOUNTS_DB.prepare('UPDATE account_vault SET data=?,revision=revision+1,updated_at=? WHERE user_id=? AND revision=? RETURNING revision').bind(text,now,owner,revision).first();
   return row?json({revision:row.revision,updatedAt:now}):json({error:'sync_conflict'},409);}
  if(url.pathname==='/api/account'&&req.method==='DELETE'){const body=await boundedJson(req,100);if(body?.confirm!=='delete my account')return json({error:'confirmation_required'},400);if(env.ORGANISATIONS_ENABLED==='1'){const blocked=await organisationDeletionBlock(env.ACCOUNTS_DB,owner);if(blocked)return json({error:blocked},409)}// Stored files: the cleanup record is written first, so a storage failure can't leave files behind unnoticed.
   const files=!!env.FILES?.list;if(files)await markFileCleanup(env,owner);
   let res;try{res=await auth.api.deleteUser({headers:req.headers,body:{callbackURL:c.origin+appHome(env)},asResponse:true})}catch(e){if(files)await cancelFileCleanup(env,owner).catch(()=>{});throw e}
   if(!res.ok){if(files)await cancelFileCleanup(env,owner).catch(()=>{});return res}
   if(!files)return res;
   const done=(await finishFileCleanup(env,owner))===true;let result={};try{result=await res.clone().json()}catch(_){}
   const headers=new Headers(res.headers);headers.set('Content-Type','application/json');headers.delete('Content-Length');
   // filesPending: the account is deleted, but some stored files are still being removed (retried automatically).
   return new Response(JSON.stringify({...(result&&typeof result==='object'?result:{}),filesPending:!done}),{status:res.status,headers});}
  return json({error:'not_found'},404);
 }catch(e){return json({error:e?.message==='body_too_large'?'body_too_large':'account_request_failed'},e?.message==='body_too_large'?413:400)}
}
