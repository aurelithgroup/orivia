/* Journey cards: offered when a decision makes a checked guide useful, never on every mention.
   Runs the guide rules and the real private-trial Worker with a stand-in AI. Run: node tests/guide-cards.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { guideOffer, guideContent, GUIDES } from '../workers/orivia-guide-offers.mjs';
import { planTrip } from '../workers/orivia-transport.mjs';
const worker = (await import('../workers/orivia-ai-private-trial.mjs')).default;
globalThis.fetch = async () => { throw new Error('no network in tests'); };

const u = c => ({ role: 'user', content: c }), a = c => ({ role: 'assistant', content: c });
const offer = (msgs, guides, profile) => guideOffer(msgs, { trip: planTrip(msgs, profile), profile, prefs: { guides } });
const kind = (msgs, guides, profile) => { const o = offer(msgs, guides, profile).offer; return o ? o.kind + ':' + o.id : null; };

/* 1. One reusable card for any checked journey */
assert.deepEqual(Object.keys(GUIDES).sort(), ['dubai.eid.student', 'dubai.nol', 'dubai.sim']);
assert.equal(kind([u("I'll take the metro")]), 'offer:dubai.nol');
assert.equal(kind([u('My university is sponsoring my visa')]), 'offer:dubai.eid.student');
assert.equal(kind([u('I need to get a SIM card')]), 'offer:dubai.sim');
const card = offer([u("I'll take the metro")]).offer;
for (const k of ['id', 'kind', 'title', 'summary', 'steps', 'checkedAt']) assert.ok(card[k], 'card has ' + k);

/* 2. A decision, not a passing mention */
assert.equal(kind([u('the bus was late today')]), null);
assert.equal(kind([u('should I take the metro?')]), null);
assert.equal(kind([u('I need an Emirates ID')]), null, 'clarify first, no card');
assert.equal(kind([u('I just moved here with my kids')]), null);

/* 3–6. Three choices; Not now never saves; the card is not repeated */
const js = fs.readFileSync('workers/trial-ui/chat.js', 'utf8');
for (const label of ['Follow guide', 'Save for later', 'Not now']) assert.ok(js.includes("'" + label + "'"), label);
const notNow = js.slice(js.indexOf("button('Not now'"), js.indexOf('card.append(row)'));
assert.doesNotMatch(notNow, /setJourney/, 'Not now must not save the guide');
assert.match(js, /status:'following'/); assert.match(js, /status:'saved'/);
assert.equal(kind([u("I'll take the metro")], { offered: ['dubai.nol'] }), null, 'once per conversation');
assert.equal(kind([u("I'll take the metro")], { following: ['dubai.nol'] }), null, 'not offered again while following');
assert.equal(kind([u("I'll take the metro")], { saved: ['dubai.nol'] }), null);

/* 7. Asking later brings the same guide back, even if it was offered, dismissed or followed */
assert.equal(kind([u('wait how does the nol card work again?')], { offered: ['dubai.nol'] }), 'refresher:dubai.nol');
const back = offer([u('remind me how the metro works')], { following: ['dubai.nol'] }).offer;
assert.deepEqual([back.kind, back.status], ['refresher', 'following']);
const gate = offer([u("the gate won't open")]).offer;
assert.equal(gate.kind, 'problem'); assert.equal(gate.problem.id, 'gate'); assert.ok(gate.problem.answer.length > 20);

/* 8. The Dubai nol guide only when it fits the actual route */
const dubaiTrip = [u('How do I get to Heriot-Watt from JLT?'), a('What matters most for this trip: time, cost or reliability?'), u('time'), a('Open the buttons below'), u("I think I'll take public transport")];
assert.equal(kind(dubaiTrip), 'offer:dubai.nol');
const sharjahTrip = [u('How do I get to Heriot-Watt from Al Nahda, Sharjah?'), a('What matters most for this trip: time, cost or reliability?'), u('time'), a('Open the buttons below'), u('public transport it is')];
const s = offer(sharjahTrip);
assert.equal(s.offer, null, 'no Dubai guide for a Sharjah–Dubai commute');
assert.match(s.context, /inside Dubai only/); assert.match(s.context, /no checked guide yet/);
assert.equal(kind([u("I'm gonna take public transport")]), null, 'wait until the route is known');
assert.equal(kind([u("I'm gonna take the bus")], undefined, { city: 'Sharjah' }), null);

/* Guide content for the in-app view: same checked data, problems with their steps */
const g = guideContent('dubai.nol');
assert.equal(g.steps.length, 7); assert.match(g.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
assert.ok(g.sources.every(x => x.url.startsWith('https://')));
assert.ok(g.problems.find(p => p.id === 'gate').steps.length >= 3);
assert.equal(guideContent('../secret'), null); assert.equal(guideContent('dubai.nope'), null);

/* Through the Worker: the card arrives with the reply, the AI is told about it, the guide endpoint works */
const HOST = 'https://orivia-ai-preview.habeebahsallah27.workers.dev';
let prompt = '';
const env = { ACCESS_TEST_EMAIL: 'f@x', AI: { run: async (_m, o) => { prompt = o.messages[0].content; return { response: 'I’ve put a guide below.' }; } },
  AI_QUOTA: { limit: async () => ({ success: true }) }, BUDGET_DB: { prepare: () => ({ bind: () => ({ first: async () => ({ calls: 1 }) }) }) } };
const ctx = { access: { getIdentity: async () => ({ email: 'f@x' }) } };
const post = async (messages, guides) => (await worker.fetch(new Request(HOST + '/v1/chat', { method: 'POST', headers: { origin: HOST, 'content-type': 'application/json' },
  body: JSON.stringify({ messages, preferences: { guides } }) }), env, ctx)).json();
let d = await post(dubaiTrip);
assert.equal(d.guideOffer.id, 'dubai.nol'); assert.match(prompt, /GUIDE CARD/);
d = await post(sharjahTrip);
assert.equal(d.guideOffer, undefined); assert.match(prompt, /inside Dubai only/);
d = await post([u("the gate won't open")]);
assert.equal(d.guideOffer.kind, 'problem'); assert.doesNotMatch(d.reply, /travelling from|Which university/, 'a problem is not a route request');
let r = await worker.fetch(new Request(HOST + '/v1/guides/dubai.nol'), env, ctx);
assert.equal(r.status, 200); assert.equal((await r.json()).guide.id, 'dubai.nol');
r = await worker.fetch(new Request(HOST + '/v1/guides/dubai.nope'), env, ctx); assert.equal(r.status, 404);
r = await worker.fetch(new Request(HOST + '/v1/guides/dubai.nol'), env, {}); assert.equal(r.status, 401, 'guides stay behind founder-only access');

console.log('Journey cards: reusable, decision-only, three choices, no nagging, refreshers, route-aware nol guide: passed');
