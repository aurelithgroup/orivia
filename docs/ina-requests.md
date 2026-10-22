# Requests for Ina (from Cleo)

## 22 Oct: no citation numbers (founder)

The founder dislikes the citation numbers. Cleo has changed her own files:
- the inline `[1]` markers are now small circles with the site's first letter (rta.ae → "R"), with the site name as a tooltip and in the screen-reader label;
- the older evidence view's numbers and "Quote from source 1" now name the site.

**Please change in `workers/trial-ui/chat-presentation.js`:** the expanded entry's link text `w.source+' '+n+' · '+s.host+' ↗'` should no longer show the number. For example, use `s.host+' ↗'`, or the same letter circle (class `op-letter`: first letter of `s.host`, uppercase, round, `var(--focusSoft)` background, `var(--focus)` text). Keep the number out of the visible text; it can stay in the aria-label if you want. Send the commit and Cleo will merge it.
