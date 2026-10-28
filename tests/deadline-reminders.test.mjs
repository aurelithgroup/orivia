/* Deadline reminders on plan steps (week 6): the person's own date, confirmed or not sure, and a reminder only when asked.
   Pure functions from workers/trial-ui/plan-steps.js, plus checks on the step UI. Run: node tests/deadline-reminders.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync('workers/trial-ui/plan-steps.js','utf8'),ctx);
const P=ctx.OriviaPlan,J=x=>JSON.parse(JSON.stringify(x));
const steps=[{id:'permit',title:'Entry permit'},{id:'medical',title:'Medical test'},{id:'card',title:'Emirates ID'}];

// Setting: real dates only, safe step ids, certainty defaults to "not sure", the note is short and optional
let e=P.setDeadline({stepStatus:{}},'medical',{date:'2026-11-12',certainty:'confirmed',note:'  Email from the visa office  '},1000);
assert.equal(J(e.deadlines.medical).note,'Email from the visa office');assert.equal(e.deadlines.medical.certainty,'confirmed');
assert.equal(P.setDeadline({},'medical',{date:'2026-02-30'}),null,'no impossible dates');
assert.equal(P.setDeadline({},'bad id!',{date:'2026-11-01'}),null,'no unsafe step ids');
assert.equal(P.setDeadline({},'card',{date:'2026-11-20'}).deadlines.card.certainty,'unsure','not sure unless the person confirms');

// The reminder link survives an edit of the note, not a change of date
e=P.withReminder(e,'medical','evt-1');
assert.equal(P.setDeadline(e,'medical',{date:'2026-11-12',certainty:'confirmed',note:'new'},2).deadlines.medical.reminderId,'evt-1');
assert.equal(P.setDeadline(e,'medical',{date:'2026-11-13',certainty:'confirmed'},2).deadlines.medical.reminderId,undefined,'a new date needs a new reminder');
assert.equal(J(P.clearDeadline(e,'medical').deadlines).medical,undefined);

// Saved data is cleaned on read; deadlines survive a state change and Undo
const dirty=P.normEntry({deadlines:{medical:{date:'2026-11-12',certainty:'official!',reminderId:5},'x y':{date:'2026-11-01'},card:{date:'nope'}}});
assert.equal(JSON.stringify(Object.keys(dirty.deadlines)),'["medical"]');assert.equal(dirty.deadlines.medical.certainty,'unsure','only "confirmed" or "unsure", never "official"');
const changed=P.change(e,'medical','in_progress',3);assert.equal(changed.deadlines.medical.date,'2026-11-12');assert.equal(P.undo(changed).entry.deadlines.medical.date,'2026-11-12');

// Views against the person's today
const v=P.deadlines(P.setDeadline(P.setDeadline({stepStatus:{permit:'done'}},'permit',{date:'2026-10-20'}),'medical',{date:'2026-11-02',certainty:'confirmed'}),steps,'2026-10-28');
assert.equal(JSON.stringify(v.map(x=>[x.stepId,x.when])),JSON.stringify([['permit','done'],['medical','soon']]),'a finished step is done even if its date passed');
assert.equal(P.deadlines(P.setDeadline({},'card',{date:'2026-10-27'}),steps,'2026-10-28')[0].when,'overdue');
assert.equal(P.deadlines(P.setDeadline({},'card',{date:'2026-12-27'}),steps,'2026-10-28')[0].when,'later');

// Reminders: 3 days before at 09:00, never after the date, worded honestly
assert.equal(JSON.stringify(P.reminderFor({date:'2026-11-12',certainty:'confirmed'},'Medical test','2026-10-28')),JSON.stringify({date:'2026-11-09',time:'09:00',title:'Deadline 2026-11-12: Medical test'}));
assert.equal(P.reminderFor({date:'2026-10-30',certainty:'unsure'},'Medical test','2026-10-28').date,'2026-10-29','too close for 3 days before: tomorrow');
assert.equal(P.reminderFor({date:'2026-10-29',certainty:'unsure'},'Medical test','2026-10-28').date,'2026-10-29','never after the date');
assert.match(P.reminderFor({date:'2026-11-30',certainty:'unsure'},'Medical test','2026-10-28').title,/^Check the date for: /,'an unsure date is a check, not a deadline');
assert.equal(P.reminderFor({date:'2026-10-27',certainty:'confirmed'},'x','2026-10-28'),null,'no reminder for a date that has passed');

// The family overview shows each plan's next open date
const fam=P.family([['family.a',{title:'Visa',status:'active',label:'Child 1',titles:{permit:'Entry permit',medical:'Medical test'},stepStatus:{permit:'done'},
 deadlines:{permit:{date:'2026-10-20'},medical:{date:'2026-11-02',certainty:'confirmed'}}}]],'2026-10-28');
assert.equal(fam.people[0].plans[0].deadline.stepId,'medical');assert.equal(fam.people[0].plans[0].deadline.when,'soon');

// The step UI: a reminder goes through the calendar's own checks, and the date is labelled as the person's own
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8');
assert.match(chat,/const saved=saveChatReminder\(r\)/,'reminders use the existing calendar path and its limits');
assert.match(chat,/This is your own date, not an official one/);
const tr=JSON.parse(fs.readFileSync('workers/trial-ui/translations.json','utf8'));for(const k of ['Deadline','Add a reminder','I’ve confirmed this date','I’m not sure of the date yet','Next date'])assert.ok(tr[k]?.fr&&tr[k]?.ar,k);
console.log('Deadline reminders: own dates (confirmed or not sure), honest reminders 3 days before, never after the date; shown in the family overview.');
