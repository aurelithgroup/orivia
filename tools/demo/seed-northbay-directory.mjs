// Adds the fictional Northbay campus directory (tools/demo/northbay-directory.mjs) to a Northbay demo organisation through
// the real content API, as a signed-in Northbay admin: each entry is drafted, then published. It refuses an organisation
// that isn't marked demo, so the fictional entries can't reach a real partner's space.
// Local:  node tools/demo/seed-northbay-directory.mjs http://localhost:8794 <organisationId>
//         (signs in as admin@northbay.example through the local server's /__dev/as helper)
// Pilot (only after the hold is lifted, by the authorised demo admin): pass ORIVIA_COOKIE and ORIVIA_ACCOUNT from that
// admin's own signed-in session. This script never asks for or stores a password.
import {NORTHBAY_DIRECTORY} from './northbay-directory.mjs';
const [base,oid]=process.argv.slice(2);if(!base||!oid){console.error('Usage: seed-northbay-directory.mjs <baseUrl> <organisationId>');process.exit(2)}
let who;
if(process.env.ORIVIA_COOKIE&&process.env.ORIVIA_ACCOUNT)who={cookie:process.env.ORIVIA_COOKIE,id:process.env.ORIVIA_ACCOUNT};
else{const r=await fetch(base+'/__dev/as?name=admin');if(r.status!==200){console.error('No local sign-in helper here: pass ORIVIA_COOKIE and ORIVIA_ACCOUNT');process.exit(2)}const d=await r.json();who={id:d.id,cookie:r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')}}
const call=async(path,method='GET',body)=>{const r=await fetch(base+path,{method,headers:{Cookie:who.cookie,'X-Orivia-Account':who.id,Origin:base,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});const d=await r.json().catch(()=>null);if(r.status>=300)throw Error(method+' '+path+': '+r.status+' '+JSON.stringify(d));return d};
const pre='/api/orgs/'+encodeURIComponent(oid),summary=await call(pre+'/summary');
if(!summary.organisation?.demo){console.error('Refused: '+(summary.organisation?.name||oid)+' is not a demo organisation.');process.exit(1)}
const existing=new Set(((await call(pre+'/content')).content||[]).map(c=>c.title));const added=[];
for(const e of NORTHBAY_DIRECTORY){if(existing.has(e.title))continue;const c=(await call(pre+'/content','POST',e)).content;await call(pre+'/content/'+c.id,'PATCH',{revision:c.revision,status:'published'});added.push(e.title)}
console.log(JSON.stringify({organisation:summary.organisation.name,added,skippedExisting:NORTHBAY_DIRECTORY.length-added.length}));
