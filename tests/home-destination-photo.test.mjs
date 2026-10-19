import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const js=fs.readFileSync('workers/trial-ui/chat.js','utf8'),manifest=JSON.parse(fs.readFileSync('workers/trial-ui/destination-photos.json','utf8'));
const code=js.slice(js.indexOf('function homeCountry('),js.indexOf('/* Dashboard reads'));
function node(){return {hidden:true,textContent:'',src:'',attrs:{},classList:{items:new Set(),add(x){this.items.add(x)},remove(x){this.items.delete(x)}},getAttribute(k){return k==='src'?this.src:this.attrs[k]},removeAttribute(k){if(k==='src')this.src='';else delete this.attrs[k]}}}
const nodes=new Map(),get=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)};
const photos=Object.fromEntries(Object.entries(manifest).map(([key,p])=>[key,{...p,image:'data:image/jpeg;base64,'+fs.readFileSync(p.file).toString('base64')}]));
const ctx=vm.createContext({$:get,DESTINATION_PHOTOS:photos,uiText:v=>v});vm.runInContext(code,ctx);
assert.equal(ctx.homeCountry({here:'uae',dest:'uk'}),'uae');
assert.equal(ctx.homeCountry({here:'away',dest:'uk',originCountry:'AE'}),'uk','upcoming destination, never origin');
assert.equal(ctx.homeCountry({here:'away',dest:'unsure'}),null);assert.equal(ctx.homeCountry({}),null);assert.equal(ctx.homeCountry({here:'other'}),null);
ctx.renderHomeDestination({here:'uae'});assert.equal(get('home-destination-photo').src,photos.uae.image);assert.equal(get('home-destination-photo').hidden,false);assert.equal(get('home-destination-caption').textContent,'Dubai · United Arab Emirates');assert.ok(get('home-welcome').classList.items.has('has-destination'));
ctx.renderHomeDestination({here:'away',dest:'uk'});assert.equal(get('home-destination-photo').src,photos.uk.image);assert.equal(get('home-greeting').textContent,'Your next chapter: United Kingdom');
ctx.renderHomeDestination({});assert.equal(get('home-destination-photo').hidden,true);assert.equal(get('home-destination-photo').src,'');assert.equal(get('home-destination-caption').hidden,true);assert.equal(get('home-photo-credit').hidden,true);
ctx.renderHomeDestination({here:'uk'});get('home-destination-photo').onerror();assert.equal(get('home-destination-photo').hidden,true);assert.ok(!get('home-welcome').classList.items.has('has-destination'),'readable navy fallback after image failure');
for(const p of Object.values(manifest)){const image=fs.readFileSync(p.file);assert.ok(image.length<110000);assert.equal(image[0],255);assert.equal(image[1],216);assert.equal(new URL(p.source).protocol,'https:');assert.equal(p.license,'https://unsplash.com/license')}
assert.ok(!/fetch\(|geolocation|https:/.test(code),'selection makes no remote request and does not collect location');
const worker=fs.readFileSync('workers/orivia-ai-private-trial.mjs','utf8');assert.ok(worker.includes(photos.uae.image.slice(0,90)));assert.ok(!worker.includes('/*__DESTINATION_PHOTOS__*/{}'),'photos compiled into UI');
console.log('Destination hero: current vs future country, origin excluded, both bundled JPEGs, empty/failure fallback and no remote requests passed');
