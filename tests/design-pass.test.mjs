/* Step 10 design pass (founder chose all six, 22 Oct; proposal artifact JVkNtsxCP6z5Y6Kx81tETn).
   Run: node tests/design-pass.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const page=fs.readFileSync('workers/trial-ui/page.html','utf8'),chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n'),nav=fs.readFileSync('workers/trial-ui/nav.js','utf8');
const tr=JSON.parse(fs.readFileSync('workers/trial-ui/translations.json','utf8')),photos=JSON.parse(fs.readFileSync('workers/trial-ui/destination-photos.json','utf8'));
// 1. Header reads left to right; the wordmark shows on phones when signed out, hidden when signed in or under 360px.
assert.ok(page.includes('header.top .menu-btn{margin-inline-start:0}')&&page.includes('header.top #orivia-nav:not(:empty){margin-inline-start:auto}'));
assert.ok(nav.includes('body[data-nav-signed-in] header.top .wordmark{position:absolute')&&nav.includes('@media (max-width:359px){header.top .wordmark{position:absolute'));
// 2. One title style on every screen.
assert.ok(page.includes('.life-heading h1,#calendar-panel .jhead h2,#settings-view .section>h2,#empty>h2{font-family:Georgia'));
// 3. Calendar: one quiet Add to calendar button, Remove behind ⋯ (still "Tap again"), no amber-filled links.
assert.ok(chat.includes("button(uiText('Add to calendar')+' ▾','cal-add'")&&chat.includes("rm.hidden=true;const more=button('⋯','cal-more'"));
assert.ok(chat.includes("rm.textContent=uiText('Tap again to remove it from Orivia. Copies you added to your phone’s calendar stay.')"),'removal still asks twice');
assert.doesNotMatch(page,/\.ev \.acts a\.dev\{background:var\(--amber\)/);
// 4. Chat: names not shown, still read by screen readers.
assert.ok(page.includes('.bubble>b{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)'));
// 5. Home: honest captions, Recent chats, no "coming later".
assert.equal(photos.uae.caption,'United Arab Emirates');assert.equal(photos.uk.caption,'United Kingdom');
assert.ok(page.includes('<h2 id="home-recent-title">Recent chats</h2>')&&!page.includes('Accounts and sync are coming later'));
// 6. Settings: one heading per group (label kept for screen readers), arrow on Notifications, clearer install button.
assert.ok(page.includes('<label for="app-language" class="visually-hidden">App language</label>')&&page.includes('id="notifications-settings">Notifications and alerts <span aria-hidden="true">›</span>'));
assert.ok(chat.includes("uiText('Add to home screen')"));
for(const k of ['Recent chats','Add to calendar','More options','Add to home screen','Saved on this device. Sign in to keep your chats and plans in your account.'])assert.ok(tr[k]?.fr&&tr[k]?.ar,k);
console.log('Design pass: header, titles, calendar, chat labels, Home wording, Settings: in place and translated.');
