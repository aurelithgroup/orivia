/* Transport is actionable: Orivia asks only what's missing, then hands over prefilled Google Maps links.
   Runs the real private-trial Worker with a stand-in for the AI, so no network or model is needed.
   Run: node tests/transport-actions.test.mjs */
import assert from 'node:assert/strict';
import { planTrip } from '../workers/orivia-transport.mjs';
const worker = (await import('../workers/orivia-ai-private-trial.mjs')).default;

globalThis.fetch = async () => { throw new Error('no network in tests'); };
const HOST = 'https://orivia-ai-preview.habeebahsallah27.workers.dev';
let prompt = '', aiSays = 'Open the buttons below to compare.', aiCalls = 0;
const env = {
  ACCESS_TEST_EMAIL: 'founder@example.com',
  AI: { run: async (_m, o) => { aiCalls++; prompt = o.messages[0].content; return { response: aiSays }; } },
  AI_QUOTA: { limit: async () => ({ success: true }) },
  BUDGET_DB: { prepare: () => ({ bind: () => ({ first: async () => ({ calls: 1 }) }) }) }
};
const ctx = { access: { getIdentity: async () => ({ email: 'founder@example.com' }) } };
async function chat(messages, profile) {
  prompt = '';
  const r = await worker.fetch(new Request(HOST + '/v1/chat', { method: 'POST', headers: { origin: HOST, 'content-type': 'application/json' },
    body: JSON.stringify({ messages, preferences: { language: 'en', profile } }) }), env, ctx);
  assert.equal(r.status, 200); return r.json();
}
const u = c => ({ role: 'user', content: c }), a = c => ({ role: 'assistant', content: c });
const maps = (d, mode) => { const l = d.actions.find(x => x.url.includes('travelmode=' + mode)); assert.ok(l, mode + ' link'); return new URL(l.url); };
const NUMBERS = /\b\d+\s*(min|minutes|hours?|km|aed)\b|\bAED\s*\d|\b(bus|route)\s*[A-Z]?\d+/i;

/* 1. University commute with both places known: links straight away, nothing asked again */
let d = await chat([u('How do I get to Heriot-Watt University Dubai from Al Nahda, Sharjah? I want the fastest way.')]);
assert.equal(aiCalls, 1);
let t = maps(d, 'transit'), dr = maps(d, 'driving');
assert.equal(t.hostname, 'www.google.com'); assert.equal(t.searchParams.get('api'), '1');
assert.match(t.searchParams.get('origin'), /^Al Nahda, Sharjah/);
assert.match(t.searchParams.get('destination'), /Dubai Knowledge Park/);
assert.equal(dr.searchParams.get('origin'), t.searchParams.get('origin'));
assert.match(prompt, /TRANSPORT FACTS/); assert.match(prompt, /priority is TIME/);
assert.doesNotMatch(d.reply, /\?$/, 'does not ask for anything already given');

/* 2. A broad departure ("Sharjah") gets one short clarifying question, together with the priority */
d = await chat([u('I need help getting to university.')]);
assert.match(d.reply, /Which university or campus are you going to, and where will you be travelling from\?/);
const q1 = d.reply;
d = await chat([u('I need help getting to university.'), a(q1), u('Heriot-Watt, from Sharjah')]);
assert.match(d.reply, /Which part of Sharjah/); assert.match(d.reply, /time, cost or reliability/);
assert.doesNotMatch(d.reply, /Which university|travelling from/, 'never re-asks a place already given');
const q2 = d.reply;
d = await chat([u('I need help getting to university.'), a(q1), u('Heriot-Watt, from Sharjah'), a(q2), u('Muwaileh, mostly time')]);
assert.match(maps(d, 'transit').searchParams.get('origin'), /^Muwaileh, Sharjah/);
assert.match(prompt, /priority is TIME/);

/* 3. The founder's transcript: "Time" answers the previous question; My Life fills the university */
const profile = { place: 'Heriot-Watt University Dubai' };
d = await chat([u('I need help getting to university.')], profile);
assert.match(d.reply, /Where will you be travelling from\?/); assert.doesNotMatch(d.reply, /Which university/);
const f1 = d.reply;
d = await chat([u('I need help getting to university.'), a(f1), u('Sharjah.')], profile);
assert.match(d.reply, /Which part of Sharjah/);
const f2 = d.reply; aiCalls = 0;
d = await chat([u('I need help getting to university.'), a(f1), u('Sharjah.'), a(f2), u('Time.')], profile);
assert.equal(aiCalls, 1, 'answers with links rather than another question');
assert.equal(maps(d, 'transit').searchParams.get('origin'), 'Sharjah, United Arab Emirates');
assert.match(prompt, /priority is TIME/); assert.match(prompt, /Do not give general advice about driving versus public transport/);
assert.equal(d.transport.priority, 'time');

/* 4. Switching from visa guidance to transport: transport takes over, and back again */
const visa = [u("I'm a university student and I need help with my residence visa"), a('Let’s work out where you are, one quick question at a time. Are you in the UAE now? (yes / no / not sure)'), u('no'), a('You’re at the entry permit step…')];
d = await chat([...visa, u('Also, how do I get to Heriot-Watt from Al Nahda in Sharjah?')]);
assert.match(d.reply, /time, cost or reliability/); assert.doesNotMatch(d.reply, /entry permit|travelling from|Which university/);
prompt = '';
d = await chat([...visa, u('Also, how do I get to Heriot-Watt from Al Nahda in Sharjah?'), a(d.reply), u('cost')]);
assert.doesNotMatch(prompt, /CHECKED ORIVIA JOURNEY FACTS/); assert.match(prompt, /TRANSPORT FACTS/); assert.match(prompt, /priority is COST/);
assert.ok(d.actions.some(x => x.url.includes('travelmode=transit')));
assert.equal(planTrip([...visa, u('Also, how do I get to Heriot-Watt from Al Nahda in Sharjah?'), a('Here you go'), u('ok and what do I bring to my medical test?')]).active, false, 'follows the change of subject back to visa');

/* 5. No reminder or calendar suggestions nobody asked for */
aiSays = 'Open the two buttons below and compare the times Maps shows. Want me to set a reminder for your first day? I can add it to your calendar.';
d = await chat([u('How do I get to Heriot-Watt from Al Nahda, Sharjah? Fastest please')]);
assert.doesNotMatch(d.reply, /remind|calendar/i); assert.match(d.reply, /compare/);
assert.match(prompt, /NEXT USEFUL ACTION: help them get there/);
aiSays = 'Sure, what time should I remind you?';
d = await chat([u('Remind me to submit my medical documents on Sunday')]);
assert.match(d.reply, /remind/i, 'a real reminder request still gets one');

/* 6. No made-up journey times, fares or routes */
aiSays = 'The bus takes about 45 minutes and costs AED 7 on route E303. Driving is 25 km. Open the buttons below to compare live options.';
d = await chat([u('How do I get to Heriot-Watt from Al Nahda, Sharjah? Fastest please')]);
assert.doesNotMatch(d.reply, NUMBERS); assert.match(d.reply, /buttons below/);
aiSays = 'It takes 40 minutes by bus.';
d = await chat([u('How do I get to Heriot-Watt from Al Nahda, Sharjah? Fastest please')]);
assert.doesNotMatch(d.reply, NUMBERS); assert.match(d.reply, /Google Maps/);
assert.match(prompt, /Never state or estimate one/);

/* Follow-ups stay in the trip and update it, instead of starting over */
const trip = [u('How do I get to Heriot-Watt from Al Nahda, Sharjah? fastest'), a('Open the buttons below.')];
assert.equal(planTrip([...trip, u('what about cost instead')]).pref, 'cost');
assert.equal(planTrip([...trip, u('which one is quicker?')]).confused, false);
assert.equal(planTrip([...trip, u('what?')]).confused, true);
assert.equal(planTrip([...trip, u('actually I live in Muwaileh')]).origin, 'Muwaileh');
assert.equal(planTrip([...trip, u('can you help me open a bank account?')]).active, false);

/* 7. A short check-up answer MUST NOT revive an older transport topic.
   Regression: "Have you done your medical fitness test?" -> "no" previously returned Maps advice. */
const oldTrip=[u('I need help getting to university.'),a('Where are you leaving from?'),u('Sharjah')];
for(const answer of ['yes','no','not sure']){
 const visaAnswer=[...oldTrip,a('Have you done your medical fitness test? (yes / no / not sure)'),u(answer)];
 assert.equal(planTrip(visaAnswer).active,false,'visa check-up answer '+answer+' must not trigger transport');
}
assert.equal(planTrip([...oldTrip,a('What matters most for this trip: time, cost or reliability?'),u('time')]).active,true,'genuine transport answer remains transport');

console.log('Transport actions: commute links, broad origin, "time" follow-up, visa→transport, no stray reminders, no made-up numbers: passed');
