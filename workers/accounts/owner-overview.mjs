/* Founder overview (master spec ORI-OWNER-001/002/007/009; Ina's priority after 5569f60).
   Real server-backed counts only, each with a written definition, plus budgets where an authoritative counter exists.
   Never reads chats, the account vault, files/documents, student progress, names or emails.
   Called only after the organisations handler has confirmed a verified platform owner. */
export const OVERVIEW_DEFINITIONS={
 organisations:'Organisations on Orivia. Active and paused are their current status; demo means not a real partnership.',
 activeStudents:'Memberships with role student and status active, counted per organisation (a person in two organisations counts twice).',
 activeStaff:'Memberships with role admin or editor and status active, per organisation.',
 joinRequests:'Memberships waiting for an organisation admin to approve (status requested).',
 openInvitations:'Invitations not revoked, not used up and not yet expired.',
 publishedContent:'Published guides, contacts, key dates and updates (current versions).',
 draftContent:'Drafts not yet published.',
 feedbackOpen:'Problem reports from Chat not yet marked reviewed. Ratings are not counted here.',
 budgets:'Spend counted against each limit by the server meter. For OpenAI and voice this includes reservations not yet settled, so it can be slightly higher than the final bill. Times are UTC days and months.'
};
const n=v=>Number(v)||0;
async function count(db,sql,...args){const r=await db.prepare(sql).bind(...args).first();return n(r?.n)}
async function safe(fn){try{return await fn()}catch(_){return null}}

export async function ownerOverview(env,{now=Date.now}={}){
 const db=env.ACCOUNTS_DB,t=now(),day=new Date(t).toISOString().slice(0,10),month=day.slice(0,7);
 const orgs=(await db.prepare("SELECT status,demo,COUNT(*) AS n FROM organisations GROUP BY status,demo").all()).results||[];
 const o={total:0,active:0,paused:0,demo:0};for(const r of orgs){o.total+=n(r.n);o[r.status]=(o[r.status]||0)+n(r.n);if(r.demo)o.demo+=n(r.n)}
 const counts={
  organisations:o,
  activeStudents:await count(db,"SELECT COUNT(*) AS n FROM organisation_memberships WHERE role='student' AND status='active'"),
  activeStaff:await count(db,"SELECT COUNT(*) AS n FROM organisation_memberships WHERE role IN ('admin','editor') AND status='active'"),
  joinRequests:await count(db,"SELECT COUNT(*) AS n FROM organisation_memberships WHERE status='requested'"),
  openInvitations:await count(db,"SELECT COUNT(*) AS n FROM organisation_invitations WHERE revoked=0 AND uses<max_uses AND expires_at>?",t),
  publishedContent:await count(db,"SELECT COUNT(*) AS n FROM organisation_content WHERE status='published'"),
  draftContent:await count(db,"SELECT COUNT(*) AS n FROM organisation_content WHERE status='draft'"),
  // null = the feedback table isn't there (shown as Unavailable), never 0.
  feedbackOpen:await safe(()=>count(db,"SELECT COUNT(*) AS n FROM feedback_reports WHERE status='open'"))
 };
 // Budgets: only from the counters the server itself enforces. Anything unreadable or unconfigured is Unavailable.
 const limit=v=>{const x=Number(v);return Number.isFinite(x)&&x>0?x:null};
 const meter=async(id,dayLimit,monthLimit)=>{
  if(dayLimit==null||monthLimit==null||!env.BUDGET_DB?.prepare)return null;
  const r=await safe(()=>env.BUDGET_DB.prepare('SELECT month,month_amount,day,day_amount FROM spend_meter WHERE id=?').bind(id).first());
  if(r===null)return null; // table or database unreadable
  return {day:{used:r&&r.day===day?n(r.day_amount)/1e6:0,limit:dayLimit},month:{used:r&&r.month===month?n(r.month_amount)/1e6:0,limit:monthLimit}};
 };
 const pool=/^[a-z]{1,16}$/.test(env.SEARCH_POOL||'')?env.SEARCH_POOL+':':'';
 const search=async()=>{const dl=limit(env.SEARCH_DAILY_CAP),ml=limit(env.SEARCH_MONTHLY_CAP);if(dl==null||ml==null||!env.BUDGET_DB?.prepare)return null;
  const rows=await safe(async()=>(await env.BUDGET_DB.prepare('SELECT period,calls FROM research_usage WHERE period IN (?,?)').bind(pool+'day:'+day,pool+'month:'+month).all()).results||[]);if(rows===null)return null;
  const get=p=>n(rows.find(r=>r.period===p)?.calls);return {day:{used:get(pool+'day:'+day),limit:dl},month:{used:get(pool+'month:'+month),limit:ml}}};
 const email=async()=>{const dl=limit(env.ACCOUNTS_EMAIL_DAY_CAP),ml=limit(env.ACCOUNTS_EMAIL_MONTH_CAP);if(dl==null||ml==null)return null;
  const r=await safe(()=>db.prepare('SELECT month,day,day_count,month_count FROM account_mail_meter WHERE month=?').bind(month).first());if(r===null)return null;
  return {day:{used:r&&r.day===day?n(r.day_count):0,limit:dl},month:{used:r?n(r.month_count):0,limit:ml}}};
 const budgets=[
  {id:'openai',label:'OpenAI (chat and documents)',unit:'USD',scope:'Shared meter: the pilot and myorivia.app count against the same limit.',value:await meter('openai',limit(env.PILOT_OPENAI_DAY_USD),limit(env.PILOT_OPENAI_MONTH_USD))},
  {id:'voice',label:'Natural voice (Listen)',unit:'USD',scope:'Shared meter; also counted inside the OpenAI limit.',value:env.VOICE_ENABLED==='1'?await meter('voice',limit(env.VOICE_DAY_USD),limit(env.VOICE_MONTH_USD)):null},
  {id:'search',label:'Web searches',unit:'searches',scope:pool?'This deployment’s own search counter ('+pool.slice(0,-1)+').':'This deployment’s search counter.',value:await search()},
  {id:'email',label:'Sign-in emails',unit:'emails',scope:'This deployment’s accounts database.',value:await email()},
 ].map(b=>b.value?{id:b.id,label:b.label,unit:b.unit,scope:b.scope,status:'available',...b.value}:{id:b.id,label:b.label,unit:b.unit,status:'unavailable'});
 return {generatedAt:new Date(t).toISOString(),definitions:OVERVIEW_DEFINITIONS,counts,budgets};
}

/* Organisation directory for the owner: search by name, web name or city, with operational totals per organisation
   (no member names or emails). */
export async function ownerOrganisations(db,{q='',now=Date.now}={}){
 const term=String(q||'').trim().toLowerCase().slice(0,80),like='%'+term.replace(/[\\%_]/g,c=>'\\'+c)+'%',t=now();
 const rows=(await db.prepare(`SELECT o.*,
   (SELECT COUNT(*) FROM organisation_memberships m WHERE m.org_id=o.id AND m.role='student' AND m.status='active') AS students,
   (SELECT COUNT(*) FROM organisation_memberships m WHERE m.org_id=o.id AND m.role IN ('admin','editor') AND m.status='active') AS staff,
   (SELECT COUNT(*) FROM organisation_memberships m WHERE m.org_id=o.id AND m.status='requested') AS requests,
   (SELECT COUNT(*) FROM organisation_content c WHERE c.org_id=o.id AND c.status='published') AS published,
   (SELECT COUNT(*) FROM organisation_content c WHERE c.org_id=o.id AND c.status='draft') AS drafts,
   EXISTS(SELECT 1 FROM organisation_memberships m WHERE m.org_id=o.id AND m.role='admin' AND m.status='active') AS admin_active,
   EXISTS(SELECT 1 FROM organisation_invitations i WHERE i.org_id=o.id AND i.role='admin' AND i.revoked=0 AND i.uses<i.max_uses AND i.expires_at>?) AS admin_invited
  FROM organisations o WHERE (?='' OR lower(o.name) LIKE ? ESCAPE '\\' OR o.slug LIKE ? ESCAPE '\\' OR lower(o.city) LIKE ? ESCAPE '\\')
  ORDER BY o.created_at DESC LIMIT 100`).bind(t,term,like,like,like).all()).results||[];
 return rows.map(o=>({id:o.id,slug:o.slug,name:o.name,city:o.city,demo:!!o.demo,status:o.status,adminActive:!!o.admin_active,adminInvitePending:!!o.admin_invited,
  totals:{students:n(o.students),staff:n(o.staff),requests:n(o.requests),published:n(o.published),drafts:n(o.drafts)}}));
}
