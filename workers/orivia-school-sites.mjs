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

/** Same-site pages worth reading, RANKED by what the current request needs, then capped.
 * purpose: 'overview' (curriculum, year groups, admissions, contact), 'contacts', 'curriculum', 'admissions'.
 * The best link for each need is taken first (so a cap of 3 gives curriculum + admissions + contact, not three "About" pages).
 * Leadership messages, "why choose us", news, galleries and careers pages are ranked last. Paths only, no files. */
const LINK_NEEDS={
 curriculum:/curricul|academic|programme|program\b|learning|key-?stage|\bks[1-5]\b|primary|secondary|sixth-?form|eyfs|foundation|igcse|a-?level|year-?groups?|phases?|grades?/i,
 admissions:/admission|enrol|enroll|apply|application|registration|fees|tuition|join/i,
 contact:/contact|enquir|reach-us|location|find-us|get-in-touch/i
};
const LINK_LOW=/chairman|chairperson|founder|principal|director|head-?teacher|headmaster|message|welcome|why-?choose|vision|mission|values|history|news|events?|gallery|photos|blog|careers?|jobs|vacanc|alumni|calendar|policy|privacy|terms|sitemap|login|portal|tour/i;
const PURPOSE_NEEDS={overview:['curriculum','admissions','contact'],contacts:['contact','admissions'],curriculum:['curriculum'],admissions:['admissions','contact']};
export function sitePageLinks(raw,baseUrl,host,limit=SITE_LIMITS.extraLinks,purpose='overview'){
 const needs=PURPOSE_NEEDS[purpose]||PURPOSE_NEEDS.overview,cands=new Map();
 for(const m of String(raw).matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
  let u;try{u=new URL(m[1].replace(/&amp;/g,'&'),baseUrl)}catch(_){continue}
  if(!sameSite(u.href,host))continue;u.search='';u.hash='';
  if(/\.(pdf|jpe?g|png|gif|webp|docx?|xlsx?|zip|mp4)$/i.test(u.pathname)||u.href===baseUrl||u.pathname==='/')continue;
  const key=u.pathname+' '+plain(m[2]);const prev=cands.get(u.href);cands.set(u.href,prev?prev+' '+key:key);
 }
 const scored=[...cands.entries()].map(([url,text])=>{
  const hits=needs.filter(n=>LINK_NEEDS[n].test(text));
  const low=LINK_LOW.test(text)&&!hits.length;
  return {url,hits,score:(hits.length?10-needs.indexOf(hits[0]):0)-(LINK_LOW.test(text)?5:0)-(new URL(url).pathname.split('/').length>4?1:0),low};
 }).filter(x=>x.hits.length).sort((a,b)=>b.score-a.score);
 const out=[];
 for(const n of needs){const best=scored.find(x=>x.hits.includes(n)&&!out.includes(x.url));if(best)out.push(best.url)} // one per need first
 for(const x of scored)if(!out.includes(x.url))out.push(x.url);
 return out.slice(0,limit);
}

/* ---------- Reading a page by section ----------
 * Menus, headers, footers, breadcrumbs, cookie banners and "related / other schools" blocks are not statements about this
 * organisation. The page is split into sections by heading; facts carry the section they came from. Labelled fields come
 * from definition lists, table rows and adjacent label/value elements. */
const NAV_CLASS=/\b(nav|navbar|menu|mega|breadcrumbs?|footer|header|cookie|related|other-schools|sidebar|social|share|search)\b/i;
const OTHER_ORGS=/^(related|other|similar|nearby|more)\b.*\b(schools?|organisations?|nurseries|branches|campuses)\b|^view all|you (?:may|might) also like/i;
const FIELD_LABEL=/^(curricul(?:um|a)(?: offered| followed)?|our curriculum|board|syllabus|year groups?|years?(?: offered)?|grades?(?: offered)?|grade levels?|classes|phases?|key stages?|age range|ages?)$/i;
export function pageSections(raw){
 let h=String(raw||'').replace(/<!--[\s\S]*?-->/g,' ').replace(/<(script|style|svg|noscript|template|nav|header|footer|aside|form|button)\b[^>]*>[\s\S]*?<\/\1>/gi,' ');
 for(let i=0;i<6;i++){const before=h;h=h.replace(/<(div|section|ul|ol)\b([^>]*\b(?:class|id)=["'][^"']*["'][^>]*)>((?:(?!<\1\b)[\s\S])*?)<\/\1>/gi,(m,tag,attrs)=>NAV_CLASS.test((attrs.match(/\b(?:class|id)=["']([^"']*)["']/gi)||[]).join(' '))?' ':m);if(h===before)break}
 h=h.replace(/<li\b[^>]*>\s*<a\b[^>]*>[\s\S]*?<\/a>\s*<\/li>/gi,' '); // a list item that is only a link is a menu entry
 const parts=h.split(/(?=<h[1-4]\b)/i),sections=[];
 for(const part of parts){
  const heading=plain((part.match(/^<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i)||[])[1]||'');
  const body=part.replace(/^<h[1-4][^>]*>[\s\S]*?<\/h[1-4]>/i,'');
  const fields=[],rows=[];
  for(const m of body.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi))fields.push({label:plain(m[1]).replace(/:$/,''),value:plain(m[2])});
  for(const m of body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
   const cells=[...m[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)].map(c=>plain(c[1])).filter(Boolean);
   if(!cells.length)continue;
   if(!/<td\b/i.test(m[1])&&cells.length>1)continue; // a header row ("Phase | Year group | Age") is not data
   rows.push(cells);
   if(cells.length>=2&&FIELD_LABEL.test(cells[0].replace(/:$/,'')))fields.push({label:cells[0].replace(/:$/,''),value:cells.slice(1).join(' | ')});
  }
  // Adjacent label/value elements: <div class="label">Curriculum</div><div class="value">British</div>
  for(const m of body.matchAll(/<(\w+)\b[^>]*>\s*([A-Za-z][A-Za-z ]{1,30}?)\s*:?\s*<\/\1>\s*<(\w+)\b[^>]*>([\s\S]{1,240}?)<\/\3>/g))if(FIELD_LABEL.test(m[2].trim())&&!/^(caption|th|tr|table|thead|tbody)$/i.test(m[1])&&!/^(tr|table|thead|tbody)$/i.test(m[3]))fields.push({label:m[2].trim(),value:plain(m[4])});
  for(const m of body.matchAll(/<(?:span|p|li|td|div|strong)[^>]*>\s*([A-Z][A-Za-z ()']{2,30}):\s*([^<]{2,160})<\/(?:span|p|li|td|div|strong)>/g))fields.push({label:plain(m[1]),value:plain(m[2])});
  const caption=plain((body.match(/<caption[^>]*>([\s\S]*?)<\/caption>/i)||[])[1]||'');
  const text=plain(body);
  if(!heading&&!text)continue;
  sections.push({heading:heading||caption,caption:heading&&caption?caption:'',text,fields,rows,kind:OTHER_ORGS.test(heading)?'other-organisations':'main'});
 }
 return sections;
}
// Whole-school curriculum: only an explicit statement or a labelled value. Qualifications and stages (IGCSE, A Level,
// EYFS, Cambridge Primary) are recorded as programmes, never as the school's curriculum on their own.
const CURRICULUM_VALUE=[
 ['British',/\b(British|UK|English National|National Curriculum (?:for|of|in) England|England)\b/i],
 ['MoE (UAE Ministry of Education)',/\b(MoE|Ministry of Education|UAE National|Emirati)\b/i],
 ['American',/\b(American|US|Common Core)\b/i],
 ['IB',/\b(IB|International Baccalaureate)\b/i],
 ['Indian',/\b(CBSE|ICSE|Indian)\b/i],
 ['French',/\bFrench\b/i],['Australian',/\bAustralian\b/i],['SABIS',/\bSABIS\b/i]
];
const CURRICULUM_SENTENCE=[
 ['British',/\b(British (?:National )?curriculum|National Curriculum (?:for|of|in) England|English National Curriculum|UK curriculum)\b/i],
 ['MoE (UAE Ministry of Education)',/\b(Ministry of Education curriculum|MoE curriculum|UAE national curriculum)\b/i],
 ['American',/\b(American curriculum|US curriculum|Common Core State Standards)\b/i],
 ['IB',/\b(International Baccalaureate (?:curriculum|programme|continuum|Diploma Programme)|IB (?:curriculum|continuum|World School))\b/i],
 ['Indian',/\b(CBSE curriculum|ICSE curriculum|Indian curriculum)\b/i]
];
const PROGRAMMES=[['IGCSE',/\bI?GCSEs?\b/],['A Level',/\b(?:AS and )?A[ -]Levels?\b/i],['EYFS',/\bEarly Years Foundation Stage\b|\bEYFS\b/],['Cambridge Primary',/\bCambridge Primary\b/i],['Cambridge Lower Secondary',/\bCambridge (?:Lower )?Secondary(?: 1)?\b/i],['BTEC',/\bBTEC\b/]];
const curriculumValues=v=>CURRICULUM_VALUE.filter(([,re])=>re.test(v)).map(([l])=>l);
/* Year groups. "Year" (British scale) and "Grade" (US/MoE scale) are never converted into each other. */
const YT='(?:FS ?[12]|F[12]|KG ?[12]|Pre-?KG|Nursery|Reception|Foundation(?: Stage)?(?: ?[12])?|(?:Years?|Yrs?|Y) ?\\d{1,2}|(?:Grades?|Gr) ?\\d{1,2})';
const YEAR_RANGE=new RegExp('\\b('+YT+')\\s*(?:to|-|–|—|through|until)\\s*((?:(?:Years?|Yrs?|Y|Grades?|Gr) ?)?\\d{1,2}|KG ?2|FS ?2|F2|Reception)\\b','gi');
const YEAR_SINGLE=new RegExp('^\\s*('+YT+')\\s*$','i');
function normYear(t){const s=String(t).trim();let m;
 if((m=s.match(/^(?:Years?|Yrs?|Y) ?(\d{1,2})$/i)))return 'Year '+(+m[1]);
 if((m=s.match(/^(?:Grades?|Gr) ?(\d{1,2})$/i)))return 'Grade '+(+m[1]);
 if((m=s.match(/^(?:FS|F) ?([12])$/i)))return 'FS'+m[1];
 if((m=s.match(/^KG ?([12])$/i)))return 'KG'+m[1];
 return s.replace(/\s+/g,' ');}
function rangeValue(a,b){const A=normYear(a);let B=String(b).trim();
 if(/^\d{1,2}$/.test(B))B=(/^Grade/.test(A)?'Grade ':'Year ')+(+B);else B=normYear(B); // "Years 1-6" → Year 1 to Year 6
 return A+' to '+B;}
const general=x=>/\b(all|every|other) (?:private )?schools\b|\bschools in (?:the )?(?:UAE|Sharjah|emirate)\b|\b(?:must|are required to|is required|mandatory|by law|regulations?)\b/i.test(x);
/** The organisation's own statements from pages on its site. Each fact names its page, section and quote. */
export function readSiteFacts(pages,host){
 const facts=[],seen=new Set();
 const add=(key,label,value,quote,url,section)=>{const k=key+'|'+value;if(seen.has(k))return;seen.add(k);facts.push({key,label,value,quote:String(quote).slice(0,SITE_LIMITS.quoteChars),source:{url,host,section:section||'',kind:'school-website',scope:'school-own-statement'}})};
 const yearFacts=(text,quote,url,section)=>{for(const m of String(text).matchAll(YEAR_RANGE))add('year-groups','Year groups (school’s own statement)',rangeValue(m[1],m[2]),quote||m[0],url,section)};
 for(const p of pages){
  for(const sec of pageSections(p.raw)){
   if(sec.kind!=='main')continue;
   for(const f of sec.fields){
    if(/^(curricul|our curriculum|board|syllabus)/i.test(f.label))for(const c of curriculumValues(f.value))add('curriculum','Curriculum (school’s own statement)',c,f.label+': '+f.value,p.url,sec.heading);
    if(/^(year|grade|classes|phase|key stage)/i.test(f.label)){yearFacts(f.value,f.label+': '+f.value,p.url,sec.heading);const one=f.value.match(YEAR_SINGLE);if(one)add('year-groups','Year groups (school’s own statement)',normYear(one[1]),f.label+': '+f.value,p.url,sec.heading)}
   }
   // Compact year-group tables: rows whose first cell is a single year/grade ("Year 6 | Ages 10–11"), or a phase row with a range.
   const listed=[],tableSection=sec.caption?sec.heading+' › '+sec.caption:sec.heading;
   for(const cells of sec.rows){
    if(cells.length>=2&&FIELD_LABEL.test(cells[0].replace(/:$/,'')))continue; // already read as a labelled field
    for(const c of cells){const one=c.match(YEAR_SINGLE);if(one)listed.push({v:normYear(one[1]),q:cells.join(' | ')});else yearFacts(c,cells.join(' | '),p.url,tableSection)}
   }
   for(const x of listed)add('year-groups','Year groups (school’s own statement)',x.v,x.q,p.url,tableSection);
   // Sentences only: a short label ("British Curriculum") is a menu or tag, not a statement.
   const sentences=sec.text.split(/(?<=[.!?])\s+/).filter(x=>x.split(/\s+/).length>=6&&x.length<=600&&!general(x));
   for(const x of sentences){
    for(const [label,re] of CURRICULUM_SENTENCE){const m=x.match(re);if(m)add('curriculum','Curriculum (school’s own statement)',label,x.length<=SITE_LIMITS.quoteChars?x:m[0],p.url,sec.heading)}
    for(const [label,re] of PROGRAMMES){const m=x.match(re);if(m)add('programme','Programme or qualification (school’s own statement)',label,x.length<=SITE_LIMITS.quoteChars?x:m[0],p.url,sec.heading)}
    if(!sec.rows.length)yearFacts(x,null,p.url,sec.heading);
   }
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
/** Does the site give Year-scale evidence for this British school year? Grade facts are reported separately, never converted. */
export function yearEvidence(facts,year){
 const pos=t=>{t=String(t).trim();if(/^(FS|KG|Pre-?KG|Nursery|Reception|Foundation)/i.test(t))return 0;const m=t.match(/(\d{1,2})/);return m?+m[1]:null};
 const out={listed:[],gradeOnly:[]};
 for(const f of facts.filter(x=>x.key==='year-groups')){
  const [a,b]=f.value.split(' to ');
  if(/^Grade/.test(a)&&(!b||/^Grade/.test(b))){out.gradeOnly.push(f);continue}
  if(!b){if(f.value==='Year '+year)out.listed.push(f);continue}
  const lo=pos(a),hi=pos(b);if(lo==null||hi==null)continue;
  if(/^Year/.test(b)&&year>=lo&&year<=hi)out.listed.push(f);
  else if(/Grade/.test(f.value))out.gradeOnly.push(f);
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
 const more=pages.length?sitePageLinks(pages[0].raw,pages[0].url,established.host,SITE_LIMITS.extraLinks,'overview').filter(u=>!pages.some(p=>p.url===u)):[];
 for(const u of more.slice(0,Math.max(0,SITE_LIMITS.pagesPerSite-pages.length))){const g=await site.fetchSitePage(u,established.host);coverage.site.pagesOpened++;if(g.ok)pages.push({url:g.url,raw:g.raw});else coverage.site.failures.push({host:established.host,path:new URL(u).pathname,reason:g.reason,http:g.http??null})}
 const facts=readSiteFacts(pages,established.host);
 // Both sources are kept side by side; a difference is flagged, never resolved here.
 const speaCurr=school.fields?.curriculum?.value||'';const siteCurr=[...new Set(facts.filter(f=>f.key==='curriculum').map(f=>f.value))];
 const differences=speaCurr&&siteCurr.length&&!siteCurr.some(v=>v.toLowerCase().startsWith(speaCurr.toLowerCase().split(/[ (]/)[0]))?[{field:'curriculum',spea:speaCurr,site:siteCurr}]:[];
 return {status:'match',candidates:identity.candidates,school,site:{status:'established',host:established.host,basis:established.basis,evidence:established.evidence,facts,pagesRead:pages.map(p=>p.url),differences},coverage};
}
