/* Submission readiness (30 Oct, bounded) in the device photo review: a rough quality note that warns only when the
   measurement supports it, a pages prompt that defers to the receiving organisation's checklist, and a plain list of what
   Orivia can't assess. No completeness, authenticity or acceptance claims; nothing blocks using the photo.
   Run: node tests/submission-readiness.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const src=fs.readFileSync('workers/trial-ui/image-review.js','utf8'),ctx={window:{}};vm.createContext(ctx);vm.runInContext(src,ctx);
const {assess,sharpness,CANNOT}=ctx.window.OriviaImageReview;
// Synthetic greyscale images: sharp black-and-white edges vs the same edges smoothed away.
const W=200,H=200,img=f=>{const g=new Float32Array(W*H);for(let y=0;y<H;y++)for(let x=0;x<W;x++)g[y*W+x]=f(x,y);return g};
const sharp=sharpness(img((x,y)=>((x>>3)+(y>>3))%2?255:0),W,H),flat=sharpness(img((x)=>100+x*.2),W,H),soft=sharpness(img((x,y)=>128+60*Math.sin(x/25)*Math.sin(y/25)),W,H);
assert.ok(sharp>1000,'crisp edges score high: '+sharp);assert.ok(flat<1&&soft<40,'smooth images score low: '+flat+' '+soft);
assert.equal(sharpness(new Float32Array(4),2,2),null,'too small to measure');
const text=n=>n.map(x=>x.text).join(' ');
// Warnings only when supported; a good photo gets a qualified note, never a promise.
assert.match(text(assess({width:3000,height:4000,variance:sharp})),/^No obvious blur or low resolution found\. This is only a rough check of the photo, not of the document\.$/);
assert.match(text(assess({width:640,height:480,variance:sharp})),/Low resolution \(640 × 480\)/);
assert.match(text(assess({width:3000,height:4000,variance:soft})),/may be blurry/);
assert.doesNotMatch(text(assess({width:3000,height:4000,variance:null})),/blurry/,'no blur claim when it couldn’t be measured');
for(const v of [sharp,soft,null])for(const n of assess({width:800,height:600,variance:v}))assert.doesNotMatch(n.text,/accept|complete|valid|genuine|authentic|official|approved|will be/i,'no acceptance or authenticity claim: '+n.text);
// What can't be assessed is said plainly; pages defer to the receiving organisation's checklist.
assert.deepEqual([...CANNOT],['whether this is every page they need','whether the document is genuine, valid or up to date','whether it will be accepted']);
for(const s of ['one photo can’t show whether a document is complete. Compare the pages you’ve chosen with the checklist from the organisation you’re sending them to.','Orivia can’t check:','Only the organisation receiving it can tell you that.'])assert.ok(src.includes(s),s);
// The controls, and nothing blocks using the photo; zoom is view-only.
for(const b of ['Rotate','Zoom in','Zoom out','Retake','Use photo'])assert.ok(src.includes("button('"+b+"'"),b);
assert.ok(!/disabled\s*=\s*true/.test(src),'no control is disabled by the check');
assert.ok(/Zoom changes only how big the preview looks here; the saved photo is unchanged\./.test(src)&&!/zoom/.test(src.slice(src.indexOf("const draw=()=>"),src.indexOf("// Zoom changes"))),'zoom never changes the saved image');
assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon/.test(src),'the review sends nothing');
console.log('Submission readiness: rough quality note (resolution, possible blur) warns only when supported, pages prompt defers to the receiving organisation, limits stated, no acceptance or authenticity claims, zoom view-only, nothing sent.');
