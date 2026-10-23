/* Consent belongs to the person (ORI-LEGAL-003): the OpenAI provider consent, the document-reading acknowledgement and
   the university AI notice are kept per account, so another account on the same device is asked again. Runs the shipped
   key scoping from accounts.js and the consent readers from chat.js. Run: node tests/consent-scope.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const acc=fs.readFileSync('workers/trial-ui/accounts.js','utf8').replace(/\r\n/g,'\n');
const lines=acc.split('\n'),pick=re=>lines.find(l=>re.test(l));
const code=[pick(/^ const keys=\{profile:/),pick(/^ const privateKeys=new Set/),pick(/^ const prefix=id=>/),pick(/^ const key=k=>scope/),pick(/^ const storage=\{getItem:/)].join('\n');
const disk=new Map(),native={getItem:k=>disk.has(k)?disk.get(k):null,setItem:(k,v)=>disk.set(k,String(v)),removeItem:k=>disk.delete(k)};
const c={native,changed(){},scope:null};vm.createContext(c);vm.runInContext(code.replace(/^ const /gm,'var ')+';this.storage=storage',c);
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8');
const pilotKey=chat.match(/const pilotKey='([^']+)'/)[1],docKey=chat.match(/DOC_ACK_KEY='([^']+)'/)[1],orgKey=chat.match(/const ORG_AI_NOTICE='([^']+)'/)[1];
assert.ok(/getItem\(pilotKey\)/.test(chat)&&/OriviaAccountStorage\?\.storage\|\|localStorage\)\.getItem\(pilotKey\)/.test(chat),'provider consent read through account storage');
assert.ok(/OriviaAccountStorage\?\.storage\|\|localStorage\)\.setItem\(DOC_ACK_KEY/.test(chat),'document acknowledgement written through account storage');
for(const k of [pilotKey,docKey,orgKey]){
 c.scope='alice';c.storage.setItem(k,'v-alice');assert.equal(c.storage.getItem(k),'v-alice');
 c.scope='bob';assert.equal(c.storage.getItem(k),null,k+': another account must give its own consent');
 c.scope=null;assert.equal(c.storage.getItem(k),null,k+': nor does a guest inherit it');
 c.scope='alice';assert.equal(c.storage.getItem(k),'v-alice',k+': and it returns for the same account')}
// The account's own saved data can be downloaded from the account panel (ORI-HOME-008).
assert.ok(acc.includes("btn('Download my personal data'")&&acc.includes("format:'orivia-personal-export'"));
console.log('Consent scope: provider consent, document acknowledgement and university AI notice kept per account; another account or a guest is asked again: pass.');
