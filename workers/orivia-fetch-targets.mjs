/* Exact discovered fetch targets. Model-generated paths/query values are not discovery. */
export function canonicalTarget(value,base){try{const u=new URL(String(value),base);if(u.protocol!=='https:'||u.username||u.password)return '';u.hash='';return u.href}catch(_){return ''}}
export function fetchTargets(seeds=[]){
 const allowed=new Set();
 const add=value=>{const u=canonicalTarget(value);if(u)allowed.add(u);return u};
 for(const s of seeds)add(s);
 return {add,has:value=>{const u=canonicalTarget(value);return !!u&&allowed.has(u)},
  pageLinks(html,base){const page=canonicalTarget(base);if(!page)return;const origin=new URL(page).origin;
   for(const m of String(html||'').matchAll(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)){
    const raw=(m[1]??m[2]??m[3]??'').replace(/&amp;/gi,'&');const u=canonicalTarget(raw,page);
    if(u&&new URL(u).origin===origin)allowed.add(u);
    if(allowed.size>1000)break;
   }
  }};
}
