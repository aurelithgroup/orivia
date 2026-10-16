/* Regression: the founder's 16 Oct test looped the same canned reply for "yes please" and "what?".
   Check-up answers stay deterministic; once placed, the AI gets checked facts to phrase. Run: node tests/journey-adapter-loop.test.mjs */
import assert from 'node:assert/strict';
import { tryJourneyReply } from '../workers/orivia-ai-journey-adapter.mjs';
const u = c => ({ role: 'user', content: c }), a = c => ({ role: 'assistant', content: c });
const msgs = [u("I'm a university student and I need help with my residence visa")];
const r1 = tryJourneyReply(msgs);
assert.ok(r1.reply && /\(yes \/ no/.test(r1.reply), 'asks a check-up question');
msgs.push(a(r1.reply), u('no'));
const r2 = tryJourneyReply(msgs);
assert.ok(!r2.reply && r2.journeyContext, 'placed: hands facts to the AI, no canned paragraph');
assert.match(r2.journeyContext, /step 1 of 8/); assert.match(r2.journeyContext, /Never ask for passport/);
msgs.push(a('You are at the entry permit step… Want me to draft a message to your visa office?'), u('yes please'));
const r3 = tryJourneyReply(msgs);
assert.ok(!r3.reply && r3.journeyContext, '"yes please" goes to the AI with the same facts');
msgs.push(a('Here is a draft…'), u('what?'));
assert.ok(!tryJourneyReply(msgs).reply, '"what?" is not answered with a template');
/* An unclear reply to a pending question falls through to the AI instead of repeating the question */
assert.equal(tryJourneyReply([msgs[0], a(r1.reply), u('hmm what do you mean')]), null);
assert.equal(tryJourneyReply([u('I start university next month')]), null, 'no automatic visa funnel');
console.log('Journey adapter: no loop, AI phrases checked facts: passed');
