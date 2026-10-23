# Organisation arrival — private pilot

## Admin setup

Apply `workers/accounts/arrival-migration.sql` to the separate accounts database before deploying the updated module. This only creates an empty configuration table; it does not change memberships or personal data. In the organisation dashboard, an admin opens Student welcome and sets destination country, emirate/nation, campus town and move reason. Saving requires a sign-in within 15 minutes and uses revision checks plus an audit entry. Configuration is public on the branded welcome; never put private details there. Use separate organisation entries for campuses with different destinations.

## Student arrival

New student invitations produce `/?organisation=SLUG#join=TOKEN`, including in their downloadable QR. Staff invitation links stay on /platform. Existing links remain usable in their original flow. Public QR codes retain their separate public-content purpose and do not grant membership.

The branded page loads only public organisation metadata and campus defaults. The fragment is moved to sessionStorage and removed from the address. Tokens are never put in query strings, localStorage, personal profiles or AI messages. The pending invitation remains through email-code sign-in in the same browser tab. The pilot still only delivers codes to its two configured test addresses. University SSO is explicitly labelled unconnected, not imitated.

After sign-in, a valid student invitation and an explicit request are required. A user without a valid invitation is directed to university staff or personal Orivia. A new user completes personal onboarding with university destination and reason visible but disabled. Existing personal vaults are not overwritten. Missing campus settings block institution setup rather than inventing a destination.

Pending members see a waiting page and can use My Orivia. Approved students see their organisation’s published guides, dates, contacts and updates. Private content remains server guarded; membership revocation is enforced on every fetch. My Orivia remains accessible. Staff are directed to the dashboard instead of being treated as students.

The institution receives membership name/email, not personal chats/plans. These boundaries are shown before requesting membership. Notifications and university database/application progress integration remain unconnected.

## Validation and limits

Automated local Better Auth/SQLite tests cover role checks, public-only configuration, revision conflicts and real scannable invitation QR payloads. Scripted browser tests cover the fragment surviving sign-in, explicit membership requests, locked fields, pending access, approved content and personal exit. Live university SSO and physical-device QR/sign-in still need testing; they are not claimed by these tests. Private-pilot deployment only; no public promotion or new paid service.
