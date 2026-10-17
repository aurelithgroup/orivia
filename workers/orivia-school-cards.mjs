// Adapt freshly opened school profiles to the card contract. Never invent contact URLs or map pins.
import {offersYear} from './orivia-school-actions.mjs';
const textOf=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
export function schoolCardContacts(raw,text,profile){
 const contacts={};
 for(const [key,label] of [['phone','Phone Number'],['email','Email']]){
  const value=profile[key],quote=label+' '+value;
  if(value&&text.includes(quote))contacts[key]={value,quote};
 }
 const anchors=[...String(raw).matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];
 for(const a of anchors){
  const href=a[1].match(/\bhref=["']([^"']+)["']/i)?.[1];if(!href)continue;
  const label=textOf(a[2]);let u;try{u=new URL(href.replace(/&amp;/g,'&'));}catch{continue;}
  if(u.protocol!=='https:'||u.username||u.password||u.port)continue;
  if(/^Website(?:\s|$)/i.test(label)&&text.includes(label))contacts.website={url:u.href,quote:label};
  const map=(u.hostname==='goo.gl'&&u.pathname.startsWith('/maps/'))||u.hostname==='maps.app.goo.gl'||(['google.com','www.google.com','maps.google.com'].includes(u.hostname)&&u.pathname.startsWith('/maps'));
  const area=String(profile.area||'');
  if(map&&area&&label.replace(/\s*\(Opens in a new tab\)/g,'').trim()===area&&text.includes('School Location '+area))contacts.directions={url:u.href,label:area,quote:'School Location '+area};
 }
 return contacts;
}
function gradesLabel(g){
 const items=String(g||'').split(/[,|]/).map(x=>x.trim()).filter(Boolean),n=items.filter(x=>/^\d+$/.test(x)).map(Number),fs=items.filter(x=>/^(FS|KG)\d$/i.test(x)).sort();
 const lo=fs[0]||(n.length?'Year '+Math.min(...n):''),hi=n.length?'Year '+Math.max(...n):fs.at(-1);return lo&&hi&&lo!==hi?lo+' to '+hi:lo||hi||'';
}
export function schoolOrganisations(sources,part){
 return sources.map(s=>{
  const p=s.profile,ev=p.evidence||{},facts=[];
  const add=(key,label,value,e)=>{if(value&&e?.quote)facts.push({key,label,value,sourceId:s.id,quote:e.quote});};
  add('curriculum','Curriculum',p.curriculum,ev.curriculum);
  add('grades','Year groups',gradesLabel(p.grades),ev.grades);
  add('area','Area',p.area,ev.area);add('rating','SPEA rating',p.evaluation,ev.evaluation);
  if(part.year&&ev.grades&&offersYear(p.grades,part.year))add('year','Requested year','Year '+part.year+' listed',ev.grades);
  const contacts=Object.fromEntries(Object.entries(p.cardContacts||{}).map(([k,v])=>[k,{...v,sourceId:s.id}]));
  return {id:'school-'+new URL(s.url).pathname.split('/').filter(Boolean).at(-1).slice(0,32),kind:'school',name:p.name,sourceId:s.id,facts,contacts};
 });
}
