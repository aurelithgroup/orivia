/* Device-only photo review. Every exit releases the bitmap and dialog.
 * Submission readiness (30 Oct, bounded): a view-only zoom, a rough quality note (resolution, and possible blur from the
 * image's edge contrast), a prompt to compare pages with the receiving organisation's checklist, and a plain list of what
 * Orivia can't assess. Nothing here says a document is complete, genuine or will be accepted, and nothing blocks using
 * the photo. All of it runs on the device; the photo isn't sent anywhere by this review. */
(function(root){'use strict';let pending=null,generation=0;
 // Thresholds are deliberately cautious: a warning only when the measurement clearly supports it.
 const MIN_SIDE=1000,BLUR_BELOW=40;
 // Edge contrast: variance of a 4-neighbour Laplacian over a greyscale copy (higher = sharper). A rough signal only:
 // plain backgrounds and low light also lower it.
 function sharpness(gray,w,h){if(w<3||h<3)return null;let sum=0,sq=0,n=0;for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x,l=4*gray[i]-gray[i-1]-gray[i+1]-gray[i-w]-gray[i+w];sum+=l;sq+=l*l;n++}const mean=sum/n;return sq/n-mean*mean}
 function assess({width,height,variance}){const notes=[],side=Math.min(width,height);
  if(side<MIN_SIDE)notes.push({kind:'warn',text:'Low resolution ('+width+' × '+height+'). Small print may not be readable. If you can, retake it closer or with a better camera.'});
  if(variance!==null&&variance!==undefined&&variance<BLUR_BELOW)notes.push({kind:'warn',text:'This photo may be blurry. Retake it in good light and hold the phone steady.'});
  if(!notes.length)notes.push({kind:'ok',text:'No obvious blur or low resolution found. This is only a rough check of the photo, not of the document.'});
  return notes}
 const CANNOT=['whether this is every page they need','whether the document is genuine, valid or up to date','whether it will be accepted'];
 function measure(bitmap){const s=Math.min(1,512/Math.max(bitmap.width,bitmap.height)),w=Math.max(3,Math.round(bitmap.width*s)),h=Math.max(3,Math.round(bitmap.height*s)),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(bitmap,0,0,w,h);
  let data;try{data=g.getImageData(0,0,w,h).data}catch(_){return null}const gray=new Float32Array(w*h);for(let i=0;i<w*h;i++)gray[i]=.299*data[i*4]+.587*data[i*4+1]+.114*data[i*4+2];return sharpness(gray,w,h)}
 function cancel(){generation++;pending?.()}
 async function review(file,{isCurrent=()=>true,onRetake=()=>{}}={}){cancel();const run=generation,bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});if(run!==generation||!isCurrent()){bitmap.close();return null}return new Promise(resolve=>{const dialog=document.createElement('dialog'),view=document.createElement('div'),canvas=document.createElement('canvas'),controls=document.createElement('div'),ready=document.createElement('section');dialog.setAttribute('aria-label','Review photo');dialog.style.cssText='max-width:min(94vw,700px);max-height:94vh;overflow:auto';view.style.cssText='max-height:65vh;overflow:auto';canvas.style.cssText='max-width:100%;max-height:65vh;touch-action:none';let rotation=0,crop=false,zoom=1,done=false;const finish=value=>{if(done)return;done=true;bitmap.close();dialog.close();dialog.remove();if(pending===stop)pending=null;resolve(isCurrent()?value:null)},stop=()=>finish(null);pending=stop;
 const draw=()=>{const swap=rotation%180!==0,w=swap?bitmap.height:bitmap.width,h=swap?bitmap.width:bitmap.height,side=Math.min(w,h),s=Math.min(1,2400/Math.max(crop?side:w,crop?side:h));canvas.width=Math.round((crop?side:w)*s);canvas.height=Math.round((crop?side:h)*s);const g=canvas.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,canvas.width,canvas.height);g.translate(canvas.width/2,canvas.height/2);g.scale(s,s);g.rotate(rotation*Math.PI/180);g.drawImage(bitmap,-bitmap.width/2,-bitmap.height/2)};
 // Zoom changes only how big the preview looks here; the saved photo is unchanged.
 const paintZoom=()=>{canvas.style.maxWidth=zoom===1?'100%':'none';canvas.style.maxHeight=zoom===1?'65vh':'none';canvas.style.width=zoom===1?'':Math.round(zoom*100)+'%'};
 const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>{if(!isCurrent())return stop();fn()};controls.append(b);return b};
 button('Rotate',()=>{rotation=(rotation+90)%360;draw()});button('Crop to square',()=>{crop=!crop;draw()});button('Zoom in',()=>{zoom=Math.min(4,zoom*1.5);paintZoom()});button('Zoom out',()=>{zoom=Math.max(1,zoom/1.5);paintZoom()});button('Reset',()=>{rotation=0;crop=false;zoom=1;paintZoom();draw()});button('Retake',()=>{stop();if(isCurrent())onRetake()});button('Cancel',stop);button('Use photo',()=>{canvas.toBlob(blob=>{if(!done)finish(blob?{blob,name:String(file.name||'Photo').replace(/\.[^.]*$/,'')+'.jpg',type:'image/jpeg'}:null)},'image/jpeg',.85)});
 // Before sending it anywhere: the quality note, the pages prompt, and the limits.
 const p=(text,cls)=>{const x=document.createElement('p');x.textContent=text;if(cls)x.className=cls;return x};ready.id='photo-readiness';ready.setAttribute('aria-live','polite');
 const heading=document.createElement('h3');heading.textContent='Before you send it';ready.append(heading);
 for(const n of assess({width:bitmap.width,height:bitmap.height,variance:measure(bitmap)}))ready.append(p((n.kind==='warn'?'⚠ ':'')+n.text,n.kind==='warn'?'photo-warn':'photo-ok'));
 ready.append(p('Pages: one photo can’t show whether a document is complete. Compare the pages you’ve chosen with the checklist from the organisation you’re sending them to.'));
 const list=document.createElement('ul');for(const c of CANNOT){const li=document.createElement('li');li.textContent=c;list.append(li)}ready.append(p('Orivia can’t check:'),list,p('Only the organisation receiving it can tell you that.','tiny'));
 dialog.addEventListener('cancel',e=>{e.preventDefault();stop()});view.append(canvas);dialog.append(view,controls,ready);document.body.append(dialog);draw();dialog.showModal()})}
 root.OriviaImageReview={review,cancel,assess,sharpness,CANNOT};
})(window);
