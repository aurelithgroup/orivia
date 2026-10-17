/* School websites, anchored to the SPEA listing. Retrieval only: no planning or answer wording.
 * Documented in docs/school-sites.md.
 *
 * 1. SPEA establishes identity and the regulatory listing (lookupSpeaSchool). No clear SPEA match → no website is read.
 * 2. Candidate websites come from SPEA's own Website link, then one budgeted web search for the exact SPEA name.
 * 3. A domain is evidence only once it is tied to that SPEA listing:
 *      regulator-link        SPEA's profile links to it
 *      regulator-email       SPEA lists an email address at that domain (not @spea.shj.ae)
 *      contact-match         the site shows the phone number SPEA lists, and the SPEA name
 *    Search rank, titles, snippets or a similar name never establish a domain.
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

/** Is this host the school's own site? Pure: uses the SPEA identity and the pages already fetched from that host. */
export function establishDomain({school,host,pages=[]}){
 const f=school?.fields||{},evidence=[],reasons=[];
 if(f.website&&siteHost(f.website.url)===host){evidence.push({kind:'regulator-link',quote:f.website.quote,sourceUrl:school.url,value:f.website.url});return {status:'established',basis:'regulator-link',evidence,reasons}}
 reasons.push(f.website?'regulator-links-a-different-site':'no-regulator-website-link');
 const mailDomain=String(f.email?.value||'').split('@')[1]?.toLowerCase()||'';
 if(mailDomain&&mailDomain!=='spea.shj.ae'&&(mailDomain===host||mailDomain.endsWith('.'+host))){evidence.push({kind:'regulator-email',quote:f.email.quote,sourceUrl:school.url,value:f.email.value});return {status:'established',basis:'regulator-email',evidence,reasons}}
 reasons.push('no-regulator-email-at-domain');
 const want=phoneKey(f.phone?.value);
 if(!want){reasons.push('no-regulator-phone-to-compare');return {status:'unverified',basis:null,evidence:[],reasons}}
 for(const p of pages){
  const hit=phonesIn(p.raw).find(x=>x.key===want);if(!hit)continue;
  const titled=nameOnPage(school.name,p.raw);
  if(!titled){reasons.push('phone-matches-but-name-does-not');continue}
  evidence.push({kind:'contact-match',quote:hit.quote,sourceUrl:p.url,value:hit.quote},{kind:'regulator-phone',quote:f.phone.quote,sourceUrl:school.url,value:f.phone.value});
  return {status:'established',basis:'contact-match',evidence,reasons};
 }
 reasons.push('no-matching-contact-on-site');
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
const CURRICULUM_SIGNS=[
 ['British',/\b(British curriculum|National Curriculum (?:for|of|in) England|English National Curriculum|IGCSEs?|A[ -]Levels?|Cambridge (?:Primary|Lower Secondary|IGCSE|International))\b/i],
 ['MoE (UAE Ministry of Education)',/\b(Ministry of Education|MoE curriculum|UAE national curriculum)\b/i],
 ['American',/\b(American curriculum|US curriculum|Common Core)\b/i],
 ['IB',/\b(International Baccalaureate|IB (?:Diploma|PYP|MYP|Primary Years|Middle Years))\b/],
 ['Indian',/\b(CBSE|ICSE)\b/]
];
const YEAR_RANGE=/\b((?:FS ?[12]|KG ?[12]|Pre-?KG|Foundation Stage(?: ?[12])?|Year \d{1,2}|Grade \d{1,2}))\s*(?:to|-|–|through|until)\s*((?:Year|Grade) ?\d{1,2}|KG ?2|FS ?2)\b/gi;
/** The school's own statements from pages on its established site. Each fact names the exact page and quote. */
export function readSiteFacts(pages,host){
 const facts=[],seen=new Set();
 const add=(key,label,value,quote,url)=>{const k=key+'|'+value;if(seen.has(k))return;seen.add(k);facts.push({key,label,value,quote:quote.slice(0,SITE_LIMITS.quoteChars),source:{url,host,kind:'school-website',scope:'school-own-statement'}})};
 for(const p of pages){
  const text=plain(p.raw);const sentences=text.split(/(?<=[.!?])\s+/).filter(s=>s.length>=12&&s.length<=600);
  // A sentence about rules for all schools ("all schools in the UAE must…") is not the school describing itself.
  const general=x=>/\b(all|every|other) (?:private )?schools\b|\bschools in (?:the )?(?:UAE|Sharjah|emirate)\b|\b(?:must|are required to|is required|mandatory|by law|regulations?)\b/i.test(x);
  for(const s of sentences.filter(x=>!general(x)))for(const [label,re] of CURRICULUM_SIGNS){const m=s.match(re);if(m)add('curriculum','Curriculum (school’s own statement)',label,s.length<=SITE_LIMITS.quoteChars?s:m[0],p.url)}
  for(const m of text.matchAll(YEAR_RANGE))add('year-groups','Year groups (school’s own statement)',m[1]+' to '+m[2],m[0],p.url);
  for(const m of String(p.raw).matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
   const href=m[1].replace(/&amp;/g,'&'),label=plain(m[2]);
   if(/^tel:/i.test(href)){const v=decodeURIComponent(href.slice(4)).trim();if(phoneKey(v).length>=10&&label)add('phone','Phone (school website)',v,label,p.url);continue}
   if(/^mailto:/i.test(href)){const v=decodeURIComponent(href.slice(7)).split('?')[0].trim().toLowerCase();const dom=v.split('@')[1]||'';if(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(v)&&(dom===host||dom.endsWith('.'+host))&&label)add('email','Email (school website)',v,label,p.url);continue}
   let u;try{u=new URL(href,p.url)}catch(_){continue}
   if(sameSite(u.href,host)&&/admission|enrol/i.test(u.pathname+' '+label)&&label){u.search='';u.hash='';add('admissions-page','Admissions page',u.href,label,p.url)}
  }
 }
 return facts;
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
  let check=establishDomain({school,host,pages:seenPages});
  if(check.status!=='established'&&got.ok&&check.reasons.includes('no-matching-contact-on-site')){
   const contact=sitePageLinks(got.raw,got.url,host,8).find(u=>/contact/i.test(u));
   if(contact){const c=await site.fetchSitePage(contact,host);coverage.site.pagesOpened++;if(c.ok){seenPages.push({url:c.url,raw:c.raw});check=establishDomain({school,host,pages:seenPages})}else coverage.site.failures.push({host,path:new URL(contact).pathname,reason:c.reason,http:c.http??null})}
  }
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
