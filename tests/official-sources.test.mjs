import assert from 'node:assert/strict';
import {inspectSource,validateEvidence} from '../workers/orivia-source-policy.mjs';
import {journeyResources,findUniversity,findDeparture} from '../workers/orivia-journey-sources.mjs';
assert.equal(inspectSource('https://www.hw.ac.uk/dubai/visit/maps-and-directions').accepted,true);
assert.equal(inspectSource('https://www.rta.ae/wps/portal/rta/ae/home','government-requirement').accepted,true);
assert.equal(inspectSource('https://www.hw.ac.uk/dubai/visit/contact-us','government-requirement').accepted,false);
for(const u of ['https://reddit.com/r/dubai','https://instagram.com/rta','http://www.hw.ac.uk',
 'https://evil.hw.ac.uk','https://hw.ac.uk.evil.net','https://www.google.com/maps/dir/',
 'https://randomtravelblog.net'])assert.equal(inspectSource(u).accepted,false,u);
assert.equal(validateEvidence({title:'Test',url:'https://www.hw.ac.uk',description:'Campus',verifiedOn:'2026-10-16'})?.category,'institution');
assert.equal(validateEvidence({title:'Claim',url:'https://www.hw.ac.uk',description:'Campus',verifiedOn:''}),null);
const dialogue=[{role:'user',content:'I am starting university'},{role:'assistant',content:'Which?'},{role:'user',content:'sharjah to heriot watt dubai'}];
assert.equal(findUniversity(dialogue).id,'hwu');
assert.match(findDeparture(dialogue),/Sharjah/);
const info=journeyResources(dialogue);
assert.equal(info.contactEmail,'dubaienquiries@hw.ac.uk');
assert.equal(info.contactPhone,'+971 4 571 7000');
assert.ok(info.sources.every(x=>validateEvidence(x)));
assert.ok(info.actions.some(x=>x.url.includes('travelmode=transit')));
assert.ok(info.actions.some(x=>x.url.includes('travelmode=driving')));
assert.ok(info.actions.some(x=>x.url.includes('hw.ac.uk')));
console.log('Official source trust policy, Heriot-Watt contacts, and travel handoff: passed');
