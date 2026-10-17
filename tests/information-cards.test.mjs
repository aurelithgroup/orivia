/* Information cards: only sourced facts and contacts are shown; drafts say only what the person told us.
   Runs the real functions from workers/trial-ui/chat.js against tests/fixtures/organisation-cards.json (labelled fixtures).
   Run: node tests/information-cards.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const js = fs.readFileSync('workers/trial-ui/chat.js', 'utf8'), html = fs.readFileSync('workers/trial-ui/page.html', 'utf8');
const F = JSON.parse(fs.readFileSync('tests/fixtures/organisation-cards.json', 'utf8'));
const grab = name => { const a = js.indexOf('function ' + name + '('); assert.ok(a >= 0, name); let depth = 0, i = js.indexOf('{', a); for (; i < js.length; i++) { if (js[i] === '{') depth++; else if (js[i] === '}' && --depth === 0) break; } return js.slice(a, i + 1); };
const konst = name => { const a = js.indexOf('const ' + name + '='); assert.ok(a >= 0, name); return js.slice(a, js.indexOf(';\n', a) + 1); };
const api = new Function('turnsIn', 'let turns=turnsIn;' + konst('SOURCE_KIND') + konst('MAPS_HOSTS') + konst('ORG_KINDS') +
  ['safeSources', 'sourcedItem', 'safePhone', 'safeEmail', 'safeHttps', 'safeOrgs', 'telHref', 'toldYear', 'emailDraft', 'phoneScript', 'mailHref'].map(grab).join('\n') +
  ';return {safeSources,safeOrgs,telHref,emailDraft,phoneScript,mailHref,setTurns:t=>{turns=t}}');
const A = api([]);
const orgsOf = name => A.safeOrgs(F[name].organisations, A.safeSources(F[name].liveSources));

assert.match(F._note, /FIXTURES/); assert.ok(F.list.organisations.every(o => o.fixture === true), 'fixtures are labelled');
assert.ok(F.list.liveSources.every(s => s.title.startsWith('[Fixture]')));

/* D: several results */
let orgs = orgsOf('list');
assert.equal(orgs.length, 3);
const [wes, sbi, alm] = orgs;
assert.deepEqual(Object.keys(wes.contacts), ['phone', 'email', 'directions']);
assert.deepEqual(Object.keys(sbi.contacts), ['phone', 'email'], 'no map link on the page, so no directions');
assert.deepEqual(Object.keys(alm.contacts), ['phone'], 'no email on the page, so no email button');
assert.equal(wes.contacts.directions.url, 'https://goo.gl/maps/5s3CsgSov2Q2', 'directions come from the source page’s own map link');
assert.deepEqual(sbi.facts.map(f => f.key), ['curriculum', 'grades', 'area', 'rating']);
assert.ok(orgs.every(o => o.facts.every(f => f.quote && f.src.id)), 'every fact carries its quote and source');
assert.equal(orgs[0].fixture, true);

/* Facts only: no contact buttons beyond the source page */
orgs = orgsOf('facts-only'); assert.equal(orgs.length, 1); assert.deepEqual(orgs[0].contacts, {});

/* Hostile data never reaches the card */
orgs = orgsOf('hostile');
assert.deepEqual(orgs.map(o => o.id), ['bad-1', 'bad-2'], 'organisations from unvetted pages or without a name are dropped');
assert.deepEqual(orgs[0].facts.map(f => f.key), ['curriculum'], 'facts without a quote, or from an unvetted or unknown source, are dropped');
assert.deepEqual(orgs[0].contacts, {}, 'invalid phone/email, javascript: website and non-map hosts are dropped');
assert.deepEqual(orgs[1].contacts, {}, 'unsourced phone, an unquoted guessed pin and an http website are dropped');
assert.equal(A.safeOrgs(F.list.organisations, []).length, 0, 'no vetted sources, no cards');

/* Links: Call opens the dialler, Email opens a draft to review */
assert.equal(A.telHref('06 534 7722'), 'tel:065347722');
const m = A.mailHref(sbi); assert.match(m, /^mailto:sharjahbritish-psch@spea\.shj\.ae\?subject=Admissions%20enquiry&body=/);

/* Drafts say only what the person told us */
A.setTurns([{ role: 'user', content: 'Find British curriculum schools in Sharjah' }, { role: 'assistant', content: 'Year 9 is popular.' }]);
let d = A.emailDraft(sbi);
assert.equal(d.subject, 'Admissions enquiry'); assert.doesNotMatch(d.body, /Year \d/, 'a year only the assistant mentioned is not used');
for (const text of [d.body, ...A.phoneScript(sbi)]) assert.doesNotMatch(text, /moving|relocat|my (?:child|son|daughter|kids?)|we’re|\[|Dear [A-Z]|Regards,\s*\S/i, 'no assumed move, family, name or placeholders');
A.setTurns([{ role: 'user', content: 'which of them have year 6 places?' }]);
d = A.emailDraft(sbi); assert.equal(d.subject, 'Admissions enquiry: Year 6'); assert.match(d.body, /admissions for Year 6/);
assert.match(A.phoneScript(sbi)[0], /for Year 6/);
const generic = A.emailDraft({ kind: 'organisation', src: { host: 'example.gov.ae' } }); assert.doesNotMatch(generic.body, /Year|admissions/);

/* Wiring */
assert.match(js, /meta\.organisations=JSON\.parse\(JSON\.stringify\(orgs\)\)/, 'organisations are saved with the reply');
assert.match(js, /if\(vetted\.length&&Array\.isArray\(d\.organisations\)\)/, 'only alongside vetted sources');
assert.match(js, /d.className='sources-fold'/, 'full source list folds away under cards');
assert.match(js, /orgEvidence\(o\)/); assert.match(grab('orgEvidence'), /'Sources and evidence'/);
const card = js.slice(js.indexOf('function orgCard('), js.indexOf('function orgCards('));
assert.match(card, /if\(o\.contacts\.directions\)\{foot\.append\(actLink\('Take me there'/, 'Take me there only with a sourced destination');
assert.match(card, /if\(o\.contacts\.phone\)acts\.push/); assert.match(card, /if\(o\.contacts\.email\)acts\.push/); assert.match(card, /if\(o\.contacts\.website\)acts\.push/);
assert.match(grab('orgCards'), /t\.meta\.shortlist=\[\.\.\.shortlist\];saveMeta\(\)/, 'shortlist is saved with the chat');
assert.match(grab('orgCards'), /t\.meta\.cardsHidden=true;saveMeta\(\)/, 'Not now is remembered');
assert.match(grab('draw'), /listen\(spokenText\(t\.content\),lb\)/, 'Listen still reads the reply');
for (const k of ['.org-card', '.org-mini', '.org-bar', '.org-choice', '.org-tab.on']) assert.ok(html.includes(k + '{'), k);
assert.doesNotMatch(html.slice(html.indexOf('/* Information cards */'), html.indexOf('/* Chat history drawer */')), /#fff\b|#FFFFFF|#000\b/i, 'card colours come from the light/dark tokens');
console.log('Information cards: sourced facts and contacts only, safe links, drafts without assumptions, shortlist saved: passed');
