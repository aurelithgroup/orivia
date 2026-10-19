/* UI-only translations. Source quotes, saved messages, user values and organisation names are never scanned. */
(function(){
 'use strict';
 const dictionary=/*__TRANSLATIONS__*/{};
 const supported=['en','fr','ar'];
 let language='en';try{const s=JSON.parse(localStorage.getItem('orivia-private-settings-v1')||'{}');if(supported.includes(s.language))language=s.language}catch(_){}
 const original=[],dynamic=new WeakMap();
 function text(value){
  const s=String(value??'');if(language==='en')return s;
  if(dictionary[s]?.[language])return dictionary[s][language];
  const stripped=s.replace(/…$/,'');if(stripped!==s&&dictionary[stripped]?.[language])return dictionary[stripped][language]+'…';
  const prefixes={'Searching: ':['Recherche : ','جارٍ البحث: '],'Reading ':['Lecture : ','جارٍ قراءة: '],'Listening · ':['Écoute · ','جارٍ الاستماع · '],'Sources and evidence':['Sources et justificatifs','المصادر والأدلة'],'On: Orivia uses what you saved in My Life':['Activé : Orivia utilise votre profil enregistré','مفعّل: تستخدم أوريفيا معلوماتك المحفوظة']};
  for(const [prefix,translations]of Object.entries(prefixes))if(s.startsWith(prefix))return translations[language==='fr'?0:1]+s.slice(prefix.length);
  return s; // explicit fallback; never invent a translation of a fact or quote
 }
 function trackInitial(){
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
  while(n=walker.nextNode()){
   if(n.parentElement?.closest('script,style,svg,#history,#staff-card,datalist'))continue;
   const s=n.data.trim();if(dictionary[s])original.push({node:n,source:n.data});
  }
  for(const node of document.querySelectorAll('[placeholder],[aria-label],[title]')){
   if(node.closest('#staff-card'))continue;
   for(const attr of ['placeholder','aria-label','title']){const source=node.getAttribute(attr);if(source&&dictionary[source])original.push({node,attr,source})}
  }
 }
 function apply(){
  document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';
  for(const item of original){const trimmed=item.source.trim(),value=item.source.replace(trimmed,text(trimmed));if(item.attr)item.node.setAttribute(item.attr,value);else item.node.data=value}
  for(const id of ['status','listening-text','tone-note','pilot-text','aboutme-state','reminder-status','view-title']){const node=document.getElementById(id);if(node)localizeDynamic(node)}
 }
 function localizeDynamic(node){
  let state=dynamic.get(node);if(!state||node.textContent!==state.last)state={source:node.textContent,last:null};
  const value=text(state.source);state.last=value;dynamic.set(node,state);if(node.textContent!==value)node.textContent=value;
 }
 window.OriviaI18n={text,language:()=>language,setLanguage(value){language=supported.includes(value)?value:'en';apply()},dictionary};
 trackInitial();apply();
 for(const id of ['status','listening-text','tone-note','pilot-text','aboutme-state','reminder-status','view-title']){const node=document.getElementById(id);if(node)new MutationObserver(()=>localizeDynamic(node)).observe(node,{childList:true,characterData:true,subtree:true})}
})();
