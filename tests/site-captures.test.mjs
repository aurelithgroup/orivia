/* Website reader against RAW captured pages (tools/capture-site.mjs). Each capture is checked against
   tests/fixtures/sites/captured/expectations.json. With no captures yet, this says so and passes.
   Run: node tests/site-captures.test.mjs */
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
import {readdirSync,readFileSync} from 'node:fs';
import {readSiteFacts,yearEvidence,pageSections} from '../workers/orivia-school-sites.mjs';
const dir=new URL('./fixtures/sites/captured/',import.meta.url);
const exp=JSON.parse(readFileSync(new URL('expectations.json',dir),'utf8'));
const files=readdirSync(dir).filter(f=>/\.html(?:\.gz)?$/.test(f));
let checked=0;
for(const f of files){
 const bytes=readFileSync(new URL(f,dir));const raw=(f.endsWith('.gz')?gunzipSync(bytes):bytes).toString('utf8');const src=(raw.match(/RAW CAPTURE of (\S+)/)||[])[1]||'https://capture.invalid/';
 const host=new URL(src).hostname.replace(/^www\./,'');const facts=readSiteFacts([{url:src,raw}],host);
 assert.ok(pageSections(raw).length>0,f+': page splits into sections');
 const e=exp[f];if(!e){console.log('note: '+f+' has no expectations yet; facts found:',JSON.stringify(facts.map(x=>[x.key,x.value,x.source.section])));continue}
 const curr=[...new Set(facts.filter(x=>x.key==='curriculum').map(x=>x.value))];
 for(const c of e.curriculum||[])assert.ok(curr.includes(c),f+': expected curriculum '+c+', got '+curr);
 for(const c of e.notCurriculum||[])assert.ok(!curr.includes(c),f+': '+c+' must not be read as this organisation’s curriculum');
 if(e.year)assert.equal(yearEvidence(facts,e.year).listed.length>0,!!e.yearListed,f+': Year '+e.year+' evidence');
 checked++;
}
console.log('Site captures: '+files.length+' raw capture(s), '+checked+' checked against expectations'+(files.length?'':' (none captured yet: run tools/capture-site.mjs)')+': passed');
