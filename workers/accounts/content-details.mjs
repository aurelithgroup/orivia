/* Optional structured details for organisation content, supplied by staff and validated here. Nothing is invented:
 * a missing value stays missing. Stored as JSON in organisation_content.details (NULL for older content).
 *  date:    {date:'YYYY-MM-DD', time?:'HH:MM', timeZone?:IANA zone (required with a time)}
 *  contact: {phone?, email?, website?}   (at least one when details are given)
 *  guide:   {sourceUrl?}
 *  update:  {relatedId?: a guide in the same organisation, actionLabel?, actionUrl?} (label and link go together) */
export class DetailsError extends Error{constructor(field){super('invalid_details:'+field);this.field=field}}
const bad=f=>{throw new DetailsError(f)};
const ALLOWED={date:['date','time','timeZone'],contact:['phone','email','website'],guide:['sourceUrl'],update:['relatedId','actionLabel','actionUrl']};

export function validDate(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const [y,m,d]=s.split('-').map(Number);const t=new Date(Date.UTC(y,m-1,d));return y>=2000&&y<=2100&&t.getUTCFullYear()===y&&t.getUTCMonth()===m-1&&t.getUTCDate()===d}
export function validTime(s){return typeof s==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s)}
export function validTimeZone(s){if(typeof s!=='string'||s.length>64||!/^[A-Za-z_]+(?:\/[A-Za-z0-9_+-]+){0,2}$/.test(s))return false;try{new Intl.DateTimeFormat('en',{timeZone:s});return true}catch(_){return false}}
export function validPhone(s){if(typeof s!=='string'||s.length>30||!/^\+?[0-9][0-9 ()-]*[0-9]$/.test(s))return false;const digits=s.replace(/\D/g,'').length;return digits>=6&&digits<=15}
export function validEmail(s){return typeof s==='string'&&s.length<=200&&/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(s)}
export function validHttps(s){if(typeof s!=='string'||s.length>500)return false;try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password&&!!u.hostname&&u.hostname.includes('.')}catch(_){return false}}

/* Returns the normalised details (or null when none were given). relatedIdOk(id) checks the same-organisation guide. */
export async function normaliseDetails(kind,input,{relatedIdOk=async()=>false}={}){
 if(input===undefined||input===null)return null;
 if(typeof input!=='object'||Array.isArray(input))bad('details');
 const allowed=ALLOWED[kind];if(!allowed)bad('kind');
 if(Object.keys(input).some(k=>!allowed.includes(k)))bad('field');
 const out={};const s=k=>typeof input[k]==='string'?input[k].trim():input[k];
 const set=(k,v)=>{if(v!==undefined&&v!==null&&v!=='')out[k]=v};
 if(kind==='date'){
  const date=s('date'),time=s('time'),tz=s('timeZone');
  if(!validDate(date))bad('date');set('date',date);
  if(time!==undefined&&time!==null&&time!==''){if(!validTime(time))bad('time');if(!validTimeZone(tz))bad('timeZone');set('time',time);set('timeZone',tz)}
  else if(tz!==undefined&&tz!==null&&tz!==''){if(!validTimeZone(tz))bad('timeZone');set('timeZone',tz)}
 }
 if(kind==='contact'){
  for(const [k,ok] of [['phone',validPhone],['email',validEmail],['website',validHttps]]){const v=s(k);if(v===undefined||v===null||v==='')continue;if(!ok(v))bad(k);set(k,v)}
  if(!Object.keys(out).length)bad('contact');
 }
 if(kind==='guide'){const v=s('sourceUrl');if(v!==undefined&&v!==null&&v!==''){if(!validHttps(v))bad('sourceUrl');set('sourceUrl',v)}}
 if(kind==='update'){
  const rid=s('relatedId');if(rid!==undefined&&rid!==null&&rid!==''){if(typeof rid!=='string'||rid.length>64||!await relatedIdOk(rid))bad('relatedId');set('relatedId',rid)}
  const label=s('actionLabel'),url=s('actionUrl');const hasL=!!label,hasU=!!url;
  if(hasL!==hasU)bad('action');
  if(hasL){if(typeof label!=='string'||label.length>60||/[\u0000-\u001f<>]/.test(label))bad('actionLabel');if(!validHttps(url))bad('actionUrl');set('actionLabel',label);set('actionUrl',url)}
 }
 return Object.keys(out).length?out:null;
}
export function parseDetails(raw){if(typeof raw!=='string'||!raw)return null;try{const v=JSON.parse(raw);return v&&typeof v==='object'&&!Array.isArray(v)?v:null}catch(_){return null}}
