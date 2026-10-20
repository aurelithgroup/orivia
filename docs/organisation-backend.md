# Organisation foundation — Northbay first flow

This is the backend for the approved owner → organisation admin → invitation → student request → approval → institution space flow. It is saved code and locally exercised behaviour, not a live organisation service. No deployment, email, billing, sponsorship or university-system connection is activated.

Cleo's `prototypes/northbay-demo.html` remains a clearly labelled, in-memory design prototype. Its persona buttons are not an authentication mechanism. Its sample QR drawing is not the production QR generator.

## Identity and access

One Better Auth identity owns personal data; `organisation_memberships` assigns one role per organisation. `platform_roles` is separate. All decisions are made from the server-validated session and database, never a client-supplied role, email or selected persona. Verified email is required, but an organisation email domain grants no membership or staff role automatically.

- Owner: create organisations and invite the first named admin. This role does not grant access to member lists, application records or personal vaults.
- Organisation admin: publish content, invite editors/students, approve or reject students, remove non-admin members and create public codes. No automatic application-record access.
- Editor: create drafts and public-information QR codes. Cannot edit published material, publish, invite, approve, list student identities or access application records.
- Student: read the organisation's published member space only after approval. May leave; personal vault remains untouched.
- Application-record permissions, analytics ingestion, progress sharing, support attachments and sponsorship billing are not implemented. APIs report unavailable/deny instead of fabricating information.

`/api/account` deletion refuses the sole platform owner or an organisation's sole admin. Admin transfer and general role reassignment are future work; operators must arrange a reviewed transfer before such accounts can be deleted. Removed members cannot rejoin themselves with a cohort link. Explicit reinstatement is future work.

## Setup and first owner

1. Finish the provider setup described in `docs/accounts.md`. No real email/Google callback has been tested in this change.
2. Apply `workers/accounts/schema.sql`, then **`workers/accounts/organisations.sql` to the separate ACCOUNTS_DB**, never BUDGET_DB. The latter SQL is additive and uses IF NOT EXISTS; it does not read or alter the personal vault.
3. After verifying the founder's real account, assign its exact user ID the owner role through a trusted database operation:
   `INSERT INTO platform_roles(user_id,role) VALUES (?, 'owner');`
   Bind the verified ID. Never expose a web bootstrap endpoint, infer ownership from a name/email, or seed the fictional demo personas as real privileged accounts.
4. Enable `ORGANISATIONS_ENABLED=1` only in the isolated account test deployment with `ACCOUNTS_ENABLED=1`, the correct HTTPS `ACCOUNTS_ORIGIN`, secret and provider. Keep private Cloudflare Access protection during testing. Public-beta account configuration currently remains disabled.
5. Build with `npm ci --prefix workers/accounts --ignore-scripts`, then `node workers/accounts/build.mjs`. Deploy the accounts module through the reviewed private integration, preserving newer live research/calendar code. Do not full-rebuild/deploy an older checkout over the current live app.
6. Open `/platform`. This is a separate integration console using the real signed-in session, not the final branded dashboard or a persona simulator. It supports the first flow through the real APIs. Cleo's final dashboards should consume the same contract below.

No new live database, provider, owner privilege or feature flag was created by this implementation. The founder's verified account ID is not yet available, so no live owner was bootstrapped.

## Data contract for Cleo

All requests are same-origin, credentials included, JSON. Mutations require Origin matching ACCOUNTS_ORIGIN and `X-Orivia-Account` matching the current session user ID. Changing accounts in another tab cannot apply an old user's actions. Lists are bounded (100 content/codes/invitations/organisations, 200 members); pagination is not implemented yet. Do not label those responses exhaustive above the limit.

| Action | Endpoint | Request / response |
|---|---|---|
| Current account | GET `/api/account/session` | `{user:{id,name,email}}` |
| Space switcher | GET `/api/me/memberships` | `{platformRoles,memberships:[{organisationId,name,slug,demo,role,status}]}` |
| Owner organisation list/create | GET/POST `/api/admin/orgs` | Create `{name,slug,city,demo}` → `{organisation}` |
| First admin invitation | POST `/api/admin/orgs/:org/admin-invite` | `{recipientEmail,label?,expiresInSeconds?}` → invitation result |
| Revoke first-admin invitation | POST `/api/admin/orgs/:org/admin-invites/:invite/revoke` | `{}`. Revoking a token does not remove an already accepted membership. |
| Staff overview | GET `/api/orgs/:org/summary` | Organisation, operational membership counts; analytics and records explicitly unavailable |
| List/create invitations | GET/POST `/api/orgs/:org/invitations` | Create `{role:'editor'|'student',recipientEmail?,label?,expiresInSeconds?,maxUses?}` |
| Revoke invitation | POST `/api/orgs/:org/invitations/:invite/revoke` | `{}` |
| Inspect invitation | POST `/api/invitations/inspect` | `{token}` → organisation, role, expiry, availability, approvalRequired |
| Accept/request membership | POST `/api/invitations/join` | `{token}` → `{membership:{organisationId,role,status}}`; students requested, named staff active |
| Member list | GET `/api/orgs/:org/members` | Admin only: names, emails, roles, status |
| Approve/decline | POST `/api/orgs/:org/requests/:user/decision` | `{decision:'approve'|'decline'}`. Approval rechecks invitation validity. |
| Remove non-admin member | DELETE `/api/orgs/:org/members/:user` | `{}` |
| Content list/create | GET/POST `/api/orgs/:org/content` | Create `{kind:'guide'|'contact'|'date'|'update',title,body,visibility:'public'|'members'}`; always draft |
| Edit/publish/unpublish | PATCH `/api/orgs/:org/content/:id` | `{revision,title?,body?,visibility?,status?}`. Published edits/admin publication require admin. Revision conflicts return 409. |
| Public QR list/create | GET/POST `/api/orgs/:org/codes` | Create `{label,contentId?}`. Specific target must already be published and public. |
| Retrieve public QR | GET `/api/orgs/:org/codes/:id` | Staff only; returns the public URL and QR. Withdrawn codes return 410. |
| Withdraw public code | POST `/api/orgs/:org/codes/:id/revoke` | Admin only, `{}`; idempotent, audited, stops public resolution, keeps memberships. |
| Resolve public code | GET `/api/public/codes/:id` | Only current published public content; `grantsMembership:false` |
| Public organisation page | GET `/api/public/orgs/:slug` | Published public content only |
| Student institution space | GET `/api/me/orgs/:org` | Published content, `personalDataShared:false`, progress explicitly unavailable |
| Leave organisation | DELETE `/api/me/orgs/:org` | `{}` → `{left:true,personalDataChanged:false}` |

Invitation result: `{invitation:{id,role,label,expiresAt,maxUses},token,joinUrl,qrSvg}`. Raw token returned **once**, then only a SHA-256 hash is stored. Staff invitations require a matching verified email and one use. Students may use a cohort invitation up to its configured limit (default 50, max 500). Lifetime defaults to 7 days and cannot exceed that. Joining twice does not consume another use. Expired/revoked invitations cannot create new memberships or approve waiting requests.

Invitation links use `/platform#join=TOKEN`; fragments do not become server URL paths. The console sends tokens in JSON request bodies, never GET URLs. Do not log request bodies or invitation links, send them to analytics/AI, or include them in support requests automatically. `qrSvg` is generated by the pinned QR library, not a decorative pattern. A public code result is `{code:{id,label,url,qrSvg,purpose:'public',grantsMembership:false}}`; its URL resolves through `/platform?publicCode=ID`.

Error status: 401 sign in; 403 wrong role/identity/origin; 404 unknown/inaccessible record; 409 conflict/stale state/account changed; 410 expired/revoked; 413 body too large; 503 accounts/organisations unconfigured. Keep pending and expired screens distinct. Treat all content as plain text, not innerHTML.

## Persistence, revocation and audit

The dedicated account database holds organisations, memberships, hashed invitations, plain-text content, public codes, platform roles and a minimal action audit. Join insertion, capacity consumption and audit are one D1 transaction, with a unique request nonce preventing replay consumption. Content mutations and their audit run together; an audit failure rolls the change back. No audit contains message bodies, invitation tokens or personal-vault contents.

Public resolution checks current publication and visibility every time. Unpublishing or making content member-only stops an old public code exposing it. Leaving/removal prevents subsequent member API access. Previously viewed/downloaded content cannot be remotely erased from screenshots or an offline device; the final UI must explain stale downloads and clear its member cache when it next reconnects. This integration console does not persist member content to localStorage.

## Validation and remaining release work

`tests/organisations.test.mjs` exercises the full flow through the actual Better Auth library with hashed single-use OTP sign-in, secure sessions and real SQLite behind a transaction-capable D1 adapter. Email is a captured outbox; no real messages are sent. Tests attempt forged roles, stolen staff invitations, access across organisations, editor publishing, reading application records, wrong-origin and stale-account mutations, revoked/expired/exhausted invitations, stale content edits, audit failures and leaving while preserving the personal vault. The generated invitation and public QR images are decoded independently in tests and must resolve to their exact intended links. Existing authentication tests still pass. This is not a real Cloudflare D1 deployment or external-provider test.

Before enabling for real organisations: complete actual provider and D1 tests, review admission/fresh-session/rate-limit requirements, finish role transfer/reinstatement and pagination, exercise simultaneous admissions against real D1, and connect Cleo's final UI to this API. External university records require a separately authorised integration and granular access model. No organisation-facing analytics should be populated from personal chat text.
