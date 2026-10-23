const fs=require('fs');
const check=(lang,zoom,size)=>`(async()=>{const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const K='orivia-private-chats-v1',st=JSON.parse(localStorage.getItem(K));st.chats[0].title='Questions about the Northbay University of Applied Sciences and Technology international student admissions office';localStorage.setItem(K,JSON.stringify(st));
 window.OriviaI18n.setLanguage('${lang}');${size?`document.documentElement.dataset.size='${size}';`:''}document.documentElement.style.zoom='${zoom}';await wait(600);
 const vw=innerWidth,out={lang:'${lang}',zoom:${zoom},dir:document.documentElement.dir,overflowX:document.documentElement.scrollWidth>document.documentElement.clientWidth+1};
 const keys={send:'#send',composer:'#msg',menu:'#open-chats',settings:'#open-settings'};out.controls={};
 for(const [k,s] of Object.entries(keys)){const e=document.querySelector(s);if(!e){out.controls[k]='missing';continue}const r=e.getBoundingClientRect(),z=Number(${zoom});out.controls[k]=(r.left>=-1&&r.right*1<=vw/ (1)+1&&r.width>0)?'visible':'clipped '+Math.round(r.left)+'..'+Math.round(r.right)+' of '+vw}
 const tabs=[...document.querySelectorAll('nav button, #nav button')].filter(b=>b.offsetParent);out.tabsClipped=tabs.filter(b=>{const r=b.getBoundingClientRect();return r.right>vw+1||r.left<-1||r.width<20}).map(b=>b.textContent.trim().slice(0,12));
 out.smallTargets=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&(r.height<24||r.width<24)}).map(b=>(b.getAttribute('aria-label')||b.textContent).trim().slice(0,20)).slice(0,8);
 return JSON.stringify(out)})()`;
const jobs=[['en',1,'',390],['ar',1,'',390],['ar',2,'',390],['en',2,'',1280],['ar',2,'',1280],['en',1,'large',390]].map(([l,z,s,w])=>({name:`zoom-${l}-${z}x-${w}${s?'-'+s:''}`,path:'?view=chat',wait:3000,width:w,height:w>600?900:844,js:check(l,z,s)}));
fs.writeFileSync('tools/browser-checks/jobs-zoom.json',JSON.stringify(jobs,null,1));console.log(jobs.length);
