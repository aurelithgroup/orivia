# Accounts readiness review — 20 October 2026

Scope: private pilot; no paid services or public release.

## Recovery and privacy

- Confirmed by user previously: personal reminder sync across two sessions.
- Automated real Better Auth / SQLite tests: same email restores identity; concurrent writes conflict rather than overwrite; revoked sessions fail; deletion revokes other sessions and removes the personal vault.
- Fixed: synced logout and successful deletion now clear every key in the current account namespace, including recovery backups. Guest records and other account namespaces remain untouched.
- Unsynced logout intentionally preserves its account copy only after explicit confirmation; sign-in is required to reopen it through the app. Browser storage is not encrypted by Orivia and local/device access can reveal it.
- Fixed: an old review cannot apply data after account switching or after newer local edits.
- Export is the current device personal copy, including unsynced changes. It is not a complete export of organisation records, audit history or all service data. Downloaded files must be managed separately.
- Logout, revocation and deletion cannot remotely erase offline copies or downloads on other devices. These limits are stated in the account screen.

## Permission checks

The organisation regression suite covers student/editor/admin/owner boundaries, cross-organisation requests, invitation expiry/revocation, role handover, and preserving personal vaults. Application records remain unavailable. Platform owners do not automatically gain organisation staff access.

## Release gates still open

- Real device and multi-tab checks, including an already-open tab after remote session revocation.
- Public email delivery and provider setup; only two verified test addresses currently supported.
- Full privacy/retention policy, organisation audit retention, owner recovery procedure, and broader data-access/export process.
- Account UI localisation and accessibility/device review.

No claim of public account readiness follows from this review. Automated checks use synthetic accounts and do not modify real user memberships or data.
