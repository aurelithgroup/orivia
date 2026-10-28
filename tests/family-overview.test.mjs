/* Family overview (week 6, ORI-JOURNEY-009): plans grouped by person on top of Ina's separate family plans (batch 1).
   Pure function from workers/trial-ui/plan-steps.js. Run: node tests/family-overview.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync('workers/trial-ui/plan-steps.js','utf8'),ctx);
const P=ctx.OriviaPlan;
const titles={permit:'Entry permit',arrive:'Tell your university',medical:'Medical test',card:'Emirates ID'};
const mine={title:'Student visa',status:'active',steps:4,titles,stepStatus:{permit:'done',arrive:'waiting_you'},updated:'2026-10-28T10:00:00Z'};
const child1={title:'Student visa',status:'active',label:'Child 1',steps:4,titles,stepStatus:{permit:'done',arrive:'done',medical:'blocked'},updated:'2026-10-28T11:00:00Z'};
const child2={title:'School place',status:'saved',label:'Child 2',steps:2,titles:{find:'Find a school',apply:'Apply'},stepStatus:{find:'waiting_org'},updated:'2026-10-28T09:00:00Z'};

// One person's own plans: nothing to group, the section stays hidden
assert.equal(P.family([['dubai.eid.student',mine]]).show,false);

const v=P.family([['dubai.eid.student',mine],['family.abc',child1],['family.def',child2],['old',{title:'Finished',status:'done',steps:1}]]);
assert.equal(v.show,true);
assert.equal(JSON.stringify(v.people.map(p=>p.own?'(you)':p.label)),JSON.stringify(['(you)','Child 1','Child 2']),'own plans first, then each label');
const you=v.people[0].plans[0];
assert.equal(you.done,1);assert.equal(you.total,4);assert.equal(you.next.id,'arrive');assert.equal(you.next.state,'waiting_you');assert.equal(you.needsMe,1);
const c1=v.people[1].plans[0];
assert.equal(c1.done,2);assert.equal(c1.next.id,'medical');assert.equal(c1.next.state,'blocked');assert.equal(c1.needsMe,1,'a blocked step needs the person');
const c2=v.people[2].plans[0];
assert.equal(c2.waitingOrg,1);assert.equal(c2.needsMe,0);
assert.ok(!v.people.some(p=>p.plans.some(x=>x.title==='Finished')),'finished plans are left out of the overview');
assert.equal(v.people.reduce((n,p)=>n+p.plans.length,0),3);

// A separate plan doesn't inherit another person's progress (Ina's duplicate), and its label is only the person's words
const fresh=JSON.parse(JSON.stringify({title:'Student visa',status:'saved',label:'Child 3',steps:4,titles,stepStatus:{},updated:'x'}));
const w=P.family([['family.ghi',fresh]]);assert.equal(w.people[0].plans[0].done,0);assert.equal(w.people[0].label,'Child 3');
// Older saves without step titles still count
assert.equal(P.family([['family.x',{title:'Bank',status:'active',label:'Partner',steps:3,stepStatus:{}}]]).people[0].plans[0].total,3);

const page=fs.readFileSync('workers/trial-ui/page.html','utf8'),chat=fs.readFileSync('workers/trial-ui/chat.js','utf8');
assert.match(page,/id="life-family" hidden/,'the section starts hidden');assert.match(chat,/renderFamilyOverview\(journeys\)/);
const tr=JSON.parse(fs.readFileSync('workers/trial-ui/translations.json','utf8'));for(const k of ['Family plans','Needs you','Waiting for them','All steps done'])assert.ok(tr[k]?.fr&&tr[k]?.ar,k);
console.log('Family overview: plans grouped by person, own first; progress, next step and what needs the person; hidden for one person.');
