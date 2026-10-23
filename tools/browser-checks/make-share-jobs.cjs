// Builds tools/browser-checks/jobs-share.json: the Share dialog in the real app (guest harness), first as a guest, then
// with a stubbed signed-in user and a stubbed /api/account/shares that records exactly what would be sent.
const fs=require('fs');
const seed=`(()=>{const K='orivia-private-chats-v1',st=JSON.parse(localStorage.getItem(K));
st.chats.unshift({id:'sh',title:'Lease questions',created:Date.now(),updated:Date.now(),turns:[
 {role:'user',content:'Where do I renew my Emirates ID?'},{role:'assistant',content:'At an ICP customer happiness centre.',meta:{sources:[{id:'s1',url:'https://icp.gov.ae/centres',title:'ICP centres',category:'official'}]}},
 {role:'user',content:'Read my lease',meta:{attachment:{id:'a1',name:'lease.pdf',type:'application/pdf'}}},{role:'assistant',content:'The lease says the rent is 4000 a month.'},
 {role:'user',content:'Thanks'}]});st.active='sh';localStorage.setItem(K,JSON.stringify(st));return 'ok'})()`;
const lib=`const wait=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>[...document.querySelectorAll(s)];
const openShare=async i=>{const b=q('#history .bubble.assistant')[i];const more=b.querySelector('.reply-actions details');more.open=true;[...more.querySelectorAll('button')].find(x=>x.textContent==='Share…').click();await wait(300);return document.querySelector('dialog.share-dialog')};`;
const guest=`(async()=>{${lib};const d=await openShare(0);const out={open:!!d,text:d&&d.innerText.slice(0,160)};d&&d.close();return JSON.stringify(out)})()`;
const signedIn=`(async()=>{${lib};const sent=[];Object.defineProperty(window.OriviaAccounts,'user',{value:{id:'u1',email:'amira@example.test'},configurable:true});
 const real=window.fetch;let shares=[];window.fetch=(u,o)=>{u=String(u);if(!u.startsWith('/api/account/shares'))return real(u,o);const m=(o&&o.method)||'GET';sent.push({m,u,b:o&&o.body?JSON.parse(o.body):null,h:o&&o.headers});
  if(m==='POST'&&u==='/api/account/shares'){shares.unshift({id:'sid1',title:JSON.parse(o.body).title,messages:JSON.parse(o.body).messages.length,createdAt:Date.now(),expiresAt:Date.now()+7*864e5,state:'active'});return Promise.resolve(new Response(JSON.stringify({id:'sid1',url:'https://app.localhost/s/'+'T'.repeat(43),expiresAt:new Date(Date.now()+7*864e5).toISOString()}),{status:201}))}
  if(m==='POST'&&u.endsWith('/revoke')){shares[0].state='revoked';return Promise.resolve(new Response('{"ok":true}'))}
  return Promise.resolve(new Response(JSON.stringify({shares})))};
 const d=await openShare(0);const rows=[...d.querySelectorAll('.share-row')].filter(r=>r.querySelector('input'));
 const out={rows:rows.map(r=>({checked:r.querySelector('input').checked,disabled:r.querySelector('input').disabled,why:r.querySelector('.share-why')?.textContent||null}))};
 [...d.querySelectorAll('button')].find(b=>b.textContent==='Create link').click();await wait(400);
 const post=sent.find(x=>x.m==='POST'&&x.u==='/api/account/shares');out.payload=post&&post.b;out.header=post&&post.h&&post.h['X-Orivia-Account'];
 out.link=d.querySelector('.share-link')?.value;out.notice=d.querySelector('.share-out p')?.textContent;
 await wait(300);out.listed=[...d.querySelectorAll('.share-links .share-row')].map(r=>r.innerText.replace(/\\s+/g,' '));
 [...d.querySelectorAll('.share-links button')].find(b=>b.textContent==='Withdraw').click();await wait(400);out.afterWithdraw=[...d.querySelectorAll('.share-links .share-row')].map(r=>r.innerText.replace(/\\s+/g,' '));
 out.overflow=document.documentElement.scrollWidth>innerWidth;return JSON.stringify(out)})()`;
fs.writeFileSync(__dirname+'/jobs-share.json',JSON.stringify([{name:'share-seed',path:'?view=chat',wait:3000,js:seed},{name:'share-guest',path:'?view=chat',wait:3000,keep:true,js:guest},{name:'share-signed-in',path:'?view=chat',wait:3000,keep:true,js:signedIn}],null,1));console.log('ok');
