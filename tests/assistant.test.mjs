/* Pilot assistant (consent v3): source kinds, the answer check, one scripted turn with tools, a question, memory.
   SCRIPTED (fake model, fake pages, fake search). Run: node tests/assistant.test.mjs */
import assert from 'node:assert/strict';
import {sourceKind,verifyReply,pageText,excerptFor,ownSite,runAssistantTurn,cleanMemory} from '../workers/orivia-assistant.mjs';

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
assert.equal(failing,null,'three rejected replies → fallback, never an unchecked answer');assert.equal(broken,null);assert.equal(junk,null);assert.equal(calls,2,'gives up after two unreadable steps');
// The tool deadline: with 2 steps left the model must answer
let n=0;const late=await (async()=>{console.log=()=>{};const r=await runAssistantTurn({messages:[{role:'user',content:'x'}]},env,{maxCalls:2,ai:{run:async(_m,o)=>{n++;const st=JSON.parse(o.messages[1].content);assert.ok(st.instruction,'told to reply now');return {response:'{"action":"ask","question":"Which one?"}'}}},fetcher,reserve:async()=>true});console.log=origLog;return r})();
assert.equal(late.reply,'Which one?');assert.equal(n,1);
console.log('Assistant: source kinds by address, answer check (contacts, amounts, claim/source fit, own site), cards never guessed, private search terms, memory carried and cleaned, ask, fallback on failure: passed');
