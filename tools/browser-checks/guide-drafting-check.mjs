// AI guide drafting (area 21): what can be checked without OpenAI access. It reads a real public page through the
// drafting tool's own fetcher, then runs the tool's quote check with a SCRIPTED stand-in for the model (not OpenAI): an
// exact quote from the page must be kept with its source, and an invented one must be refused. Finally it asks the real
// local server's drafting endpoint, which must refuse safely while no OpenAI budget is configured.
// It does NOT show that the model drafts well: that needs OpenAI and the budget database (after the hold).
// Usage: node --experimental-sqlite tools/browser-checks/guide-drafting-check.mjs [out.json]
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import {draftInstitutionGuide} from '../../workers/accounts/guide-drafts.mjs';
const outFile=process.argv[2],checks=[];let failed=false;
const check=(name,ok,detail)=>{checks.push({check:name,ok:!!ok,...(detail!==undefined?{detail}:{})});if(!ok){failed=true;console.error('FAILED: '+name,detail??'')}};
const url='https://www.edinburgh.gov.uk/schools/term-dates',quote='Autumn Term starts Wednesday 12 August 2026';
const scripted=sections=>({run:async(_kind,req)=>{const sources=JSON.parse(req.messages[1].content).sources;scripted.seen=sources;return {response:JSON.stringify({sections:sections(sources)})}}});
try{
 const good=await draftInstitutionGuide({urls:[url],packageKey:'campus',consent:true},{},{ai:scripted(s=>[{heading:'Opening information',points:[{sourceId:s[0].id,quote}]}])});
 check('The real page was read through the drafting tool’s own fetcher',scripted.seen?.[0]?.url?.startsWith('https://www.edinburgh.gov.uk/')&&scripted.seen[0].text.includes('Autumn Term'),scripted.seen?.[0]?.url);
 check('An exact quote is kept, with its source page',good.sections[0]?.points[0]?.quote===quote&&good.sections[0].points[0].url?.startsWith('https://www.edinburgh.gov.uk/'),good.sections);
 check('The draft is a draft, says staff review is required, and lists what wasn’t confirmed',good.status==='draft'&&good.body.startsWith('AI-organised draft — staff review required')&&good.missing.includes('Facilities'),good.missing);
 let refused='';try{await draftInstitutionGuide({urls:[url],packageKey:'campus',consent:true},{},{ai:scripted(s=>[{heading:'Opening information',points:[{sourceId:s[0].id,quote:'Term starts on Sunday 1 August 2026 for all pupils'}]}])})}catch(e){refused=e.message}
 check('An invented quote is refused (nothing unsupported reaches a draft)',refused==='not_enough_evidence',refused);
 let consent='';try{await draftInstitutionGuide({urls:[url],packageKey:'campus',consent:false},{},{ai:scripted(()=>[])})}catch(e){consent=e.message}
 check('Staff consent to AI processing is required',consent==='staff_ai_consent_required',consent);
}catch(e){check('drafting run',false,String(e.stack||e))}
// The real endpoint, with no OpenAI configured: a safe refusal, nothing drafted.
const port=String(21200+Math.floor(Math.random()*300)),base='http://localhost:'+port;
const server=spawn(process.execPath,['--experimental-sqlite',new URL('accounts-local-server.mjs',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1'),port],{stdio:['ignore','pipe','pipe']});
try{
 for(let i=0;i<100;i++){try{await fetch(base+'/__dev/sql?t=organisations');break}catch{await new Promise(r=>setTimeout(r,100))}}
 const run=spawn(process.execPath,[new URL('university-workflow-local.mjs',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1'),base],{stdio:'ignore'});await new Promise(r=>run.on('exit',r));
 const oid=(await (await fetch(base+'/__dev/sql?t=organisations')).json()).find(o=>o.name==='Northbay University')?.id;
 const r=await fetch(base+'/__dev/as?name=admin'),who=await r.json(),cookie=r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
 const before=(await (await fetch(base+'/__dev/sql?t=organisation_content')).json()).length;
 const res=await fetch(base+'/api/orgs/'+oid+'/draft-guide',{method:'POST',headers:{Cookie:cookie,'X-Orivia-Account':who.id,Origin:base,'Content-Type':'application/json'},body:JSON.stringify({packageKey:'campus',urls:[url],documents:[],consent:true})});
 const body=await res.json().catch(()=>null),after=(await (await fetch(base+'/__dev/sql?t=organisation_content')).json()).length;
 check('Without OpenAI configured, the real endpoint refuses and drafts nothing',res.status===400&&body?.error==='budget_not_configured'&&after===before,{status:res.status,body,before,after});
}catch(e){check('endpoint run',false,String(e.stack||e))}finally{server.kill()}
const result={ranAt:new Date().toISOString(),what:'Guide drafting without OpenAI: real page reading and quote checks with a scripted stand-in model, and the real endpoint’s refusal without a budget. The model’s drafting itself is not verified.',passed:!failed,checks};
if(outFile)fs.writeFileSync(outFile,JSON.stringify(result,null,1)+'\n');
console.log(JSON.stringify({passed:result.passed,checks:checks.length,failed:checks.filter(c=>!c.ok).map(c=>c.check)}));
if(failed)process.exitCode=1;
