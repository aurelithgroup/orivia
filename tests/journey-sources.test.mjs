import assert from 'node:assert/strict';
import {findUniversity,findDeparture,journeyResources} from '../workers/orivia-journey-sources.mjs';
const turns=[
 {role:'user',content:'I am starting University of Wollongong Dubai next month'},
 {role:'assistant',content:'Where are you travelling from?'},
 {role:'user',content:'I will be coming from Sharjah, please compare driving and transit.'}
];
assert.equal(findUniversity(turns).id,'uowd');
assert.equal(findDeparture(turns),'Sharjah');
const result=journeyResources(turns);
assert.equal(result.sources.length,2);
assert.equal(result.actions.length,3);
assert.equal(result.sources[0].url,'https://www.uowdubai.ac.ae/contact-us');
assert.match(result.context,/No route, fare, trip duration, or availability was retrieved/);
const transit=new URL(result.actions[0].url);
const drive=new URL(result.actions[1].url);
assert.equal(transit.searchParams.get('origin'),'Sharjah');
assert.match(transit.searchParams.get('destination'),/Dubai Knowledge Park/);
assert.equal(transit.searchParams.get('travelmode'),'transit');
assert.equal(drive.searchParams.get('travelmode'),'driving');
assert.equal(journeyResources([{role:'user',content:'I am going to university next month'}]).actions.length,0);
assert.equal(journeyResources([{role:'assistant',content:'University of Wollongong Dubai'}]).actions.length,0);
console.log('Verified journey resource / link construction checks passed');
