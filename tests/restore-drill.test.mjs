/* ORI-SEC-006: the restore drill on a synthetic dump. A clean dump restores with matching counts and idempotent
   migrations; a dump with a broken foreign key, or counts that don't match the live ones, fails.
   Run: node --experimental-sqlite tests/restore-drill.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'drill-'));
const schema=['schema','organisations'].map(n=>fs.readFileSync('workers/accounts/'+n+'.sql','utf8')).join('\n');
const now=new Date().toISOString();
const rows=`INSERT INTO user(id,name,email,emailVerified,createdAt,updatedAt) VALUES ('u1','Test','test@example.test',1,'${now}','${now}');
INSERT INTO organisations(id,slug,name,city,demo,created_at) VALUES ('o1','demo','Demo College','Leeds',1,0);
INSERT INTO organisation_memberships(org_id,user_id,role,status,request_id,created_at,updated_at) VALUES ('o1','u1','student','active','r1',0,0);`;
const run=(dump,counts)=>{fs.writeFileSync(path.join(dir,'d.sql'),dump);fs.writeFileSync(path.join(dir,'c.json'),JSON.stringify(counts));
 try{return {code:0,out:JSON.parse(execFileSync(process.execPath,['--experimental-sqlite','--no-warnings','tools/restore-drill.mjs',path.join(dir,'d.sql'),path.join(dir,'c.json')],{encoding:'utf8'}))}}
 catch(e){return {code:e.status,out:JSON.parse(e.stdout)}}};
const base=()=>{const r=run(schema+rows,{});return Object.fromEntries(Object.keys(r.out.counts).map(k=>[k,r.out.counts[k]]))};
const live=base();
let r=run(schema+rows,live);assert.equal(r.code,0);assert.equal(r.out.integrity,'ok');assert.equal(r.out.foreignKeyViolations,0);
assert.deepEqual(r.out.migrationsChangedRows,[]);assert.deepEqual(r.out.mismatches,[]);assert.equal(r.out.counts.organisation_memberships,1);
assert.ok(!JSON.stringify(r.out).includes('test@example.test'),'the report holds counts, never row contents');
r=run(schema+rows,{...live,user:2});assert.equal(r.code,1);assert.deepEqual(r.out.mismatches,['user'],'a count mismatch fails the drill');
r=run(schema+rows+"\nINSERT INTO organisation_memberships(org_id,user_id,role,status,request_id,created_at,updated_at) VALUES ('o-missing','u1','student','active','r2',0,0);",{});
assert.equal(r.code,1);assert.equal(r.out.foreignKeyViolations,1,'a broken reference fails the drill');
fs.rmSync(dir,{recursive:true,force:true});
console.log('Restore drill: clean dump restores with matching counts and idempotent migrations; mismatches and broken references fail; counts only: pass.');
