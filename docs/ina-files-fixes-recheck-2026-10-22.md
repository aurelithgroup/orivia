# Ina recheck: 11a2578
22 October 2026. Technical review OK for the four findings in 76f73fe, with the disclosure integration below. No deployment performed.

Eight targeted suites passed again: files, files-to-chat, library, notification-isolation, notifications, notification-client, chat-history and accounts. Real SQLite/Better Auth; R2/provider/push transports scripted. No live paid document extraction or new phone acceptance test performed.

Closed: existing-account guard prevents cleanup deleting active-user files; inflation is read incrementally and cancelled at the cumulative limit; exact provider input-token counting replaces page averages and prevents generation if reservation fails; document consent v2, newest-three/24k notice, partial-reading/context notices and obsolete label instruction are corrected. Library hides Files when disabled.

Privacy integration: new token-count endpoint receives the selected file before the budget decision, then generation receives it again if permitted. Replace obsolete 'file sent once' / 'nothing sent if count fails' wording with 'selected file sent to OpenAI to count input tokens and, if budget permits, extract its text'. No count means no generation, not no transmission. Official endpoint supports images/files: https://developers.openai.com/api/docs/guides/token-counting . Updated private Privacy addendum reflects this flow; do not copy founder personal contact details to public pages.

Review OK is scoped engineering approval, not full public Privacy/Terms approval or a verification of Step 9's new analytics. Keep production push off until disclosure approval. Cleo remains integrator and deployer. After the changed counting path, validate one synthetic supported image/PDF on pilot before promoting Files; a failure must not fall back to the old estimate or bypass consent/budget.
