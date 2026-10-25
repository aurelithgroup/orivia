/* Reply feedback (master spec ORI-CHAT-007 rating, ORI-CHAT-008 report a problem, ORI-OWNER feedback queue).
   Signed-in people only: guests are told to sign in rather than shown a false success. Minimal retention: a rating is
   the reply reference, up/down and an optional reason; a report is a category, an optional note and, only when the
   person ticks it, the text of that one reply (which can itself contain personal or document-derived details). Rows are
   stored against the account (user_id, so they are deleted with it); the owner queue, for verified platform owners,
   does not display who sent them. No other conversation text, documents, name or email are stored with feedback. */
export const feedbackRoute=p=>p==='/api/account/feedback/rating'||p==='/api/account/feedback/report'||p==='/api/account/feedback/queue'||/^\/api\/account\/feedback\/queue\/[A-Za-z0-9-]{1,64}$/.test(p);
const REASONS=['inaccurate','unhelpful','unsafe','other'],CATEGORIES=['inaccurate','unsafe','privacy','technical','other'];
const replyRef=v=>typeof v==='string'&&/^[A-Za-z0-9:_-]{1,96}$/.test(v)?v:null;
const receiptOf=id=>'FB-'+id.slice(0,8).toUpperCase();

export async function handleFeedbackRequest(req,env,{owner,verified,json,readJson,clock=()=>Date.now(),newId=()=>crypto.randomUUID()}){
 const db=env.ACCOUNTS_DB,path=new URL(req.url).pathname;
 if(!db?.prepare)return json({error:'feedback_unavailable'},503);
 try{
  if(path==='/api/account/feedback/rating'&&req.method==='PUT'){
   const b=await readJson(req,2000);const ref=replyRef(b?.replyId);if(!ref)return json({error:'invalid_reply'},400);
   if(b.rating==='none'){await db.prepare('DELETE FROM reply_ratings WHERE user_id=? AND reply_ref=?').bind(owner,ref).run();return json({rating:null})}
   if(b.rating!=='up'&&b.rating!=='down')return json({error:'invalid_rating'},400);
   const reason=b.reason==null||b.reason===''?null:REASONS.includes(b.reason)?b.reason:'bad';if(reason==='bad')return json({error:'invalid_reason'},400);
   await db.prepare('INSERT INTO reply_ratings(user_id,reply_ref,rating,reason,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(user_id,reply_ref) DO UPDATE SET rating=excluded.rating,reason=excluded.reason,updated_at=excluded.updated_at').bind(owner,ref,b.rating,reason,clock()).run();
   return json({rating:b.rating,reason});
  }
  if(path==='/api/account/feedback/report'&&req.method==='POST'){
   const b=await readJson(req,80000);
   const requestId=typeof b?.requestId==='string'&&/^[A-Za-z0-9-]{8,64}$/.test(b.requestId)?b.requestId:null;if(!requestId)return json({error:'invalid_request'},400);
   if(!CATEGORIES.includes(b.category))return json({error:'invalid_category'},400);
   const note=typeof b.note==='string'?b.note.trim().slice(0,1000):'';const ref=b.replyId==null?null:replyRef(b.replyId);if(b.replyId!=null&&!ref)return json({error:'invalid_reply'},400);
   // Off by default: the reply text is kept only when the person explicitly included it, and only that one reply.
   if(b.includeReply===true&&typeof b.replyText==='string'&&b.replyText.length>16000)return json({error:'reply_too_large'},413);const excerpt=b.includeReply===true&&typeof b.replyText==='string'?b.replyText:null;
   // Idempotent: a retry with the same request id returns the first receipt and creates nothing new.
   const prior=await db.prepare('SELECT id FROM feedback_reports WHERE user_id=? AND request_id=?').bind(owner,requestId).first();
   if(prior)return json({receipt:receiptOf(prior.id),status:'received',repeat:true});
   const id=newId();
   await db.prepare("INSERT INTO feedback_reports(id,user_id,request_id,category,note,reply_ref,reply_excerpt,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'open',?,?) ON CONFLICT(user_id,request_id) DO NOTHING").bind(id,owner,requestId,b.category,note||null,ref,excerpt,clock(),clock()).run();
   const row=await db.prepare('SELECT id FROM feedback_reports WHERE user_id=? AND request_id=?').bind(owner,requestId).first();
   if(!row)return json({error:'not_saved'},500);
   return json({receipt:receiptOf(row.id),status:'received'},201);
  }
  if(path.startsWith('/api/account/feedback/queue')){
   const isOwner=verified&&!!await db.prepare("SELECT 1 AS yes FROM platform_roles WHERE user_id=? AND role='owner'").bind(owner).first();
   if(!isOwner)return json({error:'owner_required'},403);
   if(path==='/api/account/feedback/queue'&&req.method==='GET'){
    const since=clock()-30*86400000;
    const r=await db.prepare("SELECT SUM(rating='up') AS up,SUM(rating='down') AS down FROM reply_ratings WHERE updated_at>=?").bind(since).first();
    const reasons=(await db.prepare("SELECT reason,COUNT(*) AS n FROM reply_ratings WHERE rating='down' AND reason IS NOT NULL AND updated_at>=? GROUP BY reason").bind(since).all()).results||[];
    const reports=(await db.prepare('SELECT id,category,note,reply_excerpt,status,created_at FROM feedback_reports ORDER BY (status=\'open\') DESC,created_at DESC LIMIT 100').all()).results||[];
    return json({ratings:{days:30,up:r?.up||0,down:r?.down||0,reasons:Object.fromEntries(reasons.map(x=>[x.reason,x.n]))},
     reports:reports.map(x=>({id:x.id,receipt:receiptOf(x.id),category:x.category,note:x.note,replyText:x.reply_excerpt,status:x.status,createdAt:x.created_at}))});
   }
   const m=path.match(/^\/api\/account\/feedback\/queue\/([A-Za-z0-9-]{1,64})$/);
   if(m&&req.method==='POST'){const b=await readJson(req,500);if(b?.status!=='open'&&b?.status!=='reviewed')return json({error:'invalid_status'},400);
    const row=await db.prepare('UPDATE feedback_reports SET status=?,updated_at=? WHERE id=? RETURNING id,status').bind(b.status,clock(),m[1]).first();
    if(!row)return json({error:'not_found'},404);return json({id:row.id,status:row.status})}
  }
  return json({error:'not_found'},404);
 }catch(e){
  if(String(e?.message||e).includes('no such table'))return json({error:'feedback_unavailable'},503);
  console.log(JSON.stringify({event:'orivia-feedback-error',code:'storage'}));return json({error:'feedback_unavailable'},503);
 }
}
