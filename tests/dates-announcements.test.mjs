/* Dates and announcements (ORI-UNI-006): updates can end, ended ones stop appearing for students and show up for staff;
   past key dates fold away; editing a date tells staff what happens to saved copies, and a student whose saved copy is
   out of date is told and updates it only on their own tap. Real accounts + SQLite for the server; the shipped chat.js
   calendar code and spaces.js for the student side. Run: node --experimental-sqlite tests/dates-announcements.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import {normaliseDetails,DetailsError} from '../workers/accounts/content-details.mjs';
import {createAccountAuth} from '../workers/accounts/auth.mjs';
import {handleAccountRequest} from '../workers/accounts/handler.mjs';
const day=86400000,iso=n=>new Date(Date.now()+n*day).toISOString().slice(0,10);
// 1. Details: an end date is a real date or nothing.
assert.deepEqual(await normaliseDetails('update',{showUntil:iso(5)}),{showUntil:iso(5)});
for(const bad of ['2026-02-30','tomorrow','2026-13-01'])await assert.rejects(normaliseDetails('update',{showUntil:bad}),DetailsError);
// 2. Server: ended updates disappear for students, appear for staff; edits are revision-checked.
const wrap=sql=>{const statement=(text,args=[])=>({bind:(...v)=>statement(text,v),all:async()=>({results:sql.prepare(text).all(...args),meta:{changes:sql.prepare('SELECT changes() AS n').get().n},success:true}),first:async()=>sql.prepare(text).get(...args)||null,run:async()=>({meta:sql.prepare(text).run(...args),success:true})});
 return {prepare:text=>statement(text),exec:async text=>sql.exec(text),batch:async stmts=>{sql.exec('BEGIN IMMEDIATE');try{const out=[];for(const s of stmts)out.push(await s.all());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}}};
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON;'+['schema','organisations'].map(n=>fs.readFileSync('workers/accounts/'+n+'.sql','utf8')).join('\n'));
const origin='https://accounts.example.test',env={ACCOUNTS_ENABLED:'1',ACCOUNTS_ORIGIN:origin,ACCOUNTS_SECRET:'test-only-dates-secret-1234567890abcdef',ACCOUNTS_DB:wrap(sql),ACCOUNTS_EMAIL_ENABLED:'1',ACCOUNTS_FROM:'signin@example.test',ACCOUNTS_EMAIL:{send(){throw Error('no email')}},ORGANISATIONS_ENABLED:'1'};
const outbox=[],auth=createAccountAuth(env,{deliver:m=>outbox.push(m)});let ip=0;
const call=async(who,path,method='GET',body)=>{const r=await handleAccountRequest(new Request(origin+path,{method,headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'192.0.2.'+(++ip%250),...(who?{Cookie:who.cookie,'X-Orivia-Account':who.id}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})}),env,{},{auth});return {status:r.status,data:await r.json()}};
const signIn=async name=>{const email=name+'@northbay.example';await call(null,'/api/auth/email-otp/send-verification-otp','POST',{email,type:'sign-in'});const res=await handleAccountRequest(new Request(origin+'/api/auth/sign-in/email-otp',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'198.51.100.'+(++ip%250)},body:JSON.stringify({email,otp:outbox.at(-1).otp})}),env,{},{auth});const d=await res.json();return {id:d.user.id,cookie:res.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')}};
const owner=await signIn('owner'),admin=await signIn('mariam'),student=await signIn('aisha');sql.prepare('INSERT INTO platform_roles(user_id,role) VALUES (?,?)').run(owner.id,'owner');
const A=(await call(owner,'/api/admin/orgs','POST',{name:'Northbay University',slug:'northbay',city:'Dubai',demo:true})).data.organisation.id;
for(const [u,role] of [[admin,'admin'],[student,'student']])sql.prepare("INSERT INTO organisation_memberships(org_id,user_id,role,status,request_id,created_at,updated_at) VALUES (?,?,?,'active',?,?,?)").run(A,u.id,role,'r'+u.id,Date.now(),Date.now());
const make=async(kind,title,details)=>{const r=await call(admin,'/api/orgs/'+A+'/content','POST',{kind,title,body:'Text',visibility:'members',details});assert.equal(r.status,201,JSON.stringify(r.data));const id=r.data.content?.id||r.data.id;await call(admin,'/api/orgs/'+A+'/content/'+id,'PATCH',{revision:1,status:'published'});return id};
const ended=await make('update','Library closed for exams',{showUntil:iso(-1)}),current=await make('update','New bus timetable',{showUntil:iso(0)}),open=await make('update','Welcome week',null);
const dated=await make('date','Visa medical deadline',{date:iso(10),time:'17:00',timeZone:'Asia/Dubai'});
let seen=(await call(student,'/api/me/orgs/'+A)).data.content.map(c=>c.title);
assert.ok(!seen.includes('Library closed for exams'),'an ended update stops appearing');assert.ok(seen.includes('New bus timetable'),'still shown on its last day');assert.ok(seen.includes('Welcome week'));
const tasks=(await call(admin,'/api/orgs/'+A+'/summary')).data.tasks;assert.deepEqual(tasks.endedUpdates.map(u=>u.title),['Library closed for exams'],'staff see what ended');
// Editing a published date: revision-checked; a stale edit is refused.
let cur=(await call(admin,'/api/orgs/'+A+'/content')).data.content.find(c=>c.id===dated);
let r=await call(admin,'/api/orgs/'+A+'/content/'+dated,'PATCH',{revision:cur.revision,title:cur.title,body:cur.body,visibility:'members',details:{date:iso(12),time:'09:00',timeZone:'Asia/Dubai'}});assert.equal(r.status,200,JSON.stringify(r.data));
assert.equal((await call(admin,'/api/orgs/'+A+'/content/'+dated,'PATCH',{revision:cur.revision,title:'x',body:'y',visibility:'members',details:{date:iso(13)}})).status,409,'stale edit refused');
const edited=(await call(student,'/api/me/orgs/'+A)).data.content.find(c=>c.id===dated);assert.equal(edited.details.date,iso(12));assert.ok(edited.revision>cur.revision);
// 3. Student calendar: the shipped OriviaCalendar code.
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n');
const block=chat.slice(chat.indexOf('/* University dates (21 Oct)'),chat.indexOf('function saveChatReminder(r){'));
const cal={window:{},Intl,Date,Math,Number,String,Object,JSON,events:[],stored:0};vm.createContext(cal);vm.runInContext('function loadEvents(){}function storeEvents(){stored++}function renderEvents(){}function renderUpcoming(){}\n'+block,cal);
const C=cal.window.OriviaCalendar,tag={org:A,content:dated};
assert.equal(C.addOrganisationDate({...tag,revision:cur.revision,title:'Visa medical deadline',date:iso(10),time:'17:00',timeZone:'Asia/Dubai'}).ok,true);
const before=C.organisationItem(tag);assert.equal(before.source.revision,cur.revision);
assert.equal(C.updateOrganisationDate({...tag,revision:edited.revision,title:'Visa medical deadline',date:'2020-01-01',time:'09:00',timeZone:'Asia/Dubai'}).reason,'past','a new date in the past changes nothing');assert.equal(C.organisationItem(tag).at,before.at);
r=C.updateOrganisationDate({...tag,revision:edited.revision,title:'Visa medical deadline',date:iso(12),time:'09:00',timeZone:'Asia/Dubai'});assert.equal(r.ok,true);
assert.equal(C.organisationItem(tag).source.revision,edited.revision);assert.equal(C.organisationItem(tag).at,C.instant(iso(12),'09:00','Asia/Dubai').toISOString());assert.equal(cal.events.length,1,'updated, not duplicated');
assert.equal(C.updateOrganisationDate({org:A,content:'never-added',revision:1,title:'x',date:iso(3)}).reason,'missing');
// 4. The student's space: an out-of-date saved copy is flagged, past dates fold away, nothing changes without a tap.
class N{constructor(tag='div'){this.tag=tag;this.children=[];this.hidden=true;this.textContent='';this.dataset={};this.classList={add(){},remove(){}};this.className=''}
 append(...x){this.children.push(...x)}replaceChildren(...x){this.children=x}unshift(){}addEventListener(){}focus(){}scrollIntoView(){}querySelectorAll(){return []}get childElementCount(){return this.children.length}get lastChild(){return this.children.at(-1)}}
const roots=new Map(['home-spaces','home-spaces-list','organisation-sheet','organisation-body','organisation-title','organisation-close'].map(k=>[k,new N()]));
const walk=n=>[n,...(n.children||[]).flatMap(walk)],words=n=>walk(n).map(n=>n.textContent).join(' '),find=(n,text)=>walk(n).find(x=>x.textContent===text);
const savedCopy={id:'e1',at:C.instant(iso(10),'17:00','Asia/Dubai').toISOString(),source:{org:'north-1',content:'d1',revision:2}};let updates=0;
const fakeCal={instant:C.instant,hasOrganisationItem:()=>true,organisationItem:t=>t.content==='d1'?savedCopy:null,addOrganisationDate:()=>({ok:true}),updateOrganisationDate:o=>{updates++;return {ok:true}}};
const content=[{id:'d1',kind:'date',title:'Visa medical deadline',body:'Book.',details:{date:iso(12),time:'09:00',timeZone:'Asia/Dubai'},revision:5},{id:'d0',kind:'date',title:'Orientation week',body:'Done.',details:{date:iso(-20)},revision:1}];
const ctx={queueMicrotask,setTimeout,location:{pathname:'/app'},history:{pushState(){}},Intl,window:{addEventListener(){},OriviaAccounts:{get user(){return {id:'student'}}},OriviaCalendar:fakeCal},
 document:{getElementById:k=>roots.get(k)||null,createElement:t=>new N(t),addEventListener(){},activeElement:null},AbortSignal,
 fetch:async path=>Response.json(path.includes('memberships')?{platformRoles:[],memberships:[{organisationId:'north-1',name:'Northbay University',role:'student',status:'active'}]}:{organisation:{demo:false,name:'Northbay University'},content})};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('workers/trial-ui/spaces.js','utf8'),ctx);
await ctx.window.OriviaSpaces.refresh();await roots.get('home-spaces-list').children.find(x=>x.tag==='button').onclick();
const body=roots.get('organisation-body');assert.match(words(body),/Northbay University changed this date after you added it\. Your calendar still has/);assert.equal(updates,0,'nothing changes by itself');
find(body,'Update my calendar').onclick();assert.equal(updates,1);assert.match(words(body),/✓ Updated in your calendar/);
const fold=walk(body).find(n=>n.className==='org-past');assert.ok(fold,'past dates are folded');assert.match(words(fold),/Past dates \(1\)/);assert.match(words(fold),/Orientation week/);
assert.ok(!walk(fold).some(n=>n.textContent==='Add to my calendar'),'no calendar button on a past date');
// 5. The staff console: edit form, Show until, and what happens to students' saved copies.
const pui=fs.readFileSync('workers/accounts/platform-ui.mjs','utf8');for(const s of ["'Show until (optional)'","Students who already added this date keep their own calendar copy","'Save changes'","Service update ended on "])assert.ok(pui.includes(s),s);
console.log('Dates and announcements: updates end on their date and staff see them, past dates fold away, edits are revision-checked, a changed saved date is flagged and updated only on the student’s tap: pass.');
