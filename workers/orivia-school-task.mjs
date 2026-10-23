// Conversation state is scope, never evidence. Client-supplied URLs must pass the same source/path policy again.
import {speaPage} from './orivia-spea-reader.mjs';
const CURRICULA=['british','american','indian','ib','australian','french','german','moe','pakistani','filipino','sabis'];
export function schoolTaskContext(value){
 if(!value||typeof value!=='object'||value.city!=='Sharjah')return null;
 const urls=a=>[...new Set((Array.isArray(a)?a:[]).slice(0,24).map(u=>typeof u==='string'&&u.length<220?speaPage(u):'').filter(Boolean))];
 const out={...(typeof value.targetName==='string'?{targetName:value.targetName.replace(/[^\p{L}\p{N}&.' -]/gu,' ').trim().slice(0,80)}:{}),city:'Sharjah',curriculum:CURRICULA.includes(value.curriculum)?value.curriculum:'',year:Number.isInteger(value.year)&&value.year>=1&&value.year<=13?value.year:null,shown:urls(value.shown)};
 if(value.cursor&&typeof value.cursor==='object')out.cursor={skipDirectory:value.cursor.skipDirectory===true,searchOffset:Math.max(0,Math.min(10,Math.floor(Number(value.cursor.searchOffset)||0))),pending:urls(value.cursor.pending).slice(0,20)};
 return out;
}
export function schoolOperation(text){
 const t=String(text||'').toLowerCase();
 if(/\b(compare|comparison|difference between|which (?:one|school) is better)\b/.test(t))return 'compare';
 if(/\b(?:i (?:want|need)(?: to see)? all (?:of )?(?:them|those|these)|(?:all|every(?: single)?) (?:the )?(?:[a-z-]+ ){0,3}schools?\b)/.test(t))return 'expand';
 if(/\b(?:only (?:two|2|those|these)|(?:any |find |show |see |look for )?(?:more|other|additional) (?:schools|options|ones)|are (?:those|these|they) (?:all|the only)|is that (?:all|it))\b/.test(t))return 'expand';
 return '';
}
export function namedSchool(text){
 const s=String(text||'').replace(/[’‘]/g,"'");
 const m=s.match(/\b(?:heard (?:of|about)|what about|check(?: out)?|look up|tell me about)\s+(.{3,100}?\bschool(?:s)?\b)/i)||s.match(/\b(?:does|is)\s+(.{3,100}?\bschool\b)/i);
 // A bare school name is a lookup, including an emphatic repeat after no match.
 // Commands and curriculum-only requests must remain discovery/expansion.
 const bare=s.trim().replace(/[.!?]+$/,'');
 const exact=!m&&/^[\p{L}\p{N}&.' -]{3,100}\bschool$/iu.test(bare)&&! /\b(find|list|show|every|all|curriculum|curricula|which|more|other|any|a|the)\b/i.test(bare);
 if(!m&&!exact)return '';
 const name=(m?m[1]:bare).replace(/[^\p{L}\p{N}&.' -]/gu,' ').replace(/\s+/g,' ').trim().slice(0,80);
 return /^(?:a |the |any |more |other |british curriculum )?schools?$/i.test(name)?'':name;
}
