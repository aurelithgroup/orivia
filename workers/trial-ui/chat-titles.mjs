/* Pure local title suggestions. Never sends conversation text to a provider. */
const defaults = {en:'New chat',fr:'Nouvelle discussion',ar:'محادثة جديدة'};
const greetings = /^(hi+|hey+|hello|hiya|bonjour|salut|coucou|bonsoir|مرحبا|مرحباً|اهلا|أهلا|السلام عليكم|orivia)[!?.\s]*$/iu;
export function suggestChatTitle(turns, {language='en', maxLength=48}={}) {
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
export function titleForChat(chat, options) {
  // `titled` is the existing persisted manual-rename flag. Never overwrite it.
  return chat?.titled ? String(chat.title||'') : suggestChatTitle(chat?.turns,options);
}
