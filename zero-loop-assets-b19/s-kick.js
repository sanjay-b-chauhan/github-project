/* s-kick: the kickoff (refs 03 to 07) and the understanding check (ref 08).
   kickCard: the project kickoff card, Sanjay presses Join now.
   kickVideo: Jay on video, live captions of the kickoff, no audio.
   kickSlides: the brief, slide by slide, with Meeting Notes filling in and ticking green.
   understand: Jay asks three things by voice, Sanjay answers by voice, the mastery bar fills. */
(function () {
  'use strict';
  var J = window.J, D = J.D, esc = J.esc, IC = J.IC, $ = J.$, $$ = J.$$;

  /* a small loop that respects pause and speed (s.wait), and stops when the viewer jumps */
  async function run(s, ms, fn) { var t = 0; fn(0); while (t < ms) { var st = Math.min(50, ms - t); await s.wait(st); t += st; fn(t / ms); } }
  function bg(p) { p.catch(function (e) { if (e !== J.CANCEL) { console.error(e); window.__err = String(e && e.stack || e); } }); return p; }
  function SC(d) { return D.SC[d.sc || 'router'] || D.SC.router; }
  function MGR(sc) { return D.P[sc.mgr] || D.P.jay; }

  var NOTEPAD = '<svg viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="12.5" height="14.5" rx="2.6" fill="#FFF7DC" stroke="#3A2F12" stroke-width="1.4"/><path d="M4 6.2h12.5" stroke="#3A2F12" stroke-width="1.4"/><path d="M7 9.6h6.2M7 12.6h4.4" stroke="#E9B949" stroke-width="1.4" stroke-linecap="round"/></svg>';
  var OK = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8.2"/><path d="M6.6 10.2 8.9 12.4 13.4 7.8"/></svg>';
  var PLAYF = '<svg viewBox="0 0 12 12"><path d="M3 1.6v8.8L10.2 6z" fill="currentColor"/></svg>';
  var PAUSEF = '<svg viewBox="0 0 12 12"><path d="M2.8 1.8h2.4v8.4H2.8zM6.8 1.8h2.4v8.4H6.8z" fill="currentColor"/></svg>';
  var BRAIN = '<svg viewBox="-1 -1 32 32" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(1 4)"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M6 18a4 4 0 0 1-1.967-.516M19.967 17.484A4 4 0 0 1 18 18"/></g><path d="M25 .2c.45 2.9 1.45 4 4.5 4.8-3.05.8-4.05 1.9-4.5 4.8-.45-2.9-1.45-4-4.5-4.8 3.05-.8 4.05-1.9 4.5-4.8z" fill="currentColor" stroke="#fff" stroke-width="1.6"/></svg>';

  /* ======================= kickCard (ref 03) ======================= */
  J.screen('kickCard', {
    theme: 'dark',
    draw: function (el, d) {
      var sc = SC(d), m = MGR(sc);
      el.innerHTML = '<button class="kk-back" aria-label="Back">' + IC.left + '</button>' +
        '<div class="kk-kc">' +
          '<div class="kk-eb">Project kickoff</div>' +
          '<h1 class="kk-h">' + esc(sc.kickTitle || 'Understand the scope and what comes next.') + '</h1>' +
          '<div class="kk-av"><img alt="" src="' + m.photo + '"></div>' +
          '<b class="kk-nm">' + esc(m.name) + '</b><span class="kk-tl">' + esc(m.title) + '</span>' +
          '<span class="kk-tm">' + IC.clock + '~' + (sc.kickMins || 12) + ' min</span>' +
          '<button class="kk-join">Join now</button>' +
        '</div>';
    },
    play: async function (el, d, s) {
      await s.wait(2600);
      await s.press($('.kk-join', el), 260);
      s.hideCursor();
      $('.kk-kc', el).classList.add('kk-gone');
      await s.wait(500);
    }
  });

  /* ======================= kickVideo (ref 04) ======================= */
  var WORD_MS = 230, LINE_HOLD = 1100;
  J.screen('kickVideo', {
    theme: 'dark',
    dock: false,
    draw: function (el, d) {
      var sc = SC(d), m = MGR(sc), lines = sc.kick || [];
      el.innerHTML = '<div class="kk-vid"><img class="kk-vimg" alt="" src="' + (m.wide || m.photo) + '"></div><div class="kk-vshade"></div>' +
        '<button class="kk-back" aria-label="Back">' + IC.left + '</button>' +
        '<button class="kk-skip">' + IC.next + 'Skip</button>' +
        '<div class="kk-tag">' + J.face(m, 38) + '<div><b>' + esc(m.name) + '</b><span>' + esc(m.title) + '</span></div></div>' +
        '<div class="kk-cap" aria-live="polite"><span></span></div>' +
        '<div class="kk-vc"><span>' + IC.pause + '</span><span class="kk-segs">' + lines.map(function (l) { return '<i style="--g:' + l.split(' ').length + '"><b></b></i>'; }).join('') + '</span><span class="kk-sp">1x</span><span class="kk-cc">CC</span></div>';
    },
    play: async function (el, d, s) {
      var sc = SC(d), lines = sc.kick || [], img = $('.kk-vimg', el), cap = $('.kk-cap span', el), segs = $$('.kk-segs b', el);
      var skip = false; $('.kk-skip', el).addEventListener('click', function () { skip = true; });
      var total = 900, words = lines.map(function (l) { return l.split(' '); });
      words.forEach(function (w) { total += w.length * WORD_MS + LINE_HOLD; });
      // a slow push in on Jay for the whole call
      var push = bg(run(s, total + 200, function (p) { img.style.transform = 'scale(' + (1 + .075 * p).toFixed(4) + ')'; }));
      await s.wait(900);
      for (var i = 0; i < words.length && !skip; i++) {
        var w = words[i];
        for (var k = 1; k <= w.length && !skip; k++) {
          cap.textContent = w.slice(0, k).join(' ');
          segs[i].style.width = (k / w.length * 100) + '%';
          await s.wait(WORD_MS);
        }
        if (skip) break;
        await s.wait(LINE_HOLD);
        if (i < words.length - 1) { cap.textContent = ''; await s.wait(180); }
      }
      if (!skip) await push;
    }
  });

  /* ======================= kickSlides (refs 05, 06, 07) ======================= */
  function notesHTML(sc, opt) {
    opt = opt || {};
    var n = sc.notes || { problem: [], outcome: [] };
    function li(t, done) { return '<li class="kk-li' + (done ? ' kk-done' : '') + '"><i class="kk-bu"></i><span class="kk-ok">' + OK + '</span><span class="kk-t">' + esc(t) + '</span></li>'; }
    var pr = opt.empty ? [] : n.problem, oc = opt.empty ? [] : n.outcome;
    return '<aside class="kk-notes"><div class="kk-nh">' + NOTEPAD + 'Meeting Notes</div><div class="kk-nb">' +
      '<div class="kk-sec" data-k="problem"><h3>Problem</h3><ul class="kk-ul">' + pr.map(function (t) { return li(t, opt.ticked); }).join('') + '</ul></div>' +
      '<div class="kk-sec' + (opt.empty ? ' kk-hid' : '') + '" data-k="outcome"><h3>Outcome</h3><ul class="kk-ul">' + oc.map(function (t) { return li(t, opt.ticked); }).join('') + '</ul></div>' +
      '</div></aside>';
  }
  function slideHTML(x, i) {
    var h = '';
    if (x.kind === 'line') {
      h = '<div class="kk-st">' + esc(x.title) + '</div>' +
        '<div class="kk-chart"><svg viewBox="0 0 690 250" aria-hidden="true">' +
          '<path class="kk-path" d="M0 196 L234 190 L392 136 L690 60" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>' +
          '<circle class="kk-d0" cx="0" cy="196" r="8.5" fill="#fff"/><circle class="kk-d1" cx="690" cy="60" r="8.5" fill="#fff" opacity="0"/>' +
          '<path d="M0 250 H690" stroke="#444" stroke-width="2"/></svg>' +
          '<span class="kk-v kk-l" style="left:1.4%;top:52%">' + esc(x.from) + '</span>' +
          '<span class="kk-v kk-r" style="right:-1%;top:3%">' + esc(x.to) + '</span>' +
          '<div class="kk-xl"><span>' + esc(x.l) + '</span><span>' + esc(x.r) + '</span></div></div>';
    } else if (x.kind === 'big') {
      h = '<div class="kk-pre">' + esc(x.pre) + '</div><div class="kk-num">' + esc(x.num) + '</div>' + (x.post ? '<div class="kk-post">' + esc(x.post) + '</div>' : '');
    } else if (x.kind === 'quote') {
      h = '<div class="kk-q">' + (x.parts || []).map(function (p, k) { return k % 2 ? '<em>' + esc(p) + '</em>' : esc(p); }).join('') + '</div>';
    }
    return '<div class="kk-sl" data-i="' + i + '" data-kind="' + x.kind + '">' + h + '</div>';
  }
  /* how long each slide plays, and which note it writes */
  var SL_MS = [5200, 4000, 4000, 4400];

  /* b16: the real kickoff structure (TrainingShared NotesPanel, ChecklistNoteItem, SegmentPopIn). Each part of the brief
     plays, then pauses on "Are we clear?" (Yes, Watch again). Yes grades what you typed: Analyzing, then a green tick and
     XP for a right note, and Zero adds any point you missed with a star. You type the notes yourself ("Take a note...").
     Skip three in a row and Navid steps in on the third. Write all three and he says so after. */
  var PARTS = [
    { slide: 0, ms: 5200, keys: /3\s*h|3:10|3\.10|three|10\s*m|47|hour|wait|reply/i },
    { slide: 1, ms: 4200, keys: /8\s*%|8 per|eight|percent|meeting/i },
    { slide: 2, ms: 4200, keys: /2\.4|2,4|million|\$|pipeline|quarter/i },
    { slide: 3, ms: 4600, keys: null }
  ];
  var STAR = '<svg viewBox="0 0 19 19" aria-hidden="true"><path fill-rule="evenodd" d="M18.249 8.462 12.46 6.592 10.529.742C10.382.292 9.978.001 9.501 0H9.5c-.477 0-.881.291-1.03.743L6.54 6.592.746 8.463C.289 8.616-.004 9.025 0 9.506c.004.476.3.875.75 1.017l5.843 1.939 1.878 5.792c.148.451.552.741 1.029.741h.001c.477 0 .881-.291 1.029-.743l1.931-5.849 5.785-1.878c.454-.144.75-.543.754-1.019.004-.481-.289-.89-.751-1.044z" fill="currentColor"/></svg>';
  var CHK = '<svg viewBox="0 0 24 24" fill="none" stroke="#49BA61" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z"/><path class="kk-tk" d="m7.75 12 2.83 2.83 5.67-5.66"/></svg>';
  var XPSTAR = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.2l1.9 4.1 4.5.5-3.4 3 1 4.4L8 10.9l-4 2.3 1-4.4-3.4-3 4.5-.5z" fill="#F5B60B"/></svg>';

  function popHTML(m) {
    return '<div class="kk-pop" aria-live="polite">' + J.face(m, 48) +
      '<div class="kk-pv kk-pq"><p>Are we clear?</p><div class="kk-prow"><button class="kk-yes">Yes</button></div><button class="kk-again">Watch again</button></div>' +
      '<div class="kk-pv kk-pa"><span class="kk-shim">Analyzing</span></div>' +
      '<div class="kk-pv kk-pr"><button class="kk-cbtn">Continue</button></div></div>';
  }
  function notesPanel() {
    return '<aside class="kk-notes"><div class="kk-nh">' + NOTEPAD + 'Meeting Notes</div><div class="kk-nb">' +
      '<div class="kk-sec" data-k="problem"><h3>Problem</h3><ul class="kk-ul"></ul><button class="kk-take">Take a note...</button></div>' +
      '<div class="kk-sec kk-hid" data-k="outcome"><h3>Outcome</h3><ul class="kk-ul"></ul><button class="kk-take">Take a note...</button></div>' +
      '</div></aside>';
  }

  J.screen('kickSlides', {
    theme: 'light',
    draw: function (el, d) {
      var sc = SC(d), sl = sc.slides || [], m = MGR(sc);
      el.innerHTML = '<button class="kk-back" aria-label="Back">' + IC.left + '</button>' +
        '<div class="kk-grid">' +
          '<section class="kk-deck">' +
            '<div class="kk-brand">' + J.logo(sc.co, 26) + '<b>' + esc(J.coName(sc.co)) + '</b></div>' +
            sl.map(slideHTML).join('') +
            '<div class="kk-bsegs"><span class="kk-segs">' + PARTS.map(function (x) { return '<i style="--g:' + x.ms + '"><b></b></i>'; }).join('') + '</span></div>' +
            '<div class="kk-bar">' + PLAYF + '<span class="kk-segs">' + PARTS.map(function (x) { return '<i style="--g:' + x.ms + '"><b></b></i>'; }).join('') + '</span><span>1x</span><span>CC</span></div>' +
            popHTML(m) +
          '</section>' +
          notesPanel() +
        '</div>';
      var first = $('.kk-sl', el); if (first) first.classList.add('on');
    },
    play: async function (el, d, s) {
      var sc = SC(d), sl = $$('.kk-sl', el), segs = $$('.kk-bsegs .kk-segs b', el), bsegs = $$('.kk-bar .kk-segs b', el), n = sc.notes || { problem: [], outcome: [] };
      var deck = $('.kk-deck', el), pop = $('.kk-pop', el), nb = $('.kk-nb', el);
      var secP = $('[data-k=problem]', el), secO = $('[data-k=outcome]', el);
      var skipped = 0, mine = 0, live = s.live();
      J.P.notesGood = false;

      /* the slide for a part, with its progress segment */
      function show(i) {
        var k = PARTS[i].slide;
        sl.forEach(function (x, q) { x.classList.toggle('on', q === k); x.classList.toggle('kk-gone', q < k); });
        segs.forEach(function (b, q) { if (q < i) b.style.width = '100%'; });
        bsegs.forEach(function (b, q) { b.style.width = q < i ? '100%' : '0%'; });
        if (k === 0) bg(drawLine());
        return run(s, PARTS[i].ms, function (p) { if (segs[i]) segs[i].style.width = (p * 100) + '%'; });
      }
      async function drawLine() {
        var path = $('.kk-path', sl[0]), d1 = $('.kk-d1', sl[0]), lv = $('.kk-v.kk-l', sl[0]), rv = $('.kk-v.kk-r', sl[0]);
        if (lv) lv.classList.add('on');
        await s.wait(500);
        if (path) await run(s, 1500, function (p) { path.setAttribute('stroke-dashoffset', (1 - (1 - Math.pow(1 - p, 3))).toFixed(3)); });
        if (d1) d1.setAttribute('opacity', '1');
        if (rv) rv.classList.add('on');
      }
      function view(v) { pop.className = 'kk-pop on kk-v-' + v; }
      function hidePop() { pop.className = 'kk-pop'; deck.classList.remove('kk-end'); }

      /* the notes you type: "Take a note..." opens a line; Enter opens the next */
      function sec(i) { return i < 3 ? secP : secO; }
      function addLine(i, text, cls) {
        var ul = $('.kk-ul', sec(i)), li = document.createElement('li');
        li.className = 'kk-li kk-new ' + (cls || ''); li.setAttribute('data-part', i);
        li.innerHTML = '<span class="kk-ic"><i class="kk-bu"></i></span><span class="kk-tw"><textarea class="kk-ta" rows="1" spellcheck="false" aria-label="Note"></textarea></span>';
        ul.appendChild(li);
        var ta = $('.kk-ta', li);
        if (text) ta.value = text;
        function fit() { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }
        ta.addEventListener('input', fit);
        ta.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (ta.value.trim()) { var nx = addLine(+li.getAttribute('data-part')); $('.kk-ta', nx).focus(); } }
          if (e.key === ' ') e.stopPropagation();
        });
        setTimeout(fit, 0);
        return li;
      }
      var cur = 0;
      $$('.kk-take', el).forEach(function (b) {
        b.addEventListener('click', function () {
          var open = $$('.kk-li[data-part="' + cur + '"] .kk-ta', el).filter(function (t) { return !t.value.trim() && !t.disabled; })[0];
          (open || $('.kk-ta', addLine(cur))).focus();
        });
      });
      function notesFor(i) { return $$('.kk-li[data-part="' + i + '"]', el).filter(function (li) { var t = $('.kk-ta', li); return t && t.value.trim(); }); }
      function lockPart(i) {
        $$('.kk-li[data-part="' + i + '"]', el).forEach(function (li) {
          var t = $('.kk-ta', li); if (!t) return;
          if (!t.value.trim()) { li.remove(); return; }
          var p = document.createElement('span'); p.className = 'kk-t'; p.textContent = t.value.trim(); t.parentNode.replaceChild(p, t);
        });
      }

      /* grading: Analyzing, then a tick and XP for a right note, a star for a point Zero adds */
      async function grade(i) {
        view('analyzing');
        var lis = notesFor(i);
        lis.forEach(function (li) { li.classList.add('kk-an'); });
        await s.wait(1300);
        lockPart(i);
        lis = $$('.kk-li[data-part="' + i + '"]', el);
        var P = PARTS[i], hit = false;
        for (var k = 0; k < lis.length; k++) {
          var li = lis[k]; li.classList.remove('kk-an');
          if (!hit && P.keys && P.keys.test(li.textContent)) {
            hit = true; li.classList.add('kk-good');
            $('.kk-ic', li).innerHTML = CHK;
            if (!li.classList.contains('kk-nav')) {
              li.insertAdjacentHTML('beforeend', '<span class="kk-xp">' + XPSTAR + '+100</span>');
              coin($('.kk-xp', li), 100);
            }
            await s.wait(420);
          }
        }
        if (!hit && P.keys && n.problem[i]) {
          /* the point he missed, added for him, with a star */
          var mli = addLine(i, '', 'kk-miss'); mli.classList.remove('kk-new');
          var t = $('.kk-ta', mli), sp = document.createElement('span'); sp.className = 'kk-t'; t.parentNode.replaceChild(sp, t);
          $('.kk-ic', mli).innerHTML = '<span class="kk-mst">' + STAR + '</span>';
          await scramble(sp, n.problem[i]);
          mli.insertAdjacentHTML('beforeend', '<em class="kk-by">Added by Zero</em>');
        }
        await s.wait(500);
        return hit;
      }
      async function scramble(elx, text) {
        var A = 'abcdefghijklmnopqrstuvwxyz0123456789$%', steps = 14;
        for (var q = 1; q <= steps; q++) {
          var keep = Math.floor(text.length * q / steps);
          elx.textContent = text.slice(0, keep) + text.slice(keep).replace(/[^\s]/g, function () { return A[Math.floor(Math.random() * A.length)]; });
          await s.wait(45);
        }
        elx.textContent = text;
      }
      function coin(from, pts) {
        var lv = $('.dk .seg.lv'); if (!lv || !from) { if (window.DK && DK.kept) DK.kept(pts); return; }
        var app = $('#app'), z = parseFloat(app.style.zoom) || 1, ar = app.getBoundingClientRect(), a = from.getBoundingClientRect(), b = lv.getBoundingClientRect();
        var c = document.createElement('div'); c.className = 'nv-coin';
        c.innerHTML = XPSTAR + '+' + pts;
        c.style.cssText = 'left:' + ((a.left - ar.left) / z) + 'px;top:' + ((a.top - ar.top) / z) + 'px';
        app.appendChild(c); void c.offsetWidth;
        c.style.transform = 'translate(' + ((b.left - a.left) / z + 14) + 'px,' + ((b.top - a.top) / z + 8) + 'px) scale(.6)';
        setTimeout(function () { c.remove(); if (window.DK && DK.kept) DK.kept(pts); }, 900);
      }

      /* the third skipped note: Navid comes in, and you write it yourself */
      async function navidThird(i) {
        var li = null;
        await s.navid({ kind: 'side', id: 'notes_hold', click: true, auto: true, steps: [
          { say: 'notes_hold' }, { stake: true },
          { opts: [{ t: 'Why?' }, { t: 'I’ll write it', pri: true }], pick: 0, then: { 0: [{ say: 'notes_why' }, { good: true }, { opts: [{ t: 'I’ll write it', pri: true }], pick: 0 }] } },
          { fn: async function (h, V) {
              li = addLine(i, '', 'kk-nav kk-ask');
              var ta = $('.kk-ta', li);
              if (s.live()) {
                ta.classList.add('zx-type'); ta.focus();
                V.act.innerHTML = '<p class="nv-hint">Write it in your notes, then press Enter</p>';
                await new Promise(function (res) {
                  ta.addEventListener('keydown', function k(e) { if (e.key === 'Enter' && ta.value.trim().length >= 2) { e.preventDefault(); e.stopImmediatePropagation(); ta.removeEventListener('keydown', k, true); res(); } }, true);
                });
                ta.classList.remove('zx-type');
              } else { await s.type(ta, n.problem[i], 50); ta.value = ta.textContent; }
              li.classList.remove('kk-ask'); V.act.innerHTML = '';
            }, est: 6 },
          { say: 'notes3_ok', keep: true }, { kept: true }] });
        /* whatever he wrote, Navid saw it: it counts */
        if (li) { var ta2 = $('.kk-ta', li); if (ta2 && !PARTS[i].keys.test(ta2.value)) ta2.value = ta2.value.trim() + ' (' + n.problem[i] + ')'; }
      }

      /* run-ups and ?auto=1 play the skip path; you play whatever you like */
      for (var i = 0; i < PARTS.length; i++) {
        cur = i;
        if (i === 3) { secO.classList.remove('kk-hid'); secO.classList.add('kk-show'); }
        hidePop();
        await show(i);
        /* the pause: Are we clear? */
        deck.classList.add('kk-end');
        bsegs.forEach(function (b, q) { b.style.width = q <= i ? '100%' : '0%'; });
        view('question');
        while (true) {
          var pick = await s.press($('.kk-yes', pop), 200, $('.kk-pq', pop));
          if (pick === 1) { hidePop(); await show(i); deck.classList.add('kk-end'); view('question'); continue; }   // Watch again
          break;
        }
        if (i < 3) {
          var wrote = notesFor(i).length > 0;
          if (!wrote) skipped++;
          if (!wrote && skipped === 2 && window.NV) NV.pulse('notes_hold');      // he has noticed, and says nothing yet
          if (!wrote && skipped === 3) { view('none'); await navidThird(i); }
          var ok = await grade(i);
          if (ok && wrote) mine++;
        } else {
          view('analyzing'); await s.wait(900); lockPart(i);
        }
        view('results');
        await s.press($('.kk-cbtn', pop), 260);
      }
      hidePop();
      J.P.notesGood = mine >= 2;
      /* all three, in his own words: Navid says so */
      if (mine === 3) await s.navid({ kind: 'side', id: 'notes_good', click: true, steps: [{ say: 'notes_good' }, { opts: [{ t: 'Got it', pri: true }], pick: 0 }] });
    }
  });

  /* ======================= understand (ref 08) ======================= */
  function bars(seed, n) {
    var h = '', x = seed * 9301 + 49297;
    for (var i = 0; i < n; i++) { x = (x * 9301 + 49297) % 233280; var v = 10 + Math.round((x / 233280) * 16); if (i % 6 === 3) v = 9; h += '<i style="height:' + v + 'px"></i>'; }
    return h;
  }
  function secs(n) { return '00:' + ('0' + n).slice(-2); }
  function vn(who, text, dur, seed, opt) {
    opt = opt || {};
    var jay = who === 'jay', m = opt.m;
    return '<div class="kk-vn ' + (jay ? 'kk-jay' : 'kk-me') + (opt.open ? ' kk-open' : '') + '">' +
      (jay ? '<img class="kk-vav" alt="" src="' + m.photo + '">' : '') +
      '<div class="kk-vb"><span class="kk-pl">' + PLAYF + '</span><span class="kk-wv">' + bars(seed, 18) + '</span><span class="kk-du">' + secs(dur) + '</span>' + (opt.rx ? '<span class="kk-rx">' + opt.rx + '</span>' : '') + '</div>' +
      '<button class="kk-tr">Transcript' + IC.chev + '</button><p class="kk-tx">' + esc(text) + '</p></div>';
  }
  var RX = ['👍', '🔥', '👏'];
  function plan(d) {
    var score = d.score == null ? 2 : d.score, good = score >= 4 ? [0, 1, 2] : score >= 2 ? [0] : [];
    var w = [0, 1, 2].map(function (i) { return good.indexOf(i) >= 0 ? 2 : 1; }), sum = w[0] + w[1] + w[2], c = 0;
    return { good: good, fill: w.map(function (x) { c += x; return score / 4 * c / sum * 100; }) };
  }
  function qdur(t) { return Math.max(3, Math.min(9, Math.round(t.length / 11))); }
  function adur(t) { return Math.max(2, Math.min(14, Math.round(t.length / 14))); }

  J.screen('understand', {
    theme: 'light',
    draw: function (el, d) {
      var sc = SC(d);
      el.innerHTML = '<button class="kk-back" aria-label="Back">' + IC.left + '</button>' +
        '<div class="kk-mast" aria-label="Understanding"><span class="kk-mtr"><i></i></span><span class="kk-brain">' + BRAIN + '</span></div>' +
        '<div class="kk-ug">' +
          '<div class="kk-col"><div class="kk-chat"><div class="kk-th"></div></div>' +
            '<div class="kk-micw"><button class="kk-mic" aria-label="Hold to talk">' + IC.mic + '</button><span class="kk-mh">Hold ‘space’ to talk</span></div></div>' +
          notesHTML(sc) +
        '</div>';
    },
    play: async function (el, d, s) {
      var good = !!(J.P.notesGood && d.answersGood);
      var sc = SC(d), m = MGR(sc), qs = sc.pop || [], ans = (good ? d.answersGood : d.answers) || [], pl = plan(good ? { score: d.scoreGood } : d);
      var chat = $('.kk-chat', el), th = $('.kk-th', el), mic = $('.kk-mic', el), mh = $('.kk-mh', el), fill = $('.kk-mtr i', el);
      function add(html) { th.insertAdjacentHTML('beforeend', html); var x = th.lastElementChild; s.scroll(chat); return x; }
      await s.wait(600);
      for (var i = 0; i < qs.length; i++) {
        // Jay's voice note arrives and plays, its transcript opens word by word
        var q = qs[i], qd = qdur(q), jv = add(vn('jay', '', qd, i + 3, { m: m }));
        await s.wait(550);
        var jp = $('.kk-pl', jv), jb = $$('.kk-wv i', jv), jt = $('.kk-tx', jv), jw = q.split(' '), du = $('.kk-du', jv);
        jp.innerHTML = PAUSEF; jp.classList.add('kk-pz'); jv.classList.add('kk-open');
        s.scroll(chat);
        await run(s, Math.max(2000, jw.length * 235), function (p) {
          var on = Math.round(p * jb.length); jb.forEach(function (b, k) { b.classList.toggle('on', k < on); });
          jt.textContent = jw.slice(0, Math.max(1, Math.ceil(p * jw.length))).join(' ');
          du.textContent = secs(Math.round(p * qd));
          chat.scrollTop = chat.scrollHeight;
        });
        jp.innerHTML = PLAYF; jp.classList.remove('kk-pz'); jb.forEach(function (b) { b.classList.remove('on'); });
        s.scroll(chat);
        await s.wait(550);
        // Sanjay holds the mic and answers; his words are transcribed as he talks
        var a = ans[i] || '', ad = adur(a);
        await s.press(mic, 0);
        mic.classList.add('kk-rec'); mh.textContent = 'Release to send';
        var me = add(vn('me', '', 0, i + 11, {}));
        me.classList.add('kk-open');
        var mp = $('.kk-pl', me), mb = $$('.kk-wv i', me), mt = $('.kk-tx', me), md = $('.kk-du', me);
        mp.innerHTML = ''; mp.classList.add('kk-live');
        mb.forEach(function (b) { b.classList.add('kk-hid'); });
        var grow = bg(run(s, Math.max(1200, a.length * 1000 / 50), function (p) {
          var on = Math.round(p * mb.length); mb.forEach(function (b, k) { b.classList.toggle('kk-hid', k >= on); });
          md.textContent = secs(Math.round(p * ad));
          chat.scrollTop = chat.scrollHeight;
        }));
        s.scroll(chat);
        await s.type(mt, a, 46);
        await grow;
        // he lets go: it sends
        mic.classList.remove('kk-rec'); mh.textContent = 'Hold ‘space’ to talk';
        mp.classList.remove('kk-live'); mp.innerHTML = PLAYF; md.textContent = secs(ad);
        s.hideCursor();
        s.scroll(chat);
        await s.wait(500);
        // Jay reacts to a good answer, and the mastery bar fills
        if (pl.good.indexOf(i) >= 0) { $('.kk-vb', me).insertAdjacentHTML('beforeend', '<span class="kk-rx">' + RX[pl.good.indexOf(i) % RX.length] + '</span>'); }
        fill.style.width = pl.fill[i].toFixed(1) + '%';
        await s.wait(1150);
      }
      await s.wait(300);
    }
  });
})();
