# Approved design pass — Ina handoff

Founder approved all six items in Cleo's shared Orivia Design Pass. Based on release commit 6e4420e; separate worktree and branch, no deployments, data migrations or changes to limits/secrets.

Implemented:
1. Header: menu and wordmark stay together; right-side navigation owns the remaining space. Removed the mobile rule adding auto margins to every icon, and the shared nav rule hiding the wordmark. Existing signed-in account menu still contains Settings on narrow screens.
2. Calendar, Settings and empty Chat use the same serif page-title family/size as Library/My Life.
3. Agenda cards: one quiet native expandable Add to calendar control, with Google and clearly labelled Outlook/Apple calendar-file handoffs. Removal is in a separately labelled More control and retains two-tap confirmation. No saved record changes on opening a control.
4. Chat speaker labels remain in screen-reader text but are visually hidden, including thinking status.
5. Country photo caption reflects the country rather than implying the saved city. Recent chats heading and current guest/account wording.
6. Settings language label is screen-reader-only beneath its single heading; install action is Add to home screen; account/notifications navigation rows have decorative arrows.

Added French/Arabic for new strings. Existing device-specific calendarLinks used by other flows is unchanged. Re-embedded source page/chat/nav/translations/photos using the existing embed tool.

Validation: 12 relevant suites passed: settings-calendar, home-dashboard, home-destination-photo, navigation, installable, chat-history, calendar-changes, library, i18n, public-release, myorivia-release and design-pass. New test verifies encoded calendar details, export notice, two-tap deletion and unchanged source reminder. Added to CI.

Browser QA uses actual HTML/CSS, navigation and eventRow helpers with explicitly synthetic data, without backend/account calls. Reviewed 390px dark calendar/Settings/Home/Chat and a 320px light signed-in header. Body and header measured 320px with no horizontal overflow. Clicked the expandable calendar control and observed all three choices. This is local fixture QA, not a live pilot or real-device acceptance check. Full app integration remains for Cleo on pilot.

Integration: cherry-pick this commit; run node tools/embed-trial-ui.mjs if other UI work has since landed; run combined tests; deploy to pilot first. Cleo remains sole deployer. No dashboard restyling is included; it was explicitly a later, separate design item.
