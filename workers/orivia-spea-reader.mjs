/* SPEA school reader: discovery beyond the first directory page, and named-school lookup.
 * Inputs/outputs are documented in docs/spea-reader.md. No conversation planning or answer wording here.
 *
 * What SPEA's current site does (checked 17 Oct 2026):
 *  - /en/education-institutes/schools server-renders only the first 10 of ~136 schools. Pagination, page size and
 *    filters run in the browser; ?page=, ?pageSize= and ?curriculum= are ignored by the server. There is no name search.
 *  - Each school has a profile at /en/education-institutes/schools/<slug> with labelled fields.
 *  - Search indexes still hold older /en/educational-institutions/schools/<id> URLs.
 * So: read directory page 1, then find more profile links through budgeted, site-restricted search, then open a bounded
 * number of profiles and keep only what each profile itself states (verbatim quotes).
 */
import {researchSource} from './orivia-research-policy.mjs';

export const SPEA_DIRECTORY='https://spea.shj.ae/en/education-institutes/schools';
export const SPEA_LIMITS=Object.freeze({profilesPerCall:8,searchesPerCall:1,searchCount:20,maxSearchOffset:9,pageBytes:1200000,timeoutMs:6500,candidates:5,nameChars:80});
const CURRENT_PROFILE=/^\/en\/education-institutes\/schools\/[a-z0-9-]{1,120}\/?$/;
const OLD_PROFILE=/^\/en\/educational-institutions\/schools\/(?:\d{1,5}|[a-z0-9-]{1,120})\/?$/;
const PART={topic:'school',tier:'official'},LOC={country:'uae',city:'Sharjah'};

const plain=s=>String(s||'').replace(/<!--[\s\S]*?-->/g,' ').replace(/<(script|style|svg|nav|header|footer|form|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&(?:nbsp|#160);/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
const inner=s=>plain(String(s||'').replace(/<span[^>]*class="[^"]*sr-only[^"]*"[^>]*>[\s\S]*?<\/span>/gi,''));

/** Approved SPEA school page? Returns the normalised URL or ''. Policy first, then path shape. */
export function speaPage(url,{directory=false}={}){
 const s=researchSource(url,PART,LOC);if(!s)return '';
 const u=new URL(s.url);if(!/(^|\.)spea\.shj\.ae$/.test(u.hostname))return '';
 if(directory)return u.pathname.replace(/\/$/,'')==='/en/education-institutes/schools'?u.href:'';
 return CURRENT_PROFILE.test(u.pathname)||OLD_PROFILE.test(u.pathname)?u.href.replace(/\/$/,''):'';
}

/* ---------- Parsers (pure; tested against captured responses) ---------- */
/** Directory page: the cards the server rendered, plus the "1-10 of N" range. */
export function parseDirectory(raw){
 const html=String(raw||''),cards=[];
 for(const m of html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)){
  const h=m[1],href=h.match(/href="(\/en\/education-institutes\/schools\/[a-z0-9-]+)"/i)?.[1];if(!href)continue;
  const name=inner(h.match(/<h[2-5][^>]*>([\s\S]*?)<\/h[2-5]>/i)?.[1]);
  const curriculum=plain(h).match(/Curriculum::\s*([A-Za-z ()]+?)(?=\s+Learn More|\s*$)/)?.[1]?.trim()||'';
  const area=[...h.matchAll(/<span[^>]*>([^<]{3,80})<\/span>/g)].map(x=>plain(x[1])).find(t=>/^(?:Sharjah|Central Region|Eastern Region|Khor ?fakkan|Kalba|Al Dhaid|Dibba)\b/i.test(t))||'';
  if(name)cards.push({name,url:new URL(href,SPEA_DIRECTORY).href,curriculum,area,quote:curriculum?'Curriculum::'+curriculum:''});
 }
 const range=plain(html).match(/\b(\d+)\s*-\s*(\d+)\s+of\s+(\d+)\b/);
 return {cards,from:range?+range[1]:null,to:range?+range[2]:null,total:range?+range[3]:null};
}
/** Current profile page: exact name and labelled fields, each with the verbatim quote it came from. */
export function parseProfile(raw){
 const html=String(raw||''),text=plain(html);
 const name=inner(html.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i)?.[1]);
 const span=label=>{const v=inner(html.match(new RegExp('<span[^>]*>\\s*'+label+':\\s*([^<]{1,200})<\\/span>','i'))?.[1]);return v?{value:v,quote:label+': '+v}:null};
 const fields={};
 for(const [k,label] of [['curriculum','Curriculum'],['grades','Grade'],['gender','Gender']]){const f=span(label);if(f&&text.includes(f.quote))fields[k]=f}
 const anchors=[...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map(a=>({href:(a[1].match(/\bhref=["']([^"']+)["']/i)?.[1]||'').replace(/&amp;/g,'&'),label:inner(a[2]),full:plain(a[2])}));
 const loc=text.match(/School Location\s+(.{2,80}?)(?=\s+\(Opens in a new tab\)|\s+Phone Number|\s+Email|$)/)?.[1]?.trim();
 if(loc&&text.includes('School Location '+loc)){
  fields.area={value:loc,quote:'School Location '+loc};
  const a=anchors.find(x=>x.label===loc&&isMapLink(x.href));if(a)fields.directions={url:a.href,label:loc,quote:'School Location '+loc};
 }
 const tel=anchors.find(x=>/^tel:/i.test(x.href)),phone=tel&&tel.label.match(/^\+?\d[\d ()-]{5,18}\d$/)?.[0];
 if(phone&&text.includes('Phone Number '+phone))fields.phone={value:phone,quote:'Phone Number '+phone};
 const mail=anchors.find(x=>/^mailto:/i.test(x.href)&&/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(x.label));
 if(mail&&text.includes('Email '+mail.label))fields.email={value:mail.label,quote:'Email '+mail.label};
 const web=anchors.find(x=>/^Website\b/i.test(x.label)&&/^https:\/\//i.test(x.href)&&!/spea\.shj\.ae/i.test(x.href));
 if(web){try{const u=new URL(web.href);if(!u.username&&!u.password&&!u.port&&text.includes(web.full))fields.website={url:u.href,quote:web.full}}catch(_){}}
 return {name,fields,readable:!!(name&&fields.curriculum)};
}
function isMapLink(href){try{const u=new URL(href);return u.protocol==='https:'&&((u.hostname==='goo.gl'&&u.pathname.startsWith('/maps/'))||u.hostname==='maps.app.goo.gl'||(['google.com','www.google.com','maps.google.com'].includes(u.hostname)&&u.pathname.startsWith('/maps')))}catch(_){return false}}
/** Does the profile's quoted grade list include this year? (Listed provision only, never seats.) */
export function listsYear(grades,year){if(!year)return true;return String(grades||'').split(/[|,]/).map(x=>x.trim()).some(x=>x===String(year)||x.toLowerCase()==='year '+year)}
const CURRICULA={british:/^british$|cambridge|english national/i,american:/^american$/i,indian:/^indian$|cbse|icse/i,ib:/\bib\b|baccalar?eate/i,australian:/^australian$/i,french:/^french$/i,german:/^german$/i,moe:/^(moe|ministry of education)/i,pakistani:/^pakistani$/i,filipino:/pilipinas|filipino/i,sabis:/^sabis$/i};
export function curriculumMatches(value,wanted){if(!wanted)return true;const re=CURRICULA[String(wanted).toLowerCase()];return re?re.test(String(value||'').trim()):String(value||'').toLowerCase()===String(wanted).toLowerCase()}

/* ---------- Name matching: similar names return candidates, never a silent pick ---------- */
const GENERIC=new Set(['pvt','private','school','schools','llc','l','c','co','the','shj','sharjah','int','intl','international','propritorship','proprietorship','branch','br','br3','br4','br5','and','of','in','a']);
const EXPAND={eng:'english',hs:'high',sch:'school'};
export function nameTokens(name){return String(name||'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').trim().split(' ').map(t=>EXPAND[t]||t).filter(t=>t&&!GENERIC.has(t)&&!/^br\d+$/.test(t))}
export function nameScore(query,name){
 const a=nameTokens(query),b=nameTokens(name);if(!a.length||!b.length)return 0;
 const ja=a.join(''),jb=b.join('');if(ja===jb)return 1; // "Wesgreen" = "Wes green"
 if(ja.length>=6&&jb.startsWith(ja))return 0.9;
 const sb=new Set(b);let hit=0;for(const t of new Set(a))if(sb.has(t)||[...sb].some(x=>x.length>4&&t.length>4&&(x.startsWith(t)||t.startsWith(x))))hit++;
 return +(2*hit/(new Set(a).size+sb.size)).toFixed(3);
}
/** Classify ranked candidates: one clear match, several similar, or none. */
export function classifyMatches(query,items){
 const ranked=items.map(x=>({...x,score:nameScore(query,x.name)})).filter(x=>x.score>=0.5).sort((x,y)=>y.score-x.score);
 if(!ranked.length)return {status:'not-found',candidates:[]};
 const [top,next]=ranked;
 if(top.score>=0.99&&(!next||next.score<0.8))return {status:'match',candidates:[top]};
 if(top.score>=0.85&&(!next||top.score-next.score>=0.3))return {status:'match',candidates:[top]};
 return {status:'candidates',candidates:ranked.slice(0,SPEA_LIMITS.candidates)};
}

/* ---------- Default dependencies: policy-checked, bounded, budgeted ---------- */
async function readBounded(r,max){
 if(Number(r.headers.get('content-length')||0)>max)throw Error('too-large');
 const reader=r.body?.getReader?.();if(!reader)throw Error('no-stream');let size=0;const chunks=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max)throw Error('too-large');chunks.push(value)}}catch(e){await reader.cancel().catch(()=>{});throw e}
 const out=new Uint8Array(size);let o=0;for(const c of chunks){out.set(c,o);o+=c.length}return new TextDecoder().decode(out);
}
/** Build fetchPage/search from env. reserve = the shared search budget (reserveSearch from orivia-research.mjs). */
export function speaDeps({env={},fetcher=fetch,reserve}={}){
 const fetchPage=async(url,{allowOldRedirect=false}={})=>{
  const target=speaPage(url)||speaPage(url,{directory:true});if(!target)return {ok:false,reason:'source-not-approved'};
  try{
   let r=await fetcher(target,{redirect:'manual',signal:AbortSignal.timeout(SPEA_LIMITS.timeoutMs),headers:{Accept:'text/html','User-Agent':'OriviaSourceReader/0.2'}});
   let final=target,redirected=false;
   if(r.status>=300&&r.status<400){
    // One redirect only, and only from an old indexed profile to a current SPEA profile (same approved host, re-checked).
    const to=(()=>{try{return new URL(r.headers.get('location')||'',target).href}catch(_){return ''}})();await r.body?.cancel?.();
    const next=allowOldRedirect&&OLD_PROFILE.test(new URL(target).pathname)&&CURRENT_PROFILE.test(to?new URL(to).pathname:'')?speaPage(to):'';
    if(!next)return {ok:false,reason:'source-redirected',http:r.status};
    r=await fetcher(next,{redirect:'manual',signal:AbortSignal.timeout(SPEA_LIMITS.timeoutMs),headers:{Accept:'text/html','User-Agent':'OriviaSourceReader/0.2'}});
    final=next;redirected=true;if(r.status>=300&&r.status<400){await r.body?.cancel?.();return {ok:false,reason:'source-redirected',http:r.status}}
   }
   if(!r.ok){await r.body?.cancel?.();return {ok:false,reason:r.status===404?'source-not-found':'source-not-available',http:r.status}}
   if(!/text\/html/i.test(r.headers.get('content-type')||'')){await r.body?.cancel?.();return {ok:false,reason:'unsupported-content',http:r.status}}
   let raw;try{raw=await readBounded(r,SPEA_LIMITS.pageBytes)}catch(e){return {ok:false,reason:e?.message==='too-large'?'source-too-large':'source-not-available',http:r.status}}
   if(/verify (?:you are|you're) human|enable javascript and cookies|access denied|checking your browser/i.test(plain(raw).slice(0,1200)))return {ok:false,reason:'source-blocked',http:r.status};
   return {ok:true,raw,url:final,redirected,http:r.status};
  }catch(e){return {ok:false,reason:e?.name==='TimeoutError'?'source-timeout':'source-not-available'}}
 };
 const search=async(terms,{offset=0}={})=>{
  if(!env.BRAVE_SEARCH_API_KEY)return {status:'not-configured',urls:[]};
  if(typeof reserve!=='function'||!(await reserve(env)))return {status:'search-limit',urls:[]};
  const u=new URL('https://api.search.brave.com/res/v1/web/search');
  // Fixed terms plus a sanitised school name or curriculum only. Never chat text. Country ALL: AE isn't a Brave country.
  u.search=new URLSearchParams({q:terms+' site:spea.shj.ae',count:String(SPEA_LIMITS.searchCount),offset:String(Math.min(offset,SPEA_LIMITS.maxSearchOffset)),safesearch:'strict',country:'ALL',search_lang:'en',spellcheck:'false'}).toString();
  try{
   const r=await fetcher(u.href,{redirect:'manual',signal:AbortSignal.timeout(SPEA_LIMITS.timeoutMs),headers:{Accept:'application/json','X-Subscription-Token':env.BRAVE_SEARCH_API_KEY}});
   if(!r.ok){await r.body?.cancel?.();return {status:'search-unavailable',http:r.status,urls:[]}}
   const d=JSON.parse(await readBounded(r,300000));const results=Array.isArray(d?.web?.results)?d.web.results:[];
   const urls=[...new Set(results.map(x=>speaPage(x?.url)).filter(Boolean))]; // titles and snippets are discarded
   return {status:'searched',http:r.status,results:results.length,urls,more:d?.query?.more_results_available===true};
  }catch(_){return {status:'search-unavailable',urls:[]}}
 };
 return {fetchPage,search};
}

/* ---------- Shared: open profiles in bounded batches ---------- */
async function openProfiles(urls,deps,coverage){
 const batch=urls.slice(0,SPEA_LIMITS.profilesPerCall);
 const pages=await Promise.all(batch.map(async url=>{
  const got=await deps.fetchPage(url,{allowOldRedirect:true});
  if(!got.ok){coverage.failures.push({path:new URL(url).pathname,reason:got.reason,http:got.http??null});return null}
  const p=parseProfile(got.raw);
  if(!p.readable){coverage.failures.push({path:new URL(url).pathname,reason:'profile-unreadable',http:got.http??null});return null}
  return {url:got.url,requestedUrl:url,redirected:!!got.redirected,name:p.name,fields:p.fields};
 }));
 coverage.profilesOpened+=batch.length;
 // Old and current URLs can be the same school: keep the first copy of each exact name.
 const seen=new Set(),out=[];for(const p of pages)if(p&&!seen.has(p.name.toLowerCase())){seen.add(p.name.toLowerCase());out.push(p)}
 return {schools:out,unopened:urls.slice(batch.length)};
}
const curriculumTerm=c=>({british:'British',american:'American',indian:'Indian',ib:'IB International Baccalaureate',australian:'Australian',french:'French',german:'German',moe:'Ministry of Education',pakistani:'Pakistani',filipino:'Filipino',sabis:'SABIS'})[String(c||'').toLowerCase()]||'';

/** Find more schools matching a curriculum (and optionally a listed year), skipping ones already shown. */
export async function discoverSpeaSchools({curriculum='',year=null,exclude=[],limit=6,cursor=null}={},deps){
 const coverage={searched:[],directory:null,profilesOpened:0,matched:0,skipped:{curriculum:0,year:0,alreadyShown:0},failures:[],moreRemain:'unknown',reasons:[],nextCursor:null};
 const shown=new Set(exclude.map(u=>speaPage(u)||u));const queue=[];const push=u=>{const n=speaPage(u);if(!n)return;if(shown.has(n)){coverage.skipped.alreadyShown++;return}if(!queue.includes(n))queue.push(n)};
 for(const u of Array.isArray(cursor?.pending)?cursor.pending.slice(0,20):[])push(u);
 // 1. Directory page 1 (what the server renders).
 if(!cursor||!cursor.skipDirectory){
  const dir=await deps.fetchPage(SPEA_DIRECTORY);
  if(dir.ok){const d=parseDirectory(dir.raw);coverage.directory={listed:d.cards.length,total:d.total};coverage.searched.push({step:'directory-page-1',outcome:'read',listed:d.cards.length,total:d.total});
   for(const c of d.cards){if(curriculum&&c.curriculum&&!curriculumMatches(c.curriculum,curriculum)){coverage.skipped.curriculum++;continue}push(c.url)}
   if(d.total&&d.total>d.cards.length)coverage.reasons.push('directory-pages-not-server-rendered');
  }else{coverage.searched.push({step:'directory-page-1',outcome:dir.reason,http:dir.http??null});coverage.failures.push({path:'/en/education-institutes/schools',reason:dir.reason,http:dir.http??null})}
 }
 // 2. More profile links through site-restricted search, only if the directory didn't give enough.
 let offset=cursor?.searchOffset||0,searchMore=false;
 if(queue.length<limit*2){
  for(let i=0;i<SPEA_LIMITS.searchesPerCall&&offset<=SPEA_LIMITS.maxSearchOffset;i++){
   const term=curriculumTerm(curriculum);
   const s=await deps.search((term?term+' curriculum ':'')+'private school Sharjah',{offset});
   coverage.searched.push({step:'search',offset,status:s.status,http:s.http??null,results:s.results??0,profileLinks:s.urls.length});
   if(s.status!=='searched'){coverage.failures.push({path:'search',reason:s.status,http:s.http??null});break}
   s.urls.forEach(push);searchMore=!!s.more;offset++;
  }
 }
 // 3. Open a bounded batch of profiles; keep only what each profile states.
 const {schools,unopened}=await openProfiles(queue,deps,coverage);
 const results=[];
 for(const p of schools){
  if(shown.has(p.url)){coverage.skipped.alreadyShown++;continue}
  if(!curriculumMatches(p.fields.curriculum?.value,curriculum)){coverage.skipped.curriculum++;continue}
  if(year&&!(p.fields.grades&&listsYear(p.fields.grades.value,year))){coverage.skipped.year++;continue}
  if(results.length<limit)results.push(p);
 }
 coverage.matched=results.length;
 if(unopened.length)coverage.reasons.push('unopened-profile-links');
 if(searchMore)coverage.reasons.push('more-search-results');
 coverage.moreRemain=unopened.length||searchMore?true:coverage.reasons.length?'unknown':false;
 if(unopened.length||searchMore)coverage.nextCursor={skipDirectory:true,searchOffset:searchMore?offset:SPEA_LIMITS.maxSearchOffset+1,pending:unopened.slice(0,20)};
 return {schools:results,coverage};
}

/** Look up a school the person named. Several similar names come back as candidates, never a silent pick. */
export async function lookupSpeaSchool({name=''}={},deps){
 const coverage={searched:[],profilesOpened:0,failures:[],query:''};
 const clean=String(name).normalize('NFKC').replace(/[^\p{L}\p{N}&.' -]+/gu,' ').replace(/\s+/g,' ').trim().slice(0,SPEA_LIMITS.nameChars);
 if(nameTokens(clean).length===0)return {status:'needs-name',candidates:[],coverage};
 coverage.query=clean;
 const pool=[];const add=(u,n,from)=>{const url=speaPage(u);if(url&&!pool.some(x=>x.url===url))pool.push({url,name:n||'',from})};
 const dir=await deps.fetchPage(SPEA_DIRECTORY);
 if(dir.ok){const d=parseDirectory(dir.raw);coverage.searched.push({step:'directory-page-1',outcome:'read',listed:d.cards.length,total:d.total});for(const c of d.cards)if(nameScore(clean,c.name)>=0.5)add(c.url,c.name,'directory')}
 else{coverage.searched.push({step:'directory-page-1',outcome:dir.reason,http:dir.http??null});coverage.failures.push({path:'/en/education-institutes/schools',reason:dir.reason,http:dir.http??null})}
 const s=await deps.search('"'+clean+'" school',{offset:0});
 coverage.searched.push({step:'search',status:s.status,http:s.http??null,results:s.results??0,profileLinks:s.urls.length});
 if(s.status==='searched')s.urls.slice(0,SPEA_LIMITS.profilesPerCall).forEach(u=>add(u,'','search'));else coverage.failures.push({path:'search',reason:s.status,http:s.http??null});
 // Search titles are discarded, so a candidate's exact name comes only from opening its profile.
 const ordered=[...pool.filter(x=>x.from==='directory'),...pool.filter(x=>x.from==='search')];
 const {schools}=await openProfiles(ordered.map(x=>x.url),deps,coverage);
 // A directory card whose profile couldn't be opened still gives an exact official name and link: keep it, marked as such.
 const opened=new Set(schools.flatMap(x=>[x.url,x.requestedUrl]));
 const cardOnly=pool.filter(x=>x.from==='directory'&&!opened.has(x.url)).map(x=>({url:x.url,name:x.name,fields:{},from:'directory-card'}));
 const c=classifyMatches(clean,[...schools.map(x=>({...x,from:'profile'})),...cardOnly]);
 const checked=dir.ok||s.status==='searched';
 // Not found is only claimed when the lookup actually ran; if nothing could be checked or opened, say so instead.
 if(c.status==='not-found'&&(!checked||(pool.some(x=>x.from==='search')&&!schools.length)))return {status:'unavailable',candidates:[],coverage};
 return {status:c.status,candidates:c.candidates,coverage};
}
