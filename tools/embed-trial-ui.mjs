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
swap('/chat.js',fs.readFileSync('workers/trial-ui/chat.js','utf8'));
fs.writeFileSync(W,src);
console.log('Embedded trial UI into',W);
