/* Privacy and Terms drafts (30 Oct): every missing operator field is listed in each draft's table and still marked
   where it appears; nothing marked [IN CANDIDATE] contradicts the code it describes. Run: node tests/legal-drafts.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n');
const privacy=read('docs/legal/privacy-draft.md'),terms=read('docs/legal/terms-draft.md');
for(const [name,doc] of [['privacy',privacy],['terms',terms]]){
 assert.ok(doc.includes('## Missing operator details (fill in before publishing)'),name+' has the missing-fields table');
 assert.ok(/Public launch blocker/.test(doc),name+' says open operator gaps block publishing');
 const inline=(doc.match(/\*\*\[OPERATOR[^\]]*\]\*\*/g)||[]).length;assert.ok(inline>=3,name+' still marks the missing fields inline ('+inline+')');
}
for(const f of ['Legal name of the operator','Public privacy contact email','Data protection authority for complaints','Minimum age','How long partner applications are kept'])assert.ok(privacy.includes('| '+f),'privacy table lists '+f);
for(const f of ['Legal name of the operator','Public contact email','Governing law, courts and consumer protections'])assert.ok(terms.includes('| '+f),'terms table lists '+f);
// [IN CANDIDATE] claims match the code they describe.
const sponsor=read('workers/accounts/sponsorships.mjs'),spaces=read('workers/trial-ui/spaces.js'),diag=read('workers/trial-ui/response-diagnostics.js'),review=read('workers/trial-ui/image-review.js');
assert.ok(privacy.includes('Orivia doesn’t count who sees or taps them')||privacy.includes("Orivia doesn't count who sees or taps them"));
assert.ok(!/\b(views?|clicks?|impressions?|seen_by|tracked)\b/i.test(sponsor),'no view or click counting in the sponsorship code');
assert.ok(spaces.includes("a.rel='sponsored noopener noreferrer'"),'sponsor links send no referrer');
assert.ok(privacy.includes("There's no export, and nothing is sent anywhere.")&&!/fetch\(|sendBeacon|createObjectURL|download/i.test(diag),'response timings: no export or send path');
assert.ok(privacy.includes("The photo isn't sent anywhere for this check.")&&!/fetch\(|XMLHttpRequest|sendBeacon/.test(review),'photo check stays on the device');
assert.ok(privacy.includes('You don’t see who is handling it')||privacy.includes("You don't see who is handling it."));
assert.ok(/\[INCLUDE IF RELEASED: owner analytics \(Midnight, `cdab3b5`\)\]/.test(privacy)&&!fs.existsSync('workers/accounts/owner-analytics.mjs'),'Midnight owner analytics stays conditional while it is not in this branch');
console.log('Legal drafts: missing operator fields listed and still marked; [IN CANDIDATE] statements match the code; Midnight analytics conditional.');
