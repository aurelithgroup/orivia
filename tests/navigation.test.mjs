/* Shared navigation (21 Oct): one space switcher and account menu for the app and dashboards, built only from the
 * server's memberships; addressable university spaces; the routes that serve them. Run: node tests/navigation.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {isAppPath} from '../workers/orivia-production.mjs';
import {isAppPath as doorPath} from '../workers/front-door/index.mjs';

const src=fs.readFileSync('workers/trial-ui/nav.js','utf8');
function load(pathname='/app',search=''){
 const ctx={location:{pathname,search},document:{readyState:'complete',documentElement:{dataset:{}},getElementById:()=>null,createElement:()=>({}),head:{append(){}},addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},window:{},URLSearchParams,encodeURIComponent};
 ctx.window=ctx;vm.createContext(ctx);vm.runInContext(src,ctx);
 // Copy results out of the sandbox's realm so strict comparisons work.
 const copy=f=>(...a)=>JSON.parse(JSON.stringify(f(...a)));return {...ctx.OriviaNav,menuItems:copy(ctx.OriviaNav.menuItems),currentSpace:copy(ctx.OriviaNav.currentSpace)};
}
const me={platformRoles:['owner'],memberships:[
 {organisationId:'north-1',name:'Northbay University',role:'student',status:'active'},
 {organisationId:'staff-2',name:'Southgate College',role:'admin',status:'active'},
 {organisationId:'edit-3',name:'Eastfield',role:'editor',status:'active'},
 {organisationId:'wait-4',name:'Westbrook',role:'student',status:'requested'},
 {organisationId:'gone-5',name:'Removed Uni',role:'student',status:'removed'}]};

// Every space comes from the server's answer: My Orivia, approved universities, manage spaces, pending, owner.
let nav=load('/app');let items=nav.menuItems(me,'/app');
assert.deepEqual(items.map(i=>i.key),['home','member:north-1','manage:staff-2','manage:edit-3','pending:wait-4','owner']);
assert.equal(items[0].href,'/app');assert.equal(items[1].href,'/app/space/north-1');assert.equal(items[2].href,'/platform?org=staff-2');assert.equal(items[2].prefix,'Manage');
assert.equal(items[4].note,'Waiting for approval');assert.equal(items.at(-1).href,'/manage');
assert.ok(!items.some(i=>/Removed/.test(i.label)),'removed memberships never appear');
// A student-only account sees no management entries; nothing is offered without the server saying so.
items=nav.menuItems({platformRoles:[],memberships:[me.memberships[0]]},'/app');assert.deepEqual(items.map(i=>i.key),['home','member:north-1']);
assert.deepEqual(nav.menuItems({},'/app').map(i=>i.key),['home']);
assert.deepEqual(nav.menuItems({platformRoles:['owner','owner2'],memberships:[{organisationId:'x',name:'X',role:'owner',status:'active'}]},'/app').map(i=>i.key),['home','owner'],'unknown roles are ignored');
// The pilot keeps personal Orivia at '/', so its spaces are /space/<id>.
assert.equal(nav.menuItems(me,'/')[1].href,'/space/north-1');assert.equal(nav.menuItems(me,'/')[0].href,'/');

// Which space a page is: Refresh, Back and direct links land in the same place.
assert.deepEqual({...nav.currentSpace({pathname:'/app/space/north-1',search:''})},{kind:'member',id:'north-1'});
assert.deepEqual({...nav.currentSpace({pathname:'/space/north-1',search:''})},{kind:'member',id:'north-1'});
assert.deepEqual({...nav.currentSpace({pathname:'/platform',search:'?org=staff-2'})},{kind:'manage',id:'staff-2'});
assert.equal(nav.currentSpace({pathname:'/manage',search:''}).kind,'owner');assert.equal(nav.currentSpace({pathname:'/app',search:''}).kind,'home');
assert.equal(nav.currentSpace({pathname:'/app/space/<script>',search:''}).kind,'home','odd addresses fall back to My Orivia');

// Menu content is text, never HTML; sign-out is announced to other tabs; the app's own Log out keeps its safeguard.
assert.doesNotMatch(src,/innerHTML|insertAdjacentHTML|outerHTML\s*=/);assert.match(src,/new BroadcastChannel\('orivia-account'\)/);
assert.match(src,/if\(inApp\(\)\)\{window\.OriviaAccounts\.open\(\);return\}/,'in the app, Sign out uses the account panel (unsynced-copy prompt)');
const accounts=fs.readFileSync('workers/trial-ui/accounts.js','utf8').replace(/\r\n/g,'\n');
assert.equal((accounts.match(/window\.OriviaNav\?\.announce\(null\)/g)||[]).length,2,'both Log out paths tell other tabs');
assert.match(accounts,/window\.OriviaNav\?\.announce\(user\.id\)/,'sign-in tells other tabs');

// Routes: the app page answers at the space addresses; the dashboards load the shared navigation script.
const trial=fs.readFileSync('workers/orivia-ai-private-trial.mjs','utf8');
assert.match(trial,/\/\^\\\/app\\\/space\\\/\[A-Za-z0-9-\]\{1,64\}\\\/\?\$\/\.test\(url\.pathname\)\)\)url\.pathname='\/'/);
assert.match(trial,/if\(url\.pathname==='\/orivia-nav\.js'&&req\.method==='GET'\)return new Response\("\/\* Orivia shared navigation/);
const platform=fs.readFileSync('workers/accounts/platform-ui.mjs','utf8');assert.match(platform,/<div id="orivia-nav"><\/div>/);assert.match(platform,/<script src="\/orivia-nav\.js"><\/script>/);
// myorivia.app: production and the front door agree on which paths are the app.
for(const p of ['/app/space/north-1','/orivia-nav.js','/app','/platform','/manage'])assert.ok(isAppPath(p)&&doorPath(p),p);
for(const p of ['/space/north-1','/app/space/','/app/space/a/b','/'])assert.ok(!isAppPath(p)&&!doorPath(p),p);
console.log('Navigation: spaces only from server memberships, addressable spaces, text-only menus, sign-out to other tabs, routes agree.');
