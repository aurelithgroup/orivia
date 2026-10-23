import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {planTrip,travelModeIn} from '../workers/orivia-transport.mjs';
import {runAssistantTurn,checkedHandoff} from '../workers/orivia-assistant.mjs';
import {createTrialWorker} from '../workers/orivia-ai-private-trial.mjs';
const initial='give me directions. how do i get to heriot watt dubai from al garhoud metro station by car';
assert.equal(travelModeIn(initial),'driving');assert.equal(travelModeIn('from Al Garhoud Metro Station'),null,'a station in the origin is not a transit choice');assert.equal(travelModeIn('not by car; by metro'),'transit');
let trip=planTrip([{role:'user',content:initial}]);assert.equal(trip.mode,'driving');assert.equal(trip.origin,'al garhoud metro station');assert.ok(!trip.need.includes('pref'));
const conversation=[{role:'user',content:initial},{role:'assistant',content:'The map card opens your driving route.'},{role:'user',content:"i've already decided im taking car. how long would it be?"}];trip=planTrip(conversation);assert.equal(trip.mode,'driving');assert.equal(trip.origin,'al garhoud metro station');assert.ok(trip.active);
const source='https://www.hw.ac.uk/dubai/visit/maps-and-directions';const evidence={id:'E1',url:source,title:'Heriot-Watt University Dubai',kind:'website',excerpt:'Heriot-Watt University Dubai\nDubai Knowledge Park, Dubai, United Arab Emirates'};
assert.equal(checkedHandoff({destinations:[{name:'Heriot-Watt University Dubai',evidence:'E1'}]},[evidence]).destinations.length,1,'registered acronym host is accepted for its actual institution');
const oldLog=console.log;console.log=()=>{};let call=0,response;
try{response=await runAssistantTurn({messages:[{role:'user',content:'Please check this page: '+source},...conversation]},{},{ai:{run:async()=>({response:JSON.stringify(++call===1?{action:'tools',calls:[{tool:'read_page',url:source,focus:'address'}]}:{action:'reply',sentences:[{kind:'general',text:'I cannot see live traffic. The driving card opens the route and current estimate in Maps.',evidence:[]}],destinations:[{name:'Heriot-Watt University Dubai',address:'Dubai Knowledge Park, Dubai, United Arab Emirates',evidence:'E1'}]})})},fetcher:async()=>new Response('<html><title>Heriot-Watt University Dubai</title><body><h1>Heriot-Watt University Dubai</h1><p>Dubai Knowledge Park, Dubai, United Arab Emirates</p></body></html>',{headers:{'content-type':'text/html'}})})}finally{console.log=oldLog}
assert.equal(response.destinations.length,1);assert.equal(response.destinations[0].route.mode,'driving');assert.equal(response.destinations[0].route.origin,'al garhoud metro station');
// A consented assistant handles the route instead of the old priority question.
let assistantCalls=0;const worker=createTrialWorker({assistant:()=>async()=>{assistantCalls++;return response}});
const host='https://orivia-ai-preview.habeebahsallah27.workers.dev',env={ACCESS_TEST_EMAIL:'founder@example.com',AI_QUOTA:{limit:async()=>({success:true})},BUDGET_DB:{prepare:()=>({bind:()=>({first:async()=>({calls:1})})})}};
const r=await worker.fetch(new Request(host+'/v1/chat',{method:'POST',headers:{origin:host,'content-type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:initial}],preferences:{language:'en'}})}),env,{access:{getIdentity:async()=>({email:'founder@example.com'})}});
assert.equal(r.status,200);const body=await r.json();assert.equal(assistantCalls,1);assert.equal(body.destinations[0].route.mode,'driving');assert.ok(!body.reply.includes('What matters most'));
const js=fs.readFileSync('workers/trial-ui/chat.js','utf8'),part=js.slice(js.indexOf('function mapSearchLinks('),js.indexOf('function placeIdentity('));const context={URLSearchParams};vm.createContext(context);vm.runInContext(part,context);
const links=context.mapSearchLinks(response.destinations[0]);assert.equal(new URL(links.google).searchParams.get('travelmode'),'driving');assert.equal(new URL(links.apple).searchParams.get('dirflg'),'d');assert.equal(new URL(links.google).searchParams.get('origin'),'al garhoud metro station');assert.ok(!links.google.includes('transit'));
console.log('Trip-to-card: chosen driving mode, origin and follow-up retained, registered official campus source, assistant route path and encoded driving links passed');
