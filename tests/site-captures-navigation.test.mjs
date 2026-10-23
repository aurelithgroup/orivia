/* Navigation and year evidence against Ina's RAW captures (tests/fixtures/sites/captured/, gzip, unchanged server HTML).
   These are general-layout regression cases: nothing in production is specific to this school.
   Run: node tests/site-captures-navigation.test.mjs */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {sitePageLinks,readSiteFacts,yearEvidence,linkYears} from '../workers/orivia-school-sites.mjs';
import {runResearchTurn} from '../workers/orivia-research-loop.mjs';
const cap=f=>gunzipSync(readFileSync(new URL('./fixtures/sites/captured/'+f,import.meta.url))).toString();
const home=cap('sips-home.html.gz'),cur=cap('sips-curriculum.html.gz');
const HOME='https://sips.ae/',CUR='https://sips.ae/british-section/curriculum-and-learning-2/curriculum-at-sips/';
const path=u=>new URL(u).pathname;
const PEOPLE_OR_LOW=/head-of|principal|chairman|teaching-team|leadership|meet-the|registrar|newsletter|events|gallery|videos|policies|careers|work-with-us/;

/* 1. Link ranking on the real homepage */
{
 const overview=sitePageLinks(home,HOME,'sips.ae',3,'overview').map(path);
 assert.ok(!overview.some(p=>PEOPLE_OR_LOW.test(p)),'no person, role or low-value page: '+overview);
 assert.ok(!overview.includes('/british-section/head-of-eyfs/'),'Head of EYFS never outranks curriculum pages');
 assert.ok(overview.some(p=>/curricul/.test(p))&&overview.some(p=>/admission/.test(p))&&overview.some(p=>/contact/.test(p)),'one page per need: '+overview);
 const curriculum=sitePageLinks(home,HOME,'sips.ae',20,'curriculum').map(path);
 assert.ok(curriculum.slice(0,3).includes('/british-section/curriculum-and-learning-2/curriculum-at-sips/'),'the substantive curriculum page is in the top 3: '+curriculum.slice(0,3));
 assert.ok(!curriculum.some(p=>/head-of|principal|teaching-team/.test(p)),'role pages never ranked for curriculum');
 const contacts=sitePageLinks(home,HOME,'sips.ae',20,'contacts').map(path);
 assert.ok(/contact-us\/$/.test(contacts[0]),'a direct contact page first: '+contacts[0]);
 const loc=contacts.indexOf('/about/location/'),firstContact=contacts.findIndex(p=>/contact-us/.test(p));
 assert.ok(loc===-1||loc>firstContact,'a generic location page never beats Contact Us');
 assert.ok(contacts.indexOf('/admissions/where-next/contact-us/')>=0,'the admissions contact page is a candidate');
}
/* 2. Following the year asked about (from the path's own words, e.g. "primary-year-2-6") */
{
 assert.deepEqual(linkYears('/british-section/primary-year-2-6/primary-curriculum/'),[2,6]);
 assert.deepEqual(linkYears('Secondary (Year 7 – 10)'),[7,10]);assert.deepEqual(linkYears('Primary Curriculum'),[1,6]);
 for(const [raw,base] of [[home,HOME],[cur,CUR]]){
  const y6=sitePageLinks(raw,base,'sips.ae',3,'year',{year:6}).map(path);
  assert.equal(y6[0],'/british-section/primary-year-2-6/primary-curriculum/','Year 6 → the primary curriculum page first');
  const y9=sitePageLinks(raw,base,'sips.ae',3,'year',{year:9}).map(path);
  assert.match(y9[0],/secondary-year-7-10/,'Year 9 → a secondary page first');
 }
 assert.equal(path(sitePageLinks(home,HOME,'sips.ae',3,'overview',{year:6})[0]),'/british-section/primary-year-2-6/primary-curriculum/','asking about Year 6 puts the year page first');
}
/* 3. Facts from the real pages: whole-school statements only, years with section, no Year 6 claimed */
{
 const hf=readSiteFacts([{url:HOME,raw:home}],'sips.ae');
 const hc=hf.filter(x=>x.key==='curriculum');
 assert.ok(hc.length&&hc.every(x=>!/Raghda|FS2 level/.test(x.quote)),'a teacher biography is not whole-school curriculum evidence');
 assert.ok(hc.some(x=>/traditional British education/.test(x.quote)),'the Academics statement is');
 assert.ok(hf.filter(x=>x.key==='admissions-page').length<=1,'one admissions page, not every menu link');
 const cf=readSiteFacts([{url:CUR,raw:cur}],'sips.ae');
 assert.ok(cf.some(x=>x.key==='curriculum'&&x.value==='British'&&x.source.section==='Curriculum at SIPS'));
 const years=cf.filter(x=>x.key==='year-groups').map(x=>x.value);
 for(const y of [7,9,13])assert.ok(years.includes('Year '+y),'School Structure lists Year '+y);
 assert.ok(cf.filter(x=>x.key==='year-groups').every(x=>x.source.section==='School Structure'));
 assert.equal(yearEvidence(cf,6).listed.length,0,'Year 6 is not on this page');assert.ok(yearEvidence(cf,9).listed.length>0);
 assert.equal(yearEvidence(hf,6).listed.length,0);
}
/* 4. End to end: follow the year page; if it can't be read, say "couldn't confirm Year 6", never guess */
const turn=async pages=>{const opened=[];
 const fetcher=async u=>{const url=String(u);opened.push(url);return pages[url]!==undefined?new Response(pages[url],{headers:{'content-type':'text/html'}}):new Response('',{status:404,headers:{'content-type':'text/html'}})};
 const u={source:'test',research:true,intent:'check',topic:'school',location:{country:'uae',city:'Sharjah'},constraints:{curriculum:'',year:6},organisations:[{name:'',url:HOME}],correction:'',question:''};
 const r=await runResearchTurn({messages:[{role:'user',content:'does '+HOME+' have year 6?'}]},{BRAVE_SEARCH_API_KEY:'k'},{fetcher,reserve:async()=>false,understanding:u});
 return {r,opened};};
{
 const {r,opened}=await turn({[HOME]:home,[CUR]:cur});
 assert.ok(!opened.some(x=>PEOPLE_OR_LOW.test(path(x))||/location/.test(x)),'opened: '+opened.map(path).join(' '));
 assert.ok(opened.includes('https://sips.ae/british-section/primary-year-2-6/primary-curriculum/'),'tried the year page');
 assert.ok(r.research.coverage.yearFollowups||opened.length<=6);
 assert.match(r.reply,/I couldn’t confirm Year 6 on the \d+ pages I read from its website\. That doesn’t mean it isn’t offered/);
 assert.doesNotMatch(r.reply,/Year 6: listed/);assert.match(r.reply,/Curriculum: British/);
}
{ // Same site, but the primary page (synthetic stand-in, not captured) lists Year 6: the follow-up finds it
 const primary='<main><h1>Primary Curriculum</h1><h2>Year groups</h2><ul><li>Year 2</li><li>Year 3</li><li>Year 4</li><li>Year 5</li><li>Year 6</li></ul></main>';
 const {r}=await turn({[HOME]:home,[CUR]:cur,'https://sips.ae/british-section/primary-year-2-6/primary-curriculum/':primary});
 assert.match(r.reply,/Year 6: listed \(Year groups: Year 2, Year 3, Year 4, Year 5, Year 6\)/);
}
console.log('Real captures: ranking (no role/location pages over curriculum/contact), year-page following, whole-school facts only, honest Year 6 answer: passed');
