// Convert the reader's quoted fields to the established response/card representation.
export function schoolReaderProfiles(items){
 return items.filter(s=>s?.from!=='directory-card'&&s?.fields?.curriculum).map(s=>{
  const f=s.fields,ev={},contacts={};
  for(const [key,label] of [['curriculum','Curriculum'],['grades','Year groups'],['area','Area'],['evaluation','SPEA rating']])if(f[key]?.quote)ev[key]={label,quote:f[key].quote};
  for(const key of ['phone','email','website','directions'])if(f[key]?.quote)contacts[key]=f[key];
  return {url:s.url,profile:{name:s.name,curriculum:f.curriculum.value,area:f.area?.value||'',grades:(f.grades?.value||'').replace(/\s*\|\s*/g,', '),evaluation:f.evaluation?.value||'',phone:f.phone?.value||'',email:f.email?.value||'',quote:f.curriculum.quote,evidence:ev,cardContacts:contacts}};
 });
}
