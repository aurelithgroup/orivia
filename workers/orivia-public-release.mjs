/* Explicit public release entry. The existing private entry remains private.
 * Human verification, per-person quotas and shared monetary budgets still run in the shared handler. */
import {createPilotWorker} from './orivia-research-pilot.mjs';
export function createPublicRelease(options={}){
 const app=createPilotWorker({...options,publicRelease:true});
 return {async fetch(req,env,ctx){
  // Do not silently release the old/basic provider when the intended assistant is unconfigured.
  const configured=env.PUBLIC_RELEASE==='1'&&env.PUBLIC_BETA==='1'&&env.OPENAI_PILOT==='1'&&
   typeof env.OPENAI_API_KEY==='string'&&!!env.OPENAI_API_KEY.trim()&&env.BUDGET_DB?.prepare&&
   env.TURNSTILE_SECRET&&env.TURNSTILE_SITE_KEY&&typeof env.SESSION_SECRET==='string'&&env.SESSION_SECRET.length>=32&&
   Number(env.PILOT_OPENAI_DAY_USD)>0&&Number(env.PILOT_OPENAI_MONTH_USD)>0&&
   Number(env.OPENAI_INPUT_USD_PER_M)>0&&Number(env.OPENAI_OUTPUT_USD_PER_M)>0;
  if(!configured)return Response.json({error:'Public release is not ready'},{status:503,headers:{'Cache-Control':'no-store'}});
  if(new URL(req.url).pathname==='/api/account/config'&&req.method==='GET')return Response.json({ui:true,enabled:false,email:false,google:false,apple:false},{headers:{'Cache-Control':'no-store'}});
  const response=await app.fetch(req,{...env,PUBLIC_ASSISTANT:'1',BROWSER_DIRECTORY:'0'},ctx);
  const headers=new Headers(response.headers);
  // Only the founder's GitHub Pages origin may frame the public app. The private entry stays unchanged.
  const csp=headers.get('Content-Security-Policy');if(csp)headers.set('Content-Security-Policy',csp.replace("frame-ancestors 'none'","frame-ancestors 'self' https://aurelithgroup.github.io"));
  if(headers.get('X-Frame-Options'))headers.delete('X-Frame-Options');
  // Cross-site previews need their own partitioned human-check cookie. Origin validation still protects mutations.
  const cookies=response.headers.getSetCookie();if(cookies.length){headers.delete('Set-Cookie');for(const c of cookies)headers.append('Set-Cookie',c.startsWith('orivia_human=')?c.replace('SameSite=Strict','SameSite=None; Partitioned'):c)}
  const body=/text\/html/i.test(headers.get('Content-Type')||'')?(await response.text()).replace('<title>Orivia private AI trial</title>','<title>Orivia</title>'):response.body;
  return new Response(body,{status:response.status,statusText:response.statusText,headers});
 }};
}
export default createPublicRelease();
