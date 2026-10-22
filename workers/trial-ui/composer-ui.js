/* Independent composer UI. No network, AI, storage, microphone or camera permission calls.
 * Cleo connects callbacks to the existing consent, file preparation, account and send controls. */
(function(){
 'use strict';
 function mount(root,{onSend=async()=>{},onVoice=()=>{},onUploads=async()=>null,text=s=>s}={}){
  const doc=root.ownerDocument;let attachment=null,objectURL=null,revision=0,sending=false,disposed=false,hoverTimer;
  const el=(tag,cls,label)=>{const n=doc.createElement(tag);if(cls)n.className=cls;if(label!=null)n.textContent=text(label);return n};
  const button=(label,content,fn)=>{const b=el('button','oc-button',content);b.type='button';b.setAttribute('aria-label',text(label));b.title=text(label);b.onclick=fn;return b};
  const form=el('form','oc-composer'),previews=el('div','oc-previews'),area=el('textarea','oc-text');area.rows=1;area.maxLength=2000;area.placeholder=text('Message Orivia…');area.setAttribute('aria-label',text('Your message'));
  const controls=el('div','oc-controls'),left=el('div','oc-left'),right=el('div','oc-right'),menu=el('div','oc-menu');menu.hidden=true;menu.id='oc-menu-'+Math.random().toString(36).slice(2);menu.setAttribute('aria-label',text('Add an attachment'));
  const feedback=el('p','oc-feedback');feedback.setAttribute('role','status');
  function closeMenu(){menu.hidden=true;plus.setAttribute('aria-expanded','false')}
  function openMenu(focus=false){if(sending)return;clearTimeout(hoverTimer);menu.hidden=false;plus.setAttribute('aria-expanded','true');if(focus)menu.querySelector('button')?.focus()}
  const plus=button('Add an attachment','+',()=>openMenu(true));plus.classList.add('oc-plus');plus.setAttribute('aria-expanded','false');plus.setAttribute('aria-controls',menu.id);
  const voice=button('Speak your message','',onVoice);const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('aria-hidden','true');const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M8 7a4 4 0 018 0v4a4 4 0 01-8 0V7M5 10v2a7 7 0 0014 0v-2M12 19v3m-4 0h8');svg.append(path);voice.append(svg);
  const send=button('Send','↑',()=>form.requestSubmit());send.classList.add('oc-send');
  const picks=[];
  function picker(label,accept,capture){const input=el('input');input.type='file';input.accept=accept;input.hidden=true;if(capture)input.setAttribute('capture',capture);const b=button(label,label,()=>{closeMenu();input.click()});input.onchange=()=>{const file=input.files?.[0];input.value='';if(file)setAttachment({file})};picks.push(input);menu.append(b)}
  picker('Camera','image/jpeg,image/png','environment');picker('Photos','image/jpeg,image/png');picker('Files','.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png');
  const uploads=button('Saved uploads','Saved uploads',async()=>{closeMenu();const version=revision;try{const selected=await onUploads();if(selected&&!disposed&&revision===version)setAttachment(selected)}catch{if(!disposed&&revision===version)feedback.textContent=text('Couldn’t open saved uploads. Try again.')}});menu.append(uploads);
  function releasePreview(){if(objectURL){URL.revokeObjectURL(objectURL);objectURL=null}}
  function render(){releasePreview();previews.replaceChildren();if(attachment){const card=el('div','oc-attachment'),f=attachment.file;const image=/^image\/(jpeg|png)$/.test(f.type);card.classList.toggle('oc-photo',image);if(image){objectURL=URL.createObjectURL(f);const img=el('img');img.src=objectURL;img.alt=text('Selected image')+': '+f.name;card.append(img)}else{card.append(el('span','oc-file-icon','↗'),el('strong','oc-file-name',f.name),el('small','oc-file-type','PDF · '+Math.max(1,Math.round(f.size/1024))+' KB'))}
   const remove=button('Remove attachment','×',()=>{attachment=null;revision++;feedback.textContent='';render();area.focus()});remove.classList.add('oc-remove');remove.disabled=sending;card.append(remove);previews.append(card)}send.disabled=sending||(!area.value.trim()&&!attachment);area.style.height='auto';area.style.height=Math.min(area.scrollHeight,192)+'px';area.style.overflowY=area.scrollHeight>192?'auto':'hidden';
  }
  function setAttachment(value){if(sending||disposed)return false;const f=value?.file;if(!f||!['application/pdf','image/jpeg','image/png'].includes(f.type)){feedback.textContent=text('Choose a PDF, JPEG or PNG file.');return false}if(f.size>10*1024*1024){feedback.textContent=text('That file is over 10 MB. Choose a smaller file.');return false}attachment={file:f,...(value.fileId?{fileId:value.fileId}:{})};revision++;feedback.textContent=text('Attached. Nothing has been sent yet.');render();area.focus();return true}
  area.oninput=()=>{revision++;send.disabled=sending||(!area.value.trim()&&!attachment);area.style.height='auto';area.style.height=Math.min(area.scrollHeight,192)+'px';area.style.overflowY=area.scrollHeight>192?'auto':'hidden'};
  form.onsubmit=async e=>{e.preventDefault();if(sending||(!area.value.trim()&&!attachment))return;closeMenu();const version=revision,draft={text:area.value,attachment};sending=true;area.readOnly=true;plus.disabled=voice.disabled=true;render();feedback.textContent=text('Preparing your message…');
   try{const result=await onSend(draft);if(disposed)return;if(result===false){feedback.textContent=text('Your draft is still here.');return}if(revision===version){attachment=null;area.value='';revision++}feedback.textContent=''}catch{if(!disposed)feedback.textContent=text('Couldn’t send. Your message and attachment are still here.')}finally{sending=false;if(!disposed){area.readOnly=false;plus.disabled=voice.disabled=false;render();area.focus()}}};
  form.onkeydown=e=>{if(e.key==='Escape'){closeMenu();plus.focus()}if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)&&e.target===area){e.preventDefault();form.requestSubmit()}};
  const fine=()=>window.matchMedia?.('(hover:hover) and (pointer:fine)').matches;
  plus.onpointerenter=()=>{if(fine())openMenu()};const laterClose=()=>{hoverTimer=setTimeout(()=>{if(!left.matches(':hover')&&!left.contains(doc.activeElement))closeMenu()},180)};left.onpointerleave=laterClose;left.onpointerenter=()=>clearTimeout(hoverTimer);
  const outside=e=>{if(!left.contains(e.target))closeMenu()};doc.addEventListener('pointerdown',outside);
  left.append(plus,menu);right.append(voice,send);controls.append(left,right);form.append(previews,area,controls,...picks);root.replaceChildren(form,feedback);render();
  return {setAttachment,focus:()=>area.focus(),reset(){revision++;attachment=null;area.value='';closeMenu();render()},destroy(){disposed=true;revision++;releasePreview();clearTimeout(hoverTimer);doc.removeEventListener('pointerdown',outside);root.replaceChildren()}};
 }
 window.OriviaComposer={mount};
})();
