/* Regression cases from Ina's review of 6fddbd2 (29 Oct): the exact examples she reported, plus the content fixes.
   Run: node tests/ina-review-week6.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {guideOffer,guideContent} from '../workers/orivia-guide-offers.mjs';
const u=t=>[{role:'user',content:t}],offer=(t,profile={})=>guideOffer(u(t),{profile});

// 1. Problem and refresher requests pass the place check too
assert.equal(offer('GP guide',{city:'Manchester'}).offer,null,'"GP guide" in Manchester: no Scotland guide');
assert.match(offer('GP guide',{city:'Manchester'}).context,/covers Scotland only/);
assert.equal(offer('I got a council tax bill',{city:'Manchester'}).offer,null,'council tax bill outside Edinburgh: no Edinburgh guide');
assert.equal(offer('I got a council tax bill',{city:'Glasgow'}).offer,null);
assert.equal(offer('GP guide',{city:'Edinburgh'}).offer?.id,'edinburgh.gp','still works where it applies');
assert.equal(offer('I got a council tax bill',{city:'Edinburgh'}).offer?.kind,'problem');
assert.equal(offer('GP guide').offer,null,'a UK guide whose place cannot be confirmed is not offered');
assert.equal(offer('wait how does the nol card work again?').offer?.id,'dubai.nol','a Dubai-only guide asked for by name, nothing pointing elsewhere');
// someone already following a guide can always bring it back
assert.equal(guideOffer(u('GP guide'),{profile:{city:'Manchester'},prefs:{guides:{following:['edinburgh.gp']}}}).offer?.id,'edinburgh.gp','their own guide');

// 2. Move direction for the UK-to-UAE documents guide
assert.equal(offer('I moved from Dubai to London, I need to get my degree attested').offer,null,'Dubai to London is the wrong direction');
assert.equal(offer("I'm moving from Manchester to Dubai, I need to get my degree attested").offer?.id,'dubai.docs.before');
assert.equal(offer('I need to get my documents attested',{city:'London',movedFrom:'Dubai'}).offer,null);
assert.equal(offer('I need to get my documents attested',{city:'Dubai'}).offer,null,'both places unknown: not offered');
// Negation and corrections (Ina's recheck): conservative
assert.equal(offer('I need to get my documents ready. I am not moving from London to Dubai').offer,null,'a negated direction never triggers it');
assert.equal(offer('I need to get my documents ready. I am not moving from London to Dubai',{city:'Dubai',movedFrom:'UK'}).offer,null,'not even with a UK-to-UAE profile');
assert.equal(offer("I'm moving from London to Dubai, sorry I mean from Dubai to London. I need to get my documents ready").offer,null,'corrected to the other direction');
assert.equal(offer("I'm moving from Dubai to London, sorry I mean from London to Dubai. I need to get my documents ready").offer,null,'conflicting statements: not offered');
assert.equal(offer("I'm no longer moving. I need to get my documents attested",{city:'Dubai',movedFrom:'UK'}).offer,null);

// 3. The assistant is never told an unreviewed guide is "checked"
for(const [t,p] of [['I need to register with a GP',{city:'Edinburgh'}],['GP guide',{city:'Edinburgh'}],['I got a council tax bill',{city:'Edinburgh'}],["I'll take the metro",{city:'Dubai'}]]){
 const c=offer(t,p).context;assert.doesNotMatch(c,/checked guide|checked answer/i,t);assert.match(c,/awaiting review/,t)}
assert.doesNotMatch(offer('I need to register with a GP',{city:'Manchester'}).context,/checked/);

// 4. Reminders follow deadline changes; 5. blocked notes come back with Undo
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync('workers/trial-ui/plan-steps.js','utf8'),ctx);const P=ctx.OriviaPlan;
const e=P.withReminder(P.setDeadline({},'medical',{date:'2026-11-12',certainty:'confirmed'},1),'medical','evt-1');
assert.equal(P.staleReminder(e,P.setDeadline(e,'medical',{date:'2026-11-13',certainty:'confirmed'},2),'medical'),'evt-1','new date');
assert.equal(P.staleReminder(e,P.setDeadline(e,'medical',{date:'2026-11-12',certainty:'unsure'},2),'medical'),'evt-1','confirmed to unsure: the old "Deadline" reminder goes');
assert.equal(P.staleReminder(e,P.clearDeadline(e,'medical'),'medical'),'evt-1','removed');
assert.equal(P.staleReminder(e,P.setDeadline(e,'medical',{date:'2026-11-12',certainty:'confirmed',note:'x'},2),'medical'),null,'note only: kept');
assert.match(fs.readFileSync('workers/trial-ui/chat.js','utf8'),/const stale=PLAN\.staleReminder\(readJourneys\(\)\[id\],e,s\.id\);if\(stale&&events\.some\(ev=>ev\.id===stale\)\)removeEvent\(stale\)/);
let b=P.change({},'medical','blocked',1,'Waiting for the appointment letter');b=P.change(b,'medical','in_progress',2);
const undone=P.undo(b);assert.equal(undone.entry.stepStatus.medical,'blocked');assert.equal(undone.entry.notes.medical,'Waiting for the appointment letter','the blocked note returns');

// 6. Content: FSCS licences, apostille eligibility, distinct Arabic terms; 7. French "Relu par"
const bank=JSON.stringify(guideContent('edinburgh.bank'));assert.match(bank,/eligible deposits/);assert.match(bank,/share a banking licence count as one bank/);
const docs=guideContent('dubai.docs.before'),uk=JSON.stringify(docs.steps.find(s=>s.id==='uk'));
assert.match(uk,/only for documents issued in the UK/);assert.match(uk,/can’t get an e-Apostille/);assert.match(uk,/accept an e-Apostille/);
assert.match(JSON.stringify(docs.steps[0]),/original or a certified copy/);
const ar=fs.readFileSync('js/content-docs.js','utf8');
// Arabic terms (Ina's recheck): MoFA's official تصديق المستندات / تصديق وزارة الخارجية الإماراتية for UAE attestation,
// الأبوستيل for the UK apostille, الاعتراف بالمؤهل for recognition, موثّقة for notary certification.
const step=id=>ar.slice(ar.indexOf("{id:'"+id+"'"),ar.indexOf("{id:'",ar.indexOf("{id:'"+id+"'")+5)>0?ar.indexOf("{id:'",ar.indexOf("{id:'"+id+"'")+5):ar.indexOf('problems:['));
const uaeStep=ar.slice(ar.indexOf("{id:'uae'"),ar.indexOf('problems:[')),ukStep=step('uk');
assert.match(uaeStep,/تصديق المستندات/,'MoFA term in the UAE step');assert.match(uaeStep,/تصديق وزارة الخارجية الإماراتية/);
assert.match(ukStep,/الأبوستيل/);assert.doesNotMatch(ukStep,/وزارة الخارجية|مكتب التصديق/,'the UK step never uses the MoFA term');
assert.match(uaeStep,/الاعتراف بالمؤهل/,'recognition named separately');assert.doesNotMatch(ar,/الاعتماد/,'no non-official term for attestation');
assert.doesNotMatch(ar,/مصدّقة/,'notary-certified copies are موثّقة, not تصديق');
const tr=JSON.parse(fs.readFileSync('workers/trial-ui/translations.json','utf8'));assert.equal(tr['Reviewed by'].fr,'Relu par');
console.log("Ina's week 6 review: place checks on problems/refreshers, move direction, no 'checked' claims, reminders reconciled, blocked note Undo, content fixes.");
