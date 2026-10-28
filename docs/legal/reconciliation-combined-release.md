# Privacy and Terms: reconciliation for the combined release (Cleo, 29 October)

The drafts (`privacy-draft.md`, `terms-draft.md`) describe `myorivia-release-plan`.

Ina's `ina/founder-ai-sponsorship-block-3-2026-10-25` adds features that change what the policies must say. Its sources are `docs/restored-block-one-2026-10-25.md` and `docs/founder-commercial-block-3-2026-10-25.md` on that branch. These were read only; nothing was merged.

The combined release isn't decided yet: the deployment hold is on and reconciliation is pending.

**How to use the table:**
- For each row, the policy text follows **whatever is in the release**.
- The drafts carry the matching wording as `[INCLUDE IF RELEASED: …]`.
- Before publishing, each row is ticked against the released code and its tests. A `[TO CONFIRM]` or `[OPERATOR]` gap left open blocks publication.

| # | Feature | This branch | Ina's branch | What the policies need if it's released |
|---|---|---|---|---|
| 1 | **Data requests** | None. Requests go to the operator contact | In-app requests tied to the account, with owner replies (`/api/me/data-requests`, `/api/admin/privacy-requests`) | Privacy: describe the in-app route, what's stored (type, message, status, reply), who reads it (the owner), and that it's deleted with the account. Keep the contact route for people without an account |
| 2 | **Support tickets** | None for universities | University tickets and replies. A **separate, explicit permission** forwards ticket text to platform support. It can be withdrawn, even after leaving. Personal chats and files are never attached | Privacy: what university staff and the owner see, the separate permission, and withdrawing it. Terms: support is best-effort |
| 3 | **Partner applications** | None | Named, expiring invitations; the setup form; founder review; approval creates the university and its first admin | Privacy: a section for university contacts (not students). The recipient's email and the submitted details are kept for the application. Retention is **[TO DECIDE]** |
| 4 | **Sponsored placements** | None | Owner-reviewed campaigns, with disclosure required. Only active members see approved placements. No member identities go to sponsors. **No renderer yet** | Privacy: no member data goes to sponsors, and there's no tracking (re-check if clicks are counted). Terms: labelled as sponsored; never official, never evidence, never ranking. **Only if a renderer ships** |
| 5 | **Plan allowances (Free/Plus/Premium)** | None | Non-billing allowances, off by default, with expiry; existing files are kept on downgrade | Terms: what each allowance means, and that the basics stay free. Payment terms only once billing exists (deferred) |
| 6 | **In-app notices** | None | Approved notices shown by audience and date. No email or device push | Privacy: notices are shown in the app only. Nothing to add for data, since no tracking is described |
| 7 | **Response diagnostics on the device** | None | Off by default; this device only; per account; at most 100 samples or 7 days; no messages or identity in exports | Privacy: optional and on the device only. Nothing is sent unless the person exports it **[TO CONFIRM: where an export goes]** |
| 8 | **Profile sharing** | "About me" switch for chats | A server-owned allowlist, plus guidance on family privacy | Privacy: list exactly which About me fields can reach the AI (from the allowlist), replacing "About me details" |
| 9 | **University guide drafting** | URL/file drafting tool (exists) | Public URLs and institution-supplied PDF or image transcripts make drafts for staff review; staff AI consent is required | Privacy: university staff documents go to OpenAI when staff choose this, with their consent. Not student data |
| 10 | **Founder drafts** | None | Owner-only draft briefs. **Not** AI requests and not sent anywhere | Nothing to add unless a model-backed version ships (it would need its own consent) |
| 11 | **Student progress totals** | **Paused** | **Paused** (same code) | Privacy says universities don't see totals. If they're switched on later, describe exactly what staff see; no anonymity promise |
| 12 | **Checked-answer stream** | Ina's transport brought in (`064e6f1`) | Same | Nothing to add. Cancellation doesn't change what's sent before Stop |
| 13 | **Server error references** | Unexpected failures logged with a reference, route and cause (`1c76c87`) | Not yet | Privacy ("Keeping Orivia safe"): technical logs include a reference, the route without identifiers, and an error type, never content |
| 14 | **Email-code delivery outcomes** | Codes hashed, 5 minutes, 5 attempts | Records honest delivery outcomes | Privacy: whether delivery status is stored, and for how long **[TO CONFIRM]** |

## Order before publishing

1. Decide what goes into the combined release: the founder and Ina, after the source of the pilot's `abf5b831` is found.
2. For each row that's in the release, swap the `[INCLUDE IF RELEASED]` text for final wording and tick the source.
3. Fill in the `[OPERATOR]` details and close every `[TO CONFIRM]`.
4. Ina reviews. Then publish, never before.
