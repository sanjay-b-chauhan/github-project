/* Zero b8, builder C: the final meeting, screen by screen.
   room (ref 13), present (ref 14), qa (ref 15), report (ref 16). Classes are mt-*, scoped under .sc-<screen>. */
(function () {
  'use strict';
  var J = window.J, D = J.D, $ = J.$, $$ = J.$$, esc = J.esc, IC = J.IC, ME = D.ME;

  var ic = {
    leave: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8.2 3.6H5.4c-1 0-1.8.8-1.8 1.8v9.2c0 1 .8 1.8 1.8 1.8h2.8M12.6 6.4 16.2 10l-3.6 3.6M16 10H7.8"/></svg>',
    ccoff: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2.6" y="4.6" width="14.8" height="10.8" rx="2.2"/><path d="M8.6 8.6a2 2 0 1 0 0 2.8M13.8 8.6a2 2 0 1 0 0 2.8M2.6 2.8l14.8 14.4"/></svg>',
    layout: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="3" y="3.8" width="14" height="12.4" rx="2"/><path d="M11 3.8v12.4M13.2 7.4h1.8M13.2 10h1.8"/></svg>',
    vol: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 7.6h3l4-3.4v11.6l-4-3.4H3z"/><path d="M13 7a4 4 0 0 1 0 6M15.2 5a7 7 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };

  /* ---------- per case: the numbers Sanjay actually hit (the deck in data.js says 88 seconds, the best case) ---------- */
  var RES = { mid: ['88 seconds', '2 min 40 s'], worst: ['88 seconds', '4 minutes'] };
  function fit(t, key) { var r = RES[key]; return r ? String(t).split(r[0]).join(r[1]) : String(t); }
  function scOf(d) { return D.SC[d.sc] || D.SC.router; }
  function deckOf(s, key) {
    var dk = s.deck || D.SC.router.deck;
    /* the worst case did not open with the number and did not show where the wait comes from (see its report) */
    if (key === 'worst') {
      var st = dk.filter(function (x) { return x.kind === 'steps'; })[0];
      return [
        { kind: 'big', eyebrow: 'Lead routing', title: 'Leads take a while', num: '', sub: 'Inbound leads from the website' },
        { kind: 'steps', eyebrow: st.eyebrow, title: 'I built a router', rows: st.rows.map(function (r) { return [r[0], fit(r[1], key)]; }) },
        { kind: 'big', eyebrow: 'Result', title: 'Reply time now', num: '4 min', sub: 'Median time to first reply, September leads' }
      ];
    }
    return dk.map(function (x) { return JSON.parse(fit(JSON.stringify(x), key)); });
  }

  /* ---------- the slide (Sanjay's deck), used live in present and as the poster in report ---------- */
  function cap1(t) { t = String(t || ''); return t.charAt(0).toUpperCase() + t.slice(1); }
  function hl(t) { return esc(t).replace(/(\$?\d[\d.,]*\s?(?:%|M\b|seconds|minutes|min(?: \d+ s)?|h \d+ m))/, '<em>$1</em>'); }
  function slide(x, i, n, s) {
    var body = '';
    if (x.kind === 'big') {
      /* the same climb Jay showed in the kickoff, when this slide carries that number */
      var ln = (s.slides || []).filter(function (y) { return y.kind === 'line' && y.to === x.num; })[0], cmp = '';
      if (ln) cmp = '<div class="mt-sb-cmp"><div class="mt-sb-cr"><span>' + esc(cap1(ln.l)) + '</span><div class="mt-sb-tr"><i style="--w:25%"></i></div><b>' + esc(ln.from) + '</b></div>' +
        '<div class="mt-sb-cr mt-top1"><span>' + esc(cap1(ln.r)) + '</span><div class="mt-sb-tr"><i style="--w:100%"></i></div><b>' + esc(ln.to) + '</b></div></div>';
      body = '<div class="mt-sb-big' + (cmp ? ' mt-has' : '') + '"><div>' + (x.num ? '<div class="mt-sb-num">' + esc(x.num) + '</div>' : '') + '<div class="mt-sb-cap">' + esc(x.sub || '') + '</div></div>' + cmp + '</div>';
    } else if (x.kind === 'bars') {
      var max = Math.max.apply(null, x.rows.map(function (r) { return r[2]; }));
      body = '<div class="mt-sb-bars"><div class="mt-sb-rows">' + x.rows.map(function (r, k) {
        return '<div class="mt-sb-row' + (k === 0 ? ' mt-top1' : '') + '"><div class="mt-sb-l"><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>' +
          '<div class="mt-sb-tr"><i style="--w:' + (r[2] / max * 100).toFixed(1) + '%"></i></div><div class="mt-sb-v">' + r[2] + '%</div></div>';
      }).join('') + '</div>' +
      (x.callout ? '<div class="mt-sb-call"><b>' + esc(x.callout[0]) + '</b><p>' + esc(x.callout[1]) + '</p></div>' : '') + '</div>';
    } else {
      body = '<div class="mt-sb-steps">' + x.rows.map(function (r, k) {
        return (k ? '<span class="mt-sb-ar">' + IC.arrow + '</span>' : '') + '<div class="mt-sb-st' + (k === x.rows.length - 1 ? ' mt-alt' : '') + '"><span class="mt-sb-n">' + (k + 1) + '</span><b>' + esc(r[0]) + '</b><span>' + hl(r[1]) + '</span></div>';
      }).join('') + '</div>';
    }
    var src = (s.resources && s.resources.project && s.resources.project[1]) || 'Lead export, last 30 days';
    return '<div class="mt-sl" data-k="' + x.kind + '">' +
      '<div class="mt-sl-eye"><i></i>' + esc(x.eyebrow || '') + '</div>' +
      '<h2 class="mt-sl-h">' + hl(x.title) + '</h2>' +
      (x.kind !== 'big' && x.sub ? '<p class="mt-sl-sub">' + esc(x.sub) + '</p>' : '') +
      body +
      '<div class="mt-sl-ft"><span><b>' + esc(s.title) + '</b> · ' + esc(ME.name) + ' · Source: ' + esc(src) + '</span><span>' + (i + 1) + ' / ' + n + '</span></div></div>';
  }

  /* ---------- the call chrome ---------- */
  function clock(sec) { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ':' + ('0' + sec % 60).slice(-2); }
  function bar(o) {
    var l, r;
    if (o.mode === 'room') l = '<span class="mt-bt">' + esc(o.title) + '</span>';
    else l = '<span class="mt-clk">' + IC.clock + '<b class="mt-time">' + clock(o.t || 0) + '</b></span><b class="mt-mode">' + (o.mode === 'qa' ? 'Q&amp;A' : 'Presenting') + '</b><span class="mt-bt mt-dim">' + esc(o.title) + '</span>';
    if (o.mode === 'present') r = '<span class="mt-sc">Slide <b class="mt-sn">1</b> · <b class="mt-sf">1/' + o.of + '</b><i class="mt-ok">' + IC.tick + '</i></span><button class="mt-ib mt-gr" aria-label="Captions off">' + ic.ccoff + '</button>';
    else r = '<button class="mt-ib mt-blue" aria-label="Captions">' + IC.cc + '</button>' + (o.mode === 'qa' ? '<button class="mt-ib mt-gr" aria-label="Layout">' + ic.layout + '</button>' : '') + '<button class="mt-ib mt-red" aria-label="Leave">' + ic.leave + '</button>';
    return '<div class="mt-top"><div class="mt-tl">' + l + '</div><div class="mt-tr">' + r + '</div></div>';
  }
  function tile(k, spk) {
    var p = D.P[k];
    return '<div class="mt-tile' + (spk ? ' mt-spk' : '') + '" data-p="' + k + '"><img class="mt-av" alt="" src="' + p.photo + '">' +
      '<div class="mt-nm"><b>' + esc(p.name) + '</b><i></i><span>' + esc(p.title) + '</span></div></div>';
  }
  function side(k) { var p = D.P[k]; return '<div class="mt-st" data-p="' + k + '"><img class="mt-sav" alt="" src="' + p.photo + '"><span class="mt-chip">' + esc(p.first) + '</span></div>'; }
  function self(on, cls) {
    return '<div class="mt-self ' + (cls || '') + (on ? ' mt-camon' : '') + '"><span class="mt-ini">' + esc(ME.ini) + '</span><img class="mt-me" alt="" src="' + ME.photo + '">' +
      '<span class="mt-chip">' + esc(ME.name) + '</span><span class="mt-camb" aria-hidden="true">' + IC.camoff + '</span></div>';
  }
  function cap(p, cls) {
    return '<div class="mt-cap ' + (cls || '') + '"><img class="mt-cav" alt="" src="' + p.photo + '"><div class="mt-cbody"><div class="mt-cwho">' + esc(p.name) + '</div><p class="mt-cline"></p></div></div>';
  }
  /* live captions: the words arrive at speaking pace */
  async function speak(s, el, text, per) {
    var w = String(text).split(/\s+/); per = per || 300;
    el.textContent = '';
    for (var i = 0; i < w.length; i++) {
      el.textContent = w.slice(0, i + 1).join(' ');
      await s.wait(per + (/[.,:?!]$/.test(w[i]) ? 230 : 0));
    }
  }
  /* a clock that runs while the beat plays (stops quietly when the viewer jumps away) */
  function tick(s, fn, every) {
    var on = true;
    (async function () { while (on) { await s.wait(every || 1000); if (on) fn(); } })().catch(function () {});
    return function () { on = false; };
  }

  /* ================= room (13) ================= */
  var ROOM_LINE = 'Thanks for joining, Sanjay. Open your deck whenever you are ready and take us through it. You have ten minutes.';
  J.screen('room', {
    theme: 'dark', dock: false,
    draw: function (el, d) {
      var s = scOf(d), m = D.P[s.mgr || 'jay'];
      el.innerHTML = bar({ mode: 'room', title: s.deckTitle || s.title }) +
        '<div class="mt-stage">' + tile(s.mgr || 'jay', true) + tile(s.analyst || 'avery') + '</div>' +
        '<div class="mt-low">' + cap(m) +
          '<div class="mt-hint"><span>Please open your final deliverable for your final presentation.</span><b class="mt-h2">Your camera needs to be on to start presenting.</b></div>' +
          '<div class="mt-start"><button class="mt-go">Start Presenting</button><span class="mt-budget">' + IC.clock + '<b>10:00</b></span>' +
            '<span class="mt-ring"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18"/></svg><b>60</b></span></div>' +
        '</div>' + self(false);
    },
    play: async function (el, d, s) {
      var n = 60, ring = $('.mt-ring b', el);
      var stop = tick(s, function () { if (n > 1) ring.textContent = --n; });
      try {
        await s.wait(600);
        $('.mt-cap', el).classList.add('mt-show');
        await speak(s, $('.mt-cline', el), ROOM_LINE);
        await s.wait(1000);
        await s.press($('.mt-camb', el));
        $('.mt-self', el).classList.add('mt-camon');
        var h2 = $('.mt-h2', el); h2.textContent = 'Your camera is on. You can start presenting.';
        await s.wait(1100);
        await s.press($('.mt-go', el));
        $('.mt-start', el).classList.add('mt-going');
        $('.mt-go', el).textContent = 'Opening your deck';
        await s.wait(500);
      } finally { stop(); }
    }
  });

  /* ================= present (14) ================= */
  J.screen('present', {
    theme: 'dark', dock: false,
    draw: function (el, d, c) {
      var s = scOf(d), dk = deckOf(s, c.key);
      el.innerHTML = bar({ mode: 'present', title: s.deckTitle || s.title, t: 0, of: dk.length }) +
        '<div class="mt-pv">' + dk.map(function (x, i) { return '<div class="mt-pvs' + (i === 0 ? ' mt-cur' : '') + '">' + slide(x, i, dk.length, s) + '</div>'; }).join('') + '</div>' +
        '<div class="mt-pcap">' + cap(ME) + '</div>' +
        '<div class="mt-side">' + side(s.mgr || 'jay') + side(s.analyst || 'avery') + self(true, 'mt-me-side') + '</div>' +
        '<div class="mt-ctl"><button class="mt-cb mt-mic" aria-label="Mic">' + IC.mic + '</button><button class="mt-cb mt-cam" aria-label="Camera">' + IC.cam + '</button><button class="mt-done">I’m done presenting</button></div>';
    },
    play: async function (el, d, s, c) {
      var lines = d.lines || [], slides = $$('.mt-pvs', el), t = 0, time = $('.mt-time', el);
      var stop = tick(s, function () { time.textContent = clock(++t); });
      try {
        var line = $('.mt-pcap .mt-cline', el), cp = $('.mt-pcap .mt-cap', el), me = $('.mt-me-side', el);
        await s.wait(1200);
        for (var i = 0; i < Math.max(lines.length, slides.length); i++) {
          var k = Math.min(i, slides.length - 1);
          if (i > 0 && k !== Math.min(i - 1, slides.length - 1)) {
            slides.forEach(function (x, j) { x.classList.toggle('mt-cur', j === k); x.classList.toggle('mt-past', j < k); });
            $('.mt-sn', el).textContent = k + 1; $('.mt-sf', el).textContent = (k + 1) + '/' + slides.length;
            if (k === slides.length - 1) $('.mt-sc', el).classList.add('mt-all');
            await s.wait(1300);
          }
          if (lines[i]) {
            cp.classList.add('mt-show'); me.classList.add('mt-spk');
            await speak(s, line, lines[i], 310);
            me.classList.remove('mt-spk');
            await s.wait(1500);
          }
        }
        await s.press($('.mt-done', el));
        cp.classList.remove('mt-show');
        await s.wait(400);
      } finally { stop(); }
    }
  });

  /* ================= qa (15) ================= */
  J.screen('qa', {
    theme: 'dark', dock: false,
    draw: function (el, d, c) {
      var s = scOf(d), q = s.qa || D.SC.router.qa, who = q.who || s.analyst || 'avery', mgr = s.mgr || 'jay';
      el.innerHTML = bar({ mode: 'qa', title: s.deckTitle || s.title, t: c.key === 'worst' ? 398 : 448 }) +
        '<div class="mt-stage">' + tile(mgr, who === mgr) + tile(who === mgr ? (s.analyst || 'avery') : who, who !== mgr) + '</div>' +
        '<div class="mt-low">' + cap(D.P[who], 'mt-q') + cap(ME, 'mt-a') +
          '<div class="mt-holdw"><button class="mt-hold"><span class="mt-hl">Hold to answer</span><span class="mt-lv"><i></i><i></i><i></i><i></i><i></i></span></button><span class="mt-sp">Or hold the space bar</span></div>' +
        '</div>' + self(true);
    },
    play: async function (el, d, s, c) {
      var s0 = scOf(d), q = s0.qa || D.SC.router.qa, t = c.key === 'worst' ? 398 : 448, time = $('.mt-time', el);
      var stop = tick(s, function () { time.textContent = clock(++t); });
      try {
        var qc = $('.mt-cap.mt-q', el), ac = $('.mt-cap.mt-a', el), btn = $('.mt-hold', el);
        await s.wait(600);
        qc.classList.add('mt-show');
        await speak(s, $('.mt-cline', qc), fit(q.q, c.key), 300);
        await s.wait(1300);
        await s.point(btn);
        btn.classList.add('mt-holding'); $('.mt-hl', btn).textContent = 'Release to send';
        $$('.mt-tile', el).forEach(function (x) { x.classList.remove('mt-spk'); });
        $('.mt-self', el).classList.add('mt-spk');
        qc.classList.remove('mt-show'); ac.classList.add('mt-show');
        await s.wait(400);
        await speak(s, $('.mt-cline', ac), d.answer || '', 300);
        await s.wait(700);
        btn.classList.remove('mt-holding'); $('.mt-hl', btn).textContent = 'Hold to answer';
        $('.mt-self', el).classList.remove('mt-spk');
        s.hideCursor();
        await s.wait(900);
      } finally { stop(); }
    }
  });

  /* ================= report (16) ================= */
  var TAG = { EXCEPTIONAL: 'x5', EXCEEDS: 'x4', MEETS: 'x3', BELOW: 'x2', UNDER: 'x1' };
  var BKEY = { exceptional: 'x5', exceeding: 'x4', meeting: 'x3', below: 'x2', under: 'x1' };
  function tg(w) { return '<span class="mt-tg mt-' + (TAG[w] || 'x3') + '">' + esc(w) + '</span>'; }
  function item(x, good) {
    var tags = '<span class="mt-tg mt-tm">' + IC.clock + esc(x[1]) + '</span><span class="mt-tg">' + esc(x[2]) + '</span>' +
      (good ? tg(x[3]) : '<span class="mt-tg mt-ft">' + '<b class="mt-' + (TAG[x[3]] || 'x3') + '">' + esc(x[3]) + '</b><i>→</i><b class="mt-' + (TAG[x[4]] || 'x3') + '">' + esc(x[4]) + '</b></span>');
    return '<div class="mt-it"><i class="mt-dt ' + (good ? 'mt-g' : 'mt-r') + '"></i><div class="mt-itb"><b>' + esc(x[0]) + '</b><div class="mt-tgs">' + tags + '</div></div><span class="mt-cv">' + IC.chev + '</span></div>';
  }
  function fitPoster(el) {
    var p = $('.mt-poster', el), b = p && $('.mt-psl', p);
    if (!b) return;
    var w = p.getBoundingClientRect().width / (parseFloat(getComputedStyle($('#app')).zoom) || 1);
    if (w > 0) b.style.transform = 'scale(' + (w / 1103) + ')';
  }
  J.screen('report', {
    theme: 'dark',
    draw: function (el, d, c) {
      var s = scOf(d), b = D.band(d.band), dk = deckOf(s, c.key), mgr = D.P[s.mgr || 'jay'], an = D.P[s.analyst || 'avery'];
      el.innerHTML = '<div class="mt-rp">' +
        '<div class="mt-rl">' +
          '<button class="mt-back">' + IC.left + 'Back</button>' +
          '<div class="mt-rh"><span class="mt-lab">Overview</span><span class="mt-band mt-' + (BKEY[b.key] || 'x3') + '">' + esc(b.name) + '</span></div>' +
          '<p class="mt-ov">' + esc(d.overview || '') + '</p>' +
          '<span class="mt-lab mt-an">Analysis</span>' +
          '<div class="mt-poster"><div class="mt-psl">' + slide(dk[1] || dk[0], 1, dk.length, s) + '</div>' +
            '<div class="mt-pshade"></div><div class="mt-pme"><span class="mt-ini">' + esc(ME.ini) + '</span><img alt="" src="' + ME.photo + '"></div>' +
            '<div class="mt-pctl"><span class="mt-pplay">' + IC.play + '</span><span class="mt-ptime">0:00</span><span class="mt-pvol">' + ic.vol + '</span></div>' +
            '<div class="mt-pbar"><i></i></div></div>' +
          '<div class="mt-rbtn"><button class="mt-redo">' + IC.redo + 'Redo presentation</button><button class="mt-keep"><span>I’m happy with this, add it to my portfolio</span>' + IC.arrow + '</button></div>' +
        '</div>' +
        '<div class="mt-rr"><div class="mt-rr-h"><span class="mt-lab">Feedback from ' + esc(mgr.first) + ' &amp; ' + esc(an.first) + '</span><span class="mt-fcs"><img alt="" src="' + mgr.photo + '"><img alt="" src="' + an.photo + '"></span></div>' +
          '<div class="mt-tabs"><b>Moments</b><span>Scores</span></div>' +
          '<div class="mt-rsc">' +
            '<div class="mt-sec"><span class="mt-lab">What they liked</span>' + (d.liked || []).map(function (x) { return item(x, true); }).join('') + '</div>' +
            '<div class="mt-sec"><span class="mt-lab">What you can work on</span>' + (d.work || []).map(function (x) { return item(x, false); }).join('') + '</div>' +
          '</div></div>' +
        '</div>';
      requestAnimationFrame(function () { fitPoster(el); });
    },
    play: async function (el, d, s) {
      fitPoster(el);
      await s.wait(3200);
      var its = $$('.mt-it', el);
      for (var i = 0; i < its.length; i++) {
        await s.point(its[i]);
        its[i].classList.add('mt-hov');
        await s.wait(1700);
        its[i].classList.remove('mt-hov');
      }
      var k = $('.mt-keep', el);
      await s.press(k);
      k.classList.add('mt-kept');
      $('span', k).textContent = 'Added to your portfolio';
      k.lastElementChild.outerHTML = IC.check;
      await s.wait(900);
    }
  });
})();
