/* University connector contract (ORI-CONNECT-001..004, 006) against a synthetic fixture and real SQLite.
   Run: node --experimental-sqlite tests/connectors.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {CAPABILITIES,STATUS,connectionState,matchIdentity,fixtureAdapter,signBody,receiveUpdate,currentStatus,validEvent} from '../workers/connect/connectors.mjs';
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON;'+['workers/accounts/schema.sql','workers/accounts/organisations.sql','workers/connect/connectors.sql'].map(f=>fs.readFileSync(f,'utf8')).join('\n'));
const st=(t,a=[])=>({bind:(...v)=>st(t,v),run:async()=>sql.prepare(t).run(...a),first:async()=>sql.prepare(t).get(...a)||null,all:async()=>({results:sql.prepare(t).all(...a)})});
// D1-like batch: one transaction; failOn (a regex) makes a matching statement fail mid-batch, to test atomicity.
const db={failOn:null,prepare:t=>({...st(t),text:t,bind:(...v)=>({...st(t,v),text:t})}),batch:async stmts=>{sql.exec('BEGIN IMMEDIATE');try{const out=[];for(const x of stmts){if(db.failOn&&db.failOn.test(x.text))throw Error('simulated storage failure');out.push(await x.all())}sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};
sql.prepare("INSERT INTO organisations(id,slug,name,city,demo,created_at) VALUES ('org-nb','northbay','Northbay University','Dubai',1,0),('org-rv','riverside','Riverside College','Leeds',1,0)").run();
sql.prepare("INSERT INTO connector_sync(org_id,last_success_at) VALUES ('org-nb',NULL)").run();
// CONNECT-001/006: read-only capabilities; "configured" only with credential AND agreement; fixtures are sandbox.
assert.deepEqual(CAPABILITIES,['identity','statusTimeline','timetable','ticketLookup']);
const env={NB_SECRET:'x'.repeat(40)};
assert.equal(connectionState({adapter:'sis',credentialSecret:'NB_SECRET'},env),'not_configured','credential without agreement');
assert.equal(connectionState({adapter:'sis',agreementRef:'MOU-1',agreementSignedAt:1},env),'not_configured','agreement without credential');
assert.equal(connectionState({adapter:'sis',credentialSecret:'NB_SECRET',agreementRef:'MOU-1',agreementSignedAt:1},{NB_SECRET:'short'}),'not_configured');
assert.equal(connectionState({adapter:'sis',credentialSecret:'NB_SECRET',agreementRef:'MOU-1',agreementSignedAt:1},env),'configured');
assert.equal(connectionState({adapter:'fixture'},{}),'sandbox');assert.equal(connectionState(null,env),'not_configured');
// CONNECT-002: identity from institution claims only; a typed student ID can't select someone else.
const conn={adapter:'fixture',orgId:'org-nb',issuer:'https://idp.northbay.example',fixtureSecret:'fixture-secret-'+'y'.repeat(30)};
assert.deepEqual(matchIdentity(conn,{issuer:'https://idp.northbay.example',subject:'s-123'},{studentId:'s-999'}),{personRef:'org-nb:s-123'});
assert.equal(matchIdentity(conn,{issuer:'https://evil.example',subject:'s-123'}),null,'wrong issuer');
assert.equal(matchIdentity(conn,null,{studentId:'s-123'}),null,'student ID alone is not identity');
const fx=fixtureAdapter({timeline:{'org-nb:s-123':[{status:'application_received'}]},timetable:{},tickets:{'org-nb:s-123':[{id:'T1',state:'open'}]}});
assert.equal((await fx.statusTimeline('org-nb:s-123')).length,1);assert.equal(await fx.ticketLookup('org-nb:s-999','T1'),null);
// CONNECT-003: signed, fresh, valid, idempotent, never regresses.
const now=Date.parse('2026-10-23T09:00:00Z'),ts=Math.floor(now/1000);
const send=async(event,{secret=conn.fixtureSecret,t=ts,c=conn,raw}={})=>{const body=raw??JSON.stringify(event);const h=new Headers({'X-Orivia-Timestamp':String(t),'X-Orivia-Signature':await signBody(secret,t,body)});return receiveUpdate(db,c,{},{headers:h,body,now})};
const ev=(id,status,v)=>({eventId:id,subject:'s-123',status,sourceVersion:v,occurredAt:'2026-10-2'+Math.min(v,9)+'T08:00:00Z'});
assert.equal((await send(ev('e1','university_submitted',2),{secret:'wrong-secret'})).error,'bad_signature');
assert.equal((await send(ev('e1','university_submitted',2),{t:ts-301})).error,'stale_or_missing_timestamp');
assert.equal((await send(null,{raw:'{"eventId":"e1","subject":"s-123","status":"approved","sourceVersion":2,"occurredAt":"2026-10-22T08:00:00Z"}'})).error,'invalid_event','unknown status words refused');
assert.equal((await send({...ev('e9','university_submitted',2),studentEmail:'x@y'})).error,'invalid_event','unexpected fields refused');
assert.deepEqual(await send(ev('e1','university_submitted',2)),{status:200,applied:true,stale:false});
assert.deepEqual(await send(ev('e1','university_submitted',2)),{status:200,duplicate:true},'replayed event recorded once');
assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM connector_events').get().n,1);
assert.deepEqual(await send(ev('e0','application_received',1)),{status:200,applied:false,stale:true},'older event does not regress');
let cur=await currentStatus(db,'org-nb','org-nb:s-123');
assert.equal(cur.status,'university_submitted');assert.equal(cur.assertedBy,'university');assert.equal(cur.sourceEventId,'e1');assert.equal(cur.sourceVersion,2);
// CONNECT-004: university submitted is never labelled a government approval.
assert.ok(!/approv/i.test(cur.label));assert.equal(STATUS.authority_approved.by,'authority');
await send(ev('e2','authority_approved',3));cur=await currentStatus(db,'org-nb','org-nb:s-123');assert.equal(cur.assertedBy,'authority');assert.equal(cur.receivedAt,new Date(now).toISOString());
assert.ok(sql.prepare("SELECT last_success_at FROM connector_sync WHERE org_id='org-nb'").get().last_success_at===now,'last successful sync kept');
// Routing comes from the connection: the same body signed for Riverside lands in Riverside only.
const rv={...conn,orgId:'org-rv'};await send(ev('e1','university_submitted',2),{c:rv});
assert.equal(sql.prepare("SELECT COUNT(*) AS n FROM connector_status WHERE org_id='org-rv'").get().n,1);assert.equal((await currentStatus(db,'org-nb','org-nb:s-123')).status,'authority_approved');
// Not configured: nothing is accepted.
assert.equal((await receiveUpdate(db,{adapter:'sis',orgId:'org-nb'},{},{headers:new Headers(),body:'{}',now})).error,'not_configured');
assert.equal(validEvent({eventId:'e1'}),false);
// CONNECT-005: after disconnect, a correctly signed update queued earlier is refused and changes nothing.
const before=JSON.stringify(await currentStatus(db,'org-nb','org-nb:s-123'));const revoked={...conn,revokedAt:now-1000};
assert.deepEqual(await send(ev('e7','withdrawn',9),{c:revoked}),{status:410,error:'revoked'});assert.equal(JSON.stringify(await currentStatus(db,'org-nb','org-nb:s-123')),before);assert.equal(connectionState({...conn,revokedAt:1,adapter:'sis',credentialSecret:'NB_SECRET',agreementRef:'M',agreementSignedAt:1},env),'revoked');
// Ina's reproduction (f99c2b3): a failure between the event row and the status row must not strand the event.
{const c2={...conn,orgId:'org-nb'},e9={eventId:'atomic-1',subject:'s-777',status:'documents_requested',sourceVersion:1,occurredAt:'2026-10-23T08:00:00Z'};
 db.failOn=/INSERT INTO connector_status/;await assert.rejects(send(e9,{c:c2}),/simulated storage failure/);db.failOn=null;
 assert.equal(sql.prepare("SELECT COUNT(*) AS n FROM connector_events WHERE event_id='atomic-1'").get().n,0,'nothing half-written');
 assert.deepEqual(await send(e9,{c:c2}),{status:200,applied:true,stale:false},'the retry applies the update');
 assert.equal((await currentStatus(db,'org-nb','org-nb:s-777')).status,'documents_requested');
 // Applied, then the response was lost: the retry is a duplicate and the status stays as applied.
 assert.deepEqual(await send(e9,{c:c2}),{status:200,duplicate:true});assert.equal((await currentStatus(db,'org-nb','org-nb:s-777')).sourceEventId,'atomic-1');
 assert.equal(sql.prepare("SELECT COUNT(*) AS n FROM connector_events WHERE event_id='atomic-1'").get().n,1);}
console.log('Connectors: read-only contract, configured only with credential and agreement, identity from institution claims, signed/fresh/idempotent updates that never regress, source meaning kept: pass.');
