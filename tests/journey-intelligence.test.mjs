/**
 * Orivia journey intelligence: realistic conversations, not polished prompts.
 * Run: node --test tests/journey-intelligence.test.mjs
 *
 * Passing tests describe implemented safeguards. TODO tests define gaps that
 * need product/engineering fixes, without making unrelated CI builds red.
 * No live AI calls, private data, backend writes, or browser dependencies.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {detectOpenNeed,entryGuidance} from '../workers/orivia-natural-entry.mjs';
import {tryJourneyReply} from '../workers/orivia-ai-journey-adapter.mjs';

const user=content=>({role:'user',content});
const assistant=content=>({role:'assistant',content});
const opening=content=>[user(content)];
const visa='I am a university student and need help with my residence visa';
const start=()=>{const messages=opening(visa);const first=tryJourneyReply(messages);assert.match(first?.reply||'',/Are you in the UAE now/i);return {messages,first};};

test('confused student: recognise uncertainty without assigning a visa journey',()=>{
 const input='um idrk what i need but i am starting uni in a month and tbh idk what is being done...lol';
 const result=detectOpenNeed(opening(input));
 assert.equal(result?.kind,'unsure_student');
 assert.match(result.guidance,/Do not assume they need a residence visa/);
 assert.equal(tryJourneyReply(opening(input)),null);
});
test('newly arrived parent: do not infer school, medical or visa problems',()=>{
 const result=detectOpenNeed(opening('i just moved here with my kids. AND THATS IT'));
 assert.equal(result?.kind,'family_arrival');
 assert.match(result.guidance,/Do not presume school, visa or medical/);
});
test('two-word residence ID: clarify rather than guess documents or eligibility',()=>{
 const result=detectOpenNeed(opening('residence id'));
 assert.equal(result?.kind,'ambiguous_document');
 assert.equal(tryJourneyReply(opening('residence id')),null);
 assert.match(entryGuidance(opening('residence id')),/disambiguating question/);
});
test('explicit student visa intent: safe, narrow first check-up',()=>{
 const {first}=start();
 assert.match(first.reply,/yes \/ no/);
 assert.equal(first.journey?.questionId,'q1');
});
test('plain no: source-bound context for entry permit, no canned repeated answer',()=>{
 const {messages,first}=start();
 const result=tryJourneyReply([...messages,assistant(first.reply),user('no')]);
 assert.ok(result?.journeyContext);
 assert.ok(!result.reply);
 assert.match(result.journeyContext,/step 1 of 8/);
 assert.match(result.journeyContext,/Never ask for passport/);
 assert.match(result.journeyContext,/journey-level, not proof/);
});
test('colloquial no and not yet are accepted for an actual pending check-up',()=>{
 const {messages,first}=start();
 for(const phrase of ['nope','not yet','nah']){
  const result=tryJourneyReply([...messages,assistant(first.reply),user(phrase)]);
  assert.match(result?.journeyContext||'',/step 1 of 8/,phrase);
 }
});
test('unclear response to pending question defers to conversational AI instead of looping',()=>{
 const {messages,first}=start();
 assert.equal(tryJourneyReply([...messages,assistant(first.reply),user('umm what does that mean')]),null);
});
test('after placement, yes please and what? stay conversational',()=>{
 const {messages,first}=start();
 const history=[...messages,assistant(first.reply),user('no'),assistant('Your university is handling your entry permit. Want help drafting a message?')];
 for(const phrase of ['yes please','what?']){
  const result=tryJourneyReply([...history,user(phrase)]);
  assert.equal(result?.reply,undefined,phrase);
  assert.ok(result?.journeyContext,phrase);
 }
});
test('no visa autopilot for an ordinary university or transport message',()=>{
 assert.equal(tryJourneyReply(opening('I am starting university in Dubai next month. What should I sort out?')),null);
 assert.equal(tryJourneyReply(opening('How do I get to university?')),null);
});
test('original source constraints remain in journey facts and are not live verification',()=>{
 const {messages,first}=start();
 const result=tryJourneyReply([...messages,assistant(first.reply),user('no')]);
 assert.match(result.journeyContext,/general official reference/);
 assert.match(result.journeyContext,/not proof of university-specific details/);
 assert.equal(result.liveJourneyData,undefined);
});
test('ongoing conversation does not restart the one-time unsure-student introduction',()=>{
 const messages=[user('i start uni soon'),assistant('What would you like help with?'),user('actually i need directions')];
 assert.equal(detectOpenNeed(messages),null);
});

// SPECIFICATION GAPS: keep visible in test output, not silently reported as passing.
// To convert a TODO to a required test, first implement the expected behaviour.
test('TODO: third-party visa updates should trigger careful clarification, not a generic q1 reset',{todo:'Needs consent-aware context extraction and non-assumptive clarification'},()=>{
 const result=tryJourneyReply(opening('Mum says my university is sorting my residence visa, but idk what has actually been done'));
 assert.ok(!result?.reply?.includes('Are you in the UAE now?'),'should clarify what is confirmed before restarting checkups');
});
test('TODO: corrections must override an earlier statement instead of relying on adjacent yes/no answers',{todo:'Needs structured, user-confirmed placement revisions'},()=>{
 const {messages,first}=start();
 const history=[...messages,assistant(first.reply),user('no'),assistant('You are waiting for your entry permit.'),user('wait actually I am in Dubai already')];
 const result=tryJourneyReply(history);
 assert.ok(!result?.journeyContext?.includes('step 1 of 8'),'should not keep previous step once corrected');
});
test('TODO: full seven-question check-up should retain progress with bounded chat history',{todo:'Needs explicit progress state rather than reconstructing only recent messages'},()=>{
 const {messages,first}=start();
 const history=[...messages,assistant(first.reply),user('yes')];
 // Moving through all questions can exceed the chat context cap.
 assert.ok(tryJourneyReply(history),'smoke check before a persistent journey state implementation');
});
