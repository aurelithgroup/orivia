/* =========================================================
   ORIVIA SERVER (Cloudflare Worker + D1)
   - Public:  GET  /api/partners/:id  → an organisation's notes for the app
              POST /api/ev            → anonymous counts for partner links
   - Team:    /team  (Orivia team: all organisations, members, numbers)
   - Org:     /org   (one organisation: its details, notes per step, numbers)
   Sign-in is Cloudflare Access (email code). Until Access is set up,
   the team and org pages stay locked.
   Nothing about newcomers is stored: no names, no emails, nothing typed.
   ========================================================= */
import { JOURNEYS, SEED_PARTNERS } from './content.js';
import { teamPage, orgPage, lockedPage } from './pages.js';

const EVENTS = new Set(['journey_open','stage_open','stage_done','journey_complete','help_open','problem','still_stuck','solved','staff_card','deeplink','escalate','escalate_sent']);
const ID_RE = /^[a-z0-9][a-z0-9-]{1,39}$/;
const now = () => new Date().toISOString();

/* ---------- Database ---------- */
let ready = false;
async function db(env){
  if(ready) return env.DB;
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS orgs (id TEXT PRIMARY KEY, city TEXT NOT NULL, data TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, demo INTEGER NOT NULL DEFAULT 0, created TEXT, updated TEXT)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS members (email TEXT NOT NULL, org_id TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'org', added TEXT, PRIMARY KEY (email, org_id))`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS counts (day TEXT NOT NULL, org_id TEXT NOT NULL, ev TEXT NOT NULL, journey TEXT NOT NULL DEFAULT '', stage TEXT NOT NULL DEFAULT '', n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, org_id, ev, journey, stage))`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS audit (at TEXT NOT NULL, email TEXT NOT NULL, action TEXT NOT NULL, org_id TEXT)`),
  ]);
  const { n } = await env.DB.prepare('SELECT COUNT(*) AS n FROM orgs').first();
  if(!n){
    const t = now();
    await env.DB.batch(Object.entries(SEED_PARTNERS).map(([id, p]) => {
      const { city, demo, ...data } = p;
      return env.DB.prepare('INSERT INTO orgs (id, city, data, demo, created, updated) VALUES (?, ?, ?, ?, ?, ?)').bind(id, city, JSON.stringify(data), demo ? 1 : 0, t, t);
    }));
  }
  ready = true;
  return env.DB;
}
const audit = (env, email, action, org) => env.DB.prepare('INSERT INTO audit (at, email, action, org_id) VALUES (?, ?, ?, ?)').bind(now(), email, action, org || null).run();

/* ---------- Responses ---------- */
const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra } });
const html = (body, status = 200) => new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-frame-options': 'DENY', 'referrer-policy': 'no-referrer',
  'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'" } });
function cors(env, req){
  const o = req.headers.get('origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || 'https://aurelithgroup.github.io').split(',').map(s => s.trim());
  return allowed.includes(o) || /^http:\/\/localhost(:\d+)?$/.test(o) ? { 'access-control-allow-origin': o, 'vary': 'origin' } : {};
}

/* ---------- Sign-in: Cloudflare Access ---------- */
let certs = null, certsAt = 0;
const b64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), c => c.charCodeAt(0));
async function accessEmail(req, env){
  if(!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return null;
  const token = req.headers.get('cf-access-jwt-assertion');
  if(!token) return null;
  const [h, p, s] = token.split('.'); if(!s) return null;
  let head, body;
  try{ head = JSON.parse(new TextDecoder().decode(b64u(h))); body = JSON.parse(new TextDecoder().decode(b64u(p))); }catch(e){ return null; }
  if(Date.now() - certsAt > 3600e3 || !certs){
    const r = await fetch(`https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`);
    certs = (await r.json()).keys; certsAt = Date.now();
  }
  const jwk = certs.find(k => k.kid === head.kid); if(!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64u(s), new TextEncoder().encode(`${h}.${p}`));
  const aud = Array.isArray(body.aud) ? body.aud : [body.aud];
  if(!ok || !aud.includes(env.ACCESS_AUD) || body.exp * 1000 < Date.now() || body.iss !== `https://${env.ACCESS_TEAM_DOMAIN}`) return null;
  return String(body.email || '').toLowerCase() || null;
}
async function who(req, env){
  /* Local testing only: never works on the real web address */
  const host = new URL(req.url).hostname;
  const email = (env.DEV_EMAIL && (host === 'localhost' || host === '127.0.0.1')) ? env.DEV_EMAIL.toLowerCase() : await accessEmail(req, env);
  if(!email) return null;
  const team = (env.TEAM_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean).includes(email);
  const { results } = await (await db(env)).prepare("SELECT org_id FROM members WHERE email = ? AND role = 'org'").bind(email).all();
  return { email, team, orgs: results.map(r => r.org_id) };
}
/* Changes must come from our own pages, not another site carrying the sign-in cookie */
const sameOrigin = req => { const o = req.headers.get('origin'); return !o || o === new URL(req.url).origin; };

/* ---------- Helpers ---------- */
const clean = (v, max = 600) => typeof v === 'string' ? v.trim().slice(0, max) : '';
const pair = (o, max) => ({ en: clean(o && o.en, max), ar: clean(o && o.ar, max) });
function cleanOrg(input, city){
  const d = { name: pair(input.name, 120), team: pair(input.team, 120), where: pair(input.where, 200), hours: pair(input.hours, 120), email: clean(input.email, 120), phone: clean(input.phone, 40), notes: {} };
  if(d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) throw new Error('That email address doesn’t look right.');
  const js = new Map(JOURNEYS.filter(j => j.city === city).map(j => [j.id, new Set(j.stages.map(s => s.id))]));
  if(input.entry && js.has(input.entry.j) && js.get(input.entry.j).has(input.entry.s)) d.entry = { j: input.entry.j, s: input.entry.s };
  for(const [jid, stages] of Object.entries(input.notes || {})){
    if(!js.has(jid)) continue;
    for(const [sid, note] of Object.entries(stages || {})){
      if(!js.get(jid).has(sid)) continue;
      const n = pair(note, 600); if(!n.en && !n.ar) continue;
      (d.notes[jid] = d.notes[jid] || {})[sid] = n;
    }
  }
  return d;
}
async function getOrg(env, id){
  const r = await (await db(env)).prepare('SELECT * FROM orgs WHERE id = ?').bind(id).first();
  return r && { id: r.id, city: r.city, active: !!r.active, demo: !!r.demo, updated: r.updated, ...JSON.parse(r.data) };
}
async function stats(env, org, days = 30){
  const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
  const { results } = await (await db(env)).prepare('SELECT ev, journey, stage, SUM(n) AS n FROM counts WHERE org_id = ? AND day >= ? GROUP BY ev, journey, stage ORDER BY n DESC').bind(org, since).all();
  return results;
}

/* ---------- Router ---------- */
export default {
  async fetch(req, env){
    const url = new URL(req.url), path = url.pathname.replace(/\/+$/, '') || '/';
    try{
      /* Public: an organisation's notes for the app */
      if(req.method === 'OPTIONS' && path.startsWith('/api/')) return new Response(null, { status: 204, headers: { ...cors(env, req), 'access-control-allow-methods': 'GET, POST', 'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400' } });
      let m;
      if((m = path.match(/^\/api\/partners\/([a-z0-9-]{2,40})$/)) && req.method === 'GET'){
        const o = await getOrg(env, m[1]);
        if(!o || !o.active) return json({ error: 'not_found' }, 404, cors(env, req));
        const { active, updated, ...pub } = o;
        return json(pub, 200, { ...cors(env, req), 'cache-control': 'public, max-age=300' });
      }
      /* Public: anonymous counts (only for organisations that exist) */
      if(path === '/api/ev' && req.method === 'POST'){
        let b; try{ b = JSON.parse((await req.text()).slice(0, 2000)); }catch(e){ return json({ ok: false }, 400, cors(env, req)); }
        const org = clean(b.p, 40), ev = clean(b.ev, 30), j = clean(b.j, 60).replace(/[^a-z0-9.\-]/gi, ''), s = clean(b.s, 40).replace(/[^a-z0-9.\-]/gi, '');
        if(!ID_RE.test(org) || !EVENTS.has(ev)) return json({ ok: false }, 400, cors(env, req));
        const D = await db(env);
        const exists = await D.prepare('SELECT 1 FROM orgs WHERE id = ? AND active = 1').bind(org).first();
        if(!exists) return json({ ok: false }, 404, cors(env, req));
        await D.prepare('INSERT INTO counts (day, org_id, ev, journey, stage, n) VALUES (?, ?, ?, ?, ?, 1) ON CONFLICT (day, org_id, ev, journey, stage) DO UPDATE SET n = n + 1')
          .bind(now().slice(0, 10), org, ev, j, s).run();
        return json({ ok: true }, 200, cors(env, req));
      }

      /* Everything below needs sign-in */
      const me = await who(req, env);
      if(path === '/' ){
        if(!me) return html(lockedPage(!!(env.ACCESS_TEAM_DOMAIN && env.ACCESS_AUD)), 401);
        return Response.redirect(url.origin + (me.team ? '/team' : '/org'), 302);
      }
      if(path === '/team' || path === '/org'){
        if(!me) return html(lockedPage(!!(env.ACCESS_TEAM_DOMAIN && env.ACCESS_AUD)), 401);
        if(path === '/team' && !me.team) return Response.redirect(url.origin + '/org', 302);
        return html(path === '/team' ? teamPage() : orgPage());
      }
      if(!path.startsWith('/api/')) return html(lockedPage(true), 404);
      if(!me) return json({ error: 'sign_in' }, 401);
      if(req.method !== 'GET' && !sameOrigin(req)) return json({ error: 'bad_origin' }, 403);

      if(path === '/api/me') return json({ email: me.email, team: me.team, orgs: me.orgs });
      if(path === '/api/journeys') return json(JOURNEYS);

      /* Organisation pages (team members can open any organisation) */
      if((m = path.match(/^\/api\/org\/([a-z0-9-]{2,40})(\/stats)?$/))){
        const id = m[1];
        if(!me.team && !me.orgs.includes(id)) return json({ error: 'not_yours' }, 403);
        const o = await getOrg(env, id); if(!o) return json({ error: 'not_found' }, 404);
        if(m[2]) return json(await stats(env, id, Math.min(+url.searchParams.get('days') || 30, 365)));
        if(req.method === 'GET') return json(o);
        if(req.method === 'PUT'){
          const d = cleanOrg(await req.json(), o.city);
          await (await db(env)).prepare('UPDATE orgs SET data = ?, updated = ? WHERE id = ?').bind(JSON.stringify(d), now(), id).run();
          await audit(env, me.email, 'org_saved', id);
          return json({ ok: true, ...(await getOrg(env, id)) });
        }
      }

      /* Orivia team only */
      if(path.startsWith('/api/admin/')){
        if(!me.team) return json({ error: 'team_only' }, 403);
        const D = await db(env);
        if(path === '/api/admin/orgs' && req.method === 'GET'){
          const { results: orgs } = await D.prepare('SELECT id, city, data, active, demo, updated FROM orgs ORDER BY demo, id').all();
          const { results: mem } = await D.prepare("SELECT email, org_id FROM members WHERE role = 'org' ORDER BY email").all();
          const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
          const { results: c } = await D.prepare('SELECT org_id, ev, SUM(n) AS n FROM counts WHERE day >= ? GROUP BY org_id, ev').bind(since).all();
          return json(orgs.map(o => ({ id: o.id, city: o.city, active: !!o.active, demo: !!o.demo, updated: o.updated, name: JSON.parse(o.data).name,
            members: mem.filter(x => x.org_id === o.id).map(x => x.email),
            counts: Object.fromEntries(c.filter(x => x.org_id === o.id).map(x => [x.ev, x.n])) })));
        }
        if(path === '/api/admin/orgs' && req.method === 'POST'){
          const b = await req.json();
          const id = clean(b.id, 40).toLowerCase(), city = b.city === 'edinburgh' ? 'edinburgh' : 'dubai';
          if(!ID_RE.test(id)) return json({ error: 'Use 2–40 lowercase letters, numbers or dashes for the link name.' }, 400);
          if(await getOrg(env, id)) return json({ error: 'That link name is already taken.' }, 409);
          const d = cleanOrg({ name: b.name, team: b.team, email: b.email }, city);
          if(!d.name.en) return json({ error: 'Add the organisation’s name in English.' }, 400);
          await D.prepare('INSERT INTO orgs (id, city, data, created, updated) VALUES (?, ?, ?, ?, ?)').bind(id, city, JSON.stringify(d), now(), now()).run();
          await audit(env, me.email, 'org_created', id);
          return json({ ok: true, id });
        }
        if((m = path.match(/^\/api\/admin\/orgs\/([a-z0-9-]{2,40})\/(members|active)$/))){
          const id = m[1]; if(!(await getOrg(env, id))) return json({ error: 'not_found' }, 404);
          const b = await req.json();
          if(m[2] === 'active'){
            await D.prepare('UPDATE orgs SET active = ?, updated = ? WHERE id = ?').bind(b.active ? 1 : 0, now(), id).run();
            await audit(env, me.email, b.active ? 'org_on' : 'org_off', id); return json({ ok: true });
          }
          const email = clean(b.email, 120).toLowerCase();
          if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'That email address doesn’t look right.' }, 400);
          if(req.method === 'POST'){ await D.prepare("INSERT OR IGNORE INTO members (email, org_id, role, added) VALUES (?, ?, 'org', ?)").bind(email, id, now()).run(); await audit(env, me.email, 'member_added:' + email, id); }
          if(req.method === 'DELETE'){ await D.prepare('DELETE FROM members WHERE email = ? AND org_id = ?').bind(email, id).run(); await audit(env, me.email, 'member_removed:' + email, id); }
          return json({ ok: true });
        }
      }
      return json({ error: 'not_found' }, 404);
    }catch(e){
      return json({ error: e && e.message ? e.message : 'Something went wrong' }, 400);
    }
  }
};
