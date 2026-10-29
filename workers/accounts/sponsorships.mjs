/* Sponsored placements (area 16), the campaign half of Ina's founder-commercial.mjs (branch
 * ina/founder-ai-sponsorship-block-3-2026-10-25, at 2c14591), taken without the founder AI workflows (area 12, backlog).
 * Owner-only campaigns, explicit and revision-checked; an approved campaign must have been reviewed unchanged, and any
 * edit sends it back to review. Members see only approved campaigns inside their dates, as labelled placements kept
 * apart from guides and answers: never evidence, never a ranking input. No payment, delivery or tracking happens here. */
const SCHEMA=["CREATE TABLE IF NOT EXISTS sponsorship_campaigns(id TEXT PRIMARY KEY,org_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,partner_name TEXT NOT NULL,label TEXT NOT NULL,destination TEXT NOT NULL,disclosure TEXT NOT NULL,status TEXT NOT NULL,review_note TEXT NOT NULL,starts_at INTEGER NOT NULL,ends_at INTEGER NOT NULL,revision INTEGER NOT NULL,created_by TEXT REFERENCES user(id) ON DELETE SET NULL,reviewed_by TEXT REFERENCES user(id) ON DELETE SET NULL,updated_at INTEGER NOT NULL)"];
const ready=new WeakSet();
const control=value=>typeof value==='string'&&!/[\u0000-\u001f\u007f]/.test(value);
const bounded=(value,max=2000,min=1)=>control(value)&&value.trim().length>=min&&value.length<=max?value.trim():null;
const campaign=r=>({id:r.id,orgId:r.org_id,partnerName:r.partner_name,label:r.label,destination:r.destination,disclosure:r.disclosure,status:r.status,reviewNote:r.review_note,startsAt:r.starts_at,endsAt:r.ends_at,revision:r.revision,updatedAt:r.updated_at});
function safeDestination(raw){try{const u=new URL(raw);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!u.hash&&u.href.length<=500?u.href:null}catch{return null}}
export async function handleSponsorships(req,env,c){
 const {path,q,all,json,deny,body,requireOwner,fresh,actor,clock,id,db}=c;
 if(!path.startsWith('/api/admin/sponsorships')&&!/^\/api\/me\/orgs\/[^/]+\/sponsorships$/.test(path))return null;
 if(!ready.has(db)){for(const s of SCHEMA)await q(s).run();ready.add(db)}
 const owned=path.startsWith('/api/admin/');
 if(owned)await requireOwner();
 if(!owned){
  if(req.method!=='GET')deny(405,'method_not_allowed');
  const orgId=path.split('/')[4];
  const m=await q("SELECT 1 AS ok FROM organisation_memberships m JOIN organisations o ON o.id=m.org_id WHERE m.org_id=? AND m.user_id=? AND m.status='active' AND o.status='active'",orgId,actor).first();
  if(!m)deny(403,'membership_required');
  const records=await all("SELECT * FROM sponsorship_campaigns WHERE org_id=? AND status='approved' AND starts_at<=? AND ends_at>? ORDER BY updated_at DESC LIMIT 20",orgId,clock(),clock());
  return json({placements:records.map(r=>({id:r.id,label:r.label,partnerName:r.partner_name,destination:r.destination,disclosure:r.disclosure,kind:'sponsored_placement'})),placementOnly:true,neverAnswerEvidence:true,neverRankingInput:true});
 }
 const root='/api/admin/sponsorships',key=path===root?null:path.startsWith(root+'/')?path.slice(root.length+1):null;
 if(key&&!/^[a-f0-9-]{36}$/.test(key))deny(404,'not_found');
 const read=async()=>{const r=await q('SELECT * FROM sponsorship_campaigns WHERE id=?',key).first();if(!r)deny(404,'not_found');return r};
 if(req.method==='GET'){
  if(key)return json({item:campaign(await read())});
  return json({items:(await all('SELECT * FROM sponsorship_campaigns ORDER BY updated_at DESC LIMIT 100')).map(campaign),deliveryEnabled:false,paidRankingEnabled:false});
 }
 fresh();
 if(!['POST','PATCH'].includes(req.method)||Boolean(key)!==(req.method==='PATCH'))deny(405,'method_not_allowed');
 const b=await body(['orgId','partnerName','label','destination','disclosure','reviewNote','startsAt','endsAt','status','revision','confirm']);
 if(b.confirm!==true||!bounded(b.partnerName,120)||!bounded(b.label,140)||!bounded(b.disclosure,280)||bounded(b.reviewNote,1000,0)===null||!safeDestination(b.destination)||!['draft','in_review','approved','withdrawn'].includes(b.status)||!Number.isSafeInteger(b.startsAt)||!Number.isSafeInteger(b.endsAt)||b.endsAt<=b.startsAt||b.endsAt-b.startsAt>366*864e5||!bounded(b.orgId,64)||key&&!Number.isSafeInteger(b.revision))deny(400,'invalid_campaign');
 if(!/sponsor|paid|advertis/i.test(b.label+' '+b.disclosure)||/\b(?:is|are|as)\s+(?:official|verified|recommended|best ranked)\b/i.test(b.label+' '+b.disclosure))deny(400,'clear_sponsor_disclosure_required');
 if(b.status==='approved'&&(!bounded(b.reviewNote,1000,10)||b.endsAt<=clock()))deny(400,'review_required');
 const org=await q("SELECT id FROM organisations WHERE id=? AND status='active'",b.orgId).first();if(!org)deny(400,'active_organisation_required');
 const r=key?await read():null;
 if(r&&(r.org_id!==b.orgId||r.status==='withdrawn'))deny(409,'campaign_locked');
 // Editing any approved item first returns it to review. Only an unchanged review candidate may be approved.
 if(r&&r.status==='approved'&&b.status==='approved')deny(409,'re_review_required');
 if(b.status==='approved'&&(!r||r.status!=='in_review'||r.partner_name!==b.partnerName.trim()||r.label!==b.label.trim()||r.destination!==safeDestination(b.destination)||r.disclosure!==b.disclosure.trim()||r.starts_at!==b.startsAt||r.ends_at!==b.endsAt))deny(409,'review_candidate_must_match');
 const newId=key||id(),reviewer=b.status==='approved'?actor:null;
 const result=key?await q("UPDATE sponsorship_campaigns SET partner_name=?,label=?,destination=?,disclosure=?,review_note=?,status=?,starts_at=?,ends_at=?,revision=revision+1,reviewed_by=?,updated_at=? WHERE id=? AND revision=? RETURNING id",b.partnerName.trim(),b.label.trim(),safeDestination(b.destination),b.disclosure.trim(),b.reviewNote.trim(),b.status,b.startsAt,b.endsAt,reviewer,clock(),key,b.revision).first():await q("INSERT INTO sponsorship_campaigns VALUES (?,?,?,?,?,?,?,?,?,?,1,?,?,?) RETURNING id",newId,b.orgId,b.partnerName.trim(),b.label.trim(),safeDestination(b.destination),b.disclosure.trim(),b.status,b.reviewNote.trim(),b.startsAt,b.endsAt,actor,null,clock()).first();
 if(!result)deny(409,'revision_conflict');
 await q('INSERT INTO platform_audit(id,actor_id,action,detail,created_at) VALUES (?,?,?,?,?)',id(),actor,'sponsor.campaign.'+b.status,JSON.stringify({id:newId}),clock()).run();
 return json({item:campaign(await q('SELECT * FROM sponsorship_campaigns WHERE id=?',newId).first()),paidRankingEnabled:false,separatePlacement:true},key?200:201);
}
