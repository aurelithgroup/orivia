/* Run: node tests/ai-bridge.test.js */
const assert=require('node:assert/strict');
const bridge=require('../js/orivia-ai-bridge.js');
async function test(){
 const history=[
   {role:'user',text:"I'm starting university next month"},
   {role:'orivia',text:'Which university?'},
   {role:'user',text:'University of Wollongong Dubai'},
   {role:'orivia',text:'Where will you come from?'}
 ];
 const messages=bridge.prepare(history,'Sharjah. Compare driving and public transport.');
 assert.equal(messages.length,5);
 assert.equal(messages[0].role,'user');
 assert.equal(messages[1].role,'assistant');
 assert.match(messages.at(-1).content,/Sharjah/);
 assert.equal(bridge.prepare(history,'   '),null);
 assert.equal(bridge.allowed({enabled:true,path:'/api/orivia/chat'}),true);
 assert.equal(bridge.allowed({enabled:true,path:'https://evil.test/api'}),false);
 assert.equal(bridge.allowed({enabled:false,path:'/api/orivia/chat'}),false);
 let called=0;
 const fakeFetch=async(path,init)=>{
   called++;
   assert.equal(path,'/api/orivia/chat');
   assert.equal(init.credentials,'same-origin');
   assert.equal(init.headers.Authorization,undefined);
   const payload=JSON.parse(init.body);
   assert.deepEqual(payload.messages,messages);
   return {ok:true,json:async()=>({reply:'What days and times will you need to travel?',verifiedSources:[],liveInformation:false})};
 };
 let result=await bridge.send({history,text:'Sharjah. Compare driving and public transport.',
   preferences:{language:'en',style:'friendly'},config:{enabled:true,path:'/api/orivia/chat'},request:fakeFetch});
 assert.equal(result.ok,true);
 assert.match(result.reply,/days and times/);
 assert.equal(called,1);
 result=await bridge.send({history,text:'What about taxis?',
   config:{enabled:false,path:'/api/orivia/chat'},request:fakeFetch});
 assert.equal(result.reason,'not-enabled');
 assert.equal(called,1);
 result=await bridge.send({history,text:'What about taxis?',
   config:{enabled:true,path:'/api/orivia/chat'},request:async()=>({ok:false,status:401})});
 assert.equal(result.reason,'service-unavailable');
 assert.equal(result.status,401);
 console.log('AI bridge: 13 checks passed');
}
test().catch(e=>{console.error(e);process.exitCode=1});
