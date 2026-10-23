import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const window={};
vm.runInNewContext(fs.readFileSync(new URL('../workers/trial-ui/voice-text.js',import.meta.url),'utf8'),{window});
for(const text of ['学校'.repeat(150),'x'.repeat(501),'مرحبا '.repeat(90),'Bonjour ! Voici votre prochain pas. '.repeat(30),'🙂'.repeat(301),'English 中文 العربية français', '']){
 const parts=window.OriviaVoiceText.chunks(text);
 assert.equal(parts.join(''),text,'no dropped characters or changed source text');
 assert.ok(parts.every(p=>Array.from(p).length<=200));
 assert.ok(parts.every(p=>!/[\uD800-\uDBFF]$/.test(p)&&!/^\p{Surrogate}/u.test(p)));
}
for(const limit of [NaN,0,-5,Infinity,16.8])assert.equal(window.OriviaVoiceText.chunks('a'.repeat(1200),limit).join(''),'a'.repeat(1200));
console.log('Voice text: lossless bounded chunks for long unspaced, multilingual and astral text passed');
