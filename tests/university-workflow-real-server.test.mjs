/* The Northbay university workflow against the real accounts server (no fixtures): partner setup and approval, staff
   publishing and invitations, a student's join request and approval, support with forwarding refused, and the limits that
   must hold (records locked, member list hidden, outsiders refused, progress totals paused). Also pins the plain labels
   found missing on the real screens on 29 Oct.
   Run: node --experimental-sqlite tests/university-workflow-real-server.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';

const port=String(18794+Math.floor(Math.random()*500)),base='http://localhost:'+port;
const server=spawn(process.execPath,['--experimental-sqlite','tools/browser-checks/accounts-local-server.mjs',port],{stdio:['ignore','pipe','pipe']});
try{
 let up=false;for(let i=0;i<100&&!up;i++){try{await fetch(base+'/__dev/sql?t=organisations');up=true}catch{await new Promise(r=>setTimeout(r,100))}}
 assert.ok(up,'local accounts server started');
 const out=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'uni-')),'run.json');
 const run=spawnSync(process.execPath,['tools/browser-checks/university-workflow-local.mjs',base,out],{encoding:'utf8'});
 const result=JSON.parse(fs.readFileSync(out,'utf8'));
 assert.equal(result.passed,true,'workflow: '+JSON.stringify(result.failed)+run.stderr);
 assert.equal(result.steps.length,26);
 assert.deepEqual(result.facts.memberships,[{role:'admin',status:'active'},{role:'student',status:'active'}]);
 assert.deepEqual(result.facts.studentSees.guides,['Collect your student ID card']);
 assert.equal(result.facts.studentSees.personalDataShared,false);
 assert.equal(result.facts.ticket[0].status,'resolved');
 assert.equal(result.facts.ticket[0].allowEscalation,0,'not forwardable without the student’s consent');
 assert.deepEqual(result.facts.progress,{shown:false,reason:'reporting_paused'});
}finally{server.kill()}

// Plain labels on the screens (values and stored keys unchanged).
const platform=fs.readFileSync('workers/accounts/platform-ui.mjs','utf8'),restored=fs.readFileSync('workers/accounts/restored-ui.mjs','utf8');
for(const a of ['content.drafted','content.updated','invitation.created','public_code.created','arrival.updated','organisation.created'])assert.match(platform,new RegExp("'"+a.replace('.','\\.')+"':'[A-Z]"),'activity label for '+a);
assert.match(platform,/'membership\.active':'Membership activated'/);
assert.match(restored,/contactEmail:'Contact email'/,'partner review shows field names, not keys');
assert.match(restored,/\['in_progress','In progress'\]/,'support status names');
assert.match(restored,/sponsor:'Sponsorships · disclosed'/,'workbench area names');
assert.match(restored,/fundedSeats:'Funded places'/,'workbench field names');
console.log('University workflow on the real local server: 26 steps passed (partner setup, publishing, join and approval, support, limits); plain labels pinned.');
