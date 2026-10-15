/* Run: node tests/buddy-smoke.js
 * Offline, no packages, browser globals stubbed so tests don't send personal data.
 * This tests the rules engine, not visual layout or browser interactions.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const buddy=fs.readFileSync(path.join(root,'js/buddy.js'),'utf8');
const src=fs.readFileSync(path.join(root,'js/buddy-sources.js'),'utf8');
function boot(stored){
 const localStorage={
  getItem:()=>stored?JSON.stringify(stored):null,
  setItem:()=>{}
 };
 const sessionData={};
 const sessionStorage={getItem:key=>sessionData[key]||null,setItem:(key,value)=>{sessionData[key]=value},removeItem:key=>{delete sessionData[key]}};
 const window={};
 vm.runInNewContext(src,{window});
 const instrumented=buddy.replace(
  "if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();",
  "window.__test={get:()=>s,set:x=>Object.assign(s,x),checks:()=>actionPlan().map(q=>[q.id,status(q.id)]),next:()=>nextQuestion()?.key,ask,turns:()=>turns.slice(),html:focusScreen,intro,introSetup:basics,intent:recogniseIntent,status:changeStatus,trust:trustRecord,respond:conversationResult,homeSection:homeDashboard,helpSection:helpScreen,moreSection:moreScreen,planSection:dashboard};"
 );
 assert.notEqual(instrumented,buddy,'Test injection point must be present');
 vm.runInNewContext(instrumented,{window,localStorage,sessionStorage,document:{readyState:'loading',addEventListener:()=>{}}});
 return window.__test;
}
let t=boot();
assert.equal(t.get().goal,'undecided');
assert.equal(t.get().onboarded,false);
assert.match(t.homeSection(),/Ask Orivia/);
assert.doesNotMatch(t.homeSection(),/buddy-card/);
assert.match(t.helpSection(),/emergency services/);
assert.match(t.moreSection(),/My details & preferences/);
assert.match(t.intro(),/WELCOME TO ORIVIA/);
assert.match(t.introSetup(),/name="firstName"/);
assert.match(t.introSetup(),/currently in English/);
assert.match(t.html(),/id="buddy-first-input"/);
assert.doesNotMatch(t.html(),/buddy-goal-options/);
assert.equal(t.intent("I am moving with my children"),"family");
assert.equal(t.intent("I study at university"),"student");
assert.equal(t.intent("Which metro do I take?"),"everyday");
assert.equal(t.intent("I need help"),null);
assert.equal(t.intent("university and children"),null);
assert.doesNotMatch(t.html(),/Confirm permitted-stay dates/);
t.set({goal:'family'});
assert.match(t.html(),/id="buddy-home-input"/);
assert.doesNotMatch(t.html(),/buddy-discovery/);
assert.equal(t.respond('I am studying at university').goal,'student');
assert.equal(t.respond('Tell me everything').kind,'unknown');
const universityFollowup=boot();
universityFollowup.ask('I am starting university next month');
assert.match(universityFollowup.ask('how do i get there').message,/getting to your university/);
assert.equal(universityFollowup.turns().length,4);
assert.match(universityFollowup.html(),/how do i get there/);
const noContextFollowup=boot();
assert.equal(noContextFollowup.ask('how do i get there').kind,'unknown');
assert.equal(t.turns().length,0);
t.ask('I need a metro route');
assert.equal(t.turns().length,2);
t.ask('My children need school');
assert.equal(t.turns().length,4);
assert.match(t.html(),/I need a metro route/);
assert.match(t.html(),/My children need school/);
assert.doesNotMatch(t.html(),/buddy-metrics/);
assert.equal(t.next(),'dependants');
t.set({dependants:'yes'});
assert.equal(t.next(),'school');
t.set({school:'yes'});
assert.equal(t.next(),'foreignRecords');
t.set({foreignRecords:'yes'});
assert.equal(t.next(),'stayDates');
assert.equal(t.checks().length,4);
t.status('family','waiting');
assert.equal(t.checks().find(q=>q[0]==='family')[1],'waiting');
t.set({tone:'formal'});
assert.equal(t.checks().find(q=>q[0]==='family')[1],'waiting');
t.set({goal:'student'});
assert.deepEqual(JSON.parse(JSON.stringify(t.checks().map(q=>q[0]))),['campus','studentAdmin']);
t.set({goal:'family'});
assert.equal(t.checks().find(q=>q[0]==='family')[1],'waiting');
assert.match(t.trust('family').label,/not independently reviewed/);
assert.match(t.trust('school').label,/not yet established/);
t=boot({goal:'family',dependants:'yes',actions:{family:'waiting'}});
assert.equal(t.checks().find(q=>q[0]==='family')[1],'waiting');
t=boot({actions:{family:'fake-status',bogus:'checked'}});
assert.equal(t.get().actions.family,undefined);
t=boot({onboarded:true,goal:'family',firstName:'Mariam',tone:'formal'});
assert.match(t.html(),/Mariam/);
console.log('Buddy smoke checks passed');
