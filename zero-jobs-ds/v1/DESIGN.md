# Zero Jobs design system, v1

The look, feel and voice of the ZERO Job Portal, written down so the next thing you make is the same.

Every value in this file was measured on the live portal (v82) in a real browser at 1512 by 860, not chosen by hand. Four portal screens were rebuilt from this kit alone and compared with the real ones pixel by pixel: Jobs 0 pixels different, an opened role 0, Inbox 4, For you 201 of 1,168,776 (all in Zero's live eyes and the moving sheen on a running task). A second test checks 125 parts property by property against the recorded values. All pass.

Use this file as the brief. Use `zero-jobs.css` as the source of truth for exact values. When the two disagree, the CSS wins and this file is wrong.

## 1. Start here

```html
<link rel="stylesheet" href="zero-jobs.css">
<script src="https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js"></script>
<script src="zero-jobs.js"></script>
<body class="zj"> ... </body>
```

- Put `class="zj"` on the body (or on the root of the part you are building).
- Every class starts with `zj-`. Every token is a CSS variable starting with `--zj-`. Nothing leaks into a host app and nothing from a host app should leak in.
- Icons: write `<i data-lucide="name"></i>`, then call `zj.icons()`.
- Start from `starter.html` (three page types in one shell) or copy the closest file in `screens/`. Never start from a blank page.
- Reference site with every part live: `index.html`.

## 2. The feel, in one paragraph

A cool grey canvas with a white sheet floating on it, 28px corners, a long soft shadow. Inside: small Inter type in one ink ramp, generous air, hairlines instead of dividers, and almost no colour. Colour appears only to mean something: green for verified, amber for needs you, red for due, lime for now, blue and green tints for why a role fits. One black, machined key per view. Zero, the AI, is a small green orb with two white eyes that sits beside the work and speaks in first person. Everything responds in 120ms and arrives by rising 8px. It should feel calm, exact and human, like a well made tool, never like a dashboard or a game.

## 3. Laws

1. **Colour only when it means something.** White and grey by default. Green means verified (the company said yes, it was sent). Amber means it needs you. Red means a deadline. Lime means now. Never decorate with colour.
2. **Three sizes, two weights.** 12 for meta, 14 to read, 16 for card titles and for Zero. 400 to read, 500 for names and titles. 24 only for a role's name in its panel. Nothing bold (600+), nothing italic, no serif, no mono in product UI.
3. **One key per view.** The black key is the one thing to do. The rest are white buttons, ghosts or quiet links.
4. **Words, not scores.** Fit is Strong fit, Good fit or Low fit, with reasons on hover. Never a percentage or a ring.
5. **A face beside every person, a logo beside every company.** Real company logos (Google's favicon service at sz=128). Generated faces for people, never real strangers, never initials when a face exists.
6. **Zero sits beside the work.** A green orb with two white pill eyes. The body never moves; only the eyes blink, look and change. Zero never covers the page.
7. **Every action says what happens next.** After anything is sent: what happened, who has it, what happens next and by when.
8. **Nothing flickers.** Redraws patch the page, they never rebuild it. Arrivals rise 8px. Presses go down 1px. Nothing bounces.

## 4. Tokens

### Colour

| Token | Hex | Use |
|---|---|---|
| `--zj-canvas` | #F3F3F5 | The page behind the sheet |
| `--zj-sheet` | #FFFFFF | Where the product sits |
| `--zj-well` | #F6F6F8 | Hover fills, chat bubbles, tab tracks, notes, drop zones |
| `--zj-well2` | #EDEDF0 | Selected rows, the mode track, avatar fill, low fit |
| `--zj-line` | #E7E7EB | Hairlines inside a surface |
| `--zj-line2` | #D4D5DA | Hairlines around controls and cards |
| `--zj-ink` | #131417 | Titles, values, names, anything read first |
| `--zj-ink2` | #4E525C | Body text |
| `--zj-ink3` | #6A6F7A | Meta, labels, quiet buttons, inactive tabs |
| `--zj-ink4` | #A6A9B2 | Times, day labels, small icons in meta lines |
| `--zj-good` / `--zj-goodbg` | #12733F / #E7F6ED | Verified, sent, wants to meet |
| `--zj-warn` / `--zj-warnbg` | #8A5306 / #FCF1DC | Action needed |
| `--zj-due` / `--zj-due-soon` | #C4271B / #B42318 | A deadline / two days or less |
| `--zj-lime` | #B7F06A | Now: the new dot, the tracker's current stop |
| `--zj-live` | #1FB45A | A task is running |
| `--zj-unread` | #2DB869 | An unread thread |
| `--zj-like` | #E5484D | A liked heart |
| `--zj-select` | #D2F59B | Text selection |
| Strong fit | #E8F8EF to #E3F6F5, text #0F7A47, icon #12A05C | `.zj-fit.zj-strong` |
| Good fit | #EAF3FF to #EEECFF, text #2851C8, icon #3E7BF5 | `.zj-fit.zj-good` |
| Popover tints | strong #E9F7EE / #13804A, good #EEF3FD / #2457C5, gap #B54708 | `.zj-pop` |
| Key | linear-gradient(#313337, #17181B), edge #0F1012 | `.zj-key` |
| Second button | linear-gradient(#FFFFFF, #F3F4F6), hover to #EEEFF2 | `.zj-sec` |
| Zero's body | radial-gradient(120% 120% at 30% 22%, #5FDB96, #3CC878 46%, #2DB869) | `.zj-orb` |

### Type

Inter from Google Fonts, `opsz` axis on (`family=Inter:opsz,wght@14..32,400;14..32,500;14..32,700;14..32,800`). The whole page sets `font-feature-settings:'cv11','ss01'` and `letter-spacing:-.006em` (this computes to -0.084px at 14px and is inherited as that absolute value). Money, dates, counts and times use `font-variant-numeric:tabular-nums`. Zero's opening line uses `text-wrap:pretty`.

| Size / line | Weight | Tracking | Class | Use |
|---|---|---|---|---|
| 28 / 34 | 400 | -0.022em | `.zj-t28` | A page title. Rare |
| 24 / 30 | 400 | -0.01em | `.zj-t24` | A role's name in its panel |
| 16 / 24 | 500 | inherited | `.zj-card-title` | Card titles, dialog titles |
| 16 / 24 | 400 | inherited | `.zj-say p` | Zero's opening line, names inside it at 500 ink |
| 14 / 20 | 400 and 500 | inherited | body | Everything you read. 500 for names, section heads, row titles in lists |
| 12 / 16 | 400 | inherited | `.zj-m` | Meta, labels, times, pills, table headers |

Counted on the live For you, Jobs and Inbox screens, by characters: 14/20 at 400 and 12/16 at 400 carry almost all text, then 14/20 at 500, then 16/24.

### Radius (one scale, nested)

| Token | px | Use |
|---|---|---|
| `--zj-r-pill` | 99 | Pills, tabs, mode, avatars, toasts, round buttons |
| `--zj-r-sheet` | 28 | The sheet (24 under 1024px) |
| `--zj-r-card` | 20 | Cards, panels, the table, the role panel, lanes |
| `--zj-r-dialog` | 16 | Dialogs |
| `--zj-r-row` | 14 | Table rows, threads, bubbles, notes, popovers, drop zones |
| `--zj-r-tile` | 13 | The 44px logo tile |
| `--zj-r-ctl` | 10 | Buttons, icon buttons, inputs, the 32px logo tile |
| `--zj-r-sm` | 8 | Small buttons (30 high), sort buttons, cancel |
| `--zj-r-check` | 6 | Checkbox, the 14px logo badge |
| `--zj-r-img` | 5 | A logo inside its 32 or 44 tile (3 inside 24 and 20) |

The rounded option (`.zj-rounded` on any ancestor) turns every button full round. Off by default.

### Depth

Hairlines and long, soft, negative-spread shadows. Never a glow, never a coloured shadow, never glass.

| Token | Value | Use |
|---|---|---|
| `--zj-sh-sheet` | 0 0 0 1px rgba(19,20,23,.05), 0 1px 2px rgba(19,20,23,.04), 0 40px 70px -50px rgba(19,20,23,.35) | The sheet |
| `--zj-sh-hair` | inset 0 0 0 1px line | Panels, the table, logo tiles |
| `--zj-sh-ring` | 0 0 0 1px line2 | Cards |
| `--zj-sh-ctl` | inset 0 0 0 1px line2 | Outlined controls |
| `--zj-sh-key` | inset 0 1px 0 rgba(255,255,255,.16), inset 0 -2px 0 rgba(0,0,0,.45), 0 0 0 1px #0F1012, 0 12px 22px -14px rgba(19,20,23,.6) | The key |
| `--zj-sh-sec` | inset 0 0 0 1px rgba(19,20,23,.14), inset 0 -2px 0 rgba(19,20,23,.05), 0 1px 2px rgba(19,20,23,.07) | The second button |
| `--zj-sh-on` | 0 0 0 1px line, 0 6px 12px -10px rgba(19,20,23,.5) | A selected main tab |
| `--zj-sh-panel` | inset 0 0 0 1px line, 0 24px 40px -32px rgba(19,20,23,.4) | A role, opened |
| `--zj-sh-pop` | 0 0 0 1px rgba(19,20,23,.08), 0 2px 4px rgba(19,20,23,.05), 0 28px 56px -18px rgba(19,20,23,.42) | Why it fits |
| `--zj-sh-toast` | 0 0 0 1px line2, 0 16px 32px -18px rgba(19,20,23,.28) | Toasts |
| `--zj-sh-dialog` | 0 30px 70px -30px rgba(19,20,23,.5) | Dialogs |
| `--zj-sh-float` | 0 0 0 1px line, 0 6px 14px -8px rgba(19,20,23,.3) | Close on a panel |

### Spacing

Space separates; lines almost never do. The gaps in use: 2 (tabs in a track, threads in a list), 4 (role tab track, card body to foot), 6 (icon to label, buttons in a card foot), 8 (top bar items, dialog actions), 10 (face to title, orb to bubble, section head to its content), 12 (logo to text in a row, orb to Zero's words), 14 (chat messages, panel head), 16 (card padding, list to thread, table to panel), 20 (panel padding, lanes, top bar columns), 24 (top bar sides), 28 (role panel sides, gaps between For you sections), 32 (body sides, For you column top).

### Motion

| What | Duration | Curve | Move |
|---|---|---|---|
| Hover, press, select | 120ms | `--zj-e` cubic-bezier(.2,0,0,1) | Fill and colour. Press: translateY(1px) |
| Quiet and round buttons | 150ms | ease | Fill and colour |
| Why it fits popover | 140ms | ease-out | Drops 4px into place |
| Dialog scrim | 160ms | ease-out | Fades in |
| Chevrons | 200ms | `--zj-out` cubic-bezier(.16,1,.3,1) | Turn 180 degrees |
| A running task appears | 250ms | `--zj-spring` cubic-bezier(.2,.9,.3,1) | Rises 4px |
| A page | 280ms | `--zj-e` | Rises 8px |
| A card | 400ms | `--zj-out` | Rises 8px |
| Zero's eyes look | 450ms | `--zj-out` | Up to 15px across, 10px down, 9 degrees tilt |
| Zero blinks | 5.2s loop | ease-in-out | Twice per loop, squash to 10% |
| Running words | 1.8s loop | linear | A sheen passes left to right |
| A toast | 4.2s | `--zj-e` | Rises 10px, holds, leaves |

`prefers-reduced-motion` turns every animation off.

### Icons

Lucide 0.469.0. Default 16px, stroke 1.75. Inside smaller parts: 15 (role tabs, the big fit pill, the pager arrows, level), 14 (quiet buttons, deadlines, toast buttons, pill buttons, cancel), 13 (meta lines, fit pills, sort, checkboxes), 12 (sent counts, locks, small sort arrows). Common names: check, x, timer, bookmark, heart, send, upload, link, download, eye, search, list-filter, arrow-up-down, arrow-down, banknote, clock, building-2, briefcase, map-pin, sparkle (strong fit), thumbs-up (good fit), minus (low fit), lock, award (level), volume-2, settings, rotate-ccw, pause, chevron-left/right/down, activity, file-text, circle-stop, calendar, mail. Never hand-draw an icon.

## 5. Layout

- **Canvas** `--zj-canvas`. The **strip** above the sheet (52px, padding 0 22) holds prototype controls only: pause, date, settings, start over. It is a dev control, never product UI. Delete it in anything a student uses.
- **Sheet**: white, radius 28, inset 14px from the canvas (0 14 14), `--zj-sh-sheet`, fills the height.
- **Top bar** (`.zj-top`): 60px, padding 0 24, three columns. Left: the zero wordmark (52px wide) and the mode switch 8px after it. Centre: the main tabs. Right, 8px apart: sound, level, you.
- **Body** (`.zj-body`): scrolls inside the sheet, padding 8 32 112.
- **Three page types**:
  - Column page (`.zj-col`): 688 wide at most, centred, padding 32 24 80, 28 between sections. For you.
  - Table page (`.zj-tbw` in `.zj-page`): 1200 wide at most, 4px from the top. Jobs.
  - Fill page (`.zj-body.zj-fill`): padding 4 32 24, the page fills the sheet and its parts scroll inside. Inbox, 380 list plus the thread.
- **Split** (`.zj-split`): a table at minmax(0,1fr) beside a 640 panel, 16 apart, 1200 wide at most. Under 1100px the panel hides.
- **Breakpoints** (the portal's own): 1100 split collapses, 1024 strip and top bar wrap (tabs on their own row), sheet radius 24, body padding 4 16 120, inbox stacks; 700 table toolbar wraps; 600 level hides, column padding 20 16 56, Location column hides.

## 6. Components

Each entry: the class, what it is for, its measured size, its states.

### Navigation (four segmented controls, never swap them)
- `.zj-tabs` main places. Track `--zj-well`, padding 3, gap 2. Buttons 32 high, padding 0 13, 14px ink3, hover ink. `.zj-on` white with `--zj-sh-on`. Count `.zj-count` 18 high, ink fill, 12px white, 6px after the label. New `.zj-new` 9px lime dot at top 4 right 4 with a 2px white ring.
- `.zj-mode` two-way mode (Learn or Jobs). Track `--zj-well2`, padding 3. Buttons 28 high, padding 0 12, 12px ink2. `.zj-on` white with a 1px line ring.
- `.zj-filter` filters above a list. No track. Buttons 32 high, padding 0 12, radius 10, 12px ink3. `.zj-on` well2 ink. Counts `.zj-n` ink3, 6px after.
- `.zj-seg` two views of one thing. Track well, padding 4, gap 4. Buttons 36 high, padding 0 16 0 12, gap 8, 14px ink2, icons 15 ink3. `.zj-on` white, 1px line ring and a 1px drop.

### Buttons
- `.zj-key` the one thing to do. 36 high, padding 0 14, gap 8, radius 10, white 14px 400, the key gradient and `--zj-sh-key`. Hover brightness 1.14. Press down 1px with `--zj-sh-key-down`. In a card foot it is 38 high, padding 0 16, gap 6, weight 500.
- `.zj-sec` the second choice. Same size, ink text, white gradient, `--zj-sh-sec`. Hover gradient to #EEEFF2. Press down 1px. In a table row, hover shows a 1.5px ink ring.
- `.zj-sm` on either: 30 high, padding 0 10, radius 8. Inside rows and notes.
- Disabled: 40% (30% inside a card), no pointer.
- `.zj-ghost` a third choice, no box until hover (well). 40 high, padding 0 12, radius 10, ink2. `.zj-sm` 32 high, radius 8.
- `.zj-quiet` a side door (Later, Add a link instead). 32 high, padding 0 10, round, ink3, 14px icon. First in a card row it sits 6px out so its icon lines up with the text.
- `.zj-pillbtn` go somewhere (Open the role). 38 high, padding 0 10 0 12, round, white, line2 ring, hover 1.5px ink ring, chevron 14 ink3.
- `.zj-ib` toolbar icon button. 34 high, min 36 wide, padding 0 9, radius 10, white, line2 ring.
- `.zj-round` 32 round icon button in the top bar, ink3. `.zj-tool` 36 square in the strip.
- `.zj-arrow` 26 round pager arrow, 15px icon, press scales to .92, disabled 30%.
- `.zj-close` closes a panel. 36 by 32, radius 8, white, `--zj-sh-float`. Sits 4px up and 8px out from the panel's corner.
- `.zj-cancel` stops one running task. 28 square, radius 8, white gradient, x turns #B42318 on hover. `.zj-big` 38 beside a key. Only an x. No stop square on a role page.
- `.zj-like` heart, ink3. `.zj-on` #E5484D and filled.

### Pills and signals
- `.zj-fit` 26 high, padding 0 10 0 8, gap 6, round, 12px, 13px icon. `.zj-strong` (sparkle, filled), `.zj-good` (thumbs-up), `.zj-low` (minus, well2 ink3). `.zj-big` 38 high, padding 0 14 0 12, 14px, icon 15 (role panel). Hover or focus opens why it fits.
- `.zj-status` 26 high, padding 0 10, gap 5, round, 12px. Plain well ink3 (Applied, Opened). `.zj-ok` green (Wants to meet). `.zj-warn` amber (Action needed). `.zj-lock` with a 12px lock (Level 6).
- `.zj-sent` 22 high, green, check 12 (2 sent).
- `.zj-due` deadline. 12/16, 400, #C4271B, a 14px timer, no box, pushed right. `.zj-soon` #B42318 at two days or less. Never bold, never an alarm icon, never a box.
- `.zj-dot` 8px ink4. `.zj-go` green and pulsing. `.zj-unread` 9px #2DB869.
- `.zj-run` a running task: 12/16 500 ink3, a live green dot with a ring that grows and fades every 1.6s, and the sheen on the words.
- `.zj-spin` 11px spinner, only beside work happening now.

### People and companies
- `.zj-lg` logo tile: 32 (radius 10, logo 18), `.zj-l` 44 (radius 13, logo 24), `.zj-xs` 24 round (logo 14), `.zj-xxs` 20 round (logo 12). White with a line hairline. Source: `https://www.google.com/s2/favicons?sz=128&domain=<domain>`.
- `.zj-lgs` several companies: 20px round tiles overlapping by 7 with a 2px canvas ring.
- `.zj-av` a face, 32 round (28 with `.zj-sm`), well2 behind.
- `.zj-face` a person at a company: 28 face with a 14px logo badge at 17,17, radius 6, 2px white ring.

### Zero
- `.zj-orb` sizes 24, 26, 28, 34, 36, 44, 60 (`.zj-s24` and so on). Use `zj.orb(size, mood, {still, look})`.
- Body: the green radial gradient with an inner white glow, still. Eyes: two white rounded strokes, 14 wide at 36 and up (13 below), at x 38 and 62 out of 100, from y 35 to 47. They blink twice every 5.2s. `look:[x,y]` moves them up to 15px across and 10 down and tilts up to 9 degrees; the far eye shrinks up to 26%.
- Moods (eye shapes): idle and talk (35 to 47), listen (34 to 48, 14.5), think (left 37 to 45, right 34 to 46, 13, drifting), work (36 to 46, 13.5, scanning), alert (33 to 48, 15). Body never moves in any mood.
- `.zj-still` for lists and small avatars: no blink.
- `.zj-say` Zero opens a page: orb 36 (6px up to centre on the first line), 12 gap, words at 16/24 ink2, names in 500 ink, max 540, pretty wrapping.
- `.zj-note` Zero inside a card: well, radius 14, padding 8 8 8 12, gap 12, orb 26 still, words 14 ink, actions right (`.zj-note-acts`, small keys, gap 6). `.zj-warn` amber.
- `.zj-msg` chat: Zero's bubble in well, radius 14, padding 8 12, ink, orb 28 still at the bottom, 10 gap, max min(520, 86%). `.zj-me` your bubble in ink with white text, on the right.

### Cards and sections
- `.zj-card` one decision. White, radius 20, padding 16, gap 12, `--zj-sh-ring`, rises 8px in 400ms.
- `.zj-card-title` 16/24 500 ink, min 28 high, padding 0 4, gap 10. A face or logo first, the title, then `.zj-due` pushed right.
- `.zj-card-body` gap 10. `.zj-card-q` a question in 14 500 ink.
- `.zj-card-foot` padding 0 4, gap 6, wraps on narrow screens. A quiet side door on the left, a grow spacer, ghosts, then the key last.
- `.zj-stack` to-dos as a deck: two `.zj-stack-bk` under the front card at translateY 8 scale .965 and translateY 15 scale .93, origin at the bottom, 15px margin under the stack.
- `.zj-sh` section head: min 28, padding 0 4, gap 8, 10 below. Title `.zj-sh-t` 14 500 ink. `.zj-pager` on the right: arrows and "1 of 8" at 12 ink3.
- `.zj-drop` drop a file: 72 high, well, radius 14, line2 ring, upload icon, hover fills line.
- `.zj-panel` any white panel: radius 20, hairline.

### Activity
- `.zj-act-head` the Activity line: `.zj-act-btn` (title 14 500, count 12 ink3, chevron) 6px out to the left, a running `.zj-run` on the right.
- `.zj-tl` days 6 apart. `.zj-day > p` day label 12 ink4 (10 above, 2 below).
- `.zj-ev-h` one event: min 44, padding 6 8 6 0, gap 10, radius 12, hover well. `.zj-ev-i` a 36 wide icon column, each icon with a 3px white ring, threaded by a 1px line at x 17.
- Icons: a company `.zj-lg.zj-xs`, Zero `zj.orb(24)`, a system icon `.zj-ev-ic` (24 well round, 12 icon; `.zj-l` 28 with 14). Times `.zj-ev-t` 12 ink4 tabular. A running step `.zj-ev-s` 12 ink3 on the right.

### Table
- `.zj-tablewrap` white, radius 20, padding 6, hairline. `.zj-toolbar` sticky, 52 high, bleeds 6 to the edge, padding 0 10, filters left, icon buttons right.
- `.zj-table` fixed layout. Headers 46 high, 12/16 ink3 400, sticky under the toolbar. Cells padding 10 12. Rows 56 high, radius 14 at the ends, hover well, open row `.zj-on` well2, locked row `.zj-locked` at 55%.
- `.zj-sort` header sort button: 24 high, the first icon 13 ink4 with 2px after it, the sort arrow 12. `.zj-on` ink.
- `.zj-check` 20 square, radius 6, 1.5px line2 ring, hover ink ring, `.zj-on` ink fill, `.zj-off` dashed (cannot be picked).
- `.zj-role` a role cell: check, 32 logo, then the title (14 ink) over `.zj-meta` (12 ink3, items `.zj-mi` with 13 ink4 icons, 12 apart).
- `.zj-roles` the Jobs columns: Role takes the rest, Location 170, What we think 160, Pay 110, Posted 150, Action 176, Like 44.
- `.zj-roles.zj-narrow` beside an open role: no Location (the place moves under the company with a map-pin), min width 940 inside `.zj-hscroll`, Role 336 and the heart 44 stay put with soft side shadows.

### Inbox
- `.zj-inbox` 380 list and the thread, 16 apart, fills the page.
- `.zj-list` white panel. `.zj-list-top` padding 20 20 12, title 14 ink and count 12 ink3 on one baseline. `.zj-list-body` gap 2, padding 0 8 8.
- `.zj-thread` padding 12, gap 12, radius 14, hover well, `.zj-on` well2. Title 14 500 ink, date 12 ink3, preview 12 ink3 (`.zj-un` ink when unread), unread dot 6px down on the right.
- `.zj-chat` white panel. `.zj-chat-h` padding 16 20, gap 12, a bottom hairline, logo, title 14 500 ink over meta 12 ink3, `.zj-pillbtn` on the right.
- `.zj-msgs` padding 12 20 16, gap 14. `.zj-msg-card` a card Zero hands you in the thread, 44 in from the left, 520 wide at most, gap 4 inside.

### A role, opened
- `.zj-detail` white, radius 20, padding 24 28 96, `--zj-sh-panel`, sticky. `.zj-detail-x` holds the close.
- `.zj-rhead` 44 logo, 14 below, the name `.zj-t24` with 8 under it, then the meta line (building, briefcase, map-pin), padding right 48.
- `.zj-rfit` 16 below: the big fit pill. Then `.zj-seg` 20 below. Then `.zj-lane`.
- `.zj-lane` white, radius 20, padding 20, gap 20, a line ring. Holds the tracker and Zero's note.
- `.zj-track` five stops in a grid. Dot 14: done ink, now lime with a 2px ink ring and a 5px lime halo at 40%, next white with a 2px line2 ring. Connectors 2px at y 6, ink after a done stop, line otherwise. Labels 12/16, ink when done or now, ink3 after.

### Files
- `.zj-tree` 18 in from the left. `.zj-tn` rows 36 high, 20 padding left, a 1px line2 trunk and a 12px branch. Icon ink3, name 14 ink, kind 12 ink3, then 28px see and download buttons (radius 8, hover well).

### Over the page
- `.zj-pop` why it fits: 300 wide, radius 14, padding 0 14 10, `--zj-sh-pop`, drops 4px in 140ms. Head `.zj-pop-h` in the tint (12 500), an arrow on the pill's start (`--ax`). Rows: a 52px key column (12 ink3) and the reason (14 ink). A gap row `.zj-gap` has a hairline above and an amber key. Open it from the pill's start, 10px below.
- `.zj-toast` white, 44 high, round, padding 0 6 0 12, gap 10, 14px ink, `--zj-sh-toast`, bottom centre 24px up. A 24 round icon `.zj-ti` (green check, or `.zj-heart` red). One action button 32 high, radius 8, well, 500. Lives 4.2s. `zj.toast(text, {icon, action, actionIcon, onAction})`.
- `.zj-scrim` + `.zj-dialog` one question: scrim rgba(19,20,23,.32); dialog 440 wide, radius 16, padding 20. Title 16/24 500 ink, 14 below. Rows `.zj-dialog-row` padding 10 0, gap 12, a rgba(19,20,23,.06) line above; icon tile `.zj-dialog-i` 36 well radius 10; label `.zj-dialog-l` 14 ink over value `.zj-dialog-v` 12 ink2. Actions `.zj-dialog-f` right, gap 8, 14 above: a ghost, then the key (disabled until it can act).
- `.zj-input` 36 high, padding 0 12, radius 10, inset rgba(19,20,23,.16) ring, focus a 2px ink outline.

## 7. Voice

Zero is a smart friend who is also your coach. Warm, direct, high standards. It says what happened, why, and what happens next.

- **Say what happened and why.** "Clari did not go through. Greenhouse timed out, so nothing was sent." Never "Something went wrong."
- **Always the next step.** After anything is sent: "Sent. Airtable has it." then "What happens next: they review it with the hiring team. Expect a reply by Tue 13 Oct."
- **First person for Zero.** "I applied to Revenue Operations Analyst for you on Tue 6 Oct. I am watching for the reply."
- **Offer help they choose, no parental nudges.** "That role opens at Level 6. I can tell you the day it does." Never "Go to Learn."
- **Ask for a reason only on no.** Apply, Accept and Approve act at once.
- **Buttons are short real verbs.** Accept, Apply, Send, Later, Not interested, Reply myself, Apply manually, Open the role, Upload, Save and apply, Not now.
- **A clear title needs no subtitle.** One line per item, never a title plus a body that repeats it.
- **Formats.** Dates "Tue 13 Oct", "Today", "Yesterday". Money "$85k to 105k", "CA$90k to 100k". Ranges say "to". Age "12d". Deadlines "4 days left", "2 days left". Counts "4 today", "1 of 8", "2 sent".
- **Names, not roles.** "Kwame at Webflow wants to meet you", with Kwame's face and Webflow's logo.
- **Never.** Dashes used as pauses. Exclamation marks. Hype. These words: leverage, robust, seamless, elevate, unlock, empower, harness, delve, navigate (as a verb), journey, transform, revolutionize, cutting-edge, paradigm, ecosystem, synergy.

## 8. Moments

Two moments step outside the calm page: levelling up and getting hired. Both are full screen, played as a sequence, advanced with a white "Tap to continue" pill at the bottom, never a Continue button.

- Level up: a clean wipe, a burst, the old level, then the new real badge (tap it to spin once), what opened (real logos), the reward (coins fly to the count), a summary. Palettes by level: Levels 1 to 3 mint, 4 to 6 violet, 7 to 9 ocean, 10 heaven (gold light, white). Hired uses the offer palette, the one all-green screen.
- Palette stops (dark to light), from the portal: mint #0B6B45 #22B566 #8EE87C #D9FFB3 #FFF7DC; violet #2C1A9E #6A3BF0 #C452E6 #FF8FC4 #FFE6D8; ocean #0A2C96 #1F5FEB #2FB5F2 #9DEFE6 #F0FFF9; offer #0A5A38 #14A05A #5FD68A #D5F7D2 #FFFFFF; heaven #6F97F2 #ACA9F5 #FFD27A #FFEFCC #FFFFFF.
- Timing: burst 700ms, old level 840ms, the evolution 2000ms. Energy is full only through the transition, then it cools so the badge and the words read clearly.
- The engine (a WebGL sky, trim-path strokes, sound) lives in the portal source, `st25.js`. It is not part of this kit yet. Screenshots are in `assets/moments/` and on the reference site.

## 9. Never

- A radial or centre glow, an inner glow, glass or blur on controls, coloured shadows.
- Underlines of any kind (links included), italics, serif, mono in product UI, bold above 500.
- Edge-to-edge dividers. Separate with space and enclosure.
- Percentages or rings for fit. Green for anything not verified.
- Initials where a face exists. Hand-drawn or emoji logos.
- A loader where none is needed. A dashboard of filler tiles. An eyebrow above a clear title.
- Rebuilding the page on a redraw (flicker). Bounces.
- Two keys in one view.

## 10. Check a build against the portal

From the kit folder (needs Node 22+, Google Chrome, Python 3 with Pillow):

```bash
node tests/run-parity.mjs
```

Checks the reference site's 125 live parts against the values recorded from v82 (`tests/fixtures/v82-computed.json`). Prints PASS counts or each property that drifted.

```bash
node tests/run-screens.mjs
```

Screenshots each rebuilt screen and the live v82 at 1512 by 860 and prints how many pixels differ. Set `V82=<path or url>` to compare against a local copy.

## 11. Versions

This is v1, measured on Job Portal v82 (19 Oct 2026). When the portal changes, measure again and ship v2 beside v1; never edit v1 in place.
