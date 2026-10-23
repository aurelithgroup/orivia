# Orivia metric definitions (ORI-METRIC-001)

Every number shown in the staff, owner and founder consoles, with how it is counted. Counts are computed on request from the live database, so there is no stored analytics copy and no separate retention. Retention follows the underlying records. Times are UTC unless stated. A test (`tests/metric-definitions.test.mjs`) fails if the server returns a metric that isn't listed here.

**What these numbers are, and aren't.** They are operational totals of records. They are not evidence of outcomes:
- a published guide is not a guide that was read;
- an accepted push is not an alert that was seen;
- a session created is not an active user.

Where Orivia has no measurement, the console says **Unavailable** or **Paused**, never 0.

## Founder overview (`GET /api/admin/overview`; verified platform owners only)

| id | Shown as | Counts | Source | Notes |
|---|---|---|---|---|
| `organisations` | Organisations | All organisation rows, split by status (active, paused) and demo flag | `organisations` | Demo means no real partnership. |
| `activeStudents` | Active students | Memberships with role `student` and status `active` | `organisation_memberships` | Per organisation: one person in two organisations counts twice. |
| `activeStaff` | Active staff | Memberships with role `admin` or `editor` and status `active` | `organisation_memberships` | Per organisation. |
| `joinRequests` | Join requests waiting | Memberships with status `requested` | `organisation_memberships` | Each organisation's admins decide. |
| `openInvitations` | Open invitations | Invitations not revoked, with `uses < max_uses` and `expires_at` after now | `organisation_invitations` | |
| `publishedContent` | Published content | Content rows with status `published` (current revision) | `organisation_content` | Not reads or views. |
| `draftContent` | Drafts | Content rows with status `draft` | `organisation_content` | |
| `feedbackOpen` | Feedback to review | Problem reports with status `open` | `feedback_reports` | Ratings are not counted here. `null` → **Unavailable** if the table is missing. |
| `budgets` | Budgets and usage | Per meter: amount counted against the day's and month's limit | OpenAI and voice: `spend_meter` (BUDGET_DB, shared by pilot and production; includes unsettled reservations). Searches: `research_usage` (this deployment's pool). Sign-in emails: `account_mail_meter`. | **Unavailable** when the limit isn't configured or the counter can't be read. Never estimated. UTC day and month. |

**Directory totals** (`GET /api/admin/orgs`, owner only) give the same counts per organisation: `students`, `staff`, `requests`, `published`, `drafts`.

## Chat feedback (owner feedback panel)

| id | Shown as | Counts | Source | Notes |
|---|---|---|---|---|
| `ratingsUp` / `ratingsDown` | helpful / not helpful | Current ratings updated in the last 30 days, one per person per reply | `reply_ratings` | A changed rating counts once, as its latest value. Deleted with the account. |
| `ratingReasons` | (reasons) | Not-helpful ratings with each optional reason, last 30 days | `reply_ratings` | |

## University overview (`GET /api/orgs/:id/summary`; that organisation's staff only)

| id | Shown as | Counts | Source | Notes |
|---|---|---|---|---|
| `members` | Members | Active student memberships in this organisation | `organisation_memberships` | |
| `waitingForApproval` | Waiting for approval | Student memberships with status `requested` | `organisation_memberships` | |
| `staff` | Staff | Active admin and editor memberships | `organisation_memberships` | |
| `joinedLast30Days` | Joined in the last 30 days | Student memberships created in the last 30 days that are active or requested | `organisation_memberships` | Rolling 30 × 24 h. |
| `invitationUses` | Invitation uses | Sum of `uses` over this organisation's student invitations | `organisation_invitations` | Uses of a link, not distinct people. |
| `publishedGuidesAndDates` | Published guides and dates | Published content of kind `guide` or `date` | `organisation_content` | |
| `tasks.*` | Needs attention | Join requests, drafts, published dates that have passed or have no date, upcoming dates (next 30 days), published contacts with no phone, email or website | `organisation_memberships`, `organisation_content` | Dates compare by calendar day against UTC today. |
| `progress` | Student progress | **Paused**: no counts are shown to staff | `organisation_progress` | Ina 1374ec9: exact totals allowed inferring one student's mark. |
| `views` | Guide views | **Unavailable**: views aren't tracked | none | Shown as "Views not tracked", never 0%. |

## Exports (ORI-METRIC-006)

- **What:** `GET /api/admin/export/organisations.csv` (verified owner only) exports the directory totals above.
- **Bounds:** at most 100 organisations, newest first, optionally narrowed with `?q=`.
- **Contents:** no member names, emails or personal records.
- **Formula safety:** every cell is quoted, and a cell beginning with `=`, `+`, `-`, `@`, tab or carriage return is prefixed with `'`, so a hostile organisation name can't run as a spreadsheet formula.
- **Audit:** each export writes a `platform_audit` row (actor, action, row count, filter length; not the filter text).

## Not yet defined

- **Not built:** product analytics beyond these counts (active users, journey completion, retention cohorts) (ORI-OWNER-005, METRIC-004/007).
- **Rule:** no number for these will appear until it is defined here, with a source and roles.
