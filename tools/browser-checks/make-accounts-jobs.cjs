// Builds tools/browser-checks/jobs-accounts.json: real sign-in of two accounts, then Accounts on this device → Switch,
// against the harness with HARNESS_ACCOUNTS=1 (real Better Auth, local SQLite, codes from /__otp).
const fs=require('fs');
const lib=`const wait=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>[...document.querySelectorAll(s)];
const title=()=>document.querySelector('#account-entry h1,#account-entry h2')?.textContent||(document.getElementById('workspace')?.hidden===false?'APP':null);
const click=t=>{const b=q('button,a').find(b=>b.textContent.trim()===t&&!b.disabled&&b.offsetParent!==null);if(!b)throw Error('no button '+t+' on '+title());b.click()};
async function signIn(email,log){const f=document.querySelector('#account-entry form.auth-form');f.querySelector('input').value=email;f.requestSubmit();await wait(700);
 const otp=(await (await fetch('/__otp')).json()).otp;const f2=document.querySelector('#account-entry form.auth-form');f2.querySelector('input').value=otp;f2.requestSubmit();await wait(1200);log.push('after code: '+title());
 for(let i=0;i<6&&title()!=='APP';i++){const t=title();
  if(/call you/i.test(t))click('Start without importing');
  else if(/Make yourself at home/i.test(t)){q('#account-entry input[type=checkbox]').forEach(c=>{if(!c.checked)c.click()});click('Let’s get started')}
  else if(/Before we begin/i.test(t)){q('#account-entry input[type=checkbox]').forEach(c=>{if(!c.checked)c.click()});click('Let’s get started')}
  else if(/alert|notification/i.test(t)){const b=q('#account-entry button').find(b=>/not now|skip|later/i.test(b.textContent));b?b.click():click('Not now')}
  else break;await wait(1200);log.push('step: '+title())}}`;
const J=(name,js,extra={})=>({name,path:'',wait:3000,keep:true,js:`(async()=>{${lib};const out={log:[]};try{${js}}catch(e){out.error=String(e);out.screen=title();out.text=document.getElementById('account-entry')?.innerText?.slice(0,300)}return JSON.stringify(out)})()`,...extra});
const jobs=[
 {name:'acc-reset',path:'',wait:2500,js:"'ok'"},
 J('acc-a',`out.start=title();await signIn('amira@example.test',out.log);out.end=title();out.user=window.OriviaAccounts.user?.email;
  document.getElementById('msg').value='';const K=Object.keys(localStorage).find(k=>k.endsWith('orivia-private-chats-v1')&&k.startsWith('orivia-account:'));out.scopedKey=!!K;`),
 J('acc-b',`window.OriviaAccounts.open();await wait(1500);out.panel=title();click('Add another account');await wait(800);out.signInScreen=title();await signIn('bilal@example.test',out.log);out.user=window.OriviaAccounts.user?.email;`),
 J('acc-list',`window.OriviaAccounts.open();await wait(1500);const sec=q('#account-entry section.card').find(s=>/Accounts on this device/.test(s.textContent));out.rows=q('#account-entry section.card .auth-choice').map(r=>r.innerText.replace(/\\s+/g,' ').trim());out.hasAdd=!!q('button').find(b=>b.textContent==='Add another account');
  click('Switch');`,{after:3500,check:"JSON.stringify({user:window.OriviaAccounts?.user?.email||null,screen:document.getElementById('workspace')?.hidden===false?'APP':document.querySelector('#account-entry h1,#account-entry h2')?.textContent})"}),
 J('acc-remove',`window.OriviaAccounts.open();await wait(1500);out.before=q('#account-entry section.card .auth-choice').map(r=>r.innerText.replace(/\\s+/g,' ').trim());click('Remove from this device');await wait(100);out.firstTap=q('button').some(b=>b.textContent==='Tap again to remove');click('Tap again to remove');await wait(1500);out.after=q('#account-entry section.card .auth-choice').map(r=>r.innerText.replace(/\\s+/g,' ').trim());out.user=window.OriviaAccounts.user?.email;out.status=document.getElementById('account-status')?.textContent;`),
];
fs.writeFileSync(__dirname+'/jobs-accounts.json',JSON.stringify(jobs,null,1));console.log('jobs',jobs.length);
