// Guide step caveats on the actual served route and in the actual renderer: /v1/guides/<id> from the app worker
// (guideContent) carries viaSearch and translationPending, and the app's guide view (openGuide in chat.js) shows them
// before the step's instructions: "checked only through search" always, "not reviewed in your language" only in that
// language. Starts accounts-local-server.mjs itself; headless Chrome; anyone can rerun it.
// Usage: node --experimental-sqlite tools/browser-checks/guide-caveats-browser.mjs [outDir]   (CHROME=<path> to pick Chrome)
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const outDir=process.argv[2]||fs.mkdtempSync(path.join(os.tmpdir(),'caveats-'));fs.mkdirSync(outDir,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),here=p=>new URL(p,import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1');
const port=String(21600+Math.floor(Math.random()*300)),base='http://localhost:'+port,debug=9700+Math.floor(Math.random()*90);
const server=spawn(process.execPath,['--experimental-sqlite',here('accounts-local-server.mjs'),port],{stdio:['ignore','pipe','pipe']});
const chromePath=process.env.CHROME||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':'google-chrome');
let chrome;const checks=[];let failed=false;
const check=(name,ok,detail)=>{checks.push({check:name,ok:!!ok,...(detail!==undefined?{detail}:{})});if(!ok){failed=true;console.error('FAILED: '+name,detail??'')}};
try{
 for(let i=0;i<100;i++){try{await fetch(base+'/__dev/sql?t=organisations');break}catch{await sleep(100)}}
 // 1. The served route.
 const get=async id=>(await (await fetch(base+'/v1/guides/'+id)).json()).guide;
 const dubai=await get('dubai.school'),edi=await get('edinburgh.school'),nol=await get('dubai.nol');
 const step=(g,id)=>g?.steps.find(s=>s.id===id);
 check('Served: Dubai school start and return carry viaSearch',['start','return'].every(id=>step(dubai,id)?.viaSearch==='2026-10-29'),dubai?.steps.map(s=>[s.id,s.viaSearch]));
 check('Served: both school guides’ new steps carry translationPending: ar',[dubai,edi].every(g=>['start','return'].every(id=>JSON.stringify(step(g,id)?.translationPending)==='["ar"]')));
 check('Served: Edinburgh’s directly read steps carry no viaSearch',!edi?.steps.some(s=>s.viaSearch));
 check('Served: an unaffected step carries neither',!('viaSearch' in (step(dubai,'choose')||{}))&&!('translationPending' in (step(dubai,'choose')||{})));
 check('Served: a qualified step elsewhere keeps its marker (nol has none; the Ejari step has ar)',!nol?.steps.some(s=>s.translationPending)&&JSON.stringify(step(await get('dubai.rent'),'ejari')?.translationPending)==='["ar"]');
 // 2. The renderer, in the real app page.
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'cdp-'));
 chrome=spawn(chromePath,['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run','--no-default-browser-check','--remote-debugging-port='+debug,'--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
 let ws;for(let i=0;i<75&&!ws;i++){try{const pg=(await (await fetch('http://127.0.0.1:'+debug+'/json')).json()).find(t=>t.type==='page');if(pg)ws=new WebSocket(pg.webSocketDebuggerUrl)}catch{}if(!ws)await sleep(200)}
 await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let n=0;const waiting=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&waiting.has(m.id)){waiting.get(m.id)(m);waiting.delete(m.id)}});
 const send=(method,params={})=>new Promise(r=>{const i=++n;waiting.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
 const js=async expr=>(await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true})).result?.result?.value;
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:390,height:1600,deviceScaleFactor:2,mobile:true});
 await send('Page.navigate',{url:base+'/'});await sleep(3500);
 // Into the app as a person would: continue as a guest, accept the pilot terms and the AI choice, answer the notifications offer.
 const press=label=>js('(()=>{const b=[...document.querySelectorAll("button")].find(b=>b.textContent.trim()==='+JSON.stringify(label)+'&&b.offsetParent&&!b.disabled);if(!b)return false;b.click();return true})()');
 for(let i=0;i<8;i++){if(await js("!document.getElementById('workspace')?.hidden&&document.getElementById('account-entry')?.hidden!==false"))break;await js("(()=>{for(const c of document.querySelectorAll('#account-entry input[type=checkbox], #consent'))c.checked=true})()");for(const b of ['Not now','Continue as a guest','Let’s get started','Start trial'])if(await press(b)){await sleep(1500);break}}
 check('Entered the app as a guest through its own screens',await js("!document.getElementById('workspace')?.hidden"));
 let shot=0;const snap=async name=>{const d=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(outDir,String(++shot).padStart(2,'0')+'-'+name+'.png'),Buffer.from(d.result.data,'base64'))};
 const open=(id,stepId,lang)=>js(`(async()=>{window.OriviaI18n?.setLanguage?.(${JSON.stringify(lang)});await openGuide(${JSON.stringify(id)},{stepId:${JSON.stringify(stepId)}});await new Promise(r=>setTimeout(r,800));
  const card=document.querySelector('#guide-body section.step');if(!card)return null;card.scrollIntoView();const visible=card.getBoundingClientRect().height>0&&!!card.offsetParent;const kids=[...card.children],idx=sel=>kids.findIndex(k=>k.matches?.(sel));
  return {title:card.querySelector('h3')?.textContent,viaSearch:card.querySelector('[data-caveat=via-search]')?.textContent||null,pending:card.querySelector('[data-caveat=translation-pending]')?.textContent||null,
   caveatBeforeInstructions:Math.max(idx('[data-caveat]'),0)<idx('section.blk'),firstBlock:card.querySelector('section.blk h4')?.textContent,lang:document.documentElement.lang,dir:document.documentElement.dir,visible,englishLineDirection:getComputedStyle([...card.querySelectorAll('section.blk p')].find(p=>/^[A-Za-z]/.test(p.textContent))||card).direction,arabicNoteDirection:getComputedStyle(card.querySelector('[data-caveat]')||card).direction}})()`);
 const enStart=await open('dubai.school','start','en');await snap('dubai-start-en');
 check('Renderer (English): the via-search note is shown on the Dubai step',/^Checked only through search results that quote the official pages, not by reading them directly \(2026-10-29\)\. Confirm with the organisation before you act\.$/.test(enStart?.viaSearch||''),enStart);
 check('Renderer (English): no translation note in English',enStart?.pending===null);
 check('Renderer: the guide is visible on screen',enStart?.visible===true,enStart);
 check('Renderer: the note comes before the step’s instructions',enStart?.caveatBeforeInstructions===true,enStart);
 const arStart=await open('dubai.school','start','ar');await snap('dubai-start-ar');
 check('Renderer (Arabic): both notes, in Arabic',!!arStart?.viaSearch&&/تم التحقق فقط/.test(arStart.viaSearch)&&/لم تُراجع هذه الخطوة بلغتك بعد/.test(arStart?.pending||''),arStart);
 check('Renderer (Arabic interface): English guide lines run left to right, Arabic notes right to left',arStart?.englishLineDirection==='ltr'&&arStart?.arabicNoteDirection==='rtl',arStart);
 const arEdi=await open('edinburgh.school','start','ar');
 check('Renderer (Arabic): Edinburgh step has the translation note but no via-search note',arEdi?.viaSearch===null&&!!arEdi?.pending,arEdi);
 const arChoose=await open('dubai.school','choose','ar');
 check('Renderer: an unaffected step shows neither note',arChoose?.viaSearch===null&&arChoose?.pending===null,arChoose);
 await js("window.OriviaI18n?.setLanguage?.('en')");
}catch(e){check('run',false,String(e.stack||e))}
finally{try{chrome?.kill()}catch{}server.kill()}
const result={ranAt:new Date().toISOString(),what:'Guide step caveats: /v1/guides from the app worker (guideContent) and the app’s guide view (openGuide), in headless Chrome against accounts-local-server.mjs',passed:!failed,checks};
fs.writeFileSync(path.join(outDir,'caveats.json'),JSON.stringify(result,null,1)+'\n');
console.log(JSON.stringify({passed:result.passed,checks:checks.length,failed:checks.filter(c=>!c.ok).map(c=>c.check),evidence:outDir}));
if(failed)process.exitCode=1;
