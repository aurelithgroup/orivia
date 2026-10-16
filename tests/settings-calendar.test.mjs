/* Settings change how Orivia replies and whether she suggests guides; the Calendar keeps its safe, on-device behaviour.
   Run: node tests/settings-calendar.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const worker = (await import('../workers/orivia-ai-private-trial.mjs')).default;
globalThis.fetch = async () => { throw new Error('no network in tests'); };
const HOST = 'https://orivia-ai-preview.habeebahsallah27.workers.dev';
let prompt = '';
const env = { ACCESS_TEST_EMAIL: 'f@x', AI: { run: async (_m, o) => { prompt = o.messages[0].content; return { response: 'Okay.' }; } },
  AI_QUOTA: { limit: async () => ({ success: true }) }, BUDGET_DB: { prepare: () => ({ bind: () => ({ first: async () => ({ calls: 1 }) }) }) } };
const ctx = { access: { getIdentity: async () => ({ email: 'f@x' }) } };
const post = async (content, preferences) => (await worker.fetch(new Request(HOST + '/v1/chat', { method: 'POST', headers: { origin: HOST, 'content-type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content }], preferences }) }), env, ctx)).json();

/* Tone */
await post('hello', { style: 'simple' }); assert.match(prompt, /simple words/);
await post('hello', { style: 'brief' }); assert.match(prompt, /short answers/);
await post('hello', { style: 'friendly' }); assert.doesNotMatch(prompt, /asked for (simple words|short answers)/);
await post('hello', { style: '<script>' }); assert.doesNotMatch(prompt, /<script>/);

/* Suggest guides off: no unprompted card, but asking still brings the guide */
let d = await post("I'll take the metro", { suggestGuides: false });
assert.equal(d.guideOffer, undefined);
d = await post('how does the nol card work again?', { suggestGuides: false });
assert.equal(d.guideOffer.kind, 'refresher');

/* The app: Settings and the redesigned Calendar */
const html = fs.readFileSync('workers/trial-ui/page.html', 'utf8'), js = fs.readFileSync('workers/trial-ui/chat.js', 'utf8');
for (const id of ['open-settings', 'set-theme', 'set-size', 'set-tone', 'set-suggest', 'clear', 'forget', 'cal-add', 'wk-days', 'add-sheet', 'reminder-date', 'reminder-time'])
  assert.match(html, new RegExp('id="' + id + '"'), id);
assert.match(html, /:root\[data-theme="dark"\]/, 'an explicit Dark choice works whatever the phone is set to');
assert.match(html, /:root:not\(\[data-theme="light"\]\)/, 'an explicit Light choice overrides a dark phone');
assert.match(js, /suggestGuides:readSettings\(\)\.suggest!==false/); assert.match(js, /style:readSettings\(\)\.tone/);
assert.match(js, /Tap again to remove/, 'removing a reminder asks first');
assert.match(js, /at\.getTime\(\)<Date\.now\(\)\+60000/, 'no reminders in the past');
console.log('Settings and Calendar: tone, guide suggestions, theme override, safe reminders: passed');
