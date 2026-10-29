/* Before-you-move document guide (week 6, 29 Oct): source-backed, no universal attestation rule, awaiting review.
   Run: node tests/docs-before-guide.test.mjs */
import assert from 'node:assert/strict';
import {guideContent,guideOffer,guideScope} from '../workers/orivia-guide-offers.mjs';
import {guideReview} from '../workers/orivia-guide-reviews.mjs';
const g=guideContent('dubai.docs.before');
assert.ok(g,'the guide opens like any other');assert.equal(g.steps.length,4);
assert.deepEqual(g.steps.map(s=>s.id),['ask','visa','uk','uae']);
// Sources: official pages only (UAE federal, UAE MoFA, GOV.UK)
const hosts=g.sources.map(s=>new URL(s.url).hostname);
assert.ok(hosts.every(h=>/(^|\.)u\.ae$|(^|\.)mofa\.gov\.ae$|(^|\.)gov\.uk$/.test(h)),hosts.join(','));
assert.ok(hosts.includes('www.gov.uk')&&hosts.includes('www.mofa.gov.ae'));
// No universal rule: attestation and recognition are conditional on being asked
const text=JSON.stringify(g.steps);
assert.match(g.steps[2].title,/if you’re asked to/);assert.match(g.steps[3].title,/if you’re asked to/);
assert.match(text,/Only apply if someone asks you for it/);assert.doesNotMatch(text,/\byou must (?:attest|legalise|have your degree)/i);
// Figures only where the official page states them (GOV.UK standard service)
assert.match(g.steps[2].cost,/£45 per document/);assert.match(g.steps[2].time,/up to 25 working days/);
assert.equal(g.steps[0].cost,'');assert.equal(g.steps[3].cost,'','no MoFA fee stated: none shown');
// Preparation ticks come from "what you'll need" (Ina's batch 1)
assert.equal(g.steps.reduce((n,s)=>n+s.bring.length,0),7);
// Scope, awaiting review, offers
assert.equal(guideScope('dubai.docs.before').level,'uk-to-uae');assert.equal(guideReview(g).status,'legacy','awaiting review: no record');
const u=t=>[{role:'user',content:t}];
assert.equal(guideOffer(u("I'm moving from Manchester to Dubai, I need to get my degree attested")).offer?.id,'dubai.docs.before');
assert.equal(guideOffer(u('I need to get my documents attested'),{profile:{city:'Dubai'}}).offer,null,'no UK origin: not offered');
console.log('Before-you-move guide: 4 steps from official sources, conditional attestation, GOV.UK figures only, awaiting review.');
