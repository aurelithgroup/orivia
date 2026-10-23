# Buddy Lab — mentor demonstration and test notes

Development branch: `feature/proactive-requirements`. The live `main` website has **not** been changed.

## Demonstration (fictional profiles only)
1. Open Orivia from the development branch in a local/staging preview. Press **Try Orivia Buddy**.
2. In **My Life**, answer **Yes** to arranging residency for dependants.
3. Watch the next question change to school enrolment. Answer **Yes**.
4. Answer **Yes** to foreign-issued school records. Notice the relevant checks appear without having searched for a document guide.
5. Mark a check **Waiting for a reply**. Close and reopen Buddy Lab and confirm the waiting state remains.
6. Open **Ask Orivia**, choose a prompted question, and see why a check appeared.
7. Change the conversation tone in **About me**. Confirm the action status is unchanged.
8. Switch goal to **Student life**. Confirm different checks appear; switch back and confirm previously tracked family check states return.
9. Delete Buddy Lab answers, confirm all demo information resets.

## Safety limitations
- Guidance is not independently verified immigration advice. The requirements registry, current official-source citations, reviewer process, and expiry checks are **not yet implemented**.
- User status `checked` means the user says they checked it; never claim an authority confirmed completion.
- No real user accounts, cloud sync, live transport, official government integrations, or background notifications.
- Do not enter names, IDs, documents, specific immigration dates, or information about real children.
- Buddy Lab currently saves only a few structured answers to browser localStorage.
- The dialogue is structured prompts, not open-ended AI reasoning.
- Offline caching and browser/mobile experience still need hands-on validation.

## Logic checks performed
11 small JavaScript state and scenario checks passed: family/student branching, next questions, waiting/checked statuses, persistence, tone changes, goal switching, invalid-status rejection, and syntax. These are **not** substitutes for end-to-end browser tests.

## Validation with Mariam
Use only facts she would have known at the start, not her later outcomes. Ask whether the surfaced prompts would have been understandable, timely, and actionable; collect missed requirements, irrelevant advice, false confidence, and usability difficulties. Report feedback as one exploratory usability interview, not representative proof of avoided fines.
