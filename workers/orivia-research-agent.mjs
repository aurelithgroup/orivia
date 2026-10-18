/* Orivia research agent: understand the goal → choose a research action → inspect the result → identify what's missing
 * → choose the next action → answer with evidence. Modelled on Ina's case study (docs/research-agent.md).
 *
 * The MODEL decides which permitted action moves the task forward, step by step, from a compact view of what has been
 * found. CODE enforces everything else: the action menu, ids instead of URLs (the model can only open what Orivia has
 * actually seen or the person gave), privacy-safe queries, search/fetch/step budgets, which source kinds may support which
 * claim, and whether a list is complete. If the model is unavailable or proposes something invalid, a built-in policy
 * following the same method picks the next action instead. Enabled with RESEARCH_AGENT=1 (on top of RESEARCH_LOOP).
 */
import {understandRequest} from './orivia-research-understand.mjs';
import {makeTools,regulatorFor,sanitizeTask,buildQuery,queryName,leadNames,LEVEL,regulatorRecord,readSite,makeSources,recordLine,orgCard,siteLines,LEVEL_SAYS,isListPage,AGGREGATOR,ORG_WORD,CURR_NAME,TOPIC_WORD} from './orivia-research-loop.mjs';
import {nameScore,classifyMatches,curriculumMatches,listsYear,distinctiveTokens} from './orivia-spea-reader.mjs';
// A lead and a record are the same organisation when names match closely, or every distinctive word of the shorter name
// (at least two) appears in the longer one ("Alder British School" ↔ "[Synthetic] Alder British School").
export function sameOrg(a,b){if(!a||!b)return false;if(nameScore(a,b)>=0.85)return true;const da=distinctiveTokens(a),db=distinctiveTokens(b);const [s,l]=da.length<=db.length?[da,db]:[db,da];return s.length>=2&&s.every(t=>l.includes(t))}
import {siteHost,establishDomain,readSiteFacts,yearEvidence,nameOnPage} from './orivia-school-sites.mjs';

const MODEL='@cf/meta/llama-3.3-70b-instruct-fp8-fast';
export const AGENT_LIMITS=Object.freeze({defaultSteps:5,maxSteps:8,recordsPerOpen:8,leadsPerCheck:5,listPagesPerRead:2,viewItems:12,listPage:8});

/* ---------- 1. What would count as answering ---------- */
// Which source kinds may support which claim (Ina: "reliability belongs to a particular claim").
export const CLAIM_SOURCES=Object.freeze({
 classification:[LEVEL.regulator],                                  // "SPEA lists it as British"
 'self-description':[LEVEL.siteLinked,LEVEL.siteUser,LEVEL.siteFound], // "its website says it teaches…"
 contact:[LEVEL.regulator,LEVEL.siteLinked,LEVEL.siteUser,LEVEL.siteFound],
 existence:[LEVEL.regulator,LEVEL.regulatorIndex],                  // "listed on SPEA" (index = not opened)
 lead:[LEVEL.lead]                                                  // a name worth checking; never a fact
});
export function defineGoal(u){
 const listAll=u.intent==='all',kind=listAll?'list-all':u.intent;
 const criteria={
  'list-all':['every matching record from a complete regulator listing (filter applied, all results read)','otherwise: honest coverage and what remains'],
  find:['at least 3 confirmed matches, or everything found if fewer'],
  more:['new confirmed matches not already shown'],
  check:['who the organisation is (regulator identity or candidates)','what it says about itself, labelled','the year asked about, if any'],
  contacts:['phone or email from the regulator or its own site'],
  compare:['the same facts for each named organisation']
 }[kind]||['an answer to the question'];
 return {kind,intent:u.intent,topic:u.topic,location:u.location,constraints:u.constraints,organisations:u.organisations,criteria};
}

/* ---------- State: what has been found (never raw pages in the model's view) ---------- */
function newState(goal,u,task,R){
 return {goal,u,task,R,step:0,modelCalls:0,history:[],rejected:[],refs:new Map(),nextId:{W:1,L:1,R:1,S:1,U:1},
  web:[],leads:[],claimedCounts:[],records:new Map(),listings:[],sites:[],failures:[],identity:new Map()};
}
function ref(state,prefix,data){for(const [id,d] of state.refs)if(d.url&&d.url===data.url&&id[0]===prefix)return id;const id=prefix+(state.nextId[prefix]++);state.refs.set(id,{...data,id});return id}
function addRecord(state,url,name,patch={}){const prev=state.records.get(url)||{url,name,level:LEVEL.regulatorIndex,fields:{},from:[]};const rec={...prev,...patch,name:patch.name||prev.name||name,from:[...new Set([...prev.from,...(patch.from?[patch.from]:[])])]};state.records.set(url,rec);ref(state,'R',{url,name:rec.name,kind:'record'});return rec}
const shownUrls=state=>new Set((state.task?.shown||[]).map(s=>s.url));

/* ---------- 2. Actions: the only things the model may choose ---------- */
export const ACTIONS={
 regulator_listing:{args:'{"page":1}',when:s=>!!s.R,does:'Open the regulator’s own directory listing (with the curriculum filter when the regulator supports it). Gives names, classifications and the result total.'},
 regulator_search:{args:'{"by":"curriculum"|"name","org":"O1 (for name)","offset":0}',when:s=>!!s.R,does:'Search within the regulator’s website. Finds record pages (not yet opened). Costs 1 search.'},
 web_search:{args:'{"purpose":"discover"|"official-site","org":"O1 (for official-site)"}',when:()=>true,does:'Search the open web. Results are leads only (directories, schools, articles). Costs 1 search.'},
 read_list_page:{args:'{"ids":["W1"]}',when:s=>s.web.some(w=>w.list&&!w.read),does:'Read up to 2 listing pages from web results for names (leads only, never facts).'},
 check_leads:{args:'{"ids":["L1","L2"]}',when:s=>!!s.R&&s.leads.some(l=>!l.checked),does:'Check up to 5 lead names against the regulator in one search. Costs 1 search.'},
 open_records:{args:'{"ids":["R1","R2"]}',when:s=>[...s.records.values()].some(r=>r.level!==LEVEL.regulator&&!r.failed),does:'Open up to 8 regulator record pages to confirm name, curriculum, year groups and contacts.'},
 open_site:{args:'{"id":"S1"|"U1"}',when:s=>[...s.refs.values()].some(r=>r.kind==='site'&&!r.read),does:'Read an organisation’s website (a few pages ranked for this request, following year-group pages if a year was asked).'},
 answer:{args:'{}',when:()=>true,does:'Stop and answer with the evidence gathered.'}
};
const idList=(args,prefix,max)=>(Array.isArray(args?.ids)?args.ids:[]).filter(x=>typeof x==='string'&&x.startsWith(prefix)).slice(0,max);
/** Code-side validation of a proposed action. Returns a normalised action or {error}. */
export function validateAction(p,state,tools){
 const type=p?.action;const def=ACTIONS[type];if(!def)return {error:'unknown-action'};
 if(!def.when(state))return {error:'not-available-now'};
 const a=p.args&&typeof p.args==='object'?p.args:{};const left=4-tools.used.searches;
 const costsSearch=['regulator_search','web_search','check_leads'].includes(type);if(costsSearch&&left<=0)return {error:'no-search-budget'};
 if(type==='regulator_search'){const by=a.by==='name'?'name':'curriculum';const org=by==='name'?state.goalOrgs.find(o=>o.id===a.org)||state.goalOrgs[0]:null;
  if(by==='name'&&!org?.queryName)return {error:'name-not-searchable'};const offset=Math.max(0,Math.min(9,Math.floor(Number(a.offset)||0)));
  if(state.history.some(h=>h.type==='regulator_search'&&h.args.by===by&&h.args.offset===offset&&(h.args.org||'')===(org?.id||'')))return {error:'already-done'};
  return {type,args:{by,offset,org:org?.id||''}}}
 if(type==='web_search'){const purpose=a.purpose==='official-site'?'official-site':'discover';const org=purpose==='official-site'?state.goalOrgs.find(o=>o.id===a.org)||state.goalOrgs[0]:null;
  if(purpose==='official-site'&&!(org?.queryName||org?.identity))return {error:'name-not-searchable'};
  if(state.history.some(h=>h.type==='web_search'&&h.args.purpose===purpose&&(h.args.org||'')===(org?.id||'')))return {error:'already-done'};
  return {type,args:{purpose,org:org?.id||''}}}
 if(type==='read_list_page'){const ids=idList(a,'W',AGENT_LIMITS.listPagesPerRead).filter(id=>state.web.some(w=>w.id===id&&w.list&&!w.read));return ids.length?{type,args:{ids}}:{error:'no-valid-ids'}}
 if(type==='check_leads'){const ids=idList(a,'L',AGENT_LIMITS.leadsPerCheck).filter(id=>state.leads.some(l=>l.id===id&&!l.checked));return ids.length?{type,args:{ids}}:{error:'no-valid-ids'}}
 if(type==='open_records'){const ids=idList(a,'R',AGENT_LIMITS.recordsPerOpen).filter(id=>{const r=state.refs.get(id);const rec=r&&state.records.get(r.url);return rec&&rec.level!==LEVEL.regulator&&!rec.failed});return ids.length?{type,args:{ids}}:{error:'no-valid-ids'}}
 if(type==='open_site'){const r=state.refs.get(a.id);return r&&r.kind==='site'&&!r.read?{type,args:{id:a.id}}:{error:'no-valid-ids'}}
 if(type==='regulator_listing'){if(state.history.some(h=>h.type==='regulator_listing'))return {error:'already-done'};return {type,args:{}}}
 return {type:'answer',args:{}};
}

/* ---------- 3. Executing an action and recording what it showed ---------- */
async function execute(action,state,tools){
 const {type,args}=action,R=state.R,u=state.u,c=u.constraints;
 if(type==='regulator_listing'){
  // A filtered, paged listing when the regulator adapter supports it; otherwise the server-rendered first page.
  // Only the curriculum goes to the listing tool (a validated field): never chat text or names.
  if(R.listFiltered&&c.curriculum){const l=await R.listFiltered({curriculum:c.curriculum,year:c.year},tools);state.browserMs=(state.browserMs||0)+(l.browserMs||0);
   if((l.status==='ok'||l.status==='partial')&&l.items?.length){const listing={source:'regulator',filter:l.filter,total:l.total,range:l.range,items:l.items.length,
     complete:l.complete!==false&&l.status==='ok'&&l.items.length===l.total&&l.range?.[1]===l.total,unapplied:l.unappliedFilters||[]};state.listings.push(listing);
    for(const it of l.items)addRecord(state,it.url,it.name,{level:LEVEL.regulator,fields:it.fields||{},from:'regulator-listing'});
    if(!listing.complete)state.failures.push({what:'regulator-listing',reason:l.reason||'not-all-results-read'});
    return 'Regulator listing with filter '+JSON.stringify(l.filter)+': '+l.items.length+' entries read, total shown '+l.total+(listing.complete?' (all results read)':' (not all results read: '+(l.reason||'partial')+')')+'.'}
   state.failures.push({what:'regulator-listing',reason:l.reason||l.status});}
  const d=await tools.fetchPage(R.directory,{kind:'regulator'});
  if(!d.ok){state.failures.push({what:'regulator-directory',reason:d.reason});return 'Regulator directory could not be opened ('+d.reason+').'}
  const dir=R.parseDirectory(d.raw);state.listings.push({source:'regulator',filter:null,total:dir.total,range:[dir.from,dir.to],items:dir.cards.length,complete:dir.cards.length===dir.total});
  for(const card of dir.cards)addRecord(state,card.url,card.name,{level:LEVEL.regulator,fields:card.curriculum?{curriculum:{value:card.curriculum,quote:card.quote}}:{},from:'directory-card'});
  return 'Regulator directory (no filter possible here): first '+dir.cards.length+' of '+dir.total+' shown; the rest load only in a browser.';
 }
 if(type==='regulator_search'){
  const org=state.goalOrgs.find(o=>o.id===args.org);const q=args.by==='name'?buildQuery('name',u,{name:org.queryName}):buildQuery('regulator',u,{R});
  const s=await tools.search(q,{site:R.site,offset:args.offset});if(s.status!=='searched')return 'Regulator search failed ('+s.status+').';
  let n=0;for(const r of s.results)if(R.isRecord(r.url)){const name=R.indexName(r.title);if(name||args.by==='name'){addRecord(state,R.record(r.url),name,{from:'regulator-search'});n++}}
  state.moreRegulatorResults=!!s.more;return 'Regulator search found '+n+' record pages (not opened yet)'+(s.more?'; more results available at the next offset.':'.');
 }
 if(type==='web_search'){
  const org=state.goalOrgs.find(o=>o.id===args.org);const q=args.purpose==='official-site'?buildQuery('name-site',u,{name:org.identity||org.queryName}):buildQuery('web-list',u);
  const s=await tools.search(q);if(s.status!=='searched')return 'Web search failed ('+s.status+').';
  let lists=0,sites=0;
  for(const r of s.results){
   const list=isListPage(r);const host=siteHost(r.url);
   const id=ref(state,'W',{url:r.url,kind:'web',title:r.title});state.web.push({id,url:r.url,host:r.host,title:r.title,list,read:false});if(list)lists++;
   // Directories often state a count ("28 British schools"): a lead about size, never evidence of completeness.
   const m=(r.title+' '+r.snippet).match(/\b(\d{1,3})\s+(?:best\s+|top\s+)?(?:[A-Z][a-z]+\s+){0,2}(?:schools|nurseries|clinics)\b/i);if(m&&list)state.claimedCounts.push({host:r.host,n:+m[1],text:m[0]});
   if(!list&&host&&ORG_WORD.test(r.title)&&!AGGREGATOR.test(host)){ref(state,'S',{url:r.url,kind:'site',host,name:r.title.split(/\s[|\-–]\s/)[0].trim(),from:'web-search',org:args.org||''});sites++}
  }
  return 'Web search: '+s.results.length+' results ('+lists+' listing pages, '+sites+' organisation sites). These are leads.';
 }
 if(type==='read_list_page'){
  let found=0;for(const id of args.ids){const w=state.web.find(x=>x.id===id);w.read=true;const p=await tools.fetchPage(w.url,{kind:'discovery'});
   if(!p.ok){state.failures.push({what:'list-page',host:w.host,reason:p.reason});continue}
   for(const name of leadNames(p.raw))if(!state.leads.some(l=>sameOrg(l.name,name))){state.leads.push({id:'L'+(state.leads.length+1),name,from:w.host,checked:false});found++}}
  return 'Listing pages gave '+found+' new lead names (not verified).';
 }
 if(type==='check_leads'){
  const leads=args.ids.map(id=>state.leads.find(l=>l.id===id));leads.forEach(l=>l.checked=true);
  const q='('+leads.map(l=>'"'+l.name.replace(/"/g,'').slice(0,60)+'"').join(' OR ')+')';
  const s=await tools.search(q,{site:R.site});if(s.status!=='searched')return 'Lead check failed ('+s.status+').';
  let matched=0;for(const r of s.results)if(R.isRecord(r.url)){const name=R.indexName(r.title);addRecord(state,R.record(r.url),name,{from:'lead-check'});const l=leads.find(x=>name&&sameOrg(x.name,name));if(l){l.matched=R.record(r.url);matched++}}
  return 'Checked '+leads.length+' leads against the regulator: '+matched+' matched a regulator record.';
 }
 if(type==='open_records'){
  const urls=args.ids.map(id=>state.refs.get(id).url);let ok=0,failed=0;
  await Promise.all(urls.map(async url=>{const p=await tools.fetchPage(url,{kind:'regulator'});
   if(!p.ok){failed++;addRecord(state,url,'',{failed:p.reason});state.failures.push({what:'regulator-record',path:new URL(url).pathname,reason:p.reason});return}
   const rec=regulatorRecord(R,p.url,p.raw);if(!rec){failed++;addRecord(state,url,'',{failed:'unreadable'});return}
   addRecord(state,url,rec.name,{level:LEVEL.regulator,fields:rec.fields,from:'opened'});if(rec.url!==url)addRecord(state,rec.url,rec.name,{level:LEVEL.regulator,fields:rec.fields,from:'opened'});ok++;
   if(rec.fields.website)ref(state,'S',{url:rec.fields.website.url,kind:'site',host:siteHost(rec.fields.website.url),name:rec.name,from:'regulator-link',record:rec.url})}));
  return 'Opened '+urls.length+' regulator records: '+ok+' read, '+failed+' failed'+(failed?' (a failed old link is a broken address, not evidence the organisation is gone)':'')+'.';
 }
 if(type==='open_site'){
  const r=state.refs.get(args.id);r.read=true;
  const s=await readSite(tools,r.url,r.host,4,u.intent==='contacts'?'contacts':'overview',c.year);
  if(!s.ok){state.failures.push({what:'org-site',host:r.host,reason:s.reason});return 'Website '+r.host+' could not be read ('+s.reason+').'}
  const rec=r.record?state.records.get(r.record):[...state.records.values()].find(x=>x.level===LEVEL.regulator&&x.name&&nameOnPage(x.name,s.pages[0].raw));
  const proof=rec?establishDomain({school:rec,host:r.host}):{status:'unverified'};
  const named=r.from==='user'||nameOnPage(rec?.name||r.name||'',s.pages[0].raw);
  if(proof.status!=='established'&&!named&&r.from!=='user'){state.failures.push({what:'org-site',host:r.host,reason:'name-not-on-site'});return 'Website '+r.host+' does not name the organisation; not used.'}
  const level=r.from==='user'?LEVEL.siteUser:proof.status==='established'?LEVEL.siteLinked:LEVEL.siteFound;
  const facts=readSiteFacts(s.pages,r.host);state.sites.push({host:r.host,name:rec?.name||r.name,record:rec?.url||'',level,pages:s.pages,facts,followed:s.followed||[]});
  const ye=c.year?yearEvidence(facts,c.year):null;
  return 'Read '+s.pages.length+' pages of '+r.host+' ('+level+'): '+facts.length+' statements'+(c.year?', Year '+c.year+' '+(ye.listed.length?'listed':'not confirmed'):'')+'.';
 }
 return '';
}

/* ---------- 4. What's still missing (code decides, including completeness) ---------- */
export function assess(state){
 const g=state.goal,c=g.constraints,missing=[];
 const recs=[...state.records.values()],opened=recs.filter(r=>r.level===LEVEL.regulator);
 const matches=opened.filter(r=>!shownUrls(state).has(r.url)&&(!c.curriculum||(r.fields.curriculum&&curriculumMatches(r.fields.curriculum.value,c.curriculum)))&&(!c.year||!r.fields.grades||listsYear(r.fields.grades.value,c.year)));
 const filtered=state.listings.find(l=>l.filter&&(!c.curriculum||l.filter.curriculum===c.curriculum));
 const complete=!!(filtered&&filtered.complete);
 if(['list-all','find','more'].includes(g.kind)){
  if(g.kind==='list-all'&&!complete)missing.push(state.R?'a complete regulator listing for this filter (not available yet): keep confirming records and report coverage':'no regulator: completeness cannot be established');
  const enough=g.kind!=='list-all'&&matches.length>=(g.kind==='find'?3:1);
  if(g.kind!=='list-all'&&!enough)missing.push('more confirmed matches');
  // Only "all" (or not having enough yet) keeps widening: unopened records and unchecked leads.
  if(!enough&&recs.some(r=>r.level===LEVEL.regulatorIndex&&!r.failed))missing.push('regulator records found but not opened');
  if(!enough&&state.leads.some(l=>!l.checked))missing.push('lead names not yet checked against the regulator');
 }
 if(['check','contacts','compare'].includes(g.kind)){
  for(const o of state.goalOrgs){const id=identityOf(state,o);if(!id.record&&!id.site)missing.push('identity of '+(o.name||o.url));
   if(g.kind==='contacts'&&!hasContact(state,o))missing.push('contact details for '+(o.name||o.url));
   if(g.kind==='check'&&c.year&&!yearAnswered(state,o))missing.push('Year '+c.year+' evidence for '+(o.name||o.url))}
 }
 const done=g.kind==='list-all'?complete:missing.length===0;
 return {done,missing,complete,matches:matches.length};
}
function identityOf(state,o){
 const opened=[...state.records.values()].filter(r=>r.level===LEVEL.regulator||r.level===LEVEL.regulatorIndex);
 const name=o.name||'';const cls=name?classifyMatches(name,opened.map(r=>({...r}))):{status:'not-found',candidates:[]};
 const record=cls.status==='match'&&cls.candidates[0].level===LEVEL.regulator?cls.candidates[0]:null;
 const site=state.sites.find(s=>(record&&s.record===record.url)||(o.url&&siteHost(o.url)===s.host)||(name&&nameScore(name,s.name||'')>=0.85));
 return {status:cls.status,record,candidates:cls.candidates,site};
}
const hasContact=(state,o)=>{const id=identityOf(state,o);return !!(id.record?.fields?.phone||id.record?.fields?.email||id.site?.facts.some(f=>['phone','email'].includes(f.key)))};
const yearAnswered=(state,o)=>{const id=identityOf(state,o);const c=state.goal.constraints;if(id.record?.fields?.grades&&listsYear(id.record.fields.grades.value,c.year))return true;if(id.site)return yearEvidence(id.site.facts,c.year).listed.length>0||(id.site.followed||[]).length>0;return false};

/* ---------- The built-in policy (Ina's method) for when the model can't choose ---------- */
export function policyNext(state){
 const g=state.goal,R=state.R,h=t=>state.history.filter(x=>x.type===t);
 const unopened=[...state.records.entries()].filter(([,r])=>r.level===LEVEL.regulatorIndex&&!r.failed).map(([url])=>[...state.refs].find(([,d])=>d.url===url&&d.kind==='record')?.[0]).filter(Boolean);
 const uncheckedLeads=state.leads.filter(l=>!l.checked).map(l=>l.id);
 const listsToRead=state.web.filter(w=>w.list&&!w.read).map(w=>w.id);
 const sitesToRead=[...state.refs.values()].filter(r=>r.kind==='site'&&!r.read);
 if(['list-all','find','more'].includes(g.kind)){
  if(R&&!h('regulator_listing').length&&g.kind!=='more')return {action:'regulator_listing',args:{}};
  if(assess(state).done)return {action:'answer'};
  if(R&&!h('regulator_search').length)return {action:'regulator_search',args:{by:'curriculum',offset:(state.task?.cursor?.offset)||0}};
  if(!h('web_search').length&&(g.kind!=='find'||!R))return {action:'web_search',args:{purpose:'discover'}};
  if(listsToRead.length)return {action:'read_list_page',args:{ids:listsToRead.slice(0,2)}};
  if(R&&uncheckedLeads.length)return {action:'check_leads',args:{ids:uncheckedLeads.slice(0,5)}};
  if(R&&unopened.length)return {action:'open_records',args:{ids:unopened.slice(0,8)}};
  if(R&&g.kind==='list-all'&&state.moreRegulatorResults)return {action:'regulator_search',args:{by:'curriculum',offset:h('regulator_search').length+((state.task?.cursor?.offset)||0)}};
  if(!R&&sitesToRead.length)return {action:'open_site',args:{id:sitesToRead[0].id}};
  return {action:'answer'};
 }
 // check / contacts / compare
 const userSite=sitesToRead.find(r=>r.from==='user');if(userSite)return {action:'open_site',args:{id:userSite.id}};
 for(const o of state.goalOrgs){
  const id=identityOf(state,o);
  if(R&&o.queryName&&!state.history.some(x=>x.type==='regulator_search'&&x.args.org===o.id))return {action:'regulator_search',args:{by:'name',org:o.id,offset:0}};
  if(R&&!id.record){const cands=unopened.filter(rid=>nameScore(o.name||'',state.refs.get(rid).name||'')>=0.5);if(cands.length)return {action:'open_records',args:{ids:cands.slice(0,4)}}}
  const linked=sitesToRead.find(r=>id.record&&r.record===id.record.url);if(linked)return {action:'open_site',args:{id:linked.id}};
  if(!id.site&&(o.queryName||id.record)&&!state.history.some(x=>x.type==='web_search'&&x.args.org===o.id)){o.identity=id.record?.name||'';return {action:'web_search',args:{purpose:'official-site',org:o.id}}}
  const found=sitesToRead.find(r=>r.org===o.id);if(!id.site&&found)return {action:'open_site',args:{id:found.id}};
 }
 return {action:'answer'};
}

/* ---------- The model's view and choice ---------- */
function viewFor(state,tools,a,lastObs){
 const recs=[...state.records.values()];const N=AGENT_LIMITS.viewItems;
 return {goal:{kind:state.goal.kind,topic:state.goal.topic,place:state.goal.location?.city||'',curriculum:state.goal.constraints.curriculum||'',year:state.goal.constraints.year||null,organisations:state.goalOrgs.map(o=>({id:o.id,name:o.name||o.url}))},
  whatCountsAsAnswering:state.goal.criteria,stillMissing:a.missing,complete:a.complete,
  budget:{stepsLeft:state.maxSteps-state.step,searchesLeft:4-tools.used.searches,fetchesLeft:24-tools.used.fetches},
  found:{confirmedMatches:a.matches,regulatorRecordsOpened:recs.filter(r=>r.level===LEVEL.regulator).length,
   regulatorRecordsNotOpened:[...state.refs.values()].filter(d=>d.kind==='record'&&state.records.get(d.url)?.level===LEVEL.regulatorIndex&&!state.records.get(d.url)?.failed).slice(0,N).map(d=>({id:d.id,name:d.name})),
   leadsNotChecked:state.leads.filter(l=>!l.checked).slice(0,N).map(l=>({id:l.id,name:l.name})),
   listPagesNotRead:state.web.filter(w=>w.list&&!w.read).slice(0,N).map(w=>({id:w.id,title:w.title.slice(0,80)})),
   sitesNotRead:[...state.refs.values()].filter(d=>d.kind==='site'&&!d.read).slice(0,N).map(d=>({id:d.id,host:d.host,from:d.from})),
   listings:state.listings.map(l=>({filter:l.filter,total:l.total,read:l.items,complete:l.complete})),claimedCounts:state.claimedCounts,failures:state.failures.slice(-5)},
  done:state.history.map(x=>x.type+(x.args&&Object.keys(x.args).length?' '+JSON.stringify(x.args):'')),lastResult:lastObs,
  actions:Object.entries(ACTIONS).filter(([,d])=>d.when(state)).map(([k,d])=>({action:k,args:d.args,does:d.does}))};
}
const PLANNER_SYSTEM=`You choose Orivia's next research step. Work like a careful researcher:
understand what would count as answering; treat search results and directories as leads; judge each claim by the right source
(the regulator for classification, the organisation's own site for what it says about itself); when a route isn't enough, change route;
before answering, check whether you have actually finished (a complete list needs a complete listing, not a few search results).
A broken old link means the link failed, not that the organisation is gone.
Return ONLY JSON: {"action":"<one of the listed actions>","args":{...},"why":"one short sentence"}. Use only ids shown in the view.`;
async function modelNext(ai,view){
 const out=await ai.run(MODEL,{messages:[{role:'system',content:PLANNER_SYSTEM},{role:'user',content:JSON.stringify(view)}],max_tokens:160,temperature:0,stream:false});
 let raw=out?.response??out;if(typeof raw==='object')return raw;const m=String(raw||'').match(/\{[\s\S]*\}/);return m?JSON.parse(m[0]):null;
}

/* ---------- 5. Answer with evidence (code composes; claims only from permitted source kinds) ---------- */
function compose(state,a){
 const g=state.goal,R=state.R,c=g.constraints,src=makeSources(),sid=(u,t,k)=>src.add(u,t,k),claims=[],orgs=[],parts=[];
 const where=g.location?.city||'';const label=(CURR_NAME[c.curriculum]?CURR_NAME[c.curriculum]+'-curriculum ':'')+(TOPIC_WORD[g.topic]||'places');
 const task={intent:g.intent,topic:g.topic,location:g.location,constraints:c,shown:[...(state.task?.shown||[])],focus:state.task?.focus||'',regulatorTotal:state.task?.regulatorTotal||null,listTotal:state.task?.listTotal||null};
 let status='evidence-found',cardMode='list';
 if(['list-all','find','more'].includes(g.kind)){
  const shown=shownUrls(state);const recs=[...state.records.values()].filter(r=>r.level===LEVEL.regulator&&r.name&&!shown.has(r.url));
  const seen=new Set(),list=[];for(const r of recs){if(c.curriculum&&!(r.fields.curriculum&&curriculumMatches(r.fields.curriculum.value,c.curriculum)))continue;if(c.year&&r.fields.grades&&!listsYear(r.fields.grades.value,c.year))continue;const k=r.name.toLowerCase();if(seen.has(k))continue;seen.add(k);list.push(r)}
  const filtered=state.listings.find(l=>l.filter);
  // Long lists are delivered in pages of source-backed entries; the rest stay queued (regulator record URLs, re-opened next
  // turn), so nothing from a complete directory is silently cut by the reply or card limits.
  const PAGE=AGENT_LIMITS.listPage,page=list.slice(0,PAGE),rest=list.slice(PAGE);
  const prevTotal=state.task?.listTotal&&state.task.listTotal.curriculum===(c.curriculum||'')?state.task.listTotal.total:null;
  if(page.length){parts.push((g.kind==='more'?'Here are '+page.length+' more ':rest.length?'Here are the first '+page.length+' ':page.length+' ')+label+(where?' in '+where:'')+(R?' from '+R.short+':':':'));
   for(const r of page){const s=sid(r.url,r.name+' ('+R.short+')','official');const l=recordLine(r,s);parts.push(l.text+' ['+s.id.slice(1)+']');if(l.claim)claims.push(l.claim);orgs.push(orgCard(r,s));task.shown.push({name:r.name,url:r.url,level:LEVEL.regulator})}}
  else parts.push('I couldn’t confirm any '+(g.kind==='more'?'new ':'')+label+(where?' in '+where:'')+(R?' on '+R.short:'')+' in this check.');
  const unopened=[...state.records.values()].filter(r=>r.level===LEVEL.regulatorIndex&&!r.failed&&r.name&&!shown.has(r.url));
  const queued=[...state.records.values()].filter(r=>r.level===LEVEL.regulatorIndex&&!r.failed&&!r.name&&!shown.has(r.url)); // carried from an earlier page
  if(unopened.length)parts.push('Also listed on '+R.short+', not opened yet: '+unopened.slice(0,8).map(r=>r.name).join('; ')+(unopened.length>8?' and '+(unopened.length-8)+' more':'')+'.');
  const leads=state.leads.filter(l=>!l.matched&&![...state.records.values()].some(r=>r.name&&sameOrg(l.name,r.name)));
  if(leads.length)parts.push('Mentioned on other websites, not confirmed'+(R?' on '+R.short:'')+': '+leads.slice(0,6).map(l=>l.name).join('; ')+'.');
  const nShown=new Set(task.shown.map(s=>s.url)).size,pendingUrls=[...rest,...queued,...unopened].map(r=>r.url).slice(0,48);
  // Completeness: only a filtered listing with every result read supports "complete".
  if(a.complete||(prevTotal&&g.kind==='more')){const total=a.complete?filtered.total:prevTotal;task.listTotal={curriculum:c.curriculum||'',total};
   if(a.complete)parts.push('That’s the complete list '+R.short+' shows for the '+(CURR_NAME[c.curriculum]||'')+' filter: '+total+' of '+total+'.'+(c.curriculum?' Schools teaching more than one curriculum may be classified under another curriculum there, so a few with a '+CURR_NAME[c.curriculum]+' pathway could be missing.':''));
   if(pendingUrls.length){parts.push('I’ve shown '+nShown+' of the '+total+'. Say “more” for the next '+Math.min(PAGE,pendingUrls.length)+'.');task.pendingOffer='more';task.cursor={offset:0,pending:pendingUrls}}
   else{if(!a.complete)parts.push('That’s all '+total+' on '+R.short+'’s '+(CURR_NAME[c.curriculum]||'')+' list.');task.cursor=null}}
  else{const total=state.listings.find(l=>!l.filter)?.total||task.regulatorTotal;task.regulatorTotal=total||null;
   parts.push((total?R.short+' lists about '+total+' private schools in '+where+'. ':'')+'I’ve confirmed '+nShown+' so far, so this isn’t the full list'+(R?'':' (without a regulator directory I can’t tell how complete it is)')+'.');
   for(const cc of state.claimedCounts.slice(0,1))parts.push('A listing site ('+cc.host+') mentions “'+cc.text+'”. That’s a lead, not a verified count.');
   if(pendingUrls.length||state.leads.some(l=>!l.checked)||state.moreRegulatorResults){parts.push('Say “keep going” and I’ll check more.');task.pendingOffer='more';task.cursor={offset:state.history.filter(x=>x.type==='regulator_search'&&x.args.by==='curriculum').length,pending:pendingUrls}}}
  const broken=state.failures.filter(f=>f.what==='regulator-record'&&f.reason==='not-found').length;
  if(broken)parts.push(broken+' old '+R.short+' link'+(broken>1?'s':'')+' returned “not found”. That’s a broken address, not evidence a school has closed.');
  if(c.year&&R&&page.some(r=>!r.fields.grades))parts.push('The '+R.short+' listing doesn’t show year groups or seats, so I haven’t confirmed Year '+c.year+' for '+(page.every(r=>!r.fields.grades)?'these schools':'the ones without a year list')+'. Ask about a school and I’ll check it.');
  if(R&&list.some(r=>r.fields.area&&!/^Sharjah\s*-/i.test(r.fields.area.value)))parts.push(R.short+' covers the whole emirate, so this includes schools outside Sharjah city (for example in the Central and Eastern regions).');
  if(!page.length)status='partial';
 }else{
  for(const o of state.goalOrgs){
   const id=identityOf(state,o),lines=[];
   if(id.status==='candidates'&&!id.record){parts.push('I found several similar names'+(R?' on '+R.short:'')+' for “'+(o.name)+'”. Which one do you mean?\n'+id.candidates.map(x=>{const s=sid(x.url,x.name+' ('+R.short+')','official');return x.name+' ['+s.id.slice(1)+']'}).join('\n'));status='needs-context';continue}
   if(id.record){const s=sid(id.record.url,id.record.name+' ('+R.short+')','official');const l=recordLine(id.record,s,g.kind==='contacts'?['phone','email']:['curriculum','grades','area','evaluation']);
    lines.push((g.kind==='contacts'?R.short+' lists these contacts for ':R.short+' lists ')+l.text+' ['+s.id.slice(1)+']');if(l.claim)claims.push(l.claim);
    orgs.push(orgCard(id.record,s,id.site,id.site?u=>sid(u,id.record.name+' (own website)','organisation'):null));task.shown.push({name:id.record.name,url:id.record.url,level:LEVEL.regulator});task.focus=id.record.name}
   else if(R&&o.name)lines.push('I couldn’t confirm “'+o.name+'” on '+R.short+', so nothing here is regulatory confirmation.');
   else if(!R)lines.push('I can’t check this against a regulator here, so nothing below is regulatory confirmation.');
   else lines.push('I haven’t matched this to a '+R.short+' listing, so nothing below is regulatory confirmation.');
   if(id.site){const sl=siteLines(id.site,sid,{year:c.year,intent:g.kind});lines.push(LEVEL_SAYS[id.site.level]+':'+(sl.lines.length?'\n'+sl.lines.join('\n'):' nothing clear on the pages I read.'));claims.push(...sl.claims);if(!id.record)task.focus=id.site.name||task.focus}
   else if(c.year&&id.record&&!(id.record.fields.grades&&listsYear(id.record.fields.grades.value,c.year)))lines.push('I couldn’t confirm Year '+c.year+' from the pages I read.');
   if(!id.record&&!id.site&&R&&o.name)lines.push('I didn’t find it on the '+R.short+' pages or websites I checked. That doesn’t mean it doesn’t exist — do you have its exact name or website?');
   if(g.kind==='contacts'&&!hasContact(state,o))lines.push('I couldn’t confirm contact details from the pages I opened, so I haven’t guessed any.');
   parts.push(lines.join('\n'));
  }
  cardMode=g.kind==='compare'?'list':g.kind==='contacts'?'choose':'single';if(status==='evidence-found'&&!claims.length)status='partial';
 }
 task.shown=task.shown.filter((s,i,arr)=>s.url&&arr.findIndex(x=>x.url===s.url)===i).slice(-60);
 return {reply:parts.filter(Boolean).join('\n\n'),sources:src.list,claims,orgs,task,status,cardMode};
}

/* ---------- The loop ---------- */
export async function runAgentTurn({messages,profile={},context=null},env,{fetcher=fetch,reserve,understanding=null,planner=null,regulator=undefined,regulatorOverrides=null,ai:aiOverride=null}={}){
 // One model connection for understanding AND planning (a pilot provider is injected here, never by changing env.AI).
 const ai=aiOverride||env.AI||null;const started=Date.now();
 const task=context?.task&&typeof context.task==='object'?sanitizeTask(context.task):null;
 const u=understanding||await understandRequest({messages,profile,task},{ai});
 if(!u.research||u.intent==='other'||u.intent==='rules')return null;
 if(!u.location?.country&&!u.organisations.some(o=>o.url))return wrap(u,{reply:'Which city is this for?',sources:[],claims:[],orgs:[],task:{...(task||{})},status:'needs-context',cardMode:'list'},{history:[],rejected:[]},makeTools({env,fetcher,reserve}),{});
 const goal=defineGoal(u),R=regulator===undefined?((x=>x&&regulatorOverrides?.[x.id]||x)(regulatorFor(u.topic,u.location))):regulator,tools=makeTools({env,fetcher,reserve});
 const state=newState(goal,u,task,R);state.maxSteps=Math.max(1,Math.min(AGENT_LIMITS.maxSteps,Math.floor(Number(env.RESEARCH_AGENT_STEPS)||AGENT_LIMITS.defaultSteps)));
 const shownNames=(task?.shown||[]).map(s=>s.name);
 state.goalOrgs=(goal.organisations.length?goal.organisations:(['contacts','check'].includes(goal.kind)&&task?.focus?[{name:task.focus,url:''}]:[])).map((o,i)=>({id:'O'+(i+1),name:o.name||'',url:o.url||'',queryName:queryName(o.name||'',shownNames)}));
 for(const o of state.goalOrgs)if(o.url){const host=(()=>{try{return new URL(o.url).hostname.replace(/^www\./,'')}catch(_){return ''}})();if(host)ref(state,'S',{url:o.url,kind:'site',host,name:o.name,from:'user'})}
 if(task?.cursor?.pending?.length&&['more','list-all'].includes(goal.kind))for(const url of task.cursor.pending)addRecord(state,url,'',{from:'previous-turn'});
 if(['check','contacts','compare'].includes(goal.kind)&&!state.goalOrgs.length)return wrap(u,{reply:goal.kind==='compare'?'Which ones would you like me to compare?':'Which '+(u.topic==='school'?'school':'organisation')+' do you mean?',sources:[],claims:[],orgs:[],task:{...(task||{})},status:'needs-context',cardMode:'single'},state,tools,{});
 let lastObs='';
 while(state.step<state.maxSteps){
  const a=assess(state);if(a.done&&state.step>0)break;
  let proposal=null,by='policy';
  if((planner||ai?.run)&&state.modelCalls<state.maxSteps){try{state.modelCalls++;proposal=planner?await planner(viewFor(state,tools,a,lastObs),state):await modelNext(ai,viewFor(state,tools,a,lastObs));by='model'}catch(_){proposal=null}}
  let action=proposal?validateAction(proposal,state,tools):{error:'no-proposal'};
  if(action.error){if(proposal)state.rejected.push({proposal:{action:proposal.action},error:action.error});action=validateAction(policyNext(state),state,tools);by='policy';if(action.error)action={type:'answer',args:{}}}
  state.step++;
  if(action.type==='answer'){state.history.push({type:'answer',args:{},by,why:String(proposal?.why||'').slice(0,160)});break}
  lastObs=await execute(action,state,tools);
  state.history.push({...action,by,why:by==='model'?String(proposal?.why||'').slice(0,160):'',result:lastObs});
 }
 state.elapsedMs=Date.now()-started;
 return wrap(u,compose(state,assess(state)),state,tools,assess(state));
}
function wrap(u,c,state,tools,a){
 const refs=c.sources.length?'\n\n'+c.sources.map((s,i)=>'['+(i+1)+'] '+s.title+': '+s.url).join('\n'):'';
 try{console.log(JSON.stringify({event:'orivia-research-agent',status:c.status,intent:u.intent,steps:state.history.map(h=>h.type+':'+h.by),rejected:state.rejected.length,searches:tools.used.searches,fetches:tools.used.fetches,complete:!!a.complete}))}catch(_){}
 return {reply:c.reply+refs,verifiedSources:[],liveSources:c.sources.map(({id,url,title,category,checkedAt})=>({id,url,title,category,checkedAt,topic:u.topic})),actions:[],liveInformation:c.sources.length>0,liveJourneyData:false,
  organisations:c.orgs.slice(0,8),cardMode:c.cardMode,
  research:{status:c.status,applicability:'needs-review',claims:c.claims,unresolved:a.missing||[],agent:true,
   process:{steps:state.history.map(h=>({action:h.type,by:h.by,args:h.args,why:h.why,result:h.result})),rejected:state.rejected,
    metrics:{modelCalls:state.modelCalls||0,searches:tools.used.searches,fetches:tools.used.fetches,browserMs:state.browserMs||0,elapsedMs:state.elapsedMs||0}},
   coverage:{complete:!!a.complete,listings:state.listings||[],claimedCounts:state.claimedCounts||[],failures:state.failures||[],searchesUsed:tools.used.searches,fetchesUsed:tools.used.fetches},
   understanding:{source:u.source,intent:u.intent,topic:u.topic,location:u.location,constraints:u.constraints},taskContext:{task:c.task},trace:tools.log}};
}
