/* Exact, reviewable patches to the CURRENT deployed bundle, preserving newer backend fixes.
 * Pure function: this file does not deploy or change any Cloudflare settings. */
export function preparePublicPromotion(code,{html,js,publicConsent,publicText,releaseFactory}){
 const replace=(from,to)=>{const count=code.split(from).length-1;if(count!==1)throw Error('Unexpected deployed code: '+from.slice(0,75)+' ('+count+')');code=code.replace(from,()=>to)};
 replace('var consentedToOpenAI =',`var PUBLIC_CONSENT=${JSON.stringify(publicConsent)};var PUBLIC_CONSENT_TEXT=${JSON.stringify(publicText)};var providerAllowed=env=>!isPublic2(env)||env.PUBLIC_ASSISTANT==='1';\nvar consentedToOpenAI =`);
 replace('__name((p) => !!p && typeof p === "object" && p.providerConsent && typeof p.providerConsent === "object" && p.providerConsent.openai === PILOT_CONSENT, "consentedToOpenAI")','__name((p,env={}) => !!p && typeof p === "object" && p.providerConsent && typeof p.providerConsent === "object" && p.providerConsent.openai === (isPublic2(env)?PUBLIC_CONSENT:PILOT_CONSENT), "consentedToOpenAI")');
 replace('!isPublic2(env) && env?.OPENAI_PILOT','providerAllowed(env) && env?.OPENAI_PILOT');
 replace('if (isPublic2(env) || env.OPENAI_PILOT !== "1" || !consentedToOpenAI(preferences)','if (!providerAllowed(env) || env.OPENAI_PILOT !== "1" || !consentedToOpenAI(preferences,env)');
 replace('if (isPublic2(env)) return null;','if (!providerAllowed(env)) return null;');
 replace('function createPilotWorker({ launchBrowser, fetcher } = {})','function createPilotWorker({ launchBrowser, fetcher, publicRelease=false } = {})');
 replace('if (isPublic2(env)) return new Response(JSON.stringify({ error: "Pilot is private only" })','if (isPublic2(env)&&!(publicRelease&&env.PUBLIC_ASSISTANT===\'1\')) return new Response(JSON.stringify({ error: "Pilot is private only" })');
 replace('const assist = !PUBLIC && hooks.assistant ?', 'const assist = (!PUBLIC||env.PUBLIC_ASSISTANT===\'1\') && hooks.assistant ?');
 replace('const extra = !PUBLIC && hooks.research ?', 'const extra = (!PUBLIC||env.PUBLIC_ASSISTANT===\'1\') && hooks.research ?');
 replace('consent: PILOT_CONSENT, text: PILOT_CONSENT_TEXT','consent: isPublic2(env)?PUBLIC_CONSENT:PILOT_CONSENT, text: isPublic2(env)?PUBLIC_CONSENT_TEXT:PILOT_CONSENT_TEXT');
 replace('body.research = { ...body.research || {}, browserDirectory:',"body.publicAssistant=isPublic2(env)&&publicRelease&&env.PUBLIC_ASSISTANT==='1';\n      body.research = { ...body.research || {}, browserDirectory:");
 replace('var index_default = createPilotWorker({ launchBrowser: /* @__PURE__ */ __name((env) => puppeteer_cloudflare_default.launch(env.BROWSER), "launchBrowser") });',releaseFactory+'\nvar index_default=createPublicRelease();');
 // Embedded literals: locate by a unique marker; replace the JSON literal, never regex against HTML/JS bodies.
 for(const [hint,value] of [['/* Research: citations',html],['function researchBlock',js]]){
  const marker=code.indexOf(hint);if(marker<0)throw Error('Missing UI marker');
  const start=code.lastIndexOf('new Response(',marker)+'new Response('.length;
  if(code[start]!=='"')throw Error('Unexpected UI literal');let end=start+1,escaped=false;
  for(;end<code.length;end++){const c=code[end];if(c==='"'&&!escaped)break;if(c==='\\')escaped=!escaped;else escaped=false}
  JSON.parse(code.slice(start,end+1));code=code.slice(0,start)+JSON.stringify(value)+code.slice(end+1);
 }
 replace('frame-src https://challenges.cloudflare.com; style-src',"frame-src https://challenges.cloudflare.com; img-src 'self' data:; style-src");
 return code;
}
