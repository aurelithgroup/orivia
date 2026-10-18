/* Browser directory tool against a scripted fake browser (SCRIPTED FIXTURE, not a live run).
   The fake renders SPEA-shaped cards and a "from-to of total" counter, and can lag, under-render, time out or navigate away.
   Run: node tests/browser-directory.test.mjs */
import assert from 'node:assert/strict';
import {listDirectory,speaListFiltered,DIRECTORY_RECIPES} from '../workers/orivia-browser-directory.mjs';
import {runAgentTurn} from '../workers/orivia-research-agent.mjs';
import {REGULATORS} from '../workers/orivia-research-loop.mjs';

const P='/en/education-institutes/schools/';
const ALL=Array.from({length:136},(_,i)=>({name:'Synthetic School '+(i+1),slug:'synthetic-school-'+(i+1),curriculum:i%5===0?'British':i%5===1?'American':'Indian'}));
const BRITISH=ALL.filter(s=>s.curriculum==='British'); // 28
const card=s=>`<li><div><a href="${P+s.slug}"><h3>${s.name}</h3></a><span>Sharjah - Al Nahda</span><span>Curriculum::${s.curriculum}</span><span>Learn More</span></div></li>`;

/** opts: lagPolls (counter updates this many reads before the cards), renderCap (cards actually drawn), neverLoad, navAway, closeFails, requests */
function fakeBrowser(opts={}){
 const log={closed:0,clicks:[],gotos:[],requests:[],aborted:[],continued:[],evaluated:[]};
 let filter=null,rows=10,page=0,pending=0,handler=null,url='about:blank';
 const view=()=>{const list=filter?ALL.filter(s=>s.curriculum===filter):ALL;const start=page*rows;
  const shown=list.slice(start,start+rows).slice(0,opts.renderCap??Infinity);
  const counter=`${start+1}-${Math.min(start+rows,list.length)} of ${list.length}`;
  if(pending>0){pending--;const stale=ALL.slice(0,10);return {cards:stale,counter}} // counter ahead of the cards
  if(opts.neverLoad&&filter)return {cards:[],counter};
  return {cards:shown,counter}};
 const emit=r=>{const req={url:()=>r.url,method:()=>r.method||'GET',resourceType:()=>r.type||'xhr',isNavigationRequest:()=>!!r.nav,
  abort:()=>log.aborted.push(r.url),continue:()=>log.continued.push(r.url)};handler?.(req)};
 const pageObj={
  setRequestInterception:async v=>{log.interception=v},
  on:(ev,fn)=>{if(ev==='request')handler=fn},
  goto:async(u)=>{log.gotos.push(u);emit({url:u,type:'document',nav:true});for(const r of opts.requests||[])emit(r);url=u},
  url:()=>url,
  content:async()=>{const v=view();return `<main><h2>Schools</h2><ul>${v.cards.map(card).join('')}</ul><div><span>Rows Per Page</span><span>${rows}</span><span>${v.counter}</span></div></main>`},
  evaluate:async(fn,...args)=>{log.evaluated.push([fn.name,...args]);
   if(fn.name==='pageClickExact'){const [text,group]=args;log.clicks.push(text);
    if(opts.navAway&&text==='Apply Filter'){url='https://spea.shj.ae/en/news';return 'ok'}
    if(group==='Curriculum'){if(!['British','American','Indian'].includes(text))return 'not-found';filter=null;pageObj._sel=text;return 'ok'}
    if(text==='Apply Filter'){filter=pageObj._sel;page=0;pending=opts.lagPolls||0;return 'ok'}
    if(group==='Rows Per Page'){rows=+text;page=0;pending=opts.lagPolls||0;return 'ok'}
    return 'not-found'}
   if(fn.name==='pageClickNext'){page++;return 'ok'}
   throw Error('unexpected evaluate')}};
 return {log,launch:async()=>({newPage:async()=>pageObj,close:async()=>{log.closed++;if(opts.closeFails)throw Error('close')}})};
}
function fakeBudget(allow=true){const b={reserved:[],settled:[],reserve:async ms=>{b.reserved.push(ms);return allow?'tk':null},settle:async(t,ms)=>{b.settled.push([t,ms])}};return b}
const fast={pollMs:2,sessionMs:3000};

// 1. Counter ahead of the cards, twice: completeness only once the 28 actual cards match the 28 total
{const f=fakeBrowser({lagPolls:2}),b=fakeBudget();
 const r=await listDirectory({recipe:'spea',filter:{curriculum:'british'}},{launch:f.launch,budget:b,limits:fast});
 assert.equal(r.status,'ok');assert.equal(r.complete,true);assert.equal(r.total,28);assert.equal(r.items.length,28);assert.deepEqual(r.range,[1,28]);
 assert.ok(r.items.every(i=>i.fields.curriculum.value==='British'&&i.url.startsWith('https://spea.shj.ae'+P)),'only filtered cards, approved record URLs');
 assert.equal(new Set(r.items.map(i=>i.url)).size,28,'deduplicated');
 assert.deepEqual(f.log.clicks,['British','Apply Filter','100']);assert.equal(f.log.closed,1);
 assert.equal(b.reserved[0],3000,'reserved the session maximum before launch');assert.equal(b.settled.length,1);assert.ok(b.settled[0][1]>=0&&b.settled[0][1]<3000,'settled to actual time');
 assert.ok(f.log.interception);assert.deepEqual(f.log.gotos,['https://spea.shj.ae/en/education-institutes/schools']);}

// 2. Counter says 28 but only 25 cards render: never complete
{const f=fakeBrowser({renderCap:25}),r=await listDirectory({recipe:'spea',filter:{curriculum:'british'}},{launch:f.launch,budget:fakeBudget(),limits:fast});
 assert.equal(r.complete,false);assert.equal(r.status,'partial');assert.equal(r.items.length,25);assert.equal(r.total,28);}

// 3. Cards never load: timeout → partial with nothing claimed, session closed, time settled
{const f=fakeBrowser({neverLoad:true}),b=fakeBudget();const r=await listDirectory({recipe:'spea',filter:{curriculum:'british'}},{launch:f.launch,budget:b,limits:{pollMs:2,sessionMs:150}});
 assert.equal(r.status,'partial');assert.equal(r.reason,'cards-not-loaded');assert.equal(r.complete,false);assert.equal(r.items.length,0);assert.equal(f.log.closed,1);assert.equal(b.settled.length,1);}

// 4. Host, method, type and navigation checks
{const f=fakeBrowser({requests:[{url:'https://spea.shj.ae/_next/static/app.js',type:'script'},{url:'https://tracker.example/pixel.js',type:'script'},
  {url:'https://spea.shj.ae/logo.png',type:'image'},{url:'https://spea.shj.ae/api/subscribe',method:'POST'},{url:'https://evil.example/',type:'document',nav:true},{url:'http://spea.shj.ae/x',type:'script'}]});
 await listDirectory({recipe:'spea',filter:{curriculum:'british'}},{launch:f.launch,budget:fakeBudget(),limits:fast});
 assert.deepEqual(f.log.continued,['https://spea.shj.ae/en/education-institutes/schools','https://spea.shj.ae/_next/static/app.js']);
 assert.equal(f.log.aborted.length,5);}
{const f=fakeBrowser({requests:[{url:'https://cdn.example/x.js',type:'script'}]});const r=await listDirectory({recipe:'spea',filter:{curriculum:'british'}},{launch:f.launch,budget:fakeBudget(),limits:fast});
 assert.deepEqual(r.diagnostics.blockedHosts,['cdn.example'],'blocked hostnames reported (no paths, no content) so a reviewer can approve an asset host');}

// 5. Action leaves the directory page → stop, partial, closed
{const f=fakeBrowser({navAway:true}),r=await listDirectory({recipe:'spea',filter:{curriculum:'british'}},{launch:f.launch,budget:fakeBudget(),limits:fast});
 assert.equal(r.reason,'navigated-away');assert.equal(r.complete,false);assert.equal(f.log.closed,1);}

// 6. Allowance exhausted / unsupported filter / no binding: no browser launched at all
{let launched=0;const launch=async()=>{launched++};
 let r=await listDirectory({recipe:'spea',filter:{curriculum:'british'}},{launch,budget:fakeBudget(false)});assert.equal(r.status,'browser-allowance-exhausted');
 r=await listDirectory({recipe:'spea',filter:{curriculum:'Sharjah International Private School'}},{launch,budget:fakeBudget()});assert.equal(r.status,'unsupported-filter');
 r=await listDirectory({recipe:'spea',filter:{curriculum:'british'}},{budget:fakeBudget()});assert.equal(r.status,'browser-unavailable');
 assert.equal(launched,0);}

// 7. Launch fails (e.g. Browser Run rate limit) → partial, reservation settled with time used
{const b=fakeBudget();const r=await listDirectory({recipe:'spea',filter:{curriculum:'british'}},{launch:async()=>{throw Error('429')},budget:b,limits:fast});
 assert.equal(r.status,'partial');assert.equal(b.settled.length,1);assert.notEqual(b.settled[0][1],null);}

// 8. Close fails → keep the whole reservation (session may run to the platform timeout)
{const f=fakeBrowser({closeFails:true}),b=fakeBudget();await listDirectory({recipe:'spea',filter:{curriculum:'british'}},{launch:f.launch,budget:b,limits:fast});
 assert.equal(b.settled[0][1],null);}

// 9. Action limit bounds the session
{const f=fakeBrowser(),r=await listDirectory({recipe:'spea',filter:{curriculum:'british'}},{launch:f.launch,budget:fakeBudget(),limits:{...fast,actions:2}});
 assert.equal(r.reason,'action-limit');assert.equal(f.log.closed,1);}

// 10. Year asked: listing can't verify it → reported as an unapplied filter; the agent's answer says Year isn't confirmed
{const f=fakeBrowser(),b=fakeBudget();const spea={...REGULATORS.find(x=>x.id==='spea'),listFiltered:speaListFiltered({launch:f.launch,budget:b,limits:fast})};
 const understanding={research:true,intent:'all',topic:'school',location:{country:'uae',city:'Sharjah'},constraints:{curriculum:'british',year:6},organisations:[],source:'test'};
 const sent=[];const res=await runAgentTurn({messages:[{role:'user',content:'All British schools in Sharjah with Year 6 for my son Adam'}]},{},{understanding,regulator:spea,
  fetcher:async u=>{sent.push(String(u));return new Response('',{status:404})},reserve:async()=>true});
 assert.ok(f.log.evaluated.every(e=>!JSON.stringify(e).includes('Adam')),'nothing from the chat reaches the browser');
 assert.match(res.reply,/complete list/);assert.match(res.reply,/haven’t confirmed Year 6/);
 assert.ok(res.research.process.metrics.browserMs>=0);}

// 11. Long lists: a complete 28-school list is paged 8 at a time from regulator records; nothing silently cut, no repeats
{const f=fakeBrowser();const spea={...REGULATORS.find(x=>x.id==='spea'),listFiltered:speaListFiltered({launch:f.launch,budget:fakeBudget(),limits:fast})};
 const understanding=intent=>({research:true,intent,topic:'school',location:{country:'uae',city:'Sharjah'},constraints:{curriculum:'british'},organisations:[],source:'test'});
 const profile=slug=>{const s=ALL.find(x=>x.slug===slug);return s?`<main><h1>${s.name}</h1><span>Curriculum: ${s.curriculum}</span><span>Grade: KG1, 1, 2, 3, 4, 5, 6</span></main>`:''};
 const fetcher=async u=>{const m=String(u).match(/\/schools\/([a-z0-9-]+)$/);const h=m&&profile(m[1]);return new Response(h||'',{status:h?200:404,headers:{'content-type':'text/html'}})};
 const seen=new Set();let context=null,turns=0,last;
 do{last=await runAgentTurn({messages:[{role:'user',content:turns?'more':'All British schools in Sharjah'}],context},{},{understanding:understanding(turns?'more':'all'),regulator:spea,fetcher,reserve:async()=>true});
  turns++;const names=[...last.reply.matchAll(/Synthetic School \d+/g)].map(m=>m[0]);
  for(const n of new Set(names)){assert.ok(!seen.has(n),'no school repeated across pages: '+n);seen.add(n)}
  assert.ok(last.reply.length<=2000,'reply fits the UI limit ('+last.reply.length+')');assert.ok(last.organisations.length<=8);assert.ok(last.liveSources.length<=8,"sources fit the UI limit");
  if(turns===1){assert.match(last.reply,/complete list SPEA shows for the British filter: 28 of 28/);assert.match(last.reply,/shown 8 of the 28/)}
  if(process.env.SHOW)console.log("---TURN",turns,"\n"+last.reply);context={task:last.research.taskContext.task};
 }while(last.research.taskContext.task.cursor&&turns<6);
 assert.equal(seen.size,28,'all 28 delivered across '+turns+' turns');assert.equal(turns,4);assert.match(last.reply,/That’s all 28/);}

// 12. Late launch (Ina's reproduction): the browser arrives after the launch timeout
{const closed=[];const lateLaunch=delay=>()=>new Promise(r=>setTimeout(()=>r({newPage:async()=>{throw Error('unused')},close:async()=>{closed.push(delay)}}),delay));
 // arrives within the grace period → closed straight away, then settled to time used
 let b=fakeBudget();let r=await listDirectory({recipe:'spea',filter:{curriculum:'british'}},{launch:lateLaunch(60),budget:b,limits:{...fast,launchMs:20,lateLaunchMs:500}});
 assert.equal(r.status,'partial');assert.deepEqual(closed,[60],'late browser closed');assert.equal(r.diagnostics.lateBrowserClosed,true);assert.notEqual(b.settled[0][1],null,'closure confirmed → settle to time used');
 // still not there when we stop waiting → reservation kept in full, and the browser is closed whenever it arrives
 b=fakeBudget();r=await listDirectory({recipe:'spea',filter:{curriculum:'british'}},{launch:lateLaunch(150),budget:b,limits:{...fast,launchMs:20,lateLaunchMs:30}});
 assert.equal(b.settled.length,1);assert.equal(b.settled[0][1],null,'closure not confirmed → no refund');assert.equal(r.diagnostics.lateBrowserPending,true);
 await new Promise(res=>setTimeout(res,200));assert.deepEqual(closed,[60,150],'the late browser is still closed when it finally arrives');
 // a late browser whose close() fails → reservation kept
 b=fakeBudget();await listDirectory({recipe:'spea',filter:{curriculum:'british'}},{launch:()=>new Promise(res=>setTimeout(()=>res({close:async()=>{throw Error('x')}}),40)),budget:b,limits:{...fast,launchMs:10,lateLaunchMs:300}});
 assert.equal(b.settled[0][1],null);}

// 13. The agent only treats a listing as complete when the tool says complete === true (a missing flag is not enough)
{const items=[1,2].map(i=>({name:'[Synthetic] Listing School '+i,url:'https://spea.shj.ae'+P+'synthetic-listing-'+i,fields:{curriculum:{value:'British',quote:'Curriculum::British'}}}));
 const understanding={research:true,intent:'all',topic:'school',location:{country:'uae',city:'Sharjah'},constraints:{curriculum:'british'},organisations:[],source:'test'};
 const run=listing=>runAgentTurn({messages:[{role:'user',content:'All British schools in Sharjah'}]},{},{understanding,regulator:{...REGULATORS.find(x=>x.id==='spea'),listFiltered:async()=>listing},
  fetcher:async()=>new Response('',{status:404}),reserve:async()=>false});
 for(const flag of [undefined,null,'true',1]){const res=await run({status:'ok',filter:{curriculum:'british'},total:2,range:[1,2],items,...(flag===undefined?{}:{complete:flag})});
  assert.equal(res.research.coverage?.complete??false,false,'complete='+String(flag)+' must not count');assert.doesNotMatch(res.reply,/complete list/)}
 const ok=await run({status:'ok',complete:true,filter:{curriculum:'british'},total:2,range:[1,2],items});assert.match(ok.reply,/complete list SPEA shows for the British filter: 2 of 2/);}
console.log('Browser directory (scripted fake): counter-ahead guard, under-render, timeout, host/method/navigation checks, exhausted allowance, close in finally, action limit, year not confirmed by membership, long lists paged without loss, late launches closed with reservation kept, strict complete===true: passed');
