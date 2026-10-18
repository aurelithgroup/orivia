/* Step 1 of the research loop: understand the latest request in context.
 * The model proposes a structured reading; code validates every field against the conversation itself.
 * If the model is unavailable or its reading is invalid, a rule-based reading is used instead.
 * Documented in docs/research-loop.md.
 */
export const INTENTS=['find','more','all','check','compare','contacts','rules','other'];
export const TOPICS=['school','nursery','university','bank','clinic','hospital','government-service','housing','transport','other'];
const CURRICULA=['british','american','indian','ib','australian','french','german','moe','pakistani','filipino','sabis'];
const UAE_CITIES=['Dubai','Sharjah','Abu Dhabi','Ajman','Fujairah','Umm Al Quwain','Ras Al Khaimah'];
const UK_CITIES=['London','Edinburgh','Manchester','Birmingham','Glasgow','Leeds','Liverpool','Bristol','Cardiff','Belfast'];
const MODEL='@cf/meta/llama-3.3-70b-instruct-fp8-fast';
// Constraints come from the person's own words, never from the model's guess.
const CURR_RE={british:/\bbritish\b|\buk curriculum\b|english national curriculum|\bigcse\b|\ba[- ]levels?\b/i,american:/\bamerican\b|\bus curriculum\b/i,indian:/\bindian\b|\bcbse\b|\bicse\b/i,ib:/\bib\b|international baccalaureate/i,australian:/\baustralian\b/i,french:/\bfrench\b/i,german:/\bgerman\b/i,moe:/\bmoe\b|ministry of education|emirati curriculum|uae (?:national )?curriculum/i,pakistani:/\bpakistani\b/i,filipino:/\bfilipino\b|\bpilipinas\b/i,sabis:/\bsabis\b/i};
export function curriculumIn(text){for(const [k,re] of Object.entries(CURR_RE))if(re.test(String(text||'')))return k;return ''}
const ACCEPT=/^\s*(?:yes|yeah|yep|yup|sure|please|ok|okay|go ahead|do it|go on|find them|look them up|that would be great)\b/i;
const TOPIC_RE={school:/\bschools?\b|curricul/i,nursery:/\bnurser(?:y|ies)\b/i,university:/\buni(?:versit(?:y|ies))?\b|\bcolleges?\b/i,bank:/\bbanks?\b|\baccounts?\b/i,clinic:/\bclinics?\b/i,hospital:/\bhospitals?\b/i};
/** Curriculum and year: explicit in the latest message, or carried from an active task (or earlier turns) only when the
 * latest message continues it. A fresh "find" inherits nothing. Organisation names are removed first ("Sharjah American…"). */
export function resolveConstraints({users,intent,task,names=[]}){
 const strip=t=>{let x=String(t||'');for(const n of names)if(n)x=x.split(n).join(' ');return x.replace(/\b(?:[A-Z][\w'.&-]*\s+){0,6}(?:School|Academy|College|Nursery)\b/g,' ')};
 const latest=strip(users.at(-1)||''),continuing=intent!=='find'||ACCEPT.test(users.at(-1)||'');
 const lastIn=(fn)=>{for(let i=users.length-2;i>=0;i--){const v=fn(strip(users[i]));if(v)return v}return ''};
 const yearOf=t=>{const m=String(t).match(/\byear\s*(\d{1,2})\b/i);return m&&+m[1]>=1&&+m[1]<=13?+m[1]:null};
 const curriculum=curriculumIn(latest)||(continuing?(task?.constraints?.curriculum||lastIn(curriculumIn)):'');
 const year=yearOf(latest)||(continuing?(task?.constraints?.year||lastIn(yearOf)||null):null);
 return {curriculum,year};
}
const clean=s=>String(s||'').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
const lower=s=>clean(s).toLowerCase();

/* ---------- Validation: nothing the model says is trusted unless the conversation supports it ---------- */
// Personal details never go to a search provider.
export function safeQuery(q){
 let s=clean(q).replace(/https?:\/\/\S+/g,' ').replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi,' ').replace(/\+?\d[\d ()-]{5,}\d/g,' ')
  .replace(/\b(?:my|our) (?:son|daughter|child|kids?|husband|wife|name)\b[^,.;]*/gi,' ').replace(/[^\p{L}\p{N}&.'"() -]+/gu,' ').replace(/\s+/g,' ').trim();
 if((s.match(/"/g)||[]).length%2)s=s.replace(/"/g,'');
 return s.slice(0,140);
}
const userText=messages=>messages.filter(m=>m.role==='user').map(m=>String(m.content||'')).join('\n');
const allText=messages=>messages.map(m=>String(m.content||'')).join('\n');
function urlsIn(text){return [...String(text).matchAll(/https?:\/\/[^\s<>"')\]]+/gi)].map(m=>m[0].replace(/[.,;:!?]+$/,'')).filter(u=>{try{const x=new URL(u);return x.protocol==='https:'&&!x.username&&!x.password&&!x.port}catch(_){return false}})}
function placeIn(text){
 const t=lower(text);let country=null,city='';
 const uae=UAE_CITIES.find(c=>t.includes(c.toLowerCase())),uk=UK_CITIES.find(c=>t.includes(c.toLowerCase()));
 if(uae){country='uae';city=uae}else if(/\b(uae|emirates)\b/.test(t))country='uae';
 if(uk&&(!uae||t.lastIndexOf(uk.toLowerCase())>t.lastIndexOf(uae.toLowerCase()))){country='uk';city=uk}else if(!country&&/\b(uk|united kingdom|england|scotland|wales|britain)\b/.test(t)&&!/\bbritish (?:curriculum|school)/.test(t))country='uk';
 return {country,city};
}
/** Validate a proposed reading against the conversation and previous task. Returns a clean reading or null. */
export function validateUnderstanding(raw,{messages,profile={},task=null}){
 let d=raw;if(typeof d==='string'){const m=d.replace(/^```(?:json)?|```$/g,'').match(/\{[\s\S]*\}/);try{d=m&&JSON.parse(m[0])}catch(_){return null}}
 if(!d||typeof d!=='object')return null;
 const said=userText(messages),saidLower=lower(said),latest=String(messages.filter(m=>m.role==='user').at(-1)?.content||'');
 const intent=INTENTS.includes(d.intent)?d.intent:null;if(!intent)return null;
 const evidenced=t=>TOPIC_RE[t]?.test(said)||t===task?.topic;
 const topic=TOPICS.includes(d.topic)&&(evidenced(d.topic)||!TOPIC_RE[d.topic])?d.topic:(task?.topic&&TOPICS.includes(task.topic)?task.topic:'other');
 // Location must appear in the chat, the shared profile or the active task.
 let location={country:null,city:''};const known=lower(said+' '+(profile.city||'')+' '+(profile.movingTo||'')+' '+(task?.location?.city||''));
 const lc=clean(d.location?.city);if(lc&&known.includes(lc.toLowerCase())){const p=placeIn(lc);location={country:p.country||(d.location?.country==='uk'?'uk':d.location?.country==='uae'?'uae':null),city:p.city||''}}
 if(!location.country){const p=placeIn(said);location=p.country?p:task?.location||placeIn(profile.city||profile.movingTo||'')}
 // Named organisations must actually be in the chat (user turns, or ones Orivia already showed).
 const shownNames=(task?.shown||[]).map(s=>s.name).filter(Boolean),mentioned=lower(allText(messages));
 const orgs=[];
 for(const o of Array.isArray(d.organisations)?d.organisations.slice(0,3):[]){
  const name=clean(o?.name).replace(/[^\p{L}\p{N}&.' ()-]/gu,' ').slice(0,90).trim();const url=typeof o?.url==='string'?o.url.trim():'';
  const okUrl=url&&urlsIn(said).includes(url.replace(/[.,;:!?]+$/,''))?url:'';
  const nameWords=lower(name).split(' ').filter(w=>w.length>2&&!['the','school','private','pvt','international','sharjah','dubai'].includes(w));
  const okName=name.length>=3&&(saidLower.includes(lower(name))||shownNames.some(n=>lower(n)===lower(name))||(nameWords.length&&nameWords.every(w=>mentioned.includes(w))));
  if(okName||okUrl)orgs.push({name:okName?name:'',url:okUrl});
 }
 for(const u of urlsIn(latest))if(!orgs.some(o=>o.url===u))orgs.push({name:'',url:u}); // a link in the latest message is always kept
 const users=messages.filter(m=>m.role==='user').map(m=>String(m.content||''));
 const {curriculum,year}=resolveConstraints({users,intent,task,names:orgs.map(o=>o.name)}); // the model's curriculum/year proposal is ignored
 const needsOrg=['check','contacts','compare'].includes(intent);
 const resolvedOrgs=orgs.length?orgs:needsOrg&&task?.focus?[{name:task.focus,url:''}]:[];
 return {source:'model',research:d.research!==false&&intent!=='other',intent,topic,location,constraints:{curriculum,year},organisations:resolvedOrgs,
  correction:clean(d.correction).slice(0,160),question:clean(d.question).slice(0,200)||clean(latest).slice(0,200)};
}

/* ---------- Rule-based reading: used when the model is unavailable or its output is invalid ---------- */
export function ruleUnderstanding({messages,profile={},task=null}){
 const users=messages.filter(m=>m.role==='user').map(m=>String(m.content||''));const latest=users.at(-1)||'',t=lower(latest),said=users.join('\n');
 let intent=null;
 if(/\b(compare|comparison|difference between|which (?:one|is) better|vs\.?|versus)\b/.test(t))intent='compare';
 else if(/\b(contact|phone|number|email|call them|reach them|get in touch|how (?:can|do) i (?:contact|reach))\b/.test(t))intent='contacts';
 else if(/\b(all of them|all (?:the )?\w* ?schools|every (?:single )?\w* ?school|full list|complete list|whole list|all of (?:those|these)|i want (?:to see )?all)\b/.test(t))intent='all';
 else if(/\b(only (?:two|2|three|3|those|these)|more (?:options|schools|ones)|other (?:schools|options|ones)|any (?:more|others)|is that (?:all|it)|keep going|show more)\b/.test(t))intent='more';
 else if(/\b(documents?|requirements?|rules?|eligib|visa|licen[cs]e|how do i (?:apply|register|enrol))\b/.test(t)&&!/\bschool\b/.test(t))intent='rules';
 const url=urlsIn(latest)[0]||'';
 const named=latest.match(/\b(?:heard (?:of|about)|what about|check(?: out)?|look up|tell me about|about|is|does)\s+((?:[A-Z][\w'.&-]*\s?){1,8}(?:School|Academy|College|University|Nursery|Bank|Clinic|Hospital)s?)\b/)||latest.match(/^\s*((?:[A-Z][\w'.&-]*\s?){1,8}(?:School|Academy|College|University|Nursery|Bank|Clinic|Hospital))\s*[.!?]*\s*$/);
 const correction=/\b(no,? i meant|i meant|not that one|actually|i said)\b/i.test(latest);
 // A capitalised name after "what about / heard of / I meant…" is a named check even without "School".
 const loose=!named&&latest.match(/\b(?:heard (?:of|about)|what about|how about|check(?: out)?|look up|tell me about|i meant|meant)\s+((?:[A-Z][\w'.&-]*\s?){1,8})/);
 if(!intent&&(named||loose||url))intent='check';
 if(!intent&&/\b(find|list|show|recommend|looking for|which|options|search)\b/.test(t))intent='find';
 if(!intent&&task&&/^(yes|yeah|yep|sure|please|ok|okay|go ahead|do it)\b/.test(t))intent=task.pendingOffer||task.intent||null;
 if(!intent)return {source:'rules',research:false,intent:'other'};
 let topic='other';
 for(const [k,re] of [['school',/\bschools?\b|curricul/],['nursery',/\bnurser(?:y|ies)\b/],['university',/\buni(?:versity|versities)?\b|\bcollege\b/],['bank',/\bbanks?\b|account/],['clinic',/\bclinics?\b/],['hospital',/\bhospitals?\b/]])if(re.test(t)){topic=k;break}
 if(topic==='other'&&task?.topic)topic=task.topic;
 const place=placeIn(latest);const location=place.country?place:task?.location||placeIn(said)||placeIn(profile.city||'');
 const cur=CURRICULA.find(c=>new RegExp('\\b'+(c==='moe'?'moe|ministry of education':c)+'\\b','i').test(latest));
 const yr=latest.match(/\b(?:year|grade)\s*(\d{1,2})\b/i);
 const organisations=named?[{name:named[1].trim(),url}]:loose?[{name:loose[1].trim(),url}]:url?[{name:'',url}]:(['check','contacts','compare'].includes(intent)&&task?.focus?[{name:task.focus,url:''}]:[]);
 return {source:'rules',research:true,intent,topic,location:location.country?location:{country:null,city:''},
  constraints:resolveConstraints({users,intent,task,names:organisations.map(o=>o.name)}),
  organisations,correction:correction?clean(latest).slice(0,160):'',question:clean(latest).slice(0,200)};
}

const SYSTEM=`You read a conversation between a newcomer and Orivia and describe what research the LATEST user message needs.
Return ONLY JSON with this shape:
{"research":true|false,"intent":"find|more|all|check|compare|contacts|rules|other","topic":"school|nursery|university|bank|clinic|hospital|government-service|housing|transport|other",
 "location":{"country":"uae|uk|null","city":""},"constraints":{"curriculum":"british|american|indian|ib|moe|...|","year":null},
 "organisations":[{"name":"exact name as the user wrote it or as Orivia listed it","url":""}],"correction":"","question":"the question to answer, one sentence"}
Rules: find = new options; more = additional options beyond those shown; all = every/full list; check = about a named organisation or a link;
compare = two or more named; contacts = phone/email/website; rules = official requirements or process. Resolve "them", "it", "that school" from context.
A correction ("no, I meant X") replaces the earlier name. Keep filters (curriculum, year, place) from earlier turns unless changed.
Never invent names, links or places that are not in the conversation.`;

/** Understand the latest request. ai: env.AI (optional). Returns a validated reading. */
export async function understandRequest({messages,profile={},task=null},{ai=null}={}){
 const msgs=(Array.isArray(messages)?messages:[]).filter(m=>m&&['user','assistant'].includes(m.role)).slice(-10).map(m=>({role:m.role,content:String(m.content||'').slice(0,700)}));
 if(ai?.run){
  try{
   const out=await ai.run(MODEL,{messages:[{role:'system',content:SYSTEM},{role:'user',content:JSON.stringify({task:task?{intent:task.intent,topic:task.topic,location:task.location,constraints:task.constraints,shown:(task.shown||[]).slice(-12).map(s=>s.name),focus:task.focus||''}:null,profileCity:clean(profile.city||'').slice(0,60),conversation:msgs})}],max_tokens:400,temperature:0,stream:false});
   const v=validateUnderstanding(out?.response??out,{messages:msgs,profile,task});
   if(v)return v;
  }catch(_){}
 }
 return ruleUnderstanding({messages:msgs,profile,task});
}
