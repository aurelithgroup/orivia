/* myorivia.app production entry: the newest Orivia (assistant, personal accounts, onboarding, organisations).
 * The private pilot entry (workers/pilot/index.mjs) and orivia-beta's entry (orivia-public-release.mjs) are unchanged.
 * The front door (workers/front-door) sends APP_PATHS here through a service binding, so everything shares
 * one origin and one sign-in. Server permission checks run in the shared handlers on every request. */
import {createPilotWorker} from './orivia-research-pilot.mjs';

// Paths the app answers on myorivia.app. Everything else belongs to the website.
export const isAppPath=p=>p==='/app'||p==='/app/'||/^\/join\/[a-z0-9-]{3,64}\/?$/.test(p)||['/platform','/platform.js','/manage','/chat.js','/inline-calendar.js','/reminder.ics','/orivia-notifications-sw.js'].includes(p)||/^\/(?:api|v1)\//.test(p);

// Ready only with every safeguard configured; otherwise refuse instead of running a partial release.
export function productionReady(env){
 return env.PUBLIC_RELEASE==='1'&&env.PUBLIC_BETA==='1'&&env.OPENAI_PILOT==='1'&&env.PUBLIC_HOST==='myorivia.app'&&
  typeof env.OPENAI_API_KEY==='string'&&!!env.OPENAI_API_KEY.trim()&&!!env.BUDGET_DB?.prepare&&!!env.ACCOUNTS_DB?.prepare&&
  !!env.TURNSTILE_SECRET&&!!env.TURNSTILE_SITE_KEY&&typeof env.SESSION_SECRET==='string'&&env.SESSION_SECRET.length>=32&&
  typeof env.ACCOUNTS_SECRET==='string'&&env.ACCOUNTS_SECRET.length>=32&&env.ACCOUNTS_ORIGIN==='https://myorivia.app'&&
  Number(env.PILOT_OPENAI_DAY_USD)>0&&Number(env.PILOT_OPENAI_MONTH_USD)>0&&Number(env.OPENAI_INPUT_USD_PER_M)>0&&Number(env.OPENAI_OUTPUT_USD_PER_M)>0&&
  Number(env.ACCOUNTS_EMAIL_DAY_CAP)>0&&Number(env.ACCOUNTS_EMAIL_MONTH_CAP)>0;
}
const refuse=(error,status)=>Response.json({error},{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});

export function createProduction(options={}){
 const app=createPilotWorker({...options,publicRelease:true});
 return {async fetch(req,env,ctx){
  if(!productionReady(env))return refuse('Orivia is not ready here yet',503);
  const url=new URL(req.url);
  if(!isAppPath(url.pathname))return refuse('Not found',404);
  // University links: /join/<organisation> opens the app's welcome for that organisation. Same site, so the
  // invitation token in the #join= fragment stays in the browser and is never sent to the server.
  const join=url.pathname.match(/^\/join\/([a-z0-9-]{3,64})\/?$/);
  if(join)return req.method==='GET'?new Response(null,{status:302,headers:{Location:'/app?organisation='+join[1],'Cache-Control':'no-store'}}):refuse('Not found',404);
  // Device push stays off until delivery passes a real-device test (Ina, 21 Oct). The in-app inbox still works.
  if(/^\/api\/account\/notifications\/(?:subscription|test)$/.test(url.pathname))return refuse('device_alerts_unavailable',503);
  const response=await app.fetch(req,{...env,PUBLIC_ASSISTANT:'1',PUBLIC_ACCOUNTS:'1',PRODUCTION_CONSENT:'1',APP_HOME:'/app',BROWSER_DIRECTORY:'0',ACCOUNTS_TEST_UI:'0',PUSH_PUBLIC_KEY:'',PUSH_PRIVATE_KEY:''},ctx);
  const headers=new Headers(response.headers);
  // The website's phone preview frames /app from the same site; no other site may frame Orivia.
  const csp=headers.get('Content-Security-Policy');if(csp)headers.set('Content-Security-Policy',csp.replace("frame-ancestors 'none'","frame-ancestors 'self'"));
  if(headers.get('X-Frame-Options'))headers.delete('X-Frame-Options');
  const body=/text\/html/i.test(headers.get('Content-Type')||'')?(await response.text()).replace('<title>Orivia private AI trial</title>','<title>Orivia</title>'):response.body;
  return new Response(body,{status:response.status,statusText:response.statusText,headers});
 },
 async scheduled(event,env,ctx){/* Push is off in production: nothing to deliver. */}};
}
export default createProduction();
