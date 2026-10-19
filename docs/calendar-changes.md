# Calendar change proposals — 19 October 2026

The private assistant can propose an update or deletion using `calendarChange`. It sends a target phrase, requested date/time/title and flags for missing details. It cannot read or change the saved calendar. The response asks the person to review; it does not claim an action already happened. The new-reminder route stays separate.

On the device, a target phrase is matched to reminder titles. Pronouns can refer to the latest reminder card in the same chat. Several matches require selection. No match shows the available reminders to choose from; it never silently picks an unrelated one. Date/time/title can be reviewed before saving. Unspecified fields are preserved. Ambiguous times are left blank when the model sets needsTime; interpretation quality still needs live conversation checks.

Updates retain ID and alarm; deletions require the explicit red confirmation button. Undo restores the previous reminder only if nobody has changed it since. Proposals and Undo state are saved with the chat. Actions re-read device storage, reject stale snapshots, and verify persistence before showing success. Unreadable storage is not overwritten. The existing created-reminder card now shows the current event's details and removes its obsolete creation Undo after an edit.

Only Orivia's local calendar changes. Previously exported Google/Apple events and phone alarms are not synchronised. Every change card says so. No saved event list is added to any provider request or consent.

Tests use scripted model choices and a DOM/storage harness: matching, ambiguity, edit without duplication, delete/Undo, missing time, failure and silent writes, stale data and no calendar disclosure. Real model interpretation and real phone calendars are not validated by those tests.

Deploy as a minimal patch onto the existing live bundle. Its reminder and time-zone logic is newer than the checkout. Rollback point before this task: 1f3dea8b-5f69-42c0-a199-6d70de858ffb. Public beta stays unchanged.

# Deferred Listen work

Founder agreed to test natural AI-generated voices later, not on 19 October. Up to 10 AED/month is allocated within the existing overall budget. Generate a small sample for review before enabling ongoing speech. No speech provider, charge or subscription was enabled as part of this calendar task.
