/* Orivia research loop: understand → research → assess coverage → answer the latest question.
 * The model only proposes (intent, names, filters, extra searches). Code enforces tools, sources, budgets and citations.
 * Documented in docs/research-loop.md. Enabled with RESEARCH_LOOP=1.
 */
import {understandRequest} from './orivia-research-understand.mjs';
import {RESEARCH_SOURCES} from './orivia-research-policy.mjs';
import {speaPage,parseProfile,parseDirectory,classifyMatches,nameScore,curriculumMatches,listsYear,SPEA_DIRECTORY} from './orivia-spea-reader.mjs';
import {siteHost,establishDomain,readSiteFacts,sitePageLinks,nameOnPage,yearEvidence} from './orivia-school-sites.mjs';

export const LOOP_LIMITS=Object.freeze({yearFollowups:2,searchesPerTurn:4,fetchesPerTurn:24,profilesPerTurn:12,listPagesPerTurn:2,sitePagesPerOrg:4,orgsPerCompare:3,contactsPerTurn:4,leadsPerVerifyQuery:5,searchCount:20,timeoutMs:6500,pageBytes:1000000,leadsKept:25});
export const LEVEL={regulator:'regulator',regulatorIndex:'regulator-index',siteLinked:'own-site-linked',siteUser:'own-site-user',siteFound:'own-site-found',lead:'lead'};
const plain=s=>String(s||'').replace(/<!--[\s\S]*?-->/g,' ').replace(/<(script|style|svg|noscript|template)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<br\s*\/?>|<\/(p|div|li|h[1-6]|tr)>/gi,'. ').replace(/<[^>]*>/g,' ').replace(/&(?:nbsp|#160);/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&rsquo;/g,"'").replace(/\s+/g,' ').trim();
const CURR_NAME={british:'British',american:'American',indian:'Indian',ib:'IB',australian:'Australian',french:'French',german:'German',moe:'MoE',pakistani:'Pakistani',filipino:'Filipino',sabis:'SABIS'};
const TOPIC_WORD={school:'schools',nursery:'nurseries',university:'universities',bank:'banks',clinic:'clinics',hospital:'hospitals','government-service':'government services',other:'places'};
const ORG_WORD=/\b(school|academy|college|university|nursery|institute|bank|clinic|hospital|centre|center)\b/i;
const AGGREGATOR=/(^|\.)(bayut\.com|propertyfinder\.ae|edarabia\.com|whichschooladvisor\.com|schoolsdubai\.com|schoolscompared\.com|edustoke\.com|mdares\.ai|edcare\.ae|gulfnews\.com|khaleejtimes\.com|thenationalnews\.com|timeoutdubai\.com|expatwoman\.com|dubizzle\.com|wikipedia\.org|tripadvisor\.[a-z.]+|yellowpages-uae\.com|top10uae\.com|expatexchange\.com|savills\.ae|allsopp\.com)$/i;

/* ---------- Regulators: one plug-in each. Only SPEA is connected so far. ---------- */
export const REGULATORS=[{
 id:'spea',name:'Sharjah Private Education Authority (SPEA)',short:'SPEA',topics:['school'],site:'spea.shj.ae',
 covers:l=>l?.country==='uae'&&l?.city==='Sharjah',
 isRecord:u=>!!speaPage(u),record:u=>speaPage(u),directory:SPEA_DIRECTORY,parseDirectory,parseProfile,
 indexName:t=>{const n=String(t||'').replace(/\s*[|\-–]\s*(?:SPEA|Sharjah Private Education Authority).*$/i,'').trim();return ORG_WORD.test(n)&&!/under development|report|\.pdf|^schools?$/i.test(n)?n:''},
 searchTerms:c=>(CURR_NAME[c.curriculum]?CURR_NAME[c.curriculum]+' curriculum ':'')+'private school Sharjah'
}];
export function regulatorFor(topic,location){return REGULATORS.find(r=>r.topics.includes(topic)&&r.covers(location))||null}

/* ---------- Tools: every network call goes through here and is counted ---------- */
async function readBounded(r,max){
 if(Number(r.headers.get('content-length')||0)>max)throw Error('too-large');
 const reader=r.body?.getReader?.();if(!reader)throw Error('no-stream');let size=0;const chunks=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max)throw Error('too-large');chunks.push(value)}}catch(e){await reader.cancel().catch(()=>{});throw e}
 const out=new Uint8Array(size);let o=0;for(const c of chunks){out.set(c,o);o+=c.length}return new TextDecoder().decode(out);
}
const publicHost=h=>h&&h.includes('.')&&!/^\d+\.\d+\.\d+\.\d+$/.test(h)&&!h.includes(':')&&!/(^|\.)localhost$|\.local$|\.internal$/.test(h);
const turnLimit=(v,def,max)=>{const n=Math.floor(Number(v));return Number.isFinite(n)&&n>0?Math.min(n,max):def};
export function makeTools({env={},fetcher=fetch,reserve}={}){
 // Per-turn limits: defaults as before; a deployment may raise them (RESEARCH_TURN_SEARCHES ≤ 10, RESEARCH_TURN_FETCHES ≤ 40).
 const limits={searches:turnLimit(env.RESEARCH_TURN_SEARCHES,LOOP_LIMITS.searchesPerTurn,10),fetches:turnLimit(env.RESEARCH_TURN_FETCHES,LOOP_LIMITS.fetchesPerTurn,40)};
 const used={searches:0,fetches:0},log=[];
 const search=async(q,{site='',offset=0}={})=>{
  if(used.searches>=limits.searches){log.push({step:'search',status:'turn-limit'});return {status:'turn-limit',results:[]}}
  if(!env.BRAVE_SEARCH_API_KEY){log.push({step:'search',status:'not-configured'});return {status:'not-configured',results:[]}}
  if(typeof reserve!=='function'||!(await reserve(env))){log.push({step:'search',status:'search-limit'});return {status:'search-limit',results:[]}}
  used.searches++;
  const u=new URL('https://api.search.brave.com/res/v1/web/search');
  u.search=new URLSearchParams({q:q+(site?' site:'+site:''),count:String(LOOP_LIMITS.searchCount),offset:String(Math.min(9,Math.max(0,offset))),safesearch:'strict',country:'ALL',search_lang:'en',spellcheck:'false'}).toString();
  try{
   const r=await fetcher(u.href,{redirect:'manual',signal:AbortSignal.timeout(LOOP_LIMITS.timeoutMs),headers:{Accept:'application/json','X-Subscription-Token':env.BRAVE_SEARCH_API_KEY}});
   if(!r.ok){await r.body?.cancel?.();log.push({step:'search',site:site||'web',offset,status:'search-unavailable',http:r.status});return {status:'search-unavailable',http:r.status,results:[]}}
   const d=JSON.parse(await readBounded(r,400000));
   // Titles and snippets are kept as LEADS only. They are never shown as facts.
   const results=(Array.isArray(d?.web?.results)?d.web.results:[]).map(x=>{let host='';try{const p=new URL(x.url);if(p.protocol==='https:')host=p.hostname.toLowerCase()}catch(_){}return host?{url:x.url,host,title:plain(x.title).slice(0,160),snippet:plain(x.description).slice(0,300)}:null}).filter(Boolean);
   log.push({step:'search',site:site||'web',offset,status:'searched',http:r.status,results:results.length});
   return {status:'searched',results,more:d?.query?.more_results_available===true};
  }catch(_){log.push({step:'search',site:site||'web',offset,status:'search-unavailable'});return {status:'search-unavailable',results:[]}}
 };
 // kind: 'regulator' (registry or regulator record), 'site' (one organisation's host), 'discovery' (a list page: names only)
 const fetchPage=async(url,{kind,host=''}={})=>{
  let u;try{u=new URL(url)}catch(_){return {ok:false,reason:'bad-url'}}
  if(u.protocol!=='https:'||u.username||u.password||u.port||!publicHost(u.hostname.toLowerCase()))return {ok:false,reason:'not-allowed'};
  const h=u.hostname.toLowerCase().replace(/^www\./,'');
  if(kind==='regulator'&&!(RESEARCH_SOURCES[u.hostname.toLowerCase()]&&(speaPage(url)||speaPage(url,{directory:true}))))return {ok:false,reason:'not-allowed'};
  if(kind==='site'&&h!==host)return {ok:false,reason:'not-allowed'};
  if(kind==='discovery'&&(RESEARCH_SOURCES[u.hostname.toLowerCase()]||/(^|\.)gov\.[a-z]{2}$/.test(h)))return {ok:false,reason:'not-allowed'};
  if(used.fetches>=limits.fetches)return {ok:false,reason:'turn-limit'};
  used.fetches++;
  const get=x=>fetcher(x,{redirect:'manual',signal:AbortSignal.timeout(LOOP_LIMITS.timeoutMs),headers:{Accept:'text/html','User-Agent':'OriviaSourceReader/0.3'}});
  try{
   let r=await get(u.href),final=u.href;
   if(r.status>=300&&r.status<400){
    const to=(()=>{try{return new URL(r.headers.get('location')||'',u.href)}catch(_){return null}})();await r.body?.cancel?.();
    if(!to||to.protocol!=='https:'||to.hostname.toLowerCase().replace(/^www\./,'')!==h)return {ok:false,reason:'redirected-elsewhere',http:r.status};
    if(kind==='regulator'&&!speaPage(to.href))return {ok:false,reason:'redirected-elsewhere',http:r.status};
    if(used.fetches>=limits.fetches)return {ok:false,reason:'turn-limit'};
    used.fetches++;r=await get(to.href);final=to.href;if(r.status>=300&&r.status<400){await r.body?.cancel?.();return {ok:false,reason:'too-many-redirects',http:r.status}}
   }
   if(!r.ok){await r.body?.cancel?.();return {ok:false,reason:r.status===404?'not-found':'not-available',http:r.status}}
   if(!/text\/html/i.test(r.headers.get('content-type')||'')){await r.body?.cancel?.();return {ok:false,reason:'unsupported-content',http:r.status}}
   const raw=await readBounded(r,LOOP_LIMITS.pageBytes);
   if(/verify (?:you are|you're) human|enable javascript and cookies|access denied|checking your browser/i.test(plain(raw).slice(0,1200)))return {ok:false,reason:'blocked',http:r.status};
   return {ok:true,raw,url:final,http:r.status};
  }catch(e){return {ok:false,reason:e?.message==='too-large'?'too-large':e?.name==='TimeoutError'?'timeout':'not-available'}}
 };
 return {search,fetchPage,used,log,limits};
}

/* ---------- Search queries: built only from validated fields (topic, curriculum, place, organisation name) ---------- */
const PERSONAL=/\bmy\b|\b(sons?|daughters?|child|children|kids?|husband|wife|mum|mom|dad|brother|sister)(?:['’]s)?\b/i; // "Our Own English High School" is a real name
/** An organisation name may go into a search only if it reads as an organisation: no personal words, and either 2+ words
 * besides a type word, a type word plus another word, or a match to an organisation Orivia already showed. */
export function queryName(name,shown=[]){
 const n=String(name||'').replace(/[^\p{L}\p{N}&.' -]+/gu,' ').replace(/\s+/g,' ').trim().slice(0,80);
 if(!n||PERSONAL.test(n))return '';
 const words=n.split(' '),typed=ORG_WORD.test(n),rest=words.filter(w=>!ORG_WORD.test(w));
 if(rest.length===1&&/'s$/i.test(rest[0]))return ''; // "Layla's school"
 if(shown.some(s=>nameScore(n,s)>=0.85))return n;
 return (typed&&rest.length>=1)||rest.length>=2?n:'';
}
// How people actually write about each curriculum: a second and third discovery search use these words, the way a person
// rewrites a search ("British schools" → "IGCSE schools") when the first wording finds little. Fixed words, never chat text.
const CURR_ALT={british:'IGCSE A Level UK curriculum',american:'US curriculum American diploma',ib:'International Baccalaureate IB',indian:'CBSE ICSE',french:'French curriculum lycée',german:'German curriculum',australian:'Australian curriculum',moe:'Ministry of Education curriculum',pakistani:'Pakistani curriculum FBISE',filipino:'Philippine curriculum',sabis:'SABIS'};
export const WEB_VARIANTS=3;
export function buildQuery(kind,u,{name='',R=null,variant=0}={}){
 const c=u.constraints||{},cur=CURR_NAME[c.curriculum]||'',topic=TOPIC_WORD[u.topic]||'',city=String(u.location?.city||'').replace(/[^\p{L} ]/gu,'');
 if(kind==='regulator')return R.searchTerms(c);
 if(kind==='web-list'){const v=Math.max(0,Math.min(WEB_VARIANTS-1,Math.floor(Number(variant)||0)));
  if(v===1)return [CURR_ALT[c.curriculum]||cur,topic,city].filter(Boolean).join(' ');
  if(v===2)return ['best',cur,topic,city?'in '+city:'',new Date().getUTCFullYear()].filter(Boolean).join(' ');
  return ['list of',cur?cur+' curriculum':'',topic,city?'in '+city:''].filter(Boolean).join(' ')}
 if(kind==='web-find')return [cur?cur+' curriculum':'',topic,city].filter(Boolean).join(' ');
 if(kind==='name')return name?'"'+name.replace(/"/g,'')+'"':'';
 if(kind==='name-site')return name?'"'+name.replace(/"/g,'')+'" '+city+' official website':'';
 return '';
}

/* ---------- Leads: names from search results and list pages. Never facts. ---------- */
// Menu and call-to-action text that looks like a name: starts with an action or list word, or talks about schools in general.
const NAV_NAME=/^(?:view|list|see|find|explore|browse|discover|search|visit|read|learn|apply|book|enquire|enroll|enrol|register|contact|join|choose|compare|back|more|top|best|why|about|meet|go|click|download|watch|request)\b|\b(?:all|our|your|these|those|other|nearby|more)\s+(?:\w+\s+){0,2}(?:schools|academies|colleges|nurseries)\b|\ball\s+our\b|\blist of\b|\bschools\s*$/i;
// Headings that describe schools rather than name one ("British Curriculum School", "Parent Rating for Best British School").
// Real names that start with a category word ("The Indian High School", "Dubai British School") are kept.
const GENERIC_NAME=/\b(?:curriculum|curricula|ratings?|reviews?|rankings?|ranked|rated|fees|parents?|parent's|guide|compared?|comparison|near(?:by)?|best|top|cheapest|affordable|list)\b/i;
export function leadNames(raw,limit=LOOP_LIMITS.leadsKept){
 const text=String(raw).replace(/<(script|style|nav|footer|header)\b[^>]*>[\s\S]*?<\/\1>/gi,' ');const out=[];
 for(const m of text.matchAll(/<(h[1-5]|li|strong|b|td|a)\b[^>]*>([\s\S]{3,200}?)<\/\1>/gi)){
  const t=plain(m[2]).replace(/^\d+[.)]\s*/,'');
  const n=t.match(/\b([A-Z][A-Za-z'.&-]*(?:\s+(?:[A-Z][A-Za-z'.&-]*|of|the|and|&|for)){0,8}\s+(?:School|Academy|College|Nursery)(?:\s*\([^)]{2,40}\))?)/);
  if(!n)continue;const name=n[1].trim();
  if(/^(?:The |Best |Top |Private |International |British |American |Indian |Our |Your |This |A )?(?:School|Academy|College|Nursery)$/i.test(name)||name.split(/\s+/).length<2)continue;
  if(NAV_NAME.test(name)||(t.length<60&&NAV_NAME.test(t))||GENERIC_NAME.test(name))continue; // menu links ("View All Our Schools", "List of All GEMS School") aren't school names
  if(!out.some(x=>nameScore(x,name)>=0.95))out.push(name);if(out.length>=limit)break;
 }
 return out;
}
const isListPage=r=>AGGREGATOR.test(r.host)||/\b(best|top|list|guide|all)\b.*\b(schools?|nurser|clinics|banks)\b|\bschools? in\b/i.test(r.title);

/* ---------- Regulator work ---------- */
function regulatorRecord(R,url,raw){const p=R.parseProfile(raw);return p.readable?{name:p.name,url,fields:p.fields,level:LEVEL.regulator}:null}
function matchesConstraints(rec,c){
 if(c.curriculum&&rec.fields?.curriculum&&!curriculumMatches(rec.fields.curriculum.value,c.curriculum))return {ok:false,why:'curriculum'};
 if(c.year&&rec.fields?.grades&&!listsYear(rec.fields.grades.value,c.year))return {ok:false,why:'year'};
 return {ok:true,unchecked:[c.curriculum&&!rec.fields?.curriculum?'curriculum':'',c.year&&!rec.fields?.grades?'year':''].filter(Boolean)};
}
async function discoverWithRegulator(R,u,task,tools,cov){
 const c=u.constraints,shown=new Set((task?.shown||[]).map(s=>s.url).filter(Boolean)),shownNames=(task?.shown||[]).map(s=>s.name),sameName=(a,b)=>String(a).trim().toLowerCase()===String(b).trim().toLowerCase();
 const cursor=u.intent==='find'?null:task?.cursor||null;
 const records=new Map(),index=new Map(),leads=[];const addIndex=(url,name)=>{if(url&&name&&!records.has(url)&&!index.has(url))index.set(url,name)};
 // 1. Directory page (cards carry name + curriculum as the regulator states them).
 if(!cursor){const d=await tools.fetchPage(R.directory,{kind:'regulator'});
  if(d.ok){const dir=R.parseDirectory(d.raw);cov.regulatorTotal=dir.total;cov.directoryListed=dir.cards.length;
   for(const card of dir.cards)records.set(card.url,{name:card.name,url:card.url,fields:card.curriculum?{curriculum:{value:card.curriculum,quote:card.quote}}:{},level:LEVEL.regulator,from:'directory-card'})}
  else cov.failures.push({what:'regulator-directory',reason:d.reason,http:d.http??null})}
 else if(task?.regulatorTotal)cov.regulatorTotal=task.regulatorTotal;
 // 2. Regulator-restricted search (paged with the cursor).
 let offset=cursor?.offset||0;
 const regSearch=async q=>{const s=await tools.search(q,{site:R.site,offset});cov.searches.push({kind:'regulator',offset,status:s.status,results:s.results.length});
  for(const r of s.results)if(R.isRecord(r.url))addIndex(R.record(r.url),R.indexName(r.title));return s};
 let s=await regSearch(R.searchTerms(c));let more=!!s.more;offset++;
 // 3. Wider discovery on the open web when asked for more/all, or when the regulator gave little.
 if(['more','all'].includes(u.intent)||index.size+records.size<6){
  const q=buildQuery('web-list',u);
  const w=await tools.search(q);cov.searches.push({kind:'web',status:w.status,results:w.results.length});
  for(const r of w.results.filter(isListPage).slice(0,LOOP_LIMITS.listPagesPerTurn)){
   const p=await tools.fetchPage(r.url,{kind:'discovery'});cov.listPages.push({host:r.host,outcome:p.ok?'read':p.reason});
   if(p.ok)for(const n of leadNames(p.raw))if(!leads.some(x=>nameScore(x.name,n)>=0.95))leads.push({name:n,from:r.host});
  }
  for(const r of w.results)if(!isListPage(r)&&ORG_WORD.test(r.title)&&siteHost(r.url))leads.push({name:r.title.split(/\s[|\-–]\s/)[0].trim().slice(0,90),from:r.host});
 }
 // 4. Check a batch of leads against the regulator in one search.
 const known=n=>[...records.values()].some(x=>nameScore(n,x.name)>=0.85)||[...index.values()].some(x=>nameScore(n,x)>=0.85)||shownNames.some(x=>nameScore(n,x)>=0.85);
 const fresh=leads.filter(l=>!known(l.name)).slice(0,LOOP_LIMITS.leadsPerVerifyQuery);
 if(fresh.length){const q='('+fresh.map(l=>'"'+l.name.replace(/"/g,'').slice(0,60)+'"').join(' OR ')+')';const v=await tools.search(q,{site:R.site});cov.searches.push({kind:'regulator-check-leads',status:v.status,results:v.results.length,leads:fresh.length});
  for(const r of v.results)if(R.isRecord(r.url))addIndex(R.record(r.url),R.indexName(r.title))}
 // 5. "All": page further through the regulator results while the turn's search budget lasts.
 while(u.intent==='all'&&more&&tools.used.searches<LOOP_LIMITS.searchesPerTurn&&offset<=9){s=await regSearch(R.searchTerms(c));more=!!s.more;offset++}
 // 6. Open regulator records: leads first, then pending from last turn, then new index entries. Never re-open shown ones.
 const leadFirst=[...index.entries()].sort((a,b)=>(leads.some(l=>nameScore(l.name,b[1])>=0.85)?1:0)-(leads.some(l=>nameScore(l.name,a[1])>=0.85)?1:0)).map(([url])=>url);
 const toOpen=[...(cursor?.pending||[]),...leadFirst,...[...records.values()].filter(r=>!r.fields.curriculum).map(r=>r.url)].filter((x,i,a)=>x&&a.indexOf(x)===i&&!shown.has(x));
 const batch=toOpen.slice(0,LOOP_LIMITS.profilesPerTurn);
 const pages=await Promise.all(batch.map(url=>tools.fetchPage(url,{kind:'regulator'}).then(p=>({url,p}))));
 for(const {url,p} of pages){if(!p.ok){cov.failures.push({what:'regulator-record',path:new URL(url).pathname,reason:p.reason,http:p.http??null});continue}
  const rec=regulatorRecord(R,p.url,p.raw);if(!rec){cov.failures.push({what:'regulator-record',path:new URL(url).pathname,reason:'unreadable'});continue}
  index.delete(url);records.set(rec.url,rec);if(rec.url!==url)records.delete(url)}
 cov.recordsOpened=pages.length;
 // 7. Sort into confirmed matches, regulator-listed but unchecked, and leads not yet found on the regulator.
 const seenNames=new Set();const verified=[],skipped={curriculum:0,year:0,alreadyShown:0};
 for(const r of records.values()){
  if(shown.has(r.url)||shownNames.some(n=>sameName(n,r.name))){skipped.alreadyShown++;continue}
  const m=matchesConstraints(r,c);if(!m.ok){skipped[m.why]++;continue}
  if(m.unchecked.length)continue; // curriculum/year unknown: listed below as unchecked instead
  const key=r.name.toLowerCase();if(seenNames.has(key))continue;seenNames.add(key);verified.push(r);
 }
 const unchecked=[...index.entries(),...[...records.values()].filter(r=>matchesConstraints(r,c).ok&&matchesConstraints(r,c).unchecked.length).map(r=>[r.url,r.name])]
  .filter(([url,name])=>!shown.has(url)&&!verified.some(v=>v.url===url)&&!shownNames.some(n=>sameName(n,name))).map(([url,name])=>({url,name,level:LEVEL.regulatorIndex}));
 const notOnRegulator=leads.filter(l=>![...records.values()].some(x=>nameScore(l.name,x.name)>=0.85)&&![...index.values()].some(x=>nameScore(l.name,x)>=0.85)&&!shownNames.some(x=>nameScore(l.name,x)>=0.85));
 cov.skipped=skipped;cov.leadsFound=leads.length;cov.leadsMatched=leads.length-notOnRegulator.length;
 const pending=toOpen.slice(batch.length).concat(unchecked.map(x=>x.url)).filter((x,i,a)=>a.indexOf(x)===i).slice(0,24);
 cov.nextCursor=more||pending.length?{offset,pending}:null;
 return {verified,unchecked,leads:notOnRegulator};
}

/* ---------- Organisation websites ---------- */
async function readSite(tools,startUrl,host,maxPages=LOOP_LIMITS.sitePagesPerOrg,purpose='overview',year=null){
 const first=await tools.fetchPage(startUrl,{kind:'site',host});if(!first.ok)return {ok:false,reason:first.reason,pages:[]};
 const pages=[{url:first.url,raw:first.raw}],tried=new Set([first.url]);
 /* links ranked by what this request needs (and the year asked about), then capped */
 for(const link of sitePageLinks(first.raw,first.url,host,maxPages-1,purpose,{year})){tried.add(link);const p=await tools.fetchPage(link,{kind:'site',host});if(p.ok)pages.push({url:p.url,raw:p.raw})}
 // Asked about a year and not found yet: follow the pages most likely to cover it (a phase or year-group page), within budget.
 const followed=[];
 if(year&&!yearEvidence(readSiteFacts(pages,host),year).listed.length){
  const next=[...new Set(pages.flatMap(p=>sitePageLinks(p.raw,p.url,host,4,'year',{year})))].filter(u=>!tried.has(u));
  for(const link of next.slice(0,LOOP_LIMITS.yearFollowups)){tried.add(link);const p=await tools.fetchPage(link,{kind:'site',host});followed.push({path:new URL(link).pathname,outcome:p.ok?'read':p.reason});if(p.ok)pages.push({url:p.url,raw:p.raw});if(yearEvidence(readSiteFacts(pages,host),year).listed.length)break}
 }
 return {ok:true,pages,followed};
}
const siteTitle=raw=>plain((String(raw).match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||'').split(/\s[|\-–]\s/)[0].trim().slice(0,100)||plain((String(raw).match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)||[])[1]||'').slice(0,100);
async function checkOrganisation(org,u,R,tools,cov,shownNames=[]){
 const out={query:org.name||org.url,regulator:null,candidates:[],site:null};
 // A link the person gave is read directly: its statements are the organisation's own, not regulatory confirmation.
 let userSite=null;
 if(org.url){const host=siteHost(org.url)||(()=>{try{return new URL(org.url).hostname.replace(/^www\./,'')}catch(_){return ''}})();
  const s=host?await readSite(tools,org.url,host,LOOP_LIMITS.sitePagesPerOrg,u.intent==='contacts'?'contacts':'overview',u.constraints.year):{ok:false,reason:'not-allowed',pages:[]};
  if(s.followed?.length)cov.yearFollowups=s.followed;
  if(s.ok){userSite={host,level:LEVEL.siteUser,pages:s.pages,name:siteTitle(s.pages[0].raw),facts:readSiteFacts(s.pages,host)};out.site=userSite}
  else cov.failures.push({what:'user-link',reason:s.reason})}
 const name=org.name||userSite?.name||'';
 // Only a name that reads as an organisation is ever sent to a search provider.
 let qn=queryName(org.name||'',shownNames)||(userSite?.name?queryName(userSite.name,[userSite.name]):'');
 const pool=new Map();let cards=[];
 if(R&&name){const d=await tools.fetchPage(R.directory,{kind:'regulator'});if(d.ok){const dir=R.parseDirectory(d.raw);cov.regulatorTotal=dir.total;cards=dir.cards;for(const c of cards)if(nameScore(name,c.name)>=0.5)pool.set(c.url,c.name)}}
 // A one-word name is searched only when it matches an organisation the regulator itself lists (never a person's name).
 if(!qn&&org.name&&!PERSONAL.test(org.name)&&cards.some(c=>nameScore(org.name,c.name)>=0.85))qn=org.name.replace(/[^\p{L}\p{N}&.' -]+/gu,' ').trim().slice(0,80);
 if(name&&!qn&&!userSite&&!pool.size){out.status='needs-name';return out}
 if(R&&name){
  // Regulator identity: directory cards + a regulator-restricted search for the exact name, then open the best few.
  const s=qn?await tools.search(buildQuery('name',u,{name:qn}),{site:R.site}):{status:'skipped',results:[]};cov.searches.push({kind:'regulator',status:s.status,results:s.results.length});
  for(const r of s.results)if(R.isRecord(r.url)){const n=R.indexName(r.title);if(!n||nameScore(name,n)>=0.5)pool.set(R.record(r.url),n||'')}
  const ranked=[...pool.entries()].sort((a,b)=>nameScore(name,b[1])-nameScore(name,a[1])).slice(0,4);
  const opened=await Promise.all(ranked.map(([url])=>tools.fetchPage(url,{kind:'regulator'}).then(p=>p.ok?regulatorRecord(R,p.url,p.raw):(cov.failures.push({what:'regulator-record',path:new URL(url).pathname,reason:p.reason}),null))));
  const recs=opened.filter(Boolean);
  const unopened=ranked.filter(([url])=>!recs.some(r=>r.url===url)).map(([url,n])=>({name:n,url,fields:{},level:LEVEL.regulatorIndex})).filter(x=>x.name);
  const cls=classifyMatches(name,[...recs,...unopened]);
  out.status=cls.status;out.candidates=cls.candidates;
  if(cls.status==='match')out.regulator=cls.candidates[0];
 }else out.status=name?'no-regulator':'needs-name';
 // The organisation's own site, if not already given: from the regulator's link, or found by search and proven.
 // Website discovery continues whether or not the regulator matched; ownership and regulatory status are reported separately.
 if(!out.site&&name&&['match','no-regulator','not-found'].includes(out.status)){
  const rec=out.regulator;let hosts=[];
  if(rec?.fields?.website)hosts.push({host:siteHost(rec.fields.website.url),url:rec.fields.website.url});
  if(!hosts.length&&(rec?.name||qn)){const q=buildQuery('name-site',u,{name:rec?.name||qn});const s=await tools.search(q);cov.searches.push({kind:'web',status:s.status,results:s.results.length});
   for(const r of s.results){const h=siteHost(r.url);if(h&&!AGGREGATOR.test(h)&&!hosts.some(x=>x.host===h))hosts.push({host:h,url:'https://'+h+'/'});if(hosts.length>=2)break}}
  for(const {host,url} of hosts.filter(x=>x.host)){
   const s=await readSite(tools,url,host,LOOP_LIMITS.sitePagesPerOrg,u.intent==='contacts'?'contacts':'overview',u.constraints.year);if(!s.ok){cov.failures.push({what:'org-site',host,reason:s.reason});continue}
   if(s.followed?.length)cov.yearFollowups=s.followed;
   const proof=rec?establishDomain({school:rec,host}):{status:'unverified',basis:null,evidence:[],reasons:['no-regulator-record']};
   if(proof.status==='established'){cov.siteChecks.push({host,status:'established',basis:proof.basis});out.site={host,level:LEVEL.siteLinked,basis:proof.basis,evidence:proof.evidence,pages:s.pages,facts:readSiteFacts(s.pages,host)};break}
   // A matching name (or phone) can be copied: the site is at most "found", and every statement from it is labelled so.
   if(nameOnPage(rec?.name||name,s.pages[0].raw)){cov.siteChecks.push({host,status:'found-ownership-not-confirmed',reasons:proof.reasons});out.site={host,level:LEVEL.siteFound,pages:s.pages,facts:readSiteFacts(s.pages,host)};break}
   cov.siteChecks.push({host,status:'name-not-on-site',reasons:proof.reasons});
  }
 }
 return out;
}

/* ---------- Answer composition: answers the question asked, every fact tied to its source ---------- */
const FIELD_LABEL={curriculum:'Curriculum',grades:'Year groups',area:'Area',gender:'Gender',evaluation:'SPEA rating',phone:'Phone',email:'Email',website:'Website'};
function gradeSpan(g){const items=String(g||'').split(/[|,]/).map(x=>x.trim()).filter(Boolean),n=items.filter(x=>/^\d+$/.test(x)).map(Number),fs=items.filter(x=>/^(FS|KG)\d$/i.test(x)).sort();const lo=fs[0]||(n.length?'Year '+Math.min(...n):''),hi=n.length?'Year '+Math.max(...n):fs.at(-1);return lo&&hi&&lo!==hi?lo+' to '+hi:lo||hi||''}
function makeSources(){const list=[];return {list,add:(url,title,category)=>{let s=list.find(x=>x.url===url);if(!s){s={id:'S'+(list.length+1),url,title:String(title).slice(0,140),category,checkedAt:new Date().toISOString()};list.push(s)}return s}}}
function recordLine(rec,src,want=['curriculum','grades','area']){
 const f=rec.fields||{},bits=[],quotes=[];
 for(const k of want){const x=f[k];if(!x||!x.value)continue;const v=k==='grades'?gradeSpan(x.value):k==='area'?String(x.value).replace(/^Sharjah\s*-\s*/i,'')+(/^Sharjah/i.test(x.value)?', Sharjah':''):x.value;if(!v)continue;bits.push(k==='curriculum'?v+' curriculum':k==='grades'?'classes '+v:v);quotes.push({fact:k,label:FIELD_LABEL[k],quote:x.quote})}
 const text=rec.name+(bits.length?': '+bits.join(', '):'')+'.';
 return {text,claim:quotes.length?{text,sourceId:src.id,quote:quotes.map(q=>q.quote).join(' … '),quotes}:null};
}
function orgCard(rec,src,site,siteSrc){
 const f=rec.fields||{},facts=[],contacts={};
 for(const k of ['curriculum','grades','area','evaluation'])if(f[k])facts.push({key:k==='evaluation'?'rating':k,label:FIELD_LABEL[k],value:k==='grades'?gradeSpan(f[k].value)||f[k].value:f[k].value,sourceId:src.id,quote:f[k].quote});
 for(const k of ['phone','email'])if(f[k])contacts[k]={value:f[k].value,sourceId:src.id,quote:f[k].quote};
 if(f.website)contacts.website={url:f.website.url,sourceId:src.id,quote:f.website.quote};
 if(f.directions)contacts.directions={url:f.directions.url,label:f.directions.label,sourceId:src.id,quote:f.directions.quote};
 if(site&&siteSrc){for(const x of site.facts){const s=siteSrc(x.source.url);
  if(x.key==='phone'&&!contacts.phone)contacts.phone={value:x.value,sourceId:s.id,quote:x.quote};
  if(x.key==='email'&&!contacts.email)contacts.email={value:x.value,sourceId:s.id,quote:x.quote};}
  if(!contacts.website&&site.pages?.[0])contacts.website={url:site.pages[0].url,sourceId:siteSrc(site.pages[0].url).id,quote:site.host}}
 return {id:'org-'+(rec.url||rec.name).replace(/[^a-z0-9]+/gi,'-').slice(-32),kind:'school',name:rec.name,sourceId:src.id,facts,contacts};
}
const LEVEL_SAYS={[LEVEL.siteUser]:'The website you shared says',[LEVEL.siteLinked]:'Its own website (linked from the regulator) says',[LEVEL.siteFound]:'A website that presents itself as this school (ownership not confirmed by a regulator) says'};
function siteLines(site,addSrc,{year=null,intent=''}={}){
 const lines=[],claims=[],f=site.facts;
 const push=(t,x)=>{const s=addSrc(x.source.url,(site.name||site.host)+' (organisation’s own website)','organisation');lines.push(t+' ['+s.id.slice(1)+']');claims.push({text:t,sourceId:s.id,quote:x.quote,quotes:[{fact:x.key,label:x.label,quote:x.quote}]})};
 const curricula=()=>{for(const x of f.filter(x=>x.key==='curriculum'))push('Curriculum: '+x.value,x)};
 const years=()=>{
  if(year){const ev=yearEvidence(f,year);
   if(ev.listed.length)push('Year '+year+': listed ('+ev.listed[0].quote+')',ev.listed[0]);
   else if(ev.gradeOnly.length)push('Year '+year+': not stated. It describes Grades instead ('+ev.gradeOnly.slice(0,2).map(x=>x.value).join('; ')+'), which I haven’t converted to Years',ev.gradeOnly[0]);
   else lines.push('I couldn’t confirm Year '+year+' on the '+(site.pages?.length||'')+' pages I read from its website. That doesn’t mean it isn’t offered; the school can confirm.');
   return}
  const ys=f.filter(x=>x.key==='year-groups');const ranges=ys.filter(x=>/ to /.test(x.value)).slice(0,2);
  for(const x of ranges.length?ranges:ys.slice(0,2))push('Year groups: '+x.value,x);
 };
 const contacts=()=>{for(const k of ['phone','email','admissions-page']){const x=f.find(y=>y.key===k);if(x)push(({phone:'Phone: ',email:'Email: ','admissions-page':'Admissions page: '})[k]+x.value,x)}};
 if(intent==='contacts'){contacts();return {lines,claims}}
 curricula();years();contacts();
 return {lines,claims};
}

/** Run one research turn. Returns a reply object in the existing research response shape, or null if not a research turn. */
export async function runResearchTurn({messages,profile={},context=null},env,{fetcher=fetch,reserve,understanding=null}={}){
 const task=context?.task&&typeof context.task==='object'?sanitizeTask(context.task):null;
 const u=understanding||await understandRequest({messages,profile,task},{ai:env.AI});
 if(!u.research||u.intent==='other'||u.intent==='rules')return null; // rules keep the existing official-sources path
 const tools=makeTools({env,fetcher,reserve});
 const cov={searches:[],listPages:[],failures:[],siteChecks:[],regulatorTotal:null,complete:false,reasons:[]};
 const R=regulatorFor(u.topic,u.location);const src=makeSources();const sid=(url,title,cat)=>src.add(url,title,cat);
 const claims=[],orgs=[];let reply='',status='evidence-found',cardMode='list';
 const fresh=u.intent==='find'&&(!task||task.topic!==u.topic||task.location?.city!==u.location.city||task.constraints?.curriculum!==u.constraints.curriculum||task.constraints?.year!==u.constraints.year);
 const scope=fresh?{...(task||{}),shown:[],cursor:null}:task;
 const nextTask={intent:u.intent,topic:u.topic,location:u.location,constraints:u.constraints,shown:[...(scope?.shown||[])],focus:task?.focus||'',regulatorTotal:task?.regulatorTotal||null};
 const where=u.location.city||(u.location.country==='uk'?'the UK':u.location.country==='uae'?'the UAE':'');
 if(!u.location.country&&!u.organisations.some(o=>o.url)){return result(u,'needs-context','Which city is this for?',src.list,[],[],nextTask,cov,tools,'list')}

 if(['find','more','all'].includes(u.intent)){
  const label=(CURR_NAME[u.constraints.curriculum]?CURR_NAME[u.constraints.curriculum]+'-curriculum ':'')+(TOPIC_WORD[u.topic]||'places')+(u.constraints.year?' listing Year '+u.constraints.year:'');
  if(R){
   const d=await discoverWithRegulator(R,u,scope,tools,cov);
   const parts=[];
   if(d.verified.length){
    parts.push(u.intent==='find'?d.verified.length+' '+label+' in '+where+' I could confirm on '+R.short+':':'Here are '+d.verified.length+' more '+label+' I could confirm on '+R.short+', not including the ones I already showed you:');
    for(const r of d.verified){const s=sid(r.url,r.name+' ('+R.short+')','official');const l=recordLine(r,s);parts.push(l.text+' ['+s.id.slice(1)+']');if(l.claim)claims.push(l.claim);orgs.push(orgCard(r,s));nextTask.shown.push({name:r.name,url:r.url,level:LEVEL.regulator})}
   }else parts.push(u.intent==='find'?'I couldn’t confirm any '+label+' in '+where+' on '+R.short+' in this check.':'I didn’t find any new '+label+' in this round, so I haven’t repeated the ones I already showed.');
   if(d.unchecked.length){parts.push('Also listed on '+R.short+', but I haven’t opened their pages yet'+(u.constraints.curriculum?' to check the curriculum':'')+': '+d.unchecked.slice(0,8).map(x=>x.name).join('; ')+(d.unchecked.length>8?' and '+(d.unchecked.length-8)+' more':'')+'.')}
   if(d.leads.length)parts.push('Mentioned on other websites but not found on '+R.short+' yet (names only, not checked): '+d.leads.slice(0,6).map(x=>x.name).join('; ')+'.');
   const seen=new Set(nextTask.shown.map(s=>s.url)).size;nextTask.regulatorTotal=cov.regulatorTotal||nextTask.regulatorTotal;
   cov.seen=seen;cov.reasons.push('regulator-directory-not-fully-readable');
   parts.push((nextTask.regulatorTotal?R.short+' lists about '+nextTask.regulatorTotal+' private schools in '+where+'. ':'')+'I’ve confirmed '+seen+' so far, so this isn’t the full list.'+(cov.nextCursor||d.unchecked.length?' Say “keep going” and I’ll check more.':' I couldn’t find more to check right now.'));
   nextTask.cursor=cov.nextCursor;nextTask.pendingOffer=cov.nextCursor||d.unchecked.length?'more':'';
   if(!d.verified.length)status=cov.searches.some(x=>x.status==='searched')||cov.recordsOpened?'partial':(cov.searches.find(x=>x.status!=='searched')?.status||'search-unavailable');
   reply=parts.join('\n\n');cardMode='list';
  }else{
   // No regulator connected for this place/type: web discovery and organisations' own sites, said plainly.
   const q=buildQuery('web-find',u);
   const w=await tools.search(q);cov.searches.push({kind:'web',status:w.status,results:w.results.length});
   const sites=[],leads=[];
   for(const r of w.results){const h=siteHost(r.url);if(isListPage(r)){continue}if(h&&ORG_WORD.test(r.title)&&!sites.some(x=>x.host===h))sites.push({host:h,url:r.url,name:r.title.split(/\s[|\-–]\s/)[0].trim()})}
   for(const r of w.results.filter(isListPage).slice(0,LOOP_LIMITS.listPagesPerTurn)){const p=await tools.fetchPage(r.url,{kind:'discovery'});cov.listPages.push({host:r.host,outcome:p.ok?'read':p.reason});if(p.ok)for(const n of leadNames(p.raw))if(!leads.includes(n))leads.push(n)}
   const parts=['I can’t check '+(TOPIC_WORD[u.topic]||'these')+' in '+where+' against a regulator yet, so this comes from web search and the organisations’ own websites.'];
   for(const s of sites.slice(0,3)){const r=await readSite(tools,s.url,s.host,2,'overview',u.constraints.year);if(!r.ok||!nameOnPage(s.name,r.pages[0].raw))continue;const site={host:s.host,name:s.name,level:LEVEL.siteFound,pages:r.pages,facts:readSiteFacts(r.pages,s.host)};
    const sl=siteLines(site,sid,{year:u.constraints.year,intent:u.intent});parts.push(s.name+' — '+LEVEL_SAYS[LEVEL.siteFound].toLowerCase().replace(/ says$/,'')+':'+(sl.lines.length?'\n'+sl.lines.join('\n'):' (no clear details found on its pages)'));claims.push(...sl.claims);nextTask.shown.push({name:s.name,url:r.pages[0].url,level:LEVEL.siteFound})}
   if(leads.length)parts.push('Other names mentioned on listing sites (not checked): '+leads.slice(0,8).join('; ')+'.');
   parts.push('Without a regulator directory I can’t tell how complete this is.');cov.reasons.push('no-regulator-connected');
   reply=parts.join('\n\n');status=claims.length?'partial':'no-evidence';
  }
 }else if(u.intent==='check'||u.intent==='contacts'||u.intent==='compare'){
  let targets=u.organisations.slice(0,u.intent==='compare'?LOOP_LIMITS.orgsPerCompare:1);
  // "How do I contact them?" about a list: contacts for the schools already shown (re-read from the regulator).
  if(u.intent==='contacts'&&!targets.length&&task?.shown?.length&&R){
   const list=task.shown.filter(s=>s.level===LEVEL.regulator&&R.isRecord(s.url)).slice(-LOOP_LIMITS.contactsPerTurn);
   const pages=await Promise.all(list.map(s=>tools.fetchPage(s.url,{kind:'regulator'}).then(p=>p.ok?regulatorRecord(R,p.url,p.raw):null)));
   const parts=['Here are the contacts '+R.short+' lists for the schools I showed you:'];
   for(const rec of pages.filter(Boolean)){const s=sid(rec.url,rec.name+' ('+R.short+')','official');const l=recordLine(rec,s,['phone','email']);parts.push(l.text+' ['+s.id.slice(1)+']');if(l.claim)claims.push(l.claim);orgs.push(orgCard(rec,s))}
   if(parts.length===1)parts.push('I couldn’t open their '+R.short+' pages just now, so I haven’t guessed any contact details.');
   reply=parts.join('\n\n');cardMode='choose';status=claims.length?'evidence-found':'partial';
   return result(u,status,reply,src.list,claims,orgs,nextTask,cov,tools,cardMode);
  }
  if(!targets.length)return result(u,'needs-context',u.intent==='compare'?'Which ones would you like me to compare?':'Which '+(u.topic==='school'?'school':'organisation')+' do you mean?',[],[],[],nextTask,cov,tools,'single');
  const parts=[];
  for(const t of targets){
   const r=await checkOrganisation(t,u,R,tools,cov,(task?.shown||[]).map(x=>x.name));
   if(r.status==='candidates'){
    parts.push('I found several similar names'+(R?' on '+R.short:'')+' for “'+r.query+'”. Which one do you mean?\n'+r.candidates.map(c=>{const s=sid(c.url,c.name+' ('+R.short+')','official');return c.name+' ['+s.id.slice(1)+']'}).join('\n'));
    status='needs-context';cardMode='single';continue;
   }
   if(r.status==='not-found'&&!r.site){parts.push('I didn’t find “'+r.query+'” on the '+(R?R.short+' pages':'pages')+' I checked. That doesn’t mean it doesn’t exist — do you have its exact name or website?');status='no-evidence';continue}
   if(r.status==='needs-name'&&!r.site){parts.push('What’s the organisation’s full name or website?');status='needs-context';continue}
   const lines=[];
   if(r.regulator){const s=sid(r.regulator.url,r.regulator.name+' ('+R.short+')','official');const want=u.intent==='contacts'?['phone','email']:['curriculum','grades','area','evaluation'];const l=recordLine(r.regulator,s,want);
    lines.push((u.intent==='contacts'?R.short+' lists these contacts for ':R.short+' lists ')+l.text+' ['+s.id.slice(1)+']');if(l.claim)claims.push(l.claim);
    const siteSrc=r.site?url=>sid(url,(r.regulator.name)+' (own website)','organisation'):null;orgs.push(orgCard(r.regulator,s,r.site,siteSrc));
    nextTask.shown.push({name:r.regulator.name,url:r.regulator.url,level:LEVEL.regulator});nextTask.focus=r.regulator.name;
    if(u.constraints.curriculum&&r.regulator.fields?.curriculum&&!curriculumMatches(r.regulator.fields.curriculum.value,u.constraints.curriculum))lines.push('Note: that isn’t the '+CURR_NAME[u.constraints.curriculum]+' curriculum you asked about earlier.');
   }else if(R&&t.name)lines.push('I couldn’t confirm “'+(t.name||r.query)+'” on '+R.short+', so nothing here is regulatory confirmation.');
   else if(!R)lines.push('I can’t check this against a regulator here, so nothing below is regulatory confirmation.');
   if(r.site){const sl=siteLines(r.site,sid,{year:u.constraints.year,intent:u.intent});if(sl.lines.length){lines.push(LEVEL_SAYS[r.site.level]+':\n'+sl.lines.join('\n'));claims.push(...sl.claims)}
    else lines.push('I opened '+r.site.host+' but couldn’t find clear details on the pages I read.');
    if(!r.regulator){nextTask.focus=r.site.name||t.name;nextTask.shown.push({name:r.site.name||t.name||r.site.host,url:r.site.pages[0].url,level:r.site.level})}
    const sc=r.site.facts.filter(f=>f.key==='curriculum').map(f=>f.value),rc=r.regulator?.fields?.curriculum?.value;
    if(rc&&sc.length&&!sc.some(v=>v.toLowerCase().startsWith(rc.toLowerCase().split(/[ (]/)[0])))lines.push('Its website and '+R.short+' describe the curriculum differently, so it’s worth asking the school directly.');}
   else if(u.intent!=='compare'&&cov.siteChecks.length)lines.push('I looked for its website but couldn’t find one that names it, so I haven’t used any.');
   if(u.intent==='contacts'&&!claims.length)lines.push('I couldn’t confirm contact details from the pages I opened, so I haven’t guessed any.');
   parts.push(lines.filter(Boolean).join('\n'));
  }
  reply=parts.join('\n\n');cardMode=u.intent==='compare'?'list':u.intent==='contacts'?'choose':'single';
  if(status==='evidence-found'&&!claims.length)status='partial';
 }
 return result(u,status,reply,src.list,claims,orgs,nextTask,cov,tools,cardMode);
}
function result(u,status,reply,sources,claims,orgs,task,cov,tools,cardMode){
 const refs=sources.length?'\n\n'+sources.map((s,i)=>'['+(i+1)+'] '+s.title+': '+s.url).join('\n'):'';
 task.shown=task.shown.filter((s,i,a)=>s.url&&a.findIndex(x=>x.url===s.url)===i).slice(-60);
 // One log line for `wrangler tail`: outcome codes and counts only, never user text, names, keys or queries.
 try{console.log(JSON.stringify({event:'orivia-research-loop',status,understanding:u.source,intent:u.intent,topic:u.topic,city:u.location?.city||'',searches:tools.used.searches,fetches:tools.used.fetches,sources:sources.length,trace:tools.log.map(x=>({step:x.step,site:x.site,status:x.status,http:x.http,results:x.results}))}))}catch(_){}
 return {reply:reply+refs,verifiedSources:[],liveSources:sources.map(({id,url,title,category,checkedAt})=>({id,url,title,category,checkedAt,topic:u.topic})),actions:[],liveInformation:sources.length>0,liveJourneyData:false,
  organisations:orgs.slice(0,8),cardMode,
  research:{status,applicability:'needs-review',claims,unresolved:[],loop:true,understanding:{source:u.source,intent:u.intent,topic:u.topic,location:u.location,constraints:u.constraints,organisations:u.organisations.map(o=>o.name||o.url)},
   coverage:{complete:false,...cov,searchesUsed:tools.used.searches,fetchesUsed:tools.used.fetches},taskContext:{task},trace:tools.log}};
}
/** Client-held task state is scope, never evidence: re-validate every field. */
export function sanitizeTask(t){
 const str=(v,n)=>typeof v==='string'?v.slice(0,n):'';
 const shown=(Array.isArray(t.shown)?t.shown:[]).slice(-60).map(s=>{let url='';try{const x=new URL(s?.url);if(x.protocol==='https:'&&!x.username&&!x.password&&!x.port)url=x.href}catch(_){}return url?{name:str(s.name,120),url,level:Object.values(LEVEL).includes(s.level)?s.level:LEVEL.lead}:null}).filter(Boolean);
 const cur=t.cursor&&typeof t.cursor==='object'?{offset:Math.max(0,Math.min(10,Math.floor(Number(t.cursor.offset)||0))),pending:(Array.isArray(t.cursor.pending)?t.cursor.pending:[]).map(x=>speaPage(x)).filter(Boolean).slice(0,48)}:null;
 const loc=t.location&&typeof t.location==='object'?{country:['uae','uk'].includes(t.location.country)?t.location.country:null,city:str(t.location.city,40)}:null;
 return {intent:str(t.intent,12),topic:str(t.topic,24),location:loc,constraints:{curriculum:str(t.constraints?.curriculum,12),year:Number.isInteger(t.constraints?.year)?t.constraints.year:null},shown,focus:str(t.focus,120),cursor:cur,regulatorTotal:Number.isInteger(t.regulatorTotal)?t.regulatorTotal:null,pendingOffer:str(t.pendingOffer,12),listTotal:t.listTotal&&Number.isInteger(t.listTotal.total)&&t.listTotal.total>0&&t.listTotal.total<=500?{curriculum:str(t.listTotal.curriculum,12),total:t.listTotal.total}:null};
}
/** Cheap pre-check (no model call) so ordinary chat doesn't spend a model call on understanding. */
export function maybeResearch(messages,context){
 const latest=String((messages||[]).filter(m=>m.role==='user').at(-1)?.content||'');
 if(context?.task?.topic&&latest.length<300)return true;
 return /https?:\/\/|\b(schools?|nurser(?:y|ies)|universit(?:y|ies)|colleges?|academy|banks?|clinics?|hospitals?)\b/i.test(latest);
}
// Shared with the research agent (orivia-research-agent.mjs): readers and answer composition, one implementation.
export {regulatorRecord,readSite,makeSources,recordLine,orgCard,siteLines,LEVEL_SAYS,isListPage,checkOrganisation,AGGREGATOR,ORG_WORD,CURR_NAME,TOPIC_WORD};
