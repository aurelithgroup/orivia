// Ina's reproduction in the real app (harness): 105 sourced recommendations, remove one, count changed messages, Restore, reload.
const fs=require('fs'),S=process.argv[2];
const seed=`(()=>{const K='orivia-private-chats-v1';const st=JSON.parse(localStorage.getItem(K));
const src=[{id:'s1',url:'https://www.icp.gov.ae/centres',title:'ICP centres',category:'official'}];
const dest=Array.from({length:105},(_,i)=>({name:'Service Centre '+i,address:'Street '+i,sourceId:'s1',quote:'Service Centre '+i+' is open'}));
st.chats.push({id:'d1',title:'Many centres',created:Date.now(),updated:Date.now(),turns:[{role:'user',content:'list all centres'},
 ...Array.from({length:35},(_,j)=>({role:'assistant',content:'Part '+j,meta:{sources:src,destinations:dest.slice(j*3,j*3+3)}}))]});
localStorage.setItem(K,JSON.stringify(st));return 'seeded '+dest.length})()`;
const check=`(async()=>{const d=document,K='orivia-private-chats-v1',out={},wait=ms=>new Promise(r=>setTimeout(r,ms));
const nav=()=>[...d.querySelectorAll('nav button,nav a')].find(b=>/Library/.test(b.textContent));nav().click();await wait(800);
const cards=()=>[...d.querySelectorAll('#lib-places .lib-short')];const chatsJSON=()=>JSON.stringify(JSON.parse(localStorage.getItem(K)).chats);
out.count=d.getElementById('lib-count-places').textContent;out.firstPage=cards().length;
const more=()=>d.querySelector('#lib-places .lib-more');out.moreLabel=more()&&more().textContent;
while(more()){more().click();await wait(150)}out.afterShowMore=cards().length;
const before=chatsJSON(),beforeMsgs=JSON.parse(before).flatMap(c=>c.turns.map(t=>JSON.stringify(t)));
const target=cards().find(c=>c.querySelector('strong').textContent==='Service Centre 50');const rm=[...target.querySelectorAll('button')].find(b=>/Remove/.test(b.textContent));rm.click();rm.click();await wait(300);
const after=chatsJSON(),afterMsgs=JSON.parse(after).flatMap(c=>c.turns.map(t=>JSON.stringify(t)));
const bc=JSON.parse(before),ac=JSON.parse(after);out.chatFieldDiffs=bc.map((c,i)=>Object.keys({...c,...ac[i]}).filter(k=>k!=='turns'&&JSON.stringify(c[k])!==JSON.stringify(ac[i][k])).map(k=>c.id+'.'+k+':'+JSON.stringify(c[k])+'→'+JSON.stringify(ac[i][k]))).flat();out.messagesChanged=afterMsgs.filter((m,i)=>m!==beforeMsgs[i]).length;out.chatsIdentical=before===after;
out.libraryState=JSON.parse(localStorage.getItem(K)).library;out.countAfterRemove=d.getElementById('lib-count-places').textContent;
const removed=d.querySelector('#lib-places .lib-removed');out.removedSummary=removed&&removed.querySelector('summary').textContent;
[...removed.querySelectorAll('button')].find(b=>/Restore/.test(b.textContent)).click();await wait(300);
out.countAfterRestore=d.getElementById('lib-count-places').textContent;out.chatsIdenticalAfterRestore=chatsJSON()===before;out.libraryAfterRestore=JSON.parse(localStorage.getItem(K)).library;
return JSON.stringify(out)})()`;
// Third job: remove, reload (keep storage), confirm the removal persisted.
const removeOnly=`(async()=>{const d=document,wait=ms=>new Promise(r=>setTimeout(r,ms));[...d.querySelectorAll('nav button,nav a')].find(b=>/Library/.test(b.textContent)).click();await wait(800);
const K='orivia-private-chats-v1',before=JSON.stringify(JSON.parse(localStorage.getItem(K)).chats);const c=[...d.querySelectorAll('#lib-places .lib-short')].find(c=>c.querySelector('strong').textContent==='Service Centre 104');const rm=[...c.querySelectorAll('button')].find(b=>/Remove/.test(b.textContent));rm.click();rm.click();await wait(300);return JSON.stringify({chatsByteIdentical:before===JSON.stringify(JSON.parse(localStorage.getItem(K)).chats),library:JSON.parse(localStorage.getItem(K)).library})})()`;
const afterReload=`(async()=>{const d=document,wait=ms=>new Promise(r=>setTimeout(r,ms));[...d.querySelectorAll('nav button,nav a')].find(b=>/Library/.test(b.textContent)).click();await wait(800);
return JSON.stringify({count:d.getElementById('lib-count-places').textContent,removed:d.querySelector('#lib-places .lib-removed summary')?.textContent,stillListed:[...d.querySelectorAll('#lib-places .lib-short strong')].some(s=>s.textContent==='Service Centre 104')})})()`;
fs.writeFileSync(S+'/jobs-disc3.json',JSON.stringify([{name:'d3-seed',path:'?view=chat',wait:2500,js:seed},{name:'d3-check',path:'?view=chat',wait:2500,keep:true,js:check},{name:'d3-remove',path:'?view=chat',wait:2500,keep:true,js:removeOnly},{name:'d3-reload',path:'?view=chat',wait:2500,keep:true,js:afterReload}]));
