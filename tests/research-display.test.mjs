/* Research display: only server-vetted https sources, agreed labels, numbered citations kept and linked,
   claims shown as "Source-backed", gaps as "Couldn't confirm", every failure state worded.
   Uses FIXTURES (tests/fixtures/research-replies.json) because live search is not configured.
   Run: node tests/research-display.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const js = fs.readFileSync('workers/trial-ui/chat.js', 'utf8');
const F = JSON.parse(fs.readFileSync('tests/fixtures/research-replies.json', 'utf8'));
const grab = name => { const a = js.indexOf('function ' + name + '('); assert.ok(a >= 0, name); let depth = 0, i = js.indexOf('{', a); for (; i < js.length; i++) { if (js[i] === '{') depth++; else if (js[i] === '}' && --depth === 0) break; } return js.slice(a, i + 1); };
const kinds = js.slice(js.indexOf('const SOURCE_KIND='), js.indexOf(';', js.indexOf('const SOURCE_KIND=')) + 1);
const { safeSources, safeResearch, citeSegments } = new Function(kinds + grab('safeSchoolContext') + grab('safeLoopTask') + grab('safeTaskContext') + grab('safeSources') + grab('safeResearch') + grab('citeSegments') + ';return {safeSources,safeResearch,citeSegments}')();

/* Labels */
let s = safeSources(F['evidence-found'].liveSources);
assert.deepEqual(s.map(x => x.kind), ['Official source', 'Organisation source']);
assert.doesNotMatch(js.slice(js.indexOf('/* ===== Research display'), js.indexOf('/* ===== Settings')), /['"]Verified|['"]Confirmed/, 'no "verified"/"confirmed" labels');
assert.match(js, /Source-backed/); assert.match(js, /Couldn’t confirm/); assert.match(js, /doesn’t mean every requirement has been verified/);
/* Only vetted https sources, never scripts or plain http. Community pages are shown, labelled as people's experiences
   (founder's brief, 18 Oct: experiences may be used when labelled, never as an official requirement). */
s = safeSources(F.hostile.liveSources);
assert.deepEqual(s.map(x => x.url), ['https://www.gov.uk/fixture', 'https://www.reddit.com/r/dubai']);
assert.equal(s[1].kind, 'People’s experiences');
/* Citations: numbers kept, linked only to vetted sources, the plain reference list replaced by cards */
let seg = citeSegments(F['evidence-found'].reply, safeSources(F['evidence-found'].liveSources));
assert.deepEqual(seg.filter(x => x.n).map(x => [x.n, x.src.id]), [['1', 'S1'], ['2', 'S2']]);
assert.ok(!seg.some(x => x.text && /https:\/\//.test(x.text)), 'reference lines become source cards');
seg = citeSegments(F.hostile.reply, safeSources(F.hostile.liveSources));
assert.deepEqual(seg.filter(x => x.n).map(x => x.src.url), ['https://www.gov.uk/fixture'], 'the http citation stays plain text');
assert.ok(seg.some(x => x.text && x.text.includes('[1]')));
/* Claims and gaps */
const r = safeResearch(F.partial.research);
assert.equal(r.claims.length, 1); assert.deepEqual(r.unresolved, ['biometrics', 'community-permissions-pending']);
assert.match(js, /filter\(c=>srcs\.some\(s=>s\.id&&s\.id===c\.sourceId\)\)/, 'claims about unknown sources are not shown');
/* Every failure state has wording */
const notes = js.slice(js.indexOf('const RESEARCH_NOTE='), js.indexOf('};', js.indexOf('const RESEARCH_NOTE=')));
for (const st of ['not-configured', 'search-limit', 'search-unavailable', 'answer-unavailable', 'no-evidence', 'insufficient-evidence', 'unsupported', 'community-permissions-pending', 'partial'])
  assert.ok(notes.includes("'" + st + "'"), st);
/* Source details stay in the browser tab and are never sent back to the AI */
assert.match(js, /messages:chatMessages\((?:turns|sentTurns)\)/);
const chatMessages=new Function(grab('chatMessages')+';return chatMessages')();
const longReply={role:'assistant',content:'a'.repeat(2000),meta:{sources:[{url:'https://www.gov.uk/fixture'}]}};
assert.deepEqual(chatMessages([longReply]),[{role:'assistant',content:'a'.repeat(1200)}], 'a long researched reply must not break the next chat request or send evidence metadata');
assert.equal(longReply.content.length,2000,'the displayed reply stays intact');
/* Guides are not presented as fresh research */
assert.doesNotMatch(js.slice(js.indexOf('async function openGuide'), js.indexOf('async function openGuide') + 6000), /Opened by Orivia|Source-backed/);
const spoken = new Function('return ' + js.slice(js.indexOf('const spokenText=') + 17, js.indexOf('; // no reference lists')))();
assert.equal(spoken(F['evidence-found'].reply).includes('https'), false); assert.equal(/\[\d\]/.test(spoken(F['evidence-found'].reply)), false, 'Listen skips citations and web addresses');
/* Per-fact quotes: each fact in a school claim keeps its own labelled quote; older single-quote claims still show */
{
  const sl = safeResearch(F['school-list'].research);
  assert.equal(sl.claims.length, 1);
  assert.deepEqual(sl.claims[0].quotes.map(q => q.label), ['Curriculum', 'Area', 'Year groups']);
  assert.deepEqual(sl.claims[0].quotes.map(q => q.quote), ['Curriculum: British', 'School Location Sharjah - Muwaileh', 'Grade: FS1 | FS2 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13']);
  const junk = safeResearch({ claims: [{ text: 'A school', sourceId: 'S1', quote: '', quotes: [{ label: 'Area' }, 'x', null, { label: { a: 1 }, quote: 42 }, { label: 'Curriculum', quote: 'Curriculum: British' }] }] });
  assert.deepEqual(junk.claims[0].quotes, [{ label: 'Curriculum', quote: 'Curriculum: British' }], 'only string quotes are kept');
  assert.equal(safeResearch({ claims: [{ text: 'No evidence', sourceId: 'S1', quote: '', quotes: [] }] }).claims.length, 0, 'a claim with no quote at all is not shown');
  assert.equal(safeResearch(F.partial.research).claims[0].quotes.length, 0, 'older single-quote claims still work');
  const block = grab('researchBlock');
  assert.match(block, /c\.quotes&&c\.quotes\.length>1/); assert.match(block, /'q-label',q\.label/);
  assert.match(block, /Each part of this point is quoted from source/);
}
console.log('Research display (fixtures): labels, vetted sources only, linked citations, source-backed claims, gaps and failure states: passed');
