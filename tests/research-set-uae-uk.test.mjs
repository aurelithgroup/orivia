/* Fixed UAE/UK research question set (area 4, 28 Oct). SCRIPTED: fixture pages and a scripted model, no provider calls,
   no search spend. Each case runs a real assistant turn (runAssistantTurn → tools → verifyReply) where the scripted model first
   proposes a reply a careless model might give, then a correct one, so the case proves what the code itself catches.
   Page texts are FIXTURES written for this test (marked "[Fixture]" in every title). Their figures are not current official
   values and must never be quoted as such. Real-provider results are recorded separately (docs/evidence/research-set-2026-10-28.json).
   Run: node tests/research-set-uae-uk.test.mjs   (RESULTS=path writes the per-case results as JSON) */
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {runAssistantTurn,personRegion,personNation,personEmirate,nationOf,nationOfEvidence,emirateOf,sourceKind,errorCode} from '../workers/orivia-assistant.mjs';

// Where the person is, when a message names both countries or a UK nation
const m=t=>[{role:'user',content:t}];
assert.equal(personRegion(m('I’m in Sharjah with a UK licence')),'uae');
assert.equal(personRegion(m('Moving from Dubai to London in January')),'uk');
assert.equal(personRegion(m('UK or UAE, which is cheaper?')),'','no place to stand on: no region');
assert.equal(personNation(m('I live in Glasgow now')),'scotland');assert.equal(personNation(m('Edinburgh or Manchester?')),'');
assert.equal(nationOf('https://www.nhs.uk/x'),'england');assert.equal(nationOf('https://www.nhsinform.scot/x'),'scotland');assert.equal(nationOf('https://www.gov.uk/x'),'','gov.uk speaks for the whole UK');
assert.equal(sourceKind('https://www.rta.ae/wps/portal/rta/ae/public-transport/Nol-Home'),'government');
assert.equal(errorCode('sentence 1: a official_rule claim for someone in Scotland cannot rest only on pages for England (x)'),'wrong-nation');
assert.equal(personEmirate(m('I live in Sharjah')),'sharjah');assert.equal(personEmirate(m('I’m in Sharjah, which nol card for the Dubai Metro?')),'','two emirates named: none set');
assert.equal(emirateOf('https://u.ae/en/x'),'','federal pages belong to no single emirate');assert.equal(emirateOf('https://spea.shj.ae/x'),'sharjah');
assert.equal(nationOfEvidence({url:'https://www.gov.uk/x',excerpt:'In England, bands are based on 1991 values.'}),'england');
assert.equal(nationOfEvidence({url:'https://www.gov.uk/x',excerpt:'Rules differ in England and Scotland.'}),'','a page naming two nations is UK-wide');

const page=(title,body)=>`<html><head><title>[Fixture] ${title}</title></head><body><main><h1>${title}</h1>${body}</main></body></html>`;
const P={
 eid:['https://u.ae/en/information-and-services/visa-and-emirates-id/emirates-id',page('Emirates ID','<p>Residents must apply for an Emirates ID within 30 days of their residence visa being issued.</p><p>You need your passport and residence visa.</p>')],
 eidFee:['https://icp.gov.ae/en/services/emirates-id-renewal',page('Emirates ID fees','<p>The Emirates ID fee for residents is AED 100 for each year of validity.</p>')],
 ukMoney:['https://www.gov.uk/student-visa/money',page('Student visa: money','<p>If you are studying in London, you must have £1,483 for each month of your course, for up to 9 months.</p><p>If you are studying outside London, you must have £1,136 for each month of your course, for up to 9 months.</p>')],
 nol:['https://www.rta.ae/wps/portal/rta/ae/public-transport/Nol-Home',page('nol cards','<p>nol Silver Card</p><p>Get this card immediately from any ticket office for only AED 25 (includes AED 19 e-purse value).</p><p>nol Gold Card</p><p>The gold card holds the same features as the silver card, but it gives you access to the metro’s gold class seats for a premium fare.</p>')],
 rxEngland:['https://www.nhs.uk/nhs-services/prescriptions/how-much-prescriptions-cost/',page('Prescription costs','<p>In England, the prescription charge is £9.90 for each item.</p>')],
 rxScotland:['https://www.nhsinform.scot/care-support-and-rights/nhs-services/pharmacy/prescriptions',page('Prescriptions in Scotland','<p>Prescriptions are free for everyone in Scotland.</p>')],
 ukLicence:['https://www.gov.uk/exchange-foreign-driving-licence',page('Exchange a foreign driving licence','<p>You can drive in Great Britain on a valid licence from a designated country for up to 12 months.</p>')],
 uaeLicence:['https://u.ae/en/information-and-services/transportation/driving-licence/convert-foreign-licence',page('Convert a foreign driving licence','<p>Residents holding a licence from an eligible country can convert it to a UAE driving licence without taking a driving test.</p>')],
 bank:['https://www.centralbank.ae/en/consumer-protection/opening-a-bank-account',page('Opening a bank account','<p>Banks require a valid Emirates ID to open a personal account.</p>')],
 reddit:['https://www.reddit.com/r/dubai/comments/fixture1',page('Bank account before Emirates ID?','<p>I opened an account with just my visa page and passport, the bank took the Emirates ID later.</p>')],
 ctaxStudent:['https://www.gov.uk/council-tax/discounts-for-full-time-students',page('Council Tax: students','<p>Households where everyone is a full-time student do not have to pay Council Tax.</p>')],
 ctaxCouncil:['https://www.manchester.gov.uk/council-tax-student-exemption',page('Student exemption','<p>To get the student exemption you must send us a student certificate from your university.</p>')],
 evisa:['https://www.gov.uk/evisa',page('Get access to your eVisa','<p>You need to create a UKVI account to access your eVisa.</p><p>Biometric residence permits expired on 31 December 2024.</p>')],
 sharjahVisa:['https://www.sharjah.ac.ae/en/student-visa-fees',''],
 eidFeeUae:['https://u.ae/en/information-and-services/visa-and-emirates-id/emirates-id-fees',page('Emirates ID fees','<p>The Emirates ID fee is AED 100 for each year of validity.</p>')],
 eidFeeIcp:['https://icp.gov.ae/en/services/issue-emirates-id',page('Issue an Emirates ID','<p>The Emirates ID fee is AED 270 for a two-year card, including service charges.</p>')],
 parkDubai:['https://www.rta.ae/wps/portal/rta/ae/drive/parking',page('Paid parking','<p>Public parking is paid by nol card or the mParking text service, from 8am to 10pm.</p>')],
 parkSharjah:['https://www.shj.ae/en/services/public-parking',page('Public parking','<p>Public parking is paid through the Mawqif app or parking machines.</p>')],
 ctaxEngland:['https://www.gov.uk/council-tax-bands',page('Council Tax bands','<p>In England, Council Tax bands are based on property values on 1 April 1991.</p>')],
 ctaxWales:['https://www.gov.wales/council-tax-bands',page('Council Tax bands in Wales','<p>Bands are based on property values on 1 April 2003.</p>')]};
const html=Object.fromEntries(Object.values(P).filter(([,h])=>h).map(([u,h])=>[u,h]));

function world({results=[]}={}){
 const searched=[],read=[];
 const fetcher=async u=>{const url=String(u);
  if(url.startsWith('https://api.search.brave.com/')){searched.push(new URL(url).searchParams.get('q'));return Response.json({web:{results:results.map(([u])=>({url:u,title:'[Fixture]',description:''}))}})}
  read.push(url);return html[url]!==undefined?new Response(html[url],{headers:{'content-type':'text/html'}}):new Response('',{status:404,headers:{'content-type':'text/html'}})};
 return {searched,read,fetcher};
}
const tools=(...pages)=>({action:'tools',note:'Checking official pages',calls:[{tool:'web_search',query:'fixture query'},...pages.map(([url])=>({tool:'read_page',url,focus:'rules'}))]});
const say=(...s)=>({action:'reply',sentences:s.map(([text,kind,evidence,extra])=>({text,kind,evidence,...extra})),memory:{goal:'fixture'}});
const env={BRAVE_SEARCH_API_KEY:'fixture'};
async function turn(c,messages,{context=null,profile=null}={}){
 const w=world({results:c.results||[]});const prompts=[];
 const ai={run:async(_m,o)=>{const p=JSON.parse(o.messages[1].content);prompts.push(p);const step=c.script[Math.min(prompts.length-1,c.script.length-1)];return {response:JSON.stringify(step)}}};
 const logs=[],orig=console.log;console.log=(...a)=>logs.push(a.join(' '));
 let out;try{out=await runAssistantTurn({messages,profile,context},env,{ai,fetcher:w.fetcher,reserve:async()=>true,now:()=>new Date('2026-10-28T08:00:00Z'),maxCalls:c.maxCalls||6})}finally{console.log=orig}
 const ev=logs.map(l=>{try{return JSON.parse(l)}catch(_){return null}}).find(x=>x?.event==='orivia-assistant')||{};
 const rejected=prompts.slice(1).map(p=>p.previous_reply_rejected).filter(Boolean).map(r=>JSON.stringify(r));
 return {out,prompts,rejected,outcome:ev.outcome,w};
}
const user=t=>[{role:'user',content:t}];

const CASES=[
 {id:'uae-requirement-emirates-id',area:'official requirement',region:'UAE',
  question:'I just got my residence visa in Dubai, do I need an Emirates ID?',results:[P.eid],
  script:[tools(P.eid),say(['Yes. Residents must apply for an Emirates ID within 30 days of their residence visa being issued.','official_rule',['E1']],['You need your passport and residence visa.','official_rule',['E1']])],
  check:({out})=>{assert.match(out.reply,/30 days/);assert.equal(out.liveSources[0].category,'official')}},
 {id:'uk-fee-maintenance-outside-london',area:'fees',region:'UK',
  question:'I’m going to study in Manchester. How much money do I need to show for my student visa?',results:[P.ukMoney],
  script:[tools(P.ukMoney),
   say(['Because you’ll study outside London, you need £1,483 for each month of your course.','official_rule',['E1']]),
   say(['Because you’ll study outside London, you must have £1,136 for each month of your course, for up to 9 months.','official_rule',['E1']])],
  check:({out,rejected})=>{assert.ok(rejected.length>=1,'the London figure stated for outside London is refused');assert.match(out.reply,/1,136/);assert.doesNotMatch(out.reply,/1,483/)}},
 {id:'uae-fee-nol-silver-gold',area:'fees',region:'UAE',
  question:'Which nol card should I get in Dubai and how much is it?',results:[P.nol],
  script:[tools(P.nol),
   say(['The Gold card costs AED 25, including AED 19 credit, and gives access to gold class seats.','official_rule',['E1']]),
   say(['The Silver card is AED 25 from any ticket office, including AED 19 e-purse value.','official_rule',['E1']],['The Gold card gives access to the metro’s gold class seats for a premium fare.','official_rule',['E1']])],
  check:({out,rejected})=>{assert.ok(rejected.some(r=>/only state a figure for what the source states it for/.test(r)));assert.match(out.reply,/Silver card is AED 25/)}},
 {id:'uk-jurisdiction-prescriptions-scotland',area:'jurisdiction',region:'UK (Scotland)',
  question:'I live in Glasgow now. How much does a prescription cost?',results:[P.rxEngland,P.rxScotland],
  script:[tools(P.rxEngland,P.rxScotland),
   say(['A prescription costs £9.90 for each item.','official_rule',['E1']]),
   say(['Prescriptions are free for everyone in Scotland.','official_rule',['E2']])],
  check:({out,rejected})=>{assert.ok(rejected.length>=1,'an England-only charge is not an official rule for someone in Scotland');assert.match(out.reply,/free for everyone in Scotland/);assert.doesNotMatch(out.reply,/9\.90/)}},
 {id:'uae-jurisdiction-uk-page-for-uae',area:'jurisdiction',region:'UAE',
  question:'I’m in Sharjah with a UK licence. Can I keep driving on it?',results:[P.ukLicence,P.uaeLicence],
  script:[tools(P.ukLicence,P.uaeLicence),
   say(['You can drive on a valid licence from a designated country for up to 12 months.','official_rule',['E1']]),
   say(['Residents holding a licence from an eligible country can convert it to a UAE driving licence without taking a driving test.','official_rule',['E2']])],
  check:({out,rejected})=>{assert.ok(rejected.some(r=>/cannot rest on UK official pages/.test(r)));assert.match(out.reply,/convert it to a UAE driving licence/)}},
 {id:'uae-conflict-official-vs-community',area:'conflicting sources',region:'UAE',
  question:'Can I open a bank account in Dubai before my Emirates ID arrives?',results:[P.bank,P.reddit],
  script:[tools(P.bank,P.reddit),
   say(['You can open an account with just your visa page and passport.','official_rule',['E2']]),
   say(['Banks require a valid Emirates ID to open a personal account.','official_rule',['E1']],['Some people say they opened an account with their visa page and passport, and the bank took the Emirates ID later.','experience',['E2']])],
  check:({out,rejected})=>{assert.ok(rejected.some(r=>/cannot rest on community/.test(r)));const cats=out.liveSources.map(s=>s.category);assert.ok(cats.includes('official')&&cats.includes('community'),'both sides shown, each labelled')}},
 {id:'uk-complementary-two-official-levels',area:'complementary sources (not a conflict)',region:'UK',
  question:'I’m a full-time student in Manchester. Do I pay Council Tax?',results:[P.ctaxStudent,P.ctaxCouncil],
  script:[tools(P.ctaxStudent,P.ctaxCouncil),
   say(['Households where everyone is a full-time student do not have to pay Council Tax.','official_rule',['E1']],['To get the exemption, Manchester asks you to send a student certificate from your university.','official_rule',['E2']])],
  // Two official pages that add to each other (national rule, council's process) aren't a conflict; both cited.
  check:({out})=>{assert.equal(out.liveSources.length,2);assert.match(out.reply,/student certificate/)}},
 {id:'uae-followup-fee-after-requirement',area:'follow-up',region:'UAE',
  question:'(follow-up) How much does the Emirates ID cost?',results:[P.eidFee],followUp:true,
  script:[tools(P.eidFee),say(['The Emirates ID fee for residents is AED 100 for each year of validity.','official_rule',['E2']],['You need to apply within 30 days of your residence visa being issued.','official_rule',['E1']])],
  check:({out})=>{assert.match(out.reply,/AED 100/);assert.match(out.reply,/30 days/,'the first turn’s page is still usable as evidence');assert.ok(out.liveSources.some(s=>s.url===P.eid[0]))}},
 {id:'uae-unavailable-page-missing',area:'unavailable information',region:'UAE',
  question:'What is the student visa fee at the University of Sharjah?',results:[P.sharjahVisa],maxCalls:5,
  script:[tools(P.sharjahVisa),say(['The student visa fee is AED 1,000.','general',[]])],
  check:({out})=>{assert.doesNotMatch(out.reply,/1,000/,'no figure without a page that states it');assert.ok(!out.liveSources?.length,'no source is shown that was never read')}},
 {id:'uk-unavailable-no-results',area:'unavailable information',region:'UK',
  question:'What is the deadline for the Leeds student rail discount?',results:[],
  script:[tools(),say(['I couldn’t find an official page about this, so I can’t confirm a deadline. Your university’s student services can tell you.','general',[]])],
  check:({out})=>{assert.match(out.reply,/couldn’t find an official page/);assert.doesNotMatch(out.reply,/\d/)}},
 {id:'uk-date-not-in-source',area:'official requirement',region:'UK',
  question:'I’m starting at a UK university. Do I still get a BRP?',results:[P.evisa],
  script:[tools(P.evisa),
   say(['You need to create a UKVI account by 31 January to access your eVisa.','official_rule',['E1']]),
   say(['You need to create a UKVI account to access your eVisa.','official_rule',['E1']],['Biometric residence permits expired on 31 December 2024.','official_rule',['E1']])],
  check:({out,rejected})=>{assert.ok(rejected.some(r=>/states a date the cited evidence doesn't state/.test(r)));assert.doesNotMatch(out.reply,/31 January/)}},
 {id:'uae-conflict-two-official-fees',area:'conflicting sources',region:'UAE',
  question:'How much is an Emirates ID?',results:[P.eidFeeUae,P.eidFeeIcp],
  script:[tools(P.eidFeeUae,P.eidFeeIcp),
   say(['The Emirates ID fee is AED 100 for each year of validity.','official_rule',['E1']]),
   say(['The official pages differ on the Emirates ID fee.','general',[]],['One says the Emirates ID fee is AED 100 for each year of validity.','official_rule',['E1']],['Another says the Emirates ID fee is AED 270 for a two-year card, including service charges.','official_rule',['E2']])],
  check:({out,rejected})=>{assert.ok(rejected.some(r=>/another official page \(E2\) gives AED 270/.test(r)),'one figure alone hides the disagreement');assert.match(out.reply,/AED 100/);assert.match(out.reply,/AED 270/);assert.equal(out.liveSources.length,2)}},
 {id:'uae-emirate-dubai-page-for-sharjah',area:'jurisdiction',region:'UAE (Sharjah)',
  question:'I live in Sharjah. How do I pay for public parking?',results:[P.parkDubai,P.parkSharjah],
  script:[tools(P.parkDubai,P.parkSharjah),
   say(['Public parking is paid by nol card or the mParking text service.','official_rule',['E1']]),
   say(['Public parking is paid through the Mawqif app or parking machines.','official_rule',['E2']])],
  check:({out,rejected})=>{assert.ok(rejected.some(r=>/emirate pages for Dubai/.test(r)),'a Dubai authority’s rule is not the rule in Sharjah');assert.match(out.reply,/Mawqif/);assert.doesNotMatch(out.reply,/mParking/)}},
 {id:'uae-emirate-other-emirate-service-allowed',area:'jurisdiction',region:'UAE (Sharjah, Dubai service)',
  question:'I’m in Sharjah but I’ll use the Dubai Metro. Which nol card should I get?',results:[P.nol],
  script:[tools(P.nol),say(['The Silver card is AED 25 from any ticket office, including AED 19 e-purse value.','official_rule',['E1']])],
  check:({out,rejected})=>{assert.equal(rejected.length,0,'Dubai’s own rules for its metro are not refused for a Sharjah resident');assert.match(out.reply,/AED 25/)}},
 {id:'uk-england-only-govuk-for-wales',area:'jurisdiction',region:'UK (Wales)',
  question:'I’ve moved to Cardiff. What are Council Tax bands based on?',results:[P.ctaxEngland,P.ctaxWales],
  script:[tools(P.ctaxEngland,P.ctaxWales),
   say(['Council Tax bands are based on property values on 1 April 1991.','official_rule',['E1']]),
   say(['Bands are based on property values on 1 April 2003.','official_rule',['E2']])],
  check:({out,rejected})=>{assert.ok(rejected.some(r=>/someone in Wales cannot rest only on pages for England/.test(r)),'a gov.uk page that speaks only for England');assert.match(out.reply,/2003/);assert.doesNotMatch(out.reply,/1991/)}},
];

const results=[];
for(const c of CASES){
 let r,ok=true,error='';
 try{
  if(c.followUp){
   const first=CASES[0];const t1=await turn(first,user(first.question));
   r=await turn(c,[...user(first.question),{role:'assistant',content:t1.out.reply},...user('How much does it cost?')],{context:{task:{assistant:t1.out.research.taskContext.task.assistant}}});
  }else r=await turn(c,user(c.question));
  assert.ok(r.out&&r.out.reply,'a reply came back');c.check(r);
 }catch(e){ok=false;error=String(e.message||e).split('\n')[0].slice(0,300)}
 results.push({id:c.id,area:c.area,region:c.region,question:c.question,mode:'scripted model + fixture pages (no provider call)',pass:ok,
  outcome:r?.outcome||null,rejectedReplies:r?.rejected.length??null,sources:r?.out?.liveSources?.map(s=>s.category)||[],error:error||undefined});
}
if(process.env.RESULTS)writeFileSync(process.env.RESULTS,JSON.stringify(results,null,1)+'\n');
const failed=results.filter(r=>!r.pass);
for(const r of results)console.error((r.pass?'ok   ':'FAIL ')+r.id+(r.error?' — '+r.error:''));
assert.equal(failed.length,0,failed.length+' of '+results.length+' research cases failed');
console.log(`Research set: ${results.length} UAE/UK cases (requirements, fees, jurisdiction incl. UK nations and emirates, follow-ups, conflicting sources, unavailable information) pass with fixtures and a scripted model.`);
