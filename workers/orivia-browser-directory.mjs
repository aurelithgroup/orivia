/* Browser directory tool: read a regulator's filtered directory when the server only renders page 1.
 * Inputs/outputs are documented in docs/browser-directory.md.
 *
 * Boundaries enforced here, not by the caller:
 *  - Only a declared recipe runs (approved host, start page, filter labels observed on the live page). The only input is a
 *    filter value that must be one of the recipe's options — never chat text, names or documents.
 *  - Read-only: GET/HEAD only, images/media/fonts blocked, every request and navigation host-checked, links never clicked,
 *    and the page must stay on the directory path after every action.
 *  - Bounded: one session, a time limit and an action limit; browser time is reserved from the shared ledger before launch
 *    and settled afterwards; the session is closed in `finally`.
 *  - Completeness is decided from the cards actually on the page: every card matches the filter, the set is stable across two
 *    reads, de-duplicated links equal the displayed filtered total and the range ends at that total. A counter that changes
 *    before the cards do never establishes completeness. Directory membership does not confirm year groups or seats.
 */
import {parseDirectory,curriculumMatches,speaPage,SPEA_DIRECTORY} from './orivia-spea-reader.mjs';

export const BROWSER_LIMITS=Object.freeze({sessionMs:45000,actions:14,pollMs:400,pages:4,htmlBytes:3000000,launchMs:15000,closeMs:5000,lateLaunchMs:5000});

/* Recipes: only labels observed on the live page (SPEA, 18 Oct 2026: "Curriculum" filter with the options below,
 * "Apply Filter", "Rows Per Page" 10/25/50/100, counter "1-10 of 136"). No public data endpoint was visible in the page. */
export const DIRECTORY_RECIPES=Object.freeze({
 spea:Object.freeze({id:'spea',host:'spea.shj.ae',start:SPEA_DIRECTORY,path:'/en/education-institutes/schools',assetHosts:[],
  filters:{curriculum:{group:'Curriculum',options:{british:'British',american:'American',indian:'Indian',ib:'IB International Baccalareate',french:'FRENCH',german:'German',australian:'Australian',pakistani:'Pakistani',filipino:'Pilipinas',sabis:'SABIS'}}},
  apply:'Apply Filter',rows:{group:'Rows Per Page',value:'100'},next:/^(next|next page)$/i,
  parse:parseDirectory,isRecord:u=>!!speaPage(u),record:u=>speaPage(u)})
});

const hostOf=u=>{try{return new URL(u).hostname.toLowerCase()}catch{return ''}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* In-page helpers (serialised into page.evaluate; no access to anything outside the page). */
function pageClickExact(text,group){
 const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
 const visible=e=>{const r=e.getBoundingClientRect?.();return !r||r.width>0||r.height>0};
 let root=document;
 if(group){
  const heads=[...document.querySelectorAll('*')].filter(e=>norm(e.textContent)===group);
  outer:for(const h of heads){let a=h.parentElement;for(let i=0;i<5&&a;i++,a=a.parentElement){if([...a.querySelectorAll('*')].some(e=>e!==h&&norm(e.textContent)===text)){root=a;break outer}}}
  if(root===document)return 'group-not-found';
 }
 const all=[...root.querySelectorAll('label,button,option,[role=option],[role=checkbox],[role=menuitem],[role=radio],li,span,div,p,input')].filter(e=>norm(e.textContent||e.value)===text&&visible(e));
 const el=all.find(e=>![...e.children].some(c=>norm(c.textContent)===text))||all[0];
 if(!el)return 'not-found';
 if(el.closest('a[href]'))return 'refused-link';
 if(el.tagName==='OPTION'){const s=el.closest('select');if(!s)return 'not-found';s.value=el.value;s.dispatchEvent(new Event('change',{bubbles:true}));return 'ok'}
 el.click();return 'ok';
}
function pageClickNext(pattern){
 const re=new RegExp(pattern,'i');
 const el=[...document.querySelectorAll('button,[role=button]')].find(e=>re.test((e.getAttribute('aria-label')||e.textContent||'').trim())&&!e.disabled&&e.getAttribute('aria-disabled')!=='true');
 if(!el)return 'not-found';el.click();return 'ok';
}

/**
 * listDirectory({recipe, filter:{curriculum}}, {launch, budget, now, limits}) →
 *  {status:'ok'|'partial'|'unsupported-filter'|'browser-allowance-exhausted'|'browser-unavailable'|'blocked',
 *   complete, filter, total, range:[from,to], items:[{name,url,fields}], unappliedFilters, reason, browserMs, diagnostics}
 * launch() must return a Puppeteer-compatible browser (Cloudflare Browser Run binding in production, a fake in tests).
 * budget is the browser meter from orivia-spend-ledger.mjs (reserve(ms) → ticket|null, settle(ticket, ms|null)).
 */
export async function listDirectory({recipe,filter={}},{launch,budget,now=()=>Date.now(),limits={},waitUntil=null}={}){
 const L={...BROWSER_LIMITS,...limits};
 const base={complete:false,filter:{},total:null,range:null,items:[],unappliedFilters:[],browserMs:0,diagnostics:{actions:0,blockedHosts:[],blockedRequests:0,steps:[]}};
 const R=typeof recipe==='string'?DIRECTORY_RECIPES[recipe]:recipe;
 const want=String(filter.curriculum||'').toLowerCase();const label=R?.filters?.curriculum?.options?.[want];
 if(!R||!label)return {...base,status:'unsupported-filter',reason:'filter-not-in-recipe'};
 base.filter={curriculum:want};if(filter.year)base.unappliedFilters.push('year'); // the cards don't show year groups, so a year filter couldn't be verified
 if(typeof launch!=='function')return {...base,status:'browser-unavailable',reason:'no-browser-binding'};
 const ticket=await budget?.reserve?.(L.sessionMs).catch(()=>null);
 if(!ticket)return {...base,status:'browser-allowance-exhausted',reason:'browser-allowance-exhausted'};
 const started=now(),deadline=started+L.sessionMs,d=base.diagnostics,allowed=new Set([R.host,...(R.assetHosts||[])]);
 const left=()=>deadline-now();
 const timed=(p,ms=left())=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(Object.assign(Error('timeout'),{code:'timeout'})),Math.max(1,ms)))]);
 let browser=null,launching=null,closedOk=false,result=null;
 const seen=new Map();let last=null;
 const step=(name,status)=>d.steps.push({name,status});
 const act=()=>{if(++d.actions>L.actions)throw Object.assign(Error('actions'),{code:'action-limit'})};
 const onPath=page=>{const u=page.url();return hostOf(u)===R.host&&new URL(u).pathname.replace(/\/$/,'')===R.path};
 try{
  launching=Promise.resolve().then(launch);launching.catch(()=>{}); // kept: a launch that finishes after our timeout still gets closed
  browser=await timed(launching,Math.min(L.launchMs,left()));
  const page=await timed(browser.newPage());
  await page.setRequestInterception(true);
  page.on('request',req=>{
   const u=req.url(),h=hostOf(u),type=req.resourceType?.()||'other',m=(req.method?.()||'GET').toUpperCase();
   const ok=(u.startsWith('https://')&&allowed.has(h)&&['GET','HEAD'].includes(m)&&!['image','media','font'].includes(type)
    &&(!req.isNavigationRequest?.()||h===R.host))||u.startsWith('data:');
   if(ok)return req.continue();
   d.blockedRequests++;if(h&&!allowed.has(h)&&d.blockedHosts.length<12&&!d.blockedHosts.includes(h))d.blockedHosts.push(h);
   return req.abort();
  });
  act();await timed(page.goto(R.start,{waitUntil:'domcontentloaded',timeout:Math.max(1,left())}));
  if(!onPath(page))throw Object.assign(Error('nav'),{code:'navigated-away'});
  step('open','ok');
  const read=async()=>{const html=String(await timed(page.content())).slice(0,L.htmlBytes);const dir=R.parse(html);
   const cards=dir.cards.filter(c=>R.isRecord(c.url)).map(c=>({...c,url:R.record(c.url)}));return {...dir,cards}};
  const click=async(text,group)=>{act();const r=await timed(page.evaluate(pageClickExact,text,group||''));if(!onPath(page))throw Object.assign(Error('nav'),{code:'navigated-away'});return r};
  // Wait until the visible cards match the filter, stay the same for two reads and carry a total; otherwise report what's there.
  const settle=async(prevKey)=>{let prev=null,dir=null;
   while(left()>L.pollMs){dir=await read();
    const fits=dir.cards.length>0&&dir.cards.every(c=>curriculumMatches(c.curriculum,want));
    const key=dir.cards.map(c=>c.url).join('|')+'#'+dir.from+'-'+dir.to+'/'+dir.total;
    if(fits&&dir.total!=null&&key===prev&&key!==prevKey)return {dir,key,stable:true};
    prev=fits?key:null;await sleep(L.pollMs)}
   return {dir,key:null,stable:false}};
  // 1. Filter
  let r=await click(label,R.filters.curriculum.group);
  if(r==='group-not-found'||r==='not-found'){await click(R.filters.curriculum.group);r=await click(label,R.filters.curriculum.group)}
  step('filter',r);if(r!=='ok')throw Object.assign(Error('filter'),{code:'filter-not-applied'});
  r=await click(R.apply);step('apply',r);if(r!=='ok')throw Object.assign(Error('apply'),{code:'filter-not-applied'});
  let s=await settle(null);if(!s.stable)throw Object.assign(Error('cards'),{code:'cards-not-loaded'});
  last=s;for(const c of s.dir.cards)seen.set(c.url,c);
  // 2. Bigger pages, then paging if the range still stops short of the total
  if(s.dir.to!==s.dir.total&&R.rows){const rr=await click(R.rows.value,R.rows.group);step('rows',rr);
   if(rr==='ok'){const s2=await settle(s.key);if(s2.stable){last=s2;for(const c of s2.dir.cards)seen.set(c.url,c)}}}
  for(let p=0;p<L.pages&&last.dir.to!==last.dir.total&&R.next;p++){act();const nr=await timed(page.evaluate(pageClickNext,R.next.source));step('next',nr);
   if(nr!=='ok'||!onPath(page))break;const s3=await settle(last.key);if(!s3.stable)break;last=s3;for(const c of s3.dir.cards)seen.set(c.url,c)}
 }catch(e){result={status:'partial',reason:e?.code||'browser-error'}}
 finally{
  const closeIt=async b=>{if(!b||typeof b.close!=='function')return true;try{await timed(Promise.resolve().then(()=>b.close()),L.closeMs);return true}catch{return false}};
  if(browser)closedOk=await closeIt(browser);
  else if(launching){
   // Launch timed out or failed. Wait briefly to learn which: failed → nothing is running; arrived late → close it now;
   // still pending → close it whenever it arrives, and keep the whole reservation because closure isn't confirmed.
   const late=await Promise.race([launching.then(b=>({b}),()=>({none:true})),sleep(L.lateLaunchMs).then(()=>({pending:true}))]);
   if(late.none)closedOk=true;
   else if(late.b){d.lateBrowserClosed=true;closedOk=await closeIt(late.b)}
   else{closedOk=false;d.lateBrowserPending=true;const cleanup=launching.then(b=>closeIt(b)).catch(()=>{});if(typeof waitUntil==='function')waitUntil(cleanup)}
  }else closedOk=true;
  const ms=Math.max(0,now()-started);base.browserMs=ms;
  // Settle to time used only once closure is confirmed; otherwise keep the full reservation (the session may still run).
  try{await budget.settle(ticket,closedOk?ms:null)}catch{}
 }
 const items=[...seen.values()].map(c=>({name:c.name,url:c.url,fields:{...(c.curriculum?{curriculum:{value:c.curriculum,quote:c.quote}}:{}),...(c.area?{area:{value:c.area,quote:c.area}}:{})}}));
 const total=last?.dir?.total??null;
 const complete=!result&&!!last?.stable&&total!=null&&items.length===total&&last.dir.to===total&&items.every(i=>curriculumMatches(i.fields.curriculum?.value,want));
 const out={...base,items,total,range:items.length?[1,last?.dir?.to??items.length]:null,complete};
 if(result)return {...out,...result,reason:result.reason};
 return {...out,status:complete?'ok':'partial',reason:complete?null:'not-all-results-read'};
}

/** Adapter for the research agent: R.listFiltered(filter, tools). Errors never throw into the turn. */
export function speaListFiltered({launch,budget,limits,waitUntil=null}={}){
 return async(filter)=>{try{return await listDirectory({recipe:'spea',filter},{launch,budget,limits,waitUntil})}catch{return {status:'browser-unavailable',reason:'browser-error',items:[]}}};
}
