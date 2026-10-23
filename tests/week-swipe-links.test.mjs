/* ORI-CAL-001 week swipe and ORI-UX-003/004 brand link colours (master spec 22 Oct 2026).
   Run: node tests/week-swipe-links.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n'),page=fs.readFileSync('workers/trial-ui/page.html','utf8'),pui=fs.readFileSync('workers/accounts/platform-ui.mjs','utf8');
// Exercise the real gesture rule, taken from the shipped source.
const src=chat.match(/function weekSwipeStep\([^)]*\)\{[^\n]*\}/)[0];
const weekSwipeStep=new Function(src+';return weekSwipeStep')();
assert.equal(weekSwipeStep(-80,4,false),1,'swipe left = next week');
assert.equal(weekSwipeStep(80,4,false),-1,'swipe right = previous week');
assert.equal(weekSwipeStep(80,4,true),1,'RTL: swipe right = next week');
assert.equal(weekSwipeStep(-80,4,true),-1,'RTL: swipe left = previous week');
assert.equal(weekSwipeStep(-30,0,false),0,'below threshold (a tap or wobble) does nothing');
assert.equal(weekSwipeStep(-60,200,false),0,'vertical page scroll never changes week');
assert.equal(weekSwipeStep(-60,50,false),0,'diagonal that is not clearly horizontal is ignored');
// One change per gesture, cancellation, swipe does not also tap a day, arrows kept, native vertical scroll kept.
assert.ok(chat.includes("strip.addEventListener('pointercancel',()=>{start=null})"));
assert.ok(/pointerup[^\n]*start=null;/.test(chat),'state cleared on release, so one gesture = one week');
assert.ok(chat.includes("if(swiped){e.stopPropagation();e.preventDefault();swiped=false}},true)"));
assert.ok(chat.includes("$('wk-prev').onclick")&&chat.includes("$('wk-next').onclick"));
assert.ok(page.includes('.days{touch-action:pan-y;'));
// Links: brand tokens in light and both dark paths, underline as non-colour cue, no browser-default blue for links.
for(const [name,css] of [['app',page],['staff',pui]]){
 assert.ok(css.includes('--link:#7A5300')&&css.includes('--link:#F5C842'),name+' link tokens');
 assert.ok(css.includes(':where(a){color:var(--link);text-decoration:underline'),name+' links underlined in brand colour');
}
assert.equal((page.match(/--link:#F5C842/g)||[]).length,2,'dark media query and explicit dark theme both set it');
assert.doesNotMatch(page,/(\.event a|\.ask|\.more-text summary|\.ev \.acts a)\{[^}]*color:var\(--focus\)/,'links no longer use focus blue');
// Contrast (WCAG AA 4.5:1) for link text on the main surfaces.
const lum=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const ratio=(a,b)=>{const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05)};
for(const bg of ['#FFFFFF','#F3F5F1','#E9ECE7','#FFF3C9'])assert.ok(ratio('#7A5300',bg)>=4.5,'light link on '+bg+' '+ratio('#7A5300',bg).toFixed(2));
for(const bg of ['#141B23','#1A232D','#0B1015','#3A3110'])assert.ok(ratio('#F5C842',bg)>=4.5,'dark link on '+bg+' '+ratio('#F5C842',bg).toFixed(2));
console.log('Week swipe (LTR/RTL, threshold, vertical rejection) and brand link colours (AA contrast both themes): pass.');
