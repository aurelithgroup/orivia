/* SPEA reader: discovery beyond directory page 1, named-school lookup, coverage and failures.
   Fixtures: spea-current-directory.html, spea-current-profile.html, spea-school-contact-section.html are Ina's verbatim
   captures; spea-directory-page1.html and spea-profile-victoria-english.html are reconstructed from the rendered live page
   (see their header comments). Profiles built in this file are SYNTHETIC and say so in their names.
   Run: node tests/spea-reader.test.mjs */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseDirectory,parseProfile,discoverSpeaSchools,lookupSpeaSchool,speaDeps,nameScore,classifyMatches,listsYear,speaPage,SPEA_LIMITS,SPEA_DIRECTORY} from '../workers/orivia-spea-reader.mjs';
const fx=f=>readFileSync(new URL('./fixtures/'+f,import.meta.url),'utf8');
const plain=s=>s.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();

/* ---------- Parsers against captured pages ---------- */
let d=parseDirectory(fx('spea-current-directory.html'));
assert.deepEqual(d.cards.map(c=>[c.name,c.curriculum]),[['Wes green Int. Pvt. School. LLC','British'],['Victoria English Pvt. School LLC','British']],'verbatim capture');
assert.equal(d.cards[0].url,'https://spea.shj.ae/en/education-institutes/schools/wes-green-int-pvt-school-llc');
d=parseDirectory(fx('spea-directory-page1.html'));
assert.equal(d.cards.length,10);assert.equal(d.total,136);assert.equal(d.to,10);
assert.deepEqual(d.cards.filter(c=>c.curriculum==='British').map(c=>c.name),['Wes green Int. Pvt. School. LLC','Victoria English Pvt. School LLC'],'why Orivia kept returning the same two: page 1 has only these British schools');

let p=parseProfile(fx('spea-profile-wesgreen-full.html'));const wtext=plain(fx('spea-profile-wesgreen-full.html'));
assert.equal(p.name,'Wes green Int. Pvt. School. LLC');assert.ok(p.readable);
assert.deepEqual(Object.fromEntries(Object.entries(p.fields).map(([k,v])=>[k,v.value||v.url])),{curriculum:'British',grades:'FS1 | FS2 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13',area:'Sharjah - Muwaileh',directions:'https://goo.gl/maps/5s3CsgSov2Q2',phone:'065062999',email:'wesgreenintl-psch@spea.shj.ae'});
for(const f of Object.values(p.fields))assert.ok(wtext.includes(f.quote),'quote is verbatim: '+f.quote);
p=parseProfile(fx('spea-profile-victoria-english.html'));
assert.equal(p.fields.website.url,'https://victoriaenglishschools.com/');assert.equal(p.fields.gender.value,'Boys | Girls');
assert.equal(p.fields.phone.value,'065227770','the school number, not the SPEA footer number');
assert.equal(parseProfile('<h2>Some page</h2><p>No fields</p>').readable,false);
assert.ok(listsYear('FS1 | FS2 | 1 | 2 | 6',6));assert.ok(!listsYear('FS1 | FS2 | 1 | 2 | 10',11));

/* ---------- Source policy ---------- */
assert.equal(speaPage('https://www.bayut.com/mybayut/best-british-schools-sharjah'),'');
assert.equal(speaPage('https://spea.shj.ae/en/education-institutes/schools/x?y=1'),'','no query strings');
assert.equal(speaPage('http://spea.shj.ae/en/education-institutes/schools/x'),'','https only');
assert.equal(speaPage('https://spea.shj.ae/en/services'),'','school profiles only');
assert.ok(speaPage('https://spea.shj.ae/en/educational-institutions/schools/106'),'old indexed profile URLs are recognised');

/* ---------- A fake SPEA + Brave built from the fixtures ---------- */
const synth=(name,curr,grades)=>`<h2>${name}</h2><span>Curriculum: ${curr}</span><span>Grade: ${grades}</span><div><span>School Location</span><a href="https://goo.gl/maps/SYNTH">Sharjah - Synthetic Area<span class="sr-only"> (Opens in a new tab)</span></a></div><div><span>Phone Number</span><a href="tel:060000000"><span>060000000</span></a></div>`;
const P='https://spea.shj.ae/en/education-institutes/schools/';
const pages={[SPEA_DIRECTORY]:fx('spea-directory-page1.html'),[P+'wes-green-int-pvt-school-llc']:fx('spea-profile-wesgreen-full.html'),[P+'victoria-english-pvt-school-llc']:fx('spea-profile-victoria-english.html'),
 [P+'synthetic-british-a']:synth('[Synthetic] British School A','British','FS1 | FS2 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13'),
 [P+'synthetic-british-b']:synth('[Synthetic] British School B','British','FS1 | FS2 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10'),
 [P+'synthetic-indian-c']:synth('[Synthetic] Indian School C','Indian','1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12')};
for(const n of ['victoria-int-shj-school','victoria-int-shj-school-propritorship-llc-kalba','victoria-int-shj-school-propritorship-llc-br3-khurfkan'])pages[P+n]=synth(parseDirectory(fx('spea-directory-page1.html')).cards.find(c=>c.url===P+n).name,'Australian','KG1 | KG2 | 1 | 2 | 3 | 4 | 5 | 6');
const OLD='https://spea.shj.ae/en/educational-institutions/schools/';
function world({search=[],more=false,braveStatus=200,dirStatus=200,extra={}}={}){
 const calls=[],queries=[];
 const fetcher=async(u,init)=>{const url=String(u);calls.push(url);
  if(url.startsWith('https://api.search.brave.com/')){const q=new URL(url).searchParams;queries.push(Object.fromEntries(q));
   if(braveStatus!==200)return new Response('{"error":{"code":"VALIDATION"}}',{status:braveStatus});
   return new Response(JSON.stringify({query:{more_results_available:more},web:{results:search.map(url=>({url,title:'IGNORED TITLE',description:'IGNORED SNIPPET'}))}}),{headers:{'content-type':'application/json'}})}
  assert.equal(init.redirect,'manual','redirects are never followed automatically');
  if(url===SPEA_DIRECTORY&&dirStatus!==200)return new Response('',{status:dirStatus});
  if(url===OLD+'183')return new Response('',{status:301,headers:{location:'/en/education-institutes/schools/synthetic-british-a'}});
  if(url===OLD+'777')return new Response('',{status:302,headers:{location:'https://evil.example/school'}});
  const all={...pages,...extra};
  if(all[url]!==undefined)return new Response(all[url],{headers:{'content-type':'text/html; charset=utf-8'}});
  return new Response('Not found',{status:404,headers:{'content-type':'text/html'}});};
 let budget=10;const reserve=async()=>budget-->0;
 return {calls,queries,deps:speaDeps({env:{BRAVE_SEARCH_API_KEY:'secret-key'},fetcher,reserve}),setBudget:n=>{budget=n}};
}

/* ---------- "Only two?": more British schools beyond page 1, skipping ones already shown ---------- */
{
 const w=world({search:['https://www.bayut.com/mybayut/best-british-schools-sharjah',OLD+'183',OLD+'106',P+'synthetic-british-b',P+'synthetic-indian-c',OLD+'777',P+'victoria-english-pvt-school-llc'],more:true});
 const r=await discoverSpeaSchools({curriculum:'british',exclude:[P+'wes-green-int-pvt-school-llc',P+'victoria-english-pvt-school-llc'],limit:6},w.deps);
 assert.deepEqual(r.schools.map(s=>s.name),['[Synthetic] British School A','[Synthetic] British School B'],'new British schools only');
 assert.equal(r.schools[0].url,P+'synthetic-british-a');assert.equal(r.schools[0].redirected,true,'old indexed URL followed once to the current profile');
 assert.ok(r.schools.every(s=>s.fields.curriculum.quote==='Curriculum: British'));
 assert.ok(!w.calls.some(c=>c.includes('bayut')||c.includes('evil')),'off-registry pages are never fetched');
 assert.equal(w.queries.length,1);assert.match(w.queries[0].q,/^British curriculum private school Sharjah site:spea\.shj\.ae$/);assert.equal(w.queries[0].country,'ALL');
 const c=r.coverage;
 assert.deepEqual(c.searched.map(s=>s.step),['directory-page-1','search']);assert.equal(c.directory.total,136);assert.equal(c.directory.listed,10);
 assert.equal(c.skipped.alreadyShown>=2,true);assert.equal(c.skipped.curriculum>=1,true);
 assert.deepEqual(c.failures.map(f=>f.reason).sort(),['source-not-found','source-redirected']);
 assert.equal(c.moreRemain,true);assert.ok(c.reasons.includes('more-search-results'));assert.ok(c.reasons.includes('directory-pages-not-server-rendered'));
 assert.equal(c.nextCursor.searchOffset,1);
 assert.ok(!JSON.stringify(r).includes('secret-key')&&!JSON.stringify(r).includes('IGNORED'),'no key, search titles or snippets in results');
}
/* ---------- Bounded: at most 8 profiles per call; the cursor continues without re-reading the directory ---------- */
{
 const many=Array.from({length:14},(_,i)=>P+'bulk-'+i);const extra=Object.fromEntries(many.map((u,i)=>[u,synth('[Synthetic] Bulk '+i,'British','1 | 2 | 3')]));
 const w=world({search:many,extra});
 const r=await discoverSpeaSchools({curriculum:'british',exclude:[P+'wes-green-int-pvt-school-llc',P+'victoria-english-pvt-school-llc'],limit:20},w.deps);
 assert.equal(r.coverage.profilesOpened,SPEA_LIMITS.profilesPerCall);assert.equal(r.schools.length,8);
 assert.equal(r.coverage.moreRemain,true);assert.ok(r.coverage.reasons.includes('unopened-profile-links'));assert.equal(r.coverage.nextCursor.pending.length,6);
 const before=w.calls.length;
 const r2=await discoverSpeaSchools({curriculum:'british',exclude:r.schools.map(s=>s.url),limit:20,cursor:r.coverage.nextCursor},w.deps);
 const next=w.calls.slice(before);
 assert.ok(!next.includes(SPEA_DIRECTORY),'directory not re-read');assert.ok(!next.some(c=>c.startsWith('https://api.search.brave.com/')),'pending links opened before any new search');
 assert.equal(r2.schools.length,6);assert.ok(r2.schools.every(s=>!r.schools.some(x=>x.url===s.url)));
}
/* ---------- Year filter uses only the quoted grade list ---------- */
{
 const w=world({search:[P+'synthetic-british-a',P+'synthetic-british-b']});
 const r=await discoverSpeaSchools({curriculum:'british',year:11,exclude:[],limit:6},w.deps);
 assert.deepEqual(r.schools.map(s=>s.name),['Wes green Int. Pvt. School. LLC','Victoria English Pvt. School LLC','[Synthetic] British School A']);
 assert.equal(r.coverage.skipped.year,1);
}
/* ---------- Spending and provider failures ---------- */
{
 const w=world({search:[P+'synthetic-british-a']});w.setBudget(0);
 const r=await discoverSpeaSchools({curriculum:'british',exclude:[P+'wes-green-int-pvt-school-llc',P+'victoria-english-pvt-school-llc']},w.deps);
 assert.ok(!w.calls.some(c=>c.startsWith('https://api.search.brave.com/')),'no search call without budget');
 assert.equal(r.schools.length,0);assert.deepEqual(r.coverage.failures.map(f=>f.reason),['search-limit']);assert.equal(r.coverage.moreRemain,'unknown');
 const w2=world({braveStatus:422});const r2=await discoverSpeaSchools({curriculum:'british'},w2.deps);
 assert.deepEqual(r2.schools.map(s=>s.name),['Wes green Int. Pvt. School. LLC','Victoria English Pvt. School LLC'],'directory results still returned');
 assert.deepEqual(r2.coverage.failures,[{path:'search',reason:'search-unavailable',http:422}]);
 const w3=world({dirStatus:503,search:[P+'synthetic-british-a']});const r3=await discoverSpeaSchools({curriculum:'british'},w3.deps);
 assert.equal(r3.coverage.searched[0].outcome,'source-not-available');assert.deepEqual(r3.schools.map(s=>s.name),['[Synthetic] British School A']);
 const off=speaDeps({env:{},fetcher:async()=>{throw Error('no network')},reserve:async()=>true});
 assert.equal((await off.search('x')).status,'not-configured');
}

/* ---------- Named-school lookup ---------- */
assert.equal(nameScore('Wesgreen','Wes green Int. Pvt. School. LLC'),1);
assert.equal(nameScore('Victoria English School','Victoria English Pvt. School LLC'),1);
assert.ok(nameScore('Victoria International School','Victoria Int. shj . School')>=0.99);
assert.ok(nameScore('Our Own English High','Our Own English High School')>=0.99);
assert.equal(nameScore('Hogwarts Academy','Wes green Int. Pvt. School. LLC'),0);
{
 const w=world({search:[P+'victoria-english-pvt-school-llc']});
 const r=await lookupSpeaSchool({name:'Victoria English school'},w.deps);
 assert.equal(r.status,'match');assert.equal(r.candidates[0].name,'Victoria English Pvt. School LLC');assert.equal(r.candidates[0].url,P+'victoria-english-pvt-school-llc');
 assert.match(w.queries[0].q,/^"Victoria English school" school site:spea\.shj\.ae$/);
}
{
 const w=world({search:[]});const r=await lookupSpeaSchool({name:'Wesgreen'},w.deps);
 assert.equal(r.status,'match');assert.equal(r.candidates[0].name,'Wes green Int. Pvt. School. LLC');
}
{ // Several Victoria branches: return candidates, never pick one silently
 const w=world({search:[]});const r=await lookupSpeaSchool({name:'Victoria International School'},w.deps);
 assert.equal(r.status,'candidates');assert.ok(r.candidates.length>=3);assert.ok(r.candidates.every(c=>/victoria/i.test(c.name)&&c.url.startsWith(P)));
 assert.ok(r.candidates.length<=SPEA_LIMITS.candidates);
}
{
 const w=world({search:[]});const r=await lookupSpeaSchool({name:'Hogwarts Academy'},w.deps);
 assert.equal(r.status,'not-found');assert.equal(r.coverage.searched.length,2,'directory and search both checked before saying not found');
}
{
 const w=world({braveStatus:503,dirStatus:503});const r=await lookupSpeaSchool({name:'Hogwarts Academy'},w.deps);
 assert.equal(r.status,'unavailable','failures are not reported as not found');
}
{ // A school name can't widen the search beyond SPEA
 const w=world({search:[]});await lookupSpeaSchool({name:'Victoria" OR site:evil.com'},w.deps);
 assert.equal((w.queries[0].q.match(/site:/g)||[]).length,1);assert.ok(!w.queries[0].q.includes('"Victoria"'));
 assert.equal((await lookupSpeaSchool({name:'the school'},w.deps)).status,'needs-name');
}
{ // Profile pages down: directory-card names still come back, marked as card-only
 const w=world({search:[]});for(const k of Object.keys(pages))if(k.includes('victoria'))delete pages[k];
 const r=await lookupSpeaSchool({name:'Victoria International School'},w.deps);
 assert.equal(r.status,'candidates');assert.ok(r.candidates.every(c=>c.from==='directory-card'&&Object.keys(c.fields).length===0));
 assert.ok(r.coverage.failures.length>=3);
}
assert.equal(classifyMatches('Victoria',[{name:'Victoria English Pvt. School LLC'},{name:'Victoria Int. shj . School'}]).status,'candidates');
console.log('SPEA reader: captured pages, beyond page 1, bounded batches and cursor, year filter, budget and failures, name lookup with candidates: passed');
