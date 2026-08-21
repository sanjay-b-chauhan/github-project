# Zero — homepage journey card

The right-hand card from the Zero nav lab home screen, as one standalone HTML file.

## Run it
Open `index.html`. No server, no build, no internet — the art and the Netflix
mark are inlined as data URIs and the three fonts are in `fonts/`.

## What's here
| File | |
|---|---|
| `index.html` | the card: markup, CSS and the state switcher. This is the deliverable. |
| `fonts/` | Google Sans Flex (body), PP Supply Mono (meta labels), STK Bureau Serif (art-less titles). |
| `flight-mode.webp` | the title art, already cropped — kept loose in case you want to swap it. |
| `netflix.png` | the company mark, same reason. |

`index.html` does not read those last two files; both are embedded. They are
here so you can re-encode a replacement without digging it out of the base64.

## States
Three buttons at the top of the page switch the card:
- **Active** — Continue.
- **Locked** — dimmed company pill, greyed art, the flat "Finish N more" plate,
  and the **Back to active** pill under the card.
- **Completed** — Performance / Time spent / XP earned, and View report.

## Where it comes from
A port of `src/renderer/devtools/navLab/roadmap/JourneyCardSlot.tsx`, with the
surface tokens from `hud/cardKit.tsx` and the CTA from `StartButtonV1.tsx`
(zero-core-ui, branch `feat/zero-world-nav-lab`). Values are the shipped ones,
not a re-taste.

## Two things not to "clean up"
1. **The `box-sizing: border-box` reset is load-bearing.** `.zc-row` is
   `width:100%` with side padding; under the browser default that computes
   wider than the card and the meta values render outside it, past the divider.
   The React card inherits this from Tailwind's preflight — a standalone copy
   has to say it.
2. **Never wrap the card in a `will-change` or transform layer.** Any backdrop
   root above it blanks `backdrop-filter`, and the glass goes flat.

Swapping the art: crop the source at the transparent band under the baked-in
company wordmark first, or it doubles with the card's own company pill.
