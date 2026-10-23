# Private AI trial: mobile layout

Chat is the main experience; the bottom bar gives quick access to the rest of the app.

Bottom bar: **Chat · Calendar · (Help) · Explore · My Life**. Help is the raised button in the middle, one tap from anywhere.

- **Chat:** full-height conversation, suggestion chips when empty, message box above the bar (Enter sends, Shift+Enter adds a line). Asking for a reminder shows an in-chat calendar proposal; after saving, "View in My calendar" opens the Calendar tab. Mentioning a calendar or appointment adds an "Open My calendar" chip.
- **Calendar:** events saved in this browser, Google Calendar drafts, and a manual reminder form.
- **Help:** UAE emergency numbers (999, 998, 997), "Something went wrong? Tell Orivia" (starts a chat), a full-screen Arabic/English card asking staff for help, and a link to the checked step-by-step guides.
- **Explore:** checked guides from the public Orivia app and official sources, each with "Ask Orivia about this". Places near you: coming soon.
- **My Life:** optional About me (where you live, why you're here, university or workplace), kept in this browser. It is only sent to the AI when the user ticks "Let Orivia use this". Also shows what's coming up, and lets the user clear the conversation or delete their data.

Source files: `workers/trial-ui/page.html` and `workers/trial-ui/chat.js`. After editing them, run `node tools/embed-trial-ui.mjs` to copy them into `workers/orivia-ai-private-trial.mjs`, which serves them.
