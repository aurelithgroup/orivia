import {readFileSync} from 'node:fs';
// Local design harness for the staff/owner console: the real platform page and script, with fixture API answers
// (no accounts, no database, no network out). For screenshots and click checks only.
// Usage: node tools/browser-checks/platform-harness.mjs [role=owner|admin]   → http://localhost:8793/manage or /platform?org=org-nb
import http from 'node:http';
import {platformPage,mountPlatform} from '../../workers/accounts/platform-ui.mjs';
import {mountRestoredUI} from '../../workers/accounts/restored-ui.mjs';
const role=process.argv[2]||'owner',T=Date.now(),day=86400000;
const orgs=[
 {id:'org-nb',slug:'northbay',name:'Northbay University',city:'Dubai',demo:true,status:'active',adminActive:true,adminInvitePending:false,totals:{students:42,staff:3,requests:2,published:9,drafts:2}},
 {id:'org-rv',slug:'riverside',name:'Riverside College',city:'Manchester',demo:true,status:'active',adminActive:false,adminInvitePending:true,totals:{students:0,staff:0,requests:0,published:0,drafts:0}}];
const overview={generatedAt:new Date(T).toISOString(),definitions:{organisations:'Organisations on Orivia. Active and paused are their current status; demo means not a real partnership.',activeStudents:'Memberships with role student and status active, counted per organisation.',activeStaff:'Memberships with role admin or editor and status active, per organisation.',joinRequests:'Memberships waiting for an organisation admin to approve (status requested).',openInvitations:'Invitations not revoked, not used up and not yet expired.',publishedContent:'Published guides, contacts, key dates and updates (current versions).',draftContent:'Drafts not yet published.',feedbackOpen:'Problem reports from Chat not yet marked reviewed.',budgets:'Spend counted against each limit by the server meter (includes unsettled reservations). UTC days and months.'},
 counts:{organisations:{total:2,active:2,paused:0,demo:2},activeStudents:42,activeStaff:3,joinRequests:2,openInvitations:4,publishedContent:9,draftContent:2,feedbackOpen:1},
 budgets:[{id:'openai',label:'OpenAI (chat and documents)',unit:'USD',scope:'Shared meter: the pilot and myorivia.app count against the same limit.',status:'available',day:{used:1.5,limit:5},month:{used:7.25,limit:20}},
  {id:'voice',label:'Natural voice (Listen)',unit:'USD',scope:'Shared meter; also counted inside the OpenAI limit.',status:'available',day:{used:0.12,limit:1},month:{used:0.9,limit:5}},
  {id:'search',label:'Web searches',unit:'searches',scope:'This deployment’s own search counter (pilot).',status:'available',day:{used:4,limit:10},month:{used:37,limit:100}},
  {id:'email',label:'Sign-in emails',unit:'emails',status:'unavailable'}]};
const content=[{id:'c1',kind:'guide',title:'Arrival checklist',body:'Steps',details:null,visibility:'members',status:'published',revision:2,updatedAt:T-2*day},
 {id:'c2',kind:'guide',title:'Housing guide',body:'Draft',details:null,visibility:'members',status:'draft',revision:1,updatedAt:T-day},
 {id:'c3',kind:'date',title:'Visa medical',body:'Bring passport',details:{date:new Date(T+3*day).toISOString().slice(0,10)},visibility:'members',status:'published',revision:1,updatedAt:T-day},
 {id:'c4',kind:'contact',title:'International office',body:'Ask us',details:null,visibility:'public',status:'published',revision:1,updatedAt:T-day}];
const api={
 '/api/account/session':{user:{id:'u1',name:'Test',email:'test@example.test'}},
 '/api/me/memberships':role==='owner'?{platformRoles:['owner'],memberships:[]}:{platformRoles:[],memberships:[{organisationId:'org-nb',name:'Northbay University',slug:'northbay',demo:true,role:'admin',status:'active'}]},
 '/api/admin/overview':overview,
 // Block one (owner areas): the same fixture shapes as Ina's tools/browser-checks/restored-block-one.mjs.
 '/api/admin/operations':{records:[],kinds:['source','partner','sponsor','release','incident','privacy','communication','package','plan'],fields:{source:['url','jurisdiction','checkedAt','reviewDue','notes'],partner:['name','website','contact','agreement','starts','ends'],sponsor:['name','website','scope','starts','ends','disclosure','fundedSeats'],release:['version','environment','rollback','checks','starts'],incident:['severity','service','impact','resolution','starts','ends'],privacy:['requestType','reference','due','resolution'],communication:['audience','message','starts','ends'],package:['audience','topics','instructions','sourceUrls'],plan:['tier','fileLimit','messageLimit','benefits','basicsFree']},states:Object.fromEntries(['source','partner','sponsor','release','incident','privacy','communication','package','plan'].map(k=>[k,['draft','reviewed','withdrawn']]))},
 '/api/admin/onboarding':{applications:[]},'/api/admin/people':{people:[],roles:[]},'/api/admin/privacy-requests':{requests:[]},'/api/admin/support-escalations':{requests:[]},
 '/api/admin/metrics':{definition:'Audit actions, not engagement.',dailyActivity:[],memberships:[]},'/api/admin/runtime':{note:'Read-only configuration.'},
 '/api/admin/entitlements':{plans:{free:{dailyMessages:25,storageMb:100,dailyUploads:40,maxFiles:500},plus:{dailyMessages:25,storageMb:100,dailyUploads:40,maxFiles:500},premium:{dailyMessages:25,storageMb:100,dailyUploads:40,maxFiles:500}},hardLimits:{dailyMessages:200,storageMb:100,dailyUploads:40,maxFiles:500},revision:0,enabled:false},
 '/api/me/notices':{notices:[]},'/api/me/support-consents':{requests:[]},
 '/api/account/feedback/queue':{ratings:{days:30,up:3,down:1,reasons:{inaccurate:1}},reports:[{id:'r1',receipt:'FB-00000001',category:'technical',note:'The map link didn’t open.',replyText:null,status:'open',createdAt:T-day}]}};
const iso=k=>new Date(T+k*day).toISOString().slice(0,10);
const empty=process.argv[3]==='empty';
globalThis.orgApi=(oid,tail)=>{if(oid!=='org-nb')return null;
 if(tail==='summary')return {organisation:{id:'org-nb',slug:'northbay',name:'Northbay University',city:'Dubai',demo:true},counts:[{role:'student',status:'active',count:42},{role:'student',status:'requested',count:empty?0:2},{role:'admin',status:'active',count:1}],activity:{joinedLast30Days:5,invitationUses:7,published:[{kind:'guide',count:1},{kind:'date',count:1}]},
  tasks:empty?{pendingJoins:0,drafts:{total:0,items:[]},upcomingDates:[],pastDates:[],datesWithoutDate:[],contactsMissingDetails:[],publishedContacts:1,today:iso(0)}:
   {pendingJoins:2,drafts:{total:1,items:[{id:'c2',kind:'guide',title:'Housing guide'}]},upcomingDates:[{id:'c3',kind:'date',title:'Visa medical',date:iso(3),time:null}],pastDates:[{id:'c5',kind:'date',title:'Orientation week',date:iso(-4)}],datesWithoutDate:[],contactsMissingDetails:[{id:'c4',kind:'contact',title:'International office'}],publishedContacts:1,today:iso(0)},
  analytics:{available:false,reason:'views_not_tracked'},applicationRecordsAvailable:false};
 if(tail==='content')return {content:[...content,{id:'c5',kind:'date',title:'Orientation week',body:'Welcome events',details:{date:iso(-4)},visibility:'members',status:'published',revision:1,updatedAt:T-5*day}]};
 if(tail==='progress')return {progress:{shown:false,reason:'reporting_paused',items:[]}};
 if(tail==='settings')return {revision:2,canEdit:role==='admin',staff:[{id:'u1',name:'Mariam Admin',role:'admin'},{id:'u2',name:'Eda Editor',role:'editor'}],settings:{alerts:{updates:true,dates:false},studentContact:{label:'Student Hub',email:'hub@northbay.example',phone:'+971 4 000 0000'},owners:{guides:'u2',members:'u1',invitations:null},exports:{editorsMayExportCounts:false},retention:{formerMembersDays:90}}};
 if(tail==='audit')return {entries:[{action:'settings.updated',at:T-3600000,actor:'Mariam Admin',areas:['alerts','studentContact']},{action:'export.counts',at:T-7200000,actor:'Mariam Admin'},{action:'membership.left',at:T-day,actor:'A student'}]};
 // Block one (staff areas), fictional: one support ticket, one process template, one guide package.
 // Student welcome defaults (fictional Northbay, Dubai).
 if(tail==='invitations')return {invitations:[]};
 if(tail==='codes')return {codes:[]};
 if(tail==='arrival')return {arrival:{country:'uae',region:'Dubai',town:'Dubai Academic City',reason:'study',revision:1}};
 if(tail==='support')return {tickets:empty?[]:[{id:'t1',title:'Visa medical appointment',body:'I can’t find my appointment letter.',status:'open',reply:'',createdAt:T-day}]};
 if(tail==='processes')return {processes:[{id:'p1',title:'Student residence visa',status:'published',revision:1,data:{steps:[{title:'Send a passport copy to the visa office'},{title:'Medical fitness test'},{title:'Emirates ID biometrics'}]}}]};
 if(tail==='guide-packages')return {packages:{campus:{title:'Campus essentials',sourceUrls:['https://northbay.example/campus']}}};
 if(tail.startsWith('members'))return {members:[{userId:'u9',name:'Sara Example',email:'sara@example.test',role:'student',status:'requested'}],more:false};
 return null};
http.createServer((req,res)=>{const u=new URL(req.url,'http://x');const send=(code,type,body)=>{res.writeHead(code,{'Content-Type':type,'Cache-Control':'no-store'});res.end(body)};
 if(u.pathname==='/manage'||u.pathname==='/platform')return send(200,'text/html; charset=utf-8',platformPage.replace('<html','<html data-app-home="/"'));
 // The shared navigation script, as the worker serves it (skipped quietly if it isn't present).
 if(u.pathname==='/orivia-nav.js'){try{return send(200,'application/javascript',readFileSync(new URL('../../workers/trial-ui/nav.js',import.meta.url),'utf8'))}catch{return send(200,'application/javascript','')}}
 // Served like organisations.mjs does since Ina's block one: the restored management UI first, then the platform script.
 if(u.pathname==='/platform.js')return send(200,'application/javascript','(function(){const __name=f=>f;window.OriviaRestoredUI=('+mountRestoredUI.toString()+');('+mountPlatform.toString()+')()})();');
 if(u.pathname==='/api/admin/orgs'){const q=(u.searchParams.get('q')||'').toLowerCase();return send(200,'application/json',JSON.stringify({organisations:orgs.filter(o=>!q||(o.name+' '+o.slug+' '+o.city).toLowerCase().includes(q))}))}
 const m=u.pathname.match(/^\/api\/orgs\/([^/]+)(?:\/(.*))?$/);
 // As organisations.mjs: application records stay locked for every role.
 if(m&&m[2]==='records')return send(403,'application/json','{"error":"separate_records_permission_required"}');
 if(m&&globalThis.orgApi){const r=globalThis.orgApi(m[1],m[2]||'',u);if(r)return send(200,'application/json',JSON.stringify(r))}
 if(api[u.pathname])return send(200,'application/json',JSON.stringify(api[u.pathname]));
 send(404,'application/json','{"error":"not_found"}');
}).listen(8793,()=>console.log('platform harness ('+role+') on http://localhost:8793'));
export {orgs,content,T,day};
