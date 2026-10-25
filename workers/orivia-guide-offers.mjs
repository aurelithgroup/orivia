import {guideReview} from './orivia-guide-reviews.mjs';
/* Journey cards: when something the person decides makes a checked guide genuinely useful,
 * Orivia offers it under her reply (Follow guide / Save for later / Not now).
 * One pattern for every journey: add a guide to GUIDES with what counts as a decision,
 * a refresher request, or a known problem, plus any limit on where it applies.
 * Read-only: guide content comes from the checked journey data; nothing here is stored.
 */
import {callJourneyApi} from '../server/src/journeys.js';

const NOT_DUBAI=/\b(sharjah|ajman|abu dhabi|al ain|umm al quwain|ras al khaimah|rak|fujairah|muwaileh|al majaz|al khan|al taawun|al qasimia|rolla|university city)\b/i;
const DUBAI=/\b(dubai|jlt|jumeirah|marina|deira|bur dubai|karama|al barsha|barsha|business bay|downtown|internet city|media city|knowledge park|academic city|silicon oasis|al quoz|mirdif|al nahda,? dubai|international city|discovery gardens|jvc|al qusais|satwa)\b/i;
/* Decisions, not mentions: "I'll take the metro" yes; "the bus was late" no. */
const DECIDE=String.raw`(?:i'?ll|i will|i'?m (?:gonna|going to)|i am (?:gonna|going to)|gonna|i think i'?ll|i think i(?:'?m| am) (?:gonna|going to)|i(?:'?m| am) planning (?:on|to)|i plan to|i(?:'?ve| have) decided (?:on|to)|i decided (?:on|to)|i'?d rather|i prefer|let'?s go with|i'?ll go with|go with|i choose|i chose|i pick|i(?:'?m| am) going with)`;
const decided=(mode)=>new RegExp('\\b'+DECIDE+'\\s+(?:to\\s+)?(?:take|use|go with|try|ride|get|go by|travel by)?\\s*(?:the\\s+)?(?:'+mode+')\\b|\\b(?:'+mode+')\\s+(?:it is|then|sounds (?:good|best|great)|is (?:best|better|fine|easier))\\b','i');

export const GUIDES={
 'dubai.nol':{
  summary:'nol cards, topping up, riding for the first time and what to do at the gate.',
  decision:decided('public transport|metro|the metro|buses|bus|tram|nol card|nol'),
  refresher:/\bnol\b.{0,40}\b(again|work|works|working|refresh\w*|remind)|\b(how (?:does|do) (?:the |a |my )?nol|refresher on (?:the )?(?:nol|metro|public transport)|remind me how (?:the )?(?:nol|metro) works|(?:my |the )?(?:public )?transport guide|nol guide|public transport guide)\b/i,
  problems:[
   ['gate',/\b(gate|barrier)\b.{0,30}\b(won'?t|will not|doesn'?t|does not|didn'?t|not)\b.{0,10}\b(open|work)|\bstuck at the (gate|barrier)/i],
   ['machine',/\b(machine|kiosk)\b.{0,40}\b(won'?t|doesn'?t|not|declin\w*|reject\w*)\b/i],
   ['lost',/\blost my (nol )?card\b/i],
   ['wrongway',/\bwrong (train|bus|way|direction|line)\b/i],
   ['else',/\b(trouble|problem|issue)s? with my nol\b|\bnol card (isn'?t|is not|won'?t|doesn'?t|stopped) work/i]
  ],
  /* Only for trips inside Dubai: the guide does not cover travel between emirates */
  applies:({trip,profile,thread})=>{
   const places=[trip?.origin,trip?.dest?.address||trip?.dest?.name].filter(Boolean).join(' | ');
   const all=places+' | '+thread+' | '+(profile?.city||'');
   if(NOT_DUBAI.test(places)||NOT_DUBAI.test(thread)||(!trip?.origin&&NOT_DUBAI.test(String(profile?.city||''))))return {ok:false,note:'The person plans to use public transport for a trip that involves somewhere outside Dubai ('+(places||'another emirate')+'). Orivia’s checked public transport guide covers nol cards, the Metro and buses inside Dubai only, and there is no checked guide yet for travelling between Sharjah or another emirate and Dubai. If it helps, say that honestly in one sentence and suggest checking the route in Google Maps; do not claim the Dubai guide covers their whole journey.'};
   if(trip?.active&&trip.ready)return DUBAI.test(trip.origin||'')&&DUBAI.test(trip.dest?.address||trip.dest?.name||'')?{ok:true}:{ok:false};
   if(/\b(metro|tram)\b/i.test(thread)||DUBAI.test(all))return {ok:true}; // the Metro and tram only run in Dubai
   return {ok:false};
  }
 },
 'dubai.eid.student':{
  summary:'Every step of your student visa and Emirates ID, what you’re waiting for, and what to do if something goes wrong.',
  decision:/\b(?:my )?(?:uni|university|college) (?:is |will be |will )?sponsor\w*\b|\b(?:i'?m|i am|i'?ll|i will|i need to|going to|gonna) (?:start |apply\w* )(?:for )?(?:my |a )?student (?:residence )?visa\b/i,
  refresher:/\b(student visa|emirates id) (?:steps|guide)\b|\bremind me (?:of )?(?:the )?(?:student visa|visa|emirates id) steps\b/i,
  problems:[],
  applies:({thread})=>({ok:/\b(student|uni|university|college)\b/i.test(thread)})
 },
 'dubai.sim':{
  summary:'Which SIM you can get before and after your Emirates ID.',
  decision:/\b(?:i'?ll|i will|i need to|i'?m (?:gonna|going to)|gonna|i want to|i have to) (?:get|buy) (?:a )?(?:uae |local |new )?sim(?: card)?\b/i,
  refresher:/\bsim (?:card )?(?:guide|steps)\b/i,
  problems:[],
  applies:()=>({ok:true})
 }
};

const ID=/^[a-z]+(?:\.[a-z]+){1,3}$/;
const WHERE_WAS_I=/\b(where was i|where am i up to|what do i do next|what'?s my next step|my journeys?|my guides?|continue my (?:guide|journey))\b/i;
const txt=v=>typeof v==='string'?v:'';
// The person's step states (plan-steps.js). 'waiting' is an older save, read as waiting for them.
export const STEP_STATUSES=['not_started','in_progress','waiting_you','waiting_org','waiting','blocked','done','not_applicable','unsure'];
/* The person's own ticks, in words the AI can use. Never inferred, never changed here. */
export function progressSummary(id,steps){
 const d=journey(id);if(!d||!steps)return '';
 const j=d.journey,name=sid=>j.steps.find(x=>x.id===sid)?.title;
 const of=st=>j.steps.filter(x=>steps[x.id]===st).map(x=>x.title);
 const next=j.steps.find(x=>steps[x.id]!=='done'&&steps[x.id]!=='not_applicable');
 const parts=[['Done',of('done')],['Not applicable to them',of('not_applicable')],['In progress',of('in_progress')],['Waiting on them (their action)',of('waiting_you')],['Waiting for the organisation',[...of('waiting_org'),...of('waiting')]],['Blocked',of('blocked')],['Not sure',of('unsure')]].filter(([,v])=>v.length).map(([k,v])=>k+': '+v.join('; '));
 return 'THEIR OWN PROGRESS in “'+j.title+'” (ticked by them in Journeys, the same record the Journeys tab shows): '+(parts.join('. ')||'nothing ticked yet')+'.'+(next?' First step not done: '+next.title+'.':' Every step is ticked.')+' Use this instead of re-asking. Never change it yourself: if they say they finished something, offer to mark it and tell them they can tap the step’s status in Journeys.';
}
/* A problem's help comes as a short answer, calm words plus steps, or a choice of situations */
function problemHelp(p){
 const steps=[...(p.guide?.steps||[]).map(g=>({title:txt(g.title),body:txt(g.body),list:(g.list||[]).filter(x=>typeof x==='string'),tip:txt(g.tip)})),
  ...((p.branch?.options)||[]).map(o=>({title:txt(o.label),body:txt(o.answer),list:[],tip:''}))].filter(x=>x.title||x.body);
 return {id:p.id,question:txt(p.question),answer:txt(p.answer)||txt(p.guide?.calm)||txt(p.branch?.question),steps};
}
export function readGuideState(prefs){
 const g=prefs&&typeof prefs==='object'&&prefs.guides&&typeof prefs.guides==='object'?prefs.guides:{};
 const ids=x=>Array.isArray(x)?x.filter(v=>typeof v==='string'&&ID.test(v)).slice(0,30):[];
 const progress={};
 if(g.progress&&typeof g.progress==='object')for(const [jid,steps] of Object.entries(g.progress).slice(0,10)){
  if(!ID.test(jid)||!steps||typeof steps!=='object')continue;
  const clean={};for(const [sid,st] of Object.entries(steps).slice(0,30))if(/^[a-z0-9_-]{1,30}$/.test(sid)&&STEP_STATUSES.includes(st))clean[sid]=st;
  if(Object.keys(clean).length)progress[jid]=clean;
 }
 return {versions:g.versions&&typeof g.versions==='object'?Object.fromEntries(Object.entries(g.versions).filter(([id,v])=>ID.test(id)&&typeof v==='string'&&/^[a-f0-9]{64}$/.test(v)).slice(0,30)):{},following:ids(g.following),saved:ids(g.saved),paused:ids(g.paused),done:ids(g.done),offered:ids(g.offered),progress};
}
function journey(id){const r=callJourneyApi('/api/v1/journeys/'+id);return r.status===200?r.data:null}

/* Which card (if any) to show under this reply, and what the AI should know about it */
export function guideOffer(messages,{trip,profile,prefs,resolveGuide}={}){
 const users=(Array.isArray(messages)?messages:[]).filter(m=>m.role==='user').map(m=>String(m.content||''));
 const latest=users.at(-1)||'';
 const thread=users.slice(-6).join(' | ');
 const state=readGuideState(prefs);
 let pick=null,context='';
 if(WHERE_WAS_I.test(latest)){
  const mine=[...state.following,...state.paused].filter((x,i,a)=>a.indexOf(x)===i);
  if(mine.length===1)pick={id:mine[0],kind:'refresher',progress:true};
  else if(mine.length>1)return {offer:null,context:'JOURNEYS: The person is following more than one guide ('+mine.map(id=>journey(id)?.journey?.title).filter(Boolean).join('; ')+'). Ask which one they mean before going on. Do not guess their progress.'};
  else return {offer:null,context:'JOURNEYS: The person is not following any guide yet. Say so kindly and ask what they would like help with; they can also browse the Journeys tab.'};
 }
 for(const [id,g] of Object.entries(GUIDES)){
  if(pick)break;
  const problem=g.problems.find(([,re])=>re.test(latest));
  if(problem){pick={id,kind:'problem',problemId:problem[0]};break}
  if(g.refresher.test(latest)){pick={id,kind:'refresher',progress:true};break}
  /* A decision anywhere in the recent conversation counts, so the card can appear once the route is known */
  if(users.slice(-6).some(u=>g.decision.test(u))){
   const fit=g.applies({trip,profile,thread});
   if(!fit.ok){if(fit.note)context=fit.note;continue}
   if(['following','saved','paused','done','offered'].some(k=>state[k].includes(id)))continue; // never nag
   if(prefs?.suggestGuides===false)continue; // turned off in Settings; asking for a guide still works
   pick={id,kind:'offer'};break;
  }
 }
 if(!pick)return {offer:null,context};
 const resolved=resolveGuide?resolveGuide(pick.id):undefined;const d=resolved===undefined?journey(pick.id):(resolved?{journey:resolved,verifiedOn:resolved.checkedAt,fresh:resolved.fresh}:null);if(!d)return {offer:null,context};
 const j=d.journey, g=GUIDES[pick.id]||{summary:j.summary||''};
 if(resolved&&pick.problemId)return {offer:null,context:'The current reviewed guide does not publish a remedy for that problem. Check current source evidence instead of using a bundled older remedy.'};
 const p=pick.problemId?j.problems.find(x=>x.id===pick.problemId):null;
 const offer={id:j.id,kind:pick.kind,title:j.title,summary:j.summary||g.summary,steps:j.stepCount||j.steps.length,...(resolved?.version?{version:resolved.version,publicationRevision:resolved.publicationRevision}:{}),checkedAt:d.verifiedOn,fresh:d.fresh,
  status:state.following.includes(j.id)?'active':state.paused.includes(j.id)?'paused':state.saved.includes(j.id)?'saved':state.done.includes(j.id)?'done':null,
  ...(p?{problem:(({id,question,answer})=>({id,question,answer}))(problemHelp(p))}:{})};
 const what={offer:'offering it, with Follow guide, Save for later and Not now',refresher:'bringing the guide back for them',problem:'showing the checked answer for “'+(p?.question||'')+'” from that guide'}[pick.kind];
 context='GUIDE CARD: Under your reply, Orivia shows a card for the checked guide “'+j.title+'”, '+what+'. Mention it in one short, natural sentence (for example “I’ve put a step-by-step guide below if you’d like help getting set up”). Do not list its steps, prices or rules yourself.';
 if(pick.progress&&state.progress[j.id]&&!resolved)context+='\n'+progressSummary(j.id,state.progress[j.id]);else if(pick.progress&&resolved){if(resolved.metadataOnly)context+='\nOpen Journeys to inspect the current steps and compare the person’s saved version. Do not map older completion onto new instructions.';else if(state.versions[j.id]===resolved.version)context+='\nPersonal notes for this exact version: '+j.steps.filter(s=>state.progress[j.id]?.[s.id]).map(s=>s.title+': '+state.progress[j.id][s.id]).join('; ')+'. These are not official approvals.';else context+='\nTheir saved plan has a different or unknown version. Ask them to review changes in Journeys; do not map older completion onto new steps.'}
 return {offer,context};
}

/* Read-only guide content for the in-app guide view */
export function guideContent(id){
 if(!ID.test(String(id||'')))return null;
 const d=journey(id);if(!d)return null;
 const j=d.journey, list=x=>(Array.isArray(x)?x:[]).filter(v=>typeof v==='string'&&v.trim()).slice(0,12);
 const guide={id:j.id,title:j.title,city:j.city,checkedAt:d.verifiedOn,reviewDue:d.reviewDue,fresh:d.fresh,
  summary:GUIDES[j.id]?.summary||'',
  sources:(j.sources||[]).filter(s=>/^https:\/\//.test(s.url)).map(s=>({name:s.name,url:s.url})),
  steps:j.steps.map(s=>({id:s.id,title:s.title,info:list(s.info),doThis:list(s.doThis),
   bring:(s.bring||[]).map(b=>b&&b.item).filter(x=>typeof x==='string'),tips:list(s.tips),
   cost:typeof s.cost==='string'?s.cost:'',time:typeof s.time==='string'?s.time:'',waitingFor:typeof s.waitingFor==='string'?s.waitingFor:'',
   staffQuestion:typeof s.staffQuestion==='string'?s.staffQuestion:'',expect:txt(s.expect),
   statuses:STEP_STATUSES.filter(x=>x!=='waiting'&&(x!=='waiting_org'||s.waitingFor||s.appointment)),
   confirm:txt((j.checkups||[]).find(c=>c.step===s.id&&c.confirm)?.confirm)})),
  problems:(j.problems||[]).map(problemHelp).filter(p=>p.question&&(p.answer||p.steps.length)),
  fullGuideUrl:'https://aurelithgroup.github.io/orivia/?j='+encodeURIComponent(j.id)};
 return {...guide,review:guideReview(guide)};
}

/* The library for Explore Journeys: only guides that exist, grouped by what they help with */
const CATEGORY=j=>j.need==='docs'?['residency','Residency']:/student/.test(j.id)?['university','University']:j.need==='move'?['transport','Transport']:j.need==='health'?['health','Health']:j.need==='work'?['work','Work']:j.need==='edu'?['family','Family']:['everyday','Everyday life'];
export function guideCatalogue(city='dubai'){
 const r=callJourneyApi('/api/v1/journeys?city='+encodeURIComponent(city));
 if(r.status!==200)return [];
 return r.data.journeys.map(x=>{
  const d=journey(x.id);if(!d)return null;
  const j=d.journey, [category,categoryName]=CATEGORY(j);
  return {id:j.id,title:j.title,city:j.city,category,categoryName,steps:j.steps.length,checkedAt:d.verifiedOn,fresh:d.fresh,
   summary:GUIDES[j.id]?.summary||'Covers: '+j.steps.slice(0,3).map(s=>s.title).join(' · ')+(j.steps.length>3?' …':''),
   suggested:!!GUIDES[j.id]};
 }).filter(Boolean);
}
