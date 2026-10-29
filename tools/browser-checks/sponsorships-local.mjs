// Sponsored placements (area 16) against the real accounts server (accounts-local-server.mjs): owner-only campaigns,
// disclosure rules, review before approval, dates, withdrawal, what students see, and the organisation boundary.
// Fictional sponsors and people only (*.example). Each step records the real HTTP status; the run stops at the first
// unexpected one. Usage: node tools/browser-checks/sponsorships-local.mjs [baseUrl] [out.json]
import fs from 'node:fs';
const base=process.argv[2]||'http://localhost:8794',outFile=process.argv[3];
const steps=[];let failed=null;
async function as(name){const r=await fetch(base+'/__dev/as?name='+name);if(r.status!==200)throw Error('sign in '+name+': '+r.status);
 const who=await r.json();return {name,id:who.id,cookie:r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')}}
async function call(who,step,path,method='GET',body,expect=200){
 if(failed)return null;
 const r=await fetch(base+path,{method,headers:{Cookie:who.cookie,'X-Orivia-Account':who.id,Origin:base,...(body!==undefined?{'Content-Type':'application/json'}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
 const text=await r.text();let data;try{data=JSON.parse(text)}catch{data=text}
 const ok=Array.isArray(expect)?expect.includes(r.status):r.status===expect;
 steps.push({step,as:who.name,method,route:path.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/g,':id'),status:r.status,expected:expect,ok,...(ok||typeof data!=='object'?{}:{error:data?.error})});
 if(!ok)failed={step,status:r.status,data:typeof data==='string'?data.slice(0,200):data};
 return data;
}
const owner=await as('owner'),admin=await as('admin'),student=await as('student'),eastgate=await as('eastgate'),outsider=await as('outsider');
async function partner(who,email,data){const inv=await call(owner,'Owner invites '+data.name,'/api/admin/onboarding','POST',{recipientEmail:email,confirm:true},201);
 const app=(await call(who,data.name+' admin opens the invitation','/api/partner/inspect','POST',{token:inv?.token}))?.application;
 await call(who,data.name+' admin submits its details','/api/partner/submit','POST',{token:inv?.token,revision:app?.revision,data,confirm:true});
 return (await call(owner,'Owner approves '+data.name,'/api/admin/onboarding/'+inv?.id+'/decision','POST',{decision:'approve',revision:(app?.revision??0)+1,confirm:true}))?.organisationId}
const org=await partner(admin,'admin@northbay.example',{name:'Northbay University',city:'Dubai',website:'https://northbay.example',contactEmail:'hub@northbay.example',country:'uae',region:'Dubai',town:'Dubai Academic City',reason:'study'});
const org2=await partner(eastgate,'eastgate@northbay.example',{name:'Eastgate College',city:'Edinburgh',website:'https://eastgate.example',contactEmail:'hub@eastgate.example',country:'uk',region:'Scotland',town:'Edinburgh',reason:'study'});
const join=await call(admin,'Admin creates a student invitation','/api/orgs/'+org+'/invitations','POST',{role:'student',label:'Autumn intake',expiresInSeconds:86400,maxUses:5},201);
await call(student,'Student asks to join','/api/invitations/join','POST',{token:join?.token},[200,201]);
await call(admin,'Admin approves the student','/api/orgs/'+org+'/requests/'+student.id+'/decision','POST',{decision:'approve'});
const mine='/api/me/orgs/'+org+'/sponsorships',seen=async(step)=>(await call(student,step,mine))?.placements||[];

const now=Date.now(),day=864e5;
const books={orgId:org,partnerName:'Harbour Books',label:'Sponsored: 10% off course books for new students',destination:'https://harbourbooks.example/students',disclosure:'Paid placement by Harbour Books. Not an official Northbay University service.',reviewNote:'',startsAt:now-day,endsAt:now+30*day,status:'draft',confirm:true};
const patch=(c,status,extra={})=>({...books,...extra,status,revision:c?.revision});
// 1. Only the owner runs campaigns; disclosure rules hold.
await call(admin,'A university admin cannot list campaigns','/api/admin/sponsorships','GET',undefined,403);
await call(admin,'A university admin cannot create one','/api/admin/sponsorships','POST',books,403);
await call(owner,'A label and disclosure that don’t say sponsored or paid are refused','/api/admin/sponsorships','POST',{...books,label:'10% off course books',disclosure:'Offer from Harbour Books.'},400);
await call(owner,'Calling the sponsor official is refused','/api/admin/sponsorships','POST',{...books,disclosure:'Sponsored. Harbour Books is official for Northbay.'},400);
await call(owner,'A link that isn’t https is refused','/api/admin/sponsorships','POST',{...books,destination:'http://harbourbooks.example/'},400);
let c=(await call(owner,'Owner creates a draft campaign','/api/admin/sponsorships','POST',books,201))?.item;
const draftSeen=await seen('A draft is not shown to students');
// 2. Review before approval.
await call(owner,'A draft cannot be approved directly','/api/admin/sponsorships/'+c?.id,'PATCH',patch(c,'approved',{reviewNote:'Checked label, link and dates.'}),409);
c=(await call(owner,'Owner sends it for review','/api/admin/sponsorships/'+c?.id,'PATCH',patch(c,'in_review')))?.item;
await call(owner,'Approval needs a review note','/api/admin/sponsorships/'+c?.id,'PATCH',patch(c,'approved',{reviewNote:'ok'}),400);
await call(owner,'Approval must match what was reviewed','/api/admin/sponsorships/'+c?.id,'PATCH',patch(c,'approved',{label:'Sponsored: 50% off',reviewNote:'Checked label, link and dates.'}),409);
c=(await call(owner,'Owner approves the reviewed campaign','/api/admin/sponsorships/'+c?.id,'PATCH',patch(c,'approved',{reviewNote:'Checked label, link and dates.'})))?.item;
const liveSeen=await seen('The student sees the approved placement');
const content=await call(student,'The university’s own content has no placement in it','/api/me/orgs/'+org);
// 3. The boundary: other organisations and people outside.
await call(eastgate,'Another organisation’s admin cannot read Northbay’s placements',mine,'GET',undefined,403);
await call(outsider,'Someone outside cannot read them',mine,'GET',undefined,403);
let e=(await call(owner,'Owner drafts a campaign for Eastgate','/api/admin/sponsorships','POST',{...books,orgId:org2,partnerName:'Castle Bikes',label:'Sponsored: bike hire for Eastgate students',destination:'https://castlebikes.example/',disclosure:'Paid placement by Castle Bikes.'},201))?.item;
e=(await call(owner,'Eastgate campaign to review','/api/admin/sponsorships/'+e?.id,'PATCH',{...books,orgId:org2,partnerName:'Castle Bikes',label:'Sponsored: bike hire for Eastgate students',destination:'https://castlebikes.example/',disclosure:'Paid placement by Castle Bikes.',status:'in_review',revision:e?.revision}))?.item;
await call(owner,'Eastgate campaign approved','/api/admin/sponsorships/'+e?.id,'PATCH',{...books,orgId:org2,partnerName:'Castle Bikes',label:'Sponsored: bike hire for Eastgate students',destination:'https://castlebikes.example/',disclosure:'Paid placement by Castle Bikes.',status:'approved',reviewNote:'Checked for Eastgate.',revision:e?.revision});
await call(owner,'A campaign can’t be moved to another organisation','/api/admin/sponsorships/'+c?.id,'PATCH',patch(c,'in_review',{orgId:org2}),409);
const afterOther=await seen('Northbay’s student still sees only Northbay’s placement');
// 4. Dates: an approved campaign that hasn't started isn't shown.
let f=(await call(owner,'Owner drafts a campaign starting next week','/api/admin/sponsorships','POST',{...books,label:'Sponsored: winter coat sale',startsAt:now+7*day,endsAt:now+20*day},201))?.item;
f=(await call(owner,'Future campaign to review','/api/admin/sponsorships/'+f?.id,'PATCH',{...books,label:'Sponsored: winter coat sale',startsAt:now+7*day,endsAt:now+20*day,status:'in_review',revision:f?.revision}))?.item;
await call(owner,'Future campaign approved','/api/admin/sponsorships/'+f?.id,'PATCH',{...books,label:'Sponsored: winter coat sale',startsAt:now+7*day,endsAt:now+20*day,status:'approved',reviewNote:'Checked; starts next week.',revision:f?.revision});
const beforeStart=await seen('Not shown before its start date');
// 5. Any change goes back to review; withdrawing stops it and locks it.
await call(owner,'An approved campaign can’t be edited in place','/api/admin/sponsorships/'+c?.id,'PATCH',patch(c,'approved',{label:'Sponsored: 15% off course books',reviewNote:'Checked label, link and dates.'}),409);
c=(await call(owner,'Editing sends it back to review','/api/admin/sponsorships/'+c?.id,'PATCH',patch(c,'in_review',{label:'Sponsored: 15% off course books for new students'})))?.item;
const duringReview=await seen('While back in review, students see nothing');
c=(await call(owner,'Owner re-approves the edited campaign','/api/admin/sponsorships/'+c?.id,'PATCH',patch(c,'approved',{label:'Sponsored: 15% off course books for new students',reviewNote:'Re-checked the new label.'})))?.item;
c=(await call(owner,'Owner withdraws it','/api/admin/sponsorships/'+c?.id,'PATCH',patch(c,'withdrawn',{label:'Sponsored: 15% off course books for new students'})))?.item;
await call(owner,'A withdrawn campaign is locked','/api/admin/sponsorships/'+c?.id,'PATCH',patch(c,'in_review',{label:'Sponsored: 15% off course books for new students'}),409);
const afterWithdraw=await seen('After withdrawal, students see nothing');
const list=await call(owner,'Owner’s campaign list','/api/admin/sponsorships');
const audit=(await (await fetch(base+'/__dev/sql?t=platform_audit')).json()).map(a=>a.action).filter(a=>a.startsWith('sponsor.'));

const facts={draftSeen:draftSeen.length,liveSeen,studentFields:Object.keys(liveSeen[0]||{}).sort(),contentHasPlacement:JSON.stringify(content?.content||[]).includes('Harbour Books'),
 afterOther:afterOther.map(p=>p.partnerName),beforeStart:beforeStart.map(p=>p.label),duringReview:duringReview.length,afterWithdraw:afterWithdraw.length,
 campaigns:(list?.items||[]).map(x=>({label:x.label,status:x.status})),paidRankingEnabled:list?.paidRankingEnabled,deliveryEnabled:list?.deliveryEnabled,audit};
const result={ranAt:new Date().toISOString(),server:'accounts-local-server.mjs: real handleAccountRequest + Better Auth on in-memory SQLite; no fixtures',passed:!failed&&steps.every(s=>s.ok),steps,failed,facts,organisationId:org};
if(outFile)fs.writeFileSync(outFile,JSON.stringify(result,null,1)+'\n');
console.log(JSON.stringify({passed:result.passed,steps:steps.length,failed},null,1));
if(!result.passed)process.exitCode=1;
