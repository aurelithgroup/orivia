// Local design harness for the staff/owner console: the real platform page and script, with fixture API answers
// (no accounts, no database, no network out). For screenshots and click checks only.
// Usage: node tools/browser-checks/platform-harness.mjs [role=owner|admin]   → http://localhost:8793/manage or /platform?org=org-nb
import http from 'node:http';
import {platformPage,mountPlatform} from '../../workers/accounts/platform-ui.mjs';
const role=process.argv[2]||'owner',T=Date.now(),day=86400000;
const orgs=[
 {id:'org-nb',slug:'northbay',name:'Northbay University',city:'Sharjah',demo:true,status:'active',adminActive:true,adminInvitePending:false,totals:{students:42,staff:3,requests:2,published:9,drafts:2}},
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
 '/api/account/feedback/queue':{ratings:{days:30,up:3,down:1,reasons:{inaccurate:1}},reports:[{id:'r1',receipt:'FB-00000001',category:'technical',note:'The map link didn’t open.',replyText:null,status:'open',createdAt:T-day}]}};
const iso=k=>new Date(T+k*day).toISOString().slice(0,10);
const empty=process.argv[3]==='empty';
globalThis.orgApi=(oid,tail)=>{if(oid!=='org-nb')return null;
 if(tail==='summary')return {organisation:{id:'org-nb',slug:'northbay',name:'Northbay University',city:'Sharjah',demo:true},counts:[{role:'student',status:'active',count:42},{role:'student',status:'requested',count:empty?0:2},{role:'admin',status:'active',count:1}],activity:{joinedLast30Days:5,invitationUses:7,published:[{kind:'guide',count:1},{kind:'date',count:1}]},
  tasks:empty?{pendingJoins:0,drafts:{total:0,items:[]},upcomingDates:[],pastDates:[],datesWithoutDate:[],contactsMissingDetails:[],publishedContacts:1,today:iso(0)}:
   {pendingJoins:2,drafts:{total:1,items:[{id:'c2',kind:'guide',title:'Housing guide'}]},upcomingDates:[{id:'c3',kind:'date',title:'Visa medical',date:iso(3),time:null}],pastDates:[{id:'c5',kind:'date',title:'Orientation week',date:iso(-4)}],datesWithoutDate:[],contactsMissingDetails:[{id:'c4',kind:'contact',title:'International office'}],publishedContacts:1,today:iso(0)},
  analytics:{available:false,reason:'views_not_tracked'},applicationRecordsAvailable:false};
 if(tail==='content')return {content:[...content,{id:'c5',kind:'date',title:'Orientation week',body:'Welcome events',details:{date:iso(-4)},visibility:'members',status:'published',revision:1,updatedAt:T-5*day}]};
 if(tail==='progress')return {progress:{shown:false,reason:'reporting_paused',items:[]}};
 if(tail.startsWith('members'))return {members:[{userId:'u9',name:'Sara Example',email:'sara@example.test',role:'student',status:'requested'}],more:false};
 return null};
http.createServer((req,res)=>{const u=new URL(req.url,'http://x');const send=(code,type,body)=>{res.writeHead(code,{'Content-Type':type,'Cache-Control':'no-store'});res.end(body)};
 if(u.pathname==='/manage'||u.pathname==='/platform')return send(200,'text/html; charset=utf-8',platformPage.replace('<html','<html data-app-home="/"'));
 if(u.pathname==='/platform.js')return send(200,'application/javascript','(function(){const __name=f=>f;('+mountPlatform.toString()+')()})();');
 if(u.pathname==='/api/admin/orgs'){const q=(u.searchParams.get('q')||'').toLowerCase();return send(200,'application/json',JSON.stringify({organisations:orgs.filter(o=>!q||(o.name+' '+o.slug+' '+o.city).toLowerCase().includes(q))}))}
 const m=u.pathname.match(/^\/api\/orgs\/([^/]+)(?:\/(.*))?$/);
 if(m&&globalThis.orgApi){const r=globalThis.orgApi(m[1],m[2]||'',u);if(r)return send(200,'application/json',JSON.stringify(r))}
 if(api[u.pathname])return send(200,'application/json',JSON.stringify(api[u.pathname]));
 send(404,'application/json','{"error":"not_found"}');
}).listen(8793,()=>console.log('platform harness ('+role+') on http://localhost:8793'));
export {orgs,content,T,day};
