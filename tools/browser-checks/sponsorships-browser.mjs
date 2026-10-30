// Sponsored placements (area 16) in a real browser against the real local server: the owner creates, previews, sends
// for review and approves a campaign in the management page (/manage), then the student sees it in the app's university space,
// labelled Sponsored and after the university's own content, and again once the organisation is a demo one.
// It starts accounts-local-server.mjs itself and replays sponsorships-local.mjs first, so anyone can rerun it.
// Usage: node --experimental-sqlite tools/browser-checks/sponsorships-browser.mjs [outDir]   (CHROME=<path> to pick Chrome)
import {spawn,spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const outDir=process.argv[2]||fs.mkdtempSync(path.join(os.tmpdir(),'sponsor-'));fs.mkdirSync(outDir,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),here=p=>new URL(p,import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1');
const port=String(20200+Math.floor(Math.random()*400)),base='http://localhost:'+port,debug=9960+Math.floor(Math.random()*30);
const server=spawn(process.execPath,['--experimental-sqlite',here('accounts-local-server.mjs'),port],{stdio:['ignore','pipe','pipe']});
const chromePath=process.env.CHROME||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':'google-chrome');
let chrome;const checks=[];let failed=false;
const check=(name,ok,detail)=>{checks.push({check:name,ok:!!ok,...(detail!==undefined?{detail}:{})});if(!ok){failed=true;console.error('FAILED: '+name,detail??'')}};
try{
 for(let i=0;i<100;i++){try{await fetch(base+'/__dev/sql?t=organisations');break}catch{await sleep(100)}}
 const replayOut=path.join(outDir,'replay.json'),replay=spawnSync(process.execPath,[here('sponsorships-local.mjs'),base,replayOut],{encoding:'utf8'});
 const r=JSON.parse(fs.readFileSync(replayOut,'utf8'));check('Replay of campaign rules, visibility and boundaries ('+r.steps.length+' steps)',r.passed,r.failed||replay.stderr);
 const oid=r.organisationId;
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'cdp-'));
 chrome=spawn(chromePath,['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run','--no-default-browser-check','--remote-debugging-port='+debug,'--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
 let ws;for(let i=0;i<75&&!ws;i++){try{const pg=(await (await fetch('http://127.0.0.1:'+debug+'/json')).json()).find(t=>t.type==='page');if(pg)ws=new WebSocket(pg.webSocketDebuggerUrl)}catch{}if(!ws)await sleep(200)}
 await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let n=0;const waiting=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&waiting.has(m.id)){waiting.get(m.id)(m);waiting.delete(m.id)}});
 const send=(method,params={})=>new Promise(r=>{const i=++n;waiting.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
 const js=async expr=>(await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true})).result?.result?.value;
 const go=async(url,wait=3000)=>{await send('Page.navigate',{url});await sleep(wait)};
 let shot=0;const snap=async name=>{const d=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});fs.writeFileSync(path.join(outDir,String(++shot).padStart(2,'0')+'-'+name+'.png'),Buffer.from(d.result.data,'base64'))};
 const press=label=>js(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(label)}&&b.offsetParent&&!b.disabled);if(!b)return false;b.click();return true})()`);
 await send('Page.enable');await send('Runtime.enable');
 // The owner, in the management page: a new campaign, previewed, sent for review and approved.
 await send('Emulation.setDeviceMetricsOverride',{width:1280,height:2600,deviceScaleFactor:1,mobile:false});
 await go(base+'/__dev/as?name=owner',800);await go(base+'/manage',3500);
 const panelJs="[...document.querySelectorAll('.panel')].find(p=>p.querySelector('h3')?.textContent==='Sponsored placements')";
 check('The owner has a Sponsored placements panel',await js('!!'+panelJs));
 const made=await js(`(async()=>{const p=${panelJs},f=p.querySelector('form'),ins=[...f.querySelectorAll('input:not([type=checkbox]):not([type=date])')],sel=f.querySelector('select');
  sel.value=[...sel.options].find(o=>o.textContent.startsWith('Northbay')).value;const [partner,label,link,disc]=ins;partner.value='Northbay Coffee Co';label.value='Sponsored: free coffee in freshers’ week';link.value='https://coffee.example/freshers';disc.value='Paid placement by Northbay Coffee Co. Not an official university service.';
  [...f.querySelectorAll('button')].find(b=>b.textContent==='Preview as a student').click();await new Promise(r=>setTimeout(r,300));const preview=f.querySelector('.sponsored')?.innerText;
  f.querySelector('input[type=checkbox]').checked=true;f.querySelector('button[type=submit]').click();await new Promise(r=>setTimeout(r,2000));return preview})()`);
 check('Owner preview shows the student card before anything is saved',(made||'').includes('Sponsored')&&made.includes('Paid placement by Northbay Coffee Co.')&&!made.includes('Paid for by'),made);
 const item=label=>`[...${panelJs}.querySelectorAll('.panel')].find(p=>p.querySelector('h4')?.textContent===${JSON.stringify(label)})`;
 const L='Sponsored: free coffee in freshers’ week';
 check('The new campaign is a draft',(await js(item(L)+'?.innerText'))?.includes('Draft'));
 await js(`[...${item(L)}.querySelectorAll('button')].find(b=>b.textContent==='Send for review').click()`);await sleep(2000);
 await js(`(()=>{const p=${item(L)};p.querySelector('textarea').value='Checked the label, disclosure, link and dates.';p.querySelector('input[type=checkbox]').checked=true;[...p.querySelectorAll('button')].find(b=>b.textContent==='Approve').click()})()`);await sleep(2200);
 const approved=await js(item(L)+'?.innerText');await snap('owner-approved');
 check('Approved in the page and showing to students now',(approved||'').includes('Approved · showing to students now'),approved);
 // The student, in the app's university space.
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
 await send('Storage.clearDataForOrigin',{origin:base,storageTypes:'all'});
 const openSpace=async()=>{await go(base+'/space/'+oid,3500);for(let i=0;i<10;i++){if(await js("!!document.getElementById('sponsored-placements')"))break;await sleep(700);
  await js("(()=>{for(const c of document.querySelectorAll('#account-entry input[type=checkbox]'))c.checked=true})()");for(const b of ['Not now','Start without importing','Let’s get started','Continue'])if(await press(b)){await sleep(1800);break}}await sleep(800)};
 await go(base+'/__dev/as?name=student',800);await openSpace();await snap('student-sponsored');
 const s1=await js("(()=>{const g=document.getElementById('sponsored-placements');if(!g)return null;const all=[...document.querySelectorAll('.organisation-group')];return {text:g.innerText,last:all.at(-1)===g,links:[...g.querySelectorAll('a')].map(a=>({label:a.textContent,href:a.href,rel:a.rel}))}})()");
 check('The student sees a Sponsored section',!!s1,await js("document.body.innerText.slice(0,300)"));
 check('It is labelled, says who paid and that it is not part of guides or answers',(s1?.text||'').includes('Paid placement by Northbay Coffee Co.')&&!s1.text.includes('Paid for by Northbay Coffee Co.')&&s1.text.includes('not part of Northbay University’s guides or Orivia’s answers'));
 check('It comes after everything the university published',s1?.last===true);
 check('The link is marked sponsored',s1?.links.some(l=>l.href==='https://coffee.example/freshers'&&l.rel.includes('sponsored')),s1?.links);
 check('Only live, approved placements (the withdrawn and not-yet-started ones are absent)',!s1?.text.includes('course books')&&!s1?.text.includes('winter coat'));
 await fetch(base+'/__dev/demo?org='+oid);await openSpace();await snap('student-sponsored-demo');
 check('Demo: the sponsor is labelled fictional',(await js("document.getElementById('sponsored-placements')?.innerText")||'').includes('Demo organisation: this sponsor and offer are fictional.'));
}catch(e){check('run',false,String(e.stack||e))}
finally{try{chrome?.kill()}catch{}server.kill()}
const result={ranAt:new Date().toISOString(),what:'Sponsored placements in headless Chrome against accounts-local-server.mjs (real accounts and app worker code, in-memory SQLite, no email, no payments)',passed:!failed,checks};
fs.writeFileSync(path.join(outDir,'sponsorships.json'),JSON.stringify(result,null,1)+'\n');
console.log(JSON.stringify({passed:result.passed,checks:checks.length,failed:checks.filter(c=>!c.ok).map(c=>c.check),evidence:outDir}));
if(failed)process.exitCode=1;
