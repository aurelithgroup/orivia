import {handleNotificationRequest} from './notifications.mjs';
export {runNotificationTick} from './notifications.mjs';
import {accountTestPage,mountAccountTest} from './test-entry.mjs';
import {handleOrganisationRequest,organisationRoute,organisationDeletionBlock} from './organisations.mjs';
import {accountConfig,createAccountAuth} from './auth.mjs';
import {appHome} from './app-home.mjs';
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
 const url=new URL(req.url);if(!url.pathname.startsWith('/api/auth/')&&!url.pathname.startsWith('/api/account')&&!organisationRoute(url.pathname)&&!['/account-test','/account-test.js','/orivia-notifications-sw.js'].includes(url.pathname))return null;
 const c=accountConfig(env);if(url.pathname==='/api/account/config'&&req.method==='GET')return json({ui:c.ui,enabled:c.enabled,email:c.email,google:c.google,apple:c.apple});
 if(!c.enabled)return json({error:'accounts_unavailable'},503);if(url.origin!==c.origin)return json({error:'wrong_origin'},403);
 if(!['GET','HEAD'].includes(req.method)&&url.pathname!=='/api/auth/callback/apple'&&req.headers.get('Origin')!==c.origin)return json({error:'origin_required'},403);
 if(env.ACCOUNTS_TEST_UI==='1'&&req.method==='GET'&&['/account-test','/account-test.js'].includes(url.pathname))return new Response(url.pathname.endsWith('.js')?'('+mountAccountTest.toString()+')();':accountTestPage,{headers:{'Content-Type':url.pathname.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"}});
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
  if(url.pathname==='/api/account/session'&&req.method==='GET')return json({user:{id:owner,name:session.user.name,email:session.user.email}});
  if(url.pathname==='/api/account/sessions'&&req.method==='GET'){
   const sessions=await auth.api.listSessions({headers:req.headers});
   return json({sessions:sessions.map(s=>({current:s.id===session.session.id,createdAt:s.createdAt,updatedAt:s.updatedAt,expiresAt:s.expiresAt,userAgent:s.userAgent||null}))});
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
  if(url.pathname==='/api/account'&&req.method==='DELETE'){const body=await boundedJson(req,100);if(body?.confirm!=='delete my account')return json({error:'confirmation_required'},400);if(env.ORGANISATIONS_ENABLED==='1'){const blocked=await organisationDeletionBlock(env.ACCOUNTS_DB,owner);if(blocked)return json({error:blocked},409)}return await auth.api.deleteUser({headers:req.headers,body:{callbackURL:c.origin+appHome(env)},asResponse:true});}
  return json({error:'not_found'},404);
 }catch(e){return json({error:e?.message==='body_too_large'?'body_too_large':'account_request_failed'},e?.message==='body_too_large'?413:400)}
}
