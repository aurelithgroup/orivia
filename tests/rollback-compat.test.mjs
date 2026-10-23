/* Client data survives load and save in the current app (Ina f99c2b3): conversation versions and Library removals are kept
   by the shipped normaliser and loader. docs/backups.md names the rollback targets that also keep them.
   Run: node tests/rollback-compat.test.mjs */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
const out=JSON.parse(execFileSync(process.execPath,['tools/rollback-compat.mjs','workers/trial-ui/chat.js','workers/trial-ui/chat-versions.js'],{encoding:'utf8'}));
assert.equal(out.versions,true,'conversation versions survive load/save');assert.equal(out.libraryHidden,true,'Library removals survive load/save');
const doc=fs.readFileSync('docs/backups.md','utf8');
assert.ok(doc.includes('roll back only to `5bdfcf8` or later')&&doc.includes('Older app code does **not** keep them'),'rollback rule documented');
assert.ok(doc.includes("Expiry doesn't delete it")&&!/expir\w* (deletes|purges)/i.test(doc),'no promise that expiry deletes snapshots');
console.log('Rollback compatibility: current app keeps versions and Library removals; rollback rule and retention stated: pass.');
