/* The fictional Northbay campus directory used by the demo: every entry passes the server's own validation, says it is
   fictional, uses only 000 placeholder numbers and northbay.example addresses, and leaves some details out on purpose so
   "not provided" shows. Run: node tests/northbay-demo-directory.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {NORTHBAY_DIRECTORY,FICTIONAL_NOTE} from '../tools/demo/northbay-directory.mjs';
import {normaliseDetails} from '../workers/accounts/content-details.mjs';
assert.ok(NORTHBAY_DIRECTORY.length>=8);
for(const e of NORTHBAY_DIRECTORY){
 assert.ok(e.body.startsWith(FICTIONAL_NOTE),e.title+' says it is fictional');
 assert.deepEqual(await normaliseDetails('contact',e.details,{today:'2026-10-29'}),e.details,e.title+' passes validation unchanged');
 if(e.details.phone)assert.match(e.details.phone,/^\+971 4 000 00\d\d$/,e.title+' uses a placeholder number');
 for(const k of ['email','sourceUrl'])if(e.details[k])assert.match(e.details[k],/northbay\.example/,e.title+' '+k);
}
assert.ok(NORTHBAY_DIRECTORY.some(e=>!e.details.openingHours)&&NORTHBAY_DIRECTORY.some(e=>!e.details.accessibility),'some details are deliberately unknown');
assert.ok(!NORTHBAY_DIRECTORY.some(e=>/dubai\s+(?:police|municipality|health authority)|rta|du\b|etisalat/i.test(JSON.stringify(e))),'no real organisations named');
const seeder=fs.readFileSync('tools/demo/seed-northbay-directory.mjs','utf8');
assert.ok(seeder.includes("if(!summary.organisation?.demo)"),'the seeder refuses organisations that are not demo');
console.log('Northbay demo directory: '+NORTHBAY_DIRECTORY.length+' fictional entries, labelled, validated, placeholder numbers only, demo organisations only.');
