/* Claims the review pack found unsupported, unconfirmed or conflicting are qualified where people read them (30 Oct),
   not only noted in the pack; the changed steps' Arabic is marked not yet reviewed. Run: node tests/claims-qualified.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const {JOURNEYS}=createRequire(import.meta.url)('../server/src/journeys-data.js');
const text=id=>JSON.stringify(JOURNEYS[id]);
const app=['js/content.js','js/content-edinburgh.js','js/context.js','js/simple.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
// Each: [guide, qualified wording that must appear, unqualified wording that must be gone] (pack section in brackets).
const cases=[
 ['dubai.eid.student','Universities say it usually takes about 7–15 working days. The official pages don’t give a time.',"{en:'It usually takes about 7–15 working days.'"], // 1
 ['dubai.eid.student','Universities say the whole process usually takes about 3–5 weeks',"{en:'After your medical test and fingerprints, your university applies for your residence visa. The whole process usually takes"], // 1
 ['dubai.eid.student','ask your university how long it must still be valid','usually valid for 6+ months'], // 1
 ['dubai.studentwork','MOHRE’s page doesn’t say which kinds of work it covers, so ask the employer','part-time, temporary, flexible or remote'], // 11
 ['dubai.bank','Sanadak’s own pages say 15 days in one place and 30 in another',null], // 11 conflict
 ['dubai.rent','Check the exact fee on the payment screen before you pay',null], // 11 ambiguity
 ['edinburgh.u22','We haven’t confirmed this on an official page yet: check with Young Scot.',null], // 8
 ['edinburgh.u22','These times aren’t confirmed on an official page yet.',null], // 8
 ['edinburgh.gp','We haven’t confirmed this against an official page yet, so check with the pharmacy',null], // 8
 ['edinburgh.rent','Key money, non-refundable holding deposits and credit-check fees aren’t allowed.','Agency fees, key money, holding fees and credit-check fees are illegal, and you can claim them back.'], // 8
];
for(const [id,good,bad] of cases){assert.ok(text(id).includes(good),id+' qualified: '+good);if(bad)assert.ok(!text(id).includes(bad)&&!app.includes(bad),id+' no longer says: '+bad)}
assert.ok(app.includes("add('edinburgh.evisa','share',{cost:v('Not stated on GOV.UK’s page'")&&!app.includes("add('edinburgh.evisa','share',{cost:v('Free'"),'share code cost not asserted'); // 2
assert.ok(app.includes("time:v('Usually 7–15 working days, universities say'")&&app.includes('Universities say it usually takes 7–15 working days.'),'short timing labels attributed too');
// Steps whose Arabic changed are marked for language review.
for(const [id,step] of [['dubai.eid.student','permit'],['dubai.studentwork','permit'],['dubai.rent','ejari'],['edinburgh.gp','pay'],['edinburgh.rent','apply']].filter(([id,s])=>JOURNEYS[id].steps.some(x=>x.id===s)))
 assert.deepEqual(JOURNEYS[id].steps.find(s=>s.id===step).translationPending,['ar'],id+' '+step+' Arabic marked');
console.log('Claims qualified in the guides: '+cases.length+' unsupported or conflicting claims reworded or labelled where people read them; changed Arabic marked for review.');
