/* Connected organisation dashboards (workers/accounts/platform-ui.mjs): static safety checks that run without a browser.
   The full owner → admin → invitation → request → approval → student-space flow was clicked through in Chromium against
   the real organisation handler (see docs/organisation-dashboards.md). Run: node tests/platform-ui.test.mjs */
import assert from 'node:assert/strict';
import {platformPage,mountPlatform} from '../workers/accounts/platform-ui.mjs';
const js=mountPlatform.toString();
assert.doesNotThrow(()=>new Function('('+js+')'),'served as /platform.js: must parse on its own (no outside references)');
assert.doesNotMatch(js,/\bpersona\b|switchUser|actAs|role\s*:\s*['"](?:admin|owner)/,'no role or persona switching from the browser');
assert.doesNotMatch(js,/innerHTML|outerHTML|insertAdjacentHTML|document\.write/,'organisation content is always plain text');
assert.match(js,/'X-Orivia-Account':user\.id/,'every request carries the signed-in account');
assert.match(js,/credentials:'same-origin'/);
// Only endpoints in Ina's contract (docs/organisation-backend.md)
const used=[...js.matchAll(/'(\/api\/[a-z/]+)/g)].map(m=>m[1]);
const allowed=['/api/account/session','/api/me/memberships','/api/me/orgs/','/api/admin/orgs','/api/admin/orgs/','/api/orgs/','/api/invitations/inspect','/api/invitations/join','/api/public/codes/','/api/account/feedback/queue','/api/admin/overview'];
for(const u of used)assert.ok(allowed.some(a=>u===a||u.startsWith(a)),'unexpected endpoint '+u);
assert.doesNotMatch(js,/\/api\/invitations\/[^ij']/,'invitation tokens never go in a URL');
assert.match(js,/location\.hash\.match\(\/\^#join=/,'join links read from the fragment');
// The space menu comes only from the server's memberships and platform roles
assert.match(js,/me\.platformRoles\.includes\('owner'\)/);assert.match(js,/me\.memberships\.filter\(m=>m\.status==='active'\)/);
// Unfinished features are labelled, never filled with sample numbers
for(const label of ['Not connected yet','Application records need a separate permission','Views not tracked'])assert.ok(js.includes(label),'labelled: '+label);
// Step 9 (22 Oct): built, so no longer labelled unfinished. Progress is totals only, with the minimum stated.
for(const built of ['Admin status isn’t shown here yet','Paging isn’t available yet'])assert.ok(!js.includes(built),'now built: '+built);
for(const piece of ["'/members?q='+encodeURIComponent(memberSearch)+'&offset='","'Show more'","o.adminActive?'Admin active'","pre+'/progress'","' students share their progress.","i.done+' of '+pr.students+' students"])assert.ok(js.includes(piece),'step 9: '+piece);
assert.doesNotMatch(js,/progress[^;]{0,200}(.email|.name)/,'progress never shows names or emails');
assert.doesNotMatch(js,/1,284|4,920|\$11\.40|Mariam K\.|Aisha R\./,'no demo figures or demo people in the connected version');
// Distinct pending and expired states; leaving explains downloads
assert.match(js,/Confirm role change/);assert.match(js,/Allow new join request/);assert.match(js,/At least one active admin must remain/);assert.match(js,/Download QR image/);assert.match(js,/Tap again to withdraw/);assert.match(js,/An admin can withdraw this code/);assert.match(js,/Waiting for approval/);assert.match(js,/Invitation expired/);assert.match(js,/won’t update, so it may go out of date/);
// Page: one external script from self (CSP script-src 'self'), no third-party loads
assert.equal((platformPage.match(/<script/g)||[]).length,2);assert.match(platformPage,/<script src="\/orivia-nav\.js"><\/script><script src="\/platform\.js">/,'shared navigation, then the dashboard, both same-origin');assert.match(platformPage,/<script src="\/platform\.js"><\/script>/);
assert.doesNotMatch(platformPage,/https?:\/\//,'no third-party resources');assert.match(platformPage,/integration preview/);
console.log('Organisation dashboards (connected): session-only roles, contract endpoints only, plain-text content, unfinished features labelled, no demo data: passed');
// Ina 1374ec9: staff progress totals are paused; the dashboard says so and shows no counts.
assert.ok(js.includes("pr.reason==='reporting_paused'")&&js.includes('Totals are paused while we agree how to report them'),'paused reporting is explained');
