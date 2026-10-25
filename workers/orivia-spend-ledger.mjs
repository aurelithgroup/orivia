/* Shared spending counter (D1). One row per meter; every reservation is a single atomic statement that checks the daily AND
 * monthly limit together, so concurrent requests can never jointly overspend. Each call gets a ticket. Uncertain outcomes keep
 * their full reservation; known usage settles to the actual amount (refunding only the unused part, never below zero).
 * Meters: 'openai' (micro-USD; 1 USD per 1M tokens = 1 micro-USD per token) and 'browser' (milliseconds of browser time).
 * No limit configured → fail closed (nothing is reserved). No prompts or identities are stored: amounts, status and time only.
 */
const SCHEMA=['CREATE TABLE IF NOT EXISTS spend_meter (id TEXT PRIMARY KEY, month TEXT NOT NULL, month_amount INTEGER NOT NULL, day TEXT NOT NULL, day_amount INTEGER NOT NULL)',
 'CREATE TABLE IF NOT EXISTS spend_ticket (id TEXT PRIMARY KEY, meter TEXT NOT NULL, month TEXT NOT NULL, day TEXT NOT NULL, reserved INTEGER NOT NULL, actual INTEGER, status TEXT NOT NULL, created TEXT NOT NULL)'];
const posInt=v=>{const n=Number(v);return Number.isFinite(n)&&n>0?Math.floor(n):0};
const keys=now=>({month:now.toISOString().slice(0,7),day:now.toISOString().slice(0,10)});

/** A meter on the shared database. limits: {month, day} in the meter's unit (0/missing = not configured → fail closed). */
export function createMeter(db,name,{month=0,day=0}={},{now=()=>new Date(),newId=()=>crypto.randomUUID()}={}){
 const ready=(async()=>{if(!db?.prepare)throw Error('ledger-db-missing');for(const s of SCHEMA)await db.prepare(s).run()})();
 const configured=posInt(month)>0&&posInt(day)>0;
 return {name,configured,limits:{month:posInt(month),day:posInt(day)},
  /** Reserve `amount` before spending. Returns a ticket id, or null if the limit would be exceeded or nothing is configured. */
  async reserve(amount){
   const a=Math.ceil(Number(amount));if(!configured||!Number.isFinite(a)||a<=0)return null;
   if(a>posInt(month)||a>posInt(day))return null;
   await ready;const k=keys(now());
   const row=await db.prepare(`INSERT INTO spend_meter (id,month,month_amount,day,day_amount) VALUES (?1,?2,?3,?4,?3)
     ON CONFLICT(id) DO UPDATE SET
      month_amount=CASE WHEN month=?2 THEN month_amount+?3 ELSE ?3 END,
      day_amount=CASE WHEN day=?4 THEN day_amount+?3 ELSE ?3 END,
      month=?2, day=?4
     WHERE (CASE WHEN month=?2 THEN month_amount+?3 ELSE ?3 END)<=?5 AND (CASE WHEN day=?4 THEN day_amount+?3 ELSE ?3 END)<=?6
     RETURNING month_amount,day_amount`).bind(name,k.month,a,k.day,posInt(month),posInt(day)).first();
   if(!row)return null;
   const id=newId();
   // If writing the ticket fails the reservation stays charged: conservative, never an untracked spend.
   await db.prepare('INSERT INTO spend_ticket (id,meter,month,day,reserved,actual,status,created) VALUES (?1,?2,?3,?4,?5,NULL,?6,?7)').bind(id,name,k.month,k.day,a,'reserved',now().toISOString()).run();
   return id;
  },
  /** Settle a ticket once. actual=null (unknown usage) keeps the whole reservation. Returns the charged amount. */
  async settle(ticket,actual,status='settled'){
   await ready;const known=actual!=null&&Number.isFinite(Number(actual))&&Number(actual)>=0;
   const t=await db.prepare("UPDATE spend_ticket SET actual=?1,status=?2 WHERE id=?3 AND meter=?4 AND status='reserved' RETURNING month,day,reserved").bind(known?Math.ceil(Number(actual)):null,known?status:'uncertain',ticket,name).first();
   if(!t)return null; // unknown or already settled: idempotent
   if(!known)return t.reserved;
   const delta=Math.ceil(Number(actual))-t.reserved; // negative = refund the unused part; positive = charge the overrun
   if(delta!==0){
    await db.prepare('UPDATE spend_meter SET month_amount=MAX(0,month_amount+?1) WHERE id=?2 AND month=?3').bind(delta,name,t.month).run();
    await db.prepare('UPDATE spend_meter SET day_amount=MAX(0,day_amount+?1) WHERE id=?2 AND day=?3').bind(delta,name,t.day).run();
   }
   return t.reserved+delta;
  },
  /** Aggregate usage only (for reports): amounts in the meter's unit. */
  async usage(){await ready;const k=keys(now());const r=await db.prepare('SELECT month,month_amount,day,day_amount FROM spend_meter WHERE id=?1').bind(name).first();
   return {month:r&&r.month===k.month?r.month_amount:0,day:r&&r.day===k.day?r.day_amount:0,limits:{month:posInt(month),day:posInt(day)}}}
 };
}

/* ---------- OpenAI budget for orivia-openai-pilot.mjs (reserve/record interface) ---------- */
// Rates are configuration the owner confirms on OpenAI's pricing page (USD per 1M tokens). Missing → fail closed.
// Reasoning tokens are billed as output tokens and are already inside max_output_tokens, so the output bound covers them.
export function openAIRates(env){const i=Number(env.OPENAI_INPUT_USD_PER_M),o=Number(env.OPENAI_OUTPUT_USD_PER_M);return i>0&&o>0?{input:i,output:o}:null}
const TOKENS_OVERHEAD=64; // message framing; input tokens never exceed UTF-8 bytes, so bytes + overhead is a safe upper bound
export function maxCallCostMicro(rates,{inputBytes,maxOutputTokens}){return Math.ceil((Number(inputBytes)+TOKENS_OVERHEAD)*rates.input+Number(maxOutputTokens)*rates.output)}
export function createOpenAIBudget(env,db,opts={}){
 const rates=openAIRates(env);
 const meter=createMeter(db,'openai',{month:Number(env.PILOT_OPENAI_MONTH_USD)*1e6,day:Number(env.PILOT_OPENAI_DAY_USD)*1e6},opts);
 const reserved=new Map();
 return {meter,rates,configured:!!rates&&meter.configured,
  async reserve(spec){if(!rates)return null;const max=maxCallCostMicro(rates,spec);const t=await meter.reserve(max);if(t)reserved.set(t,max);return t},
  async record(ticket,usage){
   const ok=Number.isSafeInteger(usage?.inputTokens)&&Number.isSafeInteger(usage?.outputTokens)&&usage.inputTokens>=0&&usage.outputTokens>=0&&(['completed','incomplete'].includes(usage?.status)||usage?.status==='not-dispatched'&&usage.inputTokens===0&&usage.outputTokens===0);
   const actual=ok?Math.ceil(usage.inputTokens*rates.input+usage.outputTokens*rates.output):null; // anything else: keep the reservation
   await meter.settle(ticket,actual,ok?usage.status:'uncertain');reserved.delete(ticket);
  }};
}
/* ---------- Browser time budget ---------- */
export function createBrowserBudget(env,db,opts={}){
 return createMeter(db,'browser',{month:Number(env.BROWSER_MONTH_SECONDS)*1000,day:Number(env.BROWSER_DAY_SECONDS)*1000},opts);
}
