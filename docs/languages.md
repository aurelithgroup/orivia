# English, French and Arabic: first UI pass — 19 October 2026

The welcome screen and Settings provide a saved app language. Arabic changes the root direction to RTL; switching back to English/French restores LTR. The language is included in chat preferences and the private assistant's state as reply_language. Source-policy keys, evidence identifiers and source quotes remain unchanged. The instruction allows a person to explicitly request another reply language.

Translation data lives in workers/trial-ui/translations.json. The small i18n runtime scans authored static HTML before chat history is loaded and remembers those nodes and attributes. It does not scan saved messages, input values, source excerpts or organisation records. Authored UI labels in chat.js opt in through uiText. Only named status/progress elements are observed; the chat transcript is not observed. Unknown strings fall back to their original wording. No translation service or paid request is added.

The embed tool prepends the runtime plus dictionary to the existing chat.js response. The standalone chat.js retains English fallback when the runtime is absent (including extracted-function tests). English remains the canonical internal value for language-independent profile choices; labels can be translated without changing saved values. Country names are regenerated with Intl.DisplayNames for the selected UI language. Display dates use the selected locale. Date/time input values remain canonical. Dictation gains an App language option; explicitly selected speech locales or Device language are preserved. Listen uses the selected French language for Latin-script replies; voice quality still depends on installed voices.

Tests cover repeated switches, saved preference, RTL/LTR, protected message/quote/value preservation, status text, provider preference, and the existing chat/calendar/dictation suites. These are scripted tests, not real-model translation accuracy or real-phone layout approval.

## Remaining scope

This is not a claim that all ten beta languages or every generated string is translated. Only English, French and Arabic are offered in this UI pass. Longer Journey guide content, some organisation/source-card composite labels, uncommon errors and dynamic progress suffixes can remain English. Source quotations and proper names deliberately retain their original wording. The legacy basic-mode add-reminder script remains English. Native browser permission prompts and date pickers follow the browser's own locale. Live model wording and accessibility/layout on real devices need review, especially Arabic and mixed-direction content.

Deploy as a narrow patch onto the existing private Worker, preserving its newer backend and settings. The public beta remains outside scope. Pre-change rollback version: e9f51684-f413-4314-a85e-979a273dd450.
