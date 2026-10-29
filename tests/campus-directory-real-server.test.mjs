/* The campus directory (area 23) against the real accounts server (no fixtures): staff editing (editors draft, admins
   publish, stale edits refused), what students and the public see, unknown details left unknown, and the organisation
   boundary between two fictional organisations. Run: node --experimental-sqlite tests/campus-directory-real-server.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {normaliseDetails,DIRECTORY_CATEGORIES} from '../workers/accounts/content-details.mjs';

const port=String(19400+Math.floor(Math.random()*400)),base='http://localhost:'+port;
const server=spawn(process.execPath,['--experimental-sqlite','tools/browser-checks/accounts-local-server.mjs',port],{stdio:['ignore','pipe','pipe']});
try{
 let up=false;for(let i=0;i<100&&!up;i++){try{await fetch(base+'/__dev/sql?t=organisations');up=true}catch{await new Promise(r=>setTimeout(r,100))}}
 assert.ok(up,'local accounts server started');
 const out=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'dir-')),'run.json');
 const run=spawnSync(process.execPath,['tools/browser-checks/campus-directory-local.mjs',base,out],{encoding:'utf8'});
 const r=JSON.parse(fs.readFileSync(out,'utf8'));
 assert.equal(r.passed,true,'directory: '+JSON.stringify(r.failed)+run.stderr);
 assert.equal(r.steps.length,39);
 const seen=Object.fromEntries(r.facts.studentSees.map(c=>[c.title,c]));
 assert.deepEqual(Object.keys(seen).sort(),['Main library','Print and copy centre'],'published entries only');
 assert.deepEqual(seen['Main library'].details,{category:'library',building:'Building B'},'unknown details stay unknown');
 assert.equal(seen['Print and copy centre'].details.reviewedOn,'2026-10-29');
 assert.equal(r.facts.studentSeesAfterEdit,'Sunday to Thursday, 8:00 to 20:00 in exam weeks');
 assert.equal(r.facts.draftHiddenFromStudent,true);
 assert.deepEqual(r.facts.publicSees,['Main library'],'the public page has public entries only');
 assert.equal(r.facts.studentSeesEastgate,false);
}finally{server.kill()}

// Validation: a way to reach it or a place to find it; plain text; no future "last checked" date; older contacts unchanged.
const bad=async(d,why)=>{await assert.rejects(normaliseDetails('contact',d,{today:'2026-10-29'}),/invalid_details/,why)};
await bad({category:'printing'},'a category alone');await bad({building:'A',reviewedOn:'2026-10-30'},'future date');
await bad({building:'<b>A</b>'},'markup');await bad({building:'A',category:'casino'},'unknown category');await bad({building:'A',sourceUrl:'http://x.example'},'https only');
assert.deepEqual(await normaliseDetails('contact',{phone:'+971 4 000 0000'}),{phone:'+971 4 000 0000'},'existing contacts still valid');
assert.ok(DIRECTORY_CATEGORIES.includes('accessibility'));
// Screens: unknown is said, not guessed; demo organisations get no map links.
const app=fs.readFileSync('workers/trial-ui/spaces.js','utf8'),staff=fs.readFileSync('workers/accounts/platform-ui.mjs','utf8');
for(const s of ["line('Opening',dd.openingHours,'not provided')","kind==='directory'&&det.address&&!d.organisation?.demo","Demo organisation: these places, hours and numbers are fictional."])assert.ok(app.includes(s),s);
for(const s of ["'Opening: '+(d.openingHours||'not provided')","d.address&&!org.demo","Fill in only what you know."])assert.ok(staff.includes(s),s);
console.log('Campus directory on the real local server: 39 steps passed (editing, publishing, student and public visibility, unknown details, organisation boundary); validation and demo rules pinned.');
