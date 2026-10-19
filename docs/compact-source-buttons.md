# Compact source links — private pilot UI only

Baseline: repository 9f8fe8c. The deployed pilot had newer embedded UI than the pushed source (red delete controls, progress display, compact facility rows and reminder UI). Its HTML/JS were recovered from the live bundle and preserved before applying this change; the unrelated backend was not reconstructed from the repository.

Change: numbered website links under each researched reply. Full titles, category labels, opened timestamps, quotes and applicability wording remain in a closed native “Sources and evidence” disclosure. Failure and unresolved notices remain outside the disclosure. Source validation, citations, research requests, model calls and storage are unchanged relative to the live UI baseline.

Verification: all 42 CI commands exercised. One calendar wording assertion also failed against the unmodified live UI; updated to its existing explicit phone-calendar instruction and rerun successfully. Research renderer tests check source destinations, accessible names, retained per-fact quotes, closed disclosures and visible failures. Existing cards and storage checks pass. A browser fixture preview confirmed source links and expandable metadata. No paid research calls were needed.

Rollback: the previous pilot version is ffed80fa-f402-480c-ba0f-1a8ea416a437, deployment ae703a79-4648-4a3d-8ca6-3ef93f2fe06a. Deployment replaces only embedded HTML and JS in that live main module, keeps backend logic, inherits bindings/settings, and does not deploy the public beta.
