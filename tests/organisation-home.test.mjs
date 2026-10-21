import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
class N{constructor(tag='div'){this.tag=tag;this.children=[];this.hidden=true;this.textContent='';this.listeners={}}append(...x){this.children.push(...x)}replaceChildren(...x){this.children=x}addEventListener(k,f){this.listeners[k]=f}focus(){}querySelectorAll(){return []}}
const roots=new Map(['home-spaces','home-spaces-list','organisation-sheet','organisation-body','organisation-title','organisation-close'].map(k=>[k,new N()]));
const walk=n=>[n,...n.children.flatMap(walk)],words=n=>walk(n).map(n=>n.textContent).join(' ');
let who={id:'student'},release=null,slow=false,deny=false,called=[];
const c={queueMicrotask,location:{pathname:'/app'},history:{pushState(){}},window:{addEventListener(){},OriviaAccounts:{get user(){return who}}},document:{getElementById:k=>roots.get(k),createElement:t=>new N(t),addEventListener(){},activeElement:null},AbortSignal,fetch:async(path,opts)=>{called.push({path,opts});if(slow)await new Promise(r=>release=r);if(deny)return Response.json({}, {status:403});return Response.json(path.includes('memberships')?{platformRoles:[],memberships:[{organisationId:'north',name:'Northbay',role:'student',status:'active'},{organisationId:'wait',name:'Pending university',role:'student',status:'requested'}]}:{organisation:{demo:true},content:[{kind:'guide',title:'Welcome',body:'<script>unsafe text</script>'}]})}};vm.createContext(c);vm.runInContext(fs.readFileSync('workers/trial-ui/spaces.js','utf8'),c);const s=c.window.OriviaSpaces;
await s.refresh();const list=roots.get('home-spaces-list');assert.match(words(list),/Northbay/);assert.match(words(list),/Waiting for approval/);assert.doesNotMatch(words(list),/Orivia management|Admin/);
await list.children.find(x=>x.tag==='button').onclick();assert.match(words(roots.get('organisation-body')),/<script>unsafe text/,'content remains text');assert.equal(called.at(-1).opts.headers['X-Orivia-Account'],'student');assert.equal(called.at(-1).opts.cache,'no-store');
s.reset();assert.equal(roots.get('organisation-sheet').hidden,true);assert.equal(roots.get('organisation-body').children.length,0);
slow=true;const request=s.refresh();who={id:'another'};s.reset();release();await request;assert.equal(list.children.length,0,'late response cannot restore old account content');
slow=false;who=null;await s.refresh();assert.equal(roots.get('home-spaces').hidden,true);
who={id:'student'};deny=true;await s.refresh();assert.match(words(list),/couldn’t be loaded/);assert.doesNotMatch(words(list),/Northbay/);
const js=fs.readFileSync('workers/trial-ui/spaces.js','utf8');assert.doesNotMatch(js,/innerHTML|localStorage|sessionStorage|\/v1\/chat/);assert.match(js,/e.key==='Tab'/);assert.match(js,/e.key==='Escape'/);
console.log('Organisation Home: student-only cards, pending state, plain-text content, account-bound requests, logout clearing, late-response isolation and access-loss handling passed. Transport scripted.');
