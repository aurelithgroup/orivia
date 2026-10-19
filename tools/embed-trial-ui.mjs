// Copies workers/trial-ui/page.html and chat.js into workers/orivia-ai-private-trial.mjs
// (the Worker serves them as embedded strings). Run: node tools/embed-trial-ui.mjs
import fs from 'node:fs';
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
swap('/chat.js',i18n+'\n'+chat);
fs.writeFileSync(W,src);
console.log('Embedded trial UI into',W);
