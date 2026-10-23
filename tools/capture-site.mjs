#!/usr/bin/env node
/* Save a REAL page's raw HTML as a test fixture (run where the site is reachable, e.g. Ina's machine).
   Usage: node tools/capture-site.mjs <https-url> [name]
   Writes tests/fixtures/sites/captured/<name>.html with the source URL and capture time in a header comment.
   Then add what the page should yield to tests/fixtures/sites/captured/expectations.json and run
   node tests/site-captures.test.mjs. No cookies, no credentials, no query strings. */
import {writeFileSync} from 'node:fs';
const [,,url,name]=process.argv;
const u=new URL(url||'');if(u.protocol!=='https:'||u.search||u.username||u.password)throw Error('https URL without query or credentials only');
const r=await fetch(u.href,{redirect:'follow',headers:{Accept:'text/html','User-Agent':'OriviaFixtureCapture/0.1'}});
if(!r.ok||!/text\/html/i.test(r.headers.get('content-type')||''))throw Error('Not an HTML page: '+r.status);
const html=await r.text();if(html.length>1500000)throw Error('Page larger than 1.5 MB');
const file=(name||(u.hostname+u.pathname).replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,80))+'.html';
writeFileSync(new URL('../tests/fixtures/sites/captured/'+file,import.meta.url),'<!-- RAW CAPTURE of '+r.url+' at '+new Date().toISOString()+' (tools/capture-site.mjs). -->\n'+html);
console.log('Saved tests/fixtures/sites/captured/'+file+' ('+html.length+' bytes). Add its expected facts to expectations.json.');
