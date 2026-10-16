/* Confirmed-source university lookup and external live journey links.
 * Sources were checked 2026-10-16; links open external journey planners.
 * This module deliberately never fabricates route metrics or live availability.
 */
export const UNIVERSITY_SOURCES=Object.freeze([
 {id:'uowd', aliases:['university of wollongong','wollongong dubai','uowd'],
  name:'University of Wollongong in Dubai',address:'UOWD Building, Dubai Knowledge Park, Dubai, United Arab Emirates',
  url:'https://www.uowdubai.ac.ae/contact-us',checkedOn:'2026-10-16'}
]);
const OFFICIAL_RTA='https://rta.ae/wps/portal/rta/ae/home/rta-services/service-details?serviceId=209';
function safeText(value){return typeof value==='string'?value.trim().slice(0,160):''}
export function findUniversity(history){
 const text=(Array.isArray(history)?history:[]).filter(x=>x?.role==='user').map(x=>safeText(x.content)).join(' ').toLowerCase();
 return UNIVERSITY_SOURCES.find(x=>x.aliases.some(a=>text.includes(a)))||null;
}
export function findDeparture(history){
 const messages=(Array.isArray(history)?history:[]).filter(x=>x?.role==='user').map(x=>safeText(x.content));
 for(let i=messages.length-1;i>=0;i--){
  const str=messages[i];
  const match=str.match(/\b(?:from|travelling from|traveling from|leaving from)\s+([a-z][a-z\s-]{1,70})(?=[,.;!?]|\s+(?:to|by|and|compare|please|tomorrow|today)|$)/i);
  if(match)return match[1].trim().replace(/\s+(?:university|campus)$/i,'');
  if(/\bsharjah\b/i.test(str))return 'Sharjah, United Arab Emirates';
 }
 return '';
}
export function journeyResources(history){
 const uni=findUniversity(history);
 if(!uni)return {context:'',sources:[],actions:[]};
 const departure=findDeparture(history);
 const destination=uni.address;
 const directions=mode=>{
  const p=new URLSearchParams({api:'1',destination,travelmode:mode});
  if(departure)p.set('origin',departure);
  return 'https://www.google.com/maps/dir/?'+p.toString();
 };
 const sources=[
  {title:'University official campus address',url:uni.url,description:uni.address,verifiedOn:uni.checkedOn},
  {title:'Dubai RTA public transport planning',url:OFFICIAL_RTA,description:'Official journey planning information',verifiedOn:uni.checkedOn}
 ];
 const actions=[
  {title:'Check public transport options',url:directions('transit'),externalProvider:'Google Maps'},
  {title:'Check driving options',url:directions('driving'),externalProvider:'Google Maps'},
  {title:'Check official Dubai transport planner',url:OFFICIAL_RTA,externalProvider:'Dubai RTA'}
 ];
 const context='Verified source registry: '+uni.name+' campus address: '+uni.address+
 '. Official university source: '+uni.url+'. Dubai RTA public transport planning: '+OFFICIAL_RTA+
 '. Source links checked '+uni.checkedOn+'. No route, fare, trip duration, or availability was retrieved. '+
 (departure?'User described an origin: '+departure+'. ':'No confirmed origin yet. ')+
 'You may invite the user to open the prepared driving and transit journey-planner links. Do not imply live routes were fetched.';
 return {context,sources,actions,departure,university:uni.name};
}
