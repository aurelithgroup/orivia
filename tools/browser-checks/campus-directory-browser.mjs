// The campus directory (area 23) in a real browser against the real local server: the student's view in the app's
// university space (/space/<id>), the same space once the organisation is a demo one, and the staff editor's preview.
// It starts accounts-local-server.mjs itself and replays campus-directory-local.mjs first, so anyone can rerun it.
// Usage: node --experimental-sqlite tools/browser-checks/campus-directory-browser.mjs [outDir]   (CHROME=<path> to pick Chrome)
import {spawn,spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const outDir=process.argv[2]||fs.mkdtempSync(path.join(os.tmpdir(),'directory-'));fs.mkdirSync(outDir,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),here=p=>new URL(p,import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1');
const port=String(19800+Math.floor(Math.random()*400)),base='http://localhost:'+port,debug=9800+Math.floor(Math.random()*150);
const server=spawn(process.execPath,['--experimental-sqlite',here('accounts-local-server.mjs'),port],{stdio:['ignore','pipe','pipe']});
const chromePath=process.env.CHROME||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':'google-chrome');
let chrome;const checks=[];let failed=false;
const check=(name,ok,detail)=>{checks.push({check:name,ok:!!ok,...(detail!==undefined?{detail}:{})});if(!ok){failed=true;console.error('FAILED: '+name,detail??'')}};
try{
 for(let i=0;i<100;i++){try{await fetch(base+'/__dev/sql?t=organisations');break}catch{await sleep(100)}}
 const replayOut=path.join(outDir,'replay.json'),replay=spawnSync(process.execPath,[here('campus-directory-local.mjs'),base,replayOut],{encoding:'utf8'});
 const r=JSON.parse(fs.readFileSync(replayOut,'utf8'));check('Replay of staff editing, visibility and boundaries ('+r.steps.length+' steps)',r.passed,r.failed||replay.stderr);
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
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
 // The student opens the university space in the app, passing the app's own first-run screens as a person would.
 const openSpace=async()=>{await go(base+'/space/'+oid,3500);for(let i=0;i<10;i++){if(await js("!!document.getElementById('campus-directory')"))break;await sleep(700);
  await js("(()=>{for(const c of document.querySelectorAll('#account-entry input[type=checkbox]'))c.checked=true})()");for(const b of ['Not now','Start without importing','Let’s get started','Continue'])if(await press(b)){await sleep(1800);break}}
  await sleep(800)};
 const directory=()=>js("(()=>{const g=document.getElementById('campus-directory');if(!g)return null;return {text:g.innerText,links:[...g.querySelectorAll('a')].map(a=>({label:a.textContent,href:a.href}))}})()");
 await go(base+'/__dev/as?name=student',800);await openSpace();await snap('student-directory');
 const d1=await directory();
 check('The student’s university space has a Campus directory',!!d1,await js("document.body.innerText.slice(0,400)"));
 const t1=d1?.text||'';
 check('Entries are sorted by category (Library before Printing)',t1.indexOf('Main library')>-1&&t1.indexOf('Main library')<t1.indexOf('Print and copy centre'));
 check('Known details are shown',['Where: Building A, Ground floor, room A0.12','Opening: Sunday to Thursday, 8:00 to 20:00 in exam weeks','Accessibility: Step-free entrance','Directions: From the main gate','Checked by Northbay University on 2026-10-29'].every(x=>t1.includes(x)),t1);
 check('Unknown details stay unknown',t1.includes('Opening: not provided')&&t1.includes('Accessibility: not provided. Ask the service before you go')&&t1.includes('Not dated by Northbay University'));
 check('The draft entry is not shown',!t1.includes('Health centre'));
 check('Map links only for the entry with an address',d1?.links.filter(l=>/maps/.test(l.href)).length===2&&d1.links.some(l=>l.href.startsWith('https://www.google.com/maps/search/?api=1&query=Building+A')),d1?.links);
 check('Source page link',d1?.links.some(l=>l.href==='https://northbay.example/printing'));
 // As a demo organisation, the same places are labelled fictional and get no map links.
 await fetch(base+'/__dev/demo?org='+oid);await openSpace();await snap('student-directory-demo');
 const d2=await directory();
 check('Demo: labelled fictional',(d2?.text||'').includes('Demo organisation: these places, hours and numbers are fictional.'));
 check('Demo: no map links',!(d2?.links||[]).some(l=>/maps/.test(l.href)),d2?.links);
 // Staff: the editor's directory fields and the student preview.
 await send('Emulation.setDeviceMetricsOverride',{width:1280,height:2400,deviceScaleFactor:1,mobile:false});
 await go(base+'/__dev/as?name=admin',800);await go(base+'/platform?org='+oid,3000);
 await js("[...document.querySelectorAll('[role=tab]')].find(b=>b.textContent.trim()==='Guides and information').click()");await sleep(1500);
 const pv=await js(`(async()=>{const s=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}))};s('c-kind','contact');s('c-title','IT help desk');s('c-body','Wi-Fi, accounts and laptops.');s('d-cat','it');s('d-building','Building A');s('d-address','Building A, Northbay University');s('d-phone','+971 4 000 0000');
  document.getElementById('preview-student').click();await new Promise(r=>setTimeout(r,400));const p=document.getElementById('student-preview');p.scrollIntoView();return {card:p.innerText}})()`);
 await snap('staff-preview');
 check('Staff preview: unknown opening and accessibility shown as not provided',(pv?.card||'').includes('Opening: not provided')&&pv.card.includes('Accessibility: not provided'),pv);
 check('Staff preview: a demo organisation’s number is not callable and map links are off',pv?.card.includes('Demo number (not callable): +971 4 000 0000')&&pv.card.includes('Demo organisation: map links are off')&&!pv.card.includes('Directions in Google Maps'));
 check('Staff preview: asks for a “last checked” date',pv?.card.includes('No “last checked” date'));
 const saved=(await (await fetch(base+'/__dev/sql?t=organisation_content')).json()).some(c=>c.title==='IT help desk');
 check('The preview saved nothing',!saved);
}catch(e){check('run',false,String(e.stack||e))}
finally{try{chrome?.kill()}catch{}server.kill()}
const result={ranAt:new Date().toISOString(),what:'Campus directory in headless Chrome against accounts-local-server.mjs (real accounts and app worker code, in-memory SQLite, no email, no AI)',passed:!failed,checks};
fs.writeFileSync(path.join(outDir,'directory.json'),JSON.stringify(result,null,1)+'\n');
console.log(JSON.stringify({passed:result.passed,checks:checks.length,failed:checks.filter(c=>!c.ok).map(c=>c.check),evidence:outDir}));
if(failed)process.exitCode=1;
