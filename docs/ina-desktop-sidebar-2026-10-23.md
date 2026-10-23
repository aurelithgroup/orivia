# Desktop sidebar

Built on the candidate 9 hardening patch. The existing desktop chat sidebar can now collapse or reopen from a keyboard-accessible header button, and remembers that layout choice when local storage works. It contains Home, Chat, Library, My Life and Calendar controls routed through the existing tab handler. Current-page and expanded-state accessibility attributes are maintained. Existing mobile bottom navigation and chat drawer remain in use; collapsed desktop styling applies only from 1000px. Storage-management navigation reopens the desktop sidebar.

Verification: the existing 122-command combined CI suite passed after these UI changes. The newly added desktop-sidebar test passed separately and is now included in the CI workflow. It checks persisted state, toggling, blocked storage, mobile event isolation and destination controls. No visual browser, authenticated pilot or phone check is claimed. The full-suite receipt identifies the base revision and uncommitted working tree accurately.

No deployment, database migration, provider change or spending change. University onboarding, AI-generated guide packages, billing and new analytics are separate work and are not claimed complete by this patch.
