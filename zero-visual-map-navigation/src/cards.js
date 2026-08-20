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
    return out.sort(function (a, b) { return a.s.sequence_order - b.s.sequence_order; });
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
      display: 'flex', height: small ? '26px' : '30px', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 16px', width: '100%',
    });
    var l = styleEl(document.createElement('span'), {
      font: '400 ' + (small ? '14px' : '16px') + '/1 ' + MONO, textTransform: 'uppercase',
      color: C.tx3, whiteSpace: 'nowrap',
    });
    l.textContent = label;
    r.appendChild(l);
    r.appendChild(valueNode);
    return r;
  }

  function metaValue(text, small) {
    var v = styleEl(document.createElement('span'), {
      font: '500 ' + (small ? '16px' : '18px') + '/1.2 ' + SANS, color: C.tx,
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
      /* One live thing on the screen, on the one card that is live. A steady
         ring rather than a flashing dot: it reads as "running", not "alert". */
      '.nx-live-dot{width:8px;height:8px;border-radius:999px;background:#3fb968;position:relative}',
      '.nx-live-dot::after{content:"";position:absolute;inset:-4px;border-radius:999px;' +
        'box-shadow:0 0 0 1.5px rgba(63,185,104,0.5);animation:nx-live 2.2s ease-out infinite}',
      '@keyframes nx-live{0%{transform:scale(.7);opacity:.9}70%,100%{transform:scale(1.25);opacity:0}}',
      /* The stop on the timeline. Size is the hierarchy: done is a mark, ahead
         is a smaller and fainter mark, and now is the only one with a ring
         around it. */
      '.nx-node{width:13px;height:13px;border-radius:999px;flex:0 0 auto;position:relative;' +
        'transition:transform 260ms cubic-bezier(.22,.61,.36,1), box-shadow 260ms ease}',
      '.nx-node-completed{background:#3fb968}',
      '.nx-node-locked{background:#FAFAF9}',
      '.nx-node-locked{width:11px;height:11px;margin-top:1px;background:transparent;' +
        'box-shadow:inset 0 0 0 1.5px ' + C.tx4 + '}',
      '.nx-node-current{width:19px;height:19px;margin-top:-3px;background:#3fb968;' +
        'box-shadow:0 0 0 4.5px rgba(63,185,104,0.20), 0 0 0 1.5px rgba(255,255,255,0.95)}',
      /* Resting, hovered, centred — three heights, so the deck answers the
         cursor before it is clicked. Transform lives here rather than inline,
         or the centred card's own inline transform would out-rank :hover. */
      '.nx-card{cursor:pointer;transform:translateY(0)}',
      '.nx-card:not(.nx-on):hover{transform:translateY(-7px)}',
      '.nx-card.nx-on{cursor:default;transform:translateY(-10px)}',
      '@media (prefers-reduced-motion: reduce){.nx-card,.nx-card:hover,.nx-card.nx-on{transform:none}}',
      '.nx-cell-on .nx-node{transform:scale(1.25)}',
      '.nx-node-goal{width:26px;height:26px;margin-top:-8px;background:' + C.card + ';' +
        'display:grid;place-items:center;box-shadow:inset 0 0 0 1.5px ' + C.line + ', 0 6px 16px -8px rgba(13,13,13,.25)}',
      '.nx-cell-on .nx-node-locked{box-shadow:inset 0 0 0 1.5px ' + C.tx3 + '}',
      '@media (prefers-reduced-motion: reduce){.nx-live-dot::after{animation:none}}',
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
  var GEO = {
    current: { w: 484, h: 724, pad: '18px 24px 24px', art: 252, name: 26, r: 40 },
    other: { w: 392, h: 606, pad: '15px 19px 19px', art: 186, name: 20, r: 34 },
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
      '0 2px 4px -2px rgba(13,13,13,0.06), 0 40px 80px -30px rgba(13,13,13,0.34)',
  };

  var STATE_CHIP = {
    completed: { label: 'Completed', bg: 'rgba(63,185,104,0.10)', ring: 'rgba(63,185,104,0.30)', fg: '#2c7d47' },
    current: { label: 'In progress', bg: 'rgba(63,185,104,0.12)', ring: 'rgba(63,185,104,0.34)', fg: '#2c7d47' },
    locked: { label: 'Upcoming', bg: 'rgba(13,13,13,0.035)', ring: 'rgba(13,13,13,0.075)', fg: C.tx2 },
  };

  function stateChip(status) {
    var t = STATE_CHIP[status];
    var c = styleEl(document.createElement('span'), {
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      borderRadius: '999px', padding: '8px 15px 8px 12px', flexShrink: '0',
      background: t.bg, boxShadow: 'inset 0 0 0 1px ' + t.ring,
      backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
    });
    var mark =
      status === 'current'
        ? '<span class="nx-live-dot"></span>'
        : status === 'completed'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + t.fg +
          '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M20 6 9 17l-5-5"/></svg>'
        : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="' + C.tx3 +
          '" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
          '<rect x="4" y="10.5" width="16" height="10.5" rx="2.5"/><path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5"/></svg>';
    c.innerHTML =
      mark +
      '<span style="font:500 13px/1 ' + SANS + ';letter-spacing:-0.01em;color:' + t.fg + '">' +
      t.label + '</span>';
    return c;
  }

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
    if (logo) {
      var size = Math.round(box * 0.44);
      wrap.innerHTML =
        '<img src="' + logo + '" aria-hidden="true" style="position:absolute;width:' + size +
        'px;height:' + size + 'px;object-fit:contain;filter:blur(46px);opacity:' +
        (dim ? '0.16' : '0.34') + '"/>' +
        '<img src="' + logo + '" alt="" style="position:relative;width:' + size + 'px;height:' +
        size + 'px;object-fit:contain;filter:' + (dim ? 'grayscale(1)' : 'none') +
        ';opacity:' + (dim ? '0.5' : '1') + '"/>';
    } else {
      wrap.innerHTML =
        '<span style="font:400 34px/1 ' + SERIF + ';letter-spacing:-0.02em;color:' +
        (dim ? C.tx3 : C.tx2) + '">' + companyName + '</span>';
    }
    return wrap;
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
      padding: (small ? '15px' : '17px') + ' 0',
    });
    if (st === 'completed') {
      // Gold is reward and green is state, and they are kept apart on purpose:
      // one card wearing both says neither.
      var xp = item.s.outcome ? item.s.outcome.xp : 0;
      d.style.background = 'rgba(255,183,58,0.12)';
      d.style.boxShadow = 'inset 0 0 0 1.5px rgba(255,183,58,0.42)';
      d.innerHTML =
        STAR +
        '<span style="font:500 ' + (small ? '16px' : '17px') + '/1.3 ' + SANS +
        ';letter-spacing:-0.02em;color:#8a6d00;white-space:nowrap">' +
        Number(xp).toLocaleString() + ' XP earned</span>';
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

    /* HEAD — the state, on every card, in the same place. */
    var head = styleEl(document.createElement('div'), {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '100%', flexShrink: '0',
    });
    head.appendChild(stateChip(st));
    card.appendChild(head);

    /* MIDDLE — the art, given the room it was missing. The title art is the
       most valuable thing on the card and it was floating in the middle of a
       column of air; now it takes the space and the air comes out of the top. */
    var mid = styleEl(document.createElement('div'), {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: active ? '18px' : '14px',
      flex: '1 1 auto', justifyContent: 'center', minHeight: '0', width: '100%',
    });

    var companyName = s.company ? s.company.name : '';
    var art = ART[companyName];
    var artBox = styleEl(document.createElement('div'), {
      position: 'relative', display: 'grid', placeItems: 'center', flexShrink: '0',
      height: g.art + 'px', width: '100%',
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
    card.appendChild(mid);

    /* BOTTOM — what the state knows, then what the state is for. Three rows on
       every card, in the same slots, so the eye can compare two cards without
       re-learning where anything is. */
    var bottom = styleEl(document.createElement('div'), {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: active ? '22px' : '18px', width: '100%', flexShrink: '0',
    });
    bottom.appendChild(styleEl(document.createElement('div'), {
      height: '1px', width: '100%', background: active ? C.line : C.line2,
    }));
    var rows = styleEl(document.createElement('div'), {
      display: 'flex', flexDirection: 'column', gap: active ? '16px' : '13px', width: '100%',
    });
    if (st === 'completed') {
      rows.appendChild(metaRow('Performance', metaValue(s.outcome ? s.outcome.band : '—', sm), sm));
      rows.appendChild(metaRow('Time spent', metaValue(hhmm(s.outcome && s.outcome.minutes), sm), sm));
      rows.appendChild(metaRow('Difficulty', difficultyDots(s.difficulty, sm), sm));
    } else {
      rows.appendChild(metaRow('Time needed', metaValue('~' + hhmm(s.estimated_minutes || 0), sm), sm));
      rows.appendChild(metaRow('Difficulty', difficultyDots(s.difficulty, sm), sm));
      rows.appendChild(metaRow('Earn XP upto', xpPill(750), sm));
    }
    bottom.appendChild(rows);
    bottom.appendChild(footer(item, sm));
    card.appendChild(bottom);
    return card;
  }

  /* Re-skin the chrome for a light ground. Everything Zero draws here is built
     for a dark map; on white it either vanishes or reads as a hole. Scoped to
     the cards home so the City home is untouched. */
  function lightChrome() {
    var css = document.createElement('style');
    css.id = 'nx-cards-chrome';
    css.textContent = [
      'html[data-nx-home="cards"] body{background:' + C.page + ' !important}',
      // the wordmark and the HUD pills are white-on-dark by design
      'html[data-nx-home="cards"] nav[aria-label$="timeline"]{display:none !important}',
      // the wordmark is a white SVG data-URI — invert it for paper
      'html[data-nx-home="cards"] img[alt="Zero"]{filter:invert(1) !important;opacity:.92}',
      // The app's own dark scenario card is the CITY home's subject; on the
      // deck every scenario already has a card, so it is a duplicate. Its real
      // wrapper is the right-hand column, not the inner card.
      'html[data-nx-home="cards"] div[class*="right-[90px]"][class*="inset-y-0"]{display:none !important}',
      // glass pills → paper cards
      'html[data-nx-home="cards"] button[aria-label="Settings"],' +
        'html[data-nx-home="cards"] #nx-portfolio-dock button,' +
        'html[data-nx-home="cards"] [aria-label^="Level "],' +
        'html[data-nx-home="cards"] [aria-label*="day streak"]{' +
        'background:' + C.card + ' !important;border-color:' + C.line + ' !important;' +
        'box-shadow:0 8px 24px -12px rgba(13,13,13,.18) !important;opacity:1 !important;' +
        'backdrop-filter:none !important;-webkit-backdrop-filter:none !important}',
      'html[data-nx-home="cards"] button[aria-label="Settings"] svg path,' +
        'html[data-nx-home="cards"] #nx-portfolio-dock button svg path{fill:' + C.tx + ' !important}',
      // the glass lives on an INNER div of these pills, not the labelled
      // wrapper — reach one level in, kill the dark fill and the blur
      'html[data-nx-home="cards"] [aria-label^="Level "] [class*="bg-[rgba(0,0,0"],' +
        'html[data-nx-home="cards"] [aria-label*="day streak"] [class*="bg-[rgba(0,0,0"]{' +
        'background:transparent !important;backdrop-filter:none !important;' +
        '-webkit-backdrop-filter:none !important;border-color:' + C.line + ' !important}',
      /* The popovers were designed against dark glass with a THREE-step text
         hierarchy (white / white-60 / white-45) and translucent-white
         sub-surfaces. A blanket color:ink flattened all of it — inversion,
         not design. Map each tier to its ink equivalent so the hierarchy
         survives the flip; the orange streak accents already read on white
         and stay untouched. */
      'html[data-nx-home="cards"] [aria-label^="Level "] [class*="text-white"],' +
        'html[data-nx-home="cards"] [aria-label*="day streak"] [class*="text-white"]' +
        '{color:' + C.tx + ' !important}',
      'html[data-nx-home="cards"] [aria-label^="Level "] [class*="text-white/7"],' +
        'html[data-nx-home="cards"] [aria-label^="Level "] [class*="text-white/6"],' +
        'html[data-nx-home="cards"] [aria-label*="day streak"] [class*="text-white/7"],' +
        'html[data-nx-home="cards"] [aria-label*="day streak"] [class*="text-white/6"]' +
        '{color:' + C.tx2 + ' !important}',
      'html[data-nx-home="cards"] [aria-label^="Level "] [class*="text-white/5"],' +
        'html[data-nx-home="cards"] [aria-label^="Level "] [class*="text-white/4"],' +
        'html[data-nx-home="cards"] [aria-label^="Level "] [class*="text-white/3"],' +
        'html[data-nx-home="cards"] [aria-label*="day streak"] [class*="text-white/5"],' +
        'html[data-nx-home="cards"] [aria-label*="day streak"] [class*="text-white/4"],' +
        'html[data-nx-home="cards"] [aria-label*="day streak"] [class*="text-white/3"]' +
        '{color:' + C.tx3 + ' !important}',
      // translucent-white sub-surfaces (day cells, milestone chips) vanish on
      // white — wash + hairline instead
      'html[data-nx-home="cards"] [aria-label^="Level "] [class*="bg-white/"],' +
        'html[data-nx-home="cards"] [aria-label*="day streak"] [class*="bg-white/"],' +
        'html[data-nx-home="cards"] [aria-label^="Level "] [class*="bg-[rgba(255,255,255"],' +
        'html[data-nx-home="cards"] [aria-label*="day streak"] [class*="bg-[rgba(255,255,255"]' +
        '{background:' + C.wash + ' !important;border-color:' + C.line + ' !important}',
      /* The panel SURFACE carries its dark glass as an INLINE style
         (glassPanel.ts), which class-mapped rules never reach — so the panel
         was opening as a ghost: transparent surface, faint text. The popover
         hangs off a `top-full` positioning wrapper inside each pill; its first
         child is the surface. Paper, hairline, a real drop. */
      'html[data-nx-home="cards"] [aria-label^="Level "] [class*="top-full"] > div,' +
        'html[data-nx-home="cards"] [aria-label*="day streak"] [class*="top-full"] > div' +
        '{background:' + C.card + ' !important;' +
        'border:1px solid ' + C.line + ' !important;' +
        'box-shadow:0 24px 60px -24px rgba(13,13,13,0.28) !important;' +
        'backdrop-filter:none !important;-webkit-backdrop-filter:none !important}',
      // the caret diamond joins the panel surface
      'html[data-nx-home="cards"] [aria-label^="Level "] [class*="rotate-45"],' +
        'html[data-nx-home="cards"] [aria-label*="day streak"] [class*="rotate-45"]' +
        '{background:' + C.card + ' !important;border:1px solid ' + C.line + ' !important}',
      // the portfolio ring's empty track needs to be visible on paper
      'html[data-nx-home="cards"] #nx-portfolio-dock circle[stroke="rgba(255,255,255,0.16)"]{' +
        'stroke:rgba(13,13,13,.14) !important}',
      // the fake macOS title bar: the dark fill is a CHILD of the transparent
      // z-[90] wrapper — on paper it becomes a whisper of shell, not a slab
      'html[data-nx-home="cards"] div[class*="z-[90]"] > div' +
        '{background:rgba(13,13,13,0.04) !important}',
      'html[data-nx-home="cards"] div[class*="z-[90]"] button' +
        '{background:' + C.card + ' !important;box-shadow:0 0 0 1px ' + C.line + ' !important}',
      'html[data-nx-home="cards"] div[class*="z-[90]"] button *{color:' + C.tx + ' !important}',
      // the map pin-to-card leader line belongs to the city, not the deck
      'html[data-nx-home="cards"] svg[class*="z-[29]"]{display:none !important}',
      // the debug panel keeps its dark treatment — it is not part of the design
    ].join('\n');
    document.head.appendChild(css);
    document.documentElement.dataset.nxHome = 'cards';
  }

  function initCardsHome(nav, rail) {
    lightChrome();
    installCtaCss();

    var city = document.querySelector('img[src*="zero-city"]');
    if (city) city.style.visibility = 'hidden';

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

    /* No header block any more: the journey text and focus title are gone —
       the cards carry the story. Only the wordmark remains, aligned to the
       streak/XP pills' centreline so the top reads as ONE row. Measured at
       runtime: the pills live in the scaled canvas, this layer does not. */
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

    /* ── the deck rides a timeline ────────────────────────────────────────
       Sixteen cards in a row is a shelf. The same sixteen hung off one
       continuous line is a journey: the line is solid green up to where you
       stand and faint past it, so the shape of the whole thing is readable
       before a single word is.

       Both rows live in ONE horizontally-scrolling track and use the SAME gap
       and the SAME per-card widths, which is what keeps a node under the
       centre of its card at any scroll position. (A separately-scrolled rail
       synced by listener drifts by a frame on every flick.) */
    var GAP = 36, PAD_X = 72;

    var scroller = styleEl(document.createElement('div'), {
      flex: '1 1 auto', overflowX: 'auto', overflowY: 'hidden',
      scrollSnapType: 'x mandatory', scrollbarWidth: 'none',
      display: 'flex', alignItems: 'center',
    });
    scroller.className = 'nx-deck';

    var track = styleEl(document.createElement('div'), {
      display: 'flex', flexDirection: 'column', width: 'max-content', margin: '0 auto',
      // The panel, the wordmark and the pills all sit along the top edge, so a
      // track centred by arithmetic reads as jammed against them. This is the
      // optical correction, not a centring bug.
      paddingTop: '72px',
    });
    var cardsRow = styleEl(document.createElement('div'), {
      display: 'flex', alignItems: 'flex-end', gap: GAP + 'px', padding: '16px ' + PAD_X + 'px 0',
    });
    var railRow = styleEl(document.createElement('div'), {
      display: 'flex', alignItems: 'flex-start', gap: GAP + 'px',
      padding: '28px ' + PAD_X + 'px 30px',
    });

    /* NO CHAPTER MARKS. Category looks like the obvious second axis here and
       it is a trap: this journey's sequence INTERLEAVES its five categories
       (1,2 Growth · 3 Ops · 4,5 Growth · 6,7 Ops …), so a "new category starts
       here" rule fires eight times and marks nothing. Built it, saw it, took
       it out. The sequence is the only spine this deck has, and it is enough. */
    var cards = [];
    var cells = [];
    items.forEach(function (item, i) {
      var card = buildCard(item, i);
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

      /* One cell per card, exactly as wide, so the node lands on the card's
         centre line. The connecting line is drawn by the cell itself and
         overhangs by half a gap on each side, which is how the segments meet
         across the gap — a single element spanning the row cannot work inside
         an overflow-x container, its edges resolve against the padding box. */
      var cell = styleEl(document.createElement('div'), {
        position: 'relative', flex: '0 0 auto', width: card.style.width,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '11px',
      });

      var behind = i <= currentIdx; // the line arriving at this card
      var past = i < currentIdx;    // the line leaving it
      [['left', behind], ['right', past]].forEach(function (side, k) {
        if (k === 0 && i === 0) return; // the journey starts at the first stop
        var seg = styleEl(document.createElement('span'), {
          position: 'absolute', top: '7px', height: '3px', borderRadius: '3px',
          background: side[1] ? 'rgba(63,185,104,0.72)' : 'rgba(13,13,13,0.13)',
        });
        if (k === 0) { seg.style.left = -(GAP / 2) + 'px'; seg.style.right = '50%'; }
        else { seg.style.left = '50%'; seg.style.right = -(GAP / 2) + 'px'; }
        cell.appendChild(seg);
      });

      var node = document.createElement('span');
      node.className = 'nx-node nx-node-' + item.status;
      cell.appendChild(node);

      var num = styleEl(document.createElement('span'), {
        font: (item.status === 'current' ? '500 ' : '400 ') + '12px/1 ' + MONO,
        letterSpacing: '0.06em',
        color: item.status === 'current' ? C.tx : item.status === 'completed' ? C.tx2 : C.tx3,
      });
      num.textContent = (item.s.sequence_order < 10 ? '0' : '') + item.s.sequence_order;
      cell.appendChild(num);

      cell.setAttribute('role', 'button');
      cell.setAttribute('tabindex', '0');
      cell.setAttribute('aria-label', item.s.title + ', ' + item.status);
      cell.style.cursor = 'pointer';
      cell.addEventListener('click', function () { scrollToIndex(i); });
      cell.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToIndex(i); }
      });

      railRow.appendChild(cell);
      cells.push(cell);
    });

    /* ── where the road goes ──────────────────────────────────────────────
       Sixteen scenarios and then nothing is a list that stops. The journey has
       a destination — the job portal is the whole point of walking it — so the
       rail runs one stop past the last card and ends there. It has no card
       because it is not a scenario; it is the reason for the other sixteen. */
    var end = styleEl(document.createElement('div'), {
      position: 'relative', flex: '0 0 auto', width: '240px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '11px',
    });
    end.appendChild(styleEl(document.createElement('span'), {
      position: 'absolute', top: '7px', height: '3px', borderRadius: '3px',
      left: -(GAP / 2) + 'px', right: '50%', background: 'rgba(13,13,13,0.13)',
    }));
    var goal = document.createElement('span');
    goal.className = 'nx-node nx-node-goal';
    goal.innerHTML =
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="' + C.tx2 +
      '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>';
    end.appendChild(goal);
    var goalLabel = styleEl(document.createElement('span'), {
      font: '500 13px/1 ' + SANS, letterSpacing: '-0.01em', color: C.tx2, whiteSpace: 'nowrap',
    });
    goalLabel.textContent = 'The job portal opens';
    end.appendChild(goalLabel);
    railRow.appendChild(end);

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
