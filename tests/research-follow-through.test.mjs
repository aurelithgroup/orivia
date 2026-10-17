import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {planResearch} from '../workers/orivia-research-plan.mjs';
import {answerResearch} from '../workers/orivia-research.mjs';
import {offersYear,schoolContacts} from '../workers/orivia-school-actions.mjs';
const transcript=[];
const ask=(user,assistant,intent)=>{
 transcript.push({role:'user',content:user});
 const p=planResearch(transcript.slice(-12),{city:'Dubai, UAE'});
 assert.equal(p.needed,true,user);assert.equal(p.location.city,'Sharjah',user);
 assert.equal(p.parts[0].intent,intent,user);assert.equal(p.parts[0].curriculum,'british',user);
 if(user!=='find me British curriculumschools in sharjah')assert.equal(p.parts[0].year,6,user);
 if(assistant)transcript.push({role:'assistant',content:assistant});return p;
};
ask('find me British curriculumschools in sharjah',"To find British curriculum schools in Sharjah, what age range?",'discovery');
ask('year 6','For Year 6, British curriculum schools in Sharjah. Would you like British accreditation?','discovery');
ask('all','I’ll find British curriculum schools in Sharjah for Year 6. Would you like more options?','discovery');
ask('yes please more info','These British-curriculum schools in Sharjah list FS1 to Year 13.','discovery');
ask('so what do i do now?','For these British curriculum schools in Sharjah, would you like me to find their contact information?','next-steps');
const contacts=ask('yes please',null,'contacts');
// Even once the initial destination turn has left the 12-message window, its referent remains in the active task.
const rolling=planResearch([{role:'assistant',content:'British curriculum schools in Sharjah: would you like their contact information?'},{role:'user',content:'year 6'},{role:'assistant',content:'For British curriculum schools in Sharjah, would you like their contact information?'},{role:'user',content:'yes please'}],{city:'Dubai, UAE'});
assert.equal(rolling.parts[0].intent,'contacts');assert.equal(rolling.location.city,'Sharjah');assert.equal(rolling.parts[0].year,6);
assert.equal(planResearch([...transcript,{role:'user',content:'Actually I need a bank account in London'}],{}).parts[0].topic,'bank');
assert.equal(planResearch([...transcript,{role:'user',content:'Actually find American curriculum schools in Dubai for year 4'}],{}).parts[0].curriculum,'american');
assert.equal(planResearch([...transcript,{role:'user',content:'Actually find American curriculum schools in Dubai for year 4'}],{}).parts[0].year,4);
assert.equal(offersYear('FS1, FS2, 1, 2, 6, 13',6),true);
assert.equal(offersYear('FS1, 1, 13',6),false,'do not infer intermediate years from a range');
assert.equal(offersYear('',6),false,'unknown year provision is not a match');
const raw=readFileSync(new URL('./fixtures/spea-current-profile.html',import.meta.url),'utf8');
const directory=readFileSync(new URL('./fixtures/spea-current-directory.html',import.meta.url),'utf8');
const contactHTML=readFileSync(new URL('./fixtures/spea-school-contact-section.html',import.meta.url),'utf8');
assert.deepEqual(schoolContacts('Phone Number 061111111 Email info@spea.shj.ae'),{phone:'',email:''},'no generic authority contact');
const run=async(part,year=6)=>answerResearch({...contacts,parts:[{...contacts.parts[0],intent:part,year}],queries:[{...contacts.queries[0],part:{...contacts.parts[0],intent:part,year}}]}, {BRAVE_SEARCH_API_KEY:'fixture'}, {reserve:async()=>true,fetcher:async u=>{
 const url=String(u);
 if(url.startsWith('https://api.search.brave.com/'))return new Response(JSON.stringify({web:{results:[]}}));
 if(url.endsWith('/schools'))return new Response(directory,{headers:{'content-type':'text/html'}});
 if(url.endsWith('/wes-green-int-pvt-school-llc'))return new Response(raw.slice(0,raw.indexOf('School Location'))+contactHTML,{headers:{'content-type':'text/html'}});
 return new Response('',{status:404});
}});
const c=await run('contacts');assert.equal(c.research.status,'evidence-found');assert.match(c.reply,/Phone: 065062999/);assert.match(c.reply,/Email: wesgreenintl-psch@spea.shj.ae/);assert.doesNotMatch(c.reply,/These .*schools are listed/);assert.doesNotMatch(c.reply,/info@spea/);
const n=await run('next-steps');assert.match(n.reply,/next step.*admissions/);assert.match(n.reply,/Year 6/);
const missing=await run('discovery',9);assert.equal(missing.research.status,'evidence-found');
const unavailable=await run('discovery',14);assert.equal(unavailable.research.status,'no-evidence');
console.log('Research follow-through: typo, Year 6, all, next steps, accepted contacts, correction and explicit year matching passed');

// Exact natural follow-ups from Bee's live test, including a deictic find request.
const exact=[{role:'user',content:'Find British curriculum schools in Sharjah for Year 6.'},{role:'assistant',content:'These British curriculum schools in Sharjah list Year 6.'},{role:'user',content:'how can i contact them?'}];
assert.equal(planResearch(exact,{}).parts[0].intent,'contacts');
exact.push({role:'assistant',content:'You can contact the schools through their profiles or find their official websites.'},{role:'user',content:'can you find that for me'});
assert.equal(planResearch(exact,{}).parts[0].intent,'contacts');
assert.equal(c.cardMode,'choose');assert.equal(c.organisations[0].contacts.phone.value,'065062999');
assert.equal(c.organisations[0].contacts.email.value,'wesgreenintl-psch@spea.shj.ae');
assert.equal(c.organisations[0].facts.find(f=>f.key==='year').value,'Year 6 listed');
assert.match(c.organisations[0].facts.find(f=>f.key==='year').quote,/6/);
assert.equal(c.organisations[0].contacts.directions.url,'https://goo.gl/maps/5s3CsgSov2Q2');
console.log('Real backend organisation cards and natural contact follow-ups: passed');
