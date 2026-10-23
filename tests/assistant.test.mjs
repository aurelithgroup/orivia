/* Pilot assistant (consent v3): source kinds, the answer check, one scripted turn with tools, a question, memory.
   SCRIPTED (fake model, fake pages, fake search). Run: node tests/assistant.test.mjs */
import assert from 'node:assert/strict';
import {sourceKind,verifyReply,pageText,excerptFor,ownSite,runAssistantTurn,cleanMemory,regionOf,personRegion,bestQuote,render,limitReply,progressLabel,salvageReply,evidenceView,parseJSON,normaliseStep} from '../workers/orivia-assistant.mjs';
import {runAgentTurn} from '../workers/orivia-research-agent.mjs';
import {planResearch,isWritingRequest} from '../workers/orivia-research-plan.mjs';
import {maybeResearch} from '../workers/orivia-research-loop.mjs';

// Source kinds come from the address, never from the model
assert.equal(sourceKind('https://u.ae/en/information-and-services/visa'),'government');
assert.equal(sourceKind('https://www.gov.uk/register-with-a-gp'),'government');
assert.equal(sourceKind('https://www.nhsinform.scot/care-support-and-rights/nhs-services/doctors/registering-with-a-gp-practice'),'government');
assert.equal(sourceKind('https://spea.shj.ae/en/education-institutes/schools/x'),'regulator');
assert.equal(sourceKind('https://www.khda.gov.ae/en/schools'),'regulator');
assert.equal(sourceKind('https://www.reddit.com/r/dubai/comments/1'),'community');
assert.equal(sourceKind('https://whichschooladvisor.com/uae/x'),'listing');
assert.equal(sourceKind('https://www.wesgreen.sch.ae/contact'),'website');
assert.equal(sourceKind('not a url'),'unknown');

// Page text keeps contact links and drops scripts
const html='<html><head><title>Contact | Wes Green School</title><script>evil()</script></head><body><nav>Home</nav><p>Admissions office</p><a href="tel:+97165551234">Call us</a><a href="mailto:admissions@wesgreen.sch.ae">Email</a><footer>PO Box 1 Sharjah</footer></body></html>';
const pt=pageText(html);assert.equal(pt.title,'Contact | Wes Green School');assert.match(pt.text,/\+97165551234/);assert.match(pt.text,/admissions@wesgreen\.sch\.ae/);assert.ok(!/evil/.test(pt.text));
assert.ok(excerptFor('a '.repeat(3000)+'\nPhone: +971 6 555 1234\n','contact phone',300).includes('+971 6 555 1234'),'contact lines survive the excerpt');

// The answer check
const ledger=[
 {id:'E1',url:'https://www.wesgreen.sch.ae/contact',title:'Contact | Wes Green School',kind:'website',excerpt:'Admissions office. Call +971 6 555 1234 or email admissions@wesgreen.sch.ae. Fees from AED 32,000.'},
 {id:'E2',url:'https://whichschooladvisor.com/uae/wes-green',title:'Wes Green review',kind:'listing',excerpt:'Wes Green Int. Pvt. School is a British school in Sharjah. Phone +971 6 999 0000.'},
 {id:'E3',url:'https://u.ae/en/residents/emirates-id',title:'Emirates ID',kind:'government',excerpt:'You must apply for an Emirates ID within 30 days of entering the country.'},
 {id:'E4',url:'https://www.reddit.com/r/sharjah/1',title:'Bank accounts without EID',kind:'community',excerpt:'Several people opened an account with the visa page and a salary letter.'}];
assert.ok(ownSite(ledger[0],'Wes Green Int. Pvt. School'));assert.ok(!ownSite(ledger[1],'Wes Green Int. Pvt. School'));
let v=verifyReply({sentences:[
 {text:'You can call the admissions office on +971 6 555 1234.',kind:'organisation_fact',org:'Wes Green Int. Pvt. School',evidence:['E1']},
 {text:'You must apply for an Emirates ID within 30 days of arriving.',kind:'official_rule',evidence:['E3']},
 {text:'Some people say a visa page and salary letter were enough.',kind:'experience',evidence:['E4']},
 {text:'I can draft an email for you if that helps.',kind:'general',evidence:[]}],
 organisations:[{name:'Wes Green Int. Pvt. School',kind:'school',evidence:['E2'],contacts:{phone:{value:'+971 6 555 1234',evidence:'E1'},email:{value:'admissions@wesgreen.sch.ae',evidence:'E1'},website:{url:'https://www.wesgreen.sch.ae/contact',evidence:'E1'}},facts:[{label:'Fees from',value:'AED 32,000',evidence:'E1'}]}]},ledger);
assert.equal(v.ok,true,JSON.stringify(v.errors));assert.equal(v.orgs[0].phone.value,'+971 6 555 1234');assert.ok(v.orgs[0].site);assert.equal(v.orgs[0].facts.length,1);
const bad=(s,re,msg)=>{const r=verifyReply({sentences:[s]},ledger);assert.equal(r.ok,false,msg);assert.match(r.errors.join(' | '),re,msg)};
bad({text:'Call them on +971 6 123 4567.',kind:'organisation_fact',org:'Wes Green',evidence:['E1']},/phone .* not in the cited evidence/,'invented phone number');
bad({text:'Call them on +971 6 555 1234.',kind:'general',evidence:[]},/cites no evidence/,'a contact in an unsourced sentence');
bad({text:'You must apply within 30 days.',kind:'official_rule',evidence:['E2']},/cannot rest on listing/,'a rule from a listing site');
bad({text:'Their phone is +971 6 999 0000.',kind:'organisation_fact',org:'Wes Green Int. Pvt. School',evidence:['E2']},/own site/,'an organisation fact from someone else’s site');
bad({text:'A visa page is enough.',kind:'experience',evidence:['E3']},/cannot rest on government/,'experience needs a community source');
bad({text:'Fees are AED 45,000.',kind:'organisation_fact',org:'Wes Green',evidence:['E1']},/amount .* not in the cited evidence/,'invented fee');
bad({text:'See E9.',kind:'listing',evidence:['E9']},/does not exist/,'unknown evidence id');
// Without "org", the organisation named in the sentence decides whether the page is its own site
assert.equal(verifyReply({sentences:[{text:'Wes Green International School says admissions are open.',kind:'organisation_fact',evidence:['E1']}]},ledger).ok,true,'name in the sentence, own site');
assert.equal(verifyReply({sentences:[{text:'Imaginary Academy says admissions are open.',kind:'organisation_fact',evidence:['E1']}]},ledger).ok,false,'another organisation’s site');
// Cards: an unsourced contact is dropped, never guessed; an organisation not on the page is dropped
v=verifyReply({sentences:[{text:'Here is the school.',kind:'general'}],organisations:[
 {name:'Wes Green Int. Pvt. School',evidence:['E1'],contacts:{phone:{value:'+971 6 000 0000',evidence:'E1'}}},
 {name:'Imaginary Academy',evidence:['E1']}]},ledger);
assert.equal(v.ok,true);assert.equal(v.orgs.length,1);assert.equal(v.orgs[0].phone,null);

// Memory from the device is cleaned: non-https evidence, oversized fields and unknown keys are dropped
const mem=cleanMemory({goal:'x'.repeat(900),criteria:[{name:'curriculum',value:'British'},{name:'',value:'y'}],evidence:[{url:'http://insecure.example/',excerpt:'a'},{url:'https://ok.example/p',title:'T',excerpt:'Words'}],evil:1});
assert.equal(mem.goal.length,300);assert.equal(mem.criteria.length,1);assert.equal(mem.evidence.length,1);assert.ok(!('evil' in mem));

// One scripted turn: search, read the school's contact page, a rejected reply with an invented number, then a checked reply
const searched=[],fetched=[],prompts=[];
const fetcher=async(u,init)=>{const url=String(u);
 if(url.startsWith('https://api.search.brave.com/')){searched.push(new URL(url).searchParams.get('q'));return Response.json({web:{results:[{url:'https://www.wesgreen.sch.ae/contact',title:'Contact Wes Green',description:'Contact us'}]}})}
 fetched.push(url);if(url==='https://www.wesgreen.sch.ae/contact')return new Response(html.replace('</body>','<p>Fees from AED 32,000.</p></body>'),{headers:{'content-type':'text/html'}});
 return new Response('',{status:404,headers:{'content-type':'text/html'}})};
const script=[
 {action:'tools',note:'Finding contact details',calls:[{tool:'web_search',query:'Wes Green school Sharjah contact my son Ali +971501234567'},{tool:'read_page',url:'https://www.wesgreen.sch.ae/contact',focus:'admissions contact'}]},
 {action:'reply',sentences:[{text:'Call admissions on +971 6 777 7777.',kind:'organisation_fact',org:'Wes Green',evidence:['E1']}],memory:{}},
 {action:'reply',sentences:[{text:'You can reach Wes Green’s admissions office by phone or email.',kind:'organisation_fact',org:'Wes Green',evidence:['E1']},{text:'Fees start from AED 32,000.',kind:'organisation_fact',org:'Wes Green',evidence:['E1']}],
  organisations:[{name:'Wes Green School',kind:'school',evidence:['E1'],contacts:{phone:{value:'+97165551234',evidence:'E1'},email:{value:'admissions@wesgreen.sch.ae',evidence:'E1'}}}],
  memory:{goal:'Contact Wes Green admissions',criteria:[{name:'school',value:'Wes Green'}],shown:['Wes Green School'],open:['Year 6 places']}}];
const ai={run:async(_m,o)=>{prompts.push(JSON.parse(o.messages[1].content));assert.equal(o.json,true);return {response:JSON.stringify(script[prompts.length-1])}}};
const env={BRAVE_SEARCH_API_KEY:'k',SPEA_DIRECTORY_FEED:'1'};
const logs=[],origLog=console.log;console.log=(...a)=>logs.push(a.join(' '));
const out=await runAssistantTurn({messages:[{role:'user',content:'how do i contact wes green about admissions'}],profile:{city:'Sharjah',who:'Family'}},env,{ai,fetcher,reserve:async()=>true});
console.log=origLog;
assert.ok(out,'a checked reply');assert.equal(prompts.length,3,'search+read, rejected reply, corrected reply');
assert.ok(!/Ali|\+971501234567|my son/.test(searched[0]),'search terms carry no personal details: '+searched[0]);
assert.deepEqual(prompts[0].aboutMe&&prompts[0].aboutMe.livesIn,'Sharjah','About me shared (the UI only sends it when its switch is on)');
assert.match(JSON.stringify(prompts[2].previous_reply_rejected),/not in the cited evidence/,'the model is told why its reply was rejected');
assert.match(out.reply,/\[1\]/);assert.equal(out.liveSources[0].url,'https://www.wesgreen.sch.ae/contact');assert.equal(out.liveSources[0].category,'organisation');
assert.equal(out.organisations[0].contacts.phone.value,'+97165551234');assert.equal(out.organisations[0].contacts.email.value,'admissions@wesgreen.sch.ae');
assert.ok(out.organisations[0].contacts.phone.quote.length>=4,'every card value carries a quote from the page');
assert.equal(out.research.assistant,true);assert.deepEqual(out.research.progress,['Finding contact details']);
const carried=out.research.taskContext.task.assistant;assert.equal(carried.goal,'Contact Wes Green admissions');assert.equal(carried.evidence[0].url,'https://www.wesgreen.sch.ae/contact');
const ev=JSON.parse(logs.find(l=>l.includes('orivia-assistant')));assert.equal(ev.outcome,'reply');assert.ok(!logs.join(' ').match(/wes green|admissions|Ali/i),'the log holds codes, not chat text');

// Next turn: a follow-up reuses carried evidence without reading the page again
const prompts2=[];fetched.length=0;
const ai2={run:async(_m,o)=>{prompts2.push(JSON.parse(o.messages[1].content));return {response:JSON.stringify({action:'reply',sentences:[{text:'Their email is admissions@wesgreen.sch.ae.',kind:'organisation_fact',org:'Wes Green',evidence:['E1']}],memory:carried})}}};
console.log=()=>{};const out2=await runAssistantTurn({messages:[{role:'user',content:'how do I contact Wes Green'},{role:'assistant',content:out.reply},{role:'user',content:'whats their email'}],context:{task:{assistant:carried}}},env,{ai:ai2,fetcher,reserve:async()=>true});console.log=origLog;
assert.ok(out2);assert.equal(fetched.length,0,'no page re-read');assert.equal(prompts2[0].evidence[0].from,'earlier-in-chat');assert.match(out2.reply,/admissions@wesgreen\.sch\.ae \[1\]/);

// A question when it can't proceed; a model that keeps failing the check → null (the existing pipeline answers)
console.log=()=>{};
const asked=await runAssistantTurn({messages:[{role:'user',content:'which school'}]},env,{ai:{run:async()=>({response:'{"action":"ask","question":"Which city are you in?","memory":{"goal":"find a school"}}'})},fetcher,reserve:async()=>true});
const failing=await runAssistantTurn({messages:[{role:'user',content:'call them'}]},env,{ai:{run:async()=>({response:JSON.stringify({action:'reply',sentences:[{text:'Call +971 6 123 4567.',kind:'general'}]})})},fetcher,reserve:async()=>true});
const broken=await runAssistantTurn({messages:[{role:'user',content:'hi'}]},env,{ai:{run:async()=>{throw Object.assign(Error('x'),{code:'provider-error'})}},fetcher,reserve:async()=>true});
let calls=0;const junk=await runAssistantTurn({messages:[{role:'user',content:'hi'}]},env,{ai:{run:async()=>{calls++;return {response:'not json'}}},fetcher,reserve:async()=>true});
console.log=origLog;
assert.equal(asked.reply,'Which city are you in?');assert.equal(asked.research.taskContext.task.assistant.goal,'find a school');
// Rejected replies or unusable steps after real work → an honest "couldn't check, won't guess" reply, never an unchecked
// answer and never a hand-over to an unsourced path (B2, 18 Oct). Only a model that never answered leaves it to the caller.
assert.equal(failing.research.status,'incomplete','rejected replies → honest reply');assert.match(failing.reply,/won’t guess/);assert.ok(!/123 4567/.test(failing.reply));
assert.equal(broken,null,'model unreachable from the first call → caller decides');
assert.equal(junk.research.status,'incomplete');assert.equal(calls,2,'gives up after two unreadable steps');
// The tool deadline: with 2 steps left the model must answer
let n=0;const late=await (async()=>{console.log=()=>{};const r=await runAssistantTurn({messages:[{role:'user',content:'x'}]},env,{maxCalls:2,ai:{run:async(_m,o)=>{n++;const st=JSON.parse(o.messages[1].content);assert.ok(st.instruction,'told to reply now');return {response:'{"action":"ask","question":"Which one?"}'}}},fetcher,reserve:async()=>true});console.log=origLog;return r})();
assert.equal(late.reply,'Which one?');assert.equal(n,1);
/* ---- 18 Oct pilot feedback: the hospital conversation ---- */
// Jurisdiction: a UK page can't establish a UAE rule; as general information it is allowed and labelled
assert.equal(regionOf('https://www.nhs.uk/x'),'uk');assert.equal(regionOf('https://u.ae/en/x'),'uae');assert.equal(regionOf('https://www.reddit.com/r/x'),'');
assert.equal(personRegion([{role:'user',content:'i need a hospital'},{role:'user',content:'im in sharjah and vomiting'}]),'uae');
assert.equal(personRegion([{role:'user',content:'just moved to edinburgh'}]),'uk');
const nhs={id:'E9',url:'https://www.nhs.uk/symptoms/diarrhoea-and-vomiting/',title:'Diarrhoea and vomiting - NHS',kind:'government',excerpt:'Skip to main content\nTake small, frequent sips of water if you feel sick.\nGet urgent help if you cannot keep fluids down.'};
let r=verifyReply({sentences:[{text:'You must stay home for 48 hours.',kind:'official_rule',evidence:['E9']}]},[nhs],{region:'uae'});
assert.equal(r.ok,false);assert.match(r.errors.join(' '),/someone in the UAE cannot rest on UK official pages/);
r=verifyReply({sentences:[{text:'NHS (UK) advice is to take small, frequent sips of water.',kind:'general',evidence:['E9']}]},[nhs],{region:'uae'});assert.equal(r.ok,true,JSON.stringify(r.errors));
assert.match(render(r,{region:'uae'}).liveSources[0].title,/\(UK guidance\)$/,'a UK page says so for someone in the UAE');
assert.equal(render(r,{region:'uk'}).liveSources[0].title,'Diarrhoea and vomiting - NHS');
// Quotes: the matching passage, never the site's menu
assert.equal(bestQuote(nhs,'take small, frequent sips of water'),'Take small, frequent sips of water if you feel sick.');
assert.equal(bestQuote(nhs,'apply for a residence visa online'),'','nothing relevant → no quote');
assert.ok(!/Skip to main content/i.test(pageText('<nav>Home Services</nav><a href="#m">Skip to main content</a><p>Take small sips.</p>').text));
// Same page read twice = one source, one citation number
{const page='<html><title>Sharjah hospitals</title><body><p>Al Qassimi Hospital emergency department is open 24 hours.</p><p>Call 06 518 8888.</p></body></html>';
 const steps=[{action:'tools',calls:[{tool:'read_page',url:'https://www.shj.ae/hospitals',focus:'emergency'},{tool:'read_page',url:'https://www.shj.ae/hospitals',focus:'phone'}]},
  {action:'reply',sentences:[{text:'Al Qassimi Hospital has an emergency department open 24 hours.',kind:'official_rule',evidence:['E1']},{text:'Its number is 06 518 8888.',kind:'official_rule',evidence:['E1']}],memory:{}}];let k=0;
 const quiet=console.log;console.log=()=>{};
 const o=await runAssistantTurn({messages:[{role:'user',content:'which hospital in sharjah — check https://www.shj.ae/hospitals'}]},env,{ai:{run:async()=>({response:JSON.stringify(steps[k++])})},fetcher:async()=>new Response(page,{headers:{'content-type':'text/html'}}),reserve:async()=>true});
 console.log=quiet;assert.ok(o,'verified');assert.equal(o.liveSources.length,1,'one source for one page');assert.ok(!/\[2\]/.test(o.reply));}
// Money: too little left to write a reply → an honest limit reply (with emergency numbers for health), never a hand-over
{const quiet=console.log;console.log=()=>{};let called=0;
 const poor={run:async()=>{called++;return {response:'{}'}},budgetLeft:async()=>1000,costOf:(b,o)=>b*2+o*10};
 const o=await runAssistantTurn({messages:[{role:'user',content:'im in sharjah, vomiting with a high fever'},{role:'user',content:'find me a hospital'}],context:{task:{assistant:{goal:'find a hospital'}}}},env,{ai:poor,fetcher,reserve:async()=>true});
 console.log=quiet;assert.equal(called,0,'no model call the budget cannot finish');assert.equal(o.research.status,'limit-reached');
 assert.match(o.reply,/998 for an ambulance/);assert.match(o.reply,/won’t guess/);assert.equal(o.research.taskContext.task.assistant.goal,'find a hospital','memory kept');
 assert.ok(!/998/.test(limitReply([{role:'user',content:'british schools in dubai'}],'uae',{}).reply),'no emergency line for a school question');
 assert.match(limitReply([{role:'user',content:'chest pain'}],'uk',{}).reply,/call 999 now, or 111/);
 // Enough for one reply but not a step plus a reply → the model is told to reply now
 let seen;const tight={run:async(_m,op)=>{seen=JSON.parse(op.messages[1].content);return {response:'{"action":"ask","question":"Which area?"}'}},budgetLeft:async()=>60000,costOf:(b,o)=>Math.ceil(b+o*10)};
 console.log=()=>{};await runAssistantTurn({messages:[{role:'user',content:'hospital?'}]},env,{ai:tight,fetcher,reserve:async()=>true});console.log=quiet;
 assert.ok(seen.instruction&&seen.budget.model_steps_left===1,'reply now when money is tight');
 // The transport refusing a reservation mid-turn also ends in the limit reply
 const refused={run:async()=>{throw Object.assign(Error('x'),{code:'budget-exhausted'})}};
 console.log=()=>{};const o2=await runAssistantTurn({messages:[{role:'user',content:'hospital near me'}]},env,{ai:refused,fetcher,reserve:async()=>true});console.log=quiet;
 assert.equal(o2.research.status,'limit-reached');}
// The old research path no longer answers list requests outside schools and nurseries (the "Kings College" hospital list)
{const quiet=console.log;console.log=()=>{};
 const out=await runAgentTurn({messages:[{role:'user',content:'find me a hospital in sharjah'}]},{},{understanding:{source:'model',research:true,intent:'find',topic:'hospital',location:{country:'uae',city:'Sharjah'},constraints:{curriculum:'',year:null},organisations:[],searches:[]},fetcher:async()=>{throw Error('no network')},reserve:async()=>true});
 console.log=quiet;assert.equal(out,null,'not school-shaped: left to other paths');}
// Own site: a name of only common words is matched whole; group sites by a non-listing title; listing titles never
assert.ok(ownSite({url:'https://www.dubaicollege.org/admissions',title:'Admissions',kind:'website'},'Dubai College'));
assert.ok(ownSite({url:'https://www.taaleem.ae/dbs',title:'Dubai British School Jumeirah Park | Taaleem',kind:'website'},'Dubai British School Jumeirah Park'));
assert.ok(!ownSite({url:'https://www.godubai.com/x',title:'Top 10 British schools in Dubai',kind:'website'},'Dubai British School'));
// The model's step is read tolerantly: fences, raw line breaks in strings, a second object, a brace inside a string; synonyms
assert.equal(parseJSON('```json\n{"action":"reply"}\n```').action,'reply');assert.equal(parseJSON('{"action":"ask","question":"a\nb"}').action,'ask');
assert.equal(parseJSON('{"action":"tools"} {"action":"reply"}').action,'tools');assert.equal(parseJSON('ok {"action":"reply","x":"a } b"} bye').action,'reply');assert.equal(parseJSON('nothing'),null);
assert.equal(normaliseStep({action:'answer',sentences:[{text:'x'}]}).action,'reply');assert.equal(normaliseStep({calls:[{tool:'web_search'}]}).action,'tools');assert.equal(normaliseStep({action:'dance'}).why,'unknown-action:dance');
// Short names and acronyms: a whole address part, or with a generic word attached (bankfab); never a fan or blog site
assert.ok(ownSite({url:'https://www.wio.io/personal',title:'Home',kind:'website'},'Wio'));assert.ok(ownSite({url:'https://www.bankfab.com/en-ae',title:'Home',kind:'website'},'First Abu Dhabi Bank (FAB)'));
assert.ok(!ownSite({url:'https://wiofans.blogspot.com/',title:'Home',kind:'website'},'Wio'));
// Progress labels describe the real tool calls (and never carry personal details from a query)
assert.equal(progressLabel([{tool:'web_search',query:'24 hour pharmacy Al Nahda Sharjah'},{tool:'read_page',url:'https://www.mohap.gov.ae/x'},{tool:'read_page',url:'https://www.shj.ae/y'}]),'Searching: 24 hour pharmacy Al Nahda Sharjah · Reading 2 pages: mohap.gov.ae, shj.ae');
assert.ok(!/0501234567/.test(progressLabel([{tool:'web_search',query:'call me on 0501234567 about rent'}])));
// Salvage: the sentences that passed are kept with a plain note; too little left → null
{const sv=salvageReply({sentences:[{text:'You can call the admissions office on +971 6 555 1234.',kind:'organisation_fact',org:'Wes Green',evidence:['E1']},{text:'Fees are AED 99,999.',kind:'organisation_fact',org:'Wes Green',evidence:['E1']},{text:'Ask about Year 6 places when you call.',kind:'general'}]},ledger,'',['sentence 2: amount "AED 99,999" is not in the cited evidence']);
 assert.ok(sv&&sv.sentences.length===3&&/left out some details/.test(sv.sentences.at(-1).text)&&!sv.sentences.some(s=>/99,999/.test(s.text)));
 assert.equal(salvageReply({sentences:[{text:'Fees are AED 99,999.',kind:'organisation_fact',org:'Wes Green',evidence:['E1']},{text:'Good luck!',kind:'general'}]},ledger,'',['sentence 1: x']),null);}
// What the model sees: newest pages in full, older ones shortened, within the limit
{const big=Array.from({length:12},(_,i)=>({id:'E'+(i+1),kind:'website',url:'https://x'+i+'.example/',title:'T',from:'this-turn',excerpt:'w'.repeat(2000)}));const v=evidenceView(big,8000);
 assert.equal(v.length,12);assert.equal(v.at(-1).text.length,2000);assert.ok(v[0].text.length<400);assert.ok(v.reduce((n,e)=>n+e.text.length,0)<8000+12*250);}
/* ---- 18 Oct housing test: "Okay, what should I ask them? Write me a message." ---- */
const housing=[{role:'user',content:'I’ve just moved to Manchester for uni and found a room on Facebook. The landlord wants a deposit before I view it. What should I do?'},
 {role:'assistant',content:'Generally, it’s not a good idea to pay a deposit before viewing.'},{role:'user',content:'They said someone else will take it if I don’t pay today'},
 {role:'assistant',content:'That’s a common pressure tactic.'},{role:'user',content:'They sent me a tenancy agreement though. Doesn’t that prove it’s legit?'},
 {role:'assistant',content:'A tenancy agreement doesn’t prove the landlord is genuine.'},{role:'user',content:'Okay, what should I ask them? Write me a message.'}];
// The old path: a writing request is not research and never gets an institution clarification
assert.ok(isWritingRequest('Okay, what should I ask them? Write me a message.'));assert.ok(!isWritingRequest('how do i ask for a refund'));assert.ok(!isWritingRequest('find me a hospital'));
assert.equal(planResearch(housing,{place:'University of Manchester'},null).needed,false,'no research, no "Which institution is handling it?"');
assert.equal(maybeResearch(housing,{task:{topic:'housing'}}),false);
// The assistant: drafts straight from the conversation; facts in the draft come from what the person said or the evidence
{let calls=0;const drafting={run:async(_m,o)=>{calls++;const st=JSON.parse(o.messages[1].content);assert.ok(st.conversation.some(m=>/landlord/.test(m.content)),'the landlord context is in view');
  return {response:JSON.stringify({action:'reply',sentences:[{text:'Here’s a message that asks for a viewing and proof before you pay anything.',kind:'general'}],
   draft:{to:'the landlord',channel:'message',text:'Hi, thanks for sending the tenancy agreement. Before I pay any deposit I’d like to view the room in person. Could you tell me the full address and a time this week I can come? Please also send proof that you own or manage the property. I won’t pay until I’ve seen it. Thanks, [your name]'},memory:{goal:'check a Facebook room before paying'}})}}};
 const quiet=console.log;console.log=()=>{};
 const o=await runAssistantTurn({messages:housing},env,{ai:drafting,fetcher:async()=>{throw Error('no research expected')},reserve:async()=>true});console.log=quiet;
 assert.equal(calls,1,'one step: no research, no question');assert.equal(o.draft.to,'the landlord');assert.match(o.draft.text,/view the room/);assert.match(o.draft.text,/\[your name\]/);assert.match(o.reply,/message that asks/);
 // An invented figure in a draft is rejected; one the person gave is fine; a draft-only reply still gets a line of text
 const ev=[{id:'E1',url:'https://www.gov.uk/deposit-protection-schemes-and-landlords',title:'Deposit protection',kind:'government',excerpt:'Your landlord must put your deposit in a government-backed tenancy deposit scheme.'}];
 assert.match(verifyReply({sentences:[{text:'Here it is.',kind:'general'}],draft:{to:'landlord',text:'I can pay £450 on Friday.'}},ev,{conversation:'the room is £600 a month'}).errors.join(' '),/draft: amount "£450"/);
 assert.equal(verifyReply({sentences:[{text:'Here it is.',kind:'general'}],draft:{to:'landlord',text:'The advert says £600 a month.'}},ev,{conversation:'the room is £600 a month'}).ok,true);
 let k2=0;const draftOnly={run:async()=>({response:JSON.stringify({action:'reply',sentences:[],draft:{to:'the landlord',channel:'email',subject:'Viewing before deposit',text:'Hello, could I view the room first? [your name]'}})})};
 console.log=()=>{};const o2=await runAssistantTurn({messages:housing},env,{ai:draftOnly,fetcher,reserve:async()=>true});console.log=quiet;
 assert.equal(o2.draft.channel,'email');assert.equal(o2.draft.subject,'Viewing before deposit');assert.ok(o2.reply.length>10,'a short line introduces the draft');}
/* ---- 18 Oct accommodation test: "can you please set me a reminder i'd like to send it tomorrow" ---- */
{const convo=[...housing,{role:'assistant',content:'Here’s a message you can edit before you send it.'},{role:'user',content:'can you please set me a reminder i’d like to send it tomorrow'}];
 let seen;const setter={run:async(_m,o)=>{seen=JSON.parse(o.messages[1].content);return {response:JSON.stringify({action:'reply',sentences:[{text:'Done: I’ve set a reminder for tomorrow at 9am to send the message to the landlord.',kind:'general'}],
  reminder:{title:'Send the message to the landlord',date:'2026-10-19',time:'09:00'},memory:{}})}}};
 const quiet=console.log;console.log=()=>{};
 const o=await runAssistantTurn({messages:convo,localNow:{date:'2026-10-18',time:'21:05',weekday:'Sunday',tz:'Europe/London'}},env,{ai:setter,fetcher:async()=>{throw Error('no research expected')},reserve:async()=>true});console.log=quiet;
 assert.deepEqual(seen.local_now,{date:'2026-10-18',time:'21:05',weekday:'Sunday',tz:'Europe/London'},'the model sees the person’s own clock');
 assert.deepEqual(o.reminder,{title:'Send the message to the landlord',date:'2026-10-19',time:'09:00'});assert.match(o.reply,/reminder for tomorrow/);
 // Past dates and empty titles are refused; a reminder-only reply still gets a confirmation line
 assert.match(verifyReply({sentences:[{text:'Done.',kind:'general'}],reminder:{title:'Send it',date:'2026-10-17'}},[],{today:'2026-10-18'}).errors.join(' '),/reminder: date/);
 assert.match(verifyReply({sentences:[{text:'Done.',kind:'general'}],reminder:{title:'x',date:'2026-10-19'}},[],{today:'2026-10-18'}).errors.join(' '),/reminder: needs a short title/);
 assert.equal(verifyReply({sentences:[],reminder:{title:'Renew the Emirates ID',date:'2026-10-25',time:'25:99'}},[],{today:'2026-10-18'}).reminder.time,'09:00','a bad time falls back to 9am');
 const only={run:async()=>({response:JSON.stringify({action:'reply',sentences:[],reminder:{title:'Call the GP practice',date:'2026-10-19',time:'08:30'}})})};
 console.log=()=>{};const o2=await runAssistantTurn({messages:convo,localNow:{date:'2026-10-18'}},env,{ai:only,fetcher,reserve:async()=>true});console.log=quiet;
 assert.equal(o2.reminder.time,'08:30');assert.match(o2.reply,/set that reminder/);}
// A site not on the listing list still counts as a listing when its page reads like one
{const page='<html><title>Apartments For Rent in Sharjah - Find Properties</title><body><p>Al Nabba AED 24,000 1BHK apartment.</p></body></html>';
 const st=[{action:'tools',calls:[{tool:'read_page',url:'https://findproperties.ae/for-rent/apartments/sharjah'}]},{action:'reply',sentences:[{text:'One advert lists a 1BHK in Al Nabba for AED 24,000.',kind:'listing',evidence:['E1']}],memory:{}}];let k=0;
 const quiet=console.log;console.log=()=>{};const o=await runAssistantTurn({messages:[{role:'user',content:'apartments in sharjah — check https://findproperties.ae/for-rent/apartments/sharjah'}]},env,{ai:{run:async()=>({response:JSON.stringify(st[k++])})},fetcher:async()=>new Response(page,{headers:{'content-type':'text/html'}}),reserve:async()=>true});console.log=quiet;
 assert.equal(o.liveSources[0].category,'directory','shown as a listing site, not an organisation source');}
// Basic mode: the keyword card steps aside in research mode and, otherwise, fills a clean title and the date the message names
{const src=(await import('../workers/orivia-inline-calendar.js')).default;
 assert.match(src,/window\.oriviaResearchEnabled\(\):window\.oriviaResearchMode\)return;/);
 const title=new Function(src.match(/function reminderTitle[\s\S]*?\n \}\n/)[0]+'return reminderTitle')(),when=new Function(src.match(/function reminderWhen[\s\S]*?\n \}\n/)[0]+'return reminderWhen')();
 assert.equal(title('can you please set me a reminder i’d like to send it tomorrow'.replace('’',"'")),'Send it');assert.equal(title('remind me to call the landlord at 5pm tomorrow'),'Call the landlord');
 assert.match(when('remind me to call the landlord at 5pm tomorrow'),/T17:00$/);assert.equal(when('remind me about it'),'');}
console.log('Assistant: source kinds by address, answer check (contacts, amounts, claim/source fit, own site, jurisdiction), cards never guessed, one source per page, relevant quotes, private search terms, memory carried and cleaned, ask, budget-aware with an honest limit reply, fallback on failure, drafted messages from the conversation (no research, no institution question), reminders set from the conversation on the person’s own clock: passed');
