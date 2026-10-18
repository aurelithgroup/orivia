/* Searching like a person, with labelled evidence (SCRIPTED: synthetic listing sites and school websites + SPEA fixtures).
   Reproduces the 18 Oct live answer ("2 schools… confirmed 2 so far") and checks Orivia now looks beyond the regulator:
   reworded web searches, listing pages, schools' own websites, leads checked against the regulator, and every line
   labelled by who says it. Also a city with no connected regulator. Run: node --experimental-sqlite tests/research-web-evidence.test.mjs */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {runAgentTurn} from '../workers/orivia-research-agent.mjs';
import {buildQuery,makeTools,leadNames} from '../workers/orivia-research-loop.mjs';
import {reserveSearch} from '../workers/orivia-research.mjs';
import {SPEA_DIRECTORY} from '../workers/orivia-spea-reader.mjs';

// Names are invented (synthetic); “Meridian Academy” is written without a prefix so name matching behaves as with real names.
const fx=f=>readFileSync(new URL('./fixtures/'+f,import.meta.url),'utf8');
const P='https://spea.shj.ae/en/education-institutes/schools/';
const LIST_URL='https://www.edarabia.com/synthetic-british-schools-sharjah/',LIST2='https://www.whichschooladvisor.com/synthetic-igcse-sharjah';
const listPage=names=>`<html><title>[Synthetic] British schools in Sharjah</title><body><h1>British schools in Sharjah</h1><ol>${names.map(n=>`<li><h3>${n}</h3></li>`).join('')}</ol></body></html>`;
const site=(name,line)=>`<html><title>${name}</title><body><header><nav>Home About</nav></header><main><h1>${name}</h1><section><h2>About us</h2><p>${line}</p></section></main></body></html>`;
const pages={
 [SPEA_DIRECTORY]:fx('spea-directory-page1.html'),
 [P+'wes-green-int-pvt-school-llc']:fx('spea-profile-wesgreen-full.html'),[P+'victoria-english-pvt-school-llc']:fx('spea-profile-victoria-english.html'),
 [P+'synthetic-larkspur-british-school']:'<h2>[Synthetic] Larkspur British School</h2><span>Curriculum: British</span><span>Grade: FS1 | FS2 | 1 | 2 | 3 | 4 | 5 | 6</span>',
 [P+'synthetic-meridian-academy']:'<h2>Meridian Academy</h2><span>Curriculum: American</span><span>Grade: KG1 | 1 | 2</span>',
 [LIST_URL]:listPage(['[Synthetic] Larkspur British School','Meridian Academy','[Synthetic] Juniper Hill School','[Synthetic] Oakfield British School']),
 [LIST2]:listPage(['[Synthetic] Quayside English School']),
 'https://www.oakfield-synthetic.example/':site('[Synthetic] Oakfield British School','We follow the English National Curriculum from Foundation Stage to Year 13.'),
 'https://www.dubaischool-synthetic.example/':site('[Synthetic] Palm Grove British School','Our school follows the British curriculum, leading to IGCSE and A Levels.'),
};
function world({searches=50}={}){
 const queries=[];let left=searches;
 const fetcher=async u=>{const url=String(u);
  if(url.startsWith('https://api.search.brave.com/')){const q=new URL(url).searchParams.get('q');queries.push(q);let results=[];const ql=q.toLowerCase();
   if(ql.includes('site:spea.shj.ae')){if(ql.includes('larkspur')||ql.includes('meridian')||ql.includes(' or '))results=[{url:P+'synthetic-larkspur-british-school',title:'[Synthetic] Larkspur British School'},{url:P+'synthetic-meridian-academy',title:'Meridian Academy'}]}
   else if(ql.includes('dubai'))results=[{url:'https://www.dubaischool-synthetic.example/',title:'[Synthetic] Palm Grove British School - Dubai'},{url:LIST_URL,title:'[Synthetic] British schools guide'}];
   else if(ql.startsWith('list of british'))results=[{url:LIST_URL,title:'[Synthetic] 4 British schools in Sharjah'},{url:'https://www.oakfield-synthetic.example/',title:'[Synthetic] Oakfield British School | Sharjah'}];
   else if(ql.startsWith('igcse'))results=[{url:LIST2,title:'[Synthetic] IGCSE schools in Sharjah guide'}];
   return Response.json({query:{more_results_available:false},web:{results:results.map(r=>({...r,description:''}))}})}
  return pages[url]!==undefined?new Response(pages[url],{headers:{'content-type':'text/html'}}):new Response('',{status:404,headers:{'content-type':'text/html'}})};
 return {queries,opts:{fetcher,reserve:async()=>left-->0}};
}
const U=(intent,city='Sharjah')=>({source:'test',research:true,intent,topic:'school',location:{country:'uae',city},constraints:{curriculum:'british',year:null},organisations:[],correction:'',question:''});
const env={BRAVE_SEARCH_API_KEY:'k',RESEARCH_AGENT_STEPS:'12',RESEARCH_TURN_SEARCHES:'8'};
const body=r=>r.reply.split('\n\n[1]')[0];

// 1. The live failure case, model unavailable (built-in policy): Sharjah, British, no complete regulator listing
{const w=world();const r=await runAgentTurn({messages:[{role:'user',content:'Find British curriculum schools in Sharjah'}]},{...env,AI:{run:async()=>{throw Error('down')}}},{...w.opts,understanding:U('find')});
 if(process.env.SHOW)console.log(body(r),'\nQUERIES',w.queries);
 assert.ok(w.queries.some(q=>/^list of british/i.test(q))&&w.queries.some(q=>/^igcse/i.test(q)),'the web search was reworded like a person would');
 assert.match(r.reply,/Wes green/);assert.match(r.reply,/Victoria English/);
 assert.match(r.reply,/Larkspur British School: British curriculum/,'a listing-site lead confirmed on SPEA is shown as SPEA-confirmed');
 assert.match(r.reply,/Oakfield British School: its website says “We follow the English National Curriculum/,'own-website statement shown and labelled');
 assert.match(r.reply,/Listed on other websites but not yet confirmed on SPEA[^]*Juniper Hill School/,'unconfirmed names shown, labelled, with the listing page cited');
 assert.match(r.reply,/Meridian Academy: \S+ suggests British[^]*but SPEA lists American/,'disagreement between a listing site and the regulator is stated, not hidden');
 const src=new Map(r.liveSources.map(s=>[s.id,s]));
 for(const cl of r.research.claims){const s=src.get(cl.sourceId);assert.ok(s,'every claim has a source');
  if(/its website says/.test(cl.text))assert.equal(s.category,'organisation');else assert.match(s.url,/^https:\/\/spea\.shj\.ae\//,'classification only from the regulator')}
 assert.ok(r.liveSources.some(s=>s.category==='directory'&&s.url===LIST_URL),'listing page cited as a listing site');
 assert.ok(!r.research.claims.some(cl=>src.get(cl.sourceId)?.category==='directory'),'a listing site never backs a claim');
 assert.ok(r.research.coverage.searchesUsed<=8);}

// 2. A city with no connected regulator: still a useful, honest answer from websites and listing sites
{const w=world();const r=await runAgentTurn({messages:[{role:'user',content:'British curriculum schools in Dubai'}]},{...env,AI:{run:async()=>{throw Error('down')}}},{...w.opts,understanding:U('find','Dubai')});
 if(process.env.SHOW)console.log(body(r),JSON.stringify(r.research.process.steps.map(x=>[x.action,x.by,x.result])));
 assert.match(r.reply,/What their own websites say:[^]*Palm Grove British School: its website says/);
 assert.doesNotMatch(r.reply,/SPEA/,'no Sharjah regulator for Dubai');assert.ok(w.queries.every(q=>!q.includes('spea')));}

// 3. A model that wants to stop before looking beyond the regulator is overruled once; then the method continues
{const w=world();const views=[];const planner=async v=>{views.push(v);return {action:'answer',why:'enough'}};
 const r=await runAgentTurn({messages:[{role:'user',content:'Find British curriculum schools in Sharjah'}]},env,{...w.opts,understanding:U('find'),planner});
 assert.ok(r.research.process.rejected.some(x=>x.error==='too-early'));assert.ok(w.queries.some(q=>/^list of british/i.test(q)));}

// 4. Budgets: turn limits configurable with hard ceilings; the private pilot's searches use their own counters
{const t=makeTools({env:{RESEARCH_TURN_SEARCHES:'99',RESEARCH_TURN_FETCHES:'500'}});assert.deepEqual(t.limits,{searches:10,fetches:40});
 assert.deepEqual(makeTools({env:{}}).limits,{searches:4,fetches:24},'defaults unchanged for the public beta');
 const sql=new DatabaseSync(':memory:');const stmt=(s,a=[])=>({bind:(...v)=>stmt(s,v),run:async()=>sql.prepare(s).run(...a),first:async()=>sql.prepare(s).get(...a)||null});const db={prepare:s=>stmt(s)};
 const now=new Date('2026-10-18T06:00:00Z');
 const beta={BUDGET_DB:db,SEARCH_DAILY_CAP:'10',SEARCH_MONTHLY_CAP:'100'},pilot={BUDGET_DB:db,SEARCH_POOL:'pilot',SEARCH_DAILY_CAP:'50',SEARCH_MONTHLY_CAP:'1000'};
 let n=0;while(await reserveSearch(pilot,now))n++;assert.equal(n,50,'pilot: 50 a day');
 let b=0;while(await reserveSearch(beta,now))b++;assert.equal(b,10,'the beta still has its own 10 a day, untouched by the pilot');
 assert.equal(await reserveSearch({...pilot,SEARCH_DAILY_CAP:'500'},new Date('2026-10-19T06:00:00Z'))&&true,true);
 let c=1;while(await reserveSearch({...pilot,SEARCH_DAILY_CAP:'500'},new Date('2026-10-19T06:00:00Z')))c++;assert.equal(c,50,'daily cap ceiling stays 50 even if misconfigured');
 assert.equal(await reserveSearch({...beta,SEARCH_POOL:'Bad Pool!'},new Date('2026-10-20T06:00:00Z')),true,'an invalid pool name falls back to the shared counters');}

// 5. Query wording is built from validated fields only (never chat text)
{const u=U('find');assert.equal(buildQuery('web-list',u,{variant:0}),'list of British curriculum schools in Sharjah');
 assert.equal(buildQuery('web-list',u,{variant:1}),'IGCSE A Level UK curriculum schools Sharjah');assert.match(buildQuery('web-list',u,{variant:2}),/^best British schools in Sharjah \d{4}$/);}

// 6. Live pilot glitches (18 Oct): GEMS menu links read as school names; vague "Part of your question" placeholders
{const names=leadNames('<ul><li><a>List of All GEMS School</a></li><li><a>View All Our School</a></li><li>Our Schools</li><li>All Schools</li><li>Explore Our Nursery</li><li>Find Your School</li><li>Our Own English High School</li><li>All Saints School</li><li><h3>GEMS Wellington Academy</h3></li></ul>');
 assert.deepEqual(names,['Our Own English High School','All Saints School','GEMS Wellington Academy'],'menu links dropped; real names that start with Our/All kept');
 const w=world();const r=await runAgentTurn({messages:[{role:'user',content:'British curriculum schools in Dubai'}]},{...env,AI:{run:async()=>{throw Error('down')}}},{...w.opts,understanding:U('find','Dubai')});
 assert.deepEqual(r.research.unresolved,[],'internal planning notes are not sent as "couldn’t confirm" items');assert.ok(Array.isArray(r.research.process.missing),'still kept for diagnostics');}
console.log('Web evidence: reworded searches, listing sites, own websites, leads checked against the regulator, conflicts stated, labelled sources, no-regulator city, early stop overruled, pilot search pool: passed');
