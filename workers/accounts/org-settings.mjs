/* Institution settings (ORI-UNI-015): what an organisation's admins can decide for their own space, and nothing more.
   - alerts: which kinds of news the organisation may send as device alerts (updates, key dates). Each student still
     chooses for themselves; turning a kind on never changes anyone's own notification choices.
   - studentContact: who students should contact (shown in their space). Validated like content contacts.
   - owners: which staff member looks after guides, members and invitations (must be active staff of this organisation).
   - exports: whether editors may download the aggregate counts CSV (admins always can). Counts only, never identities.
   - retention: how long declined and former members stay listed for staff (30, 90 or 365 days). Display only:
     a student's own data goes with their account.
   Unknown keys are refused, so a settings change can't switch on records access, change platform caps or progress
   reporting, or grant anything a role doesn't already have. */
import {validEmail,validPhone,validHttps} from './content-details.mjs';
export const SETTINGS_SQL=['CREATE TABLE IF NOT EXISTS organisation_settings(org_id TEXT PRIMARY KEY REFERENCES organisations(id) ON DELETE CASCADE, data TEXT NOT NULL, revision INTEGER NOT NULL, updated_by TEXT REFERENCES user(id) ON DELETE SET NULL, updated_at INTEGER NOT NULL)'];
export const DEFAULT_SETTINGS=Object.freeze({alerts:{updates:false,dates:false},studentContact:null,owners:{guides:null,members:null,invitations:null},exports:{editorsMayExportCounts:false},retention:{formerMembersDays:90}});
export class SettingsError extends Error{constructor(field){super('invalid_settings:'+field);this.field=field}}
const bad=f=>{throw new SettingsError(f)};
const only=(o,allowed,f)=>{if(!o||typeof o!=='object'||Array.isArray(o)||Object.keys(o).some(k=>!allowed.includes(k)))bad(f)};
const bool=(v,f)=>{if(typeof v!=='boolean')bad(f);return v};
/* input: a full or partial settings object. current: the stored settings. staffIds: active admin/editor user ids. */
export function normaliseSettings(input,current=DEFAULT_SETTINGS,staffIds=new Set()){
 only(input,['alerts','studentContact','owners','exports','retention'],'settings');
 const out=JSON.parse(JSON.stringify({...DEFAULT_SETTINGS,...current}));
 if('alerts' in input){only(input.alerts,['updates','dates'],'alerts');for(const k of Object.keys(input.alerts))out.alerts[k]=bool(input.alerts[k],'alerts.'+k)}
 if('studentContact' in input){const c=input.studentContact;
  if(c===null)out.studentContact=null;
  else{only(c,['label','email','phone','website'],'studentContact');const label=typeof c.label==='string'?c.label.trim():'';if(!label||label.length>80)bad('studentContact.label');
   const x={label};for(const [k,ok] of [['email',validEmail],['phone',validPhone],['website',validHttps]]){const v=typeof c[k]==='string'?c[k].trim():c[k];if(v===undefined||v===null||v==='')continue;if(!ok(v))bad('studentContact.'+k);x[k]=v}
   if(!x.email&&!x.phone&&!x.website)bad('studentContact.method');out.studentContact=x}}
 if('owners' in input){only(input.owners,['guides','members','invitations'],'owners');for(const [k,v] of Object.entries(input.owners)){if(v===null){out.owners[k]=null;continue}if(typeof v!=='string'||!staffIds.has(v))bad('owners.'+k);out.owners[k]=v}}
 if('exports' in input){only(input.exports,['editorsMayExportCounts'],'exports');out.exports.editorsMayExportCounts=bool(input.exports.editorsMayExportCounts,'exports.editorsMayExportCounts')}
 if('retention' in input){only(input.retention,['formerMembersDays'],'retention');if(![30,90,365].includes(input.retention.formerMembersDays))bad('retention.formerMembersDays');out.retention.formerMembersDays=input.retention.formerMembersDays}
 return out;
}
// Which top-level areas changed (for the audit line: what changed, never the values).
export function changedAreas(before,after){return Object.keys(DEFAULT_SETTINGS).filter(k=>JSON.stringify(before[k])!==JSON.stringify(after[k]))}
export function parseSettings(raw){try{const d=JSON.parse(raw);return normaliseSettings(d,DEFAULT_SETTINGS,new Set(Object.values(d?.owners||{}).filter(Boolean)))}catch(_){return JSON.parse(JSON.stringify(DEFAULT_SETTINGS))}}
// Counts CSV: aggregate rows only, formula-safe (a leading =, +, - or @ is neutralised).
const cell=v=>{let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
export function countsCsv(name,rows){return ['organisation,group,detail,count',...rows.map(r=>[name,r.group,r.detail,r.count].map(cell).join(','))].join('\n')+'\n'}
