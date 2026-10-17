/* Research loop: the Sharjah conversation as a regression, then other places, organisations, wording and follow-ups.
   SPEA pages: Ina's verbatim captures + reconstructed page 1 (see docs/spea-reader.md). Everything named [Synthetic] or
   on a .example host is invented. Model output is simulated; the real validators and fallbacks run.
   Run: node tests/research-loop.test.mjs */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runResearchTurn,makeTools,leadNames,sanitizeTask,maybeResearch,LOOP_LIMITS,regulatorFor} from '../workers/orivia-research-loop.mjs';
import {understandRequest,validateUnderstanding,ruleUnderstanding,safeQuery} from '../workers/orivia-research-understand.mjs';
import {SPEA_DIRECTORY} from '../workers/orivia-spea-reader.mjs';
const fx=f=>readFileSync(new URL('./fixtures/'+f,import.meta.url),'utf8');
const P='https://spea.shj.ae/en/education-institutes/schools/';
const synth=(name,curr,grades,{phone='060000000',email='',web='',area='Sharjah - Synthetic Area'}={})=>`<h2>${name}</h2><span>Curriculum: ${curr}</span><span>Grade: ${grades}</span>${web?`<a href="${web}"><span>Website</span><span class="sr-only"> (Opens in a new tab)</span></a>`:''}<div><span>School Location</span><a href="https://goo.gl/maps/SYNTH">${area}<span class="sr-only"> (Opens in a new tab)</span></a></div><div><span>Phone Number</span><a href="tel:${phone}"><span>${phone}</span></a></div>${email?`<div><span>Email</span><a href="mailto:${email}">${email}</a></div>`:''}`;
const FULL='FS1 | FS2 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13';
// SPEA: page 1 has only Wes Green and Victoria English as British. Search finds 14 more British + some others.
const TREES=['Alder','Birch','Cedarwood','Damson','Elm','Fir','Ginkgo','Hazel','Ivy','Juniper','Kauri','Larch','Maple','Nutmeg'];
const extraBritish=TREES.map((t,i)=>['synthetic-british-'+i,'[Synthetic] '+t+' British School']);
const SPEA={[SPEA_DIRECTORY]:fx('spea-directory-page1.html'),[P+'wes-green-int-pvt-school-llc']:fx('spea-profile-wesgreen-full.html'),[P+'victoria-english-pvt-school-llc']:fx('spea-profile-victoria-english.html'),
 [P+'synthetic-indian-x']:synth('[Synthetic] Indian School X','Indian','1 | 2 | 3'),[P+'synthetic-cedar-british']:synth('Synthetic Cedar British School','British',FULL)};
for(const [slug,name] of extraBritish)SPEA[P+slug]=synth(name,'British',FULL);
const LIST_PAGE=`<html><head><title>[Synthetic] Best British schools in Sharjah</title></head><body><h1>Best British schools in Sharjah</h1><ol>
<li><h3>1. Wes Green International School</h3></li><li><h3>2. Synthetic Cedar British School</h3></li><li><h3>3. Synthetic Palm Academy</h3></li><li><strong>Best School</strong></li></ol></body></html>`;
function world({spea={},sites={},webResults={},budget=20,speaIndex=null}={}){
 const pages={...SPEA,...spea},calls=[],queries=[];
 const index=speaIndex||[...extraBritish.map(([s,n])=>({url:P+s,title:n+' | SPEA'})),{url:P+'synthetic-indian-x',title:'[Synthetic] Indian School X'},{url:'https://spea.shj.ae/en/educational-institutions/schools/private-school-of-scientific-innovation',title:'Website is currently under development'}];
 const fetcher=async(u,init)=>{const url=String(u);calls.push(url);
  if(url.startsWith('https://api.search.brave.com/')){const sp=new URL(url).searchParams,q=sp.get('q'),off=+sp.get('offset');queries.push({q,offset:off});
   let results=[],more=false;
   if(/site:spea\.shj\.ae/.test(q)){
    if(/ OR /.test(q)){results=/Cedar/.test(q)?[{url:P+'synthetic-cedar-british',title:'Synthetic Cedar British School'}]:[]}
    else if(/^"/.test(q)){const name=q.match(/^"([^"]+)"/)[1].toLowerCase();results=Object.entries(pages).filter(([k,v])=>k.startsWith(P)&&(v.match(/<h2[^>]*>([^<]+)/)?.[1]||'').toLowerCase().includes(name.split(' ')[0])).map(([k,v])=>({url:k,title:v.match(/<h2[^>]*>([^<]+)/)[1]}))}
    else{results=index.slice(off*8,off*8+8);more=off*8+8<index.length}
   }else{for(const [k,v] of Object.entries(webResults))if(q.toLowerCase().includes(k))results=v}
   return new Response(JSON.stringify({query:{more_results_available:more},web:{results:results.map(r=>({url:r.url,title:r.title,description:r.snippet||''}))}}),{headers:{'content-type':'application/json'}})}
  assert.equal(init.redirect,'manual');
  if(pages[url]!==undefined)return new Response(pages[url],{headers:{'content-type':'text/html'}});
  const s=sites[url];if(s===undefined)return new Response('nope',{status:404,headers:{'content-type':'text/html'}});
  if(s.redirect)return new Response('',{status:301,headers:{location:s.redirect}});
  return new Response(s,{headers:{'content-type':'text/html'}});};
 let left=budget;const reserve=async()=>left-->0;
 return {calls,queries,opts:{fetcher,reserve},env:{BRAVE_SEARCH_API_KEY:'secret-key'}};
}
const U=(intent,extra={})=>({source:'test',research:true,intent,topic:'school',location:{country:'uae',city:'Sharjah'},constraints:{curriculum:'british',year:null},organisations:[],correction:'',question:'',searches:[],...extra});
const conv=[];const say=t=>{conv.push({role:'user',content:t});return conv.slice()};const heard=r=>{if(process.env.SHOW)console.log('\n=== '+conv.at(-1).content+'\n'+r.reply.split('\n\n[1]')[0]);conv.push({role:'assistant',content:r.reply.slice(0,600)});return r.research.taskContext};
const urls=r=>r.liveSources.map(s=>s.url);

/* =================== The Sharjah conversation (regression) =================== */
const w=world({webResults:{'list of british':[{url:'https://www.bayut.com/mybayut/best-british-schools-sharjah',title:'Best British schools in Sharjah'}]},sites:{'https://www.bayut.com/mybayut/best-british-schools-sharjah':LIST_PAGE}});
w.opts.fetcher=(f=>async(u,i)=>String(u)==='https://www.bayut.com/mybayut/best-british-schools-sharjah'?new Response(LIST_PAGE,{headers:{'content-type':'text/html'}}):f(u,i))(w.opts.fetcher);
// 1. Find
let r=await runResearchTurn({messages:say('Find British curriculum schools in Sharjah')},w.env,{...w.opts,understanding:U('find')});
let ctx=heard(r);
assert.ok(r.research.claims.length>=2);assert.match(r.reply,/Wes green/);assert.match(r.reply,/Victoria English/);
assert.match(r.reply,/SPEA lists about 136 private schools in Sharjah/);assert.match(r.reply,/isn’t the full list/);
assert.ok(r.research.claims.every(c=>c.quotes.every(q=>q.quote)),'every listed school has quoted facts');
assert.ok(urls(r).every(u=>u.startsWith('https://spea.shj.ae/')),'list facts come from the regulator');
assert.equal(r.research.coverage.complete,false);assert.ok(r.organisations.length>=2);
const firstShown=new Set(ctx.task.shown.map(s=>s.url));
// 2. "only two?" → more, never the same ones
r=await runResearchTurn({messages:say('only two?'),context:ctx},w.env,{...w.opts,understanding:U('more')});
let moreUrls=urls(r);
assert.ok(moreUrls.length>=1);assert.ok(moreUrls.every(u=>!firstShown.has(u)),'no repeats');
assert.match(r.reply,/more British-curriculum schools I could confirm on SPEA, not including the ones I already showed you/);
assert.match(r.reply,/Larch British School/,'every new school is listed (none merged by a fuzzy name)');
assert.ok(r.research.coverage.searches.some(s=>s.kind==='web'),'went wider than the regulator search');
assert.ok(r.research.coverage.leadsFound>=2,'names from a listing page were used as leads');
assert.ok(r.research.coverage.searches.some(s=>s.kind==='regulator-check-leads'),'leads checked against SPEA in one search');
assert.match(r.reply,/Synthetic Cedar British School/,'a lead confirmed on SPEA is listed with SPEA facts');
assert.match(r.reply,/Synthetic Palm Academy/,'an unconfirmed lead is named as unchecked, not as a fact');
assert.ok(!r.liveSources.some(s=>s.url.includes('bayut')),'a listing site is never a cited source');
ctx=heard(r);
// 3. "I want all of them" → pages further, still no repeats, honest coverage
const before=new Set(ctx.task.shown.map(s=>s.url));
r=await runResearchTurn({messages:say('I want all of them'),context:ctx},w.env,{...w.opts,understanding:U('all')});
assert.ok(urls(r).every(u=>!before.has(u)));
assert.ok(r.research.coverage.searchesUsed<=LOOP_LIMITS.searchesPerTurn);assert.ok(r.research.coverage.searches.filter(s=>s.kind==='regulator').length>=2,'all → paged further');
assert.match(r.reply,/I’ve confirmed \d+ so far, so this isn’t the full list/);
ctx=heard(r);
// 4. Named school not on the regulator pages checked: no substitution, no guessed curriculum
r=await runResearchTurn({messages:say('have you heard of Sharjah International Private School?'),context:ctx},w.env,{...w.opts,understanding:U('check',{organisations:[{name:'Sharjah International Private School',url:''}]})});
assert.match(r.reply,/didn’t find “Sharjah International Private School”/);assert.doesNotMatch(r.reply,/American|Victoria|Wes green/);
assert.equal(r.research.claims.length,0);
ctx=heard(r);
// 5. Correction → check the corrected school: SPEA identity + its own site via SPEA's link
w.opts.fetcher=(f=>async(u,i)=>String(u)==='https://victoriaenglishschools.com/'?new Response('<title>Victoria English School</title><p>[Synthetic] We follow the National Curriculum for England from FS1 to Year 13.</p>',{headers:{'content-type':'text/html'}}):f(u,i))(w.opts.fetcher);
r=await runResearchTurn({messages:say('no, I meant Victoria English'),context:ctx},w.env,{...w.opts,understanding:U('check',{organisations:[{name:'Victoria English',url:''}],correction:'no, I meant Victoria English'})});
assert.match(r.reply,/SPEA lists Victoria English Pvt\. School LLC: British curriculum/);
assert.match(r.reply,/Its own website \(linked from the regulator\) says:\nCurriculum: British/);
assert.ok(r.liveSources.some(s=>s.category==='organisation'&&s.url.startsWith('https://victoriaenglishschools.com')));
assert.equal(r.cardMode,'single');ctx=heard(r);assert.equal(ctx.task.focus,'Victoria English Pvt. School LLC');
// 6. "how can I contact them?" → contact research for the school in focus, not the original list
r=await runResearchTurn({messages:say('how can I contact them?'),context:ctx},w.env,{...w.opts,understanding:U('contacts',{organisations:[{name:'Victoria English Pvt. School LLC',url:''}]})});
assert.match(r.reply,/SPEA lists these contacts for Victoria English Pvt\. School LLC: 065227770, victoriaenglish-psch@spea\.shj\.ae/);
assert.equal(r.cardMode,'choose');assert.doesNotMatch(r.reply,/Wes green/);
// 7. Compare two named schools
r=await runResearchTurn({messages:say('compare Wes Green and Victoria English')},w.env,{...w.opts,understanding:U('compare',{organisations:[{name:'Wesgreen',url:''},{name:'Victoria English',url:''}]})});
assert.match(r.reply,/Wes green Int\. Pvt\. School\. LLC: British curriculum/);assert.match(r.reply,/Victoria English Pvt\. School LLC: British curriculum/);

/* =================== The live case with an exact SPEA listing (synthetic) =================== */
{
 const w2=world({spea:{[P+'sharjah-international-private-school']:synth('Sharjah International Private School','[Synthetic test value]',FULL,{phone:'065586624'})},
  webResults:{'"sharjah international private school"':[{url:'https://ae.linkedin.com/in/sips-ae',title:'SIPS'},{url:'https://sips.example/',title:'Sharjah International Private School'}]},
  sites:{'https://sips.example/':'<title>Sharjah International Private School</title><p>[Synthetic] Call +971 6 558 6624.</p><a href="/admissions">Admissions</a>','https://sips.example/admissions':'<h1>Admissions</h1><a href="mailto:admissions@sips.example">Email admissions</a>'}});
 const r2=await runResearchTurn({messages:[{role:'user',content:'Sharjah International Private School'}]},w2.env,{...w2.opts,understanding:U('check',{constraints:{curriculum:'',year:null},organisations:[{name:'Sharjah International Private School',url:''}]})});
 assert.match(r2.reply,/SPEA lists Sharjah International Private School: \[Synthetic test value\] curriculum/,'the curriculum comes from the listing, never assumed');
 assert.match(r2.reply,/linked from the regulator\) says:[\s\S]*Email: admissions@sips\.example/,'site proven by the SPEA-listed phone, then read');
 assert.ok(!w2.calls.some(c=>c.includes('linkedin')));
 assert.equal(r2.research.coverage.siteChecks[0].basis,'contact-match');
}

/* =================== Other places, organisations and wording =================== */
// Dubai: no regulator connected → web discovery + own sites, said plainly, completeness not claimed
{
 const w3=world({webResults:{'british curriculum schools dubai':[{url:'https://www.cedar-dubai.example/',title:'[Synthetic] Cedar British School Dubai'},{url:'https://www.whichschooladvisor.com/uae/dubai',title:'Best British schools in Dubai'}]},
  sites:{'https://www.cedar-dubai.example/':'<title>[Synthetic] Cedar British School Dubai</title><p>[Synthetic] We offer the National Curriculum for England from FS1 to Year 13.</p>','https://www.whichschooladvisor.com/uae/dubai':'<h3>Synthetic Oak School</h3>'}});
 const r3=await runResearchTurn({messages:[{role:'user',content:'British schools in Dubai?'}]},w3.env,{...w3.opts,understanding:U('find',{location:{country:'uae',city:'Dubai'}})});
 assert.equal(regulatorFor('school',{country:'uae',city:'Dubai'}),null);
 assert.match(r3.reply,/can’t check schools in Dubai against a regulator yet/);assert.match(r3.reply,/ownership not confirmed/);
 assert.match(r3.reply,/Synthetic Oak School/);assert.match(r3.reply,/can’t tell how complete this is/);
 assert.ok(r3.liveSources.every(s=>s.category==='organisation'));assert.ok(!w3.calls.some(c=>c.includes('spea.shj.ae')));
}
// A link the person gave is read without a regulator profile, and labelled as the organisation's own statements
{
 const w4=world({sites:{'https://www.bank.example/accounts':'<title>[Synthetic] Example Bank</title><p>Call us</p><a href="tel:+97143334444">+971 4 333 4444</a> <a href="/contact">Contact</a>','https://www.bank.example/contact':'<a href="mailto:help@bank.example">Email us</a>'}});
 const r4=await runResearchTurn({messages:[{role:'user',content:'can you check https://www.bank.example/accounts for me'}]},w4.env,{...w4.opts,understanding:{...U('check',{topic:'bank',location:{country:'uae',city:'Dubai'},constraints:{curriculum:'',year:null}}),organisations:[{name:'',url:'https://www.bank.example/accounts'}]}});
 assert.match(r4.reply,/The website you shared says:[\s\S]*Phone: \+97143334444[\s\S]*Email: help@bank\.example/);
 assert.match(r4.reply,/nothing below is regulatory confirmation/);assert.ok(r4.liveSources.every(s=>s.category==='organisation'));
}
// Contacts for "them" after a list: contacts for the schools shown, from the regulator
{
 const w5=world();const t=sanitizeTask({intent:'find',topic:'school',location:{country:'uae',city:'Sharjah'},constraints:{curriculum:'british'},shown:[{name:'Wes green Int. Pvt. School. LLC',url:P+'wes-green-int-pvt-school-llc',level:'regulator'},{name:'Victoria English Pvt. School LLC',url:P+'victoria-english-pvt-school-llc',level:'regulator'}]});
 const r5=await runResearchTurn({messages:[{role:'user',content:'how do I contact them?'}],context:{task:t}},w5.env,{...w5.opts,understanding:U('contacts')});
 assert.match(r5.reply,/contacts SPEA lists for the schools I showed you/);assert.match(r5.reply,/065062999/);assert.match(r5.reply,/065227770/);
 assert.equal(w5.queries.length,0,'no search needed: re-read the regulator pages already found');
}
// Rules questions stay on the existing official-sources path; no location → one question
assert.equal(await runResearchTurn({messages:[{role:'user',content:'what documents do I need for a residence visa?'}]},{},{understanding:U('rules',{topic:'government-service'})}),null);
r=await runResearchTurn({messages:[{role:'user',content:'find British schools'}]},{BRAVE_SEARCH_API_KEY:'k'},{understanding:U('find',{location:{country:null,city:''}}),reserve:async()=>true});
assert.equal(r.reply,'Which city is this for?');
// Spending: no budget → no search calls, honest status
{
 const w6=world({budget:0});const r6=await runResearchTurn({messages:[{role:'user',content:'British schools in Sharjah'}]},w6.env,{...w6.opts,understanding:U('find')});
 assert.equal(w6.queries.length,0);assert.ok(r6.research.coverage.searches.every(s=>s.status==='search-limit'));assert.match(r6.reply,/isn’t the full list/);
}
// Per-turn tool limits are enforced in code
{
 const w7=world();const tools=makeTools({env:w7.env,...w7.opts});
 for(let i=0;i<6;i++)await tools.search('x');assert.equal(tools.used.searches,LOOP_LIMITS.searchesPerTurn);
 assert.equal((await tools.fetchPage('https://127.0.0.1/',{kind:'discovery'})).reason,'not-allowed');
 assert.equal((await tools.fetchPage('https://www.bayut.com/x',{kind:'regulator'})).reason,'not-allowed');
 assert.equal((await tools.fetchPage('https://u.ae/en',{kind:'discovery'})).reason,'not-allowed');
 assert.equal((await tools.fetchPage('https://other.example/',{kind:'site',host:'mine.example'})).reason,'not-allowed');
}

/* =================== Understanding: model proposals are checked against the chat =================== */
const msgs=[{role:'user',content:'Find British curriculum schools in Sharjah'},{role:'assistant',content:'Wes green Int. Pvt. School. LLC and Victoria English Pvt. School LLC.'},{role:'user',content:'what about Victoria English? my son is in year 6, call me on 0501234567'}];
let v=validateUnderstanding(JSON.stringify({intent:'check',topic:'school',location:{country:'uae',city:'Sharjah'},constraints:{curriculum:'british',year:6},organisations:[{name:'Victoria English',url:''},{name:'Hogwarts School',url:'https://hogwarts.example'}],searches:['Victoria English school Sharjah 0501234567 my son is in year 6']}),{messages:msgs});
assert.deepEqual(v.organisations,[{name:'Victoria English',url:''}],'invented names and links are dropped');
assert.equal(v.constraints.year,6);assert.equal(v.location.city,'Sharjah');
assert.ok(!/\d{6}/.test(v.searches[0])&&!/my son/i.test(v.searches[0]),'personal details stripped from searches');
assert.equal(validateUnderstanding('{"intent":"teleport"}',{messages:msgs}),null);
assert.equal(validateUnderstanding(JSON.stringify({intent:'find',topic:'school',location:{city:'Atlantis'}}),{messages:msgs}).location.city,'Sharjah','a place not in the chat is ignored');
v=await understandRequest({messages:msgs},{ai:{run:async()=>({response:'```json\n{"intent":"check","topic":"school","organisations":[{"name":"Victoria English"}],"location":{"city":"Sharjah"}}\n```'})}});
assert.equal(v.source,'model');assert.equal(v.intent,'check');
v=await understandRequest({messages:msgs},{ai:{run:async()=>{throw Error('down')}}});
assert.equal(v.source,'rules');assert.equal(v.intent,'check','rules fallback still reads a named check');
// Rule fallback across wording
const R=t=>ruleUnderstanding({messages:[{role:'user',content:t}],task:{topic:'school',location:{country:'uae',city:'Sharjah'},constraints:{curriculum:'british'},focus:'Victoria English Pvt. School LLC'}});
assert.equal(R('only two?').intent,'more');assert.equal(R('is that all?').intent,'more');assert.equal(R('keep going').intent,'more');
assert.equal(R('I want all of them').intent,'all');assert.equal(R('show me every British school').intent,'all');
assert.equal(R('how can I reach them').intent,'contacts');assert.equal(R('how can I reach them').organisations[0].name,'Victoria English Pvt. School LLC');
assert.equal(R('compare Wes Green School and Victoria English School').intent,'compare');
assert.equal(R('what about Our Own English High School?').intent,'check');
assert.equal(R('find nurseries in Ajman').topic,'nursery');assert.equal(R('find nurseries in Ajman').location.city,'Ajman');
assert.equal(R('British schools in London please, find some').location.country,'uk');
assert.equal(R('tell me a joke').research,false);
assert.equal(safeQuery('school near me email a@b.com phone +971 50 123 4567'),'school near me email phone');
assert.ok(maybeResearch([{role:'user',content:'any good nurseries?'}],null));assert.ok(!maybeResearch([{role:'user',content:'how are you?'}],null));
assert.deepEqual(leadNames(LIST_PAGE),['Wes Green International School','Synthetic Cedar British School','Synthetic Palm Academy']);
assert.equal(sanitizeTask({shown:[{name:'x',url:'javascript:alert(1)'}],cursor:{pending:['https://evil.example/x']}}).shown.length,0);
console.log('Research loop: Sharjah conversation (find → more → all → named check → correction → contacts → compare), exact listing + proven site, Dubai without regulator, user link, list contacts, rules fallback, budgets, tool limits, model validation and wording: passed');
