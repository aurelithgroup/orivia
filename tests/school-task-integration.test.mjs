import assert from 'node:assert/strict';
import fs from 'node:fs';
import {planResearch} from '../workers/orivia-research-plan.mjs';
import {answerResearch} from '../workers/orivia-research.mjs';
import {schoolTaskContext} from '../workers/orivia-school-task.mjs';
const dir=fs.readFileSync('tests/fixtures/spea-current-directory.html','utf8');
const profile=fs.readFileSync('tests/fixtures/spea-profile-wesgreen-full.html','utf8');
const victoria=fs.readFileSync('tests/fixtures/spea-profile-victoria-english.html','utf8');
const root='https://spea.shj.ae/en/education-institutes/schools/';
const third=root+'synthetic-new-school',named=root+'synthetic-sharjah-international';
const page=(name,curriculum)=>'<h2>'+name+'</h2><span>Curriculum: '+curriculum+'</span><span>Grade: 5 | 6 | 7</span><div>School Location Sharjah - Al Azra Phone Number 061234567 Email test@example.test Apply for a service</div>';
let phase='initial';const opened=[],queries=[];
const fetcher=async (u,init)=>{
 const url=String(u);opened.push(url);
 if(url.startsWith('https://api.search.brave.com/')){
  queries.push(new URL(url).searchParams.get('q'));
  return new Response(JSON.stringify({web:{results:phase==='initial'?[]:[{url:phase==='named'?named:third}]}}));
 }
 if(url===root.slice(0,-1))return new Response(dir,{headers:{'content-type':'text/html'}});
 const html=url===third?page('[Synthetic] New British School','British'):url===named?page('Sharjah International Private School','American'):url.endsWith('/wes-green-int-pvt-school-llc')?profile:url.endsWith('/victoria-english-pvt-school-llc')?victoria:null;
 return new Response(html||'',{status:html?200:404,headers:{'content-type':'text/html'}});
};
const env={BRAVE_SEARCH_API_KEY:'fixture'};
let history=[{role:'user',content:'Find British curriculum schools in Sharjah for Year 6.'}];
const initial=await answerResearch(planResearch(history,{}),env,{fetcher,reserve:async()=>true});
assert.equal(initial.organisations.length,2);
const state=initial.research.taskContext;
assert.equal(state.shown.length,2);assert.equal(state.year,6);
history.push({role:'assistant',content:initial.reply},{role:'user',content:'are those the only two?'});
phase='expand';const morePlan=planResearch(history,{},state);assert.equal(morePlan.parts[0].intent,'expand');
const before=opened.length;
const more=await answerResearch(morePlan,env,{fetcher,reserve:async()=>true});
assert.equal(more.organisations.length,1);assert.match(more.reply,/not a complete list/);assert.match(more.reply,/additional/);
assert.equal(more.liveSources[0].url,third);assert.ok(!opened.slice(before).some(u=>state.shown.includes(u)),'already-shown profiles not reopened as new results');
// A named-school check must not silently apply the old British filter or repeat other schools.
phase='named';history.push({role:'assistant',content:more.reply},{role:'user',content:'i heard about sharjah international private school. they have a british curriculum no?'});
const namedPlan=planResearch(history,{},more.research.taskContext);
assert.equal(namedPlan.parts[0].intent,'lookup');assert.equal(namedPlan.parts[0].targetName,'sharjah international private school');
const checked=await answerResearch(namedPlan,env,{fetcher,reserve:async()=>true});
assert.equal(checked.cardMode,'single');assert.equal(checked.organisations[0].name,'Sharjah International Private School');
assert.match(checked.reply,/American curriculum, which does not match/);assert.doesNotMatch(checked.reply,/These 2 British/);
assert.ok(queries.at(-1).includes('"sharjah international private school"'));
// Accepted contact request refers to that named school, not the original shortlist.
const contactPlan=planResearch([{role:'assistant',content:checked.reply},{role:'user',content:'how can i contact them?'}],{},checked.research.taskContext);
const contact=await answerResearch(contactPlan,env,{fetcher,reserve:async()=>true});
assert.equal(contact.organisations[0].name,'Sharjah International Private School');assert.equal(contact.cardMode,'choose');
// Invalid continuation links cannot widen the source policy.
const hostile=schoolTaskContext({city:'Sharjah',shown:['https://evil.test/x'],cursor:{skipDirectory:true,pending:['https://127.0.0.1/private'],searchOffset:999}});
assert.deepEqual(hostile.shown,[]);assert.deepEqual(hostile.cursor.pending,[]);assert.equal(hostile.cursor.searchOffset,10);
const bank=planResearch([{role:'user',content:'I need a bank account'}],{city:'Dubai, UAE'},state);assert.equal(bank.location.city,'Dubai');
console.log('School task integration: expand without repeats, named lookup with contradictory evidence, named contacts, state bounds and topic change passed');

// Exact follow-ups from the failed live session must not replay discovery.
for(const text of ['i want all of them','can you just list me every single school with a british curriculum in sharjah','list all British curriculum schools in Sharjah']){
 const p=planResearch([{role:'user',content:text}],{},state);
 assert.equal(p.parts[0].intent,'expand',text);
 assert.equal(p.parts[0].year,6);
}
for(const text of ['SHARJAH INTERNATIONAL PRIVATE SCHOOL','Sharjah International Private School']){
 const p=planResearch([{role:'user',content:text}],{},state);
 assert.equal(p.parts[0].intent,'lookup',text);
 assert.equal(p.parts[0].targetName,'sharjah international private school');
}
assert.equal(planResearch([{role:'user',content:'Find British curriculum schools in Sharjah'}],{}).parts[0].intent,'discovery');
