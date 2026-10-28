import assert from 'node:assert/strict';import fs from 'node:fs';import {DatabaseSync} from 'node:sqlite';import {createECDH} from 'node:crypto';import {createRequire} from 'node:module';
import {handleNotificationRequest,runNotificationTick,validSubscription} from '../workers/accounts/notifications.mjs';
const webpush=createRequire(new URL('../workers/accounts/package.json',import.meta.url))('web-push');
const sql=new DatabaseSync(':memory:');for(const path of ['schema.sql','organisations.sql','notifications.sql'])sql.exec(fs.readFileSync('workers/accounts/'+path,'utf8'));sql.exec('PRAGMA foreign_keys=ON');
const statement=(q,args=[])=>({bind:(...a)=>statement(q,a),first:async()=>sql.prepare(q).get(...args)||null,all:async()=>({results:sql.prepare(q).all(...args)}),run:async()=>sql.prepare(q).run(...args)}),db={prepare:q=>statement(q)};
let stamp=Date.parse('2026-10-20T12:00:00Z');const iso=new Date(stamp).toISOString();
for(const id of ['alice','bob']){sql.prepare('INSERT INTO user VALUES (?,?,?,?,?,?,?)').run(id,id,id+'@example.test',1,null,iso,iso);sql.prepare('INSERT INTO session VALUES (?,?,?,?,?,?,?,?)').run(id+'-session',new Date(stamp+7*86400000).toISOString(),'synthetic-'+id,iso,iso,null,null,id)}
const keys=webpush.generateVAPIDKeys(),env={ACCOUNTS_DB:db,NOTIFICATIONS_ENABLED:'1',PUSH_PUBLIC_KEY:keys.publicKey,PUSH_PRIVATE_KEY:keys.privateKey};
const run=(owner,path,method='GET',body)=>handleNotificationRequest(new Request('https://example.test'+path,{method,...(body?{body:JSON.stringify(body)}:{})}),env,{session:owner?{user:{id:owner},session:{id:owner+'-session'}}:null,readJson:r=>r.json(),now:()=>stamp});
assert.equal((await run(null,'/api/account/notifications')).status,401);assert.equal((await run('alice','/api/account/notifications/preferences','PUT',{reminders:true})).status,400);
const prefs={reminders:true,membership:true,updates:true};await run('alice','/api/account/notifications/preferences','PUT',prefs);
const ec=createECDH('prime256v1');ec.generateKeys();const sub={endpoint:'https://fcm.googleapis.com/fcm/send/synthetic-test-endpoint',keys:{p256dh:ec.getPublicKey().toString('base64url'),auth:Buffer.alloc(16,7).toString('base64url')}};
assert.ok(validSubscription(sub));for(const endpoint of ['http://fcm.googleapis.com/fcm/send/x','https://localhost/x','https://127.0.0.1/x','https://fcm.googleapis.com.evil.test/x','https://fcm.googleapis.com:8443/x'])assert.ok(!validSubscription({...sub,endpoint}));
assert.equal((await run('alice','/api/account/notifications/subscription','POST',{subscription:sub,language:'en'})).status,200);assert.equal((await run('bob','/api/account/notifications/subscription','POST',{subscription:sub,language:'en'})).status,409);
let events=[{id:'reminder',title:'Never show this private title on a lock screen',at:new Date(stamp+120000).toISOString(),alarm:0}];sql.prepare('INSERT INTO account_vault VALUES (?,1,?,?)').run('alice',JSON.stringify({events}),iso);
sql.prepare('INSERT INTO organisations VALUES (?,?,?,?,?,?,?,?)').run('org','northbay','Northbay','Dubai',1,'active','alice',stamp);
sql.prepare('INSERT INTO organisation_memberships VALUES (?,?,?,?,?,?,?,?)').run('org','alice','student','requested',null,'request',stamp,stamp);
let sends=0;const fetcher=async(url,opts)=>{sends++;assert.equal(url,sub.endpoint);assert.equal(opts.redirect,'manual','Workers reject redirect:error before sending (founder test 22 Oct)');assert.ok(opts.headers.Authorization||opts.headers.authorization);assert.ok(opts.body.byteLength>100,'real encrypted RFC8291 payload');assert.ok(!Buffer.from(opts.body).toString().includes(events[0].title),'payload is encrypted');return new Response(null,{status:201})};
await runNotificationTick(env,{now:()=>stamp,fetcher});assert.equal(sends,0,'not due and not approved');
stamp+=180000;sql.prepare("UPDATE organisation_memberships SET status='active',updated_at=?").run(stamp);
sql.prepare("INSERT INTO organisation_content(id,org_id,kind,title,body,visibility,status,revision,updated_by,updated_at) VALUES ('content','org','update','University update','Private body','members','published',1,'alice',?)").run(stamp);
{const c=await runNotificationTick(env,{now:()=>stamp,fetcher});assert.deepEqual([c.accepted,c.uncertain,c.failed],[3,0,0],'accepted by the push service, none uncertain')}assert.equal(sends,3,'due reminder, approval and published update');await runNotificationTick(env,{now:()=>stamp,fetcher});assert.equal(sends,3,'no duplicates');
let inbox=await (await run('alice','/api/account/notifications')).json();assert.equal(inbox.notifications.length,3);assert.equal((await (await run('bob','/api/account/notifications')).json()).notifications.length,0);assert.ok(!JSON.stringify(inbox).includes(sub.endpoint));
await run('bob','/api/account/notifications/read','POST',{});assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM notifications WHERE read_at IS NOT NULL').get().n,0,'cannot read another account notifications');
// A new reminder is collected, then cancelled before delivery.
events=[{id:'cancel',at:new Date(stamp+60000).toISOString(),title:'Cancelled',alarm:0}];sql.prepare('UPDATE account_vault SET data=?').run(JSON.stringify({events}));stamp+=120000;await run('alice','/api/account/notifications');sql.prepare('UPDATE account_vault SET data=?').run(JSON.stringify({events:[]}));await runNotificationTick(env,{now:()=>stamp,fetcher});assert.equal(sends,3,'deleted reminders do not push');
// Shared cap blocks outbound work; a queued explicit test resumes when capacity is available.
assert.equal((await run('alice','/api/account/notifications/test','POST',{})).status,200);
sql.prepare('UPDATE notification_meter SET count=100').run();await runNotificationTick(env,{now:()=>stamp,fetcher});assert.equal(sends,3);
sql.prepare('UPDATE notification_meter SET count=3').run();await Promise.all([runNotificationTick(env,{now:()=>stamp,fetcher}),runNotificationTick(env,{now:()=>stamp,fetcher})]);assert.equal(sends,4,'concurrent runs claim each device notification once');
// Revoking membership hides its private inbox items immediately.
sql.prepare("UPDATE organisation_memberships SET status='removed'").run();inbox=await (await run('alice','/api/account/notifications')).json();assert.ok(inbox.notifications.every(n=>!n.organisation));
// Session deletion removes its push route, and account deletion cascades notification data.
sql.prepare('DELETE FROM session WHERE id=?').run('alice-session');assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM notification_subscriptions').get().n,0);
sql.prepare('DELETE FROM user WHERE id=?').run('alice');assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM notifications').get().n,0);assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM notification_preferences').get().n,0);
// Founder 22 Oct: a 4th device (e.g. the same phone after a new sign-in) replaces the oldest registration instead of
// being refused, so enabling alerts always works; still at most 3 per account.
{for(let i=1;i<=4;i++){stamp+=1000;const k=createECDH('prime256v1');k.generateKeys();const r=await run('bob','/api/account/notifications/subscription','POST',{subscription:{endpoint:'https://fcm.googleapis.com/fcm/send/bob-device-'+i,keys:{p256dh:k.getPublicKey().toString('base64url'),auth:Buffer.alloc(16,i).toString('base64url')}},language:'en'});assert.equal(r.status,200,'device '+i)}
 const left=sql.prepare("SELECT endpoint FROM notification_subscriptions WHERE user_id='bob' ORDER BY created_at").all().map(r=>r.endpoint.split('/').pop());
 assert.deepEqual(left,['bob-device-2','bob-device-3','bob-device-4'],'the oldest registration made room');}
console.log('Notifications: real SQL and encrypted Web Push generation; opt-in, due times, deduplication, cancellation, private membership boundaries, endpoint safety, session/account cleanup passed. Push transport scripted only.');
