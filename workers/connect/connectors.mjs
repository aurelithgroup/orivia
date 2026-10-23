/* University connector contract (ORI-CONNECT-001/002/003/004/006). Read-only adapters, a synthetic fixture adapter and a
   verified inbound-update pipeline. No real university, SSO, visa or government system is connected: a connection is
   "configured" only with a server-held credential AND a recorded partner agreement, and nothing here calls out.
   Statuses keep their source meaning: a university's "submitted" is never shown as a government approval. */

// What an adapter may do. Every capability is read-only.
export const CAPABILITIES=['identity','statusTimeline','timetable','ticketLookup'];
// Source status vocabulary, with who asserts it. Never collapsed into one "approved".
export const STATUS={
 application_received:{by:'university',label:'Application received by the university'},
 documents_requested:{by:'university',label:'University asked for documents'},
 university_submitted:{by:'university',label:'University submitted the application to the authority'},
 authority_received:{by:'authority',label:'Authority recorded the application as received'},
 authority_approved:{by:'authority',label:'Authority approved'},
 authority_refused:{by:'authority',label:'Authority refused'},
 withdrawn:{by:'university',label:'Withdrawn'}
};

/* Connection state. "configured" needs both a credential held by the server and a partner agreement on record;
   a fixture is always "sandbox"; anything else is "not_configured". The UI and release notes use this, never a guess. */
export function connectionState(conn,env){
 if(!conn||typeof conn!=='object')return 'not_configured';
 // Disconnected (CONNECT-005): revoked connections accept nothing, including updates queued before the revocation.
 if(Number.isFinite(conn.revokedAt))return 'revoked';
 if(conn.adapter==='fixture')return 'sandbox';
 const credential=typeof conn.credentialSecret==='string'&&typeof env?.[conn.credentialSecret]==='string'&&env[conn.credentialSecret].length>=32;
 const agreement=typeof conn.agreementRef==='string'&&conn.agreementRef.length>0&&Number.isFinite(conn.agreementSignedAt);
 return credential&&agreement?'configured':'not_configured';
}

/* Identity (CONNECT-002): a person is matched only from claims issued by the institution's identity provider for the
   signed-in account (issuer + subject), never from a student number someone typed. */
export function matchIdentity(conn,linkedIdentity,claimed={}){
 if(!linkedIdentity||linkedIdentity.issuer!==conn.issuer||typeof linkedIdentity.subject!=='string'||!linkedIdentity.subject)return null;
 void claimed; // a student ID in a request is ignored on purpose
 return {personRef:conn.orgId+':'+linkedIdentity.subject};
}

// Synthetic fixture adapter: fictional people only, no network.
export function fixtureAdapter(data){
 return {id:'fixture',capabilities:CAPABILITIES,
  async identity(conn,linked){return matchIdentity(conn,linked)},
  async statusTimeline(personRef){return (data.timeline[personRef]||[]).map(x=>({...x}))},
  async timetable(personRef){return (data.timetable[personRef]||[]).map(x=>({...x}))},
  async ticketLookup(personRef,ticketId){const t=(data.tickets[personRef]||[]).find(x=>x.id===ticketId);return t?{...t}:null}};
}

/* Inbound updates (CONNECT-003). Signature: HMAC-SHA256 over "<timestamp>.<body>" with the connection's secret,
   hex in X-Orivia-Signature, seconds in X-Orivia-Timestamp. 5-minute window. Events are idempotent by event id and
   never regress a newer status (source version). Routing comes from the connection, not from the body. */
const enc=new TextEncoder();
async function hmacHex(secret,text){const k=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',k,enc.encode(text))),b=>b.toString(16).padStart(2,'0')).join('')}
function sameHex(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0}
export async function signBody(secret,timestamp,body){return hmacHex(secret,timestamp+'.'+body)}
export function validEvent(e){
 return !!e&&typeof e==='object'&&typeof e.eventId==='string'&&/^[A-Za-z0-9._:-]{2,100}$/.test(e.eventId)&&typeof e.subject==='string'&&/^[A-Za-z0-9._:-]{1,120}$/.test(e.subject)
  &&Object.hasOwn(STATUS,e.status)&&Number.isSafeInteger(e.sourceVersion)&&e.sourceVersion>=0&&typeof e.occurredAt==='string'&&Number.isFinite(Date.parse(e.occurredAt))
  &&Object.keys(e).every(k=>['eventId','subject','status','sourceVersion','occurredAt'].includes(k));
}
export async function receiveUpdate(db,conn,env,{headers,body,now=Date.now()}){
 const state=connectionState(conn,env);if(state==='not_configured'||state==='revoked')return {status:state==='revoked'?410:503,error:state};
 const secret=conn.adapter==='fixture'?conn.fixtureSecret:env[conn.credentialSecret];
 const ts=Number(headers.get('X-Orivia-Timestamp')),sig=headers.get('X-Orivia-Signature');
 if(!Number.isSafeInteger(ts)||Math.abs(now/1000-ts)>300)return {status:401,error:'stale_or_missing_timestamp'};
 if(typeof body!=='string'||body.length>20000)return {status:413,error:'too_large'};
 if(!sameHex(await signBody(secret,ts,body),sig))return {status:401,error:'bad_signature'};
 let e;try{e=JSON.parse(body)}catch(_){return {status:400,error:'invalid_json'}}
 if(!validEvent(e))return {status:400,error:'invalid_event'};
 const personRef=conn.orgId+':'+e.subject,received=now;
 // Idempotent: the same event id for this organisation is recorded once.
 const ins=await db.prepare('INSERT INTO connector_events(org_id,event_id,person_ref,status,source_version,occurred_at,received_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(org_id,event_id) DO NOTHING RETURNING event_id').bind(conn.orgId,e.eventId,personRef,e.status,e.sourceVersion,e.occurredAt,received).first();
 if(!ins)return {status:200,duplicate:true};
 // Newer source versions win; an older or equal one is kept in the event log but doesn't change the current status.
 const cur=await db.prepare('INSERT INTO connector_status(org_id,person_ref,status,source_version,source_event_id,occurred_at,received_at,recorded_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(org_id,person_ref) DO UPDATE SET status=excluded.status,source_version=excluded.source_version,source_event_id=excluded.source_event_id,occurred_at=excluded.occurred_at,received_at=excluded.received_at,recorded_at=excluded.recorded_at WHERE excluded.source_version>connector_status.source_version RETURNING status').bind(conn.orgId,personRef,e.status,e.sourceVersion,e.eventId,e.occurredAt,received,now).first();
 await db.prepare('UPDATE connector_sync SET last_success_at=? WHERE org_id=?').bind(now,conn.orgId).run().catch(()=>{});
 return {status:200,applied:!!cur,stale:!cur};
}

// What a student may be shown (CONNECT-004): the source's own meaning, who asserted it, and when it was received.
export async function currentStatus(db,orgId,personRef){
 const r=await db.prepare('SELECT status,source_version,source_event_id,occurred_at,received_at,recorded_at FROM connector_status WHERE org_id=? AND person_ref=?').bind(orgId,personRef).first();
 if(!r)return null;const s=STATUS[r.status];
 return {status:r.status,label:s.label,assertedBy:s.by,sourceVersion:r.source_version,sourceEventId:r.source_event_id,occurredAt:r.occurred_at,receivedAt:new Date(r.received_at).toISOString(),recordedAt:new Date(r.recorded_at).toISOString()};
}
