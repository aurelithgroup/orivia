# Orivia

Orivia guides newcomers step by step through their first weeks in a new country, and helps when something goes wrong.

It's a web app: it opens from a link or QR code with no download, and people can add it to their home screen and use it offline.

## What's where

| File | What it holds |
| --- | --- |
| `js/content.js` | All the words: interface text in English and Arabic, and every journey. **Most changes happen here.** |
| `js/app.js` | The journey engine: screens, the "I need help" flows, the stage finder, saving progress. |
| `css/app.css` | The look: colours, fonts, layout. |
| `sw.js` | Keeps Orivia working offline. Change `VERSION` whenever you publish an update. |
| `manifest.webmanifest`, `icons/` | What people see when they add Orivia to their home screen. |

## Links for QR codes

- `.../?city=dubai` opens the Dubai welcome
- `.../?city=edinburgh` opens the Edinburgh welcome

## Trust record

Each journey in `js/content.js` has a `trust` line. After a university reviews a journey, set `reviewed: true`. After each successful user test, raise `tested` by one. The badges in the app update automatically.

## Privacy

Orivia sends nothing anywhere. Progress and answers are saved only on the person's own phone.
