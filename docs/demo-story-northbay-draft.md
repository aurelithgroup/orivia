# Demo story: Northbay University (draft for the founder, Cleo, 28 October)

This is a draft for the founder to approve or edit. It runs about 10 minutes. Every person in it is fictional, and their accounts exist only in the pilot's test accounts database. Nothing is based on a real student.

Each scene says whether it **works today** or depends on work in `docs/week5-7-plan.md`. Rehearsals need the deployment hold lifted. Until then, scenes are checked in the local harness only.

## People (all fictional)

| Role | Name | Account |
|---|---|---|
| Incoming student | Aisha Rahman, moving from Manchester to Sharjah for a master's | `aisha@demo.example.test` |
| Family variant | Mariam Khalil, starting a PhD, moving with two children (8 and 13) | `mariam@demo.example.test` |
| Northbay staff admin | Omar Haddad, Student Hub | `omar@demo.example.test` |
| Northbay staff editor | Priya Nair, International Office | `priya@demo.example.test` |
| Owner | The founder's own pilot owner account | (existing) |

Northbay University (Sharjah) is already the pilot's demo organisation (`demo: true`). The student contact on screen is the harness value "Student Hub, hub@northbay.example".

## Scenes

| # | Scene | What the audience sees | Status |
|---|---|---|---|
| 1 | The front door | myorivia.app with the phone preview of the app | Works today |
| 2 | Aisha joins | QR → `/join/northbay` → guided Northbay welcome → locked campus fields, consent, waiting screen | Joining works today. The guided welcome is planned for week 6–7 (area 22) |
| 3 | Omar approves | The staff dashboard, a request, Approve. Aisha's app now shows the Northbay space next to My Orivia | Works today |
| 4 | A real question | Aisha asks "How do I get my Emirates ID as a new student in Sharjah?" She gets a researched answer with opened, quoted official sources, then a follow-up | Works today. Research checks are week 5 (area 4) |
| 5 | Accuracy | "Which nol card should I get, Silver or Gold?" Each price is attached to the right card | Works today (fixed 22 Oct) |
| 6 | Aisha's plan | The residence-visa guide becomes her plan: step states, "what comes next", Undo. Then a before-you-move document checklist and a confirmed deadline with a reminder | Plan steps work today. The checklist and deadline reminders are planned for week 6 |
| 7 | Mariam's family | One overview with a plan for each child, plus a school-start step | Planned for week 6 (family planner). The school-return guide only if review is on time |
| 8 | Priya drafts a guide | She pastes a Northbay web page, gets an editable, sourced draft and a student preview, then publishes | The drafting tool exists. Editable, sourced output is planned for week 7 (area 21) |
| 9 | A date changes | Priya moves the visa medical date. Aisha sees both times and "Update my calendar" | Works today (UNI-006) |
| 10 | Getting help | Aisha asks the Student Hub for help. Omar assigns it to the International Office | Tickets work today. Assignment is planned for week 7 (area 24) |
| 11 | Privacy | Omar tries to see Aisha's personal chats and can't. Direct requests are refused too | Works today (tenant matrix tests) |
| 12 | The owner view | `/manage`: access check, this month's cost against AED 250, an error reference looked up | Owner access works today. Costs and error references are planned for week 5 and the essential operations |

## Backups for the live demo

- **Research is slow or fails (scene 4):** show the honest failure message, then a screenshot of a rehearsed answer, labelled as such.
- **Email codes:** every account is signed in before the demo, because sign-in codes count against the 10/day cap.
- **Device alerts:** push stays off. Reminders are shown in the app, not on the lock screen.

## For the founder to decide

1. The names, and whether Aisha comes from Manchester (UK→UAE) or a UK route is shown instead.
2. Whether Mariam's family scene stays in, if week 6 runs long.
3. Whether the audience sees the owner view (scene 12) or just hears about it.
