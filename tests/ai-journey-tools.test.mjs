import assert from 'node:assert/strict';
import {normaliseJourney,find_journeys,get_checkups,place_user,get_step} from '../workers/orivia-journey-tools.mjs';
const journey={id:'student-visa',title:'Student residence visa and Emirates ID',description:'UAE university onboarding',checkedAt:'2026-10-16',
 steps:[{id:'ask-university',title:'Contact university',source:{url:'https://u.ae/',checkedAt:'2026-10-16'}}],
 checkups:[{id:'permit',question:'Has the university confirmed the application?',options:[{value:'yes',label:'Yes',stepId:'ask-university'},{value:'unsure',label:'Not sure'}]}]};
assert.equal(normaliseJourney(journey)?.steps.length,1);
assert.equal(find_journeys('student university',[journey])[0]?.journeyId,'student-visa');
assert.equal(get_checkups(journey).questions.length,1);
assert.deepEqual(place_user(journey,{permit:'yes'}),{status:'candidate',stepId:'ask-university',requiresConfirmation:true});
assert.deepEqual(place_user(journey,{permit:'unsure'}),{status:'not_sure',stepId:null});
assert.deepEqual(place_user(journey,{}),{status:'not_sure',stepId:null});
assert.equal(get_step(journey,'ask-university').source.url,'https://u.ae/');
assert.equal(get_step(journey,'unknown').ok,false);
assert.equal(normaliseJourney({...journey,steps:[{...journey.steps[0],source:{url:'http://evil.example',checkedAt:'2026-10-16'}}]}),null);
console.log('Journey tools: validation, matching, check-ups, uncertain placement and source-preserving retrieval passed');
