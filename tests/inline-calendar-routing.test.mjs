import assert from 'node:assert/strict';
import vm from 'node:vm';
import script from '../workers/orivia-inline-calendar.js';
function run(message,research){
 let listener,created=0,removed=0;
 const ctx={window:{oriviaResearchEnabled:()=>research},document:{getElementById:id=>id==='form'?{addEventListener:(_e,f)=>listener=f}:id==='msg'?{value:message}:id==='inline-calendar'?{remove:()=>removed++}:null,createElement:()=>{created++;throw Error('new-reminder form')}},URLSearchParams,Date};
 vm.createContext(ctx);vm.runInContext(script,ctx);
 try{listener()}catch(e){if(e.message!=='new-reminder form')throw e}
 return {created,removed};
}
for(const m of ['change the reminder to 12pm','move my reminder to Friday','cancel that reminder','update my appointment instead'])assert.equal(run(m,false).created,0,'edits never trigger add forms');
assert.equal(run('remind me to call tomorrow',true).created,0,'first research request reads current consent before the main handler sets any flag');
assert.equal(run('remind me to call tomorrow',false).created,1,'basic mode creation remains available');
assert.equal(run('what?',true).removed,1,'stale add form cleared on each new message');
console.log('Legacy calendar: edit vs add, current consent on first submit, basic creation and stale form cleanup passed');
