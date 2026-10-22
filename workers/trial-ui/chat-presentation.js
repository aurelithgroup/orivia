/* Standalone presentation hook. No requests, imports, storage or speech changes. */
(()=>{
'use strict';
/* Pure local title suggestions. Never sends conversation text to a provider. */
const defaults = {en:'New chat',fr:'Nouvelle discussion',ar:'محادثة جديدة'};
const greetings = /^(hi+|hey+|hello|hiya|bonjour|salut|coucou|bonsoir|مرحبا|مرحباً|اهلا|أهلا|السلام عليكم|orivia)[!?.\s]*$/iu;
function suggestChatTitle(turns, {language='en', maxLength=48}={}) {
  const fallback=defaults[language]||defaults.en;
  for (const turn of Array.isArray(turns)?turns:[]) {
    if(turn?.role!=='user'||typeof turn.content!=='string') continue;
    let text=turn.content.normalize('NFC').replace(/\s+/gu,' ').trim();
    if(!text||greetings.test(text)) continue;
    // Avoid putting contact details, URLs, long identifiers or explicit names on the chat list.
    if(/https?:\/\/|\b[^\s@]+@[^\s@]+\.[^\s@]+|\d[\d\s()+-]{6,}\d|\b(?:my name is|i am called|je m'appelle|اسمي)\b/iu.test(text)) return fallback;
    text=text.replace(/^(?:please\s+|can you\s+|could you\s+|peux-tu\s+|pourrais-tu\s+)/iu,'')
      .replace(/[!?.,;:]+$/u,'').trim();
    if(!text) continue;
    const limit=Math.max(12,Math.min(80,Number(maxLength)||48));
    const chars=Array.from(text);
    if(chars.length>limit){text=chars.slice(0,limit-1).join('');const boundary=text.lastIndexOf(' ');if(boundary>limit*.6)text=text.slice(0,boundary);text+='…'}
    return text;
  }
  return fallback;
}
function titleForChat(chat, options) {
  // `titled` is the existing persisted manual-rename flag. Never overwrite it.
  return chat?.titled ? String(chat.title||'') : suggestChatTitle(chat?.turns,options);
}

const words={en:{sources:'Sources',evidence:'Sources and evidence',opened:'Opened',source:'Source',note:'A source supports the quoted point; it does not guarantee it applies to you.',review:'Check that this applies to your situation.',official:'Official source',organisation:'Organisation source',directory:'Listing site',community:'People’s experiences',university:'From your university'},fr:{sources:'Sources',evidence:'Sources et justificatifs',opened:'Consultée',source:'Source',note:'Une source étaye le point cité ; elle ne garantit pas qu’il s’applique à votre situation.',review:'Vérifiez que cela s’applique à votre situation.',official:'Source officielle',organisation:'Source de l’organisme',directory:'Annuaire',community:'Expériences partagées',university:'De votre établissement'},ar:{sources:'المصادر',evidence:'المصادر والأدلة',opened:'تم الاطلاع',source:'المصدر',note:'يدعم المصدر النقطة المقتبسة، لكنه لا يضمن انطباقها على حالتك.',review:'تحقق من انطباق المعلومات على حالتك.',official:'مصدر رسمي',organisation:'مصدر المؤسسة',directory:'دليل',community:'تجارب الناس',university:'من جامعتك'}};
function renderSources({sources,claims,research={},language='en'}) {
 // Preserve the existing renderer for all failure/partial/unresolved states.
 if((research.status&&!['complete','ok','answered','evidence-found'].includes(research.status))||(research.unresolved||[]).length)return null;
 const doc=window.document,w=words[language]||words.en;
 const node=(tag,text,cls)=>{const e=doc.createElement(tag);if(text!=null)e.textContent=text;if(cls)e.className=cls;return e};
 const accepted=new Set(['official','government','organisation','institution','operator','business','transport','directory','community','university']);
 const checked=[];
 for(const [sourceIndex,s] of (Array.isArray(sources)?sources:[]).entries()){try{const u=new URL(s.url);if(u.protocol!=='https:'||u.username||u.password||!accepted.has(s.category))continue;checked.push({...s,sourceIndex,url:u.href,host:u.hostname.replace(/^www\./,'')})}catch{}}
 if(!checked.length)return null;
 if(!doc.getElementById('orivia-presentation-style')){const style=node('style',`.op-sources{white-space:normal;overflow-wrap:break-word;margin-block:12px;font-size:.86em}.op-chips{display:flex;flex-wrap:wrap;gap:6px}.op-source{display:inline-flex;gap:5px;align-items:center;padding:5px 9px;border:1px solid var(--line,#d8d3c8);border-radius:999px;color:var(--focus,#806012);text-decoration:none;font-size:.9em;max-width:100%;overflow-wrap:anywhere}.op-source:hover{text-decoration:underline}.op-source:focus-visible,.op-sources summary:focus-visible{outline:2px solid currentColor;outline-offset:3px}.op-sources summary{cursor:pointer;padding-block:10px}.op-entry{padding-block:10px;border-top:1px solid var(--line,#d8d3c8)}.op-entry p{margin:5px 0}.op-entry blockquote{margin:8px 0;padding-inline-start:12px;border-inline-start:2px solid var(--line,#d8d3c8)}.op-muted{font-size:.88em;opacity:.8}`);style.id='orivia-presentation-style';doc.head.append(style)}
 const box=node('section',null,'op-sources');box.setAttribute('aria-label',w.sources);box.dir=language==='ar'?'rtl':'auto';
 const chips=node('div',null,'op-chips'),detail=node('details');detail.append(node('summary',w.evidence+' · '+checked.length));
 const category=s=>s.category==='university'?w.university:['official','government'].includes(s.category)?w.official:s.category==='directory'?w.directory:s.category==='community'?w.community:w.organisation;
 const link=(s,n,text)=>{const a=node('a',text,'op-source');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',w.source+' '+n+': '+category(s)+' — '+s.title+' — '+s.host);return a};
 checked.forEach((s,i)=>{
  // Preserve the original reply's index even if an invalid source was rejected.
  const n=s.sourceIndex+1;
  chips.append(link(s,n,s.host+' ↗'));
  const entry=node('div',null,'op-entry');entry.append(node('strong',category(s)),node('p',String(s.title||s.host)),link(s,n,w.source+' '+n+' · '+s.host+' ↗'));
  if(s.checkedAt&&Number.isFinite(Date.parse(s.checkedAt)))entry.append(node('p',w.opened+' · '+new Date(s.checkedAt).toLocaleString(language), 'op-muted'));
  // Only an unambiguous source id can support a claim. Never use positional fallback.
  if(s.id&&checked.filter(x=>x.id===s.id).length===1)for(const c of Array.isArray(claims)?claims:[]){if(c.sourceId!==s.id||typeof c.text!=='string')continue;const quotes=Array.isArray(c.quotes)&&c.quotes.length?c.quotes:[{quote:c.quote}];const good=quotes.filter(q=>q&&typeof q.quote==='string'&&q.quote.trim());if(!good.length)continue;entry.append(node('p',c.text));for(const q of good){if(typeof q.label==='string'&&q.label)entry.append(node('strong',q.label));entry.append(node('blockquote',q.quote))}}
  detail.append(entry);
 });
 detail.append(node('p',w.note,'op-muted'));if(research.applicability==='needs-review')detail.append(node('p',w.review,'op-muted'));
 box.append(chips,detail);return box;
}
window.OriviaPresentation={titleFor(turns){return suggestChatTitle(turns,{language:window.OriviaI18n?.language?.()||'en'})},renderSources};

})();
