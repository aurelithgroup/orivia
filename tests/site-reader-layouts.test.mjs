/* Website reader across page layouts: link ranking by request, compact year-group tables and labels (Year vs Grade),
   labelled curriculum values, and no whole-school curriculum inferred from IGCSE / A Level / EYFS alone.
   Fixtures in tests/fixtures/sites/ say in their headers whether they are synthetic or reconstructed.
   Run: node tests/site-reader-layouts.test.mjs */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readSiteFacts,yearEvidence,sitePageLinks,pageSections} from '../workers/orivia-school-sites.mjs';
import {runResearchTurn} from '../workers/orivia-research-loop.mjs';
const fx=f=>readFileSync(new URL('./fixtures/sites/'+f,import.meta.url),'utf8');
const facts=(f,host='school.example',url='https://'+host+'/p')=>readSiteFacts([{url,raw:fx(f)}],host);
const vals=(fs,k)=>[...new Set(fs.filter(x=>x.key===k).map(x=>x.value))];

/* 1. Links ranked by the request before the cap (SIPS layout: About pages come first in the menu) */
{
 const home=fx('sips-layout-home.html'),base='https://sips.example/';
 const overview=sitePageLinks(home,base,'sips.example',3,'overview');
 assert.deepEqual(overview.map(u=>new URL(u).pathname),['/academics/','/admissions/admission-procedure/','/contact-us/'],'one curriculum, one admissions, one contact page');
 assert.ok(!overview.some(u=>/chairman|principal|why-choose|vision|news|gallery|careers/.test(u)),'leadership, why-choose, news, gallery and careers pages never fill the cap');
 const contacts=sitePageLinks(home,base,'sips.example',2,'contacts');
 assert.equal(new URL(contacts[0]).pathname,'/contact-us/','a contacts request opens the contact page first');
 const curriculum=sitePageLinks(home,base,'sips.example',3,'curriculum');
 assert.ok(curriculum.every(u=>/academics/.test(u)));
 assert.deepEqual(sitePageLinks('<a href="/about/chairman">Chairman</a><a href="/why-choose-us">Why choose us</a>',base,'sips.example',3),[],'nothing relevant: nothing opened rather than filler pages');
}
/* 2. Compact year-group tables and labels, with section context, Year kept apart from Grade */
{
 const f=facts('sips-layout-curriculum.html','sips.example','https://sips.example/academics/');
 const years=f.filter(x=>x.key==='year-groups');
 assert.ok(years.some(x=>x.value==='Year 6'&&x.source.section==='British Curriculum › Year groups'&&/Primary \| Year 6 \| 10–11/.test(x.quote)),'Year 6 read from a table row, quoted with its row and section');
 assert.ok(years.some(x=>x.value==='Year 7 to Year 13'));assert.ok(years.some(x=>x.value==='FS1'));
 assert.ok(years.some(x=>x.value==='Grade 1 to Grade 4'&&x.source.section==='MoE Curriculum'),'MoE strand stays in its own section, on the Grade scale');
 const y6=yearEvidence(f,6);assert.ok(y6.listed.some(x=>x.value==='Year 6'));assert.ok(!y6.listed.some(x=>/Grade/.test(x.value)));assert.ok(y6.gradeOnly.length>=3);
 assert.deepEqual(vals(f,'curriculum').sort(),['British','MoE (UAE Ministry of Education)'],'labelled "British and MoE" gives both');
 assert.ok(f.some(x=>x.key==='curriculum'&&x.quote==='Curriculum: British and MoE'));
 assert.deepEqual(vals(f,'programme').sort(),['A Level','IGCSE'],'qualifications recorded as programmes');
 assert.ok(pageSections(fx('sips-layout-curriculum.html')).some(s=>s.heading==='MoE Curriculum'));
}
{
 const f=facts('layout-div-labels.html');
 assert.deepEqual(vals(f,'curriculum'),['American'],'label/value divs');
 assert.deepEqual(vals(f,'year-groups'),['KG1 to Grade 12']);
 const y6=yearEvidence(f,6);assert.equal(y6.listed.length,0,'a Grade-scale school gives no Year 6 evidence');assert.equal(y6.gradeOnly.length,1);
}
{
 const f=facts('layout-phases-prose.html');
 assert.ok(vals(f,'year-groups').includes('Year 1 to Year 6'),'"Years 1–6" read as Year 1 to Year 6');
 assert.ok(vals(f,'year-groups').includes('Year 3 to Year 6'),'"Y3 to Y6" read as Year 3 to Year 6');
 assert.ok(yearEvidence(f,6).listed.length>=2);assert.deepEqual(vals(f,'curriculum'),['British']);
 assert.ok(f.filter(x=>x.key==='year-groups').every(x=>x.source.section==='Our phases'));
}
/* 3. Labelled curriculum values accepted; IGCSE / A Level / EYFS alone never become the school's curriculum */
{
 const f=facts('layout-programmes-only.html');
 assert.deepEqual(vals(f,'curriculum'),[],'no explicit curriculum statement or label: none inferred');
 assert.deepEqual(vals(f,'programme').sort(),['A Level','EYFS','IGCSE']);
 assert.equal(yearEvidence(f,6).listed.length,0,'a "Grade 6" fee row is not Year 6 evidence');
 for(const [html,want] of [['<dl><dt>Curriculum</dt><dd>British</dd></dl>',['British']],['<table><tr><th>Curriculum</th><td>IB</td></tr></table>',['IB']],['<table><tr><td>Curriculum offered:</td><td>CBSE</td></tr></table>',['Indian']],['<p>Curriculum: UK National Curriculum</p>',['British']],['<dl><dt>Curriculum</dt><dd>Ministry of Education</dd></dl>',['MoE (UAE Ministry of Education)']]]){
  assert.deepEqual(vals(readSiteFacts([{url:'https://x.example/',raw:'<main><h1>School</h1>'+html+'</main>'}],'x.example'),'curriculum'),want,html);
 }
 const gems=readSiteFacts([{url:'https://www.gemseducation.com/w',raw:fx('gems-wesgreen-outline.html')}],'gemseducation.com');
 assert.deepEqual(vals(gems,'curriculum'),['British'],'real GEMS layout: from the labelled field and explicit sentence, not menus');
}
/* End to end: a user-shared link on the SIPS layout opens curriculum/admissions/contact pages, never the About pages */
{
 const pages={'https://sips.example/':fx('sips-layout-home.html'),'https://sips.example/academics/':fx('sips-layout-curriculum.html'),
  'https://sips.example/admissions/admission-procedure/':'<main><h1>Admission Procedure</h1><p>[Synthetic] Apply online and bring the documents listed.</p></main>',
  'https://sips.example/contact-us/':'<main><h1>Contact Us</h1><a href="tel:+97165550000">+971 6 555 0000</a> <a href="mailto:info@sips.example">info@sips.example</a></main>'};
 const opened=[];
 const fetcher=async u=>{const url=String(u);opened.push(url);return pages[url]!==undefined?new Response(pages[url],{headers:{'content-type':'text/html'}}):new Response('',{status:404,headers:{'content-type':'text/html'}})};
 const u={source:'test',research:true,intent:'check',topic:'school',location:{country:'uae',city:'Sharjah'},constraints:{curriculum:'',year:6},organisations:[{name:'',url:'https://sips.example/'}],correction:'',question:''};
 const r=await runResearchTurn({messages:[{role:'user',content:'check https://sips.example/ for year 6'}]},{BRAVE_SEARCH_API_KEY:'k'},{fetcher,reserve:async()=>false,understanding:u});
 assert.ok(!opened.some(x=>/chairman|principal|why-choose|news|gallery/.test(x)),'opened: '+opened.join(' '));
 assert.match(r.reply,/The website you shared says:/);
 assert.match(r.reply,/Year 6: listed \(Primary \| Year 6 \| 10–11\)/,'answers the Year 6 question with the table row');assert.match(r.reply,/Curriculum: British/);assert.match(r.reply,/Email: info@sips\.example/);
}
console.log('Site reader layouts: request-ranked links (SIPS layout), compact year tables and labels with sections, Year vs Grade, labelled curriculum values, no curriculum from IGCSE/A Level/EYFS alone, end-to-end link: passed');
