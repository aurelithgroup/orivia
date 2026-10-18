/* School websites, anchored to the SPEA listing. Retrieval only: no planning or answer wording.
 * Documented in docs/school-sites.md.
 *
 * 1. SPEA establishes identity and the regulatory listing (lookupSpeaSchool). No clear SPEA match → no website is read.
 * 2. Candidate websites come from SPEA's own Website link, then one budgeted web search for the exact SPEA name.
 * 3. A domain is evidence only once it is tied to that SPEA listing:
 *      regulator-link        SPEA's profile links to it
 *      regulator-email       SPEA lists an email address at that domain (not @spea.shj.ae)
 *    A name or phone number on a page never establishes it: both can be copied.
 *    Search rank, titles or snippets never establish a domain either.
 * 4. From an established site, read a few pages and return the school's own statements (curriculum, year groups,
 *    admissions page, contacts), each with its quote and page. These describe the school only; they can't establish
 *    government or regulator requirements.
 */
import {lookupSpeaSchool,nameTokens,distinctiveTokens} from './orivia-spea-reader.mjs';
import {RESEARCH_SOURCES} from './orivia-research-policy.mjs';

export const SITE_LIMITS=Object.freeze({hostsPerLookup:3,pagesPerSite:5,pageBytes:800000,timeoutMs:6500,searchCount:10,extraLinks:4,quoteChars:240});
// Directories, social networks, news, recruiters and government hosts are never a school's own website.
const NOT_SCHOOL=/(^|\.)(linkedin\.com|facebook\.com|instagram\.com|x\.com|twitter\.com|tiktok\.com|youtube\.com|wikipedia\.org|edustoke\.com|mdares\.ai|edcare\.ae|bayut\.com|propertyfinder\.ae|gulfnews\.com|khaleejtimes\.com|thenationalnews\.com|whichschooladvisor\.com|schoolsdubai\.com|schoolscompared\.com|gccrecruitments\.com|indeed\.com|glassdoor\.com|naukrigulf\.com|bayt\.com|google\.[a-z.]+|goo\.gl|apple\.com|yelp\.com|tripadvisor\.[a-z.]+|expatexchange\.com|pravasinewsdaily\.com|wikimapia\.org)$/i;
const plain=s=>String(s||'').replace(/<!--[\s\S]*?-->/g,' ').replace(/<(script|style|svg|noscript|template)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<br\s*\/?>|<\/(p|div|li|h[1-6]|tr|section|article)>/gi,'. ').replace(/<[^>]*>/g,' ').replace(/&(?:nbsp|#160);/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&rsquo;/g,"'").replace(/&ndash;/g,'–').replace(/\s+/g,' ').replace(/(\.\s*){2,}/g,'. ').trim();

/** Host a school website could live on: https, a public name (no IPs, localhost or ports), not a directory or government host. */
export function siteHost(url){
 try{const u=new URL(String(url));
  if(u.protocol!=='https:'||u.username||u.password||u.port)return '';
  const h=u.hostname.toLowerCase();
  if(!h.includes('.')||/^\d+\.\d+\.\d+\.\d+$/.test(h)||h.includes(':')||/(^|\.)localhost$|\.local$|\.internal$/.test(h))return '';
  if(RESEARCH_SOURCES[h]||RESEARCH_SOURCES['www.'+h]||h==='u.ae'||NOT_SCHOOL.test(h)||/(^|\.)gov\.ae$|(^|\.)gov\.uk$|(^|\.)shj\.ae$|(^|\.)moe\.gov\.ae$/.test(h))return '';
  return h.replace(/^www\./,'');
 }catch(_){return ''}
}
export function candidateSiteHosts(urls,limit=SITE_LIMITS.hostsPerLookup){const out=[];for(const u of urls){const h=siteHost(u);if(h&&!out.includes(h))out.push(h);if(out.length>=limit)break}return out}
const sameSite=(url,host)=>{try{const u=new URL(url);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&u.hostname.toLowerCase().replace(/^www\./,'')===host}catch(_){return false}};
/** UAE numbers in one canonical form: 06 506 2999, +971 6 506 2999 and 00971-6-5062999 all become 97165062999. */
export function phoneKey(p){let d=String(p||'').replace(/\D/g,'');if(d.startsWith('00'))d=d.slice(2);if(d.startsWith('971'))return d;if(d.startsWith('0'))return '971'+d.slice(1);return d.length>=7?d:''}
function phonesIn(raw){
 const text=plain(raw),found=[];
 for(const m of String(raw).matchAll(/href=["']tel:([^"']{6,30})["']/gi))found.push({key:phoneKey(decodeURIComponent(m[1])),quote:decodeURIComponent(m[1]).trim()});
 for(const m of text.matchAll(/(?:\+|00)?\d[\d ()\-]{6,18}\d/g))found.push({key:phoneKey(m[0]),quote:m[0].trim()});
 return found.filter(x=>x.key.length>=10);
}
// Does the page name this school? Every distinctive word of the SPEA name must appear ("Wes green" ↔ "Wesgreen" too);
// a name made only of common words must appear in full, in order.
export function nameOnPage(name,raw){
 const page=nameTokens(plain(raw).slice(0,20000)),joined=page.join('');
 const d=distinctiveTokens(name);
 if(d.length)return d.every(t=>page.includes(t))||joined.includes(d.join(''));
 const all=nameTokens(name).join(' ');return all.length>0&&(' '+page.join(' ')+' ').includes(' '+all+' ');
}

/** Is this host the school's own site? Only regulator evidence proves it: a name and phone number on a page can both be
 * copied, so they never establish ownership. Anything else is at most "found" (ownership not confirmed). */
export function establishDomain({school,host}){
 const f=school?.fields||{},evidence=[],reasons=[];
 if(f.website&&siteHost(f.website.url)===host){evidence.push({kind:'regulator-link',quote:f.website.quote,sourceUrl:school.url,value:f.website.url});return {status:'established',basis:'regulator-link',evidence,reasons}}
 reasons.push(f.website?'regulator-links-a-different-site':'no-regulator-website-link');
 const mailDomain=String(f.email?.value||'').split('@')[1]?.toLowerCase()||'';
 if(mailDomain&&mailDomain!=='spea.shj.ae'&&(mailDomain===host||mailDomain.endsWith('.'+host))){evidence.push({kind:'regulator-email',quote:f.email.quote,sourceUrl:school.url,value:f.email.value});return {status:'established',basis:'regulator-email',evidence,reasons}}
 reasons.push('no-regulator-email-at-domain');
 return {status:'unverified',basis:null,evidence:[],reasons};
}

/** Same-site pages worth reading: admissions, curriculum, contact, about, fees. Paths only (no query strings). */
export function sitePageLinks(raw,baseUrl,host,limit=SITE_LIMITS.extraLinks){
 const out=[];
 for(const m of String(raw).matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
  let u;try{u=new URL(m[1].replace(/&amp;/g,'&'),baseUrl)}catch(_){continue}
  if(!sameSite(u.href,host))continue;u.search='';u.hash='';
  const label=plain(m[2]);if(!/admission|enrol|curricul|academic|contact|about|fees|tuition/i.test(u.pathname+' '+label))continue;
  if(/\.(pdf|jpe?g|png|gif|docx?|xlsx?|zip)$/i.test(u.pathname))continue;
  if(!out.includes(u.href)&&u.href!==baseUrl)out.push(u.href);if(out.length>=limit)break;
 }
 return out;
}
/* ---------- Reading a page by section ----------
 * Menus, headers, footers, breadcrumbs, cookie banners and "related / other schools" blocks are not statements about this
 * organisation. The page is split into sections by heading; facts carry the section they came from. */
const NAV_CLASS=/\b(nav|menu|mega|breadcrumb|footer|header|cookie|related|other-schools|sidebar|social|share|search)\b/i;
const OTHER_ORGS=/^(related|other|similar|nearby|more)\b.*\b(schools?|organisations?|nurseries|branches|campuses)\b|^view all|you (?:may|might) also like/i;
export function pageSections(raw){
 let h=String(raw||'').replace(/<!--[\s\S]*?-->/g,' ').replace(/<(script|style|svg|noscript|template|nav|header|footer|aside|form|button)\b[^>]*>[\s\S]*?<\/\1>/gi,' ');
 // Containers whose class/id says navigation or related content are removed with their contents (innermost first).
 for(let i=0;i<6;i++){const before=h;h=h.replace(/<(div|section|ul|ol)\b([^>]*\b(?:class|id)=["'][^"']*["'][^>]*)>((?:(?!<\1\b)[\s\S])*?)<\/\1>/gi,(m,tag,attrs)=>NAV_CLASS.test((attrs.match(/\b(?:class|id)=["']([^"']*)["']/gi)||[]).join(' '))?' ':m);if(h===before)break}
 // A list item that is only a link is a menu entry, not a statement.
 h=h.replace(/<li\b[^>]*>\s*<a\b[^>]*>[\s\S]*?<\/a>\s*<\/li>/gi,' ');
 const parts=h.split(/(?=<h[1-4]\b)/i),sections=[];
 for(const part of parts){
  const heading=plain((part.match(/^<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i)||[])[1]||'');
  const body=part.replace(/^<h[1-4][^>]*>[\s\S]*?<\/h[1-4]>/i,'');
  // Labelled fields: <dt>Label</dt><dd>Value</dd>, "Label: Value" spans/rows.
  const fields=[];
  for(const m of body.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi))fields.push({label:plain(m[1]),value:plain(m[2])});
  for(const m of body.matchAll(/<(?:span|p|li|td|div)[^>]*>\s*([A-Z][A-Za-z ()']{2,30}):\s*([^<]{2,120})<\/(?:span|p|li|td|div)>/g))fields.push({label:plain(m[1]),value:plain(m[2])});
  const text=plain(body);
  if(!heading&&!text)continue;
  sections.push({heading,text,fields,kind:OTHER_ORGS.test(heading)?'other-organisations':'main'});
 }
 return sections;
}
const CURRICULUM_SIGNS=[
 ['British',/\b(British (?:National )?curriculum|National Curriculum (?:for|of|in) England|English National Curriculum|IGCSEs?|A[ -]Levels?|Cambridge (?:Primary|Lower Secondary|IGCSE|International|Secondary)|Early Years Foundation Stage)\b/i],
 ['MoE (UAE Ministry of Education)',/\b(Ministry of Education curriculum|MoE curriculum|UAE national curriculum)\b/i],
 ['American',/\b(American curriculum|US curriculum|Common Core)\b/i],
 ['IB',/\b(International Baccalaureate|IB (?:Diploma|PYP|MYP|Primary Years|Middle Years|curriculum))\b/i],
 ['Indian',/\b(CBSE|ICSE|Indian curriculum)\b/i]
];
const curriculumOf=t=>CURRICULUM_SIGNS.filter(([,re])=>re.test(t)).map(([l])=>l);
// "Year" (British) and "Grade" (US/MoE) are different scales: never converted into each other.
const YEAR_RANGE=/\b((?:FS ?[12]|KG ?[12]|Pre-?KG|Foundation Stage(?: ?[12])?|Year \d{1,2}|Grades? \d{1,2}))\s*(?:to|-|–|through|until)\s*((?:Year|Grade) ?\d{1,2}|\d{1,2}|KG ?2|FS ?2)\b/gi;
const general=x=>/\b(all|every|other) (?:private )?schools\b|\bschools in (?:the )?(?:UAE|Sharjah|emirate)\b|\b(?:must|are required to|is required|mandatory|by law|regulations?)\b/i.test(x);
/** The organisation's own statements from pages on its site. Each fact names its page, section and quote. */
export function readSiteFacts(pages,host){
 const facts=[],seen=new Set();
 const add=(key,label,value,quote,url,section)=>{const k=key+'|'+value;if(seen.has(k))return;seen.add(k);facts.push({key,label,value,quote:String(quote).slice(0,SITE_LIMITS.quoteChars),source:{url,host,section:section||'',kind:'school-website',scope:'school-own-statement'}})};
 for(const p of pages){
  for(const sec of pageSections(p.raw)){
   if(sec.kind!=='main')continue;
   for(const f of sec.fields){
    if(/^curricul/i.test(f.label))for(const c of curriculumOf(f.value.replace(/^british curriculum$/i,'British curriculum')))add('curriculum','Curriculum (school’s own statement)',c,f.label+': '+f.value,p.url,sec.heading);
    if(/^(grades?|year groups?|years?|phases?)$/i.test(f.label))for(const m of (f.value).matchAll(YEAR_RANGE))add('year-groups','Year groups (school’s own statement)',m[1]+' to '+m[2],f.label+': '+f.value,p.url,sec.heading);
   }
   // Sentences only: a short label ("British Curriculum") is a menu or tag, not a statement.
   const sentences=sec.text.split(/(?<=[.!?])\s+/).filter(x=>x.split(/\s+/).length>=6&&x.length<=600&&!general(x));
   for(const x of sentences){for(const c of curriculumOf(x))add('curriculum','Curriculum (school’s own statement)',c,x.length<=SITE_LIMITS.quoteChars?x:x.match(CURRICULUM_SIGNS.find(([l])=>l===c)[1])[0],p.url,sec.heading);
    for(const m of x.matchAll(YEAR_RANGE))add('year-groups','Year groups (school’s own statement)',m[1]+' to '+m[2],m[0],p.url,sec.heading)}
  }
  for(const m of String(p.raw).matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
   const href=m[1].replace(/&amp;/g,'&'),label=plain(m[2]);
   if(/^tel:/i.test(href)){const v=decodeURIComponent(href.slice(4)).trim();if(phoneKey(v).length>=10&&label)add('phone','Phone (school website)',v,label,p.url,'');continue}
   if(/^mailto:/i.test(href)){const v=decodeURIComponent(href.slice(7)).split('?')[0].trim().toLowerCase();const dom=v.split('@')[1]||'';if(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(v)&&(dom===host||dom.endsWith('.'+host))&&label)add('email','Email (school website)',v,label,p.url,'');continue}
   let u;try{u=new URL(href,p.url)}catch(_){continue}
   if(sameSite(u.href,host)&&/admission|enrol/i.test(u.pathname+' '+label)&&label){u.search='';u.hash='';add('admissions-page','Admissions page',u.href,label,p.url,'')}
  }
 }
 return facts;
}
/** Does a year-groups statement cover this British school year? Grade ranges are reported, never converted. */
export function yearEvidence(facts,year){
 const toNum=t=>{t=String(t).trim();if(/^(FS|KG|Pre-?KG|Foundation)/i.test(t))return 0;const m=t.match(/(\d{1,2})/);return m?+m[1]:null};
 const out={listed:[],gradeOnly:[]};
 for(const f of facts.filter(x=>x.key==='year-groups')){
  const [a,b]=f.value.split(' to ');const lo=toNum(a),hi=toNum(b);if(lo==null||hi==null)continue;
  const usesGrade=/grade/i.test(f.value)&&!/year/i.test(f.value);
  if(usesGrade){out.gradeOnly.push(f);continue}
  if(/year/i.test(f.value)&&year>=lo&&year<=hi)out.listed.push(f);
 }
 return out;
}

/* ---------- Network dependencies: bounded, budgeted ---------- */
async function readBounded(r,max){
 if(Number(r.headers.get('content-length')||0)>max)throw Error('too-large');
 const reader=r.body?.getReader?.();if(!reader)throw Error('no-stream');let size=0;const chunks=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max)throw Error('too-large');chunks.push(value)}}catch(e){await reader.cancel().catch(()=>{});throw e}
 const out=new Uint8Array(size);let o=0;for(const c of chunks){out.set(c,o);o+=c.length}return new TextDecoder().decode(out);
}
export function siteDeps({env={},fetcher=fetch,reserve}={}){
 const get=url=>fetcher(url,{redirect:'manual',signal:AbortSignal.timeout(SITE_LIMITS.timeoutMs),headers:{Accept:'text/html','User-Agent':'OriviaSourceReader/0.2'}});
 const fetchSitePage=async(url,host)=>{
  if(!sameSite(url,host)||!siteHost(url))return {ok:false,reason:'not-this-site'};
  try{
   let r=await get(url),final=url;
   if(r.status>=300&&r.status<400){ // one hop, and only within the same site (e.g. apex → www, http-less path changes)
    const to=(()=>{try{return new URL(r.headers.get('location')||'',url).href}catch(_){return ''}})();await r.body?.cancel?.();
    if(!to||!sameSite(to,host))return {ok:false,reason:'redirected-off-site',http:r.status};
    r=await get(to);final=to;if(r.status>=300&&r.status<400){await r.body?.cancel?.();return {ok:false,reason:'too-many-redirects',http:r.status}}
   }
   if(!r.ok){await r.body?.cancel?.();return {ok:false,reason:r.status===404?'page-not-found':'page-not-available',http:r.status}}
   if(!/text\/html/i.test(r.headers.get('content-type')||'')){await r.body?.cancel?.();return {ok:false,reason:'unsupported-content',http:r.status}}
   let raw;try{raw=await readBounded(r,SITE_LIMITS.pageBytes)}catch(e){return {ok:false,reason:e?.message==='too-large'?'page-too-large':'page-not-available',http:r.status}}
   if(/verify (?:you are|you're) human|enable javascript and cookies|access denied|checking your browser/i.test(plain(raw).slice(0,1200)))return {ok:false,reason:'page-blocked',http:r.status};
   return {ok:true,raw,url:final,http:r.status};
  }catch(e){return {ok:false,reason:e?.name==='TimeoutError'?'page-timeout':'page-not-available'}}
 };
 const searchWeb=async query=>{
  if(!env.BRAVE_SEARCH_API_KEY)return {status:'not-configured',urls:[]};
  if(typeof reserve!=='function'||!(await reserve(env)))return {status:'search-limit',urls:[]};
  const u=new URL('https://api.search.brave.com/res/v1/web/search');
  u.search=new URLSearchParams({q:query,count:String(SITE_LIMITS.searchCount),safesearch:'strict',country:'ALL',search_lang:'en',spellcheck:'false'}).toString();
  try{const r=await fetcher(u.href,{redirect:'manual',signal:AbortSignal.timeout(SITE_LIMITS.timeoutMs),headers:{Accept:'application/json','X-Subscription-Token':env.BRAVE_SEARCH_API_KEY}});
   if(!r.ok){await r.body?.cancel?.();return {status:'search-unavailable',http:r.status,urls:[]}}
   const d=JSON.parse(await readBounded(r,300000));const results=Array.isArray(d?.web?.results)?d.web.results:[];
   return {status:'searched',http:r.status,results:results.length,urls:results.map(x=>x?.url).filter(x=>typeof x==='string')}; // titles/snippets discarded
  }catch(_){return {status:'search-unavailable',urls:[]}}
 };
 return {fetchSitePage,searchWeb};
}

/** Named school: SPEA identity first, then its own website if (and only if) the domain is established. */
export async function lookupSchoolWithSite({name=''}={},{spea,site}){
 const identity=await lookupSpeaSchool({name},spea);
 const coverage={spea:identity.coverage,site:{searched:[],hostsConsidered:[],pagesOpened:0,failures:[]}};
 if(identity.status!=='match'){coverage.site.skipped='identity-not-established';return {status:identity.status,candidates:identity.candidates,school:null,site:null,coverage}}
 const school=identity.candidates[0];
 const hosts=[];const addHost=(h,from)=>{if(h&&!hosts.some(x=>x.host===h))hosts.push({host:h,from})};
 if(school.fields?.website)addHost(siteHost(school.fields.website.url),'spea-website-link');
 const mail=String(school.fields?.email?.value||'').split('@')[1]||'';if(mail&&mail!=='spea.shj.ae')addHost(siteHost('https://'+mail+'/'),'spea-email-domain');
 if(!hosts.length||!school.fields?.website){
  // Search for the exact SPEA name (sanitised). Results only nominate hosts; they never prove one.
  const q='"'+school.name.replace(/[^\p{L}\p{N}&.' -]+/gu,' ').replace(/\s+/g,' ').trim().slice(0,90)+'" Sharjah school';
  const s=await site.searchWeb(q);coverage.site.searched.push({step:'web-search',status:s.status,http:s.http??null,results:s.results??0});
  if(s.status==='searched')candidateSiteHosts(s.urls,SITE_LIMITS.hostsPerLookup+2).forEach(h=>addHost(h,'web-search'));else coverage.site.failures.push({path:'search',reason:s.status,http:s.http??null});
 }
 let established=null,pages=[];
 for(const {host,from} of hosts.slice(0,SITE_LIMITS.hostsPerLookup)){
  const home=school.fields?.website&&siteHost(school.fields.website.url)===host?school.fields.website.url:'https://'+host+'/';
  const got=await site.fetchSitePage(home,host);coverage.site.pagesOpened++;
  const seenPages=[];
  if(got.ok)seenPages.push({url:got.url,raw:got.raw});else coverage.site.failures.push({host,path:new URL(home).pathname,reason:got.reason,http:got.http??null});
  let check=establishDomain({school,host});
  coverage.site.hostsConsidered.push({host,from,status:check.status,basis:check.basis,reasons:check.reasons});
  if(check.status==='established'){established={host,...check};pages=seenPages;break}
 }
 if(!established)return {status:'match',candidates:identity.candidates,school,site:{status:hosts.length?'unverified':'none-found',host:null,facts:[]},coverage};
 // Read a few more pages on the established site.
 const more=pages.length?sitePageLinks(pages[0].raw,pages[0].url,established.host).filter(u=>!pages.some(p=>p.url===u)):[];
 for(const u of more.slice(0,Math.max(0,SITE_LIMITS.pagesPerSite-pages.length))){const g=await site.fetchSitePage(u,established.host);coverage.site.pagesOpened++;if(g.ok)pages.push({url:g.url,raw:g.raw});else coverage.site.failures.push({host:established.host,path:new URL(u).pathname,reason:g.reason,http:g.http??null})}
 const facts=readSiteFacts(pages,established.host);
 // Both sources are kept side by side; a difference is flagged, never resolved here.
 const speaCurr=school.fields?.curriculum?.value||'';const siteCurr=[...new Set(facts.filter(f=>f.key==='curriculum').map(f=>f.value))];
 const differences=speaCurr&&siteCurr.length&&!siteCurr.some(v=>v.toLowerCase().startsWith(speaCurr.toLowerCase().split(/[ (]/)[0]))?[{field:'curriculum',spea:speaCurr,site:siteCurr}]:[];
 return {status:'match',candidates:identity.candidates,school,site:{status:'established',host:established.host,basis:established.basis,evidence:established.evidence,facts,pagesRead:pages.map(p=>p.url),differences},coverage};
}
