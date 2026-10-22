// Local design harness: the real Orivia app (createTrialWorker) in guest mode on http://localhost:8793, with sample data.
// No AI, no accounts, no network calls out. For screenshots only. Usage: node app-harness.mjs <repo> [after.css]
import http from 'node:http';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const repo=process.argv[2],afterCss=process.argv[3];
const {createTrialWorker}=await import(pathToFileURL(repo+'/workers/orivia-ai-private-trial.mjs').href);
const worker=createTrialWorker();
const env={PRIVATE_HOST:'app.localhost',ACCESS_TEST_EMAIL:'designer@example.test',RESEARCH_ENABLED:'0'};
const ctx={access:{getIdentity:async()=>({email:'designer@example.test'})},waitUntil(){}};
const day=n=>{const d=new Date();d.setDate(d.getDate()+n);d.setHours(10,0,0,0);return d.toISOString()};
const seed=`(function(){try{
 if(localStorage.getItem('harness-seeded'))return;
 localStorage.setItem('orivia-entry-consent','private-entry-v1');sessionStorage.setItem('orivia-ai-private-consent','yes');
 localStorage.setItem('orivia-private-profile-v1',JSON.stringify({city:'Sharjah',who:'Study',place:'Northbay University',use:true}));
 localStorage.setItem('orivia-private-events-v1',JSON.stringify([{id:'e1',title:'Emirates ID biometrics appointment',at:'${day(2)}',alarm:60},{id:'e2',title:'Open a bank account',at:'${day(5)}',alarm:30},{id:'e3',title:'Orientation week starts',at:'${day(9)}',alarm:1440}]));
 const t=Date.now();localStorage.setItem('orivia-private-chats-v1',JSON.stringify({active:'c1',chats:[
  {id:'c1',title:'Emirates ID after arriving',created:t-86400000,updated:t-3600000,turns:[{role:'user',content:'I just arrived in Sharjah on a student visa. When do I need to do my Emirates ID?'},{role:'assistant',content:'After your residence visa is issued, you complete Emirates ID biometrics at an ICP service centre. Your university usually books the medical test and biometrics for you, so check the international office first.\\n\\nNext step: ask the international office which date they booked for your biometrics, and bring your passport and the visa approval.'}]},
  {id:'c2',title:'Bank account without Emirates ID',created:t-172800000,updated:t-172800000,turns:[{role:'user',content:'Can I open a bank account before I get my Emirates ID?'},{role:'assistant',content:'Some UAE banks let students start an account with a passport and visa page, then add the Emirates ID later. Ask the bank which documents they accept before you go.'}]},
  {id:'c3',title:'Getting to campus by bus',created:t-259200000,updated:t-259200000,turns:[{role:'user',content:'How do I get from Al Nahda to campus by bus?'},{role:'assistant',content:'The map app will show the current bus routes and times from Al Nahda. Open it with your campus as the destination.'}]}]}));
 localStorage.setItem('harness-seeded','1');
}catch(e){}
 // ?view=library|chat|mylife|calendar|settings opens that screen; ?scroll=N scrolls it; ?drawer=1 opens the chat list.
 const q=new URLSearchParams(location.search);addEventListener('load',()=>setTimeout(()=>{try{const v=q.get('view');if(v)window.oriviaGo?.(v);setTimeout(()=>{const n=Number(q.get('scroll')||0);if(n){const el=[...document.querySelectorAll('.view:not([hidden]) .life-scroll,.view:not([hidden]),#chat-scroll,main')].find(e=>e.scrollHeight>e.clientHeight);(el||document.scrollingElement).scrollTop=n;window.scrollTo(0,n)}if(q.get('drawer'))document.getElementById('open-chats')?.click()},300)}catch(e){}},700));
})();`;
let voiceCount=0;
function silentWav(seconds){const rate=8000,n=Math.round(rate*seconds),b=Buffer.alloc(44+n*2);b.write('RIFF',0);b.writeUInt32LE(36+n*2,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);return b}
const server=http.createServer(async(req,res)=>{
 try{
  const url='http://localhost:8793'+req.url;
  if(req.url.startsWith('/__seed.js')){res.writeHead(200,{'content-type':'text/javascript'});return res.end(seed)}
  const body=['GET','HEAD'].includes(req.method)?undefined:await new Promise(r=>{const c=[];req.on('data',d=>c.push(d));req.on('end',()=>r(Buffer.concat(c)))});
  // HARNESS_VOICE=<ms>: offer the natural voice and answer /v1/voice after <ms> with half a second of silence (no OpenAI).
  // /__voice-count says how many voice requests arrived, so duplicate generation is visible.
  if(process.env.HARNESS_VOICE){
   if(req.url==='/__voice-count'){res.writeHead(200,{'content-type':'application/json'});return res.end(JSON.stringify({count:voiceCount}))}
   if(req.url.startsWith('/v1/voice')){voiceCount++;await new Promise(r=>setTimeout(r,Number(process.env.HARNESS_VOICE)||400));res.writeHead(200,{'content-type':'audio/wav'});return res.end(silentWav(0.5))}
   if(req.url.startsWith('/v1/config')){const r=await worker.fetch(new Request('https://app.localhost/v1/config'),env,ctx);const d=await r.json();d.naturalVoice=true;d.providerPilot={provider:'OpenAI',consent:'harness-consent-v1',text:'Harness only.',agree:'I agree'};res.writeHead(200,{'content-type':'application/json'});return res.end(JSON.stringify(d))}
  }
  const h={...req.headers};if(h.origin)h.origin='https://app.localhost';delete h.host;
  const r=await worker.fetch(new Request('https://app.localhost'+req.url,{method:req.method,headers:h,body}),env,ctx);
  const headers={};r.headers.forEach((v,k)=>{if(!/content-security-policy|content-length|content-encoding/i.test(k))headers[k]=v});
  let out=Buffer.from(await r.arrayBuffer());
  if(String(headers['content-type']).startsWith('text/html')){let html=out.toString('utf8').replace('<head>','<head><script src="/__seed.js"></script>');
   const css=new URL(url).searchParams.get('after')&&afterCss?fs.readFileSync(afterCss,'utf8'):'';if(css)html=html.replace('</head>','<style id="after">'+css+'</style></head>');out=Buffer.from(html)}
  res.writeHead(r.status,headers);res.end(out);
 }catch(e){res.writeHead(500);res.end(String(e&&e.stack||e))}
});
server.listen(8793,()=>console.log('harness on http://localhost:8793'));
