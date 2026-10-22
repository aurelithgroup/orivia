/* Library (Ina's approved design cdba693, 22 Oct): a view over existing records, nothing sent by looking.
   Run: node tests/library.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const page=fs.readFileSync('workers/trial-ui/page.html','utf8'),chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n'),files=fs.readFileSync('workers/trial-ui/files.js','utf8');
const lib=chat.slice(chat.indexOf('/* Library (Ina'),chat.indexOf('/* Files to Chat (step 7)'));
// Navigation: Home · Chat · Library · My Life · Calendar; My Life links to it.
const nav=page.slice(page.indexOf('<nav class="bottom"'),page.indexOf('</nav>'));
assert.deepEqual([...nav.matchAll(/data-tab="([^"]+)"/g)].map(x=>x[1]),['home','chat','library','mylife','calendar']);
assert.ok(page.includes('id="life-library-open"'));
// Files moved into the Library with the same ids (files.js and its private routes unchanged).
const library=page.slice(page.indexOf('<section id="library"'),page.indexOf('<section id="settings-view"'));
for(const id of ['files-list','files-camera','files-add','files-camera-input','files-input','lib-guides','lib-shortlists','lib-search','lib-empty'])assert.ok(library.includes('id="'+id+'"'),id);
assert.ok(!page.slice(page.indexOf('<section id="mylife"'),page.indexOf('<section id="library"')).includes('id="files-list"'),'not duplicated in My Life');
// Tabs are a real tablist with keyboard support.
assert.equal((library.match(/role="tab"/g)||[]).length,4);assert.ok(lib.includes("['ArrowLeft','ArrowRight','Home','End']"));
// A view over existing records: saved guides from readJourneys (same cards, same progress); shortlists from the chats.
assert.ok(lib.includes('const d=readJourneys()')&&lib.includes("journeyCard({id,title:v.title,steps:v.steps},'mine')"));
assert.ok(lib.includes('for(const chat of store.chats)for(const t of chat.turns||[])')&&lib.includes('safeOrgs(t.meta.organisations,safeSources(t.meta.sources))'));
assert.doesNotMatch(lib,/setItem|persist\(|save\(|delete |fetch\(/,'the Library never writes, deletes or sends');
// Compare and Use in Chat only prepare; the person sends.
assert.ok(lib.includes("$('msg').value=uiText('Please compare my shortlist:')")&&!lib.includes('requestSubmit'));
assert.ok(chat.includes("if(blob&&g===attachGeneration){tab('chat');setPendingAttachment(blob,f.name,f.id)}"),'a saved file becomes a pending attachment (reading notice still applies)');
assert.ok(files.includes("window.OriviaFiles?.useInChat&&b('Use in Chat'"));
// Every new label is translated.
const tr=JSON.parse(fs.readFileSync('workers/trial-ui/translations.json','utf8'));
for(const k of ['Library','Search your Library','Guides & journeys','Shortlists','Compare in Chat','Use in Chat','Continue where you left off','Clear search'])assert.ok(tr[k]?.fr&&tr[k]?.ar,k);
console.log('Library: five tabs, files moved with the same ids, a view over saved guides and chat shortlists, nothing written or sent.');
// Where Files is switched off (production until it's released), the Library has no Files tab or section.
assert.ok(chat.includes("function showLibraryFiles(){const tab=$('lib-tab-files'),group=$('files-title')?.closest('section');if(tab)tab.hidden=!filesServer;if(group)group.hidden=!filesServer;")&&chat.includes("filesServer=d?.files===true;"));
assert.ok(fs.readFileSync('workers/orivia-research-pilot.mjs','utf8').includes('body.files=filesAvailable(env);'),'the server says whether Files is on');
// 22 Oct bug: two functions named renderLibrary (the Library and the guide catalogue); the later one silently replaced
// the Library's, so live it showed empty sections. No top-level function may be declared twice.
{const names=[...chat.matchAll(/^(?:async )?function ([A-Za-z0-9_$]+)/gm)].map(m=>m[1]),dupes=names.filter((n,i)=>names.indexOf(n)!==i);
 assert.deepEqual(dupes,[],'duplicate function names in chat.js: '+dupes.join(', '));
 assert.ok(chat.includes("if(which==='library')try{renderLibraryView()}catch(_){}"));}
// 22 Oct bug: New chat passed its click event as a university guide ("Using your university’s guide" in a personal chat).
assert.ok(chat.includes("$('new-chat').onclick=()=>newChat(null);")&&!/\$\('new-chat'\)\.onclick=newChat;/.test(chat));
