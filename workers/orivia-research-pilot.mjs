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
import {createOpenAIBudget,createBrowserBudget,maxCallCostMicro} from './orivia-spend-ledger.mjs';
import {speaListFiltered} from './orivia-browser-directory.mjs';
import {readSpeaDirectoryFeed} from './orivia-spea-directory-feed.mjs';
import {REGULATORS} from './orivia-research-loop.mjs';
import {runAssistantTurn} from './orivia-assistant.mjs';

// v3 (founder-approved 18 Oct): OpenAI handles the whole conversation, About me included unless its switch is off.
// v2 ticks don't carry over: the tester sees the new wording and ticks again.
export const PILOT_CONSENT='openai-assistant-pilot-v3';
export const PILOT_CONSENT_TEXT='Use OpenAI for this private test. Your messages in this chat (the latest 12), the public pages Orivia reads for you, and your About me details (unless “Use About me in chats” is off) are sent to OpenAI so it can understand you, research and write Orivia’s replies. Your saved documents, calendar and journeys are not sent. Search terms, never your full messages, go to Brave Search. You can turn this off at any time.';
const isPublic=env=>env?.PUBLIC_BETA==='1';
export const consentedToOpenAI=p=>!!p&&typeof p==='object'&&p.providerConsent&&typeof p.providerConsent==='object'&&p.providerConsent.openai===PILOT_CONSENT;
export const pilotAvailable=env=>!isPublic(env)&&env?.OPENAI_PILOT==='1'&&!!env?.BUDGET_DB?.prepare;

/** Per-request research options for the private trial's hook. Returns null when nothing applies (existing provider path). */
/** The OpenAI transport for one message, or null (switch off, no consent, no confirmed rates and limits, or no key). */
export function pilotAI(env,preferences,{fetcher}={}){
 if(isPublic(env)||env.OPENAI_PILOT!=='1'||!consentedToOpenAI(preferences)||!env.BUDGET_DB?.prepare)return null;
 try{const budget=createOpenAIBudget(env,env.BUDGET_DB);if(!budget.configured)return null;
  const ai=createOpenAIPilot(env,{consented:true,budget,...(fetcher?{fetcher}:{})});
  // For the assistant: money left today/this month and what one call could cost at most (it plans around both).
  ai.budgetLeft=async()=>{const u=await budget.meter.usage();return Math.max(0,Math.min(u.limits.day-u.day,u.limits.month-u.month))};
  ai.costOf=(inputBytes,maxOutputTokens)=>maxCallCostMicro(budget.rates,{inputBytes,maxOutputTokens});
  return ai}
 catch(_){return null} // missing key / disabled: stay on the existing provider
}
export function pilotResearchOptions({env,preferences,ctx},{launchBrowser,fetcher,getAI}={}){
 if(isPublic(env))return null;
 const options={},notes=[];
 const ai=getAI?getAI(env,preferences):pilotAI(env,preferences,{fetcher});
 if(ai){options.ai=ai;notes.push('openai')}
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
  // One OpenAI transport per message, shared by the assistant and the fallback research path, so a provider failure
  // stops OpenAI for the rest of this message instead of being tried again by the next path.
  let shared;const getAI=(e,p)=>shared===undefined?(shared=pilotAI(e,p,{fetcher})):shared;
  const inner=createTrialWorker({
   research:async({env,preferences})=>pilotResearchOptions({env,preferences,ctx},{launchBrowser,fetcher,getAI}),
   assistant:({env,preferences})=>{const ai=getAI(env,preferences);if(!ai)return null;
    return ({messages,profile,context,reserve,onProgress})=>runAssistantTurn({messages,profile,context},env,{ai,reserve,onProgress,...(fetcher?{fetcher}:{})})}
  });
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
