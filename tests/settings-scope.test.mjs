/* ORI-HOME-010: switching accounts doesn't carry the previous person's personal defaults; device display choices stay.
   Runs chat.js's readSettings/writeSettings through storage scoped the way accounts.js scopes it. Run: node tests/settings-scope.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n'),acc=fs.readFileSync('workers/trial-ui/accounts.js','utf8');
assert.ok(acc.includes("'orivia-private-chats-v1-unreadable','orivia-private-settings-v1']"),'settings are an account-scoped key');
const line=s=>chat.slice(chat.indexOf(s),chat.indexOf('\n',chat.indexOf(s)));
const code=[line('const settingsKey='),line('const SET_DEFAULT='),chat.slice(chat.indexOf('const DEVICE_SETTINGS='),chat.indexOf('function writeSettings(')),chat.slice(chat.indexOf('function writeSettings('),chat.indexOf('applySettings();renderSettings()}',chat.indexOf('function writeSettings('))+'applySettings();renderSettings()}'.length)].join('\n');
// accounts.js scoping: private keys get "orivia-account:<id>:" when someone is signed in.
const native=new Map(),local={getItem:k=>native.has(k)?native.get(k):null,setItem:(k,v)=>native.set(k,String(v))};
let scope=null;const scoped={getItem:k=>local.getItem(scope&&k==='orivia-private-settings-v1'?'orivia-account:'+scope+':'+k:k),setItem:(k,v)=>local.setItem(scope&&k==='orivia-private-settings-v1'?'orivia-account:'+scope+':'+k:k,v)};
const G={OriviaAccountStorage:{storage:scoped},OriviaAccounts:{get user(){return scope?{id:scope}:null}}};const S=new Function('globalThis','localStorage','applySettings','renderSettings',code+';return {readSettings,writeSettings}')(G,local,()=>{},()=>{});
// Guest picks French and a large text size (device choices).
S.writeSettings({language:'fr',size:'large'});
// Account A: personal defaults.
scope='A';assert.equal(S.readSettings().language,'fr','device language carries into the account');S.writeSettings({tone:'formal',suggest:false,naturalVoice:false});
assert.deepEqual([S.readSettings().tone,S.readSettings().suggest,S.readSettings().naturalVoice],['formal',false,false]);
// Account B on the same device: none of A's personal defaults; device choices kept.
scope='B';const b=S.readSettings();assert.equal(b.tone,'friendly');assert.equal(b.suggest,true);assert.equal(b.naturalVoice,undefined);assert.equal(b.language,'fr');assert.equal(b.size,'large');
// B changes language: device-wide record updated (the sign-in screen and i18n read it), A keeps its own defaults.
S.writeSettings({language:'ar'});assert.equal(JSON.parse(native.get('orivia-private-settings-v1')).language,'ar');
scope='A';assert.equal(S.readSettings().tone,'formal');assert.equal(S.readSettings().language,'ar','language is a device choice, the same in every account');
scope=null;assert.equal(S.readSettings().tone,'friendly','the guest copy never held A’s defaults');
console.log('Settings scope: personal defaults stay with each account; language, theme and size stay device-wide: pass.');
