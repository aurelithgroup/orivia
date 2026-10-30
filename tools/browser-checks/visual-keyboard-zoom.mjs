// Local visual, keyboard and 200% zoom checks of the new screens, in headless Chrome against the real local server.
// For each screen: horizontal overflow at 100% and 200% zoom, a keyboard pass (Tab order, a visible focus indicator,
// no focus trap; the photo dialog keeps focus inside and closes with Escape) and an approximate text contrast scan,
// with screenshots for a person to look at.
// LIMITS (also written into the output): 200% zoom is emulated by halving the CSS viewport (how browser zoom reflows a
// page), not by a real browser zoom or OS text size; contrast is computed against the nearest solid background and
// ignores images and gradients; this is Chrome only, not Safari/Firefox or real phones; it is not a screen reader.
// Usage: node --experimental-sqlite tools/browser-checks/visual-keyboard-zoom.mjs [outDir]   (CHROME=<path> to pick Chrome)
import {spawn,spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const outDir=process.argv[2]||fs.mkdtempSync(path.join(os.tmpdir(),'vkz-'));fs.mkdirSync(outDir,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),here=p=>new URL(p,import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1');
const port=String(22000+Math.floor(Math.random()*300)),base='http://localhost:'+port,debug=9600+Math.floor(Math.random()*90);
const server=spawn(process.execPath,['--experimental-sqlite',here('accounts-local-server.mjs'),port],{stdio:['ignore','pipe','pipe']});
const chromePath=process.env.CHROME||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':'google-chrome');
const results=[];let chrome;
try{
 for(let i=0;i<100;i++){try{await fetch(base+'/__dev/sql?t=organisations');break}catch{await sleep(100)}}
 // Fictional data from the existing replays: the workflow (support), the directory and the sponsorships.
 const orgs={};for(const s of ['university-workflow-local','campus-directory-local','sponsorships-local']){const out=path.join(outDir,s+'.json');spawnSync(process.execPath,[here(s+'.mjs'),base,out]);const r=JSON.parse(fs.readFileSync(out,'utf8'));orgs[s]=r.organisationId||(await (await fetch(base+'/__dev/sql?t=organisations')).json()).find(o=>o.name==='Northbay University').id}
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'cdp-'));
 chrome=spawn(chromePath,['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run','--no-default-browser-check','--remote-debugging-port='+debug,'--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
 let ws;for(let i=0;i<75&&!ws;i++){try{const pg=(await (await fetch('http://127.0.0.1:'+debug+'/json')).json()).find(t=>t.type==='page');if(pg)ws=new WebSocket(pg.webSocketDebuggerUrl)}catch{}if(!ws)await sleep(200)}
 await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let n=0;const waiting=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&waiting.has(m.id)){waiting.get(m.id)(m);waiting.delete(m.id)}});
 const send=(method,params={})=>new Promise(r=>{const i=++n;waiting.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
 const js=async expr=>(await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true})).result?.result?.value;
 const go=async(url,wait=3000)=>{await send('Page.navigate',{url});await sleep(wait)};
 const size=(w,h)=>send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<600});
 const press=label=>js(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(label)}&&b.offsetParent&&!b.disabled);if(!b)return false;b.click();return true})()`);
 const tabKey=(shift=false)=>send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,modifiers:shift?8:0}).then(()=>send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9}));
 const key=(k,code,vk)=>send('Input.dispatchKeyEvent',{type:'keyDown',key:k,code,windowsVirtualKeyCode:vk}).then(()=>send('Input.dispatchKeyEvent',{type:'keyUp',key:k,code,windowsVirtualKeyCode:vk}));
 const snap=async name=>{const d=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(outDir,name+'.png'),Buffer.from(d.result.data,'base64'))};
 const enterApp=async()=>{for(let i=0;i<10;i++){if(await js("!document.getElementById('workspace')?.hidden&&document.getElementById('account-entry')?.hidden!==false"))return true;await js("(()=>{for(const c of document.querySelectorAll('#account-entry input[type=checkbox], #consent'))c.checked=true})()");for(const b of ['Not now','Continue as a guest','Start without importing','Let’s get started','Start trial'])if(await press(b)){await sleep(1500);break}await sleep(400)}return false};
 // Measurements run in the page.
 const overflow=`(()=>{const W=document.documentElement.clientWidth,doc=document.documentElement.scrollWidth-W;const out=[];for(const e of document.querySelectorAll('body *')){if(!e.offsetParent&&getComputedStyle(e).position!=='fixed')continue;const r=e.getBoundingClientRect();if(r.width&&r.right>W+1&&!e.closest('[style*="overflow"],pre,table,.view,dialog canvas,canvas')){out.push((e.tagName+'.'+(e.className||'')).slice(0,40)+' '+Math.round(r.right-W)+'px');if(out.length>6)break}}return {pageOverflowPx:Math.max(0,doc),elementsPastEdge:out}})()`;
 const contrast=`(()=>{const rgb=s=>{const m=s.match(/[\\d.]+/g);return m?m.map(Number):[0,0,0,0]},lum=([r,g,b])=>{const f=c=>{c/=255;return c<=.03928?c/12.92:((c+.055)/1.055)**2.4};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
  const bg=e=>{for(let x=e;x;x=x.parentElement){const c=rgb(getComputedStyle(x).backgroundColor);if(c.length<4||c[3]>.9)return c.slice(0,3)}return [255,255,255]};const low=[];let checked=0;
  for(const e of document.querySelectorAll('p,span,a,button,label,h1,h2,h3,h4,li,small,strong,summary,th,td')){if(!e.offsetParent||!e.childNodes.length||![...e.childNodes].some(t=>t.nodeType===3&&t.textContent.trim()))continue;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||+cs.opacity<.5)continue;checked++;const a=lum(rgb(cs.color).slice(0,3)),b=lum(bg(e)),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),px=parseFloat(cs.fontSize),large=px>=24||(px>=18.66&&+cs.fontWeight>=700);if(ratio<(large?3:4.5))low.push(e.textContent.trim().slice(0,40)+' '+ratio.toFixed(2)+(large?' (large)':''));if(checked>400)break}return {checked,low:[...new Set(low)].slice(0,12),lowCount:low.length}})()`;
 const focusInfo=`(()=>{const e=document.activeElement;if(!e||e===document.body)return null;const cs=getComputedStyle(e),r=e.getBoundingClientRect();return {name:(e.getAttribute('aria-label')||e.textContent||e.value||e.placeholder||e.tagName).trim().replace(/\\s+/g,' ').slice(0,40),tag:e.tagName,indicator:(cs.outlineStyle!=='none'&&parseFloat(cs.outlineWidth)>0)||cs.boxShadow!=='none',onScreen:r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth,inDialog:!!e.closest('dialog')}})()`;
 async function keyboard(stops=30){await js('document.activeElement?.blur();window.scrollTo(0,0)');const seen=[];for(let i=0;i<stops;i++){await tabKey();await sleep(60);const f=await js(focusInfo);if(!f)continue;seen.push(f)}
  const names=seen.map(s=>s.tag+':'+s.name);const unique=new Set(names).size;return {stops:seen.length,unique,withoutIndicator:seen.filter(s=>!s.indicator).map(s=>s.tag+':'+s.name).slice(0,8),offScreen:seen.filter(s=>!s.onScreen).map(s=>s.name).slice(0,5),trapped:seen.length>8&&unique<=2,order:names.slice(0,12)}}
 const screens=[
  {name:'staff-support',as:'admin',url:()=>base+'/platform?org='+orgs['university-workflow-local'],then:"(async()=>{[...document.querySelectorAll('[role=tab]')].find(b=>b.textContent.trim()==='Support')?.click();await new Promise(r=>setTimeout(r,1500))})()"},
  {name:'staff-guides-preview',as:'admin',url:()=>base+'/platform?org='+orgs['campus-directory-local'],then:"(async()=>{[...document.querySelectorAll('[role=tab]')].find(b=>b.textContent.trim()==='Guides and information')?.click();await new Promise(r=>setTimeout(r,1500));const k=document.getElementById('c-kind');k.value='contact';k.dispatchEvent(new Event('change'));document.getElementById('c-title').value='IT help desk';document.getElementById('c-body').value='Wi-Fi and accounts.';document.getElementById('d-building').value='Building A';document.getElementById('preview-student').click();await new Promise(r=>setTimeout(r,400))})()"},
  {name:'owner-manage',as:'owner',url:()=>base+'/manage'},
  {name:'student-platform',as:'student',url:()=>base+'/platform?org='+orgs['sponsorships-local']},
  {name:'app-directory',as:'student',app:true,url:()=>base+'/space/'+orgs['campus-directory-local']},
  {name:'app-sponsored',as:'student',app:true,url:()=>base+'/space/'+orgs['sponsorships-local']},
  {name:'app-guide-step',app:true,url:()=>base+'/',then:"(async()=>{await openGuide('dubai.school',{stepId:'start'});await new Promise(r=>setTimeout(r,800))})()"},
 ];
 for(const s of screens){
  await send('Storage.clearDataForOrigin',{origin:base,storageTypes:'all'});
  if(s.as)await go(base+'/__dev/as?name='+s.as,800);
  const r={screen:s.name,widths:{}};
  for(const [label,w,h] of [['desktop 100%',1280,900],['desktop 200% (640 CSS px)',640,450],['phone 100%',390,844],['phone 200% (195 CSS px)',195,422]]){
   await size(w,h);await go(s.url(),3000);if(s.app)r.enteredApp=await enterApp();if(s.then)await js(s.then);await sleep(400);
   r.widths[label]=await js(overflow);await snap(s.name+'-'+w);
   if(w===390){r.keyboard=await keyboard();r.contrast=await js(contrast)}
  }
  results.push(r);console.log(s.name,JSON.stringify(r.widths['phone 200% (195 CSS px)']),'kb',r.keyboard?.stops,'noIndicator',r.keyboard?.withoutIndicator.length,'lowContrast',r.contrast?.lowCount);
 }
 // The photo review dialog: focus stays inside while open, Escape closes it.
 await send('Storage.clearDataForOrigin',{origin:base,storageTypes:'all'});await size(390,844);await go(base+'/',3000);await enterApp();
 await js("(async()=>{const c=document.createElement('canvas');c.width=1200;c.height=1600;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,1200,1600);g.fillStyle='#000';g.font='40px serif';for(let y=60;y<1600;y+=60)g.fillText('Fictional test text 0123456789',20,y);const b=await new Promise(r=>c.toBlob(r,'image/jpeg',.9));window.__photo=window.OriviaImageReview.review(new File([b],'t.jpg',{type:'image/jpeg'}),{}).then(v=>window.__photoResult=v===null?'closed':'used')})()");await sleep(800);
 const dlg={keyboard:await keyboard(14)};dlg.focusStayedInside=(await js("!!document.activeElement?.closest('dialog')"));await snap('photo-dialog-390');
 for(const [label,w,h] of [['phone 200% (195 CSS px)',195,422]]){await size(w,h);await sleep(300);dlg[label]=await js(overflow);await snap('photo-dialog-195')}
 await key('Escape','Escape',27);await sleep(500);dlg.escapeCloses=(await js("!document.querySelector('dialog[open]')&&window.__photoResult==='closed'"));dlg.contrast=null;
 results.push({screen:'photo-dialog',...dlg});console.log('photo-dialog',JSON.stringify(dlg).slice(0,400));
}catch(e){results.push({error:String(e.stack||e)});console.error(e)}
finally{try{chrome?.kill()}catch{}server.kill()}
const out={ranAt:new Date().toISOString(),limits:['200% zoom emulated by halving the CSS viewport width (how browser zoom reflows); not a real browser zoom or OS text-size setting','Contrast computed against the nearest solid background; images, gradients and overlays ignored; a person must confirm','Chrome only; not Safari, Firefox or real phones','Keyboard checked with Tab and Escape only; not a screen reader','Screenshots need a person’s visual judgement'],results};
fs.writeFileSync(path.join(outDir,'visual-keyboard-zoom.json'),JSON.stringify(out,null,1)+'\n');console.log('written',outDir);
