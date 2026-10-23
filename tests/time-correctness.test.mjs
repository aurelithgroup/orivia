/* Time correctness (ORI-CAL-003): UK clock changes, Dubai day boundaries, repeated local times and Dubai→London travel.
   Runs the shipped zoneInstant from chat.js (university dates) and the app's own reminder formatting under real device
   time zones (child processes with TZ set). Run: node tests/time-correctness.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n');
const zone=chat.slice(chat.indexOf('function zoneInstant('),chat.indexOf('window.OriviaCalendar={'));
const c={Date,Intl,Number,Object,String};vm.createContext(c);vm.runInContext(zone+';this.at=zoneInstant',c);
const iso=(d,t,z)=>c.at(d,t,z)?.toISOString();
const shown=(d,t,z)=>new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:z,timeZoneName:'short'}).format(c.at(d,t,z));
// Ordinary days on both sides of the change.
assert.equal(iso('2026-03-28','09:00','Europe/London'),'2026-03-28T09:00:00.000Z','GMT the day before');
assert.equal(iso('2026-03-30','09:00','Europe/London'),'2026-03-30T08:00:00.000Z','BST the day after');
assert.equal(iso('2026-10-24','09:00','Europe/London'),'2026-10-24T08:00:00.000Z');assert.equal(iso('2026-10-26','09:00','Europe/London'),'2026-10-26T09:00:00.000Z');
// Spring forward (29 Mar 2026, 01:00 → 02:00): 01:30 doesn't exist. It's never dropped or silently relabelled: the review
// line shows the real time it will alert (02:30 BST), so the person sees the change before adding it.
assert.equal(iso('2026-03-29','01:30','Europe/London'),'2026-03-29T01:30:00.000Z');assert.match(shown('2026-03-29','01:30','Europe/London'),/02:30 BST/);
assert.equal(iso('2026-03-29','00:30','Europe/London'),'2026-03-29T00:30:00.000Z');assert.equal(iso('2026-03-29','03:00','Europe/London'),'2026-03-29T02:00:00.000Z');
// Fall back (25 Oct 2026, 02:00 → 01:00): 01:30 happens twice. One instant is chosen and the review line names the zone
// (GMT), so it's distinguishable from the BST 01:30 an hour earlier.
assert.match(shown('2026-10-25','01:30','Europe/London'),/01:30 GMT/);assert.equal(iso('2026-10-25','00:30','Europe/London'),'2026-10-24T23:30:00.000Z');assert.equal(iso('2026-10-25','02:30','Europe/London'),'2026-10-25T02:30:00.000Z');
// Dubai (UTC+4, no DST): day boundaries move the UTC date, never the local one.
assert.equal(iso('2026-11-12','00:30','Asia/Dubai'),'2026-11-11T20:30:00.000Z');assert.equal(iso('2026-11-12','23:59','Asia/Dubai'),'2026-11-12T19:59:00.000Z');
assert.match(shown('2026-11-12','00:30','Asia/Dubai'),/12 Nov, 00:30 (GST|GMT\+4)/);
for(const bad of [['2026-02-30','09:00'],['2026-11-12','24:00'],['2026-11-12','9am'],['12/11/2026','09:00']])assert.ok(!c.at(bad[0],bad[1],'Asia/Dubai')||isNaN(c.at(bad[0],bad[1],'Asia/Dubai')),'unclear input is refused, not guessed: '+bad);
// Travel: reminders are stored as instants and shown in the device's current zone. A 09:00 Dubai appointment shows as
// 06:00 in London (05:00 after the clocks go back), and as 09:00 again back in Dubai: same moment, never shifted.
const when=chat.match(/const when=e=>new Date\(e\.at\)\.toLocaleString\(uiLanguage\(\),(\{[^}]*\})\);/);assert.ok(when,'the calendar formats stored instants in the device zone');
const show=(tz,at)=>execFileSync(process.execPath,['-e',`process.stdout.write(new Date(${JSON.stringify(at)}).toLocaleString('en-GB',${when[1]}))`],{env:{...process.env,TZ:tz}}).toString();
const appt=c.at('2026-10-20','09:00','Asia/Dubai').toISOString(),later=c.at('2026-10-27','09:00','Asia/Dubai').toISOString();
assert.match(show('Asia/Dubai',appt),/ 0?9:00/);assert.match(show('Europe/London',appt),/ 0?6:00/);assert.match(show('Europe/London',later),/ 0?5:00/,'after the UK change');
// A reminder typed on the phone as a local time ("2026-03-29T01:30", the gap) lands at a real instant in that zone.
const typed=tz=>execFileSync(process.execPath,['-e','process.stdout.write(new Date("2026-03-29T01:30").toISOString())'],{env:{...process.env,TZ:tz}}).toString();
assert.equal(typed('Europe/London'),'2026-03-29T01:30:00.000Z','gap time moves forward to 02:30 BST');assert.equal(typed('Asia/Dubai'),'2026-03-28T21:30:00.000Z');
console.log('Time correctness: UK spring-forward gap and repeated fall-back hour shown with their real zone, Dubai day boundaries, unclear times refused, Dubai→London travel keeps the same moment: pass.');
