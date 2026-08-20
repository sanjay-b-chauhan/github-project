/**
 * nav-explorations — THE CARDS LANE.
 *
 * ✅ OWNED BY THE CARDS CHAT. The city chat does not edit this file.
 *
 * The plain-base home: no city, no rail. A horizontal deck of scenario cards
 * IS the navigation, on the onboarding's warm whites, with the journey's
 * position read from carousel indicators at the bottom instead of a bar.
 *
 * ── Where the look comes from ─────────────────────────────────────────────
 * The palette is lifted verbatim from the onboarding prototype's own :root
 * (`sanjay-v3-vision-board.html`) rather than re-mixed by eye, so this screen
 * and onboarding are the same white — page #FAFAF9, card #FFF, wash #F7F7F5,
 * hairline rgba(13,13,13,.08), ink #111113 with its two greys.
 *
 * ── Where the card comes from ─────────────────────────────────────────────
 * The information architecture is the product's own scenario card: a company
 * lockup, the title, a rule, three stat rows, one CTA. Which three rows depend
 * on the state, exactly as the product does it — a finished scenario reports
 * how it went, an unstarted one advertises what it is worth.
 *
 * Data comes from the journey fixture the rail itself reads (exposed by
 * tools/rules-cards.mjs), so the deck and the rail cannot disagree.
 *
 * ── The chrome ────────────────────────────────────────────────────────────
 * Zero's wordmark, the streak and XP pills, settings and the portfolio all
 * survive — but every one of them is drawn for a dark map. On white they are
 * invisible or wrong, so this file re-skins them light while it owns the
 * screen. It restores nothing: the class is scoped to `[data-nx-home=cards]`
 * and the City home never sets it.
 */
(function () {
  'use strict';
  var NX = window.NX;
  if (!NX || !NX.state.enabled || !NX.state.cards) return;

  var styleEl = NX.styleEl;
  // Inherited from core, not re-derived: one lane deciding on its own what
  // "reduced motion" means is how two halves of a screen end up disagreeing.
  // (It was referenced below and never defined — every call to scrollToIndex
  // threw a ReferenceError, which is why clicking a stop did nothing.)
  var REDUCE = NX.REDUCE;

  /* The onboarding palette, verbatim. */
  var C = {
    page: '#FAFAF9',
    shell: '#F1F1EF',
    card: '#FFF',
    wash: '#F7F7F5',
    field: '#F0F0EE',
    line: 'rgba(13,13,13,.08)',
    line2: 'rgba(13,13,13,.045)',
    tx: '#111113',
    tx2: '#63636a',
    tx3: '#9a9aa0',
    tx4: '#c4c4ca',
    ok: '#3fb968',
    commit: '#4ade80',
  };
  var MONO = '"PP Supply Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
  var SERIF = '"STK_Bureau_Serif", Georgia, serif';
  var SANS = '"Google Sans Flex", system-ui, sans-serif';

  /* The real title art, keyed by company (each company appears once in this
     journey). Downscaled copies live in art/ at the repo root; the build ships
     them as nx-art/. A company without art falls back to the serif title in
     the same box — the product's own behavior when the asset query is empty. */
  var ART = {
    Airbnb: './nx-art/airbnb.png',
    Spotify: './nx-art/spotify.png',
    Netflix: './nx-art/netflix.png',
    Slack: './nx-art/slack.png',
    Amazon: './nx-art/amazon.png',
    Uber: './nx-art/uber.png',
    // Google's only art (gen-1 DRAFT DOCTOR) is baked on black — unusable on
    // white, so Google falls back to the serif title like the other uncovered
    // companies. Airbnb uses gen-2 HOST GHOSTED for the same reason: gen-1
    // CANCEL CRISIS has no alpha channel.
    Duolingo: './nx-art/duolingo.png',
  };

  var DIFFICULTY_LEVEL = { Beginner: 1, Intermediate: 2, Advanced: 3 };

  /* The product's formatTimeSpent: largest unit, hours may pair with minutes. */
  function hhmm(mins) {
    if (!mins) return '';
    var h = Math.floor(mins / 60),
      m = mins % 60;
    if (!h) return m + ' min';
    return m ? h + ' hr ' + m + ' min' : h + ' hr';
  }

  /** The company marks, filled from the rail's own chips before the deck builds. */
  var LOGOS = {};

  /** Journey → a flat, ordered deck with each scenario's real status.
   *
   *  ALL SIXTEEN. The first pass shipped only the seven scenarios whose title
   *  art exists, on the reasoning that a card without art is a lesser object
   *  next to one with it. True of a card; fatal to a journey. Nine missing
   *  stops means the deck cannot say "this is behind me, this is now, these are
   *  still to come" — the gaps are exactly where the story is. A scenario with
   *  no art gets a designed cover instead of being dropped. */
  function deck() {
    var rm = window.__NX_ROADMAP;
    if (!rm) return [];
    var done = rm.completedCount;
    var out = [];
    rm.categories.forEach(function (cat) {
      cat.scenarios.forEach(function (s) {
        out.push({
          s: s,
          category: cat.title,
          status:
            s.sequence_order <= done ? 'completed' : s.sequence_order === done + 1 ? 'current' : 'locked',
          // how many scenarios stand between you and this one. "Locked" says
          // no; this says how far, which is the thing worth knowing.
          away: s.sequence_order - (done + 1),
        });
      });
    });
    out.sort(function (a, b) { return a.s.sequence_order - b.s.sequence_order; });

    /* ── a training opens every category ──────────────────────────────────
       Each of the five categories is taught before it is practised, and the
       teaching is Zero's own — no company, no scenario, no title art. So the
       deck gets a card at the head of each one.

       "Head of the category" is decided in SEQUENCE order, not in the
       fixture's grouping, because this journey interleaves its categories
       (1,2 Growth · 3 Ops · 4,5 Growth …). The training therefore lands
       immediately before the first scenario of its category that you actually
       reach — which is the only place it means anything.

       Its state is read off that scenario: if you have got to it, you have
       been through its training. */
    var seen = {};
    var withTraining = [];
    out.forEach(function (item) {
      if (!seen[item.category]) {
        seen[item.category] = true;
        withTraining.push({
          kind: 'training',
          category: item.category,
          // every scenario this part contains, so the training can report what
          // it is the groundwork FOR
          part: rm.categories.filter(function (c) { return c.title === item.category; })[0],
          s: { title: 'Training', sequence_order: item.s.sequence_order - 0.5 },
          status: item.s.sequence_order <= done + 1 ? 'completed' : 'locked',
          away: item.away,
        });
      }
      withTraining.push(item);
    });

    /* THE DESTINATION IS A CARD. It was a mark at the end of the rail, which
       said the road went somewhere without ever saying where — and the thing
       the sixteen scenarios are FOR deserves more than an icon. Same footprint
       as a scenario, so the deck ends on an object rather than trailing off. */
    var left = out.length - done;
    var partsLeft = rm.categories.filter(function (c) {
      return c.scenarios.some(function (x) { return x.sequence_order > done; });
    }).length;
    withTraining.push({
      kind: 'goal',
      category: '',
      left: left,
      partsLeft: partsLeft,
      s: { title: 'The job portal opens', sequence_order: 999 },
      status: left > 0 ? 'locked' : 'completed',
      away: left,
    });
    return withTraining;
  }

  /* ── the card, ScenarioIntroV1's own anatomy on white ─────────────────────
     Geometry is the product's, verbatim: counter pill 46h mono16, key art in a
     336×210 box with a blur(90px) twin behind it, name 24px/1.35 medium sans,
     MetaRow 30h with mono16 uppercase labels, gold XP pill r40 px10 py6 with
     tracking −1.62px, difficulty as four 23×10 segments, glossy 62h CTA.
     Only the COLORS are translated; every opacity in the dark card was tuned
     against rgba(0,0,0,.5) glass, so each gets a considered ink equivalent,
     not a blind inversion. */

  function metaRow(label, valueNode, small) {
    var r = styleEl(document.createElement('div'), {
      display: 'flex', height: (small ? GEO.other.row : GEO.current.row) + 'px',
      alignItems: 'center',
      justifyContent: 'space-between', padding: '0 14px', width: '100%',
    });
    var l = styleEl(document.createElement('span'), {
      font: '400 ' + (small ? '14.5px' : '16px') + '/1 ' + MONO, textTransform: 'uppercase',
      color: C.tx3, whiteSpace: 'nowrap',
    });
    l.textContent = label;
    r.appendChild(l);
    r.appendChild(valueNode);
    return r;
  }

  function metaValue(text, small) {
    var v = styleEl(document.createElement('span'), {
      font: '500 ' + (small ? '17px' : '19px') + '/1.2 ' + SANS, color: C.tx,
      fontFeatureSettings: "'lnum' 1, 'tnum' 1",
    });
    v.textContent = text;
    return v;
  }

  /* The product's star.svg is a 157KB raster in an svg wrapper — substitute a
     clean four-point star in the canonical XP gold (#FFB73A, ScenarioReward). */
  var STAR =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="#FFB73A" aria-hidden="true">' +
    '<path d="M12 1c.6 5.8 4.2 9.4 11 11-6.8 1.6-10.4 5.2-11 11-.6-5.8-4.2-9.4-11-11C7.8 10.4 11.4 6.8 12 1z"/></svg>';

  function xpPill(n) {
    var p = styleEl(document.createElement('span'), {
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      borderRadius: '40px', padding: '6px 10px',
      background: 'rgba(255,183,58,0.14)',
      boxShadow: '0 0 0 1px rgba(255,183,58,0.45)',
    });
    p.innerHTML =
      STAR +
      '<span style="font:400 18px/1 ' + MONO + ';letter-spacing:-1.62px;color:#8a6d00;' +
      "font-feature-settings:'lnum' 1,'tnum' 1\">" + Number(n).toLocaleString() + '</span>';
    return p;
  }

  function difficultyDots(label, small) {
    var level = DIFFICULTY_LEVEL[label] != null ? DIFFICULTY_LEVEL[label] : 2;
    var wrap = styleEl(document.createElement('span'), {
      display: 'flex', alignItems: 'center', gap: small ? '14px' : '20px',
    });
    var dots = styleEl(document.createElement('span'), { display: 'inline-flex', gap: '2px' });
    for (var i = 0; i < 4; i++) {
      dots.appendChild(styleEl(document.createElement('span'), {
        height: small ? '9px' : '10px', width: small ? '19px' : '23px', borderRadius: '30px',
        background: C.tx, opacity: i <= level ? '1' : '0.12',
      }));
    }
    wrap.appendChild(dots);
    wrap.appendChild(metaValue(label || 'Intermediate', small));
    return wrap;
  }

  /* StartButtonV1's glossy CTA, verbatim CSS with two light-tuning changes:
     the #c8c8c8 ledge and #e6e6e6 ring each go one step darker so the button
     keeps its physical edge on a white card. Holo label, triple shine, press
     travel and reduced-motion behavior are the product's own. */
  function installCtaCss() {
    if (document.getElementById('nx-sbtn-css')) return;
    var css = document.createElement('style');
    css.id = 'nx-sbtn-css';
    css.textContent = [
      '.nx-sbtn{height:64px;width:100%;border-radius:22px;display:flex;align-items:center;justify-content:center;gap:10px;padding:15px 40px;cursor:pointer;position:relative;overflow:hidden;user-select:none;border:0;outline:none;',
      'background-image:linear-gradient(90deg,rgba(255,255,255,.4),rgba(255,255,255,.4)),linear-gradient(180deg,rgba(229,229,229,.8),rgb(226,226,226));',
      'box-shadow:0 6px 0 #bfbfbf,0 12px 18px -6px rgba(0,0,0,.28),0 0 0 1.33px #dcdcdc,inset 0 1.33px 0 rgba(255,255,255,.75);',
      'transition:transform .1s cubic-bezier(.34,1.56,.64,1),box-shadow .1s}',
      '.nx-sbtn:hover{transform:translateY(-1px)}',
      '.nx-sbtn:active{transform:translateY(5px);box-shadow:0 1px 0 #bfbfbf,0 3px 8px -4px rgba(0,0,0,.28),0 0 0 1.33px #dcdcdc,inset 0 1.33px 0 rgba(255,255,255,.75)}',
      '.nx-sbtn-label{font-family:"Google Sans Flex","Google_Sans_Flex",sans-serif;font-weight:600;font-size:23px;letter-spacing:-.48px;',
      'background:linear-gradient(100deg,#121212 0%,#121212 34%,#ff5ec0 42%,#8b7bff 50%,#37dcc4 58%,#121212 66%,#121212 100%);',
      'background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;',
      'animation:nx-holotext 3s ease-in-out infinite}',
      '@keyframes nx-holotext{0%{background-position:130% 0}55%,100%{background-position:-30% 0}}',
      '.nx-sbtn::after{content:"";position:absolute;top:-25%;bottom:-25%;left:0;width:120%;z-index:1;pointer-events:none;',
      'background:linear-gradient(100deg,transparent 33%,rgba(255,255,255,.9) 38%,transparent 41%,transparent 46%,rgba(255,255,255,.9) 51%,transparent 54%,transparent 59%,rgba(255,255,255,.9) 64%,transparent 67%);',
      'transform:translateX(-100%) skewX(-14deg);animation:nx-shine 3s ease-in-out infinite}',
      '@keyframes nx-shine{0%{transform:translateX(-100%) skewX(-14deg)}55%,100%{transform:translateX(100%) skewX(-14deg)}}',
      '.nx-sbtn:hover::after{animation-duration:1s}',
      '@media (prefers-reduced-motion: reduce){.nx-sbtn-label{background:none;color:#121212;animation:none}.nx-sbtn::after{opacity:0;animation:none}}',
      /* The deck's own furniture. */
      '.nx-deck::-webkit-scrollbar{display:none}',
      /* THE STOPS. Size and fill carry the state, and nothing else has to:
         done is a small filled mark, upcoming is a smaller and fainter one —
         the hollow rings the first version used read as empty checkboxes, an
         invitation to click something that is not there yet — and now is the
         only stop with any dimension to it. */
      '.nx-node{border-radius:999px;flex:0 0 auto;position:relative;' +
        'transition:transform 260ms cubic-bezier(.22,.61,.36,1), box-shadow 260ms ease}',
      '.nx-node-completed{width:11px;height:11px;background:#3fb968;' +
        'box-shadow:inset 0 1px 1px rgba(255,255,255,0.45), 0 0 0 3px rgba(63,185,104,0.10)}',
      '.nx-node-locked{width:8px;height:8px;background:rgba(13,13,13,0.17)}',
      /* NOW. A lit bead rather than a flat dot: the gradient puts the light
         source above it, the inner highlight and the inner shade give it a
         curve, and the outer ring seats it on the rail. */
      '.nx-node-current{width:20px;height:20px;' +
        'background:radial-gradient(120% 120% at 50% 22%, #86e3a6 0%, #43ba69 52%, #2d9b55 100%);' +
        'box-shadow:inset 0 1.5px 1.5px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.20),' +
        '0 0 0 4px rgba(63,185,104,0.15), 0 0 16px rgba(63,185,104,0.45),' +
        '0 0 0 1.5px rgba(255,255,255,0.95)}',
      /* …and it pings. Two rings, half a cycle apart, so the rail always has
         one travelling outward — a single ring reads as a hiccup, two read as
         a pulse. They ride on ::before/::after so nothing is added to the DOM
         sixteen times over. */
      '.nx-node-current::before,.nx-node-current::after{content:"";position:absolute;' +
        'inset:0;border-radius:999px;box-shadow:0 0 0 1.5px rgba(63,185,104,0.55);' +
        'animation:nx-ripple 2.8s cubic-bezier(.22,.61,.36,1) infinite}',
      '.nx-node-current::after{animation-delay:1.4s}',
      '@keyframes nx-ripple{0%{transform:scale(1);opacity:.75}' +
        '70%{transform:scale(2.7);opacity:0}100%{transform:scale(2.7);opacity:0}}',
      /* The destination is not another stop, so it does not wear a stop's
         size. It is the only mark on the rail with a face on it. */
      '.nx-node-goal{width:38px;height:38px;background:' + C.card + ';display:grid;' +
        'place-items:center;box-shadow:inset 0 0 0 1.5px ' + C.line +
        ', 0 10px 24px -10px rgba(13,13,13,.30)}',
      '@media (prefers-reduced-motion: reduce){.nx-node-current::before,' +
        '.nx-node-current::after{animation:none;opacity:0}}',
    ].join('');
    document.head.appendChild(css);
  }

  var ICONS = {
    lock:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="' + C.tx3 +
      '" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">' +
      '<rect x="4" y="10.5" width="16" height="10.5" rx="2.5"/><path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5"/></svg>',
    check:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="' + C.ok +
      '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M20 6 9 17l-5-5"/></svg>',
  };

  /* How far away a locked scenario is, said in scenarios rather than in "no".
     One away is the one you pick up next, and that is worth its own sentence. */
  function distance(away) {
    if (away <= 1) return 'Next after this one';
    return away + ' scenarios away';
  }

  /* ── the three states ─────────────────────────────────────────────────────
     A deck where every card is the same object cannot say where you are in it.
     These three are physically different things, and the difference is the
     message, not decoration:

       DONE      the smallest footprint, glass rather than paper, and its rows
                 report what HAPPENED — band, time spent, difficulty. Its
                 footer is the payoff: the XP it paid.
       CURRENT   the biggest card, the only opaque one, the only real shadow,
                 and the only working button in the deck.
       UPCOMING  done's footprint, art held back to a soft grey — the picture
                 is part of the reward — rows advertising what it is worth, and
                 a footer that says how FAR away it is rather than "locked".

     Every card says its state in the same place, at its head, in the same
     shape. Reading the deck should never require reading a footer to work out
     which of the three you are looking at.

     They share one bottom line: every card's base sits on the timeline, so the
     current card rises out of the row instead of floating in it. */
  /* SPACING. The first pass tuned each gap where it sat, and the result was a
     card that had run out of air by the time it reached its rows — Sanjay's
     word was congested, and he was right: rows 13px apart under a 1px rule
     with 18px of clearance is a block of text, not three facts.

     One scale now, in two sizes, and every gap on the card comes out of it.
     ROW is the height a fact stands in, GAP the air between facts, BAND the
     air around the group, PAD the card's own margin. Change the feel of the
     card by changing four numbers, not forty. */
  var GEO = {
    current: {
      // The top pad and the card's height move together: `mid` is the flexing
      // child, so its slack splits above AND below the art. Trimming the
      // padding alone leaves the same air, just measured from a different
      // edge — the height has to come down with it.
      w: 500, h: 660, pad: '18px 30px 30px', art: 254, name: 26, r: 40,
      row: 34, gap: 22, band: 26, head: 20, cta: 18,
    },
    other: {
      w: 430, h: 566, pad: '15px 26px 26px', art: 208, name: 21, r: 34,
      row: 30, gap: 18, band: 22, head: 16, cta: 16,
    },
  };

  /* Apple's card recipe, and the reason each layer is there: a bright inner
     top edge so the card catches light, ONE dark hairline so it has an actual
     boundary on a pale ground (a shadow alone leaves the edge mushy), and a
     wide soft drop that does the lifting. The resting cards are glass — the
     mint ground reads through them — and only the current one is opaque, which
     is what makes it the object in front. */
  var SHELL = {
    other:
      'inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(13,13,13,0.055), ' +
      '0 18px 44px -26px rgba(13,13,13,0.20)',
    current:
      'inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px rgba(13,13,13,0.075), ' +
      // the same green as the bead on the rail below it, at a whisper — the
      // card and its stop should read as one lit object, not two green things
      '0 0 0 6px rgba(63,185,104,0.055), ' +
      '0 2px 4px -2px rgba(13,13,13,0.06), 0 40px 80px -30px rgba(13,13,13,0.34)',
  };

  /* NO STATE CHIP. There was one at the head of every card — Completed, In
     progress, Upcoming — and it was the fourth thing on the card saying the
     same word: the footer says it, the size and the glass rank it, and the lit
     bead on the rail underneath marks it. A label that repeats three signals
     is not redundancy, it is 50px of the card's top edge spent on nothing.
     The words survive here, for the screen reader, where they are the ONLY
     signal. */
  var STATE_LABEL = { completed: 'Completed', current: 'In progress', locked: 'Upcoming' };

  /* The cover for a scenario with no title art. Not a fallback — the first
     pass printed the CATEGORY here, which named the chapter on a card about
     one scenario and read as a mistake. The company's own mark on the same
     blurred twin the art uses says what the art would have: whose problem
     this is. */
  function plainCover(companyName, box, dim) {
    var logo = LOGOS[companyName];
    var wrap = styleEl(document.createElement('div'), {
      position: 'relative', display: 'grid', placeItems: 'center',
      height: box + 'px', width: '100%',
    });
    /* A LOCKUP, NOT A LOOSE ICON. A scenario with title art wears a brand chip
       at the top of the art and its name inside the picture; one without art
       was showing a bare logo floating in the middle of a card, which reads as
       an asset that failed to load rather than a design. So the cover borrows
       the art's own anatomy: the mark large and soft behind, the same brand
       chip in front of it. Now both kinds of card are the same kind of object. */
    if (logo) {
      var ghost = Math.round(box * 0.78);
      wrap.innerHTML =
        '<img src="' + logo + '" aria-hidden="true" style="position:absolute;width:' + ghost +
        'px;height:' + ghost + 'px;object-fit:contain;filter:blur(2px)' +
        (dim ? ' grayscale(1)' : '') + ';opacity:' + (dim ? '0.05' : '0.09') + '"/>' +
        '<span style="position:relative;display:inline-flex;align-items:center;gap:10px;' +
        'padding:10px 18px 10px 14px;border-radius:999px;background:' + C.card + ';' +
        'box-shadow:inset 0 0 0 1px ' + C.line + ', 0 10px 26px -16px rgba(13,13,13,0.35)">' +
        '<img src="' + logo + '" alt="" style="width:24px;height:24px;object-fit:contain;filter:' +
        (dim ? 'grayscale(1)' : 'none') + ';opacity:' + (dim ? '0.55' : '1') + '"/>' +
        '<span style="font:500 17px/1 ' + SANS + ';letter-spacing:-0.01em;color:' +
        (dim ? C.tx2 : C.tx) + '">' + companyName + '</span></span>';
    } else {
      wrap.innerHTML =
        '<span style="font:400 34px/1 ' + SERIF + ';letter-spacing:-0.02em;color:' +
        (dim ? C.tx3 : C.tx2) + '">' + companyName + '</span>';
    }
    return wrap;
  }

  /* The job-portal mark, lifted out of the rail's own milestone button rather
     than redrawn here. The rail is hidden on this home but still mounted, so
     the icon the product uses for that milestone is right there in the DOM —
     cloning it means this rail and that one can never show two different
     marks for the same destination. */
  function jobPortalIcon(rail) {
    var btn = (rail.milestones || []).filter(function (b) {
      return /job portal/i.test(b.getAttribute('aria-label') || '');
    })[0];
    var svg = btn && btn.querySelector('svg');
    if (!svg) return null;
    var copy = svg.cloneNode(true);
    copy.setAttribute('width', '21');
    copy.setAttribute('height', '21');
    // it is drawn in white for the dark rail; on paper it has to be ink
    copy.querySelectorAll('path').forEach(function (path) {
      if (path.getAttribute('fill') && path.getAttribute('fill') !== 'none') {
        path.setAttribute('fill', C.tx2);
      }
      if (path.getAttribute('stroke') && path.getAttribute('stroke') !== 'none') {
        path.setAttribute('stroke', C.tx2);
      }
    });
    if (!copy.querySelector('[fill]:not([fill="none"])')) copy.setAttribute('fill', C.tx2);
    return copy;
  }

  /* The footer is what the card is FOR, one per state: the reward you banked,
     the button you press, or the distance you still have to cover. The state
     itself is said at the head, so nothing here repeats it. */
  function footer(item, small) {
    var st = item.status;
    if (st === 'current') {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'nx-sbtn';
      b.innerHTML =
        '<svg width="17" height="17" viewBox="0 0 24 24" fill="#121212" style="position:relative;z-index:2" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
        '<span class="nx-sbtn-label" style="position:relative;z-index:2">Continue</span>';
      return b;
    }
    var d = styleEl(document.createElement('div'), {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: small ? '18px' : '22px', width: '100%', gap: '9px',
      padding: (small ? GEO.other.cta : GEO.current.cta) + 'px 0',
    });
    if (st === 'completed') {
      /* "Completed", not the band. The band belongs to the Performance row and
         printing it twice — once as a fact, once as a headline — made the card
         read as if it were arguing with itself. The footer's job is the same
         on all three cards: say what this card IS. */
      d.style.background = 'rgba(63,185,104,0.09)';
      d.style.boxShadow = 'inset 0 0 0 1.5px rgba(63,185,104,0.32)';
      d.innerHTML =
        ICONS.check +
        '<span style="font:500 ' + (small ? '17px' : '18px') + '/1.3 ' + SANS +
        ';letter-spacing:-0.02em;color:#2c7d47;white-space:nowrap">Completed</span>';
      return d;
    }
    d.style.boxShadow = 'inset 0 0 0 1.5px ' + C.line;
    d.innerHTML =
      ICONS.lock +
      '<span style="font:500 ' + (small ? '16px' : '17px') + '/1.3 ' + SANS +
      ';letter-spacing:-0.02em;color:' + C.tx3 + ';white-space:nowrap">' +
      distance(item.away) + '</span>';
    return d;
  }

  /* ── the training card ───────────────────────────────────────────────────
     Not a scenario, and it should not pretend to be one. There is no company,
     so the mark is Zero's own; there is no title art, so the category's name
     IS the picture, set in the serif the app uses for the journey's own title.
     No XP row, no difficulty, no time: a training is the ground you stand on
     before the first scenario of its category, and inventing numbers for it
     would be the only fiction on this screen. */
  function buildTraining(item, index) {
    var g = GEO.other;
    var done = item.status === 'completed';

    var card = styleEl(document.createElement('article'), {
      flex: '0 0 auto', width: g.w + 'px', height: g.h + 'px', scrollSnapAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: 'rgba(255,255,255,0.46)',
      backdropFilter: 'blur(26px) saturate(1.45)',
      WebkitBackdropFilter: 'blur(26px) saturate(1.45)',
      borderRadius: g.r + 'px', padding: g.pad,
      boxShadow: SHELL.other,
      transition: 'background 320ms ease, box-shadow 320ms ease, transform 320ms ' + NX.EASE,
    });
    card.className = 'nx-card';
    card.dataset.nxIdx = index;
    card.dataset.nxState = item.status;
    card.dataset.nxKind = 'training';
    card.setAttribute('aria-label', 'Training, ' + item.category);

    var mid = styleEl(document.createElement('div'), {
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '26px',
      flex: '1 1 auto', justifyContent: 'flex-start', minHeight: '0', width: '100%',
    });

    // Zero's mark, in the same chip a scenario wears its company's in
    var appMark = document.querySelector('img[alt="Zero"]');
    var chip = styleEl(document.createElement('span'), {
      display: 'inline-flex', alignItems: 'center', gap: '9px', flexShrink: '0',
      padding: '9px 16px', borderRadius: '999px', background: C.card,
      boxShadow: 'inset 0 0 0 1px ' + C.line + ', 0 10px 26px -16px rgba(13,13,13,0.35)',
    });
    if (appMark) {
      var mark = styleEl(document.createElement('img'), {
        height: '15px', width: 'auto', filter: 'invert(1)',
        opacity: done ? '0.9' : '0.55',
      });
      mark.src = appMark.getAttribute('src');
      mark.alt = 'Zero';
      chip.appendChild(mark);
    }
    var word = styleEl(document.createElement('span'), {
      font: '400 11px/1 ' + MONO, letterSpacing: '0.14em', textTransform: 'uppercase',
      color: C.tx3,
    });
    word.textContent = 'Training';
    chip.appendChild(word);
    mid.appendChild(chip);

    /* The name of the category, as the picture. */
    var title = styleEl(document.createElement('h3'), {
      font: '400 40px/1.08 ' + SERIF, letterSpacing: '-0.02em',
      color: done ? C.tx : C.tx2, textAlign: 'center', margin: '0', padding: '0 4px',
      flexShrink: '0',
    });
    title.textContent = item.category;
    mid.appendChild(title);

    card.appendChild(mid);

    /* THE STATS ARE THE PART'S. A training has no XP, no duration and no
       difficulty of its own in the fixture, and inventing three numbers for it
       would be the only fiction on this screen. What it CAN say is what it is
       the groundwork for — how many scenarios are in this part, how long they
       run, and how hard they get — all read straight off the category. Same
       three slots as a scenario card, so the eye compares them without
       re-learning where anything is. */
    var bottom = styleEl(document.createElement('div'), {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: g.band + 'px', width: '100%', flexShrink: '0',
    });
    bottom.appendChild(styleEl(document.createElement('div'), {
      height: '1px', width: '100%', background: C.line2,
    }));

    var scenarios = (item.part && item.part.scenarios) || [];
    var minutes = scenarios.reduce(function (n, x) { return n + (x.estimated_minutes || 0); }, 0);
    var hardest = scenarios.reduce(function (best, x) {
      return (DIFFICULTY_LEVEL[x.difficulty] || 0) > (DIFFICULTY_LEVEL[best] || 0) ? x.difficulty : best;
    }, 'Beginner');

    var rows = styleEl(document.createElement('div'), {
      display: 'flex', flexDirection: 'column', gap: g.gap + 'px', width: '100%',
    });
    rows.appendChild(metaRow('Scenarios', metaValue(String(scenarios.length), true), true));
    rows.appendChild(metaRow('Time in this part', metaValue('~' + hhmm(minutes), true), true));
    rows.appendChild(metaRow('Difficulty', difficultyDots(hardest, true), true));
    bottom.appendChild(rows);

    var foot = styleEl(document.createElement('div'), {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: '18px', width: '100%', gap: '9px', padding: g.cta + 'px 0',
      background: done ? 'rgba(63,185,104,0.09)' : 'transparent',
      boxShadow: 'inset 0 0 0 1.5px ' + (done ? 'rgba(63,185,104,0.32)' : C.line),
    });
    foot.innerHTML =
      (done ? ICONS.check : ICONS.lock) +
      '<span style="font:500 17px/1.3 ' + SANS + ';letter-spacing:-0.02em;color:' +
      (done ? '#2c7d47' : C.tx3) + ';white-space:nowrap">' +
      (done ? 'Completed' : 'Opens with this category') + '</span>';
    bottom.appendChild(foot);
    card.appendChild(bottom);
    return card;
  }

  /* ── the destination card ────────────────────────────────────────────────
     One line and the mark, and nothing else. It carried a "THE DESTINATION"
     eyebrow and two counted stats, and both were answering questions nobody
     asks at the end of a deck — the timeline already counts the journey and
     the cards ahead already say how far each one is. What is left is the only
     thing this card exists to say.

     The mark is the PRODUCT's own job-portal icon, cloned out of the rail's
     milestone button, so this card and that rail can never show two different
     marks for the same place. */
  function buildGoal(item, index, rail) {
    var g = GEO.other;

    var card = styleEl(document.createElement('article'), {
      flex: '0 0 auto', width: g.w + 'px', height: g.h + 'px', scrollSnapAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: 'rgba(255,255,255,0.46)',
      backdropFilter: 'blur(26px) saturate(1.45)',
      WebkitBackdropFilter: 'blur(26px) saturate(1.45)',
      borderRadius: g.r + 'px', padding: g.pad,
      boxShadow: SHELL.other,
      transition: 'background 320ms ease, box-shadow 320ms ease, transform 320ms ' + NX.EASE,
    });
    card.className = 'nx-card';
    card.dataset.nxIdx = index;
    card.dataset.nxState = item.status;
    card.dataset.nxKind = 'goal';
    card.setAttribute('aria-label', 'The job portal unlocks');

    var mid = styleEl(document.createElement('div'), {
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '26px',
      flex: '1 1 auto', justifyContent: 'flex-start', minHeight: '0', width: '100%',
    });

    var disc = styleEl(document.createElement('span'), {
      width: '54px', height: '54px', borderRadius: '999px', display: 'grid',
      placeItems: 'center', flexShrink: '0', background: C.card,
      boxShadow: 'inset 0 0 0 1px ' + C.line + ', 0 10px 26px -16px rgba(13,13,13,0.35)',
    });
    var mark = jobPortalIcon(rail);
    if (mark) {
      mark.setAttribute('width', '24');
      mark.setAttribute('height', '24');
      disc.appendChild(mark);
    }
    mid.appendChild(disc);

    var title = styleEl(document.createElement('h3'), {
      font: '400 40px/1.08 ' + SERIF, letterSpacing: '-0.02em',
      color: C.tx2, textAlign: 'center', margin: '0', padding: '0 4px', flexShrink: '0',
    });
    title.textContent = 'Job portal unlocks';
    mid.appendChild(title);
    card.appendChild(mid);
    return card;
  }

  function buildCard(item, index) {
    var s = item.s;
    var st = item.status;
    var active = st === 'current';
    var g = active ? GEO.current : GEO.other;
    var sm = !active;

    var card = styleEl(document.createElement('article'), {
      flex: '0 0 auto', width: g.w + 'px', height: g.h + 'px', scrollSnapAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: active ? '#FFFFFF' : 'rgba(255,255,255,0.46)',
      backdropFilter: active ? 'none' : 'blur(26px) saturate(1.45)',
      WebkitBackdropFilter: active ? 'none' : 'blur(26px) saturate(1.45)',
      borderRadius: g.r + 'px', padding: g.pad,
      boxShadow: active ? SHELL.current : SHELL.other,
      transition: 'background 320ms ease, box-shadow 320ms ease, transform 320ms ' + NX.EASE,
    });
    card.className = 'nx-card';
    card.dataset.nxIdx = index;
    card.dataset.nxState = st;
    card.setAttribute('aria-label', s.title + ', ' + STATE_LABEL[st]);

    /* MIDDLE — the art, given the room it was missing. The title art is the
       most valuable thing on the card and it was floating in the middle of a
       column of air; now it takes the space and the air comes out of the top. */
    /* ONE PLANE FOR THE TOPS. `mid` used to centre its content, so a title
       that wrapped to two lines pushed its brand mark down and a short cover
       pulled it up — four cards in a row, four different heights for the same
       element. Every card of a given size is the same height and they all sit
       on one bottom line, so starting the content at the TOP puts every mark
       and every cover on one line too. The slack collects above the rule,
       where it is air rather than misalignment. */
    var mid = styleEl(document.createElement('div'), {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '9px',
      flex: '1 1 auto', justifyContent: 'flex-start', minHeight: '0', width: '100%',
    });

    var companyName = s.company ? s.company.name : '';
    var art = ART[companyName];
    var artBox = styleEl(document.createElement('div'), {
      position: 'relative', display: 'grid', placeItems: 'center', flexShrink: '0',
      height: g.art + 'px', width: '100%', marginBottom: g.head - 9 + 'px',
    });

    if (art) {
      /* The product's signature — a blur(90px) twin behind the sharp art,
         softened to .3 on white where .65 reads as a wash instead of a halo.
         Ahead of you the picture is held back: greyed and quieted, so arriving
         at a scenario is also the moment its art turns on. */
      var dim = st === 'locked';
      artBox.innerHTML =
        '<img src="' + art + '" aria-hidden="true" style="position:absolute;height:' + g.art +
        'px;width:100%;object-fit:contain;filter:blur(90px)' + (dim ? ' grayscale(1)' : '') +
        ';opacity:' + (dim ? '0.12' : '0.3') + '"/>' +
        '<img src="' + art + '" alt="" style="position:relative;height:' + g.art +
        'px;width:100%;object-fit:contain;filter:' + (dim ? 'grayscale(1)' : 'none') +
        ';opacity:' + (dim ? '0.42' : '1') + '"/>';
    } else {
      artBox.appendChild(plainCover(companyName, g.art, st === 'locked'));
    }
    mid.appendChild(artBox);

    var name = styleEl(document.createElement('p'), {
      font: '500 ' + g.name + 'px/1.3 ' + SANS,
      color: st === 'locked' ? C.tx2 : C.tx, textAlign: 'center',
      maxWidth: '340px', padding: '0 6px', margin: '0', flexShrink: '0',
      letterSpacing: '-0.015em',
      display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden',
    });
    name.textContent = s.title;
    mid.appendChild(name);

    /* No category line on a scenario card. It was added to name the training
       each card belongs to, and the TRAINING CARD does that job properly now —
       a line of small caps under every title was the cheap version of it. */
    card.appendChild(mid);

    /* BOTTOM — what the state knows, then what the state is for. Three rows on
       every card, in the same slots, so the eye can compare two cards without
       re-learning where anything is. */
    var bottom = styleEl(document.createElement('div'), {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: g.band + 'px', width: '100%', flexShrink: '0',
    });
    bottom.appendChild(styleEl(document.createElement('div'), {
      height: '1px', width: '100%', background: active ? C.line : C.line2,
    }));
    var rows = styleEl(document.createElement('div'), {
      display: 'flex', flexDirection: 'column', gap: g.gap + 'px', width: '100%',
    });
    /* THREE SLOTS, ONE ORDER, EVERY CARD: reward, then time, then difficulty.
       The words change with the state — earned or up-to, spent or needed — but
       the row never moves, so two cards can be compared by looking at the same
       line twice instead of re-reading both. That is the whole reason the slots
       are fixed, and it is why PERFORMANCE is not one of them: it exists on
       exactly one of the three states, and a row that is present on a third of
       the deck is a row that shifts everything under it. It gets the footer,
       which is a better home for it anyway — a finished scenario's headline is
       how it went. */
    if (st === 'completed') {
      rows.appendChild(metaRow('XP earned', xpPill(s.outcome ? s.outcome.xp : 0), sm));
      rows.appendChild(metaRow('Time spent', metaValue(hhmm(s.outcome && s.outcome.minutes), sm), sm));
      /* Difficulty is a question you ask BEFORE you start — is this within
         reach today. Once the thing is finished the answer that matters is how
         it went, so the third slot swaps to Performance rather than reporting
         a rating for a decision nobody has to make again. Same slot, same
         line, different question. */
      rows.appendChild(metaRow('Performance', metaValue(s.outcome ? s.outcome.band : '—', sm), sm));
    } else {
      rows.appendChild(metaRow('Earn XP upto', xpPill(750), sm));
      rows.appendChild(metaRow('Time needed', metaValue('~' + hhmm(s.estimated_minutes || 0), sm), sm));
      rows.appendChild(metaRow('Difficulty', difficultyDots(s.difficulty, sm), sm));
    }
    bottom.appendChild(rows);
    bottom.appendChild(footer(item, sm));
    card.appendChild(bottom);
    return card;
  }

  /* ── put the world away ───────────────────────────────────────────────────
     The first pass hid the city IMAGE and called it done. It is not done: the
     app paints a stack of things over that image that are drawn white because
     they were drawn for a dark map — the Recruitment Hub sign, "Complete your
     training", the "unlocks after" line, the DRAG hint, the map markers, the
     leader line, and its own scenario card. On paper every one of them is
     white text on white, which is not invisible, it is a smear you cannot
     read. Chasing them one Tailwind class at a time is how that list got long
     in the first place.

     So this is a whitelist, not a hunt: find the container that holds BOTH the
     map and the HUD, keep only the children carrying something this home still
     needs, and hide the rest outright. Anything the app adds to that layer in
     future is hidden by default rather than discovered later as a white
     smudge. */
  function hideTheWorld() {
    var img = document.querySelector('img[alt="Zero World"], img[src*="zero-city"]');
    var keep = [
      document.querySelector('[aria-label*="day streak"]'),
      document.querySelector('[aria-label^="Level "]'),
      document.querySelector('button[aria-label="Settings"]'),
      document.querySelector('img[alt="Zero"]'),
      document.querySelector('div[class*="z-[90]"]'),
      document.getElementById('nx-portfolio-dock'),
      document.querySelector('nav[aria-label$="timeline"]'),
    ].filter(Boolean);
    if (!img || !keep.length) return;

    // the layer that holds BOTH the world and the chrome
    var root = img.parentElement;
    while (root && !keep.some(function (k) { return root.contains(k); })) root = root.parentElement;
    if (!root) return;

    /* PRUNE, don't sweep. The chrome is not a sibling of the world — the app
       stacks the map, the signage and the HUD inside the same
       `absolute inset-0 pointer-events-none` layer, so hiding every child of
       the root that has no keep in it hides nothing at all. Walk down instead,
       and at each level hide the branches that lead to no keep. What survives
       is exactly the paths to the things this home still uses. */
    var hidden = 0;
    (function prune(node, depth) {
      if (depth > 7) return;
      Array.prototype.slice.call(node.children).forEach(function (child) {
        if (keep.indexOf(child) !== -1) return; // this IS one of the keeps
        if (keep.some(function (k) { return child.contains(k); })) {
          prune(child, depth + 1); // on the path to one — go deeper
          return;
        }
        child.style.display = 'none';
        child.dataset.nxHidden = '1';
        hidden++;
      });
    })(root, 0);
    return hidden;
  }

  /* Re-skin the chrome for a light ground. Everything Zero draws here is built
     for a dark map; on white it either vanishes or reads as a hole. Scoped to
     the cards home so the City home is untouched. */
  /* ── the chrome, re-skinned for paper ────────────────────────────────────
     Everything Zero draws up here is built for a dark map: white type, white
     hairlines, dark glass surfaces. On white it either vanishes or reads as a
     hole. This translates it — and the translation is by RULE, not by element,
     because the element-by-element version is what let the credits panel ship
     as white-on-white for a week while two neighbouring pills were fine.

     Two mechanisms, because the app uses two:

     1. CLASSES. Tailwind's `text-white/NN` carries a hierarchy — full, 60-70%,
        30-50% — and a blanket `color:ink` flattens all of it. Each tier is
        mapped to its ink equivalent so the hierarchy survives the flip. The
        orange and gold accents use their own colour classes, never text-white,
        so they are untouched by design.

     2. INLINE. The glass surfaces come from glassPanel.ts as INLINE styles,
        which no class rule can reach. Those are repainted in JS below, on the
        HUD and on anything the HUD mounts later.

     Scope is every HUD root, not a hand-picked pair of pills. A panel that
     opens tomorrow inside any of them is covered on the day it lands. */
  var HUD = [
    'div[class*="z-[90]"]',              // the app bar and its credits panel
    '[aria-label^="Level "]',            // the XP pill and its level ladder
    '[aria-label*="day streak"]',        // the streak pill and its calendar
    'button[aria-label="Settings"]',
    '#nx-portfolio-dock',
  ];

  /** `scope descendant, scope descendant, …` for every HUD root. */
  function inHud(descendant) {
    return HUD.map(function (root) {
      return 'html[data-nx-home="cards"] ' + root + ' ' + descendant;
    }).join(',');
  }

  function lightChrome() {
    var css = document.createElement('style');
    css.id = 'nx-cards-chrome';
    css.textContent = [
      'html[data-nx-home="cards"] body{background:' + C.page + ' !important}',
      'html[data-nx-home="cards"] nav[aria-label$="timeline"]{display:none !important}',
      /* The app's own scenario card and the leader line that ties it to a
         building. hideTheWorld() prunes most of the world, but these two sit
         on the chrome's side of the tree — they have to be named. Dropping
         these two lines in a refactor put the dark card straight back over the
         deck, which is how they earned this comment. */
      'html[data-nx-home="cards"] div[class*="right-[90px]"][class*="inset-y-0"]{display:none !important}',
      'html[data-nx-home="cards"] svg[class*="z-[29]"]{display:none !important}',
      // the wordmark is a white SVG data-URI — invert it for paper
      'html[data-nx-home="cards"] img[alt="Zero"]{filter:invert(1) !important;opacity:.92}',

      // ── the pills themselves: glass -> paper ───────────────────────────
      'html[data-nx-home="cards"] button[aria-label="Settings"],' +
        'html[data-nx-home="cards"] #nx-portfolio-dock button,' +
        'html[data-nx-home="cards"] [aria-label^="Level "],' +
        'html[data-nx-home="cards"] [aria-label*="day streak"]{' +
        'background:' + C.card + ' !important;border-color:' + C.line + ' !important;' +
        'box-shadow:0 8px 24px -12px rgba(13,13,13,.18) !important;opacity:1 !important;' +
        'backdrop-filter:none !important;-webkit-backdrop-filter:none !important}',
      'html[data-nx-home="cards"] button[aria-label="Settings"] svg path,' +
        'html[data-nx-home="cards"] #nx-portfolio-dock button svg path{fill:' + C.tx + ' !important}',
      // the glass on the pills lives on an INNER div, not the labelled wrapper
      inHud('[class*="bg-[rgba(0,0,0"]') +
        '{background:transparent !important;backdrop-filter:none !important;' +
        '-webkit-backdrop-filter:none !important;border-color:' + C.line + ' !important}',

      // ── type, tier by tier ─────────────────────────────────────────────
      inHud('[class*="text-white"]') + '{color:' + C.tx + ' !important}',
      inHud('[class*="text-white/7"]') + ',' + inHud('[class*="text-white/6"]') +
        '{color:' + C.tx2 + ' !important}',
      inHud('[class*="text-white/5"]') + ',' + inHud('[class*="text-white/4"]') + ',' +
        inHud('[class*="text-white/3"]') + '{color:' + C.tx3 + ' !important}',

      // ── translucent-white sub-surfaces vanish on white ─────────────────
      inHud('[class*="bg-white/"]') + ',' + inHud('[class*="bg-[rgba(255,255,255"]') +
        '{background:rgba(13,13,13,0.055) !important;border-color:' + C.line + ' !important}',

      /* The one control in these panels: the + that adds XP or a streak day.
         It was a white glyph on a white-at-10% disc, which on paper is a ghost
         of a button. Given a real surface, a real edge and an ink glyph, it
         reads as something you can press — which is all it ever needed. */
      inHud('button:has(svg.lucide-plus)') +
        '{background:' + C.field + ' !important;box-shadow:inset 0 0 0 1px ' + C.line +
        ' !important;transition:background 160ms ease}',
      inHud('button:has(svg.lucide-plus):hover') + '{background:#e6e6e3 !important}',

      // ── popover surfaces and their caret ───────────────────────────────
      inHud('[class*="top-full"] > div') +
        '{background:' + C.card + ' !important;border:1px solid ' + C.line + ' !important;' +
        'box-shadow:0 24px 60px -24px rgba(13,13,13,0.28) !important;' +
        'backdrop-filter:none !important;-webkit-backdrop-filter:none !important}',
      inHud('[class*="rotate-45"]') +
        '{background:' + C.card + ' !important;border:1px solid ' + C.line + ' !important}',

      // ── the app bar's own shell ────────────────────────────────────────
      'html[data-nx-home="cards"] div[class*="z-[90]"] > div{background:rgba(13,13,13,0.04) !important}',
      'html[data-nx-home="cards"] div[class*="z-[90]"] button' +
        '{background:' + C.card + ' !important;box-shadow:0 0 0 1px ' + C.line + ' !important}',
      'html[data-nx-home="cards"] div[class*="z-[90]"] button *{color:' + C.tx + ' !important}',

      // the portfolio ring's empty track has to be visible on paper
      'html[data-nx-home="cards"] #nx-portfolio-dock circle[stroke="rgba(255,255,255,0.16)"]{' +
        'stroke:rgba(13,13,13,.14) !important}',
      // the debug panel keeps its dark treatment — it is not part of the design
    ].join('\n');
    document.head.appendChild(css);
    document.documentElement.dataset.nxHome = 'cards';
    paperizeHud();
  }

  /* ── the surfaces CSS cannot reach ───────────────────────────────────────
     `glassPanel.ts` writes its dark glass as an inline style, so no class rule
     touches it and the panel opens as a ghost: transparent surface, ink text
     on the page behind it. Repaint anything whose own inline background is
     DARK — measured, not guessed by selector, so a panel that has not been
     written yet is covered the moment it mounts.

     Only the background and the blur are taken. Shape, padding and the
     accents are the app's to keep. */
  function rgba(str) {
    str = str || '';
    var r, g, b, a = 1;
    // hex as well as rgb(): SVG presentation attributes are written `#fff`,
    // and the credits mark's centre dot is exactly that
    var hex = /^\s*#([0-9a-f]{3}|[0-9a-f]{6})\s*$/i.exec(str);
    if (hex) {
      var h = hex[1];
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      r = parseInt(h.slice(0, 2), 16);
      g = parseInt(h.slice(2, 4), 16);
      b = parseInt(h.slice(4, 6), 16);
      return {
        r: r, g: g, b: b, a: 1,
        lum: 0.299 * r + 0.587 * g + 0.114 * b,
        spread: Math.max(r, g, b) - Math.min(r, g, b),
      };
    }
    var m = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/.exec(str);
    if (!m) return null;
    r = +m[1]; g = +m[2]; b = +m[3];
    return {
      r: r, g: g, b: b,
      a: m[4] === undefined ? 1 : +m[4],
      lum: 0.299 * r + 0.587 * g + 0.114 * b,
      spread: Math.max(r, g, b) - Math.min(r, g, b), // 0 = neutral, high = a hue
    };
  }

  /* The deck's own XP number colour, so an award in flight and an award
     banked on a card are the same gold. */
  var XP_INK = '#8a6d00';

  /** Is this sitting on a coloured chip, or loose on the paper? */
  function onTint(el) {
    var p = el;
    for (var i = 0; i < 6 && p; i++, p = p.parentElement) {
      var b = rgba(getComputedStyle(p).backgroundColor);
      if (b && b.a > 0.05) return b.spread >= 20;
    }
    return false;
  }

  function paperize(node, selfOnly) {
    if (!node || node.nodeType !== 1) return;
    // An attribute change touches ONE node; re-walking its whole subtree on
    // every React re-style is how a translator turns into a hot loop.
    var all = selfOnly ? [node] : [node].concat(Array.prototype.slice.call(node.querySelectorAll('*')));
    all.forEach(function (el) {
      if (!el.style) return;

      // ── surfaces: a dark inline background becomes paper ───────────────
      /* Remember what the app authored. The first pass can run before the
         element has been laid out, so the panel-or-tile test below can get the
         wrong answer — and once a panel had been painted with the tile's wash
         it no longer looked dark, so no later pass ever reconsidered it. The
         original value is kept so every settle pass re-decides from scratch. */
      if (el.dataset && el.dataset.nxBg0 === undefined) {
        var authored = el.style.background || el.style.backgroundColor || '';
        if (rgba(authored)) el.dataset.nxBg0 = authored;
      }
      var bg = rgba((el.dataset && el.dataset.nxBg0) || el.style.background || el.style.backgroundColor);
      if (bg && bg.lum <= 96) {
        /* A PANEL becomes paper. A TILE INSIDE a panel must not — painting it
           the same white as the surface it sits on erases it, which is exactly
           what happened to the locked streak tiers: dark glass tile on a dark
           panel became white tile on a white panel, i.e. nothing. Small dark
           surfaces become a wash instead, so they stay their own object. */
        var r = el.getBoundingClientRect();
        // radius is the other tell: panels in this app are rounded 20 and up,
        // tiles are 14 and under — and radius is known before layout is
        var radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
        var isPanel = (r.width > 150 && r.height > 70) || radius >= 20;
        el.style.setProperty('background', isPanel ? C.card : 'rgba(13,13,13,0.04)', 'important');
        el.style.setProperty('backdrop-filter', 'none', 'important');
        el.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
        if (isPanel) {
          el.style.setProperty('border-color', C.line, 'important');
          el.style.setProperty('box-shadow', '0 24px 60px -24px rgba(13,13,13,0.28)', 'important');
        }
      }

      /* ── everything else, read from the COMPUTED value ─────────────────
         Not from the inline style. The app paints white through four different
         channels — `color`, an svg `fill`, an svg `stroke`, a border — from
         classes, from attributes and from inline styles, and only the computed
         value knows what actually landed. The icons were the proof: the plus
         and the ladder marks are `stroke: rgba(255,255,255,.85)` on the SVG
         itself, which no `color` rule on earth reaches. Reading the computed
         value catches all four in one pass and needs no list to maintain.

         The alpha IS the hierarchy — the app writes white at 1 / .6 / .5 for
         primary, secondary, tertiary — so it maps to the three inks rather
         than flattening to one. NEUTRAL only: `spread` keeps the streak orange
         and the XP gold out of it, since those already read on paper and are
         the accent the panel is built on. */
      var cs = getComputedStyle(el);
      var ink = function (a) { return a >= 0.85 ? C.tx : a >= 0.55 ? C.tx2 : C.tx3; };
      var white = function (v) {
        var c = rgba(v);
        return c && c.lum > 195 && c.spread < 30 ? c : null;
      };

      var fg = white(cs.color);
      if (fg) el.style.setProperty('color', ink(fg.a), 'important');

      /* ── the awards, which are a HUE and still illegible ────────────────
         "+500 XP" flies up when you earn, in the XP gold, over a dark map with
         a dark drop shadow holding it up. On paper the gold has nothing to sit
         against and the shadow does nothing at all — the number arrives
         invisible. Neutral translation cannot help: gold is the point.

         So warm type is judged on WHAT IS BEHIND IT rather than on its own
         value. On a coloured chip — the streak's peach tile, the XP pill — the
         gold is doing its job and is left alone. Floating on paper it takes
         the same deep gold the deck's own XP pill uses, so the two read as one
         currency, and the shadow that was propping it up is dropped. */
      var warm = rgba(cs.color);
      if (warm && warm.spread >= 40 && warm.lum > 172 && warm.r >= warm.b && !onTint(el)) {
        el.style.setProperty('color', XP_INK, 'important');
      }
      if (cs.textShadow && cs.textShadow !== 'none') {
        var ts = rgba(cs.textShadow);
        if (ts && ts.lum < 110) el.style.setProperty('text-shadow', 'none', 'important');
      }

      if (el.namespaceURI === 'http://www.w3.org/2000/svg') {
        /* ⚠️ A MASK IS NOT A COLOUR. Sanjay's credits mark is two overlapping
           coins: the back one is knocked out by a `<mask>` whose rect is
           `fill="#fff"` (show) and whose circle is `fill="#000"` (hide) — a
           LUMINANCE channel, not paint. Repainting that white rect as ink told
           the mask to hide everything, the back coin vanished, and the stacked
           coins collapsed into a plain ringed dot. Same trap for clip paths,
           filters and gradient stops. Skip the lot: nothing inside them is a
           colour anybody sees. */
        if (el.closest('mask, clipPath, filter, linearGradient, radialGradient, pattern, defs')) {
          return;
        }
        /* Presentation ATTRIBUTES as well as the style property. An SVG can be
           painted either way, and the ring's track segments are written as
           `stroke="rgba(255,255,255,0.16)"` attributes — which survived every
           CSS-shaped fix, `!important` included. Rewrite the attribute in the
           same channel it was written in and the argument does not arise. */
        /* An OUTLINE is not weighted like a fill. White at full strength on a
           dark panel is a quiet line; black at full strength on paper is a
           heavy one, and the credits coin at 15px turns into a blot. Strokes
           drop a tier so the icon lands at the weight it had on the map —
           present, grey, not shouting. */
        var strokeInk = function (a) {
          return a >= 0.85 ? C.tx2 : a >= 0.5 ? C.tx3 : 'rgba(13,13,13,0.26)';
        };
        /* Fill takes the same softened scale as stroke INSIDE an icon: the
           coins' rings and the dot at their centre are one white in the dark
           version, so they have to be one grey here. Two tiers would read as
           two marks stuck together. */
        [['fill', strokeInk], ['stroke', strokeInk]].forEach(function (pair) {
          var k = pair[0], to = pair[1];
          var attr = white(el.getAttribute(k));
          if (attr) el.setAttribute(k, to(attr.a));
          var comp = cs[k] !== 'none' && white(cs[k]);
          if (comp) el.style.setProperty(k, to(comp.a), 'important');
        });
      }

      // every side, not just the top — a rule drawn as a single left border is
      // as common in this app as a full box
      ['Top', 'Right', 'Bottom', 'Left'].forEach(function (side) {
        var bd = white(cs['border' + side + 'Color']);
        if (bd && bd.a > 0.02 && parseFloat(cs['border' + side + 'Width']) > 0) {
          el.style.setProperty('border-' + side.toLowerCase() + '-color', C.line, 'important');
        }
      });

      /* BOX-SHADOW. The fourth way this app draws an edge, and the one that
         outlines the locked streak tiers: `inset 0 0 0 1px rgba(255,255,255,
         .07)`. A shadow is a compound value, so each colour stop inside it is
         translated in place and the geometry — inset, offsets, spread — is
         left exactly as authored. Ink needs a little more alpha than white to
         carry the same hairline, hence the nudge and the floor. */
      var shadow = cs.boxShadow;
      if (shadow && shadow !== 'none') {
        var swapped = shadow.replace(/rgba?\([^)]+\)/g, function (stop) {
          var c = rgba(stop);
          if (!c || c.lum <= 195 || c.spread >= 30) return stop;
          /* Proportional, and UNDER 1x. Ink reads heavier than white at the
             same alpha, so a 7% white hairline promoted to 8.6% ink turned the
             credits panel's two rows into a hard square-cornered box inside a
             26px-rounded panel. Same value, quieter ink. */
          return 'rgba(13,13,13,' + Math.min(0.14, c.a * 0.8).toFixed(3) + ')';
        });
        /* A HAIRLINE RING ON A SQUARE CORNER IS NOT AN OUTLINE, IT IS A ROW.
           The credits panel's Effort and Usage rows each carry a full 1px ring
           that is invisible at 10% white on dark glass. Translated faithfully
           it becomes two stacked square-cornered rectangles inside a 26px
           panel — the box Sanjay circled. On paper the thing that ring was
           doing is SEPARATING, so it becomes the rule that separates: a bottom
           hairline, and the enclosure goes. Narrow on purpose — a ring on a
           rounded element is a real outline and is left alone. */
        var ring = /^rgba?\([^)]+\)\s+0px\s+0px\s+0px\s+1(?:\.\d+)?px(\s+inset)?$/.test(swapped.trim());
        var radius0 = parseFloat(getComputedStyle(el).borderTopLeftRadius) === 0;
        if (ring && radius0 && el.getBoundingClientRect().width > 120) {
          el.style.setProperty('box-shadow', 'inset 0 -1px 0 rgba(13,13,13,0.07)', 'important');
        } else if (swapped !== shadow) {
          el.style.setProperty('box-shadow', swapped, 'important');
        }
      }

      /* Translucent-white SURFACES — the XP track, the ladder's rails, the
         little sub-panels. These are a VALUE, not a colour: white at 22% on a
         dark panel is a subtle lift, and its equivalent on paper is ink at the
         same kind of lift, not a warm wash that disappears. Halved and capped,
         because ink reads much heavier than white at the same alpha. A solid
         white (alpha 1) is the panel itself and is left alone. */
      var surface = white(cs.backgroundColor);
      if (surface && surface.a > 0.02 && surface.a < 0.6) {
        el.style.setProperty(
          'background-color',
          'rgba(13,13,13,' + Math.min(0.13, surface.a * 0.55).toFixed(3) + ')',
          'important'
        );
      }
    });
  }

  function paperizeHud() {
    /* A few settle passes on top of the observer. Panels mount, animate and
       re-render across several frames, and an observer batch can hand back a
       node whose styles are still a frame behind. These passes are cheap,
       bounded and idempotent — anything already translated reads as ink and
       falls straight through. */
    [0, 160, 600, 1500].forEach(function (t) {
      setTimeout(function () {
        HUD.forEach(function (sel) {
          var root = document.querySelector(sel);
          if (root) paperize(root);
        });
      }, t);
    });

    HUD.forEach(function (sel) {
      var root = document.querySelector(sel);
      if (!root) return;
      paperize(root);
      /* childList catches a panel MOUNTING; attributes catch React re-styling
         a node that is already there, which is how one white hairline survived
         every sweep — the element never moved, its class just changed under
         it. Both, or the translation is only true at mount. */
      new MutationObserver(function (recs) {
        recs.forEach(function (rec) {
          if (rec.type === 'attributes') paperize(rec.target, true);
          else Array.prototype.forEach.call(rec.addedNodes, paperize);
        });
      }).observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style'],
      });
    });
  }

  function initCardsHome(nav, rail) {
    lightChrome();
    installCtaCss();

    hideTheWorld();

    // company logos come from the rail's own chips, so the marks always match
    LOGOS = {};
    (rail.segments || []).forEach(function (seg) {
      seg.chips.forEach(function (c) { if (c.company && c.logo) LOGOS[c.company] = c.logo; });
    });

    var items = deck();
    if (!items.length) return;
    var doneN = window.__NX_ROADMAP.completedCount;
    var currentIdx = items.findIndex(function (it) { return it.status === 'current'; });
    if (currentIdx < 0) currentIdx = 0;
    // the journey is still sixteen scenarios — only the DECK is art-filtered
    var totalJourney = window.__NX_ROADMAP.categories.reduce(function (n, c) {
      return n + c.scenarios.length;
    }, 0);

    var layer = styleEl(document.createElement('div'), {
      position: 'absolute', inset: '0', zIndex: '15',
      display: 'flex', flexDirection: 'column', pointerEvents: 'auto',
      /* The stage from the mock: white falling into a soft mint→aqua wash.
         Quiet on purpose — the cards carry the color, the ground carries air. */
      background:
        'linear-gradient(180deg,#FAFAF9 0%,#F3F8F3 45%,#DDF0E5 74%,#C3E4E7 100%)',
    });

    /* The wordmark, aligned to the streak/XP pills' centreline so the top
       reads as ONE row. Measured at runtime: the pills live in the scaled
       canvas, this layer does not. */
    var appMark = document.querySelector('img[alt="Zero"]');
    if (appMark) {
      var mark = styleEl(document.createElement('img'), {
        position: 'absolute',
        left: '64px',
        top: '78px',
        height: '28px',
        width: 'auto',
        filter: 'invert(1)',
        opacity: '.92',
        zIndex: '3',
      });
      mark.src = appMark.getAttribute('src');
      mark.alt = 'Zero';
      layer.appendChild(mark);
      // measure twice: once now, once after the canvas transform settles —
      // the first pass can catch the pills mid-layout and land ~13px high
      var alignMark = function () {
        var pills = document.querySelector('[aria-label*="day streak"]');
        if (!pills) return;
        var y = pills.getBoundingClientRect();
        if (y.height > 0) mark.style.top = Math.round(y.top + y.height / 2 - 14) + 'px';
      };
      requestAnimationFrame(alignMark);
      setTimeout(alignMark, 600);
      addEventListener('resize', alignMark);
    }

    /* ── the landing ──────────────────────────────────────────────────────
       On the city home the world does this job: you arrive somewhere, and the
       place tells you where you are. Strip the city out and sixteen cards open
       cold — a shelf, with no one on the other side of it. So this home opens
       by addressing the person and saying where they have got to, and the deck
       becomes the second thing you read rather than the only thing.

       Everything in it is read, not written: the journey's own title, its
       completed count, and the scenario that is current. The one authored
       string is the name, which the prototype has no session to ask. */
    var YOU = 'Sanjay';

    var hero = styleEl(document.createElement('div'), {
      // clears the Variants panel, which is centred at the top of every
      // screen in this prototype — a centred title at 112 sat straight behind it
      flex: '0 0 auto', padding: '178px 64px 26px', display: 'flex',
      flexDirection: 'column', alignItems: 'center',
    });

    /* ONE LINE. The first version added a "next up" sentence and a progress
       bar under the greeting, and both were already on the screen: the deck
       opens on the scenario you are next, and the timeline under it counts the
       journey. Saying it three times did not make it clearer, it made the top
       of the screen busy. What is left is the only thing the deck cannot say
       for itself — that somebody is being spoken to. */
    var hello = styleEl(document.createElement('h1'), {
      font: '400 46px/1.05 ' + SERIF, letterSpacing: '-0.02em', color: C.tx,
      margin: '0', textAlign: 'center',
    });
    hello.textContent = 'Welcome back, ' + YOU;
    hero.appendChild(hello);

    /* ⚠️ NAMES ARE SHARED HERE. This whole home is one function scope, and
       `line`, `track`, `fill` and `head` are all taken by the deck and the
       timeline below. An earlier version of this header quietly reassigned the
       timeline's `line()` helper and took the screen down with it. Check
       before you name. */
    layer.appendChild(hero);

    /* ── the deck rides a timeline ────────────────────────────────────────
       Sixteen cards in a row is a shelf. The same sixteen hung off one
       continuous line is a journey: the line is solid green up to where you
       stand and faint past it, so the shape of the whole thing is readable
       before a single word is.

       Both rows live in ONE horizontally-scrolling track and use the SAME gap
       and the SAME per-card widths, which is what keeps a node under the
       centre of its card at any scroll position. (A separately-scrolled rail
       synced by listener drifts by a frame on every flick.) */
    var GAP = 44, PAD_X = 76;

    var scroller = styleEl(document.createElement('div'), {
      flex: '1 1 auto', overflowX: 'auto', overflowY: 'hidden',
      scrollSnapType: 'x mandatory', scrollbarWidth: 'none',
      display: 'flex', alignItems: 'center',
    });
    scroller.className = 'nx-deck';

    var track = styleEl(document.createElement('div'), {
      display: 'flex', flexDirection: 'column', width: 'max-content', margin: '0 auto',
      // The header carries the top of the screen now, so the track no longer
      // needs its own optical shove downward.
      paddingTop: '0px',
    });
    var cardsRow = styleEl(document.createElement('div'), {
      display: 'flex', alignItems: 'flex-end', gap: GAP + 'px', padding: '16px ' + PAD_X + 'px 0',
    });
    /* THE DECK. One card per scenario, in the journey's own order — the only
       spine this deck has. (Category looked like an obvious second axis and is
       a trap: the sequence INTERLEAVES the five categories, so a "new chapter
       here" rule fires eight times and marks nothing. Built it, saw it, took
       it out.) */
    var cards = [];
    items.forEach(function (item, i) {
      var card =
        item.kind === 'training' ? buildTraining(item, i)
        : item.kind === 'goal' ? buildGoal(item, i, rail)
        : buildCard(item, i);
      /* Clicking a card brings it to the middle. Obvious in hindsight; the
         first pass could only be steered from the dots underneath it, which
         meant the biggest targets on the screen did nothing. The button inside
         the current card keeps its own click. */
      card.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('button')) return;
        scrollToIndex(i);
      });
      cardsRow.appendChild(card);
      cards.push(card);
    });

    /* ── the timeline ────────────────────────────────────────────────────
       Rebuilt as ONE line with computed positions. The first version drew a
       left half-line and a right half-line inside each card's cell and let
       them meet in the gaps — which they did, to within a rounded end and a
       subpixel, and the result was a rail with a nick in it under every card.
       A line that describes a continuous journey cannot itself be dashed by
       accident.

       Positions are arithmetic, not measured: every card's width is known
       before anything renders, so a node's centre is
       PAD_X + Σ(widths and gaps before it) + its own half-width. No layout
       read, nothing to re-sync, and the rail cannot drift from the deck. */
    var NODE_BOX = 40;
    var W = items.map(function (it) {
      return it.status === 'current' && !it.kind ? GEO.current.w : GEO.other.w;
    });
    var xs = [];
    var run = PAD_X;
    W.forEach(function (w) { xs.push(run + w / 2); run += w + GAP; });
    var railW = run - GAP + PAD_X;

    var railRow = styleEl(document.createElement('div'), {
      position: 'relative', width: railW + 'px', height: '78px', flexShrink: '0',
      margin: '28px 0 30px',
    });

    function line(x1, x2, colour, z) {
      return styleEl(document.createElement('span'), {
        position: 'absolute', left: x1 + 'px', width: Math.max(0, x2 - x1) + 'px',
        top: NODE_BOX / 2 - 1.5 + 'px', height: '3px', borderRadius: '3px',
        background: colour, zIndex: String(z || 1),
      });
    }
    // the whole road first, then the part of it you have walked over the top
    railRow.appendChild(line(xs[0], xs[xs.length - 1], 'rgba(13,13,13,0.11)', 1));
    railRow.appendChild(line(xs[0], xs[currentIdx], 'rgba(63,185,104,0.8)', 2));

    var cells = [];
    items.forEach(function (item, i) {
      var cell = styleEl(document.createElement('div'), {
        position: 'absolute', left: xs[i] + 'px', top: '0', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: '3',
        cursor: 'pointer',
      });
      var box = styleEl(document.createElement('div'), {
        height: NODE_BOX + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      });
      var node = document.createElement('span');
      node.className =
        'nx-node nx-node-' + item.status +
        (item.kind === 'training' ? ' nx-node-training' : '') +
        (item.kind === 'goal' ? ' nx-node-goal' : '');
      if (item.kind === 'goal') {
        var badge = jobPortalIcon(rail);
        if (badge) node.appendChild(badge);
      }
      box.appendChild(node);
      cell.appendChild(box);

      var num = styleEl(document.createElement('span'), {
        font: (item.status === 'current' ? '500 ' : '400 ') + '12px/1 ' + MONO,
        letterSpacing: '0.06em', marginTop: '8px',
        color: item.status === 'current' ? C.tx : item.status === 'completed' ? C.tx2 : C.tx3,
      });
      // a training has no place in the numbering — the scenarios are what is
      // counted, and giving it a number would push every count off by five
      num.textContent = item.kind
        ? ''
        : (item.s.sequence_order < 10 ? '0' : '') + item.s.sequence_order;
      cell.appendChild(num);

      cell.setAttribute('role', 'button');
      cell.setAttribute('tabindex', '0');
      cell.setAttribute(
        'aria-label',
        (item.kind === 'training' ? 'Training, ' + item.category : item.s.title) +
          ', ' + STATE_LABEL[item.status]
      );
      if (item.kind === 'goal') cell.style.cursor = 'pointer';
      cell.addEventListener('click', function () { scrollToIndex(i); });
      cell.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToIndex(i); }
      });

      railRow.appendChild(cell);
      cells.push(cell);
    });


    /* Both rows in ONE scroll container: the deck and its rail have to move as
       a single object, and a rail synced to the deck by a scroll listener
       drifts by a frame on every flick. */
    track.appendChild(cardsRow);
    track.appendChild(railRow);
    scroller.appendChild(track);
    layer.appendChild(scroller);

    function scrollToIndex(i) {
      var el = cards[Math.max(0, Math.min(cards.length - 1, i))];
      if (el) el.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
    }

    /* WHAT BROWSING CHANGES, AND WHAT IT MUST NOT. The first pass moved
       SOLIDITY with the scroll — the centred card went white, the rest went
       translucent — which is a lovely physical read and quietly destroys the
       thing this deck is for: a finished scenario in the centre then looks
       exactly like the one you are on. Solidity now belongs to state and
       nothing else. Browsing gets its own channel: the centred card lifts, and
       its node opens. */
    function setCentred(idx) {
      cards.forEach(function (c, i) {
        var on = i === idx;
        c.classList.toggle('nx-on', on);
        cells[i].classList.toggle('nx-cell-on', on);
      });
    }

    /* ⚠️ SCREEN PIXELS AND LAYOUT PIXELS ARE NOT THE SAME PIXELS HERE. The app
       draws on a fixed design canvas that is scaled to fit the window (0.75 at
       1440x900), and this deck lives inside it. `getBoundingClientRect()`
       reports the SCALED, on-screen box; `clientWidth` and `scrollLeft` are in
       the UNSCALED layout space. Mixing the two put the centre a few hundred
       pixels off and opened the deck with the current card at the edge of the
       screen. Compare rects with rects, and convert once when writing scroll. */
    function scrollportMid() {
      var sr = scroller.getBoundingClientRect();
      return sr.left + sr.width / 2;
    }

    var raf = 0;
    scroller.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var mid = scrollportMid();
        var best = 0, bestD = Infinity;
        cards.forEach(function (c, i) {
          var r = c.getBoundingClientRect();
          var d = Math.abs(r.left + r.width / 2 - mid);
          if (d < bestD) { bestD = d; best = i; }
        });
        setCentred(best);
      });
    });

    var host = nav.parentElement || document.body;
    host.insertBefore(layer, host.firstChild);

    /* Open on the scenario you are actually on — jumped, not scrolled: an
       animated arrival from card one reads as a tour nobody asked for.

       NOT rAF ALONE. A backgrounded or throttled tab never runs the frame, and
       the deck then opens on scenario one — which is the single worst first
       impression this screen can make, because it says the journey has not
       started. Three chances, all idempotent, and every one of them stops as
       soon as the reader has scrolled for themselves. */
    var touched = false;
    scroller.addEventListener('wheel', function () { touched = true; }, { passive: true });
    scroller.addEventListener('pointerdown', function () { touched = true; });

    function openOnCurrent() {
      if (touched) return;
      var el = cards[currentIdx];
      if (!el) return;
      // scrollIntoView does the scaled-space conversion itself, which is why
      // it is used here rather than arithmetic on scrollLeft.
      el.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
      setCentred(currentIdx);
    }
    requestAnimationFrame(openOnCurrent);
    setTimeout(openOnCurrent, 0);
    if (document.readyState !== 'complete') window.addEventListener('load', openOnCurrent);
    // the title art is what gives a card its height on a slow connection
    setTimeout(openOnCurrent, 700);
  }

  NX.onRail(function (nav, rail) { initCardsHome(nav, rail); });
})();
