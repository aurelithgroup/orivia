/* ORI-METRIC-001: every metric the consoles show is defined in docs/metrics.md; CSV cells are formula-safe (METRIC-006).
   Run: node tests/metric-definitions.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {OVERVIEW_DEFINITIONS,csvCell,organisationsCsv} from '../workers/accounts/owner-overview.mjs';
const doc=fs.readFileSync('docs/metrics.md','utf8'),org=fs.readFileSync('workers/accounts/organisations.mjs','utf8');
const documented=id=>doc.includes('| `'+id+'` |')||doc.includes('`'+id+'` /')||doc.includes('/ `'+id+'`');
for(const k of Object.keys(OVERVIEW_DEFINITIONS))assert.ok(documented(k),'overview metric documented: '+k);
// University summary activity keys, read from the server code.
const activity=org.match(/const activity=\{([^]*?)\};/)[1];
for(const k of [...activity.matchAll(/(\w+):/g)].map(m=>m[1]).filter(k=>!['n'].includes(k)))assert.ok(documented(k==='published'?'publishedGuidesAndDates':k),'summary metric documented: '+k);
for(const k of ['members','waitingForApproval','staff','tasks.*','progress','views','ratingsUp','ratingsDown','ratingReasons'])assert.ok(documented(k),k);
// Unavailable/paused metrics are named as such, never as zero.
assert.ok(/\*\*Paused\*\*: no counts/.test(doc)&&/\*\*Unavailable\*\*: views aren't tracked/.test(doc));
// CSV safety.
for(const [v,want] of [['=1+1',`"'=1+1"`],['+44 20',`"'+44 20"`],['-5',`"'-5"`],['@SUM(A1)',`"'@SUM(A1)"`],['\tx',`"'\tx"`],['plain "q"','"plain ""q"""'],[null,'""'],[42,'"42"']])assert.equal(csvCell(v),want);
const csv=organisationsCsv([{name:'=cmd|calc',slug:'s',city:'c',demo:true,status:'active',totals:{students:1,staff:2,requests:0,published:3,drafts:4},adminActive:false,adminInvitePending:true}]);
assert.ok(csv.split('\r\n')[1].startsWith(`"'=cmd|calc","s","c","yes","active","1","2","0","3","4","invited"`));
console.log('Metric definitions: every console metric documented, paused/unavailable named, CSV formula-safe: pass.');
