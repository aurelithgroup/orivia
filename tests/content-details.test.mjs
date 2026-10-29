/* Structured university content (21 Oct): staff-supplied dates, contacts, guide sources and update actions are validated;
 * nothing missing is invented. Run: node tests/content-details.test.mjs */
import assert from 'node:assert/strict';
import {normaliseDetails,DetailsError,validDate,validTimeZone,validPhone,validEmail,validHttps,parseDetails} from '../workers/accounts/content-details.mjs';
const fails=async(kind,input,field,opts)=>{await assert.rejects(()=>normaliseDetails(kind,input,opts),e=>e instanceof DetailsError&&e.field===field,kind+' '+JSON.stringify(input))};

// Nothing given: nothing stored (older content keeps working).
assert.equal(await normaliseDetails('date',undefined),null);assert.equal(await normaliseDetails('guide',null),null);assert.equal(await normaliseDetails('guide',{sourceUrl:''}),null);

// Dates: real calendar days; a time needs a real time zone; all-day dates need none.
assert.deepEqual(await normaliseDetails('date',{date:'2026-11-03'}),{date:'2026-11-03'});
assert.deepEqual(await normaliseDetails('date',{date:'2026-11-03',time:'09:30',timeZone:'Asia/Dubai'}),{date:'2026-11-03',time:'09:30',timeZone:'Asia/Dubai'});
assert.deepEqual(await normaliseDetails('date',{date:'2026-11-03',timeZone:'Europe/London'}),{date:'2026-11-03',timeZone:'Europe/London'});
await fails('date',{date:'2026-02-30'},'date');await fails('date',{date:'03/11/2026'},'date');await fails('date',{},'date');
await fails('date',{date:'2026-11-03',time:'25:00',timeZone:'Asia/Dubai'},'time');await fails('date',{date:'2026-11-03',time:'09:30'},'timeZone');
await fails('date',{date:'2026-11-03',time:'09:30',timeZone:'Mars/Olympus'},'timeZone');await fails('date',{date:'2026-11-03',when:'soon'},'field');
assert.ok(validTimeZone('UTC')&&validTimeZone('America/Argentina/Buenos_Aires')&&!validTimeZone('Asia/Dubai; drop')&&!validDate('2026-13-01'));

// Contacts: only what staff supplied, each checked; at least one way to reach them.
assert.deepEqual(await normaliseDetails('contact',{phone:'+971 4 000 0000',email:'student.services@northbay.example',website:'https://northbay.example/help'}),{phone:'+971 4 000 0000',email:'student.services@northbay.example',website:'https://northbay.example/help'});
assert.deepEqual(await normaliseDetails('contact',{email:'help@northbay.example'}),{email:'help@northbay.example'});
await fails('contact',{},'contact');await fails('contact',{phone:'call us'},'phone');await fails('contact',{email:'not an email'},'email');
await fails('contact',{website:'http://northbay.example'},'website');await fails('contact',{website:'javascript:alert(1)'},'website');await fails('contact',{website:'https://user:pw@northbay.example'},'website');
assert.ok(validPhone('04 123 4567')&&!validPhone('12345')&&!validPhone('+1 (234) 567-8901-2345-6789'));assert.ok(validEmail('a.b@c.ae')&&!validEmail('a@b'));assert.ok(validHttps('https://u.ae/x')&&!validHttps('https://localhost'));

// Guides: an optional https source.
assert.deepEqual(await normaliseDetails('guide',{sourceUrl:'https://northbay.example/arrival'}),{sourceUrl:'https://northbay.example/arrival'});await fails('guide',{sourceUrl:'ftp://x.example'},'sourceUrl');

// Updates: a related guide only if the server confirms it's a guide of the same organisation; an action is a label plus an https link.
const ok={relatedIdOk:async id=>id==='guide-1'};
assert.deepEqual(await normaliseDetails('update',{relatedId:'guide-1'},ok),{relatedId:'guide-1'});
await fails('update',{relatedId:'other-org-guide'},'relatedId',ok);await fails('update',{actionLabel:'Book now'},'action');
assert.deepEqual(await normaliseDetails('update',{actionLabel:'Book your appointment',actionUrl:'https://northbay.example/book'}),{actionLabel:'Book your appointment',actionUrl:'https://northbay.example/book'});
await fails('update',{actionLabel:'<b>Book</b>',actionUrl:'https://northbay.example/book'},'actionLabel');

// Fields of one kind can't be smuggled into another; stored text that isn't an object reads as nothing.
await fails('guide',{phone:'+971 4 000 0000'},'field');await fails('contact',[],'details');
assert.equal(parseDetails('not json'),null);assert.equal(parseDetails('[1]'),null);assert.deepEqual(parseDetails('{"date":"2026-11-03"}'),{date:'2026-11-03'});
console.log('Content details: dates and time zones, contacts, sources and update actions validated; nothing invented; kinds kept apart.');
