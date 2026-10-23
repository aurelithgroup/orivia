/* Library discoveries (master spec ORI-LIB-002/003/004/006; Ina's review of 5569f60).
   Places and services Orivia recommended from vetted, sourced cards, derived from the saved chats (nothing copied).
   - One entry per name and source site, newest mention first; a ♥ favourite on any mention is kept.
   - No silent cap: every eligible discovery is returned; the Library pages them with "Show more".
   - Removing one is recorded once, in the account's Library state (store.library.hidden), never in chat messages,
     so chats are unchanged and Restore just takes the key out again.
   Pure functions: the chat sanitisers are passed in, so tests run this exact code. */
(function(root){
 'use strict';
 const PAGE=30;
 function key(name,src){return String(name||'').trim().toLowerCase().replace(/\s+/g,' ')+'|'+String(src&&src.host||'').toLowerCase()}
 function legacyHidden(chats){const out=[];for(const c of Array.isArray(chats)?chats:[])for(const t of Array.isArray(c.turns)?c.turns:[])if(t&&t.meta&&Array.isArray(t.meta.hiddenDiscoveries))for(const k of t.meta.hiddenDiscoveries)if(typeof k==='string')out.push(k);return out}
 // University bookmarks (ORI-LIB-005): references only (organisation, item, title, organisation name, time). The item's
 // text is never kept here, so leaving or being removed closes it: opening or asking re-checks membership on the server.
 const ID=/^[A-Za-z0-9-]{1,64}$/;
 function normSaved(list){const out=[],seen=new Set();for(const x of Array.isArray(list)?list:[]){if(!x||typeof x.org!=='string'||typeof x.content!=='string'||!ID.test(x.org)||!ID.test(x.content))continue;const k=x.org+'|'+x.content;if(seen.has(k))continue;seen.add(k);
  out.push({org:String(x.org),content:String(x.content),title:String(x.title||'').substring(0,150),orgName:String(x.orgName||'').substring(0,80),savedAt:Number(x.savedAt)||0})}return out}
 function normLibrary(v){const hidden=v&&Array.isArray(v.hidden)?v.hidden.filter(k=>typeof k==='string'&&k.length<=400):[];return {hidden:[...new Set(hidden)],saved:normSaved(v&&v.saved)}}
 function saveOrgItem(library,item,now){const l=normLibrary(library);const one=normSaved([{...item,savedAt:now}]);if(!one.length)return null;l.saved=normSaved([one[0],...l.saved.filter(x=>!(x.org===one[0].org&&x.content===one[0].content))]);return l}
 function removeOrgItem(library,org,content){const l=normLibrary(library);l.saved=l.saved.filter(x=>!(x.org===org&&x.content===content));return l}
 function isSaved(library,org,content){return normLibrary(library).saved.some(x=>x.org===org&&x.content===content)}
 // chats: store.chats; h: {safeSources,safeDestinations,safeOrgs,placeIdentity}. Returns {shown,hidden} (both complete).
 function collect(chats,library,h){
  const hidden=new Set(normLibrary(library).hidden),seen=new Map();
  const ordered=(Array.isArray(chats)?chats:[]).slice().sort((a,b)=>(Number(b.updated)||0)-(Number(a.updated)||0));
  for(const chat of ordered)for(const t of (Array.isArray(chat.turns)?chat.turns:[]).slice().reverse()){
   if(!t||t.role!=='assistant'||!t.meta)continue;const srcs=h.safeSources(t.meta.sources);if(!srcs.length)continue;
   for(const d of h.safeDestinations(t.meta.destinations,srcs)){const k=key(d.name,d.src),fav=Array.isArray(t.meta.savedPlaces)&&t.meta.savedPlaces.includes(h.placeIdentity(d));
    if(!seen.has(k))seen.set(k,{key:k,name:d.name,detail:d.address||'',kind:'place',src:d.src,chatId:chat.id,chatTitle:chat.title||'',favourite:fav,shortlisted:false});else if(fav)seen.get(k).favourite=true}
   for(const o of h.safeOrgs(t.meta.organisations,srcs)){if(o.fixture)continue;const k=key(o.name,o.src),listed=Array.isArray(t.meta.shortlist)&&t.meta.shortlist.includes(o.id);
    if(!seen.has(k))seen.set(k,{key:k,name:o.name,detail:o.src.host||'',kind:'service',src:o.src,chatId:chat.id,chatTitle:chat.title||'',favourite:false,shortlisted:listed});else if(listed)seen.get(k).shortlisted=true}
  }
  const all=[...seen.values()];return {shown:all.filter(x=>!hidden.has(x.key)),hidden:all.filter(x=>hidden.has(x.key))};
 }
 // Returns a new Library state; the caller saves it once. Chats are never touched.
 function hide(library,k){const l=normLibrary(library);if(!l.hidden.includes(k))l.hidden.push(k);return l}
 function restore(library,k){const l=normLibrary(library);l.hidden=l.hidden.filter(x=>x!==k);return l}
 function page(list,shown){const n=Math.max(PAGE,Number(shown)||PAGE);return {items:list.slice(0,n),more:Math.max(0,list.length-n),next:n+PAGE}}
 root.OriviaDiscoveries={key,legacyHidden,normLibrary,collect,hide,restore,page,PAGE,saveOrgItem,removeOrgItem,isSaved};
})(typeof window!=='undefined'?window:globalThis);
