/* Builds the evidence ledger for Ina's master spec (docs/orivia-requirements-2026-10-22.json): one entry per requirement
   with owner, status (GOV-009 vocabulary only), tested SHA, environment, evidence and remaining dependency.
   Statuses are written by hand below; this script only joins them to the spec and refuses gaps or unknown words.
   Usage: node tools/requirements-ledger.mjs <candidateSha> <pilotVersion> */
import fs from 'node:fs';
const [sha,pilot]=process.argv.slice(2);if(!sha||!pilot)throw Error('usage: <candidateSha> <pilotVersion>');
const spec=JSON.parse(fs.readFileSync('docs/orivia-requirements-2026-10-22.json','utf8'));
const VOCAB=['existing','in progress','implemented unverified','locally verified','pilot verified','blocked external','deferred by scope','released'];
const PROD='production b9e32ffc (myorivia.app), also on pilot',PIL='pilot '+pilot+' (local tests + local browser harness; live pilot check is Ina’s)',CODE='source at '+sha+' (pre-existing; not re-tested against the new acceptance)';
const NOTYET='Not started tonight: deferred by the GOV-007 cut-off, not by a product decision.';
// [status, evidence, dependency?]
const S={
'GOV-001':['locally verified','Built on the integrated app (a846926 → candidate); all 87 CI commands pass (docs/evidence/pilot-candidate-2026-10-22.json).'],
'GOV-002':['locally verified','Baseline a846926 = spec baselineSha; production b9e32ffc recorded before work.'],
'GOV-003':['in progress','Cleo integrated one candidate; Ina’s independent review pending.','Ina review'],
'GOV-004':['locally verified','No founder test requested during this build.'],
'GOV-005':['locally verified','This ledger: most of the spec is not built; see counts.'],
'GOV-006':['locally verified','Only additive CREATE TABLE IF NOT EXISTS (feedback.sql) on the pilot test DB 8cd85061; production DBs untouched.'],
'GOV-007':['locally verified','Candidate, evidence and blocker list supplied at cut-off.'],
'GOV-008':['locally verified','orivia-production still b9e32ffc after deploy (wrangler deployments list); no budget, provider, email, purchase, share or store action.'],
'GOV-009':['locally verified','Every entry uses only the eight GOV-009 words (checked by this script).'],
'GOV-010':['locally verified','Secret-pattern scan of tracked files clean; no participant data. Finding: older public pages/config link to *.habeebahsallah27.workers.dev (exposes the founder’s username).','Move public links to a custom domain'],
'UX-001':['existing','Shared shell: app, /platform and /manage reachable from the space menu; '+CODE],
'UX-002':['released','Ina design pass and six design fixes released (b9e32ffc).'],
'UX-003':['locally verified','--link #7A5300 light / #F5C842 dark, underline, AA contrast computed on 8 surfaces; tests/week-swipe-links.test.mjs; harness computed style.','Ina live check in both themes'],
'UX-004':['locally verified','App links, staff/owner console and refusal page use brand tokens; source citations keep their own style.','Full screen audit incl. auth emails'],
'UX-005':['existing',CODE],'UX-006':['released','Home, Chat, Library, My Life, Calendar bottom bar released.'],
'UX-007':['existing',CODE],'UX-008':['existing','Two-tap removes for calendar and library; '+CODE],'UX-009':['existing',CODE],'UX-010':['existing',CODE],
'HOME-001':['released','Home released.'],'HOME-002':['released','Honest country captions (design pass).'],'HOME-003':['existing',CODE],'HOME-004':['existing','Organisation arrival; '+CODE],
'HOME-005':['deferred by scope',NOTYET],'HOME-006':['existing',CODE],'HOME-007':['existing',CODE],'HOME-008':['existing',CODE],'HOME-009':['deferred by scope',NOTYET],'HOME-010':['existing',CODE],
'CHAT-001':['existing','Assistant intent tests; '+CODE],'CHAT-002':['existing',CODE],'CHAT-003':['deferred by scope',NOTYET],'CHAT-004':['released','Copy (Chat refresh).'],
'CHAT-005':['deferred by scope',NOTYET+' Needs message versions (with CHAT-006).'],'CHAT-006':['deferred by scope',NOTYET],
'CHAT-007':['locally verified','PUT /api/account/feedback/rating (set/change/remove, reasons); 30-day totals in Orivia management; tests/feedback.test.mjs (real SQLite); harness click test.','Ina live check; guest ratings not stored (told to sign in)'],
'CHAT-008':['locally verified','Report a problem: 5 categories, note, reply text off by default with preview, receipt FB-xxxx, idempotent retry, failure shows no success; owner-only queue without identity; tests/feedback.test.mjs; harness click test.','Ina live check'],
'CHAT-009':['deferred by scope',NOTYET],'CHAT-010':['deferred by scope',NOTYET],'CHAT-011':['existing',CODE],'CHAT-012':['existing','Pin/archive/search; '+CODE],
'CHAT-013':['released','Chat refresh.'],'CHAT-014':['released','Reply arrival and reading position (Chat refresh).'],'CHAT-015':['released','Stop (Chat refresh).'],
'AI-001':['existing','runAssistantTurn decide/act/verify; '+CODE],'AI-002':['existing','Source classes in assistant; '+CODE],'AI-003':['existing',CODE],'AI-004':['existing',CODE],'AI-005':['existing','verifyReply claim kinds; '+CODE],
'AI-006':['existing',CODE],'AI-007':['existing',CODE],'AI-008':['existing',CODE],'AI-009':['existing',CODE],'AI-010':['existing',CODE],'AI-011':['existing',CODE],'AI-012':['existing',CODE],
'PERF-001':['in progress','Timing log (orivia-assistant: steps, model/tool ms) exists; numbers-only tail script ready. 0 live samples: pilot traffic is behind Access and the founder is not asked to test.','Ina or reviewer sends the 3 benchmark classes on the pilot'],
'PERF-002':['deferred by scope',NOTYET],'PERF-003':['existing','Same-turn page reuse (tests/assistant-timing.test.mjs).'],'PERF-004':['deferred by scope',NOTYET],'PERF-005':['existing','verifyReply before display; '+CODE],
'PERF-006':['deferred by scope',NOTYET],'PERF-007':['existing',CODE],'PERF-008':['existing','Natural voice released; first-play time not measured.','Measurement'],'PERF-009':['deferred by scope',NOTYET],'PERF-010':['released','Voice $1/day, $5/month caps.'],
'JOURNEY-001':['existing',CODE],'JOURNEY-002':['existing','Guide offer card; '+CODE],'JOURNEY-003':['existing',CODE],'JOURNEY-004':['existing',CODE],'JOURNEY-005':['deferred by scope',NOTYET],'JOURNEY-006':['existing',CODE],
'JOURNEY-007':['deferred by scope',NOTYET],'JOURNEY-008':['deferred by scope',NOTYET],'JOURNEY-009':['deferred by scope',NOTYET],'JOURNEY-010':['deferred by scope',NOTYET],
'LIB-001':['locally verified','Tabs All, Files, Guides, Places and services, Shortlists over existing records (no copies); tests/library.test.mjs.','Saved conversations/links section not built'],
'LIB-002':['locally verified','Vetted place/service cards kept automatically, one per name+site, linked to the chat; fixtures excluded; tests/library-discoveries.test.mjs; harness: 2 mentions → 1 entry.','Ina live check'],
'LIB-003':['locally verified','♥ favourite stays distinct and survives duplicate mentions (harness).'],
'LIB-004':['locally verified','Each discovery links to its chat and source site.'],
'LIB-005':['deferred by scope',NOTYET],'LIB-006':['in progress','Remove hides a discovery from Library only (chat keeps it); no restore control yet.','Restore'],
'LIB-007':['existing','Search and section filters; '+CODE],'LIB-008':['existing',CODE],'LIB-009':['deferred by scope',NOTYET],'LIB-010':['existing','No eviction; storage-full warnings; '+CODE],
'CAL-001':['locally verified','48px horizontal threshold, vertical rejection, pointercancel, one week per gesture, RTL reversed, arrows kept; unit + headless Chrome pointer test.','Real touch device check'],
'CAL-002':['existing','Review card and two-tap Remove; no Undo yet; '+CODE],'CAL-003':['existing','Not re-verified for DST/travel.','DST and travel tests'],'CAL-004':['released','Calendar handoffs released.'],
'CAL-005':['existing',CODE],'CAL-006':['existing',CODE],'CAL-007':['existing',CODE],'CAL-008':['existing',CODE],'CAL-009':['deferred by scope',NOTYET],'CAL-010':['existing',CODE],
'AUTH-001':['released','Accounts and guest entry.'],
'AUTH-002':['deferred by scope',NOTYET+' Spec forbids shipping an insecure switch; needs Better Auth multi-session review.'],'AUTH-003':['deferred by scope',NOTYET],
'AUTH-004':['existing','Account epoch binding and X-Orivia-Account 409; '+CODE],'AUTH-005':['existing','Partial: account header per request; '+CODE],'AUTH-006':['deferred by scope',NOTYET],
'AUTH-007':['existing','Verified email required for organisation and owner actions; '+CODE],'AUTH-008':['deferred by scope','Not reviewed tonight.'],'AUTH-009':['released','In-app account deletion with durable file cleanup.'],'AUTH-010':['existing','Last owner cannot delete; '+CODE],
'OWNER-001':['deferred by scope',NOTYET],'OWNER-002':['existing','Organisation list with admin status; '+CODE],'OWNER-003':['deferred by scope',NOTYET],'OWNER-004':['deferred by scope',NOTYET],
'OWNER-005':['deferred by scope',NOTYET+' Rating totals only.'],'OWNER-006':['deferred by scope',NOTYET],'OWNER-007':['deferred by scope','Caps enforced in config; not shown in console.'],
'OWNER-008':['deferred by scope',NOTYET],'OWNER-009':['locally verified','Feedback queue (reports, Mark reviewed) in Orivia management; support inbox not built.','Support inbox'],
'OWNER-010':['deferred by scope',NOTYET],'OWNER-011':['deferred by scope',NOTYET],'OWNER-012':['deferred by scope',NOTYET],'OWNER-013':['deferred by scope',NOTYET],'OWNER-014':['deferred by scope',NOTYET],
'OWNER-015':['existing','Owner view excludes member lists and chats; feedback queue excludes identities; '+CODE],
'UNI-001':['existing',CODE],'UNI-002':['existing',CODE],'UNI-003':['existing',CODE],'UNI-004':['deferred by scope',NOTYET],'UNI-005':['deferred by scope',NOTYET],'UNI-006':['existing',CODE],
'UNI-007':['existing',CODE],'UNI-008':['existing','Member search, pagination, join requests; '+CODE],'UNI-009':['existing',CODE],'UNI-010':['deferred by scope',NOTYET],
'UNI-011':['released','Staff totals paused (no counts) after Ina 1374ec9.'],'UNI-012':['existing',CODE],'UNI-013':['deferred by scope',NOTYET],
'UNI-014':['blocked external','Needs an authorised partner integration.','Partner agreement'],'UNI-015':['existing',CODE],
'STUDENT-001':['existing',CODE],'STUDENT-002':['existing',CODE],'STUDENT-003':['blocked external','Needs real institutional status data.','Partner integration'],
'STUDENT-004':['existing','Organisation context with server membership check; '+CODE],'STUDENT-005':['released','Private Done marks.'],'STUDENT-006':['deferred by scope',NOTYET],
'STUDENT-007':['existing','Editable email draft card, never claims submission; '+CODE],'STUDENT-008':['existing',CODE],
'CONNECT-001':['deferred by scope',NOTYET],'CONNECT-002':['blocked external','Needs institution identity claims.','Partner SSO'],'CONNECT-003':['deferred by scope',NOTYET],
'CONNECT-004':['deferred by scope',NOTYET],'CONNECT-005':['deferred by scope',NOTYET],'CONNECT-006':['locally verified','This receipt states no live university integration exists.'],
'METRIC-001':['deferred by scope',NOTYET],'METRIC-002':['existing','Logs carry codes and timings only; feedback stores no identity in the queue; '+CODE],
'METRIC-003':['released','Staff totals paused, so no comparable counts exist.','Agreed reporting design'],'METRIC-004':['deferred by scope',NOTYET],
'METRIC-005':['existing','Paused panel says paused, not 0%.'],'METRIC-006':['deferred by scope','No export exists yet.'],'METRIC-007':['deferred by scope',NOTYET],'METRIC-008':['existing',CODE],
'FILES-001':['released','Files.'],'FILES-002':['deferred by scope',NOTYET],'FILES-003':['released','Consent v3.'],'FILES-004':['released','Bounded streaming, token-count reservation (Ina e1b10eb).'],
'FILES-005':['released','Newest 3 / 24k with notes.'],'FILES-006':['existing',CODE],'FILES-007':['released','Durable cleanup; active accounts kept.'],'FILES-008':['released','Privacy wording approved by Ina.'],
'VOICE-001':['deferred by scope',NOTYET],'VOICE-002':['in progress','French and Arabic UI translations; 8 of 10 languages missing.','Translations'],'VOICE-003':['released','Reply follows the user’s language.'],
'VOICE-004':['existing','Arabic RTL; swipe RTL-aware; '+CODE],'VOICE-005':['existing','Dictation never sends; '+CODE],'VOICE-006':['released','Natural voice with fallback and Stop.'],'VOICE-007':['existing',CODE],'VOICE-008':['existing',CODE],
'NOTIFY-001':['pilot verified','Founder saw the bell red dot and the test alert on the pilot (22 Oct).'],'NOTIFY-002':['existing',CODE],'NOTIFY-003':['existing',CODE],
'NOTIFY-004':['pilot verified','Pilot scheduler guarded to its own DB; counters; founder alert received.'],'NOTIFY-005':['existing',CODE],'NOTIFY-006':['existing','Production push remains off.','Privacy approval + real-device check'],
'BUSINESS-001':['existing',CODE],'BUSINESS-002':['deferred by scope',NOTYET],'BUSINESS-003':['deferred by scope',NOTYET],'BUSINESS-004':['blocked external','No payment provider approved.','Provider/account'],
'BUSINESS-005':['in progress','Caps: OpenAI $5/day $20/month; voice $1/$5; search 10/100; email 10/100. No actual-cost report yet.','Cost report'],
'BUSINESS-006':['locally verified','No limit or plan changed tonight (config unchanged).'],
'LEGAL-001':['blocked external','Full Privacy/Terms need operator details.','Operator details'],'LEGAL-002':['blocked external','No public operator contact supplied; none invented.','Founder supplies operator details'],
'LEGAL-003':['existing','Versioned document consent; '+CODE],'LEGAL-004':['deferred by scope',NOTYET],'LEGAL-005':['existing',CODE],'LEGAL-006':['existing','Demo organisations labelled Demo; '+CODE],
'SEC-001':['existing','Session, account header and tenant checks; new feedback routes behind the session check (test).'],'SEC-002':['locally verified','Secret-pattern scan clean; secrets stay in Worker settings (deploy script never reads them).'],
'SEC-003':['existing',CODE],'SEC-004':['existing','UI builds text nodes; feedback inputs validated server-side; '+CODE],'SEC-005':['locally verified','Feedback reports idempotent by request id (test).'],
'SEC-006':['deferred by scope',NOTYET],'SEC-007':['deferred by scope','Not reviewed tonight.'],'SEC-008':['deferred by scope',NOTYET],'SEC-009':['deferred by scope',NOTYET],
'SEC-010':['existing','Switches FILES_ENABLED, DOCUMENTS_ENABLED, VOICE_ENABLED, OPENAI_PILOT; '+CODE],
'APP-001':['existing','Install button and manifest; '+CODE],'APP-002':['deferred by scope',NOTYET],'APP-003':['deferred by scope',NOTYET],'APP-004':['deferred by scope',NOTYET],
'APP-005':['blocked external','Apple membership, identity/entity, signing.','Authorised account holder'],'APP-006':['released','In-app account deletion.'],
'APP-007':['blocked external','Physical devices required.','Real-device tests'],'APP-008':['locally verified','No enrolment, payment or submission made.'],
'QA-001':['locally verified','87/87 CI commands pass at the candidate.'],'QA-002':['locally verified','One candidate deployed to the isolated pilot; frozen for review.'],
'QA-003':['in progress','Awaiting Ina.','Ina review'],'QA-004':['in progress','After Ina’s review.','Founder acceptance'],'QA-005':['locally verified','Two regressions found tonight fixed at source with tests (Library write rule, favourite merge).'],
'QA-006':['locally verified','Production not touched.'],'QA-007':['locally verified','docs/evidence/pilot-candidate-2026-10-22.json + this ledger.'],'QA-008':['locally verified','Readiness list states what is left.'],
};
const NEW=new Set(['UX-003','UX-004','CHAT-007','CHAT-008','LIB-001','LIB-002','LIB-003','LIB-004','LIB-006','CAL-001','OWNER-009','SEC-005']);
const out=[],missing=[];
for(const r of spec.requirements){const k=r.id.replace(/^ORI-/,''),v=S[k];if(!v){missing.push(r.id);continue}
 if(!VOCAB.includes(v[0]))throw Error(r.id+' bad status '+v[0]);
 const env=v[0]==='released'?PROD:v[0]==='pilot verified'?'pilot (founder device check)':NEW.has(k)?PIL:v[0]==='existing'?'source':v[0]==='locally verified'?'local + pilot '+pilot:'—';
 out.push({id:r.id,title:r.title,priority:r.priority,owner:v[0]==='blocked external'?'external':'Cleo',status:v[0],testedSha:['locally verified','in progress'].includes(v[0])||NEW.has(k)?sha:v[0]==='released'?'a846926 (released b9e32ffc)':null,environment:env,evidence:v[1],dependency:v[2]||null})}
if(missing.length)throw Error('no status for '+missing.join(', '));
const extra=Object.keys(S).filter(k=>!spec.requirements.some(r=>r.id==='ORI-'+k));if(extra.length)throw Error('unknown ids '+extra);
const counts={};for(const x of out)counts[x.status]=(counts[x.status]||0)+1;
const p0={};for(const x of out.filter(x=>x.priority==='P0'))p0[x.status]=(p0[x.status]||0)+1;
fs.mkdirSync('docs/evidence',{recursive:true});
fs.writeFileSync('docs/evidence/requirements-ledger-2026-10-22.json',JSON.stringify({specVersion:spec.specVersion,candidateSha:sha,pilotVersion:pilot,productionVersion:'b9e32ffc',counts,p0Counts:p0,requirements:out},null,1)+'\n');
console.log(JSON.stringify({total:out.length,counts,p0}));
