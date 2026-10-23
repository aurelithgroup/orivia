# Orivia master build specification

Version 1 · 22 October 2026 · Founder authorised comprehensive pilot build · Cleo implements and deploys the pilot · Ina independently reviews · Founder approves any production release

This is the single implementation brief for finishing a coherent Orivia v1. It consolidates the founder’s uploaded ideas, the latest instructions, existing decisions and current engineering findings. It is deliberately detailed so that the founder does not have to manage individual buttons, repeat the same requirements or test every intermediate component.

The desired outcome is a capable, polished relocation assistant for the UAE and the UK, with a private personal app, a serious institutional service, and a useful founder management console. The free core must actually help newcomers. Institutional revenue pays for connected guidance and operations; it never buys private conversations.

The deadline target is 22:30 Asia/Dubai on 22 October. This document authorises sustained implementation and pilot work within existing resources, not invented integrations, purchases or a false promise that software and store approval can be completed in a fixed number of hours. The actual remaining blockers must be named. A working PWA, a signed native build, an app submitted to a store and an app accepted by a store are separate milestones.

## Read this first Cleo execution instruction

Read this specification in full, then inspect the latest repository, source of truth documents and current configuration. Continue the existing app. Build against one integration branch with isolated worktrees as needed; do not overwrite Ina’s or your own newer work with stale embedded files. Work through the requirements in dependency order, keeping a requirement ledger. All P0 items are release gates. P1 items are required product capability; dependency-blocked work remains clearly blocked, not silently dropped.

Do not stop at a design, scaffold or placeholder when the requested behaviour can be implemented with the existing system. Finish the data model, server authorisation, real UI action, error state, tests and deployed pilot behaviour together. Conversely, do not fabricate records, analytics, external access, provider success, completed legal details or store readiness just to make a screen look finished.

Run your own checks before each pilot candidate. Deploy only to the isolated pilot, record exact source/Worker/schema versions and give Ina one PILOT READY report when a coherent candidate is ready. Ina reviews the deployed candidate, reports findings and rechecks fixes. The founder sees one final acceptance package after that. Production stays unchanged until her explicit final decision. Do not ask her to test intermediate screens or approve ordinary implementation details already defined here.

Use available approved tools and credentials. Never paste secrets in chat or logs. Keep existing spending, search, email and voice limits. If a necessary external input is absent, finish everything independent of it and record one concise blocker with the exact missing input; do not repeatedly interrupt the founder or assume permission to buy it.

## Current starting point

Latest GitHub release branch inspected: a846926, which records Chat refresh production version b9e32ffc. This is a source/deployment-record observation, not an independent recheck of every live feature. Existing design and privacy work has moved since the founder’s earlier checklist: the six design improvements are integrated, the Chat refresh is integrated, Files/Files-to-Chat have been released according to Cleo’s records, and exact staff progress totals have been paused with private student Done marks. Reconfirm these before editing. Do not re-merge 6e246f5 or 2f878b2 wholesale over the newer integrated source.

Prior engineering records remain relevant: e1b10eb for Files fixes, 1374ec9 for Step 9 privacy, and the corresponding docs in the repository. The exact-total inference risk must stay fixed. The earlier source-only/fixture evidence does not substitute for checking the combined pilot candidate.

## Decisions already made so no further founder questions are needed

- The product serves UAE and UK newcomers, students and families, across ten intended languages.
- Personal navigation is Home, Chat, Library, My Life and Calendar; organisational and owner spaces use the same product shell.
- Use navy, Orivia amber, soft neutral surfaces and restrained typography. Brand links use contrast-safe amber variants rather than unrelated blue.
- Calendar week swipes are added without removing arrow or keyboard access.
- Journeys become contextual plans, offered through Chat for acceptance, backed by reviewed templates and evidence-grounded drafts.
- Useful recommended entities are privately collected in Library as Saved from chat; deliberate favourites remain distinguishable.
- Multi-account switching is a genuine requested feature, implemented through supported secure sessions rather than localStorage tokens.
- Private chats/files remain private even from a university and the owner dashboard by default. Owner power means real product control with audited boundaries.
- Device permissions are just in time. Notifications may be offered after setup; the actual browser request follows an explicit action.
- Existing limits do not rise automatically. Free essential newcomer help stays useful.
- No founder name, personal email or invented operator details are published.
- No production promotion occurs until independent review and the founder’s final decision.

## Priority and evidence rules

P0 means required before a candidate can be presented as safe and release-ready. P1 means required functionality in the v1 product backlog; it cannot be omitted without being listed. External dependencies do not become complete through a disabled decorative button. Disabled unavailable integrations can be valid product states, but the underlying promised integration remains dependency-blocked. The ledger begins unverified and must be populated honestly by Cleo; nothing below is marked implemented solely because it appears here.

## Source research translated into product needs

The attached document includes identifiable interviews and children’s experiences. Do not copy those identities into public code, fixtures or marketing. The product requirements abstract their needs: a clear sequence, early checks for missing paperwork, transparent ownership/status, affordable travel and local options, and support with settling and belonging. Anecdotal costs, delays and fines are research context, not official requirements to repeat to users.

## Requirement index

- GOV — Execution and completion rules — 10 requirements
- UX — Brand and connected experience — 10 requirements
- HOME — Personal home and My Life — 10 requirements
- CHAT — Conversation and message actions — 15 requirements
- AI — Research quality and source intelligence — 12 requirements
- PERF — Speed streaming and Listen latency — 10 requirements
- JOURNEY — Journeys as contextual plans — 10 requirements
- LIB — Library and automatic saved discoveries — 10 requirements
- CAL — Calendar maps and permissions — 10 requirements
- AUTH — Accounts and switching identities — 10 requirements
- OWNER — Founder management console — 15 requirements
- UNI — University staff platform — 15 requirements
- STUDENT — Institution-linked student experience — 8 requirements
- CONNECT — Institution connections and authoritative records — 6 requirements
- METRIC — Analytics without surveillance — 8 requirements
- FILES — Files camera and document Chat — 8 requirements
- VOICE — Languages dictation and accessibility — 8 requirements
- NOTIFY — Notifications and reminders — 6 requirements
- BUSINESS — Partners premium sponsorship and money — 6 requirements
- LEGAL — Privacy Terms and trust surfaces — 6 requirements
- SEC — Security reliability and data integrity — 10 requirements
- APP — Installed app and store readiness — 8 requirements
- QA — Acceptance and release gates — 8 requirements

## Architecture and shared data contracts

Retain the existing Cloudflare-based architecture and Better Auth account system unless a measured requirement justifies an explicit change. Reuse the existing D1/R2/provider wrappers, budget ledger, source validators and account boundaries. Additive database changes need versioned migrations, constraints, indexes, restore points and tests on existing data. Avoid one large shared file becoming the only source of truth; keep generated embedded UI reproducible with the existing build tool.

Suggested records must be adapted to existing equivalents rather than blindly duplicated:

| Record | Key fields and boundaries |
|---|---|
| Account and device session | Server user identity, verification, session scope/expiry/revocation; remember accounts only through authorised sessions |
| Membership and role | User, organisation, role, status, revision, created/updated time; server authority on every request |
| Conversation and version | Account/guest owner, stable chat/turn IDs, branch parent, selected version, manual-title flag, sources and permitted attachments |
| Plan template | Jurisdiction, applicability, version, reviewer, sources, review date, steps/dependencies and publication state |
| Personal plan instance | Owner, template/draft origin, selected version, criteria, steps, progress source, reminders and change history |
| Saved discovery | Owner, normalised entity/source identity, verified facts, origin chat/turn, checked date, favourite state and access scope |
| File and transcript | Owner, private object reference, type/size, chat binding, extraction version/partial flag, context limits and consent record |
| Institution content | Organisation/campus, typed details, responsible team, source, revision, approval, expiry, audience and publication state |
| Authoritative status event | Institution/external subject mapping, source system/status, source/received timestamps, event ID and deduplication |
| Feedback and support | Reporter/context scope, category, selected attachments/consent, assignee, state and retention |
| Analytics event and aggregate | Approved event name, minimal metadata, purpose, time bucket, cohort/suppression rules and permitted viewers |
| Notification | Recipient account, category, related authorised record, generic push payload, schedule, idempotency and delivery state |
| Audit and release record | Actor, action, target, request ID, environment, reason, versions and result; no secret/prompt content |

Use optimistic concurrency for editable staff records and conflicting personal snapshots. Every mutation returns the actual resulting state/version and a stable error code; the client must not announce success before durable confirmation. Use idempotency where duplicate submission could create a saved effect. Version side-effect proposals separately from regenerated prose.

API shapes should follow the current route conventions. Do not expose a new endpoint until its actor, tenant, input bounds, audit, idempotency, error states and tests are defined. Multi-session must be reviewed against the installed Better Auth version; its official plugin exists, but its raw client API includes session tokens, so do not casually render or persist those in the app. A server-mediated device-session handle is preferable when practical, and any token handling must be explicitly threat-modelled.

## GOV Execution and completion rules

### ORI-GOV-001 Continue the existing product

**Priority:** P0. **Initial status:** unverified.

Start from the latest myorivia-release-plan and current deployment record. Inventory existing modules, migrations and tests before editing. Preserve working features; do not restart the app or create a second product.

**Acceptance:** Record exact starting SHA, pilot/production versions, database bindings by identifier and pending branches.

### ORI-GOV-002 Use the current integrated baseline

**Priority:** P0. **Initial status:** unverified.

At preparation time GitHub head is a846926, recording the integrated Chat refresh. Cleo has already integrated the six design fixes and paused staff progress totals. Verify the current head rather than replaying old commits.

**Acceptance:** No duplicate design merge, stale embedded bundle, or re-enabled progress total slips into the candidate.

### ORI-GOV-003 One integrator and independent reviewer

**Priority:** P0. **Initial status:** unverified.

Cleo integrates and deploys only to the isolated pilot during this work. Ina reviews source and the deployed candidate. Founder gets one final acceptance presentation before any production promotion.

**Acceptance:** Candidate records separate Cleo test result, Ina review result and founder production decision.

### ORI-GOV-004 No routine founder questions

**Priority:** P0. **Initial status:** unverified.

Choose conservative reversible defaults described here. Continue independent tasks when an integration is blocked. Ask only for genuinely unavailable credentials, a new payment or a consequential decision that cannot be inferred.

**Acceptance:** No repeated requests for founder to check an unfinished screen or choose ordinary spacing and copy.

### ORI-GOV-005 Do not claim universal completion

**Priority:** P0. **Initial status:** unverified.

This is a bounded comprehensive v1 specification and extensible architecture, not a promise that every future human need can be predicted. Each requirement has a status and evidence. External dependencies remain explicitly blocked.

**Acceptance:** No placeholder, mock metric, simulated university record or unsubmitted store package is counted as complete.

### ORI-GOV-006 Protect existing data

**Priority:** P0. **Initial status:** unverified.

Migrations are additive and versioned with backups/restore instructions. Preserve chats, manual titles, saved guides, calendar events, files, memberships and preferences across upgrades.

**Acceptance:** Run migration, failed-write, interrupted-upgrade and rollback checks using synthetic copies.

### ORI-GOV-007 Enforce the deadline honestly

**Priority:** P0. **Initial status:** unverified.

Founder target is 22 October 2026 at 22:30 Asia/Dubai. Work toward a coherent tested pilot candidate; never trade privacy, data integrity or truthful status for a deadline.

**Acceptance:** At cut-off supply completed scope, evidence and a concise external/blocker list; do not pretend the store fee is necessarily the only item left.

### ORI-GOV-008 Hold production

**Priority:** P0. **Initial status:** unverified.

No production deploy, budget increase, new provider, mass email, university contact, purchase, public share or store submission is authorised by this specification alone.

**Acceptance:** Pilot changes and release report are reviewable before the founder approves promotion.

### ORI-GOV-009 Use status vocabulary consistently

**Priority:** P0. **Initial status:** unverified.

Use existing, in progress, implemented unverified, locally verified, pilot verified, blocked external, deferred by scope and released. Complete means the specified acceptance passes, not that a button is drawn.

**Acceptance:** Every requirement carries owner, status, tested SHA, environment, evidence and any remaining dependency.

### ORI-GOV-010 Release evidence is operational data

**Priority:** P0. **Initial status:** unverified.

Do not upload personal interview text, secrets, real student documents or private chat content into public GitHub evidence. Use synthetic accounts, fictional Northbay and sanitized results.

**Acceptance:** A repository scan and review find no uploaded founder contacts, credentials or participant-identifying research notes.

## UX Brand and connected experience

### ORI-UX-001 One product shell

**Priority:** P0. **Initial status:** unverified.

Use shared navigation, typography, spacing, account controls and institution context across personal app, student space, staff platform and founder management. Every destination is reachable through UI, without typing a URL.

**Acceptance:** Guest, student, editor, admin and owner reach only their permitted spaces through menus and Back.

### ORI-UX-002 Professional visual hierarchy

**Priority:** P1. **Initial status:** unverified.

Aim for the polish of a serious institutional platform: generous margins, clear tables, useful summaries, restrained navy surfaces, amber accents and precise empty states. Do not imitate a university crest or imply a partnership.

**Acceptance:** Desktop overview and detail pages, 390px phone, 768px tablet and wide desktop use coherent hierarchy without overflow.

### ORI-UX-003 Semantic colour system

**Priority:** P0. **Initial status:** unverified.

Use Orivia amber for primary accents and selected navigation. On light surfaces use a darker accessible amber for link text; on dark surfaces use lighter amber. Keep error/delete red and success green. Do not simply make every link bright yellow.

**Acceptance:** Check contrast, hover, focus, disabled and selected states in light/dark. Link identity is also conveyed by underline, icon or context.

### ORI-UX-004 Replace unrelated blue links

**Priority:** P1. **Initial status:** unverified.

Internal account, space, join/manage, help and settings links use brand-semantic tokens rather than browser default blue. Content-source classifications remain distinct.

**Acceptance:** Audit all personal/student/staff/owner screens and auth notices; no accidental browser-blue navigation remains.

### ORI-UX-005 Typography and density

**Priority:** P1. **Initial status:** unverified.

Use clean body text, consistent type scale and restrained serif display headings where approved. Staff tables support comfortable and compact density with readable minimum sizes.

**Acceptance:** Long university names, Arabic, 200 percent zoom and large text do not clip key actions.

### ORI-UX-006 Navigation by purpose

**Priority:** P1. **Initial status:** unverified.

Personal tabs are Home, Chat, Library, My Life and Calendar. Guidance lives inside Library and contextual Home/Chat offers. Staff and owner get their own serious navigation inside the same shell.

**Acceptance:** Switching space preserves active identity and makes personal versus organisation context visible.

### ORI-UX-007 States are designed features

**Priority:** P0. **Initial status:** unverified.

Every page supports loading, empty, success, permission refused, partial data, stale data, offline, error and retry states. Loading indicators describe real work.

**Acceptance:** A failed fetch does not leave a blank card, frozen spinner or plausible-looking fake number.

### ORI-UX-008 Destructive actions

**Priority:** P1. **Initial status:** unverified.

Delete and destructive confirmations are red, specific and scoped. Preserve existing confirmation/Undo semantics. Do not let a global delete mean different things on different pages.

**Acceptance:** Deleting a Library file, chat, reminder, membership and account each explains its own consequences.

### ORI-UX-009 Consistent interaction polish

**Priority:** P1. **Initial status:** unverified.

Use controlled motion, visible pressed/focus states, predictable menus, generous touch targets and reduced-motion support. Close buttons are easy to see and named.

**Acceptance:** Keyboard-only use, pointer use and touch simulation can complete each core flow.

### ORI-UX-010 Performance is visual too

**Priority:** P1. **Initial status:** unverified.

Reserve space for images/cards, avoid layout shifts, and render the shell promptly. Do not block a whole screen behind one optional widget.

**Acceptance:** Slow images, missing voices or failed analytics do not prevent chat, navigation or safe fallback.

## HOME Personal home and My Life

### ORI-HOME-001 Useful personal Home

**Priority:** P0. **Initial status:** unverified.

Show greeting, destination-country image, ask box, nearest upcoming dates, active plans, recent chats and institution spaces. Prefer relevance to a wall of tiles.

**Acceptance:** Home question starts a new conversation and sends once; existing chat and unsent drafts remain intact.

### ORI-HOME-002 Country imagery is honest

**Priority:** P1. **Initial status:** unverified.

Decorative photo caption names the country, not an assumed city. Image is bundled or privacy-safe; no geolocation is inferred from its presence.

**Acceptance:** Sharjah profile is not captioned Dubai; no destination has a readable non-image fallback.

### ORI-HOME-003 Personal profile fields

**Priority:** P0. **Initial status:** unverified.

Preferred name, origin country/city, current place, destination country/emirate or UK nation/town, move reason, institution free text and language remain editable and clearable.

**Acceptance:** Origin never silently becomes nationality, immigration status or current residence.

### ORI-HOME-004 Institution recognition

**Priority:** P1. **Initial status:** unverified.

An entered institution is unverified until a matched official identity/campus is confirmed. Show alternatives and source; do not silently attach a similarly named school.

**Acceptance:** Ambiguous names require selection and a mismatch can be corrected without changing personal origin.

### ORI-HOME-005 Profile sharing control

**Priority:** P0. **Initial status:** unverified.

Explain which saved profile details reach each AI route and honour the actual consent. Device-only fields must not leak through planning, search, voice, documents or retries.

**Acceptance:** Synthetic hidden city/name tests confirm provider payload boundaries.

### ORI-HOME-006 Organisation onboarding

**Priority:** P1. **Initial status:** unverified.

Join links open the correct branded welcome before authentication. Destination/reason may be prefilled and locked as institutional context; personal corrections remain separate.

**Acceptance:** Expired invitation, pending membership and normal personal-use escape route work.

### ORI-HOME-007 No double welcome

**Priority:** P0. **Initial status:** unverified.

One account/guest entry and versioned consent flow. Refresh, installation, account restore and institution arrival do not repeat obsolete trial screens.

**Acceptance:** Restarting the browser retains valid agreement and refreshes only expired human verification.

### ORI-HOME-008 Personal control centre

**Priority:** P1. **Initial status:** unverified.

My Life shows profile, preferences, saved places, memberships, data/export/deletion and permission guidance through an uncluttered hierarchy.

**Acceptance:** No account setting is only accessible through a hidden URL.

### ORI-HOME-009 Age aware content

**Priority:** P1. **Initial status:** unverified.

Avoid unnecessary birth dates. Explain limits for minors and family use without collecting children’s identifiers for ordinary help. Use age-appropriate plain language when relevant.

**Acceptance:** A school-registration request asks for year group only when useful, not names, ID numbers or exact birth dates.

### ORI-HOME-010 Preferences persist safely

**Priority:** P1. **Initial status:** unverified.

Theme, text size, language and voice options use account-scoped storage where applicable and guest storage separately.

**Acceptance:** Switching accounts does not transfer the previous person’s personal defaults.

## CHAT Conversation and message actions

### ORI-CHAT-001 Maintain conversation intent

**Priority:** P0. **Initial status:** unverified.

Understand informal wording, typos, corrections and short follow-ups. Resolve them against the latest relevant user goal rather than an old special route.

**Acceptance:** Year 6, all of them, contact them, the landlord and a corrected institution work through multi-turn scenarios.

### ORI-CHAT-002 Research without permission loops

**Priority:** P0. **Initial status:** unverified.

When asked to find information, do the permitted research. Ask a concise clarification only when it materially prevents a useful answer.

**Acceptance:** Yes please does not trigger another permission question or repeat an unchanged directory result.

### ORI-CHAT-003 Preserve conversation branches

**Priority:** P0. **Initial status:** unverified.

Represent edited prompts and regenerated answers as versions/branches with stable IDs. Keep previous versions accessible and send only the selected path to the model.

**Acceptance:** Switching versions restores matching sources, cards and document context; superseded turns do not contaminate a new answer.

### ORI-CHAT-004 Copy response

**Priority:** P1. **Initial status:** unverified.

Copy the intended reply with sensible formatting, excluding controls and private hidden metadata. Show success/failure and keep keyboard access.

**Acceptance:** Clipboard result contains the complete selected version, not animated partial text.

### ORI-CHAT-005 Edit user message

**Priority:** P0. **Initial status:** unverified.

Allow editing the user’s own message with Cancel and Save and resend. Preserve the original branch. Explain that subsequent answers belong to the old branch.

**Acceptance:** An edited destination does not reuse stale route evidence or silently edit a saved reminder.

### ORI-CHAT-006 Regenerate response

**Priority:** P0. **Initial status:** unverified.

An explicit regenerate makes a new capped provider request, preserves the previous answer, and shows version navigation. Do not duplicate saved actions or re-upload attachments automatically.

**Acceptance:** Generate two answers, switch versions, reload and confirm calendar/file counts unchanged.

### ORI-CHAT-007 Rate a response

**Priority:** P1. **Initial status:** unverified.

Provide optional thumbs up/down, optional reason and minimal retained metadata. A rating can be changed or removed where supported. Never force feedback before continuing.

**Acceptance:** Rating persists to the real feedback system and surfaces in aggregate management metrics.

### ORI-CHAT-008 Report a problem

**Priority:** P0. **Initial status:** unverified.

Offer inaccurate information, unsafe answer, privacy issue, technical problem and other. Preview exactly what is attached, with conversation inclusion off by default.

**Acceptance:** Submission reaches an authorised management queue, returns a receipt, and handles failure without a false success.

### ORI-CHAT-009 Share safely

**Priority:** P0. **Initial status:** unverified.

Offer a reviewable snapshot of selected content, never an entire account. Private file contents and membership-only institutional material are excluded unless an explicitly authorised sharing design allows them.

**Acceptance:** Before publication show audience, included content, expiry and revoke controls; guessed IDs cannot retrieve unshared material.

### ORI-CHAT-010 Manage shared links

**Priority:** P0. **Initial status:** unverified.

Support expiry, revocation, deletion and a clear read-only shared view. Revoke account-owned shares on account deletion. Indexing policy and source attribution are explicit.

**Acceptance:** A revoked link no longer returns the snapshot; opening it never grants membership or account access.

### ORI-CHAT-011 Smart titles

**Priority:** P1. **Initial status:** unverified.

Use the actual conversation goal, not greetings or sensitive identifiers. Preserve manual names; update only eligible automatic names as a task becomes clear.

**Acceptance:** Hi followed by a housing question becomes a useful title; a manually renamed chat never changes.

### ORI-CHAT-012 Chat organisation

**Priority:** P1. **Initial status:** unverified.

New chat, search, pin, archive, rename and delete operate on the same history on desktop and mobile. Empty/no-match states are distinct.

**Acceptance:** Search covers permitted saved turns without leaking another account’s content.

### ORI-CHAT-013 Reply actions design

**Priority:** P1. **Initial status:** unverified.

Copy, Listen and More are quiet on desktop hover/focus and readily available on touch. Do not hide functionality solely behind hover.

**Acceptance:** All actions can be reached by keyboard and a touch device.

### ORI-CHAT-014 Draft and scroll stability

**Priority:** P1. **Initial status:** unverified.

Preserve draft text and attachments through navigation, update prompts and failed sends. Follow new replies only when the reader is following the bottom.

**Acceptance:** Scrolling up stays put as content arrives; returning to latest is explicit.

### ORI-CHAT-015 Cancel a request

**Priority:** P0. **Initial status:** unverified.

Stop cancels the relevant client request, prevents late UI writes and restores an unsent/failed question according to the existing contract. Track uncertain paid outcomes honestly.

**Acceptance:** Account/chat switch and Stop cannot inject an old response into a different conversation.

## AI Research quality and source intelligence

### ORI-AI-001 Decide act check loop

**Priority:** P0. **Initial status:** unverified.

Retain an agent loop that selects the next useful research action from the goal and evidence, checks the result and stops when the actual request is satisfied.

**Acceptance:** It can change strategy after a dead page or incomplete directory, without hardcoded school names.

### ORI-AI-002 Source classes

**Priority:** P0. **Initial status:** unverified.

Official rules require the appropriate government/regulator; organisation facts use its verified site or clearly labelled self-description; community experiences are labelled and separate.

**Acceptance:** Forum advice cannot become a visa rule; a school’s site cannot become a regulator classification.

### ORI-AI-003 Broad discovery with strict claims

**Priority:** P0. **Initial status:** unverified.

Search the wider web for leads when appropriate, then open and classify relevant sources. Do not restrict discovery to one connected directory.

**Acceptance:** A named school absent from an indexed register can be researched through its own site with honest limitations.

### ORI-AI-004 Jurisdiction and context

**Priority:** P0. **Initial status:** unverified.

Keep UAE emirates and UK nations/cities distinct. Dates, age/year groups, visa categories, campuses and provider branches are material qualifiers.

**Acceptance:** Dubai is not answered from Sharjah rules; Grade 6 is not automatically Year 6.

### ORI-AI-005 Evidence per factual assertion

**Priority:** P0. **Initial status:** unverified.

Contacts, amounts, dates, addresses and eligibility statements remain tied to the supporting source and subject. Unsupported facts are omitted or explicitly unconfirmed.

**Acceptance:** Gold/Silver price mixing, menu curricula, related-school text and wrong-campus contacts are rejected.

### ORI-AI-006 Conflicting evidence

**Priority:** P1. **Initial status:** unverified.

State what each source says, source date and remaining uncertainty. Do not force an agreement or turn an old report into current status.

**Acceptance:** School website/regulator curriculum disagreement is retained and understandable.

### ORI-AI-007 Completeness claims

**Priority:** P0. **Initial status:** unverified.

All means complete only when a complete scoped authoritative result is actually read and the tool confirms it. Distinguish emirate/city, curriculum and year filters.

**Acceptance:** The same three schools are not repeated as every school; a bounded partial list states coverage.

### ORI-AI-008 Relevance and pagination

**Priority:** P1. **Initial status:** unverified.

Avoid duplicate places, support more with a safe continuation cursor and preserve current filters. On a fresh request, stop inheriting obsolete constraints.

**Acceptance:** Find more returns new matches; a new unrestricted request does not inherit Year 6.

### ORI-AI-009 Safe search terms

**Priority:** P0. **Initial status:** unverified.

Send minimal checked general terms to search, not the conversation, children’s names, document text, ID numbers or secret tokens.

**Acceptance:** A conversation containing a synthetic child’s name never places that name into search.

### ORI-AI-010 Safe page handling

**Priority:** P0. **Initial status:** unverified.

Validate external targets, redirects, schemes and ownership. Bound page sizes, fetch counts, time and data retained. Treat page/document instructions as untrusted content.

**Acceptance:** Prompt-injection pages cannot change system rules, reveal secrets or cause an unrelated send.

### ORI-AI-011 Useful failure

**Priority:** P1. **Initial status:** unverified.

Explain what could not be checked and a sourced next step. Do not pretend no result means no organisation exists.

**Acceptance:** Outages, limits and uncertain identities produce different truthful responses.

### ORI-AI-012 Advice and action

**Priority:** P0. **Initial status:** unverified.

Explain options and the next practical step, proportionate to evidence and risk. Avoid unsupported personalised medical/legal determinations and invented emergency contacts.

**Acceptance:** Housing urgency triggers useful scam-aware help and a draft when requested, not another institution question.

## PERF Speed streaming and Listen latency

### ORI-PERF-001 Measure actual latency

**Priority:** P0. **Initial status:** unverified.

Measure send to first visible real status, first useful checked text, full reply, tools, provider calls and audio playback start. Separate cold/warm, failures and cancellations.

**Acceptance:** Release report contains raw sample counts, median and p95 where sample size permits, versions and no fabricated benchmark.

### ORI-PERF-002 Performance targets

**Priority:** P1. **Initial status:** unverified.

Use targets rather than promises: interaction feedback under 100 ms, useful status under 1 s, ordinary non-research answers ideally within 5 s, initial useful research content ideally within 10 s. Full answers depend on provider/source work.

**Acceptance:** Failure to meet a target is reported with measured cause, not hidden by a typing animation.

### ORI-PERF-003 Remove repeated work

**Priority:** P0. **Initial status:** unverified.

Reuse exact successful searches/pages within a permitted turn, batch independent calls, avoid duplicate startup/session/membership fetches and unnecessary model corrections.

**Acceptance:** Equivalent scenario before/after records fewer real calls with unchanged source/permission checks.

### ORI-PERF-004 True streaming contract

**Priority:** P0. **Initial status:** unverified.

Implement explicit progress, checked text, metadata, completion, cancellation and error events with request/turn IDs. Parse partial network frames and reconnect/failure safely.

**Acceptance:** Several network chunks arrive and render before completion in an integration test; no fake sleep is counted as streaming.

### ORI-PERF-005 Verify before presentation

**Priority:** P0. **Initial status:** unverified.

Never stream unverified prices, contacts or official requirements as settled facts. A reviewed sentence/segment verification design may release checked pieces while remaining work continues.

**Acceptance:** A later validation failure cannot leave an already displayed unsupported claim appearing confirmed.

### ORI-PERF-006 Progressive display fallback

**Priority:** P0. **Initial status:** unverified.

When streaming is unavailable, reveal the checked result smoothly with a short bounded animation, immediate reduced-motion mode and exact citation restoration.

**Acceptance:** Long replies do not gain many seconds of artificial presentation delay.

### ORI-PERF-007 Thinking text is truthful

**Priority:** P1. **Initial status:** unverified.

Show real activities, not private model reasoning or invented progress. Translate statuses and distinguish delayed sources from generating the final reply.

**Acceptance:** An unavailable source never appears as successfully checked while the spinner continues.

### ORI-PERF-008 Listen startup

**Priority:** P0. **Initial status:** unverified.

On tap show Preparing audio immediately, provide Stop and timeout/fallback, and measure time to first audible sample. Prefer supported chunked playback when it preserves the checked text and language.

**Acceptance:** Repeated tap does not create duplicate paid jobs; Cancel stops playback and late responses.

### ORI-PERF-009 Private audio reuse

**Priority:** P1. **Initial status:** unverified.

Reuse an identical reply’s already generated audio in bounded device memory/session where consent allows. No cross-user shared audio cache and no automatic playback.

**Acceptance:** Second Listen can reuse local audio; logout/account switch revokes object URLs and clears it.

### ORI-PERF-010 Audio budget and fidelity

**Priority:** P0. **Initial status:** unverified.

Keep existing caps, explicit AI voice disclosure and device-voice fallback. Read only the selected answer, excluding reference URLs, controls and citation markers.

**Acceptance:** Playback never invents paraphrased advice, uses a wrong language silently or bypasses the voice cap.

## JOURNEY Journeys as contextual plans

### ORI-JOURNEY-001 Universal planning architecture

**Priority:** P0. **Initial status:** unverified.

Use an extensible plan schema rather than hand-writing every possible journey. Combine reviewed templates with evidence-grounded personalised drafts for uncovered goals.

**Acceptance:** A novel legitimate task produces a clearly labelled draft or an honest limitation instead of a false reviewed guide.

### ORI-JOURNEY-002 Offer before opening

**Priority:** P0. **Initial status:** unverified.

When the conversation indicates a multi-step goal, offer Would you like to see the X plan with a concise explanation and accept/decline. Do not inject or auto-save a large plan without consent.

**Acceptance:** User can decline and keep talking; repeating the same declined offer is avoided.

### ORI-JOURNEY-003 Plan contents

**Priority:** P0. **Initial status:** unverified.

Every plan has goal, scope, jurisdiction, applicability, steps, dependencies, evidence, estimated/unknown timings, owner, actions and completion criteria.

**Acceptance:** A plan explains what comes next and what blocks it; unknown fees/timings are not invented.

### ORI-JOURNEY-004 Step states

**Priority:** P0. **Initial status:** unverified.

Support not started, ready, in progress, waiting for you, waiting for organisation, blocked, done and not applicable, with Undo/history and source of state.

**Acceptance:** Marking a personal task done never becomes authoritative approval of a visa or medical result.

### ORI-JOURNEY-005 Preparation and missing documents

**Priority:** P1. **Initial status:** unverified.

Show prerequisites and checklist before the user reaches a deadline. Attestation/document requirements are researched for the exact situation.

**Acceptance:** Family-schooling scenario identifies the need to check document recognition without asserting one rule for all families.

### ORI-JOURNEY-006 Chat to plan continuity

**Priority:** P1. **Initial status:** unverified.

Ask about this step opens Chat with a visible permitted context label; actions return to the same plan and progress.

**Acceptance:** Refresh, Back, correction and account switching preserve the right plan without leaking another space.

### ORI-JOURNEY-007 Maintain reviewed content

**Priority:** P1. **Initial status:** unverified.

Reviewed templates have version, jurisdiction, source dates, reviewer and next-review date. Generated drafts are visibly distinct and can become reviewed only through staff workflow.

**Acceptance:** A stale template is marked stale and updated without erasing the user’s completed history.

### ORI-JOURNEY-008 Plan changes

**Priority:** P1. **Initial status:** unverified.

When dates or requirements change, show a diff and ask before altering saved reminders or steps. Record old/new versions.

**Acceptance:** An institution updating a guide cannot silently erase or falsely complete a student’s work.

### ORI-JOURNEY-009 Shared-device and family use

**Priority:** P1. **Initial status:** unverified.

Allow separately labelled dependants/plans without collecting sensitive identifiers by default. Personal accounts remain private; no assumed guardian access.

**Acceptance:** Two children’s school tasks remain distinguishable without requiring passport numbers.

### ORI-JOURNEY-010 Coverage and discovery

**Priority:** P1. **Initial status:** unverified.

Seed the coverage catalogue below and maintain a missing-topic queue. Coverage means the planner recognises a topic and can research safely, not that all answers are prewritten.

**Acceptance:** Each catalogue family has at least one synthetic happy-path and one uncertainty/failure scenario.

## LIB Library and automatic saved discoveries

### ORI-LIB-001 Library composition

**Priority:** P0. **Initial status:** unverified.

Provide All, Plans and guides, Saved places and services, Files, and optionally Saved conversations/links, with search and filters. Reuse existing data/IDs rather than copying collections.

**Acceptance:** Existing saved guides, files and shortlists survive migration with unchanged ownership.

### ORI-LIB-002 Auto-save valid discoveries

**Priority:** P0. **Initial status:** unverified.

Founder decision: useful places/services/sites Orivia recommends are automatically retained privately in Saved from chat, linked to the originating answer. This does not grant permission to save arbitrary browsed pages or tracking pixels.

**Acceptance:** A sourced service card creates one private discovery; repeated mention does not create duplicates.

### ORI-LIB-003 Intentional favourites

**Priority:** P1. **Initial status:** unverified.

Keep explicit favourite/pin/shortlist selection distinct from automatically saved discoveries, even if the UI groups them. Explain why an item is saved and allow removal.

**Acceptance:** User can find both all suggested options and only the ones they deliberately favour.

### ORI-LIB-004 Discovery provenance

**Priority:** P0. **Initial status:** unverified.

Save stable entity ID, exact name, source URL/type, checked date, location/campus, originating chat/turn and current user. Contacts remain evidence-backed.

**Acceptance:** A later source correction updates the entity with history instead of inventing new contact details.

### ORI-LIB-005 Permission changes

**Priority:** P0. **Initial status:** unverified.

A saved bookmark does not grant permanent access to university-only content. Recheck membership before opening or sending it to AI.

**Acceptance:** Leaving a university hides protected bodies while allowing a non-sensitive unavailable bookmark.

### ORI-LIB-006 Remove and restore semantics

**Priority:** P1. **Initial status:** unverified.

Explain removal from Library versus deletion of original chat/file. Provide reversible removal for a discovery where feasible; file deletion remains separately confirmed.

**Acceptance:** Removing one saved school does not delete the conversation or another user’s saved school.

### ORI-LIB-007 Search sorting and filters

**Priority:** P1. **Initial status:** unverified.

Search titles and authorised metadata, filter by type/country/space and sort recent/alphabetical/pinned. Show no-results recovery without losing state.

**Acceptance:** A filtered view never makes unselected files or private source bodies available to another account.

### ORI-LIB-008 Useful cards

**Priority:** P1. **Initial status:** unverified.

Show one clear identity, relevant facts, source freshness and only supported Call/Email/Website/Map actions. Bulk selection can prepare a reviewed contact draft.

**Acceptance:** Missing contacts produce no fake button; application messages are not sent automatically.

### ORI-LIB-009 Export

**Priority:** P1. **Initial status:** unverified.

Export the user’s selected data in usable formats without secretly including private files or other institutions’ content. Include dates/source references.

**Acceptance:** Export preview and downloadable result match the authorised selection.

### ORI-LIB-010 Storage limits

**Priority:** P0. **Initial status:** unverified.

Show actual storage use and limits. When full, refuse new writes with a durable notice; no automatic eviction or silent transcript truncation.

**Acceptance:** A full device/account preserves existing files, chat versions, plans and calendar events.

## CAL Calendar maps and permissions

### ORI-CAL-001 Swipe between weeks

**Priority:** P0. **Initial status:** unverified.

Support horizontal swipe on the week strip only, with a movement threshold, vertical-scroll rejection, cancellation and one change per gesture. Keep arrow buttons and keyboard alternatives.

**Acceptance:** Swipe left/right advances one week; scrolling the page vertically or tapping a day does not. Test RTL direction intentionally.

### ORI-CAL-002 Understand calendar actions

**Priority:** P0. **Initial status:** unverified.

Create, edit, reschedule and delete existing reminders through explicit review. Resolve ambiguous targets/times, preserve unspecified fields and support Undo.

**Acceptance:** Change it to 12pm changes the intended reminder only; what or I am lost does not replay an old edit.

### ORI-CAL-003 Time correctness

**Priority:** P0. **Initial status:** unverified.

Use the user/device time zone, handle day boundaries, daylight saving and travel between UK/UAE. Show source timezone where supplied by an organisation.

**Acceptance:** UK DST transition, Dubai-to-London travel and repeated local times produce reviewable correct dates.

### ORI-CAL-004 External calendar handoffs

**Priority:** P0. **Initial status:** unverified.

Offer Google, Outlook and Apple calendar handoffs appropriate to the device. Explain that external Save is required and no two-way sync exists unless implemented.

**Acceptance:** Repeated Add from a university date detects the Orivia duplicate and does not silently duplicate it.

### ORI-CAL-005 Directions card

**Priority:** P0. **Initial status:** unverified.

Show resolved destination, mode and origin where known, with a single strong Open in maps action and an app picker when useful. Links are safely encoded.

**Acceptance:** Driving stays driving; no public transport link is presented as the chosen car route.

### ORI-CAL-006 Location permission

**Priority:** P0. **Initial status:** unverified.

Offer Use my location explicitly, explain use and request device permission on tap. Allow a landmark/area fallback and clear current-location context.

**Acceptance:** Denial, unavailable coordinates, stale location and offline state all allow a useful non-location path.

### ORI-CAL-007 No guessed route data

**Priority:** P1. **Initial status:** unverified.

Do not invent ETAs, routes, prices, live bus arrivals or map pins. Use a connected maps/transport source or explain the handoff.

**Acceptance:** An ambiguous station name is resolved or labelled before directions; source URL is not guessed.

### ORI-CAL-008 Show someone card

**Priority:** P1. **Initial status:** unverified.

When offering a message to show another person, provide full-screen English, Arabic and user-language tabs, large text, Listen and clear Close.

**Acceptance:** Translation preserves the message and supported names; switching languages never sends the message externally.

### ORI-CAL-009 Permission control centre

**Priority:** P1. **Initial status:** unverified.

Settings explains camera, microphone, location and notifications status where readable, with device settings guidance and graceful unknown states.

**Acceptance:** A browser that cannot expose permission status shows Unknown rather than Enabled.

### ORI-CAL-010 No permission wall

**Priority:** P0. **Initial status:** unverified.

Microphone, photos and camera are requested only for their specific action. Notifications may be offered after setup but actual OS permission follows an explicit choice.

**Acceptance:** Declining any permission does not block typed chat, manual place entry or ordinary app navigation.

## AUTH Accounts and switching identities

### ORI-AUTH-001 Account and guest entry

**Priority:** P0. **Initial status:** unverified.

Show sign in, sign up and continue as guest, with clear storage differences. Institution login is not impersonated by a generic email field.

**Acceptance:** Guest use remains useful and guest data is never silently uploaded to a new account.

### ORI-AUTH-002 Remember multiple accounts

**Priority:** P0. **Initial status:** unverified.

Provide Add account, active-account identity and Switch account using the existing auth library’s supported multi-session capability after version/security review. No custom localStorage bearer-token stash.

**Acceptance:** Two verified synthetic accounts can be remembered and selected without typing credentials again while sessions remain valid.

### ORI-AUTH-003 Server-authorised switching

**Priority:** P0. **Initial status:** unverified.

List only sessions legitimately present on this device; switch through a same-origin authenticated server route. Do not accept an arbitrary user ID/token as proof.

**Acceptance:** Forged account IDs and unrelated sessions cannot be activated.

### ORI-AUTH-004 Clear old account surfaces first

**Priority:** P0. **Initial status:** unverified.

Abort chat/audio/file work, revoke photo/object URLs, clear in-memory cards and search, switch account-scoped storage, then load the new identity and memberships.

**Acceptance:** Late requests and cached thumbnails cannot appear after switching accounts.

### ORI-AUTH-005 Tabs have one active identity policy

**Priority:** P0. **Initial status:** unverified.

Choose a single active account across tabs for this release and broadcast changes safely. Protect unsaved drafts with an account-specific recoverable state before switching.

**Acceptance:** Switch in one tab updates others; account A draft never becomes account B’s message.

### ORI-AUTH-006 Session management

**Priority:** P0. **Initial status:** unverified.

Show remembered accounts and active devices without exposing raw tokens. Support sign out this account, remove from this device and sign out all with precise scope.

**Acceptance:** Expired/revoked sessions require authentication; removal of one account preserves the others.

### ORI-AUTH-007 Verify privileged actions

**Priority:** P0. **Initial status:** unverified.

Owner/staff access always comes from server roles, not email domains or client controls. Recent authentication and confirmation protect sensitive role/config changes.

**Acceptance:** A student with a university email cannot grant staff access or open owner controls.

### ORI-AUTH-008 Account recovery

**Priority:** P1. **Initial status:** unverified.

Provide supported email verification/recovery within actual email caps and a clear rate-limit state. Avoid revealing whether an unrelated email has an account.

**Acceptance:** One-use expired codes, resend, caps and provider failure have working recovery paths.

### ORI-AUTH-009 Deletion and exports

**Priority:** P0. **Initial status:** unverified.

Users can request export and delete their own account with clear effects, membership obligations and reliable file cleanup. Never delete files while the account still exists.

**Acceptance:** The interrupted deletion reproduction stays fixed; shares/push/session data are revoked as applicable.

### ORI-AUTH-010 Owner recovery and access resilience

**Priority:** P0. **Initial status:** unverified.

Provide documented owner recovery/transfer and prevent accidental last-owner deletion or lockout. Back up operational recovery instructions privately.

**Acceptance:** Deleting or demoting the last authorised owner is refused with a useful explanation.

## OWNER Founder management console

### ORI-OWNER-001 Executive overview

**Priority:** P0. **Initial status:** unverified.

Show actual users/accounts, active organisations, join funnel, request success/failure, latency, budget use, feedback queue and service health, each with date range and metric definition.

**Acceptance:** Cards drill into the correct filtered view; unavailable data is labelled unavailable rather than a fabricated zero.

### ORI-OWNER-002 Organisation directory

**Priority:** P1. **Initial status:** unverified.

Search/filter organisations by status, type, country, plan and health; open details with active admins, content, integrations and distribution status.

**Acceptance:** Create/update/pause/reactivate an organisation with audit events and membership isolation.

### ORI-OWNER-003 Platform access

**Priority:** P0. **Initial status:** unverified.

Owner can manage authorised platform staff roles, invite/revoke staff, inspect effective permissions and review privileged actions. Do not turn full control into automatic access to private chats/files.

**Acceptance:** Every denied direct API request remains denied even if the UI is modified.

### ORI-OWNER-004 People and memberships

**Priority:** P1. **Initial status:** unverified.

Search accounts for legitimate administration, show verification/state and organisation relationships, and provide narrowly scoped support actions.

**Acceptance:** Owner support views minimise personal data and do not display private message text by default.

### ORI-OWNER-005 Real product analytics

**Priority:** P0. **Initial status:** unverified.

Measure documented events such as new account, welcome completion, plan offer/accept, safe action, feedback and error. Do not log raw chat text or sensitive profile fields for analytics.

**Acceptance:** Every displayed metric has a query definition, event source, retention and validation against synthetic events.

### ORI-OWNER-006 AI operations

**Priority:** P1. **Initial status:** unverified.

Show provider availability, response/first-audio latency, error categories, source-fetch failures, model-call counts, rejection rates and budget blocks.

**Acceptance:** Drilldown uses request IDs/status metadata, not hidden prompts or customer documents.

### ORI-OWNER-007 Budgets and limits

**Priority:** P0. **Initial status:** unverified.

Display actual daily/monthly usage by service, reservations, uncertain charges and cap remaining. Offer restricted cap controls and kill switches with previews.

**Acceptance:** A cap change is authenticated/audited; no new spend is enabled by a visual toggle alone.

### ORI-OWNER-008 Content and Journey governance

**Priority:** P1. **Initial status:** unverified.

Manage template catalogue, coverage gaps, source registry, revisions, approvals, stale content and jurisdiction.

**Acceptance:** A published template/source change has review history and can be rolled back.

### ORI-OWNER-009 Feedback and support inbox

**Priority:** P0. **Initial status:** unverified.

Collect user-submitted reports, ratings and reviewed attachments into a searchable queue with severity, assignee, state, notes and resolution.

**Acceptance:** Reports created in Chat appear once with only the content the person agreed to attach.

### ORI-OWNER-010 Partners and sponsors

**Priority:** P1. **Initial status:** unverified.

Maintain partner pipeline, contacts supplied for business use, agreements/status, campaigns, placements, dates and approval records. Sponsorship is labelled and never changes official evidence standards.

**Acceptance:** No partner record becomes a public endorsement or paid campaign without a deliberate publish action.

### ORI-OWNER-011 Commercial controls

**Priority:** P1. **Initial status:** unverified.

Show plans, entitlements and invoice/payment status only from a configured billing source. Until configured, manage draft pricing/contract records without fake revenue.

**Acceptance:** A failed payment does not silently remove the promised free basic help; premium boundaries are clear.

### ORI-OWNER-012 Communications

**Priority:** P0. **Initial status:** unverified.

Draft segmented service announcements with audience count, preview, test mode, scheduling, cancellation and sending limits. Marketing choice is separate from essential service messages.

**Acceptance:** A test uses synthetic recipients; no mass send occurs without the authorised final action.

### ORI-OWNER-013 Releases and incidents

**Priority:** P0. **Initial status:** unverified.

Show deployed source/version, feature switches, migrations, test receipts, incidents, rollback points and status banner controls.

**Acceptance:** Pilot/production are clearly distinguished and one-click UI cannot accidentally target the wrong environment.

### ORI-OWNER-014 Privacy operations

**Priority:** P0. **Initial status:** unverified.

Support access/export/deletion requests, processing status, retention jobs, failed cleanup, share revocation and audit review.

**Acceptance:** A failed cleanup remains visible for follow-up after bounded automatic retries.

### ORI-OWNER-015 Administrative power boundaries

**Priority:** P0. **Initial status:** unverified.

Owner has full product and operational control appropriate to the platform. Private customer content requires a specific support/consent or separately justified controlled access process, not a permanent browse-everything page.

**Acceptance:** No support impersonation/backdoor route bypasses account and organisation boundaries.

## UNI University staff platform

### ORI-UNI-001 Institution overview

**Priority:** P0. **Initial status:** unverified.

Present a polished workspace with service health, outstanding content reviews, invitations/join requests, upcoming dates, support load and integration freshness. Show institution branding without claiming a real partner when using Northbay demo.

**Acceptance:** An admin sees clear next actions; an editor sees only permitted ones.

### ORI-UNI-002 Guidance CMS

**Priority:** P0. **Initial status:** unverified.

Create structured guides, FAQs, contacts, dates and updates with source URL, jurisdiction, campus, responsible team, review date, revision and draft/review/published/archived states.

**Acceptance:** Editors draft; authorised staff approve/publish; stale updates and conflicting edits are handled.

### ORI-UNI-003 Approval and preview

**Priority:** P1. **Initial status:** unverified.

Preview exact student rendering in supported languages and compare revisions before publishing. Prevent accidental publish of draft/private content.

**Acceptance:** A revision that loses required contact/source/date fields shows a validation error.

### ORI-UNI-004 Process builder

**Priority:** P0. **Initial status:** unverified.

Define a process as stages with explanations, dependencies, required student actions, responsible office, source and escalation route. Keep official approvals separate from user-marked tasks.

**Acceptance:** A visa appointment completed state cannot become fingerprints approved.

### ORI-UNI-005 Campus directory

**Priority:** P1. **Initial status:** unverified.

Manage real campus places/services, locations, opening hours, contact methods, accessible routes and source/last reviewed fields.

**Acceptance:** The student gets the correct campus printer/service team, not generic web instructions.

### ORI-UNI-006 Dates and announcements

**Priority:** P1. **Initial status:** unverified.

Publish targeted key dates and announcements with time zone, audience, expiry, related guide and notification preview.

**Acceptance:** Expired notices stop appearing; editing a date explains what happens to previously saved reminders.

### ORI-UNI-007 Invitations and QR studio

**Priority:** P0. **Initial status:** unverified.

Generate public landing QR, time-limited invitation QR and campaign attribution codes with clear differences. Add logo/download options, preview URL, expiry/revoke and usage counts.

**Acceptance:** QR decodes to the intended canonical domain and never grants personal-record access.

### ORI-UNI-008 Members and join requests

**Priority:** P0. **Initial status:** unverified.

Provide search, filters, paging, pending requests, membership approval/removal and rejoin controls. Role changes are explicit and auditable.

**Acceptance:** An editor cannot see member email lists or approve a request merely by calling the API.

### ORI-UNI-009 Staff access

**Priority:** P1. **Initial status:** unverified.

Invite admins/editors under least privilege, show effective capabilities and revoke sessions/access correctly. Prevent removing the last responsible administrator without transfer.

**Acceptance:** Revoked staff cannot publish or read new protected content, including through an old tab.

### ORI-UNI-010 Support and escalation

**Priority:** P0. **Initial status:** unverified.

Provide a real support queue or a clearly identified handoff to the institution’s chosen contact system. Students review submitted summaries and attachments.

**Acceptance:** No private chat is shared with staff unless the student selects it for a support request.

### ORI-UNI-011 Privacy-safe service analytics

**Priority:** P0. **Initial status:** unverified.

Provide joins, invitation usage, content service health and genuinely safe aggregate performance metrics. Keep student Done marks private until a reviewed non-inferential reporting design is approved.

**Acceptance:** Exact completion totals remain disabled around removals/opt-outs; no five-to-six-person differencing leak.

### ORI-UNI-012 Data separation

**Priority:** P0. **Initial status:** unverified.

University staff do not access personal chats, files, profile, calendar, other universities or unrelated plan activity through their dashboard.

**Acceptance:** Cross-tenant and direct-object access tests cover every staff endpoint and export.

### ORI-UNI-013 Brand and onboarding controls

**Priority:** P1. **Initial status:** unverified.

Set permitted institution name/logo/colour accents, campus, destination/reason defaults, welcome guidance and contact channels. Preserve core Orivia navigation and accessibility.

**Acceptance:** Preview and actual join flow agree; organisation branding cannot spoof an unaffiliated university.

### ORI-UNI-014 Connection centre

**Priority:** P0. **Initial status:** unverified.

List supported integrations, permissions, setup prerequisites, credential status, last sync, errors and disconnect. Use a read-only sandbox adapter before any real partner connection.

**Acceptance:** Unconfigured integrations show honest setup states and no invented student application statuses.

### ORI-UNI-015 Institution administration

**Priority:** P0. **Initial status:** unverified.

Manage notification categories, retention/contact policy, service owners and export permissions. Supply audit history and accessible settings.

**Acceptance:** Changes do not retroactively grant consent, broaden student data access or bypass platform caps.

## STUDENT Institution-linked student experience

### ORI-STUDENT-001 Branded student Home

**Priority:** P1. **Initial status:** unverified.

Show relevant university guidance, next steps, dates, campus contacts and support in the same app, with an obvious switch to personal Orivia.

**Acceptance:** Refresh, Back and deep links return to the right university context.

### ORI-STUDENT-002 Joining is not authentication bypass

**Priority:** P0. **Initial status:** unverified.

Public QR opens the university page; membership or institutional login is separately verified before protected information.

**Acceptance:** A copied public QR cannot open another student’s records.

### ORI-STUDENT-003 Application timeline

**Priority:** P0. **Initial status:** unverified.

For configured authorised connections show source system, exact status wording, timestamp, next action and responsible team. If no connection, do not show a simulated personal timeline.

**Acceptance:** An old record is labelled stale and a missing predicted completion date is not invented.

### ORI-STUDENT-004 University-aware Chat

**Priority:** P0. **Initial status:** unverified.

Only selected/authorised context enters Chat, with visible institution/source label and server-side membership checks each time.

**Acceptance:** Revocation after opening a guide prevents its text being used in a later provider request.

### ORI-STUDENT-005 Student tasks

**Priority:** P1. **Initial status:** unverified.

Personal Done marks and reminders remain useful independently of analytics. Clearly distinguish personal completion from university-confirmed status.

**Acceptance:** Private marks continue to work while staff totals are paused.

### ORI-STUDENT-006 Useful campus assistance

**Priority:** P1. **Initial status:** unverified.

Handle printing, borrowing equipment, accessibility, wellbeing, accommodation help and correct office routing using approved campus content.

**Acceptance:** A laptop-versus-phone printing question asks only relevant details and links the actual campus instructions.

### ORI-STUDENT-007 Support requests

**Priority:** P1. **Initial status:** unverified.

Prepare a reviewable request, let the student choose contact and attachments, show sending status and a reference when an actual ticket exists.

**Acceptance:** Without a connected sender, open an editable email draft and never claim it was submitted.

### ORI-STUDENT-008 Leaving and rejoining

**Priority:** P0. **Initial status:** unverified.

Explain what membership removal changes, keep personal data separate and withdraw access to protected guides/records and future institutional alerts.

**Acceptance:** Downloaded information is not silently refreshed after leaving and the app does not promise to erase copies on someone else’s device.

## CONNECT Institution connections and authoritative records

### ORI-CONNECT-001 Adapter contract

**Priority:** P0. **Initial status:** unverified.

Define read-only adapters for identity, status timeline, timetable and support ticket lookup with explicit permissions and a server-held credential.

**Acceptance:** A fixture adapter and contract tests work; no real connection is called configured without credentials and partner agreement.

### ORI-CONNECT-002 Identity mapping

**Priority:** P0. **Initial status:** unverified.

Match the authenticated person to an institution-issued record using approved identity claims, not a user-entered student ID alone.

**Acceptance:** Changing a student ID parameter cannot retrieve another person’s status.

### ORI-CONNECT-003 Inbound updates

**Priority:** P0. **Initial status:** unverified.

Verify webhook signatures, timestamps, replay protection, schema, idempotency and institution routing. Polling uses bounded backoff when webhooks are unavailable.

**Acceptance:** Duplicate/replayed/out-of-order events do not duplicate notifications or regress a newer status.

### ORI-CONNECT-004 Provenance and freshness

**Priority:** P0. **Initial status:** unverified.

Retain source event/version, received time, recorded time and last successful sync. Preserve the original status meaning.

**Acceptance:** University submitted is never labelled government approved.

### ORI-CONNECT-005 Disconnect and revoke

**Priority:** P1. **Initial status:** unverified.

Disconnect stops future reads/updates, revokes provider credentials and explains retained records/retention.

**Acceptance:** Queued updates cannot continue writing after revocation.

### ORI-CONNECT-006 Integration readiness boundary

**Priority:** P0. **Initial status:** unverified.

Build interfaces and sandbox tests now; real university SSO, visa databases and government status connections remain external until access is authorised.

**Acceptance:** Release notes separate connector software readiness from a verified live university integration.

## METRIC Analytics without surveillance

### ORI-METRIC-001 Metric definitions

**Priority:** P0. **Initial status:** unverified.

Document name, purpose, numerator/denominator, time zone, event source, aggregation interval, retention and permitted roles for every metric.

**Acceptance:** Synthetic event totals reconcile with the dashboard and export.

### ORI-METRIC-002 No raw content telemetry

**Priority:** P0. **Initial status:** unverified.

Exclude raw prompts, transcripts, documents, personal identifiers, access tokens and precise location from general product analytics.

**Acceptance:** Request/event inspection confirms only approved metadata is retained.

### ORI-METRIC-003 Aggregate disclosure risk

**Priority:** P0. **Initial status:** unverified.

Suppress small cohorts and also prevent differencing, repeated-query and membership-change inference. Counts alone are not a guarantee of anonymity.

**Acceptance:** Admin removal/opt-out/single-completion tests cannot reveal an individual mark.

### ORI-METRIC-004 Purpose and choice

**Priority:** P1. **Initial status:** unverified.

Keep analytics choices separate from core help, AI processing, notifications and marketing. Private plans keep working when sharing is declined.

**Acceptance:** Turning off optional reporting does not block student guidance or reminders.

### ORI-METRIC-005 No fabricated engagement

**Priority:** P0. **Initial status:** unverified.

Do not infer guide views from published count, active users from sessions created, or delivery from provider acceptance. Label metric limitations.

**Acceptance:** An unavailable view-tracking system displays unavailable, not 0 percent engagement.

### ORI-METRIC-006 Safe exports

**Priority:** P0. **Initial status:** unverified.

Export only metrics and fields allowed for the actor and organisation, with bounded ranges and audit. Protect CSV formula injection.

**Acceptance:** A malicious display name cannot execute a spreadsheet formula on export.

### ORI-METRIC-007 Retention and deletion

**Priority:** P1. **Initial status:** unverified.

Expire analytics according to a documented schedule and remove identifiable links when required by the actual retention policy.

**Acceptance:** Deletion tests cover account-linked feedback/events without corrupting legitimate aggregate history.

### ORI-METRIC-008 Operational observability

**Priority:** P0. **Initial status:** unverified.

Keep request correlation IDs, stage durations and error codes useful for diagnosis while scrubbing provider error bodies.

**Acceptance:** A provider error that echoes a prompt is not copied into public/client logs.

## FILES Files camera and document Chat

### ORI-FILES-001 Supported private files

**Priority:** P0. **Initial status:** unverified.

Keep supported PDF/JPEG/PNG handling with existing size/account/day limits; verify content rather than trusting filename. Use authorised private account routes or guest browser storage.

**Acceptance:** Another account cannot list/open/rename/delete a file by guessing its ID.

### ORI-FILES-002 Camera flow

**Priority:** P1. **Initial status:** unverified.

Capture, preview, retake, rotate/crop where supported, choose name and save/use in Chat. Camera permission follows the action.

**Acceptance:** Camera denial or unsupported image format offers upload/manual fallback without losing typed text.

### ORI-FILES-003 Consent before transmission

**Priority:** P0. **Initial status:** unverified.

Confirm the selected file goes to OpenAI for input counting and, when budget permits, extraction. Distinguish that from saving in Library and later transcript reuse.

**Acceptance:** No old sent-once promise remains; consent version is checked server-side.

### ORI-FILES-004 Processing bounds

**Priority:** P0. **Initial status:** unverified.

Retain streaming upload and decompression limits, reliable page counting, PDF safety refusal and token-count reservation.

**Acceptance:** Dense, damaged, encrypted, oversized and expansion-bomb synthetic files fail safely before an unreserved generation.

### ORI-FILES-005 Document context

**Priority:** P0. **Initial status:** unverified.

Retain transcripts with their chat, include newest-three/combined text limit honestly and show partial extraction/context. Do not send all Library files.

**Acceptance:** Fourth-document and long-document scenarios visibly explain excluded/truncated context.

### ORI-FILES-006 No authenticity claims

**Priority:** P0. **Initial status:** unverified.

Say what the document appears to state. Reading is not verification, official approval, eligibility or a legal interpretation.

**Acceptance:** A tenancy agreement is not treated as proof a landlord is genuine.

### ORI-FILES-007 Separate deletion effects

**Priority:** P0. **Initial status:** unverified.

Deleting a Library original and deleting a chat transcript are separate actions with clear consequences. Account deletion includes durable cleanup and inaccessible retained tasks.

**Acceptance:** Interrupted cleanup preserves active-user files and later retries only a genuinely deleted account.

### ORI-FILES-008 Provider retention honesty

**Priority:** P0. **Initial status:** unverified.

Describe actual provider storage/data controls and service routing; store false is not a zero-retention promise. No special retention approval is assumed.

**Acceptance:** Privacy text and request settings agree for counting, extraction and follow-up Chat.

## VOICE Languages dictation and accessibility

### ORI-VOICE-001 Ten-language coverage matrix

**Priority:** P0. **Initial status:** unverified.

Track English, French, Arabic, Filipino, Hindi, Urdu, Chinese, Bengali, Malayalam and Russian separately for UI, model replies, dictation and Listen.

**Acceptance:** Matrix identifies actual tested support rather than one misleading all-languages tick.

### ORI-VOICE-002 Complete translations

**Priority:** P1. **Initial status:** unverified.

Translate auth, onboarding, personal/student/staff/owner navigation, actions, errors, consent, status and empty states. Preserve original source quotes and user values.

**Acceptance:** Locale sweeps find no unintended English labels; explicit unavailable translation fallback is visible.

### ORI-VOICE-003 Reply language follows intent

**Priority:** P0. **Initial status:** unverified.

Respond in the user’s chosen/requested language and handle language changes mid-chat without inheriting unrelated tasks.

**Acceptance:** French I am lost scenario stays in French and does not reopen an old calendar edit.

### ORI-VOICE-004 RTL and locale formatting

**Priority:** P1. **Initial status:** unverified.

Use logical spacing/alignment, correct reading order, dates/numbers/currency and isolated links/identifiers for Arabic/Urdu.

**Acceptance:** RTL drawer, week swipe, inline citations, inputs and institutional tables remain usable.

### ORI-VOICE-005 Dictation control

**Priority:** P0. **Initial status:** unverified.

Keep microphone selection in Settings and the approved hover/hold affordance rather than a bulky permanent composer label. Stop to edit before sending.

**Acceptance:** Speech never sends automatically; rejection/error preserves typed text.

### ORI-VOICE-006 Listen clarity

**Priority:** P1. **Initial status:** unverified.

Use the correct language/voice, immediate preparing indicator, Stop, speed controls where supported and natural-voice preference/fallback.

**Acceptance:** Missing Bengali/Malayalam/device voice is explained; no silently wrong-language playback.

### ORI-VOICE-007 Accessibility

**Priority:** P0. **Initial status:** unverified.

Support keyboard navigation, focus management, screen readers, contrast, large text, reduced motion and meaningful labels for icon controls.

**Acceptance:** Automated checks plus manual keyboard/reader spot-checks pass core flows.

### ORI-VOICE-008 Plain language and reassurance

**Priority:** P1. **Initial status:** unverified.

Explain acronyms and practical next steps without patronising, forced slang or endless Would you like me to help loops.

**Acceptance:** An anxious newcomer receives concise actionable help and choices rather than a long generic disclaimer.

## NOTIFY Notifications and reminders

### ORI-NOTIFY-001 Separate inbox and push

**Priority:** P1. **Initial status:** unverified.

Maintain unread inbox and bell red dot independently of phone delivery. Opening/marking read updates all relevant surfaces.

**Acceptance:** A failed push still leaves the permitted inbox item, without claiming the device displayed it.

### ORI-NOTIFY-002 Explicit opt-in

**Priority:** P0. **Initial status:** unverified.

Offer notifications after setup as approved; device permission requires a clear user choice, with separate reminder/membership/institution categories.

**Acceptance:** Decline never blocks the app; categories can be changed later.

### ORI-NOTIFY-003 Generic lock screen

**Priority:** P0. **Initial status:** unverified.

Push text is generic; documents, visa/health details, exact private titles and personal conversation never appear on the lock screen.

**Acceptance:** A synthetic medical/visa event produces only a generic update alert.

### ORI-NOTIFY-004 Delivery reliability

**Priority:** P0. **Initial status:** unverified.

Use the correct environment DB, bounded retries, idempotency and accurate attempted/accepted/failed/expired/uncertain counters.

**Acceptance:** Pilot cannot target production registrations and a duplicate scheduler run does not double-send.

### ORI-NOTIFY-005 Access on open

**Priority:** P0. **Initial status:** unverified.

Notification navigation rechecks sign-in, account and membership before showing detail.

**Acceptance:** An old notification after logout or leaving an organisation does not reveal protected content.

### ORI-NOTIFY-006 Production enablement gate

**Priority:** P0. **Initial status:** unverified.

Keep production push off until technical delivery, preferences, privacy copy and a real-device check pass. Cleo enables only after the final approval gate.

**Acceptance:** The release receipt names the verified device/environment and actual disclosure version.

## BUSINESS Partners premium sponsorship and money

### ORI-BUSINESS-001 Free useful core

**Priority:** P1. **Initial status:** unverified.

Keep the advertised basic relocation help, reliable sources, essential plans and useful guest access free. Premium is optional added value, not a surprise fee to complete a promised basic journey.

**Acceptance:** Core onboarding and example newcomer needs complete without a subscription.

### ORI-BUSINESS-002 Institution purchase value

**Priority:** P1. **Initial status:** unverified.

Sell connected institutional guidance, administration, distribution, service operations and authorised integrations. Students retain personal privacy.

**Acceptance:** Institution entitlement grants service functions, not access to private chats.

### ORI-BUSINESS-003 Sponsorship boundaries

**Priority:** P0. **Initial status:** unverified.

Label sponsored access and advertising clearly, record campaign approval and separate placement from factual recommendations.

**Acceptance:** A sponsor cannot buy official-source status or silently reorder an evidence-based answer.

### ORI-BUSINESS-004 Billing readiness

**Priority:** P0. **Initial status:** unverified.

Define plans, entitlements, cancellation, renewal and support before enabling payments. Use sandbox transactions until a provider/account is approved.

**Acceptance:** The app cannot charge, renew or send invoices merely because a founder pricing field was edited.

### ORI-BUSINESS-005 Cost ceiling

**Priority:** P0. **Initial status:** unverified.

Track total actual operating costs against the founder’s 250 AED monthly target, separating one-off/annual store expenses and existing caps. Do not add provider assumptions together as a guaranteed bill.

**Acceptance:** A cost report lists service, cap, actual usage source, uncertainty and any externally required spending.

### ORI-BUSINESS-006 No automatic upgrades

**Priority:** P0. **Initial status:** unverified.

Leave existing money/search/email/voice caps unchanged unless specifically authorised. Never purchase a plan or paid library to make a test pass.

**Acceptance:** Blocked capacity is reported with an alternative or honest limitation, not silently paid for.

## LEGAL Privacy Terms and trust surfaces

### ORI-LEGAL-001 Complete policies

**Priority:** P0. **Initial status:** unverified.

Prepare full Privacy and Terms aligned to actual accounts, AI providers, research, files, voice, notifications, analytics, sharing, support and organisation roles.

**Acceptance:** Every policy statement maps to implementation; no obsolete private-trial/provider wording flashes.

### ORI-LEGAL-002 Operator details

**Priority:** P0. **Initial status:** unverified.

Do not publish the founder’s personal name/email from earlier messages. Suitable public operator/contact details remain a genuine publishing dependency if not supplied.

**Acceptance:** No invented legal entity, fake address or hidden personal email appears on public pages.

### ORI-LEGAL-003 Consent versions

**Priority:** P0. **Initial status:** unverified.

Version materially changed notices independently where appropriate, retain records and keep optional choices unticked or off until selected.

**Acceptance:** Refresh/account switch uses the correct recorded consent and a material change re-prompts only the necessary acknowledgement.

### ORI-LEGAL-004 Data rights and support

**Priority:** P1. **Initial status:** unverified.

Offer an actual contact/request route for data access, correction, export and deletion, with status and authenticated handling.

**Acceptance:** An unrelated person cannot request another user’s data through a guessed address/ID.

### ORI-LEGAL-005 Risk communication

**Priority:** P0. **Initial status:** unverified.

Clearly separate official facts, institutional guidance, personal records, community reports and AI uncertainty. Avoid blanket verified or anonymous claims.

**Acceptance:** The UI never turns successful page opening or aggregate counts into guarantees.

### ORI-LEGAL-006 Claims and affiliation

**Priority:** P0. **Initial status:** unverified.

No Oxford/Cambridge/Harvard/Heriot-Watt partnership logo/claim without approval. Northbay stays fictional/demo where used.

**Acceptance:** App/website/store materials match actual partners and configured services.

## SEC Security reliability and data integrity

### ORI-SEC-001 Authentication and authorisation

**Priority:** P0. **Initial status:** unverified.

Enforce same-origin protections, secure session handling, server-side roles, tenant checks, revocation and account-specific storage on every route.

**Acceptance:** Direct endpoint attacks fail even when hidden controls or IDs are manipulated.

### ORI-SEC-002 Secrets

**Priority:** P0. **Initial status:** unverified.

Keep API/signing/email credentials in server secret storage; never log, embed, commit, display or ask the founder to paste them into chat.

**Acceptance:** Secret scan and bundle/config review pass.

### ORI-SEC-003 Abuse and quotas

**Priority:** P0. **Initial status:** unverified.

Retain human verification and independent per-person/global/provider limits. Provide useful retry state without weakening guards for performance.

**Acceptance:** Bot/abuse tests and legitimate expired-check recovery both pass.

### ORI-SEC-004 Input and output safety

**Priority:** P0. **Initial status:** unverified.

Escape user-supplied HTML, names, filenames, links and CSV values; prohibit executable URLs and private-network fetches.

**Acceptance:** Hostile fixture set does not execute scripts, open internal services or expose unsafe contacts.

### ORI-SEC-005 Idempotency

**Priority:** P0. **Initial status:** unverified.

All saved effects, webhooks, submissions and retries have stable request identity where needed. A reconnect does not duplicate an event, ticket or charge.

**Acceptance:** Repeat each effect twice and verify one intended durable change.

### ORI-SEC-006 Backups and restore

**Priority:** P0. **Initial status:** unverified.

Document database/object-storage backups and prove a synthetic restore/migration path. Never automatically evict saved chats to make space.

**Acceptance:** Rollback preserves newer compatible user data or has an explicit restoration procedure.

### ORI-SEC-007 Offline integrity

**Priority:** P0. **Initial status:** unverified.

Cache only suitable app shell assets; private API/session/provider responses stay network-only. Unsynced drafts and saved permitted offline data are account-isolated.

**Acceptance:** Offline refresh does not reveal the previous account or pretend to send a message.

### ORI-SEC-008 Updates

**Priority:** P0. **Initial status:** unverified.

Offer a manual reload/update notice while protecting drafts. Version service worker/assets correctly and avoid two competing workers for the same scope.

**Acceptance:** An installed app upgrades without dropping a draft, attachment or saved plan.

### ORI-SEC-009 Dependencies

**Priority:** P1. **Initial status:** unverified.

Review pinned build dependencies, known high-severity audit findings and compatibility. Do not run a destructive automatic upgrade just to hide an audit count.

**Acceptance:** Unresolved material vulnerabilities are documented or block release according to impact.

### ORI-SEC-010 Incident controls

**Priority:** P0. **Initial status:** unverified.

Provide provider/push/integration kill switches, clear degraded-mode copy and a tested rollback record.

**Acceptance:** Disabling an optional provider leaves safe typed help or an honest temporary-unavailable state.

## APP Installed app and store readiness

### ORI-APP-001 PWA first

**Priority:** P0. **Initial status:** unverified.

Finish manifest, icons, theme, scope, install help, offline shell, updates, canonical links and guest/account restore on myorivia.app.

**Acceptance:** Installed app opens into the app, and university invites remain in the correct flow.

### ORI-APP-002 Native package scope

**Priority:** P0. **Initial status:** unverified.

Choose and document a wrapper/native approach that preserves web behaviour while supporting required camera, photos, microphone, location, notifications and deep links. Do not claim a wrapper alone guarantees store acceptance.

**Acceptance:** A reproducible package build and native integration plan exist with no fake signed build.

### ORI-APP-003 Build provenance

**Priority:** P1. **Initial status:** unverified.

Record bundle identifier, versions, supported devices, signing prerequisites, build tools and CI/artifact hashes. Credentials stay private.

**Acceptance:** Another authorised developer can reproduce the same unsigned build from the recorded source.

### ORI-APP-004 Store materials

**Priority:** P0. **Initial status:** unverified.

Prepare truthful app description, screenshots, privacy labels, age/content assessment, support/privacy URLs, review instructions and test access.

**Acceptance:** Materials contain no mock partnership, unsupported language promise or private-trial gate blocking reviewers.

### ORI-APP-005 Store account and signing dependencies

**Priority:** P0. **Initial status:** unverified.

Apple membership currently costs 99 USD per year, but enrolment, identity/legal entity, signing, build access, required metadata and review also matter. Do not describe payment as the only remaining condition without verification.

**Acceptance:** Each external dependency is marked satisfied or blocked with actual evidence, not assumed.

### ORI-APP-006 Deletion and authentication review

**Priority:** P0. **Initial status:** unverified.

Keep in-app account deletion and verify any authentication/store-specific requirements against current official guidance before submission.

**Acceptance:** Reviewer can find and complete the supported account deletion initiation path.

### ORI-APP-007 Native device verification

**Priority:** P0. **Initial status:** unverified.

Test installation, account switching, camera retake, dictation, location refusal, audio startup, push, safe areas, keyboard, offline and deep links on supported real devices.

**Acceptance:** Unperformed physical-device tests are recorded as unverified; the founder is not assigned every intermediate test.

### ORI-APP-008 Submission boundary

**Priority:** P0. **Initial status:** unverified.

Prepare all controllable assets and technical work; actual enrolment/payment/signing/submit steps remain with the authorised account holder and final approval.

**Acceptance:** No purchase, binding acceptance or store submission occurs just because this master prompt exists.

## QA Acceptance and release gates

### ORI-QA-001 Self-test before pilot

**Priority:** P0. **Initial status:** unverified.

Cleo runs current relevant unit/integration suites, syntax/build checks, static security checks and local UI scenarios before deploying the combined candidate.

**Acceptance:** No known failing required test is hidden behind a claim that unrelated suites pass.

### ORI-QA-002 Stable pilot candidate

**Priority:** P0. **Initial status:** unverified.

Deploy to isolated pilot with intended switches, migrations and explicit snapshot. Freeze the candidate while Ina reviews; later changes create a new version.

**Acceptance:** Ina knows exact source SHA, Worker version, schema migration and enabled features.

### ORI-QA-003 Independent deployed review

**Priority:** P0. **Initial status:** unverified.

Ina checks the actual deployed pilot plus relevant source/evidence. Local fixtures are not substituted for real provider/installed-device verification.

**Acceptance:** Review receipt labels source, scripted, live browser, real service and real-device evidence separately.

### ORI-QA-004 One founder acceptance

**Priority:** P0. **Initial status:** unverified.

After technical review and fixes, present one final guided review with clear test accounts, short scenario list and any honest external blockers.

**Acceptance:** No routine step in this specification requires founder approval/testing between individual components.

### ORI-QA-005 Fix and retest

**Priority:** P0. **Initial status:** unverified.

Reproduce failures, fix at the correct layer, add meaningful regressions and rerun affected checks. Recheck combined flows after shared-file changes.

**Acceptance:** A fix that restores one screen cannot erase another approved feature.

### ORI-QA-006 Production decision

**Priority:** P0. **Initial status:** unverified.

Only the founder approves production promotion after seeing the stable candidate. Cleo records settings parity, secrets left intact and rollback before deploying.

**Acceptance:** No pilot-ready declaration is treated as production approval.

### ORI-QA-007 Versioned receipt

**Priority:** P0. **Initial status:** unverified.

Produce one machine-readable and human-readable report: candidate identifiers, completed requirements, exact commands/results, unresolved blockers, source coverage and rollback.

**Acceptance:** Missing evidence keeps an item unverified rather than complete.

### ORI-QA-008 No fabricated certainty

**Priority:** P0. **Initial status:** unverified.

A green test badge proves only its stated test. No all-done claim if SSO credentials, device tests, privacy contacts, signed builds or store review remain unavailable.

**Acceptance:** The final readiness list says what is actually left, even when that is more than the store fee.

## Journey coverage catalogue

These are coverage families and synthetic scenario seeds, not unsourced prewritten legal instructions. For each family, the planner needs UAE and UK applicability, clear prerequisites, next action, safe research route and a fallback when requirements cannot be confirmed. Country-specific templates are separate where necessary. Generated plans are labelled drafts; reviewed templates carry evidence/review metadata. The goal is flexible coverage of new requests rather than pretending this finite catalogue contains every possible life event.

### Before moving

- Choose destination and arrival checklist. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Budget and cost planning. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Research suitable housing. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Travel and arrival preparation. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Document recognition and attestation research. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Family relocation dependencies. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Accessible travel planning. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Moving pets through official procedures. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

### Immigration and identity

- Understand university-managed visa stages. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Check missing application documents. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Residence medical appointment preparation. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Biometrics appointment preparation. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Track authoritative status and next owner. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Identity card delivery uncertainty. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Dependent applications. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Expiry and overstay risk escalation. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Replace lost identity document. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Renew or change a permit. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

### Education and families

- School curriculum and year search. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Compare evidence-backed schools. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- School admissions contacts and reviewed emails. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Transfer records and certificate checks. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Enrolment requirements. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Temporary education interruption. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- College or training institution search. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- New-child settling and language support. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Student wellbeing and belonging. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Parent support services. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

### University daily life

- Orientation and enrolment. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Find printers and printing steps. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Borrow a laptop or equipment. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Campus timetable and rooms. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Student support ticket routing. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Accommodation office and deposits. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Library access and study spaces. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Disability support and accessibility. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Student visa record questions. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Tuition payment and scholarship source checks. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

### Housing

- Find and compare lawful listings. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Viewing and deposit scam checks. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Understand a selected tenancy document. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Prepare landlord questions. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Move-in inventory. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Utilities setup. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Report repairs. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Move out and deposit return. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Student halls versus private housing. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Urgent loss of accommodation. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

### Transport

- Campus commute planning. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Driving directions handoff. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Public transport card comparison. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Accessible transport. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Missed train or last bus alternatives. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Learn local transport apps. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Lost while walking. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Airport to accommodation. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Licence recognition research. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Parking and transport charge questions. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

### Money and essentials

- Banking without completed local identity. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Compare bank requirements. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Sim and connectivity. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Utilities and bill reminders. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Affordable groceries. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Budget-friendly food and student spaces. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Understand an unexpected fee. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Protect against financial scams. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Work pay and basic budgeting. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Replacement card or lost wallet. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

### Health and wellbeing

- Find authorised healthcare services. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Insurance and appointment requirements. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Understand an uploaded appointment letter. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Medical-screening explanation. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Find pharmacy and opening information. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Mental wellbeing support routing. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Urgent help using verified local contacts. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Accessibility needs. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Settling anxiety and social connection. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Follow-up appointment reminder. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

### Work and adult administration

- Institutional employer onboarding. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Recognition of qualifications. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Tax/residency administration source checks. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Employment-document questions. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Professional licensing source checks. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Benefits and public-service eligibility research. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Family/care responsibilities. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Consumer complaint routing. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Legal-advice service finding. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Language support services. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

### Ordinary life and recovery

- Where people spend time locally. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Community recommendations with labels. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Meet people and find activities. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Lost item recovery. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Understand an important email. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Write a reviewed complaint or request. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Organise appointments. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Recover from a missed deadline. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Correct an earlier plan. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

- Leave a university or move to another country. Test the intended next action, a missing prerequisite, and an uncertain or stale source.

## Required test programme and evidence

Run the current repository’s own full checks rather than relying on an old count of 78 or 82. Add meaningful coverage for new requirements. Do not count text-search assertions alone as proof that a feature works. Unit tests cover pure logic; integration tests cover auth, SQL, storage, provider wrappers and effects; browser tests exercise the actual UI; real-service tests use approved capped synthetic inputs; physical-device checks cover capabilities an emulated desktop browser cannot prove.

The following matrix is mandatory acceptance coverage. Each row needs observed result, candidate SHA/version, environment, evidence path and any limitation. A scenario can map to several requirement IDs; an automated check is not silently substituted for physical audio or notification receipt.

| Scenario | Flow | Pass condition |
|---|---|---|
| A01 Fresh guest on phone | Choose guest, complete welcome, decline optional permissions, ask a useful question, refresh and return. | No duplicate welcome, loss of consent/draft or forced account. |
| A02 School discovery | Find British curriculum schools in Sharjah for Year 6; ask only these, more, all and a named school. | Relevant scope retained, new results, honest completeness and supported contacts. |
| A03 Housing pressure | New Manchester student has a Facebook room, pre-viewing deposit and urgent pressure; asks for a message. | Practical scam-aware help and draft to landlord without an institution detour. |
| A04 Nol comparison | Compare Gold and Silver card price/included value using current official material. | Every number attached to the correct subject; no price mixing. |
| A05 Calendar correction | Create a reminder, change time to noon, say what, then switch to I am lost. | Review correct proposal; no stale reminder loop; unrelated help understood. |
| A06 Calendar swipe | Swipe week strip horizontally, scroll vertically, tap dates, use arrows and RTL. | Exactly intended week/day changes; accessible alternatives work. |
| A07 Lost in French | French-speaking newcomer has a landmark and destination on a laptop, asks to return. | French help, no guessed route, usable maps handoff/show-someone card. |
| A08 Account switching | Remember A and B, draft/attach in A, switch to B during processing, use two tabs. | No A messages, images, voice, files, memberships or late response leaks into B. |
| A09 Institution admission | Admin invites student, approves, student uses a guide/date, then membership is removed. | Roles, context, calendar duplicate checks and access-loss handling are correct. |
| A10 Analytics inference | Compare exact reports around removals, opt-out and one completion in a small known group. | No forbidden individual completion inference; private marks remain useful. |
| A11 Documents | Synthetic photo/PDF, long/third/fourth document, compressed/encrypted/oversized input, Cancel/switch. | Bounds, consent, cost reservation, partial notice and scope remain correct. |
| A12 Library discoveries | Recommend services twice, automatically save useful entities, favourite one, remove one, reload. | Private deduplicated provenance; favourites distinct; original chat remains. |
| A13 Journey continuity | Offer a plan, decline; offer a different relevant plan, accept, finish a step and return from Chat. | Offer consent, useful dependency order and durable progress. |
| A14 Message versions | Edit a user question, regenerate twice, switch versions and reload. | Correct selected context/sources and no duplicate reminders or document reads. |
| A15 Feedback and share | Rate/report a reply; preview a selected share, exclude a private attachment, revoke link. | Real queues, clear receipts, minimal data and effective revocation. |
| A16 Voice | Dictate and edit before send; Listen in different languages, Cancel, replay and switch accounts. | No automatic send/play, correct voice/fallback and measured startup. |
| A17 Owner console | Owner navigates organisations, costs, feedback, content, limits and audit; student tries same APIs. | Actual data/actions for owner and firm denial for unauthorised actor. |
| A18 University publishing | Editor drafts, admin reviews/publishes, date expires and revision changes while student is reading. | Approval, revision conflict, freshness and membership checks work. |
| A19 Notification reliability | Opt in/out categories; send a synthetic pilot alert; sign out/leave/delete; replay a job. | Generic payload, no duplicates, correct DB/identity and honest delivery state. |
| A20 Installed app | Install, cold start, update with draft, offline read, reconnect, deep link and permissions. | Stable PWA behaviour, no cached private API data and truthful offline status. |
| A21 Failure and budget | Exhaust search/provider/email allowance, break a source/provider, timeout a call, fill storage. | No guessing, secret leakage, unreserved spend, eviction or false success. |
| A22 UAE and UK parity | Run equivalent housing, school, transport, university and official-process questions in both countries. | Correct jurisdiction and source class; no UAE-only assumptions. |
| A23 All intended languages | Run UI/auth/errors/status/action/voice matrix for all ten intended languages including RTL. | Supported versus unavailable components stated explicitly; quotes/user data untouched. |
| A24 Deletion and recovery | Delete chat/file/account in separate scenarios, fail cleanup/storage, restore synthetic backup. | Correct scope, durable deletion jobs, active-account preservation and verified recovery. |

Required adverse cases include malicious links/HTML, source prompt injection, cross-tenant IDs, direct API access, expired invitation, stale consent, session expiry, interrupted migrations, concurrent account switches, cancellation, silent storage failures, compressed PDF expansion, wrong source subject, partial streaming frames and exhausted caps. Use fictional identities and documents. Never perform destructive tests on real accounts or production data.

Performance benchmark protocol: use at least the same three classes of request on the same candidate/provider settings: ordinary no-research conversation or drafting, fresh multi-source research, and follow-up using already obtained evidence. Report per-run timings and stage counts. For a small sample, present individual measurements and median; do not invent a meaningful p95 from three samples. Include Listen first-play/replay separately. If the system is too slow, diagnose unnecessary model rounds and provider time before adding elaborate animations or weakening checks.

Do not reuse false-positive assertions as regression acceptance: the Step 9 reproduction originally asserted that the leak existed. Correct acceptance proves that staff cannot obtain the exact comparable counts. Similarly, a fake provider returning the desired answer proves parser behaviour, not a live model/source integration.

## Completion receipt and pilot handoff

The candidate report must include the following fields with real values:

```json
{
  "state": "PILOT_READY_OR_BLOCKED",
  "sourceSha": "actual SHA",
  "branch": "actual integration branch",
  "workerVersion": "actual pilot version",
  "environment": "isolated pilot",
  "migrationIds": [],
  "productionChanged": false,
  "requirements": {"verifiedIds": [], "unverifiedIds": [], "blockedExternalIds": []},
  "tests": [{"name": "actual command or scenario", "status": "pass or fail or unverified", "evidence": "path or receipt"}],
  "latency": {"sampleCount": 0, "runs": [], "limitations": []},
  "externalBlockers": [],
  "privacyNoticeVersions": [],
  "settingsParityChecked": false,
  "rollback": {"codeVersion": "actual prior version", "databasePlan": "actual plan"},
  "inaReview": "pending",
  "founderProductionDecision": "pending"
}
```

A script may validate the completeness and format of this receipt; it cannot prove facts by itself. Never fill in pass values just to satisfy a schema. Ina’s independent review cannot be self-issued by Cleo. The founder’s production decision cannot be inferred from a previous design approval.

## Tonight execution order

1. Record the current baseline, freeze stale merges and run the existing checks. Preserve the already integrated designs and paused staff totals.
2. Implement the new simple product gaps first: semantic amber links, calendar gestures, reliable message actions, automatic private discovery saves, plan offer/acceptance and secure account switching.
3. Build founder and university consoles as vertical slices with real data/actions, shared design and permissions; finish one slice through error/test states rather than drawing all pages with dummy metrics.
4. Complete the larger flows: journey architecture, feedback/share/versioning, remaining languages, voice/audio startup and measured research/streaming work, with controls and data retention intact.
5. Finish PWA/native preparation and policies as far as real resources allow. Record credential/legal/device/store dependencies once; continue other work.
6. Run combined local tests, integration and browser checks. Deploy one coherent candidate to the isolated pilot and supply the receipt.
7. Ina checks the deployed candidate and source. Cleo fixes findings and reissues the candidate if source changes. The founder then gets one final acceptance view and decides production.

If time expires, finish a safe stable pilot and leave a precise handoff. Do not ship an insecure account switch, exposed student data, fabricated analytics or a half-authenticated owner console to hit a time target.

## Deliberate external boundaries

Real university SSO/student/visa data requires an actual partner and authorised access. Email and push delivery need working configured services; platform acceptance needs actual device evidence. Legal operator/contact details cannot be invented or quietly replaced with the founder’s personal contact information. Signed iOS submission needs the authorised developer account, build/signing access and Apple review. The 99 USD membership is annual and is not a guarantee of acceptance. Native Android distribution has its own current requirements. These are honest dependency boundaries, not permission to leave implementable core features unfinished.

## Technical references checked on 22 October 2026

- Apple developer programme enrolment and current membership conditions: https://developer.apple.com/help/account/membership/program-enrollment
- Apple App Review Guidelines, including account deletion and meaningful functionality: https://developer.apple.com/app-store/review/guidelines/
- Better Auth multi-session plugin and version-sensitive integration: https://better-auth.com/docs/plugins/multi-session
- OpenAI input-token counting: https://developers.openai.com/api/docs/guides/token-counting
- OpenAI data controls and retention: https://developers.openai.com/api/docs/guides/your-data

The sources above substantiate technical/provider prerequisites only. They do not establish that Orivia has completed an enrolment, obtained a special retention agreement, implemented all integrations or passed a store review.

## Founder acceptance package

Show the founder three things, not hundreds of intermediate requests: the functioning pilot URL with exact version; a short guided tour of personal/student/admin/owner flows; and a truthful completion/blocker receipt. She should be able to see real controls and analytics, test one coherent newcomer journey, switch accounts, use Calendar/Library/Chat/Files/voice and understand what is ready for production. No pressure to approve a known defect simply because a deadline was set.
