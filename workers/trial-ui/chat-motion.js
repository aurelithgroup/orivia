/* Progressive display of an already checked reply. Never a substitute for network streaming or verification. */
(()=>{
 const active=new Set();
 function reveal(node,{text,onDone=()=>{},follow=()=>{},reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,clock=()=>performance.now(),frame=requestAnimationFrame}={}){
  const original=document.createDocumentFragment();while(node.firstChild)original.append(node.firstChild);
  const parts=String(text||'').match(/\S+\s*|\s+/gu)||[],start=clock(),duration=Math.min(1400,Math.max(180,parts.length*12));let done=false,last=0;
  const finish=()=>{if(done)return;done=true;active.delete(finish);node.replaceChildren(original);node.removeAttribute('aria-hidden');onDone();follow()};active.add(finish);
  if(reduced||parts.length<5){finish();return finish}
  node.textContent='';node.setAttribute('aria-hidden','true');
  const tick=()=>{if(done)return;if(!node.isConnected){finish();return}const n=Math.min(parts.length,Math.max(1,Math.ceil((clock()-start)/duration*parts.length)));if(n!==last){node.textContent=parts.slice(0,n).join('');last=n;follow()}if(n>=parts.length)finish();else frame(tick)};frame(tick);return finish;
 }
 window.OriviaChatMotion={reveal,finishAll(){for(const f of [...active])f()}};
})();
