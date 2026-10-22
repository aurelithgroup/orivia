/* Writes the machine-readable pilot candidate receipt from real run outputs: a CI run file (from the local runner),
   the requirements ledger and the browser-check evidence files. It cannot prove facts; it only assembles them.
   Usage: node tools/make-candidate-receipt.mjs <ci-run.json> <workerVersion> <bundleSha256> <out.json> */
import fs from 'node:fs';
const [ciFile,workerVersion,bundleSha256,out]=process.argv.slice(2);if(!out)throw Error('usage');
const ci=JSON.parse(fs.readFileSync(ciFile,'utf8')),ledger=JSON.parse(fs.readFileSync('docs/evidence/requirements-ledger-2026-10-22.json','utf8'));
if(ci.failed||ci.dirty)throw Error('refusing: the CI run failed or ran on a dirty tree');
const by=s=>ledger.requirements.filter(r=>r.status===s).map(r=>r.id);
const ev=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const lib=ev('docs/evidence/library-discoveries-browser-2026-10-22.json'),listen=ev('docs/evidence/listen-startup-browser-2026-10-22.json');
const receipt={
 state:'PILOT_READY',sourceSha:ci.sha,branch:'myorivia-release-plan',
 workerVersion,workerScript:'orivia-research-pilot',bundleSha256,
 environment:'isolated pilot (Cloudflare Access; accounts DB orivia-accounts-pilot-test 8cd85061; R2 orivia-files-pilot; budget DB bd521420 shared with production)',
 migrationIds:['none new in this candidate; feedback.sql was applied to pilot DB 8cd85061 for the previous candidate (22 Oct 16:43 UTC)'],
 productionChanged:false,productionVersion:'b9e32ffc-e13d-4c5b-85cf-d7cbdf4a3f94 (unchanged, checked after deploy)',
 inaFindings:{source:'ina/candidate-review-2026-10-22 a4e6dcf',fixedIn:['1c94765','6588847'],
  items:{'1 no silent cap':'fixed: all items, 30 per page; tests/library-discoveries.test.mjs runs the module on 105 items',
   '2 removal mutates messages':'fixed: one account-scoped Library record, Restore, read-only migration, save-failure undo; browser: 0 messages changed, persists across reload',
   '3 feedback disclosures':'fixed: account-linked, team can read note and included reply, review list omits name and email; Privacy/retention text still needed before production',
   '4 ambiguous failure':'fixed: only 4xx says nothing was saved; lost response says it could not confirm; retry reuses request id (server and client tests)',
   '5 shortlist coverage':'fixed: Shortlisted label kept across newer duplicate mentions (tested)'}},
 newInThisCandidate:['Founder overview with defined counts and authoritative budgets or Unavailable (c5a01b2)','University Needs attention queue with workflow links (52a109e)','Admin Members tab crash fix from step 9 (52a109e)','Listen startup: preparing message, short first piece, no duplicate generation, timing (8af0b96)'],
 requirements:{counts:ledger.counts,p0Counts:ledger.p0Counts,verifiedIds:[...by('locally verified'),...by('pilot verified')],unverifiedIds:[...by('in progress'),...by('implemented unverified'),...by('existing'),...by('deferred by scope')],blockedExternalIds:by('blocked external'),releasedIds:by('released'),ledger:'docs/evidence/requirements-ledger-2026-10-22.json'},
 tests:[...ci.results.map(r=>({name:r.command,status:r.status,evidence:r.last})),
  {name:'Headless Chrome: Ina Library repro (105 items, remove, reload, restore)',status:'pass',evidence:'docs/evidence/library-discoveries-browser-2026-10-22.json'},
  {name:'Headless Chrome: owner console with fixture API (counts, budgets incl. Unavailable, search, 390px and 1280px, no overflow)',status:'pass',evidence:'tools/browser-checks/jobs-owner.json; docs/evidence/screens/owner-overview-*.png'},
  {name:'Headless Chrome: university overview (queue rows, draft opens focused in Guides, Review requests opens Members, empty state, 390px)',status:'pass',evidence:'tools/browser-checks/jobs-university.json; docs/evidence/screens/university-overview-*.png'},
  {name:'Headless Chrome: Listen with simulated 600 ms voice (preparing, Stop, reuse, no duplicate requests)',status:'pass',evidence:'docs/evidence/listen-startup-browser-2026-10-22.json'},
  {name:'Pilot read-only SQL with the overview queries',status:'pass',evidence:'1 organisation, 1 active student, 1 active staff, 0 requests, 4 published, 0 drafts, 0 open feedback, 1 owner; OpenAI meter 2026-10 $5.345, today $1.1852; voice today $0.1206'},
  {name:'Live pilot behind Cloudflare Access',status:'pass',evidence:'GET /api/admin/overview unauthenticated → 302 to Access sign-in'},
  {name:'Authenticated owner/student permission check on the deployed pilot',status:'unverified',evidence:'Cleo cannot pass Access; covered by real-session SQLite tests (owner-overview, university-overview) and Ina’s review'},
  {name:'Real OpenAI Listen latency and physical devices',status:'unverified',evidence:'Not measured: needs signed-in pilot traffic and a phone'}],
 testRun:{ranAt:ci.ranAt,sha:ci.sha,cleanTree:!ci.dirty,total:ci.total,failed:ci.failed},
 latency:{sampleCount:listen.results?.['listen-check']?.timings1?.length||0,runs:[listen.results?.['listen-check']?.timings1,listen.results?.['listen-check']?.timings2,listen.results?.['listen-uncached']?.retapTiming].flat().filter(Boolean),
  limitations:['Listen timings come from the local harness with a simulated 600 ms voice server: they show the client path and reuse, not OpenAI generation time.','No chat reply latency samples: the pilot is behind Access and the founder is not asked to test.']},
 externalBlockers:['University SSO, student records, visa/government status (partner access)','Public operator/contact details for Privacy and Terms','Payment provider','Apple/Android accounts, signing and review','Physical-device checks (touch swipe, installed app, push, audio startup)','Production push stays off until Privacy approval and a device check'],
 findings:['Production defect: on myorivia.app (b9e32ffc) the admin Members tab throws ("constreq is not defined") since step 9; fixed in this candidate, not released.','Older public pages/config link to *.habeebahsallah27.workers.dev (founder username).','The budget database is shared by pilot and production, so the owner overview’s OpenAI and voice figures are combined.'],
 privacyNoticeVersions:['orivia-document-consent-v3-2026-10-22 (unchanged)','Feedback: in-form disclosure updated (no consent version; Privacy/retention text pending Ina)'],
 settingsParityChecked:false,settingsParityNote:'Not applicable until a production promotion is requested.',
 rollback:{codeVersion:'7f0de223-beaa-4179-af06-92f43d6df9e4 (previous candidate) or d673b88f-ce1c-4bce-8d8f-043079e92d0f (before tonight)',databasePlan:'No schema change in this candidate. Library state lives inside the synced chats record (store.library); older code ignores it.'},
 inaReview:'pending',founderProductionDecision:'pending'};
fs.writeFileSync(out,JSON.stringify(receipt,null,1)+'\n');console.log('verified',receipt.requirements.verifiedIds.length,'tests',receipt.tests.length,'sha',ci.sha.slice(0,7));
