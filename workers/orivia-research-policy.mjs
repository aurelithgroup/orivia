/* Research registry: exact hosts, named roles, jurisdiction and topic scope.
 * Discovery is not evidence. A government host is not universal authority.
 * Extend only after review; never add a host supplied by a user or the model.
 */
const authority=(country,topics)=>({country,topics,kind:'official'});
const organisation=(country,name,topics)=>({country,name,topics,kind:'organisation'});
export const RESEARCH_SOURCES=Object.freeze({
 'u.ae':authority('uae',['residency','biometrics','medical','school','bank']),
 'icp.gov.ae':authority('uae',['residency','biometrics']),
 'www.icp.gov.ae':authority('uae',['residency','biometrics']),
 'gdrfad.gov.ae':authority('uae',['residency']),
 'www.gdrfad.gov.ae':authority('uae',['residency']),
 'www.dha.gov.ae':authority('uae',['medical']),
 'dha.gov.ae':authority('uae',['medical']),
 'www.ehs.gov.ae':authority('uae',['medical']),
 'ehs.gov.ae':authority('uae',['medical']),
 'mohap.gov.ae':authority('uae',['medical']),
 'www.khda.gov.ae':authority('uae',['school']),
 'web.khda.gov.ae':authority('uae',['school']),
 'khda.gov.ae':authority('uae',['school']),
 'www.adek.gov.ae':authority('uae',['school']),
 'adek.gov.ae':authority('uae',['school']),
 'www.spea.shj.ae':authority('uae',['school']),
 'spea.shj.ae':authority('uae',['school']),
 'www.moe.gov.ae':authority('uae',['school']),
 'www.centralbank.ae':authority('uae',['bank']),
 'centralbank.ae':authority('uae',['bank']),
 'www.gov.uk':authority('uk',['residency','biometrics','school','bank']),
 'www.nhs.uk':authority('uk',['medical']),
 'www.nhsinform.scot':authority('uk',['medical']),
 'www.gov.scot':authority('uk',['school']),
 'www.edinburgh.gov.uk':authority('uk',['school']),
 'www.hw.ac.uk':organisation('both','Heriot-Watt',['institution']),
 'hw.ac.uk':organisation('both','Heriot-Watt',['institution']),
 'www.uowdubai.ac.ae':organisation('uae','University of Wollongong Dubai',['institution']),
 'www.emiratesnbd.com':organisation('uae','Emirates NBD',['bank']),
 'www.adcb.com':organisation('uae','ADCB',['bank']),
 'www.bankfab.com':organisation('uae','First Abu Dhabi Bank',['bank'])
});
export function researchSource(url,part,location){
 try{
  const u=new URL(url);
  if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash)return null;
  // No user-supplied URL parameters are needed for this initial reader.
  if(u.search)return null;
  const rule=RESEARCH_SOURCES[u.hostname];
  if(!rule||!rule.topics.includes(part.topic)||!location?.country)return null;
  if(rule.country!=='both'&&rule.country!==location.country)return null;
  // Local education regulators are not interchangeable across emirates.
  if(part.topic==='school'&&location.city){
   const local={'www.khda.gov.ae':'Dubai','web.khda.gov.ae':'Dubai','khda.gov.ae':'Dubai','www.adek.gov.ae':'Abu Dhabi','adek.gov.ae':'Abu Dhabi','www.spea.shj.ae':'Sharjah','spea.shj.ae':'Sharjah'};
   if(local[u.hostname]&&local[u.hostname]!==location.city)return null;
  }
  if(part.tier==='official'&&rule.kind!=='official')return null;
  if(part.tier==='organisation'&&(rule.kind!=='organisation'||part.organisation!==rule.name))return null;
  if(part.tier==='community')return null; // third-party content permissions not reviewed yet
  return {url:u.href,...rule};
 }catch{return null;}
}
export function sourceHosts(part,location){
 return Object.keys(RESEARCH_SOURCES).filter(h=>researchSource('https://'+h+'/',part,location));
}
