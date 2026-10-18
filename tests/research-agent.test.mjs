/* Research agent: the whole decide → act → inspect → decide-again process, not just the readers.
   Scenario 1 replays Ina's case study ("all British-curriculum schools in Sharjah"). Model choices are scripted (or the model
   is unavailable) so the controller, validation, completeness and answer are what's under test. Pages are SPEA captures,
   reconstructions or [Synthetic]/.example inventions. Run: node tests/research-agent.test.mjs */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runAgentTurn,validateAction,ACTIONS,CLAIM_SOURCES,AGENT_LIMITS} from '../workers/orivia-research-agent.mjs';
import {REGULATORS,LEVEL} from '../workers/orivia-research-loop.mjs';
import {SPEA_DIRECTORY} from '../workers/orivia-spea-reader.mjs';
const fx=f=>readFileSync(new URL('./fixtures/'+f,import.meta.url),'utf8');
const P='https://spea.shj.ae/en/education-institutes/schools/',OLD='https://spea.shj.ae/en/educational-institutions/schools/';
const synth=(name,curr,grades,{phone='060000000',area='Sharjah - Synthetic Area',web=''}={})=>`<h2>${name}</h2><span>Curriculum: ${curr}</span><span>Grade: ${grades}</span>${web?`<a href="${web}"><span>Website</span><span class="sr-only"> (Opens in a new tab)</span></a>`:''}<div><span>School Location</span><a href="https://goo.gl/maps/SYNTH">${area}<span class="sr-only"> (Opens in a new tab)</span></a></div><div><span>Phone Number</span><a href="tel:${phone}"><span>${phone}</span></a></div>`;
const FULL='FS1 | FS2 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13';
const TREES=['Alder','Birch','Cedarwood','Damson','Elm','Fir','Ginkgo','Hazel','Ivy','Juniper','Kauri','Larch','Maple','Nutmeg','Olive','Pine','Quince','Rowan','Spruce','Teak','Umbrella','Viburnum','Willow','Yew','Zelkova'];
const BRITISH=[...TREES.map((t,i)=>({name:'[Synthetic] '+t+' British School',url:P+'synthetic-british-'+i,area:i===24?'Eastern Region - Kalba':'Sharjah - Synthetic Area'})),{name:'Wes green Int. Pvt. School. LLC',url:P+'wes-green-int-pvt-school-llc'},{name:'Victoria English Pvt. School LLC',url:P+'victoria-english-pvt-school-llc'}];
const pages={[SPEA_DIRECTORY]:fx('spea-directory-page1.html'),[P+'wes-green-int-pvt-school-llc']:fx('spea-profile-wesgreen-full.html'),[P+'victoria-english-pvt-school-llc']:fx('spea-profile-victoria-english.html')};
for(const b of BRITISH.slice(0,25))pages[b.url]=synth(b.name,'British',FULL,{area:b.area});
const LIST=`<title>28 British schools in Sharjah [Synthetic directory]</title><h1>28 British schools in Sharjah</h1><ol><li><h3>[Synthetic] Alder British School</h3></li><li><h3>[Synthetic] Birch British School</h3></li><li><h3>Synthetic Dual Pathway School</h3></li></ol>`;
function world({web={},sites={},budget=10,spea={}}={}){
 const all={...pages,...spea},calls=[],queries=[];
 const fetcher=async(u,init)=>{const url=String(u);calls.push(url);
  if(url.startsWith('https://api.search.brave.com/')){const q=new URL(url).searchParams.get('q'),off=+new URL(url).searchParams.get('offset');queries.push(q);let results=[],more=false;
   if(/site:spea\.shj\.ae/.test(q)){if(/ OR /.test(q))results=[{url:P+'synthetic-british-0',title:'[Synthetic] Alder British School'},{url:P+'synthetic-british-1',title:'[Synthetic] Birch British School'}];
    else if(/^"/.test(q)){const n=q.match(/^"([^"]+)"/)[1].toLowerCase();results=Object.entries(all).filter(([k,v])=>k.startsWith(P)&&(v.match(/<h2[^>]*>([^<]+)/)?.[1]||'').toLowerCase().includes(n.split(' ')[0])).map(([k,v])=>({url:k,title:v.match(/<h2[^>]*>([^<]+)/)[1]}))}
    else{results=[{url:OLD+'106',title:'Shj. British Int .Pvt. School'},{url:OLD+'117',title:'Al Mawahib British Pvt. School'},...BRITISH.slice(2,8).map(b=>({url:b.url,title:b.name}))].slice(off*8,off*8+8);more=off===0}}
   else for(const [k,v] of Object.entries(web))if(q.toLowerCase().includes(k))results=v;
   return new Response(JSON.stringify({query:{more_results_available:more},web:{results:results.map(r=>({url:r.url,title:r.title,description:r.snippet||''}))}}),{headers:{'content-type':'application/json'}})}
  assert.equal(init.redirect,'manual');
  if(all[url]!==undefined)return new Response(all[url],{headers:{'content-type':'text/html'}});
  if(sites[url]!==undefined)return new Response(sites[url],{headers:{'content-type':'text/html'}});
  return new Response('Not found',{status:404,headers:{'content-type':'text/html'}})};
 let left=budget;return {calls,queries,opts:{fetcher,reserve:async()=>left-->0},env:{BRAVE_SEARCH_API_KEY:'k'}};
}
const U=(intent,extra={})=>({source:'test',research:true,intent,topic:'school',location:{country:'uae',city:'Sharjah'},constraints:{curriculum:'british',year:null},organisations:[],correction:'',question:'',...extra});
const script=steps=>{let i=0;const views=[];const fn=async v=>{views.push(v);return steps[i++]||{action:'answer'}};fn.views=views;return fn};
const spea=REGULATORS[0];
// What Ina did in a browser (British filter, rows per page raised): modelled as a regulator listing that supports a filter.
const speaWithFilter={...spea,listFiltered:async f=>f.curriculum==='british'?{status:'ok',filter:{curriculum:'british'},total:27,range:[1,27],items:BRITISH.map(b=>({name:b.name,url:b.url,fields:{curriculum:{value:'British',quote:'Curriculum::British'},area:{value:b.area,quote:'Area '+b.area}}}))}:{status:'unsupported'}};

/* ===== 1. Ina's case study: leads → broken old links → change route → complete filtered listing → finished check ===== */
{
 const w=world({web:{'list of british curriculum schools in sharjah':[{url:'https://www.bayut.com/x/british-sharjah',title:'28 British schools in Sharjah',snippet:'Our guide to 28 British schools in Sharjah'}]},sites:{'https://www.bayut.com/x/british-sharjah':LIST}});
 const planner=script([
  {action:'web_search',args:{purpose:'discover'},why:'Find out what sources exist'},
  {action:'read_list_page',args:{ids:['W1']},why:'The directory claims 28 schools: collect leads'},
  {action:'regulator_search',args:{by:'curriculum',offset:0},why:'Find SPEA records'},
  {action:'open_records',args:{ids:['R1','R2']},why:'Confirm on SPEA'},
  {action:'regulator_listing',args:{},why:'Search links are failing; use SPEA’s own filtered listing'}]);
 const r=await runAgentTurn({messages:[{role:'user',content:'all schools offering a British curriculum in Sharjah'}]},{...w.env,RESEARCH_AGENT_STEPS:'8'},{...w.opts,understanding:U('all'),planner,regulator:speaWithFilter});
 if(process.env.SHOW)console.log(r.reply.split('\n\n[1]')[0].split('\n\n').filter((x,i,arr)=>i<3||i>arr.length-7).join('\n\n'));
 const p=r.research.process.steps;
 assert.deepEqual(p.map(s=>s.action),['web_search','read_list_page','regulator_search','open_records','regulator_listing'],'the model chose each step');
 assert.ok(p.every(s=>s.by==='model'&&s.why),'each step records who chose it and why');
 assert.equal(r.research.coverage.complete,true,'complete only because the filtered listing was read in full');
 assert.match(r.reply,/That’s the complete list SPEA shows for the British filter: 27 of 27\./);
 assert.match(r.reply,/Schools teaching more than one curriculum may be classified under another curriculum/,'mixed-curriculum exception stated');
 assert.match(r.reply,/2 old SPEA links returned “not found”\. That’s a broken address, not evidence a school has closed\./);
 assert.match(r.reply,/includes schools outside Sharjah city/,'emirate vs city distinguished');
 assert.equal(r.research.claims.length,27);assert.ok(r.liveSources.every(s=>s.url.startsWith('https://spea.shj.ae/')),'classification only from the regulator');
 assert.match(r.reply,/Synthetic Dual Pathway School/,'a lead not on the British filter is named as unconfirmed, not dropped or added');
 const v=planner.views[2];assert.ok(!JSON.stringify(v).includes('https://'),'the model sees ids and names, never URLs');
 assert.ok(v.whatCountsAsAnswering[0].includes('complete regulator listing'));assert.ok(v.found.claimedCounts.some(c=>c.n===28),'the directory’s “28” is visible to the model as a claim to check');
}
/* ===== 2. Same goal, no filtered listing available, model down: the built-in policy follows the same method ===== */
{
 const w=world({web:{'list of british curriculum schools in sharjah':[{url:'https://www.bayut.com/x/british-sharjah',title:'28 British schools in Sharjah'}]},sites:{'https://www.bayut.com/x/british-sharjah':LIST}});
 const r=await runAgentTurn({messages:[{role:'user',content:'all British schools in Sharjah'}]},{...w.env,RESEARCH_AGENT_STEPS:'8',AI:{run:async()=>{throw Error('down')}}},{...w.opts,understanding:U('all')});
 const acts=r.research.process.steps.map(s=>s.action);
 assert.deepEqual(acts.slice(0,6),['regulator_listing','regulator_search','web_search','read_list_page','check_leads','open_records']);
 assert.ok(r.research.process.steps.every(s=>s.by==='policy'));
 assert.equal(r.research.coverage.complete,false);assert.match(r.reply,/isn’t the full list/);assert.doesNotMatch(r.reply,/complete list/);
 assert.match(r.reply,/mentions “28 British schools”\. That’s a lead, not a verified count\./);
 assert.ok(r.research.coverage.searchesUsed<=4);
}
/* ===== 3. Code rejects invalid model choices; the policy steps in ===== */
{
 const w=world();
 const planner=script([{action:'browse',args:{url:'https://evil.example'}},{action:'regulator_search',args:{by:'curriculum',offset:0}},{action:'open_records',args:{ids:['R999','https://spea.shj.ae/x']}},{action:'regulator_search',args:{by:'curriculum',offset:0}},{action:'open_site',args:{id:'https://evil.example/'}}]);
 const r=await runAgentTurn({messages:[{role:'user',content:'all British schools in Sharjah'}]},{...w.env,RESEARCH_AGENT_STEPS:'8'},{...w.opts,understanding:U('all'),planner});
 const errs=r.research.process.rejected.map(x=>x.error);
 assert.ok(errs.includes('unknown-action')&&errs.includes('no-valid-ids')&&errs.includes('already-done'),errs.join(','));
 assert.ok(errs.some(e=>['not-available-now','no-valid-ids'].includes(e)),'a URL in place of an id is refused');
 assert.ok(!w.calls.some(c=>c.includes('evil.example')));
 assert.ok(r.research.process.steps.some(s=>s.by==='policy'));
}
/* ===== 4. Named school + year: stops as soon as the evidence answers it ===== */
{
 const w=world();
 const r=await runAgentTurn({messages:[{role:'user',content:'does Victoria English have Year 6?'}]},w.env,{...w.opts,understanding:U('check',{constraints:{curriculum:'',year:6},organisations:[{name:'Victoria English',url:''}]})});
 const acts=r.research.process.steps.map(s=>s.action);
 assert.deepEqual(acts,['regulator_search','open_records'],'no extra steps once identity and Year 6 are established');
 assert.match(r.reply,/SPEA lists Victoria English Pvt\. School LLC: British curriculum, classes FS1 to Year 13/);
}
/* ===== 5. Named school not on the regulator: change route to its website; ownership and year stated honestly ===== */
{
 const w=world({web:{'"pearl example academy"':[{url:'https://pearl.example/',title:'Pearl Example Academy'}]},sites:{'https://pearl.example/':'<title>Pearl Example Academy</title><main><h1>Pearl Example Academy</h1><p>[Synthetic] We follow the National Curriculum for England.</p></main>'}});
 const r=await runAgentTurn({messages:[{role:'user',content:'does Pearl Example Academy have Year 6?'}]},w.env,{...w.opts,understanding:U('check',{constraints:{curriculum:'',year:6},organisations:[{name:'Pearl Example Academy',url:''}]})});
 assert.deepEqual(r.research.process.steps.map(s=>s.action),['regulator_search','web_search','open_site','answer'],'changes route to the website, then decides to answer');
 assert.match(r.reply,/I couldn’t confirm “Pearl Example Academy” on SPEA, so nothing here is regulatory confirmation/);
 assert.match(r.reply,/ownership not confirmed by a regulator\) says:\nCurriculum: British/);
 assert.match(r.reply,/I couldn’t confirm Year 6 on the \d+ pages? I read/);
}
/* ===== 6. No regulator (Dubai): discovery → listing page → a school site; completeness not claimed ===== */
{
 const w=world({web:{'list of british curriculum schools in dubai':[{url:'https://www.whichschooladvisor.com/dubai',title:'Best British schools in Dubai'},{url:'https://www.cedar-dubai.example/',title:'[Synthetic] Cedar British School Dubai'}]},
  sites:{'https://www.whichschooladvisor.com/dubai':'<h3>Synthetic Oak School</h3>','https://www.cedar-dubai.example/':'<title>[Synthetic] Cedar British School Dubai</title><main><h1>[Synthetic] Cedar British School Dubai</h1><p>We follow the National Curriculum for England from FS1 to Year 13.</p></main>'}});
 const r=await runAgentTurn({messages:[{role:'user',content:'all British schools in Dubai'}]},w.env,{...w.opts,understanding:U('all',{location:{country:'uae',city:'Dubai'}})});
 assert.ok(!r.research.process.steps.some(s=>/regulator|check_leads|open_records/.test(s.action)),'no regulator actions offered without a regulator');
 assert.match(r.reply,/without a regulator directory I can’t tell how complete it is/);assert.equal(r.research.coverage.complete,false);
}
/* ===== 7. Contacts follow-up uses the school in focus ===== */
{
 const w=world();
 const r=await runAgentTurn({messages:[{role:'user',content:'how can I contact them?'}],context:{task:{topic:'school',location:{country:'uae',city:'Sharjah'},constraints:{curriculum:'british'},focus:'Victoria English Pvt. School LLC',shown:[{name:'Victoria English Pvt. School LLC',url:P+'victoria-english-pvt-school-llc',level:'regulator'}]}}},w.env,{...w.opts,understanding:U('contacts')});
 assert.match(r.reply,/SPEA lists these contacts for Victoria English Pvt\. School LLC: 065227770/);assert.equal(r.cardMode,'choose');
}
/* ===== Rules that hold whatever the model says ===== */
assert.deepEqual(CLAIM_SOURCES.classification,[LEVEL.regulator],'only the regulator classifies');assert.ok(!CLAIM_SOURCES.classification.includes(LEVEL.lead));
assert.ok(Object.keys(ACTIONS).includes('answer'));assert.ok(AGENT_LIMITS.maxSteps<=8);
{ // the model can't exceed the search budget
 const w=world({budget:10});const r=await runAgentTurn({messages:[{role:'user',content:'all British schools in Sharjah'}]},{...w.env,RESEARCH_AGENT_STEPS:'8'},{...w.opts,understanding:U('all'),planner:script(Array(8).fill({action:'web_search',args:{purpose:'discover'}}))});
 assert.ok(r.research.coverage.searchesUsed<=4);assert.ok(w.queries.length<=4);
}
console.log('Research agent: Ina’s case study (model-chosen route, complete filtered listing, caveats), policy fallback, invalid choices rejected, early stop, change of route for an unlisted school, no-regulator honesty, contacts follow-up, budgets: passed');
