// Runs every command from the CI workflow's run: lines (skipping npm ci), records pass/fail per command as JSON.
import fs from 'node:fs';import {execSync} from 'node:child_process';
const y=fs.readFileSync('.github/workflows/orivia-ai-dev.yml','utf8').replace(/\r/g,'').split('\n');const cmds=[];let block=false;
for(const l of y){const m=l.match(/^\s*run:\s*(\|)?\s*(.*)$/);if(m){block=!!m[1];if(!block&&m[2])cmds.push(m[2].trim());continue}
 if(block){if(/^\s{10}\S/.test(l))cmds.push(l.trim());else if(l.trim()&&!/^\s{10}/.test(l))block=false}}
const res=[];let fail=0;
for(const c of cmds){if(/^npm ci/.test(c))continue;const t=Date.now();let status='pass',tail='';
 try{tail=execSync(c,{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:180000}).trim().split('\n').pop()}catch(e){status='fail';fail++;tail=String(e.stderr||e.stdout||e.message).trim().split('\n').slice(-3).join(' | ')}
 res.push({command:c,status,ms:Date.now()-t,last:tail.slice(0,240)});console.log(status,c)}
fs.writeFileSync(process.argv[2],JSON.stringify({ranAt:new Date().toISOString(),sha:execSync('git rev-parse HEAD',{encoding:'utf8'}).trim(),dirty:!!execSync('git status --porcelain -uno',{encoding:'utf8'}).trim(),total:res.length,failed:fail,results:res},null,1));
console.log('TOTAL',res.length,'FAILED',fail);
