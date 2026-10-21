// Copies workers/trial-ui/page.html and chat.js into workers/orivia-ai-private-trial.mjs
// (the Worker serves them as embedded strings). Run: node tools/embed-trial-ui.mjs
import nodeFs from 'node:fs';
// Windows checkouts can turn line endings into CRLF; always embed the same LF text that CI and GitHub hold.
const fs={...nodeFs,readFileSync:(p,e)=>{const d=nodeFs.readFileSync(p,e);return typeof d==='string'?d.replace(/\r\n/g,'\n'):d}};
const W='workers/orivia-ai-private-trial.mjs';
let src=fs.readFileSync(W,'utf8');
const swap=(path,content)=>{
 const marker="if(url.pathname==='"+path+"'&&req.method==='GET')return new Response(";
 const a=src.indexOf(marker); if(a<0) throw new Error('marker not found: '+path);
 const start=a+marker.length, end=src.indexOf(',{headers:',start);
 src=src.slice(0,start)+JSON.stringify(content)+src.slice(end);
};
swap('/',fs.readFileSync('workers/trial-ui/page.html','utf8').trim());
const i18n=fs.readFileSync('workers/trial-ui/i18n.js','utf8').replace('/*__TRANSLATIONS__*/{}',JSON.stringify(JSON.parse(fs.readFileSync('workers/trial-ui/translations.json','utf8'))));
const photos=JSON.parse(fs.readFileSync('workers/trial-ui/destination-photos.json','utf8'));
for(const photo of Object.values(photos)){photo.image='data:image/jpeg;base64,'+fs.readFileSync(photo.file).toString('base64');delete photo.file;}
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace('/*__DESTINATION_PHOTOS__*/{}',()=>JSON.stringify(photos));
const nav=fs.readFileSync('workers/trial-ui/nav.js','utf8');
swap('/orivia-nav.js',nav);
swap('/chat.js',i18n+'\n'+nav+'\n'+fs.readFileSync('workers/trial-ui/accounts.js','utf8')+'\n'+fs.readFileSync('workers/trial-ui/spaces.js','utf8')+'\n'+fs.readFileSync('workers/trial-ui/notifications.js','utf8')+'\n'+chat);
fs.writeFileSync(W,src);
console.log('Embedded trial UI into',W);
