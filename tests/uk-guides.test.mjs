/* UK guides in the catalogue and planning (week 6, 29 Oct): where each applies (across the UK, Scotland, Edinburgh),
   offers only where it applies, and honest labels. Run: node tests/uk-guides.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {guideCatalogue,guideContent,guideOffer,guideScope} from '../workers/orivia-guide-offers.mjs';
import {contentVersion,validateReview,guideReview} from '../workers/orivia-guide-reviews.mjs';

// Scope from each guide's sources
const want={'edinburgh.evisa':'uk','edinburgh.work':'uk','edinburgh.sim':'uk','edinburgh.bank':'uk','edinburgh.gp':'scotland','edinburgh.rent':'scotland','edinburgh.u22':'scotland',
 'edinburgh.airport':'edinburgh','edinburgh.bus':'edinburgh','edinburgh.counciltax':'edinburgh','edinburgh.community':'edinburgh','edinburgh.school':'edinburgh'};
for(const [id,level] of Object.entries(want))assert.equal(guideScope(id).level,level,id);
assert.equal(guideScope('dubai.eid.student').label,'Dubai only');assert.equal(guideScope('dubai.docs.before').label,'Moving from the UK to the UAE');assert.equal(guideScope('nowhere.x'),null,'unknown ids have no scope');

// Catalogue: both places, every guide scoped; the Dubai list is unchanged
const all=guideCatalogue('all'),dubai=guideCatalogue('dubai');
assert.equal(dubai.length,22);assert.equal(all.length,34);assert.ok(all.every(g=>g.scope&&g.scope.label));
assert.equal(all.filter(g=>g.scope.country==='uk').length,12);

// Planning: UK guide content opens like any other, with its scope, and can take a review record later (none exists)
const gp=guideContent('edinburgh.gp');assert.ok(gp.steps.length>0);assert.equal(gp.scope.level,'scotland');assert.equal(guideReview(gp).status,'legacy','awaiting review: no record');
const rec={status:'reviewed',version:contentVersion(gp),reviewer:'Reviewer',jurisdiction:'uk',checkedAt:'2026-10-29',reviewDue:'2027-01-29',sources:gp.sources.map(s=>({url:s.url,checkedAt:'2026-10-29'}))};
assert.equal(validateReview(gp,rec),true,'a UK guide can be reviewed with the existing tool');

// Offers: only where the guide applies
const u=t=>[{role:'user',content:t}],offer=(t,city)=>guideOffer(u(t),{profile:city?{city}:{}});
assert.equal(offer('I just arrived in Edinburgh, I need to set up my eVisa').offer?.id,'edinburgh.evisa');
assert.equal(offer('I need to set up my eVisa','Manchester').offer?.id,'edinburgh.evisa','UK-wide: anywhere in the UK');
assert.equal(offer('I need to set up my eVisa','Dubai').offer,null,'not outside the UK');
assert.equal(offer('I need to register with a GP','Edinburgh').offer?.id,'edinburgh.gp');
assert.equal(offer('I live in Glasgow, I need to register with a doctor').offer?.id,'edinburgh.gp','anywhere in Scotland');
const eng=offer('I need to register with a GP','Manchester');assert.equal(eng.offer,null);assert.match(eng.context,/covers Scotland only/);
assert.equal(offer('I need to apply for the student council tax discount','Edinburgh').offer?.id,'edinburgh.counciltax');
const gla=offer('I need to apply for the student council tax discount','Glasgow');assert.equal(gla.offer,null,'Edinburgh council only');assert.match(gla.context,/covers Edinburgh only/);
assert.equal(offer('how do I get a nol card, I will take the metro','Dubai').offer?.id,'dubai.nol','Dubai offers unchanged');

// The app: library cards say where a guide applies and when its sources were checked, never "Reviewed"
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8');
assert.doesNotMatch(chat,/'Dubai · Reviewed '|' · Reviewed '|'Guide reviewed '/,'no "Reviewed" label without a review record');
assert.match(chat,/function sourceCheckText\(g\)/);assert.match(chat,/'Source check not recorded'/,'no recorded check: no date shown');
// A date only from a recorded check of that guide (founder, 29 Oct)
{const {SOURCE_CHECKS}=await import('../workers/guide-source-checks.mjs');const lib=guideCatalogue('all');
 for(const g of lib)assert.equal(JSON.stringify(g.sourceCheck),JSON.stringify(SOURCE_CHECKS[g.id]||null),g.id);
 assert.equal(guideCatalogue('all').find(g=>g.id==='dubai.airport').sourceCheck,null,'an unchecked guide has no check date');}assert.match(chat,/function homeFirst\(g\)/);
const trial=fs.readFileSync('workers/orivia-ai-private-trial.mjs','utf8');assert.match(trial,/guides:guideCatalogue\('all'\)/);
const tr=JSON.parse(fs.readFileSync('workers/trial-ui/translations.json','utf8'));for(const k of ['Applies across the UK','Scotland only','Edinburgh only','Dubai only','Sources checked'])assert.ok(tr[k]?.fr&&tr[k]?.ar,k);
console.log('UK guides: 12 in the catalogue with UK / Scotland / Edinburgh scope, plannable, offered only where they apply; Dubai unchanged.');
