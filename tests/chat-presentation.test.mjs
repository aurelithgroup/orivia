import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
class Element {
 constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.textContent=''}
 append(...items){this.children.push(...items)}
 setAttribute(k,v){this.attrs[k]=v}
}
const document={head:new Element('head'),getElementById(id){return this.head.children.find(x=>x.id===id)},createElement:tag=>new Element(tag)};
const window={document,OriviaI18n:{language:()=> 'fr'}};
vm.runInNewContext(fs.readFileSync(new URL('../workers/trial-ui/chat-presentation.js',import.meta.url),'utf8'),{window,URL,Date,Set});
const api=window.OriviaPresentation;
assert.equal(api.titleFor([{role:'user',content:'bonjour'}]),'Nouvelle discussion');
assert.equal(api.titleFor([{role:'user',content:'Hi'},{role:'assistant',content:'False title'},{role:'user',content:'Find schools in Sharjah'}]),'Find schools in Sharjah');
const source={id:'s1',url:'https://example.com/',title:'<script>literal title</script>',category:'official'};
const walk=node=>[node,...node.children.flatMap(walk)];
const render=extra=>api.renderSources({sources:[source],claims:[],...extra});
for(const status of ['partial','search-unavailable','no-evidence','search-limit'])assert.equal(render({research:{status}}),null);
assert.equal(render({research:{unresolved:['school']}}),null);
assert.equal(render({sources:[{...source,url:'javascript:alert(1)'}]}),null);
assert.equal(render({sources:[{...source,category:'invented'}]}),null);
const panel=render({language:'ar',claims:[{sourceId:'s1',text:'Supported claim',quotes:[{label:'Curriculum',quote:'Exact quote'}]},{sourceId:'missing',text:'Wrong source',quote:'wrong'}]});
const nodes=walk(panel);
assert.equal(panel.dir,'rtl');
assert.ok(nodes.some(x=>x.tag==='blockquote'&&x.textContent==='Exact quote'));
assert.ok(!nodes.some(x=>x.textContent==='Wrong source'));
assert.ok(nodes.some(x=>x.textContent===source.title)); // textContent, never HTML
assert.equal(nodes.filter(x=>x.tag==='script').length,0);
assert.ok(nodes.filter(x=>x.tag==='a').every(x=>x.rel==='noopener noreferrer'&&x.attrs['aria-label']));
const dup=render({sources:[source,{...source,url:'https://example.com/other'}],claims:[{sourceId:'s1',text:'Ambiguous claim',quote:'do not display'}]});
assert.ok(!walk(dup).some(x=>x.textContent==='Ambiguous claim'));
const filtered=render({sources:[{...source,url:'http://unsafe.example/'},source]});
assert.ok(walk(filtered).some(x=>x.tag==='a'&&/ 2:/.test(x.attrs['aria-label'])));
render({});assert.equal(document.head.children.length,1);
console.log('Standalone presentation hook checks passed');

assert.ok(nodes.filter(x=>x.tag==='a').every(x=>x.textContent==='example.com ↗'),'source links show only the host, with no visible number');
