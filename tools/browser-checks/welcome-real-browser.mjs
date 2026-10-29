// The guided Northbay welcome (area 22) in a real browser against the real local server: the app's own join link, the
// welcome screen, approval and the first step, editing personal details, and an existing account that joins. It starts
// accounts-local-server.mjs itself on a free port, so anyone can rerun it; nothing depends on a person clicking through.
// Fictional people only (@northbay.example). Headless Chrome through the DevTools protocol (no extra packages).
// Usage: node --experimental-sqlite tools/browser-checks/welcome-real-browser.mjs <outDir>   (CHROME=<path> to pick Chrome)
// Writes <outDir>/welcome.json (each check with its result) and a phone-size screenshot per stage.
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const outDir=process.argv[2]||fs.mkdtempSync(path.join(os.tmpdir(),'welcome-'));fs.mkdirSync(outDir,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=String(19300+Math.floor(Math.random()*500)),base='http://localhost:'+port,debug=9400+Math.floor(Math.random()*400);
const server=spawn(process.execPath,['--experimental-sqlite',new URL('accounts-local-server.mjs',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1'),port],{stdio:['ignore','pipe','pipe']});
const chromePath=process.env.CHROME||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':'google-chrome');
let chrome,offers=0;const checks=[];let failed=false;
const check=(name,ok,detail)=>{checks.push({check:name,ok:!!ok,...(detail!==undefined?{detail}:{})});if(!ok){failed=true;console.error('FAILED: '+name,detail??'')}};
try{
 for(let i=0;i<100;i++){try{await fetch(base+'/__dev/sql?t=organisations');break}catch{await sleep(100)}}
 // Staff setup over HTTP, with the requests the staff and owner screens send.
 async function as(name){const r=await fetch(base+'/__dev/as?name='+name);const who=await r.json();return {id:who.id,cookie:r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')}}
 const call=async(who,p,method='GET',body)=>{const r=await fetch(base+p,{method,headers:{Cookie:who.cookie,'X-Orivia-Account':who.id,Origin:base,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});const d=await r.json().catch(()=>null);if(r.status>=300)throw Error(method+' '+p+': '+r.status+' '+JSON.stringify(d));return d};
 const owner=await as('owner'),admin=await as('admin');
 const inv=await call(owner,'/api/admin/onboarding','POST',{recipientEmail:'admin@northbay.example',confirm:true});
 const app=(await call(admin,'/api/partner/inspect','POST',{token:inv.token})).application;
 await call(admin,'/api/partner/submit','POST',{token:inv.token,revision:app.revision,data:{name:'Northbay University',city:'Dubai',website:'https://northbay.example',contactEmail:'hub@northbay.example',country:'uae',region:'Dubai',town:'Dubai Academic City',reason:'study'},confirm:true});
 const org=(await call(owner,'/api/admin/onboarding/'+inv.id+'/decision','POST',{decision:'approve',revision:app.revision+1,confirm:true})).organisationId,pre='/api/orgs/'+org;
 const guide=(await call(admin,pre+'/content','POST',{kind:'guide',title:'Collect your student ID card',body:'Bring your passport and offer letter to the Student Hub in Building A during orientation week.',visibility:'members',details:{}})).content;
 await call(admin,pre+'/content/'+guide.id,'PATCH',{revision:guide.revision,status:'published'});
 const token=(await call(admin,pre+'/invitations','POST',{role:'student',label:'Autumn intake',expiresInSeconds:7*86400,maxUses:5})).token;
 const slug=(await (await fetch(base+'/__dev/sql?t=organisations')).json()).find(o=>o.id===org).slug;
 const table=async t=>(await fetch(base+'/__dev/sql?t='+t)).json();

 // The browser.
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'cdp-'));
 chrome=spawn(chromePath,['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run','--no-default-browser-check','--remote-debugging-port='+debug,'--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
 let ws;for(let i=0;i<75&&!ws;i++){try{const pg=(await (await fetch('http://127.0.0.1:'+debug+'/json')).json()).find(t=>t.type==='page');if(pg)ws=new WebSocket(pg.webSocketDebuggerUrl)}catch{}if(!ws)await sleep(200)}
 await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let n=0;const waiting=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&waiting.has(m.id)){waiting.get(m.id)(m);waiting.delete(m.id)}});
 const send=(method,params={})=>new Promise(r=>{const i=++n;waiting.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
 const js=async expr=>(await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true})).result?.result?.value;
 const go=async(url,wait=2500)=>{await send('Page.navigate',{url});await sleep(wait)};
 let shot=0;const snap=async name=>{const d=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(outDir,String(++shot).padStart(2,'0')+'-'+name+'.png'),Buffer.from(d.result.data,'base64'))};
 const text=()=>js("document.getElementById('account-entry')?.innerText||''");
 // The app's existing notifications offer comes once per account before the space opens; answer it as a person would.
 const notNow=async()=>{if(await js(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Not now'&&b.offsetParent);if(!b)return false;b.click();return true})()`)){offers++;await sleep(1500)}};
 const click=async label=>{const ok=await js(`(()=>{const b=[...document.querySelectorAll('#account-entry button')].find(b=>b.textContent.trim()===${JSON.stringify(label)}&&!b.disabled);if(!b)return false;b.click();return true})()`);await sleep(1500);await notNow();return ok};
 await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
 const link=base+'/?organisation='+slug+'#join='+token;

 // 1. A new student, Aisha, opens the app's join link already signed in.
 await go(base+'/__dev/as?name=aisha',800);await go(link,3500);await snap('landing');
 check('Join link opens the branded landing',(await js('document.title'))==='Northbay University · Orivia');
 check('The invitation stays out of the address bar',!(await js('location.href')).includes(token));
 check('Signing in alone does not join',(await table('organisation_memberships')).length===1);
 check('Request to join is offered',await click('Request to join'));
 await snap('welcome');
 const t1=await text();
 check('One welcome screen, titled with the university',t1.includes('Welcome to Northbay University'),t1.slice(0,200));
 check('The name is asked once',t1.split('What should we call you?').length===2);
 check('Approved campus defaults are shown as text',t1.includes('Set by Northbay University')&&t1.includes('Study · Dubai Academic City, Dubai, UAE'));
 check('Campus questions are not asked',await js("['destination','region','town','reason'].every(k=>!document.getElementById('onboard-'+k))"));
 check('Personal details are editable',await js("['name','origin','originTown','stage'].every(k=>{const e=document.getElementById('onboard-'+k);return e&&!e.disabled})"));
 await js("(()=>{const s=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}))};s('onboard-name','Aisha');s('onboard-origin','GB');s('onboard-originTown','Manchester');for(const c of document.querySelectorAll('#account-entry input[type=checkbox]'))c.checked=true})()");
 check('Let’s get started',await click('Let’s get started'));await sleep(1500);await snap('pending');
 const t2=await text();
 check('Pending: the next step is approval',t2.includes('Your next step')&&t2.includes('Waiting for approval'),t2.slice(0,300));
 check('Pending: no private guides',!t2.includes('Collect your student ID card'));
 const aisha=(await table('user')).find(u=>u.email==='aisha@northbay.example');
 const m1=(await table('organisation_memberships')).find(m=>m.user_id===aisha.id);
 check('Membership is requested, not active',m1?.status==='requested'&&m1.role==='student',m1);
 const v1=(await table('account_vault')).find(v=>v.user_id===aisha.id),p1=v1&&JSON.parse(v1.data).profile;
 check('Saved profile: campus from the defaults, origin from Aisha',p1?.dest==='uae'&&p1.destRegion==='Dubai'&&p1.destTown==='Dubai Academic City'&&p1.who==='study'&&p1.originCountry==='GB'&&p1.originTown==='Manchester',p1);

 // 2. Staff approve; Aisha's space now leads with one first step.
 await call(admin,pre+'/requests/'+aisha.id+'/decision','POST',{decision:'approve'});
 await go(base+'/?organisation='+slug,3500);await notNow();await snap('first-step');
 const t3=await text();
 check('Approved: the first step is the published guide',/Your next step\s*Collect your student ID card/.test(t3),t3.slice(0,300));
 check('Approved: the step has one action',await js("!!document.querySelector('#first-step button')&&document.querySelector('#first-step button').textContent==='Read this guide'"));
 check('Returning: not asked to join or set up again',!t3.includes('Request to join')&&!t3.includes('What should we call you?'));

 // 3. Editing personal details keeps the membership and the recorded terms.
 check('Edit my details',await click('Edit my details'));await snap('edit-details');
 const t4=await text();
 check('Terms are not asked again',!t4.includes('I accept the pilot terms above.')&&t4.includes('You’ve already accepted the pilot terms'));
 check('The AI choice is not asked again',await js("!document.querySelector('#account-entry #consent')"));
 await js("(()=>{const e=document.getElementById('onboard-name');e.value='Aisha K'})()");
 check('Save my details',await click('Save my details'));await sleep(1000);await snap('after-edit');
 const v2=(await table('account_vault')).find(v=>v.user_id===aisha.id),p2=JSON.parse(v2.data).profile;
 check('Details saved, terms record unchanged',p2.displayName==='Aisha K'&&JSON.stringify(p2.onboarding)===JSON.stringify(p1.onboarding)&&v2.revision>v1.revision,{before:v1.revision,after:v2.revision});
 const m2=(await table('organisation_memberships')).find(m=>m.user_id===aisha.id);
 check('Membership unchanged by editing',m2.status==='active'&&m2.role==='student');
 check('Back in the space with the first step',(await text()).includes('Your next step'));

 // 4. An existing account, Layla, with saved chats and plans, joins: nothing is asked again and nothing saved changes.
 const layla=await as('layla');const saved={version:1,profile:{displayName:'Layla',originCountry:'GB',movedFrom:'Leeds, United Kingdom',here:'away',dest:'uk',onboarding:{version:1,completedAt:'2026-10-20T09:00:00.000Z',termsVersion:'pilot-2026-10-20',privacyVersion:'pilot-2026-10-20',language:'en'}},events:[],journeys:{},chats:{chats:[{id:'c1',title:'Moving checklist',turns:[{role:'user',content:'What do I pack first?'}]}],active:'c1'}};
 const seeded=await fetch(base+'/api/account/vault',{method:'PUT',headers:{Cookie:layla.cookie,'X-Orivia-Account':layla.id,Origin:base,'Content-Type':'application/json','If-Match':'0'},body:JSON.stringify(saved)});if(seeded.status!==200)throw Error('seed Layla: '+seeded.status+' '+await seeded.text());
 const ov1=(await table('account_vault')).find(v=>v.user_id===layla.id);
 await send('Storage.clearDataForOrigin',{origin:base,storageTypes:'all'});
 await go(base+'/__dev/as?name=layla',800);await go(link,3500);
 check('Layla: request to join',await click('Request to join'));await snap('existing-account-welcome');
 const t5=await text();
 check('Layla: welcome with the campus and Layla’s own details',t5.includes('Welcome to Northbay University')&&t5.includes('Set by Northbay University')&&t5.includes('From Leeds, United Kingdom'),t5.slice(0,300));
 check('Layla: no setup questions',await js("!document.getElementById('onboard-name')"));
 const ov2=(await table('account_vault')).find(v=>v.user_id===layla.id);
 check('Layla: joining changed nothing saved',ov2.revision===ov1.revision&&ov2.data===ov1.data);
 const lm=(await table('organisation_memberships')).find(m=>m.user_id===layla.id);
 check('Layla: membership requested',lm?.status==='requested');
}catch(e){check('run',false,String(e.stack||e))}
finally{try{chrome?.kill()}catch{}server.kill()}
checks.push({check:'Notifications offers answered “Not now” (existing app step, once per account)',ok:true,detail:offers});
const result={ranAt:new Date().toISOString(),what:'Guided Northbay welcome in headless Chrome against accounts-local-server.mjs (real accounts and app worker code, in-memory SQLite, no email, no AI)',passed:!failed,checks};
fs.writeFileSync(path.join(outDir,'welcome.json'),JSON.stringify(result,null,1)+'\n');
console.log(JSON.stringify({passed:result.passed,checks:checks.length,failed:checks.filter(c=>!c.ok).map(c=>c.check),evidence:outDir}));
if(failed)process.exitCode=1;
