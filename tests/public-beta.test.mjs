/* Public beta mode: no tester sign-in, but a human check, a per-person daily limit and the overall cap.
   Run: node --experimental-sqlite tests/public-beta.test.mjs (no network: Turnstile is stubbed) */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
const worker = (await import('../workers/orivia-ai-private-trial.mjs')).default;
const sq = new DatabaseSync(':memory:');
const stmt = (sql, args = []) => ({ bind: (...a) => stmt(sql, a), first: async () => sq.prepare(sql).get(...args) ?? null, run: async () => sq.prepare(sql).run(...args) });
let turnstileOk = true, verified = 0;
globalThis.fetch = async (url) => { if (String(url).includes('turnstile')) { verified++; return { json: async () => ({ success: turnstileOk }) }; } throw new Error('no network'); };
const HOST = 'orivia-beta.example.workers.dev';
const env = { PUBLIC_BETA: '1', PUBLIC_HOST: HOST, TURNSTILE_SITE_KEY: 'site-key', TURNSTILE_SECRET: 'secret', SESSION_SECRET: 'x'.repeat(40), PERSON_DAILY_CAP: '2', DAILY_CAP: '100',
  AI: { run: async () => ({ response: 'Hello!' }) }, AI_QUOTA: { limit: async () => ({ success: true }) }, BUDGET_DB: { prepare: sql => stmt(sql) } };
const call = (path, init = {}, e = env) => worker.fetch(new Request('https://' + HOST + path, init), e, {});
const chat = (cookie, ip = '1.1.1.1', e = env) => call('/v1/chat', { method: 'POST', headers: { origin: 'https://' + HOST, 'content-type': 'application/json', 'CF-Connecting-IP': ip, ...(cookie ? { cookie } : {}) },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'hello there' }] }) }, e);

/* Fails closed until it's set up properly */
assert.equal((await call('/', {}, { ...env, TURNSTILE_SECRET: '' })).status, 503);
assert.equal((await call('/', {}, { ...env, SESSION_SECRET: 'short' })).status, 503);
/* No tester sign-in needed for the app and guides */
assert.equal((await call('/')).status, 200);
assert.match((await call('/')).headers.get('content-security-policy'), /challenges\.cloudflare\.com/);
assert.deepEqual(await (await call('/v1/config')).json(), { mode: 'public', turnstileSiteKey: 'site-key' });
assert.equal((await call('/v1/guides')).status, 200);
/* Chat needs the human check */
let r = await chat(); assert.equal(r.status, 401); assert.equal((await r.json()).error, 'human_check');
assert.equal((await chat('orivia_human=9999999999999.' + 'a'.repeat(64))).status, 401, 'a forged cookie is refused');
turnstileOk = false;
r = await call('/v1/human', { method: 'POST', headers: { origin: 'https://' + HOST, 'content-type': 'application/json' }, body: JSON.stringify({ token: 't' }) });
assert.equal(r.status, 403);
turnstileOk = true;
r = await call('/v1/human', { method: 'POST', headers: { origin: 'https://' + HOST, 'content-type': 'application/json' }, body: JSON.stringify({ token: 't' }) });
assert.equal(r.status, 200);
const setCookie = r.headers.get('set-cookie'); assert.match(setCookie, /HttpOnly/); assert.match(setCookie, /Secure/); assert.match(setCookie, /SameSite=Strict/);
const cookie = setCookie.split(';')[0];
assert.equal((await call('/v1/human', { method: 'POST', headers: { origin: 'https://evil.example', 'content-type': 'application/json' }, body: '{"token":"t"}' })).status, 403);
/* Per-person daily limit (2 here), counted by a daily-salted hash, never the raw address */
assert.equal((await chat(cookie)).status, 200);
assert.equal((await chat(cookie)).status, 200);
r = await chat(cookie); assert.equal(r.status, 429); assert.equal((await r.json()).error, 'person_limit');
assert.equal((await chat(cookie, '2.2.2.2')).status, 200, 'someone else still has messages');
const rows = sq.prepare('SELECT who FROM beta_usage').all();
assert.ok(rows.length >= 2 && rows.every(x => /^[0-9a-f]{32}$/.test(x.who) && !x.who.includes('1.1.1.1')));
/* Overall daily cap */
r = await chat(cookie, '3.3.3.3', { ...env, DAILY_CAP: '1' }); assert.equal(r.status, 429); assert.equal((await r.json()).error, 'daily_limit');
/* The private trial is unchanged: still sign-in only, on its own address */
const priv = { ...env, PUBLIC_BETA: '' };
assert.equal((await worker.fetch(new Request('https://orivia-ai-preview.habeebahsallah27.workers.dev/'), priv, {})).status, 401);
assert.equal((await worker.fetch(new Request('https://' + HOST + '/'), priv, {})).status, 404);
console.log('Public beta: fails closed, human check, signed cookie, per-person and daily limits, private trial unchanged: passed');
