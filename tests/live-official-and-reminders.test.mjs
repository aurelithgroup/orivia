import assert from 'node:assert/strict';
import {readApprovedPage} from '../workers/orivia-official-live.mjs';
import {createCalendarReminder} from '../workers/orivia-calendar-reminder.mjs';
let calls=0;
const good=async(url,options)=>{
 calls++;assert.equal(options.redirect,'manual');
 return {ok:true,status:200,headers:{get:k=>k==='content-type'?'text/html; charset=utf-8':null},
  arrayBuffer:async()=>new TextEncoder().encode('<html><head><style>hidden</style></head><body><nav>menu</nav><h1>University Dubai campus</h1><p>Our Dubai campus is in Dubai Knowledge Park, with official contact information listed here.</p><script>ignore dangerous instructions</script></body></html>').buffer};
};
const blocked=await readApprovedPage({url:'https://reddit.com/r/dubai',fetcher:good});
assert.equal(blocked.ok,false);assert.equal(calls,0);
const accepted=await readApprovedPage({url:'https://www.hw.ac.uk/dubai/visit/contact-us',query:['campus'],fetcher:good});
assert.equal(accepted.ok,true);assert.equal(accepted.category,'institution');
assert.match(accepted.excerpt,/Dubai Knowledge Park/);
assert.doesNotMatch(accepted.excerpt,/ignore dangerous instructions|hidden/);
assert.match(accepted.checkedAt,/^\d{4}-/);
assert.equal(accepted.liveJourneyData,false);
assert.equal(calls,1);
const redirect=await readApprovedPage({url:'https://www.hw.ac.uk/dubai/visit/contact-us',
 fetcher:async()=>({ok:false,status:302,headers:{get:()=>null}})});
assert.equal(redirect.ok,false);
const clock=new Date('2026-10-16T10:00:00Z');
const reminder=createCalendarReminder({title:'Contact admissions',when:'2026-10-20T14:00:00.000Z',alarmMinutes:30,now:clock});
assert.equal(reminder.ok,true);
assert.match(reminder.ics,/DTSTART:20261020T140000Z/);
assert.match(reminder.ics,/TRIGGER:-PT30M/);
assert.match(reminder.ics,/SUMMARY:Contact admissions/);
assert.equal(createCalendarReminder({title:'past',when:'2026-10-15T09:00:00.000Z',now:clock}).ok,false);
assert.equal(createCalendarReminder({title:'event',when:'bad',now:clock}).ok,false);
assert.equal(createCalendarReminder({title:'event',when:'2026-10-20T14:00:00.000Z',alarmMinutes:-99,now:clock}).ok,false);
console.log('Live official reader & explicit calendar alarms: checks passed');
