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
/* Defaults: guide suggestions and About me are on until someone switches them off */
assert.match(js, /const SET_DEFAULT=\{[^}]*suggest:true/);
assert.match(js, /p\.use===false\)return undefined/, 'About me is shared unless explicitly switched off');
assert.match(html, /id="set-aboutme-use"/);
/* My Life: tap-to-pick, saves on tap, no long form; chat offers to remember, never saves on its own */
for (const id of ['pick-here', 'pick-dest', 'origin-country', 'origin-town', 'pick-who', 'p-place', 'inst-confirm', 'about-summary', 'life-journeys', 'upcoming']) assert.match(html, new RegExp('id="' + id + '"'), id);
assert.doesNotMatch(html, /id="profile-form"/, 'no long About me form');
assert.match(js, /function rememberCard/); assert.match(js, /Remember this for next time\?/);
const rc = js.slice(js.indexOf('function rememberCard'), js.indexOf("$('about-edit').onclick"));
assert.equal((rc.match(/saveProfile\(/g) || []).length, 1, 'saves only from the Remember button');
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
assert.deepEqual(ids.filter((x, i) => ids.indexOf(x) !== i), [], 'every id on the page is unique (no leftover markup)');
/* Location: UAE / UK / not there yet; current place and destination kept apart; typing allowed */
assert.match(js, /\['uae','UAE'\],\['uk','UK'\],\['away','Not there yet'\]/);
assert.match(js, /Umm Al Quwain/); assert.match(js, /Northern Ireland/); assert.match(html, /<datalist id="uk-towns">/);
assert.match(js, /movingTo/); assert.match(js, /region:'',town:''/, 'changing country clears the old place'); assert.match(js, /Type it if it isn’t listed/);
/* Institution: free text, never claimed as checked */
assert.match(html, /Your institution/); assert.match(js, /Orivia hasn’t checked it yet/);
assert.doesNotMatch(html + js, /Heriot-Watt University Dubai','University of Wollongong/, 'no fixed university list');
/* End session is separate from clearing data, and says it isn't an account log-out */
assert.match(html, /id="end-session"/); assert.match(html, /isn’t an account log-out/); assert.match(html, />Clear saved data</);
const end = js.slice(js.indexOf("$('end-session').onclick"), js.indexOf('/* ===== Listen'));
assert.doesNotMatch(end, /localStorage\.removeItem/, 'ending a session keeps journeys, calendar and My Life');
/* Listen and dictation: stop controls, and dictation never sends by itself */
assert.match(js, /■ Stop/); assert.match(html, /id="dict-stop"/); assert.match(html, /id="dict-cancel"/);
const dict = js.slice(js.indexOf('/* ===== Dictation'), js.indexOf('/* Help: always'));
assert.doesNotMatch(dict, /requestSubmit|\.submit\(/, 'dictated text is edited and sent by the person');
assert.match(dict, /Nothing is sent until you press Send/);
console.log('Settings and Calendar: tone, guide suggestions, theme override, safe reminders: passed');
