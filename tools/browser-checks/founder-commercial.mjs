/* Real local Better Auth/SQLite + real Worker HTTP routes; fictional owner/source only. No live AI, email or deployment. */
import assert from 'node:assert/strict';import fs from 'node:fs';import http from 'node:http';import {DatabaseSync} from 'node:sqlite';import {createRequire} from 'node:module';
import {createAccountAuth} from '../../workers/accounts/auth.mjs';import {handleAccountRequest} from '../../workers/accounts/handler.mjs';import {createTrialWorker} from '../../workers/orivia-ai-private-trial.mjs';
const require=createRequire(process.env.ORIVIA_PLAYWRIGHT_PACKAGE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/package.json'),{chromium}=require('playwright'),sql=new DatabaseSync(':memory:');
sql.exec('PRAGMA foreign_keys=ON;'+['schema','organisations','feedback','platform-audit','shares'].map(n=>fs.readFileSync('workers/accounts/'+n+'.sql','utf8')).join('\n'));
const st=(s,a=[])=>({bind:(...v)=>st(s,v),first:async()=>sql.prepare(s).get(...a)||null,all:async()=>({results:sql.prepare(s).all(...a),meta:{changes:sql.prepare('SELECT changes() AS n').get().n},success:true}),run:async()=>({meta:sql.prepare(s).run(...a),success:true})}),db={prepare:s=>st(s),exec:async s=>sql.exec(s),batch:async stmts=>{sql.exec('BEGIN IMMEDIATE');try{const out=[];for(const s of stmts)out.push(await s.all());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};
const origin='https://journey.example.test',env={PRIVATE_HOST:'journey.example.test',ACCESS_TEST_EMAIL:'owner@example.test',ACCOUNTS_ENABLED:'1',ACCOUNTS_UI:'1',ACCOUNTS_ORIGIN:origin,ACCOUNTS_SECRET:'local-browser-journey-fixture-secret-never-deploy-123456',ACCOUNTS_DB:db,ACCOUNTS_EMAIL_ENABLED:'1',ACCOUNTS_FROM:'signin@example.test',ACCOUNTS_EMAIL:{send(){throw Error('No live email')}},ORGANISATIONS_ENABLED:'1'},outbox=[],auth=createAccountAuth(env,{deliver:m=>outbox.push(m)});let ip=0,cookie='',uid='';
async function call(path,method='GET',body){return handleAccountRequest(new Request(origin+path,{method,headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'192.0.2.'+(++ip),...(cookie?{Cookie:cookie,'X-Orivia-Account':uid}:{})},...(body?{body:JSON.stringify(body)}:{})}),env,{}, {auth})}
{const r=await call('/api/auth/email-otp/send-verification-otp','POST',{email:'owner@example.test',type:'sign-in'});assert.equal(r.status,200,await r.clone().text())}let r=await call('/api/auth/sign-in/email-otp','POST',{email:'owner@example.test',otp:outbox.at(-1).otp});uid=(await r.clone().json()).user.id;cookie=r.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');sql.prepare('INSERT INTO platform_roles VALUES (?,?)').run(uid,'owner');const day=n=>new Date(Date.now()+n*864e5).toISOString().slice(0,10);
r=await call('/api/admin/operations/source','POST',{title:'UK admissions browser reference',status:'reviewed',data:{url:'https://www.gov.uk/schools-admissions',jurisdiction:'uk',checkedAt:day(0),reviewDue:day(90)}});assert.equal(r.status,201);const source=(await r.json()).record;
// Exercise the actual compiled pilot when supplied, including its serialized browser scripts.
const worker=process.env.ORIVIA_WORKER_BUNDLE?(await import(process.env.ORIVIA_WORKER_BUNDLE)).default:createTrialWorker(),ctx={access:{getIdentity:async()=>({email:'owner@example.test'})},waitUntil(p){void p.catch(()=>{})}},errors=[];
const server=http.createServer(async(req,res)=>{try{const bytes=['GET','HEAD'].includes(req.method)?undefined:await new Promise(resolve=>{const parts=[];req.on('data',d=>parts.push(d));req.on('end',()=>resolve(Buffer.concat(parts)))}),headers={...req.headers,cookie};delete headers.host;if(headers.origin)headers.origin=origin;const response=await worker.fetch(new Request(origin+req.url,{method:req.method,headers,body:bytes}),env,ctx),out={};response.headers.forEach((v,k)=>{if(!/content-security-policy|content-length|content-encoding|set-cookie/.test(k))out[k]=v});res.writeHead(response.status,out);res.end(Buffer.from(await response.arrayBuffer()))}catch(e){errors.push(String(e.stack));res.writeHead(500);res.end('Fixture server failed')}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.ORIVIA_CHROMIUM||'/tmp/orivia-chromium/chromium',headless:true,args:['--single-process','--no-zygote','--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}),page=await browser.newPage({viewport:{width:390,height:844}});page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
try{
 const created=await call('/api/admin/orgs','POST',{name:'Fictional acceptance campus',slug:'fictional-acceptance',city:'Dubai',demo:true});assert.equal(created.status,201);const orgId=(await created.json()).organisation.id;
 const offer='/api/me/orgs/'+orgId+'/sponsorships';
 await page.goto(base+'/manage',{waitUntil:'domcontentloaded'});
 await page.getByRole('heading',{name:'Founder drafts and sponsorship review',exact:true}).waitFor();
 await page.getByText('Founder brief workbench',{exact:true}).click();
 await page.getByLabel('Brief title',{exact:true}).fill('Fictional acceptance brief');
 await page.getByLabel('Brief text',{exact:true}).fill('Prepare a draft using approved sources only.');
 await page.getByLabel('Save this brief only. Do not execute AI, send messages or publish a campaign.',{exact:true}).check();
 await page.getByRole('button',{name:'Create founder draft',exact:true}).click();
 await page.getByText('Brief saved. No AI request, message or campaign was sent.',{exact:true}).waitFor();
 await page.getByText('Founder brief workbench',{exact:true}).click();
 const w=(await (await page.request.get(base+'/api/admin/founder-workflows')).json()).items[0];
 await page.getByLabel('Saved founder brief',{exact:true}).selectOption(w.id);
 await page.getByLabel('Brief status',{exact:true}).selectOption('reviewed');
 await page.getByLabel('Save this brief only. Do not execute AI, send messages or publish a campaign.',{exact:true}).check();
 await page.getByRole('button',{name:'Save founder brief',exact:true}).click();
 await page.getByText('Brief saved. No AI request, message or campaign was sent.',{exact:true}).waitFor();
 assert.equal((await (await page.request.get(base+'/api/admin/founder-workflows')).json()).items[0].status,'reviewed');
 await page.getByText('Sponsorship campaign workbench',{exact:true}).click();
 await page.getByLabel('Sponsor name',{exact:true}).fill('Fictional test sponsor');
 await page.getByLabel('Sponsored placement label',{exact:true}).fill('Sponsored · Fictional acceptance placement');
 await page.getByLabel('Sponsor HTTPS destination',{exact:true}).fill('https://example.org/acceptance');
 await page.getByLabel('I reviewed this exact campaign, its audience, dates and sponsorship disclosure.',{exact:true}).check();
 await page.getByRole('button',{name:'Create campaign draft',exact:true}).click();
 await page.getByText('Campaign draft. No payment was collected and factual answers are unchanged.',{exact:true}).waitFor();
 let campaign=(await (await page.request.get(base+'/api/admin/sponsorships')).json()).items[0];
 const edit=async()=>{await page.getByText('Sponsorship campaign workbench',{exact:true}).click();await page.getByLabel('Saved sponsorship campaign',{exact:true}).selectOption(campaign.id)};
 await edit();await page.getByLabel('I reviewed this exact campaign, its audience, dates and sponsorship disclosure.',{exact:true}).check();await page.getByRole('button',{name:'Submit saved campaign for review',exact:true}).click();
 await page.getByText('Campaign in_review. No payment was collected and factual answers are unchanged.',{exact:true}).waitFor();
 await edit();await page.getByLabel('Campaign review note',{exact:true}).fill('Reviewed fictional audience, schedule and clear sponsorship disclosure.');await page.getByLabel('I reviewed this exact campaign, its audience, dates and sponsorship disclosure.',{exact:true}).check();await page.getByRole('button',{name:'Approve reviewed campaign',exact:true}).click();
 await page.getByText('Campaign approved. No payment was collected and factual answers are unchanged.',{exact:true}).waitFor();
 campaign=(await (await page.request.get(base+'/api/admin/sponsorships')).json()).items[0];assert.equal(campaign.status,'approved');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 const ownerCookie=cookie,ownerId=uid;
 async function login(email){let response=await call('/api/auth/email-otp/send-verification-otp','POST',{email,type:'sign-in'});assert.equal(response.status,200);response=await call('/api/auth/sign-in/email-otp','POST',{email,otp:outbox.at(-1).otp});assert.equal(response.status,200);uid=(await response.clone().json()).user.id;cookie=response.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')}
 await login('member@example.test');const memberId=uid,memberCookie=cookie;
 sql.prepare("INSERT INTO organisation_memberships(org_id,user_id,role,status,request_id,created_at,updated_at) VALUES (?,?,'student','active',?,?,?)").run(orgId,uid,crypto.randomUUID(),Date.now(),Date.now());
 let response=await page.request.get(base+offer);assert.equal(response.status(),200);let data=await response.json();assert.equal(data.placements.length,1);assert.equal(data.neverAnswerEvidence,true);assert.equal(data.neverRankingInput,true);
 assert.equal((await page.request.get(base+'/manage')).status(),403);assert.equal((await page.request.get(base+'/api/admin/sponsorships')).status(),403);
 await page.goto(base+'/platform?org='+orgId);await page.getByRole('heading',{name:'Your Fictional acceptance campus space',exact:true}).waitFor();assert.equal(await page.getByRole('heading',{name:'Founder drafts and sponsorship review',exact:true}).count(),0);
 await login('unrelated@example.test');assert.equal((await page.request.get(base+offer)).status(),403);
 cookie=ownerCookie;uid=ownerId;await page.goto(base+'/manage');await edit();await page.getByLabel('I reviewed this exact campaign, its audience, dates and sponsorship disclosure.',{exact:true}).check();await page.getByRole('button',{name:'Withdraw campaign',exact:true}).click();await page.getByText('Campaign withdrawn. No payment was collected and factual answers are unchanged.',{exact:true}).waitFor();
 cookie=memberCookie;uid=memberId;response=await page.request.get(base+offer);assert.equal((await response.json()).placements.length,0);
 cookie='';uid='';assert.equal((await page.request.get(base+'/manage')).status(),401);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,scope:'Actual compiled pilot bundle; local Chromium, SQLite and Better Auth; fictional accounts only. Not live acceptance.',checks:['owner dashboard renders','founder draft/review controls','campaign draft/review/approval/withdrawal controls','member API eligibility','unrelated member denied','member cannot access owner page/API','member dashboard renders','signed-out owner page denied','390px layout','no browser errors']}));
}catch(error){console.error(JSON.stringify({fixtureErrors:errors,fixturePage:await page.locator('body').innerText()}));throw error}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
