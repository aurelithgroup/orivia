/* ORI-VOICE-001: the language matrix (docs/language-matrix.md) matches what the code supports and claims "tested" only
   where a test exercises it. Run: node tests/language-matrix.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const doc=fs.readFileSync('docs/language-matrix.md','utf8').replace(/\r\n/g,'\n');
const rows=Object.fromEntries(doc.split('\n').filter(l=>/^\| [A-Z][a-z]+ \| [a-z]{2,3} \|/.test(l)).map(l=>{const c=l.split('|').map(x=>x.trim()).filter(Boolean);return [c[1],{ui:c[2],reply:c[3],dictation:c[4],natural:c[5],device:c[6]}]}));
const LANGS=['en','fr','ar','fil','hi','ur','zh','bn','ml','ru'];
assert.deepEqual(Object.keys(rows),LANGS,'all ten intended languages tracked, each on its own row');
const allowed=new Set(['live','tested','implemented','device','unavailable']);
for(const r of Object.values(rows))for(const v of Object.values(r))assert.ok(allowed.has(v),'status word '+v);
// UI: only languages the i18n layer supports, with complete translations, may be anything but unavailable.
const i18n=fs.readFileSync('workers/trial-ui/i18n.js','utf8'),tr=JSON.parse(fs.readFileSync('workers/trial-ui/translations.json','utf8'));
const uiSupported=JSON.parse(i18n.match(/const supported=(\[[^\]]*\])/)[1].replace(/'/g,'"'));
for(const l of LANGS){if(uiSupported.includes(l)){if(l!=='en')assert.ok(Object.values(tr).every(v=>typeof v[l]==='string'),l+' fully translated');assert.notEqual(rows[l].ui,'unavailable')}else assert.equal(rows[l].ui,'unavailable',l+' UI not claimed')}
// Replies: the server's list; "tested" only for languages the reply-language test uses.
const assistant=fs.readFileSync('workers/orivia-assistant.mjs','utf8');const REPLY=JSON.parse(assistant.match(/const REPLY_LANGS=(\[[^\]]*\])/)[1].replace(/'/g,'"'));
assert.deepEqual([...REPLY].sort(),[...LANGS].sort());
const replyTest=fs.readFileSync('tests/reply-language.test.mjs','utf8');
for(const l of LANGS)if(rows[l].reply==='tested')assert.ok(replyTest.includes("'"+l+"'"),l+' reply tested claim needs the test');
// Dictation and device voice: every language has a locale, and depends on the device.
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8');
const loc=chat.match(/const VOICE_LOC=\{([^}]*)\}/)[1];for(const l of LANGS){assert.ok(new RegExp('\\b'+l+":'").test(loc),l+' voice locale');assert.equal(rows[l].device,'device');assert.equal(rows[l].dictation,'device')}
assert.ok(chat.includes("This phone has no voice for this language yet."),'missing device voice is explained, not silently wrong');
// Natural voice: "tested" only where the natural-voice test uses that language.
const nv=fs.readFileSync('tests/natural-voice.test.mjs','utf8');for(const l of LANGS)if(rows[l].natural==='tested')assert.ok(nv.includes("language:'"+l+"'"),l+' natural voice tested claim');
// "live" claims are limited to what a person confirmed (named in the doc's evidence).
const live=Object.entries(rows).flatMap(([l,r])=>Object.entries(r).filter(([,v])=>v==='live').map(([k])=>l+'.'+k));
assert.deepEqual(live.sort(),['en.reply','en.ui','fr.natural','fr.reply','fr.ui'].sort());
console.log('Language matrix: 10 languages tracked separately; UI, replies, dictation and voice claims match the code and tests: pass.');
