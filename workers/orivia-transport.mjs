/* Transport workflow for the private trial.
 * Works out destination, departure and what matters most from the conversation
 * (and My Life, if the person chose to share it), asks only for what is missing,
 * then prepares Google Maps links with everything prefilled.
 * It never produces journey times, fares, routes or traffic: Maps shows those live.
 * Nothing here is stored.
 */
import {UNIVERSITY_SOURCES} from './orivia-journey-sources.mjs';
import {mapHandoffs} from './orivia-device-handoffs.mjs';

const RTA_PLANNER='https://www.rta.ae/wps/portal/rta/ae/home';
/* Emirates and big cities: real places, but too broad for a useful route */
const BROAD=['dubai','sharjah','ajman','abu dhabi','umm al quwain','ras al khaimah','rak','fujairah','al ain','uae','the uae','united arab emirates'];
const TITLE=s=>s.replace(/\b([a-z])/g,c=>c.toUpperCase()).replace(/\bUae\b/,'UAE').replace(/\bRak\b/,'RAK');

/* The questions Orivia asks. Their wording is how we recognise, later, what was asked. */
export const ASK={
 dest:'Which university or campus are you going to',
 origin:'where will you be travelling from',
 area:'Which part of ',
 pref:'What matters most for this trip: time, cost or reliability?'
};

/* Asking for help getting somewhere starts a trip; just naming a way to travel ("I'll take the metro",
   "the bus was late") only continues a trip that is already being planned. */
const TRANSPORT=/\b(get(?:ting)? to|go(?:ing)? to (?:uni|university|campus|college|class|work)|commut\w*|directions?|routes?|travel(?:l?ing)? (?:to|from)|compare (?:both|them|the (?:two|options))|how (?:do|can|should|would) i get|get there|getting there|fastest way|quickest way|cheapest way|way to (?:uni|campus|university|college))\b|\b(?:transport|metro|bus|taxi|tram|drive|driving)\b.{0,25}\bto (?:uni|university|campus|college|work|class)\b/i;
const MODE=/\b(bus(?:es)?|metro|tram|taxi|careem|uber|driv(?:e|ing)|transport|nol)\b/i;
const VISA=/\b(visa|emirates id|residen\w*|entry permit|permit|medical (?:test|fitness)|biometric\w*|fingerprint\w*|passport|attest\w*|certificate|document\w*)\b/i;
const REMIND=/\b(remind\w*|calendar|deadline|due|appointment|alarm|schedule)\b/i;
const CONFUSED=/^(?:what|huh|sorry|pardon|eh)\s*\?*[.!]*$|^(?:i don'?t (?:understand|get it)|what do you mean|confus\w*|i'?m (?:lost|confused))/i;
const DECLINE=/^(skip|doesn'?t matter|does not matter|any|anywhere|not sure|no idea|idk|i don'?t know|whatever|none|no preference|just (?:\w+\s?){1,3}|(?:\w+\s)?is fine|fine|no)\b/i;

const clean=s=>String(s||'').replace(/[\r\n<>{}]/g,' ').replace(/\s+/g,' ').trim();
const isOurs=(m,part)=>m?.role==='assistant'&&String(m.content).toLowerCase().includes(part.toLowerCase());

/* Which topic a single user message is about. null = a short reply that continues the current topic. */
export function topicOf(text,answeringTransport=false){
 const t=clean(text);
 if(TRANSPORT.test(t))return 'transport';
 if(MODE.test(t)&&!VISA.test(t))return null;
 if(VISA.test(t))return 'visa';
 if(answeringTransport||CONFUSED.test(t))return null;
 const p=placesIn(t);if(p.origin||p.dest)return null; // "actually I live in Muwaileh" carries on the trip
 if(/\b(time|cost|reliab\w*|fast\w*|quick\w*|cheap\w*)\b/i.test(t)&&t.split(' ').length<=5)return null;
 return t.split(' ').length>=4?'other':null;
}

function preferenceIn(text){
 const t=clean(text).toLowerCase();
 if(/\b(reliab\w*|predictab\w*|consistent|on time|dependab\w*)\b/.test(t))return 'reliability';
 if(/\b(time|fast\w*|quick\w*|asap|soonest|shortest)\b/.test(t))return 'time';
 if(/\b(cost|cheap\w*|budget|money|price|afford\w*|save)\b/.test(t))return 'cost';
 return null;
}
function university(text){
 const t=clean(text).toLowerCase();
 return UNIVERSITY_SOURCES.find(u=>u.aliases.some(a=>t.includes(a)))||null;
}
const GENERIC_DEST=/^(?:my |the )?(?:uni|university|campus|college|class(?:es)?|school)$/i;
function trimPlace(s){
 return clean(s).replace(/^(?:the |my )/i,'').replace(/\s+(?:please|thanks|thank you|tomorrow|today|every day|daily|in the morning|by bus|by car|by metro)$/i,'')
  .replace(/[.!?,;]+$/,'').slice(0,60).trim();
}
/* Places stated outright, anywhere in a message */
function placesIn(text){
 const t=clean(text), out={};
 const uni=university(t);if(uni)out.dest={name:uni.name,address:uni.address,checked:uni.url};
 const from=t.match(/\b(?:from|leaving|i live in|i'?m in|i am in|i stay in|i'?m staying in|i'?m based in|based in)\s+([A-Za-z][A-Za-z0-9' -]{1,60}?)(?=[,.;!?]|\s+(?:to|and|but|for|i|it|what|how|by|please|tomorrow|today)\b|$)/i);
 if(from&&!GENERIC_DEST.test(trimPlace(from[1]))&&!/^(?:a|an|the uae|uae|my|here|there|now)\b/i.test(from[1]))out.origin=trimPlace(from[1]);
 const area=t.match(/\b(?:from|in)\s+([A-Za-z][A-Za-z' -]{1,40}?),\s*(dubai|sharjah|ajman|abu dhabi)\b/i);
 if(area)out.origin=trimPlace(area[1])+', '+TITLE(area[2].toLowerCase());
 if(!out.dest){
  const to=t.match(/\b(?:get(?:ting)? to|go(?:ing)? to|travel(?:l?ing)? to|commute to|directions to|way to|study at|studying at)\s+([A-Za-z][A-Za-z0-9' &-]{1,60}?)(?=[,.;!?]|\s+(?:from|and|but|by|please|tomorrow|today|i)\b|$)/i);
  if(to&&!GENERIC_DEST.test(trimPlace(to[1])))out.dest={name:trimPlace(to[1])};
 }
 return out;
}
const broad=p=>!!p&&BROAD.includes(p.toLowerCase().replace(/,?\s*(uae|united arab emirates)$/,'').trim()||p.toLowerCase());

/* Reads the whole conversation and returns where the transport thread stands. */
export function planTrip(messages,profile){
 const msgs=Array.isArray(messages)?messages:[];
 const lastUser=msgs.findLastIndex(m=>m.role==='user');
 if(lastUser<0)return {active:false};
 // A terse answer belongs to the immediately preceding question, not to an
 // older trip. In particular, visa check-ups must not resurrect Maps buttons.
 const lastText=clean(msgs[lastUser].content);
 const previous=msgs[lastUser-1];
 if(previous?.role==='assistant'&&/^(?:yes|yep|yeah|no|nope|nah|not yet|not sure|unsure|idk|i don'?t know)[.!?\s]*$/i.test(lastText)
   &&/\b(?:medical fitness test|entry permit|residence visa|emirates id|fingerprint|biometric|visa application)\b/i.test(String(previous.content))
   &&/\?/.test(String(previous.content)))return {active:false};
 /* Is the latest message part of a transport conversation? Walk back to the last message that set a topic. */
 let topic=null,start=-1;
 const topicAt=i=>topicOf(msgs[i].content,Object.values(ASK).some(q=>isOurs(msgs[i-1],q)));
 for(let i=lastUser;i>=0;i--){
  if(msgs[i].role!=='user')continue;
  const t=topicAt(i);
  if(t){topic=t;start=i;break}
 }
 if(topic!=='transport')return {active:false};
 /* The trip began at the first message of this run of transport talk, so "I'll take the metro" keeps what's known */
 for(let i=start-1;i>=0;i--){
  if(msgs[i].role!=='user')continue;
  const t=topicAt(i);
  if(t&&t!=='transport')break;
  if(t==='transport')start=i;
 }
 const s={origin:'',dest:null,pref:null,asked:{dest:0,origin:0,area:0,pref:0}};
 const prof=profile&&typeof profile==='object'?profile:{};
 if(typeof prof.city==='string'&&!/not in the uae|somewhere else/i.test(prof.city)&&prof.city.trim())s.origin=clean(prof.city).slice(0,40),s.originFromProfile=true;
 if(typeof prof.place==='string'&&prof.place.trim()){const u=university(prof.place);s.dest=u?{name:u.name,address:u.address,checked:u.url}:{name:clean(prof.place).slice(0,60)};s.destFromProfile=true}
 let lastQuestion=null;
 for(let i=start;i<=lastUser;i++){
  const m=msgs[i];
  if(m.role==='assistant'){
   lastQuestion={dest:isOurs(m,ASK.dest),origin:isOurs(m,ASK.origin),area:isOurs(m,ASK.area),pref:isOurs(m,ASK.pref)};
   for(const k in lastQuestion)if(lastQuestion[k])s.asked[k]++;
   continue;
  }
  const text=clean(m.content), found=placesIn(text), pref=preferenceIn(text);
  if(found.dest){s.dest=found.dest;s.destFromProfile=false}
  if(found.origin){s.origin=found.origin;s.originFromProfile=false;s.areaGiven=!broad(found.origin)}
  if(pref)s.pref=pref;
  /* A short answer to the question Orivia just asked */
  const q=lastQuestion||{};lastQuestion=null;
  const question=/\?$/.test(text)||/^(why|what|how|which|who|can|could|do|does|is|are)\b/i.test(text);
  if(question||text.length>90)continue;
  const declined=DECLINE.test(text);
  let rest=text.replace(/\b(?:time|cost|reliability|the fastest|fastest|quickest|cheapest|fast|quick|cheap|it'?s|its|and|mostly|probably|for me)\b/gi,' ').replace(/[.!,;]+/g,' ').replace(/\s+/g,' ').trim();
  rest=rest.replace(/^(?:from|in|near|at|around|i live in|i'?m in)\s+/i,'');
  if(found.origin)rest=rest.replace(/\b(?:from|leaving|i live in|i'?m in|i am in|i stay in|i'?m staying in|i'?m based in|based in)\b.*$/i,'').trim();
  if(q.area&&!found.origin){
   if(rest&&!declined){s.origin=trimPlace(rest)+(s.origin&&broad(s.origin)?', '+TITLE(s.origin.toLowerCase()):'');s.areaGiven=true;s.originFromProfile=false}
   s.areaSettled=true;
  }
  if((q.dest||q.origin)&&rest&&!declined){
   const looksUni=/\b(uni|university|college|campus|institute|school|academy)\b/i.test(rest);
   if(q.dest&&!found.dest&&!s.dest&&(looksUni||!q.origin)){s.dest={name:trimPlace(rest)};s.destFromProfile=false}
   else if(q.origin&&!found.origin){s.origin=trimPlace(rest);s.areaGiven=!broad(s.origin);s.originFromProfile=false}
  }
  if(q.origin&&declined&&!s.origin)s.originUnknown=true;
  if(q.pref&&!pref)s.pref=s.pref||'none';
 }
 /* What is still missing, asked together in one message */
 const need=[];
 if(!s.dest&&s.asked.dest<2)need.push('dest');
 if(!s.origin&&!s.originUnknown&&!s.asked.origin)need.push('origin');
 if(s.origin&&broad(s.origin)&&!s.areaGiven&&!s.areaSettled&&!s.asked.area)need.push('area');
 if(!s.pref&&!s.asked.pref&&!need.includes('dest'))need.push('pref');
 const latest=clean(msgs[lastUser].content);
 const confused=CONFUSED.test(latest);
 const offScript=confused||/\?$/.test(latest)&&!TRANSPORT.test(latest); // e.g. "why do you need that?": let the AI answer
 const ready=!!s.dest&&(!!s.origin||s.originUnknown||s.asked.origin);
 return {active:true,...s,need,ready,confused,offScript,latest};
}

export function questionFor(plan){
 const n=plan.need, parts=[];
 const fromLife=[plan.destFromProfile&&plan.dest?plan.dest.name:'',plan.originFromProfile&&plan.origin?'leaving from '+plan.origin:''].filter(Boolean);
 const known=fromLife.length?'From My Life, I’ll use '+fromLife.join(', ')+'. ':'';
 if(n.includes('dest')&&n.includes('origin'))parts.push(ASK.dest+', and '+ASK.origin+'?');
 else if(n.includes('dest'))parts.push(ASK.dest+'?');
 else if(n.includes('origin'))parts.push(ASK.origin[0].toUpperCase()+ASK.origin.slice(1)+'?');
 if(n.includes('area'))parts.push(ASK.area+TITLE(plan.origin.toLowerCase().replace(/,.*$/,''))+' will you leave from? A neighbourhood or landmark is enough, or say “anywhere is fine”.');
 if(n.includes('pref'))parts.push(ASK.pref);
 if(!parts.length)return '';
 const lead=n.includes('dest')||n.includes('origin')?'I can open the route for you in Google Maps. ':'';
 return lead+known+parts.join(' ');
}

export function mapsLink(plan,mode){
 const p=new URLSearchParams({api:'1',destination:plan.dest.address||plan.dest.name+', United Arab Emirates',travelmode:mode});
 if(plan.origin)p.set('origin',/united arab emirates|\buae\b/i.test(plan.origin)?plan.origin:plan.origin+', United Arab Emirates');
 return 'https://www.google.com/maps/dir/?'+p.toString();
}

/* Links plus the facts the AI may use to phrase its reply */
export function tripActions(plan){
 const destination=plan.dest.address||plan.dest.name+', United Arab Emirates';
 const origin=plan.origin?(\/united arab emirates|\\buae\\b\/i.test(plan.origin)?plan.origin:plan.origin+', United Arab Emirates'):'';
 const transit=mapHandoffs({origin,destination,mode:'transit'});
 const drive=mapHandoffs({origin,destination,mode:'driving'});
 const actions=[
  {...transit.find(x=>x.id==='device'),title:'Open destination in device maps ↗'},
  {...transit.find(x=>x.id==='apple'),title:'Public transport in Apple Maps ↗'},
  {...transit.find(x=>x.id==='google'),title:'Public transport in Google Maps ↗'},
  {...drive.find(x=>x.id==='apple'),title:'Driving in Apple Maps ↗'},
  {...drive.find(x=>x.id==='google'),title:'Driving in Google Maps ↗'}
 ];
 if(/dubai/i.test((plan.dest.address||plan.dest.name)+' '+plan.origin))actions.push({title:'Dubai RTA journey planner (official) ↗',url:RTA_PLANNER,externalProvider:'Dubai RTA'});
 const prefLine={
  time:'Their priority is TIME. Tell them to open their preferred maps provider and compare the journey times its directions show, and to set the departure time in Maps to when they actually leave, because traffic and timetables change through the day.',
  cost:'Their priority is COST. Tell them their preferred maps provider may show transit fares, and that driving costs include fuel, tolls (Salik) and parking, which Maps does not total for them.',
  reliability:'Their priority is RELIABILITY. Tell them to compare the options in their preferred maps app at the time they normally travel, and that the official RTA planner is the authority for Dubai public transport.'
 }[plan.pref]||'They have not given a priority. Suggest comparing transit and driving in whichever supported maps provider they use.';
 const context=['TRANSPORT FACTS (prepared by Orivia; provider choices are shown as buttons under your reply):',
  'Destination: '+(plan.dest.name)+(plan.dest.address?' ('+plan.dest.address+', from the university’s official page)':' (place name only; Google Maps will search for it, so ask them to check the pin is right)')+'.',
  plan.origin?'Leaving from: '+plan.origin+(broad(plan.origin)?' (a whole emirate, so Maps will start from its centre; they can change the start point in Maps)':'')+'.':'Leaving from: not given, so Maps will start from their current location.',
  'Prepared handoffs: destination lookup for device maps (does NOT include the origin or navigation), plus driving and transit directions in Apple Maps and Google Maps'+(actions.length>2?', plus the official Dubai RTA journey planner':'')+'.',
  prefLine,
  'You have NOT seen any route, journey time, fare, distance or traffic. Never state or estimate one, and never name bus numbers, lines or stations. Their chosen maps app may show them live.',
  'HOW TO REPLY: In 1-3 short sentences, point them to the available Apple Maps, Google Maps and device-map handoff choices and explain how to compare them for what they care about. Do not give general advice about driving versus public transport. Do not suggest a reminder or calendar event unless they ask. If they ask a follow-up, answer it; if they change a place or priority, say the links are updated.'
 ].join('\n');
 return {actions,context};
}

/* What kind of next step fits the latest message (used to steer every AI reply) */
export function nextAction(messages,plan){
 const latest=clean(Array.isArray(messages)?messages.filter(m=>m.role==='user').at(-1)?.content:'');
 if(plan?.active)return plan.confused?'clarify':'directions';
 if(CONFUSED.test(latest))return 'clarify';
 if(REMIND.test(latest))return 'reminder';
 if(VISA.test(latest))return 'checked_guidance';
 return 'follow';
}
export const ACTION_GUIDE={
 directions:'NEXT USEFUL ACTION: help them get there with the prepared directions. No reminder or calendar suggestion.',
 clarify:'NEXT USEFUL ACTION: they seem confused. Explain your last message again in simpler, different words and ask what to clarify. Do not move to a new task or suggest a reminder.',
 reminder:'NEXT USEFUL ACTION: they mentioned a date, deadline or reminder. Offer to set a reminder and help pick the time.',
 checked_guidance:'NEXT USEFUL ACTION: give checked guidance or the relevant official contact. Only offer a reminder if a date or deadline is involved.',
 follow:'NEXT USEFUL ACTION: answer what they asked and follow their topic. Do not suggest a reminder or calendar event unless they mention a date, deadline or appointment.'
};

/* Output checks: no invented trip numbers, and no reminder offers nobody asked for */
const sentences=t=>String(t).match(/[^.!?\n]+[.!?]*\s*/g)||[];
const TRIP_NUMBERS=/\b\d+(?:[.,]\d+)?\s*(?:-|–|to)?\s*(?:\d+\s*)?(?:mins?|minutes?|hrs?|hours?|km|kilomet\w*)\b|\b(?:aed|dhs?|dirhams?)\s*\d|\b\d+(?:[.,]\d+)?\s*(?:aed|dhs?|dirhams?)\b|\b(?:route|bus|line|number)\s*(?:no\.?\s*)?[A-Z]?\d{1,4}\b|\b[EF]\d{2,3}\b/i;
export function stripTripNumbers(text){
 const kept=sentences(text).filter(s=>!TRIP_NUMBERS.test(s));
 return kept.join('').trim();
}
export function stripUnaskedReminder(text,action){
 if(action==='reminder')return text;
 const kept=sentences(text).filter(s=>!/\b(remind\w*|calendar|set an? alarm)\b/i.test(s));
 return kept.join('').trim()||text;
}
export const TRIP_FALLBACK='I can’t see live journey times or fares myself, but the buttons below open Google Maps with your trip filled in, so you can compare public transport and driving right now.';
