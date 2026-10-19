/* Offline interface contract: no Google auth or server event writes. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('workers/orivia-ai-private-trial.mjs','utf8');
function embedded(path){const marker="if(url.pathname==='"+path+"'&&req.method==='GET')return new Response(";const a=source.indexOf(marker);assert.ok(a>=0);const start=a+marker.length;return JSON.parse(source.slice(start,source.indexOf(',{headers:',start)))}
const html=embedded('/'),js=embedded('/chat.js');
new Function(js);
assert.match(html,/id="tab-chat"/);
assert.match(html,/id="tab-calendar"/);
assert.match(html,/id="calendar-panel"/);
assert.match(html,/Save in Orivia calendar/);
assert.doesNotMatch(html,/Add to my calendar ↓/);
assert.match(html,/save the event|press Save/i);
assert.match(js,/localStorage\.setItem\(eventKey/);
assert.match(js,/calendar\.google\.com\/calendar\/render/);
assert.match(js,/Confirm Save in Google Calendar/);
assert.match(js,/\/reminder\.ics\?/); // the phone calendar file is the main export; Google Calendar stays optional
assert.match(js,/Tap “Add to phone calendar” to get an alert on your phone/);
assert.match(js,/events=events\.filter/);
const fn=js.match(/function googleEvent\(e\)\{[\s\S]*?\n\}/)[0];
const eventUrl=new Function('URLSearchParams',fn+';return googleEvent')(
 URLSearchParams)({title:'Call the university',at:'2026-10-22T09:00:00.000Z'});
const url=new URL(eventUrl);
assert.equal(url.hostname,'calendar.google.com');
assert.equal(url.searchParams.get('action'),'TEMPLATE');
assert.equal(url.searchParams.get('text'),'Call the university');
assert.equal(url.searchParams.get('dates'),'20261022T090000Z/20261022T093000Z');
console.log('Private chat tabs, locally saved calendar and Google Calendar draft: passed');
