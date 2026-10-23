/* Hostile addresses never reach the network (ORI-SEC-004): the server-side page reader refuses private, local, numeric,
   credentialed, non-https and odd-port addresses, and won't follow a redirect anywhere else. The fetcher records every
   address it is asked for, so "refused" means nothing was requested. Run: node tests/hostile-fetch.test.mjs */
import assert from 'node:assert/strict';
import {makeTools} from '../workers/orivia-research-loop.mjs';
const asked=[];const redirectTo=new Map([['https://shop.example/go','https://169.254.169.254/latest/meta-data/'],['https://shop.example/hop','http://shop.example/plain'],['https://shop.example/side','https://evil.example/']]);
const fetcher=async(url)=>{asked.push(url);const to=redirectTo.get(url);if(to)return new Response(null,{status:302,headers:{location:to}});return new Response('<html><title>ok</title>fine</html>',{headers:{'content-type':'text/html'}})};
const tools=makeTools({env:{},fetcher,reserve:async()=>true});
const hostile=['https://127.0.0.1/','https://0x7f.1/','https://2130706433/','https://[::1]/','https://localhost/','https://admin.localhost/','https://printer.local/','https://db.internal/','https://169.254.169.254/latest/meta-data/',
 'https://10.0.0.1/','https://192.168.1.1/','https://shop.example:8443/','https://user:pass@shop.example/','http://shop.example/','javascript:alert(1)','data:text/html,<script>alert(1)</script>','file:///etc/passwd','ftp://shop.example/','https://intranet/','not a url'];
for(const url of hostile){const r=await tools.fetchPage(url,{});assert.equal(r.ok,false,url);assert.ok(['not-allowed','bad-url'].includes(r.reason),url+' → '+r.reason)}
assert.deepEqual(asked,[],'no hostile address was requested');
// Redirects: only to https on the same host; a public page can't bounce the reader to the metadata service or elsewhere.
for(const [from,to] of redirectTo){const r=await tools.fetchPage(from,{});assert.equal(r.ok,false,from+' → '+to);assert.equal(r.reason,'redirected-elsewhere')}
assert.deepEqual(asked,[...redirectTo.keys()],'only the original public pages were requested, never the redirect targets');
// A normal public page still works.
assert.equal((await tools.fetchPage('https://shop.example/about',{})).ok,true);
console.log(`Hostile fetch: ${hostile.length} private, numeric, local, credentialed, non-https and odd-port addresses refused without a request; off-host and downgrade redirects refused: pass.`);
