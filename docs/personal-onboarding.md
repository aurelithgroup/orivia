# Personal onboarding — private pilot

The initial unauthenticated screen is sign-in, with sign-up and guest entry. Email is a one-time-code flow: new verified emails create an identity; existing emails restore one. Delivery is still restricted to the two configured test destinations.

A new account explicitly chooses whether to import guest categories, then completes personal setup. Fresh guests get the same personal setup without a server account. Setup collects an optional preferred name, origin country/town, planning/already moved, UAE/UK/unsure destination, emirate/nation and town, and study/work/family/other/unsure reason. It writes the existing My Life field shape. User-entered values remain unchanged when language switches.

Two unchecked pilot acknowledgements precede saving. Readable pilot terms and privacy information are on the screen, in English/French/Arabic. Completion/version/language are stored in the personal profile. AI consent and any required human check are mounted inside setup before its final button. Existing controls are moved, not copied. Entry requires successful configuration loading, explicit AI consent, and successful human verification when required. The obsolete welcome page is not opened. Returning users without session consent get a brief integrated consent screen instead. Final public terms and policy review remain open.

Existing account vaults and guests with saved personal data skip the new setup rather than being reset or overwritten. Guest data is never automatically imported. No microphone, location, camera, notification permission or email is requested by merely viewing setup. Notification delivery is not connected, so there is no misleading permission button.

Organisation-branded onboarding, campus-locked defaults, university SSO and notifications remain separate follow-up work. This change does not implement them. The separate /platform invitation flow is unchanged.

Validation: scripted client tests cover sign-in/sign-up navigation, new guest onboarding, unaccepted acknowledgements blocking saving, correct profile field persistence, existing data preservation, import opt-in, returning guests skipping setup and language switching without removing input fields. Account/organisation backend regression suites use real Better Auth with local SQLite and synthetic identities. Physical-device and visual browser validation remain outstanding.
