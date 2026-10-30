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
assert.ok(privacy.includes("Orivia doesn't count who sees or taps them")&&privacy.includes('it still receives the ordinary information any website gets from your browser'),'sponsor wording: no tracking by Orivia, but ordinary connection information still reaches the site');
assert.ok(!/tells? (the )?sponsors? nothing/i.test(privacy),'no claim that sponsors learn nothing');
assert.ok(!/\b(views?|clicks?|impressions?|seen_by|tracked)\b/i.test(sponsor),'no view or click counting in the sponsorship code');
assert.ok(spaces.includes("a.rel='sponsored noopener noreferrer'"),'sponsor links pass no Orivia referrer');
// Response timings: the candidate has a user-initiated download to the device (chat.js), and nothing that uploads them.
const chat=read('workers/trial-ui/chat.js'),render=chat.slice(chat.indexOf('function renderResponseDiagnostics'),chat.indexOf('\n',chat.indexOf('function renderResponseDiagnostics')));
assert.ok(render.includes("button('Download timings'")&&render.includes('URL.createObjectURL(new Blob'),'the download exists and is described');
assert.ok(privacy.includes('download them as a file to your device. Orivia doesn\'t upload them')&&!privacy.includes("There's no export"),'the policy says so');
assert.ok(!/fetch\(|sendBeacon|XMLHttpRequest/.test(render+diag),'nothing uploads the timings');
const sampleAt=diag.indexOf('sample={at:');assert.ok(sampleAt>0,'sample shape found');
assert.ok(!/message|content|name|email|account/i.test(diag.slice(sampleAt,diag.indexOf('}',sampleAt))),'samples carry no messages or identity');
assert.ok(privacy.includes("The photo isn't sent anywhere for this check.")&&!/fetch\(|XMLHttpRequest|sendBeacon/.test(review),'photo check stays on the device');
assert.ok(privacy.includes('You don’t see who is handling it')||privacy.includes("You don't see who is handling it."));
assert.ok(/\[INCLUDE IF RELEASED: owner analytics \(Midnight, `cdab3b5`\)\]/.test(privacy)&&!fs.existsSync('workers/accounts/owner-analytics.mjs'),'Midnight owner analytics stays conditional while it is not in this branch');
console.log('Legal drafts: missing operator fields listed and still marked; [IN CANDIDATE] statements match the code; Midnight analytics conditional.');
