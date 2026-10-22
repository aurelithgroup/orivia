# Library design handoff — 22 October

Founder direction: replace the narrow Files destination with **Library**, a home for personal files, saved guides/journeys and shortlists. Proposed bottom navigation: Home · Chat · Library · My Life · Calendar. This is an interactive design prototype, not a live data migration or an approval to deploy.

## Preview

`prototypes/ina-library/index.html` is self-contained with fictional items and no external resources or backend calls. Open it directly in a browser. Search, category tabs, item details, sample rename/pin/removal, a light/dark switch and local-file selection work in memory. Reload restores the fictional items and loses any selected local file. Upload/camera pickers do not send files anywhere. AI, full guide catalogue, cross-page navigation and download integrations are explicitly described as pending.

The All view combines the three item types; Files filters photos/documents, Guides combines saved journeys and their existing progress, Shortlists groups options saved from chat. A continue card highlights one in-progress guide. File preview offers Use in Chat, guides show steps and progress, shortlists offer Compare in Chat. These Chat actions describe the future handoff without pretending a request has been sent.

My Life remains the profile/settings destination. Home can keep recent-item and in-progress shortcuts, linking to Library rather than duplicating storage. University spaces retain their own published content and staff controls.

## Integration boundaries for Cleo

1. Make Library a **view over existing records**, not a new duplicate store. Use existing account/guest storage and preserve ids, original source metadata and all journey progress. Do not delete Journeys state or silently copy it over.
2. Shortlists currently belong to specific chats. Use stable references to those saved organisations/choices, with an origin-chat link and original checked date. Removing an item from a shortlist is not deleting its school, source, or original chat. Decide how a deleted origin chat affects the reference and show an honest unavailable state.
3. Files use the real private authorised routes/guest IndexedDB. Do not persist temporary blob URLs or make public URLs for thumbnails. Missing/deleted files show unavailable previews. Keep rename/download/deletion and limits enforced by the backend.
4. No automatic provider transmission from viewing Library. Use in Chat/Compare must identify the selected material and follow its explicit consent/context path. One-document-per-message and existing data limits still apply until intentionally expanded.
5. Organisation-protected guides remain subject to current membership/publishing checks. A private Library bookmark does not confer permanent access or authorise sending all university content to AI. Label origin and availability separately from personal files.
6. The actual app's shared header, account/space switcher and alerts stay intact. This prototype's small illustrative header is not a replacement authentication shell. Use the real brand mark rather than copying the illustrative preview mark.
7. All copy needs supported-language/RTL integration. Native dialog focus/Close/Escape, tab keyboard navigation, visible focus and narrow-screen reading need to survive integration. Recheck dynamic counts from actual data, pending/error/empty states and account-switch races.
8. File/AI privacy and Step 7 fixes remain separate release conditions. Design approval must not be described as backend approval.

## Verified in the local browser

- All/category switching; a saved shortlist opens its fictional candidates and labels them as samples.
- Search returns the expected welcome file; unmatched search gives a clear-search empty state.
- Desktop three-column view and 390px iframe two-column view. The phone iframe's effective inner viewport was 375px, with no horizontal shell overflow.
- JavaScript syntax check passes. No actual uploads, AI processing, real-camera permission, database writes or production deployment tested or performed.

Sample guide steps are illustrative, not legal/medical/immigration requirements. They must never replace reviewed journey content during integration.
