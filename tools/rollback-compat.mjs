/* Client data compatibility across a rollback (ORI-SEC-006; Ina f99c2b3). Runs a chat.js's own normChat and its loadChats
   store construction on a saved chats record that holds conversation versions and Library removals, as the app does on
   load and then save. Reports which fields survive. Usage:
     node tools/rollback-compat.mjs <chat.js> [chat-versions.js]   → JSON {versions, libraryHidden} */
import fs from 'node:fs';
const [chatFile,versionsFile]=process.argv.slice(2);
const chat=fs.readFileSync(chatFile,'utf8').replace(/\r\n/g,'\n');
const pick=(start,end)=>{const i=chat.indexOf(start);if(i<0)return '';return chat.slice(i,chat.indexOf(end,i))};
const validTurn=chat.slice(chat.indexOf('const validTurn='),chat.indexOf('\n',chat.indexOf('const validTurn=')));
const autoTitle=pick('function autoTitle(','\nfunction normChat(');
const normChat=pick('function normChat(','\nlet storeLocked');
const storeLine=chat.match(/if\(d&&Array\.isArray\(d\.chats\)\)store=(\{[^\n]*?\});\n/);
const window={};
if(versionsFile){new Function('window',fs.readFileSync(versionsFile,'utf8'))(window)}
const libBox={};try{new Function('window',fs.readFileSync('workers/trial-ui/library-discoveries.js','utf8'))(libBox);window.OriviaDiscoveries=libBox.OriviaDiscoveries}catch(_){}
const run=new Function('window',validTurn+'\n'+autoTitle+'\n'+normChat+'\nreturn d=>{let store;'+(storeLine?'store='+storeLine[1]:'store={chats:d.chats.map(normChat).filter(Boolean),active:d.active}')+';return JSON.parse(JSON.stringify(store))}')(window);
const saved={active:'c1',library:{hidden:['ICP centre|icp.gov.ae']},chats:[{id:'c1',title:'T',created:1,updated:2,turns:[{role:'user',content:'Edited'},{role:'assistant',content:'B'}],
 versions:{active:1,items:[{turns:[{role:'user',content:'Original'},{role:'assistant',content:'A'}],orgContext:null,documents:[]},{turns:[{role:'user',content:'Edited'},{role:'assistant',content:'B'}],orgContext:null,documents:[]}]}}]};
const after=run(saved);
console.log(JSON.stringify({file:chatFile,versions:!!after.chats[0].versions&&after.chats[0].versions.items.length===2,libraryHidden:!!after.library&&after.library.hidden.includes('ICP centre|icp.gov.ae')}));
