/* Answer accuracy (22 Oct): a figure may only be stated for what the source states it for. Regression for the nol test,
 * where "Gold card for AED 25" borrowed the Silver card's price from the same RTA page. Run: node tests/answer-accuracy.test.mjs */
import assert from 'node:assert/strict';
import {verifyReply,factAboutSubject} from '../workers/orivia-assistant.mjs';

// The RTA page text as Orivia read it (order as on the page).
const rta={id:'E1',url:'https://www.rta.ae/wps/portal/rta/ae/public-transport/Nol-Home',title:'nol Home - Roads & Transport Authority',kind:'government',
 excerpt:'nol Silver Card\nEnjoy the ease of getting this card immediately from any ticket office for only AED 25 (includes AED 19 e-purse value). nol silver card is a smart card with an e-purse that can be loaded with credit.\nnol Gold Card\nnol gold card holds the same features as the silver card, but it gives you the privileged access to metro\'s gold class seats for a premium fare.\nnol Red Ticket\nA paper ticket for occasional users.'};
const check=(text,kind='official_rule')=>verifyReply({sentences:[{text,kind,evidence:['E1']}]},[rta]);

// The original error is now refused.
let v=check('If you want access to the Metro’s Gold Class seats, RTA also offers a Gold card for AED 25, including AED 19 credit, but journeys carry a premium fare.');
assert.equal(v.ok,false,'the Gold card is not AED 25 on this page');assert.ok(v.errors.some(e=>/only state a figure for what the source states it for/.test(e)));
// The correct statements still pass.
v=check('RTA says you can get the Silver card immediately at any ticket office for AED 25, including AED 19 of travel credit.');assert.equal(v.ok,true,JSON.stringify(v.errors));
v=check('The Gold card gives access to the Metro’s Gold Class seats for a premium fare.');assert.equal(v.ok,true,JSON.stringify(v.errors));
// A figure the page doesn't have at all is still caught by the existing evidence check.
v=check('The Silver card costs AED 30 at any ticket office.');assert.equal(v.ok,false);

// Ordinary cases: one subject per page, or a figure with the subject named right next to it.
const school={id:'E2',url:'https://www.wesgreen.sch.ae/fees',title:'Fees',kind:'website',excerpt:'Admissions office. Fees from AED 32,000 for Foundation Stage. Call +971 6 555 1234.'};
assert.equal(factAboutSubject({type:'amount',value:'AED 32,000'},'Foundation Stage fees start from AED 32,000.',[school]),true);
assert.equal(factAboutSubject({type:'amount',value:'AED 32,000'},'Year 13 fees start from AED 32,000.',[school]),true,'nothing distinctive on the page to contradict: not refused');
console.log('Answer accuracy: figures stay with what the source states them for (nol Gold/Silver), correct statements pass.');
