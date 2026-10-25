/* Owner recovery and last-owner protection (ORI-AUTH-010). The server refusal itself: tests/organisations.test.mjs
   (last owner → 409 transfer_platform_owner_first). Here: the person is told why, and nothing in the app can grant or
   remove the owner role. Run: node tests/owner-recovery.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const src=fs.readFileSync('workers/trial-ui/accounts.js','utf8').replace(/\r\n/g,'\n');
const block=src.slice(src.indexOf(' const FAIL_REASON='),src.indexOf('\n',src.indexOf(' function fail(e)')));
const status={textContent:''},c={$:id=>id==='account-flow-status'?status:null,t:x=>x};vm.createContext(c);vm.runInContext(block+';this.fail=fail',c);
const err=(code,s)=>Object.assign(Error(code),{status:s});
c.fail(err('transfer_platform_owner_first',409));assert.match(status.textContent,/only Orivia owner/);assert.match(status.textContent,/Nothing was deleted/);
c.fail(err('transfer_organisation_admin_first',409));assert.match(status.textContent,/only admin of an organisation/);
c.fail(err('rate_limited',429));assert.equal(status.textContent,'Please wait before trying again.');
c.fail(err('transfer_platform_owner_first',500));assert.match(status.textContent,/That didn’t work/,'only a real 409 refusal is explained');
c.fail({});assert.match(status.textContent,/That didn’t work/);
// Role changes are confined to the authenticated, fresh owner operations route. Its live permission and last-owner checks run in restored-operations.test.mjs.
const workers=[];const walk=d=>{for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=d+'/'+f.name;if(f.isDirectory()){if(!/node_modules|\.wrangler/.test(p))walk(p)}else if(/\.(m?js)$/.test(f.name))workers.push(p)}};walk('workers');
for(const f of workers.filter(f=>f!=='workers/accounts/operations.mjs')){const s=fs.readFileSync(f,'utf8');assert.ok(!/(INSERT\s+(OR\s+\w+\s+)?INTO|UPDATE|DELETE\s+FROM)\s+platform_roles/i.test(s),f+' writes platform_roles')}
const doc=fs.readFileSync('docs/owner-recovery.md','utf8');for(const x of ['transfer_platform_owner_first','Adding a second owner','loses access to their email','Keep privately'])assert.ok(doc.includes(x),x);
console.log('Owner recovery: last-owner and sole-admin refusals explained in the app; no Worker route writes the owner role; recovery steps documented: pass.');
