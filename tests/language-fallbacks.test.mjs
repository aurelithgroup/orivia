/* The language matrix records where French and Arabic still fall back to English (30 Oct). This recounts the guide
   view's interface strings that have no French or Arabic entry, so the recorded number can't silently go stale, and
   checks the other recorded fallbacks still describe the code. Run: node tests/language-fallbacks.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const doc=fs.readFileSync('docs/language-matrix.md','utf8').replace(/\r\n/g,'\n');
const tr=JSON.parse(fs.readFileSync('workers/trial-ui/translations.json','utf8'));
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8'),start=chat.indexOf('async function openGuide'),seg=chat.slice(start,chat.indexOf('\n}\n',start));
const lits=new Set([...seg.matchAll(/(?:uiText|button|el|block)\((?:'[a-z -]*',\s*)?'([A-Z←][^'\\]{2,140})'/g)].map(m=>m[1]));
const missing=[...lits].filter(s=>!tr[s]||!tr[s].ar||!tr[s].fr);
const m=doc.match(/\*\*Guide view\*\* \(`openGuide` in `chat\.js`\): (\d+) of (\d+) strings/);
assert.ok(m,'the guide view fallback is recorded');
assert.equal(+m[1],missing.length,'recorded count of guide view strings without French or Arabic matches the code');
assert.equal(+m[2],lits.size,'recorded total matches the code');
for(const s of ['About this step','Do this','Ask Orivia about this step'])assert.ok(missing.includes(s),s+' is still a recorded fallback');
// The caveat phrases are the exception: translated, and flagged for review.
for(const s of ['Confirm with the organisation before you act.','This step hasn’t been reviewed in your language yet. If anything is unclear, ask the organisation or check the English.'])assert.ok(tr[s]?.ar&&tr[s]?.fr,s);
assert.ok(doc.includes('written by Cleo, awaiting review'));
// Guide content in the chat app is served in English (no language parameter on the guide route).
assert.ok(/fetch\('\/v1\/guides\/'\+encodeURIComponent\(id\),\{/.test(chat)&&doc.includes('**Guide content in the chat app is English.**'));
console.log('Language fallbacks: '+missing.length+' of '+lits.size+' guide view strings fall back to English, as recorded; other fallbacks recorded.');
