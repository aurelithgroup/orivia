/* Run: node --experimental-sqlite tests/journey-api.test.mjs  (no network) */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
const worker = (await import('../server/src/index.js')).default;
const sq = new DatabaseSync(':memory:');
const stmt = (sql, args = []) => ({ bind: (...a) => stmt(sql, a), first: async () => sq.prepare(sql).get(...args) ?? null, all: async () => ({ results: sq.prepare(sql).all(...args) }), run: async () => sq.prepare(sql).run(...args) });
const env = { DB: { prepare: sql => stmt(sql), batch: async l => { for(const s of l) await s.run(); } }, ACCESS_AUD: 'x', ALLOWED_ORIGINS: 'https://orivia-ai-preview.habeebahsallah27.workers.dev' };
const get = async (path, headers = {}) => { const r = await worker.fetch(new Request('https://orivia-api.example' + path, { headers }), env); return [r.status, await r.json().catch(() => null), r.headers]; };

let [s, d, h] = await get('/api/v1/journeys?aiReady=1', { origin: 'https://orivia-ai-preview.habeebahsallah27.workers.dev' });
assert.equal(s, 200); assert.equal(d.journeys.length, 1); assert.equal(d.journeys[0].id, 'dubai.eid.student');
assert.equal(h.get('access-control-allow-origin'), 'https://orivia-ai-preview.habeebahsallah27.workers.dev');
assert.ok(d.journeys[0].verifiedOn && d.journeys[0].reviewDue);

[s, d] = await get('/api/v1/journeys');
assert.ok(d.journeys.length >= 30);

[s, d] = await get('/api/v1/journeys/match?q=' + encodeURIComponent("I'm starting university next month") + '&city=dubai');
assert.equal(s, 200); assert.ok(d.candidates.some(c => c.id === 'dubai.eid.student')); assert.match(d.instruction, /Ask the person/);

[s, d] = await get('/api/v1/journeys/dubai.eid.student/steps/biometrics');
assert.equal(s, 200);
assert.equal(typeof d.step.title, 'string');
assert.ok(d.sources.length && d.sources[0].url.startsWith('https://'));
assert.ok(d.verifiedOn); assert.ok('fresh' in d);
assert.ok(d.checkups.length >= 1); assert.ok(d.statuses.includes('waiting'));
assert.ok(d.contacts.some(c => c.key === 'visa'));
assert.equal(d.position.previous, 'medical');

[s, d] = await get('/api/v1/journeys/dubai.eid.student/steps/biometrics?lang=ar');
assert.match(d.step.title, /[؀-ۿ]/);

[s, d] = await get('/api/v1/journeys/dubai.eid.student/place?answers=q1:yes,q2:yes');
assert.equal(d.placement.nextQuestion.id, 'q3');
[s, d] = await get('/api/v1/journeys/dubai.eid.student/place?answers=q1:yes,q2:yes,q3:yes,q4:unsure');
assert.equal(d.placement.currentStatus, 'unsure'); assert.ok(d.placement.confirmHow);
[s, d] = await get('/api/v1/journeys/dubai.eid.student/place?answers=q1:no');
assert.equal(d.placement.currentStep, 'permit');

[s, d] = await get('/api/v1/journeys/dubai.eid.student/problems/late');
assert.equal(s, 200); assert.ok(d.problem.contacts.length);

[s] = await get('/api/v1/journeys/nope'); assert.equal(s, 404);
[s] = await get('/api/v1/journeys/dubai.eid.student/steps/nope'); assert.equal(s, 404);

/* Existing features untouched: private pages stay locked, public partner notes still work */
[s] = await get('/admin/api/me'); assert.equal(s, 401);
[s, d] = await get('/api/partners/demo-uni'); assert.equal(s, 200); assert.equal(d.id, 'demo-uni');
console.log('Journey API v1: list, match, step, place, problems, freshness, CORS, and existing auth: passed');
