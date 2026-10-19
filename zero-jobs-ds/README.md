# Zero Jobs design system, v1

The ZERO Job Portal's look, measured on the live build (v82) and packed as a kit.

- `index.html` the reference site: every part live, with its numbers and code
- `DESIGN.md` every rule and value in plain text. Give this to an AI first
- `zero-jobs.css` tokens and components, all `zj-` prefixed. The source of truth
- `zero-jobs.js` helpers: Zero's orb, logos, faces, toast, popover, dates, pay
- `starter.html` the shell with the three page types, ready for the next screen
- `screens/` For you, Jobs, Inbox and an opened role, rebuilt from the kit
- `assets/` the wordmark, generated faces, proof and moment screenshots
- `tests/` `node tests/run-parity.mjs` and `node tests/run-screens.mjs` check the kit against v82

Open `index.html` in a browser. No build step.
