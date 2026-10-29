# Restored block one — 25 October 2026

This branch reconstructs the missing newer implementation on top of the recoverable GitHub checkpoint `f6e7fc33a536cbdde0e3e869ca97d388e27ce02a`. The lost local commit objects were unavailable; this is a freshly tested reconstruction, not a claim to have recovered their original hashes.

## Included

- Server-owned profile allowlist and family privacy guidance; selected published institutional contact details remain labelled institutional evidence.
- Named, expiring partner invitations, setup submissions, founder review and one-use approval creating a university address and its first admin. Optional welcome defaults are validated.
- Source registry, custom university packages and operational records with optimistic revisions, history and restoration as a new draft. Public URLs and explicitly supplied institutional PDF/image transcripts can produce evidence-bound guide drafts for staff review. Nothing is auto-published.
- Nonbilling account allowances for Free/Plus/Premium, atomic message/file admission, assignment expiry and preservation of existing files on downgrade. Activation defaults off; initial tier limits preserve legacy access. Existing provider, spending and abuse limits still apply.
- University support tickets and replies, separate explicit permission to forward ticket text to platform support, restricted owner/support inbox, and withdrawal even after leaving the university. Personal conversations and files are never attached.
- Account-scoped data requests and owner replies; fresh owner role management with atomic last-owner protection; ordered university process templates without fabricated application tracking.
- Defined aggregate charts and approved, audience/date-gated in-app notices. These notices do not send email or device push.
- Honest email-code delivery outcomes, including concurrency, expired codes and one-use checks against the actual Better Auth library.
- Checked-answer NDJSON frames, strict bounded UTF-8 client consumption, account guards and cancellation. Confirmed unsent provider work settles at zero; dispatched uncertain work retains its reservation.
- Optional device-only response diagnostics, off by default, account isolated, at most 100 samples/7 days, no messages or identity in exports, and p95 only for groups with at least 20 successful foreground samples. Timings do not prove paint or model performance.
- Device photo review with rotate, centred square crop, reset, retake, cancel and explicit use; bitmap/dialog cleanup and account guards.
- Complete allowed replies up to 16,000 characters in saved chats, explicit feedback and shares; oversize selections are refused, not silently shortened. Explicit-name query redaction covers ten languages and preserves combining marks.
- Restored form values, navigation wrapping and a final institutional permission/revision/expiry check before device-alert delivery.

## Verification

Run `node tools/run-ci-local.mjs /tmp/orivia-ci.json` after installing the pinned account dependencies. The workflow includes the new restored operations, safety and delivery regression suites. Backend tests use real Better Auth sessions and SQLite through a D1-compatible adapter; provider delivery/AI/push transports use fictional local fixtures.

The local Chromium check is `node tools/browser-checks/restored-block-one.mjs`. Set `ORIVIA_CHROMIUM` to an available executable and, if required, `ORIVIA_PLAYWRIGHT_PACKAGE` to the package.json used to resolve Playwright. It exercises the actual guest Settings/photo UI and all served management areas using fictional API answers; it does not represent live acceptance.

The pinned pilot Wrangler dry-run build succeeds. No Worker was deployed and no remote database, production flag, billing or App Store setting was changed.

## Next blocks

Journey governance; full founder AI/sponsorship workflows; live acceptance. Translation expansion, billing and App Store work remain deferred. This branch supplies record/workflow foundations without declaring those later blocks complete.
