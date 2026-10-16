/* Orivia's auditable source-acceptance policy.
 * Only exact pre-reviewed HTTPS hostnames are admitted as factual evidence.
 * This is an intentionally narrow development registry, not a web search engine.
 * Social media, Reddit, blogs, aggregators and search snippets are NEVER evidence.
 */
export const TRUSTED_HOSTS=Object.freeze({
 'www.hw.ac.uk':'institution', 'hw.ac.uk':'institution',
 'www.uowdubai.ac.ae':'institution',
 'www.rta.ae':'government', 'rta.ae':'government',
 'u.ae':'government', 'www.dubai.ae':'government',
 'icp.gov.ae':'government', 'www.icp.gov.ae':'government',
 'www.mohre.gov.ae':'government', 'www.mofa.gov.ae':'government'
});
export function inspectSource(url, purpose='general'){
 try{
  const parsed=new URL(url);
  if(parsed.protocol!=='https:'||parsed.username||parsed.password||parsed.port)return {accepted:false,reason:'Requires plain HTTPS'};
  const host=parsed.hostname.toLowerCase();
  const category=TRUSTED_HOSTS[host];
  if(!category)return {accepted:false,reason:'Source has not been approved'};
  if(['legal','residency','government-requirement'].includes(purpose)&&category!=='government')
   return {accepted:false,reason:'Government authority required for this type of claim'};
  return {accepted:true,category,url:parsed.href};
 }catch(_){return {accepted:false,reason:'Invalid URL'}}
}
export function validateEvidence(source,purpose='general'){
 if(!source||typeof source.title!=='string'||typeof source.description!=='string'
    ||!/^\d{4}-\d\d-\d\d$/.test(source.verifiedOn||''))return null;
 const checked=inspectSource(source.url,purpose);
 return checked.accepted?{title:source.title,description:source.description,
  url:checked.url,category:checked.category,verifiedOn:source.verifiedOn}:null;
}
