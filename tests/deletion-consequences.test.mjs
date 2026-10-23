/* ORI-UX-008: each deletion says its own consequences (audit of items marked existing, 23 Oct).
   Run: node tests/deletion-consequences.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8'),files=fs.readFileSync('workers/trial-ui/files.js','utf8'),acc=fs.readFileSync('workers/trial-ui/accounts.js','utf8'),tr=JSON.parse(fs.readFileSync('workers/trial-ui/translations.json','utf8'));
const msgs={chat:'Tap again to delete this chat for good. Reminders you saved and files in your Library stay.',file:'Tap again to delete this file from your Library. Chats that already read it keep what Orivia read.',reminder:'Tap again to remove it from Orivia. Copies you added to your phone’s calendar stay.'};
assert.equal(chat.split("uiText('"+msgs.chat+"')").length-1,2,'both chat delete controls');
assert.ok(chat.includes("rm.textContent=uiText('"+msgs.reminder+"');return}removeEvent(e.id)"));
assert.ok(files.includes("del.textContent=t('"+msgs.file+"')"));
assert.ok(acc.includes('This deletes your account, your saved personal chats and plans'),'account deletion explains itself');
for(const m of Object.values(msgs))assert.ok(tr[m]?.fr&&tr[m]?.ar,'translated: '+m.slice(0,30));
console.log('Deletion consequences: chat, file, reminder and account deletion each say what changes and what stays: pass.');
