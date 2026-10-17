/* School websites anchored to SPEA: identity first, domain established before use, facts tied to their own page.
   SPEA fixtures as in spea-reader.test.mjs. Every school WEBSITE here is SYNTHETIC (hosts end in .example or are
   labelled), because no school site has been captured yet. Run: node tests/school-sites.test.mjs */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {speaDeps,SPEA_DIRECTORY,nameScore,classifyMatches} from '../workers/orivia-spea-reader.mjs';
import {nameOnPage,siteDeps,siteHost,candidateSiteHosts,phoneKey,establishDomain,readSiteFacts,sitePageLinks,lookupSchoolWithSite,SITE_LIMITS} from '../workers/orivia-school-sites.mjs';
const fx=f=>readFileSync(new URL('./fixtures/'+f,import.meta.url),'utf8');
const P='https://spea.shj.ae/en/education-institutes/schools/';

/* ---------- Pure rules ---------- */
assert.equal(phoneKey('065062999'),'97165062999');assert.equal(phoneKey('+971 6 506 2999'),'97165062999');assert.equal(phoneKey('00971-6-5062999'),'97165062999');
assert.equal(siteHost('https://www.victoriaenglishschools.com/about'),'victoriaenglishschools.com');
for(const bad of ['http://school.example/','https://127.0.0.1/','https://localhost/','https://school.example:8443/','https://ae.linkedin.com/in/sips-ae','https://www.edustoke.com/x','https://mdares.ai/x','https://edcare.ae/x','https://spea.shj.ae/en','https://u.ae/en','https://www.moe.gov.ae/','https://user:pw@school.example/'])assert.equal(siteHost(bad),'',bad);
assert.deepEqual(candidateSiteHosts(['https://ae.linkedin.com/in/x','https://www.wesgreen-school.example/','https://wesgreen-school.example/admissions','https://www.edustoke.com/y','https://other-school.example/']),['wesgreen-school.example','other-school.example']);

/* ---------- The live investigation case: identity must not be guessed or substituted ---------- */
const SIPS='Sharjah International Private School';
assert.equal(classifyMatches(SIPS,[{name:'Sharjah American International School'},{name:'Sharjah English School'}]).status,'candidates','near-misses are candidates, never a match');
assert.ok(nameScore(SIPS,'Sharjah American International School')<0.85);
assert.equal(classifyMatches(SIPS,[{name:'Shj. Int. Pvt. School - British Branch'},{name:'Shj. Int. Pvt. School - MoE Branch'}] /* hypothetical listings: third-party sites suggest two branches; not yet confirmed on SPEA */).status,'candidates','two branch listings: candidates');
assert.equal(classifyMatches(SIPS,[{name:SIPS},{name:'Sharjah American International School'}]).status,'match','an exact listing matches');

/* ---------- A fake world: SPEA (fixtures), Brave (SPEA-restricted and open web) and synthetic school sites ---------- */
const VE_SITE='victoriaenglishschools.com';
const veHome=`<html><head><title>Victoria English School Sharjah</title></head><body><h1>Victoria English School</h1>
<nav><a href="/admissions/">Admissions</a> <a href="/curriculum">Our Curriculum</a> <a href="/contact-us/">Contact us</a> <a href="https://www.facebook.com/x">Facebook</a> <a href="/brochure.pdf">Brochure</a></nav>
<p>[Synthetic test content] We follow the National Curriculum for England from FS1 to Year 13.</p></body></html>`;
const veAdmissions=`<h1>Admissions</h1><p>[Synthetic] Families can apply online.</p><a href="mailto:admissions@victoriaenglishschools.com">Email admissions</a> <a href="mailto:someone@gmail.com">Old contact</a> <a href="tel:+97165227770">Call +971 6 522 7770</a> <a href="/admissions/apply">Apply now</a>`;
const veCurriculum=`<h1>Curriculum</h1><p>[Synthetic] Students sit IGCSEs and A Levels.</p><p>All schools in the UAE must follow Ministry of Education rules on Arabic and Islamic Studies.</p>`;
const WG='wesgreen-school.example';
const wgHome=`<title>Wes Green International School | Sharjah</title><h1>Welcome</h1><p>[Synthetic] Call us on +971 6 506 2999.</p><a href="/contact">Contact</a>`;
const impostorHome=`<title>Wes Green International School - Admissions Open</title><h1>Wes Green International School</h1><p>Call 04 123 4567</p>`;
const wrongNameHome=`<title>Al Bustan Nursery</title><h1>Al Bustan Nursery</h1><p>Call +971 6 506 2999</p>`;
function world({web=[],sites={},budget=10,spea={}}={}){
 const calls=[],queries=[];
 const pages={[SPEA_DIRECTORY]:fx('spea-directory-page1.html'),[P+'wes-green-int-pvt-school-llc']:fx('spea-profile-wesgreen-full.html'),[P+'victoria-english-pvt-school-llc']:fx('spea-profile-victoria-english.html'),...spea};
 const fetcher=async(u,init)=>{const url=String(u);calls.push(url);
  if(url.startsWith('https://api.search.brave.com/')){const q=new URL(url).searchParams.get('q');queries.push(q);
   const urls=/site:spea\.shj\.ae/.test(q)?[]:web;
   return new Response(JSON.stringify({web:{results:urls.map(url=>({url,title:'Wes Green International School official site',description:'snippet'}))}}),{headers:{'content-type':'application/json'}})}
  assert.equal(init.redirect,'manual');
  if(pages[url]!==undefined)return new Response(pages[url],{headers:{'content-type':'text/html'}});
  const s=sites[url];if(s===undefined)return new Response('nope',{status:404,headers:{'content-type':'text/html'}});
  if(s.redirect)return new Response('',{status:301,headers:{location:s.redirect}});
  return new Response(s,{headers:{'content-type':'text/html'}});};
 let left=budget;const reserve=async()=>left-->0;
 return {calls,queries,deps:{spea:speaDeps({env:{BRAVE_SEARCH_API_KEY:'k'},fetcher,reserve}),site:siteDeps({env:{BRAVE_SEARCH_API_KEY:'k'},fetcher,reserve})}};
}

/* 1. SPEA links the website: established by the regulator, then the school's own statements are read */
{
 const w=world({sites:{['https://'+VE_SITE+'/']:veHome,['https://'+VE_SITE+'/admissions/']:veAdmissions,['https://'+VE_SITE+'/curriculum']:veCurriculum,['https://'+VE_SITE+'/contact-us/']:'<h1>Contact</h1>'}});
 const r=await lookupSchoolWithSite({name:'Victoria English school'},w.deps);
 assert.equal(r.status,'match');assert.equal(r.school.name,'Victoria English Pvt. School LLC');
 assert.equal(r.site.status,'established');assert.equal(r.site.basis,'regulator-link');assert.equal(r.site.host,VE_SITE);
 assert.deepEqual(r.site.evidence.map(e=>e.kind),['regulator-link']);assert.equal(r.site.evidence[0].sourceUrl,P+'victoria-english-pvt-school-llc');
 assert.ok(!w.queries.some(q=>!q.includes('site:spea.shj.ae')),'no open-web search needed when SPEA links the site');
 const by=k=>r.site.facts.filter(f=>f.key===k);
 assert.deepEqual(by('curriculum').map(f=>f.value),['British']);assert.ok(by('curriculum').some(f=>/National Curriculum for England/.test(f.quote)));
 assert.deepEqual(by('year-groups').map(f=>f.value),['FS1 to Year 13']);
 assert.deepEqual(by('email').map(f=>f.value),['admissions@victoriaenglishschools.com'],'emails at other domains are not the school’s');
 assert.deepEqual(by('phone').map(f=>f.value),['+97165227770']);
 assert.ok(by('admissions-page').some(f=>f.value==='https://'+VE_SITE+'/admissions/'));
 for(const f of r.site.facts){assert.equal(f.source.kind,'school-website');assert.equal(f.source.scope,'school-own-statement');assert.ok(f.source.url.startsWith('https://'+VE_SITE+'/'));
  assert.ok(!/Ministry of Education rules/.test(f.quote),'a school page is not evidence of a UAE-wide rule')}
 assert.ok(r.site.pagesRead.length<=SITE_LIMITS.pagesPerSite);assert.deepEqual(r.site.differences,[]);
 assert.equal(r.school.fields.curriculum.quote,'Curriculum: British','the SPEA fact stays tied to SPEA');
}
/* 2. No SPEA website link: search nominates hosts; an impostor with the right name but wrong phone is rejected,
      and the real site is established by the SPEA-listed phone on its contact page */
{
 const w=world({web:['https://ae.linkedin.com/in/wesgreen','https://wes-green-admissions.example/','https://www.edustoke.com/wes','https://'+WG+'/'],
  sites:{'https://wes-green-admissions.example/':impostorHome,['https://'+WG+'/']:{redirect:'https://www.'+WG+'/'},['https://www.'+WG+'/']:'<title>Wes Green International School</title><a href="/contact">Contact</a>',['https://www.'+WG+'/contact']:wgHome}});
 const r=await lookupSchoolWithSite({name:'Wesgreen'},w.deps);
 assert.equal(r.status,'match');assert.equal(r.site.status,'established');assert.equal(r.site.basis,'contact-match');assert.equal(r.site.host,WG);
 assert.deepEqual(r.coverage.site.hostsConsidered.map(h=>[h.host,h.status]),[['wes-green-admissions.example','unverified'],[WG,'established']],'top search result and matching name were not enough');
 assert.ok(r.coverage.site.hostsConsidered[0].reasons.includes('no-matching-contact-on-site'));
 assert.ok(!w.calls.some(c=>/linkedin|edustoke/.test(c)),'directories and social sites are never opened as school sites');
 assert.match(w.queries.find(q=>!q.includes('site:spea')),/^"Wes green Int\. Pvt\. School\. LLC" Sharjah school$/,'searches the exact SPEA name');
 assert.deepEqual(r.site.evidence.map(e=>e.kind),['contact-match','regulator-phone']);
}
/* 3. Phone matches but the site is someone else's: not established */
assert.equal(establishDomain({school:{name:'Wes green Int. Pvt. School. LLC',url:P+'x',fields:{phone:{value:'065062999',quote:'Phone Number 065062999'}}},host:'nursery.example',pages:[{url:'https://nursery.example/',raw:wrongNameHome}]}).status,'unverified');
/* 4. SPEA links a different site than the candidate: that candidate is not established by the link */
assert.ok(establishDomain({school:{name:'X',url:P+'x',fields:{website:{url:'https://real.example/',quote:'Website'}}},host:'other.example',pages:[]}).reasons.includes('regulator-links-a-different-site'));
/* 5. Off-site redirects are refused; the site is then unverified and nothing is read */
{
 const w=world({web:['https://'+WG+'/'],sites:{['https://'+WG+'/']:{redirect:'https://evil.example/'}}});
 const r=await lookupSchoolWithSite({name:'Wesgreen'},w.deps);
 assert.equal(r.site.status,'unverified');assert.deepEqual(r.site.facts,[]);assert.ok(!w.calls.includes('https://evil.example/'));
 assert.equal(r.coverage.site.failures[0].reason,'redirected-off-site');
}
/* 6. Spending limit: the website search isn't made; identity from SPEA is still returned */
{
 const w=world({web:['https://'+WG+'/'],budget:1}); // SPEA lookup uses the one search
 const r=await lookupSchoolWithSite({name:'Wesgreen'},w.deps);
 assert.equal(r.status,'match');assert.equal(r.site.status,'none-found');assert.equal(r.coverage.site.failures[0].reason,'search-limit');
 assert.equal(w.queries.length,1);
}
/* 7. Identity not established: candidates come back and no website is searched or read */
{
 const w=world({web:['https://victoria.example/']});
 const r=await lookupSchoolWithSite({name:'Victoria International School'},w.deps);
 assert.equal(r.status,'candidates');assert.equal(r.site,null);assert.equal(r.coverage.site.skipped,'identity-not-established');
 assert.ok(!w.queries.some(q=>!q.includes('site:spea.shj.ae')));assert.ok(!w.calls.includes('https://victoria.example/'));
}
{ // The SIPS case with no SPEA listing available here: not found / candidates, never another school's facts
 const w=world({web:['https://sharjah-american.example/']});
 const r=await lookupSchoolWithSite({name:SIPS},w.deps);
 assert.ok(['not-found','candidates','unavailable'].includes(r.status));assert.equal(r.site,null);assert.equal(r.school,null);
}
/* 8. The school's site and SPEA disagree on curriculum: both kept, difference flagged */
{
 const w=world({sites:{['https://'+VE_SITE+'/']:'<title>Victoria English School</title><p>[Synthetic] We offer an American curriculum with Common Core standards.</p>'}});
 const r=await lookupSchoolWithSite({name:'Victoria English school'},w.deps);
 assert.deepEqual(r.site.differences,[{field:'curriculum',spea:'British',site:['American']}]);
}
assert.ok(nameOnPage(SIPS,'<h1>Welcome to Sharjah International Private School</h1>'));
assert.ok(!nameOnPage(SIPS,'<h1>Sharjah American International School</h1>'),'a near-miss name on a page is not this school');
assert.ok(nameOnPage('Wes green Int. Pvt. School. LLC','<title>Wesgreen International School</title>'));
/* 9. Links and facts helpers */
assert.deepEqual(sitePageLinks(veHome,'https://'+VE_SITE+'/',VE_SITE),['https://'+VE_SITE+'/admissions/','https://'+VE_SITE+'/curriculum','https://'+VE_SITE+'/contact-us/']);
assert.equal(readSiteFacts([{url:'https://a.example/',raw:'<p>Nothing relevant here at all.</p>'}],'a.example').length,0);
console.log('School sites: SPEA identity first, domain established by regulator link or matching contact (never rank, title or name), facts tied to their page, differences flagged, bounds and budget kept: passed');
