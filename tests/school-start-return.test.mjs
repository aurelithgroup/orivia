/* School start and school return (29 Oct): new steps on the existing Dubai and Edinburgh school guides, with their
   source checks recorded and the limits marked. Dubai's KHDA claims were checked only through search, so those steps stay
   at draft level and say so; the Arabic of every new step is marked not yet reviewed, in the app and for the assistant.
   Run: node tests/school-start-return.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {sourceCheck} from '../workers/guide-source-checks.mjs';
const {JOURNEYS}=createRequire(import.meta.url)('../server/src/journeys-data.js');
for(const id of ['dubai.school','edinburgh.school']){
 const steps=JOURNEYS[id].steps.map(s=>s.id);assert.deepEqual(steps.slice(-2),['start','return'],id+' gains start and return after its existing steps');
 for(const s of JOURNEYS[id].steps.filter(s=>['start','return'].includes(s.id)))assert.deepEqual(s.translationPending,['ar'],id+' '+s.id+' Arabic marked for review');
 for(const s of JOURNEYS[id].steps.filter(s=>!['start','return'].includes(s.id)))assert.equal(s.translationPending,undefined,id+' '+s.id+' unchanged');
 assert.equal(sourceCheck(id)?.coverage,'partial',id+' source check is partial');
}
for(const s of JOURNEYS['dubai.school'].steps.filter(s=>['start','return'].includes(s.id))){
 assert.equal(s.viaSearch,'2026-10-29','Dubai steps say they were checked through search');
 assert.ok(s.info.some(x=>/through search on 29 October 2026, not read directly/.test(x.en)),'and say so to the reader');}
assert.ok(!JOURNEYS['edinburgh.school'].steps.some(s=>s.viaSearch),'Edinburgh pages were read directly');
// The Dubai steps are not shown as official; the Edinburgh ones are.
const src=fs.readFileSync('js/content.js','utf8'),edi=fs.readFileSync('js/content-edinburgh.js','utf8');
assert.ok(/\{id:'start', viaSearch:'2026-10-29', pendingAr:true,/.test(src)&&!/\{id:'start', level:'source', viaSearch/.test(src),'Dubai start stays at draft level');
assert.ok(/\{id:'start', level:'source', pendingAr:true,/.test(edi));
// The app tells Arabic readers, in Arabic, when a step's Arabic isn't reviewed.
assert.ok(fs.readFileSync('js/app.js','utf8').includes("s.pendingAr && lang()==='ar' ? '<div class=\"tip\" lang=\"ar\" dir=\"rtl\"><b>ترجمة لم تُراجع بعد</b>"));
// The website app also says "checked through search only" at the top of those steps, before their instructions.
assert.ok(fs.readFileSync('js/app.js','utf8').includes("${s.viaSearch ? (lang()==='ar' ? '<div class=\"tip\" lang=\"ar\" dir=\"rtl\" data-caveat=\"via-search\"><b>تم التحقق عبر البحث فقط</b>"));
// Every claim the review pack marks unconfirmed is listed there, not silently kept.
const pack=fs.readFileSync('docs/journey-review-pack-2026-10-28.md','utf8');
for(const s of ['**Not confirmed**: the page doesn\'t say so','Sanadak\'s FAQ says 30 days','## 11. New (29 Oct, evening)'])assert.ok(pack.includes(s),s);
console.log('School start and return: new steps on both school guides, partial source checks recorded, Dubai search-only claims at draft level and labelled, unreviewed Arabic marked in the app and for the assistant.');
