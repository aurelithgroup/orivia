/* ORI-LIB-002 automatic private discoveries in Library (master spec 22 Oct). Browser evidence: docs/evidence/pilot-candidate-2026-10-22.json.
   Run: node tests/library-discoveries.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n'),page=fs.readFileSync('workers/trial-ui/page.html','utf8');
// The real dedupe key, run on its own: one entry per name and site, case and spacing ignored.
const discoveryKey=new Function(chat.match(/function discoveryKey\([^)]*\)\{[^\n]*\}/)[0]+';return discoveryKey')();
assert.equal(discoveryKey(' ICP  Centre ',{host:'icp.gov.ae'}),discoveryKey('icp centre',{host:'ICP.gov.ae'}));
assert.notEqual(discoveryKey('ICP Centre',{host:'icp.gov.ae'}),discoveryKey('ICP Centre',{host:'example.com'}));
const fn=chat.slice(chat.indexOf('function libraryDiscoveries(){'),chat.indexOf('function hideDiscovery('));
assert.ok(fn.includes('safeDestinations(t.meta.destinations,srcs)')&&fn.includes('safeOrgs(t.meta.organisations,srcs)'),'only vetted, sourced cards (no arbitrary pages)');
assert.ok(fn.includes('if(o.fixture)continue'),'demo fixtures are never saved');
assert.ok(fn.includes('else if(fav)seen.get(key).favourite=true'),'a favourite survives duplicate mentions');
assert.ok(!/localStorage\.setItem|fetch\(/.test(fn),'derived from the chats, not copied or sent anywhere');
assert.ok(chat.includes("rm.textContent=uiText('Tap again to remove');return}hideDiscovery(x.key)"),'removal asks twice and only hides it from Library');
assert.ok(page.includes('id="lib-tab-places" data-lib="places"')&&page.includes('id="lib-places-group"'));
console.log('Library discoveries: vetted cards only, deduplicated, favourites kept, fixtures excluded, removal hides only: pass.');
