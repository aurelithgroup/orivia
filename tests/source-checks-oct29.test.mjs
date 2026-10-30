/* Source checks of airport, bus, SIM, community and school (29 Oct, review pack section 10): the corrections stay corrected,
   in the app and in the exported server data, and each guide's record stays partial and dated.
   Run: node tests/source-checks-oct29.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {sourceCheck} from '../workers/guide-source-checks.mjs';
import {JOURNEYS} from '../server/src/journeys-data.js';

const app=fs.readFileSync(new URL('../js/content-edinburgh.js',import.meta.url),'utf8');
const data=JSON.stringify(JOURNEYS);

for(const id of ['edinburgh.airport','edinburgh.bus','edinburgh.sim','edinburgh.community','edinburgh.school']){
 const c=sourceCheck(id);
 assert.ok(c,id+' has a source-check record');
 assert.equal(c.date,'2026-10-29',id+' dated by the real check');
 assert.equal(c.coverage,'partial',id+' is a partial check, not a full one');
 assert.match(c.record,/(section 10|sections 10 and 11)$/,id+' points to its written record');
}

// Ofcom: rolling SIM-only contracts usually need a credit check; only pay as you go avoids it.
assert.doesNotMatch(app+data,/SIM-only plan for now: most don’t need a credit check/);
assert.match(data,/Use pay as you go for now: it doesn’t need a credit check\. Monthly SIM-only plans usually do\./);
// Council: placing requests go to the school, except P1 and S1.
assert.doesNotMatch(app+data,/Make a placing request to the council\./);
assert.match(data,/Make a placing request to that school\. For a child starting P1 or S1/);
// Council: most addresses have several catchment schools.
assert.doesNotMatch(app+data,/has a catchment school: the local state school for your area/);
assert.match(data,/has catchment schools: the local state schools for your area/);
// Edinburgh Airport: the rank is a short walk from arrivals; the charged zone isn't said to charge drivers.
assert.doesNotMatch(app,/The official rank is outside the terminal\./);
assert.match(app,/The official rank is a short walk from arrivals\./);
assert.doesNotMatch(app+data,/which charges drivers/);
assert.match(data,/Pick-up is in the charged zone on the ground floor/);
// Each correction has its Arabic counterpart, and no character was lost on the way.
for(const ar of ['المنطقة المدفوعة بالطابق الأرضي','أما باقات الشريحة الشهرية فتتطلبه عادةً','«مدارس منطقة»','قدّم «طلب نقل» إلى تلك المدرسة'])assert.ok(app.includes(ar)&&data.includes(ar),'Arabic: '+ar);
assert.ok(!data.includes('�')&&!app.includes('�'),'no replacement characters');

console.log('Source checks 29 Oct: five Edinburgh guides recorded as partial; SIM credit check, placing request, catchment schools and airport pick-up corrected in English and Arabic.');
