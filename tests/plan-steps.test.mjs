/* Plan steps (ORI-JOURNEY-003/004): eight states plus derived Ready, ordered dependencies (what blocks a step and what
   comes next), history with the source of each state, Undo, and the server reading the same states.
   Runs the shipped plan-steps.js and orivia-guide-offers.mjs. Run: node tests/plan-steps.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {readGuideState,progressSummary,guideContent,STEP_STATUSES} from '../workers/orivia-guide-offers.mjs';
const box={};vm.runInNewContext(fs.readFileSync('workers/trial-ui/plan-steps.js','utf8'),{window:box});const P=box.OriviaPlan;
const steps=[{id:'permit',title:'Entry permit'},{id:'arrive',title:'Arrive'},{id:'medical',title:'Medical test',waitingFor:'Your result'},{id:'eid',title:'Emirates ID'}];
// States offered: all eight; "waiting for them" only where the step waits on someone.
assert.deepEqual(JSON.parse(JSON.stringify(P.statesFor(steps[2]))),['not_started','in_progress','waiting_you','waiting_org','blocked','done','not_applicable','unsure']);
assert.ok(!P.statesFor(steps[0]).includes('waiting_org'));
// Older saves: "waiting" becomes waiting for them; unknown states and bad ids are dropped.
assert.deepEqual(JSON.parse(JSON.stringify(P.migrate({medical:'waiting',permit:'done',x:'approved','bad id':'done'}))),{medical:'waiting_org',permit:'done'});
// Dependencies: steps are in order. Ready only when everything earlier is done or not applicable.
let e={};assert.equal(P.shown(e,steps,0),'ready');assert.equal(P.shown(e,steps,1),'not_started');
assert.deepEqual(JSON.parse(JSON.stringify(P.blockers(e,steps,2).map(x=>x.id))),['permit','arrive']);assert.deepEqual(JSON.parse(JSON.stringify(P.next(e,steps))),{index:0,id:'permit',title:'Entry permit',state:'ready'});
e=P.change(e,'permit','done',1000);e=P.change(e,'arrive','not_applicable',2000);
assert.equal(P.shown(e,steps,2),'ready','not applicable no longer blocks');assert.deepEqual(JSON.parse(JSON.stringify(P.blockers(e,steps,3).map(x=>x.id))),['medical']);
e=P.change(e,'medical','waiting_org',3000);assert.equal(P.next(e,steps).id,'medical');assert.equal(P.next(e,steps).state,'waiting_org','what comes next says it’s waiting');
// Blocked keeps an optional note while blocked, and drops it after.
e=P.change(e,'eid','blocked',4000,'  Need a tenancy contract first  ');assert.equal(e.notes.eid,'Need a tenancy contract first');assert.equal(P.shown(e,steps,3),'blocked');
// History: who and when, for the step's "You marked this …" line.
assert.deepEqual(JSON.parse(JSON.stringify(P.lastChange(e,'medical'))),{step:'medical',from:'not_started',to:'waiting_org',at:3000,by:'you'});
assert.equal(P.change(e,'medical','waiting_org',5000).history.length,e.history.length,'choosing the same state again records nothing');
// Undo: the last change only, back to exactly what it was (note included).
let u=P.undo(e);assert.equal(u.undone.step,'eid');assert.equal(u.entry.stepStatus.eid,undefined);assert.equal(u.entry.notes.eid,undefined);assert.equal(u.entry.history.length,e.history.length-1);
u=P.undo(u.entry);assert.equal(u.entry.stepStatus.medical,undefined);u=P.undo(u.entry);assert.equal(u.entry.stepStatus.arrive,undefined);
// Undo refuses when the step changed elsewhere since (e.g. another device's copy arrived): nothing is overwritten.
const elsewhere={...e,stepStatus:{...e.stepStatus,eid:'done'}};assert.equal(P.undo(elsewhere),null);
// Done is counted as finished, never anything more; history is bounded.
let big={};for(let k=0;k<70;k++)big=P.change(big,'permit',k%2?'done':'in_progress',k);assert.equal(big.history.length,50);
assert.equal(P.change({},'permit','approved',1).stepStatus.permit,undefined,'no state outside the list');
// The guide view says what Done means, shows blockers, the next step, the source of the state and Undo.
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8');
for(const s of ['Done is your own record, not an official approval or result.','Before this step','Next for you','You marked this','Fees and timings appear only where the official source states them','PLAN.undo(readJourneys()[id])'])assert.ok(chat.includes(s),s);
// The server reads the same states (and the older one), never anything else, and tells the AI in plain words.
const g=readGuideState({guides:{progress:{'dubai.eid.student':{permit:'done',arrive:'not_applicable',medical:'waiting',eid:'blocked',x:'approved'}}}});
assert.deepEqual(g.progress['dubai.eid.student'],{permit:'done',arrive:'not_applicable',medical:'waiting',eid:'blocked'},'an unknown state ("approved") is dropped');
const sum=progressSummary('dubai.eid.student',{permit:'done',arrive:'not_applicable',medical:'waiting_org'});assert.match(sum,/Not applicable to them: /);assert.match(sum,/Waiting for the organisation: /);
assert.ok(STEP_STATUSES.every(s=>s==='waiting'||P.STATES.includes(s)),'server and app agree on the states');
const eid=guideContent('dubai.eid.student');assert.ok(eid.steps.every(s=>!s.statuses.includes('waiting')),'the older state is never offered');
console.log('Plan steps: eight states with Ready derived, ordered blockers and next step, blocked notes, history with source, Undo of the last change only, server agreement: pass.');
