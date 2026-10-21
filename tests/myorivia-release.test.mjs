/* myorivia.app production entry (21 Oct): fails closed until fully configured, app paths only, /join links, owner-only
 * management (see organisations.test.mjs), consent v1 from Ina, push off, accounts outside Access only here.
 * Scripted transport only: no provider, email or cloud calls. Run: node tests/myorivia-release.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createProduction,isAppPath,productionReady} from '../workers/orivia-production.mjs';
import {createPublicRelease} from '../workers/orivia-public-release.mjs';
import {PRODUCTION_CONSENT,PUBLIC_CONSENT,PILOT_CONSENT,consentedToOpenAI} from '../workers/orivia-research-pilot.mjs';
import {destination,isAppPath as doorPath} from '../workers/front-door/index.mjs';

const host='myorivia.app',origin='https://'+host;
let calls=0;const worker=createProduction({fetcher:async()=>{calls++;throw Error('No real requests in tests')}});
const noDb={prepare(){throw Error('No database access in these checks')}};
const env={PUBLIC_RELEASE:'1',PUBLIC_BETA:'1',PUBLIC_HOST:host,OPENAI_PILOT:'1',OPENAI_API_KEY:'scripted-only',BUDGET_DB:noDb,ACCOUNTS_DB:noDb,
 TURNSTILE_SITE_KEY:'test-site',TURNSTILE_SECRET:'test-secret',SESSION_SECRET:'s'.repeat(40),ACCOUNTS_SECRET:'a'.repeat(40),ACCOUNTS_ORIGIN:origin,ACCOUNTS_ENABLED:'1',
 PILOT_OPENAI_DAY_USD:'5',PILOT_OPENAI_MONTH_USD:'20',OPENAI_INPUT_USD_PER_M:'2',OPENAI_OUTPUT_USD_PER_M:'10',ACCOUNTS_EMAIL_DAY_CAP:'10',ACCOUNTS_EMAIL_MONTH_CAP:'100',
 ORGANISATIONS_ENABLED:'1',NOTIFICATIONS_ENABLED:'1',PUSH_PUBLIC_KEY:'should-be-ignored',PUSH_PRIVATE_KEY:'should-be-ignored',ACCOUNTS_TEST_UI:'1'};
const req=(p,opts)=>new Request(origin+p,opts);
const get=p=>worker.fetch(req(p),env,{});

// Fails closed: every safeguard must be configured, on the right address.
assert.equal(productionReady(env),true);
for(const key of ['PUBLIC_RELEASE','OPENAI_API_KEY','TURNSTILE_SECRET','SESSION_SECRET','ACCOUNTS_SECRET','ACCOUNTS_DB','BUDGET_DB','PILOT_OPENAI_DAY_USD','ACCOUNTS_EMAIL_DAY_CAP'])
 assert.equal((await worker.fetch(req('/app'),{...env,[key]:undefined},{})).status,503,key+' is required');
assert.equal((await worker.fetch(req('/app'),{...env,ACCOUNTS_ORIGIN:'https://orivia-beta.habeebahsallah27.workers.dev'},{})).status,503,'accounts must belong to myorivia.app');
assert.equal((await worker.fetch(req('/app'),{...env,PUBLIC_HOST:'orivia-beta.habeebahsallah27.workers.dev'},{})).status,503);

// The website owns everything except the app's paths.
for(const p of ['/','/index.html','/css/app.css','/sw.js','/legacy.html','/privacy'])assert.equal(isAppPath(p),false,p);
for(const p of ['/app','/join/northbay-university','/platform','/platform.js','/manage','/chat.js','/api/account/session','/v1/config','/orivia-notifications-sw.js'])assert.equal(isAppPath(p),true,p);
assert.equal((await get('/')).status,404,'the app never answers for the website');

// The app page lives at /app, framed only by myorivia.app itself.
const page=await get('/app');assert.equal(page.status,200);const html=await page.text();
assert.match(html,/<title>Orivia<\/title>/);const csp=page.headers.get('Content-Security-Policy');
assert.match(csp,/frame-ancestors 'self'(;|$)/);assert.doesNotMatch(csp,/github\.io|frame-ancestors 'none'/);

// University links open the app's welcome for that organisation; the #join token never reaches the server.
const join=await get('/join/northbay-university');assert.equal(join.status,302);assert.equal(join.headers.get('Location'),'/app?organisation=northbay-university');
assert.equal((await get('/join/BAD!')).status,404);assert.equal((await worker.fetch(req('/join/northbay-university',{method:'POST'}),env,{})).status,404);

// Consent v1 (Ina): its own version and wording; older consents don't carry over.
const config=await (await get('/v1/config')).json();
assert.equal(config.mode,'public');assert.equal(config.publicAssistant,true);assert.equal(config.providerPilot.consent,PRODUCTION_CONSENT);
assert.equal(PRODUCTION_CONSENT,'orivia-ai-consent-v1-2026-10-21');assert.equal(config.providerPilot.heading,'Before we begin');
assert.equal(config.providerPilot.agree,'I agree to send my messages and recent conversation to the AI providers described above so I can use Orivia.');
assert.match(config.providerPilot.text,/If OpenAI is unavailable, Cloudflare Workers AI may respond instead\./);
assert.match(config.providerPilot.text,/University or organisation staff cannot read your personal chats through their dashboard\./);
assert.equal(config.providerPilot.text.split('\n\n').length,4,'four paragraphs');assert.ok(config.providerPilot.text.length<=1400,'fits the page limit');
const prod={...env,PUBLIC_ASSISTANT:'1',PRODUCTION_CONSENT:'1'};
assert.equal(consentedToOpenAI({providerConsent:{openai:PRODUCTION_CONSENT}},prod),true);
assert.equal(consentedToOpenAI({providerConsent:{openai:PUBLIC_CONSENT}},prod),false,'the older public consent is asked again');
assert.equal(consentedToOpenAI({providerConsent:{openai:PILOT_CONSENT}},prod),false);

// Accounts are on here (they're off on orivia-beta); the test sign-in page never is.
const acc=await (await get('/api/account/config')).json();assert.equal(acc.enabled,true);
assert.equal((await get('/account-test')).status,404);
const beta=createPublicRelease();const betaEnv={...env,PUBLIC_HOST:'orivia-beta.example.workers.dev'};
assert.equal((await (await beta.fetch(new Request('https://orivia-beta.example.workers.dev/api/account/config'),betaEnv,{})).json()).enabled,false,'orivia-beta is unchanged');

// Device push stays off until delivery passes a real-device test (Ina). The in-app inbox is unaffected.
for(const p of ['/api/account/notifications/subscription','/api/account/notifications/test'])
 assert.equal((await worker.fetch(req(p,{method:'POST',headers:{Origin:origin}}),env,{})).status,503,p);
const prefs=await worker.fetch(req('/api/account/notifications/preferences'),env,{});assert.notEqual(prefs.status,200,'signed-out visitors get nothing');

// No model call before the human check, wherever the request comes from.
const chat={method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:'hello'}],preferences:{providerConsent:{openai:PRODUCTION_CONSENT}}})};
const blocked=await worker.fetch(req('/v1/chat',chat),env,{});assert.equal(blocked.status,401);assert.equal((await blocked.json()).error,'human_check');
assert.equal((await worker.fetch(req('/v1/chat',{...chat,headers:{...chat.headers,Origin:'https://orivia-beta.habeebahsallah27.workers.dev'}}),env,{})).status,403,'only myorivia.app may send messages');
assert.equal(calls,0,'no provider charge in these checks');

// Client: consent remembered per account or guest and version; links and push scope follow where the app lives.
const read=f=>fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');
const ui=read('workers/trial-ui/chat.js'),accounts=read('workers/trial-ui/accounts.js'),push=read('workers/trial-ui/notifications.js');
assert.deepEqual([...(ui+accounts).matchAll(/(.{9})sessionStorage\.getItem\((?:ck|'orivia-ai-private-consent')\)===?'yes'/g)].map(m=>m[1]),['){return ','agreed():'],'agreement no longer depends on the tab (only the two fallbacks read it)');
assert.match(ui,/function agreed\(\)\{try\{return entryStore\(\)\.getItem\(entryKey\)===consentVersion\(\)/);
assert.match(ui,/window\.OriviaConsent=\{agreed,ready:modeReady\}/);assert.match(accounts,/Promise\.resolve\(window\.OriviaConsent\?\.ready\)\.then\(enterNow\)/);
assert.match(ui,/why==='human_check'\)\{const passedBefore=humanOk;\$\('consent'\)\.checked=agreed\(\)/,'an expired human check keeps the agreement');
assert.match(push,/scope:\(location\.pathname\.startsWith\('\/app'\)\?'\/app':'\/'\)/,'the app never takes over the website');
assert.doesNotMatch(accounts,/callbackURL:location\.origin\+'\/'\}/);

// Front door: the landing page owns '/'; app paths reach the app (same list as production).
assert.equal(destination(new URL(origin+'/')),null);assert.equal(destination(new URL(origin+'/css/app.css')),null);
for(const p of ['/','/app','/app/','/join/northbay-university','/platform','/platform.js','/manage','/chat.js','/api/x','/v1/config','/fonts/a.woff2','/sw.js','/legacy.html'])assert.equal(doorPath(p),isAppPath(p),'front door and production agree on '+p);
{const fd=(await import('../workers/front-door/index.mjs')).default;
 const assets={fetch:async r=>new Response(new URL(r.url).pathname,{headers:{'Content-Type':'text/html'}})};
 let forwarded=null;const app={fetch:async r=>{forwarded=new URL(r.url).pathname;return new Response('app')}};
 let r=await fd.fetch(new Request(origin+'/'),{ASSETS:assets,APP:app,RELEASE_LIVE:'1'});assert.equal(await r.text(),'/index.html');assert.match(r.headers.get('Content-Security-Policy'),/frame-src 'self'/);assert.doesNotMatch(r.headers.get('Content-Security-Policy'),/googleapis|gstatic/);
 r=await fd.fetch(new Request(origin+'/manage'),{ASSETS:assets,APP:app,RELEASE_LIVE:'1'});assert.equal(forwarded,'/manage','management goes to the production Worker, which checks the owner');
 r=await fd.fetch(new Request(origin+'/join/northbay'),{ASSETS:assets,APP:app,RELEASE_LIVE:'1'});assert.equal(r.status,302);assert.equal(r.headers.get('Location'),'/join/northbay-university');
 r=await fd.fetch(new Request(origin+'/sw.js'),{ASSETS:assets,APP:app,RELEASE_LIVE:'1'});const sw=await r.text();assert.match(sw,/registration\.unregister\(\)/);assert.match(sw,/startsWith\('orivia-public'\)/);assert.doesNotMatch(sw,/localStorage|indexedDB/,'saved data is never touched');
 r=await fd.fetch(new Request('https://www.myorivia.app/app'),{});assert.equal(r.status,301);
 // Before the switch-over: only a browser with the preview cookie gets the release.
 const key='p'.repeat(40),pre={ASSETS:assets,APP:app,RELEASE_PREVIEW:key};forwarded=null;
 r=await fd.fetch(new Request(origin+'/app'),pre);assert.equal(r.status,302);assert.match(r.headers.get('Location'),/orivia-beta/);assert.equal(forwarded,null,'no cookie, no release');
 r=await fd.fetch(new Request(origin+'/__release-preview?key=wrong'),pre);assert.equal(r.status,404);
 r=await fd.fetch(new Request(origin+'/__release-preview?key='+key),pre);assert.equal(r.status,302);const cookie=r.headers.get('Set-Cookie');assert.match(cookie,/HttpOnly; Secure; SameSite=Lax/);
 r=await fd.fetch(new Request(origin+'/app',{headers:{Cookie:cookie.split(';')[0]}}),pre);assert.equal(forwarded,'/app','preview cookie reaches production');
 r=await fd.fetch(new Request(origin+'/__release-preview?key='+key),{...pre,RELEASE_LIVE:'1'});assert.notEqual(r.status,302,'preview entry closes after the switch-over');}
// Landing page (Ina's approved concept): no concept labels or Google requests, live same-site preview with a full-screen link.
{const landing=fs.readFileSync('workers/front-door/public/index.html','utf8');
 assert.doesNotMatch(landing,/fonts\.googleapis|fonts\.gstatic|Design concept|Illustrative|https:\/\/myorivia\.app\//);
 assert.match(landing,/<iframe src="\/app" title="Orivia preview"/);assert.match(landing,/href="\/app" target="_blank" rel="noopener"><u>Open Orivia full screen ↗<\/u>/);
 assert.match(landing,/src:url\(\/fonts\/manrope-latin-800-normal\.woff2\)/);for(const f of ['dm-sans-latin-400-normal.woff2','manrope-latin-600-normal.woff2','dm-sans-OFL.txt','manrope-OFL.txt'])assert.ok(fs.existsSync('workers/front-door/public/fonts/'+f),f);
 assert.doesNotMatch(landing,/href="[^"]*(privacy|terms)/i,'legal drafts stay unpublished until approved');}
console.log('myorivia.app: fails closed, app paths only, /join links, consent v1, accounts on (orivia-beta unchanged), push off, human check before any model call, consent remembered per version. Scripted only.');
