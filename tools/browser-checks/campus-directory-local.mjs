// The Northbay campus directory (area 23) against the real accounts server (accounts-local-server.mjs): staff editing,
// what students see and when, the public page, and the organisation boundary. Fictional people and places only
// (@northbay.example, Building A). Each step records the real HTTP status; the run stops at the first unexpected one.
// Usage: node tools/browser-checks/campus-directory-local.mjs [baseUrl] [out.json]
import fs from 'node:fs';
const base=process.argv[2]||'http://localhost:8794',outFile=process.argv[3];
const steps=[];let failed=null;
async function as(name){const r=await fetch(base+'/__dev/as?name='+name);if(r.status!==200)throw Error('sign in '+name+': '+r.status);
 const who=await r.json();return {name,id:who.id,cookie:r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')}}
async function call(who,step,path,method='GET',body,expect=200){
 if(failed)return null;
 const r=await fetch(base+path,{method,headers:{...(who?{Cookie:who.cookie,'X-Orivia-Account':who.id}:{}),Origin:base,...(body!==undefined?{'Content-Type':'application/json'}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
 const text=await r.text();let data;try{data=JSON.parse(text)}catch{data=text}
 const ok=Array.isArray(expect)?expect.includes(r.status):r.status===expect;
 steps.push({step,as:who?.name||'signed out',method,route:path.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/g,':org').replace(/\/[A-Za-z0-9_-]{20,}(?=\/|$)/g,'/:id'),status:r.status,expected:expect,ok});
 if(!ok)failed={step,status:r.status,data:typeof data==='string'?data.slice(0,200):data};
 return data;
}
const owner=await as('owner'),admin=await as('admin'),editor=await as('editor'),student=await as('student'),eastgate=await as('eastgate');

// Two fictional organisations through partner onboarding.
async function partner(who,email,data){const inv=await call(owner,'Owner invites '+data.name,'/api/admin/onboarding','POST',{recipientEmail:email,confirm:true},201);
 const app=(await call(who,data.name+' admin opens the invitation','/api/partner/inspect','POST',{token:inv?.token}))?.application;
 await call(who,data.name+' admin submits its details','/api/partner/submit','POST',{token:inv?.token,revision:app?.revision,data,confirm:true});
 return (await call(owner,'Owner approves '+data.name,'/api/admin/onboarding/'+inv?.id+'/decision','POST',{decision:'approve',revision:(app?.revision??0)+1,confirm:true}))?.organisationId}
const org=await partner(admin,'admin@northbay.example',{name:'Northbay University',city:'Dubai',website:'https://northbay.example',contactEmail:'hub@northbay.example',country:'uae',region:'Dubai',town:'Dubai Academic City',reason:'study'});
const org2=await partner(eastgate,'eastgate@northbay.example',{name:'Eastgate College',city:'Edinburgh',website:'https://eastgate.example',contactEmail:'hub@eastgate.example',country:'uk',region:'Scotland',town:'Edinburgh',reason:'study'});
const pre='/api/orgs/'+org,me='/api/me/orgs/'+org;

// An editor joins Northbay's staff.
const staffInvite=await call(admin,'Admin invites an editor',pre+'/invitations','POST',{role:'editor',recipientEmail:'editor@northbay.example',label:'Student Hub team',expiresInSeconds:86400},201);
await call(editor,'Editor asks to join','/api/invitations/join','POST',{token:staffInvite?.token},[200,201]);
await call(editor,'The named editor is staff straight away (no approval step)',pre+'/content');

// 1. Staff editing.
const printing={kind:'contact',title:'Print and copy centre',body:'Print, scan and copy with your student ID card.',visibility:'members',details:{category:'printing',building:'Building A',room:'Ground floor, room A0.12',address:'Building A, Northbay University, Dubai Academic City',openingHours:'Sunday to Thursday, 8:00 to 18:00 in term time',accessibility:'Step-free entrance from the main courtyard. One height-adjustable printer.',directions:'From the main gate, walk past the library; it is the first door on the left.',sourceUrl:'https://northbay.example/printing',reviewedOn:'2026-10-29'}};
const draft=(await call(editor,'Editor drafts a directory entry',pre+'/content','POST',printing,201))?.content;
await call(editor,'An editor cannot publish it',pre+'/content/'+draft?.id,'PATCH',{revision:draft?.revision,status:'published'},403);
await call(student,'Before approval: a student sees no directory',me,'GET',undefined,403);
await call(admin,'Admin publishes it',pre+'/content/'+draft?.id,'PATCH',{revision:draft?.revision,status:'published'});
await call(editor,'A category alone is not an entry',pre+'/content','POST',{kind:'contact',title:'Somewhere',body:'Somewhere on campus.',visibility:'members',details:{category:'other'}},400);
await call(editor,'A “last checked” date in the future is refused',pre+'/content','POST',{kind:'contact',title:'Library',body:'Library.',visibility:'members',details:{building:'Building B',reviewedOn:'2099-01-01'}},400);
await call(editor,'Markup in a directory field is refused',pre+'/content','POST',{kind:'contact',title:'Library',body:'Library.',visibility:'members',details:{building:'<b>Building B</b>'}},400);
// Unknown details stay unknown: no opening information, no accessibility, no date.
const library=(await call(editor,'Editor drafts an entry with only what is known',pre+'/content','POST',{kind:'contact',title:'Main library',body:'Books, study rooms and quiet study.',visibility:'public',details:{category:'library',building:'Building B'}},201))?.content;
await call(admin,'Admin publishes it publicly',pre+'/content/'+library?.id,'PATCH',{revision:library?.revision,status:'published'});
const hidden=(await call(editor,'Editor drafts a third entry and leaves it as a draft',pre+'/content','POST',{kind:'contact',title:'Health centre (draft)',body:'Not checked yet.',visibility:'members',details:{category:'health',building:'Building C'}},201))?.content;

// 2. Students: after approval, published entries only, with exactly the details staff gave.
const join=await call(admin,'Admin creates a student invitation',pre+'/invitations','POST',{role:'student',label:'Autumn intake',expiresInSeconds:86400,maxUses:5},201);
await call(student,'Student asks to join','/api/invitations/join','POST',{token:join?.token},[200,201]);
await call(admin,'Admin approves the student',pre+'/requests/'+student.id+'/decision','POST',{decision:'approve'});
const space=await call(student,'After approval: the student sees the published directory',me);
const publicPage=await call(null,'Signed out: the public page shows only the public entry','/api/public/orgs/'+((await (await fetch(base+'/__dev/sql?t=organisations')).json()).find(o=>o.id===org)?.slug));

// 3. Editing stays revision-checked, and students see the change.
const current=(await call(admin,'Staff list',pre+'/content'))?.content?.find(c=>c.id===draft?.id);
await call(admin,'Admin updates the opening information',pre+'/content/'+draft?.id,'PATCH',{revision:current?.revision,title:printing.title,body:printing.body,visibility:'members',details:{...printing.details,openingHours:'Sunday to Thursday, 8:00 to 20:00 in exam weeks'}});
await call(editor,'An editor cannot change a published entry',pre+'/content/'+draft?.id,'PATCH',{revision:(current?.revision??0)+1,title:'Changed',body:'Changed',visibility:'members',details:printing.details},403);
await call(admin,'A stale edit is refused',pre+'/content/'+draft?.id,'PATCH',{revision:current?.revision,title:'Old',body:'Old',visibility:'members',details:printing.details},409);
const after=await call(student,'The student sees the new opening information',me);

// 4. The organisation boundary.
await call(eastgate,'Another organisation’s admin cannot list Northbay’s content',pre+'/content','GET',undefined,403);
await call(eastgate,'Another organisation’s admin cannot edit a Northbay entry',pre+'/content/'+draft?.id,'PATCH',{revision:(current?.revision??0)+1,title:'Changed',body:'Changed',visibility:'members',details:printing.details},[403,404]);
await call(eastgate,'Another organisation’s admin cannot read Northbay’s student space',me,'GET',undefined,403);
const eastEntry=(await call(eastgate,'Eastgate drafts its own members-only entry','/api/orgs/'+org2+'/content','POST',{kind:'contact',title:'Eastgate library',body:'Eastgate only.',visibility:'members',details:{category:'library',building:'Old College'}},201))?.content;
await call(eastgate,'Eastgate publishes it','/api/orgs/'+org2+'/content/'+eastEntry?.id,'PATCH',{revision:eastEntry?.revision,status:'published'});
await call(student,'A Northbay student cannot read Eastgate’s space','/api/me/orgs/'+org2,'GET',undefined,403);
await call(admin,'Northbay’s admin cannot edit Eastgate’s entry','/api/orgs/'+org2+'/content/'+eastEntry?.id,'PATCH',{revision:2,title:'x',body:'x',visibility:'members'},[403,404]);
const audit=await call(admin,'Activity history',pre+'/audit');

const dir=c=>c&&{title:c.title,status:c.status,visibility:c.visibility,details:c.details};
const facts={
 studentSees:(space?.content||[]).filter(c=>c.kind==='contact').map(dir),
 studentSeesAfterEdit:(after?.content||[]).find(c=>c.id===draft?.id)?.details?.openingHours,
 draftHiddenFromStudent:!(space?.content||[]).some(c=>c.id===hidden?.id),
 publicSees:(publicPage?.content||[]).map(c=>c.title),
 studentSeesEastgate:(space?.content||[]).some(c=>c.title.startsWith('Eastgate')),
 contentAudit:(audit?.entries||[]).map(e=>e.action).filter(a=>a.startsWith('content.')),
};
const result={ranAt:new Date().toISOString(),server:'accounts-local-server.mjs: real handleAccountRequest + Better Auth on in-memory SQLite; no fixtures',passed:!failed&&steps.every(s=>s.ok),steps,failed,facts,organisationId:org};
if(outFile)fs.writeFileSync(outFile,JSON.stringify(result,null,1)+'\n');
console.log(JSON.stringify({passed:result.passed,steps:steps.length,failed},null,1));
if(!result.passed)process.exitCode=1;
