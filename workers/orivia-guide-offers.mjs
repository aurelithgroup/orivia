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
  refresher:/\bnol\b.{0,40}\b(again|work|works|working|refresh\w*|remind)|\b(how (?:does|do) (?:the |a |my )?nol|refresher on (?:the )?(?:nol|metro|public transport)|remind me how (?:the )?(?:nol|metro) works|public transport guide)\b/i,
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
const txt=v=>typeof v==='string'?v:'';
/* A problem's help comes as a short answer, calm words plus steps, or a choice of situations */
function problemHelp(p){
 const steps=[...(p.guide?.steps||[]).map(g=>({title:txt(g.title),body:txt(g.body),list:(g.list||[]).filter(x=>typeof x==='string'),tip:txt(g.tip)})),
  ...((p.branch?.options)||[]).map(o=>({title:txt(o.label),body:txt(o.answer),list:[],tip:''}))].filter(x=>x.title||x.body);
 return {id:p.id,question:txt(p.question),answer:txt(p.answer)||txt(p.guide?.calm)||txt(p.branch?.question),steps};
}
export function readGuideState(prefs){
 const g=prefs&&typeof prefs==='object'&&prefs.guides&&typeof prefs.guides==='object'?prefs.guides:{};
 const ids=x=>Array.isArray(x)?x.filter(v=>typeof v==='string'&&ID.test(v)).slice(0,30):[];
 return {following:ids(g.following),saved:ids(g.saved),offered:ids(g.offered)};
}
function journey(id){const r=callJourneyApi('/api/v1/journeys/'+id);return r.status===200?r.data:null}

/* Which card (if any) to show under this reply, and what the AI should know about it */
export function guideOffer(messages,{trip,profile,prefs}={}){
 const users=(Array.isArray(messages)?messages:[]).filter(m=>m.role==='user').map(m=>String(m.content||''));
 const latest=users.at(-1)||'';
 const thread=users.slice(-6).join(' | ');
 const state=readGuideState(prefs);
 let pick=null,context='';
 for(const [id,g] of Object.entries(GUIDES)){
  const problem=g.problems.find(([,re])=>re.test(latest));
  if(problem){pick={id,kind:'problem',problemId:problem[0]};break}
  if(g.refresher.test(latest)){pick={id,kind:'refresher'};break}
  /* A decision anywhere in the recent conversation counts, so the card can appear once the route is known */
  if(users.slice(-6).some(u=>g.decision.test(u))){
   const fit=g.applies({trip,profile,thread});
   if(!fit.ok){if(fit.note)context=fit.note;continue}
   if(state.following.includes(id)||state.saved.includes(id)||state.offered.includes(id))continue; // never nag
   pick={id,kind:'offer'};break;
  }
 }
 if(!pick)return {offer:null,context};
 const d=journey(pick.id);if(!d)return {offer:null,context};
 const j=d.journey, g=GUIDES[pick.id];
 const p=pick.problemId?j.problems.find(x=>x.id===pick.problemId):null;
 const offer={id:j.id,kind:pick.kind,title:j.title,summary:g.summary,steps:j.steps.length,checkedAt:d.verifiedOn,fresh:d.fresh,
  status:state.following.includes(j.id)?'following':state.saved.includes(j.id)?'saved':null,
  ...(p?{problem:(({id,question,answer})=>({id,question,answer}))(problemHelp(p))}:{})};
 const what={offer:'offering it, with Follow guide, Save for later and Not now',refresher:'bringing the guide back for them',problem:'showing the checked answer for “'+(p?.question||'')+'” from that guide'}[pick.kind];
 context='GUIDE CARD: Under your reply, Orivia shows a card for the checked guide “'+j.title+'”, '+what+'. Mention it in one short, natural sentence (for example “I’ve put a step-by-step guide below if you’d like help getting set up”). Do not list its steps, prices or rules yourself.';
 return {offer,context};
}

/* Read-only guide content for the in-app guide view */
export function guideContent(id){
 if(!ID.test(String(id||'')))return null;
 const d=journey(id);if(!d)return null;
 const j=d.journey, list=x=>(Array.isArray(x)?x:[]).filter(v=>typeof v==='string'&&v.trim()).slice(0,12);
 return {id:j.id,title:j.title,city:j.city,checkedAt:d.verifiedOn,reviewDue:d.reviewDue,fresh:d.fresh,
  summary:GUIDES[j.id]?.summary||'',
  sources:(j.sources||[]).filter(s=>/^https:\/\//.test(s.url)).map(s=>({name:s.name,url:s.url})),
  steps:j.steps.map(s=>({id:s.id,title:s.title,info:list(s.info),doThis:list(s.doThis),
   bring:(s.bring||[]).map(b=>b&&b.item).filter(x=>typeof x==='string'),tips:list(s.tips),
   cost:typeof s.cost==='string'?s.cost:'',time:typeof s.time==='string'?s.time:'',waitingFor:typeof s.waitingFor==='string'?s.waitingFor:'',
   staffQuestion:typeof s.staffQuestion==='string'?s.staffQuestion:''})),
  problems:(j.problems||[]).map(problemHelp).filter(p=>p.question&&(p.answer||p.steps.length)),
  fullGuideUrl:'https://aurelithgroup.github.io/orivia/?j='+encodeURIComponent(j.id)};
}
