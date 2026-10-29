// Replays the Northbay university workflow against the real accounts server (accounts-local-server.mjs), with the same
// requests the staff, owner and student screens send. Fictional people only (@northbay.example). Each step records the real
// HTTP status; the run stops at the first unexpected one. The server's state is left in place for screenshots.
// Usage: node tools/browser-checks/university-workflow-local.mjs [baseUrl] [out.json]
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
 steps.push({step,as:who.name,method,route:path.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/g,':org').replace(/\/[A-Za-z0-9_-]{20,}(?=\/|$)/g,'/:id'),status:r.status,expected:expect,ok});
 if(!ok){failed={step,status:r.status,data:typeof data==='string'?data.slice(0,200):data}}
 return data;
}
const table=async t=>(await fetch(base+'/__dev/sql?t='+t)).json();

const owner=await as('owner'),admin=await as('admin'),student=await as('student'),outsider=await as('outsider');

// 1. Partner setup: owner invites a named admin, the admin submits public details, only the owner approves.
const inv=await call(owner,'Owner creates a named partner setup invitation','/api/admin/onboarding','POST',{recipientEmail:'admin@northbay.example',confirm:true},201);
await call(outsider,'Another account cannot open that invitation','/api/partner/inspect','POST',{token:inv?.token},404);
const app=(await call(admin,'Invited admin opens it','/api/partner/inspect','POST',{token:inv?.token}))?.application;
const details={name:'Northbay University',city:'Dubai',website:'https://northbay.example',contactEmail:'hub@northbay.example',country:'uae',region:'Dubai',town:'Dubai Academic City',reason:'study'};
await call(admin,'Admin submits public details for review','/api/partner/submit','POST',{token:inv?.token,revision:app?.revision,data:details,confirm:true});
await call(admin,'Admin cannot approve their own application','/api/admin/onboarding/'+inv?.id+'/decision','POST',{decision:'approve',revision:(app?.revision??0)+1,confirm:true},403);
const approved=await call(owner,'Owner approves','/api/admin/onboarding/'+inv?.id+'/decision','POST',{decision:'approve',revision:(app?.revision??0)+1,confirm:true});
const org=approved?.organisationId,pre='/api/orgs/'+org;

// 2. Staff set up the student space.
const arrival=await call(admin,'Welcome defaults carried over from the application',pre+'/arrival');
const guide=(await call(admin,'Admin drafts a members-only guide',pre+'/content','POST',{kind:'guide',title:'Collect your student ID card',body:'Bring your passport and offer letter to the Student Hub in Building A during orientation week.',visibility:'members',details:{}},201))?.content;
await call(admin,'Admin publishes it',pre+'/content/'+guide?.id,'PATCH',{revision:guide?.revision,status:'published'});
const join=await call(admin,'Admin creates a 7-day student invitation for 5 places',pre+'/invitations','POST',{role:'student',label:'Autumn intake',expiresInSeconds:7*86400,maxUses:5},201);
const token=join?.token;

// 3. A student asks to join; nothing is visible until staff approve.
await call(student,'Student opens the invitation','/api/invitations/inspect','POST',{token});
await call(student,'Student asks to join','/api/invitations/join','POST',{token},[200,201]);
await call(student,'Before approval: no student space',pre.replace('/api/orgs','/api/me/orgs'),'GET',undefined,403);
await call(student,'Before approval: no staff content list',pre+'/content','GET',undefined,403);
await call(admin,'Admin approves the request',pre+'/requests/'+student.id+'/decision','POST',{decision:'approve'});
const space=await call(student,'After approval: the student space shows the published guide',pre.replace('/api/orgs','/api/me/orgs'));

// 4. Support: the student writes to staff without consenting to forwarding; the admin replies.
const ticket=await call(student,'Student sends a support request (not forwardable)',pre+'/support','POST',{title:'Visa medical appointment',body:'I can’t find the letter for my visa medical appointment. Where do I collect it?',confirm:true,allowEscalation:false},201);
const list=await call(admin,'Admin sees the request',pre+'/support');
const t=(list?.tickets||[]).find(x=>x.id===ticket?.id);
await call(admin,'Admin cannot forward it to Orivia without consent',pre+'/support/'+ticket?.id+'/escalate','POST',{confirm:true},409);
await call(admin,'Admin replies and marks it resolved',pre+'/support/'+ticket?.id,'PATCH',{revision:t?.revision,reply:'Collect it from the Student Hub, Building A, with your passport.',status:'resolved'});
await call(admin,'A stale reply is refused, and records nothing',pre+'/support/'+ticket?.id,'PATCH',{revision:t?.revision,reply:'Late duplicate',status:'open'},409);
const mine=await call(student,'Student sees the reply',pre+'/support');

// 4b. Team assignment and filtering (area 24): admins assign a team and one of the organisation's admins, then filter.
const second=await call(student,'Student sends a second request',pre+'/support','POST',{title:'Accommodation deposit',body:'When is the deposit for my room in Northbay Residence due?',confirm:true,allowEscalation:false},201);
await call(admin,'Admin assigns it to Accommodation and to themself',pre+'/support/'+second?.id+'/assign','POST',{revision:0,team:'accommodation',assigneeId:admin.id});
await call(admin,'A stale assignment is refused, and records nothing',pre+'/support/'+second?.id+'/assign','POST',{revision:0,team:'fees',assigneeId:null},409);
await call(admin,'Only an admin of this organisation can be assigned',pre+'/support/'+second?.id+'/assign','POST',{revision:1,team:'accommodation',assigneeId:student.id},400);
await call(student,'A student cannot assign requests',pre+'/support/'+second?.id+'/assign','POST',{revision:1,team:null,assigneeId:null},403);
const assignedToMe=await call(admin,'Filter: assigned to me',pre+'/support?assignee=me');
const noTeam=await call(admin,'Filter: no team yet',pre+'/support?team=none');
const accommodation=await call(admin,'Filter: Accommodation, open',pre+'/support?team=accommodation&status=open');
const resolved=await call(admin,'Filter: resolved',pre+'/support?status=resolved');
await call(admin,'An unknown filter is refused',pre+'/support?status=closed',undefined,undefined,400);
const studentList=await call(student,'The student’s own list has no staff assignment details',pre+'/support');

// 4c. Linked process steps (area 24): a request points at a step of one of the same organisation's process templates.
const visaProcess=await call(admin,'Admin publishes a process template',pre+'/processes','POST',{title:'Student visa',status:'published',steps:[{id:'medical',title:'Book your visa medical',instructions:'Book at a government health centre after your entry permit is issued. Bring your passport and entry permit.',dependsOn:[]},{id:'emirates-id',title:'Give your Emirates ID fingerprints',instructions:'',dependsOn:['medical']}]},201);
const draftProcess=await call(admin,'Admin keeps a second template as a draft',pre+'/processes','POST',{title:'Moving into Northbay Residence',status:'draft',steps:[{id:'deposit',title:'Pay the room deposit',instructions:'Internal draft wording.',dependsOn:[]}]},201);
// A second fictional organisation with its own template, for the boundary.
const inv2=await call(owner,'Owner invites a second partner (Eastgate College)','/api/admin/onboarding','POST',{recipientEmail:'eastgate@northbay.example',confirm:true},201);
const eastgate=await as('eastgate');const app2=(await call(eastgate,'Eastgate admin opens it','/api/partner/inspect','POST',{token:inv2?.token}))?.application;
await call(eastgate,'Eastgate admin submits its details','/api/partner/submit','POST',{token:inv2?.token,revision:app2?.revision,data:{name:'Eastgate College',city:'Edinburgh',website:'https://eastgate.example',contactEmail:'hub@eastgate.example',country:'uk',region:'Scotland',town:'Edinburgh',reason:'study'},confirm:true});
const org2=(await call(owner,'Owner approves Eastgate','/api/admin/onboarding/'+inv2?.id+'/decision','POST',{decision:'approve',revision:(app2?.revision??0)+1,confirm:true}))?.organisationId;
const otherProcess=await call(eastgate,'Eastgate publishes its own template','/api/orgs/'+org2+'/processes','POST',{title:'Register with a GP',status:'published',steps:[{id:'register',title:'Register with a GP',instructions:'',dependsOn:[]}]},201);
const visaTicket=ticket?.id,linkPath=tid=>pre+'/support/'+tid+'/link';
await call(admin,'Another organisation’s template reads as not found',linkPath(visaTicket),'POST',{revision:0,processId:otherProcess?.id,stepId:'register'},404);
await call(eastgate,'Another organisation’s admin cannot link this request',linkPath(visaTicket),'POST',{revision:0,processId:otherProcess?.id,stepId:'register'},403);
await call(admin,'A step that isn’t in the template is refused',linkPath(visaTicket),'POST',{revision:0,processId:visaProcess?.id,stepId:'no-such-step'},400);
await call(admin,'Admin links the visa request to “Book your visa medical”',linkPath(visaTicket),'POST',{revision:0,processId:visaProcess?.id,stepId:'medical'});
await call(admin,'A stale link is refused, and records nothing',linkPath(visaTicket),'POST',{revision:0,processId:visaProcess?.id,stepId:'emirates-id'},409);
await call(student,'A student cannot link requests',linkPath(second?.id),'POST',{revision:0,processId:visaProcess?.id,stepId:'medical'},403);
await call(admin,'Admin links the deposit request to a draft step',linkPath(second?.id),'POST',{revision:0,processId:draftProcess?.id,stepId:'deposit'});
const linkedToVisa=await call(admin,'Filter: linked to Student visa',pre+'/support?process='+visaProcess?.id);
await call(admin,'Filtering by another organisation’s template is refused',pre+'/support?process='+otherProcess?.id,undefined,undefined,400);
const studentLinks=await call(student,'The student sees only the published step, with its instructions',pre+'/support');
await call(admin,'Admin removes the draft link',linkPath(second?.id),'POST',{revision:1,processId:null,stepId:null});
const unlinked=await call(admin,'Filter: no linked step',pre+'/support?process=none');
const eastgateList=await call(eastgate,'Eastgate’s inbox has none of Northbay’s requests','/api/orgs/'+org2+'/support');

// 5. Limits that must hold on the real server.
await call(admin,'Application records stay locked for admins',pre+'/records','GET',undefined,403);
await call(student,'A student cannot see the member list',pre+'/members','GET',undefined,403);
await call(outsider,'An outsider cannot see the organisation',pre+'/summary','GET',undefined,[403,404]);
const progress=await call(admin,'Progress totals stay paused below the reporting minimum',pre+'/progress');
const audit=await call(admin,'Activity history records the changes',pre+'/audit');

const facts={
 organisation:(await table('organisations')).map(o=>({name:o.name,slug:o.slug,status:o.status})),
 memberships:(await table('organisation_memberships')).map(m=>({role:m.role,status:m.status})),
 arrival:arrival?.arrival&&{country:arrival.arrival.country,region:arrival.arrival.region,town:arrival.arrival.town,reason:arrival.arrival.reason},
 studentSees:{guides:(space?.content||[]).map(c=>c.title),personalDataShared:space?.personalDataShared,applicationProgress:space?.applicationProgress},
 ticket:(mine?.tickets||[]).map(x=>({title:x.title,status:x.status,reply:x.reply,allowEscalation:x.allowEscalation})),
 progress:progress?.progress&&{shown:progress.progress.shown,reason:progress.progress.reason},
 auditActions:(audit?.entries||[]).map(e=>e.action),
 filters:{assignedToMe:(assignedToMe?.tickets||[]).map(x=>x.title),noTeam:(noTeam?.tickets||[]).map(x=>x.title),accommodationOpen:(accommodation?.tickets||[]).map(x=>x.title),resolved:(resolved?.tickets||[]).map(x=>x.title)},
 assignment:(assignedToMe?.tickets||[]).map(x=>({team:x.team,assignedToAdmin:x.assigneeId===admin.id,revision:x.assignmentRevision})),
 teams:(assignedToMe?.teams||[]).map(t=>t.label),
 links:{linkedToVisa:(linkedToVisa?.tickets||[]).map(x=>x.title+' → '+x.linkedStep?.stepTitle),noLinkAfterRemoval:(unlinked?.tickets||[]).map(x=>x.title),
  student:(studentLinks?.tickets||[]).map(x=>({title:x.title,linkedStep:x.linkedStep})),staffProcesses:(linkedToVisa?.processes||[]).map(x=>x.title+' ('+x.status+')'),eastgateSees:(eastgateList?.tickets||[]).length},
 studentSeesAssignment:(studentList?.tickets||[]).some(x=>'team' in x||'assigneeId' in x||'assigneeName' in x)||'assignees' in (studentList||{}),
};
const result={ranAt:new Date().toISOString(),server:'accounts-local-server.mjs: real handleAccountRequest + Better Auth on in-memory SQLite; no fixtures',passed:!failed&&steps.every(s=>s.ok),steps,failed,facts};
if(outFile)fs.writeFileSync(outFile,JSON.stringify(result,null,1)+'\n');
console.log(JSON.stringify({passed:result.passed,steps:steps.length,failed},null,1));
if(!result.passed)process.exitCode=1;
