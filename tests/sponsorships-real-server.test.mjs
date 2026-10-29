/* Sponsored placements (area 16) against the real accounts server (no fixtures): owner-only campaigns, disclosure
   rules, review before approval and again after any edit, dates, withdrawal, what students see, and the organisation
   boundary. Run: node --experimental-sqlite tests/sponsorships-real-server.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';

const port=String(20700+Math.floor(Math.random()*400)),base='http://localhost:'+port;
const server=spawn(process.execPath,['--experimental-sqlite','tools/browser-checks/accounts-local-server.mjs',port],{stdio:['ignore','pipe','pipe']});
try{
 let up=false;for(let i=0;i<100&&!up;i++){try{await fetch(base+'/__dev/sql?t=organisations');up=true}catch{await new Promise(r=>setTimeout(r,100))}}
 assert.ok(up,'local accounts server started');
 const out=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'sp-')),'run.json');
 const run=spawnSync(process.execPath,['tools/browser-checks/sponsorships-local.mjs',base,out],{encoding:'utf8'});
 const r=JSON.parse(fs.readFileSync(out,'utf8')),f=r.facts;
 assert.equal(r.passed,true,'sponsorships: '+JSON.stringify(r.failed)+run.stderr);
 assert.equal(r.steps.length,44);
 assert.equal(f.draftSeen,0,'drafts are never shown');
 assert.deepEqual(f.liveSeen.map(p=>p.partnerName),['Harbour Books']);
 assert.deepEqual(f.studentFields,['destination','disclosure','id','kind','label','partnerName'],'students get no review notes, status or reviewer');
 assert.equal(f.contentHasPlacement,false,'placements stay out of the university’s own content');
 assert.deepEqual(f.afterOther,['Harbour Books'],'another organisation’s campaign never reaches this one');
 assert.deepEqual(f.beforeStart.map(l=>l.includes('winter')),[false],'not before its start date');
 assert.equal(f.duringReview,0,'an edited campaign is hidden until re-approved');
 assert.equal(f.afterWithdraw,0);
 assert.equal(f.paidRankingEnabled,false);assert.equal(f.deliveryEnabled,false);
 assert.equal(f.audit.filter(a=>a==='sponsor.campaign.approved').length,4,'every approval is recorded');
}finally{server.kill()}

// The assistant's organisation context never reads campaigns, and placements are labelled where students see them.
const handler=fs.readFileSync('workers/accounts/handler.mjs','utf8'),ctx=handler.slice(handler.indexOf('export async function readOrgContext'),handler.indexOf('\n',handler.indexOf('export async function readOrgContext')+200));
assert.ok(!/sponsor/i.test(ctx),'no sponsorships in the assistant’s organisation context');
const app=fs.readFileSync('workers/trial-ui/spaces.js','utf8'),ui=fs.readFileSync('workers/accounts/restored-ui.mjs','utf8');
for(const s of ["node('h3','','Sponsored')","a.rel='sponsored noopener noreferrer'","Demo organisation: this sponsor and offer are fictional."])assert.ok(app.includes(s),s);
for(const s of ["h('span',{class:'chip c-wait'},'Sponsored')","rel:'sponsored noopener noreferrer'","'Paid for by '+p.partnerName"])assert.ok(ui.includes(s),s);
assert.ok(!fs.readFileSync('workers/accounts/sponsorships.mjs','utf8').includes('founder_workflows'),'founder AI workflows (area 12) not taken');
console.log('Sponsored placements on the real local server: 44 steps passed (owner-only, disclosure, review and re-review, dates, withdrawal, student view, organisation boundary); labels pinned.');
