import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('workers/trial-ui/chat.js','utf8');
const block=source.slice(source.indexOf('/* Integrated onboarding consent:'),source.indexOf('/* End integrated onboarding consent. */'));
function harness(config={mode:'public'},human=true,offer='test-consent-v1'){
 const saved=new Map(),session=new Map(),card={querySelector:()=>info},info={dataset:{},textContent:''},label={dataset:{public:'old'},textContent:''};
 const nodes={'intro':{append(n){this.card=n}},'start':{hidden:false},'consent':{checked:false,closest:()=>card,parentElement:{querySelector:()=>label}},'set-pilot':{checked:false},'account-flow-status':{textContent:''}};
 const root={isConnected:true,children:[],append(x){this.children.push(x)}};
 const ctx={modeReady:Promise.resolve(config),mode:'public',humanOk:human,humanState:'idle',pilotOffer:offer,pilotKey:'pilot',ck:'consent',startRequested:false,window:{OriviaAccounts:{user:null},__siteKey:'test-site'},$:id=>nodes[id],uiText:x=>x,document:{createTextNode:text=>({text})},localStorage:{setItem:(k,v)=>saved.set(k,v)},sessionStorage:{setItem:(k,v)=>session.set(k,v)},loadTurnstile(){ctx.humanState='checking';ctx.humanOk=false;ctx.renders++},renders:0};
 ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(block,ctx);return {ctx,nodes,root,saved,session,card,info,label};
}
const h=harness();await h.ctx.mountOnboardingConsent(h.root);assert.equal(h.root.children[0],h.card,'moves the existing card');assert.equal(h.nodes.start.hidden,true,'old button is hidden');assert.equal(h.ctx.renders,1);assert.match(h.label.textContent,/OpenAI/);assert.ok(!('public' in h.label.dataset));
assert.equal(await h.ctx.authorizeOnboardingStart(),false,'unticked AI consent blocks entry');assert.equal(h.session.size,0);
h.nodes.consent.checked=true;assert.equal(await h.ctx.authorizeOnboardingStart(),false,'uncompleted human check blocks entry');assert.equal(h.saved.size,0);
h.ctx.humanOk=true;assert.equal(await h.ctx.authorizeOnboardingStart(),true);assert.equal(h.session.get('consent'),'yes');assert.equal(h.saved.get('pilot'),'test-consent-v1');
h.ctx.releaseOnboardingConsent();assert.equal(h.nodes.intro.card,h.card);assert.equal(h.nodes.start.hidden,false,'fallback controls restored when leaving');
const dead=harness();dead.root.isConnected=false;await dead.ctx.mountOnboardingConsent(dead.root);assert.equal(dead.root.children.length,0,'late config cannot move controls into an abandoned setup');
const failed=harness(null);failed.nodes.consent.checked=true;assert.equal(await failed.ctx.authorizeOnboardingStart(),false,'failed configuration never implies permission');assert.equal(failed.saved.size,0);
const privateFlow=harness({mode:'private'},true,null);privateFlow.ctx.mode='private';await privateFlow.ctx.mountOnboardingConsent(privateFlow.root);assert.match(privateFlow.label.textContent,/Cloudflare Workers AI/);assert.doesNotMatch(privateFlow.label.textContent,/OpenAI/);assert.equal(privateFlow.ctx.renders,0);
const acc=fs.readFileSync('workers/trial-ui/accounts.js','utf8');assert.match(acc,/callbacks\.authorizeStart&&!await callbacks\.authorizeStart\(\)/);assert.doesNotMatch(acc,/else \$\('intro'\)\.hidden=false/,'account flow never opens old welcome');
console.log('Integrated onboarding: original consent/widget controls, explicit AI agreement, human-check gate, configuration failure, provider disclosure, abandoned screens and fallback restoration passed. Scripted DOM only.');
