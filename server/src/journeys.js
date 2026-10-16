/* =========================================================
   JOURNEY API (v1): Orivia's checked knowledge, read-only.
   Serves the same checked journey content the public app already shows,
   so the AI and the app read one version. No user data is stored or
   returned here: placement answers arrive in the request and are not kept.
   Contract: docs/journey-api.md
   ========================================================= */
import { AI_READY, JOURNEYS, PATHWAYS, CONTACTS } from './journeys-data.js';

export const API_VERSION = '2026-10-16';
/* Shape the data for the AI tools (matches docs/ai-journey-integration-contract.md):
   - every check-up offers plain answers, including "I'm not sure" where allowed, as answers{} and options[]
   - options carry the step they point to: yes = that step is done, so the next step; no = that step
   - every step carries source {name, url, checkedAt}: the journey's primary reviewed source (sources are journey-level today) */
for(const j of Object.values(JOURNEYS)){
  j.checkedAt = j.checked;
  const ids = j.steps.map(s => s.id), primary = (j.sources || []).find(x => /^https:\/\//.test(x.url));
  for(const s of j.steps) s.source = primary ? { name: primary.name, url: primary.url, checkedAt: j.checked } : null;
  for(const c of j.checkups){
    c.answers = { yes: (c.answers && c.answers.yes) || { en: 'Yes', ar: 'نعم' }, no: (c.answers && c.answers.no) || { en: 'No', ar: 'لا' } };
    if(c.allowsUnsure) c.answers.unsure = { en: 'I’m not sure', ar: 'لست متأكداً' };
    const after = ids[ids.indexOf(c.step) + 1] || null;
    c.options = [{ value: 'yes', label: c.answers.yes, stepId: after }, { value: 'no', label: c.answers.no, stepId: c.step }];
    if(c.allowsUnsure) c.options.push({ value: 'not_sure', label: c.answers.unsure });
  }
}
const REVIEW_DAYS = 90;
const STATUSES = ['not_started', 'in_progress', 'waiting', 'done', 'unsure'];

/* {en, ar} pairs → plain strings in the requested language (lang=all keeps both) */
function flat(v, lang){
  if(lang === 'all') return v;
  if(Array.isArray(v)) return v.map(x => flat(x, lang));
  if(v && typeof v === 'object'){
    if(typeof v.en === 'string' && Object.keys(v).every(k => k === 'en' || k === 'ar')) return (lang === 'ar' && v.ar) ? v.ar : v.en;
    return Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined && x !== null).map(([k, x]) => [k, flat(x, lang)]));
  }
  return v;
}
function freshness(j, today = new Date()){
  if(!j.checked) return { verifiedOn: null, reviewDue: null, fresh: false, note: 'No verification date. Treat every fact as unconfirmed and point the person to the official source.' };
  const due = new Date(Date.parse(j.checked) + REVIEW_DAYS * 864e5).toISOString().slice(0, 10);
  const fresh = today.toISOString().slice(0, 10) <= due;
  return { verifiedOn: j.checked, reviewDue: due, fresh,
    note: fresh ? null : `Last checked on ${j.checked}. Say so, and ask the person to confirm fees, documents and deadlines with the official source before acting.` };
}
const sourceList = j => (j.sources || []).map(s => ({ name: s.name, url: s.url }));
const summary = (j, lang) => flat({ id: j.id, city: j.city, need: j.need, title: j.title, aiReady: AI_READY.includes(j.id),
  ...freshness(j), steps: j.steps.map(s => ({ id: s.id, title: s.title })) }, lang);
function contact(key, lang){ const c = CONTACTS[key]; return c ? flat({ key, ...c }, lang) : null; }
function stepStatuses(s){ return STATUSES.filter(x => x !== 'waiting' || s.waitingFor || s.appointment); }
function expandProblem(j, p, lang){
  if(!p) return null;
  const keys = [p.contact && p.contact.to, ...((p.branch && p.branch.options) || []).map(o => o.contact && o.contact.to)].filter(Boolean);
  return { ...flat(p, lang), contacts: [...new Set(keys)].map(k => contact(k, lang)).filter(Boolean) };
}
function expandStep(j, s, lang){
  const i = j.steps.indexOf(s);
  return {
    journey: { id: j.id, title: flat(j.title, lang) },
    step: flat({ ...s, problemIds: undefined, contactKeys: undefined, checkupIds: undefined }, lang),
    position: { index: i + 1, of: j.steps.length, previous: i > 0 ? j.steps[i - 1].id : null, next: i < j.steps.length - 1 ? j.steps[i + 1].id : null },
    statuses: stepStatuses(s),
    checkups: flat(j.checkups.filter(c => c.step === s.id), lang),
    problems: (s.problemIds || []).map(id => expandProblem(j, j.problems.find(p => p.id === id), lang)).filter(Boolean),
    contacts: (s.contactKeys || []).map(k => contact(k, lang)).filter(Boolean),
    sources: flat(sourceList(j), lang),
    ...freshness(j)
  };
}
/* Where is the person? answers = { q1: 'yes'|'no'|'unsure', … } (yes = that step is done) */
export function place(j, answers, lang){
  const done = [], unsure = [];
  const ids = j.steps.map(s => s.id), idx = id => ids.indexOf(id);
  for(const c of j.checkups){
    const a = answers[c.id] === 'not_sure' ? 'unsure' : answers[c.id];
    if(a === 'yes'){ for(const id of ids.slice(0, idx(c.step) + 1)) if(!done.includes(id)) done.push(id); continue; }
    if(a === 'no' || a === 'unsure'){
      if(a === 'unsure') unsure.push(c.step);
      return { status: a === 'unsure' ? 'not_sure' : 'candidate', stepId: a === 'unsure' ? null : c.step, requiresConfirmation: true,
        currentStep: c.step, currentStatus: a === 'unsure' ? 'unsure' : 'in_progress', done, unsure,
        confirmHow: a === 'unsure' ? flat(c.confirm || null, lang) : null, nextQuestion: null, complete: false };
    }
    return { status: 'needs_answer', stepId: null, requiresConfirmation: true, currentStep: null, currentStatus: null, done, unsure, confirmHow: null, nextQuestion: flat(c, lang), complete: false };
  }
  const last = j.checkups.length ? idx(j.checkups.at(-1).step) : -1;
  const next = ids[last + 1] || null;
  return { status: 'candidate', stepId: next, requiresConfirmation: true, currentStep: next, currentStatus: next ? 'in_progress' : 'done', done, unsure, confirmHow: null, nextQuestion: null, complete: !next };
}
/* Candidate journeys for what someone said. Never picks one: the AI must ask what they want first. */
export function match(q, city){
  const STOP = new Set(['the','and','for','you','your','next','month','week','year','day','today','tomorrow','help','need','want','how','what','when','where','can','get','got','have','with','this','that','just','now','soon','about','please','will','from','into','some','any','its','i\'m','im']);
  const words = String(q || '').toLowerCase().normalize('NFKD').split(/[^\p{L}\p{N}]+/u).filter(w => w.length > 2 && !STOP.has(w));
  if(!words.length) return [];
  return Object.values(JOURNEYS).filter(j => !city || j.city === city).map(j => {
    const hay = [j.title && j.title.en, j.keywords, j.need, ...j.steps.map(s => s.title && s.title.en)].join(' ').toLowerCase();
    const hits = words.filter(w => hay.includes(w));
    return { j, hits, score: hits.length + (AI_READY.includes(j.id) ? 0.25 : 0) };
  }).filter(x => x.hits.length).sort((a, b) => b.score - a.score).slice(0, 5)
    .map(x => ({ id: x.j.id, title: x.j.title.en, city: x.j.city, aiReady: AI_READY.includes(x.j.id), matchedWords: x.hits, pathway: x.j.pathway || null }));
}

/* Router: returns a Response, or null when the path isn't a journey path */
export function journeyRoute(url, json, headers){
  const p = url.pathname.replace(/\/+$/, '');
  if(!p.startsWith('/api/v1/')) return null;
  const lang = ['en', 'ar', 'all'].includes(url.searchParams.get('lang')) ? url.searchParams.get('lang') : 'en';
  const ok = data => json({ version: API_VERSION, ...data }, 200, headers);
  const notFound = what => json({ version: API_VERSION, error: 'not_found', detail: what }, 404, headers);
  let m;
  if(p === '/api/v1/journeys'){
    const onlyReady = url.searchParams.get('aiReady') === '1', city = url.searchParams.get('city');
    return ok({ journeys: Object.values(JOURNEYS).filter(j => (!onlyReady || AI_READY.includes(j.id)) && (!city || j.city === city)).map(j => summary(j, lang)) });
  }
  if(p === '/api/v1/journeys/match'){
    const q = (url.searchParams.get('q') || '').slice(0, 300), city = url.searchParams.get('city') || null;
    const candidates = match(q, city);
    const pathwayIds = [...new Set(candidates.map(c => c.pathway).filter(Boolean))];
    return ok({ query: q, candidates, pathways: pathwayIds.map(id => flat(PATHWAYS[id], lang)).filter(Boolean),
      instruction: 'Candidates only. Ask the person what they want help with before choosing a journey. If a pathway is listed, ask its question to pick between its journeys.' });
  }
  if((m = p.match(/^\/api\/v1\/pathways\/([a-z0-9.]+)$/))){ const x = PATHWAYS[m[1]]; return x ? ok({ pathway: flat(x, lang) }) : notFound('pathway'); }
  if((m = p.match(/^\/api\/v1\/contacts\/([a-z0-9_-]+)$/))){ const c = contact(m[1], lang); return c ? ok({ contact: c }) : notFound('contact'); }
  if(!(m = p.match(/^\/api\/v1\/journeys\/([a-z0-9.]+)(?:\/(steps|problems)\/([a-z0-9_-]+)|\/(place))?$/))) return notFound('path');
  const j = JOURNEYS[m[1]]; if(!j) return notFound('journey');
  if(m[2] === 'steps'){ const s = j.steps.find(x => x.id === m[3]); return s ? ok(expandStep(j, s, lang)) : notFound('step'); }
  if(m[2] === 'problems'){ const pr = j.problems.find(x => x.id === m[3]); return pr ? ok({ journey: { id: j.id }, problem: expandProblem(j, pr, lang), sources: flat(sourceList(j), lang), ...freshness(j) }) : notFound('problem'); }
  if(m[4] === 'place'){
    const answers = {};
    for(const part of (url.searchParams.get('answers') || '').split(',')){ const [k, v] = part.split(':'); if(/^q\d{1,2}$/.test(k) && ['yes', 'no', 'unsure', 'not_sure'].includes(v)) answers[k] = v === 'not_sure' ? 'unsure' : v; }
    return ok({ journey: { id: j.id }, answers, placement: place(j, answers, lang), ...freshness(j) });
  }
  return ok({ journey: { ...flat({ ...j, keywords: undefined }, lang), aiReady: AI_READY.includes(j.id), statuses: STATUSES }, ...freshness(j) });
}

/* Same answers without HTTP, for Workers in this repo (e.g. the private AI trial):
   const { status, data } = callJourneyApi('/api/v1/journeys/dubai.eid.student/steps/biometrics');
   Returns exactly what the HTTP endpoint would return. */
export function callJourneyApi(pathWithQuery){
  const url = new URL(pathWithQuery, 'https://orivia-api.internal');
  let out = { status: 404, data: { version: API_VERSION, error: 'not_found', detail: 'path' } };
  journeyRoute(url, (data, status) => { out = { status, data }; return null; }, {});
  return out;
}
