// Phone-size screenshots of the local harness through Chrome's DevTools protocol (no extra packages).
// Usage: node cdp-shoot.mjs <outDir> <jobs.json>   jobs: [{name, path, js?, wait?}]
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const [outDir,jobsFile]=process.argv.slice(2);const jobs=JSON.parse(fs.readFileSync(jobsFile,'utf8'));fs.mkdirSync(outDir,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'cdp-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run','--no-default-browser-check','--autoplay-policy=no-user-gesture-required','--remote-debugging-port=9333','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let ws;for(let i=0;i<50;i++){try{const list=await (await fetch('http://127.0.0.1:9333/json')).json();const pg=list.find(t=>t.type==='page');if(pg){ws=new WebSocket(pg.webSocketDebuggerUrl);break}}catch(_){}await sleep(200)}
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}});
const send=(method,params={})=>new Promise(r=>{const i=++id;pending.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
await send('Page.enable');await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
for(const job of jobs){
 // Fresh state for each screen: clear the origin's storage, then load.
 await send('Emulation.setDeviceMetricsOverride',{width:job.width||390,height:job.height||844,deviceScaleFactor:job.width>600?1:2,mobile:!(job.width>600)});
 if(!job.keep)await send('Storage.clearDataForOrigin',{origin:'http://localhost:8793',storageTypes:'all'});
 await send('Page.navigate',{url:'http://localhost:8793/'+(job.path||'')});await sleep(job.wait||2500);
 if(job.js){const r=await send("Runtime.evaluate",{expression:job.js,awaitPromise:true});console.log(job.name,'result',JSON.stringify(r.result?.result?.value));if(r.result?.exceptionDetails)console.log(job.name,'js error',JSON.stringify(r.result.exceptionDetails.exception?.description||r.result.exceptionDetails).slice(0,400));await sleep(job.after||800)}
 // Optional follow-up on the same page (e.g. after the job reloaded it), without navigating again.
 if(job.check){const r=await send("Runtime.evaluate",{expression:job.check,awaitPromise:true});console.log(job.name,"check result",JSON.stringify(r.result?.result?.value))}
 const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(outDir,job.name+'.png'),Buffer.from(shot.result.data,'base64'));console.log('saved',job.name);
}
ws.close();chrome.kill();try{fs.rmSync(profile,{recursive:true,force:true})}catch(_){}
