# Journey governance — block two

The founder dashboard now manages the complete editorial lifecycle. Choose **Journey governance** in the management workbench.

Create a Journey using structured fields for goal, scope, jurisdiction, applicability, preparation and steps. Each step records actions, dependencies, who acts next, completion criteria, evidence references and an explicitly unknown cost/timing when it is not established. Only earlier steps can be dependencies. Step IDs remain stable; removing or changing completion criteria must not silently transfer old completion.

Select reviewed entries from the existing Source registry. Source references pin exact registry revisions and categories: official authority, institution/organisation or everyday-life context. Official authority labels require a matching government/health-authority jurisdiction; institutional sources cannot acquire government authority through a visual label. Source URLs must be public HTTPS references without credentials or sensitive query parameters.

## Draft, review and publication

- Saving an edit creates an immutable numbered draft and content hash. The current publication stays unchanged.
- Human review requires a fresh owner session, an explicit confirmation, a public reviewer label, source-check dates, next-review date and evidence for every step. Approval is bound to the saved content hash and source revisions. It does not claim that Orivia fetched sources live.
- Publication is a second confirmed action against the draft and publication revisions. Source references are checked again in the same atomic update. A stale tab cannot overwrite a newer publication or withdrawal.
- Withdrawal stops the app detail/catalogue routes and the assistant from using that Journey. The bundled guide cannot silently return as a fallback. Unavailable registry storage fails closed.
- Restoration copies an older revision into a new unapproved draft. It neither restores an old approval nor changes the current publication. History records creation, edits, reviews, publications, restoration and withdrawal.
- Source withdrawal also makes affected publications unavailable. Restoring the source as a draft cannot resurrect them. An approved newer source revision or an overdue review makes affected templates stale and excludes them from AI use until reviewed again.

The public guide API and AI use the same publication pointer, hash and source bindings. The assistant has a read-only `read_journey` tool for current, fresh reviewed versions; Journey evidence has its own category and cannot support an `official_rule` claim. It is re-read rather than retained as trusted client memory. A publication change during generation suppresses the old reply. Reading a plan can produce an offer card; nothing is opened or saved automatically, and declined offers remain suppressed.

## Personal plans

Opening a saved plan refreshes the publication check. New instructions remain a proposed diff until the person accepts them. Dependencies, ownership, source categories and version metadata survive snapshots. A material change to an existing step's actions/completion criteria resets that step's current completion on acceptance while keeping its previous progress in version history. Removed progress remains historical and never completes new steps. Reminders are not edited.

Withdrawn or temporarily unavailable guides can still be read as the person's historical saved copy, with a clear warning. Their notes, completion and separately labelled family plans are not deleted. Old responses and controls cannot redraw a different account or a newer guide screen.

## Coverage

All ten catalogue families remain research starting points. Users may explicitly request coverage by topic reference and jurisdiction; no private conversation text is submitted. Repeated requests from one account are idempotent. The owner sees aggregate request counts, can record research/unconfirmed responses and can mark a topic covered only by a matching fresh, published reviewed guide. A withdrawn or stale guide no longer counts as live coverage. This workflow does not claim that every topic has researched instructions.

## Routes

| Route | Access and purpose |
| --- | --- |
| `GET /v1/guides` and `GET /v1/guides/:id` | Published catalogue/detail for the app; withdrawals return 410. |
| `GET/POST /api/admin/journeys` | Owner catalogue and new draft. |
| `GET /api/admin/journeys/:id` | Owner working draft, current publication, revisions and events. |
| `GET /api/admin/journeys/:id/revisions/:revision` | Owner inspection of a historical revision. |
| `POST /api/admin/journeys/:id/import` | Import a bundled legacy guide as an unapproved draft. |
| `POST /api/admin/journeys/:id/draft`, `/review`, `/publish`, `/withdraw`, `/restore` | Separate confirmed editorial actions. Mutations require a fresh owner session and account header. |
| `GET/POST /api/me/journey-gaps` | Verified account's own topic requests. |
| `GET /api/admin/journeys/coverage` | Owner aggregate queue and catalogue coverage. |
| `PATCH /api/admin/journeys/coverage/:id` | Confirmed, revision-checked owner response. |

Schema creation is idempotent in `ACCOUNTS_DB`; it does not touch the provider spending database. Published versions are loaded per request, without a global mutable content cache. Catalogue reads batch published revisions and source status instead of issuing a query per template/source.

## Verification and deployment boundary

`tests/journey-governance.test.mjs` uses actual Better Auth sessions and SQLite transactions. It covers permission/refusal cases, hash/source review binding, separate publication, stale writes, restore-as-draft, app/AI version agreement, withdrawal during a turn, source withdrawal/restoration, legacy suppression, coverage privacy and all ten families in both jurisdictions.

`tools/browser-checks/journey-governance.mjs` clicks the served management UI against the real local Worker routes and a fictional authenticated owner. It creates, reviews, publishes, edits, restores and withdraws a Journey, then checks that an existing personal snapshot retains completion with the withdrawal warning. It also checks a 390px layout and browser errors. External AI, email and deployment are not used.

This block is source work for the GitHub pilot branch. The pilot dry-run build and local regression checks are recorded separately. No live Worker, remote database, production setting, billing or App Store configuration was changed. Founder AI/sponsorship workflows and live acceptance remain the next blocks; translations remain deferred.
