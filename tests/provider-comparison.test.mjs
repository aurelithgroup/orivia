/* Provider comparison (SCRIPTED: fixture pages + scripted model text; not a live run).
   The same conversations run with the existing provider (env.AI) and with the OpenAI pilot transport (fake HTTP, real
   transport + real D1-style ledger). Checks the code still enforces sources/completeness whichever provider plans, and that
   only aggregate metrics are recorded. Run: node --experimental-sqlite tests/provider-comparison.test.mjs */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {runComparison,summarise} from '../tools/provider-comparison.mjs';
import {createOpenAIPilot} from '../workers/orivia-openai-pilot.mjs';
import {createOpenAIBudget} from '../workers/orivia-spend-ledger.mjs';
import {listDirectory} from '../workers/orivia-browser-directory.mjs';
import {REGULATORS} from '../workers/orivia-research-loop.mjs';
import {SPEA_DIRECTORY} from '../workers/orivia-spea-reader.mjs';

const fx=f=>readFileSync(new URL('./fixtures/'+f,import.meta.url),'utf8');
const P='https://spea.shj.ae/en/education-institutes/schools/';
const synth=(name,curr)=>`<h2>${name}</h2><span>Curriculum: ${curr}</span><span>Grade: FS1 | FS2 | 1 | 2 | 3 | 4 | 5 | 6</span>`;
const OTHERS=['[Synthetic] Acacia British School','[Synthetic] Baobab British School','[Synthetic] Cypress Indian School'];
const pages={[SPEA_DIRECTORY]:fx('spea-directory-page1.html'),[P+'wes-green-int-pvt-school-llc']:fx('spea-profile-wesgreen-full.html'),[P+'victoria-english-pvt-school-llc']:fx('spea-profile-victoria-english.html')};
OTHERS.forEach((n,i)=>pages[P+'synthetic-other-'+i]=synth(n,/Indian/.test(n)?'Indian':'British'));

function world({down=false,searches=10}={}){
 let left=searches;
 const fetcher=async u=>{const url=String(u);
  if(url.startsWith('https://api.search.brave.com/')){const q=(new URL(url).searchParams.get('q')||'').toLowerCase();let results=[];
   if(q.includes('site:spea.shj.ae')){if(/victoria/.test(q))results=[{url:P+'victoria-english-pvt-school-llc',title:'Victoria English Pvt. School LLC'}];
    else if(/wes/.test(q))results=[{url:P+'wes-green-int-pvt-school-llc',title:'Wes green Int. Pvt. School. LLC'}];
    else results=OTHERS.map((n,i)=>({url:P+'synthetic-other-'+i,title:n}))}
   return Response.json({query:{more_results_available:false},web:{results:results.map(r=>({...r,description:''}))}})}
  if(down)return new Response('',{status:503,headers:{'content-type':'text/html'}});
  return pages[url]!==undefined?new Response(pages[url],{headers:{'content-type':'text/html'}}):new Response('',{status:404,headers:{'content-type':'text/html'}})};
 return {fetcher,reserve:async()=>left-->0};
}
// Scripted "model": same text whichever provider carries it. Understanding is per conversation; planning defers to policy.
const model=conv=>sys=>/describe what research the LATEST/.test(sys)?JSON.stringify(conv.u):JSON.stringify(conv.plan||{action:'nothing'});
const U=(intent,extra={})=>({research:true,intent,topic:'school',location:{country:'uae',city:'Sharjah'},constraints:{curriculum:'british'},organisations:[],searches:[],...extra});
const user=t=>({role:'user',content:t});
const conversations=[
 {id:'discovery',messages:[user('Find British curriculum schools in Sharjah')],u:U('find'),check:r=>/British curriculum/.test(r.reply)},
 {id:'all-complete-listing',messages:[user('All British curriculum schools in Sharjah')],u:U('all'),browser:true,check:r=>/complete list SPEA shows/.test(r.reply)},
 {id:'more',messages:[user('British schools in Sharjah'),{role:'assistant',content:'Here are some.'},user('more please')],u:U('more'),
  context:{task:{intent:'find',topic:'school',location:{country:'uae',city:'Sharjah'},constraints:{curriculum:'british'},shown:[{name:'Wes green Int. Pvt. School. LLC',url:P+'wes-green-int-pvt-school-llc',level:'regulator'}]}},
  check:r=>!/Wes green/.test(r.reply.split('\n\n[1]')[0])},
 {id:'named-organisation',messages:[user('Tell me about Victoria English school in Sharjah')],u:U('check',{constraints:{},organisations:[{name:'Victoria English'}]}),check:r=>/Victoria English/.test(r.reply)},
 {id:'correction',messages:[user('Tell me about Victoria English school in Sharjah'),{role:'assistant',content:'Victoria English Pvt. School LLC…'},user('Sorry, I meant Wes Green school')],
  u:U('check',{constraints:{},organisations:[{name:'Wes Green'}]}),check:r=>/Wes green/i.test(r.reply)&&!/^Victoria/.test(r.reply)},
 {id:'contacts',messages:[user('What is the phone number for Wes Green school in Sharjah?')],u:U('contacts',{constraints:{},organisations:[{name:'Wes Green'}]}),check:r=>/065062999/.test(r.reply)},
 {id:'comparison',messages:[user('Compare Wes Green and Victoria English schools in Sharjah')],u:U('compare',{constraints:{},organisations:[{name:'Wes Green'},{name:'Victoria English'}]}),check:r=>/Wes green/i.test(r.reply)&&/Victoria English/.test(r.reply)},
 {id:'source-failure',messages:[user('Find British curriculum schools in Sharjah')],u:U('find'),down:true,check:r=>/couldn’t|could not|not found|isn’t the full list/.test(r.reply)&&!r.research.claims.length},
 {id:'exhausted-budget',messages:[user('Find British curriculum schools in Sharjah')],u:U('find'),searches:0,noMoney:true,check:r=>typeof r.reply==='string'&&r.research.claims.every(c=>/spea\.shj\.ae/.test(r.liveSources.find(s=>s.id===c.sourceId)?.url||''))},
];
// A fake browser that shows a filtered SPEA listing of 3 British schools (counter ahead of cards once).
const british=[['wes-green-int-pvt-school-llc','Wes green Int. Pvt. School. LLC'],['synthetic-other-0',OTHERS[0]],['synthetic-other-1',OTHERS[1]]];
const fakeLaunch=async()=>{let applied=false,lag=1;const card=([s,n])=>`<li><a href="/en/education-institutes/schools/${s}"><h3>${n}</h3></a><span>Curriculum::British</span><span>Learn More</span></li>`;
 const page={setRequestInterception:async()=>{},on:()=>{},goto:async()=>{},url:()=>SPEA_DIRECTORY,
  content:async()=>{if(!applied)return '<ul></ul><span>1-10 of 136</span>';if(lag-->0)return '<ul></ul><span>1-3 of 3</span>';return `<ul>${british.map(card).join('')}</ul><span>1-3 of 3</span>`},
  evaluate:async(fn,text)=>{if(text==='Apply Filter')applied=true;return 'ok'}};
 return {newPage:async()=>page,close:async()=>{}}};
const browserMeter={reserve:async()=>'b',settle:async()=>{}};
const regulatorFor=conv=>conv.browser?{...REGULATORS[0],listFiltered:f=>listDirectory({recipe:'spea',filter:f},{launch:fakeLaunch,budget:browserMeter,limits:{pollMs:1,sessionMs:2000}})}:undefined;

const sql=new DatabaseSync(':memory:');const stmt=(s,a=[])=>({bind:(...v)=>stmt(s,v),run:async()=>sql.prepare(s).run(...a),first:async()=>sql.prepare(s).get(...a)||null});
const D1={prepare:s=>stmt(s)};
const providers=[
 {name:'workers-ai',setup:async conv=>{const w=world(conv);const say=model(conv);
  return {env:{BRAVE_SEARCH_API_KEY:'k',AI:{run:async(_m,o)=>({response:say(o.messages[0].content)})}},opts:{...w,regulator:regulatorFor(conv)},usage:()=>null}}},
 {name:'openai-pilot',setup:async conv=>{const w=world(conv);const say=model(conv);let inputTokens=0,outputTokens=0;
  const env={OPENAI_PILOT:'1',OPENAI_API_KEY:'test-key',OPENAI_INPUT_USD_PER_M:'2',OPENAI_OUTPUT_USD_PER_M:'10',PILOT_OPENAI_MONTH_USD:'20',PILOT_OPENAI_DAY_USD:conv.noMoney?'0.000001':'2'};
  const budget=createOpenAIBudget(env,D1);
  const fetcher=async(_u,init)=>{const body=JSON.parse(init.body);const text=say(body.input[0].content);const it=Math.ceil(init.body.length/4),ot=Math.ceil(text.length/4)+40;inputTokens+=it;outputTokens+=ot;
   return Response.json({status:'completed',usage:{input_tokens:it,output_tokens:ot},output:[{type:'message',role:'assistant',content:[{type:'output_text',text}]}]})};
  const ai=createOpenAIPilot(env,{consented:true,budget,fetcher});
  return {env:{BRAVE_SEARCH_API_KEY:'k'},opts:{...w,ai,regulator:regulatorFor(conv)},usage:()=>({inputTokens,outputTokens})}}},
];
const rows=await runComparison({conversations,providers,label:'scripted'});
for(const r of rows)assert.ok(r.success,r.provider+' / '+r.conversation+' ('+r.status+')');
// Same evidence-backed outcome whichever provider plans (scripted text is identical, so differences would be code bugs)
for(const c of conversations){const [a,b]=rows.filter(r=>r.conversation===c.id);assert.equal(a.status,b.status,c.id);assert.equal(a.searches,b.searches,c.id)}
const sum=summarise(rows);
assert.equal(sum['workers-ai'].inputTokens,null,'Workers AI tokens not reported: shown as unknown, not zero');
assert.ok(sum['openai-pilot'].inputTokens>0);assert.equal(sum['openai-pilot'].label,'scripted');
assert.ok(!JSON.stringify(rows).match(/Victoria|Wes green|phone|Sharjah/i),'rows hold aggregate metrics only');
assert.throws(()=>summarise([{...rows[0],label:'live'},rows[1]]),/do not mix/);
await assert.rejects(()=>runComparison({conversations,providers,label:'unlabelled'}),/label/);
if(process.env.SHOW)console.table(rows),console.log(sum);
console.log('Provider comparison (scripted): '+conversations.length+' conversations × 2 providers, same enforced outcomes, aggregate metrics only, scripted/live kept apart: passed');
