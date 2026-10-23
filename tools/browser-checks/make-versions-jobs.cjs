// Builds tools/browser-checks/jobs-versions.json: edit → regenerate → switch → refresh with reminders, an attachment message,
// Stop, server failure, storage failure and account exit, against the real app in the local harness. /v1/chat is stubbed in
// the page (window.__chat: mode 'ok' | 'slow' | 'fail'; counts requests and user messages per request).
const fs=require('fs');
const stub=`if(!window.__chat){window.__chat={mode:'ok',n:0,bodies:[]};const real=window.fetch;window.fetch=(u,o)=>{if(!String(u).startsWith('/v1/chat'))return real(u,o);const c=window.__chat;c.n++;const body=JSON.parse(o.body);c.bodies.push(body.messages);
 const d=new Date(Date.now()+3*86400000).toISOString().slice(0,10),reply={reply:'Answer '+c.n+' to: '+body.messages.at(-1).content,reminder:{title:'Dentist '+c.n,date:d,time:'10:00'}};
 if(c.mode==='fail')return Promise.resolve(new Response('{"error":"temporarily_unavailable"}',{status:500,headers:{'Content-Type':'application/json'}}));
 return new Promise((res,rej)=>{const t=setTimeout(()=>res(new Response(JSON.stringify(reply),{headers:{'Content-Type':'application/json'}})),c.mode==='slow'?2500:30);o.signal&&o.signal.addEventListener('abort',()=>{clearTimeout(t);rej(new DOMException('Aborted','AbortError'))})})}}`;
const lib=`const wait=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>[...document.querySelectorAll(s)];
const events=()=>JSON.parse(localStorage.getItem('orivia-private-events-v1')||'[]').length;
const label=()=>q('#history .reply-actions span').map(s=>s.textContent).find(t=>/^\\d+ \\/ \\d+$/.test(t))||null;
const bubbles=()=>q('#history .bubble').map(b=>(b.classList.contains('user')?'U:':'A:')+(b.querySelector('.reply-text')?.textContent||'').slice(0,60));
const btn=(text,root=document)=>[...root.querySelectorAll('button')].find(b=>b.textContent.trim()===text);
const lastReply=()=>q('#history .bubble.assistant').at(-1);
const regen=async()=>{const more=lastReply().querySelector('details');more.open=true;btn('Regenerate',more).click();await wait(400)};
const editLast=async text=>{btn('Edit',q('#history .bubble.user').at(-1)).click();await wait(50);const f=document.querySelector('.message-edit');f.querySelector('textarea').value=text;f.requestSubmit();await wait(400)};`;
const J=(name,js,extra={})=>({name,path:'?view=chat',wait:3000,keep:true,js:`(async()=>{${stub};${lib};const out={};try{${js}}catch(e){out.error=String(e)}return JSON.stringify(out)})()`,...extra});
const jobs=[
 {name:'v-seed',path:'?view=chat',wait:3000,js:`(()=>{const K='orivia-private-chats-v1',st=JSON.parse(localStorage.getItem(K));st.chats.unshift({id:'vt',title:'Versions test',created:Date.now(),updated:Date.now(),turns:[{role:'user',content:'Read my tenancy photo',meta:{attachment:{id:'att1',name:'tenancy.jpg',type:'image/jpeg'}}},{role:'assistant',content:'It says the rent is 4000.'}]});st.active='vt';localStorage.setItem(K,JSON.stringify(st));return 'ok'})()`},
 J('v-flow',`
 const ev0=events();out.start=bubbles();
 document.getElementById('msg').value='Book the dentist';document.getElementById('form').requestSubmit();await wait(400);
 out.afterSend={events:events()-ev0,requests:__chat.n,label:label()};
 await editLast('Book the dentist on Friday');
 out.afterEdit={events:events()-ev0,requests:__chat.n,label:label(),userInLastRequest:__chat.bodies.at(-1).filter(m=>m.role==='user').map(m=>m.content),reply:lastReply().querySelector('.reply-text').textContent,reviewCard:!!lastReply().textContent.includes('Review reminder')};
 await regen();
 out.afterRegen={events:events()-ev0,requests:__chat.n,label:label(),usersInRequest:__chat.bodies.at(-1).filter(m=>m.role==='user').length,usersShown:q('#history .bubble.user').length,lastSentText:__chat.bodies.at(-1).map(m=>m.content)};
 btn('Previous version').click();await wait(150);out.prev1={label:label(),bubbles:bubbles()};
 btn('Previous version').click();await wait(150);out.prev2={label:label(),bubbles:bubbles(),attachmentShown:!!document.querySelector('#history .message-attachment')};
 btn('Next version').click();await wait(150);btn('Next version').click();await wait(150);out.backToLatest=label();
 const save=btn('Save reminder',lastReply());out.hadSave=!!save;save&&save.click();await wait(150);out.afterSave=events()-ev0;`),
 J('v-refresh',`out.label=label();out.bubbles=bubbles();out.reminderSaved=!!lastReply().textContent.match(/Dentist/);`),
 J('v-stop',`__chat.mode='slow';const before={label:label(),bubbles:bubbles()};await regen();await wait(300);out.during={label:label(),busy:document.getElementById('send').classList.contains('stopping')};
 document.getElementById('send').click();await wait(400);out.afterStop={label:label(),bubbles:bubbles(),status:document.getElementById('status').textContent,composer:document.getElementById('msg').value};out.before=before;
 btn('Previous version')?.click();await wait(150);out.prevAfterStop={label:label(),bubbles:bubbles()};`),
 J('v-fail',`__chat.mode='fail';const n0=__chat.n;await regen();await wait(300);out.afterFail={label:label(),bubbles:bubbles(),status:document.getElementById('status').textContent,composer:document.getElementById('msg').value,requests:__chat.n-n0};`),
 J('v-storage',`__chat.mode='ok';const n0=__chat.n,lab=label(),b0=bubbles();const orig=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(String(k).includes('chats'))throw new DOMException('Quota','QuotaExceededError');return orig.call(this,k,v)};
 await regen();await wait(300);Storage.prototype.setItem=orig;out.afterQuota={requests:__chat.n-n0,labelBefore:lab,label:label(),same:JSON.stringify(b0)===JSON.stringify(bubbles()),status:document.getElementById('status').textContent};`),
 J('v-exit',`__chat.mode='slow';const n0=__chat.n,lab=label();await regen();await wait(200);window.OriviaAccounts.open();await wait(3000);
 const st=JSON.parse(localStorage.getItem('orivia-private-chats-v1')),c=st.chats.find(x=>x.id==='vt');out.afterExit={requests:__chat.n-n0,labelBefore:lab,versions:c.versions?.items?.length,active:c.versions?.active,lastTurns:c.turns.map(t=>t.role+':'+t.content.slice(0,40)),accountFlow:document.body.dataset.accountFlow||null};`),
];
fs.writeFileSync(__dirname+'/jobs-versions.json',JSON.stringify(jobs,null,1));console.log('jobs',jobs.length);
