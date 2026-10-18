/* Private research pilot: the private trial Worker plus, for consenting testers only, OpenAI for research understanding and
 * planning, and the browser directory listing. Deployed as its own Worker (see workers/pilot/); the public Worker never
 * imports this file. Nothing here changes env.AI, ordinary chat, or anyone who hasn't ticked the OpenAI consent.
 *
 * Gates (all must hold, checked per request):
 *  - not the public deployment (PUBLIC_BETA !== '1') and the request reaches the private trial's own auth, quota and caps first;
 *  - OPENAI_PILOT === '1' for the provider, BROWSER_DIRECTORY === '1' for the browser (independent switches);
 *  - the tester's device sent providerConsent.openai === PILOT_CONSENT (a checkbox that names OpenAI, shown only here);
 *  - shared D1 ledger configured with confirmed rates and limits (otherwise reservations fail closed and nothing is sent).
 */
import {createTrialWorker} from './orivia-ai-private-trial.mjs';
import {createOpenAIPilot} from './orivia-openai-pilot.mjs';
import {createOpenAIBudget,createBrowserBudget} from './orivia-spend-ledger.mjs';
import {speaListFiltered} from './orivia-browser-directory.mjs';
import {readSpeaDirectoryFeed} from './orivia-spea-directory-feed.mjs';
import {REGULATORS} from './orivia-research-loop.mjs';

export const PILOT_CONSENT='openai-research-pilot-v2'; // v2: wording now matches exactly what is sent
export const PILOT_CONSENT_TEXT='Use OpenAI for research in this private test. When you ask Orivia to look something up, the recent messages in this chat (up to 10) and the public pages Orivia has found are sent to OpenAI to decide what to check next. Your About me details, including your city, saved documents, calendar and journeys are not sent. You can turn this off at any time.';
const isPublic=env=>env?.PUBLIC_BETA==='1';
export const consentedToOpenAI=p=>!!p&&typeof p==='object'&&p.providerConsent&&typeof p.providerConsent==='object'&&p.providerConsent.openai===PILOT_CONSENT;
export const pilotAvailable=env=>!isPublic(env)&&env?.OPENAI_PILOT==='1'&&!!env?.BUDGET_DB?.prepare;

/** Per-request research options for the private trial's hook. Returns null when nothing applies (existing provider path). */
export function pilotResearchOptions({env,preferences,ctx},{launchBrowser,fetcher}={}){
 if(isPublic(env))return null;
 const options={},notes=[];
 if(env.OPENAI_PILOT==='1'&&consentedToOpenAI(preferences)&&env.BUDGET_DB?.prepare){
  try{const budget=createOpenAIBudget(env,env.BUDGET_DB);if(budget.configured){options.ai=createOpenAIPilot(env,{consented:true,budget,...(fetcher?{fetcher}:{})});notes.push('openai')}}
  catch(_){/* missing key / disabled: stay on the existing provider */}
 }
 if(env.BROWSER_DIRECTORY==='1'&&env.BROWSER&&typeof launchBrowser==='function'&&env.BUDGET_DB?.prepare){
  const budget=createBrowserBudget(env,env.BUDGET_DB);
  if(budget.configured){const spea=REGULATORS.find(r=>r.id==='spea');options.regulatorOverrides={spea:{...spea,listFiltered:speaListFiltered({launch:()=>launchBrowser(env),budget,waitUntil:ctx?.waitUntil?p=>ctx.waitUntil(p):null})}};notes.push('browser')}
 }
 if(env.SPEA_DIRECTORY_FEED==='1'){const spea=REGULATORS.find(r=>r.id==='spea');options.regulatorOverrides={spea:{...spea,listFiltered:(filter,tools)=>readSpeaDirectoryFeed(filter,tools)}};notes.push('official-directory-feed')}
 return notes.length?{agent:true,options,pilot:notes}:null;
}

/** Build the pilot Worker. launchBrowser(env) → Puppeteer browser (production: puppeteer.launch(env.BROWSER)). */
export function createPilotWorker({launchBrowser,fetcher}={}){
 return {async fetch(req,env,ctx){
  if(isPublic(env))return new Response(JSON.stringify({error:'Pilot is private only'}),{status:404,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
  // Capture the execution context per request; never retain it in module state.
  const inner=createTrialWorker({research:async({env,preferences})=>pilotResearchOptions({env,preferences,ctx},{launchBrowser,fetcher})});
  const res=await inner.fetch(req,env,ctx);
  const url=new URL(req.url);
  // Tell the private UI the consent checkbox may be shown (booleans and fixed text only; never keys or limits).
  if(url.pathname==='/v1/config'&&req.method==='GET'&&res.ok){
   const body=await res.json();
   body.providerPilot=pilotAvailable(env)?{provider:'OpenAI',consent:PILOT_CONSENT,text:PILOT_CONSENT_TEXT}:null;
   body.research={...(body.research||{}),browserDirectory:env.BROWSER_DIRECTORY==='1'&&!!env.BROWSER};
   return new Response(JSON.stringify(body),{status:200,headers:res.headers});
  }
  return res;
 }};
}
