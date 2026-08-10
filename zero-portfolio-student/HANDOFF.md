# Zero Portfolio v2 — Developer Handoff

Live reference: **https://portfolio-v2-five-blue-71.vercel.app**
Design owner: Atul Khola. Spec source: Navid's portfolio thread (Jul 26–31) + iteration sessions.

This package is the approved prototype. Everything visible on the live link is **production-intent** unless listed under "Placeholders" at the bottom. The prototype is a single self-contained HTML file — treat it as the source of truth for layout, spacing, copy, motion, and interaction behavior, not as code to port literally.

---

## 1. Running it

```
python3 -m http.server 4180
# open http://localhost:4180
```

No build step. React 18 UMD + babel-standalone, all inline. One quirk: a `<base href="https://sanjay-b-chauhan.github.io/zero-super-goat-portfolio/">` tag resolves relative image URLs (presenter photos, profile images, some logos) against that host. Fonts do NOT depend on it (see §8).

## 2. File map

| File | What it is |
|---|---|
| `index.html` | The entire app: styles, data, components, logic |
| `intro.mp4` / `intro-audio.mp3` | Header intro-bubble talking portrait |
| `bubble-1..5.mp4` | Per-project webcam bubble clips (trailer overlays) |
| `preview-1..5.mp3` | Legacy hover voice previews (project id → 1 Notion, 2 Spotify, 3 Shopify, 4 Netflix, 5 Slack) |
| `trailer-1.mp4` | Unused AI-generated reference (do not ship) |
| `cards.html` | Redirect stub to `/` |

Inside `index.html`, top to bottom: CSS (custom properties + keyframes) → `window.DATA` (mock data blob) → icon components → shared primitives → project cards/trailers → recruiter rail → student rail → modals → `App`.

## 3. Views and dev controls

Two views: **Recruiter** (default) and **Student** — toggle bottom-left. The other bottom-left controls are DEV-ONLY, do not ship:
- **Projects slider (1–5)**: previews layout density at different completed-project counts.
- **Phase 1|2|3**: previews the student coach phases.
- **Level dropdown**: profile level on the 8-ladder; shifts every rating on the page (see §4).

Phase and level are one coupled axis: Calibrating→Phase 1, Foundational–Advanced→Phase 2, Distinguished/Exceptional→Phase 3. Picking either snaps the other. In production, phase derives from state: checklist complete → Phase 2; readiness threshold reached → Phase 3.

## 4. The rating graph (single source of truth)

One canonical ladder: `Calibrating, Foundational, Developing, Capable, Proficient, Advanced, Distinguished, Exceptional` (`LADDER` in code). Every sub-skill is a numeric level on it. Everything else derives:

- Overall mastery pill (header) = the profile level.
- Highlight pills under About ("Communication · Proficient") = derived parent of sub-skills. Parent is only "met" if EVERY child meets target; the word steps down a tier on collision (parents can't outrank their children).
- Eligibility lines (recruiter panel) = words AND tick/cross computed from levels vs the JD bar ("SQL for analysis and modeling. Advanced, above the bar in your posting" flips to a cross + "below the bar" at low levels).
- Readiness % (Phase 2) = blend of project count and skills-vs-target.

Targets are FIXED by the role; current levels move with the person. Key code: `LADDER`, `PROFILE`, `BASE_LVL`, `skillPos`, `goalPos`, `lword`, `deriveDim`, `gapSubs`, `tierPill`.

**Doctrine: no surface may hardcode a rating word.** Everything reads the graph.

## 5. Recruiter view

- Header: name + mastery pill only (no role/location — those live in eligibility).
- Highlight pills under About: Communication + People skills, derived words. Recruiter/augmentation only — students never see additions they didn't choose.
- Projects: consistent M-size cards at any count; first 3 visible, then a "See N more projects" bar (stacked face thumbs, N as digit) expanding in place; "Show less" collapses. XL hero layout only when exactly 1 project.
- Card pills: exactly two — `Presentation · 4:12` and the submission FILENAME (`recovery-plan.pdf` etc., see `SUB_FILES`).
- Trailer on hover (see §7).
- Right panel (single white sheet, LinkedIn anatomy): JD chip row → hairline → "Exceptional Fit" (ink, display face) → flat list of checks sorted met → partial → not-yet (no subheads, no meters, no counts) → Shortlist (outline) + Schedule interview (black fill). No hovers, nothing truncates, icons top-aligned to wrapped lines.

## 6. Student view

Same page + ghost slots for future scenarios, edit mode, and the coach rail. Rail = ONE white card: fold → body list → (below the card) Edit portfolio (outline, wide) + Chat (black fill, compact, coach avatar inside).

**Fold anatomy (all phases): 50px ring + title (15.5/600) + sub (12.5, ink-3).**
- Phase 1 "Getting started": SEGMENTED ring (one segment per checklist item, green as done, "2/5" centered). Body: strict ordered checklist — Intro video, About me, Academics, Work experience (Skip), Achievements & credentials (Skip). No Required/Optional headers. Skip sits LEFT of Add.
- Phase 2 "Interview readiness": continuous ring at readiness %, plus a soft-green delta arc ahead of it (what the current scenario adds, small gap between arcs). Hovering the ring: tooltip, one full sentence — "You will be at **66%** after your ongoing scenario, Measurement system design." Clock pill next to the title: 🕐 4–6 weeks. Sub: target role. Body: Suggestions.
- Phase 3 "Portfolio optimizations": complete green ring + centered check. Sub: "Interview-ready, optimizing for Business Analyst roles". Body: Suggestions.

**Suggestions (Phases 2–3)** use the checklist grammar: dashed circle left → full-width sentence → actions row BELOW the text, horizontal: Done (outline pill) then Skip (text). Resolved = green tick; skipped = tick + muted + "Skipped" tag. Last row has no divider. Content stays strictly in Navid's categories: P2 = feedback on portfolio pieces (intro video, about me); P3 = role-targeted reordering + redo-weak-presentations. Two per phase.

**Done → verify interaction**: no label, no sparkle — a green shimmer sweeps the row (~1.3s), then tick pops + "Verified", row lingers ~1.1s, then folds closed (animated `grid-template-rows 1fr→0fr`, .45s). Skip folds immediately. Violet sparkle is reserved for Zero's own analysis voice; mechanical busy-state is always the green shimmer.

### Add flow (checklist → sections)
1. Tap Add on a checklist row → page enters edit mode, smooth-scrolls to the matching section (`#sec-academics` / `#sec-experience` / `#sec-credential`), opens the entry modal (~900ms after scroll starts).
2. Modal = LinkedIn pattern, ONE entry per session, Cancel + Save. Field schemas in `ENTRY_META`:
   - Experience: Title, Company or organization, Start date + End date (half-row), Description (textarea, optional)
   - Education: School, Degree, Start year + End year-or-expected
   - Certification: Name, Issuing organization, Issue date
3. Logo auto-detect: typing the org/school/issuer name resolves a favicon live in a chip at the field's right edge (prototype uses google s2 favicon + guessed domain — production should use a proper company-logo service); clicking the chip uploads a custom image.
4. Save → edit mode auto-exits → page scrolls back up → ~950ms later the checklist row flips: green glow sweep + tick pop, counter increments. The tick is EARNED — only an actual saved entry (or Skip) completes a row. Cancel backs out of edit mode.
5. Added entries render with the IDENTICAL hierarchy as mock entries in their section (org line → role line → period → description for experience). Date ranges always use en dash ("May 2024 – Aug 2024"). No "Self-added" tag on these sections (they're self-added by definition; the tag exists only on projects to mark personal vs Zero work).

### Project visibility manager
Edit mode → "Add a project" → chooser with two blocks: **Zero projects** (fanned logos; visibility framing) and **Your own project** (dashed, upload form). Zero projects opens a 720px manager: 2-col grid of real project cards, live "N visible · M hidden" count, hover pill Hide/Show, hidden cards dim + grayscale + "Hidden" chip. Guard: the last visible project cannot be hidden. The portfolio (cards, See-more counts, plural/singular copy) recomputes from the visible set.

## 7. Trailers (crafted, never AI-generated)

Hovering a project card's visual plays a ~9s deterministic walkthrough built in DOM (`TrailerStage` + `TRL_*` components): browser-chrome bar with company logo, three screens cross-fading (e.g. funnel → drop-off model → sized fixes), an animated cursor, and the presenter webcam chip — SAME image, container and position as the static thumbnail, so hover reads as the thumbnail waking up. Each stage is brand-tinted (`TRL_BRAND`: Notion ink/beige, Shopify #008060, Spotify #1DB954, Netflix #E50914, Slack #611F69) — brand drives data ink + canvas; semantic colors never change (amber = the problem, green = the win). All copy in the screens is real, hand-written per project. **Doctrine: never generate screen content with AI — the copy is the design.**

## 8. Project modal

Header: company chip → title → meta row: review verdict spelled out ("Meets expectations" / "Exceeds expectations" / "Exceptional") + hairline + tools-used chips (logo + name). General info lives at the top — no scrolling for it.
Tabs: **Presentation** (the deck alone — no description; unsourced copy was removed by Navid's rule), **Submission** (ONE deliverable rendered as a full document: chrome bar with filename + Open, then a doc page — title, byline, rule, brief, review pull-quote), **Review** (verdict pill, summary, manager quote, observable counts).

## 9. Type, color, sound

- Font: **Google Sans Flex only**, EMBEDDED in the HTML as a 44KB subsetted woff2 data-URI (weight axis only). Never reference the family without shipping the file — machines without it fall back to Inter and the page changes character. `format('truetype-variations')` is rejected by Safari; use woff2.
- Buttons: exactly two voices — outline (secondary) and black fill (primary). No lime/green CTAs anywhere. Convention: outline left, black right.
- Greens are semantic only: `--signal` = affirmed/met/within-reach. Violet `#8755E9/#8B5CF6` = Zero's AI/analysis voice (sparkles, verdict accents). Amber = warning/hot spot.
- Dashed outlines (edit mode, ghost slots, add rows) hug their content's radius (11–12px) — never pill-round around rectangular content. Rows divide BETWEEN themselves; the container draws the closing line (last row never has a divider).
- Reveal orchestration: panels "derive" — shimmer skeletons → staggered `revealIn` (90ms steps after 280ms delay, see `useStep`). IMPORTANT: use `animation-fill-mode: backwards` (not `both`) near z-indexed content, or popovers get buried by lingering stacking contexts.
- Sound: opt-in typed earcons (tick/press/toggle/open/chime) on tagged elements only; muted until first user gesture (browser policy).

## 10. Data model quick reference (in `index.html`)

- `window.DATA` — candidate, scenarios (projects), assessment, experience/academics/credentials
- `SCORE` — per-project band ("Meets"/"Exceeds"/"Exceptional"), short title, desc
- `SUB_FILES` — project id → submission filename
- `LADDER` / `PROFILE` / `BASE_LVL` / `SKILL_GOALS` — the rating graph
- `SETUP_LIST` — checklist items (`skip:true` marks optional)
- `PHASE2_SUGG` / `PHASE3_SUGG` — coach suggestions
- `ENTRY_META` — add-entry field schemas + compose()
- `TRAILER_STAGES` / `TRL_BRAND` — trailer wiring
- `ELIG` / `eligFor()` — eligibility lines (derived words/states)

## 11. Production-intent vs placeholder

**Production-intent** (build as seen): all layouts, spacing, type, the rating-graph derivation rules, phase anatomy + coupling, checklist/suggestion interaction grammar and timings, add-entry flows + celebration sequencing, visibility manager + guard, trailer concept and per-brand treatment, recruiter panel anatomy, button system, modal structure, all reveal/collapse motion.

**Placeholders** (replace with real systems/data):
- All mock data: candidate, projects, reviews, ratings, suggestions copy, readiness math constants (weeks estimate = projects-left heuristic)
- Logo auto-detect via google favicon service → use a real logo API
- Presenter photos/clips (per-project faces differ — production uses the student's own recordings; trailers are recorded by students at portfolio-finalization per Navid)
- The dev debug panel (slider/phase/level controls)
- Chat, Shortlist, Schedule interview, "Open" on submission = non-functional stubs
- Voice preview mp3s (legacy; superseded by trailers)

## 12. Standing product rules (from the founder thread — do not regress)

1. Only show what Zero has actually built and can verify. Copy that can't name its data source gets cut.
2. LinkedIn-simple is the reference bar; no invented sections, meters, or interaction ceremony until the base layer is approved.
3. Suggestions stay within Navid's categories; a suggestion is a task (Done/Skip), not content to rate.
4. Students never get unchosen additions; recruiter view may augment.
5. One rating vocabulary — the 8-ladder — everywhere.
